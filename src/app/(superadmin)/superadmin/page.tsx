'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import {
  Settings,
  Users,
  Bell,
  Shield,
  CheckCircle,
  XCircle,
  Ban,
  Unlock,
  Calendar,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  Loader2,
  RefreshCw,
  Clock,
} from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────

type SubscriptionStatus = 'pending' | 'active' | 'blocked' | 'demo' | 'expired'
type SubscriptionPlan = 'basic' | 'medium'
type BillingCycle = 'daily' | 'monthly' | 'annual'

interface ModulesEnabled {
  inbox: boolean
  contacts: boolean
  pipelines: boolean
  automations: boolean
  broadcasts: boolean
  flows: boolean
  analytics: boolean
  embedded_signup: boolean
}

interface Subscription {
  user_id: string
  status: SubscriptionStatus
  plan: SubscriptionPlan
  billing_cycle: BillingCycle
  expires_at: string | null
  modules_enabled: ModulesEnabled | null
  notes: string | null
}

interface UserRecord {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  subscription: Subscription | null
  role: string
}

interface AccessRequest {
  id: string
  name: string
  email: string
  company: string
  plan: string
  message: string
  status: string
  created_at: string
}

interface AppSetting {
  key: string
  value: unknown
}

// ─── Status badge ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: SubscriptionStatus | string }) {
  const map: Record<string, string> = {
    active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    blocked: 'bg-red-500/20 text-red-400 border-red-500/30',
    demo: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    expired: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${map[status] ?? 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}
    >
      {status}
    </span>
  )
}

// ─── Module toggle dialog ─────────────────────────────────────────────────────

const MODULE_LABELS: Record<keyof ModulesEnabled, string> = {
  inbox: 'Inbox',
  contacts: 'Contacts',
  pipelines: 'Pipelines',
  automations: 'Automations',
  broadcasts: 'Broadcasts',
  flows: 'Flows',
  analytics: 'Analytics',
  embedded_signup: 'Embedded Signup',
}

