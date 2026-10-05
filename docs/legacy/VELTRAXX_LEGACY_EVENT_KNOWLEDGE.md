# VELTRAXX 1.0 Legacy Event Knowledge Base
**Forensic Audit, Factual Extraction & 2.0 Separation Ledger**

> **Classification Standard:**
> - `[CONFIRMED_FROM_1.0]`: Explicitly verified with verbatim proof in `D:\tmp\hackathon_web` source files (`event_info.txt`, `about vlsi team.txt`, `Home.jsx`, `Rules.jsx`, `Register.jsx`, `supabase_schema.sql`, etc.).
> - `[SOURCE_AMBIGUOUS]`: Contradictions or conflicting statements identified between different 1.0 files (e.g., metadata vs. UI copy).
> - `[NOT_FOUND]`: Feature or parameter was completely absent in VELTRAXX 1.0; MUST NOT be invented or carried over without explicit Owner instruction.

---

## 1. Source Information & Audit Methodology

- **Source Codebase Audited:** `D:\tmp\hackathon_web` (Full Git working tree and SQL migration history).
- **Audit Timestamp:** October 4, 2026.
- **Audited Core Documents:**
  1. `event_info.txt` (Primary event specification ledger, 94 lines).
  2. `about vlsi team.txt` (Department history, workshop archive, and institutional credentials, 89 lines).
  3. `index.html` (SEO metadata, OpenGraph tags, schema.org JSON-LD, 81 lines).
  4. `src/App.jsx` (Client-side routing architecture and lazy loaded page modules, 73 lines).
  5. `src/pages/Home.jsx` (Landing page copy, live 24-hr schedule, capacity checking, 523 lines).
  6. `src/pages/Rules.jsx` (Official competition rules, logistics, and prize breakdown, 137 lines).
  7. `src/pages/Vlsi.jsx` (Institutional proof, EDA workshop history, student projects, 411 lines).
  8. `src/pages/Register.jsx` (4-member team form, payment QR handling, 35-team gate, 577 lines).
  9. `src/pages/Admin.jsx` & `admin_migration.sql` (Super-admin auth, receipt verification, 42 lines).
  10. `supabase_schema.sql` (Atomic `register_team` RPC, private `receipts` storage, RLS).
  11. `supabase_attendance_and_onspot_migration.sql` (On-spot bypass, 4 live attendance slots).
  12. `supabase_timer_migration.sql` (Realtime server-authoritative 24-hour countdown clock).

---

## 2. Event Identity

- **Event Name:** `VELTRAXX’26` (also written as `VELTRAXX '26` or `VELTRAXX`) `[CONFIRMED_FROM_1.0]`
- **Event Tagline / Subtitle:** "24-Hour Hackathon" / "A national-level VLSI hackathon bringing together students, engineers and working professionals to solve an industry-oriented challenge under a 24-hour deadline" `[CONFIRMED_FROM_1.0: Home.jsx:180-184]`
- **Event Level:** National Level `[CONFIRMED_FROM_1.0: event_info.txt:5]`
- **Edition:** First Edition (2026) `[CONFIRMED_FROM_1.0]`
- **Organizers:** The VLSI Faculty Team & Department of Electronics and Communication Engineering (ECE / VLSI), Sri Shakthi Institute of Engineering and Technology `[CONFIRMED_FROM_1.0: Home.jsx, about vlsi team.txt]`
- **Brand Motifs in 1.0:** Silicon cyan (`#00e5ff`), dark space background (`#050505`), glassmorphism cards (`GlassCard`), monospaced technical telemetry `[CONFIRMED_FROM_1.0: Home.css, global.css]` *(Note: 2.0 strictly switches to Light Mode `#FBFBFB`)*.

---

## 3. Event Overview

- **Event Type:** 24-Hour VLSI Engineering Hackathon `[CONFIRMED_FROM_1.0: event_info.txt:4]`
- **Mode:** 100% Offline (In-Person Event) `[CONFIRMED_FROM_1.0: Rules.jsx:61]`
- **Dates:** August 28–29, 2026 `[CONFIRMED_FROM_1.0: event_info.txt:6]`
- **Duration:** Exactly 24 continuous hours `[CONFIRMED_FROM_1.0: event_info.txt:7]`
- **Host Institution:** Sri Shakthi Institute of Engineering and Technology (SIET / SSIET) `[CONFIRMED_FROM_1.0: Rules.jsx:62, index.html:10]`
- **Venue:** SIET Campus, Coimbatore, Tamil Nadu, India `[CONFIRMED_FROM_1.0: Rules.jsx, about vlsi team.txt:15]`
- **Hackathon Hall:** Main Auditorium / EAC Dedicated Rooms `[CONFIRMED_FROM_1.0: about vlsi team.txt:30, veltraxx_1.0_learning.md]`

