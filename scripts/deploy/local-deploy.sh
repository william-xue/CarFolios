#!/bin/bash
# 本地一键部署脚本：拉取 Git、构建四个前端 + 后端，并重启服务
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BRANCH="${1:-main}"

log() {
  printf '\n\033[1;34m[CarFolios]\033[0m %s\n' "$1"
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "缺少命令: $1，请先安装后重试"
    exit 1
  fi
}

require_cmd git
require_cmd pnpm
require_cmd pm2
require_cmd nginx

cd "$PROJECT_ROOT"
log "当前项目目录: $PROJECT_ROOT"

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$CURRENT_BRANCH" != "$BRANCH" ]]; then
  log "切换分支 $BRANCH"
  git checkout "$BRANCH"
fi

log "拉取最新代码 ($BRANCH)"
git fetch origin "$BRANCH"
git pull origin "$BRANCH"

build_frontend() {
  local NAME=$1
  local DIR=$2
  log "构建 $NAME"
  pushd "$DIR" >/dev/null
  pnpm install --prefer-offline --frozen-lockfile || pnpm install --prefer-offline
  pnpm run build
  popd >/dev/null
}

log "构建后端 server"
pushd packages/server >/dev/null
pnpm install --prefer-offline --frozen-lockfile || pnpm install --prefer-offline
pnpm prisma generate
pnpm run build
pnpm prisma db push --accept-data-loss || pnpm prisma db push
popd >/dev/null

build_frontend "PC 用户端" "packages/pc"
build_frontend "移动端 H5" "packages/mobile"
build_frontend "管理后台" "packages/admin"

log "重启后端 PM2 服务"
pm2 restart car-trading-api || pm2 start packages/server/dist/main.js --name car-trading-api

log "重新加载 Nginx 配置"
nginx -t
systemctl reload nginx

log "部署完成！访问：\n - PC: http://<server-ip>:3000\n - Admin: http://<server-ip>:3001\n - Mobile: http://<server-ip>:3002"
