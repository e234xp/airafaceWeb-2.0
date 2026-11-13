import { test, expect, Page } from '../../helpers/test';
import {
  injectRecognitions,
  appGetSettings,
  appSetSettings,
  openDashboardSettings,
  readDashboard,
  restoreDashboard,
  saveStep2,
  settingsNext,
  snapshotDashboard,
  visibleSelect,
  waitForDashboardSave,
} from '../../helpers/dashboard';

// 來源 E2E-TEST-PLAN.md：G3-A 看板類（WEL-001、ATB-001、008~013、OCC-001、008、009、SEC-002、005、006）。
// 環境已有持續的辨識事件（既有模擬攝影機 Camera-1~8 重複辨識 A-001、A-006、A-007、A-008 等），看板載入約需 30~100 秒才會有人員。
// 看板設定為全系統共用：每個測項前取得該看板設定快照，結束（含失敗）以獨立 Admin 環境還原。

const BOARDS = {
  WELCOME: { key: 'WELCOME', settings: '/#/displays/modifywelcomecontrolsetting', board: '/#/welcomemode' },
  OCCUPANCY: { key: 'OCCUPANCY', settings: '/#/displays/modifyoccupancycontrolsetting', board: '/#/occupancymode' },
  CAPACITY: { key: 'CAPACITY', settings: '/#/displays/modifycapacitycontrolsetting', board: '/#/capacitymode' },
  GUARD: { key: 'GUARD', settings: '/#/displays/modifyguardcontrolsetting', board: '/#/guardmode' },
} as const;
type Board = (typeof BOARDS)[keyof typeof BOARDS];

let cur: Board | null = null;
let snap: Record<string, unknown> | null = null;
test.afterEach(async ({ browser }) => {
  if (cur) await restoreDashboard(browser, cur.settings, cur.key, snap);
  cur = null;
  snap = null;
});
async function begin(page: Page, b: Board) {
  cur = b;
  snap = await snapshotDashboard(page, b.settings, b.key);
}
const obs = (s: string) => {
  console.log('OBS', s);
  test.info().annotations.push({ type: '觀察', description: s });
};

/** 開啟看板並等到 ready() 為真（最多 100 秒）。 */
async function loadBoard(page: Page, b: Board, ready: () => Promise<boolean>) {
  await page.goto(b.board);
  await page.reload();
  if (b.key === 'CAPACITY') await requireCapacityPersons(page);
  await expect.poll(ready, { timeout: 100000, message: `${b.board} 100 秒內沒有載入出人員` }).toBe(true);
  await page.waitForTimeout(1500);
}
/**
 * 容留看板只顯示「今天（每日重設時間之後）」進出過的人；剛過重設時間、還沒有人被辨識時看板一定是空的，
 * 等 100 秒也等不到人（2026-11-12 00:03 的完整測試 OCC-001/008/009 因此失敗）。
 * 先問後端看板資料，沒有任何進出人員就直接說明是環境缺資料，不要誤報成看板壞掉。
 * 有設 E2E_IS_MOCK=true 時，這個查詢和看板本身都會拿到假資料（e2e/mock/fakeBackend.ts），報告會標示。
 * @throws 沒有任何在場或今天離場的人員時，以「受阻」開頭說明
 */
async function requireCapacityPersons(page: Page) {
  // 重新整理後要等 Vue 掛載完，才拿得到 API 方法
  await page.waitForFunction(() => Array.from(document.querySelectorAll('body *')).some((x) => (x as unknown as { __vue__?: unknown }).__vue__));
  const counts = await page.evaluate(async () => {
    type Person = { status?: number; last_out_time?: number };
    const host = Array.from(document.querySelectorAll('*')).find((x) => (x as unknown as { __vue__?: unknown }).__vue__) as unknown as {
      __vue__: { $root: { $globalQueryCapacityDashboard: (range: string) => Promise<{ error: unknown; data: { persons?: Person[] } | null }> } };
    };
    const { error, data } = await host.__vue__.$root.$globalQueryCapacityDashboard('all');
    if (error || !data) return { error: String(error ?? '沒有回應資料'), present: 0, left: 0 };
    const persons = data.persons || [];
    // 和看板畫面的分法一致：status 0 是在場；status 1 且有離開時間才是今天離場（從沒進出過的人不顯示）
    return { error: '', present: persons.filter((p) => p.status === 0).length, left: persons.filter((p) => p.status === 1 && p.last_out_time).length };
  });
  if (counts.error) throw new Error(`讀取容留看板資料失敗：${counts.error}`);
  if (counts.present + counts.left === 0) {
    throw new Error('受阻：容留看板目前沒有任何進出人員（看板只算每日重設時間之後的辨識紀錄），無法驗證（環境缺資料）。真實環境缺資料時可在 .env.e2e.local 設 E2E_IS_MOCK=true 改用假資料。');
  }
}

