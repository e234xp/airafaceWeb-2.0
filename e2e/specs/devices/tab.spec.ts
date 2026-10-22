import { test, expect, Page } from '../../helpers/test';
import { csvAnnotations } from '../../helpers/csvSource';
import {
  cleanupTablets,
  createTabletViaUI,
  fillTabletBasics,
  gotoTablets,
  nextBtn,
  openAddTablet,
  searchTablets,
  tabletRow,
  tabletRowTexts,
  uniqueTabletName,
} from '../../helpers/tablets';
import { bodyRows, readAllRows } from '../../helpers/tables';
import { cleanupDeviceGroups, createDeviceGroupViaUI, gotoDeviceGroups, searchDeviceGroups, dgRow, uniqueDeviceGroupName } from '../../helpers/dgroups';

// 來源 E2E-TEST-PLAN.md；模組 TAB（CSV 第 82~85 列：【平板】頁面、#6.4 新增、#6.5 編輯／刪除）。
// 本檔實作「適合自動化（Y）」的 10 項中的 9 項（TAB-001、002、005、006、008、009、010、011、012）；TAB-013 需要其他模組資料，暫留 fixme。
// 注意：CSV 的「平板」頁面步驟寫的是「設備群組列表／新增影像設備群組」，但實際頁面列的是平板（設備名稱／狀態／IP）。
// 本檔以「頁面上實際的平板清單」套用 CSV 的清單、搜尋、新增、編輯、刪除邏輯，並在各項標註；是否為規格複製自攝影機的文字，請使用者確認。
// 測試平板以 e2e- 開頭（註冊 ID 同名，狀態為「停用」）；afterEach 以獨立 Admin 環境清理。既有平板（Tablet-21）不會被修改或刪除。

const created: string[] = [];
const track = (n: string) => {
  created.push(n);
  return n;
};

const deviceGroups: string[] = [];

test.afterEach(async ({ browser }) => {
  await cleanupDeviceGroups(browser, deviceGroups.splice(0));
  await cleanupTablets(browser, created.splice(0));
});

const SCOPE_NOTE = {
  type: '判定範圍',
  description: 'CSV 寫「設備群組」，但平板頁面實際列出的是平板（設備名稱、設備狀態、IP 位址）；本項以頁面上的平板清單判定，待使用者確認',
};

async function openEdit(page: Page, name: string) {
  await gotoTablets(page);
  await searchTablets(page, name);
  await tabletRow(page, name).first().getByRole('button', { name: '編輯' }).click();
  await expect(page).toHaveURL(/modifytablets/);
  await page.locator('input[type=text]:visible').first().waitFor();
  await page.waitForTimeout(2000);
}

/** 第 2 步（門禁設定）的人臉驗證欄位（依畫面順序）。 */
const verifyFields = (page: Page) => ({
  score: page.locator('input[type=text]:visible').nth(0),
  interval: page.locator('input[type=text]:visible').nth(1),
  overlap: page.locator('input[type=text]:visible').nth(2),
  minFace: page.locator('input[type=text]:visible').nth(3),
});

const pagerTotal = async (page: Page) => {
  const pager = (await page.locator('.vxe-pager').innerText()).replace(/\s+/g, ' ');
  return Number(pager.slice(pager.indexOf('共')).replace(/[^0-9]/g, ''));
};

async function pickFirstGroup(page: Page): Promise<string> {
  await page.locator('.multiselect').first().click();
  const opt = page.locator('.multiselect__option:visible').first();
  if ((await opt.count()) === 0) return '';
  const label = ((await opt.innerText()) ?? '').trim();
  if (label.includes('No elements') || label.includes('List is empty')) return '';
  await opt.click();
  await page.keyboard.press('Escape');
  return label;
}

