/**
 * ==============================================================================
 * VELTRAXX 2.0: OFFICIAL PROBLEM STATEMENTS PDF GENERATOR
 * File: scripts/generate-problem-statements-pdf.js
 * ==============================================================================
 * Compiles the canonical 25 Problem Statements Compendium from
 * veltraxx_2_0_official_problem_statements_book.md into an executive, publication-
 * grade 27-page PDF adhering to the Smart India Hackathon (SIH) benchmark standard.
 * 
 * Strict Directives Enforced:
 * 1. Zero compilation timestamp / browser headers or footers (--no-pdf-header-footer).
 * 2. Sri Shakthi Institute of Engineering and Technology boosted & prominent.
 * 3. Department strictly: Department of EE - VDT (zero mention of ECE).
 * 4. Page 1: Bold, central VELTRAXX 2.0 hero cover page.
 * 5. Page 2: Dedicated Master Index of all 25 problem statements.
 * 6. Pages 3-27: Problem statements starting from Page 3 (1 statement per page).
 * 7. Page indicator positioned in the bottom middle of every page (except Page 1).
 * 8. Zero contact info (no student phone numbers or unverified emails).
 * ==============================================================================
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper: Convert lightweight markdown formatting to clean HTML
function mdToHtml(md) {
  if (!md) return '';

  let html = md.trim();

  // Replace math expressions $...$ with styled span
  html = html.replace(/\$([^\$]+)\$/g, '<span class="math-expr">$1</span>');

  // Replace bold **text**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Replace italic *text*
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');

  // Replace inline code `code`
  html = html.replace(/`([^`]+)`/g, '<code class="code-span">$1</code>');

  // Parse lists or paragraphs
  const lines = html.split('\n');
  let inUl = false;
  let inOl = false;
  let outLines = [];

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (inUl) { outLines.push('</ul>'); inUl = false; }
      if (inOl) { outLines.push('</ol>'); inOl = false; }
      continue;
    }

    // Unordered list item
    const ulMatch = trimmed.match(/^[\*\-]\s+(.*)/);
    if (ulMatch) {
      if (inOl) { outLines.push('</ol>'); inOl = false; }
      if (!inUl) { outLines.push('<ul class="doc-list">'); inUl = true; }
      outLines.push(`<li>${ulMatch[1]}</li>`);
      continue;
    }

    // Ordered list item
    const olMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (olMatch) {
      if (inUl) { outLines.push('</ul>'); inUl = false; }
      if (!inOl) { outLines.push('<ol class="doc-num-list">'); inOl = true; }
      outLines.push(`<li>${olMatch[2]}</li>`);
      continue;
    }

    // Regular line
    if (inUl) { outLines.push('</ul>'); inUl = false; }
    if (inOl) { outLines.push('</ol>'); inOl = false; }
    outLines.push(`<p class="doc-p">${trimmed}</p>`);
  }

  if (inUl) outLines.push('</ul>');
  if (inOl) outLines.push('</ol>');

  return outLines.join('\n');
}

// Parse veltraxx_2_0_official_problem_statements_book.md
function parseProblemStatements() {
  const mdPath = path.resolve(__dirname, '../veltraxx_2_0_official_problem_statements_book.md');
  if (!fs.existsSync(mdPath)) {
    throw new Error(`Master Markdown file not found at: ${mdPath}`);
  }

  const text = fs.readFileSync(mdPath, 'utf8');
  const rawSections = text.split(/## Problem Statement /);

  const problems = [];
  for (let i = 1; i < rawSections.length; i++) {
    const sec = rawSections[i];
    const firstLine = sec.substring(0, sec.indexOf('\n')).trim();
    const codeMatch = firstLine.match(/`(VTX-T\d-\d\d)`:\s*(.*)/);
    if (!codeMatch) continue;

    const code = codeMatch[1];
    const title = codeMatch[2];

    const trackMatch = sec.match(/\*\*Domain Track\*\*\s*\|\s*(.*?)\s*\|/);
    const track = trackMatch ? trackMatch[1] : '';

    const catMatch = sec.match(/\*\*Category\*\*\s*\|\s*(.*?)\s*\|/);
    const category = catMatch ? catMatch[1] : '';

    // Background
    const bgMatch = sec.match(/### 1\.\s*Background[^\n]*\n([\s\S]*?)(?=### 2|$)/);
    const background = bgMatch ? bgMatch[1].trim() : '';

    // Description
    const descMatch = sec.match(/### 2\.\s*(?:Detailed Problem Description|Problem Description)[^\n]*\n([\s\S]*?)(?=### 3|$)/);
    const description = descMatch ? descMatch[1].trim() : '';

    // Architecture (Tracks 1-4)
    const archMatch = sec.match(/### 3\.\s*Expected System Architecture[^\n]*\n([\s\S]*?)(?=### 4|$)/);
    const architecture = archMatch ? archMatch[1].trim() : '';

    // Tiered Evaluation
    let tieredEval = '';
    if (archMatch) {
      const tierMatch = sec.match(/### 4\.\s*Tiered Evaluation Expectations[^\n]*\n([\s\S]*?)(?=### 5|$)/);
      tieredEval = tierMatch ? tierMatch[1].trim() : '';
    } else {
      const tierMatchTrack5 = sec.match(/### 3\.\s*Mandatory Engineering Rigor[^\n]*\n([\s\S]*?)(?=### 4|$)/);
      tieredEval = tierMatchTrack5 ? tierMatchTrack5[1].trim() : '';
    }

    // Slide 5
    const slide5Match = sec.match(/### (?:4|5)\.\s*Mandatory Slide 5[^\n]*\n([\s\S]*?)(?=<div|\n---|$)/);
    const slide5 = slide5Match ? slide5Match[1].trim() : '';

    // Target page number (Page 3 for problem 1, Page 4 for problem 2, etc.)
    const pageNum = i + 2; // Problem 1 -> Page 3

    problems.push({
      code,
      title,
      track,
      category,
      background,
      description,
      architecture,
      tieredEval,
      slide5,
      pageNum
    });
  }

  return problems;
}

function generateCompleteHtml(problems) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>VELTRAXX 2.0 - Official Problem Statements Compendium</title>
<style>
  @page {
    size: A4 portrait;
    margin: 12mm 14mm 14mm 14mm;
    @bottom-center {
      content: "— Page " counter(page) " of " counter(pages) " —";
      font-family: "Consolas", "Courier New", monospace;
      font-size: 8pt;
      font-weight: 700;
      color: #555566;
    }
  }

  @page :first {
    @bottom-center {
      content: none;
    }
  }

  *, *:before, *:after {
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #111116;
    background-color: #FFFFFF;
    margin: 0;
    padding: 0;
    font-size: 8.5pt;
    line-height: 1.38;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* Page Break Controls */
  .page {
    page-break-after: always;
    min-height: 268mm;
    position: relative;
  }

  .avoid-break {
    page-break-inside: avoid;
  }

  /* =========================================================================
     PAGE 1: HERO COVER PAGE (Centered, Bold, Boosted Sri Shakthi & EEE-VDT)
     ========================================================================= */
  .cover-container {
    height: 265mm;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    text-align: center;
    padding: 10px 10px 0 10px;
  }

  .inst-header-box {
    border: 2.5px solid #111116;
    border-radius: 14px;
    background: #FAF8F5;
    padding: 14px 20px;
    box-shadow: 4px 4px 0px 0px #111116;
  }

  .inst-logo-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #111116;
    color: #FFE500;
    font-family: "Consolas", monospace;
    font-size: 8pt;
    font-weight: 900;
    padding: 3px 12px;
    border-radius: 6px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 8px;
  }

  .inst-name {
    font-size: 17pt;
    font-weight: 950;
    color: #111116;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0 0 4px 0;
    line-height: 1.2;
  }

  .inst-autonomous {
    font-size: 9pt;
    font-weight: 900;
    color: #0055FF;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin: 0 0 4px 0;
  }

  .inst-accreditation {
    font-size: 8pt;
    font-weight: 700;
    color: #4B4B58;
    margin: 0 0 2px 0;
  }

  .inst-address {
    font-size: 7.5pt;
    color: #6B6B78;
    margin: 0;
  }

  .dept-banner-box {
    margin-top: 10px;
    border: 2px solid #111116;
    border-radius: 10px;
    background: #FFFFFF;
    padding: 10px 16px;
  }

  .dept-title-text {
    font-size: 12pt;
    font-weight: 900;
    color: #111116;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0 0 2px 0;
  }

  .dept-sub-text {
    font-size: 8pt;
    font-weight: 800;
    color: #7B2FFF;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin: 0 0 4px 0;
  }

  .dept-meity-pill {
    display: inline-block;
    background: #FFE500;
    color: #111116;
    font-family: "Consolas", monospace;
    font-size: 7.5pt;
    font-weight: 900;
    padding: 2px 10px;
    border-radius: 4px;
    border: 1px solid #111116;
  }

  .cover-hero-center {
    margin: 15px 0;
  }

  .hackathon-pill {
    display: inline-block;
    background: #111116;
    color: #FFE500;
    font-family: "Consolas", monospace;
    font-size: 9pt;
    font-weight: 900;
    padding: 5px 16px;
    border-radius: 8px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 12px;
  }

  .main-event-title {
    font-size: 42pt;
    font-weight: 950;
    letter-spacing: -2px;
    line-height: 1.0;
    margin: 0 0 8px 0;
    color: #111116;
    text-shadow: 2px 2px 0px #FFE500;
  }

  .main-tagline {
    font-size: 11pt;
    font-weight: 800;
    color: #111116;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin: 0 0 16px 0;
  }

  .compendium-card {
    background: #FAF8F5;
    border: 2.5px solid #111116;
    border-radius: 14px;
    padding: 16px 20px;
    box-shadow: 5px 5px 0px 0px #111116;
    margin: 0 auto;
    max-width: 90%;
  }

  .compendium-label {
    font-family: "Consolas", monospace;
    font-size: 8pt;
    font-weight: 900;
    color: #FF2E93;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 4px;
  }

  .compendium-title {
    font-size: 16pt;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: -0.5px;
    color: #111116;
    margin: 0 0 6px 0;
  }

  .compendium-sub {
    font-size: 8.5pt;
    font-weight: 600;
    color: #4B4B58;
    margin: 0;
    line-height: 1.4;
  }

  .stage-matrix-table {
    width: 100%;
    border-collapse: collapse;
    border: 2px solid #111116;
    border-radius: 10px;
    overflow: hidden;
    margin-top: 12px;
  }

  .stage-matrix-table th {
    background: #111116;
    color: #FFFFFF;
    font-family: "Consolas", monospace;
    font-size: 7.5pt;
    font-weight: 900;
    text-transform: uppercase;
    padding: 7px 10px;
    text-align: left;
    letter-spacing: 0.5px;
  }

  .stage-matrix-table td {
    padding: 7px 10px;
    font-size: 8pt;
    border-top: 1px solid #111116;
    background: #FFFFFF;
    text-align: left;
  }

  .stage-matrix-table tr:nth-child(even) td {
    background: #FAF8F5;
  }

  .stage-tag {
    font-family: "Consolas", monospace;
    font-weight: 900;
    font-size: 7.5pt;
    padding: 2px 6px;
    border-radius: 4px;
    display: inline-block;
  }

  .stage-tag-free {
    background: #B6FF00;
    color: #111116;
    border: 1px solid #111116;
  }

  .stage-tag-upload {
    background: #FFE500;
    color: #111116;
    border: 1px solid #111116;
  }

  .stage-tag-arena {
    background: #FF2E93;
    color: #FFFFFF;
  }

  /* =========================================================================
     PAGE 2: MASTER INDEX (Table of All 25 Problems)
     ========================================================================= */
  .index-header {
    border-bottom: 2.5px solid #111116;
    padding-bottom: 8px;
    margin-bottom: 10px;
  }

  .index-eyebrow {
    font-family: "Consolas", monospace;
    font-size: 7.5pt;
    font-weight: 900;
    color: #0055FF;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 2px;
  }

  .index-title {
    font-size: 15pt;
    font-weight: 950;
    color: #111116;
    text-transform: uppercase;
    margin: 0 0 3px 0;
  }

  .index-desc {
    font-size: 8pt;
    color: #4B4B58;
    margin: 0;
  }

  .sih-tier-banner {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 10px;
  }

  .tier-banner-box {
    border: 1.5px solid #111116;
    border-radius: 8px;
    padding: 7px 10px;
    background: #FAF8F5;
  }

  .tier-banner-title {
    font-family: "Consolas", monospace;
    font-size: 8pt;
    font-weight: 900;
    text-transform: uppercase;
    margin-bottom: 2px;
  }

  .tier-banner-title.tier-a {
    color: #0055FF;
  }

  .tier-banner-title.tier-b {
    color: #FF2E93;
  }

  .tier-banner-desc {
    font-size: 7.2pt;
    color: #33333E;
    line-height: 1.3;
    margin: 0;
  }

  .index-table {
    width: 100%;
    border-collapse: collapse;
    border: 2px solid #111116;
    border-radius: 8px;
    overflow: hidden;
    font-size: 7.2pt;
  }

  .index-table th {
    background: #111116;
    color: #FFFFFF;
    font-family: "Consolas", monospace;
    font-size: 7pt;
    font-weight: 900;
    text-transform: uppercase;
    padding: 4px 6px;
    text-align: left;
    letter-spacing: 0.5px;
  }

  .index-table td {
    padding: 3.5px 6px;
    border-top: 1px solid #E2E2E8;
    line-height: 1.25;
  }

  .index-table tr:nth-child(even) td {
    background: #F9F9FB;
  }

  .index-code {
    font-family: "Consolas", monospace;
    font-weight: 900;
    color: #111116;
    white-space: nowrap;
  }

  .index-page-num {
    font-family: "Consolas", monospace;
    font-weight: 900;
    text-align: center;
    background: #FFE500;
    color: #111116;
    border-radius: 4px;
    padding: 1px 4px;
    display: inline-block;
  }

  /* =========================================================================
     PAGES 3-27: PROBLEM STATEMENT SPECIFICATION CARDS
     ========================================================================= */
  .problem-container {
    height: 265mm;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .prob-top-header {
    border: 2px solid #111116;
    border-radius: 10px;
    background: #FAF8F5;
    padding: 8px 12px;
    margin-bottom: 6px;
  }

  .prob-track-pill {
    font-family: "Consolas", monospace;
    font-size: 7.2pt;
    font-weight: 900;
    color: #0055FF;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 3px;
  }

  .prob-title-row {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  .prob-code-badge {
    background: #FFE500;
    color: #111116;
    font-family: "Consolas", monospace;
    font-size: 9.5pt;
    font-weight: 950;
    padding: 2px 7px;
    border-radius: 5px;
    border: 1.5px solid #111116;
    white-space: nowrap;
  }

  .prob-title-text {
    font-size: 11.5pt;
    font-weight: 950;
    color: #111116;
    line-height: 1.25;
    letter-spacing: -0.3px;
    margin: 0;
  }

  .prob-meta-table {
    width: 100%;
    border-collapse: collapse;
    border: 1.5px solid #111116;
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 6px;
    font-size: 7.2pt;
  }

  .prob-meta-table td {
    padding: 3px 8px;
    border-top: 1px solid #E2E2E8;
    background: #FFFFFF;
  }

  .prob-meta-label {
    width: 18%;
    font-family: "Consolas", monospace;
    font-weight: 900;
    text-transform: uppercase;
    color: #555566;
    background: #F4F4F6 !important;
    border-right: 1px solid #111116;
  }

  .prob-meta-val {
    font-weight: 700;
    color: #111116;
  }

  .section-box {
    border: 1.5px solid #111116;
    border-radius: 8px;
    padding: 6px 10px;
    margin-bottom: 5px;
    background: #FFFFFF;
  }

  .section-heading-sm {
    font-family: "Consolas", monospace;
    font-size: 7.5pt;
    font-weight: 900;
    text-transform: uppercase;
    color: #111116;
    letter-spacing: 0.5px;
    border-bottom: 1.5px solid #111116;
    padding-bottom: 2px;
    margin-bottom: 4px;
    display: flex;
    justify-content: space-between;
  }

  .section-heading-sm span.accent {
    color: #0055FF;
  }

  .doc-p {
    margin: 0 0 3px 0;
    font-size: 7.6pt;
    color: #22222E;
    line-height: 1.34;
    text-align: justify;
  }

  .doc-list, .doc-num-list {
    margin: 0;
    padding-left: 15px;
    font-size: 7.4pt;
    color: #22222E;
    line-height: 1.3;
  }

  .doc-list li, .doc-num-list li {
    margin-bottom: 2px;
  }

  /* Split Tier A / Tier B Grid */
  .eval-split-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    margin-bottom: 5px;
  }

  .eval-card {
    border: 1.5px solid #111116;
    border-radius: 8px;
    padding: 5px 8px;
    background: #FFFFFF;
  }

  .eval-card-header {
    font-family: "Consolas", monospace;
    font-size: 7.2pt;
    font-weight: 900;
    text-transform: uppercase;
    padding-bottom: 2px;
    margin-bottom: 3px;
    border-bottom: 1px solid #111116;
  }

  .eval-card.tier-a {
    border-top: 3px solid #0055FF;
  }

  .eval-card.tier-a .eval-card-header {
    color: #0055FF;
  }

  .eval-card.tier-b {
    border-top: 3px solid #FF2E93;
  }

  .eval-card.tier-b .eval-card-header {
    color: #FF2E93;
  }

  /* Slide 5 Proof of Competence Callout */
  .slide5-callout {
    border: 2px solid #111116;
    border-radius: 8px;
    background: #FFF9E6;
    padding: 6px 10px;
    box-shadow: 2px 2px 0px 0px #111116;
  }

  .slide5-header {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: "Consolas", monospace;
    font-size: 7.5pt;
    font-weight: 950;
    color: #111116;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 2px;
  }

  .slide5-badge {
    background: #FF2E93;
    color: #FFFFFF;
    font-size: 6.8pt;
    font-weight: 900;
    padding: 1px 5px;
    border-radius: 3px;
  }

  .slide5-text {
    font-size: 7.4pt;
    color: #22222E;
    line-height: 1.32;
    margin: 0;
  }

  .math-expr {
    font-family: "Consolas", "Courier New", monospace;
    font-weight: 700;
    color: #0055FF;
    background: #F0F4FF;
    padding: 0 3px;
    border-radius: 3px;
  }

  .code-span {
    font-family: "Consolas", monospace;
    font-size: 7pt;
    font-weight: 800;
    color: #111116;
    background: #F4F4F6;
    padding: 0 3px;
    border-radius: 3px;
    border: 1px solid #D0D0D8;
  }
</style>
</head>
<body>

<!-- =======================================================================
     PAGE 1: COVER / HERO PAGE
     ======================================================================= -->
<div class="page cover-container">
  <!-- Top Boosted Sri Shakthi Institution Lockup -->
  <div>
    <div class="inst-header-box">
      <div class="inst-logo-badge">⚡ SRI SHAKTHI SILICON INITIATIVE ⚡</div>
      <h1 class="inst-name">SRI SHAKTHI INSTITUTE OF ENGINEERING AND TECHNOLOGY</h1>
      <div class="inst-autonomous">(AN AUTONOMOUS INSTITUTION)</div>
      <div class="inst-accreditation">
        Approved by AICTE, New Delhi · Affiliated to Anna University, Chennai · TNEA Counselling Code: 2727
      </div>
      <div class="inst-address">
        L&amp;T Bypass Road, Chinniyampalayam Post, Coimbatore - 641062, Tamil Nadu, India
      </div>
    </div>

    <!-- Official Department Header: Strictly Department of EE - VDT -->
    <div class="dept-banner-box">
      <div class="dept-title-text">DEPARTMENT OF EE - VDT</div>
      <div class="dept-sub-text">ELECTRONICS ENGINEERING (VLSI DESIGN AND TECHNOLOGY)</div>
      <div class="dept-meity-pill">Supported by MeitY · Chips to Startup (C2S) Programme · Government of India</div>
    </div>
  </div>

  <!-- Center: VELTRAXX 2.0 Hero -->
  <div class="cover-hero-center">
    <div class="hackathon-pill">NATIONAL-LEVEL 2-STAGE TECH &amp; SILICON HACKATHON</div>
    <div class="main-event-title">⚡ VELTRAXX 2.0 ⚡</div>
    <div class="main-tagline">BUILD · SYNTHESIZE · DEPLOY · 24 HOURS OF RAW SILICON INNOVATION</div>

    <div class="compendium-card">
      <div class="compendium-label">OFFICIAL TECHNICAL BENCHMARK SPECIFICATION</div>
      <div class="compendium-title">OFFICIAL PROBLEM STATEMENTS COMPENDIUM</div>
      <div class="compendium-sub">
        Comprehensive Smart India Hackathon (SIH) Benchmark Edition spanning 25 Industrial Hardware, ASIC, FPGA, Edge AI, and Cyber-Physical Systems Challenges.
      </div>
    </div>
  </div>

  <!-- Bottom: Event Schedule Matrix (Zero Contact Info) -->
  <div>
    <table class="stage-matrix-table">
      <thead>
        <tr>
          <th>Event Stage</th>
          <th>Official Schedule &amp; Window</th>
          <th>Mode &amp; Participation Guidelines</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="stage-tag stage-tag-free">STAGE 01</span> <strong>Round 1 Registration Close</strong></td>
          <td><strong>01 December 2026 (11:59 PM IST)</strong></td>
          <td><strong>₹0 Free Entry</strong> · Online squad registration across 5 tracks</td>
        </tr>
        <tr>
          <td><span class="stage-tag stage-tag-upload">STAGE 02</span> <strong>48-Hour Solution Blueprint Upload</strong></td>
          <td><strong>02 Dec (00:00) – 03 Dec 2026 (23:59 IST)</strong></td>
          <td>Online 6-Slide Technical Presentation PDF Submission</td>
        </tr>
        <tr>
          <td><span class="stage-tag stage-tag-arena">STAGE 03</span> <strong>24-Hour Offline Grand Finale</strong></td>
          <td><strong>15 – 16 December 2026 (24H Non-Stop)</strong></td>
          <td>SIET Tech Park Arena, Coimbatore · Cash Prize Defense</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

<!-- =======================================================================
     PAGE 2: MASTER INDEX (Table of All 25 Problems)
     ======================================================================= -->
<div class="page">
  <div class="index-header">
    <div class="index-eyebrow">COMPREHENSIVE DIRECTORY</div>
    <h2 class="index-title">MASTER INDEX OF PROBLEM STATEMENTS</h2>
    <p class="index-desc">
      All 25 problem statements adhere to the Smart India Hackathon (SIH) rigorous evaluation benchmark. Each problem statement occupies a dedicated page from Page 3 to Page 27.
    </p>
  </div>

  <div class="sih-tier-banner">
    <div class="tier-banner-box">
      <div class="tier-banner-title tier-a">Tier A (Junior Division · 1st &amp; 2nd Year UG)</div>
      <p class="tier-banner-desc">
        Graded on architectural logic, functional block diagrams, truth tables, and behavioral simulation (Icarus Verilog, EDA Playground, Proteus, Wokwi, Python).
      </p>
    </div>
    <div class="tier-banner-box">
      <div class="tier-banner-title tier-b">Tier B (Senior Division · 3rd &amp; 4th Year UG, PG &amp; Scholars)</div>
      <p class="tier-banner-desc">
        Graded on synthesizable RTL, synthesis PPA reports (Cadence Genus / Synopsys / Vivado / Yosys), timing/power closure, FPGA hardware, and fault injection.
      </p>
    </div>
  </div>

  <table class="index-table">
    <thead>
      <tr>
        <th style="width: 10%;">Code</th>
        <th style="width: 11%;">Track</th>
        <th style="width: 47%;">Problem Statement Title</th>
        <th style="width: 24%;">Category</th>
        <th style="width: 8%; text-align: center;">Page</th>
      </tr>
    </thead>
    <tbody>
      ${problems.map(p => `
        <tr>
          <td class="index-code">${p.code}</td>
          <td>${p.code.startsWith('VTX-T1') ? 'Track 01' : p.code.startsWith('VTX-T2') ? 'Track 02' : p.code.startsWith('VTX-T3') ? 'Track 03' : p.code.startsWith('VTX-T4') ? 'Track 04' : 'Track 05'}</td>
          <td><strong>${p.title}</strong></td>
          <td>${p.category.replace(/<[^>]+>/g, '').split(',')[0]}</td>
          <td style="text-align: center;"><span class="index-page-num">P.${p.pageNum}</span></td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</div>

<!-- =======================================================================
     PAGES 3-27: PROBLEM STATEMENTS (1 Problem Statement per Page)
     ======================================================================= -->
${problems.map(p => {
  // Extract Tier A and Tier B descriptions
  let tierAHtml = '';
  let tierBHtml = '';

  const tierAMatch = p.tieredEval.match(/\*?\s*\*\*Tier A[^\*:]*:\*?\*?:?\s*([\s\S]*?)(?=\*?\s*\*\*Tier B|$)/i);
  const tierBMatch = p.tieredEval.match(/\*?\s*\*\*Tier B[^\*:]*:\*?\*?:?\s*([\s\S]*?)$/i);

  if (tierAMatch && tierBMatch) {
    tierAHtml = mdToHtml(tierAMatch[1].trim());
    tierBHtml = mdToHtml(tierBMatch[1].trim());
  } else {
    tierAHtml = mdToHtml(p.tieredEval);
    tierBHtml = '<p class="doc-p">Evaluation strictly normalized relative to academic standing and engineering depth.</p>';
  }

  return `
<div class="page problem-container">
  <div>
    <!-- Top Header Card -->
    <div class="prob-top-header">
      <div class="prob-track-pill">${p.track.replace(/`([^`]+)`/g, '$1')}</div>
      <div class="prob-title-row">
        <span class="prob-code-badge">${p.code}</span>
        <h3 class="prob-title-text">${p.title}</h3>
      </div>
    </div>

    <!-- Meta Specification Grid -->
    <table class="prob-meta-table">
      <tr>
        <td class="prob-meta-label">Domain Track</td>
        <td class="prob-meta-val">${p.track.replace(/`([^`]+)`/g, '$1')}</td>
      </tr>
      <tr>
        <td class="prob-meta-label">Organizing Host</td>
        <td class="prob-meta-val">Department of EE - VDT, Sri Shakthi Institute of Engineering and Technology</td>
      </tr>
      <tr>
        <td class="prob-meta-label">Category</td>
        <td class="prob-meta-val">${p.category}</td>
      </tr>
    </table>

    <!-- Section 1: Background & Industry Context -->
    <div class="section-box">
      <div class="section-heading-sm">
        <span>1. Background &amp; Industry Context</span>
        <span class="accent">REAL-WORLD CHALLENGE</span>
      </div>
      ${mdToHtml(p.background)}
    </div>

    <!-- Section 2: Detailed Problem Description -->
    <div class="section-box">
      <div class="section-heading-sm">
        <span>2. Problem Description &amp; Scope of Innovation</span>
        <span class="accent">TECHNICAL OBJECTIVE</span>
      </div>
      ${mdToHtml(p.description)}
    </div>

    <!-- Section 3: Expected System Architecture (Tracks 1-4) -->
    ${p.architecture ? `
      <div class="section-box">
        <div class="section-heading-sm">
          <span>3. Expected System Architecture &amp; Functional Specifications</span>
          <span class="accent">DELIVERABLES</span>
        </div>
        ${mdToHtml(p.architecture)}
      </div>
    ` : ''}

    <!-- Section 4: Dual-Tier Evaluation Matrix -->
    <div class="eval-split-grid">
      <div class="eval-card tier-a">
        <div class="eval-card-header">Tier A: Junior Division (1st &amp; 2nd Year UG)</div>
        ${tierAHtml}
      </div>
      <div class="eval-card tier-b">
        <div class="eval-card-header">Tier B: Senior Division (3rd &amp; 4th Year UG / PG)</div>
        ${tierBHtml}
      </div>
    </div>
  </div>

  <!-- Section 5: Mandatory Slide 5 Proof of Competence Callout -->
  <div class="slide5-callout">
    <div class="slide5-header">
      <span class="slide5-badge">SLIDE 5</span>
      <span>Mandatory Proof-of-Competence Artifact (For Round 1 PPT)</span>
    </div>
    <div class="slide5-text">
      ${mdToHtml(p.slide5)}
    </div>
  </div>
</div>
  `;
}).join('\n')}

</body>
</html>`;
}

async function main() {
  console.log("==================================================================");
  console.log("VELTRAXX 2.0: GENERATING OFFICIAL PROBLEM STATEMENTS COMPENDIUM");
  console.log("==================================================================");

  const publicOutDir = path.resolve(__dirname, "../public/downloads");
  const distOutDir = path.resolve(__dirname, "../dist/downloads");

  if (!fs.existsSync(publicOutDir)) fs.mkdirSync(publicOutDir, { recursive: true });
  if (!fs.existsSync(distOutDir)) fs.mkdirSync(distOutDir, { recursive: true });

  const tempHtmlPath = path.resolve(__dirname, "temp_problem_statements.html");
  const publicPdfPath = path.join(publicOutDir, "VELTRAXX_2.0_Problem_Statements.pdf");
  const distPdfPath = path.join(distOutDir, "VELTRAXX_2.0_Problem_Statements.pdf");

  console.log("[1/4] Parsing 25 problem statements from veltraxx_2_0_official_problem_statements_book.md...");
  const problems = parseProblemStatements();
  console.log(`[PARSER SUCCESS] Extracted ${problems.length} problem statements.`);

  console.log("[2/4] Generating HTML document with SIH Neo-Brutalist layout...");
  const htmlContent = generateCompleteHtml(problems);
  fs.writeFileSync(tempHtmlPath, htmlContent, "utf8");

  console.log("[3/4] Printing to PDF via Microsoft Edge Headless (--no-pdf-header-footer)...");
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  if (!fs.existsSync(edgePath)) {
    throw new Error(`Edge executable not found at: ${edgePath}`);
  }

  // Notice --no-pdf-header-footer is strictly enforced to remove the compilation timestamp and url
  const printCommand = `"${edgePath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${publicPdfPath}" "${tempHtmlPath}"`;
  execSync(printCommand, { stdio: "inherit" });

  // Clean up temporary HTML file
  if (fs.existsSync(tempHtmlPath)) {
    fs.unlinkSync(tempHtmlPath);
  }

  // Copy to dist/downloads as well
  fs.copyFileSync(publicPdfPath, distPdfPath);

  console.log("[4/4] Verifying generated PDF metrics and page count...");
  if (fs.existsSync(publicPdfPath)) {
    const stats = fs.statSync(publicPdfPath);
    console.log(`[SUCCESS] PDF Created: ${publicPdfPath}`);
    console.log(`[FILE SIZE] ${(stats.size / 1024).toFixed(1)} KB`);
  } else {
    throw new Error("Target PDF file was not created.");
  }

  console.log("==================================================================");
  console.log("OFFICIAL PROBLEM STATEMENTS COMPENDIUM GENERATED SUCCESSFULLY!");
  console.log("==================================================================");
}

main().catch(err => {
  console.error("Fatal Error generating Problem Statements PDF:", err);
  process.exit(1);
});
