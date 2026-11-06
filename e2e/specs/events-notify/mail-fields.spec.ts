import { test, expect, Page } from '../../helpers/test';
import { ADMIN_STORAGE_PATH } from '../../helpers/accounts';
import { bodyRows } from '../../helpers/tables';

// 來源 E2E-TEST-PLAN.md：MAIL-002~014、017、018（Email 通知設定的欄位驗證與內容欄位設定）。
// 只驗證前端設定（欄位驗證、設定可儲存並保留）；實際寄信與收信由使用者人工測試，不在本檔範圍。
// 測試用郵件通知名稱以 e2e- 開頭，結束後由獨立 Admin 環境刪除。主機用保留網域 example.com，不會寄出任何信件。
const LIST = '/#/notifications/mailnotify';
const created: string[] = [];
const obs = (s: string) => {
  console.log('OBS', s);
  test.info().annotations.push({ type: '觀察', description: s });
};
const next = (page: Page) => page.getByRole('button', { name: '下一步' });

async function deleteMail(page: Page, name: string) {
  if (!name.startsWith('e2e-')) throw new Error(`拒絕刪除非測試郵件通知：${name}`);
  await page.goto(LIST);
  await page.reload();
  await page.getByRole('button', { name: '新增' }).first().waitFor();
  await page.waitForTimeout(2500);
  const row = bodyRows(page).filter({ hasText: name });
  if ((await row.count()) === 0) return;
  await row.first().getByRole('button', { name: '刪除' }).click();
  await page.locator('.el-message-box__btns .el-button--primary').click();
  await expect(bodyRows(page).filter({ hasText: name })).toHaveCount(0, { timeout: 15000 });
}
test.afterEach(async ({ browser }) => {
  const names = created.splice(0);
  if (names.length === 0) return;
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true, baseURL: process.env.E2E_BASE_URL, storageState: ADMIN_STORAGE_PATH });
  try {
    const p = await ctx.newPage();
    for (const n of names) await deleteMail(p, n).catch(() => {});
  } finally {
    await ctx.close();
  }
});

/** 第 1 步欄位（依畫面順序的文字／密碼輸入框）。 */
const FIELDS = ['name', 'host', 'port', 'sender', 'username', 'password', 'subject', 'to', 'cc', 'bcc'] as const;
type Field = (typeof FIELDS)[number];
const input = (page: Page, f: Field) => page.locator('input:visible:not([type=file])').nth(FIELDS.indexOf(f));
const BASE: Record<Field, string> = { name: '', host: 'example.com', port: '587', sender: 'e2e@example.com', username: 'e2e@example.com', password: 'e2e-pass', subject: 'e2e', to: 'e2e@example.com', cc: '', bcc: '' };

async function openAddMail(page: Page) {
  await page.goto(LIST);
  await page.reload();
  await page.getByRole('button', { name: '新增' }).first().waitFor();
  await page.waitForTimeout(2500);
  await page.getByRole('button', { name: '新增' }).first().click();
  await input(page, 'name').waitFor();
  await page.waitForTimeout(2000);
}
async function fillAll(page: Page, over: Partial<Record<Field, string>> = {}) {
  const v = { ...BASE, name: `e2e-mail-${Date.now().toString(36).slice(-5)}`, ...over };
  for (const f of FIELDS) await input(page, f).fill(v[f]);
  await page.waitForTimeout(500);
  return v;
}
/** 逐一把欄位改成指定值，回傳「下一步是否可按」。 */
async function probeField(page: Page, f: Field, values: string[]) {
  const out: Array<[string, boolean]> = [];
  for (const val of values) {
    await fillAll(page, { [f]: val });
    out.push([val, await next(page).isEnabled()]);
  }
  return out;
}
const show = (r: Array<[string, boolean]>) => r.map(([v, ok]) => `「${v}」→${ok ? '可' : '擋'}`).join('；');

