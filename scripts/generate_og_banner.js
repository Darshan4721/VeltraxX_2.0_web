import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#22222E" stroke-width="1.5" />
    </pattern>
  </defs>

  <!-- Background Base -->
  <rect width="1200" height="630" fill="#0E0E11" />
  <rect width="1200" height="630" fill="url(#grid)" opacity="0.7" />

  <!-- Outer Neo-Brutalist Frame -->
  <rect x="24" y="24" width="1152" height="582" fill="none" stroke="#FFE500" stroke-width="4" rx="16" />
  <rect x="32" y="32" width="1136" height="566" fill="none" stroke="#1F1F2A" stroke-width="2" rx="12" />

  <!-- Department Header Pill -->
  <g transform="translate(64, 60)">
    <rect x="0" y="0" width="620" height="38" rx="8" fill="#1C1C26" stroke="#FFE500" stroke-width="2" />
    <circle cx="20" cy="19" r="6" fill="#B6FF00" />
    <text x="36" y="24" fill="#FFE500" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="13" font-weight="800" letter-spacing="2">
      SIET · DEPT OF ELECTRONICS ENGINEERING (VLSI DESIGN &amp; TECH)
    </text>
  </g>

  <!-- Free Round 1 Pill -->
  <g transform="translate(860, 60)">
    <rect x="0" y="0" width="276" height="38" rx="8" fill="#B6FF00" stroke="#111116" stroke-width="2" />
    <text x="138" y="24" fill="#111116" font-family="'JetBrains Mono', monospace, Arial" font-size="14" font-weight="900" text-anchor="middle" letter-spacing="1">
      ROUND 1: 100% FREE ENTRY
    </text>
  </g>

  <!-- Giant Title -->
  <g transform="translate(64, 180)">
    <text x="0" y="0" fill="#FFFFFF" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="78" font-weight="900" letter-spacing="-1">
      VELTRAXX
    </text>
    <rect x="424" y="-62" width="120" height="74" rx="12" fill="#FFE500" stroke="#111116" stroke-width="3" />
    <text x="484" y="-10" fill="#111116" font-family="'JetBrains Mono', monospace, Arial" font-size="52" font-weight="900" text-anchor="middle">
      2.0
    </text>
  </g>

  <!-- Subtitle Tagline -->
  <g transform="translate(64, 230)">
    <text x="0" y="0" fill="#00E5FF" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="24" font-weight="800" letter-spacing="3">
      NATIONAL-LEVEL 24-HOUR VLSI &amp; HARDWARE HACKATHON
    </text>
  </g>

  <!-- Value Badges -->
  <g transform="translate(64, 280)">
    <!-- Badge 1 -->
    <rect x="0" y="0" width="280" height="42" rx="10" fill="#FF2E93" stroke="#111116" stroke-width="2" />
    <text x="140" y="26" fill="#FFFFFF" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="800" text-anchor="middle">
      5 INDUSTRIAL TRACKS
    </text>

    <!-- Badge 2 -->
    <rect x="300" y="0" width="340" height="42" rx="10" fill="#FFE500" stroke="#111116" stroke-width="2" />
    <text x="470" y="26" fill="#111116" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="900" text-anchor="middle">
      EXCITING CASH PRIZE POOL
    </text>

    <!-- Badge 3 -->
    <rect x="660" y="0" width="412" height="42" rx="10" fill="#1A1A24" stroke="#00E5FF" stroke-width="2" />
    <text x="866" y="26" fill="#00E5FF" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="800" text-anchor="middle">
      OPEN TO ALL ENGINEERING BRANCHES
    </text>
  </g>

  <!-- Confirmed Roadmap Milestones Bento Box -->
  <g transform="translate(64, 360)">
    <!-- Phase 1 Card -->
    <rect x="0" y="0" width="510" height="130" rx="14" fill="#161620" stroke="#FFE500" stroke-width="2" />
    <text x="24" y="36" fill="#B6FF00" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" letter-spacing="1">
      PHASE 1 // ONLINE BLUEPRINT PITCH
    </text>
    <text x="24" y="70" fill="#FFFFFF" font-family="'Plus Jakarta Sans', Arial" font-size="22" font-weight="800">
      Registration Closes: Dec 01, 2026
    </text>
    <text x="24" y="100" fill="#A0A0B0" font-family="'Plus Jakarta Sans', Arial" font-size="14" font-weight="500">
      PPT Blueprint Submission Window: Dec 02 - Dec 03 (23:59 IST)
    </text>

    <!-- Phase 2 Card -->
    <rect x="530" y="0" width="542" height="130" rx="14" fill="#161620" stroke="#00E5FF" stroke-width="2" />
    <text x="554" y="36" fill="#00E5FF" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" letter-spacing="1">
      PHASE 2 // 24-HOUR OFFLINE FINALE
    </text>
    <text x="554" y="70" fill="#FFFFFF" font-family="'Plus Jakarta Sans', Arial" font-size="22" font-weight="800">
      Dec 15 - Dec 16, 2026
    </text>
    <text x="554" y="100" fill="#A0A0B0" font-family="'Plus Jakarta Sans', Arial" font-size="14" font-weight="500">
      Shortlisted Squads Enter the 24H Arena @ SIET Coimbatore
    </text>
  </g>

  <!-- Footer Location Bar -->
  <g transform="translate(64, 540)">
    <text x="0" y="0" fill="#888898" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="600">
      VENUE: SRI SHAKTHI INSTITUTE OF ENGINEERING AND TECHNOLOGY, COIMBATORE · COUNSELLING CODE: 2727
    </text>
    <text x="1072" y="0" fill="#FFE500" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="800" text-anchor="end">
      VELTRAXX.IN
    </text>
  </g>
</svg>
`;

async function generate() {
  const outputPath = path.join(process.cwd(), 'public', 'og-banner.jpg');
  await sharp(Buffer.from(svg))
    .jpeg({ quality: 92 })
    .toFile(outputPath);
  console.log(`Generated og-banner.jpg successfully at: ${outputPath}`);
}

generate().catch(err => {
  console.error("Failed to generate og-banner.jpg:", err);
  process.exit(1);
});

