import crypto from 'node:crypto';
import { PDFDocument } from 'pdf-lib';

export const MAX_PDF_BYTES = 3 * 1024 * 1024; // 3,145,728 bytes (strict 3 MB)
export const MAX_PDF_PAGES = 8;               // Published maximum slide count

/**
 * Validates raw PDF binary buffer server-side:
 * - Non-empty & <= 3 MB
 * - Valid %PDF- magic header & %%EOF trailer
 * - Structural PDF parsing via pdf-lib (handles PDF 1.5+ /ObjStm compressed PowerPoint & Canva exports)
 * - Unencrypted & accurate page count (1..8 pages)
 * - Computes SHA-256 + MD5 checksums for integrity verification
 */
export async function validatePdfBuffer(buffer, { maxBytes = MAX_PDF_BYTES, maxPages = MAX_PDF_PAGES } = {}) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    const err = new Error('Empty file uploaded. Please select a valid PDF document.');
    err.code = 'EMPTY_FILE';
    err.status = 400;
    throw err;
  }

  if (buffer.length > maxBytes) {
    const sizeMb = (buffer.length / (1024 * 1024)).toFixed(2);
    const err = new Error(`File (${sizeMb} MB) exceeds the strict 3 MB maximum limit.`);
    err.code = 'FILE_TOO_LARGE';
    err.status = 413;
    throw err;
  }

  // Check %PDF- magic signature near beginning of buffer
  const headerSlice = buffer.subarray(0, Math.min(buffer.length, 32)).toString('latin1');
  if (!headerSlice.includes('%PDF-')) {
    const err = new Error('Invalid PDF file. Only genuine exported .pdf documents are accepted.');
    err.code = 'INVALID_PDF_HEADER';
    err.status = 400;
    throw err;
  }

  // Check structural %%EOF trailer in trailing 4 KB to reject truncated uploads
  const tailStart = Math.max(0, buffer.length - 4096);
  const tailSlice = buffer.subarray(tailStart).toString('latin1');
  if (!tailSlice.includes('%%EOF')) {
    const err = new Error('Corrupted or incomplete PDF file (missing EOF marker). Please re-export and retry.');
    err.code = 'CORRUPTED_PDF';
    err.status = 400;
    throw err;
  }

  let pageCount = 0;
  try {
    const pdfDoc = await PDFDocument.load(buffer, {
      ignoreEncryption: true,
      updateMetadata: false
    });
    if (pdfDoc.isEncrypted) {
      const encErr = new Error('Password-protected PDFs cannot be evaluated. Please export an unencrypted PDF.');
      encErr.code = 'ENCRYPTED_PDF';
      encErr.status = 400;
      throw encErr;
    }
    pageCount = pdfDoc.getPageCount();
  } catch (err) {
    if (err?.code === 'ENCRYPTED_PDF') throw err;
    const parseErr = new Error('Corrupted or unreadable PDF structure. Please re-export from PowerPoint or Canva and retry.');
    parseErr.code = 'CORRUPTED_PDF';
    parseErr.status = 400;
    throw parseErr;
  }

  if (pageCount < 1) {
    const err = new Error('PDF contains zero readable pages.');
    err.code = 'EMPTY_PDF_PAGES';
    err.status = 400;
    throw err;
  }

  if (pageCount > maxPages) {
    const err = new Error(`PDF contains ${pageCount} slides. Maximum allowed is ${maxPages} slides.`);
    err.code = 'PAGE_COUNT_EXCEEDED';
    err.status = 400;
    throw err;
  }

  const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
  const md5 = crypto.createHash('md5').update(buffer).digest('hex');

  return {
    sizeBytes: buffer.length,
    pageCount,
    sha256,
    md5
  };
}
