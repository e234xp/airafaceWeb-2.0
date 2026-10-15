import { Page, expect } from '@playwright/test';
import { requireEnv } from './env';

// 登入頁元件定位（與語系無關，使用結構而非文字）。
export const loginForm = (page: Page) => ({
  username: page.locator('.login-container input').first(),
  password: page.locator('.login-container input[type="password"]'),
  language: page.locator('.login-container select').nth(0),
  mode: page.locator('.login-container select').nth(1),
  rememberMe: page.locator('.login-container .c-switch').first(),
  loginButton: page.locator('.login-container button').last(),
});

export function adminCredentials() {
  return { username: requireEnv('E2E_ADMIN_USERNAME'), password: requireEnv('E2E_ADMIN_PASSWORD') };
}

export async function openLoginPage(page: Page) {
  await page.goto('/');
  await expect(page).toHaveURL(/login/);
  await expect(page.locator('.login-container input[type="password"]')).toBeVisible();
}

export async function fillCredentials(page: Page, username: string, password: string) {
  const f = loginForm(page);
  await f.username.fill(username);
  await f.password.fill(password);
}

export async function logout(page: Page) {
  await page.locator('.fa-user').first().click();
  await page.locator('.dropdown-item').first().click();
  await expect(page).toHaveURL(/login/);
}
