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

class GapAnalyzer {
  private rootDir: string;
  private stack: StackReport | null = null;
  private gaps: Gap[] = [];

  constructor(options: GapAnalysisOptions = {}) {
    this.rootDir = options.rootDir || process.cwd();
  }

  async analyze(): Promise<string> {
    logger.info('Starting gap analysis against DevEnvTemplate standards');

    // Load stack report
    try {
      const stackReportPath = path.join(this.rootDir, '.devenv', 'stack-report.json');
      const content = await fs.readFile(stackReportPath, 'utf8');
      this.stack = JSON.parse(content) as StackReport;
      logger.info('Stack report loaded successfully');
    } catch (error) {
      logger.error('Stack report not found. Run stack-detector first.');
      throw new Error('Stack report not found. Run stack-detector first.');
    }

    // Run all analysis methods
    this.analyzeTypeScript();
    this.analyzeLinting();
    this.analyzeTesting();
    this.analyzeSecurity();
    this.analyzeCI();
    this.analyzeBoundaries();
    this.analyzeQualityGates();
    
    // Enhanced analysis methods (async)
    await this.analyzeDocumentation();
    this.analyzeDependencies();
    this.analyzePerformance();
    this.analyzeAccessibility();
    await this.analyzeDocker();
    await this.analyzeEnvironment();
    await this.analyzeGitHooks();
    this.analyzeFrameworks();

    logger.info(`Gap analysis complete. Found ${this.gaps.length} gaps`);
    return this.generateReport();
  }

  private analyzeTypeScript(): void {
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
    const hasESLint = this.stack!.technologies.some(t => t.name === 'ESLint');
    const hasESLintConfig = this.stack!.configurations.some(c => c.type === 'eslint');

    if (!hasESLint) {
      this.gaps.push({
        category: 'linting',
        severity: 'high',
        title: 'ESLint Not Configured',
        description: 'ESLint enforces consistent code style and catches potential issues.',
        impact: 'Inconsistent code quality and potential bugs',
        recommendation: 'Add ESLint with TypeScript support and import/no-internal-modules rule',
        effort: 'low',
        files: ['package.json', '.eslintrc.json']
      });
    } else if (!hasESLintConfig) {
      this.gaps.push({
        category: 'linting',
        severity: 'high',
        title: 'Missing ESLint Configuration',
        description: 'ESLint is installed but not configured.',
        impact: 'Linting rules not enforced',
        recommendation: 'Create .eslintrc.json with appropriate rules for your stack',
        effort: 'low',
        files: ['.eslintrc.json']
      });
    }

    if (hasESLint && !this.stack!.configurations.some(c => c.configFile?.includes('boundaries'))) {
      this.gaps.push({
        category: 'linting',
        severity: 'medium',
        title: 'Missing Architectural Boundaries',
        description: 'eslint-plugin-boundaries enforces clean architecture layer separation.',
        impact: 'Code organization may become unstructured',
        recommendation: 'Add eslint-plugin-boundaries and configure layer rules',
        effort: 'medium',
        files: ['package.json', '.eslintrc.json']
      });
    }
  }

  private analyzeTesting(): void {
    if (!this.stack!.quality.testing) {
      this.gaps.push({
        category: 'testing',
        severity: 'high',
        title: 'No Testing Framework Detected',
        description: 'Automated tests are essential for code reliability and refactoring safety.',
        impact: 'Cannot safely refactor code or catch regressions',
        recommendation: 'Add Jest or Vitest with comprehensive test coverage',
        effort: 'medium',
        files: ['package.json', 'jest.config.js', 'tests/']
      });
    }

    const hasPlaywright = this.stack!.technologies.some(t => t.name === 'Playwright');
    const isUIProject = this.stack!.technologies.some(t => t.name === 'React' || t.name === 'Next.js' || t.name === 'Vue');
    
    if (!hasPlaywright && isUIProject) {
      this.gaps.push({
        category: 'testing',
        severity: 'medium',
        title: 'Missing End-to-End Testing',
        description: 'E2E tests validate complete user workflows and integration.',
        impact: 'Cannot verify complete application functionality',
        recommendation: 'Add Playwright for E2E testing of user flows',
        effort: 'medium',
        files: ['package.json', 'playwright.config.ts', 'tests/e2e/']
      });
    }
  }

  private analyzeSecurity(): void {
    if (!this.stack!.quality.security) {
      this.gaps.push({
        category: 'security',
        severity: 'high',
        title: 'Security Measures Not Detected',
        description: 'Basic security practices like environment variable management and CSP are missing.',
        impact: 'Potential security vulnerabilities and data exposure',
        recommendation: 'Add .env files, implement CSP headers, and security scanning',
        effort: 'medium',
        files: ['.env.example', 'next.config.js', '.github/workflows/security.yml']
      });
    }

    const hasNextJS = this.stack!.configurations.some(c => c.type === 'nextjs');
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
    // Check for outdated dependencies
    this.gaps.push({
      category: 'dependencies',
      severity: 'medium',
      title: 'Dependency Health Check Needed',
      description: 'Regular dependency updates prevent security vulnerabilities',
      impact: 'Outdated dependencies may have known security issues',
      recommendation: 'Run npm audit and npm outdated regularly; use Dependabot',
      effort: 'low',
      files: ['package.json', '.github/dependabot.yml']
    });

    // Check for lock file
    const hasPackageJson = this.stack!.technologies.some(t => t.name === 'Node.js');
    if (hasPackageJson) {
      this.gaps.push({
        category: 'dependencies',
        severity: 'medium',
        title: 'Lock File Best Practices',
        description: 'Lock files ensure consistent dependency versions',
        impact: 'Different environments may have different dependency versions',
        recommendation: 'Commit package-lock.json or yarn.lock to version control',
        effort: 'low',
        files: ['package-lock.json', 'yarn.lock']
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
}`
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
    try {
      await fs.access(path.join(this.rootDir, '.env.example'));
    } catch {
      // Check if project uses environment variables
      const hasPackageJson = this.stack!.technologies.some(t => t.name === 'Node.js');
      if (hasPackageJson) {
        this.gaps.push({
          category: 'environment',
          severity: 'medium',
          title: 'Missing .env.example File',
          description: '.env.example documents required environment variables',
          impact: 'Developers may not know which environment variables are needed',
          recommendation: 'Create .env.example with placeholder values',
          effort: 'low',
          files: ['.env.example']
        });
      }
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
    try {
      await fs.access(path.join(this.rootDir, '.husky'));
    } catch {
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
  const analyzer = new GapAnalyzer();
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

