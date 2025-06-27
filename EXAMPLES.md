# FLT 使用示例

## 安装

```bash
npm install -g flt
```

## 基本使用

### 1. 构建Flutter APK

在Flutter项目根目录中运行：

```bash
# 构建debug版本
flt build

# 构建release版本
flt build --release

# 使用自定义名称前缀
flt build --name myapp --release
```

**输出示例：**
```
正在构建 Flutter APK (release 模式)...
✓ 构建完成: build/app/outputs/flutter-apk/myapp-release-202412301430.apk
```

### 2. Android设备管理

```bash
# 查看连接的设备
flt android devices
```

**输出示例：**
```
正在检查连接的设备...
✓ 连接的设备:
  • R3CT20HXXX [device]
  • emulator-5554 [device]
```

```bash
# 运行应用到设备（自动选择第一个设备）
flt android install

# 指定特定设备
flt android install --device R3CT20HXXX
```

## 完整工作流程示例

以下是一个典型的Flutter开发工作流程：

```bash
# 1. 进入Flutter项目目录
cd my-flutter-app

# 2. 构建release版本的APK
flt build --release --name myapp

# 3. 查看连接的设备
flt android devices

# 4. 安装并运行到指定设备
flt android install --device R3CT20HXXX
```

## 错误处理

### 非Flutter项目目录
```bash
$ flt build
❌ 当前目录不是Flutter项目目录
❌ 请在Flutter项目根目录中运行此命令
```

### ADB未找到
```bash
$ flt android devices
❌ ADB未找到，请确保Android SDK已安装并添加到PATH
```

### 无连接设备
```bash
$ flt android install
❌ 未找到连接的Android设备
请确保：
1. 设备已连接并开启USB调试
2. 设备已授权此计算机
```

## 与原始zsh函数的对比

| 原始zsh函数      | FLT命令               | 功能            |
| ---------------- | --------------------- | --------------- |
| `fbuild`         | `flt build`           | 构建APK         |
| `fbuild release` | `flt build --release` | 构建release版本 |
| `aia`            | `flt android install` | 安装到设备      |
| -                | `flt android devices` | 查看设备列表    |

## 跨平台支持

FLT支持以下平台：
- ✅ macOS
- ✅ Windows
- ✅ Linux

## 系统要求

- Node.js >= 16.0.0
- Flutter SDK
- Android SDK（用于Android相关功能） 