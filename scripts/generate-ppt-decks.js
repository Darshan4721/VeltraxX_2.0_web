/**
 * ==============================================================================
 * VELTRAXX 2.0: AUTOMATED DUAL-DECK PPTX GENERATOR (V2 - PROFESSIONAL EDITION)
 * (BLANK SUBMISSION TEMPLATE + FILLED REFERENCE EXAMPLE DECK)
 * ==============================================================================
 * 
 * Powered by pptxgenjs & Professional Web Design System Tokens:
 * - Smooth rounded curves on all cards and badges (ROUNDED_RECTANGLE)
 * - Single-layer native PowerPoint cards with generous internal padding
 * - Consistent warm cream canvas (#FAF8F5) matching the web experience
 * - Clean Solar Yellow (#FFE500) and Carbon Black (#111116) neo-brutalist accents
 * - Zero em-dashes (standard hyphens and colons only)
 * - Easy to edit in Microsoft PowerPoint and Google Slides (click and type directly)
 * ==============================================================================
 */

import pptxgen from "pptxgenjs";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==============================================================================
// 1. CANONICAL DESIGN SYSTEM TOKENS (No '#' prefixes in pptxgenjs hex strings)
// ==============================================================================
const TOKENS = {
  CANVAS_CREAM: "FAF8F5",
  CARD_WHITE: "FFFFFF",
  CARD_GRAY: "F4F4F6",
  CARBON_BLACK: "111116",
  SOLAR_YELLOW: "FFE500",
  ELECTRIC_BLUE: "0055FF",
  EMERALD_GREEN: "10B981",
  HOT_PINK: "FF2E93",
  SLATE_MUTED: "6B6B78",
  BORDER_LIGHT: "E2E8F0",
  BORDER_DARK: "111116",

  // Typography
  FONT_DISPLAY: "Segoe UI",
  FONT_BODY: "Segoe UI",
  FONT_MONO: "Consolas"
};

// ==============================================================================
// 2. REUSABLE SLIDE CHROME & CARD BUILDERS
// ==============================================================================

/**
 * Builds standard slide chrome: Background, top-left pill, top-right branding,
 * title, subtitle, and bottom footer line with slide counter.
 */
function addSlideChrome(slide, pptx, { slideNum, eyebrow, title, subtitle, isReferenceDeck = false }) {
  // 1. Canvas Background (Consistent across all 6 slides)
  slide.background = { color: TOKENS.CANVAS_CREAM };

  // 2. Top-Left Eyebrow Pill (Smooth Rounded)
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.60,
    y: 0.30,
    w: 3.10,
    h: 0.28,
    fill: { color: TOKENS.SOLAR_YELLOW },
    line: { color: TOKENS.CARBON_BLACK, width: 1.5 },
    rectRadius: 0.06
  });
  slide.addText(`0${slideNum} // ${eyebrow}`, {
    x: 0.65,
    y: 0.30,
    w: 3.00,
    h: 0.28,
    fontFace: TOKENS.FONT_DISPLAY,
    fontSize: 9,
    bold: true,
    color: TOKENS.CARBON_BLACK,
    align: "center",
    valign: "middle"
  });

  // 3. Top-Right Branding Badge (Smooth Rounded)
  if (isReferenceDeck) {
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 5.50,
      y: 0.30,
      w: 3.90,
      h: 0.28,
      fill: { color: TOKENS.HOT_PINK },
      line: { color: TOKENS.CARBON_BLACK, width: 1.5 },
      rectRadius: 0.06
    });
    slide.addText("SAMPLE REFERENCE DECK · FORMAT GUIDANCE", {
      x: 5.55,
      y: 0.30,
      w: 3.80,
      h: 0.28,
      fontFace: TOKENS.FONT_DISPLAY,
      fontSize: 8.5,
      bold: true,
      color: "FFFFFF",
      align: "center",
      valign: "middle"
    });
  } else {
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 6.70,
      y: 0.30,
      w: 2.70,
      h: 0.28,
      fill: { color: TOKENS.CARD_WHITE },
      line: { color: TOKENS.CARBON_BLACK, width: 1.5 },
      rectRadius: 0.06
    });
    slide.addText("VELTRAXX 2.0 · SIET EE (VLSI)", {
      x: 6.75,
      y: 0.30,
      w: 2.60,
      h: 0.28,
      fontFace: TOKENS.FONT_DISPLAY,
      fontSize: 8.5,
      bold: true,
      color: TOKENS.CARBON_BLACK,
      align: "center",
      valign: "middle"
    });
  }

  // 4. Slide Title
  slide.addText(title, {
    x: 0.60,
    y: 0.64,
    w: 8.80,
    h: 0.38,
    fontFace: TOKENS.FONT_DISPLAY,
    fontSize: 16,
    bold: true,
    color: TOKENS.CARBON_BLACK,
    valign: "middle"
  });

  // 5. Subtitle
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.60,
      y: 0.98,
      w: 8.80,
      h: 0.22,
      fontFace: TOKENS.FONT_BODY,
      fontSize: 9.5,
      color: TOKENS.SLATE_MUTED,
      valign: "middle"
    });
  }

  // 6. Bottom Separator Line & Footer
  slide.addShape(pptx.shapes.LINE, {
    x: 0.60,
    y: 5.22,
    w: 8.80,
    h: 0,
    line: { color: "D8D8DC", width: 1 }
  });

  slide.addText("MAX 6 SLIDES · EXPORT AS PDF UNDER 3MB · SUBMIT AT /SUBMIT-PPT · SRI SHAKTHI INSTITUTE OF ENGINEERING & TECHNOLOGY", {
    x: 0.60,
    y: 5.26,
    w: 7.30,
    h: 0.24,
    fontFace: TOKENS.FONT_BODY,
    fontSize: 8,
    color: TOKENS.SLATE_MUTED,
    valign: "middle"
  });

  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 8.40,
    y: 5.25,
    w: 1.00,
    h: 0.25,
    fill: { color: TOKENS.CARBON_BLACK },
    line: { color: TOKENS.CARBON_BLACK, width: 1 },
    rectRadius: 0.05
  });

  slide.addText(`0${slideNum} / 06`, {
    x: 8.40,
    y: 5.25,
    w: 1.00,
    h: 0.25,
    fontFace: TOKENS.FONT_DISPLAY,
    fontSize: 8.5,
    bold: true,
    color: TOKENS.SOLAR_YELLOW,
    align: "center",
    valign: "middle"
  });
}

/**
 * Adds a clean, single-layer native rounded card with a smooth header strip.
 */
function addCurvedCard(slide, pptx, {
  x,
  y,
  w,
  h,
  fill = TOKENS.CARD_WHITE,
  borderWidth = 1.5,
  headerText = null,
  headerFill = TOKENS.SOLAR_YELLOW,
  headerTextColor = TOKENS.CARBON_BLACK
}) {
  // 1. Single Native Rounded Card
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x,
    y,
    w,
    h,
    fill: { color: fill },
    line: { color: TOKENS.CARBON_BLACK, width: borderWidth },
    rectRadius: 0.08
  });

  // 2. Optional Header Banner inside the card
  if (headerText) {
    const pad = 0.14;
    const headerH = 0.34;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x + pad,
      y: y + pad,
      w: w - pad * 2,
      h: headerH,
      fill: { color: headerFill },
      line: { color: TOKENS.CARBON_BLACK, width: 1.2 },
      rectRadius: 0.05
    });

    slide.addText(headerText, {
      x: x + pad + 0.1,
      y: y + pad,
      w: w - pad * 2 - 0.2,
      h: headerH,
      fontFace: TOKENS.FONT_DISPLAY,
      fontSize: 9,
      bold: true,
      color: headerTextColor,
      align: "left",
      valign: "middle"
    });
  }
}

