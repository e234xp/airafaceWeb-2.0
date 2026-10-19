import { test, expect, Page, APIRequestContext } from '@playwright/test';
import { csvAnnotations } from '../../helpers/csvSource';
import { adminCredentials, fillCredentials, loginForm, openLoginPage } from '../../helpers/auth';

// 來源 E2E-TEST-PLAN.md：MGR-001、005、006（airaManager 中央管理）。MGR-002、003、004 需要真人辨識／斷網，另行處理。
// 破壞性：啟用／關閉中央管理會清空 Face 的全部人員與訪客並重啟服務，且啟用後人員會由 airaManager 同步進來。
// 因此預設整檔略過（避免 e2e:parallel 誤觸）；要跑時先備份 Face 資料，並設 E2E_MGR_ENABLE=1。
// airaManager 位址與帳密在 .env.e2e.local：E2E_MANAGER_URL、E2E_MANAGER_USERNAME、E2E_MANAGER_PASSWORD。
const MGR_URL = (process.env.E2E_MANAGER_URL ?? '').replace(/\/$/, '');
const MGR_HOST = MGR_URL ? new URL(MGR_URL).hostname : '';

test.beforeEach(() => {
  test.skip(!process.env.E2E_MGR_ENABLE, '破壞性（清空人員並重啟），需設 E2E_MGR_ENABLE=1 並先備份');
});

const obs = (s: string) => {
  console.log('OBS', s);
  test.info().annotations.push({ type: '觀察', description: s });
};
const rootEval = <T, A>(page: Page, fn: string, arg?: A) =>
  page.evaluate(
    async ([code, a]) => {
      const el = Array.from(document.querySelectorAll('*')).find((x) => (x as unknown as { __vue__?: unknown }).__vue__) as any;
      // eslint-disable-next-line no-new-func
      return new Function('root', 'arg', `return (async () => { ${code} })()`)(el.__vue__.$root, a) as T;
    },
    [fn, arg] as [string, A | undefined],
  );

async function mgrGet(request: APIRequestContext, path: string) {
  const login = await request.post(`${MGR_URL}/airaManager/login`, { data: { username: process.env.E2E_MANAGER_USERNAME, password: process.env.E2E_MANAGER_PASSWORD } });
  expect(login.ok(), 'airaManager 登入').toBe(true);
  const { token } = await login.json();
  const r = await request.get(`${MGR_URL}/airaManager${path}`, { headers: { token } });
  expect(r.ok(), `GET ${path}`).toBe(true);
  return r.json();
}
async function relogin(page: Page) {
  const { username, password } = adminCredentials();
  await openLoginPage(page);
  await loginForm(page).language.selectOption('zh');
  await loginForm(page).mode.selectOption('Setting');
  await fillCredentials(page, username, password);
  await loginForm(page).loginButton.click();
  await expect(page).not.toHaveURL(/login/, { timeout: 60000 });
  await page.locator('.c-sidebar').first().waitFor({ state: 'attached' });
}
const faceState = (page: Page) =>
  rootEval<{ persons: string[]; visitors: number; groups: string[]; central: boolean }, undefined>(
    page,
    `
    const p = await root.$globalFindPersonWithoutPhoto('', 0, 10000, '');
    const v = await root.$globalFindVisitorWithoutPhoto('', 0, 10000);
    const g = await root.$globalGetGroupList();
    const m = await root.$globalGetAiraManagerSetting();
    const pl = (p.data && p.data.person_list) || [];
    const vl = (v.data && v.data.visitor_list) || [];
    return { persons: pl.map((x) => x.uuid), visitors: vl.length, groups: (g.group_list || []).map((x) => x.name), central: !!(m && m.data && m.data.manager_enable) };
  `,
    undefined,
  );

// 經由 UI 開關中央管理並按「套用」→ 確認「將遺失所有人員資料」→ 等服務重啟 → 重新登入
async function setCentral(page: Page, enable: boolean) {
  await page.goto('/#/systemsettings/generalsettings');
  await page.reload();
  if (/login/.test(page.url())) {
    await relogin(page);
    await page.goto('/#/systemsettings/generalsettings');
  }
  const card =page.locator('.card').filter({ has: page.locator('.h3', { hasText: '中央管理' }) });
  await card.waitFor();
  await page.waitForTimeout(1500);
  const sw = card.locator('.c-switch-input');
  if ((await sw.isChecked()) !== enable) await card.locator('.c-switch').click();
  if (enable) await card.locator('input[type="text"]').first().fill(MGR_HOST);
  await card.getByRole('button', { name: '套用' }).click();
  await page.locator('.el-message-box__btns .el-button--primary').click();
  await page.waitForTimeout(20000);
  const t0 = Date.now();
  for (;;) {
    try {
      await relogin(page);
      return;
    } catch {
      if (Date.now() - t0 > 180000) throw new Error('套用後 3 分鐘內 Face 沒有恢復');
      await page.waitForTimeout(8000);
    }
  }
}
async function ensureCentral(page: Page, enable: boolean) {
  await page.goto('/#/systemsettings/generalsettings');
  const st = await faceState(page);
  if (st.central !== enable) await setCentral(page, enable);
}

