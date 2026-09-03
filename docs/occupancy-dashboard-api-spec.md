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

前端不傳查詢區間，由後端依 `dailyResetTime` 自行判斷當前是哪一輪。

```json
{ "range": "all" }
```

| 欄位 | 型別 | 說明 |
|---|---|---|
| `range` | string | `"all"` 時回傳完整 24 筆 `hourly`；未帶時僅回傳當前時段 1 筆。詳見 §3.2 |
| `with_image` | bool | 固定 `false`，見 §5 |

**所有設定值由後端自行讀取，前端不傳送：**

| 設定 | 來源 API | 用途 |
|---|---|---|
| `dailyResetTime` | `getdashboardsettings` → `OCCUPANCY` | **判斷查詢區間的起訖**（取代原本前端傳入的 `start_time` / `end_time`） |
| `displayGroup` | `getdashboardsettings` → `OCCUPANCY` | 過濾要顯示的人員群組 |
| `video_device_group_in` | `getattendancesettings` | 判定進場通道 |
| `video_device_group_out` | `getattendancesettings` | 判定離場通道 |

> 查詢區間交由後端計算後，前端 `OccupancyDashboard.vue:511-524` 整段（`startTS` / `endTS` 的推算）可移除，`dailyResetTime` 的格式與字串比較問題（§6.3）也一併由後端承接。

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

> ⚠️ 目前實作的 `in` / `out` / `present` 三個欄位皆有誤，詳見 **§9**。

**兩種回傳模式**：

| 情境 | Request | 回傳筆數 |
|---|---|---|
| 初次載入看板 | `{ "range": "all" }` | 完整 24 筆 |
| 每個整點 | 不帶 `range` | 僅當前時段 1 筆 |
| WebSocket 重連後 | `{ "range": "all" }` | 完整 24 筆（見 §7.4） |
| 跨越 `dailyResetTime` | `{ "range": "all" }` | 完整 24 筆（新的一輪） |

**單筆回傳時仍請以陣列包覆並帶 `slot`**，前端統一以「依 `slot` 覆蓋對應位置」處理，不需分辨筆數：

```json
"hourly": [
  { "slot": 4, "hour": 10, "in": 12, "out": 3, "present": 41 }
]
```

**陣列順序即圖表由左到右的順序**，以 `dailyResetTime` 為起點，而非時鐘 0 點。

以 `dailyResetTime = 06:00` 為例：

| `slot` | `hour` | 對應時間 |
|---|---|---|
| 0 | 6 | 當日 06:00 |
| 1 | 7 | 當日 07:00 |
| … | … | … |
| 17 | 23 | 當日 23:00 |
| 18 | 0 | **隔日** 00:00 |
| … | … | … |
| 23 | 5 | 隔日 05:00 |

換算公式：`slot = (時鐘小時 - 重置小時 + 24) % 24`

| 欄位 | 型別 | 說明 |
|---|---|---|
| `slot` | int | `0` ~ `23`，圖表由左至右的位置。陣列索引即為此值 |
| `hour` | int | 時鐘小時（0-23），僅供 X 軸標籤顯示 |
| `in` | int | 該小時的進場**人次** |
| `out` | int | 該小時的離場**人次**，回傳正整數即可，前端負責轉負值繪圖（`OccupancyDashboard.vue:1254`） |
| `present` | int\|null | 該小時的在場**人數**（同一人同小時只計一次）。**尚未到達的時段給 `null`**，不要給 `0` |

**`present` 為何不能用 `0` 表示未到達**：`0` 在圖表上會畫成「在場人數歸零」，看起來像所有人都離開了；`null` 才會讓 chart.js 正確斷線。

**`present` 具有延續性**：某小時完全沒有人進出時，`present` 應延續前一小時的值，而非 `0`。例如 10:00 有 50 人在場、11:00 無任何進出，則 11:00 的 `present` 仍為 `50`。

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

### 訪客照片來源變更

**現行行為**：訪客卡片顯示的是「最近一次刷臉當下的影像」，來自 WebSocket payload 的 `face_image`（`OccupancyDashboard.vue:1056`、`1190`）：

```js
if (person != null && record.group_list.indexOf('All Visitor') >= 0) {
  person.display_image = record.face_image_id;
}
```

**變更後**：新 WebSocket 通道不提供影像，訪客改用註冊照，無註冊照則顯示空白人像。

前端 `getImageSrc()` 的優先序（`display_image` → `register_image` → 空白人像 SVG）本身不需修改，僅須移除上述兩處指派——該邏輯位於 `applyVerifyToPerson()` 內，整個函式本就會被刪除。

