// 掃描 spec 中「使用者於 2026-10-07 同意暫不測」註解後的 test.fixme，產生 ⏭️ 結果項目 JSON（寫到 e2e/reports/tmp/skip.json）。
const fs = require('fs');
const path = require('path');
const out = [];
function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.spec.ts')) scan(p);
  }
}
function scan(p) {
  const L = fs.readFileSync(p, 'utf8').split('\n');
  for (let i = 0; i < L.length - 1; i += 1) {
    if (!L[i].includes('同意暫不測')) continue;
    const m = /\[([A-Z0-9]+-\d+)\]/.exec(L[i + 1]);
    if (!m) continue;
    const why = L[i].split('目前問題：')[1] || L[i].split('；').slice(-1)[0];
    out.push({
      id: m[1],
      status: '⏭️ 使用者同意跳過',
      actual: ['使用者於 2026-10-07 同意暫不測，本輪未執行'],
      data: '無',
      note: ['原因（Plan 待確認事項）：' + String(why).trim()],
    });
  }
}
walk('e2e/specs');
fs.mkdirSync('e2e/reports/tmp', { recursive: true });
fs.writeFileSync('e2e/reports/tmp/skip.json', JSON.stringify(out, null, 1));
console.log(out.length, out.map((x) => x.id).join(','));
