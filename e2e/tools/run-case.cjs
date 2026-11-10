// 用法：node e2e/tools/run-case.cjs [--project=admin-session] <TestID|檔案>...
//   例：node e2e/tools/run-case.cjs CAM-007 CAM-008
//       node e2e/tools/run-case.cjs --status          列出各 Test ID 在最近一次執行的嘗試次數與累計耗時
//       node e2e/tools/run-case.cjs --reset CAM-007   使用者同意加碼時，清除該項的記帳
// 指定測項（本工具）永遠不會被停損擋住，不分人或 AI；停損只在「測全部」（npm run e2e / e2e:parallel）時套用，
// 見 helpers/test.ts。記帳以「每次執行」為單位，從 0 開始算（E2E_RUN_ID），不沿用先前執行留下的次數。
const fs = require('fs');
const { spawnSync } = require('child_process');
require('./auth-refresh.cjs').requireNode();
if (fs.existsSync('.env.e2e.local')) process.loadEnvFile('.env.e2e.local');
const MAX = Number(process.env.E2E_CASE_MAX_ATTEMPTS || 5);
const CAP_MS = Number(process.env.E2E_CASE_STUCK_TIMEOUT_MINUTES || 5) * 60000;
const FILE = 'e2e/reports/budget.json';
const db = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, 'utf8')) : {};
const args = process.argv.slice(2);

if (args[0] === '--status') {
  for (const [id, e] of Object.entries(db)) {
    const over = !e.passed && (e.attempts >= MAX || e.totalMs >= CAP_MS);
    console.log(`${over ? '⏱️ ' : '   '}${id}  次數 ${e.attempts}/${MAX}  累計 ${(e.totalMs / 60000).toFixed(1)}/${CAP_MS / 60000} 分  ${e.passed ? '通過' : '未通過'}`);
  }
  process.exit(0);
}
if (args[0] === '--reset') {
  for (const id of args.slice(1)) delete db[id];
  fs.writeFileSync(FILE, JSON.stringify(db, null, 1));
  console.log('已清除：', args.slice(1).join(', '));
  process.exit(0);
}

const project = args.find((a) => a.startsWith('--project=')) || '--project=admin-session';
const ids = args.filter((a) => /^[A-Z0-9]+-\d+$/.test(a));
const files = args.filter((a) => !a.startsWith('--') && !/^[A-Z0-9]+-\d+$/.test(a));
// 不經 shell，避免正規表示式的反斜線被吃掉
const cli = require.resolve('@playwright/test/cli');
const grep = ids.length ? ['-g', ids.map((i) => '\\[' + i + '\\]').join('|')] : [];
const workers = args.filter((a) => /^--workers=\d+$/.test(a)); // 一次跑多項時可降低並行數，避免開發伺服器被壓垮
// 除錯用參數原樣傳給 Playwright：--headed 開出瀏覽器視窗、--debug 逐步除錯、--ui 圖形介面、--trace=on 強制錄 trace
const passthrough = args.filter((a) => ['--headed', '--debug', '--ui'].includes(a) || /^--trace=[a-z-]+$/.test(a));
// HTML 報告輸出到 e2e/reports/html，跑完後壓成帶日期的 zip（e2e/reports/archive），下一次執行才不會把這次的報告蓋掉。
// --ui、--debug 是互動除錯，不產生要留存的報告，所以不壓縮。
const reportDir = 'e2e/reports/html';
const startedAt = new Date();
const r = spawnSync(process.execPath, [cli, 'test', ...files, project, '--reporter=list,html,./e2e/tools/budget-reporter.cjs', ...workers, ...passthrough, ...grep], {
  stdio: 'inherit',
  env: { ...process.env, E2E_VIA_RUNNER: '1', E2E_RUN_MODE: 'case', E2E_RUN_ID: startedAt.toISOString(), PLAYWRIGHT_HTML_OUTPUT_DIR: reportDir, PLAYWRIGHT_HTML_REPORT: reportDir, PLAYWRIGHT_HTML_OPEN: 'never' },
});
if (!passthrough.some((a) => a === '--ui' || a === '--debug')) require('./archive-report.cjs').archiveReports([reportDir], { startedAt });
process.exit(r.status ?? 1);
