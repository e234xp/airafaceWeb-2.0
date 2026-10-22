import { test, expect, Page } from '../../helpers/test';
import { csvAnnotations } from '../../helpers/csvSource';
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
    '[SEC-018] 保全 Step 3 面板操作：執行保全模式，可展開場內人員',
    {
      annotation: csvAnnotations({ row: 146, no: '', category: '（延續）> Step 3 面板操作', steps: '1. 至登入頁面，執行保全模式，可展開場內人員', expected: '面板操作正確' }),
    },
    async ({ page }) => {
      test.setTimeout(290000);
      await loadGuard(page);
      const names = (await knownNames(page)).map((p) => p.name);
      const before = await personCards(page).count();
      expect(before, '場內人員區沒有人員卡片').toBeGreaterThan(0);
      // 展開：場內人員區放大（出現 7 欄大版面），統計圖隱藏
      await page.getByText('展開').first().click();
      await expect(page.locator('.grid-7-6').first()).toBeVisible();
      const expanded = await page.locator('.grid-7-6').first().locator('> div').count();
      obs(`場內人員：收合 ${before} 張、展開 ${expanded} 張`);
      expect(expanded).toBeGreaterThan(0);
      const t = await bodyText(page);
      expect(names.some((n) => t.includes(n)), '展開後的場內人員不是系統內的人員').toBe(true);
      // 再按一次收合回到原版面
      await page.getByText('折疊').first().click();
      await expect(page.locator('.grid-2-6').first()).toBeVisible();
    },
  );

  test(
    '[SEC-019] 保全 Step 3 面板操作：展開陌生人員並執行選取/批量選取/註解/批量註解',
    {
      annotation: [
        ...csvAnnotations({ row: 146, no: '', category: '（延續）> Step 3 面板操作', steps: '2. 可展開陌生人員，並執行選取/批量選取/ 註解/ 批量註解', expected: '面板操作正確' }),
        { type: '判定範圍', description: '本項只開啟「註解／批量註解」對話框後取消，不送出；實際寫入備註的驗證見 SEC-022' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(290000);
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
    {
      annotation: csvAnnotations({ row: 146, no: '', category: '（延續）> Step 3 面板操作', steps: '4 .陌生人顯示抓拍照片', expected: '面板操作正確' }),
    },
    async ({ page }) => {
      test.setTimeout(290000);
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

  test(
    '[SEC-024] 保全重開維持當前人員狀態：人員與陌生人在視窗重啟後維持當前出席狀態',
    {
      annotation: csvAnnotations({ row: 149, no: '', category: '（延續）> 重開維持當前人員狀態', steps: '1.人員與陌生人在視窗重啟後依然維持當前出席狀態', expected: '重開後狀態不變' }),
    },
    async ({ page }) => {
      test.setTimeout(290000);
      await loadGuard(page);
      const snapPersons = async () => ((await vmData<Array<{ name: string }>>(page, 'currentPersons')) ?? []).map((p) => p.name).sort();
      const snapStrangers = async () => ((await vmData<Array<{ verify_uuid: string }>>(page, 'strangers')) ?? []).map((s) => s.verify_uuid);
      const p1 = await snapPersons();
      const s1 = (await snapStrangers()).slice(0, 20);
      obs(`重開前：場內人員 ${JSON.stringify(p1)}、陌生人 ${s1.length} 筆（取前 20）`);
      await loadGuard(page); // 視窗重啟（重新載入）
      const p2 = await snapPersons();
      const s2 = await snapStrangers();
      obs(`重開後：場內人員 ${JSON.stringify(p2)}、陌生人 ${s2.length} 筆`);
      expect(p1.length).toBeGreaterThan(0);
      // 人員：重開前在場內的人，重開後仍在場內
      for (const n of p1) expect(p2, `重開後場內人員少了「${n}」`).toContain(n);
      // 陌生人：重開前的陌生人紀錄仍在清單中（沒有因重開而消失）
      const missing = s1.filter((id) => !s2.includes(id));
      expect(missing.length, `重開後有 ${missing.length} 筆原有陌生人不見了`).toBeLessThanOrEqual(Math.ceil(s1.length * 0.2)); // 容許新資料擠出最舊的幾筆
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
          ...csvAnnotations({ row, no: '', category: id === 'SEC-022' ? '（延續）> 備註' : '（延續）> （空白）', steps, expected }),
          { type: '安全措施', description: '備註內容以 e2e 開頭並含時間戳；只對陌生人紀錄下指令，不動任何既有人員資料；指令寫入後無法復原（使用者已同意產生紀錄）' },
        ],
      },
      async ({ page }) => {
        test.setTimeout(295000);
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
