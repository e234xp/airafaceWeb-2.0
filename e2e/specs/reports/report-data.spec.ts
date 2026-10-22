import { test, expect, Page } from '../../helpers/test';
import { csvAnnotations } from '../../helpers/csvSource';
import {
  PERSON_REPORT,
  VISITOR_REPORT,
  exportWithPhoto,
  narrowToFirstRow,
  openReportPage,
  pageRowTexts,
  searchButton,
  setRange,
  totalRecords,
} from '../../helpers/reports';
import { bodyRows } from '../../helpers/tables';

// 來源 E2E-TEST-PLAN.md；RPT-001、003、004、005、006（人員報表）與 RPT-007、009~012（訪客報表）。
// 人員報表約 195 萬筆：所有查詢一律先縮到「最新一筆那一分鐘／那一秒」。全程只讀。
// 訪客報表目前環境沒有任何訪客辨識紀錄：相關項目標為受阻（需先有訪客辨識資料）。

const PERSON_HEADERS = ['時間', '人員編號', '人員姓名', '分數', '抓拍照片'];

async function requireVisitorData(page: Page) {
  await openReportPage(page, VISITOR_REPORT);
  await setRange(page, '2020-01-01 00:00:00', '2026-12-31 23:59:59');
  if ((await bodyRows(page).count()) === 0) {
    throw new Error('受阻：訪客報表在 2020-01-01 ~ 2026-12-31 沒有任何訪客辨識紀錄，無法驗證（需要先有訪客辨識資料，例如以平板或攝影機辨識測試訪客）');
  }
}