const bodyText = async (page: Page) => (await page.locator('body').innerText()).replace(/\s+/g, ' ');

/** 讀看板 Vue 元件的資料（找出有指定屬性的元件）。 */
async function vmData<T>(page: Page, prop: string): Promise<T | null> {
  return page.evaluate((p) => {
    const all = Array.from(document.querySelectorAll('*')) as Array<HTMLElement & { __vue__?: Record<string, unknown> }>;
    for (const e of all) {
      const vm = e.__vue__;
      if (vm && p in vm) return JSON.parse(JSON.stringify(vm[p]));
    }
    return null;
  }, prop);
}
const knownNames = (page: Page) =>
  page.evaluate(async () => {
    const el = Array.from(document.querySelectorAll('*')).find((e) => (e as unknown as { __vue__?: unknown }).__vue__) as unknown as { __vue__: { $root: { $globalFindPersonWithoutPhoto: (a: string, b: number, c: number) => Promise<{ data: { person_list: Array<{ name: string }> } }> } } };
    const r = await el.__vue__.$root.$globalFindPersonWithoutPhoto('', 0, 3000);
    return r.data.person_list.map((p) => p.name);
  });

/** 依序按「下一步」直到儲存（有的看板最後一步是「儲存變更」、迎賓看板是「下一步」後直接出現「完成」），回傳步驟列文字。 */
async function finishWizard(page: Page) {
  const header = (await bodyText(page)).slice(0, 120);
  const save = page.getByRole('button', { name: '儲存變更' });
  const done = page.getByRole('button', { name: '完成' });
  const saved = waitForDashboardSave(page); // 等後端真的存好再往下（見 waitForDashboardSave 的說明）
  for (let i = 0; i < 8; i += 1) {
    await page.locator('button').filter({ hasText: /^\s*(下一步|儲存變更|完成)\s*$/ }).first().waitFor();
    if (await done.isVisible()) break;
    if (await save.isVisible()) {
      await save.click();
      await done.waitFor();
      break;
    }
    await settingsNext(page).click();
    await page.waitForTimeout(2000);
  }
  await done.click();
  await saved;
  await page.waitForTimeout(1500);
  return header;
}
async function gotoStep2(page: Page, b: Board) {
  await openDashboardSettings(page, b.settings);
  await settingsNext(page).click();
  await page.getByText('人員顯示').first().waitFor();
}
const selectByLabel = (page: Page, label: string) => page.locator(`xpath=//*[normalize-space(text())="${label}"]/following::select[1]`);

