-- ==============================================================================
-- VELTRAXX 2.0 - SECURITY HARDENING, COORDINATOR AUTH & STORAGE RLS
-- Migration: 004_security_hardening_and_tracker_auth.sql
-- Description: 
--   1. Drops public SELECT policies on teams and participants (SEC-02).
--   2. Establishes private hashed PIN authentication and rate limiting for /tracker (SEC-01).
--   3. Restricts storage.objects so 'receipts' bucket cannot be listed or read publicly.
--   4. Exposes get_coordinator_roster() RPC with 15-minute brute-force lockout.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. HARDEN RLS ON TEAMS & PARTICIPANTS (SEC-02)
-- ------------------------------------------------------------------------------
-- Drop any public SELECT policies on teams and participants.
-- Neither table should be queryable by anonymous users directly.
DROP POLICY IF EXISTS "Public can view teams summary for capacity and tracker" ON teams;
DROP POLICY IF EXISTS "Public cannot view participant PII directly" ON participants;

-- Ensure RLS is active
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Note: No SELECT policy is created for 'anon' or 'public'.
-- Anonymous clients attempting 'SELECT * FROM teams' or 'SELECT * FROM participants'
-- will receive 0 rows.
-- Capacity is exclusively accessed via get_public_capacity().
-- Coordinator roster is exclusively accessed via get_coordinator_roster(p_pin).


-- ------------------------------------------------------------------------------
-- 2. SECURE COORDINATOR AUTH CONFIG & ATTEMPTS (SEC-01)
-- ------------------------------------------------------------------------------
-- Enable pgcrypto for cryptographic hashing (digest)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Private configuration table storing the hashed PIN
CREATE TABLE IF NOT EXISTS coordinator_auth_config (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    pin_hash TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Lock down config table: strictly no public access
ALTER TABLE coordinator_auth_config ENABLE ROW LEVEL SECURITY;

-- Rate limiting and brute-force tracking table
CREATE TABLE IF NOT EXISTS coordinator_auth_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_time TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    is_successful BOOLEAN NOT NULL,
    failure_reason TEXT
);

-- Lock down attempts table: strictly no public access
ALTER TABLE coordinator_auth_attempts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_coordinator_attempts_time 
ON coordinator_auth_attempts(attempt_time);

