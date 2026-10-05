# VELTRAXX ’26 — FORENSIC FAILURE LEDGER & PROCESS AUTOPSY
## Document Identifier: `VELTRAXX_26_FAILURE_LEDGER.md`
### Core Question: *"What did VELTRAXX ’26 teach me about how I build software, how I prompted the AI agent, and what exact process must I use for VELTRAXX 2.0?"*

---

## 1. Epistemic Classification Standard

Every entry, claim, and finding in this document is strictly labeled under one of three tiers to prevent conflating hard forensic data with subjective deductions:

* **`[CONFIRMED]`**: Directly verified via Git commit diffs, PostgreSQL migration scripts, active source code, or captured terminal/browser runtime logs.
* **`[INFERRED]`**: Deducted with high probability from commit message sequences, file creation timestamps, code reversion patterns, and conversational turn transitions, but lacking explicit written requirement tickets.
* **`[RECOMMENDATION]`**: Forward-looking architectural, procedural, or prompt-engineering rules designed to structurally eliminate the root cause in VELTRAXX 2.0.

---

## 2. The Core Behavioral Pattern: The Reactive Loop

The single most expensive failure of VELTRAXX ’26 was not a technical bug. It was the development methodology:

```text
THE VELTRAXX '26 ANTI-PATTERN:
Build Visuals → Discover Missing Requirement → Quick Patch → 
Discover Edge Case → Secondary Patch → Regress Previous Feature → 
Emergency Redesign / Rollback
```

### Contrast with the Target VELTRAXX 2.0 Pattern:
```text
THE VELTRAXX 2.0 TARGET PATTERN:
Define Actors & States → Model Invariants in PostgreSQL → 
Test Worst-Case Hardware/Network → Build Functional Core → 
Apply Visual Polish → Freeze
```

---

## 3. Chronological Post-Mortem of the 5 Major Development Sagas

---

### SAGA 1: The Registration Workflow & Capacity Limit (Aug 8 – Aug 12)

```text
WHAT I WANTED:
A sleek, modern registration page for 4-member teams with a hard limit of 35 teams,
UPI payment proof upload, and instant confirmation email.

WHAT I TOLD THE AGENT:
"Build a registration page with glass styling, team member forms, payment QR, and hook it to Supabase."

WHAT IT BUILT:
A multi-step form calling Supabase Storage for receipts and invoking an atomic RPC `register_team`.

WHAT I REALIZED WAS WRONG:
1. [CONFIRMED] Database schema constrained role to `CHECK (role IN ('Leader', 'Participant'))`, 
   but frontend defaulted to `Member` (Commit e9748d6). Initial submissions threw 500 errors.
2. [CONFIRMED] Form was difficult to navigate on mobile devices.
3. [CONFIRMED] Registration capacity limit (35 teams) was completely missing from the initial system.

WHAT I ASKED IT TO CHANGE:
"Fix the mobile UI, redesign the layout, limit capacity to 35 teams, and send emails on registration."

WHAT BROKE:
1. [CONFIRMED] Agent redesigned Register.jsx into a split-pane layout (Commit a3ad29d), which 
   broke mobile scrolling completely, forcing an immediate total rollback (Commit c922fde).
2. [CONFIRMED] Agent implemented the 35-team limit ONLY on the client-side bundle (Commit 8dd946a) 
   by checking `count >= 35` in React `useEffect`. The database function `register_team` remained 
   completely uncapped, creating a silent race condition.
3. [CONFIRMED] Agent injected EmailJS directly into `index.html` and triggered emails from 
   the client's browser using base64 file payloads (Commit 4149db3), which failed silently if 
   adblockers, slow 3G networks, or free tier quotas were encountered.

WHAT SHOULD HAVE BEEN DESIGNED BEFORE TOUCHING CODE:
[RECOMMENDATION]
1. Database Schema Frozen First: Team size (4), Member roles (Leader, Participant), unique constraints on email/phone.
2. Capacity Enforced at DB Level: `SELECT count(*) FROM teams FOR UPDATE` inside `register_team`.
3. Server-Side Transactional Email: Database webhook on insert triggering an Edge Function (Resend/SendGrid) with audit log.
```

