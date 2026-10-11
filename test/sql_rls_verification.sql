-- ============================================================================
-- CREASYNC POSTGRESQL DATABASE-LEVEL RLS VERIFICATION TEST SUITE
-- Executes directly in Supabase SQL Editor or psql to verify PostgreSQL RLS.
-- Runs inside a self-contained transaction (ROLLBACK at the end).
-- Tests:
--   1. Legitimate Brand Insert & Read
--   2. Legitimate Creator Insert & Read
--   3. Unauthorized Outsider Read (returns 0 rows via RLS)
--   4. Unauthorized Outsider Insert (rejected by WITH CHECK)
--   5. Sender Spoofing: Creator sends with sender = 'brand' (rejected)
--   6. Sender Spoofing: Brand sends with sender = 'creator' (rejected)
--   7. Invalid Conversation ID (unmapped thread, rejected)
--   8. Substring Spoofing Attack (conversation ID with creator substring, rejected)
--   9. Anonymous Role Access (rejected)
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- STEP 0: Set Up Fixtures for Testing
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  v_brand_uid UUID := 'a0000000-0000-0000-0000-000000000001';
  v_creator_uid UUID := 'b0000000-0000-0000-0000-000000000002';
  v_outsider_uid UUID := 'c0000000-0000-0000-0000-000000000003';
BEGIN
  -- Insert dummy auth users if auth.users exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    INSERT INTO auth.users (id, email)
    VALUES 
      (v_brand_uid, 'test-brand@creasync.test'),
      (v_creator_uid, 'test-creator@creasync.test'),
      (v_outsider_uid, 'test-outsider@creasync.test')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Insert profiles
  INSERT INTO public.profiles (id, role, email, display_name)
  VALUES 
    (v_brand_uid, 'brand', 'test-brand@creasync.test', 'Test Brand Owner'),
    (v_creator_uid, 'creator', 'test-creator@creasync.test', 'Test Creator Owner'),
    (v_outsider_uid, 'creator', 'test-outsider@creasync.test', 'Test Outsider')
  ON CONFLICT (id) DO NOTHING;

  -- Insert brand and creator records
  INSERT INTO public.brands (id, user_id, name, is_demo)
  VALUES ('brand-test-lumina', v_brand_uid, 'Lumina Test Brand', FALSE)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.creator_profiles (id, user_id, name, handle, is_demo)
  VALUES ('creator-test-maya', v_creator_uid, 'Maya Test Creator', '@mayatest', FALSE)
  ON CONFLICT (id) DO NOTHING;

  -- Insert campaign
  INSERT INTO public.campaigns (id, owner_brand_id, brand_name, title, is_demo)
  VALUES ('camp-test-summer', 'brand-test-lumina', 'Lumina Test Brand', 'Summer Campaign', FALSE)
  ON CONFLICT (id) DO NOTHING;

  -- Insert invitation linking brand and creator
  INSERT INTO public.invitations (
    id, brand_id, campaign_id, creator_id, campaign_title, brand_name, status, is_demo
  )
  VALUES (
    'inv-test-999',
    'brand-test-lumina',
    'camp-test-summer',
    'creator-test-maya',
    'Summer Campaign',
    'Lumina Test Brand',
    'Pending',
    FALSE
  )
  ON CONFLICT (id) DO NOTHING;
END $$;

-- ----------------------------------------------------------------------------
-- TEST 1: Legitimate Brand Participant Can Insert Message
-- ----------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" = 'a0000000-0000-0000-0000-000000000001';

INSERT INTO public.messages (id, conversation_id, sender, sender_name, text, created_at)
VALUES (
  'msg-t1-brand',
  'conn-camp-test-summer-creator-test-maya',
  'brand',
  'Lumina Test Brand',
  'Hello Maya, we invite you to collaborate on our Summer campaign.',
  NOW()
);

-- ----------------------------------------------------------------------------
-- TEST 2: Legitimate Creator Participant Can Read Brand's Message
-- ----------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" = 'b0000000-0000-0000-0000-000000000002';

