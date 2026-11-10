# Project: VELTRAXX 2.0 Technical SEO & Pre-rendering Architecture

## Architecture
The SEO architecture bridges React 19 SPA capabilities with static pre-rendering to deliver 100% crawlable, high-ranking pages for search engines and social bots while maintaining rich kinetic client-side interactivity.

```
                    ┌──────────────────────────────────────────────┐
                    │  src/data/seoData.js (Single Source of Truth)│
                    │  - Route metadata (title, desc, canonical)   │
                    │  - OpenGraph & Twitter Card attributes       │
                    │  - Valid Schema.org JSON-LD Knowledge Graph  │
                    └──────────────┬───────────────────────────────┘
                                   │
               ┌───────────────────┴───────────────────┐
               ▼                                       ▼
 ┌───────────────────────────┐           ┌─────────────────────────────┐
 │ Client: <SeoHead />       │           │ Post-Build: prerender.js    │
 │ - React 19 Document Head  │           │ - Reads dist/index.html     │
 │ - Dynamic title/meta sync │           │ - Generates route folders   │
 │ - Client route transitions│           │ - Injects head & schemas    │
 └───────────────────────────┘           └──────────────┬──────────────┘
                                                        │
                                                        ▼
                                         ┌─────────────────────────────┐
                                         │ dist/                       │
                                         │ ├── index.html (/)          │
                                         │ ├── about/index.html        │
                                         │ ├── register/index.html     │
                                         │ ├── submit-ppt/index.html   │
                                         │ └── round2-confirm/index.html
                                         └─────────────────────────────┘
```

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | SEO Audit & Strategic Plan | In-depth audit documentation & multi-page keyword strategy targeting key hackathon terms | M1 | ORIGINAL_REQUEST §R1, §R2 |
| 2 | Robots.txt Configuration | Web root `robots.txt` disallowing `/admin` & `/tracker`, pointing to `https://veltraxx.in/sitemap.xml` | M1 | ORIGINAL_REQUEST §R3 |
| 3 | XML Sitemap Generation | Web root `sitemap.xml` with 5 canonical routes, `<changefreq>`, and `<priority>` | M1 | ORIGINAL_REQUEST §R3 |
| 4 | JSON-LD Structured Data Suite | Schema.org valid Event, Organization, FAQPage, BreadcrumbList, and WebSite schemas in `src/data/seoData.js` | M1 | ORIGINAL_REQUEST §R3 |
| 5 | Semantic HTML & Main Landmark Fix | Resolve nested `<main>` tags between `App.jsx` and `HomePage.jsx` | M1 | ORIGINAL_REQUEST §R3, Explorer 2 |
| 6 | Heading Hierarchy (`h1`-`h6`) Progression | Sequential heading progression across `/about`, `/register`, `/submit-ppt`, and `/round2-confirm` | M1 | ORIGINAL_REQUEST §R3 |
| 7 | Image Alt Texts & Layout Shift (CLS) Protection | Explicit width, height, and loading attributes on images across all target pages | M1 | ORIGINAL_REQUEST §R1, Explorer 2 |
| 8 | Dynamic Client-Side Head Management | React 19 `<SeoHead />` component updating title, meta, canonical on route transition | M1 | ORIGINAL_REQUEST §R3 |
| 9 | Post-Build Static Prerendering Pipeline | Node.js post-build script (`scripts/prerender.js`) generating static HTML for 5 routes in `dist/` | M1 | ORIGINAL_REQUEST §R3, Explorer 1 |
| 10 | Build Integration (`npm run build`) | Update `package.json` build command to build bundle and execute static route prerendering | M1 | ORIGINAL_REQUEST Acceptance |
| 11 | Opaque-Box E2E Testing Suite | Standalone test runner (`scripts/verify-seo.js`) testing tag presence, schema validity, sitemap/robots formatting | M-E2E | ORIGINAL_REQUEST Acceptance |
| 12 | 100% E2E Verification & Audit Gate | Full execution and pass of all E2E SEO test tiers, adversarial hardening, and forensic audit | M2 | Project Pattern Dual Track |

