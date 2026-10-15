import { test, expect, Page } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const QRCode = require('qrcode');
import { ADMIN_STORAGE_PATH } from '../../helpers/accounts';
import { csvAnnotations } from '../../helpers/csvSource';
import { cleanupPersons, createPersonViaUI, uniquePersonId } from '../../helpers/persons';

// 來源 E2E-TEST-PLAN.md：KIO-004、KIO-005（自助報到拍照註冊人臉）。
// 看板（/#/selfcheckinmode）以 getUserMedia 取得鏡頭：測試以頁面內的 canvas 串流取代實體鏡頭（先播 QR code 掃描，進入拍照頁後換成人臉照片 e2e/fixtures/face.jpg）。
// 測試訪客 e2e- 開頭，結束後刪除；同一張人臉不能同時註冊給多人，所以只用這一位訪客。不修改自助報到設定。
const FACE = 'e2e/fixtures/face.jpg';
const visitors: string[] = [];
test.afterEach(async ({ browser }) => {
  await cleanupPersons(browser, visitors.splice(0), 'visitor');
});
const obs = (s: string) => {
  console.log('OBS', s);
  test.info().annotations.push({ type: '觀察', description: s });
};
const vm = <T>(page: Page, prop: string) =>
  page.evaluate((p) => {
    const all = Array.from(document.querySelectorAll('*')) as Array<HTMLElement & { __vue__?: Record<string, unknown> }>;
    for (const e of all) if (e.__vue__ && p in e.__vue__) return JSON.parse(JSON.stringify(e.__vue__[p])) as unknown;
    return null;
  }, prop) as Promise<T | null>;

const INIT = `
  (() => {
    const c = document.createElement('canvas');
    c.width = 640; c.height = 480;
    const g = c.getContext('2d');
    window.__camSrc = '';
    let img = null; let cur = '';
    setInterval(() => {
      if (window.__camSrc !== cur) { cur = window.__camSrc; img = new Image(); img.src = cur; }
      g.fillStyle = '#fff'; g.fillRect(0, 0, 640, 480);
      if (img && img.complete && img.naturalWidth) {
        const r = Math.min(640 / img.naturalWidth, 480 / img.naturalHeight);
        const w = img.naturalWidth * r; const h = img.naturalHeight * r;
        g.drawImage(img, (640 - w) / 2, (480 - h) / 2, w, h);
      }
    }, 60);
    const stream = c.captureStream(15);
    const md = navigator.mediaDevices;
    md.getUserMedia = async () => stream.clone();
    md.enumerateDevices = async () => [{ kind: 'videoinput', deviceId: 'fake-cam', label: 'e2e fake camera', groupId: 'g' }];
  })();
`;

async function fillVisitorUuid(page: Page, vid: string) {
  return page.evaluate(async (id) => {
    const el = Array.from(document.querySelectorAll('*')).find((e) => (e as unknown as { __vue__?: unknown }).__vue__) as unknown as { __vue__: { $root: { $globalFindVisitorWithoutPhoto: (a: string, b: number, c: number) => Promise<{ data: { visitor_list: Array<{ id: string; uuid: string }> } }> } } };
    const r = await el.__vue__.$root.$globalFindVisitorWithoutPhoto('', 0, 3000);
    return r.data.visitor_list.find((v) => v.id === id)?.uuid ?? '';
  }, vid);
}
async function visitorPhoto(page: Page, uuid: string) {
  return page.evaluate(async (u) => {
    const el = Array.from(document.querySelectorAll('*')).find((e) => (e as unknown as { __vue__?: unknown }).__vue__) as unknown as { __vue__: { $root: { $globalFindVisitor: (a: string, b: number, c: number) => Promise<{ data: { visitor_list: Array<{ register_image?: string }> } }> } } };
    const r = await el.__vue__.$root.$globalFindVisitor(u, 0, 5);
    return (r.data.visitor_list[0]?.register_image ?? '').length;
  }, uuid);
}

