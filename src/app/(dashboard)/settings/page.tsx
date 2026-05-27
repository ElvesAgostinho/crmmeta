'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Settings, MessageSquare, Tag, User } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { WhatsAppConfig } from '@/components/settings/whatsapp-config';
import { TemplateManager } from '@/components/settings/template-manager';
import { TagManager } from '@/components/settings/tag-manager';
import { ProfileForm } from '@/components/settings/profile-form';
import { PasswordForm } from '@/components/settings/password-form';
import { SessionsCard } from '@/components/settings/sessions-card';

const TAB_VALUES = ['profile', 'whatsapp', 'templates', 'tags'] as const;
type TabValue = (typeof TAB_VALUES)[number];

function isTabValue(v: string | null): v is TabValue {
  return !!v && (TAB_VALUES as readonly string[]).includes(v);
}

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryTab = searchParams.get('tab');
  const initialTab = isTabValue(queryTab) ? queryTab : 'profile';
  
  // Use synchronous local state so Tabs update immediately on click,
  // without waiting for the Next.js router transition to complete.
  const [tab, setTab] = useState<TabValue>(initialTab);

  // Sync state if URL changes (e.g. user hits Back/Forward button)
  useEffect(() => {
    const currentUrlTab = isTabValue(queryTab) ? queryTab : 'profile';
    if (tab !== currentUrlTab) {
      setTab(currentUrlTab);
    }
  }, [queryTab]);

  const onChange = (next: TabValue) => {
    setTab(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', next);
    router.replace(`/settings?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Definições</h1>
        <p className="text-sm text-slate-400 mt-1">
          Gerir o seu perfil, a integração com WhatsApp, os modelos de mensagem e
          as etiquetas.
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => onChange(v as TabValue)}>
        <TabsList className="bg-slate-900 border border-slate-700">
          <TabsTrigger
            value="profile"
            className="data-active:bg-slate-800 data-active:text-violet-400 text-slate-400"
          >
            <User className="size-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger
            value="whatsapp"
            className="data-active:bg-slate-800 data-active:text-violet-400 text-slate-400"
          >
            <Settings className="size-4" />
            Configuração do WhatsApp
          </TabsTrigger>
          <TabsTrigger
            value="templates"
            className="data-active:bg-slate-800 data-active:text-violet-400 text-slate-400"
          >
            <MessageSquare className="size-4" />
            Modelos
          </TabsTrigger>
          <TabsTrigger
            value="tags"
            className="data-active:bg-slate-800 data-active:text-violet-400 text-slate-400"
          >
            <Tag className="size-4" />
            Etiquetas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <ProfileForm />
          <PasswordForm />
          <SessionsCard />
        </TabsContent>

        <TabsContent value="whatsapp">
          <WhatsAppConfig />
        </TabsContent>

        <TabsContent value="templates">
          <TemplateManager />
        </TabsContent>

        <TabsContent value="tags">
          <TagManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="text-white p-8">A carregar definições...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
