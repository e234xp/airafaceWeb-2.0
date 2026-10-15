// 用法：node e2e/tools/run-case.cjs [--project=admin-session] <TestID|檔案>...
//   例：node e2e/tools/run-case.cjs CAM-007 CAM-008
//       node e2e/tools/run-case.cjs --status          列出各 Test ID 的嘗試次數與累計耗時
//       node e2e/tools/run-case.cjs --reset CAM-007   使用者同意加碼時，清除該項的記帳
// 停損規則（E2E-TEST-RULE.md §7）：同一個 Test ID 未通過且「嘗試次數 >= E2E_CASE_MAX_ATTEMPTS」
// 或「累計耗時 >= E2E_CASE_STUCK_TIMEOUT_MINUTES 分鐘」時，本工具拒絕再執行（exit 3）；
// 必須在 Results 記錄卡點與建議、標 ⏱️，然後做下一項。
const fs = require('fs');
const { spawnSync } = require('child_process');
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
const blocked = ids.filter((id) => db[id] && !db[id].passed && (db[id].attempts >= MAX || db[id].totalMs >= CAP_MS));
if (blocked.length) {
  for (const id of blocked) {
    const e = db[id];
    console.error(`⏱️ ${id} 已達停損上限（次數 ${e.attempts}/${MAX}，累計 ${(e.totalMs / 60000).toFixed(1)}/${CAP_MS / 60000} 分）：不再執行。請在 Results 記錄卡在哪裡與建議、標 ⏱️，然後做下一項。`);
  }
  process.exit(3);
}
// 不經 shell，避免正規表示式的反斜線被吃掉
const cli = require.resolve('@playwright/test/cli');
const grep = ids.length ? ['-g', ids.map((i) => '\\[' + i + '\\]').join('|')] : [];
const r = spawnSync(process.execPath, [cli, 'test', ...files, project, '--reporter=list,./e2e/tools/budget-reporter.cjs', ...grep], { stdio: 'inherit', env: { ...process.env, E2E_VIA_RUNNER: '1' } });
process.exit(r.status ?? 1);
