import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { addDays, addMonths, addYears } from 'date-fns'

const SUPERADMIN_EMAIL = 'elvessacapuri57@gmail.com'

async function verifySuperadmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  if (user.email === SUPERADMIN_EMAIL) return user
  const { data: role } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()
  if (role?.role === 'superadmin') return user
  return null
}

function calculateExpiresAt(billing_cycle: string): string {
  const now = new Date()
  switch (billing_cycle) {
    case 'daily':
      return addDays(now, 1).toISOString()
    case 'monthly':
      return addMonths(now, 1).toISOString()
    case 'annual':
      return addYears(now, 1).toISOString()
    default:
      return addMonths(now, 1).toISOString()
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifySuperadmin()
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id: userId } = await params
  const body = await request.json()
  const { action, plan, billing_cycle, modules, notes, days } = body

  // Fetch existing subscription
  const { data: existing } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()

  let update: Record<string, unknown> = { updated_at: new Date().toISOString() }

  switch (action) {
    case 'approve': {
      update.status = 'active'
      update.billing_cycle = billing_cycle ?? existing?.billing_cycle ?? 'monthly'
      update.plan = plan ?? existing?.plan ?? 'basic'
      update.expires_at = calculateExpiresAt(update.billing_cycle as string)
      if (modules) update.modules_enabled = modules
      if (notes) update.notes = notes
      break
    }
    case 'reject': {
      update.status = 'blocked'
      if (notes) update.notes = notes
      break
    }
    case 'block': {
      update.status = 'blocked'
      if (notes) update.notes = notes
      break
    }
    case 'unblock': {
      update.status = 'active'
      if (notes) update.notes = notes
      break
    }
    case 'extend': {
      const currentExpiry = existing?.expires_at
        ? new Date(existing.expires_at)
        : new Date()
      const cycle = billing_cycle ?? existing?.billing_cycle ?? 'monthly'
      const count = days ?? 1
      let newExpiry: Date
      if (cycle === 'daily') {
        newExpiry = addDays(currentExpiry, count)
      } else if (cycle === 'monthly') {
        newExpiry = addMonths(currentExpiry, count)
      } else if (cycle === 'annual') {
        newExpiry = addYears(currentExpiry, count)
      } else {
        newExpiry = addDays(currentExpiry, count)
      }
      update.expires_at = newExpiry.toISOString()
      update.billing_cycle = cycle
      break
    }
    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  if (modules && action !== 'approve') {
    update.modules_enabled = modules
  }

  let data, error
  if (existing) {
    ;({ data, error } = await supabaseAdmin
      .from('subscriptions')
      .update(update)
      .eq('user_id', userId)
      .select()
      .single())
  } else {
    ;({ data, error } = await supabaseAdmin
      .from('subscriptions')
      .insert({ user_id: userId, ...update })
      .select()
      .single())
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ subscription: data })
}
