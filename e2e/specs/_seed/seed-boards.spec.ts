import { test, expect } from '@playwright/test';
import { appGetSettings, openDashboardSettings, saveStep2, selectOptions, settingsNext, visibleSelect } from '../../helpers/dashboard';

// 環境建置步驟 4：保全看板設定（重灌後 GUARD 設定不存在）。簽到＝Camera-1、簽退＝Camera-2（重灌前簽退是實體平板 Tablet-21，現在尚未註冊，改用攝影機）。
// 迎賓／點名／容留看板使用預設設定（重灌後系統已自動產生）。
test('[SEED-004] 建立保全看板設定（環境前置）', async ({ page }) => {
  test.setTimeout(200000);
  await openDashboardSettings(page, '/#/displays/modifyguardcontrolsetting');
  await settingsNext(page).click();
  await page.getByText('人員顯示').first().waitFor();
  const optsIn = await selectOptions(visibleSelect(page, 0));
  console.log('SEED 簽到選項', optsIn.map((o) => o.label).join('、'));
  const pick = (name: string) => optsIn.find((o) => o.label.includes(name))!;
  await visibleSelect(page, 0).selectOption(pick('Camera-1').value);
  await visibleSelect(page, 1).selectOption(pick('Camera-2').value);
  await saveStep2(page);
  const s = (await appGetSettings(page)).GUARD as Record<string, unknown>;
  console.log('SEED GUARD', JSON.stringify({ deviceIn: !!s.deviceIn, deviceOut: !!s.deviceOut, displayGroup: s.displayGroup, displayPhoto: s.displayPhoto, line1: s.line1, line2: s.line2 }));
  expect(s.deviceIn).toBeTruthy();
  expect(s.deviceOut).toBeTruthy();
});
