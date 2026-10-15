import { test, expect, Page } from '@playwright/test';
import { dragSchedule, fillEventStep1, gotoEvents, openAddEvent, searchEvents, eventRow } from '../../helpers/events';
import { listReady } from '../../helpers/tables';

// 環境建置：依規格（CSV 第 101 列 Email、使用者提供的 HTTP POST 參數）建立測試事件，人員群組 All Person、影像設備群組 test。
// 事件建立後預設「停用」（列表的啟用開關關閉），使用者準備好再一起開啟、走過 Camera-8 一次觸發全部。
// 帳密與主機從 .env.e2e.local 讀取，不印出。SEED_EVENT 指定只建某一個（試做用）。
const next = (page: Page) => page.getByRole('button', { name: '下一步' });
const env = (k: string) => process.env[k] ?? '';
const only = process.env.SEED_EVENT ?? '';

// 第 2 步（Email）可見輸入框依畫面順序：0 主機、1 埠、2 帳號、3 密碼、4 寄件者、5 主旨、6 收件者、7 副本、8 密件副本（啟用 SMTPS 是 checkbox，不計）
const FI = { host: 0, port: 1, user: 2, pass: 3, from: 4, subject: 5, to: 6 } as const;
const field = (page: Page, k: keyof typeof FI) => page.locator('input:visible:not([type=checkbox]):not([type=file])').nth(FI[k]);
// 以標籤文字找到勾選框並用原生 click 切換（欄位挑選器的列是自訂樣式，用滑鼠點標籤不穩）
async function setCheck(page: Page, label: string, on: boolean) {
  const r = await page.evaluate(
    ([l, want]) => {
      const box = (Array.from(document.querySelectorAll('input[type=checkbox]')) as HTMLInputElement[]).find((e) => ((e.closest('label, li, div')?.textContent ?? '').replace(/s+/g, ' ').trim() === l));
      if (!box) return 'notfound';
      if (box.disabled) return 'disabled';
      if (box.checked !== want) box.click();
      return box.checked === want ? 'ok' : 'failed';
    },
    [label, on] as [string, boolean],
  );
  if (r !== 'ok') throw new Error(`「${label}」${on ? '勾選' : '取消'}失敗：${r}`);
}

type MailCfg = { name: string; on: string[]; off: string[]; lang: string };
const ALL_PERSON = ['卡號', '部門', '電子信箱', '分機號碼', '群組', '人員編號', '人員姓名', '電話號碼', '職稱', '備註'];
const BASE_DATA = ['事件名稱', '驗證的Uuid', '影像來源', '識別日期時間', '體溫', '僅有溫度異常時'];
const MAILS: MailCfg[] = [
  { name: 'Email-A-capture', lang: '繁體中文', on: [...BASE_DATA, '顯示 ID', '抓拍照片', ...ALL_PERSON], off: ['註冊時的照片', '顯示圖片'] },
  { name: 'Email-B-register', lang: '繁體中文', on: [...BASE_DATA, '註冊時的照片', ...ALL_PERSON], off: ['顯示 ID', '抓拍照片', '顯示圖片'] },
  { name: 'Email-C-display', lang: 'English', on: [...BASE_DATA, '顯示圖片', ...ALL_PERSON], off: ['顯示 ID', '抓拍照片', '註冊時的照片'] },
];