---

### SAGA 2: The 14-Commit Safari Glass Card Revert War (Aug 12 – Aug 13)

```text
WHAT I WANTED:
Awwwards-tier frosted glass cards displaying VLSI workshops and hardware projects in `Vlsi.jsx` 
with smooth Framer Motion entrance animations.

WHAT I TOLD THE AGENT:
"Make the glass cards look like Apple design with smooth sliding animations."

WHAT IT BUILT:
Cards with `backdrop-filter: blur(16px)` placed directly on `<motion.div>` elements that animated 
`transform: translateX / translateY`.

WHAT I REALIZED WAS WRONG:
On iOS Safari and certain mobile devices, the cards flickered violently, text disappeared, 
and borders distorted during transitions.

THE CIRCULAR PATCHING SPIRAL (14 CONSECUTIVE COMMITS):
• Commit f947b69: fix: remove -webkit-backdrop-filter and translateZ to fix glass bug on certain devices
• Commit 4984a17: fix: apply robust glass effect CSS from GlassCard
• Commit 8f10696: fix: decouple framer-motion wrappers from glass cards to fix backdrop-filter bug
• Commit 5744294: fix: completely remove all conflicting transform/transition properties from glass cards
• Commit 88021f3: revert: restore Vlsi.css and Vlsi.jsx to state before glass effect modifications
• Commit 0ecf5f2: feat: manually wrap all glass cards for perfect Apple device support and glitch-free sliding
• Commit e57113e: fix: abandon apple specific prefix and use pure backdrop-filter directly on framer-motion cards
• Commit 3466fef: fix: actually remove webkit filters to guarantee flawless framer motion slide
• Commit 4ec9ce3: fix: implement ultimate ::before pseudo-element isolation for backdrop-filter
• Commit 429000e: revert: permanently restore Vlsi.jsx and Vlsi.css to the golden a9e276e state

FINAL OUTCOME:
Complete surrender. After 14 commits of circular CSS hacking, the code was reverted entirely back 
to the baseline version.

WHY I SHOULD HAVE DESIGNED IT DIFFERENTLY:
[CONFIRMED] Browser rendering engines (specifically WebKit) cannot composite a GPU backdrop-blur 
filter while simultaneously recalculating an animated 3D transformation matrix on the same DOM element.
[RECOMMENDATION] Visual layout rule for 2.0: If an element animates, its background must be a static 
opaque color or pre-baked gradient. If an element uses `backdrop-filter`, it MUST remain geometrically static.
```

---

### SAGA 3: Visual Feature Creep vs. Functional Needs (Aug 26 – Aug 27)

```text
WHAT I WANTED:
A dramatic, visually memorable 24-hour hackathon stage timer.

WHAT I TOLD THE AGENT:
"Add atmospheric effects, make it look dynamic, add rain, lightning, stars, meteors, and sun rays."

WHAT IT BUILT:
1. Commit 6375033: Afternoon monsoon rain shower with realistic falling drops and glass water streaks.
2. Commit ca75f11: Minimal luxury rain streaks with double-flash thunder and lightning strikes.
3. Commit 2af86dc: 7-layer photonic celestial sun engine with harmonic god rays and 8-phase VLSI telemetry HUD.
4. Commit 477d24b: Falling cosmic stardust and shooting meteors.

WHAT I REALIZED WAS WRONG:
On actual projection screens, the rain looked like screen tearing, the lightning flashes 
distracted participants, and the meteors caused browser lag.

WHAT I ASKED IT TO CHANGE:
"Remove the rain, remove the thunder, remove the meteors, make it clean."

WHAT BROKE:
1. Commit fee2f25: Stripped rain and thunder.
2. Commit febc23b: Stripped falling meteors.
3. Commit 79e66c7: Emergency fix! The agent deleted the meteor state but left an obsolete 
   `setMeteors` hook call in `Admin.jsx`, completely crashing the Admin Portal upon load.

WHY I SHOULD HAVE DESIGNED IT DIFFERENTLY:
[INFERRED] The developer and agent spent ~24 hours designing, debugging, and deleting novelty 
weather simulations that added zero value to hackathon participants, while real operational features 
(on-spot registration, attendance tracking, payment verification) had not even been started.
[RECOMMENDATION] Feature prioritization hierarchy for 2.0: Core Operations (100%) -> Stability (100%) -> 
Static Design Polish (100%) -> Dynamic Novelty Visuals (Optional/Last 5%).
```

