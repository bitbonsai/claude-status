<div align="center">
  <img width="256" height="256" alt="image" src="https://github.com/user-attachments/assets/70f77d20-4572-4475-93a6-0dd480128f04" />
  <br>
  <img width="629" height="114" alt="image" src="https://github.com/user-attachments/assets/30bac4dc-0bf5-42bf-a205-ef47aff48e58" />
</div>

# Claude Statusline

A clean, fast statusline for Claude Code using Bun, simple-git, and chalk.

## Features

- Username and current directory
- Git branch, status indicators (conflicts, untracked, modified, staged)
- Ahead/behind remote tracking
- Virtual environment name
- Context window usage bar with color coding

## Prerequisites

- [Bun](https://bun.sh) - Install with: `curl -fsSL https://bun.sh/install | bash`
- [jq](https://jqlang.github.io/jq/) - Standard on newer macOS versions, or install with: `brew install jq` (macOS) or `apt-get install jq` (Linux)

## Installation

Download and run the automated installer:

```bash
curl -fsSL https://raw.githubusercontent.com/bitbonsai/claude-status/main/install.sh -o install.sh && bash install.sh
```

The installer will:
- Check prerequisites (Bun, jq, Claude settings)
- Show current statusLine configuration
- Download to `~/.claude/claude-statusline`
- Install dependencies
- Backup your settings (one backup maintained)
- Update `~/.claude/settings.json`
- Prompt for confirmation before making changes

### Manual Installation

1. Clone the repository:
```bash
git clone https://github.com/bitbonsai/claude-status.git ~/.claude/claude-statusline
cd ~/.claude/claude-statusline
bun install
```

2. Add to your Claude Code settings (`~/.claude/settings.json`):
```json
{
  "statusLine": {
    "type": "command",
    "command": "bun ~/.claude/claude-statusline/statusline.ts"
  }
}
```

## Uninstall

To completely remove the statusline:

1. Remove the statusLine configuration from settings:
```bash
jq 'del(.statusLine)' ~/.claude/settings.json > ~/.claude/settings.json.tmp && mv ~/.claude/settings.json.tmp ~/.claude/settings.json
```

2. Remove the installation directory:
```bash
rm -rf ~/.claude/claude-statusline
```

3. (Optional) Restore from backup if you want your previous settings:
```bash
cp ~/.claude/settings.json.backup ~/.claude/settings.json
```

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
