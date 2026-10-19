// 在 Results 指定項目的「備註」欄尾端加一段註記（不改狀態）。
// 用法：node e2e/tools/add-note.cjs <notes.json>   notes.json = { "ATT-021": "註記文字", ... }
const fs = require('fs');
const F = 'E2E-TEST-RESULTS_2026-10-07.md';
const notes = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const raw = fs.readFileSync(F, 'utf8');
const eol = raw.includes('\r\n') ? '\r\n' : '\n';
const L = raw.split(/\r?\n/);
let n = 0;
for (const [id, text] of Object.entries(notes)) {
  const i = L.findIndex((l) => l.startsWith(`| ${id} |`));
  if (i < 0) { console.error('找不到', id); continue; }
  if (!L[i].endsWith(' |')) { console.error('列尾格式不符', id); continue; }
  L[i] = L[i].replace(/ \|$/, `<br>${text} |`);
  n += 1;
}
fs.writeFileSync(F, L.join(eol), 'utf8');
console.log('已加註記', n, '項');