---

### SAGA 4: The Event-Day Emergency Scramble (Aug 28 Morning)

```text
WHAT I WANTED:
On the morning of the hackathon, students arrived at the venue who hadn't registered online, 
and volunteers needed to take attendance for 4 sessions across 24 hours.

WHAT I TOLD THE AGENT:
"Quickly build an on-spot registration page and an attendance monitoring system for volunteers."

WHAT IT BUILT:
1. Commit 540268d: Emergency On-Spot portal and volunteer attendance system.
2. Commit 4fb62d8: Exposed direct hidden routes `/#/onspot` and `/#/attendance`.
3. Commit c3e6ba4: Added client-side passcode protection (`2026`, `admin2026`, `1234`).
4. Commit 3a9f101: Emergency SQL migration granting SELECT to `anon` on teams and team_members.

WHAT BROKE & SECURITY IMPACT:
1. [CONFIRMED] Client-Side Passcode: Stored in plain text in `OnSpot.jsx` and `Attendance.jsx`. 
   Trivial bypass in DevTools.
2. [CONFIRMED] Total PII Leak: To allow volunteer phones to read the team list without logging in 
   via Supabase Auth, `teams` and `team_members` were granted global anonymous SELECT. Any student 
   with DevTools could download all participant phone numbers, emails, and payment slips.
3. [CONFIRMED] Unprotected Session RPCs: `toggle_attendance_session` and `close_all_attendance_sessions` 
   had zero authentication checks and were granted to `anon`.

WHY I SHOULD HAVE DESIGNED IT DIFFERENTLY:
[INFERRED] Operational event-day logistics were treated as an afterthought rather than a core requirement.
[RECOMMENDATION] All event-day desks (Check-in, On-Spot, Attendance, Judging) must be planned, 
role-gated, and tested at least 7 days before event day.
```

---

### SAGA 5: The Projector Strobing & Geometry Patch Loop (Aug 28 Evening – Night)

```text
WHAT I WANTED:
The live countdown timer displayed on the main stage projector running on a GNU/Linux machine.

WHAT I REALIZED WAS WRONG:
1. [CONFIRMED] The timer numbers strobed/flickered visibly every second on the Linux projector.
2. [CONFIRMED] Laptops running the timer hit 70% GPU utilization.
3. [CONFIRMED] The clock was stuck at the top third of the screen instead of dead center.
4. [CONFIRMED] The light cast by the moon was pointing 90° in the wrong direction, and text looked backlit.

THE 6-STEP COMPENSATORY PATCH CYCLE:
• Commit c032ac4: Decouple celestial ray-tracing from 1-second ticker to eliminate GPU text-mask flickering.
• Commit d168fdf: Hardware-cached font rendering and CSS containment to stop Skia font mask flickering.
• Commit d259cbd: Restore 5-stop ray-traced radiant gradients, remove visible orbit line.
• Commit f88d86f: Drop GPU usage from 70% to <5% via zero-blur radial feathering, auto-dimming fullscreen.
• Live Turn Patch: Fix class mismatch (.arena-container vs .arena-content) and switch vw to vmin.
• Commit e65587d: Fix trigonometric atan2 angle equation, purge omnidirectional drop-shadows, enforce front-surface lighting.

