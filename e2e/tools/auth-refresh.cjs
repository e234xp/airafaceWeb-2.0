// run-case / run-parallel / probe-page 共用：
// 1. requireNode()：Node 版本不足時直接說明，不要丟出看不懂的 TypeError（process.loadEnvFile 與 Playwright 1.63 都要 Node 20.12 以上）。
// 2. ensureFreshAuth()：後端 token 簽發後約 2 小時就失效（middlewareServer spiderman/token.js：有效 1 小時 + 驗證寬限 1 小時），
//    而 setup 只登入一次、所有測項共用 e2e/.auth/admin.json；整批跑超過 2 小時，後面的測項會變成登入頁而全部失敗。
//    所以每組開始前，登入狀態檔超過 30 分鐘（或不存在）就重新登入一次（整組最長約 90 分鐘內都有效）。
//    另外，登入狀態檔裡的 cookie 只屬於登入時的網址：用 14.21 登入、這次改用本機開發伺服器（E2E_BASE_URL=https://localhost:8080/）跑，
//    檔案再新也沒有可用的 cookie，每一項都會被導回登入頁（2026-11-10 的完整測試因此前 40 分鐘 128 項全失敗）。所以網址不同也要重新登入。
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

/**
 * 登入狀態檔是在哪個網址登入的（例如 https://192.168.14.21）。
 * @returns 網址的 origin；檔案不存在、內容壞掉或沒有記錄時回傳 null（呼叫端當成「要重新登入」）。
 */
function storedOrigin() {
  try {
    const state = JSON.parse(fs.readFileSync(STORAGE, 'utf8'));
    return (state.origins && state.origins[0] && state.origins[0].origin) || null;
  } catch {
    return null;
  }
}

/** E2E_BASE_URL 的 origin（例如 https://localhost:8080）；沒設或格式不對時回傳 null，不做網址比對。 */
function expectedOrigin(env) {
  try {
    return env.E2E_BASE_URL ? new URL(env.E2E_BASE_URL).origin : null;
  } catch {
    return null;
  }
}

let chain = Promise.resolve();
/** 必要時重新登入（setup 專案）。多組同時呼叫會排隊，不會同時登入。回傳 setup 的結束碼（0 表示可用）。 */
// outputDir：登入這一步的截圖、錄影存放處。各組要用各自的資料夾，否則後一組登入會把前一組登入失敗的截圖蓋掉（2026-11-10 就因此查不到 reports 組登入失敗的畫面）。
function ensureFreshAuth({ env = process.env, force = false, label = '', outputDir = '' } = {}) {
  const mine = chain.then(
    () =>
      new Promise((resolve) => {
        const age = authAge();
        const want = expectedOrigin(env);
        const have = storedOrigin();
        // 只有在知道這次要用的網址時才比對；沒設 E2E_BASE_URL 就維持只看檔案新舊
        const originChanged = age !== Infinity && want !== null && have !== want;
        if (!force && age < MAX_AGE_MS && !originChanged) return resolve(0);
        const why =
          age === Infinity ? '登入狀態檔不存在' : originChanged ? `登入狀態檔是 ${have || '未知網址'} 的，這次要用 ${want}` : `登入狀態檔已 ${Math.round(age / 60000)} 分鐘`;
        console.log(`${label}${why}，重新登入（後端 token 約 2 小時失效）`);
        const cli = require.resolve('@playwright/test/cli');
        const p = spawn(process.execPath, [cli, 'test', '--project=setup', '--reporter=line', ...(outputDir ? [`--output=${outputDir}`] : [])], { stdio: 'inherit', env });
        p.on('close', (code) => resolve(code ?? 1));
      }),
  );
  chain = mine.catch(() => 0);
  return mine;
}

module.exports = { requireNode, ensureFreshAuth };
