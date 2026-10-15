import { Page, expect } from '@playwright/test';
import JSZip from 'jszip';
import * as ExcelJS from 'exceljs';
import { readFileSync } from 'node:fs';
import { TMP_DIR } from './files';

// 出勤報表（日／月）匯出 helper：開啟「匯出設定」→ 選文件類型／分隔符號／欄位 → 套用 → 下載並解析。

export type Format = '.txt' | '.csv' | '.xlsx';
export const DAY_ROUTE = '/#/attendance/persondailyattendancereport';
export const MONTH_ROUTE = '/#/attendance/personmonthlyattendancereport';

export async function openReport(page: Page, route: string) {
  await page.goto(route);
  await page.reload();
  await page.locator('.vxe-table--body-wrapper tbody tr').first().waitFor({ timeout: 20000 });
  await page.waitForTimeout(1500);
}

export const pagerTotal = async (page: Page) => {
  const t = (await page.locator('.vxe-pager').innerText()).replace(/\s+/g, ' ');
  return Number(t.slice(t.indexOf('共')).replace(/[^0-9]/g, ''));
};

export async function openExportDialog(page: Page) {
  await page.getByRole('button', { name: '匯出' }).first().click();
  const modal = page.locator('.modal:visible').first();
  await modal.waitFor();
  return modal;
}

/** 對話框中所有欄位勾選框：{ label, checked, box }。 */
export async function exportFields(modal: ReturnType<Page['locator']>) {
  const boxes = modal.locator('input[type=checkbox]');
  const n = await boxes.count();
  const out: Array<{ label: string; checked: boolean }> = [];
  for (let i = 0; i < n; i += 1) {
    out.push(await boxes.nth(i).evaluate((e) => ({ label: ((e.closest('label') || e.parentElement)!.textContent || '').trim(), checked: (e as HTMLInputElement).checked })));
  }
  return out;
}

export const typeSelect = (modal: ReturnType<Page['locator']>) => modal.locator('select').nth(0);
export const delimiterSelect = (modal: ReturnType<Page['locator']>) => modal.locator('select').nth(1);

export interface ExportedFile {
  zipName: string;
  innerName: string;
  bytes: Buffer;
  rows: string[][]; // 第 1 列為表頭
  utf8Ok: boolean;
  outerEntries: string[]; // 下載的 zip 內全部檔名（含照片資料夾）
  mediaCount: number; // xlsx 內嵌的圖片數（xl/media）
}

/** 按「套用」並下載；檔案可能是 zip（內含實際文件），一律解開後解析。 */
export async function applyExport(page: Page, modal: ReturnType<Page['locator']>, format: Format, delimiterChar = ','): Promise<ExportedFile> {
  const [dl] = await Promise.all([page.waitForEvent('download'), modal.getByRole('button', { name: '套用' }).click()]);
  const path = `${TMP_DIR}/att-export-${Date.now()}-${dl.suggestedFilename()}`;
  await dl.saveAs(path);
  let bytes = readFileSync(path);
  let innerName = dl.suggestedFilename();
  let outerEntries: string[] = [];
  if (bytes.slice(0, 2).toString('hex') === '504b' && dl.suggestedFilename().toLowerCase().endsWith('.zip')) {
    const zip = await JSZip.loadAsync(bytes);
    const name = Object.keys(zip.files).find((n) => n.toLowerCase().endsWith(format));
    if (!name) throw new Error(`匯出的壓縮檔內找不到 ${format} 文件：${Object.keys(zip.files).join('、')}`);
    innerName = name;
    outerEntries = Object.keys(zip.files);
    bytes = await zip.files[name].async('nodebuffer');
  }
  let utf8Ok = true;
  let rows: string[][] = [];
  if (format === '.xlsx') {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(bytes as never);
    wb.worksheets[0].eachRow((row) => {
      const vals = (row.values as unknown[]).slice(1).map((v) => (v === null || v === undefined ? '' : String(v)));
      rows.push(vals);
    });
  } else {
    let text = '';
    try {
      text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    } catch {
      utf8Ok = false;
      text = bytes.toString('utf8');
    }
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
    rows = text
      .split(/\r?\n/)
      .filter((l) => l.length > 0)
      .map((l) => splitLine(l, delimiterChar));
  }
  let mediaCount = 0;
  if (format === '.xlsx') {
    const x = await JSZip.loadAsync(bytes);
    mediaCount = Object.keys(x.files).filter((n) => n.startsWith('xl/media/') && !n.endsWith('/')).length;
  }
  return { zipName: dl.suggestedFilename(), innerName, bytes, rows, utf8Ok, outerEntries, mediaCount };
}

/** 以指定分隔符號切一行；欄位若以雙引號包住則去掉引號。 */
export function splitLine(line: string, delim: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i += 1) {
    const c = line[i];
    if (c === '"') {
      if (inQ && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else inQ = !inQ;
    } else if (c === delim && !inQ) {
      out.push(cur);
      cur = '';
    } else cur += c;
  }
  out.push(cur);
  return out;
}

export { expect };
