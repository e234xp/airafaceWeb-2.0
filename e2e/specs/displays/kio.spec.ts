import { test, expect } from '../../helpers/test';
import { csvAnnotations } from '../../helpers/csvSource';

// 來源 E2E-TEST-PLAN.md；模組 KIO（自助報到／即時影像模式，CSV 第 149~156 列：#10.5）。
// 本檔實作「適合自動化（Y）」的 1 項（KIO-010）；其餘維持 test.fixme（需實體平板、QR code、鏡頭翻轉等）。

test.describe('KIO', () => {
  test(
    '[KIO-010] 即時影像模式：使用 HTTP 開啟 video mode 應無法連線',
    {
      annotation: [
        ...csvAnnotations({ row: 156, no: '', category: '（延續）> （空白）', steps: '〔依預期結果推導，使用者於 2026-10-07 同意〕以 HTTP 開啟 video mode（依預期結果推導）', expected: '1.使用http開啟video mode應無法連線' }),
        { type: '判定範圍', description: '以全新的瀏覽器環境（未登入）把 E2E_BASE_URL 的 https 改成 http 開啟即時影像看板，選擇攝影機後，不應出現即時影像／即時人員資料' },
      ],
    },
    async ({ browser }) => {
      test.setTimeout(120000);
      const base = process.env.E2E_BASE_URL as string;
      expect(base.startsWith('https://'), 'E2E_BASE_URL 不是 https').toBe(true);
      const httpUrl = base.replace('https://', 'http://');
      const ctx = await browser.newContext({ ignoreHTTPSErrors: true });
      const page = await ctx.newPage();
      try {
        let loaded = true;
        try {
          await page.goto(`${httpUrl}/#/livevideomode`, { timeout: 15000 });
        } catch {
          loaded = false; // 無法連線：符合預期
        }
        if (!loaded) return;
        // 能開啟頁面：選擇攝影機後看是否出現即時影像與即時人員
        await page.waitForTimeout(2500);
        const select = page.locator('select:visible').first();
        if ((await select.count()) > 0) {
          await select.selectOption({ index: 1 });
          await page.getByRole('button', { name: '確定' }).click();
          await page.waitForTimeout(8000);
        }
        const videoShown = (await page.locator('video:visible').count()) > 0;
        const text = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
        test.info().annotations.push({ type: '觀察', description: `HTTP 開啟後：video 元素 ${videoShown ? '有' : '無'}；畫面文字：${text.slice(0, 120)}` });
        expect(videoShown, 'HTTP 開啟即時影像看板仍可選擇攝影機並顯示即時影像／人員').toBe(false);
      } finally {
        await ctx.close();
      }
    },
  );

  // ---- 以下維持 fixme（部分自動化／暫不測／需實體） ----
});
