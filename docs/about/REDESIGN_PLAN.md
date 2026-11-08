# MASTER SPECIFICATION & REDESIGN PLAN: ABOUT PAGE OVERHAUL (A TO Z)
**Department of Electronics Engineering (VLSI Design and Technology)**  
**Sri Shakthi Institute of Engineering and Technology, Coimbatore (Autonomous)**  
**TNEA Counselling Code: 2727** | **Affiliation: MeitY Chips to Startup (C2S) Programme**  
**Target File:** `src/pages/AboutPage.jsx` | **Modular Component Tree:** `src/components/about/`  
**Design Reference:** `src/pages/HomePage.jsx` | **Authoritative Content:** `Collage vlsi magazine.pdf`  

---

## 1. Executive Summary & Neo-Brutalist Architecture Blueprint (F1)

### 1.1 The Problem: The 2,101-Line Monolithic Anti-Pattern
The current implementation of the About Page (`src/pages/AboutPage.jsx`) is a monolithic, 2,101-line single-file anti-pattern. This structure creates significant technical and architectural debt:
1. **Severe Code Fragility**: 2,101 lines in a single file makes incremental feature updates error-prone, tightly couples state logic (tab switches, filters, modals, observers), and causes high cognitive overhead.
2. **Dead Code Accumulation**: Unused imports (`useLayoutEffect`, `useCallback` from `'react'`, `useLocation` from `'react-router-dom'`, and 21 unreferenced Lucide icons) clutter the bundle without functional purpose.
3. **DOM Hierarchy Defect**: Line 501 of `AboutPage.jsx` introduces a nested `<main className="flex-1">` element inside the global `<main id="main-content" className="flex-1 flex flex-col">` already defined in `src/App.jsx` (line 47), violating semantic HTML standards and accessibility validation.
4. **Visual Monotony (Monochrome Repetition)**: The existing design relies heavily on flat alternating canvases (`#FAF8F5` and pure white) with uniform off-white card grids (17 identical cards in Section 4, 7 identical cards in Section 3, 9 identical quote boxes in Section 9). It completely lacks the high-contrast Neo-Brutalist excitement and tactile energy demonstrated on `HomePage.jsx`.
5. **Sticky Subheader Overhead**: Lines 463-500 mount a secondary sticky subheader pill bar that sits directly beneath the global Navbar (`sticky top-0 z-40`), creating an intrusive 130px+ double-header barrier that consumes more than 20% of the mobile viewport, causes horizontal scroll friction, and introduces continuous `IntersectionObserver` polling overhead.

### 1.2 Design System Thesis: Neo-Brutalist Industrial Pop
VELTRAXX 2.0 establishes an unapologetic **Neo-Brutalist Industrial Pop** design language. It rejects generic dark-mode AI tropes (soft purple radial glows, floating wireframe circuits, 3-equal feature cards) in favor of high-voltage physical hardware aesthetics:
- **Luminous Gallery Canvas**: Built upon an editorial base (`#FAF8F5` / `#FBFBFB`) layered with architectural dot grids (`bg-tech-grid`) and high-voltage pitch-black inversions (`#0D0D11`).
- **Zero-Blur Hard Carbon Drop Shadows**: Geometric offset shadows (`shadow-[4px_4px_0px_0px_#111116]`, `shadow-[6px_6px_0px_0px_#FFE500]`, `shadow-[8px_8px_0px_0px_#FF2E93]`) with 0px Gaussian blur.
- **Physical Borders & Chamfers**: 2px to 3px solid pitch-black carbon borders (`#111116`), 45-degree octagonal silicon die chamfers (`.chamfer-badge`), and tilted micro-stickers (`rotate-2`, `-rotate-3`).
- **Tactile Micro-Physics**: Interactive elements utilize high-tension spring physics `cubic-bezier(0.34, 1.56, 0.64, 1)` and true 3D Z-axis pop layers (`preserve-3d`, `translateZ(40px)`).

### 1.3 Complete 11-Component Decomposition Tree
To match the clean modularity of `HomePage.jsx` (which is a 53-line orchestrator), `AboutPage.jsx` will be decomposed into an 11-component architecture under `src/components/about/`:

```
src/
├── pages/
│   ├── HomePage.jsx                       (53 lines - master home orchestrator)
│   └── AboutPage.jsx                      (~65 lines - master about orchestrator)
│
├── data/
│   └── aboutData.js                       (Centralized verified data store: 17 projects, 7 workshops,
│                                           leadership, honours, sports, NCC, clubs, quotes)
│
└── components/
    └── about/
        ├── AboutHero.jsx                  (S1: Asymmetric Hero & Magazine Portal)
        ├── AboutMarqueeStats.jsx          (S2: Dual Tilted Marquees & 4 Stat Chips)
        ├── AboutLeadership.jsx            (S3: Visionary Leadership & 5-Stage VLSI Innovation)
        ├── AboutWorkshops.jsx             (S4: MeitY C2S EDA Labs & 7 Workshops Timeline)
        ├── AboutSiliconResearch.jsx       (S5: 17 Undergraduate Silicon Research Projects Bento)
        ├── AboutCompetitions.jsx          (S6: Flagship Arenas: VELTRAXX '26 & The Lost Silicon)
        ├── AboutNationalExposure.jsx      (S7: National Delegations & Conclaves Rail)
        ├── AboutHonours.jsx               (S8: Samsung Fellows, InterviewBot Startup, NPTEL)
        ├── AboutBeyondSilicon.jsx         (S9: Holistic Excellence: Sports, NCC, Dance, Clubs)
        ├── AboutMagazineVault.jsx         (S10: 51-Page Digital Magazine Vault & Builder Voices)
        ├── AboutClosingCta.jsx            (S11: Closing High-Voltage Inquiries & Registration CTA)
        └── AboutLightbox.jsx              (Shared accessible image viewer modal dialog)
```

### 1.4 The Clean Coordinator Pattern for `src/pages/AboutPage.jsx`
The target `AboutPage.jsx` becomes a clean, maintainable, declarative orchestrator (approximately 65 lines) matching `HomePage.jsx`:

```jsx
import React, { useState } from 'react';
import AboutHero from '../components/about/AboutHero';
import AboutMarqueeStats from '../components/about/AboutMarqueeStats';
import AboutLeadership from '../components/about/AboutLeadership';
import AboutWorkshops from '../components/about/AboutWorkshops';
import AboutSiliconResearch from '../components/about/AboutSiliconResearch';
import AboutCompetitions from '../components/about/AboutCompetitions';
import AboutNationalExposure from '../components/about/AboutNationalExposure';
import AboutHonours from '../components/about/AboutHonours';
import AboutBeyondSilicon from '../components/about/AboutBeyondSilicon';
import AboutMagazineVault from '../components/about/AboutMagazineVault';
import AboutClosingCta from '../components/about/AboutClosingCta';
import AboutLightbox from '../components/about/AboutLightbox';
import Footer from '../components/Footer';

export default function AboutPage() {
  const [lightboxState, setLightboxState] = useState({ isOpen: false, activeIndex: 0 });

  const openLightbox = (index) => {
    setLightboxState({ isOpen: true, activeIndex: index });
  };

  const closeLightbox = () => {
    setLightboxState({ isOpen: false, activeIndex: 0 });
  };

  return (
    <>
      <main className="flex-1">
        {/* S1: Asymmetric Hero Stage & 2.5D Magazine Cover Portal */}
        <AboutHero onOpenGallery={openLightbox} />

        {/* S2: Dual Intersecting Tilted Marquees & Departmental Key Metrics */}
        <AboutMarqueeStats />

        {/* S3: Institutional Vision & 5-Stage VLSI Innovation Model */}
        <AboutLeadership />

        {/* S4: MeitY C2S EDA Labs & 7 Commercial Workshops Interactive Rail */}
        <AboutWorkshops />

        {/* S5: 17 Undergraduate Silicon Research Architectures Asymmetric Bento */}
        <AboutSiliconResearch />

        {/* S6: Flagship Competitive Arenas (VELTRAXX '26 & The Lost Silicon) */}
        <AboutCompetitions />

        {/* S7: National Delegations & Conclaves Continuous Execution Rail */}
        <AboutNationalExposure onOpenGallery={openLightbox} />

        {/* S8: Fellowships (Samsung India), Startups (InterviewBot) & NPTEL Elite */}
        <AboutHonours />

        {/* S9: Holistic Excellence Beyond Silicon (Sports, NCC, Cultural, Clubs) */}
        <AboutBeyondSilicon />

        {/* S10: Departmental Magazine Vault, 51-Page PDF & Builder Voices */}
        <AboutMagazineVault onOpenGallery={openLightbox} />

        {/* S11: High-Voltage Inquiries & Academic Admissions Conversion Anchor */}
        <AboutClosingCta />
      </main>

      {/* Accessible Lightbox Modal */}
      {lightboxState.isOpen && (
        <AboutLightbox
          activeIndex={lightboxState.activeIndex}
          onClose={closeLightbox}
        />
      )}

      {/* Universal Institutional Footer */}
      <Footer />
    </>
  );
}
```

---

## 2. Complete Sticky Subheader Elimination Specification (F2)

### 2.1 Forensic Audit of Existing Code Anchors
The sticky subheader pill bar is defined locally within `src/pages/AboutPage.jsx`. It does not originate from a shared global component or router layout. The following exact lines in `AboutPage.jsx` constitute the subheader system:

| Line Range | Code Segment in `AboutPage.jsx` | Description & Defect | Action Required |
| :--- | :--- | :--- | :--- |
| **Line 133** | `const [activeSection, setActiveSection] = useState('hero');` | Local state tracking active section for pill highlighting. Redundant once subheader is gone. | **Delete completely** |
| **Lines 171-180** | `const subNavItems = [ { label: 'Overview', id: 'journey-hero' }, ... ];` | Array of 8 navigation targets. Only consumed by subheader buttons. | **Delete completely** |
| **Lines 183-196** | `useEffect(() => { const observer = new IntersectionObserver(...); ... }, []);` | 14-line observer polling DOM sections on scroll. Causes unnecessary re-renders. | **Delete completely** |
| **Lines 463-500** | `<div className="sticky top-[68px] sm:top-[74px] z-30 bg-[#FAF8F5]/90 ...">...</div>` | 38 lines of JSX rendering sticky horizontal pill bar and PDF download button. | **Delete completely** |

### 2.2 Complete Elimination Guarantee: Zero Subheader on Page
Under Requirement R2 and User Operating Preferences, **no subheader or secondary toolbar of any kind will exist on the About page**. The global fixed Navbar (`sticky top-0 z-40`) will connect seamlessly and directly to the top edge of Section 1 Hero (`#journey-hero`). 
- On mobile devices, this instantly recovers **60px to 74px** of vertical screen real estate.
- It removes horizontal swipe scroll friction on narrow viewports.
- It eliminates the aesthetic disharmony between `HomePage.jsx` (which has no subheader) and `AboutPage.jsx`.

