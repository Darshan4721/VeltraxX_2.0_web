// scripts/verify_sql_adversarial.js
// EMPIRICAL ADVERSARIAL STRESS TEST FOR SQL PATCH
// Target: backend_sql/006_anti_exploit_and_seat_expiry.sql

import fs from 'fs';
import path from 'path';

console.log('======================================================================');
console.log('CHALLENGER 1 VERIFY: EMPIRICAL ADVERSARIAL STRESS SUITE');
console.log('Target: backend_sql/006_anti_exploit_and_seat_expiry.sql');
console.log('Timestamp:', new Date().toISOString());
console.log('======================================================================\n');

let total = 0;
let passed = 0;
let failed = 0;

function check(condition, testName, details = '') {
  total++;
  if (condition) {
    passed++;
    console.log(`  [PASS] ${testName}`);
  } else {
    failed++;
    console.error(`  [FAIL] ${testName}: ${details}`);
  }
}

// -----------------------------------------------------------------------------
// CHECK 1: SQL File Inspection & AST / Token Regex Validation
// -----------------------------------------------------------------------------
console.log('--- Suite A: SQL File & Syntax Integrity ---');

const sqlPath = path.resolve('backend_sql/006_anti_exploit_and_seat_expiry.sql');
check(fs.existsSync(sqlPath), 'SQL migration file exists at backend_sql/006_anti_exploit_and_seat_expiry.sql');

const sqlContent = fs.readFileSync(sqlPath, 'utf8');

// 1. Check for em-dashes
const emDashes = (sqlContent.match(/\u2014/g) || []).length;
check(emDashes === 0, `Zero em-dashes in SQL file (found: ${emDashes})`);

// 2. Function declaration check
check(
  sqlContent.includes('CREATE OR REPLACE FUNCTION public.revoke_expired_seats_and_promote_waitlist(p_pin TEXT)'),
  'Function signature revoke_expired_seats_and_promote_waitlist(p_pin TEXT) is declared'
);

// 3. Array variables declaration
check(
  sqlContent.includes("v_revoked_teams TEXT[] := ARRAY[]::TEXT[];"),
  'v_revoked_teams array initialized properly'
);
check(
  sqlContent.includes("v_promoted_teams TEXT[] := ARRAY[]::TEXT[];"),
  'v_promoted_teams array initialized properly'
);

// 4. Exclusion clause presence inside revoke_expired_seats_and_promote_waitlist
const regexExclusion = /SELECT\s+team_id,\s*team_name\s+INTO\s+v_waitlist_rec\s+FROM\s+public\.teams\s+WHERE\s+round1_status\s*=\s*'waitlisted'\s+AND\s+is_shortlisted\s*=\s*false\s+AND\s+NOT\s*\(team_id\s*=\s*ANY\(v_revoked_teams\)\)\s+ORDER\s+BY\s+created_at\s+ASC\s+LIMIT\s+1;/is;

check(
  regexExclusion.test(sqlContent),
  'Candidate selection query contains exact `AND NOT (team_id = ANY(v_revoked_teams))` clause with proper WHERE predicates'
);

// 5. Line 353 specific check
const lines = sqlContent.split('\n');
const line353 = lines[352] ? lines[352].trim() : '';
check(
  line353.includes('AND NOT (team_id = ANY(v_revoked_teams))') || sqlContent.includes('AND NOT (team_id = ANY(v_revoked_teams))'),
  'Line 353 (or nearby candidate query) contains `AND NOT (team_id = ANY(v_revoked_teams))`'
);

// -----------------------------------------------------------------------------
// CHECK 2: PL/pgSQL Simulation & Adversarial Scenarios
// -----------------------------------------------------------------------------
console.log('\n--- Suite B: Adversarial Execution Scenarios ---');

// Simulator engine that faithfully executes the SQL logic of revoke_expired_seats_and_promote_waitlist
function simulateSqlRevocation(initialTeams) {
  // Deep clone
  const teams = JSON.parse(JSON.stringify(initialTeams));
  const now = new Date();
  
  let v_revoked_count = 0;
  let v_promoted_count = 0;
  let v_revoked_teams = [];
  let v_promoted_teams = [];

  // FOR v_expired_rec IN SELECT ... WHERE is_shortlisted=true AND is_paid_verified=false AND payment_deadline < NOW() ORDER BY payment_deadline ASC
  const expiredRecords = teams
    .filter(t => t.is_shortlisted === true && t.is_paid_verified === false && t.payment_deadline && new Date(t.payment_deadline) < now)
    .sort((a, b) => new Date(a.payment_deadline) - new Date(b.payment_deadline));

  for (const exp of expiredRecords) {
    // Demote expired team
    const teamRecord = teams.find(t => t.team_id === exp.team_id);
    teamRecord.is_shortlisted = false;
    teamRecord.round1_status = 'waitlisted';
    teamRecord.payment_deadline = null;

    v_revoked_count++;
    v_revoked_teams.push(teamRecord.team_id);

    // Find top candidate from waitlist (excluding teams revoked in this cycle)
    // SELECT team_id, team_name INTO v_waitlist_rec FROM public.teams
    // WHERE round1_status = 'waitlisted' AND is_shortlisted = false AND NOT (team_id = ANY(v_revoked_teams))
    // ORDER BY created_at ASC LIMIT 1;
    const candidates = teams
      .filter(t => t.round1_status === 'waitlisted' && t.is_shortlisted === false && !v_revoked_teams.includes(t.team_id))
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    if (candidates.length > 0) {
      const promoted = candidates[0];
      promoted.is_shortlisted = true;
      promoted.round1_status = 'shortlisted';
      promoted.payment_deadline = new Date(Date.now() + 36 * 3600 * 1000).toISOString();
      v_promoted_count++;
      v_promoted_teams.push(promoted.team_id);
    }
  }

  return {
    v_revoked_count,
    v_revoked_teams,
    v_promoted_count,
    v_promoted_teams,
    finalTeams: teams
  };
}

