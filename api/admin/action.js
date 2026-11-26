import {
  assertServerWritable,
  callRpc,
  queryRest,
  verifyCoordinatorAuth,
  readJsonBody
} from '../_lib/supabaseAdmin.js';
import {
  JUDGING_DRIVE_FOLDERS,
  checkDriveOAuthHealth,
  deleteDriveArtifactsForTeam,
  downloadDriveFileBuffer,
  extractDriveFileIdFromUrl,
  initializeJudgingWorkspace
} from '../_lib/googleDrive.js';
import { dispatchToGasWithSyncTracking, drainDueSyncJobs } from '../_lib/gasClient.js';
import { eventConfig } from '../../src/config/eventConfig.js';

function getAllProblemCodes() {
  const codes = [];
  for (const t of eventConfig.tracks || []) {
    for (const p of t.problems || []) {
      if (p.code) codes.push(p.code);
    }
  }
  return codes;
}

export async function handleDeleteTeamRequest(body, coordinator, {
  queryRestFn = queryRest,
  callRpcFn = callRpc,
  deleteDriveFn = deleteDriveArtifactsForTeam
} = {}) {
  assertServerWritable('Permanent team deletion');

  if (!coordinator?.email) {
    return { status: 401, body: { success: false, code: 'UNAUTHORIZED', error: 'Coordinator authorization required.' } };
  }
  if (body?.confirm !== true) {
    return { status: 400, body: { success: false, code: 'CONFIRMATION_REQUIRED', error: 'Explicit permanent deletion confirmation is required.' } };
  }

  const cleanTeamId = String(body?.team_id || '').trim().toUpperCase();
  if (!cleanTeamId || !/^[A-Z0-9_-]{3,40}$/.test(cleanTeamId)) {
    return { status: 400, body: { success: false, code: 'INVALID_TEAM_ID', error: 'Valid Team ID is required.' } };
  }

  const teamRows = await queryRestFn(`teams?team_id=eq.${encodeURIComponent(cleanTeamId)}&select=*`);
  const team = Array.isArray(teamRows) && teamRows[0] ? teamRows[0] : null;
  if (!team) {
    return { status: 404, body: { success: false, code: 'TEAM_NOT_FOUND', error: `Team ${cleanTeamId} not found.` } };
  }

  let subRows = [];
  try {
    const subs = await queryRestFn(`ppt_submissions?team_id=eq.${encodeURIComponent(cleanTeamId)}&select=drive_file_id`);
    if (Array.isArray(subs)) subRows = subs;
  } catch {
    subRows = [];
  }

  const fileIds = [
    team.ppt_drive_file_id,
    team.round2_receipt_drive_file_id,
    extractDriveFileIdFromUrl(team.ppt_pdf_drive_url),
    extractDriveFileIdFromUrl(team.payment_screenshot_url),
    ...subRows.map((s) => s?.drive_file_id)
  ].filter(Boolean);

  const folderIds = [team.drive_folder_id].filter(Boolean);

  const driveCleanup = await deleteDriveFn({
    teamId: cleanTeamId,
    problemCode: team.problem_code || '',
    fileIds,
    folderIds
  });

  // Prefer hardened admin_delete_team RPC; gracefully handle pre-010 RPC restriction via authenticated service_role DELETE
  let rpcResult = null;
  try {
    rpcResult = await callRpcFn('admin_delete_team', { p_team_id: cleanTeamId });
  } catch (err) {
    if (String(err?.message || '').includes('Access denied')) {
      const deletedRows = await queryRestFn(`teams?team_id=eq.${encodeURIComponent(cleanTeamId)}`, {
        method: 'DELETE',
        headers: { Prefer: 'return=representation' }
      });
      rpcResult = {
        success: Array.isArray(deletedRows) && deletedRows.length > 0,
        deleted_count: Array.isArray(deletedRows) ? deletedRows.length : 0,
        team_id: cleanTeamId
      };
    } else {
      throw err;
    }
  }

  if (!rpcResult || rpcResult.success === false) {
    return {
      status: 404,
      body: { success: false, code: 'TEAM_NOT_FOUND', error: rpcResult?.error || `Team ${cleanTeamId} not found.` }
    };
  }

  const remainingTeams = await queryRestFn('teams?select=team_id').catch(() => null);
  const remainingCount = Array.isArray(remainingTeams) ? remainingTeams.length : null;

  return {
    status: 200,
    body: {
      success: true,
      team_id: cleanTeamId,
      deleted_count: rpcResult.deleted_count || 1,
      deleted_drive_items: driveCleanup.deletedIds || [],
      deleted_drive_count: driveCleanup.deletedCount || 0,
      remaining_teams_count: remainingCount,
      message: `Team ${cleanTeamId} and ${driveCleanup.deletedCount || 0} Drive artifact(s) permanently deleted.`
    }
  };
}

