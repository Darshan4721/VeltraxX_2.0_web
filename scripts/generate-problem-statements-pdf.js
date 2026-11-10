/**
 * ==============================================================================
 * VELTRAXX 2.0: OFFICIAL PROBLEM STATEMENTS PDF GENERATOR
 * File: scripts/generate-problem-statements-pdf.js
 * ==============================================================================
 * Compiles the canonical 25 Problem Statements Master Matrix (VTX-T1-01 to VTX-T5-05)
 * into a publication-grade, multi-page executive PDF using headless Edge printing.
 * 
 * Strict Quality Guardrails Enforced:
 * - Zero em-dashes (hyphens and colons only)
 * - True Neo-Brutalist & Smooth Curved Design Tokens
 * - Clean page breaks, table of contents, and evaluation rubrics
 * ==============================================================================
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import event configuration
import eventConfig from '../src/config/eventConfig.js';

function generateHtml() {
  const { event, tracks, contacts } = eventConfig;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>VELTRAXX 2.0 - Official Problem Statements Compendium</title>
<style>
  @page {
    size: A4 portrait;
    margin: 18mm 16mm 18mm 16mm;
    @bottom-right {
      content: counter(page);
    }
  }

  *, *:before, *:after {
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #111116;
    background-color: #FFFFFF;
    margin: 0;
    padding: 0;
    font-size: 10pt;
    line-height: 1.5;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* Page Break Controls */
  .page-break {
    page-break-before: always;
  }

  .avoid-break {
    page-break-inside: avoid;
  }

  /* Cover Page */
  .cover-page {
    min-height: 90vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 24px 0 10px 0;
    page-break-after: always;
  }

  .cover-header {
    border-bottom: 3px solid #111116;
    padding-bottom: 18px;
  }

  .inst-title {
    font-size: 13pt;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #111116;
    margin: 0 0 4px 0;
  }

  .inst-sub {
    font-size: 9pt;
    font-weight: 700;
    color: #0055FF;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .cover-hero {
    margin: 40px 0;
  }

  .pill-badge {
    display: inline-block;
    background: #111116;
    color: #FFE500;
    font-family: "Consolas", monospace;
    font-size: 8.5pt;
    font-weight: 900;
    padding: 4px 10px;
    border-radius: 6px;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 16px;
  }

  .event-title {
    font-size: 38pt;
    font-weight: 950;
    letter-spacing: -1.5px;
    line-height: 1.05;
    margin: 0 0 12px 0;
    color: #111116;
  }

  .event-tagline {
    font-size: 13pt;
    font-weight: 700;
    color: #111116;
    margin: 0 0 20px 0;
    line-height: 1.4;
  }

  .doc-title-card {
    background: #FAF8F5;
    border: 2.5px solid #111116;
    border-radius: 14px;
    padding: 20px 24px;
    margin: 24px 0;
  }

  .doc-title-main {
    font-size: 15pt;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.5px;
    color: #111116;
    margin: 0 0 6px 0;
  }

  .doc-title-desc {
    font-size: 9.5pt;
    color: #4B4B58;
    margin: 0;
    line-height: 1.5;
  }

  .cover-meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 14px;
    margin-top: 30px;
  }

  .meta-box {
    border: 2px solid #111116;
    border-radius: 10px;
    padding: 12px 14px;
    background: #FFFFFF;
  }

  .meta-label {
    font-family: "Consolas", monospace;
    font-size: 7.5pt;
    font-weight: 900;
    text-transform: uppercase;
    color: #6B6B78;
    margin-bottom: 4px;
  }

  .meta-value {
    font-size: 10pt;
    font-weight: 800;
    color: #111116;
  }

  .cover-footer {
    border-top: 2px solid #111116;
    padding-top: 14px;
    display: flex;
    justify-content: space-between;
    font-size: 8pt;
    color: #6B6B78;
    font-family: "Consolas", monospace;
  }

  /* Section Headers */
  .section-header {
    border-bottom: 2.5px solid #111116;
    padding-bottom: 10px;
    margin: 0 0 20px 0;
  }

  .section-eyebrow {
    font-family: "Consolas", monospace;
    font-size: 8pt;
    font-weight: 900;
    text-transform: uppercase;
    color: #0055FF;
    letter-spacing: 1px;
    margin-bottom: 4px;
  }

  .section-title {
    font-size: 17pt;
    font-weight: 900;
    letter-spacing: -0.5px;
    color: #111116;
    margin: 0;
    text-transform: uppercase;
  }

  /* Framework Cards */
  .framework-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 12px;
    margin-bottom: 24px;
  }

  .rule-card {
    border: 2px solid #111116;
    border-radius: 12px;
    padding: 14px;
    background: #FAF8F5;
  }

  .rule-num {
    display: inline-block;
    background: #FFE500;
    color: #111116;
    font-family: "Consolas", monospace;
    font-size: 8pt;
    font-weight: 900;
    padding: 2px 7px;
    border-radius: 4px;
    border: 1px solid #111116;
    margin-bottom: 8px;
  }

  .rule-heading {
    font-size: 9.5pt;
    font-weight: 900;
    color: #111116;
    margin: 0 0 6px 0;
  }

  .rule-text {
    font-size: 8.5pt;
    color: #33333E;
    margin: 0;
    line-height: 1.45;
  }

  /* Track Chapter Banner */
  .track-banner {
    background: #111116;
    color: #FFFFFF;
    border-radius: 12px;
    padding: 16px 20px;
    margin-bottom: 20px;
  }

  .track-banner-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }

  .track-code-pill {
    background: #FFE500;
    color: #111116;
    font-family: "Consolas", monospace;
    font-size: 9pt;
    font-weight: 900;
    padding: 3px 8px;
    border-radius: 6px;
  }

  .track-branches {
    font-family: "Consolas", monospace;
    font-size: 8pt;
    color: #E2E8F0;
  }

  .track-banner-title {
    font-size: 14pt;
    font-weight: 900;
    letter-spacing: -0.3px;
    margin: 0 0 4px 0;
    color: #FFFFFF;
  }

  .track-banner-desc {
    font-size: 8.5pt;
    color: #CBD5E1;
    margin: 0;
    line-height: 1.4;
  }

  /* Problem Card */
  .problem-card {
    border: 2px solid #111116;
    border-radius: 12px;
    padding: 14px 16px;
    background: #FFFFFF;
    margin-bottom: 14px;
  }

  .problem-top-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    padding-bottom: 6px;
    border-bottom: 1.5px solid #F1F1F4;
  }

  .problem-code {
    background: #111116;
    color: #FFE500;
    font-family: "Consolas", monospace;
    font-size: 9pt;
    font-weight: 900;
    padding: 2px 8px;
    border-radius: 5px;
  }

  .problem-badge {
    font-family: "Consolas", monospace;
    font-size: 7.5pt;
    font-weight: 900;
    color: #0055FF;
    text-transform: uppercase;
  }

  .problem-title {
    font-size: 11pt;
    font-weight: 800;
    color: #111116;
    margin: 0 0 8px 0;
    line-height: 1.35;
  }

  .problem-challenge {
    font-size: 8.8pt;
    color: #2D3748;
    margin: 0 0 10px 0;
    line-height: 1.5;
  }

  .problem-challenge strong {
    color: #111116;
  }

  .deliverables-box {
    background: #FAF8F5;
    border: 1.5px solid #111116;
    border-radius: 8px;
    padding: 9px 12px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .deliv-tier {
    font-size: 8pt;
    line-height: 1.45;
  }

  .tier-tag {
    display: inline-block;
    font-family: "Consolas", monospace;
    font-size: 7pt;
    font-weight: 900;
    padding: 2px 5px;
    border-radius: 4px;
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  .tier-a-tag {
    background: #0055FF;
    color: #FFFFFF;
  }

  .tier-b-tag {
    background: #111116;
    color: #FFE500;
  }

  /* Table of Contents */
  .toc-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 8.5pt;
    margin-top: 10px;
  }

  .toc-table th {
    background: #111116;
    color: #FFFFFF;
    font-family: "Consolas", monospace;
    font-size: 8pt;
    font-weight: 900;
    text-align: left;
    padding: 7px 10px;
  }

  .toc-table td {
    padding: 6px 10px;
    border-bottom: 1px solid #E2E8F0;
  }

  .toc-table tr:nth-child(even) td {
    background: #FAF8F5;
  }

  /* Contacts & Guidelines */
  .contact-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-top: 12px;
  }

  .contact-box {
    border: 2px solid #111116;
    border-radius: 10px;
    padding: 12px;
    background: #FAF8F5;
  }

  .contact-heading {
    font-family: "Consolas", monospace;
    font-size: 8pt;
    font-weight: 900;
    text-transform: uppercase;
    color: #0055FF;
    margin-bottom: 8px;
    border-bottom: 1.5px solid #111116;
    padding-bottom: 4px;
  }

  .contact-item {
    font-size: 8.5pt;
    margin-bottom: 6px;
    line-height: 1.35;
  }

  .contact-item strong {
    color: #111116;
  }
