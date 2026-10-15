// 用法：node e2e/tools/trace-last.cjs <trace.zip> [N]：列出 trace 中最後 N 個頁面動作與其錯誤（診斷用，只讀）。
const fs = require('fs');
const JSZip = require('jszip');
(async () => {
  const zip = await JSZip.loadAsync(fs.readFileSync(process.argv[2]));
  const n = Number(process.argv[3] || 12);
  const out = [];
  for (const name of Object.keys(zip.files).filter((f) => f.endsWith('.trace'))) {
    const lines = (await zip.files[name].async('string')).split('\n').filter(Boolean).map((x) => JSON.parse(x));
    const after = new Map(lines.filter((e) => e.type === 'after').map((e) => [e.callId, e]));
    for (const b of lines.filter((e) => e.type === 'before' && (e.class === 'Frame' || e.class === 'Page'))) {
      const a = after.get(b.callId);
      out.push(`${name.slice(0, 4)} ${b.method} ${JSON.stringify(b.params || {}).slice(0, 100)} ${a && a.error ? 'ERR ' + String(a.error.message).split('\n')[0].slice(0, 80) : ''}`);
    }
  }
  console.log(out.slice(-n).join('\n'));
})();
