export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://wacrm.tech'

export const SITE_NAME = 'CRM para WhatsApp'

export const SITE_TAGLINE = 'Gerir o WhatsApp a partir de uma só caixa de entrada'

export const SITE_DESCRIPTION =
  'CRM para WhatsApp criado para pequenas equipas: caixa de entrada partilhada, contactos, funis de venda, campanhas e automações sem código.'

export const SITE_KEYWORDS = [
  'WhatsApp CRM',
  'CRM WhatsApp Business',
  'caixa de entrada WhatsApp',
  'API WhatsApp Business',
  'automação WhatsApp',
  'campanhas WhatsApp',
  'plataforma de mensagens para clientes',
  'CRM com funil de vendas',
  'caixa de entrada de equipa',
]

export const OG_IMAGE_PATH = '/opengraph-image'
export const OG_IMAGE_ALT = `${SITE_NAME} — ${SITE_TAGLINE}`

export const ORG_INFO = {
  name: SITE_NAME,
  legalName: 'CRM para WhatsApp',
  url: SITE_URL,
  logo: `${SITE_URL}/icon`,
}

export function absoluteUrl(path = '/'): string {
  const trimmed = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${trimmed}`
}
