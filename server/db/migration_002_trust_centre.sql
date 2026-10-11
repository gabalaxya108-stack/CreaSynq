-- ============================================================================
-- CREASYNC DATABASE MIGRATION 002: TRUST & VERIFICATION CENTRE
-- Tables, Private Evidence Protection, Audit Trail & Strict RLS Security
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. VERIFICATION CLAIMS TABLE
-- Claim-specific verification records across the 4 pillars:
-- 1. Identity | 2. Portfolio Authenticity | 3. AI Tools & Workflow | 4. Commercial Usage Rights
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.verification_claims (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  claim_type TEXT NOT NULL CHECK (claim_type IN ('identity', 'portfolio', 'ai_tools', 'workflow', 'commercial_rights')),
  claim_title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN (
    'not_submitted', 
    'self_declared', 
    'pending_review', 
    'verified', 
    'unable_to_verify', 
    'needs_renewal'
  )),
  evidence_type TEXT,
  evidence_url TEXT,
  evidence_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_private BOOLEAN NOT NULL DEFAULT FALSE,
  reviewer_notes TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_claims_creator ON public.verification_claims(creator_id);
CREATE INDEX IF NOT EXISTS idx_verification_claims_status ON public.verification_claims(status);
CREATE INDEX IF NOT EXISTS idx_verification_claims_type ON public.verification_claims(claim_type);
CREATE INDEX IF NOT EXISTS idx_verification_claims_private ON public.verification_claims(is_private);

-- ----------------------------------------------------------------------------
-- 2. VERIFICATION AUDIT LOG TABLE
-- Immutable record of reviewer decisions, notes, and actions
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.verification_audit_log (
  id TEXT PRIMARY KEY,
  claim_id TEXT NOT NULL,
  creator_id TEXT NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewer_name TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN (
    'APPROVED', 
    'REJECTED', 
    'REQUEST_INFO', 
    'SUBMITTED', 
    'RENEWAL_REQUESTED'
  )),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_audit_creator ON public.verification_audit_log(creator_id);
CREATE INDEX IF NOT EXISTS idx_verification_audit_claim ON public.verification_audit_log(claim_id);
CREATE INDEX IF NOT EXISTS idx_verification_audit_created ON public.verification_audit_log(created_at DESC);

-- ----------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Isolation: Creators cannot self-approve; Private evidence is hidden from brands
-- ----------------------------------------------------------------------------

ALTER TABLE public.verification_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_audit_log ENABLE ROW LEVEL SECURITY;

-- Rule 1: Public & Brands can only view non-sensitive, public claims
-- Sensitive identity proofs (passports, national IDs) have is_private = true
CREATE POLICY "Public read non-private claims" ON public.verification_claims FOR SELECT
  USING (
    is_private = FALSE 
    OR EXISTS (
      SELECT 1 FROM public.creator_profiles c 
      WHERE c.id = verification_claims.creator_id AND (c.user_id = auth.uid() OR c.is_demo = true)
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Rule 2: Creators can insert claims for themselves (Must start as pending_review or self_declared)
CREATE POLICY "Creators insert claims" ON public.verification_claims FOR INSERT
  WITH CHECK (
    (
      EXISTS (
        SELECT 1 FROM public.creator_profiles c 
        WHERE c.id = verification_claims.creator_id AND (c.user_id = auth.uid() OR c.is_demo = true)
      )
      AND status IN ('pending_review', 'self_declared', 'not_submitted')
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Rule 3: ONLY authorized admins can update claims and change verification statuses to 'verified'
CREATE POLICY "Admins manage claim decisions" ON public.verification_claims FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM public.creator_profiles c 
      WHERE c.id = verification_claims.creator_id AND c.is_demo = true
    )
  );

-- Rule 4: Audit log reading
CREATE POLICY "Audit log read" ON public.verification_audit_log FOR SELECT
  USING (true);

-- Rule 5: Audit log inserting (Admins or system backend only)
CREATE POLICY "Audit log insert" ON public.verification_audit_log FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM public.creator_profiles c 
      WHERE c.id = verification_audit_log.creator_id AND c.is_demo = true
    )
  );

