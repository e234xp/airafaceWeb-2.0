import { Page, expect, test } from '@playwright/test';
import JSZip from 'jszip';
import { readFileSync } from 'node:fs';
import { TMP_DIR } from './files';
import { bodyRows } from './tables';

// 人員／訪客報表、調查頁 helper。人員報表與調查約有 195 萬筆資料，查詢一律先縮小到「最新一筆那一秒／那一分鐘」，避免拖垮測試機。

export const PERSON_REPORT = '/#/reports/personreport';
export const VISITOR_REPORT = '/#/reports/visitorreport';
export const INVESTIGATION = '/#/reports/investigation';

/**
 * 開啟人員報表、訪客報表或調查頁。
 * @param latestOf 給了就把查詢範圍改成「最近一天有這類辨識紀錄的那一整天」（見 showLatestDay）；不給就維持頁面預設的今天
 * @returns 有給 latestOf 時回傳查詢的日期（YYYY-MM-DD），否則 undefined
 */
export async function openReportPage(page: Page, route: string, latestOf?: RecordKind) {
  await page.goto(route);
  await page.reload();
  await page.locator('.mx-datepicker input').first().waitFor();
  if (latestOf) return showLatestDay(page, latestOf);
  return undefined;
}

export const rangeInput = (page: Page) => page.locator('.mx-datepicker input').first();
export const searchButton = (page: Page) => page.locator('button', { hasText: '搜尋' }).first();

type RecordKind = 'person' | 'stranger';

/**
 * 把查詢範圍設成「最近一天有辨識紀錄的那一整天」並按搜尋。
 * 報表頁預設只查今天；剛過午夜、或當天還沒有人被辨識時，今天是空的，測試就沒有資料可驗（2026-11-12 00:03 的完整測試 12 項因此失敗）。
 * 從今天往前一天一天查，每次只要 1 筆，避免一次查大範圍拖慢測試機（人員紀錄約 195 萬筆）。
 * @param kind 要找哪一類紀錄：人員或陌生人（調查頁選「陌生人」時資料來源不同）
 * @param maxDays 最多往前找幾天（含今天）
 * @returns 找到的日期，格式 YYYY-MM-DD
 * @throws 這段期間都沒有紀錄時，以「受阻」開頭說明環境缺資料
 */
export async function showLatestDay(page: Page, kind: RecordKind = 'person', maxDays = 30) {
  const day = await page.evaluate(
    async ({ kind, maxDays }) => {
      type Api = (q: object) => Promise<{ error: unknown; data: { result?: { total_length?: number } } | null }>;
      const host = Array.from(document.querySelectorAll('*')).find((x) => (x as unknown as { __vue__?: unknown }).__vue__) as unknown as {
        __vue__: { $root: Record<string, Api> };
      };
      const api = host.__vue__.$root[kind === 'stranger' ? '$globalGetStrangerResult' : '$globalGetPersonResult'];
      const pad = (n: number) => String(n).padStart(2, '0');
      const now = new Date();
      for (let back = 0; back < maxDays; back += 1) {
        // 用瀏覽器的當地時間切日期，和頁面日期選擇器的「一天」一致
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - back);
        const query = { start_time: start.getTime(), end_time: start.getTime() + 86400000 - 1, slice_length: 1, slice_shift: 0, uuid_list: [], with_image: false, merged: false, keyword: '' };
        const { error, data } = await api(query);
        if (error) throw new Error(`查詢辨識紀錄失敗：${String(error)}`);
        if ((data?.result?.total_length ?? 0) > 0) return `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
      }
      return null;
    },
    { kind, maxDays },
  );
  const what = kind === 'stranger' ? '陌生人' : '人員';
  if (!day) throw new Error(`受阻：最近 ${maxDays} 天都沒有${what}辨識紀錄，無法驗證（環境缺資料，需要先有${what}辨識紀錄）`);
  test.info().annotations.push({ type: '觀察', description: `查詢範圍改為最近有${what}辨識紀錄的日期 ${day}` });
  await setRange(page, `${day} 00:00:00`, `${day} 23:59:59`);
  return day;
}

export async function setRange(page: Page, from: string, to: string) {
  await rangeInput(page).fill(`${from} ~ ${to}`);
  await rangeInput(page).press('Enter');
  await searchButton(page).click();
  await page.waitForTimeout(3000);
}

export const firstRowTime = async (page: Page) => ((await bodyRows(page).first().locator('td:nth-child(1)').textContent()) ?? '').trim();

/** 把範圍縮到第一列所在的那一分鐘（或那一秒）。回傳 { day, hhmm, hhmmss }。 */
export async function narrowToFirstRow(page: Page, unit: 'minute' | 'second' = 'minute') {
  await bodyRows(page).first().waitFor({ timeout: 60000 });
  const t = await firstRowTime(page);
  const day = t.slice(0, 10);
  const hhmm = t.slice(11, 16);
  const hhmmss = t.slice(11, 19);
  if (unit === 'minute') await setRange(page, `${day} ${hhmm}:00`, `${day} ${hhmm}:59`);
  else {
    // 起訖相同秒數會查不到資料：結束時間往後 1 秒
    const end = new Date(`${day}T${hhmmss}`);
    end.setSeconds(end.getSeconds() + 1);
    const p = (n: number) => String(n).padStart(2, '0');
    const endStr = `${end.getFullYear()}-${p(end.getMonth() + 1)}-${p(end.getDate())} ${p(end.getHours())}:${p(end.getMinutes())}:${p(end.getSeconds())}`;
    await setRange(page, `${day} ${hhmmss}`, endStr);
  }
  await bodyRows(page).first().waitFor({ timeout: 30000 });
  return { day, hhmm, hhmmss };
}

export const pageRowTexts = async (page: Page) =>
  (await bodyRows(page).evaluateAll((rows) => rows.map((r) => (r as HTMLElement).innerText.replace(/\s+/g, ' ').trim()))).filter((s) => s.length > 0);

export const totalRecords = async (page: Page) => {
  const t = (await page.locator('.vxe-pager').innerText()).replace(/\s+/g, ' ');
  return Number(t.slice(t.indexOf('共')).replace(/[^0-9]/g, ''));
};

/** 展開「匯出為 Excel」下拉並點選「含照片」或「不含照片」，回傳下載檔的內容摘要。 */
export async function exportWithPhoto(page: Page, withPhoto: boolean) {
  await page.getByRole('button', { name: '匯出為 Excel', exact: true }).click();
  const item = page.getByText(withPhoto ? '匯出為 Excel (含照片)' : '匯出為 Excel (不含照片)', { exact: true });
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 120000 }), item.click()]);
  const path = `${TMP_DIR}/report-export-${Date.now()}-${dl.suggestedFilename()}`;
  await dl.saveAs(path);
  const bytes = readFileSync(path);
  const isZip = bytes.slice(0, 2).toString('hex') === '504b';
  let entries: string[] = [];
  if (isZip) entries = Object.keys((await JSZip.loadAsync(bytes)).files);
  return { name: dl.suggestedFilename(), bytes, isZip, entries };
}

export { expect };
