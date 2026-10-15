import { test, expect, Page } from '@playwright/test';
import { cameraRow, gotoCameras, nextBtn, searchCameras } from '../../helpers/cameras';

// 為驗證人員合併（CAM-021/022、SEC-012）：e2e-nx-out 播放的是 Nx 的真實錄影，畫面中有真人。
// 這台是我們自己的測試攝影機。為了在短時間內得到「同一位員工 10 秒內重複辨識」的紀錄：
//  1. 把播放位置（連線資訊的 pos）跳到有人群經過的片段之前；
//  2. 把「辨識分數閾值」由 0.85 降到 NX_TARGET（預設 0.5），讓錄影中的員工被辨識為人員（影片解析度較低，0.85 多半只會落到陌生人）。
// NX_RESTORE=1：還原為原值（pos=2026-10-07T10:00:00、閾值 0.85）。
const RESTORE = process.env.NX_RESTORE === '1';
const POS = RESTORE ? '2026-10-07T10:00:00' : (process.env.NX_POS ?? '2026-10-07T10:24:00');
const TARGET = RESTORE ? '0.85' : (process.env.NX_TARGET ?? '0.5');
const NAME = 'e2e-nx-out';

const cam = (page: Page) =>
  page.evaluate(async (n) => {
    const el = Array.from(document.querySelectorAll('*')).find((e) => (e as unknown as { __vue__?: unknown }).__vue__) as any;
    const c = (await el.__vue__.$root.$globalFindCameras('', 0, 100)).data.list.find((x: any) => x.name === n);
    return JSON.stringify({ uri: String(c.connection_info).replace(/^.*\?/, '?'), target: c.target_score, merge: c.verified_merge_setting });
  }, NAME);

test(`[SEED-005] ${NAME} 播放位置與辨識分數閾值（環境調整）`, async ({ page }) => {
  test.setTimeout(240000);
  await gotoCameras(page);
  console.log('SEED 調整前', await cam(page));
  await searchCameras(page, NAME);
  await cameraRow(page, NAME).first().getByRole('button', { name: '編輯' }).click();
  await expect(page).toHaveURL(/modifyCameras/);
  await page.locator('input[type=text]:visible').first().waitFor();
  await page.waitForTimeout(2000);
  // 步驟 1：連線資訊（第 5 個文字框）
  const uri = page.locator('input[type=text]:visible').nth(4);
  const cur = await uri.inputValue();
  await uri.fill(cur.replace(/pos=[^&]*/, `pos=${POS}`));
  await nextBtn(page).click();
  await page.waitForTimeout(1500);
  await nextBtn(page).click();
  await page.getByText('最小人臉寬高').first().waitFor();
  await page.waitForTimeout(1000);
  const texts = page.locator('input[type=text]:visible');
  const n = await texts.count();
  let done = false;
  for (let i = 0; i < n; i += 1) {
    const v = await texts.nth(i).inputValue();
    if (v === '0.85' || v === '0.5' || v === TARGET) {
      await texts.nth(i).fill(TARGET);
      done = true;
      break;
    }
  }
  expect(done, '找不到辨識分數閾值欄位').toBe(true);
  const btn = page.getByRole('button', { name: '完成' });
  for (let i = 0; i < 4 && !(await btn.isVisible()); i += 1) {
    await nextBtn(page).click();
    await page.waitForTimeout(800);
  }
  await btn.click();
  await page.waitForTimeout(3000);
  await gotoCameras(page);
  console.log('SEED 調整後', await cam(page), new Date().toLocaleTimeString('zh-TW', { hour12: false }));
});
