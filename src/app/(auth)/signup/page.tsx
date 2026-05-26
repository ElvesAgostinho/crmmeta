'use client'

import Link from 'next/link'
import { Lock, ArrowRight, LogIn } from 'lucide-react'

export default function SignupPage() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-slate-950 px-4"
      style={{
        background:
          'radial-gradient(ellipse 700px 400px at 50% -10%, rgb(124 58 237 / 0.09), transparent 60%), #020617',
      }}
    >
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl backdrop-blur-sm">
          {/* Top accent */}
          <div
            className="h-1 w-full"
            style={{ background: 'linear-gradient(90deg, #7c3aed, #6d28d9)' }}
          />

          <div className="flex flex-col items-center px-8 pb-10 pt-10 text-center">
            {/* Lock icon */}
            <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-violet-500/10 ring-1 ring-violet-500/25">
              <Lock className="h-9 w-9 text-violet-400" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white">
              Acesso por convite
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-slate-400 max-w-xs">
              Esta plataforma é exclusiva para clientes com contrato ativo. Para solicitar acesso, preenche o formulário na nossa página principal.
            </p>

            {/* Divider */}
            <div className="my-8 h-px w-full bg-gradient-to-r from-transparent via-slate-800 to-transparent" />

            {/* Buttons */}
            <div className="flex w-full flex-col gap-3">
              <Link
                href="/#pricing"
                className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-violet-500 hover:shadow-lg hover:shadow-violet-500/25 active:scale-[0.98]"
              >
                Ver Planos
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/login"
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 px-6 py-3.5 text-sm font-medium text-slate-300 transition-all hover:border-slate-600 hover:bg-slate-800 hover:text-white active:scale-[0.98]"
              >
                <LogIn className="h-4 w-4" />
                Já tenho conta
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
