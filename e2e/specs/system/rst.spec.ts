import { test } from '@playwright/test';

// 骨架（自動產生）：來源 E2E-TEST-PLAN.md；模組 RST，共 3 個 Test ID。
// 目前全部為 test.fixme（尚未實作）。實作時不得改動 Test ID 與標題前綴；assertion 只能依 Plan 的預期結果。
// 注意：fixme 不等於「使用者同意跳過」，Results 狀態需依 E2E-TEST-RULE.md §5 另行判定。

test.describe("RST", () => {
  // 建議執行方式：MIX:PW+SSH｜可行性：P｜本輪處置：可進入實作
  test.fixme("[RST-001] 重啟服務：重新執行並被系統自動登出，重新開啟 client 可正常使用所有功能", async () => {});

  // 建議執行方式：MIX:PW+SSH+HW｜可行性：P｜本輪處置：可進入實作
  test.fixme("[RST-002] 重新開機：電腦重開，重開後 service 正常，辨識與調查寫入正常，I/O 連線狀態正常", async () => {});

  // 建議執行方式：MIX:PW+SSH｜可行性：P｜本輪處置：可進入實作
  test.fixme("[RST-003] 系統重設：清除既有資料回復軟體預設，人員/訪客/攝影機/群組/事件清除", async () => {});

});
