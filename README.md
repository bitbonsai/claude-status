<div align="center">
  <img width="256" height="256" alt="image" src="https://github.com/user-attachments/assets/2328081a-8e2f-4e36-9df3-5eb36bd53245" />
  <br>
  <img width="665" height="125" alt="image" src="https://github.com/user-attachments/assets/2c2acaa2-0bfc-45c1-993f-be9a5c44134c" />
</div>

# Claude Statusline

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/bitbonsai/claude-status/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

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

## ⚡ Hardcore Alternative

Skip Bun/TypeScript entirely with this zero-dependency shell implementation. Just paste this into your `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "input=$(cat); cwd=$(echo \"$input\" | jq -r '.workspace.current_dir'); cd \"$cwd\" 2>/dev/null || exit 0; output=\"$(whoami)\"; dir=\"${cwd/#$HOME/~}\"; output=\"${output} $(printf '\\033[34m%s\\033[0m' \"$dir\")\"; if git rev-parse --git-dir > /dev/null 2>&1; then branch=$(git branch --show-current 2>/dev/null || git rev-parse --short HEAD 2>/dev/null); [ -n \"$branch\" ] && output=\"${output} $(printf '\\033[90m%s\\033[0m' \"$branch\")\"; if ! git diff --quiet 2>/dev/null || ! git diff --cached --quiet 2>/dev/null || [ -n \"$(git ls-files --others --exclude-standard 2>/dev/null)\" ]; then git_status=\"\"; git ls-files -u 2>/dev/null | grep -q . && git_status=\"${git_status}!\"; [ -n \"$(git ls-files --others --exclude-standard 2>/dev/null)\" ] && git_status=\"${git_status}?\"; ! git diff --quiet 2>/dev/null && git_status=\"${git_status}*\"; ! git diff --cached --quiet 2>/dev/null && git_status=\"${git_status}+\"; upstream=$(git rev-parse --abbrev-ref @{upstream} 2>/dev/null); if [ -n \"$upstream\" ]; then ahead=$(git rev-list --count @{upstream}..HEAD 2>/dev/null || echo 0); behind=$(git rev-list --count HEAD..@{upstream} 2>/dev/null || echo 0); [ \"$ahead\" -gt 0 ] && git_status=\"${git_status}↑${ahead}\"; [ \"$behind\" -gt 0 ] && git_status=\"${git_status}↓${behind}\"; fi; [ -n \"$git_status\" ] && output=\"${output} $(printf '\\033[36m[%s]\\033[0m' \"$git_status\")\"; fi; fi; [ -n \"$VIRTUAL_ENV\" ] && output=\"${output} $(printf '\\033[90m%s\\033[0m' \"$(basename \"$VIRTUAL_ENV\")\")\"; usage=$(echo \"$input\" | jq '.context_window.current_usage'); if [ \"$usage\" != \"null\" ]; then current=$(echo \"$usage\" | jq '.input_tokens + .cache_creation_input_tokens + .cache_read_input_tokens'); size=$(echo \"$input\" | jq '.context_window.context_window_size'); pct=$((current * 100 / size)); filled=$((pct / 10)); bar=\"\"; i=0; while [ $i -lt 10 ]; do if [ $i -lt $filled ]; then bar=\"${bar}█\"; else bar=\"${bar}░\"; fi; i=$((i + 1)); done; if [ $pct -ge 80 ]; then barcolor=\"\\033[31m\"; elif [ $pct -ge 60 ]; then barcolor=\"\\033[33m\"; else barcolor=\"\\033[32m\"; fi; output=\"${output} $(printf '\\033[90m∴\\033[0m') $(printf '\\033[38;2;76;97;90mcontext:\\033[0m') ${barcolor}${bar}$(printf '\\033[0m')\"; fi; echo \"$output\""
  }
}
```

**Only requires:** jq (standard on newer macOS, or `brew install jq`)

### Why choose the Bun version vs. the shell version?

**Bun:** Easier to read/modify (TypeScript), better git performance, cleaner colors with chalk, extensible with npm packages.

**Shell:** Zero dependencies except jq, no installation, runs anywhere with POSIX shell, slightly faster cold start.

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

## FAQ for Developers

<details>
<summary>How do I customize the colors and appearance?</summary>

**Easy way:** Use the `statusline-setup` agent in Claude Code to configure your statusline interactively.

**Bun version:** Edit `~/.claude/claude-statusline/statusline.ts` and modify the chalk color calls.

**Shell version:** Modify ANSI escape codes in the command. `\033[34m` = blue, `\033[32m` = green, `\033[31m` = red.
</details>

<details>
<summary>What's the performance impact?</summary>

Minimal. The statusline runs once per prompt update. Both versions typically execute in under 50ms even in large repositories.
</details>

<details>
<summary>Can I add custom information to the statusline?</summary>

**Easy way:** Use the `statusline-setup` agent in Claude Code to add custom fields interactively.

**Bun version:** Edit `statusline.ts` and add your logic. The stdin provides JSON with `workspace.current_dir`, `context_window.current_usage`, etc.

**Shell version:** Add custom shell logic to the command pipeline. Example: `[ -n "$AWS_PROFILE" ] && output="${output} aws:$AWS_PROFILE"`
</details>

<details>
<summary>How do I debug when something goes wrong?</summary>

**Bun version:** Run `echo '{"workspace":{"current_dir":"'$(pwd)'"}}' | bun ~/.claude/claude-statusline/statusline.ts`

**Shell version:** Extract the command and test manually with echo piped to bash.

Check Claude Code logs at `~/.claude/logs/`
</details>

<details>
<summary>Does this work with zsh, fish, or other shells?</summary>

Yes. The statusline is executed by Claude Code itself, not your interactive shell. Both versions work regardless of your default shell.
</details>

<details>
<summary>Why choose the Bun version vs. the shell version?</summary>

**Bun:** Easier to read/modify (TypeScript), better git performance, cleaner colors with chalk, extensible with npm packages.

**Shell:** Zero dependencies except jq, no installation, runs anywhere with POSIX shell, slightly faster cold start.
</details>