test.describe('MAIL 設定欄位驗證', () => {
  const cases: Array<{ id: string; row: number; field: Field; steps: string; bad: string[]; good: string[]; note?: string }> = [
    { id: 'MAIL-002', row: 102, field: 'host', steps: 'Host Address: IP或DNS (regx: /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\\.[a-zA-Z]{2,}$/)', bad: ['', 'a', 'not a host', '-bad.com', 'x!.com'], good: ['example.com', '192.0.2.10'] },
    { id: 'MAIL-003', row: 102, field: 'port', steps: 'Port: 0~65535', bad: ['', 'abc', '-1', '65536', '99999'], good: ['0', '587', '65535'] },
    { id: 'MAIL-004', row: 102, field: 'sender', steps: 'Sender: 不為空 文字', bad: ['', '   '], good: ['e2e@example.com'] },
    { id: 'MAIL-005', row: 102, field: 'username', steps: 'Username: Email帳號 (regx: ^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$)', bad: ['', 'abc', 'a@b', 'a@b.c', 'a b@example.com'], good: ['e2e@example.com', 'e2e.test-1@mail.example.com'] },
    { id: 'MAIL-006', row: 102, field: 'password', steps: 'Password: 不為空 文字', bad: ['', '   '], good: ['e2e-pass'] },
    { id: 'MAIL-007', row: 102, field: 'subject', steps: 'Subject: 不為空 文字', bad: ['', '   '], good: ['e2e'] },
    { id: 'MAIL-008', row: 102, field: 'to', steps: 'To: 至少選1 user group', bad: [''], good: ['e2e@example.com'], note: '畫面上「收件者」是自由輸入文字（Email），不是「選 user group」' },
    { id: 'MAIL-009', row: 102, field: 'cc', steps: 'CC: 可為空', bad: [], good: ['', 'e2e@example.com'] },
    { id: 'MAIL-010', row: 102, field: 'bcc', steps: 'BCC: 可為空', bad: [], good: ['', 'e2e@example.com'] },
  ];
  for (const c of cases) {
    test(
      `[${c.id}] Email 設定：${c.steps.split(':')[0]} ${c.steps.split(':').slice(1).join(':').slice(0, 30)}`,
      {
        annotation: [
          { type: '判定範圍', description: `原始規格未定義違反時的行為，以「不合規的輸入無法按下一步、合規的輸入可按下一步」判定；實際寄信由使用者人工測試${c.note ? `。${c.note}` : ''}` },
        ],
      },
      async ({ page }) => {
        test.setTimeout(240000);
        await openAddMail(page);
        const bad = await probeField(page, c.field, c.bad);
        const good = await probeField(page, c.field, c.good);
        obs(`不合規：${show(bad)}。合規：${show(good)}`);
        const wrongBad = bad.filter(([, ok]) => ok).map(([v]) => `「${v}」`);
        const wrongGood = good.filter(([, ok]) => !ok).map(([v]) => `「${v}」`);
        expect(wrongBad, `不合規的輸入仍可按下一步：${wrongBad.join('、')}`).toEqual([]);
        expect(wrongGood, `合規的輸入卻無法按下一步：${wrongGood.join('、')}`).toEqual([]);
      },
    );
  }
});

// ---- 內容欄位（第 2 步）設定：可設定並儲存保留 ----
// 第 2 步 14 個勾選欄位依畫面順序：0 時間、1 人員編號、2 姓名、3 卡號、4 職稱、5 部門、6 電子郵件、7 電話、8 分機、9 備註、10 額溫、11 抓拍照片、12 註冊照片、13 顯示用照片；另有語言下拉選單。
const BOX = { timestamp: 0, personId: 1, face: 11, register: 12, display: 13 } as const;
const boxes = (page: Page) => page.locator('input[type=checkbox]');
async function setBox(page: Page, idx: number, on: boolean) {
  const b = boxes(page).nth(idx);
  if ((await b.isChecked()) === on) return;
  await page.locator('label').filter({ has: b }).first().click().catch(async () => b.click({ force: true }));
  await expect.poll(() => b.isChecked(), { timeout: 5000 }).toBe(on);
}
async function createMailWith(page: Page, apply: (p: Page) => Promise<void>) {
  await openAddMail(page);
  const v = await fillAll(page);
  created.push(v.name);
  await next(page).click();
  await page.getByText('語言').first().waitFor();
  await page.waitForTimeout(1500);
  await apply(page);
  await next(page).click();
  await page.waitForTimeout(3000);
  obs('儲存後畫面：' + (await page.locator('body').innerText()).slice(-200).split(String.fromCharCode(10)).join(' '));
  const done = page.getByRole('button', { name: '完成' });
  await done.waitFor({ timeout: 20000 });
  await done.click();
  await page.waitForTimeout(2000);
  return v.name;
}
async function openMailStep2(page: Page, name: string) {
  await page.goto(LIST);
  await page.reload();
  await page.getByRole('button', { name: '新增' }).first().waitFor();
  await page.waitForTimeout(2500);
  const row = bodyRows(page).filter({ hasText: name });
  await expect(row, '列表找不到剛新增的郵件通知').toHaveCount(1);
  await row.first().getByRole('button', { name: '編輯' }).click();
  await input(page, 'name').waitFor();
  await page.waitForTimeout(2000);
  await next(page).click();
  await page.getByText('語言').first().waitFor();
  await page.waitForTimeout(1500);
}

test.describe('MAIL 照片三選一', () => {
  test(
    '[MAIL-019] Email 通知：抓拍、註冊、顯示用照片只能至多三選一傳送',
    {
      annotation: [
        { type: '判定範圍', description: '只驗證前端：勾選其中一種照片後，另外兩種不可再勾選（至多選一）；實際寄出的信件內容由使用者人工測試' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(240000);
      await openAddMail(page);
      await fillAll(page);
      await next(page).click();
      await page.getByText('語言').first().waitFor();
      await page.waitForTimeout(1500);
      const enabled = async () => [BOX.face, BOX.register, BOX.display].map((i) => boxes(page).nth(i)).map(async (b) => !(await b.isDisabled()));
      const state = async () => Promise.all(await enabled());
      obs(`初始（皆未勾）：可勾選狀態 ${JSON.stringify(await state())}`);
      expect(await state(), '初始時三種照片都應可勾選').toEqual([true, true, true]);
      for (const [name, idx, others] of [
        ['抓拍', BOX.face, [BOX.register, BOX.display]],
        ['註冊', BOX.register, [BOX.face, BOX.display]],
        ['顯示用', BOX.display, [BOX.face, BOX.register]],
      ] as const) {
        await setBox(page, idx, true);
        for (const o of others) expect(await boxes(page).nth(o).isDisabled(), `勾選「${name}照片」後，其他種照片仍可勾選`).toBe(true);
        await setBox(page, idx, false);
        expect(await state(), `取消「${name}照片」後，三種照片應恢復可勾選`).toEqual([true, true, true]);
      }
    },
  );
});
