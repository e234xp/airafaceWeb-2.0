import { test, expect } from '@playwright/test';

// 環境建置步驟 1：啟用授權（E2E_LICENSE 來自 .env.e2e.local，不得印出或寫入文件）。已有有效授權時略過。
// 這是環境前置作業，不屬於 Plan 的 Test ID（LIC-* 測項另行處理）。
test('[SEED-001] 啟用授權（環境前置）', async ({ page }) => {
  test.setTimeout(120000);
  await page.goto('/#/systemsettings/licensesettings');
  await page.reload();
  await page.getByRole('button', { name: '啟用' }).first().waitFor();
  await page.waitForTimeout(3000);
  const mask = (t: string) => t.replace(/[A-Z0-9]{5}(-[A-Z0-9]{5}){3,}/g, '***'); // 授權碼是機敏資料，不印出
  const listText = async () => mask((await page.locator('body').innerText()).replace(/\s+/g, ' '));
  const before = await listText();
  console.log('SEED 授權頁（啟用前）', before.slice(before.indexOf('已啟用的授權')).slice(0, 200));
  if (!/暫無資料/.test(before)) {
    console.log('SEED 已有授權，略過');
    return;
  }
  const code = process.env.E2E_LICENSE ?? '';
  expect(code, '.env.e2e.local 沒有 E2E_LICENSE').not.toBe('');
  await page.locator('input[type=text]:visible').first().fill(code);
  await page.getByRole('button', { name: '啟用' }).first().click();
  await page.waitForTimeout(6000);
  await page.reload();
  await page.waitForTimeout(4000);
  const after = await listText();
  console.log('SEED 授權頁（啟用後）', after.slice(after.indexOf('已啟用的授權')).slice(0, 300));
  expect(after, '啟用後授權清單仍是空的').not.toMatch(/已啟用的授權[\s\S]*暫無資料/);
});
