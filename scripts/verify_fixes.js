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

  async navigate(url, waitSelector = 'header, #main-content') {
    await this.send('Page.navigate', { url });
    await new Promise(r => setTimeout(r, 600));
    const start = Date.now();
    while (Date.now() - start < 6000) {
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
  console.log('VELTRAXX 2.0 VERIFICATION SUITE: SCROLL, TIMELINE, ABOUT & CH 2');
  console.log('Target: http://localhost:5173');
  console.log('================================================================\n');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9223',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--user-data-dir=d:\\tmp\\veltraxx_2.o\\.chrome_test_fixes',
    'about:blank'
  ]);

  let wsUrl = null;
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9223/json/list');
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
    console.error('Fatal: Could not find valid Chrome page target on port 9223');
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
    // TEST 1: HOME PAGE NAVIGATION & CHAPTER 2 VERIFICATION
    // -------------------------------------------------------------------------
    await cdp.setViewport(1280, 850);
    await cdp.navigate('http://localhost:5173');
    
    // Check Navbar links
    const navText = await cdp.eval(`Array.from(document.querySelectorAll('header nav a, header nav Link')).map(a => a.textContent.trim()).join(' | ')`);
    recordTest('Navbar', 'Includes "Our Journey" Link', navText.includes('Our Journey'), navText);

    // Check Chapter 2 Tracks
    const ch2Header = await cdp.eval(`document.querySelector('#tracks h2')?.textContent.trim()`);
    recordTest('Chapter 2', 'Header Rendered', Boolean(ch2Header), ch2Header);

    // Verify Chapter 2 tracks color palette (Zero purple)
    const purpleCount = await cdp.eval(`document.querySelectorAll('#tracks [class*="7B2FFF"], #tracks [class*="purple"]').length`);
    recordTest('Chapter 2', 'Zero AI-Purple in Tracks', purpleCount === 0, `Purple classes count: ${purpleCount}`);

    // Verify Asset Vault download cards (3 cards)
    const vaultCards = await cdp.eval(`document.querySelectorAll('#downloads a[download]').length`);
    recordTest('Chapter 2', '3 Official Asset Vault Download Cards', vaultCards === 3, `Found ${vaultCards} download cards`);

    await cdp.screenshot(path.join(screenshotsDir, 'ch2_tracks_vault.png'));

    // -------------------------------------------------------------------------
    // TEST 2: TIMELINE REAL-TIME SCROLL LINE & DYNAMIC NODES
    // -------------------------------------------------------------------------
    // Scroll down to timeline
    await cdp.eval(`document.getElementById('timeline')?.scrollIntoView({ behavior: 'instant', block: 'start' })`);
    await new Promise(r => setTimeout(r, 400));

    // Check line element exists with transform scaleY
    const lineTransform = await cdp.eval(`(() => {
      const line = document.querySelector('#timeline div[style*="scaleY"]');
      return line ? line.style.transform : 'none';
    })()`);
    recordTest('Timeline', 'Hardware Accelerated scaleY Line Exists', lineTransform.includes('scaleY'), lineTransform);

    // Scroll into the middle of timeline and verify line updates continuously
    await cdp.eval(`window.scrollBy({ top: 600, behavior: 'instant' })`);
    await new Promise(r => setTimeout(r, 200));

    const lineProgressScrolled = await cdp.eval(`(() => {
      const line = document.querySelector('#timeline div[style*="scaleY"]');
      return line ? line.style.transform : 'none';
    })()`);
    recordTest('Timeline', 'Line Progress Updates with Scroll Position', lineProgressScrolled !== 'scaleY(0)', lineProgressScrolled);

    // Check reached nodes lighting up
    const reachedNodeCount = await cdp.eval(`document.querySelectorAll('#timeline .timeline-event-card .scale-110, #timeline .timeline-event-card .scale-115').length`);
    recordTest('Timeline', 'Nodes Light Up Dynamically When Crossed', reachedNodeCount > 0, `Reached nodes: ${reachedNodeCount}`);

    await cdp.screenshot(path.join(screenshotsDir, 'ch4_timeline_scrolled.png'));

    // -------------------------------------------------------------------------
    // TEST 3: ABOUT PAGE (/about) FULL 7 SECTIONS
    // -------------------------------------------------------------------------
    await cdp.navigate('http://localhost:5173/about');
    await new Promise(r => setTimeout(r, 500));

    // Verify scroll position is at the top (Fix 3)
    const scrollYAtLoad = await cdp.eval(`window.scrollY`);
    recordTest('Route Scroll', 'Scroll-to-Top on Navigating to /about', scrollYAtLoad === 0, `scrollY: ${scrollYAtLoad}`);

    // Verify "Our Journey" has active state in Navbar
    const ourJourneyActive = await cdp.eval(`(() => {
      const link = Array.from(document.querySelectorAll('header nav a')).find(a => a.textContent.includes('Our Journey'));
      return link ? link.className : '';
    })()`);
    recordTest('Navbar', 'Active State Pill for "Our Journey" on /about', ourJourneyActive.includes('FFE500') || ourJourneyActive.includes('after:w-full'), ourJourneyActive);

    // Verify 7 Sections on About Page
    const sections = await cdp.eval(`(() => {
      return {
        hero: Boolean(document.getElementById('journey-hero')),
        workshops: Boolean(document.getElementById('workshops')),
        pipeline: Boolean(document.getElementById('training-pipeline')),
        studentProjects: Boolean(document.getElementById('student-projects')),
        industryConnect: Boolean(document.getElementById('industry-connect')),
        testimonials: Boolean(document.getElementById('testimonials')),
        leadership: Boolean(document.getElementById('leadership'))
      };
    })()`);

    recordTest('About Page', 'Section 1: Hero & Impact Metrics', sections.hero);
    recordTest('About Page', 'Section 2: Industry Tool Workshops', sections.workshops);
    recordTest('About Page', 'Section 3: Structured Training Pipeline', sections.pipeline);
    recordTest('About Page', 'Section 4: Student Silicon Showcase', sections.studentProjects);
    recordTest('About Page', 'Section 5: Industry Conclave & Mentorship', sections.industryConnect);
    recordTest('About Page', 'Section 6: Voices from the Lab', sections.testimonials);
    recordTest('About Page', 'Section 7: Leadership & Faculty Contacts', sections.leadership);

    await cdp.screenshot(path.join(screenshotsDir, 'about_page_top.png'));

    // Scroll to middle of About page to capture Student Silicon Showcase
    await cdp.eval(`document.getElementById('student-projects')?.scrollIntoView({ behavior: 'instant', block: 'start' })`);
    await new Promise(r => setTimeout(r, 400));
    await cdp.screenshot(path.join(screenshotsDir, 'about_page_projects.png'));

    // -------------------------------------------------------------------------
    // TEST 4: ACCESSIBILITY & ZERO EM-DASHES ON VISIBLE DOM
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
    // TEST 5: MOBILE RESPONSIVENESS (390px VIEWPORT)
    // -------------------------------------------------------------------------
    await cdp.setViewport(390, 844);
    await cdp.navigate('http://localhost:5173');
    await new Promise(r => setTimeout(r, 400));

    // Check for horizontal overflow
    const hasHorizontalOverflow = await cdp.eval(`document.documentElement.scrollWidth > window.innerWidth`);
    recordTest('Mobile Viewport', 'Zero Horizontal Overflow on 390px', !hasHorizontalOverflow, `scrollWidth: ${await cdp.eval('document.documentElement.scrollWidth')}, window: ${390}`);

    await cdp.screenshot(path.join(screenshotsDir, 'mobile_home_390px.png'));

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