for (const [id, expected] of [
  ['KIO-004', '1.點選Face訪客'],
  ['KIO-005', '2.人臉是否為拍照上傳照片'],
] as const) {
  test(
    `[${id}] 自助報到拍照註冊人臉：${id === 'KIO-004' ? '上傳人臉圖後點選 Face 訪客' : '人臉是否為拍照上傳照片'}`,
    {
      annotation: [
        ...csvAnnotations({ row: 152, no: '', category: '（延續）> 拍照註冊人臉', steps: '上傳人臉圖', expected }),
        { type: '判定範圍', description: '規格措辭不明（「Face 訪客」「上傳」）。以產品實際流程判定：掃描訪客 QR → 拍照頁拍下人臉 → 確認頁 Next → 完成頁顯示該訪客；完成後該訪客的註冊照片已寫入且與拍下的照片一致。以頁面內 canvas 串流取代實體鏡頭' },
      ],
    },
    async ({ page, browser }) => {
      test.setTimeout(290000);
      const vid = uniquePersonId('kf');
      visitors.push(vid);
      await createPersonViaUI(page, { id: vid, name: 'e2e自助拍照' }, 'visitor');
      const uuid = await fillVisitorUuid(page, vid);
      expect(uuid, '取不到測試訪客的 uuid').not.toBe('');
      expect(await visitorPhoto(page, uuid), '測試訪客一開始就有照片，無法驗證拍照寫入').toBe(0);
      const qr = (await QRCode.toDataURL(JSON.stringify({ uuid }), { width: 420, margin: 2 })) as string;
      const face = `data:image/jpeg;base64,${readFileSync(FACE).toString('base64')}`;
      const ctx = await browser.newContext({ ignoreHTTPSErrors: true, baseURL: process.env.E2E_BASE_URL, storageState: ADMIN_STORAGE_PATH });
      await ctx.addInitScript(INIT);
      const board = await ctx.newPage();
      try {
        await board.goto('/#/selfcheckinmode');
        await board.reload();
        await board.locator('.qrcode-container').waitFor({ timeout: 60000 });
        await board.waitForTimeout(3000);
        await board.evaluate((s) => { (window as unknown as { __camSrc: string }).__camSrc = s; }, qr);
        await expect.poll(async () => await vm<number>(board, 'currentStep'), { timeout: 60000, message: '掃描 QR 後沒有進入拍照頁' }).toBeGreaterThanOrEqual(2);
        expect((await vm<{ id: string }>(board, 'visitor'))?.id).toBe(vid);
        // 拍照頁：鏡頭換成人臉照片後拍照
        await board.evaluate((s) => { (window as unknown as { __camSrc: string }).__camSrc = s; }, face);
        await board.waitForTimeout(3000);
        await board.locator('.step2-take-photo-btn').click();
        await expect.poll(async () => await vm<number>(board, 'currentStep'), { timeout: 30000, message: '按拍照後沒有進入確認頁' }).toBe(3);
        const shown = (await vm<string[]>(board, 'imageList')) ?? [];
        obs(`確認頁拍到的照片長度 ${(shown[0] ?? '').length}`);
        expect((shown[0] ?? '').length, '確認頁沒有拍下的照片').toBeGreaterThan(1000);
        await board.locator('.next-btn').click();
        await expect.poll(async () => await vm<number>(board, 'currentStep'), { timeout: 30000, message: '按 Next 後沒有進入完成頁' }).toBe(4);
        // 寫入後：訪客註冊照片存在
        await expect.poll(() => visitorPhoto(page, uuid), { timeout: 20000, message: '完成後訪客沒有註冊照片' }).toBeGreaterThan(1000);
        obs(`完成後訪客註冊照片長度 ${await visitorPhoto(page, uuid)}`);
        if (id === 'KIO-005') {
          const stored = await page.evaluate(async (u) => {
            const el = Array.from(document.querySelectorAll('*')).find((e) => (e as unknown as { __vue__?: unknown }).__vue__) as unknown as { __vue__: { $root: { $globalFindVisitor: (a: string, b: number, c: number) => Promise<{ data: { visitor_list: Array<{ register_image?: string }> } }> } } };
            const r = await el.__vue__.$root.$globalFindVisitor(u, 0, 5);
            return r.data.visitor_list[0]?.register_image ?? '';
          }, uuid);
          const taken = (shown[0] ?? '').replace('data:image/jpeg;base64,', '');
          writeFileSync('e2e/reports/tmp/kio-taken.jpg', Buffer.from(taken, 'base64'));
          writeFileSync('e2e/reports/tmp/kio-stored.jpg', Buffer.from(stored, 'base64'));
          // 寫入的照片可能被縮小；縮成 32x32 後比對像素差異，確認是同一張拍下的照片
          const diff = await page.evaluate(async ({ x, y }) => {
            const px = async (b64: string) => {
              const img = new Image();
              img.src = 'data:image/jpeg;base64,' + b64;
              await img.decode();
              const c = document.createElement('canvas');
              c.width = 32;
              c.height = 32;
              const g = c.getContext('2d') as CanvasRenderingContext2D;
              g.drawImage(img, 0, 0, 32, 32);
              return g.getImageData(0, 0, 32, 32).data;
            };
            const p = await px(x);
            const q = await px(y);
            let t = 0;
            for (let i = 0; i < p.length; i += 1) t += Math.abs(p[i] - q[i]);
            return t / p.length;
          }, { x: stored, y: taken });
          obs('寫入照片與拍下照片縮成 32x32 的平均像素差：' + diff.toFixed(2));
          expect(diff, '寫入的註冊照片與拍下的照片不是同一張').toBeLessThan(12);
        }
      } finally {
        await ctx.close();
      }
    },
  );
}
