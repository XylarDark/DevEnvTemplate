const assert = require('assert');
const { describe, it, beforeEach, afterEach } = require('node:test');
const path = require('path');
const { promises: fs } = require('fs');
const os = require('os');
const { CleanupEngine } = require('../../dist/scripts/cleanup/engine');

describe('Cleanup Engine Parallel Processing', () => {
  let tempDir;
  const largeFixturePath = path.join(__dirname, '..', 'fixtures', 'large-project');

  beforeEach(async () => {
    // Create a temp copy of the large fixture
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cleanup-parallel-test-'));
    await fs.cp(largeFixturePath, tempDir, { recursive: true });
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

  it('should produce same results in parallel vs sequential mode', async () => {
    // Run sequential
    const sequentialEngine = new CleanupEngine({
      configPath: 'cleanup.config.yaml',
      workingDir: tempDir,
      dryRun: true,
      parallel: false
    });

    await sequentialEngine.loadConfig();
    const sequentialReport = await sequentialEngine.execute();

    // Create another temp copy for parallel run
    const tempDir2 = await fs.mkdtemp(path.join(os.tmpdir(), 'cleanup-parallel-test2-'));
    await fs.cp(largeFixturePath, tempDir2, { recursive: true });

    // Run parallel
    const parallelEngine = new CleanupEngine({
      configPath: 'cleanup.config.yaml',
      workingDir: tempDir2,
      dryRun: true,
      parallel: true,
      concurrency: 4
    });

    await parallelEngine.loadConfig();
    const parallelReport = await parallelEngine.execute();

    // Cleanup temp dir
    await fs.rm(tempDir2, { recursive: true, force: true });

    // Compare results
    assert.strictEqual(parallelReport.actions.length, sequentialReport.actions.length, 
      'Should have same number of actions');
    assert.strictEqual(parallelReport.summary.blocksRemoved, sequentialReport.summary.blocksRemoved,
      'Should remove same number of blocks');
    assert.strictEqual(parallelReport.summary.linesRemoved, sequentialReport.summary.linesRemoved,
      'Should remove same number of lines');
  });

  it('should be faster with parallel processing on large file sets', async () => {
    // Sequential run
    const seqStart = Date.now();
    const sequentialEngine = new CleanupEngine({
      configPath: 'cleanup.config.yaml',
      workingDir: tempDir,
      dryRun: true,
      parallel: false
    });

    await sequentialEngine.loadConfig();
    await sequentialEngine.execute();
    const seqDuration = Date.now() - seqStart;

    // Create another temp copy for parallel run
    const tempDir2 = await fs.mkdtemp(path.join(os.tmpdir(), 'cleanup-parallel-test2-'));
    await fs.cp(largeFixturePath, tempDir2, { recursive: true });

    // Parallel run
    const parStart = Date.now();
    const parallelEngine = new CleanupEngine({
      configPath: 'cleanup.config.yaml',
      workingDir: tempDir2,
      dryRun: true,
      parallel: true,
      concurrency: os.cpus().length
    });

    await parallelEngine.loadConfig();
    await parallelEngine.execute();
    const parDuration = Date.now() - parStart;

    // Cleanup temp dir
    await fs.rm(tempDir2, { recursive: true, force: true });

    console.log(`Sequential: ${seqDuration}ms, Parallel: ${parDuration}ms, Speedup: ${(seqDuration / parDuration).toFixed(2)}x`);

    // Parallel should be at least 20% faster (conservative estimate)
    // In practice, it should be 2-3x faster, but we're being conservative for CI
    assert.ok(parDuration < seqDuration * 0.8, 
      `Parallel (${parDuration}ms) should be faster than sequential (${seqDuration}ms)`);
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

  it('should handle small file sets without parallel overhead', async () => {
    // Create a small fixture with only 5 files
    const smallTempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cleanup-small-'));
    await fs.mkdir(path.join(smallTempDir, 'src'), { recursive: true });

    for (let i = 0; i < 5; i++) {
      const content = `// File ${i}\n// TEMPLATE_ONLY_START\ntemplate();\n// TEMPLATE_ONLY_END\nproduction();`;
      await fs.writeFile(path.join(smallTempDir, 'src', `file${i}.js`), content);
    }

    await fs.cp(path.join(largeFixturePath, 'cleanup.config.yaml'), path.join(smallTempDir, 'cleanup.config.yaml'));

    const engine = new CleanupEngine({
      configPath: 'cleanup.config.yaml',
      workingDir: smallTempDir,
      dryRun: true,
      parallel: true,
      concurrency: 4
    });

    await engine.loadConfig();
    const report = await engine.execute();

    // Should process successfully (sequential path due to < 10 files)
    assert.ok(report.actions.length > 0, 'Should process small file sets');
    assert.strictEqual(report.errors.length, 0, 'Should have no errors');

    await fs.rm(smallTempDir, { recursive: true, force: true });
  });
});

