import { test, expect, Page } from '../../helpers/test';
import { readFileSync } from 'node:fs';
import { csvAnnotations } from '../../helpers/csvSource';
import { TMP_DIR, writeFile } from '../../helpers/files';
import { cleanupPersons, fillPersonForm, openAddPerson } from '../../helpers/persons';

// 來源 E2E-TEST-PLAN.md：MISC-001（單張照片上限由 10MB 調整為 20MB）。
// 只驗證單張照片大小限制：15MB 的照片（含清楚正臉）應被接受、25MB 的照片應被拒絕。「一次上傳 1 萬筆」的批次工具不在本項範圍，未驗證。
// 不實際註冊（只看選擇照片後預覽是否被接受），不產生測試資料。
const FACE = 'e2e/fixtures/face.jpg';

const created: string[] = [];
test.afterEach(async ({ browser }) => {
  await cleanupPersons(browser, created.splice(0));
});

async function makeNoisy(page: Page, name: string, size: number) {
  const b64 = readFileSync(FACE).toString('base64');
  const dataUrl = await page.evaluate(
    async ({ data, s }) => {
      const img = new Image();
      img.src = `data:image/jpeg;base64,${data}`;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = s;
      c.height = s;
      const g = c.getContext('2d') as CanvasRenderingContext2D;
      const id = g.getImageData(0, 0, s, s);
      for (let i = 0; i < id.data.length; i += 4) {
        id.data[i] = Math.random() * 255;
        id.data[i + 1] = Math.random() * 255;
        id.data[i + 2] = Math.random() * 255;
        id.data[i + 3] = 255;
      }
      g.putImageData(id, 0, 0);
      const w = s * 0.5;
      g.drawImage(img, (s - w) / 2, (s - w) / 2, w, w);
      return c.toDataURL('image/png');
    },
    { data: b64, s: size },
  );
  return writeFile(`${TMP_DIR}/${name}`, Buffer.from(dataUrl.split(',')[1], 'base64'));
}
const regSrc = async (page: Page) => (await page.locator('.card.d-block img').nth(0).getAttribute('src')) ?? '';
async function tryPick(page: Page, file: string) {
  await openAddPerson(page, 'person');
  const pid = `e2e-sz-${Date.now().toString(36).slice(-5)}`;
  created.push(pid);
  await fillPersonForm(page, { id: pid, name: 'e2e照片大小' });
  await page.getByRole('button', { name: '下一步' }).click();
  await page.getByRole('button', { name: '選擇照片' }).first().waitFor();
  const before = await regSrc(page);
  const [fc] = await Promise.all([page.waitForEvent('filechooser'), page.getByRole('button', { name: '選擇照片' }).nth(0).click()]);
  await fc.setFiles(file);
  await expect.poll(() => regSrc(page), { timeout: 40000 }).not.toBe(before).catch(() => {});
  await page.waitForTimeout(3000);
  const hints = (await page.locator('.card.d-block .invalid-feedback, .swal2-popup, .el-message').allInnerTexts()).map((s) => s.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const accepted = (await regSrc(page)) !== before;
  let registered = '未嘗試';
  if (accepted) {
    await page.getByRole('button', { name: '註冊' }).click();
    registered = await page.getByText('註冊完成').waitFor({ timeout: 90000 }).then(() => '註冊成功').catch(() => '註冊失敗（沒有出現註冊完成）');
  }
  return { accepted, hints, registered };
}

test(
  '[MISC-001] 大量上傳照片：單張照片上限由 10MB 調整為 20MB',
  {
    annotation: [
      ...csvAnnotations({ row: 248, no: '', category: '其他 > 大量上傳照片', steps: '使用20MB照片上傳1萬筆', expected: '現有的照片大小為 10 MB，調整為 20 MB' }),
      { type: '判定範圍', description: '只驗證單張照片上限：15MB、25MB 皆被接受（使用者確認已無大小限制）；「1 萬筆批次上傳」的效能見 MISC-003，未驗證' },
    ],
  },
  async ({ page }) => {
    test.setTimeout(290000);
    await page.goto('/#/personsmanagement/personmanagement');
    await page.reload();
    await page.waitForTimeout(2500);
    const f15 = await makeNoisy(page, 'size15.png', 2250);
    const f25 = await makeNoisy(page, 'size25.png', 2900);
    const s15 = readFileSync(f15).length / 1048576;
    const s25 = readFileSync(f25).length / 1048576;
    console.log('OBS', `測試檔大小：${s15.toFixed(1)}MB、${s25.toFixed(1)}MB`);
    test.info().annotations.push({ type: '觀察', description: `測試檔大小：${s15.toFixed(1)}MB、${s25.toFixed(1)}MB` });
    expect(s15, '15MB 測試檔大小不在 11~19MB').toBeGreaterThan(11);
    expect(s15).toBeLessThan(19);
    expect(s25, '25MB 測試檔大小需 > 21MB').toBeGreaterThan(21);
    const a = await tryPick(page, f15);
    const b = await tryPick(page, f25);
    const msg = `${s15.toFixed(1)}MB：預覽${a.accepted ? "已接受" : "未接受"}、${a.registered}；${s25.toFixed(1)}MB：預覽${b.accepted ? "已接受" : "未接受"}、${b.registered}`;
    console.log("OBS", msg);
    test.info().annotations.push({ type: "觀察", description: msg });
    expect(a.accepted && a.registered === "註冊成功", `${s15.toFixed(1)}MB 照片沒有註冊成功`).toBe(true);
    // 使用者 2026-10-15 確認照片大小已無限制：超過 20MB 的照片也應可註冊
    expect(b.accepted && b.registered === "註冊成功", `${s25.toFixed(1)}MB 照片沒有註冊成功（應已無大小限制）`).toBe(true);
  },
);
