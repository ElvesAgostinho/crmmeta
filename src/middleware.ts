import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

const SUPERADMIN_EMAIL = 'elvessacapuri57@gmail.com'

const PROTECTED_PATHS = [
  '/dashboard',
  '/inbox',
  '/contacts',
  '/pipelines',
  '/automations',
  '/broadcasts',
  '/flows',
  '/settings',
]

const AUTH_PATHS = ['/login', '/signup', '/forgot-password']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Helper function to return redirect response with cookies preserved
  const redirect = (toPath: string) => {
    const url = request.nextUrl.clone()
    url.pathname = toPath
    const redirectResponse = NextResponse.redirect(url)
    
    // Copy all cookies from supabaseResponse to the redirectResponse
    supabaseResponse.cookies.getAll().forEach((c) => {
      redirectResponse.cookies.set(c.name, c.value, c)
    })
    
    return redirectResponse
  }

  // ─── Auth redirects ────────────────────────────────────────────────────────
  // If already logged in, bounce away from auth pages
  if (user && AUTH_PATHS.some((p) => pathname === p)) {
    return redirect('/dashboard')
  }

  // Require auth for protected paths
  if (!user && PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
    return redirect('/login')
  }

  // Superadmin routes — handled by their own layout; skip subscription check
  if (pathname.startsWith('/superadmin')) {
    return supabaseResponse
  }

  // ─── Subscription gate ─────────────────────────────────────────────────────
  if (user && PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
    // Superadmin always passes through
    if (user.email === SUPERADMIN_EMAIL) {
      return supabaseResponse
    }

    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .single()

    const status = subscription?.status

    if (status === 'pending' || !status) {
      return redirect('/pending')
    }

    if (status === 'blocked' || status === 'expired') {
      return redirect('/blocked')
    }
  }

  // ─── API protection (non-webhook) ──────────────────────────────────────────
  if (
    !user &&
    pathname.startsWith('/api/whatsapp/') &&
    !pathname.includes('/webhook')
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/inbox/:path*',
    '/contacts/:path*',
    '/pipelines/:path*',
    '/automations/:path*',
    '/broadcasts/:path*',
    '/flows/:path*',
    '/settings/:path*',
    '/superadmin/:path*',
    '/login',
    '/signup',
    '/forgot-password',
    '/pending',
    '/blocked',
  ],
}
