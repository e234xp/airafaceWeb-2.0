import { Browser, Page, expect } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { ADMIN_STORAGE_PATH } from './accounts';
import { TMP_DIR } from './files';
import { cleanupPersons, createPersonViaUI, uniquePersonId } from './persons';

// 出勤（考勤）測項共用：考勤設定快照／還原、補打卡、讀日報表。
// 補打卡會產生無法刪除的紀錄（使用者 2026-10-08 同意）；因此每個測項使用 e2eatt 開頭的專用人員，紀錄集中在這些名字下。

export type AttSettings = Record<string, unknown>;
const SETTINGS_ROUTE = '/#/attendance/attendancesettings';
const BACKUP = `${TMP_DIR}/attendance-settings-backup.json`;

type RootVm = { $root: { $globalGetAttendanceSettings: () => Promise<{ error: unknown; data: AttSettings }>; $globalSetAttendanceSettings: (q: unknown) => Promise<{ error: unknown }> } };

export async function appGetAtt(page: Page): Promise<AttSettings> {
  return page.evaluate(async () => {
    const el = Array.from(document.querySelectorAll('*')).find((e) => (e as unknown as { __vue__?: unknown }).__vue__) as unknown as { __vue__: RootVm };
    const ret = await el.__vue__.$root.$globalGetAttendanceSettings();
    if (ret.error) throw new Error('取得考勤設定失敗');
    return ret.data;
  });
}

export async function appSetAtt(page: Page, s: AttSettings): Promise<void> {
  const err = await page.evaluate(async (x) => {
    const el = Array.from(document.querySelectorAll('*')).find((e) => (e as unknown as { __vue__?: unknown }).__vue__) as unknown as { __vue__: RootVm };
    const ret = await el.__vue__.$root.$globalSetAttendanceSettings(x);
    return ret.error ? String(ret.error) : '';
  }, s);
  if (err) throw new Error(`設定考勤設定失敗：${err}`);
}

/** 取得考勤設定快照（同時寫入備份檔，避免還原失敗時遺失）。 */
export async function snapshotAtt(page: Page) {
  await page.goto(SETTINGS_ROUTE);
  await page.waitForTimeout(1000);
  await page.reload().catch(() => page.goto(page.url()));
  await page.waitForTimeout(2500);
  const s = JSON.parse(JSON.stringify(await appGetAtt(page))) as AttSettings;
  writeFileSync(BACKUP, JSON.stringify(s, null, 2));
  return s;
}

export async function restoreAtt(browser: Browser, snapshot: AttSettings | null) {
  if (!snapshot) return;
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true, baseURL: process.env.E2E_BASE_URL, storageState: ADMIN_STORAGE_PATH });
  try {
    const page = await ctx.newPage();
    await page.goto(SETTINGS_ROUTE);
    await page.waitForTimeout(1000);
  await page.reload().catch(() => page.goto(page.url()));
    await page.waitForTimeout(2500);
    await appSetAtt(page, snapshot);
  } finally {
    await ctx.close();
  }
}

/** 以產品 API 套用考勤設定（等同介面「套用」送出的資料），只覆蓋指定欄位。 */
export async function applyAtt(page: Page, base: AttSettings, patch: AttSettings) {
  await page.goto(SETTINGS_ROUTE);
  await page.waitForTimeout(1000);
  await page.reload().catch(() => page.goto(page.url()));
  await page.waitForTimeout(1500);
  await appSetAtt(page, { ...base, ...patch });
}

// ---- 測試人員 ----
export interface AttPerson {
  id: string;
  name: string;
}
export async function createAttPerson(page: Page, tag: string): Promise<AttPerson> {
  const id = uniquePersonId(tag);
  const name = `e2eatt${tag}${id.slice(-3)}`.replace(/[^a-zA-Z0-9]/g, '');
  await createPersonViaUI(page, { id, name });
  return { id, name };
}
export const cleanupAttPersons = (browser: Browser, ps: AttPerson[]) => cleanupPersons(browser, ps.map((p) => p.id));

