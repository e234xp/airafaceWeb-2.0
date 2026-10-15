import { test } from '@playwright/test';

// 骨架（自動產生）：來源 E2E-TEST-PLAN.md；模組 MGR，共 6 個 Test ID。
// 目前全部為 test.fixme（尚未實作）。實作時不得改動 Test ID 與標題前綴；assertion 只能依 Plan 的預期結果。
// 注意：fixme 不等於「使用者同意跳過」，Results 狀態需依 E2E-TEST-RULE.md §5 另行判定。

test.describe("MGR", () => {
  // 建議執行方式：MIX:PW+EXT｜可行性：P｜本輪處置：可進入實作
  test.fixme("[MGR-001] airaManager 同步：Manager 人員群組傳進 Face2 群組", async () => {});

  // 建議執行方式：MIX:PW+EXT+HW｜可行性：P｜本輪處置：可進入實作
  test.fixme("[MGR-002] airaManager 回傳人員辨識結果：manager 顯示調查與 Face 相同結果", async () => {});

  // 建議執行方式：MIX:PW+EXT+HW｜可行性：P｜本輪處置：可進入實作
  test.fixme("[MGR-003] airaManager：出勤/調查/陌生人紀錄傳回 manager", async () => {});

  // 建議執行方式：MIX:PW+EXT+HW｜可行性：P｜本輪處置：可進入實作
  test.fixme("[MGR-004] airaManager 斷線回填：網路斷線後重新連線，辨識後人員資料由 Face 同步至 manager", async () => {});

  // 建議執行方式：MIX:PW+EXT｜可行性：P｜本輪處置：可進入實作
  test.fixme("[MGR-005] airaManager 結束同步清空人員：關閉中央管理後 Face 人員與訪客應清除", async () => {});

  // 建議執行方式：MIX:PW+EXT｜可行性：P｜本輪處置：可進入實作
  test.fixme("[MGR-006] airaManager 同步清空人員：開啟中央管理清空 Face 人員（開啟中央管理後 Face 人員與訪客應清除）", async () => {});

});
