/**
 * Smoke test: doctor runs from committed dist/ without a separate build step.
 *
 * Adopters and embedded .devenv/ copies rely on dist/ being present after npm install.
 */
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { describe, it } = require('node:test');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const DOCTOR = path.join(REPO_ROOT, 'dist', 'scripts', 'doctor', 'cli.js');

describe('doctor without manual build', () => {
  it('dist entrypoint exists for install-only adopters', () => {
    assert.ok(
      fs.existsSync(DOCTOR),
      'dist/scripts/doctor/cli.js must be committed so npm run doctor works after install'
    );
  });

  it('doctor CLI starts and emits JSON without npm run build', { timeout: 60_000 }, () => {
    const result = spawnSync('node', [DOCTOR, '--fast', '--json'], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      env: { ...process.env, NO_COLOR: '1' },
    });

    assert.ok(!result.error, result.error?.message ?? 'doctor process failed to start');
    assert.ok(
      !/cannot find module/i.test(result.stderr),
      `doctor should not fail on missing modules: ${result.stderr}`
    );

    const output = `${result.stdout}${result.stderr}`;
    assert.match(
      output,
      /"healthScore"|healthScore/,
      'doctor should produce a health report when run from committed dist/'
    );
  });
});
