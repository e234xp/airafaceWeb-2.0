// 打開以前的報告壓縮檔：列出清單讓你選，解壓到暫存資料夾，再用 playwright show-report 開啟。
// 用法：
//   npm run e2e:report:old          列出清單，輸入編號（直接 Enter 開最新的）
//   npm run e2e:report:old -- 2     直接開第 2 新的
// 整批執行的壓縮檔裡有好幾組報告（html-devices、html-reports…），選完壓縮檔後會再問要看哪一組。
// 壓縮檔放在 e2e/reports/archive，可用環境變數 REPORT_ARCHIVE_DIR 改。
const fs = require('fs');
const os = require('os');
const net = require('net');
const path = require('path');
const readline = require('readline/promises');
const { spawn, execFileSync } = require('child_process');
const { ARCHIVE_NAME, DEFAULT_ARCHIVE_DIR, systemTar } = require('./archive-report.cjs');

const archiveDir = process.env.REPORT_ARCHIVE_DIR || DEFAULT_ARCHIVE_DIR;

/** 讓使用者從清單選一項；直接 Enter 選第一項。 */
async function askChoice(question, labels, preselected) {
  if (preselected && labels[Number(preselected) - 1]) return Number(preselected) - 1;
  labels.forEach((label, index) => console.log(`  ${index + 1}. ${label}`));
  const readlineInterface = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = (await readlineInterface.question(`${question}輸入 1 ～ ${labels.length}（Enter 開第一個）：`)).trim();
  readlineInterface.close();
  const index = (answer ? Number(answer) : 1) - 1;
  if (!labels[index]) {
    console.log('編號不對。');
    process.exit(1);
  }
  return index;
}

/** 向系統要一個沒被占用的連接埠（Playwright 預設的 9323 可能已經有另一份報告開著）。 */
const findFreePort = () =>
  new Promise((resolve) => {
    const server = net.createServer();
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });

function extractZip(zipFile, targetDir) {
  try {
    execFileSync('unzip', ['-q', '-o', zipFile, '-d', targetDir], { stdio: 'ignore' });
  } catch (error) {
    execFileSync(systemTar, ['-x', '-f', zipFile, '-C', targetDir], { stdio: 'ignore' }); // Windows 內建 tar
  }
}

(async () => {
  const archives = fs.existsSync(archiveDir) ? fs.readdirSync(archiveDir).filter((name) => ARCHIVE_NAME.test(name)).sort().reverse() : [];
  if (archives.length === 0) {
    console.log(`${archiveDir} 裡沒有報告壓縮檔，先跑一次測試。`);
    return;
  }

  const archiveLabels = archives.map((name, index) => {
    const [, year, month, day, hour, minute, second] = name.match(/^(\d{4})-(\d{2})-(\d{2})_(\d{2})(\d{2})(\d{2})/);
    const sizeMb = (fs.statSync(path.join(archiveDir, name)).size / 1024 / 1024).toFixed(1);
    return `${year}-${month}-${day} ${hour}:${minute}:${second}（${sizeMb} MB）${index === 0 ? '  ← 最新' : ''}`;
  });
  const archiveName = archives[await askChoice('要打開哪一次的報告？', archiveLabels, process.argv[2])];

  const extractedDir = path.join(os.tmpdir(), 'playwright-old-report', archiveName.replace(/\.zip$/, ''));
  if (!fs.existsSync(extractedDir)) {
    fs.mkdirSync(extractedDir, { recursive: true });
    extractZip(path.resolve(archiveDir, archiveName), extractedDir);
  }

  // 壓縮檔裡每個有 index.html 的資料夾就是一份報告；整批執行會有好幾份（每組一份）
  const reportFolders = fs.readdirSync(extractedDir).filter((name) => fs.existsSync(path.join(extractedDir, name, 'index.html')));
  if (reportFolders.length === 0) {
    console.log(`壓縮檔裡找不到報告（index.html）：${archiveName}`);
    return;
  }
  const reportName = reportFolders.length === 1 ? reportFolders[0] : reportFolders[await askChoice('這次執行有多份報告，要看哪一份？', reportFolders)];

  const port = await findFreePort();
  console.log(`打開 ${archiveName} 的 ${reportName}；看完按 Ctrl + C 結束。`);
  // 直接用目前的 node 執行 Playwright 的程式入口，不經過 shell／npx（Windows 的 .cmd 要靠 shell 才能執行，但帶參數用 shell 會有安全警告）
  const child = spawn(process.execPath, [require.resolve('@playwright/test/cli'), 'show-report', path.join(extractedDir, reportName), '--port', String(port)], { stdio: 'inherit' });
  child.on('exit', (code) => process.exit(code ?? 0));
})();