### 2.3 Relocation of Magazine PDF Download Trigger
In the old layout, the magazine download link was cramped inside the subheader (lines 490-497). In the redesign, the download action is relocated to two high-visibility, contextually natural positions:
1. **Hero Primary Action Cluster (Section 1)**: Alongside the "Explore Silicon Research" CTA, a tactile Neo-Brutalist button is placed:
   ```jsx
   <a
     href="/downloads/Collage_vlsi_magazine.pdf"
     download="Collage_vlsi_magazine.pdf"
     className="inline-flex items-center gap-2.5 px-6 py-4 rounded-xl bg-[#FFE500] text-[#111116] font-mono text-sm font-black uppercase tracking-wider border-3 border-[#111116] shadow-[4px_4px_0px_0px_#111116] hover:shadow-[2px_2px_0px_0px_#111116] hover:translate-x-0.5 hover:translate-y-0.5 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all select-none"
   >
     <Download className="w-4 h-4 text-[#111116]" />
     <span>Download Magazine (PDF · 51 Pages)</span>
   </a>
   ```
2. **Section 10 Dedicated Magazine Vault & Archives**: An immersive, full-featured download station featuring the 51-page publication spread, file size telemetry (`28.4 MB · High-Res PDF`), table of contents index, and direct download cards.

---

## 3. Neo-Brutalist Color Harmony & Anti-Monochrome Strategy (F3)

### 3.1 The 70 / 20 / 10 Chromatic Rule
To cure the monochrome disease of repetitive off-white cards while preventing visual chaos or eye strain, every section strictly adheres to the 70 / 20 / 10 chromatic formula:
- **70% Luminous Neutral Base**: Gallery Canvas (`#FAF8F5` / `#FBFBFB`) and Studio Gray (`#F4F4F6`) provide clean breathing room, immaculate typography legibility, and high editorial contrast.
- **20% Pitch-Black Grounding**: Pitch Black Carbon (`#111116`) and Obsidian Deep (`#0D0D11`) anchor structural frames, typography, heavy borders, and inverted high-voltage chassis.
- **10% High-Voltage Accent Pops**: Solar Yellow (`#FFE500`), Hot Pink (`#FF2E93`), Electric Cyan (`#00E5FF`), Neon Lime (`#B6FF00`), and Silicon Cobalt (`#0055FF`) are surgically applied to active CTAs, domain tabs, telemetry badges, and hard drop shadows.

### 3.2 Canonical Design System Tokens

| Token Name | Hex Code | Semantic Role | Tailwind Utility Class | CSS Custom Variable |
| :--- | :--- | :--- | :--- | :--- |
| **Canvas Light** | `#FAF8F5` | Warm luminous base canvas | `bg-[#FAF8F5]` | `--color-canvas` |
| **Canvas Studio** | `#FBFBFB` | Pure architectural gallery plane | `bg-[#FBFBFB]` | `--color-studio` |
| **Studio Neutral**| `#F4F4F6` | Technical light gray for nested containers | `bg-[#F4F4F6]` | `--color-neutral` |
| **Pitch Black** | `#111116` | Solid ink text, 2-3px carbon outlines, badges | `text-[#111116]`, `border-[#111116]` | `--color-carbon` |
| **Obsidian Deep** | `#0D0D11` | Inverted high-voltage dark chassis | `bg-[#0D0D11]`, `text-white` | `--color-obsidian` |
| **Solar Yellow** | `#FFE500` | Primary actions, key milestone highlights, wafer disc | `bg-[#FFE500]`, `text-[#111116]` | `--color-solar` |
| **Hot Cyber Pink**| `#FF2E93` | Competitions, urgent telemetry, trophies, alerts | `bg-[#FF2E93]`, `text-white` | `--color-magenta` |
| **Electric Cyan** | `#00E5FF` | EDA toolchains, verification, technical specs | `bg-[#00E5FF]`, `text-[#111116]` | `--color-cyan` |
| **Neon Logic Lime**| `#B6FF00` | ₹0 Free badges, active pulse dots, fellowships | `bg-[#B6FF00]`, `text-[#111116]` | `--color-lime` |
| **Silicon Cobalt**| `#0055FF` | Academic tiering, IEEE honors, hyperlinks | `bg-[#0055FF]`, `text-white` | `--color-cobalt` |
| **Technical Muted**| `#6B6B78` | Captions, metadata, coordinates, timestamps | `text-[#6B6B78]` | `--color-muted` |

### 3.3 Section-by-Section Color Assignment Matrix

| Section # & Component | Background Surface | Structural Outlines & Framing | Accent Colors & Badges | Solid Offset Drop Shadows |
| :--- | :--- | :--- | :--- | :--- |
| **S1: AboutHero** | Luminous Canvas (`#FAF8F5`) with `bg-tech-grid` | 3px Pitch Black (`#111116`) | Solar Yellow (`#FFE500`) wafer disc, Hot Pink (`#FF2E93`) telemetry | `shadow-[4px_4px_0px_0px_#111116]`, `shadow-[6px_6px_0px_0px_#FFE500]` |
| **S2: AboutMarqueeStats** | Ribbon 1: `#0D0D11` / Ribbon 2: `#FFE500` | 2px Carbon (`#111116`) borders | Solar Yellow text, Hot Pink bullet separators (`●`) | `shadow-[4px_4px_0px_0px_#111116]` on stat chips |
| **S3: AboutLeadership** | Studio Neutral (`#F4F4F6`) | 3px Carbon (`#111116`) | Color-coded leader panels: Chairman (`#0055FF`), Secretary (`#FF2E93`), Joint Sec (`#B6FF00`), HOD (`#FFE500`) | `shadow-[6px_6px_0px_0px_#111116]`, `shadow-[6px_6px_0px_0px_#FF2E93]` |
| **S4: AboutWorkshops** | Gallery Canvas (`#FBFBFB`) | 2px-3px Carbon (`#111116`) | Electric Cyan (`#00E5FF`) active tabs, Solar Yellow (`#FFE500`) workshop tags | `shadow-[5px_5px_0px_0px_#00E5FF]`, `shadow-[5px_5px_0px_0px_#111116]` |
| **S5: AboutSiliconResearch** | Luminous Canvas (`#FAF8F5`) | 3px Carbon (`#111116`) | Domain top strips: Security (`#FF2E93`), AI (`#FFE500`), SoC (`#00E5FF`), Vision (`#B6FF00`), Compute (`#0055FF`) | `shadow-[6px_6px_0px_0px_#111116]` shifting to domain colors on hover |
| **S6: AboutCompetitions** | Split Stage: VELTRAXX (`#0D0D11`) / LOST SILICON (`#FFE500`) | 3px Solid Pitch Black | High-contrast neon inversion: Lime text on dark, carbon text on yellow | `shadow-[8px_8px_0px_0px_#FF2E93]`, `shadow-[8px_8px_0px_0px_#111116]` |
| **S7: AboutNationalExposure** | Studio Neutral (`#F4F4F6`) | 2px-3px Carbon with dynamic rail | Electric Cyan (`#00E5FF`) progress line, Silicon Cobalt (`#0055FF`) milestone nodes | `shadow-[5px_5px_0px_0px_#111116]`, `shadow-[3px_3px_0px_0px_#00E5FF]` |
| **S8: AboutHonours** | Gallery Canvas (`#FBFBFB`) | 3px Carbon (`#111116`) | Samsung Blue (`#0055FF`), InterviewBot Yellow (`#FFE500`), NPTEL Gold (`#FFE500`) | `shadow-[6px_6px_0px_0px_#FFE500]`, `shadow-[6px_6px_0px_0px_#0055FF]` |
| **S9: AboutBeyondSilicon** | Luminous Canvas (`#FAF8F5`) | 2px-3px Carbon (`#111116`) | Gold `#FFE500` (Shooting), Olive `#B6FF00` (NCC), Hot Pink `#FF2E93` (Illusion Crew) | `shadow-[5px_5px_0px_0px_#111116]`, `shadow-[4px_4px_0px_0px_#FF2E93]` |
| **S10: AboutMagazineVault** | Studio Neutral (`#F4F4F6`) | 3px Solid Pitch Black | Solar Yellow (`#FFE500`) download cards, Neon Lime (`#B6FF00`) spread tabs | `shadow-[8px_8px_0px_0px_#FFE500]`, `shadow-[6px_6px_0px_0px_#00E5FF]` |
| **S11: AboutClosingCta** | Obsidian Deep Chassis (`#0D0D11`) | 3px Pitch Black (`#111116`) | Hot Pink (`#FF2E93`) registration CTA, Solar Yellow (`#FFE500`) HOD contact badge | `shadow-[5px_5px_0px_0px_#FF2E93]`, `shadow-[4px_4px_0px_0px_#FFE500]` |

### 3.4 Contrast & WCAG AAA Accessibility Enforcement
1. **Strict Text-on-Yellow Rule**: Text placed over Solar Yellow (`#FFE500`), Electric Cyan (`#00E5FF`), or Neon Lime (`#B6FF00`) MUST ALWAYS be Pitch Black (`#111116`). White text on yellow or lime is strictly prohibited (contrast ratio $> 14:1$, achieving WCAG AAA).
2. **Text-on-Dark Rule**: Text placed over Pitch Black (`#111116`) or Obsidian Deep (`#0D0D11`) is pure white (`#FFFFFF`) or Solar Yellow (`#FFE500`) for headers, and Studio Neutral (`#E2E2E8`) for body copy.
3. **Solid Dark Framing**: High-chroma color blocks are always outlined in `border-2 border-[#111116]` or `border-3 border-[#111116]`, preventing visual bleed between adjacent colors.

---

## 4. Typography Hierarchy & Micro-Brutalist Styling (F4)

### 4.1 Typeface Families
- **Display & Editorial Sans**: `Plus Jakarta Sans`, `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Technical & Engineering Monospace**: `JetBrains Mono`, `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`

### 4.2 Comprehensive Typography Scale

| Hierarchy Level | Font Family | Size & Tailwind Class | Weight | Tracking & Leading | Usage in About Redesign |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display H1** | Plus Jakarta Sans | `text-5xl sm:text-6xl md:text-7xl lg:text-[5rem]` | `font-black` (900) | `tracking-tight leading-[0.92]` | Hero Stage Main Headline |
| **Chapter H2** | Plus Jakarta Sans | `text-3xl sm:text-4xl lg:text-5xl` | `font-black` (900) | `tracking-tight leading-tight` | Section Titles (`CHAPTER 0X // ...`) |
| **Bento H3** | Plus Jakarta Sans | `text-xl sm:text-2xl lg:text-3xl` | `font-black` (900) | `tracking-tight leading-snug` | Major Project & Leadership Cards |
| **Subcard H4** | Plus Jakarta Sans | `text-lg sm:text-xl` | `font-black` (900) | `leading-snug` | Workshop Titles, Event Names |
| **Body Large** | Plus Jakarta Sans | `text-base sm:text-lg md:text-xl` | `font-medium` (500) | `leading-relaxed text-[#111116]/85` | Vision Statements, Hero Subtitle |
| **Body Base** | Plus Jakarta Sans | `text-sm sm:text-base` | `font-normal` (400) | `leading-relaxed text-[#111116]/80` | Project Abstracts, Biographies |
| **Eyebrow Pill**| JetBrains Mono | `text-xs` (12px) | `font-bold` (700) | `uppercase tracking-widest` | Chapter Header Eyebrows |
| **Metric Stat** | JetBrains Mono | `text-3xl sm:text-4xl md:text-5xl` | `font-black` (900) | `tracking-tight` | Counter Chips (`17+`, `7`, `13+`) |
| **Telemetry Tag**| JetBrains Mono | `text-[10px]` to `text-xs` | `font-bold` (700) | `uppercase tracking-wider` | EDA Tools, Dates, Coordinates |

