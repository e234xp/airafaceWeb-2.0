import { test, expect, Page } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { csvAnnotations } from '../../helpers/csvSource';
import { cameraRow, gotoCameras, nextBtn, searchCameras } from '../../helpers/cameras';

// 來源 E2E-TEST-PLAN.md：CAM-019（cameras.db 與前端一致）。需要 ssh 125（金鑰登入，唯讀；不使用 sudo）。
// 只對測試用攝影機 e2e-nx-in 改門檻再還原；不印出攝影機帳密。
const ssh = (cmd: string) => execFileSync('ssh', ['-o', 'BatchMode=yes', '-o', 'ConnectTimeout=10', '125', cmd], { encoding: 'utf8', timeout: 30000 });
const obs = (s: string) => {
  console.log('OBS', s);
  test.info().annotations.push({ type: '觀察', description: s });
};
const dbCamera = (name: string) => {
  const py = `import json;d=json.load(open('/home/aira/product/data/db/cameras.db'));c=[x for x in d if x['name']=='${name}'][0];print(json.dumps({k:c.get(k) for k in ['face_detection_score','target_score','face_min_length','capture_interval','antispoofing_score','verified_merge_setting','non_verified_merge_setting']}))`;
  return JSON.parse(ssh(`python3 -c "${py.replace(/"/g, '\\"')}"`).trim()) as Record<string, unknown>;
};
const apiCamera = (page: Page, name: string) =>
  page.evaluate(async (n) => {
    const el = Array.from(document.querySelectorAll('*')).find((e) => (e as unknown as { __vue__?: unknown }).__vue__) as any;
    const c = (await el.__vue__.$root.$globalFindCameras('', 0, 100)).data.list.find((x: any) => x.name === n);
    const o: Record<string, unknown> = {};
    for (const k of ['face_detection_score', 'target_score', 'face_min_length', 'capture_interval', 'antispoofing_score', 'verified_merge_setting', 'non_verified_merge_setting']) o[k] = c[k];
    return o;
  }, name);

async function editThreshold(page: Page, name: string, presses: number) {
  await gotoCameras(page);
  await searchCameras(page, name);
  await cameraRow(page, name).first().getByRole('button', { name: '編輯' }).click();
  await expect(page).toHaveURL(/modifyCameras/);
  await page.locator('input[type=text]:visible').first().waitFor();
  await page.waitForTimeout(2000);
  await nextBtn(page).click();
  await page.waitForTimeout(1500);
  await nextBtn(page).click();
  await page.getByText('最小人臉寬高').first().waitFor();
  await page.waitForTimeout(1000);
  const handle = page.locator('.el-slider__button-wrapper:visible').first();
  await handle.focus();
  const key = presses < 0 ? 'ArrowLeft' : 'ArrowRight';
  for (let i = 0; i < Math.abs(presses); i += 1) await page.keyboard.press(key);
  await page.waitForTimeout(500);
  const done = page.getByRole('button', { name: '完成' });
  for (let i = 0; i < 4 && !(await done.isVisible()); i += 1) {
    await nextBtn(page).click();
    await page.waitForTimeout(800);
  }
  await done.click();
  await page.waitForTimeout(3000);
}

test(
  '[CAM-019] 辨識門檻值：cameras.db 內參數與前端一致',
  { annotation: csvAnnotations({ row: 79, no: '', category: '（延續）> 辨識門檻值', steps: 'face_detection_score 參數變更: cat /home/aira/product/data/db/cameras.db', expected: 'cat /home/aira/product/data/db/cameras.db內之參數需與前端一致' }) },
  async ({ page }) => {
    test.setTimeout(280000);
    await page.goto('/#/reports/investigation');
    await page.reload();
    await page.waitForTimeout(4000);
    const name = 'e2e-nx-in';
    const before = await apiCamera(page, name);
    obs(`變更前 前端：face_detection_score=${before.face_detection_score}；cameras.db：${dbCamera(name).face_detection_score}`);
    expect(dbCamera(name), '變更前 cameras.db 與前端不一致').toEqual(before);
    const start = before.face_detection_score as number;
    let moved = 0;
    try {
      await editThreshold(page, name, -2);
      moved = -2;
      await page.goto('/#/reports/investigation');
      await page.reload();
      await page.waitForTimeout(4000);
      const api = await apiCamera(page, name);
      const db = dbCamera(name);
      obs(`拉桿往左 2 下：前端 face_detection_score ${start} → ${api.face_detection_score}；cameras.db：${db.face_detection_score}`);
      expect(db.face_detection_score, 'cameras.db 的 face_detection_score 沒有隨前端變更').not.toBe(start);
      expect(db, 'cameras.db 與前端回傳的辨識參數不一致').toEqual(api);
    } finally {
      if (moved !== 0) await editThreshold(page, name, -moved);
      await page.goto('/#/reports/investigation');
      await page.reload();
      await page.waitForTimeout(4000);
      obs(`已還原：cameras.db ${dbCamera(name).face_detection_score}（原值 ${start}）`);
      expect(dbCamera(name).face_detection_score, '還原後與原值不同').toBe(start);
    }
    // 其他攝影機：只比對，不修改
    const names = ['Camera-1', 'Camera-2', 'Camera-3', 'Camera-4', 'Camera-5', 'Camera-6', 'Camera-7', 'Camera-8', 'e2e-nx-out'];
    for (const n of names) expect.soft(dbCamera(n), `${n}：cameras.db 與前端不一致`).toEqual(await apiCamera(page, n));
  },
);

