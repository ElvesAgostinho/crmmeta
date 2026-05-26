import Link from 'next/link'
import { ArrowRight, BookOpen, Server } from 'lucide-react'
import { Section, SectionHeader } from './section'
import { GithubIcon } from './github-icon'

const REPO_URL = 'https://github.com/ArnasDon/wacrm'
const HOSTINGER_URL = 'https://www.hostinger.com/web-apps-hosting'

export function OpenSource() {
  return (
    <Section id="self-host">
      <SectionHeader
        eyebrow="Código aberto"
        title="Faça fork, personalize e publique"
        description="Este CRM para WhatsApp é um template que pode adaptar à sua marca. Use o código no GitHub e publique-o na infraestrutura que preferir."
      />

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2">
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col rounded-xl border border-slate-800 bg-slate-900/40 p-6 transition-colors hover:border-slate-700 hover:bg-slate-900/70"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-slate-100">
            <GithubIcon className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-white">
            Código no GitHub
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
            Clone ou faça fork do repositório, ajuste o código e publique a sua própria versão do CRM.
          </p>
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-violet-400 transition-colors group-hover:text-violet-300">
            ArnasDon/wacrm
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </a>

        <a
          href={HOSTINGER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col rounded-xl border border-violet-500/20 bg-slate-900/40 p-6 transition-colors hover:border-violet-500/40 hover:bg-slate-900/70"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
            <Server className="h-5 w-5" />
          </div>
          <h3 className="mt-4 flex flex-wrap items-center gap-2 text-base font-semibold text-white">
            Publicar na Hostinger
            <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-400">
              Recomendado
            </span>
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
            Ligue o seu repositório ao alojamento Node.js e coloque o CRM online em poucos minutos.
          </p>
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-violet-400 transition-colors group-hover:text-violet-300">
            Alojamento Node.js
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </a>
      </div>

      <div className="mx-auto mt-6 flex max-w-5xl items-center justify-center">
        <Link
          href="/docs"
          className="group inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/40 px-5 py-3 text-sm font-medium text-slate-200 transition-colors hover:border-slate-700 hover:bg-slate-900/70 hover:text-white"
        >
          <BookOpen className="h-4 w-4 text-violet-400" />
          Ler a documentação completa
          <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-200" />
        </Link>
      </div>
    </Section>
  )
}
