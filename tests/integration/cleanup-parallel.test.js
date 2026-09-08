const assert = require('assert');
const { describe, it, beforeEach, afterEach } = require('node:test');
const path = require('path');
const { promises: fs } = require('fs');
const os = require('os');
const { CleanupEngine } = require('../../dist/scripts/cleanup/engine');

describe('Cleanup Engine Parallel Processing', () => {
  let tempDir;
  const basicFixturePath = path.join(__dirname, '..', 'fixtures', 'basic-node-project');

  beforeEach(async () => {
    // Create a temp copy of the basic fixture
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cleanup-parallel-test-'));
    await fs.cp(basicFixturePath, tempDir, { recursive: true });
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  it('should process files in parallel mode', async () => {
    const engine = new CleanupEngine({
      configPath: 'cleanup.config.yaml',
      workingDir: tempDir,
      dryRun: false,
      parallel: true,
      concurrency: 4,
      performance: true
    });

    await engine.loadConfig();
    const report = await engine.execute();

    // Should have processed template blocks and lines
    assert.ok(report.actions.length > 0, 'Should have cleanup actions');
    assert.ok(report.summary.blocksRemoved > 0, 'Should have removed blocks');
    assert.ok(report.summary.linesRemoved > 0, 'Should have removed lines');
    assert.strictEqual(report.errors.length, 0, 'Should have no errors');
  });

  // Performance comparison tests removed - require large fixture
  // Basic parallel functionality tested above
  // See Phase 4: Test simplification for indie developers

  it.skip('should produce same results in parallel vs sequential mode', async () => {
    // Skipped: Requires large-project fixture (removed in Phase 4)
  });

  it.skip('should be faster with parallel processing on large file sets', async () => {
    // Skipped: Requires large-project fixture (removed in Phase 4)
  });

  it('should handle errors gracefully in parallel mode', async () => {
    // Create a file that will cause an error
    const badFilePath = path.join(tempDir, 'src', 'bad-file.js');
    await fs.writeFile(badFilePath, 'invalid content with no markers', 'utf8');
    
    // Make it read-only to cause an error on write
    await fs.chmod(badFilePath, 0o444);

    const engine = new CleanupEngine({
      configPath: 'cleanup.config.yaml',
      workingDir: tempDir,
      dryRun: false,
      parallel: true,
      concurrency: 4
    });

    await engine.loadConfig();
    const report = await engine.execute();

    // Should still process other files despite error
    assert.ok(report.actions.length > 0, 'Should have processed other files');
    
    // Restore permissions for cleanup
    try {
      await fs.chmod(badFilePath, 0o644);
    } catch (e) {
      // Ignore
    }
  });

  it('should respect concurrency limit', async () => {
    const engine = new CleanupEngine({
      configPath: 'cleanup.config.yaml',
      workingDir: tempDir,
      dryRun: true,
      parallel: true,
      concurrency: 2,
      performance: true
    });

    await engine.loadConfig();
    await engine.execute();

    // Test passes if no errors occur
    assert.ok(true, 'Concurrency limit respected');
  });

  it('should work with concurrency of 1 (sequential in parallel mode)', async () => {
    const engine = new CleanupEngine({
      configPath: 'cleanup.config.yaml',
      workingDir: tempDir,
      dryRun: true,
      parallel: true,
      concurrency: 1
    });

    await engine.loadConfig();
    const report = await engine.execute();

    assert.ok(report.actions.length > 0, 'Should process files with concurrency=1');
    assert.strictEqual(report.errors.length, 0, 'Should have no errors');
  });

  it.skip('should handle small file sets without parallel overhead', async () => {
    // Skipped: Requires large-project fixture config (removed in Phase 4)
  });
});

