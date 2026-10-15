// 平行執行：把測項依「共用狀態」分組（見 playwright.config.ts 的 g-* projects），組內序列、組間平行。
// 用法：
//   node e2e/tools/run-parallel.cjs                    跑全部分組（最多同時 3 組）
//   node e2e/tools/run-parallel.cjs --groups=g-dash,g-att   只跑指定分組
//   node e2e/tools/run-parallel.cjs --jobs=2           同時最多 2 組
//   node e2e/tools/run-parallel.cjs -- -g "\[CAM-0"    「--」後面的參數原樣傳給 playwright
// 注意：先單獨登入一次（setup），各組共用登入狀態；各組使用各自的 artifacts 資料夾，避免 trace／video 互相覆蓋。
// 停損記帳（budget.json）仍由 budget-reporter 寫入（已加鎖）；需要停損控管的單項重跑請用 npm run e2e:case。
const fs = require('fs');
const { spawn, spawnSync } = require('child_process');
if (fs.existsSync('.env.e2e.local')) process.loadEnvFile('.env.e2e.local');
const cli = require.resolve('@playwright/test/cli');
const args = process.argv.slice(2);
const dd = args.indexOf('--');
const pass = dd >= 0 ? args.slice(dd + 1) : [];
const own = dd >= 0 ? args.slice(0, dd) : args;
const ALL = ['g-dash', 'g-per', 'g-sys', 'g-att', 'g-dev', 'g-ro', 'g-login']; // 預估耗時由長到短
const pick = (own.find((a) => a.startsWith('--groups=')) || '').split('=')[1];
const groups = pick ? pick.split(',') : ALL;
const jobs = Number((own.find((a) => a.startsWith('--jobs=')) || '--jobs=3').split('=')[1]);
const env = { ...process.env, E2E_PARALLEL: '1', E2E_VIA_RUNNER: '1' };

const setup = spawnSync(process.execPath, [cli, 'test', '--project=setup', '--reporter=line'], { stdio: 'inherit', env });
if (setup.status !== 0) {
  console.error('登入（setup）失敗，停止。');
  process.exit(setup.status ?? 1);
}
const results = {};
const started = Date.now();
const run = (g) =>
  new Promise((resolve) => {
    const t0 = Date.now();
    const p = spawn(process.execPath, [cli, 'test', `--project=${g}`, '--workers=1', '--reporter=list,./e2e/tools/budget-reporter.cjs', `--output=e2e/reports/artifacts-${g}`, ...pass], { env });
    const tag = (s) => s.toString().split('\n').filter((l) => l.trim()).map((l) => `[${g}] ${l}`).join('\n') + '\n';
    p.stdout.on('data', (d) => process.stdout.write(tag(d)));
    p.stderr.on('data', (d) => process.stderr.write(tag(d)));
    p.on('close', (code) => {
      results[g] = { code, sec: Math.round((Date.now() - t0) / 1000) };
      resolve();
    });
  });
(async () => {
  const queue = [...groups];
  await Promise.all(Array.from({ length: Math.min(jobs, queue.length) }, async () => {
    while (queue.length) await run(queue.shift());
  }));
  console.log('\n===== 平行執行結果（總耗時 ' + Math.round((Date.now() - started) / 1000) + ' 秒）=====');
  for (const [g, r] of Object.entries(results)) console.log(`${r.code === 0 ? '✅' : '❌'} ${g}  ${r.sec} 秒  exit ${r.code}`);
  process.exit(Object.values(results).some((r) => r.code !== 0) ? 1 : 0);
})();
