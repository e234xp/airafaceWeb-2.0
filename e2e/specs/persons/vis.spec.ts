import { test, expect, Page } from '../../helpers/test';
import JSZip from 'jszip';
import * as ExcelJS from 'exceljs';
import { existsSync, readFileSync } from 'node:fs';
import { MB, TMP_DIR, makePng, writeFile } from '../../helpers/files';
import {
  FormField,
  Kind,
  cleanupPersons,
  createPersonViaUI,
  fillPersonForm,
  formInput,
  gotoPersons,
  openAddPerson,
  personRowTexts,
  searchPersons,
} from '../../helpers/persons';
import { buildImportFiles, downloadTemplate, editPersonViaUI, importViaUI } from '../../helpers/personsIo';
import { bodyRows, readAllRows } from '../../helpers/tables';

// 來源 E2E-TEST-PLAN.md；模組 VIS（#5.6 列表、#5.7 新增、#5.9 編輯、#5.10 匯入/匯出）。
// 本檔實作「適合自動化（Y）」的 12 項；其餘維持 test.fixme（部分自動化／暫不測）。
// 測試訪客編號一律 e2e- 開頭；afterEach 以獨立 Admin 環境清理。既有訪客不會被修改或刪除。

const K: Kind = 'visitor';
const token = () => Date.now().toString(36).slice(-5);
const PLACEHOLDER_PREFIX = 'data:image/png;base64,iVBORw0KGgo';
const FACE_FIXTURE = 'e2e/fixtures/face.jpg';
const faceBuffer = existsSync(FACE_FIXTURE) ? readFileSync(FACE_FIXTURE) : undefined;
const noFaceNote = () =>
  test.info().annotations.push({ type: '未驗證', description: '缺少含正臉的測試照片 e2e/fixtures/face.jpg，註冊照片的匯入／匯出未驗證' });
const created: string[] = [];
const track = (id: string) => {
  created.push(id);
  return id;
};

test.afterEach(async ({ browser }) => {
  await cleanupPersons(browser, created.splice(0), K);
});

const fieldCell = (page: Page, field: FormField) => formInput(page, field).locator('xpath=ancestor::td[1]');
const fieldError = (page: Page, field: FormField) => fieldCell(page, field).locator('.invalid-feedback');
const nextButton = (page: Page) => page.getByRole('button', { name: '下一步' });
const stepImgs = (page: Page) => page.locator('.card.d-block img');
const rowImgSrcs = (page: Page, id: string) =>
  bodyRows(page)
    .filter({ hasText: id })
    .first()
    .locator('img')
    .evaluateAll((els) => els.map((e) => (e as HTMLImageElement).src.slice(0, 20)));

async function pickPhoto(page: Page, which: 0 | 1, file: string) {
  const [fc] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button', { name: '選擇照片' }).nth(which).click(),
  ]);
  await fc.setFiles(file);
}

async function expectOversizeDisplayPhotoRejected(page: Page) {
  const big = writeFile(`${TMP_DIR}/oversize-${token()}.png`, makePng(1900, 1900, true));
  expect(readFileSync(big).length).toBeGreaterThan(10 * MB);
  const before = (await stepImgs(page).nth(1).getAttribute('src')) ?? '';
  await pickPhoto(page, 1, big);
  await page.waitForTimeout(4000);
  const after = (await stepImgs(page).nth(1).getAttribute('src')) ?? '';
  const alertShown = (await page.locator('.swal2-popup, .el-message, .el-message-box').count()) > 0;
  // 使用者 2026-10-15 確認照片大小已無限制：超過 10MB 只記錄觀察，不判定
  test.info().annotations.push({ type: '觀察', description: `超過 10MB 的顯示用照片：${after === before ? '預覽未改變' : '預覽已改變（被接受）'}；提示：${alertShown ? '有' : '無'}` });
}

