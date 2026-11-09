-- ==============================================================================
-- VELTRAXX 2.0 - RPC 8: ADMIN DELETE TEAM (TEST ENTRY REMOVAL)
-- File: backend_sql/008_admin_delete_team_rpc.sql
-- ==============================================================================
-- Description:
--   Allows authenticated coordinators to permanently delete a test registration
--   or fraudulent entry. Due to 'ON DELETE CASCADE' on members and attendance
--   tables, removing the team row automatically cleans up all associated
--   participants, check-ins, and reports.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.admin_delete_team(p_team_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted_count INT;
BEGIN
  -- 1. Security Check: Caller must have authenticated coordinator role
  IF auth.role() <> 'authenticated' THEN
    RAISE EXCEPTION 'Access denied. Authenticated coordinator session required.';
  END IF;

  -- 2. Delete team (cascades to members, attendance, etc.)
  DELETE FROM public.teams 
  WHERE UPPER(TRIM(team_id)) = UPPER(TRIM(p_team_id));
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  IF v_deleted_count = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Team ' || p_team_id || ' not found or already deleted.'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'deleted_count', v_deleted_count,
    'team_id', p_team_id,
    'message', 'Team ' || p_team_id || ' and associated records permanently deleted.'
  );
END;
$$;

-- Grant execution to authenticated coordinators
GRANT EXECUTE ON FUNCTION public.admin_delete_team(TEXT) TO authenticated;
