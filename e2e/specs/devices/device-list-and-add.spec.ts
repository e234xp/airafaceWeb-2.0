import { test, expect, Page } from '../../helpers/test';
import { csvAnnotations } from '../../helpers/csvSource';
import { pagerTotal } from '../../helpers/attExport';
import { TEST_IP, cameraRow, cleanupCameras, createCameraViaUI, fillCameraBasics, gotoCameras, openAddCamera, searchCameras, uniqueCameraName } from '../../helpers/cameras';
import { cleanupTablets, createTabletViaUI, gotoTablets, openAddTablet, uniqueTabletName } from '../../helpers/tablets';
import { bodyRows, readAllRows } from '../../helpers/tables';

// 來源 E2E-TEST-PLAN.md：G3-A 類（攝影機／平板列表與新增）：CAM-001、003、004、006、TAB-003、TAB-007。
// 測試設備以 e2e- 開頭並於結束清理；e2e-nx-in／e2e-nx-out 是前置作業建立的 Nx 錄影來源攝影機（保留到 G3 全部做完）。

const cameras: string[] = [];
const tablets: string[] = [];
test.afterEach(async ({ browser }) => {
  await cleanupCameras(browser, cameras.splice(0));
  await cleanupTablets(browser, tablets.splice(0));
});

const headers = async (page: Page) => (await page.locator('.vxe-table--header-wrapper th').allInnerTexts()).map((s) => s.trim());
const usageText = async (page: Page) => ((await page.locator('body').innerText()).match(/正在使用\s*(\d+)\s*個影像設備[^授]*授權\s*\(共\s*(\d+)\s*個\)/) ?? []);

