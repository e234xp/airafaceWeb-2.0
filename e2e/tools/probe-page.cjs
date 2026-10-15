// 通用欄位探查：在寫測項之前，先把「新頁面／精靈」的欄位全部列出來（取代逐項試錯）。唯讀：不儲存、不送出。
// 用法：
//   npm run e2e:probe -- --route=outputdevice/ioboxsManagement --add        從列表按「新增」，逐步探查精靈
//   npm run e2e:probe -- --route=systemsettings/diagnose                    只探查該頁
//   npm run e2e:probe -- --route=notifications/mailnotify --add --fill       用測試字串填入文字欄位以便通過驗證進入下一步
// 選項：
//   --route=<路徑>   不含 /#/（避免 Git Bash 把以 / 開頭的參數轉成 Windows 路徑）
//   --add            先在列表頁按「新增」
//   --fill           文字欄位填入 e2e-probe 測試值（否則「下一步」常因必填而停用，探查會停在第 1 步）
//   --name=<檔名>    輸出檔名（預設由 route 產生）
// 安全規則：精靈的最後一個「下一步」（從倒數第二步到「完成」）會儲存，所以最多只按 N-2 次下一步，永遠不按「完成」「儲存變更」「註冊」。
// 輸出：e2e/reports/probe/<name>.md（每一步的欄位、下拉選項、勾選框、按鈕、驗證訊息、未翻譯鍵值）
const fs = require('fs');
const { chromium } = require('@playwright/test');
if (fs.existsSync('.env.e2e.local')) process.loadEnvFile('.env.e2e.local');
const arg = (k) => (process.argv.find((a) => a.startsWith(`--${k}=`)) || '').split('=').slice(1).join('=');
const flag = (k) => process.argv.includes(`--${k}`);
const route = arg('route');
if (!route) {
  console.error('需要 --route=<路徑>，例如 --route=outputdevice/ioboxsManagement');
  process.exit(2);
}
const name = arg('name') || route.replace(/[^a-zA-Z0-9]+/g, '-');

// 在頁面內執行：收集目前畫面所有可見欄位
const collect = () => {
  const vis = (e) => !!(e.offsetParent || e.getClientRects().length);
  // 標籤＝在文件順序上「最靠近且在欄位之前」的 label／標題元素
  const labels = Array.from(document.querySelectorAll('label, h5, h4, .h5, .col-form-label, th, legend')).filter((l) => vis(l) && l.innerText.trim() && !l.querySelector('input, select'));
  const labelOf = (e) => {
    // 版面常是「一排標籤、下一排欄位」：先以幾何位置找「正上方、水平重疊、最靠近」的標籤；找不到再退回文件順序
    const r = e.getBoundingClientRect();
    let above = null;
    let aboveBottom = -1;
    for (const l of labels) {
      if (l.contains(e)) continue;
      const q = l.getBoundingClientRect();
      if (q.bottom <= r.top + 6 && q.left < r.right && q.right > r.left && r.top - q.bottom < 90 && q.bottom > aboveBottom) {
        above = l;
        aboveBottom = q.bottom;
      }
    }
    if (above) return above.innerText.trim().replace(/\s+/g, ' ');
    let best = null;
    for (const l of labels) {
      if (l.contains(e)) continue;
      if (l.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_FOLLOWING) best = l;
      else break;
    }
    return best ? best.innerText.trim().replace(/\s+/g, ' ') : '';
  };
  const out = { inputs: [], selects: [], checks: [], multiselects: [], files: [], buttons: [], messages: [], untranslated: [], tableHeaders: [] };
  document.querySelectorAll('input, textarea').forEach((e) => {
    const t = e.type || 'text';
    if (t === 'checkbox' || t === 'radio') {
      out.checks.push({ label: labelOf(e) || (e.closest('label') ? e.closest('label').innerText.trim() : ''), type: t, checked: e.checked, disabled: e.disabled, visible: vis(e) || vis(e.parentElement) });
      return;
    }
    if (t === 'file') {
      out.files.push({ label: labelOf(e), accept: e.accept });
      return;
    }
    if (!vis(e)) return;
    if (e.closest('.multiselect')) return;
    out.inputs.push({ label: labelOf(e), type: t, value: t === 'password' ? '(密碼欄)' : e.value, placeholder: e.placeholder, disabled: e.disabled, required: e.required || e.classList.contains('is-invalid'), valid: e.classList.contains('is-valid') ? true : e.classList.contains('is-invalid') ? false : null });
  });
  document.querySelectorAll('select').forEach((e) => {
    if (!vis(e)) return;
    out.selects.push({ label: labelOf(e), value: e.value, disabled: e.disabled, options: Array.from(e.options).map((o) => `${o.text.trim()}=${o.value}`) });
  });
  document.querySelectorAll('.multiselect').forEach((e) => {
    if (!vis(e)) return;
    out.multiselects.push({ label: labelOf(e), selected: Array.from(e.querySelectorAll('.multiselect__tag')).map((x) => x.innerText.trim()), placeholder: (e.querySelector('.multiselect__placeholder') || {}).innerText });
  });
  document.querySelectorAll('button, input[type=button], a.btn').forEach((e) => {
    if (!vis(e)) return;
    const txt = (e.innerText || e.value || '').trim();
    if (txt) out.buttons.push(`${txt}${e.disabled ? '(停用)' : ''}`);
  });
  document.querySelectorAll('.invalid-feedback, .el-message, .swal2-popup, .text-danger').forEach((e) => {
    if (vis(e) && e.innerText.trim()) out.messages.push(e.innerText.trim().replace(/\s+/g, ' '));
  });
  document.querySelectorAll('th, .vxe-header--column').forEach((e) => {
    if (vis(e) && e.innerText.trim()) out.tableHeaders.push(e.innerText.trim().replace(/\s+/g, ' '));
  });
  const bodyText = document.body.innerText;
  (bodyText.match(/![A-Za-z_]+(?![A-Za-z_])|(?<![A-Za-z0-9])[a-z]+(?:_[a-z]+)+(?![A-Za-z0-9])/g) || []).forEach((k) => out.untranslated.push(k));
  out.untranslated = [...new Set(out.untranslated)];
  out.tableHeaders = [...new Set(out.tableHeaders)];
  out.buttons = [...new Set(out.buttons)];
  out.messages = [...new Set(out.messages)];
  out.text = bodyText.replace(/\s+/g, ' ').slice(0, 500);
  return out;
};

