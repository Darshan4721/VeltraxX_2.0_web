#!/usr/bin/env node
/**
 * VELTRAXX 2.0 - Phase 3 Google Drive Judging Workspace Initializer
 * Creates the canonical Gemini-ready folder hierarchy on the organizer's Drive:
 * - 01_Official_Problem_Statements/
 * - 02_Official_Evaluation_Rubrics/
 * - 03_Confirmed_Submissions/<PROBLEM_CODE>/
 * - 04_Archived_Versions/<PROBLEM_CODE>/
 * - 05_Evaluation_Reports/
 * - 06_Final_Shortlist/
 * - Separate Finance/PII container for Round2_Payment_Receipts/
 *
 * Requires GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, GOOGLE_DRIVE_ROOT_FOLDER_ID.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  JUDGING_DRIVE_FOLDERS,
  checkDriveOAuthHealth,
  initializeJudgingWorkspace,
  uploadBinaryToDriveAndVerify
} from '../api/_lib/googleDrive.js';
import { eventConfig } from '../src/config/eventConfig.js';

function getProblemCodes() {
  const codes = [];
  for (const t of eventConfig.tracks || []) {
    for (const p of t.problems || []) {
      if (p.code) codes.push(p.code);
    }
  }
  return codes;
}

async function main() {
  const health = await checkDriveOAuthHealth();
  if (!health.ok) {
    throw new Error(`Drive OAuth health check failed: ${health.error}`);
  }
  console.log(`[DRIVE AUTH] Connected account: ${health.account} | Root private: ${health.rootFolder.isPrivate}`);

  const codes = getProblemCodes();
  const folders = await initializeJudgingWorkspace(codes);
  console.log(`[DRIVE WORKSPACE] Initialized 6 judging folders + ${codes.length} problem-code buckets.`);

  const assetsToSync = [
    {
      localPath: 'public/downloads/VELTRAXX_2.0_Problem_Statements.pdf',
      folderSegments: [JUDGING_DRIVE_FOLDERS.PROBLEM_STATEMENTS],
      mimeType: 'application/pdf',
      name: 'VELTRAXX_2.0_Problem_Statements.pdf'
    },
    {
      localPath: 'public/downloads/VELTRAXX_2.0_Rulebook.pdf',
      folderSegments: [JUDGING_DRIVE_FOLDERS.PROBLEM_STATEMENTS],
      mimeType: 'application/pdf',
      name: 'VELTRAXX_2.0_Rulebook.pdf'
    },
    {
      localPath: 'docs/judging/VELTRAXX_2.0_Judging_Rubric.md',
      folderSegments: [JUDGING_DRIVE_FOLDERS.RUBRICS],
      mimeType: 'text/markdown',
      name: 'VELTRAXX_2.0_Judging_Rubric.md'
    }
  ];

  for (const item of assetsToSync) {
    const abs = path.resolve(process.cwd(), item.localPath);
    if (!fs.existsSync(abs)) {
      console.warn(`[SKIP] Missing asset: ${item.localPath}`);
      continue;
    }
    const buf = fs.readFileSync(abs);
    const md5 = crypto.createHash('md5').update(buf).digest('hex');
    const up = await uploadBinaryToDriveAndVerify({
      parentFolderId: folders.rootFolderId,
      folderPathSegments: item.folderSegments,
      fileName: item.name,
      mimeType: item.mimeType,
      buffer: buf,
      expectedMd5: md5,
      description: 'VELTRAXX 2.0 Official Judging Reference Material'
    });
    console.log(`[UPLOADED] ${item.folderSegments.join('/')}/${item.name} -> fileId=${up.fileId}`);
  }

  console.log('[SUCCESS] Phase 3 Drive judging workspace ready.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
