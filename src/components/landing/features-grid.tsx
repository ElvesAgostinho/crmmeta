import {
  MessageSquare,
  Users,
  GitBranch,
  Radio,
  Zap,
  LineChart,
} from 'lucide-react'
import type { ComponentType } from 'react'
import { Section, SectionHeader } from './section'

interface Feature {
  title: string
  description: string
  icon: ComponentType<{ className?: string }>
  tint: string
}

const FEATURES: Feature[] = [
  {
    title: 'Caixa de entrada partilhada',
    description:
      'Todas as conversas do WhatsApp num só lugar. Atribua conversas, responda em equipa e nunca perca uma oportunidade.',
    icon: MessageSquare,
    tint: 'text-blue-400 bg-blue-500/10',
  },
  {
    title: 'Centro de contactos',
    description:
      'Etiquetas, campos personalizados, notas e deduplicação automática. Importe contactos existentes por CSV.',
    icon: Users,
    tint: 'text-violet-400 bg-violet-500/10',
  },
  {
    title: 'Funis de venda',
    description:
      'Arraste negócios entre etapas. Veja o que foi ganho, o que está em risco e onde a receita está presa.',
    icon: GitBranch,
    tint: 'text-violet-400 bg-violet-500/10',
  },
  {
    title: 'Campanhas em massa',
    description:
      'Envie modelos aprovados pela Meta para listas segmentadas. Acompanhe entregas, leituras e respostas em tempo real.',
    icon: Radio,
    tint: 'text-amber-400 bg-amber-500/10',
  },
  {
    title: 'Automações sem código',
    description:
      'Dê as boas-vindas a novos contactos, acompanhe respostas em falta e encaminhe leads por palavra-chave.',
    icon: Zap,
    tint: 'text-rose-400 bg-rose-500/10',
  },
  {
    title: 'Análises em tempo real',
    description:
      'Tempos de resposta, volume diário e valor em funil. Veja o que está a funcionar sem criar relatórios do zero.',
    icon: LineChart,
    tint: 'text-cyan-400 bg-cyan-500/10',
  },
]

export function FeaturesGrid() {
  return (
    <Section id="features">
      <SectionHeader
        eyebrow="Tudo o que precisa"
        title="Um conjunto de ferramentas para o seu negócio no WhatsApp"
        description="Deixe de juntar caixa de entrada, folhas de cálculo e ferramentas de campanha. Este CRM para WhatsApp une tudo e comunica nativamente com o WhatsApp."
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => {
          const Icon = f.icon
          return (
            <div
              key={f.title}
              className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 transition-colors hover:border-slate-700 hover:bg-slate-900/70"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${f.tint}`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-white">
                {f.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                {f.description}
              </p>
            </div>
          )
        })}
      </div>
    </Section>
  )
}