// helper 的 day 以「tbody 第 day+1 列」取格子，週一是 tbody 第 0 列，所以 day=-1 才是週一；全週逐列拖曳（一到日）
async function allWeekSchedule(page: Page) {
  for (let d = -1; d < 6; d += 1) await dragSchedule(page, d, 0, 23);
  const filled = await page.locator('table:visible').first().locator('tbody tr').evaluateAll((rs) => rs.slice(0, 7).map((r) => r.querySelectorAll('td[style*="background"], td.selected, td.active').length));
  console.log('SEED 排程各列已選格數', JSON.stringify(filled));
}
async function finish(page: Page, name: string) {
  await next(page).click(); // 排程 → 完成
  await page.getByRole('button', { name: '完成' }).click();
  await listReady(page);
  // 停用：關掉列表上的啟用開關
  await searchEvents(page, name);
  const row = eventRow(page, name).first();
  const sw = row.locator('input[type=checkbox]').first();
  if (await sw.isChecked()) {
    await row.locator('label, .c-switch').first().click().catch(async () => sw.click({ force: true }));
    await page.waitForTimeout(1500);
  }
  console.log('SEED 事件', name, '啟用=', await sw.isChecked());
}

for (const m of MAILS) {
  test(`[SEED-EVT] 建立事件 ${m.name}`, async ({ page }) => {
    test.skip(!!only && only !== m.name, '只建指定事件');
    test.setTimeout(240000);
    await gotoEvents(page);
    await searchEvents(page, m.name);
    if ((await eventRow(page, m.name).count()) > 0) {
      console.log('SEED 已存在', m.name);
      return;
    }
    await openAddEvent(page);
    await fillEventStep1(page, m.name, 'All Person', 'test', '電子郵件通知');
    await next(page).click();
    await page.getByText('SMTP 方法').first().waitFor();
    await page.waitForTimeout(1500);
    await field(page, 'host').fill(env('E2E_SMTP_HOST'));
    await field(page, 'port').fill(env('E2E_SMTP_PORT'));
    await field(page, 'user').fill(env('E2E_SMTP_USER'));
    await field(page, 'pass').fill(env('E2E_SMTP_PASS'));
    await field(page, 'from').fill(env('E2E_SMTP_FROM'));
    await field(page, 'subject').fill(`${env('E2E_SMTP_SUBJECT')} ${m.name}`);
    await field(page, 'to').fill(env('E2E_SMTP_TO'));
    await page.locator('select:visible').filter({ has: page.locator('option', { hasText: '日本語' }) }).first().selectOption({ label: m.lang });
    for (const l of m.off) await setCheck(page, l, false);
    for (const l of m.on) await setCheck(page, l, true);
    await expect(next(page)).toBeEnabled();
    await next(page).click(); // → 排程
    await allWeekSchedule(page);
    await finish(page, m.name);
  });
}

