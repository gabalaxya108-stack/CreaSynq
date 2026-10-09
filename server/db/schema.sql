-- ============================================================================
-- CREASYNC PRODUCTION RELATIONAL DATABASE SCHEMA (PostgreSQL / Supabase)
-- Single Source of Truth for Creators, Brands, Campaigns, Portfolios & DNA
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. USER PROFILES TABLE (Linked to Supabase Auth)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('creator', 'brand', 'admin')),
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. CREATOR PROFILES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.creator_profiles (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  handle TEXT NOT NULL UNIQUE,
  creative_identity TEXT,
  bio TEXT,
  specialty TEXT,
  location TEXT,
  availability TEXT DEFAULT 'Available for projects',
  status_badge TEXT DEFAULT 'Available now',
  turnaround TEXT DEFAULT '48h concept frames',
  experience TEXT,
  hero_work TEXT,
  video_preview TEXT,
  avatar TEXT,
  styles TEXT[] DEFAULT '{}',
  industries TEXT[] DEFAULT '{}',
  capabilities TEXT[] DEFAULT '{}',
  tools TEXT[] DEFAULT '{}',
  platforms TEXT[] DEFAULT '{}',
  category_tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'Published' CHECK (status IN ('Draft', 'Published', 'Archived')),
  visibility TEXT NOT NULL DEFAULT 'published' CHECK (visibility IN ('published', 'draft', 'private')),
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creator_profiles_user_id ON public.creator_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_visibility ON public.creator_profiles(visibility);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_specialty ON public.creator_profiles(specialty);

-- ----------------------------------------------------------------------------
-- 3. PORTFOLIO PROJECTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.portfolio_projects (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Visual Art',
  creative_style TEXT,
  tools TEXT,
  format TEXT DEFAULT '4K Stills Suite',
  image TEXT NOT NULL,
  video TEXT,
  aspect TEXT DEFAULT '16:9',
  role TEXT DEFAULT 'Lead Visual Artist',
  client_type TEXT,
  creative_direction TEXT,
  capabilities TEXT[] DEFAULT '{}',
  visibility TEXT NOT NULL DEFAULT 'published' CHECK (visibility IN ('published', 'private')),
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_projects_creator ON public.portfolio_projects(creator_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_visibility ON public.portfolio_projects(visibility);
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_featured ON public.portfolio_projects(featured);

-- ----------------------------------------------------------------------------
-- 4. CREATIVE DNA DOSSIER TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.creative_dna (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE UNIQUE,
  traits TEXT[] DEFAULT '{}',
  visual_aesthetic TEXT,
  storytelling_approach TEXT,
  product_presentation_style TEXT,
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  completeness JSONB NOT NULL DEFAULT '{}'::jsonb,
  source TEXT DEFAULT 'deterministic' CHECK (source IN ('groq', 'deterministic', 'creator_confirmed')),
  is_live_ai BOOLEAN DEFAULT FALSE,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creative_dna_creator ON public.creative_dna(creator_id);

-- ----------------------------------------------------------------------------
-- 5. CREATIVE DNA FEEDBACK TABLE (Creator confirmed/rejected insights)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.creative_dna_feedback (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  insight_key TEXT NOT NULL,
  insight_value TEXT NOT NULL,
  is_confirmed BOOLEAN NOT NULL DEFAULT TRUE,
  creator_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 6. BRANDS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.brands (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  industry TEXT,
  website TEXT,
  logo TEXT,
  cover_image TEXT,
  description TEXT,
  aesthetic TEXT,
  brand_colors TEXT[] DEFAULT '{}',
  preferred_platforms TEXT[] DEFAULT '{}',
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brands_user_id ON public.brands(user_id);

-- ----------------------------------------------------------------------------
-- 7. CAMPAIGNS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.campaigns (
  id TEXT PRIMARY KEY,
  owner_brand_id TEXT NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  brand_avatar TEXT,
  brand_website TEXT,
  title TEXT NOT NULL,
  objective TEXT DEFAULT 'Product Launch',
  product_or_service TEXT,
  industry TEXT,
  description TEXT,
  creative_direction TEXT,
  creative_style TEXT,
  tone_of_voice TEXT,
  desired_creator_specialties TEXT[] DEFAULT '{}',
  deliverables TEXT[] DEFAULT '{}',
  platforms TEXT[] DEFAULT '{}',
  target_platforms TEXT[] DEFAULT '{}',
  content_formats TEXT[] DEFAULT '{}',
  budget TEXT,
  currency TEXT DEFAULT 'USD',
  timeline TEXT,
  deadline TEXT,
  target_audience TEXT,
  cover_image TEXT,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Draft', 'Active', 'Completed', 'Paused', 'Archived')),
  visibility TEXT NOT NULL DEFAULT 'published' CHECK (visibility IN ('published', 'draft', 'archived')),
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_brand ON public.campaigns(owner_brand_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);

-- ----------------------------------------------------------------------------
-- 8. SHORTLISTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shortlists (
  id TEXT PRIMARY KEY,
  brand_id TEXT NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  campaign_id TEXT REFERENCES public.campaigns(id) ON DELETE CASCADE,
  creator_id TEXT NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_shortlist_brand_creator UNIQUE(campaign_id, creator_id)
);

CREATE INDEX IF NOT EXISTS idx_shortlists_campaign ON public.shortlists(campaign_id);
CREATE INDEX IF NOT EXISTS idx_shortlists_brand ON public.shortlists(brand_id);

-- ----------------------------------------------------------------------------
-- 9. INVITATIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invitations (
  id TEXT PRIMARY KEY,
  brand_id TEXT NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  campaign_id TEXT REFERENCES public.campaigns(id) ON DELETE CASCADE,
  creator_id TEXT NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  campaign_title TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  brand_logo TEXT,
  budget TEXT,
  deadline TEXT,
  summary TEXT,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invitations_creator ON public.invitations(creator_id);
CREATE INDEX IF NOT EXISTS idx_invitations_brand ON public.invitations(brand_id);

-- ----------------------------------------------------------------------------
-- 10. COLLABORATIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.collaborations (
  id TEXT PRIMARY KEY,
  brand_id TEXT NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  creator_id TEXT NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  campaign_id TEXT REFERENCES public.campaigns(id) ON DELETE CASCADE,
  campaign_title TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  creator_name TEXT NOT NULL,
  creator_avatar TEXT,
  budget TEXT,
  milestone TEXT DEFAULT 'Milestone 1 of 3',
  deliverables TEXT[] DEFAULT '{}',
  submission_url TEXT,
  submission_notes TEXT,
  revision_notes TEXT,
  status TEXT NOT NULL DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'submitted', 'revision-requested', 'approved', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collaborations_creator ON public.collaborations(creator_id);
CREATE INDEX IF NOT EXISTS idx_collaborations_brand ON public.collaborations(brand_id);

-- ----------------------------------------------------------------------------
-- 11. MESSAGES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('creator', 'brand')),
  sender_name TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Isolation for Creators and Brands
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creative_dna ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creative_dna_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shortlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone authenticated can read basic profile; users can update only their own
CREATE POLICY "Profiles read policy" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Profiles update own policy" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Profiles insert policy" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Creator Profiles:
-- Public can view published creator profiles; owners can view and manage their own
CREATE POLICY "Creators public read" ON public.creator_profiles FOR SELECT
  USING (visibility = 'published' OR auth.uid() = user_id OR is_demo = true);

CREATE POLICY "Creators owner insert" ON public.creator_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Creators owner update" ON public.creator_profiles FOR UPDATE
  USING (auth.uid() = user_id OR is_demo = true);

CREATE POLICY "Creators owner delete" ON public.creator_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Portfolio Projects:
-- Public can only view published projects of published creators
CREATE POLICY "Projects public read" ON public.portfolio_projects FOR SELECT
  USING (
    visibility = 'published' 
    OR EXISTS (
      SELECT 1 FROM public.creator_profiles c 
      WHERE c.id = portfolio_projects.creator_id AND (c.user_id = auth.uid() OR c.is_demo = true)
    )
  );

CREATE POLICY "Projects owner insert" ON public.portfolio_projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.creator_profiles c 
      WHERE c.id = portfolio_projects.creator_id AND (c.user_id = auth.uid() OR c.is_demo = true)
    )
  );

CREATE POLICY "Projects owner update" ON public.portfolio_projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.creator_profiles c 
      WHERE c.id = portfolio_projects.creator_id AND (c.user_id = auth.uid() OR c.is_demo = true)
    )
  );

CREATE POLICY "Projects owner delete" ON public.portfolio_projects FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.creator_profiles c 
      WHERE c.id = portfolio_projects.creator_id AND (c.user_id = auth.uid() OR c.is_demo = true)
    )
  );

-- Creative DNA:
-- Public can read DNA for published creators; owner can update
CREATE POLICY "DNA public read" ON public.creative_dna FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.creator_profiles c 
      WHERE c.id = creative_dna.creator_id AND (c.visibility = 'published' OR c.user_id = auth.uid() OR c.is_demo = true)
    )
  );

