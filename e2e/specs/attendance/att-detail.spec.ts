import { test, expect, Page } from '@playwright/test';
import { csvAnnotations } from '../../helpers/csvSource';
import { DAY_ROUTE, MONTH_ROUTE, applyExport, openExportDialog, openReport, pagerTotal, typeSelect } from '../../helpers/attExport';
import { bodyRows, readAllRows } from '../../helpers/tables';

// 來源 E2E-TEST-PLAN.md；ATT-007~009（該日人員通行資料）、ATT-017~019（該月人員通行資料）。全程只讀。

const DETAIL_HEADERS = ['人員編號', '人員姓名', '群組', '打卡模式', '打卡時間', '抓拍照片', '卡號'];
const detailHeader = (page: Page) => page.locator('.vxe-table--header-wrapper th').filter({ hasText: '打卡模式' }).first();

const cases = [
  { scope: '日', route: DAY_ROUTE, row: 18, no: '3.3', cat: '（延續）> 該日人員通行資料', enter: 'ATT-007', cols: 'ATT-008', exp: 'ATT-009' },
  { scope: '月', route: MONTH_ROUTE, row: 21, no: '3.6', cat: '（延續）> 該月人員通行資料', enter: 'ATT-017', cols: 'ATT-018', exp: 'ATT-019' },
];

async function openFirstDetail(page: Page, route: string) {
  await openReport(page, route);
  await page.locator('.btn-detail').first().click();
  await expect(detailHeader(page)).toBeVisible();
  await page.waitForTimeout(1000);
}

