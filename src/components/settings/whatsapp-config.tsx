'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Eye,
  EyeOff,
  Copy,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  Zap,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import type { WhatsAppConfig as WhatsAppConfigType } from '@/types';
import { WhatsAppEmbeddedSignup } from './whatsapp-embedded-signup';

const MASKED_TOKEN = '****************';

type ConnectionStatus = 'connected' | 'disconnected' | 'unknown';
type ResetReason = 'token_corrupted' | 'meta_api_error' | null;

function formatError(error: unknown) {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  if (typeof error === 'object' && error !== null) {
    try {
      return JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
    } catch {
      return String(error)
    }
  }
  return String(error)
}

export function WhatsAppConfig() {
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [config, setConfig] = useState<WhatsAppConfigType | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('unknown');
  const [resetReason, setResetReason] = useState<ResetReason>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [wabaId, setWabaId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [verifyToken, setVerifyToken] = useState('');
  const [tokenEdited, setTokenEdited] = useState(false);

  const webhookUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/whatsapp/webhook`
      : '';

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/whatsapp/config', {
        method: 'GET',
        credentials: 'include',
      });
      const payload = await res.json();

      if (!res.ok) {
        console.error('Failed to load WhatsApp config:', payload);
        setConnectionStatus('unknown');
        setStatusMessage('Erro de servidor ao obter a configuração');
        return;
      }

      if (payload.config) {
        setConfig(payload.config);
        setPhoneNumberId(payload.config.phone_number_id || '');
        setWabaId(payload.config.waba_id || '');
        setAccessToken(MASKED_TOKEN);
        setVerifyToken('');
        setTokenEdited(false);
      } else if (payload.reason === 'no_config') {
        setConfig(null);
        setPhoneNumberId('');
        setWabaId('');
        setAccessToken('');
        setVerifyToken('');
        setTokenEdited(false);
      }

      if (payload.connected) {
        setConnectionStatus('connected');
        setResetReason(null);
        setStatusMessage('');
      } else {
        setConnectionStatus('disconnected');
        setResetReason(
          payload.needs_reset
            ? 'token_corrupted'
            : payload.reason === 'meta_api_error'
            ? 'meta_api_error'
            : null,
        );
        setStatusMessage(payload.message || '');
      }
    } catch (err) {
      console.error('fetchConfig error:', formatError(err), err);
      toast.error('Não foi possível carregar a configuração do WhatsApp');
      setConnectionStatus('unknown');
      setStatusMessage('Falha na rede ao contactar o servidor');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    fetchConfig();
  }, [authLoading, user, fetchConfig]);

  async function handleSave() {
    if (!phoneNumberId.trim()) {
      toast.error('O ID do numero de telefone e obrigatorio');
      return;
    }
    if (!config && (!accessToken.trim() || !tokenEdited)) {
      toast.error('O token de acesso é obrigatório na configuração inicial');
      return;
    }

    try {
      setSaving(true);

      const payload: Record<string, unknown> = {
        phone_number_id: phoneNumberId.trim(),
        waba_id: wabaId.trim() || null,
        verify_token: verifyToken.trim() || null,
      };

      if (tokenEdited && accessToken !== MASKED_TOKEN && accessToken.trim()) {
        payload.access_token = accessToken.trim();
      }

      const res = await fetch('/api/whatsapp/config', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMessage = data.error || 'Não foi possível guardar a configuração';
        console.error('Save config failed:', errorMessage, data);
        toast.error(errorMessage);
        setSaving(false);
        return;
      }

      toast.success(
        data.phone_info?.verified_name
          ? `Ligado a ${data.phone_info.verified_name}`
          : 'Configuracao guardada com sucesso'
      );

      await fetchConfig();
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Não foi possível guardar a configuração');
    } finally {
      setSaving(false);
    }
  }

  async function handleTestConnection() {
    try {
      setTesting(true);
      const res = await fetch('/api/whatsapp/config', { method: 'GET', credentials: 'include' });
      const payload = await res.json();

      if (payload.connected) {
        setConnectionStatus('connected');
        setResetReason(null);
        setStatusMessage('');
        toast.success(
          payload.phone_info?.verified_name
            ? `Ligado a ${payload.phone_info.verified_name}`
            : 'Ligacao a API concluida com sucesso'
        );
      } else {
        setConnectionStatus('disconnected');
        setResetReason(payload.needs_reset ? 'token_corrupted' : payload.reason === 'meta_api_error' ? 'meta_api_error' : null);
        setStatusMessage(payload.message || '');
        toast.error(payload.message || 'A ligação à API falhou');
      }
    } catch (err) {
      console.error('Test connection error:', err);
      setConnectionStatus('disconnected');
      toast.error('O teste de ligação falhou. Verifique a rede e tente novamente.');
    } finally {
      setTesting(false);
    }
  }

  async function handleReset() {
    if (!confirm('Isto vai apagar a configuração actual do WhatsApp para a poder introduzir novamente. Continuar?')) {
      return;
    }

    try {
      setResetting(true);
      const res = await fetch('/api/whatsapp/config', { method: 'DELETE', credentials: 'include' });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Não foi possível repor a configuração');
        return;
      }

      toast.success('Configuracao limpa. Ja pode introduzir as credenciais novamente.');
      setConfig(null);
      setPhoneNumberId('');
      setWabaId('');
      setAccessToken('');
      setVerifyToken('');
      setTokenEdited(false);
      setConnectionStatus('disconnected');
      setResetReason(null);
      setStatusMessage('');
    } catch (err) {
      console.error('Reset error:', err);
      toast.error('Não foi possível repor a configuração');
    } finally {
      setResetting(false);
    }
  }

  function handleCopyWebhookUrl() {
    navigator.clipboard.writeText(webhookUrl);
    toast.success('URL do webhook copiada');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-violet-500" />
      </div>
    );
  }

  const showResetBanner = resetReason === 'token_corrupted';

  return (
    <div className="space-y-8 mt-4">

      {/* ── Embedded Signup (1-click connect) ─────────────────────────────── */}
      <WhatsAppEmbeddedSignup
        onSuccess={() => fetchConfig().catch(console.error)}
        isConnected={connectionStatus === 'connected'}
      />

      {/* ── Divider ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <div className="flex-1 border-t border-slate-700/60" />
        <span className="text-xs text-slate-500 font-medium uppercase tracking-widest">
          ou configuração manual
        </span>
        <div className="flex-1 border-t border-slate-700/60" />
      </div>

      {/* ── Manual config + sidebar ────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Main config form */}
        <div className="space-y-6">
          {/* Corrupted-token reset banner */}
          {showResetBanner && (
            <Alert className="bg-amber-950/40 border-amber-600/40">
              <div className="flex items-start gap-3">
                <AlertTriangle className="size-5 text-amber-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <AlertTitle className="text-amber-200 mb-1">
                    O token guardado nao pode ser desencriptado
                  </AlertTitle>
                  <AlertDescription className="text-amber-100/80 text-sm">
                    {statusMessage}
                  </AlertDescription>
                  <Button
                    onClick={(e) => { e.preventDefault(); handleReset().catch(console.error); }}
                    disabled={resetting}
                    size="sm"
                    className="mt-3 bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    {resetting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        A repor...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="size-4" />
                        Repor configuração
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Alert>
          )}

          {/* Connection Status */}
          <Alert className="bg-slate-900 border-slate-700">
            <div className="flex items-center gap-2">
              {connectionStatus === 'connected' ? (
                <CheckCircle2 className="size-4 text-violet-500" />
              ) : (
                <XCircle className="size-4 text-red-500" />
              )}
              <AlertTitle className="text-white mb-0">
                {connectionStatus === 'connected' ? 'Ligado' : 'Não ligado'}
              </AlertTitle>
            </div>
            <AlertDescription className="text-slate-400">
              {connectionStatus === 'connected'
                ? 'A API do WhatsApp Business esta ligada e pronta para enviar e receber mensagens.'
                : statusMessage ||
                  'Configure abaixo as credenciais da API da Meta para ligar a sua conta WhatsApp Business.'}
            </AlertDescription>
          </Alert>

          {/* API Credentials */}
          <Card className="bg-slate-900 border-slate-700 ring-0 ring-transparent">
            <CardHeader>
              <CardTitle className="text-white">Credenciais da API</CardTitle>
              <CardDescription className="text-slate-400">
                Introduza as credenciais da API WhatsApp Business da Meta.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">ID do numero de telefone</Label>
                <Input
                  placeholder="ex.: 100234567890123"
                  value={phoneNumberId}
                  onChange={(e) => setPhoneNumberId(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">ID da conta WhatsApp Business</Label>
                <Input
                  placeholder="ex.: 100234567890456"
                  value={wabaId}
                  onChange={(e) => setWabaId(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Token de acesso permanente</Label>
                <div className="relative">
                  <Input
                    type={showToken ? 'text' : 'password'}
                    placeholder="Introduza o seu token de acesso"
                    value={accessToken}
                    onChange={(e) => {
                      setAccessToken(e.target.value);
                      setTokenEdited(true);
                    }}
                    onFocus={() => {
                      if (accessToken === MASKED_TOKEN) {
                        setAccessToken('');
                        setTokenEdited(true);
                      }
                    }}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showToken ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {config && !tokenEdited && (
                  <p className="text-xs text-slate-500">
                    O token está oculto por segurança. Introduza-o novamente para actualizar a configuração.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Token de verificacao do webhook</Label>
                <Input
                  placeholder="Crie um token de verificacao personalizado"
                  value={verifyToken}
                  onChange={(e) => setVerifyToken(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
                <p className="text-xs text-slate-500">
                  Uma palavra-passe criada por si. Deve ser igual ao token definido nas configuracoes do webhook da Meta.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Webhook URL */}
          <Card className="bg-slate-900 border-slate-700 ring-0 ring-transparent">
            <CardHeader>
              <CardTitle className="text-white">Configuracao do webhook</CardTitle>
              <CardDescription className="text-slate-400">
                Use este URL como callback do webhook no painel da aplicacao Meta.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label className="text-slate-300">URL de callback do webhook</Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={webhookUrl}
                    className="bg-slate-800 border-slate-700 text-slate-300 font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyWebhookUrl}
                    className="shrink-0 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                  >
                    <Copy className="size-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={(e) => { e.preventDefault(); handleSave().catch(console.error); }}
              disabled={saving}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  A guardar...
                </>
              ) : (
                'Guardar configuração'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={(e) => { e.preventDefault(); handleTestConnection().catch(console.error); }}
              disabled={testing || !config}
              className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
            >
              {testing ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  A testar...
                </>
              ) : (
                <>
                  <Zap className="size-4" />
                  Testar ligação à API
                </>
              )}
            </Button>
            {config && (
              <Button
                variant="outline"
                onClick={(e) => { e.preventDefault(); handleReset().catch(console.error); }}
                disabled={resetting}
                className="border-red-900 text-red-400 hover:text-red-300 hover:bg-red-950/40"
              >
                {resetting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    A repor...
                  </>
                ) : (
                  <>
                    <RotateCcw className="size-4" />
                    Repor configuração
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Setup Instructions Sidebar */}
        <div>
          <Card className="bg-slate-900 border-slate-700 ring-0 ring-transparent">
            <CardHeader>
              <CardTitle className="text-white text-base">Instruções de configuração</CardTitle>
              <CardDescription className="text-slate-400">
                Siga estes passos para ligar a API do WhatsApp Business.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion>
                <AccordionItem className="border-slate-700">
                  <AccordionTrigger className="text-slate-300 hover:text-white hover:no-underline">
                    <span className="flex items-center gap-2">
                      <span className="flex size-5 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">1</span>
                      Criar uma aplicacao Meta
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-400">
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Aceda a <span className="text-violet-400">developers.facebook.com</span></li>
                      <li>Clique em &quot;My Apps&quot; e depois em &quot;Create App&quot;</li>
                      <li>Seleccione &quot;Business&quot; como tipo de aplicacao</li>
                      <li>Preencha os dados da aplicacao e crie-a</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem className="border-slate-700">
                  <AccordionTrigger className="text-slate-300 hover:text-white hover:no-underline">
                    <span className="flex items-center gap-2">
                      <span className="flex size-5 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">2</span>
                      Adicionar o produto WhatsApp
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-400">
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>No painel da aplicação, clique em &quot;Add Product&quot;</li>
                      <li>Procure &quot;WhatsApp&quot; e clique em &quot;Set Up&quot;</li>
                      <li>Siga o assistente para ligar a sua empresa</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem className="border-slate-700">
                  <AccordionTrigger className="text-slate-300 hover:text-white hover:no-underline">
                    <span className="flex items-center gap-2">
                      <span className="flex size-5 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">3</span>
                      Obter as credenciais da API
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-400">
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Aceda a WhatsApp &gt; API Setup</li>
                      <li>Copy your <strong className="text-slate-200">ID do numero de telefone</strong></li>
                      <li>Copy your <strong className="text-slate-200">ID da conta WhatsApp Business</strong></li>
                      <li>Gere um <strong className="text-slate-200">Token de acesso permanente</strong> em Business Settings &gt; System Users</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem className="border-slate-700">
                  <AccordionTrigger className="text-slate-300 hover:text-white hover:no-underline">
                    <span className="flex items-center gap-2">
                      <span className="flex size-5 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">4</span>
                      Configurar webhooks
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-400">
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Aceda a WhatsApp &gt; Configuration</li>
                      <li>Clique em &quot;Edit&quot; na secção Webhook</li>
                      <li>Paste the <strong className="text-slate-200">URL de callback do webhook</strong> from above</li>
                      <li>Enter the same <strong className="text-slate-200">token de verificacao</strong> you set here</li>
                      <li>Subscreva o campo de webhook &quot;messages&quot;</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="mt-4 pt-4 border-t border-slate-700">
                <a
                  href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 transition-colors"
                >
                  <ExternalLink className="size-3.5" />
                  Documentação da API WhatsApp da Meta
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
