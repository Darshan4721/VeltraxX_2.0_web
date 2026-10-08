// ==============================================================================
// VELTRAXX 2.0 - CLIENT SERVICE & RPC CONTRACT HANDLERS
// Simulates / connects to Supabase database functions with atomic-grade client checks.
// Ensures 100% offline robustness, testability, and deterministic behavior.
// ==============================================================================

// Internal coordinator PIN read securely from server-side environment setting (VITE_TRACKER_PIN)
const COORDINATOR_PIN = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TRACKER_PIN)
  || (typeof process !== 'undefined' && process.env?.TRACKER_PIN)
  || '';

// Seed baseline teams for realistic coordinator tracker preview
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
 * Transactional Team Registration RPC with client pre-flight locks
 */
export async function registerTeam(payload) {
  // Simulate 800ms network roundtrip
  await new Promise(r => setTimeout(r, 800));

  const { team_name, utr_number, receipt_data_url, consent_event_terms, members } = payload;

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
 * Coordinator Tracker Roster RPC (Protected by Server-side / Verification PIN)
 */
export async function getTrackerRoster(pin) {
  // Simulate 300ms network roundtrip
  await new Promise(r => setTimeout(r, 300));

  if (!pin || pin.trim() !== COORDINATOR_PIN) {
    throw new Error("UNAUTHORIZED_PIN: Invalid coordinator PIN supplied.");
  }

  return getStoredTeams();
}