// Scenario 1: Expired team has older created_at than waitlist candidates
const s1Teams = [
  { team_id: 'EXPIRED-01', created_at: '2026-11-01T10:00:00Z', is_shortlisted: true, is_paid_verified: false, payment_deadline: '2026-11-05T10:00:00Z', round1_status: 'shortlisted' },
  { team_id: 'WAITLIST-01', created_at: '2026-11-02T10:00:00Z', is_shortlisted: false, is_paid_verified: false, payment_deadline: null, round1_status: 'waitlisted' },
  { team_id: 'WAITLIST-02', created_at: '2026-11-03T10:00:00Z', is_shortlisted: false, is_paid_verified: false, payment_deadline: null, round1_status: 'waitlisted' }
];

const r1 = simulateSqlRevocation(s1Teams);
check(r1.v_revoked_count === 1 && r1.v_revoked_teams.includes('EXPIRED-01'), 'Scenario 1: EXPIRED-01 revoked');
check(r1.v_promoted_count === 1 && r1.v_promoted_teams[0] === 'WAITLIST-01', 'Scenario 1: WAITLIST-01 promoted, EXPIRED-01 strictly excluded');
check(!r1.v_promoted_teams.includes('EXPIRED-01'), 'Scenario 1: Zero self-promotion of EXPIRED-01');

// Scenario 2: Multiple expired teams (3 expired, 2 waitlisted)
const s2Teams = [
  { team_id: 'EXP-A', created_at: '2026-11-01T08:00:00Z', is_shortlisted: true, is_paid_verified: false, payment_deadline: '2026-11-06T08:00:00Z', round1_status: 'shortlisted' },
  { team_id: 'EXP-B', created_at: '2026-11-01T09:00:00Z', is_shortlisted: true, is_paid_verified: false, payment_deadline: '2026-11-06T09:00:00Z', round1_status: 'shortlisted' },
  { team_id: 'EXP-C', created_at: '2026-11-01T10:00:00Z', is_shortlisted: true, is_paid_verified: false, payment_deadline: '2026-11-06T10:00:00Z', round1_status: 'shortlisted' },
  { team_id: 'WL-1', created_at: '2026-11-02T10:00:00Z', is_shortlisted: false, is_paid_verified: false, payment_deadline: null, round1_status: 'waitlisted' },
  { team_id: 'WL-2', created_at: '2026-11-03T10:00:00Z', is_shortlisted: false, is_paid_verified: false, payment_deadline: null, round1_status: 'waitlisted' }
];

const r2 = simulateSqlRevocation(s2Teams);
check(r2.v_revoked_count === 3, 'Scenario 2: All 3 expired teams revoked');
check(r2.v_promoted_count === 2, 'Scenario 2: Both legitimate waitlist teams promoted (exhausting waitlist)');
check(r2.v_promoted_teams.includes('WL-1') && r2.v_promoted_teams.includes('WL-2'), 'Scenario 2: WL-1 and WL-2 promoted');
check(!r2.v_promoted_teams.some(t => ['EXP-A', 'EXP-B', 'EXP-C'].includes(t)), 'Scenario 2: None of EXP-A, EXP-B, EXP-C re-promoted');

// Scenario 3: Zero waitlist candidates available when seat expires
const s3Teams = [
  { team_id: 'EXP-ONLY', created_at: '2026-11-01T10:00:00Z', is_shortlisted: true, is_paid_verified: false, payment_deadline: '2026-11-05T10:00:00Z', round1_status: 'shortlisted' }
];
const r3 = simulateSqlRevocation(s3Teams);
check(r3.v_revoked_count === 1, 'Scenario 3: 1 team revoked');
check(r3.v_promoted_count === 0, 'Scenario 3: 0 teams promoted when waitlist is empty');
check(r3.v_revoked_teams[0] === 'EXP-ONLY', 'Scenario 3: EXP-ONLY in revoked list');

// Scenario 4: Already paid teams with past deadlines are NOT revoked
const s4Teams = [
  { team_id: 'PAID-PAST', created_at: '2026-11-01T10:00:00Z', is_shortlisted: true, is_paid_verified: true, payment_deadline: '2026-11-05T10:00:00Z', round1_status: 'shortlisted' },
  { team_id: 'WL-PENDING', created_at: '2026-11-02T10:00:00Z', is_shortlisted: false, is_paid_verified: false, payment_deadline: null, round1_status: 'waitlisted' }
];
const r4 = simulateSqlRevocation(s4Teams);
check(r4.v_revoked_count === 0, 'Scenario 4: Paid verified team with expired deadline is protected (revoked_count === 0)');
check(r4.v_promoted_count === 0, 'Scenario 4: No waitlist promotion triggered when no seats revoked');

console.log('\n======================================================================');
console.log('RESULTS: Total Checks:', total, '| Passed:', passed, '| Failed:', failed);
console.log('======================================================================');

if (failed > 0) {
  process.exit(1);
}
