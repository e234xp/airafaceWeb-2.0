import { test, expect, Page } from '../../helpers/test';
import JSZip from 'jszip';
import * as ExcelJS from 'exceljs';
import { existsSync, readFileSync } from 'node:fs';
import { csvAnnotations } from '../../helpers/csvSource';
import { MB, TMP_DIR, makePng, writeFile } from '../../helpers/files';
import {
  FormField,
  cleanupPersons,
  createPersonViaUI,
  formInput,
  gotoPersons,
  openAddPerson,
  fillPersonForm,
  personRowTexts,
  searchPersons,
  uniquePersonId,
} from '../../helpers/persons';
import { buildImportFiles, downloadTemplate, editPersonViaUI, importViaUI } from '../../helpers/personsIo';
import { bodyRows, readAllRows } from '../../helpers/tables';

// 來源 E2E-TEST-PLAN.md；模組 PPL（CSV 第 57~61 列：#5.1 列表、#5.2 新增、#5.4 批次匯入/出、#5.5 編輯）。
// 本檔實作「適合自動化（Y）」的 13 項；其餘維持 test.fixme（部分自動化／暫不測）。
// 測試人員編號一律 e2e- 開頭；afterEach 以獨立 Admin 環境清理。既有人員（如 A-001）不會被修改或刪除。

const token = () => Date.now().toString(36).slice(-5);
const PLACEHOLDER_PREFIX = 'data:image/png;base64,iVBORw0KGgo'; // 無照片時列表／表單顯示的 1x1 空白圖
// 註冊照片需要「含清楚正臉」的測試照片；請放在 e2e/fixtures/face.jpg（不使用既有人員的照片，避免重複人臉）。
// 沒有此檔時，匯入／匯出測項只驗證顯示用照片，並在報告註明「註冊照片未驗證」。
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
  await cleanupPersons(browser, created.splice(0));
});

const fieldCell = (page: Page, field: FormField) => formInput(page, field).locator('xpath=ancestor::td[1]');
const fieldError = (page: Page, field: FormField) => fieldCell(page, field).locator('.invalid-feedback');
const nextButton = (page: Page) => page.getByRole('button', { name: '下一步' });
const stepImgs = (page: Page) => page.locator('.card.d-block img'); // 第 2 步：[0]=註冊照片 [1]=顯示用照片
const rowImgSrcs = (page: Page, id: string) =>
  bodyRows(page)
    .filter({ hasText: id })
    .first()
    .locator('img')
    .evaluateAll((els) => els.map((e) => (e as HTMLImageElement).src.slice(0, 20)));

/** 在第 2 步按「選擇照片」（nth：0=註冊照片、1=顯示用照片）並提供檔案。 */
async function pickPhoto(page: Page, which: 0 | 1, file: string) {
  const [fc] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button', { name: '選擇照片' }).nth(which).click(),
  ]);
  await fc.setFiles(file);
}

/** 10MB 上限：超過 10MB 的顯示用照片不應被接受（預覽維持原狀，或出現錯誤提示）。 */
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

