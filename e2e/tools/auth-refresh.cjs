// run-case / run-parallel / probe-page 共用：
// 1. requireNode()：Node 版本不足時直接說明，不要丟出看不懂的 TypeError（process.loadEnvFile 與 Playwright 1.63 都要 Node 20.12 以上）。
// 2. ensureFreshAuth()：後端 token 簽發後約 2 小時就失效（middlewareServer spiderman/token.js：有效 1 小時 + 驗證寬限 1 小時），
//    而 setup 只登入一次、所有測項共用 e2e/.auth/admin.json；整批跑超過 2 小時，後面的測項會變成登入頁而全部失敗。
//    所以每組開始前，登入狀態檔超過 30 分鐘（或不存在）就重新登入一次（整組最長約 90 分鐘內都有效）。
const fs = require('fs');
const { spawn } = require('child_process');

const STORAGE = 'e2e/.auth/admin.json';
const MAX_AGE_MS = 30 * 60000;

function requireNode() {
  const [major, minor] = process.versions.node.split('.').map(Number);
  if (major < 20 || (major === 20 && minor < 12)) {
    console.error(`需要 Node.js 20.12 以上才能跑 E2E（目前 ${process.version}）。請先切換版本，例如：nvm use 24`);
    process.exit(1);
  }
}

const authAge = () => (fs.existsSync(STORAGE) ? Date.now() - fs.statSync(STORAGE).mtimeMs : Infinity);

let chain = Promise.resolve();
/** 必要時重新登入（setup 專案）。多組同時呼叫會排隊，不會同時登入。回傳 setup 的結束碼（0 表示可用）。 */
function ensureFreshAuth({ env = process.env, force = false, label = '' } = {}) {
  const mine = chain.then(
    () =>
      new Promise((resolve) => {
        const age = authAge();
        if (!force && age < MAX_AGE_MS) return resolve(0);
        const why = age === Infinity ? '登入狀態檔不存在' : `登入狀態檔已 ${Math.round(age / 60000)} 分鐘`;
        console.log(`${label}${why}，重新登入（後端 token 約 2 小時失效）`);
        const cli = require.resolve('@playwright/test/cli');
        const p = spawn(process.execPath, [cli, 'test', '--project=setup', '--reporter=line'], { stdio: 'inherit', env: { ...env, E2E_VIA_RUNNER: '1' } });
        p.on('close', (code) => resolve(code ?? 1));
      }),
  );
  chain = mine.catch(() => 0);
  return mine;
}

module.exports = { requireNode, ensureFreshAuth };
