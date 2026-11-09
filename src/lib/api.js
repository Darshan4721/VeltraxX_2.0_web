// ==============================================================================
// VELTRAXX 2.0 · CLIENT SERVICE & RPC CONTRACT HANDLERS
// Connects to Supabase database functions with atomic-grade server verification.
// Compliant with docs/specs/VELTRAXX_2.0_UI_AND_CONTENT_SPEC.md (Patches 1 to 5).
// When VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are provided and VITE_USE_MOCK !== 'true',
// all operations run directly against the live Supabase database via REST/RPC.
// If offline or during local testing with mock enabled, falls back safely to development mock.
// ==============================================================================

import { supabase, isSupabaseConfigured, AUTHORIZED_COORDINATOR_EMAILS } from './supabaseClient';
import * as XLSX from 'xlsx';

const DEFAULT_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyYwNOj29rOCetf8DZhSFzLZQW1RBFq2HRrXmWM9joOuTn8Ant3nSVasbjwv5QjcQQFQw/exec';
const SUPABASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || 'https://krkiwilhwppqauyhwlcw.supabase.co';
const SUPABASE_ANON_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || 'sb_publishable_mxOTG_ykJt2RHXdJ7HOhZw_9i9s8SFu';
const IS_MOCK_ENV = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_USE_MOCK === 'true') || !SUPABASE_URL || !SUPABASE_ANON_KEY;

const REGISTERED_TEAMS_KEY = 'veltraxx_registered_teams';
const EVENT_STATE_KEY = 'veltraxx_event_state';

// ==============================================================================
// ACADEMIC TIER CALCULATION UTILITY (R1 ANTI-EXPLOIT SENIORITY ENGINE)
// - tier_a (TIER A: JUNIOR UG DIVISION): All members are 1st or 2nd Year UG.
// - tier_b (TIER B: SENIOR & RESEARCH DIVISION): Any single member is 3rd Year UG,
//   4th Year UG, 5th Year, PG, Research Scholar, or Working Professional.
// ==============================================================================
export function computeAcademicTier(members = []) {
  if (!Array.isArray(members) || members.length === 0) return 'tier_a';

  const isSenior = (m) => {
    const level = (m.level || '').toLowerCase().trim();
    const year = (m.year_of_study || '').toLowerCase().trim();

    // Check senior academic levels
    if (
      level.includes('pg') ||
      level.includes('post') ||
      level.includes('research') ||
      level.includes('working') ||
      level.includes('professional') ||
      level.includes('phd') ||
      level.includes('master')
    ) {
      return true;
    }

    // Check senior years of study
    if (
      year.startsWith('3') ||
      year.startsWith('4') ||
      year.startsWith('5') ||
      year.includes('final') ||
      year.includes('passed')
    ) {
      return true;
    }

    return false;
  };

  const hasSenior = members.some(isSenior);
  return hasSenior ? 'tier_b' : 'tier_a';
}

function normalizeEmail(email) {
  return (email || '').trim().toLowerCase();
}

