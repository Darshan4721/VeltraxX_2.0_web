const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const assetsDir = path.join(__dirname, '..', 'src', 'assets');
const publicDir = path.join(__dirname, '..', 'public');
const artifactDir = 'C:\\Users\\radar\\.gemini\\antigravity\\brain\\93d19e65-c140-4519-98aa-b50b1a9af512';
const previewDir = path.join(artifactDir, 'logo_showcase');

if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });
if (!fs.existsSync(previewDir)) fs.mkdirSync(previewDir, { recursive: true });

// --------------------------------------------------------------------------
// 1. CANONICAL ICON-ONLY MARK: src/assets/logo-mark.svg
// --------------------------------------------------------------------------
// Clean 1:1 square package (viewBox: 0 0 200 200)
// Dual-edge pins (3 on left, 3 on right), signature chamfered top-left corner
// with Solar Yellow #FFE500 accent plate and pin-1 via, and central geometric "V" cutout.
const canonicalLogoMarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <!-- Dual Edge Leads (Carbon Black #111116) -->
  <g fill="#111116">
    <rect x="12" y="74" width="24" height="15" rx="3" />
    <rect x="12" y="104" width="24" height="15" rx="3" />
    <rect x="12" y="134" width="24" height="15" rx="3" />

    <rect x="164" y="74" width="24" height="15" rx="3" />
    <rect x="164" y="104" width="24" height="15" rx="3" />
    <rect x="164" y="134" width="24" height="15" rx="3" />
  </g>

  <!-- Monolithic Die Body with EvenOdd Cutout for V Glyph -->
  <path fill-rule="evenodd" clip-rule="evenodd" fill="#111116" d="
    M 70 34 
    L 164 34 
    L 164 166 
    L 36 166 
    L 36 70 
    Z 
    M 67 72 
    L 88 72 
    L 100 105 
    L 112 72 
    L 133 72 
    L 110 134 
    L 90 134 
    Z
  " />

  <!-- Signature Chamfer Accent Corner (Solar Yellow #FFE500) -->
  <polygon points="36,70 70,34 52,34 36,50" fill="#FFE500" stroke="#111116" stroke-width="2" />
  <!-- Pin-1 Indicator Via -->
  <circle cx="52" cy="52" r="3.5" fill="#111116" />
</svg>`;

// Dark Background Variant of logo-mark (Swaps carbon black for crisp white)
const canonicalLogoMarkDarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <!-- Dual Edge Leads (#FFFFFF) -->
  <g fill="#FFFFFF">
    <rect x="12" y="74" width="24" height="15" rx="3" />
    <rect x="12" y="104" width="24" height="15" rx="3" />
    <rect x="12" y="134" width="24" height="15" rx="3" />

    <rect x="164" y="74" width="24" height="15" rx="3" />
    <rect x="164" y="104" width="24" height="15" rx="3" />
    <rect x="164" y="134" width="24" height="15" rx="3" />
  </g>

  <!-- Monolithic Die Body with EvenOdd Cutout for V Glyph (#FFFFFF) -->
  <path fill-rule="evenodd" clip-rule="evenodd" fill="#FFFFFF" d="
    M 70 34 
    L 164 34 
    L 164 166 
    L 36 166 
    L 36 70 
    Z 
    M 67 72 
    L 88 72 
    L 100 105 
    L 112 72 
    L 133 72 
    L 110 134 
    L 90 134 
    Z
  " />

  <!-- Signature Chamfer Accent Corner (Solar Yellow #FFE500) -->
  <polygon points="36,70 70,34 52,34 36,50" fill="#FFE500" stroke="#0D0D11" stroke-width="2" />
  <!-- Pin-1 Indicator Via -->
  <circle cx="52" cy="52" r="3.5" fill="#0D0D11" />
</svg>`;

// Pure Single-Color Silhouette (100% black on white, no yellow accent)
const canonicalLogoMarkMonoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <g fill="#000000">
    <rect x="12" y="74" width="24" height="15" rx="3" />
    <rect x="12" y="104" width="24" height="15" rx="3" />
    <rect x="12" y="134" width="24" height="15" rx="3" />
    <rect x="164" y="74" width="24" height="15" rx="3" />
    <rect x="164" y="104" width="24" height="15" rx="3" />
    <rect x="164" y="134" width="24" height="15" rx="3" />
  </g>
  <path fill-rule="evenodd" clip-rule="evenodd" fill="#000000" d="
    M 70 34 
    L 164 34 
    L 164 166 
    L 36 166 
    L 36 70 
    Z 
    M 67 72 
    L 88 72 
    L 100 105 
    L 112 72 
    L 133 72 
    L 110 134 
    L 90 134 
    Z
  " />
  <circle cx="52" cy="52" r="4.5" fill="#FFFFFF" />
</svg>`;

fs.writeFileSync(path.join(assetsDir, 'logo-mark.svg'), canonicalLogoMarkSvg.trim());
fs.writeFileSync(path.join(assetsDir, 'logo-mark-dark.svg'), canonicalLogoMarkDarkSvg.trim());
fs.writeFileSync(path.join(assetsDir, 'logo-mark-mono.svg'), canonicalLogoMarkMonoSvg.trim());

// --------------------------------------------------------------------------
// 2. FULL HORIZONTAL LOCKUP: src/assets/logo.svg & src/assets/logo-dark.svg
// --------------------------------------------------------------------------
// ViewBox: 0 0 390 84
// Icon Mark: x=2, y=6, size=72x72
// Wordmark: "VELTRAXX" x=90, y=51, font-size=44
// Badge: "2.0" x=318, y=25, size=58x28, font-size=17
// Subtitle: "SIET · DEPT OF EE (VLSI)" x=92, y=70, font-size=10.5
const fullLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 84" width="100%" height="100%">
  <!-- Icon Mark (Scaled & Positioned at x=2, y=6, size=72x72) -->
  <g transform="translate(2, 6) scale(0.36)">
    <!-- Dual Edge Leads -->
    <g fill="#111116">
      <rect x="12" y="74" width="24" height="15" rx="3" />
      <rect x="12" y="104" width="24" height="15" rx="3" />
      <rect x="12" y="134" width="24" height="15" rx="3" />

      <rect x="164" y="74" width="24" height="15" rx="3" />
      <rect x="164" y="104" width="24" height="15" rx="3" />
      <rect x="164" y="134" width="24" height="15" rx="3" />
    </g>

    <!-- Monolithic Die Body with Cutout V -->
    <path fill-rule="evenodd" clip-rule="evenodd" fill="#111116" d="
      M 70 34 
      L 164 34 
      L 164 166 
      L 36 166 
      L 36 70 
      Z 
      M 67 72 
      L 88 72 
      L 100 105 
      L 112 72 
      L 133 72 
      L 110 134 
      L 90 134 
      Z
    " />

    <!-- Chamfer Accent in Solar Yellow -->
    <polygon points="36,70 70,34 52,34 36,50" fill="#FFE500" stroke="#111116" stroke-width="2" />
    <circle cx="52" cy="52" r="3.5" fill="#111116" />
  </g>

  <!-- Wordmark: "VELTRAXX" -->
  <text 
    x="90" 
    y="51" 
    font-family="Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" 
    font-size="44" 
    font-weight="900" 
    letter-spacing="-1.5" 
    fill="#111116"
  >VELTRAXX</text>

  <!-- 2.0 Chamfered Solar Yellow Badge (Snugly aligned right after VELTRAXX) -->
  <g transform="translate(318, 25)">
    <!-- Chamfer polygon matching .chamfer-badge -->
    <polygon 
      points="5,0 54,0 58,4 58,24 54,28 5,28 0,24 0,4" 
      fill="#FFE500" 
      stroke="#111116" 
      stroke-width="2" 
    />
    <text 
      x="29" 
      y="20" 
      font-family="JetBrains Mono, monospace" 
      font-size="16.5" 
      font-weight="900" 
      letter-spacing="-0.5" 
      fill="#111116" 
      text-anchor="middle"
    >2.0</text>
  </g>

  <!-- Subtitle Tagline (SIET · DEPT OF EE (VLSI)) -->
  <text 
    x="92" 
    y="70" 
    font-family="JetBrains Mono, monospace" 
    font-size="10.5" 
    font-weight="800" 
    letter-spacing="1" 
    fill="#6B6B78"
  >SIET · DEPT OF EE (VLSI)</text>
</svg>`;

// Full Lockup Dark Background Variant (For Obsidian / Dark Sections)
const fullLogoDarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 84" width="100%" height="100%">
  <!-- Icon Mark (White outline/body for dark backgrounds) -->
  <g transform="translate(2, 6) scale(0.36)">
    <g fill="#FFFFFF">
      <rect x="12" y="74" width="24" height="15" rx="3" />
      <rect x="12" y="104" width="24" height="15" rx="3" />
      <rect x="12" y="134" width="24" height="15" rx="3" />

      <rect x="164" y="74" width="24" height="15" rx="3" />
      <rect x="164" y="104" width="24" height="15" rx="3" />
      <rect x="164" y="134" width="24" height="15" rx="3" />
    </g>

    <path fill-rule="evenodd" clip-rule="evenodd" fill="#FFFFFF" d="
      M 70 34 
      L 164 34 
      L 164 166 
      L 36 166 
      L 36 70 
      Z 
      M 67 72 
      L 88 72 
      L 100 105 
      L 112 72 
      L 133 72 
      L 110 134 
      L 90 134 
      Z
    " />

    <polygon points="36,70 70,34 52,34 36,50" fill="#FFE500" stroke="#0D0D11" stroke-width="2" />
    <circle cx="52" cy="52" r="3.5" fill="#0D0D11" />
  </g>

  <!-- Wordmark: "VELTRAXX" (Pure White) -->
  <text 
    x="90" 
    y="51" 
    font-family="Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" 
    font-size="44" 
    font-weight="900" 
    letter-spacing="-1.5" 
    fill="#FFFFFF"
  >VELTRAXX</text>

  <!-- 2.0 Chamfered Solar Yellow Badge -->
  <g transform="translate(318, 25)">
    <polygon 
      points="5,0 54,0 58,4 58,24 54,28 5,28 0,24 0,4" 
      fill="#FFE500" 
      stroke="#111116" 
      stroke-width="2" 
    />
    <text 
      x="29" 
      y="20" 
      font-family="JetBrains Mono, monospace" 
      font-size="16.5" 
      font-weight="900" 
      letter-spacing="-0.5" 
      fill="#111116" 
      text-anchor="middle"
    >2.0</text>
  </g>

  <!-- Subtitle Tagline (Yellow Accent on Dark Background) -->
  <text 
    x="92" 
    y="70" 
    font-family="JetBrains Mono, monospace" 
    font-size="10.5" 
    font-weight="800" 
    letter-spacing="1" 
    fill="#FFE500"
    opacity="0.85"
  >SIET · DEPT OF EE (VLSI)</text>
</svg>`;

fs.writeFileSync(path.join(assetsDir, 'logo.svg'), fullLogoSvg.trim());
fs.writeFileSync(path.join(assetsDir, 'logo-dark.svg'), fullLogoDarkSvg.trim());

// --------------------------------------------------------------------------
// 3. GENERATE PRODUCTION FAVICONS & APPLE TOUCH ICONS
// --------------------------------------------------------------------------
async function buildProductionAssets() {
  const markBuffer = Buffer.from(canonicalLogoMarkSvg);

  // 1. Apple Touch Icon (180x180) with 12% safe padding on cream background #FAF8F5
  const touchSize = 180;
  const pad = Math.round(touchSize * 0.12);
  const markInner = touchSize - (pad * 2);
  const innerBuf = await sharp(markBuffer).resize(markInner, markInner).toBuffer();

  await sharp({
    create: {
      width: touchSize,
      height: touchSize,
      channels: 4,
      background: { r: 250, g: 248, b: 245, alpha: 1 }
    }
  })
  .composite([{ input: innerBuf, top: pad, left: pad }])
  .png()
  .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // 2. Favicons
  await sharp(markBuffer).resize(32, 32).png().toFile(path.join(publicDir, 'favicon-32x32.png'));
  await sharp(markBuffer).resize(16, 16).png().toFile(path.join(publicDir, 'favicon-16x16.png'));
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), canonicalLogoMarkSvg.trim());

  // Multi-resolution ICO
  const png16 = await sharp(markBuffer).resize(16, 16).png().toBuffer();
  const png32 = await sharp(markBuffer).resize(32, 32).png().toBuffer();
  const png48 = await sharp(markBuffer).resize(48, 48).png().toBuffer();
  const icoBuf = createIco([png16, png32, png48], [16, 32, 48]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuf);

  // 3. Visual Previews for Verification
  // Light preview on Cream #FAF8F5
  const lightLogoBuf = await sharp(Buffer.from(fullLogoSvg)).resize(780, 168).toBuffer();
  await sharp({
    create: {
      width: 840,
      height: 210,
      channels: 4,
      background: { r: 250, g: 248, b: 245, alpha: 1 }
    }
  })
  .composite([{ input: lightLogoBuf, top: 21, left: 30 }])
  .png()
  .toFile(path.join(previewDir, 'full_logo_light.png'));

  // Dark preview on Obsidian #0D0D11
  const darkLogoBuf = await sharp(Buffer.from(fullLogoDarkSvg)).resize(780, 168).toBuffer();
  await sharp({
    create: {
      width: 840,
      height: 210,
      channels: 4,
      background: { r: 13, g: 13, b: 17, alpha: 1 }
    }
  })
  .composite([{ input: darkLogoBuf, top: 21, left: 30 }])
  .png()
  .toFile(path.join(previewDir, 'full_logo_dark.png'));

  console.log('Production assets and showcase previews successfully compiled.');
}

function createIco(pngBuffers, sizes) {
  const count = pngBuffers.length;
  const headerSize = 6;
  const entrySize = 16;
  const dirSize = headerSize + (entrySize * count);

  let totalSize = dirSize;
  pngBuffers.forEach(buf => totalSize += buf.length);

  const ico = Buffer.alloc(totalSize);
  ico.writeUInt16LE(0, 0);
  ico.writeUInt16LE(1, 2);
  ico.writeUInt16LE(count, 4);

  let currentOffset = dirSize;
  for (let i = 0; i < count; i++) {
    const size = sizes[i];
    const buf = pngBuffers[i];
    const entryOffset = headerSize + (i * entrySize);

    ico.writeUInt8(size >= 256 ? 0 : size, entryOffset + 0);
    ico.writeUInt8(size >= 256 ? 0 : size, entryOffset + 1);
    ico.writeUInt8(0, entryOffset + 2);
    ico.writeUInt8(0, entryOffset + 3);
    ico.writeUInt16LE(1, entryOffset + 4);
    ico.writeUInt16LE(32, entryOffset + 6);
    ico.writeUInt32LE(buf.length, entryOffset + 8);
    ico.writeUInt32LE(currentOffset, entryOffset + 12);

    buf.copy(ico, currentOffset);
    currentOffset += buf.length;
  }

  return ico;
}

buildProductionAssets().catch(console.error);
