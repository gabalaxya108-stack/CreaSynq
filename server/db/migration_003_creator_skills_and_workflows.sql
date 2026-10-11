-- ============================================================================
-- ALLOY CREASYNC INCREMENTAL MIGRATION 003
-- Adds: technical_skills and creative_skills to creator_profiles
-- Adds: workflow_stages and production_workflow to portfolio_projects
-- ============================================================================

-- 1. ADD SKILL CATEGORIES TO CREATOR PROFILES
ALTER TABLE public.creator_profiles 
  ADD COLUMN IF NOT EXISTS technical_skills TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS creative_skills TEXT[] DEFAULT '{}';

COMMENT ON COLUMN public.creator_profiles.technical_skills IS 'AI production capabilities, model configuration, prompting, and technical expertise.';
COMMENT ON COLUMN public.creator_profiles.creative_skills IS 'Artistic direction, visual storytelling, composition, and aesthetic disciplines.';

-- 2. ADD PRODUCTION WORKFLOW TO INDIVIDUAL PORTFOLIO PROJECTS
ALTER TABLE public.portfolio_projects 
  ADD COLUMN IF NOT EXISTS workflow_stages JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS production_workflow JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.portfolio_projects.workflow_stages IS 'Ordered array of dedicated AI production workflow stages for this specific portfolio item.';
COMMENT ON COLUMN public.portfolio_projects.production_workflow IS 'Structured metadata for creative brief, pre-production, AI generation, post-production, and final deliverables.';

-- 3. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_workflow_stages ON public.portfolio_projects USING gin (workflow_stages);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_technical_skills ON public.creator_profiles USING gin (technical_skills);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_creative_skills ON public.creator_profiles USING gin (creative_skills);
