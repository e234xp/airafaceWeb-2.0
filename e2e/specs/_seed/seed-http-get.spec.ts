import { test, expect, Page } from '@playwright/test';
import { dragSchedule, fillEventStep1, gotoEvents, openAddEvent, searchEvents, eventRow } from '../../helpers/events';
import { listReady } from '../../helpers/tables';

// HTTP-001：建立 HTTP GET 事件（Nx 舊版 createEvent API）。套用群組 All Visitor（使用者的臉目前是訪客 e2e-visitor）、影像設備群組 test。
// SEED_ENABLE=1 時建立後保持啟用；SEED_REMOVE=1 時停用該事件（刪除請在事件管理頁手動做）。帳密與主機取自 .env.e2e.local，不印出。
const NAME = process.env.SEED_NAME ?? 'HTTP-GET-Nx';
const GROUP = process.env.SEED_GROUP ?? 'All Visitor';
const next = (page: Page) => page.getByRole('button', { name: '下一步' });
const env = (k: string) => process.env[k] ?? '';

async function allWeekSchedule(page: Page) {
  for (let d = -1; d < 6; d += 1) await dragSchedule(page, d, 0, 23);
}

test('[SEED-EVT] 建立事件 HTTP-GET-Nx', async ({ page }) => {
  test.setTimeout(240000);
  await gotoEvents(page);
  await searchEvents(page, NAME);
  if (process.env.SEED_REMOVE === '1') {
    if ((await eventRow(page, NAME).count()) > 0) {
      const sw0 = eventRow(page, NAME).first().locator('input[type=checkbox]').first();
      if (await sw0.isChecked()) {
        await eventRow(page, NAME).first().locator('label, .c-switch').first().click().catch(async () => sw0.click({ force: true }));
        await page.waitForTimeout(1500);
      }
      console.log('SEED 事件', NAME, '啟用=', await sw0.isChecked());
    }
    console.log('SEED 已處理', NAME);
    return;
  }
  if ((await eventRow(page, NAME).count()) > 0) {
    console.log('SEED 已存在', NAME);
    return;
  }
  const host = new URL(env('E2E_NX_URL')).hostname;
  await openAddEvent(page);
  await fillEventStep1(page, NAME, GROUP, 'test', 'HTTP 命令');
  await next(page).click();
  await page.getByText('主機位址').first().waitFor();
  await page.waitForTimeout(1500);
  const t = page.locator('input[type=text]:visible');
  await t.nth(0).fill(host);
  await t.nth(1).fill(env('E2E_NX_USER'));
  await page.locator('input[type=password]:visible').first().fill(env('E2E_NX_PASSWORD'));
  await t.nth(2).fill('7001');
  await t.nth(3).fill('api/createEvent');
  const areas = page.locator('textarea:visible');
  await areas.nth(0).fill('timestamp=##VerifiedTimeStamp##&caption=##PersonName##&source=##SourceDevice##&description=HTTP_TEST');
  console.log('SEED GET 版面：顯示URL=', await page.locator('input[disabled], input[readonly]').first().inputValue().catch(() => '?'));
  await expect(next(page)).toBeEnabled();
  await next(page).click();
  await allWeekSchedule(page);
  await next(page).click();
  await page.getByRole('button', { name: '完成' }).click();
  await listReady(page);
  await searchEvents(page, NAME);
  const sw = eventRow(page, NAME).first().locator('input[type=checkbox]').first();
  const want = process.env.SEED_ENABLE === '1';
  if ((await sw.isChecked()) !== want) {
    await eventRow(page, NAME).first().locator('label, .c-switch').first().click().catch(async () => sw.click({ force: true }));
    await page.waitForTimeout(1500);
  }
  console.log('SEED 事件', NAME, '啟用=', await sw.isChecked());
});
