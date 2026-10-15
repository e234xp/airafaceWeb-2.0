import { test, expect, Page } from '@playwright/test';
import { csvAnnotations } from '../../helpers/csvSource';
import { AttSettings, appGetAtt, restoreAtt, snapshotAtt } from '../../helpers/attOps';
import { cleanupDeviceGroups, createDeviceGroupViaUI, uniqueDeviceGroupName } from '../../helpers/dgroups';

// 來源 E2E-TEST-PLAN.md：ATT-022、ATT-024（出勤設定）。設定頁 /#/attendance/attendancesettings。
// 考勤設定為全系統共用：每個測項前取得快照（同時寫入 e2e/reports/tmp/attendance-settings-backup.json），結束（含失敗）以獨立 Admin 環境還原。

const ROUTE = '/#/attendance/attendancesettings';
let snap: AttSettings | null = null;
const dgroups: string[] = [];

test.afterEach(async ({ browser }) => {
  await restoreAtt(browser, snap); // 先還原設定（設定引用了測試設備群組），再刪測試群組
  await cleanupDeviceGroups(browser, dgroups.splice(0));
});

async function openSettings(page: Page) {
  await page.goto(ROUTE);
  await page.reload().catch(() => page.goto(page.url()));
  await expect(page.locator('.vxe-table').nth(0)).toBeVisible();
  await page.waitForTimeout(2500);
}
const apply = async (page: Page) => {
  await page.locator('button.btn-primary').filter({ hasText: '套用' }).click();
  await expect(page.locator('.swal2-icon.swal2-success')).toBeVisible({ timeout: 15000 });
};
const timeInputs = (page: Page) => page.locator('table.w-50').first().locator('.mx-datepicker input'); // 0 上班、1 下班、2 加班起算
const selects = (page: Page) => page.locator('table.w-50').first().locator('select.select-secondary'); // 0 上班緩衝、1 下班緩衝、2 休息、3 加班最少
async function setTime(page: Page, idx: number, hhmm: string) {
  const el = timeInputs(page).nth(idx);
  await el.click();
  await el.fill(hhmm);
  await el.press('Enter');
  await page.keyboard.press('Escape');
  expect(await el.inputValue()).toBe(hhmm);
}
async function pickGroup(page: Page, boxIdx: number, name: string) {
  const box = page.locator('.multiselect').nth(boxIdx);
  console.log('BOX', boxIdx, '目前標籤', JSON.stringify(await box.locator('.multiselect__tag').allInnerTexts()), '共', await page.locator('.multiselect').count(), '個多選框');
  await box.locator('.multiselect__tags').click();
  await page.waitForTimeout(500);
  console.log('OPTIONS', boxIdx, JSON.stringify((await box.locator('.multiselect__option').allInnerTexts()).map((s) => s.trim()).filter(Boolean)));
  await box.locator('input.multiselect__input').fill(name); // 先以搜尋縮小選項（清單很長時選項在捲動區外）
  await page.waitForTimeout(500);
  await box.locator('.multiselect__option:visible').filter({ hasText: name }).first().click();
  await page.keyboard.press('Escape');
  await page.locator('div.h1').first().click(); // 點空白處讓下拉收合，避免第二個多選框被第一個的下拉選單遮住
  await page.waitForTimeout(500);
}

test.describe('ATT（出勤設定）', () => {
  test(
    '[ATT-022] 出勤設定：新增簽到與簽退之設備群組',
    {
      annotation: csvAnnotations({ row: 23, no: '3.7', category: '出勤設定 > 出勤設定', steps: '1.設定上下班簽到設備、時間條件(可以公司條件做標準)', expected: '1.可以新增簽到與簽退之設備群組' }),
    },
    async ({ page }) => {
      test.setTimeout(240000);
      snap = await snapshotAtt(page);
      const gin = uniqueDeviceGroupName('ai');
      const gout = uniqueDeviceGroupName('ao');
      dgroups.push(gin, gout);
      await createDeviceGroupViaUI(page, { name: gin });
      await createDeviceGroupViaUI(page, { name: gout });
      await openSettings(page);
      await pickGroup(page, 0, gin);
      await pickGroup(page, 1, gout);
      await expect(page.locator('.multiselect').nth(0).locator('.multiselect__tag').filter({ hasText: gin })).toHaveCount(1);
      await expect(page.locator('.multiselect').nth(1).locator('.multiselect__tag').filter({ hasText: gout })).toHaveCount(1);
      await apply(page);
      // 重新載入後仍在，且後端設定含新增的簽到／簽退群組
      await openSettings(page);
      await expect(page.locator('.multiselect').nth(0).locator('.multiselect__tag').filter({ hasText: gin })).toHaveCount(1);
      await expect(page.locator('.multiselect').nth(1).locator('.multiselect__tag').filter({ hasText: gout })).toHaveCount(1);
      const s = await appGetAtt(page);
      expect(s.video_device_group_in as string[]).toContain(gin);
      expect(s.video_device_group_out as string[]).toContain(gout);
    },
  );

  test(
    '[ATT-024] 出勤設定：設定上下班/休息/加班時間並正確顯示出席狀態（遲到、早退）',
    {
      annotation: [
        ...csvAnnotations({ row: 23, no: '3.7', category: '出勤設定 > 出勤設定', steps: '1.設定上下班簽到設備、時間條件(可以公司條件做標準)\n2.設定休息時間\n3.設定加班時間', expected: '3.可以設定上下班時間，並且正確顯示出席狀態，如遲到或早退' }),
        { type: '判定範圍', description: '本項驗證「可設定上下班、休息、加班時間且儲存後保留」；「出席狀態（遲到／早退）顯示正確」需用補打卡資料驗證，補打卡結果與畫面對不上（見 ATT-029 等），因此該部分未驗證' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(240000);
      snap = await snapshotAtt(page);
      await openSettings(page);
      await setTime(page, 0, '08:30');
      await setTime(page, 1, '17:30');
      await setTime(page, 2, '19:30');
      await selects(page).nth(0).selectOption('15');
      await selects(page).nth(1).selectOption('45');
      await selects(page).nth(2).selectOption('30'); // 休息 30 分
      await page.locator('#calc-work-overtime-checkbox').check();
      await selects(page).nth(3).selectOption('30');
      await apply(page);
      const s = await appGetAtt(page);
      expect([s.defined_clockin_time_hour, s.defined_clockin_time_min]).toEqual([8, 30]);
      expect([s.defined_clockout_time_hour, s.defined_clockout_time_min]).toEqual([17, 30]);
      expect([s.defined_overtime_time_hour, s.defined_overtime_time_min]).toEqual([19, 30]);
      expect(Number(s.defined_clockin_time_buffer_mins)).toBe(15);
      expect(Number(s.defined_clockout_time_buffer_mins)).toBe(45);
      expect(Number(s.defined_break_time_mins)).toBe(30);
      expect(s.defined_overtime_enabled).toBe(true);
      expect(Number(s.defined_overtime_minimum_min)).toBe(30);
      // 重新載入後畫面仍是所設值
      await openSettings(page);
      expect(await timeInputs(page).nth(0).inputValue()).toBe('08:30');
      expect(await timeInputs(page).nth(1).inputValue()).toBe('17:30');
      expect(await timeInputs(page).nth(2).inputValue()).toBe('19:30');
      expect(await selects(page).nth(2).inputValue()).toBe('30');
    },
  );
});
