import { test, expect, Page } from '@playwright/test';
import { csvAnnotations } from '../../helpers/csvSource';
import { appGetSettings, appSetSettings, restoreDashboard, snapshotDashboard } from '../../helpers/dashboard';
import { gotoGroups, groupRow, searchGroups } from '../../helpers/groups';
import { cleanupPersons, createPersonViaUI, uniquePersonId } from '../../helpers/persons';

// 來源 E2E-TEST-PLAN.md：ATB-014~020（點名看板的群組檢視／人員檢視與跳轉）。設定頁 /displays/modifyoccupancycontrolsetting，設定資料 key＝OCCUPANCY。
// 看板設定為全系統共用：每個測項前取得快照，結束（含失敗）以獨立 Admin 環境還原。看板載入需約 30~45 秒。
// 以產品 API 套用設定（等同設定頁儲存送出的資料）作為前置條件；驗證的是看板實際呈現。

const ROUTE = '/#/displays/modifyoccupancycontrolsetting';
const KEY = 'OCCUPANCY';
let snapshot: Record<string, unknown> | null = null;
const persons: string[] = [];

test.beforeEach(async ({ page }) => {
  snapshot = await snapshotDashboard(page, ROUTE, KEY);
});
test.afterEach(async ({ browser }) => {
  await restoreDashboard(browser, ROUTE, KEY, snapshot);
  await cleanupPersons(browser, persons.splice(0));
});

async function applySettings(page: Page, patch: Record<string, unknown>) {
  await page.goto(ROUTE);
  await page.reload();
  await page.waitForTimeout(2500);
  const all = await appGetSettings(page);
  all[KEY] = { ...all[KEY], ...patch };
  await appSetSettings(page, all);
  const back = (await appGetSettings(page))[KEY];
  for (const [k, v] of Object.entries(patch)) {
    if (JSON.stringify(back[k]) !== JSON.stringify(v)) throw new Error(`設定 ${k} 沒有被後端保存：送出 ${JSON.stringify(v)}、讀回 ${JSON.stringify(back[k])}`);
  }
}

const cards = (page: Page) => page.locator('.person-card');
const pagerText = async (page: Page) => ((await page.locator('.pager-text').innerText()) ?? '').trim();
const totalText = async (page: Page) => (((await page.locator('.attendance-header-total').innerText()) ?? '').replace(/\D/g, ''));

/** 開啟點名看板並等到人員卡片出現（載入需約 30~45 秒）。 */
async function loadBoard(page: Page) {
  await page.goto('/#/occupancymode');
  await page.reload();
  await expect.poll(async () => cards(page).count(), { timeout: 100000, message: '點名看板 100 秒內沒有載入任何人員卡片' }).toBeGreaterThan(0);
  await page.waitForTimeout(1500);
}

/** 群組檢視：規格的 group view 應列出來源群組、可跳轉、可點選。目前看板的樣板是否有群組檢視區塊。 */
async function groupViewState(page: Page) {
  return page.evaluate(() => {
    const body = document.body.innerText;
    const el = document.querySelector('.summary-box, [class*="summary"], [class*="group-card"], [class*="group-view"]');
    return { hasBlock: !!el, mentionsAllPerson: /All Person/.test(body), sortLabel: (document.querySelector('.attendance-statistics-box')?.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 80) };
  });
}

const groupViewNote = '「group view」規格：開啟後看板應顯示來源群組、可跳轉、點選群組改顯示成員、自動返回。以「看板上找得到群組檢視區塊或來源群組清單」作為前提判定';

async function requireGroupView(page: Page, what: string) {
  await applySettings(page, { enableSummaryView: true, summaryBy: 'GROUP', summaryPatrolTime: 10, patrolidleTime: 60 });
  await loadBoard(page);
  const s = await groupViewState(page);
  obs(`開啟分組檢視（enableSummaryView=true、summaryBy=GROUP）後的看板：有群組檢視區塊=${s.hasBlock}、畫面提到 All Person=${s.mentionsAllPerson}、統計區文字=「${s.sortLabel}」、人員卡片 ${await cards(page).count()} 張（扁平人員清單）`);
  expect(s.hasBlock || s.mentionsAllPerson, `看板沒有群組檢視（找不到群組檢視區塊或來源群組清單），無法驗證「${what}」`).toBe(true);
}

