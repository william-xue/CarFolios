#!/bin/bash
# 服务器初始化脚本 - 首次部署前在服务器上执行
set -e

echo "=========================================="
echo "  CarFolios 服务器初始化脚本"
echo "  时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="

# 检测系统
if [ -f /etc/debian_version ]; then
    PKG_MANAGER="apt-get"
    echo "检测到 Debian/Ubuntu 系统"
elif [ -f /etc/redhat-release ]; then
    PKG_MANAGER="yum"
    echo "检测到 CentOS/RHEL 系统"
else
    echo "未知系统，请手动安装依赖"
    exit 1
fi

# 更新系统
echo ""
echo ">>> 更新系统包..."
sudo $PKG_MANAGER update -y

# 安装 Node.js 18.x
echo ""
echo ">>> 安装 Node.js 18.x..."
if [ "$PKG_MANAGER" = "apt-get" ]; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
    sudo yum install -y nodejs
fi
node -v
npm -v

# 安装 pnpm
echo ""
echo ">>> 安装 pnpm..."
npm install -g pnpm
pnpm -v

# 安装 PM2
echo ""
echo ">>> 安装 PM2..."
npm install -g pm2
pm2 -v

# 安装 Nginx
echo ""
echo ">>> 安装 Nginx..."
if [ "$PKG_MANAGER" = "apt-get" ]; then
    sudo apt-get install -y nginx
else
    sudo yum install -y nginx
fi
nginx -v

# 创建部署目录
echo ""
echo ">>> 创建部署目录..."
sudo mkdir -p /var/www/car-trading/{admin,mobile,pc,server,uploads}
sudo mkdir -p /var/www/backups
sudo chown -R $USER:$USER /var/www/car-trading
sudo chown -R $USER:$USER /var/www/backups
sudo chmod -R 755 /var/www/car-trading

# 创建 uploads 目录并设置权限
sudo chmod -R 777 /var/www/car-trading/uploads

echo ""
echo "=========================================="
echo "  服务器初始化完成 ✓"
echo ""
echo "  下一步操作："
echo "  1. 配置数据库（PostgreSQL/MySQL）"
echo "  2. 创建 /var/www/car-trading/server/.env 文件"
echo "  3. 配置 Nginx"
echo "  4. 在云效配置主机组"
echo "=========================================="
