import crypto from 'node:crypto';

let cachedToken = null; // { accessToken, expiresAtMs }
let inflightRefresh = null;
const folderCache = new Map(); // folderKey -> folderId

let activeUploads = 0;
const MAX_CONCURRENT_DRIVE_UPLOADS = 12;
const waitQueue = [];

/**
 * Canonical Phase 3 Google Drive Workspace Structure (Organizer 5 TB Drive):
 * - 01_Official_Problem_Statements/       (Reference docs for Gemini judging)
 * - 02_Official_Evaluation_Rubrics/       (Scoring rubrics for Gemini judging)
 * - 03_Confirmed_Submissions/<CODE>/<ID>/ (Strictly LATEST confirmed PDF per team)
 * - 04_Archived_Versions/<CODE>/<ID>/     (Superseded prior versions moved on replacement)
 * - 05_Evaluation_Reports/                (Reserved for judging outputs)
 * - 06_Final_Shortlist/                   (Reserved for finalist cohort packages)
 *
 * Strictly isolated from judging materials:
 * - GOOGLE_DRIVE_RECEIPTS_FOLDER_ID (or 99_Private_Finance_And_PII/Round2_Payment_Receipts/)
 */
export const JUDGING_DRIVE_FOLDERS = {
  PROBLEM_STATEMENTS: '01_Official_Problem_Statements',
  RUBRICS: '02_Official_Evaluation_Rubrics',
  CONFIRMED_SUBMISSIONS: '03_Confirmed_Submissions',
  ARCHIVED_VERSIONS: '04_Archived_Versions',
  EVALUATION_REPORTS: '05_Evaluation_Reports',
  FINAL_SHORTLIST: '06_Final_Shortlist',
  PRIVATE_FINANCE_ROOT: '99_Private_Finance_And_PII',
  ROUND2_RECEIPTS: 'Round2_Payment_Receipts'
};

export async function withDriveConcurrency(fn) {
  if (activeUploads >= MAX_CONCURRENT_DRIVE_UPLOADS) {
    await new Promise((resolve) => waitQueue.push(resolve));
  }
  activeUploads++;
  try {
    return await fn();
  } finally {
    activeUploads--;
    const next = waitQueue.shift();
    if (next) next();
  }
}

/**
 * Cross-instance Postgres distributed upload semaphore (prevents N warm Vercel containers
 * from multiplying concurrent Drive API bursts beyond maxSlots).
 */
export async function withGlobalUploadSlot(attemptId, fn, { callRpcFn = null, maxSlots = 20, leaseSeconds = 45, maxWaitRetries = 6 } = {}) {
  if (!callRpcFn || !attemptId) {
    return await withDriveConcurrency(fn);
  }

  let acquired = false;
  for (let i = 0; i <= maxWaitRetries; i++) {
    const slotRes = await callRpcFn('acquire_upload_slot', {
      p_attempt_id: attemptId,
      p_max_slots: maxSlots,
      p_lease_seconds: leaseSeconds
    });

    if (slotRes?.acquired) {
      acquired = true;
      break;
    }

    if (i < maxWaitRetries) {
      const waitMs = 220 + Math.floor(Math.random() * 280);
      await new Promise((r) => setTimeout(r, waitMs));
    }
  }

  if (!acquired) {
    const err = new Error('Upload queue is momentarily full across active teams. Please retry in a few seconds.');
    err.status = 429;
    err.code = 'GLOBAL_UPLOAD_BUSY';
    throw err;
  }

  try {
    return await fn();
  } finally {
    await callRpcFn('release_upload_slot', { p_attempt_id: attemptId }).catch(() => {});
  }
}

export function getGoogleDriveConfig() {
  return {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN || '',
    rootFolderId: process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || '',
    receiptsFolderId: process.env.GOOGLE_DRIVE_RECEIPTS_FOLDER_ID || ''
  };
}

export function isGoogleDriveConfigured() {
  const cfg = getGoogleDriveConfig();
  return Boolean(cfg.clientId && cfg.clientSecret && cfg.refreshToken && cfg.rootFolderId);
}

