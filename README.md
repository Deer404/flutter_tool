# FLT - Flutter Tool

> 简化Flutter开发的命令行工具

## 📦 安装

```bash
npm install -g flt
```

## 🚀 使用方法

### 构建APK

```bash
# 构建debug版本
flt build

# 构建release版本
flt build --release

# 自定义APK名称前缀
flt build --name myapp
```

### Android设备管理

```bash
# 列出连接的设备
flt android devices

# 运行应用到设备
flt android install

# 指定设备运行
flt android install --device <device-id>
```

## 📋 命令详解

### `flt build`

构建Flutter APK，支持以下选项：

- `-r, --release`: 构建release版本（默认为debug版本）
- `-n, --name <name>`: 自定义APK名称前缀（默认为"app"）

生成的APK会自动添加时间戳重命名，例如：`app-debug-202412301430.apk`

### `flt android`

Android相关操作：

#### `flt android devices` (别名: `flt android d`)

列出所有连接的Android设备及其状态。

#### `flt android install` (别名: `flt android i`)

运行Flutter应用到连接的Android设备：

- `-d, --device <device>`: 指定设备ID

## 🔧 系统要求

- Node.js >= 16.0.0
- Flutter SDK
- Android SDK (用于Android操作)

## 🎯 特性

- ✅ 跨平台支持 (macOS, Windows, Linux)
- ✅ 自动重命名APK文件
- ✅ 彩色输出
- ✅ 智能设备检测
- ✅ TypeScript支持
- ✅ 基于rslib构建

## 📝 开发

```bash
# 克隆项目
git clone <repo-url>
cd flt

# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建项目
pnpm build

# 本地测试
npm link
```

## �� 许可证

MIT License 