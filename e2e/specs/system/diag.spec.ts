import { test, expect, Page } from '@playwright/test';
import { csvAnnotations } from '../../helpers/csvSource';

// 診斷頁：只檢查按鈕狀態，不按「診斷」（診斷會重啟服務）、不匯出。
async function openDiagnose(page: Page) {
  await page.goto('/#/systemsettings/diagnose');
  await page.reload();
  await expect(page.locator('select')).toBeVisible();
}
const diagnoseButton = (page: Page) => page.locator('button').filter({ hasText: '診斷' }).first();
const exportButton = (page: Page) => page.locator('button').filter({ hasText: '匯出系統日誌' }).first();
async function selectFirstDevice(page: Page) {
  const opt = page.locator('select option', { hasText: 'Camera-1' }).first();
  await page.locator('select').selectOption((await opt.getAttribute('value')) ?? '');
}

// 骨架（自動產生）：來源 E2E-TEST-PLAN.md；模組 DIAG，共 21 個 Test ID。
// 目前全部為 test.fixme（尚未實作）。實作時不得改動 Test ID 與標題前綴；assertion 只能依 Plan 的預期結果。
// 注意：fixme 不等於「使用者同意跳過」，Results 狀態需依 E2E-TEST-RULE.md §5 另行判定。

test.describe("DIAG", () => {


  // 建議執行方式：PW｜可行性：Y｜本輪處置：可進入實作
  test(
    "[DIAG-002] 設備診斷：選項為單選",
    { annotation: csvAnnotations({ row: 194, no: '11.10', category: '診斷 > 設備診斷', steps: '選擇設備', expected: '2.選項為單選' }) },
    async ({ page }) => {
      await openDiagnose(page);
      const sel = page.locator('select');
      // 單選：下拉選單沒有 multiple 屬性，且一次只能選到一個值
      expect(await sel.evaluate((e) => (e as HTMLSelectElement).multiple), '設備選單為多選').toBe(false);
      const options = await sel.locator('option').evaluateAll((os) => os.map((o) => ({ v: (o as HTMLOptionElement).value, t: (o.textContent ?? '').trim() })));
      const real = options.filter((o) => o.v);
      expect(real.length).toBeGreaterThan(1);
      await sel.selectOption(real[0].v);
      await sel.selectOption(real[1].v);
      const selected = await sel.evaluate((e) => Array.from((e as HTMLSelectElement).selectedOptions).map((o) => o.value));
      expect(selected, '選了第二個設備後仍保留多個選取').toEqual([real[1].v]);
    },
  );

  test(
    "[DIAG-003] 設備診斷：未選擇設備前，診斷和匯出 sysLog 按鈕 disable",
    { annotation: csvAnnotations({ row: 194, no: '11.10', category: '診斷 > 設備診斷', steps: '選擇設備', expected: '3.未選擇設備前，診斷和匯出 sysLog 的按鈕 disable' }) },
    async ({ page }) => {
      await openDiagnose(page);
      await expect(diagnoseButton(page)).toBeDisabled();
      await expect(exportButton(page)).toBeDisabled();
    },
  );

  // 建議執行方式：PW｜可行性：Y｜本輪處置：可進入實作
  test(
    "[DIAG-004] 設備診斷：選定設備後診斷按鈕 enable，匯出 sysLog 維持 disable",
    { annotation: csvAnnotations({ row: 194, no: '11.10', category: '診斷 > 設備診斷', steps: '選擇設備', expected: '4.選定設備後，診斷按鈕 enable，匯出 sysLog 維持 disable' }) },
    async ({ page }) => {
      await openDiagnose(page);
      await selectFirstDevice(page);
      await expect(diagnoseButton(page)).toBeEnabled();
      await expect(exportButton(page)).toBeDisabled();
    },
  );

  // 建議執行方式：PW｜可行性：Y｜本輪處置：可進入實作
  test(
    "[DIAG-005] Diagnose 按鈕：未選定設備時按鈕為 disable",
    { annotation: csvAnnotations({ row: 195, no: '', category: '（延續 11.10）> Diagnose 按鈕', steps: 'Diagnose 按鈕', expected: '未選定設備的時候，按鈕狀態為 disable' }) },
    async ({ page }) => {
      await openDiagnose(page);
      await expect(diagnoseButton(page)).toBeDisabled();
    },
  );

  // 建議執行方式：PW｜可行性：Y｜本輪處置：可進入實作
  test(
    "[DIAG-006] Diagnose 按鈕：選定設備尚未診斷時按鈕為 enable",
    { annotation: csvAnnotations({ row: 195, no: '', category: '（延續 11.10）> Diagnose 按鈕', steps: 'Diagnose 按鈕', expected: '選定設備尚未開始診斷，按鈕狀態為 enable' }) },
    async ({ page }) => {
      await openDiagnose(page);
      await selectFirstDevice(page);
      await expect(diagnoseButton(page)).toBeEnabled();
    },
  );




  // 建議執行方式：MIX:PW+HW｜可行性：P｜本輪處置：暫不測



  // 建議執行方式：MIX:PW+HW｜可行性：P｜本輪處置：暫不測





  // 建議執行方式：MIX:SSH+HW｜可行性：T｜本輪處置：暫不測




});
