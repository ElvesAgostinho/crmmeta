-- ============================================================
-- 013: SaaS Roles, Subscriptions, Access Requests, App Settings
-- ============================================================

-- Enum: user roles
CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'user');

-- Enum: subscription status
CREATE TYPE subscription_status AS ENUM ('pending', 'active', 'blocked', 'demo', 'expired');

-- Enum: subscription plan
CREATE TYPE subscription_plan AS ENUM ('basic', 'medium');

-- Enum: billing cycle
CREATE TYPE billing_cycle AS ENUM ('daily', 'monthly', 'annual');

-- Enum: access request status
CREATE TYPE access_request_status AS ENUM ('pending', 'approved', 'rejected');

-- ── Table: user_roles ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_roles (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        user_role NOT NULL DEFAULT 'user',
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Only superadmins can read/write roles (server-side via service role)
CREATE POLICY "service_role_only_user_roles"
  ON public.user_roles
  FOR ALL
  USING (false);

-- ── Table: subscriptions ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan               subscription_plan NOT NULL DEFAULT 'basic',
  status             subscription_status NOT NULL DEFAULT 'pending',
  billing_cycle      billing_cycle NOT NULL DEFAULT 'monthly',
  expires_at         timestamptz,
  modules_enabled    jsonb NOT NULL DEFAULT '{
    "inbox": true,
    "contacts": true,
    "pipelines": false,
    "automations": false,
    "broadcasts": false,
    "flows": false,
    "analytics": true,
    "embedded_signup": false
  }'::jsonb,
  notes              text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscription
CREATE POLICY "users_read_own_subscription"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can write
CREATE POLICY "service_role_only_subscriptions_write"
  ON public.subscriptions
  FOR ALL
  USING (false);

-- ── Table: access_requests ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.access_requests (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  email       text NOT NULL,
  phone       text,
  company     text,
  plan        subscription_plan NOT NULL DEFAULT 'basic',
  message     text,
  status      access_request_status NOT NULL DEFAULT 'pending',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

-- Public insert (anyone can request access)
CREATE POLICY "public_insert_access_requests"
  ON public.access_requests
  FOR INSERT
  WITH CHECK (true);

-- Only service role can read/update
CREATE POLICY "service_role_read_access_requests"
  ON public.access_requests
  FOR SELECT
  USING (false);

-- ── Table: app_settings ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.app_settings (
  key         text PRIMARY KEY,
  value       jsonb NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read settings
CREATE POLICY "authenticated_read_app_settings"
  ON public.app_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can write
CREATE POLICY "service_role_write_app_settings"
  ON public.app_settings
  FOR ALL
  USING (false);

-- ── Seed: default app settings ───────────────────────────────
INSERT INTO public.app_settings (key, value)
VALUES ('embedded_signup_enabled', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ── Index for performance ─────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_access_requests_status ON public.access_requests(status);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