ROOT CAUSE:
[CONFIRMED] The agent applied `filter: drop-shadow()` to a parent container whose child had 
`-webkit-background-clip: text`. On Linux Mesa/Intel HD graphics, every text change ("59" -> "58") 
forced Chromium's Skia engine to discard and reallocate offscreen Framebuffer Objects (FBOs), 
causing a 1-frame black flash.
[RECOMMENDATION] Stage timers must adhere strictly to compositor-only CSS properties. Never combine 
text-mask gradients with drop-shadow filters on changing text.
```

---

## 4. Human-Agent Collaboration Autopsy

Why did the collaboration between the Developer and the AI Agent produce so much circular rework?

### 1. The "Symptom Prompting" Trap
* **What Happened:** When a bug occurred, the developer prompted the agent with the visible symptom (e.g., *"the timer is flickering"*, *"the numbers look small"*, *"the moon is somewhere and the light is elsewhere"*).
* **The Failure:** The agent responded by patching the immediate line of CSS or moving a DOM element without diagnosing the system architecture. When the agent moved `<div className="celestial-system-layer">`, it fixed one CSS issue but broke the Moon's coordinate space across the entire screen.
* **The 2.0 Rule:** Prompts must demand root-cause diagnosis: *"Diagnose the mathematical coordinate space and GPU rendering pipeline before proposing code edits."*

### 2. The Agent's "Blind Compliance" Bias
* **What Happened:** The AI agent never pushed back. When asked to add monsoon rain, lightning, and falling meteors to a stage clock, the agent enthusiastically generated 500 lines of complex physics code without asking: *"Will this run smoothly on a Linux projector, and does it serve the hackathon's core objective?"*
* **The 2.0 Rule:** Equip the agent with a **Gatekeeper Constitution** that actively challenges out-of-scope visual bloat and demands target hardware specifications before implementing animations.

### 3. Premature Visual Polish Before Workflow Verification
* **What Happened:** Days were spent fine-tuning CSS gradients, glass card borders, and button hover physics before the team had even verified if team registration closed cleanly at 35 teams or whether attendance could be recorded securely.
* **The 2.0 Rule:** **The Functional Gate Rule.** No visual polish or animation work is permitted until the end-to-end database transactions, authentication roles, and failure modes pass automated testing.

---

## 5. Comprehensive Incident Ledger

| ID | Finding | Classification | What I / The Agent Did | What Went Wrong | Root Cause | Rework Cost | 2.0 Rule |
| :---: | :--- | :---: | :--- | :--- | :--- | :---: | :--- |
| **F-01** | **Client-Side Capacity Lock** | `[CONFIRMED]` | Enforced 35-team limit in React `useEffect`. | Concurrent submissions could bypass limit; curl could submit team #36+. | Business rule enforced in UI instead of DB transaction. | **MEDIUM** | Never enforce resource limits on the frontend. DB must check `count(*) < 35 FOR UPDATE`. |
| **F-02** | **Plaintext Credentials in Git** | `[CONFIRMED]` | Committed `admin_test.js` with `admin@veltraxx.com` and `siet@2026`. | Credentials permanently exposed in Git commit history. | Test scripts checked production secrets without `.env` isolation. | **HIGH** | Secrets never enter Git. Enforce pre-commit `gitleaks` scanning. |
| **F-03** | **Global Anonymous PII Leak** | `[CONFIRMED]` | Executed `GRANT SELECT ON team_members TO anon USING (true)`. | All student phone numbers, emails, and receipts exposed to public API. | Rushed volunteer attendance on event day without volunteer auth. | **HIGH** | Strict RLS. Volunteers must authenticate; PII is never readable by `anon`. |
| **F-04** | **Hardcoded Desk PINs** | `[CONFIRMED]` | Added `if (pin === '2026')` in `OnSpot.jsx` and `Attendance.jsx`. | Any participant could inspect source and gain on-spot admin privileges. | Confused frontend route visibility with access control. | **MEDIUM** | Route hiding is not security. All desk actions require signed session tokens. |
| **F-05** | **Client-Side EmailJS Dispatch** | `[CONFIRMED]` | Triggered registration confirmation emails from user's browser. | Emails blocked by adblockers; failed on network drops; zero DB delivery logs. | Avoided setting up server-side transactional email infrastructure. | **HIGH** | Emails belong on server webhooks with guaranteed delivery and retry queues. |
| **F-06** | **Safari Glass Card Loop** | `[CONFIRMED]` | Applied `backdrop-filter: blur()` directly on animated Framer Motion cards. | 14 consecutive commits of visual glitching, layout distortion, and final rollback. | WebKit cannot composite GPU blur on actively transformed DOM nodes. | **MAJOR** | Never animate blurred elements. Keep blur filters on static background siblings. |
| **F-07** | **Mesa Linux Projector Flickering** | `[CONFIRMED]` | Combined `filter: drop-shadow()` on parent with `background-clip: text` on child. | 1-frame black flash on every second tick ("59" -> "58") on GNU/Linux hardware. | Skia reallocates offscreen Framebuffer Objects on text changes when filters are active. | **MAJOR** | Compositor-Only rule: Stage timers animate strictly `transform` and `opacity`. |
| **F-08** | **Duplicated Monolithic Admin** | `[CONFIRMED]` | Created 2,400-line `Admin.jsx` with stage launch, timer control, and registrations. | File crashed due to dangling `setMeteors` effect; unmaintainable code. | Copy-pasting working views instead of modular components and hooks. | **MAJOR** | Strict 300-line file limit. Domain isolation for separate event personas. |
| **F-09** | **Timer Timezone Desync** | `[CONFIRMED]` | Calculated countdown from `Date.now()` on organizer laptop. | Clocks showed different times on different devices; ignition double-fired. | Client clock trusted as source of truth for event duration. | **HIGH** | Server time is the sole source of truth. Client only interpolates display deltas. |
| **F-10** | **Class Mismatch Centering Bug** | `[CONFIRMED]` | JSX used `arena-content`, CSS defined `.arena-container`. | Stage timer collapsed to top third of screen on event day. | Manual class synchronization across disconnected CSS and JSX files. | **MEDIUM** | Use Tailwind CSS or CSS Modules where class typos fail at build time. |
| **F-11** | **Viewport Font Overflow** | `[CONFIRMED]` | Scaled stage timer digits using raw `vw` units. | Digits clipped off screen on non-16:9 projection displays. | Scaled text to width without constraining for viewport height. | **MEDIUM** | Use `vmin` or container query units for fullscreen stage dashboard displays. |
| **F-12** | **90° Ray Trace Angle Inversion** | `[CONFIRMED]` | Math used `Math.atan2(dx, dy) + 180` for CSS linear-gradient. | Light rays and shadows projected sideways relative to the Moon. | Ignored CSS gradient angle standard (0° is UP, clockwise). | **MEDIUM** | Verify mathematical vector equations with visual debug overlays before shipping. |
| **F-13** | **Hard Delete Data Loss Risk** | `[CONFIRMED]` | Used `DELETE FROM teams WHERE id = ...` with `ON DELETE CASCADE`. | Accidental admin click at 3 AM permanently purges all 4 team members and attendance. | No soft-delete flag or confirmation safeguards implemented in DB. | **HIGH** | All destructive actions use soft-delete (`deleted_at`) with audit log entries. |
| **F-14** | **Discarded Weather Simulation** | `[INFERRED]` | Built rain, lightning, water streaks, and meteors over 10 commits, then deleted all. | 15+ engineering hours wasted on novelty visual code that was scrapped. | Developer prioritized Dribbble-tier aesthetics before operational freeze. | **HIGH** | Operational freeze must precede visual exploration. |
| **F-15** | **Offline Network Failure at Desk** | `[INFERRED]` | Attendance checkboxes sent direct Supabase mutations without offline queue. | Volunteer checkboxes failed silently if venue Wi-Fi dropped in the hall. | Assumed 100% reliable venue Wi-Fi during a 24-hour hackathon. | **HIGH** | Event apps must support local-first optimistic state with background sync. |

---

## 6. VELTRAXX 2.0 Engineering Rules (The Playbook)

These rules are non-negotiable standards derived directly from the forensic findings above.

### Rule 01: Specification Before Implementation
Before a single line of frontend code is written:
1. Define all **User Roles** (Public, Applicant, Volunteer, Stage Director, Master Admin).
2. Define the **Entity-Relationship Data Model** with all constraints in PostgreSQL.
3. Define the **Finite State Machines** for Registration (`Draft -> Submitted -> Verified -> Active`) and Timer (`Idle -> Ignition -> Running -> Paused -> Ended`).

### Rule 02: Backend Owns All Invariants
* The frontend is an untrusted presentation layer.
* Capacity limits, duplicate checks, role permissions, and deadline cutoffs must be enforced by PostgreSQL check constraints, unique indexes, and transactional RPC functions (`FOR UPDATE`).

### Rule 03: Hardware-Conscious Animation Budget
* All stage displays and projection dashboards must run locked at 60fps on a **baseline reference machine** (Intel Integrated Graphics / GNU/Linux Mesa driver stack).
* Rules for animated elements:
  - Animate ONLY `transform` and `opacity`.
  - Zero `filter: blur()`, `filter: drop-shadow()`, or `box-shadow` animations.
  - Zero `backdrop-filter` on elements undergoing translation or scaling.
  - Layout typography must scale with `vmin` or CSS Container Queries, never raw `vw`.

### Rule 04: Zero Secrets in Client Bundles or Git
* No passcodes, master PINs, or test credentials in source code.
* Staff tools require real authentication (magic link, OTP, or signed JWT session).
* Automated pre-commit hooks (`gitleaks`, `trufflehog`) must be active in the CI pipeline.

### Rule 05: Asynchronous Server-Side Communication
* Client browsers must never send transactional emails.
* Database triggers on record insertion publish jobs to an asynchronous queue (e.g. Supabase Edge Functions + Resend API) with retry logic and database delivery logs.

### Rule 06: Soft Deletes & Operational Audit Ledger
* No production data is ever destroyed via hard `DELETE`.
* All entities implement `deleted_at TIMESTAMP WITH TIME ZONE` and `deleted_by UUID`.
* Destructive actions in admin tools require a typed confirmation modal (e.g. typing team name to confirm).

---

## 7. The VELTRAXX 2.0 AI Agent System Prompt / Meta-Harness

When spinning up an AI coding agent (Claude Code, Gemini CLI, Cursor, etc.) to build VELTRAXX 2.0, paste the following prompt as the **Project System Directive**:

```markdown
# VELTRAXX 2.0 KERNEL DIRECTIVE

