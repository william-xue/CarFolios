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
