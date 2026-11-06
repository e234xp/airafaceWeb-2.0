import fs from 'fs';
import path from 'path';
import { test as setup, expect } from '../helpers/test';
import { adminCredentials, fillCredentials, loginForm, openLoginPage } from '../helpers/auth';
import { ADMIN_STORAGE_PATH } from '../helpers/accounts';

// 登入一次，儲存 Admin 登入狀態（cookie / localStorage）供其他模組共用。
// 檔案含 token，已列入 .gitignore（e2e/.auth/）。
setup('Admin 登入並儲存登入狀態', async ({ page }) => {
  const { username, password } = adminCredentials();
  await openLoginPage(page);
  // 固定介面語言為繁體中文（規格為中文），避免各測項語言不一致。
  await loginForm(page).language.selectOption('zh');
  await loginForm(page).mode.selectOption('Setting');
  await fillCredentials(page, username, password);
  await loginForm(page).loginButton.click();
  await expect(page).not.toHaveURL(/login/, { timeout: 90000 }); // 開發伺服器冷啟動或兩批同時跑時登入可能要數十秒
  await page.locator('.c-sidebar').first().waitFor({ state: 'attached', timeout: 90000 });
  // 先寫暫存檔再改名：整批跑到一半會重新登入並覆蓋此檔，避免別組剛好讀到寫到一半的內容
  const state = await page.context().storageState();
  fs.mkdirSync(path.dirname(ADMIN_STORAGE_PATH), { recursive: true });
  fs.writeFileSync(`${ADMIN_STORAGE_PATH}.tmp`, JSON.stringify(state));
  fs.renameSync(`${ADMIN_STORAGE_PATH}.tmp`, ADMIN_STORAGE_PATH);
});
