import crypto from 'node:crypto';
import { callRpc, queryRest } from './supabaseAdmin.js';

const FALLBACK_GAS_URL = 'https://script.google.com/macros/s/AKfycbyYwNOj29rOCetf8DZhSFzLZQW1RBFq2HRrXmWM9joOuTn8Ant3nSVasbjwv5QjcQQFQw/exec';

export function getGasConfig() {
  return {
    url: process.env.GAS_WEBHOOK_URL || process.env.VITE_GOOGLE_APPS_SCRIPT_WEBHOOK_URL || FALLBACK_GAS_URL,
    secret: process.env.GAS_SHARED_SECRET || ''
  };
}

export function buildSignedGasEnvelope(action, payload) {
  const { secret } = getGasConfig();
  const timestamp = String(Date.now());
  const nonce = crypto.randomUUID();
  const teamId = String(payload?.teamId || payload?.team_id || 'GLOBAL');
  const signature = secret
    ? crypto.createHmac('sha256', secret).update(`${action}:${teamId}:${timestamp}:${nonce}`).digest('hex')
    : '';

  return {
    action,
    timestamp,
    nonce,
    signature,
    payload
  };
}

async function postEnvelopeOnce(url, envelope, fetchImpl = fetch) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 9000);
  try {
    const res = await fetchImpl(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(envelope),
      signal: controller.signal
    });

    const text = await res.text().catch(() => '');
    let parsed = null;
    try { parsed = JSON.parse(text); } catch {}

    if (!res.ok || (parsed && parsed.success === false)) {
      const err = new Error(parsed?.error || `GAS HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return parsed;
  } finally {
    clearTimeout(timer);
  }
}

export async function dispatchToGasWithSyncTracking({
  action,
  teamId,
  jobType,
  payload,
  syncJobId = null,
  inlineRetries = 1
}, fetchImpl = fetch, queryRestFn = queryRest) {
  const { url, secret } = getGasConfig();
  if (!url || !secret) {
    const msg = 'GAS_SHARED_SECRET not configured on server; queued in sync_jobs for automatic retry.';
    if (syncJobId) {
      await queryRestFn(`sync_jobs?id=eq.${syncJobId}`, {
        method: 'PATCH',
        body: {
          status: 'FAILED',
          last_error: msg,
          next_retry_at: new Date(Date.now() + 60000).toISOString(),
          updated_at: new Date().toISOString()
        }
      }, fetchImpl).catch(() => {});
    }
    return { synced: false, error: msg };
  }

  let lastErr = null;
  for (let attempt = 0; attempt <= inlineRetries; attempt++) {
    try {
      const envelope = buildSignedGasEnvelope(action, payload);
      const parsed = await postEnvelopeOnce(url, envelope, fetchImpl);

      if (syncJobId) {
        await queryRestFn(`sync_jobs?id=eq.${syncJobId}`, {
          method: 'PATCH',
          body: { status: 'SYNCED', last_error: null, claimed_at: null, updated_at: new Date().toISOString() }
        }, fetchImpl).catch(() => {});
      }
      if (teamId && action === 'register') {
        await queryRestFn(`teams?team_id=eq.${encodeURIComponent(teamId)}`, {
          method: 'PATCH',
          body: {
            gas_sync_status: 'synced',
            gas_last_error: null,
            gas_synced_at: new Date().toISOString(),
            drive_folder_url: parsed?.driveFolderUrl || null
          }
        }, fetchImpl).catch(() => {});
      }
      return { synced: true, response: parsed };
    } catch (err) {
      lastErr = err;
      const isTransient = !err?.status || err.status >= 500 || err.status === 429 || err?.name === 'AbortError';
      if (!isTransient || attempt >= inlineRetries) break;
      await new Promise((r) => setTimeout(r, 250 + Math.floor(Math.random() * 250)));
    }
  }

  const msg = String(lastErr?.message || 'GAS dispatch failed').slice(0, 300);
  if (syncJobId) {
    await queryRestFn(`sync_jobs?id=eq.${syncJobId}`, {
      method: 'PATCH',
      body: {
        status: 'FAILED',
        last_error: msg,
        claimed_at: null,
        next_retry_at: new Date(Date.now() + 45000).toISOString(),
        updated_at: new Date().toISOString()
      }
    }, fetchImpl).catch(() => {});
  }
  if (teamId && action === 'register') {
    await queryRestFn(`teams?team_id=eq.${encodeURIComponent(teamId)}`, {
      method: 'PATCH',
      body: { gas_sync_status: 'failed', gas_last_error: msg }
    }, fetchImpl).catch(() => {});
  }
  return { synced: false, error: msg };
}

/**
 * Automatically drains due PENDING / retryable FAILED sync jobs using DB claim lock
 * (`claim_due_sync_jobs`) so organizers do not need to click Retry Sync manually.
 */
export async function drainDueSyncJobs({
  limit = 3,
  callRpcFn = callRpc,
  queryRestFn = queryRest,
  fetchImpl = fetch
} = {}) {
  const { url, secret } = getGasConfig();
  if (!url || !secret) {
    return { processed: 0, synced: 0, failed: 0, skipped: 'GAS_SHARED_SECRET_NOT_SET' };
  }

  const jobs = await callRpcFn('claim_due_sync_jobs', { p_limit: limit });
  if (!Array.isArray(jobs) || jobs.length === 0) {
    return { processed: 0, synced: 0, failed: 0 };
  }

  let synced = 0;
  let failed = 0;
  for (const job of jobs) {
    if (!job?.team) continue;
    let action = 'register';
    let payload = {};
    if (job.job_type === 'REGISTER_SYNC') {
      action = 'register';
      payload = {
        teamId: job.team.team_id,
        teamName: job.team.team_name,
        trackId: job.team.track_id,
        problemCode: job.team.problem_code,
        academicTier: job.team.academic_tier,
        isShortlisted: job.team.is_shortlisted,
        isPaidVerified: job.team.is_paid_verified,
        utrNumber: job.team.utr_number,
        round1Status: job.team.round1_status,
        members: job.members || []
      };
    } else if (job.job_type === 'STATUS_SHEET_SYNC') {
      action = 'team_status_sync';
      payload = {
        teamId: job.team.team_id,
        isShortlisted: job.team.is_shortlisted,
        isPaidVerified: job.team.is_paid_verified,
        utrNumber: job.team.utr_number,
        round1Status: job.team.round1_status
      };
    } else if (job.job_type === 'PPT_SHEET_SYNC') {
      action = 'team_status_sync';
      payload = {
        teamId: job.team.team_id,
        isShortlisted: job.team.is_shortlisted,
        isPaidVerified: job.team.is_paid_verified,
        utrNumber: job.team.utr_number,
        round1Status: job.team.round1_status
      };
    } else {
      continue;
    }

    const res = await dispatchToGasWithSyncTracking({
      action,
      teamId: job.team_id,
      jobType: job.job_type,
      syncJobId: job.id,
      payload,
      inlineRetries: 0
    }, fetchImpl, queryRestFn);

    if (res.synced) synced++;
    else failed++;
  }

  return { processed: jobs.length, synced, failed };
}
