import sharp from 'sharp';
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
  <g transform="translate(64, 58)">
    <rect x="0" y="0" width="660" height="38" rx="8" fill="#1C1C26" stroke="#FFE500" stroke-width="2" />
    <circle cx="20" cy="19" r="6" fill="#B6FF00" />
    <text x="36" y="24" fill="#FFE500" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="13" font-weight="800" letter-spacing="2">
      SIET COIMBATORE · DEPARTMENT OF EE - VDT
    </text>
  </g>

  <!-- TNEA Code Pill -->
  <g transform="translate(886, 58)">
    <rect x="0" y="0" width="250" height="38" rx="8" fill="#B6FF00" stroke="#111116" stroke-width="2" />
    <text x="125" y="24" fill="#111116" font-family="'JetBrains Mono', monospace, Arial" font-size="14" font-weight="900" text-anchor="middle" letter-spacing="1">
      TNEA CODE: 2727
    </text>
  </g>

  <!-- Headline -->
  <g transform="translate(64, 154)">
    <text x="0" y="0" fill="#FFFFFF" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="56" font-weight="900" letter-spacing="-1">
      ARCHITECTING SILICON.
    </text>
    <text x="0" y="64" fill="#FF2E93" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="56" font-weight="900" letter-spacing="-1">
      EMPOWERING MINDS.
    </text>
  </g>

  <!-- Logic to Enterprise Badge -->
  <g transform="translate(64, 246)">
    <rect x="0" y="0" width="380" height="48" rx="10" fill="#FFE500" stroke="#111116" stroke-width="3" />
    <text x="190" y="31" fill="#111116" font-family="'JetBrains Mono', monospace, Arial" font-size="20" font-weight="900" text-anchor="middle" letter-spacing="1">
      [ LOGIC TO ENTERPRISE ]
    </text>
  </g>

  <!-- Subtitle Tagline -->
  <g transform="translate(64, 330)">
    <text x="0" y="0" fill="#00E5FF" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="20" font-weight="800" letter-spacing="2">
      VLSI DESIGN &amp; TECHNOLOGY · MEITY CHIPS TO STARTUP (C2S) HUB
    </text>
  </g>

  <!-- Vital Metrics Bento Row -->
  <g transform="translate(64, 368)">
    <rect x="0" y="0" width="255" height="122" rx="14" fill="#161620" stroke="#0055FF" stroke-width="2.5" />
    <text x="22" y="48" fill="#00E5FF" font-family="'JetBrains Mono', monospace" font-size="36" font-weight="900">17+</text>
    <text x="22" y="78" fill="#FFFFFF" font-family="'Plus Jakarta Sans', Arial" font-size="16" font-weight="800">SILICON ARCHITECTURES</text>
    <text x="22" y="100" fill="#A0A0B0" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="600">GPDK 90nm ASIC &amp; SoC</text>

    <rect x="275" y="0" width="255" height="122" rx="14" fill="#161620" stroke="#FFE500" stroke-width="2.5" />
    <text x="297" y="48" fill="#FFE500" font-family="'JetBrains Mono', monospace" font-size="36" font-weight="900">50+</text>
    <text x="297" y="78" fill="#FFFFFF" font-family="'Plus Jakarta Sans', Arial" font-size="16" font-weight="800">LINUX WORKSTATIONS</text>
    <text x="297" y="100" fill="#A0A0B0" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="600">Cadence &amp; Synopsys EDA</text>

    <rect x="550" y="0" width="255" height="122" rx="14" fill="#161620" stroke="#FF2E93" stroke-width="2.5" />
    <text x="572" y="48" fill="#FF2E93" font-family="'JetBrains Mono', monospace" font-size="36" font-weight="900">7</text>
    <text x="572" y="78" fill="#FFFFFF" font-family="'Plus Jakarta Sans', Arial" font-size="16" font-weight="800">SAMSUNG FELLOWS</text>
    <text x="572" y="100" fill="#A0A0B0" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="600">National Research Cohort</text>

    <rect x="825" y="0" width="247" height="122" rx="14" fill="#161620" stroke="#B6FF00" stroke-width="2.5" />
    <text x="847" y="48" fill="#B6FF00" font-family="'JetBrains Mono', monospace" font-size="36" font-weight="900">21+</text>
    <text x="847" y="78" fill="#FFFFFF" font-family="'Plus Jakarta Sans', Arial" font-size="16" font-weight="800">NPTEL SCHOLARS</text>
    <text x="847" y="100" fill="#A0A0B0" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="600">VLSI Interconnects Elite</text>
  </g>

  <!-- Footer Location Bar -->
  <g transform="translate(64, 548)">
    <text x="0" y="0" fill="#888898" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="600">
      SRI SHAKTHI INSTITUTE OF ENGINEERING AND TECHNOLOGY, COIMBATORE · ACADEMIC SHOWCASE
    </text>
    <text x="1072" y="0" fill="#FFE500" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="800" text-anchor="end">
      EE - VDT
    </text>
  </g>
</svg>
`;

async function generate() {
  const outputPath = path.join(process.cwd(), 'public', 'dept-og-banner.jpg');
  await sharp(Buffer.from(svg))
    .jpeg({ quality: 92 })
    .toFile(outputPath);
  console.log(`Generated dept-og-banner.jpg successfully at: ${outputPath}`);
}

generate().catch((err) => {
  console.error('Failed to generate dept-og-banner.jpg:', err);
  process.exit(1);
});
