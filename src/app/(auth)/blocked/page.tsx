'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShieldX, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function BlockedPage() {
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleSignOut = async () => {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4">
      {/* Glow effect */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-96 w-96 rounded-full bg-red-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex max-w-md flex-col items-center gap-6 text-center">
        {/* Icon */}
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 shadow-lg shadow-red-500/10">
          <ShieldX className="h-10 w-10 text-red-400" />
        </div>

        {/* Title */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Conta Bloqueada
          </h1>
          <p className="text-slate-400">
            O acesso à tua conta foi suspenso. Para mais informações,
            contacta o suporte.
          </p>
        </div>

        {/* Contact info */}
        <div className="w-full rounded-xl border border-slate-800 bg-slate-900 p-5 text-left">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-slate-500">
            Contacta o Suporte
          </p>
          <div className="flex flex-col gap-3">
            <a
              href="mailto:orgabot57@gmail.com"
              className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-slate-300 transition-colors hover:border-violet-500/50 hover:text-white"
            >
              <span className="text-violet-400">✉</span>
              orgabot57@gmail.com
            </a>
            <a
              href="https://wa.me/244928053925"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-slate-300 transition-colors hover:border-green-500/50 hover:text-white"
            >
              <span className="text-green-400">📱</span>
              WhatsApp +244 928 053 925
            </a>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex w-full flex-col gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-6 py-3.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition-all hover:bg-violet-500 hover:shadow-violet-500/30 active:scale-95"
          >
            Voltar ao início
          </Link>
          <button
            onClick={handleSignOut}
            disabled={loggingOut}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-950/20 px-6 py-3.5 text-sm font-medium text-red-400 transition-all hover:border-red-500/40 hover:bg-red-950/40 active:scale-95 disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
            {loggingOut ? 'A sair...' : 'Sair da conta'}
          </button>
        </div>
      </div>
    </div>
  )
}