function normalizePhone(phone) {
  const digits = (phone || '').replace(/[^0-9]/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

// ==============================================================================
// SEED TRACKER TEAMS (REALISTIC TEST MATRIX FOR DEADLINES, TIERS & WAITLIST)
// ==============================================================================
export const SEED_TRACKER_TEAMS = [
  // 1. Paid & Verified Shortlisted Team (Round 2 Confirmed)
  {
    team_id: "VTX2-001",
    team_name: "Silicon Synapse",
    track_id: "track_01",
    problem_code: "VTX-T1-01",
    academic_tier: "tier_b",
    team_size: 4,
    round1_status: "shortlisted",
    is_shortlisted: true,
    secret_passcode: "SILK94",
    ppt_pdf_drive_url: "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OIvE2up00/preview",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    shortlisted_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    payment_deadline: new Date(Date.now() - 86400000 * 0.5).toISOString(),
    utr_number: "983271829102",
    payment_screenshot_url: "/images/trophy-transparent.webp",
    is_paid_verified: true,
    members: [
      { role: "leader", full_name: "Arunachalam S", email: "arun.vlsi@psgtech.ac.in", phone: "9842154321", gender: "Male", department: "ECE", year_of_study: "4th Year", level: "UG", college_name: "PSG College of Technology" },
      { role: "member_2", full_name: "Karthikeyan M", email: "karthik.m@psgtech.ac.in", phone: "9842154322", gender: "Male", department: "ECE", year_of_study: "4th Year", level: "UG", college_name: "PSG College of Technology" },
      { role: "member_3", full_name: "Deepika R", email: "deepika.r@psgtech.ac.in", phone: "9842154323", gender: "Female", department: "ECE", year_of_study: "4th Year", level: "UG", college_name: "PSG College of Technology" },
      { role: "member_4", full_name: "Suresh Kumar P", email: "suresh.p@psgtech.ac.in", phone: "9842154324", gender: "Male", department: "ECE", year_of_study: "4th Year", level: "UG", college_name: "PSG College of Technology" }
    ]
  },
  // 2. Pending Evaluation Team (Junior UG Division)
  {
    team_id: "VTX2-002",
    team_name: "Verilog Vanguards",
    track_id: "track_02",
    problem_code: "VTX-T2-01",
    academic_tier: "tier_a",
    team_size: 3,
    round1_status: "pending",
    is_shortlisted: false,
    secret_passcode: "VANG02",
    ppt_pdf_drive_url: "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OIvE2up00/preview",
    created_at: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    shortlisted_at: null,
    payment_deadline: null,
    utr_number: null,
    payment_screenshot_url: null,
    is_paid_verified: false,
    members: [
      { role: "leader", full_name: "Naveen Prakash T", email: "naveen.p@siet.ac.in", phone: "9789012345", gender: "Male", department: "ECE", year_of_study: "2nd Year", level: "UG", college_name: "Sri Shakthi Institute of Engineering and Technology" },
      { role: "member_2", full_name: "Harish Kumar B", email: "harish.b@siet.ac.in", phone: "9789012346", gender: "Male", department: "ECE", year_of_study: "2nd Year", level: "UG", college_name: "Sri Shakthi Institute of Engineering and Technology" },
      { role: "member_3", full_name: "Sneha Varshini S", email: "sneha.v@siet.ac.in", phone: "9789012347", gender: "Female", department: "ECE", year_of_study: "2nd Year", level: "UG", college_name: "Sri Shakthi Institute of Engineering and Technology" }
    ]
  },
  // 3. Active Shortlisted Team (Remaining ~28h on 36h Payment Deadline)
  {
    team_id: "VTX2-003",
    team_name: "Quantum Core",
    track_id: "track_03",
    problem_code: "VTX-T3-01",
    academic_tier: "tier_b",
    team_size: 4,
    round1_status: "shortlisted",
    is_shortlisted: true,
    secret_passcode: "QNTM03",
    ppt_pdf_drive_url: "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OIvE2up00/preview",
    created_at: new Date(Date.now() - 86400000 * 1.2).toISOString(),
    shortlisted_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    payment_deadline: new Date(Date.now() + 28 * 3600 * 1000).toISOString(),
    utr_number: null,
    payment_screenshot_url: null,
    is_paid_verified: false,
    members: [
      { role: "leader", full_name: "Aditya Mohan", email: "aditya.m@iitm.ac.in", phone: "9876543210", gender: "Male", department: "EE", year_of_study: "3rd Year", level: "UG", college_name: "IIT Madras" },
      { role: "member_2", full_name: "Pooja Sundaram", email: "pooja.s@iitm.ac.in", phone: "9876543211", gender: "Female", department: "EE", year_of_study: "3rd Year", level: "UG", college_name: "IIT Madras" },
      { role: "member_3", full_name: "Rohan Varma", email: "rohan.v@iitm.ac.in", phone: "9876543212", gender: "Male", department: "CSE", year_of_study: "3rd Year", level: "UG", college_name: "IIT Madras" },
      { role: "member_4", full_name: "Ananya Iyer", email: "ananya.i@iitm.ac.in", phone: "9876543213", gender: "Female", department: "EE", year_of_study: "3rd Year", level: "UG", college_name: "IIT Madras" }
    ]
  },
  // 4. Expired Shortlisted Team (Lapsed 36h Window, Unpaid - Ready for Revocation)
  {
    team_id: "VTX2-004",
    team_name: "Neural Nexus",
    track_id: "track_04",
    problem_code: "VTX-T4-02",
    academic_tier: "tier_a",
    team_size: 2,
    round1_status: "shortlisted",
    is_shortlisted: true,
    secret_passcode: "NEX404",
    ppt_pdf_drive_url: "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OIvE2up00/preview",
    created_at: new Date(Date.now() - 86400000 * 2.5).toISOString(),
    shortlisted_at: new Date(Date.now() - 40 * 3600 * 1000).toISOString(),
    payment_deadline: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    utr_number: null,
    payment_screenshot_url: null,
    is_paid_verified: false,
    members: [
      { role: "leader", full_name: "Vikram Seth", email: "vikram.seth@cit.edu.in", phone: "9443123456", gender: "Male", department: "ECE", year_of_study: "1st Year", level: "UG", college_name: "Coimbatore Institute of Technology" },
      { role: "member_2", full_name: "Meera Krishnan", email: "meera.k@cit.edu.in", phone: "9443123457", gender: "Female", department: "ECE", year_of_study: "2nd Year", level: "UG", college_name: "Coimbatore Institute of Technology" }
    ]
  },
  // 5. Waitlisted Team 1 (Earliest in Queue - Priority Candidate for Promotion)
  {
    team_id: "VTX2-005",
    team_name: "RoboRangers",
    track_id: "track_05",
    problem_code: "VTX-T5-01",
    academic_tier: "tier_a",
    team_size: 3,
    round1_status: "waitlisted",
    is_shortlisted: false,
    secret_passcode: "ROBO05",
    ppt_pdf_drive_url: "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OIvE2up00/preview",
    created_at: new Date(Date.now() - 86400000 * 2.2).toISOString(),
    shortlisted_at: null,
    payment_deadline: null,
    utr_number: null,
    payment_screenshot_url: null,
    is_paid_verified: false,
    members: [
      { role: "leader", full_name: "Gokul Nath C", email: "gokul.c@kct.ac.in", phone: "9894123450", gender: "Male", department: "MCT", year_of_study: "2nd Year", level: "UG", college_name: "Kumaraguru College of Technology" },
      { role: "member_2", full_name: "Siddharth B", email: "siddharth.b@kct.ac.in", phone: "9894123451", gender: "Male", department: "MCT", year_of_study: "2nd Year", level: "UG", college_name: "Kumaraguru College of Technology" },
      { role: "member_3", full_name: "Kavya S", email: "kavya.s@kct.ac.in", phone: "9894123452", gender: "Female", department: "ECE", year_of_study: "2nd Year", level: "UG", college_name: "Kumaraguru College of Technology" }
    ]
  },
  // 6. Waitlisted Team 2 (Next in Queue)
  {
    team_id: "VTX2-006",
    team_name: "CyberSentinels",
    track_id: "track_01",
    problem_code: "VTX-T1-02",
    academic_tier: "tier_b",
    team_size: 3,
    round1_status: "waitlisted",
    is_shortlisted: false,
    secret_passcode: "CYBR06",
    ppt_pdf_drive_url: "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OIvE2up00/preview",
    created_at: new Date(Date.now() - 86400000 * 1.8).toISOString(),
    shortlisted_at: null,
    payment_deadline: null,
    utr_number: null,
    payment_screenshot_url: null,
    is_paid_verified: false,
    members: [
      { role: "leader", full_name: "Tarun Raj P", email: "tarun.raj@gct.ac.in", phone: "9790123401", gender: "Male", department: "EEE", year_of_study: "3rd Year", level: "UG", college_name: "Government College of Technology" },
      { role: "member_2", full_name: "Dharani M", email: "dharani.m@gct.ac.in", phone: "9790123402", gender: "Female", department: "EEE", year_of_study: "3rd Year", level: "UG", college_name: "Government College of Technology" },
      { role: "member_3", full_name: "Bala Murugan K", email: "bala.k@gct.ac.in", phone: "9790123403", gender: "Male", department: "ECE", year_of_study: "4th Year", level: "UG", college_name: "Government College of Technology" }
    ]
  },
  // 7. Rejected Team
  {
    team_id: "VTX2-007",
    team_name: "BioSignal Synapse",
    track_id: "track_02",
    problem_code: "VTX-T2-02",
    academic_tier: "tier_a",
    team_size: 2,
    round1_status: "rejected",
    is_shortlisted: false,
    secret_passcode: "BIOS07",
    ppt_pdf_drive_url: null,
    created_at: new Date(Date.now() - 86400000 * 3.5).toISOString(),
    shortlisted_at: null,
    payment_deadline: null,
    utr_number: null,
    payment_screenshot_url: null,
    is_paid_verified: false,
    members: [
      { role: "leader", full_name: "Praveen V", email: "praveen.v@srec.ac.in", phone: "9655123456", gender: "Male", department: "BME", year_of_study: "2nd Year", level: "UG", college_name: "Sri Ramakrishna Engineering College" },
      { role: "member_2", full_name: "Divya N", email: "divya.n@srec.ac.in", phone: "9655123457", gender: "Female", department: "BME", year_of_study: "2nd Year", level: "UG", college_name: "Sri Ramakrishna Engineering College" }
    ]
  }
];

function getStoredTeams() {
  try {
    if (typeof localStorage === 'undefined') return SEED_TRACKER_TEAMS;
    const raw = localStorage.getItem(REGISTERED_TEAMS_KEY);
    if (!raw) {
      localStorage.setItem(REGISTERED_TEAMS_KEY, JSON.stringify(SEED_TRACKER_TEAMS));
      return SEED_TRACKER_TEAMS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_TRACKER_TEAMS;
  } catch {
    return SEED_TRACKER_TEAMS;
  }
}

function saveStoredTeams(teams) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(REGISTERED_TEAMS_KEY, JSON.stringify(teams));
    }
  } catch (err) {
    console.error("Failed to persist registered teams to localStorage:", err);
  }
}

