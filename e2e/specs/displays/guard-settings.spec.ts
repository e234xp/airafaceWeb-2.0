import { test, expect, Page } from '../../helpers/test';
import { csvAnnotations } from '../../helpers/csvSource';
import { openDashboardSettings, restoreDashboard, saveStep2, selectOptions, settingsNext, snapshotDashboard, visibleSelect } from '../../helpers/dashboard';

// 來源 E2E-TEST-PLAN.md：SEC-007（簽到／簽退設備決定進出狀態）、SEC-020（面板人員的照片與資訊與系統設定相同）。
// 保全看板設定為全系統共用：測項前取得 GUARD 快照，結束（含失敗）以獨立 Admin 環境還原。環境有持續的辨識事件，看板載入約 30~100 秒。
const SETTINGS = '/#/displays/modifyguardcontrolsetting';
const BOARD = '/#/guardmode';
let snap: Record<string, unknown> | null = null;
test.beforeEach(async ({ page }) => {
  snap = await snapshotDashboard(page, SETTINGS, 'GUARD');
});
test.afterEach(async ({ browser }) => {
  await restoreDashboard(browser, SETTINGS, 'GUARD', snap);
  snap = null;
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
async function gotoStep2(page: Page) {
  await openDashboardSettings(page, SETTINGS);
  await settingsNext(page).click();
  await page.getByText('人員顯示').first().waitFor();
}
async function loadBoard(page: Page, ready: () => Promise<boolean>) {
  await page.goto(BOARD);
  await page.reload();
  await expect.poll(ready, { timeout: 120000, message: '保全看板 120 秒內沒有載入出人員' }).toBe(true);
  await page.waitForTimeout(2500);
}
const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
const personCards = (page: Page) => page.locator('.grid-2-6').nth(0).locator('> div');

test.describe('SEC 保全設定與看板一致', () => {
  test(
    '[SEC-007] 保全 Step 2 人員訊息：人員與陌生人進出狀態依進出攝影機設定，場內人員如實呈現',
    {
      annotation: [
        ...csvAnnotations({ row: 137, no: '', category: '（延續）> Step 2 人員訊息', steps: '3. 人員與陌生人進出狀態依照進出攝影機設定，場內人員如實呈現', expected: '設定簽到/簽退設備，人員、頁面顯示資訊設定OK' }),
        { type: '判定範圍', description: '以「簽到／簽退設備互換」驗證：看板圖表的進／出人次應跟著互換（環境的辨識事件由既有模擬攝影機產生，無法逐筆對照）' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(295000);
      const readChart = async () => ({ inn: (await vmData<number[]>(page, 'chartDataIn')) ?? [], out: (await vmData<number[]>(page, 'chartDataOut')) ?? [] });
      const ready = async () => sum((await readChart()).inn) + sum((await readChart()).out) > 0;
      // 1) 原設定
      await loadBoard(page, ready);
      const a = await readChart();
      // 2) 簽到／簽退互換
      await gotoStep2(page);
      const selIn = visibleSelect(page, 0);
      const selOut = visibleSelect(page, 1);
      const vIn = await selIn.evaluate((e) => (e as HTMLSelectElement).value);
      const vOut = await selOut.evaluate((e) => (e as HTMLSelectElement).value);
      const labels = await selectOptions(selIn);
      obs(`簽到設備 ${labels.find((o) => o.value === vIn)?.label}、簽退設備 ${labels.find((o) => o.value === vOut)?.label}`);
      expect(vIn, '簽到與簽退原本就是同一個設備，無法互換驗證').not.toBe(vOut);
      // 簽到與簽退的設備清單互相排除已選的設備（同一台不能同時是簽到與簽退），所以互換要先清空簽到，再依序設定
      await selIn.selectOption('');
      await selOut.selectOption(vIn);
      await selIn.selectOption(vOut);
      await saveStep2(page);
      await loadBoard(page, ready);
      const b = await readChart();
      const h = new Date().getHours();
      const done = (arr: number[]) => arr.filter((_, i) => i !== h);
      obs(`原設定：進 ${sum(done(a.inn))} 出 ${sum(done(a.out))}；互換後：進 ${sum(done(b.inn))} 出 ${sum(done(b.out))}（不含目前小時）`);
      const close = (x: number, y: number) => Math.abs(x - y) <= Math.max(5, y * 0.25);
      expect(close(sum(done(b.inn)), sum(done(a.out))), '互換後「進」的人次沒有等於原本「出」的人次').toBe(true);
      expect(close(sum(done(b.out)), sum(done(a.inn))), '互換後「出」的人次沒有等於原本「進」的人次').toBe(true);
    },
  );

  test(
    '[SEC-020] 保全 Step 3 面板操作：人員可選擇顯示照片與資訊並與系統設定相同',
    {
      annotation: csvAnnotations({ row: 146, no: '', category: '（延續）> Step 3 面板操作', steps: '3. 人員可選擇顯示照片與資訊並與系統設定相同', expected: '面板操作正確' }),
    },
    async ({ page }) => {
      test.setTimeout(295000);
      const persons = await (async () => {
        await page.goto(SETTINGS);
        await page.reload();
        await page.waitForTimeout(2500);
        return page.evaluate(async () => {
          const el = Array.from(document.querySelectorAll('*')).find((e) => (e as unknown as { __vue__?: unknown }).__vue__) as unknown as { __vue__: { $root: { $globalFindPersonWithoutPhoto: (a: string, b: number, c: number) => Promise<{ data: { person_list: Array<{ name: string; id: string }> } }> } } };
          const r = await el.__vue__.$root.$globalFindPersonWithoutPhoto('', 0, 3000);
          return r.data.person_list.map((p) => ({ name: p.name, id: p.id }));
        });
      })();
      const nameOf = new Map(persons.map((p) => [p.id, p.name]));
      const cardInfo = () =>
        personCards(page).evaluateAll((els) =>
          els.map((e) => ({
            lines: (e as HTMLElement).innerText.split('\n').map((s) => s.trim()).filter(Boolean),
            imgs: Array.from(e.querySelectorAll('img')).map((i) => (i as HTMLImageElement).src.length),
          })),
        );
      const readyCards = async () => (await personCards(page).count()) > 0;

      const combos = [
        { photo: '顯示用的照片', l1: '人員姓名', l2: '人員編號', tag: '姓名＋編號＋照片' },
        { photo: '不顯示', l1: '不顯示', l2: '人員編號', tag: '只顯示編號、不顯示照片' },
      ];
      for (const c of combos) {
        await gotoStep2(page);
        const photoOpts = (await selectOptions(visibleSelect(page, 2))).map((o) => o.label);
        const lineOpts = (await selectOptions(visibleSelect(page, 3))).map((o) => o.label);
        obs(`顯示用照片選項：${photoOpts.join('／')}；顯示資訊選項：${lineOpts.join('／')}`);
        await visibleSelect(page, 2).selectOption({ label: c.photo });
        await visibleSelect(page, 3).selectOption({ label: c.l1 });
        await visibleSelect(page, 4).selectOption({ label: c.l2 });
        await saveStep2(page);
        await loadBoard(page, readyCards);
        const cards = await cardInfo();
        obs(`${c.tag}：看板 ${cards.length} 張卡片；第一張 ${JSON.stringify(cards[0])}`);
        expect(cards.length).toBeGreaterThan(0);
        for (const card of cards) {
          const idLine = card.lines.find((l) => nameOf.has(l));
          if (c.l1 === '人員姓名') {
            expect(idLine, `卡片沒有顯示人員編號：${JSON.stringify(card.lines)}`).toBeTruthy();
            expect(card.lines, `卡片的姓名與人員編號 ${idLine} 不符`).toContain(nameOf.get(idLine as string));
          } else {
            expect(idLine, `顯示資訊 2 設為人員編號時卡片沒有編號：${JSON.stringify(card.lines)}`).toBeTruthy();
            expect(card.lines.filter((l) => persons.some((p) => p.name === l)), '顯示資訊 1 設為不顯示，卡片仍顯示姓名').toEqual([]);
          }
        }
        const photoSizes = new Set(cards.flatMap((x) => x.imgs));
        if (c.photo === '不顯示') expect(photoSizes.size, '照片設為「不顯示」時，卡片仍顯示各自不同的真人照片').toBeLessThanOrEqual(1);
        else expect(photoSizes.size, '照片設為顯示時，卡片沒有照片').toBeGreaterThan(0);
      }
    },
  );
});
