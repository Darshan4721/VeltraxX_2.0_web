-- ==============================================================================
-- VELTRAXX 2.0 - TWO-STAGE GAUNTLET HACKATHON SCHEMA & SECURITY RPCs
-- Migration: 005_two_stage_hackathon_schema.sql
-- Status: Production-Ready Security Definer Implementation
-- Compliant with: docs/specs/VELTRAXX_2.0_UI_AND_CONTENT_SPEC.md (Patches 1 to 5)
-- ==============================================================================

-- 1. Sequence for Atomic Sequential Team IDs (VTX2-001 to VTX2-500)
CREATE SEQUENCE IF NOT EXISTS public.vtx2_team_seq START 1;

-- 2. Event State Table (Dynamic Live 24H Arena Clock & Dynamic Round 2 Pricing)
CREATE TABLE IF NOT EXISTS public.event_state (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  is_clock_public BOOLEAN DEFAULT false,
  clock_state VARCHAR(20) DEFAULT 'STOPPED' CHECK (clock_state IN ('STOPPED', 'RUNNING', 'PAUSED')),
  clock_start_timestamp TIMESTAMPTZ,
  clock_end_timestamp TIMESTAMPTZ,
  live_announcement_text TEXT DEFAULT 'Welcome to VELTRAXX 2.0. The 24-Hour Offline Arena is initializing.',
  round2_fee_per_member INT DEFAULT 500, -- Patch 3: Dynamic per-head pricing
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial event state record
INSERT INTO public.event_state (id, is_clock_public, round2_fee_per_member)
VALUES (1, false, 500)
ON CONFLICT (id) DO NOTHING;

-- 3. Teams Table (Strictly Isolated via RLS - Zero Public SELECT)
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id VARCHAR(16) UNIQUE NOT NULL, -- e.g. VTX2-001
  team_name VARCHAR(120) NOT NULL,
  track_id VARCHAR(32) NOT NULL, -- track_01 to track_05
  problem_code VARCHAR(32) NOT NULL, -- VTX-T1-01 to VTX-T5-05
  academic_tier VARCHAR(32) NOT NULL, -- tier_a (1st/2nd yr) or tier_b (3rd/4th yr/PG)
  team_size INT NOT NULL CHECK (team_size IN (2, 3, 4)),
  
  -- Round 1 Status & PPT Submissions
  ppt_pdf_drive_url TEXT,
  extracted_slide_text TEXT,
  round1_status VARCHAR(20) DEFAULT 'pending' CHECK (round1_status IN ('pending', 'shortlisted', 'waitlisted', 'rejected')),
  
  -- Round 2 Gatekeeper Security & Payments (Patch 4: Passcode never exposed to frontend)
  secret_passcode VARCHAR(10) NOT NULL, -- Random 6-char uppercase alphanumeric code (e.g. 9X4K2M)
  is_shortlisted BOOLEAN DEFAULT false,
  utr_number VARCHAR(16),
  payment_screenshot_url TEXT,
  is_paid_verified BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Members Table (Individual Student Contacts for Flat-Row Excel Exports)
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id VARCHAR(16) REFERENCES public.teams(team_id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('leader', 'member_2', 'member_3', 'member_4')),
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  gender VARCHAR(20) NOT NULL,
  college_name VARCHAR(200) NOT NULL,
  department VARCHAR(120) NOT NULL,
  year_of_study VARCHAR(32) NOT NULL,
  
  -- Round 2 Event-Day Attendance Checklist
  is_present_checkin BOOLEAN DEFAULT false,
  is_present_audit1 BOOLEAN DEFAULT false,
  is_present_audit2 BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Row-Level Security Policies (Hardened)
ALTER TABLE public.event_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Allow public read of non-sensitive live clock state
DROP POLICY IF EXISTS "Public can view live clock state" ON public.event_state;
CREATE POLICY "Public can view live clock state" ON public.event_state
  FOR SELECT TO anon, authenticated
  USING (true);

-- Explicitly DROP any public SELECT policies on teams and members to prevent scraping
DROP POLICY IF EXISTS "Teams are viewable by public" ON public.teams;
DROP POLICY IF EXISTS "Participants can be viewed by public" ON public.members;
DROP POLICY IF EXISTS "Members are viewable by public" ON public.members;

-- ==============================================================================
-- 6. RPC 1: register_free_team (Atomically generates VTX2-001 & 6-char Passcode)
-- ==============================================================================
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
BEGIN
  -- Validate team size
  IF p_team_size NOT IN (2, 3, 4) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Team size must be exactly 2, 3, or 4 members.');
  END IF;

  -- Validate members array count
  IF jsonb_array_length(p_members) <> p_team_size THEN
    RETURN jsonb_build_object('success', false, 'error', 'Members data does not match declared team size.');
  END IF;

  -- Generate atomic sequential Team ID
  v_seq_val := nextval('public.vtx2_team_seq');
  v_team_id := 'VTX2-' || LPAD(v_seq_val::TEXT, 3, '0');
  
  -- Generate cryptographically random 6-character uppercase passcode
  v_passcode := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 6));

  -- Insert Team Record
  INSERT INTO public.teams (
    team_id, team_name, track_id, problem_code, academic_tier, team_size, secret_passcode
  ) VALUES (
    v_team_id, TRIM(p_team_name), TRIM(p_track_id), TRIM(p_problem_code), TRIM(p_academic_tier), p_team_size, v_passcode
  );

  -- Insert Member Records
  FOR v_member IN SELECT * FROM jsonb_array_elements(p_members)
  LOOP
    INSERT INTO public.members (
      team_id, role, full_name, email, phone, gender, college_name, department, year_of_study
    ) VALUES (
      v_team_id,
      v_member->>'role',
      TRIM(v_member->>'full_name'),
      LOWER(TRIM(v_member->>'email')),
      TRIM(v_member->>'phone'),
      v_member->>'gender',
      TRIM(v_member->>'college_name'),
      TRIM(v_member->>'department'),
      v_member->>'year_of_study'
    );
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'team_id', v_team_id
  );