### 4.3 Tactile Micro-Brutalist Styling Elements
1. **Chamfer Badges (Octagonal Silicon Die Cutout)**:
   Implemented via CSS polygon clip-path:
   ```css
   .chamfer-badge {
     clip-path: polygon(
       8px 0%, calc(100% - 8px) 0%,
       100% 8px, 100% calc(100% - 8px),
       calc(100% - 8px) 100%, 8px 100%,
       0% calc(100% - 8px), 0% 8px
     );
   }
   ```
   Styled as:
   ```jsx
   <div className="chamfer-badge px-4 py-2 bg-[#FFE500] text-[#111116] font-mono text-xs font-black uppercase tracking-wider border-2 border-[#111116] shadow-[3px_3px_0px_0px_#111116] transform -rotate-2">
     <span>C2S GOVT MEITY LAB</span>
   </div>
   ```
2. **Vital-Tilt Micro-Stickers**:
   Rotated tactile stickers simulating physical hardware tags:
   - Yellow Tilt: `transform rotate-3 bg-[#FFE500] text-[#111116] border-2 border-[#111116] shadow-[3px_3px_0px_0px_#111116]`
   - Pink Tilt: `transform -rotate-2 bg-[#FF2E93] text-white border-2 border-[#111116] shadow-[3px_3px_0px_0px_#111116]`
   - Cyan Tilt: `transform rotate-2 bg-[#00E5FF] text-[#111116] border-2 border-[#111116] shadow-[3px_3px_0px_0px_#111116]`
3. **Silicon Coordinates & Hardware Watermarks**:
   - Monospace telemetry lines: `COIMBATORE // 11.0168°N, 76.9558°E · TNEA 2727`
   - Background typographic Japanese Kanji glyphs: `集積回路` (Integrated Circuit) rendered as an ultra-subtle architectural watermark (`text-[#111116]/[0.03]` in light sections, `text-white/[0.04]` in dark chassis).

---

## 5. GSAP Motion Choreography & Kinetic Architecture (F5)

### 5.1 GSAP Global Smooth Scroll (`ScrollManager.jsx`)
In-page navigation utilizes GSAP's `ScrollToPlugin` via the existing `smoothScrollTo` utility:
- Target Y calculation:
  ```javascript
  const headerOffset = 85;
  const targetY = Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerOffset);
  const distance = Math.abs(window.scrollY - targetY);
  const duration = Math.min(1.4, Math.max(0.7, distance / 1800));

  gsap.to(window, {
    scrollTo: { y: targetY, autoKill: true },
    duration: duration,
    ease: "power3.inOut"
  });
  ```
- Honors `prefers-reduced-motion` with instant jump `window.scrollTo({ top: targetY, behavior: 'instant' })`.

### 5.2 60fps GPU-Accelerated Continuous Vertical Execution Rail
In **Section 4 (Workshops)** and **Section 7 (National Footprint)**, a continuous hardware-accelerated vertical progress line connects chronological milestones:
```javascript
// Continuous GPU execution rail tracking
useEffect(() => {
  const container = containerRef.current;
  const lineFill = lineFillRef.current;
  if (!container || !lineFill) return;

  const handleScroll = () => {
    const rect = container.getBoundingClientRect();
    const vh = window.innerHeight;
    const currentTravel = (vh * 0.6) - rect.top;
    const progress = Math.max(0, Math.min(1, currentTravel / rect.height));

    lineFill.style.transform = `scaleY(${progress})`;
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```
- Line fill uses `transformOrigin: 'top'`, `transform: 'scaleY(0)'`, and `willChange: 'transform'` to eliminate layout thrashing and maintain 60fps / 120fps smooth scrolling.

### 5.3 Spring Tilt Tactile 4-Card Chassis
Cards utilize high-tension Apple spring physics configured in `src/index.css`:
```css
.vital-tilt-box {
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), 
              box-shadow 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.vital-tilt-box:hover {
  transform: translateY(-6px) rotate(-1deg) scale(1.02);
  box-shadow: 8px 8px 0px 0px #111116 !important;
}
```

### 5.4 Real 3D Z-Axis Bento Pop (`preserve-3d`)
Top-tier project and leadership cards implement multi-plane spatial depth:
```css
.pop-container {
  perspective: 950px;
}
.pop-card {
  transform-style: preserve-3d;
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), 
              box-shadow 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.pop-card:hover {
  transform: translateZ(32px) scale(1.03) rotateX(1deg) rotateY(-2deg);
  box-shadow: 12px 12px 0px 0px #111116 !important;
  z-index: 20;
}
.pop-card:hover .pop-chip   { transform: translateZ(36px); }
.pop-card:hover .pop-title  { transform: translateZ(20px); }
.pop-card:hover .pop-footer { transform: translateZ(12px); }
```

### 5.5 Staggered Entry Reveal on Tab Switches
When switching category tabs (e.g. in Section 4 Workshops or Section 5 Silicon Projects), cards re-enter smoothly via GSAP stagger:
```javascript
gsap.fromTo(
  cardElements,
  { opacity: 0, y: 18 },
  { opacity: 1, y: 0, stagger: 0.05, duration: 0.32, ease: "power2.out" }
);
```

---

## 6. Deep Component Blueprints: Section 1 to Section 11 (F6 to F16)

```
================================================================================
SECTION ARCHITECTURE MAP (TOP TO BOTTOM FLOW)
================================================================================
[ GLOBAL NAVBAR (sticky top-0 z-40) ]
        │ (Direct seamless transition - NO SUBHEADER)
        ▼
[ S1: AboutHero ] ───────────── Asymmetric 12-col Hero, 2.5D Magazine Cover, 6 Vitals
        │
        ▼
[ S2: AboutMarqueeStats ] ────── Intersecting Dual Ribbons (-2° / +1°) + 4 Metric Chips
        │
        ▼
[ S3: AboutLeadership ] ──────── Visionary Leadership Bento + 5-Stage VLSI Model + Faculty
        │
        ▼
[ S4: AboutWorkshops ] ───────── MeitY C2S EDA Labs + 7 Industry Workshops Timeline
        │
        ▼
[ S5: AboutSiliconResearch ] ─── 17 Undergraduate Silicon Research Architectures Bento
        │
        ▼
[ S6: AboutCompetitions ] ────── Flagship Arenas: VELTRAXX '26 & The Lost Silicon
        │
        ▼
[ S7: AboutNationalExposure ] ── National Footprint Continuous Vertical Execution Rail
        │
        ▼
[ S8: AboutHonours ] ─────────── Samsung Fellows, InterviewBot Startup & NPTEL Elite
        │
        ▼
[ S9: AboutBeyondSilicon ] ───── Holistic Excellence: Sports, NCC, Cultural & Clubs
        │
        ▼
[ S10: AboutMagazineVault ] ──── 51-Page Digital Magazine Spread, Vault & Builder Voices
        │
        ▼
[ S11: AboutClosingCta ] ─────── High-Voltage Inquiries & Admissions Conversion Anchor
        │
        ▼
[ GLOBAL FOOTER ]
================================================================================
```

---

### Section 1: Asymmetric Hero Stage & Magazine Portal (F6)
- **Target File**: `src/components/about/AboutHero.jsx`
- **Surface**: Luminous Canvas (`#FAF8F5`) layered with subtle architectural `bg-tech-grid` (`opacity-15`).
- **Layout Architecture**: 12-Column Asymmetric Grid Split:
  - **Left Column (7 cols)**: 
    - Monospace Eyebrow Badge: `bg-[#111116] text-[#FFE500]` with live green pulse dot (`bg-[#B6FF00] animate-pulse`). Text: `ACADEMIC YEAR 2026-2027 // MEITY C2S PROGRAMME · TNEA 2727`.
    - H1 Display Headline: Heavy uppercase typography:
      ```
      ARCHITECTING SILICON.
      EMPOWERING MINDS.
      [FROM LOGIC TO ENTERPRISE]
      ```
    - Thesis Statement: `"The Department of Electronics Engineering (VLSI Design and Technology) at Sri Shakthi Institute of Engineering and Technology delivers end-to-end semiconductor education - bridging algorithmic conception, Cadence/Synopsys EDA physical design, and enterprise-grade hardware fabrication."`
    - Action Cluster: Dual tactile Neo-Brutalist buttons:
      - Primary Action: `bg-[#111116] text-[#FFE500]` -> "Explore 17 Silicon Projects" (smooth scrolls to `#silicon-research`).
      - Magazine Download Action: `bg-[#FFE500] text-[#111116]` -> "Download Magazine (PDF · 51 Pages)" with `Download` icon.
  - **Right Column (5 cols)**:
    - 2.5D Layered Collage Stage:
      - Layer 0: Solar Yellow Wafer Disc (`w-72 h-72 rounded-full bg-[#FFE500] border-4 border-[#111116] shadow-[8px_8px_0px_0px_#111116]`).
      - Layer 1: High-Res Magazine Cover Mockup (`temp_magazine_pages/page_01.jpg` rendered in a crisp 3px carbon frame with `shadow-[10px_10px_0px_0px_#FF2E93]`, tilted `-rotate-3 hover:rotate-0 transition-transform`).
      - Layer 2: Floating chamfer badge: `CHIPS TO STARTUP (C2S) GOVT OF INDIA` (`bg-[#00E5FF] text-[#111116] font-mono text-xs font-black`).
      - Layer 3: Interactive Gallery Trigger: `View 51-Page Publication Spread` (`onClick={() => onOpenGallery(0)}`).
- **Ground Vitals Strip (6 Counters)**:
  Placed directly below the 12-col grid inside a full-width container:
  1. `7` Samsung India Fellows (`shadow-[4px_4px_0px_0px_#0055FF]`)
  2. `17+` RTL-to-GDSII Silicon Projects (`shadow-[4px_4px_0px_0px_#FFE500]`)
  3. `21+` NPTEL Elite & Certified Scholars (`shadow-[4px_4px_0px_0px_#FF2E93]`)
  4. `5+` Commercial EDA Workshops (`shadow-[4px_4px_0px_0px_#B6FF00]`)
  5. `6+` National Symposia & IIT Delegations (`shadow-[4px_4px_0px_0px_#00E5FF]`)
  6. `13+` Sports Medals (8 Gold) (`shadow-[4px_4px_0px_0px_#FFE500]`)

