import { callRpc, extractClientIp, readJsonBody } from '../_lib/supabaseAdmin.js';

export async function handlePptStatus(body, clientIp, { callRpcFn = callRpc } = {}) {
  const cleanTeamId = String(body?.team_id || '').trim().toUpperCase();
  const cleanPasscode = String(body?.passcode || '').trim().toUpperCase();

  if (!cleanTeamId || !cleanPasscode) {
    return { status: 400, body: { success: false, error: 'Team ID and Team Passcode are required.' } };
  }

  const rl = await callRpcFn('check_rate_limit', {
    p_bucket_key: `ppt_status:${clientIp}`,
    p_max_requests: 30,
    p_window_seconds: 300
  });
  if (rl && rl.allowed === false) {
    return { status: 429, body: { success: false, error: 'Too many verification requests. Please wait a minute and retry.' } };
  }

  const data = await callRpcFn('get_team_submission_status', {
    p_team_id: cleanTeamId,
    p_passcode: cleanPasscode
  });

  if (!data || data.success === false) {
    return { status: 401, body: { success: false, error: data?.error || 'Incorrect Team ID or team passcode.' } };
  }

  return { status: 200, body: data };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed.' });
  }
  try {
    const body = await readJsonBody(req);
    const clientIp = extractClientIp(req);
    const result = await handlePptStatus(body, clientIp);
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('[api/ppt/status] error:', err);
    return res.status(500).json({ success: false, error: 'Unable to check submission status right now.' });
  }
}
