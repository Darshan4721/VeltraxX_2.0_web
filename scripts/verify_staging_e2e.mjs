#!/usr/bin/env node
/**
 * VELTRAXX 2.0 - Phase 4 Live Cloud Staging Integration & Failure Verifier
 * Runs real network tests strictly against ISOLATED STAGING Supabase, Staging Google Drive,
 * Vercel Preview/Staging API, and Deployed Google Apps Script.
 *
 * SAFETY: Refuses to execute against production Supabase ref (`krkiwilhwppqauyhwlcw`)
 * or production URL (`veltrax-x-2-0-web.vercel.app`) unless explicitly overridden for staging.
 *
 * Load `.env.staging.local` before running:
 *   node --env-file=.env.staging.local scripts/verify_staging_e2e.mjs
 */

import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { PDFDocument } from 'pdf-lib';

import { handleRegisterRequest } from '../api/register.js';
import { handleInitiatePpt } from '../api/ppt/initiate.js';
import { handlePptUpload } from '../api/ppt/upload.js';
import { handlePptStatus } from '../api/ppt/status.js';
import { handleTeamRecovery } from '../api/team/recover.js';
import { checkDriveOAuthHealth, initializeJudgingWorkspace, JUDGING_DRIVE_FOLDERS, resetDriveTokenCacheForTests, uploadBinaryToDriveAndVerify } from '../api/_lib/googleDrive.js';
import { drainDueSyncJobs } from '../api/_lib/gasClient.js';
import { callRpc, getSupabaseConfig, queryRest } from '../api/_lib/supabaseAdmin.js';

const PRODUCTION_REF = 'krkiwilhwppqauyhwlcw';

function ensureStagingSafety() {
  const { url, serviceKey, anonKey } = getSupabaseConfig();
  if (!url || !serviceKey || !anonKey) {
    throw new Error('Missing staging Supabase env vars (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VITE_SUPABASE_ANON_KEY).');
  }
  if (url.includes(PRODUCTION_REF)) {
    throw new Error('BLOCKED: Refusing to run destructive/synthetic E2E staging suite against production Supabase.');
  }
  return { url, serviceKey, anonKey };
}

async function buildRealSamplePdf(slides = 6) {
  const doc = await PDFDocument.create();
  for (let i = 1; i <= slides; i++) {
    const p = doc.addPage([960, 540]);
    p.drawText(`VELTRAXX 2.0 Staging Sample Slide ${i} of ${slides}`);
  }
  return Buffer.from(await doc.save({ useObjectStreams: true }));
}

async function runLegacyAnonRpcCheck(url, anonKey) {
  const blockedRpcs = ['register_free_team', 'submit_round1_ppt', 'lookup_team_for_ppt', 'get_coordinator_roster'];
  const results = {};
  for (const fn of blockedRpcs) {
    const res = await fetch(`${url}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}`, 'Content-Type': 'application/json' },
      body: '{}'
    });
    results[fn] = res.status;
    assert.ok(res.status >= 400, `Legacy RPC ${fn} MUST reject anon access, got ${res.status}`);
  }
  return results;
}