/**
 * Reset local storage back to seed baseline (useful for test resets)
 */
export function resetMockStorage() {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(REGISTERED_TEAMS_KEY, JSON.stringify(SEED_TRACKER_TEAMS));
  }
  return SEED_TRACKER_TEAMS;
}

/**
 * Fetch Live Event State (Live Clock & Dynamic Round 2 Per-Member Fee)
 */
export async function getLiveEventState() {
  if (!IS_MOCK_ENV) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/event_state?id=eq.1&select=*`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data[0]) return data[0];
      }
    } catch (err) {
      console.warn('[EventState] Live fetch error:', err);
    }
  }

  // Development Mock
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(EVENT_STATE_KEY) : null;
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    id: 1,
    is_clock_public: false,
    clock_state: 'STOPPED',
    clock_start_timestamp: null,
    clock_end_timestamp: null,
    live_announcement_text: 'Welcome to VELTRAXX 2.0. The 24-Hour Offline Arena is initializing.',
    round2_fee_per_member: 500
  };
}

/**
 * 100% Free Round 1 Team Registration (RPC 1: register_free_team)
 * Generates VTX2-001 sequentially, computes academic tier server-side,
 * enforces intra-team and cross-database member deduplication, and returns secret_passcode.
 */
export const registerTeam = registerFreeTeam;

export async function registerFreeTeam(payload) {
  const { team_name, track_id, problem_code, academic_tier, team_size, members } = payload;
  
  if (!IS_MOCK_ENV) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/register_free_team`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        p_team_name: team_name,
        p_track_id: track_id,
        p_problem_code: problem_code,
        p_academic_tier: academic_tier,
        p_team_size: team_size,
        p_members: members
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to register team. Please check your network connection.");
    }

    const data = await res.json();
    if (data && data.success === false) {
      throw new Error(data.error || "Failed to register team.");
    }

    // Auto-dispatch registration row to Google Apps Script Webhook for real-time Google Sheet audit
    const webhookUrl = (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_GOOGLE_APPS_SCRIPT_WEBHOOK_URL || import.meta.env?.VITE_GOOGLE_SCRIPT_URL)) || DEFAULT_WEBHOOK_URL;
    if (webhookUrl && data?.team_id) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload: {
            teamId: data.team_id,
            teamName: team_name.trim(),
            trackId: track_id,
            problemCode: problem_code,
            academicTier: academic_tier,
            members: members
          }
        }),
        mode: 'no-cors'
      }).catch(err => console.warn('[GoogleAppsScript] sync notice:', err));
    }

    return data;
  }

  // =========================================================================
  // DEVELOPMENT MOCK (OFFLINE / LOCAL TEST MODE)
  // Mirrors SQL function public.register_free_team 1:1
  // =========================================================================
  await new Promise(r => setTimeout(r, 400));

  const parsedSize = parseInt(team_size, 10);
  if (![2, 3, 4].includes(parsedSize)) {
    throw new Error("Team size must be exactly 2, 3, or 4 members.");
  }

  if (!Array.isArray(members) || members.length !== parsedSize) {
    throw new Error("Members data count does not match declared team size.");
  }

  if (!team_name || !team_name.trim()) {
    throw new Error("Team name is required.");
  }

  const stored = getStoredTeams();

  // 1. Intra-team duplicate checks (email & 10-digit phone)
  const seenEmails = new Set();
  const seenPhones = new Set();

  for (const m of members) {
    const memberName = m.full_name || m.name || 'Participant';
    const email = normalizeEmail(m.email);
    const phone = normalizePhone(m.phone);

    if (!email) {
      throw new Error(`Email address is required for member "${memberName}".`);
    }
    if (seenEmails.has(email)) {
      throw new Error(`Duplicate email address "${email}" entered multiple times within the team roster.`);
    }
    seenEmails.add(email);

    if (phone.length < 10) {
      throw new Error(`A valid 10-digit mobile number is required for member "${memberName}".`);
    }
    if (seenPhones.has(phone)) {
      throw new Error(`Duplicate phone number "${phone}" entered multiple times within the team roster.`);
    }
    seenPhones.add(phone);
  }

  // 2. Cross-database duplicate checks against existing active teams
  for (const m of members) {
    const memberName = m.full_name || m.name || 'Participant';
    const email = normalizeEmail(m.email);
    const phone = normalizePhone(m.phone);

    for (const team of stored) {
      if (team.round1_status === 'rejected') continue;
      if (!Array.isArray(team.members)) continue;

      for (const ex of team.members) {
        const exEmail = normalizeEmail(ex.email);
        const exPhone = normalizePhone(ex.phone);

        if (email === exEmail || phone === exPhone) {
          throw new Error(
            `Member "${memberName}" (${email}) is already registered with Team ${team.team_id} ("${team.team_name}"). Multiple team registrations are not permitted under VELTRAXX anti-cheat protocols.`
          );
        }
      }
    }
  }

  // 3. Server-side auto-tier calculation based on member seniority
  const computedTier = computeAcademicTier(members);

  // 4. Sequential Team ID and 6-char Passcode generation
  const nextNum = stored.length + 1;
  const newTeamId = `VTX2-${String(nextNum).padStart(3, '0')}`;
  const newPasscode = Math.random().toString(36).substring(2, 8).toUpperCase();

  const newTeam = {
    team_id: newTeamId,
    team_name: team_name.trim(),
    track_id,
    problem_code,
    academic_tier: computedTier,
    team_size: parsedSize,
    round1_status: 'pending',
    is_shortlisted: false,
    shortlisted_at: null,
    payment_deadline: null,
    secret_passcode: newPasscode,
    ppt_pdf_drive_url: null,
    utr_number: null,
    payment_screenshot_url: null,
    is_paid_verified: false,
    created_at: new Date().toISOString(),
    members: members.map((m, idx) => ({
      role: m.role || (idx === 0 ? 'leader' : `member_${idx + 1}`),
      full_name: m.full_name || m.name || 'Participant',
      email: normalizeEmail(m.email),
      phone: normalizePhone(m.phone),
      gender: m.gender || 'Not specified',
      college_name: m.college_name || 'SIET',
      department: m.department || 'ECE',
      year_of_study: m.year_of_study || '1st Year',
      level: m.level || 'UG'
    }))
  };

  saveStoredTeams([newTeam, ...stored]);

  // Auto-dispatch registration row to Google Apps Script Webhook for real-time Google Sheet audit
  const webhookUrl = (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_GOOGLE_APPS_SCRIPT_WEBHOOK_URL || import.meta.env?.VITE_GOOGLE_SCRIPT_URL)) || DEFAULT_WEBHOOK_URL;
  if (webhookUrl && newTeam?.team_id) {
    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payload: {
          teamId: newTeam.team_id,
          teamName: newTeam.team_name,
          trackId: newTeam.track_id,
          problemCode: newTeam.problem_code,
          academicTier: newTeam.academic_tier,
          members: newTeam.members
        }
      }),
      mode: 'no-cors'
    }).catch(err => console.warn('[GoogleAppsScript] mock sync notice:', err));
  }

  return {
    success: true,
    team_id: newTeamId,
    academic_tier: computedTier,
    team_name: team_name.trim(),
    message: "Free Round 1 registration confirmed."
  };
}

