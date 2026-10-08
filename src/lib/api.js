// ==============================================================================
// VELTRAXX 2.0 - CLIENT SERVICE & RPC CONTRACT HANDLERS
// Connects to Supabase database functions with atomic-grade server verification.
// When VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are provided and VITE_USE_MOCK !== 'true',
// all operations run directly against the live Supabase database via REST/RPC.
// If offline or during local testing with mock enabled, falls back safely to development mock.
// ==============================================================================

const SUPABASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || '';
const SUPABASE_ANON_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || '';
const IS_MOCK_ENV = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_USE_MOCK === 'true') || !SUPABASE_URL || !SUPABASE_ANON_KEY;

const REGISTERED_TEAMS_KEY = 'veltraxx_registered_teams';

// Seed baseline teams for realistic coordinator tracker preview during offline development
const SEED_TRACKER_TEAMS = [
  {
    id: "vt-team-001",
    team_name: "Silicon Synapse",
    status: "verified",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    utr_number: "983271829102",
    receipt_url: "/images/wafer-chromatic.jpg",
    college_city: "Coimbatore",
    college_state: "Tamil Nadu",
    leader_name: "Arunachalam S",
    leader_phone: "+91 98421 54321",
    leader_email: "arun.vlsi@psgtech.ac.in",
    leader_college: "PSG College of Technology",
    participants: [
      { name: "Arunachalam S", email: "arun.vlsi@psgtech.ac.in", phone: "+91 98421 54321", is_leader: true, department: "ECE", degree: "B.E.", year_of_study: "4th", college_name: "PSG College of Technology" },
      { name: "Karthikeyan M", email: "karthik.m@psgtech.ac.in", phone: "+91 98421 54322", is_leader: false, department: "ECE", degree: "B.E.", year_of_study: "4th", college_name: "PSG College of Technology" },
      { name: "Deepika R", email: "deepika.r@psgtech.ac.in", phone: "+91 98421 54323", is_leader: false, department: "ECE", degree: "B.E.", year_of_study: "4th", college_name: "PSG College of Technology" },
      { name: "Suresh Kumar P", email: "suresh.p@psgtech.ac.in", phone: "+91 98421 54324", is_leader: false, department: "ECE", degree: "B.E.", year_of_study: "4th", college_name: "PSG College of Technology" }
    ]
  },
  {
    id: "vt-team-002",
    team_name: "Verilog Vanguards",
    status: "pending",
    created_at: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    utr_number: "654829104821",
    receipt_url: "/images/wafer-chromatic.jpg",
    college_city: "Coimbatore",
    college_state: "Tamil Nadu",
    leader_name: "Naveen Prakash T",
    leader_phone: "+91 97890 12345",
    leader_email: "naveen.p@siet.ac.in",
    leader_college: "Sri Shakthi Institute of Engineering and Technology (SIET)",
    participants: [
      { name: "Naveen Prakash T", email: "naveen.p@siet.ac.in", phone: "+91 97890 12345", is_leader: true, department: "ECE", degree: "B.Tech", year_of_study: "3rd", college_name: "Sri Shakthi Institute of Engineering and Technology (SIET)" },
      { name: "Harish Kumar B", email: "harish.b@siet.ac.in", phone: "+91 97890 12346", is_leader: false, department: "ECE", degree: "B.Tech", year_of_study: "3rd", college_name: "Sri Shakthi Institute of Engineering and Technology (SIET)" },
      { name: "Sneha Varshini S", email: "sneha.v@siet.ac.in", phone: "+91 97890 12347", is_leader: false, department: "ECE", degree: "B.Tech", year_of_study: "3rd", college_name: "Sri Shakthi Institute of Engineering and Technology (SIET)" },
      { name: "Vigneshwaran K", email: "vignesh.k@siet.ac.in", phone: "+91 97890 12348", is_leader: false, department: "ECE", degree: "B.Tech", year_of_study: "3rd", college_name: "Sri Shakthi Institute of Engineering and Technology (SIET)" }
    ]
  },
  {
    id: "vt-team-003",
    team_name: "RTL Matrix 28nm",
    status: "verified",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    utr_number: "110293847561",
    receipt_url: "/images/wafer-chromatic.jpg",
    college_city: "Coimbatore",
    college_state: "Tamil Nadu",
    leader_name: "Pooja Shankar",
    leader_phone: "+91 99432 98765",
    leader_email: "pooja.shankar@cit.edu.in",
    leader_college: "Coimbatore Institute of Technology (CIT)",
    participants: [
      { name: "Pooja Shankar", email: "pooja.shankar@cit.edu.in", phone: "+91 99432 98765", is_leader: true, department: "EEE", degree: "B.E.", year_of_study: "4th", college_name: "Coimbatore Institute of Technology (CIT)" },
      { name: "Aditya Mohan", email: "aditya.m@cit.edu.in", phone: "+91 99432 98766", is_leader: false, department: "EEE", degree: "B.E.", year_of_study: "4th", college_name: "Coimbatore Institute of Technology (CIT)" },
      { name: "Janani V", email: "janani.v@cit.edu.in", phone: "+91 99432 98767", is_leader: false, department: "EEE", degree: "B.E.", year_of_study: "4th", college_name: "Coimbatore Institute of Technology (CIT)" },
      { name: "Rohit K", email: "rohit.k@cit.edu.in", phone: "+91 99432 98768", is_leader: false, department: "EEE", degree: "B.E.", year_of_study: "4th", college_name: "Coimbatore Institute of Technology (CIT)" }
    ]
  }
];

