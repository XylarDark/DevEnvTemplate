/**
 * Asserts that `.cursor/hooks.json` actually wires the secret scanner.
 *
 * This exists because the file was committed as `{"version": 1, "hooks": {}}` after a debugging
 * session and stayed that way. The scanner and its 80 tests were all present and passing, so
 * everything looked fine — but Cursor fails *open* by default, so nothing was being checked, and
 * the empty config was then copied into a downstream project. Tests on the scanner cannot catch
 * this: the defect is in the wiring, not the script.
 */

const { describe, test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const REPO_ROOT = path.join(__dirname, '..', '..');
const CONFIG_PATH = path.join(REPO_ROOT, '.cursor', 'hooks.json');

/** Events that must be guarded. A read leaks a secret; a shell command exfiltrates it. */
const REQUIRED_EVENTS = ['beforeReadFile', 'beforeShellExecution'];

describe('hooks.json', () => {
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

  test('declares the schema version Cursor expects', () => {
    assert.strictEqual(config.version, 1);
  });

  for (const event of REQUIRED_EVENTS) {
    describe(event, () => {
      test('is wired to at least one hook', () => {
        const entries = config.hooks?.[event];

        assert.ok(
          Array.isArray(entries) && entries.length > 0,
          `${event} has no hooks. Cursor fails open, so this silently disables the scanner.`
        );
      });

      test('fails closed', () => {
        // Without this, a crash or timeout in the hook lets the operation through - which is the
        // opposite of what a security control should do when it breaks.
        for (const entry of config.hooks[event]) {
          assert.strictEqual(
            entry.failClosed,
            true,
            `${event} entry must set failClosed: true`
          );
        }
      });

      test('sets a timeout in seconds', () => {
        for (const entry of config.hooks[event]) {
          assert.strictEqual(typeof entry.timeout, 'number', `${event} entry needs a timeout`);
          // Cursor documents this field in seconds. A value that looks like milliseconds means
          // someone assumed the other unit, and with failClosed a long timeout blocks the editor.
          assert.ok(
            entry.timeout > 0 && entry.timeout <= 60,
            `${event} timeout of ${entry.timeout} is not a plausible number of seconds`
          );
        }
      });

      test('points at a hook script that exists', () => {
        for (const entry of config.hooks[event]) {
          assert.strictEqual(typeof entry.command, 'string');

          // Cursor resolves project hook paths from the project root.
          const scriptPath = entry.command.split(/\s+/).find(part => part.includes('.cursor'));
          assert.ok(scriptPath, `could not find a script path in "${entry.command}"`);

          assert.ok(
            fs.existsSync(path.join(REPO_ROOT, scriptPath)),
            `${scriptPath} does not exist, so this hook can only ever fail`
          );
        }
      });

      test('uses a .cjs script so it survives in an ESM host', () => {
        // A `.js` hook in a project with "type": "module" is parsed as ESM and dies on its first
        // require(). Since this config is copied into host projects, the extension matters.
        for (const entry of config.hooks[event]) {
          assert.ok(
            /\.cjs(\s|$)/.test(entry.command),
            `${event} should run a .cjs script, got "${entry.command}"`
          );
        }
      });
    });
  }
});
