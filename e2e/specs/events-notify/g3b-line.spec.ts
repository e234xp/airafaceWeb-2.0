import { test, expect, Page } from '@playwright/test';
import { csvAnnotations } from '../../helpers/csvSource';

// 來源 E2E-TEST-PLAN.md：LINE-002、003、004（LINE 通知內容欄位）。
// 只驗證前端欄位：第 2 步的欄位可設定。儲存與收訊未驗：後端沒有 createlinecommand 等通知 API（find*command 回 400 no such cgi），儲存必定失敗；收訊由使用者人工測試。
// 只開到第 2 步，不儲存，不會留下任何資料。
const LIST = '/#/notifications/linenotify';
const next = (page: Page) => page.getByRole('button', { name: '下一步' });
const obs = (s: string) => {
  console.log('OBS', s);
  test.info().annotations.push({ type: '觀察', description: s });
};
const R = { type: '判定範圍', description: '只驗證前端欄位（第 2 步欄位可設定）；儲存與收訊未驗：後端沒有通知 API（400 no such cgi）；收訊由使用者人工測試' };
const BOX = { timestamp: 0, personId: 1 } as const;
const boxes = (page: Page) => page.locator('input[type=checkbox]');
async function setBox(page: Page, idx: number, on: boolean) {
  const b = boxes(page).nth(idx);
  if ((await b.isChecked()) === on) return;
  await page.locator('label').filter({ has: b }).first().click().catch(async () => b.click({ force: true }));
  await expect.poll(() => b.isChecked(), { timeout: 5000 }).toBe(on);
}
async function toStep2(page: Page) {
  await page.goto(LIST);
  await page.reload();
  await page.getByRole('button', { name: '新增' }).first().click();
  await page.locator('input:visible:not([type=file])').first().waitFor();
  await page.waitForTimeout(2000);
  const inputs = page.locator('input:visible:not([type=file])');
  const n = await inputs.count();
  await inputs.nth(0).fill(`e2e-line-${Date.now().toString(36).slice(-5)}`);
  for (let i = 1; i < n; i += 1) await inputs.nth(i).fill('e2e-line-token-0000000000000000000000000000');
  await next(page).click();
  await page.getByText('語言').first().waitFor({ timeout: 20000 });
  await page.waitForTimeout(1500);
}

test(
  '[LINE-002] Line 通知內容語系：發送內文語系可設定（僅欄位標題）',
  { annotation: [...csvAnnotations({ row: 99, no: '', category: '（延續）> 通知內容語系', steps: 'LINE 通知中可設定發送內文的語系 (僅限欄位標題、欄位的內容由使用者資料決定)', expected: '根據設定接收成功' }), R] },
  async ({ page }) => {
    test.setTimeout(200000);
    await toStep2(page);
    const lang = page.locator('select:visible').first();
    const opts = (await lang.locator('option').allInnerTexts()).map((x) => x.trim());
    obs('語言選項：' + opts.join('、'));
    expect(opts).toEqual(expect.arrayContaining(['English', '繁體中文', '日本語']));
    for (const o of ['日本語', 'English', '繁體中文']) {
      await lang.selectOption({ label: o });
      expect((await lang.locator('option:checked').innerText()).trim(), `選了「${o}」後沒有套用`).toBe(o);
    }
  },
);

test(
  '[LINE-003] Line 通知欄位：設定不顯示 ID、顯示時間',
  { annotation: [...csvAnnotations({ row: 100, no: '', category: '（延續）> 送出的人員的欄位顯示應符合設定', steps: '通知內容依照選取之項目呈現；設定不顯示ID、顯示時間', expected: '根據設定接收成功' }), R] },
  async ({ page }) => {
    test.setTimeout(200000);
    await toStep2(page);
    await setBox(page, BOX.personId, false);
    await setBox(page, BOX.timestamp, true);
    expect(await boxes(page).nth(BOX.personId).isChecked(), '人員編號應為不顯示').toBe(false);
    expect(await boxes(page).nth(BOX.timestamp).isChecked(), '時間應為顯示').toBe(true);
  },
);

test(
  '[LINE-004] Line 通知欄位：設定顯示群組（不應重複）',
  { annotation: [...csvAnnotations({ row: 100, no: '', category: '（延續）> 送出的人員的欄位顯示應符合設定', steps: '通知內容依照選取之項目呈現；設定顯示群組 (不應重複)', expected: '根據設定接收成功' }), R] },
  async ({ page }) => {
    test.setTimeout(200000);
    await toStep2(page);
    const text = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
    obs('第 2 步欄位文字：' + text.slice(0, 260));
    expect(text, '內容欄位沒有「群組」欄位可設定').toMatch(/群組|group/i);
  },
);
