import { test, expect, Page, Browser } from '@playwright/test';
import { resolve } from 'node:path';
import { csvAnnotations } from '../../helpers/csvSource';
import { importViaUI } from '../../helpers/personsIo';

// 來源 E2E-TEST-PLAN.md：VIS-018（訪客資料集匯入功能）。使用者提供資料集：PersonsList (4).zip（產品下載的範本，內含 John、Merry 兩筆範例與 3 張照片），
// 已解壓到 e2e/reports/tmp/pl4。匯入為「訪客」，測完只刪除這次匯入的 2 位訪客（A-0001、A-0002；測前若已存在同編號訪客則不執行）。
const DIR = resolve('e2e/reports/tmp/pl4b');
const IDS = ['V18-0001', 'V18-0002'];
const ADMIN = 'e2e/.auth/admin.json';

async function readVisitors(page: Page) {
  return page.evaluate(async (ids) => {
    const el = Array.from(document.querySelectorAll('*')).find((e) => (e as unknown as { __vue__?: unknown }).__vue__) as any;
    const root = el.__vue__.$root;
    const vs = (((await root.$globalFindVisitorWithoutPhoto('', 0, 1000)).data || {}).visitor_list || []) as any[];
    const out: any[] = [];
    for (const v of vs.filter((x) => ids.includes(x.id))) {
      const ph = (await root.$globalFetchPhoto(v.uuid)).data || {};
      out.push({
        uuid: v.uuid,
        id: v.id,
        name: v.name,
        card: v.card_number,
        begin: v.begin_date,
        expire: v.expire_date,
        groups: (v.group_list || []).join('|'),
        dept: v.extra_info && v.extra_info.department,
        title: v.extra_info && v.extra_info.title,
        email: v.extra_info && v.extra_info.email,
        phone: v.extra_info && v.extra_info.phone_number,
        ext: v.extra_info && v.extra_info.extension_number,
        regLen: (ph.register_image || '').length,
        dispLen: (ph.display_image || '').length,
      });
    }
    return out;
  }, IDS);
}

async function cleanup(browser: Browser) {
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true, baseURL: process.env.E2E_BASE_URL, storageState: ADMIN });
  try {
    const page = await ctx.newPage();
    await page.goto('/#/personsmanagement/visitormanagement');
    await page.reload();
    await page.waitForTimeout(4000);
    const mine = await readVisitors(page);
    const uuids = mine.map((m) => m.uuid);
    if (uuids.length) {
      await page.evaluate(async (u) => {
        const el = Array.from(document.querySelectorAll('*')).find((e) => (e as unknown as { __vue__?: unknown }).__vue__) as any;
        await el.__vue__.$root.$globalRemoveVisitor(u);
      }, uuids);
    }
  } finally {
    await ctx.close();
  }
}

let preexisting = false;
test.afterEach(async ({ browser }) => {
  if (!preexisting) await cleanup(browser);
});

test(
  '[VIS-018] 訪客資料集匯入功能：匯入 PersonsList (4).zip',
  {
    annotation: [
      ...csvAnnotations({ row: 66, no: '', category: '（延續）> 訪客(匯入)', steps: '（原始規格無對應步驟）', expected: '4.訪客資料集匯入功能正常' }),
      { type: '判定範圍', description: '規格沒有步驟與資料集定義；以使用者提供的 PersonsList (4).zip 匯入為訪客，檢查匯入摘要成功筆數、訪客資料欄位與照片是否與檔案一致；測完刪除這 2 位訪客' },
    ],
  },
  async ({ page }) => {
    test.setTimeout(280000);
    await page.goto('/#/personsmanagement/visitormanagement');
    await page.reload();
    await page.waitForTimeout(4000);
    const before = await readVisitors(page);
    preexisting = before.length > 0;
    expect(preexisting, `測前已有同編號訪客（${before.map((b) => b.id).join('、')}），為避免誤刪不執行`).toBe(false);
    const res = await importViaUI(page, `${DIR}/PersonsTemplate.xlsx`, [`${DIR}/snapshot/V18-0001.jpeg`, `${DIR}/snapshot/V18-0001_d.jpeg`, `${DIR}/snapshot/V18-0002.jpeg`], 'visitor');
    test.info().annotations.push({ type: '觀察', description: `匯入摘要：${res.text}` });
    console.log('OBS 匯入摘要', res.text);
    await page.goto('/#/personsmanagement/visitormanagement');
    await page.reload();
    await page.waitForTimeout(4000);
    const got = await readVisitors(page);
    console.log('OBS 匯入後訪客', JSON.stringify(got.map((g) => ({ ...g, uuid: undefined }))));
    test.info().annotations.push({ type: '觀察', description: `匯入後訪客：${JSON.stringify(got.map((g) => ({ ...g, uuid: undefined })))}` });
    expect.soft(res.fail, '匯入失敗筆數').toBe(0);
    expect(got.map((g) => g.id).sort(), '匯入後應出現 A-0001、A-0002 兩位訪客').toEqual(IDS);
    const a = got.find((g) => g.id === 'V18-0001');
    const b = got.find((g) => g.id === 'V18-0002');
    expect.soft(a?.name, 'A-0001 姓名').toBe('John');
    expect.soft(a?.dept, 'A-0001 部門').toBe('Department-2');
    expect.soft(a?.title, 'A-0001 職稱').toBe('Job Title');
    expect.soft(a?.card, 'A-0001 卡號').toBe('84325746');
    expect.soft(a?.email, 'A-0001 Email').toBe('john@abc.com.tw');
    expect.soft(a?.phone, 'A-0001 電話').toBe('0912345678');
    expect.soft(a?.ext, 'A-0001 分機').toBe('2585');
    expect.soft(a?.groups.split('|').sort(), 'A-0001 群組').toEqual(expect.arrayContaining(['Group-1', 'Group-2']));
    expect.soft(b?.name, 'A-0002 姓名').toBe('Merry');
    expect.soft(b?.dept, 'A-0002 部門').toBe('Department-1');
    expect.soft(b?.email, 'A-0002 Email').toBe('merry@abc.com.tw');
    expect.soft(b?.groups, 'A-0002 群組').toContain('Group-2');
    // 範本內的註冊照片是卡通頭像（沒有真人臉），產品無法產生人臉特徵，因此不要求註冊照片；只記錄觀察
    test.info().annotations.push({ type: '觀察', description: `註冊照片長度：V18-0001=${a?.regLen}、V18-0002=${b?.regLen}（範本照片為卡通頭像，無人臉）；顯示用照片長度：V18-0001=${a?.dispLen}、V18-0002=${b?.dispLen}` });
    expect.soft(a?.dispLen ?? 0, 'V18-0001 顯示用照片（V18-0001_d.jpeg）').toBeGreaterThan(0);
  },
);