CREATE POLICY "DNA owner manage" ON public.creative_dna FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.creator_profiles c 
      WHERE c.id = creative_dna.creator_id AND (c.user_id = auth.uid() OR c.is_demo = true)
    )
  );

-- Brands:
-- Public can view brand name and industry; owners can update their own brand
CREATE POLICY "Brands public read" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Brands owner manage" ON public.brands FOR ALL
  USING (auth.uid() = user_id OR is_demo = true);

-- Campaigns:
-- Published campaigns are discoverable; draft campaigns are visible ONLY to owner brand
CREATE POLICY "Campaigns read policy" ON public.campaigns FOR SELECT
  USING (
    visibility = 'published' 
    OR is_demo = true
    OR EXISTS (
      SELECT 1 FROM public.brands b 
      WHERE b.id = campaigns.owner_brand_id AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "Campaigns owner manage" ON public.campaigns FOR ALL
  USING (
    is_demo = true
    OR EXISTS (
      SELECT 1 FROM public.brands b 
      WHERE b.id = campaigns.owner_brand_id AND b.user_id = auth.uid()
    )
  );

-- Shortlists:
-- Strictly visible and manageable ONLY by the owning brand
CREATE POLICY "Shortlists brand isolation" ON public.shortlists FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.brands b 
      WHERE b.id = shortlists.brand_id AND (b.user_id = auth.uid() OR b.is_demo = true)
    )
  );

