const { describe, test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs/promises');
const path = require('path');
const os = require('os');

const {
  buildAgentsStub,
  looksLikeTemplateAgents,
  writeAgentsStub,
} = require('../../dist/scripts/agent/agents-stub');

const vanillaStack = {
  technologies: [{ name: 'TypeScript', version: '5.0' }],
  quality: { typescript: true, testing: true, linting: true },
  frameworks: { type: 'vanilla', version: null, dirs: ['src'] },
  files: { key_patterns: ['src/**/*.ts'], configs: [] },
  scripts: {
    detected: [
      { name: 'test', command: 'node --test tests/**/*.test.js' },
      { name: 'lint', command: 'eslint .' },
    ],
    missing: [],
  },
  tooling: {
    testing: { present: true, frameworks: [{ name: 'Node test runner', config: 'package.json' }] },
    linting: { present: true, frameworks: [{ name: 'ESLint', config: 'eslint.config.js' }] },
    formatting: { present: false },
  },
  manifest: { name: 'my-host-app' },
};

describe('agents-stub', () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'agents-stub-test-'));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  test('builds a short host stub from detected stack facts', () => {
    const content = buildAgentsStub({
      projectRoot: tempDir,
      stackReport: vanillaStack,
      declinedLayers: ['doctor'],
    });

    assert.match(content, /# my-host-app — agent instructions/);
    assert.match(content, /TypeScript/);
    assert.match(content, /`test`/);
    assert.match(content, /`src\/`/);
    assert.match(content, /doctor.*not adopted/s);
    assert.ok(content.split('\n').length <= 40, 'stub should stay concise');
  });

  test('does not copy template AGENTS.md markers into the stub', () => {
    const content = buildAgentsStub({
      projectRoot: tempDir,
      stackReport: vanillaStack,
    });

    assert.ok(!looksLikeTemplateAgents(content));
    assert.doesNotMatch(content, /DevEnvTemplate is the \*\*doctor\*\*/);
  });

  test('writes AGENTS.md when the host has none', async () => {
    const result = await writeAgentsStub({
      projectRoot: tempDir,
      stackReport: vanillaStack,
    });

    assert.strictEqual(result.written, true);
    const written = await fs.readFile(result.path, 'utf8');
    assert.match(written, /my-host-app/);
  });

  test('skips writing when AGENTS.md already exists', async () => {
    await fs.writeFile(path.join(tempDir, 'AGENTS.md'), '# Existing host file\n');

    const result = await writeAgentsStub({
      projectRoot: tempDir,
      stackReport: vanillaStack,
    });

    assert.strictEqual(result.written, false);
    const kept = await fs.readFile(result.path, 'utf8');
    assert.strictEqual(kept, '# Existing host file\n');
  });

  test('detects the template own AGENTS.md content', async () => {
    const templateAgents = await fs.readFile(path.join(__dirname, '..', '..', 'AGENTS.md'), 'utf8');
    assert.ok(looksLikeTemplateAgents(templateAgents));
  });
});
