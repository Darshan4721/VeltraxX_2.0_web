# VELTRAXX 2.0 — Engineering & Design Workspace

> **National-Level 24-Hour VLSI & Semiconductor Engineering Hackathon**  
> Organized by the VLSI Faculty Team & Department of ECE, Sri Shakthi Institute of Engineering and Technology (SIET), Coimbatore.

---

## 🚀 IDE Quickstart & Context Onboarding

If you are opening this workspace in an IDE (VS Code, Windsurf, Cursor, Antigravity):

### 1. The Core Architecture & Rule of Truth
- **Single Source of Event Truth:** [`docs/specs/eventConfig.json`](file:///D:/tmp/veltraxx_2.o/docs/specs/eventConfig.json) and [`docs/VELTRAXX_2.0_EVENT_CONFIG.md`](file:///D:/tmp/veltraxx_2.o/docs/VELTRAXX_2.0_EVENT_CONFIG.md).
- **Rule:** Never hardcode event details (dates, fees, capacity, prizes, contacts) in UI components. Always consume `eventConfig`.
- **Aesthetic:** Strict Light Mode gallery canvas (`#FBFBFB`), Swiss editorial typography, 2.5D spatial depth, and high-voltage Solar Wafer Yellow (`#FFE500`) accents. Zero generic dark mode.
- **Visual Identity:** 100% VLSI / Semiconductor first (silicon dies, wafers, GDSII floorplans, FPGA probing, STA eye-diagrams). Zero generic laptop/hoodie hacker tropes.

---

## 📂 Project Directory Structure

```text
D:\tmp\veltraxx_2.o/
├── docs/                                  # Centralized Project Documentation
│   ├── PROJECT_MEMORY.md                 # Master memory ledger (Turns 1–11)
│   ├── IDE_HANDOFF_GUIDE.md              # Exact step-by-step IDE instructions
│   ├── VELTRAXX_2.0_EVENT_CONFIG.md      # Authoritative 2.0 event configuration
│   ├── specs/                            # Active Design & Technical Blueprints
│   │   ├── eventConfig.json              # Machine-readable single source of truth
│   │   ├── SITE_PAGES_ARCHITECTURE.md    # Master site routing & page specifications
│   │   ├── MASTER_HACKATHON_PAGE_PLAN.md # 5-chapter, 14-section page blueprint
│   │   ├── HERO_SECTION_BLUEPRINT.md     # 2.5D spatial hero stage blueprint
│   │   └── VELTRAXX_2.0_DESIGN_SYSTEM.md # Apple design tokens & typography
│   ├── legacy/                           # 1.0 Historical Knowledge & Post-Mortem
│   │   ├── VELTRAXX_LEGACY_EVENT_KNOWLEDGE.md
│   │   ├── veltraxx_1.0_learning.md
│   │   └── VELTRAXX_26_FAILURE_LEDGER.md
│   └── references/                       # UI design reference images
├── images/                               # VLSI-First Image Prompt Specifications
│   ├── 01_hero_silicon_die.md            # Macro exposed ASIC silicon die (16:9 & 4:5)
│   ├── 02_silicon_wafer_litho.md         # 300mm monocrystalline wafer (3:2 & 1:1)
│   ├── 03_physical_layout_floorplan.md   # GDSII multi-tier layout strata (3:2 & 1:1)
│   ├── 04_fpga_hardware_probing.md       # Bare-die FPGA package & micro-probes (16:9 & 1:1)
│   ├── 05_timing_waveform_closure.md     # STA eye-diagrams & timing arcs (3:2 & 1:1)
│   ├── 06_silicon_championship_trophy.md # Monocrystalline wafer & glass trophy (4:5 & 1:1)
│   └── README.md                         # VLSI Visual Identity Constitution
├── backend_sql/                          # Dedicated PostgreSQL & Supabase Migrations
├── design-research/                      # Curated Tier 1 Libraries (Atropos, GSAP, GlinUI)
└── version_1.0/                          # 1.0 Historical Codebase Reference
```

---

## ⚡ Current Status & Immediate Next Step in the IDE

- **Status:** Planning, design system, forensic audit, configuration layer, and image specifications are **100% complete and verified**.
- **Next Phase:** Scaffolding the React frontend application using Vite, Tailwind CSS, Atropos 2.5D, Motion, and GSAP.
- **Handoff Guide:** Read [`docs/IDE_HANDOFF_GUIDE.md`](file:///D:/tmp/veltraxx_2.o/docs/IDE_HANDOFF_GUIDE.md) for the exact prompt to give the IDE assistant.
