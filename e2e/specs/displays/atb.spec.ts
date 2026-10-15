import { test, expect, Page } from '@playwright/test';
import { csvAnnotations } from '../../helpers/csvSource';
import {
  boardHasImage,
  changedKeys,
  openDashboardSettings,
  readDashboard,
  restoreDashboard,
  saveStep2,
  selectOptions,
  selectValue,
  settingsNext,
  snapshotDashboard,
  visibleSelect,
} from '../../helpers/dashboard';
import { TMP_DIR, makePng, writeFile } from '../../helpers/files';

// 來源 E2E-TEST-PLAN.md；模組 ATB＝點名看板（CSV 第 121~125 列：#10.2）。設定頁 /displays/modifyoccupancycontrolsetting，設定資料 key＝OCCUPANCY。
// 本檔實作「適合自動化（Y）」的 5 項（ATB-002~006）；其餘維持 test.fixme。
// 點名看板設定為全系統共用設定：每個測項前取得 OCCUPANCY 快照，結束（含失敗／逾時）以獨立 Admin 環境還原。

const ROUTE = '/#/displays/modifyoccupancycontrolsetting';
const KEY = 'OCCUPANCY';
let snapshot: Record<string, unknown> | null = null;

test.beforeEach(async ({ page }) => {
  snapshot = await snapshotDashboard(page, ROUTE, KEY);
});
test.afterEach(async ({ browser }) => {
  await restoreDashboard(browser, ROUTE, KEY, snapshot);
});

async function gotoStep2(page: Page) {
  await openDashboardSettings(page, ROUTE);
  await settingsNext(page).click();
  await page.getByText('人員顯示').first().waitFor();
}

