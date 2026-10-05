# VELTRAXX 2.0 — VISUAL THEME & DESIGN SYSTEM SPECIFICATION
**Document Identifier:** `VELTRAXX_2.0_DESIGN_SYSTEM.md`  
**Status:** DRAFT FOR OWNER APPROVAL (PHASE 1: PLANNING ONLY — ZERO CODE WRITTEN)  
**Parent Contract:** [`PROJECT_MEMORY.md`](file:///D:/tmp/veltraxx_2.o/PROJECT_MEMORY.md)  
**Visual Anchors:** High-Fashion Spatial Layering, Minimalist Light Canvases, Avant-Garde Semiconductor Editorial.

---

## Co-Founder Critique & Architectural Challenge (Before We Begin)

As your co-founder, before ratifying this specification, I am challenging two specific items from the prompt to protect our timeline and mobile performance:

1. **The "Tablet" Contradiction:**
   - *What the prompt said:* Section 12 mentioned "DESKTOP → TABLET → MOBILE".
   - *Why it's a risk:* You explicitly instructed in our chat: *"we mainly need to optimize it for mobile and pc screen, not tablets and other size displays."* Adding an intermediate tablet breakpoint creates a 3-way layout divergence, doubling QA time and re-introducing the responsive bugs of 1.0.
   - *Co-Founder Recommendation:* **Strict 2-Tier Architecture.** Base layout is 100% optimized for **Mobile (375px–430px)**. Breakpoint `min-width: 1024px` unlocks the full **PC / Desktop (1280px–1920px)** spatial grid. Tablet viewports simply render the clean, fluid mobile stack with comfortable max-width constraints (`max-w-2xl mx-auto`).

2. **Light-Mode Glassmorphism Physics:**
   - *The Challenge:* In dark mode, glass is easy (translucent white on black). On a minimalist **white/off-white background**, standard glass either vanishes or looks like dirty gray smudge if poorly executed.
   - *Co-Founder Recommendation:* Our light glass uses **Subtle Optical Lensing**:
     - Surface: `rgba(255, 255, 255, 0.65)` to `rgba(255, 255, 255, 0.85)`
     - Border: Hairline 1px crisp stroke `rgba(0, 0, 0, 0.08)` (ensures card separation on light backgrounds)
     - Ambient Shadow: Multi-stop ultra-soft drop `0 20px 40px -15px rgba(0, 0, 0, 0.05)`
     - **Safari Anti-Flicker Rule:** Glass blur is applied ONLY to stationary card backings, never on moving containers.

---

## 1. Core Design Concept

VELTRAXX 2.0 is an elite semiconductor and hardware hackathon visual identity presented through the lens of **high-end contemporary editorial art direction and multi-layered spatial depth**. 

Instead of collapsing into generic dark-mode AI tropes (floating neon blobs, purple gradients, matrix rain), the website lives on a **crisp, luminous, minimalist white-and-sand gallery canvas**. Precision typography, Swiss technical labels, and silicon-wafer architectural grids form a disciplined foundation. 

Dynamic energy is injected through **sculptural 2.5D visual layers**—vivid geometric color planes (canary yellow, infrared crimson, electric cobalt), hyper-detailed avant-garde hardware/cyborg imagery, and typography that boldly weaves *in front of* and *behind* subjects. Glass surfaces act as precision optical instruments rather than decorative clutter. The result feels like an international engineering summit designed by an avant-garde Japanese design house: **precise, cerebral, vibrant, and unmistakably physical.**

---

## 2. Design Principles (The 10 Non-Negotiable Laws)

1. **Luminous Canvas Over Dark Void:** The default canvas is light, crisp, and high-clarity. Contrast is achieved through bold black typography and saturated chromatic accents, not moody background murk.
2. **Layered Spatial Planes (2.5D Illusion):** Every major section is composed of at least 3 distinct optical planes (Background Geometry → Cropped Subject/Imagery → Intersecting Typography/Glass → Micro-Metadata).
3. **Typography as Architecture:** Text is not just a container for words; it is a structural element. Oversized display headings anchor the page, while micro-monospaced labels communicate engineering rigor.
4. **Intentional Chromatic Tension:** Saturated colors (Solar Yellow, Infrared, Laser Cobalt) appear with surgical discipline against monochrome neutrals. If everything is vibrant, nothing is vibrant.
5. **Compositor-Only Motion Budget:** On PC, animations are silky-smooth (60fps locked) manipulating strictly `transform` and `opacity`. On mobile, all decorative background motion ceases to guarantee instant responsiveness and zero battery drain.
6. **Optical Glass as Instrument:** Frosted glass elements are used exclusively for floating navigation, operational telemetry, countdown counters, and active filters. Content bodies sit on crisp, opaque surfaces.
7. **Mobile-Native Autonomy:** Mobile is not a squished desktop. It is a distinct, vertically flowing editorial experience with native touch targets ($\ge 48\text{px}$) and dedicated native image crops.
8. **Subtle Silicon DNA (No Clichés):** We reference semiconductor engineering through wafer-stepper coordinates, clean die-package bounding boxes, and precision alignment marks—never neon circuit traces or binary rain.
9. **Zero Hallucination Integrity:** Sections exist only if backed by real data. We omit dummy judges, fake sponsors, or filler quotes.
10. **The Frictionless Funnel:** Visual drama never obscures the primary mission: discovering rules, checking tracks, and completing team registration in under 90 seconds.

---

## 3. Color System

The palette pairs high-luminance gallery neutrals with three hyper-controlled, high-voltage semiconductor energy accents:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   VELTRAXX 2.0 CHROMATIC ARCHITECTURE                  │
├────────────────────────────────────────────────────────────────────────┤
│ ⚪ GALLERY BASE NEUTRALS                                               │
│ • Surface Canvas (Primary):     #FBFBFB (Pure Gallery White)           │
│ • Surface Elevated (Secondary):  #F4F4F6 (Cool Concrete Studio Tint)   │
│ • Surface Contrast (Inverted):   #0D0D11 (Deep Obsidian Slate)         │
│ • Text Ink (Primary):           #111116 (Near-Black Carbon)            │
│ • Text Muted (Secondary):         #6B6B78 (Neutral Technical Gray)       │
│ • Border / Hairline:            rgba(17, 17, 22, 0.08) (1px Crisp)    │
├────────────────────────────────────────────────────────────────────────┤
│ ⚡ HIGH-VOLTAGE SEMICONDUCTOR ACCENTS (Max 15% Screen Area)             │
│ • Solar Wafer Yellow:            #FFE500 (High-energy accent, tags, CTA)│
│ • Infrared Crimson:              #FF2A4B (Urgency, dates, live badges)  │
│ • Silicon Cobalt:                #0055FF (Technical precision, links)   │
│ • Photonic Cyan:                 #00E5FF (Subtle optical highlight)     │
├────────────────────────────────────────────────────────────────────────┤
│ 🪟 OPTICAL GLASS TOKENS                                                │
│ • Glass Fill:                    rgba(255, 255, 255, 0.72)             │
│ • Glass Dark Fill (Inverted):    rgba(13, 13, 17, 0.78)                │
│ • Glass Stroke:                  rgba(255, 255, 255, 0.90) / 1px outer │
│ • Glass Ambient Blur:            backdrop-filter: blur(16px)           │
└────────────────────────────────────────────────────────────────────────┘
```

### Color Usage Distribution Rule:
- **70% Light Base:** `#FBFBFB` and `#F4F4F6` maintain breathability and editorial elegance.
- **20% Carbon Black:** `#111116` provides commanding typography and solid grounding cards.
- **10% Voltage Accents:** `#FFE500` (Yellow) or `#FF2A4B` (Infrared) used *only* for primary CTAs, active pills, live status indicators, and geometric background wedges.

---

## 4. Typography System

We pair an ultra-modern, high-impact Sans-Serif for editorial display with an industrial monospaced face for engineering data:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                      TYPOGRAPHIC HIERARCHY                             │
├────────────────────────────────────────────────────────────────────────┤
│ 1. DISPLAY HEADINGS (Hero, Major Track Titles)                         │
│    • Font Family: Uncut Sans / Clash Display / Inter Display (Heavy)   │
│    • Weight: 800 / 900 (Black / ExtraBold)                             │
│    • Scaling: clamp(2.5rem, 6vw + 1rem, 5.5rem)                        │
│    • Style: All-Caps or Tight Tracking (-0.04em), tight leading (0.95) │
├────────────────────────────────────────────────────────────────────────┤
│ 2. SECTION HEADINGS (H2, H3)                                           │
│    • Font Family: Inter / Plus Jakarta Sans                            │
│    • Weight: 700 (Bold), Tracking: -0.02em                             │
│    • Scaling: clamp(1.75rem, 3vw + 0.5rem, 3.0rem)                     │
├────────────────────────────────────────────────────────────────────────┤
│ 3. BODY COPY                                                           │
│    • Font Family: Inter / Plus Jakarta Sans                            │
│    • Weight: 400 (Regular) & 500 (Medium), Line-height: 1.6            │
│    • Scaling: clamp(0.95rem, 1vw + 0.2rem, 1.125rem)                   │
├────────────────────────────────────────────────────────────────────────┤
│ 4. TECHNICAL METADATA & TELEMETRY LABELS                               │
│    • Font Family: JetBrains Mono / Space Mono                          │
│    • Weight: 500 (Medium)                                              │
│    • Styling: Uppercase, tracking +0.08em, size: 0.75rem – 0.85rem     │
│    • Usage: Coordinates [x,y], Team count [35/35], Timestamps, Badges  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Glass System (The Apple Spatial Physics Spec)

Learning from the 14-commit Safari crash war of 1.0, glass in VELTRAXX 2.0 is an optical accent subject to strict physical rendering rules:

### Approved Glass Placements:
- **Floating Header Navigation:** Pinned top bar with subtle blur and 1px bottom border.
- **Stage Countdown Telemetry Pod:** Floating status pill displaying remaining registration window.
- **Bento Card Badges:** Translucent floating badges indicating track categories (e.g., `[VLSI · 01]`).

### Banned Glass Placements:
- ❌ **NEVER** apply `backdrop-filter: blur()` to cards being animated by Framer Motion or GSAP.
- ❌ **NEVER** stack multiple glass elements on top of each other (causes severe mobile GPU drop).
- ❌ **NEVER** put long paragraphs of small body text over blurry glass.

### Standard CSS Glass Recipe (Light Canvas):
```css
.glass-surface {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 
    0 10px 30px -10px rgba(0, 0, 0, 0.04),
    0 1px 1px 0 rgba(0, 0, 0, 0.02);
}
```

---

## 6. Depth & 2.5D Layering System

To achieve the 3D feeling of our reference imagery without loading heavy, laggy 3D engines (Three.js/WebGL), we construct layouts using **4-Layer Physical Stacking**:

```text
  [FRONT]  Layer 4: Floating Micro-UI (Glass pills, technical coordinates, tooltips)
     ▲     Layer 3: Intersecting Display Typography (Titles overlapping subjects)
     │     Layer 2: Foreground Photographic Cutout (Transparent PNG/WebP subject)
     │     Layer 1: Geometric Color Planes (Tilted yellow/black polygons, die boundaries)
  [BACK]   Layer 0: Pristine Canvas (#FBFBFB with subtle architectural 24px grid)
```

- **Subject Breaking:** Subject silhouettes intentionally break out of their container boxes, casting a soft directional contact shadow onto Layer 1.
- **Typographic Weaving:** Display typography is split across z-indexes: the first word sits behind the subject's shoulder, while the second word sits directly in front.

---

## 7. Image Direction & Dual-Crop Protocol

All imagery must feel like high-end industrial/fashion-tech editorial photography.

### Visual Motifs:
- **Subjects:** High-definition avant-garde sculptural figures, cybernetic helmets with matte obsidian and liquid chrome textures, robotic manipulators handling silicon wafers.
- **Lighting:** Sharp, directional gallery studio key lighting; high contrast with deep shadows and clean rim reflections. Zero muddy, ambient dark-blob lighting.
- **Backgrounds:** Transparent or solid pure white/studio gray so subjects integrate seamlessly into the page canvas.

### The Dual-Crop Asset Standard (`/images/`):
Every image required on the site is commissioned and generated in two distinct aspect ratios:
1. **PC / Desktop Landscape:** `1920 x 1080` (or `1600 x 900`), 16:9 ratio. Subject positioned off-center (rule of thirds) to leave breathing room for headline typography.
2. **Mobile Portrait:** `800 x 1000` (or `1080 x 1350`), 4:5 vertical ratio. Subject centered, tightly framed, optimized for vertical thumb scrolling.

---

## 8. Layout & Grid Architecture (PC vs. Mobile)

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        RESPONSIVE GRID SPECS                           │
├────────────────────────────────────────────────────────────────────────┤
│ 💻 PC / DESKTOP (1280px - 1920px)                                      │
│ • Container: max-w-7xl (1280px) or max-w-[1440px] centered             │
│ • Columns: 12-column asymmetric editorial grid                         │
│ • Margins / Gutters: 32px – 48px padding                               │
│ • Layout Dynamic: Asymmetrical offsets, overlapping hero stages,       │
│   split-screen typography vs. floating visual anchors.                 │
├────────────────────────────────────────────────────────────────────────┤
│ 📱 MOBILE (375px - 430px)                                              │
│ • Container: 100% width with 16px – 20px horizontal screen gutter      │
│ • Columns: 1-column single-stream vertical flow                         │
│ • Stacking Rule: Multi-column desktop grids collapse into vertical     │
│   cards with generous 24px – 32px vertical breathing room.             │
│ • Touch Targets: All interactive buttons and inputs ≥ 48px height.     │
│ • Zero Horizontal Scroll: Strict overflow-x: clip; on layout wrappers. │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Animation & Interaction System

### PC / Desktop Interaction:
- **Subtle Cursor Parallax:** Decorative background geometric planes and secondary badges calculate subtle mouse offsets ($dx, dy$) via `requestAnimationFrame` with smooth lerp interpolation (maximum movement capped to $8\text{px}$).
- **Magnetic Buttons:** Primary CTAs exhibit a slight 4px magnetic attraction on cursor approach.
- **Scroll Entrance:** Sections reveal using clean Apple spring transitions: `opacity: 0 -> 1` and `y: 20px -> 0px` with `transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)`.

### Mobile Interaction:
- **Zero Mouse/Cursor Listeners:** All mousemove and parallax listeners are disabled via media query check (`window.matchMedia('(hover: hover)')`).
- **Tactile Touch Feedback:** Instant `:active` state scale feedback (`scale(0.97)`) on buttons using CSS transitions without 300ms mobile touch delay.

---

## 10. Component Visual Language

1. **Navigation:** Floating pill bar pinned at top (`glass-surface`), featuring the bold VELTRAXX 2.0 monogram, clean text links, and a high-voltage `#FFE500` "Register Now" pill. On mobile, collapses into a clean full-screen drawer.
2. **Buttons:**
   - *Primary:* Solid obsidian `#111116` with crisp white text, or vibrant Solar Yellow `#FFE500` with carbon black text. Sharp 6px or 8px squircle radius (Apple style).
   - *Secondary:* Clean 1px hairline outline with subtle hover fill.
3. **Information Bento Blocks:** Asymmetrical rectangular cards with light concrete surfaces (`#F4F4F6`), 1px subtle borders, bold numeral tags (`01`, `02`, `03` in JetBrains Mono), and high-contrast typography.
4. **Countdown Pod:** Minimalist numerical ticker. Large monospaced digits in carbon black, separated by static hairline dividers (no blinking colons that force Linux compositor re-renders!).

---

## 11. Performance & Hardware Budgets

- **Target Bundle Size:** $< 150\text{ KB}$ initial JavaScript payload.
- **Image Optimization:** All photographic assets served in modern **WebP** / **AVIF** formats with explicit `width` and `height` attributes to prevent Cumulative Layout Shift (CLS = 0).
- **Projector / Linux Safety:** Zero CSS `filter: drop-shadow()` combined with `background-clip: text` anywhere on the site.
- **Core Web Vitals:** Mobile LCP $< 1.8\text{s}$ on standard 4G mobile emulation.

---

## 12. Anti-AI-Slop Blacklist (Strictly Forbidden Patterns)

The following patterns are **permanently banned** from VELTRAXX 2.0:
- ❌ No generic dark-purple/violet background glow meshes.
- ❌ No floating circuit-board traces or random glowing solder nodes.
- ❌ No 3 identical horizontal pricing/feature cards side-by-side.
- ❌ No spinning 3D rings, particle vortexes, or cyber-cubes that hog 50% CPU.
- ❌ No fake browser mockups with purple gradients inside.
- ❌ No em-dashes (`—`) in visible UI copy (use hyphens `-` or cleaner phrasing).

---

## 13. VELTRAXX 1.0 Forensic Guardrails

Derived directly from [`VELTRAXX_26_FAILURE_LEDGER.md`](file:///D:/tmp/veltraxx_2.o/VELTRAXX_26_FAILURE_LEDGER.md):
- **Rule 1.0-A:** Capacity limits are NEVER checked in React state. They will live exclusively in the Supabase PostgreSQL transaction in [`backend_sql/`](file:///D:/tmp/veltraxx_2.o/backend_sql).
- **Rule 1.0-B:** Registration confirmation emails will never be sent via client-side EmailJS. They will be triggered server-side.
- **Rule 1.0-C:** Volunteers and Admins must have authenticated sessions. Zero anonymous SELECT on team member phone numbers or emails.
- **Rule 1.0-D:** File length rule: No single component or page shall exceed 300 lines of code.

---

## 14. Preliminary Design Tokens (CSS Custom Properties)

```css
:root {
  /* Colors */
  --vx-canvas: #FBFBFB;
  --vx-surface-subtle: #F4F4F6;
  --vx-surface-dark: #111116;
  --vx-text-primary: #111116;
  --vx-text-secondary: #6B6B78;
  --vx-border: rgba(17, 17, 22, 0.08);
  --vx-border-strong: rgba(17, 17, 22, 0.16);
  
  /* Semiconductor Energy Accents */
  --vx-accent-yellow: #FFE500;
  --vx-accent-crimson: #FF2A4B;
  --vx-accent-cobalt: #0055FF;
  
  /* Typography */
  --vx-font-display: 'Uncut Sans', 'Clash Display', -apple-system, sans-serif;
  --vx-font-body: 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif;
  --vx-font-mono: 'JetBrains Mono', monospace;
  
  /* Radii */
  --vx-radius-sm: 6px;
  --vx-radius-md: 12px;
  --vx-radius-lg: 20px;
  --vx-radius-full: 9999px;
  
  /* Layout */
  --vx-max-width: 1360px;
}
```

---

## 15. Open Decisions for Owner Approval

Before we complete Phase 1 and move into Phase 2 (Homepage & Screen Blueprint), please confirm:
1. **Approval of the Luminous Minimalist / High-Fashion Hardware Concept:** Does this capture the essence of your two reference images?
2. **The 2-Tier Viewport Lock (Mobile vs. PC):** Do you agree to strictly lock the design to Mobile (375px-430px) and PC (1280px-1920px), omitting dedicated tablet styling?
3. **Primary Accent Preference:** Do you prefer **Solar Wafer Yellow (`#FFE500`)** or **Infrared Crimson (`#FF2A4B`)** as the primary hero CTA color?
