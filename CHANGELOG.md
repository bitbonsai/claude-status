# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-13

### Added
- Initial release of Claude Statusline
- Display username and current directory with tilde expansion
- Git integration with branch name and status indicators
  - Conflict indicator (!)
  - Untracked files indicator (?)
  - Modified files indicator (*)
  - Staged changes indicator (+)
  - Ahead/behind remote tracking (↑↓)
- Virtual environment name display
- Context window usage bar with color coding
  - Green: < 60% usage
  - Yellow: 60-79% usage
  - Red: ≥ 80% usage
- Forced chalk color output for Claude Code compatibility
- Error logging to stderr for debugging

### Installation
- One-line automated installer with download-then-execute method
- Smart prerequisite checking (Bun, jq, Claude settings)
- Empty/invalid settings.json handling
- Config detection with update-only mode when already configured
- Full before/after settings.json comparison
- Preserves all existing settings when updating
- Single backup file management
- Default "yes" on all prompts (press Enter to continue, 'n' to cancel)
- Automatic statusline reload without restart required

### Documentation
- Comprehensive README with screenshot
- Prerequisites section with installation links
- Automated and manual installation instructions
- Uninstall instructions
- Git status indicators reference
- Context bar color legend

### Testing
- 9 comprehensive Bun tests covering:
  - Settings.json initialization and updates
  - Configuration preservation
  - Invalid JSON handling
  - Config detection logic
  - Uninstall functionality

[1.0.0]: https://github.com/bitbonsai/claude-status/releases/tag/v1.0.0
