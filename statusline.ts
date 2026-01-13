#!/usr/bin/env bun
import { simpleGit } from 'simple-git';
import chalk from 'chalk';
import { homedir, userInfo } from 'os';

// Force chalk to enable colors
chalk.level = 3;

interface ClaudeInput {
  workspace: { current_dir: string };
  context_window: {
    current_usage?: {
      input_tokens: number;
      cache_creation_input_tokens: number;
      cache_read_input_tokens: number;
    };
    context_window_size: number;
  };
}

try {
  // Read JSON from stdin
  const input: ClaudeInput = await Bun.stdin.json();
  const cwd = input.workspace.current_dir;
  const parts: string[] = [];

  // Username and directory
  parts.push(userInfo().username);
  parts.push(chalk.blue(cwd.replace(homedir(), '~')));

  // Git info
  const git = simpleGit(cwd);
  const isRepo = await git.checkIsRepo();

  if (isRepo) {
    const status = await git.status();

    // Branch name
    if (status.current) {
      parts.push(chalk.gray(status.current));
    }

    // Git status indicators
    const indicators: string[] = [];
    if (status.conflicted.length > 0) indicators.push('!');
    if (status.not_added.length > 0) indicators.push('?');
    if (status.modified.length > 0 || status.files.some(f => f.working_dir === 'M')) indicators.push('*');
    if (status.staged.length > 0) indicators.push('+');

    // Ahead/behind
    if (status.ahead > 0) indicators.push(`↑${status.ahead}`);
    if (status.behind > 0) indicators.push(`↓${status.behind}`);

    if (indicators.length > 0) {
      parts.push(chalk.cyan(`[${indicators.join('')}]`));
    }
  }

  // Virtual environment
  if (process.env.VIRTUAL_ENV) {
    const venvName = process.env.VIRTUAL_ENV.split('/').pop();
    parts.push(chalk.gray(venvName));
  }

  // Context usage bar
  const usage = input.context_window.current_usage;
  if (usage) {
    const current = usage.input_tokens + usage.cache_creation_input_tokens + usage.cache_read_input_tokens;
    const size = input.context_window.context_window_size;
    const pct = Math.floor((current * 100) / size);
    const filled = Math.floor(pct / 10);

    // Build bar
    const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);

    // Color based on usage
    let coloredBar: string;
    if (pct >= 80) coloredBar = chalk.red(bar);
    else if (pct >= 60) coloredBar = chalk.yellow(bar);
    else coloredBar = chalk.green(bar);

    parts.push(chalk.gray('∴'), chalk.rgb(76, 97, 90)('context:'), coloredBar);
  }

  console.log(parts.join(' '));
} catch (error) {
  // Log error to stderr and fallback to simple output
  console.error('Statusline error:', error);
  console.log(userInfo().username);
}
