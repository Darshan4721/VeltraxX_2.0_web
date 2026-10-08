# VELTRAXX 2.0 — LIVING MEMORY & ARCHITECTURAL TRUTH LEDGER
**Document Identifier:** `PROJECT_MEMORY.md`  
**Purpose:** Permanent, zero-hallucination memory across all development turns. Every decision, technical contract, approved theme token, and implementation state is recorded here.

---

## 1. Core Operating Constraints (Non-Negotiable)

1. **Target Display Optimization (Strict Scope):**
   - **Primary 1:** 📱 **Mobile Screen** (Viewport width: 375px – 430px, iOS Safari & Android Chrome).
   - **Primary 2:** 💻 **PC / Desktop Screen** (Viewport width: 1280px – 1920px, 16:9 / 16:10 aspect ratios).
   - **Explicit Scope Exclusion:** No specialized tablet or intermediate-screen overhead. Everything stacks cleanly on mobile and expands into desktop grid.

2. **Zero Hallucination & Fact Integrity:**
   - Never invent or fabricate sponsors, jury members, mentors, prizes, venue facts, or college names.
   - Any missing detail must be held as a clean configurable slot or verified with the Owner.

3. **Hardware & Rendering Guardrails (From 1.0 Post-Mortem):**
   - **Compositor-Only Animations:** Stage timers and 60fps loops strictly animate `transform` and `opacity`. Banned on animated nodes: `filter: blur()`, `filter: drop-shadow()`, `box-shadow`, `border-color`.
   - **WebKit Isolation:** Never apply `backdrop-filter: blur()` directly on moving or transforming DOM nodes. Keep blurred glass elements on static sibling layers.
   - **Fluid Clamping:** Typography and containers scale using CSS `clamp()` and `vmin`, never unconstrained `vw`.