export default async function handler(req, res) {
  try {
    const url = new URL(req.url, 'https://localhost');
    const opParam = url.searchParams.get('op') || '';

    // Allow authenticated Vercel / scheduled cron runner using CRON_SECRET for background sync drain only
    if ((req.method === 'GET' || req.method === 'POST') && opParam === 'cron_drain') {
      const cronSecret = process.env.CRON_SECRET || '';
      const authHeader = req.headers.authorization || '';
      const hasValidCronSecret = Boolean(cronSecret && authHeader === `Bearer ${cronSecret}`);
      if (!hasValidCronSecret) {
        await verifyCoordinatorAuth(req);
      }
      const summary = await drainDueSyncJobs({ limit: 8 });
      return res.status(200).json({ success: true, mode: 'cron_drain', ...summary });
    }

    const coordinator = await verifyCoordinatorAuth(req);

    if (req.method === 'GET') {
      const op = opParam || 'overview';

      if (op === 'overview') {
        await drainDueSyncJobs({ limit: 3 }).catch(() => {});

        const [eventStates, windowStatus, syncJobs, recentAttempts, auditLogs] = await Promise.all([
          queryRest('event_state?id=eq.1&select=*'),
          callRpc('get_window_status'),
          queryRest('sync_jobs?order=updated_at.desc&limit=100&select=*'),
          queryRest('ppt_submission_attempts?order=started_at.desc&limit=100&select=id,team_id,attempt_number,status,file_name,file_size_bytes,page_count,receipt_id,error_code,error_message,started_at,completed_at'),
          queryRest('admin_audit_logs?order=created_at.desc&limit=50&select=*')
        ]);

        return res.status(200).json({
          success: true,
          event_state: Array.isArray(eventStates) ? eventStates[0] : null,
          window_status: windowStatus,
          sync_jobs: syncJobs || [],
          recent_attempts: recentAttempts || [],
          audit_logs: auditLogs || []
        });
      }

      if (op === 'drive_health') {
        const health = await checkDriveOAuthHealth();
        return res.status(health.ok ? 200 : 502).json({ success: health.ok, ...health });
      }

      if (op === 'file') {
        const fileId = (url.searchParams.get('fileId') || '').trim();
        const teamId = (url.searchParams.get('teamId') || '').trim().toUpperCase();
        if (!fileId || !teamId) {
          return res.status(400).json({ success: false, error: 'Missing teamId or fileId.' });
        }

        // Verify requested Drive file ID is genuinely linked to that team (prevents arbitrary traversal)
        const [teamRows, subRows] = await Promise.all([
          queryRest(`teams?team_id=eq.${encodeURIComponent(teamId)}&select=ppt_drive_file_id,round2_receipt_drive_file_id`),
          queryRest(`ppt_submissions?team_id=eq.${encodeURIComponent(teamId)}&drive_file_id=eq.${encodeURIComponent(fileId)}&select=drive_file_id`)
        ]);

        const teamMatch = Array.isArray(teamRows) && teamRows[0] &&
          (teamRows[0].ppt_drive_file_id === fileId || teamRows[0].round2_receipt_drive_file_id === fileId);
        const subMatch = Array.isArray(subRows) && subRows.length > 0;

        if (!teamMatch && !subMatch) {
          return res.status(404).json({ success: false, error: 'File does not belong to the specified team.' });
        }

        const { meta, buffer } = await downloadDriveFileBuffer(fileId);
        res.setHeader('Content-Type', meta.mimeType || 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${(meta.name || `${teamId}.pdf`).replace(/"/g, '')}"`);
        res.setHeader('Cache-Control', 'private, max-age=300');
        return res.status(200).send(buffer);
      }

      return res.status(400).json({ success: false, error: 'Unsupported GET op.' });
    }

    if (req.method === 'POST') {
      assertServerWritable('Coordinator admin action');
      const body = await readJsonBody(req);
      const op = body?.op;

      if (op === 'delete_team') {
        const result = await handleDeleteTeamRequest(body, coordinator);
        return res.status(result.status).json(result.body);
      }

      if (op === 'init_judging_drive') {
        const folders = await initializeJudgingWorkspace(getAllProblemCodes());
        await queryRest('admin_audit_logs', {
          method: 'POST',
          body: {
            actor_email: coordinator.email,
            action: 'INIT_JUDGING_DRIVE',
            details: { folders: Object.keys(JUDGING_DRIVE_FOLDERS).length }
          }
        }).catch(() => {});
        return res.status(200).json({ success: true, folders });
      }

      if (op === 'update_event_state') {
        const updated = await callRpc('admin_update_event_state', {
          p_round1_open: body.round1_open ?? null,
          p_ppt_submission_open: body.ppt_submission_open ?? null,
          p_round2_payment_open: body.round2_payment_open ?? null,
          p_round2_fee_per_member: body.round2_fee_per_member ?? null,
          p_is_clock_public: body.is_clock_public ?? null,
          p_clock_state: body.clock_state ?? null,
          p_live_announcement_text: body.live_announcement_text ?? null,
          p_ppt_deadline_override: body.ppt_deadline_override ?? null,
          p_registration_override: body.registration_override ?? null,
          p_ppt_window_end: body.ppt_window_end ?? null,
          p_registration_deadline: body.registration_deadline ?? null,
          p_clock_start_timestamp: body.clock_start_timestamp ?? null,
          p_clock_end_timestamp: body.clock_end_timestamp ?? null,
          p_max_teams_cap: body.max_teams_cap ?? null,
          p_payment_reservation_minutes: body.payment_reservation_minutes ?? null
        });
        const windowStatus = await callRpc('get_window_status');
        return res.status(200).json({ success: true, event_state: updated, window_status: windowStatus });
      }

      if (op === 'grant_payment_access') {
        const granted = await callRpc('admin_grant_payment_access', {
          p_team_id: body.team_id
        });
        await drainDueSyncJobs({ limit: 3 }).catch(() => {});
        return res.status(200).json(granted);
      }

      if (op === 'verify_payment') {
        const resPay = await callRpc('admin_verify_round2_payment', {
          p_team_id: body.team_id,
          p_verified: Boolean(body.is_verified)
        });
        await drainDueSyncJobs({ limit: 3 }).catch(() => {});
        return res.status(200).json(resPay);
      }

      if (op === 'send_shortlist_email') {
        return res.status(410).json({
          success: false,
          error: 'Automated bulk emails are disabled. Use manual Gmail confirmation from vlsireseachlab@siet.ac.in.'
        });
      }

      if (op === 'retry_sync') {
        const teamId = String(body?.team_id || '').trim().toUpperCase();
        const syncJobId = body?.sync_job_id || null;
        if (!teamId) {
          return res.status(400).json({ success: false, error: 'team_id is required to retry sync.' });
        }

        const roster = await callRpc('get_coordinator_roster');
        const team = Array.isArray(roster) ? roster.find((t) => t.team_id === teamId) : null;
        if (!team) {
          return res.status(404).json({ success: false, error: `Team ${teamId} not found.` });
        }

        const jobType = String(body?.job_type || 'REGISTER_SYNC');
        const action = jobType === 'REGISTER_SYNC' ? 'register' : 'team_status_sync';
        const gasRes = await dispatchToGasWithSyncTracking({
          action,
          teamId,
          jobType,
          syncJobId,
          payload: action === 'team_status_sync'
            ? {
                teamId,
                isShortlisted: team.is_shortlisted,
                isPaidVerified: team.is_paid_verified,
                utrNumber: team.utr_number,
                round1Status: team.round1_status
              }
            : {
                teamId,
                teamName: team.team_name,
                trackId: team.track_id,
                problemCode: team.problem_code,
                academicTier: team.academic_tier,
                isShortlisted: team.is_shortlisted,
                isPaidVerified: team.is_paid_verified,
                utrNumber: team.utr_number,
                round1Status: team.round1_status,
                members: team.members
              }
        });

        return res.status(gasRes.synced ? 200 : 502).json({
          success: gasRes.synced,
          team_id: teamId,
          error: gasRes.error || null
        });
      }

      return res.status(400).json({ success: false, error: 'Unsupported POST op.' });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ success: false, error: 'Method not allowed.' });
  } catch (err) {
    console.error('[api/admin/action] error:', err);
    return res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Coordinator action failed.'
    });
  }
}
