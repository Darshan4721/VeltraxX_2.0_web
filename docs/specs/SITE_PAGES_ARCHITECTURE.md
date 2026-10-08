# VELTRAXX 2.0 — Complete Site Pages & Routing Architecture
**Document Identifier:** `docs/specs/SITE_PAGES_ARCHITECTURE.md`  
**Status:** FINALIZED SPECIFICATION (APPROVED BY OWNER)  
**Parent Contract:** [`docs/PROJECT_MEMORY.md`](file:///D:/tmp/veltraxx_2.o/docs/PROJECT_MEMORY.md)  
**Configuration Source:** [`docs/specs/eventConfig.json`](file:///D:/tmp/veltraxx_2.o/docs/specs/eventConfig.json)  
**Design Tokens:** [`docs/specs/VELTRAXX_2.0_DESIGN_SYSTEM.md`](file:///D:/tmp/veltraxx_2.o/docs/specs/VELTRAXX_2.0_DESIGN_SYSTEM.md)  

---

## 1. Master Site Map Overview

The complete web platform consists of **4 distinct operational tiers**:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        1. PUBLIC TIER (Mobile + PC)                    │
├────────────────────────────────────────────────────────────────────────┤
│ 1.  /             ──> Master Hackathon Landing Page                    │
│                        (All-in-One: Rules, Schedule, Challenge, FAQ,   │
│                         Contacts, Multiple Registration Entrypoints)   │
│ 2.  /register     ──> Dedicated Registration Funnel (4-Member Form,    │
│                        UPI QR Step, Screenshot Upload, Dynamic Cap)    │
│ 3.  /department   ──> Department Lineage & Research Lab (C2S Linux Lab,│
│                        Workshop History, Student Silicon, HR Conclave) │
├────────────────────────────────────────────────────────────────────────┤
│                 2. COORDINATOR SHAREABLE TIER (Mobile-Only)            │
├────────────────────────────────────────────────────────────────────────┤
│ 4.  /tracker      ──> Unauthenticated Read-Only Mobile Registration    │
│                        Roster (Shareable WhatsApp link, New vs Verified│
│                        badges, tap-to-view receipt photo, zero admin)  │
├────────────────────────────────────────────────────────────────────────┤
│                 3. AUDITORIUM STAGE TIER (Projector Display)           │
├────────────────────────────────────────────────────────────────────────┤
│ 5.  /arena        ──> Stage 24-Hour Realtime Clock (Controlled via     │
│                        Admin Switch: LIVE on event day, else STANDBY)  │
├────────────────────────────────────────────────────────────────────────┤
│                 4. ADMIN & OPERATIONS TIER (Authenticated, Desktop)    │
├────────────────────────────────────────────────────────────────────────┤
│ 6.  /admin        ──> Secure Authentication Gate ➔ 4 Dedicated Views:  │
│     ├── [View 1]  Launch Screen (Ceremony ignition button & animation) │
│     ├── [View 2]  Timer Controls (Pause, resume, reset, time adjust,   │
│     │              and the master Stage Live/Standby toggle)           │
│     ├── [View 3]  Full Registrations Hub (Verify payments, send        │
│     │              confirmation emails, delete invalid, CSV export)    │
│     └── [View 4]  Attendance Matrix (4-slot volunteer check-in matrix) │
├────────────────────────────────────────────────────────────────────────┤
│                 5. UTILITY                                             │
├────────────────────────────────────────────────────────────────────────┤
│ 7.  * (404)       ──> Polished Light-Mode "Page Not Found" Fallback    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Detailed Page Specifications

### Page 1: `/` — Master Hackathon Landing Page
- **Audience:** All participants, mentors, sponsors, and general public.
- **Responsive Target:** Both Mobile (9:16) and PC / Laptop (16:9).
- **Core Principle:** **Zero fragmentation.** Everything related to the hackathon lives on this single master page:
  - **Section 01: Hero Stage:** Atropos 2.5D spatial stage, title `VELTRAXX 2.0`, metadata, primary CTA `[ REGISTER YOUR TEAM → ]`.
  - **Section 02: Institutional Lineage:** C2S semiconductor cleanroom heritage, SIET Department of ECE/VLSI.
  - **Section 03: Event Parameters & Ground Vitals:** 24-Hour duration, ₹1,000 flat fee, 35 team capacity, 4-member teams, 100% offline.
  - **Section 04: The Challenge:** Unified industry problem statement model, 48-hour advance reveal window.
  - **Section 05: Infrastructure & BYOD Protocol:** What organizers provide (power, Wi-Fi, food, tables) vs. what participants must bring (laptops, EDA licenses, FPGA boards).
  - **Section 06: 24-Hour Timeline Rail:** Day 1 to Day 2 milestones, meal breaks, and 4 attendance check-in slots.
  - **Section 07: Rules of Engagement:** Code of conduct, team integrity, originality standards, and attendance mandates.
  - **Section 08: Generative AI Policy:** Permitted assistance (syntax, scripts, debugging) vs. prohibited generation.
  - **Section 09: Evaluation & Validation:** Industry semiconductor jury, live hardware test bench validation, static timing analysis (STA).
  - **Section 10: Prizes & Industry Launchpad:** Sole winning team champion (direct industrial internships + Synopsys workshop grant), silicon wafer trophy, MEMS certificates.
  - **Section 11: Trust Anchors & Partners:** Entuple Technologies, VLSI Minds, C2S.
  - **Section 12: Frequently Asked Questions:** Instant spring accordion for critical inquiries.
  - **Section 13: Organizing Committee & Helpdesk:** Direct click-to-call links for faculty leadership and student leads.
  - **Section 14: Final Conversion Anchor:** High-contrast carbon banner with live capacity ticker.
- **Navigation Prominence:** Multiple prominent entry points linking directly to `/register` (Sticky top bar, Hero button, Mid-page prompts, Footer closer).

---

### Page 2: `/register` — Dedicated Registration & Payment Funnel
- **Audience:** Team Leaders registering their 4-member teams.
- **Responsive Target:** Mobile (9:16) and PC / Laptop (16:9).
- **Key Modules:**
  1. **Dynamic Capacity Gate:** Header telemetry displaying real-time claimed slots (`X / 35 Teams`). Automatically locks and shows the official closed state once capacity reaches 35.
  2. **4-Member Team Form:** Structured inputs for 1 Leader and 3 Participants (Full Name, Email, Phone, College/Organization, Department, Degree).
  3. **Payment Step (UPI QR):** Displays official ₹1,000 payment QR code.
  4. **Receipt Upload:** File input for payment screenshot (max 2MB, formats: `image/*`), stored in private Supabase Storage bucket `receipts`.
  5. **Atomic Registration RPC:** Calls `register_team` to insert team and 4 members atomically; rolls back if capacity is exceeded or constraints fail.
  6. **Confirmation Screen:** Instant success screen with unique Registration UUID and next-step instructions.

---

### Page 3: `/department` — Department Lineage & Research Lab
- **Audience:** Students, faculty, academic visitors, and industry partners seeking institutional proof.
- **Responsive Target:** Mobile (9:16) and PC / Laptop (16:9).
- **Key Modules:**
  1. **Hero & Mission:** SIET Department of ECE & VLSI heritage.
  2. **Government C2S Laboratory:** First dedicated Linux semiconductor infrastructure with full Cadence & Synopsys tool suites.
  3. **Workshop Archive:** Chronological journey of past 20+ days of EDA training delivered by Entuple Technologies and VLSI Minds.
  4. **Student Silicon Innovations:** Proven taped-out student designs:
     - Built-In Self-Test (BIST) hardware security.
     - RISC processors.
     - Prefetchers & AI acceleration blocks.
     - DDR3 controllers & TPU architectures.
  5. **HR Conclave Engagements:** Past interactions and project reviews by senior engineers from Google (DFT) and Microsoft.

---

### Page 4: `/tracker` — Mobile Coordinator Read-Only Registration Roster
- **Audience:** Event coordinators, student leads, faculty members, and volunteers who need to monitor registrations on their mobile phones.
- **Access Level:** **Zero Authentication Required** (Public shareable URL for WhatsApp / Slack).
- **Responsive Target:** **Exclusively Mobile-First (Phone View)**.
- **Security & Permissions:** **100% Read-Only.** Zero admin privileges; zero ability to edit data, delete records, verify payments, or trigger emails.
- **Key Modules:**
  1. **Mobile Header Vitals:** Live count pill: e.g. `24 / 35 Teams Registered · 18 Verified`.
  2. **Filter Tabs:** `All`, `New / Unverified`, `Verified`.
  3. **Visual Status Badges:**
     - 🟡 **`NEW / PENDING`**: Uploaded receipt awaiting payment verification.
     - 🟢 **`VERIFIED`**: Confirmed spot approved by admin.
  4. **Team Cards Stream:** Fast, touch-friendly cards showing Team Name, Leader Name, Phone, and Submission Timestamp.
  5. **Tap-to-View Receipt Modal:** Tapping a card opens a full-screen image preview of the uploaded UPI payment receipt to visually inspect transaction IDs.
  6. **Roster Drawer:** Expandable view showing all 4 team members and their colleges.

---

### Page 5: `/arena` — Semi-Public Live Stage Screen
- **Audience:** Hackathon auditorium attendees, dignitaries, and competing teams.
- **Display Target:** Large auditorium smart boards, LED walls, and 16:9 ceiling projectors.
- **Operational Logic (Admin Gated Visibility):**
  - **Before Event Day / Standby Mode:** Shows a clean, minimalist **"STANDBY / SYSTEM LOCKED"** screen with event countdown or logo. The live clock is hidden.
  - **On Event Day / Live Mode:** When the Admin clicks **"Go Live"**, the screen transitions to the giant, server-synchronized 24-hour countdown clock with active milestone badges (e.g. `24-HOUR COUNTDOWN IGNITED`, `LUNCH BREAK`, `MIDNIGHT FUEL`, `PROJECT VALIDATION`).
  - Zero header, zero footer, zero scrollbars.

---

### Page 6: `/admin` — Authenticated Super-Admin Portal
- **Audience:** Faculty in charge, Lead Student Coordinators, Super-Admins.
- **Access Level:** **Role-Gated via Authentication** (Supabase Auth / Admin Login).
- **Responsive Target:** **Desktop-Optimized Only** (No mobile optimization required; designed for laptops and workstations).
- **The 4 Internal Admin Workspaces:**

#### [View 1] Launch / Ignition Screen
- Ceremony kickoff workspace used during the inaugural session.
- Features the **Ignite Hackathon** master button and fullscreen ignition countdown sequence to start the authoritative clock on stage.

#### [View 2] Timer Controls Switchboard
- Realtime clock governance:
  - **Start / Pause / Resume / Emergency Reset** with two-step confirmation.
  - Incremental adjustments (`+5 min`, `-5 min`, `+10 min`).
  - **Master Stage Visibility Switch:** One-click toggle to make the `/arena` projector screen **"Live"** or **"Hidden / Standby"**.

#### [View 3] Full Registrations Hub ("Who Has Registered")
- Complete team roster management table:
  - Real-time counter of total teams vs. 35 cap.
  - Status filters (`All`, `Pending`, `Verified`, `Rejected`).
  - Receipt inspection panel: Full-size preview of uploaded payment screenshots.
  - **Admin Action: Verify Payment:** Updates database status to `'verified'` and records admin timestamp.
  - **Admin Action: Send Confirmation:** Triggers official EmailJS confirmation packet to the team leader.
  - **Admin Action: Delete Registration:** Safely removes invalid/spam teams and cleans up storage.
  - **One-Click CSV / Excel Export:** Downloads sanitized participant roster for printing ID cards and certificates.

#### [View 4] Attendance Matrix Page
- High-speed check-in matrix for event day:
  - Search by team name or leader phone number.
  - 4 official check-in checkpoints:
    - **Slot 1:** Morning Check-In (09:30 AM – 10:15 AM)
    - **Slot 2:** Evening Refreshments (06:00 PM – 07:00 PM)
    - **Slot 3:** Midnight Sprint (01:00 AM – 02:00 AM)
    - **Slot 4:** Morning Breakfast (08:00 AM – 09:00 AM)
  - Real-time presence indicator (e.g. `4/4 Present`) required before jury validation.

---

### Page 7: `*` — 404 Page Not Found
- Minimalist, on-brand light-mode error page.
- Clean typography and single clear button: `[ RETURN TO HOMEPAGE → ]`.

---

## 3. Summary Routing Matrix

| Route | Page Name | Access | Primary Device | Key Functionality |
|---|---|---|---|---|
| `/` | Master Hackathon Landing Page | Public | Mobile + PC | All-in-one event document (Rules, Timeline, FAQ, CTAs) |
| `/register` | Registration & Payment Funnel | Public | Mobile + PC | 4-member form, UPI QR step, receipt upload, capacity gate |
| `/department` | Department Lineage & Lab | Public | Mobile + PC | C2S lab, EDA workshop archives, student taped-out projects |
| `/tracker` | Coordinator Read-Only Roster | Public (Shareable) | **Mobile-First** | Read-only registration tracker, New vs Verified, receipt viewer |
| `/arena` | Live Auditorium Stage Display | Semi-Public | **Projector (16:9)** | 24-hr live clock, controlled Live vs. Standby from Admin |
| `/admin` | Super-Admin Portal | **Authenticated** | **Desktop-Only** | 4 views: Launch, Timer Controls, Registrations Hub, Attendance |
| `*` | 404 Error Fallback | Public | Mobile + PC | Clean light-mode redirect to homepage |

