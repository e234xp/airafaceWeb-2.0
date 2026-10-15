import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';

if (existsSync('.env.e2e.local')) process.loadEnvFile('.env.e2e.local');

// 停損記帳防護（E2E-TEST-RULE.md §7）：直接執行 `npx playwright test` 時若用 --reporter 覆蓋，budget-reporter 不會執行，次數與耗時就不會被記帳，停損形同虛設。
// 因此除了 --list 以外，一律要經 npm run e2e:case／e2e:parallel（會設 E2E_VIA_RUNNER=1）。確需直接執行時設 E2E_ALLOW_DIRECT=1，並自行記錄。
if (!process.env.E2E_VIA_RUNNER && !process.env.E2E_ALLOW_DIRECT && !process.argv.includes('--list') && process.argv.includes('test')) {
  throw new Error('請改用 npm run e2e:case -- <Test ID> 或 npm run e2e:parallel（停損計時才會生效）；確需直接執行請設 E2E_ALLOW_DIRECT=1。');
}

export const ADMIN_STORAGE = 'e2e/.auth/admin.json';

// 平行執行（E2E_PARALLEL=1，由 e2e/tools/run-parallel.cjs 啟動）：依「共用狀態」分成幾組，每組內部序列（workers=1）、組與組之間平行。
// 分組原則：會改動同一份共用資料（看板設定、出勤設定、攝影機／平板清單、人員／群組／事件清單、帳號）的測項放在同一組，不同組互不影響。
const PARALLEL = process.env.E2E_PARALLEL === '1';
const withAdmin = { storageState: ADMIN_STORAGE };
const groupProjects = [
  { name: 'g-dash', testMatch: /specs[\\/]displays[\\/].*\.spec\.ts/, use: withAdmin }, // 看板設定（全系統共用）
  { name: 'g-att', testMatch: /specs[\\/]attendance[\\/].*\.spec\.ts/, use: withAdmin }, // 出勤設定（全系統共用）
  { name: 'g-dev', testMatch: /specs[\\/]devices[\\/].*\.spec\.ts/, testIgnore: /nx-(setup|pos)/, use: withAdmin }, // 攝影機／平板／影像設備群組清單
  { name: 'g-per', testMatch: /specs[\\/](persons|events-notify)[\\/].*\.spec\.ts/, use: withAdmin }, // 人員／訪客／群組／事件／通知清單
  { name: 'g-sys', testMatch: /specs[\\/](system|infra|integration)[\\/].*\.spec\.ts/, use: withAdmin }, // 系統設定、帳號、診斷
  { name: 'g-ro', testMatch: /specs[\\/]reports[\\/].*\.spec\.ts/, use: withAdmin }, // 報表（唯讀）
  { name: 'g-login', testMatch: /specs[\\/]login[\\/].*\.spec\.ts/ }, // 登入登出（各自登入）
];

export default defineConfig({
  testDir: './e2e',
  outputDir: './e2e/reports/artifacts',
  // 單一測項的硬性上限 = E2E_CASE_STUCK_TIMEOUT_MINUTES（預設 5 分鐘）；測項內的 test.setTimeout 不得超過此值（見 E2E-TEST-RULE.md §7）
  timeout: Number(process.env.E2E_CASE_STUCK_TIMEOUT_MINUTES || 5) * 60000,
  retries: 0,
  reporter: [['list'], ['html', { outputFolder: './e2e/reports/html', open: 'never' }], ['./e2e/tools/budget-reporter.cjs']],
  use: {
    baseURL: process.env.E2E_BASE_URL,
    // 單一動作（點擊、輸入、導覽）最多等 30 秒：腳本寫錯時盡快失敗，不要把整個測項的 5 分鐘停損額度耗在一個卡住的動作上
    actionTimeout: 30000,
    navigationTimeout: 30000,
    // 測試機使用自簽憑證；僅為讓瀏覽器能連線，不屬於驗收條件，Results 需註明。
    ignoreHTTPSErrors: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: PARALLEL ? [{ name: 'setup', testMatch: /setup[\\/]auth\.setup\.ts/ }, ...groupProjects] : [
    // 登入一次並儲存登入狀態，供「登入後才測」的模組共用。
    { name: 'setup', testMatch: /setup[\\/]auth\.setup\.ts/ },
    // LOGIN / LOGOUT 要測登入／登出本身，每個測項各自登入，不共用登入狀態。
    { name: 'fresh-login', testMatch: /specs[\\/]login[\\/].*\.spec\.ts/ },
    // 其他模組：載入 Admin 登入狀態，測項開啟即為已登入。
    {
      name: 'admin-session',
      testMatch: /specs[\\/].*\.spec\.ts/,
      testIgnore: /specs[\\/]login[\\/]/,
      dependencies: ['setup'],
      use: { storageState: ADMIN_STORAGE },
    },
  ],
});
