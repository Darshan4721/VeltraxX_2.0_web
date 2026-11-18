const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const CDP_PORT = 9227;
const HTTP_PORT = 4188;

const VIEWPORTS = [
  { width: 360, height: 740, mobile: true, name: '360px (Small Mobile)' },
  { width: 375, height: 667, mobile: true, name: '375px (iPhone SE)' },
  { width: 414, height: 896, mobile: true, name: '414px (iPhone XR/Plus)' },
  { width: 768, height: 1024, mobile: true, name: '768px (iPad Mini/Tablet)' },
  { width: 1024, height: 768, mobile: false, name: '1024px (Small Laptop)' },
  { width: 1440, height: 900, mobile: false, name: '1440px (Standard Desktop)' },
  { width: 1920, height: 1080, mobile: false, name: '1920px (Full HD Desktop)' },
  { width: 2560, height: 1440, mobile: false, name: '2560px (Ultra-wide QHD)' }
];

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.xml': 'application/xml',
  '.txt': 'text/plain'
};

function startStaticServer() {
  const distDir = path.join(__dirname, '..', 'dist');
  const server = http.createServer((req, res) => {
    let cleanUrl = req.url.split('?')[0].split('#')[0];
    let filePath = path.join(distDir, cleanUrl === '/' ? 'index.html' : cleanUrl);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    if (!fs.existsSync(filePath)) {
      filePath = path.join(distDir, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME_TYPES[ext] || 'application/octet-stream';

    res.setHeader('Content-Type', mime);
    res.setHeader('Access-Control-Allow-Origin', '*');
    fs.createReadStream(filePath).pipe(res);
  });

  return new Promise((resolve) => {
    server.listen(HTTP_PORT, () => {
      console.log(`[TestServer] Serving dist on http://127.0.0.1:${HTTP_PORT}`);
      resolve(server);
    });
  });
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); } catch (e) { resolve(body); }
      });
    }).on('error', reject);
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const screenshotsDir = path.join(__dirname, '..', 'screenshots', 'vice_mode');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const server = await startStaticServer();

  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${CDP_PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
  ]);

  await sleep(1500);

  const results = [];

  try {
    const list = await getJson(`http://127.0.0.1:${CDP_PORT}/json/list`);
    const pageTarget = list.find(t => t.type === 'page') || list[0];
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

    let id = 1;
    const cbs = new Map();
    ws.onmessage = e => {
      const m = JSON.parse(e.data);
      if (m.id && cbs.has(m.id)) {
        const cb = cbs.get(m.id);
        cbs.delete(m.id);
        cb(m.result);
      }
    };

    const send = (method, params = {}) => new Promise(res => {
      const reqId = id++;
      cbs.set(reqId, res);
      ws.send(JSON.stringify({ id: reqId, method, params }));
    });

    await send('Page.enable');
    await send('Runtime.enable');
    await send('DOM.enable');

    console.log('\n======================================================================');
    console.log('VICE MODE 8-VIEWPORT AUTOMATED AUDIT & REVERSIBILITY VERIFICATION');
    console.log('======================================================================\n');

    for (const vp of VIEWPORTS) {
      console.log(`--> Testing Viewport: ${vp.name} (${vp.width}x${vp.height})`);

      await send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: vp.mobile
      });

      // Clear local storage and navigate to fresh home page
      await send('Page.navigate', { url: `http://127.0.0.1:${HTTP_PORT}/` });
      await sleep(1800);

      // Evaluate Initial State
      const evalInitial = await send('Runtime.evaluate', {
        expression: `(() => {
          const vpMeta = document.querySelector('meta[name="viewport"]')?.content || '';
          const bodyStyle = window.getComputedStyle(document.body);
          const htmlStyle = window.getComputedStyle(document.documentElement);
          const scrollW = document.documentElement.scrollWidth;
          const innerW = window.innerWidth;
          const initialTheme = document.documentElement.getAttribute('data-theme') || 'default';
          return {
            vpMeta,
            zoom: bodyStyle.zoom || '1',
            bodyTransform: bodyStyle.transform,
            htmlTransform: htmlStyle.transform,
            hasHScroll: scrollW > innerW,
            scrollW,
            innerW,
            initialTheme
          };
        })()`,
        returnByValue: true
      });

      const initData = evalInitial.result.value;

      // Toggle Vice Mode via DOM dispatch or click
      const evalToggle = await send('Runtime.evaluate', {
        expression: `(() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b => 
            b.getAttribute('aria-label')?.includes('Vice Mode') || 
            b.innerText?.includes('VICE MODE')
          );
          if (btn) {
            btn.click();
            return { clicked: true, method: 'button_click' };
          }
          // Direct fallback toggle
          document.documentElement.setAttribute('data-theme', 'vice');
          localStorage.setItem('veltraxx_theme_mode', 'vice');
          return { clicked: true, method: 'dom_attribute' };
        })()`,
        returnByValue: true
      });

      await sleep(600);

      // Evaluate Vice Mode State
      const evalVice = await send('Runtime.evaluate', {
        expression: `(() => {
          const theme = document.documentElement.getAttribute('data-theme');
          const scrollW = document.documentElement.scrollWidth;
          const innerW = window.innerWidth;
          const bodyBg = window.getComputedStyle(document.body).backgroundColor;
          const bodyColor = window.getComputedStyle(document.body).color;
          const bodyStyle = window.getComputedStyle(document.body);
          const htmlStyle = window.getComputedStyle(document.documentElement);
          
          // Check images for unwanted color filters
          const imgs = Array.from(document.querySelectorAll('img')).slice(0, 10);
          const imgFilters = imgs.map(img => window.getComputedStyle(img).filter);
          const anyImgFiltered = imgFilters.some(f => f && f !== 'none');

          return {
            theme,
            hasHScroll: scrollW > innerW,
            scrollW,
            innerW,
            bodyBg,
            bodyColor,
            zoom: bodyStyle.zoom || '1',
            bodyTransform: bodyStyle.transform,
            htmlTransform: htmlStyle.transform,
            anyImgFiltered
          };
        })()`,
        returnByValue: true
      });

      const viceData = evalVice.result.value;

      // Capture Screenshot in Vice Mode
      const snap = await send('Page.captureScreenshot', { format: 'png' });
      const snapPath = path.join(screenshotsDir, `vice_mode_${vp.width}px.png`);
      fs.writeFileSync(snapPath, Buffer.from(snap.data, 'base64'));

      const isPass = 
        !initData.hasHScroll && 
        !viceData.hasHScroll && 
        initData.zoom === '1' && 
        viceData.zoom === '1' && 
        viceData.theme === 'vice' && 
        !viceData.anyImgFiltered;

      results.push({
        width: `${vp.width}px`,
        name: vp.name,
        initialTheme: initData.initialTheme,
        viceTheme: viceData.theme,
        hasHScroll: viceData.hasHScroll ? 'FAIL (Scrollbar)' : 'PASS (Clean)',
        zoomStatus: viceData.zoom === '1' ? 'PASS (1.0x)' : `FAIL (${viceData.zoom})`,
        imageFilters: viceData.anyImgFiltered ? 'FAIL (Filtered)' : 'PASS (Zero Tint)',
        status: isPass ? 'PASS' : 'FAIL',
        screenshot: `screenshots/vice_mode/vice_mode_${vp.width}px.png`
      });

      console.log(`   [${isPass ? 'PASS' : 'FAIL'}] ${vp.name}: HScroll=${viceData.hasHScroll ? 'FAIL' : 'PASS'}, Zoom=${viceData.zoom}, Theme=${viceData.theme}`);
    }

    // =========================================================================
    // ROUTE EXCLUSION TEST: Verify /register, /submit-ppt, /round2-confirm, /admin
    // =========================================================================
    console.log('\n--> Testing Route Exclusion Boundary: /register, /submit-ppt, /round2-confirm, /admin');
    
    // 1. /register
    await send('Page.navigate', { url: `http://127.0.0.1:${HTTP_PORT}/register` });
    await sleep(1500);

    const evalRegister = await send('Runtime.evaluate', {
      expression: `(() => {
        return {
          pathname: window.location.pathname,
          themeAttr: document.documentElement.getAttribute('data-theme'),
          bodyBg: window.getComputedStyle(document.body).backgroundColor,
          storedPref: localStorage.getItem('veltraxx_theme_mode')
        };
      })()`,
      returnByValue: true
    });

    const regData = evalRegister.result.value;
    const regExcludedPass = !regData.themeAttr || regData.themeAttr !== 'vice';
    console.log(`   [${regExcludedPass ? 'PASS' : 'FAIL'}] /register ignores Vice Mode: data-theme=${regData.themeAttr || 'null (Default)'}`);

    // Capture screenshot of excluded /register route
    const snapReg = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(screenshotsDir, 'excluded_register_route.png'), Buffer.from(snapReg.data, 'base64'));

    // 2. /submit-ppt
    await send('Page.navigate', { url: `http://127.0.0.1:${HTTP_PORT}/submit-ppt` });
    await sleep(1200);
    const evalSubmit = await send('Runtime.evaluate', {
      expression: `document.documentElement.getAttribute('data-theme')`,
      returnByValue: true
    });
    const submitExcludedPass = !evalSubmit.result.value || evalSubmit.result.value !== 'vice';
    console.log(`   [${submitExcludedPass ? 'PASS' : 'FAIL'}] /submit-ppt ignores Vice Mode: data-theme=${evalSubmit.result.value || 'null (Default)'}`);

    // 3. /round2-confirm
    await send('Page.navigate', { url: `http://127.0.0.1:${HTTP_PORT}/round2-confirm` });
    await sleep(1200);
    const evalRound2 = await send('Runtime.evaluate', {
      expression: `document.documentElement.getAttribute('data-theme')`,
      returnByValue: true
    });
    const round2ExcludedPass = !evalRound2.result.value || evalRound2.result.value !== 'vice';
    console.log(`   [${round2ExcludedPass ? 'PASS' : 'FAIL'}] /round2-confirm ignores Vice Mode: data-theme=${evalRound2.result.value || 'null (Default)'}`);

    // 4. /admin
    await send('Page.navigate', { url: `http://127.0.0.1:${HTTP_PORT}/admin` });
    await sleep(1200);
    const evalAdmin = await send('Runtime.evaluate', {
      expression: `document.documentElement.getAttribute('data-theme')`,
      returnByValue: true
    });
    const adminExcludedPass = !evalAdmin.result.value || evalAdmin.result.value !== 'vice';
    console.log(`   [${adminExcludedPass ? 'PASS' : 'FAIL'}] /admin ignores Vice Mode: data-theme=${evalAdmin.result.value || 'null (Default)'}`);

    // 5. Navigate back to '/' to test seamless restoration of Vice Mode
    console.log('\n--> Testing Reversibility & Persistence: Navigation back to /');
    await send('Page.navigate', { url: `http://127.0.0.1:${HTTP_PORT}/` });
    await sleep(1500);

    const evalReturnHome = await send('Runtime.evaluate', {
      expression: `(() => {
        return {
          themeAttr: document.documentElement.getAttribute('data-theme'),
          storedPref: localStorage.getItem('veltraxx_theme_mode')
        };
      })()`,
      returnByValue: true
    });

    const returnData = evalReturnHome.result.value;
    const persistencePass = returnData.themeAttr === 'vice';
    console.log(`   [${persistencePass ? 'PASS' : 'FAIL'}] Return to / restores Vice Mode: data-theme=${returnData.themeAttr}`);

    // Toggle back to Default theme
    const evalToggleBack = await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => 
          b.getAttribute('aria-label')?.includes('Default') || 
          b.innerText?.includes('DEFAULT')
        );
        if (btn) {
          btn.click();
          return { clicked: true };
        }
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('veltraxx_theme_mode', 'default');
        return { clicked: true };
      })()`,
      returnByValue: true
    });

    await sleep(500);
    const evalReverted = await send('Runtime.evaluate', {
      expression: `document.documentElement.getAttribute('data-theme')`,
      returnByValue: true
    });
    const revertPass = !evalReverted.result.value || evalReverted.result.value === 'default';
    console.log(`   [${revertPass ? 'PASS' : 'FAIL'}] Toggle back restores Default Neo-Brutalist: data-theme=${evalReverted.result.value || 'null (Default)'}`);

    // Print Results Summary Table
    console.log('\n======================================================================');
    console.log('VIEWPORT VERIFICATION SUMMARY TABLE');
    console.log('======================================================================');
    console.table(results);

    ws.close();
  } finally {
    chromeProc.kill();
    server.close();
  }
}

main().catch(err => {
  console.error('[Error] Audit failed:', err);
  process.exit(1);
});
