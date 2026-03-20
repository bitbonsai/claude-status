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

    // Git status indicators (colored counts with unicode icons)
    if (status.conflicted.length > 0) parts.push(chalk.red(`${status.conflicted.length}⚠`));
    const modCount = status.modified.length || status.files.filter(f => f.working_dir === 'M').length;
    if (modCount > 0) parts.push(chalk.yellow(`${modCount}✎`));
    if (status.not_added.length > 0) parts.push(chalk.gray(`${status.not_added.length}?`));
    if (status.staged.length > 0) parts.push(chalk.green(`${status.staged.length}✓`));

    // Ahead/behind
    if (status.ahead > 0) parts.push(chalk.green(`↑${status.ahead}`));
    if (status.behind > 0) parts.push(chalk.red(`↓${status.behind}`));
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
    const colorFn = pct >= 80 ? chalk.red : pct >= 60 ? chalk.yellow : chalk.green;

    parts.push(chalk.gray('∴'), chalk.rgb(76, 97, 90)('context:'), colorFn(bar), colorFn(`${pct}%`));
  }

  console.log(parts.join(' '));
} catch (error) {
  // Log error to stderr and fallback to simple output
  console.error('Statusline error:', error);
  console.log(userInfo().username);
}