test.describe('TAB', () => {
  test(
    '[TAB-001] 平板頁面：設備群組列表、頁數、筆數、顯示欄位',
    {
      annotation: [
        ...csvAnnotations({
          row: 82,
          no: '',
          category: '（延續）> 【平板】頁面',
          steps: '1.顯示目前的設備群組列表\n5.可透過點擊切換上下頁的清單，或點選欲顯示的頁數',
          expected: '2.正確顯示所有的清單、頁數、筆數、顯示欄位',
        }),
        SCOPE_NOTE,
      ],
    },
    async ({ page }) => {
      test.setTimeout(300000);
      await gotoTablets(page);
      const existing = await pagerTotal(page);
      const pageSize = Math.max(1, await bodyRows(page).count());
      // 平板數量不足以產生第 2 頁時，補建測試平板
      for (let i = 0; existing + i <= 5; i += 1) await createTabletViaUI(page, track(uniqueTabletName(`l${i}`)));
      await gotoTablets(page);
      const headers = (await page.locator('.vxe-table--header-wrapper th').allInnerTexts()).map((s) => s.trim());
      for (const h of ['設備名稱', '設備狀態', 'IP 位址']) expect(headers).toContain(h);
      await expect(page.locator('.vxe-table--header-wrapper .vxe-cell--checkbox').first()).toBeVisible();
      const firstRow = bodyRows(page).first();
      await expect(firstRow.getByRole('button', { name: '編輯' })).toBeVisible();
      await expect(firstRow.getByRole('button', { name: '刪除' })).toBeVisible();
      const total = await pagerTotal(page);
      expect(total).toBeGreaterThan(5);
      expect(await bodyRows(page).count()).toBe(Math.min(5, total));
      const p1 = await tabletRowTexts(page);
      await page.locator('.vxe-pager--num-btn').nth(1).click();
      await page.waitForTimeout(600);
      const p2 = await tabletRowTexts(page);
      expect(p2[0]).not.toBe(p1[0]);
      await page.locator('.vxe-pager--prev-btn').first().click();
      await page.waitForTimeout(600);
      expect(await tabletRowTexts(page)).toEqual(p1);
      expect((await readAllRows(page, false)).length).toBe(total);
      expect(pageSize).toBeGreaterThan(0);
    },
  );

  test(
    '[TAB-002] 平板頁面：搜尋文字功能',
    {
      annotation: [
        ...csvAnnotations({
          row: 82,
          no: '',
          category: '（延續）> 【平板】頁面',
          steps: '1.顯示目前的設備群組列表',
          expected: '3.搜尋文字功能正確',
        }),
        SCOPE_NOTE,
      ],
    },
    async ({ page }) => {
      test.setTimeout(180000);
      // 1) 只有既有平板（皆有 IP）時：依名稱、IP、不存在的關鍵字搜尋，結果只含符合者
      // 不寫死環境裡的特定平板：取清單中第一台既有（非 e2e-）平板的名稱與 IP 來搜尋
      await gotoTablets(page);
      const keep = (await readAllRows(page, false)).find((r) => !r.startsWith('e2e-'));
      expect(keep, '環境中沒有既有平板可供搜尋比對').toBeTruthy();
      const keepName = (keep as string).split(/\s+/)[0];
      const keepIp = /\d+\.\d+\.\d+\.\d+/.exec(keep as string)?.[0] ?? '';
      await searchTablets(page, keepName);
      const rows2 = await readAllRows(page, false);
      expect(rows2.length).toBeGreaterThan(0);
      for (const r of rows2) expect(r.toLowerCase()).toContain(keepName.toLowerCase());
      if (keepIp) {
        await searchTablets(page, keepIp);
        const rows3 = await readAllRows(page, false);
        expect(rows3.length).toBeGreaterThan(0);
        for (const r of rows3) expect(r).toContain(keepIp);
      }
      await searchTablets(page, `e2e-no-such-${Date.now()}`);
      expect(await tabletRowTexts(page)).toEqual([]);
      // 2) 邊界觀察（不影響判定）：清單中有「沒有 IP」的平板（新增後尚未連線）時，搜尋是否仍正常
      const name = track(uniqueTabletName('s'));
      await createTabletViaUI(page, name);
      await gotoTablets(page);
      await searchTablets(page, `e2e-no-such-${Date.now()}`);
      const edge = await tabletRowTexts(page);
      console.log('OBS', `清單含無 IP 平板時搜尋不存在的關鍵字：${edge.length === 0 ? '清單正確清空' : '清單沒有更新，仍顯示 ' + edge.join('、')}`);
      test.info().annotations.push({ type: '觀察', description: `清單含無 IP 的平板時搜尋不存在的關鍵字：${edge.length === 0 ? '清單正確清空' : '清單沒有更新（原始碼 ListForm.vue 的搜尋對 item.ip_address 直接呼叫 toLowerCase，沒有 IP 時會出錯）'}` });
    },
  );

  test(
    '[TAB-005] 平板頁面：新增影像設備群組',
    {
      annotation: [
        ...csvAnnotations({
          row: 82,
          no: '',
          category: '（延續）> 【平板】頁面',
          steps: '2.點選 新增 影像設備群組',
          expected: '〔使用者確認 2026-10-07：以步驟原文作為預期結果〕2.點選 新增 影像設備群組',
        }),
        { type: '判定範圍', description: '平板頁面的「新增」是新增平板，不是新增影像設備群組（群組在「設備群組」頁，見 DGRP）；本項以「按新增進入新增平板精靈並能建立成功」判定，待使用者確認' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(120000);
      const name = track(uniqueTabletName('a'));
      await openAddTablet(page);
      await expect(nextBtn(page)).toBeEnabled();
      await fillTabletBasics(page, name);
      await nextBtn(page).click();
      await nextBtn(page).click();
      await page.getByRole('button', { name: '完成' }).click();
      await gotoTablets(page);
      await searchTablets(page, name);
      await expect(tabletRow(page, name)).toHaveCount(1);
    },
  );

  test(
    '[TAB-006] 平板頁面：編輯群組與勾選刪除（單一/多項/全選）',
    {
      annotation: [
        ...csvAnnotations({
          row: 82,
          no: '',
          category: '（延續）> 【平板】頁面',
          steps: '3.點選 編輯可以針對 群組 進行編輯或刪除\n4.勾選 方格 並點選 刪除，可以刪除單一或多項，也可勾選 全選，並刪除所有影像設備群組',
          expected: '〔使用者確認 2026-10-07：以步驟原文作為預期結果〕同步驟',
        }),
        SCOPE_NOTE,
        { type: '安全措施', description: '勾選刪除前先搜尋 e2e- 限縮清單，並確認被勾選的列全是 e2e- 開頭；「全選」見 TAB-012' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(300000);
      await gotoTablets(page);
      const keepBefore = (await readAllRows(page, false)).filter((r) => !r.startsWith('e2e-')); // 既有平板，測完必須原封不動
      expect(keepBefore.length, '環境中沒有既有平板可供比對').toBeGreaterThan(0);
      const names = ['b1', 'b2', 'b3'].map((t) => track(uniqueTabletName(t)));
      for (const n of names) await createTabletViaUI(page, n);
      await openEdit(page, names[0]);
      await expect(page.locator('input[type=text]:visible').first()).toHaveValue(names[0]);
      await gotoTablets(page);
      await searchTablets(page, 'e2e-');
      await tabletRow(page, names[0]).first().locator('.vxe-cell--checkbox').click();
      await page.locator('button.btn-danger').first().click();
      await page.locator('.el-message-box__btns .el-button--primary').click();
      await expect(tabletRow(page, names[0])).toHaveCount(0, { timeout: 20000 });
      await expect(tabletRow(page, names[1])).toHaveCount(1);
      for (const n of names.slice(1)) await tabletRow(page, n).first().locator('.vxe-cell--checkbox').click();
      await page.locator('button.btn-danger').first().click();
      await page.locator('.el-message-box__btns .el-button--primary').click();
      // 只檢查自己建立的三台（不看整個 e2e- 清單，避免被其他測試或上次中斷的殘留影響）
      for (const n of names) await expect(tabletRow(page, n)).toHaveCount(0, { timeout: 20000 });
      await gotoTablets(page);
      const keepAfter = (await readAllRows(page, false)).filter((r) => !r.startsWith('e2e-'));
      expect(keepAfter, '既有平板在刪除測試平板後應原封不動').toEqual(keepBefore);
    },
  );

  test(
    '[TAB-009] 新增平板：可詳細設定臉部偵測的數值',
    {
      annotation: csvAnnotations({
        row: 83,
        no: '6.4',
        category: '（延續）> 平板(新增)',
        steps: '4. 可詳細設定臉部偵測的數值',
        expected: '新增功能正常且能建立成功',
      }),
    },
    async ({ page }) => {
      test.setTimeout(240000);
      const name = track(uniqueTabletName('t'));
      await openAddTablet(page);
      await fillTabletBasics(page, name);
      await nextBtn(page).click();
      await page.getByText('辨識分數閾值').first().waitFor();
      const f = verifyFields(page);
      await f.score.fill('0.8');
      await f.interval.fill('700');
      await f.overlap.fill('0.4');
      await f.minFace.fill('120');
      await nextBtn(page).click();
      await page.getByRole('button', { name: '完成' }).click();
      await openEdit(page, name);
      await nextBtn(page).click();
      await page.getByText('辨識分數閾值').first().waitFor();
      const g = verifyFields(page);
      await expect(g.score).toHaveValue('0.8');
      await expect(g.interval).toHaveValue('700');
      await expect(g.overlap).toHaveValue('0.4');
      await expect(g.minFace).toHaveValue('120');
    },
  );

  test(
    '[TAB-010] 新增平板：上方搜尋框快速尋找設備群組',
    {
      annotation: [
        ...csvAnnotations({
          row: 83,
          no: '6.4',
          category: '（延續）> 平板(新增)',
          steps: '6.點選並輸入上方搜尋框內容，可針對設備群組進行快速尋找',
          expected: '新增功能正常且能建立成功',
        }),
        { type: '判定範圍', description: '清單沒有群組欄位；以「把測試平板加入某設備群組後，以該群組名稱搜尋應找得到該平板」判定。若環境沒有設備群組則標記未驗證' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(240000);
      const name = track(uniqueTabletName('g'));
      await openAddTablet(page);
      await fillTabletBasics(page, name);
      const group = await pickFirstGroup(page);
      await nextBtn(page).click();
      await nextBtn(page).click();
      await page.getByRole('button', { name: '完成' }).click();
      // 以名稱搜尋一定找得到
      await gotoTablets(page);
      await searchTablets(page, name);
      await expect(tabletRow(page, name)).toHaveCount(1);
      if (!group) {
        test.info().annotations.push({ type: '未驗證', description: '環境沒有設備群組，無法驗證以群組名稱搜尋' });
        return;
      }
      // 產品的搜尋在已有關鍵字時再搜尋不會更新清單（見 TAB-002），因此每次搜尋前先重新載入
      await gotoTablets(page);
      await searchTablets(page, group);
      await expect(tabletRow(page, name), `以群組名稱「${group}」搜尋找不到屬於該群組的平板`).toHaveCount(1);
    },
  );

  test(
    '[TAB-011] 編輯平板：修改設備名稱、群組等，列表呈現更新後資料',
    {
      annotation: csvAnnotations({
        row: 84,
        no: '6.5',
        category: '（延續）> 平板(編輯)',
        steps: '1. 點選 編輯 可以進入影像設備資料編輯頁面\n2. 可以修改設備名稱、群組等資訊\n3. 在【影像設備】列表可以呈現更新後的人員資料',
        expected: '編輯功能正常且能更新成功',
      }),
    },
    async ({ page }) => {
      test.setTimeout(240000);
      const before = track(uniqueTabletName('e1'));
      const after = track(uniqueTabletName('e2'));
      await createTabletViaUI(page, before);
      await openEdit(page, before);
      await page.locator('input[type=text]:visible').first().fill(after);
      const group = await pickFirstGroup(page);
      await nextBtn(page).click();
      await nextBtn(page).click();
      await page.getByRole('button', { name: '完成' }).click();
      await gotoTablets(page);
      await searchTablets(page, after);
      await expect(tabletRow(page, after)).toHaveCount(1);
      // 舊名稱不再出現：不使用搜尋（搜尋的問題見 TAB-002），直接逐頁讀取清單
      await gotoTablets(page);
      const allRows = await readAllRows(page, false);
      expect(allRows.some((r) => r.startsWith(before))).toBe(false);
      expect(allRows.some((r) => r.startsWith(after))).toBe(true);
      if (!group) test.info().annotations.push({ type: '未驗證', description: '沒有可選的設備群組，群組修改未驗證' });
      else {
        await openEdit(page, after);
        await expect(page.locator('.multiselect__tag').filter({ hasText: group })).toHaveCount(1);
      }
    },
  );

  test(
    '[TAB-012] 刪除平板：勾選單一/多項/全選刪除，並可切換分頁',
    {
      annotation: [
        ...csvAnnotations({
          row: 85,
          no: '',
          category: '（延續）> 平板(刪除)',
          steps: '1.勾選 方格 並點選 刪除，可以刪除單一或多項，也可勾選 全選，並刪除所有影像設備\n2.可透過點擊切換上下頁的清單，或點選欲顯示的頁數',
          expected: '刪除功能正常',
        }),
        { type: '安全措施', description: '全選刪除只在搜尋 e2e- 限縮後進行，並確認被勾選的列全是 e2e- 開頭才按刪除' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(300000);
      await gotoTablets(page);
      const keepBefore = (await readAllRows(page, false)).filter((r) => !r.startsWith('e2e-')); // 既有平板，測完必須原封不動
      expect(keepBefore.length, '環境中沒有既有平板可供比對').toBeGreaterThan(0);
      const names = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6'].map((t) => track(uniqueTabletName(t)));
      for (const n of names) await createTabletViaUI(page, n);
      await gotoTablets(page);
      const total = await pagerTotal(page);
      expect(total).toBeGreaterThan(5);
      const p1 = await tabletRowTexts(page);
      await page.locator('.vxe-pager--num-btn').nth(1).click();
      await page.waitForTimeout(600);
      const p2 = await tabletRowTexts(page);
      expect(p2[0]).not.toBe(p1[0]);
      await page.locator('.vxe-pager--prev-btn').first().click();
      await page.waitForTimeout(600);
      expect(await tabletRowTexts(page)).toEqual(p1);
      await gotoTablets(page);
      await searchTablets(page, 'e2e-');
      for (const n of names.slice(0, 2)) await tabletRow(page, n).first().locator('.vxe-cell--checkbox').click();
      await page.locator('button.btn-danger').first().click();
      await page.locator('.el-message-box__btns .el-button--primary').click();
      await expect(tabletRow(page, names[0])).toHaveCount(0, { timeout: 20000 });
      await expect(tabletRow(page, names[1])).toHaveCount(0);
      await expect(tabletRow(page, names[2])).toHaveCount(1);
      await gotoTablets(page);
      await searchTablets(page, 'e2e-');
      const shown = await tabletRowTexts(page);
      expect(shown.length).toBeGreaterThanOrEqual(1);
      for (const r of shown) expect(r.startsWith('e2e-'), `清單含非測試平板：${r}`).toBe(true);
      await page.locator('.vxe-table--header-wrapper .vxe-cell--checkbox').first().click();
      const checked = await page.locator('.vxe-table--body-wrapper tbody tr:has(.vxe-cell--checkbox.is--checked)').allInnerTexts();
      expect(checked.length).toBe(shown.length);
      for (const r of checked) expect(r.trim().startsWith('e2e-'), `被勾選的列含非測試平板：${r}`).toBe(true);
      await page.locator('button.btn-danger').first().click();
      await page.locator('.el-message-box__btns .el-button--primary').click();
      await expect(tabletRow(page, 'e2e-')).toHaveCount(0, { timeout: 30000 });
      await gotoTablets(page);
      const keepAfter = (await readAllRows(page, false)).filter((r) => !r.startsWith('e2e-'));
      expect(keepAfter, '既有平板在刪除測試平板後應原封不動').toEqual(keepBefore);
    },
  );


  test(
    '[TAB-013] 刪除平板：刪除時檢查關聯設定（攝影機、平板、規則與考勤設定）',
    {
      annotation: [
        ...csvAnnotations({ row: 85, no: '', category: '（延續）> 平板(刪除)', steps: '3.刪除時，檢查關聯設定:攝影機、平板、規則與考勤設定', expected: '刪除功能正常' }),
        { type: '判定範圍', description: '只驗證「影像設備群組」這一項關聯：平板被刪除後，所屬群組的平板數量同步減少。規則（門禁規則）與考勤設定的關聯需要另外建立規則與考勤設定，本項未驗證（部分完成）' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(300000);
      const tablet = track(uniqueTabletName('r'));
      await createTabletViaUI(page, tablet);
      const group = uniqueDeviceGroupName('tr');
      deviceGroups.push(group);
      await createDeviceGroupViaUI(page, { name: group, devices: [tablet] });
      await gotoDeviceGroups(page);
      await searchDeviceGroups(page, group);
      expect(((await dgRow(page, group).first().locator('td:nth-child(4)').innerText()) ?? '').trim(), '建立群組後平板數量').toBe('1');
      // 刪除平板
      await gotoTablets(page);
      await searchTablets(page, tablet);
      await tabletRow(page, tablet).first().getByRole('button', { name: '刪除' }).click();
      await page.locator('.el-message-box__btns .el-button--primary').click();
      await expect(tabletRow(page, tablet)).toHaveCount(0, { timeout: 15000 });
      // 關聯：所屬群組的平板數量同步減少
      await gotoDeviceGroups(page);
      await searchDeviceGroups(page, group);
      expect(((await dgRow(page, group).first().locator('td:nth-child(4)').innerText()) ?? '').trim(), '刪除平板後群組的平板數量沒有同步減少').toBe('0');
    },
  );

  // ---- 以下維持 fixme ----
});
