import { test, expect, Page } from '@playwright/test';
import { csvAnnotations } from '../../helpers/csvSource';
import { Kind, cleanupPersons, createPersonViaUI, formInput, gotoPersons, personRowTexts, searchPersons, uniquePersonId } from '../../helpers/persons';
import { bodyRows } from '../../helpers/tables';

// 來源 E2E-TEST-PLAN.md：PPL-009、VIS-009（人臉／卡片可不輸入，辨識資料正確）。
// 「辨識資料正確」需要真實辨識驗證：本環境的辨識事件來自既有模擬攝影機，只會辨識既有人員，無法讓新建的 e2e 人員被辨識，因此該部分未驗證。

const created: Array<{ id: string; kind: Kind }> = [];
test.afterEach(async ({ browser }) => {
  const items = created.splice(0);
  for (const kind of ['person', 'visitor'] as Kind[]) await cleanupPersons(browser, items.filter((i) => i.kind === kind).map((i) => i.id), kind);
});

async function openEdit(page: Page, kind: Kind, id: string) {
  await gotoPersons(page, kind);
  await searchPersons(page, id);
  await bodyRows(page).filter({ hasText: id }).first().getByRole('button', { name: '編輯' }).click();
  await formInput(page, 'name').waitFor();
  await page.waitForTimeout(1500);
}

async function run(page: Page, kind: Kind, label: string) {
  test.setTimeout(240000);
  // 1) 不輸入人臉與卡片：可建立，列表有資料，註冊照片為預設空白圖
  const idPlain = uniquePersonId('np');
  created.push({ id: idPlain, kind });
  await createPersonViaUI(page, { id: idPlain, name: `e2e無臉無卡${label}` }, kind);
  await searchPersons(page, idPlain);
  expect((await personRowTexts(page)).length, '不輸入人臉／卡片的人員沒有建立成功').toBe(1);
  // 2) 只輸入卡號：可建立，編輯頁的卡號欄位保留
  const card = String(Math.floor(10000000 + Math.random() * 89999999));
  const idCard = uniquePersonId('cd');
  created.push({ id: idCard, kind });
  await createPersonViaUI(page, { id: idCard, name: `e2e有卡${label}`, card }, kind);
  await openEdit(page, kind, idCard);
  expect(await formInput(page, 'card').inputValue(), '儲存後卡號沒有保留').toBe(card);
}

test.describe('G3-A 人員／訪客（人臉卡片）', () => {
  test(
    '[PPL-009] 新增人員：人臉/卡片可不輸入，且辨識資料正確',
    {
      annotation: [
        ...csvAnnotations({ row: 58, no: '5.2', category: '（延續）> 人員(新增)', steps: '6.人臉/卡片 可不輸入', expected: '3.人臉/卡片辨識資料正確' }),
        { type: '未驗證', description: '「辨識資料正確」需要實際辨識：本環境的辨識事件只會辨識既有人員，無法讓 e2e 人員被辨識' },
      ],
    },
    async ({ page }) => run(page, 'person', '人員'),
  );
  test(
    '[VIS-009] 新增訪客：人臉/卡片辨識資料正確',
    {
      annotation: [
        ...csvAnnotations({ row: 63, no: '5.7', category: '（延續）> 訪客(新增)', steps: '1. 點選新增訪客功能，可以進入新增訪客頁面\n2. 填入編號(必填)與姓名(必填)與其他資訊\n3. 新增註冊照片透過選擇照片或拍攝照片進行新增', expected: '3.人臉/卡片辨識資料正確' }),
        { type: '未驗證', description: '「辨識資料正確」需要實際辨識：本環境的辨識事件只會辨識既有人員，無法讓 e2e 訪客被辨識。本項只驗證卡號可儲存並保留' },
      ],
    },
    async ({ page }) => run(page, 'visitor', '訪客'),
  );
});
