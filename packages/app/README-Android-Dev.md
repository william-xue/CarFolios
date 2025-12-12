# Android 开发环境启动指南

> 本文档记录如何在本地启动 CarFolios Android 开发环境

---

## 前置条件

- Android Studio 已安装
- 虚拟机 `Pixel 7 Pro` (API 34, Android 14) 已创建
- Node.js >= 20
- 项目依赖已安装 (`pnpm install` 或 `npm install`)

---

## 启动步骤（按顺序执行）

### 第一步：启动后端服务

```bash
cd /Users/xueyuan/Desktop/CarFolios/packages/server
pnpm dev
```

等待看到：
```
🚀 Server running on http://localhost:8000
📚 API Docs: http://localhost:8000/api/docs
```

---

### 第二步：启动 Android 虚拟机

**方式 A：通过 Android Studio**
1. 打开 Android Studio
2. 点击右侧 `Device Manager`
3. 找到 `Pixel 7 Pro`，点击绿色三角形 ▶️ 启动

**方式 B：通过命令行**
```bash
emulator -avd Pixel_7_Pro &
```

等待虚拟机完全启动到桌面。

---

### 第三步：启动 Metro Bundler

```bash
cd /Users/xueyuan/Desktop/CarFolios/packages/app
npx react-native start
```

等待看到：
```
INFO  Dev server ready
```

---

### 第四步：配置 ADB 端口转发（重要！）

在**新的终端窗口**执行：

```bash
cd /Users/xueyuan/Desktop/CarFolios/packages/app

# Metro bundler 端口转发
adb reverse tcp:8081 tcp:8081

# 后端 API 端口转发（App 代码里写的是 3000，后端实际跑在 8000）
adb reverse tcp:3000 tcp:8000

# 验证配置
adb reverse --list
```

应该看到：
```
host-xx tcp:8081 tcp:8081
host-xx tcp:3000 tcp:8000
```

---

### 第五步：安装并运行 App

```bash
cd /Users/xueyuan/Desktop/CarFolios/packages/app
npx react-native run-android
```

等待构建完成，App 会自动安装到虚拟机并启动。

---

## 一键启动脚本（可选）

如果你想简化流程，可以在项目根目录创建 `start-android.sh`：

```bash
#!/bin/bash

echo "🚀 启动 Android 开发环境..."

# 1. 启动虚拟机（后台）
echo "📱 启动虚拟机..."
emulator -avd Pixel_7_Pro &
sleep 20

# 2. 等待设备就绪
adb wait-for-device
echo "✅ 虚拟机已就绪"

# 3. 配置端口转发
echo "🔗 配置端口转发..."
adb reverse tcp:8081 tcp:8081
adb reverse tcp:3000 tcp:8000
adb reverse --list

echo ""
echo "✅ 端口转发已配置"
echo ""
echo "接下来请手动执行："
echo "  1. 终端1: cd packages/server && pnpm dev"
echo "  2. 终端2: cd packages/app && npx react-native start"
echo "  3. 终端3: cd packages/app && npx react-native run-android"
```

---

## 常见问题

### Q: 虚拟机里 App 一直转圈加载不出数据？

**检查端口转发：**
```bash
adb reverse --list
```
确保有 `tcp:3000 tcp:8000` 这一行。

**检查后端是否在运行：**
```bash
curl http://localhost:8000/api/brands
```
应该返回 JSON 数据。

---

### Q: 报错 "Unable to load script"？

1. 确保 Metro bundler 在运行
2. 执行端口转发：
   ```bash
   adb reverse tcp:8081 tcp:8081
   ```
3. 在虚拟机里摇一摇（或 Cmd+M）→ Reload

---

### Q: 虚拟机网络不通？

如果 `Pixel_9` 等虚拟机网络有问题，建议：
1. 在 Android Studio Device Manager 里删除有问题的 AVD
2. 新建一个 `Pixel 7 Pro` + `API 34 (Android 14)` 的虚拟机

---

### Q: 如何调试？

1. **打开 Chrome DevTools**：在 Metro 终端按 `j` 键
2. **查看网络请求日志**：Console 里会打印 `[API Request]` 和 `[API Response]`
3. **重新加载 App**：在 Metro 终端按 `r` 键

---

## 端口说明

| 服务 | 本机端口 | 虚拟机访问地址 |
|------|----------|----------------|
| Metro Bundler | 8081 | localhost:8081 |
| 后端 API | 8000 | localhost:3000 (通过 adb reverse 映射) |

---

## 快速命令参考

```bash
# 查看已连接设备
adb devices

# 查看端口转发列表
adb reverse --list

# 重新加载 App（在 Metro 终端）
按 r 键

# 打开 DevTools（在 Metro 终端）
按 j 键

# 清理并重新构建
cd packages/app/android && ./gradlew clean && cd ..
npx react-native run-android
```

---

## 完整启动顺序总结

```
1. 启动后端      → cd packages/server && pnpm dev
2. 启动虚拟机    → Android Studio / emulator 命令
3. 启动 Metro   → cd packages/app && npx react-native start
4. 配置端口转发  → adb reverse tcp:8081 tcp:8081 && adb reverse tcp:3000 tcp:8000
5. 运行 App     → npx react-native run-android
```

---

*文档更新时间：2024-12-10*