test(
  '[MGR-006] 同步清空人員：開啟中央管理後，Face 原有人員與訪客應清除',
  {
    annotation: [
      ...csvAnnotations({ row: 219, no: '17.4', category: '（延續）> 同步清空人員', steps: '開啟中央管理清空Face人員', expected: '1.開啟中央管理\n2.檢查Face人員與訪客應清除' }),
      { type: '判定範圍', description: '開啟前記下 Face 全部人員 uuid；開啟後這些原有人員應全部不在（之後由 airaManager 同步進來的人員不算）；訪客應為 0' },
    ],
  },
  async ({ page }) => {
    test.setTimeout(300000);
    await page.goto('/');
    await ensureCentral(page, false);
    await page.goto('/#/personsmanagement/personmanagement');
    const before = await faceState(page);
    obs(`開啟前：人員 ${before.persons.length}、訪客 ${before.visitors}`);
    expect(before.persons.length, '前置：開啟前要有人員才能驗證清除').toBeGreaterThan(0);
    await setCentral(page, true);
    const after = await faceState(page);
    const left = before.persons.filter((u) => after.persons.includes(u));
    obs(`開啟後：人員 ${after.persons.length}（含同步進來的）、訪客 ${after.visitors}、仍留下原有人員 ${left.length}`);
    expect(after.central, '中央管理已啟用').toBe(true);
    expect(left, '原有人員應全部清除').toEqual([]);
    expect(after.visitors, '訪客應清除').toBe(0);
  },
);

test(
  '[MGR-001] 同步：airaManager 的人員群組會傳進 Face 群組',
  {
    annotation: [
      ...csvAnnotations({ row: 214, no: '17.1', category: '（延續）> 同步', steps: 'manager 人員 群組會傳進Face2群組\nhttp://192.168.xx.xxx:8084/#/login', expected: '檢查Face群組' }),
      { type: '判定範圍', description: '啟用後等人員同步完成，對每位同步進來的人員：其在 airaManager 所屬的群組，Face 要有同名群組且該人員在其中。沒有人員分配到本機的 airaManager 群組，Face 不會建立（後端依人員建立群組），只列為觀察，不算失敗' },
    ],
  },
  async ({ page, request }) => {
    test.setTimeout(300000);
    await page.goto('/');
    await ensureCentral(page, true);
    const raw = await mgrGet(request, '/persongroups?withPerson=true');
    const groups = (raw.list ?? []) as Array<{ name: string; person_list: Array<{ uuid: string }> }>;
    obs(`airaManager 人員群組 ${groups.length} 個`);
    expect(groups.length, 'airaManager 沒有人員群組可比對').toBeGreaterThan(0);
    // 等 Face 的人員同步進來（Face 只建立「有人員同步進來」的群組）；連續兩次數量相同視為同步完成
    let persons: Array<{ uuid: string; name: string; group_list: string[] }> = [];
    let prev = -1;
    const t0 = Date.now();
    while (Date.now() - t0 < 240000) {
      persons = await rootEval<typeof persons, undefined>(
        page,
        `const p = await root.$globalFindPersonWithoutPhoto('', 0, 10000, '');
         return ((p.data && p.data.person_list) || []).map((x) => ({ uuid: x.uuid, name: x.name, group_list: x.group_list || [] }));`,
        undefined,
      );
      if (persons.length > 0 && persons.length === prev) break;
      prev = persons.length;
      await page.waitForTimeout(20000);
    }
    const faceGroups = (await faceState(page)).groups;
    obs(`Face 同步進來的人員 ${persons.length} 位；Face 群組：${faceGroups.join('、')}`);
    expect(persons.length, 'Face 沒有同步到任何人員，無法驗證群組').toBeGreaterThan(0);
    const wrong: string[] = [];
    const used = new Set<string>();
    for (const g of groups) {
      const members = new Set(g.person_list.map((x) => x.uuid));
      const inFace = persons.filter((p) => members.has(p.uuid));
      if (inFace.length === 0) continue;
      used.add(g.name);
      if (!faceGroups.includes(g.name)) wrong.push(`Face 沒有群組「${g.name}」`);
      for (const p of inFace) if (!p.group_list.includes(g.name)) wrong.push(`人員 ${p.name} 在 airaManager 屬於「${g.name}」，Face 沒有`);
    }
    const unused = groups.map((g) => g.name).filter((n) => !used.has(n));
    obs(`有同步人員的 airaManager 群組 ${used.size} 個；沒有人員分配到本機、Face 未建立的 ${unused.length} 個：${unused.join('、')}`);
    expect(wrong, '人員的群組沒有正確傳到 Face').toEqual([]);
  },
);

test(
  '[MGR-005] 結束同步清空人員：關閉中央管理後，Face 人員與訪客應清除',
  {
    annotation: [
      ...csvAnnotations({ row: 218, no: '17.4', category: '（延續）> 結束同步清空人員', steps: '關閉中央管理清空Face人員', expected: '1.關閉中央管理\n2.檢查Face人員與訪客應清除' }),
      { type: '判定範圍', description: '關閉前 Face 有人員（由 airaManager 同步進來）；關閉後人員與訪客都應為 0' },
    ],
  },
  async ({ page }) => {
    test.setTimeout(300000);
    await page.goto('/');
    await ensureCentral(page, true);
    await page.goto('/#/personsmanagement/personmanagement');
    const before = await faceState(page);
    obs(`關閉前：人員 ${before.persons.length}、訪客 ${before.visitors}`);
    await setCentral(page, false);
    const after = await faceState(page);
    obs(`關閉後：人員 ${after.persons.length}、訪客 ${after.visitors}`);
    expect(after.central, '中央管理已關閉').toBe(false);
    expect(after.persons.length, '人員應清除').toBe(0);
    expect(after.visitors, '訪客應清除').toBe(0);
  },
);

// MGR-002、003、004：需要真人辨識／斷網，尚未實作
test.fixme('[MGR-002] airaManager 回傳人員辨識結果：manager 顯示調查與 Face 相同結果', async () => {});
test.fixme('[MGR-003] airaManager：出勤/調查/陌生人紀錄傳回 manager', async () => {});
test.fixme('[MGR-004] airaManager 斷線回填：網路斷線後重新連線，辨識後人員資料由 Face 同步至 manager', async () => {});