```
+---------------------------------------------------------------------------------------+
| S1: ABOUT HERO (12 COLS ASYMMETRIC)                                                   |
+---------------------------------------------------------+-----------------------------+
| [CHAPTER 01 // DEPT OF EE-VDT · TNEA 2727]             |     (Solar Wafer Disc)      |
|                                                         |          [ #FFE500 ]        |
| ARCHITECTING SILICON.                                   |        +---------------+    |
| EMPOWERING MINDS.                                       |        | 2.5D MAGAZINE |    |
| [FROM LOGIC TO ENTERPRISE]                              |        | COVER MOCKUP  |    |
|                                                         |        | (Page 01)     |    |
| "The Department of Electronics Engineering (VLSI Design |        +---------------+    |
| and Technology) at Sri Shakthi delivers end-to-end      |      [C2S GOVT MEITY BADGE] |
| semiconductor education..."                             |                             |
|                                                         |                             |
| [Explore Silicon Projects]   [Download Magazine (PDF)]  |   [Open 51-Page Viewer]     |
+---------------------------------------------------------+-----------------------------+
| GROUND VITALS: [7 Fellows] [17+ Projects] [21+ NPTEL] [5+ Workshops] [6+ IIT] [13+ Medals] |
+---------------------------------------------------------------------------------------+
```

---

### Section 2: Dual Intersecting Marquees & Departmental Statistics (F7)
- **Target File**: `src/components/about/AboutMarqueeStats.jsx`
- **Surface**: Intersecting high-contrast ribbons breaking the grid.
- **Visual Design**:
  - **Ribbon 1 (Pitch Black Band)**: Tilted `-rotate-2`, background `#0D0D11`, border top/bottom 2px `#FFE500`, continuous marquee text in `#FFE500` and `#FFFFFF`:
    `CHIPS TO STARTUP (C2S) PROGRAMME ★ CADENCE INNOVUS RTL-TO-GDSII ★ SYNOPSYS PRIMETIME STA ★ SAMSUNG INDIA FELLOWSHIP ★ 17 UNDERGRADUATE SILICON DESIGNS ★ 8 SOUTH ZONE SHOOTING GOLDS ★ TNEA COUNSELLING CODE 2727 ★`
  - **Ribbon 2 (Solar Yellow Band)**: Tilted `+rotate-1` intersecting Ribbon 1 with `-mt-3`, background `#FFE500`, border top/bottom 2px `#111116`, reverse marquee text in `#111116`:
    `DR. S. THANGAVELU (CHAIRMAN) ● ER. SHEELAN THANGAVELU (JOINT SEC) ● DR. P. DHILIPKUMAR (HOD) ● 50+ LINUX WORKSTATIONS ● GPDK 90NM ASIC FLOW ● IIT MADRAS DIRV DELEGATION ● INTERVIEWBOT STARTUP ●`
- **High-Voltage Stat Chips (4-Grid)**:
  Positioned immediately below the marquees on Studio Gray (`#F4F4F6`):
  - Chip 1: `50+` Linux Workstations (Cadence & Synopsys EDA Server Cluster).
  - Chip 2: `100%` Hands-On RTL-to-GDSII Physical Design Curriculum.
  - Chip 3: `4` Research Domains (Hardware Security, SNNs, SoC Interconnects, AI Accelerators).
  - Chip 4: `₹0` Round 1 Barrier: 100% Free Hardware Innovation Access.

---

### Section 3: Institutional Vision & Leadership Deck (F8)
- **Target File**: `src/components/about/AboutLeadership.jsx`
- **Surface**: Luminous Canvas (`#FAF8F5`) with Section Header:
  `CHAPTER 02 // INSTITUTIONAL VISION · LEADERSHIP & FACULTY`
- **Interactive Executive Stage**:
  5-Tab Selector (Chairman, Secretary, Joint Secretary, Principal, HOD):
  1. **Dr. S. Thangavelu (Chairman)**:
     - Quote: *"I have a dream - a dream I believe will come true. A dream that my children will one day live in a world where they will not be judged by the colour of their skin, but by the content of their character."* (Dr. Martin Luther King Jr.)
     - Vision: Inspired by Mahatma Gandhi's ideal that an institution should not be walled off, but open to the culture of all lands while holding room for the least among creations. The watchword is to make Sri Shakthi one of India's premier engineering schools recognized globally.
     - Color Plane: Silicon Cobalt (`#0055FF`) accent border and `shadow-[6px_6px_0px_0px_#0055FF]`.
  2. **Er. Deepan Thangavel (Secretary)**:
     - Theme: *"Innovate - Design - Inspire"*.
     - Quote: *"Dream Boldly, Engineer a Smarter, Sustainable Future. The future belongs to those who dare to think differently, question conventions, and transform ideas into meaningful solutions."*
     - Color Plane: Hot Cyber Pink (`#FF2E93`) accent border and `shadow-[6px_6px_0px_0px_#FF2E93]`.
  3. **Er. Sheelan Thangavelu (Joint Secretary)**:
     - Theme: *"Innovation Today, Entrepreneurship Tomorrow: VLSI Technology and Opportunity"*.
     - Triad Maxim:
       - *"An idea becomes an innovation when it works."*
       - *"An innovation becomes an enterprise when it scales."*
       - *"An enterprise becomes a legacy when it transforms communities."*
     - Laboratory Vision: Establishing the Advanced VLSI Research Lab to transition student chip designers from prototype validation to startup enterprise.
     - Color Plane: Neon Logic Lime (`#B6FF00`) accent border and `shadow-[6px_6px_0px_0px_#B6FF00]`.
  4. **Dr. N. M. Saravanakumar (Principal)**:
     - Focus: Commends *The Young Mind's Magazine* as an embodiment of academic rigor and student empowerment in semiconductors powering global computing.
     - Color Plane: Electric Cyan (`#00E5FF`) accent border and `shadow-[6px_6px_0px_0px_#00E5FF]`.
  5. **Dr. P. Dhilipkumar (Associate Professor & HOD)**:
     - Contact Hotline: Mobile: `+91 96295 61731` | Email: `hod-vlsi@siet.ac.in`.
     - Technical Coverage: CMOS device physics, Verilog HDL, SystemVerilog, RTL synthesis, DFT, FPGA prototyping, SoC architecture, RISC-V processors, and hardware security across Cadence, Synopsys, and Siemens EDA.
     - Color Plane: Solar Yellow (`#FFE500`) accent border and `shadow-[6px_6px_0px_0px_#FFE500]`.
- **The 5 Stages of VLSI Innovation (Visual Stepper Card)**:
  Detailed below the executive quote:
  - `01. IDEATION`: Identify real-world computing bottlenecks and formulate hardware solutions.
  - `02. RESEARCH & DESIGN`: Concept study, algorithmic modeling, and Verilog RTL architecture.
  - `03. VALIDATION`: Equivalence checking (LEC), STA timing sign-off, and FPGA prototyping.
  - `04. COMMERCIALIZATION`: Silicon foundry tapeout packaging, DRC/LVS, and industrial transfer.
  - `05. SUSTAINABLE IMPACT`: Transform chip innovation into long-term enterprise value.
- **Core Faculty Roster (4 Assistant Professors)**:
  4-Card Grid (`border-2 border-[#111116] bg-white shadow-[4px_4px_0px_0px_#111116]`):
  1. **Mrs. T. Renita Pearlin**: AP, M.E., Ph.D. Scholar (`+91 96293 93089`) - Digital IC Design & Timing Verification.
  2. **Mrs. P. Prisilla Sophia**: AP, M.E. (`+91 99524 41283`) - Hardware Testing, SoC Architecture, Staff Coordinator for *The Lost Silicon*.
  3. **Mrs. C. Prema**: AP, M.E., Ph.D. Scholar (`+91 99940 93811`) - Semiconductor Devices & Low Power VLSI.
  4. **Mrs. R. Vasanthi**: AP, M.E. (`+91 99423 46426`) - Analog & Mixed-Signal ICs, Verilog HDL.

---

### Section 4: MeitY C2S EDA Labs & Infrastructure (F9)
- **Target File**: `src/components/about/AboutWorkshops.jsx`
- **Surface**: Studio Gray (`#F4F4F6`) with Section Header:
  `CHAPTER 03 // MEITY CHIPS TO STARTUP (C2S) · COMMERCIAL EDA LABS`
- **Infrastructure Banner**:
  - Highlights: 50+ dedicated Linux workstations, high-speed Gigabit LAN, server-side licensing for Cadence (Incisive, Genus, Innovus, Tempus, Modus, Voltus) and Synopsys (Design Compiler, PrimeTime, VCS, Formality).
- **Interactive Chronological Workshops Rail**:
  Continuous 60fps vertical progress line tracking all 7 verified workshops:
  - **W1: Cadence Core Design Training (Flagship Bootcamp)**:
    - *Dates*: 11 - 23 Dec 2025 (12 Days) | *Trainer*: Entuple Technologies Industry Expert.
    - *Scope*: C2S Linux Server, RTL-to-GDSII flow, 20+ laboratory experiments (FIFO, UART, SPI, ALU).
    - *Badge*: Flagship Bootcamp · Solar Yellow (`#FFE500`).
  - **W2: Front-End ASIC Design Workshop**:
    - *Dates*: 05 - 06 Feb 2026 (2 Days) | *Audience*: 50+ Internal & External Participants.
    - *Scope*: Cadence Incisive (Simulation), IMC (Coverage), Genus Synthesis, Formal LEC Verification.
    - *Badge*: Verification Intensive · Electric Cyan (`#00E5FF`).
  - **W3: Synopsys Multi-Tool Industry Exposure**:
    - *Dates*: 16 - 20 Feb 2026 (5 Days) | *Mentors*: 5 Industry Mentors from VLSI Minds.
    - *Scope*: Synopsys Design Compiler (Synthesis), PrimeTime (Static Timing Analysis).
    - *Badge*: Multi-Tool Synthesis · Hot Pink (`#FF2E93`).
  - **W4: Advanced Front-End Workshop @ Kalam Fest**:
    - *Dates*: 12 - 13 March 2026 (2 Days) | *Audience*: 60+ Participants.
    - *Scope*: Industrial verification workflows, SDC constraints, and design rules with Entuple Technologies.
    - *Badge*: Kalam Fest Arena · Neon Lime (`#B6FF00`).
  - **W5: Back-End Physical Design Workshop**:
    - *Dates*: 12 - 13 June 2026 (2 Days) | *Audience*: 50+ Participants.
    - *Scope*: GPDK 90nm library, Cadence Innovus floorplanning, Tempus STA Sign-off, Modus DFT.
    - *Badge*: Physical Sign-off · Silicon Cobalt (`#0055FF`).
  - **W6: On-Campus Chip Design Using Cadence Tool Chain**:
    - *Dates*: 18 - 22 July 2026 (5 Days) | *Cohort*: 21 Second-Year Department Students.
    - *Scope*: Full RTL-to-GDSII flow on C2S Server.
    - *Verified 21-Student Roster*: Lavanya A.M, Dhanya S.S, Rithanya R, Jasmitha P.S, Sasmitha S.P, Hari Priya M, Jothika P, Melvin Joby, Praneet G, Sraen S.M, Sarvesh B, Sruthish S, Sheik Kather Asif P, Baranivel K, Ragul Alagarsamy, Hemachandran, Sanjay Durai M.S, Vijay Kathirvel K, Elam Saravanan G, Surya Raj V, Ritheeshwar S.
    - *Interactive Feature*: Collapsible Roster drawer (`[+ View 21 Verified Student Delegates]`).
  - **W7: One-Credit Course: VLSI Front-End Design Using Synopsys**:
    - *Dates*: 23 - 24 Oct 2026 (2 Days) | *Cohort*: 23 Second-Year Department Students + External Colleges.
    - *Scope*: Synopsys Design Compiler & VCS simulation.
    - *Verified 23-Student Roster*: Divakar O, Abineevesh S, Anurag R, Selvamani M, Dhilip R, Akshaya R, Kathiresan K, Dharun Prasanna R, Mithun R.N, Abdus Salaam M, Janarthanan V, Nitin Saravanan, Selina B, Monika P, Nishanth S, Jeevanandham B, Pravin S, Harish K, Dhanush R, Prathiksha, Nasrin Banu B, Shreyesh G, Hare Krishnan M.
    - *Interactive Feature*: Collapsible Roster drawer (`[+ View 23 Verified Student Delegates]`).

