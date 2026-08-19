# Occupancy Dashboard 資料 API 規格提案

> 目的：把 Occupancy 看板的統計運算從前端搬到後端，用**一支 API** 取代目前「整天原始紀錄分批撈回前端再重播」的做法。

---

## 1. 現況與問題

### 現在的流程

| 步驟 | 位置 | 行為 |
|---|---|---|
| 1 | `src/models/OccupancyDashboardModel.vue:167` | `setupVerifyData()` 以 `while` 迴圈打 `POST /airafacelite/querypersonverifyresult`，每批 `slice_length: 10000`，直到當天資料撈完 |
| 2 | `src/models/OccupancyDashboardModel.vue:222` | 同樣的迴圈再打一次 `POST /airafacelite/queryvisitorverifyresult` 撈訪客，合併進同一份 `verifyData` |
| 3 | `src/views/dashboards/OccupancyDashboard.vue:1014` | `applyVerifyToPerson()` 把所有事件依 `timestamp` 排序後逐筆重播，還原每個人的進出狀態 |
| 4 | `src/views/dashboards/OccupancyDashboard.vue:1244` | `getHourlyPresentData()` 把重播結果壓成 24 小時的統計陣列 |

查詢條件（`OccupancyDashboardModel.vue:175-182`）：

```js
{
  start_time: startTS,      // 當日 dailyResetTime
  end_time: endTS,          // 現在 - 1 秒
  slice_length: 10000,
  slice_shift: shitf,
  uuid_list: [],            // 空 = 全部人員
  with_image: false,
}
```

### 問題

- **請求數不可控**：進出紀錄量越大，分頁次數越多。尖峰時段一次載入可能發出十幾支 request。
- **傳輸量浪費**：整天的原始事件拉到前端，最後只被壓縮成「幾個數字 + 每人一個在場狀態」。
- **計算成本落在瀏覽器**：看板常跑在效能較弱的顯示裝置上，`applyVerifyToPerson()` 是 O(n) 的事件重播。
- **邏輯難維護**：進出判定規則散在前端多個分支，改一次要同時顧到初次載入與 WebSocket 增量兩條路徑。

---

## 2. 畫面實際需要的資料

整天的原始紀錄，最終只被用來產生這四塊：

| 畫面區塊 | 目前來源 | 實際需要的資料量 |
|---|---|---|
| 左上「在場 / 總數」 | `attendancePresent` = `persons.filter(p => p.status === 0).length`（`OccupancyDashboard.vue:248`） | 2 個整數 |
| 甜甜圈圖 | `[present, total - present]`（`OccupancyDashboard.vue:963`） | 同上，不需另外提供 |
| 24 小時柱狀圖 | `hourlyPersonInData` / `hourlyPersonOutData` / `hourlyPresentData` 三個 Map（`OccupancyDashboard.vue:1244`） | 24 × 3 個整數 |
| 人員卡片列表 | `persons[]`，每人經事件重播後得到 `status` / `punchMode` | 每人一列精簡欄位 |

---

## 3. 建議 API

### Endpoint

```
POST /airafacelite/queryoccupancydashboard
```

### Request

```json
{
  "start_time": 1755400000000,
  "end_time": 1755480000000,
  "with_image": false
}
```

| 欄位 | 型別 | 說明 |
|---|---|---|
| `start_time` | int64 | 當日重置時間的 epoch ms。前端依 `dailyResetTime` 計算，若當前時間早於重置時間則減 86400000（`OccupancyDashboard.vue:513-522`） |
| `end_time` | int64 | 查詢結束時間，通常為「現在 - 1 秒」 |
| `with_image` | bool | 固定 `false`，見 §5 |

**設定值由後端自行讀取，前端不重複傳送：**

| 設定 | 來源 API | 用途 |
|---|---|---|
| `displayGroup` | `getdashboardsettings` → `OCCUPANCY` | 過濾要顯示的人員群組 |
| `video_device_group_in` | `getattendancesettings` | 判定進場通道 |
| `video_device_group_out` | `getattendancesettings` | 判定離場通道 |

### Response