</style>
</head>
<body>

<!-- ========================================================================= -->
<!-- COVER PAGE                                                                -->
<!-- ========================================================================= -->
<div class="cover-page">
  <div class="cover-header">
    <div class="inst-title">${event.institution.name} (Autonomous)</div>
    <div class="inst-sub">${event.institution.department}</div>
  </div>

  <div class="cover-hero">
    <div class="pill-badge">OFFICIAL HACKATHON DIRECTIVE // 2026 EDITION</div>
    <div class="event-title">VELTRAXX 2.0</div>
    <div class="event-tagline">National-Level 2-Stage Tech &amp; Silicon Hackathon</div>

    <div class="doc-title-card">
      <div class="doc-title-main">Problem Statements Master Compendium</div>
      <div class="doc-title-desc">
        The authoritative catalog of 25 industrial-grade engineering problem statements across ASIC Design, FPGA Acceleration, Edge AI, Cyber-Physical Systems, and Open Hardware Innovation.
      </div>
    </div>

    <div class="cover-meta-grid">
      <div class="meta-box">
        <div class="meta-label">Total Statements</div>
        <div class="meta-value">25 Problem Statements</div>
      </div>
      <div class="meta-box">
        <div class="meta-label">Domain Tracks</div>
        <div class="meta-value">5 Industrial Tracks</div>
      </div>
      <div class="meta-box">
        <div class="meta-label">Evaluation Tiers</div>
        <div class="meta-value">Tier A (Jr UG) · Tier B (Sr UG/PG)</div>
      </div>
      <div class="meta-box">
        <div class="meta-label">Round 1 Free Reg</div>
        <div class="meta-value">Till 01 Dec 2026 (11:59 PM)</div>
      </div>
      <div class="meta-box">
        <div class="meta-label">PPT Blueprint Window</div>
        <div class="meta-value">02 Dec to 03 Dec 2026</div>
      </div>
      <div class="meta-box">
        <div class="meta-label">24H Offline Finale</div>
        <div class="meta-value">15 Dec to 16 Dec 2026</div>
      </div>
    </div>
  </div>

  <div class="cover-footer">
    <div>Sri Shakthi Institute of Engineering and Technology, Coimbatore - 641062</div>
    <div>Portal: veltraxx.in · Free Round 1 Entry</div>
  </div>
