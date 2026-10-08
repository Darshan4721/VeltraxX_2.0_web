FINAL QA AUDIT: VELTRAXX 2.0 website. READ-ONLY.

HARD RULE: DO NOT modify, create, delete or reformat any source file, config,
style, asset or database script. Only write one new file:
docs/audits/FINAL_UI_AUDIT.md. Before you start and when you finish, run
"git status" and confirm nothing else changed. If you think a fix is needed,
describe it in the report; do not apply it.

ROLES: act as these reviewers from design-research/13-agency-agents/ (use any
that exist, and say which ones you used): design-ui-finish-gate-reviewer,
design-ux-architect, design-brand-guardian, engineering-frontend-developer.
Add a plain-language editor role for Part B.

PAGES IN SCOPE: / (home), /register, /tracker, the 404 page, and the global
header on every page.
VIEWPORTS: 360px, 375px, 414px (phones) and 1440px (laptop). Also test with the
keyboard only (Tab, Shift+Tab, Enter, Space, Escape), and once on a slow network.

======================================================================
PART A: DEAD-END AND TRAP CHECK (does every component know what to do?)
======================================================================
For EVERY interactive component, list its ways in and ways out, and test each
one. A "dead end" is any state the user cannot leave with a normal action.

Components to test at minimum: mobile menu (hamburger), nav links, dropdowns
and selects, college search dropdown, accordions (FAQ), modals and overlays,
the full-screen "processing" state, toasts and error bars, file upload,
image/receipt viewer in /tracker, PIN screen, tab filters, collapsible member
cards, the "same as leader" switches, sticky bars, carousels or marquees.

For each component, test these exits and report PASS / FAIL:
1. Close by tapping or clicking OUTSIDE it.
2. Close with the Escape key.
3. Close by choosing an item (menu closes after a link is tapped; the page
   scrolls to the section).
4. Close when the route changes or the browser Back button is pressed.
5. Close or reset when the screen is rotated or resized across the 1024px
   breakpoint.
6. Visible close button with a tap target of at least 48px.
7. Page scroll is locked while it is open and RELEASED afterwards (check the
   page does not stay frozen).
8. Keyboard focus moves into it when it opens, stays inside while open, and
   returns to the opening button when it closes.
9. It cannot be opened twice, stacked on another overlay, or left half-open
   after a fast double-tap.
10. Reopening it shows a clean state (not stuck mid-animation).

Also test these flow dead ends:
- Form: refresh the page mid-way, press Back, close the tab and return (draft
  restored?), double-click Submit (duplicate submit?), submit with the network
  off, submit with a failed upload, upload a wrong or oversized file, paste
  invalid values, remove a file and re-add it.
- Every error message: does it say what went wrong AND what to do next? Is
  there always a way to retry?
- Empty, loading, success, error, full-capacity and offline states: does each
  exist, and does each have a clear next action (button or link)?
- Any button or link that does nothing, goes to a missing anchor, or leads to a
  page with no way back.
- Any text or control cut off, overlapping, or off-screen at 360px; any
  horizontal scrolling; any tap target under 48px; any fixed bar that covers
  content or the on-screen keyboard.
- Header links: do they work from /register and the 404 page, not only the
  home page?

======================================================================
PART B: PLAIN-LANGUAGE CHECK (students must understand it on first read)
======================================================================
Audience: Indian engineering and diploma students, second-language English
readers, reading on a phone. Quick-scan reading, not careful reading.

Read EVERY piece of visible text: headings, buttons, labels, placeholders,
errors, toasts, FAQ, rules, footer, the 404 copy, and tiny monospace tags.

Flag and classify each item:
1. JARGON: technical or "cool" words a student may not know or that read like
   a different product (examples to look for: telemetry, ledger, bus error,
   unmapped address, silicon address, UTR, BYOD, DPDP, PPA, BGA, die,
   provisioning, atomic, archived, canonical, ignition). For each, choose
   KEEP (VLSI terms the audience should know, such as RTL, FPGA, synthesis),
   EXPLAIN (keep it and add a 5-word hint), or REPLACE (give a simpler
   wording).
2. HARD TO PRONOUNCE or hard to spell for Indian readers: long words, unusual
   words, words with silent letters or rare letter patterns. Suggest a
   shorter everyday word.
3. LONG SENTENCES: more than 20 words, or two ideas in one sentence. Suggest
   a split.
4. VAGUE OR CLEVER COPY that hides the action (for example a button or message
   that is a joke instead of an instruction).
5. ALL-CAPS paragraphs, and tiny faint text that is hard to read on a phone.
6. INCONSISTENT NAMES for the same thing (team leader / captain, fee / payment,
   register / sign up). Pick one.
7. Missing "what happens next" lines after key actions (payment, submit).

Rules for the rewrites you suggest: short everyday English, active voice, one
idea per sentence, no idioms, no em-dashes, keep the page's fun tone but never
let the fun hide the meaning. Where a technical term must stay, explain it in
plain words once, near its first use.

