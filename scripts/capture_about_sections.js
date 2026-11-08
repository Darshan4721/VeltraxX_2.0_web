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
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval exception: ${res.exceptionDetails.text}`);
    }
    return res.result ? res.result.value : undefined;
  }

  async navigate(url, waitSelector = '#journey-hero') {
    await this.send('Page.navigate', { url });
    await new Promise((r) => setTimeout(r, 600));
    const start = Date.now();
    while (Date.now() - start < 8000) {
      try {
        const found = await this.eval(`Boolean(document.querySelector('${waitSelector}'))`);
        if (found) break;
      } catch {}
      await new Promise((r) => setTimeout(r, 200));
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  async setViewport(width, height) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false,
    });
  }

  async screenshotElement(selector, filePath) {
    const box = await this.eval(`
      (() => {
        const el = document.querySelector('${selector}');
        if (!el) return null;
        el.scrollIntoView({ block: 'center' });
        const r = el.getBoundingClientRect();
        return { x: r.left, y: r.top + window.scrollY, width: r.width, height: r.height };
      })()
    `);

    if (!box) {
      console.log('Element not found:', selector);
      return;
    }

    await new Promise((r) => setTimeout(r, 300));

    const res = await this.send('Page.captureScreenshot', {
      format: 'png',
      clip: {
        x: box.x,
        y: box.y,
        width: box.width,
        height: Math.min(box.height, 1200),
        scale: 1,
      },
    });

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
    console.log(`Saved screenshot of ${selector} to ${filePath}`);
  }
}

async function run() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = 'D:\\tmp\\veltraxx_2.o\\.chrome_test_sections';
  const port = 9226;

  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${userDataDir}`,
    'about:blank',
  ]);

  try {
    let wsUrl = null;
    for (let i = 0; i < 40; i++) {
      try {
        const res = await fetch(`http://127.0.0.1:${port}/json/list`);
        if (res.ok) {
          const pages = await res.json();
          const page = pages.find((p) => p.type === 'page' && !p.url.startsWith('chrome-extension://'));
          if (page && page.webSocketDebuggerUrl) {
            wsUrl = page.webSocketDebuggerUrl;
            break;
          }
        }
      } catch {
        await new Promise((r) => setTimeout(r, 250));
      }
    }

    const client = new CDPClient(wsUrl);
    await client.connect();
    await client.send('Page.enable');
    await client.setViewport(1440, 900);
    await client.navigate('http://localhost:5173/about');

    await client.screenshotElement('#journey-hero', 'screenshots/sections/s1_hero.png');
    await client.screenshotElement('#leadership', 'screenshots/sections/s3_leadership_dark.png');
    await client.screenshotElement('#workshops', 'screenshots/sections/s4_workshops_color.png');
    await client.screenshotElement('#silicon-research', 'screenshots/sections/s5_silicon.png');
    await client.screenshotElement('#competitions', 'screenshots/sections/s6_competitions.png');
    await client.screenshotElement('#honours', 'screenshots/sections/s8_honours_dark.png');
    await client.screenshotElement('#beyond-silicon', 'screenshots/sections/s9_beyond_color.png');
    await client.screenshotElement('#connect', 'screenshots/sections/s11_closing_cta.png');

    console.log('All section screenshots captured successfully!');
  } finally {
    chromeProc.kill('SIGKILL');
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

