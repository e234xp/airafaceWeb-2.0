import { test } from '@playwright/test';
import { bodyRows, readAllRows } from '../helpers/tables';

// 一次性診斷（非測項）：系統日誌搜尋的實際行為。
test('diag logs search', async ({ page }) => {
  await page.goto('/#/systemsettings/systemlog');
  await page.reload();
  await bodyRows(page).first().waitFor();
  const before = (await readAllRows(page, false)).length;
  const box = page.getByPlaceholder('搜尋').first();
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 100)));
  await box.fill('Camera');
  await box.press('Enter');
  await page.waitForTimeout(800);
  const afterEnter = (await readAllRows(page, false)).length;
  await box.press('Tab');
  await page.waitForTimeout(800);
  const afterTab = (await readAllRows(page, false)).length;
  await box.fill('zzz-no-match');
  await box.press('Tab');
  await page.waitForTimeout(800);
  const afterNoMatch = (await readAllRows(page, false)).length;
  console.log(`DIAG before=${before} afterEnter=${afterEnter} afterTab=${afterTab} afterNoMatch=${afterNoMatch} errors=${JSON.stringify(errors)}`);
});
