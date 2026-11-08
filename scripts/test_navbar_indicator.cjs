const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9227;

function get(url) {
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

async function run() {
  const testDir = path.resolve('.chrome_test_nav');
  if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });

  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${testDir}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1440,900',
    'about:blank'
  ]);

  await sleep(1500);

  try {
    const list = await get(`http://127.0.0.1:${PORT}/json/list`);
    const pageTarget = list.find(t => t.type === 'page') || list[0];
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

    let id = 1;
    const cbs = new Map();
    const consoleErrors = [];

    ws.onmessage = e => {
      const m = JSON.parse(e.data);
      if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
        consoleErrors.push(m.params.args.map(a => a.value || a.description).join(' '));
      }
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
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1400,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    // 1. Visit Home
    console.log('[Test] Navigating to http://localhost:5173/ ...');
    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await sleep(2000);

    const itemsText = await send('Runtime.evaluate', {
      expression: `Array.from(document.querySelectorAll('header nav a, header nav Link')).map(el => el.textContent.trim()).join(' -> ')`
    });
    console.log('[Test] Navbar Sequence:', itemsText?.result?.value);

    // Check computed styles on nav lines
    const navDivs = await send('Runtime.evaluate', {
      expression: `(() => {
        const divs = Array.from(document.querySelectorAll('header nav > div'));
        return divs.map(d => ({
          classes: d.className,
          style: d.getAttribute('style'),
          computed: {
            opacity: window.getComputedStyle(d).opacity,
            width: window.getComputedStyle(d).width,
            transform: window.getComputedStyle(d).transform
          }
        }));
      })()`,
      returnByValue: true
    });
    console.log('[Test] Nav Line Elements on Load:', JSON.stringify(navDivs?.result?.value, null, 2));

    const snap1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/radar/.gemini/antigravity/brain/93d19e65-c140-4519-98aa-b50b1a9af512/nav_overview_active.png', Buffer.from(snap1.data, 'base64'));
    console.log('[Test] Saved nav_overview_active.png');

    // 2. Scroll to #downloads
    console.log('[Test] Scrolling to #downloads ...');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const el = document.getElementById('downloads');
        if (el) el.scrollIntoView({ behavior: 'instant' });
      })()`
    });
    await sleep(800);

    const activeUnderDownloads = await send('Runtime.evaluate', {
      expression: `(() => {
        const line = document.querySelector('header nav > div');
        return {
          style: line.getAttribute('style'),
          width: window.getComputedStyle(line).width,
          transform: window.getComputedStyle(line).transform
        };
      })()`,
      returnByValue: true
    });
    console.log('[Test] Active line when on #downloads:', JSON.stringify(activeUnderDownloads?.result?.value));

    const snap2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/radar/.gemini/antigravity/brain/93d19e65-c140-4519-98aa-b50b1a9af512/nav_downloads_active.png', Buffer.from(snap2.data, 'base64'));
    console.log('[Test] Saved nav_downloads_active.png');

    // 3. Navigate to /about
    console.log('[Test] Navigating to http://localhost:5173/about ...');
    await send('Page.navigate', { url: 'http://localhost:5173/about' });
    await sleep(2000);

    const activeUnderAbout = await send('Runtime.evaluate', {
      expression: `(() => {
        const line = document.querySelector('header nav > div');
        return {
          style: line.getAttribute('style'),
          width: window.getComputedStyle(line).width,
          transform: window.getComputedStyle(line).transform
        };
      })()`,
      returnByValue: true
    });
    console.log('[Test] Active line on /about:', JSON.stringify(activeUnderAbout?.result?.value));

    const snap3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/radar/.gemini/antigravity/brain/93d19e65-c140-4519-98aa-b50b1a9af512/nav_about_active.png', Buffer.from(snap3.data, 'base64'));
    console.log('[Test] Saved nav_about_active.png');

    console.log('[Test] Console errors:', consoleErrors);

    ws.close();
  } finally {
    chromeProc.kill();
  }
}

run().catch(console.error);
