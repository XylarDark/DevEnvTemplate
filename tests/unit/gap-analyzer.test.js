/**
 * Unit tests for gap analyzer
 */

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs').promises;
const path = require('path');
const GapAnalyzer = require('../../.github/tools/gap-analyzer');

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

      assert.ok(report.includes('TypeScript Not Configured'));
      assert.ok(report.includes('🔴')); // High priority
    });

    it('should detect TypeScript without config', async () => {
      const stackReport = {
        technologies: [{ name: 'TypeScript' }],
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

      assert.ok(report.includes('Missing TypeScript Configuration'));
    });

    it('should detect TypeScript without strict mode', async () => {
      const stackReport = {
        technologies: [{ name: 'TypeScript' }],
        configurations: [{ type: 'typescript', strict: false }],
        quality: { testing: false, security: false },
        ci: { present: false }
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

      assert.ok(report.includes('ESLint Not Configured'));
    });

    it('should detect missing architectural boundaries', async () => {
      const stackReport = {
        technologies: [{ name: 'ESLint' }],
        configurations: [{ type: 'eslint', configFile: '.eslintrc.json' }],
        quality: { testing: false, security: false },
        ci: { present: false }
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
        technologies: [],
        configurations: [{ type: 'nextjs' }],
        quality: { testing: false, security: false },
        ci: { present: false }
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
});

