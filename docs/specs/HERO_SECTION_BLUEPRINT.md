# VELTRAXX 2.0 — HERO SECTION BLUEPRINT (PHASE 2)
**Document Identifier:** `HERO_SECTION_BLUEPRINT.md`  
**Status:** DRAFT FOR OWNER REVIEW  
**Parent System:** [`VELTRAXX_2.0_DESIGN_SYSTEM.md`](file:///D:/tmp/veltraxx_2.o/VELTRAXX_2.0_DESIGN_SYSTEM.md)  
**Living Ledger:** [`PROJECT_MEMORY.md`](file:///D:/tmp/veltraxx_2.o/PROJECT_MEMORY.md)  

---

## 1. The 2.5D Spatial Stacking Blueprint (The 4 Layers of Depth)

Inspired by Reference 2 (*Juanmi Marquez's "JAPAN COLORS"*), the Hero Stage creates physical 3D depth using **pure lightweight CSS + Atropos Z-offsets + photographic cutout**, with zero heavy WebGL lag.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        HERO 2.5D SPATIAL STACK                         │
├────────────────────────────────────────────────────────────────────────┤
│ [TOP]    LAYER 4: FLOATING MICRO-UI & GLASS TELEMETRY                  │
│          • Frosted GlinUI Glass Telemetry Pill: [● LIVE REGISTRATION]  │
│          • Team Capacity Counter: [35 TEAMS MAX · 4 MEMBERS/TEAM]      │
│          • Swiss coordinate crosshairs: [+] LOC: 11.0168°N, 76.9558°E  │
├────────────────────────────────────────────────────────────────────────┤
│          LAYER 3: INTERSECTING DISPLAY TYPOGRAPHY                      │
│          • "VELTRAXX" (Massive 900-weight sans, tight tracking -0.04em)│
│          • Typographic Weave: "VELT" rendered BEHIND subject cutout,   │
│            "RAXX 2.0" overlapping the subject's torso in FRONT.        │
│          • Accent Pill: "2.0" tagged with Solar Wafer Yellow (#FFE500) │
├────────────────────────────────────────────────────────────────────────┤
│          LAYER 2: FOREGROUND PHOTOGRAPHIC CUTOUT                       │
│          • Exposed Macro Silicon ASIC Die with Multi-Tier Copper Routing│
│          • Desktop: 16:9 crop (/images/hero-desktop.webp)              │
│          • Mobile: 4:5 vertical crop (/images/hero-mobile.webp)        │
│          • Isolated transparent background; breaks container boundary  │
├────────────────────────────────────────────────────────────────────────┤
│          LAYER 1: GEOMETRIC COLOR PLANES                               │
│          • Tilted 14° Canary Yellow (#FFE500) polygon wedge            │
│          • Deep Obsidian Carbon (#111116) hard drop-polygon shadow     │
│          • Pure CSS clip-path / SVG vector polygons                    │
├────────────────────────────────────────────────────────────────────────┤
│ [BOTTOM] LAYER 0: GALLERY CANVAS BASE                                  │
│          • Canvas: Pure Gallery White (#FBFBFB)                        │
│          • Subtle 32px precision alignment grid (rgba(17,17,22,0.03))  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Copywriting & Content Architecture

All copy is grounded in real SIET VLSI / C2S program context. Zero fluff, zero generic AI hype.

### A. Eyebrow Tag (Swiss Monospace Metadata)
```text
[ NATIONAL LEVEL 24-HOUR VLSI & HARDWARE HACKATHON · C2S INITIATIVE ]
```

### B. Display Heading
```text
VELTRAXX 2.0
```
*Design Note: The "2.0" is enclosed in a high-voltage Solar Yellow (`#FFE500`) chamfered badge with an electric neon dot.*

### C. Mission / Sub-Headline
```text
Architect the future of silicon. 24 hours of non-stop VLSI design, 
synthesis, and hardware validation under industry constraints.
```

### D. Operational Telemetry & Ground Vitals
```text
[CONFIRMED_FROM_1.0] ● 24 HOURS NON-STOP · STRICTLY 35 TEAMS CAP · 100% OFFLINE ARENA
```
*Note: Reduced from a heavy 4-box cluster to a single crisp, floating glass telemetry pill to eliminate visual clutter.*

### E. Primary Calls-to-Action (CTAs)
1. **Primary Button:** `[ REGISTER TEAM (4 MEMBERS) → ]`
   - *Aesthetic:* Solid Solar Wafer Yellow (`#FFE500`) with carbon `#111116` text, 8px squircle radius, Apple tactile spring press.
2. **Secondary Button:** `[ EXPLORE RULEBOOK & SCHEDULE ↓ ]`
   - *Aesthetic:* Hairline 1px crisp border `rgba(17,17,22,0.12)` with optical glass hover state.

---

## 3. 2-Tier Responsive Behavior (Strictly Mobile vs. PC)

### 💻 PC / Laptop Screen (1280px – 1920px, 16:9 Landscape)
- **Layout:** Asymmetric 2-column editorial grid (`12-column`).
  - **Left 55%:** Eyebrow tag, massive display title with typographic weaving, subtext, telemetry bar, and dual CTA buttons.
  - **Right 45%:** The 2.5D visual stage powered by **Atropos**. The subject, tilted yellow polygon, and floating coordinates move at different speeds as the cursor glides across the screen (`data-atropos-offset="5"` vs `data-atropos-offset="-3"`).
- **Physics:** 60fps compositor-only transforms, subtle 6px tilt, zero frame drops on Intel Mesa GPUs.

### 📱 Mobile Screen (375px – 430px, 9:16 Portrait)
- **Layout:** 1-column vertically flowing stream.
  - **Top:** High-impact vertical subject cutout (`hero-mobile.webp` at 4:5 ratio) with the tilted yellow polygon framing the background.
  - **Middle:** "VELTRAXX 2.0" title rendered with fluid typography (`clamp(2.5rem, 8vw + 1rem, 3.75rem)`).
  - **Telemetry:** Stacks into a clean 2x2 compact grid with 1px divider lines.
  - **Bottom:** Full-width 48px tactile CTA button: `[ REGISTER TEAM NOW ]`.
- **Performance Rule:** All cursor tracking and parallax listeners are **completely disabled** on mobile (`(hover: hover)` media query). The layout is rock-solid static for instant 60fps scrolling and zero battery waste.
- **Scroll Safety:** `overflow-x: clip` on the body wrapper to guarantee zero horizontal wobble.

---

## 4. Single-Ownership Component Matrix for the Hero

| Element | Tool Used | How It Is Implemented |
| :--- | :--- | :--- |
| **Multi-Plane 2.5D Depth** | [`design-research/01-atropos`](file:///D:/tmp/veltraxx_2.o/design-research/01-atropos) | Desktop cursor parallax using `data-atropos-offset`. |
| **Glass Telemetry Pill** | [`design-research/09-glinui`](file:///D:/tmp/veltraxx_2.o/design-research/09-glinui) | Decoupled sibling glass container with `-webkit-backdrop-filter`. |
| **Button Touch Feedback**| [`design-research/04-motion`](file:///D:/tmp/veltraxx_2.o/design-research/04-motion) | Tactile spring tap feedback (`scale: 0.97`). |
| **Smooth Entry Timeline**| [`design-research/03-gsap`](file:///D:/tmp/veltraxx_2.o/design-research/03-gsap) | Staggered 0.4s load-in cascade (Canvas ➔ Polygon ➔ Subject ➔ Text). |
