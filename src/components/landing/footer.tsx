import Link from 'next/link'
import { MessageSquare } from 'lucide-react'
export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-8 px-6 py-12 sm:grid-cols-5">
        <div className="space-y-4">
          <Link
            href="/"
            className="flex items-center gap-2"
            aria-label="Página inicial do CRM para WhatsApp"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500">
              <MessageSquare className="h-4 w-4 text-white" />
            </span>
            <span className="text-sm font-semibold text-white">
              CRM para WhatsApp
            </span>
          </Link>
          <p className="max-w-xs text-sm text-slate-400">
            Um conjunto de ferramentas para o seu negócio no WhatsApp: caixa de entrada, funis, campanhas e automações.
          </p>
        </div>

        <FooterColumn
          title="Produto"
          links={[
            { href: '#features', label: 'Funcionalidades' },
            { href: '#how-it-works', label: 'Como funciona' },
            { href: '#faq', label: 'FAQ' },
          ]}
        />

        <FooterColumn
          title="Código aberto"
          links={[
            {
              href: 'https://github.com/ArnasDon/wacrm',
              label: 'Repositório GitHub',
              external: true,
            },
            { href: '#self-host', label: 'Alojamento próprio' },
            { href: '/docs', label: 'Documentação' },
            {
              href: 'https://www.hostinger.com/web-apps-hosting',
              label: 'Publicar na Hostinger',
              external: true,
            },
          ]}
        />

        <FooterColumn
          title="Conta"
          links={[
            { href: '/signup', label: 'Começar' },
            { href: '/login', label: 'Entrar' },
            { href: '/forgot-password', label: 'Esqueci-me da palavra-passe' },
          ]}
        />
      </div>

      <div className="border-t border-slate-900">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-3 px-6 py-5 text-xs text-slate-500 sm:flex-row sm:items-center">
          <span>© {year} CRM para WhatsApp. Todos os direitos reservados.</span>
          <span>Criado sobre a API oficial do WhatsApp Business.</span>
        </div>
        <div className="mx-auto w-full max-w-7xl px-6 pb-5 text-xs leading-relaxed text-slate-600">
          WhatsApp é uma marca registada da Meta Platforms, Inc. A Hostinger não é afiliada, apoiada ou patrocinada pela Meta Platforms, Inc.
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: { href: string; label: string; external?: boolean }[]
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) =>
          l.external ? (
            <li key={l.href}>
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-400 transition-colors hover:text-white"
              >
                {l.label}
              </a>
            </li>
          ) : (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-sm text-slate-400 transition-colors hover:text-white"
              >
                {l.label}
              </Link>
            </li>
          ),
        )}
      </ul>
    </div>
  )
}
