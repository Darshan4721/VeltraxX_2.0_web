import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument } from 'pdf-lib';

import {
  getDegreesForLevel,
  getDepartmentsForDegree,
  resolveDepartmentDraftCompatibility
} from '../src/data/academics.js';
import { validatePdfBuffer, MAX_PDF_BYTES, MAX_PDF_PAGES } from '../api/_lib/pdfValidator.js';
import {
  JUDGING_DRIVE_FOLDERS,
  retryWithBackoff,
  withDriveConcurrency,
  withGlobalUploadSlot,
  uploadBinaryToDriveAndVerify,
  resetDriveTokenCacheForTests
} from '../api/_lib/googleDrive.js';
import { drainDueSyncJobs } from '../api/_lib/gasClient.js';
import { handleRegisterRequest } from '../api/register.js';
import { handleInitiatePpt } from '../api/ppt/initiate.js';
import { handlePptUpload } from '../api/ppt/upload.js';
import { handlePptStatus } from '../api/ppt/status.js';
import { handleTeamRecovery } from '../api/team/recover.js';
import { handleReceiptUpload, handleUnifiedPaidRegistration } from '../api/round2/upload-receipt.js';
import { handleDeleteTeamRequest } from '../api/admin/action.js';
import { deleteDriveArtifactsForTeam } from '../api/_lib/googleDrive.js';
import { assertServerWritable } from '../api/_lib/supabaseAdmin.js';
import { AUTHORIZED_COORDINATOR_EMAILS } from '../src/lib/supabaseClient.js';
import { getTrackerRoster, adminUpdateTeamStatus, adminDeleteTeam } from '../src/lib/api.js';

async function makeObjectStreamPdf(pages = 6) {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pages; i++) {
    const page = doc.addPage([600, 400]);
    page.drawText(`VELTRAXX 2.0 Slide ${i + 1}`);
  }
  const bytes = await doc.save({ useObjectStreams: true });
  return Buffer.from(bytes);
}

// ==============================================================================
// HELPERS: SYNTHETIC PDF BUILDERS (STANDARD, COMPRESSED CANVA/PPTX, CORRUPT, OVERSIZED)
// ==============================================================================
function makeSyntheticPdf({ pages = 6, extraPaddingBytes = 0, compressed = false, includeEof = true, validHeader = true } = {}) {
  const header = validHeader ? '%PDF-1.7\n' : 'MZ_NOT_A_PDF\n';
  const catalog = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
  const kids = Array.from({ length: pages }, (_, i) => `${3 + i} 0 R`).join(' ');
  const pagesObj = `2 0 obj\n<< /Type /Pages /Kids [${kids}] /Count ${pages} >>\nendobj\n`;
  let pageObjs = '';
  for (let i = 0; i < pages; i++) {
    if (compressed && i === 0) {
      // Simulate compressed FlateDecode stream (like Canva / PowerPoint PDF export)
      pageObjs += `${3 + i} 0 obj\n<< /Type /Page /Parent 2 0 R /Contents 99 0 R >>\nendobj\n99 0 obj\n<< /Filter /FlateDecode /Length 16 >>\nstream\nx\x9c\x03\x00\x00\x00\x00\x01\nendstream\nendobj\n`;
    } else {
      pageObjs += `${3 + i} 0 obj\n<< /Type /Page /Parent 2 0 R >>\nendobj\n`;
    }
  }
  const pad = extraPaddingBytes > 0 ? `%${'A'.repeat(extraPaddingBytes)}\n` : '';
  const trailer = includeEof ? 'trailer\n<< /Root 1 0 R >>\n%%EOF\n' : 'trailer\n<< /Root 1 0 R >>\n';
  return Buffer.from(header + catalog + pagesObj + pageObjs + pad + trailer, 'latin1');
}

function makeThreeMembers(overrides = {}) {
  return [
    {
      name: 'Arunachalam S',
      email: 'arun@psgtech.ac.in',
      phone: '9842154321',
      role: 'leader',
      level: 'UG',
      degree: 'B.E.',
      department: 'Electronics Engineering (VLSI Design & Technology)',
      year_of_study: '3rd',
      college_name: 'PSG College of Technology',
      ...(overrides[0] || {})
    },
    {
      name: 'Karthik M',
      email: 'karthik@psgtech.ac.in',
      phone: '9842154322',
      role: 'member_2',
      level: 'UG',
      degree: 'B.E.',
      department: 'Electronics and Communication Engineering (ECE)',
      year_of_study: '3rd',
      college_name: 'PSG College of Technology',
      ...(overrides[1] || {})
    },
    {
      name: 'Deepika R',
      email: 'deepika@psgcas.ac.in',
      phone: '9842154323',
      role: 'member_3',
      level: 'UG',
      degree: 'BCA',
      department: 'Computer Applications',
      year_of_study: '2nd',
      college_name: 'PSG College of Arts and Science',
      ...(overrides[2] || {})
    }
  ];
}

