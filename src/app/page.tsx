'use client'

import { useState } from 'react'
import { LandingNav } from '@/components/landing/nav'
import { Hero } from '@/components/landing/hero'
import { FeaturesGrid } from '@/components/landing/features-grid'
import { HowItWorks } from '@/components/landing/how-it-works'
import { FeatureSpotlight } from '@/components/landing/feature-spotlight'
import { FAQ } from '@/components/landing/faq'
import { CtaBanner } from '@/components/landing/cta-banner'
import { Footer } from '@/components/landing/footer'
import { InboxMock } from '@/components/landing/mock/inbox-mock'
import { PipelineMock } from '@/components/landing/mock/pipeline-mock'
import { AutomationMock } from '@/components/landing/mock/automation-mock'
import { AnalyticsMock } from '@/components/landing/mock/analytics-mock'
import { Pricing } from '@/components/landing/pricing'
import { RequestAccessModal } from '@/components/landing/request-access-modal'
import { SupportWidget } from '@/components/landing/support-widget'

export default function LandingPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'medium'>('basic')

  const handleRequestPlan = (plan: 'basic' | 'medium') => {
    setSelectedPlan(plan)
    setModalOpen(true)
  }

  return (
    <div className="bg-slate-950 text-slate-100">
      <LandingNav onRequestAccess={() => setModalOpen(true)} />
      <main>
        <Hero />

        <FeaturesGrid />

        <FeatureSpotlight
          anchorId="inbox"
          eyebrow="Caixa de entrada partilhada"
          title="Nunca perca uma conversa do WhatsApp"
          body="Toda a equipa trabalha a partir de uma só caixa de entrada. As conversas podem ser atribuídas, etiquetadas e transferidas sem perder contexto."
          bullets={[
            'Atribua conversas a agentes específicos ou distribua pela equipa',
            'Notas internas visíveis apenas para a sua equipa',
            'Indicadores de não lido para não deixar respostas urgentes escapar',
            'Acesso directo a qualquer conversa a partir do painel',
          ]}
          visual={<InboxMock />}
        />

        <HowItWorks />

        <FeatureSpotlight
          anchorId="automations"
          eyebrow="Automações sem código"
          title="Automatize o repetitivo e foque-se nas pessoas"
          body="Crie fluxos que reagem a eventos do WhatsApp: boas-vindas a novos contactos, seguimento de respostas em falta e encaminhamento por palavra-chave."
          bullets={[
            'Disparadores para mensagens, contactos, etiquetas, palavras-chave e horários',
            'Acções para enviar mensagens, aplicar etiquetas, criar negócios e chamar webhooks',
            'Ramos condicionais e esperas para processos mais naturais',
            'Registos por execução para saber sempre o que aconteceu',
          ]}
          reverse
          visual={<AutomationMock />}
        />

        <FeatureSpotlight
          anchorId="pipelines"
          eyebrow="Funis de venda"
          title="Transforme conversas em receita"
          body="Arraste negócios por etapas personalizadas, ligue-os a contactos e veja onde a receita está bloqueada."
          bullets={[
            'Funis e etapas sem limite',
            'Quadro Kanban com arrastar e largar',
            'Totais de valor por etapa e por funil',
            'Contactos, conversas e notas ligados a cada negócio',
          ]}
          visual={<PipelineMock />}
        />

        <FeatureSpotlight
          anchorId="analytics"
          eyebrow="Análises em tempo real"
          title="Veja o que está realmente a funcionar"
          body="Tempos de resposta, volume diário, valor em funil e actividade do CRM num só painel."
          bullets={[
            'Conversas activas, novos contactos e valor de negócios em aberto',
            'Conversas ao longo de 7, 30 ou 90 dias',
            'Tempo médio de primeira resposta por dia da semana',
            'Actividade combinada de mensagens, negócios, campanhas e automações',
          ]}
          reverse
          visual={<AnalyticsMock />}
        />

        <FAQ />

        <Pricing onRequestPlan={handleRequestPlan} />

        <CtaBanner />
      </main>
      <Footer />

      <RequestAccessModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultPlan={selectedPlan}
      />

      <SupportWidget />
    </div>
  )
}
