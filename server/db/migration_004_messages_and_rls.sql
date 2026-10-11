-- ============================================================================
-- CREASYNC DATABASE MIGRATION 002: SECURE PARTICIPANT MESSAGING & RLS
-- Enforces strict Row Level Security (RLS) on the messages table.
-- Ensures only verified conversation participants (Brand owner or Creator owner)
-- can read or send messages in valid conversations.
-- Zero permissive bypasses: NO auth.role() = 'anon' or auth.role() = 'authenticated'.
-- ============================================================================

-- 1. Ensure messages table exists with necessary columns and constraints
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('creator', 'brand')),
  sender_name TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for high-performance chronological queries per conversation
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at ASC);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to ensure clean, idempotent migration
DROP POLICY IF EXISTS "Messages participant read" ON public.messages;
DROP POLICY IF EXISTS "Messages participant insert" ON public.messages;
DROP POLICY IF EXISTS "Messages participant update" ON public.messages;
DROP POLICY IF EXISTS "Messages participant delete" ON public.messages;

-- 4. Helper Function: Validate Conversation Mapping & Participant Authorization
-- Maps conversation_id strictly to real invitations or collaborations using exact equality.
-- Checks if p_user_id is the verified owner of the participating brand or creator profile.
-- No substring matching: eliminates token injection and unauthorized access risks.
CREATE OR REPLACE FUNCTION public.is_conversation_participant(
  p_conversation_id TEXT,
  p_user_id UUID,
  p_sender TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    -- Case 1: Conversation anchored by an invitation
    SELECT 1 FROM public.invitations inv
    JOIN public.brands b ON b.id = inv.brand_id
    JOIN public.creator_profiles c ON c.id = inv.creator_id
    WHERE (
      -- Canonical format: conn-${campaign_id}-${creator_id}
      (inv.campaign_id IS NOT NULL AND p_conversation_id = ('conn-' || inv.campaign_id || '-' || inv.creator_id))
      -- Canonical format: conn-${brand_id}-${creator_id}
      OR p_conversation_id = ('conn-' || inv.brand_id || '-' || inv.creator_id)
      -- Direct invitation ID
      OR p_conversation_id = inv.id
    )
    AND (
      CASE 
        WHEN p_sender = 'brand' THEN b.user_id = p_user_id
        WHEN p_sender = 'creator' THEN c.user_id = p_user_id
        ELSE (b.user_id = p_user_id OR c.user_id = p_user_id)
      END
    )

    UNION ALL

    -- Case 2: Conversation anchored by an active collaboration
    SELECT 1 FROM public.collaborations col
    JOIN public.brands b ON b.id = col.brand_id
    JOIN public.creator_profiles c ON c.id = col.creator_id
    WHERE (
      -- Canonical format: conn-${campaign_id}-${creator_id}
      (col.campaign_id IS NOT NULL AND p_conversation_id = ('conn-' || col.campaign_id || '-' || col.creator_id))
      -- Canonical format: conn-${brand_id}-${creator_id}
      OR p_conversation_id = ('conn-' || col.brand_id || '-' || col.creator_id)
      -- Direct collaboration ID
      OR p_conversation_id = col.id
    )
    AND (
      CASE 
        WHEN p_sender = 'brand' THEN b.user_id = p_user_id
        WHEN p_sender = 'creator' THEN c.user_id = p_user_id
        ELSE (b.user_id = p_user_id OR c.user_id = p_user_id)
      END
    )
  );
$$;

-- Security Definer Hardening:
-- Revoke execution from PUBLIC / anon and grant strictly to authenticated users
REVOKE ALL ON FUNCTION public.is_conversation_participant(TEXT, UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_conversation_participant(TEXT, UUID, TEXT) TO authenticated;

-- 5. Participant Read Policy (SELECT)
-- Only authenticated users who are verified participants in the conversation can read messages.
CREATE POLICY "Messages participant read" ON public.messages FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND public.is_conversation_participant(conversation_id, auth.uid(), NULL)
  );

-- 6. Participant Insert Policy (INSERT)
-- Only authenticated users who are the verified sender participant can insert messages.
-- Validates:
--   a) Caller is authenticated (auth.uid() IS NOT NULL)
--   b) Text is non-empty
--   c) Sender is 'creator' or 'brand'
--   d) conversation_id maps exactly to a real invitation or collaboration
--   e) Caller's auth.uid() matches the profile/brand of the specified sender role
CREATE POLICY "Messages participant insert" ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND LENGTH(TRIM(text)) > 0
    AND sender IN ('creator', 'brand')
    AND public.is_conversation_participant(conversation_id, auth.uid(), sender)
  );

-- 7. Ensure Realtime Publication includes messages table (Idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;
