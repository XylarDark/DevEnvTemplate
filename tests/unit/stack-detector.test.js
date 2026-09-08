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
const path = require('node:path');
const StackDetector = require('../../dist/scripts/tools/stack-detector');

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

      assert.strictEqual(
        detector.stack.technologies.length,
        0,
        'Should start with empty technologies'
      );
      assert.strictEqual(
        detector.stack.configurations.length,
        0,
        'Should start with empty configurations'
      );
    });
  });

  describe('Detection Methods', () => {
    test('should have detect method', () => {
      const detector = new StackDetector();

      assert.ok(typeof detector.detect === 'function', 'Should have detect method');
    });

    test('should have detectPackageJson method', () => {
      const detector = new StackDetector();

      assert.ok(
        typeof detector.detectPackageJson === 'function',
        'Should have detectPackageJson method'
      );
    });

    test('should have detectTypeScript method', () => {
      const detector = new StackDetector();

      assert.ok(
        typeof detector.detectTypeScript === 'function',
        'Should have detectTypeScript method'
      );
    });

    test('should have detectFrameworks method', () => {
      const detector = new StackDetector();

      assert.ok(
        typeof detector.detectFrameworks === 'function',
        'Should have detectFrameworks method'
      );
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
      assert.strictEqual(
        typeof detector.stack.quality.linting,
        'boolean',
        'Should have linting boolean'
      );
      assert.strictEqual(
        typeof detector.stack.quality.testing,
        'boolean',
        'Should have testing boolean'
      );
      assert.strictEqual(
        typeof detector.stack.quality.typescript,
        'boolean',
        'Should have typescript boolean'
      );
    });

    test('should have ci object in stack', () => {
      const detector = new StackDetector();

      assert.ok(detector.stack.ci, 'Should have ci object');
      assert.strictEqual(
        typeof detector.stack.ci.present,
        'boolean',
        'Should have present boolean'
      );
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
        source: 'package.json',
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
        target: 'ES2020',
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
        confidence: 'high',
      });

      assert.strictEqual(
        detector.stack.technologies[0].confidence,
        'high',
        'Should have high confidence'
      );
    });

    test('should support medium confidence level', () => {
      const detector = new StackDetector();

      detector.stack.technologies.push({
        name: 'Test Tech',
        confidence: 'medium',
      });

      assert.strictEqual(
        detector.stack.technologies[0].confidence,
        'medium',
        'Should have medium confidence'
      );
    });

    test('should support low confidence level', () => {
      const detector = new StackDetector();

      detector.stack.technologies.push({
        name: 'Test Tech',
        confidence: 'low',
      });

      assert.strictEqual(
        detector.stack.technologies[0].confidence,
        'low',
        'Should have low confidence'
      );
    });
  });

  describe('Language profile detection', () => {
    test('should derive python-only profile from manifest and pyproject', async () => {
      const fixtureDir = path.join(__dirname, '..', 'fixtures', 'python-sim-project');
      const detector = new StackDetector({ rootDir: fixtureDir, quiet: true });

      const stack = await detector.detect();

      assert.strictEqual(stack.languageProfile, 'python');
      assert.ok(stack.profiles.includes('python'), 'should include python profile');
      assert.ok(!stack.profiles.includes('node'), 'should not include node profile');
      assert.ok(
        stack.technologies.some(tech => tech.name === 'Mypy'),
        'should detect mypy from pyproject'
      );
    });
  });

  describe('Secrets hygiene detection', () => {
    test('should capture env hygiene signals for python simulation project', async () => {
      const fixtureDir = path.join(__dirname, '..', 'fixtures', 'python-sim-project');
      const detector = new StackDetector({ rootDir: fixtureDir, quiet: true });

      const stack = await detector.detect();

      assert.ok(stack.secrets, 'secrets metadata should exist');
      assert.ok(stack.secrets.envTemplate.present, 'env template should be detected');
      assert.ok(
        stack.secrets.envTemplate.files.includes('.env.example'),
        'should record .env.example'
      );
      assert.ok(stack.secrets.envIgnored, '.env should be ignored via gitignore');
      assert.ok(
        stack.secrets.envLoader.tools.includes('python-dotenv'),
        'python-dotenv should be detected as env loader'
      );
      assert.ok(
        stack.secrets.dependencyAudit.tools.includes('pip-audit'),
        'pip-audit should be detected from workflows'
      );
      assert.ok(
        stack.secrets.dependencyAudit.tools.includes('bandit'),
        'bandit should be detected from workflows'
      );
    });

    test('should capture env hygiene signals for node project', async () => {
      const fixtureDir = path.join(__dirname, '..', 'fixtures', 'node-secrets-project');
      const detector = new StackDetector({ rootDir: fixtureDir, quiet: true });

      const stack = await detector.detect();

      assert.ok(stack.secrets.envTemplate.present, 'node env template should be detected');
      assert.ok(stack.secrets.envTemplate.files.includes('.env.example'));
      assert.ok(stack.secrets.envIgnored, 'node project should ignore .env');
      assert.ok(
        stack.secrets.envLoader.tools.includes('dotenv'),
        'dotenv dependency should be recorded as env loader'
      );
      assert.ok(
        stack.secrets.dependencyAudit.tools.includes('npm audit'),
        'npm audit should be detected in workflows'
      );
    });
  });

  describe('Unity detection', () => {
    test('should detect Unity when ProjectVersion.txt is under game/', async () => {
      const fs = require('fs').promises;
      const os = require('os');
      const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'unity-detect-'));
      try {
        await fs.mkdir(path.join(tmp, 'game', 'ProjectSettings'), { recursive: true });
        await fs.writeFile(
          path.join(tmp, 'game', 'ProjectSettings', 'ProjectVersion.txt'),
          'm_EditorVersion: 6000.5.8f1\n'
        );

        const detector = new StackDetector({ rootDir: tmp, quiet: true });
        const stack = await detector.detect();

        assert.strictEqual(stack.unityProjectDetected, true);
        assert.ok(stack.technologies.some(t => t.name === 'Unity'));
      } finally {
        await fs.rm(tmp, { recursive: true, force: true });
      }
    });

    test('should not detect Unity without ProjectVersion.txt', async () => {
      const fs = require('fs').promises;
      const os = require('os');
      const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'no-unity-'));
      try {
        const detector = new StackDetector({ rootDir: tmp, quiet: true });
        const stack = await detector.detect();
        assert.notStrictEqual(stack.unityProjectDetected, true);
      } finally {
        await fs.rm(tmp, { recursive: true, force: true });
      }
    });
  });

  describe('Node built-in test runner detection', () => {
    const fs = require('fs').promises;
    const os = require('os');

    async function detectWithTestScript(testScript) {
      const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'node-runner-'));
      try {
        await fs.writeFile(
          path.join(tmp, 'package.json'),
          JSON.stringify({ name: 'fixture', scripts: { test: testScript } }, null, 2)
        );
        const detector = new StackDetector({ rootDir: tmp, quiet: true });
        return await detector.detect();
      } finally {
        await fs.rm(tmp, { recursive: true, force: true });
      }
    }

    test('should register the Node test runner from a "node --test" script', async () => {
      const stack = await detectWithTestScript('node --test tests/**/*.test.js');

      assert.ok(
        stack.tooling.testing.frameworks.some(f => f.name === 'Node test runner'),
        'Node test runner should be detected as a testing framework'
      );
      assert.strictEqual(stack.quality.testing, true);
    });

    test('should register the Node test runner when the script builds first', async () => {
      const stack = await detectWithTestScript('npm run build && node --test tests/**/*.test.js');

      assert.ok(stack.tooling.testing.frameworks.some(f => f.name === 'Node test runner'));
    });

    test('should not register a runner for a script that only mentions node', async () => {
      const stack = await detectWithTestScript('node scripts/verify.js');

      assert.ok(!stack.tooling.testing.frameworks.some(f => f.name === 'Node test runner'));
    });
  });
});
