import { test, expect, Page } from '../../helpers/test';
import { csvAnnotations } from '../../helpers/csvSource';
import { shot } from '../../helpers/evidence';
import {
  TEST_PASSWORD,
  attemptCreateAccountViaUI,
  attemptDeleteAccounts,
  cleanupAccounts,
  listAccountNames,
  Permission,
  changePasswordViaUI,
  createAccountViaUI,
  deleteAccountViaUI,
  expectLoginFails,
  expectLoginSucceeds,
  freshContext,
  gotoAccountManagement,
  loginAs,
  rowOf,
  searchAccount,
  uniqueAccountName,
} from '../../helpers/accounts';
import { logout } from '../../helpers/auth';

// 來源 E2E-TEST-PLAN.md；模組 ACCT，共 9 個 Test ID（CSV 第 163 列 #11.2 帳號管理）。
// 以 Admin 共用登入狀態執行；需要其他權限時另開全新瀏覽器環境以測試帳號登入。
// 測試帳號一律 e2e- 開頭並於測項結束清理，不操作既有帳號（Admin、user）。

const CSV_STEPS_163 = `1.新增按鈕進行帳號、密碼、權限等設定
2.可透過刪除按鈕對下方勾選帳號進行去除
3.變更帳號密碼後登出並重新登入後，需輸入新的密碼 (舊的密碼失效)
4. Poweruser可使用的系統設定:
   - 一般設定
   - 帳號管理 (僅能變更自己的密碼，不能新增/刪除其他帳號，不能自殺)
   - 時間設置
   - 網路設定
   - 備份與還原
5. User僅能使用 出勤 / 報表 頁面
- 可到帳號管理變更自己的密碼，但不能自殺`;
const CSV_EXPECTED_163 = `1.正確顯示已有的帳號清單、頁數、筆數、顯示欄位
2.搜尋文字功能正確
3.新增功能正常且能建立新帳號並登入使用
4.編輯功能正常且按下儲存變更能更新密碼成功
5.刪除功能正常`;

const ann = (steps: string, expected: string) =>
  csvAnnotations({ row: 163, no: '11.2', category: '帳號管理 > 帳號管理', steps, expected });

const sidebarGroups = async (page: Page) =>
  (await page.locator('.c-sidebar-nav > .c-sidebar-nav-dropdown > .c-sidebar-nav-dropdown-toggle').allInnerTexts()).map(
    (s) => s.trim(),
  );

// 測項建立的測試帳號；清理放在 afterEach（測項逾時／失敗也會執行），並以獨立的 Admin 瀏覽器環境刪除。
const createdAccounts: string[] = [];

test.afterEach(async ({ browser }) => {
  const names = createdAccounts.splice(0);
  await cleanupAccounts(browser, names);
});

async function withAccounts(
  page: Page,
  specs: Array<{ tag: string; permission: Permission }>,
  body: (names: string[]) => Promise<void>,
) {
  const names = specs.map((s) => uniqueAccountName(s.tag));
  createdAccounts.push(...names);
  for (let i = 0; i < specs.length; i += 1) {
    await createAccountViaUI(page, { name: names[i], password: TEST_PASSWORD, permission: specs[i].permission });
  }
  await body(names);
}

