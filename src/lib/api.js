// ==============================================================================
// VELTRAXX 2.0 · CLIENT SERVICE & RPC CONTRACT HANDLERS
// Connects to Supabase database functions with atomic-grade server verification.
// Compliant with docs/specs/VELTRAXX_2.0_UI_AND_CONTENT_SPEC.md (Patches 1 to 5).
// When VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are provided and VITE_USE_MOCK !== 'true',
// all operations run directly against the live Supabase database via REST/RPC.
// If offline or during local testing with mock enabled, falls back safely to development mock.
// ==============================================================================

import {
  supabase,
  isSupabaseConfigured,
  AUTHORIZED_COORDINATOR_EMAILS,
  isPreviewWriteBlocked,
  getPreviewProtectionError
} from './supabaseClient.js';
import * as XLSX from 'xlsx';

function assertWritableEnvironment(actionLabel = 'Mutation') {
  if (isPreviewWriteBlocked()) {
    throw new Error(getPreviewProtectionError(actionLabel));
  }
}

const SUPABASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || 'https://krkiwilhwppqauyhwlcw.supabase.co';
const SUPABASE_ANON_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || 'sb_publishable_mxOTG_ykJt2RHXdJ7HOhZw_9i9s8SFu';
const IS_MOCK_ENV = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_USE_MOCK === 'true') || !SUPABASE_URL || !SUPABASE_ANON_KEY;

const REGISTERED_TEAMS_KEY = 'veltraxx_registered_teams';
const EVENT_STATE_KEY = 'veltraxx_event_state';
const CHECKOUT_HOLDS_KEY = 'veltraxx_mock_checkout_holds';

function getMockCheckoutHolds() {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(CHECKOUT_HOLDS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    const now = Date.now();
    return Array.isArray(list) ? list.filter((h) => h && h.expires_at && new Date(h.expires_at).getTime() > now) : [];
  } catch {
    return [];
  }
}

function saveMockCheckoutHolds(holds) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CHECKOUT_HOLDS_KEY, JSON.stringify(holds));
    }
  } catch {}
}