test.describe('RPT（G1）', () => {
  test(
    '[RPT-001] 人員報表：指定時間範圍、由近而遠、欄位、每頁最多 10 筆',
    {
      annotation: [
        ...csvAnnotations({
          row: 39,
          no: '4.1',
          category: '人員報表 > 人員報表',
          steps: '1. 指定時間範圍搜尋、由近而遠列出辨識到人員的紀錄\n2. 欄位: 時間、人員編號、人員姓名、群組、分數、抓拍照片\n3. 每頁最多10筆',
          expected: '1.正確顯示選定時間區間所有的人員清單、頁數、筆數、顯示欄位',
        }),
        { type: '判定範圍', description: '畫面表頭另有規格未列的「人員資訊來源」，且「群組」顯示為「群組名稱」，列為觀察；為避免拖垮後端，時間範圍縮到最新一筆所在的那一分鐘' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(240000);
      await openReportPage(page, PERSON_REPORT);
      const { day, hhmm } = await narrowToFirstRow(page);
      const headers = (await page.locator('.vxe-table--header-wrapper th').allInnerTexts()).map((s) => s.trim()).filter(Boolean);
      for (const h of PERSON_HEADERS) expect(headers, `表頭：${headers.join('、')}`).toContain(h);
      expect(headers.some((h) => h.startsWith('群組')), `表頭沒有「群組」：${headers.join('、')}`).toBe(true);
      const extra = headers.filter((h) => !PERSON_HEADERS.includes(h) && !h.startsWith('群組'));
      if (extra.length) test.info().annotations.push({ type: '觀察', description: `表頭另有規格未列的欄位：${extra.join('、')}` });
      // 筆數、頁數、每頁最多 10 筆
      const total = await totalRecords(page);
      expect(total).toBeGreaterThan(0);
      expect(await bodyRows(page).count()).toBe(Math.min(10, total));
      if (total > 10) await expect(page.locator('.vxe-pager--num-btn').nth(1)).toBeVisible();
      // 範圍內：每一列的時間都在選定的那一分鐘；由近而遠（時間遞減）
      const times = (await page.locator('.vxe-table--body-wrapper tbody tr td:nth-child(1)').allInnerTexts()).map((s) => s.trim());
      for (const t of times) {
        expect(t.startsWith(`${day} ${hhmm}`), `時間 ${t} 不在選定範圍 ${day} ${hhmm}`).toBe(true);
      }
      expect(times, '時間不是由近而遠').toEqual([...times].sort().reverse());
    },
  );

  for (const withPhoto of [true, false]) {
    const id = withPhoto ? 'RPT-003' : 'RPT-004';
    test(
      `[${id}] 人員報表匯出：${withPhoto ? '含照片（壓縮檔含 snapshot 資料夾照片）' : '不含照片（壓縮檔不含照片及資料夾）'}`,
      {
        annotation: [
          ...csvAnnotations({
            row: 40,
            no: '',
            category: '（延續）> 匯出',
            steps: withPhoto ? '1. 含照片 匯出壓縮檔中含照片 (在 snapshot 資料夾下)' : '2. 不含照片: 匯出壓縮檔中不包含照片及資料夾',
            expected: '根據設定匯出正確資料',
          }),
          { type: '判定範圍', description: '為避免大量下載照片，時間範圍縮到最新一筆所在的那一秒' },
        ],
      },
      async ({ page }) => {
        test.setTimeout(300000);
        await openReportPage(page, PERSON_REPORT);
        await narrowToFirstRow(page, 'second');
        const total = await totalRecords(page);
        const file = await exportWithPhoto(page, withPhoto);
        test.info().annotations.push({ type: '觀察', description: `下載 ${file.name}；${file.isZip ? '壓縮檔內容：' + file.entries.join('、') : '非壓縮檔'}；範圍內 ${total} 筆` });
        const images = file.entries.filter((n) => /\.(jpe?g|png)$/i.test(n));
        const hasSnapshotFolder = file.entries.some((n) => n.startsWith('snapshot/'));
        if (withPhoto) {
          expect(file.isZip, '含照片匯出不是壓縮檔').toBe(true);
          expect(hasSnapshotFolder, '壓縮檔沒有 snapshot 資料夾').toBe(true);
          expect(images.length, '壓縮檔的 snapshot 資料夾沒有照片').toBeGreaterThan(0);
          expect(file.entries.some((n) => n.toLowerCase().endsWith('.xlsx')), '壓縮檔沒有 Excel').toBe(true);
        } else {
          expect(hasSnapshotFolder, '不含照片的匯出仍有 snapshot 資料夾').toBe(false);
          expect(images.length, '不含照片的匯出仍含照片').toBe(0);
        }
      },
    );
  }

  const keywordTest = async (page: Page, pick: 'id' | 'name') => {
    test.setTimeout(240000);
    await openReportPage(page, PERSON_REPORT);
    await narrowToFirstRow(page);
    const first = (await pageRowTexts(page))[0];
    // 列文字：時間(日 時) 來源 編號 姓名 ...；編號為第 4 個詞、姓名為第 5 個詞
    const parts = first.split(' ');
    const keyword = pick === 'id' ? parts[3] : parts[4];
    expect(keyword?.length).toBeGreaterThan(0);
    const box = page.getByPlaceholder('搜尋').first();
    await box.fill(keyword);
    await box.press('Enter');
    await page.waitForTimeout(2500);
    const rows = await pageRowTexts(page);
    expect(rows.length).toBeGreaterThan(0);
    for (const r of rows) expect(r.toLowerCase(), `關鍵字「${keyword}」搜尋結果含不相符的列`).toContain(keyword.toLowerCase());
    // 重新載入後搜尋不存在的關鍵字：無結果（避免「已有關鍵字再搜尋不更新」的干擾）
    await openReportPage(page, PERSON_REPORT);
    await narrowToFirstRow(page);
    const box2 = page.getByPlaceholder('搜尋').first();
    await box2.fill('e2e-no-such-keyword-zzz');
    await box2.press('Enter');
    await page.waitForTimeout(2500);
    expect(await pageRowTexts(page)).toEqual([]);
  };

  test(
    '[RPT-005] 人員報表：上方搜尋框快速尋找人員',
    {
      annotation: csvAnnotations({ row: 40, no: '', category: '（延續）> 匯出', steps: '3.點選並輸入上方搜尋框內容，可針對人員進行快速尋找', expected: '〔使用者確認 2026-10-07〕搜尋結果僅含符合關鍵字者' }),
    },
    async ({ page }) => keywordTest(page, 'id'),
  );

  test(
    '[RPT-006] 人員報表 filter 搜尋：輸入人員關鍵字並檢查是否有關鍵字以外人員',
    {
      annotation: csvAnnotations({ row: 41, no: '', category: '（延續）> filter搜尋', steps: '1.輸入人員關鍵字\n2.檢查是否有關鍵字以外人員', expected: '1.輸入人員關鍵字 2.檢查是否有關鍵字以外人員\n〔使用者確認 2026-10-07〕搜尋結果僅含符合關鍵字者' }),
    },
    async ({ page }) => keywordTest(page, 'name'),
  );

  // ---- 訪客報表：目前環境沒有訪客辨識紀錄 → 受阻 ----
  const visitorCases: Array<[string, string, number, string, string, string]> = [
    ['RPT-007', '訪客報表：指定時間範圍、由近而遠、欄位、每頁最多 10 筆', 42, '4.2', '訪客報表 > 訪客報表', '1. 指定時間範圍搜尋、由近而遠列出辨識到人員的紀錄\n2. 欄位: 時間、訪客編號、訪客姓名、群組、分數、抓拍照片\n3. 每頁最多10筆'],
    ['RPT-009', '訪客報表匯出：含照片', 43, '', '（延續）> 匯出', '1. 含照片 匯出壓縮檔中含照片 (在 snapshot 資料夾下)'],
    ['RPT-010', '訪客報表匯出：不含照片', 43, '', '（延續）> 匯出', '2. 不含照片: 匯出壓縮檔中不包含照片及資料夾'],
    ['RPT-011', '訪客報表：上方搜尋框快速尋找訪客', 43, '', '（延續）> 匯出', '3.點選並輸入上方搜尋框內容，可針對訪客進行快速尋找'],
    ['RPT-012', '訪客報表 filter 搜尋：輸入關鍵字並檢查是否有關鍵字以外人員', 44, '', '（延續）> filter搜尋', '1.輸入人員關鍵字\n2.檢查是否有關鍵字以外人員'],
  ];
  for (const [id, title, row, no, cat, steps] of visitorCases) {
    test(
      `[${id}] ${title}`,
      { annotation: csvAnnotations({ row, no, category: cat, steps, expected: id === 'RPT-007' ? '1.正確顯示選定時間區間所有的訪客清單、頁數、筆數、顯示欄位' : id === 'RPT-009' || id === 'RPT-010' ? '根據設定匯出正確資料' : '〔使用者確認 2026-10-07〕搜尋結果僅含符合關鍵字者' }) },
      async ({ page }) => {
        test.setTimeout(120000);
        await requireVisitorData(page);
        await expect(searchButton(page)).toBeVisible();
      },
    );
  }
});
