-- ==============================================================================
-- VELTRAXX 2.0 - PRODUCTION RELIABILITY, SECURITY & HARDENING MIGRATION
-- File: backend_sql/010_production_hardening_v2.sql
-- Status: Incremental, Non-Destructive, Reversible Migration
-- Prerequisites: Runs cleanly over 000_FULL_DATABASE_SETUP.sql without dropping data.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. COORDINATOR ALLOWLIST & SQL AUTH HELPER (Fixes Privilege Escalation)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coordinator_allowlist (
  email TEXT PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'coordinator',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.coordinator_allowlist (email, role, is_active) VALUES
  ('admin@veltraxx.com', 'admin', true),
  ('dhilipkumarece@siet.ac.in', 'convener', true),
  ('trenitacdc@siet.ac.in', 'coordinator', true),
  ('premacece@siet.ac.in', 'coordinator', true),
  ('priscillasobhiaece@siet.ac.in', 'coordinator', true),
  ('vasanthiece@siet.ac.in', 'coordinator', true),
  ('darshanra24vl@srishakthi.ac.in', 'student_lead', true),
  ('subikshal24vl@srishakthi.ac.in', 'student_coordinator', true),
  ('darshan4721@gmail.com', 'admin', true),
  ('vlsireseachlab@siet.ac.in', 'lab_admin', true)
ON CONFLICT (email) DO NOTHING;

ALTER TABLE public.coordinator_allowlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service and coordinators read allowlist" ON public.coordinator_allowlist;
CREATE POLICY "Service and coordinators read allowlist" ON public.coordinator_allowlist
  FOR SELECT TO authenticated
  USING (LOWER(email) = LOWER(COALESCE(auth.jwt()->>'email', '')));

CREATE OR REPLACE FUNCTION public.is_authorized_coordinator()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1
      FROM public.coordinator_allowlist c
      WHERE LOWER(c.email) = LOWER(COALESCE(auth.jwt()->>'email', ''))
        AND c.is_active = true
    );
$$;

-- ------------------------------------------------------------------------------
-- 2. INCREMENTAL TABLE EXTENSIONS (Preserves All Existing Rows & Identifiers)
-- ------------------------------------------------------------------------------
ALTER TABLE public.teams
  ADD COLUMN IF NOT EXISTS ppt_passcode_hash TEXT,
  ADD COLUMN IF NOT EXISTS prev_ppt_passcode_hash TEXT,
  ADD COLUMN IF NOT EXISTS prev_passcode_grace_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ppt_drive_file_id TEXT,
  ADD COLUMN IF NOT EXISTS ppt_file_name TEXT,
  ADD COLUMN IF NOT EXISTS ppt_file_size_bytes INT,
  ADD COLUMN IF NOT EXISTS ppt_file_sha256 TEXT,
  ADD COLUMN IF NOT EXISTS ppt_page_count INT,
  ADD COLUMN IF NOT EXISTS ppt_current_version INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ppt_receipt_id TEXT,
  ADD COLUMN IF NOT EXISTS ppt_archive_folder_url TEXT,
  ADD COLUMN IF NOT EXISTS round2_receipt_drive_file_id TEXT,
  ADD COLUMN IF NOT EXISTS gas_sync_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS gas_last_error TEXT,
  ADD COLUMN IF NOT EXISTS gas_synced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS drive_folder_url TEXT;

ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'UG',
  ADD COLUMN IF NOT EXISTS degree TEXT,
  ADD COLUMN IF NOT EXISTS roll_no TEXT,
  ADD COLUMN IF NOT EXISTS organisation TEXT,
  ADD COLUMN IF NOT EXISTS designation TEXT;

ALTER TABLE public.event_state
  ADD COLUMN IF NOT EXISTS registration_deadline TIMESTAMPTZ NOT NULL DEFAULT '2026-12-07T23:59:59+05:30',
  ADD COLUMN IF NOT EXISTS ppt_window_start TIMESTAMPTZ NOT NULL DEFAULT '2026-11-25T00:00:00+05:30',
  ADD COLUMN IF NOT EXISTS ppt_window_end TIMESTAMPTZ NOT NULL DEFAULT '2026-12-08T23:59:59+05:30',
  ADD COLUMN IF NOT EXISTS ppt_grace_minutes INT NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS ppt_deadline_override TEXT NOT NULL DEFAULT 'AUTO',
  ADD COLUMN IF NOT EXISTS registration_override TEXT NOT NULL DEFAULT 'AUTO',
  ADD COLUMN IF NOT EXISTS clock_start_timestamp TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS clock_end_timestamp TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_event_state_ppt_override'
  ) THEN
    ALTER TABLE public.event_state
      ADD CONSTRAINT chk_event_state_ppt_override
      CHECK (ppt_deadline_override IN ('AUTO', 'FORCE_OPEN', 'FORCE_CLOSED'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_event_state_reg_override'
  ) THEN
    ALTER TABLE public.event_state
      ADD CONSTRAINT chk_event_state_reg_override
      CHECK (registration_override IN ('AUTO', 'FORCE_OPEN', 'FORCE_CLOSED'));
  END IF;
END $$;

-- Update initial window configuration to enable immediate PPT submission once deployed
UPDATE public.event_state
SET ppt_submission_open = true,
    ppt_window_start = COALESCE(ppt_window_start, '2026-11-25T00:00:00+05:30'::TIMESTAMPTZ),
    ppt_window_end = '2026-12-08T23:59:59+05:30'::TIMESTAMPTZ,
    registration_deadline = '2026-12-07T23:59:59+05:30'::TIMESTAMPTZ,
    updated_at = NOW()
WHERE id = 1;

-- ------------------------------------------------------------------------------
-- 3. SUBMISSION ATTEMPTS, IMMUTABLE VERSION HISTORY, SYNC JOBS, RATE LIMITS, AUDIT
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ppt_submission_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  idempotency_key TEXT UNIQUE NOT NULL,
  team_id TEXT NOT NULL REFERENCES public.teams(team_id) ON DELETE CASCADE,
  attempt_number INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'INITIATED' CHECK (status IN ('INITIATED', 'UPLOADING', 'CONFIRMED', 'FAILED', 'INTERRUPTED', 'SUPERSEDED')),
  file_name TEXT NOT NULL,
  file_size_bytes INT NOT NULL CHECK (file_size_bytes > 0 AND file_size_bytes <= 3145728),
  file_sha256 TEXT NOT NULL,
  page_count INT NOT NULL CHECK (page_count >= 1 AND page_count <= 8),
  extracted_text TEXT DEFAULT '',
  drive_file_id TEXT,
  drive_preview_url TEXT,
  receipt_id TEXT,
  error_code TEXT,
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  grace_expires_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ppt_attempts_team_status ON public.ppt_submission_attempts(team_id, status, started_at DESC);

CREATE TABLE IF NOT EXISTS public.ppt_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id TEXT NOT NULL REFERENCES public.teams(team_id) ON DELETE CASCADE,
  version INT NOT NULL,
  receipt_id TEXT UNIQUE NOT NULL,
  attempt_id UUID REFERENCES public.ppt_submission_attempts(id) ON DELETE SET NULL,
  drive_file_id TEXT NOT NULL,
  drive_preview_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size_bytes INT NOT NULL CHECK (file_size_bytes > 0 AND file_size_bytes <= 3145728),
  file_sha256 TEXT NOT NULL,
  page_count INT NOT NULL CHECK (page_count >= 1 AND page_count <= 8),
  extracted_text TEXT DEFAULT '',
  is_current BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(team_id, version)
);

