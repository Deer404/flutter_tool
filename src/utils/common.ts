import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import pc from 'picocolors';

/**
 * 检查是否在Flutter项目目录中
 */
export function isFlutterProject(): boolean {
  const pubspecPath = join(process.cwd(), 'pubspec.yaml');
  return existsSync(pubspecPath);
}

/**
 * 生成带时间戳的文件名
 */
export function generateTimestamp(): string {
  const now = new Date();
  return now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0') +
    now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0');
}

/**
 * 输出成功消息
 */
export function success(message: string): void {
  console.log(pc.green(`✓ ${message}`));
}

/**
 * 输出错误消息
 */
export function error(message: string): void {
  console.error(pc.red(`❌ ${message}`));
}

/**
 * 输出信息消息
 */
export function info(message: string): void {
  console.log(pc.cyan(message));
}

/**
 * 输出警告消息
 */
export function warn(message: string): void {
  console.log(pc.yellow(`⚠ ${message}`));
}

/**
 * 确保Flutter项目
 */
export function ensureFlutterProject(): void {
  if (!isFlutterProject()) {
    error('当前目录不是Flutter项目目录');
    error('请在Flutter项目根目录中运行此命令');
    process.exit(1);
  }
} 