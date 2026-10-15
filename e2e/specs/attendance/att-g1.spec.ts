import { test, expect, Page } from '@playwright/test';
import { csvAnnotations } from '../../helpers/csvSource';
import {
  DAY_ROUTE,
  Format,
  MONTH_ROUTE,
  applyExport,
  delimiterSelect,
  exportFields,
  openExportDialog,
  openReport,
  pagerTotal,
  typeSelect,
} from '../../helpers/attExport';
import { readAllRows } from '../../helpers/tables';

// 來源 E2E-TEST-PLAN.md；ATT 模組「部分自動化」中屬 G1（只讀）的項目（見 E2E-BATCH-PLAN.md）。
// 匯出類：以產品實際匯出的檔案解析驗證（格式、分隔符號、UTF-8、欄位與筆數）。下載檔可能是 zip，內含實際文件。
// 全程只讀，不產生任何資料。

const DAY_KEYS: Record<string, string> = { 人員編號: 'id', 人員姓名: 'name', 群組: 'group_list', 日期: 'timestamp', 上班時數: 'workingTime', 加班時數: 'overTime', 上班時間: 'clockinTime', 下班時間: 'clockoutTime' };

const CSV_EXPECTED = '1.根據設定格式: xlsx, txt, csv格式匯出正確資料\n2. 只有txt 可以選擇分隔符號\n3. 檔案匯出為 Unicode UTF-8 格式，現階段不提供對應OS的轉碼 (如轉成BIG-5等)';
const CSV_EXPECTED_MONTH = CSV_EXPECTED.replace('1.根據', '1. 詳細通行資料根據');

const delimiterChars: Array<{ value: string; label: string; chars: string[] }> = [
  { value: ',', label: 'comma (,)', chars: [','] },
  { value: 'T', label: 'tab (\\t)', chars: ['\t'] },
  { value: ';', label: 'semicolon (;)', chars: [';'] },
  { value: 'S', label: 'space (_)', chars: [' ', '_'] },
];

/** 匯出一次並驗證：欄位依勾選、筆數正確、UTF-8。回傳解析結果與勾選的欄位。 */
async function exportAndCheck(page: Page, route: string, format: Format, opts: { delimiter?: { value: string; chars: string[] }; uncheck: string[] }) {
  await openReport(page, route);
  const total = await pagerTotal(page);
  const uiRows = await readAllRows(page, true);
  const uiText = uiRows.join(' ');
  const modal = await openExportDialog(page);
  await typeSelect(modal).selectOption({ label: format });
  // 只有 txt 可以選擇分隔符號
  if (format === '.txt') await expect(delimiterSelect(modal)).toBeEnabled();
  else await expect.soft(delimiterSelect(modal), `${format} 時分隔符號仍可選擇（規格：只有 txt 可以選擇分隔符號）`).toBeDisabled();
  if (opts.delimiter) await delimiterSelect(modal).selectOption(opts.delimiter.value);
  const fields = await exportFields(modal);
  expect(fields.length).toBeGreaterThan(2);
  const boxes = modal.locator('input[type=checkbox]');
  // 取消勾選後，該欄位會被移到清單最後面（順序會變），因此每次都重新讀取目前順序再依名稱取消
  for (const label of opts.uncheck) {
    const now = await exportFields(modal);
    const idx = now.findIndex((f) => f.label === label && f.checked);
    if (idx >= 0) await boxes.nth(idx).uncheck();
  }
  const selected = fields.filter((f) => !opts.uncheck.includes(f.label)).map((f) => f.label);
  // 分隔符號：txt 以選定的符號切欄；試每個候選符號，取能切出「表頭欄位數 >= 勾選欄位數」者
  const candidates = opts.delimiter?.chars ?? [','];
  let file = await applyExport(page, modal, format, candidates[0]);
  for (const c of candidates.slice(1)) {
    if (file.rows[0] && file.rows[0].length >= selected.length) break;
    file = { ...file, rows: file.bytes.toString('utf8').split(/\r?\n/).filter(Boolean).map((l) => l.split(c).map((s) => s.replace(/^"|"$/g, ''))) };
  }
  return { file, total, selected, uiText };
}

