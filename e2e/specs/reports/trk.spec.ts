import { Page, expect, test } from '../../helpers/test';
import { shot } from '../../helpers/evidence';
import { PresenceCase, noPresenceMessage, openPresenceDetail, openPresenceList, scanPresence, titleSeconds } from '../../helpers/presence';

// 進出紀錄（TRK）。不寫死特定日期或人員：從後端 API 掃描環境現有的進出彙總（helpers/presence.ts），
// 挑出符合各測項條件的案例（多人的一天、有離開區段的人員），斷言都相對於該案例的實際資料。
// 使用者 2026-10-14 指示：不用管形容詞，重點功能正常即可。
const GREEN = 'rgb(76, 175, 80)';
const YELLOW = 'rgb(255, 193, 7)';
const GRAY = 'rgb(221, 225, 230)';

async function awayCase(page: Page): Promise<PresenceCase> {
  const s = await scanPresence(page);
  if (!s.withAway) throw new Error(noPresenceMessage('至少有一位人員有「不在辦公室」區段'));
  return s.withAway;
}
async function openDetail(page: Page): Promise<PresenceCase> {
  const c = await awayCase(page);
  await openPresenceDetail(page, c.day, c.name);
  test.info().annotations.push({ type: '使用的資料', description: `${c.day} ${c.name}（在辦公室 ${c.inSec}s、不在辦公室 ${c.outSec}s）` });
  return c;
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
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** 在辦公室時間（畫面「在辦公室時間 1h 01m」）換算成分鐘 */
const inOfficeMinutes = (text: string) => {
  const m = /(?<!不)在辦公室時間\s*(?:(\d+)h)?\s*(?:(\d+)m)?/.exec(text); // 排除「不在辦公室時間」
  return m ? Number(m[1] || 0) * 60 + Number(m[2] || 0) : -1;
};

test.describe('TRK 進出紀錄', () => {
  test('[TRK-001] 進出紀錄列表：搜尋人員，列表僅有該人員', async ({ page }) => {
    test.setTimeout(240000);
    const s = await scanPresence(page);
    if (!s.multiDay) throw new Error(noPresenceMessage('某一天有兩位以上人員的進出彙總'));
    const person = s.multiDay.names[0];
    await openPresenceList(page, s.multiDay.day);
    const rows = page.locator('.vxe-table--body-wrapper tbody tr');
    const before = await rows.count();
    expect(before, '該日應有多位人員').toBeGreaterThan(1);
    const box = page.getByPlaceholder('搜尋').first();
    await box.fill(person);
    await box.press('Enter');
    await page.waitForTimeout(1500);
    const texts = (await rows.allInnerTexts()).map((x) => x.replace(/\s+/g, ' '));
    expect(texts.length, `搜尋「${person}」後的列數`).toBeGreaterThan(0);
    for (const t of texts) expect(t, `列內容：${t}`).toContain(person);
    expect(texts.length, '搜尋後應少於搜尋前').toBeLessThan(before);
    await shot(page, 'TRK-001', '01-搜尋人員後的列表');
  });

  test('[TRK-002] 影像設備管理：設定群組 IN/OUT 後，事件顯示的設備名稱與方向和設定相同', async ({ page }) => {
    test.setTimeout(240000);
    await openDetail(page);
    await page.locator('.timeline-seg-away').first().click({ force: true });
    await page.waitForTimeout(2500);
    const rows = (await page.locator('.vxe-table--body-wrapper tbody tr').allInnerTexts()).map((x) => x.replace(/\s+/g, ' '));
    expect(rows.length, '事件列表').toBeGreaterThan(0);
    const dirs = await cameraDirections(page);
    const names = Object.keys(dirs).sort((a, b) => b.length - a.length);
    expect(names.length, '環境沒有攝影機').toBeGreaterThan(0);
    const re = new RegExp(`(${names.map(esc).join('|')})\\s+(IN|OUT)`);
    for (const r of rows) {
      const m = re.exec(r);
      expect(m, `無法解析事件列（設備名稱需是現有攝影機）：${r}`).not.toBeNull();
      expect(dirs[m![1]], `${m![1]} 的設定方向`).toBe(m![2]);
    }
    await shot(page, 'TRK-002', '01-事件列表的攝影機與方向');
  });

  test('[TRK-003] 詳細資料頁：時間篩選（不在 10/20/30/60 分鐘以上、自訂起訖時間）', async ({ page }) => {
    test.setTimeout(240000);
    await openDetail(page);
    const selects = page.locator('select');
    const awaySel = selects.nth(2);
    const labels = (await awaySel.locator('option').allInnerTexts()).map((x) => x.trim());
    expect(labels, '不在辦公室時間選項').toEqual(['不在 10 分鐘以上', '不在 20 分鐘以上', '不在 30 分鐘以上', '不在 60 分鐘以上']);
    expect((await awaySel.locator('option:checked').innerText()).trim(), '預設').toBe('不在 10 分鐘以上');
    const bodyText = async () => (await page.locator('body').innerText()).replace(/\s+/g, ' ');
    const wholeMin = inOfficeMinutes(await bodyText());
    expect(wholeMin, '畫面要顯示「在辦公室時間」').toBeGreaterThan(0);
    // 自訂起訖時間：縮到案例中第一個「在辦公室」區段所在的 1 小時內，在辦公室時間不可超過整天，也不可超過 60 分鐘
    const first = (await segs(page)).find((x) => x.cls.includes('seg-in'));
    expect(first, '案例沒有在辦公室區段').toBeTruthy();
    const startHour = Number(/(\d{2}):\d{2}:\d{2}/.exec(first!.title)![1]);
    const hourLabel = (h: number) => `${String(h).padStart(2, '0')}:00`;
    await selects.nth(0).selectOption({ label: hourLabel(startHour) });
    await selects.nth(1).selectOption({ label: hourLabel(Math.min(startHour + 1, 24)) });
    await page.getByRole('button', { name: '送出' }).click();
    await page.waitForTimeout(2500);
    const partMin = inOfficeMinutes(await bodyText());
    test.info().annotations.push({ type: '觀察', description: `整天在辦公室 ${wholeMin} 分；自訂 ${hourLabel(startHour)}～${hourLabel(Math.min(startHour + 1, 24))} 為 ${partMin} 分` });
    expect(partMin, '縮小時間範圍後在辦公室時間不應超過整天').toBeLessThanOrEqual(wholeMin);
    expect(partMin, '一小時範圍內的在辦公室時間不應超過 60 分鐘').toBeLessThanOrEqual(60);
    await shot(page, 'TRK-003', '01-自訂起訖時間後');
  });

  test('[TRK-005] 時間軸：非上班為灰色（早於當天第一筆 IN、晚於最後一筆）', async ({ page }) => {
    test.setTimeout(240000);
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
    test.setTimeout(240000);
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
    test.setTimeout(240000);
    await openDetail(page);
    const aw = (await segs(page)).filter((x) => x.cls.includes('seg-away'));
    expect(aw.length, '不在辦公室段數').toBeGreaterThan(0);
    // 未超過門檻（預設 10 分鐘）的離開區段為黃色；超時的為紅色（TRK-008 專門驗）
    const notOver = aw.filter((x) => !x.cls.includes('away-over'));
    for (const x of notOver) {
      expect(x.title).toContain('不在辦公室');
      expect(x.bg, x.title).toBe(YELLOW);
    }
    await shot(page, 'TRK-007', '01-時間軸黃色不在辦公室');
  });

  test('[TRK-004] 例外處理：增加 IN 記錄，時間軸重跑並更新', async ({ page }) => {
    test.setTimeout(300000);
    await openDetail(page);
    const before = await segs(page);
    const awayBefore = before.filter((x) => x.cls.includes('seg-away'));
    expect(awayBefore.length).toBeGreaterThan(0);
    // 在第一段離開區段「中間」補一筆 IN：不指定特定時間，取該區段起訖的中點
    const target = awayBefore[0];
    const m = /(\d{2}):(\d{2}):(\d{2})\s*[—-]\s*(\d{2}):(\d{2}):(\d{2})/.exec(target.title)!;
    const startSec = Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
    const mid = startSec + Math.floor(titleSeconds(target.title) / 2);
    const hhmmss = [Math.floor(mid / 3600), Math.floor((mid % 3600) / 60), mid % 60].map((x) => String(x).padStart(2, '0')).join(':');
    await page.locator('.timeline-seg-away').first().click({ force: true });
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: '例外處理' }).click();
    const tm = page.locator('.modal .mx-datepicker input').first();
    await tm.click();
    await tm.fill(hhmmss);
    await tm.press('Enter');
    await page.locator('.modal-title, .modal-header h5').first().click({ force: true });
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: '加入紀錄' }).click({ force: true });
    await page.waitForTimeout(4000);
    await shot(page, 'TRK-004', '01-補一筆IN後的時間軸');
    const after = await segs(page);
    const changed = JSON.stringify(after.map((x) => x.title)) !== JSON.stringify(before.map((x) => x.title));
    // 還原：只刪除「自己剛補的那一筆」（時間 = hhmmss）。環境裡原有的人工例外紀錄絕不能動，所以找不到自己的那筆就直接失敗、不亂刪。
    const idx = await page.locator('.timeline-seg-in').evaluateAll((els, t) => els.findIndex((e) => (e as HTMLElement).title.split('\n')[1]?.startsWith(t)), hhmmss);
    expect(idx, `找不到起點為 ${hhmmss} 的在辦公室區段，無法確認哪一筆是自己補的（為避免刪到原有例外紀錄，不進行還原刪除）`).toBeGreaterThanOrEqual(0);
    await page.locator('.timeline-seg-in').nth(idx).click({ force: true });
    await page.waitForTimeout(1500);
    const mineRow = page.locator('.vxe-table--body-wrapper tbody tr').filter({ hasText: hhmmss }).filter({ has: page.locator('button.manual-remark-delete') });
    expect(await mineRow.count(), `事件列表中沒有時間為 ${hhmmss} 且可刪除的例外紀錄`).toBe(1);
    await mineRow.locator('button.manual-remark-delete').click();
    await page.waitForTimeout(800);
    await page.locator('.el-message-box__btns .el-button--primary').click();
    await page.waitForTimeout(3000);
    const restored = await segs(page);
    expect(JSON.stringify(restored.map((x) => x.title)), '刪除例外紀錄後時間軸應回到原樣').toBe(JSON.stringify(before.map((x) => x.title)));
    expect(changed, `在 ${hhmmss} 補一筆 IN 後時間軸應該改變`).toBe(true);
  });

  test('[TRK-009] 進出紀錄匯出', async ({ page }) => {
    test.setTimeout(180000);
    const s = await scanPresence(page);
    await openPresenceList(page, (s.withAway || s.multiDay || { day: new Date().toISOString().slice(0, 10) }).day);
    await page.getByRole('button', { name: '匯出為 Excel' }).click();
    const item = page.locator('.dropdown-item, [role=menuitem]').filter({ hasText: '匯出' }).last();
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), item.click()]);
    const name = dl.suggestedFilename();
    expect(name, '檔名').toMatch(/\.xlsx$/);
    const path = await dl.path();
    const { statSync } = await import('node:fs');
    expect(statSync(path!).size, '檔案大小').toBeGreaterThan(2000);
  });

  // 使用者 2026-10-15：TRK-010 先前卡在後端算不完（Invalid parameter: start_time），改用有資料的日期測試
  test('[TRK-010] 查看詳細：時間軸列出進出時間與長度', async ({ page }) => {
    test.setTimeout(240000);
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
