import { test } from '@playwright/test';

// 骨架（自動產生）：來源 E2E-TEST-PLAN.md；模組 SVC，共 8 個 Test ID。
// 目前全部為 test.fixme（尚未實作）。實作時不得改動 Test ID 與標題前綴；assertion 只能依 Plan 的預期結果。
// 注意：fixme 不等於「使用者同意跳過」，Results 狀態需依 E2E-TEST-RULE.md §5 另行判定。

test.describe("SVC", () => {
  // 建議執行方式：SSH｜可行性：P｜本輪處置：可進入實作
  test.fixme("[SVC-001] face.data.service：systemctl status 為 active (running)、PID 不變、數量 x1", async () => {});

  // 建議執行方式：MIX:SSH+PW｜可行性：P｜本輪處置：可進入實作
  test.fixme("[SVC-002] face.data.service：call 診斷會使 main.service restart", async () => {});

  // 建議執行方式：SSH｜可行性：T｜本輪處置：暫不測

  // 建議執行方式：SSH｜可行性：T｜本輪處置：暫不測

  // 建議執行方式：SSH｜可行性：T｜本輪處置：暫不測

  // 建議執行方式：SSH｜可行性：P｜本輪處置：暫不測

  // 建議執行方式：SSH｜可行性：P｜本輪處置：可進入實作
  test.fixme("[SVC-007] ./mediaConnector：程序數量 x active channels", async () => {});

  // 建議執行方式：SSH｜可行性：P｜本輪處置：可進入實作
  test.fixme("[SVC-008] face.mediamtx.service：程序數量 x1", async () => {});

});
