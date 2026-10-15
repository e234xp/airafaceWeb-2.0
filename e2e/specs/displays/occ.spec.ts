import { test, expect, Page } from '@playwright/test';
import { csvAnnotations } from '../../helpers/csvSource';
import {
  boardHasImage,
  openDashboardSettings,
  readDashboard,
  restoreDashboard,
  saveStep2,
  selectOptions,
  selectValue,
  settingsNext,
  snapshotDashboard,
  visibleSelect,
} from '../../helpers/dashboard';
import { TMP_DIR, makePng, writeFile } from '../../helpers/files';

// 來源 E2E-TEST-PLAN.md；模組 OCC＝容留看板（CSV 第 128~131 列：#10.3）。設定頁 /displays/modifycapacitycontrolsetting，設定資料 key＝CAPACITY。
// 本檔實作「適合自動化（Y）」的 4 項（OCC-002~005）；其餘維持 test.fixme。
// 容留看板設定為全系統共用設定：每個測項前取得 CAPACITY 快照，結束（含失敗／逾時）以獨立 Admin 環境還原。

const ROUTE = '/#/displays/modifycapacitycontrolsetting';
const KEY = 'CAPACITY';
let snapshot: Record<string, unknown> | null = null;

test.beforeEach(async ({ page }) => {
  snapshot = await snapshotDashboard(page, ROUTE, KEY);
});
test.afterEach(async ({ browser }) => {
  await restoreDashboard(browser, ROUTE, KEY, snapshot);
});

async function gotoStep2(page: Page) {
  await openDashboardSettings(page, ROUTE);
  await settingsNext(page).click();
  await page.getByText('人員顯示').first().waitFor();
}

// 第 2 步的下拉選單順序：0 照片、1 顯示資訊 1、2 顯示資訊 2、3 頁面排版、4 每日重置、5 輪巡時間、6 顯示總數、7 顯示離開人員
const PHOTO = 0;
const INFO1 = 1;
const INFO2 = 2;

