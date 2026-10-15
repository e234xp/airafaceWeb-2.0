import { Page, expect, test } from '@playwright/test';
import { AttPerson, AttSettings, applyAtt, cleanupAttPersons, createAttPerson, dailyRow, punch, restoreAtt, snapshotAtt, ymd } from '../../helpers/attOps';
import { shot } from '../../helpers/evidence';

// 考勤計算規則（ATT-029、043～046、048～052）。
// 後端確認：非當天資料不會立即刷新，所以一律用「今天」補打卡，日出勤頁即時可讀。
// 色塊：正常綠 rgb(87,189,55)、遲到／早退橘 rgb(238,116,71)、時間未到白、缺紀錄淡紫 rgb(216,205,227)。
const GREEN = 'rgb(87, 189, 55)';
const ORANGE = 'rgb(238, 116, 71)';
let snap: AttSettings | null = null;
const people: AttPerson[] = [];

test.afterEach(async ({ browser }) => {
  await restoreAtt(browser, snap);
  await cleanupAttPersons(browser, people.splice(0));
});

const BASE = {
  defined_clockin_time_hour: 9,
  defined_clockin_time_min: 0,
  defined_clockin_time_buffer_mins: 30,
  defined_clockin_adjustment_enabled: false,
  defined_clockout_time_hour: 14,
  defined_clockout_time_min: 0,
  defined_clockout_time_buffer_mins: 30,
  defined_clockout_adjustment_enabled: false,
  defined_break_time_mins: 60,
  defined_overtime_enabled: false,
  defined_overtime_time_hour: 14,
  defined_overtime_time_min: 0,
  defined_overtime_minimum_min: 0,
  defined_clockin_time_late_enabled: true,
  defined_clockout_time_early_leave_enabled: true,
} as AttSettings;

async function setup(page: Page, tag: string, patch: AttSettings = {}) {
  snap = await snapshotAtt(page);
  await applyAtt(page, snap, { ...BASE, ...patch });
  const who = await createAttPerson(page, tag);
  people.push(who);
  return who;
}
const today = () => ymd(new Date());

/** 讀日出勤（今天）該人員的欄位與上下兩格色塊。cells：人員｜群組｜日期｜上班時數｜加班時數｜上班時間｜下班時間｜…… */
async function read(page: Page, who: AttPerson) {
  const row = await dailyRow(page, who, 0);
  const colors = await page.evaluate((name) => {
    const tr = Array.from(document.querySelectorAll('.vxe-table--body-wrapper tbody tr')).find((r) => r.textContent?.includes(name));
    const out: string[] = [];
    tr?.querySelectorAll('div').forEach((d) => {
      const c = getComputedStyle(d).backgroundColor;
      if (c && c !== 'rgba(0, 0, 0, 0)') out.push(c);
    });
    return out;
  }, who.name);
  return {
    cells: row.cells,
    hours: row.cells[3] || '',
    overtime: row.cells[4] || '',
    inTime: row.cells[5] || '',
    outTime: row.cells[6] || '',
    inColor: colors[0],
    outColor: colors[colors.length - 1],
  };
}
const hhmm = (s: string) => (s || '').slice(0, 5);
const isZero = (s: string) => ['', '00:00', '0'].includes(hhmm(s));

