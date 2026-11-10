const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const assetsDir = path.join(__dirname, '..', 'src', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// --------------------------------------------------------------------------
// VARIATION 1: The Classic Silicon QFP Notch Die
// --------------------------------------------------------------------------
const var1Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <!-- Chip Leads / Pins (Carbon Black #111116) -->
  <g fill="#111116">
    <!-- Left Pins -->
    <rect x="14" y="80" width="22" height="12" rx="2" />
    <rect x="14" y="108" width="22" height="12" rx="2" />
    <rect x="14" y="136" width="22" height="12" rx="2" />
    <!-- Right Pins -->
    <rect x="164" y="52" width="22" height="12" rx="2" />
    <rect x="164" y="80" width="22" height="12" rx="2" />
    <rect x="164" y="108" width="22" height="12" rx="2" />
    <rect x="164" y="136" width="22" height="12" rx="2" />
    <!-- Top Pins -->
    <rect x="94" y="14" width="12" height="22" rx="2" />
    <rect x="122" y="14" width="12" height="22" rx="2" />
    <rect x="150" y="14" width="12" height="22" rx="2" />
    <!-- Bottom Pins -->
    <rect x="52" y="164" width="12" height="22" rx="2" />
    <rect x="80" y="164" width="12" height="22" rx="2" />
    <rect x="108" y="164" width="12" height="22" rx="2" />
    <rect x="136" y="164" width="12" height="22" rx="2" />
  </g>

  <!-- Main Chip Package Body with EvenOdd Cutout for V Glyph -->
  <!-- Top-left chamfer from (36, 64) to (64, 36) -->
  <path fill-rule="evenodd" clip-rule="evenodd" fill="#111116" d="
    M 64 36 
    L 164 36 
    L 164 164 
    L 36 164 
    L 36 64 
    Z 
    M 68 70 
    L 87 70 
    L 100 106 
    L 113 70 
    L 132 70 
    L 109 132 
    L 91 132 
    Z
  " />

  <!-- Pin-1 Marker: Solar Yellow #FFE500 Accent Pad -->
  <circle cx="56" cy="56" r="7.5" fill="#FFE500" stroke="#111116" stroke-width="2.5" />
</svg>`;

// --------------------------------------------------------------------------
// VARIATION 2: The Chunky Faceted QFN (Ultra-High Favicon Legibility)
// --------------------------------------------------------------------------
const var2Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <!-- Chunky Castellated Edge Pads -->
  <g fill="#111116">
    <!-- Left Pads -->
    <rect x="14" y="86" width="20" height="18" rx="3" />
    <rect x="14" y="122" width="20" height="18" rx="3" />
    <!-- Right Pads -->
    <rect x="166" y="60" width="20" height="18" rx="3" />
    <rect x="166" y="96" width="20" height="18" rx="3" />
    <rect x="166" y="132" width="20" height="18" rx="3" />
    <!-- Top Pads -->
    <rect x="96" y="14" width="18" height="20" rx="3" />
    <rect x="132" y="14" width="18" height="20" rx="3" />
    <!-- Bottom Pads -->
    <rect x="60" y="166" width="18" height="20" rx="3" />
    <rect x="96" y="166" width="18" height="20" rx="3" />
    <rect x="132" y="166" width="18" height="20" rx="3" />
  </g>

  <!-- Heavy Die Body with Chamfer and Cutout V -->
  <path fill-rule="evenodd" clip-rule="evenodd" fill="#111116" d="
    M 70 32 
    L 168 32 
    L 168 168 
    L 32 168 
    L 32 70 
    Z 
    M 64 72 
    L 86 72 
    L 100 102 
    L 114 72 
    L 136 72 
    L 110 134 
    L 90 134 
    Z
  " />

  <!-- Pin-1 Gold Target Pad -->
  <rect x="46" y="46" width="15" height="15" rx="3" fill="#FFE500" stroke="#111116" stroke-width="2" />
  <circle cx="53.5" cy="53.5" r="3" fill="#111116" />

  <!-- Sub-Notch Horizontal Accent Dash -->
  <rect x="92" y="142" width="16" height="5" rx="1.5" fill="#FFE500" />
</svg>`;

// --------------------------------------------------------------------------
// VARIATION 3: The DFN Monolith with Angular Pin-1 Corner Plate
// --------------------------------------------------------------------------
const var3Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <!-- Dual Flat Leads (4 Left, 4 Right) -->
  <g fill="#111116">
    <rect x="12" y="52" width="24" height="14" rx="2" />
    <rect x="12" y="80" width="24" height="14" rx="2" />
    <rect x="12" y="108" width="24" height="14" rx="2" />
    <rect x="12" y="136" width="24" height="14" rx="2" />

    <rect x="164" y="52" width="24" height="14" rx="2" />
    <rect x="164" y="80" width="24" height="14" rx="2" />
    <rect x="164" y="108" width="24" height="14" rx="2" />
    <rect x="164" y="136" width="24" height="14" rx="2" />
  </g>

  <!-- Heavy Outer Package Body -->
  <path fill="#111116" d="
    M 66 34 
    L 166 34 
    L 166 166 
    L 34 166 
    L 34 66 
    Z
  " />

  <!-- Chamfer Pin-1 Accent Plate in Solar Yellow -->
  <polygon points="34,66 66,34 50,34 34,50" fill="#FFE500" />

  <!-- Inner Die Cavity (White / Transparent Window) -->
  <path fill-rule="evenodd" clip-rule="evenodd" fill="#FFFFFF" d="
    M 68 50 
    L 150 50 
    L 150 150 
    L 50 150 
    L 50 68 
    Z 
    M 70 66 
    L 88 66 
    L 100 98 
    L 112 66 
    L 130 66 
    L 108 126 
    L 92 126 
    Z
  " />

  <!-- Inner V Silicon Glyph (Carbon Black) -->
  <polygon points="70,66 88,66 100,98 112,66 130,66 108,126 92,126" fill="#111116" />
  
  <!-- Apex Via Pad -->
  <circle cx="100" cy="136" r="4.5" fill="#FFE500" stroke="#111116" stroke-width="2" />
</svg>`;

// Write SVGs to disk
fs.writeFileSync(path.join(assetsDir, 'logo-mark-var1.svg'), var1Svg.trim());
fs.writeFileSync(path.join(assetsDir, 'logo-mark-var2.svg'), var2Svg.trim());
fs.writeFileSync(path.join(assetsDir, 'logo-mark-var3.svg'), var3Svg.trim());

console.log('Saved 3 SVG variations to src/assets/');

// Generate preview PNGs for visual inspection
async function generatePreviews() {
  const previewDir = path.join(__dirname, '..', 'logo_previews');
  if (!fs.existsSync(previewDir)) {
    fs.mkdirSync(previewDir, { recursive: true });
  }

  await sharp(Buffer.from(var1Svg)).resize(400, 400).png().toFile(path.join(previewDir, 'var1_400px.png'));
  await sharp(Buffer.from(var1Svg)).resize(32, 32).png().toFile(path.join(previewDir, 'var1_32px.png'));
  await sharp(Buffer.from(var1Svg)).resize(16, 16).png().toFile(path.join(previewDir, 'var1_16px.png'));

  await sharp(Buffer.from(var2Svg)).resize(400, 400).png().toFile(path.join(previewDir, 'var2_400px.png'));
  await sharp(Buffer.from(var2Svg)).resize(32, 32).png().toFile(path.join(previewDir, 'var2_32px.png'));

  await sharp(Buffer.from(var3Svg)).resize(400, 400).png().toFile(path.join(previewDir, 'var3_400px.png'));
  await sharp(Buffer.from(var3Svg)).resize(32, 32).png().toFile(path.join(previewDir, 'var3_32px.png'));

  console.log('Generated PNG previews in logo_previews/');
}

generatePreviews().catch(console.error);