/**
 * Truncated exponential backoff with full jitter for transient Drive 403/429/5xx errors.
 */
export async function retryWithBackoff(fn, { maxRetries = 3, baseDelayMs = 250, maxDelayMs = 4000 } = {}) {
  let attempt = 0;
  while (true) {
    try {
      return await fn(attempt);
    } catch (err) {
      const status = err?.status || 0;
      const isRetryable = status === 429 || status === 403 || status >= 500 || err?.name === 'AbortError' || err?.code === 'ETIMEDOUT';
      if (!isRetryable || attempt >= maxRetries) {
        throw err;
      }
      const exp = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt));
      const jitter = Math.floor(Math.random() * exp);
      await new Promise((r) => setTimeout(r, jitter));
      attempt++;
    }
  }
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 20000, fetchImpl = fetch) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetchImpl(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function getGoogleAccessToken(fetchImpl = fetch) {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAtMs > now + 60000) {
    return cachedToken.accessToken;
  }

  if (inflightRefresh) {
    return await inflightRefresh;
  }

  inflightRefresh = (async () => {
    const { clientId, clientSecret, refreshToken } = getGoogleDriveConfig();
    if (!clientId || !clientSecret || !refreshToken) {
      const err = new Error('Google Drive OAuth credentials are not configured on server.');
      err.code = 'DRIVE_NOT_CONFIGURED';
      err.status = 500;
      throw err;
    }

    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    });

    const res = await fetchWithTimeout('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    }, 10000, fetchImpl);

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.access_token) {
      const err = new Error(`Google OAuth refresh failed: ${data.error_description || data.error || res.status}`);
      err.status = res.status >= 500 ? 503 : 502;
      err.code = 'OAUTH_REFRESH_FAILED';
      throw err;
    }

    cachedToken = {
      accessToken: data.access_token,
      expiresAtMs: Date.now() + (Number(data.expires_in || 3600) * 1000)
    };
    return cachedToken.accessToken;
  })();

  try {
    return await inflightRefresh;
  } finally {
    inflightRefresh = null;
  }
}

export function resetDriveTokenCacheForTests() {
  cachedToken = null;
  folderCache.clear();
}

export async function ensureChildFolder(accessToken, parentId, folderName, fetchImpl = fetch) {
  const cleanName = String(folderName || '').trim();
  const cacheKey = `${parentId}:${cleanName}`;
  if (folderCache.has(cacheKey)) {
    return folderCache.get(cacheKey);
  }

  const safeQueryName = cleanName.replace(/'/g, "\\'");
  const q = encodeURIComponent(`name = '${safeQueryName}' and '${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
  const searchRes = await fetchWithTimeout(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)&pageSize=1&supportsAllDrives=true&includeItemsFromAllDrives=true`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
    10000,
    fetchImpl
  );

  if (searchRes.ok) {
    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      folderCache.set(cacheKey, searchData.files[0].id);
      return searchData.files[0].id;
    }
  }

  const createRes = await fetchWithTimeout(
    'https://www.googleapis.com/drive/v3/files?fields=id,name&supportsAllDrives=true',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: cleanName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId]
      })
    },
    10000,
    fetchImpl
  );

  if (!createRes.ok) {
    const errText = await createRes.text().catch(() => '');
    const err = new Error(`Failed creating Drive folder (${createRes.status}): ${errText}`);
    err.status = createRes.status;
    throw err;
  }

  const created = await createRes.json();
  folderCache.set(cacheKey, created.id);
  return created.id;
}

export async function ensureNestedFolderPath(accessToken, rootParentId, segments = [], fetchImpl = fetch) {
  let currentId = rootParentId;
  for (const seg of segments) {
    if (!seg) continue;
    currentId = await ensureChildFolder(accessToken, currentId, seg, fetchImpl);
  }
  return currentId;
}