test.describe('ATT 規則', () => {
  test('[ATT-029] 補打卡：以最晚操作的補打卡計算出勤', async ({ page }) => {
    test.setTimeout(300000);
    const who = await setup(page, 'r29');
    await punch(page, who, today(), 'in', '09:00');
    await punch(page, who, today(), 'out', '13:40');
    const first = await read(page, who);
    expect(hhmm(first.inTime)).toBe('09:00');
    await punch(page, who, today(), 'in', '09:20');
    const second = await read(page, who);
    expect(hhmm(second.inTime), '最晚一次補打卡 09:20 應取代 09:00').toBe('09:20');
    await shot(page, 'ATT-029', '01-補打卡兩次後日出勤取最晚一次');
  });

  test('[ATT-043] 遲到：上班紀錄晚於表定上班時間＋緩衝時間', async ({ page }) => {
    test.setTimeout(300000);
    const who = await setup(page, 'r43');
    await punch(page, who, today(), 'in', '09:31');
    await punch(page, who, today(), 'out', '13:40');
    const late = await read(page, who);
    expect(late.inColor, '09:31 晚於 09:00＋30 分，應為遲到橘色').toBe(ORANGE);
    await punch(page, who, today(), 'in', '09:30');
    const ok = await read(page, who);
    expect(ok.inColor, '09:30 未超過 09:00＋30 分，應為正常綠色').toBe(GREEN);
    await shot(page, 'ATT-043', '01-上班時間09:30為正常');
  });

  test('[ATT-044] 早退：下班紀錄早於表定下班時間－緩衝時間', async ({ page }) => {
    test.setTimeout(300000);
    const who = await setup(page, 'r44');
    await punch(page, who, today(), 'in', '09:00');
    await punch(page, who, today(), 'out', '13:29');
    const early = await read(page, who);
    expect(early.outColor, '13:29 早於 14:00－30 分，應為早退橘色').toBe(ORANGE);
    await punch(page, who, today(), 'out', '13:30');
    const ok = await read(page, who);
    expect(ok.outColor, '13:30 未早於 14:00－30 分，應為正常綠色').toBe(GREEN);
    await shot(page, 'ATT-044', '01-下班時間13:30為正常');
  });

  test('[ATT-045] 勾選最早上班時間以表定上班時間計，取上班紀錄與表定上班時間較晚者', async ({ page }) => {
    test.setTimeout(300000);
    const who = await setup(page, 'r45', { defined_clockin_adjustment_enabled: true });
    await punch(page, who, today(), 'in', '08:00');
    await punch(page, who, today(), 'out', '14:00');
    const r = await read(page, who);
    // 以 09:00 計：14:00 − 09:00 − 休息 60 分 = 04:00（未勾選時為 05:00）
    expect(hhmm(r.hours), `上班時數（cells=${r.cells.join('|')}）`).toBe('04:00');
    await shot(page, 'ATT-045', '01-勾選最早上班時間後上班時數');
  });

  test('[ATT-046] 勾選最晚下班時間以表定下班時間計，取下班紀錄與表定下班時間較早者', async ({ page }) => {
    test.setTimeout(300000);
    const who = await setup(page, 'r46', { defined_clockout_adjustment_enabled: true });
    await punch(page, who, today(), 'in', '09:00');
    await punch(page, who, today(), 'out', '15:00');
    const r = await read(page, who);
    // 以 14:00 計：14:00 − 09:00 − 60 分 = 04:00（未勾選時為 05:00）
    expect(hhmm(r.hours), `上班時數（cells=${r.cells.join('|')}）`).toBe('04:00');
    await shot(page, 'ATT-046', '01-勾選最晚下班時間後上班時數');
  });

  test('[ATT-048] 上班時數 = 下班記錄 − 上班記錄 − 休息時間', async ({ page }) => {
    test.setTimeout(300000);
    const who = await setup(page, 'r48', { defined_break_time_mins: 30 });
    await punch(page, who, today(), 'in', '08:00');
    await punch(page, who, today(), 'out', '14:00');
    const r = await read(page, who);
    // 14:00 − 08:00 − 30 分 = 05:30
    expect(hhmm(r.hours), `上班時數（cells=${r.cells.join('|')}）`).toBe('05:30');
    await shot(page, 'ATT-048', '01-上班時數');
  });

  test('[ATT-049] 未勾選計算加班，加班時數 = 0', async ({ page }) => {
    test.setTimeout(300000);
    const who = await setup(page, 'r49', { defined_overtime_enabled: false, defined_overtime_time_hour: 10, defined_overtime_time_min: 0 });
    await punch(page, who, today(), 'in', '08:00');
    await punch(page, who, today(), 'out', '11:00');
    const r = await read(page, who);
    expect(isZero(r.overtime), `加班時數應為 0（cells=${r.cells.join('|')}）`).toBe(true);
    await shot(page, 'ATT-049', '01-未勾選加班');
  });

  test('[ATT-050] 下班紀錄早於加班起算時間＋加班緩衝時間，加班時數 = 0', async ({ page }) => {
    test.setTimeout(300000);
    const who = await setup(page, 'r50', { defined_overtime_enabled: true, defined_overtime_time_hour: 14, defined_overtime_time_min: 0, defined_overtime_minimum_min: 30 });
    await punch(page, who, today(), 'in', '09:00');
    await punch(page, who, today(), 'out', '14:20');
    const r = await read(page, who);
    expect(isZero(r.overtime), `14:20 早於 14:00＋30 分，加班應為 0（cells=${r.cells.join('|')}）`).toBe(true);
    await shot(page, 'ATT-050', '01-下班早於加班起算加緩衝');
  });

  test('[ATT-051] 加班時數 = 下班紀錄 − 加班起算時間', async ({ page }) => {
    test.setTimeout(300000);
    const who = await setup(page, 'r51', { defined_overtime_enabled: true, defined_overtime_time_hour: 14, defined_overtime_time_min: 0, defined_overtime_minimum_min: 0 });
    await punch(page, who, today(), 'in', '09:00');
    await punch(page, who, today(), 'out', '15:30');
    const r = await read(page, who);
    expect(hhmm(r.overtime), `加班時數（cells=${r.cells.join('|')}）`).toBe('01:30');
    await shot(page, 'ATT-051', '01-加班時數');
  });

  test('[ATT-052] 更改考勤設定後出勤狀態立即改變（上班 7:00 改 8:00，7:30 打卡）', async ({ page }) => {
    test.setTimeout(300000);
    const who = await setup(page, 'r52', { defined_clockin_time_hour: 9, defined_clockin_time_min: 0, defined_clockin_time_buffer_mins: 30 });
    await punch(page, who, today(), 'in', '09:45');
    await punch(page, who, today(), 'out', '13:40');
    const before = await read(page, who);
    expect(before.inColor, `表定 9:00、緩衝 30，9:45 應為遲到（cells=${before.cells.join('|')}）`).toBe(ORANGE);
    await applyAtt(page, snap as AttSettings, { ...BASE, defined_clockin_time_hour: 10, defined_clockin_time_min: 0, defined_clockin_time_buffer_mins: 30 });
    const after = await read(page, who);
    expect(after.inColor, '表定改 10:00 後，9:45 應為正常').toBe(GREEN);
    await shot(page, 'ATT-052', '01-改表定後狀態改變');
  });
  test('[ATT-047] 上班時數：勾選計算加班時取下班紀錄與表定下班時間較早者', async ({ page }) => {
    test.setTimeout(300000);
    const who = await setup(page, 'r47', { defined_clockout_time_hour: 10, defined_clockout_time_min: 0, defined_overtime_enabled: true, defined_overtime_time_hour: 10, defined_overtime_time_min: 0, defined_overtime_minimum_min: 0 });
    await punch(page, who, today(), 'in', '08:00');
    await punch(page, who, today(), 'out', '11:30');
    const r = await read(page, who);
    // 補打卡不能選未來時間，改用較早的時段：表定下班 10:00、下班紀錄 11:30，取較早者 10:00 → 10:00 − 08:00 − 60 分 = 01:00；加班 = 11:30 − 10:00 = 01:30
    expect(hhmm(r.hours), '勾選計算加班時上班時數應取下班紀錄與表定下班較早者').toBe('01:00');
    expect(hhmm(r.overtime), '加班時數').toBe('01:30');
    await shot(page, 'ATT-047', '01-勾選計算加班時的上班時數');
  });

  test('[ATT-039] 有上班卡、無下班卡 → 有上班卡紀錄、無下班卡紀錄', async ({ page }) => {
    test.setTimeout(300000);
    const who = await setup(page, 'r39');
    await punch(page, who, today(), 'in', '09:00');
    const r = await read(page, who);
    expect(r.inTime, `上班時間（cells=${r.cells.join('|')}）`).toContain('09:00');
    expect(r.outTime.trim(), `下班時間應為空（cells=${r.cells.join('|')}）`).toBe('');
    await shot(page, 'ATT-039', '01-有上班卡無下班卡');
  });

  // 補卡不能選未來時間，以下只用較早的時間。「當天最新一筆」解讀為最後補的那一筆。
  test('[ATT-041] 上班判定優先順序：補上班卡以當天最新一筆為準', async ({ page }) => {
    test.setTimeout(300000);
    const who = await setup(page, 'r41');
    await punch(page, who, today(), 'in', '08:40');
    await punch(page, who, today(), 'in', '08:55');
    const r = await read(page, who);
    expect(r.inTime, `兩筆補上班卡（08:40、08:55），應取最新一筆 08:55（cells=${r.cells.join('|')}）`).toContain('08:55');
    await shot(page, 'ATT-041', '01-補上班卡取最新一筆');
  });

  test('[ATT-042] 下班判定順序：補下班卡以當天最新一筆為準', async ({ page }) => {
    test.setTimeout(300000);
    const who = await setup(page, 'r42');
    await punch(page, who, today(), 'in', '08:30');
    await punch(page, who, today(), 'out', '10:00');
    await punch(page, who, today(), 'out', '10:20');
    const r = await read(page, who);
    expect(r.outTime, `兩筆補下班卡（10:00、10:20），應取最新一筆 10:20（cells=${r.cells.join('|')}）`).toContain('10:20');
    await shot(page, 'ATT-042', '01-補下班卡取最新一筆');
  });
});
