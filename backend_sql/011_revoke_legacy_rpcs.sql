-- ==============================================================================
-- VELTRAXX 2.0 - PHASE B LEGACY RPC LOCKDOWN (RUN AFTER VERCEL CUTOVER)
-- File: backend_sql/011_revoke_legacy_rpcs.sql
-- Purpose: Drops insecure legacy lookup functions and revokes public/anon execute
--          access on legacy register_free_team & submit_round1_ppt AFTER the new
--          hardened frontend (/api/register & /api/ppt/*) is live on Vercel.
-- ==============================================================================

DROP FUNCTION IF EXISTS public.lookup_team_for_ppt(TEXT);
DROP FUNCTION IF EXISTS public.lookup_team_by_contact(TEXT);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'submit_round1_ppt' AND pronamespace = 'public'::regnamespace) THEN
    REVOKE ALL ON FUNCTION public.submit_round1_ppt(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'register_free_team' AND pronamespace = 'public'::regnamespace) THEN
    REVOKE ALL ON FUNCTION public.register_free_team(TEXT, TEXT, TEXT, TEXT, INT, JSONB) FROM PUBLIC, anon, authenticated;
  END IF;
END $$;
