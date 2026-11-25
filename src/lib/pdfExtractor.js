// ==============================================================================
// VELTRAXX 2.0 - CLIENT-SIDE PDF PARSER & INTEGRITY CHECKER
// Enforces strict 3 MB limit, max 8 slides (using pdf-lib for PowerPoint / Canva
// Object Stream compatibility), %PDF- header, %%EOF trailer, SHA-256, & bounded text.
// ==============================================================================

export const MAX_PDF_BYTES = 3 * 1024 * 1024; // 3,145,728 bytes (3.00 MB)
export const MAX_PDF_PAGES = 8;

async function computeSha256Hex(uint8Array) {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuf = await crypto.subtle.digest('SHA-256', uint8Array);
    return Array.from(new Uint8Array(hashBuf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return '';
}

export async function parsePdfBlueprint(file) {
  if (!file) {
    throw new Error('No PDF file provided.');
  }

  // 1. File Type Check
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (!isPdf) {
    throw new Error('Invalid PDF file. Only exported .pdf files are accepted.');
  }

  // 2. Strict 3 MB Cap
  if (file.size === 0) {
    throw new Error('Selected PDF file is empty.');
  }
  if (file.size > MAX_PDF_BYTES) {
    throw new Error(`File (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds 3 MB limit.`);
  }

  // 3. Read Binary Buffer
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Convert binary to latin1 string safely
  let binaryString = '';
  const CHUNK_SIZE = 65536;
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.subarray(i, i + CHUNK_SIZE);
    binaryString += String.fromCharCode.apply(null, chunk);
  }

  // Verify genuine %PDF- header and %%EOF marker
  if (!binaryString.slice(0, 32).includes('%PDF-')) {
    throw new Error('Invalid PDF file. Please export a genuine PDF from PowerPoint or Canva.');
  }
  if (!binaryString.slice(Math.max(0, binaryString.length - 4096)).includes('%%EOF')) {
    throw new Error('Corrupted or truncated PDF file. Please re-export and try again.');
  }

  // 4. Structural Page Count Detection via dynamic pdf-lib (handles compressed /ObjStm Canva & PPTX PDFs)
  let pageCount = 0;
  try {
    const { PDFDocument } = await import('pdf-lib');
    const pdfDoc = await PDFDocument.load(bytes, {
      ignoreEncryption: true,
      updateMetadata: false
    });
    if (pdfDoc.isEncrypted) {
      throw new Error('Password-protected PDFs cannot be evaluated. Please export an unencrypted PDF.');
    }
    pageCount = pdfDoc.getPageCount();
  } catch (err) {
    if (err?.message?.includes('Password-protected')) throw err;
    throw new Error('Could not read PDF structure. Please export a standard PDF from PowerPoint or Canva and retry.');
  }

  if (pageCount < 1) {
    throw new Error('Selected PDF contains zero pages.');
  }

  if (pageCount > MAX_PDF_PAGES) {
    throw new Error(`PDF contains ${pageCount} slides. Maximum allowed is ${MAX_PDF_PAGES} slides.`);
  }

  // 5. Text Extraction (uncompressed Tj/TJ streams, bounded to 8000 chars)
  const collectedSnippets = [];
  const tjRegex = /\(([^)]+)\)\s*Tj/g;
  let match;
  while ((match = tjRegex.exec(binaryString)) !== null) {
    const cleanSnippet = match[1]
      .replace(/\\([()\\])/g, '$1')
      .replace(/\\r/g, ' ')
      .replace(/\\n/g, ' ')
      .trim();
    if (cleanSnippet.length > 1 && !/[^\x20-\x7E]/.test(cleanSnippet)) {
      collectedSnippets.push(cleanSnippet);
    }
  }

  const tjArrayRegex = /\[([^\]]+)\]\s*TJ/g;
  while ((match = tjArrayRegex.exec(binaryString)) !== null) {
    const subStrings = match[1].match(/\(([^)]+)\)/g);
    if (subStrings) {
      const line = subStrings
        .map((s) => s.slice(1, -1).replace(/\\([()\\])/g, '$1').trim())
        .filter((s) => s.length > 0 && !/[^\x20-\x7E]/.test(s))
        .join(' ');
      if (line.length > 2) collectedSnippets.push(line);
    }
  }

  const extractedText = collectedSnippets.length > 0
    ? collectedSnippets.join(' \n ').slice(0, 8000)
    : `[Slide Count: ${pageCount} Pages] File: ${file.name} (Vector / Compressed Stream PDF).`;

  const sha256 = await computeSha256Hex(bytes);

  return {
    fileName: file.name,
    fileSizeBytes: file.size,
    fileSizeKB: Math.round(file.size / 1024),
    pageCount,
    extractedText,
    sha256
  };
}
