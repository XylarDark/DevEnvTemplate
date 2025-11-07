/**
 * Unit Tests for Path Resolver
 * 
 * Tests path resolution utilities including:
 * - Config path resolution (new vs old structure)
 * - Fallback logic
 * - Cross-platform path handling
 */

const { describe, test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const { resolveConfigPath } = require('../../scripts/utils/path-resolver');

describe('PathResolver', () => {
  describe('resolveConfigPath', () => {
    test('should resolve config from new structure (config/ directory)', () => {
      const workingDir = './tests/fixtures/basic-node-project';
      const configName = 'cleanup.config.yaml';
      
      const resolved = resolveConfigPath(configName, workingDir);
      
      assert.ok(resolved.includes('config'), 'Should resolve to config directory');
      assert.ok(resolved.includes('cleanup.config.yaml'), 'Should include config filename');
    });

    test('should handle absolute paths correctly', () => {
      const workingDir = path.resolve('./tests/fixtures/basic-node-project');
      const configName = 'cleanup.config.yaml';
      
      const resolved = resolveConfigPath(configName, workingDir);
      
      assert.ok(path.isAbsolute(resolved), 'Should return absolute path');
    });

    test('should handle relative paths correctly', () => {
      const workingDir = './tests/fixtures/basic-node-project';
      const configName = 'cleanup.config.yaml';
      
      const resolved = resolveConfigPath(configName, workingDir);
      
      // Should return a valid path string
      assert.ok(typeof resolved === 'string', 'Should return string path');
      assert.ok(resolved.length > 0, 'Should not be empty');
    });

    test('should prefer new config/ structure over old root structure', () => {
      const workingDir = './tests/fixtures/basic-node-project';
      const configName = 'cleanup.config.yaml';
      
      const resolved = resolveConfigPath(configName, workingDir);
      
      // New structure should have 'config' in the path
      const normalizedPath = resolved.replace(/\\/g, '/');
      assert.ok(normalizedPath.includes('/config/'), 'Should use new config/ directory structure');
    });

    test('should handle Windows paths correctly', () => {
      const workingDir = 'C:\\dev\\project';
      const configName = 'cleanup.config.yaml';
      
      const resolved = resolveConfigPath(configName, workingDir);
      
      // Should return a valid path (Windows or Unix)
      assert.ok(typeof resolved === 'string', 'Should return string path');
      assert.ok(resolved.includes('cleanup.config.yaml'), 'Should include config filename');
    });

    test('should handle Unix paths correctly', () => {
      const workingDir = '/home/user/project';
      const configName = 'cleanup.config.yaml';
      
      const resolved = resolveConfigPath(configName, workingDir);
      
      // Should return a valid path
      assert.ok(typeof resolved === 'string', 'Should return string path');
      assert.ok(resolved.includes('cleanup.config.yaml'), 'Should include config filename');
    });

    test('should handle config names with extensions', () => {
      const workingDir = './tests/fixtures/basic-node-project';
      const configName = 'cleanup.config.yaml';
      
      const resolved = resolveConfigPath(configName, workingDir);
      
      assert.ok(resolved.endsWith('.yaml'), 'Should preserve file extension');
    });

    test('should handle nested working directories', () => {
      const workingDir = './tests/fixtures/basic-node-project/src';
      const configName = 'cleanup.config.yaml';
      
      const resolved = resolveConfigPath(configName, workingDir);
      
      assert.ok(typeof resolved === 'string', 'Should return string path');
      assert.ok(resolved.includes('cleanup.config.yaml'), 'Should include config filename');
    });
  });

  describe('Path Normalization', () => {
    test('should handle forward slashes', () => {
      const workingDir = './tests/fixtures/basic-node-project';
      const configName = 'cleanup.config.yaml';
      
      const resolved = resolveConfigPath(configName, workingDir);
      
      // Should work without errors
      assert.ok(resolved, 'Should resolve path successfully');
    });

    test('should handle backslashes', () => {
      const workingDir = '.\\tests\\fixtures\\basic-node-project';
      const configName = 'cleanup.config.yaml';
      
      const resolved = resolveConfigPath(configName, workingDir);
      
      // Should work without errors
      assert.ok(resolved, 'Should resolve path successfully');
    });

    test('should handle mixed slashes', () => {
      const workingDir = './tests\\fixtures/basic-node-project';
      const configName = 'cleanup.config.yaml';
      
      const resolved = resolveConfigPath(configName, workingDir);
      
      // Should work without errors
      assert.ok(resolved, 'Should resolve path successfully');
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty config name', () => {
      const workingDir = './tests/fixtures/basic-node-project';
      const configName = '';
      
      const resolved = resolveConfigPath(configName, workingDir);
      
      // Should return a path even if config name is empty
      assert.ok(typeof resolved === 'string', 'Should return string');
    });

    test('should handle root directory', () => {
      const workingDir = '/';
      const configName = 'cleanup.config.yaml';
      
      const resolved = resolveConfigPath(configName, workingDir);
      
      assert.ok(typeof resolved === 'string', 'Should return string path');
    });

    test('should handle current directory', () => {
      const workingDir = '.';
      const configName = 'cleanup.config.yaml';
      
      const resolved = resolveConfigPath(configName, workingDir);
      
      assert.ok(typeof resolved === 'string', 'Should return string path');
    });

    test('should handle parent directory references', () => {
      const workingDir = './tests/fixtures/../fixtures/basic-node-project';
      const configName = 'cleanup.config.yaml';
      
      const resolved = resolveConfigPath(configName, workingDir);
      
      assert.ok(typeof resolved === 'string', 'Should return string path');
      assert.ok(resolved.includes('cleanup.config.yaml'), 'Should include config filename');
    });
  });
});

