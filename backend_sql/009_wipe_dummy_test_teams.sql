-- ==============================================================================
-- VELTRAXX 2.0 - WIPE DUMMY TEST TEAMS (CLEAN PRODUCTION SLATE)
-- File: backend_sql/009_wipe_dummy_test_teams.sql
-- ==============================================================================
-- Purpose:
--   Removes all 16 automated dummy test registrations (VTX2-005 to VTX2-020)
--   created during pre-launch testing and resets the sequence counter so that
--   the first real student team receives VTX2-001.
-- ==============================================================================

-- Option A: Complete clean wipe (all 16 teams are test teams) and reset sequence to 1
TRUNCATE TABLE public.members, public.teams CASCADE;
ALTER SEQUENCE public.vtx2_team_seq RESTART WITH 1;

-- Verification:
SELECT count(*) AS remaining_teams FROM public.teams;
