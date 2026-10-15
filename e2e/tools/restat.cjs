// 依 Results 表格實際內容重寫「狀態統計」那一行（可重複執行）。
const fs = require('fs');
const f = 'E2E-TEST-RESULTS_2026-10-07.md';
const lines = fs.readFileSync(f, 'utf8').split('\n');
const by = {};
for (const l of lines) {
  const m = /^\| ([A-Z0-9]+-\d+) \|/.exec(l);
  if (!m) continue;
  const st = l.split('|')[3].trim().split(' ')[0];
  (by[st] = by[st] || []).push(m[1]);
}
const total = Object.values(by).reduce((a, b) => a + b.length, 0);
const list = (k) => (by[k] || []).join('、');
const i = lines.findIndex((l) => l.startsWith('- 狀態統計'));
lines[i] = `- 狀態統計：✅ 通過 ${by['✅'].length}｜❌ 失敗 ${by['❌'].length}（${list('❌')}）｜🟡 部分完成 ${by['🟡'].length}（${list('🟡')}）｜⏱️ 逾時中止 ${(by['⏱️'] || []).length}（${list('⏱️')}）｜🚫 受阻 ${(by['🚫'] || []).length}（${list('🚫')}）｜⚪ 未執行 0｜合計 ${total}`;
fs.writeFileSync(f, lines.join('\n'));
console.log(total, Object.fromEntries(Object.entries(by).map(([k, v]) => [k, v.length])));
