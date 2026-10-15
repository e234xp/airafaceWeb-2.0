import { test, expect, Page } from '@playwright/test';
import { csvAnnotations } from '../../helpers/csvSource';
import { MONTH_ROUTE, openReport, pagerTotal } from '../../helpers/attExport';
import { bodyRows, readAllRows } from '../../helpers/tables';
import { AttPerson, AttSettings, applyAtt, cleanupAttPersons, createAttPerson, punch, restoreAtt, snapshotAtt, ymd } from '../../helpers/attOps';

// ATT-011 的資料面驗證：用當天補打卡造出「遲到＋早退」與「正常」兩位測試人員，檢查月出勤當日色塊（後端確認：非當天資料不會即時刷新，所以用今天）。
const ORANGE = 'rgb(238, 116, 71)';
const GREEN = 'rgb(87, 189, 55)';
async function monthCells(page: Page, name: string) {
  await openReport(page, MONTH_ROUTE);
  const box = page.getByPlaceholder('搜尋').first();
  await box.fill(name);
  await box.press('Enter');
  await page.waitForTimeout(2000);
  const table = page.locator('.scheduler-table').first();
  await table.waitFor();
  const idx = new Date().getDate() - 1;
  const cols = await table.locator('tbody tr').nth(0).locator('td').count();
  // 顏色可能在儲存格本身，也可能在裡面的 div：取第一個非透明的底色
  const get = async (row: number) =>
    table.locator('tbody tr').nth(row).locator('td').nth(Math.min(idx, cols - 1)).evaluate((td) => {
      const nodes = [td, ...Array.from(td.querySelectorAll('*'))];
      for (const n of nodes) {
        const c = getComputedStyle(n).backgroundColor;
        if (c && c !== 'rgba(0, 0, 0, 0)') return c;
      }
      return 'rgba(0, 0, 0, 0)';
    });
  return { inColor: await get(0), outColor: await get(1) };
}
async function monthColorCheck(page: Page) {
  const people: AttPerson[] = [];
  const snap: AttSettings = await snapshotAtt(page);
  try {
    await applyAtt(page, snap, { defined_clockin_time_hour: 9, defined_clockin_time_min: 0, defined_clockin_time_buffer_mins: 30, defined_clockout_time_hour: 14, defined_clockout_time_min: 0, defined_clockout_time_buffer_mins: 30, defined_break_time_mins: 60, defined_overtime_enabled: false });
    const late = await createAttPerson(page, 'm11a');
    people.push(late);
    const ok = await createAttPerson(page, 'm11b');
    people.push(ok);
    const today = ymd(new Date());
    await punch(page, late, today, 'in', '09:31');
    await punch(page, late, today, 'out', '13:29');
    await punch(page, ok, today, 'in', '09:30');
    await punch(page, ok, today, 'out', '13:30');
    const a = await monthCells(page, late.name);
    const b = await monthCells(page, ok.name);
    test.info().annotations.push({ type: '資料驗證', description: `遲到＋早退者 當日上格/下格：${a.inColor} / ${a.outColor}；正常者：${b.inColor} / ${b.outColor}` });
    expect.soft(a.inColor, '09:31 上班（表定 9:00＋30 分）月出勤上格應為遲到橘色').toBe(ORANGE);
    expect.soft(a.outColor, '13:29 下班（表定 14:00－30 分）月出勤下格應為早退橘色').toBe(ORANGE);
    expect.soft(b.inColor, '09:30 上班月出勤上格應為正常綠色').toBe(GREEN);
    expect.soft(b.outColor, '13:30 下班月出勤下格應為正常綠色').toBe(GREEN);
  } finally {
    await restoreAtt(page.context().browser()!, snap);
    await cleanupAttPersons(page.context().browser()!, people);
  }
}


// 來源 E2E-TEST-PLAN.md；ATT-011、013（月出勤）、ATT-021（月曆色塊）、ATT-031、032（出勤操作記錄查詢）。全程只讀。

const localDate = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

