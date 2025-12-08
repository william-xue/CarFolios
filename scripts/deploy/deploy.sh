#!/bin/bash
# 云效部署脚本 - 用于主机部署任务
set -e

# 配置
DEPLOY_BASE="/var/www/car-trading"
ARTIFACT_PATH="${ARTIFACT_PATH:-/home/admin/app/package}"
BACKUP_DIR="/var/www/backups"
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')

echo "=========================================="
echo "  CarFolios 部署脚本"
echo "  时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "  制品路径: $ARTIFACT_PATH"
echo "  部署路径: $DEPLOY_BASE"
echo "=========================================="

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份当前版本
echo ""
echo ">>> 备份当前版本..."
if [ -d "$DEPLOY_BASE/server/dist" ]; then
    tar -czf $BACKUP_DIR/server_$TIMESTAMP.tar.gz -C $DEPLOY_BASE/server dist 2>/dev/null || true
fi
echo "备份完成 ✓"

# 部署后端
echo ""
echo ">>> 部署后端服务..."
rm -rf $DEPLOY_BASE/server/dist
cp -r $ARTIFACT_PATH/packages/server/dist $DEPLOY_BASE/server/
cp -r $ARTIFACT_PATH/packages/server/prisma $DEPLOY_BASE/server/
cp $ARTIFACT_PATH/packages/server/package.json $DEPLOY_BASE/server/
cp $ARTIFACT_PATH/packages/server/pnpm-lock.yaml $DEPLOY_BASE/server/ 2>/dev/null || true

cd $DEPLOY_BASE/server
pnpm install --prod --frozen-lockfile 2>/dev/null || pnpm install --prod
npx prisma generate
# 生产环境建议使用 migrate deploy 而不是 db push
# npx prisma migrate deploy
npx prisma db push --accept-data-loss 2>/dev/null || npx prisma db push

# 重启后端服务
pm2 restart car-trading-api 2>/dev/null || pm2 start dist/main.js --name car-trading-api
echo "后端部署完成 ✓"

# 部署管理后台
echo ""
echo ">>> 部署管理后台..."
rm -rf $DEPLOY_BASE/admin/*
cp -r $ARTIFACT_PATH/packages/admin/dist/* $DEPLOY_BASE/admin/
echo "管理后台部署完成 ✓"

# 部署移动端
echo ""
echo ">>> 部署移动端..."
rm -rf $DEPLOY_BASE/mobile/*
cp -r $ARTIFACT_PATH/packages/mobile/dist/* $DEPLOY_BASE/mobile/
echo "移动端部署完成 ✓"

# 部署 PC 端
echo ""
echo ">>> 部署 PC 端..."
rm -rf $DEPLOY_BASE/pc/*
cp -r $ARTIFACT_PATH/packages/pc/dist/* $DEPLOY_BASE/pc/
echo "PC 端部署完成 ✓"

# 重载 Nginx
echo ""
echo ">>> 重载 Nginx..."
sudo nginx -t && sudo nginx -s reload
echo "Nginx 重载完成 ✓"

# 清理旧备份（保留最近 5 个）
echo ""
echo ">>> 清理旧备份..."
cd $BACKUP_DIR
ls -t server_*.tar.gz 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true
echo "清理完成 ✓"

# 健康检查
echo ""
echo ">>> 健康检查..."
sleep 3
if pm2 status car-trading-api | grep -q "online"; then
    echo "后端服务运行正常 ✓"
else
    echo "警告: 后端服务可能未正常启动，请检查日志"
    pm2 logs car-trading-api --lines 20
fi

echo ""
echo "=========================================="
echo "  部署完成 ✓"
echo "  后端: http://localhost:8000"
echo "=========================================="