test.describe('G3-A 看板', () => {
  test(
    '[WEL-001] 迎賓模式頁面：顯示步驟設定，完成後登入迎賓模式人員辨識成功即顯示相關資訊',
    async ({ page }) => {
      await begin(page, BOARDS.WELCOME);
      await openDashboardSettings(page, BOARDS.WELCOME.settings);
      const steps = await finishWizard(page);
      obs(`設定頁步驟列：${steps}`);
      expect(steps, '設定頁沒有顯示步驟').toMatch(/1\s*公司資訊.*2\s*數位看板.*3\s*人員資訊.*4\s*完成/);
      const s = (await readDashboard(page, 'WELCOME')) as Record<string, string>;
      const names = await knownNames(page);
      // 人員卡片需要即時辨識事件：載入看板後模擬辨識（不依賴環境當下有沒有人被辨識，也不需要真人在鏡頭前）
      let injected = false;
      await loadBoard(page, BOARDS.WELCOME, async () => {
        if (!injected) {
          injected = true;
          await page.waitForTimeout(2500);
          await injectRecognitions(page);
        }
        const t0 = await bodyText(page);
        return names.some((n) => t0.includes(n));
      });
      const t = await bodyText(page);
      obs(`看板文字：${t.slice(0, 160)}`);
      for (const k of ['welcomeword', 'maintitle', 'subtitle']) expect(t, `看板沒有顯示設定的 ${k}「${s[k]}」`).toContain(s[k]);
      expect(names.some((n) => t.includes(n)), '看板沒有顯示任何辨識到的人員姓名').toBe(true);
    },
  );

  test(
    '[OCC-001] 容留看板頁面：步驟設定，進為綠色外框、出為藍色外框、中間顯示場內人數',
    {
      annotation: [
        { type: '判定範圍', description: '「出：藍色外框」需要有人離開的事件；環境的辨識事件只有進入，若看板沒有離開人員則該項未驗證' },
      ],
    },
    async ({ page }) => {
      await begin(page, BOARDS.CAPACITY);
      await openDashboardSettings(page, BOARDS.CAPACITY.settings);
      const steps = await finishWizard(page);
      expect(steps, '設定頁沒有顯示步驟').toMatch(/1\s*公司資訊.*2\s*人員資訊.*3\s*完成/);
      await loadBoard(page, BOARDS.CAPACITY, async () => (await page.locator('.person-card').count()) > 0);
      const inCards = page.locator('.normal-person-card');
      const n = await inCards.count();
      const color = await inCards.first().evaluate((e) => getComputedStyle(e).backgroundColor);
      const amount = Number((await page.locator('.dashboard-header .fz-super-large').first().innerText()).trim());
      obs(`進場卡片 ${n} 張、第一張底色 ${color}、中間數字 ${amount}`);
      const [r, g, b] = (color.match(/\d+/g) ?? []).map(Number);
      expect(g > r && g > b, `進場卡片不是綠色：${color}`).toBe(true);
      expect(amount, '中間顯示的場內人數與進場卡片數不符').toBe(n);
      const leaving = await page.locator('.person-card').count();
      if (leaving === n) test.info().annotations.push({ type: '未驗證', description: '看板沒有離開人員，「出：藍色外框」未驗證' });
    },
  );

  for (const [id, label, field, row] of [
    ['OCC-008', '增加總人數顯示及其設定', 'showAmount', 132],
    ['OCC-009', '隱藏離開人數顯示及其設定', 'showLeaving', 132],
  ] as const) {
    test(
      `[${id}] 容留看板：${label}`,
      async ({ page }) => {
        await begin(page, BOARDS.CAPACITY);
        const lab = field === 'showAmount' ? '顯示總數' : '顯示離開人員';
        for (const choice of ['隱藏', '顯示']) {
          await gotoStep2(page, BOARDS.CAPACITY);
          await selectByLabel(page, lab).selectOption({ label: choice });
          await saveStep2(page);
          const s = (await readDashboard(page, 'CAPACITY')) as Record<string, unknown>;
          expect(s[field], `選「${choice}」後後端設定 ${field} 不符`).toBe(choice === '顯示');
          await loadBoard(page, BOARDS.CAPACITY, async () => (await page.locator('.person-card').count()) > 0);
          if (field === 'showAmount') {
            const cnt = await page.locator('.dashboard-header .fz-super-large').count();
            obs(`總數「${choice}」：標頭大字數量 ${cnt}`);
            expect(cnt, `總數選「${choice}」後看板顯示不符`).toBe(choice === '顯示' ? 2 : 1); // 總數 + 時間
          } else {
            const cols = await page.locator('.person-list-container').first().evaluate((e) => getComputedStyle(e.parentElement!.parentElement!).gridTemplateColumns.split(' ').length);
            obs(`離開人員「${choice}」：版面欄數 ${cols}`);
            expect(cols, `離開人員選「${choice}」後看板版面不符`).toBe(choice === '顯示' ? 2 : 1);
          }
        }
      },
    );
  }

  test(
    '[SEC-002] 保全模式頁面：顯示步驟設定，完成後進入保全模式結果一致',
    async ({ page }) => {
      await begin(page, BOARDS.GUARD);
      await openDashboardSettings(page, BOARDS.GUARD.settings);
      const steps = await finishWizard(page);
      expect(steps, '設定頁沒有顯示步驟').toMatch(/1\s*公司資訊.*2\s*人員資訊.*3\s*完成/);
      const names = await knownNames(page);
      await loadBoard(page, BOARDS.GUARD, async () => { const t = await bodyText(page); return names.some((n) => t.includes(n)); });
      const t = await bodyText(page);
      obs(`保全看板：${t.slice(0, 200)}`);
      for (const part of ['場內人數', '場內人員', '陌生人']) expect(t, `保全看板沒有「${part}」區塊`).toContain(part);
    },
  );

});
