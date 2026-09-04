# Guard Dashboard 資料 API 規格提案

> 目的：把 Guard（警衛）看板的資料來源整併為**一支 API + 一條 WebSocket**，與 Occupancy 看板採同一套架構。
>
> 本文與 [`occupancy-dashboard-api-spec.md`](./occupancy-dashboard-api-spec.md) 共用大部分運算規則，重複處以引用方式標註，僅完整描述 **Guard 特有** 的部分。
>
> **與 Occupancy 最大的兩個差異，請優先確認：**
> 1. 進出通道的設定來源不同（見 §4.1）——Guard 用的是 GUARD 顯示設定的單一裝置，**不是**考勤設定的裝置群組。
> 2. Guard 多了「陌生人」這塊資料，且**要求併入新的 WebSocket 通道**（見 §7），前端將完全停止訂閱舊的 `verifyresults`。

---

## 1. 現況與問題

### 現在的流程

| 步驟 | 位置 | 行為 |
|---|---|---|
| 1 | `GuardDashboard.vue:494-499` | `findcameras` + `gettabletlist` 各撈 3000 筆，**只為了把裝置 uuid 拼成 `uuid + name` 字串** |
| 2 | `GuardDashboard.vue:523` | `initialGroupPerson()` → `setupPersonData()` 撈全部人員後，前端依 `displayGroup` 逐筆剔除 |
| 3 | `GuardDashboard.vue:549` | `setupVerifyData()` 以 `while` 迴圈打 `querypersonverifyresult` + `queryvisitorverifyresult`，每批 `slice_length: 10000` |
| 4 | `GuardDashboard.vue:557` | `setupStrangerData()` 打 `querystrangerverifyresult` 取陌生人紀錄 |
| 5 | `GuardDashboard.vue:886-1032` | `applyVerifyToPerson()`（147 行）重播所有事件，還原每人進出狀態與每小時進出人次 |
| 6 | `GuardDashboard.vue:398-473` | 訂閱舊 `verifyresults` 通道，`payload.type === 1` 走人員增量、`payload.type === 0` 走陌生人增量 |

### 問題

- **請求數不可控**：人員驗證紀錄分頁迴圈，尖峰時段一次載入可能十餘支 request。
- **裝置比對方式脆弱**：`GuardDashboard.vue:504-518` 把 uuid 與裝置名稱串成 `${uuid}${name}`，再以 `id.indexOf(source_id) >= 0` 做子字串比對。裝置改名或 uuid 互為前綴都可能誤判。
- **計算成本落在瀏覽器**：看板常跑在效能較弱的顯示裝置上。
- **兩條 WebSocket 的維護負擔**：改版後若人員走新通道、陌生人留在舊通道，Guard 需同時掛兩條連線，斷線補償邏輯得寫兩套。**本提案要求陌生人一併併入新通道**。

---

## 2. 畫面實際需要的資料

| 畫面區塊 | 目前來源 | 實際需要 |
|---|---|---|
| 左上「時段進場人數」 | `entryPersons.length`（`GuardDashboard.vue:55`） | 1 個整數（**定義待確認，見 §8.1**） |
| 24 格進出長條圖 | `hourlyPersonInData` / `hourlyPersonOutData`（`GuardDashboard.vue:1057`） | 24 × 2 個整數 |
| 在場人員卡片 | `entryPersons`，經事件重播得到 `status` 與 `clockinRecord`（`GuardDashboard.vue:374`） | 每人一列精簡欄位 |
| 陌生人卡片 | `entryStrangers`（`GuardDashboard.vue:314`） | 每筆一列精簡欄位 |

> Guard **不需要** `groups`（無分組統計顯示），也**不需要** `hourly[].present`（長條圖只畫 in / out 兩條）。

---

## 3. 建議 API

### Endpoint

```
POST /airafacelite/getguarddata
```

### Request

前端不傳查詢區間，由後端依 `dailyResetTime` 自行判斷當前是哪一輪。

```json
{ "range": "all" }
```

| 欄位 | 型別 | 說明 |
|---|---|---|
| `range` | string | `"all"` 時回傳完整 24 筆 `hourly`；未帶時僅回傳當前時段 1 筆。`persons` / `strangers` 兩塊**不論是否帶 `range` 都完整回傳** |
| `with_image` | bool | 固定 `false`，見 §5 |

**所有設定值由後端自行讀取，前端不傳送：**

