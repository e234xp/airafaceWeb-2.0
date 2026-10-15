// 在測項上標註原始 CSV 來源，讓 Playwright HTML 報告可直接反查 CSV。
// CSV 列號 = 以 Excel 開啟 CSV 時看到的列號（表頭為第 1 列）。
export interface CsvSource {
  row: number; // CSV 列號
  no: string; // CSV「#」欄；延續列為空字串
  category: string; // 測試大類 > 項目
  steps: string; // CSV 原文：測試方法/步驟
  expected: string; // CSV 原文：預期結果
}

export function csvAnnotations(src: CsvSource) {
  return [
    { type: 'CSV來源', description: `第 ${src.row} 列｜#${src.no || '（空白，延續列）'}｜${src.category}` },
    { type: 'CSV步驟', description: src.steps },
    { type: 'CSV預期', description: src.expected },
  ];
}
