import Link from 'next/link'
import { Clock, Mail, MessageCircle } from 'lucide-react'

export default function PendingPage() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-slate-950 px-4"
      style={{
        background:
          'radial-gradient(ellipse 700px 400px at 50% -10%, rgb(124 58 237 / 0.10), transparent 60%), #020617',
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
            {/* Clock icon */}
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-violet-500/10 ring-1 ring-violet-500/25">
              <Clock className="h-10 w-10 text-violet-400" />
              <span
                className="absolute h-20 w-20 rounded-2xl animate-ping opacity-20"
                style={{ background: 'rgb(124 58 237 / 0.3)' }}
                aria-hidden
              />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white">
              Conta em análise
            </h1>

            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              O teu pedido foi recebido e está em análise. Entraremos em contacto
              através do teu email em breve.
            </p>

            {/* Timeline indicator */}
            <div className="mt-6 w-full rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-500/20">
                  <span className="text-xs font-bold text-violet-400">1</span>
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-white">Pedido recebido</p>
                  <p className="text-xs text-slate-500">O teu formulário foi submetido com sucesso</p>
                </div>
                <div className="ml-auto h-2 w-2 rounded-full bg-violet-500 shrink-0" />
              </div>
              <div className="my-2 ml-4 h-6 w-px bg-slate-800" />
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800">
                  <span className="text-xs font-bold text-slate-500">2</span>
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-400">Em análise</p>
                  <p className="text-xs text-slate-600">A nossa equipa está a rever o teu pedido</p>
                </div>
                <div className="ml-auto h-2 w-2 rounded-full border-2 border-slate-700 shrink-0" />
              </div>
              <div className="my-2 ml-4 h-6 w-px bg-slate-800" />
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800">
                  <span className="text-xs font-bold text-slate-500">3</span>
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-400">Acesso concedido</p>
                  <p className="text-xs text-slate-600">Receberás as credenciais por email</p>
                </div>
                <div className="ml-auto h-2 w-2 rounded-full border-2 border-slate-700 shrink-0" />
              </div>
            </div>

            {/* Support info */}
            <div className="mt-6 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-5 py-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
                Dúvidas? Fala connosco
              </p>
              <div className="flex flex-col gap-2">
                <a
                  href="mailto:orgabot57@gmail.com"
                  className="flex items-center gap-2 text-xs text-slate-400 transition hover:text-violet-400"
                >
                  <Mail className="h-3.5 w-3.5" />
                  orgabot57@gmail.com
                </a>
                <a
                  href="https://wa.me/244928053925"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-slate-400 transition hover:text-green-400"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  WhatsApp +244 928 053 925
                </a>
              </div>
            </div>

            {/* Back button */}
            <Link
              href="/"
              className="mt-8 inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 px-6 py-3 text-sm font-medium text-slate-300 transition-all hover:border-slate-600 hover:bg-slate-800 hover:text-white active:scale-[0.98]"
            >
              ← Voltar ao início
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