function fileOrBlobToDataUrl(fileOrBlob) {
  return new Promise((resolve, reject) => {
    if (!fileOrBlob) return resolve('');
    if (typeof FileReader !== 'undefined') {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Failed reading payment screenshot file.'));
      reader.readAsDataURL(fileOrBlob);
      return;
    }
    Promise.resolve(fileOrBlob.arrayBuffer?.())
      .then((buf) => {
        if (!buf) return resolve('');
        const mime = fileOrBlob.type || 'image/png';
        resolve(`data:${mime};base64,${Buffer.from(buf).toString('base64')}`);
      })
      .catch(reject);
  });
}

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
    team_size: 3,
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
      { role: "member_3", full_name: "Deepika R", email: "deepika.r@psgtech.ac.in", phone: "9842154323", gender: "Female", department: "ECE", year_of_study: "4th Year", level: "UG", college_name: "PSG College of Technology" }
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
    team_size: 3,
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
      { role: "member_3", full_name: "Rohan Varma", email: "rohan.v@iitm.ac.in", phone: "9876543212", gender: "Male", department: "CSE", year_of_study: "3rd Year", level: "UG", college_name: "IIT Madras" }
    ]
  },
  // 4. Expired Shortlisted Team (Lapsed 36h Window, Unpaid - Ready for Revocation)
  {
    team_id: "VTX2-004",
    team_name: "Neural Nexus",
    track_id: "track_04",
    problem_code: "VTX-T4-02",
    academic_tier: "tier_a",
    team_size: 3,
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
      { role: "member_2", full_name: "Meera Krishnan", email: "meera.k@cit.edu.in", phone: "9443123457", gender: "Female", department: "ECE", year_of_study: "2nd Year", level: "UG", college_name: "Coimbatore Institute of Technology" },
      { role: "member_3", full_name: "Rahul S", email: "rahul.s@cit.edu.in", phone: "9443123458", gender: "Male", department: "ECE", year_of_study: "2nd Year", level: "UG", college_name: "Coimbatore Institute of Technology" }
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
    team_size: 3,
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
      { role: "member_2", full_name: "Divya N", email: "divya.n@srec.ac.in", phone: "9655123457", gender: "Female", department: "BME", year_of_study: "2nd Year", level: "UG", college_name: "Sri Ramakrishna Engineering College" },
      { role: "member_3", full_name: "Anand K", email: "anand.k@srec.ac.in", phone: "9655123458", gender: "Male", department: "BME", year_of_study: "2nd Year", level: "UG", college_name: "Sri Ramakrishna Engineering College" }
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
        cache: 'no-store',
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

export async function getWindowStatus() {
  if (!IS_MOCK_ENV) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_window_status`, {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: '{}'
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('[WindowStatus] Live fetch notice:', err);
    }
  }
  const stored = getStoredTeams();
  const holds = getMockCheckoutHolds();
  const claimed = stored.filter(t => t.round1_status !== 'rejected').length + holds.length;
  return {
    registration_open: true,
    payment_open: false,
    registration_deadline: '2026-12-12T23:59:59+05:30',
    max_teams_cap: 60,
    payment_reservation_minutes: 5,
    claimed_teams: claimed,
    is_full: claimed >= 60,
    ppt_open: false,
    ppt_window_end: '2026-12-12T23:59:59+05:30',
    ppt_grace_minutes: 0
  };
}

/**
 * Step 1: Reserve temporary internal checkout slot (validates 3-member roster & capacity).
 * Does NOT create a completed team registration or Team ID.
 */
export async function reserveCheckoutSlot(payload) {
  assertWritableEnvironment('Checkout seat reservation');
  const { team_name, track_id, problem_code, team_size, members, reservation_token, idempotency_key } = payload || {};

  const parsedSize = parseInt(team_size, 10);
  if (parsedSize !== 3) {
    throw new Error("Team size must be strictly 3 members (1 Team Leader and 2 Team Members).");
  }
  if (!Array.isArray(members) || members.length !== 3) {
    throw new Error("Exactly 3 team members (1 Leader + 2 Members) are required.");
  }

  if (!IS_MOCK_ENV) {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        team_name,
        track_id,
        problem_code,
        team_size: parsedSize,
        members,
        reservation_token: reservation_token || null,
        idempotency_key: idempotency_key || null
      })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.success === false || !data?.reservation_token) {
      throw new Error(data?.error || "Unable to verify capacity and proceed to payment. Please retry.");
    }
    return data;
  }

  // Development Mock Seat Hold (does NOT append to REGISTERED_TEAMS_KEY)
  await new Promise(r => setTimeout(r, 300));
  if (!team_name || team_name.trim().length < 3) {
    throw new Error("Team name must be at least 3 characters.");
  }

  const stored = getStoredTeams();
  const seenEmails = new Set();
  const seenPhones = new Set();

  for (const m of members) {
    const memberName = m.full_name || m.name || 'Participant';
    const email = normalizeEmail(m.email);
    const phone = normalizePhone(m.phone);
    if (!email) throw new Error(`Email address is required for "${memberName}".`);
    if (seenEmails.has(email)) throw new Error(`Duplicate email address "${email}" entered within the team roster.`);
    seenEmails.add(email);
    if (phone.length < 10) throw new Error(`Valid 10-digit mobile number is required for "${memberName}".`);
    if (seenPhones.has(phone)) throw new Error(`Duplicate phone number "${phone}" entered within the team roster.`);
    seenPhones.add(phone);
  }

  for (const m of members) {
    const memberName = m.full_name || m.name || 'Participant';
    const email = normalizeEmail(m.email);
    const phone = normalizePhone(m.phone);
    for (const team of stored) {
      if (team.round1_status === 'rejected') continue;
      if (Array.isArray(team.members) && team.members.some(ex => normalizeEmail(ex.email) === email || normalizePhone(ex.phone) === phone)) {
        throw new Error(`Member "${memberName}" (${email}) is already registered with Team ${team.team_id} ("${team.team_name}").`);
      }
    }
  }

  const existingHolds = getMockCheckoutHolds().filter(h => h.reservation_token !== reservation_token);
  const activeTeamsCount = stored.filter(t => t.round1_status !== 'rejected').length;
  if (activeTeamsCount + existingHolds.length >= 60) {
    throw new Error("Maximum arena capacity (60 teams / 180 participants) is currently full or reserved in active checkouts.");
  }

  const newToken = reservation_token || `HOLD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  const computedTier = computeAcademicTier(members);

  saveMockCheckoutHolds([
    {
      reservation_token: newToken,
      idempotency_key: idempotency_key || null,
      expires_at: expiresAt,
      emails: Array.from(seenEmails),
      phones: Array.from(seenPhones)
    },
    ...existingHolds
  ]);

  const liveState = await getLiveEventState();
  return {
    success: true,
    reservation_token: newToken,
    payment_deadline: expiresAt,
    expires_at: expiresAt,
    academic_tier: computedTier,
    fee_per_member: liveState?.round2_fee_per_member || 500,
    total_fee: 3 * (liveState?.round2_fee_per_member || 500),
    payment_open: true,
    claimed_teams: activeTeamsCount + existingHolds.length + 1,
    max_teams: 60
  };
}

/**
 * Step 3: Atomically Complete Registration WITH Mandatory Payment Evidence (UTR + Screenshot).
 * Idempotent by `idempotency_key` so retries never duplicate teams or lose payment evidence.
 */
export async function completeUnifiedRegistration({
  draft,
  utr_number,
  reservation_token = null,
  idempotency_key = null,
  consent_accepted = false,
  screenshotFile = null,
  payment_screenshot_url = ''
}) {
  assertWritableEnvironment('Unified paid team registration');

  if (consent_accepted !== true) {
    throw new Error("Mandatory policy consent is required before completing registration.");
  }
  const cleanUtr = String(utr_number || '').trim();
  if (!/^[0-9]{12}$/.test(cleanUtr)) {
    throw new Error("Enter an exact 12-digit numeric UPI Transaction Reference (UTR).");
  }
  if (!screenshotFile && !payment_screenshot_url) {
    throw new Error("Please upload your UPI payment confirmation screenshot.");
  }

  const parsedSize = parseInt(draft?.team_size, 10);
  if (parsedSize !== 3 || !Array.isArray(draft?.members) || draft.members.length !== 3) {
    throw new Error("Strictly 3 members (1 Team Leader and 2 Team Members) are required.");
  }

  let screenshotBase64 = payment_screenshot_url || '';
  if (screenshotFile instanceof File || screenshotFile instanceof Blob) {
    screenshotBase64 = await fileOrBlobToDataUrl(screenshotFile);
  }

  if (!IS_MOCK_ENV) {
    const res = await fetch('/api/round2/upload-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'unified_complete',
        draft,
        utr_number: cleanUtr,
        reservation_token,
        idempotency_key,
        consent_accepted: true,
        screenshot_base64: screenshotBase64
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.success === false || !data?.team_id) {
      throw new Error(data?.error || "Unable to complete registration. Your draft is preserved - please retry.");
    }
    return data;
  }

  // Mock Unified Completion
  await new Promise(r => setTimeout(r, 400));
  const stored = getStoredTeams();

  if (idempotency_key) {
    const replay = stored.find(t => t.idempotency_key === idempotency_key);
    if (replay) {
      return {
        success: true,
        idempotent_replay: true,
        team_id: replay.team_id,
        team_name: replay.team_name,
        track_id: replay.track_id,
        problem_code: replay.problem_code,
        academic_tier: replay.academic_tier,
        payment_token: replay.secret_passcode,
        utr_number: replay.utr_number,
        payment_status: 'PENDING_VERIFICATION',
        message: "Registration submitted successfully!\nYour payment evidence has been received and is awaiting verification by the organizing committee. You will receive an official confirmation email once your payment is verified."
      };
    }
  }

  const dupUtr = stored.find(t => t.round1_status !== 'rejected' && t.utr_number === cleanUtr);
  if (dupUtr) {
    throw new Error(`Duplicate transaction reference: UTR ${cleanUtr} is already linked to Team ${dupUtr.team_id}.`);
  }

  for (const m of draft.members) {
    const email = normalizeEmail(m.email);
    const phone = normalizePhone(m.phone);
    for (const team of stored) {
      if (team.round1_status === 'rejected') continue;
      if (Array.isArray(team.members) && team.members.some(ex => normalizeEmail(ex.email) === email || normalizePhone(ex.phone) === phone)) {
        throw new Error(`Member "${m.full_name || m.name || 'Participant'}" (${email}) is already registered with Team ${team.team_id}.`);
      }
    }
  }

  const otherHolds = getMockCheckoutHolds().filter(h => h.reservation_token !== reservation_token);
  const activeCount = stored.filter(t => t.round1_status !== 'rejected').length;
  if (activeCount + otherHolds.length >= 60) {
    throw new Error(`All 60 team seats have been claimed. Your UTR (${cleanUtr}) cannot be auto-assigned a seat - contact vlsireseachlab@siet.ac.in for refund/reconciliation.`);
  }

  const computedTier = computeAcademicTier(draft.members);
  const maxExistingNum = stored.reduce((max, t) => {
    const match = String(t.team_id || '').match(/(\d+)$/);
    return match ? Math.max(max, parseInt(match[1], 10)) : max;
  }, 0);
  const newTeamId = `VTX2-${String(maxExistingNum + 1).padStart(3, '0')}`;
  const newPasscode = Math.random().toString(36).substring(2, 8).toUpperCase();

  const newTeam = {
    team_id: newTeamId,
    team_name: draft.team_name.trim(),
    track_id: draft.track_id,
    problem_code: draft.problem_code,
    academic_tier: computedTier,
    team_size: 3,
    round1_status: 'pending',
    is_shortlisted: true,
    shortlisted_at: new Date().toISOString(),
    payment_deadline: null,
    secret_passcode: newPasscode,
    ppt_pdf_drive_url: null,
    utr_number: cleanUtr,
    payment_screenshot_url: screenshotBase64 || '/images/trophy-transparent.webp',
    is_paid_verified: false,
    idempotency_key: idempotency_key || null,
    created_at: new Date().toISOString(),
    members: draft.members.map((m, idx) => ({
      role: m.role || (idx === 0 ? 'leader' : `member_${idx + 1}`),
      full_name: m.full_name || m.name || 'Participant',
      email: normalizeEmail(m.email),
      phone: normalizePhone(m.phone),
      gender: m.gender || 'Not specified',
      college_name: m.college_name || 'SIET',
      degree: m.degree || '',
      department: m.department || 'EE - VDT',
      year_of_study: m.year_of_study || '1st Year',
      level: m.level || 'UG',
      roll_no: m.roll_no || '',
      organisation: m.organisation || '',
      designation: m.designation || ''
    }))
  };

  saveStoredTeams([newTeam, ...stored]);
  saveMockCheckoutHolds(otherHolds);

  return {
    success: true,
    idempotent_replay: false,
    team_id: newTeamId,
    team_name: newTeam.team_name,
    track_id: newTeam.track_id,
    problem_code: newTeam.problem_code,
    academic_tier: computedTier,
    payment_token: newPasscode,
    utr_number: cleanUtr,
    payment_status: 'PENDING_VERIFICATION',
    message: "Registration submitted successfully!\nYour payment evidence has been received and is awaiting verification by the organizing committee. You will receive an official confirmation email once your payment is verified."
  };
}

export const registerFreeTeam = reserveCheckoutSlot;
export const registerTeam = reserveCheckoutSlot;

/**
 * Privacy-Preserving Team ID Recovery (Requires BOTH Email AND 10-digit Phone)
 */
export async function recoverTeamIdentity({ email, phone }) {
  const cleanEmail = normalizeEmail(email);
  const cleanPhone = normalizePhone(phone);
  if (!cleanEmail || cleanPhone.length < 10) {
    throw new Error("Please enter both your registered email and 10-digit WhatsApp phone number.");
  }

  if (!IS_MOCK_ENV) {
    const res = await fetch('/api/team/recover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'id', email: cleanEmail, phone: cleanPhone })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.success) {
      throw new Error(data?.error || "No active team found matching both that email and phone number.");
    }
    return data;
  }

  await new Promise(r => setTimeout(r, 200));
  const stored = getStoredTeams();
  const match = stored.find(t =>
    t.round1_status !== 'rejected' &&
    Array.isArray(t.members) &&
    t.members.some(m => normalizeEmail(m.email) === cleanEmail && normalizePhone(m.phone) === cleanPhone)
  );
  if (!match) throw new Error("No active team found matching both that email and phone number.");
  return {
    success: true,
    team_id: match.team_id,
    team_name: match.team_name,
    track_id: match.track_id,
    problem_code: match.problem_code,
    team_size: match.team_size || 3,
    fee_per_member: 500,
    total_fee: (match.team_size || 3) * 500,
    payment_token: match.secret_passcode,
    payment_deadline: match.payment_deadline || null,
    is_paid_verified: !!match.is_paid_verified,
    utr_number: match.utr_number || null,
    round1_status: match.round1_status || 'pending',
    has_submitted: !!match.ppt_pdf_drive_url,
    current_version: match.ppt_current_version || (match.ppt_pdf_drive_url ? 1 : 0),
    receipt_id: match.ppt_receipt_id || null
  };
}

/**
 * Privacy-Preserving Passcode Reset (Dispatched strictly to Leader Email)
 */
export async function recoverTeamPasscode({ team_id, email, phone }) {
  assertWritableEnvironment('Passcode reset');
  const cleanId = (team_id || '').trim().toUpperCase();
  const cleanEmail = normalizeEmail(email);
  const cleanPhone = normalizePhone(phone);
  if (!cleanId || !cleanEmail || cleanPhone.length < 10) {
    throw new Error("Team ID, Leader Email, and 10-digit Leader Phone are all required.");
  }

  if (!IS_MOCK_ENV) {
    const res = await fetch('/api/team/recover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'passcode', team_id: cleanId, email: cleanEmail, phone: cleanPhone })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.success) {
      throw new Error(data?.error || "Unable to verify Team Leader details for passcode reset.");
    }
    return data;
  }

  await new Promise(r => setTimeout(r, 200));
  return {
    success: true,
    message: "In live mode, a new Team Passcode is emailed strictly to the verified Team Leader."
  };
}

/**
 * Verify existing PPT submission receipt & window status
 */
export async function verifyTeamSubmissionStatus({ team_id, passcode }) {
  const cleanId = (team_id || '').trim().toUpperCase();
  const cleanPass = (passcode || '').trim().toUpperCase();
  if (!cleanId || !cleanPass) {
    throw new Error("Team ID and Team Passcode are required.");
  }

  if (!IS_MOCK_ENV) {
    const res = await fetch('/api/ppt/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team_id: cleanId, passcode: cleanPass })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.success) {
      throw new Error(data?.error || "Incorrect Team ID or team passcode.");
    }
    return data;
  }

  await new Promise(r => setTimeout(r, 200));
  const stored = getStoredTeams();
  const team = stored.find(t => t.team_id.toUpperCase() === cleanId && (t.secret_passcode || '').toUpperCase() === cleanPass);
  if (!team) throw new Error("Incorrect Team ID or team passcode.");
  return {
    success: true,
    team_id: team.team_id,
    team_name: team.team_name,
    track_id: team.track_id,
    problem_code: team.problem_code,
    has_confirmed_submission: Boolean(team.ppt_pdf_drive_url),
    receipt: team.ppt_pdf_drive_url ? {
      receipt_id: team.ppt_receipt_id || `${team.team_id}-V1-MOCK`,
      team_id: team.team_id,
      team_name: team.team_name,
      version: team.ppt_current_version || 1,
      file_name: team.ppt_file_name || 'blueprint.pdf',
      page_count: team.ppt_page_count || 6,
      submitted_at: team.ppt_submitted_at || new Date().toISOString(),
      status: 'CONFIRMED'
    } : null,
    window: { ppt_open: true }
  };
}

/**
 * Secure Two-Phase Idempotent PPT Upload with Bounded Exponential Backoff & Jitter
 * Never returns fake confirmation if Drive upload or DB persistence fails.
 */
export async function submitRound1PptWithRetries({
  team_id,
  passcode,
  file,
  pdfMeta,
  idempotencyKey,
  onProgress
}) {
  assertWritableEnvironment('PPT submission');
  const cleanId = (team_id || '').trim().toUpperCase();
  const cleanPass = (passcode || '').trim().toUpperCase();

  if (IS_MOCK_ENV) {
    onProgress?.('Verifying credentials (mock)...');
    await new Promise(r => setTimeout(r, 350));
    const stored = getStoredTeams();
    const team = stored.find(t => t.team_id.toUpperCase() === cleanId);
    if (!team) throw new Error("Incorrect Team ID or team passcode.");
    const nextVer = (team.ppt_current_version || 0) + 1;
    const receiptId = `${cleanId}-V${nextVer}-MOCK`;
    team.ppt_pdf_drive_url = `mock://drive/${cleanId}/v${nextVer}`;
    team.ppt_current_version = nextVer;
    team.ppt_receipt_id = receiptId;
    team.ppt_file_name = file.name;
    team.ppt_page_count = pdfMeta.pageCount;
    team.ppt_submitted_at = new Date().toISOString();
    team.extracted_slide_text = pdfMeta.extractedText;
    saveStoredTeams([...stored]);
    return {
      success: true,
      receipt: {
        receipt_id: receiptId,
        team_id: cleanId,
        team_name: team.team_name,
        version: nextVer,
        file_name: file.name,
        file_size_bytes: file.size,
        page_count: pdfMeta.pageCount,
        submitted_at: team.ppt_submitted_at,
        status: 'CONFIRMED'
      }
    };
  }

  const key = idempotencyKey || `${cleanId}_${pdfMeta.sha256}_${Date.now()}`;
  const maxAttempts = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      onProgress?.(attempt === 1 ? 'Verifying credentials & submission window...' : `Retrying upload (attempt ${attempt} of ${maxAttempts})...`);

      const initRes = await fetch('/api/ppt/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_id: cleanId,
          passcode: cleanPass,
          file_name: file.name,
          file_size: file.size,
          file_sha256: pdfMeta.sha256,
          page_count: pdfMeta.pageCount,
          extracted_text: pdfMeta.extractedText,
          idempotency_key: key
        })
      });

      const initData = await initRes.json().catch(() => ({}));
      if (!initRes.ok || initData?.success === false) {
        const err = new Error(initData?.error || 'Could not initiate submission.');
        err.status = initRes.status;
        err.retryable = initRes.status === 429 || initRes.status >= 500;
        throw err;
      }

      if (initData.already_confirmed && initData.receipt) {
        return { success: true, receipt: initData.receipt };
      }

      onProgress?.('Uploading PDF securely to Google Drive & confirming database record...');

      const uploadRes = await fetch('/api/ppt/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/pdf',
          'x-attempt-id': initData.attempt_id,
          'x-attempt-token': initData.attempt_token,
          'x-team-id': cleanId
        },
        body: file
      });

      const uploadData = await uploadRes.json().catch(() => ({}));
      if (!uploadRes.ok || uploadData?.success === false) {
        const err = new Error(uploadData?.error || 'Upload interrupted. Your previous submission remains safe.');
        err.status = uploadRes.status;
        err.retryable = uploadRes.status === 429 || uploadRes.status >= 500;
        throw err;
      }

      return uploadData;
    } catch (err) {
      lastError = err;
      const isNetworkErr = err?.name === 'TypeError' || err?.retryable;
      if (!isNetworkErr || attempt >= maxAttempts) {
        throw err;
      }
      const baseMs = 500 * Math.pow(2, attempt - 1);
      const jitterMs = Math.floor(Math.random() * 600);
      onProgress?.(`Upload service busy or interrupted. Retrying automatically in ${Math.ceil((baseMs + jitterMs) / 1000)}s...`);
      await new Promise(r => setTimeout(r, baseMs + jitterMs));
    }
  }

  throw lastError || new Error('Upload interrupted. Your previous submission remains safe.');
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
    t.round1_status !== 'rejected'
  );

  if (!team) {
    return {
      valid: false,
      is_expired: false,
      error: "ACCESS DENIED: Invalid Team ID / resume token, or team registration is cancelled."
    };
  }

  const activeTeamsCount = stored.filter(t => t.round1_status !== 'rejected').length;
  // 5-Minute Reservation Check when capacity >= 60 and payment has not yet been uploaded
  if (
    team.payment_deadline &&
    new Date() > new Date(team.payment_deadline) &&
    !team.is_paid_verified &&
    !team.utr_number &&
    activeTeamsCount >= 60
  ) {
    return {
      valid: false,
      is_expired: true,
      error: `SEAT RESERVATION EXPIRED: The 5-minute reservation for Team ${team.team_id} lapsed and maximum 60-team capacity is currently filled. Contact vlsireseachlab@siet.ac.in if you already paid.`
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
  assertWritableEnvironment('Round 2 payment confirmation');
  const { team_id, passcode, secret_passcode, utr_number, screenshotFile, screenshot_url, payment_screenshot_url } = payload;
  const pCode = (passcode || secret_passcode || '').trim().toUpperCase();
  const sUrl = (screenshot_url || payment_screenshot_url || '').trim();

  if (!IS_MOCK_ENV) {
    // Preferred path: upload raw binary image directly to Google Drive via /api/round2/upload-receipt
    if (screenshotFile instanceof File || screenshotFile instanceof Blob) {
      const res = await fetch('/api/round2/upload-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': screenshotFile.type || 'image/png',
          'x-team-id': (team_id || '').trim().toUpperCase(),
          'x-passcode': pCode,
          'x-utr-number': String(utr_number || '').trim()
        },
        body: screenshotFile
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.success === false) {
        throw new Error(data?.error || 'Failed to upload payment receipt.');
      }
      return data;
    }

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
  const cleanUtr = String(utr_number || '').trim();
  const duplicateTeam = stored.find(
    t => t.team_id !== team.team_id && t.round1_status !== 'rejected' && t.utr_number === cleanUtr
  );
  if (duplicateTeam) {
    throw new Error(`DUPLICATE UTR: Transaction reference ${cleanUtr} is already linked to another active team (${duplicateTeam.team_id}).`);
  }

  team.utr_number = cleanUtr;
  team.payment_screenshot_url = sUrl || (screenshotFile ? '/images/trophy-transparent.webp' : null);
  team.is_paid_verified = false;
  saveStoredTeams([...stored]);

  return {
    success: true,
    team_id: team.team_id,
    utr_number: cleanUtr,
    message: "Payment evidence submitted successfully. Your participation will be confirmed after verification by the organizing team."
  };
}

/**
 * Public Capacity Helper (Maintains compatibility with Navbar)
 */
export async function getPublicCapacity() {
  if (!IS_MOCK_ENV) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_public_capacity`, {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: '{}'
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('[Capacity] Offline fallback or fetch error:', err);
    }
  }

  const stored = getStoredTeams();
  const holds = getMockCheckoutHolds();
  const activeCount = stored.filter(t => t.round1_status !== 'rejected').length + holds.length;
  return {
    claimed_teams: activeCount,
    max_teams: 60,
    is_full: activeCount >= 60
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

  if (!IS_MOCK_ENV && isSupabaseConfigured && supabase) {
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
 * Resolves a valid, auto-refreshed Supabase coordinator access token when live Supabase Auth is active.
 */
export async function getFreshCoordinatorToken(fallbackToken = '') {
  const cleanFallback = (fallbackToken || '').trim();
  if (!IS_MOCK_ENV && isSupabaseConfigured && supabase) {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      let session = sessionData?.session || null;
      const nowSec = Math.floor(Date.now() / 1000);
      if (session && session.expires_at && session.expires_at <= nowSec + 60) {
        const { data: refreshed, error: refreshErr } = await supabase.auth.refreshSession();
        if (!refreshErr && refreshed?.session?.access_token) {
          session = refreshed.session;
        }
      }
      if (session?.access_token) {
        try {
          if (typeof sessionStorage !== 'undefined') {
            const raw = sessionStorage.getItem('veltraxx_admin_auth_v2');
            if (raw) {
              const parsed = JSON.parse(raw);
              if (parsed.token !== session.access_token) {
                sessionStorage.setItem('veltraxx_admin_auth_v2', JSON.stringify({
                  ...parsed,
                  email: session.user?.email || parsed.email,
                  token: session.access_token
                }));
              }
            }
          }
        } catch {}
        return session.access_token;
      }
    } catch {}
  }

  if (!cleanFallback) {
    throw new Error("UNAUTHORIZED: Coordinator authorization token is required.");
  }
  return cleanFallback;
}

/**
 * Coordinator Roster (Fetch all teams with deadlines and secret passcodes)
 */
export async function getTrackerRoster(authToken) {
  const token = await getFreshCoordinatorToken(authToken);

  if (!IS_MOCK_ENV && isSupabaseConfigured && supabase) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_coordinator_roster`, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: '{}'
    });
    if (res.status === 401 || res.status === 403) {
      throw new Error("UNAUTHORIZED: Session expired or invalid authorization.");
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to load live roster (HTTP ${res.status}).`);
    }
    const rows = await res.json();
    return Array.isArray(rows) ? rows : [];
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
  assertWritableEnvironment('Coordinator status update');
  const token = await getFreshCoordinatorToken(authToken);
  const normalizedStatus = status === 'waitlist' ? 'waitlisted' : status;

  if (!IS_MOCK_ENV && isSupabaseConfigured && supabase) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/admin_update_team_status`, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        p_team_id: teamId,
        p_status: normalizedStatus,
        p_is_shortlisted: isShortlisted
      })
    });

    if (res.status === 401 || res.status === 403) {
      throw new Error("UNAUTHORIZED: Session expired or unauthorized coordinator.");
    }
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

  team.round1_status = normalizedStatus;
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
 * Admin Team Deletion (Permanently removes team Drive artifacts, DB record, and cascading member records)
 */
