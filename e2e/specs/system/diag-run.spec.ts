import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { csvAnnotations } from '../../helpers/csvSource';
import { TMP_DIR } from '../../helpers/files';
import { readAllRows } from '../../helpers/tables';

// 來源 E2E-TEST-PLAN.md：DIAG-001、007、009、011、012、014。診斷頁 /#/systemsettings/diagnose。
// 診斷對象使用前置作業建立的 e2e-nx-in（我們自己的測試攝影機）；診斷約 5 分鐘，為規格要求的正常等待。
// 一次診斷同時驗證 007／009／011／012／014（各項結果以 expect.soft 與 OBS 輸出分別判定）。

const DEVICE = process.env.DIAG_DEVICE ?? 'e2e-nx-in';
const sel = (page: import('@playwright/test').Page) => page.locator('select');
const diagnoseBtn = (page: import('@playwright/test').Page) => page.locator('button').filter({ hasText: /^\s*診斷\s*$/ }).first();
const exportBtn = (page: import('@playwright/test').Page) => page.locator('button').filter({ hasText: '匯出系統日誌' }).first();
async function openDiagnose(page: import('@playwright/test').Page) {
  await page.goto('/#/systemsettings/diagnose');
  await page.reload();
  await expect(sel(page)).toBeVisible();
  await page.waitForTimeout(3000);
}
const logItems = (page: import('@playwright/test').Page) => page.locator('.diagnostic-logs .log-item');