---

### Section 5: The 17 Undergraduate Silicon Research Projects (F10)
- **Target File**: `src/components/about/AboutSiliconResearch.jsx`
- **Surface**: Luminous Canvas (`#FAF8F5`) with Section Header:
  `CHAPTER 04 // UNDERGRADUATE SILICON RESEARCH · 17 ASIC ARCHITECTURES`
- **Domain Filter Pills**:
  `ALL (17)` · `HARDWARE SECURITY & DFT (4)` · `AI & NEUROMORPHIC (5)` · `SOC & INTERCONNECTS (4)` · `VISION & SMART SYSTEMS (4)`
- **Asymmetric Bento Architecture**:
  The 17 projects are organized with high-impact hero cards for flagship designs (LBIST, CAN, SNN, SoC) spanning 7 cols or 2 rows, paired with standard cards spanning 5 cols:
  - Top colored domain strips:
    - Security & DFT: Hot Cyber Pink (`#FF2E93`)
    - AI & Neuromorphic: Solar Yellow (`#FFE500`)
    - SoC & Interconnects: Electric Cyan (`#00E5FF`)
    - Vision & Smart Systems: Neon Logic Lime (`#B6FF00`)
- **Full Inventory of the 17 Grounded Projects**:
  1. **P01: Logic Built-In Self-Test (LBIST) Dual-MISR ALU Verification**
     - *Author*: Dharshan R.A (III Year) | *Domain*: Hardware Security & DFT
     - *EDA Specs*: Verilog RTL, Cadence Genus, Formal LEC, GPDK 90nm
     - *Abstract*: Autonomous self-testing ALU integrating an LFSR test-pattern generator and dual Multiple Input Signature Registers (MISRs) separating odd and even cycles. Synthesized with Cadence Genus and verified via Equivalence Checking (LEC).
  2. **P02: Self-Testing, Fault-Tolerant 12-Module CAN Controller**
     - *Author*: Kavya M (III Year) | *Domain*: Hardware Security & DFT
     - *EDA Specs*: Verilog RTL, Cadence irun, Innovus 90nm
     - *Abstract*: LFSR/MISR BIST engine with Triple Modular Redundancy (TMR) on error-management logic to detect internal silicon faults during power-on self-test. Validated across bit, stuff, CRC, and acknowledge error injection.
  3. **P03: Neuromorphic Computing & Spiking Neural Networks (SNNs)**
     - *Author*: Sasmitha S.P (III Year) | *Domain*: AI & Neuromorphic
     - *EDA Specs*: Mixed-Signal VLSI, Leaky Integrate-and-Fire (LIF)
     - *Abstract*: Brain-inspired silicon architecture implementing LIF neuron models for ultra-low power event-driven edge intelligence. Presented at IEEE CAS Kerala outreach workshop.
  4. **P04: Hierarchical Intelligent SoC with Systolic-Array AI Accelerator & DDR3**
     - *Author*: Subiksha L (III Year) | *Domain*: SoC, NoC & Interconnects
     - *EDA Specs*: Cadence Incisive, Genus, Innovus
     - *Abstract*: Scalable heterogeneous System-on-Chip integrating custom systolic processing elements, matrix-multiply units, and DDR3 memory controller interface for on-device edge inferencing.
  5. **P05: First-Order Boolean-Masked Circuit for DPA Side-Channel Resistance**
     - *Author*: Raghul Vasun V.T (III Year) | *Domain*: Hardware Security & DFT
     - *EDA Specs*: SystemVerilog, Domain-Oriented Masking
     - *Abstract*: Cryptographic silicon countermeasure against Differential Power Analysis (DPA). Incorporates first-order Boolean masking across logic gates with negligible power penalty.
  6. **P06: Side-Channel Resistant Dual-Mode Post-Quantum Cryptography (PQC) Coprocessor**
     - *Author*: Manova M (III Year) | *Domain*: Hardware Security & DFT
     - *EDA Specs*: Masked Butterfly NTT, PQC Hardware
     - *Abstract*: Hardware coprocessor supporting lattice-based cryptography with masked Number Theoretic Transform (NTT) butterfly units, protecting against physical power analysis side-channel attacks.
  7. **P07: Low-Power MFCC-Based Voice Recognition Hardware Accelerator**
     - *Author*: Soorya Velaa P (III Year) | *Domain*: AI & Neuromorphic
     - *EDA Specs*: Verilog HDL, Cadence RTL-to-GDSII
     - *Abstract*: Dedicated ASIC accelerator computing Mel-Frequency Cepstral Coefficients (MFCC) for real-time speech feature extraction under strict microwatt power envelopes.
  8. **P08: Automated Attendance Monitoring System Using Perl**
     - *Author*: Kiruthika S (III Year) | *Domain*: Vision, Automation & Smart Systems
     - *EDA Specs*: Perl Scripting, EDA Automation, Unix Ops
     - *Abstract*: Automated EDA workflow automation and reporting system leveraging Perl scripts to track student lab engagement and simulation tool runtimes across the C2S server network.
  9. **P09: Sobel Edge Detection ASIC Hardware Accelerator**
     - *Author*: Miruthula S (III Year) | *Domain*: Vision, Automation & Smart Systems
     - *EDA Specs*: Verilog HDL, ASIC Synthesis, STA Timing
     - *Abstract*: 2D spatial convolution accelerator with 3x3 kernel sliding window buffer, computing gradient magnitudes in real-time for video frame preprocessing at full line-rate.
  10. **P10: PPA-Optimized Hardware Accelerator for Real-Time Agricultural Drone Imagery**
      - *Author*: Pugazhendhi S (III Year) | *Domain*: Vision, Automation & Smart Systems
      - *EDA Specs*: Verilog RTL, Cadence Genus, Innovus PPA
      - *Abstract*: PPA-optimized image processing pipeline for multispectral crop health classification mounted on drone payloads, balancing silicon area, latency, and battery drain.
  11. **P11: Distributed SRAM-Bank MAC Units: Near-Memory Accelerator for Climate Inference**
      - *Author*: Suman S (III Year) | *Domain*: AI & Neuromorphic
      - *EDA Specs*: Near-Memory Compute, SRAM Distributed
      - *Abstract*: High-throughput multiply-accumulate (MAC) array distributed across physical SRAM memory banks to circumvent the von Neumann memory bottleneck in environmental simulation workloads.
  12. **P12: Ultra-Low Power SNN-Based Vision Wake-Up System**
      - *Author*: Mukilan R (III Year) | *Domain*: AI & Neuromorphic
      - *EDA Specs*: Spike Encoding, LIF Neurons, Smart Camera
      - *Abstract*: Sub-milliwatt visual sensor wake-up circuit that triggers primary SoC processors only upon detecting valid biological motion profiles using temporal spike trains.
  13. **P13: RISC-V Based Adaptive Precision (8/16/32-bit) AI Accelerator**
      - *Author*: Sakthishree D (III Year) | *Domain*: AI & Neuromorphic
      - *EDA Specs*: 32-Bit RISC-V, AMBA APB, Cadence Xcelium
      - *Abstract*: Custom RV32I extension with runtime-configurable SIMD ALUs executing 8-bit, 16-bit, and 32-bit arithmetic dynamically based on neural network layer quantization profiles.
  14. **P14: Configurable Dual-Clock Asynchronous FIFO with Gray-Code Pointers**
      - *Author*: P. Sheik Kather Asif (II Year) | *Domain*: SoC, NoC & Interconnects
      - *EDA Specs*: CDC Clock Domain, Gray Code, 2-Flip-Flop Sync
      - *Abstract*: Metastability-hardened clock domain crossing (CDC) FIFO architecture utilizing multi-bit Gray code pointers to ensure glitch-free data transfer between asynchronous clock regimes.
  15. **P15: SDC-GUARD: Silent Data Corruption Detection & Recovery in 5-Port NoC Routers**
      - *Author*: Ragul Alagarsamy P (II Year) | *Domain*: SoC, NoC & Interconnects
      - *EDA Specs*: Network-on-Chip, XY Routing, Hamming SEC-DED
      - *Abstract*: 5-port on-chip interconnect router featuring parity-checked virtual channels and hardware retransmission logic to eliminate silent data corruption in multi-core SoCs.
  16. **P16: QUIC Transport Protocol Hardware/System Study for Low-Latency HTTP/3**
      - *Author*: Jasmithaa P.S (II Year) | *Domain*: SoC, NoC & Interconnects
      - *EDA Specs*: UDP / QUIC, TLS 1.3, Zero Head-of-Line Blocking
      - *Abstract*: Hardware-assisted packet parser and connection-state tracking module designed to reduce CPU interrupt overhead in line-rate QUIC transport processing for HTTP/3 servers.
  17. **P17: NFC Smart Safety Car & Driver Monitoring System**
      - *Author*: Durkesh I (Lead), Vaishnavi S, Sujitha N.S, Daniel Pranishan A (I Year Team) | *Domain*: Vision, Automation & Smart Systems
      - *EDA Specs*: NFC Security, Driver Telemetry, Embedded Safety
      - *Abstract*: First-year embedded hardware prototype integrating driver RFID/NFC authentication with continuous biometric telemetry and automated emergency alerting.

---

