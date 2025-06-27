import { Command } from 'commander';
import { execa } from 'execa';
import { existsSync, renameSync, readdirSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import pc from 'picocolors';
import { ensureFlutterProject, generateTimestamp, success, error, info, warn } from '../utils/common';

/**
 * 智能查找APK文件
 * 1. 优先查找标准文件名（例如 app-debug.apk）
 * 2. 如果没有找到，查找最新的带时间戳的文件（例如 app-debug-202506271511.apk）
 * 3. 支持自定义APK名称前缀
 */
function findApkFile(buildType: string, namePrefix: string = 'app'): string | null {
  const apkDir = resolve('build/app/outputs/flutter-apk');
  
  // 检查目录是否存在
  if (!existsSync(apkDir)) {
    return null;
  }

  const standardApkName = `${namePrefix}-${buildType}.apk`;
  const standardApkPath = join(apkDir, standardApkName);
  
  // 优先查找标准文件名
  if (existsSync(standardApkPath)) {
    return standardApkPath;
  }

  // 如果标准文件不存在，查找带时间戳的文件
  try {
    const files = readdirSync(apkDir);
    const timestampedApks = files
      .filter(file => {
        // 匹配模式：namePrefix-buildType-YYYYMMDDHHMM.apk
        const pattern = new RegExp(`^${namePrefix}-${buildType}-\\d{12}\\.apk$`);
        return pattern.test(file);
      })
      .map(file => ({
        name: file,
        path: join(apkDir, file),
        // 提取时间戳用于排序
        timestamp: file.match(new RegExp(`${namePrefix}-${buildType}-(\\d{12})\\.apk$`))?.[1] || '0'
      }))
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp)); // 按时间戳降序排序

    // 返回最新的文件
    if (timestampedApks.length > 0) {
      return timestampedApks[0].path;
    }
  } catch (err) {
    // 读取目录失败，返回null
    return null;
  }

  return null;
}

// 自定义帮助格式化函数
function formatHelp(cmd: Command): string {
  const nameStr = cmd.name();
  const usage = cmd.usage();
  const description = cmd.description();
  
  let helpText = `用法: ${nameStr}${usage ? ' ' + usage : ''}\n\n`;
  
  if (description) {
    helpText += `${description}\n\n`;
  }
  
  // 添加选项
  const options = cmd.options;
  if (options.length > 0) {
    helpText += '选项:\n';
    options.forEach(option => {
      const flags = option.flags;
      const desc = option.description || '';
      const padding = ' '.repeat(Math.max(2, 35 - flags.length));
      helpText += `  ${flags}${padding}${desc}\n`;
    });
    helpText += '\n';
  }
  
  // 添加子命令
  const commands = cmd.commands;
  if (commands.length > 0) {
    helpText += '命令:\n';
    commands.forEach(command => {
      const name = command.name();
      const aliases = command.aliases();
      const nameAndAliases = aliases.length > 0 ? `${name}|${aliases.join('|')}` : name;
      const args = command.usage();
      const desc = command.description() || '';
      const fullName = `${nameAndAliases}${args ? ' ' + args : ''}`;
      const padding = ' '.repeat(Math.max(2, 35 - fullName.length));
      helpText += `  ${fullName}${padding}${desc}\n`;
    });
    helpText += '\n';
  }
  
  return helpText;
}

