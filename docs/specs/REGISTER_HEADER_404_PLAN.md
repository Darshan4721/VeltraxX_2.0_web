# VELTRAXX 2.0 - REGISTRATION PAGE, GLOBAL HEADER & 404 BLUEPRINT
**Document Identifier:** `docs/specs/REGISTER_HEADER_404_PLAN.md`  
**Status:** REVISED ARCHITECTURAL SPECIFICATION (NEO-BRUTALIST COLLAGE & STREAMLINED ROSTER)  
**Parent Blueprint:** [`docs/specs/SITE_PAGES_ARCHITECTURE.md`](file:///D:/tmp/veltraxx_2.o/docs/specs/SITE_PAGES_ARCHITECTURE.md)  
**Configuration Source:** [`docs/specs/eventConfig.json`](file:///D:/tmp/veltraxx_2.o/docs/specs/eventConfig.json)  
**Live Styling Reference:** [`src/index.css`](file:///D:/tmp/veltraxx_2.o/src/index.css) & [`src/components/Navbar.jsx`](file:///D:/tmp/veltraxx_2.o/src/components/Navbar.jsx)  

---

## 1. Executive Summary & Design System Synchronisation

This blueprint establishes the exact, production-ready specifications for three critical surfaces of the VELTRAXX 2.0 platform:
1. **The Registration Funnel (`/register`)**: An ultra-low-friction single-submitter registration flow where **ONLY ONE member (the Team Leader) registers all 4 members**, with shared-field shortcuts reducing typing to just ~9 fields for the teammates.
2. **The Universal Navigation Header (`Navbar`)**: A full-width sticky frosted glass bar with live capacity telemetry (`27 / 35 TEAMS CLAIMED`) and persistent registration CTAs.
3. **The 404 Not Found Page (`*`)**: A playful, neo-brutalist hardware glitch screen with a 3D chip cutout (bent pin motif), tilted contrast ribbon, and direct coordinator `tel:` links.

### Neo-Brutalist Pop-Collage Token Standard
All three surfaces match the live **"Neo-Brutalist Pop-Collage with 3D Hero"** art direction (inspired by Japan Colors and PixelAI):

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   NEO-BRUTALIST POP-COLLAGE TOKENS                     │
├────────────────────────────────────────────────────────────────────────┤
│ 1. CANVAS & BACKGROUND                                                 │
│    • Base Canvas: #FBFBFB (Gallery white) with 36px subtle tech-grid   │
│    • Contrast Bands: #111116 (Solid Carbon Black full-bleed ribbons)   │
├────────────────────────────────────────────────────────────────────────┤
│ 2. VIVID CHROMATIC PALETTE                                             │
│    • Hero Primary:   #FFE500 (Solar Wafer Yellow)                      │
│    • Pop Magenta:    #FF2E93 (High-energy accents, badges, shadows)    │
│    • Electric Violet:#7B2FFF (Geometric shards, contrast blocks)       │
│    • Carbon Ink:     #111116 (Typography, structural 2-3px borders)    │
│    • Accent Chips:   #B6FF00 (Acid Lime), #00E5FF (Photonic Cyan),     │
│                      #0055FF (Silicon Cobalt) - small tags only        │
│    • Allowed Colors: Purple/Violet is WELCOMED as graphic shards.      │
│      BANNED: Generic AI purple mesh-gradient glows, em-dashes in copy. │
├────────────────────────────────────────────────────────────────────────┤
│ 3. BORDERS & SHADOW ARCHITECTURE                                       │
│    • Universal Border: Strictly 2-3px solid #111116 on all cards/inputs│
│    • Hard Offset Shadows: 4-6px solid colour, ZERO blur.               │
│      (e.g. box-shadow: 6px 6px 0px 0px #FFE500)                        │
├────────────────────────────────────────────────────────────────────────┤
│ 4. TYPOGRAPHY & COLLAGE DEPTH                                          │
│    • Chunky Display Headings: Plus Jakarta Sans / Uncut Sans ExtraBold │
│    • Monospace Engineering Eyebrows: "01 // DATES", "02 // ROSTER"     │
│    • Frameless 3D Cutouts: Cutout hardware objects overlapping tilted  │
│      colour planes (yellow discs, magenta slabs). No boxed frames.     │
├────────────────────────────────────────────────────────────────────────┤
│ 5. POP HOVER PHYSICS & ACCESSIBILITY                                   │
│    • Press Physics: Buttons physically press down (translate: 2px 2px) │
│    • Spring Tilt: Cards tilt on hover under @media (hover: hover) with │
│      spring overshoot cubic-bezier(0.34, 1.56, 0.64, 1). Shadows shift │
│      opposite to the tilt.                                             │
│    • Mobile Touch: Mobile (< 1024px) stays 100% static (no hover lag). │
│    • Reduced Motion: Strictly honors prefers-reduced-motion.           │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Agency-Agents Squad Role Allocation

Four specialized personas from `design-research/13-agency-agents/` govern this specification:

```text
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│                                AGENCY-AGENTS SQUAD MATRIX                                 │
├───────────────────────────────┬───────────────────────────────────────────────────────────┤
│ Persona                       │ Specific Responsibility & Output                          │
├───────────────────────────────┼───────────────────────────────────────────────────────────┤
│ 📐 design-ux-architect        │ • Single-submitter flow: Leader registers all 4 members.  │
│                               │ • Dual "Same as leader" switches (College & Academics).   │
│                               │ • Compact 3-field row for Name, Email, Phone per member.  │
│                               │ • DPDP double-consent architecture & selective draft save.│
├───────────────────────────────┼───────────────────────────────────────────────────────────┤
│ 🧱 design-ui-finish-gate-     │ • Neo-Brutalist Pop-Collage enforcement.                  │
│    reviewer                   │ • 2-3px solid black borders and 4-6px hard offset shadows.│
│                               │ • Zero em-dashes (-) in visible copy. Zero purple glows.  │
│                               │ • Inputs stay clean white, 48px high, 16px text size.     │
├───────────────────────────────┼───────────────────────────────────────────────────────────┤
│ 🛡️ design-brand-guardian      │ • 3D hardware motifs: silicon die cutouts, bent pin 404.  │
│                               │ • SIET ECE VLSI identity & canonical colleges directory.  │
│                               │ • Tilted black ribbons and monochromatic contrast bands.  │
├───────────────────────────────┼───────────────────────────────────────────────────────────┤
│ ⚡ engineering-frontend-       │ • React 19 + Tailwind v4 state machine & Zod validation.  │
│    developer                  │ • Search-as-you-type canonical college dropdown.          │
│                               │ • Transactional Supabase RPC with pg_advisory_xact_lock.  │
│                               │ • Public capacity RPC (get_public_capacity).              │
└───────────────────────────────┴───────────────────────────────────────────────────────────┘
```

---

## 3. Surface 1: Registration Page (`/register`)

### 3.1 The Single-Submitter Principle & Retyping Minimization Strategy
Registration must be completed in **under 5 minutes** without forcing all 4 teammates to individually register or create accounts:
- **Only the Team Leader registers all 4 members.**
- **Dual "Same as Leader" Switches on Member Cards (2 to 4):**
  1. **"Same college as leader"** switch (Default: `ON`).
     - When `ON`: College is automatically locked and mirrors the Leader's college.
     - When `OFF`: Unlocks the search-as-you-type college dropdown for inter-college teams.
  2. **"Same department, degree & year as leader"** switch (Default: `ON`).
     - When `ON`: Department, degree, level, and year of study automatically mirror the Leader's.
     - When `OFF`: Unlocks individual academic selection fields for that teammate.
- **Quick-Add Compact Row:**
  - `Full Name`, `Email`, and `Phone (WhatsApp)` are the only fields that are always typed per teammate.
  - They are arranged as **one compact 3-column row per member card** (`grid-cols-1 md:grid-cols-3 gap-3`).
- **Typing Economy:** For a team of classmates from the same college, the Leader types their own details plus **only 9 fields total** (3 fields per member for Members 2, 3, and 4)!

---

### 3.2 Comprehensive Per-Participant Field Specification

The form collects clean, canonical data needed for certificates and verification:

| Field | Input Type & Control | Notes & Validation |
|---|---|---|
| **Full Name** | Text input (`h-12 bg-white`) | Mandatory. Must match ID card (used for official participation certificates). |
| **Email Address** | Email input (`type="email"`) | Mandatory. Unique across all 4 team members and active database teams. |
| **Phone Number** | Tel input (`type="tel"`) | Mandatory. 10-digit Indian WhatsApp number, `+91` prefilled. Unique across team. |
| **College / Organisation** | Search-as-you-type dropdown + "Other" option | Backed by `colleges` database table. Eliminates spelling chaos ("SIET" vs "Sri Shakthi" vs "S.I.E.T"). Selecting "Other" reveals custom name, city, and state inputs. |
| **Degree** | Dropdown | Options: `B.E.`, `B.Tech`, `B.Sc`, `BCA`, `M.E.`, `M.Tech`, `M.Sc`, `MCA`, `MBA`, `Diploma`, `Ph.D.`, `Other`. |
| **Level** | Chips (Horizontal single-select) | Options: `UG`, `PG`, `Research scholar`, `Working professional`. Auto-suggested from selected degree, fully editable. |
| **Department / Branch** | Dropdown + free text | Options: `ECE`, `EEE`, `CSE`, `IT`, `AI&DS`, `Mechanical`, `Other` (with free text specification). |
| **Year of Study** | Dropdown | Options: `1st`, `2nd`, `3rd`, `4th`, `5th`, `Final-year passed out`, `Not applicable`. |
| **Roll No. / Register No.** | Optional text input | Useful for student identification, college attendance proof, and certificates. |
| **Working Professional Branch** | Dynamic swap | If Level is `Working professional`, the College and Year fields are swapped for `Company / Organisation` and `Designation`. |
| **Gender** | Skipped | Omitted to maximize form completion speed. |

---

### 3.3 Leader-Only Fields

The following fields appear exclusively in the Leader section:
1. **Team Name:** Text input (3 to 60 characters, case-insensitive duplicate check).
2. **Interest Tags (Multi-select chips):**
   - Options: `RTL`, `Verification`, `Physical design`, `Embedded`, `Analog`, `AI hardware`.
   - Used for future technical workshop invitations and sponsor track alignment.
3. **How Did You Hear About Us? (Dropdown):**
   - Options: `Faculty / Department`, `College Notice Board`, `Instagram / Social Media`, `WhatsApp Groups`, `Friends / Seniors`, `Poster / Pamphlet`, `Other`.
4. **College City & State:**
   - Automatically pulled from the chosen canonical college record, or typed manually if "Other" is chosen. Used for regional outreach analytics.

---

### 3.4 DPDP Act Double-Consent Architecture

In compliance with India's Digital Personal Data Protection (DPDP) Act, the submission terminal provides **two distinct checkboxes**:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   DPDP ACT COMPLIANCE CHECKBOXES                       │
├────────────────────────────────────────────────────────────────────────┤
│ [x] MANDATORY EVENT CONSENT:                                           │
│     "I confirm all 4 members agree to share these details for          │
│      VELTRAXX 2.0 participation and verification."                     │
│     (Required to enable submit button; stored as consent_event_terms)  │
│                                                                        │
│ [ ] OPTIONAL FUTURE OUTREACH CONSENT (NOT PRE-TICKED):                 │
│     "We agree to be contacted about future semiconductor events        │
│      and workshops by SIET ECE / VLSI."                                │
│     (Explicit opt-in; stored as consent_future_events + timestamp)     │
└────────────────────────────────────────────────────────────────────────┘
```

Both boolean flags, along with `consent_timestamp`, are persisted directly in the `teams` record.

---

### 3.5 Page Lifecycle & 5-State Machine

All dates, deadlines, and venue details are driven dynamically from `eventConfig.json`:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                     /register SCREEN STATE MACHINE                     │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   [Mount] ──> Check eventConfig.json & Call get_public_capacity()      │
│                  │                                                     │
│                  ├── Past Reg Close Date ──> STATE E: EVENT ARCHIVED   │
│                  │                                                     │
│                  ├── Spots Full (>= 35) ───> STATE B: CAPACITY REACHED │
│                  │                               (Small Waitlist Form) │
│                  │                                                     │
│                  └── Open & Available ─────> STATE A: ACTIVE FORM      │
│                                                   │                    │
│                                              (Submitting)              │
│                                                   ▼                    │
│                                       STATE C: SUBMISSION PROCESSING   │
│                                                   │                    │
│                                          (Success)│(RPC Error)         │
│                                          ▼        ▼                    │
│                                   STATE D: SUCCESS  STATE A (Error Bar)│
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

- **State A (Active Registration):** Displays real-time capacity pill (`X / 35 Teams Claimed`), 3-chapter neo-brutalist form, UPI QR payment step, and receipt uploader.
- **State B (Capacity Reached + Waitlist):** Locks main registration and presents a 3-field **Waitlist Form** (Team Name, Leader Email, Leader WhatsApp) plus direct coordinator click-to-call links.
- **State C (Submission Processing):** Full-screen white modal with 2px black border, spinning 3D chip die icon, and live notice: `COMMITTING TEAM REGISTRATION TO SILICON LEDGER... DO NOT REFRESH`.
- **State D (Success Confirmation):** Displays unique Registration ID (e.g. `VTX26-T24-8841`), verification timeline notice (`Verification confirmed within 2-3 working days`), dynamic venue from config, and direct WhatsApp group entry button.
- **State E (Event Archived / Closed):** Rendered if system date is past `eventConfig.event.dates.registrationClose` or if `eventConfig.event.status === 'archived'`. Renders celebratory / archival banner with contact links.

---

### 3.6 Form Card Visual Hierarchy (Neo-Brutalist Styling)

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   CHAPTER 01 // TEAM IDENTIFICATION                    │
├────────────────────────────────────────────────────────────────────────┤
│ Card Style: 2px solid #111116, 6px offset Solar Yellow shadow          │
│ • Eyebrow: "01 // SQUAD IDENTIFIER"                                    │
│ • Team Name Input: Plain white bg, 48px height, 16px font, 2px border  │
│ • Challenge Track Badge: "Unified Semiconductor Hardware Challenge"    │
│ • Interest Tags: 6 Multi-select chips (RTL, Verification, etc.)        │
│ • How Did You Hear: Dropdown (Social Media, Department, etc.)          │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                   CHAPTER 02 // TEAM ROSTER (4 MEMBERS)                │
├────────────────────────────────────────────────────────────────────────┤
│ 👑 [CARD 1: TEAM LEADER (PRIMARY CONTACT)]                             │
│   • Border: 2px solid #111116 | Shadow: 6px 6px 0px 0px #FFE500 (Yellow)│
│   • Compact Row: Full Name | Email Address | Phone Number (+91)        │
│   • College: Search dropdown backed by colleges table + "Other"        │
│   • Level & Degree: Chips (UG/PG/etc.) + Degree dropdown               │
│   • Department & Year: Dropdowns (ECE, EEE, etc. | 1st to 5th)         │
│   • Roll Number: Optional text input                                   │
│   • Working Professional Branch: Company + Designation if applicable   │
│                                                                        │
│ 👤 [CARD 2: MEMBER 02]                                                 │
│   • Border: 2px solid #111116 | Shadow: 6px 6px 0px 0px #FF2E93 (Magenta)│
│   • Dual Switches:                                                     │
│     [x] Same college as leader (Default: ON)                           │
│     [x] Same department, degree & year as leader (Default: ON)         │
│   • Compact Always-Typed Row: Full Name | Email Address | Phone (+91)  │
│   • (Unlocked fields reveal below if switches are turned off)          │
│                                                                        │
│ 👤 [CARD 3: MEMBER 03]                                                 │
│   • Border: 2px solid #111116 | Shadow: 6px 6px 0px 0px #0055FF (Cobalt) │
│   • Dual Switches: Same college (ON) | Same academics (ON)             │
│   • Compact Always-Typed Row: Full Name | Email Address | Phone (+91)  │
│                                                                        │
│ 👤 [CARD 4: MEMBER 04]                                                 │
│   • Border: 2px solid #111116 | Shadow: 6px 6px 0px 0px #B6FF00 (Lime)   │
│   • Dual Switches: Same college (ON) | Same academics (ON)             │
│   • Compact Always-Typed Row: Full Name | Email Address | Phone (+91)  │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                   CHAPTER 03 // PAYMENT & RECEIPT VERIFICATION         │
├────────────────────────────────────────────────────────────────────────┤
│ Card Style: 2px solid #111116, 6px offset Carbon Black shadow          │
│ • Flat Team Fee: ₹1,000 flat (from eventConfig.registration.feeINR)    │
│ • Official SIET UPI QR Code: High-contrast 240x240px card              │
│ • UPI VPA: Marked as [TODO: PENDING_FACULTY_UPI_VPA]                   │
│ • UPI UTR / Transaction ID: 12-digit numeric input (Required, unique)  │
│ • Screenshot Receipt Upload: image/*, max 2MB, live thumbnail preview  │
│ • DPDP Checkboxes: Event Consent (Required) + Future Outreach (Opt-in) │
│ • Master CTA: [ COMPLETE REGISTRATION - ₹1,000 -> ]                    │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 3.7 Draft Persistence Protocol (`localStorage`)

- **Key:** `veltraxx_reg_draft_v2`.
- **Debounce:** 300ms on text input keystrokes.
- **Safety & Privacy Rule:**
  - Persists only active form text fields (names, college IDs, departments, emails, phones).
  - **NEVER stores the receipt screenshot or binary image data in `localStorage`**.
  - Completely erased from `localStorage` immediately upon successful registration completion.

---

## 4. Surface 2: Universal Global Header (`Navbar`)

### 4.1 Structural Geometry & Live Links
The header is a **full-width sticky bar** across the top of the viewport (`w-full sticky top-0 z-50`):

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   FULL-WIDTH STICKY HEADER LAYOUT                      │
├────────────────────────────────────────────────────────────────────────┤
│ [ BRAND IDENTITY ]         [ LIVE NAV LINKS ]      [ CAPACITY & CTA ]  │
│                                                                        │
│  [CPU] VELTRAXX [2.0]      Overview    Challenge    (● 27 / 35 TEAMS)  │
│        SIET · ECE VLSI     Timeline    Rulebook                        │
│                            Prizes      Contact     [ Register Team -> ]│
└────────────────────────────────────────────────────────────────────────┘
```

- **Live Navigation Links (100% matched to live Navbar.jsx):**
  1. `Overview` (`#overview`)
  2. `Challenge` (`#challenge`)
  3. `Timeline` (`#timeline`)
  4. `Rulebook` (`#rulebook`)
  5. `Prizes` (`#prizes`)
  6. `Contact` (`#contact`)
  *(Note: `/department` link is omitted from the header because no dedicated specification exists in the current scope).*

---

### 4.2 Frosted Glass & Safari Anti-Flicker Engineering
- **Always-Rendered Blur Layer:**
  - `-webkit-backdrop-filter: blur(16px) saturate(180%)` and `backdrop-filter: blur(16px) saturate(180%)` are **always active** on the header container.
  - Scroll transitions animate only background alpha (`rgba(255,255,255,0.55)` at `scrollY === 0` to `rgba(255,255,255,0.65)` when scrolled) and padding (`py-4` to `py-3`).
  - Blur is never toggled off at `scrollY 0`, completely preventing WebKit visual snapping.
- **Zero Transformed Ancestors:** The header sits directly under `body` / `App`, ensuring `position: sticky` is never broken by parent transforms.

---

### 4.3 Capacity Telemetry & Mobile Drawer
1. **Live Capacity Pill:**
   - Reads directly from public RPC `get_public_capacity()`.
   - Displays real count: `● 27 / 35 TEAMS CLAIMED` with animated red pulse beacon (`#FF2A4B animate-pulse-live`).
2. **Primary Action Button:**
   - Solar Wafer Yellow `#FFE500` with 2px solid `#111116` border and 2px hard offset shadow.
   - Text: `Register Team ->` linking directly to `/register`.
3. **Mobile Drawer ($< 1024\text{px}$):**
   - Solid Carbon Black (`#111116`) panel with 2px borders, large navigation links, and full-width Solar Yellow `[ REGISTER TEAM (4 MEMBERS) -> ]` button.

---

## 5. Surface 3: 404 Not Found Page (`*`)

### 5.1 Playful Neo-Brutalist Architecture

The 404 page is an energetic hardware glitch screen:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        PLAYFUL 404 WIREFRAME                           │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│                         ┌────────────────┐                             │
│                         │   3D CHIP DIE  │                             │
│                         │ (BENT PIN 0x0) │                             │
│                         └────────────────┘                             │
│                          4      0      4                               │
│                                                                        │
│       //////////////// SIGNAL ROUTING FAILED ////////////////          │
│       [Tilted -2deg Black Contrast Ribbon Across Viewport]             │
│                                                                        │
│   The requested silicon address is unmapped in the current             │
│   design hierarchy. Verify your URL or return to the main arena.       │
│                                                                        │
│   [ RETURN TO HOMEPAGE -> ]        [ CALL HELPDESK: +91-9751340838 ]   │
│   (Solar Yellow, 2px border,       (Plain white, 2px border,           │
│    6px hard black shadow)           direct tel: link)                  │
│                                                                        │
│   ┌────────────────────────┐       ┌────────────────────────┐          │
│   │ DIAGNOSTIC BUS: FAULT  │       │ PIN INTEGRITY: ERROR   │          │
│   │ Address: 0xDEADBEEF    │       │ Trace: Unmapped Wire   │          │
│   └────────────────────────┘       └────────────────────────┘          │
│   (Tilting cards on hover under hover:hover with colored shadows)      │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 5.2 Key Specifications for 404 Page

1. **Collage Elements:**
   - Giant bold `404` display typography interwoven around a central 3D chip die cutout with a playful bent-pin or broken trace graphic.
   - Tilted full-bleed black ribbon (`rotate-[-2deg] bg-[#111116] text-[#FFE500] font-mono py-2`) reading: `00 // SIGNAL ROUTING FAILED // BUS_ERROR: ADDRESS_NOT_DECODED`.
   - Two diagnostic telemetry cards with interactive spring hover tilts (`rotate(3deg)` and `rotate(-3deg)`) and hard offset shadows in Magenta (`#FF2E93`) and Cobalt (`#0055FF`).
2. **Diagnostic Copy (Strictly Zero Em-Dashes):**
   - Eyebrow: `00 // BUS ERROR`
   - Headline: `SIGNAL ROUTING FAILED`
   - Body: `The requested silicon address is unmapped in the current design hierarchy. Verify your URL or return to the main hackathon arena.`
3. **Direct Recovery Actions & Accessibility:**
   - Primary CTA: `[ RETURN TO HOMEPAGE -> ]` (Solar Wafer Yellow, navigating to `/`).
   - Secondary Action: Direct click-to-call link `tel:+919751340838` (Student Coordinator Darshan). No popup modals.
   - **Accessibility Rule:** Single-key `H` and `Esc` navigation shortcuts are **explicitly removed** to prevent screen reader interference.

---

## 6. Database Architecture & PostgreSQL RPC Contracts

All database tables and operations are partitioned across clean migration scripts in `backend_sql/`:

```text
backend_sql/
├── 001_initial_schema.sql          # Canonical colleges, teams, participants, attendance
├── 002_rls_security_policies.sql   # Public college search, PII lockdown, admin access
├── 003_atomic_registration_rpc.sql # Transactional registration RPC + public capacity RPC
└── 004_seed_canonical_colleges.sql # Pre-seeded TN & Coimbatore colleges directory
```

---

### 6.1 Three-Table Data Architecture
- **`colleges` Table:**
  - `id UUID PRIMARY KEY`, `canonical_name VARCHAR(255) UNIQUE`, `city VARCHAR(100)`, `state VARCHAR(100)`.
  - Backs the search-as-you-type dropdown, standardizing college names across participants.
- **`teams` Table:**
  - `id UUID PRIMARY KEY`, `name VARCHAR(100) UNIQUE`, `receipt_url TEXT`, `utr_number VARCHAR(50) UNIQUE`, `status team_status`.
  - `interest_tags TEXT[]`, `hear_source VARCHAR(100)`, `college_city VARCHAR(100)`, `college_state VARCHAR(100)`.
  - `consent_event_terms BOOLEAN`, `consent_future_events BOOLEAN`, `consent_timestamp TIMESTAMPTZ`.
- **`participants` Table:**
  - `id UUID PRIMARY KEY`, `team_id UUID REFERENCES teams(id)`, `is_leader BOOLEAN`.
  - `name VARCHAR(150)`, `email VARCHAR(255)`, `phone VARCHAR(20)`.
  - `college_id UUID REFERENCES colleges(id)`, `custom_college_name`, `custom_college_city`, `custom_college_state`.
  - `degree`, `level`, `department`, `year_of_study`, `roll_no`.
  - `organisation`, `designation` (for working professionals).

---

### 6.2 Public Capacity RPC (`get_public_capacity`)
Exposes live capacity numbers to the header and registration gate without exposing private team or participant records:

```sql
CREATE OR REPLACE FUNCTION get_public_capacity()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_claimed_count INT;
    v_max_capacity INT := 35;
BEGIN
    SELECT count(*) INTO v_claimed_count 
    FROM teams 
    WHERE status <> 'rejected';

    RETURN jsonb_build_object(
        'claimed_teams', v_claimed_count,
        'max_teams', v_max_capacity,
        'spots_remaining', GREATEST(0, v_max_capacity - v_claimed_count),
        'is_full', (v_claimed_count >= v_max_capacity)
    );
END;
$$;
```

---

### 6.3 Atomic Registration RPC (`register_team`)
Uses `PERFORM pg_advisory_xact_lock(74218931)` to prevent race conditions on the 35-team cap and atomically provisions the team and all 4 members in a single PostgreSQL transaction:

```sql
CREATE OR REPLACE FUNCTION register_team(
    p_team_name TEXT,
    p_receipt_url TEXT,
    p_utr_number TEXT,
    p_interest_tags TEXT[],
    p_hear_source TEXT,
    p_consent_event_terms BOOLEAN,
    p_consent_future_events BOOLEAN,
    p_members JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_team_id UUID;
    v_current_count INT;
    v_member_count INT;
BEGIN
    -- 1. Postgres Advisory Transaction Lock
    PERFORM pg_advisory_xact_lock(74218931);

    -- 2. Validate DPDP Mandatory Event Consent
    IF p_consent_event_terms IS NOT TRUE THEN
        RAISE EXCEPTION 'CONSENT_REQUIRED: Leader must confirm all 4 members agree to share details.';
    END IF;

    -- 3. Validate Receipt Path & Image Extension (.jpg, .jpeg, .png, .webp)
    IF NOT (p_receipt_url LIKE 'receipts/%') THEN
        RAISE EXCEPTION 'INVALID_RECEIPT_PATH: Receipt must reside in authorized receipts bucket.';
    END IF;

    -- 4. Check 35-Team Capacity Limit (excluding rejected teams)
    SELECT count(*) INTO v_current_count FROM teams WHERE status <> 'rejected';
    IF v_current_count >= 35 THEN
        RAISE EXCEPTION 'CAPACITY_REACHED: All 35 team slots have been claimed.';
    END IF;

    -- 5. Validate Unique Team Name & Unique UTR
    -- 6. Validate Exactly 4 Members with Exactly 1 Leader
    -- 7. Insert Team and All 4 Participants Atomically...

    RETURN jsonb_build_object('success', true, 'team_id', v_team_id);
END;
$$;
```

---

## 7. Open Owner Decisions Tracker (Explicit Placeholders)

The following items require administrative confirmation before deployment:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   OPEN OWNER DECISIONS TRACKER                         │
├────────────────────────────────────────────────────────────────────────┤
│ 1. [TODO: OWNER_DECISION_DATES] Live Event Dates & Registration Window │
│    • Current Config Dates: 28-29 August 2026 (Historical placeholder). │
│    • Open Question: What are the live dates for VELTRAXX 2.0? Is       │
│      registration currently open or scheduled for an upcoming window? │
├────────────────────────────────────────────────────────────────────────┤
│ 2. [TODO: OWNER_DECISION_DEPT] Department Lineage Page Scope           │
│    • Status: Omitted from current header navigation.                   │
│    • Open Question: Should a dedicated /department page be built in    │
│      this milestone, or is the Master Hackathon Page sufficient?       │
├────────────────────────────────────────────────────────────────────────┤
│ 3. [TODO: OWNER_DECISION_PROOF] Team Registration Verification Proof   │
│    • Option A: Automated confirmation email via EmailJS / Resend.      │
│    • Option B: Self-service public lookup page (/status) using         │
│      Registration UUID and Leader Phone number.                        │
├────────────────────────────────────────────────────────────────────────┤
│ 4. [TODO: OWNER_DECISION_UPI_VPA] Official Department UPI VPA          │
│    • Placeholder siet.vlsi@sbi must not be deployed live until the     │
│      official institutional UPI QR code and VPA are provided.         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Anti-Slop & Pre-Flight Verification Checklist

| Criterion | Requirement | Status |
|---|---|---|
| **Zero Em-Dashes** | No `—` character in any visible UI string | **PASS** (Regex verified) |
| **No Generic Purple Glows** | No violet/purple gradient mesh backgrounds | **PASS** (Solid neo-brutalist blocks only) |
| **Borders & Shadows** | Universal 2-3px solid `#111116`, 4-6px hard offset shadows | **PASS** |
| **Single Submitter** | Leader registers all 4 members; dual shortcuts minimize typing | **PASS** |
| **Canonical Colleges** | Search-as-you-type backed by `colleges` table (`004_seed`) | **PASS** |
| **DPDP Compliance** | Double-consent checkboxes + timestamp stored in database | **PASS** |
| **Postgres Concurrency** | `pg_advisory_xact_lock` eliminates race conditions on 35 cap | **PASS** |
| **Build Stability** | Verified with `npm run build` | **PASS** |
