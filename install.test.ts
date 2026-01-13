import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdirSync, rmSync, writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

const TEST_DIR = join(tmpdir(), "claude-statusline-test");
const TEST_SETTINGS = join(TEST_DIR, "settings.json");
const TEST_BACKUP = join(TEST_DIR, "settings.json.backup");
const INSTALL_DIR = join(TEST_DIR, "claude-statusline");

describe("install.sh", () => {
  beforeEach(() => {
    // Create test directory
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
    mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    // Cleanup
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  describe("settings.json handling", () => {
    test("should initialize empty settings.json with {}", () => {
      // Create empty file
      writeFileSync(TEST_SETTINGS, "");

      // Simulate the initialization logic
      const proc = Bun.spawnSync([
        "bash",
        "-c",
        `if [ ! -s "${TEST_SETTINGS}" ] || ! jq empty "${TEST_SETTINGS}" &>/dev/null; then echo "{}" > "${TEST_SETTINGS}"; fi && cat "${TEST_SETTINGS}"`,
      ]);

      const result = proc.stdout.toString();
      expect(JSON.parse(result)).toEqual({});
    });

    test("should add statusLine to empty object", () => {
      writeFileSync(TEST_SETTINGS, "{}");

      const proc = Bun.spawnSync([
        "bash",
        "-c",
        `jq --arg cmd "bun ${INSTALL_DIR}/statusline.ts" '.statusLine = {"type": "command", "command": $cmd}' "${TEST_SETTINGS}"`,
      ]);

      const result = JSON.parse(proc.stdout.toString());
      expect(result).toEqual({
        statusLine: {
          type: "command",
          command: `bun ${INSTALL_DIR}/statusline.ts`,
        },
      });
    });

    test("should preserve other settings when adding statusLine", () => {
      const initial = {
        model: "claude-sonnet-4-5-20250929",
        spinnerTipsEnabled: true,
        env: {
          MY_VAR: "test",
        },
      };
      writeFileSync(TEST_SETTINGS, JSON.stringify(initial, null, 2));

      const proc = Bun.spawnSync([
        "bash",
        "-c",
        `jq --arg cmd "bun ${INSTALL_DIR}/statusline.ts" '.statusLine = {"type": "command", "command": $cmd}' "${TEST_SETTINGS}"`,
      ]);

      const result = JSON.parse(proc.stdout.toString());
      expect(result).toEqual({
        ...initial,
        statusLine: {
          type: "command",
          command: `bun ${INSTALL_DIR}/statusline.ts`,
        },
      });
    });

    test("should update existing statusLine", () => {
      const initial = {
        model: "claude-sonnet-4-5-20250929",
        statusLine: {
          type: "command",
          command: "echo 'old statusline'",
        },
      };
      writeFileSync(TEST_SETTINGS, JSON.stringify(initial, null, 2));

      const proc = Bun.spawnSync([
        "bash",
        "-c",
        `jq --arg cmd "bun ${INSTALL_DIR}/statusline.ts" '.statusLine = {"type": "command", "command": $cmd}' "${TEST_SETTINGS}"`,
      ]);

      const result = JSON.parse(proc.stdout.toString());
      expect(result.statusLine.command).toBe(
        `bun ${INSTALL_DIR}/statusline.ts`
      );
      expect(result.model).toBe("claude-sonnet-4-5-20250929");
    });

    test("should handle invalid JSON by initializing with {}", () => {
      writeFileSync(TEST_SETTINGS, "invalid json {");

      const proc = Bun.spawnSync([
        "bash",
        "-c",
        `if [ ! -s "${TEST_SETTINGS}" ] || ! jq empty "${TEST_SETTINGS}" &>/dev/null; then echo "{}" > "${TEST_SETTINGS}"; fi && cat "${TEST_SETTINGS}"`,
      ]);

      const result = proc.stdout.toString().trim();
      expect(JSON.parse(result)).toEqual({});
    });
  });

  describe("config detection", () => {
    test("should detect matching configuration", () => {
      const settings = {
        statusLine: {
          type: "command",
          command: `bun ${INSTALL_DIR}/statusline.ts`,
        },
      };
      writeFileSync(TEST_SETTINGS, JSON.stringify(settings, null, 2));

      const proc = Bun.spawnSync([
        "bash",
        "-c",
        `if jq -e '.statusLine.command' "${TEST_SETTINGS}" &> /dev/null; then jq -r '.statusLine.command' "${TEST_SETTINGS}"; fi`,
      ]);

      const currentCmd = proc.stdout.toString().trim();
      expect(currentCmd).toBe(`bun ${INSTALL_DIR}/statusline.ts`);
    });

    test("should detect different configuration", () => {
      const settings = {
        statusLine: {
          type: "command",
          command: "echo 'different'",
        },
      };
      writeFileSync(TEST_SETTINGS, JSON.stringify(settings, null, 2));

      const proc = Bun.spawnSync([
        "bash",
        "-c",
        `if jq -e '.statusLine.command' "${TEST_SETTINGS}" &> /dev/null; then jq -r '.statusLine.command' "${TEST_SETTINGS}"; fi`,
      ]);

      const currentCmd = proc.stdout.toString().trim();
      expect(currentCmd).not.toBe(`bun ${INSTALL_DIR}/statusline.ts`);
      expect(currentCmd).toBe("echo 'different'");
    });

    test("should detect missing statusLine", () => {
      const settings = {
        model: "claude-sonnet-4-5-20250929",
      };
      writeFileSync(TEST_SETTINGS, JSON.stringify(settings, null, 2));

      const proc = Bun.spawnSync([
        "bash",
        "-c",
        `if jq -e '.statusLine.command' "${TEST_SETTINGS}" &> /dev/null; then echo "exists"; else echo "missing"; fi`,
      ]);

      const result = proc.stdout.toString().trim();
      expect(result).toBe("missing");
    });
  });

  describe("uninstall", () => {
    test("should remove statusLine from settings", () => {
      const settings = {
        model: "claude-sonnet-4-5-20250929",
        statusLine: {
          type: "command",
          command: "bun test",
        },
      };
      writeFileSync(TEST_SETTINGS, JSON.stringify(settings, null, 2));

      const proc = Bun.spawnSync([
        "bash",
        "-c",
        `jq 'del(.statusLine)' "${TEST_SETTINGS}"`,
      ]);

      const result = JSON.parse(proc.stdout.toString());
      expect(result.statusLine).toBeUndefined();
      expect(result.model).toBe("claude-sonnet-4-5-20250929");
    });
  });
});
