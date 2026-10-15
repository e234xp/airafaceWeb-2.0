import { Page, expect } from '@playwright/test';
import JSZip from 'jszip';
import { readFileSync } from 'node:fs';
import { TMP_DIR } from './files';
import { bodyRows } from './tables';

// 人員／訪客報表、調查頁 helper。人員報表與調查約有 195 萬筆資料，查詢一律先縮小到「最新一筆那一秒／那一分鐘」，避免拖垮測試機。

export const PERSON_REPORT = '/#/reports/personreport';
export const VISITOR_REPORT = '/#/reports/visitorreport';
export const INVESTIGATION = '/#/reports/investigation';

export async function openReportPage(page: Page, route: string) {
  await page.goto(route);
  await page.reload();
  await page.locator('.mx-datepicker input').first().waitFor();
}

export const rangeInput = (page: Page) => page.locator('.mx-datepicker input').first();
export const searchButton = (page: Page) => page.locator('button', { hasText: '搜尋' }).first();

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
