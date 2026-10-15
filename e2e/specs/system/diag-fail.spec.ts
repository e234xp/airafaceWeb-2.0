import { test, expect, Page } from '@playwright/test';
import { csvAnnotations } from '../../helpers/csvSource';
import { createCameraViaUI, deleteCameraViaUI, uniqueCameraName } from '../../helpers/cameras';

// 來源 E2E-TEST-PLAN.md：DIAG-013（系統運作失敗的情況，每一個節點的錯誤情境都有明確的錯誤文案，參照 Log Document）。
// Log Document 在外部連結取不到；改以實際製造失敗：建立一台連不到的測試攝影機（192.0.2.10，文件保留網段、不會連到任何真實設備），
// 對它跑 5 分鐘診斷，檢查診斷區的每一筆紀錄是否都有明確的錯誤說明（哪一個節點、什麼原因），並輸出整份清單供對照。
// 診斷會重啟 mediaConnector（使用者 2026-10-14 同意）。測試攝影機以 e2e- 開頭，結束後（含失敗）一律刪除。
const sel = (page: Page) => page.locator('select');
const diagnoseBtn = (page: Page) => page.locator('button').filter({ hasText: /^\s*診斷\s*$/ }).first();
const logItems = (page: Page) => page.locator('.diagnostic-logs .log-item');
const name = uniqueCameraName('dg13');

test.afterEach(async ({ browser }) => {
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true, baseURL: process.env.E2E_BASE_URL, storageState: 'e2e/.auth/admin.json' });
  try {
    const p = await ctx.newPage();
    await deleteCameraViaUI(p, name).catch(() => undefined);
  } finally {
    await ctx.close();
  }
});

test(
  '[DIAG-013] 診斷區：系統運作失敗時，每個節點的錯誤情境都有明確的錯誤文案',
  {
    annotation: [
      ...csvAnnotations({ row: 198, no: '', category: '（延續）> （空白）', steps: '系統運作失敗的情況', expected: '每一個節點的錯誤情境都有明確的錯誤文案，請參照 Log Document 的文件' }),
      { type: '判定範圍', description: 'Log Document 取不到；以連不到的測試攝影機製造失敗，檢查診斷紀錄是否有明確指出失敗的節點與原因；整份清單輸出供對照文件' },
    ],
  },
  async ({ page }) => {
    test.setTimeout(600000);
    await createCameraViaUI(page, name);
    await page.goto('/#/systemsettings/diagnose');
    await page.reload();
    await expect(sel(page)).toBeVisible();
    await page.waitForTimeout(3000);
    const opt = sel(page).locator('option', { hasText: name }).first();
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
    items.forEach((t, i) => console.log('OBS', String(i + 1).padStart(2, '0'), t.replace(/rtsp:\/\/[^@\s]*@/g, 'rtsp://***@').slice(0, 240)));
    test.info().annotations.push({ type: '觀察', description: `診斷區 ${items.length} 筆：${items.map((t, i) => `${i + 1}. ${t.replace(/rtsp:\/\/[^@\s]*@/g, 'rtsp://***@').slice(0, 160)}`).join(' ／ ')}` });
    expect(items.length, '診斷區沒有紀錄').toBeGreaterThan(1);
    const failed = items.filter((t) => /error|fail|timeout|refused|unreachable|失敗|逾時|無法|不通/i.test(t));
    expect(failed.length, `連不到的攝影機，診斷紀錄卻沒有任何失敗說明：${items.join(' ／ ')}`).toBeGreaterThan(0);
    for (const t of failed) expect(t.length, `錯誤說明太短：${t}`).toBeGreaterThan(30);
  },
);
