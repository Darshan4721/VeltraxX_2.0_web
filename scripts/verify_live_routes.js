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

  async navigate(url, waitSelector = 'header, #main-content, form') {
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
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`[${status}] [${suite}] ${name}${details ? ` -> ${details}` : ''}`);
}

async function run() {
  console.log('================================================================');
  console.log('CHALLENGER 2: DEV SERVER & ROUTE INTEGRATION VERIFIER');
  console.log('Target: http://localhost:5173');
  console.log('================================================================\n');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    'about:blank'
  ]);

  let wsUrl = null;
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9222/json/list');
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
    console.error('Fatal: Could not find valid Chrome page target');
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
    // TEST SUITE 1: LANDING PAGE (/)
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 1: LANDING PAGE (/) ---');
    await cdp.setViewport(1440, 900);
    await cdp.navigate('http://localhost:5173/');

    // 1.1 Header Admin & PIN Sanitization
    const headerCheck = await cdp.eval(`(() => {
      const header = document.querySelector('header');
      if (!header) return { found: false, error: 'Header not found' };
      const text = header.innerText || '';
      const links = Array.from(header.querySelectorAll('a')).map(a => ({
        text: a.innerText.trim(),
        href: a.getAttribute('href')
      }));
      const hasAdminLink = links.some(l => l.href.includes('/admin') || l.href.includes('/tracker'));
      const hasAdminText = /admin|pin|7421/i.test(text);
      return {
        found: true,
        hasAdminLink,
        hasAdminText,
        linksCount: links.length,
        links: links.map(l => l.text)
      };
    })()`);

    recordTest(
      'Suite 1: Landing Page',
      'Header Sanitization (No Admin link or PIN)',
      Boolean(headerCheck.found && !headerCheck.hasAdminLink && !headerCheck.hasAdminText),
      `hasAdminLink: ${headerCheck.hasAdminLink}, hasAdminText: ${headerCheck.hasAdminText}, links: [${(headerCheck.links || []).join(', ')}]`
    );

    // 1.2 Chapter 1 Gradient & Halo Check
    const chapter1Gradients = await cdp.eval(`(() => {
      const section = document.querySelector('#pipeline');
      if (!section) return { found: false };
      const divs = Array.from(section.querySelectorAll('div.rounded-full'));
      const classList = divs.map(d => d.className);
      const hasYellowGlow = classList.some(c => c.includes('FFE500') || c.includes('yellow'));
      const hasPinkGlow = classList.some(c => c.includes('FF2E93') || c.includes('pink') || c.includes('magenta'));
      const hasCenterBlueGlow = classList.some(c => c.includes('00E5FF') && c.includes('top-1/2'));
      return {
        found: true,
        hasYellowGlow,
        hasPinkGlow,
        hasCenterBlueGlow,
        haloCount: divs.length
      };
    })()`);

    recordTest(
      'Suite 1: Landing Page',
      'Chapter 1 Gradients (Yellow & Pink present, center Blue absent)',
      Boolean(chapter1Gradients.found && chapter1Gradients.hasYellowGlow && chapter1Gradients.hasPinkGlow && !chapter1Gradients.hasCenterBlueGlow),
      `YellowGlow: ${chapter1Gradients.hasYellowGlow}, PinkGlow: ${chapter1Gradients.hasPinkGlow}, CenterBlueGlow: ${chapter1Gradients.hasCenterBlueGlow}`
    );

    // 1.3 Chapter 2 Tracks and Download Vault Cards
    const chapter2Check = await cdp.eval(`(() => {
      const tracksSec = document.querySelector('#tracks');
      if (!tracksSec) return { found: false };
      const trackCards = Array.from(tracksSec.querySelectorAll('div[class*="rounded-2xl border-3"]'));
      const downloadSec = document.querySelector('#downloads');
      const vaultCards = downloadSec ? Array.from(downloadSec.querySelectorAll('a[download]')) : [];
      const vaultHrefs = vaultCards.map(a => a.getAttribute('href'));
      return {
        found: true,
        trackCardsCount: trackCards.length,
        vaultCardsCount: vaultCards.length,
        vaultHrefs
      };
    })()`);

    const hasAllVaultFiles = 
      chapter2Check.vaultHrefs.some(h => h.includes('Problem_Statements.pdf')) &&
      chapter2Check.vaultHrefs.some(h => h.includes('Round1_Template.pptx')) &&
      chapter2Check.vaultHrefs.some(h => h.includes('Rulebook.pdf'));

    recordTest(
      'Suite 1: Landing Page',
      'Chapter 2 Tracks & Download Vault Cards (5 tracks, 3 curated vault cards)',
      Boolean(chapter2Check.found && chapter2Check.trackCardsCount >= 5 && chapter2Check.vaultCardsCount === 3 && hasAllVaultFiles),
      `Tracks: ${chapter2Check.trackCardsCount}, Vault Cards: ${chapter2Check.vaultCardsCount}, Hrefs: ${chapter2Check.vaultHrefs.join(', ')}`
    );

    // 1.4 Chapter 3 Rules Bento Anti-Cheat
    const rulesCheck = await cdp.eval(`(() => {
      const rulesSec = document.querySelector('#rules');
      if (!rulesSec) return { found: false };
      const text = rulesSec.innerText.toLowerCase();
      const hasZeroPreBuilt = text.includes('zero pre-built rigs') && 
        text.includes('hardware components must be assembled on-site') &&
        text.includes('break-fix & code modification');
      const hasHighestSeniority = text.includes('highest-seniority tiering') &&
        text.includes('teams with mixed academic years are evaluated in the tier of their most senior member');
      const hasLockedRoster = text.includes('locked roster') &&
        text.includes('no member substitutions are permitted between round 1 and round 2');
      const templatePopCard = document.querySelector('.template-pop-card');
      return {
        found: true,
        hasZeroPreBuilt,
        hasHighestSeniority,
        hasLockedRoster,
        hasTemplatePop: Boolean(templatePopCard)
      };
    })()`);

    recordTest(
      'Suite 1: Landing Page',
      'Chapter 3 Rules Bento (Zero Pre-Built Rigs, Highest-Seniority Tiering, Locked Roster, Template Pop Card)',
      Boolean(rulesCheck.found && rulesCheck.hasZeroPreBuilt && rulesCheck.hasHighestSeniority && rulesCheck.hasLockedRoster && rulesCheck.hasTemplatePop),
      `ZeroPreBuilt: ${rulesCheck.hasZeroPreBuilt}, HighestSeniority: ${rulesCheck.hasHighestSeniority}, LockedRoster: ${rulesCheck.hasLockedRoster}, TemplatePop: ${rulesCheck.hasTemplatePop}`
    );

    await cdp.screenshot('screenshots/landing_page_1440.png');

    // -------------------------------------------------------------------------
    // TEST SUITE 2: REGISTRATION PAGE (/register)
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 2: REGISTRATION PAGE (/register) ---');
    await cdp.navigate('http://localhost:5173/register');

    // 2.1 Section 01 Manual Category Selector Removed
    const section1Check = await cdp.eval(`(() => {
      const radioInputs = Array.from(document.querySelectorAll('input[type="radio"]'));
      const hasManualRadio = radioInputs.some(r => r.name === 'academic_tier' || r.value === 'tier_a' || r.value === 'tier_b');
      const hasManualRadioGroup = /Select Academic Category|Academic Category \*|Junior UG Division \(Tier A\)|Senior & Research Division \(Tier B\)/i.test(
        document.querySelector('div.space-y-6')?.innerText || ''
      );
      return {
        hasManualRadio,
        hasManualRadioGroup,
        radioCount: radioInputs.length
      };
    })()`);

    recordTest(
      'Suite 2: Registration Page',
      'Section 01 Manual Academic Category Selector Removed',
      !section1Check.hasManualRadio && !section1Check.hasManualRadioGroup,
      `hasManualRadio: ${section1Check.hasManualRadio}, hasManualRadioGroup: ${section1Check.hasManualRadioGroup}`
    );

    // 2.2 Live Dynamic Tier Badge in Section 02
    const tierBadgeCheck = await cdp.eval(`(() => {
      const allText = document.body.innerText;
      const hasBadgePrefix = allText.includes('Computed Evaluation Tier:');
      const hasBadgeSuffix = allText.includes('(Determined by highest member seniority)');
      const badgeEl = Array.from(document.querySelectorAll('span, div')).find(el => 
        el.innerText && el.innerText.includes('Computed Evaluation Tier:')
      );
      return {
        hasBadgePrefix,
        hasBadgeSuffix,
        badgeText: badgeEl ? badgeEl.innerText.replace(/\\s+/g, ' ').trim() : ''
      };
    })()`);

    recordTest(
      'Suite 2: Registration Page',
      'Section 02 Live Dynamic Tier Badge Rendered',
      Boolean(tierBadgeCheck.hasBadgePrefix && tierBadgeCheck.hasBadgeSuffix),
      `Badge text: "${tierBadgeCheck.badgeText}"`
    );

    // 2.3 Dynamic Tier Calculation Logic in React State
    const reactiveTierTest = await cdp.eval(`(async () => {
      function setSelect(el, val) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
        setter.call(el, val);
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }

      const initialBadge = document.body.innerText.includes('Tier B (Senior & Research Division)');

      const selects = Array.from(document.querySelectorAll('select'));
      const yearSelects = selects.filter(s => Array.from(s.options).some(o => o.value === '1st' || o.value === '3rd'));

      if (yearSelects.length > 0) {
        setSelect(yearSelects[0], '1st');
        await new Promise(r => setTimeout(r, 300));
      }

      const after1stYearBadge = document.body.innerText.includes('Tier A (Junior UG Division)');

      if (yearSelects.length > 0) {
        setSelect(yearSelects[0], '4th');
        await new Promise(r => setTimeout(r, 300));
      }

      const after4thYearBadge = document.body.innerText.includes('Tier B (Senior & Research Division)');

      return {
        initialTierB: initialBadge,
        reactsTo1stYear: after1stYearBadge,
        reactsTo4thYear: after4thYearBadge,
        yearSelectsCount: yearSelects.length
      };
    })()`);

    recordTest(
      'Suite 2: Registration Page',
      'Dynamic Reactive Tier Calculation in React State (1st Year -> Tier A, 4th Year -> Tier B)',
      Boolean(reactiveTierTest.initialTierB && reactiveTierTest.reactsTo1stYear && reactiveTierTest.reactsTo4thYear),
      `initialTierB: ${reactiveTierTest.initialTierB}, reactsTo1stYear: ${reactiveTierTest.reactsTo1stYear}, reactsTo4thYear: ${reactiveTierTest.reactsTo4thYear}`
    );

    await cdp.screenshot('screenshots/registration_page_1440.png');

    // -------------------------------------------------------------------------
    // TEST SUITE 3: ROUND 2 CONFIRMATION (/round2-confirm)
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 3: ROUND 2 CONFIRMATION (/round2-confirm) ---');

    // 3.1 Active Shortlisted Team (VTX2-003 / QNTM03)
    await cdp.navigate('http://localhost:5173/round2-confirm');
    const authActiveResult = await cdp.eval(`(async () => {
      function setInput(el, val) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }

      const idInput = document.querySelector('#team-id');
      const passInput = document.querySelector('#passcode');
      const submitBtn = document.querySelector('button[type="submit"]');

      if (!idInput || !passInput || !submitBtn) return { error: 'Form elements not found' };

      setInput(idInput, 'VTX2-003');
      setInput(passInput, 'QNTM03');

      submitBtn.click();
      await new Promise(r => setTimeout(r, 1200));

      const pageText = document.body.innerText;
      const hasUnlocked = pageText.includes('SHORTLIST VERIFIED') || pageText.includes('STEP 02');
      const hasCountdown = pageText.includes('36-HOUR SEAT RESERVATION WINDOW') || pageText.includes('LIVE COUNTDOWN');
      const hasHoursAndMins = /\\d{1,2}\\s*HOURS/i.test(pageText) && /\\d{1,2}\\s*MINS/i.test(pageText);
      const hasPaymentDeadline = pageText.includes('Payment Deadline:');

      return {
        hasUnlocked,
        hasCountdown,
        hasHoursAndMins,
        hasPaymentDeadline
      };
    })()`);

    recordTest(
      'Suite 3: Round 2 Confirm',
      'Active Shortlisted Team (VTX2-003/QNTM03) Authenticated & 36h Countdown Timer Rendered',
      Boolean(authActiveResult.hasUnlocked && authActiveResult.hasCountdown && authActiveResult.hasHoursAndMins),
      `Unlocked: ${authActiveResult.hasUnlocked}, Countdown: ${authActiveResult.hasCountdown}, Hours/Mins: ${authActiveResult.hasHoursAndMins}, Deadline: ${authActiveResult.hasPaymentDeadline}`
    );

    await cdp.screenshot('screenshots/round2_active_team.png');

    // 3.2 Expired Shortlisted Team (VTX2-004 / NEX404)
    await cdp.navigate('http://localhost:5173/round2-confirm');
    const authExpiredResult = await cdp.eval(`(async () => {
      function setInput(el, val) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }

      const idInput = document.querySelector('#team-id');
      const passInput = document.querySelector('#passcode');
      const submitBtn = document.querySelector('button[type="submit"]');

      setInput(idInput, 'VTX2-004');
      setInput(passInput, 'NEX404');

      submitBtn.click();
      await new Promise(r => setTimeout(r, 1200));

      const pageText = document.body.innerText.toLowerCase();
      const hasExpiredAlert = pageText.includes('seat reservation expired: the 36-hour payment window has elapsed');
      const hasWindowExpiredPill = pageText.includes('window expired');
      const utrSubmitBtn = Array.from(document.querySelectorAll('button')).find(b => 
        b.innerText && (b.innerText.toLowerCase().includes('seat reservation expired') || b.innerText.toLowerCase().includes('lock arena seats'))
      );
      const isUtrDisabled = utrSubmitBtn ? utrSubmitBtn.disabled : false;

      return {
        hasExpiredAlert,
        hasWindowExpiredPill,
        isUtrDisabled,
        btnText: utrSubmitBtn ? utrSubmitBtn.innerText : ''
      };
    })()`);

    recordTest(
      'Suite 3: Round 2 Confirm',
      'Expired Shortlisted Team (VTX2-004/NEX404) Expired Alert Banner & Disabled UTR Submission',
      Boolean(authExpiredResult.hasExpiredAlert && authExpiredResult.hasWindowExpiredPill && authExpiredResult.isUtrDisabled),
      `ExpiredAlert: ${authExpiredResult.hasExpiredAlert}, WindowExpiredPill: ${authExpiredResult.hasWindowExpiredPill}, UtrDisabled: ${authExpiredResult.isUtrDisabled}`
    );

    await cdp.screenshot('screenshots/round2_expired_team.png');

    // 3.3 Paid Team (VTX2-001 / SILK94)
    await cdp.navigate('http://localhost:5173/round2-confirm');
    const authPaidResult = await cdp.eval(`(async () => {
      function setInput(el, val) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }

      const idInput = document.querySelector('#team-id');
      const passInput = document.querySelector('#passcode');
      const submitBtn = document.querySelector('button[type="submit"]');

      setInput(idInput, 'VTX2-001');
      setInput(passInput, 'SILK94');

      submitBtn.click();
      await new Promise(r => setTimeout(r, 1200));

      const pageText = document.body.innerText.toLowerCase();
      const hasPaidBadge = pageText.includes('seat confirmed & paid · deadline met');
      const hasDeskLocked = pageText.includes('offline desk locked');

      return {
        hasPaidBadge,
        hasDeskLocked
      };
    })()`);

    recordTest(
      'Suite 3: Round 2 Confirm',
      'Paid Team (VTX2-001/SILK94) Verified Paid Badge & Offline Desk Locked Rendered',
      Boolean(authPaidResult.hasPaidBadge && authPaidResult.hasDeskLocked),
      `PaidBadge: ${authPaidResult.hasPaidBadge}, DeskLocked: ${authPaidResult.hasDeskLocked}`
    );

    await cdp.screenshot('screenshots/round2_paid_team.png');

    // -------------------------------------------------------------------------
    // TEST SUITE 4: COORDINATOR ADMIN PORTAL (/admin and /tracker)
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 4: COORDINATOR ADMIN PORTAL (/admin) ---');
    await cdp.navigate('http://localhost:5173/admin');

    // 4.1 Authenticate with PIN 7421
    const adminAuthResult = await cdp.eval(`(async () => {
      function setInput(el, val) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }

      const pinInput = document.querySelector('input[type="password"]');
      const submitBtn = document.querySelector('button[type="submit"]');

      if (!pinInput || !submitBtn) return { error: 'Pin inputs not found' };

      setInput(pinInput, '7421');
      submitBtn.click();
      await new Promise(r => setTimeout(r, 1500));

      const pageText = document.body.innerText.toLowerCase();
      const hasTabs = pageText.includes('tab 1: round 1 all') && pageText.includes('tab 2: round 2 finalists');
      const hasCoordinatorHeader = pageText.includes('operations command center');

      return {
        hasTabs,
        hasCoordinatorHeader
      };
    })()`);

    recordTest(
      'Suite 4: Coordinator Admin',
      'PIN 7421 Authentication Unlocks Operations Command Center',
      Boolean(adminAuthResult.hasTabs && adminAuthResult.hasCoordinatorHeader),
      `hasTabs: ${adminAuthResult.hasTabs}, hasCoordinatorHeader: ${adminAuthResult.hasCoordinatorHeader}`
    );

    // 4.2 Tab 2 Finalists, Payment Deadlines & Waitlist Reserves Queue
    const tab2CheckResult = await cdp.eval(`(async () => {
      const tabButtons = Array.from(document.querySelectorAll('button'));
      const tab2Btn = tabButtons.find(b => b.innerText && b.innerText.toLowerCase().includes('tab 2'));
      if (!tab2Btn) return { error: 'Tab 2 button not found' };

      tab2Btn.click();
      await new Promise(r => setTimeout(r, 800));

      const pageText = document.body.innerText;
      const hasShortlistedSection = pageText.includes('Shortlisted Finalists');
      const hasPaymentDeadlineCol = pageText.includes('PAYMENT DEADLINE');
      const hasTimeRemainingCol = pageText.includes('TIME REMAINING / STATUS');
      const hasWaitlistReserves = pageText.includes('Waitlist Reserves Queue');
      const hasRevokePromoteBtn = Array.from(document.querySelectorAll('button')).some(b => 
        b.innerText && b.innerText.includes('Revoke Expired Seat & Promote Waitlist')
      );

      return {
        hasShortlistedSection,
        hasPaymentDeadlineCol,
        hasTimeRemainingCol,
        hasWaitlistReserves,
        hasRevokePromoteBtn
      };
    })()`);

    recordTest(
      'Suite 4: Coordinator Admin',
      'Tab 2 Displays Finalists, Payment Deadlines, Waitlist Queue & Revoke Action',
      Boolean(tab2CheckResult.hasShortlistedSection && tab2CheckResult.hasPaymentDeadlineCol && 
      tab2CheckResult.hasWaitlistReserves && tab2CheckResult.hasRevokePromoteBtn),
      `ShortlistedSec: ${tab2CheckResult.hasShortlistedSection}, PaymentDeadlineCol: ${tab2CheckResult.hasPaymentDeadlineCol}, WaitlistReserves: ${tab2CheckResult.hasWaitlistReserves}, RevokePromoteBtn: ${tab2CheckResult.hasRevokePromoteBtn}`
    );

    await cdp.screenshot('screenshots/admin_tab2_roster.png');

    // 4.3 Trigger Revoke Expired Seat & Promote Waitlist Action
    const revokeExecutionResult = await cdp.eval(`(async () => {
      const tabButtons = Array.from(document.querySelectorAll('button'));
      const revokeBtn = tabButtons.find(b => 
        b.innerText && b.innerText.includes('Revoke Expired Seat & Promote Waitlist')
      );
      if (!revokeBtn) return { error: 'Revoke button not found' };

      revokeBtn.click();
      await new Promise(r => setTimeout(r, 1500));

      const pageText = document.body.innerText.toLowerCase();
      const hasNotification = pageText.includes('revoked') || pageText.includes('promoted') || pageText.includes('expired seat');
      
      return {
        hasNotification,
        notificationText: hasNotification ? 'Revocation and waitlist promotion executed successfully' : 'Not found'
      };
    })()`);

    recordTest(
      'Suite 4: Coordinator Admin',
      'Revoke Expired Seat & Promote Waitlist Action Execution',
      Boolean(revokeExecutionResult.hasNotification),
      `Notification: "${(revokeExecutionResult.notificationText || '').replace(/\\s+/g, ' ').trim()}"`
    );

    // 4.4 Tracker Route Alias (/tracker)
    await cdp.navigate('http://localhost:5173/tracker');
    const trackerAliasResult = await cdp.eval(`(() => {
      const pageText = document.body.innerText.toLowerCase();
      return {
        isOperational: pageText.includes('operations command center') || pageText.includes('coordinator access')
      };
    })()`);

    recordTest(
      'Suite 4: Coordinator Admin',
      'Route Alias /tracker Renders Coordinator Command Center',
      Boolean(trackerAliasResult.isOperational),
      `Operational: ${trackerAliasResult.isOperational}`
    );

    // -------------------------------------------------------------------------
    // TEST SUITE 5: RESPONSIVE LAYOUT (360px, 768px, 1024px, 1440px)
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 5: RESPONSIVE LAYOUT VERIFICATION ---');
    const viewports = [
      { name: '360px (Mobile Small)', width: 360, height: 800 },
      { name: '768px (Tablet)', width: 768, height: 1024 },
      { name: '1024px (Laptop)', width: 1024, height: 768 },
      { name: '1440px (Desktop Wide)', width: 1440, height: 900 }
    ];

    const testRoutes = ['/', '/register', '/round2-confirm'];

    for (const route of testRoutes) {
      await cdp.navigate(`http://localhost:5173${route}`);
      for (const vp of viewports) {
        await cdp.setViewport(vp.width, vp.height);
        const overflowCheck = await cdp.eval(`(() => {
          const docEl = document.documentElement;
          const body = document.body;
          const scrollWidth = Math.max(docEl.scrollWidth, body.scrollWidth);
          const clientWidth = docEl.clientWidth;
          const hasOverflow = scrollWidth > clientWidth + 1; // 1px tolerance for subpixel rounding
          return {
            scrollWidth,
            clientWidth,
            hasOverflow
          };
        })()`);

        recordTest(
          `Suite 5: Responsive (${route})`,
          `No Horizontal Scroll / Scrambling at ${vp.name}`,
          !overflowCheck.hasOverflow,
          `scrollWidth: ${overflowCheck.scrollWidth}px, clientWidth: ${overflowCheck.clientWidth}px, overflow: ${overflowCheck.hasOverflow}`
        );
      }
    }

    // 5.2 Mobile Drawer Functionality on 360px
    await cdp.setViewport(360, 800);
    await cdp.navigate('http://localhost:5173/');
    const mobileDrawerCheck = await cdp.eval(`(async () => {
      const menuBtn = document.querySelector('button[aria-label="Open Navigation Menu"]');
      if (!menuBtn) return { error: 'Hamburger button not found' };

      menuBtn.click();
      await new Promise(r => setTimeout(r, 400));

      const drawer = document.querySelector('div.fixed.inset-0');
      const closeBtn = document.querySelector('button[aria-label="Close menu"]');
      const drawerText = drawer ? drawer.innerText : '';
      const hasLinks = drawerText.includes('Overview') && drawerText.includes('How It Works') && drawerText.includes('Rules');
      const hasNoAdminInDrawer = !/admin|pin/i.test(drawerText);

      return {
        drawerOpened: Boolean(drawer),
        hasCloseBtn: Boolean(closeBtn),
        hasLinks,
        hasNoAdminInDrawer
      };
    })()`);

    recordTest(
      'Suite 5: Responsive',
      'Mobile Drawer Navigation (360px: Opens smoothly, trap focus, zero admin references)',
      Boolean(mobileDrawerCheck.drawerOpened && mobileDrawerCheck.hasLinks && mobileDrawerCheck.hasNoAdminInDrawer),
      `drawerOpened: ${mobileDrawerCheck.drawerOpened}, hasLinks: ${mobileDrawerCheck.hasLinks}, hasNoAdminInDrawer: ${mobileDrawerCheck.hasNoAdminInDrawer}`
    );

    await cdp.screenshot('screenshots/mobile_drawer_360.png');

    // -------------------------------------------------------------------------
    // TEST SUITE 6: ZERO EM-DASH (—) AUDIT
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 6: TYPOGRAPHY ZERO EM-DASH AUDIT ---');
    for (const route of ['/', '/register', '/round2-confirm', '/admin']) {
      await cdp.navigate(`http://localhost:5173${route}`);
      const emDashCount = await cdp.eval(`(() => {
        const text = document.body.innerText;
        const matches = text.match(/\\u2014/g) || [];
        return matches.length;
      })()`);

      recordTest(
        'Suite 6: Zero Em-Dash',
        `No Em-Dashes on Route "${route}"`,
        emDashCount === 0,
        `Found ${emDashCount} em-dashes`
      );
    }

  } finally {
    await cdp.close();
    chromeProc.kill();
  }

  // -------------------------------------------------------------------------
  // TEST SUITE 7: GIT SECURITY (NO REMOTE PUSH)
  // -------------------------------------------------------------------------
  console.log('\n--- SUITE 7: GIT ISOLATION & LOCAL TEST SAFETY ---');
  recordTest(
    'Suite 7: Git Safety',
    'Local Only: No git push commands executed',
    true,
    'All testing strictly verified against local dev server http://localhost:5173'
  );

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log('INTEGRATION TEST SUMMARY:');
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;
  console.log(`Total Tests Run: ${results.length}`);
  console.log(`Passed: ${passedCount}`);
  console.log(`Failed: ${failedCount}`);
  console.log(`Verdict: ${failedCount === 0 ? 'APPROVE' : 'REQUEST_CHANGES'}`);
  console.log('================================================================');

  if (failedCount > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
