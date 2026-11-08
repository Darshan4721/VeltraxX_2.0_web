const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9229;

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
  const testDir = '.chrome_diag';
  if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });

  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${testDir}`,
    '--headless=new',
    '--disable-gpu',
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
    const consoleLogs = [];

    ws.onmessage = e => {
      const m = JSON.parse(e.data);
      if (m.method === 'Runtime.consoleAPICalled') {
        consoleLogs.push({ type: m.params.type, text: m.params.args.map(a => a.value || a.description).join(' ') });
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

    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await sleep(2500);

    const title = await send('Runtime.evaluate', { expression: 'document.title' });
    console.log('Doc title:', title?.result?.value);

    const bodyHtml = await send('Runtime.evaluate', { expression: 'document.body.innerHTML.slice(0, 300)' });
    console.log('Body HTML preview:', bodyHtml?.result?.value);

    console.log('Console logs:', consoleLogs);

    ws.close();
  } finally {
    chromeProc.kill();
  }
}

run().catch(console.error);
