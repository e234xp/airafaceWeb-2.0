#!/usr/bin/env bash
# 用 Node 16 打包，再把 dist/ 的內容 rsync 到測試機的 wwwdist
# 用法：npm run deploy 或 ./scripts/deploy.sh
# 可用環境變數覆寫目標：DEPLOY_HOST=21 DEPLOY_DIR=/home/aira/product/sw/wwwdist
set -euo pipefail

DEPLOY_HOST="${DEPLOY_HOST:-21}" # ~/.ssh/config 裡的 Host 21 → aira@192.168.14.21
DEPLOY_DIR="${DEPLOY_DIR:-/home/aira/product/sw/wwwdist}"

cd "$(dirname "$0")/.."

# 從 npm run 或非互動 shell 執行時不會載入 .zshrc，要自己載入 nvm 再依 .nvmrc 切版本
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [[ ! -s "$NVM_DIR/nvm.sh" ]]; then
  echo "找不到 nvm（$NVM_DIR/nvm.sh）" >&2
  exit 1
fi
# shellcheck source=/dev/null
. "$NVM_DIR/nvm.sh"
nvm use >/dev/null
echo "==> Node $(node -v)"

echo "==> npm run build"
npm run build

echo "==> 同步 dist/ 到 ${DEPLOY_HOST}:${DEPLOY_DIR}"
ssh "$DEPLOY_HOST" "mkdir -p '$DEPLOY_DIR'"
# --delete 讓遠端與 dist/ 完全一致，清掉舊版 build 留下、檔名帶 hash 的 js/css。
# 來源結尾的斜線不能拿掉，否則會同步成 wwwdist/dist/
rsync -az --delete dist/ "${DEPLOY_HOST}:${DEPLOY_DIR}/"

echo "==> 部署完成"
