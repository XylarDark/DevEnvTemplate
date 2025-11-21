const { test } = require('node:test');
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

  test('should detect existing rules when .cursor/rules/ exists', async () => {
    // Create .cursor/rules directory with some files
    const rulesDir = path.join(tempDir, '.cursor', 'rules');
    await fs.mkdir(rulesDir, { recursive: true });
    
    // Create some rule files
    await fs.writeFile(path.join(rulesDir, '00-core-principles.mdc'), '# Core Principles\n');
    await fs.writeFile(path.join(rulesDir, '10-typescript.mdc'), '# TypeScript Rules\n');
    await fs.writeFile(path.join(rulesDir, '99-custom.mdc'), '# Custom Rules\n');

    const result = await adapter.detectExistingRules(tempDir);

    assert.strictEqual(result.present, true);
    assert.strictEqual(result.existingFiles.length, 3);
    assert.strictEqual(result.coreFiles.length, 1);
    assert.strictEqual(result.conditionalFiles.length, 1);
    assert.strictEqual(result.projectSpecificFiles.length, 1);
    assert.strictEqual(result.projectSpecificFiles[0], '99-custom.mdc');
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
      frameworks: { type: 'vanilla' }
    };

    assert.strictEqual(adapter.shouldIncludeRule('10-typescript.mdc', stackReport), true);
    assert.strictEqual(adapter.shouldIncludeRule('11-javascript.mdc', stackReport), false);
  });

  test('should include JavaScript rule when JavaScript detected but no TypeScript', () => {
    const stackReport = {
      technologies: [{ name: 'Node.js', version: '20' }],
      quality: { typescript: false },
      frameworks: { type: 'vanilla' }
    };

    assert.strictEqual(adapter.shouldIncludeRule('11-javascript.mdc', stackReport), true);
  });

  test('should not include JavaScript rule when TypeScript is present', () => {
    const stackReport = {
      technologies: [{ name: 'TypeScript', version: '5.0' }],
      quality: { typescript: true },
      frameworks: { type: 'vanilla' }
    };

    assert.strictEqual(adapter.shouldIncludeRule('11-javascript.mdc', stackReport), false);
  });

  test('should include Python rule when Python is detected', () => {
    const stackReport = {
      technologies: [{ name: 'Python', version: '3.11' }],
      quality: { typescript: false },
      frameworks: { type: 'vanilla' }
    };

    assert.strictEqual(adapter.shouldIncludeRule('12-python.mdc', stackReport), true);
  });

  test('should include frontend rule when React is detected', () => {
    const stackReport = {
      technologies: [{ name: 'React', version: '18' }],
      quality: { typescript: false },
      frameworks: { type: 'react' }
    };

    assert.strictEqual(adapter.shouldIncludeRule('20-frontend-frameworks.mdc', stackReport), true);
  });

  test('should always include core rules', () => {
    const stackReport = {
      technologies: [],
      quality: { typescript: false },
      frameworks: { type: 'vanilla' }
    };

    assert.strictEqual(adapter.shouldIncludeRule('00-core-principles.mdc', stackReport), true);
    assert.strictEqual(adapter.shouldIncludeRule('01-code-quality.mdc', stackReport), true);
    assert.strictEqual(adapter.shouldIncludeRule('08-project-context.mdc', stackReport), true);
  });

  test('should adapt rules for stack', async () => {
    // Create template rules directory
    const templateDir = path.join(tempDir, 'template', '.cursor', 'rules');
    await fs.mkdir(templateDir, { recursive: true });
    
    // Create rule files
    await fs.writeFile(path.join(templateDir, '00-core-principles.mdc'), '# Core\n');
    await fs.writeFile(path.join(templateDir, '10-typescript.mdc'), '# TS\n');
    await fs.writeFile(path.join(templateDir, '11-javascript.mdc'), '# JS\n');
    await fs.writeFile(path.join(templateDir, '12-python.mdc'), '# Python\n');

    const stackReport = {
      technologies: [{ name: 'TypeScript', version: '5.0' }],
      quality: { typescript: true },
      frameworks: { type: 'vanilla' }
    };

    const selected = await adapter.adaptRulesForStack(stackReport, templateDir);

    // Should include core and TypeScript, but not JavaScript or Python
    assert.ok(selected.includes('00-core-principles.mdc'));
    assert.ok(selected.includes('10-typescript.mdc'));
    assert.ok(!selected.includes('11-javascript.mdc'));
    assert.ok(!selected.includes('12-python.mdc'));
  });
});

