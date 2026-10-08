-- ==============================================================================
-- VELTRAXX 2.0 - INITIAL DATABASE SCHEMA
-- Migration: 001_initial_schema.sql
-- Description: Core tables for teams, participants, and event configuration.
-- ==============================================================================

-- 1. Create Enums
CREATE TYPE team_status AS ENUM ('pending', 'verified', 'rejected');

-- 2. Teams Table
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    track VARCHAR(100) NOT NULL DEFAULT 'Unified Semiconductor Hardware Challenge',
    receipt_url TEXT NOT NULL,
    utr_number VARCHAR(50),
    status team_status NOT NULL DEFAULT 'pending',
    verified_at TIMESTAMPTZ,
    verified_by VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Participants Table (1 Leader + 3 Members per Team = 4 Members strictly)
CREATE TABLE IF NOT EXISTS participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    college VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    degree_year VARCHAR(100) NOT NULL,
    is_leader BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Attendance Check-in Matrix (4 Slots)
CREATE TABLE IF NOT EXISTS attendance_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    slot_number INT NOT NULL CHECK (slot_number BETWEEN 1 AND 4),
    slot_name VARCHAR(100) NOT NULL,
    checked_in_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    volunteer_name VARCHAR(100) NOT NULL,
    UNIQUE(team_id, slot_number)
);

-- 5. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_teams_status ON teams(status);
CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(lower(name));
CREATE INDEX IF NOT EXISTS idx_participants_team_id ON participants(team_id);
CREATE INDEX IF NOT EXISTS idx_participants_email ON participants(lower(email));
CREATE INDEX IF NOT EXISTS idx_attendance_team_id ON attendance_checkins(team_id);