// ---- 資料保存（SYS-005、DIAG-016/019/020/021）：前端設定頁 vs 主機設定檔 system_settings.cfg、df -h、db 資料夾 ----
async function retentionUi(page: Page) {
  await page.goto('/#/systemsettings/generalsettings');
  await page.reload();
  await page.getByText('資料硬碟保存容量').first().waitFor();
  await page.waitForTimeout(2500);
  return page.evaluate(() => {
    const h = (t: string) => Array.from(document.querySelectorAll('h5')).find((x) => (x.textContent ?? '').includes(t));
    const sel = (t: string) => {
      const col = h(t)?.closest('.col-sm-3');
      const s = col?.querySelector('select') as HTMLSelectElement | null;
      return s ? { value: s.value, text: s.options[s.selectedIndex]?.text ?? '', options: Array.from(s.options).map((o) => o.text) } : null;
    };
    const disk = (h('資料硬碟保存容量')?.closest('.col-sm-3')?.querySelector('input') as HTMLInputElement | null)?.value ?? '';
    return { verified: sel('人員資料保存時長'), nonVerified: sel('陌生人資料保存時長'), disk };
  });
}
const cfg = () => JSON.parse(ssh('cat /home/aira/product/data/db/system_settings.cfg')).db as { verified_maintain_duration: number; non_verified_maintain_duration: number; maintain_disk_space_in_gb: number };
const dayMs = 86400000;

test.describe('資料保存與空間（SSH 對照）', () => {
  test('[DIAG-019] Data retention：retention 與設定值相同', {
    annotation: csvAnnotations({ row: 200, no: '', category: '（延續）> （空白）', steps: '1.設定Data retention: Maindisk space (GB):50 或是指定大小；NonVerifyResult default retained 7 day；PersonVerifyResult default retained 60 day', expected: '1.retention:是否與設定值相同' }),
  }, async ({ page }) => {
    test.setTimeout(120000);
    const ui = await retentionUi(page);
    const c = cfg();
    obs(`前端：人員 ${ui.verified?.text}、陌生人 ${ui.nonVerified?.text}、容量 ${ui.disk} GB；主機 system_settings.cfg：人員 ${c.verified_maintain_duration / dayMs} 天、陌生人 ${c.non_verified_maintain_duration / dayMs} 天、容量 ${c.maintain_disk_space_in_gb} GB`);
    expect(Number(ui.disk), '容量').toBe(c.maintain_disk_space_in_gb);
    expect(ui.verified?.text, '人員保存天數').toContain(String(c.verified_maintain_duration / dayMs));
    expect(ui.nonVerified?.text, '陌生人保存天數').toContain(String(c.non_verified_maintain_duration / dayMs));
    expect(c.maintain_disk_space_in_gb, '預設容量 50GB').toBe(50);
    expect(c.non_verified_maintain_duration, '陌生人預設 7 天').toBe(7 * dayMs);
    expect(c.verified_maintain_duration, '人員預設 60 天').toBe(60 * dayMs);
  });

  test('[DIAG-020] Data retention：df -h 檢查與設定一致', {
    annotation: csvAnnotations({ row: 200, no: '', category: '（延續）> （空白）', steps: '2.檢查df -h', expected: '2.檢查df -h是否與上面設定一致' }),
  }, async ({ page }) => {
    test.setTimeout(120000);
    const ui = await retentionUi(page);
    const df = ssh("df -BG --output=size,avail,pcent / | tail -1").trim();
    const [size, avail] = df.split(/\s+/).map((x) => parseInt(x, 10));
    obs(`df：總量 ${size} GB、可用 ${avail} GB；設定保留容量 ${ui.disk} GB`);
    expect(avail, '可用空間應不少於設定的保留容量').toBeGreaterThanOrEqual(Number(ui.disk));
  });

  test('[DIAG-021] Data retention：db 資料夾資料依保存時間刪除', {
    annotation: [
      ...csvAnnotations({ row: 200, no: '', category: '（延續）> （空白）', steps: '3.檢查db資料夾: summaryverifyresult、nonverifyresult/nonverifyresult photo、personverifyresult/personverifyresultphoto', expected: '是否有刪除且編輯時間與設定時間一樣' }),
      { type: '判定範圍', description: '只能驗「資料夾內沒有超過保存時間的檔案」；環境重灌後資料只有當天，無法觀察到過期刪除的動作' },
    ],
  }, async () => {
    test.setTimeout(120000);
    const c = cfg();
    const out = ssh(`cd /home/aira/product/data; for d in nonverifyresult nonverifyresultphoto personverifyresult personverifyresultphoto summaryverifyresult; do [ -d $d ] && echo "$d total=$(find $d -type f | wc -l) older_than_7d=$(find $d -type f -mtime +7 | wc -l) older_than_60d=$(find $d -type f -mtime +60 | wc -l) oldest=$(find $d -type f -printf '%TY-%Tm-%Td\n' | sort | head -1)"; done`);
    obs(out.trim().replace(/\n/g, '；'));
    const lines = out.trim().split('\n');
    for (const l of lines) {
      const m = /^(\S+) total=(\d+) older_than_7d=(\d+) older_than_60d=(\d+)/.exec(l);
      if (!m) continue;
      const isNon = m[1].startsWith('nonverify');
      expect.soft(Number(isNon ? m[3] : m[4]), `${m[1]} 有超過保存時間的檔案`).toBe(0);
    }
    expect(c.non_verified_maintain_duration).toBe(7 * dayMs);
  });
});

