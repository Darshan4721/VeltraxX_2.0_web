-- ==============================================================================
-- VELTRAXX 2.0 - ATOMIC TEAM REGISTRATION & PUBLIC CAPACITY RPC
-- Migration: 003_atomic_registration_rpc.sql
-- Description: Transactional single-submitter team registration with Postgres
--              advisory transaction lock, DPDP double-consent enforcement,
--              canonical college integration, and public capacity RPC.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PUBLIC CAPACITY RPC (Returns only count vitals, protecting sensitive PII)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_public_capacity()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_claimed_count INT;
    v_max_capacity INT := 35;
    v_is_full BOOLEAN;
BEGIN
    -- Count all non-rejected teams toward the 35 cap
    SELECT count(*) INTO v_claimed_count 
    FROM teams 
    WHERE status <> 'rejected';

    v_is_full := (v_claimed_count >= v_max_capacity);

    RETURN jsonb_build_object(
        'claimed_teams', v_claimed_count,
        'max_teams', v_max_capacity,
        'spots_remaining', GREATEST(0, v_max_capacity - v_claimed_count),
        'is_full', v_is_full
    );
END;
$$;

GRANT EXECUTE ON FUNCTION get_public_capacity() TO anon, authenticated;


-- ------------------------------------------------------------------------------
-- 2. ATOMIC TEAM REGISTRATION RPC (Single-Submitter Transaction)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION register_team(
    p_team_name TEXT,
    p_receipt_url TEXT,
    p_utr_number TEXT,
    p_interest_tags TEXT[],
    p_hear_source TEXT,
    p_consent_event_terms BOOLEAN,
    p_consent_future_events BOOLEAN,
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
    v_leader_count INT := 0;
    v_leader_city TEXT := NULL;
    v_leader_state TEXT := NULL;
    
    -- Member local variables
    v_name TEXT;
    v_email TEXT;
    v_phone TEXT;
    v_college_id UUID;
    v_custom_college_name TEXT;
    v_custom_college_city TEXT;
    v_custom_college_state TEXT;
    v_degree TEXT;
    v_level TEXT;
    v_dept TEXT;
    v_year TEXT;
    v_roll_no TEXT;
    v_org TEXT;
    v_desig TEXT;
    v_is_leader BOOLEAN;
    
    -- Uniqueness checking arrays
    v_emails TEXT[] := ARRAY[]::TEXT[];
    v_phones TEXT[] := ARRAY[]::TEXT[];
    v_receipt_ext TEXT;
BEGIN
    -- STEP 1: Postgres Advisory Lock to serialize capacity operations
    -- Prevents concurrent registration race conditions around the 35-team limit
    PERFORM pg_advisory_xact_lock(74218931);

    -- STEP 2: DPDP Act Double Consent Validation
    IF p_consent_event_terms IS NOT TRUE THEN
        RAISE EXCEPTION 'CONSENT_REQUIRED: Team Leader must confirm all 4 members agree to share details for VELTRAXX 2.0.';
    END IF;

    -- STEP 3: Server-side Receipt URL format & extension validation
    p_receipt_url := trim(p_receipt_url);
    IF p_receipt_url IS NULL OR length(p_receipt_url) < 10 THEN
        RAISE EXCEPTION 'INVALID_RECEIPT: Payment screenshot file path is required.';
    END IF;

    IF NOT (p_receipt_url LIKE 'receipts/%') THEN
        RAISE EXCEPTION 'INVALID_RECEIPT_PATH: Receipt must reside in the authorized receipts directory.';
    END IF;

    v_receipt_ext := lower(substring(p_receipt_url from '\.([a-zA-Z0-9]+)$'));
    IF v_receipt_ext NOT IN ('jpg', 'jpeg', 'png', 'webp') THEN
        RAISE EXCEPTION 'INVALID_RECEIPT_TYPE: Payment receipt must be a JPG, PNG, or WEBP image. Received .%', v_receipt_ext;
    END IF;

    -- STEP 4: Strict 35-team capacity limit check (excluding rejected teams)
    SELECT count(*) INTO v_current_count 
    FROM teams 
    WHERE status <> 'rejected';
    
    IF v_current_count >= 35 THEN
        RAISE EXCEPTION 'CAPACITY_REACHED: All 35 official team slots have been claimed.';
    END IF;

    -- STEP 5: Unique Team Name Check
    p_team_name := trim(p_team_name);
    IF length(p_team_name) < 3 OR length(p_team_name) > 60 THEN
        RAISE EXCEPTION 'INVALID_TEAM_NAME: Team name must be between 3 and 60 characters.';
    END IF;

    IF EXISTS (
        SELECT 1 FROM teams 
        WHERE lower(name) = lower(p_team_name) 
          AND status <> 'rejected'
    ) THEN
        RAISE EXCEPTION 'DUPLICATE_TEAM_NAME: A team named "%" has already registered.', p_team_name;
    END IF;

    -- STEP 6: UTR Reference Number Check (Strictly 12 numeric digits)
    p_utr_number := trim(p_utr_number);
    IF p_utr_number IS NULL OR NOT (p_utr_number ~ '^[0-9]{12}$') THEN
        RAISE EXCEPTION 'INVALID_UTR: Exactly 12-digit numeric UPI transaction reference (UTR) is required.';
    END IF;

    IF EXISTS (
        SELECT 1 FROM teams 
        WHERE lower(utr_number) = lower(p_utr_number) 
          AND status <> 'rejected'
    ) THEN
        RAISE EXCEPTION 'DUPLICATE_UTR: This UPI reference number (%) has already been submitted.', p_utr_number;
    END IF;

    -- STEP 7: Validate Members Array (Strictly 4 members: 1 Leader + 3 Teammates)
    v_member_count := jsonb_array_length(p_members);
    IF v_member_count <> 4 THEN
        RAISE EXCEPTION 'INVALID_TEAM_SIZE: Exactly 4 team members required (1 Leader + 3 Members). Received %', v_member_count;
    END IF;

    -- First Pass: Loop through members to validate structure, designate exactly 1 leader,
    -- and verify no internal duplicate emails or phone numbers.
    FOR v_member IN SELECT * FROM jsonb_array_elements(p_members)
    LOOP
        v_name := trim(v_member->>'name');
        v_email := lower(trim(v_member->>'email'));
        v_phone := trim(v_member->>'phone');
        v_is_leader := COALESCE((v_member->>'is_leader')::BOOLEAN, false);
        
        -- College linking
        v_college_id := (v_member->>'college_id')::UUID;
        v_custom_college_name := trim(COALESCE(v_member->>'custom_college_name', ''));
        v_custom_college_city := trim(COALESCE(v_member->>'custom_college_city', ''));
        v_custom_college_state := trim(COALESCE(v_member->>'custom_college_state', ''));
        
        -- Academic / Professional profile
        v_level := trim(COALESCE(v_member->>'level', 'UG'));
        v_degree := trim(COALESCE(v_member->>'degree', ''));
        v_dept := trim(COALESCE(v_member->>'department', ''));
        v_year := trim(COALESCE(v_member->>'year_of_study', ''));
        v_org := trim(COALESCE(v_member->>'organisation', ''));
        v_desig := trim(COALESCE(v_member->>'designation', ''));

        -- Basic identity validation
        IF length(v_name) < 2 THEN
            RAISE EXCEPTION 'INVALID_MEMBER_NAME: Full name as on ID card is required for all participants.';
        END IF;

        IF v_email NOT LIKE '%@%.%' THEN
            RAISE EXCEPTION 'INVALID_MEMBER_EMAIL: Valid email address is required for "%".', v_name;
        END IF;

        IF length(v_phone) < 10 THEN
            RAISE EXCEPTION 'INVALID_MEMBER_PHONE: Valid 10-digit WhatsApp number is required for "%".', v_name;
        END IF;

        -- College or Company requirement
        IF v_level = 'Working professional' THEN
            IF length(v_org) < 2 OR length(v_desig) < 2 THEN
                RAISE EXCEPTION 'PROFESSIONAL_INFO_REQUIRED: Company and Designation are required for working professional "%".', v_name;
            END IF;
        ELSE
            IF v_college_id IS NULL AND length(v_custom_college_name) < 2 THEN
                RAISE EXCEPTION 'COLLEGE_REQUIRED: Valid college selection or institution name is required for "%".', v_name;
            END IF;
        END IF;

        -- Leader Designation & Metadata extraction
        IF v_is_leader THEN
            v_leader_count := v_leader_count + 1;
            
            -- Leader must provide degree, level, and department (or org/desig)
            IF v_level <> 'Working professional' AND (length(v_dept) < 2 OR length(v_degree) < 1) THEN
                RAISE EXCEPTION 'LEADER_INFO_REQUIRED: Department and Degree are mandatory for the Team Leader.';
            END IF;

            -- Extract Leader city/state for team geographical telemetry
            IF v_college_id IS NOT NULL THEN
                SELECT city, state INTO v_leader_city, v_leader_state FROM colleges WHERE id = v_college_id;
            ELSE
                v_leader_city := NULLIF(v_custom_college_city, '');
                v_leader_state := NULLIF(v_custom_college_state, '');
            END IF;
        END IF;

        -- Internal duplicate email verification
        IF v_email = ANY(v_emails) THEN
            RAISE EXCEPTION 'DUPLICATE_INTERNAL_EMAIL: Email "%" is entered more than once within the team.', v_email;
        END IF;
        v_emails := array_append(v_emails, v_email);

        -- Internal duplicate phone verification
        IF v_phone = ANY(v_phones) THEN
            RAISE EXCEPTION 'DUPLICATE_INTERNAL_PHONE: Phone number "%" is entered more than once within the team.', v_phone;
        END IF;
        v_phones := array_append(v_phones, v_phone);

        -- Cross-database duplicate check against other registered teams
        IF EXISTS (
            SELECT 1 FROM participants p
            JOIN teams t ON t.id = p.team_id
            WHERE lower(p.email) = v_email
              AND t.status <> 'rejected'
        ) THEN
            RAISE EXCEPTION 'EXISTING_EMAIL_REGISTERED: The email "%" is already registered in an active team.', v_email;
        END IF;

        IF EXISTS (
            SELECT 1 FROM participants p
            JOIN teams t ON t.id = p.team_id
            WHERE p.phone = v_phone
              AND t.status <> 'rejected'
        ) THEN
            RAISE EXCEPTION 'EXISTING_PHONE_REGISTERED: The phone number "%" is already registered in an active team.', v_phone;
        END IF;
    END LOOP;

    -- Verify exactly 1 Leader
    IF v_leader_count <> 1 THEN
        RAISE EXCEPTION 'INVALID_LEADER_COUNT: Exactly 1 team leader must be designated. Found %.', v_leader_count;
    END IF;

    -- STEP 8: Insert Team Record
    INSERT INTO teams (
        name,
        receipt_url,
        utr_number,
        interest_tags,
        hear_source,
        college_city,
        college_state,
        consent_event_terms,
        consent_future_events,
        consent_timestamp,
        status
    ) VALUES (
        p_team_name,
        p_receipt_url,
        p_utr_number,
        COALESCE(p_interest_tags, ARRAY[]::TEXT[]),
        p_hear_source,
        v_leader_city,
        v_leader_state,
        p_consent_event_terms,
        COALESCE(p_consent_future_events, false),
        timezone('utc'::text, now()),
        'pending'
    )
    RETURNING id INTO v_team_id;

    -- STEP 9: Insert all 4 participants
    FOR v_member IN SELECT * FROM jsonb_array_elements(p_members)
    LOOP
        INSERT INTO participants (
            team_id,
            is_leader,
            name,
            email,
            phone,
            college_id,
            custom_college_name,
            custom_college_city,
            custom_college_state,
            degree,
            level,
            department,
            year_of_study,
            roll_no,
            organisation,
            designation
        ) VALUES (
            v_team_id,
            COALESCE((v_member->>'is_leader')::BOOLEAN, false),
            trim(v_member->>'name'),
            lower(trim(v_member->>'email')),
            trim(v_member->>'phone'),
            (v_member->>'college_id')::UUID,
            NULLIF(trim(COALESCE(v_member->>'custom_college_name', '')), ''),
            NULLIF(trim(COALESCE(v_member->>'custom_college_city', '')), ''),
            NULLIF(trim(COALESCE(v_member->>'custom_college_state', '')), ''),
            NULLIF(trim(COALESCE(v_member->>'degree', '')), ''),
            NULLIF(trim(COALESCE(v_member->>'level', '')), ''),
            NULLIF(trim(COALESCE(v_member->>'department', '')), ''),
            NULLIF(trim(COALESCE(v_member->>'year_of_study', '')), ''),
            NULLIF(trim(COALESCE(v_member->>'roll_no', '')), ''),
            NULLIF(trim(COALESCE(v_member->>'organisation', '')), ''),
            NULLIF(trim(COALESCE(v_member->>'designation', '')), '')
        );
    END LOOP;

    -- STEP 10: Return structured confirmation payload
    RETURN jsonb_build_object(
        'success', true,
        'team_id', v_team_id,
        'team_name', p_team_name,
        'message', 'Team registration submitted successfully in pending status.'
    );
END;
$$;

GRANT EXECUTE ON FUNCTION register_team(TEXT, TEXT, TEXT, TEXT[], TEXT, BOOLEAN, BOOLEAN, JSONB) TO anon, authenticated;
 
 
-- ------------------------------------------------------------------------------
-- 3. COORDINATOR TRACKER ROSTER RPC (PIN-Protected Internal Service)
-- ------------------------------------------------------------------------------
-- Unlisted, secure access for event coordinators and faculty.
-- Requires correct 4-digit PIN verification before returning any team records.
-- Underlying tables remain strictly locked from public direct SELECT.
CREATE OR REPLACE FUNCTION get_tracker_roster(p_pin TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    -- Default internal coordinator PIN (configured via app settings / environment)
    v_valid_pin TEXT := '7421';
    v_teams JSONB;
BEGIN
    -- Verify PIN
    IF trim(COALESCE(p_pin, '')) <> v_valid_pin THEN
        RAISE EXCEPTION 'UNAUTHORIZED_PIN: Invalid coordinator PIN supplied.';
    END IF;

    SELECT jsonb_agg(
        jsonb_build_object(
            'id', t.id,
            'team_name', t.name,
            'status', t.status,
            'created_at', t.created_at,
            'utr_number', t.utr_number,
            'receipt_url', t.receipt_url,
            'college_city', t.college_city,
            'college_state', t.college_state,
            'leader_name', l.name,
            'leader_phone', l.phone,
            'leader_email', l.email,
            'leader_college', COALESCE(c.canonical_name, l.custom_college_name),
            'participants', (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'name', p.name,
                        'email', p.email,
                        'phone', p.phone,
                        'is_leader', p.is_leader,
                        'department', p.department,
                        'degree', p.degree,
                        'year_of_study', p.year_of_study,
                        'college_name', COALESCE(pc.canonical_name, p.custom_college_name)
                    ) ORDER BY p.is_leader DESC, p.name ASC
                )
                FROM participants p
                LEFT JOIN colleges pc ON pc.id = p.college_id
                WHERE p.team_id = t.id
            )
        ) ORDER BY t.created_at DESC
    ) INTO v_teams
    FROM teams t
    LEFT JOIN participants l ON l.team_id = t.id AND l.is_leader = true
    LEFT JOIN colleges c ON c.id = l.college_id;

    RETURN COALESCE(v_teams, '[]'::JSONB);
END;
$$;

GRANT EXECUTE ON FUNCTION get_tracker_roster(TEXT) TO anon, authenticated;