> ⚠️ **訪客通常沒有註冊照**，變更後訪客卡片多半會顯示空白人像。此為已知取捨，建議事先向使用者說明。

---

## 6. 待確認事項

以下為現行前端實作中定義不一致之處，搬移至後端時建議統一定義。

### 6.1 同小時進出的計數

`OccupancyDashboard.vue:1163` 為 `for (let k = hourIn; k < hourOut; k += 1)`，採前閉後開。若某人於同一小時內進場又離場（`hourIn === hourOut`），該小時的 `present` 不會計入此人。

**需確認**：是否應改為前閉後閉（`k <= hourOut`），或維持現行行為。

### 6.2 純通行模式的在場區間

`OccupancyDashboard.vue:1218-1236`：當資料中完全沒有 clock 類型紀錄、僅有通行紀錄時，走另一條分支，該人的在場區間是從進場小時一路計算到 23 點，與 4.3 的規則不一致。

**需確認**：兩條分支是否應統一為同一套規則。

### 6.3 跨日資料與 `dailyResetTime` 格式

`start_time` 由前端依 `dailyResetTime` 計算，可能落在前一日（`OccupancyDashboard.vue:511-522`）。

搬移時須注意兩點：

**格式不固定**：`dailyResetTime` 可能是 `"06"`（兩字元）或 `"06:00"`。前端在 `OccupancyDashboard.vue:431-433` 有補齊處理：

```js
if (self.displaySettings.dailyResetTime.length === 2) {
  self.displaySettings.dailyResetTime += ':00';
}
```

**現行使用字串比較**：`nowHM < dailyResetTime` 依賴兩邊皆為零補位的 `HH:MM`。若出現 `"6:00"` 這類未補零的值，字典序比較會得到錯誤結果（例如 `"09:00" < "6:00"` 為 true，將錯誤地往回推一天）。

**建議**：後端改用數值（分鐘數或 timestamp）比較，不要沿用字串比較。

> 查詢區間已改由後端依 `dailyResetTime` 自行判斷（見 §3 Request），因此上述兩個問題**由後端承接**。前端仍需讀取 `dailyResetTime` 以計算 `currentSlot()`（WebSocket 更新時判斷要更新哪一格），但不再參與查詢區間的推算。

### 6.4 跨午夜的在場區間未被計入

`OccupancyDashboard.vue:1163`：

```js
for (let k = hourIn; k < hourOut; k += 1)
```

當某人於 22:00 進場、隔日 02:00 離場時，`hourIn = 22`、`hourOut = 2`，迴圈條件一開始即不成立，**完全不執行**——該人員的在場時段一格都不會被計入 `hourlyPresentData`。

夜班或跨午夜停留的情境會整批遺漏。

**需確認**：改用 §3 的 `slot` 座標系後（以 `dailyResetTime` 為起點），跨午夜的區間即可正常表示。請確認後端以 `slot` 而非時鐘小時進行區間填充。

---

## 7. WebSocket 即時更新

現行做法：收到即時驗證推播時，前端呼叫 `applyVerifyToPerson([result])` 做增量更新（`OccupancyDashboard.vue:389`）。統計邏輯搬至後端後，前端不再具備進出判定能力。

**採用方案：職責分離。**

| 工作 | 說明 | 由誰負責 |
|---|---|---|
| **進出判定** | 需套用 `verify_mode` 規則、比對進出通道群組、展開裝置 uuid | **後端**（原本即需計算） |
| **彙總計數** | 統計 `status === 0` 的人數、對應時段 `in` / `out` 累加 | **前端**（純計數，不含業務邏輯） |

後端**不需要在每次事件時重算整個看板**，僅需推送既有的判定結果。全量計算維持每小時一次，且整點僅計算當前時段。

> 曾評估兩個方案後不採用：
> 1. **後端每次事件重算完整 summary/hourly/groups** — 後端計算成本過高。
> 2. **前端收到推播後 throttle 重打全量 API** — 即時性與後端負擔難以兼顧；throttle 設為 15 秒仍等同每分鐘 4 次全量計算。

### 7.1 通道與 Payload 格式

後端將**另開一條專用通道**推送 Occupancy 所需的判定結果，現行 `verifyresults` 通道維持不變。

```json
{
  "counted": true,
  "direction": "in",
  "person_uuid": "5f8a...",
  "status": 0
}
```

