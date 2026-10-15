import { test, expect, Page } from '@playwright/test';
import { csvAnnotations } from '../../helpers/csvSource';
import { shot } from '../../helpers/evidence';
import { TEST_PASSWORD, ADMIN_STORAGE_PATH, cleanupAccounts, createAccountViaUI, expectLoginFails, expectLoginSucceeds, freshContext, loginAs, uniqueAccountName } from '../../helpers/accounts';
import { requireEnv } from '../../helpers/env';
import { adminCredentials, fillCredentials, loginForm, logout, openLoginPage } from '../../helpers/auth';

// 來源 E2E-TEST-PLAN.md；模組 LOGIN，共 24 個 Test ID。
// 實作時不得改動 Test ID 與標題前綴；assertion 只能依 Plan / CSV 的預期結果。
// 注意：fixme 不等於「使用者同意跳過」，Results 狀態需依 E2E-TEST-RULE.md §5 另行判定。

const LOGIN_CATEGORY = '登入畫面 > 登入';
const LANG_STEPS =
  '1.選擇語系依序為:English、日本語、繁體中文、แบบไทย 、Español、Tiếng Việt、Bahasa Indonesia、土耳其語、Français、韓文\n2.登入頁面';
const LANG_EXPECTED =
  '1.根據選擇的語系改變登入頁面語系\n2.進入系統語系顯示正確\n3.除特定名詞外，不應出現其他語系文字\n4.不應出現跑版\n5.專有名詞及縮寫應大寫，如 HTTP，PTZ';
const MODE_STEPS = '根據選擇的模式登入系統:系統設定模式、迎賓看板、點名看板、容留看板、保全模式、自助報到';

const cardText = (page: Page) => page.locator('.login-container').innerText();
const sidebarText = (page: Page) => page.locator('.c-sidebar').first().textContent();

async function login(page: Page, username: string, password: string) {
  await fillCredentials(page, username, password);
  await loginForm(page).loginButton.click();
}