function ModulesDialog({
  user,
  onClose,
  onSave,
}: {
  user: UserRecord
  onClose: () => void
  onSave: (modules: ModulesEnabled) => Promise<void>
}) {
  const defaultModules: ModulesEnabled = {
    inbox: true,
    contacts: true,
    pipelines: true,
    automations: false,
    broadcasts: false,
    flows: false,
    analytics: false,
    embedded_signup: false,
  }
  const [modules, setModules] = useState<ModulesEnabled>(
    (user.subscription?.modules_enabled as ModulesEnabled) ?? defaultModules
  )
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await onSave(modules)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <h3 className="mb-1 text-base font-semibold text-white">
          Módulos — {user.email}
        </h3>
        <p className="mb-5 text-xs text-slate-400">
          Ativa ou desativa funcionalidades para este utilizador.
        </p>
        <div className="flex flex-col gap-3">
          {(Object.keys(MODULE_LABELS) as (keyof ModulesEnabled)[]).map((key) => (
            <label
              key={key}
              className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 transition-colors hover:border-violet-500/30"
            >
              <span className="text-sm text-slate-300">{MODULE_LABELS[key]}</span>
              <button
                type="button"
                onClick={() => setModules((prev) => ({ ...prev, [key]: !prev[key] }))}
                className="transition-transform active:scale-90"
              >
                {modules[key] ? (
                  <ToggleRight className="h-6 w-6 text-violet-400" />
                ) : (
                  <ToggleLeft className="h-6 w-6 text-slate-600" />
                )}
              </button>
            </label>
          ))}
        </div>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-700"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Extend dialog ────────────────────────────────────────────────────────────

function ExtendDialog({
  user,
  onClose,
  onExtend,
}: {
  user: UserRecord
  onClose: () => void
  onExtend: (cycle: BillingCycle, count: number) => Promise<void>
}) {
  const [cycle, setCycle] = useState<BillingCycle>('monthly')
  const [count, setCount] = useState(1)
  const [saving, setSaving] = useState(false)

  async function handleExtend() {
    setSaving(true)
    await onExtend(cycle, count)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <h3 className="mb-1 text-base font-semibold text-white">
          Estender Subscrição
        </h3>
        <p className="mb-5 text-xs text-slate-400">{user.email}</p>
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">
              Ciclo
            </label>
            <select
              value={cycle}
              onChange={(e) => setCycle(e.target.value as BillingCycle)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
            >
              <option value="daily">Diário</option>
              <option value="monthly">Mensal</option>
              <option value="annual">Anual</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">
              Quantidade
            </label>
            <input
              type="number"
              min={1}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
            />
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-700"
          >
            Cancelar
          </button>
          <button
            onClick={handleExtend}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Estender
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SuperadminPage() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [settings, setSettings] = useState<AppSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [modulesUser, setModulesUser] = useState<UserRecord | null>(null)
  const [extendUser, setExtendUser] = useState<UserRecord | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [usersRes, requestsRes, settingsRes] = await Promise.all([
        fetch('/api/admin/users', { credentials: 'include' }),
        fetch('/api/admin/requests', { credentials: 'include' }),
        fetch('/api/admin/settings', { credentials: 'include' }),
      ])
      if (usersRes.ok) {
        const d = await usersRes.json()
        setUsers(d.users ?? [])
      }
      if (requestsRes.ok) {
        const d = await requestsRes.json()
        setRequests(d.requests ?? [])
      }
      if (settingsRes.ok) {
        const d = await settingsRes.json()
        setSettings(d.settings ?? [])
      }
    } catch {
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // ─── Helpers ───────────────────────────────────────────────────────────────

  async function handleRequestAction(id: string, action: 'approve' | 'reject') {
    setActionLoading(`req-${id}-${action}`)
    try {
      const res = await fetch(`/api/admin/requests/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) throw new Error()
      toast.success(action === 'approve' ? 'Pedido aprovado!' : 'Pedido rejeitado')
      await fetchAll()
    } catch {
      toast.error('Erro ao processar pedido')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleUserAction(
    id: string,
    action: string,
    extra?: Record<string, unknown>
  ) {
    setActionLoading(`usr-${id}-${action}`)
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...extra }),
      })
      if (!res.ok) throw new Error()
      toast.success('Utilizador atualizado')
      await fetchAll()
    } catch {
      toast.error('Erro ao atualizar utilizador')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleSaveModules(userId: string, modules: ModulesEnabled) {
    await handleUserAction(userId, 'block', { modules }) // reuse PATCH with modules
    // Actually we just want to update modules — use a neutral action
    setActionLoading(`usr-${userId}-modules`)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unblock', modules }),
      })
      if (res.ok) {
        toast.success('Módulos atualizados')
        await fetchAll()
      }
    } catch {
      toast.error('Erro ao atualizar módulos')
    } finally {
      setActionLoading(null)
      setModulesUser(null)
    }
  }

  async function handleSaveModulesOnly(userId: string, modules: ModulesEnabled) {
    setActionLoading(`usr-${userId}-modules`)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_modules', modules }),
      })
      if (res.ok) {
        toast.success('Módulos atualizados')
        await fetchAll()
      } else {
        throw new Error()
      }
    } catch {
      toast.error('Erro ao atualizar módulos')
    } finally {
      setActionLoading(null)
      setModulesUser(null)
    }
  }

  async function handleExtend(userId: string, cycle: BillingCycle, count: number) {
    setActionLoading(`usr-${userId}-extend`)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'extend', billing_cycle: cycle, days: count }),
      })
      if (!res.ok) throw new Error()
      toast.success('Subscrição estendida')
      await fetchAll()
    } catch {
      toast.error('Erro ao estender')
    } finally {
      setActionLoading(null)
      setExtendUser(null)
    }
  }

  async function handleToggleSetting(key: string, currentValue: unknown) {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: !currentValue }),
      })
      if (!res.ok) throw new Error()
      toast.success('Configuração atualizada')
      await fetchAll()
    } catch {
      toast.error('Erro ao atualizar configuração')
    }
  }

  // ─── Derived state ─────────────────────────────────────────────────────────

  const pendingRequests = requests.filter((r) => r.status === 'pending')
  const embeddedSignupSetting = settings.find((s) => s.key === 'embedded_signup_enabled')
  const embeddedSignupEnabled = !!embeddedSignupSetting?.value

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
          <p className="text-sm text-slate-400">A carregar painel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/3 h-80 w-80 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute top-1/2 right-0 h-64 w-64 rounded-full bg-violet-800/8 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ── Header ── */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 ring-1 ring-violet-500/30">
              <Shield className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Painel de Superadmin</h1>
              <p className="text-xs text-slate-500">Gestão global do sistema</p>
            </div>
          </div>
          <button
            onClick={fetchAll}
            className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-400 transition-colors hover:border-violet-500/50 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </button>
        </div>

        {/* ── Stats row ── */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">Utilizadores</p>
              <Users className="h-4 w-4 text-violet-400" />
            </div>
            <p className="mt-2 text-3xl font-bold text-white">{users.length}</p>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-amber-400">Pedidos pendentes</p>
              <Bell className="h-4 w-4 text-amber-400" />
            </div>
            <p className="mt-2 text-3xl font-bold text-white">{pendingRequests.length}</p>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-emerald-400">Activos</p>
              <CheckCircle className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="mt-2 text-3xl font-bold text-white">
              {users.filter((u) => u.subscription?.status === 'active').length}
            </p>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            Section 1: Access Requests
        ══════════════════════════════════════════════════ */}
        <section className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <Bell className="h-4 w-4 text-amber-400" />
            <h2 className="text-base font-semibold text-white">Pedidos de Acesso</h2>
            {pendingRequests.length > 0 && (
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">
                {pendingRequests.length} pendente{pendingRequests.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
            {requests.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500">
                Nenhum pedido de acesso.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                        Nome
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                        Email
                      </th>
                      <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 md:table-cell">
                        Empresa
                      </th>
                      <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 sm:table-cell">
                        Plano
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                        Estado
                      </th>
                      <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 lg:table-cell">
                        Data
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {requests.map((req) => (
                      <tr
                        key={req.id}
                        className="transition-colors hover:bg-slate-800/30"
                      >
                        <td className="px-4 py-3 font-medium text-white">
                          {req.name || '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-300">{req.email}</td>
                        <td className="hidden px-4 py-3 text-slate-400 md:table-cell">
                          {req.company || '—'}
                        </td>
                        <td className="hidden px-4 py-3 sm:table-cell">
                          <StatusBadge status={req.plan || 'basic'} />
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={req.status} />
                        </td>
                        <td className="hidden px-4 py-3 text-slate-500 lg:table-cell">
                          {new Date(req.created_at).toLocaleDateString('pt-PT')}
                        </td>
                        <td className="px-4 py-3">
                          {req.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                id={`approve-req-${req.id}`}
                                onClick={() => handleRequestAction(req.id, 'approve')}
                                disabled={actionLoading === `req-${req.id}-approve`}
                                className="flex items-center gap-1.5 rounded-lg bg-emerald-600/20 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-600/30 disabled:opacity-50"
                              >
                                {actionLoading === `req-${req.id}-approve` ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-3 w-3" />
                                )}
                                Aprovar
                              </button>
                              <button
                                id={`reject-req-${req.id}`}
                                onClick={() => handleRequestAction(req.id, 'reject')}
                                disabled={actionLoading === `req-${req.id}-reject`}
                                className="flex items-center gap-1.5 rounded-lg bg-red-600/20 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-600/30 disabled:opacity-50"
                              >
                                {actionLoading === `req-${req.id}-reject` ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <XCircle className="h-3 w-3" />
                                )}
                                Rejeitar
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-600">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            Section 2: Users
        ══════════════════════════════════════════════════ */}
        <section className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <Users className="h-4 w-4 text-violet-400" />
            <h2 className="text-base font-semibold text-white">Utilizadores</h2>
            <span className="rounded-full bg-slate-700/60 px-2 py-0.5 text-xs font-medium text-slate-400">
              {users.length}
            </span>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
            {users.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500">
                Nenhum utilizador encontrado.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                        Email
                      </th>
                      <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 sm:table-cell">
                        Plano
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                        Estado
                      </th>
                      <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 md:table-cell">
                        Ciclo
                      </th>
                      <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 lg:table-cell">
                        Expira em
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {users.map((user) => {
                      const sub = user.subscription
                      const isBlocked = sub?.status === 'blocked'
                      return (
                        <tr
                          key={user.id}
                          className="transition-colors hover:bg-slate-800/30"
                        >
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-white">{user.email}</p>
                              {user.role !== 'user' && (
                                <span className="text-xs text-violet-400">{user.role}</span>
                              )}
                            </div>
                          </td>
                          <td className="hidden px-4 py-3 sm:table-cell">
                            <span className="text-slate-300">{sub?.plan ?? '—'}</span>
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={sub?.status ?? 'pending'} />
                          </td>
                          <td className="hidden px-4 py-3 text-slate-400 md:table-cell">
                            {sub?.billing_cycle ?? '—'}
                          </td>
                          <td className="hidden px-4 py-3 lg:table-cell">
                            {sub?.expires_at ? (
                              <span className="flex items-center gap-1 text-slate-400">
                                <Clock className="h-3 w-3" />
                                {new Date(sub.expires_at).toLocaleDateString('pt-PT')}
                              </span>
                            ) : (
                              <span className="text-slate-600">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Ativar (for pending, expired, or null status) */}
                              {(sub?.status === 'pending' || sub?.status === 'expired' || !sub?.status) && (
                                <button
                                  id={`activate-${user.id}`}
                                  onClick={() => handleUserAction(user.id, 'approve')}
                                  disabled={!!actionLoading}
                                  title="Ativar"
                                  className="flex items-center gap-1 rounded-lg bg-emerald-500 text-white px-2.5 py-1.5 text-xs font-semibold transition-colors hover:bg-emerald-600 disabled:opacity-50"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                  <span>Ativar</span>
                                </button>
                              )}

                              {/* Bloquear (for active or demo status) */}
                              {(sub?.status === 'active' || sub?.status === 'demo') && (
                                <button
                                  id={`block-${user.id}`}
                                  onClick={() => handleUserAction(user.id, 'block')}
                                  disabled={!!actionLoading}
                                  title="Bloquear"
                                  className="flex items-center gap-1 rounded-lg bg-red-600/20 px-2.5 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-600/30 disabled:opacity-50"
                                >
                                  <Ban className="h-3 w-3" />
                                  <span className="hidden sm:inline">Bloquear</span>
                                </button>
                              )}

                              {/* Desbloquear (only for blocked status) */}
                              {sub?.status === 'blocked' && (
                                <button
                                  id={`unblock-${user.id}`}
                                  onClick={() => handleUserAction(user.id, 'unblock')}
                                  disabled={!!actionLoading}
                                  title="Desbloquear"
                                  className="flex items-center gap-1 rounded-lg bg-emerald-600/20 px-2.5 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-600/30 disabled:opacity-50"
                                >
                                  <Unlock className="h-3 w-3" />
                                  <span className="hidden sm:inline">Desbloquear</span>
                                </button>
                              )}

                              {/* Extend */}
                              <button
                                id={`extend-${user.id}`}
                                onClick={() => setExtendUser(user)}
                                disabled={!!actionLoading}
                                title="Estender"
                                className="flex items-center gap-1 rounded-lg bg-slate-700/60 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700 disabled:opacity-50"
                              >
                                <Calendar className="h-3 w-3" />
                                <span className="hidden sm:inline">Estender</span>
                              </button>

                              {/* Modules */}
                              <button
                                id={`modules-${user.id}`}
                                onClick={() => setModulesUser(user)}
                                disabled={!!actionLoading}
                                title="Módulos"
                                className="flex items-center gap-1 rounded-lg bg-violet-600/20 px-2.5 py-1.5 text-xs font-medium text-violet-400 transition-colors hover:bg-violet-600/30 disabled:opacity-50"
                              >
                                <Settings className="h-3 w-3" />
                                <span className="hidden sm:inline">Módulos</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            Section 3: Global Settings
        ══════════════════════════════════════════════════ */}
        <section>
          <div className="mb-4 flex items-center gap-3">
            <Settings className="h-4 w-4 text-slate-400" />
            <h2 className="text-base font-semibold text-white">Configurações Globais</h2>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 px-5 py-4 transition-colors hover:border-violet-500/30">
              <div>
                <p className="font-medium text-white">Embedded Signup</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  Ligar WhatsApp com 1 clique — activa o fluxo de onboarding rápido.
                </p>
              </div>
              <button
                type="button"
                id="toggle-embedded-signup"
                onClick={() =>
                  handleToggleSetting('embedded_signup_enabled', embeddedSignupEnabled)
                }
                className="transition-transform active:scale-90"
              >
                {embeddedSignupEnabled ? (
                  <ToggleRight className="h-8 w-8 text-violet-400" />
                ) : (
                  <ToggleLeft className="h-8 w-8 text-slate-600" />
                )}
              </button>
            </label>
          </div>
        </section>
      </div>

      {/* ─── Dialogs ── */}
      {modulesUser && (
        <ModulesDialog
          user={modulesUser}
          onClose={() => setModulesUser(null)}
          onSave={(modules) => handleSaveModulesOnly(modulesUser.id, modules)}
        />
      )}
      {extendUser && (
        <ExtendDialog
          user={extendUser}
          onClose={() => setExtendUser(null)}
          onExtend={(cycle, count) => handleExtend(extendUser.id, cycle, count)}
        />
      )}
    </div>
  )
}
