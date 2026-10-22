import { test, expect, Page } from '../../helpers/test';
import { csvAnnotations } from '../../helpers/csvSource';
import { cleanupCameras, createCameraViaUI, openAddCamera, uniqueCameraName } from '../../helpers/cameras';
import {
  DG_PREFIX,
  cleanupDeviceGroups,
  createDeviceGroupViaUI,
  dgRow,
  dgRowTexts,
  gotoDeviceGroups,
  searchDeviceGroups,
  uniqueDeviceGroupName,
  addDevicesInStep2,
} from '../../helpers/dgroups';
import { openAddTablet } from '../../helpers/tablets';
import { bodyRows, readAllRows } from '../../helpers/tables';

// 來源 E2E-TEST-PLAN.md；模組 DGRP（CSV 第 90~91 列：#6.6 影像設備群組新增／編輯、刪除）。
// 本檔實作「適合自動化（Y）」的 6 項（DGRP-001、002、004、005、006、007）；DGRP-003 為部分自動化，維持 fixme。
// 測試群組／攝影機以 e2e- 開頭；afterEach 先清群組再清攝影機。既有群組（All Cameras、All Tablets、Video Group-*、test）不會被修改或刪除。
// 預設群組（All Cameras、All Tablets）絕不按「確定」刪除：只讀取按鈕狀態，或在確認視窗按「取消」。

const groups: string[] = [];
const cameras: string[] = [];
const trackG = (n: string) => {
  groups.push(n);
  return n;
};
const trackC = (n: string) => {
  cameras.push(n);
  return n;
};

test.afterEach(async ({ browser }) => {
  await cleanupDeviceGroups(browser, groups.splice(0));
  await cleanupCameras(browser, cameras.splice(0));
});

const cellText = async (page: Page, name: string, col: number) =>
  ((await dgRow(page, name).first().locator(`td:nth-child(${col})`).innerText()) ?? '').trim();
const pagerTotal = async (page: Page) => {
  const pager = (await page.locator('.vxe-pager').innerText()).replace(/\s+/g, ' ');
  return Number(pager.slice(pager.indexOf('共')).replace(/[^0-9]/g, ''));
};

async function openEdit(page: Page, name: string) {
  await gotoDeviceGroups(page);
  await searchDeviceGroups(page, name);
  await dgRow(page, name).first().getByRole('button', { name: '編輯' }).click();
  await expect(page).toHaveURL(/Modifyvideodevicegroups/i);
  await page.locator('input[type=text]:visible').first().waitFor();
  await page.waitForTimeout(2000);
}

