-- ============================================================================
-- ALLOY CREASYNC INCREMENTAL MIGRATION 001
-- Adds: creator_workflows, activity_logs, collaboration & deliverable fields, RLS
-- ============================================================================

-- 1. CREATOR WORKFLOWS TABLE
CREATE TABLE IF NOT EXISTS public.creator_workflows (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  specialization TEXT,
  linked_project_id TEXT REFERENCES public.portfolio_projects(id) ON DELETE SET NULL,
  linked_project_title TEXT,
  status TEXT NOT NULL DEFAULT 'Published' CHECK (status IN ('Draft', 'Published', 'Archived')),
  visibility TEXT NOT NULL DEFAULT 'published' CHECK (visibility IN ('published', 'draft', 'private')),
  human_involvement_notes TEXT,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creator_workflows_creator ON public.creator_workflows(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_workflows_visibility ON public.creator_workflows(visibility);

-- 2. ACTIVITY LOGS AUDIT TABLE
-- Strictly logs actions without storing passwords, tokens, or auth secrets.
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_role TEXT NOT NULL CHECK (actor_role IN ('creator', 'brand', 'system', 'admin')),
  actor_name TEXT NOT NULL,
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.activity_logs(created_at DESC);

-- 3. COLLABORATIONS TABLE ENHANCEMENTS
ALTER TABLE public.collaborations ADD COLUMN IF NOT EXISTS progress_percent INT DEFAULT 0;
ALTER TABLE public.collaborations ADD COLUMN IF NOT EXISTS deadline TEXT;
ALTER TABLE public.collaborations ADD COLUMN IF NOT EXISTS agreed_budget TEXT;
ALTER TABLE public.collaborations ADD COLUMN IF NOT EXISTS deliverables_scope TEXT;
ALTER TABLE public.collaborations ADD COLUMN IF NOT EXISTS latest_feedback TEXT;
ALTER TABLE public.collaborations ADD COLUMN IF NOT EXISTS brand_contact TEXT;
ALTER TABLE public.collaborations ADD COLUMN IF NOT EXISTS submission_previews TEXT[] DEFAULT '{}';
ALTER TABLE public.collaborations ADD COLUMN IF NOT EXISTS feedback_history JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.collaborations ADD COLUMN IF NOT EXISTS revision_history JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.collaborations ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;

-- 4. INVITATIONS TABLE ENHANCEMENTS
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS creator_name TEXT;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS creator_avatar TEXT;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS timeline TEXT;
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;

-- 5. PORTFOLIO PROJECTS ENHANCEMENTS
ALTER TABLE public.portfolio_projects ADD COLUMN IF NOT EXISTS media JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.portfolio_projects ADD COLUMN IF NOT EXISTS workflow_id TEXT REFERENCES public.creator_workflows(id) ON DELETE SET NULL;

-- 6. ROW LEVEL SECURITY (RLS) FOR NEW TABLES
ALTER TABLE public.creator_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Workflows: Public can view published workflows; owner can manage all
CREATE POLICY "Workflows public read" ON public.creator_workflows FOR SELECT
  USING (
    visibility = 'published' 
    OR is_demo = true
    OR EXISTS (
      SELECT 1 FROM public.creator_profiles c 
      WHERE c.id = creator_workflows.creator_id AND (c.user_id = auth.uid() OR c.is_demo = true)
    )
  );

CREATE POLICY "Workflows owner insert" ON public.creator_workflows FOR INSERT
  WITH CHECK (
    is_demo = true
    OR EXISTS (
      SELECT 1 FROM public.creator_profiles c 
      WHERE c.id = creator_workflows.creator_id AND (c.user_id = auth.uid() OR c.is_demo = true)
    )
  );

CREATE POLICY "Workflows owner update" ON public.creator_workflows FOR UPDATE
  USING (
    is_demo = true
    OR EXISTS (
      SELECT 1 FROM public.creator_profiles c 
      WHERE c.id = creator_workflows.creator_id AND (c.user_id = auth.uid() OR c.is_demo = true)
    )
  );

CREATE POLICY "Workflows owner delete" ON public.creator_workflows FOR DELETE
  USING (
    is_demo = true
    OR EXISTS (
      SELECT 1 FROM public.creator_profiles c 
      WHERE c.id = creator_workflows.creator_id AND (c.user_id = auth.uid() OR c.is_demo = true)
    )
  );

-- Activity Logs: Authenticated users can insert logs; relevant actors can view
CREATE POLICY "Activity logs read" ON public.activity_logs FOR SELECT
  USING (
    auth.uid() = user_id 
    OR user_id IS NULL
  );

CREATE POLICY "Activity logs insert" ON public.activity_logs FOR INSERT
  WITH CHECK (true);

-- 7. REALTIME REPLICATION SETUP
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.invitations;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.collaborations;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.campaigns;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;