export async function adminDeleteTeam(authToken, teamId, { confirmed = false } = {}) {
  assertWritableEnvironment('Permanent team deletion');
  if (confirmed !== true) {
    throw new Error("CONFIRMATION_REQUIRED: Explicit permanent deletion confirmation is required.");
  }

  const token = await getFreshCoordinatorToken(authToken);
  if (!token) {
    throw new Error("UNAUTHORIZED: Coordinator session required to delete a team.");
  }

  let handledByServerApi = false;
  let remainingTeamsCount = null;
  let deletedDriveCount = 0;

  if (!IS_MOCK_ENV && isSupabaseConfigured && supabase) {
    // 1. Preferred hardened server endpoint: verifies coordinator allowlist, deletes Drive artifacts, cascades DB
    const apiRes = await fetch('/api/admin/action', {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ op: 'delete_team', team_id: teamId, confirm: true })
    }).catch(() => null);

    const contentType = apiRes?.headers?.get('content-type') || '';
    if (apiRes && contentType.includes('application/json') && apiRes.status !== 404) {
      const apiData = await apiRes.json().catch(() => ({}));
      if (apiRes.status === 401 || apiRes.status === 403) {
        throw new Error(apiData?.error || "UNAUTHORIZED: Session expired or unauthorized coordinator.");
      }
      if (!apiRes.ok || apiData?.success === false) {
        throw new Error(apiData?.error || "Failed deleting team and Drive artifacts.");
      }
      handledByServerApi = true;
      remainingTeamsCount = apiData.remaining_teams_count ?? null;
      deletedDriveCount = apiData.deleted_drive_count || 0;
    }

    // 2. Fallback strictly when running local Vite dev server without /api/* routes
    if (!handledByServerApi) {
      const rpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/admin_delete_team`, {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ p_team_id: teamId })
      });

      if (rpcRes.status === 401 || rpcRes.status === 403) {
        throw new Error("UNAUTHORIZED: Session expired or unauthorized coordinator.");
      }
      const rpcData = await rpcRes.json().catch(() => ({}));
      if (!rpcRes.ok || rpcData?.success === false) {
        throw new Error(rpcData?.error || rpcData?.message || "Failed to delete team from database.");
      }
    }
  }

  // Also purge from local storage cache
  try {
    const stored = getStoredTeams();
    const updated = stored.filter(t => t.team_id.toUpperCase() !== teamId.toUpperCase());
    saveStoredTeams(updated);
  } catch (err) {
    console.warn("Local storage delete warning:", err);
  }

  return {
    success: true,
    team_id: teamId,
    deleted_drive_count: deletedDriveCount,
    remaining_teams_count: remainingTeamsCount
  };
}

/**
 * Revoke Expired Seats & Promote Waitlist
 */
export async function revokeExpiredSeatAndPromote(authToken) {
  assertWritableEnvironment('Waitlist seat revocation');
  const token = await getFreshCoordinatorToken(authToken);

  if (!IS_MOCK_ENV && isSupabaseConfigured && supabase) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/revoke_expired_seats_and_promote_waitlist`, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: '{}'
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
 * Server-Backed Coordinator Overview (event_state, sync_jobs, ppt_submission_attempts, admin_audit_logs)
 */
export async function getAdminOverview(authToken) {
  const token = await getFreshCoordinatorToken(authToken);

  if (!IS_MOCK_ENV) {
    const res = await fetch('/api/admin/action?op=overview', {
      cache: 'no-store',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.success === false) {
      throw new Error(data?.error || 'Failed to load admin overview.');
    }
    return data;
  }

  return {
    success: true,
    event_state: await getLiveEventState(),
    window_status: { registration_open: true, ppt_open: true },
    sync_jobs: [],
    recent_attempts: [],
    audit_logs: []
  };
}

export async function adminUpdateEventState(authToken, patch) {
  assertWritableEnvironment('Event state update');
  const token = await getFreshCoordinatorToken(authToken);

  if (!IS_MOCK_ENV) {
    const res = await fetch('/api/admin/action', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ op: 'update_event_state', ...patch })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.success === false) {
      throw new Error(data?.error || 'Failed updating event state in database.');
    }
    return data;
  }

  return { success: true, event_state: patch };
}

