// 取證腳本（不是測項）：為尚未完成判定的項目（ATT-001、ATT-003）擷取畫面，供使用者確認。
// 使用：node e2e/tools/capture-evidence.mjs（需先執行過 admin-session 專案以產生 e2e/.auth/admin.json）
// 注意：為了標出特殊色塊，會在截圖前對頁面加上紅框（只改本機畫面，不改資料）。
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

process.loadEnvFile('.env.e2e.local');
const out = (id, name) => {
  mkdirSync(`e2e/evidence/${id}`, { recursive: true });
  return `e2e/evidence/${id}/${name}.png`;
};

const browser = await chromium.launch();
const ctx = await browser.newContext({
  ignoreHTTPSErrors: true,
  baseURL: process.env.E2E_BASE_URL,
  storageState: 'e2e/.auth/admin.json',
  viewport: { width: 1600, height: 1000 },
});
const page = await ctx.newPage();

await page.goto('/#/attendance/persondailyattendancereport');
await page.reload();
await page.locator('.vxe-table--body-wrapper tbody tr').first().waitFor();
await page.waitForTimeout(1500);

// ATT-003：載入後的 filter 列（按鈕停用狀態）
await page.locator('button', { hasText: '全部 :' }).first().scrollIntoViewIfNeeded();
const bar = page.locator('button', { hasText: '全部 :' }).first().locator('xpath=ancestor::div[2]');
await bar.screenshot({ path: out('ATT-003', '01-載入後的filter列') }).catch(async () => {
  await page.screenshot({ path: out('ATT-003', '01-載入後的filter列') });
});
await page.screenshot({ path: out('ATT-003', '02-整頁') });

// ATT-001：整頁，並用紅框標出「不在規格四色內」的色塊（淡紫、淡藍）
await page.evaluate(() => {
  const spec = ['rgb(255, 255, 255)', 'rgb(87, 189, 55)'];
  const wrap = document.querySelector('.vxe-table--body-wrapper');
  if (!wrap) return;
  wrap.querySelectorAll('div').forEach((el) => {
    const bg = getComputedStyle(el).backgroundColor;
    if (bg !== 'rgba(0, 0, 0, 0)' && el.children.length === 0 && el.innerText.trim() === '' && !spec.includes(bg)) {
      el.style.outline = '3px solid red';
    }
  });
});
await page.screenshot({ path: out('ATT-001', '01-日出勤頁（紅框＝不在規格白綠色內的色塊）') });
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.screenshot({ path: out('ATT-001', '02-頁面下半部') });

await browser.close();
console.log('done');
