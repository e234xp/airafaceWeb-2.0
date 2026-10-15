import { test, expect } from '@playwright/test';
import * as ExcelJS from 'exceljs';
import { readdirSync } from 'node:fs';
import { importViaUI } from '../../helpers/personsIo';
import { gotoPersons, personRowTexts } from '../../helpers/persons';
import { readAllRows } from '../../helpers/tables';

// 環境建置步驟 3：以產品的「匯入」功能把使用者提供的員工資料（Excel 範本 + 照片資料夾）批量建立為人員。
// 資料來源由 SEED_XLSX、SEED_PHOTOS 環境變數指定；真實員工資料與照片，不是假資料。個資不印出，只印筆數。
const XLSX_PATH = process.env.SEED_XLSX ?? '';
const PHOTO_DIR = process.env.SEED_PHOTOS ?? '';

test('[SEED-003] 匯入員工資料（環境前置）', async ({ page }) => {
  test.setTimeout(290000);
  expect(XLSX_PATH && PHOTO_DIR, '需要 SEED_XLSX 與 SEED_PHOTOS').toBeTruthy();
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(XLSX_PATH);
  const ws = wb.worksheets[0];
  const ids: string[] = [];
  ws.eachRow((r, i) => {
    if (i > 1 && r.getCell(2).value) ids.push(String(r.getCell(2).value));
  });
  const files = readdirSync(PHOTO_DIR);
  const photoPaths = files.filter((f) => ids.some((id) => new RegExp(`^${id}(_D)?\\.(jpg|jpeg|png)$`, 'i').test(f))).map((f) => `${PHOTO_DIR}/${f}`);
  const skipped = files.filter((f) => !photoPaths.some((p) => p.endsWith(`/${f}`)));
  console.log('SEED 人員', ids.length, '位；匹配的照片', photoPaths.length, '張；未匹配的檔案', skipped.length, '個');

  await gotoPersons(page);
  const before = (await readAllRows(page)).length;
  console.log('SEED 匯入前人員', before);
  const r = await importViaUI(page, XLSX_PATH, photoPaths);
  console.log('SEED 匯入結果', r.text);
  await gotoPersons(page);
  await page.waitForTimeout(3000);
  const rows = await readAllRows(page);
  console.log('SEED 匯入後人員', rows.length, '有註冊照片的列', (await page.locator('.vxe-table--body-wrapper tbody tr img').count()) > 0);
  void personRowTexts;
  expect(rows.length - before, '匯入後人員數量沒有增加到名單筆數').toBe(ids.length - r.fail);
});
