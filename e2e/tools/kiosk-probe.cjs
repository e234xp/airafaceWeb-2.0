// 診斷：自助報到看板在假攝影機下的攝影機／影片元素狀態。用法：node e2e/tools/kiosk-probe.cjs <file.mjpeg>
const { chromium } = require('@playwright/test');
const fs = require('fs');
const env = Object.fromEntries(fs.readFileSync('.env.e2e.local', 'utf8').split(/\r?\n/).filter((l) => l.includes('=') && !l.startsWith('#')).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]));
(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', `--use-file-for-fake-video-capture=${process.argv[2]}`] });
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true, baseURL: env.E2E_BASE_URL, storageState: 'e2e/.auth/admin.json', permissions: ['camera'] });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (/camera|media|stream|NotAllowed|NotFound|Overconstrained|decode/i.test(m.text())) console.log('CONSOLE', m.text().slice(0, 160)); });
  await page.goto('/#/selfcheckinmode');
  await page.reload();
  await page.waitForTimeout(8000);
  await page.locator('.qrcode-container').click();
  await page.waitForTimeout(8000);
  const r = await page.evaluate(async () => {
    const vids = Array.from(document.querySelectorAll('video')).map((v) => ({ w: v.videoWidth, h: v.videoHeight, paused: v.paused, ready: v.readyState, hasSrc: !!v.srcObject }));
    let devs = [];
    try { devs = (await navigator.mediaDevices.enumerateDevices()).map((d) => `${d.kind}:${d.label}`); } catch (e) { devs = [String(e)]; }
    const all = Array.from(document.querySelectorAll('*'));
    let sel = null; let err = null; let step = null;
    for (const e of all) { const vm = e.__vue__; if (vm && 'selectedCamera' in vm) { sel = vm.selectedCamera; err = vm.errMsg; step = vm.currentStep; break; } }
    let gum = '';
    try { const st = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } }); gum = 'ok ' + st.getVideoTracks()[0].label; st.getTracks().forEach((t) => t.stop()); } catch (e) { gum = 'ERR ' + e.name + ' ' + e.message; }
    return { sel, err, step, gum, secure: window.isSecureContext, vids, devs: devs.filter((d) => d.startsWith('videoinput')) };
  });
  console.log('KIOSK', JSON.stringify(r));
  await page.screenshot({ path: 'e2e/reports/tmp/kiosk-probe.png' });
  await browser.close();
})();
