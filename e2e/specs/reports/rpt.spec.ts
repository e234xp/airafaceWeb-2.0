import { test, expect, Page } from '../../helpers/test';
import { csvAnnotations } from '../../helpers/csvSource';
import { bodyRows } from '../../helpers/tables';

// 報表頁 helper。人員報表資料量大（約 150 萬筆），查詢一律先縮小時間範圍。
async function openReport(page: Page, route: string) {
  await page.goto(route);
  await page.reload();
  await page.locator('.mx-datepicker input').first().waitFor();
}
const pageRows = async (page: Page) =>
  (await bodyRows(page).evaluateAll((rows) => rows.map((r) => (r as HTMLElement).innerText.replace(/\s+/g, ' ').trim()))).filter(
    (s) => s.length > 0,
  );
// 第 row 列第 col 欄（從 1 起算）的文字
const cell = async (page: Page, row: number, col: number) =>
  bodyRows(page).nth(row).locator(`td:nth-child(${col})`).textContent();
// 把時間範圍縮到第一列所在的那一分鐘並重新查詢（日期時間取自該列「時間」欄）
async function narrowToFirstRowMinute(page: Page) {
  await bodyRows(page).first().waitFor();
  const t = ((await cell(page, 0, 1)) ?? '').trim(); // 例：2026-10-07 15:36:00（格式依畫面）
  const hhmm = t.slice(-8, -3);
  const day = t.slice(0, t.indexOf(' ') > 0 ? t.indexOf(' ') : 10);
  const range = page.locator('.mx-datepicker input').first();
  await range.fill(`${day} ${hhmm}:00 ~ ${day} ${hhmm}:59`);
  await range.press('Enter');
  await page.locator('button', { hasText: '搜尋' }).first().click();
  await page.waitForTimeout(2000);
  await bodyRows(page).first().waitFor();
}

// 骨架（自動產生）：來源 E2E-TEST-PLAN.md；模組 RPT，共 12 個 Test ID。
// 目前全部為 test.fixme（尚未實作）。實作時不得改動 Test ID 與標題前綴；assertion 只能依 Plan 的預期結果。
// 注意：fixme 不等於「使用者同意跳過」，Results 狀態需依 E2E-TEST-RULE.md §5 另行判定。

test.describe("RPT", () => {

  // 建議執行方式：PW｜可行性：Y｜本輪處置：可進入實作
  test(
    "[RPT-002] 人員報表：搜尋文字功能",
    {
      annotation: csvAnnotations({
        row: 39,
        no: '4.1',
        category: '人員報表 > 人員報表',
        steps: '1. 指定時間範圍搜尋、由近而遠列出辨識到人員的紀錄\n2. 欄位: 時間、人員編號、人員姓名、群組、分數、抓拍照片\n3. 每頁最多10筆',
        expected: '2.搜尋文字功能正確',
      }),
    },
    async ({ page }) => {
      test.setTimeout(120000);
      await openReport(page, '/#/reports/personreport');
      // 為避免對約 150 萬筆資料做全量搜尋造成後端負載，先把時間範圍縮到「最新一筆所在的那一分鐘」
      await narrowToFirstRowMinute(page);
      // 關鍵字取該分鐘內第一筆的人員編號；搜尋結果（第 1 頁）每一列都應含關鍵字
      const keyword = ((await cell(page, 0, 3)) ?? '').trim();
      expect(keyword.length).toBeGreaterThan(0);
      const box = page.getByPlaceholder('搜尋').first();
      await box.fill(keyword);
      await box.press('Enter');
      await page.waitForTimeout(1500);
      const rows = await pageRows(page);
      expect(rows.length).toBeGreaterThan(0);
      for (const r of rows) expect(r).toContain(keyword);
      // 不存在的關鍵字：無結果
      await box.fill('e2e-no-such-person-zzz');
      await box.press('Enter');
      await page.waitForTimeout(1500);
      expect(await pageRows(page)).toEqual([]);
    },
  );






  // 建議執行方式：PW｜可行性：Y｜本輪處置：可進入實作
  test(
    "[RPT-008] 訪客報表：訪客編號、訪客姓名、群組搜尋與包含輸入文字的項目",
    {
      annotation: csvAnnotations({
        row: 42,
        no: '4.2',
        category: '訪客報表 > 訪客報表',
        steps: '4.在訪客編號、訪客姓名、群組搜尋與包含輸入文字的項目',
        expected: '2.搜尋文字功能正確',
      }),
    },
    async ({ page }) => {
      test.setTimeout(120000);
      await openReport(page, '/#/reports/visitorreport');
      // 訪客報表預設範圍沒有資料時，改查較長的區間
      const range = page.locator('.mx-datepicker input').first();
      await range.fill('2020-01-01 00:00:00 ~ 2026-12-31 23:59:59');
      await range.press('Enter');
      await page.locator('button', { hasText: '搜尋' }).first().click();
      await page.waitForTimeout(3000);
      const before = await pageRows(page);
      if (before.length === 0) {
        throw new Error('受阻：訪客報表在 2020-01-01 ~ 2026-12-31 沒有任何訪客辨識紀錄，無法驗證搜尋');
      }
      // 關鍵字取第一列的訪客編號（第 3 欄）；搜尋結果（第 1 頁）每一列都應含關鍵字
      const keyword = ((await cell(page, 0, 3)) ?? '').trim();
      const box = page.getByPlaceholder('搜尋').first();
      await box.fill(keyword);
      await box.press('Enter');
      await page.waitForTimeout(1500);
      const rows = await pageRows(page);
      expect(rows.length).toBeGreaterThan(0);
      for (const r of rows) expect(r).toContain(keyword);
      await box.fill('e2e-no-such-visitor-zzz');
      await box.press('Enter');
      await page.waitForTimeout(1500);
      expect(await pageRows(page)).toEqual([]);
    },
  );





});
