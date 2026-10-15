import { Browser, Page, expect } from '@playwright/test';
import { ADMIN_STORAGE_PATH } from './accounts';
import { bodyRows, listReady } from './tables';

// 群組管理頁 helper。群組名稱不能含特殊字元（含連字號），故測試群組一律以「e2e」開頭（無連字號）並於測項結束清理。
// 絕不操作既有群組（All Person、All Visitor、admin、employee 等）。

export const GROUP_PREFIX = 'e2e';

export function uniqueGroupName(tag: string) {
  return `${GROUP_PREFIX}${tag}${Date.now().toString(36).slice(-5)}`;
}

export async function gotoGroups(page: Page) {
  await page.goto('/#/personsmanagement/groupmanagement');
  await page.reload();
  await page.getByRole('button', { name: '新增' }).first().waitFor();
  await listReady(page);
}

export const groupRow = (page: Page, name: string) => bodyRows(page).filter({ hasText: name });
export const rowAction = (row: ReturnType<typeof groupRow>, label: string) => row.first().locator(`input[type=button][value="${label}"]`);

export async function searchGroups(page: Page, keyword: string) {
  const box = page.getByPlaceholder('搜尋').first();
  await box.fill(keyword);
  await box.press('Enter');
  await page.waitForTimeout(800);
}

export const groupRowTexts = async (page: Page) =>
  (await bodyRows(page).evaluateAll((rows) => rows.map((r) => (r as HTMLElement).innerText.replace(/\s+/g, ' ').trim()))).filter(
    (s) => s.length > 0,
  );

export interface GroupInput {
  name: string;
  remarks?: string;
  personIds?: string[];
  visitorIds?: string[];
}

/** 進入新增群組頁並填入第 1 步（名稱、備註）。 */
export async function openCreateGroup(page: Page) {
  await gotoGroups(page);
  await page.getByRole('button', { name: '新增' }).first().click();
  await expect(page).toHaveURL(/creategroup/);
  await page.locator('input[type=text]:visible').first().waitFor();
  await page.waitForTimeout(1500); // 表單載入完成前輸入的值會被重置
}

/** 第 2 步：切到「人員」或「訪客」頁籤，用左側搜尋框找到對象並勾選後按「加入>」。 */
export async function addMembersInStep2(page: Page, tab: '人員' | '訪客', ids: string[]) {
  await page.getByText(tab, { exact: true }).first().click();
  for (const id of ids) {
    const search = page.getByPlaceholder('搜尋').first();
    await search.fill(id);
    await search.press('Enter');
    await page.waitForTimeout(600);
    const row = page.locator('.vxe-table--body-wrapper tbody tr').filter({ hasText: id }).first();
    await row.locator('.vxe-cell--checkbox').click();
    await page.getByRole('button', { name: '加入>' }).click();
    await page.waitForTimeout(400);
  }
}

/** 以介面建立群組：第 1 步填名稱／備註 → 下一步 → （選人員／訪客）→ 創建 → 完成。回到群組列表。 */
export async function createGroupViaUI(page: Page, g: GroupInput) {
  await openCreateGroup(page);
  const inputs = page.locator('input[type=text]:visible');
  await inputs.nth(0).fill(g.name);
  if (g.remarks !== undefined) await inputs.nth(1).fill(g.remarks);
  const next = page.getByRole('button', { name: '下一步' });
  await expect(next).toBeEnabled();
  await next.click();
  if (g.personIds?.length) await addMembersInStep2(page, '人員', g.personIds);
  if (g.visitorIds?.length) await addMembersInStep2(page, '訪客', g.visitorIds);
  await page.getByRole('button', { name: '創建' }).click();
  await page.getByRole('button', { name: '完成' }).click();
  await listReady(page);
}

/** 以介面刪除單一群組（只允許 e2e 開頭）。不存在時略過。 */
export async function deleteGroupViaUI(page: Page, name: string) {
  if (!name.startsWith(GROUP_PREFIX)) throw new Error(`拒絕刪除非測試群組：${name}`);
  await gotoGroups(page);
  await searchGroups(page, name);
  const row = groupRow(page, name);
  if ((await row.count()) === 0) return;
  await rowAction(row, '刪除').click();
  await page.locator('.el-message-box__btns .el-button--primary').click();
  await expect(groupRow(page, name)).toHaveCount(0, { timeout: 10000 });
}

/** 以獨立的 Admin 瀏覽器環境清理測試群組。 */
export async function cleanupGroups(browser: Browser, names: string[]) {
  if (names.length === 0) return;
  const ctx = await browser.newContext({
    ignoreHTTPSErrors: true,
    baseURL: process.env.E2E_BASE_URL,
    storageState: ADMIN_STORAGE_PATH,
  });
  try {
    const page = await ctx.newPage();
    for (const n of names) await deleteGroupViaUI(page, n).catch(() => {});
  } finally {
    await ctx.close();
  }
}

/** 以介面編輯群組：只改備註與（可選）加入人員／訪客；儲存後回到列表。 */
export async function editGroupViaUI(page: Page, name: string, changes: { remarks?: string; addPersonIds?: string[]; addVisitorIds?: string[] }) {
  await gotoGroups(page);
  await searchGroups(page, name);
  await rowAction(groupRow(page, name), '編輯').click();
  await expect(page).toHaveURL(/modifygroup/);
  const inputs = page.locator('input[type=text]:visible');
  await inputs.nth(1).waitFor();
  await page.waitForTimeout(1500);
  if (changes.remarks !== undefined) await inputs.nth(1).fill(changes.remarks);
  await page.getByRole('button', { name: '下一步' }).click();
  if (changes.addPersonIds?.length) await addMembersInStep2(page, '人員', changes.addPersonIds);
  if (changes.addVisitorIds?.length) await addMembersInStep2(page, '訪客', changes.addVisitorIds);
  await page.getByRole('button', { name: '儲存變更' }).click();
  await page.getByRole('button', { name: '完成' }).click();
  await listReady(page);
}
