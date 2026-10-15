import { Page, expect, test } from '@playwright/test';
import { shot } from '../../helpers/evidence';

// 進出紀錄（TRK）。使用環境內既有的進出彙總（2026-10-12 的 Ken：e2e-nx-out OUT ×4 → Camera-8 IN，有一段 28 秒的離開）。
// 使用者 2026-10-14 指示：不用管形容詞，重點功能正常即可。方向設定為 Camera-8＝IN、e2e-nx-out＝OUT（本輪暫時設定）。
const DAY = '2026-10-12';
const PERSON = 'Ken';
const GREEN = 'rgb(76, 175, 80)';
const YELLOW = 'rgb(255, 193, 7)';
const GRAY = 'rgb(221, 225, 230)';

async function openList(page: Page) {
  await page.goto('/#/reports/presencedetail');
  await page.reload();
  await page.locator('.mx-datepicker input').first().waitFor();
  const d = page.locator('.mx-datepicker input').first();
  await d.click();
  await d.fill(`${DAY} ~ ${DAY}`);
  await d.press('Enter');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: '搜尋' }).first().click();
  await page.waitForTimeout(2500);
}
async function openDetail(page: Page) {
  await openList(page);
  await page.locator('.vxe-table--body-wrapper tbody tr').filter({ hasText: PERSON }).first().getByText('查看詳細').click();
  await page.locator('.timeline-seg').first().waitFor();
  await page.waitForTimeout(1500);
}
const segs = (page: Page) =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll('.timeline-seg')).map((e) => ({ cls: e.className.toString(), bg: getComputedStyle(e).backgroundColor, title: (e as HTMLElement).title })),
  );
const cameraDirections = (page: Page) =>
  page.evaluate(async () => {
    const el = Array.from(document.querySelectorAll('*')).find((e) => (e as unknown as { __vue__?: unknown }).__vue__) as any;
    const list = ((await el.__vue__.$root.$globalFindCameras('', 0, 100)).data || {}).list || [];
    const o: Record<string, string> = {};
    list.forEach((c: any) => { o[c.name] = c.presence_direction || 'NONE'; });
    return o;
  });

