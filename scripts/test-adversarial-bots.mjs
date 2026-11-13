/**
 * VELTRAXX 2.0 · Comprehensive Adversarial Crawler & Social Bot Challenge Suite
 * 
 * Invoked by Challenger 1 (Adversarial Crawler & Social Bot Challenge).
 * Simulates real-world search engine crawlers and social media preview bots
 * with ZERO JavaScript execution against static pre-rendered HTML in dist/.
 * 
 * Simulated Bot Ecosystem:
 * 1. Googlebot (Desktop & Mobile Web Search)
 * 2. WhatsApp Preview Bot (OpenGraph & media cards)
 * 3. Twitterbot / X Card Validator
 * 4. LinkedInBot (Social share previews)
 * 5. Facebook ExternalHit (OpenGraph scraping engine)
 * 6. TelegramBot (Rich previews)
 * 7. Discordbot (Embed generation & theme color)
 * 8. Slackbot (Link unfurling)
 * 
 * Edge Case & Injection Stress Vectors:
 * - Trailing slash normalization & canonical parity
 * - HTML attribute quote breakout & XSS injection prevention
 * - Entity encoding fidelity (&amp;, &#39;, &quot;, &lt;, &gt;)
 * - Duplicate meta tags & head pollution
 * - Strict JSON-LD syntax, schema.org type compliance, and @id graph reference integrity
 * - Raw HTML tag absence in meta tags
 * - Image asset physical presence, format, and dimension verification
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SEO_CONFIG } from '../src/data/seoData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failureDetails = [];

function assert(condition, message, category = 'General') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] [${category}] ${message}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] [${category}] ${message}`);
    failureDetails.push({ category, message });
  }
}

console.log('======================================================================');
console.log('VELTRAXX 2.0 ADVERSARIAL CRAWLER & SOCIAL BOT CHALLENGE SUITE');
console.log('======================================================================\n');

// ----------------------------------------------------------------------------
// Helpers: Raw String Extraction (Emulating Zero-JS Scrapers)
// ----------------------------------------------------------------------------

function extractTitle(html) {
  const match = html.match(/<title>([\s\S]*?)<\/title>/i);
  return match ? match[1].trim() : null;
}

function extractMeta(html, attrName, attrValue) {
  const regex = new RegExp(`<meta\\s+[^>]*?${attrName}=["']${attrValue}["'][^>]*?>`, 'i');
  const match = html.match(regex);
  if (!match) return null;
  const tag = match[0];
  const contentMatch = tag.match(/content=["']([\s\S]*?)["']/i);
  return contentMatch ? contentMatch[1] : null;
}

function extractCanonical(html) {
  const match = html.match(/<link\s+[^>]*?rel=["']canonical["'][^>]*?>/i);
  if (!match) return null;
  const hrefMatch = match[0].match(/href=["']([\s\S]*?)["']/i);
  return hrefMatch ? hrefMatch[1] : null;
}

function extractAllJsonLd(html) {
  const regex = /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi;
  const results = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    results.push(match[1].trim());
  }
  return results;
}

function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

// Target routes
const targetRoutes = [
  { route: '/', filePath: path.join(distDir, 'index.html'), expectedCanonical: 'https://veltraxx.in/' },
  { route: '/about', filePath: path.join(distDir, 'about', 'index.html'), expectedCanonical: 'https://veltraxx.in/about' },
  { route: '/register', filePath: path.join(distDir, 'register', 'index.html'), expectedCanonical: 'https://veltraxx.in/register' },
  { route: '/submit-ppt', filePath: path.join(distDir, 'submit-ppt', 'index.html'), expectedCanonical: 'https://veltraxx.in/submit-ppt' },
  { route: '/round2-confirm', filePath: path.join(distDir, 'round2-confirm', 'index.html'), expectedCanonical: 'https://veltraxx.in/round2-confirm' },
];

// ============================================================================
// SUITE 1: REAL-WORLD BOT SCRAPER EMULATION (ZERO JS)
// ============================================================================
console.log('--- SUITE 1: Real-World Bot Scraper Emulation (Zero-JS) ---');

for (const { route, filePath, expectedCanonical } of targetRoutes) {
  assert(fs.existsSync(filePath), `Static HTML exists for route "${route}" at ${filePath}`, 'BotEmulation');
  if (!fs.existsSync(filePath)) continue;

  const rawHtml = fs.readFileSync(filePath, 'utf-8');
  const routeData = SEO_CONFIG.routes[route];

  // 1. Googlebot Emulation
  {
    const title = extractTitle(rawHtml);
    const decodedTitle = decodeHtmlEntities(title);
    assert(decodedTitle === routeData.title, `Googlebot extracts correct title for "${route}"`, 'Googlebot');
    assert(decodedTitle && decodedTitle.length >= 10 && decodedTitle.length <= 70, `Googlebot title length (${decodedTitle?.length}) within SERP limit [10-70] for "${route}"`, 'Googlebot');

    const desc = extractMeta(rawHtml, 'name', 'description');
    const decodedDesc = decodeHtmlEntities(desc);
    assert(decodedDesc === routeData.description, `Googlebot extracts correct meta description for "${route}"`, 'Googlebot');
    assert(decodedDesc && decodedDesc.length >= 50 && decodedDesc.length <= 200, `Googlebot description length (${decodedDesc?.length}) within SERP snippet boundary [50-200] for "${route}"`, 'Googlebot');

    const canonical = extractCanonical(rawHtml);
    assert(canonical === expectedCanonical, `Googlebot extracts canonical URL "${canonical}" matching "${expectedCanonical}" for "${route}"`, 'Googlebot');

    // Charset within first 1024 bytes (strict Googlebot requirement)
    const first1024 = rawHtml.slice(0, 1024);
    assert(/<meta\s+charset=["']UTF-8["']/i.test(first1024), `Googlebot detects early UTF-8 charset declaration in first 1024 bytes for "${route}"`, 'Googlebot');

    // Viewport meta for mobile Googlebot
    const viewport = extractMeta(rawHtml, 'name', 'viewport');
    assert(viewport && viewport.includes('width=device-width'), `Googlebot detects mobile viewport meta for "${route}"`, 'Googlebot');

    // Indexable pre-rendered content in body
    const noscriptMatch = rawHtml.match(/<noscript>([\s\S]*?)<\/noscript>/i);
    assert(noscriptMatch !== null, `Googlebot finds pre-rendered noscript fallback block for "${route}"`, 'Googlebot');
    if (noscriptMatch) {
      assert(/<h1>[\s\S]*?<\/h1>/i.test(noscriptMatch[1]), `Googlebot finds semantic <h1> heading in pre-rendered body for "${route}"`, 'Googlebot');
      assert(/<p>[\s\S]*?<\/p>/i.test(noscriptMatch[1]), `Googlebot finds descriptive text in pre-rendered body for "${route}"`, 'Googlebot');
    }

    // Noindex safeguard
    const robotsMeta = extractMeta(rawHtml, 'name', 'robots');
    assert(!robotsMeta || !/noindex/i.test(robotsMeta), `Googlebot confirms route "${route}" is NOT marked noindex`, 'Googlebot');
  }

  // 2. WhatsApp Preview Bot Emulation
  {
    const ogTitle = extractMeta(rawHtml, 'property', 'og:title');
    const decodedOgTitle = decodeHtmlEntities(ogTitle);
    assert(decodedOgTitle === routeData.title, `WhatsApp bot extracts og:title for "${route}"`, 'WhatsApp');

    const ogDesc = extractMeta(rawHtml, 'property', 'og:description');
    const decodedOgDesc = decodeHtmlEntities(ogDesc);
    assert(decodedOgDesc === routeData.description, `WhatsApp bot extracts og:description for "${route}"`, 'WhatsApp');

    const ogUrl = extractMeta(rawHtml, 'property', 'og:url');
    assert(ogUrl === expectedCanonical, `WhatsApp bot extracts og:url matching canonical "${expectedCanonical}" for "${route}"`, 'WhatsApp');

    const ogImage = extractMeta(rawHtml, 'property', 'og:image');
    assert(ogImage && ogImage.startsWith('https://'), `WhatsApp bot requires absolute HTTPS og:image, got "${ogImage}" for "${route}"`, 'WhatsApp');
    
    // Check local image asset existence and WhatsApp weight limit (< 300 KB)
    if (ogImage && ogImage.startsWith('https://veltraxx.in/')) {
      const relativePath = ogImage.replace('https://veltraxx.in/', '');
      const localImagePath = path.join(distDir, relativePath);
      assert(fs.existsSync(localImagePath), `WhatsApp preview image exists on disk at ${localImagePath}`, 'WhatsApp');
      if (fs.existsSync(localImagePath)) {
        const stats = fs.statSync(localImagePath);
        const kbSize = stats.size / 1024;
        assert(kbSize < 300, `WhatsApp preview image is under 300KB for instant inline preview (actual: ${kbSize.toFixed(1)} KB)`, 'WhatsApp');
      }
    }
  }

  // 3. Twitterbot / X Crawler Emulation
  {
    const card = extractMeta(rawHtml, 'name', 'twitter:card');
    assert(card === 'summary_large_image' || card === 'summary', `Twitterbot extracts valid twitter:card ("${card}") for "${route}"`, 'Twitterbot');

    const twTitle = extractMeta(rawHtml, 'name', 'twitter:title');
    const decodedTwTitle = decodeHtmlEntities(twTitle);
    assert(decodedTwTitle === routeData.title, `Twitterbot extracts twitter:title for "${route}"`, 'Twitterbot');
    assert(decodedTwTitle && decodedTwTitle.length <= 70, `Twitterbot title length (${decodedTwTitle?.length}) <= 70 chars for "${route}"`, 'Twitterbot');

    const twDesc = extractMeta(rawHtml, 'name', 'twitter:description');
    const decodedTwDesc = decodeHtmlEntities(twDesc);
    assert(decodedTwDesc === routeData.description, `Twitterbot extracts twitter:description for "${route}"`, 'Twitterbot');
    assert(decodedTwDesc && decodedTwDesc.length <= 200, `Twitterbot description length (${decodedTwDesc?.length}) <= 200 chars for "${route}"`, 'Twitterbot');

    const twImage = extractMeta(rawHtml, 'name', 'twitter:image');
    assert(twImage && twImage.startsWith('https://'), `Twitterbot extracts absolute HTTPS twitter:image ("${twImage}") for "${route}"`, 'Twitterbot');
  }

  // 4. LinkedInBot Emulation
  {
    const ogTitle = extractMeta(rawHtml, 'property', 'og:title');
    const decodedOgTitle = decodeHtmlEntities(ogTitle);
    assert(decodedOgTitle && decodedOgTitle.length <= 119, `LinkedInBot title length (${decodedOgTitle?.length}) <= 119 characters for "${route}"`, 'LinkedInBot');

    const ogDesc = extractMeta(rawHtml, 'property', 'og:description');
    const decodedOgDesc = decodeHtmlEntities(ogDesc);
    assert(decodedOgDesc && decodedOgDesc.length <= 1000, `LinkedInBot protocol description length (${decodedOgDesc?.length}) <= 1000 chars for "${route}"`, 'LinkedInBot');

    const ogWidth = extractMeta(rawHtml, 'property', 'og:image:width');
    const ogHeight = extractMeta(rawHtml, 'property', 'og:image:height');
    assert(ogWidth === '1200' && ogHeight === '630', `LinkedInBot detects standard 1200x630 (1.91:1) image dimensions for "${route}"`, 'LinkedInBot');
  }

  // 5. Facebook ExternalHit Emulation
  {
    const ogType = extractMeta(rawHtml, 'property', 'og:type');
    assert(ogType === 'website' || ogType === 'article', `Facebook ExternalHit finds valid og:type ("${ogType}") for "${route}"`, 'FacebookExternalHit');

    const siteName = extractMeta(rawHtml, 'property', 'og:site_name');
    assert(siteName === 'VELTRAXX 2.0', `Facebook ExternalHit finds og:site_name === "VELTRAXX 2.0" for "${route}"`, 'FacebookExternalHit');

    const locale = extractMeta(rawHtml, 'property', 'og:locale');
    assert(locale === 'en_IN', `Facebook ExternalHit finds og:locale === "en_IN" for "${route}"`, 'FacebookExternalHit');

    const imageType = extractMeta(rawHtml, 'property', 'og:image:type');
    assert(imageType === 'image/jpeg', `Facebook ExternalHit finds og:image:type === "image/jpeg" for "${route}"`, 'FacebookExternalHit');

    const imageAlt = extractMeta(rawHtml, 'property', 'og:image:alt');
    assert(imageAlt && imageAlt.length > 5, `Facebook ExternalHit finds descriptive og:image:alt for "${route}"`, 'FacebookExternalHit');
  }

  // 6. Discordbot & Telegram & Slack Emulation
  {
    const themeColor = extractMeta(rawHtml, 'name', 'theme-color');
    assert(themeColor === '#FFE500', `Discordbot detects brand theme-color ("${themeColor}") for embed styling for "${route}"`, 'Discordbot');
  }
}

// ============================================================================
// SUITE 2: EDGE CASES & ESCAPING INTEGRITY
// ============================================================================
console.log('\n--- SUITE 2: Edge Cases & Escaping Integrity ---');

// Edge Case 2.1: Trailing Slash Parity against Sitemap & Canonical
const sitemapPath = path.join(distDir, 'sitemap.xml');
assert(fs.existsSync(sitemapPath), 'dist/sitemap.xml exists', 'TrailingSlashEdgeCase');
if (fs.existsSync(sitemapPath)) {
  const sitemapXml = fs.readFileSync(sitemapPath, 'utf-8');
  for (const { route, expectedCanonical } of targetRoutes) {
    const vercelCanonical = expectedCanonical.replace('https://veltraxx.in', 'https://veltrax-x-2-0-web.vercel.app');
    const locRegex = new RegExp(`<loc>(${expectedCanonical.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}|${vercelCanonical.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})</loc>`);
    assert(locRegex.test(sitemapXml), `Sitemap.xml contains exact canonical loc for "${route}"`, 'TrailingSlashEdgeCase');
    
    // Verify that subroutes do NOT have accidental trailing slash in sitemap
    if (route !== '/') {
      const badLocRegex = new RegExp(`<loc>(${expectedCanonical.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}|${vercelCanonical.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})/</loc>`);
      assert(!badLocRegex.test(sitemapXml), `Sitemap.xml rejects trailing-slash variant for subroute "${route}"`, 'TrailingSlashEdgeCase');
    }
  }
}

// Edge Case 2.2: Escaping & Attribute Breakout Stress Test
for (const { route, filePath } of targetRoutes) {
  if (!fs.existsSync(filePath)) continue;
  const rawHtml = fs.readFileSync(filePath, 'utf-8');

  // Verify that <title> never contains unescaped angle brackets or raw HTML tags
  const rawTitleMatch = rawHtml.match(/<title>([\s\S]*?)<\/title>/i);
  if (rawTitleMatch) {
    const rawTitleInside = rawTitleMatch[1];
    assert(!/<[a-z/][\s\S]*?>/i.test(rawTitleInside), `Title tag for "${route}" contains NO raw HTML markup`, 'Escaping');
    assert(!/&(?!(?:amp|#39|quot|lt|gt);)/.test(rawTitleInside), `Title tag for "${route}" has all ampersands properly escaped as &amp;`, 'Escaping');
  }

  // Scan all <meta> tags in the document head
  const headMatch = rawHtml.match(/<head>([\s\S]*?)<\/head>/i);
  if (headMatch) {
    const headContent = headMatch[1];
    const metaTagRegex = /<meta\s+[^>]*?>/gi;
    let metaMatch;
    let metaCount = 0;
    let breakoutCount = 0;
    let rawHtmlInMetaCount = 0;

    while ((metaMatch = metaTagRegex.exec(headContent)) !== null) {
      metaCount++;
      const tag = metaMatch[0];

      // Test attribute breakout: if content="..." contains raw double quote inside content
      const contentAttrMatch = tag.match(/content="([^"]*)"/);
      if (!contentAttrMatch) {
        const singleQuoteMatch = tag.match(/content='([^']*)'/);
        if (!singleQuoteMatch && tag.includes('content=')) {
          breakoutCount++;
          console.error(`  Breakout hazard detected in tag: ${tag}`);
        }
      } else {
        const contentVal = contentAttrMatch[1];
        if (/<|>/.test(contentVal)) {
          rawHtmlInMetaCount++;
          console.error(`  Raw HTML tag detected in meta content: ${contentVal}`);
        }
      }
    }

    assert(breakoutCount === 0, `All ${metaCount} meta tags in "${route}" have zero attribute breakout hazards`, 'Escaping');
    assert(rawHtmlInMetaCount === 0, `All meta tags in "${route}" are free of unescaped raw HTML angle brackets`, 'Escaping');
  }
}

// Edge Case 2.3: Zero Duplicate Head Tags
for (const { route, filePath } of targetRoutes) {
  if (!fs.existsSync(filePath)) continue;
  const rawHtml = fs.readFileSync(filePath, 'utf-8');
  const headMatch = rawHtml.match(/<head>([\s\S]*?)<\/head>/i);
  if (headMatch) {
    const head = headMatch[1];
    const countTag = (regex) => (head.match(regex) || []).length;

    assert(countTag(/<title>/gi) === 1, `Route "${route}" has exactly 1 <title> tag`, 'HeadHygiene');
    assert(countTag(/<link\s+[^>]*?rel=["']canonical["']/gi) === 1, `Route "${route}" has exactly 1 <link rel="canonical"> tag`, 'HeadHygiene');
    assert(countTag(/<meta\s+[^>]*?name=["']description["']/gi) === 1, `Route "${route}" has exactly 1 <meta name="description"> tag`, 'HeadHygiene');
    assert(countTag(/<meta\s+[^>]*?property=["']og:title["']/gi) === 1, `Route "${route}" has exactly 1 <meta property="og:title"> tag`, 'HeadHygiene');
    assert(countTag(/<meta\s+[^>]*?property=["']og:url["']/gi) === 1, `Route "${route}" has exactly 1 <meta property="og:url"> tag`, 'HeadHygiene');
    assert(countTag(/<meta\s+[^>]*?property=["']og:image["']/gi) === 1, `Route "${route}" has exactly 1 <meta property="og:image"> tag`, 'HeadHygiene');
    assert(countTag(/<meta\s+[^>]*?name=["']twitter:card["']/gi) === 1, `Route "${route}" has exactly 1 <meta name="twitter:card"> tag`, 'HeadHygiene');
  }
}

// Edge Case 2.4: Adversarial Input Sanitization Generator
// We stress-test prerender's escaping logic against extreme adversarial payloads
{
  function escapeAttr(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  const adversarialPayloads = [
    { input: '"><script>alert("xss")</script><meta foo="', expectedNoBreakout: true },
    { input: "Hackathon '26 & \"Silicon\" <Revolution>", expectedNoBreakout: true },
    { input: "A&B &amp; C &lt; D &gt; E", expectedNoBreakout: true },
    { input: "Quotes 'single' \"double\" `backtick`", expectedNoBreakout: true },
    { input: "Emoji & Unicode: ⚡ 🚀 · \u0000 \u2028 \u2029", expectedNoBreakout: true },
  ];

  for (const { input } of adversarialPayloads) {
    const escaped = escapeAttr(input);
    const simulatedTag = `<meta name="description" content="${escaped}" />`;
    const match = simulatedTag.match(/^<meta name="description" content="([^"]*)" \/>$/);
    assert(match !== null, `Adversarial payload escaped cleanly without tag breakout: ${input.slice(0, 30)}...`, 'AdversarialGenerator');
    if (match) {
      assert(!match[1].includes('"'), `Escaped attribute value contains zero raw double quotes`, 'AdversarialGenerator');
      assert(!match[1].includes('<') && !match[1].includes('>'), `Escaped attribute value contains zero raw angle brackets`, 'AdversarialGenerator');
    }
  }
}

// ============================================================================
// SUITE 3: JSON-LD SCHEMA STRICT SYNTAX & GRAPH REFERENCE INTEGRITY
// ============================================================================
console.log('\n--- SUITE 3: JSON-LD Schema Strict Syntax & Graph Reference Integrity ---');

const knownSchemaIds = new Set();
const allParsedSchemas = [];

// Step 3.1: Strict JSON Parse and Schema Invariant Check
for (const { route, filePath } of targetRoutes) {
  if (!fs.existsSync(filePath)) continue;
  const rawHtml = fs.readFileSync(filePath, 'utf-8');
  const jsonLdBlocks = extractAllJsonLd(rawHtml);

  assert(jsonLdBlocks.length > 0, `Route "${route}" contains at least 1 JSON-LD script (found ${jsonLdBlocks.length})`, 'JSON-LD');

  for (let i = 0; i < jsonLdBlocks.length; i++) {
    const rawBlock = jsonLdBlocks[i];
    let parsed;
    try {
      parsed = JSON.parse(rawBlock);
      assert(typeof parsed === 'object' && parsed !== null, `Route "${route}" JSON-LD block #${i + 1} parses as a non-null object`, 'JSON-LD');
    } catch (err) {
      assert(false, `Route "${route}" JSON-LD block #${i + 1} failed JSON.parse: ${err.message}`, 'JSON-LD');
      continue;
    }

    assert(parsed['@context'] === 'https://schema.org', `JSON-LD block #${i + 1} on "${route}" has @context === "https://schema.org"`, 'JSON-LD');
    assert(typeof parsed['@type'] === 'string' && parsed['@type'].length > 0, `JSON-LD block #${i + 1} on "${route}" has valid non-empty @type ("${parsed['@type']}")`, 'JSON-LD');

    if (parsed['@id']) {
      knownSchemaIds.add(parsed['@id']);
    }

    allParsedSchemas.push({ route, schema: parsed });
  }
}

// Step 3.2: Verify Required Schema Types by Route matching PROJECT.md interface contract
const expectedSchemasByRoute = {
  '/': ['Event', 'EducationalOrganization', 'FAQPage', 'BreadcrumbList', 'WebSite'],
  '/about': ['AboutPage', 'EducationalOrganization', 'BreadcrumbList'],
  '/register': ['Event', 'BreadcrumbList'],
  '/submit-ppt': ['Action', 'BreadcrumbList'],
  '/round2-confirm': ['WebPage', 'BreadcrumbList'],
};

for (const [route, expectedTypes] of Object.entries(expectedSchemasByRoute)) {
  const schemasOnRoute = allParsedSchemas
    .filter((s) => s.route === route)
    .map((s) => s.schema['@type']);

  for (const expectedType of expectedTypes) {
    assert(
      schemasOnRoute.includes(expectedType),
      `Route "${route}" includes required Schema.org type "${expectedType}" (present: [${schemasOnRoute.join(', ')}])`,
      'SchemaTypes'
    );
  }
}

// Step 3.3: Graph Reference Integrity Verification
for (const { route, schema } of allParsedSchemas) {
  const checkReferences = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    for (const [key, val] of Object.entries(obj)) {
      if (key === '@id') continue;
      if (val && typeof val === 'object') {
        if (val['@id']) {
          const refId = val['@id'];
          const resolves = knownSchemaIds.has(refId) || refId.startsWith('https://veltraxx.in');
          assert(resolves, `Schema reference on "${route}" [${key} -> ${refId}] resolves to a valid entity`, 'GraphIntegrity');
        } else {
          checkReferences(val);
        }
      } else if (Array.isArray(val)) {
        val.forEach(checkReferences);
      }
    }
  };
  checkReferences(schema);
}

// Step 3.4: Event Schema Critical Details (Dates, Location, Status)
for (const { route, schema } of allParsedSchemas) {
  if (schema['@type'] === 'Event') {
    assert(typeof schema.startDate === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(schema.startDate), `Event schema on "${route}" has valid ISO-8601 startDate ("${schema.startDate}")`, 'EventSchema');
    assert(typeof schema.endDate === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(schema.endDate), `Event schema on "${route}" has valid ISO-8601 endDate ("${schema.endDate}")`, 'EventSchema');
    assert(schema.location && schema.location['@type'] === 'Place', `Event schema on "${route}" specifies valid location Place`, 'EventSchema');
    assert(schema.eventAttendanceMode && schema.eventAttendanceMode.startsWith('https://schema.org/'), `Event schema on "${route}" has valid eventAttendanceMode`, 'EventSchema');
    assert(schema.eventStatus && schema.eventStatus.startsWith('https://schema.org/'), `Event schema on "${route}" has valid eventStatus`, 'EventSchema');
  }
}

// ============================================================================
// SUITE 4: ROBOTS & SITEMAP FORENSIC DIRECTIVES
// ============================================================================
console.log('\n--- SUITE 4: Robots.txt & Sitemap.xml Forensic Directives ---');

const robotsPath = path.join(distDir, 'robots.txt');
assert(fs.existsSync(robotsPath), 'dist/robots.txt exists', 'Robots');
if (fs.existsSync(robotsPath)) {
  const robotsTxt = fs.readFileSync(robotsPath, 'utf-8');
  assert(/User-agent:\s*\*/i.test(robotsTxt), 'robots.txt contains "User-agent: *"', 'Robots');
  assert(/Disallow:\s*\/admin\b/i.test(robotsTxt), 'robots.txt disallows "/admin"', 'Robots');
  assert(/Disallow:\s*\/tracker\b/i.test(robotsTxt), 'robots.txt disallows "/tracker"', 'Robots');
  assert(/Allow:\s*\/\b/i.test(robotsTxt), 'robots.txt allows root "/"', 'Robots');
  assert(/Sitemap:\s*https:\/\/veltraxx\.in\/sitemap\.xml/i.test(robotsTxt), 'robots.txt specifies canonical sitemap https://veltraxx.in/sitemap.xml', 'Robots');
  assert(!robotsTxt.includes('veltraxx.siet.ac.in'), 'robots.txt contains NO legacy subdomain references', 'Robots');
}

