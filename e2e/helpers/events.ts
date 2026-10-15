import { Browser, Page, expect } from '@playwright/test';
import { ADMIN_STORAGE_PATH } from './accounts';
import { bodyRows, listReady } from './tables';

// 事件管理頁 helper。測試事件一律以 e2e- 開頭，並綁定「空的測試人員群組＋空的測試影像設備群組」，因此不會被任何真實辨識觸發。
// 絕不操作既有事件（TG-test、SMTP-test、HTTP-test、POST-test、I/O-test、Wiegand-test）。

export const EVT_PREFIX = 'e2e-';
export const EVT_TEST_HOST = '192.0.2.50'; // 文件保留網段，不會連到真實主機

export function uniqueEventName(tag: string) {
  return `e2e-${tag}-${Date.now().toString(36).slice(-5)}`;
}

export async function gotoEvents(page: Page) {
  await page.goto('/#/events/eventcontrolmanagement');
  await page.reload();
  await page.getByRole('button', { name: '新增' }).first().waitFor();
  await listReady(page);
}

export const eventRow = (page: Page, name: string) => bodyRows(page).filter({ hasText: name });

export async function searchEvents(page: Page, keyword: string) {
  const box = page.getByPlaceholder('搜尋').first();
  await box.fill(keyword);
  await box.press('Enter');
  await page.waitForTimeout(1500);
}

export const eventRowTexts = async (page: Page) =>
  (await bodyRows(page).evaluateAll((rows) => rows.map((r) => (r as HTMLElement).innerText.replace(/\s+/g, ' ').trim()))).filter(
    (s) => s.length > 0,
  );

const next = (page: Page) => page.getByRole('button', { name: '下一步' });

export async function openAddEvent(page: Page) {
  await gotoEvents(page);
  await page.getByRole('button', { name: '新增' }).first().click();
  await expect(page).toHaveURL(/createeventcontrolsetting/);
  await page.locator('input[type=text]:visible').first().waitFor();
  await page.waitForTimeout(2000);
}

/** 第 1 步：名稱、事件類別、套用群組（人員群組）、影像設備群組（各選一個指定名稱）。 */
export async function fillEventStep1(page: Page, name: string, personGroup: string, deviceGroup: string, category = 'HTTP 命令') {
  await page.locator('input[type=text]:visible').nth(0).fill(name);
  await page.locator('select:visible').first().selectOption({ label: category });
  const ms = page.locator('.multiselect');
  for (const [i, g] of [personGroup, deviceGroup].entries()) {
    await ms.nth(i).click();
    await page.locator('.multiselect__option:visible').filter({ hasText: g }).first().click();
    await page.keyboard.press('Escape');
  }
}

/** 在週間排程格子上拖曳選取（第 day 列、第 fromHour~toHour 小時）；回傳格子的 boundingBox 供呼叫端使用。 */
export async function dragSchedule(page: Page, day: number, fromHour: number, toHour: number) {
  const table = page.locator('table:visible').first();
  const cells = table.locator('tbody tr').nth(day + 1).locator('td');
  const first = await cells.nth(fromHour + 1).boundingBox();
  const last = await cells.nth(toHour + 1).boundingBox();
  if (!first || !last) throw new Error('找不到排程格子');
  await page.mouse.move(first.x + first.width / 2, first.y + first.height / 2);
  await page.mouse.down();
  await page.mouse.move(last.x + last.width / 2, last.y + last.height / 2, { steps: 6 });
  await page.mouse.up();
}

/** 以介面建立 HTTP 事件（第 2 步只填主機，第 3 步不選排程），完成後回到列表。 */
export async function createEventViaUI(page: Page, name: string, personGroup: string, deviceGroup: string) {
  await openAddEvent(page);
  await fillEventStep1(page, name, personGroup, deviceGroup);
  await expect(next(page)).toBeEnabled();
  await next(page).click();
  await page.locator('input[type=text]:visible').nth(0).fill(EVT_TEST_HOST);
  await expect(next(page)).toBeEnabled();
  await next(page).click(); // → 排程
  await next(page).click(); // → 完成
  await page.getByRole('button', { name: '完成' }).click();
  await listReady(page);
}

export async function deleteEventViaUI(page: Page, name: string) {
  if (!name.startsWith(EVT_PREFIX)) throw new Error(`拒絕刪除非測試事件：${name}`);
  await gotoEvents(page);
  await searchEvents(page, name);
  const row = eventRow(page, name);
  if ((await row.count()) === 0) return;
  const del = row.first().getByRole('button', { name: '刪除' });
  if (await del.isDisabled()) {
    // 啟用中的事件無法刪除：先把開關關閉（測試事件才會走到這裡）
    await setEventEnabled(page, name, false);
  }
  await del.click();
  await page.locator('.el-message-box__btns .el-button--primary').click();
  await expect(eventRow(page, name)).toHaveCount(0, { timeout: 15000 });
}

export async function cleanupEvents(browser: Browser, names: string[]) {
  if (names.length === 0) return;
  const ctx = await browser.newContext({
    ignoreHTTPSErrors: true,
    baseURL: process.env.E2E_BASE_URL,
    storageState: ADMIN_STORAGE_PATH,
  });
  try {
    const page = await ctx.newPage();
    for (const n of names) await deleteEventViaUI(page, n).catch(() => {});
  } finally {
    await ctx.close();
  }
}

export const eventSwitch = (page: Page, name: string) => eventRow(page, name).first().locator('label.switch');

/** 切換事件的啟用開關到指定狀態（只用於測試事件）。 */
export async function setEventEnabled(page: Page, name: string, enabled: boolean) {
  if (!name.startsWith(EVT_PREFIX)) throw new Error(`拒絕切換非測試事件：${name}`);
  const box = eventRow(page, name).first().locator('input[type=checkbox]');
  if ((await box.isChecked()) === enabled) return;
  await eventSwitch(page, name).click();
  await expect.poll(async () => box.isChecked(), { timeout: 10000 }).toBe(enabled);
  await page.waitForTimeout(1500);
}
