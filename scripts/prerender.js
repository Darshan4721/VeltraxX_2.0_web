/**
 * VELTRAXX 2.0 · Post-Build Static Prerendering Pipeline
 * 
 * Executes immediately following `vite build` in package.json.
 * 1. Reads `dist/index.html` as the compiled production HTML template.
 * 2. Injects route-specific <title>, <meta>, <link rel="canonical">, OpenGraph, Twitter Cards,
 *    and valid Schema.org JSON-LD structured data for the 5 canonical routes:
 *    - / (Home)
 *    - /about (Our Journey)
 *    - /register (Team Registration)
 *    - /submit-ppt (48H PPT Blueprint Submission)
 *    - /round2-confirm (Round 2 Finalist Gatekeeper)
 * 3. Generates physical static HTML files:
 *    - dist/index.html
 *    - dist/about/index.html
 *    - dist/register/index.html
 *    - dist/submit-ppt/index.html
 *    - dist/round2-confirm/index.html
 * 4. Ensures public/robots.txt and public/sitemap.xml exist and are synchronized to dist/.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SEO_CONFIG, PRIVATE_PORTAL_SEO } from '../src/data/seoData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const templatePath = path.join(distDir, 'index.html');

function escapeAttr(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function prerenderRoute(templateHtml, route, data) {
  let html = templateHtml;

  // 1. Replace or inject <title>
  const titleRegex = /<title>[\s\S]*?<\/title>/i;
  const newTitle = `<title>${escapeHtml(data.title)}</title>`;
  if (titleRegex.test(html)) {
    html = html.replace(titleRegex, newTitle);
  } else {
    html = html.replace('</head>', `  ${newTitle}\n</head>`);
  }

  // 2. Helper to replace or inject meta tags by name or property
  const replaceOrInjectMeta = (attr, key, content) => {
    const regex = new RegExp(`<meta\\s+[^>]*?${attr}=["']${key}["'][^>]*?>`, 'gi');
    const newTag = `<meta ${attr}="${key}" content="${escapeAttr(content)}" />`;
    if (regex.test(html)) {
      html = html.replace(regex, newTag);
    } else {
      html = html.replace('</head>', `  ${newTag}\n</head>`);
    }
  };

  // Helper to replace or inject <link rel="...">
  const replaceOrInjectLink = (rel, href) => {
    const regex = new RegExp(`<link\\s+[^>]*?rel=["']${rel}["'][^>]*?>`, 'gi');
    const newTag = `<link rel="${rel}" href="${escapeAttr(href)}" />`;
    if (regex.test(html)) {
      html = html.replace(regex, newTag);
    } else {
      html = html.replace('</head>', `  ${newTag}\n</head>`);
    }
  };

  // 3. Inject standard SEO meta tags
  replaceOrInjectMeta('name', 'description', data.description);
  if (data.keywords) {
    replaceOrInjectMeta('name', 'keywords', data.keywords);
  }
  if (data.robots) {
    replaceOrInjectMeta('name', 'robots', data.robots);
  }
  replaceOrInjectLink('canonical', data.canonical);

  // 4. Inject Open Graph meta tags
  replaceOrInjectMeta('property', 'og:type', data.ogType || 'website');
  replaceOrInjectMeta('property', 'og:site_name', data.siteName || 'VELTRAXX 2.0');
  replaceOrInjectMeta('property', 'og:locale', 'en_IN');
  replaceOrInjectMeta('property', 'og:url', data.canonical);
  replaceOrInjectMeta('property', 'og:title', data.title);
  replaceOrInjectMeta('property', 'og:description', data.description);
  replaceOrInjectMeta('property', 'og:image', data.ogImage || SEO_CONFIG.defaultOgImage);
  replaceOrInjectMeta('property', 'og:image:width', '1200');
  replaceOrInjectMeta('property', 'og:image:height', '630');
  replaceOrInjectMeta('property', 'og:image:alt', data.ogImageAlt || 'VELTRAXX 2.0 National VLSI & Hardware Hackathon Banner');
  replaceOrInjectMeta('property', 'og:image:type', 'image/jpeg');

  // 5. Inject Twitter Card meta tags
  replaceOrInjectMeta('name', 'twitter:card', data.twitterCard || 'summary_large_image');
  replaceOrInjectMeta('name', 'twitter:title', data.title);
  replaceOrInjectMeta('name', 'twitter:description', data.description);
  replaceOrInjectMeta('name', 'twitter:image', data.ogImage || SEO_CONFIG.defaultOgImage);

  // 6. Remove existing <script type="application/ld+json"> blocks from the template head
  html = html.replace(/<script\s+type=["']application\/ld\+json["'][\s\S]*?<\/script>/gi, '');

  // 7. Inject individual Schema.org JSON-LD scripts for each schema definition
  const schemaScripts = data.schemas.map((schema) => {
    return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
  }).join('\n    ');

  html = html.replace('</head>', `    <!-- Structured Data: JSON-LD Schemas -->\n    ${schemaScripts}\n  </head>`);

  // 8. Inject noscript crawlable text skeleton inside <div id="root">
  const noscriptSkeleton = `<noscript><div style="padding: 2rem; font-family: sans-serif;"><h1>${escapeHtml(data.title)}</h1><p>${escapeHtml(data.description)}</p></div></noscript>`;
  html = html.replace('<div id="root"></div>', `<div id="root">${noscriptSkeleton}</div>`);

  return html;
}

async function runPrerender() {
  console.log('[PRERENDER] Starting post-build static HTML route generation...');

  if (!fs.existsSync(templatePath)) {
    console.error(`[PRERENDER ERROR] Build template not found at: ${templatePath}`);
    console.error('Ensure `vite build` has executed successfully before running prerender.');
    process.exit(1);
  }

  const templateHtml = fs.readFileSync(templatePath, 'utf-8');
  const allRouteEntries = [
    ...Object.entries(SEO_CONFIG.routes),
    ...Object.entries(PRIVATE_PORTAL_SEO || {}),
  ];
  let generatedCount = 0;

  for (const [route, routeData] of allRouteEntries) {
    const prerenderedHtml = prerenderRoute(templateHtml, route, routeData);

    let targetDir = distDir;
    let targetFile = path.join(distDir, 'index.html');

    if (route !== '/') {
      // Remove leading slash for subfolder naming
      const folderName = route.replace(/^\//, '');
      targetDir = path.join(distDir, folderName);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      targetFile = path.join(targetDir, 'index.html');
    }

    fs.writeFileSync(targetFile, prerenderedHtml, 'utf-8');
    generatedCount++;
    console.log(`[PRERENDER] Generated static file for route "${route}" -> ${path.relative(projectRoot, targetFile)}`);
  }

  // Synchronize robots.txt and sitemap.xml to dist if present in public
  const publicDir = path.join(projectRoot, 'public');
  const syncFiles = ['robots.txt', 'sitemap.xml'];

  for (const file of syncFiles) {
    const src = path.join(publicDir, file);
    const dest = path.join(distDir, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`[PRERENDER] Synchronized ${file} to dist/${file}`);
    } else {
      console.warn(`[PRERENDER WARN] Source file not found: ${src}`);
    }
  }

  console.log(`[PRERENDER SUCCESS] Generated ${generatedCount} static routes with complete meta tags and Schema.org graphs.`);
}

runPrerender().catch((err) => {
  console.error('[PRERENDER FATAL]', err);
  process.exit(1);
});