test('[TIME-001] 時間設置：系統與設備時間一致', {
  annotation: csvAnnotations({ row: 164, no: '', category: '時間設置', steps: '系統時間同步timedatectl', expected: '系統、設備時間確認一致；UI無設定區域，自動使用系統網路與時區 timedatectl' }),
}, async ({ page }) => {
  test.setTimeout(120000);
  const td = ssh('timedatectl show -p NTPSynchronized -p Timezone -p NTP --value | tr "\n" " "; date +%s').trim();
  const [tz, ntp, ntpSync, epoch] = td.split(/\s+/);
  obs(`主機 timedatectl：NTPSynchronized=${ntpSync}，Timezone=${tz}，NTP=${ntp}`);
  await page.goto('/#/systemsettings/timesettings');
  await page.reload();
  await page.getByText('裝置時間').first().waitFor();
  await page.waitForTimeout(10000);
  const txt = await page.locator('.h2').allInnerTexts();
  obs(`前端時間頁：${txt.join(' | ')}；時區下拉選到「${await page.locator('select:visible').first().locator('option:checked').innerText().catch(() => '')}」`);
  const hasInputs = (await page.locator('input[type=text]:visible').count()) + (await page.locator('select:visible').count());
  obs(`前端時間頁可操作的欄位數：${hasInputs}（規格預期 UI 無設定區域）`);
  const stamp = (t: string) => t.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)?.[0];
  const idxLocal = txt.findIndex((x) => x.includes('本地時間'));
  const idxDev = txt.findIndex((x) => x.includes('裝置時間'));
  const localShown = txt.slice(idxLocal + 1).map(stamp).find(Boolean);
  const devShown = txt.slice(idxDev + 1).map(stamp).find((x) => x && x !== localShown);
  obs(`本地時間 ${localShown ?? '（空）'}；裝置時間 ${devShown ?? '（空白）'}`);
  expect(ntpSync, '主機未與 NTP 同步').toBe('yes');
  expect(localShown, '前端沒有顯示本地時間').toBeTruthy();
  expect.soft(devShown, '前端「裝置時間」是空白，無法確認系統與設備時間一致').toBeTruthy();
  expect.soft(await page.locator('select:visible').first().locator('option:checked').innerText().catch(() => ''), '時區下拉顯示 undefined').not.toContain('undefined');
  if (devShown) expect(Math.abs(new Date(devShown.replace(' ', 'T')).getTime() / 1000 - Number(epoch)), '裝置時間與主機時間相差過大').toBeLessThan(120);
  expect.soft(hasInputs, '規格預期 UI 沒有時間設定區域，但前端有 NTP／時區設定欄位').toBe(0);
});

test('[CAM-010] 新增攝影機：deb 內 ffmpeg 正確安裝', {
  annotation: csvAnnotations({ row: 75, no: '', category: '新增攝影機', steps: '7.檢查deb 中ffmpeg 是否正確安裝 ( sudo apt install ffmpeg)', expected: '7.檢查deb 中ffmpeg 是否正確安裝 ( sudo apt install ffmpeg)' }),
}, async () => {
  const out = ssh('echo "which=$(which ffmpeg || echo none)"; dpkg -s ffmpeg 2>&1 | head -2; echo "deps:"; dpkg -s airaface | grep -i "^Depends" | cut -c1-300; echo "bundled:"; find /home/aira/product -iname "*ffmpeg*" -maxdepth 4 2>/dev/null | head -5; echo "mediaConnector libs:"; ldd /home/aira/product/sw/mediaConnector 2>/dev/null | grep -iE "av(codec|format|util)|ffmpeg" | head -5');
  obs(out.trim().replace(/\n/g, '；'));
  expect(out, 'ffmpeg 未安裝（which 找不到、dpkg 沒有 ffmpeg，且 airaface 套件未宣告依賴）').not.toMatch(/which=none[\s\S]*is not installed[\s\S]*deps:\s*\n\s*bundled:/);
});