CREATE INDEX IF NOT EXISTS idx_ppt_submissions_team_current ON public.ppt_submissions(team_id, is_current, version DESC);

CREATE TABLE IF NOT EXISTS public.sync_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL CHECK (job_type IN ('REGISTER_SYNC', 'PPT_SHEET_SYNC', 'SHORTLIST_EMAIL', 'PASSCODE_RECOVERY_EMAIL')),
  team_id TEXT REFERENCES public.teams(team_id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SYNCED', 'FAILED')),
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 6,
  next_retry_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  claimed_at TIMESTAMPTZ,
  last_attempt_at TIMESTAMPTZ,
  last_error TEXT,
  payload_summary JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.sync_jobs
  ADD COLUMN IF NOT EXISTS max_attempts INT NOT NULL DEFAULT 6,
  ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_attempt_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_sync_jobs_status ON public.sync_jobs(status, next_retry_at, updated_at DESC);

-- Global cross-instance distributed upload coordination semaphore (max 20 concurrent Drive uploads across ALL serverless instances)
CREATE TABLE IF NOT EXISTS public.upload_concurrency_slots (
  slot_id INT PRIMARY KEY,
  owner_attempt_id UUID,
  acquired_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

INSERT INTO public.upload_concurrency_slots (slot_id)
SELECT gs FROM generate_series(1, 20) AS gs
ON CONFLICT (slot_id) DO NOTHING;

ALTER TABLE public.upload_concurrency_slots ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_email TEXT NOT NULL,
  action TEXT NOT NULL,
  target_team_id TEXT,
  details JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_created ON public.admin_audit_logs(created_at DESC);

CREATE TABLE IF NOT EXISTS public.rate_limit_buckets (
  bucket_key TEXT PRIMARY KEY,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  request_count INT NOT NULL DEFAULT 1
);

-- Enable strict RLS on all new tables (Anon has ZERO access; coordinators read-only where appropriate)
ALTER TABLE public.ppt_submission_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ppt_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_buckets ENABLE ROW LEVEL SECURITY;

-- Replace permissive legacy 'authenticated' & duplicate 'event_state' policies with coordinator allowlist check
DROP POLICY IF EXISTS "Authenticated full control teams" ON public.teams;
DROP POLICY IF EXISTS "Authenticated full control members" ON public.members;
DROP POLICY IF EXISTS "Authenticated full control reports" ON public.user_reports;
DROP POLICY IF EXISTS "Authenticated full control event state" ON public.event_state;
DROP POLICY IF EXISTS "Public read event state" ON public.event_state;

CREATE POLICY "Authorized coordinators control teams" ON public.teams
  FOR ALL TO authenticated
  USING (public.is_authorized_coordinator()) WITH CHECK (public.is_authorized_coordinator());

CREATE POLICY "Authorized coordinators control members" ON public.members
  FOR ALL TO authenticated
  USING (public.is_authorized_coordinator()) WITH CHECK (public.is_authorized_coordinator());

CREATE POLICY "Authorized coordinators control reports" ON public.user_reports
  FOR ALL TO authenticated
  USING (public.is_authorized_coordinator()) WITH CHECK (public.is_authorized_coordinator());

CREATE POLICY "Authorized coordinators insert event state" ON public.event_state
  FOR INSERT TO authenticated
  WITH CHECK (public.is_authorized_coordinator());

CREATE POLICY "Authorized coordinators update event state" ON public.event_state
  FOR UPDATE TO authenticated
  USING (public.is_authorized_coordinator()) WITH CHECK (public.is_authorized_coordinator());

CREATE POLICY "Authorized coordinators delete event state" ON public.event_state
  FOR DELETE TO authenticated
  USING (public.is_authorized_coordinator());

DROP POLICY IF EXISTS "Authorized coordinators read attempts" ON public.ppt_submission_attempts;
CREATE POLICY "Authorized coordinators read attempts" ON public.ppt_submission_attempts
  FOR SELECT TO authenticated USING (public.is_authorized_coordinator());

DROP POLICY IF EXISTS "Authorized coordinators read submissions" ON public.ppt_submissions;
CREATE POLICY "Authorized coordinators read submissions" ON public.ppt_submissions
  FOR SELECT TO authenticated USING (public.is_authorized_coordinator());

DROP POLICY IF EXISTS "Authorized coordinators manage sync jobs" ON public.sync_jobs;
CREATE POLICY "Authorized coordinators manage sync jobs" ON public.sync_jobs
  FOR ALL TO authenticated
  USING (public.is_authorized_coordinator()) WITH CHECK (public.is_authorized_coordinator());

DROP POLICY IF EXISTS "Authorized coordinators read audit logs" ON public.admin_audit_logs;
CREATE POLICY "Authorized coordinators read audit logs" ON public.admin_audit_logs
  FOR SELECT TO authenticated USING (public.is_authorized_coordinator());

-- ------------------------------------------------------------------------------
-- 4. PHASED COMPATIBILITY GUARD (Moved Legacy Drops/Revokes to 011_revoke_legacy_rpcs.sql)
-- ------------------------------------------------------------------------------
-- Intentionally preserves legacy register_free_team / lookup_* / submit_round1_ppt
-- signatures during Phase A migration so currently deployed `main` registration
-- stays live with zero downtime until Vercel finishes deploying the new frontend.
-- Execute backend_sql/011_revoke_legacy_rpcs.sql immediately AFTER Vercel cutover!

-- ------------------------------------------------------------------------------
-- 5. SLIDING-WINDOW RATE LIMITER & WINDOW EVALUATION HELPERS
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_bucket_key TEXT,
  p_max_requests INT,
  p_window_seconds INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_row RECORD;
  v_now TIMESTAMPTZ := NOW();
  v_retry_after INT := 0;
BEGIN
  INSERT INTO public.rate_limit_buckets (bucket_key, window_start, request_count)
  VALUES (p_bucket_key, v_now, 1)
  ON CONFLICT (bucket_key) DO UPDATE
  SET
    request_count = CASE
      WHEN public.rate_limit_buckets.window_start + MAKE_INTERVAL(secs => p_window_seconds) <= v_now THEN 1
      ELSE public.rate_limit_buckets.request_count + 1
    END,
    window_start = CASE
      WHEN public.rate_limit_buckets.window_start + MAKE_INTERVAL(secs => p_window_seconds) <= v_now THEN v_now
      ELSE public.rate_limit_buckets.window_start
    END
  RETURNING * INTO v_row;

  IF v_row.request_count > p_max_requests THEN
    v_retry_after := GREATEST(1, CEIL(EXTRACT(EPOCH FROM ((v_row.window_start + MAKE_INTERVAL(secs => p_window_seconds)) - v_now)))::INT);
    RETURN jsonb_build_object('allowed', false, 'retry_after_seconds', v_retry_after, 'count', v_row.request_count);
  END IF;

  RETURN jsonb_build_object('allowed', true, 'count', v_row.request_count, 'remaining', GREATEST(0, p_max_requests - v_row.request_count));
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
  v_ppt_open BOOLEAN;
BEGIN
  SELECT * INTO v_ev FROM public.event_state WHERE id = 1;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('registration_open', false, 'ppt_open', false);
  END IF;

  v_reg_open := CASE
    WHEN v_ev.registration_override = 'FORCE_OPEN' THEN true
    WHEN v_ev.registration_override = 'FORCE_CLOSED' THEN false
    ELSE (v_ev.round1_open = true AND v_now <= v_ev.registration_deadline)
  END;

  v_ppt_open := CASE
    WHEN v_ev.ppt_deadline_override = 'FORCE_OPEN' THEN true
    WHEN v_ev.ppt_deadline_override = 'FORCE_CLOSED' THEN false
    ELSE (v_ev.ppt_submission_open = true AND v_now >= v_ev.ppt_window_start AND v_now <= v_ev.ppt_window_end)
  END;

  RETURN jsonb_build_object(
    'now_utc', v_now,
    'registration_open', v_reg_open,
    'registration_deadline', v_ev.registration_deadline,
    'registration_override', v_ev.registration_override,
    'ppt_open', v_ppt_open,
    'ppt_window_start', v_ev.ppt_window_start,
    'ppt_window_end', v_ev.ppt_window_end,
    'ppt_grace_minutes', v_ev.ppt_grace_minutes,
    'ppt_deadline_override', v_ev.ppt_deadline_override
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- 6. HARDENED REGISTRATION RPC (register_free_team_v2 - Persists Full Academics & Passcode Hash)
-- ------------------------------------------------------------------------------
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
DECLARE
  v_win JSONB := public.get_window_status();
  v_seq_val INT;
  v_team_id TEXT;
  v_r2_passcode TEXT;
  v_passcode_hash TEXT;
  v_member JSONB;
  v_member_name TEXT;
  v_member_email TEXT;
  v_member_phone TEXT;
  v_member_year TEXT;
  v_member_level TEXT;
  v_member_degree TEXT;
  v_member_dept TEXT;
  v_member_college TEXT;
  v_computed_tier TEXT := 'tier_a';
  v_has_senior BOOLEAN := false;
  v_conflict_team_id TEXT;
  v_conflict_team_name TEXT;
  v_emails TEXT[] := ARRAY[]::TEXT[];
  v_phones TEXT[] := ARRAY[]::TEXT[];
  v_total_claimed INT;
BEGIN
  IF NOT COALESCE((v_win->>'registration_open')::BOOLEAN, false) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Round 1 registration window is currently closed.');
  END IF;

  SELECT COUNT(*) INTO v_total_claimed FROM public.teams WHERE round1_status <> 'rejected';
  IF v_total_claimed >= 2000 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Maximum team capacity reached.');
  END IF;

  IF p_team_size <> 3 OR jsonb_array_length(p_members) <> 3 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Team size must be strictly 3 members (1 Team Leader and 2 Team Members).');
  END IF;

  IF p_team_name IS NULL OR LENGTH(TRIM(p_team_name)) < 3 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Team name must be at least 3 characters.');
  END IF;

  IF p_ppt_passcode_plain IS NULL OR LENGTH(TRIM(p_ppt_passcode_plain)) < 6 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Internal security error: valid team passcode required.');
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
      RETURN jsonb_build_object('success', false, 'error', 'Full name is required for all 3 members.');
    END IF;
    IF v_member_email = '' OR v_member_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
      RETURN jsonb_build_object('success', false, 'error', 'Valid email address required for "' || v_member_name || '".');
    END IF;
    IF LENGTH(v_member_phone) < 10 THEN
      RETURN jsonb_build_object('success', false, 'error', 'Valid 10-digit phone required for "' || v_member_name || '".');
    END IF;

    IF LOWER(v_member_level) <> 'working professional' THEN
      IF v_member_college = '' OR v_member_degree = '' OR v_member_dept = '' OR v_member_year = '' THEN
        RETURN jsonb_build_object('success', false, 'error', 'College, degree, department, and year of study are required for "' || v_member_name || '".');
      END IF;
      IF LOWER(v_member_degree) = 'other' OR LOWER(v_member_dept) = 'other' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Please enter your exact custom degree/department name for "' || v_member_name || '".');
      END IF;
    ELSE
      IF TRIM(COALESCE(v_member->>'organisation', '')) = '' OR TRIM(COALESCE(v_member->>'designation', '')) = '' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Organisation and designation are required for "' || v_member_name || '".');
      END IF;
    END IF;

    IF v_member_email = ANY(v_emails) THEN
      RETURN jsonb_build_object('success', false, 'error', 'Duplicate email entered inside team roster: ' || v_member_email);
    END IF;
    v_emails := array_append(v_emails, v_member_email);

    IF v_member_phone = ANY(v_phones) THEN
      RETURN jsonb_build_object('success', false, 'error', 'Duplicate phone entered inside team roster: ' || v_member_phone);
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
        'success', false,
        'error', 'Member "' || v_member_name || '" (' || v_member_email || ') is already registered with Team ' || v_conflict_team_id || ' ("' || v_conflict_team_name || '").'
      );
    END IF;

    IF LOWER(v_member_level) IN ('pg', 'research scholar', 'working professional')
       OR LOWER(v_member_level) LIKE '%pg%' OR LOWER(v_member_level) LIKE '%research%' OR LOWER(v_member_level) LIKE '%phd%' OR LOWER(v_member_level) LIKE '%master%'
       OR LOWER(v_member_year) LIKE '3%' OR LOWER(v_member_year) LIKE '4%' OR LOWER(v_member_year) LIKE '5%' OR LOWER(v_member_year) LIKE '%final%' OR LOWER(v_member_year) LIKE '%passed%' THEN
      v_has_senior := true;
    END IF;
  END LOOP;

  v_computed_tier := CASE WHEN v_has_senior THEN 'tier_b' ELSE 'tier_a' END;

  v_seq_val := nextval('public.vtx2_team_seq');
  v_team_id := 'VTX2-' || CASE WHEN v_seq_val < 1000 THEN LPAD(v_seq_val::TEXT, 3, '0') ELSE v_seq_val::TEXT END;
  v_r2_passcode := UPPER(SUBSTRING(ENCODE(gen_random_bytes(4), 'hex') FROM 1 FOR 6));
  v_passcode_hash := crypt(UPPER(TRIM(p_ppt_passcode_plain)), gen_salt('bf', 8));

  INSERT INTO public.teams (
    team_id, team_name, track_id, problem_code, academic_tier, team_size,
    secret_passcode, ppt_passcode_hash, round1_status, is_shortlisted, gas_sync_status
  ) VALUES (
    v_team_id, TRIM(p_team_name), TRIM(p_track_id), TRIM(p_problem_code), v_computed_tier, 3,
    v_r2_passcode, v_passcode_hash, 'pending', false, 'pending'
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

  INSERT INTO public.sync_jobs (job_type, team_id, status, payload_summary)
  VALUES ('REGISTER_SYNC', v_team_id, 'PENDING', jsonb_build_object('team_id', v_team_id, 'team_name', TRIM(p_team_name)));

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
-- 7. PPT SUBMISSION PIPELINE RPCS (Initiate, Grace Period, Atomic Replacement Finalize, Status)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.initiate_ppt_submission(
  p_team_id TEXT,
  p_passcode TEXT,
  p_file_name TEXT,
  p_file_size_bytes INT,
  p_file_sha256 TEXT,
  p_page_count INT,
  p_extracted_text TEXT,
  p_idempotency_key TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_team RECORD;
  v_existing RECORD;
  v_ev RECORD;
  v_win JSONB;
  v_now TIMESTAMPTZ := NOW();
  v_grace_until TIMESTAMPTZ;
  v_attempt_num INT;
  v_attempt_id UUID;
  v_attempt_token UUID;
  v_inflight INT;
BEGIN
  -- 1. Check idempotency key first
  SELECT * INTO v_existing FROM public.ppt_submission_attempts WHERE idempotency_key = TRIM(p_idempotency_key);
  IF FOUND THEN
    IF v_existing.status = 'CONFIRMED' THEN
      RETURN jsonb_build_object(
        'success', true,
        'already_confirmed', true,
        'receipt', jsonb_build_object(
          'receipt_id', v_existing.receipt_id,
          'team_id', v_existing.team_id,
          'file_name', v_existing.file_name,
          'submitted_at', v_existing.completed_at,
          'status', 'CONFIRMED'
        )
      );
    END IF;
    IF v_existing.status IN ('INITIATED', 'UPLOADING') AND v_now <= v_existing.grace_expires_at THEN
      RETURN jsonb_build_object(
        'success', true,
        'attempt_id', v_existing.id,
        'attempt_token', v_existing.attempt_token,
        'grace_expires_at', v_existing.grace_expires_at
      );
    END IF;
  END IF;

  -- 2. Lock team row and verify credentials
  SELECT * INTO v_team FROM public.teams WHERE UPPER(team_id) = UPPER(TRIM(p_team_id)) FOR UPDATE;
  IF NOT FOUND OR v_team.round1_status = 'rejected' THEN
    RETURN jsonb_build_object('success', false, 'code', 'INVALID_CREDENTIALS', 'error', 'Incorrect Team ID or team passcode.');
  END IF;

  IF NOT (
    (v_team.ppt_passcode_hash IS NOT NULL AND v_team.ppt_passcode_hash = crypt(UPPER(TRIM(p_passcode)), v_team.ppt_passcode_hash))
    OR (
      v_team.prev_ppt_passcode_hash IS NOT NULL
      AND v_team.prev_passcode_grace_until IS NOT NULL
      AND v_now <= v_team.prev_passcode_grace_until
      AND v_team.prev_ppt_passcode_hash = crypt(UPPER(TRIM(p_passcode)), v_team.prev_ppt_passcode_hash)
    )
  ) THEN
    RETURN jsonb_build_object('success', false, 'code', 'INVALID_CREDENTIALS', 'error', 'Incorrect Team ID or team passcode.');
  END IF;

  -- 3. Enforce submission window backend-side
  SELECT * INTO v_ev FROM public.event_state WHERE id = 1;
  v_win := public.get_window_status();
  IF NOT COALESCE((v_win->>'ppt_open')::BOOLEAN, false) THEN
    RETURN jsonb_build_object('success', false, 'code', 'WINDOW_CLOSED', 'error', 'PPT submission window is currently closed.');
  END IF;

  -- 4. Prevent concurrent overlapping uploads for the same team (deterministic replacement serialization)
  SELECT COUNT(*) INTO v_inflight
  FROM public.ppt_submission_attempts
  WHERE team_id = v_team.team_id
    AND status = 'UPLOADING'
    AND started_at > (v_now - INTERVAL '2 minutes');

  IF v_inflight > 0 THEN
    RETURN jsonb_build_object('success', false, 'code', 'UPLOAD_IN_PROGRESS', 'error', 'Another upload for your team is currently in progress. Please wait a few seconds and retry.');
  END IF;

  -- Supersede any abandoned unstarted INITIATED attempt for this team so only ONE active grace attempt can exist
  UPDATE public.ppt_submission_attempts
  SET status = 'SUPERSEDED',
      error_code = 'SUPERSEDED_BY_NEW_INIT',
      error_message = 'Replaced by newer upload session.'
  WHERE team_id = v_team.team_id
    AND status = 'INITIATED';

  -- 5. File constraints
  IF p_file_size_bytes IS NULL OR p_file_size_bytes <= 0 OR p_file_size_bytes > 3145728 THEN
    RETURN jsonb_build_object('success', false, 'code', 'FILE_TOO_LARGE', 'error', 'File exceeds the strict 3 MB limit.');
  END IF;
  IF p_page_count IS NULL OR p_page_count < 1 OR p_page_count > 8 THEN
    RETURN jsonb_build_object('success', false, 'code', 'PAGE_COUNT_EXCEEDED', 'error', 'PDF must contain between 1 and 8 slides.');
  END IF;

  -- 6. Compute bounded 10-minute grace window (only for attempts legitimately started before deadline)
  IF v_ev.ppt_deadline_override = 'FORCE_OPEN' THEN
    v_grace_until := v_now + MAKE_INTERVAL(mins => COALESCE(v_ev.ppt_grace_minutes, 10));
  ELSE
    v_grace_until := LEAST(
      v_now + MAKE_INTERVAL(mins => COALESCE(v_ev.ppt_grace_minutes, 10)),
      v_ev.ppt_window_end + MAKE_INTERVAL(mins => COALESCE(v_ev.ppt_grace_minutes, 10))
    );
  END IF;

  SELECT COALESCE(MAX(attempt_number), 0) + 1 INTO v_attempt_num
  FROM public.ppt_submission_attempts WHERE team_id = v_team.team_id;

  INSERT INTO public.ppt_submission_attempts (
    idempotency_key, team_id, attempt_number, status, file_name, file_size_bytes,
    file_sha256, page_count, extracted_text, started_at, grace_expires_at
  ) VALUES (
    TRIM(p_idempotency_key), v_team.team_id, v_attempt_num, 'INITIATED',
    LEFT(TRIM(p_file_name), 200), p_file_size_bytes, TRIM(p_file_sha256), p_page_count,
    LEFT(COALESCE(p_extracted_text, ''), 8000), v_now, v_grace_until
  )
  RETURNING id, attempt_token INTO v_attempt_id, v_attempt_token;

  RETURN jsonb_build_object(
    'success', true,
    'attempt_id', v_attempt_id,
    'attempt_token', v_attempt_token,
    'team_id', v_team.team_id,
    'team_name', v_team.team_name,
    'problem_code', COALESCE(v_team.problem_code, 'UNASSIGNED'),
    'current_version', COALESCE(v_team.ppt_current_version, 0),
    'previous_drive_file_id', v_team.ppt_drive_file_id,
    'grace_expires_at', v_grace_until
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_ppt_attempt_uploading(
  p_attempt_id UUID,
  p_attempt_token UUID,
  p_team_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_att RECORD;
  v_team RECORD;
  v_ev RECORD;
BEGIN
  SELECT * INTO v_att FROM public.ppt_submission_attempts
  WHERE id = p_attempt_id AND attempt_token = p_attempt_token AND UPPER(team_id) = UPPER(TRIM(p_team_id))
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'code', 'INVALID_ATTEMPT', 'error', 'Invalid submission session.');
  END IF;

  IF v_att.status = 'CONFIRMED' THEN
    RETURN jsonb_build_object('success', false, 'code', 'ALREADY_CONFIRMED', 'error', 'This submission attempt is already confirmed.');
  END IF;

  SELECT * INTO v_ev FROM public.event_state WHERE id = 1;
  IF v_ev.ppt_deadline_override = 'FORCE_CLOSED' OR NOW() > v_att.grace_expires_at THEN
    UPDATE public.ppt_submission_attempts
    SET status = 'FAILED', error_code = 'GRACE_EXPIRED', error_message = 'Submission grace period expired.'
    WHERE id = v_att.id;
    RETURN jsonb_build_object('success', false, 'code', 'GRACE_EXPIRED', 'error', 'Submission window and 10-minute grace period have closed.');
  END IF;

  IF v_att.status = 'UPLOADING' THEN
    RETURN jsonb_build_object('success', false, 'code', 'DUPLICATE_IN_FLIGHT', 'error', 'This upload attempt is already running.');
  END IF;

  IF v_att.status <> 'INITIATED' THEN
    RETURN jsonb_build_object('success', false, 'code', 'ATTEMPT_NOT_REUSABLE', 'error', 'This upload session is no longer active. Please start a fresh upload within the submission window.');
  END IF;

  SELECT problem_code, ppt_drive_file_id, ppt_current_version INTO v_team
  FROM public.teams WHERE team_id = v_att.team_id;

  UPDATE public.ppt_submission_attempts
  SET status = 'UPLOADING', error_code = NULL, error_message = NULL
  WHERE id = v_att.id;

  RETURN jsonb_build_object(
    'success', true,
    'attempt', to_jsonb(v_att) || jsonb_build_object(
      'problem_code', COALESCE(v_team.problem_code, 'UNASSIGNED'),
      'previous_drive_file_id', v_team.ppt_drive_file_id,
      'current_version', COALESCE(v_team.ppt_current_version, 0)
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.finalize_ppt_submission_v2(
  p_attempt_id UUID,
  p_attempt_token UUID,
  p_drive_file_id TEXT,
  p_drive_preview_url TEXT,
  p_verified_size_bytes INT,
  p_verified_sha256 TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_att RECORD;
  v_team RECORD;
  v_ev RECORD;
  v_next_ver INT;
  v_receipt_id TEXT;
  v_prev_drive_id TEXT;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  SELECT * INTO v_att FROM public.ppt_submission_attempts
  WHERE id = p_attempt_id AND attempt_token = p_attempt_token FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'code', 'INVALID_ATTEMPT', 'error', 'Submission attempt not found.');
  END IF;

  IF v_att.status = 'CONFIRMED' THEN
    RETURN jsonb_build_object(
      'success', true,
      'receipt', jsonb_build_object(
        'receipt_id', v_att.receipt_id,
        'team_id', v_att.team_id,
        'file_name', v_att.file_name,
        'page_count', v_att.page_count,
        'file_size_bytes', v_att.file_size_bytes,
        'submitted_at', v_att.completed_at,
        'status', 'CONFIRMED'
      )
    );
  END IF;

  SELECT * INTO v_ev FROM public.event_state WHERE id = 1;
  IF v_ev.ppt_deadline_override = 'FORCE_CLOSED' OR v_now > v_att.grace_expires_at THEN
    UPDATE public.ppt_submission_attempts
    SET status = 'FAILED', error_code = 'GRACE_EXPIRED', error_message = 'Grace period expired before database finalization.'
    WHERE id = v_att.id;
    RETURN jsonb_build_object('success', false, 'code', 'GRACE_EXPIRED', 'error', 'Submission grace period expired before completion.');
  END IF;

  SELECT * INTO v_team FROM public.teams WHERE team_id = v_att.team_id FOR UPDATE;
  IF NOT FOUND OR v_team.round1_status = 'rejected' THEN
    RETURN jsonb_build_object('success', false, 'code', 'TEAM_NOT_ELIGIBLE', 'error', 'Team is not eligible for submission.');
  END IF;

  v_next_ver := COALESCE(v_team.ppt_current_version, 0) + 1;
  v_receipt_id := v_team.team_id || '-V' || v_next_ver || '-' || UPPER(SUBSTRING(ENCODE(gen_random_bytes(3), 'hex') FROM 1 FOR 6));

  -- Mark prior confirmed versions historical ONLY inside this committed transaction
  UPDATE public.ppt_submissions SET is_current = false WHERE team_id = v_team.team_id AND is_current = true;

  INSERT INTO public.ppt_submissions (
    team_id, version, receipt_id, attempt_id, drive_file_id, drive_preview_url,
    file_name, file_size_bytes, file_sha256, page_count, extracted_text, is_current, created_at
  ) VALUES (
    v_team.team_id, v_next_ver, v_receipt_id, v_att.id, p_drive_file_id, p_drive_preview_url,
    v_att.file_name, p_verified_size_bytes, p_verified_sha256, v_att.page_count, v_att.extracted_text, true, v_now
  );

  v_prev_drive_id := v_team.ppt_drive_file_id;

  UPDATE public.teams
  SET ppt_drive_file_id = p_drive_file_id,
      ppt_pdf_drive_url = p_drive_preview_url,
      ppt_file_name = v_att.file_name,
      ppt_file_size_bytes = p_verified_size_bytes,
      ppt_file_sha256 = p_verified_sha256,
      ppt_page_count = v_att.page_count,
      ppt_current_version = v_next_ver,
      ppt_receipt_id = v_receipt_id,
      extracted_slide_text = v_att.extracted_text,
      ppt_submitted_at = v_now,
      updated_at = v_now
  WHERE team_id = v_team.team_id;

  UPDATE public.ppt_submission_attempts
  SET status = 'CONFIRMED',
      drive_file_id = p_drive_file_id,
      drive_preview_url = p_drive_preview_url,
      receipt_id = v_receipt_id,
      completed_at = v_now
  WHERE id = v_att.id;

  INSERT INTO public.sync_jobs (job_type, team_id, status, payload_summary)
  VALUES ('PPT_SHEET_SYNC', v_team.team_id, 'PENDING', jsonb_build_object('team_id', v_team.team_id, 'version', v_next_ver, 'receipt_id', v_receipt_id));

  RETURN jsonb_build_object(
    'success', true,
    'previous_drive_file_id', v_prev_drive_id,
    'problem_code', COALESCE(v_team.problem_code, 'UNASSIGNED'),
    'receipt', jsonb_build_object(
      'receipt_id', v_receipt_id,
      'team_id', v_team.team_id,
      'team_name', v_team.team_name,
      'problem_code', COALESCE(v_team.problem_code, 'UNASSIGNED'),
      'version', v_next_ver,
      'file_name', v_att.file_name,
      'file_size_bytes', p_verified_size_bytes,
      'page_count', v_att.page_count,
      'submitted_at', v_now,
      'status', 'CONFIRMED'
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_ppt_attempt_failed(
  p_attempt_id UUID,
  p_status TEXT,
  p_error_code TEXT,
  p_error_message TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  UPDATE public.ppt_submission_attempts
  SET status = CASE WHEN p_status IN ('FAILED', 'INTERRUPTED') THEN p_status ELSE 'FAILED' END,
      error_code = LEFT(COALESCE(p_error_code, 'UPLOAD_ERROR'), 64),
      error_message = LEFT(COALESCE(p_error_message, 'Upload interrupted.'), 400)
  WHERE id = p_attempt_id AND status <> 'CONFIRMED';
END;
$$;

CREATE OR REPLACE FUNCTION public.get_team_submission_status(
  p_team_id TEXT,
  p_passcode TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_team RECORD;
  v_latest_attempt RECORD;
BEGIN
  SELECT * INTO v_team FROM public.teams WHERE UPPER(team_id) = UPPER(TRIM(p_team_id));
  IF NOT FOUND OR v_team.round1_status = 'rejected' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Incorrect Team ID or team passcode.');
  END IF;
  IF v_team.ppt_passcode_hash IS NULL OR v_team.ppt_passcode_hash <> crypt(UPPER(TRIM(p_passcode)), v_team.ppt_passcode_hash) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Incorrect Team ID or team passcode.');
  END IF;

  SELECT status, error_message, started_at, completed_at
  INTO v_latest_attempt
  FROM public.ppt_submission_attempts
  WHERE team_id = v_team.team_id
  ORDER BY started_at DESC
  LIMIT 1;

  RETURN jsonb_build_object(
    'success', true,
    'team_id', v_team.team_id,
    'team_name', v_team.team_name,
    'track_id', v_team.track_id,
    'problem_code', v_team.problem_code,
    'has_confirmed_submission', (v_team.ppt_current_version > 0 AND v_team.ppt_receipt_id IS NOT NULL),
    'receipt', CASE WHEN v_team.ppt_current_version > 0 THEN jsonb_build_object(
      'receipt_id', v_team.ppt_receipt_id,
      'team_id', v_team.team_id,
      'team_name', v_team.team_name,
      'version', v_team.ppt_current_version,
      'file_name', v_team.ppt_file_name,
      'file_size_bytes', v_team.ppt_file_size_bytes,
      'page_count', v_team.ppt_page_count,
      'submitted_at', v_team.ppt_submitted_at,
      'status', 'CONFIRMED'
    ) ELSE NULL END,
    'latest_attempt', CASE WHEN FOUND THEN to_jsonb(v_latest_attempt) ELSE NULL END,
    'window', public.get_window_status()
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- 8. PRIVACY-PRESERVING TEAM ID & PASSCODE RECOVERY
-- ------------------------------------------------------------------------------
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
    RETURN jsonb_build_object('success', false, 'error', 'Both registered email and 10-digit WhatsApp phone number are required.');
  END IF;

  SELECT t.team_id, t.team_name, t.track_id, t.problem_code, t.ppt_current_version, t.ppt_receipt_id
  INTO v_team
  FROM public.members m
  JOIN public.teams t ON t.team_id = m.team_id
  WHERE LOWER(TRIM(m.email)) = v_email
    AND RIGHT(REGEXP_REPLACE(m.phone, '[^0-9]', '', 'g'), 10) = v_phone
    AND t.round1_status <> 'rejected'
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
    'has_submitted', (COALESCE(v_team.ppt_current_version, 0) > 0),
    'current_version', COALESCE(v_team.ppt_current_version, 0),
    'receipt_id', v_team.ppt_receipt_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.rotate_team_ppt_passcode(
  p_team_id TEXT,
  p_leader_email TEXT,
  p_leader_phone TEXT,
  p_new_passcode_plain TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_email TEXT := LOWER(TRIM(COALESCE(p_leader_email, '')));
  v_phone TEXT := RIGHT(REGEXP_REPLACE(COALESCE(p_leader_phone, ''), '[^0-9]', '', 'g'), 10);
  v_team RECORD;
BEGIN
  SELECT t.team_id, t.team_name, m.email AS verified_email, m.name AS leader_name
  INTO v_team
  FROM public.teams t
  JOIN public.members m ON m.team_id = t.team_id
  WHERE UPPER(t.team_id) = UPPER(TRIM(p_team_id))
    AND m.role = 'leader'
    AND LOWER(TRIM(m.email)) = v_email
    AND RIGHT(REGEXP_REPLACE(m.phone, '[^0-9]', '', 'g'), 10) = v_phone
    AND t.round1_status <> 'rejected'
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Team ID, Leader Email, and Leader Phone did not match an active registration.');
  END IF;

  UPDATE public.teams
  SET prev_ppt_passcode_hash = ppt_passcode_hash,
      prev_passcode_grace_until = NOW() + INTERVAL '24 hours',
      ppt_passcode_hash = crypt(UPPER(TRIM(p_new_passcode_plain)), gen_salt('bf', 8)),
      updated_at = NOW()
  WHERE team_id = v_team.team_id;

  INSERT INTO public.sync_jobs (job_type, team_id, status, payload_summary)
  VALUES ('PASSCODE_RECOVERY_EMAIL', v_team.team_id, 'PENDING', jsonb_build_object('team_id', v_team.team_id));

  RETURN jsonb_build_object(
    'success', true,
    'team_id', v_team.team_id,
    'team_name', v_team.team_name,
    'leader_email', v_team.verified_email,
    'leader_name', v_team.leader_name
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.rollback_passcode_rotation(
  p_team_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  UPDATE public.teams
  SET ppt_passcode_hash = COALESCE(prev_ppt_passcode_hash, ppt_passcode_hash),
      prev_ppt_passcode_hash = NULL,
      prev_passcode_grace_until = NULL,
      updated_at = NOW()
  WHERE UPPER(team_id) = UPPER(TRIM(p_team_id))
    AND prev_ppt_passcode_hash IS NOT NULL;
  RETURN FOUND;
END;
$$;

-- ------------------------------------------------------------------------------
-- 8B. DISTRIBUTED UPLOAD SEMAPHORE & AUTO-RETRY SYNC CLAIM WORKER
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.acquire_upload_slot(
  p_attempt_id UUID,
  p_max_slots INT DEFAULT 20,
  p_lease_seconds INT DEFAULT 45
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_now TIMESTAMPTZ := NOW();
  v_slot_id INT;
  v_active INT;
BEGIN
  -- Fast path: reuse slot if attempt already holds one
  SELECT slot_id INTO v_slot_id
  FROM public.upload_concurrency_slots
  WHERE owner_attempt_id = p_attempt_id AND expires_at > v_now
  LIMIT 1;

  IF FOUND THEN
    UPDATE public.upload_concurrency_slots
    SET expires_at = v_now + MAKE_INTERVAL(secs => p_lease_seconds)
    WHERE slot_id = v_slot_id;
    SELECT COUNT(*) INTO v_active FROM public.upload_concurrency_slots WHERE owner_attempt_id IS NOT NULL AND expires_at > v_now;
    RETURN jsonb_build_object('acquired', true, 'slot_id', v_slot_id, 'active_slots', v_active, 'max_slots', p_max_slots);
  END IF;

  -- Claim lowest available or expired slot across all serverless containers
  SELECT slot_id INTO v_slot_id
  FROM public.upload_concurrency_slots
  WHERE slot_id <= GREATEST(1, LEAST(20, p_max_slots))
    AND (owner_attempt_id IS NULL OR expires_at <= v_now)
  ORDER BY slot_id
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF NOT FOUND THEN
    SELECT COUNT(*) INTO v_active FROM public.upload_concurrency_slots WHERE owner_attempt_id IS NOT NULL AND expires_at > v_now;
    RETURN jsonb_build_object('acquired', false, 'slot_id', NULL, 'active_slots', v_active, 'max_slots', p_max_slots);
  END IF;

  UPDATE public.upload_concurrency_slots
  SET owner_attempt_id = p_attempt_id,
      acquired_at = v_now,
      expires_at = v_now + MAKE_INTERVAL(secs => p_lease_seconds)
  WHERE slot_id = v_slot_id;

  SELECT COUNT(*) INTO v_active FROM public.upload_concurrency_slots WHERE owner_attempt_id IS NOT NULL AND expires_at > v_now;
  RETURN jsonb_build_object('acquired', true, 'slot_id', v_slot_id, 'active_slots', v_active, 'max_slots', p_max_slots);
END;
$$;

CREATE OR REPLACE FUNCTION public.release_upload_slot(p_attempt_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  UPDATE public.upload_concurrency_slots
  SET owner_attempt_id = NULL,
      acquired_at = NULL,
      expires_at = NULL
  WHERE owner_attempt_id = p_attempt_id;
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
      AND job_type IN ('REGISTER_SYNC', 'PPT_SHEET_SYNC', 'SHORTLIST_EMAIL')
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
        'secret_passcode', v_team.secret_passcode,
        'ppt_current_version', v_team.ppt_current_version,
        'ppt_receipt_id', v_team.ppt_receipt_id,
        'drive_folder_url', v_team.drive_folder_url
      ) ELSE NULL END,
      'members', v_members
    );
  END LOOP;

  RETURN v_claimed;
END;
$$;

-- ------------------------------------------------------------------------------
-- 9. HARDENED COORDINATOR RPCS (Coordinator Allowlist + Audit Logging + Event State)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_coordinator_roster()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_roster JSONB;
BEGIN
  IF NOT public.is_authorized_coordinator() AND auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Access denied. Authorized coordinator account required.';
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
      'ppt_drive_file_id', t.ppt_drive_file_id,
      'ppt_file_name', t.ppt_file_name,
      'ppt_file_size_bytes', t.ppt_file_size_bytes,
      'ppt_page_count', t.ppt_page_count,
      'ppt_current_version', COALESCE(t.ppt_current_version, 0),
      'ppt_receipt_id', t.ppt_receipt_id,
      'extracted_slide_text', t.extracted_slide_text,
      'ppt_submitted_at', t.ppt_submitted_at,
      'shortlisted_at', t.shortlisted_at,
      'payment_deadline', t.payment_deadline,
      'utr_number', t.utr_number,
      'payment_screenshot_url', t.payment_screenshot_url,
      'round2_receipt_drive_file_id', t.round2_receipt_drive_file_id,
      'is_paid_verified', t.is_paid_verified,
      'gas_sync_status', COALESCE(t.gas_sync_status, 'pending'),
      'gas_last_error', t.gas_last_error,
      'drive_folder_url', t.drive_folder_url,
      'created_at', t.created_at,
      'latest_attempt', (
        SELECT jsonb_build_object(
          'status', a.status,
          'attempt_number', a.attempt_number,
          'error_code', a.error_code,
          'error_message', a.error_message,
          'started_at', a.started_at,
          'completed_at', a.completed_at
        )
        FROM public.ppt_submission_attempts a
        WHERE a.team_id = t.team_id
        ORDER BY a.started_at DESC
        LIMIT 1
      ),
      'members', (
        SELECT jsonb_agg(
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
            'year_of_study', m.year_of_study,
            'roll_no', COALESCE(m.roll_no, ''),
            'organisation', COALESCE(m.organisation, ''),
            'designation', COALESCE(m.designation, '')
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
  v_shortlisted_at TIMESTAMPTZ;
  v_deadline TIMESTAMPTZ;
BEGIN
  IF NOT public.is_authorized_coordinator() AND auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Access denied. Authorized coordinator account required.';
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

  INSERT INTO public.admin_audit_logs (actor_email, action, target_team_id, details)
  VALUES (
    COALESCE(auth.jwt()->>'email', 'service_role'),
    'UPDATE_TEAM_STATUS',
    v_team.team_id,
    jsonb_build_object('status', p_status, 'is_shortlisted', p_is_shortlisted)
  );

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

CREATE OR REPLACE FUNCTION public.admin_delete_team(p_team_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_deleted_count INT;
BEGIN
  IF NOT public.is_authorized_coordinator() AND auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Access denied. Authorized coordinator account required.';
  END IF;

  DELETE FROM public.teams WHERE UPPER(TRIM(team_id)) = UPPER(TRIM(p_team_id));
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  IF v_deleted_count = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Team ' || p_team_id || ' not found or already deleted.');
  END IF;

  INSERT INTO public.admin_audit_logs (actor_email, action, target_team_id, details)
  VALUES (COALESCE(auth.jwt()->>'email', 'service_role'), 'DELETE_TEAM', UPPER(TRIM(p_team_id)), jsonb_build_object('deleted_count', v_deleted_count));

  RETURN jsonb_build_object('success', true, 'deleted_count', v_deleted_count, 'team_id', p_team_id);
END;
$$;

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
  p_clock_end_timestamp TIMESTAMPTZ DEFAULT NULL
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
      updated_at = NOW()
  WHERE id = 1
  RETURNING * INTO v_ev;

  INSERT INTO public.admin_audit_logs (actor_email, action, details)
  VALUES (
    COALESCE(auth.jwt()->>'email', 'service_role'),
    'UPDATE_EVENT_STATE',
    jsonb_build_object(
      'round1_open', v_ev.round1_open,
      'ppt_submission_open', v_ev.ppt_submission_open,
      'ppt_deadline_override', v_ev.ppt_deadline_override,
      'registration_override', v_ev.registration_override,
      'round2_fee_per_member', v_ev.round2_fee_per_member,
      'clock_state', v_ev.clock_state
    )
  );

  RETURN to_jsonb(v_ev);
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
      updated_at = NOW()
  WHERE UPPER(team_id) = UPPER(TRIM(p_team_id))
  RETURNING team_id, is_paid_verified INTO v_team;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Team not found.');
  END IF;

  INSERT INTO public.admin_audit_logs (actor_email, action, target_team_id, details)
  VALUES (COALESCE(auth.jwt()->>'email', 'service_role'), 'VERIFY_ROUND2_PAYMENT', v_team.team_id, jsonb_build_object('is_paid_verified', p_verified));

  RETURN jsonb_build_object('success', true, 'team_id', v_team.team_id, 'is_paid_verified', v_team.is_paid_verified);
END;
$$;

-- Update Round 2 payment RPC to enforce payment window or shortlist deadline cleanly & store Drive file ID if supplied
DROP FUNCTION IF EXISTS public.submit_round2_payment(TEXT, TEXT, TEXT, TEXT);

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
BEGIN
  SELECT * INTO v_team
  FROM public.teams
  WHERE UPPER(team_id) = UPPER(TRIM(p_team_id))
    AND UPPER(secret_passcode) = UPPER(TRIM(p_passcode))
    AND is_shortlisted = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Invalid team credentials or not shortlisted.');
  END IF;

  IF NOT v_team.is_paid_verified AND v_team.payment_deadline IS NOT NULL AND NOW() > v_team.payment_deadline THEN
    RETURN jsonb_build_object('success', false, 'error', 'Your 36-hour payment deadline has expired.');
  END IF;

  IF LENGTH(TRIM(p_utr_number)) <> 12 OR TRIM(p_utr_number) !~ '^[0-9]+$' THEN
    RETURN jsonb_build_object('success', false, 'error', 'UTR number must be exactly 12 numeric digits.');
  END IF;

  UPDATE public.teams
  SET utr_number = TRIM(p_utr_number),
      payment_screenshot_url = TRIM(p_screenshot_url),
      round2_receipt_drive_file_id = COALESCE(NULLIF(TRIM(p_drive_file_id), ''), round2_receipt_drive_file_id),
      updated_at = NOW()
  WHERE team_id = v_team.team_id;

  RETURN jsonb_build_object('success', true, 'message', 'Round 2 confirmation and payment details submitted for verification.');
END;
$$;

-- ------------------------------------------------------------------------------
-- 10. EXPLICIT GRANTS (Zero Public Over-Exposure)
-- ------------------------------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.get_window_status() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_capacity() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_round2_gatekeeper(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_round2_payment(TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

-- Service-role only for server-side Vercel functions
REVOKE ALL ON FUNCTION public.check_rate_limit(TEXT, INT, INT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.register_free_team_v2(TEXT, TEXT, TEXT, INT, JSONB, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.initiate_ppt_submission(TEXT, TEXT, TEXT, INT, TEXT, INT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.mark_ppt_attempt_uploading(UUID, UUID, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.finalize_ppt_submission_v2(UUID, UUID, TEXT, TEXT, INT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.mark_ppt_attempt_failed(UUID, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_team_submission_status(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.recover_team_identity(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.rotate_team_ppt_passcode(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.rollback_passcode_rotation(TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.acquire_upload_slot(UUID, INT, INT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.release_upload_slot(UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.claim_due_sync_jobs(INT) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INT, INT) TO service_role;
GRANT EXECUTE ON FUNCTION public.register_free_team_v2(TEXT, TEXT, TEXT, INT, JSONB, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.initiate_ppt_submission(TEXT, TEXT, TEXT, INT, TEXT, INT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.mark_ppt_attempt_uploading(UUID, UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.finalize_ppt_submission_v2(UUID, UUID, TEXT, TEXT, INT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.mark_ppt_attempt_failed(UUID, TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_team_submission_status(TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.recover_team_identity(TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.rotate_team_ppt_passcode(TEXT, TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.rollback_passcode_rotation(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.acquire_upload_slot(UUID, INT, INT) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_upload_slot(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_due_sync_jobs(INT) TO service_role;

-- Authorized coordinators + service_role (explicitly revoke PUBLIC & anon to resolve Security Advisor 0028)
REVOKE ALL ON FUNCTION public.get_coordinator_roster() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_update_team_status(TEXT, TEXT, BOOLEAN) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_delete_team(TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_update_event_state(BOOLEAN, BOOLEAN, BOOLEAN, INT, BOOLEAN, TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_verify_round2_payment(TEXT, BOOLEAN) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.revoke_expired_seats_and_promote_waitlist() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_authorized_coordinator() FROM PUBLIC, anon;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'rls_auto_enable' AND pronamespace = 'public'::regnamespace) THEN
    REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
  END IF;
END $$;

GRANT EXECUTE ON FUNCTION public.is_authorized_coordinator() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_coordinator_roster() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_update_team_status(TEXT, TEXT, BOOLEAN) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_delete_team(TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_update_event_state(BOOLEAN, BOOLEAN, BOOLEAN, INT, BOOLEAN, TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_verify_round2_payment(TEXT, BOOLEAN) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.revoke_expired_seats_and_promote_waitlist() TO authenticated, service_role;
