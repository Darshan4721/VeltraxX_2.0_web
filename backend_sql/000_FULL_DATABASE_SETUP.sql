-- ==============================================================================
-- VELTRAXX 2.0 · MASTER ALL-IN-ONE DATABASE SETUP & HARDENING
-- File: backend_sql/000_FULL_DATABASE_SETUP.sql
-- Status: Production Master (Idempotent, Single-Shot Execution)
-- Description:
--   Consolidates all database tables, columns, indexes, security RPCs,
--   and RLS policies into a single script. Eliminates function overloading
--   ambiguity (Error 42725) and provisions the complete 2-stage hackathon backend.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. SEQUENCES
CREATE SEQUENCE IF NOT EXISTS public.vtx2_team_seq START WITH 1 INCREMENT BY 1;

-- 3. BASE TABLES
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id TEXT UNIQUE NOT NULL,
  team_name TEXT NOT NULL,
  track_id TEXT NOT NULL,
  problem_code TEXT NOT NULL,
  academic_tier TEXT NOT NULL CHECK (academic_tier IN ('tier_a', 'tier_b')),
  team_size INT NOT NULL CHECK (team_size = 3),
  secret_passcode TEXT NOT NULL,
  round1_status TEXT NOT NULL DEFAULT 'pending' CHECK (round1_status IN ('pending', 'shortlisted', 'waitlisted', 'rejected')),
  is_shortlisted BOOLEAN NOT NULL DEFAULT false,
  ppt_pdf_drive_url TEXT,
  extracted_slide_text TEXT,
  ppt_submitted_at TIMESTAMPTZ,
  shortlisted_at TIMESTAMPTZ,
  payment_deadline TIMESTAMPTZ,
  utr_number TEXT,
  payment_screenshot_url TEXT,
  is_paid_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id TEXT NOT NULL REFERENCES public.teams(team_id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  gender TEXT DEFAULT 'Not Specified',
  college_name TEXT NOT NULL,
  department TEXT NOT NULL,
  year_of_study TEXT NOT NULL,
  is_present_checkin BOOLEAN DEFAULT false,
  is_present_audit1 BOOLEAN DEFAULT false,
  is_present_audit2 BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.event_state (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  round1_open BOOLEAN NOT NULL DEFAULT true,
  ppt_submission_open BOOLEAN NOT NULL DEFAULT false,
  round2_payment_open BOOLEAN NOT NULL DEFAULT false,
  round2_fee_per_member INT NOT NULL DEFAULT 500,
  is_clock_public BOOLEAN NOT NULL DEFAULT false,
  clock_state TEXT NOT NULL DEFAULT 'STOPPED' CHECK (clock_state IN ('STOPPED', 'RUNNING', 'PAUSED')),
  live_announcement_text TEXT DEFAULT 'Welcome to VELTRAXX 2.0. The 24-Hour Offline Arena is initializing.',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.event_state (id, round1_open, round2_fee_per_member)
VALUES (1, true, 500)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type TEXT NOT NULL,
  report_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure all columns exist if tables were created previously
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS shortlisted_at TIMESTAMPTZ;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS payment_deadline TIMESTAMPTZ;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS ppt_pdf_drive_url TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS extracted_slide_text TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS ppt_submitted_at TIMESTAMPTZ;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS utr_number TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS payment_screenshot_url TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS is_paid_verified BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'Not Specified';
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS is_present_checkin BOOLEAN DEFAULT false;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS is_present_audit1 BOOLEAN DEFAULT false;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS is_present_audit2 BOOLEAN DEFAULT false;

-- 4. HARDENED INDEXES
CREATE INDEX IF NOT EXISTS idx_teams_team_id ON public.teams (team_id);
CREATE INDEX IF NOT EXISTS idx_teams_shortlist_status ON public.teams (is_shortlisted, round1_status);
CREATE INDEX IF NOT EXISTS idx_teams_deadline_check ON public.teams (is_shortlisted, is_paid_verified, payment_deadline);
CREATE INDEX IF NOT EXISTS idx_members_team_id ON public.members (team_id);
CREATE INDEX IF NOT EXISTS idx_members_lower_email ON public.members (LOWER(TRIM(email)));
CREATE INDEX IF NOT EXISTS idx_members_clean_phone ON public.members (RIGHT(REGEXP_REPLACE(phone, '[^0-9]', '', 'g'), 10));

-- 5. DROP CONFLICTING / OVERLOADED FUNCTIONS (Fixes Error 42725)
DROP FUNCTION IF EXISTS public.admin_update_team_status(TEXT, TEXT, BOOLEAN);
DROP FUNCTION IF EXISTS public.admin_update_team_status(TEXT, TEXT, TEXT, BOOLEAN);
DROP FUNCTION IF EXISTS public.get_coordinator_roster();
DROP FUNCTION IF EXISTS public.get_coordinator_roster(TEXT);
DROP FUNCTION IF EXISTS public.register_free_team(TEXT, TEXT, TEXT, TEXT, INT, JSONB);
DROP FUNCTION IF EXISTS public.submit_round1_ppt(TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.verify_round2_gatekeeper(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.submit_round2_payment(TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.lookup_team_by_contact(TEXT);
DROP FUNCTION IF EXISTS public.admin_delete_team(TEXT);
DROP FUNCTION IF EXISTS public.revoke_expired_seats_and_promote_waitlist();
DROP FUNCTION IF EXISTS public.get_public_capacity();

-- ------------------------------------------------------------------------------
-- 6. RPC 1: register_free_team (Strict 3 Members, Auto-Tiering, No Secret Leak)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.register_free_team(
  p_team_name TEXT,
  p_track_id TEXT,
  p_problem_code TEXT,
  p_academic_tier TEXT,
  p_team_size INT,
  p_members JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seq_val INT;
  v_team_id TEXT;
  v_passcode TEXT;
  v_member JSONB;
  v_member_name TEXT;
  v_member_email TEXT;
  v_member_phone TEXT;
  v_member_year TEXT;
  v_member_level TEXT;
  v_computed_tier TEXT := 'tier_a';
  v_has_senior BOOLEAN := false;
  v_conflict_team_id TEXT;
  v_conflict_team_name TEXT;
  v_emails TEXT[] := ARRAY[]::TEXT[];
  v_phones TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Strict team size check
  IF p_team_size <> 3 OR jsonb_array_length(p_members) <> 3 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Team size must be strictly 3 members (1 Team Leader and 2 Team Members).');
  END IF;

  IF p_team_name IS NULL OR TRIM(p_team_name) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Team name is required.');
  END IF;

  -- Validate each member & check for duplicate registration across platform
  FOR v_member IN SELECT * FROM jsonb_array_elements(p_members)
  LOOP
    v_member_name := COALESCE(NULLIF(TRIM(v_member->>'full_name'), ''), NULLIF(TRIM(v_member->>'name'), ''), 'Participant');
    v_member_email := LOWER(TRIM(COALESCE(v_member->>'email', '')));
    v_member_phone := RIGHT(REGEXP_REPLACE(COALESCE(v_member->>'phone', ''), '[^0-9]', '', 'g'), 10);
    v_member_year := LOWER(TRIM(COALESCE(v_member->>'year_of_study', '')));
    v_member_level := LOWER(TRIM(COALESCE(v_member->>'level', 'ug')));

    IF v_member_email = '' OR v_member_email NOT LIKE '%@%.%' THEN
      RETURN jsonb_build_object('success', false, 'error', 'Valid email address required for "' || v_member_name || '".');
    END IF;

    IF LENGTH(v_member_phone) < 10 THEN
      RETURN jsonb_build_object('success', false, 'error', 'Valid 10-digit phone required for "' || v_member_name || '".');
    END IF;

    -- Duplicate check within squad
    IF v_member_email = ANY(v_emails) THEN
      RETURN jsonb_build_object('success', false, 'error', 'Duplicate email entered inside team roster: ' || v_member_email);
    END IF;
    v_emails := array_append(v_emails, v_member_email);

    IF v_member_phone = ANY(v_phones) THEN
      RETURN jsonb_build_object('success', false, 'error', 'Duplicate phone entered inside team roster: ' || v_member_phone);
    END IF;
    v_phones := array_append(v_phones, v_member_phone);

    -- Cross-team anti-cheat check
    SELECT t.team_id, t.team_name INTO v_conflict_team_id, v_conflict_team_name
    FROM public.members m
    JOIN public.teams t ON t.team_id = m.team_id
    WHERE (LOWER(TRIM(m.email)) = v_member_email OR RIGHT(REGEXP_REPLACE(m.phone, '[^0-9]', '', 'g'), 10) = v_member_phone)
      AND t.round1_status <> 'rejected'
    LIMIT 1;

    IF FOUND THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Member "' || v_member_name || '" (' || v_member_email || ') is already registered with Team ' || v_conflict_team_id || ' ("' || v_conflict_team_name || '"). Multiple team registrations are prohibited.'
      );
    END IF;

    -- Determine seniority
    IF v_member_level IN ('pg', 'research scholar', 'working professional')
       OR v_member_level LIKE '%pg%' OR v_member_level LIKE '%research%' OR v_member_level LIKE '%phd%' OR v_member_level LIKE '%master%'
       OR v_member_year LIKE '3%' OR v_member_year LIKE '4%' OR v_member_year LIKE '5%' OR v_member_year LIKE '%final%' THEN
      v_has_senior := true;
    END IF;
  END LOOP;

  v_computed_tier := CASE WHEN v_has_senior THEN 'tier_b' ELSE 'tier_a' END;

  -- Generate atomic sequential Team ID (e.g. VTX2-001, VTX2-1000)
  v_seq_val := nextval('public.vtx2_team_seq');
  v_team_id := 'VTX2-' || CASE WHEN v_seq_val < 1000 THEN LPAD(v_seq_val::TEXT, 3, '0') ELSE v_seq_val::TEXT END;

  -- Generate random 6-character secret passcode
  v_passcode := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 6));

  -- Insert Team
  INSERT INTO public.teams (
    team_id, team_name, track_id, problem_code, academic_tier, team_size, secret_passcode, round1_status, is_shortlisted
  ) VALUES (
    v_team_id, TRIM(p_team_name), p_track_id, p_problem_code, v_computed_tier, 3, v_passcode, 'pending', false
  );

  -- Insert Members
  FOR v_member IN SELECT * FROM jsonb_array_elements(p_members)
  LOOP
    INSERT INTO public.members (
      team_id, role, name, email, phone, gender, college_name, department, year_of_study
    ) VALUES (
      v_team_id,
      COALESCE(v_member->>'role', 'member'),
      COALESCE(NULLIF(TRIM(v_member->>'full_name'), ''), NULLIF(TRIM(v_member->>'name'), ''), 'Participant'),
      LOWER(TRIM(COALESCE(v_member->>'email', ''))),
      RIGHT(REGEXP_REPLACE(COALESCE(v_member->>'phone', ''), '[^0-9]', '', 'g'), 10),
      COALESCE(v_member->>'gender', 'Not Specified'),
      COALESCE(v_member->>'college_name', 'Not Specified'),
      COALESCE(v_member->>'department', 'Engineering'),
      COALESCE(v_member->>'year_of_study', '1st Year')
    );
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'team_id', v_team_id,
    'team_name', TRIM(p_team_name),
    'academic_tier', v_computed_tier,
    'message', 'Team ' || v_team_id || ' successfully registered for Round 1.'
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- 7. RPC 2: lookup_team_by_contact (Forgot Team ID Lookup Portal)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.lookup_team_by_contact(p_query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clean_query TEXT := LOWER(TRIM(p_query));
  v_clean_phone TEXT := RIGHT(REGEXP_REPLACE(p_query, '[^0-9]', '', 'g'), 10);
  v_team RECORD;
BEGIN
  IF v_clean_query = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Email address or phone number is required.');
  END IF;

  SELECT t.team_id, t.team_name, t.track_id, t.problem_code, t.round1_status, t.academic_tier, t.ppt_pdf_drive_url, t.ppt_submitted_at
  INTO v_team
  FROM public.members m
  JOIN public.teams t ON t.team_id = m.team_id
  WHERE (LOWER(TRIM(m.email)) = v_clean_query OR (LENGTH(v_clean_phone) >= 10 AND RIGHT(REGEXP_REPLACE(m.phone, '[^0-9]', '', 'g'), 10) = v_clean_phone))
    AND t.round1_status <> 'rejected'
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'No active team registration found matching "' || p_query || '".');
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'team_id', v_team.team_id,
    'team_name', v_team.team_name,
    'track_id', v_team.track_id,
    'problem_code', v_team.problem_code,
    'academic_tier', v_team.academic_tier,
    'round1_status', v_team.round1_status,
    'ppt_submitted', (v_team.ppt_submitted_at IS NOT NULL OR v_team.ppt_pdf_drive_url IS NOT NULL)
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- 8. RPC 3: submit_round1_ppt (Saves Presentation PDF & Text Content)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.submit_round1_ppt(
  p_team_id TEXT,
  p_drive_preview_url TEXT,
  p_extracted_text TEXT DEFAULT '',
  p_file_name TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.teams WHERE UPPER(team_id) = UPPER(TRIM(p_team_id))
  ) INTO v_exists;

  IF NOT v_exists THEN
    RETURN jsonb_build_object('success', false, 'error', 'Team ID "' || p_team_id || '" not found. Please verify your Team ID.');
  END IF;

  UPDATE public.teams
  SET ppt_pdf_drive_url = TRIM(p_drive_preview_url),
      extracted_slide_text = p_extracted_text,
      ppt_submitted_at = NOW(),
      updated_at = NOW()
  WHERE UPPER(team_id) = UPPER(TRIM(p_team_id));

  RETURN jsonb_build_object(
    'success', true,
    'team_id', UPPER(TRIM(p_team_id)),
    'message', 'Round 1 presentation blueprint saved successfully.'
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- 9. RPC 4: verify_round2_gatekeeper (Passcode & 36H Deadline Enforcement)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.verify_round2_gatekeeper(
  p_team_id TEXT,
  p_passcode TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_team RECORD;
  v_hours_left NUMERIC := NULL;
  v_fee_per_head INT := 500;
BEGIN
  SELECT round2_fee_per_member INTO v_fee_per_head FROM public.event_state WHERE id = 1;
  IF v_fee_per_head IS NULL THEN v_fee_per_head := 500; END IF;

  SELECT * INTO v_team FROM public.teams WHERE UPPER(team_id) = UPPER(TRIM(p_team_id));
  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Team ID not found in master records.');
  END IF;

  IF NOT v_team.is_shortlisted THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Team ' || v_team.team_id || ' is currently not shortlisted for Round 2.');
  END IF;

  IF UPPER(TRIM(v_team.secret_passcode)) <> UPPER(TRIM(p_passcode)) THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Invalid secret passcode for team ' || v_team.team_id || '.');
  END IF;

  IF NOT v_team.is_paid_verified AND v_team.payment_deadline IS NOT NULL THEN
    IF NOW() > v_team.payment_deadline THEN
      RETURN jsonb_build_object(
        'valid', false,
        'error', 'The 36-hour payment deadline for Team ' || v_team.team_id || ' has expired. Your seat has been forfeited to the waitlist.'
      );
    END IF;
    v_hours_left := ROUND(EXTRACT(EPOCH FROM (v_team.payment_deadline - NOW())) / 3600.0, 1);
  END IF;

  RETURN jsonb_build_object(
    'valid', true,
    'team_id', v_team.team_id,
    'team_name', v_team.team_name,
    'team_size', v_team.team_size,
    'academic_tier', v_team.academic_tier,
    'track_id', v_team.track_id,
    'fee_per_member', v_fee_per_head,
    'total_fee', v_team.team_size * v_fee_per_head,
    'is_paid_verified', v_team.is_paid_verified,
    'submitted_utr', v_team.utr_number,
    'payment_deadline', v_team.payment_deadline,
    'hours_remaining', v_hours_left
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- 10. RPC 5: submit_round2_payment (12-Digit Numeric UTR & Screenshot)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.submit_round2_payment(
  p_team_id TEXT,
  p_passcode TEXT,
  p_utr_number TEXT,
  p_screenshot_url TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_valid BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.teams
    WHERE UPPER(team_id) = UPPER(TRIM(p_team_id))
      AND UPPER(secret_passcode) = UPPER(TRIM(p_passcode))
      AND is_shortlisted = true
  ) INTO v_valid;

  IF NOT v_valid THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Invalid team credentials.');
  END IF;

  IF LENGTH(TRIM(p_utr_number)) <> 12 OR TRIM(p_utr_number) !~ '^[0-9]+$' THEN
    RETURN jsonb_build_object('success', false, 'error', 'UTR number must be exactly 12 numeric digits.');
  END IF;

  UPDATE public.teams
  SET utr_number = TRIM(p_utr_number),
      payment_screenshot_url = TRIM(p_screenshot_url),
      updated_at = NOW()
  WHERE UPPER(team_id) = UPPER(TRIM(p_team_id));

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Round 2 confirmation and payment details submitted for verification.'
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- 11. RPC 6: revoke_expired_seats_and_promote_waitlist (Automated FIFO Promotion)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.revoke_expired_seats_and_promote_waitlist()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_expired RECORD;
  v_waitlist RECORD;
  v_revoked_count INT := 0;
  v_promoted_count INT := 0;
  v_revoked_teams TEXT[] := ARRAY[]::TEXT[];
  v_promoted_teams TEXT[] := ARRAY[]::TEXT[];
BEGIN
  FOR v_expired IN 
    SELECT team_id, team_name 
    FROM public.teams 
    WHERE is_shortlisted = true 
      AND is_paid_verified = false 
      AND payment_deadline IS NOT NULL 
      AND NOW() > payment_deadline
    ORDER BY payment_deadline ASC
  LOOP
    UPDATE public.teams 
    SET is_shortlisted = false,
        round1_status = 'waitlisted',
        payment_deadline = NULL,
        updated_at = NOW()
    WHERE team_id = v_expired.team_id;

    v_revoked_count := v_revoked_count + 1;
    v_revoked_teams := array_append(v_revoked_teams, v_expired.team_id);

    SELECT team_id INTO v_waitlist
    FROM public.teams
    WHERE round1_status = 'waitlisted' 
      AND is_shortlisted = false
      AND NOT (team_id = ANY(v_revoked_teams))
    ORDER BY created_at ASC
    LIMIT 1;

    IF FOUND THEN
      UPDATE public.teams
      SET is_shortlisted = true,
          round1_status = 'shortlisted',
          shortlisted_at = NOW(),
          payment_deadline = NOW() + INTERVAL '36 hours',
          updated_at = NOW()
      WHERE team_id = v_waitlist.team_id;

      v_promoted_count := v_promoted_count + 1;
      v_promoted_teams := array_append(v_promoted_teams, v_waitlist.team_id);
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'revoked_count', v_revoked_count,
    'revoked_teams', v_revoked_teams,
    'promoted_count', v_promoted_count,
    'promoted_teams', v_promoted_teams,
    'message', 'Revoked ' || v_revoked_count || ' expired seat(s) and promoted ' || v_promoted_count || ' waitlist squad(s).'
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- 12. RPC 7: get_coordinator_roster (Secure Coordinator Dashboard Feed)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_coordinator_roster()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_roster JSONB;
BEGIN
  IF auth.role() <> 'authenticated' THEN
    RAISE EXCEPTION 'Access denied. Authenticated coordinator session required.';
  END IF;

  SELECT jsonb_agg(
    jsonb_build_object(
      'team_id', t.team_id,
      'team_name', t.team_name,
      'track_id', t.track_id,
      'problem_code', t.problem_code,
      'academic_tier', t.academic_tier,
      'team_size', t.team_size,
      'round1_status', t.round1_status,
      'is_shortlisted', t.is_shortlisted,
      'secret_passcode', t.secret_passcode,
      'ppt_pdf_drive_url', t.ppt_pdf_drive_url,
      'extracted_slide_text', t.extracted_slide_text,
      'ppt_submitted_at', t.ppt_submitted_at,
      'shortlisted_at', t.shortlisted_at,
      'payment_deadline', t.payment_deadline,
      'utr_number', t.utr_number,
      'payment_screenshot_url', t.payment_screenshot_url,
      'is_paid_verified', t.is_paid_verified,
      'created_at', t.created_at,
      'members', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'role', m.role,
            'full_name', m.name,
            'name', m.name,
            'email', m.email,
            'phone', m.phone,
            'college_name', m.college_name,
            'department', m.department,
            'year_of_study', m.year_of_study
          ) ORDER BY (m.role = 'leader') DESC
        )
        FROM public.members m
        WHERE m.team_id = t.team_id
      )
    ) ORDER BY t.created_at DESC
  ) INTO v_roster
  FROM public.teams t;

  RETURN COALESCE(v_roster, '[]'::JSONB);
END;
$$;

-- ------------------------------------------------------------------------------
-- 13. RPC 8: admin_update_team_status (Shortlist & Set 36H Payment Clock)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_update_team_status(
  p_team_id TEXT,
  p_status TEXT,
  p_is_shortlisted BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_team RECORD;
  v_shortlisted_at TIMESTAMPTZ;
  v_deadline TIMESTAMPTZ;
BEGIN
  IF auth.role() <> 'authenticated' THEN
    RAISE EXCEPTION 'Access denied. Authenticated coordinator session required.';
  END IF;

  SELECT * INTO v_team FROM public.teams WHERE UPPER(team_id) = UPPER(TRIM(p_team_id));
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Team not found.');
  END IF;

  IF p_is_shortlisted THEN
    v_shortlisted_at := COALESCE(v_team.shortlisted_at, NOW());
    v_deadline := COALESCE(v_team.payment_deadline, NOW() + INTERVAL '36 hours');
  ELSE
    v_shortlisted_at := NULL;
    v_deadline := NULL;
  END IF;

  UPDATE public.teams
  SET round1_status = p_status,
      is_shortlisted = p_is_shortlisted,
      shortlisted_at = v_shortlisted_at,
      payment_deadline = v_deadline,
      updated_at = NOW()
  WHERE UPPER(team_id) = UPPER(TRIM(p_team_id));

  RETURN jsonb_build_object(
    'success', true,
    'team_id', v_team.team_id,
    'round1_status', p_status,
    'is_shortlisted', p_is_shortlisted,
    'shortlisted_at', v_shortlisted_at,
    'payment_deadline', v_deadline
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- 14. RPC 9: admin_delete_team (Permanent Cascading Deletion of Test Teams)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_delete_team(p_team_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted_count INT;
BEGIN
  IF auth.role() <> 'authenticated' THEN
    RAISE EXCEPTION 'Access denied. Authenticated coordinator session required.';
  END IF;

  DELETE FROM public.teams 
  WHERE UPPER(TRIM(team_id)) = UPPER(TRIM(p_team_id));
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  IF v_deleted_count = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Team ' || p_team_id || ' not found or already deleted.');
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'deleted_count', v_deleted_count,
    'team_id', p_team_id,
    'message', 'Team ' || p_team_id || ' permanently deleted.'
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- 15. RPC 10: get_public_capacity
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_public_capacity()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_claimed INT;
  v_event RECORD;
BEGIN
  SELECT * INTO v_event FROM public.event_state WHERE id = 1;
  SELECT COUNT(*) INTO v_total_claimed FROM public.teams WHERE round1_status <> 'rejected';

  RETURN jsonb_build_object(
    'total_claimed', COALESCE(v_total_claimed, 0),
    'capacity', 2000,
    'round1_open', COALESCE(v_event.round1_open, true),
    'round2_fee_per_member', COALESCE(v_event.round2_fee_per_member, 500)
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- 16. ROW LEVEL SECURITY (RLS) & STRICT ACCESS ISOLATION
-- ------------------------------------------------------------------------------
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read user report status" ON public.user_reports;
DROP POLICY IF EXISTS "Public read event state" ON public.event_state;
DROP POLICY IF EXISTS "Authenticated full control teams" ON public.teams;
DROP POLICY IF EXISTS "Authenticated full control members" ON public.members;
DROP POLICY IF EXISTS "Authenticated full control reports" ON public.user_reports;
DROP POLICY IF EXISTS "Authenticated full control event state" ON public.event_state;

CREATE POLICY "Public read event state" ON public.event_state
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated full control teams" ON public.teams
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated full control members" ON public.members
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated full control reports" ON public.user_reports
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated full control event state" ON public.event_state
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 17. EXPLICIT RPC EXECUTION GRANTS (Signatures Specified - Zero Ambiguity)
-- ------------------------------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.register_free_team(TEXT, TEXT, TEXT, TEXT, INT, JSONB) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.lookup_team_by_contact(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_round1_ppt(TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_round2_gatekeeper(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_round2_payment(TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_capacity() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_expired_seats_and_promote_waitlist() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_coordinator_roster() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_team_status(TEXT, TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_team(TEXT) TO authenticated;
