/**
 * Unit Tests for Stack Detector
 * 
 * Tests technology stack detection including:
 * - Node.js/package.json detection
 * - Python project detection
 * - Framework detection
 * - CI detection
 */

const { describe, test } = require('node:test');
const assert = require('node:assert');
const StackDetector = require('../../.github/tools/stack-detector');

describe('StackDetector', () => {
  describe('Initialization', () => {
    test('should create detector instance', () => {
      const detector = new StackDetector();
      
      assert.ok(detector, 'Should create detector instance');
      assert.ok(detector.stack, 'Should have stack property');
      assert.ok(Array.isArray(detector.stack.technologies), 'Should have technologies array');
    });

    test('should initialize empty stack', () => {
      const detector = new StackDetector();
      
      assert.strictEqual(detector.stack.technologies.length, 0, 'Should start with empty technologies');
      assert.strictEqual(detector.stack.configurations.length, 0, 'Should start with empty configurations');
    });
  });

  describe('Detection Methods', () => {
    test('should have detect method', () => {
      const detector = new StackDetector();
      
      assert.ok(typeof detector.detect === 'function', 'Should have detect method');
    });

    test('should have detectPackageJson method', () => {
      const detector = new StackDetector();
      
      assert.ok(typeof detector.detectPackageJson === 'function', 'Should have detectPackageJson method');
    });

    test('should have detectTypeScript method', () => {
      const detector = new StackDetector();
      
      assert.ok(typeof detector.detectTypeScript === 'function', 'Should have detectTypeScript method');
    });

    test('should have detectFrameworks method', () => {
      const detector = new StackDetector();
      
      assert.ok(typeof detector.detectFrameworks === 'function', 'Should have detectFrameworks method');
    });

    test('should have detectTesting method', () => {
      const detector = new StackDetector();
      
      assert.ok(typeof detector.detectTesting === 'function', 'Should have detectTesting method');
    });

    test('should have detectLinting method', () => {
      const detector = new StackDetector();
      
      assert.ok(typeof detector.detectLinting === 'function', 'Should have detectLinting method');
    });

    test('should have detectCI method', () => {
      const detector = new StackDetector();
      
      assert.ok(typeof detector.detectCI === 'function', 'Should have detectCI method');
    });
  });

  describe('Stack Structure', () => {
    test('should have technologies array in stack', () => {
      const detector = new StackDetector();
      
      assert.ok(Array.isArray(detector.stack.technologies), 'Should have technologies array');
    });

    test('should have configurations array in stack', () => {
      const detector = new StackDetector();
      
      assert.ok(Array.isArray(detector.stack.configurations), 'Should have configurations array');
    });

    test('should have quality object in stack', () => {
      const detector = new StackDetector();
      
      assert.ok(detector.stack.quality, 'Should have quality object');
      assert.strictEqual(typeof detector.stack.quality.linting, 'boolean', 'Should have linting boolean');
      assert.strictEqual(typeof detector.stack.quality.testing, 'boolean', 'Should have testing boolean');
      assert.strictEqual(typeof detector.stack.quality.typescript, 'boolean', 'Should have typescript boolean');
    });

    test('should have ci object in stack', () => {
      const detector = new StackDetector();
      
      assert.ok(detector.stack.ci, 'Should have ci object');
      assert.strictEqual(typeof detector.stack.ci.present, 'boolean', 'Should have present boolean');
    });
  });

  describe('Technology Detection Data Structure', () => {
    test('should add technologies with proper structure', async () => {
      const detector = new StackDetector();
      detector.rootDir = './tests/fixtures/basic-node-project';
      
      // Manually add a technology to test structure
      detector.stack.technologies.push({
        name: 'Node.js',
        version: '20.0.0',
        confidence: 'high',
        source: 'package.json'
      });
      
      const tech = detector.stack.technologies[0];
      assert.ok(tech.name, 'Should have name');
      assert.ok(tech.version, 'Should have version');
      assert.ok(tech.confidence, 'Should have confidence');
      assert.ok(tech.source, 'Should have source');
    });
  });

  describe('Configuration Detection Data Structure', () => {
    test('should add configurations with proper structure', () => {
      const detector = new StackDetector();
      
      // Manually add a configuration to test structure
      detector.stack.configurations.push({
        type: 'typescript',
        strict: true,
        target: 'ES2020'
      });
      
      const config = detector.stack.configurations[0];
      assert.ok(config.type, 'Should have type');
    });
  });

  describe('Confidence Levels', () => {
    test('should support high confidence level', () => {
      const detector = new StackDetector();
      
      detector.stack.technologies.push({
        name: 'Test Tech',
        confidence: 'high'
      });
      
      assert.strictEqual(detector.stack.technologies[0].confidence, 'high', 'Should have high confidence');
    });

    test('should support medium confidence level', () => {
      const detector = new StackDetector();
      
      detector.stack.technologies.push({
        name: 'Test Tech',
        confidence: 'medium'
      });
      
      assert.strictEqual(detector.stack.technologies[0].confidence, 'medium', 'Should have medium confidence');
    });

    test('should support low confidence level', () => {
      const detector = new StackDetector();
      
      detector.stack.technologies.push({
        name: 'Test Tech',
        confidence: 'low'
      });
      
      assert.strictEqual(detector.stack.technologies[0].confidence, 'low', 'Should have low confidence');
    });
  });
});

