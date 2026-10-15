import { test, expect, Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { csvAnnotations } from '../../helpers/csvSource';
import { TMP_DIR, writeFile } from '../../helpers/files';
import { Kind, cleanupPersons, createPersonViaUI, fillPersonForm, gotoPersons, openAddPerson, searchPersons } from '../../helpers/persons';
import { bodyRows } from '../../helpers/tables';

// 來源 E2E-TEST-PLAN.md：PPL-005、PPL-017、VIS-005、VIS-012（註冊照片：選擇檔案；限制 10MB、最小臉 200x200、含清楚正臉）。
// 「拍攝照片」需要 webcam，無法自動化，列為未驗證。測試人員 e2e- 開頭，afterEach 以獨立 Admin 環境清理。
// 同一張人臉不能同時註冊給多人，因此每個測項一次只留一位帶人臉的測試人員。

const FACE = 'e2e/fixtures/face.jpg';
const token = () => Date.now().toString(36).slice(-5);
const created: Array<{ id: string; kind: Kind }> = [];
test.afterEach(async ({ browser }) => {
  const items = created.splice(0);
  for (const kind of ['person', 'visitor'] as Kind[]) await cleanupPersons(browser, items.filter((i) => i.kind === kind).map((i) => i.id), kind);
});

const nextButton = (page: Page) => page.getByRole('button', { name: '下一步' });
const stepImgs = (page: Page) => page.locator('.card.d-block img'); // [0]=註冊照片 [1]=顯示用照片
const regSrc = async (page: Page) => (await stepImgs(page).nth(0).getAttribute('src')) ?? '';

async function pickRegPhoto(page: Page, file: string) {
  const [fc] = await Promise.all([page.waitForEvent('filechooser'), page.getByRole('button', { name: '選擇照片' }).nth(0).click()]);
  await fc.setFiles(file);
}

/** 由 face.jpg 在頁面內以 canvas 產生變體：scale＝人臉縮放比例；noisy＝加雜訊讓檔案變大（用於 >10MB）。 */
async function makeVariant(page: Page, name: string, opts: { size: number; scale: number; noisy?: boolean; png?: boolean }) {
  const b64 = readFileSync(FACE).toString('base64');
  const dataUrl = await page.evaluate(
    async ({ b64: data, size, scale, noisy, png }) => {
      const img = new Image();
      img.src = `data:image/jpeg;base64,${data}`;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const g = c.getContext('2d') as CanvasRenderingContext2D;
      g.fillStyle = '#ffffff';
      g.fillRect(0, 0, size, size);
      if (noisy) {
        const id = g.getImageData(0, 0, size, size);
        for (let i = 0; i < id.data.length; i += 4) {
          id.data[i] = Math.random() * 255;
          id.data[i + 1] = Math.random() * 255;
          id.data[i + 2] = Math.random() * 255;
          id.data[i + 3] = 255;
        }
        g.putImageData(id, 0, 0);
      }
      const w = size * scale;
      g.drawImage(img, (size - w) / 2, (size - w) / 2, w, w);
      return c.toDataURL(png ? 'image/png' : 'image/jpeg', 0.95);
    },
    { b64, ...opts },
  );
  return writeFile(`${TMP_DIR}/${name}`, Buffer.from(dataUrl.split(',')[1], 'base64'));
}

/** 選擇註冊照片後判定是否被接受：預覽改變即接受；否則回報提示文字。 */
async function tryPick(page: Page, file: string) {
  const before = await regSrc(page);
  await pickRegPhoto(page, file);
  // 人臉偵測的耗時不固定：最多等 20 秒，預覽一改變就視為被接受；沒改變則再多等 3 秒確認沒有延遲更新
  await expect.poll(() => regSrc(page), { timeout: 20000 }).not.toBe(before).catch(() => {});
  await page.waitForTimeout(3000);
  const after = await regSrc(page);
  const hints = (await page.locator('.card.d-block .invalid-feedback, .swal2-popup, .el-message').allInnerTexts()).map((s) => s.replace(/\s+/g, ' ').trim()).filter(Boolean);
  return { accepted: after !== before, hints };
}

const regImgInList = async (page: Page, id: string) =>
  (await bodyRows(page).filter({ hasText: id }).first().locator('img').first().getAttribute('src')) ?? '';

const addIds = (kind: Kind) => {
  const id = `e2e-ph-${token()}`;
  created.push({ id, kind });
  return id;
};

async function checkAdd(page: Page, kind: Kind, label: string) {
  test.setTimeout(280000);
  const note = (type: string, description: string) => test.info().annotations.push({ type, description });
  // 1) 合格照片：預覽顯示、註冊成功、列表顯示註冊照片
  const id = addIds(kind);
  await openAddPerson(page, kind);
  await fillPersonForm(page, { id, name: `e2e註冊照片${label}` });
  await nextButton(page).click();
  const ok = await tryPick(page, FACE);
  note('觀察', `合格人臉照（640x640，臉約 340px）：${ok.accepted ? '預覽已顯示' : '預覽未改變'}；提示：${ok.hints.join('｜') || '無'}`);
  expect(ok.accepted, `合格人臉照沒有被接受：${ok.hints.join('｜')}`).toBe(true);
  await page.getByRole('button', { name: '註冊' }).click();
  await expect(page.getByText('註冊完成')).toBeVisible();
  await page.getByRole('button', { name: '完成' }).click();
  await searchPersons(page, id);
  expect(await regImgInList(page, id), '註冊後列表的註冊照片仍是空白圖').toContain('data:image/jpeg');
  await checkRejections(page, kind, `新增${label}`, async () => {
    await openAddPerson(page, kind);
    await fillPersonForm(page, { id: addIds(kind), name: `e2e註冊照片拒絕${label}` });
    await nextButton(page).click();
  });
}

/** 不合規照片應被拒絕（預覽不變或出現提示）：無人臉、臉太小（< 200x200）。照片大小已無限制（使用者 2026-10-15 確認），超過 10MB 只記錄觀察、不判定。每種各開新表單，避免前一次的狀態影響。 */
async function checkRejections(page: Page, kind: Kind, label: string, openForm: () => Promise<void>) {
  const note = (type: string, description: string) => test.info().annotations.push({ type, description });
  const bad: string[] = [];
  const cases: Array<[string, () => Promise<string>]> = [
    ['無人臉（純白圖）', () => makeVariant(page, 'noface.jpg', { size: 640, scale: 0 })],
    ['臉太小（臉約 100px，< 200x200）', () => makeVariant(page, 'smallface.jpg', { size: 640, scale: 0.3 })],
    ['超過 10MB（含清楚正臉）', () => makeVariant(page, 'oversize.png', { size: 2600, scale: 0.5, noisy: true, png: true })],
  ];
  for (const [name, make] of cases) {
    const file = await make();
    const oversize = name.startsWith('超過');
    if (oversize) expect(readFileSync(file).length).toBeGreaterThan(10 * 1024 * 1024);
    await openForm();
    const r = await tryPick(page, file);
    console.log('OBS', `${label}｜${name}：${r.accepted ? '被接受（預覽已改變）' : '預覽未改變'}；提示：${r.hints.join('｜') || '無'}`);
    if (r.accepted && !oversize) bad.push(name);
  }
  expect(bad, `不合規的註冊照片被接受：${bad.join('、')}`).toEqual([]);
}

async function checkEdit(page: Page, kind: Kind, label: string) {
  test.setTimeout(280000);
  const id = addIds(kind);
  await createPersonViaUI(page, { id, name: `e2e改註冊照片${label}` }, kind);
  await searchPersons(page, id);
  const beforeSrc = await regImgInList(page, id);
  const openEdit = async () => {
    await gotoPersons(page, kind);
    await searchPersons(page, id);
    await bodyRows(page).filter({ hasText: id }).first().getByRole('button', { name: '編輯' }).click();
    await page.getByRole('button', { name: '下一步' }).waitFor();
    await nextButton(page).click();
  };
  await openEdit();
  const ok = await tryPick(page, FACE);
  test.info().annotations.push({ type: '觀察', description: `編輯：合格人臉照 ${ok.accepted ? '預覽已顯示' : '預覽未改變'}；提示：${ok.hints.join('｜') || '無'}` });
  expect(ok.accepted, `編輯時合格人臉照沒有被接受：${ok.hints.join('｜')}`).toBe(true);
  await page.getByRole('button', { name: '註冊' }).click();
  await expect(page.getByText('註冊完成')).toBeVisible();
  await page.getByRole('button', { name: '完成' }).click();
  await gotoPersons(page, kind);
  await searchPersons(page, id);
  const afterSrc = await regImgInList(page, id);
  expect(afterSrc, '更新後列表的註冊照片沒有改變').not.toBe(beforeSrc);
  expect(afterSrc).toContain('data:image/jpeg');
  await checkRejections(page, kind, `編輯${label}`, openEdit);
}

test.describe('註冊照片', () => {
  test(
    '[PPL-005] 新增人員：註冊照片（選擇/拍攝）顯示，限制 10MB、最小臉 200x200 px、含清楚正臉',
    {
      annotation: [
        ...csvAnnotations({ row: 58, no: '5.2', category: '（延續）> 人員(新增)', steps: '3. 新增註冊照片透過選擇照片或拍攝照片進行新增，兩者皆可正確顯示照片\n   - 最大檔案大小: 10MB\n   - 最小臉部尺寸: 200x200 px\n   - 影像含清楚的正臉', expected: '1.新增人員功能正常且能建立成功' }),
        { type: '未驗證', description: '「拍攝照片」需要 webcam，無法自動化' },
      ],
    },
    async ({ page }) => checkAdd(page, 'person', '人員'),
  );
  test(
    '[PPL-017] 編輯人員：修改人員照片或重新拍攝（10MB、最小臉 200x200 px、含清楚正臉）',
    {
      annotation: [
        ...csvAnnotations({ row: 61, no: '5.5', category: '（延續）> 人員(編輯)', steps: '3. 可修改人員照片或重新拍攝照片\n   - 最大檔案大小: 10MB\n   - 最小臉部尺寸: 200x200 px\n   - 影像含清楚的正臉', expected: '編輯人員功能正常且能更新成功' }),
        { type: '未驗證', description: '「重新拍攝」需要 webcam，無法自動化' },
      ],
    },
    async ({ page }) => checkEdit(page, 'person', '人員'),
  );
  test(
    '[VIS-005] 新增訪客：註冊照片（選擇/拍攝）、限制 10MB、最小臉 200x200 px、含清楚正臉',
    {
      annotation: [
        ...csvAnnotations({ row: 63, no: '5.7', category: '（延續）> 訪客(新增)', steps: '3. 新增註冊照片透過選擇照片或拍攝照片進行新增，兩者皆可正確顯示照片\n   - 最大檔案大小: 10MB\n   - 最小臉部尺寸: 200x200 px\n   - 影像含清楚的正臉', expected: '1.新增人員功能正常且能建立成功' }),
        { type: '未驗證', description: '「拍攝照片」需要 webcam，無法自動化' },
      ],
    },
    async ({ page }) => checkAdd(page, 'visitor', '訪客'),
  );
  test(
    '[VIS-012] 編輯訪客：修改照片或重新拍攝',
    {
      annotation: [
        ...csvAnnotations({ row: 65, no: '5.9', category: '（延續）> 訪客(編輯)', steps: '3. 可修改人員照片或重新拍攝照片\n   - 最大檔案大小: 10MB\n   - 最小臉部尺寸: 200x200 px\n   - 影像含清楚的正臉', expected: '編輯訪客功能正常且能更新成功' }),
        { type: '未驗證', description: '「重新拍攝」需要 webcam，無法自動化' },
      ],
    },
    async ({ page }) => checkEdit(page, 'visitor', '訪客'),
  );
});