```json
{
  "result": {
    "server_time": 1755480000000,
    "summary": {
      "present": 87,
      "total": 152
    },
    "hourly": [
      { "hour": 0, "in": 0, "out": 0, "present": 0 }
    ],
    "groups": [
      { "name": "Employee", "present": 40, "total": 60 }
    ],
    "persons": [
      {
        "uuid": "5f8a...",
        "id": "E001",
        "name": "李小瑋",
        "group_list": ["Employee"],
        "primary_group": "Employee",
        "department": "研發部",
        "title": "工程師",
        "status": 0,
        "punch_mode": 3,
        "last_in_time": 1755430000000,
        "last_out_time": null,
        "is_visitor": false
      }
    ]
  }
}
```

#### `summary`

| 欄位 | 型別 | 說明 |
|---|---|---|
| `present` | int | 目前在場人數（`status === 0` 的人數） |
| `total` | int | 經 `displayGroup` 過濾後的總人數，**非系統全部人員** |

#### `hourly`

固定 24 筆，`hour` 為 `0` ~ `23`。

| 欄位 | 型別 | 說明 |
|---|---|---|
| `hour` | int | 小時（0-23） |
| `in` | int | 該小時的進場**人次** |
| `out` | int | 該小時的離場**人次**，回傳正整數即可，前端負責轉負值繪圖（`OccupancyDashboard.vue:1254`） |
| `present` | int | 該小時的在場**人數**（同一人同小時只計一次） |

#### `groups`

供分組在場數顯示使用（對應 `OccupancyDashboard.vue:533-537` 的 `groupPersons` 計算）。

**分組維度不固定**，需依 `getdashboardsettings` → `OCCUPANCY.summaryBy` 決定（`OccupancyDashboard.vue:734-810`）：

| `summaryBy` | 分組依據 |
|---|---|
| `DEPARTMENT` | `extra_info.department` |
| `JOBTITLE` | `extra_info.title` |
| `GROUP` | `group_list` |

| 欄位 | 型別 | 說明 |
|---|---|---|
| `name` | string | 分組名稱（依上表維度而定） |
| `present` | int | 該分組在場人數 |
| `total` | int | 該分組總人數 |

#### `persons`

**扁平清單，每人一筆，不做群組巢狀。** 前端的卡片列表是逐人渲染，且分頁依螢幕高度動態計算每頁卡片數（`setupPageLayoutAmount()`），與分組邊界無關——同一分組的人員可能被切在不同頁。群組資訊以 `primary_group` 標記在個人身上即可。

**陣列順序即顯示順序**，請後端排序完成，前端不再進行排序。現行前端排序規則（`OccupancyDashboard.vue:686-732`）為三層：

1. 人員所屬群組在 `displayGroup` 中的索引（取最小者）
2. 該群組 `person_list` 中的順序（`person_list` 元素為 `{ uuid, id, name }`，以 `uuid` 比對）
3. 兩者皆無則以 `card_number` 字串排序



| 欄位 | 型別 | 前端用途 |
|---|---|---|
| `uuid` | string | 主鍵；WebSocket 增量更新比對、`$globalFetchPhoto()` 抓照片 |
| `id` | string | 卡片文字（`showField` 的 `ID`） |
| `name` | string | 卡片主要顯示名稱，含 `PARTIALNAME` 遮蔽模式的來源 |
| `group_list` | string[] | 卡片文字（`showField` 的 `GROUP`） |
| `primary_group` | string | 卡片左側色條與文字顏色（`getGroupColor()`）、列表排序 |
| `department` | string | 卡片文字（`showField` 的 `DEPARTMENT`，原取自 `extra_info.department`） |
| `title` | string | 卡片文字（`showField` 的 `JOBTITLE`，原取自 `extra_info.title`） |
| `status` | int | `0` = 在場、`1` = 離場。驅動統計、甜甜圈、卡片灰階樣式 |
| `punch_mode` | int | `3` = 已進場、`4` = 已離場、`0` = 無紀錄。群組 present 計數用 |
| `last_in_time` | int64\|null | 最後進場時間 |
| `last_out_time` | int64\|null | 最後離場時間 |
| `is_visitor` | bool | 訪客照片走 `face_image_id`，與員工的 `register_image` 不同源 |

> `id` / `name` / `group_list` / `department` / `title` 五個欄位對應 `showField()`（`OccupancyDashboard.vue:847`）可切換的顯示設定。使用者可能選任一種，因此都需提供。