/**
 * Forgot Team ID / Lookup for PPT Submission (RPC 2: lookup_team_for_ppt)
 */
export async function lookupTeamForPpt(identifier) {
  const cleanId = (identifier || '').trim();
  if (!cleanId) return { found: false };

  if (!IS_MOCK_ENV) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/lookup_team_for_ppt`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ p_identifier: cleanId })
    });

    if (!res.ok) return { found: false };
    return await res.json();
  }

  // Mock Lookup
  await new Promise(r => setTimeout(r, 200));
  const stored = getStoredTeams();
  const match = stored.find(t => 
    t.team_id.toUpperCase() === cleanId.toUpperCase() ||
    (Array.isArray(t.members) && t.members.some(m => 
      normalizeEmail(m.email) === normalizeEmail(cleanId) || 
      normalizePhone(m.phone) === normalizePhone(cleanId)
    ))
  );

  if (!match) return { found: false };
  return {
    found: true,
    team_id: match.team_id,
    team_name: match.team_name,
    track_id: match.track_id,
    problem_code: match.problem_code,
    has_submitted: !!match.ppt_pdf_drive_url
  };
}

/**
 * Submit Round 1 PPT Embed URL (RPC 3: submit_round1_ppt)
 */
export async function submitRound1Ppt(payload) {
  const { team_id, leader_email, drive_preview_url, extracted_text } = payload;

  if (!IS_MOCK_ENV) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/submit_round1_ppt`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        p_team_id: team_id,
        p_leader_email: leader_email,
        p_drive_preview_url: drive_preview_url,
        p_extracted_text: extracted_text || null
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to save PPT submission.");
    }
    const data = await res.json();
    if (data && data.success === false) {
      throw new Error(data.error || "Failed to save PPT submission.");
    }
    return data;
  }

  // Mock submission
  await new Promise(r => setTimeout(r, 350));
  const stored = getStoredTeams();
  const team = stored.find(t => t.team_id.toUpperCase() === (team_id || '').trim().toUpperCase());
  if (!team) throw new Error("Team ID not found.");
  
  team.ppt_pdf_drive_url = drive_preview_url;
  team.extracted_slide_text = extracted_text;
  saveStoredTeams([...stored]);

  return { success: true, message: "Round 1 blueprint submitted successfully." };
}

