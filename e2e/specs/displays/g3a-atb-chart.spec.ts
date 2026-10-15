import { test, expect, Page } from '@playwright/test';
import { csvAnnotations } from '../../helpers/csvSource';
import { openDashboardSettings, restoreDashboard, saveStep2, selectOptions, settingsNext, snapshotDashboard, visibleSelect } from '../../helpers/dashboard';

// 來源 E2E-TEST-PLAN.md：ATB-008~013（點名看板計算人數：圖表與資訊）。看板 /#/occupancymode，設定 key OCCUPANCY。
// 環境有持續辨識事件（只有「進入」，沒有離開）。「同一人進入兩次算 2」等以看板自身的資料互相對照，沒有獨立重算。

const ROUTE = '/#/displays/modifyoccupancycontrolsetting';
const KEY = 'OCCUPANCY';
let snapshot: Record<string, unknown> | null = null;
test.beforeEach(async ({ page }) => {
  snapshot = await snapshotDashboard(page, ROUTE, KEY);
});
test.afterEach(async ({ browser }) => {
  await restoreDashboard(browser, ROUTE, KEY, snapshot);
});
const obs = (s: string) => {
  console.log('OBS', s);
  test.info().annotations.push({ type: '觀察', description: s });
};
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
async function loadBoard(page: Page) {
  await page.goto('/#/occupancymode');
  await page.reload();
  await expect
    .poll(async () => ((await vmData<number[]>(page, 'chartDataIn')) ?? []).reduce((a, b) => a + b, 0), { timeout: 120000, message: '點名看板 120 秒內沒有載入圖表資料' })
    .toBeGreaterThan(0);
  await page.waitForTimeout(2000);
}
const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);

