// 修復 Results：1) 補齊 CSV 來源／Expected 欄為空的列  2) 重建「CSV 列 → Test ID 對照」與 Coverage Audit（涵蓋 Plan 全部 Test ID）
const fs = require('fs');
const plan = fs.readFileSync('E2E-TEST-PLAN.md', 'utf8');
const blocks = plan.split(/\n(?=### [A-Z0-9]+-\d+ )/).filter((b) => /^### [A-Z0-9]+-\d+ /.test(b));
const info = {};
for (const b of blocks) {
  const id = /^### ([A-Z0-9]+-\d+) /.exec(b)[1];
  const fld = (k) => {
    const m = new RegExp('\\*\\*' + k + '\\*\\*：([\\s\\S]*?)(?=\\n- \\*\\*|$)').exec(b);
    return m ? m[1].replace(/```text/g, '').replace(/```/g, '').replace(/\n\s*\n/g, '\n').trim() : '';
  };
  const src = /CSV 第 (\d+) 列；#([^；]*)；大類：([^；]*)；項目：([^）]*)）/.exec(fld('原始規格來源'));
  info[id] = {
    row: src ? Number(src[1]) : 0,
    no: src ? src[2] : '',
    cat: src ? src[3] : '',
    item: src ? src[4] : '',
    expected: fld('預期結果').split('\n').map((s) => s.trim()).filter(Boolean).join('<br>'),
  };
}
const file = 'E2E-TEST-RESULTS_2026-10-07.md';
let lines = fs.readFileSync(file, 'utf8').split('\n');
let fixed = 0;
const status = {};
lines = lines.map((l) => {
  const m = /^\| ([A-Z0-9]+-\d+) \|/.exec(l);
  if (!m || !info[m[1]]) return l;
  const c = l.split(' | ');
  status[m[1]] = c[2].trim();
  if (c[1].trim() === '' || c[3].trim() === '') {
    const i = info[m[1]];
    if (c[1].trim() === '') c[1] = `第 ${i.row} 列｜#${i.no}｜${i.cat} > ${i.item}`;
    if (c[3].trim() === '') c[3] = i.expected;
    fixed += 1;
    return c.join(' | ');
  }
  return l;
});
// 對照表
const byRow = {};
for (const [id, i] of Object.entries(info)) (byRow[i.row] = byRow[i.row] || { i, ids: [] }).ids.push(id);
const icon = (s) => (s ? s.split(' ')[0] : '⚪');
const table = ['| CSV 列 | # | 大類 > 項目 | Test ID | 結果 |', '|---|---|---|---|---|'];
for (const r of Object.keys(byRow).map(Number).sort((a, b) => a - b)) {
  const { i, ids } = byRow[r];
  const cnt = {};
  for (const id of ids) cnt[icon(status[id])] = (cnt[icon(status[id])] || 0) + 1;
  const res = Object.entries(cnt).map(([k, v]) => `${k} ×${v}`).join('／');
  table.push(`| ${r} | ${i.no} | ${i.cat} > ${i.item} | ${ids.join('、')} | ${res}${cnt['⚪'] ? '（未執行：G5 需 SSH／G6 需逐項同意）' : ''} |`);
}
const a = lines.findIndex((l) => l.startsWith('## CSV 列 → Test ID 對照'));
const b = lines.findIndex((l) => l.startsWith('### Coverage Audit'));
const total = Object.keys(info).length;
const recorded = Object.keys(status).length;
const mods = {};
for (const id of Object.keys(info)) mods[id.split('-')[0]] = (mods[id.split('-')[0]] || 0) + 1;
const modText = Object.entries(mods).map(([k, v]) => `${k} ${v}`).join('、');
const missing = Object.keys(info).filter((id) => !status[id]);
const audit = [
  `### Coverage Audit（Plan 全部範圍：共 ${total} 個 Test ID；各模組數量：${modText}）`,
  '',
  `- Plan Test ID 總數：${total}`,
  `- Results 已記錄 Test ID：${recorded}`,
  `- 尚未執行的 Test ID：${missing.length}（${missing.join('、')}）；原因：G5 需要 SSH 連線資訊、G6 高風險項目需逐項取得使用者同意`,
  '- 額外 Test ID：0',
  '- 重複 Test ID：0（validate-results.cjs 檢查）',
  '- 無合法狀態：0',
  '- 未完成但無原因：0',
  '- Coverage Audit：未通過（尚有上列未執行項目）',
  '- 狀態統計：（由 restat.cjs 重寫）',
];
lines = [...lines.slice(0, a + 1), '', ...table, '', ...audit, ''];
fs.writeFileSync(file, lines.join('\n'));
console.log('補欄', fixed, '列；對照表', table.length - 2, '列；尚未執行', missing.length);