### Section 6: Flagship Competitive Arenas (F11)
- **Target File**: `src/components/about/AboutCompetitions.jsx`
- **Surface**: High-voltage split battleground:
  - Left Stage: Pitch Black Chassis (`#0D0D11`) for VELTRAXX '26.
  - Right Stage: Solar Yellow Chassis (`#FFE500`) for The Lost Silicon.
- **Section Header**:
  `CHAPTER 05 // COMPETITIVE ARENAS · VELTRAXX HACKATHON & THE LOST SILICON`
- **Side-by-Side Arena Comparison Specs**:
  - **Arena 1: VELTRAXX '26 (1.0): 24-Hour Hardware & VLSI Hackathon**:
    - *Dates*: 28 - 29 August 2026 | *Format*: 24 Hours Non-Stop Sprint.
    - *Team Size*: 4 Members per team.
    - *Venue*: VLSI Research Lab, Sri Shakthi Institute of Engineering and Technology, Coimbatore.
    - *4 Technical Pillars*:
      1. RTL Design using Verilog/SystemVerilog
      2. FPGA Implementation and Testing
      3. ASIC Design and RTL-to-GDSII Flow
      4. Hardware Debugging and Optimization
    - *Motto*: `"Building Tomorrow, One Chip at a Time. 24 Hours. 4 Minds. One Challenge. Infinite Possibilities."`
    - *Badge*: `LIVE HACKATHON ARENA` (`bg-[#FF2E93] text-white`).
  - **Arena 2: THE LOST SILICON: Technical Quiz & Circuit Debugging Challenge**:
    - *Date*: 12 March 2026 | *Venue*: SIET Campus, LH 46.
    - *Organizers*: TECKTORS & Department of ECE & EE - VLSI Design and Technology.
    - *Staff Coordinator*: Mrs. P. Prisilla Sophia (AP / VLSI).
    - *Student Coordinator*: Subiksha L (III Year VLSI).
    - *3 Progressive Gauntlet Rounds*:
      - *Round 1: Boolean Logic* (Fundamentals and logical reasoning).
      - *Round 2: Circuit Challenge* (Combinational and sequential circuits).
      - *Round 3: Debugging Arena* (Error identification, circuit decoding, and logic recovery).
    - *Motto*: `"Find the logic. Unlock the silicon. Your logic is your greatest weapon."`
    - *Badge*: `HARDWARE DEBUGGING ARENA` (`bg-[#111116] text-[#FFE500]`).

---

### Section 7: National Delegations & Conclaves Rail (F12)
- **Target File**: `src/components/about/AboutNationalExposure.jsx`
- **Surface**: Studio Neutral (`#F4F4F6`) with central vertical execution rail (`border-l-2 border-[#111116]`).
- **Section Header**:
  `CHAPTER 06 // NATIONAL FOOTPRINT · IIT DELEGATIONS & RESEARCH CONCLAVES`
- **Continuous Milestones Timeline**:
  1. **SEMICON India 2026 (New Delhi)**:
     - *Dates*: 17 - 19 Sept 2026 | *Venue*: Yashobhoomi, New Delhi.
     - *Delegation*: Department student delegation engaging directly with global commercial semiconductor foundries, packaging facilities, and the India Semiconductor Mission (ISM).
     - *Node Badge*: `NATIONAL CONCLAVE` (`bg-[#00E5FF]`).
  2. **30th International Symposium on VLSI Design & Test (VDAT 2026)**:
     - *Venue*: Jaypee Institute of Information Technology (JIIT), Noida, India.
     - *9 Student Delegates*: Suman S, Sriram M R, Srivatsan P, Ajaikumar G, Rethika S, Kavya M, Udhaya R, Prithika P, Nithikannan J S.
     - *Focus*: VLSI testing, DFT architectures, and IEEE networking.
     - *Node Badge*: `IEEE SYMPOSIUM` (`bg-[#FF2E93]`).
  3. **3rd Digital India RISC-V (DIRV) Symposium**:
     - *Dates*: 1 - 2 August 2026 | *Venue*: IIT Madras, Chennai.
     - *26 Student Delegates*: Baranivel K, Perarasan S, Mohammed Abrar, Dhilip R, Sraen S.M, Divakar O, Haripriya M, Hemachandran P, Indhuja J, Janarthanan V, Sathya K, Monika P, Gokulharikrishnan V, Akshya R, Surya Dharshini S, Selina B, Jasmi S, Sarvesh B, Selvamani M, Kathiresan K, Melvin Joby, Nishanth S, Pravin S, Ritheeswar S, Shakthivel M.S, Sundharesh M.
     - *Focus*: DIRV SHAKTI and VEGA open-source processor ecosystems.
     - *Node Badge*: `RISC-V ADVANCEMENT` (`bg-[#B6FF00]`).
  4. **IEEE CAS Neuromorphic VLSI Outreach Workshop (Adi Shankara, Kerala)**:
     - *Delegation*: 8 Students (Varsha VR, Monika M, Sasmitha SP, Subiksha L, Sri Ram MR, Tharun M, Manova M, Sanjeev G H).
     - *Podium Sweep*:
       - Varsha V.R: **1st Place** (Brain-Inspired Circuit Design Challenge)
       - Monika M: **2nd Place** (VLSI Quiz)
       - Sasmitha S.P: **3rd Place** (Paper Presentation)
       - Subiksha L: **3rd Place** (Innovation Showcase)
     - *Node Badge*: `PODIUM SWEEP (4 WINS)` (`bg-[#FFE500]`).
  5. **Semiconductor & Manufacturing Workshop (IIT Tirupati)**:
     - *5 Student Delegates*: Tharun M, Gokul P, Sanjeev G.H, Tharun R.M, Sankames V.S (with Subiksha L & Kavya M in RISC-V track).
     - *Focus*: SPICE Online, Virtual Labs, Tinkercad circuit simulation, wafer fab cleanroom processes.
  6. **QUANTUM PRO '26 (PSG Centenary Govt. College, Coimbatore)**:
     - *Dates*: 21 - 23 Sept 2026 | *Focus*: 3-Day hands-on quantum computing workshop (qubits, quantum logic gates, circuit simulation).
  7. **MATLAB Engineering Workshop (PSG College of Technology, Coimbatore)**:
     - *Dates*: 10 - 11 Oct 2026 | *5 Student Delegates*: Baranivel K, Jasmithaa P.S, Sasmitha S.P, Kathiresan K, Ragul Alagarsamy P.
     - *Focus*: Scientific computing, signal modeling, and hardware algorithm simulation.

---

### Section 8: Fellowships, Startups & Honors (F13)
- **Target File**: `src/components/about/AboutHonours.jsx`
- **Surface**: Luminous Canvas (`#FAF8F5`) with Section Header:
  `CHAPTER 07 // FELLOWSHIPS, STARTUPS & ACADEMIC HONOURS`
- **Triptych Architecture**:
  1. **The Samsung India Fellowship Programme**:
     - *Overview*: 7 Third-Year VLSI Students competitively selected for Samsung India Fellowship focusing on advanced semiconductor physics, CMOS scaling, and TCAD numerical modeling.
     - *7 Samsung Fellows Roster*:
       1. Ashwin S
       2. Mukilan S
       3. Rethika S
       4. Suman S
       5. Sri Ram M.R
       6. Sakthishree D
       7. Sasmitha S.P
     - *Card Styling*: Silicon Cobalt accent (`#0055FF`), 3px solid black border, `shadow-[6px_6px_0px_0px_#0055FF]`.
  2. **Student Startup Founder Spotlight: InterviewBot**:
     - *Founder*: Mr. Kavieshwara M (2028 Batch, Electronics Engineering - VLSI Design and Technology).
     - *Role*: Product Developer & AI Engineer.
     - *Platform*: **InterviewBot** (AI-driven interview simulation and automated technical evaluation platform).
     - *Impact*: Deployed across academic institutions to train engineering candidates through simulated corporate interview environments.
     - *Card Styling*: Solar Yellow accent (`#FFE500`), 3px solid black border, `shadow-[6px_6px_0px_0px_#FFE500]`.
  3. **AI-ML Hackathon Laureates & NPTEL Elite Roll of Honour**:
     - *AI-ML Hackathon*: Special Mention Award for project **Roleup** (Agentic AI career guidance system) won by Dharun Prasanna R, Jeevanandham B, Sundaresh M (22-23 July 2026).
     - *NPTEL Elite Achievers (VLSI Interconnects)*:
       - Nithikannan J S (III Year) - Elite
       - Sakthishree D (III Year) - Elite
       - Harish R (II Year) - Elite
     - *Certified Scholars*: 9 Third-Year scholars (Thirumurugan S, Ajaikumar G, Srivatsan P, Kavya M, Sakthishree D, Sri Ram M.R, Suman S, Monika M, Nithikannan J S) and 9 Second-Year scholars (Elamsaravanan G, Janarthanan V, Sasmitha S.P, Mithun R.N, Harish K, Indhuja J, Akshaya R, Gowtham P, Sheik Kather Asif P).

---

### Section 9: Holistic Excellence Beyond Silicon (F14)
- **Target File**: `src/components/about/AboutBeyondSilicon.jsx`
- **Surface**: Studio Neutral (`#F4F4F6`) with Section Header:
  `CHAPTER 08 // HOLISTIC EXCELLENCE · SPORTS, NCC, ARTS & STUDENT CLUBS`
- **Interactive Quad-Switch Selector**:
  `SPORTS CHAMPIONS (6)` · `NCC CADETS (7)` · `CULTURAL & ARTS (6)` · `STUDENT CLUBS (3)`