======================================================================
PART C: ANYTHING ELSE A STUDENT WOULD STUMBLE ON
======================================================================
Note any issue in: colour contrast on yellow, lime or magenta; text over images;
form labels vs placeholders; keyboard type per field (phone, email, number);
autofill behaviour; slow-loading images (page weight on a phone); animation
that causes lag or motion sickness; anything that only works with a mouse
hover.

======================================================================
REPORT FORMAT (write to docs/audits/FINAL_UI_AUDIT.md)
======================================================================
1. Summary: counts of issues by severity and a go / no-go verdict for launch.
2. Table of issues, each row:
   ID | Severity (BLOCKER / HIGH / MEDIUM / LOW) | Page | Component or text |
   Viewport | Steps to reproduce | What happens | What should happen |
   Suggested fix (described, not applied)
3. Part B as a separate table: Current text | Where | Problem | Suggested
   plain wording.
4. A list of things that passed, so we know what was tested.
5. List of anything you could NOT test and why.
Severity rule: BLOCKER = user is stuck or cannot register. HIGH = confusing or
broken for many users. MEDIUM = awkward. LOW = polish.
Be specific: give file paths and line numbers where you can find them. Do not
guess; if you did not test it, say so.

FINISH: run "git status" again and state that no source files were changed.



use what ever agency agents roles to do this and find the skill too only after that do the audit 
[/goal](slashCommand;goal) 


FULL A-TO-Z AUDIT: VELTRAXX 2.0 website. READ-ONLY. SEQUENTIAL.

======================================================================
0. HARD RULES (apply to every lane)
======================================================================
- DO NOT modify, create, delete or reformat any source file, config, style,
  asset, migration or package file. Do not run anything that changes
  package.json, the lockfile or node_modules (no installs, no upgrades).
- You may write ONLY inside docs/audits/ (the report, per-lane notes, and
  screenshots in docs/audits/evidence/). Temporary scripts go outside the
  repo (for example the OS temp folder) and are deleted afterwards.
- Run "git status" at the very start and at the very end, paste both outputs
  into the report, and state that only files inside docs/audits/ are new.
- NON-DESTRUCTIVE TESTING ONLY. Never submit a real registration, upload a
  real receipt, or write, update or delete rows in any production or shared
  database. Use local, mock or test data and a test database only. If a test
  would need production, mark it NOT TESTED and say why.
- NEVER print secret values in the report: no PINs, passwords, API keys,
  service keys, UPI IDs or tokens. Write "[REDACTED]" and give the file path
  and line number instead. If you find a secret committed in the repo or the
  git history, report it as a finding without repeating the value.
- Evidence rule: for every test, state HOW you did it: RAN IN BROWSER, RAN AS
  SCRIPT, or INFERRED FROM CODE (and which file). INFERRED is allowed but must
  be labelled and counted as a lower-confidence finding. Do not claim PASS for
  anything you did not test; write NOT TESTED.
- Be skeptical. Default verdict is NEEDS WORK until proven otherwise.

======================================================================
1. HOW TO RUN: ONE LANE AT A TIME, IN ORDER
======================================================================
Run Lanes 1 to 10 sequentially. Finish one lane completely and write its
section into docs/audits/FINAL_FULL_AUDIT.md before starting the next. Do not
parallelise. In each lane, run the listed agents/skills one after the other
(Lead first, then its Twin). Locate each agent or skill file by searching the
repo and plugin folders (the catalog paths may be written loosely). At the
start of each lane write: which agents/skills you actually ran, and which
listed ones you could NOT find. If one is missing, say so and cover its job
yourself, labelled as "covered by general review".

Catalog reference: MASTER_AUDIT_AGENTS_CATALOG.md (use its lane roster and
role descriptions).

PAGES IN SCOPE: / (home), /register, /tracker, the 404 page, and the global
header on every page.
VIEWPORTS: 360px, 375px, 414px (phones) and 1440px (laptop). Also test
keyboard-only (Tab, Shift+Tab, Enter, Space, Escape, arrows), and once on a
throttled slow network.

======================================================================
2. THE LANES
======================================================================

LANE 1: VISUAL DESIGN AND ANTI-SLOP
Run: design-ui-finish-gate-reviewer, then design-director, then emil-design-eng,
then design-brand-guardian.
Check: fidelity to the neo-brutalist pop-collage design (2-3px solid #111116
borders, 4-6px hard zero-blur shadows, palette yellow/magenta/violet/black with
small cyan/lime accents), one consistent border and shadow size across pages,
no em-dashes in any visible text, no generic purple mesh glows, no "three equal
cards" template look, press physics on buttons, no hover layout jitter, VLSI
identity (chips, wafers, dies) intact, header frosted glass visible at scroll
position 0.

