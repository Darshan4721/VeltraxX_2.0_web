-- ==============================================================================
-- VELTRAXX 2.0 - REVERSIBLE ROLLBACK SCRIPT FOR MIGRATION 010
-- File: backend_sql/010_rollback.sql
-- Purpose: Restores RPC grants and removes new 010-only RPCs/policies cleanly
--          without deleting existing teams or members registration records.
-- ==============================================================================

-- 1. Drop 010-introduced functions
DROP FUNCTION IF EXISTS public.claim_due_sync_jobs(INT);
DROP FUNCTION IF EXISTS public.release_upload_slot(UUID);
DROP FUNCTION IF EXISTS public.acquire_upload_slot(UUID, INT, INT);
DROP FUNCTION IF EXISTS public.rollback_passcode_rotation(TEXT);
DROP FUNCTION IF EXISTS public.submit_round2_payment(TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.admin_verify_round2_payment(TEXT, BOOLEAN);
DROP FUNCTION IF EXISTS public.admin_update_event_state(BOOLEAN, BOOLEAN, BOOLEAN, INT, BOOLEAN, TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ);
DROP FUNCTION IF EXISTS public.rotate_team_ppt_passcode(TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.recover_team_identity(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.get_team_submission_status(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.mark_ppt_attempt_failed(UUID, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.finalize_ppt_submission_v2(UUID, UUID, TEXT, TEXT, INT, TEXT);
DROP FUNCTION IF EXISTS public.mark_ppt_attempt_uploading(UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS public.initiate_ppt_submission(TEXT, TEXT, TEXT, INT, TEXT, INT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.register_free_team_v2(TEXT, TEXT, TEXT, INT, JSONB, TEXT);
DROP FUNCTION IF EXISTS public.get_window_status();
DROP FUNCTION IF EXISTS public.check_rate_limit(TEXT, INT, INT);
DROP FUNCTION IF EXISTS public.is_authorized_coordinator();

-- 2. Restore legacy 000/005 grants if reverting frontend simultaneously
GRANT EXECUTE ON FUNCTION public.register_free_team(TEXT, TEXT, TEXT, TEXT, INT, JSONB) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_round1_ppt(TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.submit_round2_payment(
  p_team_id TEXT,
  p_passcode TEXT,
  p_utr_number TEXT,
  p_screenshot_url TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
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

  RETURN jsonb_build_object('success', true, 'message', 'Round 2 confirmation and payment details submitted for verification.');
END;
$$;
GRANT EXECUTE ON FUNCTION public.submit_round2_payment(TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

-- 3. Preserve teams, members, ppt_submissions, and sync_jobs data by default (do not drop tables)
UPDATE public.event_state SET ppt_submission_open = false WHERE id = 1;