/**
 * Verify Round 2 Gatekeeper Passcode (RPC 4: verify_round2_gatekeeper)
 * Checks secret passcode, verifies shortlisted status, enforces 36-hour payment deadline,
 * and returns dynamic pricing with deadlines.
 */
export async function verifyRound2Gatekeeper(teamId, passcode) {
  const cleanTeamId = (teamId || '').trim().toUpperCase();
  const cleanPasscode = (passcode || '').trim().toUpperCase();

  if (!IS_MOCK_ENV) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/verify_round2_gatekeeper`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        p_team_id: cleanTeamId,
        p_passcode: cleanPasscode
      })
    });

    if (!res.ok) {
      return { valid: false, is_expired: false, error: "Authentication failed or server error." };
    }
    return await res.json();
  }

  // Development Mock Gatekeeper
  await new Promise(r => setTimeout(r, 300));
  const stored = getStoredTeams();

  const team = stored.find(t => 
    t.team_id.toUpperCase() === cleanTeamId && 
    (t.secret_passcode || '').toUpperCase() === cleanPasscode &&
    t.is_shortlisted === true
  );

  if (!team) {
    return { 
      valid: false, 
      is_expired: false, 
      error: "ACCESS RESTRICTED: Invalid passcode or team not shortlisted for Round 2." 
    };
  }

  // 36-Hour Expiry Check for Unpaid Shortlisted Seats
  if (team.payment_deadline && new Date() > new Date(team.payment_deadline) && !team.is_paid_verified) {
    return {
      valid: false,
      is_expired: true,
      error: `SEAT RESERVATION EXPIRED: The 36-hour payment deadline for Team ${team.team_id} lapsed on ${new Date(team.payment_deadline).toLocaleString()}. This seat has been reallocated to the waitlist.`
    };
  }

  const liveState = await getLiveEventState();
  const feePerHead = liveState?.round2_fee_per_member || 500;

  return {
    valid: true,
    team_id: team.team_id,
    team_name: team.team_name,
    team_size: team.team_size,
    fee_per_member: feePerHead,
    total_fee: team.team_size * feePerHead,
    is_paid_verified: !!team.is_paid_verified,
    submitted_utr: team.utr_number || null,
    shortlisted_at: team.shortlisted_at || null,
    payment_deadline: team.payment_deadline || null
  };
}

/**
 * Submit Round 2 Payment Proof (RPC 5: submit_round2_payment)
 */
export async function submitRound2Payment(payload) {
  const { team_id, passcode, secret_passcode, utr_number, screenshot_url, payment_screenshot_url } = payload;
  const pCode = (passcode || secret_passcode || '').trim().toUpperCase();
  const sUrl = (screenshot_url || payment_screenshot_url || '').trim();

  if (!IS_MOCK_ENV) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/submit_round2_payment`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        p_team_id: team_id,
        p_passcode: pCode,
        p_utr_number: utr_number,
        p_screenshot_url: sUrl
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to commit payment confirmation.");
    }
    const data = await res.json();
    if (data && data.success === false) {
      throw new Error(data.error || "Payment submission failed.");
    }
    return data;
  }

  // Mock Payment
  await new Promise(r => setTimeout(r, 350));
  const stored = getStoredTeams();
  const team = stored.find(t => t.team_id.toUpperCase() === (team_id || '').trim().toUpperCase());
  if (!team) throw new Error("Team not found.");
  
  team.utr_number = utr_number;
  team.payment_screenshot_url = sUrl;
  team.is_paid_verified = true;
  saveStoredTeams([...stored]);

  return { success: true, message: "Payment proof submitted for coordinator verification." };
}

