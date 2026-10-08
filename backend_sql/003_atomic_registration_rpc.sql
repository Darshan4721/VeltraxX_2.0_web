-- ==============================================================================
-- VELTRAXX 2.0 - ATOMIC TEAM REGISTRATION RPC
-- Migration: 003_atomic_registration_rpc.sql
-- Description: Transactional single-submitter team registration with row-level
--              locking to strictly enforce the 35-team capacity limit.
-- ==============================================================================

CREATE OR REPLACE FUNCTION register_team(
    p_team_name TEXT,
    p_receipt_url TEXT,
    p_utr_number TEXT,
    p_members JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_team_id UUID;
    v_current_count INT;
    v_member JSONB;
    v_member_count INT;
BEGIN
    -- 1. Validate Member Array Count (Strictly 4 members: 1 Leader + 3 Participants)
    v_member_count := jsonb_array_length(p_members);
    IF v_member_count <> 4 THEN
        RAISE EXCEPTION 'INVALID_TEAM_SIZE: Exactly 4 team members required (1 Leader + 3 Members). Received %', v_member_count;
    END IF;

    -- 2. Concurrency Lock: Lock teams table to check capacity without race conditions
    SELECT count(*) INTO v_current_count FROM teams FOR UPDATE;
    
    IF v_current_count >= 35 THEN
        RAISE EXCEPTION 'CAPACITY_REACHED: All 35 official team slots have been claimed.';
    END IF;

    -- 3. Case-Insensitive Duplicate Team Name Check
    IF EXISTS (SELECT 1 FROM teams WHERE lower(name) = lower(trim(p_team_name))) THEN
        RAISE EXCEPTION 'DUPLICATE_TEAM_NAME: A team named "%" has already registered.', trim(p_team_name);
    END IF;

    -- 4. Insert Team Record
    INSERT INTO teams (
        name,
        receipt_url,
        utr_number,
        status
    ) VALUES (
        trim(p_team_name),
        p_receipt_url,
        trim(p_utr_number),
        'pending'
    )
    RETURNING id INTO v_team_id;

    -- 5. Insert All 4 Members Atomically
    FOR v_member IN SELECT * FROM jsonb_array_elements(p_members)
    LOOP
        INSERT INTO participants (
            team_id,
            name,
            email,
            phone,
            college,
            department,
            degree_year,
            is_leader
        ) VALUES (
            v_team_id,
            trim(v_member->>'name'),
            lower(trim(v_member->>'email')),
            trim(v_member->>'phone'),
            trim(v_member->>'college'),
            trim(v_member->>'department'),
            trim(v_member->>'degree_year'),
            COALESCE((v_member->>'is_leader')::BOOLEAN, false)
        );
    END LOOP;

    -- 6. Return Structured Success Payload
    RETURN jsonb_build_object(
        'success', true,
        'team_id', v_team_id,
        'team_name', trim(p_team_name),
        'message', 'Team successfully registered in pending status.'
    );
END;
$$;
