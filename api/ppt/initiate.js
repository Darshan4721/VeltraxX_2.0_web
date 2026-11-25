import { assertServerWritable, callRpc, extractClientIp, readJsonBody } from '../_lib/supabaseAdmin.js';
import { MAX_PDF_BYTES, MAX_PDF_PAGES } from '../_lib/pdfValidator.js';

export async function handleInitiatePpt(body, clientIp, { callRpcFn = callRpc } = {}) {
  assertServerWritable('PPT upload initiation');
  const cleanTeamId = String(body?.team_id || '').trim().toUpperCase();
  const cleanPasscode = String(body?.passcode || '').trim().toUpperCase();
  const fileName = String(body?.file_name || 'presentation.pdf').trim();
  const fileSize = Number(body?.file_size || 0);
  const fileSha256 = String(body?.file_sha256 || '').trim().toLowerCase();
  const pageCount = Number(body?.page_count || 0);
  const extractedText = String(body?.extracted_text || '').slice(0, 8000);
  const idempotencyKey = String(body?.idempotency_key || '').trim();

  if (!cleanTeamId || !cleanPasscode) {
    return { status: 400, body: { success: false, code: 'MISSING_CREDENTIALS', error: 'Team ID and Team Passcode are required.' } };
  }
  if (!idempotencyKey || idempotencyKey.length < 8) {
    return { status: 400, body: { success: false, code: 'MISSING_IDEMPOTENCY_KEY', error: 'Invalid upload session identifier. Please refresh and retry.' } };
  }
  if (!fileName.toLowerCase().endsWith('.pdf')) {
    return { status: 400, body: { success: false, code: 'INVALID_FILE_TYPE', error: 'Invalid PDF file. Only .pdf files are accepted.' } };
  }
  if (fileSize <= 0 || fileSize > MAX_PDF_BYTES) {
    return { status: 413, body: { success: false, code: 'FILE_TOO_LARGE', error: 'File exceeds the 3 MB limit.' } };
  }
  if (pageCount < 1 || pageCount > MAX_PDF_PAGES) {
    return { status: 400, body: { success: false, code: 'PAGE_COUNT_EXCEEDED', error: `PDF exceeds the maximum ${MAX_PDF_PAGES} slide limit.` } };
  }
  if (!/^[a-f0-9]{64}$/.test(fileSha256)) {
    return { status: 400, body: { success: false, code: 'INVALID_CHECKSUM', error: 'Invalid file integrity checksum. Please re-select your PDF.' } };
  }

  // Per-team and per-IP burst rate limiting
  const teamRl = await callRpcFn('check_rate_limit', {
    p_bucket_key: `ppt_init_team:${cleanTeamId}`,
    p_max_requests: 10,
    p_window_seconds: 600
  });
  if (teamRl && teamRl.allowed === false) {
    return {
      status: 429,
      body: { success: false, code: 'RATE_LIMITED', error: `Too many upload attempts for your team. Please retry in ${teamRl.retry_after_seconds || 30} seconds.` }
    };
  }

  const ipRl = await callRpcFn('check_rate_limit', {
    p_bucket_key: `ppt_init_ip:${clientIp}`,
    p_max_requests: 40,
    p_window_seconds: 600
  });
  if (ipRl && ipRl.allowed === false) {
    return {
      status: 429,
      body: { success: false, code: 'RATE_LIMITED', error: 'Upload service is temporarily busy. Please retry shortly.' }
    };
  }

  const initRes = await callRpcFn('initiate_ppt_submission', {
    p_team_id: cleanTeamId,
    p_passcode: cleanPasscode,
    p_file_name: fileName,
    p_file_size_bytes: fileSize,
    p_file_sha256: fileSha256,
    p_page_count: pageCount,
    p_extracted_text: extractedText,
    p_idempotency_key: idempotencyKey
  });

  if (!initRes || initRes.success === false) {
    const code = initRes?.code || 'INITIATE_FAILED';
    const status = code === 'INVALID_CREDENTIALS' ? 401
      : code === 'WINDOW_CLOSED' ? 403
      : code === 'UPLOAD_IN_PROGRESS' ? 409
      : code === 'FILE_TOO_LARGE' ? 413
      : 400;
    return { status, body: initRes };
  }

  return { status: 200, body: initRes };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed.' });
  }
  try {
    const body = await readJsonBody(req);
    const clientIp = extractClientIp(req);
    const result = await handleInitiatePpt(body, clientIp);
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('[api/ppt/initiate] error:', err);
    return res.status(err.status || 500).json({
      success: false,
      error: 'Upload service is temporarily busy. Please retry.'
    });
  }
}
