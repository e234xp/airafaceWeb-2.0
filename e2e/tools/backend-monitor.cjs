// 完整測試期間監看後端（以及和後端不同台時的前端）：每隔幾秒打一次不用登入的 /system/systeminfo，記下「後端沒回應」的時段與版本號變化。
// 為什麼需要：2026-11-10 的完整測試跑到一半，有人在 14.21 停掉全部服務並部署新版（18:17:28 停、18:20:47 啟動），
// 那段時間 15 項失敗、reports 組登入失敗而整組沒跑。測試工具當下只看得到逾時與「帳號或密碼錯誤」彈窗，
// 看不出其實是後端不在，事後才從 14.21 的系統紀錄查出原因。有了這份監看，結束摘要會直接寫出後端停擺的時段。
// 限制：只看得出「沒回應」與「版本變了」，看不出是誰、為什麼重啟；那部分仍要查設備上的系統紀錄（journalctl）。
const fs = require('fs');
const https = require('https');
const http = require('http');

/**
 * 找出這次測試實際連的後端位址。
 * 本機開發伺服器（localhost:8080）沒有轉發 API，前端是直接連 src/globalParams.js 的 TEST_HOST，
 * 所以 E2E_BASE_URL 是 localhost 時要改讀 TEST_HOST，打 localhost 量不到後端。
 * @param env 環境變數；E2E_BACKEND_URL 有設就以它為準。
 * @returns 後端的 origin（例如 https://192.168.14.21）；判斷不出來時回傳 null（呼叫端就不監看）。
 */
function backendOrigin(env) {
  try {
    if (env.E2E_BACKEND_URL) return new URL(env.E2E_BACKEND_URL).origin;
    if (!env.E2E_BASE_URL) return null;
    const base = new URL(env.E2E_BASE_URL);
    if (!['localhost', '127.0.0.1', '[::1]'].includes(base.hostname)) return base.origin;
    const source = fs.readFileSync('src/globalParams.js', 'utf8');
    // 只取沒被註解掉的那一行（檔案裡有好幾行被 // 註解的候選位址）
    const host = (/^const TEST_HOST = '([^']+)'/m.exec(source) || [])[1];
    const port = (/^const TEST_PORT = '([^']*)'/m.exec(source) || [])[1];
    if (!host) return null;
    return `${base.protocol}//${host}${port ? `:${port}` : ''}`;
  } catch {
    return null;
  }
}

/** 打一次後端的 /system/systeminfo。回傳 { ok: true, version } 或 { ok: false, reason }；不會丟出例外。 */
function probe(origin, timeoutMs) {
  return request(new URL('/system/systeminfo', origin), 'POST', timeoutMs, (statusCode, body) => {
    try {
      const data = JSON.parse(body);
      if (statusCode === 200 && data.message === 'ok') return { ok: true, version: data.version || '' };
    } catch {
      /* 下面當成沒回應 */
    }
    return { ok: false, reason: `HTTP ${statusCode}` };
  });
}

/** 打一次前端首頁（GET）。有回應且不是 5xx 就算正常。 */
function probeFrontend(url, timeoutMs) {
  return request(new URL(url), 'GET', timeoutMs, (statusCode) => (statusCode < 500 ? { ok: true } : { ok: false, reason: `HTTP ${statusCode}` }));
}

/** 送出請求，用 judge(statusCode, body) 判斷結果；連不上或逾時回傳 { ok: false, reason }，不會丟出例外。 */
function request(url, method, timeoutMs, judge) {
  return new Promise((resolve) => {
    const lib = url.protocol === 'https:' ? https : http;
    // 測試機與開發伺服器都是自簽憑證，只對這一個請求關閉憑證檢查，不影響其他連線
    const req = lib.request(url, { method, headers: { 'Content-Type': 'application/json' }, rejectUnauthorized: false, timeout: timeoutMs }, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => resolve(judge(res.statusCode, body)));
    });
    req.on('timeout', () => req.destroy(new Error(`${timeoutMs / 1000} 秒沒回應`)));
    // 連 localhost 時 Node 會同時試 IPv4 與 IPv6，兩邊都被拒時丟出的錯誤 message 是空字串，所以改用錯誤代碼
    req.on('error', (error) => resolve({ ok: false, reason: error.message || error.code || '連線失敗' }));
    req.end(method === 'POST' ? '{}' : undefined);
  });
}

const timeText = (ms) => new Date(ms).toLocaleTimeString('zh-TW', { hour12: false });

