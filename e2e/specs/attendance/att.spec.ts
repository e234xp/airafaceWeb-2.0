import { test, expect, Page } from '@playwright/test';
import { csvAnnotations } from '../../helpers/csvSource';
import { shot } from '../../helpers/evidence';
import { cleanupAttPersons, createAttPerson, ymd } from '../../helpers/attOps';
import { bodyRows, readAllRows, typeSearch } from '../../helpers/tables';

// 搜尋判定（使用者決議）：搜尋結果僅含符合關鍵字者。
// 做法：取清單第一位人員名稱的第一個單字當關鍵字，比對搜尋結果「每列都含關鍵字」且
// 「筆數 = 未搜尋時含關鍵字的列數」；再搜尋一個不存在的關鍵字，結果應為空。
async function searchKeywordTest(page: Page, route: string) {
  await page.goto(route);
  await page.reload();
  await bodyRows(page).first().waitFor();
  const before = await readAllRows(page);
  expect(before.length).toBeGreaterThan(0);
  const keyword = before[0].split(' ')[0];
  const expected = before.filter((r) => r.includes(keyword)).length;

  await typeSearch(page, keyword);
  const after = await readAllRows(page);
  expect(after.length).toBe(expected);
  for (const r of after) expect(r).toContain(keyword);

  await typeSearch(page, 'e2e-no-such-person-zzz');
  expect(await readAllRows(page)).toEqual([]);
}

// 骨架（自動產生）：來源 E2E-TEST-PLAN.md；模組 ATT，共 52 個 Test ID。
// 目前全部為 test.fixme（尚未實作）。實作時不得改動 Test ID 與標題前綴；assertion 只能依 Plan 的預期結果。
// 注意：fixme 不等於「使用者同意跳過」，Results 狀態需依 E2E-TEST-RULE.md §5 另行判定。

// 人員通行資料（詳細）頁的搜尋：先進入有「詳細」按鈕（有打卡紀錄）的人員，再比對搜尋結果。
async function detailSearchTest(page: Page, route: string) {
  await page.goto(route);
  await page.reload();
  await bodyRows(page).first().waitFor();
  await page.locator('.btn-detail').first().click();
  await expect(page.locator('.vxe-table--header-wrapper th').filter({ hasText: '打卡模式' }).first()).toBeVisible();
  const before = await readAllRows(page);
  expect(before.length).toBeGreaterThan(0);
  const keyword = before[0].split(' ')[0]; // 人員編號
  const expected = before.filter((r) => r.includes(keyword)).length;

  await typeSearch(page, keyword);
  const after = await readAllRows(page);
  expect(after.length).toBe(expected);
  for (const r of after) expect(r).toContain(keyword);

  await typeSearch(page, 'e2e-no-such-record-zzz');
  expect(await readAllRows(page)).toEqual([]);
}

const localDate = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

async function openAttendanceSettings(page: Page) {
  await page.goto('/#/attendance/attendancesettings');
  await page.reload();
  await expect(page.locator('.vxe-table').nth(0)).toBeVisible();
}

// 清理：刪除本測項加入的 2030 年指定假日／非假日並套用（以獨立的 Admin 環境執行，測項失敗也會執行）
async function cleanupSpecifiedDates(browser: import('@playwright/test').Browser) {
  const ctx = await browser.newContext({
    ignoreHTTPSErrors: true,
    baseURL: process.env.E2E_BASE_URL,
    storageState: 'e2e/.auth/admin.json',
  });
  try {
    const p = await ctx.newPage();
    await openAttendanceSettings(p);
    let changed = false;
    for (const idx of [0, 1]) {
      const rows = p.locator('.vxe-table').nth(idx).locator('.vxe-body--row').filter({ hasText: '2030' });
      while ((await rows.count()) > 0) {
        await rows.first().locator('button').first().click();
        changed = true;
      }
    }
    if (changed) {
      await p.locator('button.btn-primary').filter({ hasText: '套用' }).click();
      await p.locator('.swal2-icon.swal2-success').waitFor({ timeout: 8000 }).catch(() => {});
    }
  } finally {
    await ctx.close();
  }
}

