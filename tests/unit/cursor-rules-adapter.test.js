const { describe, test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// Import the adapter module (will be compiled)
let adapter;
try {
  adapter = require('../../dist/scripts/tools/cursor-rules-adapter');
} catch {
  // Fallback to source if dist doesn't exist
  adapter = require('../../scripts/tools/cursor-rules-adapter');
}

describe('Cursor Rules Adapter', () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cursor-rules-test-'));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  test('should sort existing rules into stack, retired, and project-specific', async () => {
    const rulesDir = path.join(tempDir, '.cursor', 'rules');
    await fs.mkdir(rulesDir, { recursive: true });

    await fs.writeFile(path.join(rulesDir, '00-core-principles.mdc'), '# Core Principles\n');
    await fs.writeFile(path.join(rulesDir, '10-typescript.mdc'), '# TypeScript Rules\n');
    await fs.writeFile(path.join(rulesDir, '99-custom.mdc'), '# Custom Rules\n');

    const result = await adapter.detectExistingRules(tempDir);

    assert.strictEqual(result.present, true);
    assert.strictEqual(result.existingFiles.length, 3);
    assert.deepStrictEqual(result.stackFiles, ['10-typescript.mdc']);
    assert.deepStrictEqual(result.retiredAlwaysOnFiles, ['00-core-principles.mdc']);
    assert.deepStrictEqual(result.projectSpecificFiles, ['99-custom.mdc']);
  });

  test('should need integration when a retired always-on rule is still present', async () => {
    const rulesDir = path.join(tempDir, '.cursor', 'rules');
    await fs.mkdir(rulesDir, { recursive: true });

    // A stack rule is present, so the only reason to act is the retired rule's per-turn cost.
    await fs.writeFile(path.join(rulesDir, '10-typescript.mdc'), '# TypeScript Rules\n');
    await fs.writeFile(path.join(rulesDir, '07-ai-agent-behavior.mdc'), '# Behavior\n');

    const result = await adapter.detectExistingRules(tempDir);

    assert.strictEqual(result.needsIntegration, true);
  });

  test('should not need integration when only stack and project rules are present', async () => {
    const rulesDir = path.join(tempDir, '.cursor', 'rules');
    await fs.mkdir(rulesDir, { recursive: true });

    await fs.writeFile(path.join(rulesDir, '10-typescript.mdc'), '# TypeScript Rules\n');
    await fs.writeFile(path.join(rulesDir, '99-custom.mdc'), '# Custom Rules\n');

    const result = await adapter.detectExistingRules(tempDir);

    assert.strictEqual(result.needsIntegration, false);
  });

  test('every shipped rule is glob-scoped and none is always-applied', async () => {
    // The architecture's core claim: nothing in .cursor/rules/ costs context on every turn.
    const rulesDir = path.join(__dirname, '..', '..', '.cursor', 'rules');
    const entries = await fs.readdir(rulesDir);
    const rules = entries.filter(name => name.endsWith('.mdc'));

    assert.ok(rules.length > 0, 'expected at least one rule to be shipped');

    for (const rule of rules) {
      const content = await fs.readFile(path.join(rulesDir, rule), 'utf8');

      assert.match(
        content,
        /^globs:\s*\S/m,
        `${rule} has no globs, so it is not scoped to any file type`
      );
      assert.doesNotMatch(
        content,
        /^alwaysApply:\s*true/m,
        `${rule} is always-applied; that content belongs in AGENTS.md or a skill`
      );
      assert.ok(
        adapter.STACK_SCOPED_FILES.includes(rule),
        `${rule} is not listed in STACK_SCOPED_FILES, so it would never be copied to a host`
      );
    }
  });

  test('should return present=false when .cursor/rules/ does not exist', async () => {
    const result = await adapter.detectExistingRules(tempDir);

    assert.strictEqual(result.present, false);
    assert.strictEqual(result.existingFiles.length, 0);
    assert.strictEqual(result.needsIntegration, false);
  });

  test('should include TypeScript rule when TypeScript is detected', () => {
    const stackReport = {
      technologies: [{ name: 'TypeScript', version: '5.0' }],
      quality: { typescript: true },
      frameworks: { type: 'vanilla' },
    };

    assert.strictEqual(adapter.shouldIncludeRule('10-typescript.mdc', stackReport), true);
    assert.strictEqual(adapter.shouldIncludeRule('11-javascript.mdc', stackReport), false);
  });

  test('should include JavaScript rule when JavaScript detected but no TypeScript', () => {
    const stackReport = {
      technologies: [{ name: 'Node.js', version: '20' }],
      quality: { typescript: false },
      frameworks: { type: 'vanilla' },
    };

    assert.strictEqual(adapter.shouldIncludeRule('11-javascript.mdc', stackReport), true);
  });

  test('should not include JavaScript rule when TypeScript is present', () => {
    const stackReport = {
      technologies: [{ name: 'TypeScript', version: '5.0' }],
      quality: { typescript: true },
      frameworks: { type: 'vanilla' },
    };

    assert.strictEqual(adapter.shouldIncludeRule('11-javascript.mdc', stackReport), false);
  });

  test('should include Python rule when Python is detected', () => {
    const stackReport = {
      technologies: [{ name: 'Python', version: '3.11' }],
      quality: { typescript: false },
      frameworks: { type: 'vanilla' },
    };

    assert.strictEqual(adapter.shouldIncludeRule('12-python.mdc', stackReport), true);
  });

  test('should include frontend rule when React is detected', () => {
    const stackReport = {
      technologies: [{ name: 'React', version: '18' }],
      quality: { typescript: false },
      frameworks: { type: 'react' },
    };

    assert.strictEqual(adapter.shouldIncludeRule('20-frontend-frameworks.mdc', stackReport), true);
  });

  test('should never select a retired always-on rule', () => {
    const stackReport = {
      technologies: [],
      quality: { typescript: false },
      frameworks: { type: 'vanilla' },
    };

    for (const retired of adapter.RETIRED_ALWAYS_ON_FILES) {
      assert.strictEqual(
        adapter.shouldIncludeRule(retired, stackReport),
        false,
        `${retired} was retired and must not be copied into a host`
      );
    }
  });

  test('should name a replacement for every retired rule', () => {
    // Without this, the doctor tells a host to delete a rule and cannot say where it went.
    for (const retired of adapter.RETIRED_ALWAYS_ON_FILES) {
      assert.ok(
        adapter.RETIRED_RULE_REPLACEMENTS[retired],
        `${retired} has no documented replacement`
      );
    }
  });

  test('should include Unreal rules when unrealProjectDetected', () => {
    const stackReport = {
      technologies: [],
      quality: { typescript: false },
      frameworks: { type: 'vanilla' },
      unrealProjectDetected: true,
    };

    assert.strictEqual(adapter.shouldIncludeRule('21-unreal-engine.mdc', stackReport), true);
    assert.strictEqual(adapter.shouldIncludeRule('22-unreal-editor-ui.mdc', stackReport), true);
  });

  test('should omit Unreal rules when unrealProjectDetected is unset', () => {
    const stackReport = {
      technologies: [],
      quality: { typescript: false },
      frameworks: { type: 'vanilla' },
    };

    assert.strictEqual(adapter.shouldIncludeRule('21-unreal-engine.mdc', stackReport), false);
    assert.strictEqual(adapter.shouldIncludeRule('22-unreal-editor-ui.mdc', stackReport), false);
  });

  test('should include Unity rule when unityProjectDetected', () => {
    const stackReport = {
      technologies: [],
      quality: { typescript: false },
      frameworks: { type: 'vanilla' },
      unityProjectDetected: true,
    };

    assert.strictEqual(adapter.shouldIncludeRule('23-unity-csharp.mdc', stackReport), true);
    assert.strictEqual(adapter.shouldIncludeRule('21-unreal-engine.mdc', stackReport), false);
  });

  test('should omit Unity rule when unityProjectDetected is unset', () => {
    const stackReport = {
      technologies: [],
      quality: { typescript: false },
      frameworks: { type: 'vanilla' },
    };

    assert.strictEqual(adapter.shouldIncludeRule('23-unity-csharp.mdc', stackReport), false);
  });

  test('should adapt rules for stack', async () => {
    const templateDir = path.join(tempDir, 'template', '.cursor', 'rules');
    await fs.mkdir(templateDir, { recursive: true });

    await fs.writeFile(path.join(templateDir, '00-core-principles.mdc'), '# Core\n');
    await fs.writeFile(path.join(templateDir, '10-typescript.mdc'), '# TS\n');
    await fs.writeFile(path.join(templateDir, '11-javascript.mdc'), '# JS\n');
    await fs.writeFile(path.join(templateDir, '12-python.mdc'), '# Python\n');

    const stackReport = {
      technologies: [{ name: 'TypeScript', version: '5.0' }],
      quality: { typescript: true },
      frameworks: { type: 'vanilla' },
    };

    const selected = await adapter.adaptRulesForStack(stackReport, templateDir);

    assert.ok(selected.includes('10-typescript.mdc'));
    assert.ok(!selected.includes('11-javascript.mdc'));
    assert.ok(!selected.includes('12-python.mdc'));
    assert.ok(
      !selected.includes('00-core-principles.mdc'),
      'retired always-on rules must not be selected even when present in the template'
    );
  });

  test('getRuleSelection separates stack, skipped, and retired rules', () => {
    const stackReport = {
      technologies: [{ name: 'TypeScript', version: '5.0' }],
      quality: { typescript: true },
      frameworks: { type: 'vanilla' },
      files: { key_patterns: [] },
    };

    const selection = adapter.getRuleSelection(stackReport, [
      '10-typescript.mdc',
      '12-python.mdc',
      '02-security.mdc',
    ]);

    assert.deepStrictEqual(selection.stackRules, ['10-typescript.mdc']);
    assert.deepStrictEqual(selection.skippedRules, ['12-python.mdc']);
    assert.deepStrictEqual(selection.retiredRules, ['02-security.mdc']);
    assert.match(selection.reason, /retired/i);
  });
});
