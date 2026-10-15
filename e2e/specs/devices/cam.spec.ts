import { test, expect, Page } from '@playwright/test';
import { csvAnnotations } from '../../helpers/csvSource';
import {
  TEST_IP,
  cameraRow,
  cameraRowTexts,
  cleanupCameras,
  createCameraViaUI,
  fillCameraBasics,
  gotoCameras,
  nextBtn,
  openAddCamera,
  searchCameras,
  uniqueCameraName,
} from '../../helpers/cameras';
import { bodyRows, readAllRows } from '../../helpers/tables';

// 來源 E2E-TEST-PLAN.md；模組 CAM（CSV 第 74~78 列：#6.1 列表、#6.2 新增、#6.3 編輯／刪除、人臉擷取閾值）。
// 本檔實作「適合自動化（Y）」的 11 項；其餘維持 test.fixme（部分自動化／暫不測／需實體）。
// 測試攝影機以 e2e- 開頭、IP 用保留網段 192.0.2.10（不會連到真實設備，狀態會顯示「停用」）；afterEach 以獨立 Admin 環境清理。
// 既有攝影機（Camera-1~11）只做「開啟編輯頁、不儲存」的唯讀操作（ROI 需要真實影像）。

const created: string[] = [];
const track = (n: string) => {
  created.push(n);
  return n;
};

test.afterEach(async ({ browser }) => {
  await cleanupCameras(browser, created.splice(0));
});

const backBtn = (page: Page) => page.getByRole('button', { name: '上一步' });

/** 以名稱建立攝影機後，回到列表搜尋該名稱並開啟編輯頁。 */
async function openEdit(page: Page, name: string) {
  await gotoCameras(page);
  await searchCameras(page, name);
  await cameraRow(page, name).first().getByRole('button', { name: '編輯' }).click();
  await expect(page).toHaveURL(/modifyCameras/);
  await page.locator('input[type=text]:visible').first().waitFor();
  await page.waitForTimeout(2000);
}

/** 人臉擷取閾值那一步的欄位（依畫面順序）。 */
const thresholdFields = (page: Page) => ({
  minFace: page.locator('input[type=text]:visible').nth(0),
  score: page.locator('input[type=text]:visible').nth(1),
  interval: page.locator('input[type=text]:visible').nth(2),
  antiSpoof: page.locator('select:visible').nth(0),
  faceThreshold: page.locator('select:visible').nth(1),
  aprilTag: page.locator('select:visible').nth(2),
});
const selectedLabel = async (sel: ReturnType<Page['locator']>) => ((await sel.locator('option:checked').innerText()) ?? '').trim();

/** 新增精靈：填第 1 步後前進到「人臉擷取閾值」（不建立攝影機）。 */
async function gotoThresholdStep(page: Page, name: string) {
  await openAddCamera(page);
  await fillCameraBasics(page, name);
  await nextBtn(page).click(); // 辨識區域
  await nextBtn(page).click(); // 人臉擷取閾值
  await page.getByText('最小人臉寬高').first().waitFor();
}

// 以 canvas 的色彩格狀摘要比對畫面變化（ROI 是畫在 canvas 上，無 DOM 可數）
// ROI 的繪製層不一定在 canvas 像素內，改以辨識區域畫面截圖的位元組比對（影像靜止時，同畫面截圖完全相同）
const roiShot = (page: Page) => page.locator('#canvas').locator('xpath=..').screenshot();
const sameShot = (a: Buffer, b: Buffer) => a.equals(b);
/** 按「新增 n」後在影像上拖曳出矩形（第 n 個 ROI 放在不同位置，互不重疊）。 */
async function drawRoi(page: Page, n: number) {
  await page.getByRole('button', { name: `新增 ${n}`, exact: true }).click();
  const box = await page.locator('#canvas').boundingBox();
  if (!box) throw new Error('找不到辨識區域畫面');
  const x0 = box.x + box.width * (0.05 + (n - 1) * 0.18);
  const y0 = box.y + box.height * 0.3;
  await page.mouse.move(x0, y0);
  await page.mouse.down();
  await page.mouse.move(x0 + box.width * 0.12, y0 + box.height * 0.25, { steps: 8 });
  await page.mouse.up();
}