| 設定 | 來源 | 用途 |
|---|---|---|
| `dailyResetTime` | `getdashboardsettings` → `GUARD` | 判斷查詢區間的起訖 |
| `displayGroup` | `getdashboardsettings` → `GUARD` | 過濾要顯示的人員群組 |
| `deviceIn` | `getdashboardsettings` → `GUARD` | 判定進場通道（**單一裝置 uuid**） |
| `deviceOut` | `getdashboardsettings` → `GUARD` | 判定離場通道（**單一裝置 uuid**） |
| `strangerMaxItem` | `getdashboardsettings` → `GUARD` | `strangers` 回傳筆數上限，預設 100 |

> 前端 `GuardDashboard.vue:494-521`（裝置清單載入與字串拼接）、`:534-546`（`startTS` / `endTS` 推算）整段可移除。

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
      { "slot": 0, "hour": 6, "in": 12, "out": 3 }
    ],
    "persons": [
      {
        "uuid": "5f8a...",
        "id": "E001",
        "name": "李小瑋",
        "group_list": ["Employee"],
        "department": "研發部",
        "title": "工程師",
        "status": 0,
        "last_in_time": 1755430000000,
        "last_out_time": null,
        "is_visitor": false
      }
    ],
    "strangers": [
      {
        "verify_uuid": "9c1e...",
        "timestamp": 1755431200000,
        "face_image_id": "af31...",
        "verify_score": 0.72,
        "nearest_person": {
          "uuid": "5f8a...",
          "id": "E001",
          "name": "李小瑋"
        }
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

規則與 Occupancy 規格 §3「`hourly`」**完全相同**（`slot` 以 `dailyResetTime` 為起點、換算公式 `slot = (時鐘小時 − 重置小時 + 24) % 24`、單筆回傳仍以陣列包覆並帶 `slot` 與 `hour`），差異僅兩點：

| 欄位 | 型別 | 說明 |
|---|---|---|
| `slot` | int | `0` ~ `23`，圖表由左至右的位置 |
| `hour` | int | 時鐘小時（0-23），X 軸標籤用；前端優先以此欄位反推 `slot` |
| `in` | int | 該時段的進場**人次** |
| `out` | int | 該時段的離場**人次**，**回傳正整數** |
| ~~`present`~~ | — | **Guard 不需要，可省略** |

> ⚠️ **`out` 不要回傳負數。** Guard 的長條圖為堆疊圖（`ChartHelper.vue:289` 以 `in + out` 求 Y 軸上限），與 Occupancy 的上下對稱圖不同，前端不做正負轉換。

#### `persons`

**扁平清單，每人一筆。** 排序由前端負責（依 `last_in_time` 由新到舊），後端不需排序。

**須回傳全部經 `displayGroup` 過濾後的人員，不可只回傳在場者**——卡片列表雖只渲染 `status === 0` 的人，但陌生人確認流程需要查出「最相似人員」的資料，該人員可能已離場。

| 欄位 | 型別 | 前端用途 |
|---|---|---|
| `uuid` | string | 主鍵；WebSocket 增量比對、`fetchphoto` 抓照片 |
| `id` | string | 卡片文字（`line2` 選 `ID` 時） |
| `name` | string | 卡片主要顯示名稱（`line1`），含 `PARTIALNAME` 遮蔽模式的來源 |
| `group_list` | string[] | 卡片文字（`line2` 選 `GROUP` 時，前端會濾掉 `All Person` / `All Visitor`） |
| `department` | string | 卡片文字（`line2` 選 `DEPARTMENT`，原取自 `extra_info.department`） |
| `title` | string | 卡片文字（`line2` 選 `JOBTITLE`，原取自 `extra_info.title`） |
| `status` | int | `0` = 在場、`1` = 離場。決定卡片是否顯示 |
| `last_in_time` | int64\|null | **卡片右下角顯示的進場時間**（現行為 `item.clockinRecord.timestamp`），同時為列表排序鍵 |
| `last_out_time` | int64\|null | 目前未顯示，建議一併提供 |
| `is_visitor` | bool | 訪客標記 |

> 與 Occupancy 的 `persons` 相比少了 `primary_group`（Guard 無分組色條）與 `punch_mode`（Guard 無分組計數）。若後端以同一份結構回傳，多帶這兩個欄位前端會忽略，不影響。

#### `strangers`

**須為後端過濾後的結果**，以下兩類不回傳（現行由前端 `GuardDashboard.vue:564` 過濾，一併搬至後端）：

- `merged === true`：已被合併到既有人員的紀錄
- 已帶 `commands`：警衛已備註或確認過的紀錄

排序：依 `timestamp` **由新到舊**，最多 `strangerMaxItem` 筆。

**只回傳由 `deviceIn` 進場的陌生人**（現行 `applyVerifyToStranger()` 僅比對 `params_entryChannels`，離場通道的陌生人不列入）。

| 欄位 | 型別 | 前端用途 |
|---|---|---|
| `verify_uuid` | string | 主鍵；卡片 `:key`、勾選狀態、`addcommands` 的 records 欄位 |
| `timestamp` | int64 | 卡片顯示時間、`addcommands` 的 records 欄位 |
| `face_image_id` | string | 抓拍照的懶載入 id，前端以 `fetchverifyphoto` 取得（見 §5） |
| `verify_score` | float | 確認視窗顯示的相似度，前端以 `(score * 100).toFixed(0)` 呈現百分比 |
| `nearest_person` | object\|null | 最相似的既有人員；無相似人員時給 `null` |
| `nearest_person.uuid` | string | 前端以 `fetchphoto` 取該人的註冊照 |
| `nearest_person.id` | string | 確認視窗顯示 |
| `nearest_person.name` | string | 確認視窗顯示 |

> **`nearest_person` 請直接帶 `id` / `name`，不要只給 uuid。** 現行前端是拿 uuid 回頭在 `persons` 陣列裡找（`GuardDashboard.vue:678`），找不到就退化成無相似人員；直接帶欄位可移除這層耦合。

---

## 4. 運算規則

### 4.1 進出事件判定（**與 Occupancy 不同，請特別注意**）

| | Occupancy | **Guard** |
|---|---|---|
| 設定來源 | `getattendancesettings` | **`getdashboardsettings` → `GUARD`** |
| 進場通道 | `video_device_group_in`（裝置**群組**，需展開成 uuid 清單） | **`deviceIn`（單一裝置 uuid）** |
| 離場通道 | `video_device_group_out`（裝置**群組**） | **`deviceOut`（單一裝置 uuid）** |

判定順序：

1. `verify_mode === 3` 視為**進場**，`verify_mode === 4` 視為**離場**。
2. 其他 `verify_mode`（單純通行）以 `source_id` 比對通道：
   - `source_id === deviceIn` → 進場
   - `source_id === deviceOut` → 離場
   - 皆不符 → 不列入統計
3. 所有事件依 `timestamp` 由小到大排序後處理。

> **請以 uuid 完全相等比對**，不要沿用前端目前的子字串比對（`GuardDashboard.vue:907`：`id.indexOf(source_id) >= 0`，其中 `id` 是 `uuid + 裝置名稱` 的拼接字串）。該寫法是為了繞過舊 payload 的 `source_id` 格式問題，改由後端判定後即可回歸正規比對。

### 4.2 人員在場狀態

同 Occupancy 規格 §4.2，規則不變：

| 條件 | `status` |
|---|---|
| 無進場紀錄 | 1（離場） |
| 有進場、無離場 | 0（在場） |
| 有進場、有離場，進場時間 > 離場時間 | 0（在場） |
| 有進場、有離場，進場時間 < 離場時間 | 1（離場） |

### 4.3 每時段進出人次

`hourly[slot].in` / `.out` 為該時段的**事件人次**（同一人同時段進出兩次計 2），非去重人數。此點與現行前端行為一致（`GuardDashboard.vue:963-966`：每筆事件 push 一次 uuid，取陣列長度）。

### 4.4 訪客合併

訪客的驗證紀錄需與人員紀錄合併統計，並以 `is_visitor: true` 標示。

### 4.5 人員過濾

僅回傳 `group_list` 與 `displayGroup` 有交集的人員。`summary.total` 為過濾後的人數。

---

## 5. 照片處理

**`persons` 與 `strangers` 皆不得內嵌 base64 影像。**

| 影像 | 取得方式 | 時機 |
|---|---|---|
| 在場人員卡片 | `fetchphoto`（帶 `persons[].uuid`） | 前端翻頁時，只抓當前頁 |
| 陌生人卡片 | `fetchverifyphoto`（帶 `strangers[].face_image_id`） | 前端翻頁時，只抓當前頁 |
| 確認視窗的相似人員註冊照 | `fetchphoto`（帶 `nearest_person.uuid`） | 開啟確認視窗時 |

此設計與現行 `refreshData()` / `refreshStranger()` 的懶載入機制相同，不需變更。

---

## 6. 不受影響的 API

以下維持現狀，本次不調整：

| API | 用途 |
|---|---|
| `POST /airafacelite/addcommands` | 陌生人備註／確認（`GuardDashboard.vue:742`） |
| `POST /airafacelite/fetchphoto` | 人員照片懶載入 |
| `POST /airafacelite/fetchverifyphoto` | 陌生人抓拍照懶載入 |

---

## 7. WebSocket 即時更新

沿用 Occupancy 的專用通道 `/airafacelite/verifyondashboard`，**Guard 訂閱同一條連線**。

改版後 Guard **完全停止訂閱舊的 `verifyresults` 通道**，因此該通道現有的兩類推播都必須在新通道有對應：

| 舊通道事件 | 新通道對應 |
|---|---|
| `payload.type === 1`（人員驗證） | `guard.type === "person"` |
| `payload.type === 0`（陌生人） | **`guard.type === "stranger"`（本次新增）** |

### 7.1 Payload 格式

一則推播同時帶多個看板的判定結果，Guard 只讀取 `guard` 區塊。既有的 `occupancy` / `capacity` 區塊格式不變。

**`guard` 區塊新增 `type` 欄位作為判別子**，兩種事件的欄位如下：

**人員進出事件**

```json
{
  "occupancy": { "counted": true, "direction": "in", "person_uuid": "3257c8e0-...", "status": 0 },
  "capacity":  { "counted": true, "direction": "in", "person_uuid": "3257c8e0-...", "status": 0 },
  "guard": {
    "type": "person",
    "counted": true,
    "direction": "in",
    "person_uuid": "3257c8e0-...",
    "status": 0,
    "last_in_time": 1755431200000
  }
}
```

**陌生人事件**

```json
{
  "occupancy": { "counted": false, "direction": "", "person_uuid": "", "status": 0 },
  "capacity":  { "counted": false, "direction": "", "person_uuid": "", "status": 0 },
  "guard": {
    "type": "stranger",
    "counted": true,
    "verify_uuid": "9c1e...",
    "timestamp": 1755431200000,
    "face_image_id": "af31...",
    "verify_score": 0.72,
    "nearest_person": { "uuid": "5f8a...", "id": "E001", "name": "李小瑋" }
  }
}
```

#### 共用欄位

| 欄位 | 型別 | 說明 |
|---|---|---|
| `type` | string | `"person"` 或 `"stranger"`。**未帶時前端視為 `"person"`**，以相容既有實作 |
| `counted` | bool | 此事件是否計入。`source_id` 不屬於 `deviceIn` / `deviceOut`、人員不在 `displayGroup` 內時給 `false`，前端直接忽略 |

#### `type === "person"` 的欄位

| 欄位 | 型別 | 說明 |
|---|---|---|
| `direction` | string | `"in"` 進場 / `"out"` 離場。判定規則同 §4.1 |
| `person_uuid` | string | 對應 `persons[].uuid` |
| `status` | int | 該人員最新狀態：`0` 在場 / `1` 離場 |
| `last_in_time` | int64 | **本次進場的時間戳**。卡片右下角要顯示進場時間，且列表依此排序；`direction === "out"` 時可省略 |

> `last_in_time` 是相對 Occupancy 多出的欄位。若不提供，前端只能以「收到推播的當下時間」近似，會與後續整點重載的值不一致，造成卡片順序跳動。

#### `type === "stranger"` 的欄位

欄位定義同 §3 `strangers` 的各欄位。前端收到後直接 unshift 進陌生人清單，並以 `face_image_id` 懶載入抓拍照。

> **`counted` 的判定**：陌生人事件僅在 `source_id === deviceIn` 時給 `true`（與 §3 `strangers` 的過濾條件一致，離場通道的陌生人不顯示）。

### 7.2 前端處理流程

```js
const g = payload && payload.guard;
if (!g || !g.counted) return;

if (g.type === 'stranger') {
  this.strangers.unshift({ ...g });
  if (this.strangers.length > this.displaySettings.strangerMaxItem) this.strangers.pop();
  this.fetchStrangerPhotosForCurrentPage();
  return;
}

// type === 'person'
const person = this.persons.find((p) => p.uuid === g.person_uuid);
if (person) {
  person.status = g.status;
  if (g.direction === 'in' && g.last_in_time) person.last_in_time = g.last_in_time;
}

const cell = this.hourly[this.currentSlot()];
if (cell) {
  if (g.direction === 'in') cell.in += 1;
  else cell.out += 1;
}

this.refreshBarChart();
```

無事件重播、無進出配對、無通道比對。`applyVerifyToPerson()`（`GuardDashboard.vue:886-1032`）與 `applyVerifyToStranger()`（`:1034-1055`）可完全移除。

### 7.3 心跳與連線狀態

沿用 Occupancy 通道的現行約定：心跳訊息帶 `statusCode: '200'`，前端收到即跳過；連線中斷時前端蓋上遮罩。

### 7.4 對帳缺口與補償

同 Occupancy 規格 §7.4。前端於下列時機改帶 `range: "all"` 重新載入：

| 時機 | 原因 |
|---|---|
| WebSocket **重連成功** | 補齊斷線期間的偏差 |
| 跨越 `dailyResetTime` | 進入新的一輪 |
| 每個整點 | 圖表推進一格（此時**不帶** `range`，僅取當前時段 1 筆） |

**前提**：`summary` / `persons` / `strangers` 三塊在每次呼叫時**皆須完整回傳**，不可比照 `hourly` 縮減。

### 7.5 後端計算頻率

| 時機 | 後端動作 |
|---|---|
| 看板開啟 | 全量計算 1 次（24 筆） |
| 每個整點 | 計算當前時段 1 筆 |
| WebSocket 重連 | 全量計算 1 次（24 筆） |
| 有人進出／偵測到陌生人 | **不重算**，僅推送既有欄位 |

---

## 8. 待確認事項

### 8.1 左上角數字的定義

`GuardDashboard.vue:53-57` 的標籤是 `HourlyNumberOfAdmission`（時段進場人數），但綁定的值是 `entryPersons.length`（目前在場人數），兩者不一致。

**需確認**應顯示：

- (A) 目前在場人數 → 用 `summary.present`
- (B) 當前時段進場人次 → 用 `hourly[currentSlot].in`

此為前端既有問題，但會影響要取用哪個欄位。API 兩者都會提供，先確認語意即可。

### 8.2 陌生人抓拍照的傳遞方式

本文 §5 / §7.1 採 **`face_image_id` + 懶載入**，與人員照片一致，可維持通道輕量。

替代方案：推播時直接內嵌 base64 `face_image`。優點是陌生人卡片立即顯示、省一次往返；陌生人事件頻率遠低於人員進出，成本可接受。

**需後端評估**推播當下是否已持有影像。若已在記憶體中，直接內嵌反而更簡單。兩案擇一即可，前端皆可配合。

### 8.3 `guard` 區塊目前的判定依據

新通道的 `guard` 區塊已存在（見 Occupancy 規格 §7.1 的 payload 範例），但該區塊目前**依哪一組設定判定進出**未定義。

**需確認**：是否已依 GUARD 設定的 `deviceIn` / `deviceOut`？若目前是沿用考勤設定的裝置群組，Guard 的統計範圍會與設定頁的「進場裝置／離場裝置」脫鉤，需修正。

### 8.4 跨午夜的在場區間

同 Occupancy 規格 §6.4。請確認後端以 `slot` 座標系（`dailyResetTime` 為起點）而非時鐘小時進行區間填充，否則夜班情境會整批遺漏。

### 8.5 `dailyResetTime` 的格式

同 Occupancy 規格 §6.3。GUARD 設定的 `dailyResetTime` 同樣可能是 `"06"` 或 `"06:00"`（`GuardControlSettingForm.vue:284` 預設為 `'00:00'`，但 `value_displayResetTime` 選項為 `'00'`~`'23'` 兩字元）。請以數值比較，勿用字串比較。

### 8.6 與 `getoccupancydata` 已知問題的連動

Occupancy 規格 §9 列出的三項問題（`hourly` 的 `in` / `out` 量級異常、`present` 定義錯誤、`groups` 混入裝置群組）目前尚未修正。

其中前兩項若與本 API **共用同一份實作**，Guard 的長條圖會有相同錯誤。**需確認兩支 API 的 `hourly` 計算是否共用**；若共用，請一併修正。

---

## 9. 預期效益

| 項目 | 現況 | 改版後 |
|---|---|---|
| 初次載入 Request 數 | 人員驗證分頁迴圈 + 訪客迴圈 + 陌生人 + 攝影機 + 平板，可達十餘支 | 固定 1 支 |
| 初次載入傳輸量 | 整天原始事件 + 3000 筆裝置清單，可達數 MB | 數十 KB |
| WebSocket 連線數 | 1 條（舊 `verifyresults`） | 1 條（新 `verifyondashboard`） |
| 即時更新 | 收原始事件，前端做完整進出判定與重播 | 收判定結果，前端僅計數 |
| 裝置通道比對 | 前端字串拼接 + 子字串比對 | 後端 uuid 完全比對 |
| 前端運算 | O(n) 事件重播 + 進出配對 + 群組過濾 | 僅 O(n) 計數 |
| 可移除的前端程式碼 | — | `applyVerifyToPerson()`、`applyVerifyToStranger()`、`getHourlyPresentData()`、`initialGroupPerson()`、裝置清單載入與查詢區間推算，約 300 行 |
