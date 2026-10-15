import { test, expect, Page } from '@playwright/test';
import { cameraRow, gotoCameras, nextBtn, searchCameras } from '../../helpers/cameras';

// 為驗證陌生人合併效果（CAM-024、028、SEC-015～017），暫時對指定攝影機（環境變數 MERGE_CAM，預設 Camera-8）開／關陌生人合併。
// MERGE_ON=1 開啟（時長維持精靈預設 5000 ms）；MERGE_ON=0 關回原狀。從編輯頁設定（新增精靈不會儲存）。
const CAM = process.env.MERGE_CAM ?? 'Camera-8';
const ON = process.env.MERGE_ON === '1';
const SCORE = process.env.MERGE_SCORE ?? '';
const backend = (page: Page) =>
  page.evaluate(async (cam) => {
    const el = Array.from(document.querySelectorAll('*')).find((e) => (e as unknown as { __vue__?: unknown }).__vue__) as any;
    const c = (await el.__vue__.$root.$globalFindCameras('', 0, 100)).data.list.find((x: any) => x.name === cam);
    return JSON.stringify({ person: c.verified_merge_setting, stranger: c.non_verified_merge_setting });
  }, CAM);

test(`[SEED-005] ${CAM} 陌生人合併 開／關（環境調整）`, async ({ page }) => {
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
  await page.getByText('啟用陌生人合併').first().waitFor();
  await page.waitForTimeout(800);
  await page.locator('select:visible').nth(1).selectOption({ label: ON ? '是' : '否' });
  if (ON && SCORE) {
    const score = page.locator('input[type=text]:visible').last();
    await score.fill(SCORE);
    console.log('SEED 合併分數欄位=', await score.inputValue());
  }
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