> `last_in_time` / `last_out_time` 目前未顯示於畫面，建議一併提供，日後要顯示進場時間時不需再改 API。

---

## 4. 運算規則（需與現行前端行為一致）

以下規則目前實作於前端，搬移時需完整對應，否則統計數字會與現況不符。

### 4.1 進出事件判定

`OccupancyDashboard.vue:1021-1041`

1. `verify_mode === 3` 視為**進場**，`verify_mode === 4` 視為**離場**。
2. 其他 `verify_mode`（單純通行）需以 `source_id` 比對通道歸類：
   - `source_id` 屬於 `video_device_group_in` 底下群組的 `camera_uuid_list` + `tablet_uuid_list` → 視為進場
   - 屬於 `video_device_group_out` 對應清單 → 視為離場
   - 兩者皆不符 → 不列入進出統計
3. 所有事件需依 `timestamp` 由小到大排序後處理。

### 4.2 人員在場狀態

`OccupancyDashboard.vue:1122-1148`

| 條件 | `punch_mode` | `status` |
|---|---|---|
| 無進場、無離場 | 0 | 1（離場） |
| 無進場、有離場 | 0 | 1（離場） |
| 有進場、無離場 | 3 | 0（在場） |
| 有進場、有離場，且進場時間 > 離場時間 | 3 | 0（在場） |
| 有進場、有離場，且進場時間 < 離場時間 | 4 | 1（離場） |

### 4.3 每小時在場人數

`OccupancyDashboard.vue:1152-1175`

每個人的每段 `in` → `out` 區間，覆蓋到的小時都計入該人在場；同一人同一小時只計一次。

### 4.4 訪客合併

訪客的驗證紀錄（現行 `queryvisitorverifyresult` 的資料）需與人員紀錄合併後一併統計，並以 `is_visitor: true` 標示。

### 4.5 人員過濾

僅回傳 `group_list` 與 `displayGroup` 有交集的人員（`OccupancyDashboard.vue:665-677`）。`summary.total` 為過濾後的人數。

---

## 5. 照片處理

**`persons` 不得內嵌 base64 影像。**

現行機制為：`with_image: false` 只取資料，前端翻頁時才對當前頁的人員呼叫 `$globalFetchPhoto(uuid)` 懶載入（`OccupancyDashboard.vue:284-296`）。此設計維持不變，`persons` 陣列才能保持輕量。

---

## 6. 待確認事項

以下為現行前端實作中定義不一致之處，搬移至後端時建議統一定義。

### 6.1 同小時進出的計數

`OccupancyDashboard.vue:1163` 為 `for (let k = hourIn; k < hourOut; k += 1)`，採前閉後開。若某人於同一小時內進場又離場（`hourIn === hourOut`），該小時的 `present` 不會計入此人。

**需確認**：是否應改為前閉後閉（`k <= hourOut`），或維持現行行為。

### 6.2 純通行模式的在場區間

`OccupancyDashboard.vue:1218-1236`：當資料中完全沒有 clock 類型紀錄、僅有通行紀錄時，走另一條分支，該人的在場區間是從進場小時一路計算到 23 點，與 4.3 的規則不一致。

**需確認**：兩條分支是否應統一為同一套規則。

### 6.3 跨日資料

`start_time` 由前端依 `dailyResetTime` 計算，可能落在前一日。需確認後端查詢區間的處理方式與現行一致。

---

## 7. WebSocket 即時更新

現行做法：收到即時驗證推播時，前端呼叫 `applyVerifyToPerson([result])` 做增量更新（`OccupancyDashboard.vue:389`）。統計邏輯搬至後端後，前端不再具備增量計算能力。

**採用方案：後端於推播時附帶算好的結果片段**，前端僅做覆蓋，不重打 API。

> 曾評估「收到推播後 debounce 3~5 秒重打全量 API」，但該做法會使後端在有活動期間持續全量重算，成本不合理，故不採用。

### 7.1 核心原則：推絕對值，不推增量

看板長時間掛載不重整，WebSocket 必然會遇到斷線與漏訊息。

- 若推增量（`present: +1`），漏一則訊息數字即永久錯誤，且無從察覺。
- 若推絕對值，漏訊息後下一則到達時數字即自動修正。