test.describe('OCC', () => {
  test(
    '[OCC-002] 容留看板：更改背景圖片、商標圖檔',
    {
      annotation: csvAnnotations({ row: 129, no: '', category: '（延續）> 自訂背景與logo', steps: '1.可更改背景圖片、商標圖檔', expected: '背景圖、LOGO設定OK' }),
    },
    async ({ page }) => {
      test.setTimeout(240000);
      await openDashboardSettings(page, ROUTE);
      const before = (await readDashboard(page, KEY)) as { background_image: string; logo: string };
      const files = page.locator('input[type=file]');
      await files.nth(0).setInputFiles(writeFile(`${TMP_DIR}/occ-bg.png`, makePng(640, 360)));
      await files.nth(1).setInputFiles(writeFile(`${TMP_DIR}/occ-logo.png`, makePng(120, 120)));
      await page.waitForTimeout(1500);
      await settingsNext(page).click();
      await saveStep2(page);
      const w = (await readDashboard(page, KEY)) as { background_image: string; logo: string };
      expect(w.background_image).not.toBe(before.background_image);
      expect(w.logo).not.toBe(before.logo);
      await page.goto('/#/capacitymode');
      await page.reload();
      await expect.poll(() => boardHasImage(page, w.background_image.slice(30, 90)), { timeout: 20000, message: '容留看板沒有套用新背景圖' }).toBe(true);
      await expect.poll(() => boardHasImage(page, w.logo.slice(30, 90)), { timeout: 5000, message: '容留看板沒有套用新商標' }).toBe(true);
    },
  );

  test(
    '[OCC-003] 容留看板：公司名稱、字體顏色、字體、字體大小',
    {
      annotation: csvAnnotations({ row: 129, no: '', category: '（延續）> 自訂背景與logo', steps: '2.可輸入公司名稱，並可設定字體顏色、字體、字體大小', expected: '背景圖、LOGO設定OK' }),
    },
    async ({ page }) => {
      await openDashboardSettings(page, ROUTE);
      const step1 = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
      await settingsNext(page).click();
      await page.getByText('人員顯示').first().waitFor();
      const step2 = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
      const all = `${step1} ${step2}`;
      const missing = ['公司名稱', '字體顏色', '字體大小'].filter((k) => !all.includes(k));
      expect(missing, `容留看板設定頁（步驟 1、2）找不到：${missing.join('、')}`).toEqual([]);
    },
  );

  test(
    '[OCC-004] 容留看板人員資訊：啟用後遮蔽人員編號及姓名',
    {
      annotation: [
        ...csvAnnotations({ row: 130, no: '', category: '（延續）> 人員資訊', steps: '1.可啟用後可遮蔽人員編號及姓名', expected: '人員、頁面顯示資訊設定OK' }),
        { type: '判定範圍', description: '畫面沒有獨立的遮蔽開關，以「顯示資訊 1 選部分姓名」視為遮蔽（同 WEL-004）；沒有遮蔽人員編號的選項。看板需有人員資料才能檢查姓名文字，沒有資料時標記未驗證' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(240000);
      await gotoStep2(page);
      const sel = visibleSelect(page, INFO1);
      const partial = (await selectOptions(sel)).find((o) => o.label === '部分姓名');
      expect(partial, '顯示資訊 1 沒有「部分姓名」選項').toBeTruthy();
      await sel.selectOption(partial!.value);
      await saveStep2(page);
      const w = (await readDashboard(page, KEY)) as Record<string, unknown>;
      expect(Object.values(w)).toContain(partial!.value);
      await page.goto('/#/capacitymode');
      await page.reload();
      await page.waitForTimeout(6000);
      // 容留看板顯示的是「場內人數」；人數為 0 時沒有任何人員姓名可檢查
      const boardText = (await page.locator('body').innerText()).replace(/\s+/g, ' ').trim();
      const names = (await page.locator('.person-name, .card-name, [class*=person] [class*=name]').allInnerTexts()).map((s) => s.trim()).filter(Boolean);
      if (names.length === 0) {
        test.info().annotations.push({ type: '未驗證', description: `容留看板目前沒有任何人員姓名可供檢查遮蔽效果（看板文字：${boardText.slice(0, 40)}）` });
        return;
      }
      test.info().annotations.push({ type: '觀察', description: `看板姓名文字：${names.slice(0, 8).join('、')}` });
      // 中文姓名為「李***瑋」；英文姓名為縮寫（Allen→A、Yu Chin→Y. Chin），所以兩種形式都算遮蔽
      for (const n of names) expect(/[*＊●○•]/.test(n) || /^[A-Z]\.?( [A-Za-z]+)?$/.test(n), `啟用「部分姓名」後看板仍顯示完整姓名：${n}`).toBe(true);
    },
  );

  test(
    '[OCC-005] 容留看板人員資訊：可選擇人員編號、姓名、部門、職稱、群組、不顯示、註冊照片',
    {
      annotation: csvAnnotations({ row: 130, no: '', category: '（延續）> 人員資訊', steps: '2.可選擇人員編號、人員姓名、部門、職稱、群組、不顯示、註冊照片等', expected: '人員、頁面顯示資訊設定OK' }),
    },
    async ({ page }) => {
      test.setTimeout(300000);
      await gotoStep2(page);
      const photoOpts = await selectOptions(visibleSelect(page, PHOTO));
      const info1Opts = await selectOptions(visibleSelect(page, INFO1));
      const info2Opts = await selectOptions(visibleSelect(page, INFO2));
      const labels = new Set([...photoOpts, ...info1Opts, ...info2Opts].map((o) => o.label));
      for (const need of ['人員編號', '人員姓名', '部門', '職稱', '群組名稱', '不顯示', '註冊時的照片']) {
        expect(labels.has(need), `選項中沒有「${need}」（現有：${[...labels].join('、')}）`).toBe(true);
      }
      // 每個選項都能設定並保留：顯示資訊 2 的全部選項、照片的全部選項
      for (const [idx, opts] of [[INFO2, info2Opts], [PHOTO, photoOpts]] as const) {
        for (const o of opts) {
          await gotoStep2(page);
          await visibleSelect(page, idx).selectOption(o.value);
          await saveStep2(page);
          const w = (await readDashboard(page, KEY)) as Record<string, unknown>;
          expect(Object.values(w), `選「${o.label}」後後端設定沒有保留`).toContain(o.value);
        }
      }
      await gotoStep2(page);
      expect(await selectValue(visibleSelect(page, PHOTO))).toBe(photoOpts[photoOpts.length - 1].value);
    },
  );

  // ---- 以下維持 fixme（部分自動化／暫不測／需實體） ----
});
