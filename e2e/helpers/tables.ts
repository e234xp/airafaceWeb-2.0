import { Page, expect } from '@playwright/test';

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

/**
 * 拿掉攝影機／平板清單列文字中的「啟用／停用」。這一欄是設備當下有沒有連線（ListForm.vue 的 row.alive），
 * 真實設備的連線會自己變動，與測試操作無關；比對「既有設備有沒有被動到」時只比設定，不比連線狀態。
 * （2026-11-11 TAB-006、2026-11-12 TAB-012 都遇過既有平板在測試中連線狀態改變，被誤判成被改動）
 */
export const withoutLiveStatus = (row: string) => row.replace(/\s(啟用|停用)\s/, ' ');

/**
 * 開啟清單頁，等「取得清單」的 API 回來，再等畫面分頁顯示同樣的筆數，才算載入完成。
 * 只看畫面有沒有資料列不可靠：平板、攝影機清單在資料回來前會先顯示一列空白的預設列，分頁顯示「共 0 項記錄」，
 * 2026-11-12 CAM-001、TAB-012 就是把這列當成已載入，讀到 0 筆而失敗。
 * @param route 清單頁路由，例如 '/#/videodevice/tabletslist'
 * @param apiPath 這個清單取得資料的 API，例如 '/airafacelite/findtablet'；回應的 list 是全部資料（前端一次取回再自己分頁）
 * @returns 後端回傳的資料筆數
 */
export async function openListByApi(page: Page, route: string, apiPath: string) {
  await page.goto(route);
  // 要在重新整理「之前」就開始等，否則回應太快會錯過。
  // 但 goto 換到這一頁時前端已經送過一次同樣的 API；那一次的回應如果在重新整理前後才回來，會被等到，
  // 而頁面一重新整理它的內容就讀不到了（2026-11-12 SEC-010、TAB-009 失敗）。所以只接受重新整理之後才送出的請求。
  const reloadAt = Date.now();
  const response = page.waitForResponse(
    (r) => r.url().endsWith(apiPath) && r.request().method() === 'POST' && r.request().timing().startTime >= reloadAt,
    { timeout: 30000 },
  );
  await page.reload();
  const body = await (await response).json();
  expect(Array.isArray(body.list), `${apiPath} 回應沒有 list（${body.message || '無訊息'}）`).toBe(true);
  const total = body.list.length;
  // API 回來後，前端可能還要等其他 API（例如平板清單要再取設備群組名稱）才把資料放進表格，所以再等分頁筆數對上
  await expect(page.locator('.vxe-pager'), `畫面分頁筆數沒有變成 API 回傳的 ${total} 筆`).toContainText(new RegExp(`共\\s*${total}\\s*項記錄`), { timeout: 15000 });
  return total;
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
