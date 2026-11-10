/**
 * ==============================================================================
 * VELTRAXX 2.0: AUTOMATED DUAL-DECK PPTX GENERATOR
 * (BLANK SUBMISSION TEMPLATE + FILLED REFERENCE EXAMPLE DECK)
 * ==============================================================================
 * 
 * Powered by pptxgenjs & Neo-Brutalist Design System Tokens.
 * 
 * Generates two separate, visually identical PowerPoint decks into public/downloads/:
 * 1. VELTRAXX_2.0_Round1_Template.pptx       - The Blank Submission Template with [Placeholders]
 * 2. VELTRAXX_2.0_Round1_Reference_Example.pptx - The Filled Reference Deck with Fictional Project Aegis
 * 
 * Strict Quality Guardrails Enforced:
 * - Zero em-dashes (hyphens and colons only)
 * - 100% fictional personas and sample project (zero real participant/student data)
 * - True Neo-Brutalist offset shadows (0 blur, 2pt solid borders)
 * - Native editable shapes, text boxes, and tables (no flattened images)
 * ==============================================================================
 */

import pptxgen from "pptxgenjs";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==============================================================================
// 1. CANONICAL WEBSITE DESIGN SYSTEM TOKENS (No '#' prefixes in pptxgenjs)
// ==============================================================================
const TOKENS = {
  // Surfaces
  CANVAS_CREAM: "FAF8F5", // Primary light background
  OBSIDIAN_DARK: "0D0D11", // High-contrast dark background for Slide 1 & Slide 5
  CARD_WHITE: "FFFFFF",
  CARD_GRAY: "F4F4F6",

  // Accents & Borders
  CARBON_BLACK: "111116", // All 2pt borders, primary text, and offset shadows
  SOLAR_YELLOW: "FFE500", // Primary highlights, badges, Slide 1 accents
  HOT_PINK: "FF2E93", // Critical callouts, Slide 5 Proof-of-Competence accent
  ELECTRIC_CYAN: "00E5FF", // System architecture & track tags
  NEON_LIME: "B6FF00", // Free Round 1 & feasibility tags
  COBALT_BLUE: "0055FF", // Secondary technical headers
  MUTED_GRAY: "6B6B78", // Instructional subtext
  LIGHT_BORDER: "D8D8DC",
  DARK_BORDER: "2A2A32",

  // Typography
  FONT_DISPLAY: "Segoe UI",
  FONT_MONO: "Consolas",
  FONT_BODY: "Segoe UI"
};

// ==============================================================================
// 2. SHARED NEO-BRUTALIST DRAWING ENGINE (REUSABLE HELPERS)
// ==============================================================================

/**
 * Adds a Neo-Brutalist Card with a true hard offset shadow and optional header strip.
 */
function addNeoCard(slide, pptx, {
  x,
  y,
  w,
  h,
  fill = TOKENS.CARD_WHITE,
  shadowColor = TOKENS.CARBON_BLACK,
  headerFill = null,
  headerText = null,
  headerTextColor = TOKENS.CARBON_BLACK
}) {
  // 1. Hard Offset Shadow Rectangle (Offset by +0.06" right and down, 0 blur)
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: x + 0.06,
    y: y + 0.06,
    w,
    h,
    fill: { color: shadowColor },
    line: { color: shadowColor, width: 0 }
  });

  // 2. Main Card Front Surface
  slide.addShape(pptx.shapes.RECTANGLE, {
    x,
    y,
    w,
    h,
    fill: { color: fill },
    line: { color: TOKENS.CARBON_BLACK, width: 2 }
  });

  // 3. Optional Header Strip
  if (headerText) {
    const headerHeight = 0.36;
    slide.addShape(pptx.shapes.RECTANGLE, {
      x,
      y,
      w,
      h: headerHeight,
      fill: { color: headerFill || TOKENS.SOLAR_YELLOW },
      line: { color: TOKENS.CARBON_BLACK, width: 2 }
    });

    slide.addText(headerText, {
      x: x + 0.12,
      y: y + 0.02,
      w: w - 0.24,
      h: headerHeight - 0.04,
      fontFace: TOKENS.FONT_MONO,
      fontSize: 9.5,
      bold: true,
      color: headerTextColor,
      align: "left",
      valign: "middle",
      margin: [0, 4, 0, 4]
    });
  }
}

/**
 * Adds a Neo-Brutalist Pill Badge with a +0.03" hard offset shadow.
 */
function addNeoPill(slide, pptx, {
  x,
  y,
  w,
  h,
  fill,
  textColor = TOKENS.CARBON_BLACK,
  text
}) {
  // Pill Hard Shadow
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: x + 0.03,
    y: y + 0.03,
    w,
    h,
    fill: { color: TOKENS.CARBON_BLACK },
    line: { color: TOKENS.CARBON_BLACK, width: 0 }
  });

  // Pill Front Face
  slide.addShape(pptx.shapes.RECTANGLE, {
    x,
    y,
    w,
    h,
    fill: { color: fill },
    line: { color: TOKENS.CARBON_BLACK, width: 1.5 }
  });

  // Pill Centered Label
  slide.addText(text, {
    x,
    y,
    w,
    h,
    fontFace: TOKENS.FONT_MONO,
    fontSize: 8.5,
    bold: true,
    color: textColor,
    align: "center",
    valign: "middle",
    margin: [0, 2, 0, 2]
  });
}

/**
 * Adds Slide Chrome: Background, Top-Left Eyebrow, Top-Right Badge, Title, and Footer.
 */
function addSlideChrome(slide, pptx, {
  slideNum,
  eyebrow,
  title,
  isDark = false,
  isReferenceDeck = false
}) {
  // 1. Set Slide Background
  slide.background = { color: isDark ? TOKENS.OBSIDIAN_DARK : TOKENS.CANVAS_CREAM };

  // 2. Top-Left Eyebrow Pill
  const eyebrowFill = isDark 
    ? (slideNum === 5 ? TOKENS.HOT_PINK : TOKENS.SOLAR_YELLOW)
    : TOKENS.CARBON_BLACK;
  const eyebrowText = isDark 
    ? (slideNum === 5 ? TOKENS.CARD_WHITE : TOKENS.CARBON_BLACK)
    : TOKENS.SOLAR_YELLOW;

  addNeoPill(slide, pptx, {
    x: 0.55,
    y: 0.35,
    w: 3.20,
    h: 0.28,
    fill: eyebrowFill,
    textColor: eyebrowText,
    text: `0${slideNum} // ${eyebrow}`
  });

  // 3. Top-Right Badge
  if (isReferenceDeck) {
    addNeoPill(slide, pptx, {
      x: 5.45,
      y: 0.35,
      w: 4.00,
      h: 0.28,
      fill: TOKENS.HOT_PINK,
      textColor: TOKENS.CARD_WHITE,
      text: "SAMPLE REFERENCE DECK - FOR FORMAT GUIDANCE ONLY"
    });
  } else {
    addNeoPill(slide, pptx, {
      x: 6.95,
      y: 0.35,
      w: 2.50,
      h: 0.28,
      fill: isDark ? TOKENS.CARBON_BLACK : TOKENS.CARD_WHITE,
      textColor: isDark ? TOKENS.ELECTRIC_CYAN : TOKENS.CARBON_BLACK,
      text: "VELTRAXX 2.0 · ROUND 1 PITCH"
    });
  }

  // 4. Slide Title (unless slide 1, which has custom hero typography)
  if (slideNum !== 1) {
    slide.addText(title, {
      x: 0.55,
      y: 0.68,
      w: 8.90,
      h: 0.45,
      fontFace: TOKENS.FONT_DISPLAY,
      fontSize: 16,
      bold: true,
      color: isDark ? TOKENS.CARD_WHITE : TOKENS.CARBON_BLACK,
      valign: "top"
    });
  }

  // 5. Bottom Separator Line & Footer Notes
  slide.addShape(pptx.shapes.LINE, {
    x: 0.55,
    y: 5.18,
    w: 8.90,
    h: 0,
    line: { color: isDark ? TOKENS.DARK_BORDER : TOKENS.LIGHT_BORDER, width: 1 }
  });

  slide.addText("MAX 6 SLIDES · EXPORT AS PDF UNDER 3MB · SUBMIT AT /SUBMIT-PPT", {
    x: 0.55,
    y: 5.24,
    w: 7.20,
    h: 0.25,
    fontFace: TOKENS.FONT_MONO,
    fontSize: 8,
    color: isDark ? TOKENS.MUTED_GRAY : TOKENS.MUTED_GRAY,
    valign: "middle"
  });

  slide.addText(`0${slideNum} / 06`, {
    x: 8.25,
    y: 5.24,
    w: 1.20,
    h: 0.25,
    fontFace: TOKENS.FONT_MONO,
    fontSize: 9,
    bold: true,
    color: isDark ? TOKENS.SOLAR_YELLOW : TOKENS.CARBON_BLACK,
    align: "right",
    valign: "middle"
  });
}

