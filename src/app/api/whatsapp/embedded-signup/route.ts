import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encrypt } from '@/lib/whatsapp/encryption'
import { verifyPhoneNumber } from '@/lib/whatsapp/meta-api'

const META_API_VERSION = 'v21.0'
const META_API_BASE = `https://graph.facebook.com/${META_API_VERSION}`

/**
 * POST /api/whatsapp/embedded-signup
 *
 * Receives the OAuth `code` from the Meta Embedded Signup flow,
 * exchanges it for an access token, discovers the WABA + phone number,
 * and upserts the user's whatsapp_config row — exactly the same schema
 * the manual config form writes to.
 *
 * Flow:
 *   1. Browser completes FB.login() → gets a short-lived `code`
 *   2. POST here with { code }
 *   3. We exchange code → access_token (server-side, keeps App Secret safe)
 *   4. We fetch WABA list + phone numbers using that token
 *   5. Encrypt token and upsert whatsapp_config
 *   6. Return phone info so the UI can show the verified name
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { code } = body as { code?: string }

    if (!code) {
      return NextResponse.json({ error: 'Código OAuth em falta' }, { status: 400 })
    }

    const appId = process.env.NEXT_PUBLIC_META_APP_ID
    const appSecret = process.env.META_APP_SECRET

    if (!appId || !appSecret) {
      console.error('[embedded-signup] META env vars not set')
      return NextResponse.json(
        { error: 'App não configurada — faltam variáveis de ambiente META_APP_ID / META_APP_SECRET' },
        { status: 500 }
      )
    }

    // ── Step 1: Exchange code → short-lived access token ───────────────────
    // The redirect_uri MUST exactly match what's configured in Meta App Dashboard.
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')
    const redirectUri = siteUrl ? `${siteUrl}/api/whatsapp/embedded-signup` : ''
    const tokenUrl = new URL(`${META_API_BASE}/oauth/access_token`)
    tokenUrl.searchParams.set('client_id', appId)
    tokenUrl.searchParams.set('client_secret', appSecret)
    tokenUrl.searchParams.set('code', code)
    if (redirectUri) tokenUrl.searchParams.set('redirect_uri', redirectUri)

    const tokenRes = await fetch(tokenUrl.toString())
    const tokenData = await tokenRes.json() as {
      access_token?: string
      error?: { message?: string; code?: number }
    }

    if (!tokenRes.ok || !tokenData.access_token) {
      const msg = tokenData.error?.message || 'Falha na troca do código OAuth'
      console.error('[embedded-signup] token exchange failed:', msg)
      return NextResponse.json({ error: `Meta OAuth: ${msg}` }, { status: 400 })
    }

    let accessToken = tokenData.access_token

    // ── Step 1.5: Exchange for long-lived access token ─────────────────────
    // The token from the initial OAuth flow is short-lived (expires in ~1hr).
    // We must exchange it for a long-lived token to prevent the config from disconnecting.
    try {
      const exchangeUrl = new URL(`${META_API_BASE}/oauth/access_token`)
      exchangeUrl.searchParams.set('grant_type', 'fb_exchange_token')
      exchangeUrl.searchParams.set('client_id', appId)
      exchangeUrl.searchParams.set('client_secret', appSecret)
      exchangeUrl.searchParams.set('fb_exchange_token', accessToken as string)

      const exchangeRes = await fetch(exchangeUrl.toString())
      const exchangeData = await exchangeRes.json() as {
        access_token?: string
        error?: { message?: string }
      }

      if (exchangeRes.ok && exchangeData.access_token) {
        accessToken = exchangeData.access_token
      } else {
        console.warn('[embedded-signup] long-lived token exchange failed:', exchangeData.error?.message)
      }
    } catch (err) {
      console.warn('[embedded-signup] long-lived token exchange request failed:', err)
    }

    // ── Step 2: Discover WABA ───────────────────────────────────────────────
    const wabaRes = await fetch(
      `${META_API_BASE}/me/whatsapp_business_accounts?access_token=${accessToken}`
    )
    const wabaData = await wabaRes.json() as {
      data?: Array<{ id: string; name?: string }>
      error?: { message?: string }
    }

    if (!wabaRes.ok || !wabaData.data?.length) {
      const msg = wabaData.error?.message || 'Nenhuma conta WhatsApp Business encontrada'
      console.error('[embedded-signup] WABA fetch failed:', msg)
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    const waba = wabaData.data[0]
    const wabaId = waba.id

    // ── Step 3: Discover phone number ──────────────────────────────────────
    const phonesRes = await fetch(
      `${META_API_BASE}/${wabaId}/phone_numbers?access_token=${accessToken}`
    )
    const phonesData = await phonesRes.json() as {
      data?: Array<{ id: string; display_phone_number?: string; verified_name?: string }>
      error?: { message?: string }
    }

    if (!phonesRes.ok || !phonesData.data?.length) {
      const msg = phonesData.error?.message || 'Nenhum número de telefone encontrado nesta conta'
      console.error('[embedded-signup] phone numbers fetch failed:', msg)
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    const phoneNumberId = phonesData.data[0].id

    // ── Step 4: Verify the phone with Meta (gets display name + quality) ───
    let phoneInfo = null
    try {
      phoneInfo = await verifyPhoneNumber({ phoneNumberId, accessToken })
    } catch (err) {
      // Non-fatal — the number is real, we just couldn't fetch the metadata.
      console.warn('[embedded-signup] verifyPhoneNumber failed (non-fatal):', err)
    }

    // ── Step 5: Check if config already exists for this user ──────────────
    const { data: existing } = await supabase
      .from('whatsapp_config')
      .select('id, verify_token')
      .eq('user_id', user.id)
      .maybeSingle()

    // ── Step 6: Encrypt secrets and upsert whatsapp_config ────────────────
    const encryptedToken = encrypt(accessToken)
    
    // Only generate a new verify token if the user doesn't already have one
    let finalEncryptedVerifyToken = existing?.verify_token
    if (!finalEncryptedVerifyToken) {
      const rawVerifyToken = crypto.randomUUID()
      finalEncryptedVerifyToken = encrypt(rawVerifyToken)
    }

    const now = new Date().toISOString()

    if (existing) {
      const { error: updateErr } = await supabase
        .from('whatsapp_config')
        .update({
          phone_number_id: phoneNumberId,
          waba_id: wabaId,
          access_token: encryptedToken,
          verify_token: finalEncryptedVerifyToken,
          status: 'connected',
          connected_at: now,
          updated_at: now,
        })
        .eq('user_id', user.id)

      if (updateErr) {
        console.error('[embedded-signup] update failed:', updateErr)
        return NextResponse.json({ error: 'Falha ao guardar a configuração' }, { status: 500 })
      }
    } else {
      const { error: insertErr } = await supabase
        .from('whatsapp_config')
        .insert({
          user_id: user.id,
          phone_number_id: phoneNumberId,
          waba_id: wabaId,
          access_token: encryptedToken,
          verify_token: finalEncryptedVerifyToken,
          status: 'connected',
          connected_at: now,
        })

      if (insertErr) {
        console.error('[embedded-signup] insert failed:', insertErr)
        return NextResponse.json({ error: 'Falha ao guardar a configuração' }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      phone_info: phoneInfo,
      phone_number_id: phoneNumberId,
      waba_id: wabaId,
      waba_name: waba.name,
    })
  } catch (error) {
    console.error('[embedded-signup] unexpected error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