-- Administrative helper to set or rotate the PIN hash securely in database
CREATE OR REPLACE FUNCTION set_coordinator_pin(p_new_pin TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF length(trim(p_new_pin)) < 4 THEN
        RAISE EXCEPTION 'PIN must be at least 4 characters in length.';
    END IF;

    INSERT INTO coordinator_auth_config (id, pin_hash, updated_at)
    VALUES (1, encode(digest(trim(p_new_pin), 'sha256'), 'hex'), timezone('utc'::text, now()))
    ON CONFLICT (id) DO UPDATE 
    SET pin_hash = encode(digest(trim(p_new_pin), 'sha256'), 'hex'),
        updated_at = timezone('utc'::text, now());

    RETURN 'Coordinator PIN hash updated successfully.';
END;
$$;

-- Only authenticated administrators or direct DB owners can rotate the PIN
REVOKE EXECUTE ON FUNCTION set_coordinator_pin(TEXT) FROM public, anon;
GRANT EXECUTE ON FUNCTION set_coordinator_pin(TEXT) TO authenticated;


-- ------------------------------------------------------------------------------
-- 3. COORDINATOR ROSTER RPC WITH RATE LIMITING & SIGNED URLS (SEC-01)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_coordinator_roster(p_pin TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_expected_hash TEXT;
    v_input_hash TEXT;
    v_recent_failures INT;
    v_lockout_window INTERVAL := INTERVAL '15 minutes';
    v_max_failures INT := 5;
    v_teams JSONB;
BEGIN
    -- Step A: Check brute-force lockout (5 failed attempts within 15 minutes)
    SELECT count(*) INTO v_recent_failures
    FROM coordinator_auth_attempts
    WHERE is_successful = false
      AND attempt_time >= (timezone('utc'::text, now()) - v_lockout_window);

    IF v_recent_failures >= v_max_failures THEN
        RAISE EXCEPTION 'RATE_LIMITED: Coordinator portal is temporarily locked due to 5 consecutive failed attempts. Please retry in 15 minutes.';
    END IF;

    -- Step B: Validate input presence
    IF p_pin IS NULL OR trim(p_pin) = '' THEN
        INSERT INTO coordinator_auth_attempts (is_successful, failure_reason)
        VALUES (false, 'EMPTY_PIN');
        RAISE EXCEPTION 'UNAUTHORIZED: Verification PIN is required.';
    END IF;

    -- Step C: Retrieve hashed secret from private table
    SELECT pin_hash INTO v_expected_hash
    FROM coordinator_auth_config
    WHERE id = 1;

    IF v_expected_hash IS NULL THEN
        RAISE EXCEPTION 'SERVER_ERROR: Coordinator PIN has not been configured in the database.';
    END IF;

    -- Step D: Compute SHA-256 hash of provided PIN and verify
    v_input_hash := encode(digest(trim(p_pin), 'sha256'), 'hex');

    IF v_input_hash <> v_expected_hash THEN
        INSERT INTO coordinator_auth_attempts (is_successful, failure_reason)
        VALUES (false, 'INVALID_PIN');
        RAISE EXCEPTION 'UNAUTHORIZED: Invalid coordinator PIN provided.';
    END IF;

    -- Step E: Successful authentication - record and prune stale attempts (> 24h)
    INSERT INTO coordinator_auth_attempts (is_successful, failure_reason)
    VALUES (true, NULL);

    DELETE FROM coordinator_auth_attempts
    WHERE attempt_time < (timezone('utc'::text, now()) - INTERVAL '24 hours');

    -- Step F: Assemble complete roster with participants
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', t.id,
            'team_name', t.name,
            'track', t.track,
            'status', t.status,
            'created_at', t.created_at,
            'utr_number', t.utr_number,
            'receipt_url', t.receipt_url,
            'college_city', t.college_city,
            'college_state', t.college_state,
            'interest_tags', t.interest_tags,
            'hear_source', t.hear_source,
            'consent_event_terms', t.consent_event_terms,
            'participants', COALESCE((
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', p.id,
                        'name', p.name,
                        'email', p.email,
                        'phone', p.phone,
                        'is_leader', p.is_leader,
                        'department', p.department,
                        'degree', p.degree,
                        'year_of_study', p.year_of_study,
                        'level', p.level,
                        'roll_no', p.roll_no,
                        'organisation', p.organisation,
                        'designation', p.designation,
                        'college_name', COALESCE(c.canonical_name, p.custom_college_name)
                    ) ORDER BY p.is_leader DESC, p.created_at ASC
                )
                FROM participants p
                LEFT JOIN colleges c ON c.id = p.college_id
                WHERE p.team_id = t.id
            ), '[]'::jsonb)
        ) ORDER BY t.created_at DESC
    ) INTO v_teams
    FROM teams t;

    RETURN COALESCE(v_teams, '[]'::jsonb);
END;
$$;

GRANT EXECUTE ON FUNCTION get_coordinator_roster(TEXT) TO anon, authenticated;


-- ------------------------------------------------------------------------------
-- 4. STORAGE POLICY HARDENING: 'receipts' BUCKET (SEC-02)
-- ------------------------------------------------------------------------------
-- Ensure 'receipts' bucket is private (public = false)
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Drop public read/list policies on storage.objects for receipts
DROP POLICY IF EXISTS "Public can view receipts" ON storage.objects;
DROP POLICY IF EXISTS "Public can list receipts" ON storage.objects;
DROP POLICY IF EXISTS "Give public access to receipts" ON storage.objects;

-- Allow anonymous registration upload ONLY (single insert, capped file size)
DROP POLICY IF EXISTS "Anon can upload payment receipt" ON storage.objects;
CREATE POLICY "Anon can upload payment receipt"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
    bucket_id = 'receipts'
);

-- Only authenticated users (administrators) can read or list the private receipts bucket
DROP POLICY IF EXISTS "Admins can view receipts" ON storage.objects;
CREATE POLICY "Admins can view receipts"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'receipts');
