import { Page } from '@playwright/test';

// vxe-table 清單 helper（分頁讀取、搜尋）。

export const bodyRows = (page: Page) => page.locator('.vxe-table--body-wrapper tbody tr');

const rowText = async (page: Page) =>
  (await bodyRows(page).evaluateAll((rows) => rows.map((r) => (r as HTMLElement).innerText.replace(/\s+/g, ' ').trim()))).filter(
    (s) => s.length > 0,
  );

/** 讀取目前清單所有分頁的列文字（每列一個字串）。會從第 1 頁開始、逐頁點「下一頁」。 */
export async function readAllRows(page: Page, mergeContinuation = true): Promise<string[]> {
  const first = page.locator('.vxe-pager .vxe-pager--num-btn').first();
  if ((await first.count()) > 0) await first.click().catch(() => {});
  const all: string[] = [];
  for (let guard = 0; guard < 50; guard += 1) {
    all.push(...(await rowText(page)));
    const next = page.locator('.vxe-pager--next-btn').first();
    if ((await next.count()) === 0 || (await next.getAttribute('class'))?.includes('is--disabled')) break;
    await next.click();
    await page.waitForTimeout(300);
  }
  // 出勤報表每位人員佔 2 個 tr，第二列以數字開頭（日期或日曆日號）；併回上一列，使「一列＝一位人員」
  if (!mergeContinuation) return all; // 一列就是一筆資料的清單（如系統日誌、報表）
  const merged: string[] = [];
  for (const r of all) {
    // 續列以日期（2026-10-14）或日曆日號（01 02 …）開頭；人員編號、姓名是純數字（例如 1111）時不能當續列
    if (/^(\d{4}-\d{2}-\d{2}|\d{2} \d{2})/.test(r) && merged.length > 0) merged[merged.length - 1] += ` ${r}`;
    else merged.push(r);
  }
  return merged;
}

/** 在頁面右上角的搜尋框輸入關鍵字（placeholder 為「搜尋」）。 */
export async function typeSearch(page: Page, keyword: string) {
  const box = page.getByPlaceholder('搜尋').first();
  await box.fill(keyword);
  await box.press('Enter');
  await page.waitForTimeout(500);
}

/** 清單載入完成：有資料列，或分頁顯示「共 0 項記錄」且穩定 2 秒仍為 0（空環境）。取代 ，避免空清單逾時。 */
export async function listReady(page: Page, timeout = 30000) {
  const pager = page.locator('.vxe-pager').getByText('共 0 項記錄');
  await bodyRows(page).first().or(pager).first().waitFor({ timeout });
  if ((await bodyRows(page).count()) === 0) {
    await page.waitForTimeout(2000);
    await bodyRows(page).first().or(pager).first().waitFor({ timeout });
  }
}
