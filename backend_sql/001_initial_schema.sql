-- ==============================================================================
-- VELTRAXX 2.0 - INITIAL DATABASE SCHEMA
-- Migration: 001_initial_schema.sql
-- Description: Core tables for canonical colleges, teams, participants, 
--              and event attendance tracking.
-- ==============================================================================

-- 1. Create Enums
CREATE TYPE team_status AS ENUM ('pending', 'verified', 'rejected');

-- 2. Canonical Colleges Directory Table
-- Prevents spelling fragmentation (e.g. SIET vs Sri Shakthi vs S.I.E.T)
CREATE TABLE IF NOT EXISTS colleges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_name VARCHAR(255) NOT NULL UNIQUE,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL DEFAULT 'Tamil Nadu',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Teams Table
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    track VARCHAR(100) NOT NULL DEFAULT 'Unified Semiconductor Hardware Challenge',
    receipt_url TEXT NOT NULL,
    utr_number VARCHAR(12) NOT NULL UNIQUE CHECK (utr_number ~ '^[0-9]{12}$'),
    status team_status NOT NULL DEFAULT 'pending',
    
    -- Leader-level telemetry & metadata
    interest_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    hear_source VARCHAR(100),
    college_city VARCHAR(100),
    college_state VARCHAR(100),
    
    -- DPDP Act double-consent flags
    consent_event_terms BOOLEAN NOT NULL DEFAULT false,
    consent_future_events BOOLEAN NOT NULL DEFAULT false,
    consent_timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    
    -- Audit & verification
    verified_at TIMESTAMPTZ,
    verified_by VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Participants Table (1 Leader + 3 Members per Team = Strictly 4 Members)
CREATE TABLE IF NOT EXISTS participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    is_leader BOOLEAN NOT NULL DEFAULT false,
    
    -- Identity & Contact
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    
    -- Academic / Institution Reference
    college_id UUID REFERENCES colleges(id) ON DELETE SET NULL,
    custom_college_name VARCHAR(255),
    custom_college_city VARCHAR(100),
    custom_college_state VARCHAR(100),
    
    -- Academic Details
    degree VARCHAR(50),
    level VARCHAR(50), -- 'UG', 'PG', 'Research scholar', 'Working professional'
    department VARCHAR(100),
    year_of_study VARCHAR(50),
    roll_no VARCHAR(50),
    
    -- Working Professional Branch
    organisation VARCHAR(255),
    designation VARCHAR(150),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Attendance Check-in Matrix (4 Slots)
CREATE TABLE IF NOT EXISTS attendance_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    slot_number INT NOT NULL CHECK (slot_number BETWEEN 1 AND 4),
    slot_name VARCHAR(100) NOT NULL,
    checked_in_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    volunteer_name VARCHAR(100) NOT NULL,
    UNIQUE(team_id, slot_number)
);

-- 6. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_colleges_name ON colleges(lower(canonical_name));
CREATE INDEX IF NOT EXISTS idx_teams_status ON teams(status);
CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(lower(name));
CREATE INDEX IF NOT EXISTS idx_teams_utr ON teams(lower(utr_number));
CREATE INDEX IF NOT EXISTS idx_participants_team_id ON participants(team_id);
CREATE INDEX IF NOT EXISTS idx_participants_email ON participants(lower(email));
CREATE INDEX IF NOT EXISTS idx_participants_phone ON participants(phone);
CREATE INDEX IF NOT EXISTS idx_participants_college_id ON participants(college_id);
CREATE INDEX IF NOT EXISTS idx_attendance_team_id ON attendance_checkins(team_id);
