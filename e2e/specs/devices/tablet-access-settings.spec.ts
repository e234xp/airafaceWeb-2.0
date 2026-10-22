import { test, expect, Page } from '../../helpers/test';
import { csvAnnotations } from '../../helpers/csvSource';
import { execFileSync } from 'node:child_process';
import { cleanupTablets, createTabletViaUI, gotoTablets, nextBtn, searchTablets, tabletRow, uniqueTabletName } from '../../helpers/tablets';

// 來源 E2E-TEST-PLAN.md：TAB-014（雙因子）、TAB-016（卡片規格）、TAB-015（解除綁定）。
// 只驗證前端設定：欄位可設定、儲存後重新開啟保留；平板端的實際行為（報到、刷卡）需要實體平板，未驗證。
// 測試平板 e2e- 開頭，結束後清理；不碰既有平板（Tablet-21）。
const created: string[] = [];
test.afterEach(async ({ browser }) => {
  await cleanupTablets(browser, created.splice(0));
});
const obs = (s: string) => {
  console.log('OBS', s);
  test.info().annotations.push({ type: '觀察', description: s });
};

async function openEdit(page: Page, name: string) {
  await gotoTablets(page);
  await searchTablets(page, name);
  await tabletRow(page, name).first().getByRole('button', { name: '編輯' }).click();
  await expect(page).toHaveURL(/modifytablets/);
  await page.locator('input[type=text]:visible').first().waitFor();
  await page.waitForTimeout(2000);
}
/** 編輯頁第 2 步（門禁設定）的下拉選單：0 卡片規格、1 雙因子認證、2 觸發繼電器。 */
async function gotoAccessStep(page: Page) {
  await nextBtn(page).click();
  await page.getByText('卡片驗證設定').first().waitFor();
  await page.waitForTimeout(1500);
}
const sel = (page: Page, i: number) => page.locator('select:visible').nth(i);
const selLabel = async (page: Page, i: number) => (await sel(page, i).locator('option:checked').innerText()).trim();
async function save(page: Page) {
  await nextBtn(page).click();
  await page.getByRole('button', { name: '完成' }).click();
  await page.waitForTimeout(1500);
}

test.describe('TAB 門禁設定', () => {
  test(
    '[TAB-014] 平板設定：可套用雙因子驗證',
    {
      annotation: [
        ...csvAnnotations({ row: 86, no: '', category: '（延續）> 平板設定', steps: '可套用雙因子驗證', expected: '1.平板報到功能確認' }),
        { type: '判定範圍', description: '只驗證前端「雙因子認證（需要人臉和卡片）」可設為「是」並儲存保留；平板報到功能需要實體平板，未驗證' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(290000);
      const name = uniqueTabletName('2f');
      created.push(name);
      await createTabletViaUI(page, name);
      await openEdit(page, name);
      await gotoAccessStep(page);
      obs(`雙因子預設：${await selLabel(page, 1)}`);
      await sel(page, 1).selectOption({ label: '是' });
      await save(page);
      await openEdit(page, name);
      await gotoAccessStep(page);
      expect(await selLabel(page, 1), '重新開啟後雙因子沒有保留為「是」').toBe('是');
    },
  );

  test(
    '[TAB-016] 平板設定：可變更卡的格式，使用正確卡的格式可成功',
    {
      annotation: [
        ...csvAnnotations({ row: 87, no: '', category: '（延續）> （空白）', steps: '可刷卡變更卡的格式', expected: '使用正確卡的格式可成功' }),
        { type: '判定範圍', description: '只驗證前端「卡片規格」可改為不同格式（26／34／64-bit）並儲存保留；刷卡成功與否需要實體平板與卡片，未驗證' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(290000);
      const name = uniqueTabletName('cf');
      created.push(name);
      await createTabletViaUI(page, name);
      await openEdit(page, name);
      await gotoAccessStep(page);
      const opts = await sel(page, 0).locator('option').allInnerTexts();
      const cur = await selLabel(page, 0);
      obs(`卡片規格選項：${opts.map((o) => o.trim()).join('、')}；目前：${cur}`);
      const pick = opts.map((o) => o.trim()).find((o) => /bit/.test(o) && o !== cur) as string;
      expect(pick, '沒有可切換的卡片規格').toBeTruthy();
      await sel(page, 0).selectOption({ label: pick });
      await save(page);
      await openEdit(page, name);
      await gotoAccessStep(page);
      expect(await selLabel(page, 0), '重新開啟後卡片規格沒有保留').toBe(pick);
    },
  );

});