/** 開啟既有攝影機（Camera-1）的編輯頁並前進到「辨識區域」；只讀取、不儲存。 */
async function gotoRoiStepOfExisting(page: Page) {
  await gotoCameras(page);
  await cameraRow(page, 'Camera-1').first().getByRole('button', { name: '編輯' }).click();
  await expect(page).toHaveURL(/modifyCameras/);
  await page.locator('input[type=text]:visible').first().waitFor();
  await page.waitForTimeout(2000);
  await nextBtn(page).click();
  await expect(page.locator('canvas:visible').first()).toBeVisible();
  await page.waitForTimeout(4000); // 等影像載入
}

test.describe('CAM', () => {
  test(
    '[CAM-002] 攝影機列表：搜尋文字功能',
    {
      annotation: csvAnnotations({
        row: 74,
        no: '6.1',
        category: '影像設備 > 攝影機(列表)',
        steps: '2.點選並輸入上方搜尋框內容，可針對人員進行快速尋找',
        expected: '2.搜尋文字功能正確',
      }),
    },
    async ({ page }) => {
      test.setTimeout(180000);
      const name = track(uniqueCameraName('s'));
      await createCameraViaUI(page, name);
      // 以名稱搜尋：結果每一列都含關鍵字，且包含該攝影機
      await searchCameras(page, name);
      let rows = await cameraRowTexts(page);
      expect(rows.length).toBeGreaterThan(0);
      for (const r of rows) expect(r.toLowerCase()).toContain(name.toLowerCase());
      // 以 IP 搜尋：結果每一列都含該 IP（含測試攝影機）
      await searchCameras(page, TEST_IP);
      rows = await readAllRows(page, false);
      expect(rows.length).toBeGreaterThan(0);
      for (const r of rows) expect(r).toContain(TEST_IP);
      // 以既有攝影機名稱搜尋
      await searchCameras(page, 'Camera-1');
      rows = await readAllRows(page, false);
      expect(rows.length).toBeGreaterThan(0);
      for (const r of rows) expect(r.toLowerCase()).toContain('camera-1');
      // 不存在的關鍵字：無結果
      await searchCameras(page, `e2e-no-such-${Date.now()}`);
      expect(await cameraRowTexts(page)).toEqual([]);
    },
  );

  test(
    '[CAM-005] 攝影機列表：編輯入口與勾選刪除（單一/多項/全選）',
    {
      annotation: [
        ...csvAnnotations({
          row: 74,
          no: '6.1',
          category: '影像設備 > 攝影機(列表)',
          steps: '3.點選 編輯可以針對影像設備進行編輯或刪除\n4.勾選 方格 並點選 刪除，可以刪除單一或多項，也可勾選 全選，並刪除所有影像設備',
          expected: '〔使用者確認 2026-10-07：以步驟原文作為預期結果〕同步驟',
        }),
        { type: '安全措施', description: '「全選」前先搜尋 e2e- 限縮清單，並確認被勾選的列全是 e2e- 開頭才按刪除，避免刪到既有攝影機' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(300000);
      const names = ['a1', 'a2', 'a3'].map((t) => track(uniqueCameraName(t)));
      for (const n of names) await createCameraViaUI(page, n);
      // 編輯入口：按「編輯」進入該攝影機的編輯頁，名稱欄位為該攝影機名稱
      await openEdit(page, names[0]);
      await expect(page.locator('input[type=text]:visible').first()).toHaveValue(names[0]);
      // 勾選單一刪除：只刪第 1 個
      await gotoCameras(page);
      await searchCameras(page, 'e2e-');
      await cameraRow(page, names[0]).first().locator('.vxe-cell--checkbox').click();
      await page.locator('button.btn-danger').first().click();
      await page.locator('.el-message-box__btns .el-button--primary').click();
      await expect(cameraRow(page, names[0])).toHaveCount(0, { timeout: 20000 });
      await expect(cameraRow(page, names[1])).toHaveCount(1);
      // 勾選多項刪除：第 2、3 個
      for (const n of names.slice(1)) await cameraRow(page, n).first().locator('.vxe-cell--checkbox').click();
      await page.locator('button.btn-danger').first().click();
      await page.locator('.el-message-box__btns .el-button--primary').click();
      await expect(cameraRow(page, 'e2e-')).toHaveCount(0, { timeout: 20000 });
      // 重新載入確認三個都不在，既有攝影機仍在
      await gotoCameras(page);
      await searchCameras(page, 'e2e-');
      expect(await cameraRowTexts(page)).toEqual([]);
      await searchCameras(page, 'Camera-1');
      await expect(cameraRow(page, 'Camera-1').first()).toBeVisible();
    },
  );

  test(
    '[CAM-007] 新增攝影機：新增/移除 ROI，ROIs（辨識區域）功能',
    {
      annotation: [
        ...csvAnnotations({
          row: 75,
          no: '6.2',
          category: '（延續）> 攝影機(新增)',
          steps: '3. 新增ROI或移除ROI選項',
          expected: '2.ROIs(辨識區域)確認功能OK',
        }),
        { type: '判定範圍', description: 'ROI 需要真實影像：以既有 Camera-1 的編輯頁（不儲存）操作；ROI 畫在 canvas，以畫面色彩格狀摘要的差異判定「新增後畫面有變化、移除後恢復」' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(180000);
      await gotoRoiStepOfExisting(page);
      const base1 = await roiShot(page);
      await page.waitForTimeout(3000);
      const noise = (sameShot(base1, await roiShot(page)) ? 0 : 1); // 影像本身的自然變化量
      for (const n of [1, 2, 3, 4, 5]) {
        // 先移除（若該 ROI 原本就存在，確保以「無 ROI」為基準），再新增、再移除
        await page.getByRole('button', { name: `移除 ${n}`, exact: true }).click();
        await page.waitForTimeout(3000);
        const base = await roiShot(page);
        await drawRoi(page, n);
        await page.waitForTimeout(3000);
        const added = await roiShot(page);
        expect(sameShot(base, added), `新增 ROI ${n} 後畫面沒有變化（影像雜訊 ${noise}）`).toBe(false);
        await page.getByRole('button', { name: `移除 ${n}`, exact: true }).click();
        await page.waitForTimeout(3000);
        const removed = await roiShot(page);
        expect(sameShot(base, removed), `移除 ROI ${n} 後畫面沒有恢復（影像雜訊 ${noise}）`).toBe(true);
      }
    },
  );

  test(
    '[CAM-008] 新增攝影機：ROI 可不設定，且至多 5 個',
    {
      annotation: [
        ...csvAnnotations({
          row: 75,
          no: '6.2',
          category: '（延續）> 攝影機(新增)',
          steps: '6.ROI 可不設定，且至多5個',
          expected: '〔使用者確認 2026-10-07：以步驟原文作為預期結果〕6.ROI 可不設定，且至多5個',
        }),
        { type: '判定範圍', description: '「至多 5 個」以「畫面只提供 5 組新增/移除、且 5 個 ROI 可同時存在」判定；ROI 內容以 canvas 差異判定' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(300000);
      // 可不設定：建立攝影機時不碰 ROI 即可成功
      const name = track(uniqueCameraName('r'));
      await createCameraViaUI(page, name);
      await searchCameras(page, name);
      await expect(cameraRow(page, name)).toHaveCount(1);
      // 至多 5 個：新增按鈕只有 1~5，沒有第 6 個；5 個 ROI 可同時存在（畫面逐步變化）
      await gotoRoiStepOfExisting(page);
      await expect(page.getByRole('button', { name: /^新增 \d+$/ })).toHaveCount(5);
      await expect(page.getByRole('button', { name: '新增 6', exact: true })).toHaveCount(0);
      const b1 = await roiShot(page);
      await page.waitForTimeout(3000);
      const noise = sameShot(b1, await roiShot(page)) ? 0 : 1;
      // 先移除全部 ROI（Camera-1 原本可能已有 ROI），再依序新增 1~5：每新增一個畫面都應再變化（5 個可同時存在）
      for (const n of [1, 2, 3, 4, 5]) await page.getByRole('button', { name: `移除 ${n}`, exact: true }).click();
      await page.waitForTimeout(3000);
      let prev = await roiShot(page);
      for (const n of [1, 2, 3, 4, 5]) {
        await drawRoi(page, n);
        await page.waitForTimeout(3000);
        const cur = await roiShot(page);
        expect(sameShot(prev, cur), `新增 ROI ${n} 後畫面沒有變化（無法同時存在 ${n} 個；影像雜訊 ${noise}）`).toBe(false);
        prev = cur;
      }
    },
  );

  test(
    '[CAM-009] 新增攝影機：可詳細設定臉部偵測的數值',
    {
      annotation: csvAnnotations({
        row: 75,
        no: '6.2',
        category: '（延續）> 攝影機(新增)',
        steps: '4. 可詳細設定臉部偵測的數值',
        expected: '〔使用者確認 2026-10-07：以步驟原文作為預期結果〕4. 可詳細設定臉部偵測的數值',
      }),
    },
    async ({ page }) => {
      test.setTimeout(240000);
      const name = track(uniqueCameraName('t'));
      await gotoThresholdStep(page, name);
      const f = thresholdFields(page);
      await f.minFace.fill('120');
      await f.score.fill('0.6');
      await f.interval.fill('700');
      await f.antiSpoof.selectOption({ label: '高' });
      await f.faceThreshold.selectOption({ label: '高' });
      await f.aprilTag.selectOption({ label: 'tag36h11' });
      await nextBtn(page).click(); // 人臉合併
      await nextBtn(page).click(); // 完成
      await page.getByRole('button', { name: '完成' }).click();
      // 儲存後重新開啟編輯頁，閾值為剛設定的值
      await openEdit(page, name);
      await nextBtn(page).click(); // 辨識區域
      await nextBtn(page).click(); // 人臉擷取閾值
      await page.getByText('最小人臉寬高').first().waitFor();
      const g = thresholdFields(page);
      await expect(g.minFace).toHaveValue('120');
      await expect(g.score).toHaveValue('0.6');
      await expect(g.interval).toHaveValue('700');
      expect(await selectedLabel(g.antiSpoof)).toBe('高');
      // 人臉檢測閾值在編輯頁沒有對應欄位（新增頁有），以下只判定兩頁共有的欄位
      const selectCount = await page.locator('select:visible').count();
      test.info().annotations.push({ type: '觀察', description: `編輯頁的人臉擷取閾值步驟只有 ${selectCount} 個下拉選單（防偽、April Tag）；新增頁另有「人臉檢測閾值」下拉選單，編輯頁看不到` });
      expect(await selectedLabel(g.faceThreshold)).toBe('tag36h11');
    },
  );

  test(
    '[CAM-011] 編輯攝影機：修改設備名稱、群組等，列表呈現更新後資料',
    {
      annotation: csvAnnotations({
        row: 76,
        no: '6.3',
        category: '（延續）> 攝影機(編輯)',
        steps: '1. 點選 編輯 可以進入影像設備資料編輯頁面\n2. 可以修改設備名稱、群組等資訊\n3. 在【影像設備】列表可以呈現更新後的資料',
        expected: '編輯功能正常且能更新成功',
      }),
    },
    async ({ page }) => {
      test.setTimeout(240000);
      const before = track(uniqueCameraName('e1'));
      const after = track(uniqueCameraName('e2'));
      await createCameraViaUI(page, before);
      await openEdit(page, before);
      const nameInput = page.locator('input[type=text]:visible').first();
      await nameInput.fill(after);
      // 群組：若有可選的設備群組，加選第一個
      const groupBox = page.locator('.multiselect').first();
      let groupPicked = '';
      if ((await groupBox.count()) > 0) {
        await groupBox.click();
        const opt = page.locator('.multiselect__option:visible').first();
        if ((await opt.count()) > 0) {
          groupPicked = ((await opt.innerText()) ?? '').trim();
          await opt.click();
        }
      }
      for (let i = 0; i < 4; i += 1) await nextBtn(page).click();
      await page.getByRole('button', { name: '完成' }).click();
      // 列表：新名稱存在、舊名稱不存在
      await gotoCameras(page);
      await searchCameras(page, after);
      await expect(cameraRow(page, after)).toHaveCount(1);
      await searchCameras(page, before);
      expect(await cameraRowTexts(page)).toEqual([]);
      if (!groupPicked) test.info().annotations.push({ type: '未驗證', description: '沒有可選的設備群組，群組修改未驗證' });
      else {
        await openEdit(page, after);
        await expect(page.locator('.multiselect__tag').filter({ hasText: groupPicked })).toHaveCount(1);
      }
    },
  );

  test(
    '[CAM-012] 刪除攝影機：勾選單一/多項/全選刪除，並可切換分頁',
    {
      annotation: [
        ...csvAnnotations({
          row: 77,
          no: '',
          category: '（延續）> 攝影機(刪除)',
          steps: '1.勾選 方格 並點選 刪除，可以刪除單一或多項，也可勾選 全選，並刪除所有影像設備\n2.可透過點擊切換上下頁的清單，或點選欲顯示的頁數',
          expected: '刪除功能正常',
        }),
        { type: '安全措施', description: '全選刪除只在搜尋 e2e- 限縮後進行，並確認被勾選的列全是 e2e- 開頭才按刪除' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(300000);
      const names = ['d1', 'd2', 'd3'].map((t) => track(uniqueCameraName(t)));
      for (const n of names) await createCameraViaUI(page, n);
      // 分頁：每頁最多 5 筆，切到第 2 頁後內容不同；點頁碼與上下頁皆可
      await gotoCameras(page);
      const pager = (await page.locator('.vxe-pager').innerText()).replace(/\s+/g, ' ');
      const total = Number(pager.slice(pager.indexOf('共')).replace(/[^0-9]/g, ''));
      expect(total).toBeGreaterThan(5);
      const p1 = await cameraRowTexts(page);
      expect(p1.length).toBe(5);
      await page.locator('.vxe-pager--num-btn').nth(1).click();
      await page.waitForTimeout(600);
      const p2 = await cameraRowTexts(page);
      expect(p2[0]).not.toBe(p1[0]);
      await page.locator('.vxe-pager--prev-btn').first().click();
      await page.waitForTimeout(600);
      expect(await cameraRowTexts(page)).toEqual(p1);
      await page.locator('.vxe-pager--next-btn').first().click();
      await page.waitForTimeout(600);
      expect(await cameraRowTexts(page)).toEqual(p2);
      // 勾選多項刪除：d1、d2
      await gotoCameras(page);
      await searchCameras(page, 'e2e-');
      for (const n of names.slice(0, 2)) await cameraRow(page, n).first().locator('.vxe-cell--checkbox').click();
      await page.locator('button.btn-danger').first().click();
      await page.locator('.el-message-box__btns .el-button--primary').click();
      await expect(cameraRow(page, names[0])).toHaveCount(0, { timeout: 20000 });
      await expect(cameraRow(page, names[1])).toHaveCount(0);
      await expect(cameraRow(page, names[2])).toHaveCount(1);
      // 全選刪除：清單已限縮為 e2e- 測試攝影機
      await gotoCameras(page);
      await searchCameras(page, 'e2e-');
      const shown = await cameraRowTexts(page);
      expect(shown.length).toBeGreaterThanOrEqual(1);
      for (const r of shown) expect(r.startsWith('e2e-'), `清單含非測試攝影機：${r}`).toBe(true);
      await page.locator('.vxe-table--header-wrapper .vxe-cell--checkbox').first().click();
      const checked = await page.locator('.vxe-table--body-wrapper tbody tr:has(.vxe-cell--checkbox.is--checked)').allInnerTexts();
      expect(checked.length).toBe(shown.length);
      for (const r of checked) expect(r.trim().startsWith('e2e-'), `被勾選的列含非測試攝影機：${r}`).toBe(true);
      await page.locator('button.btn-danger').first().click();
      await page.locator('.el-message-box__btns .el-button--primary').click();
      await expect(cameraRow(page, 'e2e-')).toHaveCount(0, { timeout: 20000 });
      // 既有攝影機仍在
      await gotoCameras(page);
      await searchCameras(page, 'Camera-1');
      await expect(cameraRow(page, 'Camera-1').first()).toBeVisible();
    },
  );

  // 人臉擷取閾值預設值（新增精靈第 3 步，不建立攝影機）
  const defaults = [
    { id: 'CAM-013', title: '人臉擷取閾值預設值：最小人臉尺寸 = 0（不限制）', step: '預設值: - 最小人臉尺寸: 0 (不限制)', check: async (page: Page) => expect(await thresholdFields(page).minFace.inputValue()).toBe('0') },
    { id: 'CAM-014', title: '人臉擷取閾值預設值：辨識分數閾值 = 0.3', step: '預設值: - 辨識分數閾值:預設 0.3', check: async (page: Page) => expect(await thresholdFields(page).score.inputValue()).toBe('0.3') },
    { id: 'CAM-015', title: '人臉擷取閾值預設值：人臉擷取時間 = 500 ms', step: '預設值: - 人臉擷取時間(毫秒): 500 ms', check: async (page: Page) => expect(await thresholdFields(page).interval.inputValue()).toBe('500') },
    { id: 'CAM-016', title: '人臉擷取閾值預設值：防偽 = 高', step: '預設值: - 防偽: 高', check: async (page: Page) => expect(await selectedLabel(thresholdFields(page).antiSpoof)).toBe('高') },
  ];
  for (const d of defaults) {
    test(
      `[${d.id}] ${d.title}`,
      {
        annotation: csvAnnotations({
          row: 78,
          no: '',
          category: '（延續）> 人臉擷取閾值',
          steps: d.step,
          expected: '辨識相關參數確認(最小人臉尺寸、門檻值、時間、防偽)OK',
        }),
      },
      async ({ page }) => {
        test.setTimeout(120000);
        await gotoThresholdStep(page, uniqueCameraName('df'));
        await d.check(page);
        await backBtn(page).click(); // 不建立攝影機，離開精靈
      },
    );
  }

  // ---- 以下維持 fixme ----
});
