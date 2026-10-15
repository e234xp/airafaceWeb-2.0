import { test, expect, Page } from '@playwright/test';
import { csvAnnotations } from '../../helpers/csvSource';
import { INVESTIGATION, openReportPage, setRange, totalRecords } from '../../helpers/reports';
import { bodyRows } from '../../helpers/tables';

// 來源 E2E-TEST-PLAN.md：CAM-021、CAM-022、SEC-012（人員合併的效果）。
// 前置（環境建置，見 Results「環境重建紀錄」）：Camera-7（辦公室餐廳，真實畫面）的「人員合併」已啟用（10000 ms），
// 起算時間由環境變數 MERGE_FROM（毫秒時間戳）指定；之前的紀錄不會被合併，不納入判定。唯讀。
const CAM = process.env.MERGE_CAM ?? 'Camera-7';
const FROM = Number(process.env.MERGE_FROM ?? 0);
type Rec = { source_id: string; verify_uuid: string; merged?: boolean; timestamp: number; name?: string };
const p2 = (n: number) => String(n).padStart(2, '0');
const fmt = (ms: number) => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())} ${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())}`;
};
const obs = (s: string) => {
  console.log('OBS', s);
  test.info().annotations.push({ type: '觀察', description: s });
};

async function rawPersons(page: Page, from: number, to: number) {
  return page.evaluate(
    async ({ s, e, camName }) => {
      const el = Array.from(document.querySelectorAll('*')).find((x) => (x as unknown as { __vue__?: unknown }).__vue__) as any;
      const root = el.__vue__.$root;
      const cam = (await root.$globalFindCameras('', 0, 100)).data.list.find((c: any) => c.name === camName);
      const res = await root.$globalGetPersonResult({ start_time: s, end_time: e, slice_length: 8000, slice_shift: 0, uuid_list: [], with_image: false, merged: false, keyword: '', groups: [], source: [], temperature: 'ALL' });
      const rows = (res.data.result.data as any[]).filter((x) => x.source_id === cam.uuid).map((x) => ({ source_id: x.source_id, verify_uuid: x.verify_uuid, merged: !!x.merged, timestamp: x.timestamp, name: x.name }));
      return { mergeEnabled: !!cam.verified_merge_setting?.enable, rows };
    },
    { s: from, e: to, camName: CAM },
  );
}

async function readAllPages(page: Page, cap = 150) {
  const out: string[] = [];
  const first = page.locator('.vxe-pager .vxe-pager--num-btn').first();
  if ((await first.count()) > 0) await first.click().catch(() => {});
  for (let i = 0; i < cap; i += 1) {
    out.push(...(await bodyRows(page).evaluateAll((rs) => rs.map((r) => (r as HTMLElement).innerText.replace(/\s+/g, ' ').trim()))).filter((x) => x.length > 0));
    const next = page.locator('.vxe-pager--next-btn').first();
    if ((await next.count()) === 0 || (await next.getAttribute('class'))?.includes('is--disabled')) break;
    await next.click();
    await page.waitForTimeout(250);
  }
  return out;
}

for (const [id, row, label, exp] of [
  ['CAM-022', 80, '人臉合併[人員]：報表內調查中合併', '3.報表內調查中合併'],
  ['SEC-012', 142, '人員事件合併：開啟後系統設定模式調查中人員合併', '人員合併成功'],
] as const) {
  test(
    `[${id}] ${label}`,
    {
      annotation: [
        ...csvAnnotations({ row, no: '', category: id === 'CAM-022' ? '（延續）> 人臉合併[人員]' : '（延續）> 人員事件合併', steps: '1.啟用人員合併: 設定合併時長\n2.該秒數區間，辨識相同人員', expected: exp }),
        { type: '判定範圍', description: '以 Camera-7（真實畫面、人員合併啟用後）的紀錄為準：後端標記為 merged 的紀錄不應出現在調查報表；畫面筆數應等於未合併筆數' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(280000);
      expect(FROM, '需要 MERGE_FROM').toBeGreaterThan(0);
      await page.goto('/#/reports/investigation');
      await page.reload();
      await page.waitForTimeout(4000);
      const to = Date.now() - 20000;
      const raw = await rawPersons(page, FROM, to);
      expect(raw.mergeEnabled, `前置：${CAM} 的人員合併沒有啟用`).toBe(true);
      const merged = raw.rows.filter((r) => r.merged);
      const unmerged = raw.rows.filter((r) => !r.merged);
      obs(`${CAM} 人員合併啟用後：原始 ${raw.rows.length} 筆，已合併 ${merged.length}、未合併 ${unmerged.length}`);
      expect(raw.rows.length, '啟用後沒有累積足夠的人員紀錄').toBeGreaterThan(5);
      expect(merged.length, '人員合併已啟用且有同一人短時間重複辨識，但沒有任何紀錄被標記為合併').toBeGreaterThan(0);
      await openReportPage(page, INVESTIGATION);
      await page.locator('select:visible').first().selectOption({ label: '人員' });
      const source = page.locator('.multiselect').last();
      await source.click();
      await page.locator('.multiselect__option:visible').filter({ hasText: CAM }).first().click();
      await page.keyboard.press('Escape');
      await setRange(page, fmt(FROM), fmt(to));
      await page.waitForTimeout(6000);
      const pager = await totalRecords(page).catch(() => -1);
      const rows = await readAllPages(page);
      obs(`調查報表（Camera-7）畫面 ${rows.length} 列；分頁總筆數 ${pager}；後端原始 ${raw.rows.length}、未合併 ${unmerged.length}`);
      expect(rows.length, '畫面筆數與未合併筆數不符').toBeGreaterThanOrEqual(unmerged.length - 3);
      expect(rows.length).toBeLessThanOrEqual(unmerged.length + 3);
      if (pager !== rows.length) test.info().annotations.push({ type: '產品問題（不影響本項判定）', description: `調查報表分頁總筆數 ${pager} 與畫面實際 ${rows.length} 列不一致` });
    },
  );
}

test(
  '[CAM-021] 人臉合併[人員]：保全 Dashboard 顯示合併效果',
  {
    annotation: [
      ...csvAnnotations({ row: 80, no: '', category: '（延續）> 人臉合併[人員]', steps: '1.啟用人員合併: 設定合併時長\n2.該秒數區間，辨識相同人員', expected: '2.於保全Dashboard顯示合併效果' }),
      { type: '判定範圍', description: '保全看板的人員資料中不應出現後端標記為已合併的紀錄' },
    ],
  },
  async ({ page }) => {
    test.setTimeout(280000);
    expect(FROM, '需要 MERGE_FROM').toBeGreaterThan(0);
    await page.goto('/#/guardmode');
    await page.reload();
    await page.waitForTimeout(15000);
    const board = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('*')) as Array<HTMLElement & { __vue__?: Record<string, unknown> }>;
      for (const e of all) if (e.__vue__ && 'persons' in e.__vue__) return (e.__vue__.persons as Array<Record<string, unknown>>).map((x) => ({ keys: Object.keys(x).slice(0, 25), id: (x.verify_uuid ?? x.id ?? '') as string }));
      return [];
    });
    obs(`保全看板人員 ${board.length} 筆；第一筆欄位：${board[0]?.keys.join(',')}`);
    const raw = await rawPersons(page, FROM, Date.now());
    const mergedIds = new Set(raw.rows.filter((r) => r.merged).map((r) => r.verify_uuid));
    const leaked = board.filter((b) => mergedIds.has(b.id));
    obs(`後端已合併 ${mergedIds.size} 筆；看板中出現已合併紀錄 ${leaked.length} 筆`);
    expect(mergedIds.size, '沒有已合併的紀錄可驗證').toBeGreaterThan(0);
    expect(leaked.length, '保全看板顯示了已被合併的人員紀錄').toBe(0);
  },
);
