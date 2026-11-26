-- VELTRAXX 2.0 — Hotfix Migration 013
-- Fixes PostgreSQL SQLSTATE 55000 ("record is not assigned yet") in reserve_checkout_slot
-- and preflight_paid_registration, and removes the ambiguous 13-argument overload of
-- admin_update_event_state left behind by migration 010.

-- 1. Fix reserve_checkout_slot (%ROWTYPE instead of unassigned RECORD)
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

-- 2. Fix preflight_paid_registration (%ROWTYPE instead of unassigned RECORD)
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

-- 3. Drop legacy 13-parameter overload of admin_update_event_state from migration 010
DROP FUNCTION IF EXISTS public.admin_update_event_state(
  BOOLEAN, BOOLEAN, BOOLEAN, INT, BOOLEAN, TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ
);

-- 4. Re-assert restrictive privileges on patched functions
REVOKE ALL ON FUNCTION public.reserve_checkout_slot(TEXT, TEXT, TEXT, INT, JSONB, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_checkout_slot(TEXT, TEXT, TEXT, INT, JSONB, TEXT, TEXT) TO service_role;

REVOKE ALL ON FUNCTION public.preflight_paid_registration(TEXT, TEXT, TEXT, INT, JSONB, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.preflight_paid_registration(TEXT, TEXT, TEXT, INT, JSONB, TEXT, TEXT, TEXT) TO service_role;

REVOKE ALL ON FUNCTION public.admin_update_event_state(BOOLEAN, BOOLEAN, BOOLEAN, INT, BOOLEAN, TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ, INT, INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_update_event_state(BOOLEAN, BOOLEAN, BOOLEAN, INT, BOOLEAN, TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ, INT, INT) TO authenticated, service_role;
