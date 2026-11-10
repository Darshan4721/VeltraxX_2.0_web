# TEST READY: VELTRAXX 2.0 Opaque-Box Technical SEO Suite

## Test Suite Overview
- **Runner Script**: `scripts/verify-seo.js`
- **Execution Command**: `node scripts/verify-seo.js`
- **Runtime Dependencies**: Zero external dependencies (native Node.js ESM built on `fs`, `path`, `url`)
- **Scope**: All 5 canonical routes and root crawler assets:
  1. `https://veltraxx.in/` (`dist/index.html`)
  2. `https://veltraxx.in/about` (`dist/about/index.html`)
  3. `https://veltraxx.in/register` (`dist/register/index.html`)
  4. `https://veltraxx.in/submit-ppt` (`dist/submit-ppt/index.html`)
  5. `https://veltraxx.in/round2-confirm` (`dist/round2-confirm/index.html`)
  6. `robots.txt` (`dist/robots.txt` & `public/robots.txt`)
  7. `sitemap.xml` (`dist/sitemap.xml` & `public/sitemap.xml`)

---

## 4-Tier Verification Architecture & Feature Checklist

### Tier 1: Feature Coverage (Category-Partition Testing)
- [x] Pre-rendered HTML file existence verified across all 5 target routes
- [x] `<title>` tag presence in `<head>` for each route
- [x] `<meta name="description">` presence for each route
- [x] `<link rel="canonical">` presence for each route
- [x] OpenGraph meta tag bundle (`og:title`, `og:description`, `og:url`, `og:image`, `og:type`) presence
- [x] Twitter Card meta tag bundle (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`) presence
- [x] `<script type="application/ld+json">` structured data script presence
- [x] Web root `robots.txt` presence
- [x] Web root `sitemap.xml` presence

### Tier 2: Boundary & Corner Cases
- [x] Title character length boundary check (10 to 70 characters; rejects framework default placeholders)
- [x] Description character length boundary check (50 to 200 characters; prevents SERP ellipsis truncation)
- [x] Canonical link absolute HTTPS validation (`https://veltraxx.in/...`)
- [x] OpenGraph `og:image` absolute HTTPS URL validation
- [x] Twitter `twitter:image` absolute HTTPS URL validation
- [x] Local disk verification for referenced social preview image assets
- [x] Twitter Card type validation (`summary_large_image` or `summary`)
- [x] JSON-LD strict syntax parsing (`JSON.parse` with no syntax errors)
- [x] Title uniqueness across all routes (prevents duplicate page titles)
- [x] Description uniqueness across all routes (prevents duplicate meta descriptions)

### Tier 3: Schema & Integration Directives
- [x] JSON-LD Schema `@context` validation (`https://schema.org`)
- [x] `Event` / `Hackathon` schema field validation (`name`, `startDate`, `location`, `organizer`)
- [x] `EducationalOrganization` / `Organization` schema validation (`name`)
- [x] `WebSite` schema validation (`name`, `url`)
- [x] `BreadcrumbList` schema validation (`itemListElement` array)
- [x] `FAQPage` schema validation (if present, `mainEntity` questions and answers)
- [x] OpenGraph `og:url` cross-validation against `<link rel="canonical">`
- [x] `robots.txt` directive validation:
  - Wildcard user agent (`User-agent: *`)
  - Admin protection (`Disallow: /admin`)
  - Tracker isolation (`Disallow: /tracker`)
  - Canonical sitemap link (`Sitemap: https://veltraxx.in/sitemap.xml`)
  - Safety check ensuring root is not disallowed
- [x] `sitemap.xml` schema validation:
  - Well-formed XML with `<urlset>` root node
  - All 5 canonical routes listed
  - `<changefreq>` valid enumerated keyword
  - `<priority>` valid numeric range [0.0 - 1.0]
  - Duplicate URL prevention

### Tier 4: Real-World Crawler Emulation
- [x] Document layout order: `<head>` strictly precedes `<body>`
- [x] Early charset declaration: `<meta charset="UTF-8">` located within first 1024 bytes
- [x] Mobile crawler compatibility: `<meta name="viewport">` present
- [x] Pre-rendered body content indexability: non-empty textual content (prevents blank-page indexing)
- [x] Semantic heading hierarchy: presence of at least one `<h1>` landmark in static HTML
- [x] Complete social scraper payload bundle (WhatsApp, X, LinkedIn, Facebook preview bots)

---

## Execution Modes & Options

```bash
# Standard test run
node scripts/verify-seo.js

# Verbose output showing all passed checks
node scripts/verify-seo.js --verbose

# Run specific tier(s) only
node scripts/verify-seo.js --tier=1,2
node scripts/verify-seo.js --tier=3

# Filter checks to a specific route
node scripts/verify-seo.js --route=/about
node scripts/verify-seo.js --route=/
```

---

## Baseline Test Execution (Prior to M1 Implementation)

Execution against the baseline repository (before M1 implementation completes) produces:
- **Total Checks**: 59
- **Passed**: 40
- **Failed**: 19
- **Exit Code**: 1

### Discovered Implementation Defects (Escalated to M1 Implementation Track):
1. **Missing Pre-rendered Route HTML**:
   `dist/about/index.html`, `dist/register/index.html`, `dist/submit-ppt/index.html`, and `dist/round2-confirm/index.html` do not exist.
2. **Missing XML Sitemap**:
   Neither `public/sitemap.xml` nor `dist/sitemap.xml` exists.
3. **Home Page Meta Description Too Long**:
   `dist/index.html` description is 279 characters (exceeds Google snippet limit of 200 characters).
4. **Relative Image URLs in OpenGraph / Twitter Cards**:
   `og:image` and `twitter:image` are set to `/og-banner.jpg` instead of absolute HTTPS `https://veltraxx.in/og-banner.jpg`.
5. **Missing Schema.org Types**:
   Missing `WebSite` and `BreadcrumbList` schemas.
6. **Outdated & Incomplete robots.txt**:
   `robots.txt` lacks `Disallow: /admin` and points to legacy domain `https://veltraxx.siet.ac.in/sitemap.xml` instead of `https://veltraxx.in/sitemap.xml`.
7. **Empty Pre-rendered Body Shell in `dist/index.html`**:
   The static HTML has 0 text characters in `<body>` and no `<h1>` heading before client-side hydration.

---

## Passing Criteria for Milestone 2 Gate
When Milestone 1 implementation completes:
1. `npm run build` generates all 5 route directories in `dist/` with populated head tags and static semantic HTML.
2. `public/robots.txt` and `public/sitemap.xml` are copied to `dist/`.
3. Running `node scripts/verify-seo.js` produces **0 Failures** and exits with **code 0**.
