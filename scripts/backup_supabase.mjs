#!/usr/bin/env node
/**
 * VELTRAXX 2.0 - Authorized Pre-Migration Backup Utility
 * Captures ALL live application tables, registrations, members, payment fields,
 * event configuration, live PostgREST OpenAPI schema & RPC signatures,
 * Auth/Storage metadata, applied schema/function/constraint/RLS baseline SQLs,
 * a deterministic PostgreSQL restore_data.sql script, and SHA-256 verification.
 *
 * Security:
 * - Reads SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY from environment or --env-file
 * - Stores output outside the Git repository by default (never committed to Git)
 * - Strips/blocks secrets from all output artifacts
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

function parseArgs(argv) {
  const args = { envFile: null, outDir: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--env-file' && argv[i + 1]) {
      args.envFile = argv[++i];
    } else if (a.startsWith('--env-file=')) {
      args.envFile = a.slice('--env-file='.length);
    } else if (a === '--out-dir' && argv[i + 1]) {
      args.outDir = argv[++i];
    } else if (a.startsWith('--out-dir=')) {
      args.outDir = a.slice('--out-dir='.length);
    }
  }
  return args;
}

function loadEnvFileIfProvided(envFile) {
  if (!envFile) return;
  const resolved = path.resolve(process.cwd(), envFile);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Env file not found: ${resolved}`);
  }
  const lines = fs.readFileSync(resolved, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

const CANONICAL_TABLES = [
  'event_state',
  'coordinator_allowlist',
  'teams',
  'members',
  'user_reports',
  'ppt_submission_attempts',
  'ppt_submissions',
  'sync_jobs',
  'admin_audit_logs',
  'upload_concurrency_slots',
  'rate_limit_buckets',
  'checkout_reservations'
];

const RESTORE_ORDER = [
  'event_state',
  'coordinator_allowlist',
  'teams',
  'members',
  'user_reports',
  'ppt_submission_attempts',
  'ppt_submissions',
  'sync_jobs',
  'admin_audit_logs',
  'upload_concurrency_slots',
  'rate_limit_buckets',
  'checkout_reservations'
];

const PRIMARY_KEY_BY_TABLE = {
  event_state: 'id',
  coordinator_allowlist: 'email',
  teams: 'team_id',
  members: 'id',
  user_reports: 'id',
  ppt_submission_attempts: 'id',
  ppt_submissions: 'id',
  sync_jobs: 'id',
  admin_audit_logs: 'id',
  upload_concurrency_slots: 'slot_id',
  rate_limit_buckets: 'bucket_key',
  checkout_reservations: 'id'
};

function isInsideGitRepo(targetPath) {
  try {
    const gitRoot = execSync('git rev-parse --show-toplevel', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString('utf8')
      .trim();
    const normRoot = path.resolve(gitRoot).toLowerCase();
    const normTarget = path.resolve(targetPath).toLowerCase();
    return normTarget === normRoot || normTarget.startsWith(normRoot + path.sep);
  } catch {
    return false;
  }
}

function defaultExternalBackupRoot() {
  if (fs.existsSync('D:\\')) {
    return 'D:\\veltraxx_2_0_backups';
  }
  return path.join(os.homedir(), 'veltraxx_2_0_backups');
}

async function fetchJson(url, serviceKey, extraHeaders = {}) {
  const res = await fetch(url, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      ...extraHeaders
    }
  });
  return res;
}

async function fetchTableAllRows(baseUrl, serviceKey, table) {
  const pageSize = 1000;
  let offset = 0;
  const allRows = [];
  let exactTotal = null;

  while (true) {
    const end = offset + pageSize - 1;
    const url = `${baseUrl}/rest/v1/${table}?select=*`;
    const res = await fetchJson(url, serviceKey, {
      Range: `${offset}-${end}`,
      Prefer: 'count=exact'
    });

    if (res.status === 404 || res.status === 400) {
      return { table, exists: false, count: 0, rows: [] };
    }
    if (!res.ok && res.status !== 206) {
      throw new Error(`Failed backing up ${table}: HTTP ${res.status} ${await res.text()}`);
    }

    const cr = res.headers.get('content-range');
    if (cr && cr.includes('/')) {
      const totalPart = cr.split('/')[1];
      if (totalPart && totalPart !== '*') {
        exactTotal = Number(totalPart);
      }
    }

    const batch = await res.json();
    if (!Array.isArray(batch)) {
      throw new Error(`Unexpected response format for ${table}`);
    }
    allRows.push(...batch);
    if (batch.length < pageSize) break;
    offset += pageSize;
  }

  return {
    table,
    exists: true,
    count: exactTotal ?? allRows.length,
    rows: allRows
  };
}

function sqlLiteral(val, colSchema) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  if (typeof val === 'number') return Number.isFinite(val) ? String(val) : 'NULL';
  if (Array.isArray(val)) {
    const t = colSchema?.type;
    const fmt = String(colSchema?.format || '').toLowerCase();
    if (t === 'array' || fmt.endsWith('[]')) {
      const items = val.map((v) => `'${String(v).replace(/'/g, "''")}'`).join(', ');
      return `ARRAY[${items}]::text[]`;
    }
    return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
  }
  if (typeof val === 'object') {
    return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
  }
  const str = String(val);
  const fmt = String(colSchema?.format || '').toLowerCase();
  if (fmt.includes('json')) {
    return `'${str.replace(/'/g, "''")}'::jsonb`;
  }
  return `'${str.replace(/'/g, "''")}'`;
}

function buildRestoreSql(archive, definitions = {}) {
  const lines = [
    '-- ==============================================================================',
    '-- VELTRAXX 2.0 - PRE-MIGRATION DATA RESTORE SCRIPT',
    `-- Generated At: ${archive.created_at}`,
    `-- Source Project: ${archive.supabase_url}`,
    '-- Note: Run against matching schema baseline (schema_baseline_sql/000..011).',
    '-- ==============================================================================',
    '',
    'BEGIN;',
    ''
  ];

  const orderedTables = [
    ...RESTORE_ORDER,
    ...Object.keys(archive.tables).filter((t) => !RESTORE_ORDER.includes(t))
  ];

  for (const tbl of orderedTables) {
    const entry = archive.tables[tbl];
    if (!entry || !entry.exists || entry.rows.length === 0) {
      lines.push(`-- Table public.${tbl}: ${entry?.exists ? '0 rows' : 'not present on source'}`);
      lines.push('');
      continue;
    }

    const colSchemas = definitions?.[tbl]?.properties || {};
    const cols = Object.keys(entry.rows[0]);
    const pkCol = PRIMARY_KEY_BY_TABLE[tbl];

    lines.push(`-- Restore public.${tbl} (${entry.rows.length} row(s))`);
    for (const row of entry.rows) {
      const colList = cols.map((c) => `"${c}"`).join(', ');
      const valList = cols.map((c) => sqlLiteral(row[c], colSchemas[c])).join(', ');
      const conflictClause = pkCol && cols.includes(pkCol) ? ` ON CONFLICT ("${pkCol}") DO NOTHING` : '';
      lines.push(`INSERT INTO public."${tbl}" (${colList}) VALUES (${valList})${conflictClause};`);
    }
    lines.push('');
  }

  // Re-align vtx2_team_seq safely past the highest existing VTX2-XXX team number
  const teamRows = archive.tables.teams?.rows || [];
  const maxTeamNum = teamRows.reduce((max, t) => {
    const m = String(t.team_id || '').match(/(\d+)$/);
    return m ? Math.max(max, parseInt(m[1], 10)) : max;
  }, 0);
  if (maxTeamNum > 0) {
    lines.push(`SELECT setval('public.vtx2_team_seq', GREATEST(${maxTeamNum}, (SELECT COALESCE(MAX((regexp_match(team_id, '(\\d+)$'))[1]::INT), 1) FROM public.teams)), true);`);
    lines.push('');
  }

  lines.push('COMMIT;', '');
  return lines.join('\n');
}

function sha256File(filePath) {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(filePath));
  return hash.digest('hex');
}

function walkFiles(dirPath, rootDir = dirPath) {
  const out = [];
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkFiles(full, rootDir));
    } else {
      out.push({
        rel: path.relative(rootDir, full).replace(/\\/g, '/'),
        full
      });
    }
  }
  return out;
}

async function main() {
  const cli = parseArgs(process.argv.slice(2));
  loadEnvFileIfProvided(cli.envFile);

  const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment or --env-file.');
    process.exit(1);
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const requestedOutDir = cli.outDir || process.env.BACKUP_OUT_DIR || path.join(defaultExternalBackupRoot(), `pre_migration_012_${stamp}`);
  const outDir = path.resolve(requestedOutDir);

  if (isInsideGitRepo(outDir)) {
    throw new Error(`Refusing to write secure backup inside Git repository: ${outDir}. Pass an external --out-dir.`);
  }

  fs.mkdirSync(path.join(outDir, 'tables'), { recursive: true });
  fs.mkdirSync(path.join(outDir, 'schema_baseline_sql'), { recursive: true });

  // 1. Query live PostgREST OpenAPI spec for live tables, columns & RPC signatures
  const specRes = await fetchJson(`${SUPABASE_URL}/rest/v1/`, SERVICE_KEY);
  if (!specRes.ok) {
    throw new Error(`Failed reading live OpenAPI schema: HTTP ${specRes.status}`);
  }
  const openApiSpec = await specRes.json();
  const discoveredTables = Object.keys(openApiSpec.paths || {})
    .filter((p) => p !== '/' && !p.startsWith('/rpc/'))
    .map((p) => p.replace(/^\//, ''));
  const liveRpcs = Object.keys(openApiSpec.paths || {})
    .filter((p) => p.startsWith('/rpc/'))
    .map((p) => p.replace(/^\/rpc\//, ''))
    .sort();

  const allTargetTables = Array.from(new Set([...CANONICAL_TABLES, ...discoveredTables]));

  // 2. Fetch all tables with pagination
  const archive = {
    created_at: new Date().toISOString(),
    supabase_url: SUPABASE_URL,
    live_rpcs: liveRpcs,
    tables: {}
  };

  for (const tbl of allTargetTables) {
    const tblData = await fetchTableAllRows(SUPABASE_URL, SERVICE_KEY, tbl);
    archive.tables[tbl] = tblData;
    if (tblData.exists) {
      fs.writeFileSync(path.join(outDir, 'tables', `${tbl}.json`), JSON.stringify(tblData.rows, null, 2), 'utf8');
    }
    console.log(`[BACKUP] ${tbl}: ${tblData.exists ? `${tblData.rows.length} row(s)` : 'not present (skipped)'}`);
  }

  // 3. Capture OpenAPI schema (table column definitions, FKs & RPC inputs)
  fs.writeFileSync(path.join(outDir, 'openapi_schema.json'), JSON.stringify(openApiSpec, null, 2), 'utf8');

  // 4. Capture Storage buckets & Auth user metadata (never stores tokens or hashes)
  const storageRes = await fetchJson(`${SUPABASE_URL}/storage/v1/bucket`, SERVICE_KEY);
  const storageBuckets = storageRes.ok ? await storageRes.json() : { error: `HTTP ${storageRes.status}` };

  const authUsersRes = await fetchJson(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=100`, SERVICE_KEY);
  let authUsersMeta = [];
  if (authUsersRes.ok) {
    const authJson = await authUsersRes.json();
    authUsersMeta = (authJson.users || []).map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      email_confirmed_at: u.email_confirmed_at,
      last_sign_in_at: u.last_sign_in_at,
      created_at: u.created_at
    }));
  }
  fs.writeFileSync(
    path.join(outDir, 'storage_and_auth_metadata.json'),
    JSON.stringify({ storage_buckets: storageBuckets, auth_users: authUsersMeta }, null, 2),
    'utf8'
  );

  // 5. Copy repo's pre-012 schema/function/constraint/RLS baseline SQL migrations (000..011 only)
  const sqlDir = path.resolve(process.cwd(), 'backend_sql');
  const baselineSqlFiles = fs
    .readdirSync(sqlDir)
    .filter((f) => f.endsWith('.sql') && !f.startsWith('012_'))
    .sort();
  for (const f of baselineSqlFiles) {
    fs.copyFileSync(path.join(sqlDir, f), path.join(outDir, 'schema_baseline_sql', f));
  }

  // 6. Write full combined JSON archive & transactional SQL data restoration script
  const mainArchivePath = path.join(outDir, `veltraxx_backup_${stamp}.json`);
  fs.writeFileSync(mainArchivePath, JSON.stringify(archive, null, 2), 'utf8');

  const restoreSql = buildRestoreSql(archive, openApiSpec.definitions || {});
  fs.writeFileSync(path.join(outDir, 'restore_data.sql'), restoreSql, 'utf8');

  // 7. Compute domain summary & verification checks
  const teamsRows = archive.tables.teams?.rows || [];
  const membersRows = archive.tables.members?.rows || [];
  const paidVerifiedCount = teamsRows.filter((t) => Boolean(t.is_paid_verified)).length;
  const utrSubmittedCount = teamsRows.filter((t) => Boolean(t.utr_number && String(t.utr_number).trim())).length;

  // Referential check: every member references an exported team_id
  const exportedTeamIds = new Set(teamsRows.map((t) => t.team_id));
  const orphanMembers = membersRows.filter((m) => !exportedTeamIds.has(m.team_id));
  if (orphanMembers.length > 0) {
    throw new Error(`Referential verification failed: ${orphanMembers.length} member(s) missing parent team.`);
  }

  // Check exact counts against Content-Range
  for (const [tbl, entry] of Object.entries(archive.tables)) {
    if (entry.exists && entry.rows.length !== entry.count) {
      throw new Error(`Count mismatch on ${tbl}: fetched ${entry.rows.length}, header count ${entry.count}`);
    }
  }

  // Build SHA-256 manifest for all files created so far
  const allFiles = walkFiles(outDir);
  const checksums = {};
  for (const f of allFiles) {
    const content = fs.readFileSync(f.full, 'utf8');
    if (content.includes(SERVICE_KEY)) {
      throw new Error(`SECURITY ABORT: SERVICE_KEY leaked into ${f.rel}`);
    }
    checksums[f.rel] = sha256File(f.full);
  }

  const manifest = {
    created_at: archive.created_at,
    backup_dir: outDir,
    outside_git_repo: !isInsideGitRepo(outDir),
    supabase_url: SUPABASE_URL,
    table_counts: Object.fromEntries(
      Object.entries(archive.tables).map(([k, v]) => [k, { exists: v.exists, count: v.rows.length }])
    ),
    live_rpc_count: liveRpcs.length,
    live_rpcs: liveRpcs,
    summary: {
      total_teams: teamsRows.length,
      total_members: membersRows.length,
      teams_with_utr_payment_evidence: utrSubmittedCount,
      teams_paid_verified: paidVerifiedCount,
      event_state_snapshot: archive.tables.event_state?.rows?.[0] || null,
      storage_buckets_count: Array.isArray(storageBuckets) ? storageBuckets.length : 0,
      auth_users_count: authUsersMeta.length
    },
    baseline_sql_files_included: baselineSqlFiles,
    limitations: [
      'Direct PostgreSQL pg_dump / pg_catalog queries (pg_proc bodies, pg_constraint expressions, pg_policies RLS SQL) could not run because no direct Postgres DATABASE_URL/password, pg_dump binary, or signed-in Supabase Management token is present locally.',
      'To compensate cleanly: live PostgREST OpenAPI column/FK/RPC metadata was captured directly from /rest/v1/, all row data was exported via service_role REST pagination into JSON + restore_data.sql, and the applied repo baseline SQL files (000..011) were archived alongside.'
    ],
    file_sha256: checksums
  };

  const manifestPath = path.join(outDir, 'BACKUP_MANIFEST.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  // Final re-parse & checksum verification
  const reParsedArchive = JSON.parse(fs.readFileSync(mainArchivePath, 'utf8'));
  const reParsedManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  for (const [rel, expectedSha] of Object.entries(reParsedManifest.file_sha256)) {
    const actualSha = sha256File(path.join(outDir, rel));
    if (actualSha !== expectedSha) {
      throw new Error(`Checksum verification failed on ${rel}`);
    }
  }
  for (const tbl of Object.keys(reParsedArchive.tables)) {
    if (reParsedArchive.tables[tbl].exists) {
      const tblJson = JSON.parse(fs.readFileSync(path.join(outDir, 'tables', `${tbl}.json`), 'utf8'));
      if (tblJson.length !== reParsedArchive.tables[tbl].rows.length) {
        throw new Error(`Per-table JSON mismatch on ${tbl}`);
      }
    }
  }

  console.log(`[VERIFIED] External backup complete & integrity verified at: ${outDir}`);
  console.log(`[SUMMARY] Teams: ${teamsRows.length}, Members: ${membersRows.length}, Live RPCs: ${liveRpcs.length}, Outside Git: ${!isInsideGitRepo(outDir)}`);
}

main().catch((err) => {
  console.error('[BACKUP ERROR]', err.message);
  process.exit(1);
});