// ==============================================================================
// 3. SLIDE BUILDERS (SLIDES 1 TO 6)
// ==============================================================================

/**
 * SLIDE 01: COVER & TEAM IDENTITY (OBSIDIAN_DARK)
 */
function buildSlide01(pptx, isReferenceDeck) {
  const slide = pptx.addSlide();
  addSlideChrome(slide, pptx, {
    slideNum: 1,
    eyebrow: "ROUND 1 SUBMISSION BLUEPRINT",
    title: "",
    isDark: true,
    isReferenceDeck
  });

  // Hero Headline
  slide.addText("VELTRAXX 2.0: ROUND 1 PITCH BLUEPRINT", {
    x: 0.55,
    y: 0.70,
    w: 8.90,
    h: 0.42,
    fontFace: TOKENS.FONT_DISPLAY,
    fontSize: 20,
    bold: true,
    color: TOKENS.CARD_WHITE,
    valign: "middle"
  });

  slide.addText("Department of EE (VLSI Design & Technology) · Sri Shakthi Institute of Engineering and Technology", {
    x: 0.55,
    y: 1.10,
    w: 8.90,
    h: 0.26,
    fontFace: TOKENS.FONT_MONO,
    fontSize: 9.5,
    bold: true,
    color: TOKENS.SOLAR_YELLOW,
    valign: "top"
  });

  // Left Card: Project & Track Identity
  addNeoCard(slide, pptx, {
    x: 0.55,
    y: 1.48,
    w: 4.15,
    h: 3.55,
    fill: TOKENS.CARD_WHITE,
    shadowColor: TOKENS.SOLAR_YELLOW,
    headerFill: TOKENS.SOLAR_YELLOW,
    headerText: "PROJECT & TRACK SPECIFICATION"
  });

  const leftCardText = isReferenceDeck
    ? [
        { text: "TEAM ID:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 9 } },
        { text: "VTX2-000 (SAMPLE REFERENCE)\n\n", options: { color: TOKENS.COBALT_BLUE, bold: true, fontFace: TOKENS.FONT_MONO, fontSize: 10 } },

        { text: "TEAM NAME:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 9 } },
        { text: "Project Aegis (Fictional Sample Team)\n\n", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 9.5 } },

        { text: "SELECTED DOMAIN TRACK:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 9 } },
        { text: "TRACK 01: ASIC & Custom Silicon\n\n", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 9.5 } },

        { text: "PROBLEM STATEMENT CODE & TITLE:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 9 } },
        { text: "VTX-T1-01: Glitch-Free Dual-Sensor Watchdog & Fault Recovery Node\n\n", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 9.5 } },

        { text: "ACADEMIC DIVISION TIER:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 9 } },
        { text: "Tier B: Senior UG Division (3rd / 4th Year)", options: { color: TOKENS.CARBON_BLACK, bold: true, fontFace: TOKENS.FONT_BODY, fontSize: 9.5 } }
      ]
    : [
        { text: "TEAM ID (FROM CONFIRMATION EMAIL / PORTAL):\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 9 } },
        { text: "[VTX2-XXX: e.g. VTX2-048]\n\n", options: { color: TOKENS.COBALT_BLUE, bold: true, fontFace: TOKENS.FONT_MONO, fontSize: 10 } },

        { text: "OFFICIAL TEAM NAME:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 9 } },
        { text: "[Enter Team Name: e.g. Silicon Synapse]\n\n", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 9.5 } },

        { text: "SELECTED DOMAIN TRACK:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 9 } },
        { text: "[Select Track: ASIC / FPGA / Edge AI / IoT / Open Silicon]\n\n", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 9.5 } },

        { text: "PROBLEM STATEMENT CODE & TITLE:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 9 } },
        { text: "[e.g. VTX-T1-01: Low-Power Multi-Port Register File with Self-Testing]\n\n", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 9.5 } },

        { text: "ACADEMIC DIVISION TIER:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 9 } },
        { text: "[Tier A: 1st/2nd Yr UG  OR  Tier B: 3rd/4th Yr & PG]", options: { color: TOKENS.MUTED_GRAY, bold: true, fontFace: TOKENS.FONT_BODY, fontSize: 9.5 } }
      ];

  slide.addText(leftCardText, {
    x: 0.70,
    y: 1.95,
    w: 3.85,
    h: 2.70,
    valign: "top",
    margin: 0
  });

  slide.addText(
    isReferenceDeck
      ? "* Note: Sample format for guidance only. Replace with your official team data."
      : "* Ensure Team ID matches the ID generated upon free registration at /register.",
    {
      x: 0.70,
      y: 4.70,
      w: 3.85,
      h: 0.25,
      fontFace: TOKENS.FONT_MONO,
      fontSize: 7.5,
      color: TOKENS.MUTED_GRAY,
      italic: true
    }
  );

  // Right Card: Team Builders Roster Table
  addNeoCard(slide, pptx, {
    x: 4.95,
    y: 1.48,
    w: 4.50,
    h: 3.55,
    fill: TOKENS.CARD_WHITE,
    shadowColor: TOKENS.ELECTRIC_CYAN,
    headerFill: TOKENS.ELECTRIC_CYAN,
    headerText: "ENGINEERING TEAM ROSTER (2-4 MEMBERS)"
  });

  slide.addText("Member 01 is the Team Leader & primary contact for shortlisting verification.", {
    x: 5.10,
    y: 1.92,
    w: 4.20,
    h: 0.22,
    fontFace: TOKENS.FONT_MONO,
    fontSize: 7.5,
    color: TOKENS.MUTED_GRAY
  });

  const rosterRows = [
    [
      { text: "ROLE", options: { bold: true, fill: { color: TOKENS.CARBON_BLACK }, color: TOKENS.ELECTRIC_CYAN, fontFace: TOKENS.FONT_MONO, fontSize: 8 } },
      { text: "FULL NAME", options: { bold: true, fill: { color: TOKENS.CARBON_BLACK }, color: TOKENS.CARD_WHITE, fontFace: TOKENS.FONT_MONO, fontSize: 8 } },
      { text: "DEPT", options: { bold: true, fill: { color: TOKENS.CARBON_BLACK }, color: TOKENS.CARD_WHITE, fontFace: TOKENS.FONT_MONO, fontSize: 8 } },
      { text: "YR", options: { bold: true, fill: { color: TOKENS.CARBON_BLACK }, color: TOKENS.CARD_WHITE, fontFace: TOKENS.FONT_MONO, fontSize: 8 } },
      { text: "COLLEGE / INSTITUTE", options: { bold: true, fill: { color: TOKENS.CARBON_BLACK }, color: TOKENS.CARD_WHITE, fontFace: TOKENS.FONT_MONO, fontSize: 8 } }
    ]
  ];

  if (isReferenceDeck) {
    rosterRows.push(
      [
        { text: "Leader", options: { bold: true, fill: { color: TOKENS.SOLAR_YELLOW }, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8 } },
        { text: "Alex V. Kumar (Sample)", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8 } },
        { text: "ECE", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8 } },
        { text: "3rd", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8 } },
        { text: "Apex Inst of Tech, Coimbatore", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 7.5 } }
      ],
      [
        { text: "Member 2", options: { bold: true, fill: { color: TOKENS.CARD_GRAY }, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8 } },
        { text: "Priya S. Nair (Sample)", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8 } },
        { text: "VLSI", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8 } },
        { text: "3rd", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8 } },
        { text: "Apex Inst of Tech, Coimbatore", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 7.5 } }
      ],
      [
        { text: "Member 3", options: { bold: true, fill: { color: TOKENS.CARD_GRAY }, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8 } },
        { text: "Rohan M. Das (Sample)", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8 } },
        { text: "EEE", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8 } },
        { text: "2nd", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8 } },
        { text: "Apex Inst of Tech, Coimbatore", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 7.5 } }
      ],
      [
        { text: "Member 4", options: { bold: true, fill: { color: TOKENS.CARD_GRAY }, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8 } },
        { text: "Sara T. George (Sample)", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8 } },
        { text: "AI&DS", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8 } },
        { text: "3rd", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8 } },
        { text: "Apex Inst of Tech, Coimbatore", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 7.5 } }
      ]
    );
  } else {
    rosterRows.push(
      [
        { text: "Leader", options: { bold: true, fill: { color: TOKENS.SOLAR_YELLOW }, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8 } },
        { text: "[Full Name as on ID]", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8 } },
        { text: "[Dept]", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8 } },
        { text: "[Yr]", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8 } },
        { text: "[College Name, City]", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 7.5 } }
      ],
      [
        { text: "Member 2", options: { bold: true, fill: { color: TOKENS.CARD_GRAY }, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8 } },
        { text: "[Full Name as on ID]", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8 } },
        { text: "[Dept]", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8 } },
        { text: "[Yr]", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8 } },
        { text: "[College Name, City]", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 7.5 } }
      ],
      [
        { text: "Member 3", options: { bold: true, fill: { color: TOKENS.CARD_GRAY }, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8 } },
        { text: "[Optional: Full Name / blank]", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8 } },
        { text: "[Dept]", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8 } },
        { text: "[Yr]", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8 } },
        { text: "[College Name, City]", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 7.5 } }
      ],
      [
        { text: "Member 4", options: { bold: true, fill: { color: TOKENS.CARD_GRAY }, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8 } },
        { text: "[Optional: Full Name / blank]", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8 } },
        { text: "[Dept]", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8 } },
        { text: "[Yr]", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8 } },
        { text: "[College Name, City]", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 7.5 } }
      ]
    );
  }

  slide.addTable(rosterRows, {
    x: 5.08,
    y: 2.18,
    w: 4.24,
    colW: [0.72, 1.15, 0.62, 0.50, 1.25],
    border: { pt: 1, color: TOKENS.CARBON_BLACK },
    align: "left",
    valign: "middle",
    margin: [2, 4, 2, 4]
  });

  slide.addText(
    isReferenceDeck
      ? "* Sample Team: 4 members across ECE, VLSI, EEE, and AI&DS branches."
      : "* Teams may have 2, 3, or 4 members. Cross-department & cross-college teams are welcome.",
    {
      x: 5.10,
      y: 4.70,
      w: 4.20,
      h: 0.25,
      fontFace: TOKENS.FONT_MONO,
      fontSize: 7.5,
      color: TOKENS.MUTED_GRAY,
      italic: true
    }
  );
}

