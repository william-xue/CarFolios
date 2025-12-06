#!/bin/bash

# 车故二手车交易平台 - 开发环境一键启动脚本
# 启动所有服务：server(8000), pc(3001), mobile(3002), admin(3003)

echo "🚗 启动车故二手车交易平台开发环境..."
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查 pnpm 是否安装
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}❌ pnpm 未安装，请先安装 pnpm${NC}"
    exit 1
fi

# 启动函数
start_service() {
    local name=$1
    local dir=$2
    local port=$3
    local color=$4
    
    echo -e "${color}▶ 启动 $name (端口: $port)...${NC}"
    cd "$dir" && pnpm dev &
    cd - > /dev/null
}

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# 启动所有服务
start_service "Server (后端API)" "packages/server" "8000" "$GREEN"
sleep 2  # 等待后端先启动

start_service "PC (用户端)" "packages/pc" "3001" "$BLUE"
start_service "Mobile (移动端)" "packages/mobile" "3002" "$YELLOW"
start_service "Admin (管理后台)" "packages/admin" "3003" "$RED"

echo ""
echo -e "${GREEN}✅ 所有服务已启动！${NC}"
echo ""
echo "📍 访问地址："
echo -e "   ${GREEN}Server API:${NC}  http://localhost:8000"
echo -e "   ${BLUE}PC 用户端:${NC}   http://localhost:3001"
echo -e "   ${YELLOW}Mobile 移动端:${NC} http://localhost:3002"
echo -e "   ${RED}Admin 管理后台:${NC} http://localhost:3003"
echo ""
echo -e "${YELLOW}💡 按 Ctrl+C 停止所有服务${NC}"
echo ""

# 等待所有后台进程
wait