LANE 2: UX, FORM FUNNEL AND DEAD ENDS (the trap check)
Run: design-ux-architect, design-persona-walkthrough, click-path-audit.
Persona walkthroughs: stressed student leader on a budget Android phone, a
working professional, a classmate-only team, an inter-college team.
For EVERY interactive component (mobile hamburger menu, nav links, selects,
college search dropdown, FAQ accordion, modals and overlays, processing state,
toasts and error bars, file upload, receipt viewer, PIN screen, filter tabs,
collapsible member cards, "same as leader" switches, sticky bars, marquees),
test these 10 exits and report PASS / FAIL / NOT TESTED:
 1 close by tapping outside   2 close with Escape   3 close by choosing an item
 4 close on route change or browser Back   5 reset on rotate/resize across
 1024px   6 visible close button, tap target at least 48px   7 scroll locked
 while open AND released afterwards   8 focus moves in, stays in, returns to
 the opener   9 cannot double-open or stack   10 reopens in a clean state
Flow dead ends: refresh mid-form, Back button, close tab and return (draft
restored?), double-click Submit, submit offline, failed upload, wrong or
oversized file, remove and re-add a file, long names, emoji in names, pasted
invalid values. Every error message must say what went wrong AND what to do
next. Every state (empty, loading, success, error, full capacity, offline) must
have a clear next action. Header links must work from /register and the 404
page, not only the home page. Check for horizontal scroll at 360px, text cut
off, tap targets under 48px, fixed bars covering content or the keyboard,
inputs under 16px (iOS zoom), correct keyboard types (tel, email, numeric).

LANE 3: ACCESSIBILITY (WCAG 2.2 AA)
Run: testing-accessibility-auditor, a11y-architect, frontend-a11y,
engineering-section-508-specialist.
Check: keyboard order and focus visibility, div/span acting as buttons, ARIA on
menus, dropdowns, modals and accordions, focus traps in modals and drawers,
aria-live for errors and toasts, label and input pairing, alt text, colour
contrast. MEASURE contrast with a real calculation (give the two hex colours
and the resulting ratio); do not estimate. Include text on yellow, lime and
magenta, white text on magenta, and tiny monospace tags.

LANE 4: SECURITY
Run: security-ai-generated-code-auditor, security-penetration-tester,
security-audit, security-reviewer (/security-scan), security-secrets-credential-
engineer.
Check: secrets in the client bundle or env files (VITE_ variables), service-role
keys in client code, secrets in git history and scratch scripts, XSS sinks,
parameter tampering (fee amount, team status, leader flag), client-side-only
checks, storage bucket access (can receipts be listed or guessed?), the
/tracker PIN gate (is the PIN checked on the server, can the roster be fetched
without the PIN by calling the API directly, is the PIN stored in code or in
docs, does it rate-limit wrong guesses), unlisted route and noindex, dependency
CVEs. Test only with anon/public access against a local or test backend.

LANE 5: DATABASE, RLS AND CONCURRENCY
Run: engineering-database-reliability-engineer, database-reviewer,
postgres-patterns and database-migrations.
Check the SQL files: register_team and get_public_capacity (advisory lock,
SET search_path = public, invalid syntax, all 4 members and exactly 1 leader
enforced, duplicate team name, UTR, email and phone checks, rejected teams not
counted, receipt path and type validation, orphan file cleanup), row-level
security for teams, participants and colleges (can an anonymous user read
personal data?), indexes and foreign keys, the 12-digit UTR rule matching
between form and schema. If you cannot run against a real database, say so,
and list which conclusions come only from reading the SQL.

LANE 6: FRONTEND CODE HEALTH
Run: silent-failure-hunter, react-reviewer (/react-review), codehealth-mcp,
engineering-code-reviewer (/code-review).
Check: empty catch blocks, swallowed errors, dangerous fallbacks, effect
cleanup (listeners, timers, body scroll lock), stale closures, missing keys,
state mutation, very large components, dead code, hard-coded values that belong
in eventConfig, console errors.

LANE 7: BROWSER QA AND END-TO-END
Run: browser-qa, testing-test-automation-engineer (e2e-runner), independent-qa.
Run real browser sessions at all viewports. Capture console errors and failed
network calls. Test the full registration journey with TEST DATA against a test
backend: same-as-leader switches on and off, duplicate email/phone/UTR errors,
double-click submit, offline submit, slow-network processing state, draft
restore. Test /tracker PIN (wrong PIN shows no data) and the 404 page.
independent-qa applies the "score below 7 blocks release" rule: give a score
out of 10 with reasons.

LANE 8: PERFORMANCE AND ANIMATION
Run: performance-optimizer (react-performance), gsap-performance,
testing-performance-benchmarker.
Check: LCP, CLS, INP, image sizes and dimensions (the hero 3D images on a phone
connection), bundle size and chunking, animations using only transform and
opacity, backdrop blur flicker on iOS Safari, jank on low-end Android,
prefers-reduced-motion respected, hover effects only under (hover: hover).

LANE 9: LAUNCH READINESS, PRIVACY AND DISCOVERABILITY
Run: testing-reality-checker, production-audit, data-privacy-officer and
security-compliance-auditor, seo-specialist.
Check: "npm run build" (paste the exit code), missing production env vars,
unhandled root crashes, placeholder values still in the code or visible on the
page (placeholder UPI ID, test WhatsApp link, tracker PIN, TODO tags, test
emails), consent flow (required checkbox, optional checkbox NOT pre-ticked,
timestamp stored), what personal data is collected and who can see it,
OpenGraph and viewport tags, page titles, canonical links. Do NOT suggest
making placeholder payment details look official; flag them as launch blockers.

