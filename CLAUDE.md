# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a statusline implementation for Claude Code CLI that displays:
- Username and current directory
- Git branch and status indicators (conflicts, untracked, modified, staged, ahead/behind)
- Virtual environment information
- Context window usage with color-coded progress bar

The project consists of two main implementations:
1. **TypeScript/Bun version** (statusline.ts) - Main implementation using simple-git and chalk
2. **Shell-only version** - Zero-dependency alternative using POSIX shell and jq

**Note:** GitHub Pages (index.html) design documentation is in `CLAUDE-page.md`.

## Development Commands

### Testing
```bash
bun test                    # Run all tests
bun test install.test.ts    # Run specific test file
```

### Manual Testing
```bash
# Test the statusline directly with sample input
echo '{"workspace":{"current_dir":"'$(pwd)'"},"context_window":{"current_usage":{"input_tokens":1000,"cache_creation_input_tokens":0,"cache_read_input_tokens":0},"context_window_size":200000}}' | bun statusline.ts
```

### Installation Testing
```bash
# Run installer in dry-run mode (use a test settings file)
bash install.sh
```

## Architecture

### Core Components

**statusline.ts** - Main statusline implementation
- Reads JSON from stdin containing workspace and context info
- Uses simple-git to query repository status (branch, ahead/behind, file changes)
- Formats output with chalk for terminal colors
- Falls back gracefully on errors to just display username

**install.sh** - Automated installer
- Validates prerequisites (Bun, jq, Claude settings file)
- Detects if already installed and offers update path
- Clones/updates repo to `~/.claude/claude-statusline`
- Backs up settings to `~/.claude/settings.json.backup` (single backup maintained)
- Uses jq to safely modify `~/.claude/settings.json`
- Shows before/after preview and requires user confirmation

**install.test.ts** - Test suite for installer logic
- Tests settings.json manipulation (empty, invalid JSON, preserving other settings)
- Tests configuration detection (matching, different, missing)
- Tests uninstall cleanup

**index.html** - GitHub Pages landing page
- Single-file static site with embedded CSS/JS
- Uses Catppuccin Mocha color scheme
- Documented separately in CLAUDE-page.md

### Git Status Detection

The statusline uses `simple-git` which wraps native git commands. Important notes:

- **Ahead/behind tracking**: Uses `status.ahead` and `status.behind` from git status
  - Only reflects what the local repository knows about the remote
  - Requires `git fetch` to be current (statusline does NOT fetch to avoid network overhead)
  - This is intentional - statusline must be fast (<50ms)

- **Status indicators**:
  - `!` = merge conflicts (status.conflicted)
  - `?` = untracked files (status.not_added)
  - `*` = modified files (status.modified or working_dir === 'M')
  - `+` = staged changes (status.staged)
  - `↑n` = commits ahead of remote
  - `↓n` = commits behind remote

### Context Window Display

The context bar sums three token types from Claude's JSON input:
```typescript
current = input_tokens + cache_creation_input_tokens + cache_read_input_tokens
percentage = (current / context_window_size) * 100
```

Colors: Green (<60%), Yellow (60-79%), Red (≥80%)

## Important Constraints

### Performance Requirements
- Statusline must execute in <50ms even in large repositories
- No network calls (no git fetch, no API requests)
- Graceful fallback if git operations fail

### Settings Safety
- Never corrupt `~/.claude/settings.json`
- Always backup before modifications
- Preserve all non-statusLine settings
- Handle empty/invalid JSON gracefully

### Installation Flow
The installer has two distinct paths:
1. **Already configured**: Offers code update only, skips settings modification
2. **Not configured**: Shows before/after preview, requires confirmation, updates settings

## GitHub Pages (index.html)

Documented in detail in `CLAUDE-page.md`. Key points:
- Uses system UI fonts (no web fonts)
- Catppuccin Mocha color scheme
- Synchronized copy buttons across navbar/hero/terminal
- FAQ uses `<details>` elements
- Images must use stable GitHub user-attachments URLs

## Shell Alternative

The README includes a zero-dependency shell implementation that:
- Provides identical functionality to the TypeScript version
- Only requires jq (standard on macOS, easily installed on Linux)
- Uses POSIX shell and git commands directly
- Lives entirely in the `settings.json` command field

This is maintained in parallel with the TypeScript version and must stay in sync for features.
