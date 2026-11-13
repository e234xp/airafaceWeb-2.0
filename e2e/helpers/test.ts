import { test as base, expect } from '@playwright/test';
import { IS_MOCK, installMockFallback, resetMockUses, takeMockUses } from '../mock/fakeBackend';
import { TEST_TIMEOUT_SECONDS } from './timeouts';

// 所有 spec 都從這裡匯入 test／expect。
// 預設完全走真後端；.env.e2e.local 設 E2E_IS_MOCK=true 時，每個瀏覽器環境（含 browser.newContext 自建的）
// 都會套上「真實環境沒資料才補假資料」的層，並在報告標示哪些測項用了假資料（annotation 類型 mockData、
// 終端機一行 [MOCK_DATA]）。
export * from '@playwright/test';
export { expect, IS_MOCK };

// 看板測項（specs/displays/ 全部測項與依賴看板設定的 GRP-013／014／015）預設一起跑，npm run e2e 不省略任何測項。
// 2026-10-27 曾暫停過（14.21 的 setdashboardsettings 儲存看板設定要 20～100 秒，且部分項目需要持續的人員辨識事件），2026-11-10 決定恢復。
// 真的要跳過看板時，明確設 E2E_INCLUDE_BOARDS=false（例如 .env.e2e.local），報告會顯示「跳過」與原因。
const INCLUDE_BOARDS = process.env.E2E_INCLUDE_BOARDS !== 'false';
const isBoardTest = (file: string, title: string) => /specs[\\/]displays[\\/]/.test(file) || /\[GRP-01[345]\]/.test(title);

export const test = base.extend<{ _mockReport: void; _boardsPaused: void; _timeoutById: void }, { _mockBrowser: void }>({
  // 依測項 ID 套用個別時間上限（見 helpers/timeouts.ts）；沒列出的用設定檔預設值。
  // 用 Playwright 原生的 testInfo.setTimeout，逾時就由 Playwright 直接判定失敗，不需要自製的記帳或停損。
  _timeoutById: [
    async ({}, use, testInfo) => {
      const testId = /\[([A-Z0-9]+-\d+)\]/.exec(testInfo.title)?.[1];
      const seconds = testId ? TEST_TIMEOUT_SECONDS[testId] : undefined;
      if (seconds) testInfo.setTimeout(seconds * 1000);
      await use();
    },
    { auto: true },
  ],
  _boardsPaused: [
    async ({}, use, testInfo) => {
      testInfo.skip(!INCLUDE_BOARDS && isBoardTest(testInfo.file, testInfo.title), '已設定 E2E_INCLUDE_BOARDS=false，跳過看板測項');
      await use();
    },
    { auto: true },
  ],
  _mockBrowser: [
    async ({ browser }, use) => {
      if (IS_MOCK) {
        const orig = browser.newContext.bind(browser);
        (browser as any).newContext = async (...a: Parameters<typeof orig>) => {
          const ctx = await orig(...a);
          await installMockFallback(ctx);
          return ctx;
        };
      }
      await use();
    },
    { scope: 'worker', auto: true },
  ],
  _mockReport: [
    async ({}, use, testInfo) => {
      resetMockUses();
      await use();
      const uses = takeMockUses();
      if (!IS_MOCK || uses.length === 0) return;
      const text = uses.map((u) => `${u.endpoint}：${u.reason}`).join('；');
      testInfo.annotations.push({ type: 'mockData', description: `此測項使用了假資料（${text}）` });
      console.log(`[MOCK_DATA] ${testInfo.title.slice(0, 60)} → ${text}`);
    },
    { auto: true },
  ],
});
