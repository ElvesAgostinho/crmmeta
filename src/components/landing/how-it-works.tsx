import { Plug, Users, Zap } from 'lucide-react'
import { Section, SectionHeader } from './section'

const STEPS = [
  {
    num: '01',
    icon: Plug,
    title: 'Ligue o seu número de WhatsApp',
    body:
      'Cole o ID do número de telefone e o token de acesso da Meta. Funciona com qualquer configuração aprovada da API WhatsApp Business.',
  },
  {
    num: '02',
    icon: Users,
    title: 'Importe os seus contactos',
    body:
      'Importe um CSV ou deixe que as mensagens recebidas criem a lista de contactos automaticamente.',
  },
  {
    num: '03',
    icon: Zap,
    title: 'Responda, automatize e meça',
    body:
      'Use a caixa de entrada partilhada com a equipa, configure fluxos para tarefas repetitivas e acompanhe o desempenho.',
  },
]

export function HowItWorks() {
  return (
    <Section id="how-it-works">
      <SectionHeader
        eyebrow="Como funciona"
        title="Online em menos de 30 minutos"
        description="A maioria das equipas fica pronta antes do primeiro café acabar. Sem chamadas obrigatórias de onboarding."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {STEPS.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.num}
              className="relative rounded-xl border border-slate-800 bg-slate-900/40 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className="text-xl font-bold tracking-tight text-slate-800 tabular-nums"
                  aria-hidden
                >
                  {s.num}
                </span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-white">
                {s.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                {s.body}
              </p>
            </div>
          )
        })}
      </div>
    </Section>
  )
}
