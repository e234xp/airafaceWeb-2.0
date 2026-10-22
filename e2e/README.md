# E2E

AiraFace 管理介面（airafaceWeb）的 Playwright 端對端測試。

- 規則：[../E2E-TEST-RULE.md](../E2E-TEST-RULE.md)　計畫：[../E2E-TEST-PLAN.md](../E2E-TEST-PLAN.md)　結果：[../E2E-TEST-RESULTS_2026-10-07.md](../E2E-TEST-RESULTS_2026-10-07.md)
- 無法自動測的項目：[../E2E-MANUAL-TEST-LIST.html](../E2E-MANUAL-TEST-LIST.html)（由測試人員勾選）

## 環境準備

1. Node.js 20 以上（Playwright 1.63 的要求；Node 16 會直接報錯）。
2. `npm install`，再 `npx playwright install chromium`。
3. 複製 `../.env.e2e.example` 為 `../.env.e2e.local`，填入受測主機位址與管理者帳密。`.env.e2e.local` 不得進版控。
4. 受測主機的前端服務要先啟動（`npm run serve`），測試不會自己啟動。

## 指令

| 指令 | 用途 | 什麼時候用 |
|---|---|---|
| `npm run e2e` | Playwright 原生指令，一次跑全部測試 | CI；沒有停損記帳 |
| `npm run e2e:headed` | 同上，但開出瀏覽器視窗 | 要親眼看畫面除錯時 |
| `npm run e2e:ui` | 開 Playwright 圖形介面，可逐步重播、看每一步畫面 | 查某個測項為什麼失敗 |
| `npm run e2e:report` | 開啟 HTML 測試報告（`reports/html`） | 跑完後看結果 |
| `npm run e2e:case -- <ID>...` | **跑單一或多個測項**，例：`npm run e2e:case -- CAM-007 CAM-008`。每個測項有停損：嘗試 5 次或累計 5 分鐘仍未通過就拒絕再跑（exit 3）。記帳存在 `reports/budget.json` | 開發或修腳本時的標準跑法；規則規定測項只能用它跑 |
| `npm run e2e:case -- --workers=1 <ID>` | 限制同時執行的 worker 數（預設約 8，會把開發伺服器壓垮） | 跑多個 ID 時伺服器出現連線被拒 |
| `npm run e2e:case -- --reset <ID>` | 清除該項的嘗試次數記帳 | 環境錯誤造成失敗、或使用者同意加碼時 |
| `npm run e2e:budget` | 列出每個測項的嘗試次數、累計耗時、是否通過（等同 `e2e:case -- --status`） | 想知道哪些測項快用完停損額度 |
| `npm run e2e:parallel` | 依共用資料把測項分成 6 組，組內序列、組間平行（預設同時 3 組，各組啟動錯開 5 秒；某組一啟動就當掉會自動重試一次，摘要會分開列出各組通過／失敗／跳過，啟動失敗標「未執行」）。分組：`boards`（各種看板）、`people-events`（人員、訪客、群組、事件、通知）、`system`（帳號、診斷、日誌、授權等）、`devices`（攝影機、平板、設備群組）、`reports`（調查、報表、進出紀錄）、`login`（登入登出） | 回歸測試，要確認整體狀態時 |
| `npm run e2e:parallel -- --groups=boards,devices --jobs=2` | 只跑指定分組、限制同時組數 | 只想回歸某幾組 |
| `npm run e2e:parallel -- -- -g "\[CAM-0"` | 「`--`」後面的參數原樣傳給 Playwright（例：只跑名稱符合的測項） | 挑特定測項平行跑 |
| `npm run e2e:probe -- --route=<路由>` | 寫新測項前，把頁面或精靈的欄位、下拉選項、按鈕列出來，唯讀，輸出到 `reports/probe/<name>.md`。選項：`--add` 先按「新增」、`--fill` 填測試值、`--name=` 指定檔名 | 新增腳本前探查頁面，不用逐項試錯 |

`e2e:case` 與 `e2e:parallel` 的停損、記帳、環境變數（`E2E_CASE_MAX_ATTEMPTS`、`E2E_CASE_STUCK_TIMEOUT_MINUTES`）由 `tools/run-case.cjs`、`tools/budget-reporter.cjs` 處理。

## 更新 Results 之後

```
node e2e/tools/restat.cjs            # 重算 Results 的狀態統計
node e2e/tools/validate-results.cjs  # 檢查 ID 重複、欄位、是否都在 Plan 內
node e2e/tools/add-note.cjs <notes.json>   # 批次在備註欄尾端追加一行
```

## 目錄

| 路徑 | 內容 |
|---|---|
| `specs/<模組>/` | 測試腳本，測項標題格式 `[TEST-ID] 標題` |
| `helpers/` | 腳本共用函式（登入、人員、攝影機、看板模擬辨識等） |
| `setup/auth.setup.ts` | 登入一次，各分組共用登入狀態 |
| `fixtures/` | 測試用檔案（人臉照片等），說明見 `fixtures/README.md` |
| `tools/` | 執行、記帳、報告用的命令列工具；多數是一次性的輔助腳本，只有上表與上節列出的是常用的 |
| `plan-ids.json` | 從 Plan 自動產生的 Test ID 清單（Coverage Audit 用） |
| `reports/` | 報告、trace、錄影、`budget.json`；`reports/tmp` 為暫存，不進版控 |

## 範圍規則

只為「能跑在 CI 環境」的項目寫腳本。以下不寫 E2E 腳本，原因與處理方式都登記在手動清單：

- 高風險項目：備份還原、軟體更新、授權、系統重設與服務重啟、中央管理（會清空人員）。
- 出勤（ATT）全系列：更新時間不即時，前端計算改用 `tests/unit/attendanceCalc.spec.js` 單元測試涵蓋。
- 點名看板（ATB）：等看板重構後再處理。
- 需要實體設備、真人站在鏡頭前、外部服務的項目：由測試人員手動驗證。

要寫的腳本必須通過；做不到的，要在手動清單說明問題。

## 補假資料（mock）模式

預設完全走真後端，行為不變。在 `.env.e2e.local` 設 `E2E_IS_MOCK=true` 後：前端每個 API 請求先送真後端，**只有真實回應的清單是空的（環境沒有資料）才改用 `e2e/mock/fakeBackend.ts` 的假資料補上**；真實環境有資料就一律用真的。

- 用到假資料的測項會在報告標示：HTML 報告的 annotation 類型 `mockData`，終端機一行 `[MOCK_DATA] 測項 → 哪個 API 補了什麼`。
- 目前只有攝影機、平板、授權清單有假資料；清單為空但還沒有假資料可補的 API，同樣會在報告標示「沒有對應的假資料可補」。
- `E2E_MOCK_WRITES`（預設 false）預留給「對假資料的編輯／刪除由假後端處理」，目前尚未實作；現在一律送真後端。
- 所有 spec 都從 `helpers/test.ts` 匯入 `test`／`expect`（不要直接從 `@playwright/test` 匯入），模式切換才會對所有瀏覽器環境生效，包含 `browser.newContext()` 自建的。
- 腳本不應寫死依賴某個特定名稱的資料（例如 `e2e-nx-in`），要用環境裡現有的資料；沒有任何資料時才由假資料補。