- **Detailed Grounded Content Across Tabs**:
  1. **Tab 1: Sports Champions**:
     - **Abirami S.A (II Year)**: National & Zonal Pistol Shooter with **13+ Medals (8 Gold, 4 Silver, 1 Bronze)** across XVII South Zone Shooting Championship 2026, Tamil Nadu State Championship, and District Tournaments. Quote: *"Every target is a step closer to a stronger version of myself."*
     - **Nitin K.R**: Dual-Sport Athlete. Basketball (Centre) & Netball (Goal Attack). Secured Form-3 National Certificate at Anna University South Zone Netball (Bhopal), 2nd Place State Championship (Coimbatore), 3rd Place Anna University Zonal (PSG Tech).
     - **Kamalesh V.K**: 3-Time Kho-Kho Champion. 1st Place Anna University Zonal across 3 consecutive years (2024-2025, 2025-2026, 2026-2027 at CIT); 2nd Place Silver at Inter-Zone (Paavai College).
     - **Sanjey Krishna V**: Track & Field Thrower. Silver Medal Hammer Throw (Coimbatore Track Fest 2026), Bronze Medal Discus Throw (Zone IX).
     - **Jithin Rio R**: Badminton Player. 3rd Place Bronze Medal, Anna University Zonal 2026-2027 (PSG Tech).
     - **K. Vijay Kathirvel**: Martial Artist (Karate). 1st Place Gold Medal at State Level Championship (Udumalpet), 3rd Place Bronze Inter-Zone (Oddanchatram).
  2. **Tab 2: National Cadet Corps (NCC) Cadets**:
     - **CUO Yogesh S**: Republic Day Camp (RDC) - Training II (Completed 5 preparation camps).
     - **SGT Sanjey Krishna V**: Republic Day Camp (RDC) (Completed 3 camps).
     - **CPL Soorya Vela P**: Republic Day Camp (RDC) (Completed 2 camps).
     - **LCPL Ragul Prasath S**: Army Attachment Camp with 4/8 Gorkha Rifles, Bangalore.
     - **Cadet Pratiksha S.S**: Annual Training Camp - 2 (4 TN BN NCC).
     - **Cadet Jasmithaa P.S & Cadet Surya Dharshini S**: Defence Workshop at Kumaraguru College of Technology.
  3. **Tab 3: Cultural Champions & Art Corner**:
     - **The Illusion Crew (Dancers Harini K.S & Winston Churchil)**: 1st Place Winners at IIT Palakkad, KCT Fest, Rathinam College Fest 2025, Emerging Thrissur Sargam 2025, Vel Tech Fest, Dangemx Yagnadhurva; Runners-Up at IIT Madras and NIT Trichy.
     - **Art Corner Student Artists**:
       - Suryadharshini S (*Divine Grace* - ink/pencil illustration)
       - Sophia Charles (*Strength Within* & *Pure Happiness*)
       - R. Devasree (*Let Life Bloom*)
       - Haripriya M (*Dream Create Be You*)
       - Sanjay Durai M S (Creative visual design sketches).
  4. **Tab 4: Departmental Student Governance & Clubs**:
     - **Digital Marketing Club**: Coordinators: Pugazhendhi S, Nithikannan J S, Suman S. Members: Melvin Joby, Adithyaa V, Sraen S.M, Sruthish S, Sarvesh B, Haripriya M.
     - **Innovation Club**: Coordinators: Sasmitha S.P, Ashwin S. 20+ active student members.
     - **Extracurricular Club**: Coordinators: Kavya M, Subhashini N, Thirumurugan S, Mukilan R.

---

### Section 10: Departmental Magazine Vault & Archives (F15)
- **Target File**: `src/components/about/AboutMagazineVault.jsx`
- **Surface**: Luminous Canvas (`#FAF8F5`) with Section Header:
  `CHAPTER 09 // DEPARTMENTAL PUBLICATION VAULT · 51-PAGE MAGAZINE SPREAD`
- **Interactive Magazine Showcase**:
  - Full metadata card: *The Young Mind's Magazine (AY 2026-2027)*, Published by Department of Electronics Engineering (VLSI Design and Technology), Sri Shakthi Institute of Engineering and Technology (Counselling Code: 2727).
  - Editorial Board Spotlight:
    - Editorial Heads: Baranivel K, Adithyaa V.
    - Technical Members: Harekrishnan M, Sakthivel M.S, Divakar O, Kathiresan K.
    - Non-Technical Members: Sarvesh G, Sathya K, Akshaya R, Ritheeswar S.
  - Multi-File Download Station:
    - Primary Card: `Collage vlsi magazine.pdf` (Complete 51 Pages · 28.4 MB) -> Direct download trigger.
    - Secondary Card: 17 Silicon Research Compendium (Summary Sheet).
    - Tertiary Card: MeitY C2S EDA Labs User Manual.
- **The 9 Authentic Student Builder Testimonials**:
  Displayed in an asymmetric 3-column masonry grid:
  1. *Dharshan R.A (3rd Year · LBIST Architect)*: "Cadence Innovus and Genus are not just software on a screen here. We run actual physical design flows, analyze floorplans, and understand silicon timing down to picoseconds."
  2. *Kavya M (3rd Year · CAN Controller Architect)*: "Building the 12-module CAN controller taught me that silicon reliability is everything. The department provides access to commercial tools from the very first year."
  3. *Sasmitha S.P (3rd Year · Samsung Fellow)*: "Our research in Spiking Neural Networks won accolades at IEEE CAS Kerala. The C2S lab gave us the freedom to innovate beyond textbooks."
  4. *Subiksha L (3rd Year · SoC Design Lead)*: "Synthesizing a complete SoC with custom systolic AI accelerators and DDR3 controller opened my eyes to how modern mobile processors are architected."
  5. *Manova M (3rd Year · PQC Hardware Developer)*: "The side-channel resistance project helped me master masked butterfly NTT cryptographic circuits. Hardware security is the future, and we build it here."
  6. *Sri Ram M.R (3rd Year · Samsung Fellow)*: "Being selected as a Samsung India Fellow was a dream. The rigorous device physics and EDA training here directly prepared us for top-tier semiconductor careers."
  7. *Sheik Kather Asif P (2nd Year · Digital Systems Builder)*: "Implementing clock domain crossing with Gray-code asynchronous FIFOs taught me how real chips handle multi-gigahertz clock boundaries without metastability."
  8. *Abirami S.A (2nd Year · National Pistol Shooter)*: "Winning medals in South Zone shooting while maintaining my VLSI design coursework proved that Sri Shakthi supports complete excellence in every arena."
  9. *Kavieshwara M (2nd Year · Founder of InterviewBot)*: "Founding InterviewBot while studying VLSI gave me the technical confidence to build scalable products. The department fosters true innovation and entrepreneurship."

---

### Section 11: Closing Call to Action & Departmental Inquiries (F16)
- **Target File**: `src/components/about/AboutClosingCta.jsx`
- **Surface**: High-Voltage Obsidian Deep Chassis (`#0D0D11`), bordered by 3px solid `#111116`, with radiant Solar Yellow (`#FFE500/15`) and Hot Cyber Pink (`#FF2E93/20`) ambient spotlights.
- **Section Header**:
  `CHAPTER 10 // CONNECT WITH VLSI DESIGN & TECHNOLOGY · JOIN THE REVOLUTION`
- **Component Layout & Elements**:
  - H2 Bold Closing Headline:
    ```
    READY TO ARCHITECT SILICON?
    FROM RTL TO TAPE-OUT, YOUR JOURNEY STARTS HERE.
    ```
  - Direct Institutional Contact Cards (3-Col Grid):
    1. **Head of Department**:
       - Name: Dr. P. Dhilipkumar, Associate Professor & HOD
       - Phone: `+91 96295 61731`
       - Email: `hod-vlsi@siet.ac.in`
       - Office: Advanced VLSI Research Lab, Sri Shakthi Tech Park, Coimbatore.
    2. **TNEA Admissions Hotline**:
       - Counselling Code: **2727**
       - Department: Electronics Engineering (VLSI Design and Technology) [EE-VDT]
       - Campus: Sri Shakthi Tech Park, L&T Bypass, Chinniyampalayam Post, Coimbatore - 641062.
    3. **Hackathon & Research Coordination**:
       - Student Coordinators: R.A. Dharshan (`+91 97513 40838`) & M. Kavya (`+91 94430 65492`)
       - Flagship Event: VELTRAXX '26 Hackathon & C2S Lab Inquiries.
  - Conversion Buttons:
    - Primary CTA: `bg-[#FF2E93] text-white shadow-[5px_5px_0px_0px_#FFE500]` -> "Register for VELTRAXX '26 (100% Free)" (links to `/register`).
    - Secondary CTA: `bg-[#FFE500] text-[#111116] shadow-[5px_5px_0px_0px_#FFFFFF]` -> "Schedule a C2S Lab Visit" (`mailto:hod-vlsi@siet.ac.in?subject=C2S%20Lab%20Visit%20Inquiry`).
- **Seamless Footer Transition**:
  Connects smoothly to `src/components/Footer.jsx` without visual seams or extraneous padding.

---

## 7. Content Integrity, Source Traceability & Zero Em-Dash Enforcement (F17)

### 7.1 Source Mapping Matrix
Every single factual statement, name, credential, metric, and quote planned in this document is anchored directly in the 51-page official publication *The Young Mind's Magazine*:

| Content Entity | Source in Magazine | Page Number | Verification Artifact |
| :--- | :--- | :--- | :--- |
| **Institution & Counselling Code** | Cover & Page 1 | Page 1 | `temp_magazine_pages/page_01.jpg` |
| **Dr. S. Thangavelu (Chairman)** | Page 2 | Page 2 | `temp_magazine_pages/page_02.jpg` |
| **Er. Deepan Thangavel (Secretary)** | Page 3 | Page 3 | `temp_magazine_pages/page_03.jpg` |
| **Er. Sheelan Thangavelu (Joint Sec)**| Page 4 | Page 4 | `temp_magazine_pages/page_04.jpg` |
| **Dr. N.M. Saravanakumar (Principal)**| Page 5 | Page 5 | `temp_magazine_pages/page_05.jpg` |
| **Dr. P. Dhilipkumar & 4 AP Faculty** | Page 6 | Page 6 | `temp_magazine_pages/page_06.jpg` |
| **17 Silicon Projects (P01 to P17)** | Pages 8 to 17 | Pages 8-17 | `temp_magazine_pages/page_08.jpg` - `page_17.jpg` |
| **7 Commercial EDA Workshops** | Pages 19 to 22 | Pages 19-22 | `temp_magazine_pages/page_19.jpg` - `page_22.jpg` |
| **The Lost Silicon Challenge** | Page 23 | Page 23 | `temp_magazine_pages/page_23.jpg` |
| **VELTRAXX '26 24H Hackathon** | Page 24 | Page 24 | `temp_magazine_pages/page_24.jpg` |
| **SEMICON India 2026 Delegation** | Page 26 | Page 26 | `temp_magazine_pages/page_26.jpg` |
| **QUANTUM PRO '26 PSG Workshop** | Page 27 | Page 27 | `temp_magazine_pages/page_27.jpg` |
| **3rd DIRV Symposium (IIT Madras)** | Page 28 | Page 28 | `temp_magazine_pages/page_28.jpg` |
| **IIT Tirupati Manufacturing Workshop**| Page 29 | Page 29 | `temp_magazine_pages/page_29.jpg` |
| **MATLAB Workshop (PSG Tech)** | Page 30 | Page 30 | `temp_magazine_pages/page_30.jpg` |
| **IEEE CAS Kerala (Podium Sweep)** | Page 31 | Page 31 | `temp_magazine_pages/page_31.jpg` |
| **InterviewBot (Kavieshwara M)** | Page 33 | Page 33 | `temp_magazine_pages/page_33.jpg` |
| **30th VDAT Symposium (JIIT Noida)** | Page 34 | Page 34 | `temp_magazine_pages/page_34.jpg` |
| **7 Samsung India Fellows** | Page 35 | Page 35 | `temp_magazine_pages/page_35.jpg` |
| **NPTEL Interconnects Scholars** | Pages 36 to 38 | Pages 36-38 | `temp_magazine_pages/page_36.jpg` - `page_38.jpg` |
| **AI-ML Hackathon: Roleup** | Page 39 | Page 39 | `temp_magazine_pages/page_39.jpg` |
| **Sports Champions (Abirami et al.)**| Pages 40 to 45 | Pages 40-45 | `temp_magazine_pages/page_40.jpg` - `page_45.jpg` |
| **The Illusion Crew (Harini & Winston)**| Page 46 | Page 46 | `temp_magazine_pages/page_46.jpg` |
| **NCC Cadets (CUO Yogesh S et al.)** | Pages 47 to 48 | Pages 47-48 | `temp_magazine_pages/page_47.jpg` - `page_48.jpg` |
| **Art Corner Student Artists** | Page 49 | Page 49 | `temp_magazine_pages/page_49.jpg` |
| **Student Governance & Clubs** | Page 50 | Page 50 | `temp_magazine_pages/page_50.jpg` |
| **Magazine Editorial Board** | Page 51 | Page 51 | `temp_magazine_pages/page_51.jpg` |