// ==============================================================================
// IN-MEMORY DETERMINISTIC STAGING STATE FOR INTEGRATION & CONCURRENCY TESTS
// ==============================================================================
function createInMemoryStage({ pptOpen = false, regOpen = true, paymentOpen = true, maxCap = 60, graceMinutes = 10 } = {}) {
  let seq = 0;
  const teams = new Map();
  const holds = new Map();
  const attempts = new Map();
  const rateBuckets = new Map();
  const submissions = new Map(); // teamId -> []
  const driveFiles = new Map();
  const uploadSlots = new Set(); // active attemptIds holding global slots
  let windowEnd = new Date(Date.now() + 3600 * 1000);
  let pptOverride = 'FORCE_CLOSED';

  const countOccupiedSeats = (excludeToken = null) => {
    let count = 0;
    for (const t of teams.values()) {
      if (t.round1_status !== 'rejected') count += 1;
    }
    const now = Date.now();
    for (const h of holds.values()) {
      if (h.status === 'PENDING' && h.expires_at > now && h.reservation_token !== excludeToken) {
        count += 1;
      }
    }
    return count;
  };

  const callRpcFn = async (name, params) => {
    if (name === 'acquire_upload_slot') {
      const cap = params.p_max_slots || 20;
      if (uploadSlots.has(params.p_attempt_id)) return { acquired: true, active_slots: uploadSlots.size, max_slots: cap };
      if (uploadSlots.size >= cap) return { acquired: false, active_slots: uploadSlots.size, max_slots: cap };
      uploadSlots.add(params.p_attempt_id);
      return { acquired: true, active_slots: uploadSlots.size, max_slots: cap };
    }
    if (name === 'release_upload_slot') {
      uploadSlots.delete(params.p_attempt_id);
      return null;
    }
    if (name === 'check_rate_limit') {
      const b = rateBuckets.get(params.p_bucket_key) || { count: 0 };
      b.count += 1;
      rateBuckets.set(params.p_bucket_key, b);
      if (b.count > params.p_max_requests) {
        return { allowed: false, retry_after_seconds: 30 };
      }
      return { allowed: true };
    }

    if (name === 'reserve_checkout_slot') {
      if (!regOpen) return { success: false, error: 'Registration window is currently closed.' };
      if (params.p_team_size !== 3 || !Array.isArray(params.p_members) || params.p_members.length !== 3) {
        return { success: false, error: 'Strictly 3 members are required.' };
      }
      const emails = new Set();
      const phones = new Set();
      for (const m of params.p_members) {
        const em = String(m.email || '').toLowerCase();
        const ph = String(m.phone || '').slice(-10);
        if (emails.has(em) || phones.has(ph)) return { success: false, error: 'Duplicate email or phone within squad.' };
        emails.add(em);
        phones.add(ph);
        for (const t of teams.values()) {
          if (t.round1_status !== 'rejected' && t.members.some((ex) => ex.email === em || ex.phone === ph)) {
            return { success: false, error: `Member already registered in ${t.team_id}` };
          }
        }
        if (m.level !== 'Working professional') {
          if (!m.college_name || !m.degree || !m.department || !m.year_of_study) {
            return { success: false, error: 'Missing required student academic fields.' };
          }
          if (m.degree.toLowerCase() === 'other' || m.department.toLowerCase() === 'other') {
            return { success: false, error: 'Custom degree/department text required.' };
          }
        }
      }
      const exclude = params.p_existing_token || null;
      if (countOccupiedSeats(exclude) >= maxCap) {
        return { success: false, error: `Maximum arena capacity (${maxCap} teams) reached.` };
      }
      const resToken = exclude && holds.has(exclude) ? exclude : `HOLD-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
      const expiresAtMs = Date.now() + 5 * 60000;
      holds.set(resToken, {
        reservation_token: resToken,
        idempotency_key: params.p_idempotency_key || null,
        status: 'PENDING',
        expires_at: expiresAtMs,
        utr_number: null,
        receipt_drive_file_id: null,
        emails: Array.from(emails),
        phones: Array.from(phones)
      });
      return {
        success: true,
        reservation_token: resToken,
        expires_at: new Date(expiresAtMs).toISOString(),
        academic_tier: params.p_members.some((m) => ['3rd', '4th', '5th'].includes(m.year_of_study) || m.level !== 'UG') ? 'tier_b' : 'tier_a',
        fee_per_member: 500,
        total_fee: 1500,
        payment_open: paymentOpen,
        claimed_teams: countOccupiedSeats(null),
        max_teams: maxCap
      };
    }

    if (name === 'preflight_paid_registration') {
      if (params.p_idempotency_key) {
        for (const t of teams.values()) {
          if (t.idempotency_key === params.p_idempotency_key) {
            return {
              ok: true,
              already_completed: true,
              team_id: t.team_id,
              team_name: t.team_name,
              track_id: t.track_id,
              problem_code: t.problem_code,
              academic_tier: t.academic_tier,
              payment_token: t.payment_token,
              utr_number: t.utr_number
            };
          }
        }
      }
      if (!paymentOpen) return { ok: false, status_code: 403, error: 'Live UPI payments are pending official coordinator QR verification.' };
      if (!regOpen) return { ok: false, status_code: 403, error: 'Registration window is closed.' };
      const cleanUtr = String(params.p_utr_number || '').trim();
      for (const t of teams.values()) {
        if (t.round1_status !== 'rejected' && t.utr_number === cleanUtr) {
          return { ok: false, status_code: 409, error: `Duplicate transaction reference: UTR ${cleanUtr} is already registered with Team ${t.team_id}.` };
        }
      }
      for (const m of params.p_members) {
        const em = String(m.email || '').toLowerCase();
        const ph = String(m.phone || '').slice(-10);
        for (const t of teams.values()) {
          if (t.round1_status !== 'rejected' && t.members.some((ex) => ex.email === em || ex.phone === ph)) {
            return { ok: false, status_code: 400, error: `Member already registered with Team ${t.team_id}.` };
          }
        }
      }
      const hold = params.p_reservation_token ? holds.get(params.p_reservation_token) : null;
      return {
        ok: true,
        already_completed: false,
        existing_drive_file_id: hold && hold.utr_number === cleanUtr ? hold.receipt_drive_file_id : null,
        capacity_reached: countOccupiedSeats(params.p_reservation_token || null) >= maxCap
      };
    }

    if (name === 'save_reservation_receipt') {
      const hold = holds.get(params.p_reservation_token);
      if (hold) {
        hold.utr_number = params.p_utr_number;
        hold.receipt_drive_file_id = params.p_drive_file_id;
      }
      return null;
    }

    if (name === 'complete_paid_registration') {
      if (params.p_idempotency_key) {
        for (const t of teams.values()) {
          if (t.idempotency_key === params.p_idempotency_key) {
            return {
              success: true,
              idempotent_replay: true,
              team_id: t.team_id,
              team_name: t.team_name,
              track_id: t.track_id,
              problem_code: t.problem_code,
              academic_tier: t.academic_tier,
              payment_token: t.payment_token,
              utr_number: t.utr_number,
              payment_status: 'PENDING_VERIFICATION',
              message: 'Registration submitted successfully!\nYour payment evidence has been received and is awaiting verification by the organizing committee. You will receive an official confirmation email once your payment is verified.'
            };
          }
        }
      }
      if (!paymentOpen) return { success: false, status_code: 403, error: 'Live UPI payments are pending official coordinator QR verification.' };
      if (!regOpen) return { success: false, status_code: 403, error: 'Registration window is closed.' };
      const cleanUtr = String(params.p_utr_number || '').trim();
      for (const t of teams.values()) {
        if (t.round1_status !== 'rejected' && t.utr_number === cleanUtr) {
          return { success: false, status_code: 409, error: `Duplicate transaction reference: UTR ${cleanUtr} was already submitted by Team ${t.team_id}.` };
        }
      }
      if (countOccupiedSeats(params.p_reservation_token || null) >= maxCap) {
        return {
          success: false,
          status_code: 409,
          code: 'CAPACITY_WITH_UTR_LOGGED',
          error: `All ${maxCap} team seats have now been claimed. Your UTR (${cleanUtr}) and payment screenshot have been safely logged.`
        };
      }
      seq += 1;
      const teamId = `VTX2-${String(seq).padStart(3, '0')}`;
      const passcode = String(params.p_ppt_passcode_plain || 'PASS99').toUpperCase();
      const computedTier = params.p_members.some((m) => ['3rd', '4th', '5th'].includes(m.year_of_study) || m.level !== 'UG') ? 'tier_b' : 'tier_a';
      teams.set(teamId, {
        team_id: teamId,
        team_name: params.p_team_name,
        track_id: params.p_track_id,
        problem_code: params.p_problem_code,
        academic_tier: computedTier,
        passcode,
        payment_token: passcode,
        is_shortlisted: true,
        round1_status: 'pending',
        utr_number: cleanUtr,
        payment_screenshot_url: `/api/admin/action?op=file&teamId=${teamId}&fileId=${params.p_drive_file_id}`,
        round2_receipt_drive_file_id: params.p_drive_file_id,
        is_paid_verified: false,
        idempotency_key: params.p_idempotency_key || null,
        members: params.p_members.map((m) => ({ ...m, email: m.email.toLowerCase(), phone: m.phone.slice(-10) }))
      });
      if (params.p_reservation_token && holds.has(params.p_reservation_token)) {
        holds.get(params.p_reservation_token).status = 'COMPLETED';
      }
      return {
        success: true,
        idempotent_replay: false,
        team_id: teamId,
        team_name: params.p_team_name,
        track_id: params.p_track_id,
        problem_code: params.p_problem_code,
        academic_tier: computedTier,
        payment_token: passcode,
        utr_number: cleanUtr,
        payment_status: 'PENDING_VERIFICATION',
        message: 'Registration submitted successfully!\nYour payment evidence has been received and is awaiting verification by the organizing committee. You will receive an official confirmation email once your payment is verified.'
      };
    }

    if (name === 'register_free_team_v2') {
      return { success: false, error: 'Unpaid registrations are disabled.' };
    }

    if (name === 'initiate_ppt_submission') {
      for (const a of attempts.values()) {
        if (a.idempotency_key === params.p_idempotency_key) {
          if (a.status === 'CONFIRMED') {
            return { success: true, already_confirmed: true, receipt: a.receipt };
          }
          if (a.status === 'INITIATED' || a.status === 'UPLOADING') {
            return { success: true, attempt_id: a.id, attempt_token: a.attempt_token, grace_expires_at: a.grace_expires_at };
          }
        }
      }
      const team = teams.get(params.p_team_id);
      if (!team || team.passcode !== String(params.p_passcode).toUpperCase()) {
        return { success: false, code: 'INVALID_CREDENTIALS', error: 'Incorrect Team ID or team passcode.' };
      }
      const now = new Date();
      const isOpen = pptOverride === 'FORCE_OPEN' || (pptOverride === 'AUTO' && pptOpen && now <= windowEnd);
      if (!isOpen) {
        return { success: false, code: 'WINDOW_CLOSED', error: 'PPT submission window is currently closed.' };
      }
      const inflight = [...attempts.values()].some((a) => a.team_id === team.team_id && a.status === 'UPLOADING');
      if (inflight) {
        return { success: false, code: 'UPLOAD_IN_PROGRESS', error: 'Another upload for your team is currently in progress.' };
      }
      for (const a of attempts.values()) {
        if (a.team_id === team.team_id && a.status === 'INITIATED') {
          a.status = 'SUPERSEDED';
        }
      }
      const attId = crypto.randomUUID();
      const attToken = crypto.randomUUID();
      const graceUntil = new Date(Math.min(now.getTime() + graceMinutes * 60000, windowEnd.getTime() + graceMinutes * 60000));
      const att = {
        id: attId,
        attempt_token: attToken,
        idempotency_key: params.p_idempotency_key,
        team_id: team.team_id,
        problem_code: team.problem_code,
        current_version: team.ppt_current_version,
        previous_drive_file_id: team.ppt_drive_file_id,
        attempt_number: ([...attempts.values()].filter((x) => x.team_id === team.team_id).length) + 1,
        status: 'INITIATED',
        file_name: params.p_file_name,
        file_size_bytes: params.p_file_size_bytes,
        file_sha256: params.p_file_sha256,
        page_count: params.p_page_count,
        extracted_text: params.p_extracted_text,
        grace_expires_at: graceUntil.toISOString(),
        started_at: now.toISOString()
      };
      attempts.set(attId, att);
      return {
        success: true,
        attempt_id: attId,
        attempt_token: attToken,
        problem_code: team.problem_code,
        grace_expires_at: att.grace_expires_at
      };
    }

    if (name === 'mark_ppt_attempt_uploading') {
      const att = attempts.get(params.p_attempt_id);
      if (!att || att.attempt_token !== params.p_attempt_token) return { success: false, code: 'INVALID_ATTEMPT' };
      if (new Date() > new Date(att.grace_expires_at) || pptOverride === 'FORCE_CLOSED') {
        att.status = 'FAILED';
        return { success: false, code: 'GRACE_EXPIRED', error: 'Submission window and 10-minute grace period have closed.' };
      }
      if (att.status === 'UPLOADING') return { success: false, code: 'DUPLICATE_IN_FLIGHT', error: 'Already uploading.' };
      if (att.status !== 'INITIATED') return { success: false, code: 'ATTEMPT_NOT_REUSABLE', error: 'Session is no longer active.' };
      att.status = 'UPLOADING';
      return { success: true, attempt: att };
    }

    if (name === 'finalize_ppt_submission_v2') {
      const att = attempts.get(params.p_attempt_id);
      if (!att) return { success: false, code: 'INVALID_ATTEMPT' };
      if (new Date() > new Date(att.grace_expires_at)) return { success: false, code: 'GRACE_EXPIRED', error: 'Grace expired.' };
      const team = teams.get(att.team_id);
      const prevDriveFileId = team.ppt_drive_file_id;
      const nextVer = team.ppt_current_version + 1;
      const receiptId = `${team.team_id}-V${nextVer}-TEST`;
      const nowIso = new Date().toISOString();
      team.ppt_current_version = nextVer;
      team.ppt_receipt_id = receiptId;
      team.ppt_drive_file_id = params.p_drive_file_id;
      team.ppt_file_name = att.file_name;
      team.ppt_submitted_at = nowIso;
      const receipt = {
        receipt_id: receiptId,
        team_id: team.team_id,
        team_name: team.team_name,
        problem_code: team.problem_code,
        version: nextVer,
        file_name: att.file_name,
        file_size_bytes: params.p_verified_size_bytes,
        page_count: att.page_count,
        submitted_at: nowIso,
        status: 'CONFIRMED'
      };
      submissions.get(team.team_id).push({ ...receipt, drive_file_id: params.p_drive_file_id });
      att.status = 'CONFIRMED';
      att.receipt = receipt;
      return { success: true, previous_drive_file_id: prevDriveFileId, problem_code: team.problem_code, receipt };
    }

    if (name === 'mark_ppt_attempt_failed') {
      const att = attempts.get(params.p_attempt_id);
      if (att && att.status !== 'CONFIRMED') {
        att.status = params.p_status;
        att.error_code = params.p_error_code;
        att.error_message = params.p_error_message;
      }
      return null;
    }

    if (name === 'get_team_submission_status') {
      const team = teams.get(params.p_team_id);
      if (!team || team.passcode !== String(params.p_passcode).toUpperCase()) {
        return { success: false, error: 'Incorrect Team ID or team passcode.' };
      }
      return {
        success: true,
        team_id: team.team_id,
        has_confirmed_submission: team.ppt_current_version > 0,
        receipt: team.ppt_current_version > 0 ? submissions.get(team.team_id).at(-1) : null
      };
    }

    if (name === 'recover_team_identity') {
      for (const t of teams.values()) {
        if (t.members.some((m) => m.email === params.p_email && m.phone === params.p_phone)) {
          return { success: true, team_id: t.team_id, team_name: t.team_name };
        }
      }
      return { success: false, error: 'No active team found matching both that email and phone number.' };
    }

    if (name === 'rotate_team_ppt_passcode') {
      const t = teams.get(params.p_team_id);
      if (!t || t.members[0].email !== params.p_leader_email || t.members[0].phone !== params.p_leader_phone) {
        return { success: false, error: 'Credentials mismatch.' };
      }
      t.prev_passcode = t.passcode;
      t.passcode = params.p_new_passcode_plain;
      return { success: true, team_id: t.team_id, team_name: t.team_name, leader_email: t.members[0].email, leader_name: t.members[0].name };
    }

    if (name === 'rollback_passcode_rotation') {
      const t = teams.get(params.p_team_id);
      if (t && t.prev_passcode) {
        t.passcode = t.prev_passcode;
        t.prev_passcode = null;
        return true;
      }
      return false;
    }

    throw new Error(`Unexpected RPC ${name}`);
  };

  return {
    teams,
    holds,
    attempts,
    submissions,
    driveFiles,
    rateBuckets,
    callRpcFn,
    setWindowEnd(dateObj) { windowEnd = dateObj; },
    setPptOverride(v) { pptOverride = v; },
    setRegOpen(v) { regOpen = v; }
  };
}

// ==============================================================================
// TEST SUITES
// ==============================================================================

test('1. Academic taxonomy separation, custom Other resolution & draft compatibility', () => {
  assert.deepEqual(getDepartmentsForDegree('BCA'), ['Computer Applications', 'Other']);
  assert.ok(!getDepartmentsForDegree('B.Com').some((d) => /VLSI|ECE|EEE|Mechanical/i.test(d)));
  assert.ok(getDepartmentsForDegree('B.E.').includes('Electronics Engineering (VLSI Design & Technology)'));
  assert.ok(getDegreesForLevel('PG').includes('M.Tech'));
  assert.ok(!getDegreesForLevel('PG').includes('B.E.'));
  assert.ok(getDegreesForLevel('Research scholar').includes('Ph.D.'));

  const compat = resolveDepartmentDraftCompatibility('B.E.', 'ECE');
  assert.equal(compat.department, 'Electronics and Communication Engineering (ECE)');
  const unlisted = resolveDepartmentDraftCompatibility('B.E.', 'Photonics Special');
  assert.equal(unlisted.department, 'Other');
  assert.equal(unlisted.customDepartment, 'Photonics Special');
});

test('2. Unified Paid Registration: Step 1 creates hold only (zero unpaid team); Step 3 commits team, 3 members, Drive & Sheets idempotently', async () => {
  const stage = createInMemoryStage();
  const pngBuf = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(32, 1)]);
  let gasCalls = 0;
  let driveUploads = 0;

  const draft = {
    team_name: 'Silicon Knights',
    track_id: 'track_01',
    problem_code: 'VTX-T1-01',
    team_size: 3,
    members: makeThreeMembers()
  };

  // Step 1 ("Proceed to Payment") must ONLY reserve temporary checkout hold — NO Team ID, NO permanent team, NO Sheets sync
  const holdRes = await handleRegisterRequest(draft, '10.0.0.1', { callRpcFn: stage.callRpcFn });
  assert.equal(holdRes.status, 200);
  assert.equal(holdRes.body.success, true);
  assert.ok(holdRes.body.reservation_token.startsWith('HOLD-'));
  assert.equal(holdRes.body.team_id, undefined, 'Step 1 must NOT allocate a final Team ID');
  assert.equal(stage.teams.size, 0, 'Step 1 must NOT create permanent unpaid team registrations');
  assert.equal(gasCalls, 0);

  // Step 3 without consent rejected cleanly
  const noConsent = await handleUnifiedPaidRegistration({
    draft,
    utrNumber: '983271829102',
    reservationToken: holdRes.body.reservation_token,
    idempotencyKey: 'idem-sk-1',
    consentAccepted: false,
    buffer: pngBuf,
    clientIp: '10.0.0.1'
  }, { callRpcFn: stage.callRpcFn });
  assert.equal(noConsent.status, 400);

  // Step 3 with full consent, 12-digit UTR & valid image completes atomically even if GAS fails
  const completeRes = await handleUnifiedPaidRegistration({
    draft,
    utrNumber: '983271829102',
    reservationToken: holdRes.body.reservation_token,
    idempotencyKey: 'idem-sk-1',
    consentAccepted: true,
    buffer: pngBuf,
    clientIp: '10.0.0.1'
  }, {
    callRpcFn: stage.callRpcFn,
    queryRestFn: async () => [{ id: 'job-1' }],
    uploadDriveFn: async () => { driveUploads++; return { fileId: 'drv_unified_1' }; },
    driveCfg: { receiptsFolderId: 'fin_root', rootFolderId: 'judging_root' },
    dispatchGasFn: async () => { gasCalls++; return { synced: false, error: 'GAS_TIMEOUT' }; },
    drainSyncFn: async () => ({})
  });

  assert.equal(completeRes.status, 200);
  assert.equal(completeRes.body.success, true);
  assert.equal(completeRes.body.team_id, 'VTX2-001');
  assert.equal(completeRes.body.payment_status, 'PENDING_VERIFICATION');
  assert.equal(completeRes.body.sheet_sync_status, 'queued');
  assert.match(completeRes.body.message, /^Registration submitted successfully!\nYour payment evidence has been received/);
  assert.equal(stage.teams.size, 1);
  assert.equal(driveUploads, 1);
  assert.equal(gasCalls, 1);

  // Retrying Step 3 with same idempotencyKey returns existing team cleanly WITHOUT duplicate Drive upload or duplicate team
  const replayRes = await handleUnifiedPaidRegistration({
    draft,
    utrNumber: '983271829102',
    reservationToken: holdRes.body.reservation_token,
    idempotencyKey: 'idem-sk-1',
    consentAccepted: true,
    buffer: pngBuf,
    clientIp: '10.0.0.1'
  }, {
    callRpcFn: stage.callRpcFn,
    uploadDriveFn: async () => { throw new Error('Retry must NOT re-upload Drive screenshot'); }
  });
  assert.equal(replayRes.status, 200);
  assert.equal(replayRes.body.idempotent_replay, true);
  assert.equal(replayRes.body.team_id, 'VTX2-001');
  assert.equal(stage.teams.size, 1);

  // Interrupted submission right after Drive upload reuses saved receipt without re-uploading
  const interruptedDraft = {
    team_name: 'Interrupted Retry Squad',
    track_id: 'track_02',
    problem_code: 'VTX-T2-01',
    team_size: 3,
    members: makeThreeMembers({
      0: { email: 'int1@psgtech.ac.in', phone: '9888811111' },
      1: { email: 'int2@psgtech.ac.in', phone: '9888811112' },
      2: { email: 'int3@psgtech.ac.in', phone: '9888811113' }
    })
  };
  const intHold = await handleRegisterRequest(interruptedDraft, '10.0.0.8', { callRpcFn: stage.callRpcFn });
  let uploadCount = 0;
  let forceCommitError = true;
  const wrappedRpc = async (fn, params) => {
    if (fn === 'complete_paid_registration' && forceCommitError) {
      return { success: false, status_code: 500, error: 'Simulated mid-commit network glitch' };
    }
    return stage.callRpcFn(fn, params);
  };
  const failFirstTry = await handleUnifiedPaidRegistration({
    draft: interruptedDraft,
    utrNumber: '777788889999',
    reservationToken: intHold.body.reservation_token,
    idempotencyKey: 'idem-int-1',
    consentAccepted: true,
    buffer: pngBuf,
    clientIp: '10.0.0.8'
  }, {
    callRpcFn: wrappedRpc,
    uploadDriveFn: async () => { uploadCount++; return { fileId: 'drv_saved_hold_1' }; },
    driveCfg: { receiptsFolderId: 'fin_root', rootFolderId: 'judging_root' }
  });
  assert.equal(failFirstTry.status, 500);
  assert.equal(uploadCount, 1);

  forceCommitError = false;
  const retryOk = await handleUnifiedPaidRegistration({
    draft: interruptedDraft,
    utrNumber: '777788889999',
    reservationToken: intHold.body.reservation_token,
    idempotencyKey: 'idem-int-1',
    consentAccepted: true,
    buffer: pngBuf,
    clientIp: '10.0.0.8'
  }, {
    callRpcFn: stage.callRpcFn,
    queryRestFn: async () => [],
    uploadDriveFn: async () => { uploadCount++; throw new Error('Should reuse drv_saved_hold_1 without second upload'); },
    driveCfg: { receiptsFolderId: 'fin_root', rootFolderId: 'judging_root' },
    dispatchGasFn: async () => ({ synced: true }),
    drainSyncFn: async () => ({})
  });
  assert.equal(retryOk.status, 200);
  assert.equal(retryOk.body.drive_file_id, 'drv_saved_hold_1');
  assert.equal(uploadCount, 1);

  // Non-3 member size blocked strictly
  const twoMemberRes = await handleRegisterRequest(
    { team_name: 'Two Member Squad', track_id: 'track_01', problem_code: 'VTX-T1-01', team_size: 2, members: makeThreeMembers().slice(0, 2) },
    '10.0.0.9',
    { callRpcFn: stage.callRpcFn }
  );
  assert.equal(twoMemberRes.status, 400);

  // Duplicate UTR rejected with 409 before Drive upload in unified paid flow
  const dupUtrUnified = await handleUnifiedPaidRegistration({
    draft: {
      team_name: 'Dup UTR Squad',
      track_id: 'track_02',
      problem_code: 'VTX-T2-02',
      team_size: 3,
      members: makeThreeMembers({
        0: { email: 'duputr1@psgtech.ac.in', phone: '9877711111' },
        1: { email: 'duputr2@psgtech.ac.in', phone: '9877711112' },
        2: { email: 'duputr3@psgtech.ac.in', phone: '9877711113' }
      })
    },
    utrNumber: '983271829102', // Already used by VTX2-001
    idempotencyKey: 'idem-dup-utr-1',
    consentAccepted: true,
    buffer: pngBuf,
    clientIp: '10.0.0.10'
  }, {
    callRpcFn: stage.callRpcFn,
    uploadDriveFn: async () => { throw new Error('Duplicate UTR must reject before Drive upload'); }
  });
  assert.equal(dupUtrUnified.status, 409);
  assert.match(dupUtrUnified.body.error, /Duplicate transaction reference/i);

  // Duplicate member registration rejected cleanly
  const dupRes = await handleRegisterRequest(
    {
      team_name: 'Duplicate Squad',
      track_id: 'track_02',
      problem_code: 'VTX-T2-01',
      team_size: 3,
      members: makeThreeMembers({ 0: { email: 'arun@psgtech.ac.in', phone: '9842154321' } })
    },
    '10.0.0.2',
    { callRpcFn: stage.callRpcFn }
  );
  assert.equal(dupRes.status, 400);
});

test('3. PDF validator handles standard, compressed /ObjStm PowerPoint/Canva exports, oversized, corrupted, and >8-slide PDFs', async () => {
  const validObjStm = await makeObjectStreamPdf(6);
  const vInfo = await validatePdfBuffer(validObjStm);
  assert.equal(vInfo.pageCount, 6);
  assert.equal(vInfo.sizeBytes, validObjStm.length);

  const eightSlideObjStm = await makeObjectStreamPdf(8);
  assert.equal((await validatePdfBuffer(eightSlideObjStm)).pageCount, 8);

  const tooManyPagesObjStm = await makeObjectStreamPdf(9);
  await assert.rejects(() => validatePdfBuffer(tooManyPagesObjStm), /Maximum allowed is 8 slides/);

  const corruptNoEof = makeSyntheticPdf({ pages: 4, includeEof: false });
  await assert.rejects(() => validatePdfBuffer(corruptNoEof), /Corrupted or incomplete PDF/);

  const fakeHeader = makeSyntheticPdf({ pages: 4, validHeader: false });
  await assert.rejects(() => validatePdfBuffer(fakeHeader), /Invalid PDF file/);

  const oversized = Buffer.concat([validObjStm.subarray(0, validObjStm.length - 6), Buffer.alloc(MAX_PDF_BYTES + 100, 0x20), Buffer.from('\n%%EOF\n')]);
  await assert.rejects(() => validatePdfBuffer(oversized), /exceeds the strict 3 MB/);
});

test('4. Retired PPT/email endpoints return 410 Gone & Email+Phone Recovery remains privacy-preserving', async () => {
  const stage = createInMemoryStage();
  const pngBuf = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(32, 1)]);
  const reg = await handleUnifiedPaidRegistration({
    draft: { team_name: 'Verilog Team', track_id: 'track_01', problem_code: 'VTX-T1-01', team_size: 3, members: makeThreeMembers() },
    utrNumber: '112233445566',
    idempotencyKey: 'idem-t4',
    consentAccepted: true,
    buffer: pngBuf,
    clientIp: '1.1.1.1'
  }, {
    callRpcFn: stage.callRpcFn,
    queryRestFn: async () => [],
    uploadDriveFn: async () => ({ fileId: 'drv_t4' }),
    driveCfg: { receiptsFolderId: 'fin', rootFolderId: 'judg' },
    dispatchGasFn: async () => ({ synced: true }),
    drainSyncFn: async () => ({})
  });
  const teamId = reg.body.team_id;

  // All legacy PPT endpoints return 410 PPT_ROUND_CANCELLED
  const initRes = await handleInitiatePpt();
  assert.equal(initRes.status, 410);
  assert.equal(initRes.body.code, 'PPT_ROUND_CANCELLED');

  const upRes = await handlePptUpload();
  assert.equal(upRes.status, 410);
  assert.equal(upRes.body.code, 'PPT_ROUND_CANCELLED');

  const statusRes = await handlePptStatus();
  assert.equal(statusRes.status, 410);
  assert.equal(statusRes.body.code, 'PPT_ROUND_CANCELLED');

  // Automated passcode recovery emails retired -> HTTP 410
  const passcodeRec = await handleTeamRecovery(
    { mode: 'passcode', team_id: teamId, email: 'arun@psgtech.ac.in', phone: '9842154321' },
    '1.1.1.1',
    { callRpcFn: stage.callRpcFn }
  );
  assert.equal(passcodeRec.status, 410);

  // Privacy-preserving Team ID recovery: wrong phone rejected (404); email+phone succeeds (200)
  const badRec = await handleTeamRecovery({ mode: 'id', email: 'arun@psgtech.ac.in', phone: '1111111111' }, '1.1.1.1', { callRpcFn: stage.callRpcFn });
  assert.equal(badRec.status, 404);
  const okRec = await handleTeamRecovery({ mode: 'id', email: 'arun@psgtech.ac.in', phone: '9842154321' }, '1.1.1.1', { callRpcFn: stage.callRpcFn });
  assert.equal(okRec.status, 200);
  assert.equal(okRec.body.team_id, teamId);
});

test('5. Google Drive bounded retry & concurrency semaphore resilience', async () => {
  resetDriveTokenCacheForTests();
  let maxConcurrentDrive = 0;
  let currentDrive = 0;
  let injected429Count = 0;

  const outcomes = await Promise.all(
    Array.from({ length: 30 }, (_, idx) =>
      withDriveConcurrency(() =>
        retryWithBackoff(async (attemptNo) => {
          currentDrive++;
          if (currentDrive > maxConcurrentDrive) maxConcurrentDrive = currentDrive;
          await new Promise((r) => setTimeout(r, 10));
          currentDrive--;
          if (idx % 6 === 0 && attemptNo === 0) {
            injected429Count++;
            const err = new Error('Simulated Drive 429');
            err.status = 429;
            throw err;
          }
          return idx;
        }, { baseDelayMs: 10, maxDelayMs: 40 })
      )
    )
  );
  assert.equal(outcomes.length, 30);
  assert.ok(maxConcurrentDrive <= 12, `Bounded concurrency violated: observed ${maxConcurrentDrive}`);
  assert.equal(injected429Count, 5);
});

test('6. Payment receipt upload validates 12-digit UTR & image bytes, blocks duplicate UTR (409), and isolates Finance Drive folder', async () => {
  const pngBuf = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(32, 1)]);
  let uploadedFolder = null;
  let gasAction = null;

  // Duplicate UTR rejected with 409 before touching Drive
  const dupRes = await handleReceiptUpload(
    { teamId: 'VTX2-010', passcode: 'TOK101', utrNumber: '123456789012', buffer: pngBuf },
    {
      callRpcFn: async (fn) => (fn === 'verify_round2_gatekeeper' ? { valid: true } : {}),
      queryRestFn: async (q) => (q.includes('utr_number=eq.') ? [{ team_id: 'VTX2-005' }] : []),
      uploadDriveFn: async () => { throw new Error('Should not upload duplicate UTR'); },
      driveCfg: { receiptsFolderId: 'fin_root_id', rootFolderId: 'judging_root_id' }
    }
  );
  assert.equal(dupRes.status, 409);

  // Valid receipt stored in ROUND2_RECEIPTS/<TEAM_ID> & dispatches team_status_sync
  const okRes = await handleReceiptUpload(
    { teamId: 'VTX2-010', passcode: 'TOK101', utrNumber: '987654321098', buffer: pngBuf },
    {
      callRpcFn: async (fn) => {
        if (fn === 'verify_round2_gatekeeper') return { valid: true };
        if (fn === 'submit_round2_payment') {
          return { success: true, message: 'Payment evidence submitted successfully. Your participation will be confirmed after verification by the organizing team.' };
        }
        return {};
      },
      queryRestFn: async () => [],
      uploadDriveFn: async ({ folderPathSegments, parentFolderId }) => {
        uploadedFolder = { parentFolderId, folderPathSegments };
        return { fileId: 'fin_drive_file_10' };
      },
      driveCfg: { receiptsFolderId: 'fin_root_id', rootFolderId: 'judging_root_id' },
      dispatchGasFn: async (opts) => { gasAction = opts.action; return { synced: true }; }
    }
  );
  assert.equal(okRes.status, 200);
  assert.equal(okRes.body.drive_file_id, 'fin_drive_file_10');
  assert.equal(okRes.body.message, 'Payment evidence submitted successfully. Your participation will be confirmed after verification by the organizing team.');
  assert.equal(uploadedFolder.parentFolderId, 'fin_root_id');
  assert.deepEqual(uploadedFolder.folderPathSegments, [JUDGING_DRIVE_FOLDERS.ROUND2_RECEIPTS, 'VTX2-010']);
  assert.equal(gasAction, 'team_status_sync');
});

test('7. Global Cross-Instance Upload Semaphore enforces DB slot ceiling and releases on completion/error', async () => {
  const stage = createInMemoryStage();
  let active = 0;
  let peak = 0;

  // Launch 15 simulated parallel serverless instances against global cap of 4 slots
  const tasks = Array.from({ length: 15 }, (_, i) => {
    const attemptId = crypto.randomUUID();
    return withGlobalUploadSlot(
      attemptId,
      async () => {
        active++;
        if (active > peak) peak = active;
        await new Promise((r) => setTimeout(r, 35));
        active--;
        if (i === 7) throw new Error('Simulated instance crash mid-upload');
        return i;
      },
      { callRpcFn: stage.callRpcFn, maxSlots: 4, maxWaitRetries: 15 }
    ).catch((err) => ({ err: err.message }));
  });

  const outcomes = await Promise.all(tasks);
  assert.ok(peak <= 4, `Expected global slot cap <= 4 across simulated instances, observed ${peak}`);
  const succeeded = outcomes.filter((x) => typeof x === 'number').length;
  assert.equal(succeeded, 14, '14 healthy uploads + 1 failed slot must all release cleanly');
});

test('8. Single-Round 012 SQL migration, rollback, and Apps Script safety contracts', async () => {
  const sql012 = await fs.readFile(path.resolve('backend_sql/012_single_round_conversion.sql'), 'utf8');
  const sql012Rollback = await fs.readFile(path.resolve('backend_sql/012_rollback.sql'), 'utf8');
  const gasCode = await fs.readFile(path.resolve('google_apps_script/Code.gs'), 'utf8');

  assert.match(sql012, /max_teams_cap\s+INT\s+NOT NULL\s+DEFAULT\s+60/i);
  assert.match(sql012, /payment_reservation_minutes\s+INT\s+NOT NULL\s+DEFAULT\s+5/i);
  assert.match(sql012, /2026-12-12T23:59:59\+05:30/);
  assert.match(sql012, /round2_payment_open\s*=\s*false/i);
  assert.match(sql012, /round2_fee_per_member\s*=\s*500/i);
  assert.match(sql012, /idx_teams_unique_active_utr/i);
  assert.match(sql012, /idx_teams_idempotency_key/i);
  assert.match(sql012, /CREATE TABLE IF NOT EXISTS public\.checkout_reservations/i);
  assert.match(sql012, /reserve_checkout_slot/i);
  assert.match(sql012, /preflight_paid_registration/i);
  assert.match(sql012, /complete_paid_registration/i);
  assert.match(sql012, /EXPIRED_WITH_UTR/i);
  assert.match(sql012, /admin_grant_payment_access/i);
  assert.match(sql012, /Registration submitted successfully!/);
  assert.match(sql012Rollback, /ppt_deadline_override\s*=\s*'AUTO'/i);
  assert.match(sql012Rollback, /DROP INDEX IF EXISTS public\.idx_teams_unique_active_utr/i);
  assert.match(sql012Rollback, /DROP FUNCTION IF EXISTS public\.complete_paid_registration/i);
  assert.doesNotMatch(gasCode, /MailApp\./);
  assert.doesNotMatch(gasCode, /passcode_recovery_email/);
  assert.match(gasCode, /team_status_sync/);
});

test('9. Auto sync job drain dispatches REGISTER_SYNC and STATUS_SHEET_SYNC cleanly', async () => {
  process.env.GAS_SHARED_SECRET = 'test_shared_secret_123';
  process.env.GAS_WEBHOOK_URL = 'https://mock-gas.local/exec';
  const patchedJobs = [];
  const actionsSent = [];

  const drained = await drainDueSyncJobs({
    limit: 5,
    callRpcFn: async (fnName) => {
      if (fnName === 'claim_due_sync_jobs') {
        return [
          {
            id: 'job-auto-1',
            job_type: 'REGISTER_SYNC',
            team_id: 'VTX2-001',
            team: { team_id: 'VTX2-001', team_name: 'Sync Squad', track_id: 'track_01', problem_code: 'VTX-T1-01', academic_tier: 'tier_b', is_paid_verified: false, round1_status: 'pending' },
            members: makeThreeMembers()
          },
          {
            id: 'job-auto-2',
            job_type: 'STATUS_SHEET_SYNC',
            team_id: 'VTX2-001',
            team: { team_id: 'VTX2-001', is_paid_verified: true, utr_number: '123456789012', round1_status: 'shortlisted' }
          }
        ];
      }
      return null;
    },
    queryRestFn: async (path, opts) => {
      patchedJobs.push({ path, body: opts?.body });
      return [];
    },
    fetchImpl: async (_url, init) => {
      const parsed = JSON.parse(String(init.body || '{}'));
      actionsSent.push(parsed.action);
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }
  });
  delete process.env.GAS_SHARED_SECRET;
  delete process.env.GAS_WEBHOOK_URL;

  assert.equal(drained.processed, 2);
  assert.equal(drained.synced, 2);
  assert.deepEqual(actionsSent, ['register', 'team_status_sync']);
  assert.equal(patchedJobs.filter((p) => p.body?.status === 'SYNCED').length, 2);
});

test('11. Production auth allowlist, phased 010/011 SQL compatibility, and waitlist normalization', async () => {
  assert.ok(
    AUTHORIZED_COORDINATOR_EMAILS.includes('admin@veltraxx.com'),
    'Live Supabase auth account admin@veltraxx.com must be in AUTHORIZED_COORDINATOR_EMAILS',
  );

  const sql010 = await fs.readFile(path.resolve('backend_sql/010_production_hardening_v2.sql'), 'utf8');
  const sql011 = await fs.readFile(path.resolve('backend_sql/011_revoke_legacy_rpcs.sql'), 'utf8');
  const sqlRollback = await fs.readFile(path.resolve('backend_sql/010_rollback.sql'), 'utf8');

  assert.match(sql010, /admin@veltraxx\.com/i);
  assert.doesNotMatch(sql010, /REVOKE ALL ON FUNCTION public\.register_free_team\(/i);
  assert.doesNotMatch(sql010, /DROP FUNCTION IF EXISTS public\.lookup_team_for_ppt/i);
  assert.match(sql011, /REVOKE ALL ON FUNCTION public\.register_free_team\(/i);
  assert.match(sql011, /REVOKE ALL ON FUNCTION public\.submit_round1_ppt\(/i);
  assert.match(sql011, /DROP FUNCTION IF EXISTS public\.lookup_team_for_ppt/i);
  assert.match(sql011, /DROP FUNCTION IF EXISTS public\.lookup_team_by_contact/i);
  assert.match(sqlRollback, /GRANT EXECUTE ON FUNCTION public\.register_free_team/i);
  assert.match(sqlRollback, /GRANT EXECUTE ON FUNCTION public\.submit_round1_ppt/i);

  // Verify adminUpdateTeamStatus normalizes legacy 'waitlist' value to DB-constrained 'waitlisted'
  const teamId = `VTX2-WAIT-${Date.now()}`;
  const originalFetch = global.fetch;
  let capturedBody = null;
  global.fetch = async (url, init = {}) => {
    capturedBody = JSON.parse(String(init.body || '{}'));
    return new Response(JSON.stringify({ success: true, team_id: teamId, round1_status: capturedBody.p_status }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };
  try {
    const res = await adminUpdateTeamStatus('mock-valid-jwt-token', teamId, 'waitlist', false);
    assert.equal(res.success, true);
    assert.equal(capturedBody.p_team_id, teamId);
    assert.equal(capturedBody.p_status, 'waitlisted');
    assert.equal(capturedBody.p_is_shortlisted, false);
  } finally {
    global.fetch = originalFetch;
  }
});

test('12. Coordinator roster surfacing on 401/network failure and no-store cache headers', async () => {
  const originalFetch = global.fetch;
  const captured = [];

  global.fetch = async (url, init = {}) => {
    captured.push({ url: String(url), init });
    return new Response(JSON.stringify({ message: 'JWT expired' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  };

  try {
    await assert.rejects(
      () => getTrackerRoster('expired-jwt-token'),
      /UNAUTHORIZED/i,
    );
    assert.equal(captured.length, 1);
    assert.equal(captured[0].init.cache, 'no-store');
    assert.equal(captured[0].init.body, '{}');
    assert.match(captured[0].url, /get_coordinator_roster/);
  } finally {
    global.fetch = originalFetch;
  }
});

test('13. Concurrent unified paid registrations allocate unique Team IDs & capacity blocks overflow while preserving late UTR', async () => {
  const stage = createInMemoryStage({ maxCap: 5 });
  const pngBuf = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(32, 1)]);

  const regCalls = Array.from({ length: 6 }, (_, idx) => handleUnifiedPaidRegistration({
    draft: {
      team_name: `Concurrent Paid Team ${idx}`,
      track_id: 'track_01',
      problem_code: 'VTX-T1-01',
      team_size: 3,
      members: makeThreeMembers({
        0: { email: `lead${idx}@psgtech.ac.in`, phone: `984215400${idx}` },
        1: { email: `mem1_${idx}@psgtech.ac.in`, phone: `984215410${idx}` },
        2: { email: `mem2_${idx}@psgtech.ac.in`, phone: `984215420${idx}` }
      })
    },
    utrNumber: `98327182910${idx}`,
    idempotencyKey: `idem-conc-${idx}`,
    consentAccepted: true,
    buffer: pngBuf,
    clientIp: `10.0.0.${idx + 1}`
  }, {
    callRpcFn: stage.callRpcFn,
    queryRestFn: async () => [{ id: `job-${idx}` }],
    uploadDriveFn: async () => ({ fileId: `drv_c_${idx}` }),
    driveCfg: { receiptsFolderId: 'fin', rootFolderId: 'judg' },
    dispatchGasFn: async () => ({ synced: true }),
    drainSyncFn: async () => ({})
  }));

  const regResults = await Promise.all(regCalls);
  const succeeded = regResults.filter((r) => r.status === 200 && r.body.success === true);
  const capped = regResults.filter((r) => r.status === 409 && r.body.code === 'CAPACITY_WITH_UTR_LOGGED');

  assert.equal(succeeded.length, 5, 'Exactly maxCap (5) teams must succeed');
  assert.equal(capped.length, 1, '6th simultaneous team past capacity must return 409 with UTR preserved');
  assert.equal(new Set(succeeded.map((r) => r.body.team_id)).size, 5);
});

test('14. Admin Delete Permanently (auth, confirm gate, Drive cleanup, count update) & Preview write shield', async () => {
  // 1) Client-side explicit confirmation gate
  await assert.rejects(
    () => adminDeleteTeam('mock-jwt-token', 'VTX2-SYN-01'),
    /CONFIRMATION_REQUIRED/i,
  );

  // 2) Server-side authorization & confirmation gates
  const unauthRes = await handleDeleteTeamRequest({ team_id: 'VTX2-SYN-01', confirm: true }, null);
  assert.equal(unauthRes.status, 401);

  const unconfirmedRes = await handleDeleteTeamRequest(
    { team_id: 'VTX2-SYN-01', confirm: false },
    { email: 'admin@veltraxx.com' },
  );
  assert.equal(unconfirmedRes.status, 400);
  assert.equal(unconfirmedRes.body.code, 'CONFIRMATION_REQUIRED');

  // 3) Synthetic delete removes team Drive files + team subfolders, keeps parent problem folder, & updates remaining count
  const syntheticTeams = [
    {
      team_id: 'VTX2-SYN-01',
      problem_code: 'VTX-T1-01',
      ppt_drive_file_id: 'file_syn_ppt_v2',
      round2_receipt_drive_file_id: 'file_syn_rcpt_1',
      ppt_pdf_drive_url: 'https://drive.google.com/file/d/file_syn_ppt_v1/preview',
    },
    {
      team_id: 'VTX2-KEEP-01',
      problem_code: 'VTX-T1-01',
    },
  ];
  const deletedDriveCalls = [];
  process.env.GOOGLE_CLIENT_ID = 'cid';
  process.env.GOOGLE_CLIENT_SECRET = 'csec';
  process.env.GOOGLE_REFRESH_TOKEN = 'rtok';
  process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID = 'root_judging_id';
  process.env.GOOGLE_DRIVE_RECEIPTS_FOLDER_ID = 'root_finance_id';

  const mockDriveFetch = async (url, init = {}) => {
    const u = String(url);
    if (u.includes('oauth2.googleapis.com/token')) {
      return new Response(JSON.stringify({ access_token: 'mock_tok', expires_in: 3600 }), { status: 200 });
    }
    if (init.method === 'DELETE') {
      const id = u.split('/files/')[1].split('?')[0];
      deletedDriveCalls.push(id);
      return new Response(null, { status: 204 });
    }
    // Drive folder queries
    if (u.includes(encodeURIComponent(JUDGING_DRIVE_FOLDERS.CONFIRMED_SUBMISSIONS))) {
      return new Response(JSON.stringify({ files: [{ id: 'folder_confirmed_root' }] }), { status: 200 });
    }
    if (u.includes(encodeURIComponent(JUDGING_DRIVE_FOLDERS.ARCHIVED_VERSIONS))) {
      return new Response(JSON.stringify({ files: [{ id: 'folder_archive_root' }] }), { status: 200 });
    }
    if (u.includes(encodeURIComponent('VTX-T1-01'))) {
      return new Response(JSON.stringify({ files: [{ id: 'folder_problem_bucket_t1_01' }] }), { status: 200 });
    }
    if (u.includes(encodeURIComponent('VTX2-SYN-01')) && u.includes('folder_problem_bucket_t1_01')) {
      return new Response(JSON.stringify({ files: [{ id: 'folder_team_syn_01' }] }), { status: 200 });
    }
    return new Response(JSON.stringify({ files: [] }), { status: 200 });
  };

  try {
    const delRes = await handleDeleteTeamRequest(
      { team_id: 'VTX2-SYN-01', confirm: true },
      { email: 'admin@veltraxx.com' },
      {
        queryRestFn: async (q) => {
          if (q.startsWith('teams?team_id=eq.')) {
            return syntheticTeams.filter((t) => t.team_id === 'VTX2-SYN-01');
          }
          if (q.startsWith('ppt_submissions?team_id=eq.')) {
            return [{ drive_file_id: 'file_syn_ppt_v1' }, { drive_file_id: 'file_syn_ppt_v2' }];
          }
          if (q === 'teams?select=team_id') {
            return syntheticTeams;
          }
          return [];
        },
        callRpcFn: async (fn, params) => {
          if (fn === 'admin_delete_team') {
            const idx = syntheticTeams.findIndex((t) => t.team_id === params.p_team_id);
            if (idx >= 0) syntheticTeams.splice(idx, 1);
            return { success: true, deleted_count: 1, team_id: params.p_team_id };
          }
          return {};
        },
        deleteDriveFn: (args) => deleteDriveArtifactsForTeam(args, mockDriveFetch),
      },
    );

    assert.equal(delRes.status, 200);
    assert.equal(delRes.body.success, true);
    assert.equal(delRes.body.remaining_teams_count, 1);
    assert.equal(syntheticTeams.length, 1);
    assert.equal(syntheticTeams[0].team_id, 'VTX2-KEEP-01');
    assert.ok(deletedDriveCalls.includes('file_syn_ppt_v2'));
    assert.ok(deletedDriveCalls.includes('file_syn_ppt_v1'));
    assert.ok(deletedDriveCalls.includes('file_syn_rcpt_1'));
    assert.ok(deletedDriveCalls.includes('folder_team_syn_01'));
    assert.ok(!deletedDriveCalls.includes('root_judging_id'));
    assert.ok(!deletedDriveCalls.includes('folder_problem_bucket_t1_01'));
  } finally {
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
    delete process.env.GOOGLE_REFRESH_TOKEN;
    delete process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
    delete process.env.GOOGLE_DRIVE_RECEIPTS_FOLDER_ID;
  }

  // 4) Vercel Preview Deployment write shield against Production Supabase
  const prevEnv = process.env.VERCEL_ENV;
  const prevSupaUrl = process.env.SUPABASE_URL;
  process.env.VERCEL_ENV = 'preview';
  process.env.SUPABASE_URL = 'https://krkiwilhwppqauyhwlcw.supabase.co';
  try {
    assert.throws(
      () => assertServerWritable('Team deletion'),
      (err) => err.status === 403 && err.code === 'PREVIEW_READ_ONLY',
    );
    await assert.rejects(
      () => handleDeleteTeamRequest({ team_id: 'VTX2-SYN-01', confirm: true }, { email: 'admin@veltraxx.com' }),
      (err) => err.status === 403 && err.code === 'PREVIEW_READ_ONLY',
    );
  } finally {
    if (prevEnv === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = prevEnv;
    if (prevSupaUrl === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = prevSupaUrl;
  }
});
