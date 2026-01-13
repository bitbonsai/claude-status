<img width="629" height="114" alt="image" src="https://github.com/user-attachments/assets/30bac4dc-0bf5-42bf-a205-ef47aff48e58" />

# Claude Statusline

A clean, fast statusline for Claude Code using Bun, simple-git, and chalk.

## Features

- Username and current directory
- Git branch, status indicators (conflicts, untracked, modified, staged)
- Ahead/behind remote tracking
- Virtual environment name
- Context window usage bar with color coding

## Installation

```bash
bun install
```

## Usage

Add to your Claude Code settings (`~/.claude/settings.json`):

```json
{
  "statusLine": {
    "type": "command",
    "command": "bun /Users/YOUR_USERNAME/dev/claude-statusline/statusline.ts"
  }
}
```

Replace `YOUR_USERNAME` with your actual username, or use the full absolute path.

## Git Status Indicators

- `!` - Merge conflicts
- `?` - Untracked files
- `*` - Modified files
- `+` - Staged changes
- `↑n` - Commits ahead of remote
- `↓n` - Commits behind remote

## Context Bar Colors

- Green: < 60% usage
- Yellow: 60-79% usage
- Red: ≥ 80% usage
