import { test, expect, Page } from '@playwright/test';
import { csvAnnotations } from '../../helpers/csvSource';
import {
  appGetSettings,
  appSetSettings,
  openDashboardSettings,
  readDashboard,
  restoreDashboard,
  saveStep2,
  selectOptions,
  settingsNext,
  snapshotDashboard,
  visibleSelect,
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
  await expect.poll(ready, { timeout: 100000, message: `${b.board} 100 秒內沒有載入出人員` }).toBe(true);
  await page.waitForTimeout(1500);
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
    {
      annotation: csvAnnotations({ row: 116, no: '10.1', category: '【迎賓模式】 > 【迎賓模式】頁面', steps: '1. 顯示其步驟設定\n2. 依序填入設定\n3.完成設定後，登入時選擇迎賓模式，則只要人員辨識成功，即可顯示其相關資訊', expected: '【迎賓模式】根據設定頁面功能正常' }),
    },
    async ({ page }) => {
      test.setTimeout(290000);
      await begin(page, BOARDS.WELCOME);
      await openDashboardSettings(page, BOARDS.WELCOME.settings);
      const steps = await finishWizard(page);
      obs(`設定頁步驟列：${steps}`);
      expect(steps, '設定頁沒有顯示步驟').toMatch(/1\s*公司資訊.*2\s*數位看板.*3\s*人員資訊.*4\s*完成/);
      const s = (await readDashboard(page, 'WELCOME')) as Record<string, string>;
      const names = await knownNames(page);
      await loadBoard(page, BOARDS.WELCOME, async () => { const t0 = await bodyText(page); return names.some((n) => t0.includes(n)); });
      const t = await bodyText(page);
      obs(`看板文字：${t.slice(0, 160)}`);
      for (const k of ['welcomeword', 'maintitle', 'subtitle']) expect(t, `看板沒有顯示設定的 ${k}「${s[k]}」`).toContain(s[k]);
      expect(names.some((n) => t.includes(n)), '看板沒有顯示任何辨識到的人員姓名').toBe(true);
    },
  );

  test(
    '[ATB-001] 點名模式頁面：顯示步驟設定，完成後進入點名看板結果與設定一致',
    {
      annotation: csvAnnotations({ row: 121, no: '10.2', category: '點名模式 > Attendance board頁面', steps: '1. 顯示其步驟設定\n2. 依序填入設定\n3. 完成設定後，登入時選擇點名模式，則只要人員辨識成功，即可顯示其相關資訊', expected: '設定完成後進入點名看板查看與結果一致' }),
    },
    async ({ page }) => {
      test.setTimeout(290000);
      await begin(page, BOARDS.OCCUPANCY);
      await gotoStep2(page, BOARDS.OCCUPANCY);
      expect((await bodyText(page)).slice(0, 120), '設定頁沒有顯示步驟').toMatch(/1\s*公司資訊.*2\s*人員資訊.*3\s*完成/);
      // 分組依據改成另一個選項，完成後看板的排序標籤應與所選一致
      const sel = visibleSelect(page, 1);
      const opts = await selectOptions(sel);
      const cur2 = await sel.evaluate((e) => (e as HTMLSelectElement).selectedOptions[0].textContent?.trim() ?? '');
      const pick = opts.find((o) => o.label !== cur2 && o.label !== '不顯示')!;
      await sel.selectOption(pick.value);
      await saveStep2(page);
      obs(`分組依據由「${cur2}」改為「${pick.label}」`);
      await loadBoard(page, BOARDS.OCCUPANCY, async () => (await page.locator('.person-card').count()) > 0);
      const label = (await page.locator('.attendance-statistics-box').innerText()).replace(/\s+/g, ' ');
      obs(`看板統計區文字：${label}`);
      expect(label, `看板排序標籤與所選分組依據「${pick.label}」不一致`).toContain(pick.label.replace(/^依/, ''));
      expect(await page.locator('.person-card').count()).toBeGreaterThan(0);
    },
  );

  test(
    '[OCC-001] 容留看板頁面：步驟設定，進為綠色外框、出為藍色外框、中間顯示場內人數',
    {
      annotation: [
        ...csvAnnotations({ row: 128, no: '10.3', category: '容留看板 > 頁面', steps: '1. 顯示其步驟設定\n2. 依序填入設定\n3. (重要設定)須將打卡鐘模式打開配合測試Clockin & Clockout\n3.完成設定後，登入時選擇登記出勤模式，則只要人員辨識成功，即可顯示其相關資訊', expected: '背景圖、LOGO設定OK\n看板顯示:\n進:綠色外框\n出:藍色外框\n中間顯示場內人數' }),
        { type: '判定範圍', description: '「出：藍色外框」需要有人離開的事件；環境的辨識事件只有進入，若看板沒有離開人員則該項未驗證' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(290000);
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
      {
        annotation: csvAnnotations({ row, no: '', category: '（延續）> 總人數設定顯示', steps: label, expected: '設定完成後進入容留看板查看結果是否一致' }),
      },
      async ({ page }) => {
        test.setTimeout(290000);
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
    {
      annotation: csvAnnotations({ row: 135, no: '', category: '（延續）> 【保全模式】頁面', steps: '1. 顯示其步驟設定\n2. 依序填入設定', expected: '設定完成後進入保全模式查看結果應一致' }),
    },
    async ({ page }) => {
      test.setTimeout(290000);
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

  test(
    '[SEC-005] 保全 Step 2 人員訊息：多選人員群組、顯示用照片、顯示資訊 1&2 套用並呈現',
    {
      annotation: csvAnnotations({ row: 137, no: '', category: '（延續）> Step 2 人員訊息', steps: '1. 以下設定需確認套用並呈現: 多選人員群組、顯示用照片、顯示資訊1&2', expected: '設定簽到/簽退設備，人員、頁面顯示資訊設定OK' }),
    },
    async ({ page }) => {
      test.setTimeout(290000);
      await begin(page, BOARDS.GUARD);
      await gotoStep2(page, BOARDS.GUARD);
      // 多選人員群組：再加入一個群組
      const box = page.locator('.multiselect').first();
      const before = await box.locator('.multiselect__tag').allInnerTexts();
      await box.locator('.multiselect__tags').click();
      const first = box.locator('.multiselect__option:visible').first();
      const added = ((await first.innerText()) ?? '').trim();
      await first.click();
      await page.keyboard.press('Escape');
      // 顯示用照片、顯示資訊 1、2
      await visibleSelect(page, 2).selectOption({ label: '顯示用的照片' }); // 保全 Step 2 下拉順序：0 簽到、1 簽退、2 顯示用的照片、3 顯示資訊 1、4 顯示資訊 2、5 每日重置
      await visibleSelect(page, 4).selectOption({ label: '人員編號' });
      await saveStep2(page);
      const s = (await readDashboard(page, 'GUARD')) as Record<string, unknown>;
      obs(`群組：${before.join('、')} → 加入「${added}」；後端 displayGroup=${JSON.stringify(s.displayGroup)}、displayPhoto=${s.displayPhoto}、line1=${s.line1}、line2=${s.line2}`);
      expect(s.displayGroup as string[]).toContain(added);
      expect((s.displayGroup as string[]).length).toBeGreaterThan(before.length);
      expect(s.displayPhoto).toBe('DISPLAY');
      expect(s.line2).toBe('ID');
      // 看板呈現：場內人員卡片出現人員編號（顯示資訊 2 = 人員編號）
      await loadBoard(page, BOARDS.GUARD, async () => /A-\d{3}/.test(await bodyText(page)));
      expect(await bodyText(page), '看板沒有呈現人員編號（顯示資訊 2）').toMatch(/A-\d{3}/);
    },
  );

  test(
    '[SEC-006] 保全 Step 2 人員訊息：頁面顯示重置時間如期生效，每日該時間清空所有資訊',
    {
      annotation: [
        ...csvAnnotations({ row: 137, no: '', category: '（延續）> Step 2 人員訊息', steps: '2. 頁面顯示重置時間如期生效，每日該時間清空所有資訊', expected: '設定簽到/簽退設備，人員、頁面顯示資訊設定OK' }),
        { type: '判定範圍', description: '不等到每日重置時間：把重置時間設為「目前小時」，看板統計只應包含該時間之後的資料，圖表中早於重置時間的小時應為 0；對照重置時間 00 時時早於目前小時的小時有資料' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(290000);
      await begin(page, BOARDS.GUARD);
      const hour = new Date().getHours();
      expect(hour, '現在是凌晨 0 點，無法驗證「早於重置時間的小時為 0」').toBeGreaterThan(1);
      const readIn = async () => (await vmData<number[]>(page, 'chartDataIn')) ?? [];
      // 對照組：重置 00 時 → 早於目前小時的小時有資料
      await loadBoard(page, BOARDS.GUARD, async () => ((await readIn()).reduce((a, b) => a + b, 0)) > 0);
      const base = await readIn();
      // 實驗組：重置設為目前小時
      await gotoStep2(page, BOARDS.GUARD);
      await selectByLabel(page, '每日重置 (時)').selectOption(String(hour).padStart(2, '0'));
      await saveStep2(page);
      // 重置後目前這一小時可能還沒有任何進場（總量為 0 也是正確結果），所以只等圖表資料載入完成
      await loadBoard(page, BOARDS.GUARD, async () => (await readIn()).length > 0);
      const after = await readIn();
      obs(`重置 00 時：各小時進場 ${JSON.stringify(base)}；重置 ${hour} 時：${JSON.stringify(after)}`);
      expect(base.slice(0, hour).some((v) => v > 0), '對照組早於目前小時沒有資料，無法比較').toBe(true);
      // 重置後圖表以重置時間為起點重排（第 0 根柱＝重置那一小時）：早於重置時間的資料被清空，總量應只剩目前這一小時
      const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
      expect(sum(after), '重置後總量沒有比重置前少很多（早於重置時間的資料沒有清空）').toBeLessThan(sum(base) * 0.3);
      if (base[hour] > 0) expect(Math.abs(after[0] - base[hour]) / base[hour], '重置後第 0 根柱應約等於重置前該小時的量').toBeLessThan(0.2);
      else expect(after[0], '重置前該小時沒有進場，重置後第 0 根柱也應為 0').toBe(0);
    },
  );
});
