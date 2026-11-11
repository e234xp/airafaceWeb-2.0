// 平行執行：把測項依「共用狀態」分組（見 playwright.config.ts 的 groupProjects），組內序列、組間平行。
// 分組：boards（看板）、people-events（人員／訪客／群組／事件／通知）、system（系統設定、帳號、診斷）、
//       devices（攝影機／平板／設備群組）、reports（調查／報表／進出紀錄）、login（登入登出）。
// 用法：
//   node e2e/tools/run-parallel.cjs                          跑全部分組（最多同時 3 組）
//   node e2e/tools/run-parallel.cjs --groups=boards,devices  只跑指定分組
//   node e2e/tools/run-parallel.cjs --jobs=2                 同時最多 2 組
//   node e2e/tools/run-parallel.cjs -- -g "\[CAM-0"          「--」後面的參數原樣傳給 playwright
// 注意：先單獨登入一次（setup），各組共用登入狀態；各組使用各自的 artifacts 資料夾，避免 trace／video 互相覆蓋。
// 停損記帳（budget.json）仍由 budget-reporter 寫入（已加鎖）；需要停損控管的單項重跑請用 npm run e2e:case。
// 各組啟動會錯開幾秒；若某組一啟動就因行程錯誤結束（沒跑任何測項），會自動重試一次，並在摘要標示「未執行」，
// 不會跟「有測項失敗」混在一起。
const fs = require('fs');
const { spawn } = require('child_process');
const { requireNode, ensureFreshAuth } = require('./auth-refresh.cjs');
const { backendOrigin, startBackendMonitor, describeMonitor } = require('./backend-monitor.cjs');
requireNode();
if (fs.existsSync('.env.e2e.local')) process.loadEnvFile('.env.e2e.local');
const cli = require.resolve('@playwright/test/cli');
const args = process.argv.slice(2);
const dd = args.indexOf('--');
const pass = dd >= 0 ? args.slice(dd + 1) : [];
const own = dd >= 0 ? args.slice(0, dd) : args;
const ALL = ['boards', 'people-events', 'system', 'devices', 'reports', 'login']; // 預估耗時由長到短
const pick = (own.find((a) => a.startsWith('--groups=')) || '').split('=')[1];
const groups = pick ? pick.split(',') : ALL;
const jobs = Number((own.find((a) => a.startsWith('--jobs=')) || '--jobs=3').split('=')[1]);
const STAGGER_MS = 5000; // 同時啟動的各組之間錯開，避免一起建立／整理輸出資料夾而互相撞到
// E2E_RUN_MODE=full：測全部，停損會套用（見 helpers/test.ts）；E2E_RUN_ID：這一次執行的識別，各組共用同一個
const env = { ...process.env, E2E_PARALLEL: '1', E2E_VIA_RUNNER: '1', E2E_RUN_MODE: 'full', E2E_RUN_ID: new Date().toISOString() };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = {};
const startedAt = new Date();
const started = startedAt.getTime();
const reportDirOf = (group) => `e2e/reports/html-${group}`;
const counts = (text) => {
  const n = (re) => Number((new RegExp(`^\\s*(\\d+) ${re}`, 'm').exec(text) || [0, 0])[1]);
  return { passed: n('passed'), failed: n('failed'), skipped: n('skipped') };
};
const runOnce = (g) =>
  new Promise((resolve) => {
    const t0 = Date.now();
    let text = '';
    // 每組的 HTML 報告各自一個資料夾（e2e/reports/html-<組名>），避免 6 組互相蓋掉；全部跑完後一起壓成一個 zip
    const reportDir = reportDirOf(g);
    const p = spawn(process.execPath, [cli, 'test', `--project=${g}`, '--workers=1', '--reporter=list,html,./e2e/tools/budget-reporter.cjs', `--output=e2e/reports/artifacts-${g}`, ...pass], {
      env: { ...env, PLAYWRIGHT_HTML_OUTPUT_DIR: reportDir, PLAYWRIGHT_HTML_REPORT: reportDir, PLAYWRIGHT_HTML_OPEN: 'never' },
    });
    const tag = (s) => s.toString().split('\n').filter((l) => l.trim()).map((l) => `[${g}] ${l}`).join('\n') + '\n';
    p.stdout.on('data', (d) => {
      text += d.toString();
      process.stdout.write(tag(d));
    });
    p.stderr.on('data', (d) => {
      text += d.toString();
      process.stderr.write(tag(d));
    });
    p.on('close', (code) => resolve({ code, sec: Math.round((Date.now() - t0) / 1000), ...counts(text), text }));
  });
