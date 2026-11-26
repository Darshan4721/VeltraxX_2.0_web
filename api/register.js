import {
  assertServerWritable,
  callRpc,
  extractClientIp,
  readJsonBody
} from './_lib/supabaseAdmin.js';

/**
 * Step 1 Handler: Reserve temporary internal checkout slot after validating 3-member draft
 * and atomic 60-team capacity. Does NOT create a completed team registration, Team ID,
 * or Google Sheets row. Registration completes only when payment evidence is submitted.
 */
export async function handleRegisterRequest(body, clientIp, { callRpcFn = callRpc } = {}) {
  assertServerWritable('Checkout seat reservation');
  const { team_name, track_id, problem_code, team_size, members, reservation_token, idempotency_key } = body || {};

  if (!team_name || String(team_name).trim().length < 3) {
    return { status: 400, body: { success: false, error: 'Team Name must be at least 3 characters.' } };
  }
  if (!track_id || !problem_code) {
    return { status: 400, body: { success: false, error: 'Please select both a domain track and a problem statement.' } };
  }
  if (Number(team_size) !== 3 || !Array.isArray(members) || members.length !== 3) {
    return { status: 400, body: { success: false, error: 'Strictly 3 members (1 Leader + 2 Members) are required.' } };
  }

  // Server-side rate limiting per IP (max 25 checkout reservations per 10 mins)
  const rl = await callRpcFn('check_rate_limit', {
    p_bucket_key: `reg_ip:${clientIp}`,
    p_max_requests: 25,
    p_window_seconds: 600
  });
  if (rl && rl.allowed === false) {
    return {
      status: 429,
      body: { success: false, error: `Too many checkout requests. Please wait ${rl.retry_after_seconds || 60} seconds and retry.` }
    };
  }

  const resSlot = await callRpcFn('reserve_checkout_slot', {
    p_team_name: String(team_name).trim(),
    p_track_id: String(track_id).trim(),
    p_problem_code: String(problem_code).trim(),
    p_team_size: 3,
    p_members: members,
    p_existing_token: reservation_token ? String(reservation_token).trim().toUpperCase() : null,
    p_idempotency_key: idempotency_key ? String(idempotency_key).trim() : null
  });

  if (!resSlot || resSlot.success === false) {
    return { status: 400, body: { success: false, error: resSlot?.error || 'Validation or capacity check failed.' } };
  }

  return {
    status: 200,
    body: {
      success: true,
      reservation_token: resSlot.reservation_token,
      payment_deadline: resSlot.expires_at,
      expires_at: resSlot.expires_at,
      academic_tier: resSlot.academic_tier,
      fee_per_member: resSlot.fee_per_member || 500,
      total_fee: resSlot.total_fee || 1500,
      payment_open: Boolean(resSlot.payment_open),
      claimed_teams: resSlot.claimed_teams ?? 0,
      max_teams: resSlot.max_teams ?? 60
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
      error: err.status === 413 ? err.message : 'Registration checkout service temporarily unavailable. Please retry.'
    });
  }
}
