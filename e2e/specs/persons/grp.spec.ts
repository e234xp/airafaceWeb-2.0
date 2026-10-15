import { test, expect, Page } from '@playwright/test';
import { csvAnnotations } from '../../helpers/csvSource';
import {
  GROUP_PREFIX,
  cleanupGroups,
  createGroupViaUI,
  editGroupViaUI,
  gotoGroups,
  groupRow,
  groupRowTexts,
  openCreateGroup,
  rowAction,
  searchGroups,
  uniqueGroupName,
} from '../../helpers/groups';
import { Kind, cleanupPersons, createPersonViaUI, gotoPersons, searchPersons, personRowTexts, uniquePersonId } from '../../helpers/persons';
import { bodyRows, readAllRows } from '../../helpers/tables';

// 來源 E2E-TEST-PLAN.md；模組 GRP（CSV 第 68~71 列：#5.11 列表、#5.12 新增、#5.13 編輯、#5.14 刪除）。
// 本檔實作「適合自動化（Y）」的 10 項（GRP-001~010）；GRP-011~015（刪除後檢查關聯）維持 test.fixme。
// 群組名稱不可含特殊字元（含連字號），測試群組以「e2e」開頭；人員／訪客以「e2e-」開頭。afterEach 先清群組再清人員／訪客。

const groups: string[] = [];
const persons: string[] = [];
const visitors: string[] = [];
const trackGroup = (n: string) => {
  groups.push(n);
  return n;
};

test.afterEach(async ({ browser }) => {
  await cleanupGroups(browser, groups.splice(0));
  await cleanupPersons(browser, persons.splice(0), 'person');
  await cleanupPersons(browser, visitors.splice(0), 'visitor');
});

const cellText = async (page: Page, name: string, col: number) =>
  ((await groupRow(page, name).first().locator(`td:nth-child(${col})`).innerText()) ?? '').trim();
const next = (page: Page) => page.getByRole('button', { name: '下一步' });
const nameError = (page: Page) => page.locator('.invalid-feedback:visible').first();

async function newPerson(page: Page, kind: Kind, tag: string) {
  const id = uniquePersonId(tag);
  (kind === 'person' ? persons : visitors).push(id);
  await createPersonViaUI(page, { id, name: `e2e${tag}` }, kind);
  return id;
}