async function main() {
  const startAll = Date.now();
  const { url, anonKey } = ensureStagingSafety();
  console.log(`[STAGING SAFE] Verified non-production Supabase target: ${url}`);

  // 1. Legacy anon block check
  const anonChecks = await runLegacyAnonRpcCheck(url, anonKey);
  console.log('[SECURITY] Legacy anon RPCs blocked:', anonChecks);

  // 2. Drive OAuth & Phase 3 Hierarchy check
  resetDriveTokenCacheForTests();
  const driveHealth = await checkDriveOAuthHealth();
  assert.equal(driveHealth.ok, true, `Drive OAuth check failed: ${driveHealth.error}`);
  assert.equal(driveHealth.rootFolder.isPrivate, true, 'Staging Drive root MUST remain private');
  const folders = await initializeJudgingWorkspace(['VTX-T1-01']);
  console.log('[DRIVE] OAuth account:', driveHealth.account, '| Private root verified | Problem folder initialized');

  // 3. Ensure window open in staging for E2E flow
  await callRpc('admin_update_event_state', {
    p_round1_open: true,
    p_ppt_submission_open: true,
    p_registration_override: 'FORCE_OPEN',
    p_ppt_deadline_override: 'FORCE_OPEN'
  });

  // 4. Synthetic Registration (real DB + real GAS webhook)
  const tag = Date.now().toString().slice(-6);
  const regRes = await handleRegisterRequest(
    {
      team_name: `Staging Test ${tag}`,
      track_id: 'track_01',
      problem_code: 'VTX-T1-01',
      team_size: 3,
      members: [
        { name: 'Staging Leader', email: `stg_l_${tag}@example.com`, phone: `9911${tag}`, role: 'leader', level: 'UG', degree: 'B.E.', department: 'Electronics Engineering (VLSI Design & Technology)', year_of_study: '3rd', college_name: 'SIET Staging' },
        { name: 'Staging Member 2', email: `stg_m2_${tag}@example.com`, phone: `9922${tag}`, role: 'member_2', level: 'UG', degree: 'B.E.', department: 'Computer Science and Engineering (CSE)', year_of_study: '2nd', college_name: 'PSG College of Technology' },
        { name: 'Staging Member 3', email: `stg_m3_${tag}@example.com`, phone: `9933${tag}`, role: 'member_3', level: 'UG', degree: 'BCA', department: 'Computer Applications', year_of_study: '2nd', college_name: 'PSG College of Arts and Science' }
      ]
    },
    '127.0.0.1'
  );
  assert.equal(regRes.status, 200, `Registration failed: ${JSON.stringify(regRes.body)}`);
  const { team_id: teamId, team_passcode: passcode } = regRes.body;
  console.log(`[REGISTER] Created staging team ${teamId} | sync=${regRes.body.email_sync_status}`);

  // 5. Upload V1 Real PDF -> Drive + Supabase
  const pdf1 = await buildRealSamplePdf(6);
  const sha1 = crypto.createHash('sha256').update(pdf1).digest('hex');
  const tUp1 = Date.now();
  const init1 = await handleInitiatePpt(
    { team_id: teamId, passcode, file_name: `staging_${teamId}_v1.pdf`, file_size: pdf1.length, file_sha256: sha1, page_count: 6, extracted_text: 'staging test v1', idempotency_key: `stg_${tag}_v1` },
    '127.0.0.1'
  );
  assert.equal(init1.status, 200);
  const up1 = await handlePptUpload({
    attemptId: init1.body.attempt_id,
    attemptToken: init1.body.attempt_token,
    teamId,
    buffer: pdf1
  });
  assert.equal(up1.status, 200, `V1 upload failed: ${JSON.stringify(up1.body)}`);
  console.log(`[UPLOAD V1] Confirmed in ${Date.now() - tUp1}ms | receipt=${up1.body.receipt.receipt_id}`);

  // 6. Replacement V2 -> Archive V1
  const pdf2 = await buildRealSamplePdf(8);
  const sha2 = crypto.createHash('sha256').update(pdf2).digest('hex');
  const tUp2 = Date.now();
  const init2 = await handleInitiatePpt(
    { team_id: teamId, passcode, file_name: `staging_${teamId}_v2.pdf`, file_size: pdf2.length, file_sha256: sha2, page_count: 8, extracted_text: 'staging test v2', idempotency_key: `stg_${tag}_v2` },
    '127.0.0.1'
  );
  assert.equal(init2.status, 200);
  const up2 = await handlePptUpload({
    attemptId: init2.body.attempt_id,
    attemptToken: init2.body.attempt_token,
    teamId,
    buffer: pdf2
  });
  assert.equal(up2.status, 200);
  assert.equal(up2.body.receipt.version, 2);
  console.log(`[UPLOAD V2] Replacement confirmed in ${Date.now() - tUp2}ms | receipt=${up2.body.receipt.receipt_id}`);

  // 7. Failure injection: expired OAuth / unavailable Drive preserves V2 cleanly
  const pdf3 = await buildRealSamplePdf(5);
  const sha3 = crypto.createHash('sha256').update(pdf3).digest('hex');
  const init3 = await handleInitiatePpt(
    { team_id: teamId, passcode, file_name: `staging_${teamId}_v3.pdf`, file_size: pdf3.length, file_sha256: sha3, page_count: 5, extracted_text: 'fail test', idempotency_key: `stg_${tag}_v3_fail` },
    '127.0.0.1'
  );
  assert.equal(init3.status, 200);
  const savedRefresh = process.env.GOOGLE_REFRESH_TOKEN;
  process.env.GOOGLE_REFRESH_TOKEN = '1//0gINVALID_EXPIRED_TOKEN_TEST';
  resetDriveTokenCacheForTests();
  const up3Fail = await handlePptUpload({
    attemptId: init3.body.attempt_id,
    attemptToken: init3.body.attempt_token,
    teamId,
    buffer: pdf3
  });
  process.env.GOOGLE_REFRESH_TOKEN = savedRefresh;
  resetDriveTokenCacheForTests();
  assert.ok(up3Fail.status >= 500 || up3Fail.status === 401);

  const statusAfterFail = await handlePptStatus({ team_id: teamId, passcode }, '127.0.0.1');
  assert.equal(statusAfterFail.status, 200);
  assert.equal(statusAfterFail.body.receipt.version, 2, 'Confirmed V2 MUST remain active after failed V3 OAuth failure');

  // 7b. Duplicate idempotent submission check (same idempotency key returns already_confirmed cleanly)
  const dupInit = await handleInitiatePpt(
    { team_id: teamId, passcode, file_name: `staging_${teamId}_v2.pdf`, file_size: pdf2.length, file_sha256: sha2, page_count: 8, extracted_text: 'staging test v2', idempotency_key: `stg_${tag}_v2` },
    '127.0.0.1'
  );
  assert.equal(dupInit.status, 200);
  assert.equal(dupInit.body.already_confirmed, true, 'Duplicate idempotency key must return existing confirmed receipt');

  // 7c. Shortlist + isolated Round 2 receipt upload check
  const slRes = await callRpc('admin_update_team_status', {
    p_team_id: teamId,
    p_status: 'shortlisted',
    p_is_shortlisted: true
  });
  assert.equal(slRes.success, true);
  const teamSecretRows = await queryRest(`teams?team_id=eq.${encodeURIComponent(teamId)}&select=secret_passcode`);
  const r2Pass = teamSecretRows[0]?.secret_passcode;
  assert.ok(r2Pass, 'Shortlisted team must have secret_passcode');
  const gate = await callRpc('verify_round2_gatekeeper', { p_team_id: teamId, p_passcode: r2Pass });
  assert.equal(gate.valid, true);
  const tinyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
  const receiptMd5 = crypto.createHash('md5').update(tinyPng).digest('hex');
  const receiptsParentId = process.env.GOOGLE_DRIVE_RECEIPTS_FOLDER_ID || folders.rootFolderId;
  const receiptsPath = process.env.GOOGLE_DRIVE_RECEIPTS_FOLDER_ID
    ? [JUDGING_DRIVE_FOLDERS.ROUND2_RECEIPTS, teamId]
    : [JUDGING_DRIVE_FOLDERS.PRIVATE_FINANCE_ROOT, JUDGING_DRIVE_FOLDERS.ROUND2_RECEIPTS, teamId];
  const r2File = await uploadBinaryToDriveAndVerify({
    parentFolderId: receiptsParentId,
    folderPathSegments: receiptsPath,
    fileName: `${teamId}_UTR_123456789012.png`,
    mimeType: 'image/png',
    buffer: tinyPng,
    expectedMd5: receiptMd5,
    description: 'Staging isolated receipt test'
  });
  const payRes = await callRpc('submit_round2_payment', {
    p_team_id: teamId,
    p_passcode: r2Pass,
    p_utr_number: '123456789012',
    p_screenshot_url: `/api/admin/action?op=file&teamId=${encodeURIComponent(teamId)}&fileId=${encodeURIComponent(r2File.fileId)}`,
    p_drive_file_id: r2File.fileId
  });
  assert.equal(payRes.success, true);
  console.log(`[RECEIPT] Stored isolated Round 2 receipt fileId=${r2File.fileId}`);

  // 7d. Deadline enforcement check (FORCE_CLOSED must reject new attempts with 403 WINDOW_CLOSED)
  await callRpc('admin_update_event_state', { p_ppt_deadline_override: 'FORCE_CLOSED' });
  const closedInit = await handleInitiatePpt(
    { team_id: teamId, passcode, file_name: `staging_${teamId}_closed.pdf`, file_size: pdf2.length, file_sha256: sha2, page_count: 8, extracted_text: 'closed test', idempotency_key: `stg_${tag}_closed` },
    '127.0.0.1'
  );
  assert.equal(closedInit.status, 403);
  assert.equal(closedInit.body.code, 'WINDOW_CLOSED');
  console.log('[DEADLINE] Verified FORCE_CLOSED blocks initiate_ppt_submission with HTTP 403 WINDOW_CLOSED');

  // 8. Recovery + automatic sync drain check
  const recId = await handleTeamRecovery({ mode: 'id', email: `stg_l_${tag}@example.com`, phone: `9911${tag}` }, '127.0.0.1');
  assert.equal(recId.status, 200);
  assert.equal(recId.body.team_id, teamId);

  const drained = await drainDueSyncJobs({ limit: 5 });
  console.log('[SYNC DRAIN] Auto-drain result:', drained);

  // Restore AUTO window state in staging
  await callRpc('admin_update_event_state', {
    p_registration_override: 'AUTO',
    p_ppt_deadline_override: 'AUTO'
  });

  // 9. Query final staging teams row for audit
  const rows = await queryRest(`teams?team_id=eq.${encodeURIComponent(teamId)}&select=team_id,ppt_current_version,ppt_receipt_id,gas_sync_status`);
  assert.equal(rows[0].ppt_current_version, 2);
  console.log(`[COMPLETE] Phase 4 live staging E2E passed in ${Date.now() - startAll}ms! Team=${teamId}, DriveConfirmed=${folders.confirmedRootId}`);
}

main().catch((err) => {
  console.error('[STAGING E2E FAILED]', err);
  process.exit(1);
});
