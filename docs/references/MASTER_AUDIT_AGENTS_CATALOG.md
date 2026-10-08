# MASTER A-TO-Z WEB AUDITING ROSTER & MULTI-AGENT DISPATCH MATRIX
**Document Identifier:** `docs/references/MASTER_AUDIT_AGENTS_CATALOG.md`  
**Purpose:** Exhaustive encyclopedia of all auditing agents, skills, and slash commands across installed plugins (`agency-agents`, `ECC`, `website_company`, `superpowers`, `emilkowalski-skills`, `gsap-skills`, `taste-skill`).  
**Use Case:** The definitive weapon for adversarial multi-agent parallel web auditing.

---

## Architecture Overview: The 9 Audit Lanes

To achieve complete **A-to-Z auditing** that leaves zero blind spots, auditing is structured across **9 Specialized Audit Lanes**. Multiple agents and skills within each lane are designed to be run in **parallel pairs or trios** to provide adversarial cross-validation (preventing single-agent sycophancy or hallucinated passes):

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        THE 9 AUDIT LANES (A-TO-Z COVERAGE)                             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ LANE 1: Visual Design, Taste Skill & Anti-Slop Finish Gate                            │
│ LANE 2: UX Architecture, Form Funnel & Interaction Friction                           │
│ LANE 3: Accessibility (A11y), Inclusivity & WCAG 2.2 AA Enforcement                   │
│ LANE 4: Security, Secrets Isolation, OWASP & AI-Code Hardening                        │
│ LANE 5: Database, Row-Level Security (RLS) & Concurrency Lock Integrity                │
│ LANE 6: Frontend Architecture, React 19 State & Code Health                            │
│ LANE 7: Browser QA, E2E Testing & Visual Regression                                   │
│ LANE 8: Performance, Core Web Vitals & Animation Physics                              │
│ LANE 9: Production Readiness, Reality Checking & Launch Verification                  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

# Detailed Audit Directory by Lane

---

## LANE 1: Visual Design, Taste Skill & Anti-Slop Finish Gate
*Goal: Ensure the site matches the exact design contract, eradicates generic AI-slop, and guarantees aesthetic distinction.*

### 1. `design-ui-finish-gate-reviewer`
- **Plugin:** `agency-agents`
- **Location:** `design-research/13-agency-agents/design/design-ui-finish-gate-reviewer.md`
- **What it is used for:** The final, demanding interface gate before shipping. Identifies interchangeable components, generic dashboards, and AI-generated defaults.
- **What Coders Forget & What it Catches:**
  - Coders forget that generic AI gradients, unstyled empty states, and standard card grids make a site look like generic template slop.
  - Catches broken design tokens, card grids without hierarchical scale, inconsistent border radiuses, and missing visual anchors.
  - Enforces: **Zero em-dashes (`—`) in UI copy**, exact 2-3px solid `#111116` borders, and 4-6px hard unblurred offset shadows.

### 2. `design-director`
- **Plugin:** `website_company`
- **Location:** `C:\Users\radar\.gemini\config\plugins\website_company\skills\design-director\SKILL.md`
- **What it is used for:** Taste Skill dial calibration (`DESIGN_VARIANCE`, `MOTION_INTENSITY`, `VISUAL_DENSITY`), bento grid asymmetry, and Apple Design token audit.
- **What Coders Forget & What it Catches:**
  - Catches the "3 equal cards" anti-pattern (three identical horizontal boxes that scream template).
  - Catches viewport overflows where hero CTAs are pushed below the fold on 1080p laptop screens.
  - Catches purple/violet gradient blobs and generic mesh heroes.

