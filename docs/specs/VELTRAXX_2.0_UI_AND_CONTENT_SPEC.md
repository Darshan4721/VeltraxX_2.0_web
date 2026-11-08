# VELTRAXX 2.0 · Comprehensive UI, Content & Operational Specification
**Document Identifier:** `docs/specs/VELTRAXX_2.0_UI_AND_CONTENT_SPEC.md`  
**Status:** REVISED & FULLY PATCHED ARCHITECTURAL SPECIFICATION (SUPERIOR AI AUDIT APPROVED)  
**Parent Contract:** [`docs/PROJECT_MEMORY.md`](file:///d:/tmp/veltraxx_2.o/docs/PROJECT_MEMORY.md)  
**Target Delivery:** Multi-Page Web Application, Zero-Cost Submission Bridge & Admin Command Center  
**Repository Working Directory:** `d:\tmp\veltraxx_2.o`  
**Security Standard:** Strict RLS & SECURITY DEFINER RPC Isolation (Zero Secret Passcode Exposure)  
**Typographic Standard:** Non-Negotiable Anti-Slop Gate (Strict Zero Em-Dashes `\u2014` in visible UI copy)

---

## Multi-Agent Reviewer & Sign-Off Panel

This specification incorporates the 7 mandatory patches from the architectural audit and was reviewed across the specialized agents in `design-research/13-agency-agents/`:

| Agent Role | Specialty / Authority Area | Mandatory Patches Enforced in Blueprint |
| :--- | :--- | :--- |
| **`design-ui-designer`** | Neo-Brutalist Visual Language & Color Systems | Industrial Pop tokens (#FAF8F5 canvas, #FFE600 yellow, #FF2A85 pink, #00E5FF cyan, #00E676 green, 3px solid #111116 borders, 4px/6px hard offset drop shadows). |
| **`design-ux-architect`** | User Journey & Frictionless Funnel Engineering | **Patch 2 & 7:** "Forgot Team ID" lookup on `/submit-ppt`, printable registration slip on modal, automated registration email, and mobile slide-over modal fallback for `/admin` split-screen. |
| **`design-brand-guardian`** | Anti-Slop Finish Gate & Typographic Integrity | **Patch 6:** Comprehensive purge of all em-dashes (`\u2014`) from copy strings; replaced with middle dots (`·`) or hyphens (`-`). Zero generic AI purple mesh glows. |
| **`engineering-frontend-developer`** | Component Architecture & Client State | **Patch 1 & 5:** Client-side `pdfjs-dist` text extraction and page-count validation ($\le 8$ slides) on `/submit-ppt`; dynamic Live 24H Arena Banner on `/` and `/live` route. |
| **`engineering-backend-architect`** | Database Schema, Triggers & Webhook Bridges | **Patch 3 & 4:** Dynamic `round2_fee_per_member` in `event_state`; Google Apps Script webhook integration storing `/preview` embed URLs; zero raw binary dumps into Drive. |
| **`engineering-database-optimizer`** | Concurrency, RLS & Passcode Isolation | **Patch 4:** Dropped all public `SELECT` on `teams`/`members`; 5 secure `SECURITY DEFINER` RPCs (`register_free_team`, `lookup_team_for_ppt`, `submit_round1_ppt`, `verify_round2_gatekeeper`, `submit_round2_payment`). |
| **`testing-reality-checker`** | Operational Grounding & Volunteer Workload | Elimination of 500 manual Google Drive permission headaches; `/preview` URL formatting to bypass `X-Frame-Options`; instant bank reconciliation via bound UTR. |
| **`testing-accessibility-auditor`** | WCAG 2.2 Level AA & Mobile Ergonomics | Contrast compliance $\ge 4.5:1$, touch target minimums $\ge 48\text{px}$, font size $\ge 16\text{px}$ to stop iOS auto-zoom, zero horizontal scroll on 360px–430px. |

---

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        VELTRAXX 2.0 TWO-STAGE GAUNTLET PIPELINE                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  STAGE 01: ONLINE IDEA PITCH (100% FREE ENTRY)                                         │
│  ┌───────────────────────┐      ┌─────────────────────────┐      ┌──────────────────┐  │
│  │ 1. Free Registration  │ ───> │ 2. 48-Hour PPT Window   │ ───> │ 3. Automated     │  │
│  │    (/register)        │      │    (/submit-ppt)        │      │    Google Drive  │  │
│  │    • 2 to 4 members   │      │    • Client pdfjs-dist  │      │    5TB Storage   │  │
│  │    • 5 Problem Tracks │      │    • <= 8 slides, <= 3MB│      │    & Text Master │  │
│  │    • Auto Email + Slip│      │    • "Forgot Team ID?"  │      │    Sheet Index   │  │
│  └───────────────────────┘      └─────────────────────────┘      └──────────────────┘  │
│                                                                            │           │
│                                            ┌───────────────────────────────┘           │
│                                            ▼                                           │
│  STAGE 02: THE 24-HOUR OFFLINE FINALE (SIET CAMPUS, COIMBATORE · DEC 15-16)            │
│  ┌───────────────────────┐      ┌─────────────────────────┐      ┌──────────────────┐  │
│  │ 4. Volunteer Split-   │ ───> │ 5. Locked Gatekeeper    │ ───> │ 6. 24H Live Twist│  │
│  │    Screen Admin UI    │      │    (/round2-confirm)    │      │    Offline Build │  │
│  │    • In-Browser View  │      │    • RPC Passcode Check │      │    • Build Round1│  │
│  │    • 1-Click Shortlist│      │    • Dynamic QR Fee Math│      │    • Live Twists │  │
│  │    • Auto 6-Char PIN  │      │    • UTR + Proof Bind   │      │    • 50/50 Score │  │
│  └───────────────────────┘      └─────────────────────────┘      └──────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Executive Summary & Paradigm Shift

VELTRAXX 2.0 shifts fundamentally from a high-friction single-stage paid registration model into a **high-volume, two-stage engineering funnel**:

1. **Round 1 (Online Idea Pitch) is 100% Free**:
   - Every engineering student across India (UG 1st year through PG and Research Scholars) can register a team of 2 to 4 members for ₹0.
   - Designed to harvest **up to 1,000 verified student contacts (250-500 teams)** without commercial payment drop-off.
   - Teams select one of 25 official problem statements across 5 technical domains and submit a mandatory 6-slide SIH-style blueprint as a `.pdf` file during a strict 48-hour window (December 2, 00:00 to December 3, 23:59 IST).
   - Evaluation is structured fairly across two academic tiers: Tier A (1st & 2nd Year UG) vs. Tier B (3rd & 4th Year UG, PG, and Scholars).
   - Immediate feedback: Team Leader receives an automated confirmation email with their Team ID via Google Apps Script, and can download a printable registration slip directly from the success modal.

2. **Round 2 (24-Hour Offline Finale at SIET Coimbatore) on December 15-16, 2026**:
   - Capped at **~90 seats (~25 to 30 shortlisted teams)**.
   - Shortlisted teams receive phone confirmations and a private, cryptographically generated 6-character Passcode.
   - Finalists confirm their physical seats on a dedicated locked portal (`/round2-confirm`) authenticated via a secure PostgreSQL function.
   - Dynamic fee math reads `round2_fee_per_member` from `public.event_state` (`team_size × round2_fee_per_member`), rendering the exact matching UPI QR code and deep links.
   - Direct binding of 12-digit UTR and payment screenshot solves the "Who paid?" bank reconciliation problem.
   - In the offline arena, teams build their Round 1 blueprint live, facing surprise engineering constraints and functional twists injected by the jury on the morning of December 15.

---

## 2. Global Design System & Responsive Foundation

### 2.1 Neo-Brutalist High-Contrast Industrial Pop Tokens

| Token Category | CSS / Hex Code | Usage Context |
| :--- | :--- | :--- |
| **Canvas Background** | `#FAF8F5` | Warm technical cream canvas with subtle 36px monospace grid lines |
| **Dark Contrast Chassis** | `#0E0E11` / `#16161E` | Pitch-black container blocks, dark mode feature cards, terminal strips |
| **Acid Voltage Yellow** | `#FFE600` | Primary action buttons, primary badges, high-impact chamfers |
| **Hot Cyber Pink** | `#FF2A85` | High-energy accents, live tags, alert badges, second accent cards |
| **Electric Photonic Cyan**| `#00E5FF` | Track 02 accents, telemetry pills, live timing indicators |
| **Neon Logic Green** | `#00E676` | Free entry pill, verified badges, active countdown markers |
| **Electric Silicon Violet**| `#7B2FFF` | Track 05 cards, geometric background planes, trophy accent shards |
| **Carbon Ink Borders** | `2px` or `3px solid #111116` | Non-negotiable outline on all cards, buttons, modals, and inputs |
| **Tactile Offset Shadows** | `shadow-[4px_4px_0px_0px_#111116]` | Razor-sharp zero-blur neo-brutalist offset shadows (no Gaussian blur) |
| **Deep Offset Shadows** | `shadow-[6px_6px_0px_0px_#111116]` | Heavy bento cards, modal dialogs, primary CTA buttons |

### 2.2 Mobile-First Responsive Rules (360px – 430px)
- **Zero Horizontal Overflow:** All horizontal margins, padding, and transforms are clamped. Viewport width `100vw` with `overflow-x: hidden` enforced on root containers.
- **Single-Column Mobile Stacking:** Multi-column Bento grids collapse cleanly to single-column vertical cards on viewports $\le 768\text{px}$.
- **Touch Targets & iOS Safari Zoom Protection:** Every interactive control, tab, input, and button maintains a minimum touch target height of `h-12` ($48\text{px}$) and font size $\ge 16\text{px}$ (`text-base`), preventing unwanted auto-zoom on Apple devices.
- **Lightweight Graphic Performance:** 3D layers and cutout chips are served as compressed WebP/SVG layers with hardware-accelerated CSS transforms. No heavy three.js canvas bundles on the landing page, ensuring mobile LCP under **1.5 seconds**.

### 2.3 Strict Anti-Slop Finish Gate Rules (Patch 6)
- **Zero Em-Dashes (`—`):** Banned across all public UI copy. Use middle dots (`·`), clean hyphens (`-`), or rephrase.
- **Zero Purple Mesh AI Glows:** Banned generic blurred gradient blobs. Color planes must be crisp geometric slabs with solid borders.
- **Zero Dummy Sections:** No fake judges, fake sponsors, or unverified testimonials. Every component represents actual operational data.

---

## 3. Page 1: Public Master Landing Page (`/`) · Long Scroll A-to-Z

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        PAGE 1: MASTER LANDING PAGE COMPONENT TREE                      │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 0. Dynamic Live 24H Arena Banner (`LiveArenaBanner.jsx` - Mounts when is_clock_public) │
│ 1. Sticky Navigation Header (`Navbar.jsx`)                                             │
│    ├── Brand Logo ("VELTRAXX 2.0" + "SIET · DEPT OF EE [VLSI DESIGN & TECH]")          │
│    ├── Desktop Center Links (Overview · Gauntlet · 5 Tracks · Rules · Timeline · FAQs)  │
│    └── Right Telemetry Pill ("ROUND 1: 100% FREE") + Action Buttons                    │
│ 2. Hero Section (`HeroSection.jsx`)                                                    │
│    ├── Display Eyebrow Badge ("NATIONAL-LEVEL 2-STAGE TECH & SILICON HACKATHON")        │
│    ├── Headline ("VELTRAXX 2.0") & Sub-headline (Pitch free, build 24h offline)        │
│    ├── 4 Quick-Info Pills (₹0 Free · 2-4 Members · 5 Tracks · 15-16 Dec Finale)        │
│    ├── Primary Action CTAs ("Register Team for Free →" & "Download Problem PDF ↓")     │
│    ├── Live Countdown Widget (Closes 01 Dec 2026, 11:59 PM IST)                        │
│    └── 4 Metric Strip Cards (Stage 1 Pitch · 48H PPT · Stage 2 Arena · Live Twist)     │
│ 3. Angled Caution-Tape Marquee Ticker (`MarqueeRibbon.jsx`)                            │
│ 4. Dark Section: The 2-Round Pipeline (`TwoStagePipeline.jsx` · Chapter 01)            │
│    ├── Step 01: Register & Track Selection (Until Dec 01)                              │
│    ├── Step 02: 48-Hour PPT Blueprint Submission (Dec 02-03)                           │
│    └── Step 03: Shortlist Invite & The 24H Live Twist Finale (Dec 15-16)               │
│ 5. Problem Tracks & Resource Vault (`TracksAndVaultSection.jsx` · Chapter 02)          │
│    ├── 5 Track Bento Cards (ASIC · FPGA · Edge AI · Smart IoT · Open Innovation)       │
│    └── Embedded Download Vault (Problem Book PDF · Official PPTX · Rulebook PDF)       │
│ 6. Rules, Evaluation & Standards (`RulesBentoSection.jsx` · Chapter 03)                │
│    ├── Card 1 (Yellow): Round 1 Online Pitch Rules & 6-Slide Template                  │
│    ├── Card 2 (Pink): Shortlisting Criteria & Phone/Email Confirmation                 │
│    ├── Card 3 (Cyan): The 24-Hour Offline Live Twist Protocol (50% Core / 50% Twist)  │
│    └── Card 4 (Dark): Campus Logistics, Workstation Labs & Hospitality                │
│ 7. Dual-Mode Interactive Timeline (`DualTimelineSection.jsx` · Chapter 04)             │
│    ├── Tab A: Full Event Master Roadmap (Now through 16 Dec Valedictory)               │
│    └── Tab B: 24-Hour Offline Finale Schedule (Hour-by-hour milestones Dec 15-16)     │
│ 8. Recognition, Perks & Prizes (`PrizeSection.jsx` · Chapter 05)                       │
│    ├── Card 1: Grand Champion & Track Winner Trophies                                  │
│    ├── Card 2: Industry Jury Mentorship & Internship Spotlight                         │
│    └── Card 3: Digital Ideation Certificates & Hardcopy Finalist OD Documentation       │
│ 9. FAQs & Helpdesk Section (`FaqAndContactSection.jsx` · Chapter 06)                   │
│    ├── 6 Essential Plain-Language Accordion Questions                                 │
│    └── Direct Helpdesk Cards (Student Coordinators · Department Direct Channels)       │
│ 10. Master Footer (`Footer.jsx`)                                                       │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.0 Dynamic Live 24H Arena Banner (Patch 5)
- When `public.event_state.is_clock_public == true`, mounts a high-impact carbon and electric yellow banner at the top of `/`:
  - Shows real-time 24-hour remaining countdown clock.
  - Displays live ticker of `live_announcement_text`.
  - Action Button: `<Link to="/live">` with label `Open Arena Stage View →`.

### 3.1 Sticky Navigation Header (`Navbar.jsx`)
- **Brand Identity (Left):**
  - Icon: Solid carbon square badge with electric chip glyph.
  - Headline: `VELTRAXX 2.0` in bold sans-serif.
  - Sub-label: `SIET · DEPT OF EE (VLSI DESIGN & TECH)`.
- **Navigation Links (Center · Collapses into focus-trapped Drawer on Mobile):**
  - `Overview` (`#overview`)
  - `How It Works` (`#pipeline`)
  - `5 Tracks` (`#tracks`)
  - `Rules` (`#rules`)
  - `Timeline` (`#timeline`)
  - `Downloads` (`#downloads`)
  - `FAQs` (`#faqs`)
  - `About Dept` (`/department`)
- **Action Group (Right):**
  - **Live Status Pill:** Green pulsing dot with monospace label: `ROUND 1: 100% FREE ENTRY`.
  - **Primary CTA (Yellow):** `<Link to="/register">` with label `Register Team →` and tactile press physics.
  - **Secondary CTA (Black Outline):** `<Link to="/submit-ppt">` with label `Submit PPT` (*Unlocks Dec 2*).

### 3.2 Hero Section (`HeroSection.jsx`)
- **Top Eyebrow Badge:** Monospace pill with green pulse: `● NATIONAL-LEVEL 2-STAGE TECH & SILICON HACKATHON · SIET COIMBATORE`.
- **Display Title:** `VELTRAXX` + Chamfered yellow badge `2.0` with overlapping hardware chip visual.
- **Sub-Headline:** `"Pitch your blueprint online for FREE in Round 1. Survive the shortlist, enter the 24-hour offline arena at SIET, and build through live engineering twists."`
- **4 Quick-Info Pills:**
  1. `⚡ ROUND 1: ₹0 FREE FOR ALL`
  2. `👥 TEAM SIZE: 2-4 MEMBERS`
  3. `🎯 5 TRACKS (VLSI · FPGA · AI · IOT · OPEN)`
  4. `🔥 FINALE: 15-16 DEC 2026`
- **Hero CTA Button Pair:**
  - `Button 1 (Primary Yellow)`: `Register Team for Free →` (Navigates directly to `/register`).
  - `Button 2 (Secondary White with 2px border)`: `Download Problem PDF & PPT Template ↓` (Smooth-scrolls to `#downloads`).
- **Live Countdown Widget:**
  - Header: `ROUND 1 REGISTRATION CLOSES // 01 DEC 2026 (11:59 PM IST)`.
  - 4 Monospace Digit Boxes: `[ DAYS ]` | `[ HOURS ]` | `[ MINS ]` | `[ SECS ]` rendered in `#111116` on `#FFE600` backgrounds.
- **4 Metric Strip Cards:**
  - *Card 1:* **STAGE 01: FREE IDEA PITCH** · Open to UG, PG & Research Scholars across India. Zero registration fee for Round 1.
  - *Card 2:* **48H PPT WINDOW (02-03 DEC)** · Submit your 6-slide SIH-style solution blueprint directly via our portal.
  - *Card 3:* **STAGE 02: 24H OFFLINE ARENA** · Top shortlisted teams invited to SIET Coimbatore on Dec 15-16, 2026.
  - *Card 4:* **THE LIVE TWIST FORMAT** · Carry your Round 1 project into Round 2, adapt to live jury modifications on Day 1, and win.

### 3.3 Angled Caution-Tape Marquee Ticker (`MarqueeRibbon.jsx`)
- Dual-band infinite ticker tilted at $-2^{\circ}$ and $+1.5^{\circ}$ with contrasting carbon and electric yellow backgrounds.
- Continuous text loop:
  `★ FREE ROUND 1 REGISTRATION ★ OPEN TO UG / PG / SCHOLARS ★ ASIC & RTL ★ FPGA ACCELERATION ★ EDGE AI & TINYML ★ SMART IOT SYSTEMS ★ SIH-STYLE PPT PITCH ★ 24-HOUR OFFLINE FINALE @ SIET COIMBATORE ★`

### 3.4 Dark Section: How Veltraxx 2.0 Works (`TwoStagePipeline.jsx` · Chapter 01)
- **Container Styling:** Deep Obsidian `#0E0E11` background, 3px solid `#111116` border with `#FFE600` accent dividers.
- **Section Eyebrow:** `● CHAPTER 01 // THE TWO-STAGE GAUNTLET`.
- **Headline:** `Two Rounds. One Evolving Architecture.`
- **Thesis Copy:** `"We ditched the pay-first lottery. Round 1 is completely free. Prove your engineering blueprint in an SIH-style PPT pitch. If your team makes the cut, you receive an official invitation to the 24-hour offline build marathon at SIET."`
- **3 Sequential Pipeline Cards:**
  1. **Step 01 · Register & Pick Your Track (Until Dec 01):** Form a team of 2 to 4 members. Browse the 25 problem statements across 5 domains, lock in your registration for ₹0, and start drafting your architecture using our official PPT template.
  2. **Step 02 · Submit Your PPT Blueprint (Dec 02 - Dec 03):** Submit your completed PPT between Dec 2 (00:00) and Dec 3 (23:59). Our evaluation panel reviews every pitch based on technical feasibility, architecture, and academic tier (1st-year UG to Research Scholar).
  3. **Step 03 · Shortlist Invite & The 24H Twist (Dec 15 - Dec 16):** Shortlisted teams receive a direct phone confirmation and a private Round 2 invitation email. On Dec 15 morning, you build the exact project you pitched, plus live functional twists and constraints injected on the spot by our jury.

### 3.5 Problem Tracks & Embedded Download Vault (`TracksAndVaultSection.jsx` · Chapter 02)
- **Section Eyebrow:** `● CHAPTER 02 // 5 DOMAINS · 25 PROBLEM STATEMENTS`.
- **Headline:** `Choose Your Battlefield.`
- **Fairness Badge:** `🎓 ALL LEVELS WELCOME: Evaluated fairly by Academic Tier (1st/2nd Yr UG vs Senior UG/PG/Scholars)`.
- **5 Track Bento Cards:**
  1. **Track 01 (Yellow Accent):** *ASIC & Custom Silicon (VLSI-A)* · RTL design, low-power architectures, memory controllers, and DFT/BIST systems.
  2. **Track 02 (Cyan Accent):** *FPGA & Reconfigurable Systems (VLSI-B)* · Hardware accelerators, high-speed interfaces, DSP pipelines, and RISC-V prototyping.
  3. **Track 03 (Pink Accent):** *Edge AI & Vision Systems (AI/CSE)* · TinyML, hardware-aware neural networks, smart diagnostics, and real-time edge inference.
  4. **Track 04 (Green Accent):** *Smart IoT & Cyber-Physical Tech (CSE/ECE/EEE)* · Highway safety, industrial telemetry, smart automation, and integrated sensor-cloud systems.
  5. **Track 05 (Violet Accent):** *Open Innovation (SIH Format)* · Pitch your own bold hardware/silicon-backed solution to a real-world industrial or societal problem.
- **Embedded Download Vault (3 High-Contrast Action Cards Directly Below Tracks):**
  - **Vault Card 1:** `📄 Problem Statements Book (PDF)` · Contains all 25 detailed problems across 5 tracks. Direct link to `/downloads/VELTRAXX_2.0_Problem_Statements.pdf`.
  - **Vault Card 2:** `📊 Official Round 1 PPT Template (.PPTX)` · Mandatory 6-slide SIH-style presentation format. Direct link to `/downloads/VELTRAXX_2.0_Round1_Template.pptx`.
  - **Vault Card 3:** `📘 Official Rulebook & Event Brochure (PDF)` · Complete guidelines, checklist, and code of conduct. Direct link to `/downloads/VELTRAXX_2.0_Rulebook.pdf`.

### 3.6 Rules, Evaluation & Standards (`RulesBentoSection.jsx` · Chapter 03)
- **Section Eyebrow:** `● CHAPTER 03 // OPERATING PROTOCOL`.
- **Headline:** `Clear Rules. Zero Ambiguity.`
- **4 Colored Bento Cards:**
  - **Card 1 (Solar Yellow · Round 1 Rules & PPT Format):**
    - 100% Free registration for all teams (2 to 4 members; cross-department allowed).
    - Teams must use the official Veltraxx 2.0 PPT template (Max 6 slides: Problem, Proposed Architecture/Block Diagram, Tech/Hardware Stack, Execution Flow, Expected Output).
    - Submission window strictly runs from 02 Dec (00:00 IST) to 03 Dec (23:59 IST).
  - **Card 2 (Hot Pink · Shortlisting & Round 2 Entry):**
    - Jury evaluates PPTs on novelty, block-level clarity, and 24-hour build feasibility.
    - Shortlisted team leaders will be contacted directly via phone and email between Dec 05 and Dec 07.
    - Confirmed finalists receive an exclusive Round 2 registration link and onboarding instructions via email.
  - **Card 3 (Electric Cyan · Round 2 "Live Twist" Evaluation):**
    - In Round 2 (Dec 15-16 @ SIET), you build the exact project pitched in your Round 1 PPT.
    - At kick-off on Dec 15, judges will assign custom live modifications/constraints to your problem statement.
    - Grading Weightage: 50% Core Architecture Execution + 50% Live Twist Adaptation & Stress Testing. Pre-built copy-paste projects will fail the live twist.
  - **Card 4 (Carbon Black · Campus Logistics, Kit & Hospitality):**
    - Bring your own laptops, chargers, required microcontrollers/FPGAs/sensors, and valid College ID cards.
    - High-speed lab Wi-Fi, power strips, and synthesis/simulation workstation support provided as applicable.
    - Full hospitality (meals, midnight refreshments, and separate rest zones for boys and girls) provided during the 24-hour finale.

### 3.7 Dual-Mode Interactive Timeline (`DualTimelineSection.jsx` · Chapter 04)
- **Section Eyebrow:** `● CHAPTER 04 // MASTER SCHEDULE`.
- **Headline:** `From Blueprint to 24-Hour Build.`
- **Tab Switcher:** Pill button toggles `[ Tab A: Full Event Roadmap ]` | `[ Tab B: 24-Hr Finale Schedule (15-16 Dec) ]`.
- **Tab A Contents (Full Event Roadmap):**
  - *Now - 01 Dec (11:59 PM):* Round 1 Free Team Registration Open + Problem Statements & PPT Template Live.
  - *02 Dec (00:00) - 03 Dec (23:59):* 48-Hour Window for Round 1 PPT Submission on Portal.
  - *04 Dec - 06 Dec:* Jury PPT Screening & Shortlist Evaluation.
  - *07 Dec - 09 Dec:* Phone Verification Calls & Official Round 2 Invitation Emails Sent to Finalists.
  - *15 Dec - 16 Dec:* Veltraxx 2.0 · 24-Hour Offline Finale at SIET Campus, Coimbatore.
- **Tab B Contents (24-Hour Offline Finale · 15 & 16 Dec):**
  - *15 Dec · 08:30 AM:* Finalist Check-in, ID Verification & Arena Desk Allocation.
  - *15 Dec · 09:30 AM:* Grand Inauguration & The Live Problem Twist Reveal.
  - *15 Dec · 10:30 AM:* 24-Hour Build Clock Officially Starts.
  - *15 Dec · 01:30 PM:* Working Lunch Break.
  - *15 Dec · 04:30 PM:* Jury Audit 01 · Architecture & Twist Integration Check.
  - *15 Dec · 08:30 PM:* Dinner Break.
  - *16 Dec · 01:00 AM:* Jury Audit 02 (Midnight Review) · 50% Milestone Verification + Midnight Refreshments.
  - *16 Dec · 08:00 AM:* Breakfast & Final Code/Hardware Freeze Prep.
  - *16 Dec · 10:30 AM:* 24-Hour Clock Ends · Final Jury Demo & Pitching Round.
  - *16 Dec · 12:30 PM:* Valedictory Ceremony, Awards & Certificates.

### 3.8 Recognition, Perks & Prizes (`PrizeSection.jsx` · Chapter 05)
- **Section Eyebrow:** `● CHAPTER 05 // REWARDS & RECOGNITION`.
- **Headline:** `Built for Glory, Career & Recognition.`
- **3 Highlight Cards:**
  1. **Card 1: 🏆 Grand Champion & Track Awards:** Top-performing teams across tracks win official Veltraxx 2.0 Winner Trophies, Merit Honours, and Exciting Prize Rewards (To be unveiled).
  2. **Card 2: 💼 Industry Jury & Internship Spotlight:** Pitch your live build directly to visiting industry engineers and academic experts. Standout talent gets fast-tracked for technical mentorship and internship opportunities.
  3. **Card 3: 📜 Official Certificates & OD Support:** Every Round 1 team submitting a valid PPT receives a Digital Certificate of Ideation; all Round 2 offline finalists receive Official Hardcopy Certificates & On-Duty (OD) documentation.

### 3.9 FAQs & Direct Helpdesk (`FaqAndContactSection.jsx` · Chapter 06)
- **Section Eyebrow:** `● CHAPTER 06 // CLARITY & COORDINATION HELPDESK`.
- **Headline:** `Frequently Answered. Direct Contact Points.`
- **6 Standardized Accordion FAQs:**
  1. *Is Round 1 really 100% free?* · Yes. Registering your team and submitting your Round 1 PPT costs ₹0.
  2. *What happens if our team gets shortlisted for Round 2?* · Our team will call your Team Leader directly to confirm your seat and send an exclusive invitation email containing the Round 2 confirmation link and nominal offline hospitality details.
  3. *I am a 1st-year student / I am from CSE or IT. Can I participate?* · Absolutely. We have 5 tracks covering AI, IoT, Software-Hardware Integration, FPGA, and VLSI, and our jury evaluates teams relative to their academic year (UG 1st/2nd year vs Senior/PG/Scholars).
  4. *What is the allowed team size?* · Teams can have 2, 3, or 4 members. Members can be from different departments or years within the same college.
  5. *How do we submit our PPT on Dec 2-3?* · Save your 6-slide PPT as a PDF (under 3MB) and upload it directly on the "Submit PPT" portal on this website between Dec 2 and Dec 3 using your registered Team ID or Leader Email.
  6. *Will food and overnight stay be provided during the Dec 15-16 finale?* · Yes, full arrangements for meals, midnight snacks, and secure rest areas are provided at SIET campus.
- **Direct Helpdesk Contact Cards (Right Column):**
  - *Student Coordinator Helpdesk:* Names, Click-to-Call Phone buttons, direct WhatsApp chat links.
  - *Department Direct Channels:* Official HOD & Department email contacts.
  - *Venue Map & Address:* SIET Tech Park, Sri Shakthi Institute of Engineering and Technology, L&T Bypass Road, Coimbatore.

---

## 4. Page 2: Dynamic Registration Funnel (`/register`) (Patch 2)

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        PAGE 2: DYNAMIC REGISTRATION FUNNEL ARCHITECTURE                │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Section 01: Team Identity, Size & Track Selection                                      │
│ ├── Team Name (Input)                                                                  │
│ ├── Dynamic Team Size Selector: [ 2 Members ] | [ 3 Members ] | [ 4 Members ] (Default)│
│ │   └── Interactivity: Dynamically mounts/unmounts Member 3 & Member 4 form cards       │
│ ├── Track Selector (Dropdown: Track 01 ASIC to Track 05 Open Innovation)               │
│ ├── Problem Statement Code (Dropdown: VTX-T1-01 to VTX-T5-05 + "Download PDF" helper)   │
│ └── Academic Category: [ UG (1st/2nd Year) ] | [ UG (3rd/4th Year) ] | [ PG / Scholar ]│
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Section 02: Dynamic Team Member Cards                                                  │
│ ├── Member 01 (Team Leader Card · Mandatory primary contact)                           │
│ ├── Member 02 (Team Member Card · "Inherit College/Dept from Leader" Switch)           │
│ ├── Member 03 (Rendered conditionally ONLY if Team Size >= 3)                          │
│ └── Member 04 (Rendered conditionally ONLY if Team Size == 4)                          │
│     * Fields: Full Name, Email, WhatsApp Phone (10 digits), Gender, College, Dept, Year│
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Section 03: 100% Free Round 1 Confirmation (Zero-Fee Replacement Box)                  │
│ ├── Visual: High-Contrast Green Neo-Brutalist Confirmation Banner                      │
│ ├── Message: "ROUND 1 REGISTRATION IS 100% FREE"                                       │
│ ├── Mandatory Consent Checkbox: "We understand that Round 1 PPT submission takes place │
│ │   on Dec 2-3, 2026 via this portal, and only shortlisted teams will be invited to    │
│ │   confirm seats for the Dec 15-16 offline finale."                                   │
│ └── Primary Action Button: "COMPLETE FREE ROUND 1 REGISTRATION →"                      │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Post-Registration Success Modal / Screen (Enhanced - Patch 2)                          │
│ ├── Generated Team ID Display: e.g. "VTX2-048" (Bold copyable token)                   │
│ ├── Action Button 1: [ 📄 Download Team Registration Slip (.TXT / PDF) ]               │
│ ├── Action Button 2: [ 💬 Join Official WhatsApp Announcements Group ]                 │
│ ├── Action Button 3: [ 📊 Download Official 6-Slide PPT Template (.PPTX) ]             │
│ └── Guidance Box: "A confirmation email with your Team ID has been sent to your leader.│
│     You can also look up your Team ID anytime using your phone or email on /submit-ppt"│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Page 3: Zero-Friction PDF Submission Portal (`/submit-ppt`) (Patches 1 & 2)

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        PAGE 3: ZERO-COST PDF SUBMISSION ARCHITECTURE                   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. Form Inputs:                                                                        │
│    ├── Registered Team ID (e.g. VTX2-048)                                              │
│    │    └── Helper Action: [ 🔍 Forgot Team ID? Lookup by Email or Phone ]             │
│    │        (Triggers `lookup_team_for_ppt` RPC to auto-fill Team ID & Track)          │
│    ├── Verified Track & Problem Statement Code Selector                                │
│    └── Direct PDF File Dropzone (Max 8 slides, Max 3MB)                                │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. Client-Side PDF Text Extraction & Validation Engine (Patch 1):                      │
│    ├── Uses client-side `pdfjs-dist` to parse the PDF immediately in the browser       │
│    ├── Checks page count: If > 8 slides, displays error ("Maximum 8 slides allowed")   │
│    ├── Extracts full text string across all slides (Takes ~0.5s, 0 quota cost)         │
│    └── Assembles payload: { team_id, track_id, team_name, pdf_base64, extracted_text }│
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 3. Free Google Apps Script Webhook Bridge (5TB Google Drive Storage):                  │
│    ┌─────────────────┐       ┌──────────────────────┐       ┌───────────────────────┐  │
│    │ Client Browser  │ ────> │ Google Apps Script   │ ────> │ 5TB Google Drive      │  │
│    │ PDF Binary Data │       │ Web App Webhook      │       │ Folder: veltraxx_2.0  │  │
│    └─────────────────┘       └──────────────────────┘       └───────────────────────┘  │
│                                          │                              │              │
│                                          ▼                              ▼              │
│                              Appends extracted text         Saves PDF & generates      │
│                              into Master Google Sheet       preview embed URL:         │
│                              "All_Pitches_Master"           .../file/d/ID/preview      │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 4. Database Sync:                                                                      │
│    └── Calls `submit_round1_ppt` RPC to save `preview_url` into Supabase `teams`       │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Page 3B: Locked Round 2 Gatekeeper & Dynamic Payment Portal (`/round2-confirm`) (Patches 3 & 4)

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   PAGE 3B: ROUND 2 GATEKEEPER & RECONCILIATION PORTAL                  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ STEP 01: GATEKEEPER AUTHENTICATION LOCK (SECURITY DEFINER RPC - Patch 4)               │
│ ├── Inputs: [ Team ID (e.g. VTX2-048) ] + [ 6-Digit Secret Passcode (e.g. 9X4K2M) ]    │
│ └── Validation: Calls `verify_round2_gatekeeper(p_team_id, p_passcode)`.               │
│     * If invalid or not shortlisted: Renders Red Card ("ACCESS RESTRICTED")            │
│     * If valid: Unlocks Step 2 and returns verified `team_size` and dynamic fee.       │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ STEP 02: DYNAMIC FEE MATH & DYNAMIC QR DISPLAY (Patch 3)                               │
│ ├── Reads dynamic `round2_fee_per_member` from `event_state` (Default: ₹500/head)      │
│ ├── Calculates: `Total Fee = team_size × round2_fee_per_member`                        │
│ │   • 2 Members ──> ₹1,000 (or customized total) Dynamic QR Code                       │
│ │   • 3 Members ──> ₹1,500 Dynamic QR Code                                             │
│ │   • 4 Members ──> ₹2,000 Dynamic QR Code                                             │
│ └── Generates dynamic `upi://pay?pa=VPA&pn=VELTRAXX&am=${totalFee}&cu=INR` QR code     │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ STEP 03: PAYMENT PROOF BINDING & SUBMISSION                                            │
│ ├── Mandatory 12-Digit Numeric UTR / UPI Reference Number (Input)                       │
│ ├── Payment Screenshot Upload (Sent to Google Drive: PAID_VTX2_048.jpg)                │
│ └── Submit Confirmation: Calls `submit_round2_payment` RPC to save UTR and mark paid.  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Page 4: Admin Portal (`/admin`) With Chrome-Style Tabs (Patches 3 & 7)

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        PAGE 4: ADMIN COMMAND CENTER LAYOUT                             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Header: VELTRAXX 2.0 OPERATIONS COMMAND | Coordinator: Dr. P. DhilipKumar | Logout     │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Browser-Style Top Tabs:                                                                │
│ [ 🗂️ Tab 1: Round 1 All (500) ] [ 🏆 Tab 2: Round 2 Finalists ]                        │
│ [ 📋 Tab 3: Event Attendance   ] [ ⏱️ Tab 4: 24H Live Arena Clock ]                     │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ TAB 1 CONTENT: SPLIT-SCREEN EVALUATION & MASTER EXPORT                                 │
│ • Desktop: Left Table of 500 teams | Right In-Browser PDF Preview (`.../preview` URL)  │
│ • Mobile (< 768px - Patch 7): Table view; tapping team opens full-screen slide-over    │
│   modal with embedded PDF preview and fixed [Shortlist] [Waitlist] [Reject] buttons.   │
│ • Action: [ 📥 Download Flat-Row Master XLSX ] (1 row per student · 1,000 contacts)   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ TAB 2 CONTENT: ROUND 2 FINALISTS & DYNAMIC FEE CONFIG (Patch 3)                        │
│ • Dynamic Fee Control: Number input to adjust `round2_fee_per_member` (e.g. ₹500)      │
│ • Filtered list of the ~30 Shortlisted Teams only with Passcode, Size, UTR, Screenshot │
│ • 1-Click Action: [ ✅ Paid & Verified Toggle ] (Locks 1 of 90 seats)                  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ TAB 3 CONTENT: EVENT-DAY ATTENDANCE CHECKLIST (15-16 DEC)                              │
│ • Roster of confirmed finalists with individual member checkboxes                      │
│ • 1-Tap Toggles: Check-in (08:30 AM) | Audit 1 (04:30 PM) | Midnight Audit 2 (01:00 AM)│
│ • Action: [ 📄 Export OD & Attendance PDF/XLSX ] (Official college endorsement format) │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ TAB 4 CONTENT: 24-HOUR LIVE ARENA CLOCK CONTROL (Patch 5)                              │
│ • Big Action Buttons: [ Launch Public Clock Banner ] | [ Start / Pause / Reset Clock ] │
│ • Push Live Announcement Broadcast Bar (Pushes alerts to `/` banner and `/live` screen)│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Database Architecture & Schema (`backend_sql/`) (Patches 3 & 4)

```sql
-- ==============================================================================
-- 1. EVENT STATE TABLE (Controls Stage Timer & Dynamic Per-Head Fee)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.event_state (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  is_clock_public BOOLEAN DEFAULT false,
  clock_state VARCHAR(20) DEFAULT 'STOPPED' CHECK (clock_state IN ('STOPPED', 'RUNNING', 'PAUSED')),
  clock_start_timestamp TIMESTAMPTZ,
  clock_end_timestamp TIMESTAMPTZ,
  live_announcement_text TEXT,
  round2_fee_per_member INT DEFAULT 500, -- Patch 3: Dynamic per-head pricing
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 2. TEAMS TABLE (Strict RLS Isolation - Zero Public SELECT)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id VARCHAR(16) UNIQUE NOT NULL, -- e.g. VTX2-001
  team_name VARCHAR(120) NOT NULL,
  track_id VARCHAR(32) NOT NULL,
  problem_code VARCHAR(32) NOT NULL,
  academic_tier VARCHAR(32) NOT NULL,
  team_size INT NOT NULL CHECK (team_size IN (2, 3, 4)),
  
  -- Round 1 Status & Submissions
  ppt_pdf_drive_url TEXT,
  extracted_slide_text TEXT,
  round1_status VARCHAR(20) DEFAULT 'pending' CHECK (round1_status IN ('pending', 'shortlisted', 'waitlisted', 'rejected')),
  
  -- Round 2 Gatekeeper Security & Payments (Patch 4: Hidden from public)
  secret_passcode VARCHAR(10) NOT NULL, -- Random 6-char uppercase string
  is_shortlisted BOOLEAN DEFAULT false,
  utr_number VARCHAR(16),
  payment_screenshot_url TEXT,
  is_paid_verified BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS & Drop any public SELECT policies
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Teams are viewable by public" ON public.teams;

-- ==============================================================================
-- 3. MEMBERS TABLE (Individual Student Details for Flat-Row Exports)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id VARCHAR(16) REFERENCES public.teams(team_id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('leader', 'member_2', 'member_3', 'member_4')),
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  gender VARCHAR(20) NOT NULL,
  college_name VARCHAR(200) NOT NULL,
  department VARCHAR(120) NOT NULL,
  year_of_study VARCHAR(32) NOT NULL,
  
  is_present_checkin BOOLEAN DEFAULT false,
  is_present_audit1 BOOLEAN DEFAULT false,
  is_present_audit2 BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Participants can be viewed by public" ON public.members;

-- ==============================================================================
-- 4. SECURE POSTGRESQL RPC FUNCTIONS (SECURITY DEFINER - Patch 4)
-- ==============================================================================

-- RPC 1: Register Free Team (Generates VTX2-001 & 6-char Passcode)
CREATE SEQUENCE IF NOT EXISTS public.vtx2_team_seq START 1;

CREATE OR REPLACE FUNCTION public.register_free_team(
  p_team_name TEXT,
  p_track_id TEXT,
  p_problem_code TEXT,
  p_academic_tier TEXT,
  p_team_size INT,
  p_members JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seq_val INT;
  v_team_id TEXT;
  v_passcode TEXT;
  v_member JSONB;
BEGIN
  -- Generate atomic sequence ID
  v_seq_val := nextval('public.vtx2_team_seq');
  v_team_id := 'VTX2-' || LPAD(v_seq_val::TEXT, 3, '0');
  
  -- Generate 6-character random uppercase passcode
  v_passcode := SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 6);
  v_passcode := UPPER(v_passcode);

  -- Insert Team
  INSERT INTO public.teams (
    team_id, team_name, track_id, problem_code, academic_tier, team_size, secret_passcode
  ) VALUES (
    v_team_id, p_team_name, p_track_id, p_problem_code, p_academic_tier, p_team_size, v_passcode
  );

  -- Insert Members
  FOR v_member IN SELECT * FROM jsonb_array_elements(p_members)
  LOOP
    INSERT INTO public.members (
      team_id, role, full_name, email, phone, gender, college_name, department, year_of_study
    ) VALUES (
      v_team_id,
      v_member->>'role',
      v_member->>'full_name',
      v_member->>'email',
      v_member->>'phone',
      v_member->>'gender',
      v_member->>'college_name',
      v_member->>'department',
      v_member->>'year_of_study'
    );
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'team_id', v_team_id
  );
END;
$$;

-- RPC 2: Lookup Team for PPT Submission (Patch 2)
CREATE OR REPLACE FUNCTION public.lookup_team_for_ppt(p_identifier TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_team RECORD;
BEGIN
  SELECT t.team_id, t.team_name, t.track_id, t.problem_code, (t.ppt_pdf_drive_url IS NOT NULL) AS has_submitted
  INTO v_team
  FROM public.teams t
  LEFT JOIN public.members m ON t.team_id = m.team_id
  WHERE UPPER(t.team_id) = UPPER(TRIM(p_identifier))
     OR LOWER(m.email) = LOWER(TRIM(p_identifier))
     OR m.phone = TRIM(p_identifier)
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('found', false);
  END IF;

  RETURN jsonb_build_object(
    'found', true,
    'team_id', v_team.team_id,
    'team_name', v_team.team_name,
    'track_id', v_team.track_id,
    'problem_code', v_team.problem_code,
    'has_submitted', v_team.has_submitted
  );
END;
$$;

-- RPC 3: Verify Round 2 Gatekeeper (Patch 4)
CREATE OR REPLACE FUNCTION public.verify_round2_gatekeeper(p_team_id TEXT, p_passcode TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_team RECORD;
  v_fee_per_head INT;
BEGIN
  SELECT round2_fee_per_member INTO v_fee_per_head FROM public.event_state WHERE id = 1;
  IF v_fee_per_head IS NULL THEN v_fee_per_head := 500; END IF;

  SELECT team_id, team_name, team_size, is_shortlisted, is_paid_verified, utr_number
  INTO v_team
  FROM public.teams
  WHERE UPPER(team_id) = UPPER(TRIM(p_team_id))
    AND UPPER(secret_passcode) = UPPER(TRIM(p_passcode))
    AND is_shortlisted = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Invalid passcode or team not shortlisted for Round 2.');
  END IF;

  RETURN jsonb_build_object(
    'valid', true,
    'team_id', v_team.team_id,
    'team_name', v_team.team_name,
    'team_size', v_team.team_size,
    'fee_per_member', v_fee_per_head,
    'total_fee', v_team.team_size * v_fee_per_head,
    'is_paid_verified', v_team.is_paid_verified,
    'submitted_utr', v_team.utr_number
  );
END;
$$;
```

---

## 9. Step-by-Step Implementation Sequence (Phased Roadmap)

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        7-PHASE SYSTEMATIC EXECUTION ROADMAP                            │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 1: CONFIGURATION & DATABASE FOUNDATION (Execute Now)                             │
│ • Update `src/config/eventConfig.js` with 2-stage rules, 5 tracks, and 25 problems.    │
│ • Create `backend_sql/005_two_stage_hackathon_schema.sql` (Tables, sequences, RPCs).    │
│ • Update `src/lib/api.js` with secure RPC wrappers (register, lookup, gatekeeper).     │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 2: PUBLIC LANDING PAGE OVERHAUL (`/`) (Execute Now)                              │
│ • Create `LiveArenaBanner.jsx` (Mounts when is_clock_public == true).                  │
│ • Rewrite `HeroSection.jsx` with ₹0 Free pills, new headline, and Dec 1 countdown.      │
│ • Create `TwoStagePipeline.jsx` (Chapter 01 // The Two-Stage Gauntlet).                │
│ • Create `TracksAndVaultSection.jsx` (5 Track Bento Cards + 3 Download Cards).         │
│ • Update `RulesBento.jsx` (4 Bento Cards reflecting 2-stage protocol and live twists). │
│ • Update `TimelineSection.jsx` with Tab A (Roadmap) and Tab B (24H Schedule).          │
│ • Update `PrizeSection.jsx` with modular recognition and career perks.                 │
│ • Update `FaqSection.jsx` with the 6 approved plain-language questions and contacts.  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 3: DYNAMIC REGISTRATION FUNNEL OVERHAUL (`/register`)                            │
│ • Implement dynamic team size selector pills: [2 Members] | [3 Members] | [4 Members]. │
│ • Dynamically mount/unmount Member 3 and 4 form cards based on selector state.         │
│ • Remove all ₹1,000 payment boxes, UPI QR codes, and UTR dropzones from `/register`.   │
│ • Add high-contrast 100% Free confirmation box and wire to `register_free_team` RPC.  │
│ • Build Post-Registration Success Modal with Printable Slip, WhatsApp & PPT download.  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 4: ZERO-COST PPT SUBMISSION PORTAL (`/submit-ppt`)                               │
│ • Client-side `pdfjs-dist` text extraction and page-count limit ($\le 8$ slides).      │
│ • Build "Forgot Team ID?" lookup modal triggering `lookup_team_for_ppt`.               │
│ • Create Google Apps Script Web App template (`backend_scripts/google_drive_bridge.js`)│
│ • Wire upload handler to stream PDF base64 + extracted text to Drive and save preview. │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 5: LOCKED ROUND 2 GATEKEEPER & PAYMENT PORTAL (`/round2-confirm`)                │
│ • Build `/round2-confirm` route with `verify_round2_gatekeeper` RPC passcode lock.     │
│ • Fetch dynamic `round2_fee_per_member` and render dynamic fee math.                   │
│ • Display dynamic UPI QR code generator, 12-digit UTR input, and screenshot upload.    │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 6: ADMIN COMMAND CENTER (`/admin`)                                               │
│ • Build password-protected `/admin` layout with 4 Chrome-style tabs.                   │
│ • Tab 1: Split-screen Round 1 evaluation with `/preview` embedded PDF viewer.          │
│ • Mobile fallback: Slide-over modal with embedded viewer and fixed bottom buttons.     │
│ • Implement Flat-Row Student Excel Export (1 row per student · 1,000 contacts).        │
│ • Tab 2: Dynamic fee adjuster, UTR verification, and Paid toggle.                      │
│ • Tab 3: Attendance checklist and OD export.                                           │
│ • Tab 4: 24-Hour Live Arena Clock controls and live announcement broadcaster.          │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 7: VERIFICATION, TESTING & LAUNCH GATE                                           │
│ • Audit 360px, 375px, 414px, and 1440px viewports (Zero horizontal overflow).          │
│ • Verify Core Web Vitals (LCP < 1.5s, CLS < 0.01, INP < 50ms).                         │
│ • Verify WCAG AA contrast compliance across all new colored cards.                     │
│ • Run end-to-end simulated test from Free Registration -> PPT Submit -> Admin Review.  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Anti-Hallucination & Superior AI Verification Matrix

| Audit Check ID | Verification Question / Assertion | Pass Criteria |
| :--- | :--- | :--- |
| **VERIFY-01** | Is Round 1 registration completely free of payment demands? | `/register` has zero UPI QR images, zero ₹1,000 fee inputs, and zero UTR requirements. |
| **VERIFY-02** | Does the team size selector dynamically control DOM elements? | Selecting "2 Members" hides Members 3 & 4 completely from DOM and validation schema. |
| **VERIFY-03** | Are Team IDs generated atomically without race conditions? | Sequential format `VTX2-001` through `VTX2-500` generated via PostgreSQL sequence. |
| **VERIFY-04** | Are unshortlisted teams strictly blocked from Round 2 payments? | Entering an unshortlisted Team ID on `/round2-confirm` renders the Access Denied card. |
| **VERIFY-05** | Does the dynamic fee math calculate accurately? | Total Fee strictly equals `team_size * round2_fee_per_member` (configurable). |
| **VERIFY-06** | Can volunteers evaluate PPTs without downloading files? | `/admin` Tab 1 displays an in-browser embedded PDF preview (`.../preview`) alongside buttons. |
| **VERIFY-07** | Does the Excel export produce flat student rows? | Export has 1 row per individual participant (not 1 row per team), totaling ~1,000 rows. |
| **VERIFY-08** | Are there zero em-dashes (`—`) in all new copy strings? | AST string scan returns 0 occurrences of Unicode `\u2014` in visible JSX nodes. |
| **VERIFY-09** | Does the landing page load without horizontal scroll on 360px? | Mobile viewport width test at 360px records zero overflow (`scrollWidth === clientWidth`). |
| **VERIFY-10** | Are touch targets and input font sizes compliant with iOS? | All inputs are `h-12` ($48\text{px}$) with `font-size: 16px` (`text-base`). |

---

*End of Patched Architectural Specification. Proceeding to Phase 1 & Phase 2 implementation.*
