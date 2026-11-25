import crypto from 'node:crypto';
import { assertServerWritable, callRpc, readBinaryBody } from '../_lib/supabaseAdmin.js';
import { JUDGING_DRIVE_FOLDERS, getGoogleDriveConfig, uploadBinaryToDriveAndVerify } from '../_lib/googleDrive.js';

export const config = {
  api: {
    bodyParser: false
  }
};

const MAX_RECEIPT_BYTES = 2 * 1024 * 1024; // 2 MB

function detectImageType(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return null;
  // JPEG FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return { mime: 'image/jpeg', ext: 'jpg' };
  // PNG 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return { mime: 'image/png', ext: 'png' };
  // WEBP RIFF....WEBP
  if (buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP') return { mime: 'image/webp', ext: 'webp' };
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed.' });
  }

  try {
    assertServerWritable('Round 2 payment confirmation');
    const teamId = String(req.headers['x-team-id'] || '').trim().toUpperCase();
    const passcode = String(req.headers['x-passcode'] || '').trim().toUpperCase();
    const utrNumber = String(req.headers['x-utr-number'] || '').trim();

    if (!teamId || !passcode || !/^[0-9]{12}$/.test(utrNumber)) {
      return res.status(400).json({ success: false, error: 'Valid Team ID, Round 2 Passcode, and 12-digit UTR are required.' });
    }

    const buffer = await readBinaryBody(req, MAX_RECEIPT_BYTES);
    const imgType = detectImageType(buffer);
    if (!imgType) {
      return res.status(400).json({ success: false, error: 'Invalid image format. Upload a genuine JPG, PNG, or WEBP screenshot.' });
    }

    // 1. Verify shortlisted Round 2 credentials & 36h deadline before touching Drive
    const gate = await callRpc('verify_round2_gatekeeper', {
      p_team_id: teamId,
      p_passcode: passcode
    });
    if (!gate || !gate.valid) {
      return res.status(403).json({ success: false, error: gate?.error || 'Round 2 confirmation unauthorized or expired.' });
    }

    // 2. Upload screenshot to isolated Finance/PII Drive folder (strictly separate from Gemini judging folders)
    const driveCfg = getGoogleDriveConfig();
    const md5 = crypto.createHash('md5').update(buffer).digest('hex');
    const receiptsParentId = driveCfg.receiptsFolderId || driveCfg.rootFolderId;
    const receiptsPath = driveCfg.receiptsFolderId
      ? [JUDGING_DRIVE_FOLDERS.ROUND2_RECEIPTS, teamId]
      : [JUDGING_DRIVE_FOLDERS.PRIVATE_FINANCE_ROOT, JUDGING_DRIVE_FOLDERS.ROUND2_RECEIPTS, teamId];

    const driveFile = await uploadBinaryToDriveAndVerify({
      parentFolderId: receiptsParentId,
      folderPathSegments: receiptsPath,
      fileName: `${teamId}_UTR_${utrNumber}.${imgType.ext}`,
      mimeType: imgType.mime,
      buffer,
      expectedMd5: md5,
      description: `VELTRAXX 2.0 Private Round 2 Payment Receipt | Team: ${teamId} | UTR: ${utrNumber}`
    });

    const secureViewPath = `/api/admin/action?op=file&teamId=${encodeURIComponent(teamId)}&fileId=${encodeURIComponent(driveFile.fileId)}`;
    const payRes = await callRpc('submit_round2_payment', {
      p_team_id: teamId,
      p_passcode: passcode,
      p_utr_number: utrNumber,
      p_screenshot_url: secureViewPath,
      p_drive_file_id: driveFile.fileId
    });

    if (!payRes || payRes.success === false) {
      return res.status(400).json({ success: false, error: payRes?.error || 'Failed saving payment confirmation.' });
    }

    return res.status(200).json({
      success: true,
      drive_file_id: driveFile.fileId,
      message: payRes.message
    });
  } catch (err) {
    console.error('[api/round2/upload-receipt] error:', err);
    return res.status(err.status || 500).json({
      success: false,
      error: err.status === 413
        ? 'Payment screenshot exceeds the 2 MB limit.'
        : 'Unable to store payment receipt right now. Please retry.'
    });
  }
}
