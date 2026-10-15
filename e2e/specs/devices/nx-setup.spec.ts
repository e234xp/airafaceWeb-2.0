import { test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { cameraRow, gotoCameras, nextBtn, openAddCamera, searchCameras } from '../../helpers/cameras';
import { bodyRows } from '../../helpers/tables';

// 前置作業（非測項）：把 Nx VMS 上錄影中的 office in／office out 加進 AiraFace 當辨識來源（名稱 e2e-nx-in、e2e-nx-out）。
// 帳密由 .env.e2e.local 讀取，不輸出。這兩台攝影機會保留給 G3 辨識類測項使用，全部做完後再刪除。
const env = Object.fromEntries(
  readFileSync('.env.e2e.local', 'utf8').split(/\r?\n/).filter((l) => l.includes('=') && !l.startsWith('#')).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]),
);
const nx = new URL(env.E2E_NX_URL);
const SOURCES = [
  { name: 'e2e-nx-in', id: 'f54bacb0-1371-07b0-8485-07151ceb433f' },
  { name: 'e2e-nx-out', id: '846082c1-cb47-bce0-fadd-c6e0838a4898' },
];

test('[NX-SETUP] 加入 Nx 錄影來源攝影機', async ({ page }) => {
  test.setTimeout(280000);
  for (const s of SOURCES) {
    await gotoCameras(page);
    await searchCameras(page, s.name);
    if ((await cameraRow(page, s.name).count()) > 0) {
      console.log('SKIP 已存在', s.name);
      continue;
    }
    await openAddCamera(page);
    const texts = page.locator('input[type=text]:visible');
    await texts.nth(0).fill(s.name);
    await texts.nth(1).fill(nx.hostname);
    await texts.nth(2).fill(nx.port);
    await texts.nth(3).fill(env.E2E_NX_USER.toLowerCase()); // 使用者自行接的可用攝影機用小寫 admin
    await page.locator('input[type=password]').first().fill(env.E2E_NX_PASSWORD);
    const info = page.locator('textarea, input[type=text]:visible').filter({ hasNot: page.locator('[disabled]') });
    void info;
    await texts.nth(4).fill(`/${s.id}`); // 參數（串流路徑）= Nx 上的攝影機 ID
    const conn = page.locator('textarea').first();
    if (await conn.count()) await conn.fill(s.id);
    console.log('FIELDS', s.name, JSON.stringify(await texts.evaluateAll((els) => els.map((e) => (e as HTMLInputElement).value.replace(/./g, (c, i) => (i < 40 ? c : ''))))).replace(/Az\w+/g, '***'));
    await page.screenshot({ path: `e2e/reports/tmp/nx-add-${s.name}.png`, fullPage: true });
    const done = page.getByRole('button', { name: '完成' });
    for (let i = 0; i < 8 && !(await done.isVisible()); i += 1) {
      await nextBtn(page).click();
      await page.waitForTimeout(1200);
    }
    await done.click();
    await bodyRows(page).first().waitFor();
  }
  await gotoCameras(page);
  await page.waitForTimeout(6000);
  await searchCameras(page, 'e2e-nx');
  const rows = (await bodyRows(page).allInnerTexts()).map((r) => r.replace(/\s+/g, ' ').trim());
  console.log('NXROWS', JSON.stringify(rows));
});