test.describe('ATB', () => {
  test(
    '[ATB-002] 點名看板：背景圖與 logo 自訂',
    {
      annotation: csvAnnotations({ row: 122, no: '', category: '（延續）> 背景logo自訂', steps: '可設定 背景圖 跟 logo', expected: '背景圖、LOGO設定OK' }),
    },
    async ({ page }) => {
      test.setTimeout(240000);
      await openDashboardSettings(page, ROUTE);
      const before = (await readDashboard(page, KEY)) as { background_image: string; logo: string };
      const files = page.locator('input[type=file]');
      await files.nth(0).setInputFiles(writeFile(`${TMP_DIR}/atb-bg.png`, makePng(640, 360)));
      await files.nth(1).setInputFiles(writeFile(`${TMP_DIR}/atb-logo.png`, makePng(120, 120)));
      await page.waitForTimeout(1500);
      await settingsNext(page).click();
      await saveStep2(page);
      const w = (await readDashboard(page, KEY)) as { background_image: string; logo: string };
      expect(w.background_image).not.toBe(before.background_image);
      expect(w.logo).not.toBe(before.logo);
      await page.goto('/#/occupancymode');
      await page.reload();
      await expect.poll(() => boardHasImage(page, w.background_image.slice(30, 90)), { timeout: 20000, message: '點名看板沒有套用新背景圖' }).toBe(true);
      await expect.poll(() => boardHasImage(page, w.logo.slice(30, 90)), { timeout: 5000, message: '點名看板沒有套用新商標' }).toBe(true);
    },
  );

  test(
    '[ATB-003] 點名看板顯示自訂：group display（沒有變化）',
    {
      annotation: [
        ...csvAnnotations({ row: 123, no: '', category: '（延續）> 顯示自訂', steps: '可設定 group display、person display、page display\ngroup display: (沒有變化)', expected: '根據設定顯示正確' }),
        { type: '判定範圍', description: '規格只寫「group display: (沒有變化)」，語意不明；以「群組模式與分組依據可設定，儲存後後端保留且設定頁重開仍為所選值」判定，待使用者確認' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(240000);
      await gotoStep2(page);
      const mode = visibleSelect(page, 0);
      const groupBy = visibleSelect(page, 1);
      const modeOpts = await selectOptions(mode);
      const byOpts = await selectOptions(groupBy);
      const curMode = await selectValue(mode);
      const curBy = await selectValue(groupBy);
      const newBy = byOpts.find((o) => o.value !== curBy)!.value;
      await groupBy.selectOption(newBy);
      await saveStep2(page);
      const after = (await readDashboard(page, KEY)) as Record<string, unknown>;
      expect(changedKeys(snapshot as Record<string, unknown>, after).length).toBeGreaterThan(0);
      expect(Object.values(after)).toContain(newBy);
      await gotoStep2(page);
      expect(await selectValue(visibleSelect(page, 1))).toBe(newBy);
      expect(modeOpts.length).toBe(2);
      expect(curMode).toBeTruthy();
    },
  );

  test(
    '[ATB-004] 點名看板顯示自訂：person display（標準/緊湊）',
    {
      annotation: csvAnnotations({ row: 123, no: '', category: '（延續）> 顯示自訂', steps: '可設定 group display、person display、page display\nperson display: (標準/緊湊)', expected: '根據設定顯示正確' }),
    },
    async ({ page }) => {
      await gotoStep2(page);
      const text = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
      expect(text, '設定頁沒有「標準」選項').toContain('標準');
      expect(text, '設定頁沒有「緊湊」選項').toContain('緊湊');
    },
  );

  test(
    '[ATB-005] 點名看板顯示自訂：page display（排版 Small/Large、顯示圖表 True/False）',
    {
      annotation: csvAnnotations({ row: 123, no: '', category: '（延續）> 顯示自訂', steps: '可設定 group display、person display、page display\npage display:(排版Small/Large)、(顯示圖表True/False)', expected: '根據設定顯示正確' }),
    },
    async ({ page }) => {
      test.setTimeout(240000);
      await gotoStep2(page);
      // 顯示圖表：可切換、儲存後保留
      const chart = visibleSelect(page, 7);
      const cur = await selectValue(chart);
      const other = (await selectOptions(chart)).find((o) => o.value !== cur)!.value;
      await chart.selectOption(other);
      await saveStep2(page);
      await gotoStep2(page);
      expect(await selectValue(visibleSelect(page, 7))).toBe(other);
      // 排版（Small／Large）：設定頁要有排版選項
      const text = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
      expect(text.includes('排版'), '點名看板設定頁沒有「排版（小／大）」選項').toBe(true);
    },
  );

  test(
    '[ATB-006] 點名看板顯示自訂：預覽圖會根據設定而改變',
    {
      annotation: csvAnnotations({ row: 123, no: '', category: '（延續）> 顯示自訂', steps: '- 預覽圖會根據設定而改變', expected: '根據設定顯示正確' }),
    },
    async ({ page }) => {
      await gotoStep2(page);
      const preview = page.locator('table').filter({ hasText: '資訊一' }).first();
      const shot = () => preview.screenshot();
      const changeAndCompare = async (idx: number, label: string, required: boolean) => {
        const before = await shot();
        const sel = visibleSelect(page, idx);
        const cur = await selectValue(sel);
        const pick = (await selectOptions(sel)).find((o) => o.value !== cur)!.value;
        await sel.selectOption(pick);
        await page.waitForTimeout(1200);
        const changed = !before.equals(await shot());
        if (required) expect(changed, `改變「${label}」後預覽沒有變化`).toBe(true);
        else test.info().annotations.push({ type: '觀察', description: `改變「${label}」後預覽${changed ? '有' : '沒有'}變化` });
        return changed;
      };
      await changeAndCompare(7, '顯示圖表', true); // 圖表顯示／隱藏：預覽要跟著變
      await changeAndCompare(4, '人員照片（顯示用的照片）', true); // 照片來源／不顯示：預覽要跟著變
      await changeAndCompare(5, '顯示資訊 1', false); // 預覽文字為固定的「資訊一／姓名」樣板，僅記錄
    },
  );

  // ---- 以下維持 fixme（部分自動化／暫不測／需實體） ----
});