function getStoredTeams() {
  try {
    if (typeof localStorage === 'undefined') return SEED_TRACKER_TEAMS;
    const raw = localStorage.getItem(REGISTERED_TEAMS_KEY);
    if (!raw) return SEED_TRACKER_TEAMS;
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
 * Public Capacity RPC: Returns count telemetry without exposing private PII
 */
export async function getPublicCapacity() {
  if (!IS_MOCK_ENV) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_public_capacity`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      if (response.ok) {
        return await response.json();
      }
      console.warn('[Supabase RPC] get_public_capacity returned HTTP error:', response.status);
    } catch (err) {
      console.warn('[Supabase RPC] get_public_capacity network fetch failed; falling back to local vitals:', err);
    }
  }

  // Development / Offline Fallback
  const teams = getStoredTeams();
  const nonRejected = teams.filter(t => t.status !== 'rejected');
  const claimedCount = Math.min(35, Math.max(27, 24 + nonRejected.length));
  const maxTeams = 35;

  return {
    claimed_teams: claimedCount,
    max_teams: maxTeams,
    spots_remaining: Math.max(0, maxTeams - claimedCount),
    is_full: claimedCount >= maxTeams
  };
}

/**
 * Transactional Team Registration RPC with pre-flight checks
 */
export async function registerTeam(payload) {
  const { team_name, utr_number, receipt_data_url, consent_event_terms, consent_future_events, interest_tags, hear_source, members } = payload;

  if (!consent_event_terms) {
    throw new Error("CONSENT_REQUIRED: Team Leader must confirm all 4 members agree to share details for VELTRAXX 2.0.");
  }

  const cleanTeamName = (team_name || '').trim();
  if (cleanTeamName.length < 3 || cleanTeamName.length > 60) {
    throw new Error("INVALID_TEAM_NAME: Team name must be between 3 and 60 characters.");
  }

  const cleanUtr = (utr_number || '').trim();
  if (!/^[0-9]{12}$/.test(cleanUtr)) {
    throw new Error("INVALID_UTR: Exactly 12-digit numeric UPI transaction reference (UTR) is required.");
  }

  if (!members || members.length !== 4) {
    throw new Error("INVALID_TEAM_SIZE: Exactly 4 team members required (1 Leader + 3 Teammates).");
  }

  const leaders = members.filter(m => m.is_leader);
  if (leaders.length !== 1) {
    throw new Error("INVALID_LEADER_COUNT: Exactly 1 team leader must be designated.");
  }

  // Check duplicate emails and phones internally
  const emailSet = new Set();
  const phoneSet = new Set();
  for (const m of members) {
    const e = (m.email || '').trim().toLowerCase();
    const p = (m.phone || '').trim().replace(/\s+/g, '');
    if (!e || !e.includes('@')) throw new Error(`INVALID_MEMBER_EMAIL: Valid email address is required for "${m.name}".`);
    if (!p || p.length < 10) throw new Error(`INVALID_MEMBER_PHONE: Valid 10-digit WhatsApp number is required for "${m.name}".`);

    if (emailSet.has(e)) throw new Error(`DUPLICATE_INTERNAL_EMAIL: Email "${e}" is entered more than once within the team.`);
    if (phoneSet.has(p)) throw new Error(`DUPLICATE_INTERNAL_PHONE: Phone "${p}" is entered more than once within the team.`);
    emailSet.add(e);
    phoneSet.add(p);
  }

  // If live Supabase is configured:
  if (!IS_MOCK_ENV) {
    let finalReceiptUrl = receipt_data_url || '';

    // If receipt is a base64 data URL, upload to private Supabase storage bucket 'receipts'
    if (receipt_data_url && receipt_data_url.startsWith('data:')) {
      try {
        const parts = receipt_data_url.split(';base64,');
        const contentType = parts[0].replace('data:', '') || 'image/jpeg';
        const byteCharacters = atob(parts[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: contentType });
        const ext = contentType.includes('png') ? 'png' : contentType.includes('pdf') ? 'pdf' : 'jpg';
        const filename = `${cleanUtr}-${Date.now()}.${ext}`;

        const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/receipts/${filename}`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': contentType
          },
          body: blob
        });

        if (uploadRes.ok) {
          finalReceiptUrl = `receipts/${filename}`;
        } else {
          console.warn('[Storage] Receipt upload returned non-200, continuing with reference URL');
        }
      } catch (uploadErr) {
        console.warn('[Storage] Receipt direct upload failed:', uploadErr);
      }
    }

    // Call register_team RPC
    const rpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/register_team`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        p_team_name: cleanTeamName,
        p_receipt_url: finalReceiptUrl,
        p_utr_number: cleanUtr,
        p_interest_tags: interest_tags || [],
        p_hear_source: hear_source || '',
        p_consent_event_terms: !!consent_event_terms,
        p_consent_future_events: !!consent_future_events,
        p_members: members
      })
    });

    if (!rpcRes.ok) {
      const errData = await rpcRes.json().catch(() => ({}));
      throw new Error(errData.message || errData.details || `Registration failed (HTTP ${rpcRes.status})`);
    }

    const rpcResult = await rpcRes.json();
    return rpcResult;
  }

  // Development Mock Implementation
  await new Promise(r => setTimeout(r, 600));
  const stored = getStoredTeams();

  // Check existing duplicate team name
  if (stored.some(t => t.team_name.toLowerCase() === cleanTeamName.toLowerCase() && t.status !== 'rejected')) {
    throw new Error(`DUPLICATE_TEAM_NAME: A team named "${cleanTeamName}" has already registered.`);
  }

  // Check existing duplicate UTR
  if (stored.some(t => t.utr_number === cleanUtr && t.status !== 'rejected')) {
    throw new Error(`DUPLICATE_UTR: This UPI reference number (${cleanUtr}) has already been submitted.`);
  }

  // Check existing participant emails & phones
  for (const m of members) {
    const e = m.email.trim().toLowerCase();
    const p = m.phone.trim().replace(/\s+/g, '');
    for (const team of stored) {
      if (team.status === 'rejected') continue;
      const foundEmail = team.participants?.some(tp => (tp.email || '').trim().toLowerCase() === e);
      if (foundEmail) throw new Error(`EXISTING_EMAIL_REGISTERED: The email "${e}" is already registered in an active team.`);
      const foundPhone = team.participants?.some(tp => (tp.phone || '').trim().replace(/\s+/g, '') === p);
      if (foundPhone) throw new Error(`EXISTING_PHONE_REGISTERED: The phone number "${p}" is already registered in an active team.`);
    }
  }

  // Build registration record
  const leader = leaders[0];
  const newTeamId = `VTX26-T${String(stored.length + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newTeam = {
    id: newTeamId,
    team_name: cleanTeamName,
    status: "pending",
    created_at: new Date().toISOString(),
    utr_number: cleanUtr,
    receipt_url: receipt_data_url || "/images/wafer-chromatic.jpg",
    college_city: leader.custom_college_city || leader.college_city || "Coimbatore",
    college_state: leader.custom_college_state || leader.college_state || "Tamil Nadu",
    leader_name: leader.name,
    leader_phone: leader.phone,
    leader_email: leader.email,
    leader_college: leader.custom_college_name || leader.college_name || "Host Institution",
    participants: members.map(m => ({
      name: m.name,
      email: m.email,
      phone: m.phone,
      is_leader: !!m.is_leader,
      department: m.department || "ECE",
      degree: m.degree || "B.E.",
      year_of_study: m.year_of_study || "3rd",
      college_name: m.custom_college_name || m.college_name || leader.custom_college_name || leader.college_name || "Host Institution"
    }))
  };

  const updated = [newTeam, ...stored];
  saveStoredTeams(updated);

  return {
    success: true,
    team_id: newTeamId,
    team_name: cleanTeamName,
    message: "Team registration committed to silicon ledger successfully."
  };
}

/**
 * Coordinator Tracker Roster RPC (Protected by Server-side Hashed PIN & Rate Limiting)
 * Zero PIN values are checked or stored in client code.
 */
export async function getTrackerRoster(pin) {
  const cleanPin = (pin || '').trim();
  if (!cleanPin) {
    throw new Error("UNAUTHORIZED_PIN: Verification PIN is required.");
  }

  if (!IS_MOCK_ENV) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_coordinator_roster`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ p_pin: cleanPin })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      if (err.message && err.message.includes('RATE_LIMITED')) {
        throw new Error("RATE_LIMITED: Coordinator access is temporarily locked due to 5 failed attempts. Please retry in 15 minutes.");
      }
      throw new Error(err.message || "UNAUTHORIZED_PIN: Invalid coordinator PIN.");
    }

    const data = await res.json();
    return data;
  }

  // Development Mock (Offline Mode)
  await new Promise(r => setTimeout(r, 300));
  if (cleanPin.length < 4) {
    throw new Error("UNAUTHORIZED_PIN: Please enter a 4-digit coordinator PIN.");
  }

  return getStoredTeams();
}