/**
 * 開始監看。
 * @param origin 後端 origin（見 backendOrigin）。
 * @param frontendUrl 前端網址（E2E_BASE_URL）。和後端不同台時（例如本機開發伺服器）一併監看，
 *   因為開發伺服器停掉時後端照常，只看後端會誤報「一切正常」。和後端同一台就不用另外監看，傳 null。
 * @param intervalMs 多久打一次；預設 10 秒。
 * @returns stop()：停止監看並回傳 { downWindows: [{ target, fromMs, toMs, reason }], versionChanges: [{ atMs, from, to }], probes }；
 *   target 是「後端」或「前端」；toMs 為 null 表示到監看結束時仍沒回應。
 */
function startBackendMonitor(origin, { frontendUrl = null, intervalMs = 10000, timeoutMs = 5000 } = {}) {
  const downWindows = [];
  const frontDown = { current: null };
  const versionChanges = [];
  let lastVersion = null;
  let currentDown = null;
  let probes = 0;
  let busy = false;
  const tick = async () => {
    if (busy) return; // 上一次還沒回來（最多等 timeoutMs）就跳過這一輪，避免請求疊在一起
    busy = true;
    const now = Date.now();
    const result = await probe(origin, timeoutMs);
    probes += 1;
    if (frontendUrl) {
      const front = await probeFrontend(frontendUrl, timeoutMs);
      if (front.ok && frontDown.current) {
        frontDown.current.toMs = now;
        frontDown.current = null;
      } else if (!front.ok && !frontDown.current) {
        frontDown.current = { target: `前端 ${new URL(frontendUrl).origin}`, fromMs: now, toMs: null, reason: front.reason };
        downWindows.push(frontDown.current);
      }
    }
    if (result.ok) {
      if (currentDown) {
        currentDown.toMs = now;
        currentDown = null;
      }
      if (lastVersion !== null && result.version !== lastVersion) versionChanges.push({ atMs: now, from: lastVersion, to: result.version });
      lastVersion = result.version;
    } else if (!currentDown) {
      currentDown = { target: '後端', fromMs: now, toMs: null, reason: result.reason };
      downWindows.push(currentDown);
    }
    busy = false;
  };
  tick();
  const timer = setInterval(tick, intervalMs);
  return {
    stop() {
      clearInterval(timer);
      return { origin, frontendUrl, downWindows, versionChanges, probes, version: lastVersion };
    },
  };
}

/**
 * 把監看結果寫成摘要文字，並列出「結束時間落在停擺期間（含之後 3 分鐘）」的失敗測項。
 * 停擺結束後再多算 3 分鐘，是因為測項會在等待逾時（30～90 秒）後才記成失敗，結束時間會晚於後端恢復的時間。
 * @param summary startBackendMonitor().stop() 的回傳值。
 * @param failedTests 這次失敗的測項：[{ id, atMs }]，atMs 是該測項記錄失敗的時間。
 * @returns 要印出的多行文字。
 */
function describeMonitor(summary, failedTests) {
  const GRACE_MS = 3 * 60000;
  const front = summary.frontendUrl ? `、前端 ${new URL(summary.frontendUrl).origin}` : '';
  const lines = [`環境監看（後端 ${summary.origin}${front}，共檢查 ${summary.probes} 次，後端版本 ${summary.version || '未知'}）：`];
  if (!summary.downWindows.length && !summary.versionChanges.length) {
    lines.push(`  ✅ 測試期間${summary.frontendUrl ? '前端與' : ''}後端一直有回應，版本沒有變化`);
    return lines.join('\n');
  }
  for (const w of summary.downWindows) {
    const end = w.toMs === null ? '監看結束時仍沒回應' : timeText(w.toMs);
    const affected = failedTests.filter((t) => t.atMs >= w.fromMs && t.atMs <= (w.toMs === null ? Infinity : w.toMs + GRACE_MS)).map((t) => t.id);
    lines.push(`  ⚠️ ${w.target} 沒有回應：${timeText(w.fromMs)} ～ ${end}（${w.reason}）`);
    if (affected.length) lines.push(`     這段時間（含之後 3 分鐘）失敗的 ${affected.length} 項可能是${w.target.split(' ')[0]}停擺造成，建議重跑：${affected.join(' ')}`);
  }
  for (const c of summary.versionChanges) lines.push(`  ⚠️ 後端版本在 ${timeText(c.atMs)} 從 ${c.from} 變成 ${c.to}（測試中途有人部署，前後結果是不同版本）`);
  if (summary.downWindows.some((w) => w.target === '後端') || summary.versionChanges.length) lines.push('  要查後端是誰、為什麼停掉，請看設備上的系統紀錄，例如：journalctl --since "<開始時間>" --until "<結束時間>"');
  if (summary.downWindows.some((w) => w.target !== '後端')) lines.push('  前端沒有回應：確認本機開發伺服器（npm run serve）還在執行');
  return lines.join('\n');
}

module.exports = { backendOrigin, startBackendMonitor, describeMonitor };
