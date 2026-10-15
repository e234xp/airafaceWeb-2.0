import { Page, expect } from '@playwright/test';
import JSZip from 'jszip';
import * as ExcelJS from 'exceljs';
import { readFileSync } from 'node:fs';
import { TMP_DIR, writeFile } from './files';
import { bodyRows, listReady } from './tables';
import { Kind, formInput, formInputs, gotoPersons, searchPersons } from './persons';

// 人員批次匯入／匯出、編輯 helper。

/** 以介面編輯人員：搜尋 → 編輯 → 修改欄位 → 下一步 → 註冊 → 完成。只傳入要修改的欄位。 */
export async function editPersonViaUI(

  page: Page,
  id: string,
  changes: { name?: string; department?: string; title?: string },
  kind: Kind = 'person',
) {
  await gotoPersons(page, kind);
  await searchPersons(page, id);
  await bodyRows(page).filter({ hasText: id }).first().getByRole('button', { name: '編輯' }).click();
  await formInputs(page).first().waitFor();
  if (changes.name !== undefined) await formInput(page, 'name').fill(changes.name);
  if (changes.department !== undefined) await formInput(page, 'department').fill(changes.department);
  if (changes.title !== undefined) await formInput(page, 'title').fill(changes.title);
  await page.getByRole('button', { name: '下一步' }).click();
  await page.getByRole('button', { name: '註冊' }).click();
  await expect(page.getByText('註冊完成')).toBeVisible();
  await page.getByRole('button', { name: '完成' }).click();
  await listReady(page);
}

export interface TemplateContent {
  zipPath: string;
  fileName: string;
  entries: string[];
  xlsx: Buffer;
  /** 範本內第一組範例照片：註冊照片、顯示用照片 */
  photoRegister: Buffer;
  photoDisplay: Buffer;
}

/** 按「下載範本」，解開範本壓縮檔。 */
export async function downloadTemplate(page: Page, kind: Kind = 'person'): Promise<TemplateContent> {
  await gotoPersons(page, kind);
  const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: '下載範本' }).click()]);
  const zipPath = `${TMP_DIR}/template-${dl.suggestedFilename()}`;
  await dl.saveAs(zipPath);
  const zip = await JSZip.loadAsync(readFileSync(zipPath));
  const entries = Object.keys(zip.files);
  const xlsxName = entries.find((n) => n.toLowerCase().endsWith('.xlsx'));
  if (!xlsxName) throw new Error(`範本壓縮檔內找不到 Excel：${entries.join(', ')}`);
  const photos = entries.filter((n) => n.startsWith('snapshot/') && !n.endsWith('/'));
  const reg = photos.find((n) => !n.toLowerCase().includes('_d.'));
  const disp = photos.find((n) => n.toLowerCase().includes('_d.'));
  if (!reg || !disp) throw new Error(`範本內找不到範例照片：${photos.join(', ')}`);
  return {
    zipPath,
    fileName: dl.suggestedFilename(),
    entries,
    xlsx: await zip.files[xlsxName].async('nodebuffer'),
    photoRegister: await zip.files[reg].async('nodebuffer'),
    photoDisplay: await zip.files[disp].async('nodebuffer'),
  };
}

export interface ImportPerson {
  id: string;
  name: string;
  department?: string;
  title?: string;
  remarks?: string;
}

/** 依範本格式產生匯入用 Excel（沿用範本表頭，清掉範例列後填入人員）與照片（人員編號.jpg、人員編號_D.jpg）。 */
export async function buildImportFiles(
  tpl: TemplateContent,
  people: ImportPerson[],
  photos: 'none' | 'display' | 'both',
  tag: string,
  face?: Buffer,
) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(tpl.xlsx as never);
  const ws = wb.worksheets[0];
  const headers: Record<string, number> = {};
  ws.getRow(1).eachCell((cell, col) => {
    headers[String(cell.value).trim()] = col;
  });
  while (ws.rowCount > 1) ws.spliceRows(2, 1);
  people.forEach((p, i) => {
    const row = ws.getRow(i + 2);
    const set = (header: string, value: string | number | undefined) => {
      if (value !== undefined && headers[header]) row.getCell(headers[header]).value = value;
    };
    set('No', i + 1);
    set('Id', p.id);
    set('Fullname', p.name);
    set('Department', p.department);
    set('Title', p.title);
    set('Remarks', p.remarks);
    row.commit();
  });
  const xlsxPath = `${TMP_DIR}/import-${tag}.xlsx`;
  writeFile(xlsxPath, Buffer.from(await wb.xlsx.writeBuffer()));
  const photoPaths: string[] = [];
  if (photos !== 'none') {
    for (const p of people) {
      // 註冊照片需有清楚正臉：有提供 face 才產生；否則只匯入顯示用照片
      if (photos === 'both') photoPaths.push(writeFile(`${TMP_DIR}/photos-${tag}/${p.id}.jpg`, face ?? tpl.photoRegister));
      photoPaths.push(writeFile(`${TMP_DIR}/photos-${tag}/${p.id}_D.jpg`, tpl.photoDisplay));
    }
  }
  return { xlsxPath, photoPaths };
}

/** 展開匯入區，選擇 Excel（與照片）後按「匯入」，回傳畫面上的成功／失敗／總筆數。 */
export async function importViaUI(page: Page, xlsxPath: string, photoPaths: string[], kind: Kind = 'person') {
  await gotoPersons(page, kind);
  await page.getByRole('button', { name: '匯入', exact: true }).first().click();
  const fileInputs = page.locator('input[type=file]');
  await fileInputs.nth(0).setInputFiles(xlsxPath);
  if (photoPaths.length > 0) await fileInputs.nth(1).setInputFiles(photoPaths);
  await page.getByRole('button', { name: '匯入' }).last().click();
  const summary = page.locator('text=/成功/').last();
  await expect(summary).toContainText('總', { timeout: 60000 });
  await expect
    .poll(async () => {
      const t = ((await summary.textContent()) ?? '').replace(/\s+/g, ' ');
      const nums = t.match(/\d+/g) ?? [];
      return nums.length >= 3 && Number(nums[0]) + Number(nums[1]) >= Number(nums[2]) && Number(nums[2]) > 0;
    }, { timeout: 90000 })
    .toBe(true);
  const text = ((await summary.textContent()) ?? '').replace(/\s+/g, ' ');
  const nums = (text.match(/\d+/g) ?? []).map(Number);
  return { text, success: nums[0], fail: nums[1], total: nums[2] };
}
