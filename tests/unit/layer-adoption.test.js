const { describe, test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs/promises');
const path = require('path');
const os = require('os');

const { adoptLayers, parseLayerList } = require('../../dist/scripts/agent/layers');

const vanillaStack = {
  technologies: [],
  quality: { typescript: false },
  frameworks: { type: 'vanilla', version: null, dirs: [] },
  files: { key_patterns: [], configs: [] },
  scripts: { detected: [], missing: [] },
  tooling: {
    testing: { present: false },
    linting: { present: false },
    formatting: { present: false },
  },
};

describe('layer adoption', () => {
  let tempDir;
  let templateRoot;
  let projectDir;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'layer-adopt-test-'));
    templateRoot = path.join(tempDir, 'template');
    projectDir = path.join(tempDir, 'host');

    await fs.mkdir(path.join(templateRoot, 'scripts', 'agent', 'stubs'), { recursive: true });
    await fs.mkdir(path.join(templateRoot, '.cursor', 'rules'), { recursive: true });
    await fs.mkdir(path.join(templateRoot, '.agents', 'skills', 'plan-first'), { recursive: true });
    await fs.mkdir(projectDir, { recursive: true });

    await fs.writeFile(
      path.join(templateRoot, 'scripts', 'agent', 'stubs', 'KNOWN_ERRORS.stub.md'),
      '# Known errors\n'
    );
    await fs.writeFile(
      path.join(templateRoot, 'scripts', 'agent', 'stubs', 'DOCS_LAYOUT.stub.md'),
      '# Docs layout\n'
    );
    await fs.writeFile(
      path.join(templateRoot, 'scripts', 'agent', 'stubs', 'automation-gaps.stub.md'),
      '# Automation gaps\n'
    );
    await fs.writeFile(path.join(templateRoot, '.cursor', 'rules', '10-typescript.mdc'), '# TS\n');
    await fs.writeFile(
      path.join(templateRoot, '.agents', 'skills', 'plan-first', 'SKILL.md'),
      '---\nname: plan-first\ndescription: Use when planning.\n---\n'
    );
    await fs.writeFile(
      path.join(templateRoot, 'package.json'),
      JSON.stringify({ name: 'devenv-template', scripts: { doctor: 'node dist/scripts/doctor/cli.js' } })
    );
    await fs.writeFile(path.join(templateRoot, 'tsconfig.json'), '{}\n');
    await fs.writeFile(
      path.join(projectDir, 'package.json'),
      JSON.stringify({ name: 'host-app', scripts: {} })
    );
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  test('parseLayerList accepts known layers and rejects unknown ones', () => {
    assert.deepStrictEqual(parseLayerList('agent-context,doctor'), [
      'agent-context',
      'doctor',
    ]);
    assert.throws(() => parseLayerList('agent-context,unknown'), /Unknown layer/);
  });

  test('operational-memory copies only doc stubs', async () => {
    const summary = await adoptLayers({
      projectRoot: projectDir,
      templateRoot,
      layers: ['operational-memory'],
      stackReport: vanillaStack,
    });

    const result = summary.results[0];
    assert.strictEqual(result.layer, 'operational-memory');
    assert.ok(result.copied.includes('docs/KNOWN_ERRORS.md'));

    const knownErrors = await fs.readFile(
      path.join(projectDir, 'docs', 'KNOWN_ERRORS.md'),
      'utf8'
    );
    assert.match(knownErrors, /Known errors/);
    assert.ok(!summary.agentsMd, 'operational-memory alone should not write AGENTS.md');
  });

  test('agent-context writes AGENTS.md stub and copies skills', async () => {
    const summary = await adoptLayers({
      projectRoot: projectDir,
      templateRoot,
      layers: ['agent-context'],
      stackReport: vanillaStack,
      declinedLayers: ['operational-memory', 'doctor'],
    });

    assert.strictEqual(summary.agentsMd?.written, true);
    const agents = await fs.readFile(path.join(projectDir, 'AGENTS.md'), 'utf8');
    assert.doesNotMatch(agents, /DevEnvTemplate is the \*\*doctor\*\*/);

    const agentResult = summary.results.find(r => r.layer === 'agent-context');
    assert.ok(agentResult.copied.includes('plan-first/SKILL.md'));
  });

  test('doctor layer vendors under .devenv and wires host scripts', async () => {
    const summary = await adoptLayers({
      projectRoot: projectDir,
      templateRoot,
      layers: ['doctor'],
      stackReport: vanillaStack,
    });

    const doctorResult = summary.results[0];
    assert.strictEqual(doctorResult.layer, 'doctor');
    assert.ok(doctorResult.copied.some(file => file.includes('.devenv/package.json')));

    const hostPackage = JSON.parse(
      await fs.readFile(path.join(projectDir, 'package.json'), 'utf8')
    );
    assert.match(hostPackage.scripts.doctor, /\.devenv\/dist\/scripts\/doctor\/cli\.js/);
  });

  test('layers stay independent — agent-context without doctor', async () => {
    const summary = await adoptLayers({
      projectRoot: projectDir,
      templateRoot,
      layers: ['agent-context'],
      stackReport: vanillaStack,
    });

    await assert.rejects(() => fs.access(path.join(projectDir, '.devenv', 'package.json')));
    assert.ok(summary.agentsMd?.written);
  });

  test('dry-run writes nothing', async () => {
    const summary = await adoptLayers({
      projectRoot: projectDir,
      templateRoot,
      layers: ['operational-memory', 'agent-context'],
      stackReport: vanillaStack,
      dryRun: true,
    });

    assert.strictEqual(summary.results.length, 2);
    for (const result of summary.results) {
      assert.strictEqual(result.copied.length, 0);
    }
    await assert.rejects(() => fs.access(path.join(projectDir, 'docs', 'KNOWN_ERRORS.md')));
    await assert.rejects(() => fs.access(path.join(projectDir, 'AGENTS.md')));
  });
});
