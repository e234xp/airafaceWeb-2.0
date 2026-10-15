import { test, expect, Page } from '@playwright/test';
import { csvAnnotations } from '../../helpers/csvSource';
import { INVESTIGATION, exportWithPhoto, narrowToFirstRow, openReportPage, pageRowTexts, searchButton, setRange, totalRecords } from '../../helpers/reports';
import { bodyRows } from '../../helpers/tables';

// 來源 E2E-TEST-PLAN.md；INV-001、002、003、006、007、008（調查）。調查約 195 萬筆：先縮小時間範圍再查。全程只讀。

const categorySelect = (page: Page) => page.locator('select:visible').first();
const keywordInput = (page: Page) => page.locator('xpath=//*[normalize-space(text())="關鍵字"]/following::input[1]');
const groupBox = (page: Page) => page.locator('.multiselect').first();

async function pickGroup(page: Page, name: string) {
  await groupBox(page).click();
  await page.locator('.multiselect__option:visible').filter({ hasText: name }).first().click();
  await page.keyboard.press('Escape');
}

test.describe('INV（G1）', () => {
  test(
    '[INV-001] 調查：依時間區間、類別、群組、關鍵字由近而遠列出符合紀錄',
    {
      annotation: csvAnnotations({
        row: 45,
        no: '4.3',
        category: '調查 > 調查',
        steps: '1. 根據指定時間區間、類別、群組、關鍵字、由近而遠列出符合的紀錄',
        expected: '正確搜尋選定時間區間、條件調查的所有人員清單、頁數、筆數、顯示欄位',
      }),
    },
    async ({ page }) => {
      test.setTimeout(300000);
      await openReportPage(page, INVESTIGATION);
      const { day, hhmm } = await narrowToFirstRow(page);
      // 欄位
      const headers = (await page.locator('.vxe-table--header-wrapper th').allInnerTexts()).map((s) => s.trim()).filter(Boolean);
      for (const h of ['時間', '人員編號', '人員姓名', '卡號', '通行模式', '分數', '抓拍照片']) expect(headers, `表頭：${headers.join('、')}`).toContain(h);
      // 時間區間：每列都在該分鐘；由近而遠
      const times = (await page.locator('.vxe-table--body-wrapper tbody tr td:nth-child(1)').allInnerTexts()).map((s) => s.trim());
      for (const t of times) expect(t.startsWith(`${day} ${hhmm}`)).toBe(true);
      expect(times, '時間不是由近而遠').toEqual([...times].sort().reverse());
      // 類別（人員）＋群組（employee）＋關鍵字：結果每列都符合
      const rows0 = await pageRowTexts(page);
      const keyword = rows0[0].split(' ')[3]; // 人員編號
      await categorySelect(page).selectOption({ label: '人員' });
      await pickGroup(page, 'employee');
      await keywordInput(page).fill(keyword);
      await searchButton(page).click();
      await page.waitForTimeout(3000);
      const rows = await pageRowTexts(page);
      test.info().annotations.push({ type: '觀察', description: `類別=人員、群組=employee、關鍵字=${keyword}：${rows.length} 筆（第 1 頁）` });
      for (const r of rows) {
        expect(r, `群組條件 employee 的結果含不相符的列：${r}`).toContain('employee');
        expect(r, `關鍵字 ${keyword} 的結果含不相符的列：${r}`).toContain(keyword);
      }
      expect(await totalRecords(page)).toBeGreaterThanOrEqual(rows.length);
    },
  );

  test(
    '[INV-002] 調查：群組包含人員、訪客、陌生人',
    {
      annotation: [
        ...csvAnnotations({ row: 45, no: '4.3', category: '調查 > 調查', steps: '2. 群組包含: 人員、訪客、陌生人', expected: '正確搜尋選定時間區間、條件調查的所有人員清單、頁數、筆數、顯示欄位' }),
        { type: '判定範圍', description: '解讀為：類別可選「人員、訪客、陌生人」三種，且群組選項含人員與訪客的預設群組（All Person、All Visitor）；陌生人沒有群組' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(240000);
      await openReportPage(page, INVESTIGATION);
      await bodyRows(page).first().waitFor({ timeout: 60000 });
      const cats = (await categorySelect(page).locator('option').allInnerTexts()).map((s) => s.trim());
      for (const c of ['人員', '訪客', '陌生人']) expect(cats, `類別選項：${cats.join('、')}`).toContain(c);
      await groupBox(page).click();
      const groups = (await page.locator('.multiselect__option:visible').allInnerTexts()).map((s) => s.trim());
      await page.keyboard.press('Escape');
      test.info().annotations.push({ type: '觀察', description: `群組選項：${groups.join('、')}` });
      expect(groups).toContain('All Person');
      expect(groups).toContain('All Visitor');
    },
  );

  test(
    '[INV-003] 調查：類別為陌生人時列出時間、分數、抓拍照片，其餘欄位為空',
    {
      annotation: csvAnnotations({ row: 45, no: '4.3', category: '調查 > 調查', steps: '3. 類別為陌生人時，應會列出 時間、分數、抓拍照片，其餘欄位為空', expected: '正確搜尋選定時間區間、條件調查的所有人員清單、頁數、筆數、顯示欄位' }),
    },
    async ({ page }) => {
      test.setTimeout(300000);
      await openReportPage(page, INVESTIGATION);
      await bodyRows(page).first().waitFor({ timeout: 60000 });
      await categorySelect(page).selectOption({ label: '陌生人' });
      await searchButton(page).click();
      await page.waitForTimeout(4000);
      if ((await bodyRows(page).count()) === 0) throw new Error('受阻：預設時間範圍內沒有任何陌生人紀錄，無法驗證（需要先有陌生人辨識資料）');
      const headers = (await page.locator('.vxe-table--header-wrapper th').allInnerTexts()).map((s) => s.trim());
      const col = (name: string) => headers.indexOf(name) + 1; // td:nth-child 為 1 起算
      const rows = bodyRows(page);
      const n = Math.min(await rows.count(), 10);
      for (let i = 0; i < n; i += 1) {
        const cell = (c: number) => rows.nth(i).locator(`td:nth-child(${c})`);
        // 時間、分數、抓拍照片有內容
        expect(((await cell(col('時間')).innerText()) ?? '').trim().length, `第 ${i + 1} 列沒有時間`).toBeGreaterThan(0);
        expect(((await cell(col('分數')).innerText()) ?? '').trim().length, `第 ${i + 1} 列沒有分數`).toBeGreaterThan(0);
        expect(await cell(col('抓拍照片')).locator('img').count(), `第 ${i + 1} 列沒有抓拍照片`).toBeGreaterThan(0);
        // 人員編號、人員姓名、卡號、群組名稱為空
        for (const name of ['人員編號', '人員姓名', '卡號', '群組名稱']) {
          expect(((await cell(col(name)).innerText()) ?? '').replace(/\s+/g, ''), `第 ${i + 1} 列的「${name}」應為空`).toBe('');
        }
      }
    },
  );

  for (const withPhoto of [true, false]) {
    const id = withPhoto ? 'INV-006' : 'INV-007';
    test(
      `[${id}] 調查匯出：${withPhoto ? '含照片' : '不含照片'}`,
      {
        annotation: [
          ...csvAnnotations({ row: 47, no: '', category: '（延續）> 調查匯出', steps: withPhoto ? '1. 含照片 匯出壓縮檔中含照片 (在 snapshot 資料夾下)' : '2. 不含照片: 匯出壓縮檔中不包含照片及資料夾', expected: '根據設定匯出正確資料' }),
          { type: '判定範圍', description: '為避免大量下載照片，時間範圍縮到最新一筆所在的那一秒' },
        ],
      },
      async ({ page }) => {
        test.setTimeout(300000);
        await openReportPage(page, INVESTIGATION);
        await narrowToFirstRow(page, 'second');
        const file = await exportWithPhoto(page, withPhoto);
        test.info().annotations.push({ type: '觀察', description: `下載 ${file.name}；${file.isZip ? '壓縮檔內容：' + file.entries.join('、') : '非壓縮檔'}` });
        const images = file.entries.filter((n) => /\.(jpe?g|png)$/i.test(n));
        const hasSnapshotFolder = file.entries.some((n) => n.startsWith('snapshot/'));
        if (withPhoto) {
          expect(file.isZip, '含照片匯出不是壓縮檔').toBe(true);
          expect(hasSnapshotFolder, '壓縮檔沒有 snapshot 資料夾').toBe(true);
          expect(images.length, 'snapshot 資料夾沒有照片').toBeGreaterThan(0);
        } else {
          expect(hasSnapshotFolder, '不含照片的匯出仍有 snapshot 資料夾').toBe(false);
          expect(images.length, '不含照片的匯出仍含照片').toBe(0);
        }
      },
    );
  }

  test(
    '[INV-008] 調查 filter 搜尋：輸入人員關鍵字並檢查是否有關鍵字以外人員',
    {
      annotation: csvAnnotations({ row: 48, no: '', category: '（延續）> filter搜尋', steps: '1.輸入人員關鍵字\n2.檢查是否有關鍵字以外人員', expected: '1.輸入人員關鍵字 2.檢查是否有關鍵字以外人員\n〔使用者確認 2026-10-07〕搜尋結果僅含符合關鍵字者' }),
    },
    async ({ page }) => {
      test.setTimeout(300000);
      await openReportPage(page, INVESTIGATION);
      await narrowToFirstRow(page);
      const first = (await pageRowTexts(page))[0];
      const keyword = first.split(' ')[4]; // 人員姓名
      await keywordInput(page).fill(keyword);
      await searchButton(page).click();
      await page.waitForTimeout(3000);
      const rows = await pageRowTexts(page);
      expect(rows.length).toBeGreaterThan(0);
      for (const r of rows) expect(r.toLowerCase(), `關鍵字「${keyword}」的結果含不相符的列`).toContain(keyword.toLowerCase());
      await keywordInput(page).fill('e2e-no-such-keyword-zzz');
      await searchButton(page).click();
      await page.waitForTimeout(3000);
      expect(await pageRowTexts(page)).toEqual([]);
    },
  );
});