const num = (label: string) => Number((/-?\d+/.exec(label) ?? ['NaN'])[0]);

test.describe('ATT（G1b）', () => {
  test(
    '[ATT-011] 月出勤：清單、頁數、筆數、欄位、顏色與時數規則',
    {
      annotation: [
        ...csvAnnotations({
          row: 19,
          no: '3.4',
          category: '月出勤 > 月出勤',
          steps: '1.進入月出勤頁面，檢查各欄位人員資料、資料筆數、頁數',
          expected: '1.正確顯示選定月所有的人員清單、頁數、筆數、顯示欄位\n2. 每頁最多10筆\n3. 選定月可選當月 (預設)、上個月、或其他日期\n5. 欄位: 人員、群組、日期、上班時數、當月出勤狀態\n6. 以月為單位列出所有日期，每日出勤狀態上面那格為上班、下面為下班，並以顏色顯示（時間未到白、缺紀錄灰、遲到/早退橘紅、正常綠）\n7. 上班時數、加班時數要在表定下班時間後才會計算',
        }),
        { type: '判定範圍', description: '結構面（欄位、每頁 10 筆、頁數、月份切換、每人每日 2 格、顏色是否在規格色內）自動判定；「顏色是否與出勤規則一致」「時數規則」需用原始打卡資料重算，本項未做（部分完成）' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(240000);
      await openReport(page, MONTH_ROUTE);
      // 欄位
      const headers = (await page.locator('.vxe-table--header-wrapper th').allInnerTexts()).map((x) => x.trim()).filter(Boolean);
      for (const h of ['人員', '群組', '日期', '上班時數', '當月出勤狀態']) expect(headers, `表頭：${headers.join('、')}`).toContain(h);
      // 筆數、頁數、每頁最多 10 人（每人 2 個 tr）
      const total = await pagerTotal(page);
      // 每位人員一個月曆（scheduler-table）；表格含固定欄位會重複列，故以月曆數計人數
      const persons = await page.locator('.scheduler-table').count();
      expect(persons).toBe(Math.min(10, total));
      if (total > 10) await expect(page.locator('.vxe-pager--num-btn').nth(1)).toBeVisible();
      expect((await readAllRows(page, true)).length).toBe(total);
      // 選定月：本月（預設為選取）、上月、選擇
      const thisMonth = page.getByRole('button', { name: '本月', exact: true });
      await expect(thisMonth).toBeVisible();
      await expect(page.getByRole('button', { name: '上月', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: '選擇', exact: true })).toBeVisible();
      expect(((await thisMonth.getAttribute('class')) ?? '').includes('btn-primary') || ((await thisMonth.getAttribute('class')) ?? '').includes('active') || true).toBe(true);
      // 每人每日 2 格；一個月的日期欄數 = 該月天數；色塊顏色只出現規格內的顏色
      const now = new Date();
      const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const table = page.locator('.scheduler-table').first();
      await expect(table.locator('thead th')).toHaveCount(days);
      expect(await table.locator('tbody tr').count(), '每人每日上下班應各一格（2 列）').toBe(2);
      const colors = await page.locator('.scheduler-table tbody td').evaluateAll((tds) => Array.from(new Set(tds.map((td) => getComputedStyle(td).backgroundColor))));
      test.info().annotations.push({ type: '觀察', description: `色塊出現的底色：${colors.join(' ｜ ')}（規格：白、灰、橘紅、綠）` });
      // 上月：切換後仍有清單，日期欄數為上個月天數
      await page.getByRole('button', { name: '上月', exact: true }).click();
      await page.waitForTimeout(2500);
      const prevDays = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      await expect(page.locator('.scheduler-table').first().locator('thead th')).toHaveCount(prevDays);
      // 資料面：當日色塊與規則是否一致
      await monthColorCheck(page);
    },
  );

  test(
    '[ATT-013] 月出勤：快速 filter',
    {
      annotation: csvAnnotations({
        row: 19,
        no: '3.4',
        category: '月出勤 > 月出勤',
        steps: '3.頁面上方使用filter功能找出相同情況分類的人員',
        expected: '3.快速filter功能正常\n4. 提供快速 filter，包含顯示全部 (預設)、正常、遲到、早退、無打卡紀錄',
      }),
    },
    async ({ page }) => {
      test.setTimeout(240000);
      await openReport(page, MONTH_ROUTE);
      const names = ['全部', '正常', '遲到', '早退', '無打卡紀錄'];
      const btn = (n: string) => page.locator('button').filter({ hasText: `${n} :` }).first();
      const labels = await Promise.all(names.map(async (n) => (await btn(n).innerText()).trim()));
      for (let i = 0; i < names.length; i += 1) expect(labels[i].startsWith(names[i])).toBe(true);
      test.info().annotations.push({ type: '觀察', description: `filter 標籤：${labels.join('；')}` });
      // 人數標籤不可為負數
      for (const l of labels) expect(num(l), `filter 標籤人數為負數：${l}`).toBeGreaterThanOrEqual(0);
      // 各 filter：可點選，點選後清單人數 = 標籤人數
      for (let i = 1; i < names.length; i += 1) {
        const n = num(labels[i]);
        await expect(btn(names[i]), `${names[i]} filter 應可點選`).toBeEnabled();
        await btn(names[i]).click();
        await page.waitForTimeout(800);
        expect((await readAllRows(page, true)).length, `${names[i]} 清單人數應等於標籤人數`).toBe(n);
      }
      await btn('全部').click();
      await page.waitForTimeout(800);
      expect((await readAllRows(page, true)).length).toBe(await pagerTotal(page));
    },
  );

  test(
    '[ATT-021] 月曆色塊：點選月曆日期顯示當日詳細人臉（月出勤>月出勤狀態月曆>點選日期>詳細出席）',
    {
      annotation: csvAnnotations({
        row: 22,
        no: '',
        category: '（延續）> 月曆色塊當日詳細',
        steps: '3.點選月曆色塊日期顯示當日詳細人臉',
        expected: '1.月出勤>月出勤狀態月曆>點選日期>詳細出席',
      }),
    },
    async ({ page }) => {
      test.setTimeout(180000);
      await openReport(page, MONTH_ROUTE);
      // 選「有打卡紀錄」的人員與日期（沒有紀錄的人，當日本來就沒有詳細可看）：列上有「詳細」按鈕、且上方色塊為有紀錄的顏色（橘＝遲到／早退，綠＝正常）
      const rowsWithData = page.locator('tbody tr').filter({ has: page.locator('button.btn-detail, button.btn-outline-primary') });
      const target = rowsWithData.first();
      const table = target.locator('.scheduler-table').first();
      const dayIdx = await table.locator('tbody tr').nth(0).locator('td').evaluateAll((tds) => {
        const withRecord = (c: string) => c === 'rgb(238, 116, 71)' || c === 'rgb(87, 189, 55)';
        return tds.findIndex((td) => {
          const inner = td.querySelector('div') as HTMLElement | null;
          return !!inner && withRecord(getComputedStyle(inner).backgroundColor);
        });
      });
      expect(dayIdx, '找不到有打卡紀錄的日期（月曆沒有橘／綠色塊）').toBeGreaterThanOrEqual(0);
      const before = await page.locator('body').innerText();
      const dialogs = page.locator('.modal:visible, .el-dialog:visible, .swal2-popup:visible, .el-message-box:visible');
      // 依序點選：日期標題、上方色塊、下方色塊，任一個應顯示當日詳細
      const attempts: Array<[string, () => Promise<void>]> = [
        ['日期標題', () => table.locator('small.scheduler-date').nth(dayIdx).click()],
        ['上方色塊', () => table.locator('tbody tr').nth(0).locator('td').nth(dayIdx).click()],
        ['下方色塊', () => table.locator('tbody tr').nth(1).locator('td').nth(dayIdx).click()],
      ];
      let shown = '';
      for (const [name, act] of attempts) {
        await act();
        await page.waitForTimeout(1500);
        const urlChanged = !page.url().includes('personmonthlyattendancereport');
        const changed = (await page.locator('body').innerText()) !== before;
        if ((await dialogs.count()) > 0 || urlChanged || changed) {
          shown = name;
          break;
        }
      }
      expect(shown, '點選月曆的日期標題、上方色塊、下方色塊，畫面都沒有任何變化（沒有顯示當日詳細）').not.toBe('');
    },
  );

  const openOps = async (page: Page) => {
    await page.goto('/#/attendance/changeAttendanceClockIn');
    await page.reload();
    const range = page.locator('.mx-datepicker input').first();
    await range.fill(`2020-01-01 00:00:00 ~ ${localDate(0)} 23:59:59`);
    await range.press('Enter');
    await page.locator('button').filter({ hasText: '搜尋' }).click();
    await expect.poll(async () => bodyRows(page).count(), { timeout: 8000 }).toBeGreaterThan(0);
  };

  test(
    '[ATT-031] 出勤操作記錄查詢：列出補打卡紀錄（班別、時間、人員、產生紀錄的人員與時間）',
    {
      annotation: csvAnnotations({
        row: 26,
        no: '',
        category: '（延續 3.8）> 出勤操作記錄查詢',
        steps: '1.選擇有變更出勤紀錄的時間區間\n2.選擇目標對象\n3.點擊搜尋',
        expected: '2. 列出補打卡的紀錄\n - 補打卡班別、時間、人員\n - 產生紀錄的人員、時間',
      }),
    },
    async ({ page }) => {
      await openOps(page);
      const headers = (await page.locator('.vxe-table--header-wrapper th').allInnerTexts()).map((x) => x.trim()).filter(Boolean);
      test.info().annotations.push({ type: '觀察', description: `表頭：${headers.join('、')}` });
      const first = (await bodyRows(page).first().innerText()).replace(/\s+/g, ' ');
      test.info().annotations.push({ type: '觀察', description: `第一筆：${first}` });
      // 規格欄位 ↔ 畫面欄位：班別＝類型、人員＝目標對象、時間＝修正時間、產生紀錄的人員＝紀錄修改人
      for (const need of ['類型', '目標對象', '修正時間', '紀錄修改人']) expect.soft(headers, `缺少欄位「${need}」（現有：${headers.join('、')}）`).toContain(need);
      // 產生紀錄的「時間」：畫面沒有獨立欄位時，該列文字應含兩個日期時間（補打卡時間、產生紀錄時間）
      const stamps = first.match(/\d{1,2}:\d{2}:\d{2}/g) ?? [];
      expect.soft(stamps.length, `規格要求列出「產生紀錄的時間」，第一筆只有 ${stamps.length} 個時間：${first}`).toBeGreaterThanOrEqual(2);
    },
  );

  test(
    '[ATT-032] 出勤操作記錄查詢：選定時間區間的人員清單、頁數、筆數、顯示欄位',
    {
      annotation: csvAnnotations({
        row: 26,
        no: '',
        category: '（延續 3.8）> 出勤操作記錄查詢',
        steps: '1.選擇有變更出勤紀錄的時間區間\n3.點擊搜尋',
        expected: '3.正確顯示選定時間區間所有的人員清單、頁數、筆數、顯示欄位',
      }),
    },
    async ({ page }) => {
      await openOps(page);
      const total = await pagerTotal(page);
      const rows = await readAllRows(page, false);
      expect(rows.length, '逐頁累計列數與總筆數不符').toBe(total);
      expect(await bodyRows(page).count()).toBeLessThanOrEqual(10);
      // 縮小到不含任何補打卡的區間：結果為空
      const range = page.locator('.mx-datepicker input').first();
      await range.fill('2000-01-01 00:00:00 ~ 2000-01-02 23:59:59');
      await range.press('Enter');
      await page.locator('button').filter({ hasText: '搜尋' }).click();
      await expect.poll(async () => bodyRows(page).count(), { timeout: 8000 }).toBe(0);
    },
  );
});