test.describe('DGRP', () => {
  test(
    '[DGRP-001] 影像設備群組：新增群組成功',
    {
      annotation: csvAnnotations({
        row: 90,
        no: '6.6',
        category: '（延續）> 影像設備群組(新增/編輯)',
        steps: '1. 點選新增可以進入建立群組畫面',
        expected: '4.新增功能正常且能建立成功',
      }),
    },
    async ({ page }) => {
      test.setTimeout(240000);
      const cam = trackC(uniqueCameraName('dg'));
      await createCameraViaUI(page, cam);
      const name = trackG(uniqueDeviceGroupName('a'));
      await createDeviceGroupViaUI(page, { name, remarks: 'e2e備註', devices: [cam] });
      await gotoDeviceGroups(page);
      await searchDeviceGroups(page, name);
      await expect(dgRow(page, name)).toHaveCount(1);
      expect(await cellText(page, name, 3)).toBe('1'); // 攝影機數量
      expect(await cellText(page, name, 4)).toBe('0'); // 平板數量
    },
  );

  test(
    '[DGRP-002] 影像設備群組：編輯群組（名稱、群組等），列表呈現更新後資料',
    {
      annotation: csvAnnotations({
        row: 90,
        no: '6.6',
        category: '（延續）> 影像設備群組(新增/編輯)',
        steps: '2. 點選 編輯 可以進入影像設備資料編輯頁面\n3. 可以修改設備名稱、群組等資訊\n4. 在【影像設備】列表可以呈現更新後的群組資料',
        expected: '5.編輯功能正常且能更新成功',
      }),
    },
    async ({ page }) => {
      test.setTimeout(240000);
      const cam = trackC(uniqueCameraName('dg'));
      await createCameraViaUI(page, cam);
      const before = trackG(uniqueDeviceGroupName('e1'));
      const after = trackG(uniqueDeviceGroupName('e2'));
      await createDeviceGroupViaUI(page, { name: before, remarks: 'e2e編輯前' });
      await openEdit(page, before);
      const ins = page.locator('input[type=text]:visible');
      await ins.nth(0).fill(after);
      await ins.nth(1).fill('e2e編輯後');
      await page.getByRole('button', { name: '下一步' }).click();
      await addDevicesInStep2(page, [cam]);
      await page.getByRole('button', { name: /儲存變更|創建/ }).click();
      await page.getByRole('button', { name: '完成' }).click();
      // 列表：新名稱存在（加入 1 台攝影機）、舊名稱不存在；不使用搜尋，逐頁讀取
      await gotoDeviceGroups(page);
      const all = await readAllRows(page, false);
      expect(all.some((r) => r.startsWith(before)), '舊名稱仍在列表').toBe(false);
      const row = all.find((r) => r.startsWith(after));
      expect(row, '列表找不到更新後的群組').toBeTruthy();
      expect(row).toContain(' 1 0 0'); // 攝影機 1、平板 0、規則 0
    },
  );

  test(
    '[DGRP-004] 影像設備群組：可留空（不指定群組），選項不應包含預設群組（all cameras、all tablets）',
    {
      annotation: [
        ...csvAnnotations({
          row: 90,
          no: '6.6',
          category: '（延續）> 影像設備群組(新增/編輯)',
          steps: '5.可留空 (沒有指定群組)\n   - 選項中不應包含預設群組 (all cameras, all tablets)',
          expected: '〔使用者確認 2026-10-07：以步驟原文作為預期結果〕同步驟',
        }),
        { type: '判定範圍', description: '「選項」解讀為新增攝影機／平板時的「設備群組」下拉選單；「可留空」以不選群組即可建立成功判定' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(240000);
      // 攝影機：可留空（不選群組建立成功），且下拉選項不含預設群組
      const cam = trackC(uniqueCameraName('dn'));
      await createCameraViaUI(page, cam);
      await openAddCamera(page);
      await page.locator('.multiselect').first().click();
      const camOptions = (await page.locator('.multiselect__option').allInnerTexts()).map((s) => s.trim());
      for (const o of camOptions) expect(['All Cameras', 'All Tablets'], `攝影機的設備群組選項含預設群組：${o}`).not.toContain(o);
      // 平板：下拉選項不含預設群組
      await openAddTablet(page);
      await page.locator('.multiselect').first().click();
      const tabOptions = (await page.locator('.multiselect__option').allInnerTexts()).map((s) => s.trim());
      for (const o of tabOptions) expect(['All Cameras', 'All Tablets'], `平板的設備群組選項含預設群組：${o}`).not.toContain(o);
      expect(camOptions.length + tabOptions.length).toBeGreaterThan(0);
    },
  );

  test(
    '[DGRP-005] 影像設備群組：清單顯示與搜尋文字功能',
    {
      annotation: csvAnnotations({
        row: 90,
        no: '6.6',
        category: '（延續）> 影像設備群組(新增/編輯)',
        steps: '4. 在【影像設備】列表可以呈現更新後的群組資料',
        expected: '2.正確顯示所有的清單、頁數、筆數、顯示欄位\n3.搜尋文字功能正確',
      }),
    },
    async ({ page }) => {
      test.setTimeout(300000);
      const name = trackG(uniqueDeviceGroupName('s'));
      await createDeviceGroupViaUI(page, { name });
      await gotoDeviceGroups(page);
      // 清單：表頭、筆數
      const headers = (await page.locator('.vxe-table--header-wrapper th').allInnerTexts()).map((s) => s.trim());
      for (const h of ['影像設備群組', '攝影機', '平板']) expect(headers).toContain(h);
      await expect(page.locator('.vxe-table--header-wrapper .vxe-cell--checkbox').first()).toBeVisible();
      const total = await pagerTotal(page);
      const all = await readAllRows(page, false);
      expect(all.length).toBe(total);
      // 預設群組的設備數量與攝影機／平板列表的總數一致
      const allCams = all.find((r) => r.startsWith('All Cameras')) ?? '';
      const allTabs = all.find((r) => r.startsWith('All Tablets')) ?? '';
      await page.goto('/#/videodevice/cameralist');
      await page.reload();
      await page.locator('.vxe-pager').waitFor();
      const camPager = (await page.locator('.vxe-pager').innerText()).replace(/\s+/g, ' ');
      const camTotal = Number(camPager.slice(camPager.indexOf('共')).replace(/[^0-9]/g, ''));
      expect(allCams.split(' ')[2]).toBe(String(camTotal));
      await page.goto('/#/videodevice/tabletslist');
      await page.reload();
      await page.locator('.vxe-pager').waitFor();
      const tabPager = (await page.locator('.vxe-pager').innerText()).replace(/\s+/g, ' ');
      const tabTotal = Number(tabPager.slice(tabPager.indexOf('共')).replace(/[^0-9]/g, ''));
      expect(allTabs.split(' ')[3]).toBe(String(tabTotal));
      // 搜尋：名稱關鍵字，結果每一列都含關鍵字
      await gotoDeviceGroups(page);
      await searchDeviceGroups(page, name);
      const rows = await dgRowTexts(page);
      expect(rows.length).toBeGreaterThan(0);
      for (const r of rows) expect(r.toLowerCase()).toContain(name.toLowerCase());
      // 重新載入後搜尋不存在的關鍵字：無結果
      await gotoDeviceGroups(page);
      await searchDeviceGroups(page, `e2e-no-such-${Date.now()}`);
      expect(await dgRowTexts(page)).toEqual([]);
    },
  );

  test(
    '[DGRP-006] 影像設備群組刪除：單一/全選刪除且確實移除群組綁定',
    {
      annotation: [
        ...csvAnnotations({
          row: 91,
          no: '',
          category: '（延續）> 影像設備群組(刪除)',
          steps: '選取方框後，可單一、全選來進行設備刪除',
          expected: '1.刪除功能正常且確實移除群組綁定',
        }),
        { type: '安全措施', description: '全選前先搜尋 e2e- 限縮清單，並確認被勾選的列全是 e2e- 開頭才按刪除，避免刪到預設或既有群組' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(300000);
      const cam = trackC(uniqueCameraName('db'));
      await createCameraViaUI(page, cam);
      const names = ['d1', 'd2', 'd3'].map((t) => trackG(uniqueDeviceGroupName(t)));
      await createDeviceGroupViaUI(page, { name: names[0], devices: [cam] });
      await createDeviceGroupViaUI(page, { name: names[1] });
      await createDeviceGroupViaUI(page, { name: names[2] });
      // 單一刪除（勾選方框 + 上方刪除）：刪除含有該攝影機的群組 d1
      await gotoDeviceGroups(page);
      await searchDeviceGroups(page, DG_PREFIX);
      await dgRow(page, names[0]).first().locator('.vxe-cell--checkbox').click();
      await page.locator('button.btn-danger').first().click();
      await page.locator('.el-message-box__btns .el-button--primary').click();
      await expect(dgRow(page, names[0])).toHaveCount(0, { timeout: 20000 });
      await expect(dgRow(page, names[1])).toHaveCount(1);
      // 確實移除群組綁定：攝影機的編輯頁，設備群組不再含 d1
      await page.goto('/#/videodevice/cameralist');
      await page.reload();
      await page.getByPlaceholder('搜尋').first().fill(cam);
      await page.getByPlaceholder('搜尋').first().press('Enter');
      await page.waitForTimeout(1500);
      await bodyRows(page).filter({ hasText: cam }).first().getByRole('button', { name: '編輯' }).click();
      await page.locator('input[type=text]:visible').first().waitFor();
      await page.waitForTimeout(2500);
      await expect(page.locator('.multiselect__tag').filter({ hasText: names[0] })).toHaveCount(0);
      // 全選刪除：清單限縮為 e2e- 測試群組
      await gotoDeviceGroups(page);
      await searchDeviceGroups(page, DG_PREFIX);
      const shown = await dgRowTexts(page);
      expect(shown.length).toBeGreaterThanOrEqual(2);
      for (const r of shown) expect(r.startsWith(DG_PREFIX), `清單含非測試群組：${r}`).toBe(true);
      await page.locator('.vxe-table--header-wrapper .vxe-cell--checkbox').first().click();
      const checked = await page.locator('.vxe-table--body-wrapper tbody tr:has(.vxe-cell--checkbox.is--checked)').allInnerTexts();
      expect(checked.length).toBe(shown.length);
      for (const r of checked) expect(r.trim().startsWith(DG_PREFIX), `被勾選的列含非測試群組：${r}`).toBe(true);
      await page.locator('button.btn-danger').first().click();
      await page.locator('.el-message-box__btns .el-button--primary').click();
      await expect(dgRow(page, DG_PREFIX)).toHaveCount(0, { timeout: 20000 });
      await gotoDeviceGroups(page);
      const remain = await readAllRows(page, false);
      expect(remain.some((r) => r.startsWith('All Cameras'))).toBe(true);
      expect(remain.some((r) => r.startsWith('All Tablets'))).toBe(true);
    },
  );

  test(
    '[DGRP-007] 影像設備群組刪除：預設群組無法刪除',
    {
      annotation: [
        ...csvAnnotations({
          row: 91,
          no: '',
          category: '（延續）> 影像設備群組(刪除)',
          steps: '選取方框後，可單一、全選來進行設備刪除',
          expected: '2.預設群組無法刪除',
        }),
        { type: '安全措施', description: '絕不對預設群組按「確定」刪除：單列只讀取按鈕狀態；勾選預設群組後按上方刪除，只在確認視窗按「取消」' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(120000);
      await gotoDeviceGroups(page);
      // 單列：預設群組的「刪除」按鈕為停用（只讀狀態，不點擊）
      for (const n of ['All Cameras', 'All Tablets']) {
        await searchDeviceGroups(page, n);
        await expect(dgRow(page, n).first().getByRole('button', { name: '刪除' })).toBeDisabled();
      }
      // 勾選方框：預設群組的勾選框是否可被勾選（規格：預設群組無法刪除）
      await searchDeviceGroups(page, 'All Cameras');
      const box = dgRow(page, 'All Cameras').first().locator('.vxe-cell--checkbox');
      const disabledClass = ((await box.getAttribute('class')) ?? '').includes('is--disabled');
      if (!disabledClass) {
        // 勾選框可以勾，按上方刪除會出現確認視窗：只按取消，並記錄為觀察（預設群組可被選入刪除流程）
        await box.click();
        await page.locator('button.btn-danger').first().click();
        const dialogShown = (await page.locator('.el-message-box').count()) > 0;
        if (dialogShown) await page.locator('.el-message-box__btns .el-button').first().click(); // 取消
        test.info().annotations.push({
          type: '觀察',
          description: `預設群組的勾選框可被勾選，且按上方「刪除」${dialogShown ? '會出現確認視窗（已按取消，未刪除）' : '沒有出現確認視窗'}；是否真的會被刪除未驗證（避免刪除系統預設群組）`,
        });
        await box.click(); // 取消勾選
      }
      await expect(dgRow(page, 'All Cameras')).toHaveCount(1);
      // 規格是「預設群組無法刪除」；勾選框是否停用不是規格內容，故不以它判定。多選刪除路徑因安全考量未按「確定」，結果為部分完成（見 Results）
    },
  );

});
