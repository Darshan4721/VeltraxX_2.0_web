# VELTRAXX 2.0 - REGISTRATION PAGE, GLOBAL HEADER & 404 BLUEPRINT
**Document Identifier:** `docs/specs/REGISTER_HEADER_404_PLAN.md`  
**Status:** COMPLETE ARCHITECTURAL SPECIFICATION (AGENCY-AGENTS SQUAD & TASTE SKILL RATIFIED)  
**Parent Blueprint:** [`docs/specs/SITE_PAGES_ARCHITECTURE.md`](file:///D:/tmp/veltraxx_2.o/docs/specs/SITE_PAGES_ARCHITECTURE.md)  
**Configuration Source:** [`docs/specs/eventConfig.json`](file:///D:/tmp/veltraxx_2.o/docs/specs/eventConfig.json)  
**Design Tokens:** [`docs/specs/VELTRAXX_2.0_DESIGN_SYSTEM.md`](file:///D:/tmp/veltraxx_2.o/docs/specs/VELTRAXX_2.0_DESIGN_SYSTEM.md)  

---

## 1. Executive Summary & Operational Intent

This blueprint establishes the exact, production-ready design and engineering specifications for three essential surfaces of the VELTRAXX 2.0 platform:
1. **The Registration Funnel (`/register`)**: An ultra-low-friction, 90-second registration experience where **ONLY ONE member (the Team Leader) registers on behalf of the entire 4-member team**.
2. **The Universal Navigation Header (`Navbar`)**: A floating optical glass instrument delivering cross-site routing, live 35-team capacity telemetry, and an immediate high-voltage registration CTA.
3. **The 404 Not Found Page (`*`)**: A Swiss typographic, semiconductor-diagnostic recovery screen designed to guide lost users back to safety with zero dead ends.

### The Single-Submitter Mandate
*Participants should never experience administrative friction.* Asking all 4 teammates to create accounts or individually fill out multi-step forms causes high drop-off rates and duplicate submissions. 

In VELTRAXX 2.0:
- **Only the Team Leader fills out the form.**
- The Leader enters their own details and the details for the remaining 3 members.
- The Leader handles the single ₹1,000 flat team payment via UPI QR scan and uploads the screenshot receipt.
- A single atomic database transaction (`register_team`) provisions the team and all 4 participant records simultaneously.

---

## 2. Taste Skill Core Dials & Anti-Slop Governance (v14)

Every element across these three surfaces is calibrated strictly against the **Taste Skill Tri-Dial Engine** and the **Owner-CEO Operating Constitution**:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   TASTE SKILL CORE DIAL CALIBRATION                    │
├────────────────────────────────────────────────────────────────────────┤
│ 1. DESIGN_VARIANCE (Scale: 1 to 10)                                    │
│    • /register: 5/10  (Structured 2-column cockpit on PC; linear       │
│                        progressive disclosure cards; zero layout chaos)│
│    • Navbar:    4/10  (Symmetrical, ultra-stable floating pill bar)    │
│    • 404 Page:  7/10  (Asymmetric Swiss typographic alignment, silicon │
│                        wafer crosshairs, architectural negative space) │
├────────────────────────────────────────────────────────────────────────┤
│ 2. MOTION_INTENSITY (Scale: 1 to 10)                                   │
│    • /register: 4/10  (Apple spring physics on accordion expansion;    │
│                        compositor-only opacity/transform transitions)  │
│    • Navbar:    5/10  (Scroll-triggered blur morphing; spring mobile   │
│                        drawer slide with cubic-bezier easing)          │
│    • 404 Page:  3/10  (Static stability; gentle entry fade on mount)   │
├────────────────────────────────────────────────────────────────────────┤
│ 3. VISUAL_DENSITY (Scale: 1 to 10)                                     │
│    • /register: 7/10  (High-density engineering form; 1px crisp borders;│
│                        h-12 touch targets; zero bloated whitespace)    │
│    • Navbar:    7/10  (64px compact floating bar; micro monospaced tag;│
│                        condensed live capacity pill)                   │
│    • 404 Page:  3/10  (Spacious art-gallery layout; focused recovery)  │
└────────────────────────────────────────────────────────────────────────┘
```

### Non-Negotiable Anti-Slop Rules
1. **Zero Em-Dashes (`—`)**: Completely banned across all user-facing copy, labels, placeholders, tooltips, and badges. Standard hyphens (`-`) or clean sentence structures are used exclusively.
2. **Zero AI-Purple Glow Blobs**: No centered purple mesh blobs or gradient haze. The palette is strictly pure gallery white (`#FBFBFB`), carbon ink (`#111116`), Solar Wafer Yellow (`#FFE500`), and Silicon Cobalt (`#0055FF`).
3. **Zero 3-Equal Cards**: Forms and cards utilize asymmetric hierarchy (e.g. Leader card is visually distinguished from member cards).
4. **Zero Fake Screenshots**: Real preview states and clear vector illustrations only.
5. **Compositor-Only Motion Budget**: All animations use strictly `transform` and `opacity`. WebKit glass blurs reside on static sibling DOM nodes to eliminate iOS Safari flicker.

---

## 3. Agency-Agents Squad Role Breakdown

To ensure world-class execution, the implementation is divided across four specialized personas from `design-research/13-agency-agents/`:

```text
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│                                AGENCY-AGENTS SQUAD MATRIX                                 │
├───────────────────────────────┬───────────────────────────────────────────────────────────┤
│ Persona                       │ Primary Ownership & Operational Responsibility            │
├───────────────────────────────┼───────────────────────────────────────────────────────────┤
│ 1. design-ux-architect        │ • 90-second single-submitter funnel flow                  │
│                               │ • Keystroke draft persistence (localStorage)              │
│                               │ • "Copy College to All Members" accelerator toggle        │
│                               │ • Instant inline form validation and tab navigation       │
├───────────────────────────────┼───────────────────────────────────────────────────────────┤
│ 2. design-ui-finish-gate-     │ • Taste Skill anti-slop enforcement (anti-em-dash check)  │
│    reviewer                   │ • Optical glass contrast ratio verification (WCAG 2.2 AA) │
│                               │ • 48px minimum touch target enforcement on mobile         │
│                               │ • Layout stability audit (zero cumulative layout shift)   │
├───────────────────────────────┼───────────────────────────────────────────────────────────┤
│ 3. design-brand-guardian      │ • VLSI and semiconductor DNA integration                  │
│                               │ • Wafer-stepper alignment marks and die bounding boxes    │
│                               │ • Solar Wafer Yellow (#FFE500) accent hierarchy           │
│                               │ • SIET ECE VLSI C2S lab credential placement              │
├───────────────────────────────┼───────────────────────────────────────────────────────────┤
│ 4. engineering-frontend-      │ • React 19 + Tailwind v4 component architecture           │
│    developer                  │ • Zod schema validation engine with typed error messages   │
│                               │ • Atomic Supabase RPC register_team call with row locking │
│                               │ • Optimistic file upload handling with 2MB validation     │
└───────────────────────────────┴───────────────────────────────────────────────────────────┘
```

---

## 4. Surface 1: Registration Page (`/register`)

### 4.1 Page Lifecycle & State Machine
The registration page operates across four mutually exclusive screen states:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                     /register SCREEN STATE MACHINE                     │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   [Mount] ──> Fetch Live Team Count from Supabase                      │
│                  │                                                     │
│                  ├── Count < 35 ──────> STATE A: ACTIVE REGISTRATION   │
│                  │                                  │                  │
│                  │                             (Submitting)            │
│                  │                                  ▼                  │
│                  │                      STATE C: SUBMISSION PROCESSING │
│                  │                                  │                  │
│                  │                         (Success)│(RPC Error)       │
│                  │                         ▼        ▼                  │
│                  │                  STATE D: SUCCESS   STATE A (Toast) │
│                  │                                                     │
│                  └── Count >= 35 ─────> STATE B: CAPACITY REACHED      │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

#### State A: Active Registration (Default)
Renders the complete single-submitter team registration form, live capacity indicator (`X / 35 Teams Claimed`), and payment upload module.

#### State B: Capacity Reached (Lockout State)
When the verified team count reaches 35:
- Form fields are replaced with a high-contrast Obsidian alert banner: `REGISTRATION CLOSED - 35/35 TEAMS CLAIMED`.
- Sub-copy: `All official team slots for VELTRAXX 2.0 have been filled. You may join the waitlist or contact the student coordinators directly.`
- Action: Direct click-to-call links for student leads R.A. Darshan (`+91-9751340838`) and M. Kavya (`+91-9443065492`).

#### State C: Submission Processing
Full-page optical glass overlay with a spinning silicon die indicator, disabling all interactions and showing: `COMMITTING TEAM REGISTRATION TO SILICON LEDGER... DO NOT REFRESH`.

#### State D: Success Confirmation
Transitions into the celebratory confirmation terminal with unique Registration UUID, downloadable PDF receipt summary, and direct WhatsApp group entry link.

---

### 4.2 The Single-Submitter Form Architecture
The form is designed for completion by the **Team Leader** in under 90 seconds. It is organized into 3 clear visual chapters:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                     CHAPTER 1: TEAM IDENTIFICATION                     │
├────────────────────────────────────────────────────────────────────────┤
│ • Team Name (Required, unique check, 3-30 chars, alphanumeric + space) │
│ • Track: "Unified Semiconductor Hardware Challenge" (Locked badge)     │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 CHAPTER 2: TEAM ROSTER (1 LEADER + 3 MEMBERS)          │
├────────────────────────────────────────────────────────────────────────┤
│ 👑 [CARD 1: TEAM LEADER (PRIMARY CONTACT)]                             │
│   • Full Name (Required)                                               │
│   • Email Address (Required, verified .edu or personal)                │
│   • WhatsApp / Phone Number (Required, 10-digit Indian format)         │
│   • College / University / Organization Name (Required)                │
│   • Department & Specialization (e.g. ECE, EEE, VLSI)                  │
│   • Degree & Year (e.g. B.E. 3rd Year / M.Tech 1st Year)               │
│                                                                        │
│ ⚡ UX ACCELERATOR TOGGLE:                                              │
│   [ ] "All team members belong to the same college as Team Leader"     │
│   (Checking this auto-fills and locks College Name across Members 2-4) │
│                                                                        │
│ 👤 [CARD 2: MEMBER 02]                                                 │
│   • Full Name | Email Address | Phone Number                           │
│   • College Name | Department | Degree & Year                          │
│                                                                        │
│ 👤 [CARD 3: MEMBER 03]                                                 │
│   • Full Name | Email Address | Phone Number                           │
│   • College Name | Department | Degree & Year                          │
│                                                                        │
│ 👤 [CARD 4: MEMBER 04]                                                 │
│   • Full Name | Email Address | Phone Number                           │
│   • College Name | Department | Degree & Year                          │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│            CHAPTER 3: PAYMENT VERIFICATION & SUBMISSION                │
├────────────────────────────────────────────────────────────────────────┤
│ • Flat Team Fee: ₹1,000 (₹250 per member)                              │
│ • Official SIET UPI QR Code Display (High resolution, 240x240px)       │
│ • UPI Transaction ID / UTR Number (12 digits)                          │
│ • Payment Screenshot Receipt Upload (Drag-and-drop or tap, max 2MB)    │
│ • Declaration Checkbox: "I confirm all 4 members will attend in person"│
│ • Master CTA: [ COMPLETE REGISTRATION - ₹1,000 → ]                     │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 4.3 Frictionless UX Accelerators (`design-ux-architect`)

1. **Auto-Fill College Shortcut:**
   - A prominent switch beneath the Leader card: `Apply Leader's College to all 3 members`.
   - When active, fields for Members 2, 3, and 4 automatically mirror the Leader's college string, saving 70% of repetitive mobile typing.
2. **Realtime Keystroke Persistence (`localStorage`):**
   - Key: `veltraxx_2_registration_draft`.
   - Debounced by 300ms. If the user accidentally closes their tab, refreshes, or loses internet connectivity, returning to `/register` instantly restores all entered names, phones, and emails.
   - Cleared automatically upon successful registration.
3. **Smart Phone & Email Validation:**
   - Automatic prefix formatting for Indian mobile numbers (`+91`).
   - Duplicate prevention check: Displays an immediate inline alert if the Leader enters the same email or phone number for multiple team members.
4. **Mobile Ergonomics:**
   - Input touch target height: `h-12` (48px) with `text-base` (16px) font size to prevent iOS Safari from zooming into the input field.
   - Dedicated keyboard types: `type="tel"` for phone numbers, `type="email"` for emails, `inputMode="numeric"` for UTR numbers.

---

### 4.4 Payment Verification & Receipt Ingestion

1. **Payment Amount:** Flat ₹1,000 per team (`eventConfig.registration.feeINR`).
2. **UPI QR Presentation:**
   - Rendered inside an elevated white optical glass card with 1px border `rgba(17,17,22,0.1)`.
   - Includes quick-copy UPI VPA string button (e.g. `siet.vlsi@sbi` with instant "Copied!" feedback).
3. **Screenshot Receipt Upload:**
   - Accepted MIME types: `image/png`, `image/jpeg`, `image/webp`.
   - Maximum size: 2MB enforced client-side before network dispatch.
   - Live thumbnail preview with a "Remove / Replace" button.
   - Target destination: Supabase Storage private bucket `receipts`.
   - Naming convention: `receipt_{timestamp}_{uuid}.jpg`.

---

### 4.5 Atomic Backend Transaction Specification (`engineering-frontend-developer`)

To guarantee that two teams cannot claim slot #35 simultaneously, registration uses the PostgreSQL stored procedure `register_team`:

```sql
-- Architectural RPC Contract for backend_sql/003_atomic_registration_rpc.sql
CREATE OR REPLACE FUNCTION register_team(
  p_team_name TEXT,
  p_receipt_url TEXT,
  p_utr_number TEXT,
  p_members JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_team_id UUID;
  v_current_count INT;
  v_member JSONB;
BEGIN
  -- 1. Acquire transaction lock on capacity
  SELECT count(*) INTO v_current_count FROM teams FOR UPDATE;
  
  IF v_current_count >= 35 THEN
    RAISE EXCEPTION 'CAPACITY_REACHED: All 35 team slots have been claimed.';
  END IF;

  -- 2. Verify unique team name
  IF EXISTS (SELECT 1 FROM teams WHERE lower(name) = lower(p_team_name)) THEN
    RAISE EXCEPTION 'DUPLICATE_NAME: A team with this name already exists.';
  END IF;

  -- 3. Insert Team Record
  INSERT INTO teams (name, receipt_url, utr_number, status)
  VALUES (p_team_name, p_receipt_url, p_utr_number, 'pending')
  RETURNING id INTO v_team_id;

  -- 4. Insert All 4 Members
  FOR v_member IN SELECT * FROM jsonb_array_elements(p_members)
  LOOP
    INSERT INTO participants (
      team_id,
      name,
      email,
      phone,
      college,
      department,
      degree_year,
      is_leader
    ) VALUES (
      v_team_id,
      v_member->>'name',
      v_member->>'email',
      v_member->>'phone',
      v_member->>'college',
      v_member->>'department',
      v_member->>'degree_year',
      (v_member->>'is_leader')::BOOLEAN
    );
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'team_id', v_team_id,
    'message', 'Registration submitted successfully'
  );
END;
$$;
```

---

### 4.6 Success Confirmation Terminal
Upon successful submission, the page transitions to an authoritative confirmation terminal:
1. **Registration ID:** Clean monospaced identifier (e.g. `VTX26-T24-8841`).
2. **Team Summary Pill:** Team name, Leader name, verified payment receipt badge.
3. **Next Steps Checklist:**
   - Problem statement release: 26 August 2026 (48 hours prior to event).
   - In-person reporting: 28 August 2026 at 09:30 AM at SIET Auditorium.
   - Verification status: Pending admin review (typically verified within 2 to 4 hours).
4. **Primary Actions:**
   - `[ DOWNLOAD CONFIRMATION SLIP (PDF) ]`
   - `[ JOIN OFFICIAL PARTICIPANTS WHATSAPP GROUP → ]`
   - `[ RETURN TO HOMEPAGE ]`

---

## 5. Surface 2: Universal Global Header (`Navbar`)

### 5.1 Layout & Visual Geometry

The global navigation header is persistent across all pages. It is engineered with two distinct, responsive layouts:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                 DESKTOP LAYOUT (>= 1024px, 16:9 Viewport)              │
├────────────────────────────────────────────────────────────────────────┤
│ [ BRAND IDENTITY ]         [ NAV LINKS ]          [ TELEMETRY & CTA ]  │
│                                                                        │
│  ┌─┐ VELTRAXX [2.0]     Overview    Challenge      (● 35 TEAMS CAP)    │
│  └─┘ SIET · ECE VLSI    Timeline    Rules                              │
│                         Prizes      Department     [ REGISTER TEAM → ] │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                 MOBILE LAYOUT (< 1024px, 9:16 Viewport)                │
├────────────────────────────────────────────────────────────────────────┤
│ [ BRAND IDENTITY ]                          [ COMPACT CTA ]  [ BURGER ]│
│                                                                        │
│  ┌─┐ VELTRAXX [2.0]                            [ REGISTER ]     [ ☰ ]  │
│  └─┘ SIET VLSI                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 5.2 Optical Glass Tokens & Safari Anti-Flicker Engineering

To achieve high-end optical depth without the notorious iOS Safari glass flickering bugs identified in the 1.0 post-mortem:
- **Structural Separation:** The frosted glass backdrop is placed on a dedicated, static background `div`, completely decoupled from interactive buttons or text transforms.
- **Tokens:**
  - Backdrop fill: `rgba(255, 255, 255, 0.78)`
  - Backdrop blur: `backdrop-filter: blur(16px) saturate(180%)`
  - Bottom border: `1px solid rgba(17, 17, 22, 0.08)`
  - Shadow: `0 10px 30px -10px rgba(0, 0, 0, 0.04)`
- **Scroll Morphing:**
  - When `window.scrollY === 0`: Airy 72px height, transparent background, subtle bottom hairline.
  - When `window.scrollY > 20`: Compact 60px height, frosted glass fill active, soft drop shadow.

---

### 5.3 Live Telemetry & Action Elements
1. **Capacity Indicator:**
   - High-contrast pill: `glass-pill px-3 py-1.5 rounded-full flex items-center gap-2`.
   - Animated status pip: Red pulsing beacon (`#FF2A4B animate-pulse-live`).
   - Monospaced text: `35 TEAMS CAP` (or dynamic remaining slots).
2. **Primary Action Button:**
   - Background: Solar Wafer Yellow (`#FFE500`).
   - Hover state: `#F5DC00` with subtle `scale-[1.02]`.
   - Active state: `scale-[0.98]`.
   - Text: `#111116` Heavy Weight (font-bold).
   - Label: `Register Team →` linking to `/register`.
3. **Navigation Links:**
   - Links dynamically resolve based on current route:
     - On `/`: Smooth scroll anchors (`#challenge`, `#timeline`, `#rules`, `/department`).
     - On `/register` or `/department`: Absolute route links (`/#challenge`, `/#timeline`, `/`).

---

### 5.4 Mobile Navigation Drawer & Spring Physics

When the hamburger toggle `[ ☰ ]` is triggered on mobile devices:
1. **Transition:** Slide-down optical glass panel with Apple spring curve (`damping: 24, stiffness: 260`).
2. **Contents:**
   - Large touch-target nav links (`h-12 flex items-center text-lg font-bold`).
   - Live event vitals summary: `28-29 AUGUST 2026 · COIMBATORE`.
   - Direct helpline link: `Call Helpdesk: +91-9751340838`.
   - Full-width high-voltage yellow button: `[ REGISTER YOUR 4-MEMBER TEAM → ]`.
3. **Accessibility:** Closes on `Escape` key, closes on backdrop click, and locks background body scroll when open.

---

## 6. Surface 3: 404 Not Found Page (`*`)

### 6.1 Design Concept & Visual Language

When a user lands on an invalid route (e.g. `/reg`, `/login`, `/dashboard`), they are presented with an elegant, Swiss-style architectural recovery page instead of a generic browser error.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        404 NOT FOUND WIREFRAME                         │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│    [+ TOP-LEFT WAFER CROSSHAIR: 0x00_ADDR_ERR]                         │
│                                                                        │
│                             404                                        │
│                 SIGNAL ROUTING FAILED                                  │
│                                                                        │
│    The requested silicon address is unmapped in the current            │
│    design hierarchy. Verify your link or return to the main arena.     │
│                                                                        │
│    [ RETURN TO HOMEPAGE → ]         [ CONTACT HELPDESK ]               │
│                                                                        │
│    DIAGNOSTIC TELEMETRY:                                               │
│    • BUS_STATUS: ADDR_UNRESOLVED                                       │
│    • CLOCK_CYCLE: NOMINAL (24-HR)                                      │
│    • SYSTEM_TARGET: SIET_VLSI_LAB                                      │
│                                                                        │
│    [+ BOTTOM-RIGHT WAFER CROSSHAIR: 0xFF_END_OF_DIE]                   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 6.2 Key Specifications for 404 Page

1. **Canvas & Atmosphere:**
   - Background: Pure Gallery White (`#FBFBFB`).
   - Etched silicon wafer grid pattern in the background at 4% opacity.
   - Stepper alignment crosshairs in the 4 corners: `+` markers with monospaced coordinate labels (`LOC_X: 00`, `LOC_Y: 00`).
2. **Typographic Hierarchy:**
   - Giant Display Number: `404` in Uncut Sans / Inter Display Heavy, size `clamp(5rem, 15vw, 11rem)`, color `#111116`.
   - Monospaced Tag: `[ ERROR CODE: BUS_ROUTING_FAULT ]` in `#6B6B78`.
   - Headline: `SIGNAL ROUTING FAILED` in uppercase 24px bold.
   - Body Copy: Exactly 21 words. `The requested silicon address is unmapped in the current design hierarchy. Verify your URL or return to the main hackathon arena.` (Strictly zero em-dashes).
3. **Recovery Actions:**
   - Primary Button: `[ RETURN TO HOMEPAGE → ]` with `#FFE500` Solar Wafer Yellow background, navigating to `/`.
   - Secondary Button: `[ CONTACT HELPDESK ]` triggering a click-to-call modal for student coordinators.
   - Keyboard Accelerator: Pressing `Esc` or `H` immediately navigates home.

---

## 7. Taste Skill & Anti-Slop Audit Checklist (Pre-Flight)

Before any code is committed, the implementation must pass all checkpoints below:

| Checkpoint | Requirement | Verification Method |
|---|---|---|
| **Zero Em-Dashes** | No `—` character in any JSX, JSON, or template string | Automated regex search: `git grep "—"` |
| **No Purple Glows** | No violet/purple gradient mesh backgrounds | Visual inspection; CSS audit |
| **Single Submitter** | Only 1 member registers for all 4 team members | End-to-end form completion test |
| **Capacity Gate** | Form locks automatically at 35 teams | RPC test with locked count |
| **Receipt Bucket** | Payment images save to private `receipts` bucket | Supabase storage security check |
| **Mobile Touch Targets** | All inputs and buttons $\ge 48\text{px}$ height | Chrome DevTools device simulation |
| **Zero WebKit Flicker** | Glass blur decoupled from animated containers | iOS Safari physical device testing |
| **Draft Persistence** | Unsubmitted input survives page refresh | `localStorage` inspection on reload |

---

## 8. Handoff to Engineering Dispatch

With this specification ratified:
1. The **Global Header** (`src/components/Navbar.jsx`) can be updated to link cleanly to `/register` and `/department`.
2. The **Registration Funnel** (`src/pages/RegisterPage.jsx` and components) can be implemented with full single-submitter logic, Zod validation, and Supabase integration.
3. The **404 Page** (`src/pages/NotFoundPage.jsx`) can be created with Swiss typographic geometry.
4. The database migration file `backend_sql/003_atomic_registration_rpc.sql` can be authored with the exact RPC contract specified in Section 4.5.