test.describe('DIAG（診斷流程）', () => {
  test(
    '[DIAG-001] 設備診斷：選項為攝影機＆平板所有設備，先攝影機清單後平板清單',
    { annotation: csvAnnotations({ row: 194, no: '11.10', category: '診斷 > 設備診斷', steps: '選擇設備', expected: '1.選項為攝影機＆平板的所有設備，排列順序先攝影機清單，後平板清單' }) },
    async ({ page }) => {
      test.setTimeout(240000);
      // 先取得攝影機與平板清單的名稱（清單順序）
      await page.goto('/#/videodevice/cameralist');
      await page.reload();
      await page.waitForTimeout(3000);
      const cams = (await readAllRows(page, false)).map((r) => r.split(' ')[0]);
      await page.goto('/#/videodevice/tabletslist');
      await page.reload();
      await page.waitForTimeout(3000);
      const tabs = (await readAllRows(page, false)).map((r) => r.split(' ')[0]);
      await openDiagnose(page);
      const labels = (await sel(page).locator('option').evaluateAll((os) => os.map((o) => ({ v: (o as HTMLOptionElement).value, t: (o.textContent ?? '').trim() })))).filter((o) => o.v).map((o) => o.t);
      console.log('OBS', `選項 ${labels.length} 個；攝影機 ${cams.length}、平板 ${tabs.length}；前 3：${labels.slice(0, 3).join('、')}；最後：${labels.slice(-2).join('、')}`);
      expect(new Set(labels).size, '選項有重複').toBe(labels.length);
      for (const n of [...cams, ...tabs]) expect(labels.some((l) => l.includes(n)), `選項沒有設備「${n}」`).toBe(true);
      expect(labels.length, '選項數量不等於攝影機＋平板').toBe(cams.length + tabs.length);
      const lastCam = Math.max(...cams.map((n) => labels.findIndex((l) => l.includes(n))));
      const firstTab = Math.min(...tabs.map((n) => labels.findIndex((l) => l.includes(n))));
      expect(lastCam, '平板出現在攝影機之前').toBeLessThan(firstTab);
    },
  );

  test(
    '[DIAG-007][DIAG-009][DIAG-011][DIAG-012][DIAG-014] 診斷整段流程（按鈕狀態、5 分鐘紀錄、完成紀錄、匯出 .log）',
    {
      annotation: [
        ...csvAnnotations({ row: 195, no: '', category: '（延續）> （空白）', steps: 'Diagnose 按鈕', expected: '點擊按鈕後，系統開始診斷，按鈕觸發為 disable；診斷結束後，按鈕恢復為 enable' }),
        ...csvAnnotations({ row: 196, no: '', category: '（延續）> （空白）', steps: '診斷區', expected: '五分鐘內持續顯示診斷紀錄；五分鐘一到，最後一筆紀錄一律顯示診斷完成' }),
        ...csvAnnotations({ row: 197, no: '', category: '（延續）> 診斷匯出', steps: 'Export sysLog 按鈕', expected: '點擊後把這五分鐘內的完整 sysLog 匯出，下載後是 .log 檔' }),
      ],
    },
    async ({ page }) => {
      test.setTimeout(560000);
      await openDiagnose(page);
      const opt = sel(page).locator('option', { hasText: DEVICE }).first();
      await sel(page).selectOption((await opt.getAttribute('value')) ?? '');
      await expect(diagnoseBtn(page)).toBeEnabled();
      await expect(exportBtn(page), '診斷前匯出按鈕應為停用').toBeDisabled();
      const t0 = Date.now();
      await diagnoseBtn(page).click();
      // DIAG-007：點擊後按鈕變 disable
      await page.waitForTimeout(1500);
      const disabledNow = await diagnoseBtn(page).isDisabled();
      console.log('OBS', 'DIAG-007 點擊後 Diagnose 按鈕停用：', disabledNow);
      expect.soft(disabledNow, 'DIAG-007：點擊 Diagnose 後按鈕沒有變 disable').toBe(true);
      // DIAG-011：診斷期間每分鐘都有紀錄持續出現
      const perMinute: number[] = [];
      let lastCount = 0;
      let enabledAt = 0;
      while (Date.now() - t0 < 8 * 60 * 1000) {
        await page.waitForTimeout(15000);
        const count = await logItems(page).count();
        const minute = Math.floor((Date.now() - t0) / 60000);
        if (count > lastCount) perMinute[minute] = (perMinute[minute] ?? 0) + (count - lastCount);
        lastCount = count;
        if (!(await diagnoseBtn(page).isDisabled())) {
          enabledAt = Date.now() - t0;
          break;
        }
      }
      console.log('OBS', `DIAG-009 診斷結束（按鈕恢復）時間：${enabledAt ? Math.round(enabledAt / 1000) + ' 秒' : '8 分鐘內未恢復'}；各分鐘新增紀錄數：${JSON.stringify(perMinute)}；紀錄總數 ${lastCount}`);
      expect.soft(enabledAt, 'DIAG-009：診斷結束後 Diagnose 按鈕沒有恢復 enable').toBeGreaterThan(0);
      expect.soft(enabledAt / 1000, '診斷時長應約 5 分鐘').toBeGreaterThan(240);
      for (let m = 0; m < 5; m += 1) expect.soft(perMinute[m] ?? 0, `DIAG-011：診斷第 ${m + 1} 分鐘沒有新的診斷紀錄`).toBeGreaterThan(0);
      // DIAG-012：最後一筆紀錄顯示診斷完成
      const lastText = ((await logItems(page).last().innerText()) ?? '').replace(/\s+/g, ' ');
      const firstText = ((await logItems(page).first().innerText()) ?? '').replace(/\s+/g, ' ');
      console.log('OBS', `DIAG-012 最後一筆紀錄：${lastText.slice(0, 160)}｜第一筆：${firstText.slice(0, 120)}`);
      expect.soft(lastText, 'DIAG-012：最後一筆紀錄沒有顯示診斷完成').toMatch(/診斷完成|診斷已完成|complete/i);
      // DIAG-014：匯出 .log
      await expect(exportBtn(page), '診斷完成後匯出按鈕應啟用').toBeEnabled();
      const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), exportBtn(page).click()]);
      const file = `${TMP_DIR}/diag-${Date.now()}.log`;
      await dl.saveAs(file);
      const content = readFileSync(file, 'utf8');
      console.log('OBS', `DIAG-014 檔名 ${dl.suggestedFilename()}、大小 ${content.length} 字元、${content.split('\n').length} 行`);
      expect.soft(dl.suggestedFilename(), 'DIAG-014：下載檔案不是 .log').toMatch(/\.log$/);
      expect.soft(content.length, 'DIAG-014：匯出的 .log 檔是空的').toBeGreaterThan(0);
    },
  );
});
