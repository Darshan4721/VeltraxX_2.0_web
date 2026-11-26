-- ==============================================================================
-- VELTRAXX 2.0 - SINGLE-ROUND UNIFIED PAID REGISTRATION MIGRATION
-- File: backend_sql/012_single_round_conversion.sql
-- Purpose:
--   Enforces ONE unified paid registration process (no permanent unpaid teams):
--     1. Internal temporary `checkout_reservations` holds (never surfaced as teams)
--     2. Atomic 60-team cap across completed teams + unexpired active holds
--     3. Idempotent `complete_paid_registration` creating team + 3 members + Drive ref + Sheet sync
--     4. Late-payment / interrupted-upload recovery (`EXPIRED_WITH_UTR` + receipt reuse)
--   Zero destructive drops. Preserves VTX2-032..036 & all historical PPT files.
-- ==============================================================================

-- 1. Extend event_state with strict venue capacity & reservation window
ALTER TABLE public.event_state
  ADD COLUMN IF NOT EXISTS max_teams_cap INT NOT NULL DEFAULT 60,
  ADD COLUMN IF NOT EXISTS payment_reservation_minutes INT NOT NULL DEFAULT 5;

ALTER TABLE public.teams
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

-- Lock PPT submission off & align single-round event deadlines/pricing
-- Note: Keep round2_payment_open = false until organizer confirms official UPI/QR account
UPDATE public.event_state
SET ppt_submission_open = false,
    ppt_deadline_override = 'FORCE_CLOSED',
    round2_fee_per_member = 500,
    max_teams_cap = 60,
    payment_reservation_minutes = 5,
    registration_deadline = '2026-12-12T23:59:59+05:30'::TIMESTAMPTZ,
    live_announcement_text = 'Welcome to VELTRAXX 2.0 - 24-Hour Single-Round Onsite Hackathon (Dec 15-16, 2026).',
    updated_at = NOW()
WHERE id = 1;

-- 2. Enforce unique 12-digit UTR & idempotency across active non-rejected teams
CREATE UNIQUE INDEX IF NOT EXISTS idx_teams_unique_active_utr
  ON public.teams (utr_number)
  WHERE utr_number IS NOT NULL AND TRIM(utr_number) <> '' AND round1_status <> 'rejected';

CREATE UNIQUE INDEX IF NOT EXISTS idx_teams_idempotency_key
  ON public.teams (idempotency_key)
  WHERE idempotency_key IS NOT NULL AND TRIM(idempotency_key) <> '';

