import { test, expect, Page } from '../../helpers/test';
import { INVESTIGATION, openReportPage, pageRowTexts, searchButton, setRange } from '../../helpers/reports';

// 來源 E2E-TEST-PLAN.md：保全看板（/#/guardmode）面板操作與備註：SEC-018~024。
// 環境有持續的辨識事件：場內人員與陌生人都有資料。備註／確認會呼叫 addcommand 寫入該筆辨識紀錄的備註（無法復原，使用者已同意產生紀錄）。
// 保全看板設定不在本檔修改（SEC-020 另行取快照還原）。

const obs = (s: string) => {
  console.log('OBS', s);
  test.info().annotations.push({ type: '觀察', description: s });
};
const bodyText = async (page: Page) => (await page.locator('body').innerText()).replace(/\s+/g, ' ');

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
    const el = Array.from(document.querySelectorAll('*')).find((e) => (e as unknown as { __vue__?: unknown }).__vue__) as unknown as { __vue__: { $root: { $globalFindPersonWithoutPhoto: (a: string, b: number, c: number) => Promise<{ data: { person_list: Array<{ name: string; id: string }> } }> } } };
    const r = await el.__vue__.$root.$globalFindPersonWithoutPhoto('', 0, 3000);
    return r.data.person_list.map((p) => ({ name: p.name, id: p.id }));
  });

async function loadGuard(page: Page) {
  await page.goto('/#/guardmode');
  await page.reload();
  await expect
    .poll(async () => {
      const t = await bodyText(page);
      const s = (await vmData<unknown[]>(page, 'strangers')) ?? [];
      return /場內人員/.test(t) && s.length > 0 && (await page.locator('.grid-2-6').count()) >= 2;
    }, { timeout: 120000, message: '保全看板 120 秒內沒有載入出場內人員與陌生人' })
    .toBe(true);
  await page.waitForTimeout(2500);
}
const personCards = (page: Page) => page.locator('.grid-2-6').nth(0).locator('> div');
const strangerCards = (page: Page) => page.locator('.grid-2-6').nth(1).locator('> div');
const chartBtn = (page: Page, text: string) => page.locator('.chart-btn').filter({ hasText: text }).first();
const selectedText = async (page: Page) => ((await bodyText(page)).match(/(\d+) \/ (\d+) (?:已選擇|已選)/) ?? []).slice(1, 3).map(Number);
const modal = (page: Page) => page.locator('.modal-main').first();

