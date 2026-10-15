import { test, expect, Page } from '@playwright/test';
import { csvAnnotations } from '../../helpers/csvSource';
import { openAddEvent } from '../../helpers/events';

// 來源 E2E-TEST-PLAN.md：MAIL-008（To 至少選 1 個 user group）。
// 真正寄信的設定在「事件設定 > 通知資訊」頁（通知管理 > Email 通知 在後端已沒有 API），所以這裡改在事件設定頁驗證。
// 只走到第 2 步、不儲存，不建立任何事件。
const next = (page: Page) => page.getByRole('button', { name: '下一步' });
const obs = (s: string) => {
  console.log('OBS', s);
  test.info().annotations.push({ type: '觀察', description: s });
};

test(
  '[MAIL-008] 事件設定：Email 通知 To 至少要有 1 個收件者',
  {
    annotation: [
      ...csvAnnotations({ row: 102, no: '', category: '（延續）> 設定', steps: 'To: 至少選1 user group', expected: '設定Email通知並根據設定接收成功' }),
      { type: '判定範圍', description: '事件設定頁的「收件者 To」是自由輸入的 Email，不是選 user group；以「To 空白不能進入下一步、填入正確 Email 可以」判定「至少 1 個」；不儲存、不寄信' },
    ],
  },
  async ({ page }) => {
    test.setTimeout(180000);
    await openAddEvent(page);
    await page.locator('input[type=text]:visible').nth(0).fill('e2e-mail008-不儲存');
    const sel = page.locator('select:visible').first();
    const cats = (await sel.locator('option').allInnerTexts()).map((s) => s.trim());
    obs(`事件類別選項：${cats.join('、')}`);
    const mail = cats.find((c) => /郵件|mail/i.test(c));
    expect(mail, '找不到 Email 類別').toBeTruthy();
    await sel.selectOption({ label: mail! });
    const ms = page.locator('.multiselect');
    for (const [i, g] of ['All Person', 'test'].entries()) {
      await ms.nth(i).click();
      await page.locator('.multiselect__option:visible').filter({ hasText: g }).first().click();
      await page.keyboard.press('Escape');
    }
    await expect(next(page)).toBeEnabled();
    await next(page).click();
    await page.waitForTimeout(2500);
    // 第 2 步欄位順序：0 SMTP 方法、1 主機、2 埠、3 加密、4 帳號、5 密碼、6 寄件者、7 主旨、8 收件者 To、9 CC、10 BCC、11 語言
    const f = page.locator('input:visible');
    const texts = page.locator('input[type=text]:visible');
    await texts.nth(0).fill('example.com');
    await texts.nth(1).fill('587');
    await texts.nth(2).fill('e2e@example.com');
    await page.locator('input[type=password]:visible').fill('e2e-password');
    await texts.nth(3).fill('e2e@example.com');
    await texts.nth(4).fill('e2e subject');
    const to = texts.nth(5);
    void f;
    await to.fill('');
    await page.waitForTimeout(500);
    const emptyBlocked = !(await next(page).isEnabled());
    obs(`To 留空：下一步${emptyBlocked ? '被擋' : '可按'}`);
    await to.fill('   ');
    await page.waitForTimeout(500);
    const spaceBlocked = !(await next(page).isEnabled());
    obs(`To 只有空白：下一步${spaceBlocked ? '被擋' : '可按'}`);
    await to.fill('not-an-email');
    await page.waitForTimeout(500);
    const badBlocked = !(await next(page).isEnabled());
    obs(`To 填非 Email：下一步${badBlocked ? '被擋' : '可按'}`);
    await to.fill('e2e@example.com');
    await page.waitForTimeout(500);
    const goodOk = await next(page).isEnabled();
    obs(`To 填正確 Email：下一步${goodOk ? '可按' : '被擋'}`);
    await page.screenshot({ path: 'e2e/reports/tmp/mail008-step2.png' });
    expect(emptyBlocked, 'To 留空應不能進入下一步').toBe(true);
    expect(goodOk, 'To 填正確 Email 應可進入下一步（其餘欄位皆已填妥）').toBe(true);
    expect.soft(spaceBlocked, 'To 只有空白應不能進入下一步').toBe(true);
    expect.soft(badBlocked, 'To 填非 Email 應不能進入下一步').toBe(true);
  },
);