### 7.2 Zero Hallucination Guarantee
- **No Dummy Stakeholders**: Every person mentioned (60+ students, faculty, athletes, cadets) is verified in the official magazine.
- **No Fabricated Sections**: No arbitrary "Sponsors", "Mentors", or "Advisory Council" placeholder sections.
- **Strict Privacy Compliance**: Student personal phone numbers, residential addresses, and university roll numbers are omitted. Only official departmental leadership and public coordinator hotlines are published.

### 7.3 Complete Zero Em-Dash Resolution Catalog
Under User Global Rules and `AGENTS.md` Anti-Slop Directive, **em-dashes (Unicode U+2014) are completely banned in visible UI copy**. The table below documents the resolution of all 39 em-dash occurrences detected in raw magazine OCR, replacing each with a standard hyphen `-`, colons `:`, parentheses `()`, or a rephrased sentence:

| # | Source Page | Raw Magazine Context (with em-dash) | Corrected UI Phrasing (Standard Hyphen `-` / Clean Sentence) |
| :-: | :--- | :--- | :--- |
| 1 | Page 2 | `'I have a dream' [em-dash] a dream I believe will come true.` | `'I have a dream' - a dream I believe will come true.` |
| 2-3 | Page 2 | `tolerance [em-dash] to create an equal society... colour [em-dash] was best` | `tolerance - to create an equal society with no discrimination in caste, creed or colour - was best` |
| 4-7 | Page 4 | `stages: o [em-dash] Ideate ... o Validation [em-dash] Verify` | `01. Ideation - Identify real-world problems. 02. Research & Design - Develop architecture. 03. Validation - Simulation & FPGA prototyping. 04. Commercialization - Market & packaging. 05. Sustainable Impact - Long-term enterprise value.` |
| 8-9 | Page 5 | `EE - VLSI DESIGN & TECHNOLOGY [em-dash] Dr.N.M.saravanakumar` | `EE - VLSI Design and Technology: Dr. N.M. Saravanakumar, Principal.` |
| 10 | Page 6 | `Dr. P. Dhilipkumar [em-dash] Head Of the Department` | `Dr. P. Dhilipkumar, Associate Professor & Head of the Department` |
| 11 | Page 9 | `NEUROMORPHIC COMPUTING [em-dash] Building Next Gen` | `Neuromorphic Computing: Building the Next Generation of Intelligent Hardware` |
| 12-13 | Page 15 | `five error checks [em-dash] bit, stuff, CRC, form and ack [em-dash] but` | `five error checks (bit, stuff, CRC, form, and acknowledgement), but these detect only communication-level faults` |
| 14 | Page 16 | `communication reliability and hardware cost. [em-dash] Ragul` | `communication reliability and hardware cost. - Ragul Alagarsamy P.` |
| 15 | Page 16 | `secure, low-latency web applications. [em-dash] Jasmithaa PS` | `secure, low-latency web applications. - Jasmithaa P.S` |
| 16-17 | Page 17 | `Driver Safety [em-dash] COLLEGE MAGAZINE ARTICLE ... EE-VDT [em-dash] First` | `Driver Safety: College Magazine Article. Department: EE-VDT - First Year` |
| 18 | Page 19 | `connections [em-dash] every interconnect brings innovation` | `connections: every interconnect brings innovation closer.` |
| 19-20 | Page 22 | `ONE CREDIT COURSE [em-dash] From circuits to careers [em-dash] industry` | `One-Credit Course: From circuits to careers - industry tools turn ideas into innovation.` |
| 21-22 | Page 23 | `ECE & EE [em-dash] VLSI Design ... THE LOST SILICON [em-dash] YOUR LOGIC` | `ECE & EE - VLSI Design. The Lost Silicon: Your logic is your greatest weapon.` |
| 23 | Page 24 | `Department of EE [em-dash] VLSI Design & Technology` | `Department of EE - VLSI Design & Technology` |
| 24 | Page 29 | `Department of EE [em-dash] VLSI Design & Technology` | `Department of EE - VLSI Design & Technology` |
| 25-27 | Page 31 | `Monika M [em-dash] 2nd Place • Sasmitha SP [em-dash] 3rd Place` | `Monika M: 2nd Place (VLSI Quiz); Sasmitha S.P: 3rd Place (Paper Presentation); Tharun M: Participation; Manova M: Participation` |
| 28-30 | Page 33 | `MR. KAVIESHWARA M 2028 Batch [em-dash] Electronics ... AI platform [em-dash]` | `Mr. Kavieshwara M (2028 Batch, Electronics Engineering - VLSI). Through his AI interview platform, InterviewBot, he is... AI Interview Platform: InterviewBot` |
| 31 | Page 36 | `connections [em-dash] every interconnect brings innovation` | `connections: every interconnect brings innovation closer.` |
| 32 | Page 40 | `Abirami S. A, Department Of EE [em-dash] VIYr` | `Abirami S.A, Department of EE - VDT (II Year)` |
| 33 | Page 41 | `BASKETBALL [em-dash] CENTRE NETBALL - GOAL ATTACK` | `Basketball: Centre / Netball: Goal Attack (GA)` |
| 34-37 | Page 42 | `Kho Kho Event 2024 [em-dash] 2025 (CIT) [em-dash] 1st ... 2025-2026` | `Kho Kho Event 2024 - 2025 (CIT Coimbatore): 1st Place. Inter Zone 2024 - 2025 (Paavai College): 2nd Place. Zonal 2025 - 2026: 1st Place. Zonal 2026 - 2027: 1st Place.` |
| 38 | Page 44 | `Badminton [em-dash] Men's Team Third Place` | `Badminton: Men's Team Third Place` |
| 39 | Page 47 | `Annual Training Camp [em-dash] 2, conducted by 4 TN BN NCC.` | `Participated in an Annual Training Camp - 2, conducted by 4 TN BN NCC.` |

*(Result: All copy in the redesign will use standard hyphens `-`, colons `:`, parentheses `()`, or rephrased clauses, guaranteeing zero literal em-dashes across the entire codebase.)*

---

## 8. Implementation Roadmap & Scope Isolation Checklist (F18)

### 8.1 Phased Execution Roadmap for Implementation Phase
When implementation begins in subsequent milestones, workers will follow this phased execution path:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      IMPLEMENTATION ROADMAP                            │
├────────────────────────────────────────────────────────────────────────┤
│ PHASE 1: DATA LAYER & SCAFFOLDING                                      │
│ • Create `src/data/aboutData.js` extracting verified data objects:     │
│   - `leadershipData`, `facultyData`, `innovationStages`                │
│   - `workshopsData` (7 workshops with verified rosters)                │
│   - `siliconProjectsData` (17 projects with tools and abstracts)       │
│   - `eventsData` (VELTRAXX '26 & The Lost Silicon)                     │
│   - `nationalExposureData` (7 delegations and conclaves)               │
│   - `honoursData` (Samsung Fellows, InterviewBot, NPTEL)               │
│   - `beyondSiliconData` (Sports, NCC, Illusion Crew, Clubs)            │
│   - `builderQuotesData` (9 student builder quotes)                     │
│   - `galleryItemsData` (High-res magazine page extractions)            │
│ • Scaffolding directory: `src/components/about/`                       │
├────────────────────────────────────────────────────────────────────────┤
│ PHASE 2: COMPONENT CREATION (11 MODULAR COMPONENTS)                    │
│ • Build `AboutHero.jsx` (S1) with 2.5D cover and 6 vitals              │
│ • Build `AboutMarqueeStats.jsx` (S2) with intersecting ribbons         │
│ • Build `AboutLeadership.jsx` (S3) with 5-tab executive bento          │
│ • Build `AboutWorkshops.jsx` (S4) with 60fps vertical execution rail   │
│ • Build `AboutSiliconResearch.jsx` (S5) with 17-project asymmetric bento│
│ • Build `AboutCompetitions.jsx` (S6) with split battleground arenas    │
│ • Build `AboutNationalExposure.jsx` (S7) with dynamic timeline nodes   │
│ • Build `AboutHonours.jsx` (S8) with Samsung Fellows & InterviewBot    │
│ • Build `AboutBeyondSilicon.jsx` (S9) with quad-switch tab             │
│ • Build `AboutMagazineVault.jsx` (S10) with 51-page PDF vault & quotes │
│ • Build `AboutClosingCta.jsx` (S11) with HOD hotline & registration CTA│
│ • Build `AboutLightbox.jsx` (Accessible modal viewer)                  │
├────────────────────────────────────────────────────────────────────────┤
│ PHASE 3: `AboutPage.jsx` ORCHESTRATOR REFACTORING                      │
│ • Replace 2,101-line monolith with clean ~65-line coordinator          │
│ • Verify complete removal of sticky subheader pill bar (lines 463-500) │
│ • Verify removal of nested `<main>` element (line 501)                 │
│ • Verify removal of unused imports and dead state                      │
├────────────────────────────────────────────────────────────────────────┤
│ PHASE 4: VERIFICATION & AUDIT GATES                                    │
│ • Run `npm run build` via `run_command` (Must pass with 0 errors)      │
│ • Run Em-Dash Audit: `grep -r "\u2014" src/components/about/ src/data/` │
│ • Verify mobile responsiveness on 375px, 768px, 1024px, 1440px         │
│ • Confirm zero modifications to `src/pages/HomePage.jsx` & others     │
└────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Scope Boundary & Immutability Checklist
- [x] **Exclusively Owned File Boundary**: During the planning milestone, ONLY `docs/about/REDESIGN_PLAN.md` is authored. No source code files in `src/pages/*` or `src/components/*` are altered.
- [x] **Home Page Protection**: `src/pages/HomePage.jsx` and its child components are strictly read-only references; they will never be modified.
- [x] **Build Integrity Check**: `npm run build` must be executed to verify workspace stability.
- [x] **Zero Fabrication Gate**: All planned content strictly references verified source pages in `Collage vlsi magazine.pdf` and `docs/about/CONTENT_MAP.md`.
- [x] **Zero Em-Dashes Gate**: All visible copy strictly bans em-dashes (U+2014) in favor of standard hyphens `-` or restructured sentences.
