import { test } from '@playwright/test';
import { gotoEvents, searchEvents, eventRow } from '../../helpers/events';

// 環境調整：把事件管理列表上指定事件的啟用開關切到指定狀態。
// 用法：EVT_NAME=Email-B-register EVT_ON=0|1（EVT_NAME 可用逗號分隔多個）
const names = (process.env.EVT_NAME ?? '').split(',').filter(Boolean);
const want = process.env.EVT_ON === '1';

test('[SEED-EVT] 切換事件啟用狀態', async ({ page }) => {
  test.setTimeout(180000);
  for (const name of names) {
    await gotoEvents(page);
    await searchEvents(page, name);
    const row = eventRow(page, name).first();
    const sw = row.locator('input[type=checkbox]').first();
    if ((await sw.isChecked()) !== want) {
      await row.locator('label, .c-switch').first().click().catch(async () => sw.click({ force: true }));
      await page.waitForTimeout(1500);
    }
    console.log('SEED 事件', name, '啟用=', await sw.isChecked());
  }
});
