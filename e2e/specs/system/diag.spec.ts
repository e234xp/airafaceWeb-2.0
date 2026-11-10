import { expect, test } from '../../helpers/test';
import { shot } from '../../helpers/evidence';

// 設備診斷頁（#/systemsettings/diagnose）的 Diagnose 按鈕狀態。
// 範圍：只驗「不會真的觸發診斷」的兩條（DIAG-005、DIAG-006）。
// 診斷按下去會清空測試機的 syslog 並重啟 mediaConnector，屬於 e2e/README「高風險：系統重設與服務重啟」，
// 所以 DIAG-007（診斷中按鈕 disable）、DIAG-008（服務重啟）、DIAG-009（結束後恢復 enable）不寫腳本，由人工驗證。
// 這個檔案的測項只會「選擇設備」，不會按下「診斷」。

const diagnoseButton = (page: import('@playwright/test').Page) => page.getByRole('button', { name: '診斷', exact: true });
const deviceSelect = (page: import('@playwright/test').Page) => page.locator('select').first();

async function openDiagnosePage(page: import('@playwright/test').Page) {
  await page.goto('/#/systemsettings/diagnose');
  await page.reload();
  await diagnoseButton(page).waitFor();
  // 設備清單是頁面載入後才非同步取回的：等到下拉選單出現至少一個有值的選項（空白選項不算）
  await expect
    .poll(async () => deviceSelect(page).locator('option').evaluateAll((options) => (options as HTMLOptionElement[]).filter((option) => option.value !== '').length), {
      timeout: 20000,
      message: '診斷頁沒有任何設備可選',
    })
    .toBeGreaterThan(0);
}

test.describe('DIAG 設備診斷：Diagnose 按鈕', () => {
  test('[DIAG-005] Diagnose 按鈕：未選定設備時按鈕為 disable', async ({ page }) => {
    await openDiagnosePage(page);
    // 預設沒有選設備
    await expect(deviceSelect(page)).toHaveValue('');
    await expect(diagnoseButton(page)).toBeDisabled();
    await shot(page, 'DIAG-005', '01-未選設備診斷按鈕停用');
  });

  test('[DIAG-006] Diagnose 按鈕：選定設備尚未診斷時按鈕為 enable', async ({ page }) => {
    await openDiagnosePage(page);
    await expect(diagnoseButton(page)).toBeDisabled();
    // 選第一台有值的設備。下拉選單開頭有兩個「請選擇」的空白選項（占位文字加一個空選項），所以不能用固定的 index，
    // 要找第一個 value 不是空字串的選項。只選設備，不按「診斷」
    const firstDeviceValue = await deviceSelect(page).locator('option').evaluateAll((options) => (options as HTMLOptionElement[]).find((option) => option.value !== '')?.value ?? '');
    expect(firstDeviceValue, '診斷頁沒有任何設備可選').not.toBe('');
    await deviceSelect(page).selectOption({ value: firstDeviceValue });
    await expect(diagnoseButton(page)).toBeEnabled();
    await shot(page, 'DIAG-006', '01-選定設備後診斷按鈕啟用');
  });
});
