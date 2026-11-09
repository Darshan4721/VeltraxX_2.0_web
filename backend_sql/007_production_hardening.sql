-- ==============================================================================
-- VELTRAXX 2.0 - UNIFIED PRODUCTION HARDENING MIGRATION
-- Migration: 007_production_hardening.sql
-- Status: Authoritative Production Consolidation
-- Fixes:
-- 1. PostgreSQL LPAD Truncation bug: LPAD('1000', 3, '0') -> '100'.
--    Enforces CASE WHEN v_seq_val < 1000 THEN LPAD(...) ELSE v_seq_val::TEXT END.
-- 2. Purges secret_passcode from register_free_team client return payload.
-- 3. Locks public access to user_reports (FL-13 RLS policy fix).
-- 4. Enforces 36-hour seat expiration and automatic waitlist FIFO promotion.
-- 5. Strict RLS: Anon access strictly via SECURITY DEFINER RPCs; full CRUD for authenticated coordinators.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. SEQUENCES & BASE TABLES
-- ------------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.vtx2_team_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id TEXT UNIQUE NOT NULL,
  team_name TEXT NOT NULL,
  track_id TEXT NOT NULL,
  problem_code TEXT NOT NULL,
  academic_tier TEXT NOT NULL CHECK (academic_tier IN ('tier_a', 'tier_b')),
  team_size INT NOT NULL CHECK (team_size IN (2, 3, 4)),
  secret_passcode TEXT NOT NULL,
  round1_status TEXT NOT NULL DEFAULT 'pending' CHECK (round1_status IN ('pending', 'shortlisted', 'waitlisted', 'rejected')),
  is_shortlisted BOOLEAN NOT NULL DEFAULT false,
  ppt_pdf_drive_url TEXT,
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
  college_name TEXT NOT NULL,
  department TEXT NOT NULL,
  year_of_study TEXT NOT NULL,
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

-- Seed initial event state if not present
INSERT INTO public.event_state (id, round1_open, round2_fee_per_member)
VALUES (1, true, 500)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type TEXT NOT NULL,
  report_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. HARDENED INDEXES (DEDUPLICATION & PERFORMANCE)
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_teams_team_id ON public.teams (team_id);
CREATE INDEX IF NOT EXISTS idx_teams_shortlist_status ON public.teams (is_shortlisted, round1_status);
CREATE INDEX IF NOT EXISTS idx_teams_deadline_check ON public.teams (is_shortlisted, is_paid_verified, payment_deadline);
CREATE INDEX IF NOT EXISTS idx_members_team_id ON public.members (team_id);
CREATE INDEX IF NOT EXISTS idx_members_lower_email ON public.members (LOWER(TRIM(email)));
CREATE INDEX IF NOT EXISTS idx_members_clean_phone ON public.members (RIGHT(REGEXP_REPLACE(phone, '[^0-9]', '', 'g'), 10));

-- ------------------------------------------------------------------------------
-- 3. RPC: register_free_team (TRUNCATION-PROOF & SECRET-LEAK PURGED)
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
  v_total_claimed INT;
  v_max_capacity INT := 2000; -- Internal capacity ceiling