/**
 * Public Capacity Helper (Maintains compatibility with Navbar)
 */
export async function getPublicCapacity() {
  if (!IS_MOCK_ENV) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_public_capacity`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('[Capacity] Offline fallback or fetch error:', err);
    }
  }

  const stored = getStoredTeams();
  return {
    claimed_teams: stored.length,
    max_teams: 2000,
    is_full: stored.length >= 2000
  };
}

/**
 * Admin / Coordinator Login via Supabase Auth or Authorized Coordinator Directory
 */
export async function adminLogin({ email, password }) {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail) throw new Error("Email address is required.");
  if (!password) throw new Error("Password is required.");

  if (!AUTHORIZED_COORDINATOR_EMAILS.includes(cleanEmail)) {
    throw new Error("Access restricted strictly to authorized VELTRAXX coordinators.");
  }

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password
    });
    if (error) {
      throw new Error(error.message || "Invalid coordinator credentials.");
    }
    return {
      success: true,
      email: data.user.email,
      token: data.session.access_token
    };
  }

  // Local / Mock fallback mode
  await new Promise(r => setTimeout(r, 300));
  if (password.length < 6) {
    throw new Error("Invalid password. Must be at least 6 characters.");
  }

  return {
    success: true,
    email: cleanEmail,
    token: `vtx-coord-token-${btoa(cleanEmail)}`
  };
}

/**
 * Coordinator Roster (Fetch all teams with deadlines and secret passcodes)
 */
export async function getTrackerRoster(authToken) {
  const token = (authToken || '').trim();
  if (!token) throw new Error("UNAUTHORIZED: Coordinator authorization token is required.");

  if (isSupabaseConfigured && supabase) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_coordinator_roster`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) throw new Error("UNAUTHORIZED: Session expired or invalid authorization.");
    return await res.json();
  }

  await new Promise(r => setTimeout(r, 250));
  if (!token.startsWith('vtx-coord-token-') && token.length < 10) {
    throw new Error("UNAUTHORIZED: Invalid coordinator authorization token.");
  }
  return getStoredTeams();
}