</div>

<!-- ========================================================================= -->
<!-- SECTION 1: ARCHITECTURAL FRAMEWORK & THE 3 RULES                          -->
<!-- ========================================================================= -->
<div class="page-break"></div>

<div class="section-header">
  <div class="section-eyebrow">EXECUTIVE FRAMEWORK</div>
  <h2 class="section-title">The Three Built-In Anti-Cheat Architecture Rules</h2>
</div>

<p style="font-size: 9.5pt; color: #33333E; line-height: 1.6; margin-bottom: 20px;">
  To convert 1,000+ engineers across disciplines while rendering copy-paste submissions ineffective, every problem statement in VELTRAXX 2.0 is governed by three rigorous technical parameters:
</p>

<div class="framework-grid">
  <div class="rule-card">
    <div class="rule-num">RULE 01</div>
    <div class="rule-heading">Broad Hook, Modular Core</div>
    <div class="rule-text">
      Round 1 requires the foundational architecture, modular block diagram, and concrete Slide 5 Proof of Competence. On December 15, the jury injects a Day-1 Live Twist (bus width changes, parity/fault injection, or sensor failover) that builds directly on your modular core without breaking it.
    </div>
  </div>

  <div class="rule-card">
    <div class="rule-num">RULE 02</div>
    <div class="rule-heading">Dual-Tier Evaluation</div>
    <div class="rule-text">
      <strong>Tier A (1st &amp; 2nd Year UG - Junior Division):</strong> Graded on architectural logic, functional simulation (Icarus / EDA Playground / Proteus / Wokwi / Python), and working flow.<br><br>
      <strong>Tier B (3rd &amp; 4th Year UG, PG &amp; Scholars - Senior Division):</strong> Graded on RTL synthesis / PPA reports, timing/power closure, and edge hardware deployment.
    </div>
  </div>

  <div class="rule-card">
    <div class="rule-num">RULE 03</div>
    <div class="rule-heading">Branch Inclusivity</div>
    <div class="rule-text">
      Tracks 1 and 2 cater to hardcore VLSI, Microelectronics, ECE, and Instrumentation builders. Tracks 3 and 4 engage CSE, IT, AI &amp; DS, EEE, and Mechatronics engineers. Track 5 acts as an open multidisciplinary innovation magnet.
    </div>
  </div>