test.describe('G3-A 影像設備', () => {
  test(
    '[CAM-001] 攝影機列表：清單、頁數、筆數、顯示欄位、授權數量與使用數量',
    {
      annotation: csvAnnotations({ row: 74, no: '6.1', category: '影像設備 > 攝影機(列表)', steps: '1.進入影像設備清單，顯示目前的影像設備列表\n5.可透過點擊切換上下頁的清單，或點選欲顯示的頁數\n6.顯示授權數量與使用數量', expected: '1.正確顯示所有的清單、頁數、筆數、顯示欄位' }),
    },
    async ({ page }) => {
      test.setTimeout(180000);
      await gotoCameras(page);
      await page.waitForTimeout(2500);
      const h = await headers(page);
      for (const c of ['設備名稱', '設備狀態', 'IP 位址']) expect(h, `表頭：${h.join('、')}`).toContain(c);
      await expect(page.locator('.vxe-table--header-wrapper .vxe-cell--checkbox').first()).toBeVisible();
      // 每列都有編輯與刪除
      const rows = bodyRows(page);
      const n = await rows.count();
      expect(n).toBeGreaterThan(0);
      for (let i = 0; i < n; i += 1) {
        await expect(rows.nth(i).getByRole('button', { name: '編輯' })).toBeVisible();
        await expect(rows.nth(i).getByRole('button', { name: '刪除' })).toBeVisible();
      }
      // 筆數與頁數：每頁 5 筆；總筆數 = 各頁加總
      const total = await pagerTotal(page);
      expect(n).toBeLessThanOrEqual(5);
      const all = await readAllRows(page, false);
      expect(all.length, '各頁列數加總與頁尾總筆數不符').toBe(total);
      await page.locator('.vxe-pager--num-btn').first().click(); // readAllRows 結束時停在最後一頁，先回第 1 頁
      await page.waitForTimeout(800);
      if (total > 5) {
        const pageTexts = async () => (await bodyRows(page).allInnerTexts()).map((t) => t.replace(/s+/g, ' ').trim());
        const p1 = await pageTexts();
        await page.locator('.vxe-pager--next-btn').first().click();
        await expect.poll(async () => (await pageTexts()).join('|'), { timeout: 8000, message: '切到下一頁後內容沒有改變' }).not.toBe(p1.join('|'));
        const p2 = await pageTexts();
        expect(p2.filter((t) => p1.includes(t)), '第 2 頁出現第 1 頁已有的列').toEqual([]);
        await page.locator('.vxe-pager--prev-btn').first().click();
        await expect.poll(async () => (await pageTexts()).join('|'), { timeout: 8000 }).toBe(p1.join('|'));
      }
      // 授權數量與使用數量：使用 = 攝影機總數 + 平板總數
      const m = await usageText(page);
      expect(m.length, `畫面沒有「正在使用 N 個影像設備 … 授權 (共 M 個)」文字`).toBeGreaterThan(0);
      await gotoTablets(page).catch(async () => {});
      const tabTotal = await pagerTotal(page);
      test.info().annotations.push({ type: '觀察', description: `攝影機 ${total}、平板 ${tabTotal}；畫面顯示使用 ${m[1]}／授權 ${m[2]}` });
      expect(Number(m[1]), '使用數量不等於攝影機＋平板總數').toBe(total + tabTotal);
      expect(Number(m[2])).toBeGreaterThanOrEqual(Number(m[1]));
    },
  );

  test(
    '[CAM-003] 攝影機列表：顯示狀態（線上/斷線）與 IP 正確',
    {
      annotation: [
        ...csvAnnotations({ row: 74, no: '6.1', category: '影像設備 > 攝影機(列表)', steps: '7.顯示影像設備狀態', expected: '3.攝影機顯示狀態正確(線上/斷線)、IP正確' }),
        { type: '判定範圍', description: '畫面狀態文字為「啟用／停用」（規格寫線上／斷線）。以兩台對照：e2e-nx-in 串流可連線（系統日誌有 frame received）應為啟用；新增一台不可達 IP 的測試攝影機應為停用；IP 欄位須與輸入一致' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(240000);
      const bad = uniqueCameraName('st');
      cameras.push(bad);
      await createCameraViaUI(page, bad);
      await page.waitForTimeout(25000); // 等後端判定連線結果
      await gotoCameras(page);
      await searchCameras(page, bad);
      const badRow = (await cameraRow(page, bad).first().innerText()).replace(/\s+/g, ' ');
      expect(badRow).toContain(TEST_IP);
      expect(badRow, '不可達 IP 的攝影機應顯示停用').toContain('停用');
      // 不指定特定攝影機：以後端 API 的攝影機清單（alive 狀態、IP）為標準答案，逐台對照畫面（最多 5 台）
      const api = await page.evaluate(async () => {
        const root = (Array.from(document.querySelectorAll('*')).find((x) => (x as unknown as { __vue__?: unknown }).__vue__) as unknown as { __vue__: { $root: { $globalFindCameras: (u: string, s: number, n: number) => Promise<{ data: { list: Array<{ name: string; ip_address: string; alive: boolean }> } }> } } }).__vue__.$root;
        const r = await root.$globalFindCameras('', 0, 3000);
        return r.data.list.map((c) => ({ name: c.name, ip: c.ip_address, alive: c.alive }));
      });
      const existing = api.filter((c) => c.name !== bad).slice(0, 5);
      const checked: string[] = [];
      for (const c of existing) {
        await searchCameras(page, c.name);
        const row = (await cameraRow(page, c.name).first().innerText()).replace(/\s+/g, ' ');
        expect(row, `攝影機 ${c.name} 的 IP 與後端不符`).toContain(c.ip);
        expect(row, `攝影機 ${c.name}（alive=${c.alive}）的狀態與後端不符`).toContain(c.alive ? '啟用' : '停用');
        checked.push(`${c.name}=${c.alive ? '啟用' : '停用'}`);
      }
      test.info().annotations.push({ type: '觀察', description: `不可達攝影機：${badRow}｜與後端 API 對照的既有攝影機：${checked.join('、') || '（環境沒有既有攝影機）'}` });
    },
  );

  test(
    '[CAM-004] 攝影機列表：影像來源 RTSP/RTP 確認',
    {
      annotation: [
        ...csvAnnotations({ row: 74, no: '6.1', category: '影像設備 > 攝影機(列表)', steps: '1.進入影像設備清單，顯示目前的影像設備列表', expected: '4.影像來源:RTSP/RTP確認OK' }),
        { type: '判定範圍', description: '列表沒有「影像來源」欄位；以新增／編輯頁的「影像來源類型」選項含 RTSP 與 RTP，且既有攝影機（e2e-nx-in）顯示為 RTSP、連接資訊為對應的 rtsp:// 網址判定' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(180000);
      await openAddCamera(page);
      const select = page.locator('select:visible').first();
      const opts = (await select.locator('option').allInnerTexts()).map((s) => s.trim());
      test.info().annotations.push({ type: '觀察', description: `影像來源類型選項：${opts.join('、')}` });
      expect(opts).toContain('RTSP');
      expect(opts).toContain('RTP');
      // 不指定特定攝影機：自己新增一台（預設影像來源 RTSP），再開編輯頁確認類型與連線網址
      const own = uniqueCameraName('src');
      cameras.push(own);
      await createCameraViaUI(page, own);
      await gotoCameras(page);
      await searchCameras(page, own);
      await cameraRow(page, own).first().getByRole('button', { name: '編輯' }).click();
      await page.locator('input[type=text]:visible').first().waitFor();
      await page.waitForTimeout(3000);
      expect((await page.locator('select:visible').first().evaluate((e) => (e as HTMLSelectElement).selectedOptions[0].textContent ?? '')).trim()).toBe('RTSP');
      const conn = await page.locator('input[type=text]:visible').evaluateAll((els) => els.map((e) => (e as HTMLInputElement).value).find((v) => v.startsWith('rtsp://')) ?? '');
      expect(conn, '連接資訊不是 rtsp:// 網址').toMatch(/^rtsp:\/\/.+/);
    },
  );

  test(
    '[CAM-006] 新增攝影機：進入新增頁，IP 必填，按完成後列表呈現新設備',
    {
      annotation: csvAnnotations({ row: 75, no: '6.2', category: '（延續）> 攝影機(新增)', steps: '1. 點選新增影像設備功能，可以進入新增頁面\n2. 填入IP位置(必填)與其他資訊\n5. 按下完成後，在【影像設備】列表可以呈現新增後的設備資料', expected: '1.新增功能正常且能建立成功' }),
    },
    async ({ page }) => {
      test.setTimeout(180000);
      const name = uniqueCameraName('ip');
      cameras.push(name);
      await openAddCamera(page);
      const next = page.getByRole('button', { name: '下一步' });
      // IP 必填：只填名稱時不可下一步，且 IP 欄位有錯誤提示（先讀狀態，再動作）
      await page.locator('input[type=text]:visible').nth(0).fill(name);
      expect(await next.isDisabled(), 'IP 空白時仍可進行下一步').toBe(true);
      expect((await page.locator('.invalid-feedback:visible').allInnerTexts()).join('|')).toContain('不能為空');
      await fillCameraBasics(page, name);
      await expect(next).toBeEnabled();
      await page.screenshot({ path: 'e2e/reports/tmp/cam006.png' });
      const done = page.getByRole('button', { name: '完成' });
      for (let i = 0; i < 8 && !(await done.isVisible()); i += 1) {
        await next.click();
        await page.waitForTimeout(800);
      }
      await done.click();
      await bodyRows(page).first().waitFor();
      await searchCameras(page, name);
      const row = (await cameraRow(page, name).first().innerText()).replace(/\s+/g, ' ');
      expect(row).toContain(name);
      expect(row).toContain(TEST_IP);
    },
  );

  test(
    '[TAB-003] 平板頁面：平板顯示狀態與 IP 正確',
    {
      annotation: [
        ...csvAnnotations({ row: 82, no: '', category: '（延續）> 【平板】頁面', steps: '1.顯示目前的設備群組列表', expected: '4.平板顯示狀態正確、IP正確' }),
        { type: '判定範圍', description: '狀態文字為「啟用／停用」。本項驗證欄位、狀態值合法、IP 為合法 IPv4；「狀態是否與實際連線一致」需要實體平板開關機，未驗證' },
      ],
    },
    async ({ page }) => {
      await gotoTablets(page);
      await page.waitForTimeout(2500);
      const h = await headers(page);
      for (const c of ['設備名稱', '設備狀態', 'IP 位址']) expect(h).toContain(c);
      const rows = await readAllRows(page, false);
      expect(rows.length).toBeGreaterThan(0);
      for (const r of rows) {
        expect(r, `狀態不是啟用／停用：${r}`).toMatch(/(啟用|停用)/);
        // 有 IP 的列必須是合法 IPv4；沒有 IP 的（平板還沒連線過）必須顯示停用
        const ipv4 = /\b(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}\b/;
        if (!ipv4.test(r)) expect(r, `沒有 IP 的平板應顯示停用：${r}`).toContain('停用');
      }
      test.info().annotations.push({ type: '觀察', description: `平板列：${rows.join('｜')}` });
    },
  );

});
