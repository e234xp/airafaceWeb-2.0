import { Page } from './test';

// 進出紀錄（TRK）腳本共用：不寫死特定日期或人員，從後端 API 掃描環境現有的進出彙總，挑出符合條件的案例。
// 需要頁面已登入且載入過 App（用 Vue root 呼叫 $globalQueryPresenceSummary）。
export type PresenceCase = { day: string; name: string; personId: string; inSec: number; outSec: number };
export type PresenceScan = {
  /** 有兩位以上人員的一天（TRK-001 搜尋人員、列表僅有該人員） */
  multiDay: { day: string; names: string[] } | null;
  /** 有「不在辦公室」區段的人員（out_total_seconds > 0；優先取離開總時間較長者） */
  withAway: PresenceCase | null;
  /** 離開總時間最長的人員（TRK-008 超時顏色需要夠長的離開區段） */
  longestAway: PresenceCase | null;
};

let cache: PresenceScan | null = null;

export async function scanPresence(page: Page, days = 120): Promise<PresenceScan> {
  if (cache) return cache;
  await page.goto('/#/reports/presencedetail');
  await page.locator('.mx-datepicker input').first().waitFor();
  cache = await page.evaluate(async (n) => {
    const root = (Array.from(document.querySelectorAll('*')).find((x) => (x as unknown as { __vue__?: unknown }).__vue__) as unknown as {
      __vue__: { $root: { $globalQueryPresenceSummary: (q: unknown) => Promise<{ data?: { result?: Array<{ name: string; person_id: string; in_total_seconds: number; out_total_seconds: number }> } }> } };
    }).__vue__.$root;
    const now = Date.now();
    const all: Array<{ day: string; name: string; personId: string; inSec: number; outSec: number }> = [];
    const perDay: Record<string, string[]> = {};
    for (let d = 0; d < n; d += 1) {
      const start = new Date(now - d * 86400000);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);
      const r = await root.$globalQueryPresenceSummary({ keyword: '', start_time: start.getTime(), end_time: end.getTime(), slice_shift: 0, slice_length: 200 });
      const list = (r.data && r.data.result) || [];
      if (!list.length) continue;
      const day = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
      perDay[day] = list.map((x) => x.name);
      for (const x of list) all.push({ day, name: x.name, personId: x.person_id, inSec: x.in_total_seconds, outSec: x.out_total_seconds });
    }
    const multi = Object.entries(perDay).find(([, names]) => new Set(names).size >= 2);
    const away = all.filter((x) => x.outSec > 0).sort((a, b) => b.outSec - a.outSec);
    return {
      multiDay: multi ? { day: multi[0], names: multi[1] } : null,
      withAway: away[0] || null,
      longestAway: away[0] || null,
    };
  }, days);
  return cache!;
}

/** 在「進出紀錄」列表選日期、搜尋，並進入指定人員的詳細頁。 */
export async function openPresenceDetail(page: Page, day: string, name: string) {
  await openPresenceList(page, day);
  await page.locator('.vxe-table--body-wrapper tbody tr').filter({ hasText: name }).first().getByText('查看詳細').click();
  await page.locator('.timeline-seg').first().waitFor();
  await page.waitForTimeout(1500);
}

export async function openPresenceList(page: Page, day: string) {
  await page.goto('/#/reports/presencedetail');
  await page.reload();
  await page.locator('.mx-datepicker input').first().waitFor();
  const d = page.locator('.mx-datepicker input').first();
  await d.click();
  await d.fill(`${day} ~ ${day}`);
  await d.press('Enter');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: '搜尋' }).first().click();
  await page.waitForTimeout(2500);
}

/** 時間軸區段提示文字（第 2 行 "HH:mm:ss — HH:mm:ss"）換算成秒。 */
export function titleSeconds(title: string): number {
  const m = /(\d{2}):(\d{2}):(\d{2})\s*[—-]\s*(\d{2}):(\d{2}):(\d{2})/.exec(title);
  if (!m) return 0;
  const a = Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
  const b = Number(m[4]) * 3600 + Number(m[5]) * 60 + Number(m[6]);
  return Math.max(b - a, 0);
}

export function noPresenceMessage(what: string): string {
  return `環境沒有符合的進出紀錄可測（需要：${what}）。真實環境缺資料時可在 .env.e2e.local 設 E2E_IS_MOCK=true（進出紀錄的假資料尚未實作）。`;
}