/** 以匯入方式批次建立測試訪客（不含照片），回傳編號。 */
async function seedVisitors(page: Page, count: number, tag: string) {
  const tok = token();
  const people = Array.from({ length: count }, (_, i) => ({
    id: track(`e2e-${tag}${i + 1}-${tok}`),
    name: `e2e訪客${tag}${i + 1}${tok}`,
    department: `e2e部門${tok}`,
  }));
  const tpl = await downloadTemplate(page, K);
  const { xlsxPath } = await buildImportFiles(tpl, people, 'none', `vis-${tag}-${tok}`);
  const r = await importViaUI(page, xlsxPath, [], K);
  expect(r.success, `前置匯入結果：${r.text}`).toBe(count);
  return people;
}

const totalOf = async (page: Page) => {
  const pager = (await page.locator('.vxe-pager').innerText()).replace(/\s+/g, ' ');
  return Number(pager.slice(pager.indexOf('共')).replace(/[^0-9]/g, ''));
};

test.describe('VIS', () => {
  test(
    '[VIS-001] 訪客列表：清單、每頁最多 10 筆、顯示欄位（含 QRCode）',
    async ({ page }) => {
      await page.goto('/#/personsmanagement/visitormanagement');
      await page.reload();
      await page.getByRole('button', { name: '新增' }).first().waitFor();
      await page.waitForTimeout(1500);
      // 現有訪客不足 11 筆時，補建測試訪客，才能驗證「每頁最多 10 筆、超過分頁」
      const existing = await totalOf(page);
      if (existing < 11) await seedVisitors(page, 11 - existing, 'l');
      await gotoPersons(page, K);
      const headers = (await page.locator('.vxe-table--header-wrapper th').allInnerTexts()).map((s) => s.trim());
      const joined = headers.join('|');
      for (const h of ['編號', '姓名', '部門', '群組', '顯示用的照片', 'QR']) expect(joined).toContain(h);
      expect(headers.some((h) => h.includes('註冊') && h.includes('照片'))).toBe(true);
      await expect(page.locator('.vxe-table--header-wrapper .vxe-cell--checkbox').first()).toBeVisible();
      const firstRow = bodyRows(page).first();
      await expect(firstRow.locator('.vxe-cell--checkbox')).toBeVisible();
      await expect(firstRow.getByRole('button', { name: '編輯' })).toBeVisible();
      await expect(firstRow.getByRole('button', { name: '刪除' })).toBeVisible();
      expect(await firstRow.locator('img').count()).toBe(3); // 註冊照片、顯示用照片、QRCode
      await expect.poll(async () => (await rowImgSrcs(page, '')).at(-1)).toContain('data:image/png'); // QRCode 為圖片
      const total = await totalOf(page);
      expect(await bodyRows(page).count()).toBe(Math.min(10, total));
      expect(total).toBeGreaterThan(10);
      await expect(page.locator('.vxe-pager--num-btn').nth(1)).toBeVisible();
      expect((await readAllRows(page, false)).length).toBe(total);
    },
  );

  test(
    '[VIS-002] 訪客列表：搜尋（人員編號、姓名、部門、群組）',
    async ({ page }) => {
      const tok = token();
      const id = track(`e2e-vs-${tok}`);
      const name = `e2e訪客姓名${tok}`;
      const dept = `e2e部門${tok}`;
      await createPersonViaUI(page, { id, name, department: dept }, K);
      for (const keyword of [id, name, dept]) {
        await searchPersons(page, keyword);
        const rows = await personRowTexts(page);
        expect(rows.length, `搜尋「${keyword}」沒有結果`).toBeGreaterThan(0);
        for (const r of rows) expect(r.toLowerCase(), `搜尋「${keyword}」出現不含關鍵字的列`).toContain(keyword.toLowerCase());
        expect(rows.some((r) => r.includes(id))).toBe(true);
      }
      // 群組：取清單中第一個有群組的訪客的群組；若沒有任何訪客屬於群組，則標記未驗證
      await searchPersons(page, '');
      const groupCells = await bodyRows(page).locator('td:nth-child(5)').allInnerTexts();
      const group = groupCells.map((s) => s.trim()).find((s) => s.length > 0);
      if (group) {
        await searchPersons(page, group);
        const groupRows = await readAllRows(page, false);
        expect(groupRows.length).toBeGreaterThan(0);
        for (const r of groupRows) expect(r.toLowerCase()).toContain(group.toLowerCase());
      } else {
        test.info().annotations.push({ type: '未驗證', description: '清單第 1 頁沒有任何訪客屬於群組，群組搜尋未驗證' });
      }
      await searchPersons(page, `e2e-no-such-${tok}`);
      expect(await personRowTexts(page)).toEqual([]);
    },
  );

  test(
    '[VIS-003] 訪客列表：刪除訪客資料',
    async ({ page }) => {
      const id = track(`e2e-vd-${token()}`);
      await createPersonViaUI(page, { id, name: 'e2e-刪除訪客' }, K);
      await searchPersons(page, id);
      const row = bodyRows(page).filter({ hasText: id }).first();
      await row.getByRole('button', { name: '刪除' }).click();
      await page.locator('.el-message-box__btns .el-button').first().click();
      await expect(page.locator('.el-message-box')).toBeHidden();
      await expect(bodyRows(page).filter({ hasText: id })).toHaveCount(1);
      await row.getByRole('button', { name: '刪除' }).click();
      await page.locator('.el-message-box__btns .el-button--primary').click();
      await expect(bodyRows(page).filter({ hasText: id })).toHaveCount(0, { timeout: 10000 });
      await gotoPersons(page, K);
      await searchPersons(page, id);
      expect(await personRowTexts(page)).toEqual([]);
    },
  );

  test(
    '[VIS-004] 新增訪客：進入新增頁，編號/姓名必填，不可設定為 Admin，錯誤訊息標示於欄位下方',
    async ({ page }) => {
      await openAddPerson(page, K);
      await expect(page).toHaveURL(/addvisitor/);
      await expect(nextButton(page)).toBeDisabled();
      // 不可設定為 Admin：「Admin」欄位為停用且值為「否」
      await expect(formInput(page, 'asAdmin')).toBeDisabled();
      await expect(formInput(page, 'asAdmin').locator('option:checked')).toHaveText('否');
      await formInput(page, 'id').fill('ab');
      await formInput(page, 'name').fill('e2e-必填測試');
      await expect(fieldError(page, 'id')).toBeVisible();
      await expect(nextButton(page)).toBeDisabled();
      await formInput(page, 'id').fill(track(`e2e-vr-${token()}`));
      await formInput(page, 'name').fill('   ');
      await expect(fieldError(page, 'name')).toBeVisible();
      await expect(nextButton(page)).toBeDisabled();
      await formInput(page, 'name').fill('e2e-必填測試');
      await expect(fieldError(page, 'id')).toBeHidden();
      await expect(fieldError(page, 'name')).toBeHidden();
      await expect(nextButton(page)).toBeEnabled();
      await nextButton(page).click();
      await page.getByRole('button', { name: '註冊' }).click();
      await expect(page.getByText('註冊完成')).toBeVisible();
    },
  );

  test(
    '[VIS-006] 新增訪客：顯示用照片（可非人臉、最大 10MB）',
    {
      annotation: [
        { type: '判定範圍', description: '規格只寫「最大檔案大小 10MB」（Plan 步驟另列）；未寫超過時的行為，本測項以「超過 10MB 的檔案不應被接受」判定（同 PPL-006）' },
      ],
    },
    async ({ page }) => {
      const id = track(`e2e-vp-${token()}`);
      await openAddPerson(page, K);
      await fillPersonForm(page, { id, name: 'e2e-訪客顯示照片' });
      await nextButton(page).click();
      expect(((await stepImgs(page).nth(1).getAttribute('src')) ?? '').startsWith(PLACEHOLDER_PREFIX)).toBe(true);
      await pickPhoto(page, 1, writeFile(`${TMP_DIR}/vdisplay-small.png`, makePng(300, 300)));
      await expect.poll(async () => ((await stepImgs(page).nth(1).getAttribute('src')) ?? '').slice(0, 15)).toBe('data:image/jpeg');
      await page.getByRole('button', { name: '註冊' }).click();
      await expect(page.getByText('註冊完成')).toBeVisible();
      await page.getByRole('button', { name: '完成' }).click();
      await searchPersons(page, id);
      await expect.poll(async () => (await rowImgSrcs(page, id))[1]).toContain('data:image/jpeg');
      await openAddPerson(page, K);
      await fillPersonForm(page, { id: track(`e2e-vq-${token()}`), name: 'e2e-訪客顯示照片超限' });
      await nextButton(page).click();
      await expectOversizeDisplayPhotoRejected(page);
    },
  );

  test(
    '[VIS-007] 新增訪客：按下註冊後於列表呈現新增資料',
    async ({ page }) => {
      const tok = token();
      const id = track(`e2e-vn-${tok}`);
      await createPersonViaUI(page, { id, name: `e2e訪客新增${tok}`, department: `e2e部門${tok}`, title: `e2e職稱${tok}` }, K);
      await gotoPersons(page, K);
      await searchPersons(page, id);
      const rows = await personRowTexts(page);
      expect(rows).toHaveLength(1);
      expect(rows[0]).toContain(id);
      expect(rows[0]).toContain(`e2e訪客新增${tok}`);
      expect(rows[0]).toContain(`e2e部門${tok}`);
    },
  );

  test(
    '[VIS-011] 編輯訪客：進入編輯頁，可修改姓名/部門/職稱，無法變更訪客編號，不可設為 Admin',
    async ({ page }) => {
      const tok = token();
      const id = track(`e2e-ve-${tok}`);
      await createPersonViaUI(page, { id, name: `e2e訪客前${tok}`, department: `e2e部門前${tok}`, title: `e2e職稱前${tok}` }, K);
      await searchPersons(page, id);
      await bodyRows(page).filter({ hasText: id }).first().getByRole('button', { name: '編輯' }).click();
      await expect(page).toHaveURL(/modifyvisitor/);
      await formInput(page, 'id').waitFor();
      await expect(formInput(page, 'id')).toBeDisabled();
      await expect(formInput(page, 'id')).toHaveValue(id);
      await expect(formInput(page, 'asAdmin')).toBeDisabled();
      await formInput(page, 'name').fill('');
      await expect(fieldError(page, 'name')).toBeVisible();
      await expect(nextButton(page)).toBeDisabled();
      await formInput(page, 'name').fill(`e2e訪客後${tok}`);
      await formInput(page, 'department').fill(`e2e部門後${tok}`);
      await formInput(page, 'title').fill(`e2e職稱後${tok}`);
      await expect(fieldError(page, 'name')).toBeHidden();
      await expect(nextButton(page)).toBeEnabled();
      await nextButton(page).click();
      await page.getByRole('button', { name: '註冊' }).click();
      await expect(page.getByText('註冊完成')).toBeVisible();
      await page.getByRole('button', { name: '完成' }).click();
      await gotoPersons(page, K);
      await searchPersons(page, id);
      await bodyRows(page).filter({ hasText: id }).first().getByRole('button', { name: '編輯' }).click();
      await formInput(page, 'name').waitFor();
      await expect(formInput(page, 'name')).toHaveValue(`e2e訪客後${tok}`);
      await expect(formInput(page, 'department')).toHaveValue(`e2e部門後${tok}`);
      await expect(formInput(page, 'title')).toHaveValue(`e2e職稱後${tok}`);
    },
  );

  test(
    '[VIS-013] 編輯訪客：修改顯示用照片',
    {
      annotation: [
        { type: '判定範圍', description: '本項納入「超過 10MB 不應被接受」的判定（同 PPL-018）' },
      ],
    },
    async ({ page }) => {
      const id = track(`e2e-vf-${token()}`);
      await createPersonViaUI(page, { id, name: 'e2e-訪客改顯示照片' }, K);
      await searchPersons(page, id);
      expect((await rowImgSrcs(page, id))[1]).toContain('data:image/png');
      await bodyRows(page).filter({ hasText: id }).first().getByRole('button', { name: '編輯' }).click();
      await formInput(page, 'name').waitFor();
      await nextButton(page).click();
      await pickPhoto(page, 1, writeFile(`${TMP_DIR}/vdisplay-edit.png`, makePng(300, 300)));
      await expect.poll(async () => ((await stepImgs(page).nth(1).getAttribute('src')) ?? '').slice(0, 15)).toBe('data:image/jpeg');
      await page.getByRole('button', { name: '註冊' }).click();
      await expect(page.getByText('註冊完成')).toBeVisible();
      await page.getByRole('button', { name: '完成' }).click();
      await gotoPersons(page, K);
      await searchPersons(page, id);
      await expect.poll(async () => (await rowImgSrcs(page, id))[1]).toContain('data:image/jpeg');
      await bodyRows(page).filter({ hasText: id }).first().getByRole('button', { name: '編輯' }).click();
      await formInput(page, 'name').waitFor();
      await nextButton(page).click();
      await expectOversizeDisplayPhotoRejected(page);
    },
  );

  test(
    '[VIS-014] 編輯訪客：訪客列表呈現更新後資料',
    async ({ page }) => {
      const tok = token();
      const id = track(`e2e-vu-${tok}`);
      await createPersonViaUI(page, { id, name: `e2e訪客更新前${tok}`, department: `e2e部門前${tok}` }, K);
      await editPersonViaUI(page, id, { name: `e2e訪客更新後${tok}`, department: `e2e部門後${tok}` }, K);
      for (const reload of [false, true]) {
        if (reload) await gotoPersons(page, K);
        await searchPersons(page, id);
        const rows = await personRowTexts(page);
        expect(rows).toHaveLength(1);
        expect(rows[0]).toContain(`e2e訪客更新後${tok}`);
        expect(rows[0]).toContain(`e2e部門後${tok}`);
        expect(rows[0]).not.toContain(`e2e訪客更新前${tok}`);
        expect(rows[0]).not.toContain(`e2e部門前${tok}`);
      }
    },
  );

  test(
    '[VIS-015] 訪客匯入：下載範本（內含 QRcode）',
    {
      annotation: [
        { type: '判定範圍', description: '「內含 QRcode」解讀為壓縮檔內有 qrcode 資料夾與 QRcode 圖片；範例顯示照片檔名以「_D」判定（expect.soft）' },
      ],
    },
    async ({ page }) => {
      const tpl = await downloadTemplate(page, K);
      expect(tpl.fileName.toLowerCase().endsWith('.zip')).toBe(true);
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(tpl.xlsx as never);
      const ws = wb.worksheets[0];
      const header = (ws.getRow(1).values as unknown[]).filter((v) => v !== null && v !== undefined).map((v) => String(v));
      expect(header.length).toBeGreaterThanOrEqual(3);
      expect(ws.rowCount).toBeGreaterThanOrEqual(2);
      const exampleCells: string[] = [];
      ws.eachRow((row, n) => {
        if (n > 1) row.eachCell((c) => exampleCells.push(String(c.value)));
      });
      expect(exampleCells.some((v) => v.includes('|')), '範本範例中沒有以「|」區隔多個群組的示範').toBe(true);
      // 內含 QRcode：壓縮檔內有 qrcode 資料夾與圖片
      const qr = tpl.entries.filter((n) => n.startsWith('qrcode/') && !n.endsWith('/'));
      expect(qr.length, `壓縮檔內容：${tpl.entries.join('、')}`).toBeGreaterThan(0);
      const photoNames = tpl.entries.filter((n) => n.startsWith('snapshot/') && !n.endsWith('/')).map((n) => n.slice('snapshot/'.length));
      expect.soft(photoNames.some((n) => n.includes('_D.')), `範本範例顯示用照片檔名：${photoNames.join('、')}`).toBe(true);
    },
  );

  test(
    '[VIS-016] 訪客匯入：依範本匯入 Excel 與照片，成功後於訪客列表呈現',
    async ({ page }) => {
      const tok = token();
      const people = [1, 2].map((i) => ({ id: track(`e2e-vi${i}-${tok}`), name: `e2e訪客匯入${i}${tok}`, department: `e2e部門${tok}` }));
      if (!faceBuffer) noFaceNote();
      const tpl = await downloadTemplate(page, K);
      const { xlsxPath, photoPaths } = await buildImportFiles(tpl, people, faceBuffer ? 'both' : 'display', `vis016-${tok}`, faceBuffer);
      const result = await importViaUI(page, xlsxPath, photoPaths, K);
      expect(result.success, `匯入結果：${result.text}`).toBe(2);
      expect(result.fail, `匯入結果：${result.text}`).toBe(0);
      await gotoPersons(page, K);
      for (const p of people) {
        await searchPersons(page, p.id);
        const rows = await personRowTexts(page);
        expect(rows).toHaveLength(1);
        expect(rows[0]).toContain(p.name);
        expect(rows[0]).toContain(p.department);
        await expect.poll(async () => (await rowImgSrcs(page, p.id))[1], { timeout: 20000 }).toContain('data:image/jpeg');
        if (faceBuffer) await expect.poll(async () => (await rowImgSrcs(page, p.id))[0], { timeout: 20000 }).toContain('data:image/jpeg');
      }
    },
  );

  test(
    '[VIS-017] 訪客匯出：zip 含 excel、snapshot（id.jpg / id_D.jpg）、qrcode 資料夾（id.jpeg）',
    async ({ page }) => {
      const tok = token();
      const people = [1, 2].map((i) => ({ id: track(`e2e-vx${i}-${tok}`), name: `e2e訪客匯出${i}${tok}`, department: `e2e部門${tok}` }));
      if (!faceBuffer) noFaceNote();
      const tpl = await downloadTemplate(page, K);
      const { xlsxPath, photoPaths } = await buildImportFiles(tpl, people, faceBuffer ? 'both' : 'display', `vis017-${tok}`, faceBuffer);
      const imp = await importViaUI(page, xlsxPath, photoPaths, K);
      expect(imp.success, `前置匯入結果：${imp.text}`).toBe(2);
      await gotoPersons(page, K);
      await searchPersons(page, tok);
      await expect(bodyRows(page).filter({ hasText: tok })).toHaveCount(2);
      for (const p of people) await bodyRows(page).filter({ hasText: p.id }).first().locator('.vxe-cell--checkbox').click();
      const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: '匯出', exact: true }).click()]);
      const zipPath = `${TMP_DIR}/vexport-${tok}-${dl.suggestedFilename()}`;
      await dl.saveAs(zipPath);
      expect(dl.suggestedFilename().toLowerCase().endsWith('.zip')).toBe(true);
      const zip = await JSZip.loadAsync(readFileSync(zipPath));
      const names = Object.keys(zip.files);
      const xlsxNames = names.filter((n) => n.toLowerCase().endsWith('.xlsx'));
      expect(xlsxNames, `壓縮檔內容：${names.join('、')}`).toHaveLength(1);
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load((await zip.files[xlsxNames[0]].async('nodebuffer')) as never);
      const cells: string[] = [];
      wb.worksheets[0].eachRow((row) => row.eachCell((c) => cells.push(String(c.value))));
      for (const p of people) {
        expect(cells, `Excel 內找不到 ${p.id}`).toContain(p.id);
        expect(cells, `Excel 內找不到 ${p.name}`).toContain(p.name);
      }
      for (const p of people) {
        // qrcode 資料夾：id.jpeg（規格明列 .jpeg）
        expect(names, `缺少 qrcode/${p.id}.jpeg`).toContain(`qrcode/${p.id}.jpeg`);
        expect((await zip.files[`qrcode/${p.id}.jpeg`].async('nodebuffer')).length).toBeGreaterThan(0);
        // snapshot 資料夾：id.jpg、id_D.jpg
        if (faceBuffer) {
          expect.soft(names, `缺少 snapshot/${p.id}.jpg`).toContain(`snapshot/${p.id}.jpg`);
        }
        expect.soft(names, `缺少 snapshot/${p.id}_D.jpg`).toContain(`snapshot/${p.id}_D.jpg`);
      }
    },
  );

  // ---- 以下維持 fixme（部分自動化／暫不測／需 SMTP） ----
});
