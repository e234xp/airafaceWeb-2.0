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
const { spawn, spawnSync } = require('child_process');
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
const env = { ...process.env, E2E_PARALLEL: '1', E2E_VIA_RUNNER: '1' };

const setup = spawnSync(process.execPath, [cli, 'test', '--project=setup', '--reporter=line'], { stdio: 'inherit', env });
if (setup.status !== 0) {
  console.error('登入（setup）失敗，停止。');
  process.exit(setup.status ?? 1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = {};
const started = Date.now();
const counts = (text) => {
  const n = (re) => Number((new RegExp(`^\\s*(\\d+) ${re}`, 'm').exec(text) || [0, 0])[1]);
  return { passed: n('passed'), failed: n('failed'), skipped: n('skipped') };
};
const runOnce = (g) =>
  new Promise((resolve) => {
    const t0 = Date.now();
    let text = '';
    const p = spawn(process.execPath, [cli, 'test', `--project=${g}`, '--workers=1', '--reporter=list,./e2e/tools/budget-reporter.cjs', `--output=e2e/reports/artifacts-${g}`, ...pass], { env });
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
(async () => {
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
    const mark = r.notRun ? '⛔ 未執行（行程錯誤）' : r.failed > 0 || r.code !== 0 ? '❌ 有失敗' : '✅ 全部通過';
    console.log(`${mark}  ${g.padEnd(14)} 通過 ${r.passed}｜失敗 ${r.failed}｜跳過 ${r.skipped}｜${r.sec} 秒${r.retried ? '（曾自動重試）' : ''}`);
  }
  process.exit(Object.values(results).some((r) => r.code !== 0) ? 1 : 0);
})();
