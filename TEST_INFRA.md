# E2E Test Infra: VELTRAXX 2.0 Technical SEO & Pre-rendering

## Test Philosophy
- Opaque-box, requirement-driven. Derives from `ORIGINAL_REQUEST.md` and user-facing SEO acceptance criteria.
- Complete coverage across all 5 target routes: `/`, `/about`, `/register`, `/submit-ppt`, `/round2-confirm`.
- 4-Tier verification: Category-Partition (Tier 1), Boundary & Corner Cases (Tier 2), Cross-Feature Interactions (Tier 3), and Real-World Crawler Workload Testing (Tier 4).

## Feature Inventory
| # | Feature | Source (Requirement) | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|---|---------|----------------------|:------:|:------:|:------:|:------:|
| 1 | Page-Specific Title Tags | ORIGINAL_REQUEST §R3, Acceptance | ✓ | ✓ | ✓ | ✓ |
| 2 | Meta Descriptions (<200 chars) | ORIGINAL_REQUEST §R3, Acceptance | ✓ | ✓ | ✓ | ✓ |
| 3 | Canonical Links (Absolute HTTPS) | ORIGINAL_REQUEST §R3, Acceptance | ✓ | ✓ | ✓ | ✓ |
| 4 | OpenGraph Tags (Title, Desc, URL, Image, Type) | ORIGINAL_REQUEST §R3, Acceptance | ✓ | ✓ | ✓ | ✓ |
| 5 | Twitter Card Tags (Summary Large Image) | ORIGINAL_REQUEST §R3, Acceptance | ✓ | ✓ | ✓ | ✓ |
| 6 | JSON-LD Schema (Event) | ORIGINAL_REQUEST §R3, Acceptance | ✓ | ✓ | ✓ | ✓ |
| 7 | JSON-LD Schema (Organization) | ORIGINAL_REQUEST §R3, Acceptance | ✓ | ✓ | ✓ | ✓ |
| 8 | JSON-LD Schema (FAQPage) | ORIGINAL_REQUEST §R3, Acceptance | ✓ | ✓ | ✓ | ✓ |
| 9 | JSON-LD Schema (BreadcrumbList) | ORIGINAL_REQUEST §R3, Acceptance | ✓ | ✓ | ✓ | ✓ |
| 10 | JSON-LD Schema (WebSite) | ORIGINAL_REQUEST §R3, Acceptance | ✓ | ✓ | ✓ | ✓ |
| 11 | `robots.txt` Disallow & Sitemap Directives | ORIGINAL_REQUEST §R3, Acceptance | ✓ | ✓ | ✓ | ✓ |
| 12 | `sitemap.xml` Route Completeness & XML Syntax | ORIGINAL_REQUEST §R3, Acceptance | ✓ | ✓ | ✓ | ✓ |
| 13 | Pre-rendered HTML Static File Generation | ORIGINAL_REQUEST §R3, Acceptance | ✓ | ✓ | ✓ | ✓ |
| 14 | Semantic Heading Hierarchy Progression | ORIGINAL_REQUEST §R3, Acceptance | ✓ | ✓ | ✓ | ✓ |

## Test Architecture
- Test Runner: `scripts/verify-seo.js` (invoked via `node scripts/verify-seo.js` or `npm run test:seo`)
- Pass/Fail Semantics:
  - Exit code 0 on 100% pass across all assertions.
  - Non-zero exit code on any missing meta tag, broken canonical, invalid JSON-LD, invalid XML, or build error.
- Verified Artifacts:
  - `dist/index.html`
  - `dist/about/index.html`
  - `dist/register/index.html`
  - `dist/submit-ppt/index.html`
  - `dist/round2-confirm/index.html`
  - `dist/robots.txt` (copied from `public/robots.txt`)
  - `dist/sitemap.xml` (copied from `public/sitemap.xml`)

## Coverage Thresholds
- Tier 1: Feature Coverage (existence and correct structure of all 14 features across 5 routes = 70+ checks)
- Tier 2: Boundary & Corner Cases (absolute URLs vs relative, character limits, HTTPS enforcement, non-empty attributes)
- Tier 3: Cross-Feature Interactions (BreadcrumbList matches canonical hierarchy, OG matches Schema, sitemap routes match pre-rendered outputs)
- Tier 4: Real-World Crawler Workload Testing (Googlebot/WhatsApp crawler simulation inspecting raw pre-rendered HTML without JavaScript execution)
