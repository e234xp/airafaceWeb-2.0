import { test } from '@playwright/test';
import { AttPerson, AttSettings, applyAtt, cleanupAttPersons, createAttPerson, dailyRow, punch, recentWeekday, restoreAtt, snapshotAtt, ymd } from '../../helpers/attOps';

// 考勤計算相關測項（ATT-043~052）。補打卡 → 日報表檢查狀態與時數。
let snap: AttSettings | null = null;
const people: AttPerson[] = [];

test.afterEach(async ({ browser }) => {
  await restoreAtt(browser, snap);
  await cleanupAttPersons(browser, people.splice(0));
});

test('[ATT-DIAG] 探測日報表呈現', async ({ page }) => {
  test.setTimeout(300000);
  snap = await snapshotAtt(page);
  const who = await createAttPerson(page, 'dg');
  people.push(who);
  const { date, offset } = recentWeekday();
  await punch(page, who, date, 'in', '09:00');
  await punch(page, who, date, 'out', '18:30');
  const t0 = Date.now();
  for (let i = 0; i < 8; i += 1) {
    await page.goto('/#/attendance/changeAttendanceClockIn');
    await page.reload().catch(() => page.goto(page.url()));
    await page.getByRole('button', { name: '搜尋' }).click();
    await page.waitForTimeout(3000);
    const rows = (await page.locator('.vxe-table--body-wrapper tbody tr').filter({ hasText: who.name }).allInnerTexts()).length;
    const all = (await page.locator('.vxe-table--body-wrapper tbody tr').count());
    const total = (await page.locator('.vxe-pager').innerText()).replace(/\s+/g, ' ');
    console.log('POLL', Math.round((Date.now() - t0) / 1000), 's 本人列數', rows, '頁面列數', all, total);
    if (rows >= 2) break;
    await page.waitForTimeout(7000);
  }
  const row = await dailyRow(page, who, offset);
  console.log('DAYROW', date, row.text);
});

test('[ATT-DIAG2] 探測當天補打卡呈現', async ({ page }) => {
  test.setTimeout(300000);
  snap = await snapshotAtt(page);
  const who = await createAttPerson(page, 'd2');
  people.push(who);
  const today = ymd(new Date());
  await applyAtt(page, snap, { defined_clockin_time_hour: 9, defined_clockin_time_min: 0, defined_clockout_time_hour: 14, defined_clockout_time_min: 0, defined_break_time_mins: 60, defined_overtime_enabled: true, defined_overtime_time_hour: 14, defined_overtime_time_min: 0, defined_overtime_minimum_min: 0 });
  await punch(page, who, today, 'in', '08:00');
  await punch(page, who, today, 'out', '15:00');
  const row = await dailyRow(page, who, 0);
  console.log('DAYROW2', today, row.text);
});

test('[ATT-DIAG3] 探測 07:30 上班打卡', async ({ page }) => {
  test.setTimeout(300000);
  snap = await snapshotAtt(page);
  const who = await createAttPerson(page, 'd3');
  people.push(who);
  const today = ymd(new Date());
  const base = { defined_clockout_time_hour: 14, defined_clockout_time_min: 0, defined_clockout_time_buffer_mins: 30, defined_break_time_mins: 60, defined_overtime_enabled: false };
  await applyAtt(page, snap, { ...base, defined_clockin_time_hour: 7, defined_clockin_time_min: 0, defined_clockin_time_buffer_mins: 0 });
  await punch(page, who, today, 'in', '07:30');
  await punch(page, who, today, 'out', '13:40');
  console.log('D3-A 緩衝0', (await dailyRow(page, who, 0)).text);
  await applyAtt(page, snap, { ...base, defined_clockin_time_hour: 7, defined_clockin_time_min: 0, defined_clockin_time_buffer_mins: 30 });
  console.log('D3-B 緩衝30', (await dailyRow(page, who, 0)).text);
  await punch(page, who, today, 'in', '08:10');
  console.log('D3-C 08:10', (await dailyRow(page, who, 0)).text);
});
