// 停損記帳 reporter：每個 Test ID 累計「嘗試次數」與「累計耗時」，寫入 e2e/reports/budget.json。
// 配合 e2e/tools/run-case.cjs：達到上限（E2E_CASE_MAX_ATTEMPTS／E2E_CASE_STUCK_TIMEOUT_MINUTES）後拒絕再跑。
// 平行執行時多個 playwright 行程會同時寫入，這裡以鎖檔（budget.json.lock）確保「讀 → 改 → 寫」不互相覆蓋。
const fs = require('fs');
const FILE = 'e2e/reports/budget.json';
const LOCK = `${FILE}.lock`;

const load = () => {
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch {
    return {};
  }
};
const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
function withLock(fn) {
  fs.mkdirSync('e2e/reports', { recursive: true });
  let fd = -1;
  for (let i = 0; i < 200; i += 1) {
    try {
      fd = fs.openSync(LOCK, 'wx');
      break;
    } catch {
      try {
        if (Date.now() - fs.statSync(LOCK).mtimeMs > 10000) fs.unlinkSync(LOCK); // 殘留的舊鎖
      } catch { /* 忽略 */ }
      sleep(50);
    }
  }
  try {
    fn();
  } finally {
    if (fd >= 0) {
      fs.closeSync(fd);
      try { fs.unlinkSync(LOCK); } catch { /* 忽略 */ }
    }
  }
}

class BudgetReporter {
  onTestEnd(test, result) {
    const m = /^\[([A-Z0-9]+-\d+)\]/.exec(test.title);
    if (!m) return;
    if (result.status === 'skipped') return;
    withLock(() => {
      const db = load();
      const id = m[1];
      const e = db[id] || { attempts: 0, totalMs: 0, passed: false, history: [] };
      e.attempts += 1;
      e.totalMs += result.duration;
      e.passed = result.status === 'passed';
      e.history.push({ at: new Date().toISOString(), status: result.status, ms: result.duration });
      db[id] = e;
      fs.writeFileSync(FILE, JSON.stringify(db, null, 1));
    });
  }
}
module.exports = BudgetReporter;
