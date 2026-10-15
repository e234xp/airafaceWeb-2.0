import { Browser, Page, expect } from '@playwright/test';
import { ADMIN_STORAGE_PATH } from './accounts';
import { bodyRows, listReady } from './tables';

// 影像設備群組頁 helper。測試群組一律以 e2e- 開頭，測項結束時清理。絕不操作既有群組（All Cameras、All Tablets、Video Group-*、test）。

export const DG_PREFIX = 'e2e-';

export function uniqueDeviceGroupName(tag: string) {
  return `e2e-${tag}-${Date.now().toString(36).slice(-5)}`;
}

export async function gotoDeviceGroups(page: Page) {
  await page.goto('/#/videodevice/devicegroups');
  await page.reload();
  await page.getByRole('button', { name: '新增' }).first().waitFor();
  await listReady(page);
}

export const dgRow = (page: Page, name: string) => bodyRows(page).filter({ hasText: name });

export async function searchDeviceGroups(page: Page, keyword: string) {
  const box = page.getByPlaceholder('搜尋').first();
  await box.fill(keyword);
  await box.press('Enter');
  await page.waitForTimeout(1500);
}

export const dgRowTexts = async (page: Page) =>
  (await bodyRows(page).evaluateAll((rows) => rows.map((r) => (r as HTMLElement).innerText.replace(/\s+/g, ' ').trim()))).filter(
    (s) => s.length > 0,
  );

const next = (page: Page) => page.getByRole('button', { name: '下一步' });

export async function openAddDeviceGroup(page: Page) {
  await gotoDeviceGroups(page);
  await page.getByRole('button', { name: '新增' }).first().click();
  await expect(page).toHaveURL(/addvideodevicegroups/);
  await page.locator('input[type=text]:visible').first().waitFor();
  await page.waitForTimeout(2000);
}

/** 第 2 步：用左側搜尋框找到設備，勾選後按「加入>」。 */
export async function addDevicesInStep2(page: Page, deviceNames: string[]) {
  for (const n of deviceNames) {
    const search = page.getByPlaceholder('搜尋').first();
    await search.fill(n);
    await search.press('Enter');
    await page.waitForTimeout(800);
    await page.locator('.vxe-table--body-wrapper tbody tr').filter({ hasText: n }).first().locator('.vxe-cell--checkbox').click();
    await page.getByRole('button', { name: '加入>' }).click();
    await page.waitForTimeout(400);
  }
}

export async function createDeviceGroupViaUI(page: Page, g: { name: string; remarks?: string; devices?: string[] }) {
  await openAddDeviceGroup(page);
  const ins = page.locator('input[type=text]:visible');
  await ins.nth(0).fill(g.name);
  if (g.remarks !== undefined) await ins.nth(1).fill(g.remarks);
  await expect(next(page)).toBeEnabled();
  await next(page).click();
  if (g.devices?.length) await addDevicesInStep2(page, g.devices);
  await page.getByRole('button', { name: '創建' }).click();
  await page.getByRole('button', { name: '完成' }).click();
  await listReady(page);
}

export async function deleteDeviceGroupViaUI(page: Page, name: string) {
  if (!name.startsWith(DG_PREFIX)) throw new Error(`拒絕刪除非測試設備群組：${name}`);
  await gotoDeviceGroups(page);
  await searchDeviceGroups(page, name);
  const row = dgRow(page, name);
  if ((await row.count()) === 0) return;
  await row.first().getByRole('button', { name: '刪除' }).click();
  await page.locator('.el-message-box__btns .el-button--primary').click();
  await expect(dgRow(page, name)).toHaveCount(0, { timeout: 15000 });
}

export async function cleanupDeviceGroups(browser: Browser, names: string[]) {
  if (names.length === 0) return;
  const ctx = await browser.newContext({
    ignoreHTTPSErrors: true,
    baseURL: process.env.E2E_BASE_URL,
    storageState: ADMIN_STORAGE_PATH,
  });
  try {
    const page = await ctx.newPage();
    for (const n of names) await deleteDeviceGroupViaUI(page, n).catch(() => {});
  } finally {
    await ctx.close();
  }
}
