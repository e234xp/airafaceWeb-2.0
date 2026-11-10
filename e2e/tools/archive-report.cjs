// 把 Playwright 的 HTML 報告壓成帶日期的 zip，只留最新幾個，避免下一次執行把上一次的報告蓋掉。
// 由 run-case.cjs、run-parallel.cjs 在執行結束後呼叫；也可以單獨執行：
//   node e2e/tools/archive-report.cjs e2e/reports/html [e2e/reports/html-devices ...]
// 壓縮檔放在 e2e/reports/archive（e2e/reports 已在 .gitignore，不進版控）。
// 開啟舊報告：npm run e2e:report:old（見 open-report.cjs）。
// 設計參考 https://claude.ai/artifact/Q4U6tVkaCV3ZNokXpkhGar（已讀過程式碼，只用 Node 內建模組與系統 zip／tar），
// 差別：不寫成 Playwright reporter，而是在 runner 結束後呼叫，這樣不論用 --reporter 怎麼覆蓋都會執行。
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const DEFAULT_ARCHIVE_DIR = 'e2e/reports/archive';
const DEFAULT_KEEP = 5;
const DEFAULT_WARN_MB = 50;
// 只有符合這個名稱的檔案才會被當成舊報告清掉，不會誤刪放在同一個資料夾的其他東西
const ARCHIVE_NAME = /^\d{4}-\d{2}-\d{2}_\d{6}\.zip$/;

const pad2 = (value) => String(value).padStart(2, '0');

/** 時間轉成檔名用的字串，例如 2026-11-09_171838（本機時間）。 */
function stampOf(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}_${pad2(date.getHours())}${pad2(date.getMinutes())}${pad2(date.getSeconds())}`;
}

/**
 * 系統內建的 tar。Windows 要明確指定 System32 那支（bsdtar，能讀寫 zip）：
 * 在 Git Bash 裡直接叫 tar 會抓到 GNU tar，它不會寫 zip 格式。
 */
const systemTar = process.platform === 'win32' ? path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'tar.exe') : 'tar';

/**
 * 把 baseDir 底下的 folderNames 壓成 zipFile，zip 裡保留資料夾名稱（例如 html-devices/index.html）。
 * Mac／Linux 用 zip；沒有 zip（Windows）改用系統內建的 tar -a，它能直接寫 zip 格式。
 */
function zipFolders(baseDir, folderNames, zipFile) {
  try {
    execFileSync('zip', ['-qr', zipFile, ...folderNames], { cwd: baseDir, stdio: 'ignore' });
  } catch (error) {
    if (fs.existsSync(zipFile)) fs.rmSync(zipFile); // zip 失敗時可能留下半成品，換 tar 前先清掉
    execFileSync(systemTar, ['-a', '-c', '-f', zipFile, ...folderNames], { cwd: baseDir, stdio: 'ignore' });
  }
}

/**
 * 壓縮這一次執行產生的報告。
 * @param {string[]} reportDirs 報告資料夾（每個裡面要有 index.html）。必須在同一個上層資料夾底下。
 * @param {object} options
 * @param {Date} options.startedAt 這次執行開始的時間；報告的 index.html 比它舊，代表這次沒有重新產生（例如這組沒被執行），會略過。
 * @param {string} [options.archiveDir] 壓縮檔放哪裡
 * @param {number} [options.keep] 保留最新幾個壓縮檔
 * @param {number} [options.warnMb] 壓縮檔超過幾 MB 時提醒
 * @returns {string|null} 壓縮檔路徑；沒有可壓的報告或壓縮失敗回傳 null（失敗只印訊息，不影響測試結果）
 */
function archiveReports(reportDirs, { startedAt, archiveDir = DEFAULT_ARCHIVE_DIR, keep = DEFAULT_KEEP, warnMb = DEFAULT_WARN_MB } = {}) {
  const freshDirs = reportDirs.filter((dir) => {
    const indexFile = path.join(dir, 'index.html');
    if (!fs.existsSync(indexFile)) return false;
    return !startedAt || fs.statSync(indexFile).mtime >= startedAt;
  });
  if (freshDirs.length === 0) {
    console.log('\n沒有這次執行產生的 HTML 報告，不建立壓縮檔。');
    return null;
  }

  const parentDirs = new Set(freshDirs.map((dir) => path.dirname(path.resolve(dir))));
  if (parentDirs.size !== 1) {
    console.log('\n報告資料夾不在同一個上層資料夾，不建立壓縮檔。');
    return null;
  }
  const [baseDir] = [...parentDirs];

  fs.mkdirSync(archiveDir, { recursive: true });
  const zipFile = path.resolve(archiveDir, `${stampOf(startedAt || new Date())}.zip`);
  try {
    zipFolders(baseDir, freshDirs.map((dir) => path.basename(dir)), zipFile);
  } catch (error) {
    console.log(`\n報告壓縮失敗（${error.message}），HTML 報告仍在 ${freshDirs.join('、')}`);
    return null;
  }

  // 檔名開頭是日期時間，照字母排序就是由舊到新；超過保留數量的舊檔刪掉
  const archives = fs.readdirSync(archiveDir).filter((name) => ARCHIVE_NAME.test(name)).sort();
  for (const oldName of archives.slice(0, Math.max(archives.length - keep, 0))) fs.rmSync(path.join(archiveDir, oldName));

  const sizeMb = fs.statSync(zipFile).size / 1024 / 1024;
  console.log(`\n報告已壓縮：${path.relative(process.cwd(), zipFile)}（${sizeMb.toFixed(1)} MB，含 ${freshDirs.length} 份），只留最新 ${keep} 個`);
  if (sizeMb > warnMb) console.log(`注意：壓縮檔超過 ${warnMb} MB（主要是失敗測項的錄影與 trace）。`);
  return zipFile;
}

module.exports = { archiveReports, stampOf, systemTar, ARCHIVE_NAME, DEFAULT_ARCHIVE_DIR };

if (require.main === module) {
  const reportDirs = process.argv.slice(2);
  if (reportDirs.length === 0) {
    console.log('用法：node e2e/tools/archive-report.cjs <報告資料夾>...');
    process.exit(1);
  }
  archiveReports(reportDirs);
}
