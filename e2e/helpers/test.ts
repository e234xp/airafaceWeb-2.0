import { test as base, expect } from '@playwright/test';
import * as fs from 'fs';
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

// 停損只在「測全部」（E2E_RUN_MODE=full，npm run e2e / e2e:parallel）時套用，指定測項（e2e:case）永遠不卡，不分人或 AI。
// 套用時只看「這一次執行」的紀錄（E2E_RUN_ID 相同）：同一個測項在這次執行內未通過，且嘗試次數或累計耗時達上限，
// 就跳過它，不再繼續花時間。先前執行留下的次數不會影響這次（budget-reporter 換了新的執行就從 0 重算）。
const FULL_RUN = process.env.E2E_RUN_MODE === 'full';
const BUDGET_MAX_ATTEMPTS = Number(process.env.E2E_CASE_MAX_ATTEMPTS || 5);
const BUDGET_MAX_MS = Number(process.env.E2E_CASE_STUCK_TIMEOUT_MINUTES || 5) * 60000;

/** 這個測項在這次「測全部」執行內是否已超過停損；沒超過回傳 null，超過回傳要顯示的跳過原因。 */
function budgetSkipReason(title: string): string | null {
  const testId = /^\[([A-Z0-9]+-\d+)\]/.exec(title)?.[1];
  if (!FULL_RUN || !testId) return null;
  try {
    const entry = JSON.parse(fs.readFileSync('e2e/reports/budget.json', 'utf8'))[testId];
    if (entry && entry.runId === process.env.E2E_RUN_ID && !entry.passed && (entry.attempts >= BUDGET_MAX_ATTEMPTS || entry.totalMs >= BUDGET_MAX_MS)) {
      return `停損：這次執行內已嘗試 ${entry.attempts}/${BUDGET_MAX_ATTEMPTS} 次、累計 ${(entry.totalMs / 60000).toFixed(1)}/${BUDGET_MAX_MS / 60000} 分鐘仍未通過`;
    }
  } catch {
    // 讀不到記帳檔就當作沒超過
  }
  return null;
}

export const test = base.extend<{ _mockReport: void; _boardsPaused: void; _budgetStop: void }, { _mockBrowser: void }>({
  _budgetStop: [
    async ({}, use, testInfo) => {
      const reason = budgetSkipReason(testInfo.title);
      testInfo.skip(reason !== null, reason ?? '');
      await use();
    },
    { auto: true },
  ],
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