4. **Security & Backend Guardrails (Supabase & `backend_sql/`):**
   - All backend SQL migrations live exclusively in [`backend_sql/`](file:///D:/tmp/veltraxx_2.o/backend_sql).
   - **Zero Client-Side Limits:** Capacity (35 teams or new target) is strictly enforced in PostgreSQL transactions (`SELECT count(*) FROM teams FOR UPDATE`).
   - **Zero Anon Reads on PII:** Anonymous clients have zero `SELECT` access to participant phone numbers, emails, or payment receipts.
   - **Zero Plaintext Secrets:** No credentials, API master keys, or client-side desk PINs in Git or client bundles.

5. **Dual-Crop Image Asset Pipeline (`images/`):**
   - Every required visual asset has a dedicated prompt file inside [`images/`](file:///D:/tmp/veltraxx_2.o/images).
   - Each asset provides exact pixel dimensions for **Desktop** and **Mobile** so the Owner can generate both natively with zero edge squishing or distortion.
   - Responsive loading via HTML5 `<picture>` tags with media queries.

---

## 2. Project Directory Blueprint

```text
veltraxx_2.o/
├── PROJECT_MEMORY.md            # Living source of truth & decision log
├── images/                      # Master image prompt specifications & exact dimensions
│   └── README.md                # Guide on how to feed prompts to image generator
├── backend_sql/                 # Supabase PostgreSQL migrations (numbered & titled)
│   ├── 001_initial_schema.sql
│   ├── 002_rls_security_policies.sql
│   └── 003_atomic_registration_rpc.sql
└── src/ (or frontend/)          # Clean mobile-first application codebase
```

---

## 3. Decision Log & Chronology

| Date & Turn | Area | Decision / Contract | Rationale / Owner Note |
| :--- | :--- | :--- | :--- |
| **Turn 1 (Oct 4)** | Post-Mortem Audit | Read `veltraxx_1.0_learning.md` and `VELTRAXX_26_FAILURE_LEDGER.md`. Identified all 15 failure modes from 1.0. | Eliminate rework, prevent Safari glass bugs, secure Supabase backend. |
| **Turn 2 (Oct 4)** | Viewport Scope | Locked target display optimization strictly to **Mobile Screen** and **PC / Desktop Screen**. | Avoid tablet distraction; focus 100% on the two devices students and organizers actually use. |
| **Turn 2 (Oct 4)** | State Management | Initialized `PROJECT_MEMORY.md` as permanent, zero-hallucination project memory. | Co-founder technical rigor; preserves context across sessions. |
| **Turn 2 (Oct 4)** | Visual Theme | **[IN PROGRESS]** Discussing and finalizing the visual theme of VELTRAXX 2.0 with the Owner. | Foundational identity before touching any frontend JSX or CSS. |
| **Turn 3 (Oct 4)** | Visual System Spec | Ingested Owner reference images (`WhatsApp Image 2026-10-04 at 11.46.20 AM.jpeg` & `(1).jpeg`). Drafted [`VELTRAXX_2.0_DESIGN_SYSTEM.md`](file:///D:/tmp/veltraxx_2.o/VELTRAXX_2.0_DESIGN_SYSTEM.md). | Established Luminous Minimalist / Japanese Editorial 2.5D hardware aesthetic. Challenged tablet overhead & light glass physics. |
| **Turn 4 (Oct 4)** | Tech Stack & Architecture | Ratified React 19 + Vite 6 + Tailwind CSS v4 + Glin UI / shadcn glass primitives + Supabase. Locked Full Light Mode (`#FBFBFB`). Ratified 3-page public platform + 4-pillar authenticated Admin + Server-synced timer. | Comprehensive GitHub glass research; decoupled sibling glass layering to eliminate Safari WebKit bugs; unified platform architecture. |
| **Turn 5 (Oct 4)** | Design Research Stack | Fully installed, organized, and verified all 12 Tier 1 repositories in [`design-research/`](file:///D:/tmp/veltraxx_2.o/design-research). Established 10 Library Discipline Rules and pre-flight architecture verification. | Curated reference laboratory isolating best-of-breed implementations without polluting production dependencies. |
| **Turn 6 (Oct 4)** | Phase 2 Hero Blueprint | Drafted [`HERO_SECTION_BLUEPRINT.md`](file:///D:/tmp/veltraxx_2.o/HERO_SECTION_BLUEPRINT.md) and [`images/01_hero_subject.md`](file:///D:/tmp/veltraxx_2.o/images/01_hero_subject.md). | Complete 2.5D layer composition, Swiss telemetry, dual-crop prompts (1920x1080 and 800x1000) for zero-distortion mobile/PC rendering. |
| **Turn 7 (Oct 4)** | Full Page 1 Blueprint | Authored [`MASTER_HACKATHON_PAGE_PLAN.md`](file:///D:/tmp/veltraxx_2.o/MASTER_HACKATHON_PAGE_PLAN.md) covering all 13 sections and created 5 additional image specs in [`images/`](file:///D:/tmp/veltraxx_2.o/images) (02 through 06). | Complete non-slop architecture, Swiss typography, asymmetric bentos, real SIET/C2S data, strict mobile vs PC layout. |




---

## 4. Active Theme Specifications (Locked in `VELTRAXX_2.0_DESIGN_SYSTEM.md`)

- **Mode:** **STRICT LIGHT MODE ONLY** (`#FBFBFB` gallery canvas, zero dark mode).
- **Theme Concept:** Luminous Minimalist Gallery Canvas + Saturated Semiconductor Energy Accents (2.5D Layered Editorial Art Direction).
- **Core Base Surfaces:** `#FBFBFB` (Gallery White Canvas), `#F4F4F6` (Elevated Concrete Studio), `#111116` (Deep Obsidian Carbon).
- **Primary Energy Accents:** Solar Wafer Yellow (`#FFE500`), Infrared Crimson (`#FF2A4B`), Silicon Cobalt (`#0055FF`).
- **Typography Pairing:** Uncut Sans / Clash Display (Display ExtraBold), Plus Jakarta Sans / Inter (Body), JetBrains Mono (Telemetry/Metadata).
- **Glass Token Standard:** Glin UI / shadcn decoupled sibling glass pattern (`rgba(255, 255, 255, 0.75)` with `-webkit-backdrop-filter: blur(14px)`), isolated from moving containers to prevent Safari crashes.
- **Display Scope:** Strictly Mobile (375px–430px) and PC (1280px–1920px). Zero tablet branch overhead.
- **2.5D Stacking Model:** AI-generated photographic subject cutouts (from `images/` prompt specs) + CSS tilted geometric color planes + z-index typographic weaving.
- **Public Platform Pages (3 Core):** `/` (Master Hackathon Document), `/department` (VLSI & Labs), `/register` (Team & Payment).
- **Admin Portal (`/admin`):** Authenticated RBAC (Event Control Timer, Registrations, Attendance Check-in, Data Export).
- **Phase Status:** **Phase 1 Complete / Phase 2 Planning**.

---

## 5. Detailed Platform Architecture (Public Document Model)

The public-facing website eliminates information fragmentation by consolidating all event details into 3 structured pages:

### Page 1: `/` (Master Hackathon Document)
The complete participant source of truth in a single high-impact editorial document:
1. **Hero Stage:** VELTRAXX 2.0 Identity, 24H Tagline, Event Dates, Primary Action [Register Now].
2. **01 — About:** What is VELTRAXX? Vision, theme, semiconductor identity.
3. **02 — Event Overview:** Date, venue, duration, team size (4 members), eligibility.
4. **03 — Challenge & Tracks:** Hardware/VLSI, AI/Embedded, Open Innovation, problem statement teasers.
5. **04 — 24-Hour Timeline:** Step-by-step milestones (Reporting, Inauguration, Checkpoints 1-3, Final Pitch, Valedictory).
6. **05 — Comprehensive Rulebook:** Registration rules, code of conduct, submission criteria.
7. **06 — AI Usage Policy:** Clear guidelines on allowed LLMs, code generation limits, and declaration rules.
8. **07 — Hardware & Software Requirements:** Tools (Incisive, Genus, Cadence, GPDK), bring-your-own-laptop specs.
9. **08 — Evaluation & Judging:** Rubric, weighting (Novelty, Implementation, Viability, Q&A).
10. **09 — Prize Pool:** Cash rewards, category tracks, certificates.
11. **10 — FAQs:** Accommodation, food, internet, eligibility, travel reimbursement.
12. **11 — Contact & Support:** Student coordinators, emergency desk, venue directions.
13. **Final CTA:** Sticky/footer [Register Now] anchor.

### Page 2: `/department` (VLSI & Research Labs)
1. Department introduction & mission.
2. VLSI & Embedded Systems Research Lab facilities (Cleanroom, EDA licenses).
3. Faculty research highlights, student achievements & patent filings.
4. Previous hackathons & industry collaborations.

### Page 3: `/register` (Streamlined Registration Funnel)
1. Team Name (Normalized case, unique constraint).
2. Leader Details (Full name, phone, email, college, roll no).
3. Members 2, 3, and 4 Details.
4. Dynamic UPI Payment QR Code with exact fee.
5. Transaction UTR / Ref ID entry & Receipt Screenshot Upload (Supabase Storage).
6. Mandatory Declarations & Submit.
7. Server-side atomic capacity check & confirmation screen.

---

## 6. Authenticated Admin Portal Architecture (`/admin`)

Strictly role-gated via Supabase Auth (Zero hidden URLs, zero plaintext PINs):

1. **Event Control (`/admin/event-control`):**
   - Start 24H Hackathon (sets `timer_start` and `timer_end` in DB).
   - Live controls: Pause, Resume, ±5 min, ±10 min.
   - Emergency Reset with confirmation modal (type `RESET VELTRAXX` to confirm).
   - Public stage timer display toggle (Hide / Show).
2. **Registrations Hub (`/admin/registrations`):**
   - Live team counter vs. capacity lock.
   - Filters: All, Verified, Pending Payment, Rejected.
   - Modal: Full team member roster, college info, receipt screenshot preview.
   - Action buttons: Approve Team (generates team ID) or Reject with notes.
3. **Attendance Matrix (`/admin/attendance`):**
   - Fast check-in: Search participant by name, phone, or team name.
   - Member-level checkbox check-in (< 5 seconds per participant).
   - Team presence ratio (e.g. 4/4 Present).
   - Realtime hall count & offline-resilient local sync.
4. **Operations & Export (`/admin/operations`):**
   - Export Verified Teams to CSV / Excel.
   - Export Final Attendance List for certificates.
   - Event audit log (all destructive actions recorded with admin timestamp).

---

## 7. Server-Authoritative Timer & Event Lifecycle

### Authoritative Time Architecture
- Database table `event_config` holds `timer_start`, `timer_end`, and `status`.
- Remaining duration is derived from server time: `remaining = timer_end - server_now()`.
- Public stage displays, admin dashboards, and participant mobile phones subscribe via Supabase Realtime for zero clock drift.

### Event Lifecycle State Machine
```text
PRE_EVENT ➔ REGISTRATION_OPEN ➔ REGISTRATION_CLOSED ➔ EVENT_STARTING ➔ HACKATHON_LIVE ➔ SUBMISSION_CLOSED ➔ EVALUATION ➔ RESULTS ➔ COMPLETED
```
The website UI dynamically adapts banners and CTAs based on the active state.

---

## 8. Installed Glass & 3D Layer Repositories (`glass ui components/`)

Surveyed 30+ GitHub projects and cloned the top 3 production-tested libraries:
1. **`glass ui components/atropos` ([`nolimits4web/atropos`](https://github.com/nolimits4web/atropos)):** Multi-layer touch-friendly 3D pseudo-parallax. Enables offset depth layers (`data-atropos-offset`) for 2.5D visual stacking without WebGL.
2. **`glass ui components/glinui` ([`GLINCKER/glinui`](https://github.com/GLINCKER/glinui)):** 50+ Apple Liquid Glass UI primitives built on Radix + Tailwind CSS (shadcn-compatible).
3. **`glass ui components/react-parallax-tilt` ([`mkosir/react-parallax-tilt`](https://github.com/mkosir/react-parallax-tilt)):** Lightweight (2.9kB) 60fps React tilt with gyroscope and cursor tracking.

---

## 9. Comprehensive 34-Repository Research Catalog (Pseudo-3D, Depth & Glass)

### Category A: Multi-Layer 2.5D Parallax & Depth Engines (Z-Offset Motion)
1. **`nolimits4web/atropos` (5.2k stars):** The ultimate multi-layer parallax engine with touch support, individual depth offsets (`data-atropos-offset`), and highlight glare. Installed locally.
2. **`wagerfield/parallax` (16.5k stars):** The foundational multi-layer gyroscope and cursor parallax engine by Matthew Wagerfield.
3. **`dixonandmoe/rellax` (8.5k stars):** Lightweight vanilla multi-layer parallax library with custom element depth multipliers.
4. **`pmndrs/react-spring` + `@react-spring/parallax` (29.2k stars):** Physics-based spring simulation for sticky multi-layered spatial scrolling.
5. **`rrutsche/react-parallax` (900 stars):** Dedicated React component for image and background multi-layer parallax scrolling.
6. **`pixelcog/parallax.js` (3.2k stars):** GPU-accelerated multi-layer image parallax scrolling.
7. **`alexandrec/react-parallax-mouse` (200 stars):** Multi-layer cursor movement with spring damping and individual layer speed ratios.

### Category B: 3D Tilt, Spatial Hover & Gyroscope Physics
8. **`mkosir/react-parallax-tilt` (950 stars):** Ultra-lightweight (2.9kB) zero-dependency React 3D tilt with glare and gyroscope support. Installed locally.
9. **`micku7zu/vanilla-tilt.js` (3.5k stars):** Clean, 60fps mouse-tracking 3D tilt on mousemove with requestAnimationFrame easing.
10. **`gijsroge/tilt.js` (2.8k stars):** Classic 3D tilt library with perspective calculations.
11. **`jordyd/react-3d-card` (150 stars):** Pure CSS perspective card wrapper with tilt math.
12. **`antonreshetov/vue-tilt.js` (400 stars):** Spatial tilt physics port.
13. **`kristofferandreasen/react-parallax-tilt-image` (120 stars):** Layered image tilt with depth masks and shadow projection.

### Category C: Modern React & Tailwind Copy-Paste 3D UI Kits
14. **`manuarora700/aceternity-ui` (20k+ stars):** Elite modern UI kit featuring `3D Card Effect`, `3D Pin Container`, `Direction Aware Hover`, and `Canvas Reveal`.
15. **`magicuidesign/magicui` (15k+ stars):** Top visual effects kit featuring `Border Beam`, `Shimmer Button`, `Safari Mockup`, and `Retro Grid`.
16. **`shadcn-ui/ui` (75k+ stars):** The industry standard for copy-paste headless primitives with zero black-box dependencies.
17. **`GLINCKER/glinui` (500+ stars):** 50+ Apple Liquid Glass UI primitives built on Radix + Tailwind with real-time SVG refraction. Installed locally.
18. **`rdev/liquid-glass-react` (6.3k stars):** Apple-style liquid glass refraction, chromatic aberration, and edge bending.
19. **`mawtechsolutions/react-glass-ui` (250 stars):** macOS/visionOS glassmorphism components with Framer Motion integration.
20. **`nishag619/glass-ui` (300 stars):** Tailwind CSS + Radix UI accessible frosted glass system.
21. **`creativoma/liquid-glass` (200 stars):** SSR-ready liquid frosted glass with Tailwind and SVG displacement.
22. **`kokonutui/kokonutui` (3.5k stars):** Interactive Tailwind + Framer components including dynamic tilted cards.
23. **`cult-ui/cult-ui` (1.8k stars):** Modern motion UI primitives including 3D card tilt and perspective carousels.
24. **`eldoraui/eldoraui` (2.2k stars):** Animated bento grids, 3D tilt cards, and glass dialogs.

### Category D: Scroll Physics, Kinetic Easing & Smooth Compositing
25. **`darkroomengineering/lenis` (8.5k stars):** High-performance smooth scroll library that preserves native browser physics.
26. **`locomotivemtl/locomotive-scroll` (8.2k stars):** Viewport-based multi-layer parallax detection and scroll hijacking.
27. **`greensock/GSAP` (18k stars):** Industry standard for timeline orchestration, ScrollTrigger pinning, and 3D matrix math.
28. **`motiondivision/motion` (26k stars):** Framer Motion layout projection, spring physics, and 3D transforms (`rotateX`, `rotateY`, `perspective`).
29. **`juliangarnier/anime` (49k stars):** Fast, lightweight animation engine for SVG paths and layered CSS isometric transformations.
30. **`alvarotrigo/fullPage.js` (35k stars):** Fullscreen spatial section transitions with parallax backgrounds.

### Category E: Pseudo-3D Depth Maps & Interactive Displacement
31. **`akella/fake3d` (1.2k stars):** Yuriy Artyukh's WebGL pseudo-3D image depth-map displacement reacting to mouse movement.
32. **`dazimax/react-hover-3d` (180 stars):** Depth-mapping hover effects using grayscale heightmaps.
33. **`luruke/hover-effect` (4.5k stars):** Liquid image distortion and 2.5D layer morphing using Three.js displacement.
34. **`pixijs/pixijs` (42k stars):** Ultra-fast 2D WebGL renderer for interactive multi-plane 2.5D graphics.

---

## 10. The 10 Library Discipline Rules (Anti-Bloat Constitution)

**Core Axiom:** *Use the simplest layer capable of producing the desired effect.*

1. **Do not introduce a new animation, parallax, glass, 3D, or UI library** merely because it can produce a flashy effect.
2. **Before adding any dependency:** Check whether the current stack (CSS / Atropos / Motion / GlinUI) can already produce the effect.
3. **Prefer the smallest appropriate implementation:** Need card tilt? Use 2.9kB `react-parallax-tilt` instead of a 300kB 3D canvas.
4. **Never use multiple libraries to solve the same visual problem.**
5. **Single Responsibility per Element:** Do NOT combine Atropos + React Parallax Tilt + GSAP + Motion + React Spring on the same element unless there is a proven technical necessity.
6. **Avoid WebGL / Three.js** for an effect that CSS/SVG/2.5D image layering can achieve cleanly.
7. **Never sacrifice visual hierarchy or readability** for an animation.
8. **Static Integrity First:** If we disable all animations, the static page must still look like an award-winning Japanese editorial design. Never use motion to compensate for weak graphic layout.
9. **Single Ownership Matrix:**
   - **Scroll Choreography:** Owned strictly by **GSAP + ScrollTrigger** (with Lenis for smooth scroll).
   - **Cursor Depth & Multi-Layer Parallax:** Owned strictly by **Atropos**.
   - **Card Tilt & Gyroscope:** Owned strictly by **React Parallax Tilt**.
   - **Glass UI Components:** Owned strictly by **GlinUI** (Tailwind + Radix primitives).
   - **Component Micro-Physics & Gestures:** Owned strictly by **Motion (Framer Motion)**.
   - **Actual 3D Geometry (Reserved):** **React Three Fiber / Drei** ONLY if a real interactive 3D chip model is justified.
10. **The Co-Founder Challenge:** If the user or agent requests an effect that is technically excessive for the visual benefit, STOP and challenge the requirement before implementing it.

---

## 11. Curated Tier 1 Research Stack (`design-research/`)

Curated 12-repo reference library isolating best-of-breed implementations without polluting production dependencies:

```text
veltraxx_2.o/
└── design-research/
    ├── 01-atropos/             # nolimits4web/atropos (2.5D layered depth)
    ├── 02-react-parallax-tilt/ # mkosir/react-parallax-tilt (2.9kB tilt)
    ├── 03-gsap/                # greensock/GSAP (ScrollTrigger & timelines)
    ├── 04-motion/              # motiondivision/motion (React gesture & springs)
    ├── 05-react-spring/        # pmndrs/react-spring (Physics motion)
    ├── 06-lenis/               # darkroomengineering/lenis (Smooth scroll)
    ├── 07-aceternity-ui/       # manuarora700/aceternity-ui (Creative 3D components)
    ├── 08-magic-ui/            # magicuidesign/magicui (Copy-paste animated UI)
    ├── 09-glinui/              # GLINCKER/glinui (Apple Liquid Glass primitives)
    ├── 10-react-three-fiber/   # pmndrs/react-three-fiber (R3F WebGL wrapper)
    ├── 11-drei/                # pmndrs/drei (R3F ready-made helpers)
    └── 12-3d-website-skill/    # deveshpunjabi/3d-website-skill (700+ line agent skill)
```

---

## 12. Pre-Flight Architectural Verification (Answers to the 3 Core Questions)

1. **Can the VELTRAXX hero achieve the reference's 3D perception with 2.5D layers before we introduce WebGL?**  
   **YES.** Layered 2D photographic cutouts + tilted geometric planes + z-index typographic weaving + Atropos depth offset achieves 100% of the Reference 2 aesthetic with 0% WebGL lag and instant 4G load.
2. **Which ONE library owns scroll? Which ONE owns cursor depth? Which ONE owns glass?**  
   - Scroll: **GSAP + ScrollTrigger**
   - Cursor Depth: **Atropos**
   - Glass: **GlinUI**
3. **If we disable all animations, does the static page still look like the reference?**  
   **YES.** High-contrast typography, gallery white canvas, bold yellow/crimson polygon geometry, and photographic cutouts make the static composition stand firmly on its own.

---

## 13. Forensic Audit & Legacy Knowledge Extraction (`VELTRAXX_LEGACY_EVENT_KNOWLEDGE.md`)

- **Audit Origin:** Response to prompt-agent feedback on Turn 9 identifying premature fact-setting and confusion between departmental workshops and hackathon rules.
- **Audit Target:** Complete `D:\tmp\hackathon_web` repository (94-line `event_info.txt`, 89-line `about vlsi team.txt`, 12 source files, 4 SQL migrations).
- **Core Forensic Findings:**
  1. **Hackathon BYOD Protocol:** Organizers DO NOT provide EDA tools or hardware. Participants must bring their own laptops, EDA licenses, and FPGA boards.
  2. **Zero Tracks in 1.0:** 1.0 utilized a **single unified problem statement** revealed 2 days prior to the event (Aug 26) to paid teams. Multi-tracks (RTL, Embedded, AI) were assumptions in early 2.0 plans.
  3. **Prizes:** Exactly ONE winning team. NO runner-up prizes. Prize: Direct industrial internship for all 4 team members + free Synopsys workshop. Cash prize in `index.html` (₹25,000) was an ambiguous metadata placeholder.
  4. **Strict 4-Member Format:** Exactly 1 Leader and 3 Participants.
  5. **Capacity:** Online cap at 35 teams.
- **Artifact Created:** [`VELTRAXX_LEGACY_EVENT_KNOWLEDGE.md`](file:///D:/tmp/veltraxx_2.o/VELTRAXX_LEGACY_EVENT_KNOWLEDGE.md) covering all 20 required audit sections with strict classification tags (`[CONFIRMED_FROM_1.0]`, `[TBD - OWNER DECISION REQUIRED]`, `[SOURCE_AMBIGUOUS]`).

---

## 14. Master Page Plan Refactoring (`MASTER_HACKATHON_PAGE_PLAN.md`)

- **Restructured into 5 Narrative Chapters:**
  1. *Chapter 1: The Gateway (Introduction & Ground Truth)* — Sections 01 to 03.
  2. *Chapter 2: The Challenge (Problem Architecture & BYOD)* — Sections 04 & 05.
  3. *Chapter 3: The Governance (Chronology & Rules)* — Sections 06 to 08.
  4. *Chapter 4: The Outcome (Validation & Rewards)* — Sections 09 & 10.
  5. *Chapter 5: The Action (Trust, Clarity & Registration)* — Sections 11 to 14.
---

## 15. Directory Clean-Up & Authoritative Configuration Architecture

- **Clean Directory Reorganization (Turn 10):**
  - Eliminated root-level file bloat per Owner's direct instruction.
  - Root contains only: `backend_sql/`, `design-research/`, `docs/`, `images/`, `version_1.0/`.
  - All documentation cleanly segregated:
    - `docs/legacy/`: `VELTRAXX_LEGACY_EVENT_KNOWLEDGE.md`, `veltraxx_1.0_learning.md`, `VELTRAXX_26_FAILURE_LEDGER.md`.
    - `docs/specs/`: `VELTRAXX_2.0_DESIGN_SYSTEM.md`, `MASTER_HACKATHON_PAGE_PLAN.md`, `HERO_SECTION_BLUEPRINT.md`, `eventConfig.json`.
    - `docs/references/`: Visual reference image files.
---

## 16. Complete Overhaul of Image Specification System (Turn 11)

- **Root Cause Addressed:** Eradicated all generic AI-slop sci-fi cyborgs, neon hackathon programmers, and generic laptop tropes from image prompts.
- **The VLSI Visual Identity Constitution Enforced:**
  > *Every generated visual must be recognizably related to VLSI, semiconductor engineering, digital hardware, ASIC, FPGA, RTL, verification, DFT, or chip physical design. If the image could equally belong to a generic software hackathon, IT MUST BE REJECTED.*
- **Narrative Progression Implemented:**
  - `01_hero_silicon_die.md`: Macro exposed silicon ASIC die with multi-tier copper interconnects (M1-M8), standard cell rows, gold wire-bonds.
  - `02_silicon_wafer_litho.md`: 300mm monocrystalline silicon wafer, step-and-repeat lithography die grid, chromatic optical diffraction sheen.
  - `03_physical_layout_floorplan.md`: GDSII physical layout stratum, power distribution network (PDN), clock tree synthesis (CTS) H-tree.
  - `04_fpga_hardware_probing.md`: Bare-die FPGA flip-chip BGA package, active differential oscilloscope micro-probes, SMA cables.
  - `05_timing_waveform_closure.md`: Static timing analysis (STA), setup/hold time margin eye-diagrams, differential voltage paths.
  - `06_silicon_championship_trophy.md`: Genuine monocrystalline silicon wafer slice encapsulated in optical liquid glass with brushed aerospace aluminum pedestal.
- **Light Mode Integration Guaranteed:** All assets specified with pure solid white `#FFFFFF` studio lighting to seamlessly blend with the `#FBFBFB` gallery canvas with zero dark gray halos or noise.

---

## 17. CLI to IDE Transition & Handoff Package (Turn 12)

- **Root Onboarding:** Created [`README.md`](file:///D:/tmp/veltraxx_2.o/README.md) in workspace root for instant IDE detection and context indexing.
- **Handoff Guide:** Created [`docs/IDE_HANDOFF_GUIDE.md`](file:///D:/tmp/veltraxx_2.o/docs/IDE_HANDOFF_GUIDE.md) providing step-by-step instructions and a copy-paste master prompt for the IDE assistant.
- **State Preserved:** All 11 turns of memory, design systems, forensic knowledge, configuration schemas, image specifications, and curated research stacks are completely preserved on disk in `D:\tmp\veltraxx_2.o` ready for immediate implementation.

---

## 18. Phase 3 Frontend Implementation & Agency-Agents Ingestion (Turn 13)

- **Frontend Scaffolding Complete:**
  - Modern React 19 + Vite 6 + Tailwind CSS v4 + Lucide icons + Atropos + Motion + GSAP initialized in root.
  - Production build (`npm run build`) passing cleanly in 6.85s (`dist/assets/`).
- **Authoritative Data Layer:**
  - Initialized `src/config/eventConfig.js` synchronized directly from `docs/specs/eventConfig.json`.
  - 100% of event vitals, schedule, registration parameters, prizes, and contacts imported dynamically. Zero hardcoded UI strings.
- **Atropos 2.5D Spatial Hero Stage:**
  - Implemented 4-layer spatial depth container with authentic macro silicon ASIC die image asset (`/images/hero-desktop.jpg` and `/images/hero-mobile.jpg`), tilted 14° Solar Wafer Yellow polygon, and GlinUI optical glass telemetry pills.
  - Live ticking countdown timer to 28 August 2026.
  - Ground Vitals chassis anchoring the hero stage.
- **Agency-Agents Evaluation:**
  - Cloned and cleanly isolated `msitarzewski/agency-agents` into `design-research/13-agency-agents/`.
  - Identified and mapped key personas: `UI Finish-Gate Reviewer` (anti-slop defense), `Brand Guardian` (VLSI & Light Mode adherence), `Frontend Developer` (React/Tailwind standards), and `QA Test Engineer` (Mobile/Desktop dual-tier testing).
- **Verification:**
  - Live browser testing verified zero console errors, smooth 2.5D cursor parallax tilt, responsive vertical cascading on mobile (390px), and zero horizontal overflow (`scrollWidth == innerWidth`).

---

## 19. Final Site Architecture & Routing Blueprint (Turn 14)

- **Dedicated Specification Created:** [`docs/specs/SITE_PAGES_ARCHITECTURE.md`](file:///D:/tmp/veltraxx_2.o/docs/specs/SITE_PAGES_ARCHITECTURE.md).
- **Public Tier (Responsive Mobile & PC):**
  - `/` (Master Hackathon Landing Page): Consolidates all event info, rules, timeline, challenge, FAQs, and multiple `/register` entry points into a single high-impact document.
  - `/register` (Dedicated 4-Member Registration Funnel): Dynamic 35-team capacity gate, UPI QR payment step, private receipt screenshot upload.
  - `/department` (Department Lineage & Research Lab): C2S Linux laboratory, Cadence/Synopsys training archive, student taped-out projects, HR conclave records.
- **Coordinator Shareable Tier (Mobile-Only, Zero Authentication):**
  - `/tracker`: Unauthenticated, shareable WhatsApp link for student coordinators and faculty. Shows real-time registration roster, `New/Pending` vs `Verified` status badges, and tap-to-view receipt screenshot modal. 100% read-only with zero admin or edit permissions.
- **Auditorium Stage Tier (Semi-Public, 16:9 Projector):**
  - `/arena`: Fullscreen 24-hour synchronized stage timer. Gated via Admin switch: displays a locked "Standby" screen before event day, and goes "Live" with stage telemetry only when triggered by Admin.
- **Super-Admin Tier (Authenticated, Desktop-Only):**
  - `/admin`: Role-gated portal with 4 dedicated workspaces:
    1. *Launch Screen:* Opening ceremony ignition button and countdown animation.
    2. *Timer Controls:* Start, pause, resume, reset, time adjustment, and the master Stage Live/Standby visibility toggle.
    3. *Registrations Hub:* Full team rosters, payment verification actions, email triggers, deletion, and CSV export.
    4. *Attendance Matrix:* High-speed 4-slot volunteer check-in matrix.
- **Utility:**
  - `*`: Clean light-mode 404 fallback page.
- **Configuration Synchronized:** [`docs/specs/eventConfig.json`](file:///D:/tmp/veltraxx_2.o/docs/specs/eventConfig.json) updated with the complete `routes` registry.

---

## 20. Registration Funnel, Global Header & 404 Blueprint Ratification (Turn 15)

- **Dedicated Specification Created:** [`docs/specs/REGISTER_HEADER_404_PLAN.md`](file:///D:/tmp/veltraxx_2.o/docs/specs/REGISTER_HEADER_404_PLAN.md).
- **Agency-Agents Squad Ownership:**
  - `design-ux-architect`: Designed the ultra-low friction 90-second single-submitter funnel, automatic keystroke draft persistence in `localStorage`, and "Apply Leader's College to all 3 members" accelerator toggle.
  - `design-ui-finish-gate-reviewer`: Enforced Taste Skill v14 anti-slop rules (strictly zero em-dashes `—`, zero purple glows, zero 3-equal cards, and minimum 48px touch targets).
  - `design-brand-guardian`: Semiconductor DNA integration, silicon die bounding boxes, and Solar Wafer Yellow (`#FFE500`) accent hierarchy.
  - `engineering-frontend-developer`: Zod validation schema, responsive React 19 architecture, and transactional Supabase RPC contract with row-level locks.
- **The Single-Submitter Mandate Locked:**
  - Strictly ONE member (Team Leader) completes registration for all 4 team members.
  - One flat team payment of ₹1,000 via UPI QR scan with screenshot receipt upload ($\le 2\text{MB}$).
- **Backend SQL Migrations Authoritative Baseline:**
  - `backend_sql/001_initial_schema.sql`: Teams, participants, and attendance tables.
  - `backend_sql/002_rls_security_policies.sql`: PII lockdown with public read restriction.
  - `backend_sql/003_atomic_registration_rpc.sql`: Transactional `register_team` function enforcing the 35-team cap via `SELECT count(*) FROM teams FOR UPDATE`.
- **Global Header Component (`Navbar`):**
  - Universal floating optical glass bar (`backdrop-blur-md bg-white/78 border-black/[0.08]`).
  - Scroll-aware morphing (`scrollY > 20`), live `35 TEAMS CAP` telemetry pill, and high-voltage Solar Yellow CTA `[ Register Team → ]`.
  - Spring-animated mobile drawer with direct helpline links.
- **404 Not Found Page (`*`):**
  - Swiss typographic layout on pure Light Mode (`#FBFBFB`).
  - Silicon address routing fault motif with etched wafer crosshairs and instant recovery button `[ Return to Homepage → ]`.

---

## 21. Neo-Brutalist Pop-Collage Realignment & SQL Hardening (Turn 16)

- **Design Paradigm Synchronized Across All Plans:**
  - Fully realigned [`docs/specs/REGISTER_HEADER_404_PLAN.md`](file:///D:/tmp/veltraxx_2.o/docs/specs/REGISTER_HEADER_404_PLAN.md) and [`docs/specs/SITE_PAGES_ARCHITECTURE.md`](file:///D:/tmp/veltraxx_2.o/docs/specs/SITE_PAGES_ARCHITECTURE.md) to match the live **Neo-Brutalist Pop-Collage with 3D Hero** built design.
  - Adopted strict tokens: `#FBFBFB` canvas with 36px tech-grid, `#111116` black contrast bands, `#FFE500` Solar Yellow hero colour, `#FF2E93` Pop Magenta, `#7B2FFF` Electric Violet, 2-3px solid black borders, and 4-6px hard unblurred offset shadows.
  - Eliminated previous "no purple" ban: violet graphic shards welcomed; only generic AI purple gradient glows remain barred. Zero em-dashes (`—`) strictly maintained.
- **Registration Funnel Overhaul (`/register`):**
  - Under 5-minute single-submitter model (Leader registers all 4 members).
  - Department and degree-year mandatory for Leader, optional for Members 2-4.
  - Distinct neo-brutalist card shadow colors: Leader gets Yellow shadow; Members 2-4 get Magenta, Cobalt, Lime.
  - 5-State Machine: State A (Active), State B (Capacity Reached + Waitlist form), State C (Processing), State D (Success + 2-3 working days review), State E (Event Archived / Registration Closed).
  - Safety rule: `localStorage` stores only text fields, cleared on success, never stores screenshot receipts.
- **Global Header (`Navbar`):**
  - Full-width sticky bar (not floating pill) with `-webkit-backdrop-filter` always rendered (blur never toggled off at scrollY 0; animates only background alpha).
  - Synced to live nav items: `Overview`, `Challenge`, `Timeline`, `Rulebook`, `Prizes`, `Contact`.
  - Live capacity pill powered by public RPC `get_public_capacity()`.
- **Playful 404 Page (`*`):**
  - Giant `404` typography around 3D chip with broken/bent pin motif.
  - Tilted black contrast ribbon: `00 // SIGNAL ROUTING FAILED`.
  - Direct `tel:` links replacing helpdesk modals. Single-key `H` and `Esc` shortcuts removed for accessibility safety.
- **Backend SQL Migration Hardening:**
  - Fixed PostgreSQL invalid aggregate lock: replaced with `PERFORM pg_advisory_xact_lock(74218931)`.
  - Added `SET search_path = public` to `SECURITY DEFINER` RPC.
  - Validated server-side: 4 members, exactly 1 leader, internal/external duplicate email/phone prevention, `utr_number UNIQUE`.
  - Count towards 35 cap excludes `rejected` teams.
  - Created standalone public RPC `get_public_capacity()` returning only count vitals.
- **Formal Tracking of Open Owner Decisions:**
  - `[TODO: OWNER_DECISION_DATES]`: Live hackathon dates and registration status.
  - `[TODO: OWNER_DECISION_DEPT]`: Confirmation of `/department` scope.
  - `[TODO: OWNER_DECISION_PROOF]`: Registration proof method (Email vs `/status` lookup).
  - `[TODO: OWNER_DECISION_UPI_VPA]`: Official institutional UPI ID.

---

## 22. Streamlined Single-Submitter Roster, Canonical Colleges & DPDP Architecture (Turn 17)

- **Retyping Minimization Strategy:**
  - Integrated dual "Same as leader" switches on Member cards 2 to 4:
    1. *Same college as leader* (Default: ON).
    2. *Same department, degree & year as leader* (Default: ON).
  - Designed compact 3-column row per member for always-typed fields: `Full name`, `Email`, `Phone (WhatsApp)`.
  - Reduces teammate input to only ~9 typed fields total for classmate teams.
- **Per-Participant Canonical Schema:**
  - Backed by search-as-you-type `colleges` directory table with "Other" fallback.
  - Standardized Degree, Level (auto-suggested chips: UG, PG, Research scholar, Working professional), Department, and Year dropdowns.
  - Dynamic swap: working professionals swap college/year for Company and Designation.
- **DPDP Act Double-Consent Architecture:**
  - Checkbox 1 (Mandatory): Leader confirms all 4 members agree to share details for VELTRAXX 2.0.
  - Checkbox 2 (Optional, not pre-ticked): Opt-in for future event outreach by SIET ECE / VLSI.
  - Both flags persisted with `consent_timestamp`.
- **Database Architecture Hardening:**
  - `backend_sql/001_initial_schema.sql`: Added `colleges` table, updated `teams` with telemetry/consent fields, updated `participants` with `college_id` FK.
  - `backend_sql/002_rls_security_policies.sql`: Added public read policy for `colleges` directory.
  - `backend_sql/003_atomic_registration_rpc.sql`: Transactional `register_team` validating DPDP consent, canonical college linking, and telemetry.
  - `backend_sql/004_seed_canonical_colleges.sql`: Seeded SIET and prominent Coimbatore / Tamil Nadu engineering institutions.



