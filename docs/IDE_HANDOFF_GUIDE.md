# VELTRAXX 2.0 — IDE Handoff & Execution Guide
**Document Identifier:** `docs/IDE_HANDOFF_GUIDE.md`  
**Purpose:** Zero-friction transition from CLI to IDE (VS Code, Cursor, Windsurf, Antigravity IDE)

---

## 1. How to Open the Workspace in Your IDE

1. Launch your IDE (VS Code, Cursor, Windsurf).
2. Choose **File ➔ Open Folder...**
3. Select the folder: `D:\tmp\veltraxx_2.o`
4. The IDE will automatically detect the clean directory structure and root `README.md`.

---

## 2. What Has Been Completed So Far (Zero Loss of Context)

Everything we built and refined in the CLI is preserved directly on disk:
- ✅ **Clean Directory Layout:** Zero root bloat. Everything organized into `docs/`, `images/`, `backend_sql/`, `design-research/`.
- ✅ **Authoritative Configuration:** [`docs/specs/eventConfig.json`](file:///D:/tmp/veltraxx_2.o/docs/specs/eventConfig.json) and [`docs/VELTRAXX_2.0_EVENT_CONFIG.md`](file:///D:/tmp/veltraxx_2.o/docs/VELTRAXX_2.0_EVENT_CONFIG.md) lock the confirmed 1.0 baseline (28–29 August 2026, ₹1,000 fee, 35 team cap, 4 members, BYOD EDA/hardware, internship + Synopsys workshop prize).
- ✅ **5-Chapter Narrative Plan:** [`docs/specs/MASTER_HACKATHON_PAGE_PLAN.md`](file:///D:/tmp/veltraxx_2.o/docs/specs/MASTER_HACKATHON_PAGE_PLAN.md) details all 14 sections with a Visual Intensity Scale (Levels 1 to 4).
- ✅ **Hero Stage Blueprint:** [`docs/specs/HERO_SECTION_BLUEPRINT.md`](file:///D:/tmp/veltraxx_2.o/docs/specs/HERO_SECTION_BLUEPRINT.md) details the Atropos 2.5D spatial stage.
- ✅ **Design System Tokens:** [`docs/specs/VELTRAXX_2.0_DESIGN_SYSTEM.md`](file:///D:/tmp/veltraxx_2.o/docs/specs/VELTRAXX_2.0_DESIGN_SYSTEM.md) specifies Apple spring physics, strict Light Mode `#FBFBFB`, and color tokens.
- ✅ **VLSI-First Image Prompts:** [`images/`](file:///D:/tmp/veltraxx_2.o/images) contains all 6 technical prompts for silicon dies, wafers, GDSII floorplans, FPGA probing, STA waveforms, and the championship trophy.
- ✅ **Research Stack:** All 12 Tier 1 repos are cloned and inspected in [`design-research/`](file:///D:/tmp/veltraxx_2.o/design-research).

---

## 3. The 3 Inviolable Operating Rules in the IDE

When working in the IDE, make sure your agent follows these 3 core rules:
1. **Rule of Single Configuration (`CONFIGURATION ➔ COMPONENTS ➔ UI`):**  
   Never hardcode strings like `"August 28–29"`, `"₹1,000"`, `"35 Teams"`, or faculty contacts directly inside JSX components. Always import from `src/config/eventConfig.js` (which copies `docs/specs/eventConfig.json`).
2. **Rule of Strict Light Mode:**  
   The page canvas is `#FBFBFB` gallery white with `#111116` carbon text and `#FFE500` Solar Wafer Yellow accents. Zero generic dark mode.
3. **Rule of VLSI Visual Authenticity:**  
   Zero generic hackathon laptops, zero hoodies, zero sci-fi cyborgs. Every visual asset must be authentic semiconductor engineering.

---

## 4. Exact Prompt to Give the IDE Agent

Once you open the IDE and open the agent chat panel, simply paste this exact prompt:

```text
I am continuing development on VELTRAXX 2.0 in D:\tmp\veltraxx_2.o.

All master specifications and configuration files are already prepared and located in the workspace:
- Read `README.md` and `docs/PROJECT_MEMORY.md` for context.
- Read `docs/specs/eventConfig.json` as the SINGLE AUTHORITATIVE SOURCE OF TRUTH for all event data.
- Read `docs/specs/MASTER_HACKATHON_PAGE_PLAN.md` for the complete 5-chapter, 14-section page blueprint.
- Read `docs/specs/HERO_SECTION_BLUEPRINT.md` for the Atropos 2.5D spatial hero stage.
- Read `docs/specs/VELTRAXX_2.0_DESIGN_SYSTEM.md` for light-mode design tokens and spring physics.

We are ready to start Phase 3 (Frontend Implementation):
1. Initialize the modern React Vite app (using Tailwind CSS, Lucide icons, Atropos, Motion/Framer Motion, and GSAP).
2. Wire `src/config/eventConfig.js` to feed data into all components.
3. Build the Hero Section with the Atropos 2.5D spatial stage and fluid responsive layout.

Proceed with the build following the One-Shot Autonomous Build standard.
```

That's it! The IDE agent will pick up seamlessly with zero repeated explanations.