// 沒有任何測項結果（通過／失敗／跳過都是 0）而且結束碼不是 0，視為行程啟動錯誤，不是測項失敗。
const startupCrash = (r) => r.code !== 0 && r.passed + r.failed + r.skipped === 0;
const run = async (g, delayMs) => {
  if (delayMs) await sleep(delayMs);
  // 每組開始前確認登入狀態還新（整批跑很久時，後面的組不會拿到過期的 token）
  const auth = await ensureFreshAuth({ env, label: `[${g}] `, outputDir: `e2e/reports/artifacts-setup-${g}` });
  if (auth !== 0) {
    console.error(`[${g}] 登入（setup）失敗，這組不執行。截圖在 e2e/reports/artifacts-setup-${g}`);
    results[g] = { code: auth, sec: 0, passed: 0, failed: 0, skipped: 0, retried: false, notRun: true, notRunReason: '登入失敗', text: '' };
    return;
  }
  let r = await runOnce(g);
  let retried = false;
  if (startupCrash(r)) {
    console.log(`[${g}] 行程啟動就結束、沒有跑任何測項，10 秒後自動重試一次`);
    await sleep(10000);
    r = await runOnce(g);
    retried = true;
  }
  results[g] = { ...r, retried, notRun: startupCrash(r) };
};
/** 這次執行中失敗的測項與記錄失敗的時間（從停損記帳 budget.json 取，只看這次的 E2E_RUN_ID）。讀不到就回傳空陣列。 */
function failedTestsOfThisRun() {
  try {
    const budget = JSON.parse(fs.readFileSync('e2e/reports/budget.json', 'utf8'));
    return Object.entries(budget)
      .filter(([, entry]) => entry.runId === env.E2E_RUN_ID && !entry.passed && entry.history && entry.history.length)
      .map(([id, entry]) => ({ id, atMs: Date.parse(entry.history[entry.history.length - 1].at) }));
  } catch {
    return [];
  }
}
(async () => {
  const monitorOrigin = backendOrigin(env);
  // 前端和後端同一台時（直接測 14.21）不用另外監看前端；不同台時（本機開發伺服器）兩邊都看
  const frontendUrl = env.E2E_BASE_URL && monitorOrigin && new URL(env.E2E_BASE_URL).origin !== monitorOrigin ? env.E2E_BASE_URL : null;
  const monitor = monitorOrigin ? startBackendMonitor(monitorOrigin, { frontendUrl }) : null;
  if (!monitor) console.log('（判斷不出後端位址，這次不監看後端；可設 E2E_BACKEND_URL 指定）');
  const queue = groups.map((g, i) => ({ g, delay: i < jobs ? i * STAGGER_MS : 0 }));
  await Promise.all(Array.from({ length: Math.min(jobs, queue.length) }, async () => {
    while (queue.length) {
      const { g, delay } = queue.shift();
      await run(g, delay);
    }
  }));
  console.log('\n===== 平行執行結果（總耗時 ' + Math.round((Date.now() - started) / 1000) + ' 秒）=====');
  for (const g of groups) {
    const r = results[g];
    const mark = r.notRun ? `⛔ 未執行（${r.notRunReason || '行程錯誤'}）` : r.failed > 0 || r.code !== 0 ? '❌ 有失敗' : '✅ 全部通過';
    console.log(`${mark}  ${g.padEnd(14)} 通過 ${r.passed}｜失敗 ${r.failed}｜跳過 ${r.skipped}｜${r.sec} 秒${r.retried ? '（曾自動重試）' : ''}`);
  }
  if (monitor) console.log(`\n${describeMonitor(monitor.stop(), failedTestsOfThisRun())}`);
  // 只有「完整測試」才存檔：全部 6 組都有跑。只挑幾組來跑（例如 --groups=login）不存檔，
  // 否則封存資料夾會被零碎的小報告塞滿，把真正的完整報告擠掉（只留最新幾個）。
  // 完整測試時各組的報告一起壓成一個 zip；沒被執行的組（報告比這次開始時間舊）會被略過
  const isFullRun = ALL.every((g) => groups.includes(g));
  if (isFullRun && !pass.some((a) => a === '--ui' || a === '--debug')) require('./archive-report.cjs').archiveReports(groups.map(reportDirOf), { startedAt });
  process.exit(Object.values(results).some((r) => r.code !== 0) ? 1 : 0);
})();