test.describe('SEC 保全看板面板', () => {
  test(
    '[SEC-019] 保全 Step 3 面板操作：展開陌生人員並執行選取/批量選取/註解/批量註解',
    {
      annotation: [
        { type: '判定範圍', description: '本項只開啟「註解／批量註解」對話框後取消，不送出；實際寫入備註的驗證見 SEC-022' },
      ],
    },
    async ({ page }) => {
      await loadGuard(page);
      await page.getByText('展開').nth(1).click();
      await expect(page.locator('.grid-7-6').first()).toBeVisible();
      const cards = page.locator('.grid-7-6').first().locator('> div');
      const n = await cards.count();
      expect(n).toBeGreaterThan(1);
      // 選取：點一張卡片 → 已選 1；再點取消選取
      expect(await selectedText(page)).toEqual([0, expect.any(Number)]);
      await cards.nth(0).click();
      expect((await selectedText(page))[0], '點選卡片後已選數量不是 1').toBe(1);
      // 註解（單筆）：開啟對話框，有備註輸入框與取消／確認
      await chartBtn(page, '備註').click();
      await expect(modal(page)).toBeVisible();
      await expect(modal(page).locator('input[type=text], input:not([type])').first()).toBeVisible();
      obs(`單筆註解對話框：${(await modal(page).innerText()).replace(/\s+/g, ' ').slice(0, 100)}`);
      await modal(page).getByText('取消').first().click();
      await expect(modal(page)).toBeHidden();
      // 批量選取：全選 → 已選數量 = 目前頁面卡片數
      await chartBtn(page, '全選').click();
      const [sel] = await selectedText(page);
      expect(sel, '全選後已選數量不等於頁面卡片數').toBe(n);
      // 批量註解：對話框顯示「已選 N 筆」
      await chartBtn(page, '備註').click();
      await expect(modal(page)).toBeVisible();
      const txt = (await modal(page).innerText()).replace(/\s+/g, ' ');
      obs(`批量註解對話框：${txt.slice(0, 100)}`);
      expect(txt, '批量註解對話框沒有顯示已選筆數').toContain(String(n));
      await modal(page).getByText('取消').first().click();
      // 取消選取
      await chartBtn(page, '取消').click();
      expect((await selectedText(page))[0]).toBe(0);
    },
  );

  test(
    '[SEC-021] 保全 Step 3 面板操作：陌生人顯示抓拍照片',
    async ({ page }) => {
      await loadGuard(page);
      const cards = strangerCards(page);
      const n = await cards.count();
      expect(n).toBeGreaterThan(0);
      for (let i = 0; i < n; i += 1) {
        const img = cards.nth(i).locator('img').first();
        await expect(img, `第 ${i + 1} 張陌生人卡片沒有照片`).toBeVisible();
        const ok = await img.evaluate((e) => (e as HTMLImageElement).complete && (e as HTMLImageElement).naturalWidth > 20 && (e as HTMLImageElement).src.length > 500);
        expect(ok, `第 ${i + 1} 張陌生人卡片的抓拍照片沒有載入成功`).toBe(true);
      }
      obs(`${n} 張陌生人卡片皆有抓拍照片`);
    },
  );

  for (const [id, steps, expected, row] of [
    ['SEC-022', '1.勾選人員可填寫備註，於報表中備註顯示', '備註顯示成功', 147],
    ['SEC-023', '2.勾選或確認人員為人員,訪客,陌生人，該人員可於調查報表中顯示', '調查有顯示資料', 148],
  ] as const) {
    test(
      `[${id}] 保全備註：${id === 'SEC-022' ? '勾選人員可填寫備註，於報表中備註顯示' : '勾選或確認人員為人員/訪客/陌生人，該人員於調查報表中顯示'}`,
      {
        annotation: [
          { type: '安全措施', description: '備註內容以 e2e 開頭並含時間戳；只對陌生人紀錄下指令，不動任何既有人員資料；指令寫入後無法復原（使用者已同意產生紀錄）' },
        ],
      },
      async ({ page }) => {
        const types = id === 'SEC-022' ? ['陌生人'] : ['陌生人', '訪客', '員工'];
        await loadGuard(page);
        const done: Array<{ ts: number; remark: string; type: string }> = [];
        for (const type of types) {
          const list = (await vmData<Array<{ verify_uuid: string; timestamp: number }>>(page, 'strangers')) ?? [];
          const target = list[done.length];
          expect(target, '看板沒有可用的陌生人紀錄').toBeTruthy();
          const remark = `e2e備註${type}${Date.now().toString(36).slice(-5)}`;
          await chartBtn(page, '取消').click();
          // 直接以資料點選：找到該陌生人在目前頁面的卡片（依清單順序）
          const idx = list.findIndex((s) => s.verify_uuid === target.verify_uuid);
          const cards = strangerCards(page);
          if (idx >= (await cards.count())) test.skip(true, '目標陌生人不在目前頁面');
          await cards.nth(idx).click();
          expect((await selectedText(page))[0]).toBe(1);
          await chartBtn(page, '備註').click();
          await expect(modal(page)).toBeVisible();
          await modal(page).getByText(type, { exact: true }).first().click();
          await modal(page).locator('input[type=text], input:not([type])').first().fill(remark);
          await modal(page).getByText('確定', { exact: true }).click();
          await expect
            .poll(async () => ((await vmData<Array<{ verify_uuid: string }>>(page, 'strangers')) ?? []).some((s) => s.verify_uuid === target.verify_uuid), { timeout: 30000, message: '送出後該陌生人沒有從面板移除' })
            .toBe(false);
          done.push({ ts: target.timestamp, remark, type });
        }
        obs(`已送出：${JSON.stringify(done)}`);
        // 調查報表：每一筆都查得到，備註欄顯示所填內容
        for (const d of done) {
          const t = new Date(d.ts);
          const p2 = (n: number) => String(n).padStart(2, '0');
          const fmt = (x: Date) => `${x.getFullYear()}-${p2(x.getMonth() + 1)}-${p2(x.getDate())} ${p2(x.getHours())}:${p2(x.getMinutes())}:${p2(x.getSeconds())}`;
          const end = new Date(d.ts + 2000);
          // 規格只要求「該人員可於調查報表中顯示」：先查預期類別，查不到再查其他類別並記錄實際出現的類別
          const expectCat = d.type === '員工' ? '人員' : d.type;
          let found = false;
          for (const cat of [expectCat, ...['人員', '訪客', '陌生人'].filter((c) => c !== expectCat)]) {
            for (let i = 0; i < 2 && !found; i += 1) {
              await openReportPage(page, INVESTIGATION);
              await page.waitForTimeout(3000);
              await page.locator('select:visible').first().selectOption({ label: cat });
              await setRange(page, fmt(new Date(d.ts - 1000)), fmt(end));
              await searchButton(page).click();
              await page.waitForTimeout(4000);
              const rows = await pageRowTexts(page);
              found = rows.some((r) => r.includes(d.remark));
              obs(`確認為${d.type}：在類別「${cat}」查到 ${rows.length} 列，備註是否顯示：${found}`);
            }
            if (found) break;
          }
          expect(found, `調查報表沒有顯示備註「${d.remark}」（確認為${d.type}）`).toBe(true);
        }
      },
    );
  }
});
