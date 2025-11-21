const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// Import the integration module (will be compiled)
let integration;
try {
  integration = require('../../dist/scripts/tools/cursor-rules-integration');
} catch {
  // Fallback to source if dist doesn't exist
  integration = require('../../scripts/tools/cursor-rules-integration');
}

describe('Cursor Rules Integration', () => {
  let tempDir;
  let templateDir;
  let projectDir;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cursor-integration-test-'));
    templateDir = path.join(tempDir, 'template', '.cursor', 'rules');
    projectDir = path.join(tempDir, 'project');
    
    await fs.mkdir(templateDir, { recursive: true });
    await fs.mkdir(projectDir, { recursive: true });

    // Create template rule files
    await fs.writeFile(path.join(templateDir, '00-core-principles.mdc'), '# Core Principles\n');
    await fs.writeFile(path.join(templateDir, '01-code-quality.mdc'), '# Code Quality\n');
    await fs.writeFile(path.join(templateDir, '10-typescript.mdc'), '# TypeScript\n');
    await fs.writeFile(path.join(templateDir, '12-python.mdc'), '# Python\n');
    await fs.writeFile(path.join(templateDir, 'README.md'), '# Cursor Rules\n');
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  test('should copy core rules to new project', async () => {
    const stackReport = {
      technologies: [],
      quality: { typescript: false },
      frameworks: { type: 'vanilla' },
      files: { key_patterns: [] }
    };

    const result = await integration.integrateCursorRules({
      projectRoot: projectDir,
      templateRulesPath: templateDir,
      stackReport,
      overwriteCore: false,
      dryRun: false
    });

    assert.strictEqual(result.copied.length, 2); // Core rules + README
    assert.ok(result.copied.includes('00-core-principles.mdc'));
    assert.ok(result.copied.includes('01-code-quality.mdc'));

    // Verify files were actually copied
    const rulesDir = path.join(projectDir, '.cursor', 'rules');
    const copiedFile = await fs.readFile(path.join(rulesDir, '00-core-principles.mdc'), 'utf8');
    assert.strictEqual(copiedFile, '# Core Principles\n');
  });

  test('should copy conditional rules based on stack', async () => {
    const stackReport = {
      technologies: [{ name: 'TypeScript', version: '5.0' }],
      quality: { typescript: true },
      frameworks: { type: 'vanilla' },
      files: { key_patterns: [] }
    };

    const result = await integration.integrateCursorRules({
      projectRoot: projectDir,
      templateRulesPath: templateDir,
      stackReport,
      overwriteCore: false,
      dryRun: false
    });

    // Should include TypeScript rule but not Python
    assert.ok(result.copied.includes('10-typescript.mdc'));
    assert.ok(!result.copied.includes('12-python.mdc'));
  });

  test('should preserve project-specific rules', async () => {
    // Create project with existing custom rule
    const projectRulesDir = path.join(projectDir, '.cursor', 'rules');
    await fs.mkdir(projectRulesDir, { recursive: true });
    await fs.writeFile(path.join(projectRulesDir, '99-custom.mdc'), '# Custom Project Rules\n');

    const stackReport = {
      technologies: [],
      quality: { typescript: false },
      frameworks: { type: 'vanilla' },
      files: { key_patterns: [] }
    };

    const result = await integration.integrateCursorRules({
      projectRoot: projectDir,
      templateRulesPath: templateDir,
      stackReport,
      overwriteCore: false,
      dryRun: false
    });

    assert.ok(result.preserved.includes('99-custom.mdc'));

    // Verify custom file still exists
    const customFile = await fs.readFile(path.join(projectRulesDir, '99-custom.mdc'), 'utf8');
    assert.strictEqual(customFile, '# Custom Project Rules\n');
  });

  test('should not overwrite existing core files by default', async () => {
    // Create project with existing core file
    const projectRulesDir = path.join(projectDir, '.cursor', 'rules');
    await fs.mkdir(projectRulesDir, { recursive: true });
    await fs.writeFile(path.join(projectRulesDir, '00-core-principles.mdc'), '# Modified Core\n');

    const stackReport = {
      technologies: [],
      quality: { typescript: false },
      frameworks: { type: 'vanilla' },
      files: { key_patterns: [] }
    };

    const result = await integration.integrateCursorRules({
      projectRoot: projectDir,
      templateRulesPath: templateDir,
      stackReport,
      overwriteCore: false,
      dryRun: false
    });

    // Should not copy existing file
    assert.ok(!result.copied.includes('00-core-principles.mdc'));
    assert.ok(result.updated.includes('00-core-principles.mdc'));

    // Verify file was not overwritten
    const existingFile = await fs.readFile(path.join(projectRulesDir, '00-core-principles.mdc'), 'utf8');
    assert.strictEqual(existingFile, '# Modified Core\n');
  });

  test('should overwrite core files when overwriteCore=true', async () => {
    // Create project with existing core file
    const projectRulesDir = path.join(projectDir, '.cursor', 'rules');
    await fs.mkdir(projectRulesDir, { recursive: true });
    await fs.writeFile(path.join(projectRulesDir, '00-core-principles.mdc'), '# Modified Core\n');

    const stackReport = {
      technologies: [],
      quality: { typescript: false },
      frameworks: { type: 'vanilla' },
      files: { key_patterns: [] }
    };

    const result = await integration.integrateCursorRules({
      projectRoot: projectDir,
      templateRulesPath: templateDir,
      stackReport,
      overwriteCore: true,
      dryRun: false
    });

    // Should copy and overwrite
    assert.ok(result.copied.includes('00-core-principles.mdc'));

    // Verify file was overwritten
    const overwrittenFile = await fs.readFile(path.join(projectRulesDir, '00-core-principles.mdc'), 'utf8');
    assert.strictEqual(overwrittenFile, '# Core Principles\n');
  });

  test('should work in dry-run mode', async () => {
    const stackReport = {
      technologies: [],
      quality: { typescript: false },
      frameworks: { type: 'vanilla' },
      files: { key_patterns: [] }
    };

    const result = await integration.integrateCursorRules({
      projectRoot: projectDir,
      templateRulesPath: templateDir,
      stackReport,
      overwriteCore: false,
      dryRun: true
    });

    // Should return empty results in dry-run
    assert.strictEqual(result.copied.length, 0);

    // Verify no files were actually created
    const rulesDir = path.join(projectDir, '.cursor', 'rules');
    try {
      await fs.access(rulesDir);
      const files = await fs.readdir(rulesDir);
      assert.strictEqual(files.length, 0);
    } catch {
      // Directory doesn't exist, which is fine for dry-run
    }
  });
});

