import { Page, expect, test } from '@playwright/test';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { gotoPersons } from '../../helpers/persons';
import { bodyRows, typeSearch } from '../../helpers/tables';
import { shot } from '../../helpers/evidence';

// 訪客通知信（VIS-019～023）：選取訪客後按「電子郵件通知」，檢查前端送出的 sendnotification 內容。
// 收信端內容（主旨、內文、附件）以前端實際送出的請求為準；真正收信由使用者另行確認。
// 需要 .env.e2e.local 的 E2E_SMTP_TO（收件信箱，不印出）。測試訪客用 Allen 備份照片建立（e2e-vm-a 有 email、e2e-vm-b 沒有），測完刪除。
const PHOTO = 'e2e/reports/tmp/allen-photo/allen.register';
const TO = process.env.E2E_SMTP_TO || '';
const A = { id: 'e2e-vm-a', name: 'e2evma', card: '', phone: '0912345678', dept: 'QA', title: 'Tester' };
const B = { id: 'e2e-vm-b', name: 'e2evmb' };

async function createVisitors(page: Page) {
  const img = readFileSync(PHOTO, 'utf8').trim();
  return page.evaluate(
    async ({ img, to, a, b }) => {
      const el = Array.from(document.querySelectorAll('*')).find((e) => (e as unknown as { __vue__?: unknown }).__vue__) as any;
      const root = el.__vue__.$root;
      const mk = (v: any, email: string) => ({
        id: v.id, name: v.name, card_number: v.card || '', begin_date: 0, expire_date: 0, group_list: ['All Visitor'], card_facility_code: '',
        display_image: img, register_image: img, as_admin: false,
        extra_info: { title: v.title || '', department: v.dept || '', email, phone_number: v.phone || '', extension_number: '', remarks: 'e2e 測試訪客（測完刪除）' },
      });
      const r1 = await root.$globalCreateVisitor(mk(a, to));
      const r2 = await root.$globalCreateVisitor(mk(b, ''));
      return [r1.error ? String(r1.error) : 'ok', r2.error ? String(r2.error) : 'ok'];
    },
    { img, to: TO, a: A, b: B },
  );
}

async function removeVisitors(page: Page) {
  await page.evaluate(async (ids) => {
    const el = Array.from(document.querySelectorAll('*')).find((e) => (e as unknown as { __vue__?: unknown }).__vue__) as any;
    const root = el.__vue__.$root;
    const list = ((await root.$globalFindVisitorWithoutPhoto('', 0, 500)).data || {}).visitor_list || [];
    for (const v of list.filter((x: any) => ids.includes(x.id))) await root.$globalRemoveVisitor([v.uuid]);
  }, [A.id, B.id]);
}

test.describe('VIS 通知信', () => {
  const SENT = 'e2e/reports/tmp/vis-mail-sent.json';
  type Mail = { subject: string; to: string[]; body: string; attach: string };
  const load = (): Mail[] => (existsSync(SENT) ? JSON.parse(readFileSync(SENT, 'utf8')) : []);
  let sent: Mail[] = [];

  test('[VIS-019] 訪客通知信：針對選取訪客寄送 Email 夾帶 QR 照片', async ({ page }) => {
    test.setTimeout(240000);
    expect(TO, '缺 E2E_SMTP_TO').not.toBe('');
    await gotoPersons(page, 'visitor');
    expect(await createVisitors(page)).toEqual(['ok', 'ok']);
    await gotoPersons(page, 'visitor');
    await typeSearch(page, 'e2evm');
    await expect(bodyRows(page).filter({ hasText: A.id }).first()).toBeVisible();
    await expect(bodyRows(page).filter({ hasText: B.id }).first()).toBeVisible();
    // 勾選兩位訪客（一位有 email、一位沒有）
    for (const v of [A, B]) await bodyRows(page).filter({ hasText: v.id }).first().locator('.vxe-checkbox--icon').first().click();
    const reqs: any[] = [];
    page.on('request', (r) => {
      if (r.url().includes('/sendnotification')) reqs.push(JSON.parse(r.postData() || '{}'));
    });
    await page.getByRole('button', { name: '電子郵件通知' }).click();
    await page.waitForTimeout(8000);
    await shot(page, 'VIS-019', '01-按電子郵件通知後');
    writeFileSync(SENT, JSON.stringify(reqs));
    sent = reqs;
    expect(reqs.length, `送出的通知信數量（有 email 的訪客 1 位）`).toBe(1);
    expect(reqs[0].to, '收件者').toEqual([TO]);
    expect((reqs[0].attach || '').length, 'QR 照片附件').toBeGreaterThan(100);
  });

  test('[VIS-020] 訪客通知信：未填寫 email 的訪客不會寄出', async () => {
    sent = load();
    expect(sent.length, 'VIS-019 沒有送出請求').toBe(1);
    // 兩位被選取、只有 1 封信送出，且收件者不是沒填 email 的訪客（沒有空白收件者）
    expect(sent.every((s) => s.to.length === 1 && s.to[0] !== ''), '不應有空白收件者').toBe(true);
  });

  test('[VIS-021] 訪客通知信：email 主旨為 {id}-{姓名}', async () => {
    sent = load();
    expect(sent.length).toBe(1);
    expect.soft(sent[0].subject, `主旨（實際：${sent[0].subject}）`).toBe(`${A.id}-${A.name}`);
  });

  test('[VIS-022] 訪客通知信：內容由上至下依序為 id、姓名、手機、部門、職稱、Email', async () => {
    sent = load();
    expect(sent.length).toBe(1);
    const lines = sent[0].body.split('\n').map((s) => s.trim()).filter(Boolean);
    const want = [A.id, A.name, A.phone, A.dept, A.title, TO];
    const idx = want.map((w) => lines.findIndex((l) => l.includes(w)));
    expect(idx.every((i) => i >= 0), `內容缺欄位（實際：${lines.join(' / ').replace(TO, '<收件信箱>')}）`).toBe(true);
    expect([...idx].sort((x, y) => x - y), '欄位順序').toEqual(idx);
  });

  test('[VIS-023] 訪客通知信：email 附件為 QR 照片', async () => {
    sent = load();
    expect(sent.length).toBe(1);
    const buf = Buffer.from(sent[0].attach, 'base64');
    expect(buf.subarray(0, 4).toString('hex'), '附件應為 PNG').toBe('89504e47');
  });

  test.afterAll(async ({ browser }) => {
    const ctx = await browser.newContext({ ignoreHTTPSErrors: true, baseURL: process.env.E2E_BASE_URL, storageState: 'e2e/.auth/admin.json' });
    const page = await ctx.newPage();
    await page.goto('/#/personsmanagement/visitormanagement');
    await page.reload();
    await page.waitForTimeout(3000);
    await removeVisitors(page);
    await ctx.close();
  });
});