| 欄位 | 型別 | 說明 |
|---|---|---|
| `counted` | bool | 此事件是否計入統計。`source_id` 不屬於任何進出通道、人員不在 `displayGroup` 內、或為陌生人時給 `false`，前端直接忽略。使「哪些事件算數」的判斷完全留在後端 |
| `direction` | string | `"in"` 進場 / `"out"` 離場。判定規則同 §4.1 |
| `person_uuid` | string | 對應 `persons[].uuid` |
| `status` | int | 該人員最新狀態：`0` 在場 / `1` 離場。判定規則同 §4.2 |

這四個欄位皆為後端在寫入驗證紀錄時既有的資訊，不需額外運算。

**新通道需一併提供**：

| 項目 | 原因 |
|---|---|
| 連線狀態事件 | 前端需在斷線時蓋上遮罩，避免看板默默顯示過期數字（現行機制見 `OccupancyDashboard.vue:340-347`） |
| 心跳格式定義 | 現行通道以 `statusCode: '200'` 表示心跳，前端收到即跳過。新通道請沿用或明確告知格式 |

> 本通道**不含影像欄位**，訪客照片改用註冊照，詳見 §5。

### 7.2 前端處理流程

```js
const o = payload;
if (!o || !o.counted) return;

// 1. 更新該人員狀態
const person = this.persons.find((p) => p.uuid === o.person_uuid);
if (person) person.status = o.status;

// 2. 當前時段進出人次累加
const slot = this.currentSlot();
if (o.direction === 'in') this.hourly[slot].in += 1;
else this.hourly[slot].out += 1;

// 3. 重新計數在場人數
const present = this.persons.filter((p) => p.status === 0).length;
this.hourly[slot].present = present;

// 4. 該人員所屬分組的 present 一併更新
```

無事件重播、無進出配對、無通道比對。第 3 步為 O(n)，人數規模在數百時可忽略。

`applyVerifyToPerson()` 及其相關的進出配對邏輯（`OccupancyDashboard.vue:1014-1242`）可完全移除。

同時，以下四支 API 在看板端不再需要呼叫——其用途僅為展開進出通道的裝置 uuid，該工作已移至後端：

- `getattendancesettings`
- `findvideodevicegroups`
- `findcameras`
- `gettabletlist`

`currentSlot()` 仍需 `dailyResetTime`，該值從 `getdashboardsettings` 取得（看板本來就會讀）。

### 7.3 整點重新呼叫全量 API

於每個整點重新呼叫本 API（**不帶 `range`**，僅取得當前時段 1 筆），目的為**圖表推進**——時間進入新的時段，即使無人進出，圖表仍需增加一格。

現行 `setupCurrentTimeLooper()`（`OccupancyDashboard.vue:1007`）已有整點觸發判斷，沿用即可。

### 7.4 對帳缺口與補償

由於整點呼叫僅回傳當前時段，**歷史時段的偏差不會被修正**。

情境：WebSocket 斷線 3 小時，期間有人員進出。重連後，該 3 小時的 `in` / `out` / `present` 將永久停留在錯誤數值，直到隔日重置。

**補償方式**：於下列時機改帶 `range: "all"` 重新載入完整 24 筆。

| 時機 | 原因 |
|---|---|
| WebSocket **重連成功**時 | 補齊斷線期間的所有偏差 |
| 跨越 `dailyResetTime` | 進入新的一輪，24 格全部重來 |

正常運作下 WebSocket 不會斷線，此補償極少觸發，成本可忽略。

**前提**：`summary` / `persons` / `groups` 三塊在每次呼叫時**皆須完整回傳**，不可比照 `hourly` 縮減。若 `persons` 也採增量，前端將完全失去對帳能力。

### 7.5 每日重置

跨越 `dailyResetTime` 時所有統計歸零，圖表回到 `slot 0`。此時點需以 `range: "all"` 重新載入。

### 7.6 後端計算頻率

| 時機 | 後端動作 |
|---|---|
| 看板開啟 | 全量計算 1 次（24 筆） |
| 每個整點 | 計算當前時段 1 筆 |
| WebSocket 重連 | 全量計算 1 次（24 筆） |
| 有人進出 | **不重算**，僅推送 4 個既有欄位 |

---

## 8. 預期效益

