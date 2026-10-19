// 依 Results 表格實際內容重寫兩處統計（可重複執行，每次更新 Results 後都跑一次）：
//   1. 上方「狀態圖例」那一行：各狀態數量（含 ⚪ 未執行、合計）
//   2. 文末「- 狀態統計」那一行：各狀態數量與 Test ID 清單
// ⚪ 未執行 = 文末 Coverage Audit「尚未執行的 Test ID：N」的 N（Results 表格只有已記錄的項目）
const fs = require('fs');

const f = 'E2E-TEST-RESULTS_2026-10-07.md';
const raw = fs.readFileSync(f, 'utf8');
const eol = (raw.match(/\r\n/g) || []).length >= (raw.match(/(?<!\r)\n/g) || []).length ? '\r\n' : '\n';
const lines = raw.split(/\r?\n/);

const by = {};
for (const l of lines) {
  const m = /^\| ([A-Z0-9]+-\d+) \|/.exec(l);
  if (!m) continue;
  const st = l.split('|')[3].trim().split(' ')[0];
  (by[st] = by[st] || []).push(m[1]);
}
const n = (k) => (by[k] || []).length;
const list = (k) => (by[k] || []).join('、');
const recorded = Object.values(by).reduce((a, b) => a + b.length, 0);

const auditLine = lines.find((l) => /^- 尚未執行的 Test ID：\d+/.test(l));
if (!auditLine) throw new Error('找不到 Coverage Audit 的「尚未執行的 Test ID：N」');
const unexecuted = Number(/^- 尚未執行的 Test ID：(\d+)/.exec(auditLine)[1]);
const total = recorded + unexecuted;

const iLegend = lines.findIndex((l) => l.startsWith('狀態圖例'));
if (iLegend < 0) throw new Error('找不到「狀態圖例」那一行');
const today = new Date().toISOString().slice(0, 10);
lines[iLegend] =
  `狀態圖例（${today} 統計）：✅ 通過 ${n('✅')}｜❌ 失敗 ${n('❌')}｜🟡 部分完成 ${n('🟡')}｜⚪ 未執行 ${unexecuted}` +
  `｜🚫 受阻 ${n('🚫')}｜⏭️ 使用者同意跳過 ${n('⏭️')}｜⏱️ 逾時中止 ${n('⏱️')}｜合計 ${total}（已記錄 ${recorded} + 未執行 ${unexecuted}）`;

const iStat = lines.findIndex((l) => l.startsWith('- 狀態統計'));
if (iStat < 0) throw new Error('找不到「- 狀態統計」那一行');
lines[iStat] =
  `- 狀態統計：✅ 通過 ${n('✅')}｜❌ 失敗 ${n('❌')}（${list('❌')}）｜🟡 部分完成 ${n('🟡')}（${list('🟡')}）` +
  `｜⏱️ 逾時中止 ${n('⏱️')}（${list('⏱️')}）｜🚫 受阻 ${n('🚫')}（${list('🚫')}）｜⏭️ 使用者同意跳過 ${n('⏭️')}` +
  `｜⚪ 未執行 ${unexecuted}｜合計 ${total}（已記錄 ${recorded}）`;

fs.writeFileSync(f, lines.join(eol), 'utf8');
console.log({ recorded, unexecuted, total, ...Object.fromEntries(Object.entries(by).map(([k, v]) => [k, v.length])) });
