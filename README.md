# FLT - Flutter Tool

> 简化Flutter开发的命令行工具

## 📦 安装

```bash
npm install -g @deer404/flt
```

## 🚀 使用方法

### 构建APK

```bash
# 构建debug版本
flt android build

# 构建release版本
flt android build --release

# 自定义APK名称前缀
flt android build --name myapp
```

### Android设备管理

```bash
# 列出连接的设备
flt android devices

# 安装APK到设备（智能查找）
flt android install

# 安装release版本APK
flt android install release

# 指定设备安装
flt android install --device <device-id>

# 使用自定义名称前缀（需与构建时一致）
flt android install --name myapp

# 指定APK文件路径
flt android install --file /path/to/your/app.apk
```

## 📋 命令详解

### `flt android build`

构建Flutter APK，支持以下选项：

- `-r, --release`: 构建release版本（默认为debug版本）
- `-n, --name <name>`: 自定义APK名称前缀（默认为"app"）

生成的APK会自动添加时间戳重命名，例如：`app-debug-202412301430.apk`

### `flt android`

Android相关操作：

#### `flt android devices` (别名: `flt android d`)

列出所有连接的Android设备及其状态。

#### `flt android install` (别名: `flt android i`)

安装APK到连接的Android设备：

- `-d, --device <device>`: 指定设备ID
- `-f, --file <file>`: 指定APK文件路径
- `-n, --name <name>`: APK名称前缀（默认为"app"）

**智能APK查找**：
1. 优先查找标准文件名（如 `app-debug.apk`）
2. 如果没有找到，自动查找最新的带时间戳的APK文件（如 `app-debug-202506271511.apk`）
3. 支持自定义名称前缀，确保与构建时使用的名称一致

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

## 💡 使用示例

### 完整工作流程

```bash
# 1. 构建Debug版本APK
flt android build
# 输出: app-debug-202506271511.apk

# 2. 安装到设备（会自动找到最新的APK）
flt android install
# 输出: 找到APK文件: app-debug-202506271511.apk

# 3. 使用自定义名称
flt android build --name myproject
# 输出: myproject-debug-202506271512.apk

flt android install --name myproject
# 输出: 找到APK文件: myproject-debug-202506271512.apk

# 4. 构建Release版本
flt android build --release --name myproject
# 输出: myproject-release-202506271513.apk

flt android install release --name myproject
# 输出: 找到APK文件: myproject-release-202506271513.apk
```

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