test.describe('TRK 進出紀錄', () => {
  test('[TRK-001] 進出紀錄列表：搜尋人員，列表僅有該人員', async ({ page }) => {
    test.setTimeout(180000);
    await openList(page);
    const rows = page.locator('.vxe-table--body-wrapper tbody tr');
    const before = await rows.count();
    expect(before, '該日應有多位人員').toBeGreaterThan(1);
    const box = page.getByPlaceholder('搜尋').first();
    await box.fill(PERSON);
    await box.press('Enter');
    await page.waitForTimeout(1500);
    const texts = (await rows.allInnerTexts()).map((s) => s.replace(/\s+/g, ' '));
    expect(texts.length, `搜尋「${PERSON}」後的列數`).toBeGreaterThan(0);
    for (const t of texts) expect(t, `列內容：${t}`).toContain(PERSON);
    await shot(page, 'TRK-001', '01-搜尋人員後的列表');
  });

  test('[TRK-002] 影像設備管理：設定群組 IN/OUT 後，事件顯示的設備名稱與方向和設定相同', async ({ page }) => {
    test.setTimeout(180000);
    await openDetail(page);
    await page.locator('.timeline-seg-away').first().click({ force: true });
    await page.waitForTimeout(2500);
    const rows = (await page.locator('.vxe-table--body-wrapper tbody tr').allInnerTexts()).map((s) => s.replace(/\s+/g, ' '));
    expect(rows.length, '事件列表').toBeGreaterThan(0);
    const dirs = await cameraDirections(page);
    for (const r of rows) {
      const m = /(e2e-nx-in|e2e-nx-out|Camera-\d+)\s+(IN|OUT)/.exec(r);
      expect(m, `無法解析事件列：${r}`).not.toBeNull();
      expect(dirs[m![1]], `${m![1]} 的設定方向`).toBe(m![2]);
    }
    await shot(page, 'TRK-002', '01-事件列表的攝影機與方向');
  });

  test('[TRK-003] 詳細資料頁：時間篩選（不在 10/20/30/60 分鐘以上、自訂起訖時間）', async ({ page }) => {
    test.setTimeout(180000);
    await openDetail(page);
    const selects = page.locator('select');
    const awaySel = selects.nth(2);
    const labels = (await awaySel.locator('option').allInnerTexts()).map((s) => s.trim());
    expect(labels, '不在辦公室時間選項').toEqual(['不在 10 分鐘以上', '不在 20 分鐘以上', '不在 30 分鐘以上', '不在 60 分鐘以上']);
    expect((await awaySel.locator('option:checked').innerText()).trim(), '預設').toBe('不在 10 分鐘以上');
    const inOffice = async () => (await page.locator('body').innerText()).replace(/\s+/g, ' ');
    const whole = await inOffice();
    expect(whole).toContain('在辦公室時間 1h 01m');
    // 自訂起訖時間 15:00～16:00：在辦公室時間應縮短
    await selects.nth(0).selectOption({ label: '15:00' });
    await selects.nth(1).selectOption({ label: '16:00' });
    await page.getByRole('button', { name: '送出' }).click();
    await page.waitForTimeout(2500);
    const part = await inOffice();
    expect(part, '縮小時間範圍後在辦公室時間應改變').not.toContain('在辦公室時間 1h 01m');
    await shot(page, 'TRK-003', '01-自訂起訖時間後');
  });

  test('[TRK-005] 時間軸：非上班為灰色（早於當天第一筆 IN、晚於最後一筆）', async ({ page }) => {
    test.setTimeout(180000);
    await openDetail(page);
    const s = await segs(page);
    const first = s[0];
    const last = s[s.length - 1];
    expect(first.title, '第一段').toContain('非上班時間');
    expect(first.title).toContain('00:00:00');
    expect(first.bg).toBe(GRAY);
    expect(last.title, '最後一段').toContain('非上班時間');
    expect(last.bg).toBe(GRAY);
    // 灰色前一段的結束時間 = 第一個在辦公室段的開始時間
    expect(first.title.split('\n')[1]).toContain(s.find((x) => x.cls.includes('seg-in'))!.title.split('\n')[1].split(' — ')[0]);
    await shot(page, 'TRK-005', '01-時間軸灰色非上班');
  });

  test('[TRK-006] 時間軸：在辦公室為綠色（IN→OUT）', async ({ page }) => {
    test.setTimeout(180000);
    await openDetail(page);
    const ins = (await segs(page)).filter((x) => x.cls.includes('seg-in'));
    expect(ins.length, '在辦公室段數').toBeGreaterThan(0);
    for (const x of ins) {
      expect(x.title).toContain('在辦公室');
      expect(x.bg, x.title).toBe(GREEN);
    }
    await shot(page, 'TRK-006', '01-時間軸綠色在辦公室');
  });

  test('[TRK-007] 時間軸：不在辦公室為黃色（OUT→IN）', async ({ page }) => {
    test.setTimeout(180000);
    await openDetail(page);
    const aw = (await segs(page)).filter((x) => x.cls.includes('seg-away'));
    expect(aw.length, '不在辦公室段數').toBeGreaterThan(0);
    for (const x of aw) {
      expect(x.title).toContain('不在辦公室');
      expect(x.bg, x.title).toBe(YELLOW);
    }
    await shot(page, 'TRK-007', '01-時間軸黃色不在辦公室');
  });

  test('[TRK-004] 例外處理：增加 IN 記錄，時間軸重跑並更新', async ({ page }) => {
    test.setTimeout(240000);
    await openDetail(page);
    const before = await segs(page);
    const awayBefore = before.filter((x) => x.cls.includes('seg-away')).length;
    expect(awayBefore).toBeGreaterThan(0);
    await page.locator('.timeline-seg-away').first().click({ force: true });
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: '例外處理' }).click();
    const tm = page.locator('.modal .mx-datepicker input').first();
    await tm.click();
    await tm.fill('15:20:45');
    await tm.press('Enter');
    await page.locator('.modal-title, .modal-header h5').first().click({ force: true });
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: '加入紀錄' }).click({ force: true });
    await page.waitForTimeout(4000);
    await shot(page, 'TRK-004', '01-補一筆IN後的時間軸');
    const after = await segs(page);
    const changed = JSON.stringify(after.map((x) => x.title)) !== JSON.stringify(before.map((x) => x.title));
    // 還原：刪除剛補的例外紀錄
    const cleanup = async () => {
      const aw = page.locator('.timeline-seg').filter({ hasNot: page.locator('x') });
      await page.evaluate(() => undefined);
      for (let i = 0; i < 6; i += 1) {
        const segsNow = page.locator('.timeline-seg-in, .timeline-seg-away');
        const n = await segsNow.count();
        let deleted = false;
        for (let k = 0; k < n && !deleted; k += 1) {
          await segsNow.nth(k).click({ force: true });
          await page.waitForTimeout(1200);
          const del = page.locator('button.manual-remark-delete');
          if ((await del.count()) > 0) {
            await del.first().click();
            await page.waitForTimeout(800);
            await page.locator('.el-message-box__btns .el-button--primary').click();
            await page.waitForTimeout(3000);
            deleted = true;
          }
        }
        if (!deleted) break;
      }
      void aw;
    };
    await cleanup();
    const restored = await segs(page);
    expect(JSON.stringify(restored.map((x) => x.title)), '刪除例外紀錄後時間軸應回到原樣').toBe(JSON.stringify(before.map((x) => x.title)));
    expect(changed, '加入紀錄後時間軸應該改變').toBe(true);
  });

  test('[TRK-009] 進出紀錄匯出', async ({ page }) => {
    test.setTimeout(180000);
    await openList(page);
    await page.getByRole('button', { name: '匯出為 Excel' }).click();
    const item = page.locator('.dropdown-item, [role=menuitem]').filter({ hasText: '匯出' }).last();
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), item.click()]);
    const name = dl.suggestedFilename();
    expect(name, '檔名').toMatch(/\.xlsx$/);
    const path = await dl.path();
    const { statSync } = await import('node:fs');
    expect(statSync(path!).size, '檔案大小').toBeGreaterThan(2000);
  });

  // 使用者 2026-10-15：TRK-010 先前卡在後端算不完（Invalid parameter: start_time），改用有資料的日期（Ken 2026-10-12）測試
  test('[TRK-010] 查看詳細：時間軸列出進出時間與長度', async ({ page }) => {
    test.setTimeout(180000);
    await openDetail(page);
    const s = await segs(page);
    expect(s.length, '時間軸段數').toBeGreaterThan(0);
    console.log('OBS 時間軸段落', JSON.stringify(s.slice(0, 6).map((x) => x.title)));
    const range = /\d{2}:\d{2}:\d{2}\s*[—-]\s*\d{2}:\d{2}:\d{2}/;
    // 每一段的提示文字應列出起訖時間與長度
    for (const x of s) {
      const lines = x.title.split('\n');
      expect(lines.length, `段落提示：${x.title}`).toBeGreaterThanOrEqual(2);
      expect(lines[1], `起訖時間：${x.title}`).toMatch(range);
    }
    const rest = (x: { title: string }) => x.title.split('\n').slice(1).join(' ').replace(range, '');
    const hasLength = s.filter((x) => /\d+\s*(h|m|s|時|分|秒|小時|分鐘)/.test(rest(x)));
    test.info().annotations.push({ type: '觀察', description: `有顯示長度的段落 ${hasLength.length}/${s.length}；第一段提示：${s[0].title.replace(/\n/g, ' ｜ ')}` });
    expect(hasLength.length, '每一段都應列出長度').toBe(s.length);
    await shot(page, 'TRK-010', '01-時間軸列出進出時間與長度');
  });
});