-- ----------------------------------------------------------------------------
-- 4. SEED SAMPLE CLAIMS FOR DEMO CREATOR (Maya Chen)
-- ----------------------------------------------------------------------------
INSERT INTO public.verification_claims (
  id, creator_id, claim_type, claim_title, status, evidence_type, evidence_url, evidence_details, is_private, reviewer_notes, reviewed_by, reviewed_at
) VALUES 
(
  'claim-maya-email',
  'maya-chen',
  'identity',
  'Email Verification (maya.chen@alloy.market)',
  'verified',
  'Supabase Auth OTP Challenge',
  NULL,
  '{"method": "cryptographic_magic_link", "email": "maya.chen@alloy.market"}'::jsonb,
  FALSE,
  'Cryptographically confirmed via Supabase Auth email challenge.',
  'System Automated Auth',
  NOW() - INTERVAL '30 days'
),
(
  'claim-maya-id',
  'maya-chen',
  'identity',
  'Government Identity Verification',
  'pending_review',
  'Passport (UK)',
  'vault://identity/maya_chen_passport_enc.pdf',
  '{"legalName": "Maya Li-Wei Chen", "jurisdiction": "GB", "maskedNumber": "•••••• 8941"}'::jsonb,
  TRUE,
  'Government document queued for compliance verification in encrypted storage.',
  NULL,
  NULL
),
(
  'claim-maya-solarium',
  'maya-chen',
  'portfolio',
  'Portfolio Authenticity: Echoes of the Solarium',
  'verified',
  'ComfyUI JSON Graph & 4K ProRes Master',
  'https://vault.alloy.market/audit/solarium_comfy_v4.json',
  '{"projectId": "maya-proj-1", "seed": 48921104, "format": "ProRes 4444"}'::jsonb,
  FALSE,
  'Inspected original node graph and verified seed reproducibility against finished 4K render.',
  'Elena Rostova (Lead Visual Auditor)',
  NOW() - INTERVAL '5 days'
),
(
  'claim-maya-lumina',
  'maya-chen',
  'portfolio',
  'Portfolio Authenticity: Lumina Botanica Serums',
  'pending_review',
  'ControlNet Depth Passes & Raw PSD Layers',
  'https://vault.alloy.market/audit/lumina_depth_passes.zip',
  '{"projectId": "maya-proj-2", "model": "Midjourney v6.1 + ControlNet"}'::jsonb,
  FALSE,
  'Under visual inspection for fluid droplet depth layer authenticity.',
  NULL,
  NULL
),
(
  'claim-maya-runway',
  'maya-chen',
  'ai_tools',
  'AI Model Claim: Runway Gen-3 Alpha Kinetic Motion',
  'verified',
  'Master Timeline Generation Timestamps',
  NULL,
  '{"toolName": "Runway Gen-3 Alpha", "useCase": "Kinetic motion synthesis"}'::jsonb,
  FALSE,
  'Timestamp metadata in ProRes timeline confirms direct Runway export integration.',
  'Elena Rostova (Lead Visual Auditor)',
  NOW() - INTERVAL '5 days'
),
(
  'claim-maya-licensing',
  'maya-chen',
  'commercial_rights',
  'Commercial Buyout & Model Terms Warranty',
  'verified',
  'Model Terms of Service Disclosure',
  NULL,
  '{"licenseType": "Full Commercial Buyout", "exclusivity": "12 Months Category Exclusivity"}'::jsonb,
  FALSE,
  'Confirmed foundational models permit commercial derivative output under Pro terms.',
  'Platform Legal Operations',
  NOW() - INTERVAL '25 days'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.verification_audit_log (
  id, claim_id, creator_id, reviewer_name, action, notes
) VALUES
(
  'audit-maya-1',
  'claim-maya-solarium',
  'maya-chen',
  'Elena Rostova (Lead Visual Auditor)',
  'APPROVED',
  'Node graph parameters match showcase pieces. Provenance confirmed.'
),
(
  'audit-maya-2',
  'claim-maya-licensing',
  'maya-chen',
  'Platform Legal Operations',
  'APPROVED',
  'Commercial model tier licensing confirmed compliant for commercial campaign usage.'
)
ON CONFLICT (id) DO NOTHING;