LANE 10: PLAIN LANGUAGE (students must understand it on first read)
Run: plain-language-editor (or act as one if missing).
Audience: Indian engineering and diploma students, English as a second
language, reading on a phone, scanning quickly. Read EVERY visible string on
EVERY page: headings, buttons, labels, placeholders, errors, toasts, FAQ,
rules, AI policy, prizes, timeline, contacts, footer, 404, tiny tags. Do not
sample; if you could not cover a page, say so. For each problem give:
 JARGON (KEEP / EXPLAIN with a short hint / REPLACE)   HARD TO PRONOUNCE OR
 SPELL   SENTENCES OVER 20 WORDS   VAGUE OR JOKE COPY HIDING THE ACTION
 ALL-CAPS PARAGRAPHS AND FAINT SMALL TEXT   INCONSISTENT NAMES (team/squad,
 fee/payment, register/sign up)   MISSING "WHAT HAPPENS NEXT" LINES
Rewrite rules: short everyday English, active voice, one idea per sentence, no
idioms, no em-dashes, keep the fun tone but never let it hide the meaning,
explain a needed technical term once near its first use.

======================================================================
3. SECOND-OPINION RULE (the "Santa" step)
======================================================================
For Lanes 1, 2, 4, 5 and 9, the Twin agent must review the Lead's findings and
either confirm each BLOCKER/HIGH item or dispute it with evidence. Mark each
item CONFIRMED BY BOTH or SINGLE-AUDITOR. Only items confirmed by both can be
final BLOCKERs; single-auditor items are listed as "needs human check".

======================================================================
4. REPORT: docs/audits/FINAL_FULL_AUDIT.md
======================================================================
1. Verdict and counts: GO / CONDITIONAL GO / NO-GO, counts by severity per lane,
   the independent-qa score out of 10, and the top 10 fixes in priority order.
2. Lane-by-lane sections in order 1 to 10, each starting with: agents run,
   agents missing, and what was NOT TESTED.
3. One master issue table. Columns: ID | Severity | Lane | Page | Component or
   text | Viewport | Evidence type (BROWSER / SCRIPT / INFERRED) | Confirmed by
   (BOTH / SINGLE) | Steps to reproduce | What happens | What should happen |
   Fix described (file path and line, NOT applied).
   Severity: BLOCKER = user stuck, cannot register, money or personal data at
   risk. HIGH = confusing or broken for many users. MEDIUM = awkward.
   LOW = polish. Merge duplicate findings from different lanes into one row
   and list all lanes that found it.
4. RECONCILIATION: every FAIL in the Lane 2 exit matrix MUST have a matching
   issue row. Show the check: "FAILs in matrix: N; issue rows: N".
5. Lane 10 plain-language table: Current text | Where | Problem | Suggested
   wording. Cover all pages.
6. What passed, with the evidence type for each.
7. What could not be tested and why.
8. A paste-ready FIX LIST for the building agent: BLOCKER and HIGH first,
   grouped by file, one line per fix, no vague items.
9. Placeholders and secrets still to resolve (names only, values redacted).
10. Git attestation: the two "git status" outputs.

FINISH: do not apply any fix. Stop after writing the report and give me a
five-line summary.


