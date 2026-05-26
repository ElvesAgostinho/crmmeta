'use client'

import { Check, Zap, Star } from 'lucide-react'

interface PricingProps {
  onRequestPlan: (plan: 'basic' | 'medium') => void
}

const basicFeatures = [
  'Configuração completa API oficial WhatsApp',
  'Ligação WhatsApp Business',
  'CRM completo',
  '1 número de WhatsApp',
  'Suporte básico por email',
]

const mediumFeatures = [
  'Tudo do Plano Básico',
  'Chatbot com IA',
  'Automações avançadas',
  'Vários atendentes',
  'Funil de vendas',
  'Integração n8n',
  'Suporte prioritário',
]

export function Pricing({ onRequestPlan }: PricingProps) {
  return (
    <section
      id="pricing"
      className="relative overflow-hidden py-24 sm:py-32"
      style={{
        background:
          'radial-gradient(ellipse 900px 500px at 50% 0%, rgb(109 40 217 / 0.12), transparent 65%), #020617',
      }}
    >
      {/* Decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-1/4 h-72 w-72 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-1/4 h-72 w-72 rounded-full opacity-15 blur-3xl"
        style={{ background: 'radial-gradient(circle, #059669, transparent)' }}
      />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-16 text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-violet-400">
            <Zap className="h-3.5 w-3.5" />
            Planos e Preços
          </span>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Invista no crescimento
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">
              do seu negócio
            </span>
          </h2>
          <p className="mt-5 mx-auto max-w-xl text-base leading-relaxed text-slate-400">
            Escolha o plano que melhor se adapta ao tamanho e ritmo da sua equipa. Sem surpresas — preços transparentes desde o início.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">

          {/* Plano Básico */}
          <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/50 hover:shadow-violet-500/10">
            {/* Glow on hover */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  'radial-gradient(400px circle at 50% -10%, rgb(124 58 237 / 0.08), transparent 70%)',
              }}
            />

            {/* Badge */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/15 px-3 py-1 text-xs font-semibold text-violet-400 ring-1 ring-violet-500/25">
                  <Star className="h-3 w-3 fill-violet-400" />
                  Mais Popular
                </span>
              </div>
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #7c3aed22, #4c1d9522)' }}
              >
                <Zap className="h-5 w-5 text-violet-400" />
              </div>
            </div>

            {/* Plan name & description */}
            <h3 className="text-2xl font-bold text-white">Plano Básico</h3>
            <p className="mt-2 text-sm text-slate-400">
              Para pequenos negócios que querem começar
            </p>

            {/* Price */}
            <div className="mt-6 space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-slate-500">Setup único</span>
                <span className="text-xl font-bold text-white">15.000 – 35.000 Kz</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-slate-500">Mensalidade</span>
                <span className="text-xl font-bold text-violet-300">10.000 – 25.000 Kz</span>
              </div>
            </div>

            {/* Divider */}
            <div className="my-6 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

            {/* Features */}
            <ul className="flex flex-col gap-3 flex-1">
              {basicFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/20">
                    <Check className="h-3 w-3 text-violet-400" />
                  </span>
                  <span className="text-sm text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <button
              type="button"
              onClick={() => onRequestPlan('basic')}
              className="mt-8 w-full rounded-xl bg-violet-600 px-6 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-violet-500 hover:shadow-lg hover:shadow-violet-500/25 active:scale-[0.98]"
            >
              Solicitar Plano Básico
            </button>
          </div>

          {/* Plano Médio */}
          <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-emerald-500/10">
            {/* Glow on hover */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  'radial-gradient(400px circle at 50% -10%, rgb(16 185 129 / 0.08), transparent 70%)',
              }}
            />

            {/* Badge */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/25">
                  <Star className="h-3 w-3 fill-emerald-400" />
                  Mais Completo
                </span>
              </div>
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #05966922, #06523022)' }}
              >
                <Zap className="h-5 w-5 text-emerald-400" />
              </div>
            </div>

            {/* Plan name & description */}
            <h3 className="text-2xl font-bold text-white">Plano Médio</h3>
            <p className="mt-2 text-sm text-slate-400">
              Para equipas que precisam de automatizar e escalar
            </p>

            {/* Price */}
            <div className="mt-6 space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-slate-500">Setup único</span>
                <span className="text-xl font-bold text-white">40.000 – 100.000 Kz</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-slate-500">Mensalidade</span>
                <span className="text-xl font-bold text-emerald-300">35.000 – 80.000 Kz</span>
              </div>
            </div>

            {/* Divider */}
            <div className="my-6 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

            {/* Features */}
            <ul className="flex flex-col gap-3 flex-1">
              {mediumFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                    <Check className="h-3 w-3 text-emerald-400" />
                  </span>
                  <span className="text-sm text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <button
              type="button"
              onClick={() => onRequestPlan('medium')}
              className="mt-8 w-full rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/25 active:scale-[0.98]"
            >
              Solicitar Plano Médio
            </button>
          </div>
        </div>

        {/* Setup Options Explanation */}
        <div className="mt-16 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 max-w-3xl mx-auto">
          <h4 className="text-sm font-semibold text-white mb-3 text-center lg:text-left">ℹ️ Opções de Configuração da API Oficial da Meta</h4>
          <div className="grid gap-6 md:grid-cols-2 text-xs leading-relaxed text-slate-400">
            <div className="space-y-1">
              <p className="font-medium text-slate-200">🛠️ Configuração Autónoma (Pelo Cliente)</p>
              <p>O cliente assume a responsabilidade de obter e configurar a API Oficial da Meta. O custo do setup é de <strong>0 Kz</strong> (grátis), pagando apenas o valor da mensalidade do plano escolhido.</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-slate-200">🚀 Configuração Assistida (Por Nós)</p>
              <p>A nossa equipa realiza toda a configuração e integração da API Oficial da Meta por si. O setup único é de <strong>15.000 a 35.000 Kz</strong> (Plano Básico) ou <strong>40.000 a 100.000 Kz</strong> (Plano Médio).</p>
            </div>
          </div>
        </div>

        {/* Fine print */}
        <p className="mt-8 text-center text-xs text-slate-500 leading-relaxed max-w-2xl mx-auto">
          *Os preços de setup são cobrados uma única vez. Não existe período de teste — o acesso é concedido após a configuração e assinatura do contrato.
        </p>
      </div>
    </section>
  )
}
