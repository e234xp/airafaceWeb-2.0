import { Browser, Page, expect } from '@playwright/test';
import { ADMIN_STORAGE_PATH } from './accounts';
import { bodyRows, listReady } from './tables';

// 攝影機頁 helper。測試攝影機一律以 e2e- 開頭，IP 使用文件保留網段 192.0.2.x（不會連到真實設備），測項結束時清理。
// 絕不操作既有攝影機（Camera-1~11）。清單每頁 5 筆。

export const CAM_PREFIX = 'e2e-';
export const TEST_IP = '192.0.2.10';

export function uniqueCameraName(tag: string) {
  return `e2e-${tag}-${Date.now().toString(36).slice(-5)}`;
}

export async function gotoCameras(page: Page) {
  await page.goto('/#/videodevice/cameralist');
  await page.reload();
  await page.getByRole('button', { name: '新增' }).first().waitFor();
  await listReady(page);
}

export const cameraRow = (page: Page, name: string) => bodyRows(page).filter({ hasText: name });

export async function searchCameras(page: Page, keyword: string) {
  const box = page.getByPlaceholder('搜尋').first();
  await box.fill(keyword);
  await box.press('Enter');
  await page.waitForTimeout(800);
}

export const cameraRowTexts = async (page: Page) =>
  (await bodyRows(page).evaluateAll((rows) => rows.map((r) => (r as HTMLElement).innerText.replace(/\s+/g, ' ').trim()))).filter(
    (s) => s.length > 0,
  );

/** 從列表按「新增」進入新增攝影機精靈第 1 步（直接 goto 會被導回）。 */
export async function openAddCamera(page: Page) {
  await gotoCameras(page);
  await page.getByRole('button', { name: '新增' }).first().click();
  await expect(page).toHaveURL(/addcamera/);
  await page.locator('input[type=text]:visible').first().waitFor();
  await page.waitForTimeout(2000); // 表單載入完成前輸入的值會被重置
}

export const nextBtn = (page: Page) => page.getByRole('button', { name: '下一步' });

/** 第 1 步填名稱與 IP（其餘用預設值）。 */
export async function fillCameraBasics(page: Page, name: string, ip = TEST_IP) {
  const inputs = page.locator('input[type=text]:visible');
  await inputs.nth(0).fill(name);
  await inputs.nth(1).fill(ip);
}

/** 以介面建立攝影機：第 1 步填寫、其餘步驟全用預設值、完成後回到列表。 */
export async function createCameraViaUI(page: Page, name: string, ip = TEST_IP) {
  await openAddCamera(page);
  await fillCameraBasics(page, name, ip);
  await expect(nextBtn(page)).toBeEnabled();
  // 辨識區域 → 人臉擷取閾值 → 人臉合併 → 完成：每按一次等畫面換頁，最後一步的「下一步」會儲存並出現「完成」
  const done = page.getByRole('button', { name: '完成' });
  for (let i = 0; i < 8 && !(await done.isVisible()); i += 1) {
    await nextBtn(page).click();
    await page.waitForTimeout(800);
  }
  await done.click();
  await listReady(page);
}

/** 以介面刪除單一攝影機（只允許 e2e- 開頭）。不存在時略過。 */
export async function deleteCameraViaUI(page: Page, name: string) {
  if (!name.startsWith(CAM_PREFIX)) throw new Error(`拒絕刪除非測試攝影機：${name}`);
  await gotoCameras(page);
  await searchCameras(page, name);
  const row = cameraRow(page, name);
  if ((await row.count()) === 0) return;
  await row.first().getByRole('button', { name: '刪除' }).click();
  await page.locator('.el-message-box__btns .el-button--primary').click();
  await expect(cameraRow(page, name)).toHaveCount(0, { timeout: 15000 });
}

/** 以獨立的 Admin 瀏覽器環境清理測試攝影機。 */
export async function cleanupCameras(browser: Browser, names: string[]) {
  if (names.length === 0) return;
  const ctx = await browser.newContext({
    ignoreHTTPSErrors: true,
    baseURL: process.env.E2E_BASE_URL,
    storageState: ADMIN_STORAGE_PATH,
  });
  try {
    const page = await ctx.newPage();
    for (const n of names) await deleteCameraViaUI(page, n).catch(() => {});
  } finally {
    await ctx.close();
  }
}