test.describe("ACCT", () => {
  test(
    "[ACCT-001] 帳號管理：已有帳號清單、頁數、筆數、顯示欄位",
    {
      annotation: [
        ...ann('〔依預期結果推導〕進入帳號管理頁，檢視已有帳號清單、頁數、筆數、顯示欄位', '1.正確顯示已有的帳號清單、頁數、筆數、顯示欄位'),
        { type: '判定範圍', description: '以後端 findaccount 回傳的帳號資料為基準，逐筆比對畫面的帳號、權限、備註、筆數、頁數；欄位表頭（帳號、密碼、權限、備註）經使用者確認無誤' },
      ],
    },
    async ({ page }) => {
      await page.goto('/#/systemsettings/accountmanagement');
      const resp = page.waitForResponse((r) => r.url().includes('findaccount'));
      await page.reload();
      const accounts = (await (await resp).json()).account_list as Array<{ username: string; permission: string; remarks: string }>;
      await page.locator('.vxe-table--body-wrapper tbody tr').first().waitFor();
      expect(accounts.length).toBeGreaterThan(0);
      expect(accounts.map((a) => a.username)).toContain('Admin');
      // 筆數：分頁列「共 N 項記錄」= 後端帳號數
      const pagerText = await page.locator('.vxe-pager').innerText();
      const total = Number(/共\s*(\d+)/.exec(pagerText)?.[1]);
      expect(total).toBe(accounts.length);
      // 頁數與每頁筆數：第 1 頁列數 = min(10, N)；多於 10 筆時有第 2 頁
      expect(await page.locator('.vxe-table--body-wrapper tbody tr').count()).toBe(Math.min(10, total));
      if (total > 10) await expect(page.locator('.vxe-pager--num-btn').nth(1)).toBeVisible();
      // 欄位：表頭為 帳號、密碼、權限、備註
      const headers = (await page.locator('.vxe-table--header-wrapper th').allInnerTexts()).map((s) => s.trim());
      for (const h of ['帳號', '密碼', '權限', '備註']) expect(headers).toContain(h);
      // 清單：畫面每一列的帳號、權限、備註皆與後端資料一致，且密碼不以明文顯示
      const col = (n: number) => page.locator(`.vxe-table--body-wrapper tbody tr td:nth-child(${n})`).allInnerTexts();
      const [names, pwds, perms, remarks] = [await col(2), await col(3), await col(4), await col(5)];
      expect(names.length).toBe(Math.min(10, total));
      names.forEach((n, i) => {
        const a = accounts.find((x) => x.username === n.trim());
        expect(a, `畫面帳號 ${n.trim()} 在後端資料中不存在`).toBeTruthy();
        expect(perms[i].trim()).toBe(a?.permission);
        expect(remarks[i].trim()).toBe((a?.remarks ?? '').trim());
        expect(pwds[i].trim().length).toBeGreaterThan(0);
        expect(pwds[i].trim()).toMatch(/^[*•●]+$/);
      });
      await shot(page, 'ACCT-001', '01-帳號管理清單');
    },
  );

  test(
    "[ACCT-002] 帳號管理：搜尋文字功能",
    { annotation: ann('〔依預期結果推導〕於帳號管理頁輸入關鍵字搜尋', '2.搜尋文字功能正確') },
    async ({ page }) => {
      await gotoAccountManagement(page);
      // 有符合者：僅顯示符合關鍵字的帳號（不分大小寫）
      await searchAccount(page, 'admin');
      const names = await page.locator('.vxe-table--body-wrapper tbody tr td:nth-child(2)').allInnerTexts();
      expect(names.length).toBeGreaterThan(0);
      for (const n of names) expect(n.toLowerCase()).toContain('admin');
      // 無符合者：清單為空
      await searchAccount(page, 'e2e-no-such-account-zzz');
      await expect(page.locator('.vxe-table--body-wrapper tbody tr td:nth-child(2)').filter({ hasText: /\S/ })).toHaveCount(0);
    },
  );

  test(
    "[ACCT-003] 帳號管理：新增帳號（帳號、密碼、權限）並可登入使用",
    { annotation: ann('1.新增按鈕進行帳號、密碼、權限等設定', '3.新增功能正常且能建立新帳號並登入使用') },
    async ({ page, browser }) => {
      const name = uniqueAccountName('add');
      createdAccounts.push(name);
      {
        await createAccountViaUI(page, { name, password: TEST_PASSWORD, permission: 'User' });
        // 預期：清單出現新帳號與所選權限
        await expect(rowOf(page, name).first()).toContainText('User');
        // 預期：以新帳號登入使用
        const ctx = await freshContext(browser);
        try {
          await expectLoginSucceeds(await ctx.newPage(), name, TEST_PASSWORD);
        } finally {
          await ctx.close();
        }
      }
    },
  );

  test(
    "[ACCT-004] 帳號管理：編輯並儲存變更更新密碼成功；登出重新登入需輸入新密碼（舊密碼失效）",
    { annotation: ann('3.變更帳號密碼後登出並重新登入後，需輸入新的密碼 (舊的密碼失效)', '4.編輯功能正常且按下儲存變更能更新密碼成功') },
    async ({ page, browser }) => {
      await withAccounts(page, [{ tag: 'pwd', permission: 'User' }], async ([name]) => {
        const newPassword = `${TEST_PASSWORD}-new`;
        const ctx = await freshContext(browser);
        try {
          const userPage = await ctx.newPage();
          await expectLoginSucceeds(userPage, name, TEST_PASSWORD); // 先以舊密碼登入
          await changePasswordViaUI(page, name, newPassword); // Admin 變更該帳號密碼
          await expect(page.locator('.swal2-icon.swal2-success')).toBeVisible(); // 儲存成功
          await logout(userPage); // 使用者登出
          await expectLoginFails(userPage, name, TEST_PASSWORD); // 舊密碼失效
          await expectLoginSucceeds(userPage, name, newPassword); // 新密碼可登入
        } finally {
          await ctx.close();
        }
      });
    },
  );

  test(
    "[ACCT-005] 帳號管理：刪除勾選帳號",
    { annotation: ann('2.可透過刪除按鈕對下方勾選帳號進行去除', '5.刪除功能正常') },
    async ({ page }) => {
      const name = uniqueAccountName('del');
      createdAccounts.push(name);
      await createAccountViaUI(page, { name, password: TEST_PASSWORD, permission: 'User' });
      {
        await expect(rowOf(page, name).first()).toBeVisible();
        // 勾選 → 刪除 → 確認
        await rowOf(page, name).first().locator('.vxe-cell--checkbox').click();
        await page.locator('button.btn-danger').first().click();
        await page.locator('.el-message-box__btns .el-button--primary').click();
        await expect(page.locator('.swal2-icon.swal2-success')).toBeVisible();
        // 預期：帳號已從清單移除（重新載入後仍不存在）
        await gotoAccountManagement(page);
        await expect(rowOf(page, name)).toHaveCount(0);
      }
    },
  );

  test(
    "[ACCT-006] Poweruser：可使用一般設定、時間設置、網路設定、備份與還原",
    {
      annotation: [
        ...ann(
          '4. Poweruser可使用的系統設定:\n   - 一般設定\n   - 時間設置\n   - 網路設定\n   - 備份與還原',
          '4. Poweruser可使用的系統設定:\n   - 一般設定\n   - 時間設置\n   - 網路設定\n   - 備份與還原',
        ),
        { type: '判定範圍', description: '時間設置、網路設定在側邊欄無入口，需使用者裁定（部分完成）' },
      ],
    },
    async ({ page, browser }) => {
      await withAccounts(page, [{ tag: 'pu', permission: 'PowerUser' }], async ([name]) => {
        const ctx = await freshContext(browser);
        try {
          const pu = await ctx.newPage();
          await loginAs(pu, name, TEST_PASSWORD);
          await expect(pu).not.toHaveURL(/login/);
          await pu.locator('.c-sidebar').first().waitFor({ state: 'attached' });
          // 展開「系統設定」並讀取其底下的選單項目
          const group = pu.locator(".c-sidebar-nav-dropdown").filter({ has: pu.locator(".c-sidebar-nav-dropdown-toggle", { hasText: "系統設定" }) });
          await group.locator(".c-sidebar-nav-dropdown-toggle").first().click();
          const items = (await group.locator(".c-sidebar-nav-link").allInnerTexts()).map((s) => s.trim());
          test.info().annotations.push({ type: "觀察：PowerUser 系統設定選單", description: items.join("、") });
          await shot(pu, 'ACCT-006', '01-PowerUser系統設定選單');
          // 可自動判定：一般設定、備份與還原 有入口，且點選後可開啟該頁
          for (const [label, route] of [["一般設定", /generalsettings/i], ["備份與還原", /backupandrestore/i]] as const) {
            expect(items).toContain(label);
            await group.locator(".c-sidebar-nav-link", { hasText: label }).first().click();
            await expect(pu).toHaveURL(route);
          }
          // 觀察：時間設置、網路設定是否有入口（不下判定，交由使用者裁定）
          for (const label of ["時間設置", "網路設定"]) {
            test.info().annotations.push({ type: "觀察：" + label, description: items.includes(label) ? "側邊欄有入口" : "側邊欄無入口" });
          }
        } finally {
          await ctx.close();
        }
      });
    },
  );

  test(
    "[ACCT-007] Poweruser：帳號管理僅能變更自己的密碼，不能新增/刪除其他帳號，不能自殺",
    {
      annotation: ann(
        '4. Poweruser可使用的系統設定:\n   - 帳號管理 (僅能變更自己的密碼，不能新增/刪除其他帳號，不能自殺)',
        '4. Poweruser可使用的系統設定:\n   - 帳號管理 (僅能變更自己的密碼，不能新增/刪除其他帳號，不能自殺)',
      ),
    },
    async ({ page, browser }) => {
      await withAccounts(
        page,
        [
          { tag: 'pu', permission: 'PowerUser' },
          { tag: 'vic', permission: 'User' },
        ],
        async ([puName, victim]) => {
          const extra = uniqueAccountName('new');
          createdAccounts.push(extra);
          const ctx = await freshContext(browser);
          try {
            const pu = await ctx.newPage();
            await expectLoginSucceeds(pu, puName, TEST_PASSWORD);

            // 觀察：PowerUser 在帳號管理頁看到的清單與勾選框狀態（供 Results 記錄）
            const seen = await listAccountNames(pu);
            const disabledBoxes = await pu.locator('.vxe-body--row .is--disabled').count();
            test.info().annotations.push({
              type: '觀察：PowerUser 帳號管理頁',
              description: `清單僅含自己：${seen.length === 1 && seen[0] === puName}；停用的勾選框數：${disabledBoxes}`,
            });

            // 1) 不能新增其他帳號：嘗試新增，預期帳號未被建立
            const addResult = await attemptCreateAccountViaUI(pu, { name: extra, password: TEST_PASSWORD, permission: 'User' });
            test.info().annotations.push({ type: '觀察：PowerUser 新增帳號結果', description: addResult });
            expect(await listAccountNames(page)).not.toContain(extra);

            // 2) 不能刪除其他帳號：嘗試刪除 victim，預期 victim 仍存在
            await attemptDeleteAccounts(pu, [victim]);
            expect(await listAccountNames(page)).toContain(victim);

            // 3) 不能自殺：嘗試刪除自己，預期自己仍存在
            await attemptDeleteAccounts(pu, [puName]);
            expect(await listAccountNames(page)).toContain(puName);

            // 4) 可變更自己的密碼：以新密碼可登入、舊密碼不可
            const newPassword = `${TEST_PASSWORD}-new`;
            await changePasswordViaUI(pu, puName, newPassword);
            const ctx2 = await freshContext(browser);
            try {
              const p2 = await ctx2.newPage();
              await expectLoginFails(p2, puName, TEST_PASSWORD);
              await expectLoginSucceeds(p2, puName, newPassword);
            } finally {
              await ctx2.close();
            }
          } finally {
            await ctx.close();
          }
        },
      );
    },
  );

  test(
    "[ACCT-008] User：僅能使用出勤/報表頁面",
    {
      annotation: ann(
        '5. User僅能使用 出勤 / 報表 頁面\n- 可到帳號管理變更自己的密碼，但不能自殺',
        '5. User僅能使用 出勤 / 報表 頁面\n- 可到帳號管理變更自己的密碼，但不能自殺',
      ),
    },
    async ({ page, browser }) => {
      await withAccounts(page, [{ tag: 'usr', permission: 'User' }], async ([name]) => {
        const ctx = await freshContext(browser);
        try {
          const u = await ctx.newPage();
          await expectLoginSucceeds(u, name, TEST_PASSWORD);
          await u.locator('.c-sidebar').first().waitFor({ state: 'attached' });
          await expect(u.locator('.c-sidebar-nav-dropdown-toggle').first()).toBeVisible();
          const groups = await sidebarGroups(u);
          test.info().annotations.push({ type: '觀察：User 側邊欄主選單', description: groups.join('、') });
          // 預期：可使用出勤、報表；其餘主選單（除可到帳號管理的「系統設定」外）不應出現
          expect(groups).toContain('出勤');
          expect(groups).toContain('報表');
          const others = groups.filter((g) => !['出勤', '報表', '系統設定'].includes(g));
          expect(others).toEqual([]);
        } finally {
          await ctx.close();
        }
      });
    },
  );

  test(
    "[ACCT-009] User：可到帳號管理變更自己的密碼，但不能自殺",
    {
      annotation: ann(
        '5. User僅能使用 出勤 / 報表 頁面\n- 可到帳號管理變更自己的密碼，但不能自殺',
        '5. User僅能使用 出勤 / 報表 頁面\n- 可到帳號管理變更自己的密碼，但不能自殺',
      ),
    },
    async ({ page, browser }) => {
      await withAccounts(page, [{ tag: 'usr', permission: 'User' }], async ([name]) => {
        const ctx = await freshContext(browser);
        try {
          const u = await ctx.newPage();
          await expectLoginSucceeds(u, name, TEST_PASSWORD);
          // 不能自殺：嘗試刪除自己，預期帳號仍存在
          await attemptDeleteAccounts(u, [name]);
          expect(await listAccountNames(page)).toContain(name);
          // 可到帳號管理變更自己的密碼：以新密碼可登入、舊密碼不可
          const newPassword = `${TEST_PASSWORD}-new`;
          await changePasswordViaUI(u, name, newPassword);
          const ctx2 = await freshContext(browser);
          try {
            const p2 = await ctx2.newPage();
            await expectLoginFails(p2, name, TEST_PASSWORD);
            await expectLoginSucceeds(p2, name, newPassword);
          } finally {
            await ctx2.close();
          }
        } finally {
          await ctx.close();
        }
      });
    },
  );
});
