// 診斷（只讀）：查詢 Nx 上某攝影機在指定本地日期的錄影時段。用法：node e2e/tools/nx-periods.cjs <deviceId> <YYYY-MM-DD>
// 帳密由 .env.e2e.local 讀取（不輸出）。
const fs = require('fs');
const https = require('https');
const env = Object.fromEntries(
  fs.readFileSync('.env.e2e.local', 'utf8').split(/\r?\n/).filter((l) => l.includes('=') && !l.startsWith('#')).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]),
);
const base = new URL(env.E2E_NX_URL);
const agent = new https.Agent({ rejectUnauthorized: false });
const call = (method, path, body, token) =>
  new Promise((resolve, reject) => {
    const req = https.request({ host: base.hostname, port: base.port, path, method, agent, headers: { 'Content-Type': 'application/json', ...(body ? { 'Content-Length': Buffer.byteLength(JSON.stringify(body)) } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) } }, (res) => {
      let s = '';
      res.on('data', (d) => (s += d));
      res.on('end', () => resolve({ status: res.statusCode, body: s }));
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
(async () => {
  const [id, day] = process.argv.slice(2);
  const login = await call('POST', '/rest/v1/login/sessions', { username: env.E2E_NX_USER, password: env.E2E_NX_PASSWORD });
  console.log('login', login.status, login.body.slice(0, 60).replace(/"token":"[^"]*"/, 'token:***'));
  const token = JSON.parse(login.body).token;
  const start = new Date(`${day}T00:00:00+08:00`).getTime();
  const end = start + 24 * 3600 * 1000;
  const r = await call('GET', `/rest/v1/devices/${encodeURIComponent('{' + id + '}')}/footage?startTimeMs=${start}&endTimeMs=${end}`, null, token);
  console.log('status', r.status);
  try {
    const j = JSON.parse(r.body);
    const list = j.reply || j;
    console.log(JSON.stringify(list).slice(0, 1500));
  } catch (e) {
    console.log(r.body.slice(0, 300));
  }
})();
