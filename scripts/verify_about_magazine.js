import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.msgId = 1;
    this.callbacks = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && this.callbacks.has(data.id)) {
        const { resolve, reject } = this.callbacks.get(data.id);
        this.callbacks.delete(data.id);
        if (data.error) reject(new Error(data.error.message));
        else resolve(data.result);
      }
    };
  }

  send(method, params = {}) {
    const id = this.msgId++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval exception: ${res.exceptionDetails.text}`);
    }
    return res.result ? res.result.value : undefined;
  }

  async navigate(url, waitSelector = 'header, #main-content, #journey-hero') {
    await this.send('Page.navigate', { url });
    await new Promise(r => setTimeout(r, 600));
    const start = Date.now();
    while (Date.now() - start < 8000) {
      try {
        const found = await this.eval(`Boolean(document.querySelector('${waitSelector}'))`);
        if (found) break;
      } catch {}
      await new Promise(r => setTimeout(r, 200));
    }
    await new Promise(r => setTimeout(r, 400));
  }

  async setViewport(width, height) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 1024
    });
    await new Promise(r => setTimeout(r, 250));
  }

  async screenshot(filepath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(filepath, Buffer.from(res.data, 'base64'));
  }

  async close() {
    if (this.ws) this.ws.close();
  }
}

const results = [];
function recordTest(suite, name, passed, details = '') {
  results.push({ suite, name, passed, details });
  const status = passed ? 'PASS' : 'FAIL';
  console.log(`[${status}] [${suite}] ${name}${details ? ` -> ${details}` : ''}`);
}

async function run() {
  console.log('================================================================');
  console.log('VERIFICATION SUITE: /about FULL MAGAZINE OVERHAUL & UX CHECKS');
  console.log('Target: http://localhost:5173/about');
  console.log('================================================================\n');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9224',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--user-data-dir=d:\\tmp\\veltraxx_2.o\\.chrome_test_about',
    'about:blank'
  ]);

  let wsUrl = null;
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9224/json/list');
      if (res.ok) {
        const pages = await res.json();
        const page = pages.find(p => p.type === 'page' && !p.url.startsWith('chrome-extension://'));
        if (page && page.webSocketDebuggerUrl) {
          wsUrl = page.webSocketDebuggerUrl;
          break;
        }
      }
    } catch {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  if (!wsUrl) {
    console.error('Fatal: Could not find valid Chrome page target on port 9224');
    chromeProc.kill();
    process.exit(1);
  }

  const cdp = new CDPClient(wsUrl);
  await cdp.connect();
  await cdp.send('Page.enable');
  await cdp.send('DOM.enable');

  const screenshotsDir = path.resolve('screenshots');
  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

  try {
    // -------------------------------------------------------------------------
    // TEST 1: DESKTOP 1440px VIEWPORT & 10 SECTIONS VERIFICATION
    // -------------------------------------------------------------------------
    await cdp.setViewport(1440, 900);
    await cdp.navigate('http://localhost:5173/about');
    await new Promise(r => setTimeout(r, 500));

    // Page title and meta description
    const pageTitle = await cdp.eval(`document.title`);
    recordTest('Head', 'Document Title without Em-Dashes', !pageTitle.includes('\u2014') && pageTitle.includes('Our Journey'), pageTitle);

    // Section 1: Hero Banner & 6 Impact Counters
    const heroTitle = await cdp.eval(`document.querySelector('#journey-hero h1')?.textContent.trim()`);
    recordTest('Section 1', 'Hero Title Rendered', heroTitle.includes('Smaller Chips'), heroTitle);

    const counterCards = await cdp.eval(`document.querySelectorAll('#journey-hero .font-mono.tracking-tight').length`);
    recordTest('Section 1', '6 Impact Counter Cards', counterCards === 6, `Count: ${counterCards}`);

    // Section 2: Leadership Deck & 5 Tabs
    const leadershipExists = await cdp.eval(`Boolean(document.getElementById('leadership'))`);
    recordTest('Section 2', 'Leadership Section Present', leadershipExists);

    // Section 3: C2S & EDA Workshops (7 Cards)
    const workshopCount = await cdp.eval(`document.querySelectorAll('#workshops .bg-white.rounded-3xl').length`);
    recordTest('Section 3', '7 Structured Workshop Cards', workshopCount === 7, `Count: ${workshopCount}`);

    // Section 4: 17 Student Silicon Projects
    const projectCount = await cdp.eval(`document.querySelectorAll('#silicon-research .rounded-3xl').length`);
    recordTest('Section 4', '17 Student Research Cards (with highlight)', projectCount >= 17, `Count: ${projectCount}`);

    // Section 5: Flagship Events (VELTRAXX '26 1.0 & THE LOST SILICON)
    const eventsExists = await cdp.eval(`Boolean(document.getElementById('flagship-events'))`);
    recordTest('Section 5', 'Flagship Department Events Present', eventsExists);

    // Section 6: National Footprint (SEMICON India, VDAT, DIRV IIT Madras)
    const nationalCards = await cdp.eval(`document.querySelectorAll('#national-exposure .rounded-3xl').length`);
    recordTest('Section 6', 'National Exposure Bento Cards', nationalCards >= 6, `Count: ${nationalCards}`);

    // Section 7: Fellowships & Honours
    const honoursExists = await cdp.eval(`Boolean(document.getElementById('honours'))`);
    recordTest('Section 7', 'Samsung Fellows & Honours Present', honoursExists);

    // Section 8: Beyond Silicon (Sports, NCC, Cultural)
    const beyondSiliconExists = await cdp.eval(`Boolean(document.getElementById('beyond-silicon'))`);
    recordTest('Section 8', 'Beyond Silicon Sports/NCC Section Present', beyondSiliconExists);

    // Section 9: Student Clubs, Editorial Board & Voices from the Lab
    const clubsExists = await cdp.eval(`Boolean(document.getElementById('clubs-and-voices'))`);
    recordTest('Section 9', 'Clubs, Editorial Board & Voices Present', clubsExists);

    // Section 10: Magazine Vault & Registration CTA
    const downloadLink = await cdp.eval(`Boolean(document.querySelector('#about-cta a[download]'))`);
    recordTest('Section 10', 'Official Magazine Download Button', downloadLink);

    await cdp.screenshot(path.join(screenshotsDir, 'about_1440_hero.png'));

    // -------------------------------------------------------------------------
    // TEST 2: CONTENT_MAP SPOT CHECKS WITH INTERACTIVE TAB SWITCHING
    // -------------------------------------------------------------------------
    // Check initial text (Chairman tab & Sports tab active)
    let bodyText = await cdp.eval(`document.body.innerText`);
    recordTest('Content Ground Truth', 'Dr. S. Thangavelu', bodyText.includes('Dr. S. Thangavelu'));
    recordTest('Content Ground Truth', 'Dr. P. Dhilipkumar', bodyText.includes('Dr. P. Dhilipkumar'));
    recordTest('Content Ground Truth', 'Dharshan R.A (LBIST ALU)', bodyText.includes('Dharshan R.A'));
    recordTest('Content Ground Truth', 'Kavya M (CAN Controller)', bodyText.includes('Kavya M'));
    recordTest('Content Ground Truth', 'Sasmitha S.P (SNN Neuromorphic)', bodyText.includes('Sasmitha S.P'));
    recordTest('Content Ground Truth', 'Manova M (PQC Coprocessor)', bodyText.includes('Manova M'));
    recordTest('Content Ground Truth', 'Kavieshwara M (InterviewBot)', bodyText.includes('Kavieshwara M'));
    recordTest('Content Ground Truth', 'Abirami S.A (Pistol Shooting 8 Gold)', bodyText.includes('Abirami S.A'));
    recordTest('Content Ground Truth', 'Kamalesh V.K (Kho-Kho Gold)', bodyText.includes('Kamalesh V.K'));
    recordTest('Content Ground Truth', 'VELTRAXX 26 Version 1.0', bodyText.includes('VELTRAXX'));
    recordTest('Content Ground Truth', 'SEMICON India 2026 New Delhi', bodyText.includes('SEMICON India 2026'));
    recordTest('Content Ground Truth', 'Chips to Startup (C2S)', bodyText.includes('Chips to Startup'));

    // Switch Leadership to Secretary tab
    await cdp.eval(`Array.from(document.querySelectorAll('#leadership button')).find(b => b.textContent.includes('Secretary'))?.click()`);
    await new Promise(r => setTimeout(r, 200));
    bodyText = await cdp.eval(`document.body.innerText`);
    recordTest('Content Ground Truth', 'Er. Deepan Thangavel (Secretary Tab)', bodyText.includes('Er. Deepan Thangavel'));

    // Switch Leadership to Joint Secretary tab
    await cdp.eval(`Array.from(document.querySelectorAll('#leadership button')).find(b => b.textContent.includes('Joint Secretary'))?.click()`);
    await new Promise(r => setTimeout(r, 200));
    bodyText = await cdp.eval(`document.body.innerText`);
    recordTest('Content Ground Truth', 'Er. Sheelan Thangavelu (Joint Secretary Tab)', bodyText.includes('Er. Sheelan Thangavelu'));

    // Switch Beyond Silicon to NCC tab
    await cdp.eval(`Array.from(document.querySelectorAll('#beyond-silicon button')).find(b => b.textContent.includes('NCC Cadets'))?.click()`);
    await new Promise(r => setTimeout(r, 200));
    bodyText = await cdp.eval(`document.body.innerText`);
    recordTest('Content Ground Truth', 'CUO Yogesh S (NCC Cadets Tab)', bodyText.includes('CUO Yogesh S'));

    // -------------------------------------------------------------------------
    // TEST 3: ACCESSIBLE LIGHTBOX TEST
    // -------------------------------------------------------------------------
    // Open first gallery image
    const clickedFirst = await cdp.eval(`(() => {
      const btn = document.querySelector('#clubs-and-voices button[aria-label*="Open photo"]');
      if (btn) { btn.click(); return true; }
      return false;
    })()`);
    await new Promise(r => setTimeout(r, 400));

    const lightboxOpen = await cdp.eval(`Boolean(document.querySelector('div[role="dialog"]'))`);
    recordTest('Lightbox', 'Lightbox Opens on Click', lightboxOpen);

    // Test body scroll locked
    const bodyOverflow = await cdp.eval(`document.body.style.overflow`);
    recordTest('Lightbox', 'Body Scroll Locked while Open', bodyOverflow === 'hidden', `overflow: ${bodyOverflow}`);

    // Close with X button
    await cdp.eval(`document.querySelector('div[role="dialog"] button[aria-label="Close image viewer"]')?.click()`);
    await new Promise(r => setTimeout(r, 300));

    const lightboxClosed = await cdp.eval(`!Boolean(document.querySelector('div[role="dialog"]'))`);
    recordTest('Lightbox', 'Lightbox Closes on Close Button', lightboxClosed);

    const bodyOverflowRestored = await cdp.eval(`document.body.style.overflow`);
    recordTest('Lightbox', 'Body Scroll Restored on Close', bodyOverflowRestored === '', `overflow: "${bodyOverflowRestored}"`);

    // -------------------------------------------------------------------------
    // TEST 4: STRICT ZERO EM-DASHES GATE
    // -------------------------------------------------------------------------
    const emDashCount = await cdp.eval(`(() => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let count = 0;
      let node;
      while ((node = walker.nextNode())) {
        if (node.nodeValue && node.nodeValue.includes('\u2014')) {
          count++;
        }
      }
      return count;
    })()`);
    recordTest('Anti-Slop', 'Strictly Zero Em-Dashes in Visible UI Text', emDashCount === 0, `Count: ${emDashCount}`);

    // -------------------------------------------------------------------------
    // TEST 5: MOBILE VIEWPORTS (360px, 375px, 414px) RESPONSIVENESS
    // -------------------------------------------------------------------------
    for (const width of [360, 375, 414]) {
      await cdp.setViewport(width, 800);
      await new Promise(r => setTimeout(r, 300));
      const hasOverflow = await cdp.eval(`document.documentElement.scrollWidth > window.innerWidth`);
      recordTest('Mobile Viewport', `Zero Horizontal Overflow at ${width}px`, !hasOverflow, `scrollWidth: ${await cdp.eval('document.documentElement.scrollWidth')}, innerWidth: ${width}`);
    }

    await cdp.screenshot(path.join(screenshotsDir, 'about_mobile_360.png'));

  } catch (err) {
    console.error('Test execution error:', err);
    recordTest('Execution', 'Test Suite Runner', false, err.message);
  } finally {
    await cdp.close();
    chromeProc.kill();
  }

  console.log('\n================================================================');
  console.log('SUMMARY OF RESULTS:');
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`TOTAL: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('================================================================');
}

run();
