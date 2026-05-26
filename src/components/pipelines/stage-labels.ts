const DEFAULT_STAGE_LABELS: Record<string, string> = {
  "New Lead": "Novo lead",
  Qualified: "Qualificado",
  "Proposal Sent": "Proposta enviada",
  Negotiation: "Negociação",
  Won: "Ganho",
  Lost: "Perdido",
  "Sales Pipeline": "Funil de vendas",
};

export function formatStageName(name: string) {
  return DEFAULT_STAGE_LABELS[name] ?? name;
}

export function formatPipelineName(name: string) {
  return DEFAULT_STAGE_LABELS[name] ?? name;
}