const androidCommand = new Command('android')
  .description('Android相关操作')
  .usage('[选项] [命令]')
  .configureHelp({
    formatHelp: formatHelp,
    helpWidth: 80,
    sortSubcommands: false,
    sortOptions: false
  })
  .addHelpText('after', '使用 "flt android [命令] --help" 查看具体命令的详细帮助信息')
  .addCommand(
    new Command('build')
      .alias('b')
      .description('构建Flutter APK')
      .option('-r, --release', '构建release版本 (默认为debug版本)')
      .option('-n, --name <name>', '自定义APK名称前缀 (默认为"app")')
      .configureHelp({
        helpWidth: 80,
        sortOptions: false
      })
      .action(async (options) => {
        try {
          // 确保在Flutter项目中
          ensureFlutterProject();

          const buildType = options.release ? 'release' : 'debug';
          const namePrefix = options.name || 'app';
          const apkName = `${namePrefix}-${buildType}.apk`;

          info(`正在构建 Flutter APK (${buildType} 模式)...`);

          // 执行Flutter构建命令
          await execa('flutter', ['build', 'apk', `--${buildType}`], {
            stdio: 'inherit',
            cwd: process.cwd(),
          });

          // 构建成功后重命名文件
          const timestamp = generateTimestamp();
          const originalPath = join('build', 'app', 'outputs', 'flutter-apk', apkName);
          const newName = `${namePrefix}-${buildType}-${timestamp}.apk`;
          const newPath = join('build', 'app', 'outputs', 'flutter-apk', newName);

          if (existsSync(originalPath)) {
            renameSync(originalPath, newPath);
            success(`构建完成: ${newPath}`);
          } else {
            error(`未找到 APK 文件: ${originalPath}`);
            process.exit(1);
          }
        } catch (err) {
          error(`构建失败: ${err instanceof Error ? err.message : String(err)}`);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('install')
      .alias('i')
      .description('安装APK到连接的Android设备')
      .argument('[buildType]', '构建类型 (debug/release)', 'debug')
      .option('-d, --device <device>', '指定设备ID')
      .option('-f, --file <file>', 'APK文件路径')
      .option('-n, --name <name>', 'APK名称前缀 (默认为"app")')
      .configureHelp({
        helpWidth: 80,
        sortOptions: false
      })
      .action(async (buildType, options) => {
        try {
          ensureFlutterProject();
          
          // 验证构建类型参数
          if (buildType && !['debug', 'release'].includes(buildType)) {
            error(`不支持的构建类型: ${buildType}`);
            info('支持的构建类型: debug, release');
            process.exit(1);
          }
          
          // 检查ADB是否可用
          try {
            await execa('adb', ['version'], { stdio: 'pipe' });
          } catch {
            error('ADB未找到，请确保Android SDK已安装并添加到PATH');
            process.exit(1);
          }

          // 确定APK文件路径
          const fs = await import('fs');
          const path = await import('path');
          
          let apkPath: string;
          if (options.file) {
            // 如果指定了文件路径，使用指定的路径
            apkPath = path.resolve(options.file);
            if (!fs.existsSync(apkPath)) {
              error(`APK文件不存在: ${apkPath}`);
              process.exit(1);
            }
          } else {
            // 智能查找APK文件
            const namePrefix = options.name || 'app';
            const foundApkPath = findApkFile(buildType, namePrefix);
            if (!foundApkPath) {
              error(`未找到 ${buildType} 模式的APK文件 (名称前缀: ${namePrefix})`);
              info('请先构建APK文件或指定正确的APK路径');
              if (buildType === 'release') {
                info(`构建命令: flt android build --release${namePrefix !== 'app' ? ' --name ' + namePrefix : ''}`);
              } else {
                info(`构建命令: flt android build${namePrefix !== 'app' ? ' --name ' + namePrefix : ''}`);
              }
              process.exit(1);
            }
            apkPath = foundApkPath;
            info(`找到APK文件: ${path.basename(apkPath)}`);
          }

          info('正在检查连接的Android设备...');

          // 获取设备列表
          const { stdout: devicesOutput } = await execa('adb', ['devices'], { stdio: 'pipe' });
          const deviceLines = devicesOutput.split('\n').slice(1).filter(line => 
            line.trim() && line.includes('\tdevice')
          );
          
          if (deviceLines.length === 0) {
            error('未找到连接的Android设备');
            info('请确保：');
            info('1. 设备已连接并开启USB调试');
            info('2. 设备已授权此计算机');
            process.exit(1);
          }

          const devices = deviceLines.map(line => line.split('\t')[0]);

          // 如果指定了特定设备，只安装到该设备
          if (options.device) {
            if (!devices.includes(options.device)) {
              error(`指定的设备 ${options.device} 未连接`);
              info('可用设备:');
              devices.forEach(deviceId => console.log(`  • ${deviceId}`));
              process.exit(1);
            }
            
            info(`正在安装 ${apkPath} 到设备: ${options.device}`);
            await execa('adb', ['-s', options.device, 'install', '-r', apkPath], {
              stdio: 'inherit'
            });
            success('安装完成');
            return;
          }

          // 并行安装到所有设备
          const totalDevices = devices.length;
          info(`正在安装 ${apkPath} 到 ${totalDevices} 个设备 (并行):`);
          
          const installPromises = devices.map(async (deviceId, index) => {
            const deviceIndex = index + 1;
            try {
              console.log(pc.blue(`[${deviceIndex}/${totalDevices}]`) + ` ${pc.cyan(deviceId + ':')} 开始安装...`);
              
              const { stdout, stderr } = await execa('adb', ['-s', deviceId, 'install', '-r', apkPath], {
                stdio: 'pipe'
              });
              
              // 过滤输出，移除不重要的信息
              const output = (stdout + stderr).split('\n')
                .filter(line => !line.includes('Performing'))
                .filter(line => line.trim())
                .join('\n');
              
              console.log(pc.blue(`[${deviceIndex}/${totalDevices}]`) + ` ${pc.cyan(deviceId + ':')}`);
              if (output) {
                output.split('\n').forEach(line => {
                  if (line.trim()) {
                    console.log(`    ${line}`);
                  }
                });
              }
              
              return { deviceId, success: true };
            } catch (err) {
              console.log(pc.blue(`[${deviceIndex}/${totalDevices}]`) + ` ${pc.cyan(deviceId + ':')} ${pc.red('安装失败')}`);
              console.log(`    ${err instanceof Error ? err.message : String(err)}`);
              return { deviceId, success: false, error: err };
            }
          });

          // 等待所有安装完成
          const results = await Promise.all(installPromises);
          
          const successCount = results.filter(r => r.success).length;
          const failCount = results.length - successCount;
          
          if (failCount === 0) {
            success('所有设备安装完成');
          } else {
            warn(`${successCount} 个设备安装成功, ${failCount} 个设备安装失败`);
          }

        } catch (err) {
          error(`安装失败: ${err instanceof Error ? err.message : String(err)}`);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('devices')
      .alias('d')
      .description('列出连接的Android设备')
      .configureHelp({
        helpWidth: 80,
        sortOptions: false
      })
      .action(async () => {
        try {
          info('正在检查连接的设备...');
          
          // 检查ADB是否可用
          try {
            await execa('adb', ['version'], { stdio: 'pipe' });
          } catch {
            error('ADB未找到，请确保Android SDK已安装并添加到PATH');
            process.exit(1);
          }

          // 获取设备列表
          const { stdout: devicesOutput } = await execa('adb', ['devices'], { stdio: 'pipe' });
          const deviceLines = devicesOutput.split('\n').slice(1).filter(line => line.trim());
          
          if (deviceLines.length === 0) {
            warn('未找到连接的Android设备');
          } else {
            success('连接的设备:');
            deviceLines.forEach(line => {
              if (line.trim()) {
                const [deviceId, status] = line.split('\t');
                const statusColor = status === 'device' ? pc.green : pc.yellow;
                console.log(`  • ${deviceId} ${statusColor(`[${status}]`)}`);
              }
            });
          }
        } catch (err) {
          error(`获取设备列表失败: ${err instanceof Error ? err.message : String(err)}`);
          process.exit(1);
        }
      })
  );

export { androidCommand }; 