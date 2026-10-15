import { Browser, BrowserContext, Page, expect } from '@playwright/test';
import { fillCredentials, loginForm, openLoginPage } from './auth';

// 帳號管理頁操作 helper。介面語言固定為繁體中文（見 e2e/setup/auth.setup.ts）。
// 測試帳號一律以 e2e- 開頭，並於測項結束時清理；絕不操作既有帳號（Admin、user 等）。

export type Permission = 'Admin' | 'PowerUser' | 'User';

export function uniqueAccountName(tag: string) {
  return `e2e-${tag}-${Date.now().toString(36).slice(-5)}`.slice(0, 20);
}

export const TEST_PASSWORD = 'E2e-Pass-1';

export async function gotoAccountManagement(page: Page) {
  await page.goto('/#/systemsettings/accountmanagement');
  // 只換 hash 不會重新載入資料，強制重新載入以取得最新帳號清單與清空搜尋狀態
  await page.reload();
  await page.locator('.vxe-table--body-wrapper tbody tr').first().waitFor();
}

export const rowOf = (page: Page, username: string) =>
  page.locator('.vxe-table--body-wrapper tbody tr').filter({ hasText: username });

export async function searchAccount(page: Page, keyword: string) {
  const box = page.locator('input[placeholder]').filter({ hasNot: page.locator('[type=password]') }).last();
  await box.fill(keyword);
  await box.press('Enter');
}

async function dismissAlert(page: Page) {
  // sweetalert 成功/失敗提示會自動關閉（約 3 秒），等其消失避免擋住後續操作
  await page.locator('.swal2-container').waitFor({ state: 'detached', timeout: 10000 }).catch(() => {});
}

/** 以 Admin 登入狀態的頁面，透過 UI 建立測試帳號。 */
export async function createAccountViaUI(page: Page, a: { name: string; password: string; permission: Permission }) {
  await gotoAccountManagement(page);
  await page.locator('button.btn-primary').first().click(); // 新增
  const inputs = page.locator('table.table-layout input');
  await inputs.nth(0).fill(a.name);
  await inputs.nth(1).fill(a.password);
  await inputs.nth(2).fill(a.password);
  await page.locator('table.table-layout select').selectOption(a.permission);
  const submit = page.locator('.row.justify-content-center button.btn-primary').last();
  await expect(submit).toBeEnabled();
  await submit.click(); // 創建 → 進入完成頁
  await page.locator('.display-4').waitFor({ timeout: 10000 });
  await submit.click(); // 完成 → 返回清單
  await page.locator('.vxe-table--body-wrapper tbody tr').first().waitFor();
}

/** 以 Admin 登入狀態的頁面，透過 UI 刪除測試帳號；帳號不存在時不報錯（供 cleanup 使用）。 */
export async function deleteAccountViaUI(page: Page, name: string): Promise<boolean> {
  if (!name.startsWith('e2e-')) throw new Error(`拒絕刪除非 e2e- 開頭的帳號：${name}`);
  await gotoAccountManagement(page);
  const row = rowOf(page, name);
  if ((await row.count()) === 0) return false;
  await row.first().locator('.vxe-cell--checkbox').click();
  await page.locator('button.btn-danger').first().click(); // 刪除
  await page.locator('.el-message-box__btns .el-button--primary').click();
  await page.locator('.swal2-icon.swal2-success').waitFor();
  await dismissAlert(page);
  return true;
}

/** 建立不繼承專案 storageState 的全新瀏覽器環境（用於以其他帳號登入）。 */
export async function freshContext(browser: Browser): Promise<BrowserContext> {
  return browser.newContext({ ignoreHTTPSErrors: true, baseURL: process.env.E2E_BASE_URL });
}

export async function loginAs(page: Page, username: string, password: string) {
  await openLoginPage(page);
  await loginForm(page).language.selectOption('zh');
  await fillCredentials(page, username, password);
  await loginForm(page).loginButton.click();
}

export async function expectLoginFails(page: Page, username: string, password: string) {
  await loginAs(page, username, password);
  await expect(page.locator('.swal2-icon.swal2-error')).toBeVisible();
  await expect(page).toHaveURL(/login/);
}

export async function expectLoginSucceeds(page: Page, username: string, password: string) {
  await loginAs(page, username, password);
  await expect(page).not.toHaveURL(/login/);
}

/** 在帳號管理頁，把指定帳號的密碼改成新密碼並按「儲存變更」。 */
export async function changePasswordViaUI(page: Page, username: string, newPassword: string) {
  await gotoAccountManagement(page);
  const row = rowOf(page, username).first();
  await row.locator('td').nth(2).dblclick(); // 密碼欄
  await row.locator('input[type=password]').fill(newPassword);
  await row.locator('input[type=button]').click(); // 儲存變更
}

export const ADMIN_STORAGE_PATH = 'e2e/.auth/admin.json';

/** 以獨立的 Admin 瀏覽器環境清理測試帳號（不依賴測項本身的 page，測項逾時／失敗時仍可執行）。 */
export async function cleanupAccounts(browser: Browser, names: string[]) {
  if (names.length === 0) return;
  const ctx = await browser.newContext({
    ignoreHTTPSErrors: true,
    baseURL: process.env.E2E_BASE_URL,
    storageState: ADMIN_STORAGE_PATH,
  });
  try {
    const page = await ctx.newPage();
    for (const n of names) await deleteAccountViaUI(page, n).catch(() => {});
  } finally {
    await ctx.close();
  }
}

/** 勾選指定帳號並嘗試按「刪除」→ 確認（若該列無法勾選則略過），用於驗證「不能刪除」。 */
export async function attemptDeleteAccounts(page: Page, names: string[]) {
  await gotoAccountManagement(page);
  for (const n of names) {
    const box = rowOf(page, n).first().locator('.vxe-cell--checkbox');
    if ((await box.count()) > 0) await box.click().catch(() => {});
  }
  await page.locator('button.btn-danger').first().click().catch(() => {});
  await page
    .locator('.el-message-box__btns .el-button--primary')
    .click({ timeout: 3000 })
    .catch(() => {});
  await dismissAlert(page);
}

/** 讀取帳號清單中的帳號名稱（以 Admin 的獨立頁面檢查）。 */
export async function listAccountNames(page: Page): Promise<string[]> {
  await gotoAccountManagement(page);
  return (await page.locator('.vxe-table--body-wrapper tbody tr td:nth-child(2)').allInnerTexts()).map((s) => s.trim());
}

/** 嘗試新增帳號並回傳畫面結果（提示文字或「進入完成頁」），不假設一定會成功。 */
export async function attemptCreateAccountViaUI(
  page: Page,
  a: { name: string; password: string; permission: Permission },
): Promise<string> {
  await gotoAccountManagement(page);
  await page.locator('button.btn-primary').first().click();
  const inputs = page.locator('table.table-layout input');
  await inputs.nth(0).fill(a.name);
  await inputs.nth(1).fill(a.password);
  await inputs.nth(2).fill(a.password);
  await page.locator('table.table-layout select').selectOption(a.permission);
  await page.locator('.row.justify-content-center button.btn-primary').last().click();
  const popup = page.locator('.swal2-popup');
  const done = page.locator('.display-4');
  await popup.or(done).first().waitFor({ timeout: 8000 }).catch(() => {});
  if (await done.isVisible()) return '建立成功（出現完成頁）';
  return ((await popup.innerText({ timeout: 1000 }).catch(() => '')) || '無提示').trim().replace(/\s+/g, ' ');
}
