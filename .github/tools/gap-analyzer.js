#!/usr/bin/env node

/**
 * Gap Analyzer - CI-only utility
 *
 * Analyzes detected stack against DevEnvTemplate standards
 * and generates recommendations for improvement.
 */

const fs = require('fs').promises;
const path = require('path');

class GapAnalyzer {
  constructor() {
    this.rootDir = process.cwd();
    this.stack = null;
    this.gaps = [];
  }

  async analyze() {
    console.log('🎯 Analyzing gaps against DevEnvTemplate standards...');

    // Load stack report
    try {
      const stackReport = JSON.parse(await fs.readFile(path.join(this.rootDir, '.devenv', 'stack-report.json'), 'utf8'));
      this.stack = stackReport;
    } catch (error) {
      throw new Error('Stack report not found. Run stack-detector first.');
    }

    // Analyze each category
    this.analyzeTypeScript();
    this.analyzeLinting();
    this.analyzeTesting();
    this.analyzeSecurity();
    this.analyzeCI();
    this.analyzeBoundaries();
    this.analyzeQualityGates();

    return this.generateReport();
  }

  analyzeTypeScript() {
    const hasTypeScript = this.stack.technologies.some(t => t.name === 'TypeScript');
    const hasTSConfig = this.stack.configurations.some(c => c.type === 'typescript');

    if (!hasTypeScript) {
      this.gaps.push({
        category: 'typescript',
        severity: 'high',
        title: 'TypeScript Not Configured',
        description: 'TypeScript provides compile-time type checking and better IDE support.',
        impact: 'Reduces code quality and developer experience',
        recommendation: 'Add TypeScript dependency and tsconfig.json with strict settings',
        effort: 'medium',
        files: ['package.json', 'tsconfig.json']
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
        files: ['tsconfig.json']
      });
    } else {
      // Check if strict mode is enabled
      const tsConfig = this.stack.configurations.find(c => c.type === 'typescript');
      if (!tsConfig.strict) {
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

  analyzeLinting() {
    const hasESLint = this.stack.technologies.some(t => t.name === 'ESLint');
    const hasESLintConfig = this.stack.configurations.some(c => c.type === 'eslint');

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

    // Check for boundaries plugin (if not present)
    if (hasESLint && !this.stack.configurations.some(c => c.configFile?.includes('boundaries'))) {
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

  analyzeTesting() {
    if (!this.stack.quality.testing) {
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

    // Check for Playwright (E2E testing)
    const hasPlaywright = this.stack.technologies.some(t => t.name === 'Playwright');
    if (!hasPlaywright && this.stack.technologies.some(t => t.name === 'React' || t.name === 'Next.js')) {
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

  analyzeSecurity() {
    if (!this.stack.quality.security) {
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

    // Check for CSP in Next.js
    if (this.stack.configurations.some(c => c.type === 'nextjs')) {
      // This would require more detailed analysis of next.config.js
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

  analyzeCI() {
    if (!this.stack.ci.present) {
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
    }

    // Check for quality gates in CI
    if (this.stack.ci.present && this.stack.ci.type === 'github-actions') {
      // This would require analyzing the workflow files
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

  analyzeBoundaries() {
    // Check for proper folder structure
    const recommendedStructure = ['src/', 'tests/', 'docs/', 'scripts/', '.github/'];
    const missing = [];

    for (const dir of recommendedStructure) {
      try {
        // This is a simplified check - would need more sophisticated analysis
        // to verify proper separation of concerns
      } catch (error) {
        // Directory doesn't exist or isn't accessible
      }
    }

    if (missing.length > 0) {
      this.gaps.push({
        category: 'architecture',
        severity: 'low',
        title: 'Suboptimal Folder Structure',
        description: 'Clean architecture benefits from proper folder organization.',
        impact: 'Code may be harder to navigate and maintain',
        recommendation: 'Organize code into src/, tests/, docs/, scripts/, .github/',
        effort: 'low',
        files: ['[restructure directories]']
      });
    }
  }

  analyzeQualityGates() {
    // Check for quality budget configuration
    try {
      // This would check for quality-budgets.json or similar
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
    } catch (error) {
      // Quality budgets not found
    }

    // Check for provenance tracking
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

  generateReport() {
    // Sort gaps by severity
    const severityOrder = { high: 3, medium: 2, low: 1 };
    this.gaps.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);

    let report = '# DevEnvTemplate Gap Analysis Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;
    report += `Total gaps found: ${this.gaps.length}\n\n`;

    // Group by category
    const categories = {};
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
        report += `${gap.description}\n\n`;
        report += `**Impact:** ${gap.impact}\n\n`;
        report += `**Recommendation:** ${gap.recommendation}\n\n`;
        report += `**Effort:** ${gap.effort}\n\n`;
        report += `**Files:** ${gap.files.join(', ')}\n\n`;
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
}

// Run the analyzer
if (require.main === module) {
  const analyzer = new GapAnalyzer();
  analyzer.analyze().then(report => {
    console.log(report);
  }).catch(error => {
    console.error('Gap analysis failed:', error.message);
    process.exit(1);
  });
}

module.exports = GapAnalyzer;
