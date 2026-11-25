import {
  assertServerWritable,
  callRpc,
  queryRest,
  generatePasscode,
  extractClientIp,
  readJsonBody
} from './_lib/supabaseAdmin.js';
import { dispatchToGasWithSyncTracking, drainDueSyncJobs } from './_lib/gasClient.js';

export async function handleRegisterRequest(body, clientIp, { callRpcFn = callRpc, queryRestFn = queryRest, dispatchGasFn = dispatchToGasWithSyncTracking, drainSyncFn = drainDueSyncJobs } = {}) {
  assertServerWritable('Team registration');
  const { team_name, track_id, problem_code, team_size, members } = body || {};

  if (!team_name || String(team_name).trim().length < 3) {
    return { status: 400, body: { success: false, error: 'Team Name must be at least 3 characters.' } };
  }
  if (!track_id || !problem_code) {
    return { status: 400, body: { success: false, error: 'Please select both a domain track and a problem statement.' } };
  }
  if (Number(team_size) !== 3 || !Array.isArray(members) || members.length !== 3) {
    return { status: 400, body: { success: false, error: 'Strictly 3 members (1 Leader + 2 Members) are required.' } };
  }

  // Server-side rate limiting per IP (max 20 registration attempts per 10 mins)
  const rl = await callRpcFn('check_rate_limit', {
    p_bucket_key: `reg_ip:${clientIp}`,
    p_max_requests: 20,
    p_window_seconds: 600
  });
  if (rl && rl.allowed === false) {
    return {
      status: 429,
      body: { success: false, error: `Too many registration requests. Please wait ${rl.retry_after_seconds || 60} seconds and retry.` }
    };
  }

  const teamPasscode = generatePasscode(8);

  const dbResult = await callRpcFn('register_free_team_v2', {
    p_team_name: String(team_name).trim(),
    p_track_id: String(track_id).trim(),
    p_problem_code: String(problem_code).trim(),
    p_team_size: 3,
    p_members: members,
    p_ppt_passcode_plain: teamPasscode
  });

  if (!dbResult || dbResult.success === false) {
    return { status: 400, body: { success: false, error: dbResult?.error || 'Registration failed validation.' } };
  }

  const teamId = dbResult.team_id;

  // Secondary Google Sheet / Folder / Email sync (non-blocking failure tolerance)
  let syncJobId = null;
  try {
    const jobs = await queryRestFn(
      `sync_jobs?team_id=eq.${encodeURIComponent(teamId)}&job_type=eq.REGISTER_SYNC&order=created_at.desc&limit=1&select=id`
    );
    if (Array.isArray(jobs) && jobs[0]?.id) {
      syncJobId = jobs[0].id;
    }
  } catch {}

  const syncResult = await dispatchGasFn({
    action: 'register',
    teamId,
    jobType: 'REGISTER_SYNC',
    syncJobId,
    payload: {
      teamId,
      teamName: dbResult.team_name,
      trackId: String(track_id).trim(),
      problemCode: String(problem_code).trim(),
      academicTier: dbResult.academic_tier,
      teamPasscode,
      members
    }
  });

  if (syncResult?.synced) {
    await drainSyncFn({ limit: 2, callRpcFn, queryRestFn }).catch(() => {});
  }

  return {
    status: 200,
    body: {
      success: true,
      team_id: teamId,
      team_passcode: teamPasscode,
      team_name: dbResult.team_name,
      academic_tier: dbResult.academic_tier,
      email_sync_status: syncResult.synced ? 'synced' : 'queued',
      message: 'Free Round 1 registration confirmed. Save your Team ID and Team Passcode.'
    }
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed.' });
  }

  try {
    const body = await readJsonBody(req);
    const clientIp = extractClientIp(req);
    const result = await handleRegisterRequest(body, clientIp);
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('[api/register] error:', err);
    return res.status(err.status || 500).json({
      success: false,
      error: err.status === 413 ? err.message : 'Registration service temporarily unavailable. Please retry.'
    });
  }
}