// ==============================================================================
// 3. SLIDE BUILDERS (SLIDES 1 TO 6)
// ==============================================================================

/**
 * SLIDE 01: COVER & TEAM IDENTITY
 */
function buildSlide01(pptx, isReferenceDeck) {
  const slide = pptx.addSlide();
  addSlideChrome(slide, pptx, {
    slideNum: 1,
    eyebrow: "ROUND 1 SUBMISSION BLUEPRINT",
    title: "VELTRAXX 2.0: ROUND 1 PITCH BLUEPRINT",
    subtitle: "Department of Electrical and Electronics Engineering (EEE / VLSI) · Sri Shakthi Institute of Engineering and Technology",
    isReferenceDeck
  });

  const cardY = 1.26;
  const cardH = 3.82;

  // 1. Left Card: Project & Track Specification
  addCurvedCard(slide, pptx, {
    x: 0.60,
    y: cardY,
    w: 4.28,
    h: cardH,
    headerText: "PROJECT & TRACK SPECIFICATION",
    headerFill: TOKENS.SOLAR_YELLOW
  });

  const leftContent = isReferenceDeck
    ? [
        { text: "TEAM ID (FROM CONFIRMATION PORTAL):\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "VTX2-000 (SAMPLE REFERENCE DECK)\n\n", options: { bold: true, color: TOKENS.ELECTRIC_BLUE, fontSize: 10 } },

        { text: "OFFICIAL TEAM NAME:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "Project Aegis (Fictional Sample Team)\n\n", options: { color: TOKENS.CARBON_BLACK, fontSize: 9.5 } },

        { text: "SELECTED DOMAIN TRACK:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "TRACK 01: ASIC & Custom Silicon\n\n", options: { color: TOKENS.CARBON_BLACK, fontSize: 9.5 } },

        { text: "PROBLEM STATEMENT CODE & TITLE:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "VTX-T1-01: Glitch-Free Dual-Sensor Watchdog & Fault Recovery Node\n\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 9.5 } },

        { text: "ACADEMIC DIVISION TIER:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "Tier B: Senior UG Division (3rd / 4th Year)\n\n", options: { color: TOKENS.CARBON_BLACK, fontSize: 9.5 } },

        { text: "* Ensure Team ID matches the ID generated upon free registration at veltraxx.in/register.", options: { italic: true, color: TOKENS.SLATE_MUTED, fontSize: 8 } }
      ]
    : [
        { text: "TEAM ID (FROM CONFIRMATION PORTAL):\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "[VTX2-XXX: e.g. VTX2-048]\n\n", options: { bold: true, color: TOKENS.ELECTRIC_BLUE, fontSize: 10 } },

        { text: "OFFICIAL TEAM NAME:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "[Enter Team Name: e.g. Silicon Synapse]\n\n", options: { color: TOKENS.SLATE_MUTED, fontSize: 9.5 } },

        { text: "SELECTED DOMAIN TRACK:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "[Select Track: ASIC / FPGA / Edge AI / Embedded IoT / Open Silicon]\n\n", options: { color: TOKENS.SLATE_MUTED, fontSize: 9.5 } },

        { text: "PROBLEM STATEMENT CODE & TITLE:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "[e.g. VTX-T1-01: Low-Power Multi-Port Register File with Self-Testing]\n\n", options: { color: TOKENS.SLATE_MUTED, fontSize: 9.5 } },

        { text: "ACADEMIC DIVISION TIER:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "[Tier A: 1st/2nd Yr UG  OR  Tier B: 3rd/4th Yr UG & PG]\n\n", options: { color: TOKENS.SLATE_MUTED, fontSize: 9.5 } },

        { text: "* Ensure Team ID matches the ID generated upon free registration at veltraxx.in/register.", options: { italic: true, color: TOKENS.SLATE_MUTED, fontSize: 8 } }
      ];

  slide.addText(leftContent, {
    x: 0.80,
    y: cardY + 0.58,
    w: 3.88,
    h: 3.10,
    fontFace: TOKENS.FONT_BODY,
    valign: "top"
  });

  // 2. Right Card: Engineering Team Roster
  addCurvedCard(slide, pptx, {
    x: 5.12,
    y: cardY,
    w: 4.28,
    h: cardH,
    headerText: "ENGINEERING TEAM ROSTER (2 TO 4 MEMBERS)",
    headerFill: TOKENS.SOLAR_YELLOW
  });

  slide.addText("Member 01 is the Team Leader and primary contact for shortlisting notifications.", {
    x: 5.30,
    y: cardY + 0.54,
    w: 3.92,
    h: 0.28,
    fontFace: TOKENS.FONT_BODY,
    fontSize: 8.5,
    color: TOKENS.SLATE_MUTED,
    valign: "middle"
  });

  // Native Clean Roster Table
  const tableRows = isReferenceDeck
    ? [
        [
          { text: "ROLE", options: { bold: true, fill: "111116", color: "FFE500" } },
          { text: "FULL NAME", options: { bold: true, fill: "111116", color: "FFFFFF" } },
          { text: "DEPT", options: { bold: true, fill: "111116", color: "FFFFFF" } },
          { text: "YR", options: { bold: true, fill: "111116", color: "FFFFFF" } },
          { text: "COLLEGE / INSTITUTION", options: { bold: true, fill: "111116", color: "FFFFFF" } }
        ],
        [
          { text: "Leader", options: { bold: true, fill: "FFE500", color: "111116" } },
          { text: "Alex V. Kumar (Sample)", options: { color: "111116" } },
          { text: "ECE", options: { color: "111116" } },
          { text: "3rd", options: { color: "111116" } },
          { text: "Apex Inst of Tech, Coimbatore", options: { color: "111116" } }
        ],
        [
          { text: "Member 2", options: { bold: true, color: "111116" } },
          { text: "Priya S. Nair (Sample)", options: { color: "111116" } },
          { text: "VLSI", options: { color: "111116" } },
          { text: "3rd", options: { color: "111116" } },
          { text: "Apex Inst of Tech, Coimbatore", options: { color: "111116" } }
        ],
        [
          { text: "Member 3", options: { bold: true, color: "111116" } },
          { text: "Rohan M. Das (Sample)", options: { color: "111116" } },
          { text: "EEE", options: { color: "111116" } },
          { text: "2nd", options: { color: "111116" } },
          { text: "Apex Inst of Tech, Coimbatore", options: { color: "111116" } }
        ],
        [
          { text: "Member 4", options: { bold: true, color: "111116" } },
          { text: "Sara T. George (Sample)", options: { color: "111116" } },
          { text: "AI&DS", options: { color: "111116" } },
          { text: "3rd", options: { color: "111116" } },
          { text: "Apex Inst of Tech, Coimbatore", options: { color: "111116" } }
        ]
      ]
    : [
        [
          { text: "ROLE", options: { bold: true, fill: "111116", color: "FFE500" } },
          { text: "FULL NAME", options: { bold: true, fill: "111116", color: "FFFFFF" } },
          { text: "DEPT", options: { bold: true, fill: "111116", color: "FFFFFF" } },
          { text: "YR", options: { bold: true, fill: "111116", color: "FFFFFF" } },
          { text: "COLLEGE / INSTITUTION", options: { bold: true, fill: "111116", color: "FFFFFF" } }
        ],
        [
          { text: "Leader", options: { bold: true, fill: "FFE500", color: "111116" } },
          { text: "[Full Name as on ID]", options: { color: TOKENS.SLATE_MUTED } },
          { text: "[Dept]", options: { color: TOKENS.SLATE_MUTED } },
          { text: "[Yr]", options: { color: TOKENS.SLATE_MUTED } },
          { text: "[College Name, City]", options: { color: TOKENS.SLATE_MUTED } }
        ],
        [
          { text: "Member 2", options: { bold: true, color: "111116" } },
          { text: "[Full Name as on ID]", options: { color: TOKENS.SLATE_MUTED } },
          { text: "[Dept]", options: { color: TOKENS.SLATE_MUTED } },
          { text: "[Yr]", options: { color: TOKENS.SLATE_MUTED } },
          { text: "[College Name, City]", options: { color: TOKENS.SLATE_MUTED } }
        ],
        [
          { text: "Member 3", options: { bold: true, color: "111116" } },
          { text: "[Optional: Full Name]", options: { color: TOKENS.SLATE_MUTED } },
          { text: "[Dept]", options: { color: TOKENS.SLATE_MUTED } },
          { text: "[Yr]", options: { color: TOKENS.SLATE_MUTED } },
          { text: "[College Name, City]", options: { color: TOKENS.SLATE_MUTED } }
        ],
        [
          { text: "Member 4", options: { bold: true, color: "111116" } },
          { text: "[Optional: Full Name]", options: { color: TOKENS.SLATE_MUTED } },
          { text: "[Dept]", options: { color: TOKENS.SLATE_MUTED } },
          { text: "[Yr]", options: { color: TOKENS.SLATE_MUTED } },
          { text: "[College Name, City]", options: { color: TOKENS.SLATE_MUTED } }
        ]
      ];

  slide.addTable(tableRows, {
    x: 5.25,
    y: cardY + 0.86,
    w: 4.02,
    colW: [0.75, 1.25, 0.52, 0.38, 1.12],
    rowH: [0.32, 0.42, 0.42, 0.42, 0.42],
    fontFace: TOKENS.FONT_BODY,
    fontSize: 7.5,
    border: { pt: 1, color: "111116" },
    align: "left",
    valign: "middle"
  });

  slide.addText("* Teams may have 2, 3, or 4 members. Cross-department and cross-college teams are welcome.", {
    x: 5.30,
    y: cardY + 3.25,
    w: 3.92,
    h: 0.35,
    fontFace: TOKENS.FONT_BODY,
    fontSize: 8,
    italic: true,
    color: TOKENS.SLATE_MUTED,
    valign: "middle"
  });
}

/**
 * SLIDE 02: PROBLEM DECONSTRUCTION & TARGET OBJECTIVES
 */
function buildSlide02(pptx, isReferenceDeck) {
  const slide = pptx.addSlide();
  addSlideChrome(slide, pptx, {
    slideNum: 2,
    eyebrow: "PROBLEM DECONSTRUCTION",
    title: "What Problem Are We Solving and Why Does It Matter?",
    subtitle: "Identify the engineering bottleneck, quantifiable failure cost, and target performance criteria.",
    isReferenceDeck
  });

  const cardY = 1.26;
  const cardH = 3.82;
  const cardW = 2.77;
  const gap = 0.245;

  // 1. Card 1: Core Technical Bottleneck
  addCurvedCard(slide, pptx, {
    x: 0.60,
    y: cardY,
    w: cardW,
    h: cardH,
    headerText: "CORE TECHNICAL BOTTLENECK",
    headerFill: TOKENS.SOLAR_YELLOW
  });

  const c1Text = isReferenceDeck
    ? [
        { text: "Target Domain & Stakeholders:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "High-reliability industrial sensor hubs & automotive telemetry ECUs where watchdog resets cause uncommanded actuator trips.\n\n", options: { color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },

        { text: "Root-Cause Failure Mechanism:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "Legacy software watchdogs lock up if the MCU bus hangs. Single-rail supplies trigger false resets during brownout dips below 1.8V.\n\n", options: { color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },

        { text: "Measurable Cost of Failure:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "Uncommanded node reboots require 420ms cold-start recalibration, causing 2.4% lost telemetry packets and trip latency exceeding ISO 26262 limits.", options: { color: TOKENS.CARBON_BLACK, fontSize: 8.5 } }
      ]
    : [
        { text: "Target Domain & Stakeholders:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "[Specify the exact industry, application, or system where this bottleneck occurs. Who suffers when it fails?]\n\n", options: { color: TOKENS.SLATE_MUTED, fontSize: 8.5 } },

        { text: "Root-Cause Failure Mechanism:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "[What physically, logically, or architecturally fails in existing hardware/software? e.g. metastable state, high dynamic dissipation, memory bus contention]\n\n", options: { color: TOKENS.SLATE_MUTED, fontSize: 8.5 } },

        { text: "Measurable Cost of Failure:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "[Quantify the pain with real metrics: e.g. 14ms reset overhead, 38% power spike, or 12% yield loss under high clock frequencies.]", options: { color: TOKENS.SLATE_MUTED, fontSize: 8.5 } }
      ];

  slide.addText(c1Text, {
    x: 0.76,
    y: cardY + 0.58,
    w: cardW - 0.32,
    h: 3.10,
    fontFace: TOKENS.FONT_BODY,
    valign: "top"
  });

  // 2. Card 2: Target Engineering Objectives
  addCurvedCard(slide, pptx, {
    x: 0.60 + cardW + gap,
    y: cardY,
    w: cardW,
    h: cardH,
    headerText: "TARGET OBJECTIVES",
    headerFill: TOKENS.SOLAR_YELLOW
  });

  const c2Text = isReferenceDeck
    ? [
        { text: "Objective 01: Latency & Speed Target:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "Sub-50ns autonomous hardware fault detection and shadow register switchover without MCU core intervention.\n\n", options: { color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },

        { text: "Objective 02: Power & Resource Budget:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "Maintain standby power below 18mW at 100MHz; total logic fit inside < 450 Xilinx 7-series LUTs.\n\n", options: { color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },

        { text: "Objective 03: Reliability & Fault Tolerance:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "100% glitch immunity across supply voltage brownout dips down to 0.95V using hysteresis dual-threshold comparators.", options: { color: TOKENS.CARBON_BLACK, fontSize: 8.5 } }
      ]
    : [
        { text: "Objective 01: Latency / Speed Target:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "[Define a specific, numeric speed or timing goal: e.g. Achieve sub-10us hardware fault detection without OS or CPU intervention.]\n\n", options: { color: TOKENS.SLATE_MUTED, fontSize: 8.5 } },

        { text: "Objective 02: Power / Resource Constraint:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "[Define a numeric power or resource budget: e.g. Maintain dynamic power below 85mW at 100MHz with < 500 LUTs.]\n\n", options: { color: TOKENS.SLATE_MUTED, fontSize: 8.5 } },

        { text: "Objective 03: Reliability / Accuracy Goal:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "[Define accuracy, recovery, or throughput: e.g. 100% packet integrity across brownout periods down to 0.85V supply.]", options: { color: TOKENS.SLATE_MUTED, fontSize: 8.5 } }
      ];

  slide.addText(c2Text, {
    x: 0.60 + cardW + gap + 0.16,
    y: cardY + 0.58,
    w: cardW - 0.32,
    h: 3.10,
    fontFace: TOKENS.FONT_BODY,
    valign: "top"
  });

  // 3. Card 3: Novelty & Differentiation
  addCurvedCard(slide, pptx, {
    x: 0.60 + (cardW + gap) * 2,
    y: cardY,
    w: cardW,
    h: cardH,
    headerText: "NOVELTY & DIFFERENTIATION",
    headerFill: TOKENS.SOLAR_YELLOW
  });

  const c3Text = isReferenceDeck
    ? [
        { text: "Standard / Textbook Approach:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "External micro-supervisor ICs that assert a hard global reset line, forcing an expensive whole-chip restart.\n\n", options: { color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },

        { text: "Proposed Novel Architecture:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "Dual-rail asynchronous watchdog with shadow state registers and predictive brownout current sensing.\n\n", options: { color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },

        { text: "Quantified Competitive Edge:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "Zero downtime during brownout, eliminating the 420ms reboot window with 8.4x faster state recovery than Texas Instruments TPS3823.", options: { color: TOKENS.CARBON_BLACK, fontSize: 8.5 } }
      ]
    : [
        { text: "Standard / Textbook Implementation:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "[How is this problem typically addressed today, and why is that standard method slow, power-hungry, or fragile?]\n\n", options: { color: TOKENS.SLATE_MUTED, fontSize: 8.5 } },

        { text: "Proposed Novel Architecture:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "[What is your unique hardware, algorithmic, or architectural twist? e.g. asynchronous voting, predictive pipelining, systolic arrays]\n\n", options: { color: TOKENS.SLATE_MUTED, fontSize: 8.5 } },

        { text: "Quantified Competitive Edge:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "[Contrast your build against the baseline: e.g. 5x higher throughput, 40% lower gate count, or zero dropped packets under stress.]", options: { color: TOKENS.SLATE_MUTED, fontSize: 8.5 } }
      ];

  slide.addText(c3Text, {
    x: 0.60 + (cardW + gap) * 2 + 0.16,
    y: cardY + 0.58,
    w: cardW - 0.32,
    h: 3.10,
    fontFace: TOKENS.FONT_BODY,
    valign: "top"
  });
}

/**
 * SLIDE 03: PROPOSED ARCHITECTURE & DATA FLOW
 */
function buildSlide03(pptx, isReferenceDeck) {
  const slide = pptx.addSlide();
  addSlideChrome(slide, pptx, {
    slideNum: 3,
    eyebrow: "SYSTEM ARCHITECTURE",
    title: "Proposed Microarchitecture and Signal / Data Flow",
    subtitle: "High-level block diagram and step-by-step pipeline execution sequence.",
    isReferenceDeck
  });

  const cardY = 1.26;
  const cardH = 3.82;

  // 1. Left Card: System Block Diagram (Width: 5.30")
  addCurvedCard(slide, pptx, {
    x: 0.60,
    y: cardY,
    w: 5.30,
    h: cardH,
    headerText: "SYSTEM BLOCK DIAGRAM (EDIT BOXES OR PASTE SCHEMATIC)",
    headerFill: TOKENS.SOLAR_YELLOW
  });

  slide.addText("4-stage pipeline shown below. Edit labels/signals, or replace these boxes with your architectural schematic.", {
    x: 0.80,
    y: cardY + 0.52,
    w: 4.90,
    h: 0.25,
    fontFace: TOKENS.FONT_BODY,
    fontSize: 8.5,
    color: TOKENS.SLATE_MUTED,
    valign: "middle"
  });

  // 4 Modular Pipeline Blocks inside the Left Card
  const blockW = 2.15;
  const blockH = 1.05;
  const bX1 = 0.82;
  const bX2 = 3.52;
  const bY1 = cardY + 0.85;
  const bY2 = cardY + 2.25;

  // Block 1: Input / Interface
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: bX1,
    y: bY1,
    w: blockW,
    h: blockH,
    fill: { color: "F8F9FA" },
    line: { color: TOKENS.CARBON_BLACK, width: 1.2 },
    rectRadius: 0.05
  });
  slide.addText([
    { text: "01. SENSOR / BUS INTERFACE\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8 } },
    { text: isReferenceDeck ? "Dual SPI/I2C Input Buffers\nVoltage Sensor ADC (12-bit)\nDe-glitch filter logic" : "[e.g. Sensor Input / ADC]\n[Protocol: SPI / I2C / AXI]\n[Signal Conditioning]", options: { color: TOKENS.CARBON_BLACK, fontSize: 7.5 } }
  ], { x: bX1 + 0.1, y: bY1 + 0.08, w: blockW - 0.2, h: blockH - 0.16, fontFace: TOKENS.FONT_BODY, align: "center", valign: "middle" });

  // Arrow 1 -> 2
  slide.addShape(pptx.shapes.RIGHT_ARROW, {
    x: 3.05,
    y: bY1 + 0.38,
    w: 0.38,
    h: 0.22,
    fill: { color: TOKENS.CARBON_BLACK },
    line: { color: TOKENS.CARBON_BLACK, width: 0 }
  });

  // Block 2: Core Logic / Pipeline
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: bX2,
    y: bY1,
    w: blockW,
    h: blockH,
    fill: { color: "F8F9FA" },
    line: { color: TOKENS.CARBON_BLACK, width: 1.2 },
    rectRadius: 0.05
  });
  slide.addText([
    { text: "02. CORE LOGIC / PIPELINE\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8 } },
    { text: isReferenceDeck ? "Parallel Watchdog Counters\nWindow Window Comparator\nClock Domain: 100MHz" : "[e.g. Processing Engine / ALU]\n[Decision Logic / Filter]\n[Clock Domain: 50-100MHz]", options: { color: TOKENS.CARBON_BLACK, fontSize: 7.5 } }
  ], { x: bX2 + 0.1, y: bY1 + 0.08, w: blockW - 0.2, h: blockH - 0.16, fontFace: TOKENS.FONT_BODY, align: "center", valign: "middle" });

  // Arrow 2 -> 4 (Down)
  slide.addShape(pptx.shapes.DOWN_ARROW, {
    x: bX2 + blockW / 2 - 0.11,
    y: bY1 + blockH + 0.08,
    w: 0.22,
    h: 0.20,
    fill: { color: TOKENS.CARBON_BLACK },
    line: { color: TOKENS.CARBON_BLACK, width: 0 }
  });

  // Block 3: Control / Recovery
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: bX1,
    y: bY2,
    w: blockW,
    h: blockH,
    fill: { color: "F8F9FA" },
    line: { color: TOKENS.CARBON_BLACK, width: 1.2 },
    rectRadius: 0.05
  });
  slide.addText([
    { text: "03. CONTROL & SHADOW UNIT\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8 } },
    { text: isReferenceDeck ? "Hysteresis FSM Controller\nShadow Register Bank\nClock Gating Power Control" : "[e.g. State Machine / FSM]\n[Shadow Register / Recovery]\n[Clock Gating & Power Mgmt]", options: { color: TOKENS.CARBON_BLACK, fontSize: 7.5 } }
  ], { x: bX1 + 0.1, y: bY2 + 0.08, w: blockW - 0.2, h: blockH - 0.16, fontFace: TOKENS.FONT_BODY, align: "center", valign: "middle" });

  // Arrow 3 -> 4 (Right)
  slide.addShape(pptx.shapes.RIGHT_ARROW, {
    x: 3.05,
    y: bY2 + 0.38,
    w: 0.38,
    h: 0.22,
    fill: { color: TOKENS.CARBON_BLACK },
    line: { color: TOKENS.CARBON_BLACK, width: 0 }
  });

  // Block 4: Output / Telemetry
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: bX2,
    y: bY2,
    w: blockW,
    h: blockH,
    fill: { color: "F8F9FA" },
    line: { color: TOKENS.CARBON_BLACK, width: 1.2 },
    rectRadius: 0.05
  });
  slide.addText([
    { text: "04. OUTPUT / TELEMETRY\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8 } },
    { text: isReferenceDeck ? "AXI4-Lite Status Bus\nPWM Actuator Drive Lines\nReal-time Telemetry Flags" : "[e.g. AXI4 / SPI Output Bus]\n[Actuator Drive / Status Reg]\n[Real-time Telemetry Flags]", options: { color: TOKENS.CARBON_BLACK, fontSize: 7.5 } }
  ], { x: bX2 + 0.1, y: bY2 + 0.08, w: blockW - 0.2, h: blockH - 0.16, fontFace: TOKENS.FONT_BODY, align: "center", valign: "middle" });

  slide.addText("* Diagram hint: Select and edit text in each box directly, or paste your schematic over this area.", {
    x: 0.80,
    y: cardY + 3.42,
    w: 4.90,
    h: 0.24,
    fontFace: TOKENS.FONT_BODY,
    fontSize: 8,
    italic: true,
    color: TOKENS.SLATE_MUTED,
    valign: "middle"
  });

  // 2. Right Card: Step-by-Step Workflow (Width: 3.26")
  addCurvedCard(slide, pptx, {
    x: 6.14,
    y: cardY,
    w: 3.26,
    h: cardH,
    headerText: "STEP-BY-STEP WORKFLOW",
    headerFill: TOKENS.SOLAR_YELLOW
  });

  const wfText = isReferenceDeck
    ? [
        { text: "Step 01: Input Acquisition & Sampling:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "Dual ADC channels sample external rail voltage at 5MSPS. Deglitch filter eliminates spurious switching noise spikes.\n\n", options: { color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },

        { text: "Step 02: Core Evaluation & Fault Trigger:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "Window comparator detects under-voltage dip below 1.2V in 20ns and asserts an interrupt to the shadow FSM.\n\n", options: { color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },

        { text: "Step 03: Shadow Switchover & Telemetry:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "Primary registers freeze instantly into shadow RAM. Output drivers maintain PWM hold state until power stabilizes.", options: { color: TOKENS.CARBON_BLACK, fontSize: 8.5 } }
      ]
    : [
        { text: "Step 01: Input Acquisition & Sampling:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "[Describe your input sampling frequency, interface protocol (SPI/I2C/UART/AXI), and signal conditioning methodology.]\n\n", options: { color: TOKENS.SLATE_MUTED, fontSize: 8.5 } },

        { text: "Step 02: Core Transformation / Evaluation:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "[Explain how raw data is filtered, computed, or verified by your internal architecture in real time.]\n\n", options: { color: TOKENS.SLATE_MUTED, fontSize: 8.5 } },

        { text: "Step 03: Actuation, Output & Status Report:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "[Describe final output generation, bus transactions, error status flags, and telemetry reporting to host systems.]", options: { color: TOKENS.SLATE_MUTED, fontSize: 8.5 } }
      ];

  slide.addText(wfText, {
    x: 6.30,
    y: cardY + 0.58,
    w: 2.94,
    h: 3.10,
    fontFace: TOKENS.FONT_BODY,
    valign: "top"
  });
}

/**
 * SLIDE 04: ENGINEERING STACK & METHODOLOGY
 */
function buildSlide04(pptx, isReferenceDeck) {
  const slide = pptx.addSlide();
  addSlideChrome(slide, pptx, {
    slideNum: 4,
    eyebrow: "ENGINEERING STACK",
    title: "Tools, Technologies and Implementation Methodology",
    subtitle: "Complete software, hardware, algorithmic, and testbench toolchain required for the 24-hour build.",
    isReferenceDeck
  });

  const cardW = 4.28;
  const cardH = 1.80;
  const col1X = 0.60;
  const col2X = 5.12;
  const row1Y = 1.26;
  const row2Y = 3.28;

  // 1. Top-Left: Software / EDA / Simulation
  addCurvedCard(slide, pptx, {
    x: col1X,
    y: row1Y,
    w: cardW,
    h: cardH,
    headerText: "SOFTWARE / EDA / SIMULATION TOOLS",
    headerFill: TOKENS.SOLAR_YELLOW
  });

  const s1Text = isReferenceDeck
    ? [
        { text: "• EDA Suite / Compilers: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "AMD Vivado 2024.1, GCC Toolchain, Yosys RTL Synthesis\n", options: { color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "• Simulation Tools: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "ModelSim SE, Verilator, GTKWave waveform viewer\n", options: { color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "• Static Analysis & Lint: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "Synopsys Design Compiler, SpyGlass CDC, Python cocotb test harness", options: { color: TOKENS.CARBON_BLACK, fontSize: 8.5 } }
      ]
    : [
        { text: "• EDA Suite / Compilers: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "[e.g. AMD Vivado, Cadence Genus/Innovus, Quartus Prime, GCC/LLVM]\n", options: { color: TOKENS.SLATE_MUTED, fontSize: 8.5 } },
        { text: "• Simulation Tools: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "[e.g. ModelSim, Verilator, Icarus Verilog, GTKWave, MATLAB/Simulink]\n", options: { color: TOKENS.SLATE_MUTED, fontSize: 8.5 } },
        { text: "• Static Analysis & Synthesis: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "[e.g. Synopsys Design Compiler, Yosys, OpenROAD, PyTorch/TensorRT]", options: { color: TOKENS.SLATE_MUTED, fontSize: 8.5 } }
      ];

  slide.addText(s1Text, {
    x: col1X + 0.18,
    y: row1Y + 0.54,
    w: cardW - 0.36,
    h: 1.15,
    fontFace: TOKENS.FONT_BODY,
    valign: "top"
  });

  // 2. Top-Right: Target Hardware & Boards
  addCurvedCard(slide, pptx, {
    x: col2X,
    y: row1Y,
    w: cardW,
    h: cardH,
    headerText: "HARDWARE / TARGET BOARDS / DATASET",
    headerFill: TOKENS.SOLAR_YELLOW
  });

  const s2Text = isReferenceDeck
    ? [
        { text: "• Target Board / Silicon: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "Digilent Basys 3 (Xilinx Artix-7 XC7A35T-1CPG236C)\n", options: { color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "• Sensors & Peripherals: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "INA219 Current/Voltage Monitor, Saleae 8-channel Logic Analyzer\n", options: { color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "• Datasets / Stimulus: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "Simulated ISO 7637-2 electrical disturbance test vectors (CSV)", options: { color: TOKENS.CARBON_BLACK, fontSize: 8.5 } }
      ]
    : [
        { text: "• Target Board / Silicon: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "[e.g. Xilinx Artix-7, STM32F4, Raspberry Pi RP2040, SkyWater 130nm]\n", options: { color: TOKENS.SLATE_MUTED, fontSize: 8.5 } },
        { text: "• Sensors & Peripherals: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "[e.g. SPI Flash, IMU 6-DOF, PMIC, Logic Analyzer, Oscilloscope probes]\n", options: { color: TOKENS.SLATE_MUTED, fontSize: 8.5 } },
        { text: "• Datasets / Stimulus: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "[e.g. Synthetic test vectors, open datasets, recorded telemetry, CSV logs]", options: { color: TOKENS.SLATE_MUTED, fontSize: 8.5 } }
      ];

  slide.addText(s2Text, {
    x: col2X + 0.18,
    y: row1Y + 0.54,
    w: cardW - 0.36,
    h: 1.15,
    fontFace: TOKENS.FONT_BODY,
    valign: "top"
  });

  // 3. Bottom-Left: Core Algorithms & Protocols
  addCurvedCard(slide, pptx, {
    x: col1X,
    y: row2Y,
    w: cardW,
    h: cardH,
    headerText: "CORE ALGORITHMS & PROTOCOLS",
    headerFill: TOKENS.SOLAR_YELLOW
  });

  const s3Text = isReferenceDeck
    ? [
        { text: "• FSM / Control Architecture: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "4-state Gray-encoded Mealy FSM with autonomous lockup recovery\n", options: { color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "• Bus / Interface Protocols: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "AXI4-Lite register access, SPI Mode 0 (10MHz), UART debug console\n", options: { color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "• Key Algorithmic Models: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "16-bit CRC-CCITT error detection, exponential moving average power filter", options: { color: TOKENS.CARBON_BLACK, fontSize: 8.5 } }
      ]
    : [
        { text: "• FSM / Control Architecture: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "[e.g. Mealy/Moore FSM with One-Hot or Gray encoding, state freeze logic]\n", options: { color: TOKENS.SLATE_MUTED, fontSize: 8.5 } },
        { text: "• Bus / Interface Protocols: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "[e.g. AXI4-Stream, APB, SPI Mode 0, UART, I2C Fast-Mode Plus, CAN-FD]\n", options: { color: TOKENS.SLATE_MUTED, fontSize: 8.5 } },
        { text: "• Key Algorithmic Models: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "[e.g. CRC-16-CCITT, Fixed-Point PID, Quantized TinyML INT8 model]", options: { color: TOKENS.SLATE_MUTED, fontSize: 8.5 } }
      ];

  slide.addText(s3Text, {
    x: col1X + 0.18,
    y: row2Y + 0.54,
    w: cardW - 0.36,
    h: 1.15,
    fontFace: TOKENS.FONT_BODY,
    valign: "top"
  });

  // 4. Bottom-Right: Testing & Validation Strategy
  addCurvedCard(slide, pptx, {
    x: col2X,
    y: row2Y,
    w: cardW,
    h: cardH,
    headerText: "TESTING & VALIDATION STRATEGY",
    headerFill: TOKENS.SOLAR_YELLOW
  });

  const s4Text = isReferenceDeck
    ? [
        { text: "• Corner-Case Scenarios: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "Vary supply from 0.8V to 3.3V with 10ns rise/fall slew to stress brownout comparator\n", options: { color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "• Testbench Coverage Goals: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "100% statement & branch coverage, zero illegal FSM state assertions\n", options: { color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "• Live Bring-Up Verification: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "Logic analyzer decodes SPI bus; onboard LEDs mirror shadow register active state", options: { color: TOKENS.CARBON_BLACK, fontSize: 8.5 } }
      ]
    : [
        { text: "• Corner-Case Scenarios: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "[How will you verify behavior under extreme stress, noise, brownout, or overflow?]\n", options: { color: TOKENS.SLATE_MUTED, fontSize: 8.5 } },
        { text: "• Testbench Coverage Goals: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "[Target metrics: e.g. 100% state coverage, 95% branch coverage, zero assertions failed]\n", options: { color: TOKENS.SLATE_MUTED, fontSize: 8.5 } },
        { text: "• Live Bring-Up Verification: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "[Describe probe points, logic analyzer traces, or LED indicators for 24H demo]", options: { color: TOKENS.SLATE_MUTED, fontSize: 8.5 } }
      ];

  slide.addText(s4Text, {
    x: col2X + 0.18,
    y: row2Y + 0.54,
    w: cardW - 0.36,
    h: 1.15,
    fontFace: TOKENS.FONT_BODY,
    valign: "top"
  });
}

/**
 * SLIDE 05: PRELIMINARY FEASIBILITY & ARTIFACT
 */
function buildSlide05(pptx, isReferenceDeck) {
  const slide = pptx.addSlide();
  addSlideChrome(slide, pptx, {
    slideNum: 5,
    eyebrow: "PROOF OF COMPETENCE",
    title: "Preliminary Engineering Artifact and Feasibility Proof",
    subtitle: "Tangible evidence proving design maturity: simulation waveform, state transition table, truth table, or register map.",
    isReferenceDeck
  });

  const cardY = 1.26;
  const cardH = 3.82;

  // 1. Left Card: Concrete Technical Artifact (Width: 5.60")
  addCurvedCard(slide, pptx, {
    x: 0.60,
    y: cardY,
    w: 5.60,
    h: cardH,
    headerText: "CONCRETE TECHNICAL ARTIFACT (PASTE SCHEMATIC / WAVEFORM / TABLE)",
    headerFill: TOKENS.SOLAR_YELLOW
  });

  // Dashed Placeholder Container inside Left Card
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.80,
    y: cardY + 0.54,
    w: 5.20,
    h: 3.12,
    fill: { color: "F8F9FA" },
    line: { color: TOKENS.CARBON_BLACK, width: 1.5, dashType: "dash" },
    rectRadius: 0.06
  });

  if (isReferenceDeck) {
    slide.addText([
      { text: "SAMPLE ARTIFACT: FAULT RECOVERY TIMING WAVEFORM & STATE TABLE\n\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 9 } },
      { text: "CLK       _/~\\_/~\\_/~\\_/~\\_/~\\_/~\\_/~\\_/~\\_/~\\_/~\\_/~\\_/~\\\n", options: { fontFace: TOKENS.FONT_MONO, color: "0055FF", fontSize: 8 } },
      { text: "V_SENSE   === 3.3V =======\\____ 1.1V (DIP) ______/=== 3.3V ===\n", options: { fontFace: TOKENS.FONT_MONO, color: "111116", fontSize: 8 } },
      { text: "BROWNOUT  ________________/~~~~~~~~~~~~~~\\_____________\n", options: { fontFace: TOKENS.FONT_MONO, color: "FF2E93", fontSize: 8 } },
      { text: "SHADOW_EN _______________/~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n", options: { fontFace: TOKENS.FONT_MONO, color: "10B981", fontSize: 8 } },
      { text: "STATE     [  NORMAL_OP  ] [ FAULT_CAPTURE ] [ SHADOW_HOLD ]\n\n", options: { fontFace: TOKENS.FONT_MONO, color: "111116", fontSize: 8 } },
      { text: "State Transition Verification Table:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
      { text: "• Current State: NORMAL -> Next State: FAULT_CAPTURE on (V_SENSE < 1.2V in < 25ns)\n", options: { color: TOKENS.CARBON_BLACK, fontSize: 8 } },
      { text: "• Current State: FAULT_CAPTURE -> Next State: SHADOW_HOLD on (Reg_Freeze_ACK == 1)\n", options: { color: TOKENS.CARBON_BLACK, fontSize: 8 } },
      { text: "• Status: Fully simulated in ModelSim with zero metastable states detected.", options: { italic: true, color: "10B981", fontSize: 8 } }
    ], {
      x: 0.95,
      y: cardY + 0.65,
      w: 4.90,
      h: 2.90,
      fontFace: TOKENS.FONT_BODY,
      valign: "top"
    });
  } else {
    slide.addText([
      { text: "[INSERT YOUR CONCRETE TECHNICAL ARTIFACT HERE]\n\n", options: { bold: true, color: TOKENS.HOT_PINK, fontSize: 10 } },
      { text: "Replace this container with at least ONE tangible artifact proving feasibility:\n\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 9 } },
      { text: "• State Transition Table or FSM Diagram (with state encoding)\n", options: { color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
      { text: "• Hardware Truth Table / Logic Equations (inputs vs outputs)\n", options: { color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
      { text: "• Memory Map / Register Address Table (with bitfields & offsets)\n", options: { color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
      { text: "• Schematic / Pinout Wiring Diagram / Microarchitecture Block\n", options: { color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
      { text: "• Timing Diagram / Latency Budget Table / Critical Path Breakdown\n", options: { color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
      { text: "• Preliminary Simulation Waveform screenshot (GTKWave / ModelSim / Vivado)\n\n", options: { color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
      { text: "(Jury Tip: Submissions with concrete tables or waveforms score significantly higher than generic text descriptions.)", options: { italic: true, color: TOKENS.ELECTRIC_BLUE, fontSize: 8 } }
    ], {
      x: 0.95,
      y: cardY + 0.65,
      w: 4.90,
      h: 2.90,
      fontFace: TOKENS.FONT_BODY,
      valign: "top"
    });
  }

  // 2. Right Card: Target Specs & Constraints (Width: 2.96")
  addCurvedCard(slide, pptx, {
    x: 6.44,
    y: cardY,
    w: 2.96,
    h: cardH,
    headerText: "TARGET SPECS & CONSTRAINTS",
    headerFill: TOKENS.SOLAR_YELLOW
  });

  const rSpecs = isReferenceDeck
    ? [
        { text: "Speed / Latency Target:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "100MHz clock frequency (10.0ns period). Critical path propagation delay: 6.8ns (slack +3.2ns). Fault switchover: < 50ns.\n\n", options: { color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },

        { text: "Power & Resource Budget:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "Dynamic power: 16.4mW at 100MHz. Logic resource usage: 320 LUTs (1.5% of XC7A35T), 120 flip-flops, 0 BRAM.\n\n", options: { color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },

        { text: "Corner-Case & Fault Rules:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "Autonomous recovery if supply voltage recovers within 500us. Watchdog forces graceful PWM shutdown if dip exceeds 2ms.", options: { color: TOKENS.CARBON_BLACK, fontSize: 8.5 } }
      ]
    : [
        { text: "Speed / Latency Target:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "[Specify target clock frequency, propagation delay, or pipeline throughput: e.g. 100MHz clock, 8.2ns critical path, 400 Mbps throughput]\n\n", options: { color: TOKENS.SLATE_MUTED, fontSize: 8.5 } },

        { text: "Power & Resource Budget:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "[Define resource boundaries: e.g. Max dynamic power < 120mW, LUT budget < 1,200, Flip-flops < 800, RAM blocks < 4]\n\n", options: { color: TOKENS.SLATE_MUTED, fontSize: 8.5 } },

        { text: "Corner-Case & Fault Rules:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "[Define handling for brownouts, voltage dips, clock jitter, or bus contention: e.g. Fail-safe state machine return, watchdog interrupt assertion]", options: { color: TOKENS.SLATE_MUTED, fontSize: 8.5 } }
      ];

  slide.addText(rSpecs, {
    x: 6.60,
    y: cardY + 0.58,
    w: 2.64,
    h: 3.10,
    fontFace: TOKENS.FONT_BODY,
    valign: "top"
  });
}

/**
 * SLIDE 06: 24-HOUR ARENA BUILD PLAN & EXPECTED IMPACT
 */
function buildSlide06(pptx, isReferenceDeck) {
  const slide = pptx.addSlide();
  addSlideChrome(slide, pptx, {
    slideNum: 6,
    eyebrow: "FEASIBILITY & IMPACT",
    title: "24-Hour Arena Build Plan and Expected Impact",
    subtitle: "Execution roadmap for the offline SIET finale and real-world deployment value proposition.",
    isReferenceDeck
  });

  const cardW = 2.77;
  const topH = 1.95;
  const botH = 1.65;
  const gap = 0.245;
  const topY = 1.26;
  const botY = 3.43;

  // 1. Top Card 1: Hours 00 - 08
  addCurvedCard(slide, pptx, {
    x: 0.60,
    y: topY,
    w: cardW,
    h: topH,
    headerText: "HOURS 00 - 08: FOUNDATION",
    headerFill: TOKENS.SOLAR_YELLOW
  });

  const h1Text = isReferenceDeck
    ? [
        { text: "• Hours 00 - 02: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8 } },
        { text: "Vivado tool setup, XDC pinout constraints freeze on Basys 3\n", options: { color: TOKENS.CARBON_BLACK, fontSize: 8 } },
        { text: "• Hours 02 - 05: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8 } },
        { text: "Code RTL for dual-window comparator and hysteresis FSM in Verilog\n", options: { color: TOKENS.CARBON_BLACK, fontSize: 8 } },
        { text: "• Hours 05 - 08: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8 } },
        { text: "Ingest Round 2 surprise constraint announced by jury; update registers", options: { color: TOKENS.CARBON_BLACK, fontSize: 8 } }
      ]
    : [
        { text: "• Hours 00 - 02: Setup & Baseline Freeze\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8 } },
        { text: "[Repo setup, EDA tool license check, pinout constraints & baseline architecture freeze]\n", options: { color: TOKENS.SLATE_MUTED, fontSize: 8 } },
        { text: "• Hours 02 - 05: Core Logic Coding\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8 } },
        { text: "[Implement primary RTL / firmware modules & run initial simulation testbench]\n", options: { color: TOKENS.SLATE_MUTED, fontSize: 8 } },
        { text: "• Hours 05 - 08: Live Twist Integration\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8 } },
        { text: "[Ingest Round 2 surprise constraint announced by jury and adjust modules]", options: { color: TOKENS.SLATE_MUTED, fontSize: 8 } }
      ];

  slide.addText(h1Text, {
    x: 0.74,
    y: topY + 0.50,
    w: cardW - 0.28,
    h: 1.35,
    fontFace: TOKENS.FONT_BODY,
    valign: "top"
  });

  // 2. Top Card 2: Hours 08 - 16
  addCurvedCard(slide, pptx, {
    x: 0.60 + cardW + gap,
    y: topY,
    w: cardW,
    h: topH,
    headerText: "HOURS 08 - 16: INTEGRATION",
    headerFill: TOKENS.SOLAR_YELLOW
  });

  const h2Text = isReferenceDeck
    ? [
        { text: "• Hours 08 - 11: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8 } },
        { text: "Interface SPI ADC, synthesize bitstream, probe signals with logic analyzer\n", options: { color: TOKENS.CARBON_BLACK, fontSize: 8 } },
        { text: "• Hours 11 - 14: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8 } },
        { text: "Flash FPGA bitstream to target; verify physical recovery on breadboard\n", options: { color: TOKENS.CARBON_BLACK, fontSize: 8 } },
        { text: "• Hours 14 - 16: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8 } },
        { text: "Midnight milestone audit; demonstrate 50% milestone to jury panel", options: { color: TOKENS.CARBON_BLACK, fontSize: 8 } }
      ]
    : [
        { text: "• Hours 08 - 11: Subsystem Interfacing\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8 } },
        { text: "[Connect communication buses, memory controllers, and sensor interfaces]\n", options: { color: TOKENS.SLATE_MUTED, fontSize: 8 } },
        { text: "• Hours 11 - 14: Hardware / Testbed Bring-Up\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8 } },
        { text: "[Download bitstream / firmware to physical target; probe test points]\n", options: { color: TOKENS.SLATE_MUTED, fontSize: 8 } },
        { text: "• Hours 14 - 16: Midnight Milestone Audit\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8 } },
        { text: "[Verify 50% milestone functionality before jury checkpoint]", options: { color: TOKENS.SLATE_MUTED, fontSize: 8 } }
      ];

  slide.addText(h2Text, {
    x: 0.60 + cardW + gap + 0.14,
    y: topY + 0.50,
    w: cardW - 0.28,
    h: 1.35,
    fontFace: TOKENS.FONT_BODY,
    valign: "top"
  });

  // 3. Top Card 3: Hours 16 - 24
  addCurvedCard(slide, pptx, {
    x: 0.60 + (cardW + gap) * 2,
    y: topY,
    w: cardW,
    h: topH,
    headerText: "HOURS 16 - 24: DEMO POLISH",
    headerFill: TOKENS.SOLAR_YELLOW
  });

  const h3Text = isReferenceDeck
    ? [
        { text: "• Hours 16 - 19: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8 } },
        { text: "Run brownout stress loops; measure switchover latency with oscilloscope\n", options: { color: TOKENS.CARBON_BLACK, fontSize: 8 } },
        { text: "• Hours 19 - 22: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8 } },
        { text: "Connect real-time Python telemetry dashboard for live visual demonstration\n", options: { color: TOKENS.CARBON_BLACK, fontSize: 8 } },
        { text: "• Hours 22 - 24: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8 } },
        { text: "Code freeze at 10:30 AM; deliver live 3-minute stage pitch to jury", options: { color: TOKENS.CARBON_BLACK, fontSize: 8 } }
      ]
    : [
        { text: "• Hours 16 - 19: Stress & Performance Testing\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8 } },
        { text: "[Subject build to stress, measure latency/power benchmarks, log results]\n", options: { color: TOKENS.SLATE_MUTED, fontSize: 8 } },
        { text: "• Hours 19 - 22: Demo Polish & Visuals\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8 } },
        { text: "[Package interactive visual demo, terminal output, or LED indicators for jury]\n", options: { color: TOKENS.SLATE_MUTED, fontSize: 8 } },
        { text: "• Hours 22 - 24: Hardware Freeze & Pitch\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8 } },
        { text: "[Freeze all code at 10:30 AM; deliver live 3-minute stage presentation]", options: { color: TOKENS.SLATE_MUTED, fontSize: 8 } }
      ];

  slide.addText(h3Text, {
    x: 0.60 + (cardW + gap) * 2 + 0.14,
    y: topY + 0.50,
    w: cardW - 0.28,
    h: 1.35,
    fontFace: TOKENS.FONT_BODY,
    valign: "top"
  });

  // 4. Bottom-Left Card: Real-World Impact (Width: 4.28")
  addCurvedCard(slide, pptx, {
    x: 0.60,
    y: botY,
    w: 4.28,
    h: botH,
    headerText: "REAL-WORLD IMPACT & BENEFICIARIES",
    headerFill: TOKENS.SOLAR_YELLOW
  });

  const b1Text = isReferenceDeck
    ? [
        { text: "Target Beneficiaries & Industry Application:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "Automotive battery management systems (BMS) and aerospace satellite telemetry nodes where brownouts cannot trigger system reboot.\n\n", options: { color: TOKENS.CARBON_BLACK, fontSize: 8 } },
        { text: "Quantified Value Proposition:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "Eliminates $28,000/yr downtime per automated line, saves 420ms cold-start delay, and achieves 100% zero lost telemetry frames.", options: { color: TOKENS.CARBON_BLACK, fontSize: 8 } }
      ]
    : [
        { text: "Target Beneficiaries & Industry:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "[Who directly adopts or benefits from this solution? e.g. EV battery management, satellite telemetry, edge AI sensors, smart grid]\n\n", options: { color: TOKENS.SLATE_MUTED, fontSize: 8 } },
        { text: "Quantified Value Proposition:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "[What is the measurable impact when your build succeeds? e.g. 40% cost reduction, 10x uptime, 3.5x lower power, zero lost frames]", options: { color: TOKENS.SLATE_MUTED, fontSize: 8 } }
      ];

  slide.addText(b1Text, {
    x: 0.78,
    y: botY + 0.50,
    w: 3.92,
    h: 1.05,
    fontFace: TOKENS.FONT_BODY,
    valign: "top"
  });

  // 5. Bottom-Right Card: Submission Checklist & References (Width: 4.28")
  addCurvedCard(slide, pptx, {
    x: 5.12,
    y: botY,
    w: 4.28,
    h: botH,
    headerText: "KEY REFERENCES & SUBMISSION NOTE",
    headerFill: TOKENS.SOLAR_YELLOW
  });

  const b2Text = isReferenceDeck
    ? [
        { text: "Key Technical References:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "1. IEEE Trans. VLSI Systems: 'Sub-Threshold Glitch Removal in Asynchronous Circuits'\n2. Texas Instruments TPS3823 Datasheet & ISO 26262 Automotive Safety Standard\n\n", options: { color: TOKENS.CARBON_BLACK, fontSize: 8 } },
        { text: "Mandatory Submission Checklist:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "[X] Maximum 6 slides strictly followed  [X] Exported as PDF under 3MB  [X] Submitted via portal", options: { bold: true, color: "10B981", fontSize: 8 } }
      ]
    : [
        { text: "Key Technical References:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "[Cite 1-2 standard technical references: IEEE papers, chip datasheets, or textbook algorithms]\n\n", options: { color: TOKENS.SLATE_MUTED, fontSize: 8 } },
        { text: "Mandatory Submission Checklist:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontSize: 8.5 } },
        { text: "[ ] Maximum 6 slides strictly followed (no extra slides)\n[ ] Exported as PDF under 3MB\n[ ] Submitted via portal (https://veltraxx.in/submit-ppt) on Dec 02-03", options: { bold: true, color: TOKENS.HOT_PINK, fontSize: 8 } }
      ];

  slide.addText(b2Text, {
    x: 5.30,
    y: botY + 0.50,
    w: 3.92,
    h: 1.05,
    fontFace: TOKENS.FONT_BODY,
    valign: "top"
  });
}

// ==============================================================================
// 4. MAIN GENERATION RUNNER
// ==============================================================================
async function main() {
  console.log("==================================================================");
  console.log("VELTRAXX 2.0: GENERATING PROFESSIONAL SUBMISSION PPTX DECKS (V2)");
  console.log("==================================================================");

  const outDir = path.resolve(__dirname, "../public/downloads");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // ----------------------------------------------------------------------------
  // DECK 1: BLANK TEMPLATE (VELTRAXX_2.0_Round1_Template.pptx)
  // ----------------------------------------------------------------------------
  console.log("[Deck 1/2] Generating Blank Submission Template with smooth curves...");
  const templateDeck = new pptxgen();
  templateDeck.layout = "LAYOUT_16x9";
  templateDeck.title = "VELTRAXX 2.0 - Round 1 Submission Blueprint (Template)";
  templateDeck.author = "SIET Department of EE (VLSI)";
  templateDeck.company = "Sri Shakthi Institute of Engineering and Technology";

  buildSlide01(templateDeck, false);
  buildSlide02(templateDeck, false);
  buildSlide03(templateDeck, false);
  buildSlide04(templateDeck, false);
  buildSlide05(templateDeck, false);
  buildSlide06(templateDeck, false);

  const templatePath = path.join(outDir, "VELTRAXX_2.0_Round1_Template.pptx");
  await templateDeck.writeFile({ fileName: templatePath });
  console.log(`[SUCCESS] Blank Template saved to: ${templatePath}`);

  // ----------------------------------------------------------------------------
  // DECK 2: FILLED REFERENCE DECK (VELTRAXX_2.0_Round1_Reference_Example.pptx)
  // ----------------------------------------------------------------------------
  console.log("[Deck 2/2] Generating Filled Reference Example Deck with smooth curves...");
  const refDeck = new pptxgen();
  refDeck.layout = "LAYOUT_16x9";
  refDeck.title = "VELTRAXX 2.0 - Round 1 Pitch Blueprint (Sample Reference)";
  refDeck.author = "SIET Department of EE (VLSI)";
  refDeck.company = "Sri Shakthi Institute of Engineering and Technology";

  buildSlide01(refDeck, true);
  buildSlide02(refDeck, true);
  buildSlide03(refDeck, true);
  buildSlide04(refDeck, true);
  buildSlide05(refDeck, true);
  buildSlide06(refDeck, true);

  const refPath = path.join(outDir, "VELTRAXX_2.0_Round1_Reference_Example.pptx");
  await refDeck.writeFile({ fileName: refPath });
  console.log(`[SUCCESS] Reference Example Deck saved to: ${refPath}`);

  console.log("==================================================================");
  console.log("ALL DECKS GENERATED SUCCESSFULLY WITH SMOOTH CURVES & NATIVE CARDS!");
  console.log("==================================================================");
}

main().catch(err => {
  console.error("Fatal Error generating decks:", err);
  process.exit(1);
});
