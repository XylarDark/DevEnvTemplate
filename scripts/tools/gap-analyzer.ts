#!/usr/bin/env node

/**
 * Gap Analyzer - CI-only utility
 *
 * Analyzes detected stack against DevEnvTemplate standards
 * and generates recommendations for improvement.
 * 
 * Enhanced with comprehensive checks for documentation, dependencies,
 * performance, accessibility, Docker, environment variables, and git hooks.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { createLogger } from '../../scripts/utils/logger';
import type { Gap, StackReport, GapReport, GapAnalysisOptions } from '../types/gaps';

const logger = createLogger({ context: 'gap-analyzer' });
const cliArgs = process.argv.slice(2);
const debugFlag = cliArgs.includes('--debug');
if (debugFlag && !process.env.LOG_LEVEL) {
  process.env.LOG_LEVEL = 'DEBUG';
}
let parsedMode: 'fast' | 'full' | undefined;
const inlineModeArg = cliArgs.find(arg => arg.startsWith('--mode='));
if (inlineModeArg) {
  const value = inlineModeArg.split('=')[1];
  if (value === 'fast' || value === 'full') {
    parsedMode = value;
  }
}
if (!parsedMode) {
  const modeIndex = cliArgs.indexOf('--mode');
  if (modeIndex !== -1 && (cliArgs[modeIndex + 1] === 'fast' || cliArgs[modeIndex + 1] === 'full')) {
    parsedMode = cliArgs[modeIndex + 1] as 'fast' | 'full';
  }
}
if (!parsedMode && (cliArgs.includes('--fast') || cliArgs.includes('--shallow'))) {
  parsedMode = 'fast';
}
if (!parsedMode && cliArgs.includes('--full')) {
  parsedMode = 'full';
}
const analyzerMode: 'fast' | 'full' = parsedMode === 'fast' ? 'fast' : 'full';
const NODE_TECH_HINTS = ['node.js', 'node', 'react', 'next.js', 'nextjs', 'vite', 'express', 'typescript', 'javascript', 'svelte'];
const PYTHON_TECH_HINTS = ['python', 'fastapi', 'django', 'flask', 'pytest', 'black', 'ruff', 'mypy', 'pytorch', 'pychrono', 'numpy', 'scipy', 'pandas'];
const NODE_PACKAGE_MANAGERS = ['npm', 'pnpm', 'yarn', 'bun'];
const PYTHON_PACKAGE_MANAGERS = ['pip', 'pipenv', 'poetry', 'uv'];
const ENV_SAMPLE_FILES = ['.env.example', '.env.sample', 'env.example', 'env.sample', 'env-example.txt', 'env-example.env'];

class GapAnalyzer {
  private rootDir: string;
  private stack: StackReport | null = null;
  private gaps: Gap[] = [];
  private profiles: Set<string> = new Set();
  private languageProfile: string = 'agnostic';
  private mode: 'fast' | 'full';
  private debug: boolean;

  constructor(options: GapAnalysisOptions = {}) {
    this.rootDir = options.rootDir || process.cwd();
    this.mode = options.mode || analyzerMode;
    this.debug = !!options.debug;
  }

  async analyze(): Promise<string> {
    logger.info('Starting gap analysis against DevEnvTemplate standards');

    // Load stack report
    try {
      const stackReportPath = path.join(this.rootDir, '.devenv', 'stack-report.json');
      const content = await fs.readFile(stackReportPath, 'utf8');
      this.stack = JSON.parse(content) as StackReport;
      const inferredProfiles = Array.isArray(this.stack.profiles) && this.stack.profiles.length > 0
        ? this.stack.profiles
        : this.detectProfilesFromStack();
      this.profiles = new Set(inferredProfiles);
      this.applyManifestProfiles();
      const stackLanguageProfile = (this.stack as any).languageProfile;
      if (typeof stackLanguageProfile === 'string' && stackLanguageProfile.length > 0) {
        this.languageProfile = stackLanguageProfile;
        this.syncProfilesWithLanguageProfile();
      } else {
        this.languageProfile = this.computeLanguageProfile();
      }
      logger.info('Stack report loaded successfully');
      this.logDebug('Stack report loaded', {
        profiles: Array.from(this.profiles),
        languageProfile: this.languageProfile
      });
    } catch (error) {
      logger.error('Stack report not found. Run stack-detector first.');
      throw new Error('Stack report not found. Run stack-detector first.');
    }

    if (this.isFastMode()) {
      logger.info('Fast mode enabled: skipping documentation, accessibility, Docker, and git-hook checks.');
    }

    await this.runStage('TypeScript', () => this.analyzeTypeScript());
    await this.runStage('Linting', () => this.analyzeLinting());
    await this.runStage('Testing', () => this.analyzeTesting());
    await this.runStage('Security', () => this.analyzeSecurity());
    await this.runStage('CI/CD', () => this.analyzeCI());
    await this.runStage('Boundaries', () => this.analyzeBoundaries());
    await this.runStage('Quality Gates', () => this.analyzeQualityGates());
    
    if (this.isFastMode()) {
      await this.runStage('Dependencies', () => this.analyzeDependencies());
      this.gaps.push({
        category: 'documentation',
        severity: 'low',
        title: 'Fast doctor run (partial coverage)',
        description: 'Fast mode skips documentation, accessibility, Docker, environment, and git-hook checks.',
        impact: 'Some gaps only appear in full scans.',
        recommendation: 'Re-run `npm run doctor --full` before releases for complete coverage.',
        effort: 'low',
        files: []
      });
      this.logDebug('Inserted fast-mode diagnostics gap');
    } else {
      await this.runStage('Documentation', () => this.analyzeDocumentation());
      await this.runStage('Dependencies', () => this.analyzeDependencies());
      await this.runStage('Performance', () => this.analyzePerformance());
      await this.runStage('Accessibility', () => this.analyzeAccessibility());
      await this.runStage('Docker', () => this.analyzeDocker());
      await this.runStage('Environment', () => this.analyzeEnvironment());
      await this.runStage('Git Hooks', () => this.analyzeGitHooks());
      await this.runStage('Frameworks', () => this.analyzeFrameworks());
      await this.runStage('Python Tooling', () => this.analyzePythonTooling());
    }

    logger.info(`Gap analysis complete. Found ${this.gaps.length} gaps`);
    this.logDebug('Gap analysis finished', { gaps: this.gaps.length, mode: this.mode });
    return this.generateReport();
  }

  private isFastMode(): boolean {
    return this.mode === 'fast';
  }

  private analyzeTypeScript(): void {
    if (!this.hasProfile('node')) {
      return;
    }
    const hasTypeScript = this.stack!.technologies.some(t => t.name === 'TypeScript');
    const hasTSConfig = this.stack!.configurations.some(c => c.type === 'typescript');

    if (!hasTypeScript) {
      this.gaps.push({
        category: 'typescript',
        severity: 'high',
        title: 'TypeScript Not Configured',
        description: 'TypeScript provides compile-time type checking and better IDE support.',
        impact: 'Reduces code quality and developer experience',
        recommendation: 'Add TypeScript dependency and tsconfig.json with strict settings',
        effort: 'medium',
        files: ['package.json', 'tsconfig.json'],
        resources: ['https://www.typescriptlang.org/docs/handbook/tsconfig-json.html']
      });
    } else if (!hasTSConfig) {
      this.gaps.push({
        category: 'typescript',
        severity: 'high',
        title: 'Missing TypeScript Configuration',
        description: 'TypeScript is installed but not properly configured.',
        impact: 'Type checking may not work correctly',
        recommendation: 'Create tsconfig.json with strict: true and proper compiler options',
        effort: 'low',
        files: ['tsconfig.json'],
        codeSnippet: `{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}`
      });
    } else {
      const tsConfig = this.stack!.configurations.find(c => c.type === 'typescript');
      if (!tsConfig?.strict) {
        this.gaps.push({
          category: 'typescript',
          severity: 'medium',
          title: 'TypeScript Strict Mode Disabled',
          description: 'Strict mode provides better type safety but may require more explicit typing.',
          impact: 'Potential runtime errors from type issues',
          recommendation: 'Enable "strict": true in tsconfig.json',
          effort: 'medium',
          files: ['tsconfig.json']
        });
      }
    }
  }

  private analyzeLinting(): void {
    if (this.hasProfile('node')) {
      const hasESLint = this.stack!.technologies.some(t => t.name === 'ESLint');
      const hasESLintConfig = this.stack!.configurations.some(c => c.type === 'eslint');

      if (!hasESLint) {
        this.gaps.push({
          category: 'linting',
          severity: 'high',
          title: 'ESLint Not Configured',
          description: 'ESLint enforces consistent code style and catches potential issues.',
          impact: 'Inconsistent code quality and potential bugs',
          recommendation: 'Adopt ESLint with the official flat config and plugin:boundaries for architecture checks',
          effort: 'low',
          files: ['package.json', 'eslint.config.js']
        });
      } else if (!hasESLintConfig) {
        this.gaps.push({
          category: 'linting',
          severity: 'high',
          title: 'Missing ESLint Configuration',
          description: 'ESLint is installed but not configured.',
          impact: 'Linting rules not enforced',
          recommendation: 'Create eslint.config.js with TypeScript + accessibility presets',
          effort: 'low',
          files: ['eslint.config.js']
        });
      }

      if (hasESLint && !this.stack!.configurations.some(c => c.configFile?.includes('boundaries'))) {
        this.gaps.push({
          category: 'linting',
          severity: 'medium',
          title: 'Missing Architectural Boundaries',
          description: 'eslint-plugin-boundaries enforces clean architecture layer separation.',
          impact: 'Code organization may become unstructured',
          recommendation: 'Extend eslint-plugin-boundaries with feature/domain layer rules',
          effort: 'medium',
          files: ['package.json', 'eslint.config.js']
        });
      }
    }

    if (this.hasProfile('python')) {
      this.analyzePythonLinting();
    }
  }

  private analyzePythonLinting(): void {
    const hasRuff = this.hasTechnology('Ruff');
    if (!hasRuff) {
      this.gaps.push({
        category: 'linting',
        severity: 'medium',
        title: 'Ruff Linter Not Configured',
        description: 'Ruff is the recommended Python linter because it is fast and bundles common Flake8 rules.',
        impact: 'Inconsistent style and missed Python-specific issues',
        recommendation: 'Add Ruff via pyproject.toml and run it in CI: `ruff check .`',
        effort: 'low',
        files: ['pyproject.toml', 'ruff.toml'],
        resources: ['https://docs.astral.sh/ruff/']
      });
    }
  }

  private analyzeTesting(): void {
    const handledProfiles: string[] = [];
    if (this.hasProfile('node')) {
      this.analyzeNodeTesting();
      handledProfiles.push('node');
    }
    if (this.hasProfile('python')) {
      this.analyzePythonTesting();
      handledProfiles.push('python');
    }

    if (handledProfiles.length === 0 && !this.stack!.quality.testing) {
      this.gaps.push({
        category: 'testing',
        severity: 'high',
        title: 'No Testing Framework Detected',
        description: 'Automated tests are essential for code reliability and refactoring safety.',
        impact: 'Cannot safely refactor code or catch regressions',
        recommendation: 'Add a minimal test harness (e.g., pytest, Vitest) and run it in CI',
        effort: 'medium',
        files: ['tests/']
      });
    }
  }

  private analyzeNodeTesting(): void {
    const hasJest = this.hasTestingFramework('Jest');
    const hasVitest = this.hasTestingFramework('Vitest');

    if (!hasJest && !hasVitest) {
      this.gaps.push({
        category: 'testing',
        severity: 'high',
        title: 'No JS Unit Tests Detected',
        description: 'Vitest (or Jest) should cover components and utilities.',
        impact: 'Refactors may break behavior silently',
        recommendation: 'Add Vitest with a watch mode and run `vitest run --coverage` in CI',
        effort: 'medium',
        files: ['package.json', 'vitest.config.ts']
      });
    }

    const hasPlaywright = this.hasTestingFramework('Playwright');
    const isUIProject = this.stack!.technologies.some(t => ['React', 'Next.js', 'Vue'].includes(t.name));

    if (!hasPlaywright && isUIProject) {
      this.gaps.push({
        category: 'testing',
        severity: 'medium',
        title: 'Missing End-to-End Testing',
        description: 'Playwright validates core user flows end-to-end.',
        impact: 'Cannot verify complete application functionality',
        recommendation: 'Add a Playwright smoke suite (login + critical flows) and run nightly',
        effort: 'medium',
        files: ['package.json', 'playwright.config.ts', 'tests/e2e/']
      });
    }
  }

  private analyzePythonTesting(): void {
    const hasPytest = this.hasTestingFramework('Pytest');

    if (!hasPytest) {
      this.gaps.push({
        category: 'testing',
        severity: 'high',
        title: 'Pytest Suite Missing',
        description: 'Pytest is the preferred test runner once a Python stack is declared.',
        impact: 'No regression safety net for services or notebooks',
        recommendation: 'Install pytest and add `pytest.ini`; run `pytest -q` in CI',
        effort: 'medium',
        files: ['pyproject.toml', 'pytest.ini']
      });
    }
  }

  private analyzeSecurity(): void {
    const secrets = this.stack!.secrets || {};
    const envTemplatePresent = secrets.envTemplate?.present ?? false;
    const envIgnored = secrets.envIgnored ?? false;
    const envLoaderPresent = secrets.envLoader?.present ?? false;
    const auditPresent = secrets.dependencyAudit?.present ?? false;
    const missingSignals: string[] = [];

    if (!envTemplatePresent) {
      missingSignals.push('env template (.env.example)');
    }
    if (!envIgnored) {
      missingSignals.push('.env entry in .gitignore');
    }
    if (!envLoaderPresent) {
      missingSignals.push('env loader (python-dotenv / dotenv)');
    }
    if (!auditPresent) {
      missingSignals.push('dependency audit step in CI');
    }

    const hasPythonProfile = this.hasProfile('python');
    const hasNodeProfile = this.hasProfile('node');

    if (missingSignals.length > 0 && (hasPythonProfile || hasNodeProfile)) {
      const severity = missingSignals.length >= 3 ? 'high' : 'medium';
      const recommendation = hasPythonProfile
        ? 'Add `.env.example`, ensure `.env` stays in .gitignore, load env vars via python-dotenv or pydantic-settings, and run `pip-audit` + `bandit` inside `.github/workflows/ci.yml`.'
        : 'Add `.env.example`, ensure `.env` stays in .gitignore, wire up the `dotenv` package (or equivalent), and run `npm audit`/`pnpm audit` inside `.github/workflows/ci.yml`.';
      const files = hasPythonProfile
        ? ['.env.example', '.gitignore', 'pyproject.toml', '.github/workflows/ci.yml']
        : ['.env.example', '.gitignore', 'package.json', '.github/workflows/ci.yml'];

      this.gaps.push({
        category: 'security',
        severity,
        title: 'Secrets Handling Not Detected',
        description: `Missing secrets hygiene signals: ${missingSignals.join(', ')}.`,
        impact: 'Sensitive credentials may leak or go unsanitized',
        recommendation,
        effort: severity === 'high' ? 'medium' : 'low',
        files
      });
    } else if (!this.stack!.quality.security) {
      this.gaps.push({
        category: 'security',
        severity: 'high',
        title: 'Security Measures Not Detected',
        description: 'Basic security practices like environment variable management and dependency scanning are missing.',
        impact: 'Potential security vulnerabilities and data exposure',
        recommendation: 'Add .env example files, ignore `.env` in git, and enable dependency scanning (Dependabot/pip-audit) in CI',
        effort: 'medium',
        files: ['.env.example', '.github/workflows/security.yml']
      });
    }

    const hasNextJS = this.hasProfile('node') && this.stack!.configurations.some(c => c.type === 'nextjs');
    if (hasNextJS) {
      this.gaps.push({
        category: 'security',
        severity: 'medium',
        title: 'CSP Headers Not Verified',
        description: 'Content Security Policy protects against XSS and other attacks.',
        impact: 'Application vulnerable to injection attacks',
        recommendation: 'Implement CSP headers in next.config.js',
        effort: 'low',
        files: ['next.config.js']
      });
    }
  }

  private analyzeCI(): void {
    if (!this.stack!.ci.present) {
      this.gaps.push({
        category: 'ci',
        severity: 'high',
        title: 'No CI/CD Pipeline Detected',
        description: 'Automated testing, linting, and deployment are essential for quality.',
        impact: 'Cannot ensure code quality or automate deployment',
        recommendation: 'Add GitHub Actions workflow with lint, test, and security scans',
        effort: 'medium',
        files: ['.github/workflows/ci.yml']
      });
    } else if (this.stack!.ci.type === 'github-actions') {
      this.gaps.push({
        category: 'ci',
        severity: 'medium',
        title: 'Quality Gates Not Verified',
        description: 'CI should enforce linting, testing, and security checks.',
        impact: 'Poor code quality may be merged',
        recommendation: 'Add quality gate jobs to CI workflow',
        effort: 'low',
        files: ['.github/workflows/ci.yml']
      });
    }
  }

  private analyzeBoundaries(): void {
    // Check for proper folder structure
    this.gaps.push({
      category: 'architecture',
      severity: 'low',
      title: 'Folder Structure Not Verified',
      description: 'Clean architecture benefits from proper folder organization.',
      impact: 'Code may be harder to navigate and maintain',
      recommendation: 'Organize code into src/, tests/, docs/, scripts/, .github/',
      effort: 'low',
      files: ['[restructure directories]']
    });
  }

  private analyzeQualityGates(): void {
    const pythonOnly = this.hasProfile('python') && !this.hasProfile('node');

    if (pythonOnly) {
      this.gaps.push({
        category: 'quality',
        severity: 'low',
        title: 'Experiment Budgets Not Defined',
        description: 'Simulation/ML projects still need guardrails on runtime, dataset freshness, and numerical drift.',
        impact: 'Long-running experiments and stale datasets go unnoticed',
        recommendation: 'Add an experiment-budgets.yaml with max runtime, min epochs, and dataset checksum expectations',
        effort: 'low',
        files: ['experiments/budgets.yaml', 'pyproject.toml']
      });

      this.gaps.push({
        category: 'observability',
        severity: 'low',
        title: 'Run Tracking Not Configured',
        description: 'Run tracking (Weights & Biases, MLflow, or JSON logs) keeps a provenance trail for physics/AI studies.',
        impact: 'Cannot compare experiments or reproduce regressions',
        recommendation: 'Log each experiment with metrics + params via mlflow/wandb or append JSONL entries under data/runs/',
        effort: 'medium',
        files: ['data/runs/', 'scripts/track_runs.py']
      });
      return;
    }

    this.gaps.push({
      category: 'quality',
      severity: 'low',
      title: 'Quality Budgets Not Configured',
      description: 'Performance and quality budgets prevent regressions.',
      impact: 'Cannot track or prevent quality degradation',
      recommendation: 'Add quality-budgets.json with bundle size and performance limits',
      effort: 'low',
      files: ['quality-budgets.json']
    });

    this.gaps.push({
      category: 'observability',
      severity: 'low',
      title: 'Provenance Tracking Not Implemented',
      description: 'Tracking prompt metrics and outcomes enables continuous improvement.',
      impact: 'Cannot measure and improve development processes',
      recommendation: 'Add JSONL logging for prompt lifecycle metrics',
      effort: 'medium',
      files: ['provenance/', 'scripts/agent/metrics-log.js']
    });
  }

  // Enhanced analysis methods

  private async analyzeDocumentation(): Promise<void> {
    // Check for misplaced documentation files
    try {
      const { detectMisplacedDocs } = await import('../utils/docs-organizer');
      const misplaced = await detectMisplacedDocs(this.rootDir);
      if (misplaced.length > 0) {
        this.gaps.push({
          severity: 'medium',
          category: 'documentation',
          title: 'Misplaced Documentation Files',
          description: `${misplaced.length} markdown file(s) in project root should be organized into docs/ directory`,
          impact: 'Documentation is harder to find and project root becomes cluttered',
          recommendation: `Move misplaced files to appropriate directories: ${misplaced.join(', ')}. Run 'devenv organize-docs --auto-fix' to automatically organize.`,
          effort: 'low',
          files: misplaced,
          resources: ['https://github.com/XylarDark/DevEnvTemplate']
        });
      }
    } catch (error: any) {
      // Silently fail if docs-organizer is not available
      logger.debug('Could not check for misplaced docs', { error: error.message });
    }
    try {
      const readmePath = path.join(this.rootDir, 'README.md');
      const readme = await fs.readFile(readmePath, 'utf8');
      
      const requiredSections = ['Installation', 'Usage', 'Contributing', 'License'];
      const missingSections = requiredSections.filter(section => 
        !readme.toLowerCase().includes(section.toLowerCase())
      );

      if (missingSections.length > 0) {
        this.gaps.push({
          category: 'documentation',
          severity: 'medium',
          title: 'Incomplete README Documentation',
          description: `README is missing key sections: ${missingSections.join(', ')}`,
          impact: 'New contributors may struggle to understand and use the project',
          recommendation: `Add sections for: ${missingSections.join(', ')}`,
          effort: 'low',
          files: ['README.md']
        });
      }

      // Check for API documentation
      const hasAPIReference = readme.includes('API') || readme.includes('Reference');
      if (!hasAPIReference && (readme.length > 1000)) {
        this.gaps.push({
          category: 'documentation',
          severity: 'low',
          title: 'Missing API Documentation',
          description: 'No API reference or documentation detected',
          impact: 'Developers need to read source code to understand APIs',
          recommendation: 'Add API documentation section or generate with TypeDoc',
          effort: 'medium',
          files: ['README.md', 'docs/api/']
        });
      }
    } catch (error) {
      this.gaps.push({
        category: 'documentation',
        severity: 'high',
        title: 'README.md Not Found',
        description: 'Project lacks a README file',
        impact: 'Project is not documented for users or contributors',
        recommendation: 'Create comprehensive README.md with project overview',
        effort: 'low',
        files: ['README.md']
      });
    }
  }

  private analyzeDependencies(): void {
    if (this.hasProfile('node')) {
      this.gaps.push({
        category: 'dependencies',
        severity: 'medium',
        title: 'Dependency Health Check Needed',
        description: 'Regular dependency updates prevent security vulnerabilities',
        impact: 'Outdated dependencies may have known security issues',
        recommendation: 'Run `npm audit` / `npm outdated` weekly and enable Dependabot security updates',
        effort: 'low',
        files: ['package.json', '.github/dependabot.yml']
      });

      const hasPackageJson = this.stack!.technologies.some(t => t.name === 'Node.js');
      if (hasPackageJson) {
        this.gaps.push({
          category: 'dependencies',
          severity: 'medium',
          title: 'Lock File Best Practices',
          description: 'Lock files ensure consistent dependency versions',
          impact: 'Different environments may have different dependency versions',
          recommendation: 'Commit package-lock.json or pnpm-lock.yaml and fail CI when it changes unintentionally',
          effort: 'low',
          files: ['package-lock.json', 'pnpm-lock.yaml']
        });
      }
    }

    if (this.hasProfile('python')) {
      this.gaps.push({
        category: 'dependencies',
        severity: 'medium',
        title: 'Python Dependency Hygiene Not Verified',
        description: 'Poetry/pip-tools lock files keep virtualenvs reproducible.',
        impact: 'Production environments may drift from local installs',
        recommendation: 'Use Poetry or pip-tools with a committed lock file and schedule `pip-audit`',
        effort: 'medium',
        files: ['pyproject.toml', 'poetry.lock', 'requirements.txt']
      });
    }
  }

  private analyzePerformance(): void {
    const hasReact = this.stack!.technologies.some(t => t.name === 'React' || t.name === 'Next.js');
    
    if (hasReact) {
      this.gaps.push({
        category: 'performance',
        severity: 'medium',
        title: 'Bundle Size Monitoring Not Configured',
        description: 'Track bundle size to prevent performance regressions',
        impact: 'Application may become slow without monitoring',
        recommendation: 'Add bundle analyzer and set size budgets in next.config.js',
        effort: 'low',
        files: ['next.config.js', 'package.json'],
        codeSnippet: `// next.config.js
module.exports = {
  experimental: {
    optimizePackageImports: ['@mui/icons-material']
  }
};
`
      });

      this.gaps.push({
        category: 'performance',
        severity: 'low',
        title: 'Image Optimization Not Verified',
        description: 'Optimize images for faster load times',
        impact: 'Large images slow down page load',
        recommendation: 'Use Next.js Image component or image optimization tools',
        effort: 'low',
        files: ['next.config.js']
      });
    }
  }

  private logDebug(message: string, meta: Record<string, unknown> = {}): void {
    if (this.debug) {
      logger.debug(message, meta);
    }
  }

  private async runStage(stage: string, fn: () => void | Promise<void>): Promise<void> {
    const before = this.gaps.length;
    await fn();
    this.logDebug(`${stage} analysis complete`, { added: this.gaps.length - before });
  }

  private analyzeAccessibility(): void {
    const isUIProject = this.stack!.technologies.some(t => 
      t.name === 'React' || t.name === 'Next.js' || t.name === 'Vue'
    );

    if (isUIProject) {
      this.gaps.push({
        category: 'accessibility',
        severity: 'medium',
        title: 'Accessibility Tooling Not Detected',
        description: 'Accessibility testing ensures app is usable for everyone',
        impact: 'Application may not be accessible to users with disabilities',
        recommendation: 'Add eslint-plugin-jsx-a11y and axe-core for a11y testing',
        effort: 'low',
        files: ['package.json', '.eslintrc.json']
      });

      this.gaps.push({
        category: 'accessibility',
        severity: 'low',
        title: 'ARIA Labels Review Needed',
        description: 'Proper ARIA labels improve screen reader experience',
        impact: 'Screen reader users may have difficulty navigating',
        recommendation: 'Review all interactive elements for proper ARIA attributes',
        effort: 'medium',
        files: ['src/components/**/*.tsx']
      });
    }
  }

  private async analyzeDocker(): Promise<void> {
    try {
      await fs.access(path.join(this.rootDir, 'Dockerfile'));
      
      // Check for .dockerignore
      try {
        await fs.access(path.join(this.rootDir, '.dockerignore'));
      } catch {
        this.gaps.push({
          category: 'docker',
          severity: 'medium',
          title: 'Missing .dockerignore File',
          description: '.dockerignore reduces image size by excluding unnecessary files',
          impact: 'Docker images may be unnecessarily large',
          recommendation: 'Create .dockerignore to exclude node_modules, .git, etc.',
          effort: 'low',
          files: ['.dockerignore'],
          codeSnippet: `node_modules
.git
.env
*.log
.next
dist`
        });
      }

      // Check for multi-stage build
      const dockerfile = await fs.readFile(path.join(this.rootDir, 'Dockerfile'), 'utf8');
      if (!dockerfile.includes('AS builder') && !dockerfile.includes('AS build')) {
        this.gaps.push({
          category: 'docker',
          severity: 'low',
          title: 'Multi-Stage Build Not Detected',
          description: 'Multi-stage builds optimize Docker image size',
          impact: 'Docker images may be larger than necessary',
          recommendation: 'Use multi-stage Dockerfile with builder and runtime stages',
          effort: 'medium',
          files: ['Dockerfile']
        });
      }
    } catch {
      // No Dockerfile found - not necessarily a gap
    }
  }

  private async analyzeEnvironment(): Promise<void> {
    const envSample = await this.findEnvSampleFile();
    if (!envSample) {
      this.gaps.push({
        category: 'environment',
        severity: 'medium',
        title: 'Missing .env.example File',
        description: '.env.example documents required environment variables for all contributors.',
        impact: 'Developers may not know which environment variables are needed',
        recommendation: 'Create .env.example with placeholder values under the repo root',
        effort: 'low',
        files: ['.env.example']
      });
    } else if (!envSample.startsWith('.env')) {
      this.gaps.push({
        category: 'environment',
        severity: 'low',
        title: 'Environment Template Uses Non-Standard Name',
        description: `Found ${envSample}; renaming to .env.example keeps tooling (and DevEnvTemplate) happy.`,
        impact: 'Tooling like dotenv/pre-commit may not auto-detect the template file',
        recommendation: `Rename ${envSample} to .env.example and update docs referencing it`,
        effort: 'low',
        files: [envSample]
      });
    }

    // Check for .env in .gitignore
    try {
      const gitignore = await fs.readFile(path.join(this.rootDir, '.gitignore'), 'utf8');
      if (!gitignore.includes('.env')) {
        this.gaps.push({
          category: 'environment',
          severity: 'high',
          title: '.env Not in .gitignore',
          description: 'Environment files should never be committed',
          impact: 'Secrets may be accidentally committed to version control',
          recommendation: 'Add .env to .gitignore immediately',
          effort: 'low',
          files: ['.gitignore']
        });
      }
    } catch {
      // .gitignore not found
    }
  }

  private async analyzeGitHooks(): Promise<void> {
    const hasPreCommit = await this.fileExists('.pre-commit-config.yaml');
    const hasHusky = await this.fileExists('.husky');

    if (this.hasProfile('python') && !hasPreCommit) {
      this.gaps.push({
        category: 'git-hooks',
        severity: 'low',
        title: 'Pre-commit Hooks Not Configured',
        description: 'pre-commit keeps Ruff/Black/Mypy/Pytest in sync with CI for Python repos.',
        impact: 'Developers may skip the fast fail checks that CI enforces',
        recommendation: 'Add pre-commit with Ruff/Black/Mypy/Pytest stages and run `pre-commit install`',
        effort: 'low',
        files: ['.pre-commit-config.yaml'],
        codeSnippet: `repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.6.9
    hooks:
      - id: ruff
  - repo: local
    hooks:
      - id: pytest
        entry: python -m pytest`,
        resources: ['https://pre-commit.com/']
      });
      return;
    }

    if (this.hasProfile('node') && !hasHusky) {
      this.gaps.push({
        category: 'git-hooks',
        severity: 'low',
        title: 'Git Hooks Not Configured',
        description: 'Pre-commit hooks prevent bad code from being committed',
        impact: 'Linting and formatting issues may be committed',
        recommendation: 'Add Husky with pre-commit hooks for lint and format',
        effort: 'low',
        files: ['package.json', '.husky/pre-commit'],
        codeSnippet: `npm install --save-dev husky
npx husky init
echo "npm run lint && npm run format:check" > .husky/pre-commit`
      });
    } else if (!hasPreCommit && !hasHusky) {
      this.gaps.push({
        category: 'git-hooks',
        severity: 'low',
        title: 'Git Hooks Not Configured',
        description: 'Pre-commit hooks (pre-commit or Husky) keep local workflows aligned with CI.',
        impact: 'Local commits may skip formatting/linting',
        recommendation: 'Add either pre-commit (Python) or Husky (Node) with lint/test tasks',
        effort: 'low',
        files: ['.pre-commit-config.yaml', '.husky/pre-commit']
      });
    }
  }

  private analyzeFrameworks(): void {
    const frameworks = {
      'React': ['prop-types', 'eslint-plugin-react-hooks'],
      'Next.js': ['next-seo', 'sharp'],
      'Vue': ['vue-router', 'pinia'],
      'Angular': ['@angular/cli', '@angular/forms']
    };

    Object.entries(frameworks).forEach(([framework, essentialPackages]) => {
      const hasFramework = this.stack!.technologies.some(t => t.name === framework);
      if (hasFramework) {
        this.gaps.push({
          category: 'quality',
          severity: 'low',
          title: `${framework} Best Practices Check`,
          description: `Ensure ${framework} best practices are followed`,
          impact: 'May miss framework-specific optimizations',
          recommendation: `Review ${framework} documentation and consider: ${essentialPackages.join(', ')}`,
          effort: 'low',
          files: ['package.json'],
          resources: [`https://react.dev/`, `https://nextjs.org/docs`]
        });
      }
    });
  }

  private analyzePythonTooling(): void {
    if (!this.hasProfile('python')) {
      return;
    }

    if (!this.hasTechnology('Black')) {
      this.gaps.push({
        category: 'quality',
        severity: 'medium',
        title: 'Black Formatter Not Enabled',
        description: 'Black provides opinionated formatting for Python projects and keeps diffs small.',
        impact: 'Inconsistent formatting slows down code reviews',
        recommendation: 'Add Black to pyproject.toml and run `black .` in CI or as a pre-commit hook',
        effort: 'low',
        files: ['pyproject.toml', 'pyproject.lock']
      });
    }

    if (!this.hasTechnology('Mypy')) {
      this.gaps.push({
        category: 'quality',
        severity: 'medium',
        title: 'Static Typing (Mypy) Missing',
        description: 'Mypy catches entire classes of runtime errors for Python services.',
        impact: 'Refactors may introduce silent type errors',
        recommendation: 'Add Mypy with `python -m mypy src/` and enable strict optional checking',
        effort: 'medium',
        files: ['mypy.ini', 'pyproject.toml']
      });
    }
  }

  private async findEnvSampleFile(): Promise<string | null> {
    for (const candidate of ENV_SAMPLE_FILES) {
      if (await this.fileExists(candidate)) {
        return candidate;
      }
    }
    return null;
  }

  private async fileExists(relativePath: string): Promise<boolean> {
    try {
      await fs.access(path.join(this.rootDir, relativePath));
      return true;
    } catch {
      return false;
    }
  }

  private detectProfilesFromStack(): string[] {
    const names = this.stack?.technologies?.map(t => t.name.toLowerCase()) || [];
    const profiles: string[] = [];

    if (names.some(name => NODE_TECH_HINTS.includes(name))) {
      profiles.push('node');
    }
    if (names.some(name => PYTHON_TECH_HINTS.includes(name))) {
      profiles.push('python');
    }

    if (profiles.length === 0) {
      profiles.push('agnostic');
    }

    return profiles;
  }

  private applyManifestProfiles(): void {
    const manifest = (this.stack as any)?.manifest;
    if (!manifest) {
      return;
    }

    const manifestTechs = Array.isArray(manifest.technologies)
      ? manifest.technologies.map((tech: string) => tech.toLowerCase())
      : [];
    const packageManager = (manifest.packageManager || '').toLowerCase();

    if (
      manifestTechs.some((tech: string) => NODE_TECH_HINTS.includes(tech)) ||
      NODE_PACKAGE_MANAGERS.includes(packageManager)
    ) {
      this.profiles.add('node');
    }

    if (
      manifestTechs.some((tech: string) => PYTHON_TECH_HINTS.includes(tech)) ||
      PYTHON_PACKAGE_MANAGERS.includes(packageManager)
    ) {
      this.profiles.add('python');
    }
  }

  private computeLanguageProfile(): string {
    if (this.profiles.has('node') && this.profiles.has('python')) {
      return 'python+node';
    }
    if (this.profiles.has('node')) {
      return 'node';
    }
    if (this.profiles.has('python')) {
      return 'python';
    }
    return 'agnostic';
  }

  private syncProfilesWithLanguageProfile(): void {
    if (this.languageProfile.includes('node')) {
      this.profiles.add('node');
    }
    if (this.languageProfile.includes('python')) {
      this.profiles.add('python');
    }
  }

  private hasProfile(profile: string): boolean {
    if (this.languageProfile === 'python+node') {
      return profile === 'python' || profile === 'node';
    }
    if (this.languageProfile === profile) {
      return true;
    }
    return this.profiles.has(profile);
  }

  private hasTechnology(name: string): boolean {
    const needle = name.toLowerCase();
    return this.stack!.technologies.some(t => t.name.toLowerCase() === needle);
  }

  private hasTestingFramework(name: string): boolean {
    const needle = name.toLowerCase();
    return (this.stack!.tooling?.testing?.frameworks || []).some(
      framework => framework.name.toLowerCase() === needle
    );
  }

  private generateReport(): string {
    // Sort gaps by severity
    const severityOrder = { high: 3, medium: 2, low: 1 };
    this.gaps.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);

    let report = '# DevEnvTemplate Gap Analysis Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;
    report += `Total gaps found: ${this.gaps.length}\n\n`;

    // Group by category
    const categories: Record<string, Gap[]> = {};
    this.gaps.forEach(gap => {
      if (!categories[gap.category]) {
        categories[gap.category] = [];
      }
      categories[gap.category].push(gap);
    });

    // Generate sections
    Object.entries(categories).forEach(([category, gaps]) => {
      report += `## ${category.charAt(0).toUpperCase() + category.slice(1)} (${gaps.length} gaps)\n\n`;

      gaps.forEach(gap => {
        const severityIcon = gap.severity === 'high' ? '🔴' : gap.severity === 'medium' ? '🟡' : '🟢';
        report += `### ${severityIcon} ${gap.title}\n\n`;
        report += `**Category:** ${gap.category}\n\n`;
        report += `${gap.description}\n\n`;
        report += `**Impact:** ${gap.impact}\n\n`;
        report += `**Recommendation:** ${gap.recommendation}\n\n`;
        report += `**Effort:** ${gap.effort}\n\n`;
        report += `**Files:** ${gap.files.join(', ')}\n\n`;
        
        if (gap.codeSnippet) {
          report += `**Code Example:**\n\`\`\`\n${gap.codeSnippet}\n\`\`\`\n\n`;
        }
        
        if (gap.resources && gap.resources.length > 0) {
          report += `**Resources:** ${gap.resources.map(r => `[Link](${r})`).join(', ')}\n\n`;
        }
        
        report += '---\n\n';
      });
    });

    // Summary
    const highPriority = this.gaps.filter(g => g.severity === 'high').length;
    const mediumPriority = this.gaps.filter(g => g.severity === 'medium').length;
    const lowPriority = this.gaps.filter(g => g.severity === 'low').length;

    report += '## Summary\n\n';
    report += `🔴 High Priority: ${highPriority} gaps\n`;
    report += `🟡 Medium Priority: ${mediumPriority} gaps\n`;
    report += `🟢 Low Priority: ${lowPriority} gaps\n\n`;

    if (highPriority > 0) {
      report += '**Recommendation:** Address high-priority gaps first for maximum impact on code quality and security.\n\n';
    }

    report += '## Next Steps\n\n';
    report += '1. Review gaps and prioritize based on your project needs\n';
    report += '2. Use Cursor Plan mode to implement improvements\n';
    report += '3. Follow the [Prompt Lifecycle Guide](docs/guides/prompt-lifecycle.md)\n';
    report += '4. Re-run analysis after implementing changes\n\n';

    report += '---\n\n*Generated by DevEnvTemplate gap analyzer*';

    return report;
  }

  // Method to save report to file
  async saveReport(report: string): Promise<void> {
    const outputPath = path.join(this.rootDir, '.devenv', 'gaps-report.md');
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, report);
    logger.info(`Gap report saved to ${outputPath}`);
  }
}

// Run the analyzer
if (require.main === module) {
  const analyzer = new GapAnalyzer({ mode: analyzerMode, debug: debugFlag });
  analyzer.analyze()
    .then(async report => {
      console.log(report);
      await analyzer.saveReport(report);
    })
    .catch(error => {
      logger.error('Gap analysis failed', { error: error.message });
      process.exit(1);
    });
}

export default GapAnalyzer;

