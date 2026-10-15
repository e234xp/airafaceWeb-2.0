import { test } from '@playwright/test';

// 骨架（自動產生）：來源 E2E-TEST-PLAN.md；模組 BK，共 11 個 Test ID。
// 目前全部為 test.fixme（尚未實作）。實作時不得改動 Test ID 與標題前綴；assertion 只能依 Plan 的預期結果。
// 注意：fixme 不等於「使用者同意跳過」，Results 狀態需依 E2E-TEST-RULE.md §5 另行判定。

test.describe("BK", () => {
  // 建議執行方式：PW｜可行性：Y｜本輪處置：可進入實作

  // 建議執行方式：PW｜可行性：P｜本輪處置：可進入實作
  test.fixme("[BK-002] 還原：選擇檔案上傳還原資料庫", async () => {});

  // 建議執行方式：MIX:PW+SSH｜可行性：P｜本輪處置：可進入實作
  test.fixme("[BK-003] 還原後重新開機可運作", async () => {});

  // 建議執行方式：MIX:PW+SSH｜可行性：P｜本輪處置：可進入實作
  test.fixme("[BK-004] 還原後：系統日誌延續還原前的日誌", async () => {});

  // 建議執行方式：MIX:PW+SSH｜可行性：P｜本輪處置：可進入實作
  test.fixme("[BK-005] 還原後：人員群組與照片正確（人員群組與人員數量）", async () => {});

  // 建議執行方式：MIX:PW+SSH｜可行性：P｜本輪處置：可進入實作
  test.fixme("[BK-006] 還原後：訪客群組與照片正確（訪客群組與訪客數量）", async () => {});

  // 建議執行方式：MIX:PW+SSH｜可行性：P｜本輪處置：可進入實作
  test.fixme("[BK-007] 還原後：影像設備群組正確（設備群組與設備數量）", async () => {});

  // 建議執行方式：MIX:PW+EXT｜可行性：P｜本輪處置：可進入實作
  test.fixme("[BK-008] 還原後：HTTP Event 沿用設定且可發送（Nx 可接收 Event）", async () => {});

  // 建議執行方式：MIX:PW+EXT｜可行性：P｜本輪處置：可進入實作
  test.fixme("[BK-009] 還原後：Line Event 沿用設定且可發送", async () => {});

  // 建議執行方式：MIX:PW+EXT｜可行性：P｜本輪處置：可進入實作
  test.fixme("[BK-010] 還原後：Email 沿用設定且可發送", async () => {});

  // 建議執行方式：MIX:PW+SSH｜可行性：P｜本輪處置：可進入實作
  test.fixme("[BK-011] 還原後：授權沿用，授權不被清空", async () => {});

});
