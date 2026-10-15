// 用法：node e2e/tools/add-results.cjs <entries.json>
// entries.json：[{ id, status:'✅ 通過'|'❌ 失敗'|'🟡 部分完成'|'🚫 受阻'|'⏭️ 略過'|'⏱️ 逾時中止', actual:[步驟...], data:'測資', note:[備註...] }]
// 規格依據、預期結果取自 E2E-TEST-PLAN.md；新增列插在「## CSV 列 → Test ID 對照」之前；已有同 ID 的列則取代。
const fs = require('fs');
const entries = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const plan = fs.readFileSync('E2E-TEST-PLAN.md', 'utf8');
const blocks = plan.split(/\n(?=### [A-Z0-9]+-\d+ )/);
const file = 'E2E-TEST-RESULTS_2026-10-07.md';
let lines = fs.readFileSync(file, 'utf8').split('\n');
const numbered = (a) => (Array.isArray(a) ? a.map((x, i) => `${i + 1}. ${x}`).join('<br>') : a);
for (const e of entries) {
  const b = blocks.find((x) => x.startsWith(`### ${e.id} `));
  if (!b) throw new Error(`Plan 沒有 ${e.id}`);
  const src = /來源: SRC-R\d+（CSV 第 (\d+) 列；#([^；]*)；大類：([^；]*)；項目：([^）]*)）/.exec(b);
  const exp = /預期: ([\s\S]*?)(?:\n {2}備註:|$)/.exec(b);
  const spec = src ? `第 ${src[1]} 列｜#${src[2]}｜${src[3]} > ${src[4]}` : '';
  const expected = exp ? exp[1].split('\n').map((s) => s.trim()).filter(Boolean).join('<br>') : '';
  const row = `| ${e.id} | ${spec} | ${e.status} | ${expected} | ${numbered(e.actual)} | ${e.data || '無'} | ${numbered(e.note || [])} |`;
  const idx = lines.findIndex((l) => l.startsWith(`| ${e.id} |`));
  if (idx >= 0) lines[idx] = row;
  else {
    const mapIdx = lines.findIndex((l) => l.startsWith('## CSV 列 → Test ID 對照'));
    let at = mapIdx;
    while (at > 0 && lines[at - 1].trim() === '') at -= 1;
    lines.splice(at, 0, row);
  }
}
fs.writeFileSync(file, lines.join('\n'));
console.log('寫入', entries.length, '列');
require('child_process').execFileSync('node', ['e2e/tools/repair-results.cjs'], { stdio: 'inherit' }); // 補齊 CSV 來源／Expected 並重建對照表