// 出勤操作：進入「出勤操作」頁並開啟「變更出勤紀錄」表單
async function openChangeAttendance(page: Page) {
  await page.goto('/#/attendance/changeAttendanceClockIn');
  await page.reload();
  await page.locator('button.btn-outline-primary').first().click();
  await expect(page.locator('.v-select')).toBeVisible();
}

// 選取職員：展開下拉選單，點第一個選項，回傳其顯示名稱
async function pickFirstStaff(page: Page): Promise<string> {
  await page.locator('.v-select .vs__search').click();
  const opt = page.locator('.vs__dropdown-option').first();
  await opt.waitFor();
  const label = (await opt.innerText()).trim().split(/\s+/)[0];
  await opt.click();
  return label;
}

test.describe("ATT", () => {
  // 建議執行方式：PW｜可行性：P｜本輪處置：可進入實作
  test.fixme("[ATT-001] 日出勤：清單、頁數、筆數、欄位、顏色與時數規則", async () => {});

  // 建議執行方式：PW｜可行性：Y｜本輪處置：可進入實作
  test(
    "[ATT-002] 日出勤：右上角關鍵字搜尋人員",
    {
      annotation: csvAnnotations({
        row: 16,
        no: '3.1',
        category: '日出勤 > 日出勤',
        steps: '2.右上角輸入關鍵字搜尋人員',
        expected: '8.搜尋文字功能正確',
      }),
    },
    async ({ page }) => {
      await searchKeywordTest(page, '/#/attendance/persondailyattendancereport');
    },
  );

  // 建議執行方式：PW｜可行性：P｜本輪處置：可進入實作
  test(
    "[ATT-003] 日出勤：快速 filter（全部/正常/遲到/早退/無打卡紀錄）",
    {
      annotation: csvAnnotations({
        row: 16,
        no: '3.1',
        category: '日出勤 > 日出勤',
        steps: '3.頁面上方使用filter功能找出相同情況分類的人員',
        expected: '4. 提供快速 filter，包含顯示全部 (預設)、正常、遲到、早退、無打卡紀錄',
      }),
    },
    async ({ page }) => {
      await page.goto('/#/attendance/persondailyattendancereport');
      await page.reload();
      await bodyRows(page).first().waitFor();
      const names = ['全部', '正常', '遲到', '早退', '無打卡紀錄'];
      const btn = (n: string) => page.locator('button').filter({ hasText: `${n} :` }).first();
      // 提供 5 個 filter，依序為 全部、正常、遲到、早退、無打卡紀錄
      const labels = await Promise.all(names.map(async (n) => (await btn(n).innerText()).trim()));
      for (let i = 0; i < names.length; i += 1) expect(labels[i].startsWith(names[i])).toBe(true);
      // 全部為預設：其樣式與其他 filter 不同（被選取）
      const cls = await Promise.all(names.map(async (n) => (await btn(n).getAttribute('class')) ?? ''));
      for (let i = 1; i < names.length; i += 1) expect(cls[0]).not.toBe(cls[i]);
      test.info().annotations.push({ type: '觀察：filter 標籤', description: labels.join('；') });

      // 各 filter：點選後清單人數 = 標籤上的人數（正常／遲到／早退／無打卡紀錄）
      const states: string[] = [];
      for (let i = 1; i < names.length; i += 1) {
        const n = Number(labels[i].replace(/[^0-9]/g, ''));
        const enabled = await btn(names[i]).isEnabled();
        states.push(`${names[i]}=${enabled ? '可點選' : '停用'}（標籤人數 ${n}）`);
        // 規格：使用 filter 功能找出相同情況分類的人員 → filter 必須可操作；停用視為不符
        expect(enabled, `${names[i]} filter 應可點選`).toBe(true);
        await btn(names[i]).click();
        await page.waitForTimeout(500);
        const rows = await readAllRows(page);
        states.push(`${names[i]} 點選後清單=${rows.length}`);
        expect(rows.length, `${names[i]} 清單人數應等於標籤人數`).toBe(n);
      }
      test.info().annotations.push({ type: '觀察：filter 狀態', description: states.join('；') });
      // 全部：顯示所有人員（人數 = 分頁列的總筆數）
      await btn('全部').click();
      await page.waitForTimeout(500);
      const all = await readAllRows(page);
      const pagerText = await page.locator('.vxe-pager').innerText();
      const total = Number(pagerText.slice(pagerText.indexOf('共')).replace(/[^0-9]/g, ''));
      expect(all.length).toBe(total);
      const others = labels.slice(1).map((l) => Number(l.replace(/[^0-9]/g, '')));
      test.info().annotations.push({
        type: '觀察：人數',
        description: `全部標籤=${Number(labels[0].replace(/[^0-9]/g, ''))}；全部清單=${all.length}；其餘 filter 人數合計=${others.reduce((a, b) => a + b, 0)}`,
      });
    },
  );







  // 建議執行方式：PW｜可行性：Y｜本輪處置：可進入實作
  test(
    "[ATT-010] 該日人員通行資料：關鍵字搜尋",
    {
      annotation: csvAnnotations({
        row: 18,
        no: '3.3',
        category: '（延續）> 該日人員通行資料',
        steps: '2.進入人員出勤資料頁面，關鍵字搜尋、檢查欄位資料、匯出',
        expected: '〔使用者確認 2026-10-07〕搜尋結果僅含符合關鍵字者',
      }),
    },
    async ({ page }) => {
      await detailSearchTest(page, '/#/attendance/persondailyattendancereport');
    },
  );


  // 建議執行方式：PW｜可行性：Y｜本輪處置：可進入實作
  test(
    "[ATT-012] 月出勤：右上角關鍵字搜尋人員",
    {
      annotation: csvAnnotations({
        row: 19,
        no: '3.4',
        category: '月出勤 > 月出勤',
        steps: '2.右上角輸入關鍵字搜尋人員',
        expected: '2.搜尋文字功能正確',
      }),
    },
    async ({ page }) => {
      await searchKeywordTest(page, '/#/attendance/personmonthlyattendancereport');
    },
  );








  // 建議執行方式：PW｜可行性：Y｜本輪處置：可進入實作
  test(
    "[ATT-020] 該月人員通行資料：關鍵字搜尋",
    {
      annotation: csvAnnotations({
        row: 21,
        no: '3.6',
        category: '（延續）> 該月人員通行資料',
        steps: '2.進入人員出勤資料頁面，關鍵字搜尋、檢查欄位資料、匯出',
        expected: '〔使用者確認 2026-10-07〕搜尋結果僅含符合關鍵字者',
      }),
    },
    async ({ page }) => {
      await detailSearchTest(page, '/#/attendance/personmonthlyattendancereport');
    },
  );



  // 建議執行方式：PW｜可行性：Y｜本輪處置：可進入實作
  test(
    "[ATT-023] 出勤設定：指定假日與非假日區間",
    {
      annotation: csvAnnotations({
        row: 23,
        no: '3.7',
        category: '出勤設定 > 出勤設定',
        steps: '4.設定假日、非假日日期',
        expected: '2.可以指定假日與非假日區間',
      }),
    },
    async ({ page, browser }) => {
      const holiday = '2030-01-01';
      const nonHoliday = '2030-01-02';
      try {
        await openAttendanceSettings(page);
        const pickers = page.locator('tr:has(button.btn-add) .mx-datepicker input');
        const adds = page.locator('button.btn-add');
        await pickers.nth(0).fill(holiday);
        await pickers.nth(0).press('Enter');
        await adds.nth(0).click();
        await pickers.nth(1).fill(nonHoliday);
        await pickers.nth(1).press('Enter');
        await adds.nth(1).click();
        // 預期：指定假日、非假日清單各出現所指定的日期
        await expect(page.locator('.vxe-table').nth(0).locator('.vxe-body--row').filter({ hasText: '2030' })).toHaveCount(1);
        await expect(page.locator('.vxe-table').nth(1).locator('.vxe-body--row').filter({ hasText: '2030' })).toHaveCount(1);
        // 套用後重新載入，設定仍在
        await page.locator('button.btn-primary').filter({ hasText: '套用' }).click();
        await expect(page.locator('.swal2-icon.swal2-success')).toBeVisible();
        await openAttendanceSettings(page);
        await expect(page.locator('.vxe-table').nth(0).locator('.vxe-body--row').filter({ hasText: '2030' })).toHaveCount(1);
        await expect(page.locator('.vxe-table').nth(1).locator('.vxe-body--row').filter({ hasText: '2030' })).toHaveCount(1);
      } finally {
        await cleanupSpecifiedDates(browser);
      }
    },
  );


  // 建議執行方式：MIX:PW+MAN｜可行性：T｜本輪處置：暫不測

  // 建議執行方式：PW｜可行性：Y｜本輪處置：可進入實作
  test(
    "[ATT-026] 出勤操作：選取職員與日期（日期不可為未來、當天可），顯示對應資料",
    {
      annotation: csvAnnotations({
        row: 25,
        no: '3.8',
        category: '出勤操作 > 出勤操作',
        steps: '1.點選變更出勤紀錄\n2.選擇職員\n3.選擇日期',
        expected: '1. 選取人、日期\n  - 日期不能為未來日期 (但當天可以)\n  - 選取後、顯示對應資料',
      }),
    },
    async ({ page }) => {
      await openChangeAttendance(page);
      const staff = await pickFirstStaff(page);
      // 選取後顯示對應資料：下方「目前紀錄」表格出現該職員
      await expect(page.locator('.vxe-table--body-wrapper tbody tr').filter({ hasText: staff }).first()).toBeVisible();
      const save = page.locator('button.btn-primary').filter({ hasText: '儲存' });
      // 當天可以
      await page.locator('input[type=date]').fill(localDate(0));
      await expect(save).toBeEnabled();
      // 未來日期不可（明天）
      await page.locator('input[type=date]').fill(localDate(1));
      await expect(save).toBeDisabled();
    },
  );

  // 建議執行方式：PW｜可行性：Y｜本輪處置：可進入實作
  test(
    "[ATT-027] 出勤操作：選取補上班卡或下班卡並選取時間",
    {
      annotation: csvAnnotations({
        row: 25,
        no: '3.8',
        category: '出勤操作 > 出勤操作',
        steps: '4.選擇上、下班\n5.填寫時間',
        expected: '2. 選取補上班卡或下班卡，選取時間',
      }),
    },
    async ({ page }) => {
      await openChangeAttendance(page);
      await pickFirstStaff(page);
      // 選上班 / 下班
      await page.locator('label[for=flexRadioDefault2]').click();
      await expect(page.locator('#flexRadioDefault2')).toBeChecked();
      await page.locator('label[for=flexRadioDefault1]').click();
      await expect(page.locator('#flexRadioDefault1')).toBeChecked();
      // 選取時間：開啟時間選擇器，選 00 時 05 分
      const timeInput = page.locator('.mx-datepicker input').first();
      await timeInput.click();
      await page.locator('.mx-time-column').nth(0).getByText('00', { exact: true }).click();
      await page.locator('.mx-time-column').nth(1).getByText('05', { exact: true }).click();
      await page.locator('.mx-datepicker input').first().press('Escape');
      expect(await timeInput.inputValue()).toBe('00:05');
    },
  );

  // 建議執行方式：PW｜可行性：Y｜本輪處置：可進入實作
  test(
    "[ATT-028] 出勤操作：事由不可為空（預設忘記簽到/簽退）",
    {
      annotation: [
        ...csvAnnotations({
          row: 25,
          no: '3.8',
          category: '出勤操作 > 出勤操作',
          steps: '6.填寫事由',
          expected: '3. 輸入原因 (預設忘記簽到/簽退)\n    - 不能為空',
        }),
        { type: '判定範圍', description: '未實際按儲存（會產生無法刪除的補打卡紀錄），「無法儲存」需使用者同意後以測試人員驗證（部分完成）' },
      ],
    },
    async ({ page }) => {
      await openChangeAttendance(page);
      const reason = page.locator('input.form-control.col-12');
      // 預設：忘記簽到/簽退
      await expect(reason).toHaveValue('忘記簽到/簽退');
      // 清空後出現必填提示
      await reason.fill('');
      await expect(page.locator('.invalid-feedback').filter({ hasText: '必填' })).toBeVisible();
      await shot(page, 'ATT-028', '01-清空事由的必填提示');
    },
  );


  // 建議執行方式：PW｜可行性：Y｜本輪處置：可進入實作
  test(
    "[ATT-030] 出勤操作記錄查詢：預設帶入近 7 天資料且可變更時段",
    {
      annotation: [
        ...csvAnnotations({
          row: 26,
          no: '',
          category: '（延續 3.8）> 出勤操作記錄查詢',
          steps: '1.選擇有變更出勤紀錄的時間區間',
          expected: '1. 預設帶入近7天的資料，可變更時段',
        }),
        { type: '判定說明', description: '「近 7 天」解讀為含今天的 7 個日曆日（今天-6 天 00:00:00 ~ 今天 23:59:59）' },
      ],
    },
    async ({ page }) => {
      await page.goto('/#/attendance/changeAttendanceClockIn');
      await page.reload();
      const range = page.locator('.mx-datepicker input').first();
      // 預設區間：近 7 天
      await expect(range).toHaveValue(`${localDate(-6)} 00:00:00 ~ ${localDate(0)} 23:59:59`);
      // 預設區間的查詢結果（本環境 7 天內無補打卡紀錄）
      await page.locator('button').filter({ hasText: '搜尋' }).click();
      await page.waitForTimeout(1500);
      const defaultRows = await page.locator('.vxe-table--body-wrapper tbody tr').count();
      // 可變更時段：改成較長區間後，輸入框保留新區間，且查詢結果依新區間變化
      const wide = `2020-01-01 00:00:00 ~ ${localDate(0)} 23:59:59`;
      await range.fill(wide);
      await range.press('Enter');
      await expect(range).toHaveValue(wide);
      await page.locator('button').filter({ hasText: '搜尋' }).click();
      await expect
        .poll(async () => page.locator('.vxe-table--body-wrapper tbody tr').count(), { timeout: 8000 })
        .not.toBe(defaultRows);
    },
  );



  // 建議執行方式：PW｜可行性：Y｜本輪處置：可進入實作
  test(
    "[ATT-033] 出勤操作記錄查詢：目標對象搜尋文字功能",
    {
      annotation: csvAnnotations({
        row: 26,
        no: '',
        category: '（延續 3.8）> 出勤操作記錄查詢',
        steps: '2.選擇目標對象\n3.點擊搜尋',
        expected: '4.目標對象搜尋文字功能正確',
      }),
    },
    async ({ page }) => {
      await page.goto('/#/attendance/changeAttendanceClockIn');
      await page.reload();
      const range = page.locator('.mx-datepicker input').first();
      await range.fill(`2020-01-01 00:00:00 ~ ${localDate(0)} 23:59:59`);
      await range.press('Enter');
      const search = page.locator('button').filter({ hasText: '搜尋' });
      const target = page.locator('input.form-control:not(.mx-input)').first();
      const rows = page.locator('.vxe-table--body-wrapper tbody tr');
      await search.click();
      await expect.poll(async () => rows.count(), { timeout: 8000 }).toBeGreaterThan(0);
      const before = await rows.evaluateAll((trs) => trs.map((r) => (r as HTMLElement).innerText.replace(/\s+/g, ' ').trim()));
      // 關鍵字取第一筆紀錄的目標對象姓名（班別之後的第一個字詞）
      const keyword = before[0].split(' ')[1];
      const expected = before.filter((r) => r.includes(keyword)).length;
      await target.fill(keyword);
      await search.click();
      await expect.poll(async () => rows.count(), { timeout: 8000 }).toBe(expected);
      const after = await rows.evaluateAll((trs) => trs.map((r) => (r as HTMLElement).innerText.replace(/\s+/g, ' ').trim()));
      for (const r of after) expect(r).toContain(keyword);
      // 不存在的關鍵字：無結果
      await target.fill('e2e-no-such-person-zzz');
      await search.click();
      await expect.poll(async () => rows.count(), { timeout: 8000 }).toBe(0);
    },
  );

  // 建議執行方式：PW｜可行性：P｜本輪處置：可進入實作
  test.fixme("[ATT-034] 出勤操作記錄查詢：變更出勤記錄可選定日期編輯人員上下班時間且更新成功", async () => {});













  // 建議執行方式：PW｜可行性：P｜本輪處置：暫不測






});