const fmt = (title, o) => {
  const L = [`### ${title}`, '', `畫面文字：${o.text}`, ''];
  const sec = (h, arr, f) => arr.length && L.push(`**${h}**`, ...arr.map(f), '');
  sec('文字／數字／密碼欄位', o.inputs, (x) => `- ${x.label || '(無標籤)'}｜${x.type}｜值「${x.value}」${x.placeholder ? `｜placeholder「${x.placeholder}」` : ''}${x.disabled ? '｜停用' : ''}${x.valid === false ? '｜驗證不通過' : x.valid ? '｜驗證通過' : ''}`);
  sec('下拉選單', o.selects, (x) => `- ${x.label || '(無標籤)'}｜目前「${x.value}」${x.disabled ? '｜停用' : ''}｜選項：${x.options.join('、')}`);
  sec('多選框（multiselect）', o.multiselects, (x) => `- ${x.label || '(無標籤)'}｜已選：${x.selected.join('、') || '無'}`);
  sec('勾選／開關', o.checks.filter((c) => c.visible), (x) => `- ${x.label || '(無標籤)'}｜${x.type}｜${x.checked ? '已勾選' : '未勾選'}${x.disabled ? '｜停用' : ''}`);
  sec('檔案上傳', o.files, (x) => `- ${x.label || '(無標籤)'}｜accept「${x.accept}」`);
  sec('表格欄位', o.tableHeaders, (x) => `- ${x}`);
  sec('按鈕', o.buttons, (x) => `- ${x}`);
  sec('驗證／提示訊息', o.messages, (x) => `- ${x}`);
  if (o.untranslated.length) L.push('**疑似未翻譯的鍵值**', ...o.untranslated.map((x) => `- ${x}`), '');
  return L.join('\n');
};

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true, baseURL: process.env.E2E_BASE_URL, storageState: 'e2e/.auth/admin.json' });
  const page = await ctx.newPage();
  const parts = [`# 欄位探查：${route}${flag('add') ? '（新增精靈）' : ''}`, '', `- 探查時間：${new Date().toISOString()}`, '- 唯讀：沒有按「完成」「儲存變更」「註冊」', ''];
  try {
    await page.goto(`/#/${route}`);
    await page.reload();
    await page.waitForTimeout(6000);
    parts.push(fmt('列表／頁面', await page.evaluate(collect)));
    if (flag('add')) {
      await page.getByRole('button', { name: '新增' }).first().click();
      await page.waitForTimeout(4000);
      const stepText = await page.locator('body').innerText();
      const m = /(\d)\s*完成/.exec(stepText);
      const total = m ? Number(m[1]) : 0;
      const maxClicks = total ? total - 2 : 0;
      parts.push(`- 步驟總數 ${total || '未偵測到'}；最多按「下一步」${maxClicks} 次（再下一次會儲存，不按）`, '');
      for (let step = 1; step <= Math.max(1, maxClicks + 1); step += 1) {
        if (flag('fill')) {
          const t = page.locator('input[type=text]:visible, input[type=password]:visible, textarea:visible');
          const n = await t.count();
          for (let i = 0; i < n; i += 1) {
            const el = t.nth(i);
            if ((await el.inputValue().catch(() => '')) === '' && (await el.isEnabled().catch(() => false))) await el.fill(i === 0 ? `e2e-probe-${Date.now().toString(36).slice(-4)}` : 'e2e-probe').catch(() => {});
          }
          await page.waitForTimeout(500);
        }
        parts.push(fmt(`第 ${step} 步`, await page.evaluate(collect)));
        if (step > maxClicks) break;
        const next = page.getByRole('button', { name: '下一步' });
        if (!(await next.isVisible()) || !(await next.isEnabled())) {
          parts.push(`> 第 ${step} 步的「下一步」${(await next.isVisible()) ? '停用（必填欄位未通過驗證；可加 --fill）' : '不存在'}，探查到此為止。`, '');
          break;
        }
        await next.click();
        await page.waitForTimeout(3000);
      }
    }
  } catch (e) {
    parts.push(`> 探查中斷：${String(e).slice(0, 200)}`);
  }
  fs.mkdirSync('e2e/reports/probe', { recursive: true });
  const file = `e2e/reports/probe/${name}.md`;
  fs.writeFileSync(file, parts.join('\n'));
  console.log(parts.join('\n').slice(0, 6000));
  console.log(`\n→ 完整輸出：${file}`);
  await browser.close();
})();
