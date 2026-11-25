import {
  assertServerWritable,
  callRpc,
  queryRest,
  generatePasscode,
  extractClientIp,
  readJsonBody
} from '../_lib/supabaseAdmin.js';
import { dispatchToGasWithSyncTracking } from '../_lib/gasClient.js';

export async function handleTeamRecovery(body, clientIp, { callRpcFn = callRpc, queryRestFn = queryRest, dispatchGasFn = dispatchToGasWithSyncTracking } = {}) {
  const mode = String(body?.mode || 'id').toLowerCase();

  // Mode 1: Privacy-preserving Team ID lookup (requires BOTH Email AND 10-digit Phone)
  if (mode === 'id') {
    const rl = await callRpcFn('check_rate_limit', {
      p_bucket_key: `rec_id_ip:${clientIp}`,
      p_max_requests: 10,
      p_window_seconds: 600
    });
    if (rl && rl.allowed === false) {
      return { status: 429, body: { success: false, error: 'Too many recovery attempts. Please wait 10 minutes.' } };
    }

    const email = String(body?.email || '').trim().toLowerCase();
    const phone = String(body?.phone || '').replace(/[^0-9]/g, '').slice(-10);

    if (!email || phone.length < 10) {
      return { status: 400, body: { success: false, error: 'Please enter BOTH your registered email and 10-digit WhatsApp phone number.' } };
    }

    const res = await callRpcFn('recover_team_identity', { p_email: email, p_phone: phone });
    if (!res || res.success === false) {
      return { status: 404, body: { success: false, error: res?.error || 'No active team found matching both that email and phone.' } };
    }
    return { status: 200, body: res };
  }

  // Mode 2: Passcode rotation dispatched strictly to verified Team Leader email
  if (mode === 'passcode') {
    assertServerWritable('Team passcode reset');
    const teamId = String(body?.team_id || '').trim().toUpperCase();
    const email = String(body?.email || '').trim().toLowerCase();
    const phone = String(body?.phone || '').replace(/[^0-9]/g, '').slice(-10);

    if (!teamId || !email || phone.length < 10) {
      return { status: 400, body: { success: false, error: 'Team ID, Team Leader Email, and Team Leader Phone are all required.' } };
    }

    const rl = await callRpcFn('check_rate_limit', {
      p_bucket_key: `rec_pw:${teamId}`,
      p_max_requests: 3,
      p_window_seconds: 900
    });
    if (rl && rl.allowed === false) {
      return { status: 429, body: { success: false, error: 'Passcode reset limit reached. Please wait 15 minutes or check your Leader email inbox.' } };
    }

    // Protect daily consumer Gmail MailApp quota (reserve capacity for registration & shortlist notifications)
    const globalRl = await callRpcFn('check_rate_limit', {
      p_bucket_key: 'rec_pw_global_daily',
      p_max_requests: 40,
      p_window_seconds: 86400
    });
    if (globalRl && globalRl.allowed === false) {
      return {
        status: 429,
        body: {
          success: false,
          error: 'Daily automated recovery email capacity reached. Please contact student coordinators directly with your Team ID.'
        }
      };
    }

    const newPasscode = generatePasscode(8);
    const rot = await callRpcFn('rotate_team_ppt_passcode', {
      p_team_id: teamId,
      p_leader_email: email,
      p_leader_phone: phone,
      p_new_passcode_plain: newPasscode
    });

    if (!rot || rot.success === false) {
      return { status: 401, body: { success: false, error: rot?.error || 'Credentials did not match an active registration.' } };
    }

    let syncJobId = null;
    try {
      const jobs = await queryRestFn(
        `sync_jobs?team_id=eq.${encodeURIComponent(teamId)}&job_type=eq.PASSCODE_RECOVERY_EMAIL&order=created_at.desc&limit=1&select=id`
      );
      if (Array.isArray(jobs) && jobs[0]?.id) syncJobId = jobs[0].id;
    } catch {}

    const gasRes = await dispatchGasFn({
      action: 'passcode_recovery_email',
      teamId,
      jobType: 'PASSCODE_RECOVERY_EMAIL',
      syncJobId,
      payload: {
        teamId,
        teamName: rot.team_name,
        leaderEmail: rot.leader_email,
        leaderName: rot.leader_name,
        teamPasscode: newPasscode
      }
    });

    if (!gasRes.synced) {
      // Restore previous passcode hash so failed email dispatch NEVER locks out the participant
      await callRpcFn('rollback_passcode_rotation', { p_team_id: teamId }).catch(() => {});
      return {
        status: 503,
        body: {
          success: false,
          error: 'Could not dispatch passcode recovery email right now. Your previous passcode still works, or contact student coordinators.'
        }
      };
    }

    return {
      status: 200,
      body: {
        success: true,
        message: 'A new Team Passcode has been sent to your Team Leader\'s registered email address.'
      }
    };
  }

  return { status: 400, body: { success: false, error: 'Unsupported recovery mode.' } };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed.' });
  }
  try {
    const body = await readJsonBody(req);
    const clientIp = extractClientIp(req);
    const result = await handleTeamRecovery(body, clientIp);
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('[api/team/recover] error:', err);
    return res.status(500).json({ success: false, error: 'Recovery service unavailable. Please retry.' });
  }
}
