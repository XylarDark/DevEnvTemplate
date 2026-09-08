/**
 * Regression tests asserting the doctor does not modify the project it inspects.
 *
 * The doctor used to run the agent-layer integration whenever it decided the project needed it,
 * regardless of flags. A plain `npm run doctor` therefore wrote roughly 45KB of rules and skills
 * into whatever directory it was pointed at, which made it unusable for inspecting a repository
 * you did not intend to change. These tests pin the boundary: without `--fix` or
 * `--integrate-cursor-rules`, the only thing the doctor may write is its own reports under
 * `.devenv/`.
 */

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs').promises;
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);

const REPO_ROOT = path.join(__dirname, '..', '..');
const DOCTOR = path.join(REPO_ROOT, 'dist', 'scripts', 'doctor', 'cli.js');

/**
 * Recursively list paths relative to a root, excluding `.devenv` (the doctor's own output).
 *
 * @param {string} root Directory to walk.
 * @param {string} [prefix] Relative prefix, used by recursion.
 * @returns {Promise<string[]>} Sorted relative paths.
 */
async function listTree(root, prefix = '') {
  const entries = await fs.readdir(path.join(root, prefix), { withFileTypes: true });
  const found = [];

  for (const entry of entries) {
    const relative = path.join(prefix, entry.name);
    if (entry.name === '.devenv') continue;

    found.push(relative);
    if (entry.isDirectory()) {
      found.push(...(await listTree(root, relative)));
    }
  }

  return found.sort();
}

describe('Doctor read-only guarantee', () => {
  let projectDir;

  before(async () => {
    projectDir = await fs.mkdtemp(path.join(os.tmpdir(), 'doctor-readonly-'));

    // A project with no agent layer at all, which is the state that used to trigger the
    // unrequested integration.
    await fs.writeFile(
      path.join(projectDir, 'package.json'),
      JSON.stringify({ name: 'subject', version: '1.0.0', private: true }, null, 2)
    );
    await fs.mkdir(path.join(projectDir, 'src'));
    await fs.writeFile(path.join(projectDir, 'src', 'index.js'), 'module.exports = 1;\n');
  });

  after(async () => {
    await fs.rm(projectDir, { recursive: true, force: true });
  });

  it('should not add files to the project when run without fix flags', async () => {
    const before = await listTree(projectDir);

    // The doctor exits non-zero when it finds critical gaps, which this project has. The exit
    // code is not what is under test, so failures are tolerated here.
    await execFileAsync(process.execPath, [DOCTOR, '--json'], { cwd: projectDir }).catch(
      error => error
    );

    const after = await listTree(projectDir);

    assert.deepStrictEqual(
      after,
      before,
      'the doctor must not create or remove project files without --fix'
    );
  });

  it('should not create an agent layer it was not asked to create', async () => {
    await execFileAsync(process.execPath, [DOCTOR, '--json'], { cwd: projectDir }).catch(
      error => error
    );

    for (const unwanted of ['.agents', '.cursor', 'AGENTS.md', 'CLAUDE.md']) {
      const exists = await fs
        .access(path.join(projectDir, unwanted))
        .then(() => true)
        .catch(() => false);

      assert.strictEqual(exists, false, `${unwanted} should not have been created`);
    }
  });

  it('should still write its own report under .devenv', async () => {
    await execFileAsync(process.execPath, [DOCTOR, '--json'], { cwd: projectDir }).catch(
      error => error
    );

    // Reading is only useful if the run actually produced something; otherwise the tests above
    // would pass for a doctor that did nothing at all.
    const report = JSON.parse(
      await fs.readFile(path.join(projectDir, '.devenv', 'health-report.json'), 'utf8')
    );

    assert.ok(
      typeof report.healthScore.overall === 'number',
      'the doctor should have produced a score'
    );
  });
});
