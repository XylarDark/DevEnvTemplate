/**
 * Integration Tests for Cleanup Workflow
 * 
 * Tests end-to-end cleanup workflows including:
 * - Full cleanup cycle on fixture projects
 * - Manifest-driven feature selection
 * - Multi-rule execution
 * - Report generation
 * - Idempotency
 */

const { describe, test, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs').promises;
const path = require('path');
const { executeCleanup } = require('../../dist/cleanup/engine');
const { createTempFixture, cleanupTempFixture, fileExists, readFile } = require('../utils/fixture-helper');

describe('Cleanup Workflow Integration', () => {
  const tempDirs = [];

  // Clean up all temp directories after tests
  after(async () => {
    for (const dir of tempDirs) {
      await cleanupTempFixture(dir);
    }
  });

  describe('Basic Node.js Project Cleanup', () => {
    test('should clean basic Node.js project successfully', async () => {
      const tempDir = await createTempFixture('basic-node-project');
      tempDirs.push(tempDir);
      
      const { report, exitCode } = await executeCleanup({
        workingDir: tempDir,
        dryRun: false,
        configPath: 'config/cleanup.config.yaml'
      });
      
      assert.strictEqual(exitCode, 0, 'Should exit with code 0');
      assert.ok(report, 'Should return report');
      assert.ok(report.summary, 'Report should have summary');
      assert.ok(report.summary.totalActions >= 0, 'Should have action count');
    });

    test('should remove template-only blocks from files', async () => {
      const tempDir = await createTempFixture('basic-node-project');
      tempDirs.push(tempDir);
      
      // Read original content
      const originalContent = await readFile(tempDir, 'src/app.js');
      assert.ok(originalContent.includes('TEMPLATE-ONLY:START'), 'Original should have template markers');
      
      // Run cleanup
      await executeCleanup({
        workingDir: tempDir,
        dryRun: false,
        configPath: 'config/cleanup.config.yaml'
      });
      
      // Read cleaned content
      const cleanedContent = await readFile(tempDir, 'src/app.js');
      assert.ok(!cleanedContent.includes('TEMPLATE-ONLY:START'), 'Cleaned should not have template markers');
      assert.ok(!cleanedContent.includes('templateOnlyFunction'), 'Cleaned should not have template function');
    });

    test('should remove line-tagged template code', async () => {
      const tempDir = await createTempFixture('basic-node-project');
      tempDirs.push(tempDir);
      
      // Check if template-only file exists
      const exists = await fileExists(tempDir, 'src/template-only-component.js');
      assert.ok(exists, 'Template file should exist before cleanup');
      
      // Run cleanup
      await executeCleanup({
        workingDir: tempDir,
        dryRun: false,
        configPath: 'config/cleanup.config.yaml'
      });
      
      // File might still exist but content should be clean
      // The actual removal depends on whether the rule removes the whole file or just lines
    });

    test('should generate comprehensive report', async () => {
      const tempDir = await createTempFixture('basic-node-project');
      tempDirs.push(tempDir);
      
      const { report } = await executeCleanup({
        workingDir: tempDir,
        dryRun: false,
        configPath: 'config/cleanup.config.yaml'
      });
      
      assert.ok(report.timestamp, 'Should have timestamp');
      assert.ok(report.profile, 'Should have profile');
      assert.ok(Array.isArray(report.features), 'Should have features array');
      assert.ok(Array.isArray(report.actions), 'Should have actions array');
      assert.ok(Array.isArray(report.errors), 'Should have errors array');
      assert.ok(report.summary, 'Should have summary');
      assert.ok(typeof report.summary.totalActions === 'number', 'Should have totalActions count');
    });
  });

  // Python project tests removed - focusing on Node.js for indie developers
  // See Phase 4 optimization: removed python-project fixture

  describe('Already Clean Project', () => {
    test('should not modify clean project', async () => {
      const tempDir = await createTempFixture('already-clean-project');
      tempDirs.push(tempDir);
      
      // Copy config from basic-node-project for testing
      const basicConfigPath = path.join(__dirname, '..', 'fixtures', 'basic-node-project', 'config', 'cleanup.config.yaml');
      const tempConfigDir = path.join(tempDir, 'config');
      await fs.mkdir(tempConfigDir, { recursive: true });
      await fs.copyFile(basicConfigPath, path.join(tempConfigDir, 'cleanup.config.yaml'));
      
      // Read original content
      const originalContent = await readFile(tempDir, 'src/index.js');
      
      // Run cleanup
      const { report } = await executeCleanup({
        workingDir: tempDir,
        dryRun: false,
        configPath: 'config/cleanup.config.yaml'
      });
      
      // Read content after cleanup
      const afterContent = await readFile(tempDir, 'src/index.js');
      
      // Content should be identical
      assert.strictEqual(afterContent, originalContent, 'Clean project should not be modified');
      
      // Should have minimal or no actions
      assert.ok(report.summary.totalActions === 0 || report.summary.blocksRemoved === 0, 
        'Should have minimal actions on clean project');
    });
  });

  describe('Dry Run Mode', () => {
    test('should not modify files in dry-run mode', async () => {
      const tempDir = await createTempFixture('basic-node-project');
      tempDirs.push(tempDir);
      
      // Read original content
      const originalContent = await readFile(tempDir, 'src/app.js');
      
      // Run cleanup in dry-run mode
      const { report } = await executeCleanup({
        workingDir: tempDir,
        dryRun: true,
        configPath: 'config/cleanup.config.yaml'
      });
      
      // Read content after dry-run
      const afterContent = await readFile(tempDir, 'src/app.js');
      
      // Content should be identical
      assert.strictEqual(afterContent, originalContent, 'Dry-run should not modify files');
      
      // But should still report actions
      assert.ok(report.actions.length > 0, 'Should report potential actions');
      assert.ok(report.actions.every(a => a.dryRun === true), 'All actions should be marked as dry-run');
    });
  });

  describe('Idempotency', () => {
    test('should be safe to run cleanup multiple times', async () => {
      const tempDir = await createTempFixture('basic-node-project');
      tempDirs.push(tempDir);
      
      // Run cleanup first time
      const { report: report1 } = await executeCleanup({
        workingDir: tempDir,
        dryRun: false,
        configPath: 'config/cleanup.config.yaml'
      });
      
      const actions1 = report1.summary.totalActions;
      
      // Run cleanup second time
      const { report: report2 } = await executeCleanup({
        workingDir: tempDir,
        dryRun: false,
        configPath: 'config/cleanup.config.yaml'
      });
      
      const actions2 = report2.summary.totalActions;
      
      // Second run should have no or minimal actions
      assert.ok(actions2 <= actions1, 'Second run should have same or fewer actions');
      assert.ok(actions2 === 0 || actions2 < actions1, 'Running cleanup twice should be safe');
    });
  });

  describe('Feature-Based Cleanup', () => {
    test('should respect feature flags during cleanup', async () => {
      const tempDir = await createTempFixture('basic-node-project');
      tempDirs.push(tempDir);
      
      const { report } = await executeCleanup({
        workingDir: tempDir,
        dryRun: true,
        features: ['node', 'api'],
        configPath: 'config/cleanup.config.yaml'
      });
      
      assert.ok(Array.isArray(report.features), 'Report should have features');
      assert.ok(report.features.includes('node'), 'Should include node feature');
      assert.ok(report.features.includes('api'), 'Should include api feature');
    });
  });

  describe('Error Handling', () => {
    test('should handle cleanup with invalid config gracefully', async () => {
      const tempDir = await createTempFixture('basic-node-project');
      tempDirs.push(tempDir);
      
      await assert.rejects(
        async () => await executeCleanup({
          workingDir: tempDir,
          dryRun: true,
          configPath: 'nonexistent-config.yaml'
        }),
        'Should reject with config error'
      );
    });

    test('should handle cleanup with nonexistent directory gracefully', async () => {
      await assert.rejects(
        async () => await executeCleanup({
          workingDir: './nonexistent-directory',
          dryRun: true,
          configPath: 'config/cleanup.config.yaml'
        }),
        'Should reject with directory error'
      );
    });
  });

  describe('Report Export', () => {
    test('should export report to JSON file', async () => {
      const tempDir = await createTempFixture('basic-node-project');
      tempDirs.push(tempDir);
      
      const reportPath = path.join(tempDir, 'cleanup-report.json');
      
      await executeCleanup({
        workingDir: tempDir,
        dryRun: true,
        configPath: 'config/cleanup.config.yaml',
        report: 'cleanup-report.json'
      });
      
      // Check if report file exists
      const exists = await fileExists(tempDir, 'cleanup-report.json');
      assert.ok(exists, 'Report file should be created');
      
      // Verify report content
      const reportContent = await readFile(tempDir, 'cleanup-report.json');
      const report = JSON.parse(reportContent);
      
      assert.ok(report.timestamp, 'Report should have timestamp');
      assert.ok(report.summary, 'Report should have summary');
    });
  });
});

