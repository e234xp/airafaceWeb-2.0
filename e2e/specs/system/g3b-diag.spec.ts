import { test, expect } from '@playwright/test';
import { csvAnnotations } from '../../helpers/csvSource';

// 來源 E2E-TEST-PLAN.md：DIAG-015（診斷頁顯示空間用量）。唯讀，不按「診斷」。
test(
  '[DIAG-015] 空間：點選 Diagnose 顯示剩餘空間（總空間、已使用空間、圖示依已使用百分比）',
  {
    annotation: [
      ...csvAnnotations({ row: 198, no: '', category: '（延續）> 空間', steps: '1.點選Diagnose\n2.顯示剩餘空間', expected: '取系統的總空間以及 已使用的空間\n圖示則依照已使用空間的百分比顯示' }),
      { type: '判定範圍', description: '診斷頁載入即顯示硬碟用量（不需按「診斷」）；以產品後端的空間狀態 API 對照畫面數字與進度條；顯示的是「已用 / 總量」，沒有獨立的「剩餘」數字' },
    ],
  },
  async ({ page }) => {
    test.setTimeout(150000);
    await page.goto('/#/systemsettings/diagnose');
    await page.reload();
    await page.locator('.storage-text').first().waitFor();
    await page.waitForTimeout(3000);
    const api = await page.evaluate(async () => {
      const el = Array.from(document.querySelectorAll('*')).find((e) => (e as unknown as { __vue__?: unknown }).__vue__) as unknown as { __vue__: { $root: { $globalGetSpaceStatus: () => Promise<{ data: { data: { disk: { Total: number; Used: number; Free: number } } } }> } } };
      const r = await el.__vue__.$root.$globalGetSpaceStatus();
      return r.data.data.disk;
    });
    const text = (await page.locator('.storage-text').first().innerText()).replace(/\s+/g, ' ');
    const m = /(\d+(?:\.\d+)?)GB \/ (\d+(?:\.\d+)?)GB/.exec(text);
    console.log('OBS', `畫面：${text}；API：Used ${api.Used}、Total ${api.Total}、Free ${api.Free}`);
    test.info().annotations.push({ type: '觀察', description: `畫面：${text}；API：Used ${api.Used}、Total ${api.Total}、Free ${api.Free}` });
    expect(m, '畫面沒有「已用GB / 總量GB」').toBeTruthy();
    expect(Math.abs(Number(m![1]) - api.Used), '畫面已用空間與 API 不符').toBeLessThanOrEqual(2);
    expect(Math.abs(Number(m![2]) - api.Total), '畫面總空間與 API 不符').toBeLessThanOrEqual(2);
    // 進度條：寬度（或 aria-valuenow）依已使用百分比
    const bar = page.locator('.storage-item').first().locator('.progress-bar');
    const now = Number((await bar.getAttribute('aria-valuenow')) ?? 'NaN');
    const widthPct = await bar.evaluate((e) => (e as HTMLElement).getBoundingClientRect().width / ((e.parentElement as HTMLElement).getBoundingClientRect().width || 1) * 100);
    const expectPct = (api.Used / api.Total) * 100;
    test.info().annotations.push({ type: '觀察', description: `進度條 aria-valuenow=${now}、實際寬度比例 ${widthPct.toFixed(1)}%；API 已用比例 ${expectPct.toFixed(1)}%` });
    expect(Math.abs(widthPct - expectPct), '進度條比例與已使用百分比不符').toBeLessThanOrEqual(3);
  },
);