and these are the skills and agents 

   Master A-to-Z Web Auditing Roster & Parallel Multi-Agent Dispatch Matrix
  │ Dedicated File Created: MASTER_AUDIT_AGENTS_CATALOG.md
  │ Interactive UI Artifact: master_web_audit_catalog.md
  │ Total Ecosystem Scanned: 329 Agency Agents, 69 ECC Agents, 278 ECC Skills, 94 ECC Commands, plus website_company,
  │ superpowers, emilkowalski-skills, gsap-skills, and taste-skill.
  ──────
  ## 1. Total Plugin Inventory On Your Machine

  A full system scan of your installed plugins revealed the following inventory:

    ┌────────────────────────────────────────────────────────────────────────────────────────┐
    │                          INSTALLED PLUGIN AUDIT INVENTORY                              │
    ├─────────────────────┬────────────────────────────────┬─────────────────────────────────┤
    │ Plugin Name         │ Total Assets Discovered        │ Primary Auditing Superpower     │
    ├─────────────────────┼────────────────────────────────┼─────────────────────────────────┤
    │ agency-agents       │ 329 Specialized Personas       │ Anti-slop finish gate, AppSec,  │
    │                     │ (across 25 domains)            │ reality checking, accessibility │
    │ ECC                 │ 69 Agents, 278 Skills,         │ Silent failure hunter, React    │
    │                     │ 94 Slash Commands              │ reviewer, security scan, Santa  │
    │ website_company     │ 12 Skills & Operating Kernel   │ Independent QA, Score < 7 rule, │
    │                     │                                │ Blue/Red team security audit    │
    │ superpowers         │ 16 Execution Skills            │ Systematic debugging, code review│
    │ emilkowalski-skills │ 12 Polish Skills               │ Tactile micro-interactions      │
    │ gsap-skills         │ 8 Performance Skills           │ 60fps GPU compositor, anti-jank │
    │ taste-skill         │ 13 Aesthetic Skills            │ Anti-slop, full output guarantee│
    └─────────────────────┴────────────────────────────────┴─────────────────────────────────┘
  ──────
  ## 2. The 9 Audit Lanes: Complete A-to-Z Web Auditing Roster
  Instead of picking "vaguely one or two agents," here is the definitive breakdown of 34+ specialized agents, skills,
  and slash commands, categorized by the 9 critical audit lanes.
  ──────
  ### LANE 1: Visual Design, Taste Skill & Anti-Slop Finish Gate
  Goal: Ensure the site matches the exact design contract, eradicates generic AI-slop, and guarantees aesthetic
  distinction.

   Agent / Skill / Command        | Source & Location                 | What It Audits & Catches (Coder Blind Spots)
  --------------------------------|-----------------------------------|----------------------------------------------
   design-ui-finish-gate-reviewer | agency-agentsdesign/design-ui-    | The Pre-Ship Anti-Slop Gate: Catches generic
                                  | finish-gate-reviewer.md           | AI templates, cards without visual scale,
                                  |                                   | and unstyled empty states. Enforces Zero em-
                                  |                                   | dashes (—) in UI copy, exact 2-3px solid
                                  |                                   | #111116 borders, and 4-6px hard unblurred
                                  |                                   | offset shadows.
   design-director                | website_companyskills/design-     | Taste Skill Tri-Dial Calibration: Calibrates
                                  | director/SKILL.md                 | DESIGN_VARIANCE, MOTION_INTENSITY, and
                                  |                                   | VISUAL_DENSITY. Catches the "3 equal cards"
                                  |                                   | anti-pattern and hero overflow on 1080p
                                  |                                   | laptop displays.
   emil-design-eng                | emilkowalski-skillsskills/emil-   | Micro-Interaction Physics: Catches stiff
                                  | design-eng/SKILL.md               | linear CSS animations, missing button press
                                  |                                   | physics (translate(2px, 2px) on click), and
                                  |                                   | hover states that cause layout jitter.
   design-brand-guardian          | agency-agentsdesign/design-brand- | Thematic DNA Integrity: Catches theme
                                  | guardian.md                       | dilution (e.g., generic software hackathon
                                  |                                   | laptops/code instead of authentic
                                  |                                   | semiconductor VLSI die/wafer motifs).
  ──────
  ### LANE 2: UX Architecture, Form Funnel & Interaction Friction

  Goal: Eradicate user friction, streamline forms, prevent registration drop-offs, and safeguard user inputs.

   Agent / Skill / Command    | Source & Location                     | What It Audits & Catches (Coder Blind Spots)
  ----------------------------|---------------------------------------|----------------------------------------------
   design-ux-architect        | agency-agentsdesign/design-ux-        | Form Ergonomics & Cognitive Load: Catches
                              | architect.md                          | exhausting repetitive inputs (e.g. forcing a
                              |                                       | leader to retype the college 4 times instead
                              |                                       | of using dual "Same as leader" switches).
                              |                                       | Catches iOS Safari auto-zoom triggered by
                              |                                       | input text < 16px.
   design-persona-walkthrough | agency-agentsdesign/design-persona-   | User Journey Simulation: Walks through the
                              | walkthrough.md                        | flow as different personas (stressed student
                              |                                       | leader, working professional, rural mobile
                              |                                       | applicant). Catches cryptic error messages
                              |                                       | and hidden CTAs.
   click-path-audit           | ECCskills/click-path-audit/SKILL.md   | Navigational Dead Ends: Catches dead-end
                              |                                       | pages lacking back buttons, broken anchor
                              |                                       | links, and external links missing
                              |                                       | rel="noopener noreferrer".
  ──────
  ### LANE 3: Accessibility (A11y), Inclusivity & WCAG 2.2 AA Enforcement

  Goal: Guarantee the web application is fully operable by keyboard, screen reader, and users with motor/visual
  impairments.

   Agent / Skill / Command         | Source & Location                | What It Audits & Catches (Coder Blind Spots)
  ---------------------------------|----------------------------------|----------------------------------------------
   testing-accessibility-auditor   | agency-agentstesting/testing-    | Deep Screen Reader Audit: Notes that
                                   | accessibility-auditor.md         | automated tools catch only 30% of a11y
                                   |                                  | issues. Catches broken keyboard tab orders,
                                   |                                  | missing aria-live on error toasts, and
                                   |                                  | decorative images with bad alt text.
   a11y-architect                  | ECCagents/a11y-architect.md      | Semantic HTML & Landmark Roles: Catches
                                   |                                  | div/span tags masquerading as buttons
                                   |                                  | without role="button", tabIndex={0}, or
                                   |                                  | Enter/Space key listeners. Catches missing
                                   |                                  | form label htmlFor pairings.
   frontend-a11y                   | ECCskills/frontend-a11y/SKILL.md | Interactive Component A11y: Catches modals
                                   |                                  | that fail to trap focus (allowing tabbing
                                   |                                  | into background content) and mobile drawers
                                   |                                  | lacking aria-expanded attributes.
   engineering-section-508-        | agency-                          | Legal Contrast Standards: Enforces 4.5:1
   specialist                      | agentsengineering/engineering-   | text-to-background contrast ratios and flags
                                   | section-508-specialist.md        | color-only error indicators.
  ──────
  ### LANE 4: Security, Secrets Isolation, OWASP & AI-Code Hardening
  Goal: Find and eliminate every vulnerability, secret leak, injection vector, and AI-generated security shortcut.

   Agent / Skill / Command            | Source & Location                    | What It Audits & Catches (Coder Blin…
  ------------------------------------|--------------------------------------|---------------------------------------
   security-ai-generated-code-auditor  | agency-agentssecurity/security-ai-   | AI Coding Assistant Traps: Hunts
                                       | generated-code-auditor.md            | shortcuts common in AI-generated
                                   |                                  | inline, secrets hidden behind public client
                                   |                                  | env prefixes (VITE_, NEXT_PUBLIC_), and
                                   |                                  | Supabase service_role keys imported into
                                   |                                  | client bundles.
   security-penetration-tester     | agency-agentssecurity/security-  | Red Team Adversarial Probes: Tests
                                   | penetration-tester.md            | Stored/Reflected XSS injection sinks,
                                   |                                  | parameter tampering (e.g. modifying the fee
                                   |                                  | amount in browser memory), and client-side
                                   |                                  | auth bypasses.
   security-audit                  | website_companyskills/security-  | Dual Blue/Red Team Verification: Probes
                                   | audit/SKILL.md                   | database with anon public keys to confirm 0
                                   |                                  | unauthenticated rows leak; tests storage
                                   |                                  | bucket permissions to ensure receipts cannot
                                   |                                  | be listed by public crawlers.
   security-reviewer & /security-  | ECCagents/security-reviewer.md   | Static Code & Dependency Scanner: Audits
   scan                            |                                  | third-party npm packages for known CVEs and
                                   |                                  | identifies ReDoS (regex denial-of-service)
                                   |                                  | vulnerabilities.
   security-secrets-credential-    | agency-agentssecurity/security-  | Git History & Bundle Leak Audit: Scans
   engineer                        | secrets-credential-engineer.md   | commit history, scratch scripts, and
                                   |                                  | documentation for leaked private
                                   |                                  | credentials.
  ──────
  ### LANE 5: Database, Row-Level Security (RLS) & Concurrency Lock Integrity

  Goal: Ensure the database survives high concurrency, enforces strict RLS, and maintains ACID transaction safety.
   Agent / Skill / Command         | Source & Location                | What It Audits & Catches (Coder Blind Spots)
  ---------------------------------|----------------------------------|----------------------------------------------
   engineering-database-           | agency-                          | Concurrency Race Conditions: Catches the
   reliability-engineer            | agentsengineering/engineering-   | capacity race condition bug (when 2 teams
                                   | database-reliability-engineer.md | submit simultaneously for slot #35).
                                   |                                  | Enforces pg_advisory_xact_lock to serialize
                                   |                                  | atomic transactions without table lockouts.
   database-reviewer               | ECCagents/database-reviewer.md   | SQL & Index Integrity: Catches invalid
                                   |                                  | Postgres syntax (such as attempting SELECT
                                   |                                  | count(*) ... FOR UPDATE), missing foreign
                                   |                                  | key indexes, and unindexed text searches.
   postgres-patterns & database-   | ECCskills/postgres-              | PostgreSQL Hardening: Catches missing SET
   migrations                      | patterns/SKILL.md                | search_path = public on SECURITY DEFINER
                                   |                                  | functions (preventing search path injection)
                                   |                                  | and manages orphaned file cleanup on
                                   |                                  | transaction rollbacks.
  ──────
  ### LANE 6: Frontend Architecture, React 19 State & Code Health

  Goal: Catch memory leaks, re-render cascades, unhandled exceptions, and dead code before it affects browser
  stability.

   Agent / Skill / Command         | Source & Location                | What It Audits & Catches (Coder Blind Spots)
  ---------------------------------|----------------------------------|----------------------------------------------
   silent-failure-hunter           | ECCagents/silent-failure-        | Swallowed Errors & Bad Fallbacks: Catches
                                   | hunter.md                        | empty catch blocks (catch (e) {}), dangerous
                                   |                                  | fallbacks (.catch(() => [])), lost stack
                                   |                                  | traces, and promises missing error
                                   |                                  | propagation.
   react-reviewer & /react-review  | ECCagents/react-reviewer.md      | React 19 & Hook Hygiene: Catches useEffect
                                   |                                  | stale closures, in-place state mutations
                                   |                                  | (state.push()), missing list key props, and
                                   |                                  | infinite re-render loops.
   codehealth-mcp                  | ECCskills/codehealth-            | Structural Code Complexity: Flags 500+ line
                                   | mcp/SKILL.md                     | God Components and nested conditional
                                   |                                  | spaghetti (>4 levels of if/else).
   engineering-code-reviewer &     | agency-agents & ECCengineering-  | Static Typing & Dead Code: Catches any types
   /code-review                    | code-reviewer.md                 | in TypeScript, untyped React props, dead
                                   |                                  | imports, and hardcoded constants that belong
                                   |                                  | in config files.
  ──────
  ### LANE 7: Browser QA, E2E Testing & Visual Regression
  Goal: Automate live browser testing to verify layouts, forms, buttons, and responsive breakpoints under real
  conditions.

   Agent / Skill / Command         | Source & Location                | What It Audits & Catches (Coder Blind Spots)
  ---------------------------------|----------------------------------|----------------------------------------------
   browser-qa                      | ECCskills/browser-qa/SKILL.md    | Live Headless Browser QA: Catches uncaught
                                   |                                  | console errors, 4xx/5xx network drops, and
                                   |                                  | captures multi-viewport comparisons (375px,
                                   |                                  | 768px, 1440px).
   testing-test-automation-        | agency-agents & ECCtesting-test- | E2E Playwright Journeys: Catches form
   engineer & e2e-runner           | automation-engineer.md           | double-click submission races and file
                                   |                                  | upload MIME/size errors.
   independent-qa                  | website_companyskills/independen | Hard Gate Verification: Enforces the Score <
                                   | t-qa/SKILL.md                    | 7 Rework Rule (scores < 7.0/10 block release
                                   |                                  | and generate defect tickets). Tests edge-
                                   |                                  | case data entries (long names, emojis).
  ──────
  ### LANE 8: Performance, Core Web Vitals & Animation Physics
  Goal: Lock 60fps frame rates, minimize bundle sizes, eliminate layout thrashing, and pass Google Core Web Vitals.
   Agent / Skill / Command         | Source & Location                | What It Audits & Catches (Coder Blind Spots)
  ---------------------------------|----------------------------------|----------------------------------------------
   performance-optimizer & react-  | ECCagents/performance-           | Core Web Vitals: Audits LCP (< 2.5s), CLS (<
   performance                     | optimizer.md                     | 0.1), INP (< 200ms), image dimension
                                   |                                  | declarations, and vendor chunking.
   gsap-performance                | gsap-skillsskills/gsap-          | Animation Jank Prevention: Enforces GPU
                                   | performance/SKILL.md             | compositor-only transforms (transform,
                                   |                                  | opacity), bans layout-thrashing properties
                                   |                                  | (top, width, height), and prevents WebKit
                                   |                                  | blur flicker.
   testing-performance-benchmarker | agency-agentstesting/testing-    | Latency & Memory Leaks: Benchmarks p95/p99
                                   | performance-benchmarker.md       | RPC response times and detects detached DOM
                                   |                                  | nodes remaining in memory after route
                                   |                                  | transitions.
  ──────
  ### LANE 9: Production Readiness, Reality Checking & Launch Verification

  Goal: Provide skeptical, evidence-backed verification that rejects false approvals and guarantees legal and
  operational compliance.

   Agent / Skill / Command         | Source & Location                | What It Audits & Catches (Coder Blind Spots)
  ---------------------------------|----------------------------------|----------------------------------------------
   testing-reality-checker         | agency-agentstesting/testing-    | Antidote to AI Sycophancy: Rejects
                                   | reality-checker.md               | unverified "98/100" fantasy approvals.
                                   |                                  | Defaults to "NEEDS WORK" until physical
                                   |                                  | proof (npm run build exit code 0) is
                                   |                                  | verified.
   production-audit                | ECCskills/production-            | Pre-Launch Failure Check: Answers "What
                                   | audit/SKILL.md                   | breaks in production?" Catches missing
                                   |                                  | production environment variables, unhandled
                                   |                                  | React root crashes, and missing rollback
                                   |                                  | scripts.
   santa-method & /santa-loop      | ECCskills/santa-method/SKILL.md  | Adversarial Convergence Loop: Dispatches two
                                   |                                  | independent auditors that must BOTH pass
                                   |                                  | without defect before code ships.
   data-privacy-officer &          | agency-agentsspecialized/data-   | DPDP Act 2023 & GDPR Compliance: Verifies
   security-compliance-auditor     | privacy-officer.md               | mandatory vs. optional consent checkboxes,
                                   |                                  | un-checked opt-ins, and consent timestamps.
   seo-specialist & seo            | ECCagents/seo-specialist.md      | Social & Search Discoverability: Catches
                                   |                                  | broken OpenGraph cards (preventing gray
                                   |                                  | boxes on WhatsApp/Twitter), missing viewport
                                   |                                  | tags, and broken canonical links.
  ──────
  ## 3. The Parallel Multi-Agent Dispatch Matrix

  To audit at maximum speed with zero single-agent blind spots, execute the agents in parallel adversarial pairs:

    ┌────────────────────────────────────────────────────────────────────────────────────────┐
    │                        PARALLEL ADVERSARIAL DISPATCH SQUADS                            │
    ├───────────────┬──────────────────────────────────────────┬─────────────────────────────┤
    │ Audit Lane    │ Primary Lead Auditor                     │ Parallel Adversarial Twin   │
    ├───────────────┼──────────────────────────────────────────┼─────────────────────────────┤
    │ Lane 1: UI    │ design-ui-finish-gate-reviewer           │ design-director (Taste)     │
    │ Lane 2: UX    │ design-ux-architect                      │ design-persona-walkthrough  │
    │ Lane 3: A11y  │ testing-accessibility-auditor            │ a11y-architect (ECC)        │
    │ Lane 4: Sec   │ security-ai-generated-code-auditor       │ security-penetration-tester │
    │ Lane 5: DB    │ engineering-database-reliability-engineer│ database-reviewer (ECC)     │
    │ Lane 6: Code  │ silent-failure-hunter (ECC)              │ react-reviewer (ECC)        │
    │ Lane 7: QA    │ browser-qa (Playwright/Chrome)           │ independent-qa (QA Lead)    │
    │ Lane 8: Perf  │ performance-optimizer (Core Web Vitals)  │ gsap-performance            │
    │ Lane 9: Launch│ testing-reality-checker                  │ production-audit (ECC)      │
    └───────────────┴──────────────────────────────────────────┴─────────────────────────────┘
  ──────
  ## 4. The Master Web Audit Prompt Template

  You can copy and execute this master prompt directly whenever you want to trigger the full audit:

    MASTER A-TO-Z MULTI-AGENT WEB AUDIT DISPATCH

    Execute a comprehensive, adversarial A-to-Z web audit across the repository.
    Operate across the 9 Audit Lanes using parallel agent squads:

    1. LANE 1 (Design & Taste): Dispatch `design-ui-finish-gate-reviewer` and `design-director`.
       - Verify neo-brutalist pop-collage fidelity: 2-3px solid #111116 borders, 4-6px hard offset shadows.
       - Enforce: Zero em-dashes (-) in UI copy, zero generic purple mesh glows, zero 3-equal cards.

    2. LANE 2 (UX & Funnel): Dispatch `design-ux-architect` and `design-persona-walkthrough`.
       - Audit the single-submitter registration flow: verify "Same as leader" switches reduce typing.
       - Verify inputs have 48px touch targets and 16px font to prevent mobile auto-zoom.

    3. LANE 3 (Accessibility): Dispatch `testing-accessibility-auditor` and `a11y-architect`.
       - Audit WCAG 2.2 Level AA compliance: screen reader compatibility, ARIA live regions, focus trapping.
       - Verify color contrast >= 4.5:1 across all cards and tags.

    4. LANE 4 (Security): Dispatch `security-ai-generated-code-auditor` and `security-penetration-tester`.
       - Hunt for exposed client secrets in bundles, unauthenticated API mutations, and XSS injection sinks.
       - Verify storage bucket permissions and PII leakage.

    5. LANE 5 (Database & Concurrency): Dispatch `engineering-database-reliability-engineer` and `database-reviewer`.
       - Verify PostgreSQL transaction locking: confirm pg_advisory_xact_lock prevents race conditions on 35-team cap.
       - Audit RLS policies: confirm unauthenticated users cannot read participant personal data.

    6. LANE 6 (Frontend & Code Health): Dispatch `silent-failure-hunter` and `react-reviewer`.
       - Hunt empty catch blocks, swallowed errors, and dangerous fallbacks (.catch(() => [])).
       - Audit React 19 hook dependency arrays, re-render cascades, and key props.

    7. LANE 7 (Browser QA): Dispatch `browser-qa` and `independent-qa`.
       - Inspect console errors and network 4xx/5xx failures.
       - Verify responsive viewport stability across Mobile (375px) and PC (1440px).

    8. LANE 8 (Performance): Dispatch `performance-optimizer` and `gsap-performance`.
       - Verify compositor-only animations (transform and opacity); ensure zero WebKit blur flickering.
       - Verify Core Web Vitals thresholds (LCP < 2.5s, CLS < 0.1, INP < 200ms).

    9. LANE 9 (Reality Check & Launch Gate): Dispatch `testing-reality-checker` and `production-audit`.
       - Default to "NEEDS WORK"; require physical proof (npm run build exit code 0).
       - Verify DPDP Act double-consent flags and OpenGraph social metadata.

    Return findings grouped by Lane with: Location, Severity (Critical/High/Medium), Concrete Exploit/Bug, and Exact
  1-Commit Fix.

  The catalog file MASTER_AUDIT_AGENTS_CATALOG.md is now permanently stored in your repo. You can run this master
  prompt whenever you want to perform a full-scale audit!