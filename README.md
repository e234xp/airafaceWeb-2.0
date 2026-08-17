# airaFace Web 2.0

airaFace 裝置管理前端，使用 Vue 2 與 Vue CLI 4 建置。

## 環境需求

- Node.js 16.x
- npm 8.x

建議固定使用 Node.js 16，避免新版 Node.js 與舊版 Vue CLI／Webpack 發生相容性問題。

確認目前版本：

```bash
node --version
npm --version
```

## 安裝

依照 `package-lock.json` 安裝相依套件：

```bash
npm ci
```

需要更新相依套件時，才使用：

```bash
npm install
```

## 開發

啟動開發伺服器：

```bash
npm run serve
```

也可以使用：

```bash
npm start
```

開發伺服器使用 HTTPS，憑證位於：

```text
src/assets/https/server.pem
src/assets/https/server-key.pem
```

瀏覽器第一次開啟時，可能會顯示開發憑證警告。

## 開發裝置設定

開發模式使用的裝置位址設定於 `src/globalParams.js`：

```js
const TEST_HOST = '192.168.x.x';
const TEST_PORT = '443';
```

啟動前請確認 `TEST_HOST` 指向要連線的測試裝置。

## Production Build

建立正式環境版本：

```bash
npm run build
```

建置結果預設輸出至 `dist/`。

## 多語系工具

將多語系資料轉換成 CSV：

```bash
npm run i18n2csv
```

將 CSV 轉換回多語系資料：

```bash
npm run csv2i18n
```

## 主要技術

- Vue 2.7
- Vue Router 3
- Vuex 3
- Vue CLI 4
- CoreUI 3
- Element UI 2
- VXETable 3

## Vue CLI 設定

更多設定方式請參考 [Vue CLI Configuration Reference](https://cli.vuejs.org/config/)。
