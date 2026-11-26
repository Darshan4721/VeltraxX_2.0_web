import crypto from 'node:crypto';
import {
  assertServerWritable,
  callRpc,
  queryRest,
  generatePasscode,
  extractClientIp,
  readJsonBody,
  readBinaryBody
} from '../_lib/supabaseAdmin.js';
import { JUDGING_DRIVE_FOLDERS, getGoogleDriveConfig, uploadBinaryToDriveAndVerify } from '../_lib/googleDrive.js';
import { dispatchToGasWithSyncTracking, drainDueSyncJobs } from '../_lib/gasClient.js';

export const config = {
  api: {
    bodyParser: false
  }
};

const MAX_RECEIPT_BYTES = 2 * 1024 * 1024; // 2 MB binary limit
const MAX_JSON_PAYLOAD_BYTES = 3.5 * 1024 * 1024; // Allows ~2 MB image encoded in base64 JSON

function detectImageType(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return { mime: 'image/jpeg', ext: 'jpg' };
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return { mime: 'image/png', ext: 'png' };
  if (buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP') return { mime: 'image/webp', ext: 'webp' };
  return null;
}

function decodeBase64Screenshot(rawString) {
  if (!rawString || typeof rawString !== 'string') return null;
  const trimmed = rawString.trim();
  const base64Part = trimmed.includes(',') ? trimmed.split(',').pop() : trimmed;
  if (!base64Part) return null;
  try {
    return Buffer.from(base64Part, 'base64');
  } catch {
    return null;
  }
}

/**
 * Step 3 Unified Registration Handler:
 * Atomically completes registration ONLY with mandatory UTR + payment screenshot proof,
 * stores receipt in Private Finance Drive, creates team + 3 members in Supabase,
 * and syncs to Google Sheets idempotently.
 */
export async function handleUnifiedPaidRegistration({
  draft,
  utrNumber,
  reservationToken = null,
  idempotencyKey = null,
  consentAccepted = false,
  buffer,
  clientIp = 'unknown'
}, {
  callRpcFn = callRpc,
  queryRestFn = queryRest,
  uploadDriveFn = uploadBinaryToDriveAndVerify,
  driveCfg = getGoogleDriveConfig(),
  dispatchGasFn = dispatchToGasWithSyncTracking,
  drainSyncFn = drainDueSyncJobs
} = {}) {
  assertServerWritable('Unified paid team registration');

  if (consentAccepted !== true) {
    return { status: 400, body: { success: false, error: 'You must confirm all payment, substitution, and refund terms before completing registration.' } };
  }

  const teamName = String(draft?.team_name || '').trim();
  const trackId = String(draft?.track_id || '').trim();
  const problemCode = String(draft?.problem_code || '').trim();
  const members = draft?.members;
  const cleanUtr = String(utrNumber || '').trim();
  const cleanResToken = reservationToken ? String(reservationToken).trim().toUpperCase() : null;
  const cleanIdemKey = idempotencyKey ? String(idempotencyKey).trim() : null;

  if (teamName.length < 3 || !trackId || !problemCode) {
    return { status: 400, body: { success: false, error: 'Complete team name, domain track, and problem statement details are required.' } };
  }
  if (Number(draft?.team_size) !== 3 || !Array.isArray(members) || members.length !== 3) {
    return { status: 400, body: { success: false, error: 'Strictly 3 members (1 Team Leader and 2 Team Members) are required.' } };
  }
  if (!/^[0-9]{12}$/.test(cleanUtr)) {
    return { status: 400, body: { success: false, error: 'Payment transaction reference (UTR) must be exactly 12 numeric digits.' } };
  }
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    return { status: 400, body: { success: false, error: 'Payment confirmation screenshot is required.' } };
  }
  if (buffer.length > MAX_RECEIPT_BYTES) {
    return { status: 413, body: { success: false, error: 'Payment screenshot must be strictly under 2 MB.' } };
  }

  const imgType = detectImageType(buffer);
  if (!imgType) {
    return { status: 400, body: { success: false, error: 'Invalid image format. Upload a genuine JPG, PNG, or WEBP screenshot.' } };
  }

  const rl = await callRpcFn('check_rate_limit', {
    p_bucket_key: `complete_ip:${clientIp}`,
    p_max_requests: 25,
    p_window_seconds: 600
  });
  if (rl && rl.allowed === false) {
    return {
      status: 429,
      body: { success: false, error: `Too many submission attempts. Wait ${rl.retry_after_seconds || 60} seconds and retry.` }
    };
  }

  // Preflight: checks idempotency, payment_open, duplicate UTR/members, & reuses Drive receipt on retry
  const preflight = await callRpcFn('preflight_paid_registration', {
    p_team_name: teamName,
    p_track_id: trackId,
    p_problem_code: problemCode,
    p_team_size: 3,
    p_members: members,
    p_utr_number: cleanUtr,
    p_reservation_token: cleanResToken,
    p_idempotency_key: cleanIdemKey
  });

  if (preflight?.already_completed && preflight?.team_id) {
    return {
      status: 200,
      body: {
        success: true,
        idempotent_replay: true,
        team_id: preflight.team_id,
        team_name: preflight.team_name,
        track_id: preflight.track_id,
        problem_code: preflight.problem_code,
        academic_tier: preflight.academic_tier,
        payment_token: preflight.payment_token,
        utr_number: preflight.utr_number,
        payment_status: 'PENDING_VERIFICATION',
        message: 'Registration submitted successfully!\nYour payment evidence has been received and is awaiting verification by the organizing committee. You will receive an official confirmation email once your payment is verified.'
      }
    };
  }

  if (!preflight || preflight.ok === false) {
    return {
      status: preflight?.status_code || 400,
      body: { success: false, error: preflight?.error || 'Unable to verify registration eligibility or capacity.' }
    };
  }

  let driveFileId = preflight.existing_drive_file_id || null;
  if (!driveFileId) {
    const md5 = crypto.createHash('md5').update(buffer).digest('hex');
    const receiptsParentId = driveCfg.receiptsFolderId || driveCfg.rootFolderId;
    const receiptsPath = driveCfg.receiptsFolderId
      ? [JUDGING_DRIVE_FOLDERS.ROUND2_RECEIPTS, `UTR_${cleanUtr}`]
      : [JUDGING_DRIVE_FOLDERS.PRIVATE_FINANCE_ROOT, JUDGING_DRIVE_FOLDERS.ROUND2_RECEIPTS, `UTR_${cleanUtr}`];

    const safeTeamSlug = teamName.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 24) || 'TEAM';
    const driveFile = await uploadDriveFn({
      parentFolderId: receiptsParentId,
      folderPathSegments: receiptsPath,
      fileName: `${safeTeamSlug}_UTR_${cleanUtr}.${imgType.ext}`,
      mimeType: imgType.mime,
      buffer,
      expectedMd5: md5,
      description: `VELTRAXX 2.0 Payment Receipt | Team: ${teamName} | UTR: ${cleanUtr}`
    });
    driveFileId = driveFile.fileId;

    if (cleanResToken) {
      await callRpcFn('save_reservation_receipt', {
        p_reservation_token: cleanResToken,
        p_utr_number: cleanUtr,
        p_drive_file_id: driveFileId
      }).catch(() => {});
    }
  }

  const passcodePlain = generatePasscode(8);
  const completeRes = await callRpcFn('complete_paid_registration', {
    p_team_name: teamName,
    p_track_id: trackId,
    p_problem_code: problemCode,
    p_team_size: 3,
    p_members: members,
    p_ppt_passcode_plain: passcodePlain,
    p_utr_number: cleanUtr,
    p_screenshot_url: '__DRIVE_FILE__',
    p_drive_file_id: driveFileId,
    p_reservation_token: cleanResToken,
    p_idempotency_key: cleanIdemKey
  });

  if (!completeRes || completeRes.success === false) {
    return {
      status: completeRes?.status_code || 400,
      body: {
        success: false,
        code: completeRes?.code || null,
        error: completeRes?.error || 'Failed completing paid registration. Your receipt screenshot has been retained safely for retry.'
      }
    };
  }

  const teamId = completeRes.team_id;
  let syncJobId = null;
  try {
    const jobs = await queryRestFn(
      `sync_jobs?team_id=eq.${encodeURIComponent(teamId)}&job_type=eq.REGISTER_SYNC&order=created_at.desc&limit=1&select=id`
    );
    if (Array.isArray(jobs) && jobs[0]?.id) syncJobId = jobs[0].id;
  } catch {}

  const syncResult = await dispatchGasFn({
    action: 'register',
    teamId,
    jobType: 'REGISTER_SYNC',
    syncJobId,
    payload: {
      teamId,
      teamName: completeRes.team_name,
      trackId,
      problemCode,
      academicTier: completeRes.academic_tier,
      isShortlisted: true,
      isPaidVerified: false,
      utrNumber: cleanUtr,
      round1Status: 'pending',
      members
    }
  }).catch(() => ({ synced: false }));

  if (syncResult?.synced) {
    await drainSyncFn({ limit: 2, callRpcFn, queryRestFn }).catch(() => {});
  }

  return {
    status: 200,
    body: {
      success: true,
      idempotent_replay: Boolean(completeRes.idempotent_replay),
      team_id: teamId,
      team_name: completeRes.team_name,
      track_id: completeRes.track_id || trackId,
      problem_code: completeRes.problem_code || problemCode,
      academic_tier: completeRes.academic_tier,
      payment_token: completeRes.payment_token,
      utr_number: cleanUtr,
      drive_file_id: driveFileId,
      payment_status: 'PENDING_VERIFICATION',
      sheet_sync_status: syncResult?.synced ? 'synced' : 'queued',
      message: completeRes.message || 'Registration submitted successfully!\nYour payment evidence has been received and is awaiting verification by the organizing committee. You will receive an official confirmation email once your payment is verified.'
    }
  };
}

