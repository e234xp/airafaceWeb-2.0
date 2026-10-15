import { test, expect, Page } from '@playwright/test';
import { csvAnnotations } from '../../helpers/csvSource';
import { execFileSync } from 'node:child_process';
import { cleanupTablets, createTabletViaUI, gotoTablets, nextBtn, searchTablets, tabletRow, uniqueTabletName } from '../../helpers/tablets';

// 來源 E2E-TEST-PLAN.md：TAB-014（雙因子）、TAB-016（卡片規格）、TAB-015（解除綁定）。
// 只驗證前端設定：欄位可設定、儲存後重新開啟保留；平板端的實際行為（報到、刷卡）需要實體平板，未驗證。
// 測試平板 e2e- 開頭，結束後清理；不碰既有平板（Tablet-21）。
const created: string[] = [];
test.afterEach(async ({ browser }) => {
  await cleanupTablets(browser, created.splice(0));
});
const obs = (s: string) => {
  console.log('OBS', s);
  test.info().annotations.push({ type: '觀察', description: s });
};

async function openEdit(page: Page, name: string) {
  await gotoTablets(page);
  await searchTablets(page, name);
  await tabletRow(page, name).first().getByRole('button', { name: '編輯' }).click();
  await expect(page).toHaveURL(/modifytablets/);
  await page.locator('input[type=text]:visible').first().waitFor();
  await page.waitForTimeout(2000);
}
/** 編輯頁第 2 步（門禁設定）的下拉選單：0 卡片規格、1 雙因子認證、2 觸發繼電器。 */
async function gotoAccessStep(page: Page) {
  await nextBtn(page).click();
  await page.getByText('卡片驗證設定').first().waitFor();
  await page.waitForTimeout(1500);
}
const sel = (page: Page, i: number) => page.locator('select:visible').nth(i);
const selLabel = async (page: Page, i: number) => (await sel(page, i).locator('option:checked').innerText()).trim();
async function save(page: Page) {
  await nextBtn(page).click();
  await page.getByRole('button', { name: '完成' }).click();
  await page.waitForTimeout(1500);
}

