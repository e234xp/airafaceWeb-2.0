import { Page, expect, test } from '@playwright/test';
import { csvAnnotations } from '../../helpers/csvSource';
import { shot } from '../../helpers/evidence';

// 來源 E2E-TEST-PLAN.md：TRK-008（不在辦公室超時為紅色：OUT→IN，長度 >= N 分鐘）。
// 使用環境既有資料：2026-10-15 的 Ivy（人員編號 2684）有一段不在辦公室 17:52:20 — 18:09:45（17 分 25 秒）。
// 不在辦公室的門檻選項為 10／20／30／60 分鐘（預設 10）：門檻 10 分鐘時這段應為紅色（超時），門檻 20 分鐘時應為黃色（未超時）。
const DAY = '2026-10-15';
const PERSON = 'Ivy';
const YELLOW = 'rgb(255, 193, 7)';

async function openDetail(page: Page) {
  await page.goto('/#/reports/presencedetail');
  await page.reload();
  await page.locator('.mx-datepicker input').first().waitFor();
  const d = page.locator('.mx-datepicker input').first();
  await d.click();
  await d.fill(`${DAY} ~ ${DAY}`);
  await d.press('Enter');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: '搜尋' }).first().click();
  await page.waitForTimeout(2500);
  await page.locator('.vxe-table--body-wrapper tbody tr').filter({ hasText: PERSON }).first().getByText('查看詳細').click();
  await page.locator('.timeline-seg').first().waitFor();
  await page.waitForTimeout(1500);
}
const aways = (page: Page) =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll('.timeline-seg'))
      .filter((e) => /seg-away/.test(e.className.toString()))
      .map((e) => ({ cls: e.className.toString(), bg: getComputedStyle(e).backgroundColor, title: (e as HTMLElement).title })),
  );

test(
  '[TRK-008] 時間軸：不在辦公室超時為紅色（OUT→IN，長度 >= N 分鐘）',
  {
    annotation: [
      ...csvAnnotations({ row: 53, no: '', category: '（延續）> 時間軸顯示', steps: '4.不在辦公室，超時:紅色，設定出去攝影機並維持出超過設定時間', expected: '4..OUT->IN，且長度>=N分鐘' }),
      { type: '判定範圍', description: `用既有資料（${DAY} ${PERSON} 一段 17 分 25 秒的離開）：門檻 10 分鐘時為紅色、改成 20 分鐘時為黃色；N 取 10／20，不測剛好等於 N（無法造出剛好的資料）` },
    ],
  },
  async ({ page }) => {
    test.setTimeout(240000);
    await openDetail(page);
    const awaySel = page.locator('select').nth(2);
    expect((await awaySel.locator('option:checked').innerText()).trim(), '預設門檻').toBe('不在 10 分鐘以上');
    const at10 = await aways(page);
    console.log('OBS 門檻 10 分鐘', JSON.stringify(at10));
    expect(at10.length, '離開區段').toBeGreaterThan(0);
    const over = at10.find((x) => x.title.includes('17m 25s') || /1[0-9]m/.test(x.title));
    expect(over, `找不到超過 10 分鐘的離開區段：${JSON.stringify(at10)}`).toBeTruthy();
    expect(over!.title, '提示文字').toContain('超時');
    expect(over!.cls, '樣式').toContain('away-over');
    const [r, g, b] = (over!.bg.match(/\d+/g) ?? []).map(Number);
    expect(r > 180 && g < 120 && b < 120, `超時區段不是紅色：${over!.bg}`).toBe(true);
    await shot(page, 'TRK-008', '01-門檻10分鐘-紅色');

    await awaySel.selectOption({ label: '不在 20 分鐘以上' });
    await page.getByRole('button', { name: '送出' }).click();
    await page.waitForTimeout(2500);
    const at20 = await aways(page);
    console.log('OBS 門檻 20 分鐘', JSON.stringify(at20));
    const same = at20.find((x) => x.title.includes('17m 25s'));
    expect(same, '門檻 20 分鐘後找不到同一段離開').toBeTruthy();
    expect(same!.cls, '未達 20 分鐘不應為超時').not.toContain('away-over');
    expect(same!.bg, '未達門檻應為黃色').toBe(YELLOW);
    await shot(page, 'TRK-008', '02-門檻20分鐘-黃色');
  },
);
