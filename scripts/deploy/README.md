# 阿里云效 CI/CD 快速配置指南

## 📋 配置步骤（5分钟搞定）

### 第一步：服务器准备

1. 登录你的 ECS 服务器
2. 执行初始化脚本：
```bash
# 下载并执行
curl -O https://raw.githubusercontent.com/your-repo/scripts/deploy/server-init.sh
chmod +x server-init.sh
./server-init.sh
```

或者手动执行：
```bash
# 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装工具
npm install -g pnpm pm2

# 安装 Nginx
sudo apt-get install -y nginx

# 创建目录
sudo mkdir -p /var/www/car-trading/{admin,mobile,pc,server,uploads}
sudo chown -R $USER:$USER /var/www/car-trading
```

### 第二步：配置数据库

```bash
# 安装 PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# 创建数据库和用户
sudo -u postgres psql
CREATE USER carfolios WITH PASSWORD 'your_password';
CREATE DATABASE carfolios OWNER carfolios;
\q
```

### 第三步：配置环境变量

```bash
# 创建 .env 文件
nano /var/www/car-trading/server/.env
```

粘贴以下内容（修改密码和密钥）：
```env
DATABASE_URL="postgresql://carfolios:your_password@localhost:5432/carfolios"
JWT_SECRET="your-secret-key-change-this"
NODE_ENV=production
```

### 第四步：配置 Nginx

```bash
# 复制配置
sudo cp scripts/deploy/nginx.conf /etc/nginx/sites-available/car-trading

# 修改域名
sudo nano /etc/nginx/sites-available/car-trading
# 把 your-domain.com 替换成你的实际域名

# 启用配置
sudo ln -s /etc/nginx/sites-available/car-trading /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 第五步：云效配置

#### 5.1 添加主机组

1. 进入云效 → 设置 → 服务连接 → 主机组
2. 点击「新建主机组」
3. 填写：
   - 名称：`car-trading-prod`
   - 添加主机：填写 ECS 的公网 IP
   - 认证方式：密码 或 SSH 密钥

#### 5.2 配置流水线

根据你的截图，你已经创建了流水线，现在配置各个节点：

**代码源节点**：
- 选择你的 Codeup 仓库
- 分支：main
- 勾选「代码变更触发」

**Node.js 构建节点**：
- Node 版本：18
- 构建命令：
```bash
npm install -g pnpm
cd packages/server && pnpm install && pnpm run build && cd ..
cd packages/admin && pnpm install && pnpm run build && cd ..
cd packages/mobile && pnpm install && pnpm run build && cd ..
cd packages/pc && pnpm install && pnpm run build && cd ..
```
- 制品路径：`.`

**主机部署节点**：
- 选择主机组：`car-trading-prod`
- 部署脚本：
```bash
#!/bin/bash
set -e
DEPLOY_BASE="/var/www/car-trading"
ARTIFACT_PATH="${ARTIFACT_PATH:-/home/admin/app/package}"

# 部署后端
cp -r $ARTIFACT_PATH/packages/server/dist $DEPLOY_BASE/server/
cp -r $ARTIFACT_PATH/packages/server/prisma $DEPLOY_BASE/server/
cp $ARTIFACT_PATH/packages/server/package.json $DEPLOY_BASE/server/
cd $DEPLOY_BASE/server
pnpm install --prod
npx prisma generate
npx prisma db push
pm2 restart car-trading-api || pm2 start dist/main.js --name car-trading-api

# 部署前端
rm -rf $DEPLOY_BASE/admin/* && cp -r $ARTIFACT_PATH/packages/admin/dist/* $DEPLOY_BASE/admin/
rm -rf $DEPLOY_BASE/mobile/* && cp -r $ARTIFACT_PATH/packages/mobile/dist/* $DEPLOY_BASE/mobile/
rm -rf $DEPLOY_BASE/pc/* && cp -r $ARTIFACT_PATH/packages/pc/dist/* $DEPLOY_BASE/pc/

sudo nginx -s reload
echo "部署完成"
```

### 第六步：运行流水线

点击「保存并运行」，等待部署完成！

---

## 🔧 常见问题

### Q: 构建失败 - pnpm not found
在构建命令开头添加：`npm install -g pnpm`

### Q: 部署失败 - Permission denied
在服务器上执行：
```bash
sudo chown -R $USER:$USER /var/www/car-trading
```

### Q: PM2 启动失败
```bash
# 查看日志
pm2 logs car-trading-api

# 手动启动测试
cd /var/www/car-trading/server
node dist/main.js
```

### Q: 数据库连接失败
检查 `.env` 文件中的 `DATABASE_URL` 是否正确。

---

## 📁 文件说明

| 文件 | 说明 |
|------|------|
| `build.sh` | 云效构建脚本 |
| `deploy.sh` | 云效部署脚本 |
| `server-init.sh` | 服务器初始化脚本 |
| `nginx.conf` | Nginx 配置模板 |
| `.env.example` | 环境变量模板 |

---

## 🎯 部署后验证

```bash
# 检查后端服务
curl http://localhost:8000/api

# 检查 PM2 状态
pm2 status

# 检查 Nginx
sudo nginx -t
```

访问你的域名验证前端是否正常。
