import { test, expect, Page } from '@playwright/test';
import { csvAnnotations } from '../../helpers/csvSource';
import { cleanupCameras, createCameraViaUI, uniqueCameraName } from '../../helpers/cameras';
import { cleanupDeviceGroups, createDeviceGroupViaUI, uniqueDeviceGroupName } from '../../helpers/dgroups';
import { cleanupTablets, createTabletViaUI, uniqueTabletName } from '../../helpers/tablets';
import { bodyRows } from '../../helpers/tables';

// 來源 E2E-TEST-PLAN.md：DGRP-003（攝影機跟平板可放在同一個影像設備群組）。
// 測試設備與群組以 e2e- 開頭；afterEach 先清群組再清設備。

const groups: string[] = [];
const cameras: string[] = [];
const tablets: string[] = [];
test.afterEach(async ({ browser }) => {
  await cleanupDeviceGroups(browser, groups.splice(0));
  await cleanupCameras(browser, cameras.splice(0));
  await cleanupTablets(browser, tablets.splice(0));
});

/** 開啟設備的編輯頁，回傳「設備群組」多選框目前的標籤文字。 */
async function groupTags(page: Page, listRoute: string, name: string) {
  await page.goto(listRoute);
  await page.reload();
  await bodyRows(page).first().waitFor();
  const box = page.getByPlaceholder('搜尋').first();
  await box.fill(name);
  await box.press('Enter');
  await page.waitForTimeout(1500);
  await bodyRows(page).filter({ hasText: name }).first().getByRole('button', { name: '編輯' }).click();
  await page.locator('input[type=text]:visible').first().waitFor();
  await page.waitForTimeout(2500);
  return (await page.locator('.multiselect__tag').allInnerTexts()).map((s) => s.trim());
}

test(
  '[DGRP-003] 影像設備群組：攝影機跟平板可放在同群組',
  {
    annotation: [
      ...csvAnnotations({ row: 90, no: '6.6', category: '（延續）> 影像設備群組(新增/編輯)', steps: '〔依預期結果推導，使用者於 2026-10-07 同意〕建立含攝影機與平板的影像設備群組（依預期結果推導）', expected: '1.攝影機跟平板可放在同群組' }),
      { type: '判定範圍', description: '建立 e2e- 測試攝影機與平板，放進同一個測試群組；以兩台設備的編輯頁都顯示該群組判定' },
    ],
  },
  async ({ page }) => {
    test.setTimeout(280000);
    const cam = uniqueCameraName('dg3');
    cameras.push(cam);
    const tab = uniqueTabletName('dg3');
    tablets.push(tab);
    const group = uniqueDeviceGroupName('dg3');
    groups.push(group);
    // 先建平板再建攝影機：診斷發現同一工作階段先建攝影機後，平板精靈第 2 步的「下一步」會一直沒有作用（見 Results DGRP-003）
    await createTabletViaUI(page, tab);
    console.log("STEP tablet ok");
    await createCameraViaUI(page, cam);
    console.log("STEP camera ok");
    await createDeviceGroupViaUI(page, { name: group, devices: [cam, tab] });
    const camTags = await groupTags(page, '/#/videodevice/cameralist', cam);
    expect(camTags, `攝影機的設備群組標籤：${camTags.join('、')}`).toContain(group);
    const tabTags = await groupTags(page, '/#/videodevice/tabletslist', tab);
    expect(tabTags, `平板的設備群組標籤：${tabTags.join('、')}`).toContain(group);
  },
);
