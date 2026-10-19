import { Browser, Page, expect } from '@playwright/test';
import { ADMIN_STORAGE_PATH } from './accounts';

// 看板設定 helper。所有看板（WELCOME、OCCUPANCY、CAPACITY、GUARD…）的設定存在同一份 settings，
// 測項修改前先取得該看板設定的快照，測項結束（含失敗／逾時）一律以獨立 Admin 環境還原該看板設定。
// 透過 Vue 根實例呼叫產品自己的 $globalGetDisplaySetting／$globalSetDisplaySetting（與介面儲存時送出的資料相同）。

type Settings = Record<string, Record<string, unknown>>;

export async function appGetSettings(page: Page): Promise<Settings> {
  return page.evaluate(async () => {
    const el = Array.from(document.querySelectorAll('*')).find((e) => (e as unknown as { __vue__?: unknown }).__vue__) as unknown as {
      __vue__: { $root: { $globalGetDisplaySetting: () => Promise<{ error: unknown; data: Record<string, Record<string, unknown>> }> } };
    };
    const ret = await el.__vue__.$root.$globalGetDisplaySetting();
    if (ret.error) throw new Error('取得看板設定失敗');
    return ret.data;
  });
}

export async function appSetSettings(page: Page, settings: Settings): Promise<void> {
  const err = await page.evaluate(async (s) => {
    const el = Array.from(document.querySelectorAll('*')).find((e) => (e as unknown as { __vue__?: unknown }).__vue__) as unknown as {
      __vue__: { $root: { $globalSetDisplaySetting: (x: unknown) => Promise<{ error: unknown }> } };
    };
    const ret = await el.__vue__.$root.$globalSetDisplaySetting(s);
    return ret.error ? String(ret.error) : '';
  }, settings);
  if (err) throw new Error(`還原看板設定失敗：${err}`);
}

/** 開啟任一看板設定頁（讓 Vue 應用與登入權杖就緒）後，取得目前某個看板的設定快照。 */
export async function snapshotDashboard(page: Page, settingsRoute: string, key: string) {
  await page.goto(settingsRoute);
  await page.reload();
  await page.waitForTimeout(3000);
  const all = await appGetSettings(page);
  return JSON.parse(JSON.stringify(all[key] === undefined ? {} : all[key])) as Record<string, unknown>;
}

/** 以獨立 Admin 環境把某個看板的設定還原成快照（只替換該看板的 key，不動其他看板）。 */
export async function restoreDashboard(browser: Browser, settingsRoute: string, key: string, snapshot: Record<string, unknown> | null) {
  if (!snapshot) return;
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true, baseURL: process.env.E2E_BASE_URL, storageState: ADMIN_STORAGE_PATH });
  try {
    const page = await ctx.newPage();
    await page.goto(settingsRoute);
    await page.reload();
    await page.waitForTimeout(3000);
    const all = await appGetSettings(page);
    all[key] = snapshot;
    await appSetSettings(page, all);
  } finally {
    await ctx.close();
  }
}

/** 讀取目前某個看板的設定（從已載入應用的頁面）。 */
export async function readDashboard(page: Page, key: string) {
  const all = await appGetSettings(page);
  return all[key];
}

// ---- 各看板設定精靈共用的操作 ----
export const settingsNext = (page: Page) => page.getByRole('button', { name: '下一步' });

/** 開啟設定頁（等第 1 步的「背景圖片」出現）。 */
export async function openDashboardSettings(page: Page, route: string) {
  await page.goto(route);
  await page.reload();
  await page.getByText('背景圖片').first().waitFor();
  await page.waitForTimeout(1500);
}

/** 第 2 步（最後一個填寫步驟）儲存：按「儲存變更」後按「完成」。 */
export async function saveStep2(page: Page) {
  await page.getByRole('button', { name: '儲存變更' }).click();
  await page.getByRole('button', { name: '完成' }).click();
  await page.waitForTimeout(1500);
}

export const visibleSelect = (page: Page, idx: number) => page.locator('select:visible').nth(idx);
export const selectOptions = (sel: ReturnType<Page['locator']>) =>
  sel.locator('option').evaluateAll((os) => os.map((o) => ({ value: (o as HTMLOptionElement).value, label: (o.textContent ?? '').trim() })));
export const selectValue = (sel: ReturnType<Page['locator']>) => sel.evaluate((e) => (e as HTMLSelectElement).value);

/** 找出「後端設定」中哪些欄位與快照不同。 */
export function changedKeys(before: Record<string, unknown>, after: Record<string, unknown>) {
  return Object.keys({ ...before, ...after }).filter((k) => JSON.stringify(before[k]) !== JSON.stringify(after[k]));
}

/** 看板上任何元素以背景圖或 <img> 套用了含 needle 的圖。 */
export const boardHasImage = (page: Page, needle: string) =>
  page.evaluate((n) => {
    const hit = (e: Element) =>
      getComputedStyle(e).backgroundImage.includes(n) || (e instanceof HTMLImageElement && e.src.includes(n)) || getComputedStyle(e, '::before').backgroundImage.includes(n);
    return Array.from(document.querySelectorAll('*')).some(hit);
  }, needle);


/**
 * 模擬即時辨識事件：把一筆「人員被辨識」的訊息送進前端的 store（與 WebSocket 收到 /verifyresults 訊息後
 * 呼叫的 setNotifications 同一條路徑）。訊息帶真實存在人員的 uuid，看板再向後端查該人員的真實資料。
 * 這樣不需要真人站在鏡頭前，也不依賴環境當下有沒有辨識事件。多字姓名的人員排在前面（供姓名遮蔽判斷）。
 */
export async function injectRecognitions(page: Page, count = 4) {
  const injected = await page.evaluate(async (n) => {
    const root = (Array.from(document.querySelectorAll('*')).find((e) => (e as unknown as { __vue__?: unknown }).__vue__) as unknown as { __vue__: { $root: any } }).__vue__.$root;
    const res = await root.$globalFindPersonWithoutPhoto('', 0, 3000, '');
    const list = ((res.data && res.data.person_list) || []) as Array<{ uuid: string; name: string; group_list: string | string[] }>;
    const groupsOf = (p: { group_list: string | string[] }) => (typeof p.group_list === 'string' ? JSON.parse(p.group_list || '[]') : p.group_list || []);
    const cand = list.filter((p) => !/^e2e/i.test(p.name) && groupsOf(p).length > 0);
    cand.sort((a, b) => Number(/\s/.test(b.name.trim())) - Number(/\s/.test(a.name.trim())));
    const picked = cand.slice(0, n);
    for (const p of picked) {
      root.$store.dispatch('setNotifications', JSON.stringify({ type: 1, person: { name: p.name }, person_id: p.uuid, groups: groupsOf(p) }));
    }
    return picked.map((p) => p.name);
  }, count);
  expect(injected.length, '環境中沒有可用的既有人員可供模擬辨識').toBeGreaterThan(0);
  return injected;
}