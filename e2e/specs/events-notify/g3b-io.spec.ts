import { test, expect, Page } from '@playwright/test';
import { ADMIN_STORAGE_PATH } from '../../helpers/accounts';
import { csvAnnotations } from '../../helpers/csvSource';
import { cleanupDeviceGroups, createDeviceGroupViaUI, uniqueDeviceGroupName } from '../../helpers/dgroups';
import { EVT_TEST_HOST, cleanupEvents, createEventViaUI, dragSchedule, eventRow, fillEventStep1, gotoEvents, openAddEvent, searchEvents, uniqueEventName } from '../../helpers/events';
import { cleanupGroups, createGroupViaUI, uniqueGroupName } from '../../helpers/groups';
import { bodyRows } from '../../helpers/tables';

// 來源 E2E-TEST-PLAN.md：IO-002~004（I/O 設備表單；IO-001 需實體設備才能儲存，見 Results）、EVREL-001（事件相互獨立）。
// I/O 設備以 e2e- 開頭、IP 用保留網段 192.0.2.60（不會連到真實設備），結束後由獨立 Admin 環境刪除。
const LIST = '/#/outputdevice/ioboxsManagement';
const ios: string[] = [];
const events: string[] = [];
const pgs: string[] = [];
const dgs: string[] = [];
const obs = (s: string) => {
  console.log('OBS', s);
  test.info().annotations.push({ type: '觀察', description: s });
};
const next = (page: Page) => page.getByRole('button', { name: '下一步' });

async function deleteIo(page: Page, name: string) {
  if (!name.startsWith('e2e-')) throw new Error(`拒絕刪除非測試 I/O：${name}`);
  await page.goto(LIST);
  await page.reload();
  await page.getByRole('button', { name: '新增' }).first().waitFor();
  await page.waitForTimeout(2500);
  const row = bodyRows(page).filter({ hasText: name });
  if ((await row.count()) === 0) return;
  await row.first().getByRole('button', { name: '刪除' }).click();
  await page.locator('.el-message-box__btns .el-button--primary').click();
  await expect(bodyRows(page).filter({ hasText: name })).toHaveCount(0, { timeout: 15000 });
}
test.afterEach(async ({ browser }) => {
  await cleanupEvents(browser, events.splice(0));
  await cleanupGroups(browser, pgs.splice(0));
  await cleanupDeviceGroups(browser, dgs.splice(0));
  const names = ios.splice(0);
  if (names.length > 0) {
    const ctx = await browser.newContext({ ignoreHTTPSErrors: true, baseURL: process.env.E2E_BASE_URL, storageState: ADMIN_STORAGE_PATH });
    try {
      const p = await ctx.newPage();
      for (const n of names) await deleteIo(p, n).catch(() => {});
    } finally {
      await ctx.close();
    }
  }
});

async function openAddIo(page: Page) {
  await page.goto(LIST);
  await page.reload();
  await page.getByRole('button', { name: '新增' }).first().waitFor();
  await page.waitForTimeout(2500);
  await page.getByRole('button', { name: '新增' }).first().click();
  await page.locator('input[type=text]:visible').first().waitFor();
  await page.waitForTimeout(2000);
}
const f = (page: Page) => ({
  name: page.locator('input[type=text]:visible').nth(0),
  ip: page.locator('input[type=text]:visible').nth(1),
  port: page.locator('input[type=text]:visible').nth(2),
  user: page.locator('input[type=text]:visible').nth(3),
  pass: page.locator('input[type=password]:visible').first(),
});
async function fillIo(page: Page, name: string, o: { ip?: string; port?: string; user?: string; pass?: string } = {}) {
  const x = f(page);
  await x.name.fill(name);
  await x.ip.fill(o.ip ?? '192.0.2.60');
  await x.port.fill(o.port ?? '80');
  await x.user.fill(o.user ?? 'admin');
  await x.pass.fill(o.pass ?? 'e2e-pass');
}

