'use client'

import { useEffect, useRef, useState } from 'react'
import { X, CheckCircle, Send, Loader2 } from 'lucide-react'

interface RequestAccessModalProps {
  isOpen: boolean
  onClose: () => void
  defaultPlan?: 'basic' | 'medium'
}

export function RequestAccessModal({ isOpen, onClose, defaultPlan }: RequestAccessModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [plan, setPlan] = useState<'basic' | 'medium'>(defaultPlan ?? 'basic')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Sync plan when defaultPlan changes (e.g. different button clicked)
  useEffect(() => {
    if (defaultPlan) setPlan(defaultPlan)
  }, [defaultPlan])

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/access-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, company, plan, message }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? 'Erro ao enviar pedido. Tenta novamente.')
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado. Tenta novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
    // Delay reset so animation plays first
    setTimeout(() => {
      setSuccess(false)
      setError(null)
      setName('')
      setEmail('')
      setPhone('')
      setCompany('')
      setMessage('')
    }, 300)
  }

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'rgba(2, 6, 23, 0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.2s ease',
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Solicitar Acesso"
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
      `}</style>

      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl flex flex-col max-h-[90vh]"
        style={{ animation: 'slideUp 0.25s cubic-bezier(0.16,1,0.3,1)' }}
      >
        {/* Top gradient bar */}
        <div className="h-1 w-full shrink-0" style={{ background: 'linear-gradient(90deg, #7c3aed, #059669)' }} />

        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800 hover:text-white"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-8 pb-8 pt-7 overflow-y-auto">
          {success ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-500/30">
                <CheckCircle className="h-8 w-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Pedido enviado!</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                ✅ Entraremos em contacto em breve via email ou WhatsApp.
                <br />
                Normalmente respondemos em menos de 24 horas.
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="mt-8 rounded-xl bg-violet-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
              >
                Fechar
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-7">
                <h2 className="text-2xl font-bold text-white">Solicitar Acesso</h2>
                <p className="mt-1.5 text-sm text-slate-400">
                  Preenche o formulário e entraremos em contacto em 24h
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                {/* Nome */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="modal-name" className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Nome completo <span className="text-violet-400">*</span>
                  </label>
                  <input
                    id="modal-name"
                    type="text"
                    required
                    placeholder="João Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="modal-email" className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Email <span className="text-violet-400">*</span>
                  </label>
                  <input
                    id="modal-email"
                    type="email"
                    required
                    placeholder="you@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20"
                  />
                </div>

                {/* Telemóvel (WhatsApp) */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="modal-phone" className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Telemóvel (WhatsApp) <span className="text-violet-400">*</span>
                  </label>
                  <input
                    id="modal-phone"
                    type="tel"
                    required
                    placeholder="+351 912 345 678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20"
                  />
                </div>

                {/* Empresa */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="modal-company" className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Nome da empresa <span className="text-slate-600">(opcional)</span>
                  </label>
                  <input
                    id="modal-company"
                    type="text"
                    placeholder="Minha Empresa Lda"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20"
                  />
                </div>

                {/* Plano */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="modal-plan" className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Plano de interesse
                  </label>
                  <select
                    id="modal-plan"
                    value={plan}
                    onChange={(e) => setPlan(e.target.value as 'basic' | 'medium')}
                    className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20"
                  >
                    <option value="basic">Plano Básico</option>
                    <option value="medium">Plano Médio</option>
                  </select>
                </div>

                {/* Mensagem */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="modal-message" className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Mensagem <span className="text-slate-600">(opcional)</span>
                  </label>
                  <textarea
                    id="modal-message"
                    rows={3}
                    placeholder="Diz-nos mais sobre o teu negócio ou dúvidas..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 resize-none"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-violet-500 hover:shadow-lg hover:shadow-violet-500/20 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      A enviar...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Enviar Pedido
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
