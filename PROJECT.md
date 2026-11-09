# Project: Veltraxx 2.0 About Page Redesign Plan

## Architecture
- **Document Boundary**: Single authoritative, comprehensive redesign specification file at `docs/about/REDESIGN_PLAN.md`.
- **Target Implementation Boundary (Future Execution)**: Decomposition of `src/pages/AboutPage.jsx` into 11 modular components under `src/components/about/` following `src/pages/HomePage.jsx` architectural pattern (53-line shell orchestrating modular sections).
- **Design System Integration**: High-contrast Neo-Brutalist Industrial Pop aesthetic adhering to `src/index.css` tokens (Canvas #FAF8F5 / #FBFBFB, Pitch Black #111116, Acid Yellow #FFE500, Hot Pink #FF2E93, Electric Cyan #00E5FF, Neon Lime #B6FF00, Electric Blue #0055FF), 2px-3px solid carbon borders, 0px-blur hard drop shadows, chamfer badges, tilted micro-stickers, and spring physics.
- **Motion & Interactivity**: GSAP ScrollToPlugin, ScrollTrigger timeline pinning, 60fps GPU-accelerated vertical execution rail, 3D pop bento cards (`preserve-3d`, `translateZ`), and interactive tab switches.
- **Navigation Architecture**: Complete elimination of sticky subheader pill bar (lines 463-500 of `AboutPage.jsx`, state at line 133, subNavItems at lines 171-180, observer at lines 183-196) with no subheader on the page; PDF download integrated into Hero CTA and Section 10 Magazine Vault.
- **Fact Grounding**: 100% grounded in `Collage vlsi magazine.pdf`, `docs/about/CONTENT_MAP.md`, and `docs/about/ocr_full.txt` with zero hallucinated stakeholders, zero dummy sections, and zero em-dashes (—).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | Executive Summary & Neo-Brutalist Architecture Blueprint | Overall design thesis, parity with HomePage.jsx, 11-component decomposition tree, and elimination of monolithic 2,101-line anti-pattern | M1 | Survey (Explorer 1 & 3) |
| F2 | Complete Subheader Elimination Plan | Exact line-by-line removal specification for sticky subheader pill bar (lines 463-500, activeSection hook, subNavItems, observer) and relocation of PDF download to Hero & Section 10 | M1 | Survey (Explorer 3) |
| F3 | Neo-Brutalist Color Harmony & Anti-Monochrome Strategy | Systematic palette assignment across all 11 sections using exact tokens (#FAF8F5, #111116, #FFE500, #FF2E93, #00E5FF, #B6FF00, #0055FF) replacing monochrome white/off-white card repetition | M1 | Survey (Explorer 1 & 3) |
| F4 | Typography Hierarchy & Micro-Brutalist Styling | Plus Jakarta Sans headings, JetBrains Mono metadata/badges, uppercase tracked headers, chamfer octagonal badges, vital-tilt micro-stickers, and caution ribbons | M1 | Survey (Explorer 1) |
| F5 | GSAP Motion Choreography & Kinetic Architecture | ScrollTrigger timelines, continuous 60fps GPU scroll rail, spring tilt cubic-bezier(0.34, 1.56, 0.64, 1), 3D Z-axis pop bento grid, and stagger entrances | M1 | Survey (Explorer 1) |
| F6 | Section 1: Asymmetric Hero & Magazine Portal | 12-column asymmetric split, live pulse badge, bold typography, 2.5D layered magazine cover cutout with Atropos depth, and dual CTAs | M1 | Survey (Explorer 1, 2, 3) |
| F7 | Section 2: Dual Marquee & Departmental Statistics | Intersecting tilted ribbons (-rotate-2 #0D0D11, rotate-1 #FFE500), continuous marquee loop, and 4 high-voltage metric chips | M1 | Survey (Explorer 1 & 2) |
| F8 | Section 3: Institutional Vision & Leadership | 3D pop cards for Chairman, Secretary, Joint Secretary, Principal, HOD, and 4 AP faculty, highlighting authentic MLK/Gandhi inspirations and the 5-Stage VLSI Innovation model | M1 | Survey (Explorer 2) |
| F9 | Section 4: MeitY C2S EDA Labs & Infrastructure | Interactive tabbed workbench for 7 commercial EDA workshops (Cadence, Synopsys, Entuple) and lab infrastructure specifications | M1 | Survey (Explorer 2 & 3) |
| F10 | Section 5: 17 Undergraduate Silicon Research Projects | Asymmetric bento grid categorized by domain (AI/Neuromorphic, Security/Crypto, High-Speed/SoC, Signal Processing, Specialized Compute) with authors, batch years, toolchains, and zero em-dashes | M1 | Survey (Explorer 2) |
| F11 | Section 6: Flagship Competitive Arenas | High-contrast side-by-side battle arenas: VELTRAXX '26 24H Hackathon (RTL-to-GDSII) and The Lost Silicon Circuit Debugging Challenge | M1 | Survey (Explorer 2) |
| F12 | Section 7: National Delegations & Conclaves | Continuous vertical execution rail with dynamic glow nodes tracking SEMICON India, 30th VDAT, 3rd DIRV, IEEE CAS Kerala, IIT Tirupati, QUANTUM PRO '26 | M1 | Survey (Explorer 1 & 2) |
| F13 | Section 8: Fellowships, Startups & Honors | Samsung India Fellow cards, Kavieshwara M InterviewBot startup feature, AI-ML Hackathon awards, and 21+ NPTEL Elite scholars | M1 | Survey (Explorer 2) |
| F14 | Section 9: Holistic Excellence Beyond Silicon | Dynamic quad-switch tab for National Pistol Shooting (Abirami S.A 13+ medals), NCC Republic Day Cadets, Cultural Champions (The Illusion Crew), and Student Clubs | M1 | Survey (Explorer 2) |
| F15 | Section 10: Departmental Magazine Vault & Archives | Interactive digital publication vault with 3D magazine spread viewer, direct PDF download trigger, and editorial masthead | M1 | Survey (Explorer 2 & 3) |
| F16 | Section 11: Closing Call to Action & Departmental Inquiries | Bold high-voltage closing banner with official HOD contact, counselling code (2727), lab visit inquiry modal, and footer transition | M1 | Survey (Explorer 1 & 2) |
| F17 | Content Integrity & Zero Em-Dash Enforcement | Complete verification of all authentic facts from Collage vlsi magazine.pdf and CONTENT_MAP.md with zero em-dashes anywhere in visible copy | M1 | Survey (Explorer 2) |
| F18 | Implementation Roadmap & Scope Isolation Checklist | Verification checklist ensuring zero source code modifications to other pages, npm run build passing, and clear step-by-step implementation guide | M1 | Survey (Explorer 3) |
| F19 | Immediate Fixes & Verification | Confirm max_teams: 2000 in config/api, header download pointer glitch resolution, and npm run build clean compilation | M2 | Survey (Explorers 1, 2, 3) |
| F20 | Mobile-First Viewport Audit Catalog | Page-by-page flaw catalog across 375px (iPhone SE), 390px (iPhone standard), and 412px (Android standard) detailing layout overflows, cramped cards, and 5 touch target violations | M2 | Survey (Explorer 1) |
| F21 | Kinetic Polish & Neo-Brutalist Motion Benchmark | Systematic extraction of Our Journey (/about) GSAP ScrollTrigger timelines, cubic-bezier(0.34, 1.56, 0.64, 1) spring easing, 60fps GPU acceleration, hard drop shadows, and chamfer badges | M2 | Survey (Explorer 2) |
| F22 | Mobile-First Responsive Redesign Specifications | Component-by-component responsive redesign blueprints elevating every page to the Our Journey kinetic standard | M2 | Survey (Explorers 1 & 2) |
| F23 | Contact Privacy Protection Architecture | Masking/hiding raw telephone numbers across overview and journey pages, compact <ContactActionGroup /> icon buttons, and reserving raw details strictly to Help Center | M2 | Survey (Explorers 1 & 2) |
| F24 | User Report Page Architecture & UX Specification | Dedicated /report issue submission portal, category/urgency taxonomy, Zod validation, ticket generation (TKT-26-XXXXXX), and Supabase persistence | M2 | Survey (Explorer 2) |
| F25 | Supabase Production Database & RLS Architecture | Complete schemas for teams, team_members, registrations, user_reports, announcements, email_outbox, RLS security matrix, and transactional RPC register_free_team | M2 | Survey (Explorer 3) |
| F26 | Concurrency-Safe Sequential Ticket Generator | Truncation-proof sequence generator (VTX2-001 to VTX2-2000+) with pg_advisory_xact_lock(74218931) | M2 | Survey (Explorer 3) |
| F27 | GAS Webhook Bridge & Gmail Quota Overflow Strategy | Resilient async queue, Google Sheets audit trail, Drive folder automation, single-submitter leader delivery policy, and email_outbox state machine | M2 | Survey (Explorer 3) |
| F28 | Vercel SPA Routing & Security Headers Specification | Production vercel.json with SPA rewrites, CSP, HSTS, Permissions-Policy (screen-wake-lock), and immutable caching | M2 | Survey (Explorer 3) |
| F29 | High-Visibility SEO & Social WhatsApp Preview Card | 1200x630 Neo-Brutalist OpenGraph card (og-banner.jpg), automated SVG/Sharp generator, JSON-LD schema, and Core Web Vitals monitoring | M2 | Survey (Explorer 3) |
| F30 | 24-Hour Live Arena Screen & Admin Readiness | Screen Wake-Lock API, drift-free server timestamp countdown, Web Audio API alert chimes, SheetJS flat-row XLSX exports, and WhatsApp community link | M2 | Survey (Explorer 3) |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Authoring REDESIGN_PLAN.md | Author comprehensive, exhaustive A-to-Z redesign plan at `docs/about/REDESIGN_PLAN.md` covering all 18 features (F1-F18), strict fact grounding, zero em-dashes, full color harmony, subheader elimination, and GSAP motion choreography | None | DONE |
| M2 | Master Plan & Codebase Audit Deliverable | Author comprehensive, exhaustive Master Plan and Audit deliverable at `docs/mobile_master_plan/MOBILE_MASTER_PLAN_AND_AUDIT.md` covering F19-F30, immediate fixes verification, page-by-page mobile audit across 375px/390px/412px, kinetic polish specifications, contact privacy architecture, user report page specs, and cloud/SEO/Live Arena/Admin execution plans | M1 | DONE |

## Interface Contracts
### `docs/about/REDESIGN_PLAN.md` ↔ Target `AboutPage.jsx` Architecture
- Output file path: `docs/about/REDESIGN_PLAN.md`
- Target modular structure: `src/pages/AboutPage.jsx` (shell) + `src/components/about/AboutHero.jsx`, `AboutMarqueeStats.jsx`, `AboutLeadership.jsx`, `AboutWorkshops.jsx`, `AboutSiliconResearch.jsx`, `AboutCompetitions.jsx`, `AboutNationalExposure.jsx`, `AboutHonours.jsx`, `AboutBeyondSilicon.jsx`, `AboutMagazineVault.jsx`, `AboutClosingCta.jsx`.
- Strict boundary rule: No source files in `src/` or elsewhere were modified during this planning milestone.

### `docs/mobile_master_plan/MOBILE_MASTER_PLAN_AND_AUDIT.md` ↔ Target Veltraxx 2.0 Full-App Execution
- Output deliverable path: `docs/mobile_master_plan/MOBILE_MASTER_PLAN_AND_AUDIT.md`
- Scope: Authoritative, exhaustive master planning and codebase audit document synthesizing Explorer 1 (mobile audit, immediate fixes), Explorer 2 (kinetic motion, contact privacy, user reports), and Explorer 3 (cloud infrastructure, SEO/OG, Live Arena screen, Admin readiness).
- Immediate fixes verification: `max_teams: 2000`, header download pointer glitch, `npm run build` clean output.

## Code Layout
- Documentation M1: `docs/about/REDESIGN_PLAN.md` (authoritative redesign plan deliverable, 979 lines)
- Documentation M2: `docs/mobile_master_plan/MOBILE_MASTER_PLAN_AND_AUDIT.md` (master plan & mobile audit deliverable)
- Agent state & coordination: `.agents/teamwork/` (metadata only)
- Existing code: `src/`, `backend_sql/`, `public/` (read-only reference during planning)
