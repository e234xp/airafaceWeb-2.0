import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';

if (existsSync('.env.e2e.local')) process.loadEnvFile('.env.e2e.local');

export const ADMIN_STORAGE = 'e2e/.auth/admin.json';

// 平行執行（E2E_PARALLEL=1，由 e2e/tools/run-parallel.cjs 啟動）：依「共用狀態」分成幾組，每組內部序列（workers=1）、組與組之間平行。
// 分組原則：會改動同一份共用資料（看板設定、出勤設定、攝影機／平板清單、人員／群組／事件清單、帳號）的測項放在同一組，不同組互不影響。
const PARALLEL = process.env.E2E_PARALLEL === '1';
const withAdmin = { storageState: ADMIN_STORAGE };
const groupProjects = [
  { name: 'boards', testMatch: /specs[\\/]displays[\\/].*\.spec\.ts/, use: withAdmin }, // 各種看板（看板設定全系統共用）
  { name: 'devices', testMatch: /specs[\\/]devices[\\/].*\.spec\.ts/, use: withAdmin }, // 攝影機／平板／影像設備群組清單
  { name: 'people-events', testMatch: /specs[\\/](persons|events-notify)[\\/].*\.spec\.ts/, use: withAdmin }, // 人員／訪客／群組／事件／通知清單
  { name: 'system', testMatch: /specs[\\/](system|infra|integration)[\\/].*\.spec\.ts/, use: withAdmin }, // 系統設定、帳號、診斷
  { name: 'reports', testMatch: /specs[\\/]reports[\\/].*\.spec\.ts/, use: withAdmin }, // 調查、報表、進出紀錄（唯讀）
  { name: 'login', testMatch: /specs[\\/]login[\\/].*\.spec\.ts/ }, // 登入登出（各自登入）
];

export default defineConfig({
  testDir: './e2e',
  outputDir: './e2e/reports/artifacts',
  // 單一測項的時間上限預設 90 秒：近三次完整測試裡，211 項中有 138 項通過時都在 60 秒內（×1.5 仍在 90 秒內）。
  // 比較慢的 73 項在 helpers/timeouts.ts 個別設定，由 helpers/test.ts 依測項 ID 套用。
  timeout: 90000,
  // 完整測試（run-parallel.cjs 會設 E2E_PARALLEL=1）失敗時自動重試 1 次，吸收測試機偶爾變慢造成的失敗；
  // 重試才通過的測項在報告裡標為 flaky，不會被當成正常通過而藏起來。單項執行不重試，失敗就直接看到原因。
  retries: PARALLEL ? 1 : 0,
  reporter: [['list'], ['html', { outputFolder: './e2e/reports/html', open: 'never' }]],
  use: {
    viewport: {
    width: 1920,
    height: 1080,
    },
    baseURL: process.env.E2E_BASE_URL,
    // 單一動作（點擊、輸入、導覽）最多等 30 秒：腳本寫錯或畫面卡住時盡快失敗，不要把整個測項的時間上限耗在一個動作上
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