| 項目 | 現況 | 改版後 |
|---|---|---|
| 初次載入 Request 數 | 隨紀錄量成長，可能十餘支 | 固定 1 支 |
| 初次載入傳輸量 | 整天原始事件，可達數 MB | 數十 KB |
| 即時更新 | 收原始事件，前端做完整進出判定與重播 | 收判定結果，前端僅計數 |
| 後端計算頻率 | 不涉及 | 開啟時 1 次全量；整點僅算當前時段；事件推播不重算 |
| 查詢區間推算 | 前端計算 `startTS` / `endTS` 並傳送 | 後端依 `dailyResetTime` 自行判斷 |
| 前端運算 | O(n) 事件重播 + 進出配對 + 分組統計 + 排序 | 僅 O(n) 計數 |
| 看板端須呼叫的設定 API | `getattendancesettings`、`findvideodevicegroups`、`findcameras`、`gettabletlist` | 皆不需要 |
| 邏輯維護點 | 前端多分支 | 後端單一實作 |

---

## 9. 實作回饋：目前回傳資料的問題

以下依 2026-09-03 實測回傳整理。三項皆需修正，否則畫面數字錯誤。

### 9.1 `hourly` 的 `in` / `out` 量級異常

實際回傳：

```json
{ "summary": { "present": 3, "total": 29 } }

"hourly": [
  { "hour": 0,  "in": 39242, "out": 0, "present": 39242 },
  { "hour": 1,  "in": 40867, "out": 0, "present": 40867 },
  { "hour": 11, "in": 41612, "out": 1, "present": 41611 },
  { "hour": 13, "in": 35899, "out": 0, "present": 35899 },
  { "hour": 14, "in": 0,     "out": 0, "present": 0 }
]
```

**問題**：系統總人數僅 29 人，單一小時不可能有 39242 人次進場，且 0~13 點每格皆為四萬左右。

**研判原因**：查詢區間未生效——後端可能未依 `dailyResetTime` 限制範圍，而將資料庫全部歷史紀錄依 `getHours()` 分組，導致多年資料累積於 24 個格子中。

**佐證**：14 點之後全為 0——該時段尚未到達，任何年份皆無資料，符合「跨年份累積」的特徵。

**應為**：僅統計當前這一輪的紀錄，即自 `dailyResetTime` 起算的 24 小時區間內。

### 9.2 `present` 的定義錯誤

比對兩筆資料可反推目前的計算方式：

| `hour` | `in` | `out` | 回傳 `present` | 推論 |
|---|---|---|---|---|
| 0 | 39242 | 0 | 39242 | = `in − out` |
| 11 | 41612 | 1 | 41611 | = `in − out` |

**問題**：目前 `present` 計算為「該小時進出人次的淨差」。

**應為**：該小時的**在場人數**——每個人的 `in → out` 區間覆蓋到該小時即計一次，同一人同小時只計一次（見 §4.3）。此數值上限為 `summary.total`（本例為 29），不可能達到數萬。

**注意**：此問題與 §9.1 獨立。即使時間區間修正後，`in − out` 的算法仍然錯誤。

### 9.3 `groups` 混入裝置群組

實際回傳：

```json
"groups": [
  { "name": "All Cameras",   "present": 0, "total": 0 },
  { "name": "All Tablets",   "present": 0, "total": 0 },
  { "name": "Video Group-3", "present": 0, "total": 0 },
  { "name": "Video Group-4", "present": 0, "total": 0 },
  { "name": "All Person",    "present": 3, "total": 25 },
  { "name": "employee",      "present": 2, "total": 6 }
]
```

**問題**：前四筆為攝影機／平板的**裝置群組**，非人員群組，`total` 皆為 0。

**應為**：僅回傳人員群組，依 §3 `groups` 的 `summaryBy` 維度計算。

### 9.4 已確認正確的部分

以下項目實測無誤，供後端確認修改時不要動到：

| 項目 | 驗證方式 |
|---|---|
| `summary.present` | 回傳 3，`persons` 中 `status: 0` 者確為 3 人 ✓ |
| `summary.total` | 回傳 29，與 `persons` 筆數一致 ✓ |
| `status` 判定 | Tulip 的 `last_out_time`(1788406984613) < `last_in_time`(1788413202437)，`status: 0` 正確 ✓ |
| `primary_group` | 有正確填入 ✓ |
| `is_visitor` | 訪客標記正確 ✓ |

### 9.5 `groups.total` 不可加總

`All Person`(25)、`admin`(6)、`employee`(6) 等群組互有重疊，一名人員屬於幾個群組即在幾個群組中各計一次。

各群組分別顯示人數時此行為正確，但**不可將各組 `total` 相加當作總人數**。總人數請一律使用 `summary.total`。
