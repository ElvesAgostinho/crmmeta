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

  // ─── Auth redirects ────────────────────────────────────────────────────────
  // If already logged in, bounce away from auth pages
  if (user && AUTH_PATHS.some((p) => pathname === p)) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Require auth for protected paths
  if (!user && PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
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
      const url = request.nextUrl.clone()
      url.pathname = '/pending'
      return NextResponse.redirect(url)
    }

    if (status === 'blocked' || status === 'expired') {
      const url = request.nextUrl.clone()
      url.pathname = '/blocked'
      return NextResponse.redirect(url)
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
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