export async function initializeJudgingWorkspace(problemCodes = [], fetchImpl = fetch) {
  const cfg = getGoogleDriveConfig();
  if (!cfg.rootFolderId) {
    throw new Error('GOOGLE_DRIVE_ROOT_FOLDER_ID is required.');
  }
  const accessToken = await getGoogleAccessToken(fetchImpl);

  const problemStatementsId = await ensureChildFolder(accessToken, cfg.rootFolderId, JUDGING_DRIVE_FOLDERS.PROBLEM_STATEMENTS, fetchImpl);
  const rubricsId = await ensureChildFolder(accessToken, cfg.rootFolderId, JUDGING_DRIVE_FOLDERS.RUBRICS, fetchImpl);
  const confirmedRootId = await ensureChildFolder(accessToken, cfg.rootFolderId, JUDGING_DRIVE_FOLDERS.CONFIRMED_SUBMISSIONS, fetchImpl);
  const archiveRootId = await ensureChildFolder(accessToken, cfg.rootFolderId, JUDGING_DRIVE_FOLDERS.ARCHIVED_VERSIONS, fetchImpl);
  const reportsId = await ensureChildFolder(accessToken, cfg.rootFolderId, JUDGING_DRIVE_FOLDERS.EVALUATION_REPORTS, fetchImpl);
  const shortlistId = await ensureChildFolder(accessToken, cfg.rootFolderId, JUDGING_DRIVE_FOLDERS.FINAL_SHORTLIST, fetchImpl);

  for (const code of problemCodes) {
    if (!code) continue;
    await ensureChildFolder(accessToken, confirmedRootId, code, fetchImpl);
    await ensureChildFolder(accessToken, archiveRootId, code, fetchImpl);
  }

  const privateFinanceId = cfg.receiptsFolderId
    ? cfg.receiptsFolderId
    : await ensureNestedFolderPath(accessToken, cfg.rootFolderId, [JUDGING_DRIVE_FOLDERS.PRIVATE_FINANCE_ROOT], fetchImpl);
  const round2ReceiptsId = await ensureChildFolder(accessToken, privateFinanceId, JUDGING_DRIVE_FOLDERS.ROUND2_RECEIPTS, fetchImpl);

  return {
    rootFolderId: cfg.rootFolderId,
    problemStatementsId,
    rubricsId,
    confirmedRootId,
    archiveRootId,
    reportsId,
    shortlistId,
    privateFinanceId,
    round2ReceiptsId
  };
}