/**
 * Admin Team Status Update RPC (Persists Shortlist/Waitlist/Reject decisions)
 */
export async function adminUpdateTeamStatus(authToken, teamId, status, isShortlisted) {
  const token = (authToken || '').trim();
  if (!token) throw new Error("UNAUTHORIZED: Coordinator authorization token is required.");

  if (isSupabaseConfigured && supabase) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/admin_update_team_status`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        p_team_id: teamId,
        p_status: status,
        p_is_shortlisted: isShortlisted
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to update team status.");
    }
    const data = await res.json();
    if (data && data.success === false) {
      throw new Error(data.error || "Failed to update team status.");
    }
    return data;
  }

  // Mock Mode
  await new Promise(r => setTimeout(r, 200));
  if (!token.startsWith('vtx-coord-token-') && token.length < 10) {
    throw new Error("UNAUTHORIZED: Invalid coordinator authorization token.");
  }

  const stored = getStoredTeams();
  const team = stored.find(t => t.team_id.toUpperCase() === teamId.toUpperCase());
  if (!team) throw new Error("Team not found.");

  team.round1_status = status;
  team.is_shortlisted = isShortlisted;
  if (isShortlisted) {
    team.shortlisted_at = team.shortlisted_at || new Date().toISOString();
    team.payment_deadline = team.payment_deadline || new Date(Date.now() + 36 * 3600 * 1000).toISOString();
  } else {
    team.payment_deadline = null;
  }

  saveStoredTeams([...stored]);

  return {
    success: true,
    team_id: team.team_id,
    round1_status: status,
    is_shortlisted: isShortlisted,
    shortlisted_at: team.shortlisted_at,
    payment_deadline: team.payment_deadline
  };
}

/**
 * Revoke Expired Seats & Promote Waitlist
 */
export async function revokeExpiredSeatAndPromote(authToken) {
  const token = (authToken || '').trim();
  if (!token) throw new Error("UNAUTHORIZED: Coordinator authorization token is required.");

  if (isSupabaseConfigured && supabase) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/revoke_expired_seats_and_promote_waitlist`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to execute seat revocation and waitlist promotion.");
    }

    const data = await res.json();
    if (data && data.success === false) {
      throw new Error(data.error || "Failed to execute revocation.");
    }
    return data;
  }

  // Development Mock Mode
  await new Promise(r => setTimeout(r, 350));
  if (!token.startsWith('vtx-coord-token-') && token.length < 10) {
    throw new Error("UNAUTHORIZED: Invalid coordinator authorization token.");
  }

  const stored = getStoredTeams();
  const now = new Date();
  let revokedCount = 0;
  const revokedTeams = [];
  let promotedCount = 0;
  const promotedTeams = [];

  const updatedTeams = stored.map(t => ({ ...t }));

  for (const t of updatedTeams) {
    if (t.is_shortlisted && !t.is_paid_verified && t.payment_deadline) {
      if (new Date(t.payment_deadline) < now) {
        t.is_shortlisted = false;
        t.round1_status = 'waitlisted';
        t.payment_deadline = null;
        revokedCount++;
        revokedTeams.push(t.team_id);

        const candidate = updatedTeams
          .filter(cand => cand.round1_status === 'waitlisted' && !cand.is_shortlisted && !revokedTeams.includes(cand.team_id))
          .sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0))[0];

        if (candidate) {
          candidate.is_shortlisted = true;
          candidate.round1_status = 'shortlisted';
          candidate.shortlisted_at = new Date().toISOString();
          candidate.payment_deadline = new Date(Date.now() + 36 * 3600 * 1000).toISOString();
          promotedCount++;
          promotedTeams.push(candidate.team_id);
        }
      }
    }
  }

  saveStoredTeams(updatedTeams);

  return {
    success: true,
    revoked_count: revokedCount,
    revoked_teams: revokedTeams,
    promoted_count: promotedCount,
    promoted_teams: promotedTeams,
    message: `Revoked ${revokedCount} expired seat(s) and promoted ${promotedCount} waitlist team(s).`
  };
}

/**
 * Hardened SheetJS Flat-Row Master XLSX Export
 * Forces text formatting (@) and string type on Phone, Roll No, UTR, and Team ID columns.
 */
