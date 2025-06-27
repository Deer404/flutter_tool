#!/usr/bin/env node

import { Command } from 'commander';
import pc from 'picocolors';
import { androidCommand } from '../commands/android';
import { version } from '../utils/version';

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

const program = new Command();

// 设置CLI基本信息
program
  .name('flt')
  .description('Flutter工具集 - 简化Flutter开发的命令行工具')
  .usage('[选项] [命令]')
  .version(version, '-V, --version', '显示版本号')
  .helpOption('-h, --help', '显示帮助信息')
  .configureHelp({
    formatHelp: formatHelp,
    helpWidth: 80,
    sortSubcommands: false,
    sortOptions: false
  });

  
// 注册命令
program.addCommand(androidCommand);

// 处理未知命令
program.on('command:*', () => {
  console.error(pc.red(`❌ 未知命令: ${program.args.join(' ')}`));
  console.log();
  console.log(pc.cyan('请使用 --help 查看可用命令'));
  process.exit(1);
});

// 解析命令行参数
program.parse();

// 如果没有提供任何参数，显示帮助信息
if (!process.argv.slice(2).length) {
  program.outputHelp();
} 