import { assertServerWritable, callRpc, queryRest, readBinaryBody } from '../_lib/supabaseAdmin.js';
import { validatePdfBuffer, MAX_PDF_BYTES } from '../_lib/pdfValidator.js';
import {
  JUDGING_DRIVE_FOLDERS,
  archiveDriveFile,
  getGoogleDriveConfig,
  uploadBinaryToDriveAndVerify,
  withGlobalUploadSlot
} from '../_lib/googleDrive.js';
import { dispatchToGasWithSyncTracking, drainDueSyncJobs } from '../_lib/gasClient.js';

export const config = {
  api: {
    bodyParser: false
  }
};

export async function handlePptUpload({
  attemptId,
  attemptToken,
  teamId,
  buffer,
  deps = {}
}) {
  const callRpcFn = deps.callRpcFn || callRpc;
  const queryRestFn = deps.queryRestFn || queryRest;
  const uploadDriveFn = deps.uploadDriveFn || uploadBinaryToDriveAndVerify;
  const archiveDriveFn = deps.archiveDriveFn || archiveDriveFile;
  const dispatchGasFn = deps.dispatchGasFn || dispatchToGasWithSyncTracking;
  const drainSyncFn = deps.drainSyncFn || drainDueSyncJobs;
  const useGlobalSemaphore = deps.useGlobalSemaphore !== false;
  const driveCfg = deps.driveCfg || getGoogleDriveConfig();
  assertServerWritable('PPT binary upload');

  const cleanTeamId = String(teamId || '').trim().toUpperCase();
  if (!attemptId || !attemptToken || !cleanTeamId) {
    return { status: 400, body: { success: false, code: 'MISSING_HEADERS', error: 'Invalid upload session parameters.' } };
  }

  // 1. Atomic state transition INITIATED -> UPLOADING (enforces grace deadline & single-use attempt)
  const lockRes = await callRpcFn('mark_ppt_attempt_uploading', {
    p_attempt_id: attemptId,
    p_attempt_token: attemptToken,
    p_team_id: cleanTeamId
  });

  if (!lockRes || lockRes.success === false) {
    const code = lockRes?.code || 'ATTEMPT_LOCK_FAILED';
    const httpStatus = code === 'GRACE_EXPIRED' ? 403 : code === 'DUPLICATE_IN_FLIGHT' ? 409 : 400;
    return { status: httpStatus, body: lockRes };
  }

  const attempt = lockRes.attempt;
  const problemCode = String(attempt?.problem_code || 'UNASSIGNED').trim().toUpperCase();
  const nextVersionEstimate = Number(attempt?.current_version || 0) + 1;

  try {
    // 2. Server-side PDF integrity, size, header, EOF, encryption & pdf-lib slide count verification
    const pdfInfo = await validatePdfBuffer(buffer);
    if (attempt.file_sha256 && pdfInfo.sha256 !== attempt.file_sha256) {
      const err = new Error('File integrity mismatch detected during upload. Your previous submission remains safe. Please retry.');
      err.code = 'CHECKSUM_MISMATCH';
      err.status = 400;
      throw err;
    }

    // 3. Cross-instance DB semaphore + Drive upload directly to 03_Confirmed_Submissions/<PROBLEM_CODE>/<TEAM_ID>/
    const safeBaseName = String(attempt.file_name || `${cleanTeamId}.pdf`).replace(/[^a-zA-Z0-9._-]/g, '_');
    const storedFileName = `${cleanTeamId}_V${nextVersionEstimate}_${safeBaseName}`;

    const runDriveUpload = async () => await uploadDriveFn({
      parentFolderId: driveCfg.rootFolderId,
      folderPathSegments: [JUDGING_DRIVE_FOLDERS.CONFIRMED_SUBMISSIONS, problemCode, cleanTeamId],
      fileName: storedFileName,
      mimeType: 'application/pdf',
      buffer,
      expectedMd5: pdfInfo.md5,
      description: `VELTRAXX 2.0 Confirmed Blueprint | Problem: ${problemCode} | Team: ${cleanTeamId} | Version: V${nextVersionEstimate} | SHA256: ${pdfInfo.sha256}`
    });

    const driveFile = useGlobalSemaphore && deps.callRpcFn !== undefined
      ? await withGlobalUploadSlot(attemptId, runDriveUpload, { callRpcFn, maxSlots: deps.maxGlobalSlots || 20 })
      : useGlobalSemaphore
        ? await withGlobalUploadSlot(attemptId, runDriveUpload, { callRpcFn })
        : await runDriveUpload();

    // 4. Atomically finalize versioned submission in Supabase AFTER Drive verification passes
    const finalizeRes = await callRpcFn('finalize_ppt_submission_v2', {
      p_attempt_id: attemptId,
      p_attempt_token: attemptToken,
      p_drive_file_id: driveFile.fileId,
      p_drive_preview_url: driveFile.previewUrl,
      p_verified_size_bytes: driveFile.sizeBytes,
      p_verified_sha256: pdfInfo.sha256
    });

    if (!finalizeRes || finalizeRes.success === false) {
      const err = new Error(finalizeRes?.error || 'Database confirmation failed. Your previous submission remains safe.');
      err.code = finalizeRes?.code || 'DB_FINALIZE_FAILED';
      err.status = finalizeRes?.code === 'GRACE_EXPIRED' ? 403 : 500;
      throw err;
    }

    // 5. Phase 3 Judging Hygiene: move superseded file to 04_Archived_Versions/<PROBLEM_CODE>/<TEAM_ID>/
    const prevDriveFileId = finalizeRes.previous_drive_file_id || attempt?.previous_drive_file_id;
    if (prevDriveFileId && prevDriveFileId !== driveFile.fileId) {
      await archiveDriveFn({
        fileId: prevDriveFileId,
        rootFolderId: driveCfg.rootFolderId,
        problemCode,
        teamId: cleanTeamId
      }).catch(() => {});
    }

    // 6. Non-blocking Sheet status update tracked in sync_jobs + opportunistic backlog drain
    try {
      const jobs = await queryRestFn(
        `sync_jobs?team_id=eq.${encodeURIComponent(cleanTeamId)}&job_type=eq.PPT_SHEET_SYNC&order=created_at.desc&limit=1&select=id`
      );
      const syncJobId = Array.isArray(jobs) && jobs[0]?.id ? jobs[0].id : null;
      const syncRes = await dispatchGasFn({
        action: 'ppt_submitted',
        teamId: cleanTeamId,
        jobType: 'PPT_SHEET_SYNC',
        syncJobId,
        payload: {
          teamId: cleanTeamId,
          version: finalizeRes.receipt.version,
          receiptId: finalizeRes.receipt.receipt_id,
          driveFolderUrl: driveFile.folderUrl
        }
      });
      if (syncRes?.synced) {
        await drainSyncFn({ limit: 2, callRpcFn, queryRestFn }).catch(() => {});
      }
    } catch {}

    return { status: 200, body: finalizeRes };
  } catch (err) {
    // Attempt failed -> previous valid submission remains untouched in teams & ppt_submissions
    await callRpcFn('mark_ppt_attempt_failed', {
      p_attempt_id: attemptId,
      p_status: err?.name === 'AbortError' ? 'INTERRUPTED' : 'FAILED',
      p_error_code: err?.code || 'UPLOAD_ERROR',
      p_error_message: err?.message || 'Upload interrupted. Your previous submission remains safe.'
    }).catch(() => {});

    const status = err?.status || 503;
    const userMessage = status === 503 || status === 429
      ? 'Upload service is temporarily busy. Your previous submission remains safe. Please retry.'
      : (err?.message || 'Upload interrupted. Your previous submission remains safe.');

    return {
      status,
      headers: status === 429 ? { 'Retry-After': '3' } : undefined,
      body: {
        success: false,
        code: err?.code || 'UPLOAD_FAILED',
        error: userMessage
      }
    };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed.' });
  }

  try {
    const attemptId = req.headers['x-attempt-id'];
    const attemptToken = req.headers['x-attempt-token'];
    const teamId = req.headers['x-team-id'];
    const buffer = await readBinaryBody(req, MAX_PDF_BYTES);

    const result = await handlePptUpload({
      attemptId,
      attemptToken,
      teamId,
      buffer
    });
    if (result.headers) {
      for (const [k, v] of Object.entries(result.headers)) res.setHeader(k, v);
    }
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('[api/ppt/upload] error:', err);
    return res.status(err.status || 500).json({
      success: false,
      error: err.status === 413
        ? 'File exceeds the strict 3 MB maximum limit.'
        : 'Upload interrupted. Your previous submission remains safe.'
    });
  }
}