// HTTP POST → Nx（參數來自使用者提供：192.168.14.24、Admin、埠 7001、path rest/v4/events/generic、POST；body 與擴充欄位如下，deviceIds 的 Nx ID 以 E2E_NX_DEVICE_ID 取代）
test('[SEED-EVT] 建立事件 HTTP-POST-Nx', async ({ page }) => {
  const name = 'HTTP-POST-Nx';
  test.skip(!!only && only !== name, '只建指定事件');
  test.setTimeout(240000);
  await gotoEvents(page);
  await searchEvents(page, name);
  if ((await eventRow(page, name).count()) > 0) {
    if (process.env.SEED_FIXPATH !== '1') {
      console.log('SEED 已存在', name);
      return;
    }
    await eventRow(page, name).first().getByRole('button', { name: '編輯' }).click();
    await page.locator('input[type=text]:visible').first().waitFor();
    await page.waitForTimeout(2500);
    await next(page).click();
    await page.getByText('主機位址').first().waitFor();
    await page.waitForTimeout(1500);
    await page.locator('input[type=text]:visible').nth(3).fill('');
    await page.locator('input[type=text]:visible').nth(3).fill('rest/v4/events/generic');
    console.log('SEED 修改後 PATH 欄位=', await page.locator('input[type=text]:visible').nth(3).inputValue(), '｜顯示URL=', (await page.locator('input[disabled], input[readonly]').first().inputValue().catch(() => '')).slice(0, 60));
    await next(page).click();
    await next(page).click();
    await page.getByRole('button', { name: '完成' }).click();
    await listReady(page);
    await searchEvents(page, name);
    const sw0 = eventRow(page, name).first().locator('input[type=checkbox]').first();
    if (await sw0.isChecked()) {
      await eventRow(page, name).first().locator('label, .c-switch').first().click().catch(async () => sw0.click({ force: true }));
      await page.waitForTimeout(1500);
    }
    console.log('SEED 已補上 PATH；啟用=', await sw0.isChecked());
    return;
  }
  const host = new URL(env('E2E_NX_URL')).hostname;
  const body = `"timestamp":"##VerifiedTimeStamp##","source":"##SourceDevice##","caption":"##PersonId## (##PersonName##)","deviceIds":["${env('E2E_NX_DEVICE_ID')}"]`;
  const expansion = '"state":"instant","description":"Face2-test POST"';
  await openAddEvent(page);
  await fillEventStep1(page, name, 'All Person', 'test', 'HTTP 命令');
  await next(page).click();
  await page.getByText('主機位址').first().waitFor();
  await page.waitForTimeout(1500);
  await page.locator('select:visible').filter({ has: page.locator('option', { hasText: 'POST' }) }).first().selectOption({ label: 'POST' });
  await page.waitForTimeout(800);
  const t = page.locator('input[type=text]:visible');
  await t.nth(0).fill(host);
  await t.nth(1).fill(env('E2E_NX_USER'));
  await page.locator('input[type=password]:visible').first().fill(env('E2E_NX_PASSWORD'));
  await t.nth(2).fill('7001');
  await t.nth(3).fill('rest/v4/events/generic');
  const areas = page.locator('textarea:visible');
  const n = await areas.count();
  console.log('SEED POST 版面的 textarea 數', n);
  await areas.nth(n - 2).fill(body);
  await areas.nth(n - 1).fill(expansion);
  await expect(next(page)).toBeEnabled();
  await next(page).click();
  await allWeekSchedule(page);
  await finish(page, name);
});

// I/O 接點事件與韋根事件：先用文件保留網段 192.0.2.x 的「佔位 IP」建立（沒有實體設備資訊），使用者拿到設備後把 IP 改成實際位址。
// 事件的輸出接點 #1 啟用、觸發值 1、持續 3 秒；韋根資料格式 26-bit。建立後停用。
async function createHwEvent(page: Page, name: string, category: string, ip: string, fill: (p: Page) => Promise<void>) {
  await gotoEvents(page);
  await searchEvents(page, name);
  if ((await eventRow(page, name).count()) > 0) {
    console.log('SEED 已存在', name);
    return;
  }
  await openAddEvent(page);
  await fillEventStep1(page, name, 'All Person', 'test', category);
  await next(page).click();
  await page.waitForTimeout(2000);
  await page.locator('input[type=text]:visible').nth(0).fill(ip);
  await fill(page);
  await expect(next(page)).toBeEnabled();
  await next(page).click();
  await allWeekSchedule(page);
  await finish(page, name);
}
test('[SEED-EVT] 建立事件 IO-iobox-placeholder-IP', async ({ page }) => {
  test.skip(!!only && only !== 'IO-iobox-placeholder-IP', '只建指定事件');
  test.setTimeout(240000);
  await createHwEvent(page, 'IO-iobox-placeholder-IP', '輸入/輸出接點裝置', '192.0.2.60', async (p) => {
    await p.locator('select:visible').nth(2).selectOption({ label: '1' }); // 輸出接點 #1 觸發時的值
  });
});
test('[SEED-EVT] 建立事件 WG-wiegand-placeholder-IP', async ({ page }) => {
  test.skip(!!only && only !== 'WG-wiegand-placeholder-IP', '只建指定事件');
  test.setTimeout(240000);
  await createHwEvent(page, 'WG-wiegand-placeholder-IP', '韋根轉換器', '192.0.2.61', async (p) => {
    await p.locator('select:visible').first().selectOption({ label: '26-bit' });
  });
});
