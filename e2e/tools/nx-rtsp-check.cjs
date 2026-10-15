// 診斷（只讀）：對 Nx VMS 送 RTSP DESCRIBE，確認指定攝影機的串流是否可取得、是否需要認證。
// 帳密由 .env.e2e.local 讀取（不輸出）。用法：node e2e/tools/nx-rtsp-check.cjs <deviceId>...
const net = require('net');
const fs = require('fs');
const env = Object.fromEntries(
  fs.readFileSync('.env.e2e.local', 'utf8').split(/\r?\n/).filter((l) => l.includes('=') && !l.startsWith('#')).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]),
);
const u = new URL(env.E2E_NX_URL);
const auth = 'Basic ' + Buffer.from(`${env.E2E_NX_USER}:${env.E2E_NX_PASSWORD}`).toString('base64');

function describe(id, withAuth) {
  return new Promise((resolve) => {
    const s = net.connect({ host: u.hostname, port: Number(u.port || 554), timeout: 8000 });
    let data = '';
    s.on('connect', () => {
      s.write(`DESCRIBE rtsp://${u.hostname}:${u.port}/${id} RTSP/1.0\r\nCSeq: 1\r\nAccept: application/sdp\r\n${withAuth ? `Authorization: ${auth}\r\n` : ''}\r\n`);
    });
    s.on('data', (d) => {
      data += d.toString('latin1');
      if (data.includes('\r\n\r\n')) s.end();
    });
    s.on('timeout', () => s.destroy());
    s.on('close', () => resolve(data.split('\r\n')[0] + ' | ' + (/WWW-Authenticate: ([^\r]*)/i.exec(data) || [, ''])[1].split(',')[0]));
    s.on('error', (e) => resolve('ERR ' + e.message));
  });
}
(async () => {
  for (const id of process.argv.slice(2)) {
    console.log(id, '無認證：', await describe(id, false));
    console.log(id, 'Basic ：', await describe(id, true));
  }
})();