You are the Lead Systems Architect for VELTRAXX 2.0. You operate under strict zero-rework, 
hardware-conscious, and security-first constraints derived from the VELTRAXX '26 post-mortem.

## ABSOLUTE CONSTRAINTS:
1. NEVER enforce business rules (team size, capacity limits, registration deadlines) exclusively 
   in client-side code. All invariants must be modeled as PostgreSQL check constraints or transactional triggers.
2. NEVER commit credentials, hardcoded PINs, or bypass passcodes. All staff routes (/admin, /desk, /attendance) 
   must be gated by real server-side session authentication.
3. NEVER apply CSS filters (drop-shadow, blur) or animated box-shadows to elements that use 
   background-clip: text or undergo Framer Motion transforms. Stage display animations must strictly use 
   compositor-safe properties (transform, opacity).
4. NEVER trigger emails or third-party webhooks from client browsers. All side-effects must execute 
   server-side via Edge Functions or background workers.
5. NEVER write monolithic files exceeding 300 lines. Separate Data Layer, State Machine, and Presentation.
6. NEVER propose a reactive CSS patch without verifying the underlying coordinate space and rendering pipeline.
7. If a requirement is ambiguous, STOP and demand architectural clarification before writing code.
```

---

> **Archival Note:** This ledger represents the permanent engineering foundation for VELTRAXX 2.0. Every rule recorded here was paid for in emergency hours during VELTRAXX ’26. Do not repeat the past.
