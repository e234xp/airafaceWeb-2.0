import { test } from '@playwright/test';

// 骨架（自動產生）：來源 E2E-TEST-PLAN.md；模組 T980，共 10 個 Test ID。
// 目前全部為 test.fixme（尚未實作）。實作時不得改動 Test ID 與標題前綴；assertion 只能依 Plan 的預期結果。
// 注意：fixme 不等於「使用者同意跳過」，Results 狀態需依 E2E-TEST-RULE.md §5 另行判定。

test.describe("T980", () => {
  // 建議執行方式：MIX:PW+HW｜可行性：P｜本輪處置：可進入實作
  test.fixme("[T980-001] Tablet 斷線重連：平板網路斷線後重連，device/tablet 狀態顯示啟用，辨識成功並有調查紀錄", async () => {});

  // 建議執行方式：MIX:PW+HW｜可行性：P｜本輪處置：可進入實作
  test.fixme("[T980-002] Tablet 繼電器：辨識人員，顯示驗證成功、調查有紀錄、繼電器作動亮燈", async () => {});

  // 建議執行方式：MIX:PW+HW｜可行性：P｜本輪處置：可進入實作
  test.fixme("[T980-003] Tablet 人員辨識：顯示驗證成功、調查有該裝置紀錄、人員紀錄人臉", async () => {});

  // 建議執行方式：MIX:PW+HW｜可行性：P｜本輪處置：可進入實作
  test.fixme("[T980-004] Tablet 訪客辨識：顯示驗證成功、調查有該裝置紀錄、訪客紀錄人臉", async () => {});

  // 建議執行方式：MIX:PW+HW｜可行性：P｜本輪處置：可進入實作
  test.fixme("[T980-005] Tablet 陌生人：非人員與訪客辨識顯示驗證失敗，調查有紀錄、陌生人紀錄人臉", async () => {});

  // 建議執行方式：MIX:PW+HW｜可行性：P｜本輪處置：可進入實作
  test.fixme("[T980-006] Tablet 刷卡：人員填入卡片號碼，刷卡成功寫入人員卡號，調查卡號與輸入一致", async () => {});

  // 建議執行方式：MIX:PW+HW｜可行性：P｜本輪處置：可進入實作
  test.fixme("[T980-007] Tablet 刷卡：開啟繼電器開門功能、設定人員卡號、刷卡顯示成功、繼電器作用", async () => {});

  // 建議執行方式：MIX:PW+HW｜可行性：P｜本輪處置：可進入實作
  test.fixme("[T980-008] Tablet 雙因子認證：人員先刷臉再刷卡辨識成功，紀錄寫入刷卡與人臉", async () => {});

  // 建議執行方式：MIX:PW+HW｜可行性：P｜本輪處置：可進入實作
  test.fixme("[T980-009] Tablet 雙因子認證：人員先刷臉再陌生卡辨識失敗，紀錄寫入調查陌生人", async () => {});

  // 建議執行方式：MIX:PW+HW｜可行性：P｜本輪處置：可進入實作
  test.fixme("[T980-010] Tablet 雙因子認證：辨識成功繼電器作用（亮燈）", async () => {});

});
