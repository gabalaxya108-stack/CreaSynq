-- ============================================================================
-- ALLOY SUPER ADMIN & ALLOYTRUST — DATABASE MIGRATION
-- Run AFTER the base schema.sql has been applied
-- Does NOT modify any existing tables — only adds new tables and policies
-- ============================================================================

-- ============================================================================
-- 1. ADMIN ROLES TABLE
-- Explicit super_admin assignments — separate from profiles.role
-- The profiles.role='admin' CHECK already exists in base schema
-- This table adds explicit, auditable admin provisioning
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.admin_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role TEXT NOT NULL DEFAULT 'super_admin' CHECK (role IN ('super_admin', 'judge_admin')),
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_roles_user_id ON public.admin_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_roles_active ON public.admin_roles(is_active);

-- ============================================================================
-- 2. TRUST REPORTS TABLE
-- Core AlloyTrust investigation records
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.trust_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('brand', 'creator', 'campaign', 'collaboration', 'content')),
  entity_id TEXT NOT NULL,
  entity_name TEXT,
  risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_category TEXT DEFAULT 'low' CHECK (risk_category IN ('low', 'medium', 'high', 'critical')),
  evidence_confidence TEXT DEFAULT 'low' CHECK (evidence_confidence IN ('low', 'medium', 'high', 'verified')),
  summary TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN (
    'new', 'needs_review', 'verification_requested', 'under_investigation',
    'cleared', 'restricted', 'resolved'
  )),
  assigned_reviewer UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolution_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trust_reports_entity ON public.trust_reports(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_trust_reports_status ON public.trust_reports(status);
CREATE INDEX IF NOT EXISTS idx_trust_reports_risk ON public.trust_reports(risk_category);
CREATE INDEX IF NOT EXISTS idx_trust_reports_created ON public.trust_reports(created_at DESC);

-- ============================================================================
-- 3. TRUST SIGNALS TABLE
-- Individual evidence items / observations linked to reports
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.trust_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES public.trust_reports(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL CHECK (signal_type IN (
    'rule_match', 'ai_analysis', 'user_report', 'manual_observation',
    'profile_change', 'url_suspicious', 'identity_mismatch',
    'duplicate_content', 'credential_request', 'off_platform_request'
  )),
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT,
  evidence_data JSONB DEFAULT '{}'::jsonb,
  source TEXT DEFAULT 'system' CHECK (source IN ('system', 'ai', 'admin', 'user', 'automated_rule')),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trust_signals_report ON public.trust_signals(report_id);
CREATE INDEX IF NOT EXISTS idx_trust_signals_type ON public.trust_signals(signal_type);

-- ============================================================================
-- 4. TRUST REVIEW DECISIONS TABLE
-- Admin decisions and notes on trust reports — append-only log
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.trust_decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES public.trust_reports(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN (
    'status_change', 'add_note', 'mark_false_positive', 'clear',
    'escalate', 'restrict_account', 'restore_account',
    'restrict_campaign', 'restore_campaign', 'resolve',
    'request_verification', 'assign_reviewer'
  )),
  previous_status TEXT,
  new_status TEXT,
  reason TEXT,
  internal_notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trust_decisions_report ON public.trust_decisions(report_id);
CREATE INDEX IF NOT EXISTS idx_trust_decisions_reviewer ON public.trust_decisions(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_trust_decisions_created ON public.trust_decisions(created_at DESC);

-- ============================================================================
-- 5. AUDIT EVENTS TABLE
-- Append-only administrative action log
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email TEXT,
  actor_role TEXT,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  target_name TEXT,
  reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_events_actor ON public.audit_events(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_action ON public.audit_events(action);
CREATE INDEX IF NOT EXISTS idx_audit_events_target ON public.audit_events(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_created ON public.audit_events(created_at DESC);

-- ============================================================================
-- 6. PLATFORM CONFIGURATION TABLE
-- Admin-managed platform settings
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.platform_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default configuration values
INSERT INTO public.platform_config (config_key, config_value, description) VALUES
  ('trust_observation_period_days', '14'::jsonb, 'Initial observation period for new accounts in days'),
  ('risk_review_threshold', '60'::jsonb, 'Risk score threshold that triggers mandatory review'),
  ('max_profile_changes_per_day', '5'::jsonb, 'Maximum profile changes allowed per day before flagging'),
  ('trust_report_retention_days', '365'::jsonb, 'Days to retain resolved trust reports')
ON CONFLICT (config_key) DO NOTHING;

-- ============================================================================
-- ROW LEVEL SECURITY — ADMIN TABLES
-- Only super_admins can access these tables
-- Regular users (brands, creators) cannot see admin data
-- ============================================================================

-- Helper function: Check if current user is an active super_admin or judge_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'judge_admin')
      AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public, pg_temp;

-- Revoke execute from public; grant explicitly to authenticated users
REVOKE EXECUTE ON FUNCTION public.is_super_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;

-- Defense-in-depth trigger: Prevent ordinary users from escalating profiles.role to 'admin'
CREATE OR REPLACE FUNCTION public.prevent_unauthorized_admin_profile_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'admin' AND (OLD.role IS NULL OR OLD.role <> 'admin') THEN
    IF NOT public.is_super_admin() THEN
      RAISE EXCEPTION 'Access Denied: Administrative role assignments require verified Super Admin authorization.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_prevent_unauthorized_admin_profile ON public.profiles;
CREATE TRIGGER trg_prevent_unauthorized_admin_profile
  BEFORE INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_unauthorized_admin_profile_role();

-- Admin Roles
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin roles read by super_admin" ON public.admin_roles
  FOR SELECT USING (public.is_super_admin());

-- No INSERT/UPDATE/DELETE via RLS for admin_roles
-- Provisioning must use service_role key server-side

-- Trust Reports
ALTER TABLE public.trust_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trust reports read by super_admin" ON public.trust_reports
  FOR SELECT USING (public.is_super_admin());

CREATE POLICY "Trust reports manage by super_admin" ON public.trust_reports
  FOR ALL USING (public.is_super_admin());

-- Trust Signals
ALTER TABLE public.trust_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trust signals read by super_admin" ON public.trust_signals
  FOR SELECT USING (public.is_super_admin());

CREATE POLICY "Trust signals manage by super_admin" ON public.trust_signals
  FOR ALL USING (public.is_super_admin());

-- Trust Decisions
ALTER TABLE public.trust_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trust decisions read by super_admin" ON public.trust_decisions
  FOR SELECT USING (public.is_super_admin());

CREATE POLICY "Trust decisions insert by super_admin" ON public.trust_decisions
  FOR INSERT WITH CHECK (public.is_super_admin());

-- Trust decisions are append-only: no UPDATE or DELETE policies

-- Audit Events
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Audit events read by super_admin" ON public.audit_events
  FOR SELECT USING (public.is_super_admin());

CREATE POLICY "Audit events insert by super_admin" ON public.audit_events
  FOR INSERT WITH CHECK (public.is_super_admin());

-- Audit events are append-only: no UPDATE or DELETE policies

-- Platform Config
ALTER TABLE public.platform_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform config read by super_admin" ON public.platform_config
  FOR SELECT USING (public.is_super_admin());

CREATE POLICY "Platform config manage by super_admin" ON public.platform_config
  FOR ALL USING (public.is_super_admin());
