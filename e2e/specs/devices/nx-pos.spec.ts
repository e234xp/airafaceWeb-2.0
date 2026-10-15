import { test } from '@playwright/test';
import { cameraRow, gotoCameras, nextBtn, searchCameras } from '../../helpers/cameras';
import { bodyRows } from '../../helpers/tables';

// 前置作業（非測項）：把 e2e-nx-in／e2e-nx-out 的串流改成 Nx 錄影回放（?pos=昨天的時間），讓 AiraFace 辨識昨天錄到的人。
const SOURCES = [
  { name: 'e2e-nx-in', path: '/f54bacb0-1371-07b0-8485-07151ceb433f?pos=2026-10-07T00:50:00' }, // 昨天 08:50（UTC+8）
  { name: 'e2e-nx-out', path: '/846082c1-cb47-bce0-fadd-c6e0838a4898?pos=2026-10-07T10:00:00' }, // 昨天 18:00
];
test('[NX-POS] 改為錄影回放', async ({ page }) => {
  test.setTimeout(280000);
  for (const s of SOURCES) {
    await gotoCameras(page);
    await searchCameras(page, s.name);
    await cameraRow(page, s.name).first().getByRole('button', { name: '編輯' }).click();
    await page.locator('input[type=text]:visible').first().waitFor();
    await page.waitForTimeout(3000);
    await page.locator('input[type=text]:visible').nth(4).fill(s.path);
    const done = page.getByRole('button', { name: '完成' });
    for (let i = 0; i < 8 && !(await done.isVisible()); i += 1) {
      await nextBtn(page).click().catch(async () => page.getByRole('button', { name: '儲存變更' }).click());
      await page.waitForTimeout(1200);
    }
    await done.click();
    await bodyRows(page).first().waitFor();
  }
  await page.waitForTimeout(25000);
  await page.goto('/#/systemsettings/systemlog');
  await page.reload();
  await bodyRows(page).first().waitFor();
  await page.waitForTimeout(2000);
  console.log('LOG', JSON.stringify((await bodyRows(page).allInnerTexts()).map((r) => r.replace(/\s+/g, ' ').trim().replace(/:\/\/[^@]*@/, '://***@').slice(0, 170)).slice(0, 6)));
});
