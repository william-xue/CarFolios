#!/bin/bash
# 云效构建脚本 - 用于 Node.js 构建任务
set -e

echo "=========================================="
echo "  CarFolios 构建脚本"
echo "  时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="

# 安装 pnpm
echo ">>> 安装 pnpm..."
npm install -g pnpm

# 构建后端
echo ""
echo ">>> 构建后端服务..."
cd packages/server
pnpm install
pnpm run build
echo "后端构建完成 ✓"
cd ..

# 构建管理后台
echo ""
echo ">>> 构建管理后台..."
cd packages/admin
pnpm install
pnpm run build
echo "管理后台构建完成 ✓"
cd ..

# 构建移动端
echo ""
echo ">>> 构建移动端..."
cd packages/mobile
pnpm install
pnpm run build
echo "移动端构建完成 ✓"
cd ..

# 构建 PC 端
echo ""
echo ">>> 构建 PC 端..."
cd packages/pc
pnpm install
pnpm run build
echo "PC 端构建完成 ✓"
cd ..

echo ""
echo "=========================================="
echo "  所有构建完成 ✓"
echo "=========================================="
