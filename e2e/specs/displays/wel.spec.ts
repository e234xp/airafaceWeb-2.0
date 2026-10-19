import { test, expect, Page } from '@playwright/test';
import { csvAnnotations } from '../../helpers/csvSource';
import { injectRecognitions, appGetSettings, readDashboard, restoreDashboard, snapshotDashboard } from '../../helpers/dashboard';
import { TMP_DIR, makePng, writeFile } from '../../helpers/files';

// 來源 E2E-TEST-PLAN.md；模組 WEL（CSV 第 116~119 列：#10.1 迎賓看板設定 Step 1~3）。
// 本檔實作「適合自動化（Y）」的 7 項（WEL-002~008）；WEL-001、009、010 維持 test.fixme（部分自動化）。
// 迎賓看板設定是全系統共用設定：每個測項開始前先取得 WELCOME 設定快照，結束（含失敗／逾時）一律以獨立 Admin 環境還原。
// 驗證方式：介面操作 → 取產品後端回傳的設定（getdashboardsettings）→ 進入迎賓看板（/welcomemode）檢查畫面一致。
// 迎賓看板的人員卡片來自即時辨識資料；卡片數量以「目前有足夠的近期辨識人員」為前提。

const ROUTE = '/#/displays/modifywelcomecontrolsetting';
const KEY = 'WELCOME';
let snapshot: Record<string, unknown> | null = null;

test.beforeEach(async ({ page }) => {
  snapshot = await snapshotDashboard(page, ROUTE, KEY);
});

test.afterEach(async ({ browser }) => {
  await restoreDashboard(browser, ROUTE, KEY, snapshot);
});

const next = (page: Page) => page.getByRole('button', { name: '下一步' });

async function openSettings(page: Page) {
  await page.goto(ROUTE);
  await page.reload();
  await page.getByText('背景圖片').first().waitFor();
  await page.waitForTimeout(1500);
}

/** 步驟 3（人員資訊）的下拉選單，依畫面順序：0 照片、1~4 顯示資訊 1~4、5 顯示人數、6 輪巡時間。 */
const step3Select = (page: Page, idx: number) => page.locator('select:visible').nth(idx);
const selectedValue = (sel: ReturnType<Page['locator']>) => sel.evaluate((e) => (e as HTMLSelectElement).value);

/** 一路前進到步驟 3。 */
async function gotoStep3(page: Page) {
  await openSettings(page);
  await next(page).click();
  await next(page).click();
  await page.getByText('人員顯示').first().waitFor();
}

/** 步驟 3 完成儲存（下一步 → 完成頁 → 完成）。 */
async function saveFromStep3(page: Page) {
  await next(page).click();
  await page.getByRole('button', { name: '完成' }).click();
  await page.waitForTimeout(1500);
}

let lastInjected: string[] = []; // 最近一次模擬辨識的人員姓名（供姓名遮蔽等判定計算預期值）

/** needCard=false：只驗看板的背景、商標、標題等，不需要人員卡片。needCard=true：模擬辨識事件讓卡片出現（見 injectRecognitions）。 */
async function boardSettingsAndPage(page: Page, needCard = true) {
  const w = (await readDashboard(page, KEY)) as Record<string, unknown>;
  await page.goto('/#/welcomemode');
  await page.reload();
  if (needCard) {
    await page.locator('.welcome-logo-img').first().waitFor({ timeout: 20000 });
    await page.waitForTimeout(2500); // 等看板載入顯示設定與群組
    lastInjected = await injectRecognitions(page);
    await page.locator('.welcome-card').first().waitFor({ timeout: 20000 });
  } else await page.locator('.welcome-logo-img').first().waitFor({ timeout: 20000 });
  await page.waitForTimeout(1500);
  return w;
}

