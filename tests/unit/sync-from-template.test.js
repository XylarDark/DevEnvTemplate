const { describe, test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

let syncModule;
try {
  syncModule = require('../../dist/scripts/tools/sync-from-template');
} catch {
  syncModule = require('../../scripts/tools/sync-from-template');
}

const { planLayerSync, syncFromTemplate } = syncModule;

describe('sync-from-template', () => {
  let tempDir;
  let templateRoot;
  let projectRoot;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sync-template-test-'));
    templateRoot = path.join(tempDir, 'template');
    projectRoot = path.join(tempDir, 'project');

    await fs.mkdir(templateRoot, { recursive: true });
    await fs.mkdir(projectRoot, { recursive: true });

    await fs.mkdir(path.join(templateRoot, '.agents', 'skills', 'plan-first'), {
      recursive: true,
    });
    await fs.writeFile(
      path.join(templateRoot, '.agents', 'skills', 'plan-first', 'SKILL.md'),
      '---\nname: plan-first\ndescription: Plan first.\n---\n'
    );

    await fs.mkdir(path.join(templateRoot, '.cursor', 'rules'), { recursive: true });
    await fs.writeFile(
      path.join(templateRoot, '.cursor', 'rules', '13-markdown.mdc'),
      '---\ndescription: Markdown\nalwaysApply: false\n---\n'
    );
    await fs.writeFile(
      path.join(templateRoot, '.cursor', 'rules', '00-core-principles.mdc'),
      '---\ndescription: Retired\nalwaysApply: true\n---\n'
    );
    await fs.writeFile(path.join(templateRoot, '.cursorignore'), 'node_modules/\n');
    await fs.mkdir(path.join(templateRoot, 'docs'), { recursive: true });
    await fs.writeFile(path.join(templateRoot, 'docs', 'KNOWN_ERRORS.md'), '# Known errors\n');

    await fs.writeFile(path.join(templateRoot, 'AGENTS.md'), '# Template AGENTS\n');
    await fs.writeFile(path.join(projectRoot, 'AGENTS.md'), '# Host AGENTS\n');

    const repoConfig = path.join(__dirname, '../../config/sync-layers.json');
    await fs.mkdir(path.join(templateRoot, 'config'), { recursive: true });
    await fs.copyFile(repoConfig, path.join(templateRoot, 'config', 'sync-layers.json'));

    await fs.mkdir(path.join(templateRoot, 'docs', 'operational'), { recursive: true });
    await fs.writeFile(path.join(templateRoot, 'docs', 'DOCS_LAYOUT.md'), '# Layout\n');
    await fs.writeFile(
      path.join(templateRoot, 'docs', 'operational', 'automation-gaps.md'),
      '# Gaps\n'
    );
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  test('dry-run lists agent-context additions without writing files', async () => {
    const plan = await planLayerSync({
      projectRoot,
      templateRoot,
      layers: ['agent-context'],
      dryRun: true,
    });

    assert.ok(plan.copied.includes('.agents/skills/plan-first/SKILL.md'));
    assert.ok(plan.copied.includes('.cursor/rules/13-markdown.mdc'));
    assert.ok(plan.skipped.some(entry => entry.includes('00-core-principles.mdc')));
    assert.ok(!plan.copied.includes('AGENTS.md'));

    await assert.rejects(() =>
      fs.access(path.join(projectRoot, '.agents', 'skills', 'plan-first', 'SKILL.md'))
    );
  });

  test('apply copies missing agent-context files but preserves host AGENTS.md', async () => {
    await syncFromTemplate({
      projectRoot,
      templateRoot,
      layers: ['agent-context'],
      dryRun: false,
    });

    const hostAgents = await fs.readFile(path.join(projectRoot, 'AGENTS.md'), 'utf8');
    assert.match(hostAgents, /Host AGENTS/);

    await fs.access(path.join(projectRoot, '.agents', 'skills', 'plan-first', 'SKILL.md'));
    await fs.access(path.join(projectRoot, '.cursor', 'rules', '13-markdown.mdc'));
    await assert.rejects(() =>
      fs.access(path.join(projectRoot, '.cursor', 'rules', '00-core-principles.mdc'))
    );
  });

  test('operational-memory adds entry shapes only when missing', async () => {
    await fs.mkdir(path.join(projectRoot, 'docs'), { recursive: true });
    await fs.writeFile(path.join(projectRoot, 'docs', 'KNOWN_ERRORS.md'), '# Host log\n');

    const plan = await planLayerSync({
      projectRoot,
      templateRoot,
      layers: ['operational-memory'],
      dryRun: true,
    });

    assert.ok(plan.skipped.some(entry => entry.startsWith('docs/KNOWN_ERRORS.md')));
    assert.ok(plan.copied.includes('docs/DOCS_LAYOUT.md') || plan.copied.includes('docs/operational/automation-gaps.md'));
  });

  test('doctor layer is skipped when .devenv is absent', async () => {
    const plan = await planLayerSync({
      projectRoot,
      templateRoot,
      layers: ['doctor'],
      dryRun: true,
    });

    assert.strictEqual(plan.copied.length, 0);
    assert.ok(plan.warnings.some(text => text.includes('.devenv')));
  });

  test('sync CLI dry-run exits cleanly', async () => {
    const build = spawnSync('npm', ['run', 'build'], {
      cwd: path.join(__dirname, '../..'),
      encoding: 'utf8',
    });
    assert.strictEqual(build.status, 0, build.stderr);

    const cli = spawnSync(
      process.execPath,
      [
        path.join(__dirname, '../../dist/scripts/sync/cli.js'),
        '--layer',
        'agent-context',
        '--template',
        templateRoot,
        '--project-root',
        projectRoot,
        '--json',
      ],
      { encoding: 'utf8' }
    );

    assert.strictEqual(cli.status, 0, cli.stderr || cli.stdout);
    const payload = JSON.parse(cli.stdout.trim());
    assert.strictEqual(payload.dryRun, true);
    assert.ok(payload.copied.length > 0);
  });
});
