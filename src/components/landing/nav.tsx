"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { MessageSquare, Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

/**
 * Landing-page top nav. Client component because we need to flip the
 * primary CTA depending on whether the visitor is already signed in.
 * Defaults to 'signed-out' so the Sign in / Get started buttons are
 * immediately visible — no transparent placeholder flash on load.
 */
type AuthState = 'signed-in' | 'signed-out'

const LINKS = [
  { href: '#features', label: 'Funcionalidades' },
  { href: '#how-it-works', label: 'Como funciona' },
  { href: '#pricing', label: 'Preços' },
  { href: '#faq', label: 'FAQ' },
]

interface LandingNavProps {
  onRequestAccess?: () => void
}

export function LandingNav({ onRequestAccess }: LandingNavProps = {}) {
  // Default to 'signed-out' so Sign in / Get started buttons are always
  // visible immediately. Supabase resolves asynchronously and flips to
  // 'signed-in' if there is an active session — no layout shift.
  const [auth, setAuth] = useState<AuthState>('signed-out')
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    // Quick auth check — no realtime needed, just the initial state.
    const supabase = createClient()
    let cancelled = false
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return
      setAuth(data.session?.user ? 'signed-in' : 'signed-out')
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b transition-colors',
        scrolled
          ? 'border-slate-800 bg-slate-950/80 backdrop-blur'
          : 'border-transparent bg-transparent',
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label="CRM Template for WhatsApp home"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500">
            <MessageSquare className="h-4 w-4 text-white" />
          </span>
          <span className="text-sm font-semibold text-white">
            CRM Template for WhatsApp
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-slate-300 transition-colors hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <NavCtas auth={auth} onRequestAccess={onRequestAccess} />
        </div>

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-slate-800 hover:text-white md:hidden"
          aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-800 bg-slate-950/95 backdrop-blur md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-slate-800 pt-3">
              <NavCtas auth={auth} mobile onRequestAccess={onRequestAccess} />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

function NavCtas({
  auth,
  mobile = false,
  onRequestAccess,
}: {
  auth: AuthState
  mobile?: boolean
  onRequestAccess?: () => void
}) {
  const btnBase =
    'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors'
  const secondary = cn(
    btnBase,
    'text-slate-300 hover:bg-slate-800 hover:text-white',
    mobile && 'justify-center',
  )
  const primary = cn(
    btnBase,
    'bg-violet-500 text-white hover:bg-violet-400',
    mobile && 'justify-center',
  )

  if (auth === 'signed-in') {
    return (
      <Link href="/dashboard" className={primary}>
        Ir para o Dashboard
      </Link>
    )
  }

  const handleComeca = (e: React.MouseEvent) => {
    if (onRequestAccess) {
      e.preventDefault()
      onRequestAccess()
    }
  }

  return (
    <>
      <Link href="/login" className={secondary}>
        Entrar
      </Link>
      <Link href="/signup" className={primary} onClick={handleComeca}>
        Começar
      </Link>
    </>
  )
}