test.describe('IO / EVREL', () => {
  test(
    '[IO-002] I/O：指定 Brand/Model',
    {
      annotation: [
        ...csvAnnotations({ row: 110, no: '', category: '（延續）> （空白）', steps: '指定Brand/Model', expected: 'syslog顯示設定狀態、連線狀態\nsyslog的格式，判斷連線與斷線會顯示於log中，斷線重連，不影響CPU' }),
        { type: '判定範圍', description: '只驗證前端可指定品牌與型號；syslog 與 CPU 需 SSH 主機，未驗證' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(200000);
      await openAddIo(page);
      const brand = page.locator('select:visible').nth(0);
      const model = page.locator('select:visible').nth(1);
      const b = await brand.locator('option').allInnerTexts();
      const m = await model.locator('option').allInnerTexts();
      obs(`品牌選項：${b.join('、')}；型號選項：${m.join('、')}`);
      expect(b.length, '沒有可指定的品牌').toBeGreaterThan(0);
      expect(m.length, '沒有可指定的型號').toBeGreaterThan(0);
      await brand.selectOption({ index: 0 });
      await model.selectOption({ index: 0 });
      expect((await brand.locator('option:checked').innerText()).trim().length).toBeGreaterThan(0);
    },
  );

  test(
    '[IO-003] I/O：連線 IP 不可為空且須符合格式、port 不可為空且須為合格數字',
    {
      annotation: [
        ...csvAnnotations({ row: 110, no: '', category: '（延續）> （空白）', steps: '連線IP不可為空，須符合格式/port不可為空，須為合格數字', expected: 'syslog顯示設定狀態、連線狀態\nsyslog的格式，判斷連線與斷線會顯示於log中，斷線重連，不影響CPU' }),
        { type: '判定範圍', description: '原始規格未定義違反時的行為，以「違反時無法按下一步」判定；syslog 與 CPU 需 SSH 主機，未驗證' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(250000);
      await openAddIo(page);
      const name = `e2e-io-${Date.now().toString(36).slice(-5)}`;
      const bad: Array<[string, { ip?: string; port?: string }]> = [
        ['IP 為空', { ip: '' }],
        ['IP 格式錯誤（abc）', { ip: 'abc' }],
        ['IP 格式錯誤（999.1.1.1）', { ip: '999.1.1.1' }],
        ['port 為空', { port: '' }],
        ['port 不是數字（abc）', { port: 'abc' }],
        ['port 超出範圍（70000）', { port: '70000' }],
      ];
      const res: string[] = [];
      const fails: string[] = [];
      for (const [label, o] of bad) {
        await fillIo(page, name, { ...o, ip: o.ip ?? '192.0.2.60', port: o.port ?? '80' });
        await page.waitForTimeout(500);
        const enabled = await next(page).isEnabled();
        res.push(`${label}：下一步${enabled ? '可按（沒有擋）' : '被停用'}`);
        if (enabled) fails.push(label);
      }
      await fillIo(page, name);
      await page.waitForTimeout(500);
      const okEnabled = await next(page).isEnabled();
      res.push(`合法的 IP／port：下一步${okEnabled ? '可按' : '被停用'}`);
      obs(res.join('；'));
      expect(okEnabled, '合法的 IP／port 卻無法按下一步').toBe(true);
      expect(fails, `這些違規輸入仍可按下一步：${fails.join('、')}`).toEqual([]);
    },
  );

  test(
    '[IO-004] I/O：帳號密碼可為空',
    {
      annotation: csvAnnotations({ row: 110, no: '', category: '（延續）> （空白）', steps: '帳號密碼可為空', expected: 'syslog顯示設定狀態、連線狀態\nsyslog的格式，判斷連線與斷線會顯示於log中，斷線重連，不影響CPU' }),
    },
    async ({ page }) => {
      test.setTimeout(200000);
      await openAddIo(page);
      await fillIo(page, `e2e-io-${Date.now().toString(36).slice(-5)}`, { user: '', pass: '' });
      await page.waitForTimeout(600);
      const enabled = await next(page).isEnabled();
      obs(`帳號、密碼皆留空：下一步${enabled ? '可按' : '被停用'}；畫面提示：${(await page.locator('.invalid-feedback:visible').allInnerTexts()).join(' / ')}`);
      expect(enabled, '帳號、密碼留空時無法按下一步（畫面顯示「不能為空或空白」）').toBe(true);
      await next(page).click();
      await expect(page.getByText('輸出接點').first(), '帳號、密碼留空時沒有進入下一步').toBeVisible();
    },
  );

  test(
    '[IO-006] I/O：指定觸發時間、選取日期範圍並可「+」加入特定日期',
    {
      annotation: [
        ...csvAnnotations({ row: 111, no: '', category: '（延續）> （空白）', steps: '指定觸發時間，選取日期範圍"+"加入特定日期', expected: '（原始規格無對應預期結果）' }),
        { type: '判定範圍', description: '原始規格無預期結果：以事件設定的「排程」步驟驗證——可在週排程格子拖曳選取時間、在「指定日期範圍」選取起訖並按「+」加入清單、可移除；加入的設定儲存後保留' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(290000);
      const pg = uniqueGroupName('sc');
      const dg = uniqueDeviceGroupName('sc');
      pgs.push(pg);
      dgs.push(dg);
      await createGroupViaUI(page, { name: pg });
      await createDeviceGroupViaUI(page, { name: dg });
      const name = uniqueEventName('sc');
      events.push(name);
      await openAddEvent(page);
      await fillEventStep1(page, name, pg, dg);
      await next(page).click();
      await page.locator('input[type=text]:visible').nth(0).fill(EVT_TEST_HOST);
      await next(page).click();
      // 排程步驟：週排程拖曳 + 指定日期範圍
      await dragSchedule(page, 1, 9, 17);
      const picker = page.locator('.mx-datepicker input').first();
      await picker.click();
      await picker.fill('2030-01-02 08:00:00 ~ 2030-01-02 18:00:00');
      await picker.press('Enter');
      await page.waitForTimeout(800);
      await page.getByRole('button', { name: '+', exact: true }).click();
      await page.waitForTimeout(800);
      const table = page.locator('#ScheduleTable');
      const rows = await bodyRows(page).allInnerTexts();
      obs('指定日期範圍清單：' + JSON.stringify(rows));
      expect(rows.join(' '), '按「+」後清單沒有出現指定的日期範圍').toContain('2030');
      // 移除
      await bodyRows(page).first().locator('button').first().click();
      await page.waitForTimeout(600);
      expect((await bodyRows(page).allInnerTexts()).join(' '), '按移除後清單仍有該日期範圍').not.toContain('2030');
      // 再加一次並儲存，重新開啟編輯頁後保留
      await picker.click();
      await picker.fill('2030-01-02 08:00:00 ~ 2030-01-02 18:00:00');
      await picker.press('Enter');
      await page.getByRole('button', { name: '+', exact: true }).click();
      await page.waitForTimeout(600);
      await next(page).click();
      await page.getByRole('button', { name: '完成' }).click();
      await gotoEvents(page);
      await searchEvents(page, name);
      await eventRow(page, name).first().getByRole('button', { name: '編輯' }).click();
      await page.locator('input[type=text]:visible').first().waitFor();
      await page.waitForTimeout(1500);
      await next(page).click();
      await next(page).click();
      await page.waitForTimeout(1000);
      expect((await bodyRows(page).allInnerTexts()).join(' '), '儲存後重新開啟，指定日期範圍沒有保留').toContain('2030');
    },
  );

  test(
    '[EVREL-001] 事件設定關聯：一筆事件觸發一個通知，刪除不影響其他事件',
    {
      annotation: [
        ...csvAnnotations({ row: 114, no: '9.7', category: '事件設定關聯 > 刪除時，同時刪除關聯', steps: '事件相互獨立', expected: '一筆事件觸發一個通知，刪除不影響其他事件' }),
        { type: '判定範圍', description: '驗證「刪除不影響其他事件」：建立兩筆事件，刪除其中一筆後，另一筆仍在列表、設定仍可開啟。「一筆事件觸發一個通知」需實際辨識與收訊，由使用者人工測試，未驗證' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(290000);
      const pg = uniqueGroupName('er');
      const dg = uniqueDeviceGroupName('er');
      pgs.push(pg);
      dgs.push(dg);
      await createGroupViaUI(page, { name: pg });
      await createDeviceGroupViaUI(page, { name: dg });
      const a = uniqueEventName('a');
      const b = uniqueEventName('b');
      events.push(a, b);
      await createEventViaUI(page, a, pg, dg);
      await createEventViaUI(page, b, pg, dg);
      await gotoEvents(page);
      await searchEvents(page, 'e2e-');
      await expect(eventRow(page, a)).toHaveCount(1);
      await expect(eventRow(page, b)).toHaveCount(1);
      // 刪除 a
      const row = eventRow(page, a).first();
      const del = row.getByRole('button', { name: '刪除' });
      if (await del.isDisabled()) {
        await row.locator('label.switch').click();
        await page.waitForTimeout(2000);
      }
      await del.click();
      await page.locator('.el-message-box__btns .el-button--primary').click();
      await expect(eventRow(page, a)).toHaveCount(0, { timeout: 15000 });
      // b 仍在，且設定可開啟
      await gotoEvents(page);
      await searchEvents(page, b);
      await expect(eventRow(page, b)).toHaveCount(1);
      await eventRow(page, b).first().getByRole('button', { name: '編輯' }).click();
      await expect(page).toHaveURL(/modifyeventcontrolsetting/);
      await page.locator('input[type=text]:visible').first().waitFor();
      await page.waitForTimeout(1500);
      await expect(page.locator('input[type=text]:visible').first()).toHaveValue(b);
    },
  );
});
