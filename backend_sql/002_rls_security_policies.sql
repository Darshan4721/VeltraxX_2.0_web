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

-- Public / Coordinators can view team summary on /tracker, but ZERO personal PII
CREATE POLICY "Public can view teams summary for capacity and tracker"
ON teams
FOR SELECT
TO public
USING (true);

-- Anonymous clients CANNOT directly select participants (prevents phone/email scrapers)
CREATE POLICY "Public cannot view participant PII directly"
ON participants
FOR SELECT
TO public
USING (false);

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
