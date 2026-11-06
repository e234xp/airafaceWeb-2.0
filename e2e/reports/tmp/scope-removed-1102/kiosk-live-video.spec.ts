import { test, expect } from '../../helpers/test';
import { csvAnnotations } from '../../helpers/csvSource';

// 來源 E2E-TEST-PLAN.md：KIO-009（即時影像模式：HTTPS 開啟 video mode，選擇攝影機顯示畫面並顯示即時人員、陌生人）。只讀。
test(
  '[KIO-009] 即時影像模式：使用 HTTPS 開啟 video mode，選擇攝影機顯示畫面並顯示即時人員、陌生人',
  {
    annotation: csvAnnotations({ row: 155, no: '', category: '（延續）> 即時影像模式', steps: '僅https選擇攝影機，觀看顯示畫面是否顯示人員、陌生人', expected: '1.使用https開啟video mode\n2.選擇攝影機，應顯示畫面與顯示即時人員、陌生人' }),
  },
  async ({ page }) => {
    test.setTimeout(240000);
    expect((process.env.E2E_BASE_URL as string).startsWith('https://'), 'E2E_BASE_URL 不是 https').toBe(true);
    await page.goto('/#/livevideomode');
    await page.reload();
    await page.waitForTimeout(4000);
    const select = page.locator('select:visible').first();
    await expect(select, '開啟即時影像模式後沒有出現選擇攝影機的選單').toBeVisible({ timeout: 30000 });
    const opts = (await select.locator('option').allInnerTexts()).map((s) => s.trim());
    console.log('OBS', `攝影機選項：${opts.join('、')}`);
    const cam = opts.findIndex((o) => o.includes('Camera-1'));
    await select.selectOption({ index: cam >= 0 ? cam : 1 });
    await page.getByRole('button', { name: '確定' }).click();
    await page.waitForTimeout(20000);
    const video = page.locator('video.video-player');
    await expect(video, '選擇攝影機後沒有出現影像元素').toBeVisible();
    const state = await video.evaluate((v) => ({ w: (v as HTMLVideoElement).videoWidth, ready: (v as HTMLVideoElement).readyState, paused: (v as HTMLVideoElement).paused }));
    const items = await page.locator('.recognition-item').count();
    const text = (await page.locator('.recognition-area').innerText()).replace(/\s+/g, ' ').slice(0, 160);
    console.log('OBS', `影像狀態 ${JSON.stringify(state)}；辨識結果 ${items} 筆；右側文字 ${text}`);
    await page.screenshot({ path: 'e2e/reports/tmp/kio009.png' });
    expect(state.w, '影像沒有播放（寬度為 0）').toBeGreaterThan(0);
    expect(items, '沒有顯示即時辨識的人員').toBeGreaterThan(0);
  },
);