export async function adminVerifyRound2Payment(authToken, teamId, isVerified) {
  assertWritableEnvironment('Payment verification');
  const token = await getFreshCoordinatorToken(authToken);

  if (!IS_MOCK_ENV) {
    const res = await fetch('/api/admin/action', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ op: 'verify_payment', team_id: teamId, is_verified: isVerified })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.success === false) {
      throw new Error(data?.error || 'Failed verifying payment.');
    }
    return data;
  }

  const stored = getStoredTeams();
  const team = stored.find(t => t.team_id.toUpperCase() === String(teamId || '').toUpperCase());
  if (!team) throw new Error("Team not found.");
  team.is_paid_verified = !!isVerified;
  if (isVerified) {
    team.is_shortlisted = true;
    team.round1_status = 'shortlisted';
  } else if (team.round1_status === 'shortlisted') {
    team.round1_status = 'pending';
  }
  saveStoredTeams([...stored]);
  return { success: true, team_id: team.team_id, is_paid_verified: !!isVerified, round1_status: team.round1_status };
}

export async function adminGrantPaymentAccess(authToken, teamId, hours = 24) {
  assertWritableEnvironment('Grant payment access');
  const token = await getFreshCoordinatorToken(authToken);

  if (!IS_MOCK_ENV) {
    const res = await fetch('/api/admin/action', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ op: 'grant_payment_access', team_id: teamId, hours })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.success === false) {
      throw new Error(data?.error || 'Failed granting payment access.');
    }
    return data;
  }

  const stored = getStoredTeams();
  const team = stored.find(t => t.team_id.toUpperCase() === String(teamId || '').toUpperCase());
  if (!team) throw new Error("Team not found.");
  const newDeadline = new Date(Date.now() + hours * 3600 * 1000).toISOString();
  team.is_shortlisted = true;
  team.payment_deadline = newDeadline;
  if (team.round1_status === 'rejected') {
    team.round1_status = 'pending';
  }
  saveStoredTeams([...stored]);
  return { success: true, team_id: team.team_id, payment_deadline: newDeadline };
}

