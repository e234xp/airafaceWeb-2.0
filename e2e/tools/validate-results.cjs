// 檢查 Results 表格：每列 7 欄、Test ID 不重複、都存在於 plan-ids.json、狀態合法；並彙總狀態數量。
const fs = require('fs');
const plan = new Set(require('../plan-ids.json').map((p) => p.id));
const lines = fs.readFileSync('E2E-TEST-RESULTS_2026-10-07.md', 'utf8').split('\n');
const seen = new Set();
const dup = [];
const bad = [];
const unknown = [];
const counts = {};
const legal = ['✅', '❌', '🟡', '⚪', '🚫', '⏭️', '⏱️'];
for (const l of lines) {
  const m = /^\| ([A-Z0-9]+-\d+) \|/.exec(l);
  if (!m) continue;
  const cells = l.split(' | ');
  const n = l.split('|').length - 2;
  if (n !== 7) bad.push(`${m[1]} 欄數 ${n}`);
  if (seen.has(m[1])) dup.push(m[1]);
  seen.add(m[1]);
  if (!plan.has(m[1])) unknown.push(m[1]);
  const st = l.split('|')[3].trim();
  const icon = legal.find((x) => st.startsWith(x));
  if (!icon) bad.push(`${m[1]} 狀態 ${st}`);
  counts[icon] = (counts[icon] || 0) + 1;
}
console.log('IDs', seen.size, JSON.stringify(counts));
console.log('重複', dup, '欄數/狀態異常', bad, '不在 Plan', unknown);