/**
 * Legacy Recovery Receipt Handler (Supports VTX2-034..036 granted manual payment access)
 */
export async function handleReceiptUpload({ teamId, passcode, utrNumber, buffer }, {
  callRpcFn = callRpc,
  queryRestFn = queryRest,
  uploadDriveFn = uploadBinaryToDriveAndVerify,
  driveCfg = getGoogleDriveConfig(),
  dispatchGasFn = dispatchToGasWithSyncTracking
} = {}) {
  assertServerWritable('Legacy team payment submission');
  const cleanTeamId = String(teamId || '').trim().toUpperCase();
  const cleanPasscode = String(passcode || '').trim().toUpperCase();
  const cleanUtr = String(utrNumber || '').trim();

  if (!cleanTeamId || !cleanPasscode || !/^[0-9]{12}$/.test(cleanUtr)) {
    return { status: 400, body: { success: false, error: 'Valid Team ID, recovery token, and 12-digit UTR are required.' } };
  }

  const imgType = detectImageType(buffer);
  if (!imgType) {
    return { status: 400, body: { success: false, error: 'Invalid image format. Upload a genuine JPG, PNG, or WEBP screenshot.' } };
  }

  const gate = await callRpcFn('verify_round2_gatekeeper', {
    p_team_id: cleanTeamId,
    p_passcode: cleanPasscode
  });
  if (!gate || !gate.valid) {
    return { status: 403, body: { success: false, error: gate?.error || 'Payment window unavailable or expired.' } };
  }

  const existingUtrRows = await queryRestFn(
    `teams?utr_number=eq.${encodeURIComponent(cleanUtr)}&team_id=neq.${encodeURIComponent(cleanTeamId)}&round1_status=neq.rejected&select=team_id`
  ).catch(() => []);
  if (Array.isArray(existingUtrRows) && existingUtrRows.length > 0) {
    return {
      status: 409,
      body: {
        success: false,
        error: `Duplicate UTR: Reference ${cleanUtr} has already been submitted by another team.`
      }
    };
  }

  const md5 = crypto.createHash('md5').update(buffer).digest('hex');
  const receiptsParentId = driveCfg.receiptsFolderId || driveCfg.rootFolderId;
  const receiptsPath = driveCfg.receiptsFolderId
    ? [JUDGING_DRIVE_FOLDERS.ROUND2_RECEIPTS, cleanTeamId]
    : [JUDGING_DRIVE_FOLDERS.PRIVATE_FINANCE_ROOT, JUDGING_DRIVE_FOLDERS.ROUND2_RECEIPTS, cleanTeamId];

  const driveFile = await uploadDriveFn({
    parentFolderId: receiptsParentId,
    folderPathSegments: receiptsPath,
    fileName: `${cleanTeamId}_UTR_${cleanUtr}.${imgType.ext}`,
    mimeType: imgType.mime,
    buffer,
    expectedMd5: md5,
    description: `VELTRAXX 2.0 Private Payment Receipt | Team: ${cleanTeamId} | UTR: ${cleanUtr}`
  });

  const secureViewPath = `/api/admin/action?op=file&teamId=${encodeURIComponent(cleanTeamId)}&fileId=${encodeURIComponent(driveFile.fileId)}`;
  const payRes = await callRpcFn('submit_round2_payment', {
    p_team_id: cleanTeamId,
    p_passcode: cleanPasscode,
    p_utr_number: cleanUtr,
    p_screenshot_url: secureViewPath,
    p_drive_file_id: driveFile.fileId
  });

  if (!payRes || payRes.success === false) {
    return { status: 400, body: { success: false, error: payRes?.error || 'Failed saving payment evidence.' } };
  }

  let syncJobId = null;
  try {
    const jobs = await queryRestFn(
      `sync_jobs?team_id=eq.${encodeURIComponent(cleanTeamId)}&job_type=eq.STATUS_SHEET_SYNC&order=created_at.desc&limit=1&select=id`
    );
    if (Array.isArray(jobs) && jobs[0]?.id) syncJobId = jobs[0].id;
  } catch {}

  await dispatchGasFn({
    action: 'team_status_sync',
    teamId: cleanTeamId,
    jobType: 'STATUS_SHEET_SYNC',
    syncJobId,
    payload: {
      teamId: cleanTeamId,
      isShortlisted: true,
      isPaidVerified: false,
      utrNumber: cleanUtr,
      round1Status: 'pending'
    },
    inlineRetries: 0
  }).catch(() => {});

  return {
    status: 200,
    body: {
      success: true,
      drive_file_id: driveFile.fileId,
      message: payRes.message
    }
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed.' });
  }

  try {
    const contentType = String(req.headers['content-type'] || '').toLowerCase();

    // Unified Paid Registration Submission (JSON + base64 screenshot under 2 MB)
    if (contentType.includes('application/json')) {
      const body = await readJsonBody(req, MAX_JSON_PAYLOAD_BYTES);
      const buffer = decodeBase64Screenshot(body?.screenshot_base64 || body?.payment_screenshot_url);
      const out = await handleUnifiedPaidRegistration({
        draft: body?.draft,
        utrNumber: body?.utr_number,
        reservationToken: body?.reservation_token || null,
        idempotencyKey: body?.idempotency_key || null,
        consentAccepted: Boolean(body?.consent_accepted),
        buffer,
        clientIp: extractClientIp(req)
      });
      return res.status(out.status).json(out.body);
    }

    // Legacy Binary Upload Path (Team ID + Passcode recovery)
    const teamId = String(req.headers['x-team-id'] || '').trim().toUpperCase();
    const passcode = String(req.headers['x-passcode'] || '').trim().toUpperCase();
    const utrNumber = String(req.headers['x-utr-number'] || '').trim();
    const buffer = await readBinaryBody(req, MAX_RECEIPT_BYTES);

    const out = await handleReceiptUpload({ teamId, passcode, utrNumber, buffer });
    return res.status(out.status).json(out.body);
  } catch (err) {
    console.error('[api/round2/upload-receipt] error:', err);
    return res.status(err.status || 500).json({
      success: false,
      error: err.status === 413
        ? 'Payment screenshot exceeds the 2 MB limit.'
        : 'Unable to complete payment submission right now. Your draft is preserved - please retry.'
    });
  }
}