// ---- 日期 ----
const pad = (n: number) => String(n).padStart(2, '0');
export const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
/** 最近一個「昨天或前天」的平日（日報表只有 今天／昨天／前天 三個按鈕）；找不到時回報受阻。 */
export function recentWeekday() {
  for (const off of [1, 2]) {
    const d = new Date();
    d.setDate(d.getDate() - off);
    if (d.getDay() >= 1 && d.getDay() <= 5) return { date: ymd(d), offset: off };
  }
  throw new Error('受阻：昨天與前天都是週末，日報表無法選到平日');
}

// ---- 補打卡 ----
export async function punch(page: Page, who: AttPerson, date: string, kind: 'in' | 'out', hhmm: string, reason?: string) {
  await page.goto('/#/attendance/changeAttendanceClockIn');
  await page.waitForTimeout(1000);
  await page.reload().catch(() => page.goto(page.url()));
  await page.locator('button.btn-outline-primary').first().click();
  await expect(page.locator('.v-select')).toBeVisible();
  await page.locator('.v-select .vs__search').click();
  await page.locator('.v-select .vs__search').fill(who.name);
  await page.locator('.vs__dropdown-option').filter({ hasText: who.name }).first().click();
  await page.locator('input[type=date]').fill(date);
  await page.locator(kind === 'in' ? 'label[for=flexRadioDefault1]' : 'label[for=flexRadioDefault2]').click();
  const time = page.locator('.mx-datepicker input').first();
  await time.click();
  await time.fill(hhmm);
  await time.press('Enter');
  await page.keyboard.press('Escape');
  expect(await time.inputValue(), '補打卡時間欄位沒有帶入').toBe(hhmm);
  if (reason !== undefined) await page.locator('input.form-control.col-12').fill(reason);
  const [resp] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/manualclockin'), { timeout: 15000 }),
    page.locator('button.btn-primary').filter({ hasText: '儲存' }).click(),
  ]);
  const body = (await resp.text()).slice(0, 300);
  console.log('PUNCH_RESP', who.name, date, kind, hhmm, resp.status(), body);
  expect(resp.ok(), `補打卡 API 回應 ${resp.status()}：${body}`).toBe(true);
  await expect(page.locator('.swal2-icon.swal2-success')).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(1500);
}

// ---- 日報表 ----
export interface DayRow {
  text: string;
  cells: string[];
}
/** 開啟日出勤、選日期按鈕（0=第一顆…），回傳指定人員那一列的各欄文字。 */
export async function dailyRow(page: Page, who: AttPerson, offset: number): Promise<DayRow> {
  await page.goto('/#/attendance/persondailyattendancereport');
  await page.waitForTimeout(1000);
  await page.reload().catch(() => page.goto(page.url()));
  await page.locator('.vxe-table--body-wrapper tbody tr').first().waitFor({ timeout: 30000 });
  const btns = page.locator('.btn-group .btn');
  const names = (await btns.allInnerTexts()).map((s) => s.trim());
  // 三顆按鈕：依畫面順序對應 今天／昨天／前天 或其反序；以文字判定
  const want = offset === 0 ? '今' : offset === 1 ? '昨' : '前';
  const idx = names.findIndex((n) => n.includes(want));
  if (idx < 0) throw new Error(`日報表找不到日期按鈕「${want}」：${names.join('、')}`);
  await btns.nth(idx).click();
  await page.waitForTimeout(2500);
  const box = page.getByPlaceholder('搜尋').first();
  await box.fill(who.name);
  await box.press('Enter');
  await page.waitForTimeout(1500);
  const row = page.locator('.vxe-table--body-wrapper tbody tr').filter({ hasText: who.name }).first();
  await row.waitFor({ timeout: 15000 });
  const cells = (await row.locator('td').allInnerTexts()).map((s) => s.replace(/\s+/g, ' ').trim());
  return { text: cells.join(' | '), cells };
}
