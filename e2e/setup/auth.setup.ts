import { test as setup, expect } from '@playwright/test';
import { adminCredentials, fillCredentials, loginForm, openLoginPage } from '../helpers/auth';

// 登入一次，儲存 Admin 登入狀態（cookie / localStorage）供其他模組共用。
// 檔案含 token，已列入 .gitignore（e2e/.auth/）。
setup('Admin 登入並儲存登入狀態', async ({ page }) => {
  const { username, password } = adminCredentials();
  await openLoginPage(page);
  // 固定介面語言為繁體中文（CSV 為中文），避免各測項語言不一致。
  await loginForm(page).language.selectOption('zh');
  await loginForm(page).mode.selectOption('Setting');
  await fillCredentials(page, username, password);
  await loginForm(page).loginButton.click();
  await expect(page).not.toHaveURL(/login/);
  await page.locator('.c-sidebar').first().waitFor({ state: 'attached' });
  await page.context().storageState({ path: 'e2e/.auth/admin.json' });
});