test.describe('WEL', () => {
  test(
    '[WEL-002] 迎賓 Step 1 公司信息：背景圖片、商標圖檔、公司名稱設定',
    {
      annotation: [
        ...csvAnnotations({
          row: 117,
          no: '',
          category: '（延續）> Step 1 公司信息',
          steps: '1. 選擇迎賓模式中的背景圖片、商標圖檔\n2. 輸入公司名稱\n3. 完成上述設定後，點選下一步',
          expected: '背景圖、LOGO設定OK',
        }),
        { type: '判定範圍', description: 'Step 1 畫面只有背景圖片、商標兩個選擇檔案，沒有「公司名稱」欄位（畫面上的 aira Corporation 是 Step 3 的副標題）；預期結果只要求「背景圖、LOGO設定OK」，故以背景圖與商標判定，公司名稱欄位缺漏列為觀察' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(240000);
      await openSettings(page);
      const before = (await readDashboard(page, KEY)) as { background_image: string; logo: string };
      const bg = writeFile(`${TMP_DIR}/wel-bg.png`, makePng(640, 360));
      const logo = writeFile(`${TMP_DIR}/wel-logo.png`, makePng(120, 120));
      const files = page.locator('input[type=file]');
      expect(await files.count()).toBeGreaterThanOrEqual(2);
      await files.nth(0).setInputFiles(bg);
      await files.nth(1).setInputFiles(logo);
      await page.waitForTimeout(1500);
      // 預覽：背景與商標已改成新圖
      const previewBg = await page.locator('[style*="background-image"]').first().getAttribute('style');
      expect(previewBg ?? '').not.toContain(before.background_image.slice(0, 80));
      // 公司名稱欄位（觀察）：Step 1 沒有文字輸入框
      const textInputs = await page.locator('input[type=text]:visible').count();
      if (textInputs === 0) test.info().annotations.push({ type: '觀察', description: 'Step 1 沒有任何文字輸入框（無公司名稱欄位）' });
      await next(page).click();
      await next(page).click();
      await saveFromStep3(page);
      // 後端設定與看板畫面一致
      const w = (await boardSettingsAndPage(page, false)) as { background_image: string; logo: string };
      expect(w.background_image).not.toBe(before.background_image);
      expect(w.logo).not.toBe(before.logo);
      // 看板上任何元素以背景圖或圖片方式套用了新的背景圖（比對圖檔內容片段）
      const needle = w.background_image.slice(30, 90);
      const applied = () =>
        page.evaluate((n) => {
          const hit = (e: Element) => getComputedStyle(e).backgroundImage.includes(n) || (e instanceof HTMLImageElement && e.src.includes(n)) || getComputedStyle(e, '::before').backgroundImage.includes(n);
          return Array.from(document.querySelectorAll('*')).some(hit);
        }, needle);
      await expect.poll(applied, { timeout: 15000, message: '看板背景沒有套用新圖' }).toBe(true);
      const boardLogo = await page.locator('.welcome-logo-img').first().getAttribute('src');
      expect(boardLogo ?? '').toContain(w.logo.slice(0, 60));
    },
  );

  test(
    '[WEL-003] 迎賓 Step 2 數位看板：形象廣告照片與輪播間隔、標題、字體設定',
    {
      annotation: [
        ...csvAnnotations({
          row: 118,
          no: '',
          category: '（延續）> Step 2 數位看板',
          steps: '可設定形象廣告照片及輪播間隔時間，依序項目填入標題，選取字體等',
          expected: '廣告輪播設定OK',
        }),
        { type: '判定範圍', description: '以「廣告照片可上傳、輪巡時間可設定且儲存後保留」判定；Step 2 沒有標題與字體欄位（標題在 Step 3），列為觀察' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(240000);
      await openSettings(page);
      const before = (await readDashboard(page, KEY)) as { advertising: unknown[]; advertisingDuration: number; enabledAdvertisingMode?: boolean };
      await next(page).click();
      await page.getByText('輪巡時間').first().waitFor();
      // 形象廣告模式關閉時（問候語模式）輪巡時間與照片欄位是停用的：先開啟，測完再還原，不假設環境的初始模式
      const adSwitch = page.locator('.card-header', { hasText: '形象廣告模式' }).locator('.c-switch').first();
      const adWasOn = before.enabledAdvertisingMode !== false;
      if (!adWasOn) await adSwitch.click();
      const duration = String(before.advertisingDuration === 20 ? 25 : 20);
      const interval = page.locator('input[type=text]:visible').first();
      await interval.fill(duration);
      const photo = writeFile(`${TMP_DIR}/wel-ad.png`, makePng(480, 270));
      const [fc] = await Promise.all([page.waitForEvent('filechooser'), page.getByRole('button', { name: '選擇照片' }).first().click()]);
      await fc.setFiles(photo);
      await page.waitForTimeout(1500);
      await next(page).click();
      await saveFromStep3(page);
      const after = (await readDashboard(page, KEY)) as { advertising: string[]; advertisingDuration: number };
      expect(String(after.advertisingDuration)).toBe(duration);
      expect(JSON.stringify(after.advertising)).not.toBe(JSON.stringify(before.advertising));
      expect(after.advertising.filter(Boolean).length).toBeGreaterThan(before.advertising.filter(Boolean).length - 1);
      // 重新開啟 Step 2：輪巡時間為剛設定的值
      await openSettings(page);
      await next(page).click();
      await page.getByText('輪巡時間').first().waitFor();
      await expect(page.locator('input[type=text]:visible').first()).toHaveValue(duration);
      if (!adWasOn) {
        await adSwitch.click();
        await next(page).click();
        await saveFromStep3(page);
      }
    },
  );

  const OPTION_NOTE = '「啟用人員訊息遮蔽」對應畫面上 顯示資訊 1 的「部分姓名」選項（只顯示部分姓名）';

  test(
    '[WEL-004] 迎賓 Step 3 人員信息：啟用人員訊息遮蔽（遮蔽人員編號及姓名）',
    {
      annotation: [
        ...csvAnnotations({
          row: 119,
          no: '',
          category: '（延續）> Step 3 人員信息',
          steps: '1. 可啟用人員訊息遮蔽 啟用後可遮蔽人員編號及姓名',
          expected: '1.人員、頁面顯示資訊設定OK\n2.確認進入迎賓看板與設定後的結果一致',
        }),
        { type: '判定範圍', description: `${OPTION_NOTE}；畫面沒有獨立的「遮蔽」開關，也沒有遮蔽人員編號的選項（待使用者確認）。判定：選「部分姓名」後儲存、後端設定保留、看板姓名文字與完整姓名不同` },
      ],
    },
    async ({ page }) => {
      test.setTimeout(240000);
      await gotoStep3(page);
      const sel = step3Select(page, 1);
      const options = await sel.locator('option').evaluateAll((os) => os.map((o) => `${(o as HTMLOptionElement).value}|${o.textContent?.trim()}`));
      const partial = options.find((o) => o.endsWith('|部分姓名'));
      expect(partial, `顯示資訊 1 的選項：${options.join('、')}`).toBeTruthy();
      await sel.selectOption({ label: '部分姓名' });
      const chosen = await selectedValue(sel);
      await saveFromStep3(page);
      const w = (await boardSettingsAndPage(page)) as Record<string, string>;
      expect(Object.values(w).includes(chosen), `後端設定沒有保留 ${chosen}`).toBe(true);
      // 看板上的姓名：產品規則（WelcomeDashboard.vue PARTIALNAME）英文姓名取名字首字母，兩個字以上再加「. 最後一個字」
      // （Frank Li → F. Li、Yu Chin → Y. Chin、Frank → F）；預期值由模擬辨識的人員姓名計算，不假設環境有哪些人員
      const partialOf = (n: string) => {
        const p = n.trim().split(/\s+/);
        return p.length >= 2 ? `${p[0][0]}. ${p[p.length - 1]}` : p[0][0];
      };
      const expected = lastInjected.map(partialOf);
      const titles = async () => (await page.locator('.welcome-card-title').allInnerTexts()).map((t) => t.trim());
      test.info().annotations.push({ type: '觀察', description: `模擬辨識人員：${lastInjected.join('、')}；預期縮寫：${expected.join('、')}` });
      await expect
        .poll(async () => (await titles()).some((t) => expected.includes(t)), { timeout: 15000, message: `選「部分姓名」後看板第一行沒有出現縮寫姓名（預期其中之一：${expected.join('、')}）` })
        .toBe(true);
      for (const t of await titles()) expect(lastInjected, `第一行不應顯示完整姓名：${t}`).not.toContain(t);
    },
  );

  test(
    '[WEL-005] 迎賓 Step 3 人員信息：更改人員資訊欄位與照片（不顯示/註冊/抓拍/顯示照片）',
    {
      annotation: csvAnnotations({
        row: 119,
        no: '',
        category: '（延續）> Step 3 人員信息',
        steps: '2. 可更改人員資訊如人員編號、人員姓名、部門、職稱、群組名稱等，照片可以選擇不顯示、註冊照片、抓拍照片或顯示照片',
        expected: '1.人員、頁面顯示資訊設定OK\n2.確認進入迎賓看板與設定後的結果一致',
      }),
    },
    async ({ page }) => {
      test.setTimeout(300000);
      await gotoStep3(page);
      const photoSel = step3Select(page, 0);
      const values = await photoSel.locator('option').evaluateAll((os) => os.map((o) => (o as HTMLOptionElement).value));
      expect(values.length).toBe(4); // 不顯示、註冊、抓拍、顯示用
      const srcs: Record<string, string[]> = {};
      for (const v of values) {
        await gotoStep3(page);
        await step3Select(page, 0).selectOption(v);
        await saveFromStep3(page);
        const w = (await boardSettingsAndPage(page)) as { displayPhoto: string };
        expect(w.displayPhoto, `照片選項 ${v} 沒有保留`).toBe(v);
        // 看板：選「不顯示」時卡片沒有照片，其他選項有照片
        // 看板約 30~100 秒才載入完人員與設定，輪詢等待。選「不顯示」時看板以預設剪影取代真人照片（img 元素仍在），
        // 因此以「圖片內容」判定：不顯示 → 所有卡片是同一張預設剪影；其他選項 → 顯示真人照片
        await page.locator('.welcome-card-img').first().waitFor({ timeout: 100000 });
        await page.waitForTimeout(3000);
        srcs[v] = await page.locator('.welcome-card-img').evaluateAll((els) => els.map((e) => (e as HTMLImageElement).src));
        if (v === 'NONE') expect(new Set(srcs[v]).size, '選「不顯示」時，卡片仍顯示各自不同的真人照片').toBe(1);
      }
      for (const v of values) {
        if (v === 'NONE' || !/REGISTER|DISPLAY/.test(v)) continue; // 抓拍照片可能本來就沒有圖，不納入比對
        expect(srcs[v].every((s) => !srcs.NONE.includes(s)), `照片選項 ${v} 時看板顯示的是預設剪影，不是人員照片`).toBe(true);
      }
    },
  );

  test(
    '[WEL-006] 迎賓 Step 3 人員信息：顯示屬性 1~4 指定 Attribute',
    {
      annotation: csvAnnotations({
        row: 119,
        no: '',
        category: '（延續）> Step 3 人員信息',
        steps: '3. 顯示屬性1~4可以指定哪些Attribute',
        expected: '1.人員、頁面顯示資訊設定OK\n2.確認進入迎賓看板與設定後的結果一致',
      }),
    },
    async ({ page }) => {
      test.setTimeout(300000);
      await gotoStep3(page);
      // 每個「顯示資訊 n」：選一個與目前不同的選項，儲存後後端設定含該值，看板對應文字不為空
      for (const idx of [1, 2, 3, 4]) {
        await gotoStep3(page);
        const sel = step3Select(page, idx);
        const current = await selectedValue(sel);
        const options = await sel.locator('option').evaluateAll((os) => os.map((o) => (o as HTMLOptionElement).value));
        const pick = options.find((o) => o !== current && o !== 'NONE') ?? options.find((o) => o !== current);
        expect(pick, `顯示資訊 ${idx} 沒有可切換的選項`).toBeTruthy();
        await sel.selectOption(pick as string);
        await saveFromStep3(page);
        const w = (await boardSettingsAndPage(page)) as Record<string, unknown>;
        expect(Object.values(w).includes(pick), `顯示資訊 ${idx} 選 ${pick} 後，後端設定沒有保留`).toBe(true);
      }
      // 把四個都設成「不顯示」：看板的文字行應全部隱藏
      await gotoStep3(page);
      for (const idx of [1, 2, 3, 4]) await step3Select(page, idx).selectOption('NONE');
      await saveFromStep3(page);
      const w = (await boardSettingsAndPage(page)) as Record<string, unknown>;
      expect([w.line1, w.line2, w.line3, w.line4]).toEqual(['NONE', 'NONE', 'NONE', 'NONE']);
      for (const cls of ['.welcome-card-title', '.welcome-card-name', '.welcome-card-department', '.welcome-card-remarks']) {
        expect(await page.locator(cls).first().isVisible(), `全部設為不顯示後，看板仍顯示 ${cls}`).toBe(false);
      }
    },
  );

  test(
    '[WEL-007] 迎賓 Step 3 人員信息：輪巡時間（秒）',
    {
      annotation: [
        ...csvAnnotations({
          row: 119,
          no: '',
          category: '（延續）> Step 3 人員信息',
          steps: '4. 可設定輪巡時間(秒)',
          expected: '1.人員、頁面顯示資訊設定OK\n2.確認進入迎賓看板與設定後的結果一致',
        }),
        { type: '判定範圍', description: '輪巡的實際秒數需長時間觀察看板，本項以「選項可選、儲存後後端與設定頁保留」判定，未量測實際輪巡間隔' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(300000);
      await gotoStep3(page);
      const sel = step3Select(page, 6);
      const options = await sel.locator('option').evaluateAll((os) => os.map((o) => (o as HTMLOptionElement).value));
      expect(options.length).toBeGreaterThan(1);
      for (const v of [options[0], options[options.length - 1]]) {
        await gotoStep3(page);
        await step3Select(page, 6).selectOption(v);
        await saveFromStep3(page);
        const w = (await readDashboard(page, KEY)) as { showDuration: number };
        expect(String(w.showDuration)).toBe(v);
        await gotoStep3(page);
        expect(await selectedValue(step3Select(page, 6))).toBe(v);
      }
    },
  );

  test(
    '[WEL-008] 迎賓 Step 3 人員信息：顯示人數',
    {
      annotation: csvAnnotations({
        row: 119,
        no: '',
        category: '（延續）> Step 3 人員信息',
        steps: '5. 顯示人數',
        expected: '1.人員、頁面顯示資訊設定OK\n2.確認進入迎賓看板與設定後的結果一致',
      }),
    },
    async ({ page }) => {
      test.setTimeout(300000);
      await gotoStep3(page);
      const options = await step3Select(page, 5).locator('option').evaluateAll((os) => os.map((o) => (o as HTMLOptionElement).value));
      expect(options.length).toBeGreaterThan(1);
      for (const v of options) {
        await gotoStep3(page);
        await step3Select(page, 5).selectOption(v);
        await saveFromStep3(page);
        const w = (await boardSettingsAndPage(page)) as { numberOfDisplayPersons: number };
        expect(String(w.numberOfDisplayPersons)).toBe(v);
        // 看板的人員卡片數 = 設定的顯示人數
        await expect(page.locator('.welcome-card:visible'), `顯示人數設為 ${v}，看板卡片數不符`).toHaveCount(Number(v), { timeout: 100000 });
      }
    },
  );

});
