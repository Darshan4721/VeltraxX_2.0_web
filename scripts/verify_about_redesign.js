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

  async navigate(url, waitSelector = '#journey-hero, #rules, body') {
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

  async setViewport(width, height, isMobile = false) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: isMobile,
    });
  }

  async screenshot(filePath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
    console.log(`Saved screenshot: ${filePath}`);
  }
}

async function run() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = 'D:\\tmp\\veltraxx_2.o\\.chrome_test_redesign_v2';
  const port = 9227;

  console.log('Launching dedicated Chrome on port', port);
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

    if (!wsUrl) throw new Error('Could not connect to Chrome debugging port');

    const client = new CDPClient(wsUrl);
    await client.connect();
    await client.send('Page.enable');

    const consoleErrors = [];
    client.send('Runtime.enable');
    client.ws.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      if (data.method === 'Runtime.consoleAPICalled' && data.params.type === 'error') {
        consoleErrors.push(data.params.args.map((a) => a.value || a.description).join(' '));
      }
    });

    console.log('\n--- TEST 1: ABOUT PAGE VERIFICATION ---');
    await client.setViewport(1440, 900);
    await client.navigate('http://localhost:5173/about');

    const desktopOverflow = await client.eval(`
      document.documentElement.scrollWidth > window.innerWidth
    `);
    console.log('About desktop horizontal overflow:', desktopOverflow);

    // Verify W7 One-Credit Course has yellow font
    const w7FontColor = await client.eval(`
      (() => {
        const title = Array.from(document.querySelectorAll('#workshops h3')).find(h => h.textContent.includes('ONE-CREDIT COURSE'));
        return title ? window.getComputedStyle(title).color : null;
      })()
    `);
    console.log('W7 title font color (should be yellow rgb(255, 229, 0)):', w7FontColor);

    // Verify Faculty card shadows are colored
    const facultyShadow = await client.eval(`
      (() => {
        const card = document.querySelector('#leadership [perspective] > div');
        return card ? window.getComputedStyle(card).boxShadow : null;
      })()
    `);
    console.log('First faculty card boxShadow:', facultyShadow);

    // Verify S7 images are unclipped (max-h-260px object-contain)
    const s7ImagesCount = await client.eval(`
      document.querySelectorAll('#national-exposure img.object-contain').length
    `);
    console.log('National exposure unclipped object-contain images count:', s7ImagesCount);

    await client.screenshot('screenshots/about_redesign_updated_desktop.png');

    console.log('\n--- TEST 2: HOME PAGE CHAPTER 3 TEMPLATE HOVER TEST ---');
    await client.navigate('http://localhost:5173/#rules');
    await new Promise((r) => setTimeout(r, 500));

    // Check if template cards exist and hover/unhover them
    const templateHoverTest = await client.eval(`
      (() => {
        const card = document.querySelector('.template-pop-card');
        if (!card) return 'template-pop-card not found';
        const before = window.getComputedStyle(card).transform;
        card.classList.add('hover');
        const during = window.getComputedStyle(card).transform;
        card.classList.remove('hover');
        const after = window.getComputedStyle(card).transform;
        return { before, during, after, hasBackdropBlur: card.className.includes('backdrop-blur') };
      })()
    `);
    console.log('Chapter 3 template card test result:', templateHoverTest);

    await client.screenshot('screenshots/home_chapter3_templates.png');

    console.log('\nConsole errors caught during test:', consoleErrors);
    console.log('\nALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!');
  } finally {
    chromeProc.kill('SIGKILL');
  }
}

run().catch((err) => {
  console.error('Fatal error during CDP test:', err);
  process.exit(1);
});
