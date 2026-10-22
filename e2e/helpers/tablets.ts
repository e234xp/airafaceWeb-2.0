import { Browser, Page, expect } from '@playwright/test';
import { ADMIN_STORAGE_PATH } from './accounts';
import { bodyRows, listReady } from './tables';

// 平板頁 helper。測試平板一律以 e2e- 開頭，註冊 ID 也用 e2e- 字串（不會對應到真實平板，狀態為「停用」），測項結束時清理。
// 絕不操作既有平板（Tablet-21）。

export const TAB_PREFIX = 'e2e-';

export function uniqueTabletName(tag: string) {
  return `e2e-${tag}-${Date.now().toString(36).slice(-5)}`;
}

export async function gotoTablets(page: Page) {
  await page.goto('/#/videodevice/tabletslist');
  await page.reload();
  await page.getByRole('button', { name: '新增' }).first().waitFor();
  await listReady(page);
}

export const tabletRow = (page: Page, name: string) => bodyRows(page).filter({ hasText: name });

export async function searchTablets(page: Page, keyword: string) {
  const box = page.getByPlaceholder('搜尋').first();
  // 以真實鍵盤輸入搜尋（使用者手動輸入 zzzz 會即時更新清單；先前用 fill 直接塞值時，第二次搜尋清單不會更新）
  await box.click();
  await box.press('Control+A');
  await box.press('Delete');
  await box.pressSequentially(keyword, { delay: 40 });
  await box.press('Enter');
  await box.press('Tab'); // 搜尋框為 v-model.lazy（change 事件才更新）；失焦一併觸發，與使用者手動操作相同
  await page.waitForTimeout(2500);
}

export const tabletRowTexts = async (page: Page) =>
  (await bodyRows(page).evaluateAll((rows) => rows.map((r) => (r as HTMLElement).innerText.replace(/\s+/g, ' ').trim()))).filter(
    (s) => s.length > 0,
  );

export const nextBtn = (page: Page) => page.getByRole('button', { name: '下一步' });

export async function openAddTablet(page: Page) {
  await gotoTablets(page);
  await page.getByRole('button', { name: '新增' }).first().click();
  await expect(page).toHaveURL(/addtablets/);
  await page.locator('input[type=text]:visible').first().waitFor();
  await page.waitForTimeout(2000); // 表單載入完成前輸入的值會被重置
}

/** 第 1 步填名稱與註冊 ID。 */
export async function fillTabletBasics(page: Page, name: string) {
  const inputs = page.locator('input[type=text]:visible');
  await inputs.nth(0).fill(name);
  await inputs.nth(1).fill(name); // 註冊 ID 用同樣的唯一字串
}

/** 以介面建立平板：第 1 步填寫、第 2 步用預設值、完成後回到列表。 */
export async function createTabletViaUI(page: Page, name: string) {
  await openAddTablet(page);
  await fillTabletBasics(page, name);
  await expect(nextBtn(page)).toBeEnabled();
  // 門禁設定 → 完成：每按一次等畫面換頁，最後一步的「下一步」會儲存並出現「完成」
  // 第 2 步（門禁設定）載入需要數秒，載入完成前按「下一步」不會有作用（診斷：等 6 秒後再按即可儲存並出現「完成」）
  const done = page.getByRole('button', { name: '完成' });
  await nextBtn(page).click();
  await page.waitForTimeout(6000);
  // 先前在同一個瀏覽器工作階段建立過攝影機後，第 2 步的「下一步」第一次按常無作用：每 3 秒重按，最多 60 秒，直到出現「完成」
  // 每一輪先看目前在哪個畫面再動作：已出現「完成」就收工；還在精靈就按「下一步」；兩個都不在（儲存很快、已回到列表）就不要硬按。
  for (let i = 0; i < 20; i += 1) {
    if (await done.isVisible()) break;
    if (await nextBtn(page).isVisible()) await nextBtn(page).click({ timeout: 10000 }).catch(() => undefined);
    await page.waitForTimeout(3000);
  }
  if (await done.isVisible()) await done.click();
  await listReady(page);
}

export async function deleteTabletViaUI(page: Page, name: string) {
  if (!name.startsWith(TAB_PREFIX)) throw new Error(`拒絕刪除非測試平板：${name}`);
  await gotoTablets(page);
  await searchTablets(page, name);
  const row = tabletRow(page, name);
  if ((await row.count()) === 0) return;
  await row.first().getByRole('button', { name: '刪除' }).click();
  await page.locator('.el-message-box__btns .el-button--primary').click();
  await expect(tabletRow(page, name)).toHaveCount(0, { timeout: 15000 });
}

export async function cleanupTablets(browser: Browser, names: string[]) {
  if (names.length === 0) return;
  const ctx = await browser.newContext({
    ignoreHTTPSErrors: true,
    baseURL: process.env.E2E_BASE_URL,
    storageState: ADMIN_STORAGE_PATH,
  });
  try {
    const page = await ctx.newPage();
    for (const n of names) await deleteTabletViaUI(page, n).catch(() => {});
  } finally {
    await ctx.close();
  }
}
