import { test, expect, Page } from '@playwright/test';
import { cameraRow, gotoCameras, nextBtn, searchCameras } from '../../helpers/cameras';

// 為驗證人員合併效果（CAM-021/022、SEC-012），暫時對 指定攝影機（環境變數 MERGE_CAM，預設 Camera-7）開／關人員合併。
// MERGE_ON=1 開啟（10000 ms）；MERGE_ON=0 關回原狀（原狀：關閉、時長 5000）。從編輯頁設定（新增精靈不會儲存）。
const CAM = process.env.MERGE_CAM ?? 'Camera-7';
const ON = process.env.MERGE_ON === '1';
const backend = (page: Page) =>
  page.evaluate(async (cam) => {
    const el = Array.from(document.querySelectorAll('*')).find((e) => (e as unknown as { __vue__?: unknown }).__vue__) as any;
    const c = (await el.__vue__.$root.$globalFindCameras('', 0, 100)).data.list.find((x: any) => x.name === cam);
    return JSON.stringify(c.verified_merge_setting);
  }, CAM);

test(`[SEED-004] ${CAM} 人員合併 開／關（環境調整）`, async ({ page }) => {
  test.setTimeout(200000);
  await gotoCameras(page);
  console.log('SEED 調整前', await backend(page));
  await searchCameras(page, CAM);
  await cameraRow(page, CAM).first().getByRole('button', { name: '編輯' }).click();
  await expect(page).toHaveURL(/modifyCameras/);
  await page.locator('input[type=text]:visible').first().waitFor();
  await page.waitForTimeout(2000);
  for (let i = 0; i < 3; i += 1) {
    await nextBtn(page).click();
    await page.waitForTimeout(600);
  }
  await page.getByText('啟用人員合併').first().waitFor();
  await page.waitForTimeout(800);
  await page.locator('select:visible').nth(0).selectOption({ label: ON ? '是' : '否' });
  if (ON) await page.locator('input[type=text]:visible').nth(0).fill('10000');
  const done = page.getByRole('button', { name: '完成' });
  for (let i = 0; i < 4 && !(await done.isVisible()); i += 1) {
    await nextBtn(page).click();
    await page.waitForTimeout(800);
  }
  await done.click();
  await page.waitForTimeout(3000);
  await gotoCameras(page);
  console.log('SEED 調整後', await backend(page), new Date().toLocaleTimeString());
});
