-- ==============================================================================
-- VELTRAXX 2.0 - ROW LEVEL SECURITY (RLS) POLICIES
-- Migration: 002_rls_security_policies.sql
-- Description: Locks down participant PII, permits canonical college searches,
--              and isolates administrative actions.
-- ==============================================================================

-- 1. Enable RLS on all tables
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_checkins ENABLE ROW LEVEL SECURITY;

-- 2. Public Read Policies
-- Public can search canonical colleges for the search-as-you-type dropdown
CREATE POLICY "Public can view canonical colleges directory"
ON colleges
FOR SELECT
TO public
USING (true);

-- SEC-02 Hardening:
-- Direct public SELECT on teams and participants is strictly DENIED.
-- Public capacity is retrieved exclusively via SECURITY DEFINER RPC get_public_capacity().
-- Coordinator team roster is retrieved exclusively via SECURITY DEFINER RPC get_coordinator_roster(p_pin).

-- 3. Authenticated Super-Admin Policies
-- Full access granted to authenticated admins
CREATE POLICY "Admins have full access to colleges"
ON colleges
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins have full access to teams"
ON teams
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins have full access to participants"
ON participants
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins have full access to attendance"
ON attendance_checkins
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
