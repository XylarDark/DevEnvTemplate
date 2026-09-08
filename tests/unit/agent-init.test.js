const { describe, test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs/promises');
const path = require('path');
const os = require('os');

const { runInit } = require('../../dist/scripts/agent/init').default;

describe('agent init CLI', () => {
  let tempDir;
  let templateRoot;
  let projectDir;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'agent-init-test-'));
    templateRoot = path.join(tempDir, 'template');
    projectDir = path.join(tempDir, 'host');

    await fs.mkdir(path.join(templateRoot, 'scripts', 'agent', 'stubs'), { recursive: true });
    await fs.mkdir(path.join(templateRoot, '.cursor', 'rules'), { recursive: true });
    await fs.mkdir(path.join(templateRoot, '.agents', 'skills', 'plan-first'), { recursive: true });
    await fs.mkdir(projectDir, { recursive: true });

    for (const stub of ['KNOWN_ERRORS.stub.md', 'DOCS_LAYOUT.stub.md', 'automation-gaps.stub.md']) {
      await fs.writeFile(
        path.join(templateRoot, 'scripts', 'agent', 'stubs', stub),
        `# ${stub}\n`
      );
    }
    await fs.writeFile(path.join(templateRoot, '.cursor', 'rules', '10-typescript.mdc'), '# TS\n');
    await fs.writeFile(
      path.join(templateRoot, '.agents', 'skills', 'plan-first', 'SKILL.md'),
      '---\nname: plan-first\ndescription: Use when planning.\n---\n'
    );
    await fs.writeFile(
      path.join(projectDir, 'package.json'),
      JSON.stringify({
        name: 'init-host',
        scripts: { test: 'node --test tests/**/*.test.js' },
      })
    );
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  test('runInit with defaults scaffolds agent-context and operational-memory', async () => {
    await runInit({
      projectRoot: projectDir,
      templateRoot,
      defaults: true,
    });

    await fs.access(path.join(projectDir, 'AGENTS.md'));
    await fs.access(path.join(projectDir, 'docs', 'KNOWN_ERRORS.md'));
    await fs.access(path.join(projectDir, '.agents', 'skills', 'plan-first', 'SKILL.md'));
  });

  test('runInit honors explicit layer list', async () => {
    await runInit({
      projectRoot: projectDir,
      templateRoot,
      layers: ['operational-memory'],
    });

    await fs.access(path.join(projectDir, 'docs', 'KNOWN_ERRORS.md'));
    await assert.rejects(() => fs.access(path.join(projectDir, 'AGENTS.md')));
  });
});
