import { test, expect, chromium, Page, BrowserContext } from '../../helpers/test';
import { mkdirSync, writeFileSync } from 'node:fs';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const QRCode = require('qrcode');
import { ADMIN_STORAGE_PATH } from '../../helpers/accounts';
import { csvAnnotations } from '../../helpers/csvSource';
import { appGetSettings, appSetSettings, boardHasImage } from '../../helpers/dashboard';
import { TMP_DIR, makePng, writeFile } from '../../helpers/files';
import { cleanupPersons, createPersonViaUI, uniquePersonId } from '../../helpers/persons';

// 來源 E2E-TEST-PLAN.md：KIO-001、002、003（自助報到：上傳商標／QR code 背景圖、掃描 QR、銜接拍照頁面）。
// 自助報到看板 /#/selfcheckinmode 以鏡頭掃描 QR（內容為 {"uuid":"<訪客 uuid>"}）。測試以 Chromium 的「假攝影機」播放含該 QR 的影片，不需要實體鏡頭。
// 設定 key SELFCHECKIN 原本可能不存在：測項前取得完整設定快照，結束（含失敗）還原完整設定。測試訪客為 e2e- 開頭，結束後刪除。

const SETTINGS_ROUTE = '/#/displays/modifyselfcheckincontrolsetting';
const BOARD_ROUTE = '/#/selfcheckinmode';
let original: Record<string, unknown> | null = null;
const visitors: string[] = [];
test.afterEach(async ({ browser, page }) => {
  if (original) {
    const ctx = await browser.newContext({ ignoreHTTPSErrors: true, baseURL: process.env.E2E_BASE_URL, storageState: ADMIN_STORAGE_PATH });
    try {
      const p = await ctx.newPage();
      await p.goto(SETTINGS_ROUTE);
      await p.reload();
      await p.waitForTimeout(2500);
      await appSetSettings(p, original as never);
    } finally {
      await ctx.close();
    }
    original = null;
  }
  await cleanupPersons(browser, visitors.splice(0), 'visitor');
  void page;
});
const obs = (s: string) => {
  console.log('OBS', s);
  test.info().annotations.push({ type: '觀察', description: s });
};

async function snapshotAll(page: Page) {
  await page.goto(SETTINGS_ROUTE);
  await page.reload();
  await page.waitForTimeout(2500);
  original = JSON.parse(JSON.stringify(await appGetSettings(page)));
}

/** 建立 e2e 訪客並取得其 uuid。 */
async function makeVisitor(page: Page) {
  const id = uniquePersonId('kio');
  visitors.push(id);
  await createPersonViaUI(page, { id, name: 'e2e自助報到' }, 'visitor');
  const uuid = await page.evaluate(async (vid) => {
    const el = Array.from(document.querySelectorAll('*')).find((e) => (e as unknown as { __vue__?: unknown }).__vue__) as unknown as { __vue__: { $root: { $globalFindVisitorWithoutPhoto: (a: string, b: number, c: number) => Promise<{ data: { visitor_list: Array<{ id: string; uuid: string }> } }> } } };
    const r = await el.__vue__.$root.$globalFindVisitorWithoutPhoto('', 0, 3000);
    return r.data.visitor_list.find((v) => v.id === vid)?.uuid ?? '';
  }, id);
  expect(uuid, '取不到測試訪客的 uuid').not.toBe('');
  return { id, uuid };
}

/** 產生含 QR 的 MJPEG 檔（供 Chromium 假攝影機播放）。 */
async function makeQrMjpeg(page: Page, text: string) {
  const png = (await QRCode.toDataURL(text, { width: 420, margin: 2 })) as string;
  const jpgB64 = await page.evaluate(async (src) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = 640;
    c.height = 480;
    const g = c.getContext('2d') as CanvasRenderingContext2D;
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, 640, 480);
    g.drawImage(img, 110, 30, 420, 420);
    return c.toDataURL('image/jpeg', 0.95).split(',')[1];
  }, png);
  mkdirSync(TMP_DIR, { recursive: true });
  const frame = Buffer.from(jpgB64, 'base64');
  const file = `${TMP_DIR}/kio-qr-${Date.now()}.mjpeg`;
  writeFileSync(file, Buffer.concat(Array.from({ length: 30 }, () => frame)));
  return file;
}