test.describe('TAB 門禁設定', () => {
  test(
    '[TAB-014] 平板設定：可套用雙因子驗證',
    {
      annotation: [
        ...csvAnnotations({ row: 86, no: '', category: '（延續）> 平板設定', steps: '可套用雙因子驗證', expected: '1.平板報到功能確認' }),
        { type: '判定範圍', description: '只驗證前端「雙因子認證（需要人臉和卡片）」可設為「是」並儲存保留；平板報到功能需要實體平板，未驗證' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(290000);
      const name = uniqueTabletName('2f');
      created.push(name);
      await createTabletViaUI(page, name);
      await openEdit(page, name);
      await gotoAccessStep(page);
      obs(`雙因子預設：${await selLabel(page, 1)}`);
      await sel(page, 1).selectOption({ label: '是' });
      await save(page);
      await openEdit(page, name);
      await gotoAccessStep(page);
      expect(await selLabel(page, 1), '重新開啟後雙因子沒有保留為「是」').toBe('是');
    },
  );

  test(
    '[TAB-016] 平板設定：可變更卡的格式，使用正確卡的格式可成功',
    {
      annotation: [
        ...csvAnnotations({ row: 87, no: '', category: '（延續）> （空白）', steps: '可刷卡變更卡的格式', expected: '使用正確卡的格式可成功' }),
        { type: '判定範圍', description: '只驗證前端「卡片規格」可改為不同格式（26／34／64-bit）並儲存保留；刷卡成功與否需要實體平板與卡片，未驗證' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(290000);
      const name = uniqueTabletName('cf');
      created.push(name);
      await createTabletViaUI(page, name);
      await openEdit(page, name);
      await gotoAccessStep(page);
      const opts = await sel(page, 0).locator('option').allInnerTexts();
      const cur = await selLabel(page, 0);
      obs(`卡片規格選項：${opts.map((o) => o.trim()).join('、')}；目前：${cur}`);
      const pick = opts.map((o) => o.trim()).find((o) => /bit/.test(o) && o !== cur) as string;
      expect(pick, '沒有可切換的卡片規格').toBeTruthy();
      await sel(page, 0).selectOption({ label: pick });
      await save(page);
      await openEdit(page, name);
      await gotoAccessStep(page);
      expect(await selLabel(page, 0), '重新開啟後卡片規格沒有保留').toBe(pick);
    },
  );

  test(
    '[TAB-015] 平板設定：解除綁定功能',
    {
      annotation: [
        ...csvAnnotations({ row: 86, no: '', category: '（延續）> 平板設定', steps: '可套用雙因子驗證', expected: '2.解除綁定功能OK' }),
        { type: '判定範圍', description: '原始規格的步驟欄與預期結果欄不對應（步驟寫雙因子，預期寫解除綁定）；以「平板列表／編輯頁面存在解除綁定的操作」判定' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(290000);
      const name = uniqueTabletName('ub');
      created.push(name);
      await createTabletViaUI(page, name);
      await gotoTablets(page);
      const rowText = (await tabletRow(page, 'e2e-').first().innerText()).replace(/\s+/g, ' ');
      const listBtns = await page.locator('.vxe-table--body-wrapper button, .vxe-table--body-wrapper input[type=button]').evaluateAll((es) => es.map((e) => ((e as HTMLElement).innerText || (e as HTMLInputElement).value || '').trim()));
      await openEdit(page, name);
      const t1 = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
      await gotoAccessStep(page);
      const t2 = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
      obs(`列表按鈕：${[...new Set(listBtns)].join('、')}；列：${rowText.slice(0, 60)}`);
      expect(`${listBtns.join(' ')} ${t1} ${t2}`, '畫面上找不到「解除綁定」操作').toMatch(/解除綁定|解綁|Unbind/i);
    },
  );

  test(
    '[TAB-018] 平板設定：tablets.db 與 API 回應設定與前端一致',
    {
      annotation: [
        ...csvAnnotations({ row: 89, no: '', category: '（延續）> （空白）', steps: '檢查tablet.db\n檢查F12 response設定與前端一致', expected: '套用設定正確寫入且平板行為相符' }),
        { type: '判定範圍', description: '用測試平板（e2e- 開頭，不是真實平板）在前端改「卡片規格、雙因子、觸發繼電器」並儲存，經 ssh 唯讀比對主機 tablets.db 與 API 回應；「平板行為相符」需要真實平板操作，未包含' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(290000);
      const name = uniqueTabletName('db');
      created.push(name);
      await createTabletViaUI(page, name);
      await openEdit(page, name);
      await gotoAccessStep(page);
      const bits = (await sel(page, 0).locator('option').allInnerTexts()).map((o) => o.trim()).filter((o) => /bit/.test(o));
      const curBits = await selLabel(page, 0);
      const pickBits = bits.find((o) => o !== curBits) as string;
      const curRelay = await selLabel(page, 2);
      const pickRelay = curRelay === '是' ? '否' : '是';
      await sel(page, 0).selectOption({ label: pickBits });
      await sel(page, 1).selectOption({ label: '是' });
      await sel(page, 2).selectOption({ label: pickRelay });
      await save(page);
      // API 回應
      const api = await page.evaluate(async (n) => {
        const el = Array.from(document.querySelectorAll('*')).find((e) => (e as unknown as { __vue__?: unknown }).__vue__) as unknown as {
          __vue__: { $root: { $globalGetTabletList: (u: string, s: number, l: number) => Promise<{ data: { data_list: Array<Record<string, unknown>> } }> } };
        };
        const ret = await el.__vue__.$root.$globalGetTabletList('', 0, 200);
        return ret.data.data_list.find((t) => t.name === n) ?? null;
      }, name);
      expect(api, 'API 回應找不到測試平板').toBeTruthy();
      // 主機 tablets.db（唯讀）
      const dbText = execFileSync('ssh', ['-o', 'BatchMode=yes', '-o', 'ConnectTimeout=10', '125', 'cat /home/aira/product/data/db/tablets.db'], { encoding: 'utf8', timeout: 30000 });
      const row = (JSON.parse(dbText) as Array<Record<string, unknown>>).find((t) => t.name === name);
      expect(row, 'tablets.db 找不到測試平板').toBeTruthy();
      const bitNum = Number(/\d+/.exec(pickBits)?.[0]);
      const want = { support_wiegand_bits: bitNum, enable_two_factor_authentication: true, enable_trigger_relay: pickRelay === '是' };
      obs(`前端設定：卡片規格 ${pickBits}、雙因子 是、觸發繼電器 ${pickRelay}；API：${JSON.stringify(Object.fromEntries(Object.keys(want).map((k) => [k, (api as Record<string, unknown>)[k]])))}；tablets.db：${JSON.stringify(Object.fromEntries(Object.keys(want).map((k) => [k, (row as Record<string, unknown>)[k]])))}`);
      for (const [k, v] of Object.entries(want)) {
        expect.soft((api as Record<string, unknown>)[k], `API 回應 ${k}`).toBe(v);
        expect.soft((row as Record<string, unknown>)[k], `tablets.db ${k}`).toBe(v);
      }
      // API 與資料庫整筆一致
      const a = api as Record<string, unknown>;
      const r = row as Record<string, unknown>;
      const onlyApi = Object.keys(a).filter((k) => !(k in r));
      const onlyDb = Object.keys(r).filter((k) => !(k in a));
      const diff = Object.keys(a).filter((k) => k in r && JSON.stringify(a[k]) !== JSON.stringify(r[k]));
      obs(`API 獨有欄位：${onlyApi.join('、') || '無'}；tablets.db 獨有欄位：${onlyDb.join('、') || '無'}；共同欄位值不同：${diff.join('、') || '無'}`);
      expect(diff, '共同欄位的值，API 回應與 tablets.db 不一致').toEqual([]);
      expect(onlyDb, 'tablets.db 有欄位沒有出現在 API 回應').toEqual([]);
    },
  );
});
