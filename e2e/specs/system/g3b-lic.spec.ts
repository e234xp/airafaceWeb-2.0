import { test, expect, Page } from '@playwright/test';
import { csvAnnotations } from '../../helpers/csvSource';

// 來源 E2E-TEST-PLAN.md：LIC-001、LIC-002、LIC-004（影響小的授權項目：只輸入錯誤／已註冊授權碼、讀取授權清單）。
// 授權碼是機敏資料：不印出、不寫入文件（輸出一律遮罩）。LIC-003（其他產品授權碼）沒有該授權碼，不測。
const mask = (t: string) => t.replace(/[A-Za-z0-9]{4,}(-[A-Za-z0-9]{4,}){2,}/g, '***');
const obs = (s: string) => {
  console.log('OBS', mask(s));
  test.info().annotations.push({ type: '觀察', description: mask(s) });
};

type Lic = { license_key: string; channel_amount: number; trial_days?: number; expired?: boolean; default_face_db_size?: number; addon_face_db_size?: number };
async function openLic(page: Page) {
  await page.goto('/#/systemsettings/licensesettings');
  await page.reload();
  await page.getByRole('button', { name: '啟用' }).first().waitFor();
  await page.waitForTimeout(3000);
}
const apiList = (page: Page) =>
  page.evaluate(async () => {
    const el = Array.from(document.querySelectorAll('*')).find((e) => (e as unknown as { __vue__?: unknown }).__vue__) as any;
    const r: any = await new Promise((res) => el.__vue__.$root.$globalGetLicenseList((err: unknown, data: unknown) => res(data)));
    return r.data_list as Array<Record<string, unknown>>;
  }) as Promise<Lic[]>;
const rowsText = async (page: Page) => (await page.locator('.vxe-table--body-wrapper tbody tr').allInnerTexts()).map((s) => mask(s.replace(/\s+/g, ' ').trim())).filter(Boolean);

test(
  '[LIC-004] 授權清單：已啟用的授權名單顯示資料正確',
  { annotation: csvAnnotations({ row: 183, no: '', category: '授權 > 授權清單', steps: '查看授權清單', expected: '已啟用的授權名單顯示資料正確' }) },
  async ({ page }) => {
    test.setTimeout(120000);
    await openLic(page);
    const list = await apiList(page);
    const ui = await rowsText(page);
    obs(`後端授權 ${list.length} 筆；畫面 ${ui.length} 列：${ui.join(' ｜ ')}`);
    expect(list.length, '後端沒有授權').toBeGreaterThan(0);
    expect(ui.length, '畫面授權列數與後端不同').toBe(list.length);
    for (const [i, l] of list.entries()) {
      const row = ui[i] ?? '';
      expect.soft(row, `第 ${i + 1} 筆：畫面沒有顯示通路數 ${l.channel_amount}`).toContain(String(l.channel_amount));
      const size = (l.default_face_db_size ?? 0) + (l.addon_face_db_size ?? 0);
      expect.soft(row, `第 ${i + 1} 筆：畫面沒有顯示人臉庫容量 ${size}`).toContain(String(size));
      expect.soft(row, `第 ${i + 1} 筆：狀態與後端 expired=${l.expired} 不符`).toContain(l.expired === false ? '啟用' : '過期');
      const keyShown = await page.locator('.vxe-table--body-wrapper tbody tr').nth(i).innerText();
      expect.soft(keyShown.includes(l.license_key), `第 ${i + 1} 筆：畫面授權碼與後端不同`).toBe(true);
    }
  },
);

for (const [id, step, mk] of [
  ['LIC-001', '1.填入隨意字串', () => 'E2E-RANDOM-NOT-A-LICENSE-0000'],
  ['LIC-002', '2.填入已被註冊的 license', () => process.env.E2E_LICENSE ?? ''],
] as const) {
  test(
    `[${id}] 新增錯誤授權：${id === 'LIC-001' ? '填入隨意字串' : '填入已被註冊的 license'}，不影響後續正確授權啟用`,
    { annotation: csvAnnotations({ row: 182, no: '', category: '授權 > 新增錯誤授權', steps: step, expected: '1.不影響後續正確授權啟用\n2.版本錯誤會有提示訊息' }) },
    async ({ page }) => {
      test.setTimeout(120000);
      await openLic(page);
      const before = await apiList(page);
      const code = mk();
      expect(code, '沒有可輸入的授權碼').not.toBe('');
      await page.locator('input[type=text]:visible').first().fill(code);
      const btn = page.getByRole('button', { name: '啟用' }).first();
      await expect(btn, '輸入後「啟用」按鈕沒有啟用').toBeEnabled();
      await btn.click();
      await page.waitForTimeout(1500);
      const alertText = mask(((await page.locator('.swal2-popup, .swal2-container, [role=dialog]').allInnerTexts()).join(' ') || '（沒有跳出提示）').replace(/\s+/g, ' '));
      obs(`送出後提示：${alertText}`);
      await page.waitForTimeout(6000);
      await openLic(page);
      const after = await apiList(page);
      obs(`授權筆數 ${before.length} → ${after.length}；通路數 ${before.map((x) => x.channel_amount).join('+')} → ${after.map((x) => x.channel_amount).join('+')}；狀態 ${after.map((x) => (x.expired === false ? '啟用' : '過期')).join(',')}`);
      expect(after.length, '授權清單筆數改變（錯誤授權被加入？）').toBe(before.length);
      expect(after.map((x) => x.channel_amount), '既有授權通路數改變').toEqual(before.map((x) => x.channel_amount));
      expect(after.every((x) => x.expired === false), '既有授權狀態變成非啟用').toBe(true);
      expect(alertText, '沒有跳出錯誤提示').not.toBe('（沒有跳出提示）');
    },
  );
}