export async function checkDriveOAuthHealth(fetchImpl = fetch) {
  const cfg = getGoogleDriveConfig();
  if (!cfg.clientId || !cfg.clientSecret || !cfg.refreshToken || !cfg.rootFolderId) {
    return { ok: false, error: 'Google Drive environment variables incomplete.' };
  }

  const accessToken = await getGoogleAccessToken(fetchImpl);
  const [aboutRes, rootRes] = await Promise.all([
    fetchWithTimeout(
      'https://www.googleapis.com/drive/v3/about?fields=user(emailAddress,displayName),storageQuota(limit,usage,usageInDrive)',
      { headers: { Authorization: `Bearer ${accessToken}` } },
      10000,
      fetchImpl
    ),
    fetchWithTimeout(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(cfg.rootFolderId)}?fields=id,name,shared,capabilities(canAddChildren,canEdit),permissions(id,type,role)&supportsAllDrives=true`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
      10000,
      fetchImpl
    )
  ]);

  if (!aboutRes.ok || !rootRes.ok) {
    return {
      ok: false,
      error: `Drive health check HTTP about=${aboutRes.status}, root=${rootRes.status}`
    };
  }

  const about = await aboutRes.json();
  const rootMeta = await rootRes.json();
  const publicPerms = Array.isArray(rootMeta.permissions)
    ? rootMeta.permissions.filter((p) => p.type === 'anyone')
    : [];

  return {
    ok: Boolean(rootMeta?.capabilities?.canAddChildren),
    account: about.user?.emailAddress || null,
    storageLimitBytes: about.storageQuota?.limit ? Number(about.storageQuota.limit) : null,
    storageUsageBytes: about.storageQuota?.usage ? Number(about.storageQuota.usage) : null,
    rootFolder: {
      id: rootMeta.id,
      name: rootMeta.name,
      canAddChildren: Boolean(rootMeta.capabilities?.canAddChildren),
      isPrivate: publicPerms.length === 0
    }
  };
}

export async function uploadBinaryToDriveAndVerify({
  parentFolderId,
  folderPathSegments = [],
  teamFolderName = '',
  fileName,
  mimeType,
  buffer,
  expectedMd5,
  description = 'VELTRAXX 2.0 File Upload'
}, fetchImpl = fetch) {
  return await withDriveConcurrency(async () => {
    return await retryWithBackoff(async () => {
      const accessToken = await getGoogleAccessToken(fetchImpl);
      const pathParts = folderPathSegments.length > 0
        ? folderPathSegments
        : (teamFolderName ? [teamFolderName] : []);

      const targetFolderId = pathParts.length > 0
        ? await ensureNestedFolderPath(accessToken, parentFolderId, pathParts, fetchImpl)
        : parentFolderId;

      const boundary = `vtx2_${crypto.randomBytes(12).toString('hex')}`;
      const metadata = JSON.stringify({
        name: fileName,
        parents: [targetFolderId],
        mimeType,
        description
      });

      const part1 = Buffer.from(
        `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n` +
        `--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`,
        'utf8'
      );
      const part3 = Buffer.from(`\r\n--${boundary}--`, 'utf8');
      const multipartBody = Buffer.concat([part1, buffer, part3]);

      const uploadRes = await fetchWithTimeout(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,size,md5Checksum,parents,webViewLink&supportsAllDrives=true',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': `multipart/related; boundary=${boundary}`,
            'Content-Length': String(multipartBody.length)
          },
          body: multipartBody
        },
        25000,
        fetchImpl
      );

      if (!uploadRes.ok) {
        const errBody = await uploadRes.text().catch(() => '');
        const err = new Error(`Drive upload failed (${uploadRes.status}): ${errBody}`);
        err.status = uploadRes.status;
        throw err;
      }

      const uploaded = await uploadRes.json();
      if (!uploaded?.id) {
        const err = new Error('Drive upload returned no file ID.');
        err.status = 502;
        throw err;
      }

      // Independent Read-After-Write Verification
      const verifyRes = await fetchWithTimeout(
        `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(uploaded.id)}?fields=id,name,size,md5Checksum,parents&supportsAllDrives=true`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
        10000,
        fetchImpl
      );

      if (!verifyRes.ok) {
        await fetchWithTimeout(
          `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(uploaded.id)}?supportsAllDrives=true`,
          { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } },
          5000,
          fetchImpl
        ).catch(() => {});
        const err = new Error(`Drive verification failed (${verifyRes.status}).`);
        err.status = verifyRes.status >= 500 ? 503 : 502;
        throw err;
      }

      const verified = await verifyRes.json();
      const verifiedSize = Number(verified.size || 0);
      if (verifiedSize !== buffer.length || (expectedMd5 && verified.md5Checksum && verified.md5Checksum !== expectedMd5)) {
        await fetchWithTimeout(
          `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(uploaded.id)}?supportsAllDrives=true`,
          { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } },
          5000,
          fetchImpl
        ).catch(() => {});
        const err = new Error('Uploaded file integrity verification mismatch. Please retry.');
        err.status = 502;
        err.code = 'DRIVE_INTEGRITY_MISMATCH';
        throw err;
      }

      return {
        fileId: verified.id,
        fileName: verified.name || fileName,
        sizeBytes: verifiedSize,
        md5Checksum: verified.md5Checksum || expectedMd5,
        parentFolderId: targetFolderId,
        previewUrl: `https://drive.google.com/file/d/${verified.id}/preview`,
        folderUrl: `https://drive.google.com/drive/folders/${targetFolderId}`
      };
    });
  });
}

/**
 * Moves a superseded submission file out of 03_Confirmed_Submissions/<PROBLEM_CODE>/<TEAM_ID>
 * into 04_Archived_Versions/<PROBLEM_CODE>/<TEAM_ID> cleanly after DB replacement confirms.
 */
