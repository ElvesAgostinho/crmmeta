import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { addMonths } from 'date-fns'

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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifySuperadmin()
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id: requestId } = await params
  const body = await request.json()
  const { action } = body

  if (!['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  // Fetch the access request
  const { data: accessRequest, error: fetchError } = await supabaseAdmin
    .from('access_requests')
    .select('*')
    .eq('id', requestId)
    .single()

  if (fetchError || !accessRequest) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  }

  if (action === 'approve') {
    // Try to find existing user by email
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers?.users.find(
      (u) => u.email === accessRequest.email
    )

    let userId: string

    if (existingUser) {
      userId = existingUser.id
    } else {
      // Create a new user account with a temporary password
      const tempPassword = Math.random().toString(36).slice(-10) + 'A1!'
      const { data: newUser, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
          email: accessRequest.email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            full_name: accessRequest.name,
            company: accessRequest.company,
          },
        })

      if (createError || !newUser.user) {
        return NextResponse.json({ error: createError?.message ?? 'Failed to create user' }, { status: 500 })
      }
      userId = newUser.user.id
    }

    // Upsert subscription with active status
    const { error: subError } = await supabaseAdmin
      .from('subscriptions')
      .upsert(
        {
          user_id: userId,
          status: 'active',
          plan: accessRequest.plan ?? 'basic',
          billing_cycle: 'monthly',
          expires_at: addMonths(new Date(), 1).toISOString(),
          modules_enabled: {
            inbox: true,
            contacts: true,
            pipelines: true,
            automations: false,
            broadcasts: false,
            flows: false,
            analytics: false,
            embedded_signup: false,
          },
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )

    if (subError) {
      return NextResponse.json({ error: subError.message }, { status: 500 })
    }
  }

  // Update access_request status
  const newStatus = action === 'approve' ? 'approved' : 'rejected'
  const { data, error } = await supabaseAdmin
    .from('access_requests')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', requestId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ request: data })
}
