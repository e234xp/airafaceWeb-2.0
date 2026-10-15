import { test } from '@playwright/test';
import { cameraRow, gotoCameras, nextBtn, openAddCamera, searchCameras } from '../../helpers/cameras';
import { bodyRows } from '../../helpers/tables';

// 環境建置步驟 2：把使用者提供的 8 台辦公室 RTSP 攝影機加進 AiraFace（設定來自 .env.e2e.local 的 E2E_SIM_CAMERAS，帳密不輸出）。
// 名稱沿用重灌前的 Camera-1~8（既有測項以這些名稱選設備）；已存在則略過。真實攝影機、真實畫面，不是假資料。
type Cam = { caption: string; ip: string; port: number; uri: string; user: string; pass: string };
const cams: Cam[] = JSON.parse(process.env.E2E_SIM_CAMERAS ?? '[]');

test('[SEED-002] 加入 8 台辦公室攝影機（環境前置）', async ({ page }) => {
  test.setTimeout(290000);
  const only = process.env.SEED_ONLY ? Number(process.env.SEED_ONLY) : 0; // 試做時只加第 N 台
  for (const [i, c] of cams.entries()) {
    if (only && i + 1 !== only) continue;
    const name = `Camera-${i + 1}`;
    await gotoCameras(page);
    await searchCameras(page, name);
    if ((await cameraRow(page, name).count()) > 0) {
      console.log('SEED 已存在', name);
      continue;
    }
    await openAddCamera(page);
    const texts = page.locator('input[type=text]:visible');
    await texts.nth(0).fill(name);
    await texts.nth(1).fill(c.ip);
    await texts.nth(2).fill(String(c.port));
    await texts.nth(3).fill(c.user);
    await page.locator('input[type=password]').first().fill(c.pass);
    await texts.nth(4).fill(`/${c.uri.replace(/^\//, '')}`);
    const done = page.getByRole('button', { name: '完成' });
    for (let k = 0; k < 8 && !(await done.isVisible()); k += 1) {
      await nextBtn(page).click();
      await page.waitForTimeout(1200);
    }
    await done.click();
    await bodyRows(page).first().waitFor();
    console.log('SEED 已新增', name, `(${c.caption} ${c.ip})`);
  }
  await page.waitForTimeout(20000);
  await gotoCameras(page);
  await page.waitForTimeout(5000);
  console.log('SEED 列表', JSON.stringify((await bodyRows(page).allInnerTexts()).map((r) => r.replace(/\s+/g, ' ').trim())));
});