/**
 * SLIDE 02: THE PROBLEM & BOTTLENECK (CANVAS_CREAM)
 */
function buildSlide02(pptx, isReferenceDeck) {
  const slide = pptx.addSlide();
  addSlideChrome(slide, pptx, {
    slideNum: 2,
    eyebrow: "PROBLEM DECONSTRUCTION",
    title: "What Problem Are We Solving & Why Does It Matter?",
    isDark: false,
    isReferenceDeck
  });

  const cardW = 2.82;
  const cardH = 3.80;
  const cardY = 1.22;

  // Card 1: Core Technical Bottleneck
  addNeoCard(slide, pptx, {
    x: 0.55,
    y: cardY,
    w: cardW,
    h: cardH,
    fill: TOKENS.CARD_WHITE,
    shadowColor: TOKENS.HOT_PINK,
    headerFill: TOKENS.HOT_PINK,
    headerText: "CORE TECHNICAL BOTTLENECK",
    headerTextColor: TOKENS.CARD_WHITE
  });

  const card1Text = isReferenceDeck
    ? [
        { text: "Target Domain / Application:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "Autonomous industrial sensor hubs deployed in high-EMI switchgear and variable-temperature factory floors.\n\n", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } },

        { text: "Root-Cause Failure Mechanism:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "Electrical transients and ground-bounce cause register bit-flips and clock-jitter glitches, locking peripheral SPI communication and corrupting telemetry.\n\n", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } },

        { text: "Measurable Cost of Failure:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "Current commercial modules force a complete processor cold-restart, causing 420ms of unmonitored blind-time and 3.2x energy surge per event.", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } }
      ]
    : [
        { text: "Target Domain & Stakeholders:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "[Specify the exact industry, application, or system where this bottleneck occurs. Who suffers when it fails?]\n\n", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } },

        { text: "Root-Cause Failure Mechanism:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "[What physically, logically, or architecturally fails in existing hardware/software? (e.g. metastable state, high dynamic dissipation, memory bus contention)]\n\n", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } },

        { text: "Measurable Cost of Failure:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "[Quantify the pain with real metrics: e.g. 14ms reset overhead, 38% power spike, or 12% yield loss under high clock frequencies.]", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } }
      ];

  slide.addText(card1Text, {
    x: 0.68,
    y: cardY + 0.46,
    w: cardW - 0.26,
    h: cardH - 0.55,
    valign: "top",
    margin: 0
  });

  // Card 2: Target Engineering Objectives
  addNeoCard(slide, pptx, {
    x: 3.59,
    y: cardY,
    w: cardW,
    h: cardH,
    fill: TOKENS.CARD_WHITE,
    shadowColor: TOKENS.SOLAR_YELLOW,
    headerFill: TOKENS.SOLAR_YELLOW,
    headerText: "TARGET ENGINEERING OBJECTIVES",
    headerTextColor: TOKENS.CARBON_BLACK
  });

  const card2Text = isReferenceDeck
    ? [
        { text: "Objective 01: Sub-12us Glitch Detection\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "Detect transient voltage/clock anomalies in hardware within 600ns using dual differential comparator windows with zero CPU polling.\n\n", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } },

        { text: "Objective 02: Ultra-Low Standby Overhead\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "Maintain total watchdog logic power under 18mW at 50MHz operating frequency on Artix-7 / 90nm equivalent process.\n\n", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } },

        { text: "Objective 03: 100% Shadow State Recovery\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "Restore critical register state in under 3 clock cycles upon transient clearance without dropping or corrupting the active SPI stream.", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } }
      ]
    : [
        { text: "Objective 01: Latency / Speed Target\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "[Define a specific, numeric speed or timing goal: e.g. Achieve sub-10us hardware fault detection without OS or CPU intervention.]\n\n", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } },

        { text: "Objective 02: Power / Resource Constraint\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "[Define a numeric power or resource budget: e.g. Maintain dynamic power below 85mW at 100MHz with < 500 LUTs.]\n\n", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } },

        { text: "Objective 03: Reliability / Accuracy Goal\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "[Define accuracy, recovery, or throughput: e.g. 100% packet integrity across brownout periods down to 0.85V supply.]", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } }
      ];

  slide.addText(card2Text, {
    x: 3.72,
    y: cardY + 0.46,
    w: cardW - 0.26,
    h: cardH - 0.55,
    valign: "top",
    margin: 0
  });

  // Card 3: Novelty & Differentiation
  addNeoCard(slide, pptx, {
    x: 6.63,
    y: cardY,
    w: cardW,
    h: cardH,
    fill: TOKENS.CARD_WHITE,
    shadowColor: TOKENS.ELECTRIC_CYAN,
    headerFill: TOKENS.ELECTRIC_CYAN,
    headerText: "NOVELTY & DIFFERENTIATION",
    headerTextColor: TOKENS.CARBON_BLACK
  });

  const card3Text = isReferenceDeck
    ? [
        { text: "Standard / Textbook Implementation:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "Microcontroller timer ISR polls external ADC; watchdog timeout triggers a global chip reset, wiping all internal state registers.\n\n", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } },

        { text: "Proposed Novel Architecture:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "Dual-rail hardware comparator tied to triple-voted shadow register bank. Recovery happens at gate-level in 3 cycles without processor reset.\n\n", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } },

        { text: "Quantified Competitive Edge:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "Reduces recovery downtime from 420ms to 60ns (7,000x faster) and cuts restart energy by 88% compared to industry standard modules.", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } }
      ]
    : [
        { text: "Standard / Textbook Implementation:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "[How is this problem typically addressed today, and why is that standard method slow, power-hungry, or fragile?]\n\n", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } },

        { text: "Proposed Novel Architecture:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "[What is your unique hardware, algorithmic, or architectural twist? (e.g. asynchronous voting, predictive pipelining, systolic arrays)]\n\n", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } },

        { text: "Quantified Competitive Edge:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "[Contrast your build against the baseline: e.g. 5x higher throughput, 40% lower gate count, or zero dropped packets under stress.]", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } }
      ];

  slide.addText(card3Text, {
    x: 6.76,
    y: cardY + 0.46,
    w: cardW - 0.26,
    h: cardH - 0.55,
    valign: "top",
    margin: 0
  });
}

/**
 * SLIDE 03: PROPOSED ARCHITECTURE & HOW IT WORKS (CANVAS_CREAM)
 */
function buildSlide03(pptx, isReferenceDeck) {
  const slide = pptx.addSlide();
  addSlideChrome(slide, pptx, {
    slideNum: 3,
    eyebrow: "SYSTEM OVERVIEW",
    title: "Proposed Architecture & Signal/Data Flow",
    isDark: false,
    isReferenceDeck
  });

  const cardY = 1.22;
  const cardH = 3.80;

  // Left Card: System Block Diagram
  const leftW = 5.65;
  addNeoCard(slide, pptx, {
    x: 0.55,
    y: cardY,
    w: leftW,
    h: cardH,
    fill: TOKENS.CARD_WHITE,
    shadowColor: TOKENS.ELECTRIC_CYAN,
    headerFill: TOKENS.ELECTRIC_CYAN,
    headerText: "SYSTEM BLOCK DIAGRAM (EDIT BOXES OR PASTE SCHEMATIC)",
    headerTextColor: TOKENS.CARBON_BLACK
  });

  slide.addText("4-stage pipeline shown below. Edit labels/signals, or replace these boxes with your architectural schematic.", {
    x: 0.70,
    y: cardY + 0.42,
    w: leftW - 0.30,
    h: 0.22,
    fontFace: TOKENS.FONT_MONO,
    fontSize: 7.5,
    color: TOKENS.MUTED_GRAY
  });

  // 4 Connected Vector Boxes inside Left Card
  // Box 01: Input / Sensing
  const b1X = 0.75, b1Y = 1.95, bW = 2.25, bH = 1.15;
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: b1X,
    y: b1Y,
    w: bW,
    h: bH,
    fill: { color: TOKENS.CARD_GRAY },
    line: { color: TOKENS.CARBON_BLACK, width: 1.5 }
  });

  slide.addText(
    isReferenceDeck
      ? [
          { text: "01. DUAL ANALOG SENSING\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
          { text: "• High-speed Diff Comparator\n• SPI Receiver (2 MSPS)\n• Glitch Filter Window", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8 } }
        ]
      : [
          { text: "01. INPUT / INTERFACE\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
          { text: "[e.g. Sensor Input / ADC]\n[Protocol: SPI / I2C / AXI]\n[Signal Conditioning]", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8 } }
        ],
    { x: b1X + 0.08, y: b1Y + 0.08, w: bW - 0.16, h: bH - 0.16, valign: "top", margin: 0 }
  );

  // Arrow 1 -> 2
  slide.addShape(pptx.shapes.RIGHT_ARROW, {
    x: 3.08,
    y: 2.45,
    w: 0.35,
    h: 0.16,
    fill: { color: TOKENS.CARBON_BLACK }
  });

  // Box 02: Core Processing / Voter
  const b2X = 3.50, b2Y = 1.95, b2W = 2.45;
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: b2X,
    y: b2Y,
    w: b2W,
    h: bH,
    fill: { color: TOKENS.CARD_GRAY },
    line: { color: TOKENS.CARBON_BLACK, width: 1.5 }
  });

  slide.addText(
    isReferenceDeck
      ? [
          { text: "02. MAJORITY VOTER & AUDIT\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
          { text: "• TMR Logic Decision Engine\n• Parity / Hamming Checker\n• Fast SEC-DED Validator", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8 } }
        ]
      : [
          { text: "02. CORE LOGIC / PIPELINE\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
          { text: "[e.g. Processing Engine / ALU]\n[Decision Logic / Filter]\n[Clock Domain: 50-100MHz]", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8 } }
        ],
    { x: b2X + 0.08, y: b2Y + 0.08, w: b2W - 0.16, h: bH - 0.16, valign: "top", margin: 0 }
  );

  // Arrow 2 -> 4 (Down)
  slide.addShape(pptx.shapes.DOWN_ARROW, {
    x: 4.65,
    y: 3.16,
    w: 0.16,
    h: 0.28,
    fill: { color: TOKENS.CARBON_BLACK }
  });

  // Box 03: Shadow / State Control
  const b3X = 0.75, b3Y = 3.52;
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: b3X,
    y: b3Y,
    w: bW,
    h: bH,
    fill: { color: TOKENS.CARD_GRAY },
    line: { color: TOKENS.CARBON_BLACK, width: 1.5 }
  });

  slide.addText(
    isReferenceDeck
      ? [
          { text: "03. SHADOW REGISTER BANK\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
          { text: "• Golden State Snapshot Latch\n• Autonomous Gate Reload\n• Brownout Holding Voltage", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8 } }
        ]
      : [
          { text: "03. CONTROL / SHADOW UNIT\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
          { text: "[e.g. State Machine / FSM]\n[Shadow Register / Recovery]\n[Clock Gating & Power Mgmt]", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8 } }
        ],
    { x: b3X + 0.08, y: b3Y + 0.08, w: bW - 0.16, h: bH - 0.16, valign: "top", margin: 0 }
  );

  // Arrow 3 -> 4
  slide.addShape(pptx.shapes.RIGHT_ARROW, {
    x: 3.08,
    y: 4.02,
    w: 0.35,
    h: 0.16,
    fill: { color: TOKENS.CARBON_BLACK }
  });

  // Box 04: Output / Telemetry / Bus
  const b4X = 3.50, b4Y = 3.52, b4W = 2.45;
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: b4X,
    y: b4Y,
    w: b4W,
    h: bH,
    fill: { color: TOKENS.CARD_GRAY },
    line: { color: TOKENS.CARBON_BLACK, width: 1.5 }
  });

  slide.addText(
    isReferenceDeck
      ? [
          { text: "04. BUS OUTPUT & TELEMETRY\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
          { text: "• AXI4-Lite Diagnostic Map\n• Non-Blocking SPI TX Out\n• Clean Fault Flag Vector", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8 } }
        ]
      : [
          { text: "04. OUTPUT / TELEMETRY\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
          { text: "[e.g. AXI4 / SPI Output Bus]\n[Actuator Drive / Status Reg]\n[Real-time Telemetry Flags]", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8 } }
        ],
    { x: b4X + 0.08, y: b4Y + 0.08, w: b4W - 0.16, h: bH - 0.16, valign: "top", margin: 0 }
  );

  slide.addText("* Diagram hint: Select and edit text in each box directly, or paste your schematic over this area.", {
    x: 0.70,
    y: 4.75,
    w: leftW - 0.30,
    h: 0.20,
    fontFace: TOKENS.FONT_MONO,
    fontSize: 7,
    color: TOKENS.MUTED_GRAY,
    italic: true
  });

  // Right Card: Step-by-Step Workflow
  const rightW = 3.03;
  addNeoCard(slide, pptx, {
    x: 6.42,
    y: cardY,
    w: rightW,
    h: cardH,
    fill: TOKENS.CARD_WHITE,
    shadowColor: TOKENS.SOLAR_YELLOW,
    headerFill: TOKENS.SOLAR_YELLOW,
    headerText: "STEP-BY-STEP WORKFLOW",
    headerTextColor: TOKENS.CARBON_BLACK
  });

  const rightCardText = isReferenceDeck
    ? [
        { text: "Step 01: Dual Sensing & Windowing\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "Telemetry is sampled at 2MSPS over differential pins; continuous comparator window rejects high-frequency EMI spikes under 15ns.\n\n", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } },

        { text: "Step 02: Majority Voting & State Audit\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "Every clock cycle, register parity is checked against shadow latches. Any bit-flip triggers instant SEC-DED gate-level correction.\n\n", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } },

        { text: "Step 03: Telemetry Stream & Clean Handover\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "Verified data frames are pushed to SPI TX FIFO; status registers update AXI4-Lite diagnostics without interrupting bus operations.", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } }
      ]
    : [
        { text: "Step 01: Input Acquisition & Sampling\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "[Describe your input sampling frequency, interface protocol (SPI/I2C/UART/AXI), and signal conditioning methodology.]\n\n", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } },

        { text: "Step 02: Core Transformation / Evaluation\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "[Explain how raw data is filtered, computed, or verified by your internal architecture in real time.]\n\n", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } },

        { text: "Step 03: Actuation, Output & Status Report\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "[Describe final output generation, bus transactions, error status flags, and telemetry reporting to host systems.]", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } }
      ];

  slide.addText(rightCardText, {
    x: 6.55,
    y: cardY + 0.46,
    w: rightW - 0.26,
    h: cardH - 0.55,
    valign: "top",
    margin: 0
  });
}

/**
 * SLIDE 04: TOOLS, STACK & METHODOLOGY (CANVAS_CREAM)
 */
function buildSlide04(pptx, isReferenceDeck) {
  const slide = pptx.addSlide();
  addSlideChrome(slide, pptx, {
    slideNum: 4,
    eyebrow: "ENGINEERING STACK",
    title: "Tools, Technologies & Implementation Methodology",
    isDark: false,
    isReferenceDeck
  });

  const bentoW = 4.32;
  const bentoH = 1.82;
  const col1X = 0.55;
  const col2X = 5.13;
  const row1Y = 1.22;
  const row2Y = 3.20;

  // Card 1: Software / EDA / Simulation Tools
  addNeoCard(slide, pptx, {
    x: col1X,
    y: row1Y,
    w: bentoW,
    h: bentoH,
    fill: TOKENS.CARD_WHITE,
    shadowColor: TOKENS.ELECTRIC_CYAN,
    headerFill: TOKENS.ELECTRIC_CYAN,
    headerText: "SOFTWARE / EDA / SIMULATION TOOLS",
    headerTextColor: TOKENS.CARBON_BLACK
  });

  const card1Text = isReferenceDeck
    ? [
        { text: "• EDA & Synthesis: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "AMD Vivado ML Enterprise 2024.1 + Yosys open synthesis suite\n", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } },
        { text: "• Simulation: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "Verilator (C++ testbench co-sim) + GTKWave waveform visualization\n", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } },
        { text: "• Linting & Timing: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "Verible SystemVerilog linter + OpenSTA static timing analysis", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } }
      ]
    : [
        { text: "• EDA Suite / Compilers: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "[e.g. AMD Vivado, Cadence Genus/Innovus, Quartus Prime, GCC/LLVM]\n", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } },
        { text: "• Simulation Tools: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "[e.g. ModelSim, Verilator, Icarus Verilog, GTKWave, MATLAB/Simulink]\n", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } },
        { text: "• Static Analysis & Synthesis: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "[e.g. Synopsys Design Compiler, Yosys, OpenROAD, PyTorch/TensorRT]", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } }
      ];

  slide.addText(card1Text, {
    x: col1X + 0.12,
    y: row1Y + 0.44,
    w: bentoW - 0.24,
    h: bentoH - 0.50,
    valign: "top",
    margin: 0
  });

  // Card 2: Hardware / Components / Dataset
  addNeoCard(slide, pptx, {
    x: col2X,
    y: row1Y,
    w: bentoW,
    h: bentoH,
    fill: TOKENS.CARD_WHITE,
    shadowColor: TOKENS.SOLAR_YELLOW,
    headerFill: TOKENS.SOLAR_YELLOW,
    headerText: "HARDWARE / TARGET BOARDS / DATASET",
    headerTextColor: TOKENS.CARBON_BLACK
  });

  const card2Text = isReferenceDeck
    ? [
        { text: "• Target Silicon Board: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "Digilent Basys 3 FPGA (Xilinx Artix-7 XC7A35T-1CPG236C)\n", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } },
        { text: "• Sensors & Peripherals: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "ADXL345 SPI Accelerometer, INA219 current sensor, Saleae Logic 8 probe\n", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } },
        { text: "• Stimulus Data: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "Recorded 10kHz EMI fault profiles injected via secondary Arduino MCU", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } }
      ]
    : [
        { text: "• Target Board / Silicon: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "[e.g. Xilinx Artix-7, STM32F4, Raspberry Pi RP2040, SkyWater 130nm]\n", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } },
        { text: "• Sensors & Peripherals: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "[e.g. SPI Flash, IMU 6-DOF, PMIC, Logic Analyzer, Oscilloscope probes]\n", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } },
        { text: "• Datasets / Stimulus: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "[e.g. Synthetic test vectors, open datasets, recorded telemetry, CSV logs]", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } }
      ];

  slide.addText(card2Text, {
    x: col2X + 0.12,
    y: row1Y + 0.44,
    w: bentoW - 0.24,
    h: bentoH - 0.50,
    valign: "top",
    margin: 0
  });

  // Card 3: Core Algorithms & Protocols
  addNeoCard(slide, pptx, {
    x: col1X,
    y: row2Y,
    w: bentoW,
    h: bentoH,
    fill: TOKENS.CARD_WHITE,
    shadowColor: TOKENS.NEON_LIME,
    headerFill: TOKENS.NEON_LIME,
    headerText: "CORE ALGORITHMS & PROTOCOLS",
    headerTextColor: TOKENS.CARBON_BLACK
  });

  const card3Text = isReferenceDeck
    ? [
        { text: "• FSM Architecture: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "4-state glitch-tolerant Gray-coded Moore machine (IDLE, SENSE, AUDIT, RECOVER)\n", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } },
        { text: "• Bus Protocols: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "AXI4-Lite memory-mapped control registers + SPI Mode 0 (10 MHz)\n", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } },
        { text: "• Error Correction: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "Hamming SEC-DED (Single Error Correct, Double Error Detect) on register bank", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } }
      ]
    : [
        { text: "• FSM / Control Architecture: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "[e.g. Mealy/Moore FSM with One-Hot or Gray encoding, state freeze logic]\n", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } },
        { text: "• Bus / Interface Protocols: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "[e.g. AXI4-Stream, APB, SPI Mode 0, UART, I2C Fast-Mode Plus, CAN-FD]\n", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } },
        { text: "• Key Algorithmic Models: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "[e.g. CRC-16-CCITT, Fixed-Point PID, Quantized TinyML INT8 model]", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } }
      ];

  slide.addText(card3Text, {
    x: col1X + 0.12,
    y: row2Y + 0.44,
    w: bentoW - 0.24,
    h: bentoH - 0.50,
    valign: "top",
    margin: 0
  });

  // Card 4: Testing & Validation Strategy
  addNeoCard(slide, pptx, {
    x: col2X,
    y: row2Y,
    w: bentoW,
    h: bentoH,
    fill: TOKENS.CARD_WHITE,
    shadowColor: TOKENS.HOT_PINK,
    headerFill: TOKENS.HOT_PINK,
    headerText: "TESTING & VALIDATION STRATEGY",
    headerTextColor: TOKENS.CARD_WHITE
  });

  const card4Text = isReferenceDeck
    ? [
        { text: "• Corner-Case Validation: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "Stress tested under simulated 20% clock jitter and supply droop down to 0.85V\n", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } },
        { text: "• Testbench Coverage: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "100% state-transition coverage & 98.4% branch coverage verified in Verilator\n", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } },
        { text: "• Hardware Bring-Up Plan: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "Oscilloscope validation of setup/hold timings (>= 12ns slack confirmed)", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } }
      ]
    : [
        { text: "• Corner-Case Scenarios: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "[How will you verify behavior under extreme stress, noise, brownout, or overflow?]\n", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } },
        { text: "• Testbench Coverage Goals: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "[Target metrics: e.g. 100% state coverage, 95% branch coverage, zero assertions failed]\n", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } },
        { text: "• Live Bring-Up Verification: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "[Describe probe points, logic analyzer traces, or LED indicators for 24H demo]", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } }
      ];

  slide.addText(card4Text, {
    x: col2X + 0.12,
    y: row2Y + 0.44,
    w: bentoW - 0.24,
    h: bentoH - 0.50,
    valign: "top",
    margin: 0
  });
}

/**
 * SLIDE 05: TECHNICAL PROOF OF COMPETENCE (OBSIDIAN_DARK)
 */
function buildSlide05(pptx, isReferenceDeck) {
  const slide = pptx.addSlide();
  addSlideChrome(slide, pptx, {
    slideNum: 5,
    eyebrow: "PROOF OF COMPETENCE",
    title: "Preliminary Engineering Artifact & Feasibility",
    isDark: true,
    isReferenceDeck
  });

  const cardY = 1.22;
  const cardH = 3.80;

  // Left Card: Concrete Technical Artifact
  const leftW = 5.35;
  addNeoCard(slide, pptx, {
    x: 0.55,
    y: cardY,
    w: leftW,
    h: cardH,
    fill: TOKENS.CARD_WHITE,
    shadowColor: TOKENS.HOT_PINK,
    headerFill: TOKENS.HOT_PINK,
    headerText: "CONCRETE TECHNICAL ARTIFACT",
    headerTextColor: TOKENS.CARD_WHITE
  });

  slide.addText("Must prove technical readiness: truth table, state transition table, register map, or waveform.", {
    x: 0.70,
    y: cardY + 0.42,
    w: leftW - 0.30,
    h: 0.22,
    fontFace: TOKENS.FONT_MONO,
    fontSize: 7.5,
    color: TOKENS.MUTED_GRAY
  });

  if (isReferenceDeck) {
    // Reference Deck shows an actual, clean State Transition & Fault-Recovery Table
    const tableRows = [
      [
        { text: "CURRENT STATE", options: { bold: true, fill: { color: TOKENS.CARBON_BLACK }, color: TOKENS.SOLAR_YELLOW, fontFace: TOKENS.FONT_MONO, fontSize: 7.5 } },
        { text: "FAULT TRIGGER", options: { bold: true, fill: { color: TOKENS.CARBON_BLACK }, color: TOKENS.CARD_WHITE, fontFace: TOKENS.FONT_MONO, fontSize: 7.5 } },
        { text: "NEXT STATE", options: { bold: true, fill: { color: TOKENS.CARBON_BLACK }, color: TOKENS.ELECTRIC_CYAN, fontFace: TOKENS.FONT_MONO, fontSize: 7.5 } },
        { text: "RECOVERY ACTION", options: { bold: true, fill: { color: TOKENS.CARBON_BLACK }, color: TOKENS.CARD_WHITE, fontFace: TOKENS.FONT_MONO, fontSize: 7.5 } },
        { text: "LATENCY", options: { bold: true, fill: { color: TOKENS.CARBON_BLACK }, color: TOKENS.NEON_LIME, fontFace: TOKENS.FONT_MONO, fontSize: 7.5 } }
      ],
      [
        { text: "STATE_IDLE", options: { bold: true, fontFace: TOKENS.FONT_MONO, fontSize: 7.5 } },
        { text: "No Glitch (V_ref OK)", options: { fontFace: TOKENS.FONT_BODY, fontSize: 7.5 } },
        { text: "STATE_SENSE", options: { fontFace: TOKENS.FONT_MONO, fontSize: 7.5 } },
        { text: "Stream raw telemetry pass", options: { fontFace: TOKENS.FONT_BODY, fontSize: 7.5 } },
        { text: "1 Cycle (20ns)", options: { bold: true, fontFace: TOKENS.FONT_MONO, fontSize: 7.5 } }
      ],
      [
        { text: "STATE_SENSE", options: { bold: true, fontFace: TOKENS.FONT_MONO, fontSize: 7.5 } },
        { text: "dV/dt Spike (>15ns)", options: { fontFace: TOKENS.FONT_BODY, fontSize: 7.5 } },
        { text: "STATE_AUDIT", options: { fontFace: TOKENS.FONT_MONO, fontSize: 7.5 } },
        { text: "Freeze regs + sample shadow latch", options: { fontFace: TOKENS.FONT_BODY, fontSize: 7.5 } },
        { text: "2 Cycles (40ns)", options: { bold: true, fontFace: TOKENS.FONT_MONO, fontSize: 7.5 } }
      ],
      [
        { text: "STATE_AUDIT", options: { bold: true, fontFace: TOKENS.FONT_MONO, fontSize: 7.5 } },
        { text: "Transient Cleared", options: { fontFace: TOKENS.FONT_BODY, fontSize: 7.5 } },
        { text: "STATE_RESTORE", options: { fontFace: TOKENS.FONT_MONO, fontSize: 7.5 } },
        { text: "SEC-DED single bit correction", options: { fontFace: TOKENS.FONT_BODY, fontSize: 7.5 } },
        { text: "1 Cycle (20ns)", options: { bold: true, fontFace: TOKENS.FONT_MONO, fontSize: 7.5 } }
      ],
      [
        { text: "STATE_AUDIT", options: { bold: true, fontFace: TOKENS.FONT_MONO, fontSize: 7.5 } },
        { text: "Persistent Sag (>5us)", options: { fontFace: TOKENS.FONT_BODY, fontSize: 7.5 } },
        { text: "STATE_SAFE_HALT", options: { fontFace: TOKENS.FONT_MONO, fontSize: 7.5 } },
        { text: "Assert IRQ + lock SPI bus low", options: { fontFace: TOKENS.FONT_BODY, fontSize: 7.5 } },
        { text: "3 Cycles (60ns)", options: { bold: true, fontFace: TOKENS.FONT_MONO, fontSize: 7.5 } }
      ]
    ];

    slide.addTable(tableRows, {
      x: 0.68,
      y: cardY + 0.68,
      w: leftW - 0.26,
      colW: [0.95, 1.15, 0.95, 1.30, 0.74],
      border: { pt: 1, color: TOKENS.CARBON_BLACK },
      align: "left",
      valign: "middle",
      margin: [2, 3, 2, 3]
    });

    // Latency Budget Callout Box
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 0.68,
      y: 4.10,
      w: leftW - 0.26,
      h: 0.78,
      fill: { color: TOKENS.CARD_GRAY },
      line: { color: TOKENS.CARBON_BLACK, width: 1.5 }
    });

    slide.addText([
      { text: "LATENCY & TIMING BUDGET ANALYSIS:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8 } },
      { text: "Total worst-case recovery latency: 3 clock cycles @ 50MHz = ", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8 } },
      { text: "60.0ns (Target: < 100ns)\n", options: { bold: true, color: TOKENS.COBALT_BLUE, fontFace: TOKENS.FONT_MONO, fontSize: 8 } },
      { text: "Static timing analysis slack: +11.6ns setup / +4.2ns hold confirmed in Vivado report.", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 7.5 } }
    ], {
      x: 0.76,
      y: 4.14,
      w: leftW - 0.42,
      h: 0.70,
      valign: "middle",
      margin: 0
    });

  } else {
    // Template Deck shows a clear bracketed placeholder guide box
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 0.68,
      y: cardY + 0.68,
      w: leftW - 0.26,
      h: 3.00,
      fill: { color: TOKENS.CARD_GRAY },
      line: { color: TOKENS.CARBON_BLACK, width: 2, dashType: "dash" }
    });

    slide.addText([
      { text: "[INSERT YOUR CONCRETE TECHNICAL ARTIFACT HERE]\n\n", options: { bold: true, color: TOKENS.HOT_PINK, fontFace: TOKENS.FONT_MONO, fontSize: 10 } },
      { text: "Replace this container with at least ONE tangible artifact proving feasibility:\n\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 9 } },
      { text: "• State Transition Table or FSM Diagram (with state encoding)\n", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } },
      { text: "• Hardware Truth Table / Logic Equations (inputs vs outputs)\n", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } },
      { text: "• Memory Map / Register Address Table (with bitfields & offsets)\n", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } },
      { text: "• Schematic / Pinout Wiring Diagram / Microarchitecture Block\n", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } },
      { text: "• Timing Diagram / Latency Budget Table / Critical Path Breakdown\n", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } },
      { text: "• Preliminary Simulation Waveform screenshot (GTKWave / ModelSim)\n\n", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8.5 } },
      { text: "(Jury Tip: Submissions with concrete tables or waveforms score significantly higher than generic paragraphs.)", options: { italic: true, color: TOKENS.COBALT_BLUE, fontFace: TOKENS.FONT_BODY, fontSize: 8 } }
    ], {
      x: 0.85,
      y: cardY + 0.80,
      w: leftW - 0.60,
      h: 2.76,
      valign: "top",
      margin: 0
    });
  }

  // Right Card: Target Specifications & Constraints
  const rightW = 3.35;
  addNeoCard(slide, pptx, {
    x: 6.10,
    y: cardY,
    w: rightW,
    h: cardH,
    fill: TOKENS.CARD_WHITE,
    shadowColor: TOKENS.NEON_LIME,
    headerFill: TOKENS.NEON_LIME,
    headerText: "TARGET SPECS & CONSTRAINTS",
    headerTextColor: TOKENS.CARBON_BLACK
  });

  const rightCardText = isReferenceDeck
    ? [
        { text: "Speed / Latency Target:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "• Operating Frequency: 50.0 MHz (20.0ns cycle)\n• Critical path latency: 8.4ns (slack: +11.6ns)\n• Throughput: 16 Mbps continuous stream\n\n", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8 } },

        { text: "Power & Resource Target:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "• Dynamic Power: 14.8mW on Artix-7 XC7A35T\n• Resource Footprint: 312 LUTs (1.5%), 184 FFs\n• Dedicated Memory: 0 BRAM (100% slice registers)\n\n", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8 } },

        { text: "Corner-Case & Safety Rules:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "• Immunity up to 45ns single-event transients\n• Brownout fallback maintains golden register state\n• Zero bus lockup under unacknowledged writes", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8 } }
      ]
    : [
        { text: "Speed / Latency Target:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "[Specify target clock frequency, propagation delay, or pipeline throughput: e.g. 100MHz clock, 8.2ns critical path, 400 Mbps throughput]\n\n", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8 } },

        { text: "Power & Resource Budget:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "[Define resource boundaries: e.g. Max dynamic power < 120mW, LUT budget < 1,200, Flip-flops < 800, RAM blocks < 4]\n\n", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8 } },

        { text: "Corner-Case & Fault Rules:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "[Define handling for brownouts, voltage dips, clock jitter, or bus contention: e.g. Fail-safe state machine return, watchdog interrupt assertion]", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8 } }
      ];

  slide.addText(rightCardText, {
    x: 6.25,
    y: cardY + 0.46,
    w: rightW - 0.30,
    h: cardH - 0.55,
    valign: "top",
    margin: 0
  });
}

/**
 * SLIDE 06: 24-HOUR BUILD PLAN, IMPACT & REFERENCES (CANVAS_CREAM)
 */
function buildSlide06(pptx, isReferenceDeck) {
  const slide = pptx.addSlide();
  addSlideChrome(slide, pptx, {
    slideNum: 6,
    eyebrow: "FEASIBILITY & IMPACT",
    title: "24-Hour Arena Build Plan & Expected Impact",
    isDark: false,
    isReferenceDeck
  });

  const row1Y = 1.22;
  const row1H = 1.82;
  const colW = 2.82;

  // Timeline Card 1: Hours 00 - 08
  addNeoCard(slide, pptx, {
    x: 0.55,
    y: row1Y,
    w: colW,
    h: row1H,
    fill: TOKENS.CARD_WHITE,
    shadowColor: TOKENS.SOLAR_YELLOW,
    headerFill: TOKENS.SOLAR_YELLOW,
    headerText: "HOURS 00 - 08: FOUNDATION",
    headerTextColor: TOKENS.CARBON_BLACK
  });

  const t1Text = isReferenceDeck
    ? [
        { text: "• H00 - H02: Setup & Environment\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8 } },
        { text: "Clone Git worktree, verify Vivado constraints file (.xdc), test board loopback.\n", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8 } },
        { text: "• H02 - H05: RTL Core Implementation\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8 } },
        { text: "Code comparator RTL, shadow register bank, and Verilator testbench.\n", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8 } },
        { text: "• H05 - H08: Live Twist Ingestion\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8 } },
        { text: "Ingest Round 2 Surprise Constraint injected by jury and adapt FSM.", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8 } }
      ]
    : [
        { text: "• Hours 00 - 02: Setup & Baseline Freeze\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8 } },
        { text: "[Repo setup, EDA tool license check, pinout constraints & baseline architecture freeze]\n", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8 } },
        { text: "• Hours 02 - 05: Core Logic Coding\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8 } },
        { text: "[Implement primary RTL / firmware modules & run initial simulation testbench]\n", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8 } },
        { text: "• Hours 05 - 08: Live Twist Integration\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8 } },
        { text: "[Ingest Round 2 surprise constraint announced by jury and adjust modules]", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8 } }
      ];

  slide.addText(t1Text, {
    x: 0.68,
    y: row1Y + 0.44,
    w: colW - 0.26,
    h: row1H - 0.50,
    valign: "top",
    margin: 0
  });

  // Timeline Card 2: Hours 08 - 16
  addNeoCard(slide, pptx, {
    x: 3.59,
    y: row1Y,
    w: colW,
    h: row1H,
    fill: TOKENS.CARD_WHITE,
    shadowColor: TOKENS.ELECTRIC_CYAN,
    headerFill: TOKENS.ELECTRIC_CYAN,
    headerText: "HOURS 08 - 16: INTEGRATION",
    headerTextColor: TOKENS.CARBON_BLACK
  });

  const t2Text = isReferenceDeck
    ? [
        { text: "• H08 - H11: Peripheral Integration\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8 } },
        { text: "Connect SPI receiver and AXI4-Lite diagnostic registers; synthesize bitstream.\n", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8 } },
        { text: "• H11 - H14: Hardware Bring-Up\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8 } },
        { text: "Flash Basys 3 board; probe SPI clock and latch lines using Saleae Logic.\n", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8 } },
        { text: "• H14 - H16: Midnight Jury Audit\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8 } },
        { text: "Demonstrate 50% working milestone to faculty & industry review panel.", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8 } }
      ]
    : [
        { text: "• Hours 08 - 11: Subsystem Interfacing\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8 } },
        { text: "[Connect communication buses, memory controllers, and sensor interfaces]\n", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8 } },
        { text: "• Hours 11 - 14: Hardware / Testbed Bring-Up\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8 } },
        { text: "[Download bitstream / firmware to physical target; probe test points]\n", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8 } },
        { text: "• Hours 14 - 16: Midnight Milestone Audit\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8 } },
        { text: "[Verify 50% milestone functionality before jury checkpoint]", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8 } }
      ];

  slide.addText(t2Text, {
    x: 3.72,
    y: row1Y + 0.44,
    w: colW - 0.26,
    h: row1H - 0.50,
    valign: "top",
    margin: 0
  });

  // Timeline Card 3: Hours 16 - 24
  addNeoCard(slide, pptx, {
    x: 6.63,
    y: row1Y,
    w: colW,
    h: row1H,
    fill: TOKENS.CARD_WHITE,
    shadowColor: TOKENS.NEON_LIME,
    headerFill: TOKENS.NEON_LIME,
    headerText: "HOURS 16 - 24: DEMO POLISH",
    headerTextColor: TOKENS.CARBON_BLACK
  });

  const t3Text = isReferenceDeck
    ? [
        { text: "• H16 - H19: Automated Stress Suite\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8 } },
        { text: "Execute 100,000-cycle glitch test suite; record recovery metrics and timing slack.\n", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8 } },
        { text: "• H19 - H22: Demo Instrumentation\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8 } },
        { text: "Wire live LED indicators and serial telemetry GUI for visual pitch defense.\n", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8 } },
        { text: "• H22 - H24: Code Freeze & Defense\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8 } },
        { text: "Final bitstream freeze at 10:30 AM; deliver live 3-minute jury presentation.", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8 } }
      ]
    : [
        { text: "• Hours 16 - 19: Stress & Performance Testing\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8 } },
        { text: "[Subject build to stress, measure latency/power benchmarks, log results]\n", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8 } },
        { text: "• Hours 19 - 22: Demo Polish & Visuals\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8 } },
        { text: "[Package interactive visual demo, terminal output, or LED indicators for jury]\n", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8 } },
        { text: "• Hours 22 - 24: Hardware Freeze & Pitch\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8 } },
        { text: "[Freeze all code at 10:30 AM; deliver live 3-minute stage presentation]", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8 } }
      ];

  slide.addText(t3Text, {
    x: 6.76,
    y: row1Y + 0.44,
    w: colW - 0.26,
    h: row1H - 0.50,
    valign: "top",
    margin: 0
  });

  // Bottom Row: 2 Split Cards
  const row2Y = 3.20;
  const row2H = 1.82;

  // Left Card: Real-World Impact & Beneficiaries
  const bLeftW = 4.80;
  addNeoCard(slide, pptx, {
    x: 0.55,
    y: row2Y,
    w: bLeftW,
    h: row2H,
    fill: TOKENS.CARD_WHITE,
    shadowColor: TOKENS.NEON_LIME,
    headerFill: TOKENS.NEON_LIME,
    headerText: "REAL-WORLD IMPACT & BENEFICIARIES",
    headerTextColor: TOKENS.CARBON_BLACK
  });

  const bLeftText = isReferenceDeck
    ? [
        { text: "Primary Beneficiaries:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "Industrial automation controllers, mission-critical robotic edge sensors, and automotive sub-ECUs operating in noisy electrical environments.\n\n", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8 } },
        { text: "Quantified Real-World Value:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "Prevents line stoppages from spurious EMI transients, reducing factory downtime by up to 85% with zero added bill-of-materials cost.", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 8 } }
      ]
    : [
        { text: "Target Beneficiaries & Industry:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "[Who directly adopts or benefits from this solution? (e.g. EV battery management, satellite telemetry, edge AI sensors, smart grid)]\n\n", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8 } },
        { text: "Quantified Value Proposition:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8.5 } },
        { text: "[What is the measurable impact when your build succeeds? (e.g. 40% cost reduction, 10x uptime, 3.5x lower power, zero lost frames)]", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 8 } }
      ];

  slide.addText(bLeftText, {
    x: 0.68,
    y: row2Y + 0.44,
    w: bLeftW - 0.26,
    h: row2H - 0.50,
    valign: "top",
    margin: 0
  });

  // Right Card: Key References & Submission Checklist
  const bRightW = 3.90;
  addNeoCard(slide, pptx, {
    x: 5.55,
    y: row2Y,
    w: bRightW,
    h: row2H,
    fill: TOKENS.CARD_WHITE,
    shadowColor: TOKENS.SOLAR_YELLOW,
    headerFill: TOKENS.SOLAR_YELLOW,
    headerText: "KEY REFERENCES & SUBMISSION NOTE",
    headerTextColor: TOKENS.CARBON_BLACK
  });

  const bRightText = isReferenceDeck
    ? [
        { text: "Key Technical References:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8 } },
        { text: "1. IEEE Trans. Reliability, Vol 71: 'Single-Event Transient Recovery in Nanoscale CMOS'\n", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 7.5 } },
        { text: "2. AMD Xilinx WP487: 'Designing for Fault-Tolerant Systems in Artix-7 Architectures'\n\n", options: { color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_BODY, fontSize: 7.5 } },
        { text: "Submission Checklist: ", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8 } },
        { text: "6 slides strictly followed · Exported as PDF (1.8MB) · Ready for Dec 02-03 portal upload.", options: { color: TOKENS.COBALT_BLUE, bold: true, fontFace: TOKENS.FONT_BODY, fontSize: 7.5 } }
      ]
    : [
        { text: "Key Technical References:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8 } },
        { text: "[Cite 1-2 standard technical papers, IEEE references, chip datasheets, or textbook algorithms]\n\n", options: { color: TOKENS.MUTED_GRAY, fontFace: TOKENS.FONT_BODY, fontSize: 7.5 } },
        { text: "Mandatory Submission Checklist:\n", options: { bold: true, color: TOKENS.CARBON_BLACK, fontFace: TOKENS.FONT_MONO, fontSize: 8 } },
        { text: "[ ] Maximum 6 slides strictly followed (no extra slides)\n[ ] Exported as PDF under 3MB\n[ ] Submitted via portal (https://veltraxx.com/submit-ppt) on Dec 02-03", options: { color: TOKENS.HOT_PINK, bold: true, fontFace: TOKENS.FONT_BODY, fontSize: 7.5 } }
      ];

  slide.addText(bRightText, {
    x: 5.68,
    y: row2Y + 0.44,
    w: bRightW - 0.26,
    h: row2H - 0.50,
    valign: "top",
    margin: 0
  });
}

// ==============================================================================
// 4. MAIN DECK BUILDER & COMPILER
// ==============================================================================
async function generateDeck(isReferenceDeck, outputFilename) {
  const pptx = new pptxgen();

  // Configure standard 16:9 widescreen layout
  pptx.layout = "LAYOUT_16x9";
  pptx.author = "VELTRAXX 2.0 Technical Directorate";
  pptx.company = "Sri Shakthi Institute of Engineering and Technology (SIET EE/VLSI)";
  pptx.title = isReferenceDeck
    ? "VELTRAXX 2.0 - Round 1 Pitch Reference Example Deck"
    : "VELTRAXX 2.0 - Official Round 1 Submission Template";

  // Build all 6 slides sequentially
  buildSlide01(pptx, isReferenceDeck);
  buildSlide02(pptx, isReferenceDeck);
  buildSlide03(pptx, isReferenceDeck);
  buildSlide04(pptx, isReferenceDeck);
  buildSlide05(pptx, isReferenceDeck);
  buildSlide06(pptx, isReferenceDeck);

  // Ensure output directory exists
  const outputDir = path.join(__dirname, "..", "public", "downloads");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, outputFilename);
  await pptx.writeFile({ fileName: outputPath });

  const stats = fs.statSync(outputPath);
  console.log(`[OK] Generated: ${outputPath} (${(stats.size / 1024).toFixed(1)} KB)`);
  return outputPath;
}

// ==============================================================================
// 5. EXECUTION ENTRYPOINT
// ==============================================================================
async function main() {
  console.log("==================================================================");
  console.log("VELTRAXX 2.0: GENERATING AUTOMATED DUAL-DECK PPTX ASSETS");
  console.log("==================================================================");

  try {
    // 1. Generate Blank Submission Template
    await generateDeck(false, "VELTRAXX_2.0_Round1_Template.pptx");

    // 2. Generate Filled Reference Example Deck
    await generateDeck(true, "VELTRAXX_2.0_Round1_Reference_Example.pptx");

    console.log("==================================================================");
    console.log("[SUCCESS] Both PowerPoint decks generated successfully!");
    console.log("==================================================================");
  } catch (err) {
    console.error("[ERROR] Failed to generate PowerPoint decks:", err);
    process.exit(1);
  }
}

main();