test.describe('GRP', () => {
  test(
    '[GRP-001] 群組列表：清單、頁數、筆數、每頁最多 10 筆、顯示欄位',
    {
      annotation: csvAnnotations({
        row: 68,
        no: '5.11',
        category: '群組 > 群組(列表)',
        steps: '1.進入群組\n2.檢視群組清單、資料筆數、頁數',
        expected: '1.正確顯示所有的群組清單、頁數、筆數、顯示欄位\n4. 每頁最多 10筆\n5. 顯示欄位: [選擇]、群組名稱、人員數量、訪客數量、備註、建立時間、[操作]',
      }),
    },
    async ({ page }) => {
      test.setTimeout(120000);
      await gotoGroups(page);
      const headers = (await page.locator('.vxe-table--header-wrapper th').allInnerTexts()).map((s) => s.replace(/\s+/g, '').trim());
      // 規格欄位（依序）：群組名稱、人員數量、訪客數量、備註、建立時間
      const order = ['群組名稱', '人員數量', '訪客數量', '備註', '建立時間'].map((h) => headers.findIndex((x) => x.includes(h)));
      expect(order.every((i) => i >= 0), `表頭：${headers.join('、')}`).toBe(true);
      expect([...order].sort((a, b) => a - b)).toEqual(order);
      await expect(page.locator('.vxe-table--header-wrapper .vxe-cell--checkbox').first()).toBeVisible();
      const extra = headers.filter((h) => h && !['群組名稱', '人員數量', '訪客數量', '備註', '建立時間'].some((k) => h.includes(k)));
      if (extra.length > 0) test.info().annotations.push({ type: '觀察', description: `表頭另有規格未列的欄位：${extra.join('、')}` });
      // 清單與筆數、頁數：分頁列總筆數 = 逐頁累計；第 1 頁 min(10, N)；N 大於 10 有第 2 頁
      const pager = (await page.locator('.vxe-pager').innerText()).replace(/\s+/g, ' ');
      const total = Number(pager.slice(pager.indexOf('共')).replace(/[^0-9]/g, ''));
      expect(total).toBeGreaterThan(0);
      expect(await bodyRows(page).count()).toBe(Math.min(10, total));
      if (total > 10) await expect(page.locator('.vxe-pager--num-btn').nth(1)).toBeVisible();
      const all = await readAllRows(page, false);
      expect(all.length).toBe(total);
      // 清單包含系統內建的預設群組
      expect(all.some((r) => r.includes('All Person'))).toBe(true);
      expect(all.some((r) => r.includes('All Visitor'))).toBe(true);
    },
  );

  test(
    '[GRP-002] 群組列表：預設群組（All person / All visitor）僅可檢視，無法刪除或編輯',
    {
      annotation: csvAnnotations({
        row: 68,
        no: '5.11',
        category: '群組 > 群組(列表)',
        steps: '1.進入群組\n2.檢視群組清單、資料筆數、頁數',
        expected: '2.預設群組僅可檢視:顯示所有人員群組的清單\n6. All person, All visitor 為系統內建群組，無法被刪除或編輯 (只能檢視)',
      }),
    },
    async ({ page }) => {
      await gotoGroups(page);
      for (const n of ['All Person', 'All Visitor']) {
        await searchGroups(page, n);
        const row = groupRow(page, n);
        await expect(row).toHaveCount(1);
        await expect(rowAction(row, '檢視')).toBeVisible();
        await expect(rowAction(row, '編輯')).toHaveCount(0);
        await expect(rowAction(row, '刪除')).toHaveCount(0);
        // 勾選框為停用（不能被勾選刪除）
        await expect(row.first().locator('.vxe-cell--checkbox')).toHaveClass(/is--disabled/);
        // 可檢視：進入檢視頁
        await rowAction(row, '檢視').click();
        await expect(page).toHaveURL(/checkgroup/);
        await gotoGroups(page);
      }
    },
  );

  test(
    '[GRP-003] 群組列表：群組名稱、建立時間搜尋與包含輸入文字的項目',
    {
      annotation: csvAnnotations({
        row: 68,
        no: '5.11',
        category: '群組 > 群組(列表)',
        steps: '3.使用搜尋功能查詢',
        expected: '7.在群組名稱、建立時間搜尋與包含輸入文字的項目',
      }),
    },
    async ({ page }) => {
      test.setTimeout(120000);
      const name = trackGroup(uniqueGroupName('s'));
      await createGroupViaUI(page, { name, remarks: 'e2e備註' });
      // 群組名稱：結果每一列都含關鍵字，且包含該群組
      await searchGroups(page, name);
      let rows = await groupRowTexts(page);
      expect(rows.length).toBeGreaterThan(0);
      for (const r of rows) expect(r.toLowerCase()).toContain(name.toLowerCase());
      // 建立時間：取清單第一列的建立時間（第 7 欄）為關鍵字
      await searchGroups(page, '');
      const created = (await bodyRows(page).first().locator('td:nth-child(7)').innerText()).trim();
      expect(created.length).toBeGreaterThan(0);
      await searchGroups(page, created);
      rows = await readAllRows(page, false);
      expect(rows.length).toBeGreaterThan(0);
      for (const r of rows) expect(r).toContain(created);
      // 不存在的關鍵字：無結果
      await searchGroups(page, `e2eno-such-${Date.now()}`);
      expect(await groupRowTexts(page)).toEqual([]);
    },
  );

  test(
    '[GRP-004] 群組列表：刪除群組資料',
    {
      annotation: csvAnnotations({
        row: 68,
        no: '5.11',
        category: '群組 > 群組(列表)',
        steps: '4.刪除群組資料',
        expected: '〔使用者確認 2026-10-07：以步驟原文作為預期結果〕4.刪除群組資料',
      }),
    },
    async ({ page }) => {
      test.setTimeout(120000);
      const name = trackGroup(uniqueGroupName('d'));
      await createGroupViaUI(page, { name });
      await searchGroups(page, name);
      // 取消：群組仍在
      await rowAction(groupRow(page, name), '刪除').click();
      await page.locator('.el-message-box__btns .el-button').first().click();
      await expect(page.locator('.el-message-box')).toBeHidden();
      await expect(groupRow(page, name)).toHaveCount(1);
      // 確定：群組消失，重新載入後仍不存在
      await rowAction(groupRow(page, name), '刪除').click();
      await page.locator('.el-message-box__btns .el-button--primary').click();
      await expect(groupRow(page, name)).toHaveCount(0, { timeout: 10000 });
      await gotoGroups(page);
      await searchGroups(page, name);
      expect(await groupRowTexts(page)).toEqual([]);
    },
  );

  test(
    '[GRP-005] 新增群組：群組名稱必填、備註，新增後顯示於列表',
    {
      annotation: csvAnnotations({
        row: 69,
        no: '5.12',
        category: '（延續）> 群組(新增)',
        steps: '1. 點選 新增部門，可以進入新增頁面\n2. 群組名稱(必填)、備註\n4. 新增後，顯示此群組在列表中',
        expected: '新增群組功能正常且能建立成功',
      }),
    },
    async ({ page }) => {
      test.setTimeout(120000);
      await openCreateGroup(page);
      const inputs = page.locator('input[type=text]:visible');
      // 名稱必填：空白時錯誤訊息標示於欄位下方，無法下一步
      await expect(next(page)).toBeDisabled();
      await expect(nameError(page)).toBeVisible();
      // 名稱重複（既有群組 admin）：無法下一步
      await inputs.nth(0).fill('admin');
      await expect(next(page)).toBeDisabled();
      // 名稱含特殊字元：無法下一步
      await inputs.nth(0).fill('e2e-特殊字元!');
      await expect(next(page)).toBeDisabled();
      // 填妥名稱與備註：可下一步
      const name = trackGroup(uniqueGroupName('a'));
      await inputs.nth(0).fill(name);
      await inputs.nth(1).fill('e2e新增備註');
      await expect(next(page)).toBeEnabled();
      await next(page).click();
      await page.getByRole('button', { name: '創建' }).click();
      await page.getByRole('button', { name: '完成' }).click();
      // 新增後顯示於列表，名稱、備註正確，人員／訪客數量為 0
      await gotoGroups(page);
      await searchGroups(page, name);
      await expect(groupRow(page, name)).toHaveCount(1);
      expect(await cellText(page, name, 5)).toBe('e2e新增備註');
      expect(await cellText(page, name, 3)).toBe('0');
      expect(await cellText(page, name, 4)).toBe('0');
    },
  );

  test(
    '[GRP-006] 新增群組：自人員或訪客列表選擇人員加入此群組',
    {
      annotation: csvAnnotations({
        row: 69,
        no: '5.12',
        category: '（延續）> 群組(新增)',
        steps: '3. 可自人員或訪客列表中，選擇人員加入此群組',
        expected: '新增群組功能正常且能建立成功',
      }),
    },
    async ({ page }) => {
      test.setTimeout(240000);
      const pid = await newPerson(page, 'person', 'gp');
      const vid = await newPerson(page, 'visitor', 'gv');
      const name = trackGroup(uniqueGroupName('m'));
      await createGroupViaUI(page, { name, personIds: [pid], visitorIds: [vid] });
      await searchGroups(page, name);
      expect(await cellText(page, name, 3)).toBe('1'); // 人員數量
      expect(await cellText(page, name, 4)).toBe('1'); // 訪客數量
      // 人員、訪客各自的列表在群組欄顯示此群組
      await gotoPersons(page, 'person');
      await searchPersons(page, pid);
      expect((await personRowTexts(page))[0]).toContain(name);
      await gotoPersons(page, 'visitor');
      await searchPersons(page, vid);
      expect((await personRowTexts(page))[0]).toContain(name);
    },
  );

  test(
    '[GRP-007] 編輯群組：修改備註、隸屬人員，確認後於群組頁面看到更新資料',
    {
      annotation: csvAnnotations({
        row: 70,
        no: '5.13',
        category: '（延續）> 群組(編輯)',
        steps: '1. 點選編輯符號，進入編輯頁面\n2. 修改備註、隸屬人員\n3.按下確認按鈕，可以在【群組】頁面看到更新後的資料',
        expected: '編輯群組功能正常且能更新成功',
      }),
    },
    async ({ page }) => {
      test.setTimeout(240000);
      const p1 = await newPerson(page, 'person', 'ge1');
      const p2 = await newPerson(page, 'person', 'ge2');
      const name = trackGroup(uniqueGroupName('e'));
      await createGroupViaUI(page, { name, remarks: 'e2e編輯前', personIds: [p1] });
      await searchGroups(page, name);
      expect(await cellText(page, name, 3)).toBe('1');
      // 編輯頁：群組名稱為停用；修改備註並加入第 2 位人員
      await rowAction(groupRow(page, name), '編輯').click();
      await expect(page).toHaveURL(/modifygroup/);
      await expect(page.locator('input[type=text]:visible').first()).toBeDisabled();
      await gotoGroups(page);
      await editGroupViaUI(page, name, { remarks: 'e2e編輯後', addPersonIds: [p2] });
      await gotoGroups(page);
      await searchGroups(page, name);
      expect(await cellText(page, name, 5)).toBe('e2e編輯後');
      expect(await cellText(page, name, 3)).toBe('2');
    },
  );

  test(
    '[GRP-008] 刪除群組：勾選單一或全選刪除',
    {
      annotation: [
        ...csvAnnotations({
          row: 71,
          no: '5.14',
          category: '（延續）> 群組(刪除)',
          steps: '1.選取方框後，可單一、全選來進行刪除',
          expected: '刪除群組資料功能正常',
        }),
        { type: '安全措施', description: '「全選」前先以搜尋把清單限縮為 e2e 測試群組；按刪除前先確認被勾選的列全部是 e2e 開頭，否則中止，避免刪到既有群組' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(240000);
      const names = ['b1', 'b2', 'b3'].map((t) => trackGroup(uniqueGroupName(t)));
      for (const n of names) await createGroupViaUI(page, { name: n });
      await gotoGroups(page);
      await searchGroups(page, GROUP_PREFIX);
      // 勾選單一：只刪第 1 個
      await groupRow(page, names[0]).first().locator('.vxe-cell--checkbox').click();
      await page.locator('button.btn-danger').first().click();
      await page.locator('.el-message-box__btns .el-button--primary').click();
      await expect(groupRow(page, names[0])).toHaveCount(0, { timeout: 10000 });
      await expect(groupRow(page, names[1])).toHaveCount(1);
      // 全選：清單已限縮為 e2e 測試群組，按表頭勾選框
      await gotoGroups(page);
      await searchGroups(page, GROUP_PREFIX);
      const shown = await groupRowTexts(page);
      expect(shown.length).toBeGreaterThanOrEqual(2);
      for (const r of shown) expect(r.startsWith(GROUP_PREFIX), `清單含非測試群組：${r}`).toBe(true);
      await page.locator('.vxe-table--header-wrapper .vxe-cell--checkbox').first().click();
      const checked = await page.locator('.vxe-table--body-wrapper tbody tr:has(.vxe-cell--checkbox.is--checked)').allInnerTexts();
      expect(checked.length).toBe(shown.length);
      for (const r of checked) expect(r.trim().startsWith(GROUP_PREFIX), `被勾選的列含非測試群組：${r}`).toBe(true);
      await page.locator('button.btn-danger').first().click();
      await page.locator('.el-message-box__btns .el-button--primary').click();
      await expect(groupRow(page, GROUP_PREFIX)).toHaveCount(0, { timeout: 10000 });
      // 重新載入後確認已刪除，且既有群組仍在
      await gotoGroups(page);
      await searchGroups(page, GROUP_PREFIX);
      expect(await groupRowTexts(page)).toEqual([]);
      await searchGroups(page, 'All Person');
      await expect(groupRow(page, 'All Person')).toHaveCount(1);
    },
  );

  test(
    '[GRP-009] 刪除群組：單一項目右方刪除按鈕刪除',
    {
      annotation: csvAnnotations({
        row: 71,
        no: '5.14',
        category: '（延續）> 群組(刪除)',
        steps: '2.可選擇單一項目右方的刪除按鈕進行刪除',
        expected: '刪除群組資料功能正常',
      }),
    },
    async ({ page }) => {
      test.setTimeout(120000);
      const a = trackGroup(uniqueGroupName('r1'));
      const b = trackGroup(uniqueGroupName('r2'));
      await createGroupViaUI(page, { name: a });
      await createGroupViaUI(page, { name: b });
      await searchGroups(page, GROUP_PREFIX);
      await rowAction(groupRow(page, a), '刪除').click();
      await page.locator('.el-message-box__btns .el-button--primary').click();
      await expect(groupRow(page, a)).toHaveCount(0, { timeout: 10000 });
      await expect(groupRow(page, b)).toHaveCount(1); // 只刪該列
    },
  );

  test(
    '[GRP-010] 刪除群組：預設群組（All person、All visitors）不可被刪除',
    {
      annotation: csvAnnotations({
        row: 71,
        no: '5.14',
        category: '（延續）> 群組(刪除)',
        steps: '3.預設群組不可被刪除(All person、All visitors)',
        expected: '刪除群組資料功能正常',
      }),
    },
    async ({ page }) => {
      await gotoGroups(page);
      for (const n of ['All Person', 'All Visitor']) {
        await searchGroups(page, n);
        const row = groupRow(page, n);
        await expect(rowAction(row, '刪除')).toHaveCount(0); // 沒有單列刪除按鈕
        await expect(row.first().locator('.vxe-cell--checkbox')).toHaveClass(/is--disabled/); // 無法勾選
      }
      // 對停用的勾選框不做動作（Rule §3）：改以表頭全選後確認預設群組仍未被勾選
      await searchGroups(page, '');
      await page.locator('.vxe-table--header-wrapper .vxe-cell--checkbox').first().click();
      for (const n of ['All Person', 'All Visitor']) {
        await searchGroups(page, n);
        await expect(groupRow(page, n).first().locator('.vxe-cell--checkbox')).not.toHaveClass(/is--checked/);
      }
      // 取消全選，不按刪除
      await searchGroups(page, '');
      await page.locator('.vxe-table--header-wrapper .vxe-cell--checkbox').first().click();
    },
  );

  // ---- 以下維持 fixme（刪除後的關聯檢查，需要其他模組資料） ----
});
