# Fluxo de Trabalho (SaaS Comercial & Pedidos de Acesso)

Este documento explica o fluxo completo de subscrição, acesso e faturação da plataforma.

## 1. Landing Page e Solicitação de Acesso

1. **Visita à Landing Page**: O visitante vê a secção de preços na página inicial com os dois planos (**Plano Básico** e **Plano Médio**).
2. **Formulário de Acesso**: Ao clicar em "Começar" ou "Solicitar Plano", abre-se um modal moderno que pede:
   - Nome Completo
   - Email de contacto
   - Nome da Empresa (opcional)
   - Plano de Interesse (Básico ou Médio)
   - Mensagem adicional (opcional)
3. **Submissão do Pedido**: Os dados são validados e enviados para a API (`/api/access-requests`), que insere o registo na tabela `access_requests` da base de dados do Supabase.

---

## 2. Automação de Notificação (n8n)

Para notificar o administrador em tempo real:
1. Um **Supabase Database Webhook** é configurado na tabela `access_requests` para disparar em eventos de `INSERT`.
2. O webhook chama o workflow do n8n (fornecido em `/automation/workflows/access_request_notification.json`).
3. O n8n formata os dados do pedido e envia um email formatado para `orgabot57@gmail.com`.

---

## 3. Painel do Superadmin (`/superadmin`)

O superadmin (`elvessacapuri57@gmail.com`) pode gerir toda a plataforma a partir de um painel exclusivo:

1. **Pedidos de Acesso**: Lista todos os pedidos recebidos. O superadmin pode:
   - **Aprovar**: Cria automaticamente a conta do utilizador no Supabase Auth (se ainda não existir), cria uma linha na tabela `subscriptions` com o plano pretendido, define a mensalidade padrão, ativa o acesso e calcula a expiração.
   - **Rejeitar**: Marca o pedido como rejeitado.
2. **Gestão de Utilizadores**: Mostra todos os utilizadores registados e as suas subscrições. Ações permitidas:
   - **Bloquear/Desbloquear**: Suspende ou reativa o acesso de forma instantânea.
   - **Estender Tempo**: Aumenta o tempo de subscrição (Diário para demonstrações, Mensal ou Anual) escolhendo a quantidade de tempo a somar à expiração atual.
   - **Gerir Módulos**: Abre um painel para ligar ou desligar módulos individuais para o cliente (Dashboard, Inbox, Contacts, Pipelines, Broadcasts, Automations, Flows, Embedded Signup).
3. **Configuração Global (Embedded Signup)**:
   - Permite ativar ou desativar a conexão com 1-clique (Meta Embedded Signup) para **todos** os utilizadores da plataforma simultaneamente.

---

## 4. Controlo de Acesso e Segurança

- **Middleware do Next.js (`src/proxy.ts`)**:
  - Interceta todos os acessos a rotas protegidas (ex: `/dashboard`, `/inbox`, etc.).
  - Bypassa a verificação se o utilizador for o superadmin (`elvessacapuri57@gmail.com`).
  - Redireciona utilizadores com subscrição `pending` ou sem subscrição para `/pending`.
  - Redireciona utilizadores com subscrição `blocked` ou `expired` para `/blocked` (página de suspensão com suporte WhatsApp/Email).
- **Barra Lateral Dinâmica (`src/components/layout/sidebar.tsx`)**:
  - Lê `modules_enabled` do utilizador na tabela `subscriptions`.
  - Oculta ou exibe os links correspondentes aos módulos que o cliente contratou (ex: se não tiver automações ativas, o link "Automations" não aparece no menu lateral).
  - O superadmin vê sempre todos os módulos e um link direto para o `/superadmin`.