DO $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.messages
  WHERE conversation_id = 'conn-camp-test-summer-creator-test-maya';

  IF v_count <> 1 THEN
    RAISE EXCEPTION 'TEST 2 FAILED: Creator should be able to read 1 message, got %', v_count;
  END IF;
  RAISE NOTICE 'TEST 2 PASSED: Creator successfully read legitimate message.';
END $$;

-- ----------------------------------------------------------------------------
-- TEST 3: Legitimate Creator Participant Can Reply
-- ----------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" = 'b0000000-0000-0000-0000-000000000002';

INSERT INTO public.messages (id, conversation_id, sender, sender_name, text, created_at)
VALUES (
  'msg-t3-creator',
  'conn-camp-test-summer-creator-test-maya',
  'creator',
  'Maya Test Creator',
  'Thank you Lumina! I am excited to collaborate on this.',
  NOW()
);

-- ----------------------------------------------------------------------------
-- TEST 4: Unauthorized Outsider CANNOT Read Messages (RLS Filter)
-- ----------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" = 'c0000000-0000-0000-0000-000000000003';

DO $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.messages
  WHERE conversation_id = 'conn-camp-test-summer-creator-test-maya';

  IF v_count <> 0 THEN
    RAISE EXCEPTION 'TEST 4 FAILED: Outsider read % messages! RLS violation!', v_count;
  END IF;
  RAISE NOTICE 'TEST 4 PASSED: Outsider read blocked by RLS (0 rows returned).';
END $$;

-- ----------------------------------------------------------------------------
-- TEST 5: Unauthorized Outsider CANNOT Insert Message (WITH CHECK Rejection)
-- ----------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" = 'c0000000-0000-0000-0000-000000000003';

DO $$
DECLARE
  v_caught BOOLEAN := FALSE;
BEGIN
  BEGIN
    INSERT INTO public.messages (id, conversation_id, sender, sender_name, text, created_at)
    VALUES (
      'msg-t5-outsider',
      'conn-camp-test-summer-creator-test-maya',
      'brand',
      'Intruder',
      'Unauthorized eavesdropping message.',
      NOW()
    );
  EXCEPTION WHEN insufficient_privilege OR row_security_policy_violating_error THEN
    v_caught := TRUE;
  END;

  IF NOT v_caught THEN
    RAISE EXCEPTION 'TEST 5 FAILED: Outsider was able to insert message!';
  END IF;
  RAISE NOTICE 'TEST 5 PASSED: Outsider insert blocked by RLS.';
END $$;

-- ----------------------------------------------------------------------------
-- TEST 6: Sender Spoofing - Creator Cannot Insert As 'brand'
-- ----------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" = 'b0000000-0000-0000-0000-000000000002';

DO $$
DECLARE
  v_caught BOOLEAN := FALSE;
BEGIN
  BEGIN
    INSERT INTO public.messages (id, conversation_id, sender, sender_name, text, created_at)
    VALUES (
      'msg-t6-spoof-brand',
      'conn-camp-test-summer-creator-test-maya',
      'brand',
      'Maya Pretending to be Brand',
      'I am claiming to be the brand sender.',
      NOW()
    );
  EXCEPTION WHEN insufficient_privilege OR row_security_policy_violating_error THEN
    v_caught := TRUE;
  END;

  IF NOT v_caught THEN
    RAISE EXCEPTION 'TEST 6 FAILED: Creator spoofed brand sender!';
  END IF;
  RAISE NOTICE 'TEST 6 PASSED: Creator cannot spoof brand sender.';
END $$;

-- ----------------------------------------------------------------------------
-- TEST 7: Sender Spoofing - Brand Cannot Insert As 'creator'
-- ----------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" = 'a0000000-0000-0000-0000-000000000001';

DO $$
DECLARE
  v_caught BOOLEAN := FALSE;
BEGIN
  BEGIN
    INSERT INTO public.messages (id, conversation_id, sender, sender_name, text, created_at)
    VALUES (
      'msg-t7-spoof-creator',
      'conn-camp-test-summer-creator-test-maya',
      'creator',
      'Brand Pretending to be Creator',
      'I am claiming to be the creator sender.',
      NOW()
    );
  EXCEPTION WHEN insufficient_privilege OR row_security_policy_violating_error THEN
    v_caught := TRUE;
  END;

  IF NOT v_caught THEN
    RAISE EXCEPTION 'TEST 7 FAILED: Brand spoofed creator sender!';
  END IF;
  RAISE NOTICE 'TEST 7 PASSED: Brand cannot spoof creator sender.';