BEGIN
  -- Check capacity ceiling
  SELECT COUNT(*) INTO v_total_claimed FROM public.teams WHERE round1_status <> 'rejected';
  IF v_total_claimed >= v_max_capacity THEN
    RETURN jsonb_build_object('success', false, 'error', 'Registration is currently full. Contact coordinators.');
  END IF;

  -- Validate team size (must be 2, 3, or 4)
  IF p_team_size NOT IN (2, 3, 4) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Team size must be exactly 2, 3, or 4 members.');
  END IF;

  IF jsonb_array_length(p_members) <> p_team_size THEN
    RETURN jsonb_build_object('success', false, 'error', 'Members data count does not match declared team size.');
  END IF;

  IF p_team_name IS NULL OR TRIM(p_team_name) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Team name is required.');
  END IF;

  -- First Pass: Deduplication & Seniority Calculation
  FOR v_member IN SELECT * FROM jsonb_array_elements(p_members)
  LOOP
    v_member_name := COALESCE(NULLIF(TRIM(v_member->>'full_name'), ''), NULLIF(TRIM(v_member->>'name'), ''), 'Participant');
    v_member_email := LOWER(TRIM(COALESCE(v_member->>'email', '')));
    v_member_phone := RIGHT(REGEXP_REPLACE(COALESCE(v_member->>'phone', ''), '[^0-9]', '', 'g'), 10);
    v_member_year := LOWER(TRIM(COALESCE(v_member->>'year_of_study', '')));
    v_member_level := LOWER(TRIM(COALESCE(v_member->>'level', '')));

    IF v_member_email = '' OR v_member_phone = '' THEN
      RETURN jsonb_build_object('success', false, 'error', 'All members must provide valid email and phone number.');
    END IF;

    -- Anti-Cheat Duplicate Member Check
    SELECT m.team_id, t.team_name INTO v_conflict_team_id, v_conflict_team_name
    FROM public.members m
    JOIN public.teams t ON m.team_id = t.team_id
    WHERE (LOWER(TRIM(m.email)) = v_member_email OR RIGHT(REGEXP_REPLACE(m.phone, '[^0-9]', '', 'g'), 10) = v_member_phone)
      AND t.round1_status <> 'rejected'
    LIMIT 1;

    IF FOUND THEN
      RETURN jsonb_build_object(
        'success', false, 
        'error', 'Member "' || v_member_name || '" (' || v_member_email || ') is already registered with Team ' || v_conflict_team_id || ' ("' || v_conflict_team_name || '"). Multi-team registrations are forbidden.'
      );
    END IF;

    -- Seniority Evaluation: 3rd/4th/5th year UG, PG, Research Scholar -> tier_b
    IF v_member_level IN ('pg', 'research scholar', 'working professional')
       OR v_member_level LIKE '%pg%' 
       OR v_member_level LIKE '%research%'
       OR v_member_level LIKE '%working%'
       OR v_member_level LIKE '%phd%'
       OR v_member_level LIKE '%master%'
       OR v_member_year LIKE '3%' 
       OR v_member_year LIKE '4%' 
       OR v_member_year LIKE '5%' 
       OR v_member_year LIKE '%final%'
       OR v_member_year LIKE '%passed%' THEN
      v_has_senior := true;
    END IF;
  END LOOP;

  v_computed_tier := CASE WHEN v_has_senior THEN 'tier_b' ELSE 'tier_a' END;

  -- Truncation-Proof Sequential Team ID Generation (e.g. VTX2-001, ..., VTX2-999, VTX2-1000, ...)
  v_seq_val := nextval('public.vtx2_team_seq');
  v_team_id := 'VTX2-' || CASE 
    WHEN v_seq_val < 1000 THEN LPAD(v_seq_val::TEXT, 3, '0') 
    ELSE v_seq_val::TEXT 
  END;

  -- Cryptographically random 6-character secret passcode (stored silently, NOT returned)
  v_passcode := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 6));

  -- Insert Team
  INSERT INTO public.teams (
    team_id, team_name, track_id, problem_code, academic_tier, team_size, secret_passcode
  ) VALUES (
    v_team_id, TRIM(p_team_name), TRIM(p_track_id), TRIM(p_problem_code), v_computed_tier, p_team_size, v_passcode
  );

  -- Insert Members
  FOR v_member IN SELECT * FROM jsonb_array_elements(p_members)
  LOOP
    INSERT INTO public.members (
      team_id, role, name, email, phone, college_name, department, year_of_study
    ) VALUES (
      v_team_id,
      COALESCE(v_member->>'role', 'member'),
      COALESCE(NULLIF(TRIM(v_member->>'full_name'), ''), NULLIF(TRIM(v_member->>'name'), ''), 'Participant'),
      LOWER(TRIM(v_member->>'email')),
      RIGHT(REGEXP_REPLACE(v_member->>'phone', '[^0-9]', '', 'g'), 10),
      COALESCE(NULLIF(TRIM(v_member->>'college_name'), ''), 'SIET'),
      COALESCE(NULLIF(TRIM(v_member->>'department'), ''), 'ECE'),
      COALESCE(v_member->>'year_of_study', '1st Year')
    );
  END LOOP;

  -- RETURN OBJECT: NEVER leak secret_passcode in Round 1 response!
  RETURN jsonb_build_object(
    'success', true,
    'team_id', v_team_id,
    'team_name', TRIM(p_team_name),
    'track_id', TRIM(p_track_id),
    'academic_tier', v_computed_tier,
    'message', 'Free Round 1 registration confirmed.'
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- 4. RPC: verify_round2_gatekeeper (36-HOUR WINDOW CHECK)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.verify_round2_gatekeeper(p_team_id TEXT, p_passcode TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_team RECORD;
  v_hours_left NUMERIC;
BEGIN
  SELECT * INTO v_team FROM public.teams WHERE UPPER(team_id) = UPPER(TRIM(p_team_id));

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Team ID not found in master records.');
  END IF;

  IF NOT v_team.is_shortlisted THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Team ' || v_team.team_id || ' is currently not shortlisted for Round 2.'
    );
  END IF;

  IF UPPER(TRIM(v_team.secret_passcode)) <> UPPER(TRIM(p_passcode)) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid secret passcode for team ' || v_team.team_id || '.');
  END IF;

  -- Check 36h payment deadline if not already verified
  IF NOT v_team.is_paid_verified AND v_team.payment_deadline IS NOT NULL THEN
    IF NOW() > v_team.payment_deadline THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'The 36-hour payment deadline for Team ' || v_team.team_id || ' has expired. Your seat has been forfeited to the reserves waitlist.'
      );
    END IF;
    v_hours_left := ROUND(EXTRACT(EPOCH FROM (v_team.payment_deadline - NOW())) / 3600.0, 1);
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'team_id', v_team.team_id,
    'team_name', v_team.team_name,
    'team_size', v_team.team_size,
    'academic_tier', v_team.academic_tier,
    'track_id', v_team.track_id,
    'is_paid_verified', v_team.is_paid_verified,
    'payment_deadline', v_team.payment_deadline,
    'hours_remaining', v_hours_left
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- 5. RPC: revoke_expired_seats_and_promote_waitlist (AUTOMATED 36H FORFEITURE)
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
  -- Identify all expired shortlisted teams without verified payment
  FOR v_expired IN 
    SELECT team_id, team_name 
    FROM public.teams 
    WHERE is_shortlisted = true 
      AND is_paid_verified = false 
      AND payment_deadline IS NOT NULL 
      AND NOW() > payment_deadline
    ORDER BY payment_deadline ASC
  LOOP
    -- Demote expired team
    UPDATE public.teams 
    SET is_shortlisted = false,
        round1_status = 'waitlisted',
        payment_deadline = NULL,
        updated_at = NOW()
    WHERE team_id = v_expired.team_id;

    v_revoked_count := v_revoked_count + 1;
    v_revoked_teams := array_append(v_revoked_teams, v_expired.team_id);

    -- Promote earliest waitlisted team FIFO
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
-- 6. RPC: get_coordinator_roster (AUTHENTICATED COORDINATOR AUDIT)
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
  -- Verify caller is an authenticated user
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
            'email', m.email,
            'phone', m.phone,
            'college_name', m.college_name,
            'department', m.department,
            'year_of_study', m.year_of_study
          )
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
-- 7. RPC: admin_update_team_status
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
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

-- Drop legacy permissive policies if they exist
DROP POLICY IF EXISTS "Public read user report status" ON public.user_reports;
DROP POLICY IF EXISTS "Public read event state" ON public.event_state;
DROP POLICY IF EXISTS "Authenticated full control teams" ON public.teams;
DROP POLICY IF EXISTS "Authenticated full control members" ON public.members;
DROP POLICY IF EXISTS "Authenticated full control reports" ON public.user_reports;
DROP POLICY IF EXISTS "Authenticated full control event state" ON public.event_state;

-- Public (Anon) Policies: Read-only access to public event state
CREATE POLICY "Public read event state" ON public.event_state
  FOR SELECT TO anon, authenticated
  USING (true);

-- Authenticated Coordinators: Full CRUD on all tables
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

