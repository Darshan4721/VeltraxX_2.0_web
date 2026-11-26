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

  // Mode 2: Disabled automated MailApp recovery in single-round mode
  if (mode === 'passcode') {
    return {
      status: 410,
      body: {
        success: false,
        error: 'Automated passcode recovery emails are disabled. Use Team ID & Payment Resume lookup (Email + Phone) or contact vlsireseachlab@siet.ac.in.'
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