-- 3. Internal Temporary Checkout Reservations (NOT permanent registrations; invisible to public & admin roster)
CREATE TABLE IF NOT EXISTS public.checkout_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_token TEXT UNIQUE NOT NULL,
  idempotency_key TEXT UNIQUE,
  member_emails TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  member_phones TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  draft_payload JSONB NOT NULL,
  utr_number TEXT,
  receipt_drive_file_id TEXT,
  receipt_url TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'EXPIRED', 'EXPIRED_WITH_UTR', 'RELEASED')),
  completed_team_id TEXT REFERENCES public.teams(team_id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checkout_res_active ON public.checkout_reservations (status, expires_at);
ALTER TABLE public.checkout_reservations ENABLE ROW LEVEL SECURITY;

-- 4. Allow STATUS_SHEET_SYNC alongside existing job types without touching historical jobs
ALTER TABLE public.sync_jobs DROP CONSTRAINT IF EXISTS sync_jobs_job_type_check;
ALTER TABLE public.sync_jobs
  ADD CONSTRAINT sync_jobs_job_type_check
  CHECK (job_type IN ('REGISTER_SYNC', 'PPT_SHEET_SYNC', 'SHORTLIST_EMAIL', 'PASSCODE_RECOVERY_EMAIL', 'STATUS_SHEET_SYNC'));

-- 5. Authoritative Capacity & Window Functions (Atomic 60-team cap across teams + active holds)
CREATE OR REPLACE FUNCTION public.get_public_capacity()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_ev RECORD;
  v_max_cap INT := 60;
  v_team_count INT := 0;
  v_hold_count INT := 0;
  v_claimed INT := 0;
BEGIN
  SELECT * INTO v_ev FROM public.event_state WHERE id = 1;
  IF FOUND AND v_ev.max_teams_cap IS NOT NULL THEN
    v_max_cap := v_ev.max_teams_cap;
  END IF;

  SELECT COUNT(*) INTO v_team_count
  FROM public.teams
  WHERE round1_status <> 'rejected';

  SELECT COUNT(*) INTO v_hold_count
  FROM public.checkout_reservations
  WHERE status = 'PENDING'
    AND expires_at > NOW();

  v_claimed := v_team_count + v_hold_count;

  RETURN jsonb_build_object(
    'claimed_teams', v_claimed,
    'completed_teams', v_team_count,
    'active_holds', v_hold_count,
    'max_teams', v_max_cap,
    'is_full', v_claimed >= v_max_cap
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_window_status()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_ev RECORD;
  v_now TIMESTAMPTZ := NOW();
  v_reg_open BOOLEAN;
  v_cap JSONB := public.get_public_capacity();
BEGIN
  SELECT * INTO v_ev FROM public.event_state WHERE id = 1;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('registration_open', false, 'ppt_open', false, 'payment_open', false);
  END IF;

  v_reg_open := CASE
    WHEN v_ev.registration_override = 'FORCE_OPEN' THEN true
    WHEN v_ev.registration_override = 'FORCE_CLOSED' THEN false
    ELSE (v_ev.round1_open = true AND v_now <= v_ev.registration_deadline)
  END;

  RETURN jsonb_build_object(
    'now_utc', v_now,
    'registration_open', v_reg_open,
    'registration_deadline', v_ev.registration_deadline,
    'registration_override', v_ev.registration_override,
    'ppt_open', false,
    'ppt_window_start', v_ev.ppt_window_start,
    'ppt_window_end', v_ev.ppt_window_end,
    'ppt_grace_minutes', v_ev.ppt_grace_minutes,
    'ppt_deadline_override', 'FORCE_CLOSED',
    'payment_open', COALESCE(v_ev.round2_payment_open, false),
    'fee_per_member', COALESCE(v_ev.round2_fee_per_member, 500),
    'max_teams_cap', COALESCE(v_ev.max_teams_cap, 60),
    'payment_reservation_minutes', COALESCE(v_ev.payment_reservation_minutes, 5),
    'claimed_teams', COALESCE((v_cap->>'claimed_teams')::INT, 0),
    'completed_teams', COALESCE((v_cap->>'completed_teams')::INT, 0),
    'is_full', COALESCE((v_cap->>'is_full')::BOOLEAN, false)
  );
END;
$$;

-- Internal shared validator for 3-member payload (returns array of emails/phones & computed tier)
CREATE OR REPLACE FUNCTION public._validate_and_normalize_team_draft(
  p_team_name TEXT,
  p_track_id TEXT,
  p_problem_code TEXT,
  p_team_size INT,
  p_members JSONB,
  p_exclude_reservation_token TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_member JSONB;
  v_member_name TEXT;
  v_member_email TEXT;
  v_member_phone TEXT;
  v_member_year TEXT;
  v_member_level TEXT;
  v_member_degree TEXT;
  v_member_dept TEXT;
  v_member_college TEXT;
  v_has_senior BOOLEAN := false;
  v_computed_tier TEXT := 'tier_a';
  v_conflict_team_id TEXT;
  v_conflict_team_name TEXT;
  v_emails TEXT[] := ARRAY[]::TEXT[];
  v_phones TEXT[] := ARRAY[]::TEXT[];
BEGIN
  IF p_team_size <> 3 OR p_members IS NULL OR jsonb_typeof(p_members) <> 'array' OR jsonb_array_length(p_members) <> 3 THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Strictly 3 members (1 Team Leader and 2 Team Members) are required.');
  END IF;

  IF p_team_name IS NULL OR LENGTH(TRIM(p_team_name)) < 3 THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Team name must be at least 3 characters.');
  END IF;

  IF NULLIF(TRIM(COALESCE(p_track_id, '')), '') IS NULL OR NULLIF(TRIM(COALESCE(p_problem_code, '')), '') IS NULL THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Domain track and problem statement selection are required.');
  END IF;

  FOR v_member IN SELECT * FROM jsonb_array_elements(p_members)
  LOOP
    v_member_name := COALESCE(NULLIF(TRIM(v_member->>'full_name'), ''), NULLIF(TRIM(v_member->>'name'), ''), '');
    v_member_email := LOWER(TRIM(COALESCE(v_member->>'email', '')));
    v_member_phone := RIGHT(REGEXP_REPLACE(COALESCE(v_member->>'phone', ''), '[^0-9]', '', 'g'), 10);
    v_member_year := TRIM(COALESCE(v_member->>'year_of_study', ''));
    v_member_level := TRIM(COALESCE(v_member->>'level', 'UG'));
    v_member_degree := TRIM(COALESCE(v_member->>'degree', ''));
    v_member_dept := TRIM(COALESCE(v_member->>'department', ''));
    v_member_college := TRIM(COALESCE(v_member->>'college_name', ''));

    IF LENGTH(v_member_name) < 2 THEN
      RETURN jsonb_build_object('valid', false, 'error', 'Full name is required for all 3 members.');
    END IF;
    IF v_member_email = '' OR v_member_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
      RETURN jsonb_build_object('valid', false, 'error', 'Valid email address required for "' || v_member_name || '".');
    END IF;
    IF LENGTH(v_member_phone) < 10 THEN
      RETURN jsonb_build_object('valid', false, 'error', 'Valid 10-digit phone required for "' || v_member_name || '".');
    END IF;

    IF LOWER(v_member_level) <> 'working professional' THEN
      IF v_member_college = '' OR v_member_degree = '' OR v_member_dept = '' OR v_member_year = '' THEN
        RETURN jsonb_build_object('valid', false, 'error', 'College, degree, department, and year of study are required for "' || v_member_name || '".');
      END IF;
      IF LOWER(v_member_degree) = 'other' OR LOWER(v_member_dept) = 'other' THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Please enter your exact custom degree/department name for "' || v_member_name || '".');
      END IF;
    ELSE
      IF TRIM(COALESCE(v_member->>'organisation', '')) = '' OR TRIM(COALESCE(v_member->>'designation', '')) = '' THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Organisation and designation are required for "' || v_member_name || '".');
      END IF;
    END IF;

    IF v_member_email = ANY(v_emails) THEN
      RETURN jsonb_build_object('valid', false, 'error', 'Duplicate email entered inside team roster: ' || v_member_email);
    END IF;
    v_emails := array_append(v_emails, v_member_email);

    IF v_member_phone = ANY(v_phones) THEN
      RETURN jsonb_build_object('valid', false, 'error', 'Duplicate phone entered inside team roster: ' || v_member_phone);
    END IF;
    v_phones := array_append(v_phones, v_member_phone);

    SELECT t.team_id, t.team_name INTO v_conflict_team_id, v_conflict_team_name
    FROM public.members m
    JOIN public.teams t ON t.team_id = m.team_id
    WHERE (LOWER(TRIM(m.email)) = v_member_email OR RIGHT(REGEXP_REPLACE(m.phone, '[^0-9]', '', 'g'), 10) = v_member_phone)
      AND t.round1_status <> 'rejected'
    LIMIT 1;

    IF FOUND THEN
      RETURN jsonb_build_object(
        'valid', false,
        'error', 'Member "' || v_member_name || '" (' || v_member_email || ') is already registered with Team ' || v_conflict_team_id || ' ("' || v_conflict_team_name || '").'
      );
    END IF;

    -- Also prevent two simultaneous checkouts for the same participant
    PERFORM 1
    FROM public.checkout_reservations cr
    WHERE cr.status = 'PENDING'
      AND cr.expires_at > NOW()
      AND cr.reservation_token <> COALESCE(NULLIF(TRIM(p_exclude_reservation_token), ''), '')
      AND (v_member_email = ANY(cr.member_emails) OR v_member_phone = ANY(cr.member_phones))
    LIMIT 1;

    IF FOUND THEN
      RETURN jsonb_build_object(
        'valid', false,
        'error', 'Participant "' || v_member_name || '" (' || v_member_email || ') currently has an active checkout session in progress. Finish that checkout or wait 5 minutes.'
      );
    END IF;

    IF LOWER(v_member_level) IN ('pg', 'research scholar', 'working professional')
       OR LOWER(v_member_level) LIKE '%pg%' OR LOWER(v_member_level) LIKE '%research%' OR LOWER(v_member_level) LIKE '%phd%' OR LOWER(v_member_level) LIKE '%master%'
       OR LOWER(v_member_year) LIKE '3%' OR LOWER(v_member_year) LIKE '4%' OR LOWER(v_member_year) LIKE '5%' OR LOWER(v_member_year) LIKE '%final%' OR LOWER(v_member_year) LIKE '%passed%' THEN
      v_has_senior := true;
    END IF;
  END LOOP;

  v_computed_tier := CASE WHEN v_has_senior THEN 'tier_b' ELSE 'tier_a' END;

  RETURN jsonb_build_object(
    'valid', true,
    'academic_tier', v_computed_tier,
    'emails', v_emails,
    'phones', v_phones
  );
END;
$$;

-- 6. Step 1 RPC: Temporary Checkout Seat Reservation (Does NOT create a team record or Team ID)
CREATE OR REPLACE FUNCTION public.reserve_checkout_slot(
  p_team_name TEXT,
  p_track_id TEXT,
  p_problem_code TEXT,
  p_team_size INT,
  p_members JSONB,
  p_existing_token TEXT DEFAULT NULL,
  p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_ev RECORD;
  v_win JSONB;
  v_val JSONB;
  v_res_token TEXT := NULLIF(UPPER(TRIM(COALESCE(p_existing_token, ''))), '');
  v_max_cap INT := 60;
  v_res_mins INT := 5;
  v_teams_count INT := 0;
  v_other_holds INT := 0;
  v_expires TIMESTAMPTZ;
  v_draft JSONB;
  v_existing_row public.checkout_reservations%ROWTYPE;
BEGIN
  PERFORM pg_advisory_xact_lock(74218932);

  SELECT * INTO v_ev FROM public.event_state WHERE id = 1;
  v_max_cap := COALESCE(v_ev.max_teams_cap, 60);
  v_res_mins := GREATEST(1, COALESCE(v_ev.payment_reservation_minutes, 5));

  v_win := public.get_window_status();
  IF NOT COALESCE((v_win->>'registration_open')::BOOLEAN, false) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Registration window is currently closed.');
  END IF;

  -- Mark any lapsed pending reservations cleanly
  UPDATE public.checkout_reservations
  SET status = 'EXPIRED', updated_at = NOW()
  WHERE status = 'PENDING' AND expires_at <= NOW();

  -- If existing token already belongs to a valid unexpired hold, reuse it; otherwise check capacity first
  IF v_res_token IS NOT NULL THEN
    SELECT * INTO v_existing_row FROM public.checkout_reservations WHERE reservation_token = v_res_token;
  END IF;

  v_val := public._validate_and_normalize_team_draft(
    p_team_name, p_track_id, p_problem_code, p_team_size, p_members,
    CASE WHEN v_existing_row.id IS NOT NULL AND v_existing_row.status = 'PENDING' THEN v_res_token ELSE NULL END
  );
  IF NOT COALESCE((v_val->>'valid')::BOOLEAN, false) THEN
    RETURN jsonb_build_object('success', false, 'error', v_val->>'error');
  END IF;

  SELECT COUNT(*) INTO v_teams_count FROM public.teams WHERE round1_status <> 'rejected';
  SELECT COUNT(*) INTO v_other_holds
  FROM public.checkout_reservations
  WHERE status = 'PENDING'
    AND expires_at > NOW()
    AND reservation_token <> COALESCE(v_res_token, '');

  IF (v_teams_count + v_other_holds) >= v_max_cap THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Maximum arena capacity (' || v_max_cap || ' teams) is currently filled or reserved in active checkouts. Please retry shortly.'
    );
  END IF;

  v_expires := NOW() + MAKE_INTERVAL(mins => v_res_mins);
  v_draft := jsonb_build_object(
    'team_name', TRIM(p_team_name),
    'track_id', TRIM(p_track_id),
    'problem_code', TRIM(p_problem_code),
    'team_size', 3,
    'academic_tier', v_val->>'academic_tier',
    'members', p_members
  );

  IF v_existing_row.id IS NOT NULL AND v_existing_row.status IN ('PENDING', 'EXPIRED') THEN
    UPDATE public.checkout_reservations
    SET status = 'PENDING',
        draft_payload = v_draft,
        member_emails = ARRAY(SELECT jsonb_array_elements_text(v_val->'emails')),
        member_phones = ARRAY(SELECT jsonb_array_elements_text(v_val->'phones')),
        expires_at = v_expires,
        idempotency_key = COALESCE(NULLIF(TRIM(p_idempotency_key), ''), idempotency_key),
        updated_at = NOW()
    WHERE id = v_existing_row.id;
  ELSE
    v_res_token := 'HOLD-' || UPPER(SUBSTRING(ENCODE(gen_random_bytes(5), 'hex') FROM 1 FOR 10));
    INSERT INTO public.checkout_reservations (
      reservation_token, idempotency_key, member_emails, member_phones, draft_payload, status, expires_at
    ) VALUES (
      v_res_token,
      NULLIF(TRIM(p_idempotency_key), ''),
      ARRAY(SELECT jsonb_array_elements_text(v_val->'emails')),
      ARRAY(SELECT jsonb_array_elements_text(v_val->'phones')),
      v_draft,
      'PENDING',
      v_expires
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'reservation_token', v_res_token,
    'expires_at', v_expires,
    'academic_tier', v_val->>'academic_tier',
    'fee_per_member', COALESCE(v_ev.round2_fee_per_member, 500),
    'total_fee', 3 * COALESCE(v_ev.round2_fee_per_member, 500),
    'payment_open', COALESCE(v_ev.round2_payment_open, false),
    'claimed_teams', v_teams_count + v_other_holds + 1,
    'max_teams', v_max_cap
  );
END;
$$;

-- 7. Preflight check before uploading binary receipt image to Google Drive (prevents wasted uploads & supports safe retries)
CREATE OR REPLACE FUNCTION public.preflight_paid_registration(
  p_team_name TEXT,
  p_track_id TEXT,
  p_problem_code TEXT,
  p_team_size INT,
  p_members JSONB,
  p_utr_number TEXT,
  p_reservation_token TEXT DEFAULT NULL,
  p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_ev RECORD;
  v_win JSONB;
  v_val JSONB;
  v_clean_utr TEXT := TRIM(COALESCE(p_utr_number, ''));
  v_clean_key TEXT := NULLIF(TRIM(COALESCE(p_idempotency_key, '')), '');
  v_res_token TEXT := NULLIF(UPPER(TRIM(COALESCE(p_reservation_token, ''))), '');
  v_existing_team RECORD;
  v_dup_team_id TEXT;
  v_res_row public.checkout_reservations%ROWTYPE;
  v_teams_count INT := 0;
  v_other_holds INT := 0;
  v_max_cap INT := 60;
BEGIN
  PERFORM pg_advisory_xact_lock(74218932);

  IF v_clean_key IS NOT NULL THEN
    SELECT * INTO v_existing_team FROM public.teams WHERE idempotency_key = v_clean_key LIMIT 1;
    IF FOUND THEN
      RETURN jsonb_build_object(
        'ok', true,
        'already_completed', true,
        'team_id', v_existing_team.team_id,
        'team_name', v_existing_team.team_name,
        'track_id', v_existing_team.track_id,
        'problem_code', v_existing_team.problem_code,
        'academic_tier', v_existing_team.academic_tier,
        'payment_token', v_existing_team.secret_passcode,
        'utr_number', v_existing_team.utr_number
      );
    END IF;
  END IF;

  SELECT * INTO v_ev FROM public.event_state WHERE id = 1;
  v_max_cap := COALESCE(v_ev.max_teams_cap, 60);

  IF COALESCE(v_ev.round2_payment_open, false) = false THEN
    RETURN jsonb_build_object('ok', false, 'status_code', 403, 'error', 'Live UPI payments are pending official coordinator QR verification.');
  END IF;

  v_win := public.get_window_status();
  IF NOT COALESCE((v_win->>'registration_open')::BOOLEAN, false) THEN
    RETURN jsonb_build_object('ok', false, 'status_code', 403, 'error', 'Registration window is closed.');
  END IF;

  IF LENGTH(v_clean_utr) <> 12 OR v_clean_utr !~ '^[0-9]+$' THEN
    RETURN jsonb_build_object('ok', false, 'status_code', 400, 'error', 'Payment transaction reference (UTR) must be exactly 12 numeric digits.');
  END IF;

  SELECT team_id INTO v_dup_team_id
  FROM public.teams
  WHERE utr_number = v_clean_utr AND round1_status <> 'rejected'
  LIMIT 1;
  IF FOUND THEN
    RETURN jsonb_build_object('ok', false, 'status_code', 409, 'error', 'Duplicate transaction reference: UTR ' || v_clean_utr || ' is already registered with Team ' || v_dup_team_id || '.');
  END IF;

  v_val := public._validate_and_normalize_team_draft(p_team_name, p_track_id, p_problem_code, p_team_size, p_members, v_res_token);
  IF NOT COALESCE((v_val->>'valid')::BOOLEAN, false) THEN
    RETURN jsonb_build_object('ok', false, 'status_code', 400, 'error', v_val->>'error');
  END IF;

  IF v_res_token IS NOT NULL THEN
    SELECT * INTO v_res_row FROM public.checkout_reservations WHERE reservation_token = v_res_token LIMIT 1;
  END IF;

  SELECT COUNT(*) INTO v_teams_count FROM public.teams WHERE round1_status <> 'rejected';
  SELECT COUNT(*) INTO v_other_holds
  FROM public.checkout_reservations
  WHERE status = 'PENDING'
    AND expires_at > NOW()
    AND reservation_token <> COALESCE(v_res_token, '');

  RETURN jsonb_build_object(
    'ok', true,
    'already_completed', false,
    'existing_drive_file_id', CASE WHEN v_res_row.utr_number = v_clean_utr THEN v_res_row.receipt_drive_file_id ELSE NULL END,
    'capacity_reached', (v_teams_count + v_other_holds) >= v_max_cap
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.save_reservation_receipt(
  p_reservation_token TEXT,
  p_utr_number TEXT,
  p_drive_file_id TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  IF NULLIF(TRIM(COALESCE(p_reservation_token, '')), '') IS NULL THEN
    RETURN;
  END IF;
  UPDATE public.checkout_reservations
  SET utr_number = TRIM(p_utr_number),
      receipt_drive_file_id = TRIM(p_drive_file_id),
      updated_at = NOW()
  WHERE reservation_token = UPPER(TRIM(p_reservation_token))
    AND status IN ('PENDING', 'EXPIRED');
END;
$$;

-- 8. Step 3 Atomic Complete Registration RPC (Creates team + 3 members + payment evidence + sync job atomically)
CREATE OR REPLACE FUNCTION public.complete_paid_registration(
  p_team_name TEXT,
  p_track_id TEXT,
  p_problem_code TEXT,
  p_team_size INT,
  p_members JSONB,
  p_ppt_passcode_plain TEXT,
  p_utr_number TEXT,
  p_screenshot_url TEXT,
  p_drive_file_id TEXT DEFAULT NULL,
  p_reservation_token TEXT DEFAULT NULL,
  p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_ev RECORD;
  v_win JSONB;
  v_val JSONB;
  v_seq_val INT;
  v_team_id TEXT;
  v_r2_passcode TEXT;
  v_passcode_hash TEXT;
  v_clean_utr TEXT := TRIM(COALESCE(p_utr_number, ''));
  v_clean_key TEXT := NULLIF(TRIM(COALESCE(p_idempotency_key, '')), '');
  v_res_token TEXT := NULLIF(UPPER(TRIM(COALESCE(p_reservation_token, ''))), '');
  v_existing_team RECORD;
  v_dup_team_id TEXT;
  v_teams_count INT := 0;
  v_other_holds INT := 0;
  v_max_cap INT := 60;
  v_computed_tier TEXT;
  v_final_screenshot_url TEXT;
  v_member JSONB;
  v_member_level TEXT;
BEGIN
  PERFORM pg_advisory_xact_lock(74218932);

  -- 1. Idempotent replay check (never creates duplicate team on retry)
  IF v_clean_key IS NOT NULL THEN
    SELECT * INTO v_existing_team FROM public.teams WHERE idempotency_key = v_clean_key LIMIT 1;
    IF FOUND THEN
      RETURN jsonb_build_object(
        'success', true,
        'idempotent_replay', true,
        'team_id', v_existing_team.team_id,
        'team_name', v_existing_team.team_name,
        'track_id', v_existing_team.track_id,
        'problem_code', v_existing_team.problem_code,
        'academic_tier', v_existing_team.academic_tier,
        'payment_token', v_existing_team.secret_passcode,
        'utr_number', v_existing_team.utr_number,
        'payment_status', 'PENDING_VERIFICATION',
        'message', E'Registration submitted successfully!\nYour payment evidence has been received and is awaiting verification by the organizing committee. You will receive an official confirmation email once your payment is verified.'
      );
    END IF;
  END IF;

  SELECT * INTO v_ev FROM public.event_state WHERE id = 1;
  v_max_cap := COALESCE(v_ev.max_teams_cap, 60);

  IF COALESCE(v_ev.round2_payment_open, false) = false THEN
    RETURN jsonb_build_object('success', false, 'status_code', 403, 'error', 'Live UPI payments are pending official coordinator QR verification.');
  END IF;

  v_win := public.get_window_status();
  IF NOT COALESCE((v_win->>'registration_open')::BOOLEAN, false) THEN
    RETURN jsonb_build_object('success', false, 'status_code', 403, 'error', 'Registration window is currently closed.');
  END IF;

  IF LENGTH(v_clean_utr) <> 12 OR v_clean_utr !~ '^[0-9]+$' THEN
    RETURN jsonb_build_object('success', false, 'status_code', 400, 'error', 'Payment transaction reference (UTR) must be exactly 12 numeric digits.');
  END IF;

  IF NULLIF(TRIM(COALESCE(p_screenshot_url, '')), '') IS NULL AND NULLIF(TRIM(COALESCE(p_drive_file_id, '')), '') IS NULL THEN
    RETURN jsonb_build_object('success', false, 'status_code', 400, 'error', 'Payment screenshot proof is required to complete registration.');
  END IF;

  SELECT team_id INTO v_dup_team_id
  FROM public.teams
  WHERE utr_number = v_clean_utr AND round1_status <> 'rejected'
  LIMIT 1;
  IF FOUND THEN
    RETURN jsonb_build_object('success', false, 'status_code', 409, 'error', 'Duplicate transaction reference: UTR ' || v_clean_utr || ' was already submitted by Team ' || v_dup_team_id || '.');
  END IF;

  v_val := public._validate_and_normalize_team_draft(p_team_name, p_track_id, p_problem_code, p_team_size, p_members, v_res_token);
  IF NOT COALESCE((v_val->>'valid')::BOOLEAN, false) THEN
    RETURN jsonb_build_object('success', false, 'status_code', 400, 'error', v_val->>'error');
  END IF;
  v_computed_tier := v_val->>'academic_tier';

  -- Expire lapsed holds, then verify capacity cleanly excluding our own reservation token
  UPDATE public.checkout_reservations
  SET status = 'EXPIRED', updated_at = NOW()
  WHERE status = 'PENDING' AND expires_at <= NOW();

  SELECT COUNT(*) INTO v_teams_count FROM public.teams WHERE round1_status <> 'rejected';
  SELECT COUNT(*) INTO v_other_holds
  FROM public.checkout_reservations
  WHERE status = 'PENDING'
    AND expires_at > NOW()
    AND reservation_token <> COALESCE(v_res_token, '');

  IF (v_teams_count + v_other_holds) >= v_max_cap THEN
    -- Preserve already-transferred UTR & Drive receipt securely so payment evidence is never lost
    IF v_res_token IS NOT NULL THEN
      UPDATE public.checkout_reservations
      SET status = 'EXPIRED_WITH_UTR',
          utr_number = v_clean_utr,
          receipt_drive_file_id = COALESCE(NULLIF(TRIM(p_drive_file_id), ''), receipt_drive_file_id),
          updated_at = NOW()
      WHERE reservation_token = v_res_token;
    ELSE
      INSERT INTO public.checkout_reservations (
        reservation_token, idempotency_key, member_emails, member_phones, draft_payload, utr_number, receipt_drive_file_id, status, expires_at
      ) VALUES (
        'LATE-' || UPPER(SUBSTRING(ENCODE(gen_random_bytes(5), 'hex') FROM 1 FOR 10)),
        v_clean_key,
        ARRAY(SELECT jsonb_array_elements_text(v_val->'emails')),
        ARRAY(SELECT jsonb_array_elements_text(v_val->'phones')),
        jsonb_build_object('team_name', TRIM(p_team_name), 'track_id', TRIM(p_track_id), 'problem_code', TRIM(p_problem_code), 'members', p_members),
        v_clean_utr,
        NULLIF(TRIM(p_drive_file_id), ''),
        'EXPIRED_WITH_UTR',
        NOW()
      );
    END IF;

    INSERT INTO public.admin_audit_logs (actor_email, action, details)
    VALUES (
      'system:checkout_guard',
      'EXPIRED_OR_FULL_UTR_CLAIM',
      jsonb_build_object('team_name', TRIM(p_team_name), 'utr', v_clean_utr, 'drive_file_id', p_drive_file_id, 'reservation_token', v_res_token)
    );

    RETURN jsonb_build_object(
      'success', false,
      'status_code', 409,
      'code', 'CAPACITY_WITH_UTR_LOGGED',
      'error', 'All ' || v_max_cap || ' team seats have now been claimed. Your UTR (' || v_clean_utr || ') and payment screenshot have been safely logged for manual coordinator reconciliation/refund. Contact vlsireseachlab@siet.ac.in immediately.'
    );
  END IF;

  -- Generate official sequential VTX2-XXX Team ID & recovery token ONLY NOW upon paid completion
  v_seq_val := nextval('public.vtx2_team_seq');
  v_team_id := 'VTX2-' || CASE WHEN v_seq_val < 1000 THEN LPAD(v_seq_val::TEXT, 3, '0') ELSE v_seq_val::TEXT END;
  v_r2_passcode := UPPER(SUBSTRING(ENCODE(gen_random_bytes(4), 'hex') FROM 1 FOR 6));
  v_passcode_hash := crypt(UPPER(TRIM(COALESCE(NULLIF(p_ppt_passcode_plain, ''), v_r2_passcode))), gen_salt('bf', 8));

  v_final_screenshot_url := CASE
    WHEN NULLIF(TRIM(COALESCE(p_drive_file_id, '')), '') IS NOT NULL
      THEN '/api/admin/action?op=file&teamId=' || v_team_id || '&fileId=' || TRIM(p_drive_file_id)
    ELSE TRIM(p_screenshot_url)
  END;

  INSERT INTO public.teams (
    team_id, team_name, track_id, problem_code, academic_tier, team_size,
    secret_passcode, ppt_passcode_hash, round1_status, is_shortlisted,
    shortlisted_at, payment_deadline, utr_number, payment_screenshot_url,
    round2_receipt_drive_file_id, is_paid_verified, idempotency_key, gas_sync_status
  ) VALUES (
    v_team_id, TRIM(p_team_name), TRIM(p_track_id), TRIM(p_problem_code), v_computed_tier, 3,
    v_r2_passcode, v_passcode_hash, 'pending', true,
    NOW(), NULL, v_clean_utr, v_final_screenshot_url,
    NULLIF(TRIM(p_drive_file_id), ''), false, v_clean_key, 'pending'
  );

  FOR v_member IN SELECT * FROM jsonb_array_elements(p_members)
  LOOP
    v_member_level := COALESCE(NULLIF(TRIM(v_member->>'level'), ''), 'UG');
    INSERT INTO public.members (
      team_id, role, name, email, phone, gender, college_name, department, year_of_study,
      level, degree, roll_no, organisation, designation
    ) VALUES (
      v_team_id,
      COALESCE(v_member->>'role', 'member'),
      COALESCE(NULLIF(TRIM(v_member->>'full_name'), ''), NULLIF(TRIM(v_member->>'name'), ''), 'Participant'),
      LOWER(TRIM(COALESCE(v_member->>'email', ''))),
      RIGHT(REGEXP_REPLACE(COALESCE(v_member->>'phone', ''), '[^0-9]', '', 'g'), 10),
      COALESCE(NULLIF(TRIM(v_member->>'gender'), ''), 'Not Specified'),
      CASE WHEN LOWER(v_member_level) = 'working professional'
        THEN COALESCE(NULLIF(TRIM(v_member->>'organisation'), ''), 'Working Professional')
        ELSE TRIM(v_member->>'college_name') END,
      CASE WHEN LOWER(v_member_level) = 'working professional'
        THEN COALESCE(NULLIF(TRIM(v_member->>'designation'), ''), 'Industry')
        ELSE TRIM(v_member->>'department') END,
      CASE WHEN LOWER(v_member_level) = 'working professional'
        THEN 'Professional'
        ELSE TRIM(v_member->>'year_of_study') END,
      v_member_level,
      NULLIF(TRIM(COALESCE(v_member->>'degree', '')), ''),
      NULLIF(TRIM(COALESCE(v_member->>'roll_no', '')), ''),
      NULLIF(TRIM(COALESCE(v_member->>'organisation', '')), ''),
      NULLIF(TRIM(COALESCE(v_member->>'designation', '')), '')
    );
  END LOOP;

  IF v_res_token IS NOT NULL THEN
    UPDATE public.checkout_reservations
    SET status = 'COMPLETED',
        completed_team_id = v_team_id,
        utr_number = v_clean_utr,
        receipt_drive_file_id = COALESCE(NULLIF(TRIM(p_drive_file_id), ''), receipt_drive_file_id),
        receipt_url = v_final_screenshot_url,
        updated_at = NOW()
    WHERE reservation_token = v_res_token;
  END IF;

  INSERT INTO public.sync_jobs (job_type, team_id, status, payload_summary)
  VALUES ('REGISTER_SYNC', v_team_id, 'PENDING', jsonb_build_object('team_id', v_team_id, 'team_name', TRIM(p_team_name), 'utr', v_clean_utr));

  RETURN jsonb_build_object(
    'success', true,
    'idempotent_replay', false,
    'team_id', v_team_id,
    'team_name', TRIM(p_team_name),
    'track_id', TRIM(p_track_id),
    'problem_code', TRIM(p_problem_code),
    'academic_tier', v_computed_tier,
    'payment_token', v_r2_passcode,
    'utr_number', v_clean_utr,
    'payment_status', 'PENDING_VERIFICATION',
    'message', E'Registration submitted successfully!\nYour payment evidence has been received and is awaiting verification by the organizing committee. You will receive an official confirmation email once your payment is verified.'
  );
END;
$$;

-- Legacy register_free_team_v2 blocked from creating permanent unpaid registrations
CREATE OR REPLACE FUNCTION public.register_free_team_v2(
  p_team_name TEXT,
  p_track_id TEXT,
  p_problem_code TEXT,
  p_team_size INT,
  p_members JSONB,
  p_ppt_passcode_plain TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN jsonb_build_object(
    'success', false,
    'error', 'Unpaid registrations are disabled. Payment evidence submission is mandatory to complete registration.'
  );
END;
$$;

-- 9. Preserve Legacy Team / Recovery Payment RPCs (for VTX2-034..036 manually unlocked by Admin)
CREATE OR REPLACE FUNCTION public.verify_round2_gatekeeper(p_team_id TEXT, p_passcode TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_team RECORD;
  v_ev RECORD;
  v_fee_per_head INT := 500;
BEGIN
  SELECT * INTO v_ev FROM public.event_state WHERE id = 1;
  IF FOUND THEN
    v_fee_per_head := COALESCE(v_ev.round2_fee_per_member, 500);
  END IF;

  SELECT * INTO v_team
  FROM public.teams
  WHERE UPPER(team_id) = UPPER(TRIM(p_team_id))
    AND UPPER(secret_passcode) = UPPER(TRIM(p_passcode))
    AND round1_status <> 'rejected';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Invalid Team ID or recovery token, or team registration was rejected.');
  END IF;

  IF NOT COALESCE(v_team.is_shortlisted, false) THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Legacy payment access is not yet authorized for this team. Contact vlsireseachlab@siet.ac.in.');
  END IF;

  IF COALESCE(v_ev.round2_payment_open, false) = false THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Live UPI payments are pending official coordinator QR verification.');
  END IF;

  RETURN jsonb_build_object(
    'valid', true,
    'team_id', v_team.team_id,
    'team_name', v_team.team_name,
    'team_size', v_team.team_size,
    'fee_per_member', v_fee_per_head,
    'total_fee', v_team.team_size * v_fee_per_head,
    'is_paid_verified', v_team.is_paid_verified,
    'submitted_utr', v_team.utr_number,
    'payment_deadline', v_team.payment_deadline
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_round2_payment(
  p_team_id TEXT,
  p_passcode TEXT,
  p_utr_number TEXT,
  p_screenshot_url TEXT,
  p_drive_file_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_team RECORD;
  v_ev RECORD;
  v_clean_utr TEXT := TRIM(COALESCE(p_utr_number, ''));
  v_dup_team_id TEXT;
BEGIN
  PERFORM pg_advisory_xact_lock(74218932);

  SELECT * INTO v_ev FROM public.event_state WHERE id = 1;
  IF COALESCE(v_ev.round2_payment_open, false) = false THEN
    RETURN jsonb_build_object('success', false, 'error', 'Live UPI payments are pending official coordinator QR verification.');
  END IF;

  SELECT * INTO v_team
  FROM public.teams
  WHERE UPPER(team_id) = UPPER(TRIM(p_team_id))
    AND UPPER(secret_passcode) = UPPER(TRIM(p_passcode))
    AND is_shortlisted = true
    AND round1_status <> 'rejected';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Invalid legacy team recovery session or rejected registration.');
  END IF;

  IF v_team.is_paid_verified THEN
    RETURN jsonb_build_object('success', true, 'message', 'Payment is already verified for this team.');
  END IF;

  IF LENGTH(v_clean_utr) <> 12 OR v_clean_utr !~ '^[0-9]+$' THEN
    RETURN jsonb_build_object('success', false, 'error', 'UTR number must be exactly 12 numeric digits.');
  END IF;

  SELECT team_id INTO v_dup_team_id
  FROM public.teams
  WHERE utr_number = v_clean_utr
    AND team_id <> v_team.team_id
    AND round1_status <> 'rejected'
  LIMIT 1;

  IF FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Duplicate transaction reference: UTR ' || v_clean_utr || ' was already submitted by Team ' || v_dup_team_id || '.');
  END IF;

  UPDATE public.teams
  SET utr_number = v_clean_utr,
      payment_screenshot_url = TRIM(p_screenshot_url),
      round2_receipt_drive_file_id = COALESCE(NULLIF(TRIM(p_drive_file_id), ''), round2_receipt_drive_file_id),
      updated_at = NOW()
  WHERE team_id = v_team.team_id;

  INSERT INTO public.sync_jobs (job_type, team_id, status, payload_summary)
  VALUES ('STATUS_SHEET_SYNC', v_team.team_id, 'PENDING', jsonb_build_object('team_id', v_team.team_id, 'event', 'PAYMENT_SUBMITTED', 'utr', v_clean_utr));

  RETURN jsonb_build_object(
    'success', true,
    'message', E'Registration submitted successfully!\nYour payment evidence has been received and is awaiting verification by the organizing committee. You will receive an official confirmation email once your payment is verified.'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.recover_team_identity(
  p_email TEXT,
  p_phone TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_email TEXT := LOWER(TRIM(COALESCE(p_email, '')));
  v_phone TEXT := RIGHT(REGEXP_REPLACE(COALESCE(p_phone, ''), '[^0-9]', '', 'g'), 10);
  v_team RECORD;
BEGIN
  IF v_email = '' OR LENGTH(v_phone) < 10 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Both registered email and 10-digit mobile number are required.');
  END IF;

  SELECT t.team_id, t.team_name, t.track_id, t.problem_code, t.team_size, t.secret_passcode,
         t.is_shortlisted, t.is_paid_verified, t.utr_number, t.payment_deadline, t.round1_status
  INTO v_team
  FROM public.members m
  JOIN public.teams t ON t.team_id = m.team_id
  WHERE LOWER(TRIM(m.email)) = v_email
    AND RIGHT(REGEXP_REPLACE(m.phone, '[^0-9]', '', 'g'), 10) = v_phone
    AND t.round1_status <> 'rejected'
  ORDER BY t.created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'No active team found matching both that email and phone number.');
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'team_id', v_team.team_id,
    'team_name', v_team.team_name,
    'track_id', v_team.track_id,
    'problem_code', v_team.problem_code,
    'team_size', v_team.team_size,
    'payment_token', CASE WHEN v_team.is_shortlisted THEN v_team.secret_passcode ELSE NULL END,
    'is_shortlisted', v_team.is_shortlisted,
    'is_paid_verified', v_team.is_paid_verified,
    'submitted_utr', v_team.utr_number,
    'payment_deadline', v_team.payment_deadline
  );
END;
$$;

-- 10. Admin Helpers: Grant legacy payment access, Verify/Reject Payment, Update Cap/TTL
CREATE OR REPLACE FUNCTION public.admin_grant_payment_access(p_team_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_team RECORD;
BEGIN
  IF NOT public.is_authorized_coordinator() AND auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Access denied. Authorized coordinator account required.';
  END IF;

  UPDATE public.teams
  SET is_shortlisted = true,
      shortlisted_at = COALESCE(shortlisted_at, NOW()),
      payment_deadline = NULL,
      round1_status = CASE WHEN round1_status = 'rejected' THEN 'pending' ELSE round1_status END,
      updated_at = NOW()
  WHERE UPPER(team_id) = UPPER(TRIM(p_team_id))
  RETURNING * INTO v_team;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Team not found.');
  END IF;

  INSERT INTO public.admin_audit_logs (actor_email, action, target_team_id, details)
  VALUES (COALESCE(auth.jwt()->>'email', 'service_role'), 'GRANT_PAYMENT_ACCESS', v_team.team_id, '{}'::JSONB);

  INSERT INTO public.sync_jobs (job_type, team_id, status, payload_summary)
  VALUES ('STATUS_SHEET_SYNC', v_team.team_id, 'PENDING', jsonb_build_object('team_id', v_team.team_id, 'event', 'PAYMENT_ACCESS_GRANTED'));

  RETURN jsonb_build_object('success', true, 'team_id', v_team.team_id, 'is_shortlisted', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_verify_round2_payment(
  p_team_id TEXT,
  p_verified BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_team RECORD;
BEGIN
  IF NOT public.is_authorized_coordinator() AND auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Access denied. Authorized coordinator account required.';
  END IF;

  UPDATE public.teams
  SET is_paid_verified = p_verified,
      round1_status = CASE WHEN p_verified THEN 'shortlisted' ELSE 'pending' END,
      is_shortlisted = true,
      updated_at = NOW()
  WHERE UPPER(team_id) = UPPER(TRIM(p_team_id))
  RETURNING team_id, is_paid_verified, round1_status INTO v_team;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Team not found.');
  END IF;

  INSERT INTO public.admin_audit_logs (actor_email, action, target_team_id, details)
  VALUES (COALESCE(auth.jwt()->>'email', 'service_role'), CASE WHEN p_verified THEN 'VERIFY_PAYMENT_CONFIRMED' ELSE 'MARK_PAYMENT_PENDING' END, v_team.team_id, jsonb_build_object('is_paid_verified', p_verified));

  INSERT INTO public.sync_jobs (job_type, team_id, status, payload_summary)
  VALUES ('STATUS_SHEET_SYNC', v_team.team_id, 'PENDING', jsonb_build_object('team_id', v_team.team_id, 'event', CASE WHEN p_verified THEN 'CONFIRMED' ELSE 'PENDING_VERIFICATION' END));

  RETURN jsonb_build_object('success', true, 'team_id', v_team.team_id, 'is_paid_verified', v_team.is_paid_verified, 'round1_status', v_team.round1_status);
END;
$$;

-- Drop legacy 13-parameter overload from 010 so PostgREST never hits PGRST203 ambiguity
DROP FUNCTION IF EXISTS public.admin_update_event_state(
  BOOLEAN, BOOLEAN, BOOLEAN, INT, BOOLEAN, TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ
);

CREATE OR REPLACE FUNCTION public.admin_update_event_state(
  p_round1_open BOOLEAN DEFAULT NULL,
  p_ppt_submission_open BOOLEAN DEFAULT NULL,
  p_round2_payment_open BOOLEAN DEFAULT NULL,
  p_round2_fee_per_member INT DEFAULT NULL,
  p_is_clock_public BOOLEAN DEFAULT NULL,
  p_clock_state TEXT DEFAULT NULL,
  p_live_announcement_text TEXT DEFAULT NULL,
  p_ppt_deadline_override TEXT DEFAULT NULL,
  p_registration_override TEXT DEFAULT NULL,
  p_ppt_window_end TIMESTAMPTZ DEFAULT NULL,
  p_registration_deadline TIMESTAMPTZ DEFAULT NULL,
  p_clock_start_timestamp TIMESTAMPTZ DEFAULT NULL,
  p_clock_end_timestamp TIMESTAMPTZ DEFAULT NULL,
  p_max_teams_cap INT DEFAULT NULL,
  p_payment_reservation_minutes INT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_ev RECORD;
BEGIN
  IF NOT public.is_authorized_coordinator() AND auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Access denied. Authorized coordinator account required.';
  END IF;

  UPDATE public.event_state
  SET round1_open = COALESCE(p_round1_open, round1_open),
      ppt_submission_open = COALESCE(p_ppt_submission_open, ppt_submission_open),
      round2_payment_open = COALESCE(p_round2_payment_open, round2_payment_open),
      round2_fee_per_member = COALESCE(p_round2_fee_per_member, round2_fee_per_member),
      is_clock_public = COALESCE(p_is_clock_public, is_clock_public),
      clock_state = COALESCE(p_clock_state, clock_state),
      live_announcement_text = COALESCE(p_live_announcement_text, live_announcement_text),
      ppt_deadline_override = COALESCE(p_ppt_deadline_override, ppt_deadline_override),
      registration_override = COALESCE(p_registration_override, registration_override),
      ppt_window_end = COALESCE(p_ppt_window_end, ppt_window_end),
      registration_deadline = COALESCE(p_registration_deadline, registration_deadline),
      clock_start_timestamp = COALESCE(p_clock_start_timestamp, clock_start_timestamp),
      clock_end_timestamp = COALESCE(p_clock_end_timestamp, clock_end_timestamp),
      max_teams_cap = COALESCE(p_max_teams_cap, max_teams_cap),
      payment_reservation_minutes = COALESCE(p_payment_reservation_minutes, payment_reservation_minutes),
      updated_at = NOW()
  WHERE id = 1
  RETURNING * INTO v_ev;

  INSERT INTO public.admin_audit_logs (actor_email, action, details)
  VALUES (
    COALESCE(auth.jwt()->>'email', 'service_role'),
    'UPDATE_EVENT_STATE',
    jsonb_build_object(
      'round1_open', v_ev.round1_open,
      'round2_payment_open', v_ev.round2_payment_open,
      'registration_override', v_ev.registration_override,
      'max_teams_cap', v_ev.max_teams_cap,
      'payment_reservation_minutes', v_ev.payment_reservation_minutes
    )
  );

  RETURN to_jsonb(v_ev);
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_due_sync_jobs(p_limit INT DEFAULT 5)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_now TIMESTAMPTZ := NOW();
  v_claimed JSONB := '[]'::JSONB;
  v_job RECORD;
  v_team RECORD;
  v_members JSONB;
  v_backoff_secs INT;
BEGIN
  FOR v_job IN
    SELECT *
    FROM public.sync_jobs
    WHERE status IN ('PENDING', 'FAILED')
      AND job_type IN ('REGISTER_SYNC', 'STATUS_SHEET_SYNC')
      AND attempts < max_attempts
      AND next_retry_at <= v_now
      AND (claimed_at IS NULL OR claimed_at < v_now - INTERVAL '90 seconds')
    ORDER BY next_retry_at ASC, created_at ASC
    LIMIT GREATEST(1, LEAST(10, p_limit))
    FOR UPDATE SKIP LOCKED
  LOOP
    v_backoff_secs := LEAST(21600, (30 * POWER(4, LEAST(v_job.attempts, 4)))::INT);

    UPDATE public.sync_jobs
    SET claimed_at = v_now,
        last_attempt_at = v_now,
        attempts = attempts + 1,
        next_retry_at = v_now + MAKE_INTERVAL(secs => v_backoff_secs),
        updated_at = v_now
    WHERE id = v_job.id;

    SELECT * INTO v_team FROM public.teams WHERE team_id = v_job.team_id;
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'role', m.role,
        'full_name', m.name,
        'name', m.name,
        'email', m.email,
        'phone', m.phone,
        'gender', m.gender,
        'college_name', m.college_name,
        'level', COALESCE(m.level, 'UG'),
        'degree', COALESCE(m.degree, ''),
        'department', m.department,
        'year_of_study', m.year_of_study
      ) ORDER BY (m.role = 'leader') DESC
    ), '[]'::JSONB) INTO v_members
    FROM public.members m
    WHERE m.team_id = v_job.team_id;

    v_claimed := v_claimed || jsonb_build_object(
      'id', v_job.id,
      'job_type', v_job.job_type,
      'team_id', v_job.team_id,
      'attempts', v_job.attempts + 1,
      'team', CASE WHEN v_team.team_id IS NOT NULL THEN jsonb_build_object(
        'team_id', v_team.team_id,
        'team_name', v_team.team_name,
        'track_id', v_team.track_id,
        'problem_code', v_team.problem_code,
        'academic_tier', v_team.academic_tier,
        'is_shortlisted', v_team.is_shortlisted,
        'is_paid_verified', v_team.is_paid_verified,
        'utr_number', v_team.utr_number,
        'round1_status', v_team.round1_status,
        'payment_deadline', v_team.payment_deadline
      ) ELSE NULL END,
      'members', v_members
    );
  END LOOP;

  RETURN v_claimed;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_team_status(
  p_team_id TEXT,
  p_status TEXT,
  p_is_shortlisted BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_team RECORD;
BEGIN
  IF NOT public.is_authorized_coordinator() AND auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Access denied. Authorized coordinator account required.';
  END IF;

  SELECT * INTO v_team FROM public.teams WHERE UPPER(team_id) = UPPER(TRIM(p_team_id));
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Team not found.');
  END IF;

  UPDATE public.teams
  SET round1_status = p_status,
      is_shortlisted = p_is_shortlisted,
      is_paid_verified = CASE WHEN p_status = 'rejected' THEN false ELSE is_paid_verified END,
      updated_at = NOW()
  WHERE UPPER(team_id) = UPPER(TRIM(p_team_id));

  INSERT INTO public.admin_audit_logs (actor_email, action, target_team_id, details)
  VALUES (
    COALESCE(auth.jwt()->>'email', 'service_role'),
    'UPDATE_TEAM_STATUS',
    v_team.team_id,
    jsonb_build_object('status', p_status, 'is_shortlisted', p_is_shortlisted)
  );

  INSERT INTO public.sync_jobs (job_type, team_id, status, payload_summary)
  VALUES ('STATUS_SHEET_SYNC', v_team.team_id, 'PENDING', jsonb_build_object('team_id', v_team.team_id, 'event', p_status));

  RETURN jsonb_build_object(
    'success', true,
    'team_id', v_team.team_id,
    'round1_status', p_status,
    'is_shortlisted', p_is_shortlisted
  );
END;
$$;

-- Restrictive Privileges: Internal checkout/registration mutations are strictly server-only (service_role)
REVOKE ALL ON FUNCTION public._validate_and_normalize_team_draft(TEXT, TEXT, TEXT, INT, JSONB, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public._validate_and_normalize_team_draft(TEXT, TEXT, TEXT, INT, JSONB, TEXT) TO service_role;

REVOKE ALL ON FUNCTION public.reserve_checkout_slot(TEXT, TEXT, TEXT, INT, JSONB, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_checkout_slot(TEXT, TEXT, TEXT, INT, JSONB, TEXT, TEXT) TO service_role;

REVOKE ALL ON FUNCTION public.preflight_paid_registration(TEXT, TEXT, TEXT, INT, JSONB, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.preflight_paid_registration(TEXT, TEXT, TEXT, INT, JSONB, TEXT, TEXT, TEXT) TO service_role;

REVOKE ALL ON FUNCTION public.save_reservation_receipt(TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.save_reservation_receipt(TEXT, TEXT, TEXT) TO service_role;

REVOKE ALL ON FUNCTION public.complete_paid_registration(TEXT, TEXT, TEXT, INT, JSONB, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_paid_registration(TEXT, TEXT, TEXT, INT, JSONB, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO service_role;

REVOKE ALL ON FUNCTION public.admin_grant_payment_access(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_grant_payment_access(TEXT) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.admin_update_event_state(BOOLEAN, BOOLEAN, BOOLEAN, INT, BOOLEAN, TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ, INT, INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_update_event_state(BOOLEAN, BOOLEAN, BOOLEAN, INT, BOOLEAN, TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ, INT, INT) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.get_public_capacity() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_capacity() TO anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.get_window_status() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_window_status() TO anon, authenticated, service_role;

-- NOTE ON EXISTING GENUINE TEAMS (VTX2-034, VTX2-035, VTX2-036):
-- Grant legacy payment recovery access via:
--   SELECT public.admin_grant_payment_access('VTX2-034');
--   SELECT public.admin_grant_payment_access('VTX2-035');
--   SELECT public.admin_grant_payment_access('VTX2-036');
-- Never delete VTX2-032 / VTX2-033 automatically here.
