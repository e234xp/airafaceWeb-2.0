// 用法：node e2e/tools/run-case.cjs [--project=admin-session] <TestID|檔案>...
//   例：node e2e/tools/run-case.cjs CAM-007 CAM-008
// 用測項 ID 找到對應的測項來跑。時間上限由 Playwright 原生的 timeout 控制（見 helpers/timeouts.ts），單項執行不重試。
const fs = require('fs');
const { spawnSync } = require('child_process');
require('./auth-refresh.cjs').requireNode();
if (fs.existsSync('.env.e2e.local')) process.loadEnvFile('.env.e2e.local');
const args = process.argv.slice(2);

const project = args.find((a) => a.startsWith('--project=')) || '--project=admin-session';
const ids = args.filter((a) => /^[A-Z0-9]+-\d+$/.test(a));
const files = args.filter((a) => !a.startsWith('--') && !/^[A-Z0-9]+-\d+$/.test(a));
// 不經 shell，避免正規表示式的反斜線被吃掉
const cli = require.resolve('@playwright/test/cli');
const grep = ids.length ? ['-g', ids.map((i) => '\\[' + i + '\\]').join('|')] : [];
const workers = args.filter((a) => /^--workers=\d+$/.test(a)); // 一次跑多項時可降低並行數，避免開發伺服器被壓垮
// 除錯用參數原樣傳給 Playwright：--headed 開出瀏覽器視窗、--debug 逐步除錯、--ui 圖形介面、--trace=on 強制錄 trace
const passthrough = args.filter((a) => ['--headed', '--debug', '--ui'].includes(a) || /^--trace=[a-z-]+$/.test(a));
// HTML 報告輸出到 e2e/reports/html。單項執行不存檔（只有完整測試才會壓進 e2e/reports/archive，見 run-parallel.cjs），下一次單項執行會蓋掉這份。
const reportDir = 'e2e/reports/html';
const r = spawnSync(process.execPath, [cli, 'test', ...files, project, '--reporter=list,html', ...workers, ...passthrough, ...grep], {
  stdio: 'inherit',
  env: { ...process.env, PLAYWRIGHT_HTML_OUTPUT_DIR: reportDir, PLAYWRIGHT_HTML_REPORT: reportDir, PLAYWRIGHT_HTML_OPEN: 'never' },
});
process.exit(r.status ?? 1);