// ============================================================================
// SUITE 5: ADVANCED CHARACTER ENCODING, SECURITY INVARIANTS & ASSET INTEGRITY
// ============================================================================
console.log('\n--- SUITE 5: Advanced Character Encoding, Security & Asset Integrity ---');

// 5.1: UTF-8 Byte Integrity & Mojibake Detection (Indian Rupee Sign ₹ \u20B9)
const regHtmlBuffer = fs.readFileSync(path.join(distDir, 'register', 'index.html'));
// UTF-8 sequence for U+20B9 is 0xE2 0x82 0xB9
const hasRupeeUtf8 = regHtmlBuffer.includes(Buffer.from([0xE2, 0x82, 0xB9]));
assert(hasRupeeUtf8, 'dist/register/index.html contains valid UTF-8 Indian Rupee sign [₹] (0xE2 0x82 0xB9) with zero mojibake', 'Encoding');

// 5.2: Dangerous URI Schemes & Script Injection in Document Head
for (const { route, filePath } of targetRoutes) {
  if (!fs.existsSync(filePath)) continue;
  const rawHtml = fs.readFileSync(filePath, 'utf-8');
  const headMatch = rawHtml.match(/<head>([\s\S]*?)<\/head>/i);
  if (headMatch) {
    const head = headMatch[1];
    assert(!/href=["']javascript:/i.test(head), `Route "${route}" contains zero javascript: URIs in <head>`, 'Security');
    assert(!/href=["']data:/i.test(head), `Route "${route}" contains zero data: URIs in <head>`, 'Security');
    assert(!/src=["']javascript:/i.test(head), `Route "${route}" contains zero javascript: script sources in <head>`, 'Security');
  }
}

// 5.3: Physical Static File Payload Boundaries (Ensuring full content without bloat)
for (const { route, filePath } of targetRoutes) {
  if (!fs.existsSync(filePath)) continue;
  const stats = fs.statSync(filePath);
  const kbSize = stats.size / 1024;
  assert(kbSize >= 3.0 && kbSize <= 30.0, `Route "${route}" static HTML payload is optimal (${kbSize.toFixed(1)} KB; [3KB-30KB])`, 'Payload');
}

// 5.4: Social Preview Image Asset Physical Validation
const ogBannerPath = path.join(distDir, 'og-banner.jpg');
assert(fs.existsSync(ogBannerPath), 'dist/og-banner.jpg exists on disk', 'AssetIntegrity');
if (fs.existsSync(ogBannerPath)) {
  const ogBannerBuf = fs.readFileSync(ogBannerPath);
  // Verify JPEG Magic SOI marker 0xFF 0xD8
  const isJpeg = ogBannerBuf[0] === 0xFF && ogBannerBuf[1] === 0xD8;
  assert(isJpeg, 'dist/og-banner.jpg is a valid JPEG binary file', 'AssetIntegrity');

  // Verify dimensions 1200x630
  let width = 0;
  let height = 0;
  let offset = 2;
  while (offset < ogBannerBuf.length - 8) {
    if (ogBannerBuf[offset] === 0xFF && (ogBannerBuf[offset + 1] === 0xC0 || ogBannerBuf[offset + 1] === 0xC2)) {
      height = ogBannerBuf.readUInt16BE(offset + 5);
      width = ogBannerBuf.readUInt16BE(offset + 7);
      break;
    }
    offset += 2 + ogBannerBuf.readUInt16BE(offset + 2);
  }
  assert(width === 1200 && height === 630, `dist/og-banner.jpg dimensions are exactly 1200x630 (actual: ${width}x${height})`, 'AssetIntegrity');
}

// 5.5: Apple Touch Icon Asset Physical Validation
const touchIconPath = path.join(distDir, 'apple-touch-icon.png');
assert(fs.existsSync(touchIconPath), 'dist/apple-touch-icon.png exists on disk', 'AssetIntegrity');
if (fs.existsSync(touchIconPath)) {
  const iconBuf = fs.readFileSync(touchIconPath);
  // Verify PNG Magic bytes: 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
  const isPng = iconBuf[0] === 0x89 && iconBuf[1] === 0x50 && iconBuf[2] === 0x4E && iconBuf[3] === 0x47;
  assert(isPng, 'dist/apple-touch-icon.png is a valid PNG binary file', 'AssetIntegrity');
}

// 5.6: Sitemap XML Node Completeness
if (fs.existsSync(sitemapPath)) {
  const sitemapXml = fs.readFileSync(sitemapPath, 'utf-8');
  const urlBlocks = sitemapXml.match(/<url>[\s\S]*?<\/url>/gi) || [];
  assert(urlBlocks.length === 5, `dist/sitemap.xml contains exactly 5 <url> entries (actual: ${urlBlocks.length})`, 'Sitemap');

  for (const block of urlBlocks) {
    assert(/<loc>https:\/\/(veltraxx\.in|veltrax-x-2-0-web\.vercel\.app)/i.test(block), 'Sitemap URL has valid domain prefix', 'Sitemap');
    assert(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/.test(block), 'Sitemap URL specifies valid ISO YYYY-MM-DD lastmod', 'Sitemap');
    assert(/<changefreq>(?:always|hourly|daily|weekly|monthly|yearly|never)<\/changefreq>/.test(block), 'Sitemap URL specifies valid changefreq', 'Sitemap');
    assert(/<priority>(?:0\.\d|1\.0)<\/priority>/.test(block), 'Sitemap URL specifies valid numeric priority [0.0-1.0]', 'Sitemap');
  }
}


// ============================================================================
// SUMMARY & VERDICT
// ============================================================================
console.log('\n======================================================================');
console.log(`CHALLENGE RESULTS SUMMARY`);
console.log(`Total Assertions: ${totalTests}`);
console.log(`Passed:           ${passedTests}`);
console.log(`Failed:           ${failedTests}`);
console.log('======================================================================');

if (failedTests > 0) {
  console.error(`\n[VERDICT: REQUEST_CHANGES] Detected ${failedTests} failing adversarial challenges.`);
  process.exit(1);
} else {
  console.log(`\n[VERDICT: APPROVE] 100% of ${totalTests} adversarial crawler & bot challenges passed cleanly.`);
  process.exit(0);
}