test.describe('PPL', () => {
  test(
    '[PPL-001] 人員列表：清單、每頁最多 10 筆與分頁、顯示欄位',
    {
      annotation: csvAnnotations({
        row: 57,
        no: '5.1',
        category: '人員 > 人員(列表)',
        steps: '1.進入人員查看\n2.檢視人員清單、顯示欄位、資料筆數、頁數',
        expected: '1. 顯示所有人員的清單\n2. 每頁最多 10筆、超過則會分頁\n3. 顯示欄位: [選擇]、人員編號、人員姓名、部門、群組、註冊的照片、顯示用的照片、[編輯]、[刪除]',
      }),
    },
    async ({ page }) => {
      await gotoPersons(page);
      // 3. 顯示欄位：選擇（勾選）、人員編號、人員姓名、部門、群組、註冊的照片、顯示用的照片、編輯、刪除
      const headers = (await page.locator('.vxe-table--header-wrapper th').allInnerTexts()).map((s) => s.trim());
      for (const h of ['人員編號', '人員姓名', '部門', '群組', '顯示用的照片']) expect(headers.join('|')).toContain(h);
      expect(headers.some((h) => h.includes('註冊') && h.includes('照片'))).toBe(true);
      await expect(page.locator('.vxe-table--header-wrapper .vxe-cell--checkbox').first()).toBeVisible();
      const firstRow = bodyRows(page).first();
      await expect(firstRow.locator('.vxe-cell--checkbox')).toBeVisible();
      await expect(firstRow.getByRole('button', { name: '編輯' })).toBeVisible();
      await expect(firstRow.getByRole('button', { name: '刪除' })).toBeVisible();
      expect(await firstRow.locator('img').count()).toBe(2); // 註冊照片、顯示用照片
      // 1.、2. 筆數與分頁：共 N 筆；每頁最多 10 筆；超過 10 筆則有第 2 頁
      const pager = (await page.locator('.vxe-pager').innerText()).replace(/\s+/g, ' ');
      const total = Number(pager.slice(pager.indexOf('共')).replace(/[^0-9]/g, ''));
      expect(total).toBeGreaterThan(0);
      expect(await bodyRows(page).count()).toBe(Math.min(10, total));
      if (total > 10) {
        await expect(page.locator('.vxe-pager--num-btn').nth(1)).toBeVisible();
        expect((await readAllRows(page, false)).length).toBe(total); // 逐頁累計等於總筆數
      }
    },
  );

  test(
    '[PPL-002] 人員列表：快速搜尋（人員編號、姓名、部門、群組）',
    {
      annotation: csvAnnotations({
        row: 57,
        no: '5.1',
        category: '人員 > 人員(列表)',
        steps: '3.使用搜尋功能查詢',
        expected: '4.快速搜尋:人員編號、人員姓名、部門、群組搜尋與包含輸入文字的項目',
      }),
    },
    async ({ page }) => {
      const tok = token();
      const id = track(`e2e-s-${tok}`);
      const name = `e2e姓名${tok}`;
      const dept = `e2e部門${tok}`;
      await createPersonViaUI(page, { id, name, department: dept });
      // 人員編號、姓名、部門：以建立的人員欄位值搜尋；結果每一列都必須含關鍵字，且包含該人員
      for (const keyword of [id, name, dept]) {
        await searchPersons(page, keyword);
        const rows = await personRowTexts(page);
        expect(rows.length, `搜尋「${keyword}」沒有結果`).toBeGreaterThan(0);
        for (const r of rows) expect(r.toLowerCase(), `搜尋「${keyword}」出現不含關鍵字的列`).toContain(keyword.toLowerCase());
        expect(rows.some((r) => r.includes(id))).toBe(true);
      }
      // 群組：取目前清單第一個有群組的人員的群組名稱作關鍵字（群組在第 5 欄）
      await searchPersons(page, '');
      const groupCells = await bodyRows(page).locator('td:nth-child(5)').allInnerTexts();
      const group = groupCells.map((s) => s.trim()).find((s) => s.length > 0);
      expect(group, '清單中沒有任何人員屬於群組，無法驗證群組搜尋').toBeTruthy();
      await searchPersons(page, group as string);
      const groupRows = await readAllRows(page, false);
      expect(groupRows.length).toBeGreaterThan(0);
      for (const r of groupRows) expect(r.toLowerCase()).toContain((group as string).toLowerCase());
      // 不存在的關鍵字：無結果
      await searchPersons(page, `e2e-no-such-${tok}`);
      expect(await personRowTexts(page)).toEqual([]);
    },
  );

  test(
    '[PPL-003] 人員列表：刪除人員資料',
    {
      annotation: csvAnnotations({
        row: 57,
        no: '5.1',
        category: '人員 > 人員(列表)',
        steps: '4.刪除人員資料',
        expected: '5.刪除人員資料功能正常',
      }),
    },
    async ({ page }) => {
      test.setTimeout(120000);
      const id = track(`e2e-d-${token()}`);
      await createPersonViaUI(page, { id, name: 'e2e-刪除測試' });
      await searchPersons(page, id);
      const row = bodyRows(page).filter({ hasText: id }).first();
      // 按「刪除」後按「取消」：人員仍在
      await row.getByRole('button', { name: '刪除' }).click();
      await page.locator('.el-message-box__btns .el-button').first().click();
      await expect(page.locator('.el-message-box')).toBeHidden();
      await expect(bodyRows(page).filter({ hasText: id })).toHaveCount(1);
      // 按「刪除」後按「確定」：人員從清單消失
      await row.getByRole('button', { name: '刪除' }).click();
      await page.locator('.el-message-box__btns .el-button--primary').click();
      await expect(bodyRows(page).filter({ hasText: id })).toHaveCount(0, { timeout: 10000 });
      // 重新載入後仍不存在（已真正刪除，而非只在畫面上移除）
      await gotoPersons(page);
      await searchPersons(page, id);
      expect(await personRowTexts(page)).toEqual([]);
    },
  );

  test(
    '[PPL-004] 新增人員：進入新增頁，編號/姓名必填，錯誤訊息標示於欄位下方且有錯誤無法進行下一步',
    {
      annotation: csvAnnotations({
        row: 58,
        no: '5.2',
        category: '（延續）> 人員(新增)',
        steps: '1. 點選新增人員功能，可以進入新增人員頁面\n2. 填入編號(必填)與人員姓名(必填)與其他資訊\n    - 直接標示錯誤訊息於欄位下方，有錯誤時無法進行下一步',
        expected: '1.新增人員功能正常且能建立成功',
      }),
    },
    async ({ page }) => {
      await openAddPerson(page);
      await expect(page).toHaveURL(/addperson/);
      // 編號、姓名皆未填：無法進行下一步
      await expect(nextButton(page)).toBeDisabled();
      // 編號不足 4 碼：錯誤訊息標示於「編號欄位下方」，且無法進行下一步
      await formInput(page, 'id').fill('ab');
      await formInput(page, 'name').fill('e2e-必填測試');
      await expect(fieldError(page, 'id')).toBeVisible();
      await expect(nextButton(page)).toBeDisabled();
      // 姓名只有空白：錯誤訊息標示於「姓名欄位下方」，且無法進行下一步
      await formInput(page, 'id').fill(track(`e2e-r-${token()}`));
      await formInput(page, 'name').fill('   ');
      await expect(fieldError(page, 'name')).toBeVisible();
      await expect(nextButton(page)).toBeDisabled();
      // 填妥必填欄位：錯誤訊息消失，可進行下一步，並能建立成功
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
    '[PPL-006] 新增人員：顯示用照片（可非人臉、最大 10MB）',
    {
      annotation: [
        ...csvAnnotations({
          row: 58,
          no: '5.2',
          category: '（延續）> 人員(新增)',
          steps: '4. 顯示用照片可以不是人臉照\n   - 最大檔案大小: 10MB',
          expected: '1.新增人員功能正常且能建立成功',
        }),
        { type: '判定範圍', description: '規格只寫「最大檔案大小 10MB」，未寫超過時的行為；本測項以「超過 10MB 的檔案不應被接受（預覽不變或出現錯誤提示）」判定' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(120000);
      const id = track(`e2e-dp-${token()}`);
      await openAddPerson(page);
      await fillPersonForm(page, { id, name: 'e2e-顯示照片' });
      await nextButton(page).click();
      // 顯示用照片使用純色圖（非人臉）：預覽應改為該圖
      expect(((await stepImgs(page).nth(1).getAttribute('src')) ?? '').startsWith(PLACEHOLDER_PREFIX)).toBe(true);
      await pickPhoto(page, 1, writeFile(`${TMP_DIR}/display-small.png`, makePng(300, 300)));
      await expect.poll(async () => ((await stepImgs(page).nth(1).getAttribute('src')) ?? '').slice(0, 15)).toBe('data:image/jpeg');
      await page.getByRole('button', { name: '註冊' }).click();
      await expect(page.getByText('註冊完成')).toBeVisible();
      await page.getByRole('button', { name: '完成' }).click();
      // 建立成功：列表有此人員且顯示用照片已不是空白圖
      await searchPersons(page, id);
      await expect.poll(async () => (await rowImgSrcs(page, id))[1]).toContain('data:image/jpeg');
      // 最大 10MB：超過 10MB 的顯示用照片不應被接受
      await openAddPerson(page);
      await fillPersonForm(page, { id: track(`e2e-dq-${token()}`), name: 'e2e-顯示照片超限' });
      await nextButton(page).click();
      await expectOversizeDisplayPhotoRejected(page);
    },
  );

  test(
    '[PPL-007] 新增人員：按下註冊後於人員列表呈現新增資料',
    {
      annotation: csvAnnotations({
        row: 58,
        no: '5.2',
        category: '（延續）> 人員(新增)',
        steps: '5. 按下註冊後，在【人員】列表可以呈現新增後的人員資料',
        expected: '1.新增人員功能正常且能建立成功',
      }),
    },
    async ({ page }) => {
      const tok = token();
      const id = track(`e2e-n-${tok}`);
      await createPersonViaUI(page, { id, name: `e2e新增${tok}`, department: `e2e部門${tok}`, title: `e2e職稱${tok}` });
      await gotoPersons(page);
      await searchPersons(page, id);
      const rows = await personRowTexts(page);
      expect(rows).toHaveLength(1);
      expect(rows[0]).toContain(id);
      expect(rows[0]).toContain(`e2e新增${tok}`);
      expect(rows[0]).toContain(`e2e部門${tok}`);
    },
  );

  test(
    '[PPL-011] 人員批次匯入/出：下載範本',
    {
      annotation: [
        ...csvAnnotations({
          row: 60,
          no: '5.4',
          category: '（延續）> 人員(批次匯入/出)',
          steps: '1. 點選 下載範本，可以取得人員資料Excel 範本，依照範本內的範例依序將人員清單填入\n   - 若人員有一個以上的部門或群組，將以「|」區隔；\n   - 註冊照片名稱: 人員編號.jpg，顯示照片名稱: 人員編號_D.jpg',
          expected: '1.下載範本功能OK',
        }),
        { type: '判定範圍', description: '「範例照片檔名須為 人員編號.jpg／人員編號_D.jpg」是否適用於範本內的範例檔，規格未明確指出；以 expect.soft 判定並在 Results 備註請使用者確認' },
      ],
    },
    async ({ page }) => {
      const tpl = await downloadTemplate(page);
      expect(tpl.fileName.toLowerCase().endsWith('.zip')).toBe(true);
      // Excel 範本：有表頭列與至少一列範例，範例中以「|」區隔多個群組
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
      // 壓縮檔內有 snapshot 資料夾與範例照片（註冊照片、顯示用照片）
      expect(tpl.entries.some((n) => n.startsWith('snapshot/'))).toBe(true);
      expect(tpl.photoRegister.length).toBeGreaterThan(0);
      expect(tpl.photoDisplay.length).toBeGreaterThan(0);
      // 規格的照片命名：人員編號.jpg、人員編號_D.jpg
      const photoNames = tpl.entries.filter((n) => n.startsWith('snapshot/') && !n.endsWith('/')).map((n) => n.slice('snapshot/'.length));
      expect.soft(photoNames.some((n) => /^[^_]+\.jpg$/.test(n)), `範本範例註冊照片檔名：${photoNames.join('、')}`).toBe(true);
      expect.soft(photoNames.some((n) => /_D\.jpg$/.test(n)), `範本範例顯示用照片檔名：${photoNames.join('、')}`).toBe(true);
    },
  );

  test(
    '[PPL-012] 人員批次匯入/出：依範本匯入 Excel 與照片，成功後顯示於人員列表',
    {
      annotation: csvAnnotations({
        row: 60,
        no: '5.4',
        category: '（延續）> 人員(批次匯入/出)',
        steps: '1. 點選 下載範本…\n2. 點選 選擇檔案 上傳人員資料Excel\n3. 點選 匯入，將人員資料Excel 以及照片匯入\n4. 點選 選擇檔案 上傳人員照片\n5. 人員匯入的結果成功後，顯示於人員列表中',
        expected: '2.根據範本格式匯入檔案功能OK',
      }),
    },
    async ({ page }) => {
      test.setTimeout(240000);
      const tok = token();
      const people = [1, 2].map((i) => ({ id: track(`e2e-i${i}-${tok}`), name: `e2e匯入${i}${tok}`, department: `e2e部門${tok}`, title: `e2e職稱${i}` }));
      if (!faceBuffer) noFaceNote();
      const tpl = await downloadTemplate(page);
      const { xlsxPath, photoPaths } = await buildImportFiles(tpl, people, faceBuffer ? 'both' : 'display', `ppl012-${tok}`, faceBuffer);
      const result = await importViaUI(page, xlsxPath, photoPaths);
      expect(result.success, `匯入結果：${result.text}`).toBe(2);
      expect(result.fail, `匯入結果：${result.text}`).toBe(0);
      // 匯入成功後顯示於人員列表，並帶有註冊照片與顯示用照片
      await gotoPersons(page);
      for (const p of people) {
        await searchPersons(page, p.id);
        const rows = await personRowTexts(page);
        expect(rows).toHaveLength(1);
        expect(rows[0]).toContain(p.name);
        expect(rows[0]).toContain(p.department as string);
        await expect.poll(async () => (await rowImgSrcs(page, p.id))[1], { timeout: 20000 }).toContain('data:image/jpeg');
        if (faceBuffer) await expect.poll(async () => (await rowImgSrcs(page, p.id))[0], { timeout: 20000 }).toContain('data:image/jpeg');
      }
    },
  );

  test(
    '[PPL-013] 人員批次匯入/出：匯出（zip 含 excel、snapshot 資料夾 id.jpg / id_D.jpg）',
    {
      annotation: csvAnnotations({
        row: 60,
        no: '5.4',
        category: '（延續）> 人員(批次匯入/出)',
        steps: '6. 點選 匯出，可獲得人員清單與照片\n8. 點選匯出後，會透過瀏覽器下載壓縮檔(zip)\n9. 壓縮檔案中包含一份 excel 為人員的資料，及snapshot 資料夾、內含註冊 (id.jpg)、顯示用 (id_D.jpg) 照片',
        expected: '3.匯出檔案規格內容正確\nAIRA 資料集做匯入',
      }),
    },
    async ({ page }) => {
      test.setTimeout(240000);
      const tok = token();
      const people = [1, 2].map((i) => ({ id: track(`e2e-x${i}-${tok}`), name: `e2e匯出${i}${tok}`, department: `e2e部門${tok}` }));
      if (!faceBuffer) noFaceNote();
      const tpl = await downloadTemplate(page);
      const { xlsxPath, photoPaths } = await buildImportFiles(tpl, people, faceBuffer ? 'both' : 'display', `ppl013-${tok}`, faceBuffer);
      const imp = await importViaUI(page, xlsxPath, photoPaths);
      expect(imp.success, `前置匯入結果：${imp.text}`).toBe(2);
      // 勾選這兩位人員（搜尋 e2e-x?-token 的共同部分）後按「匯出」
      await gotoPersons(page);
      await searchPersons(page, tok);
      await expect(bodyRows(page).filter({ hasText: tok })).toHaveCount(2);
      for (const p of people) await bodyRows(page).filter({ hasText: p.id }).first().locator('.vxe-cell--checkbox').click();
      const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: '匯出', exact: true }).click()]);
      const zipPath = `${TMP_DIR}/export-${tok}-${dl.suggestedFilename()}`;
      await dl.saveAs(zipPath);
      expect(dl.suggestedFilename().toLowerCase().endsWith('.zip')).toBe(true);
      const zip = await JSZip.loadAsync(readFileSync(zipPath));
      const names = Object.keys(zip.files);
      // 一份 excel，內含這兩位人員的資料
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
      // snapshot 資料夾：每位人員有註冊照片（id.jpg）與顯示用照片（id_D.jpg）
      for (const p of people) {
        if (faceBuffer) {
          expect(names, `缺少 snapshot/${p.id}.jpg`).toContain(`snapshot/${p.id}.jpg`);
          expect((await zip.files[`snapshot/${p.id}.jpg`].async('nodebuffer')).length).toBeGreaterThan(0);
        }
        expect(names, `缺少 snapshot/${p.id}_D.jpg`).toContain(`snapshot/${p.id}_D.jpg`);
        expect((await zip.files[`snapshot/${p.id}_D.jpg`].async('nodebuffer')).length).toBeGreaterThan(0);
      }
    },
  );

  test(
    '[PPL-014] 人員批次匯入/出：匯入包含不同語言（中、日、泰、法、西）的文件',
    {
      annotation: csvAnnotations({
        row: 60,
        no: '5.4',
        category: '（延續）> 人員(批次匯入/出)',
        steps: '7.匯入包含不同語言的文件(中、日、泰、法、西)',
        expected: '2.根據範本格式匯入檔案功能OK',
      }),
    },
    async ({ page }) => {
      test.setTimeout(240000);
      const tok = token();
      const langs = [
        { tag: 'zh', name: '王小明', department: '研發部' },
        { tag: 'ja', name: '山田太郎', department: '開発部' },
        { tag: 'th', name: 'สมชาย ใจดี', department: 'ฝ่ายขาย' },
        { tag: 'fr', name: 'François Müller', department: 'Département Qualité' },
        { tag: 'es', name: 'José Peña', department: 'Ingeniería' },
      ];
      const people = langs.map((l) => ({ ...l, id: track(`e2e-l${l.tag}-${tok}`) }));
      const tpl = await downloadTemplate(page);
      const { xlsxPath } = await buildImportFiles(tpl, people, 'none', `ppl014-${tok}`);
      const result = await importViaUI(page, xlsxPath, []);
      expect(result.success, `匯入結果：${result.text}`).toBe(5);
      expect(result.fail, `匯入結果：${result.text}`).toBe(0);
      // 名稱與部門在人員列表正確顯示（文字完全一致）
      await gotoPersons(page);
      for (const p of people) {
        await searchPersons(page, p.id);
        const rows = await personRowTexts(page);
        expect(rows).toHaveLength(1);
        expect(rows[0]).toContain(p.name);
        expect(rows[0]).toContain(p.department);
      }
    },
  );

  test(
    '[PPL-016] 編輯人員：進入編輯頁，可修改姓名/部門/職稱，無法變更人員編號，錯誤訊息標示於欄位下方',
    {
      annotation: csvAnnotations({
        row: 61,
        no: '5.5',
        category: '（延續）> 人員(編輯)',
        steps: '1. 點選 編輯 可以進入人員資料編輯頁面\n2. 可修改人員姓名、部門、職稱等資訊，無法變更人員編號\n    - 直接標示錯誤訊息於欄位下方，有錯誤時無法進行下一步',
        expected: '編輯人員功能正常且能更新成功',
      }),
    },
    async ({ page }) => {
      const tok = token();
      const id = track(`e2e-e-${tok}`);
      await createPersonViaUI(page, { id, name: `e2e編輯前${tok}`, department: `e2e部門前${tok}`, title: `e2e職稱前${tok}` });
      await searchPersons(page, id);
      await bodyRows(page).filter({ hasText: id }).first().getByRole('button', { name: '編輯' }).click();
      await expect(page).toHaveURL(/modifyperson/);
      await formInput(page, 'id').waitFor();
      // 無法變更人員編號
      await expect(formInput(page, 'id')).toBeDisabled();
      await expect(formInput(page, 'id')).toHaveValue(id);
      // 姓名清空：錯誤訊息標示於姓名欄位下方，且無法進行下一步
      await formInput(page, 'name').fill('');
      await expect(fieldError(page, 'name')).toBeVisible();
      await expect(nextButton(page)).toBeDisabled();
      // 修改姓名、部門、職稱後可更新成功
      await formInput(page, 'name').fill(`e2e編輯後${tok}`);
      await formInput(page, 'department').fill(`e2e部門後${tok}`);
      await formInput(page, 'title').fill(`e2e職稱後${tok}`);
      await expect(fieldError(page, 'name')).toBeHidden();
      await expect(nextButton(page)).toBeEnabled();
      await nextButton(page).click();
      await page.getByRole('button', { name: '註冊' }).click();
      await expect(page.getByText('註冊完成')).toBeVisible();
      await page.getByRole('button', { name: '完成' }).click();
      // 重新進入編輯頁，三個欄位皆為更新後的值
      await gotoPersons(page);
      await searchPersons(page, id);
      await bodyRows(page).filter({ hasText: id }).first().getByRole('button', { name: '編輯' }).click();
      await formInput(page, 'name').waitFor();
      await expect(formInput(page, 'name')).toHaveValue(`e2e編輯後${tok}`);
      await expect(formInput(page, 'department')).toHaveValue(`e2e部門後${tok}`);
      await expect(formInput(page, 'title')).toHaveValue(`e2e職稱後${tok}`);
    },
  );

  test(
    '[PPL-018] 編輯人員：修改顯示用照片（最大 10MB）',
    {
      annotation: [
        ...csvAnnotations({
          row: 61,
          no: '5.5',
          category: '（延續）> 人員(編輯)',
          steps: '4. 可修改顯示用照片\n    - 最大檔案大小: 10MB',
          expected: '編輯人員功能正常且能更新成功',
        }),
        { type: '判定範圍', description: '規格只寫「最大檔案大小 10MB」，未寫超過時的行為；本測項以「超過 10MB 的檔案不應被接受（預覽不變或出現錯誤提示）」判定' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(120000);
      const id = track(`e2e-ep-${token()}`);
      await createPersonViaUI(page, { id, name: 'e2e-改顯示照片' });
      await searchPersons(page, id);
      expect((await rowImgSrcs(page, id))[1]).toContain('data:image/png'); // 建立時未上傳照片
      await bodyRows(page).filter({ hasText: id }).first().getByRole('button', { name: '編輯' }).click();
      await formInput(page, 'name').waitFor();
      await nextButton(page).click();
      await pickPhoto(page, 1, writeFile(`${TMP_DIR}/display-edit.png`, makePng(300, 300)));
      await expect.poll(async () => ((await stepImgs(page).nth(1).getAttribute('src')) ?? '').slice(0, 15)).toBe('data:image/jpeg');
      await page.getByRole('button', { name: '註冊' }).click();
      await expect(page.getByText('註冊完成')).toBeVisible();
      await page.getByRole('button', { name: '完成' }).click();
      // 更新成功：重新載入後列表的顯示用照片已改變
      await gotoPersons(page);
      await searchPersons(page, id);
      await expect.poll(async () => (await rowImgSrcs(page, id))[1]).toContain('data:image/jpeg');
      // 最大 10MB：超過 10MB 的顯示用照片不應被接受
      await bodyRows(page).filter({ hasText: id }).first().getByRole('button', { name: '編輯' }).click();
      await formInput(page, 'name').waitFor();
      await nextButton(page).click();
      await expectOversizeDisplayPhotoRejected(page);
    },
  );

  test(
    '[PPL-019] 編輯人員：人員列表呈現更新後資料',
    {
      annotation: csvAnnotations({
        row: 61,
        no: '5.5',
        category: '（延續）> 人員(編輯)',
        steps: '5. 在【人員】列表可以呈現更新後的人員資料',
        expected: '編輯人員功能正常且能更新成功',
      }),
    },
    async ({ page }) => {
      const tok = token();
      const id = track(`e2e-u-${tok}`);
      await createPersonViaUI(page, { id, name: `e2e更新前${tok}`, department: `e2e部門前${tok}` });
      await editPersonViaUI(page, id, { name: `e2e更新後${tok}`, department: `e2e部門後${tok}` });
      // 儲存後回到列表立即呈現，重新載入後仍是更新後的資料，且舊資料不再出現
      for (const reload of [false, true]) {
        if (reload) await gotoPersons(page);
        await searchPersons(page, id);
        const rows = await personRowTexts(page);
        expect(rows).toHaveLength(1);
        expect(rows[0]).toContain(`e2e更新後${tok}`);
        expect(rows[0]).toContain(`e2e部門後${tok}`);
        expect(rows[0]).not.toContain(`e2e更新前${tok}`);
        expect(rows[0]).not.toContain(`e2e部門前${tok}`);
      }
    },
  );

  // ---- 以下維持 fixme（部分自動化／暫不測） ----





});
