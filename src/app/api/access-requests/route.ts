import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, company, plan, message } = body

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Nome completo é obrigatório (mínimo 2 caracteres).' },
        { status: 400 },
      )
    }

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email é obrigatório.' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Email inválido.' }, { status: 400 })
    }

    if (!plan || !['basic', 'medium'].includes(plan)) {
      return NextResponse.json(
        { error: 'Plano inválido. Deve ser "basic" ou "medium".' },
        { status: 400 },
      )
    }

    const { error: dbError } = await supabase.from('access_requests').insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      company: company?.trim() || null,
      plan,
      message: message?.trim() || null,
      status: 'pending',
      created_at: new Date().toISOString(),
    })

    if (dbError) {
      console.error('[access-requests] Supabase error:', dbError)
      return NextResponse.json(
        { error: 'Erro ao guardar pedido. Tenta novamente mais tarde.' },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('[access-requests] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 },
    )
  }
}
