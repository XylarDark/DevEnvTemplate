/**
 * Unit tests for gap analyzer
 */

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs').promises;
const path = require('path');
const GapAnalyzer = require('../../scripts/tools/gap-analyzer');

describe('Gap Analyzer', () => {
  const testRoot = path.join(__dirname, '..', 'fixtures', 'gap-analyzer-test');

  before(async () => {
    // Create test directory structure
    await fs.mkdir(path.join(testRoot, '.devenv'), { recursive: true });
  });

  after(async () => {
    // Cleanup test directory
    await fs.rm(testRoot, { recursive: true, force: true });
  });

  describe('TypeScript Analysis', () => {
    it('should detect missing TypeScript', async () => {
      const stackReport = {
        technologies: [{ name: 'Node.js' }],
        configurations: [],
        quality: { testing: false, security: false },
        ci: { present: false },
        profiles: ['node'],
        languageProfile: 'node'
      };

      await fs.writeFile(
        path.join(testRoot, '.devenv', 'stack-report.json'),
        JSON.stringify(stackReport)
      );

      const analyzer = new GapAnalyzer({ rootDir: testRoot });
      const report = await analyzer.analyze();

      assert.ok(report.includes('TypeScript Not Configured'));
      assert.ok(report.includes('🔴')); // High priority
    });

    it('should detect TypeScript without config', async () => {
      const stackReport = {
        technologies: [{ name: 'Node.js' }, { name: 'TypeScript' }],
        configurations: [],
        quality: { testing: false, security: false },
        ci: { present: false },
        profiles: ['node'],
        languageProfile: 'node'
      };

      await fs.writeFile(
        path.join(testRoot, '.devenv', 'stack-report.json'),
        JSON.stringify(stackReport)
      );

      const analyzer = new GapAnalyzer({ rootDir: testRoot });
      const report = await analyzer.analyze();

      assert.ok(report.includes('Missing TypeScript Configuration'));
    });

    it('should detect TypeScript without strict mode', async () => {
      const stackReport = {
        technologies: [{ name: 'Node.js' }, { name: 'TypeScript' }],
        configurations: [{ type: 'typescript', strict: false }],
        quality: { testing: false, security: false },
        ci: { present: false },
        profiles: ['node'],
        languageProfile: 'node'
      };

      await fs.writeFile(
        path.join(testRoot, '.devenv', 'stack-report.json'),
        JSON.stringify(stackReport)
      );

      const analyzer = new GapAnalyzer({ rootDir: testRoot });
      const report = await analyzer.analyze();

      assert.ok(report.includes('Strict Mode Disabled'));
      assert.ok(report.includes('🟡')); // Medium priority
    });
  });

  describe('Linting Analysis', () => {
    it('should detect missing ESLint', async () => {
      const stackReport = {
        technologies: [{ name: 'Node.js' }],
        configurations: [],
        quality: { testing: false, security: false },
        ci: { present: false },
        profiles: ['node'],
        languageProfile: 'node'
      };

      await fs.writeFile(
        path.join(testRoot, '.devenv', 'stack-report.json'),
        JSON.stringify(stackReport)
      );

      const analyzer = new GapAnalyzer({ rootDir: testRoot });
      const report = await analyzer.analyze();

      assert.ok(report.includes('ESLint Not Configured'));
    });

    it('should detect missing architectural boundaries', async () => {
      const stackReport = {
        technologies: [{ name: 'Node.js' }, { name: 'ESLint' }],
        configurations: [{ type: 'eslint', configFile: '.eslintrc.json' }],
        quality: { testing: false, security: false },
        ci: { present: false },
        profiles: ['node'],
        languageProfile: 'node'
      };

      await fs.writeFile(
        path.join(testRoot, '.devenv', 'stack-report.json'),
        JSON.stringify(stackReport)
      );

      const analyzer = new GapAnalyzer({ rootDir: testRoot });
      const report = await analyzer.analyze();

      assert.ok(report.includes('Architectural Boundaries'));
    });
  });

  describe('Testing Analysis', () => {
    it('should detect missing testing framework', async () => {
      const stackReport = {
        technologies: [],
        configurations: [],
        quality: { testing: false, security: false },
        ci: { present: false }
      };

      await fs.writeFile(
        path.join(testRoot, '.devenv', 'stack-report.json'),
        JSON.stringify(stackReport)
      );

      const analyzer = new GapAnalyzer({ rootDir: testRoot });
      const report = await analyzer.analyze();

      assert.ok(report.includes('No Testing Framework Detected'));
    });

    it('should detect missing E2E testing for UI projects', async () => {
      const stackReport = {
        technologies: [{ name: 'React' }],
        configurations: [],
        quality: { testing: true, security: false },
        ci: { present: false }
      };

      await fs.writeFile(
        path.join(testRoot, '.devenv', 'stack-report.json'),
        JSON.stringify(stackReport)
      );

      const analyzer = new GapAnalyzer({ rootDir: testRoot });
      const report = await analyzer.analyze();

      assert.ok(report.includes('End-to-End Testing'));
    });
  });

  describe('Security Analysis', () => {
    it('should detect missing security measures', async () => {
      const stackReport = {
        technologies: [],
        configurations: [],
        quality: { testing: false, security: false },
        ci: { present: false }
      };

      await fs.writeFile(
        path.join(testRoot, '.devenv', 'stack-report.json'),
        JSON.stringify(stackReport)
      );

      const analyzer = new GapAnalyzer({ rootDir: testRoot });
      const report = await analyzer.analyze();

      assert.ok(report.includes('Security Measures Not Detected'));
    });

    it('should detect missing CSP for Next.js projects', async () => {
      const stackReport = {
        technologies: [{ name: 'Node.js' }, { name: 'Next.js' }],
        configurations: [{ type: 'nextjs' }],
        quality: { testing: false, security: false },
        ci: { present: false },
        profiles: ['node'],
        languageProfile: 'node'
      };

      await fs.writeFile(
        path.join(testRoot, '.devenv', 'stack-report.json'),
        JSON.stringify(stackReport)
      );

      const analyzer = new GapAnalyzer({ rootDir: testRoot });
      const report = await analyzer.analyze();

      assert.ok(report.includes('CSP Headers'));
    });
  });

  describe('Python-specific guidance', () => {
    const pythonStack = {
      technologies: [{ name: 'Python' }, { name: 'Ruff' }],
      configurations: [],
      quality: { testing: true, security: false, linting: true },
      ci: { present: true, type: 'github-actions' },
      profiles: ['python'],
      languageProfile: 'python'
    };

    async function writeStack(stack) {
      await fs.writeFile(
        path.join(testRoot, '.devenv', 'stack-report.json'),
        JSON.stringify(stack)
      );
    }

    async function resetRoot() {
      await fs.rm(testRoot, { recursive: true, force: true });
      await fs.mkdir(path.join(testRoot, '.devenv'), { recursive: true });
    }

    it('flags non-standard env templates instead of missing file', async () => {
      await resetRoot();
      await writeStack(pythonStack);
      await fs.writeFile(path.join(testRoot, 'env-example.txt'), 'SIMULATION_GRAVITY=-1.62\n');

      const analyzer = new GapAnalyzer({ rootDir: testRoot });
      const report = await analyzer.analyze();

      assert.ok(report.includes('Environment Template Uses Non-Standard Name'));
      assert.ok(!report.includes('Missing .env.example File'));
    });

    it('recommends pre-commit hooks for python stacks', async () => {
      await resetRoot();
      await writeStack(pythonStack);

      const analyzer = new GapAnalyzer({ rootDir: testRoot });
      const report = await analyzer.analyze();

      assert.ok(report.includes('Pre-commit Hooks Not Configured'));
      assert.ok(!report.includes('Husky'));
    });

    it('uses experiment/run-tracking guidance for python stacks', async () => {
      await resetRoot();
      await writeStack(pythonStack);

      const analyzer = new GapAnalyzer({ rootDir: testRoot });
      const report = await analyzer.analyze();

      assert.ok(report.includes('Experiment Budgets Not Defined'));
      assert.ok(report.includes('Run Tracking Not Configured'));
      assert.ok(!report.includes('Quality Budgets Not Configured'));
    });
  });

  describe('CI/CD Analysis', () => {
    it('should detect missing CI pipeline', async () => {
      const stackReport = {
        technologies: [],
        configurations: [],
        quality: { testing: false, security: false },
        ci: { present: false }
      };

      await fs.writeFile(
        path.join(testRoot, '.devenv', 'stack-report.json'),
        JSON.stringify(stackReport)
      );

      const analyzer = new GapAnalyzer({ rootDir: testRoot });
      const report = await analyzer.analyze();

      assert.ok(report.includes('No CI/CD Pipeline Detected'));
    });

    it('should detect missing quality gates in CI', async () => {
      const stackReport = {
        technologies: [],
        configurations: [],
        quality: { testing: false, security: false },
        ci: { present: true, type: 'github-actions' }
      };

      await fs.writeFile(
        path.join(testRoot, '.devenv', 'stack-report.json'),
        JSON.stringify(stackReport)
      );

      const analyzer = new GapAnalyzer({ rootDir: testRoot });
      const report = await analyzer.analyze();

      assert.ok(report.includes('Quality Gates'));
    });
  });

  describe('Documentation Analysis', () => {
    it('should detect missing README', async () => {
      const stackReport = {
        technologies: [],
        configurations: [],
        quality: { testing: false, security: false },
        ci: { present: false }
      };

      await fs.writeFile(
        path.join(testRoot, '.devenv', 'stack-report.json'),
        JSON.stringify(stackReport)
      );

      const analyzer = new GapAnalyzer({ rootDir: testRoot });
      const report = await analyzer.analyze();

      assert.ok(report.includes('README.md Not Found'));
    });

    it('should detect incomplete README', async () => {
      const stackReport = {
        technologies: [],
        configurations: [],
        quality: { testing: false, security: false },
        ci: { present: false }
      };

      await fs.writeFile(
        path.join(testRoot, '.devenv', 'stack-report.json'),
        JSON.stringify(stackReport)
      );

      // Create minimal README
      await fs.writeFile(path.join(testRoot, 'README.md'), '# Test Project\n');

      const analyzer = new GapAnalyzer({ rootDir: testRoot });
      const report = await analyzer.analyze();

      assert.ok(report.includes('Incomplete README Documentation'));
    });
  });

  describe('Environment Analysis', () => {
    it('should detect missing .env.example', async () => {
      const stackReport = {
        technologies: [{ name: 'Node.js' }],
        configurations: [],
        quality: { testing: false, security: false },
        ci: { present: false }
      };

      await fs.writeFile(
        path.join(testRoot, '.devenv', 'stack-report.json'),
        JSON.stringify(stackReport)
      );

      const analyzer = new GapAnalyzer({ rootDir: testRoot });
      const report = await analyzer.analyze();

      assert.ok(report.includes('.env.example'));
    });

    it('should detect .env not in .gitignore', async () => {
      const stackReport = {
        technologies: [{ name: 'Node.js' }],
        configurations: [],
        quality: { testing: false, security: false },
        ci: { present: false }
      };

      await fs.writeFile(
        path.join(testRoot, '.devenv', 'stack-report.json'),
        JSON.stringify(stackReport)
      );

      // Create .gitignore without .env
      await fs.writeFile(path.join(testRoot, '.gitignore'), 'node_modules\n');

      const analyzer = new GapAnalyzer({ rootDir: testRoot });
      const report = await analyzer.analyze();

      assert.ok(report.includes('.env Not in .gitignore'));
    });
  });

  describe('Report Generation', () => {
    it('should generate proper markdown report', async () => {
      const stackReport = {
        technologies: [],
        configurations: [],
        quality: { testing: false, security: false },
        ci: { present: false }
      };

      await fs.writeFile(
        path.join(testRoot, '.devenv', 'stack-report.json'),
        JSON.stringify(stackReport)
      );

      const analyzer = new GapAnalyzer({ rootDir: testRoot });
      const report = await analyzer.analyze();

      assert.ok(report.includes('# DevEnvTemplate Gap Analysis Report'));
      assert.ok(report.includes('## Summary'));
      assert.ok(report.includes('## Next Steps'));
      assert.ok(report.includes('Total gaps found'));
    });

    it('should sort gaps by severity', async () => {
      const stackReport = {
        technologies: [],
        configurations: [],
        quality: { testing: false, security: false },
        ci: { present: false }
      };

      await fs.writeFile(
        path.join(testRoot, '.devenv', 'stack-report.json'),
        JSON.stringify(stackReport)
      );

      const analyzer = new GapAnalyzer({ rootDir: testRoot });
      const report = await analyzer.analyze();

      const highIndex = report.indexOf('🔴');
      const mediumIndex = report.indexOf('🟡');
      const lowIndex = report.indexOf('🟢');

      assert.ok(highIndex < mediumIndex && mediumIndex < lowIndex);
    });

    it('should save report to file', async () => {
      const stackReport = {
        technologies: [],
        configurations: [],
        quality: { testing: false, security: false },
        ci: { present: false }
      };

      await fs.writeFile(
        path.join(testRoot, '.devenv', 'stack-report.json'),
        JSON.stringify(stackReport)
      );

      const analyzer = new GapAnalyzer({ rootDir: testRoot });
      const report = await analyzer.analyze();
      await analyzer.saveReport(report);

      const savedReport = await fs.readFile(
        path.join(testRoot, '.devenv', 'gaps-report.md'),
        'utf8'
      );

      assert.strictEqual(savedReport, report);
    });
  });

  describe('Language-aware recommendations', () => {
    it('should skip TypeScript/ESLint gaps for python-only stacks', async () => {
      const stackReport = {
        technologies: [{ name: 'Python' }, { name: 'Mypy' }],
        configurations: [],
        quality: { testing: true, security: false, linting: false },
        ci: { present: true, type: 'github-actions' },
        profiles: ['python'],
        primaryProfile: 'python',
        languageProfile: 'python',
        manifest: {
          technologies: ['python', 'pytorch', 'numpy'],
          packageManager: 'pip'
        }
      };

      await fs.writeFile(
        path.join(testRoot, '.devenv', 'stack-report.json'),
        JSON.stringify(stackReport)
      );

      const analyzer = new GapAnalyzer({ rootDir: testRoot });
      const report = await analyzer.analyze();

      assert.ok(!report.includes('TypeScript Not Configured'), 'should skip TS gap');
      assert.ok(!report.includes('ESLint Not Configured'), 'should skip ESLint gap');
      assert.ok(
        report.includes('Secrets Handling Not Detected'),
        'should include python security guidance'
      );
    });
  });

  describe('Secrets gap heuristics', () => {
    it('should skip secrets gap when python metadata is complete', async () => {
      const stackReport = {
        technologies: [{ name: 'Python' }],
        configurations: [],
        quality: { testing: true, security: true, linting: true },
        ci: { present: true, type: 'github-actions' },
        profiles: ['python'],
        languageProfile: 'python',
        secrets: {
          envTemplate: { present: true, files: ['.env.example'] },
          envIgnored: true,
          envLoader: { present: true, tools: ['python-dotenv'] },
          dependencyAudit: { present: true, tools: ['pip-audit', 'bandit'] }
        }
      };

      await fs.writeFile(
        path.join(testRoot, '.devenv', 'stack-report.json'),
        JSON.stringify(stackReport)
      );

      const analyzer = new GapAnalyzer({ rootDir: testRoot });
      const report = await analyzer.analyze();

      assert.ok(
        !report.includes('Secrets Handling Not Detected'),
        'complete python metadata should prevent secrets gap'
      );
    });

    it('should report missing node audit steps as secrets guidance', async () => {
      const stackReport = {
        technologies: [{ name: 'Node.js' }],
        configurations: [],
        quality: { testing: true, security: false, linting: true },
        ci: { present: true, type: 'github-actions' },
        profiles: ['node'],
        languageProfile: 'node',
        secrets: {
          envTemplate: { present: true, files: ['.env.example'] },
          envIgnored: true,
          envLoader: { present: true, tools: ['dotenv'] },
          dependencyAudit: { present: false, tools: [] }
        }
      };

      await fs.writeFile(
        path.join(testRoot, '.devenv', 'stack-report.json'),
        JSON.stringify(stackReport)
      );

      const analyzer = new GapAnalyzer({ rootDir: testRoot });
      const report = await analyzer.analyze();

      assert.ok(
        report.includes('Missing secrets hygiene signals: dependency audit step in CI'),
        'node projects missing audit steps should get actionable message'
      );
    });
  });
});

