import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { ReactNode } from 'react'

const SUPERADMIN_EMAIL = 'elvessacapuri57@gmail.com'

export default async function SuperadminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Allow by email fast-path
  if (user.email === SUPERADMIN_EMAIL) {
    return <>{children}</>
  }

  // Secondary check via user_roles table
  const { data: role } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (role?.role !== 'superadmin') {
    redirect('/dashboard')
  }

  return <>{children}</>
}
