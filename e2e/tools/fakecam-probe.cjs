// 診斷：Chromium 假攝影機是否能播出含 QR 的 MJPEG。用法：node e2e/tools/fakecam-probe.cjs <file.mjpeg>
const { chromium } = require('@playwright/test');
(async () => {
  const file = process.argv[2];
  const browser = await chromium.launch({ args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', `--use-file-for-fake-video-capture=${file}`] });
  const ctx = await browser.newContext({ permissions: ['camera'] });
  const page = await ctx.newPage();
  await page.route('https://fake.test/', (r) => r.fulfill({ body: '<html><body></body></html>', contentType: 'text/html' }));
  await page.goto('https://fake.test/');
  const r = await page.evaluate(async () => {
    const out = {};
    try {
      const devs = await navigator.mediaDevices.enumerateDevices();
      out.devices = devs.map((d) => `${d.kind}:${d.label}`);
      for (const c of [{ video: true }, { video: { facingMode: 'user' } }, { video: { facingMode: 'environment' } }]) {
        try {
          const s = await navigator.mediaDevices.getUserMedia(c);
          const v = document.createElement('video');
          v.srcObject = s;
          v.muted = true;
          await v.play();
          await new Promise((r2) => setTimeout(r2, 1500));
          const cv = document.createElement('canvas');
          cv.width = v.videoWidth;
          cv.height = v.videoHeight;
          const g = cv.getContext('2d');
          g.drawImage(v, 0, 0);
          const d = g.getImageData(0, 0, cv.width, cv.height).data;
          let dark = 0;
          for (let i = 0; i < d.length; i += 4) if (d[i] < 80) dark += 1;
          out[JSON.stringify(c)] = `ok ${v.videoWidth}x${v.videoHeight} darkRatio=${(dark / (d.length / 4)).toFixed(2)} label=${s.getVideoTracks()[0].label}`;
          s.getTracks().forEach((t) => t.stop());
        } catch (e) {
          out[JSON.stringify(c)] = `ERR ${e.name}: ${e.message}`;
        }
      }
    } catch (e) {
      out.err = String(e);
    }
    return out;
  });
  console.log(JSON.stringify(r, null, 1));
  await browser.close();
})();
