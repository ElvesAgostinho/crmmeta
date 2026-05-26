'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Loader2, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { MessageTemplate } from '@/types';

const CATEGORIES: MessageTemplate['category'][] = ['Marketing', 'Utility', 'Authentication'];
const HEADER_TYPES = ['text', 'image', 'video', 'document'] as const;

const categoryColors: Record<string, string> = {
  Marketing: 'bg-purple-600/20 text-purple-400 border-purple-600/30',
  Utility: 'bg-blue-600/20 text-blue-400 border-blue-600/30',
  Authentication: 'bg-amber-600/20 text-amber-400 border-amber-600/30',
};

const statusColors: Record<string, string> = {
  Draft: 'bg-slate-600/20 text-slate-400 border-slate-600/30',
  Pending: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30',
  Approved: 'bg-violet-600/20 text-violet-400 border-violet-600/30',
  Rejected: 'bg-red-600/20 text-red-400 border-red-600/30',
};

const categoryLabels: Record<string, string> = {
  Marketing: 'Marketing',
  Utility: 'Utilidade',
  Authentication: 'Autenticação',
};

const statusLabels: Record<string, string> = {
  Draft: 'Rascunho',
  Pending: 'Pendente',
  Approved: 'Aprovado',
  Rejected: 'Rejeitado',
};

const headerTypeLabels: Record<string, string> = {
  text: 'Texto',
  image: 'Imagem',
  video: 'Vídeo',
  document: 'Documento',
};

interface TemplateFormData {
  name: string;
  category: MessageTemplate['category'];
  language: string;
  body_text: string;
  header_type: string;
  footer_text: string;
}

// Meta's language codes are exact - "en" and "en_US" are distinct and a
// template approved under one will be rejected if you send with the other
// (Graph API error #132001 "Template name does not exist in the
// translation"). Default to pt_PT for Portuguese templates.
const emptyForm: TemplateFormData = {
  name: '',
  category: 'Marketing',
  language: 'pt_PT',
  body_text: '',
  header_type: '',
  footer_text: '',
};

// Common Meta template language codes. The field still accepts any
// string - this just offers autocomplete for the usual suspects. Full
// list: https://developers.facebook.com/docs/whatsapp/api/messages/message-templates#supported-languages
const COMMON_LANGUAGE_CODES = [
  'pt_PT',
  'pt_BR',
  'en_US',
  'en_GB',
  'en',
  'es',
  'es_ES',
  'es_MX',
  'fr',
  'fr_FR',
  'de',
  'it',
  'nl',
  'pl',
  'ru',
  'tr',
  'lt',
];

