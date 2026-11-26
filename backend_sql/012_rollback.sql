-- ==============================================================================
-- VELTRAXX 2.0 - ROLLBACK FOR 012_single_round_conversion.sql
-- Non-destructive: preserves all teams, members, UTRs, reservations & receipts.
-- ==============================================================================

DROP INDEX IF EXISTS public.idx_teams_unique_active_utr;
DROP INDEX IF EXISTS public.idx_teams_idempotency_key;
DROP FUNCTION IF EXISTS public._validate_and_normalize_team_draft(TEXT, TEXT, TEXT, INT, JSONB, TEXT);
DROP FUNCTION IF EXISTS public.reserve_checkout_slot(TEXT, TEXT, TEXT, INT, JSONB, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.preflight_paid_registration(TEXT, TEXT, TEXT, INT, JSONB, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.save_reservation_receipt(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.complete_paid_registration(TEXT, TEXT, TEXT, INT, JSONB, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.admin_grant_payment_access(TEXT);
DROP FUNCTION IF EXISTS public.admin_update_event_state(BOOLEAN, BOOLEAN, BOOLEAN, INT, BOOLEAN, TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ, INT, INT);

UPDATE public.event_state
SET ppt_deadline_override = 'AUTO',
    round2_payment_open = false,
    updated_at = NOW()
WHERE id = 1;
