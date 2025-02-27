# airafaceweb-2.0

## 專案開啟方式
  - git clone 專案
  - 在 sourceTree 抓取遠端 origin/feat/customer-board
  - yarn install --ignore-engines
    - 套件有 node 版本衝突 a > 18, b < 18, 忽略就可以正常安裝, 功能看起來不受影響
  - yarn serve 執行
  - 進入登入頁面登入後, F12 有一個 POST 的錯誤訊息, 連結該網址（會有警告等表示）, 不用理會 連結過去拿到token, 就可以正常登入