export async function archiveDriveFile({
  fileId,
  rootFolderId,
  problemCode,
  teamId
}, fetchImpl = fetch) {
  if (!fileId || !rootFolderId || !problemCode || !teamId) return { archived: false };
  const accessToken = await getGoogleAccessToken(fetchImpl);

  const metaRes = await fetchWithTimeout(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?fields=id,parents&supportsAllDrives=true`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
    10000,
    fetchImpl
  );
  if (!metaRes.ok) return { archived: false };
  const meta = await metaRes.json();

  const archiveFolderId = await ensureNestedFolderPath(
    accessToken,
    rootFolderId,
    [JUDGING_DRIVE_FOLDERS.ARCHIVED_VERSIONS, problemCode, teamId],
    fetchImpl
  );

  const previousParents = Array.isArray(meta.parents) ? meta.parents.join(',') : '';
  const patchUrl = new URL(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`);
  patchUrl.searchParams.set('addParents', archiveFolderId);
  if (previousParents) patchUrl.searchParams.set('removeParents', previousParents);
  patchUrl.searchParams.set('supportsAllDrives', 'true');
  patchUrl.searchParams.set('fields', 'id,parents');

  const moveRes = await fetchWithTimeout(
    patchUrl.toString(),
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${accessToken}` }
    },
    10000,
    fetchImpl
  );

  return {
    archived: moveRes.ok,
    archiveFolderId,
    archiveFolderUrl: `https://drive.google.com/drive/folders/${archiveFolderId}`
  };
}

export async function downloadDriveFileBuffer(fileId, fetchImpl = fetch) {
  const accessToken = await getGoogleAccessToken(fetchImpl);
  const metaRes = await fetchWithTimeout(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?fields=id,name,mimeType,size&supportsAllDrives=true`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
    10000,
    fetchImpl
  );
  if (!metaRes.ok) {
    const err = new Error(`Drive file metadata fetch failed (${metaRes.status})`);
    err.status = metaRes.status;
    throw err;
  }
  const meta = await metaRes.json();

  const mediaRes = await fetchWithTimeout(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media&supportsAllDrives=true`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
    25000,
    fetchImpl
  );
  if (!mediaRes.ok) {
    const err = new Error(`Drive media download failed (${mediaRes.status})`);
    err.status = mediaRes.status;
    throw err;
  }
  const arrayBuf = await mediaRes.arrayBuffer();
  return {
    meta,
    buffer: Buffer.from(arrayBuf)
  };
}

export function extractDriveFileIdFromUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const m = url.match(/\/(?:d|folders)\/([a-zA-Z0-9_-]{10,})/) || url.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  return m ? m[1] : null;
}

