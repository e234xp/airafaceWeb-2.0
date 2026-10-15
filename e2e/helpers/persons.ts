import { Browser, Page, expect } from '@playwright/test';
import { ADMIN_STORAGE_PATH } from './accounts';
import { bodyRows, listReady } from './tables';

// 人員管理頁 helper。介面語言固定為繁體中文。
// 測試人員編號一律以 e2e- 開頭，並於測項結束時清理；絕不操作既有人員（如 A-001）。

export function uniquePersonId(tag: string) {
  return `e2e-${tag}-${Date.now().toString(36).slice(-5)}`;
}

export type Kind = 'person' | 'visitor';
const ROUTES: Record<Kind, string> = {
  person: '/#/personsmanagement/personmanagement',
  visitor: '/#/personsmanagement/visitormanagement',
};

export async function gotoPersons(page: Page, kind: Kind = 'person') {
  await page.goto(ROUTES[kind]);
  await page.reload(); // 只換 hash 不會重新載入清單
  await page.getByRole('button', { name: '新增' }).first().waitFor();
  await listReady(page);
}

/** 新增頁第一步的欄位（依畫面由左至右、由上至下） */
export const FORM_FIELDS = [
  'id',
  'name',
  'department',
  'title',
  'card',
  'email',
  'extension',
  'phone',
  'beginDate',
  'expireDate',
  'asAdmin',
  'remarks',
] as const;
export type FormField = (typeof FORM_FIELDS)[number];

export const formInputs = (page: Page) =>
  page.locator('table.table-layout input, table.table-layout select').filter({ visible: true });
export const formInput = (page: Page, field: FormField) => formInputs(page).nth(FORM_FIELDS.indexOf(field));

/** 從人員列表按「新增」進入新增頁（直接 goto 新增頁會被導回列表）。 */
export async function openAddPerson(page: Page, kind: Kind = 'person') {
  await gotoPersons(page, kind);
  await page.getByRole('button', { name: '新增' }).first().click();
  await formInputs(page).first().waitFor();
}

export interface PersonInput {
  id: string;
  name: string;
  department?: string;
  title?: string;
  card?: string;
  email?: string;
  remarks?: string;
}

export async function fillPersonForm(page: Page, p: PersonInput) {
  await formInput(page, 'id').fill(p.id);
  await formInput(page, 'name').fill(p.name);
  if (p.department !== undefined) await formInput(page, 'department').fill(p.department);
  if (p.title !== undefined) await formInput(page, 'title').fill(p.title);
  if (p.card !== undefined) await formInput(page, 'card').fill(p.card);
  if (p.email !== undefined) await formInput(page, 'email').fill(p.email);
  if (p.remarks !== undefined) await formInput(page, 'remarks').fill(p.remarks);
}

/** 以介面新增人員（不上傳照片）：填資料 → 下一步 → 註冊 → 完成，回到人員列表。 */
export async function createPersonViaUI(page: Page, p: PersonInput, kind: Kind = 'person') {
  await openAddPerson(page, kind);
  await fillPersonForm(page, p);
  await page.getByRole('button', { name: '下一步' }).click();
  await page.getByRole('button', { name: '註冊' }).click();
  await expect(page.getByText('註冊完成')).toBeVisible();
  await page.getByRole('button', { name: '完成' }).click();
  await listReady(page);
}

/** 列表搜尋框輸入關鍵字（過濾在前端，立即生效）。 */
export async function searchPersons(page: Page, keyword: string) {
  const box = page.getByPlaceholder('搜尋').first();
  await box.fill(keyword);
  await box.press('Enter');
  await page.waitForTimeout(800);
}

/** 目前清單的每一列文字（已過濾空列）。 */
export const personRowTexts = async (page: Page) =>
  (await bodyRows(page).evaluateAll((rows) => rows.map((r) => (r as HTMLElement).innerText.replace(/\s+/g, ' ').trim()))).filter(
    (s) => s.length > 0,
  );

/** 以介面刪除單一人員（只允許 e2e- 開頭的編號）。人員不存在時直接略過。 */
export async function deletePersonViaUI(page: Page, id: string, kind: Kind = 'person') {
  if (!id.startsWith('e2e-')) throw new Error(`拒絕刪除非測試人員：${id}`);
  await gotoPersons(page, kind);
  await searchPersons(page, id);
  const row = bodyRows(page).filter({ hasText: id }).first();
  if ((await row.count()) === 0) return;
  await row.getByRole('button', { name: '刪除' }).click();
  await page.locator('.el-message-box__btns .el-button--primary').click();
  await expect(bodyRows(page).filter({ hasText: id })).toHaveCount(0, { timeout: 10000 });
}

/** 以獨立的 Admin 瀏覽器環境清理測試人員（測項逾時／失敗時仍可執行）。 */
export async function cleanupPersons(browser: Browser, ids: string[], kind: Kind = 'person') {
  if (ids.length === 0) return;
  const ctx = await browser.newContext({
    ignoreHTTPSErrors: true,
    baseURL: process.env.E2E_BASE_URL,
    storageState: ADMIN_STORAGE_PATH,
  });
  try {
    const page = await ctx.newPage();
    for (const id of ids) await deletePersonViaUI(page, id, kind).catch(() => {});
  } finally {
    await ctx.close();
  }
}
