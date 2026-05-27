import Link from 'next/link'
import { ShieldCheck, ArrowRight } from 'lucide-react'
import { InboxMock } from './mock/inbox-mock'

/**
 * Above-the-fold hero. Two-column on desktop (copy + product visual),
 * stacks on mobile. The product miniature doubles as proof of what
 * the app actually looks like — better than a generic illustration.
 */
export function Hero() {
  return (
    <div className="relative overflow-hidden">
      {/* Soft radial glow behind the hero. Pure CSS so it doesn't
          count against any image budget. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            'radial-gradient(800px circle at 70% -10%, rgb(139 92 246 / 0.18), transparent 60%), radial-gradient(600px circle at 10% 30%, rgb(59 130 246 / 0.08), transparent 60%)',
        }}
      />

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 py-20 sm:py-28 lg:grid-cols-2 lg:gap-16">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-violet-400" />
            Criado sobre a API oficial do WhatsApp Business
          </div>

          <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Gerir o seu negócio no WhatsApp a partir de{' '}
            <span className="text-violet-400">uma só caixa de entrada.</span>
          </h1>

          <p className="mt-5 max-w-xl text-base text-slate-400 sm:text-lg">
            Caixa de entrada partilhada, contactos, funis de venda, campanhas
            e automações sem código num só lugar. Mantenha a equipa alinhada
            sem alternar entre ferramentas.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/#pricing"
              className="inline-flex items-center gap-2 rounded-lg bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-400"
            >
              Solicitar Acesso
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-200 transition-colors hover:border-slate-600 hover:text-white"
            >
              Entrar
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
              Ativação em 24h
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
              Online em 30 minutos
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
              Os seus dados, o seu Supabase
            </span>
          </div>
        </div>

        <div className="lg:justify-self-end w-full max-w-lg border-beam-container border-beam-mixed rounded-2xl shadow-2xl p-[1.5px]">
          <div className="border-beam-inner bg-slate-950 rounded-2xl overflow-hidden">
            <InboxMock />
          </div>
        </div>
      </div>
    </div>
  )
}