async function findChildFolder(accessToken, parentId, folderName, fetchImpl = fetch) {
  const cleanName = String(folderName || '').trim();
  if (!parentId || !cleanName) return null;
  const safeQueryName = cleanName.replace(/'/g, "\\'");
  const q = encodeURIComponent(`name = '${safeQueryName}' and '${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
  const res = await fetchWithTimeout(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)&pageSize=5&supportsAllDrives=true&includeItemsFromAllDrives=true`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
    10000,
    fetchImpl
  );
  if (!res.ok) return null;
  const data = await res.json().catch(() => ({}));
  return Array.isArray(data.files) && data.files[0]?.id ? data.files[0].id : null;
}

async function findTeamPrefixFiles(accessToken, parentId, teamId, fetchImpl = fetch) {
  if (!parentId || !teamId) return [];
  const safePrefix = `${teamId}_`.replace(/'/g, "\\'");
  const q = encodeURIComponent(`name contains '${safePrefix}' and '${parentId}' in parents and trashed = false`);
  const res = await fetchWithTimeout(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)&pageSize=20&supportsAllDrives=true&includeItemsFromAllDrives=true`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
    10000,
    fetchImpl
  );
  if (!res.ok) return [];
  const data = await res.json().catch(() => ({}));
  return Array.isArray(data.files)
    ? data.files.filter((f) => f?.name?.startsWith(`${teamId}_`)).map((f) => f.id)
    : [];
}

async function deleteDriveItemById(accessToken, itemId, protectedIds, fetchImpl = fetch) {
  const cleanId = String(itemId || '').trim();
  if (!cleanId || protectedIds.has(cleanId)) return { id: cleanId, deleted: false, skipped: true };

  const res = await fetchWithTimeout(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(cleanId)}?supportsAllDrives=true`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` }
    },
    10000,
    fetchImpl
  );

  if (res.status === 404) {
    return { id: cleanId, deleted: false, alreadyMissing: true };
  }
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    const err = new Error(`Google Drive deletion failed for ${cleanId} (${res.status}): ${errText}`);
    err.status = res.status;
    err.code = 'DRIVE_DELETE_FAILED';
    throw err;
  }
  return { id: cleanId, deleted: true };
}

/**
 * Removes Drive artifacts belonging strictly to teamId across Confirmed Submissions,
 * Archived Versions, Round 2 Payment Receipts, and explicit file/folder IDs.
 * Never deletes shared parent, track, problem-code, or official event asset folders.
 */
export async function deleteDriveArtifactsForTeam({
  teamId,
  problemCode = '',
  fileIds = [],
  folderIds = []
}, fetchImpl = fetch) {
  const cleanTeamId = String(teamId || '').trim().toUpperCase();
  const cleanProblemCode = String(problemCode || '').trim().toUpperCase();
  if (!cleanTeamId) return { deletedCount: 0, deletedIds: [] };

  const cfg = getGoogleDriveConfig();
  const explicitIds = [...new Set([...fileIds, ...folderIds].map((x) => String(x || '').trim()).filter(Boolean))];
  if (!cfg.clientId || !cfg.clientSecret || !cfg.refreshToken) {
    if (explicitIds.length > 0) {
      const err = new Error('Google Drive OAuth credentials missing on server; cannot delete team Drive artifacts.');
      err.status = 500;
      err.code = 'DRIVE_NOT_CONFIGURED';
      throw err;
    }
    return { deletedCount: 0, deletedIds: [], skippedNoCredentials: true };
  }

  const protectedIds = new Set([cfg.rootFolderId, cfg.receiptsFolderId].filter(Boolean));
  const accessToken = await getGoogleAccessToken(fetchImpl);
  const targets = new Set(explicitIds);

  if (cfg.rootFolderId && cleanProblemCode) {
    for (const bucket of [JUDGING_DRIVE_FOLDERS.CONFIRMED_SUBMISSIONS, JUDGING_DRIVE_FOLDERS.ARCHIVED_VERSIONS]) {
      const bucketId = await findChildFolder(accessToken, cfg.rootFolderId, bucket, fetchImpl);
      if (bucketId) protectedIds.add(bucketId);
      const probId = bucketId ? await findChildFolder(accessToken, bucketId, cleanProblemCode, fetchImpl) : null;
      if (probId) protectedIds.add(probId);
      const teamSubfolderId = probId ? await findChildFolder(accessToken, probId, cleanTeamId, fetchImpl) : null;
      if (teamSubfolderId && !protectedIds.has(teamSubfolderId)) {
        targets.add(teamSubfolderId);
      }
    }
  }

  if (cfg.receiptsFolderId) {
    const receiptsSubId = await findChildFolder(accessToken, cfg.receiptsFolderId, JUDGING_DRIVE_FOLDERS.ROUND2_RECEIPTS, fetchImpl);
    if (receiptsSubId) {
      protectedIds.add(receiptsSubId);
      const teamReceiptFolderId = await findChildFolder(accessToken, receiptsSubId, cleanTeamId, fetchImpl);
      if (teamReceiptFolderId && !protectedIds.has(teamReceiptFolderId)) {
        targets.add(teamReceiptFolderId);
      }
      const prefixMatches = await findTeamPrefixFiles(accessToken, receiptsSubId, cleanTeamId, fetchImpl);
      for (const id of prefixMatches) targets.add(id);
    }
  }

  const deletedIds = [];
  for (const id of targets) {
    const outcome = await deleteDriveItemById(accessToken, id, protectedIds, fetchImpl);
    if (outcome.deleted) {
      deletedIds.push(id);
    }
  }

  return { deletedCount: deletedIds.length, deletedIds };
}
