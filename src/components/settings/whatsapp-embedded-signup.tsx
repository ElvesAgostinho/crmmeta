'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import {
  MessageSquare,
  Loader2,
  CheckCircle2,
  Zap,
  ArrowRight,
  Shield,
  Clock,
  Smartphone,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const APP_ID = process.env.NEXT_PUBLIC_META_APP_ID!

// Augment the global Window with the Facebook SDK types we use.
declare global {
  interface Window {
    FB: {
      init: (config: {
        appId: string
        autoLogAppEvents: boolean
        xfbml: boolean
        version: string
      }) => void
      login: (
        callback: (response: {
          authResponse?: { code?: string; accessToken?: string } | null
          status?: string
        }) => void,
        options: {
          scope: string
          response_type: string
          override_default_response_type: boolean
          extras: {
            setup: Record<string, unknown>
            featureType: string
            sessionInfoVersion: string
          }
        }
      ) => void
    }
    fbAsyncInit: () => void
  }
}

interface Props {
  /** Called after successful connection so the parent can refresh the config. */
  onSuccess: () => void
  /** Whether the user already has a connected config (changes button label). */
  isConnected?: boolean
}

export function WhatsAppEmbeddedSignup({ onSuccess, isConnected = false }: Props) {
  const [sdkReady, setSdkReady] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [justConnected, setJustConnected] = useState(false)

  // Load the Facebook JS SDK once on mount.
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Already loaded by a previous render.
    if (window.FB) {
      setSdkReady(true)
      return
    }

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: APP_ID,
        cookie: true,
        autoLogAppEvents: true,
        xfbml: true,
        version: 'v18.0',
      })
      setSdkReady(true)
    }

    if (!document.getElementById('facebook-jssdk')) {
      const script = document.createElement('script')
      script.id = 'facebook-jssdk'
      script.src = 'https://connect.facebook.net/pt_PT/sdk.js'
      script.async = true
      script.defer = true
      document.body.appendChild(script)
    }
  }, [])

  const handleConnect = useCallback(() => {
    if (!APP_ID || APP_ID.trim() === '') {
      toast.error('Erro: O NEXT_PUBLIC_META_APP_ID não foi detetado no código compilado. Verifica o Easypanel.')
      return
    }

    if (!sdkReady || !window.FB) {
      toast.error('SDK a carregar, aguarda um momento e tenta novamente.')
      return
    }

    setConnecting(true)

    // Safety timeout in case FB SDK silently fails and never calls the callback
    const fallbackTimeout = setTimeout(() => {
      setConnecting(false)
      toast.error('O Facebook bloqueou o popup ou não respondeu. Verifica se tens um AdBlocker ligado ou a consola de erros (F12).')
    }, 8000)

    try {
      window.FB.login(
        (response) => {
          clearTimeout(fallbackTimeout)

          // User closed the popup or denied permission.
          if (!response.authResponse?.code) {
            setConnecting(false)
            if (response.status !== 'connected') {
              toast.error('Ligação cancelada. Abre o popup e autoriza as permissões.')
            }
            return
          }

          // FB SDK doesn't support async callbacks natively, so we wrap the async logic
          void (async () => {

          try {
            const res = await fetch('/api/whatsapp/embedded-signup', {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code: response.authResponse.code }),
            })

            const data = await res.json() as {
              success?: boolean
              error?: string
              phone_info?: { verified_name?: string; display_phone_number?: string }
              waba_name?: string
            }

            if (!res.ok || !data.success) {
              toast.error(data.error || 'Erro ao ligar o WhatsApp. Tenta novamente.')
              setConnecting(false)
              return
            }

            const label =
              data.phone_info?.verified_name ||
              data.phone_info?.display_phone_number ||
              'WhatsApp Business'

            toast.success(`✅ ${label} ligado com sucesso!`)
            setJustConnected(true)
            onSuccess()
          } catch (err) {
            console.error('[embedded-signup] fetch error:', err)
            toast.error('Erro de rede. Verifica a ligação e tenta novamente.')
          } finally {
            setConnecting(false)
          }
          })() // <-- Execute the async IIFE
        },
        {
          // Scopes required by the WhatsApp Business API.
          scope: 'whatsapp_business_management,whatsapp_business_messaging',
          // Ask for an OAuth code (server exchanges it for the token —
          // the App Secret never touches the browser).
          response_type: 'code',
          override_default_response_type: true,
          extras: {
            feature: 'whatsapp_embedded_signup',
            version: 2,
            sessionInfoVersion: '3',
          },
        }
      )
    } catch (e) {
      clearTimeout(fallbackTimeout)
      setConnecting(false)
      toast.error('Ocorreu um erro interno ao chamar o Facebook. Verifica a consola (F12).')
      console.error(e)
    }
  }, [sdkReady, onSuccess])

  const buttonLabel = justConnected
    ? 'Ligado!'
    : connecting
    ? 'A ligar…'
    : isConnected
    ? 'Religar com outro número'
    : 'Conectar com WhatsApp'

  return (
    <Card className="bg-gradient-to-br from-violet-950/50 via-slate-900 to-slate-900 border border-violet-700/40 shadow-xl shadow-violet-950/20">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 shadow-lg shadow-violet-900/40">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-white text-lg">
              {isConnected ? 'Alterar ligação WhatsApp' : 'Conectar WhatsApp com 1 clique'}
            </CardTitle>
            <CardDescription className="text-slate-400 mt-1">
              {isConnected
                ? 'Usa o fluxo oficial da Meta para ligar um número diferente.'
                : 'Liga a tua conta WhatsApp Business através do fluxo seguro e oficial da Meta — sem copiar ou colar IDs.'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Benefits row */}
        {!justConnected && (
          <div className="flex flex-wrap gap-4">
            {[
              { icon: Shield, label: 'Seguro e oficial Meta' },
              { icon: Clock, label: 'Menos de 2 minutos' },
              { icon: Smartphone, label: 'Qualquer número verificado' },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 text-xs text-slate-400"
              >
                <Icon className="h-3.5 w-3.5 text-violet-400" />
                {label}
              </span>
            ))}
          </div>
        )}

        {/* Success state */}
        {justConnected ? (
          <div className="flex items-center gap-3 rounded-xl bg-green-950/40 border border-green-700/30 px-4 py-3">
            <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
            <p className="text-sm text-green-300 font-medium">
              WhatsApp ligado! A página de configuração foi atualizada.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* How it works */}
            <div className="flex flex-col gap-2 rounded-xl bg-slate-800/50 border border-slate-700/50 px-4 py-3">
              <p className="text-xs font-medium text-slate-300 mb-1">Como funciona:</p>
              {[
                'Clica no botão abaixo',
                'Um popup da Meta abre — faz login e autoriza',
                'O número fica ligado automaticamente',
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-violet-600/60 text-white font-bold text-[10px]">
                    {i + 1}
                  </span>
                  {step}
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <Button
              id="whatsapp-embedded-signup-btn"
              onClick={(e) => {
                e.preventDefault();
                handleConnect();
              }}
              disabled={connecting || !sdkReady}
              className="w-full h-11 bg-gradient-to-r from-[#25D366] to-[#1aad52] hover:from-[#1ebe5d] hover:to-[#159a48] text-white font-semibold text-sm shadow-lg shadow-green-900/30 transition-all duration-200 gap-2"
            >
              {connecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {buttonLabel}
                </>
              ) : justConnected ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  {buttonLabel}
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  {buttonLabel}
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </>
              )}
            </Button>

            {!sdkReady && (
              <p className="text-center text-xs text-slate-500">
                A carregar SDK da Meta…
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
