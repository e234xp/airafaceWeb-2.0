// 產生 E2E-BATCH-PLAN.md：把「部分自動化（P）、可進入實作、尚未有結果」的項目依風險與前置條件分組。
const fs = require('fs');
const plan = require('../plan-ids.json');
const res = fs.readFileSync('E2E-TEST-RESULTS_2026-10-07.md', 'utf8');
const done = new Set();
for (const l of res.split('\n')) {
  const m = /^\| ([A-Z0-9]+-\d+) \|/.exec(l);
  if (m) done.add(m[1]);
}
const left = plan.filter((p) => p.status === '可進入實作' && !done.has(p.id));
const mod = (id) => id.split('-')[0];

const HIGH_RISK_MODULES = ['BK', 'UPD', 'LIC', 'RST'];
const HIGH_RISK_IDS = ['SYS-001', 'MGR-005', 'MGR-006', 'MISC-001', 'MISC-003'];
// 純前端、需要先建立／造資料才能驗證的項目
const NEED_DATA = new Set([
  'PPL-005', 'PPL-017', 'VIS-005', 'VIS-012', 'GRP-011', 'GRP-013', 'GRP-014', 'GRP-015', 'DGRP-003',
  'ATT-022', 'ATT-024', 'ATT-029', 'ATT-034',
  ...Array.from({ length: 10 }, (_, i) => `ATT-0${43 + i}`).filter((x) => x !== 'ATT-047'),
  ...Array.from({ length: 7 }, (_, i) => `ATB-0${14 + i}`),
]);

const group = (p) => {
  const m = p.method || '';
  if (HIGH_RISK_MODULES.includes(mod(p.id)) || HIGH_RISK_IDS.includes(p.id)) return 'G6';
  if (m.includes('SSH')) return 'G5';
  if (m.includes('HW')) return 'G3';
  if (m.includes('EXT') || m.includes('API')) return 'G4';
  if (NEED_DATA.has(p.id)) return 'G2';
  return 'G1';
};

const names = {
  G1: 'G1 唯讀或可完全還原（只用前端；不需造資料、不碰共用設定）',
  G2: 'G2 前端為主，但需要先建立 e2e 測試資料（或改動共用設定後還原）',
  G3: 'G3 需要實體設備（攝影機／平板／讀卡機）或真實辨識事件',
  G4: 'G4 需要外部服務（SMTP、LINE、Nx、airaManager、API 大量上傳）',
  G5: 'G5 需要 SSH 到主機檢查（服務、db、檔案、df）',
  G6: 'G6 高風險／破壞性（授權、備份還原、升級、系統重設、中央管理），每項都要先經你同意',
};
const buckets = {};
for (const p of left) (buckets[group(p)] = buckets[group(p)] || []).push(p);

let out = `# E2E 剩餘項目分組計畫（${new Date().toISOString().slice(0, 10)}）\n\n`;
out += `範圍：Plan 中「可進入實作」且 Results 尚無結果的項目，共 ${left.length} 項（含 2 項 N：TAB-004、WG-001，需實體）。\n`;
out += `原則：每組做完就更新 Results 並回報；每項走 \`npm run e2e:case -- <Test ID>\`（5 次／5 分鐘停損）；會改共用設定的先備份、測完還原；G6 逐項取得同意才做。\n\n`;
out += '## 總覽\n\n| 組別 | 說明 | 項數 | 建議做法 |\n|---|---|---|---|\n';
const how = {
  G1: '直接寫腳本並執行；優先做',
  G2: '先建 e2e- 測試資料與清理；ATT 補打卡會產生無法刪除的紀錄，需你同意',
  G3: '沒有實體設備可操作時標 🚫 受阻並寫明需要什麼；有虛擬相機／測試機時再做',
  G4: '需要你提供測試用外部帳號或確認 E2E_VERIFY_NOTIFICATION_DELIVERY；否則只驗前端設定、收訊標未驗證',
  G5: '需要 SSH 連線資訊（目前沒有）；沒有就標 🚫 受阻',
  G6: '逐項詢問，不自行執行',
};
for (const g of ['G1', 'G2', 'G3', 'G4', 'G5', 'G6']) out += `| ${g} | ${names[g].replace(/^G\d /, '')} | ${(buckets[g] || []).length} | ${how[g]} |\n`;
out += '\n';
for (const g of ['G1', 'G2', 'G3', 'G4', 'G5', 'G6']) {
  const arr = buckets[g] || [];
  out += `## ${names[g]}（${arr.length}）\n\n`;
  const byMod = {};
  for (const p of arr) (byMod[mod(p.id)] = byMod[mod(p.id)] || []).push(p);
  for (const [m, a] of Object.entries(byMod)) {
    out += `**${m}**（${a.length}）：\n`;
    for (const p of a) out += `- ${p.id}　${p.title}\n`;
    out += '\n';
  }
}
fs.writeFileSync('E2E-BATCH-PLAN.md', out);
const sum = Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, v.length]));
console.log(left.length, JSON.stringify(sum));