-- Invitations:
-- Visible ONLY to the creator who received it or the brand who sent it
CREATE POLICY "Invitations participant isolation" ON public.invitations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.creator_profiles c 
      WHERE c.id = invitations.creator_id AND (c.user_id = auth.uid() OR c.is_demo = true)
    )
    OR EXISTS (
      SELECT 1 FROM public.brands b 
      WHERE b.id = invitations.brand_id AND (b.user_id = auth.uid() OR b.is_demo = true)
    )
  );

CREATE POLICY "Invitations brand send" ON public.invitations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.brands b 
      WHERE b.id = invitations.brand_id AND (b.user_id = auth.uid() OR b.is_demo = true)
    )
  );

CREATE POLICY "Invitations status update" ON public.invitations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.creator_profiles c 
      WHERE c.id = invitations.creator_id AND (c.user_id = auth.uid() OR c.is_demo = true)
    )
    OR EXISTS (
      SELECT 1 FROM public.brands b 
      WHERE b.id = invitations.brand_id AND (b.user_id = auth.uid() OR b.is_demo = true)
    )
  );

-- Collaborations:
-- Strictly isolated to the participating brand and creator
CREATE POLICY "Collaborations participant isolation" ON public.collaborations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.creator_profiles c 
      WHERE c.id = collaborations.creator_id AND (c.user_id = auth.uid() OR c.is_demo = true)
    )
    OR EXISTS (
      SELECT 1 FROM public.brands b 
      WHERE b.id = collaborations.brand_id AND (b.user_id = auth.uid() OR b.is_demo = true)
    )
  );
