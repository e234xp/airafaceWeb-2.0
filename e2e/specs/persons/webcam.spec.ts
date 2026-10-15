import { test, expect, chromium } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { ADMIN_STORAGE_PATH } from '../../helpers/accounts';
import { csvAnnotations } from '../../helpers/csvSource';
import { TMP_DIR } from '../../helpers/files';
import { Kind, cleanupPersons, fillPersonForm, gotoPersons, openAddPerson, personRowTexts, searchPersons, uniquePersonId } from '../../helpers/persons';

// 來源 E2E-TEST-PLAN.md：PPL-010、VIS-010（使用 webcam 拍攝註冊照片）。
// 以 Chromium「假攝影機」播放 e2e/fixtures/face.jpg 取代實體 webcam；同一張人臉不能同時註冊給多人，每個測項只留一位測試人員，結束後刪除。
// 注意：本站以 HTTPS 提供（E2E_BASE_URL），符合步驟 1「使用 HTTPS 連上網頁」。
const FACE = 'e2e/fixtures/face.jpg';
const created: Array<{ id: string; kind: Kind }> = [];
test.afterEach(async ({ browser }) => {
  const items = created.splice(0);
  for (const kind of ['person', 'visitor'] as Kind[]) await cleanupPersons(browser, items.filter((i) => i.kind === kind).map((i) => i.id), kind);
});
const obs = (s: string) => {
  console.log('OBS', s);
  test.info().annotations.push({ type: '觀察', description: s });
};

for (const [id, kind, row, label] of [
  ['PPL-010', 'person', 59, '人員'],
  ['VIS-010', 'visitor', 64, '訪客'],
] as const) {
  test(
    `[${id}] ${label}（使用 webcam 註冊人臉）：HTTPS 下拍攝照片註冊成功`,
    {
      annotation: [
        ...csvAnnotations({ row, no: '', category: `（延續）> ${label}(使用 webcam 註冊人臉)`, steps: `1. 使用 HTTPS 連上網頁\n2. 進入 ${label} > 新增/編輯${label} > 選擇註冊照片 > 拍攝照片\n3. 使用已有/現場拍攝照片註冊`, expected: '照片註冊成功' }),
        { type: '判定範圍', description: '以 Chromium 假攝影機播放測試用人臉照片取代實體 webcam；驗證「拍攝照片 → 使用照片 → 註冊」流程與註冊後該筆資料有註冊照片。「使用已有照片註冊」見 PPL-005／VIS-005' },
      ],
    },
    async ({ page: _page }) => {
      test.setTimeout(280000);
      const jpg = readFileSync(FACE);
      mkdirSync(TMP_DIR, { recursive: true });
      const mjpeg = `${TMP_DIR}/webcam-${Date.now()}.mjpeg`;
      writeFileSync(mjpeg, Buffer.concat(Array.from({ length: 40 }, () => jpg)));
      const browser = await chromium.launch({ args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', `--use-file-for-fake-video-capture=${mjpeg}`] });
      const ctx = await browser.newContext({ ignoreHTTPSErrors: true, baseURL: process.env.E2E_BASE_URL, storageState: ADMIN_STORAGE_PATH, permissions: ['camera'] });
      const page = await ctx.newPage();
      const pid = uniquePersonId('wc');
      created.push({ id: pid, kind });
      try {
        await openAddPerson(page, kind);
        expect(new URL(process.env.E2E_BASE_URL ?? '').protocol, '測試網址不是 HTTPS').toBe('https:');
        await fillPersonForm(page, { id: pid, name: `e2e網路攝影機${kind === 'person' ? '人員' : '訪客'}` });
        await page.getByRole('button', { name: '下一步' }).click();
        await page.getByRole('button', { name: '拍攝照片' }).first().waitFor();
        await page.waitForTimeout(2500);
        await expect(page.getByRole('button', { name: '拍攝照片' }).first(), 'webcam 沒有被偵測到，拍攝照片鈕不可按').toBeEnabled();
        await page.getByRole('button', { name: '拍攝照片' }).first().click();
        await page.locator('#take_photo_camera video, #take_photo_camera canvas').first().waitFor({ timeout: 15000 });
        await page.waitForTimeout(2000);
        obs('即時預覽已出現');
        await page.getByRole('button', { name: '使用照片' }).first().click();
        await page.waitForTimeout(1500);
        const src = (await page.locator('#register_photo').getAttribute('src')) ?? '';
        obs(`拍攝後註冊照片 src 長度 ${src.length}`);
        expect(src.length, '按「使用照片」後沒有取得照片').toBeGreaterThan(1000);
        await page.getByRole('button', { name: '註冊' }).click();
        await expect(page.getByText('註冊完成'), '註冊沒有完成').toBeVisible({ timeout: 40000 });
        await page.getByRole('button', { name: '完成' }).click();
        await gotoPersons(page, kind);
        await searchPersons(page, pid);
        const rows = await personRowTexts(page);
        obs(`列表：${rows.join(' | ').slice(0, 120)}`);
        expect(rows.length, '註冊後列表找不到該筆資料').toBe(1);
      } finally {
        await browser.close();
      }
    },
  );
}
