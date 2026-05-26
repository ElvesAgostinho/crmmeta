export interface FaqItem {
  q: string
  a: string
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Preciso do meu próprio acesso à API WhatsApp Business?',
    a: 'Sim. Este CRM liga-se à sua configuração existente da Meta para WhatsApp Business. O número, o token e a conta WhatsApp Business continuam sob o seu controlo.',
  },
  {
    q: 'A minha equipa pode usar o mesmo número de WhatsApp?',
    a: 'Sim. Pode atribuir conversas a agentes, acompanhar quem está a responder e transferir conversas sem perder contexto.',
  },
  {
    q: 'Quanto tempo demora a configuração?',
    a: 'Depois de o número WhatsApp Business estar aprovado pela Meta, a maioria das equipas consegue configurar o CRM em menos de 30 minutos.',
  },
  {
    q: 'Quem é dono dos dados?',
    a: 'Os dados são seus. Contactos, conversas, negócios e registos ficam no seu próprio projecto Supabase.',
  },
  {
    q: 'Posso enviar campanhas e respostas automáticas?',
    a: 'Sim. As campanhas usam modelos aprovados pela Meta e as automações podem reagir a novos contactos, palavras-chave, etiquetas e outros eventos.',
  },
  {
    q: 'E os modelos de mensagem?',
    a: 'Os modelos criados na Meta podem ser sincronizados e usados na caixa de entrada, em campanhas ou em passos de automação.',
  },
]
