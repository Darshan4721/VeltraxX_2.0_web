// scripts/verify_latest_fixes.js
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9223;

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

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  const testDir = path.resolve('.chrome_test_verify');
  if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });

  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${testDir}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
  ]);

  await sleep(1500);

  try {
    const list = await get(`http://127.0.0.1:${PORT}/json/list`);
    const pageTarget = list.find(t => t.type === 'page') || list[0];
    const wsUrl = pageTarget.webSocketDebuggerUrl;

    // Node 22+ has global WebSocket
    const ws = new WebSocket(wsUrl);

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let msgId = 1;
    const callbacks = new Map();
    const consoleErrors = [];

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        if (msg.params.type === 'error') {
          consoleErrors.push(msg.params.args.map(a => a.value || a.description).join(' '));
        }
      }
      if (msg.id && callbacks.has(msg.id)) {
        const cb = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        cb(msg.result);
      }
    };

    const send = (method, params = {}) => {
      return new Promise((resolve) => {
        const id = msgId++;
        callbacks.set(id, resolve);
        ws.send(JSON.stringify({ id, method, params }));
      });
    };

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1366,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    // 1. Visit Home Page
    console.log('[Test] Navigating to http://localhost:5173/ ...');
    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await sleep(2000);

    // Verify Nav items order
    const navText = await send('Runtime.evaluate', {
      expression: `Array.from(document.querySelectorAll('header nav a, header nav Link')).map(el => el.textContent.trim()).join(' -> ')`
    });
    console.log('[Test] Navbar Desktop Items:', navText?.result?.value);

    // Screenshot Chapter 2
    const tracksRect = await send('Runtime.evaluate', {
      expression: `(() => {
        const el = document.getElementById('tracks');
        if (!el) return null;
        el.scrollIntoView();
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      })()`
    });
    await sleep(800);
    const snapTracks = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('screenshots_chapter2.png', Buffer.from(snapTracks.data, 'base64'));
    console.log('[Test] Captured screenshots_chapter2.png');

    // 2. Visit /admin
    console.log('[Test] Navigating to http://localhost:5173/admin ...');
    await send('Page.navigate', { url: 'http://localhost:5173/admin' });
    await sleep(1500);

    const adminHeader = await send('Runtime.evaluate', {
      expression: `(() => {
        const h = document.querySelector('header');
        return h ? h.innerText.replace(/\\n+/g, ' | ') : 'NO HEADER';
      })()`
    });
    console.log('[Test] Admin Header text:', adminHeader?.result?.value);

    const snapAdmin = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('screenshots_admin.png', Buffer.from(snapAdmin.data, 'base64'));
    console.log('[Test] Captured screenshots_admin.png');

    // 3. Visit /about
    console.log('[Test] Navigating to http://localhost:5173/about ...');
    await send('Page.navigate', { url: 'http://localhost:5173/about' });
    await sleep(2000);

    // Scroll to Faculty Pillars
    await send('Runtime.evaluate', {
      expression: `(() => {
        const h = Array.from(document.querySelectorAll('h3')).find(el => el.textContent.includes('DEPARTMENT FACULTY PILLARS'));
        if (h) h.scrollIntoView();
      })()`
    });
    await sleep(600);
    const snapFaculty = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('screenshots_faculty.png', Buffer.from(snapFaculty.data, 'base64'));
    console.log('[Test] Captured screenshots_faculty.png');

    // Scroll to Workshop 7
    await send('Runtime.evaluate', {
      expression: `(() => {
        const h = Array.from(document.querySelectorAll('h3')).find(el => el.textContent.includes('ONE-CREDIT COURSE'));
        if (h) h.scrollIntoView();
      })()`
    });
    await sleep(600);
    const snapWorkshop7 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('screenshots_workshop7.png', Buffer.from(snapWorkshop7.data, 'base64'));
    console.log('[Test] Captured screenshots_workshop7.png');

    console.log('[Test] Console errors during run:', consoleErrors);

    ws.close();
  } finally {
    chromeProc.kill();
  }
}

run().catch(console.error);
