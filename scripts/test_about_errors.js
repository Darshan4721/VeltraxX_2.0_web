import { spawn } from 'child_process';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'D:\\tmp\\veltraxx_2.o\\.chrome_test_about_only';
const port = 9229;

const chromeProc = spawn(chromePath, [
  `--remote-debugging-port=${port}`,
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  `--user-data-dir=${userDataDir}`,
  'about:blank',
]);

async function run() {
  await new Promise((r) => setTimeout(r, 800));
  const res = await fetch(`http://127.0.0.1:${port}/json/list`);
  const pages = await res.json();
  const page = pages.find((p) => p.type === 'page');

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));

  const consoleErrors = [];
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.method === 'Runtime.consoleAPICalled' && data.params.type === 'error') {
      consoleErrors.push(data.params.args.map((a) => a.value || a.description).join(' '));
    }
  };

  ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
  ws.send(
    JSON.stringify({
      id: 2,
      method: 'Page.navigate',
      params: { url: 'http://localhost:5173/' },
    })
  );

  await new Promise((r) => setTimeout(r, 2500));

  console.log('Errors caught on /about:', consoleErrors);
  chromeProc.kill('SIGKILL');
}

run().catch((e) => {
  console.error(e);
  chromeProc.kill('SIGKILL');
});
