import { test, expect, Page } from '@playwright/test';
import { csvAnnotations } from '../../helpers/csvSource';
import { shot } from '../../helpers/evidence';
import { bodyRows, readAllRows } from '../../helpers/tables';

// 來源 E2E-TEST-PLAN.md；模組 LOGS，共 2 個 Test ID（CSV 第 190 列 #11.8 系統日誌）。
// 僅讀取系統日誌，不產生任何資料。

const localDate = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

async function openSystemLog(page: Page) {
  await page.goto('/#/systemsettings/systemlog');
  await page.reload();
  await bodyRows(page).first().waitFor();
}

// 取得每列「時間」欄（第 1 欄）的文字（以 textContent 讀取）
const timeCells = (page: Page) =>
  page.locator('.vxe-table--body-wrapper tbody tr td:nth-child(1)').evaluateAll((tds) => tds.map((td) => (td.textContent || '').trim()));

test.describe("LOGS", () => {
  test(
    "[LOGS-001] 系統日誌：選擇查詢期間，正確顯示系統操作、頁數、筆數、顯示欄位",
    {
      annotation: [
        ...csvAnnotations({
          row: 190,
          no: '11.8',
          category: '系統日誌 > 系統日誌',
          steps: '1.可選擇查詢的期間',
          expected: '1.可根據選取的時間正確顯示所有的系統操作、頁數、筆數、顯示欄位',
        }),
        { type: '判定範圍', description: '規格未列「顯示欄位」的名稱與時間顯示格式；時間欄的顯示格式有疑義，見 Results 備註與截圖（部分完成）' },
      ],
    },
    async ({ page }) => {
      await openSystemLog(page);
      // 顯示欄位：時間、等級、資訊
      const headers = (await page.locator('.vxe-table--header-wrapper th').allInnerTexts()).map((s) => s.trim()).filter(Boolean);
      expect(headers).toEqual(['時間', '等級', '資訊']);
      // 筆數與頁數：分頁列「共 N 項記錄」；每頁 10 筆；頁數 = ceil(N / 10)
      const pagerText = await page.locator('.vxe-pager').innerText();
      const total = Number(pagerText.slice(pagerText.indexOf('共')).replace(/[^0-9]/g, ''));
      expect(total).toBeGreaterThan(0);
      const firstPageRows = await bodyRows(page).count();
      expect(firstPageRows).toBe(Math.min(10, total));
      // 選擇查詢期間：以最新一筆日誌所在的那一分鐘為查詢區間，結果應只含該分鐘內的紀錄
      const first = (await timeCells(page))[0];
      const hhmm = first.slice(-8, -3); // HH:mm
      await page.locator('.mx-datepicker input').first().fill(`${localDate(0)} ${hhmm}:00 ~ ${localDate(0)} ${hhmm}:59`);
      await page.locator('.mx-datepicker input').first().press('Enter');
      await page.locator('button', { hasText: '搜尋' }).first().click();
      await expect
        .poll(async () => (await readAllRows(page, false)).length, { timeout: 8000 })
        .toBeGreaterThan(0);
      const rows = await readAllRows(page, false);
      expect(rows.length).toBeLessThanOrEqual(total);
      const times = await timeCells(page);
      for (const t of times) expect(t.slice(-8, -3)).toBe(hhmm);
      await shot(page, 'LOGS-001', '01-系統日誌（時間欄顯示）', false);
    },
  );

  test(
    "[LOGS-002] 系統日誌：關鍵字（資訊欄）搜尋",
    {
      annotation: csvAnnotations({
        row: 190,
        no: '11.8',
        category: '系統日誌 > 系統日誌',
        steps: '2.可輸入關鍵字(資訊欄)進行搜尋',
        expected: '2.可使用文字搜尋功能查詢資料',
      }),
    },
    async ({ page }) => {
      await openSystemLog(page);
      const before = await readAllRows(page, false);
      expect(before.length).toBeGreaterThan(0);
      // 關鍵字取第一列「資訊」欄的第一個單字
      const info = (await page.locator('.vxe-table--body-wrapper tbody tr').first().locator('td').last().textContent()) ?? '';
      const keyword = info.trim().split(' ')[0];
      expect(keyword.length).toBeGreaterThan(0);
      const box = page.getByPlaceholder('搜尋').first();
      await box.fill(keyword);
      await box.press('Enter');
      await page.waitForTimeout(800);
      const after = await readAllRows(page, false);
      expect(after.length).toBeGreaterThan(0);
      for (const r of after) expect(r.toLowerCase()).toContain(keyword.toLowerCase());
      // 不存在的關鍵字：無結果
      await box.fill('e2e-no-such-log-zzz');
      await box.press('Enter');
      await page.waitForTimeout(800);
      expect(await readAllRows(page, false)).toEqual([]);
    },
  );
});
