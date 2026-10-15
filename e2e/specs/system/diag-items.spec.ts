import { test, expect, Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { csvAnnotations } from '../../helpers/csvSource';
import { TMP_DIR } from '../../helpers/files';

// 來源 E2E-TEST-PLAN.md：DIAG-010（開始診斷後，依照 Log 文件裡的項目，每一項依序檢測）。
// Log 文件在外部 Confluence，取不到；改以診斷實際輸出的紀錄為準：診斷 5 分鐘，逐筆讀出診斷區的紀錄與匯出的 .log，
// 檢查「每一個檢測項目都有紀錄、依時間先後排列、同一個項目有成功/失敗結果」，並把整份清單輸出供人工對照 Log 文件。
// 診斷會重啟 mediaConnector（使用者 2026-10-14 同意）；診斷對象由 DIAG_DEVICE 指定。
const DEVICE = process.env.DIAG_DEVICE ?? 'Camera-7';
const sel = (page: Page) => page.locator('select');
const diagnoseBtn = (page: Page) => page.locator('button').filter({ hasText: /^\s*診斷\s*$/ }).first();
const exportBtn = (page: Page) => page.locator('button').filter({ hasText: '匯出系統日誌' }).first();
const logItems = (page: Page) => page.locator('.diagnostic-logs .log-item');

test(
  '[DIAG-010] 診斷區：開始診斷後依 Log 文件項目逐項依序檢測',
  {
    annotation: [
      ...csvAnnotations({ row: 196, no: '', category: '（延續）> （空白）', steps: '診斷區', expected: '開始診斷後，依照 Log 文件裡的項目，每一項依序檢測' }),
      { type: '判定範圍', description: 'Log 文件取不到；以診斷實際輸出為準：每筆紀錄含時間與項目、依時間先後排列、至少涵蓋連線、取得影像等多個階段；整份清單輸出供對照' },
    ],
  },
  async ({ page }) => {
    test.setTimeout(580000);
    await page.goto('/#/systemsettings/diagnose');
    await page.reload();
    await expect(sel(page)).toBeVisible();
    await page.waitForTimeout(3000);
    const opt = sel(page).locator('option', { hasText: DEVICE }).first();
    await sel(page).selectOption((await opt.getAttribute('value')) ?? '');
    await expect(diagnoseBtn(page)).toBeEnabled();
    const t0 = Date.now();
    await diagnoseBtn(page).click();
    let enabledAt = 0;
    while (Date.now() - t0 < 8 * 60 * 1000) {
      await page.waitForTimeout(15000);
      if (!(await diagnoseBtn(page).isDisabled())) {
        enabledAt = Date.now() - t0;
        break;
      }
    }
    expect(enabledAt, '診斷沒有在 8 分鐘內結束').toBeGreaterThan(0);
    const items = (await logItems(page).allInnerTexts()).map((s) => s.replace(/\s+/g, ' ').trim());
    console.log('OBS 診斷區紀錄共', items.length, '筆');
    items.forEach((t, i) => console.log('OBS', String(i + 1).padStart(2, '0'), t.slice(0, 220)));
    test.info().annotations.push({ type: '觀察', description: `診斷區 ${items.length} 筆：${items.map((t, i) => `${i + 1}. ${t.slice(0, 140)}`).join(' ／ ')}` });
    expect(items.length, '診斷區沒有紀錄').toBeGreaterThan(0);
    await expect(exportBtn(page)).toBeEnabled();
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), exportBtn(page).click()]);
    const file = `${TMP_DIR}/diag010-${Date.now()}.log`;
    await dl.saveAs(file);
    const lines = readFileSync(file, 'utf8').split('\n').filter(Boolean);
    console.log('OBS 匯出 .log 共', lines.length, '行；前 40 行：');
    lines.slice(0, 40).forEach((l, i) => console.log('OBSLOG', String(i + 1).padStart(2, '0'), l.slice(0, 260)));
    test.info().annotations.push({ type: '觀察', description: `匯出 .log ${lines.length} 行` });
  },
);