## Milestones
| # | Name | Scope | Dependencies | Status | Key Outputs |
|---|------|-------|-------------|--------|-------------|
| M-E2E | E2E Testing Track | Requirement-driven test suite (`scripts/verify-seo.js`, `TEST_INFRA.md`, `TEST_READY.md`) | none | DONE | `scripts/verify-seo.js`, `TEST_READY.md` (4-tier suite) |
| M1 | Production-Grade Technical SEO Implementation | `src/data/seoData.js`, `public/robots.txt`, `public/sitemap.xml`, `index.html`, `<SeoHead />`, semantic HTML/headings, `scripts/prerender.js`, build wiring | none | DONE | `npm run build` exits 0, 5 route HTML files, 205 assertions pass |
| M2 | Final Milestone: 100% E2E Pass & Audit | Execute E2E verification test suite, adversarial coverage hardening, and forensic integrity audit | M-E2E, M1 | DONE | All 4 Reviewers & Challengers APPROVE, Forensic Auditor CLEAN |

## Interface Contracts
### `src/data/seoData.js` ↔ Consumer Modules (`SeoHead.jsx`, `scripts/prerender.js`, `scripts/verify-seo.js`)
- **Export `SEO_CONFIG`**:
  ```javascript
  {
    baseUrl: "https://veltraxx.in",
    defaultOgImage: "https://veltraxx.in/og-banner.jpg",
    routes: {
      "/": {
        title: "VELTRAXX 2.0 · National 24-Hour VLSI & Hardware Hackathon | SIET",
        description: "Join VELTRAXX 2.0, India's premier 24-hour national VLSI, semiconductor & hardware hackathon at SIET Coimbatore. 5 industrial tracks, cash prizes & 100% free Round 1 entry.",
        canonical: "https://veltraxx.in/",
        keywords: "veltraxx, veltraxx 2.0, hardware hackathon, vlsi hackathon, semiconductor hackathon, engineering hackathons in tamil nadu, siet hackathon, national 24-hour hackathon, fpga hackathon",
        ogType: "website",
        breadcrumbs: [...],
        schemas: [...] // JSON-LD objects: Event, EducationalOrganization, FAQPage, WebSite, BreadcrumbList
      },
      "/about": { ... },
      "/register": { ... },
      "/submit-ppt": { ... },
      "/round2-confirm": { ... }
    }
  }
  ```

### Build Pipeline ↔ Prerender Script (`package.json` -> `scripts/prerender.js`)
- `vite build` creates `dist/index.html` and assets.
- `node scripts/prerender.js` runs immediately post-build:
  - Input: reads `dist/index.html` and `src/data/seoData.js`.
  - Output: writes `dist/index.html`, `dist/about/index.html`, `dist/register/index.html`, `dist/submit-ppt/index.html`, `dist/round2-confirm/index.html`.
  - Exit code: 0 on success, non-zero on error.

### Verification Harness (`scripts/verify-seo.js`)
- Command: `node scripts/verify-seo.js` (and `npm run test:seo`)
- Verifies:
  1. `dist/` contains all 5 route HTML files.
  2. Each route HTML contains route-specific `<title>`, `<meta name="description">`, `<link rel="canonical">`.
  3. OpenGraph tags (`og:title`, `og:description`, `og:url`, `og:image`, `og:type`) and Twitter cards are present and absolute.
  4. Embedded JSON-LD scripts parse without errors and match Schema.org types (Event, Organization, FAQPage, BreadcrumbList, WebSite).
  5. `public/robots.txt` disallows `/admin` and `/tracker` and links to `https://veltraxx.in/sitemap.xml`.
  6. `public/sitemap.xml` is valid XML with all 5 canonical routes.

## Code Layout
- `public/robots.txt`: Production crawler rules
- `public/sitemap.xml`: Canonical sitemap
- `src/data/seoData.js`: Central metadata and JSON-LD schema definitions
- `src/components/common/SeoHead.jsx`: React 19 document head manager
- `scripts/prerender.js`: Post-build static HTML route generator
- `scripts/verify-seo.js`: E2E test and verification suite
- `scripts/test-adversarial-bots.mjs`: Adversarial zero-JS bot emulation suite
- `src/pages/`: Page components with semantic HTML and heading structure
