/**
 * VELTRAXX 2.0 · Comprehensive 4-Tier Technical SEO Verification Suite
 * 
 * Verifies all requirements from ORIGINAL_REQUEST.md, PROJECT.md, and TEST_READY.md:
 * - Tier 1: Feature Coverage (existence of files, meta tags, schemas, robots, sitemap)
 * - Tier 2: Boundary & Corner Cases (length limits, HTTPS absolute URLs, asset existence, uniqueness)
 * - Tier 3: Schema & Integration Directives (Schema.org fields, cross-validation, robots & sitemap integrity)
 * - Tier 4: Real-World Crawler Emulation (document structure, charset position, viewport, h1 presence)
 * 
 * CLI Flags:
 *   --verbose      Show all passing assertions
 *   --tier=1,2,3,4 Filter to specific tier(s)
 *   --route=/about Filter to specific route
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const publicDir = path.join(projectRoot, 'public');

// Parse CLI Flags
const args = process.argv.slice(2);
const isVerbose = args.includes('--verbose');
const tierArg = args.find((a) => a.startsWith('--tier='));
const activeTiers = tierArg
  ? tierArg.replace('--tier=', '').split(',').map((t) => parseInt(t.trim(), 10))
  : [1, 2, 3, 4];
const routeArg = args.find((a) => a.startsWith('--route='));
const filterRoute = routeArg ? routeArg.replace('--route=', '').trim() : null;

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message, tier = 1) {
  if (!activeTiers.includes(tier)) return;
  totalTests++;
  if (condition) {
    passedTests++;
    if (isVerbose) {
      console.log(`  ✓ [T${tier}] PASS: ${message}`);
    }
  } else {
    failedTests++;
    console.error(`  ✗ [T${tier}] FAIL: ${message}`);
  }
}

console.log('======================================================================');
console.log('VELTRAXX 2.0 4-TIER TECHNICAL SEO & PRE-RENDERING TEST SUITE');
console.log(`Active Tiers: ${activeTiers.join(', ')}${filterRoute ? ` | Filter Route: ${filterRoute}` : ''}`);
console.log('======================================================================\n');

const allExpectedRoutes = [
  { route: '/', file: path.join(distDir, 'index.html'), expectedCanonical: 'https://veltraxx.in/' },
  { route: '/about', file: path.join(distDir, 'about', 'index.html'), expectedCanonical: 'https://veltraxx.in/about' },
  { route: '/register', file: path.join(distDir, 'register', 'index.html'), expectedCanonical: 'https://veltraxx.in/register' },
  { route: '/submit-ppt', file: path.join(distDir, 'submit-ppt', 'index.html'), expectedCanonical: 'https://veltraxx.in/submit-ppt' },
  { route: '/round2-confirm', file: path.join(distDir, 'round2-confirm', 'index.html'), expectedCanonical: 'https://veltraxx.in/round2-confirm' },
];

const targetRoutes = filterRoute
  ? allExpectedRoutes.filter((r) => r.route === filterRoute)
  : allExpectedRoutes;

// Helper to extract clean text from HTML entity encoded string
function unescapeEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

// ============================================================================
// TIER 1: Feature Coverage (Category-Partition Testing)
// ============================================================================
if (activeTiers.includes(1)) {
  console.log('--- Tier 1: Feature Coverage ---');

  for (const { route, file } of targetRoutes) {
    assert(fs.existsSync(file), `Pre-rendered HTML file exists for route "${route}"`, 1);
    if (!fs.existsSync(file)) continue;

    const content = fs.readFileSync(file, 'utf-8');
    assert(/<title>[\s\S]*?<\/title>/i.test(content), `Route "${route}" contains <title> tag`, 1);
    assert(/<meta\s+name=["']description["']/i.test(content), `Route "${route}" contains <meta name="description"> tag`, 1);
    assert(/<link\s+rel=["']canonical["']/i.test(content), `Route "${route}" contains <link rel="canonical"> tag`, 1);

    // OpenGraph bundle
    assert(/<meta\s+property=["']og:title["']/i.test(content), `Route "${route}" contains og:title`, 1);
    assert(/<meta\s+property=["']og:description["']/i.test(content), `Route "${route}" contains og:description`, 1);
    assert(/<meta\s+property=["']og:url["']/i.test(content), `Route "${route}" contains og:url`, 1);
    assert(/<meta\s+property=["']og:image["']/i.test(content), `Route "${route}" contains og:image`, 1);
    assert(/<meta\s+property=["']og:type["']/i.test(content), `Route "${route}" contains og:type`, 1);

    // Twitter Card bundle
    assert(/<meta\s+name=["']twitter:card["']/i.test(content), `Route "${route}" contains twitter:card`, 1);
    assert(/<meta\s+name=["']twitter:title["']/i.test(content), `Route "${route}" contains twitter:title`, 1);
    assert(/<meta\s+name=["']twitter:description["']/i.test(content), `Route "${route}" contains twitter:description`, 1);
    assert(/<meta\s+name=["']twitter:image["']/i.test(content), `Route "${route}" contains twitter:image`, 1);

    // JSON-LD scripts
    assert(/<script\s+type=["']application\/ld\+json["']/i.test(content), `Route "${route}" contains JSON-LD structured data`, 1);
  }

  // Web root crawler assets
  assert(fs.existsSync(path.join(distDir, 'robots.txt')), 'dist/robots.txt exists', 1);
  assert(fs.existsSync(path.join(publicDir, 'robots.txt')), 'public/robots.txt exists', 1);
  assert(fs.existsSync(path.join(distDir, 'sitemap.xml')), 'dist/sitemap.xml exists', 1);
  assert(fs.existsSync(path.join(publicDir, 'sitemap.xml')), 'public/sitemap.xml exists', 1);
}

// ============================================================================
// TIER 2: Boundary & Corner Cases
// ============================================================================
if (activeTiers.includes(2)) {
  console.log('\n--- Tier 2: Boundary & Corner Cases ---');

  const collectedTitles = new Map();
  const collectedDescriptions = new Map();

  for (const { route, file, expectedCanonical } of targetRoutes) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf-8');

    // Title length bounds (10 to 75 chars)
    const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/i);
    if (titleMatch) {
      const rawTitle = unescapeEntities(titleMatch[1].trim());
      assert(rawTitle.length >= 10 && rawTitle.length <= 75, `Route "${route}" title within bounds (${rawTitle.length} chars: "${rawTitle}")`, 2);
      collectedTitles.set(route, rawTitle);
    }

    // Description length bounds (50 to 200 chars)
    const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']/i);
    if (descMatch) {
      const rawDesc = unescapeEntities(descMatch[1].trim());
      assert(rawDesc.length >= 50 && rawDesc.length <= 200, `Route "${route}" description within bounds (${rawDesc.length} chars)`, 2);
      collectedDescriptions.set(route, rawDesc);
    }

    // Canonical link absolute HTTPS
    const canonicalMatch = content.match(/<link\s+rel=["']canonical["']\s+href=["']([\s\S]*?)["']/i);
    if (canonicalMatch) {
      const href = canonicalMatch[1].trim();
      assert(href.startsWith('https://'), `Route "${route}" canonical uses absolute HTTPS scheme`, 2);
      assert(href === expectedCanonical, `Route "${route}" canonical exactly matches expected "${expectedCanonical}"`, 2);
    }

    // OpenGraph og:image absolute HTTPS & local asset existence
    const ogImgMatch = content.match(/<meta\s+property=["']og:image["']\s+content=["']([\s\S]*?)["']/i);
    if (ogImgMatch) {
      const imgUrl = ogImgMatch[1].trim();
      assert(imgUrl.startsWith('https://'), `Route "${route}" og:image uses absolute HTTPS scheme`, 2);

      // Verify asset exists in public folder
      const imgPath = imgUrl.replace('https://veltraxx.in', '');
      const localAssetPath = path.join(publicDir, imgPath);
      assert(fs.existsSync(localAssetPath), `Referenced og:image asset exists on disk (${imgPath})`, 2);
    }

    // Twitter twitter:image absolute HTTPS
    const twImgMatch = content.match(/<meta\s+name=["']twitter:image["']\s+content=["']([\s\S]*?)["']/i);
    if (twImgMatch) {
      assert(twImgMatch[1].trim().startsWith('https://'), `Route "${route}" twitter:image uses absolute HTTPS scheme`, 2);
    }

    // Twitter card type
    const twCardMatch = content.match(/<meta\s+name=["']twitter:card["']\s+content=["']([\s\S]*?)["']/i);
    if (twCardMatch) {
      const type = twCardMatch[1].trim();
      assert(type === 'summary_large_image' || type === 'summary', `Route "${route}" twitter:card is valid type (${type})`, 2);
    }

    // JSON-LD strict syntax parsing
    const scriptRegex = /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi;
    let match;
    let scriptIdx = 0;
    while ((match = scriptRegex.exec(content)) !== null) {
      scriptIdx++;
      try {
        JSON.parse(match[1]);
        assert(true, `Route "${route}" JSON-LD #${scriptIdx} parses without syntax error`, 2);
      } catch (e) {
        assert(false, `Route "${route}" JSON-LD #${scriptIdx} parse error: ${e.message}`, 2);
      }
    }
  }

  // Title uniqueness check (when testing full suite)
  if (!filterRoute) {
    const titlesSet = new Set(collectedTitles.values());
    assert(titlesSet.size === collectedTitles.size, 'All route titles are mutually unique (no duplicate titles)', 2);

    const descSet = new Set(collectedDescriptions.values());
    assert(descSet.size === collectedDescriptions.size, 'All route descriptions are mutually unique (no duplicate descriptions)', 2);
  }
}

// ============================================================================
// TIER 3: Schema & Integration Directives
// ============================================================================
if (activeTiers.includes(3)) {
  console.log('\n--- Tier 3: Schema & Integration Directives ---');

  const allSchemas = [];

  for (const { route, file, expectedCanonical } of targetRoutes) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf-8');

    // Cross-validate og:url against canonical
    const ogUrlMatch = content.match(/<meta\s+property=["']og:url["']\s+content=["']([\s\S]*?)["']/i);
    if (ogUrlMatch) {
      assert(ogUrlMatch[1].trim() === expectedCanonical, `Route "${route}" og:url matches canonical`, 3);
    }

    // Parse schemas
    const scriptRegex = /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = scriptRegex.exec(content)) !== null) {
      try {
        const parsed = JSON.parse(match[1]);
        const items = parsed['@graph'] ? parsed['@graph'] : [parsed];
        for (const item of items) {
          assert(item['@context'] === 'https://schema.org', `Schema has valid @context: https://schema.org`, 3);
          allSchemas.push(item);
        }
      } catch {}
    }
  }

  // Validate specific schema entities
  if (!filterRoute) {
    const event = allSchemas.find((s) => s['@type'] === 'Event' && s.startDate && s.startDate.includes('2026-12-15'));
    assert(!!event, 'Found main Event schema for 24-Hour Finale (startDate 2026-12-15)', 3);
    if (event) {
      assert(event.name && event.name.length > 0, 'Event schema has non-empty name', 3);
      assert(event.location && event.location.name && event.location.name.includes('SIET'), 'Event schema defines physical location at SIET', 3);
      assert(event.organizer, 'Event schema defines organizer reference', 3);
    }

    const org = allSchemas.find((s) => s['@type'] === 'EducationalOrganization');
    assert(!!org, 'Found EducationalOrganization schema entity', 3);
    if (org) {
      assert(org.name && org.name.includes('Sri Shakthi Institute of Engineering and Technology'), 'EducationalOrganization schema specifies SIET name', 3);
      assert(org.contactPoint && org.contactPoint.length > 0, 'EducationalOrganization schema provides direct contactPoint entries', 3);
    }

    const site = allSchemas.find((s) => s['@type'] === 'WebSite');
    assert(!!site, 'Found WebSite schema entity', 3);
    if (site) {
      assert(site.name === 'VELTRAXX 2.0', 'WebSite schema specifies name "VELTRAXX 2.0"', 3);
      assert(site.url === 'https://veltraxx.in/', 'WebSite schema specifies canonical URL', 3);
    }

    const breadcrumb = allSchemas.find((s) => s['@type'] === 'BreadcrumbList');
    assert(!!breadcrumb, 'Found BreadcrumbList schema entity', 3);
    if (breadcrumb) {
      assert(Array.isArray(breadcrumb.itemListElement) && breadcrumb.itemListElement.length > 0, 'BreadcrumbList contains itemListElement array', 3);
    }

    const faq = allSchemas.find((s) => s['@type'] === 'FAQPage');
    assert(!!faq, 'Found FAQPage schema entity', 3);
    if (faq) {
      assert(Array.isArray(faq.mainEntity) && faq.mainEntity.length >= 6, 'FAQPage schema contains all 6 verified Q&A pairs', 3);
    }
  }

  // Robots.txt Directives
  const robotsDist = path.join(distDir, 'robots.txt');
  if (fs.existsSync(robotsDist)) {
    const robots = fs.readFileSync(robotsDist, 'utf-8');
    assert(robots.includes('User-agent: *'), 'robots.txt specifies wildcard User-agent: *', 3);
    assert(robots.includes('Disallow: /admin'), 'robots.txt disallows /admin', 3);
    assert(robots.includes('Disallow: /tracker'), 'robots.txt disallows /tracker', 3);
    assert(robots.includes('Allow: /'), 'robots.txt allows root /', 3);
    assert(robots.includes('Sitemap: https://veltraxx.in/sitemap.xml'), 'robots.txt references https://veltraxx.in/sitemap.xml', 3);
    assert(!robots.includes('Disallow: /\n') && !robots.includes('Disallow: /\r\n'), 'robots.txt does NOT accidentally disallow root /', 3);
  }

  // Sitemap.xml Integrity
  const sitemapDist = path.join(distDir, 'sitemap.xml');
  if (fs.existsSync(sitemapDist)) {
    const sitemap = fs.readFileSync(sitemapDist, 'utf-8');
    assert(sitemap.includes('<urlset') && sitemap.includes('</urlset>'), 'sitemap.xml has valid <urlset> root tag', 3);

    const validFreqs = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
    const freqMatches = sitemap.matchAll(/<changefreq>(.*?)<\/changefreq>/gi);
    for (const match of freqMatches) {
      assert(validFreqs.includes(match[1].trim()), `sitemap.xml changefreq "${match[1]}" is valid enumeration`, 3);
    }

    const priorityMatches = sitemap.matchAll(/<priority>(.*?)<\/priority>/gi);
    for (const match of priorityMatches) {
      const val = parseFloat(match[1]);
      assert(!isNaN(val) && val >= 0.0 && val <= 1.0, `sitemap.xml priority "${match[1]}" is in [0.0 - 1.0] range`, 3);
    }
  }
}

// ============================================================================
// TIER 4: Real-World Crawler Emulation
// ============================================================================
if (activeTiers.includes(4)) {
  console.log('\n--- Tier 4: Real-World Crawler Emulation ---');

  for (const { route, file } of targetRoutes) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf-8');

    // Layout order: <head> strictly precedes <body>
    const headIndex = content.indexOf('<head');
    const bodyIndex = content.indexOf('<body');
    assert(headIndex !== -1 && bodyIndex !== -1 && headIndex < bodyIndex, `Route "${route}" <head> strictly precedes <body>`, 4);

    // Early charset declaration within first 1024 bytes
    const charsetMatch = content.search(/<meta\s+charset=["']UTF-8["']/i);
    assert(charsetMatch !== -1 && charsetMatch < 1024, `Route "${route}" declares charset within first 1024 bytes (pos: ${charsetMatch})`, 4);

    // Viewport tag for mobile crawlers
    assert(/<meta\s+name=["']viewport["']/i.test(content), `Route "${route}" includes viewport meta for mobile Googlebot`, 4);

    // Pre-rendered body content indexability (non-empty body without JS)
    const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      const bodyInner = bodyMatch[1].replace(/<script[\s\S]*?<\/script>/gi, '').trim();
      assert(bodyInner.length > 50, `Route "${route}" provides pre-rendered textual content for non-JS crawlers (${bodyInner.length} chars)`, 4);
    }

    // Static h1 presence
    assert(/<h1[^>]*>[\s\S]*?<\/h1>/i.test(content), `Route "${route}" contains pre-rendered <h1> heading in static HTML`, 4);
  }
}

// ============================================================================
// SUMMARY & VERDICT
// ============================================================================
console.log('\n======================================================================');
console.log(`TEST EXECUTION SUMMARY: ${passedTests} Passed, ${failedTests} Failed (Total Assertions: ${totalTests})`);
console.log('======================================================================');

if (failedTests > 0) {
  console.error(`\n[FAIL] Test suite failed with ${failedTests} error(s).\n`);
  process.exit(1);
} else {
  console.log(`\n[ALL PASS] 100% of Technical SEO assertions passed cleanly across Tiers: ${activeTiers.join(', ')}.\n`);
  process.exit(0);
}