/** 以假攝影機開自助報到看板，回傳 { ctx, board }。 */
async function openKioskWithFakeCamera(mjpeg: string) {
  const browser = await chromium.launch({
    args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', `--use-file-for-fake-video-capture=${mjpeg}`],
  });
  const ctx: BrowserContext = await browser.newContext({ ignoreHTTPSErrors: true, baseURL: process.env.E2E_BASE_URL, storageState: ADMIN_STORAGE_PATH, permissions: ['camera'] });
  const board = await ctx.newPage();
  await board.goto(BOARD_ROUTE);
  await board.reload();
  return { browser, ctx, board };
}
const vm = <T>(page: Page, prop: string) =>
  page.evaluate((p) => {
    const all = Array.from(document.querySelectorAll('*')) as Array<HTMLElement & { __vue__?: Record<string, unknown> }>;
    for (const e of all) if (e.__vue__ && p in e.__vue__) return JSON.parse(JSON.stringify(e.__vue__[p])) as unknown;
    return null;
  }, prop) as Promise<T | null>;

test.describe('KIO 自助報到', () => {
  test(
    '[KIO-001] 自助報到：上傳商標、QR code 背景圖後，點選顯示框可翻轉鏡頭',
    {
      annotation: csvAnnotations({ row: 151, no: '10.5', category: '自助報到模式 > 可上傳QR code掃描背景圖', steps: '上傳商標、QR code背景圖', expected: '1.點選顯示框可翻轉鏡頭.' }),
    },
    async ({ page }) => {
      test.setTimeout(290000);
      await snapshotAll(page);
      // 上傳 QR code 掃描背景圖與商標
      await page.goto(SETTINGS_ROUTE);
      await page.reload();
      await page.waitForTimeout(2500);
      const files = page.locator('input[type=file]');
      await files.nth(0).setInputFiles(writeFile(`${TMP_DIR}/kio-bg.png`, makePng(640, 360)));
      await files.nth(1).setInputFiles(writeFile(`${TMP_DIR}/kio-logo.png`, makePng(120, 120)));
      await page.waitForTimeout(1500);
      const done = page.getByRole('button', { name: '完成' });
      const save = page.getByRole('button', { name: '儲存變更' });
      for (let i = 0; i < 8; i += 1) {
        await page.locator('button').filter({ hasText: /^\s*(下一步|儲存變更|完成)\s*$/ }).first().waitFor();
        if (await done.isVisible()) break;
        if (await save.isVisible()) {
          await save.click();
          await done.waitFor();
          break;
        }
        await page.getByRole('button', { name: '下一步' }).click();
        await page.waitForTimeout(1500);
      }
      await done.click();
      await page.waitForTimeout(1500);
      const s = ((await appGetSettings(page)).SELFCHECKIN ?? {}) as Record<string, string>;
      obs(`儲存後 SELFCHECKIN：logo 長度 ${String(s.logo ?? '').length}、step1Background 長度 ${String(s.step1Background ?? '').length}`);
      expect(String(s.logo ?? '').length, '商標沒有儲存').toBeGreaterThan(100);
      expect(String(s.step1Background ?? '').length, 'QR code 掃描背景圖沒有儲存').toBeGreaterThan(100);
      // 看板：套用新商標與背景；點選顯示框可翻轉鏡頭
      const qr = await makeQrMjpeg(page, JSON.stringify({ uuid: 'e2e-no-such-visitor' }));
      const { browser, board } = await openKioskWithFakeCamera(qr);
      try {
        await expect.poll(() => boardHasImage(board, String(s.logo).slice(30, 90)), { timeout: 30000, message: '自助報到看板沒有套用新商標' }).toBe(true);
        await board.locator('.qrcode-container').waitFor();
        const before = await vm<string>(board, 'selectedCamera');
        await board.locator('.qrcode-container').click();
        await board.waitForTimeout(800);
        const after = await vm<string>(board, 'selectedCamera');
        obs(`鏡頭設定 ${before} → 點選顯示框後 ${after}`);
        expect(after, '點選顯示框後鏡頭設定沒有翻轉').not.toBe(before);
        await board.locator('.qrcode-container').click();
        await board.waitForTimeout(800);
        expect(await vm<string>(board, 'selectedCamera'), '再點一次沒有翻轉回來').toBe(before);
      } finally {
        await browser.close();
      }
    },
  );

  for (const [id, expected, step] of [
    ['KIO-002', '2.掃描QRcode會跳出人員', 'scan'],
    ['KIO-003', '3.銜接拍照頁面', 'photo'],
  ] as const) {
    test(
      `[${id}] 自助報到：上傳商標、QR code 背景圖後，${id === 'KIO-002' ? '掃描 QRcode 會跳出人員' : '銜接拍照頁面'}`,
      {
        annotation: [
          csvAnnotations({ row: 151, no: '10.5', category: '自助報到模式 > 可上傳QR code掃描背景圖', steps: '上傳商標、QR code背景圖', expected })[0],
          { type: '判定範圍', description: '以 Chromium 假攝影機播放含訪客 QR（{"uuid":…}）的影片取代實體鏡頭掃描；QR 背景圖／商標上傳見 KIO-001' },
        ],
      },
      async ({ page }) => {
        test.setTimeout(290000);
        await snapshotAll(page);
        const v = await makeVisitor(page);
        const qr = await makeQrMjpeg(page, JSON.stringify({ uuid: v.uuid }));
        const { browser, board } = await openKioskWithFakeCamera(qr);
        try {
          // 掃描 QR → 進入第 2 步（請看鏡頭／拍照），並載入該訪客
          // 假攝影機沒有 facingMode，預設的「前鏡頭」（front）啟動不了；點選顯示框翻轉成 auto 後才會開始掃描（翻轉功能見 KIO-001）
          await board.locator('.qrcode-container').waitFor();
          await board.waitForTimeout(3000);
          await board.locator('.qrcode-container').click();
          try {
            await expect.poll(async () => await vm<number>(board, 'currentStep'), { timeout: 60000, message: '掃描 QR 後沒有離開第 1 步（沒有跳出人員）' }).toBeGreaterThanOrEqual(2);
          } catch (e) {
            await board.screenshot({ path: `${TMP_DIR}/kio-fail-${id}.png` });
            console.log('KIOFAIL', JSON.stringify({ text: (await board.locator('body').innerText()).replace(/s+/g, ' ').slice(0, 200), fresh: await vm<boolean>(board, 'freshReader'), err: await vm<string>(board, 'errMsg'), cams: await vm<unknown>(board, 'cameraList') }));
            throw e;
          }
          const visitor = await vm<{ id: string; name: string }>(board, 'visitor');
          obs(`掃描後步驟 ${await vm<number>(board, 'currentStep')}；跳出訪客 ${JSON.stringify(visitor)}`);
          expect(visitor?.id, '掃描 QR 後跳出的不是該測試訪客').toBe(v.id);
          if (step === 'photo') {
            const text = (await board.locator('body').innerText()).replace(/\s+/g, ' ');
            expect(text, '第 2 步沒有顯示拍照頁面').toMatch(/請看鏡頭|Please look at the camera/i);
            await expect(board.locator('.step2-take-photo-btn')).toBeVisible();
            // 假攝影機的畫面是 QR 圖（沒有人臉），按「拍照」是否能進下一步不在本項範圍，只記錄觀察
            await board.locator('.step2-take-photo-btn').click();
            await board.waitForTimeout(8000);
            obs(`按拍照後步驟 ${await vm<number>(board, 'currentStep')}（假攝影機畫面沒有人臉）`);
          }
        } finally {
          await browser.close();
        }
      },
    );
  }
});
