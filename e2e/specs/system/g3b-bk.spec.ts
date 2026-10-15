import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { statSync, readFileSync } from 'node:fs';
import { csvAnnotations } from '../../helpers/csvSource';
import { TMP_DIR } from '../../helpers/files';

// 來源 E2E-TEST-PLAN.md：BK-001（產生備份檔並下載）。唯讀：不執行還原。
// 備份檔產生時產品會重啟服務（程式碼 CheckGenerateBackup restart:true），使用者已同意測試期間中斷服務。
const ssh = (cmd: string) => execFileSync('ssh', ['-o', 'BatchMode=yes', '-o', 'ConnectTimeout=10', '125', cmd], { encoding: 'utf8', timeout: 30000 });
const obs = (s: string) => {
  console.log('OBS', s);
  test.info().annotations.push({ type: '觀察', description: s });
};

test(
  '[BK-001] 備份：產生備份檔並下載',
  { annotation: csvAnnotations({ row: 165, no: '', category: '備份與還原 > 備份', steps: '1.可點選產生備份檔並下載', expected: '1.可產生備份檔並下載' }) },
  async ({ page }) => {
    test.setTimeout(280000);
    await page.goto('/#/systemsettings/backupandrestore');
    await page.reload();
    const gen = page.getByRole('button', { name: '產生備份檔' });
    await gen.waitFor();
    await page.waitForTimeout(2500);
    const before = ssh('stat -c "%Y %s" /home/aira/product/data/dbbak.zip 2>/dev/null || echo none').trim();
    obs(`產生前主機備份檔：${before}`);
    await gen.click();
    const t0 = Date.now();
    // 產生完成：畫面出現「資料庫備份時間」，且下載按鈕可用
    const dl = page.getByRole('button', { name: '下載' });
    await expect(page.getByText('資料庫備份時間').first(), '產生備份後畫面沒有出現備份時間').toBeVisible({ timeout: 200000 });
    await expect(dl).toBeEnabled({ timeout: 30000 });
    obs(`產生備份耗時約 ${Math.round((Date.now() - t0) / 1000)} 秒；畫面：${(await page.locator('body').innerText()).match(/資料庫備份時間\s*:?\s*[^\n]*/)?.[0] ?? ''}`);
    const after = ssh('stat -c "%Y %s" /home/aira/product/data/dbbak.zip 2>/dev/null || echo none').trim();
    obs(`產生後主機備份檔：${after}`);
    expect(after, '主機上的備份檔沒有更新').not.toBe(before);
    const [file] = await Promise.all([page.waitForEvent('download', { timeout: 120000 }), dl.click()]);
    const path = `${TMP_DIR}/backup-${Date.now()}.zip`;
    await file.saveAs(path);
    const size = statSync(path).size;
    const magic = readFileSync(path).subarray(0, 2).toString();
    let names = '';
    try {
      names = execFileSync('tar', ['-tf', path], { encoding: 'utf8' }).split('\n').filter(Boolean).slice(0, 25).join('、');
    } catch {
      names = '（無法列出內容）';
    }
    obs(`下載檔名 ${file.suggestedFilename()}、${size} bytes、檔頭 ${magic}；內容：${names}`);
    expect(size, '下載的備份檔是空的').toBeGreaterThan(1000);
    expect(magic, '下載的備份檔不是 zip').toBe('PK');
  },
);