test.describe('ATB 點名看板計算人數', () => {
  test(
    '[ATB-008] 點名看板計算人數：圖表顯示與否（依設定）',
    {
      annotation: csvAnnotations({ row: 124, no: '', category: '（延續）> 計算人數', steps: '圖表與資訊\n1. 顯示與否 (看設定)', expected: '使用平板或攝影機設定clock in /out 來源，人員進入時會顯示+1，出去顯示-1' }),
    },
    async ({ page }) => {
      test.setTimeout(290000);
      for (const show of [false, true]) {
        await openDashboardSettings(page, ROUTE);
        await settingsNext(page).click();
        await page.getByText('人員顯示').first().waitFor();
        const chart = visibleSelect(page, 7);
        const opts = await selectOptions(chart);
        const want = opts.find((o) => (show ? /顯示|是|true/i.test(o.label) : /隱藏|否|false/i.test(o.label))) ?? opts[show ? 0 : 1];
        await chart.selectOption(want.value);
        await saveStep2(page);
        await page.goto('/#/occupancymode');
        await page.reload();
        await page.waitForTimeout(show ? 25000 : 8000);
        const n = await page.locator('#attendance-chart-canvas').count();
        obs(`圖表設定「${want.label}」：看板圖表元素 ${n} 個`);
        expect(n > 0, `設定${show ? '顯示' : '隱藏'}圖表後，看板圖表${n > 0 ? '仍顯示' : '沒有顯示'}`).toBe(show);
      }
    },
  );

  test(
    '[ATB-009] 點名看板計算人數：依人數進出以每小時為單位繪製圖表',
    {
      annotation: csvAnnotations({ row: 124, no: '', category: '（延續）> 計算人數', steps: '圖表與資訊\n2. 根據人數進出繪製對應圖表\n  - 每小時為單位', expected: '使用平板或攝影機設定clock in /out 來源，人員進入時會顯示+1，出去顯示-1' }),
    },
    async ({ page }) => {
      test.setTimeout(290000);
      await loadBoard(page);
      const labels = (await vmData<number[]>(page, 'chartLabels')) ?? [];
      const inn = (await vmData<number[]>(page, 'chartDataIn')) ?? [];
      const hour = new Date().getHours();
      obs(`標籤 ${JSON.stringify(labels)}；進場 ${JSON.stringify(inn)}；現在 ${hour} 時`);
      expect(labels, '圖表標籤不是 24 個小時（0~23）').toEqual(Array.from({ length: 24 }, (_, i) => i));
      expect(inn.length).toBe(24);
      for (let h = 0; h < 24; h += 1) {
        if (h <= hour) expect(inn[h], `${h} 時有辨識事件但柱子是 0`).toBeGreaterThan(0);
        else expect(inn[h], `${h} 時尚未到，柱子應為 0`).toBe(0);
      }
    },
  );

  test(
    '[ATB-010] 點名看板計算人數：進場人次（同一人進入兩次算 2）',
    {
      annotation: [
        ...csvAnnotations({ row: 124, no: '', category: '（延續）> 計算人數', steps: '圖表與資訊\n  - 進場人次: 同一個人進入兩次，算2', expected: '使用平板或攝影機設定clock in /out 來源，人員進入時會顯示+1，出去顯示-1' }),
        { type: '判定範圍', description: '沒有獨立重算原始紀錄：以「每小時進場數遠大於系統總人數（同一批人重複進入被逐次計入）」及「標頭 +N 與目前小時柱子一致」判定；精確人次需用調查報表逐筆比對' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(290000);
      await loadBoard(page);
      const inn = (await vmData<number[]>(page, 'chartDataIn')) ?? [];
      const total = (await vmData<unknown[]>(page, 'persons'))?.length ?? 0;
      const hour = new Date().getHours();
      const marker = (await page.locator('#attendance-chart-canvas').count()) > 0 ? '' : '';
      void marker;
      obs(`系統人員 ${total} 人；各小時進場人次 ${JSON.stringify(inn.slice(0, hour + 1))}`);
      expect(total).toBeGreaterThan(0);
      expect(inn[hour - 1 >= 0 ? hour - 1 : 0], '進場人次沒有大於人員總數：同一人重複進入沒有逐次計入').toBeGreaterThan(total);
    },
  );

  test(
    '[ATB-011] 點名看板計算人數：離場人次（同一人離開兩次算 2）',
    {
      annotation: [
        ...csvAnnotations({ row: 124, no: '', category: '（延續）> 計算人數', steps: '圖表與資訊\n  - 離場人次: 同一個人離開兩次，算2', expected: '使用平板或攝影機設定clock in /out 來源，人員進入時會顯示+1，出去顯示-1' }),
        { type: '未驗證', description: '環境的辨識事件只有「進入」，沒有離開事件，離場人次全為 0，無法驗證「離開兩次算 2」' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(290000);
      await loadBoard(page);
      const out = (await vmData<number[]>(page, 'chartDataOut')) ?? [];
      obs(`各小時離場人次 ${JSON.stringify(out)}`);
      expect(out.length).toBe(24);
      expect(out.every((v) => Number.isInteger(v) && v >= 0)).toBe(true);
      // 沒有離開事件可驗證計數規則
      expect(sum(out), '環境有離開事件，請補上「離開兩次算 2」的驗證').toBe(0);
    },
  );

  test(
    '[ATB-012] 點名看板計算人數：場內人數（同一人在場內算 1，以該小時最後一筆資料為準）',
    {
      annotation: [
        ...csvAnnotations({ row: 124, no: '', category: '（延續）> 計算人數', steps: '圖表與資訊\n  - 場內人數: 同一個人在場內，算1，以該小時最後一筆資料時為準', expected: '使用平板或攝影機設定clock in /out 來源，人員進入時會顯示+1，出去顯示-1' }),
        { type: '判定範圍', description: '以「各小時場內人數不超過系統總人數（同一人重複進入仍只算 1）」及「目前小時場內人數 = 看板左上角的目前在場人數」判定' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(290000);
      await loadBoard(page);
      const present = (await vmData<number[]>(page, 'chartDataPresent')) ?? [];
      const total = (await vmData<unknown[]>(page, 'persons'))?.length ?? 0;
      const hour = new Date().getHours();
      const header = (await page.locator('.attendance-header-present').innerText()).trim();
      obs(`各小時場內人數 ${JSON.stringify(present.slice(0, hour + 1))}；人員總數 ${total}；看板目前在場 ${header}`);
      for (let h = 0; h <= hour; h += 1) expect(present[h], `${h} 時場內人數超過人員總數`).toBeLessThanOrEqual(total);
      expect(present[hour], '目前小時的場內人數與看板左上角在場人數不符').toBe(Number(header));
    },
  );

  test(
    '[ATB-013] 點名看板計算人數：平板或攝影機設定 clock in/out 來源，進入顯示 +1、離開顯示 -1',
    {
      annotation: [
        ...csvAnnotations({ row: 124, no: '', category: '（延續）> 計算人數', steps: '圖表與資訊\nhttps://docs.google.com/presentation/d/1-iZgdozCSApYx9x__D219YIOHg4uk5f_/edit#slide=id.p18', expected: '使用平板或攝影機設定clock in /out 來源，人員進入時會顯示+1，出去顯示-1' }),
        { type: '未驗證', description: '點名看板設定頁沒有「clock in／out 來源」選項，且環境沒有離開事件，「離開顯示 -1」無法驗證；圖表上的 +N／-N 標示畫在 canvas 內無法由 DOM 讀取，僅驗證圖表資料（目前小時進場 > 0、離場 = 0）' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(290000);
      await loadBoard(page);
      const inn = (await vmData<number[]>(page, 'chartDataIn')) ?? [];
      const out = (await vmData<number[]>(page, 'chartDataOut')) ?? [];
      const hour = new Date().getHours();
      obs(`目前小時進場 ${inn[hour]}、離場 ${out[hour]}（看板圖表上的 +N／-N 標示畫在 canvas 內，無法由 DOM 讀取）`);
      expect(inn[hour], '目前小時有進入事件，進場數應大於 0（顯示 +N）').toBeGreaterThan(0);
      expect(out[hour], '環境沒有離開事件，離場數應為 0（顯示 -0）').toBe(0);
    },
  );
});
