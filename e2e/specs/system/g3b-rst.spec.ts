import { test, expect, Page } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { csvAnnotations } from '../../helpers/csvSource';
import { adminCredentials, fillCredentials, loginForm, openLoginPage } from '../../helpers/auth';
import { readAllRows } from '../../helpers/tables';
import { gotoCameras } from '../../helpers/cameras';
import { gotoPersons } from '../../helpers/persons';

// 來源 E2E-TEST-PLAN.md：RST-001（重啟服務）、RST-002（重新開機）。使用者於 2026-10-12 同意中斷服務與重開機（不含系統重設）。
// 以 ssh 125（金鑰登入、唯讀）觀察程序 PID／開機時間；RST-003（系統重設）不在此檔，沒有執行。
const ssh = (cmd: string, timeout = 30000) => execFileSync('ssh', ['-o', 'BatchMode=yes', '-o', 'ConnectTimeout=8', '125', cmd], { encoding: 'utf8', timeout });
const sshTry = (cmd: string) => {
  try {
    return ssh(cmd, 15000);
  } catch {
    return '';
  }
};
const obs = (s: string) => {
  console.log('OBS', s);
  test.info().annotations.push({ type: '觀察', description: s });
};
const NAMES = ['dataService', 'mainService', 'reportService', 'sysServer', 'mediamtx', 'mediaConnector'];
const pids = () => {
  const rows = sshTry('ps -eo pid,ppid,comm --no-headers').trim().split('\n').map((l) => l.trim().split(/\s+/));
  const res: Record<string, string> = {};
  for (const n of NAMES) res[n] = rows.filter((r) => r[2] === n && r[1] !== '1').map((r) => r[0]).sort().join(',');
  return res;
};
async function relogin(page: Page) {
  const { username, password } = adminCredentials();
  await openLoginPage(page);
  await loginForm(page).language.selectOption('zh');
  await loginForm(page).mode.selectOption('Setting');
  await fillCredentials(page, username, password);
  await loginForm(page).loginButton.click();
  await expect(page).not.toHaveURL(/login/, { timeout: 60000 });
  await page.locator('.c-sidebar').first().waitFor({ state: 'attached' });
}
async function newRecords(page: Page, sinceMs: number) {
  return page.evaluate(async (since) => {
    const el = Array.from(document.querySelectorAll('*')).find((x) => (x as unknown as { __vue__?: unknown }).__vue__) as any;
    const root = el.__vue__.$root;
    const q = { start_time: since, end_time: Date.now(), slice_length: 8000, slice_shift: 0, uuid_list: [], with_image: false, merged: false, keyword: '', groups: [], source: [], temperature: 'ALL' };
    const s = (await root.$globalGetStrangerResult(q)).data.result.data.length;
    const p = (await root.$globalGetPersonResult(q)).data.result.data.length;
    return { strangers: s, persons: p };
  }, sinceMs);
}
async function functionalCheck(page: Page) {
  const out: Record<string, number> = {};
  await gotoCameras(page);
  out.cameras = (await readAllRows(page, false)).length;
  await gotoPersons(page);
  out.persons = (await readAllRows(page, false)).length;
  return out;
}

test(
  '[RST-001] 重啟服務：重新執行並被系統自動登出，重新開啟 client 可正常使用所有功能',
  {
    annotation: csvAnnotations({ row: 191, no: '11.9', category: '系統重設 > 重啟服務', steps: '點選重啟服務會重新執行', expected: '重啟服務會被系統自動登出；ps aux | grep service，UI 按下 restart service 會 kill PID，UI 登出，重新開啟 client 應可正常使用所有功能' }),
  },
  async ({ page }) => {
    test.setTimeout(290000);
    await page.goto('/#/systemsettings/factorydefault');
    await page.reload();
    await page.getByRole('button', { name: '重啟服務' }).waitFor();
    const before = pids();
    const camsBefore = await functionalCheck(page);
    await page.goto('/#/systemsettings/factorydefault');
    await page.reload();
    await page.getByRole('button', { name: '重啟服務' }).click();
    await page.locator('.el-message-box__btns .el-button--primary, .swal2-confirm, .modal-footer .btn-primary').first().click();
    const t0 = Date.now();
    await expect(page, '重啟服務後沒有被自動登出').toHaveURL(/login/, { timeout: 120000 });
    obs(`按下重啟服務後 ${Math.round((Date.now() - t0) / 1000)} 秒被登出（回到登入頁）`);
    const changed = new Set<string>();
    for (let i = 0; i < 12; i += 1) {
      const now = pids();
      for (const k of Object.keys(before)) if (now[k] !== before[k] && now[k]) changed.add(k);
      if (changed.size >= 4) break;
      await page.waitForTimeout(5000);
    }
    obs(`重啟後 PID 有變動的程序：${[...changed].join('、') || '（無）'}；重啟前 ${JSON.stringify(before)}；重啟後 ${JSON.stringify(pids())}`);
    expect(changed.size, '按下重啟服務後服務程序的 PID 沒有改變（沒有被 kill 重啟）').toBeGreaterThan(0);
    await relogin(page);
    const after = await functionalCheck(page);
    obs(`重新登入後：攝影機 ${after.cameras} 台（重啟前 ${camsBefore.cameras}）、人員 ${after.persons} 位（重啟前 ${camsBefore.persons}）`);
    expect(after.cameras, '重新登入後攝影機清單與重啟前不同').toBe(camsBefore.cameras);
    expect(after.persons, '重新登入後人員清單與重啟前不同').toBe(camsBefore.persons);
    // 辨識寫入恢復
    const since = Date.now();
    await page.goto('/#/reports/investigation');
    await page.reload();
    await page.waitForTimeout(4000);
    let n = { strangers: 0, persons: 0 };
    for (let i = 0; i < 10 && n.strangers + n.persons === 0; i += 1) {
      await page.waitForTimeout(15000);
      n = await newRecords(page, since);
    }
    obs(`重新登入後 2.5 分鐘內新增辨識紀錄：陌生人 ${n.strangers}、人員 ${n.persons}`);
    expect(n.strangers + n.persons, '重啟服務後辨識紀錄沒有恢復寫入').toBeGreaterThan(0);
  },
);