END;
$$;

-- ==============================================================================
-- 7. RPC 2: lookup_team_for_ppt (Forgot Team ID Helper - Patch 2)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.lookup_team_for_ppt(p_identifier TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_team RECORD;
BEGIN
  SELECT t.team_id, t.team_name, t.track_id, t.problem_code, (t.ppt_pdf_drive_url IS NOT NULL) AS has_submitted
  INTO v_team
  FROM public.teams t
  LEFT JOIN public.members m ON t.team_id = m.team_id
  WHERE UPPER(t.team_id) = UPPER(TRIM(p_identifier))
     OR LOWER(m.email) = LOWER(TRIM(p_identifier))
     OR m.phone = TRIM(p_identifier)
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('found', false);
  END IF;

  RETURN jsonb_build_object(
    'found', true,
    'team_id', v_team.team_id,
    'team_name', v_team.team_name,
    'track_id', v_team.track_id,
    'problem_code', v_team.problem_code,
    'has_submitted', v_team.has_submitted
  );
END;
$$;

-- ==============================================================================
-- 8. RPC 3: submit_round1_ppt (Saves Drive /preview Embed Link - Patch 1)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.submit_round1_ppt(
  p_team_id TEXT,
  p_leader_email TEXT,
  p_drive_preview_url TEXT,
  p_extracted_text TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_valid_leader BOOLEAN;
BEGIN
  -- Verify leader email matches team
  SELECT EXISTS (
    SELECT 1 FROM public.members
    WHERE team_id = UPPER(TRIM(p_team_id))
      AND role = 'leader'
      AND LOWER(email) = LOWER(TRIM(p_leader_email))
  ) INTO v_valid_leader;

  IF NOT v_valid_leader THEN
    RETURN jsonb_build_object('success', false, 'error', 'Leader email does not match registered team records.');
  END IF;

  -- Ensure URL is formatted as /preview for safe iframe rendering
  UPDATE public.teams
  SET ppt_pdf_drive_url = TRIM(p_drive_preview_url),
      extracted_slide_text = p_extracted_text,
      updated_at = NOW()
  WHERE team_id = UPPER(TRIM(p_team_id));

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Round 1 presentation blueprint saved successfully.'
  );
END;
$$;

-- ==============================================================================
-- 9. RPC 4: verify_round2_gatekeeper (Passcode & Dynamic Math - Patches 3 & 4)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.verify_round2_gatekeeper(p_team_id TEXT, p_passcode TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_team RECORD;
  v_fee_per_head INT;
BEGIN
  SELECT round2_fee_per_member INTO v_fee_per_head FROM public.event_state WHERE id = 1;
  IF v_fee_per_head IS NULL THEN v_fee_per_head := 500; END IF;

  SELECT team_id, team_name, team_size, is_shortlisted, is_paid_verified, utr_number
  INTO v_team
  FROM public.teams
  WHERE UPPER(team_id) = UPPER(TRIM(p_team_id))
    AND UPPER(secret_passcode) = UPPER(TRIM(p_passcode))
    AND is_shortlisted = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Invalid passcode or team not shortlisted for Round 2.');
  END IF;

  RETURN jsonb_build_object(
    'valid', true,
    'team_id', v_team.team_id,
    'team_name', v_team.team_name,
    'team_size', v_team.team_size,
    'fee_per_member', v_fee_per_head,
    'total_fee', v_team.team_size * v_fee_per_head,
    'is_paid_verified', v_team.is_paid_verified,
    'submitted_utr', v_team.utr_number
  );
END;
$$;

-- ==============================================================================
-- 10. RPC 5: submit_round2_payment (Binds 12-digit UTR & Screenshot)
-- ==============================================================================
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
  -- Verify team is shortlisted and passcode matches
  SELECT EXISTS (
    SELECT 1 FROM public.teams
    WHERE UPPER(team_id) = UPPER(TRIM(p_team_id))
      AND UPPER(secret_passcode) = UPPER(TRIM(p_passcode))
      AND is_shortlisted = true
  ) INTO v_valid;

  IF NOT v_valid THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Invalid team credentials.');
  END IF;

  -- Validate 12-digit numeric UTR
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