END $$;

-- ----------------------------------------------------------------------------
-- TEST 8: Invalid Conversation ID Cannot Be Used For Insert
-- ----------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" = 'a0000000-0000-0000-0000-000000000001';

DO $$
DECLARE
  v_caught BOOLEAN := FALSE;
BEGIN
  BEGIN
    INSERT INTO public.messages (id, conversation_id, sender, sender_name, text, created_at)
    VALUES (
      'msg-t8-invalid-conn',
      'conn-fabricated-ghost-id-999',
      'brand',
      'Lumina Test Brand',
      'Sending to unmapped conversation.',
      NOW()
    );
  EXCEPTION WHEN insufficient_privilege OR row_security_policy_violating_error THEN
    v_caught := TRUE;
  END;

  IF NOT v_caught THEN
    RAISE EXCEPTION 'TEST 8 FAILED: Message inserted into unmapped conversation ID!';
  END IF;
  RAISE NOTICE 'TEST 8 PASSED: Fabricated conversation ID rejected.';
END $$;

-- ----------------------------------------------------------------------------
-- TEST 9: Substring Spoofing Attack Is Rejected
-- (Creator ID present in string, but not matching exact canonical format)
-- ----------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" = 'a0000000-0000-0000-0000-000000000001';

DO $$
DECLARE
  v_caught BOOLEAN := FALSE;
BEGIN
  BEGIN
    INSERT INTO public.messages (id, conversation_id, sender, sender_name, text, created_at)
    VALUES (
      'msg-t9-substring-attack',
      'conn-hacker-thread-containing-creator-test-maya-in-middle',
      'brand',
      'Lumina Test Brand',
      'Attempting substring bypass.',
      NOW()
    );
  EXCEPTION WHEN insufficient_privilege OR row_security_policy_violating_error THEN
    v_caught := TRUE;
  END;

  IF NOT v_caught THEN
    RAISE EXCEPTION 'TEST 9 FAILED: Substring spoofing was NOT rejected!';
  END IF;
  RAISE NOTICE 'TEST 9 PASSED: Substring-based conversation ID attack rejected.';
END $$;

-- ----------------------------------------------------------------------------
-- TEST 10: Anonymous Role Cannot Read or Insert
-- ----------------------------------------------------------------------------
SET LOCAL ROLE anon;

DO $$
DECLARE
  v_count INT;
  v_caught BOOLEAN := FALSE;
BEGIN
  -- Read test
  SELECT COUNT(*) INTO v_count
  FROM public.messages
  WHERE conversation_id = 'conn-camp-test-summer-creator-test-maya';

  IF v_count <> 0 THEN
    RAISE EXCEPTION 'TEST 10 FAILED: Anonymous user was able to read % messages!', v_count;
  END IF;

  -- Insert test
  BEGIN
    INSERT INTO public.messages (id, conversation_id, sender, sender_name, text, created_at)
    VALUES (
      'msg-t10-anon',
      'conn-camp-test-summer-creator-test-maya',
      'brand',
      'Anonymous Intruder',
      'Anonymous insert.',
      NOW()
    );
  EXCEPTION WHEN insufficient_privilege OR row_security_policy_violating_error THEN
    v_caught := TRUE;
  END;

  IF NOT v_caught THEN
    RAISE EXCEPTION 'TEST 10 FAILED: Anonymous user was able to insert message!';
  END IF;

  RAISE NOTICE 'TEST 10 PASSED: Anonymous read and insert strictly denied.';
END $$;

-- ----------------------------------------------------------------------------
-- ROLLBACK TO LEAVE DATABASE UNTOUCHED
-- ----------------------------------------------------------------------------
ROLLBACK;
RAISE NOTICE 'ALL DATABASE RLS TESTS COMPLETED SUCCESSFULLY. Transaction rolled back cleanly.';