for (const d of cases) {
  test.describe(`ATT 詳細（${d.scope}）`, () => {
    test(
      `[${d.enter}] 該${d.scope}人員通行資料：點擊人員最右方按鈕進入頁面並可返回上一頁`,
      {
        annotation: csvAnnotations({
          row: d.row,
          no: d.no,
          category: d.cat,
          steps: '1.點擊人員最右方按鈕，可進入該人員出勤資料頁面\n2.進入人員出勤資料頁面，關鍵字搜尋、檢查欄位資料、匯出',
          expected: `1. 點選該人員最右邊選項查看該${d.scope}通行資料 - 需該人員當天有紀錄才會呈現此選項\n2. 頁面中須提供回到上一頁的選項`,
        }),
      },
      async ({ page }) => {
        test.setTimeout(240000);
        await openReport(page, d.route);
        const total = await pagerTotal(page);
        const n = await page.locator('.btn-detail').count();
        expect(n, '沒有任何人員有「詳細」按鈕').toBeGreaterThan(0);
        expect(n, '每位人員都有詳細按鈕，無法證明「需有紀錄才呈現」').toBeLessThan(total);
        // 每個有按鈕的人員，進入後都至少有 1 筆紀錄
        for (let i = 0; i < n; i += 1) {
          await openReport(page, d.route);
          await page.locator('.btn-detail').nth(i).click();
          await expect(detailHeader(page)).toBeVisible();
          await page.waitForTimeout(800);
          expect(await bodyRows(page).count(), `第 ${i + 1} 位人員的詳細頁沒有任何紀錄`).toBeGreaterThan(0);
        }
        // 返回：頁面要有回到上一頁的選項，按下後回到人員清單
        const back = page.getByRole('button', { name: '返回全部' });
        await expect(back).toBeVisible();
        await back.click();
        await expect(detailHeader(page)).toHaveCount(0);
        await expect(page.locator('.btn-detail').first()).toBeVisible();
      },
    );

    test(
      `[${d.cols}] 該${d.scope}人員通行資料：欄位與由早到晚排序`,
      {
        annotation: csvAnnotations({
          row: d.row,
          no: d.no,
          category: d.cat,
          steps: '2.進入人員出勤資料頁面，關鍵字搜尋、檢查欄位資料、匯出',
          expected: '3. 欄位: 人員編號、人員姓名、群組、打卡模式、打卡時間、抓拍照片、卡號\n4. 從早到晚列出紀錄',
        }),
      },
      async ({ page }) => {
        await openFirstDetail(page, d.route);
        const headers = (await page.locator('.vxe-table--header-wrapper th').allInnerTexts()).map((x) => x.trim());
        expect(headers).toEqual(DETAIL_HEADERS);
        expect((await readAllRows(page, false)).length).toBeGreaterThan(0);
        // 打卡時間欄（第 5 欄）依字串排序即為由早到晚（格式為 月/日 時:分 或 年-月-日 時:分:秒）
        const times = (await page.locator('.vxe-table--body-wrapper tbody tr td:nth-child(5)').allInnerTexts()).map((t) => t.trim()).filter(Boolean);
        expect(times, '打卡時間不是由早到晚排列').toEqual([...times].sort());
      },
    );

    test(
      `[${d.exp}] 該${d.scope}人員通行資料：匯出該人員該${d.scope}報表`,
      {
        annotation: [
          ...csvAnnotations({
            row: d.row,
            no: d.no,
            category: d.cat,
            steps: '2.進入人員出勤資料頁面，關鍵字搜尋、檢查欄位資料、匯出',
            expected: d.scope === '日' ? '5. 匯出功能正確: 點選後匯出該人員該日的日報表\n6.xlsx可選擇不列入、內嵌、檔案' : '5. 匯出: 點選後匯出該人員該月的月報表',
          }),
          { type: '判定範圍', description: '三種抓拍照片選項皆匯出一次：檢查筆數與人員；該人員有抓拍照片時，進一步檢查「不列入」沒有圖、「內嵌」xlsx 含圖、「檔案」壓縮檔含圖片檔' },
        ],
      },
      async ({ page }) => {
        test.setTimeout(300000);
        await openFirstDetail(page, d.route);
        const pageRows = await readAllRows(page, false);
        const personId = pageRows[0].split(' ')[0];
        const modal = await openExportDialog(page);
        await typeSelect(modal).selectOption({ label: '.xlsx' });
        const photoSelect = modal.locator('select').nth(2);
        const photoOpts = (await photoSelect.locator('option').allInnerTexts()).map((x) => x.trim());
        for (const need of ['不列入', '內嵌', '檔案']) expect(photoOpts, `抓拍照片選項：${photoOpts.join('、')}`).toContain(need);
        // 匯出後對話框不會自動關閉，同一個對話框依序測三種選項
        const hasPhoto = (await page.locator('.vxe-table--body-wrapper tbody tr img').count()) > 0;
        for (const opt of ['不列入', '內嵌', '檔案']) {
          await photoSelect.selectOption({ label: opt });
          const file = await applyExport(page, modal, '.xlsx');
          expect(file.rows[0]).toContain('人員編號');
          expect(file.rows.length - 1, `抓拍照片選「${opt}」匯出的筆數與頁面不符`).toBe(pageRows.length);
          for (const r of file.rows.slice(1)) expect(r).toContain(personId);
          const photoFiles = file.outerEntries.filter((n) => /.(jpe?g|png)$/i.test(n));
          test.info().annotations.push({ type: '觀察', description: `選「${opt}」：下載 ${file.zipName}；xlsx 內嵌圖片 ${file.mediaCount} 張；壓縮檔內圖片檔 ${photoFiles.length} 個` });
          if (hasPhoto) {
            if (opt === '不列入') {
              expect(file.mediaCount, '選「不列入」仍內嵌圖片').toBe(0);
              expect(photoFiles.length, '選「不列入」壓縮檔仍含圖片檔').toBe(0);
            }
            if (opt === '內嵌') expect(file.mediaCount, '選「內嵌」xlsx 沒有內嵌圖片').toBeGreaterThan(0);
            if (opt === '檔案') expect(photoFiles.length, '選「檔案」壓縮檔沒有圖片檔').toBeGreaterThan(0);
          }
          await page.waitForTimeout(500);
        }
        if (!hasPhoto) test.info().annotations.push({ type: '未驗證', description: '此人員這段期間沒有抓拍照片，內嵌／檔案的實際內容未驗證' });
      },
    );
  });
}