後端本身即維護當前狀態，推送時填入當前值即可，不增加計算成本。

### 7.2 Payload 格式

現行 `verifyresults` 通道已有其他看板（GuardDashboard 等）使用，且 `payload.type` 已用於區分陌生人（`0`）與註冊人員（`1`），不宜再作為訊息類型欄位。

**建議在現有驗證推播 payload 上附掛 `occupancy` 區塊**，不解析此區塊的看板可直接忽略，無須變更通道或影響既有功能。

```json
{
  "occupancy": {
    "seq": 1042,
    "server_time": 1755480000000,
    "counted": true,

    "person": {
      "uuid": "5f8a...",
      "status": 0,
      "punch_mode": 3,
      "last_in_time": 1755430000000,
      "last_out_time": null
    },

    "summary": { "present": 88, "total": 152 },

    "groups": [
      { "name": "Employee", "present": 41, "total": 60 }
    ],

    "hourly": [
      { "hour": 9,  "in": 12, "out": 3, "present": 41 },
      { "hour": 10, "in": 0,  "out": 0, "present": 40 }
    ]
  }
}
```

| 欄位 | 型別 | 說明 |
|---|---|---|
| `seq` | int | 遞增序號，每日重置時歸零。前端記錄最後接收值，**發現跳號即重新呼叫全量 API 補齊**。此為斷線容錯的關鍵機制 |
| `server_time` | int64 | 伺服器時間戳 |
| `counted` | bool | 此事件是否計入統計。`source_id` 不屬於任何進出通道、人員不在 `displayGroup` 內、或為陌生人時給 `false`，前端直接忽略。使「哪些事件算數」的判斷完全留在後端 |
| `person` | object | 僅該名人員的最新狀態，欄位定義同 §3.4 |
| `groups` | array | **僅受影響的分組**，通常 1 筆 |
| `hourly` | array | **僅受影響的小時格**，可能超過 1 筆。例如某人 09:00 進場、11:00 離場，該離場事件會同時改變第 9、10 兩格的 `present` |

### 7.3 前端處理流程

收到後僅做覆蓋，不進行任何計算：

1. 以 `uuid` 找到對應人員，覆蓋 `status` / `punch_mode`
2. `summary` 整個覆蓋
3. `groups` 依 `name` 對應覆蓋
4. `hourly` 依 `hour` 對應覆蓋
5. 重繪圖表

`applyVerifyToPerson()` 及其相關的進出配對邏輯可完全移除。

### 7.4 必要的補償機制

| 機制 | 做法 | 必要性 |
|---|---|---|
| **斷線補償** | WebSocket `onopen` 重連時、或偵測 `seq` 跳號時，重新呼叫全量 API | **必要**。現行 `webSocketService.js:42` 已有自動重連（1~3 秒遞增），但重連後無補資料機制，斷線期間的事件會全數遺失 |
| **每日重置** | 前端排定 timer 於 `dailyResetTime` 重新呼叫全量 API；或由後端推送 `"reset": true` | **必要**，二擇一即可 |
| **低頻對帳** | 前端每 10~15 分鐘重新呼叫一次全量 API | 建議。相較 3 秒一次約為 1/200 成本，可修正任何累積誤差 |

### 7.5 成本比較

| 方案 | 後端計算頻率 | 傳輸量 |
|---|---|---|
| debounce 3 秒重打全量 | 有活動期間每 3 秒全量重算 | 每次數十 KB |
| **socket 推送片段** | 每筆事件計算一次增量（原本即需處理） | 每則約 300 bytes |
| ＋15 分鐘對帳 | 每小時 4 次全量 | 每次數十 KB |

---

## 8. 預期效益

| 項目 | 現況 | 改版後 |
|---|---|---|
| 初次載入 Request 數 | 隨紀錄量成長，可能十餘支 | 固定 1 支 |
| 初次載入傳輸量 | 整天原始事件，可達數 MB | 數十 KB |
| 即時更新 | 收原始事件，前端重算 | 收算好的片段，約 300 bytes／則 |
| 前端運算 | O(n) 事件重播 + 分組統計 + 排序 | 無，僅負責覆蓋與繪製 |
| 邏輯維護點 | 前端多分支 | 後端單一實作 |