---

## 4. Registration Details

- **Registration Fee:** ₹1,000 Flat Per Team (regardless of member institutional background) `[CONFIRMED_FROM_1.0: event_info.txt:8, Rules.jsx:75]`
- **Payment Method:** Online UPI QR Code scan only; absolutely NO offline cash payments accepted for online registration `[CONFIRMED_FROM_1.0: Register.jsx:330-331]`
- **Payment Proof Workflow:**
  - Team Leader fills details for all 4 members.
  - Scans static UPI QR code (`/optimized/register_payment_qr.webp`).
  - Uploads payment screenshot (max size: 2MB, formats: image/*).
  - Receipt stored in private Supabase Storage bucket `receipts` with a cryptographically generated UUID filename (`crypto.randomUUID()`).
  - Status defaults to `'pending'` until manually verified by Admin in `/admin`.
  - Notification sent via EmailJS (`window.VELTRAXX_EMAILJS`) with base64 receipt attachment.
- **Registration Timeline:**
  - Opens: Monday, August 10, 2026 `[CONFIRMED_FROM_1.0: event_info.txt:27-29]`
  - Closes: Wednesday, August 25, 2026 (or earlier upon capacity) `[CONFIRMED_FROM_1.0: event_info.txt:31-32]`
- **Capacity Limit:** Strictly capped at 35 teams (140 participants total) `[CONFIRMED_FROM_1.0: Register.jsx:265, supabase_schema.sql]`
- **Capacity Enforcement in 1.0:** Handled dynamically via `get_registration_status` RPC. Once count hit 35, the registration form replaced itself with a "Registrations Are Officially Closed" banner `[CONFIRMED_FROM_1.0: Register.jsx:250-285]`.

---

## 5. Teams & Eligibility

- **Team Size:** Exactly 4 members per team (no individual entries, no 2-person or 3-person teams) `[CONFIRMED_FROM_1.0: event_info.txt:9, Rules.jsx:74, supabase_schema.sql:53]`
- **Team Roles:** Exactly 1 "Leader" and 3 "Participant" members `[CONFIRMED_FROM_1.0: supabase_schema.sql:56-70]`
- **Data Required per Member:** Full Name, Email, Phone Number, College/Organization, Department, Degree `[CONFIRMED_FROM_1.0: supabase_schema.sql:81-88]`
- **Eligible Cohorts:**
  1. Bachelor's students (B.E. / B.Tech / B.Sc)
  2. Master's students (M.E. / M.Tech / M.Sc)
  3. Research Scholars (Ph.D. / MS by Research)
  4. Working Professionals in Semiconductor/Electronics Industry
  `[CONFIRMED_FROM_1.0: event_info.txt:10, Rules.jsx:76]`
- **Cross-Institution Formation:** Both Intra-college and Inter-college teams are permitted; team members do not need to belong to the same institution `[CONFIRMED_FROM_1.0: event_info.txt:11, Rules.jsx:77]`

---

## 6. Tracks & Themes

- **Number of Tracks in 1.0:** **ZERO tracks** `[CONFIRMED_FROM_1.0: event_info.txt, Home.jsx, Rules.jsx]`
- **Challenge Architecture:** A **single, unified industry-level problem statement** was issued to all 35 competing teams `[CONFIRMED_FROM_1.0: event_info.txt:12, 36-37]`.
- **Domain Focus:** Front-end RTL design, synthesis, verification, and hardware prototyping in the VLSI domain.
- *Audit Note:* Prior proposals for "Track 1: RTL Design", "Track 2: Embedded Systems", and "Track 3: AI Hardware" were **completely fabricated / assumed** without backing from 1.0. For 2.0, multi-track structure is `[NOT_FOUND]` and requires explicit Owner confirmation.

---

## 7. Rules & Code of Conduct

- **BYOD / BYO-Tooling (Bring Your Own Device & Environment):**
  - **EDA Software:** Participants MUST use their own EDA tools and licenses (e.g. ModelSim, Vivado, Quartus, Cadence/Synopsys academic licenses on personal laptops). Organizers DO NOT provide EDA tools or licenses `[CONFIRMED_FROM_1.0: event_info.txt:13, 25, Rules.jsx:87]`.
  - **Hardware / Development Boards:** Participants MUST bring their own FPGA boards, development kits, microcontrollers, probes, and test bench gear. Organizers DO NOT supply hardware `[CONFIRMED_FROM_1.0: event_info.txt:14, 25, Rules.jsx:87]`.
  - **Laptops & Workstations:** Participants MUST bring their own laptops. The hackathon does NOT provide individual desktop PCs for the competition `[CONFIRMED_FROM_1.0: Rules.jsx:87]`. *(Note: Desktop PCs were only provided in departmental training workshops prior to the event, NOT during the hackathon)*.
- **Problem Statement Release Window:** The problem statement was revealed **2 days prior to the hackathon** (Thursday, August 26, 2026) exclusively to paid/verified teams so they could configure their boards, toolchains, and libraries in advance `[CONFIRMED_FROM_1.0: event_info.txt:12, 36-37, Rules.jsx:95-96]`.
- **Attendance Mandate:** Teams were required to be physically present and check in across 4 dedicated attendance slots during the 24 hours `[CONFIRMED_FROM_1.0: supabase_attendance_and_onspot_migration.sql:22-27]`.

---

## 8. AI & External Code Usage Policy

- **Generative AI Policy (ChatGPT, Claude, Copilot, Cursor):** `[NOT_FOUND]`
- **Pre-existing Code / Open-source IP / GitHub IP Policy:** `[NOT_FOUND]`
- *Audit Note:* VELTRAXX 1.0 contained no written rules regarding whether participants could use LLMs, AI assistants, or open-source IP cores (e.g. OpenCores, GitHub RTL). This was an unaddressed governance loophole. A concrete policy MUST be decided by the Owner for 2.0.

---

## 9. Timeline & 24-Hour Schedule

### Pre-Event Milestones `[CONFIRMED_FROM_1.0: event_info.txt:27-40]`
- **August 10, 2026 (Monday):** Online Registration Opens.
- **August 25, 2026 (Wednesday):** Registration Closes (or when 35 slots fill).
- **August 26, 2026 (Thursday):** Problem Statement Revealed to confirmed teams.
- **August 28, 2026 (Friday) 10:00 AM:** Hackathon Starts.

### On-Site 24-Hour Itinerary `[CONFIRMED_FROM_1.0: Home.jsx:23-111]`
#### Day 1 (Friday, August 28, 2026)
- **09:30 AM:** Student Reporting & Registration Check-In *(ID verification, table assignment, hardware prep)*.
- **10:15 AM:** Hackathon Officially Starts — 24-Hour Arena Countdown Timer Ignites *(Live Arena countdown begins)*.
- **11:45 AM – 12:30 PM:** Inauguration Ceremony *(Keynote address, dignitaries welcome, competition briefing)*.
- **01:40 PM:** Lunch Break *(Power lunch and networking)*.
- **06:00 PM:** Evening Refreshments *(Hot tea, coffee, snacks, initial mentor check-in)*.
- **07:40 PM:** Dinner *(Strategy sync before entering overnight build)*.

#### Day 2 (Saturday, August 29, 2026)
- **01:00 AM:** Midnight Refreshments *(Midnight fuel: coffee, tea, rapid recharges during deep coding)*.
- **08:00 AM:** Breakfast *(Reload as teams begin final synthesis and optimization)*.
- **09:30 AM:** Chief Guest Arrival & Keynote *(Jury panel introduction and opening remarks)*.
- **10:00 AM – 11:00 AM:** Project Validation & Final Judging *(24-hour clock officially expires; jury Q&A, final scoring)*.

### Official Volunteer Attendance Slots `[CONFIRMED_FROM_1.0: supabase_attendance_and_onspot_migration.sql]`
- **Slot 1 (Morning Check-In):** 09:30 AM – 10:15 AM
- **Slot 2 (Evening Refreshments):** 06:00 PM – 07:00 PM
- **Slot 3 (Midnight Sprint):** 01:00 AM – 02:00 AM
- **Slot 4 (Morning Breakfast):** 08:00 AM – 09:00 AM

---

## 10. Infrastructure & Logistics

### What Organizers Provide `[CONFIRMED_FROM_1.0: event_info.txt:15-18, Rules.jsx:86]`
1. **Workspace:** Dedicated team tables in the hackathon venue.
2. **Electricity & Power:** Uninterrupted power supply and extension sockets for laptops and boards.
3. **Internet / Wi-Fi:** High-speed campus network connectivity.
4. **Food & Refreshments:** All meals provided (Lunch, Evening Snacks, Dinner, Midnight Coffee, Breakfast).

### What Organizers DO NOT Provide `[CONFIRMED_FROM_1.0: event_info.txt:13-14, 25, Rules.jsx:87]`
1. **EDA Software / Licenses:** Not provided.
2. **Hardware / FPGA Boards:** Not provided.
3. **Laptops / Workstations:** Not provided.
4. **Hardware Debug Support:** Organizers do not debug faulty external hardware boards.

---

## 11. Judging & Evaluation

- **Jury Composition:** Practicing semiconductor and VLSI industry professionals `[CONFIRMED_FROM_1.0: event_info.txt:19, Home.jsx:473, Rules.jsx:97]`.
- **Evaluation Mechanism:** Live in-person booth demos, project validation on running hardware/simulators, and jury Q&A between 10:00 AM and 11:00 AM on Day 2 `[CONFIRMED_FROM_1.0: Home.jsx:103-107]`.
- **Formal Evaluation Rubric / Weightages:** `[NOT_FOUND]` in 1.0 source (no breakdown between RTL efficiency, timing closure, power, testbench coverage, or presentation). Needs Owner definition for 2.0.

---

## 12. Prizes & Recognition

- **Winning Teams:** Exactly **ONE winning team** `[CONFIRMED_FROM_1.0: event_info.txt:20, Rules.jsx:110]`
- **Runner-Up Prizes:** **NONE** ("None. Only the best takes the prize") `[CONFIRMED_FROM_1.0: event_info.txt:21, Rules.jsx:120]`
- **Winner Grand Benefits:**
  1. **Direct Industrial Internship Opportunity:** For all 4 members of the winning team at a leading VLSI company `[CONFIRMED_FROM_1.0: event_info.txt:23, Rules.jsx:115]`.
  2. **Free Synopsys Workshop Participation:** Direct free access for all 4 team members to the forthcoming hands-on Synopsys workshop scheduled for September 2026 (valued at ₹1,000 per participant / ₹4,000 per team) `[CONFIRMED_FROM_1.0: event_info.txt:24, Rules.jsx:116]`.
- **Participant Recognition:** National-level participation certificates issued individually to every verified attendee from MEMS `[CONFIRMED_FROM_1.0: event_info.txt:22, Rules.jsx:123]`.
- **Cash Prize Pool:** `[SOURCE_AMBIGUOUS]` *(See Section 18: `index.html` had a ₹25,000 meta tag placeholder, but `event_info.txt` and `Rules.jsx` declared zero cash prizes)*.

---

## 13. Sponsors & Partners

- **Visual Sponsor Logos in 1.0:** Located in `public/sponsers/`: `sp_1.webp`, `sp_2.webp`, `sp_3.webp`, `sp_4.png` `[CONFIRMED_FROM_1.0: Home.jsx:279-306]`.
- **Industry Training Partners & Affiliations (from Department Archives):**
  - **Entuple Technologies:** Conducted 10-day Cadence RTL-to-GDS training (Dec 2025) and Kalam Fest mentor session `[CONFIRMED_FROM_1.0: about vlsi team.txt:18, 35, 82]`.
  - **VLSI Minds:** Provided 5 industry mentors for 5-day Synopsys workshop (Feb 2026) `[CONFIRMED_FROM_1.0: about vlsi team.txt:41-46, 83]`.
  - **Government C2S Program (Chips to Startup):** Provided the institution's first dedicated Linux semiconductor tool infrastructure `[CONFIRMED_FROM_1.0: about vlsi team.txt:36]`.
  - **Cadence & Synopsys:** Primary EDA ecosystems utilized by the host department `[CONFIRMED_FROM_1.0: about vlsi team.txt:10, 41]`.
  - **Industry Connections for HR Conclave:** Professionals from Microsoft, Google (DFT team), and Alims `[CONFIRMED_FROM_1.0: about vlsi team.txt:52]`.

---

## 14. Facilities & Accommodations

- **Rest / Break Areas:** Main campus facilities, overnight access to hackathon hall `[CONFIRMED_FROM_1.0]`.
- **Dedicated Hostel / Hotel Rooms for Outstation Teams:** `[NOT_FOUND]` in 1.0 source. It was an overnight hackathon where teams worked through the night in the hall.
- **Dining Facility:** On-campus catering provided in the auditorium / dining block `[CONFIRMED_FROM_1.0: Home.jsx]`.

---

## 15. FAQ & Support

- **Official FAQ Section in 1.0:** `[NOT_FOUND]` *(1.0 did not have an FAQ section or page; common questions were embedded across Rules and Home)*.
- **Support Communication:** Live phone support handled by student coordinators for payment verification and inquiries `[CONFIRMED_FROM_1.0: Register.jsx:291-304]`.

---

## 16. Contacts & Communication Channels

### VLSI Faculty Team `[CONFIRMED_FROM_1.0: event_info.txt:64-72, App.jsx/Footer]`
1. **Dr. P. DhilipKumar, ASP & HOD** — `+91-9629561731`
2. **Mrs. T. Renita Pearlin, AP** — `+91-9629393089`
3. **Mrs. C. Prema, AP** — `+91-9994093811`
4. **Mrs. P. Prisilla Sophia, AP** — `+91-9952441283`
5. **Mrs. R. Vasanthi, AP** — `+91-9942346426`

### Student Coordinators `[CONFIRMED_FROM_1.0: event_info.txt:77-78, Register.jsx:296-302]`
1. **R.A. Darshan** — `+91-9751340838`
2. **M. Kavya** — `+91-9443065492`

### Admin Credentials `[CONFIRMED_FROM_1.0: event_info.txt:89-90]`
- **Admin Email:** `admin@veltraxx.com`
- **Admin Password:** `siet@2026`
*(Security Note: Credentials must be moved to secure `.env` variables and NEVER hardcoded in 2.0)*.

---

## 17. Information Architecture & Routing of 1.0

The 1.0 application was a React Single Page Application utilizing `HashRouter` with 11 distinct routes:

| Route | Component | Purpose | Access Control |
|---|---|---|---|
| `/` | `Home.jsx` | Landing page, schedule, capacity meter, sponsors | Public |
| `/vlsi` | `Vlsi.jsx` | Department journey, tool history, student projects | Public |
| `/rules` | `Rules.jsx` | Full rules, eligibility, prizes, logistics | Public |
| `/register` | `Register.jsx` | 4-member registration, QR payment, receipt upload | Public (Gated at 35) |
| `/arena` / `/live` | `Arena.jsx` | Fullscreen 24-hr live clock & telemetry stage | Public (When timer active) |
| `/launch` | `Launch.jsx` | Fullscreen countdown ignition animation | Admin / Stage |
| `/timer-control` | `TimerControl.jsx` | Start, pause, resume, reset 24-hr clock | Admin Only |
| `/onspot` | `OnSpot.jsx` | Manual on-spot team registration | Admin / Volunteer |
| `/attendance` | `Attendance.jsx` | 4-slot team member attendance tracker | Admin / Volunteer |
| `/admin` | `Admin.jsx` | Team payment verification, receipt viewer, deletion | Admin Only |
| `*` | `NotFound.jsx` | 404 fallback page | Public |

---

## 18. Contradictions & Ambiguities Identified in 1.0

1. **The Cash Prize Contradiction:**
   - In `index.html` lines 9, 18, 24, 53: Meta tags state *"Compete for a ₹25,000 prize pool"*.
   - In `event_info.txt` lines 20-21 & `Rules.jsx` lines 110-120: Explicitly states *"Winner: One winning team. Runner-up prizes: None. The Winner: Internship opportunity + Synopsys workshop. Runner-ups: None. Only the best takes the prize."* No cash amount is mentioned anywhere in the UI or rules.
   - *Status:* `[SOURCE_AMBIGUOUS]`. 2.0 MUST clarify if there is a cash prize or purely internship + workshop benefits.
2. **EDA Tool Support Contradiction (Department vs Hackathon):**
   - In `about vlsi team.txt`: Stated that during Cadence/Synopsys workshops, the college provided *"individual PC workstations to all participants in dedicated EAC rooms with GPDK 90nm and Linux"*.
   - In `event_info.txt` line 13, 25 & `Rules.jsx` line 87: Stated *"EDA tools: Participants should use their own. Hardware: Participants should bring their own. EDA/hardware support: Not provided by organizers."*
   - *Resolution:* The previous 2.0 draft mistakenly conflated the department's past workshops with the hackathon rules. The hackathon is strictly BYOD/BYO-tooling.
3. **The 35-Team Capacity vs. On-Spot Bypass:**
   - In `Register.jsx` line 253: Online registration locked hard at 35 teams.
   - In `supabase_attendance_and_onspot_migration.sql` line 87: Added an unconstrained `register_onspot_team` RPC for walk-in teams on event day.
   - *Status:* `[SOURCE_AMBIGUOUS]`. Did the physical venue truly accommodate more than 35 teams, or was on-spot strictly for no-show replacements?
4. **Certificate Issuing Authority:**
   - In `event_info.txt` line 22: Stated *"Participant certificates will be provided individually"*.
   - In `Rules.jsx` line 123: Stated *"National certificates will be given from MEMS"*.
   - *Status:* `[SOURCE_AMBIGUOUS]`. What does "MEMS" refer to (Centre of Excellence, Student Chapter, or partner body)? Needs Owner confirmation.

---

## 19. Reusable vs. Non-Reusable Information for VELTRAXX 2.0

### ✅ Strictly Reusable Baseline
- Core Institutional identity: Sri Shakthi Institute of Engineering and Technology (Coimbatore).
- Organizing Body: VLSI Faculty Team & ECE Department.
- Verified Faculty contacts and Student Coordinator names.
- Core 24-hour hackathon format and Day 1 / Day 2 schedule rhythm.
- BYOD / BYO-tooling philosophy (bring your own hardware, laptops, and EDA licenses).
- Team composition structure (exactly 4 members: 1 Leader + 3 Participants).
- Department achievements (Cadence C2S Linux lab, GPDK 90nm/45nm, Synopsys VLSI Minds training, past student silicon projects: BIST, RISC, Prefetcher).

### ❌ Strictly Non-Reusable (Must Be Refactored or Cleared)
- Dark mode aesthetic, neon cyan glows, and generic sci-fi meshes.
- 1.0 specific dates (August 28–29, 2026) and deadlines — must be parameterized for 2.0.
- Hardcoded admin credentials (`admin@veltraxx.com` / `siet@2026`).
- Invented tracks (RTL, Embedded, AI) without Owner sign-off.
- Assumed cash prize pool (₹25,000) or assumed hardware kits provided by SIET.

---

## 20. Reconfirmation Checklist for Owner (VELTRAXX 2.0 Decisions)

Before writing any frontend React or backend code for VELTRAXX 2.0, the Owner must explicitly confirm the following 8 items:

| # | Parameter | 1.0 Legacy Value | Proposed 2.0 Option / Status | Owner Decision Needed |
|---|---|---|---|---|
| **Q1** | **Event Dates** | August 28–29, 2026 | New 2026 / 2027 Dates? | `[TBD - CONFIRM EXACT DATES]` |
| **Q2** | **Registration Fee** | ₹1,000 per team | Keep ₹1,000 or Revise? | `[TBD - CONFIRM FEE]` |
| **Q3** | **Team Cap** | 35 Teams (140 participants) | Keep 35 or Expand? | `[TBD - CONFIRM CAPACITY]` |
| **Q4** | **Prizes** | Internship + Synopsys Workshop (No Cash) | Keep Non-Cash or Add Cash Prize Pool? | `[TBD - CONFIRM PRIZE STRUCTURE]` |
| **Q5** | **Competition Tracks** | Single Unified Problem Statement (0 Tracks) | Keep 1 Unified Challenge OR Split into 3 Tracks? | `[TBD - CONFIRM 1 STATEMENT VS TRACKS]` |
| **Q6** | **AI Policy** | Not Addressed in 1.0 | Allowed / Prohibited / Restricted to Assistance? | `[TBD - CONFIRM AI TOOL POLICY]` |
| **Q7** | **Sponsor Lineup** | 4 Graphic Placeholders (`sp_1`–`sp_4`) | Confirmed Sponsor List or Clean Slot `[+ Add Sponsors]`? | `[TBD - CONFIRM SPONSOR ASSETS]` |
| **Q8** | **Page Architecture** | Multi-route SPA (`/`, `/vlsi`, `/rules`, `/register`) | Single Long-form Master Page OR Multi-route? | `[TBD - CONFIRM PAGE STRUCTURE]` |