test(
  '[RST-002] 重新開機：電腦重開，重開後 service 正常，辨識與調查寫入正常，I/O 連線狀態正常',
  {
    annotation: [
      ...csvAnnotations({ row: 192, no: '', category: '（延續）> 重新開機', steps: '點選重新開機電腦重開，重開後 server 正常', expected: '重新開機會將系統重新啟動；重開後 service 正常，辨識與調查寫入正常，I/O 連線狀態正常' }),
      { type: '判定範圍', description: 'I/O 連線狀態：環境沒有 I/O 設備（IO-001 受阻），本項不驗；其餘（開機時間重置、六個服務 active、前端可重新登入、辨識與調查紀錄恢復寫入）都驗' },
    ],
  },
  async ({ page }) => {
    test.setTimeout(290000);
    await page.goto('/#/systemsettings/factorydefault');
    await page.reload();
    await page.getByRole('button', { name: '重新開機' }).waitFor();
    const bootBefore = ssh('uptime -s').trim();
    obs(`重開前開機時間 ${bootBefore}`);
    await page.getByRole('button', { name: '重新開機' }).click();
    await page.locator('.el-message-box__btns .el-button--primary, .swal2-confirm, .modal-footer .btn-primary').first().click();
    const t0 = Date.now();
    let down = 0;
    let up = 0;
    for (let i = 0; i < 50; i += 1) {
      await page.waitForTimeout(5000);
      const out = sshTry('uptime -s').trim();
      if (!out && !down) down = Date.now();
      if (out && out !== bootBefore) {
        up = Date.now();
        break;
      }
    }
    obs(`主機中斷約 ${down ? Math.round((down - t0) / 1000) : '?'} 秒後離線，約 ${up ? Math.round((up - t0) / 1000) : '>250'} 秒後 SSH 恢復`);
    expect(up, '重新開機後 SSH 沒有在時限內恢復').toBeGreaterThan(0);
    const bootAfter = ssh('uptime -s').trim();
    expect(bootAfter, '開機時間沒有改變，主機沒有重開').not.toBe(bootBefore);
    // 服務
    let states = '';
    for (let i = 0; i < 12; i += 1) {
      states = sshTry('for s in data main media mediamtx report system; do echo "$s=$(systemctl is-active face.$s.service)"; done | tr "\n" " "').trim();
      if (!/inactive|failed|activating/.test(states) && states) break;
      await page.waitForTimeout(5000);
    }
    obs(`開機後服務狀態：${states}`);
    expect(states, '重開後有服務不是 active').not.toMatch(/inactive|failed|activating/);
    // 前端
    await expect.poll(async () => (await page.request.get('/').catch(() => null))?.status() ?? 0, { timeout: 60000, message: '重開後網站沒有恢復' }).toBe(200);
    await relogin(page);
    const since = Date.now();
    const f = await functionalCheck(page);
    obs(`重新登入後：攝影機 ${f.cameras} 台、人員 ${f.persons} 位`);
    expect(f.cameras).toBe(10);
    expect(f.persons).toBe(20);
    await page.goto('/#/reports/investigation');
    await page.reload();
    await page.waitForTimeout(4000);
    let n = { strangers: 0, persons: 0 };
    for (let i = 0; i < 8 && n.strangers + n.persons === 0; i += 1) {
      await page.waitForTimeout(15000);
      n = await newRecords(page, since);
    }
    obs(`重新登入後新增辨識紀錄：陌生人 ${n.strangers}、人員 ${n.persons}`);
    expect(n.strangers + n.persons, '重開後辨識與調查紀錄沒有恢復寫入').toBeGreaterThan(0);
  },
);
