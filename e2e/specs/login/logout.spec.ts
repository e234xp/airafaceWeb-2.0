import { test, expect } from '@playwright/test';
import { csvAnnotations } from '../../helpers/csvSource';
import { adminCredentials, fillCredentials, loginForm, logout, openLoginPage } from '../../helpers/auth';

// 來源 E2E-TEST-PLAN.md；模組 LOGOUT，共 1 個 Test ID。
// 登出是要測的對象，因此本檔每個測項自行登入，不沿用共用登入狀態。

test.describe("LOGOUT", () => {
  test(
    "[LOGOUT-001] 登入後點擊右上角帳戶按下登出，成功登出並返回登入頁",
    {
      annotation: csvAnnotations({
        row: 14,
        no: '2.1',
        category: '登出 > 登出',
        steps: '登入系統點擊右上角帳戶按下登出',
        expected: '成功登出，返回登入頁面',
      }),
    },
    async ({ page }) => {
      const { username, password } = adminCredentials();
      await openLoginPage(page);
      await fillCredentials(page, username, password);
      await loginForm(page).loginButton.click();
      await expect(page).not.toHaveURL(/login/);
      // 點右上角帳戶 → 登出（logout helper 內已驗證回到 /login）
      await logout(page);
      await expect(page.locator('.login-container input[type="password"]')).toBeVisible();
    },
  );
});
