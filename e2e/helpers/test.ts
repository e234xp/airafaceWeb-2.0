import { test as base, expect } from '@playwright/test';
import { IS_MOCK, installMockFallback, resetMockUses, takeMockUses } from '../mock/fakeBackend';

// 所有 spec 都從這裡匯入 test／expect。
// 預設完全走真後端；.env.e2e.local 設 E2E_IS_MOCK=true 時，每個瀏覽器環境（含 browser.newContext 自建的）
// 都會套上「真實環境沒資料才補假資料」的層，並在報告標示哪些測項用了假資料（annotation 類型 mockData、
// 終端機一行 [MOCK_DATA]）。
export * from '@playwright/test';
export { expect, IS_MOCK };

// 看板測項暫停（2026-10-27 決定）：預設跳過 specs/displays/ 全部測項與依賴看板設定的 GRP-013／014／015，
// 報告會顯示「跳過」與原因。原因是 14.21 的 setdashboardsettings（儲存看板設定）要 20～100 秒，且部分項目需要持續的人員辨識事件。
// 要恢復：.env.e2e.local 設 E2E_INCLUDE_BOARDS=true。
const INCLUDE_BOARDS = process.env.E2E_INCLUDE_BOARDS === 'true';
const isBoardTest = (file: string, title: string) => /specs[\\/]displays[\\/]/.test(file) || /\[GRP-01[345]\]/.test(title);

export const test = base.extend<{ _mockReport: void; _boardsPaused: void }, { _mockBrowser: void }>({
  _boardsPaused: [
    async ({}, use, testInfo) => {
      testInfo.skip(!INCLUDE_BOARDS && isBoardTest(testInfo.file, testInfo.title), '看板測項暫停（E2E_INCLUDE_BOARDS=true 可恢復）');
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
