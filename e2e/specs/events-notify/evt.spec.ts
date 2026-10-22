import { test, expect, Page } from '../../helpers/test';
import { csvAnnotations } from '../../helpers/csvSource';
import { cleanupDeviceGroups, createDeviceGroupViaUI, uniqueDeviceGroupName } from '../../helpers/dgroups';
import {
  EVT_TEST_HOST,
  EVT_PREFIX,
  cleanupEvents,
  createEventViaUI,
  dragSchedule,
  eventRow,
  eventRowTexts,
  fillEventStep1,
  gotoEvents,
  openAddEvent,
  searchEvents,
  setEventEnabled,
  uniqueEventName,
} from '../../helpers/events';
import { cleanupGroups, createGroupViaUI, uniqueGroupName } from '../../helpers/groups';
import { bodyRows, readAllRows } from '../../helpers/tables';

// 來源 E2E-TEST-PLAN.md；模組 EVT（CSV 第 93~96 列：#8.1 頁面、#8.2 新增、#8.3 編輯、#8.4 刪除）。
// 本檔實作「適合自動化（Y）」的 6 項（EVT-001、002、003、005、007、008）；EVT-004、006（實際觸發）維持 test.fixme。
// 測試事件為 HTTP 命令（主機 192.0.2.50 為保留網段），綁定「空的測試人員群組＋空的測試影像設備群組」，不會被任何真實辨識觸發。
// afterEach 先清事件（先關閉開關再刪除）、再清群組。既有事件不會被修改或刪除。
// 提醒：事件列表（與平板列表）在已有搜尋關鍵字時再搜尋可能不會更新，故每次搜尋前都重新載入頁面。

const events: string[] = [];
const personGroups: string[] = [];
const deviceGroups: string[] = [];
const trackE = (n: string) => {
  events.push(n);
  return n;
};

test.afterEach(async ({ browser }) => {
  await cleanupEvents(browser, events.splice(0));
  await cleanupGroups(browser, personGroups.splice(0));
  await cleanupDeviceGroups(browser, deviceGroups.splice(0));
});

/** 建立一組空的測試人員群組與影像設備群組，供事件綁定。 */
async function makeScope(page: Page) {
  const pg = uniqueGroupName('ev');
  const dg = uniqueDeviceGroupName('ev');
  personGroups.push(pg);
  deviceGroups.push(dg);
  await createGroupViaUI(page, { name: pg });
  await createDeviceGroupViaUI(page, { name: dg });
  return { pg, dg };
}

async function freshSearch(page: Page, keyword: string) {
  await gotoEvents(page);
  await searchEvents(page, keyword);
}

async function openEditOf(page: Page, name: string) {
  await freshSearch(page, name);
  await eventRow(page, name).first().getByRole('button', { name: '編輯' }).click();
  await expect(page).toHaveURL(/modifyeventcontrolsetting/);
  await page.locator('input[type=text]:visible').first().waitFor();
  await page.waitForTimeout(2000);
}