test.describe("LOGIN", () => {
  test(
    "[LOGIN-001] IP 輸入開啟 airaFace 登入畫面",
    {
      annotation: csvAnnotations({
        row: 4,
        no: '1.1',
        category: '登入畫面 > IP輸入',
        steps: '開啟Chrome， 輸入airaFace2.1的IP address：192.168.10.XXX',
        expected: '根據IP可開啟進入airaFace2登入畫面',
      }),
    },
    async ({ page }) => {
      // 步驟：以 .env.e2e.local 的 E2E_BASE_URL（airaFace IP）開啟網頁
      await page.goto('/');
      // 預期：進入登入畫面（Plan 僅要求「進入登入畫面」，不增加其他驗收條件）
      await expect(page).toHaveURL(/login/);
      await expect(page.locator('input[type="password"]')).toBeVisible();
    },
  );

  test(
    "[LOGIN-002] 最高權限管理者以正確帳密登入系統設定模式",
    {
      annotation: csvAnnotations({
        row: 5,
        no: '1.2',
        category: '登入畫面 > 使用者名稱/密碼',
        steps: '1. 使用最高權限管理者登入系統設定模式，預設帳號為Admin / 密碼為〔已遮蔽〕',
        expected: '輸入正確的的帳號密碼，可成功登入系統',
      }),
    },
    async ({ page }) => {
      const { username, password } = adminCredentials();
      await openLoginPage(page);
      await loginForm(page).mode.selectOption('Setting');
      await login(page, username, password);
      // 預期：成功登入系統（離開登入頁、進入系統頁面）
      await expect(page).not.toHaveURL(/login/);
      await expect(page.locator('.c-sidebar').first()).toBeAttached();
    },
  );

  test(
    "[LOGIN-003] 開啟記住帳號密碼後登出，登入頁顯示上一次登入的帳密",
    {
      annotation: csvAnnotations({
        row: 6,
        no: '',
        category: '登入畫面 > 使用者名稱/密碼（延續 1.2）',
        steps: '2. 打開記住帳號密碼，登入後按Log out 按鈕登出，回到登入頁面查看帳號密碼',
        expected: '登入頁面顯示上一次登入的帳號密碼',
      }),
    },
    async ({ page }) => {
      const { username, password } = adminCredentials();
      await openLoginPage(page);
      await loginForm(page).rememberMe.click();
      await login(page, username, password);
      await expect(page).not.toHaveURL(/login/);
      await logout(page);
      // 預期：帳號與密碼皆為上一次登入的值（以布林比較，避免失敗訊息輸出密碼）
      const f = loginForm(page);
      expect((await f.username.inputValue()) === username).toBe(true);
      expect((await f.password.inputValue()) === password).toBe(true);
    },
  );

  test(
    "[LOGIN-004] 輸入錯誤的使用者名稱，跳出錯誤提示",
    {
      annotation: csvAnnotations({
        row: 7,
        no: '',
        category: '登入畫面 > 使用者名稱/密碼（延續 1.2）',
        steps: '3.輸入錯誤的使用者名稱',
        expected: '跳出錯誤提示',
      }),
    },
    async ({ page }) => {
      const { password } = adminCredentials();
      await openLoginPage(page);
      await login(page, 'e2e-wrong-user', password);
      await expect(page.locator('.swal2-icon.swal2-error')).toBeVisible();
      await expect(page).toHaveURL(/login/);
    },
  );

  test(
    "[LOGIN-005] 輸入錯誤密碼，跳出錯誤提示",
    {
      annotation: csvAnnotations({
        row: 8,
        no: '',
        category: '登入畫面 > 使用者名稱/密碼（延續 1.2）',
        steps: '4.輸入錯誤密碼',
        expected: '跳出錯誤提示',
      }),
    },
    async ({ page }) => {
      const { username } = adminCredentials();
      await openLoginPage(page);
      await login(page, username, 'e2e-wrong-password');
      await expect(page.locator('.swal2-icon.swal2-error')).toBeVisible();
      await expect(page).toHaveURL(/login/);
    },
  );

  // ---- LOGIN-006 ~ 015 語言選擇（CSV 第 9 列）----
  // 只自動判定預期 1、2：登入頁／系統文字確實隨所選語系改變。
  // 預期 3（不應出現其他語系文字）、4（不應跑版）、5（專有名詞縮寫大寫）無法由腳本判定，Results 記為「部分完成」。
  const languages: Array<{ id: string; label: string; code: string; script?: RegExp }> = [
    { id: 'LOGIN-006', label: 'English', code: 'en' },
    { id: 'LOGIN-007', label: '日本語', code: 'ja', script: /[぀-ヿ]/ },
    { id: 'LOGIN-008', label: '繁體中文', code: 'zh', script: /[一-鿿]/ },
    { id: 'LOGIN-009', label: 'แบบไทย (泰文)', code: 'th', script: /[฀-๿]/ },
    { id: 'LOGIN-010', label: 'Español', code: 'es' },
    { id: 'LOGIN-011', label: 'Tiếng Việt', code: 'vi' },
    { id: 'LOGIN-012', label: 'Bahasa Indonesia', code: 'id' },
    { id: 'LOGIN-013', label: '土耳其語', code: 'tr' },
    { id: 'LOGIN-014', label: 'Français', code: 'fr' },
    { id: 'LOGIN-015', label: '韓文', code: 'ko', script: /[가-힯]/ },
  ];

  test.describe('語言選擇', () => {
    let enSidebar = '';

    test.beforeAll(async ({ browser }) => {
      // 取得英文介面的系統側邊欄文字作為「語系未改變」的對照基準
      const ctx = await browser.newContext({ ignoreHTTPSErrors: true, baseURL: process.env.E2E_BASE_URL });
      const page = await ctx.newPage();
      const { username, password } = adminCredentials();
      await openLoginPage(page);
      await loginForm(page).language.selectOption('en');
      await loginForm(page).mode.selectOption('Setting');
      await login(page, username, password);
      await expect(page).not.toHaveURL(/login/);
      await page.locator('.c-sidebar').first().waitFor({ state: 'attached' });
      enSidebar = (await sidebarText(page)) ?? '';
      await ctx.close();
    });

    for (const lang of languages) {
      test(
        `[${lang.id}] 語言選擇：${lang.label}`,
        {
          annotation: [
            ...csvAnnotations({
              row: 9,
              no: '',
              category: '登入畫面 > 語言選擇（延續 1.2）',
              steps: LANG_STEPS,
              expected: LANG_EXPECTED,
            }),
            { type: '判定範圍', description: '僅自動判定預期 1、2；預期 3、4、5 需視覺／人工判定（部分完成）' },
          ],
        },
        async ({ page }) => {
          const { username, password } = adminCredentials();
          await openLoginPage(page);
          const f = loginForm(page);

          // 對照基準：英文登入頁
          await f.language.selectOption('en');
          const enCard = await cardText(page);

          if (lang.code === 'en') {
            // 先切到其他語系再切回英文，確認可正確回復
            await f.language.selectOption('ja');
            expect(await cardText(page)).not.toBe(enCard);
            await f.language.selectOption('en');
          } else {
            await f.language.selectOption(lang.code);
            // 預期 1：登入頁語系改變
            expect(await cardText(page)).not.toBe(enCard);
            if (lang.script) expect(lang.script.test(await cardText(page))).toBe(true);
          }
          if (lang.code === 'en') expect(await cardText(page)).toBe(enCard);
          await shot(page, lang.id, '01-登入頁');

          // 預期 2：進入系統後語系顯示正確
          await f.mode.selectOption('Setting');
          await login(page, username, password);
          await expect(page).not.toHaveURL(/login/);
          await page.locator('.c-sidebar').first().waitFor({ state: 'attached' });
          const sb = (await sidebarText(page)) ?? '';
          await shot(page, lang.id, '02-系統內畫面');
          if (lang.code === 'en') {
            expect(sb).toBe(enSidebar);
          } else {
            expect(sb).not.toBe(enSidebar);
            if (lang.script) expect(lang.script.test(sb)).toBe(true);
          }
        },
      );
    }
  });

  // ---- LOGIN-016 ~ 021 系統模式選項（CSV 第 10 列）----
  const modes: Array<{ id: string; label: string; value: string; hash: RegExp }> = [
    { id: 'LOGIN-016', label: '系統設定模式', value: 'Setting', hash: /attendance\/persondailyattendancereport/i },
    { id: 'LOGIN-017', label: '迎賓看板', value: 'Welcome', hash: /welcomemode/i },
    { id: 'LOGIN-018', label: '點名看板', value: 'Occupancy', hash: /occupancymode/i },
    { id: 'LOGIN-019', label: '容留看板', value: 'Capacity', hash: /capacitymode/i },
    { id: 'LOGIN-020', label: '保全模式', value: 'Guard', hash: /guardmode/i },
    { id: 'LOGIN-021', label: '自助報到', value: 'SelfCheckin', hash: /selfcheckinmode/i },
  ];

  for (const m of modes) {
    test(
      `[${m.id}] 系統模式選項：${m.label}，登入後進入正確頁面`,
      {
        annotation: csvAnnotations({
          row: 10,
          no: '',
          category: '登入畫面 > 系統模式選項（延續 1.2）',
          steps: MODE_STEPS,
          expected: '根據選擇看板進入正確的看板頁面',
        }),
      },
      async ({ page }) => {
        const { username, password } = adminCredentials();
        await openLoginPage(page);
        await loginForm(page).mode.selectOption(m.value);
        await login(page, username, password);
        await expect(page).toHaveURL(m.hash);
      },
    );
  }

  test(
    "[LOGIN-022] 1920x1080 解析度下登入畫面無文字/操作項被截掉或跑版",
    {
      annotation: [
        ...csvAnnotations({
          row: 11,
          no: '',
          category: '登入畫面 > 登入畫面顯示（延續 1.2）',
          steps: '調整螢幕解析度為:1920x1080 ，查看登入畫面',
          expected: '登入畫面顯示OK，在 1920x1080 解析度下，需能正常顯示，沒有文字、操作項被截掉或跑版',
        }),
        { type: '判定範圍', description: '僅自動判定操作項在視窗內完整可見、無水平捲動；「跑版」需視覺判定（部分完成）' },
      ],
    },
    async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await openLoginPage(page);
      const f = loginForm(page);
      for (const loc of [f.username, f.password, f.language, f.mode, f.loginButton]) {
        await expect(loc).toBeInViewport({ ratio: 1 });
      }
      const noHScroll = await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      );
      expect(noHScroll).toBe(true);
      await shot(page, 'LOGIN-022', '01-1920x1080登入頁');
    },
  );

  // ---- LOGIN-023 / 024 忘記密碼（CSV 第 12 列）----
  // 以新建的測試帳號測試，不修改既有帳號。新密碼一律設為 Admin 目前的密碼：
  // 即使後端未依 username 判斷而誤重設到 Admin，Admin 密碼也不會被改變。
  const createdForgot: string[] = [];
  test.afterEach(async ({ browser }) => {
    await cleanupAccounts(browser, createdForgot.splice(0));
  });

  async function createViaAdmin(browser: import('@playwright/test').Browser, name: string, permission: 'Admin' | 'User') {
    createdForgot.push(name);
    const ctx = await browser.newContext({ ignoreHTTPSErrors: true, baseURL: process.env.E2E_BASE_URL, storageState: ADMIN_STORAGE_PATH });
    try {
      await createAccountViaUI(await ctx.newPage(), { name, password: TEST_PASSWORD, permission });
    } finally {
      await ctx.close();
    }
  }

  async function submitForgotPassword(page: Page, username: string, license: string, newPassword: string) {
    await page.goto('/');
    await page.locator('.forget-password').click();
    await expect(page).toHaveURL(/forgetpassword/i);
    const inputs = page.locator('form input:not([type=checkbox])');
    await expect(inputs).toHaveCount(3); // 忘記密碼頁：帳號、授權碼、新密碼
    await inputs.nth(0).fill(username);
    await inputs.nth(1).fill(license);
    await inputs.nth(2).fill(newPassword);
    await page.locator('form button').last().click();
  }

  test(
    "[LOGIN-023] 忘記密碼：Admin 帳號 + 授權碼 + 新密碼可成功變更密碼",
    {
      annotation: [
        ...csvAnnotations({
          row: 12,
          no: '',
          category: '登入畫面 > 忘記密碼（延續 1.2）',
          steps: '1.點擊忘記密碼\n2.輸入Admin帳號、授權碼、新密碼',
          expected: '1.忘記密碼僅Admin輸入可成功改新密碼',
        }),
        { type: '判定範圍', description: '以新建的 Admin 權限測試帳號測試（CSV「Admin 帳號」含義待使用者確認）' },
      ],
    },
    async ({ page, browser }) => {
      const { password: adminPassword } = adminCredentials();
      const name = uniqueAccountName('adm');
      await createViaAdmin(browser, name, 'Admin');
      await submitForgotPassword(page, name, requireEnv('E2E_LICENSE'), adminPassword);
      await expect(page.locator('.swal2-icon.swal2-success')).toBeVisible();
      // 預期：密碼已變更（新密碼可登入、舊密碼失效）
      const ctx = await freshContext(browser);
      try {
        const p = await ctx.newPage();
        await expectLoginFails(p, name, TEST_PASSWORD);
        await expectLoginSucceeds(p, name, adminPassword);
      } finally {
        await ctx.close();
      }
    },
  );

  test(
    "[LOGIN-024] 忘記密碼：非 Admin 帳號 + 授權碼 + 新密碼出現警告訊息",
    {
      annotation: csvAnnotations({
        row: 12,
        no: '',
        category: '登入畫面 > 忘記密碼（延續 1.2）',
        steps: '1.點擊忘記密碼\n3.輸入非Admin帳號、授權碼、新密碼',
        expected: '2.其他非Admin身分出現警告訊息',
      }),
    },
    async ({ page, browser }) => {
      const { password: adminPassword } = adminCredentials();
      const name = uniqueAccountName('usr');
      await createViaAdmin(browser, name, 'User');
      await submitForgotPassword(page, name, requireEnv('E2E_LICENSE'), adminPassword);
      // 觀察：實際出現的提示（文字與圖示類型），供 Results 記錄
      await page.locator('.swal2-popup').waitFor({ timeout: 8000 }).catch(() => {});
      const alertText = ((await page.locator('.swal2-popup').innerText({ timeout: 1000 }).catch(() => '')) || '無提示').trim().replace(/s+/g, ' ');
      const successShown = await page.locator('.swal2-icon.swal2-success').isVisible();
      const errorShown = await page.locator('.swal2-icon.swal2-error').isVisible();
      test.info().annotations.push({ type: '觀察：非 Admin 忘記密碼提示', description: `文字=「${alertText}」；成功圖示=${successShown}；錯誤圖示=${errorShown}` });
      // 觀察：該帳號密碼是否被改為新密碼（以新密碼嘗試登入）
      const ctx = await freshContext(browser);
      let changed = false;
      try {
        const p = await ctx.newPage();
        await loginAs(p, name, adminPassword);
        changed = await p.waitForURL(/^(?!.*login)/, { timeout: 8000 }).then(() => true).catch(() => false);
      } finally {
        await ctx.close();
      }
      test.info().annotations.push({ type: '觀察：非 Admin 密碼是否被改', description: String(changed) });
      // 預期：出現警告訊息（錯誤提示）
      expect(errorShown).toBe(true);
    },
  );
});
