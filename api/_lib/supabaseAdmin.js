import crypto from 'node:crypto';

/**
 * Generates an unambiguous uppercase alphanumeric passcode (excludes O/0/I/1).
 */
export function generatePasscode(length = 8) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

export function getSupabaseConfig() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
  return { url, serviceKey, anonKey };
}

export function isServerSupabaseConfigured() {
  const { url, serviceKey } = getSupabaseConfig();
  return Boolean(url && serviceKey);
}

export function isServerPreviewBlocked() {
  const vercelEnv = String(process.env.VERCEL_ENV || '').toLowerCase();
  const { url } = getSupabaseConfig();
  return vercelEnv === 'preview' && url.includes('krkiwilhwppqauyhwlcw');
}

export function assertServerWritable(actionLabel = 'Mutation') {
  if (isServerPreviewBlocked()) {
    const err = new Error(`PREVIEW_READ_ONLY: ${actionLabel} against Production Supabase is blocked on Preview deployments.`);
    err.status = 403;
    err.code = 'PREVIEW_READ_ONLY';
    throw err;
  }
}

export async function callRpc(fnName, params = {}, fetchImpl = fetch) {
  const { url, serviceKey } = getSupabaseConfig();
  if (!url || !serviceKey) {
    throw new Error('SERVER_CONFIG_MISSING: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required on server.');
  }

  const res = await fetchImpl(`${url}/rest/v1/rpc/${fnName}`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let parsed;
    try { parsed = JSON.parse(text); } catch {}
    const err = new Error(parsed?.message || text || `Supabase RPC ${fnName} failed with HTTP ${res.status}`);
    err.status = res.status;
    err.code = parsed?.code || 'RPC_ERROR';
    throw err;
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return await res.json();
  }
  return null;
}

export async function queryRest(pathWithQuery, { method = 'GET', body = null, headers = {} } = {}, fetchImpl = fetch) {
  const { url, serviceKey } = getSupabaseConfig();
  if (!url || !serviceKey) {
    throw new Error('SERVER_CONFIG_MISSING: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required on server.');
  }

  const res = await fetchImpl(`${url}/rest/v1/${pathWithQuery}`, {
    method,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Supabase REST ${method} ${pathWithQuery} failed (${res.status}): ${text}`);
  }

  const text = await res.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
}

export async function verifyCoordinatorAuth(req, fetchImpl = fetch) {
  const authHeader = req.headers?.authorization || req.headers?.Authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    const err = new Error('UNAUTHORIZED: Missing coordinator Authorization Bearer token.');
    err.status = 401;
    throw err;
  }

  const { url, serviceKey, anonKey } = getSupabaseConfig();
  if (!url || !serviceKey) {
    const err = new Error('SERVER_CONFIG_MISSING: SUPABASE_SERVICE_ROLE_KEY not configured.');
    err.status = 500;
    throw err;
  }

  const userRes = await fetchImpl(`${url}/auth/v1/user`, {
    headers: {
      apikey: anonKey || serviceKey,
      Authorization: `Bearer ${token}`
    }
  });

  if (!userRes.ok) {
    const err = new Error('UNAUTHORIZED: Session expired or invalid token.');
    err.status = 401;
    throw err;
  }

  const user = await userRes.json();
  const email = (user?.email || '').trim().toLowerCase();
  if (!email) {
    const err = new Error('FORBIDDEN: Coordinator account email missing.');
    err.status = 403;
    throw err;
  }

  const allowRows = await queryRest(
    `coordinator_allowlist?email=eq.${encodeURIComponent(email)}&is_active=eq.true&select=email,role`,
    {},
    fetchImpl
  );

  if (!Array.isArray(allowRows) || allowRows.length === 0) {
    const err = new Error('FORBIDDEN: Account is not in the authorized coordinator directory.');
    err.status = 403;
    throw err;
  }

  return { email, role: allowRows[0].role, token };
}

export function extractClientIp(req) {
  const xff = req.headers?.['x-forwarded-for'] || '';
  if (typeof xff === 'string' && xff.trim()) {
    return xff.split(',')[0].trim();
  }
  return req.headers?.['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
}

export async function readJsonBody(req, maxBytes = 256 * 1024) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return req.body;
  }
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > maxBytes) {
      const err = new Error('Request JSON payload too large.');
      err.status = 413;
      throw err;
    }
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  return JSON.parse(raw);
}

export async function readBinaryBody(req, maxBytes) {
  if (Buffer.isBuffer(req.body)) {
    if (req.body.length > maxBytes) {
      const err = new Error('File exceeds the 3 MB size limit.');
      err.status = 413;
      throw err;
    }
    return req.body;
  }
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > maxBytes) {
      const err = new Error('File exceeds the 3 MB size limit.');
      err.status = 413;
      throw err;
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