### 3. `emil-design-eng`
- **Plugin:** `emilkowalski-skills`
- **Location:** `C:\Users\radar\.gemini\config\plugins\emilkowalski-skills\skills\emil-design-eng\SKILL.md`
- **What it is used for:** Micro-interaction polish, component design subtlety, and tactile feedback.
- **What Coders Forget & What it Catches:**
  - Catches harsh, linear CSS animations that feel cheap and robotic.
  - Catches missing active button states (buttons that don't press down on click).
  - Catches layout shifts caused by hover states modifying borders or sizes without offsets.

### 4. `design-brand-guardian`
- **Plugin:** `agency-agents`
- **Location:** `design-research/13-agency-agents/design/design-brand-guardian.md`
- **What it is used for:** Brand identity consistency, thematic asset coherence, and visual DNA fidelity.
- **What Coders Forget & What it Catches:**
  - Coders forget to maintain hardware/VLSI thematic motifs and accidentally slip into generic software hackathon icons (laptops, neon code).
  - Catches mismatched accent colors (e.g., using random blues instead of `#0055FF` or generic yellows instead of `#FFE500`).

---

## LANE 2: UX Architecture, Form Funnel & Interaction Friction
*Goal: Eradicate user friction, streamline forms, prevent cart/registration drop-offs, and safeguard user inputs.*

### 5. `design-ux-architect`
- **Plugin:** `agency-agents`
- **Location:** `design-research/13-agency-agents/design/design-ux-architect.md`
- **What it is used for:** Technical UX architecture, form information hierarchy, and multi-step cognitive load audit.
- **What Coders Forget & What it Catches:**
  - Catches exhausting repetitive inputs (e.g., forcing a team leader to retype the college name 4 separate times instead of offering a "Same as Leader" toggle).
  - Catches missing mobile keyboard optimizations (`type="tel"`, `type="email"`, `inputMode="numeric"`).
  - Catches iOS auto-zoom bugs caused by input text sizes smaller than 16px.

### 6. `design-persona-walkthrough`
- **Plugin:** `agency-agents`
- **Location:** `design-research/13-agency-agents/design/design-persona-walkthrough.md`
- **What it is used for:** Simulates realistic user personas (stressed student leader, working professional, rural applicant on 4G) walking through the user journey.
- **What Coders Forget & What it Catches:**
  - Catches confusing error messages that don't tell the user how to fix the problem (e.g., "Invalid input" vs. "Please enter a 10-digit Indian phone number").
  - Catches hidden CTAs that users miss during rapid scanning.

### 7. `click-path-audit`
- **Plugin:** `ECC` (Skill)
- **Location:** `C:\Users\radar\.gemini\config\plugins\ECC\skills\click-path-audit\SKILL.md`
- **What it is used for:** End-to-end navigational path audit, dead ends, and conversion leakage points.
- **What Coders Forget & What it Catches:**
  - Catches dead-end pages that have no back navigation or home button.
  - Catches links that navigate to external sites without `target="_blank"` or `rel="noopener noreferrer"`.
  - Catches circular redirects and missing anchor hash targets.

---

## LANE 3: Accessibility (A11y), Inclusivity & WCAG 2.2 AA Enforcement
*Goal: Guarantee the web application is fully operable by keyboard, screen reader, and users with motor/visual impairments.*

### 8. `testing-accessibility-auditor`
- **Plugin:** `agency-agents`
- **Location:** `design-research/13-agency-agents/testing/testing-accessibility-auditor.md`
- **What it is used for:** Deep WCAG 2.2 Level AA audit with screen reader testing mindset.
- **What Coders Forget & What it Catches:**
  - Coders trust automated Lighthouse checks (which only catch ~30% of accessibility issues).
  - Catches missing `aria-live` announcements on dynamic form submission errors and toast notifications.
  - Catches tab order traps where tabbing jumps erratically across the DOM instead of following visual reading order.
  - Catches decorative images incorrectly given alt text, and informative images missing descriptive alt tags.

### 9. `a11y-architect`
- **Plugin:** `ECC` (Agent)
- **Location:** `C:\Users\radar\.gemini\config\plugins\ECC\agents\a11y-architect.md`
- **What it is used for:** Semantic HTML structure, landmark roles (`main`, `nav`, `header`, `footer`), and ARIA trait design.
- **What Coders Forget & What it Catches:**
  - Catches `<div>` and `<span>` elements used as buttons without `role="button"`, `tabIndex={0}`, or Enter/Space key listeners.
  - Catches missing form label associations (`htmlFor` / `id` mismatches).
  - Catches missing skip-to-content links for keyboard power users.

### 10. `frontend-a11y`
- **Plugin:** `ECC` (Skill)
- **Location:** `C:\Users\radar\.gemini\config\plugins\ECC\skills\frontend-a11y\SKILL.md`
- **What it is used for:** Component-level React accessibility patterns (modals, dropdowns, switches, accordions).
- **What Coders Forget & What it Catches:**
  - Catches modals that fail to trap focus (allowing users to tab into background elements behind the modal).
  - Catches dropdowns that don't close on `Escape` key press.
  - Catches missing `aria-expanded` and `aria-controls` on mobile hamburger drawer toggles.

### 11. `engineering-section-508-specialist`
- **Plugin:** `agency-agents`
- **Location:** `design-research/13-agency-agents/engineering/engineering-section-508-specialist.md`
- **What it is used for:** Legal federal accessibility compliance (Section 508 / ADA Title III standards).
- **What Coders Forget & What it Catches:**
  - Catches low-contrast text on colored cards (e.g. gray text on light gray backgrounds failing the 4.5:1 ratio).
  - Catches color-only communication (e.g., indicating form errors only by turning a border red without an icon or text error message).

---

## LANE 4: Security, Secrets Isolation, OWASP & AI-Code Hardening
*Goal: Find and eliminate every vulnerability, secret leak, injection vector, and AI-generated security shortcut.*

### 12. `security-ai-generated-code-auditor`
- **Plugin:** `agency-agents`
- **Location:** `design-research/13-agency-agents/security/security-ai-generated-code-auditor.md`
- **What it is used for:** Hunts the specific security shortcuts and bad defaults that AI coding assistants (Copilot, Cursor, Claude Code, v0) generate by default.
- **What Coders Forget & What it Catches:**
  - Catches API keys and private keys pasted inline "just to make the example run".
  - Catches secrets hidden behind public client env prefixes (`VITE_`, `NEXT_PUBLIC_`) compiled into shipped browser bundles.
  - Catches Supabase `service_role` keys imported into client components.
  - Catches authorization logic that checks user-editable fields (e.g., `user.user_metadata.role === 'admin'`).

### 13. `security-penetration-tester`
- **Plugin:** `agency-agents`
- **Location:** `design-research/13-agency-agents/security/security-penetration-tester.md`
- **What it is used for:** Adversarial Red Team attacks: SQLi, XSS, CSRF, parameter tampering, and auth bypass.
- **What Coders Forget & What it Catches:**
  - Catches unescaped user inputs rendered into DOM elements (Stored XSS).
  - Catches tampering with hidden form inputs (e.g., changing payment fee from ₹1,000 to ₹1 in the browser).
  - Catches unprotected API endpoints that don't validate session tokens on the server.

### 14. `security-audit`
- **Plugin:** `website_company`
- **Location:** `C:\Users\radar\.gemini\config\plugins\website_company\skills\security-audit\SKILL.md`
- **What it is used for:** Dual Blue Team Defense & Red Team Adversarial probe execution for web applications.
- **What Coders Forget & What it Catches:**
  - Probes database with unauthenticated anonymous keys to prove zero rows leak.
  - Probes storage buckets to ensure private upload buckets (`receipts`) cannot be listed by public crawlers.
  - Verifies CORS headers and Content-Security-Policy (CSP) headers.

### 15. `security-reviewer` & `/security-scan`
- **Plugin:** `ECC` (Agent & Command)
- **Location:** `C:\Users\radar\.gemini\config\plugins\ECC\agents\security-reviewer.md` | `/security-scan`
- **What it is used for:** Comprehensive source code vulnerability scan, dependency audit, and sanitization review.
- **What Coders Forget & What it Catches:**
  - Catches vulnerable third-party npm packages with known CVEs.
  - Catches missing rate-limiting on sensitive public endpoints (e.g. registration spamming).
  - Catches insecure regexes vulnerable to ReDoS (Regular Expression Denial of Service).

### 16. `security-secrets-credential-engineer`
- **Plugin:** `agency-agents`
- **Location:** `design-research/13-agency-agents/security/security-secrets-credential-engineer.md`
- **What it is used for:** Static analysis scanning for hardcoded secrets, private tokens, and git commit history leaks.
- **What Coders Forget & What it Catches:**
  - Catches test API keys committed in markdown documentation or scratch scripts.
  - Catches `.env` files mistakenly tracked by git.

---

## LANE 5: Database, Row-Level Security (RLS) & Concurrency Lock Integrity
*Goal: Ensure the database survives high concurrency, enforces strict RLS, and maintains flawless ACID transactions.*

### 17. `database-reviewer`
- **Plugin:** `ECC` (Agent)
- **Location:** `C:\Users\radar\.gemini\config\plugins\ECC\agents\database-reviewer.md`
- **What it is used for:** PostgreSQL schema review, index efficiency, foreign key cascading, and query optimization.
- **What Coders Forget & What it Catches:**
  - Catches missing foreign key indexes (causing full table scans on joins and deletes).
  - Catches invalid PostgreSQL syntax (such as attempting `SELECT count(*) ... FOR UPDATE` which Postgres rejects).
  - Catches missing `NOT NULL` constraints and unindexed `lower(email)` lookups.

### 18. `engineering-database-reliability-engineer`
- **Plugin:** `agency-agents`
- **Location:** `design-research/13-agency-agents/engineering/engineering-database-reliability-engineer.md`
- **What it is used for:** High-concurrency transaction safety, race condition prevention, and lock contention audit.
- **What Coders Forget & What it Catches:**
  - Catches **the capacity race condition bug**: when 2 teams submit simultaneously for slot #35, both pass an un-locked check and both get registered (36 teams registered).
  - Enforces `PERFORM pg_advisory_xact_lock(...)` or row-level capacity locking to serialize atomic operations.
  - Catches deadlock risks from out-of-order table locking.

### 19. `postgres-patterns` & `database-migrations`
- **Plugin:** `ECC` (Skills)
- **Location:** `C:\Users\radar\.gemini\config\plugins\ECC\skills\postgres-patterns\SKILL.md`
- **What it is used for:** Supabase and Postgres best practices, atomic RPC contracts, and zero-downtime migrations.
- **What Coders Forget & What it Catches:**
  - Catches missing `SET search_path = public` on `SECURITY DEFINER` functions (which allows schema hijacking attacks).
  - Catches RLS policies that create infinite recursion loops (`teams` policy querying `participants` which queries `teams`).
  - Catches orphaned file uploads in storage buckets when database transactions rollback.

---

## LANE 6: Frontend Architecture, React 19 State & Code Health
*Goal: Catch memory leaks, re-render cascades, unhandled exceptions, and dead code before it affects browser stability.*

### 20. `silent-failure-hunter`
- **Plugin:** `ECC` (Agent)
- **Location:** `C:\Users\radar\.gemini\config\plugins\ECC\agents\silent-failure-hunter.md`
- **What it is used for:** Zero-tolerance hunt for swallowed errors, empty catch blocks, and missing error propagation.
- **What Coders Forget & What it Catches:**
  - Catches `catch (e) {}` empty catch blocks where errors fail silently with zero user feedback.
  - Catches `.catch(() => [])` dangerous fallbacks that hide network/database failures.
  - Catches promises missing `.catch()` or `await` inside async loops.
  - Catches lost stack traces and generic re-throws that make production debugging impossible.

### 21. `react-reviewer` & `/react-review`
- **Plugin:** `ECC` (Agent & Command)
- **Location:** `C:\Users\radar\.gemini\config\plugins\ECC\agents\react-reviewer.md` | `/react-review`
- **What it is used for:** React 19 architecture audit, hooks hygiene, re-render optimization, and component boundaries.
- **What Coders Forget & What it Catches:**
  - Catches missing dependency array variables in `useEffect` (stale closures).
  - Catches state mutations in place (`state.push()` instead of `[...state]`).
  - Catches missing `key` props or using array index as `key` in dynamic lists (causing DOM reordering bugs).
  - Catches infinite re-render loops caused by object/array instantiation inside effect dependencies.

### 22. `codehealth-mcp`
- **Plugin:** `ECC` (Skill)
- **Location:** `C:\Users\radar\.gemini\config\plugins\ECC\skills\codehealth-mcp\SKILL.md`
- **What it is used for:** Structural code health scoring, complexity hotspots, and architectural debt analysis.
- **What Coders Forget & What it Catches:**
  - Catches God Components (>500 lines doing everything: UI, fetching, validation, and storage).
  - Catches deeply nested conditionals (>4 levels of `if/else`).
  - Catches duplicated validation logic across frontend and backend.

### 23. `engineering-code-reviewer` & `/code-review`
- **Plugin:** `agency-agents` & `ECC`
- **Location:** `design-research/13-agency-agents/engineering/engineering-code-reviewer.md` | `/code-review`
- **What it is used for:** Comprehensive static analysis, typing verification, and code cleanliness audit.
- **What Coders Forget & What it Catches:**
  - Catches `any` types in TypeScript and untyped props in React.
  - Catches dead code, unused imports, and abandoned utility functions.
  - Catches magic numbers and hardcoded strings that should come from configuration files.

---

## LANE 7: Browser QA, E2E Testing & Visual Regression
*Goal: Automate live browser testing to verify layouts, forms, buttons, and responsive breakpoints under real conditions.*

### 24. `browser-qa`
- **Plugin:** `ECC` (Skill)
- **Location:** `C:\Users\radar\.gemini\config\plugins\ECC\skills\browser-qa\SKILL.md`
- **What it is used for:** Automated browser interaction, console error inspection, 4xx/5xx network tracking, and visual regression.
- **What Coders Forget & What it Catches:**
  - Catches console errors (`Uncaught TypeError: cannot read property of undefined`) that don't break the build but crash user flows.
  - Catches 404 broken image links and failing asset requests.
  - Tests critical user journeys with real inputs (filling form, clicking submit, testing error toasts).
  - Captures mobile vs. desktop viewport comparisons at 375px, 768px, and 1440px.

### 25. `testing-test-automation-engineer` & `e2e-runner`
- **Plugin:** `agency-agents` & `ECC` (Agent)
- **Location:** `design-research/13-agency-agents/testing/testing-test-automation-engineer.md` | `ECC/agents/e2e-runner.md`
- **What it is used for:** Playwright / Cypress end-to-end test suite execution and Page Object Model validation.
- **What Coders Forget & What it Catches:**
  - Catches form submission race conditions (double-clicking the submit button before it disables).
  - Catches file upload validation errors on oversized images (>2MB).
  - Catches flaky tests that pass locally but fail on CI environments.

### 26. `independent-qa`
- **Plugin:** `website_company`
- **Location:** `C:\Users\radar\.gemini\config\plugins\website_company\skills\independent-qa\SKILL.md`
- **What it is used for:** Adversarial quality auditing, functional flow verification, and Score < 7 Rework Rule enforcement.
- **What Coders Forget & What it Catches:**
  - Enforces the hard **Score < 7 Rework Gate**: if visual taste, security, or functionality scores below 7.0/10, blocks release and generates defect tickets.
  - Tests edge-case data entries (extremely long team names, special characters, unicode emojis).

---

## LANE 8: Performance, Core Web Vitals & Animation Physics
*Goal: Lock 60fps frame rates, minimize bundle sizes, eliminate layout thrashing, and pass Google Core Web Vitals.*

### 27. `performance-optimizer` & `react-performance`
- **Plugin:** `ECC` (Agent & Skill)
- **Location:** `C:\Users\radar\.gemini\config\plugins\ECC\agents\performance-optimizer.md` | `skills/react-performance/SKILL.md`
- **What it is used for:** Core Web Vitals audit (LCP < 2.5s, CLS < 0.1, INP < 200ms), bundle size analysis, and render trees.
- **What Coders Forget & What it Catches:**
  - Catches unoptimized heavy images (e.g., shipping 4MB raw JPEGs instead of compressed WebP/AVIF).
  - Catches Cumulative Layout Shift (CLS) caused by images or dynamic banners missing explicit `width` and `height` dimensions.
  - Catches un-chunked giant JS vendor bundles that delay Time to Interactive (TTI).

### 28. `gsap-performance`
- **Plugin:** `gsap-skills`
- **Location:** `C:\Users\radar\.gemini\config\plugins\gsap-skills\skills\gsap-performance\SKILL.md`
- **What it is used for:** GSAP and CSS animation performance, 60fps compositor enforcement, and jank prevention.
- **What Coders Forget & What it Catches:**
  - Catches animations animating layout properties (`top`, `left`, `width`, `height`, `margin`) causing continuous layout recalculation and CPU spikes.
  - Enforces GPU-accelerated compositor-only transforms (`transform: translate3d`, `opacity`).
  - Catches `will-change` over-use (which exhausts GPU VRAM).

### 29. `testing-performance-benchmarker`
- **Plugin:** `agency-agents`
- **Location:** `design-research/13-agency-agents/testing/testing-performance-benchmarker.md`
- **What it is used for:** High-load latency benchmarking, p95/p99 response time measurements, and client rendering speed.
- **What Coders Forget & What it Catches:**
  - Catches memory leaks where detached DOM nodes remain in memory after route transitions.
  - Catches slow database RPC query execution times under simulated concurrent traffic.

---

## LANE 9: Production Readiness, Reality Checking & Launch Verification
*Goal: Provide skeptical, evidence-backed verification that rejects false approvals and guarantees legal and operational compliance.*

### 30. `testing-reality-checker`
- **Plugin:** `agency-agents`
- **Location:** `design-research/13-agency-agents/testing/testing-reality-checker.md`
- **What it is used for:** Stops fantasy approvals. Requires overwhelming tangible proof before certifying production readiness. Defaults to **"NEEDS WORK"**.
- **What Coders Forget & What it Catches:**
  - Catches AI sycophancy: prior agents saying "98/100, ready to ship!" when basic features are untested.
  - Verifies that claimed features actually exist in the codebase and are not just promised in markdown specs.
  - Requires physical terminal proof (`npm run build` exit code 0, clean test logs) before allowing deployment.

### 31. `production-audit`
- **Plugin:** `ECC` (Skill)
- **Location:** `C:\Users\radar\.gemini\config\plugins\ECC\skills\production-audit\SKILL.md`
- **What it is used for:** Local-evidence production readiness audit: answers "What breaks in production?" before customers touch it.
- **What Coders Forget & What it Catches:**
  - Catches missing environment variable definitions in production deployment manifests.
  - Catches unhandled 500 error boundaries (where an API failure crashes the entire React root into a white blank screen).
  - Catches missing database rollback scripts.

### 32. `santa-method` & `/santa-loop`
- **Plugin:** `ECC` (Skill & Command)
- **Location:** `C:\Users\radar\.gemini\config\plugins\ECC\skills\santa-method\SKILL.md` | `/santa-loop`
- **What it is used for:** Multi-agent adversarial convergence loop. Dispatches two independent auditor agents that must BOTH pass without defect before output ships.
- **What Coders Forget & What it Catches:**
  - Eliminates single-auditor blind spots through independent double-blind verification.
  - Iterates in a convergence loop until both auditors sign off on the same commit.

### 33. `data-privacy-officer` & `security-compliance-auditor`
- **Plugin:** `agency-agents`
- **Location:** `design-research/13-agency-agents/specialized/data-privacy-officer.md`
- **What it is used for:** Legal data privacy compliance: India DPDP Act 2023, GDPR, and data minimization audit.
- **What Coders Forget & What it Catches:**
  - Catches missing consent checkboxes (storing user contact information without explicit opt-in).
  - Catches pre-ticked marketing checkboxes (which violates modern data protection regulations).
  - Catches missing consent timestamps and storage of unnecessary sensitive PII.

### 34. `seo-specialist` & `seo`
- **Plugin:** `ECC` (Agent & Skill)
- **Location:** `C:\Users\radar\.gemini\config\plugins\ECC\agents\seo-specialist.md` | `skills/seo/SKILL.md`
- **What it is used for:** Technical SEO, meta tags, OpenGraph previews, JSON-LD schema, and social discoverability.
- **What Coders Forget & What it Catches:**
  - Catches broken OpenGraph tags (when links shared on WhatsApp / Twitter show a blank gray box instead of the event banner).
  - Catches missing `<meta name="viewport">` tags and duplicate `<title>` tags.
  - Catches missing favicon assets and broken canonical URL tags.

---

# The Parallel Multi-Agent Dispatch Matrix

When executing an audit prompt, running agents sequentially is slow. Grouping complementary agents into **Parallel Audit Squads** yields maximum adversarial coverage in minimum time:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        PARALLEL MULTI-AGENT DISPATCH MATRIX                            │
├───────────────┬──────────────────────────────────────────┬─────────────────────────────┤
│ Audit Lane    │ Primary Agent / Skill                    │ Parallel Adversarial Twin   │
├───────────────┼──────────────────────────────────────────┼─────────────────────────────┤
│ Design & UI   │ design-ui-finish-gate-reviewer           │ design-director (Taste)     │
│ UX & Funnel   │ design-ux-architect                      │ design-persona-walkthrough  │
│ Accessibility │ testing-accessibility-auditor            │ a11y-architect (ECC)        │
│ Security      │ security-ai-generated-code-auditor       │ security-penetration-tester │
│ Database      │ engineering-database-reliability-engineer│ database-reviewer (ECC)     │
│ Code Quality  │ silent-failure-hunter (ECC)              │ react-reviewer (ECC)        │
│ Browser QA    │ browser-qa (Playwright/Chrome)           │ independent-qa (QA Lead)    │
│ Performance   │ performance-optimizer (Core Web Vitals)  │ gsap-performance            │
│ Launch Gate   │ testing-reality-checker                  │ production-audit (ECC)      │
└───────────────┴──────────────────────────────────────────┴─────────────────────────────┘
```

---

# The Master Web Audit Prompt Template

To run this complete swarm, copy and execute the following master prompt:

```markdown
MASTER A-TO-Z MULTI-AGENT WEB AUDIT DISPATCH

Execute a comprehensive, adversarial A-to-Z web audit across the repository.
Operate across the 9 Audit Lanes using parallel agent squads:

1. LANE 1 (Design & Taste): Dispatch `design-ui-finish-gate-reviewer` and `design-director`.
   - Verify neo-brutalist pop-collage fidelity: 2-3px solid #111116 borders, 4-6px hard offset shadows.
   - Enforce: Zero em-dashes (—) in UI copy, zero generic purple mesh glows, zero 3-equal cards.

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

Return findings grouped by Lane with: Location, Severity (Critical/High/Medium), Concrete Exploit/Bug, and Exact 1-Commit Fix.
```
