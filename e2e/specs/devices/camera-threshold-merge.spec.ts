import { test, expect, Page } from '../../helpers/test';
import { csvAnnotations } from '../../helpers/csvSource';
import { cameraRow, cleanupCameras, fillCameraBasics, gotoCameras, nextBtn, openAddCamera, searchCameras, uniqueCameraName } from '../../helpers/cameras';

// 來源 E2E-TEST-PLAN.md：CAM-017/018（辨識門檻值）、CAM-020/024/025（人臉合併設定）、SEC-008/010（保全模式使用的合併閾值，實際設定在攝影機）。
// 合併「效果」（保全看板／調查／事件規則是否合併）需要受控的重複辨識事件，本檔只驗設定欄位：預設值、可儲存、重開保留、欄位驗證。
// 測試攝影機 e2e- 開頭，結束後清理。

const created: string[] = [];
test.afterEach(async ({ browser }) => {
  await cleanupCameras(browser, created.splice(0));
});
const obs = (s: string) => {
  console.log('OBS', s);
  test.info().annotations.push({ type: '觀察', description: s });
};

async function toThreshold(page: Page, name: string) {
  await openAddCamera(page);
  await fillCameraBasics(page, name);
  await nextBtn(page).click();
  await nextBtn(page).click();
  await page.getByText('最小人臉寬高').first().waitFor();
  await page.waitForTimeout(1000);
}
async function toMerge(page: Page, name: string) {
  await toThreshold(page, name);
  await nextBtn(page).click();
  await page.getByText('啟用人員合併').first().waitFor();
  await page.waitForTimeout(800);
}
/** 合併頁欄位依畫面順序：select 0 人員合併啟用、1 陌生人合併啟用、2 陌生人時長；text 0 人員時長、1 陌生人分數。 */
const mergeSel = (page: Page, i: number) => page.locator('select:visible').nth(i);
const mergeTxt = (page: Page, i: number) => page.locator('input[type=text]:visible').nth(i);
async function finish(page: Page) {
  const done = page.getByRole('button', { name: '完成' });
  for (let i = 0; i < 4 && !(await done.isVisible()); i += 1) {
    await nextBtn(page).click();
    await page.waitForTimeout(800);
  }
  await done.click();
  await page.waitForTimeout(1500);
}
/** 直接讀後端回傳的攝影機合併設定（判斷是「沒存進去」還是「編輯頁沒讀回來」）。 */
async function backendMerge(page: Page, name: string) {
  return page.evaluate(async (n) => {
    const el = Array.from(document.querySelectorAll('*')).find((e) => (e as unknown as { __vue__?: unknown }).__vue__) as unknown as { __vue__: { $root: { $globalFindCameras: (a: string, b: number, c: number) => Promise<{ data: { list: Array<Record<string, unknown>> } }> } } };
    const r = await el.__vue__.$root.$globalFindCameras('', 0, 500);
    const c = r.data.list.find((x) => x.name === n);
    return c ? JSON.stringify({ v: c.verified_merge_setting, nv: c.non_verified_merge_setting }) : 'camera not found';
  }, name);
}

async function reopenMerge(page: Page, name: string) {
  await gotoCameras(page);
  await searchCameras(page, name);
  await cameraRow(page, name).first().getByRole('button', { name: '編輯' }).click();
  await expect(page).toHaveURL(/modifyCameras/);
  await page.locator('input[type=text]:visible').first().waitFor();
  await page.waitForTimeout(2000);
  for (let i = 0; i < 3; i += 1) {
    await nextBtn(page).click();
    await page.waitForTimeout(600);
  }
  await page.getByText('啟用人員合併').first().waitFor();
  await page.waitForTimeout(800);
}

async function saveBothPaths(page: Page, name: string, apply: (p: Page) => Promise<void>) {
  await finish(page);
  const b1 = await backendMerge(page, name);
  obs(`新增精靈儲存後，後端的合併設定：${b1}`);
  const lost = b1.indexOf('"enable":true') < 0;
  await reopenMerge(page, name);
  await apply(page);
  await finish(page);
  obs(`再從編輯頁儲存後，後端的合併設定：${await backendMerge(page, name)}`);
  await reopenMerge(page, name);
  expect.soft(lost, '新增精靈儲存後，合併設定被重設為預設（沒有存進後端）').toBe(false);
}