test.describe('EVT', () => {
  test(
    '[EVT-001] 事件頁面：顯示已設定事件、頁數、筆數、顯示欄位',
    {
      annotation: csvAnnotations({
        row: 93,
        no: '8.1',
        category: '事件 > 頁面',
        steps: '1.進入事件管理頁面，查看目前已設定事件、頁數、筆數、顯示欄位\n2.使用搜尋功能查看事件',
        expected: '1.正確顯示所有的事件、頁數、筆數、顯示欄位',
      }),
    },
    async ({ page }) => {
      await gotoEvents(page);
      const headers = (await page.locator('.vxe-table--header-wrapper th').allInnerTexts()).map((s) => s.trim());
      for (const h of ['啟用', '設定名稱', '事件類別', '備註']) expect(headers).toContain(h);
      await expect(page.locator('.vxe-table--header-wrapper .vxe-cell--checkbox').first()).toBeVisible();
      const pager = (await page.locator('.vxe-pager').innerText()).replace(/\s+/g, ' ');
      const total = Number(pager.slice(pager.indexOf('共')).replace(/[^0-9]/g, ''));
      expect(total).toBeGreaterThan(0);
      const all = await readAllRows(page, false);
      expect(all.length).toBe(total);
      // 每一列：有啟用開關、編輯、刪除
      const rows = bodyRows(page);
      for (let i = 0; i < (await rows.count()); i += 1) {
        await expect(rows.nth(i).locator('label.switch')).toHaveCount(1);
        await expect(rows.nth(i).getByRole('button', { name: '編輯' })).toBeVisible();
        await expect(rows.nth(i).getByRole('button', { name: '刪除' })).toHaveCount(1);
      }
    },
  );

  test(
    '[EVT-002] 事件頁面：搜尋文字功能',
    {
      annotation: csvAnnotations({
        row: 93,
        no: '8.1',
        category: '事件 > 頁面',
        steps: '2.使用搜尋功能查看事件',
        expected: '2.搜尋文字功能正確',
      }),
    },
    async ({ page }) => {
      test.setTimeout(420000);
      // 規格沒有定義可搜尋哪些欄位；以「設定名稱」為準。
      // 不依賴環境裡既有的事件名稱：先自己建立名稱含 test、http、smtp 的事件，再搜尋（事件在 afterEach 清除）
      const { pg, dg } = await makeScope(page);
      for (const keyword of ['test', 'http', 'smtp']) await createEventViaUI(page, trackE(uniqueEventName(keyword)), pg, dg);
      // 每個關鍵字都從重新載入的頁面開始搜尋
      for (const keyword of ['test', 'http', 'smtp']) {
        await freshSearch(page, keyword);
        const rows = await eventRowTexts(page);
        expect(rows.length, `搜尋「${keyword}」沒有結果`).toBeGreaterThan(0);
        for (const r of rows) expect(r.toLowerCase(), `搜尋「${keyword}」出現不含關鍵字的列`).toContain(keyword);
      }
      await freshSearch(page, `e2e-no-such-${Date.now()}`);
      expect(await eventRowTexts(page)).toEqual([]);
      // 觀察：事件類別（如 mail）是否可被搜尋（規格未定義，不納入判定）
      await freshSearch(page, 'mail');
      test.info().annotations.push({ type: '觀察', description: `以事件類別文字「mail」搜尋，結果 ${(await eventRowTexts(page)).length} 筆（搜尋只比對設定名稱時為 0）` });
    },
  );

  test(
    '[EVT-003] 新增事件：依事件填入資訊與排程後完成建立',
    {
      annotation: csvAnnotations({
        row: 94,
        no: '8.2',
        category: '（延續）> 新增',
        steps: '1. 依照事件，分別填入所需的資訊\n2. 選擇事件作動的排程 (如時段)\n3. 按下完成，結束設定',
        expected: '新增事件功能正常且能建立成功',
      }),
    },
    async ({ page }) => {
      test.setTimeout(300000);
      const { pg, dg } = await makeScope(page);
      const name = trackE(uniqueEventName('a'));
      await openAddEvent(page);
      await fillEventStep1(page, name, pg, dg);
      await page.getByRole('button', { name: '下一步' }).click();
      await page.locator('input[type=text]:visible').nth(0).fill(EVT_TEST_HOST);
      await page.getByRole('button', { name: '下一步' }).click();
      // 排程：選擇星期一 9~17 點
      const table = page.locator('table:visible').first();
      const targetCell = table.locator('tbody tr').nth(1).locator('td').nth(10);
      const otherCell = table.locator('tbody tr').nth(3).locator('td').nth(5);
      const bgBefore = await targetCell.evaluate((e) => getComputedStyle(e).backgroundColor);
      await dragSchedule(page, 0, 9, 17);
      const bgAfter = await targetCell.evaluate((e) => getComputedStyle(e).backgroundColor);
      expect(bgAfter, '拖曳後被選取的排程格子底色沒有改變').not.toBe(bgBefore);
      expect(await otherCell.evaluate((e) => getComputedStyle(e).backgroundColor)).toBe(bgBefore);
      await page.getByRole('button', { name: '下一步' }).click();
      await page.getByRole('button', { name: '完成' }).click();
      // 列表出現該事件，類別為 http
      await freshSearch(page, name);
      const rows = await eventRowTexts(page);
      expect(rows).toHaveLength(1);
      expect(rows[0]).toContain('http');
      // 重新開啟編輯頁到排程：被選取的格子仍為選取色
      await openEditOf(page, name);
      await page.getByRole('button', { name: '下一步' }).click();
      await page.getByRole('button', { name: '下一步' }).click();
      const saved = page.locator('table:visible').first().locator('tbody tr').nth(1).locator('td').nth(10);
      expect(await saved.evaluate((e) => getComputedStyle(e).backgroundColor), '儲存後排程沒有保留').toBe(bgAfter);
    },
  );

  test(
    '[EVT-005] 編輯事件：名稱可編輯並更新成功',
    {
      annotation: csvAnnotations({
        row: 95,
        no: '8.3',
        category: '（延續）> 編輯',
        steps: '1. 名稱可以編輯是正確的',
        expected: '編輯事件功能正常且能更新成功',
      }),
    },
    async ({ page }) => {
      test.setTimeout(300000);
      const { pg, dg } = await makeScope(page);
      const before = trackE(uniqueEventName('e1'));
      const after = trackE(uniqueEventName('e2'));
      await createEventViaUI(page, before, pg, dg);
      await openEditOf(page, before);
      const nameInput = page.locator('input[type=text]:visible').first();
      await expect(nameInput).toBeEnabled();
      await nameInput.fill(after);
      for (let i = 0; i < 3; i += 1) await page.getByRole('button', { name: '下一步' }).click();
      await page.getByRole('button', { name: '完成' }).click();
      await gotoEvents(page);
      const all = await readAllRows(page, false);
      expect(all.some((r) => r.includes(before)), '舊名稱仍在列表').toBe(false);
      expect(all.some((r) => r.includes(after)), '列表找不到更新後的名稱').toBe(true);
    },
  );

  test(
    '[EVT-007] 刪除事件：關閉事件可刪除（單一/多選）',
    {
      annotation: csvAnnotations({
        row: 96,
        no: '8.4',
        category: '（延續）> 刪除',
        steps: '勾選(單一、多選)事件刪除(正在被使用的不能刪除)',
        expected: '1.關閉事件可刪除事件功',
      }),
    },
    async ({ page }) => {
      test.setTimeout(300000);
      const { pg, dg } = await makeScope(page);
      // 既有（非 e2e-）事件，測完必須原封不動；不寫死環境裡的特定事件名稱
      await gotoEvents(page);
      const keepBefore = (await readAllRows(page, false)).filter((r) => !r.startsWith(EVT_PREFIX));
      expect(keepBefore.length, '環境中沒有既有事件可供比對').toBeGreaterThan(0);
      const names = ['d1', 'd2', 'd3'].map((t) => trackE(uniqueEventName(t)));
      for (const n of names) await createEventViaUI(page, n, pg, dg);
      // 關閉三個事件（開關切到關閉）
      for (const n of names) {
        await freshSearch(page, n);
        await setEventEnabled(page, n, false);
      }
      // 單一：勾選 d1 並按上方「刪除」
      await freshSearch(page, EVT_PREFIX);
      await eventRow(page, names[0]).first().locator('.vxe-cell--checkbox').click();
      await page.locator('button.btn-danger').first().click();
      await page.locator('.el-message-box__btns .el-button--primary').click();
      await expect(eventRow(page, names[0])).toHaveCount(0, { timeout: 20000 });
      await expect(eventRow(page, names[1])).toHaveCount(1);
      // 多選：勾選 d2、d3 並刪除
      for (const n of names.slice(1)) await eventRow(page, n).first().locator('.vxe-cell--checkbox').click();
      await page.locator('button.btn-danger').first().click();
      await page.locator('.el-message-box__btns .el-button--primary').click();
      // 只驗證自己建立的三個事件（環境裡可能有其他測項留下的 e2e- 事件，不可假設全部清空）
      for (const n of names) await expect(eventRow(page, n)).toHaveCount(0, { timeout: 20000 });
      // 重新載入：三個都不在；既有事件仍在
      await freshSearch(page, EVT_PREFIX);
      const left = await eventRowTexts(page);
      for (const n of names) expect(left.some((r) => r.includes(n)), `${n} 重新載入後仍在列表中`).toBe(false);
      await gotoEvents(page);
      const all = await readAllRows(page, false);
      expect(all.filter((r) => !r.startsWith(EVT_PREFIX)), '既有事件在刪除測試事件後應原封不動').toEqual(keepBefore);
    },
  );

  test(
    '[EVT-008] 刪除事件：正在被使用的規則不能刪除',
    {
      annotation: [
        ...csvAnnotations({
          row: 96,
          no: '8.4',
          category: '（延續）> 刪除',
          steps: '勾選(單一、多選)事件刪除(正在被使用的不能刪除)',
          expected: '2.正在被使用的規則不能刪除',
        }),
        { type: '判定範圍', description: '「正在被使用」解讀為「啟用中（開關開啟）」的事件；以測試事件驗證，不對既有事件做刪除操作' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(300000);
      const { pg, dg } = await makeScope(page);
      const name = trackE(uniqueEventName('u'));
      await createEventViaUI(page, name, pg, dg);
      await freshSearch(page, name);
      const row = eventRow(page, name).first();
      // 啟用中：該列「刪除」按鈕為停用（只讀狀態）
      await expect(row.locator('input[type=checkbox]')).toBeChecked();
      await expect(row.getByRole('button', { name: '刪除' })).toBeDisabled();
      // 勾選該列後按上方「刪除」，事件仍必須存在（若出現確認視窗並確定，仍不能被刪除）
      await row.locator('.vxe-cell--checkbox').click();
      const top = page.locator('button.btn-danger').first();
      if (await top.isEnabled()) {
        await top.click();
        const ok = page.locator('.el-message-box__btns .el-button--primary');
        if (await ok.count()) await ok.click();
        await page.waitForTimeout(3000);
      }
      await freshSearch(page, name);
      await expect(eventRow(page, name), '啟用中的事件被刪除了').toHaveCount(1);
    },
  );

});