test.describe('ATT（G1）', () => {
  const cases: Array<{ id: string; format: Format; route: string; row: number; no: string; cat: string; expected: string; scope: string }> = [
    { id: 'ATT-004', format: '.xlsx', route: DAY_ROUTE, row: 17, no: '3.2', cat: '（延續）> 匯出', expected: CSV_EXPECTED, scope: '日出勤' },
    { id: 'ATT-006', format: '.csv', route: DAY_ROUTE, row: 17, no: '3.2', cat: '（延續）> 匯出', expected: CSV_EXPECTED, scope: '日出勤' },
    { id: 'ATT-014', format: '.xlsx', route: MONTH_ROUTE, row: 20, no: '3.5', cat: '（延續）> 匯出', expected: CSV_EXPECTED_MONTH, scope: '月出勤' },
    { id: 'ATT-016', format: '.csv', route: MONTH_ROUTE, row: 20, no: '3.5', cat: '（延續）> 匯出', expected: CSV_EXPECTED_MONTH, scope: '月出勤' },
  ];
  for (const c of cases) {
    test(
      `[${c.id}] ${c.scope}匯出：${c.format.slice(1)} 格式`,
      {
        annotation: [
          ...csvAnnotations({ row: c.row, no: c.no, category: `${c.scope} > ${c.cat}`, steps: '1.根據設定匯出文件，看看是否符合設定條件\n2.檢查下載檔案、excel內容', expected: c.expected }),
          { type: '判定範圍', description: '「excel 開啟 UTF-8 會亂碼」為規格註記、未定義判定，不納入；以「檔案可用嚴格 UTF-8 解碼」判定第 3 點；每次匯出另取消勾選 2 個欄位，驗證「根據設定」' },
        ],
      },
      async ({ page }) => {
        test.setTimeout(180000);
        const uncheck = c.scope === '日出勤' ? ['群組', '加班時數'] : ['群組', '加班時數'];
        const { file, total, selected } = await exportAndCheck(page, c.route, c.format, { uncheck });
        test.info().annotations.push({ type: '觀察', description: `下載檔名 ${file.zipName}（內含 ${file.innerName}）；表頭：${file.rows[0]?.join(' ｜ ')}` });
        expect(file.utf8Ok, '檔案不是有效的 UTF-8').toBe(true);
        const header = file.rows[0] ?? [];
        const dataCols = header.filter((h) => h !== 'No' && h !== '');
        expect(dataCols.length, `表頭 ${header.join(',')} 與勾選的 ${selected.length} 個欄位不符`).toBe(selected.length);
        // xlsx 的表頭是畫面上的中文欄位名稱；txt／csv 的表頭是欄位代碼（日出勤才有對照表）
        if (c.format === '.xlsx' || c.scope === '日出勤') {
          // xlsx 表頭把「上班時間」寫成「打卡時間」（畫面與檔案的欄位名稱不一致，列為觀察）
          const name = (label: string) => (c.format === '.xlsx' ? label : DAY_KEYS[label]);
          const present = (label: string) => header.includes(name(label)) || (c.format === '.xlsx' && label === '上班時間' && header.includes('打卡時間'));
          for (const label of selected) expect.soft(present(label), `勾選的欄位「${label}」沒有出現在匯出表頭（${header.join('、')}）`).toBe(true);
          for (const label of uncheck) expect.soft(present(label), `取消勾選的欄位「${label}」仍被匯出（${header.join('、')}）`).toBe(false);
        }
        expect(file.rows.length - 1, '匯出筆數與清單筆數不符').toBe(total);
      },
    );
  }

  test(
    '[ATT-005] 日出勤匯出：txt 格式（可選分隔符號）',
    {
      annotation: [
        ...csvAnnotations({ row: 17, no: '3.2', category: '日出勤 > （延續）> 匯出', steps: '1.根據設定匯出文件，看看是否符合設定條件\n2.檢查下載檔案、excel內容', expected: CSV_EXPECTED }),
        { type: '判定範圍', description: '逐一選擇 comma、tab、semicolon、space 四種分隔符號匯出，檢查欄位以該符號分隔；「customize (TBD)」未測（規格未定義）' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(300000);
      for (const d of delimiterChars) {
        const { file, selected } = await exportAndCheck(page, DAY_ROUTE, '.txt', { delimiter: d, uncheck: ['群組'] });
        expect(file.utf8Ok).toBe(true);
        const header = file.rows[0] ?? [];
        expect(header.length, `分隔符號 ${d.label}：表頭無法依該符號切成 ${selected.length + 1} 欄（${header.join('|')}）`).toBeGreaterThanOrEqual(selected.length);
      }
    },
  );

  test(
    '[ATT-015] 月出勤匯出：txt 格式（可選分隔符號）',
    {
      annotation: [
        ...csvAnnotations({ row: 20, no: '3.5', category: '（延續）> 匯出', steps: '1.根據設定匯出文件，看看是否符合設定條件\n2.檢查下載檔案、excel內容', expected: CSV_EXPECTED_MONTH }),
        { type: '判定範圍', description: '逐一選擇 comma、tab、semicolon、space 四種分隔符號匯出，檢查欄位以該符號分隔；「customize (TBD)」未測' },
      ],
    },
    async ({ page }) => {
      test.setTimeout(300000);
      for (const d of delimiterChars) {
        const { file, selected } = await exportAndCheck(page, MONTH_ROUTE, '.txt', { delimiter: d, uncheck: ['群組'] });
        expect(file.utf8Ok).toBe(true);
        const header = file.rows[0] ?? [];
        expect(header.length, `分隔符號 ${d.label}：表頭無法依該符號切成 ${selected.length + 1} 欄（${header.join('|')}）`).toBeGreaterThanOrEqual(selected.length);
      }
    },
  );
});