test.describe('CAM/SEC 辨識門檻與人臉合併設定', () => {
  test(
    '[CAM-017] 辨識門檻值：高 = 0.5、中 = 0.3（預設）、低 = 0.1',
    { annotation: csvAnnotations({ row: 79, no: '', category: '（延續）> 辨識門檻值', steps: 'face_detection_score 辨識門檻值調整:高 = 0.5, 中 = 0.3預設, 低 = 0.1', expected: '（原始規格無對應預期結果）' }) },
    async ({ page }) => {
      test.setTimeout(200000);
      await toThreshold(page, uniqueCameraName('thr'));
      const sel = page.locator('select:visible').nth(1);
      const opts = await sel.locator('option').evaluateAll((os) => os.map((o) => `${(o as HTMLOptionElement).text.trim()}=${(o as HTMLOptionElement).value}`));
      const cur = (await sel.locator('option:checked').innerText()).trim();
      obs(`人臉檢測閾值選項 ${opts.join('、')}；預設選到「${cur}」`);
      const map = Object.fromEntries(opts.map((o) => o.split('=')));
      expect(map['高'], '高 應為 0.5').toBe('0.5');
      expect(map['中'], '中 應為 0.3').toBe('0.3');
      expect(map['低'], '低 應為 0.1').toBe('0.1');
      expect(cur, '預設應為「中」(0.3)').toBe('中');
    },
  );

  test(
    '[CAM-020] 人臉合併[人員]：啟用人員合併並設定合併時長，儲存後保留',
    {
      annotation: [
        ...csvAnnotations({ row: 80, no: '', category: '（延續）> 人臉合併[人員]', steps: '1.啟用人員合併: 設定合併時長\n2.該秒數區間，辨識相同人員', expected: '1.人臉合併功能確認OK' }),
        { type: '判定範圍', description: '只驗設定（啟用、時長可設、儲存後重開保留）；「該秒數區間辨識相同人員會合併」需要受控的重複辨識事件，未驗證' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(280000);
      const name = uniqueCameraName('mg');
      created.push(name);
      await toMerge(page, name);
      const dur = mergeTxt(page, 0);
      expect(await dur.isDisabled(), '未啟用時時長欄位應停用').toBe(true);
      await mergeSel(page, 0).selectOption({ label: '是' });
      await expect(dur).toBeEnabled();
      await dur.fill('500');
      obs(`時長填 500（低於 1000）時畫面提示：${(await page.locator('.invalid-feedback:visible').allInnerTexts()).join(' / ')}`);
      await dur.fill('3000');
      await saveBothPaths(page, name, async (p) => {
        await mergeSel(p, 0).selectOption({ label: '是' });
        await mergeTxt(p, 0).fill('3000');
      });
      expect(await mergeSel(page, 0).locator('option:checked').innerText()).toContain('是');
      await expect(mergeTxt(page, 0)).toHaveValue('3000');
    },
  );

  test(
    '[CAM-024] 人臉合併[陌生人]：啟用陌生人合併並設定合併時長，儲存後保留',
    {
      annotation: [
        ...csvAnnotations({ row: 81, no: '', category: '（延續）> 人臉合併[陌生人]', steps: '1.啟用陌生人合併: 設定合併時長\n2.該秒數區間，辨識相同人員', expected: '1.人臉合併功能確認OK' }),
        { type: '判定範圍', description: '只驗設定；「該秒數區間辨識相同人員會合併」需要受控的重複辨識事件，未驗證' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(280000);
      const name = uniqueCameraName('mg');
      created.push(name);
      await toMerge(page, name);
      await mergeSel(page, 1).selectOption({ label: '是' });
      await mergeSel(page, 2).selectOption({ label: '10000' });
      await saveBothPaths(page, name, async (p) => {
        await mergeSel(p, 1).selectOption({ label: '是' });
        await mergeSel(p, 2).selectOption({ label: '10000' });
      });
      expect(await mergeSel(page, 1).locator('option:checked').innerText()).toContain('是');
      expect((await mergeSel(page, 2).locator('option:checked').innerText()).trim()).toBe('10000');
    },
  );

  test(
    '[CAM-025] 人臉合併[陌生人]：設定合併分數越高越難合併（分數可設定並保留）',
    {
      annotation: [
        ...csvAnnotations({ row: 81, no: '', category: '（延續）> 人臉合併[陌生人]', steps: '3.設定合併分數越高越難合併', expected: '〔使用者確認 2026-10-07：以步驟原文作為預期結果〕\n3.設定合併分數越高越難合併' }),
        { type: '判定範圍', description: '只驗合併分數欄位：預設 0.6、可改、重開保留；「分數越高越難合併」的實際合併行為需要受控的重複辨識事件，未驗證' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(280000);
      const name = uniqueCameraName('mg');
      created.push(name);
      await toMerge(page, name);
      const score = mergeTxt(page, 1);
      expect(await score.isDisabled()).toBe(true);
      await mergeSel(page, 1).selectOption({ label: '是' });
      await expect(score).toBeEnabled();
      await expect(score).toHaveValue('0.6');
      await score.fill('1.5');
      obs(`分數填 1.5 時畫面提示：${(await page.locator('.invalid-feedback:visible').allInnerTexts()).join(' / ')}`);
      await score.fill('0.85');
      await saveBothPaths(page, name, async (p) => {
        await mergeSel(p, 1).selectOption({ label: '是' });
        await mergeTxt(p, 1).fill('0.85');
      });
      await expect(mergeTxt(page, 1)).toHaveValue('0.85');
    },
  );

  test(
    '[SEC-010] 保全攝影機陌生人合併：陌生人合併閾值預設 0.6，可設定',
    {
      annotation: [
        ...csvAnnotations({ row: 139, no: '', category: '（延續）> 攝影機陌生人合併', steps: '1.陌生人設定合併閾值(default:0.6)', expected: '攝影機陌生人合併成功' }),
        { type: '判定範圍', description: '合併閾值實際設定在攝影機的人臉合併步驟（合併分數）；驗預設 0.6 與可設定，「合併成功」的行為未驗證' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(200000);
      await toMerge(page, uniqueCameraName('mg'));
      await expect(mergeTxt(page, 1)).toHaveValue('0.6');
    },
  );

});
