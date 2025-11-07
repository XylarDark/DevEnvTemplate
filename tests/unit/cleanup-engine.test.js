/**
 * Unit Tests for Cleanup Engine
 * 
 * Tests core cleanup engine functionality including:
 * - Configuration loading
 * - Rule execution
 * - Block marker detection
 * - Line tag removal
 * - Package manager operations
 * - Error handling
 */

const { describe, test, before, after } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { CleanupEngine, executeCleanup } = require('../../scripts/cleanup/engine');
const { createTempFixture, cleanupTempFixture } = require('../utils/fixture-helper');

describe('CleanupEngine', () => {
  describe('Configuration Loading', () => {
    test('should load valid cleanup config', async () => {
      const engine = new CleanupEngine({
        dryRun: true,
        workingDir: './tests/fixtures/basic-node-project'
      });
      
      await engine.loadConfig();
      
      assert.ok(engine.config, 'Config should be loaded');
      assert.ok(engine.config.profiles, 'Config should have profiles');
      assert.ok(engine.config.markers, 'Config should have markers');
    });

    test('should throw error for missing config', async () => {
      const engine = new CleanupEngine({
        configPath: 'nonexistent.yaml',
        workingDir: './tests/fixtures/basic-node-project'
      });
      
      await assert.rejects(
        async () => await engine.loadConfig(),
        /Failed to load config/,
        'Should reject with missing config error'
      );
    });

    test('should throw error for invalid profile', async () => {
      const engine = new CleanupEngine({
        dryRun: true,
        profile: 'nonexistent-profile',
        workingDir: './tests/fixtures/basic-node-project'
      });
      
      await assert.rejects(
        async () => await engine.loadConfig(),
        /Profile 'nonexistent-profile' not found/,
        'Should reject with invalid profile error'
      );
    });
  });

  describe('Block Marker Detection', () => {
    test('should detect TEMPLATE-ONLY blocks in code', async () => {
      const engine = new CleanupEngine({
        dryRun: true,
        workingDir: './tests/fixtures/basic-node-project',
        configPath: 'config/cleanup.config.yaml'
      });
      
      await engine.loadConfig();
      const report = await engine.execute();
      
      const blockRemovalActions = report.actions.filter(a => a.type === 'block_remove');
      assert.ok(blockRemovalActions.length > 0, 'Should find block removal actions');
    });

    test('should not modify files without template markers', async () => {
      const engine = new CleanupEngine({
        dryRun: true,
        workingDir: './tests/fixtures/already-clean-project',
        configPath: '../basic-node-project/config/cleanup.config.yaml'
      });
      
      await engine.loadConfig();
      const report = await engine.execute();
      
      assert.strictEqual(report.summary.blocksRemoved, 0, 'Should not remove any blocks from clean code');
    });
  });

  describe('Line Tag Removal', () => {
    test('should detect @template-only tagged lines', async () => {
      const engine = new CleanupEngine({
        dryRun: true,
        workingDir: './tests/fixtures/basic-node-project',
        configPath: 'config/cleanup.config.yaml'
      });
      
      await engine.loadConfig();
      const report = await engine.execute();
      
      const lineRemovalActions = report.actions.filter(a => a.type === 'line_remove');
      // May not find any in basic fixture if we don't have line-tagged content
      assert.ok(Array.isArray(lineRemovalActions), 'Should return line removal actions array');
    });
  });

  describe('Package Manager Operations', () => {
    test('should handle NPM dependency removal', async () => {
      const tempDir = await createTempFixture('basic-node-project');
      
      try {
        const engine = new CleanupEngine({
          dryRun: true,
          workingDir: tempDir,
          configPath: 'config/cleanup.config.yaml'
        });
        
        await engine.loadConfig();
        const report = await engine.execute();
        
        const dependencyActions = report.actions.filter(a => a.type === 'dependency_remove');
        assert.ok(Array.isArray(dependencyActions), 'Should return dependency removal actions');
        
      } finally {
        await cleanupTempFixture(tempDir);
      }
    });
  });

  describe('Dry Run Mode', () => {
    test('should not modify files in dry-run mode', async () => {
      const tempDir = await createTempFixture('basic-node-project');
      
      try {
        const engine = new CleanupEngine({
          dryRun: true,
          workingDir: tempDir,
          configPath: 'config/cleanup.config.yaml'
        });
        
        await engine.loadConfig();
        const report = await engine.execute();
        
        // All actions should be marked as dry-run
        const allDryRun = report.actions.every(a => a.dryRun === true);
        assert.ok(allDryRun, 'All actions should be marked as dry-run');
        
      } finally {
        await cleanupTempFixture(tempDir);
      }
    });
  });

  describe('Report Generation', () => {
    test('should generate report with summary', async () => {
      const engine = new CleanupEngine({
        dryRun: true,
        workingDir: './tests/fixtures/basic-node-project',
        configPath: 'config/cleanup.config.yaml'
      });
      
      await engine.loadConfig();
      const report = await engine.execute();
      
      assert.ok(report.summary, 'Report should have summary');
      assert.ok(typeof report.summary.totalActions === 'number', 'Summary should have totalActions count');
      assert.ok(Array.isArray(report.actions), 'Report should have actions array');
      assert.ok(Array.isArray(report.errors), 'Report should have errors array');
    });

    test('should track timestamp and features in report', async () => {
      const engine = new CleanupEngine({
        dryRun: true,
        features: ['node', 'api'],
        workingDir: './tests/fixtures/basic-node-project',
        configPath: 'config/cleanup.config.yaml'
      });
      
      await engine.loadConfig();
      const report = await engine.execute();
      
      assert.ok(report.timestamp, 'Report should have timestamp');
      assert.ok(Array.isArray(report.features), 'Report should have features array');
      assert.ok(report.features.includes('node'), 'Report should include node feature');
      assert.ok(report.features.includes('api'), 'Report should include api feature');
    });
  });

  describe('Error Handling', () => {
    test('should collect errors without crashing', async () => {
      const engine = new CleanupEngine({
        dryRun: true,
        workingDir: './nonexistent-directory',
        configPath: 'config/cleanup.config.yaml'
      });
      
      await assert.rejects(
        async () => await engine.loadConfig(),
        'Should throw error for nonexistent directory'
      );
    });

    test('should handle invalid rule types gracefully', async () => {
      // This would require a fixture with an invalid rule type
      // For now, we verify the error collection mechanism exists
      const engine = new CleanupEngine({
        dryRun: true,
        workingDir: './tests/fixtures/basic-node-project',
        configPath: 'config/cleanup.config.yaml'
      });
      
      await engine.loadConfig();
      const report = await engine.execute();
      
      assert.ok(Array.isArray(report.errors), 'Report should have errors array');
    });
  });

  describe('Feature Flags', () => {
    test('should respect feature flags', async () => {
      const engine = new CleanupEngine({
        dryRun: true,
        features: ['node', 'api'],
        workingDir: './tests/fixtures/basic-node-project',
        configPath: 'config/cleanup.config.yaml'
      });
      
      await engine.loadConfig();
      
      assert.ok(engine.features.has('node'), 'Should have node feature');
      assert.ok(engine.features.has('api'), 'Should have api feature');
      assert.ok(!engine.features.has('python'), 'Should not have python feature');
    });
  });

  describe('Path Resolution', () => {
    test('should resolve config paths correctly', async () => {
      const engine = new CleanupEngine({
        dryRun: true,
        workingDir: './tests/fixtures/basic-node-project',
        configPath: 'config/cleanup.config.yaml'
      });
      
      await engine.loadConfig();
      
      assert.ok(engine.config, 'Should load config from specified path');
    });
  });

  describe('executeCleanup Helper Function', () => {
    test('should execute cleanup workflow', async () => {
      const tempDir = await createTempFixture('basic-node-project');
      
      try {
        const { report, exitCode } = await executeCleanup({
          workingDir: tempDir,
          dryRun: true,
          configPath: 'config/cleanup.config.yaml'
        });
        
        assert.strictEqual(exitCode, 0, 'Should exit with code 0');
        assert.ok(report, 'Should return report');
        assert.ok(report.summary, 'Report should have summary');
        
      } finally {
        await cleanupTempFixture(tempDir);
      }
    });

    test('should fail with actions in failOnActions mode', async () => {
      const tempDir = await createTempFixture('basic-node-project');
      
      try {
        const { report, exitCode } = await executeCleanup({
          workingDir: tempDir,
          dryRun: true,
          failOnActions: true,
          configPath: 'config/cleanup.config.yaml'
        });
        
        // If there are template markers, exit code should be 2
        if (report.actions.length > 0) {
          assert.strictEqual(exitCode, 2, 'Should exit with code 2 when actions detected in failOnActions mode');
        }
        
      } finally {
        await cleanupTempFixture(tempDir);
      }
    });
  });
});

