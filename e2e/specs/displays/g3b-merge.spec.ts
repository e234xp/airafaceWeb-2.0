import { test, expect, Page } from '@playwright/test';
import { csvAnnotations } from '../../helpers/csvSource';
import { INVESTIGATION, openReportPage, setRange, totalRecords } from '../../helpers/reports';
import { bodyRows } from '../../helpers/tables';

/** 逐頁讀完調查報表的列（readAllRows 最多 50 頁；合併時每頁原始 10 筆、顯示的可能更少，頁數會很多）。 */
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

// 來源 E2E-TEST-PLAN.md：CAM-026、CAM-027、SEC-015（陌生人合併的效果）。
// 前置（環境建置，見 Results「環境重建紀錄」）：Camera-3（辦公室 RD-ACTi，真實畫面）的「陌生人合併」已啟用（時長 10000 ms、分數 0.6）。
// 該鏡頭每分鐘約產生 100 多筆陌生人辨識；合併後被併掉的紀錄在後端帶 merged=true，產品的調查報表與保全看板只顯示未合併者。
// 驗證方式：以產品後端 API 取得同一時段的原始紀錄（含 merged 標記），對照畫面實際顯示的內容。唯讀，不修改任何設定。

type Rec = { source_id: string; verify_uuid: string; merged?: boolean; timestamp: number };
const p2 = (n: number) => String(n).padStart(2, '0');
const fmt = (ms: number) => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())} ${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())}`;
};
const obs = (s: string) => {
  console.log('OBS', s);
  test.info().annotations.push({ type: '觀察', description: s });
};

/** 前置檢查 + 取得該時段的原始陌生人紀錄（只含 Camera-3）。 */
async function rawStrangers(page: Page, from: number, to: number) {
  return page.evaluate(
    async ({ s, e }) => {
      const el = Array.from(document.querySelectorAll('*')).find((x) => (x as unknown as { __vue__?: unknown }).__vue__) as unknown as {
        __vue__: { $root: { $globalFindCameras: (a: string, b: number, c: number) => Promise<{ data: { list: Array<{ uuid: string; name: string; non_verified_merge_setting: { enable: boolean } }> } }>; $globalGetStrangerResult: (q: unknown) => Promise<{ data: { result: { data: Array<unknown> } } }> } };
      };
      const root = el.__vue__.$root;
      const cams = (await root.$globalFindCameras('', 0, 100)).data.list;
      const cam = cams.find((c) => c.name === 'Camera-3');
      const res = await root.$globalGetStrangerResult({ start_time: s, end_time: e, slice_length: 8000, slice_shift: 0, uuid_list: [], with_image: false, merged: false, keyword: '', groups: [], source: [], temperature: 'ALL' });
      return { mergeEnabled: !!cam?.non_verified_merge_setting?.enable, camId: cam?.uuid ?? '', rows: ((res.data.result.data ?? []) as Rec[]).map((x) => ({ source_id: x.source_id, verify_uuid: x.verify_uuid, merged: !!x.merged, timestamp: x.timestamp })) };
    },
    { s: from, e: to },
  );
}

const RANGE = { from: () => Date.now() - 6 * 60000, to: () => Date.now() - 60000 };

for (const [id, row, label] of [
  ['CAM-027', 81, '人臉合併[陌生人]：報表內調查中合併'],
  ['SEC-015', 143, '陌生人事件合併：開啟後系統設定模式調查中陌生人合併'],
] as const) {
  test(
    `[${id}] ${label}`,
    {
      annotation: [
        ...csvAnnotations({
          row,
          no: '',
          category: id === 'CAM-027' ? '（延續）> 人臉合併[陌生人]' : '（延續）> 陌生人事件合併',
          steps: id === 'CAM-027' ? '1.啟用陌生人合併: 設定合併時長\n2.該秒數區間，辨識相同人員' : '1.開啟後系統設定模式調查中陌生人合併',
          expected: id === 'CAM-027' ? '3.報表內調查中合併' : '陌生人合併成功',
        }),
        { type: '判定範圍', description: '以 Camera-3（真實畫面、已啟用陌生人合併）近 6 分鐘的紀錄為準：後端標記為 merged 的紀錄不應出現在調查報表；畫面顯示筆數應等於未合併筆數。畫面右下角的分頁總筆數是否包含已合併紀錄，另列觀察' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(280000);
      await page.goto('/#/reports/investigation');
      await page.reload();
      await page.waitForTimeout(4000);
      const from = RANGE.from();
      const to = RANGE.to();
      const raw = await rawStrangers(page, from, to);
      expect(raw.mergeEnabled, '前置：Camera-3 的陌生人合併沒有啟用').toBe(true);
      const c3 = raw.rows.filter((r) => r.source_id === raw.camId);
      const merged = c3.filter((r) => r.merged);
      const unmerged = c3.filter((r) => !r.merged);
      obs(`Camera-3 近 6 分鐘：原始 ${c3.length} 筆，其中已合併 ${merged.length}、未合併 ${unmerged.length}`);
      expect(merged.length, '合併已啟用但沒有任何紀錄被標記為合併').toBeGreaterThan(0);
      expect(unmerged.length, '全部都被合併，沒有留下代表紀錄').toBeGreaterThan(0);
      // 畫面：調查報表（陌生人）同一時段、來源只選 Camera-3
      await openReportPage(page, INVESTIGATION);
      await page.locator('select:visible').first().selectOption({ label: '陌生人' });
      const source = page.locator('.multiselect').last();
      await source.click();
      await page.locator('.multiselect__option:visible').filter({ hasText: 'Camera-3' }).first().click();
      await page.keyboard.press('Escape');
      await setRange(page, fmt(from), fmt(to));
      await page.waitForTimeout(6000);
      const pager = await totalRecords(page).catch(() => -1);
      const rows = await readAllPages(page);
      obs(`調查報表（Camera-3）畫面 ${rows.length} 列；分頁總筆數 ${pager}；後端原始 ${c3.length}、未合併 ${unmerged.length}`);
      expect(rows.length, '畫面顯示的筆數不等於未合併筆數（已合併的紀錄沒有被隱藏，或多隱藏了）').toBeGreaterThanOrEqual(unmerged.length - 3);
      expect(rows.length).toBeLessThanOrEqual(unmerged.length + 3);
      if (pager !== rows.length) test.info().annotations.push({ type: "產品問題（不影響本項判定）", description: `調查報表右下角分頁總筆數 ${pager} 包含已合併紀錄，與畫面實際顯示 ${rows.length} 列不一致；每頁原始 10 筆、隱藏已合併後各頁只剩少數列，會出現幾乎空白的頁面` });
    },
  );
}

test(
  '[CAM-026] 人臉合併[陌生人]：保全 Dashboard 顯示合併效果',
  {
    annotation: [
      ...csvAnnotations({ row: 81, no: '', category: '（延續）> 人臉合併[陌生人]', steps: '1.啟用陌生人合併: 設定合併時長\n2.該秒數區間，辨識相同人員', expected: '2.於保全Dashboard顯示合併效果' }),
      { type: '判定範圍', description: '以 Camera-3（真實畫面、已啟用陌生人合併）的紀錄為準：保全看板「陌生人」清單中不應出現後端標記為已合併的紀錄，且清單中有 Camera-3 的未合併代表紀錄' },
    ],
  },
  async ({ page }) => {
    test.setTimeout(280000);
    await page.goto('/#/guardmode');
    await page.reload();
    await expect
      .poll(async () => ((await page.evaluate(() => {
        const all = Array.from(document.querySelectorAll('*')) as Array<HTMLElement & { __vue__?: Record<string, unknown> }>;
        for (const e of all) if (e.__vue__ && 'strangers' in e.__vue__) return (e.__vue__.strangers as unknown[]).length;
        return 0;
      })) as number), { timeout: 120000, message: '保全看板 120 秒內沒有載入陌生人' })
      .toBeGreaterThan(0);
    await page.waitForTimeout(2000);
    const board = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('*')) as Array<HTMLElement & { __vue__?: Record<string, unknown> }>;
      for (const e of all) if (e.__vue__ && 'strangers' in e.__vue__) return (e.__vue__.strangers as Array<{ verify_uuid: string; source_id?: string; timestamp: number }>).map((x) => ({ id: x.verify_uuid, src: x.source_id ?? '', ts: x.timestamp }));
      return [];
    });
    const oldest = Math.min(...board.map((b) => b.ts));
    const raw = await rawStrangers(page, oldest - 1000, Date.now());
    expect(raw.mergeEnabled, '前置：Camera-3 的陌生人合併沒有啟用').toBe(true);
    const mergedIds = new Set(raw.rows.filter((r) => r.merged).map((r) => r.verify_uuid));
    const leaked = board.filter((b) => mergedIds.has(b.id));
    const fromC3 = board.filter((b) => b.src === raw.camId);
    obs(`保全看板陌生人 ${board.length} 筆（Camera-3 ${fromC3.length} 筆）；同時段後端已合併紀錄 ${mergedIds.size} 筆；看板中出現已合併紀錄 ${leaked.length} 筆`);
    expect(mergedIds.size, '同時段沒有已合併的紀錄，無法驗證').toBeGreaterThan(0);
    expect(leaked.length, '保全看板顯示了已被合併的陌生人紀錄').toBe(0);
  },
);
