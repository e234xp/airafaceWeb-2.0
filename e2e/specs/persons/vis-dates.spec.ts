import { Page, expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { gotoPersons } from '../../helpers/persons';
import { bodyRows, typeSearch } from '../../helpers/tables';
import { shot } from '../../helpers/evidence';

// VIS-008 新增訪客：生效／失效日期符合現況。
// 以 API 建立三位訪客（尚未生效、已失效、有效中），到訪客管理頁檢查名稱欄是否標示「生效於／失效於」。測完刪除。
const PHOTO = 'e2e/reports/tmp/allen-photo/allen.register';
const DAY = 24 * 3600 * 1000;
const midnight = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};
const V = {
  future: { id: 'e2e-vd-future', name: 'e2evdfuture', begin: midnight() + 3 * DAY, expire: midnight() + 10 * DAY },
  expired: { id: 'e2e-vd-expired', name: 'e2evdexpired', begin: midnight() - 10 * DAY, expire: midnight() - 2 * DAY },
  valid: { id: 'e2e-vd-valid', name: 'e2evdvalid', begin: midnight() - 2 * DAY, expire: midnight() + 5 * DAY },
};

test('[VIS-008] 新增訪客：生效/失效日期符合現況', async ({ page }: { page: Page }) => {
  test.setTimeout(240000);
  await gotoPersons(page, 'visitor');
  const img = readFileSync(PHOTO, 'utf8').trim();
  const res = await page.evaluate(
    async ({ img, v }) => {
      const el = Array.from(document.querySelectorAll('*')).find((e) => (e as unknown as { __vue__?: unknown }).__vue__) as any;
      const root = el.__vue__.$root;
      const out: string[] = [];
      for (const x of Object.values(v) as any[]) {
        const r = await root.$globalCreateVisitor({
          id: x.id, name: x.name, card_number: '', begin_date: x.begin, expire_date: x.expire, group_list: ['All Visitor'], card_facility_code: '',
          display_image: img, register_image: img, as_admin: false,
          extra_info: { title: '', department: '', email: '', phone_number: '', extension_number: '', remarks: 'e2e 測試訪客（測完刪除）' },
        });
        out.push(r.error ? String(r.error) : 'ok');
      }
      return out;
    },
    { img, v: V },
  );
  expect(res).toEqual(['ok', 'ok', 'ok']);
  try {
    await gotoPersons(page, 'visitor');
    await typeSearch(page, 'e2evd');
    const row = (id: string) => bodyRows(page).filter({ hasText: id }).first();
    await expect(row(V.future.id)).toBeVisible();
    const texts = {
      future: (await row(V.future.id).innerText()).replace(/\s+/g, ' '),
      expired: (await row(V.expired.id).innerText()).replace(/\s+/g, ' '),
      valid: (await row(V.valid.id).innerText()).replace(/\s+/g, ' '),
    };
    await shot(page, 'VIS-008', '01-三位訪客的生效失效標示');
    expect.soft(texts.future, `尚未生效的訪客：${texts.future}`).toContain('生效於');
    expect.soft(texts.expired, `已失效的訪客：${texts.expired}`).toContain('失效於');
    expect.soft(texts.valid, `有效中的訪客不應標示：${texts.valid}`).not.toMatch(/生效於|失效於/);
  } finally {
    await page.evaluate(async (ids) => {
      const el = Array.from(document.querySelectorAll('*')).find((e) => (e as unknown as { __vue__?: unknown }).__vue__) as any;
      const root = el.__vue__.$root;
      const list = ((await root.$globalFindVisitorWithoutPhoto('', 0, 500)).data || {}).visitor_list || [];
      for (const v of list.filter((x: any) => ids.includes(x.id))) await root.$globalRemoveVisitor([v.uuid]);
    }, Object.values(V).map((x) => x.id));
  }
});