</div>

<!-- Table of Contents -->
<div class="avoid-break" style="margin-top: 30px;">
  <div class="section-header" style="margin-bottom: 12px;">
    <div class="section-eyebrow">MASTER DIRECTORY</div>
    <h2 class="section-title">Table of Tracks &amp; Problem Statements</h2>
  </div>

  <table class="toc-table">
    <thead>
      <tr>
        <th style="width: 15%;">Track Code</th>
        <th style="width: 35%;">Track Name</th>
        <th style="width: 35%;">Problem Code Range</th>
        <th style="width: 15%;">Statements</th>
      </tr>
    </thead>
    <tbody>
      ${tracks.map(t => `
        <tr>
          <td><strong>${t.code}</strong></td>
          <td>${t.name}</td>
          <td><code>${t.problems[0].code}</code> to <code>${t.problems[t.problems.length - 1].code}</code></td>
          <td><strong>${t.problems.length} Problems</strong></td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</div>

<!-- ========================================================================= -->
<!-- TRACK CHAPTERS (1 TO 5)                                                   -->
<!-- ========================================================================= -->
${tracks.map((track, trackIdx) => `
<div class="page-break"></div>

<div class="track-banner">
  <div class="track-banner-top">
    <span class="track-code-pill">TRACK 0${trackIdx + 1} // ${track.code}</span>
    <span class="track-branches">Target Branches: ${track.targetBranches || track.domain}</span>
  </div>
  <div class="track-banner-title">${track.name}</div>
  <div class="track-banner-desc">${track.description}</div>
</div>

<div class="track-problems-list">
  ${track.problems.map(prob => `
    <div class="problem-card avoid-break">
      <div class="problem-top-row">
        <span class="problem-code">${prob.code}</span>
        <span class="problem-badge">National Level Industrial Spec</span>
      </div>
      <div class="problem-title">${prob.title}</div>
      <div class="problem-challenge">
        <strong>The Challenge:</strong> ${prob.challenge}
      </div>
      ${(prob.tierA || prob.tierB) ? `
      <div class="deliverables-box">
        <div class="deliv-tier">
          <span class="tier-tag tier-a-tag">Tier A (1st / 2nd Yr UG)</span>
          <div>${prob.tierA || 'Functional simulation and verified logic flow.'}</div>
        </div>
        <div class="deliv-tier">
          <span class="tier-tag tier-b-tag">Tier B (3rd / 4th Yr UG &amp; PG)</span>
          <div>${prob.tierB || 'Synthesized hardware deployment and timing/power closure.'}</div>
        </div>
      </div>
      ` : ''}
    </div>
  `).join('')}
</div>
`).join('')}

<!-- ========================================================================= -->
<!-- SUBMISSION GUIDELINES & CONTACT DIRECTORY                                -->
<!-- ========================================================================= -->
<div class="page-break"></div>

<div class="section-header">
  <div class="section-eyebrow">SUBMISSION PROTOCOL</div>
  <h2 class="section-title">Round 1 Blueprint Guidelines &amp; Contact Directory</h2>
</div>

<div class="avoid-break" style="margin-bottom: 24px;">
  <div class="doc-title-card" style="margin: 0 0 16px 0; background: #FAF8F5;">
    <div style="font-size: 11pt; font-weight: 900; margin-bottom: 6px; color: #111116;">
      Mandatory 6-Slide Presentation Specification
    </div>
    <div style="font-size: 8.8pt; color: #33333E; line-height: 1.5;">
      All teams must download the official PowerPoint template from <code>veltraxx.in/downloads</code>, complete the 6 slides, export as a PDF under 3MB, and upload via the submission portal between <strong>02 Dec (00:00) and 03 Dec (23:59)</strong>:
      <ul style="margin: 6px 0 0 0; padding-left: 20px;">
        <li><strong>Slide 1:</strong> Project Identity &amp; Engineering Team Roster (2-4 Members)</li>
        <li><strong>Slide 2:</strong> Problem Deconstruction, Failure Mechanism &amp; Numerical Targets</li>
        <li><strong>Slide 3:</strong> Proposed Microarchitecture &amp; Step-by-Step Data Flow Pipeline</li>
        <li><strong>Slide 4:</strong> Tools, Hardware Boards, Core Algorithms &amp; Validation Strategy</li>
        <li><strong>Slide 5 (CRITICAL):</strong> Concrete Proof-of-Competence Artifact (Waveform, Truth Table, State Transition Table, or Register Map)</li>
        <li><strong>Slide 6:</strong> 24-Hour Arena Milestone Roadmap &amp; Quantified Real-World Impact</li>
      </ul>
    </div>
  </div>
</div>

<div class="contact-grid avoid-break">
  <div class="contact-box">
    <div class="contact-heading">Faculty Conveners &amp; Department In-Charges</div>
    ${contacts.faculty.map(f => `
      <div class="contact-item">
        <strong>${f.name}</strong><br>
        <span style="color: #6B6B78;">${f.role} · ${f.phone}</span>
      </div>
    `).join('')}
  </div>

  <div class="contact-box">
    <div class="contact-heading">Student Executive Committee</div>
    ${contacts.students.map(s => `
      <div class="contact-item">
        <strong>${s.name}</strong><br>
        <span style="color: #6B6B78;">${s.role} · ${s.phone}</span><br>
        <span style="color: #0055FF; font-family: monospace; font-size: 8pt;">${s.email}</span>
      </div>
    `).join('')}

    <div style="margin-top: 14px; padding-top: 10px; border-top: 1px dashed #111116; font-size: 8pt; color: #6B6B78;">
      Official Event Portal: <strong style="color: #111116;">https://veltraxx.in</strong><br>
      Campus: Sri Shakthi Institute of Engineering and Technology, L&amp;T Bypass Road, Coimbatore - 641062
    </div>
  </div>
</div>

</body>
</html>`;
}

async function main() {
  console.log("==================================================================");
  console.log("VELTRAXX 2.0: GENERATING OFFICIAL PROBLEM STATEMENTS PDF");
  console.log("==================================================================");

  const outDir = path.resolve(__dirname, "../public/downloads");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const tempHtmlPath = path.resolve(__dirname, "temp_problem_statements.html");
  const targetPdfPath = path.join(outDir, "VELTRAXX_2.0_Problem_Statements.pdf");

  console.log("[1/3] Generating styled HTML compendium from eventConfig...");
  const htmlContent = generateHtml();
  fs.writeFileSync(tempHtmlPath, htmlContent, "utf8");

  console.log("[2/3] Printing to PDF via Microsoft Edge Headless...");
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  if (!fs.existsSync(edgePath)) {
    throw new Error(`Edge executable not found at: ${edgePath}`);
  }

  const printCommand = `"${edgePath}" --headless --disable-gpu --print-to-pdf="${targetPdfPath}" --no-margins "${tempHtmlPath}"`;
  execSync(printCommand, { stdio: "inherit" });

  console.log("[3/3] Cleaning up temporary HTML file...");
  if (fs.existsSync(tempHtmlPath)) {
    fs.unlinkSync(tempHtmlPath);
  }

  if (fs.existsSync(targetPdfPath)) {
    const stats = fs.statSync(targetPdfPath);
    console.log(`[SUCCESS] Problem Statements PDF generated: ${targetPdfPath}`);
    console.log(`[FILE SIZE] ${(stats.size / 1024).toFixed(1)} KB`);
  } else {
    throw new Error("Target PDF file was not created.");
  }

  console.log("==================================================================");
  console.log("PROBLEM STATEMENTS PDF GENERATED SUCCESSFULLY!");
  console.log("==================================================================");
}

main().catch(err => {
  console.error("Fatal Error generating Problem Statements PDF:", err);
  process.exit(1);
});

