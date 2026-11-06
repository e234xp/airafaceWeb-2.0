// 檢查 E2E 腳本能不能對回 Google Sheet「已自動化」頁（測項 ID、腳本檔路徑是否一致）。只讀取，不修改任何東西。
//
// 追蹤方式：腳本的測試名稱開頭有測項 ID（例如 [MAIL-019]），Sheet「已自動化」頁第一欄也是同一個 ID。
//
// 用法：
//   1. 把 Sheet 的「已自動化」頁匯出成 JSON（欄位 A～J，含表頭）：
//        node .claude/skills/google-sheets-api/sheets-api.cjs read <試算表ID> "'頁籤名稱'!A1:J300" --out sheet-auto.json
//   2. node e2e/tools/check-sheet-trace.cjs sheet-auto.json
//
// 檢查項目：
//   1. 腳本有、Sheet 沒有的測項 ID（腳本沒有對應的 Sheet 列，驗收時追不回去）
//   2. Sheet 有、腳本沒有的測項 ID（Sheet 說已自動化，但找不到腳本）
//   3. 腳本檔路徑與 Sheet「E2E 腳本檔」欄不同
// 有任何一項不一致就以 exit code 1 結束。
const fs = require('fs');
const { spawnSync } = require('child_process');

const BACKSLASH = String.fromCharCode(92);
const TEST_ID_PATTERN = /\[([A-Z][A-Z0-9]*-\d+)\]/;
const SHEET_COLUMN = { id: 0, scriptFile: 7 };

/** 路徑統一用正斜線，Windows 與其他系統的寫法才能互相比對。 */
function normalizePath(filePath) {
  return String(filePath || '').split(BACKSLASH).join('/');
}

/**
 * 取得 Playwright 目前列出的所有測試。沒有測項 ID 的測試（例如登入前置步驟）不算。
 * @returns {{id: string, file: string}[]}
 */
function listScriptTests() {
  const result = spawnSync(process.execPath, [require.resolve('@playwright/test/cli'), 'test', '--list', '--reporter=json'], {
    env: { ...process.env, E2E_ALLOW_DIRECT: '1', E2E_INCLUDE_BOARDS: 'true' },
    maxBuffer: 256 * 1024 * 1024,
    encoding: 'utf8',
  });
  const report = JSON.parse(result.stdout);
  const tests = [];
  const visit = (suite) => {
    (suite.specs || []).forEach((spec) => {
      const idMatch = TEST_ID_PATTERN.exec(spec.title);
      if (idMatch) tests.push({ id: idMatch[1], file: normalizePath(spec.file) });
    });
    (suite.suites || []).forEach(visit);
  };
  (report.suites || []).forEach(visit);
  return tests;
}

/** 讀取「已自動化」頁匯出的 JSON，回傳每一項的測項 ID 與腳本檔。 */
function readSheetRows(jsonPath) {
  return JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    .slice(1)
    .filter((row) => row[SHEET_COLUMN.id])
    .map((row) => ({ id: row[SHEET_COLUMN.id], file: normalizePath(row[SHEET_COLUMN.scriptFile]) }));
}

function main() {
  const jsonPath = process.argv[2];
  if (!jsonPath) {
    console.error('用法：node e2e/tools/check-sheet-trace.cjs <Sheet 已自動化頁匯出的 json>');
    process.exit(2);
  }
  const sheetRows = readSheetRows(jsonPath);
  const scriptTests = listScriptTests();
  const testsById = new Map();
  scriptTests.forEach((test) => testsById.set(test.id, (testsById.get(test.id) || []).concat(test)));
  const sheetIds = new Set(sheetRows.map((row) => row.id));

  const scriptOnly = [...testsById.keys()].filter((id) => !sheetIds.has(id));
  const sheetOnly = sheetRows.map((row) => row.id).filter((id) => !testsById.has(id));
  const fileMismatch = [];
  sheetRows.forEach((sheetRow) => {
    const tests = testsById.get(sheetRow.id);
    // 同一個 ID 可能有多個測試（例如 MAIL-008），只要其中一個檔案對得上就算
    if (tests && !tests.some((test) => test.file === sheetRow.file)) {
      fileMismatch.push(`${sheetRow.id}：Sheet「${sheetRow.file}」，實際「${tests.map((test) => test.file).join('、')}」`);
    }
  });

  console.log(`Sheet「已自動化」${sheetRows.length} 項；腳本 ${testsById.size} 個不同的測項 ID（${scriptTests.length} 個測試）`);
  const sections = [
    ['腳本有、Sheet 沒有', scriptOnly],
    ['Sheet 有、腳本沒有', sheetOnly],
    ['腳本檔路徑與 Sheet 不一致', fileMismatch],
  ];
  let problemCount = 0;
  sections.forEach(([title, list]) => {
    problemCount += list.length;
    console.log(`\n${list.length === 0 ? '✅' : '❌'} ${title}：${list.length} 項`);
    list.slice(0, 40).forEach((item) => console.log('   - ' + item));
  });
  process.exit(problemCount === 0 ? 0 : 1);
}

main();
