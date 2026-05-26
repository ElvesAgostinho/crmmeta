import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

const SUPERADMIN_EMAIL = 'elvessacapuri57@gmail.com'

async function verifySuperadmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fast-path: check email
  if (user.email === SUPERADMIN_EMAIL) return user

  // Secondary check via user_roles table
  const { data: role } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (role?.role === 'superadmin') return user
  return null
}

export async function GET() {
  const admin = await verifySuperadmin()
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Fetch all users from auth.users via admin
  const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 })
  }

  // Fetch all subscriptions
  const { data: subscriptions } = await supabaseAdmin
    .from('subscriptions')
    .select('*')

  // Fetch all roles
  const { data: roles } = await supabaseAdmin
    .from('user_roles')
    .select('*')

  const users = authUsers.users.map((u) => ({
    id: u.id,
    email: u.email,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
    subscription: subscriptions?.find((s) => s.user_id === u.id) ?? null,
    role: roles?.find((r) => r.user_id === u.id)?.role ?? 'user',
  }))

  return NextResponse.json({ users })
}
