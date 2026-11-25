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
function createInMemoryStage({ pptOpen = true, regOpen = true, graceMinutes = 10 } = {}) {
  let seq = 0;
  const teams = new Map();
  const attempts = new Map();
  const rateBuckets = new Map();
  const submissions = new Map(); // teamId -> []
  const driveFiles = new Map();
  const uploadSlots = new Set(); // active attemptIds holding global slots
  let windowEnd = new Date(Date.now() + 3600 * 1000);
  let pptOverride = 'AUTO';

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

    if (name === 'register_free_team_v2') {
      if (!regOpen) return { success: false, error: 'Round 1 registration window is currently closed.' };
      const emails = new Set();
      const phones = new Set();
      for (const m of params.p_members) {
        const em = String(m.email || '').toLowerCase();
        const ph = String(m.phone || '').slice(-10);
        if (emails.has(em) || phones.has(ph)) {
          return { success: false, error: 'Duplicate email or phone within squad.' };
        }
        emails.add(em);
        phones.add(ph);
        for (const t of teams.values()) {
          if (t.members.some((ex) => ex.email === em || ex.phone === ph)) {
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
      seq += 1;
      const teamId = `VTX2-${String(seq).padStart(3, '0')}`;
      teams.set(teamId, {
        team_id: teamId,
        team_name: params.p_team_name,
        track_id: params.p_track_id,
        problem_code: params.p_problem_code,
        academic_tier: params.p_members.some((m) => ['3rd', '4th', '5th'].includes(m.year_of_study) || m.level !== 'UG') ? 'tier_b' : 'tier_a',
        passcode: String(params.p_ppt_passcode_plain).toUpperCase(),
        round1_status: 'pending',
        ppt_current_version: 0,
        ppt_receipt_id: null,
        ppt_drive_file_id: null,
        ppt_file_name: null,
        ppt_submitted_at: null,
        members: params.p_members.map((m) => ({ ...m, email: m.email.toLowerCase(), phone: m.phone.slice(-10) }))
      });
      submissions.set(teamId, []);
      return { success: true, team_id: teamId, team_name: params.p_team_name, academic_tier: teams.get(teamId).academic_tier };
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

test('2. Registration validation, duplicate blocking, non-blocking GAS failure tolerance', async () => {
  const stage = createInMemoryStage();
  let gasCalls = 0;

  // Successful registration even when GAS email/sheet sync fails
  const regRes = await handleRegisterRequest(
    {
      team_name: 'Silicon Knights',
      track_id: 'track_01',
      problem_code: 'VTX-T1-01',
      team_size: 3,
      members: makeThreeMembers()
    },
    '10.0.0.1',
    {
      callRpcFn: stage.callRpcFn,
      queryRestFn: async () => [{ id: 'job-1' }],
      dispatchGasFn: async () => {
        gasCalls++;
        return { synced: false, error: 'GAS_TIMEOUT' };
      }
    }
  );

  assert.equal(regRes.status, 200);
  assert.equal(regRes.body.success, true);
  assert.equal(regRes.body.team_id, 'VTX2-001');
  assert.equal(regRes.body.team_passcode.length, 8);
  assert.equal(regRes.body.email_sync_status, 'queued');
  assert.equal(gasCalls, 1);

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
    { callRpcFn: stage.callRpcFn, queryRestFn: async () => [], dispatchGasFn: async () => ({ synced: true }) }
  );
  assert.equal(dupRes.status, 400);
  assert.equal(dupRes.body.success, false);

  // Unresolved "Other" rejected
  const otherRes = await handleRegisterRequest(
    {
      team_name: 'Custom Squad',
      track_id: 'track_01',
      problem_code: 'VTX-T1-02',
      team_size: 3,
      members: makeThreeMembers({
        0: { email: 'x1@a.com', phone: '9000000001', degree: 'Other' },
        1: { email: 'x2@a.com', phone: '9000000002' },
        2: { email: 'x3@a.com', phone: '9000000003' }
      })
    },
    '10.0.0.3',
    { callRpcFn: stage.callRpcFn, queryRestFn: async () => [], dispatchGasFn: async () => ({ synced: true }) }
  );
  assert.equal(otherRes.status, 400);
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

test('4. End-to-End PPT Upload, Replacement Safety (v2 failure preserves v1), and Privacy-Preserving Recovery', async () => {
  const stage = createInMemoryStage();
  const reg = await handleRegisterRequest(
    { team_name: 'Verilog Team', track_id: 'track_01', problem_code: 'VTX-T1-01', team_size: 3, members: makeThreeMembers() },
    '1.1.1.1',
    { callRpcFn: stage.callRpcFn, queryRestFn: async () => [], dispatchGasFn: async () => ({ synced: true }) }
  );
  const teamId = reg.body.team_id;
  const passcode = reg.body.team_passcode;

  // Wrong passcode blocked (401)
  const pdf1 = await makeObjectStreamPdf(6);
  const sha1 = crypto.createHash('sha256').update(pdf1).digest('hex');
  const badAuth = await handleInitiatePpt(
    { team_id: teamId, passcode: 'WRONGPASS', file_name: 'deck.pdf', file_size: pdf1.length, file_sha256: sha1, page_count: 6, extracted_text: 'test', idempotency_key: 'idem_bad_001' },
    '1.1.1.1',
    { callRpcFn: stage.callRpcFn }
  );
  assert.equal(badAuth.status, 401);

  // Valid Initiate + Upload v1
  const init1 = await handleInitiatePpt(
    { team_id: teamId, passcode, file_name: 'deck_v1.pdf', file_size: pdf1.length, file_sha256: sha1, page_count: 6, extracted_text: 'arch', idempotency_key: 'idem_v1_0001' },
    '1.1.1.1',
    { callRpcFn: stage.callRpcFn }
  );
  assert.equal(init1.status, 200);

  const up1 = await handlePptUpload({
    attemptId: init1.body.attempt_id,
    attemptToken: init1.body.attempt_token,
    teamId,
    buffer: pdf1,
    deps: {
      callRpcFn: stage.callRpcFn,
      queryRestFn: async () => [],
      driveCfg: { rootFolderId: 'root123' },
      dispatchGasFn: async () => ({ synced: true }),
      uploadDriveFn: async ({ fileName, buffer }) => ({
        fileId: 'drive_file_v1',
        fileName,
        sizeBytes: buffer.length,
        previewUrl: 'https://drive.google.com/file/d/drive_file_v1/preview',
        folderUrl: 'https://drive.google.com/drive/folders/folder1'
      })
    }
  });
  assert.equal(up1.status, 200);
  assert.equal(up1.body.receipt.version, 1);

  // Idempotent replay of exact same key returns existing v1 receipt without uploading again
  const replay1 = await handleInitiatePpt(
    { team_id: teamId, passcode, file_name: 'deck_v1.pdf', file_size: pdf1.length, file_sha256: sha1, page_count: 6, extracted_text: 'arch', idempotency_key: 'idem_v1_0001' },
    '1.1.1.1',
    { callRpcFn: stage.callRpcFn }
  );
  assert.equal(replay1.body.already_confirmed, true);
  assert.equal(replay1.body.receipt.version, 1);

  // Failed replacement v2 (Drive failure) -> v1 MUST REMAIN INTACT
  const pdf2 = await makeObjectStreamPdf(7);
  const sha2 = crypto.createHash('sha256').update(pdf2).digest('hex');
  const init2 = await handleInitiatePpt(
    { team_id: teamId, passcode, file_name: 'deck_v2.pdf', file_size: pdf2.length, file_sha256: sha2, page_count: 7, extracted_text: 'arch v2', idempotency_key: 'idem_v2_fail' },
    '1.1.1.1',
    { callRpcFn: stage.callRpcFn }
  );
  const up2Fail = await handlePptUpload({
    attemptId: init2.body.attempt_id,
    attemptToken: init2.body.attempt_token,
    teamId,
    buffer: pdf2,
    deps: {
      callRpcFn: stage.callRpcFn,
      queryRestFn: async () => [],
      driveCfg: { rootFolderId: 'root123' },
      dispatchGasFn: async () => ({ synced: true }),
      uploadDriveFn: async () => {
        const err = new Error('Simulated Google Drive outage');
        err.status = 503;
        throw err;
      }
    }
  });
  assert.equal(up2Fail.status, 503);
  assert.match(up2Fail.body.error, /previous submission remains safe/i);

  // Verify status endpoint still confirms v1 as official submission!
  const statusCheck = await handlePptStatus({ team_id: teamId, passcode }, '1.1.1.1', { callRpcFn: stage.callRpcFn });
  assert.equal(statusCheck.status, 200);
  assert.equal(statusCheck.body.receipt.version, 1);
  assert.equal(statusCheck.body.receipt.file_name, 'deck_v1.pdf');

  // Privacy-preserving Team ID recovery: email-only rejected; email+phone succeeds
  const badRec = await handleTeamRecovery({ mode: 'id', email: 'arun@psgtech.ac.in', phone: '1111111111' }, '1.1.1.1', { callRpcFn: stage.callRpcFn });
  assert.equal(badRec.status, 404);
  const okRec = await handleTeamRecovery({ mode: 'id', email: 'arun@psgtech.ac.in', phone: '9842154321' }, '1.1.1.1', { callRpcFn: stage.callRpcFn });
  assert.equal(okRec.status, 200);
  assert.equal(okRec.body.team_id, teamId);
});

test('5. Deadline enforcement, 10-minute grace period, and post-deadline block', async () => {
  const stage = createInMemoryStage({ graceMinutes: 10 });
  const reg = await handleRegisterRequest(
    { team_name: 'Grace Squad', track_id: 'track_01', problem_code: 'VTX-T1-01', team_size: 3, members: makeThreeMembers() },
    '2.2.2.2',
    { callRpcFn: stage.callRpcFn, queryRestFn: async () => [], dispatchGasFn: async () => ({ synced: true }) }
  );
  const teamId = reg.body.team_id;
  const passcode = reg.body.team_passcode;
  const pdf = await makeObjectStreamPdf(5);
  const sha = crypto.createHash('sha256').update(pdf).digest('hex');

  // 1. Initiate 5 seconds before deadline
  stage.setWindowEnd(new Date(Date.now() + 5000));
  const preDeadlineInit = await handleInitiatePpt(
    { team_id: teamId, passcode, file_name: 'grace.pdf', file_size: pdf.length, file_sha256: sha, page_count: 5, extracted_text: 'grace', idempotency_key: 'idem_grace_01' },
    '2.2.2.2',
    { callRpcFn: stage.callRpcFn }
  );
  assert.equal(preDeadlineInit.status, 200);

  // 2. Simulate deadline passing 2 seconds ago -> NEW initiate MUST BE BLOCKED (403)
  stage.setWindowEnd(new Date(Date.now() - 2000));
  const postDeadlineInit = await handleInitiatePpt(
    { team_id: teamId, passcode, file_name: 'late.pdf', file_size: pdf.length, file_sha256: sha, page_count: 5, extracted_text: 'late', idempotency_key: 'idem_late_02' },
    '2.2.2.2',
    { callRpcFn: stage.callRpcFn }
  );
  assert.equal(postDeadlineInit.status, 403);
  assert.equal(postDeadlineInit.body.code, 'WINDOW_CLOSED');

  // 3. Previously initiated attempt STILL completes within 10-min grace window!
  const graceUpload = await handlePptUpload({
    attemptId: preDeadlineInit.body.attempt_id,
    attemptToken: preDeadlineInit.body.attempt_token,
    teamId,
    buffer: pdf,
    deps: {
      callRpcFn: stage.callRpcFn,
      queryRestFn: async () => [],
      driveCfg: { rootFolderId: 'root' },
      dispatchGasFn: async () => ({ synced: true }),
      uploadDriveFn: async ({ fileName, buffer }) => ({
        fileId: 'drive_grace_1',
        fileName,
        sizeBytes: buffer.length,
        previewUrl: 'https://drive.google.com/file/d/drive_grace_1/preview',
        folderUrl: 'https://drive.google.com/drive/folders/f1'
      })
    }
  });
  assert.equal(graceUpload.status, 200);
  assert.equal(graceUpload.body.receipt.status, 'CONFIRMED');
});

test('6. Simulated Concurrency Bursts (50, 100, and 200 simultaneous uploads with retry backoff)', async () => {
  resetDriveTokenCacheForTests();
  const pdf = await makeObjectStreamPdf(6);
  const sha = crypto.createHash('sha256').update(pdf).digest('hex');

  for (const burstSize of [50, 100, 200]) {
    const stage = createInMemoryStage();
    const creds = [];
    for (let i = 0; i < burstSize; i++) {
      const reg = await handleRegisterRequest(
        {
          team_name: `Burst Team ${i}`,
          track_id: 'track_01',
          problem_code: 'VTX-T1-01',
          team_size: 3,
          members: makeThreeMembers({
            0: { email: `l_${burstSize}_${i}@siet.ac.in`, phone: String(9000000000 + i * 3 + 1) },
            1: { email: `m2_${burstSize}_${i}@siet.ac.in`, phone: String(9000000000 + i * 3 + 2) },
            2: { email: `m3_${burstSize}_${i}@siet.ac.in`, phone: String(9000000000 + i * 3 + 3) }
          })
        },
        `10.1.${Math.floor(i / 250)}.${i % 250}`,
        { callRpcFn: stage.callRpcFn, queryRestFn: async () => [], dispatchGasFn: async () => ({ synced: true }) }
      );
      creds.push({ teamId: reg.body.team_id, passcode: reg.body.team_passcode });
    }

    let maxConcurrentDrive = 0;
    let currentDrive = 0;
    let injected429Count = 0;
    const startMs = Date.now();

    const results = await Promise.all(
      creds.map(async (c, idx) => {
        const init = await handleInitiatePpt(
          {
            team_id: c.teamId,
            passcode: c.passcode,
            file_name: `deck_${c.teamId}.pdf`,
            file_size: pdf.length,
            file_sha256: sha,
            page_count: 6,
            extracted_text: 'burst',
            idempotency_key: `burst_${burstSize}_${idx}`
          },
          `10.2.0.${idx % 200}`,
          { callRpcFn: stage.callRpcFn }
        );
        if (init.status !== 200) return init;

        return await handlePptUpload({
          attemptId: init.body.attempt_id,
          attemptToken: init.body.attempt_token,
          teamId: c.teamId,
          buffer: pdf,
          deps: {
            callRpcFn: stage.callRpcFn,
            queryRestFn: async () => [],
            driveCfg: { rootFolderId: 'root' },
            dispatchGasFn: async () => ({ synced: true }),
            uploadDriveFn: async ({ fileName, buffer }) => {
              return await withDriveConcurrency(async () => {
                return await retryWithBackoff(async (attemptNo) => {
                  currentDrive++;
                  if (currentDrive > maxConcurrentDrive) maxConcurrentDrive = currentDrive;
                  await new Promise((r) => setTimeout(r, 8));
                  currentDrive--;
                  // Inject simulated transient 429 on 10% of first attempts
                  if (idx % 10 === 0 && attemptNo === 0) {
                    injected429Count++;
                    const err = new Error('Simulated Drive 429');
                    err.status = 429;
                    throw err;
                  }
                  return {
                    fileId: `drv_${c.teamId}`,
                    fileName,
                    sizeBytes: buffer.length,
                    previewUrl: `https://drive.google.com/file/d/drv_${c.teamId}/preview`,
                    folderUrl: 'https://drive.google.com/drive/folders/r'
                  };
                }, { baseDelayMs: 15, maxDelayMs: 60 });
              });
            }
          }
        });
      })
    );

    const elapsedMs = Date.now() - startMs;
    const confirmedCount = results.filter((r) => r.status === 200 && r.body?.receipt?.status === 'CONFIRMED').length;
    assert.equal(confirmedCount, burstSize, `All ${burstSize} burst uploads must succeed after bounded retry/concurrency`);
    assert.ok(maxConcurrentDrive <= 12, `Bounded concurrency violated: observed ${maxConcurrentDrive}`);
    console.log(`[SIMULATED BURST ${burstSize}] Confirmed: ${confirmedCount}/${burstSize} | Max Concurrent Drive Calls: ${maxConcurrentDrive} (cap 12) | 429 Retries Recovered: ${injected429Count} | Elapsed: ${elapsedMs}ms`);
  }
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

test('8. Grace-period anti-abuse: failed attempt cannot reuse grace & prior initiated sessions supersede cleanly', async () => {
  const stage = createInMemoryStage({ graceMinutes: 10 });
  const reg = await handleRegisterRequest(
    { team_name: 'Anti Abuse Squad', track_id: 'track_01', problem_code: 'VTX-T1-01', team_size: 3, members: makeThreeMembers() },
    '3.3.3.3',
    { callRpcFn: stage.callRpcFn, queryRestFn: async () => [], dispatchGasFn: async () => ({ synced: true }) }
  );
  const { team_id: teamId, team_passcode: passcode } = reg.body;
  const pdfA = await makeObjectStreamPdf(4);
  const shaA = crypto.createHash('sha256').update(pdfA).digest('hex');

  stage.setWindowEnd(new Date(Date.now() + 10000));
  const firstInit = await handleInitiatePpt(
    { team_id: teamId, passcode, file_name: 'draft1.pdf', file_size: pdfA.length, file_sha256: shaA, page_count: 4, extracted_text: 'a', idempotency_key: 'abuse_key_1' },
    '3.3.3.3',
    { callRpcFn: stage.callRpcFn }
  );
  const secondInit = await handleInitiatePpt(
    { team_id: teamId, passcode, file_name: 'draft2.pdf', file_size: pdfA.length, file_sha256: shaA, page_count: 4, extracted_text: 'b', idempotency_key: 'abuse_key_2' },
    '3.3.3.3',
    { callRpcFn: stage.callRpcFn }
  );

  // Attempting to upload with superseded firstInit MUST fail
  const staleUpload = await handlePptUpload({
    attemptId: firstInit.body.attempt_id,
    attemptToken: firstInit.body.attempt_token,
    teamId,
    buffer: pdfA,
    deps: { callRpcFn: stage.callRpcFn, queryRestFn: async () => [], driveCfg: { rootFolderId: 'root' } }
  });
  assert.equal(staleUpload.status, 400);
  assert.equal(staleUpload.body.code, 'ATTEMPT_NOT_REUSABLE');

  // Fail secondInit mid-upload after window closes -> cannot reuse same attempt_id inside grace period
  stage.setWindowEnd(new Date(Date.now() - 1000));
  const failGrace = await handlePptUpload({
    attemptId: secondInit.body.attempt_id,
    attemptToken: secondInit.body.attempt_token,
    teamId,
    buffer: pdfA,
    deps: {
      callRpcFn: stage.callRpcFn,
      queryRestFn: async () => [],
      driveCfg: { rootFolderId: 'root' },
      uploadDriveFn: async () => {
        const e = new Error('Simulated timeout');
        e.status = 503;
        throw e;
      }
    }
  });
  assert.equal(failGrace.status, 503);

  const retrySameAttempt = await handlePptUpload({
    attemptId: secondInit.body.attempt_id,
    attemptToken: secondInit.body.attempt_token,
    teamId,
    buffer: pdfA,
    deps: { callRpcFn: stage.callRpcFn, queryRestFn: async () => [], driveCfg: { rootFolderId: 'root' } }
  });
  assert.equal(retrySameAttempt.status, 400);
  assert.equal(retrySameAttempt.body.code, 'ATTEMPT_NOT_REUSABLE');
});

test('9. Phase 3 Google Drive judging path groups by problem code and archives prior versions on replacement', async () => {
  const stage = createInMemoryStage();
  const reg = await handleRegisterRequest(
    { team_name: 'Drive Layout Team', track_id: 'track_02', problem_code: 'VTX-T2-04', team_size: 3, members: makeThreeMembers() },
    '4.4.4.4',
    { callRpcFn: stage.callRpcFn, queryRestFn: async () => [], dispatchGasFn: async () => ({ synced: true }) }
  );
  const { team_id: teamId, team_passcode: passcode } = reg.body;
  const pdf = await makeObjectStreamPdf(6);
  const sha = crypto.createHash('sha256').update(pdf).digest('hex');

  const uploadedPaths = [];
  const archivedMoves = [];

  const runUpload = async (key, verId) => {
    const init = await handleInitiatePpt(
      { team_id: teamId, passcode, file_name: `deck_${verId}.pdf`, file_size: pdf.length, file_sha256: sha, page_count: 6, extracted_text: 'x', idempotency_key: key },
      '4.4.4.4',
      { callRpcFn: stage.callRpcFn }
    );
    return await handlePptUpload({
      attemptId: init.body.attempt_id,
      attemptToken: init.body.attempt_token,
      teamId,
      buffer: pdf,
      deps: {
        callRpcFn: stage.callRpcFn,
        queryRestFn: async () => [],
        driveCfg: { rootFolderId: 'drive_root_xyz' },
        dispatchGasFn: async () => ({ synced: true }),
        uploadDriveFn: async (args) => {
          uploadedPaths.push(args.folderPathSegments);
          return {
            fileId: `drive_${verId}`,
            fileName: args.fileName,
            sizeBytes: pdf.length,
            previewUrl: `https://drive.google.com/file/d/drive_${verId}/preview`,
            folderUrl: 'https://drive.google.com/drive/folders/confirmed'
          };
        },
        archiveDriveFn: async (moveArgs) => {
          archivedMoves.push(moveArgs);
          return { archived: true };
        }
      }
    });
  };

  const r1 = await runUpload('drv_key_1', 'v1');
  assert.equal(r1.status, 200);
  assert.deepEqual(uploadedPaths[0], [JUDGING_DRIVE_FOLDERS.CONFIRMED_SUBMISSIONS, 'VTX-T2-04', teamId]);
  assert.equal(archivedMoves.length, 0);

  const r2 = await runUpload('drv_key_2', 'v2');
  assert.equal(r2.status, 200);
  assert.deepEqual(uploadedPaths[1], [JUDGING_DRIVE_FOLDERS.CONFIRMED_SUBMISSIONS, 'VTX-T2-04', teamId]);
  assert.equal(archivedMoves.length, 1);
  assert.equal(archivedMoves[0].fileId, 'drive_v1');
  assert.equal(archivedMoves[0].problemCode, 'VTX-T2-04');
});

test('10. Auto sync job drain recovers queued jobs & passcode recovery rolls back cleanly when email fails', async () => {
  const stage = createInMemoryStage();
  const reg = await handleRegisterRequest(
    { team_name: 'Sync & Recovery Squad', track_id: 'track_01', problem_code: 'VTX-T1-01', team_size: 3, members: makeThreeMembers() },
    '5.5.5.5',
    { callRpcFn: stage.callRpcFn, queryRestFn: async () => [], dispatchGasFn: async () => ({ synced: true }) }
  );
  const { team_id: teamId, team_passcode: origPasscode } = reg.body;

  // Simulate failed recovery email -> old passcode MUST still work via rollback!
  const failedRec = await handleTeamRecovery(
    { mode: 'passcode', team_id: teamId, email: 'arun@psgtech.ac.in', phone: '9842154321' },
    '5.5.5.5',
    {
      callRpcFn: stage.callRpcFn,
      queryRestFn: async () => [{ id: 'rec-job-1' }],
      dispatchGasFn: async () => ({ synced: false, error: 'DAILY_MAIL_QUOTA_REACHED' })
    }
  );
  assert.equal(failedRec.status, 503);
  const checkOldStillWorks = await handlePptStatus(
    { team_id: teamId, passcode: origPasscode },
    '5.5.5.5',
    { callRpcFn: stage.callRpcFn }
  );
  assert.equal(checkOldStillWorks.status, 200);

  // Automatic drainDueSyncJobs with configured GAS secret claims and drains pending REGISTER_SYNC job
  process.env.GAS_SHARED_SECRET = 'test_shared_secret_123';
  process.env.GAS_WEBHOOK_URL = 'https://mock-gas.local/exec';
  const patchedJobs = [];
  const drained = await drainDueSyncJobs({
    limit: 5,
    callRpcFn: async (fnName) => {
      if (fnName === 'claim_due_sync_jobs') {
        return [{
          id: 'job-auto-1',
          job_type: 'REGISTER_SYNC',
          team_id: teamId,
          team: { team_id: teamId, team_name: 'Sync & Recovery Squad', track_id: 'track_01', problem_code: 'VTX-T1-01', academic_tier: 'tier_b' },
          members: makeThreeMembers()
        }];
      }
      return null;
    },
    queryRestFn: async (path, opts) => {
      patchedJobs.push({ path, body: opts?.body });
      return [];
    },
    fetchImpl: async () => new Response(JSON.stringify({ success: true }), { status: 200 })
  });
  delete process.env.GAS_SHARED_SECRET;
  delete process.env.GAS_WEBHOOK_URL;

  assert.equal(drained.processed, 1);
  assert.equal(drained.synced, 1);
  assert.ok(patchedJobs.some((p) => p.body?.status === 'SYNCED'));
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

test('13. Concurrent registrations, invalid credentials, admin deadline overrides, and duplicate upload lock', async () => {
  // 1) Concurrent registrations allocate unique Team IDs safely
  const stage = createInMemoryStage();
  const regCalls = Array.from({ length: 10 }, (_, idx) => handleRegisterRequest({
    team_name: `Concurrent Team ${idx}`,
    track_id: 'track_01',
    problem_code: 'VTX-T1-01',
    team_size: 3,
    members: makeThreeMembers({
      0: { email: `lead${idx}@psgtech.ac.in`, phone: `984215400${idx}` },
      1: { email: `mem1_${idx}@psgtech.ac.in`, phone: `984215410${idx}` },
      2: { email: `mem2_${idx}@psgtech.ac.in`, phone: `984215420${idx}` },
    }),
  }, `10.0.0.${idx + 1}`, {
    callRpcFn: stage.callRpcFn,
    queryRestFn: async () => [{ id: `job-${idx}` }],
    dispatchGasFn: async () => ({ synced: true }),
    drainSyncFn: async () => ({}),
  }));

  const regResults = await Promise.all(regCalls);
  assert.equal(regResults.length, 10);
  const ids = new Set(regResults.map((r) => r.body.team_id));
  assert.equal(ids.size, 10, 'All concurrent registrations must yield unique Team IDs');
  assert.ok(regResults.every((r) => r.status === 200 && r.body.success === true));

  // 2) Invalid credentials -> HTTP 401
  const fakeSha = 'a'.repeat(64);
  const invalidCredsRes = await handleInitiatePpt({
    team_id: 'VTX2-022',
    passcode: 'WRONG',
    file_name: 'deck.pdf',
    file_size: 1024,
    file_sha256: fakeSha,
    page_count: 5,
    idempotency_key: 'idem-invalid-cred-1',
  }, '127.0.0.1', {
    callRpcFn: async (fn) => (fn === 'check_rate_limit'
      ? { allowed: true }
      : { success: false, code: 'INVALID_CREDENTIALS', error: 'Invalid Team ID or Passcode.' }),
  });
  assert.equal(invalidCredsRes.status, 401);

  // 3) Admin deadline override FORCE_CLOSED -> HTTP 403; FORCE_OPEN -> HTTP 200
  const closedRes = await handleInitiatePpt({
    team_id: 'VTX2-022',
    passcode: 'PASS22',
    file_name: 'deck.pdf',
    file_size: 1024,
    file_sha256: fakeSha,
    page_count: 5,
    idempotency_key: 'idem-force-closed-1',
  }, '127.0.0.1', {
    callRpcFn: async (fn) => (fn === 'check_rate_limit'
      ? { allowed: true }
      : { success: false, code: 'WINDOW_CLOSED', error: 'PPT portal forced closed by coordinator.' }),
  });
  assert.equal(closedRes.status, 403);

  const openRes = await handleInitiatePpt({
    team_id: 'VTX2-022',
    passcode: 'PASS22',
    file_name: 'deck.pdf',
    file_size: 1024,
    file_sha256: fakeSha,
    page_count: 5,
    idempotency_key: 'idem-force-open-1',
  }, '127.0.0.1', {
    callRpcFn: async (fn) => (fn === 'check_rate_limit'
      ? { allowed: true }
      : { success: true, attempt_id: 'att-open-1', attempt_token: 'tok-open-1' }),
  });
  assert.equal(openRes.status, 200);

  // 4) Duplicate / in-flight upload attempt -> HTTP 409
  const pdfBuf = await makeObjectStreamPdf(3);
  const dupUploadRes = await handlePptUpload({
    attemptId: 'att-open-1',
    attemptToken: 'tok-open-1',
    teamId: 'VTX2-022',
    buffer: pdfBuf,
    deps: {
      callRpcFn: async () => ({ success: false, code: 'DUPLICATE_IN_FLIGHT', error: 'Upload already in progress.' }),
    },
  });
  assert.equal(dupUploadRes.status, 409);
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
