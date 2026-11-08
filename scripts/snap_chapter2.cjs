const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9224;

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
  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${PORT}`,
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
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1366,
      height: 1000,
      deviceScaleFactor: 1,
      mobile: false
    });

    await send('Page.navigate', { url: 'http://localhost:5173/#tracks' });
    await sleep(2500);

    // Scroll directly to tracks bento cards
    await send('Runtime.evaluate', {
      expression: `(() => {
        const el = document.getElementById('tracks');
        if (el) {
          const rect = el.getBoundingClientRect();
          window.scrollTo(0, window.scrollY + rect.top);
        }
      })()`
    });
    await sleep(1000);

    const snap = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/radar/.gemini/antigravity/brain/93d19e65-c140-4519-98aa-b50b1a9af512/chapter2_redesigned.png', Buffer.from(snap.data, 'base64'));
    console.log('Saved chapter2_redesigned.png');

    ws.close();
  } finally {
    chromeProc.kill();
  }
}

run().catch(console.error);