export function TemplateManager() {
  const supabase = createClient();
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [form, setForm] = useState<TemplateFormData>(emptyForm);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    fetchTemplates(user.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.id]);

  async function fetchTemplates(userId: string) {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      toast.error('Não foi possível carregar os modelos');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error('O nome do modelo é obrigatório');
      return;
    }
    if (!form.body_text.trim()) {
      toast.error('O texto da mensagem é obrigatório');
      return;
    }

    try {
      setSaving(true);
      if (!user) {
        toast.error('Sessão não autenticada');
        return;
      }

      const payload = {
        user_id: user.id,
        name: form.name.trim(),
        category: form.category,
        language: form.language.trim() || 'pt_PT',
        body_text: form.body_text.trim(),
        header_type: form.header_type === 'none' ? null : form.header_type || null,
        footer_text: form.footer_text.trim() || null,
        status: 'Draft' as const,
      };

      const { error } = await supabase
        .from('message_templates')
        .insert(payload);

      if (error) throw error;

      toast.success('Modelo criado com sucesso');
      setDialogOpen(false);
      setForm(emptyForm);
      if (user) await fetchTemplates(user.id);
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Não foi possível criar o modelo');
    } finally {
      setSaving(false);
    }
  }

  /**
   * Pull approved templates from Meta and upsert them into the local
   * catalog. After this runs, every local row is guaranteed to match
   * something Meta will actually accept on send - stops users getting
   * stuck on error #132001 "Template name does not exist".
   */
  async function handleSyncFromMeta() {
    if (!user) return;
    setSyncing(true);
    try {
      const res = await fetch('/api/whatsapp/templates/sync', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || `Falha na sincronização (HTTP ${res.status})`);
      }
      toast.success(
        `Sincronizados ${data.total} modelo${data.total === 1 ? '' : 's'} da Meta` +
          (data.inserted || data.updated
            ? ` (${data.inserted} novo(s), ${data.updated} actualizado(s))`
            : ''),
      );
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        // Surface per-template failures so users don't trust a green
        // toast that hides silent drift.
        const preview = data.errors.slice(0, 3).map(
          (e: { name: string; language: string; message: string }) =>
            `${e.name} (${e.language})`,
        );
        const suffix =
          data.errors.length > 3 ? `, +${data.errors.length - 3} mais` : '';
        toast.error(`Não foi possível sincronizar: ${preview.join(', ')}${suffix}`);
      }
      if (data.truncated) {
        toast.warning(
          'A sincronização atingiu o limite de páginas da Meta. Podem existir mais modelos.',
        );
      }
      await fetchTemplates(user.id);
    } catch (err) {
      console.error('Template sync error:', err);
      toast.error(
        err instanceof Error ? err.message : 'Não foi possível sincronizar os modelos',
      );
    } finally {
      setSyncing(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const { error } = await supabase
        .from('message_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Modelo eliminado');
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Não foi possível eliminar o modelo');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-white">Modelos de mensagem</h2>
          <p className="text-sm text-slate-400">
            Crie e gira os modelos de mensagem do WhatsApp. A Meta exige que
            cada modelo seja aprovado no WhatsApp Manager antes de poder ser
            enviado. Use &quot;Sincronizar com a Meta&quot; para importar a lista aprovada.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleSyncFromMeta}
            disabled={syncing}
            className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800"
            title="Importar modelos aprovados da sua conta WhatsApp Business da Meta"
          >
            <RefreshCw
              className={`size-4 ${syncing ? 'animate-spin' : ''}`}
            />
            {syncing ? 'A sincronizar...' : 'Sincronizar com a Meta'}
          </Button>
          <Button
            onClick={() => {
              setForm(emptyForm);
              setDialogOpen(true);
            }}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            <Plus className="size-4" />
            Novo modelo
          </Button>
        </div>
      </div>

      {templates.length === 0 ? (
        <Card className="bg-slate-900 border-slate-700 ring-0 ring-transparent">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-slate-400 text-sm">Ainda não existem modelos.</p>
            <p className="text-slate-500 text-xs mt-1">Crie o primeiro modelo de mensagem para começar.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {templates.map((template) => (
            <Card key={template.id} className="bg-slate-900 border-slate-700 ring-0 ring-transparent">
              <CardContent className="flex items-start justify-between pt-4">
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-white">{template.name}</h3>
                    <Badge
                      className={`text-xs border ${categoryColors[template.category] || ''}`}
                    >
                      {categoryLabels[template.category] ?? template.category}
                    </Badge>
                    <Badge
                      className={`text-xs border ${statusColors[template.status || 'Draft'] || ''}`}
                    >
                      {statusLabels[template.status || 'Draft'] ?? template.status ?? 'Rascunho'}
                    </Badge>
                    {template.language && (
                      <span className="text-xs text-slate-500 uppercase">{template.language}</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-2">{template.body_text}</p>
                  {template.footer_text && (
                    <p className="text-xs text-slate-500 italic">{template.footer_text}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(template.id)}
                  className="text-slate-400 hover:text-red-400 hover:bg-red-950/30 shrink-0 ml-2"
                >
                  <Trash2 className="size-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* New Template Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Novo modelo de mensagem</DialogTitle>
            <DialogDescription className="text-slate-400">
              Crie um novo modelo de mensagem do WhatsApp.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-slate-300">Nome do modelo</Label>
              <Input
                placeholder="ex.: confirmacao_encomenda"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Categoria</Label>
                <Select
                  value={form.category}
                  onValueChange={(val) =>
                    setForm({ ...form, category: val as MessageTemplate['category'] })
                  }
                >
                  <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-white focus:bg-slate-700 focus:text-white">
                        {categoryLabels[cat] ?? cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Idioma</Label>
                <Input
                  list="template-language-codes"
                  placeholder="pt_PT"
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
                <datalist id="template-language-codes">
                  {COMMON_LANGUAGE_CODES.map((code) => (
                    <option key={code} value={code} />
                  ))}
                </datalist>
                <p className="text-[11px] text-slate-500">
                  Deve corresponder exactamente ao código de idioma aprovado na
                  Meta. Para Portugal use <code>pt_PT</code>; para Brasil use{' '}
                  <code>pt_BR</code>.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Tipo de cabeçalho</Label>
              <Select
                value={form.header_type}
                onValueChange={(val) => setForm({ ...form, header_type: val || '' })}
              >
                <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Nenhum" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="none" className="text-white focus:bg-slate-700 focus:text-white">
                    Nenhum
                  </SelectItem>
                  {HEADER_TYPES.map((type) => (
                    <SelectItem key={type} value={type} className="text-white focus:bg-slate-700 focus:text-white">
                      {headerTypeLabels[type] ?? type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Texto da mensagem</Label>
              <Textarea
                placeholder="Introduza o texto do modelo. Use {{1}}, {{2}} para variáveis."
                value={form.body_text}
                onChange={(e) => setForm({ ...form, body_text: e.target.value })}
                rows={4}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Texto do rodapé</Label>
              <Input
                placeholder="Texto de rodapé opcional"
                value={form.footer_text}
                onChange={(e) => setForm({ ...form, footer_text: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
          </div>

          <DialogFooter className="bg-slate-900 border-slate-700">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  A criar...
                </>
              ) : (
                'Criar modelo'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
