// 唯讀：依 e2e/reports/tmp/stranger-meta.json（陌生人紀錄時間與臉框）向 Nx 取回「錄影回放」對應時間的完整畫面，存到 e2e/reports/tmp/nxframes/。
// 用法：node e2e/tools/nx-frames.cjs <deviceId> <回放起點本地時間 YYYY-MM-DDTHH:mm:ss+08:00> <串流啟動本地時間 YYYY-MM-DDTHH:mm:ss+08:00> [前N大臉框=12]
// 回放時間 = 回放起點 + （紀錄時間 − 串流啟動時間）。帳密由 .env.e2e.local 讀取，不輸出。
const fs = require('fs');
const https = require('https');
const env = Object.fromEntries(
  fs.readFileSync('.env.e2e.local', 'utf8').split(/\r?\n/).filter((l) => l.includes('=') && !l.startsWith('#')).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]),
);
const base = new URL(env.E2E_NX_URL);
const agent = new https.Agent({ rejectUnauthorized: false });
const call = (method, path, body, token, binary) =>
  new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : '';
    const headers = { ...(body ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) };
    const req = https.request({ host: base.hostname, port: base.port, path, method, agent, headers }, (res) => {
      const chunks = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => resolve({ status: res.statusCode, type: res.headers['content-type'], body: binary ? Buffer.concat(chunks) : Buffer.concat(chunks).toString() }));
    });
    req.on('error', reject);
    if (body) req.write(payload);
    req.end();
  });
(async () => {
  const [id, playStart, streamStart, topN = '12'] = process.argv.slice(2);
  const meta = JSON.parse(fs.readFileSync('e2e/reports/tmp/stranger-meta.json', 'utf8'));
  const login = await call('POST', '/rest/v1/login/sessions', { username: env.E2E_NX_USER, password: env.E2E_NX_PASSWORD });
  const token = JSON.parse(login.body).token;
  const top = meta.map((m) => ({ ...m, area: (m.x2 - m.x1) * (m.y2 - m.y1) })).sort((a, b) => b.area - a.area).slice(0, Number(topN));
  fs.mkdirSync('e2e/reports/tmp/nxframes', { recursive: true });
  const out = [];
  for (const m of top) {
    const rec = new Date(m.t.replace(' ', 'T') + '+08:00').getTime();
    const play = new Date(playStart).getTime() + (rec - new Date(streamStart).getTime());
    for (const d of [-600, 0, 600]) {
      const r = await call('GET', `/rest/v2/devices/${id}/image?timestampMs=${play + d}`, null, token, true);
      const ok = r.status === 200 && /image/.test(r.type || '');
      const name = `${m.t.slice(11).replace(/:/g, '')}_${d}`;
      if (ok) fs.writeFileSync(`e2e/reports/tmp/nxframes/${name}.jpg`, r.body);
      out.push({ name, status: r.status, type: r.type, bytes: r.body.length, box: [m.x1, m.y1, m.x2, m.y2] });
    }
  }
  fs.writeFileSync('e2e/reports/tmp/nxframes/index.json', JSON.stringify(out));
  console.log(JSON.stringify(out.slice(0, 4)), '共', out.length, '張，成功', out.filter((o) => o.status === 200).length);
})();
