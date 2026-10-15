import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { csvAnnotations } from '../../helpers/csvSource';

// 來源 E2E-TEST-PLAN.md：SVC-002、DIAG-008（Diagnose 會重啟服務）。使用者於 2026-10-12 同意測試期間中斷服務。
// 做法：ssh 125 讀各服務程序 PID（唯讀，不使用 sudo），在網頁按 Diagnose，每 5 秒比對，哪些 PID 變了就是哪些重啟。
const ssh = (cmd: string) => execFileSync('ssh', ['-o', 'BatchMode=yes', '-o', 'ConnectTimeout=10', '125', cmd], { encoding: 'utf8', timeout: 30000 });
const NAMES = ['dataService', 'mainService', 'reportService', 'sysServer', 'mediamtx'];
const pids = () => {
  const out = ssh('ps -eo pid,ppid,comm --no-headers');
  const rows = out.trim().split('\n').map((l) => l.trim().split(/\s+/));
  const res: Record<string, string> = {};
  for (const n of NAMES) res[n] = rows.filter((r) => r[2] === n && r[1] !== '1' ? true : false).map((r) => r[0]).sort().join(',');
  res.mediaConnector = rows.filter((r) => r[2] === 'mediaConnector').map((r) => r[0]).sort().join(',');
  return res;
};
const obs = (s: string) => {
  console.log('OBS', s);
  test.info().annotations.push({ type: '觀察', description: s });
};

test(
  '[SVC-002][DIAG-008] Diagnose：按下後 main.service 與 dataService／sysServer／mediaConnector 重啟',
  {
    annotation: [
      ...csvAnnotations({ row: 204, no: '', category: '（延續）> face.data.service', steps: 'systemctl status', expected: 'call 診斷 會 main.service restart' }),
      ...csvAnnotations({ row: 195, no: '', category: '（延續）> （空白）', steps: 'Diagnose 按鈕', expected: '點擊按鈕後，服務重啟（dataServer sysServer mediaConnector）' }),
    ],
  },
  async ({ page }) => {
    test.setTimeout(240000);
    await page.goto('/#/systemsettings/diagnose');
    await page.reload();
    const sel = page.locator('select');
    await expect(sel).toBeVisible();
    await page.waitForTimeout(3000);
    const opt = sel.locator('option', { hasText: process.env.DIAG_DEVICE ?? 'e2e-nx-in' }).first();
    await sel.selectOption((await opt.getAttribute('value')) ?? '');
    const btn = page.locator('button').filter({ hasText: /^\s*診斷\s*$/ }).first();
    await expect(btn).toBeEnabled();
    const before = pids();
    obs(`按下前 PID：${JSON.stringify(before)}`);
    await btn.click();
    const changed = new Set<string>();
    let last = before;
    for (let i = 0; i < 18; i += 1) {
      await page.waitForTimeout(5000);
      const now = pids();
      for (const k of Object.keys(before)) if (now[k] !== before[k]) changed.add(k);
      last = now;
    }
    obs(`按下後 90 秒內有變動的程序：${[...changed].join('、') || '（無）'}；之後 PID：${JSON.stringify(last)}`);
    expect.soft(changed.has('mainService'), 'SVC-002：按下 Diagnose 後 mainService 沒有重啟').toBe(true);
    for (const k of ['dataService', 'sysServer', 'mediaConnector']) expect.soft(changed.has(k), `DIAG-008：按下 Diagnose 後 ${k} 沒有重啟`).toBe(true);
  },
);