export function exportRegistrationsToXLSX(teams) {
  if (!Array.isArray(teams) || teams.length === 0) {
    throw new Error("No teams data available to export.");
  }

  const rows = [];
  
  teams.forEach(team => {
    const members = team.members || [];
    const m1 = members[0] || {};
    const m2 = members[1] || {};
    const m3 = members[2] || {};
    const m4 = members[3] || {};

    rows.push({
      'Team ID': team.team_id || '',
      'Team Name': team.team_name || '',
      'Track Code': team.track_id || '',
      'Problem Code': team.problem_code || '',
      'Academic Tier': team.academic_tier === 'tier_a' ? 'Tier A (Junior UG)' : 'Tier B (Senior / Research)',
      'Member Count': members.length,
      
      'Member 1 Name': m1.full_name || m1.name || '',
      'Member 1 Email': m1.email || '',
      'Member 1 Phone': m1.phone ? String(m1.phone) : '',
      'Member 1 College': m1.college_name || '',
      'Member 1 Dept': m1.department || '',
      'Member 1 Year': m1.year_of_study || '',
      'Member 1 Roll No': m1.roll_number || m1.reg_no || '',

      'Member 2 Name': m2.full_name || m2.name || '',
      'Member 2 Email': m2.email || '',
      'Member 2 Phone': m2.phone ? String(m2.phone) : '',
      'Member 2 College': m2.college_name || '',
      'Member 2 Dept': m2.department || '',
      'Member 2 Year': m2.year_of_study || '',
      'Member 2 Roll No': m2.roll_number || m2.reg_no || '',

      'Member 3 Name': m3.full_name || m3.name || '',
      'Member 3 Email': m3.email || '',
      'Member 3 Phone': m3.phone ? String(m3.phone) : '',
      'Member 3 College': m3.college_name || '',
      'Member 3 Dept': m3.department || '',
      'Member 3 Year': m3.year_of_study || '',
      'Member 3 Roll No': m3.roll_number || m3.reg_no || '',

      'Member 4 Name': m4.full_name || m4.name || '',
      'Member 4 Email': m4.email || '',
      'Member 4 Phone': m4.phone ? String(m4.phone) : '',
      'Member 4 College': m4.college_name || '',
      'Member 4 Dept': m4.department || '',
      'Member 4 Year': m4.year_of_study || '',
      'Member 4 Roll No': m4.roll_number || m4.reg_no || '',

      'Round 1 Status': (team.round1_status || 'pending').toUpperCase(),
      'Is Shortlisted': team.is_shortlisted ? 'YES' : 'NO',
      'Round 2 Paid Status': team.is_paid_verified ? 'PAID & VERIFIED' : (team.utr_number ? 'PROOF SUBMITTED' : 'UNPAID'),
      'UTR Number': team.utr_number ? String(team.utr_number) : '',
      'Receipt Link': team.payment_screenshot_url || '',
      'PPT / Drive Link': team.ppt_pdf_drive_url || '',
      'Registration Date': team.created_at || ''
    });
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Force String type (cell.t = 's') and Text format (cell.z = '@') to prevent scientific notation in Excel
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
  const textColumnPatterns = ['Phone', 'Roll No', 'UTR', 'Team ID'];

  for (let C = range.s.c; C <= range.e.c; ++C) {
    const headerCellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
    const headerCell = worksheet[headerCellAddress];
    const headerTitle = headerCell ? String(headerCell.v) : '';

    const isTextCol = textColumnPatterns.some(pattern => headerTitle.includes(pattern));

    if (isTextCol) {
      for (let R = range.s.r + 1; R <= range.e.r; ++R) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = worksheet[cellAddress];
        if (cell && cell.v !== undefined && cell.v !== null) {
          cell.t = 's';
          cell.z = '@';
          cell.v = String(cell.v);
        }
      }
    }
  }

  // Set balanced column widths
  worksheet['!cols'] = [
    { wch: 12 }, { wch: 22 }, { wch: 12 }, { wch: 14 }, { wch: 22 }, { wch: 14 },
    { wch: 18 }, { wch: 24 }, { wch: 14 }, { wch: 28 }, { wch: 12 }, { wch: 12 }, { wch: 14 },
    { wch: 18 }, { wch: 24 }, { wch: 14 }, { wch: 28 }, { wch: 12 }, { wch: 12 }, { wch: 14 },
    { wch: 18 }, { wch: 24 }, { wch: 14 }, { wch: 28 }, { wch: 12 }, { wch: 12 }, { wch: 14 },
    { wch: 18 }, { wch: 24 }, { wch: 14 }, { wch: 28 }, { wch: 12 }, { wch: 12 }, { wch: 14 },
    { wch: 16 }, { wch: 14 }, { wch: 20 }, { wch: 20 }, { wch: 32 }, { wch: 32 }, { wch: 22 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Master Roster');
  XLSX.writeFile(workbook, `VELTRAXX_2.0_Master_Roster_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