export async function adminRetrySyncJob(authToken, { sync_job_id, team_id, job_type }) {
  assertWritableEnvironment('Sync job retry');
  const token = await getFreshCoordinatorToken(authToken);

  const res = await fetch('/api/admin/action', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ op: 'retry_sync', sync_job_id, team_id, job_type })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success === false) {
    throw new Error(data?.error || 'Retry sync failed.');
  }
  return data;
}

export async function fetchProtectedDriveFileBlobUrl(authToken, teamId, fileId) {
  const token = await getFreshCoordinatorToken(authToken);
  if (!token || !teamId || !fileId) throw new Error("Missing credentials or file identifier.");
  const res = await fetch(
    `/api/admin/action?op=file&teamId=${encodeURIComponent(teamId)}&fileId=${encodeURIComponent(fileId)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `Unable to stream private file (HTTP ${res.status}).`);
  }
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

/**
 * Automated Email Dispatch for Shortlisted Teams via Authenticated Server Proxy (/api/admin/action)
 */
export async function sendShortlistNotificationEmail({ authToken, team, customNote = '' }) {
  assertWritableEnvironment('Shortlist email dispatch');
  const memberEmails = (team.members || [])
    .map(m => m.email)
    .filter(Boolean)
    .map(e => e.trim().toLowerCase());

  if (memberEmails.length === 0) {
    throw new Error(`Team ${team.team_id} has no valid member emails registered.`);
  }

  if (!IS_MOCK_ENV && authToken) {
    const token = await getFreshCoordinatorToken(authToken);
    const res = await fetch('/api/admin/action', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ op: 'send_shortlist_email', team, customNote })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.success === false) {
      throw new Error(data?.error || 'Failed sending shortlist invitation email.');
    }
    return data;
  }

  return {
    success: true,
    teamId: team.team_id,
    recipients: memberEmails,
    secretPasscode: team.secret_passcode
  };
}

/**
 * Vertically Merged Management Excel Roster & Google Sheets Format (.xlsx)
 * Overhauled to match Official Management Team Block Format for Chairman, Principal & HOD.
 * 
 * Tab 1: "Management_Team_Roster"
 * - Grouped visually by vertically merging Team-Level columns across team.members.length rows.
 * - Member-Level columns remain individual unmerged rows.
 * 
 * Tab 2: "Filterable_All_Contacts"
 * - Same 13 columns with team data repeated on every row (unmerged) for autofilter / sorting.
 */
export function exportRegistrationsToXLSX(teams) {
  if (!Array.isArray(teams) || teams.length === 0) {
    throw new Error("No teams data available to export.");
  }

  const colHeaders = [
    'S.No',
    'Team ID',
    'Team Name',
    'Problem Statement',
    'Role',
    'Student Name',
    'Phone Number',
    'Email ID',
    'College',
    'Dept',
    'Year',
    'Payment Status',
    'Participation Status'
  ];

  const colWidths = [
    { wch: 6 },  // S.No
    { wch: 12 }, // Team ID
    { wch: 22 }, // Team Name
    { wch: 18 }, // Problem Statement
    { wch: 10 }, // Role
    { wch: 24 }, // Student Name
    { wch: 15 }, // Phone Number
    { wch: 28 }, // Email ID
    { wch: 32 }, // College
    { wch: 14 }, // Dept
    { wch: 12 }, // Year
    { wch: 22 }, // Payment Status
    { wch: 20 }  // Participation Status
  ];

  const formatYear = (rawYear) => {
    if (!rawYear) return '1st Year';
    const y = String(rawYear).trim();
    if (y.toLowerCase().includes('1')) return '1st Year';
    if (y.toLowerCase().includes('2')) return '2nd Year';
    if (y.toLowerCase().includes('3')) return '3rd Year';
    if (y.toLowerCase().includes('4')) return '4th Year';
    return y;
  };

  const cleanPhone = (raw) => {
    if (!raw) return '';
    const digits = String(raw).replace(/[^0-9]/g, '');
    return digits.length >= 10 ? digits.slice(-10) : digits;
  };

  // Sort teams in chronological ascending order (1st registered team = S.No 1)
  const sortedTeams = [...teams].sort((a, b) => {
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
    if (timeA && timeB && timeA !== timeB) {
      return timeA - timeB;
    }
    return String(a.team_id || '').localeCompare(String(b.team_id || ''), undefined, { numeric: true, sensitivity: 'base' });
  });

  // =========================================================================
  // TAB 1: Management_Team_Roster (VERTICALLY MERGED OFFICIAL FORMAT)
  // =========================================================================
  const aoaManagement = [colHeaders];
  const mergesManagement = [];
  let currentRow = 1; // Row 0 is headers

  sortedTeams.forEach((team, teamIdx) => {
    const sNo = teamIdx + 1;
    const teamId = team.team_id || '';
    const teamName = team.team_name || '';
    const problemStatement = team.problem_code 
      ? (team.track_id ? `${team.problem_code} (${team.track_id})` : team.problem_code)
      : (team.track_id || 'OPEN');
    const rawStatus = (team.round1_status || '').toLowerCase();
    
    const pptSubmitted = rawStatus === 'rejected' || rawStatus === 'cancelled'
      ? 'REJECTED'
      : team.is_paid_verified
        ? (team.utr_number ? `VERIFIED / PAID (UTR: ${team.utr_number})` : 'VERIFIED / PAID')
        : team.utr_number
          ? `PENDING VERIFICATION (UTR: ${team.utr_number})`
          : 'PENDING VERIFICATION';
    
    let r1Status = 'PENDING VERIFICATION';
    if (rawStatus === 'rejected' || rawStatus === 'cancelled') {
      r1Status = 'REJECTED';
    } else if (team.is_paid_verified) {
      r1Status = 'CONFIRMED';
    }

    const members = (Array.isArray(team.members) && team.members.length > 0)
      ? team.members
      : [{ full_name: 'Not Provided', email: '', phone: '', college_name: '', department: '', year_of_study: '' }];

    const memberCount = members.length;
    const startRow = currentRow;

    members.forEach((m, idx) => {
      const isLeader = idx === 0;
      const role = isLeader ? 'Leader' : `M${idx}`;
      const studentName = m.full_name || m.name || '';
      const phone = cleanPhone(m.phone);
      const email = (m.email || '').trim().toLowerCase();
      const college = m.college_name || m.college || '';
      const dept = m.degree ? `${m.degree} - ${m.department || m.dept || ''}` : (m.department || m.dept || '');
      const year = formatYear(m.year_of_study || m.year);

      // On first row of team, populate team fields; on subsequent member rows, leave empty strings
      if (isLeader) {
        aoaManagement.push([
          sNo,
          teamId,
          teamName,
          problemStatement,
          role,
          studentName,
          phone,
          email,
          college,
          dept,
          year,
          pptSubmitted,
          r1Status
        ]);
      } else {
        aoaManagement.push([
          '',
          '',
          '',
          '',
          role,
          studentName,
          phone,
          email,
          college,
          dept,
          year,
          '',
          ''
        ]);
      }
      currentRow++;
    });

    // Vertical merges for Team-Level columns across member rows
    if (memberCount > 1) {
      // Columns: 0 (S.No), 1 (Team ID), 2 (Team Name), 3 (Problem Statement), 11 (PPT Submitted), 12 (Round 1 Status)
      const teamColsToMerge = [0, 1, 2, 3, 11, 12];
      teamColsToMerge.forEach(colIndex => {
        mergesManagement.push({
          s: { r: startRow, c: colIndex },
          e: { r: startRow + memberCount - 1, c: colIndex }
        });
      });
    }
  });

  const wsManagement = XLSX.utils.aoa_to_sheet(aoaManagement);
  wsManagement['!merges'] = mergesManagement;
  wsManagement['!cols'] = colWidths;

  // Force string format (@) on Phone Number (col 6) and Team ID (col 1)
  const rangeManagement = XLSX.utils.decode_range(wsManagement['!ref'] || 'A1:A1');
  for (let R = rangeManagement.s.r + 1; R <= rangeManagement.e.r; ++R) {
    [1, 6].forEach(c => {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: c });
      const cell = wsManagement[cellAddress];
      if (cell && cell.v !== undefined && cell.v !== null && cell.v !== '') {
        cell.t = 's';
        cell.z = '@';
        cell.v = String(cell.v);
      }
    });
  }

  // =========================================================================
  // TAB 2: Filterable_All_Contacts (UNMERGED COMPANION SHEET FOR COORDINATORS)
  // =========================================================================
  const aoaFilterable = [colHeaders];

  sortedTeams.forEach((team, teamIdx) => {
    const sNo = teamIdx + 1;
    const teamId = team.team_id || '';
    const teamName = team.team_name || '';
    const problemStatement = team.problem_code 
      ? (team.track_id ? `${team.problem_code} (${team.track_id})` : team.problem_code)
      : (team.track_id || 'OPEN');
    const rawStatus = (team.round1_status || '').toLowerCase();
    
    const pptSubmitted = rawStatus === 'rejected' || rawStatus === 'cancelled'
      ? 'REJECTED'
      : team.is_paid_verified
        ? (team.utr_number ? `VERIFIED / PAID (UTR: ${team.utr_number})` : 'VERIFIED / PAID')
        : team.utr_number
          ? `PENDING VERIFICATION (UTR: ${team.utr_number})`
          : 'PENDING VERIFICATION';
    
    let r1Status = 'PENDING VERIFICATION';
    if (rawStatus === 'rejected' || rawStatus === 'cancelled') {
      r1Status = 'REJECTED';
    } else if (team.is_paid_verified) {
      r1Status = 'CONFIRMED';
    }

    const members = (Array.isArray(team.members) && team.members.length > 0)
      ? team.members
      : [{ full_name: 'Not Provided', email: '', phone: '', college_name: '', department: '', year_of_study: '' }];

    members.forEach((m, idx) => {
      const isLeader = idx === 0;
      const role = isLeader ? 'Leader' : `M${idx}`;
      const studentName = m.full_name || m.name || '';
      const phone = cleanPhone(m.phone);
      const email = (m.email || '').trim().toLowerCase();
      const college = m.college_name || m.college || '';
      const dept = m.degree ? `${m.degree} - ${m.department || m.dept || ''}` : (m.department || m.dept || '');
      const year = formatYear(m.year_of_study || m.year);

      // Repeat team-level data on every single row (no merges)
      aoaFilterable.push([
        sNo,
        teamId,
        teamName,
        problemStatement,
        role,
        studentName,
        phone,
        email,
        college,
        dept,
        year,
        pptSubmitted,
        r1Status
      ]);
    });
  });

  const wsFilterable = XLSX.utils.aoa_to_sheet(aoaFilterable);
  wsFilterable['!cols'] = colWidths;

  const rangeFilterable = XLSX.utils.decode_range(wsFilterable['!ref'] || 'A1:A1');
  for (let R = rangeFilterable.s.r + 1; R <= rangeFilterable.e.r; ++R) {
    [1, 6].forEach(c => {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: c });
      const cell = wsFilterable[cellAddress];
      if (cell && cell.v !== undefined && cell.v !== null && cell.v !== '') {
        cell.t = 's';
        cell.z = '@';
        cell.v = String(cell.v);
      }
    });
  }

  // Create Workbook with Both Worksheets
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, wsManagement, 'Management_Team_Roster');
  XLSX.utils.book_append_sheet(workbook, wsFilterable, 'Filterable_All_Contacts');

  XLSX.writeFile(workbook, `VELTRAXX_2.0_Management_Roster_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