test.describe('ATB（點名看板群組／人員檢視）', () => {
  const groupItems: Array<[string, string, string]> = [
    ['ATB-014', 'group 顯示（顯示來源群組，預設 all person）', '1. group 顯示\n    - 顯示來源群組 (預設 all person)'],
    ['ATB-015', 'group 跳轉', '2. group 跳轉'],
    ['ATB-016', '點選某 group 改顯示該 group 的成員', '3. 點選某 group、改顯示該 group 的成員'],
    ['ATB-017', '該 group 成員的跳轉', '4. 該group 成員的跳轉'],
    ['ATB-018', '自動返回 group 顯示（可設定時長或 disable）', '5. 自動返回 group 顯示，可設定時長或disable'],
  ];
  for (const [id, title, steps] of groupItems) {
    test(
      `[${id}] 點名看板群組顯示：${title}`,
      {
        annotation: [
          ...csvAnnotations({ row: 125, no: '', category: '（延續）> 群組顯示', steps: `group: 當設定開啟 group view 時\n${steps}`, expected: 'Group顯示正確' }),
          { type: '判定範圍', description: groupViewNote },
        ],
      },
      async ({ page }) => {
        test.setTimeout(280000);
        await requireGroupView(page, title);
      },
    );
  }

  test(
    '[ATB-019] 點名看板人員顯示與來源：依設定顯示對應成員（來源群組、顯示方式）',
    {
      annotation: [
        ...csvAnnotations({ row: 126, no: '', category: '（延續）> 人員顯示與來源', steps: 'person: 當設定未開啟 group view 時\n1. 根據設定，顯示對應成員\n    - 顯示來源群組 (預設 all person)\n    - 顯示方式', expected: '人員顯示正確' }),
        { type: '判定範圍', description: '來源群組：把顯示來源設為單一預設群組，看板總人數應等於群組列表上該群組的人員＋訪客數量。顯示方式（標準／緊湊）在設定頁沒有此選項（見 ATB-004），無法驗證' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(290000);
      // 群組列表上的數量（人員數量 + 訪客數量）
      await gotoGroups(page);
      const count = async (name: string) => {
        await searchGroups(page, name);
        const row = groupRow(page, name).first();
        const n = async (c: number) => Number(((await row.locator(`td:nth-child(${c})`).innerText()) ?? '0').trim());
        return (await n(3)) + (await n(4));
      };
      const expectedPerson = await count('All Person');
      const expectedVisitor = await count('All Visitor');
      obs(`群組列表：All Person ${expectedPerson}、All Visitor ${expectedVisitor}`);
      const bad: string[] = [];
      for (const [grp, expected] of [['All Person', expectedPerson], ['All Visitor', expectedVisitor]] as Array<[string, number]>) {
        await applySettings(page, { enableSummaryView: false, displayGroup: [grp] });
        await loadBoard(page);
        const total = Number(await totalText(page));
        const shown = await cards(page).count();
        obs(`來源群組=${grp}：看板總人數 ${total}、本頁卡片 ${shown}（預期 ${expected}）`);
        if (total !== expected) bad.push(`來源群組只選 ${grp}：看板 ${total} 人，群組列表 ${expected} 人`);
      }
      expect(bad, `看板總人數與群組列表不符：${bad.join('；')}`).toEqual([]);
    },
  );

  test(
    '[ATB-020] 點名看板人員顯示與來源：跳轉',
    {
      annotation: [
        ...csvAnnotations({ row: 126, no: '', category: '（延續）> 人員顯示與來源', steps: 'person: 當設定未開啟 group view 時\n2. 跳轉', expected: '人員顯示正確' }),
        { type: '判定範圍', description: '跳轉＝人員超過一頁時的分頁切換（上一頁／下一頁）。人數不足一頁時，先新增 e2e- 測試人員讓總人數超過一頁；測試人員會在結束後刪除' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(295000);
      await applySettings(page, { enableSummaryView: false, displayGroup: ['All Person', 'All Visitor'], personPatrolTime: 3600 });
      await loadBoard(page);
      let [, pages] = (await pagerText(page)).split('/').map(Number);
      const perPage = await cards(page).count();
      if (pages < 2) {
        const need = 26 - Number(await totalText(page)); // 一頁最多 25 張卡片（5 欄 x 5 列）
        for (let i = 0; i < Math.max(need, 1); i += 1) {
          const id = uniquePersonId(`pg${i}`);
          persons.push(id);
          await createPersonViaUI(page, { id, name: `e2e分頁${i}` });
        }
        await loadBoard(page);
        [, pages] = (await pagerText(page)).split('/').map(Number);
        obs(`新增 ${persons.length} 位測試人員後：看板總人數 ${await totalText(page)}、本頁卡片 ${await cards(page).count()}、分頁 ${await pagerText(page)}`);
      }
      obs(`第 1 頁 ${perPage} 張卡片；分頁文字 ${await pagerText(page)}`);
      expect(pages, '人數超過一頁時看板仍只有 1 頁').toBeGreaterThanOrEqual(2);
      const firstNames = (await page.locator('.person-card').allTextContents()).join('|');
      const next = page.locator('.pager-arrow-btn').nth(1);
      const prev = page.locator('.pager-arrow-btn').nth(0);
      await expect(prev).toBeDisabled();
      await next.click();
      await expect.poll(() => pagerText(page)).toMatch(/^2\//);
      const secondNames = (await page.locator('.person-card').allTextContents()).join('|');
      expect(secondNames, '跳到下一頁後人員內容沒有改變').not.toBe(firstNames);
      await prev.click();
      await expect.poll(() => pagerText(page)).toMatch(/^1\//);
    },
  );
});

function obs(description: string) {
  console.log('OBS', description);
  test.info().annotations.push({ type: '觀察', description });
}
