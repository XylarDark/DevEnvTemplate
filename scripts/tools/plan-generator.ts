#!/usr/bin/env node

/**
 * Plan Generator - CI-only utility
 *
 * Generates a hardening plan from gap analysis results.
 * Creates actionable tasks with code snippets, dependency ordering, and priority scoring.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { createLogger, Logger } from '../../scripts/utils/logger';
import { Gap, GapCategory } from '../types/gaps';
import { Task, TaskGroup, HardeningPlan, CodeSnippet, PlanGeneratorOptions, PlanMetadata } from '../types/plan';

export class PlanGenerator {
  private rootDir: string;
  private gaps: Gap[];
  private tasks: Task[];
  private logger: Logger;
  private includeCodeSnippets: boolean;
  private includeDependencies: boolean;
  private sortByPriority: boolean;

  constructor(options: PlanGeneratorOptions = {}) {
    this.rootDir = options.rootDir || process.cwd();
    this.gaps = [];
    this.tasks = [];
    this.logger = createLogger({ context: 'PlanGenerator' });
    this.includeCodeSnippets = options.includeCodeSnippets !== false;
    this.includeDependencies = options.includeDependencies !== false;
    this.sortByPriority = options.sortByPriority !== false;
  }

  public async generate(): Promise<string> {
    this.logger.info('📋 Generating hardening plan from gap analysis...');

    // Load gaps report
    try {
      const gapsReportPath = path.join(this.rootDir, '.devenv', 'gaps-report.md');
      const gapsReport = await fs.readFile(gapsReportPath, 'utf8');
      this.parseGaps(gapsReport);
      this.logger.debug(`Parsed ${this.gaps.length} gaps from report`);
    } catch (error: any) {
      this.logger.error('Failed to load gaps report. Run gap-analyzer first.', { error: error.message });
      throw new Error('Gaps report not found. Run gap-analyzer first.');
    }

    // Convert gaps to tasks
    this.tasks = this.gaps.map((gap, index) => this.gapToTask(gap, index + 1));

    // Calculate priority scores
    this.calculatePriorityScores();

    // Add dependencies if enabled
    if (this.includeDependencies) {
      this.calculateDependencies();
    }

    // Add code snippets if enabled
    if (this.includeCodeSnippets) {
      this.addCodeSnippets();
    }

    // Sort by priority score if enabled
    if (this.sortByPriority) {
      this.tasks.sort((a, b) => b.priorityScore - a.priorityScore);
      // Renumber tasks after sorting
      this.tasks.forEach((task, index) => {
        task.number = index + 1;
      });
    }

    this.logger.info(`Generated plan with ${this.tasks.length} tasks`);
    return this.generatePlanMarkdown();
  }

  private parseGaps(report: string): void {
    const lines = report.split('\n');
    let currentGap: Partial<Gap> | null = null;
    let inSection: 'description' | 'impact' | 'recommendation' | 'files' | 'resources' | null = null;

    for (const line of lines) {
      if (line.startsWith('### ')) {
        if (currentGap && currentGap.title) {
          this.gaps.push(currentGap as Gap);
        }

        // Match pattern: "### 🔴 Title" or "### 🟡 Title" or "### 🟢 Title"
        // Emojis are multi-byte, so use a flexible pattern
        const titleMatch = line.match(/^### .+ (.+)$/);
        if (titleMatch) {
          const severity = line.includes('🔴') ? 'high' : line.includes('🟡') ? 'medium' : 'low';
          // Extract title by removing "### " and the emoji
          const title = line.replace(/^### [🔴🟡🟢] /, '');
          currentGap = {
            title: title,
            severity: severity as 'high' | 'medium' | 'low',
            category: 'typescript' as GapCategory, // Will be overwritten when parsed
            description: '',
            impact: '',
            recommendation: '',
            effort: 'medium' as 'low' | 'medium' | 'high',
            files: [],
            resources: []
          };
          inSection = null;
        }
      } else if (currentGap) {
        if (line.startsWith('**Category:**')) {
          const categoryStr = line.replace('**Category:**', '').trim();
          currentGap.category = categoryStr as GapCategory;
        } else if (line.trim() && !line.startsWith('**') && !line.startsWith('---') && !currentGap.description) {
          currentGap.description = line.trim();
        } else if (line.startsWith('**Impact:**')) {
          currentGap.impact = line.replace('**Impact:**', '').trim();
          inSection = 'impact';
        } else if (line.startsWith('**Recommendation:**')) {
          currentGap.recommendation = line.replace('**Recommendation:**', '').trim();
          inSection = 'recommendation';
        } else if (line.startsWith('**Effort:**')) {
          const effortStr = line.replace('**Effort:**', '').trim().toLowerCase();
          currentGap.effort = (effortStr === 'low' || effortStr === 'medium' || effortStr === 'high') ? effortStr : 'medium';
          inSection = null;
        } else if (line.startsWith('**Files:**')) {
          const filesStr = line.replace('**Files:**', '').trim();
          currentGap.files = filesStr ? filesStr.split(',').map(f => f.trim()) : [];
          inSection = 'files';
        } else if (line.startsWith('**Resources:**')) {
          inSection = 'resources';
        } else if (line.startsWith('- ') && inSection === 'resources') {
          const url = line.replace(/^- /, '').trim();
          currentGap.resources = currentGap.resources || [];
          currentGap.resources.push(url);
        } else if (inSection && line.trim() && !line.startsWith('**') && !line.startsWith('---')) {
          // Continuation of previous section
          if (inSection === 'impact' && currentGap.impact) {
            currentGap.impact += ' ' + line.trim();
          } else if (inSection === 'recommendation' && currentGap.recommendation) {
            currentGap.recommendation += ' ' + line.trim();
          }
        }
      }
    }

    if (currentGap && currentGap.title) {
      this.gaps.push(currentGap as Gap);
    }
  }

  private gapToTask(gap: Gap, number: number): Task {
    return {
      id: this.generateTaskId(gap),
      number,
      title: gap.title,
      description: gap.description,
      priority: gap.severity,
      severity: gap.severity,
      effort: gap.effort,
      impact: gap.impact,
      recommendation: gap.recommendation,
      category: gap.category,
      files: gap.files || [],
      resources: gap.resources || [],
      codeSnippets: [],
      dependencies: [],
      estimatedMinutes: this.estimateEffort(gap.effort),
      priorityScore: 0
    };
  }

  private generateTaskId(gap: Gap): string {
    return gap.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private estimateEffort(effort: 'low' | 'medium' | 'high'): number {
    const estimates = {
      low: 30,
      medium: 90,
      high: 180
    };
    return estimates[effort];
  }

  private calculatePriorityScores(): void {
    const severityWeight = { high: 10, medium: 5, low: 2 };
    const effortWeight = { low: 3, medium: 2, high: 1 }; // Low effort = higher score (easier win)

    this.tasks.forEach(task => {
      const severityScore = severityWeight[task.severity];
      const effortScore = effortWeight[task.effort];
      task.priorityScore = severityScore * effortScore;
    });
  }

  private calculateDependencies(): void {
    // Define common dependency patterns
    const dependencyRules = [
      {
        // TypeScript should be set up before ESLint TypeScript config
        if: (task: Task) => task.category === 'linting' && task.title.toLowerCase().includes('typescript'),
        dependsOn: (tasks: Task[]) => tasks.find(t => t.category === 'typescript' && t.title.toLowerCase().includes('not configured')),
        reason: 'TypeScript must be configured before TypeScript ESLint rules'
      },
      {
        // Testing framework before E2E tests
        if: (task: Task) => task.category === 'testing' && task.title.toLowerCase().includes('e2e'),
        dependsOn: (tasks: Task[]) => tasks.find(t => t.category === 'testing' && t.title.toLowerCase().includes('framework')),
        reason: 'Base testing framework required for E2E tests'
      },
      {
        // CI setup before CI quality gates
        if: (task: Task) => task.category === 'ci' && task.title.toLowerCase().includes('quality gate'),
        dependsOn: (tasks: Task[]) => tasks.find(t => t.category === 'ci' && t.title.toLowerCase().includes('not configured')),
        reason: 'CI pipeline must exist before adding quality gates'
      }
    ];

    this.tasks.forEach(task => {
      dependencyRules.forEach(rule => {
        if (rule.if(task)) {
          const dependency = rule.dependsOn(this.tasks);
          if (dependency && dependency.id !== task.id) {
            task.dependencies = task.dependencies || [];
            task.dependencies.push({
              taskId: dependency.id,
              reason: rule.reason
            });
          }
        }
      });
    });
  }

  private addCodeSnippets(): void {
    this.tasks.forEach(task => {
      task.codeSnippets = this.generateCodeSnippetsForTask(task);
    });
  }

  private generateCodeSnippetsForTask(task: Task): CodeSnippet[] {
    const snippets: CodeSnippet[] = [];

    // TypeScript configuration
    if (task.category === 'typescript' && task.title.toLowerCase().includes('not configured')) {
      snippets.push({
        language: 'json',
        filename: 'tsconfig.json',
        description: 'Basic TypeScript configuration with strict mode',
        code: `{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "lib": ["es2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}`
      });
      snippets.push({
        language: 'bash',
        description: 'Install TypeScript',
        code: `npm install --save-dev typescript @types/node`
      });
    }

    // ESLint configuration
    if (task.category === 'linting' && task.title.toLowerCase().includes('eslint')) {
      snippets.push({
        language: 'json',
        filename: '.eslintrc.json',
        description: 'ESLint configuration',
        code: `{
  "env": {
    "node": true,
    "es2021": true
  },
  "extends": ["eslint:recommended"],
  "parserOptions": {
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error"
  }
}`
      });
      snippets.push({
        language: 'bash',
        description: 'Install ESLint',
        code: `npm install --save-dev eslint`
      });
    }

    // Testing framework
    if (task.category === 'testing' && task.title.toLowerCase().includes('framework')) {
      snippets.push({
        language: 'bash',
        description: 'Node.js native test runner (recommended)',
        code: `# Node.js 18+ has built-in test runner
node --test tests/**/*.test.js`
      });
      snippets.push({
        language: 'json',
        filename: 'package.json',
        description: 'Add test script',
        code: `{
  "scripts": {
    "test": "node --test tests/**/*.test.js",
    "test:watch": "node --test --watch tests/**/*.test.js"
  }
}`
      });
    }

    // GitHub Actions CI
    if (task.category === 'ci' && task.title.toLowerCase().includes('not configured')) {
      snippets.push({
        language: 'yaml',
        filename: '.github/workflows/ci.yml',
        description: 'Basic CI workflow',
        code: `name: CI

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run lint`
      });
    }

    // .env.example
    if (task.category === 'environment' && task.title.toLowerCase().includes('.env.example')) {
      snippets.push({
        language: 'bash',
        filename: '.env.example',
        description: 'Environment variable template',
        code: `# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/db

# API Keys (replace with your own)
API_KEY=your_api_key_here`
      });
    }

    // .dockerignore
    if (task.category === 'docker' && task.title.toLowerCase().includes('dockerignore')) {
      snippets.push({
        language: 'text',
        filename: '.dockerignore',
        description: 'Docker ignore file',
        code: `node_modules
npm-debug.log
dist
.git
.env
.DS_Store
*.md
tests
coverage`
      });
    }

    // Git hooks with Husky
    if (task.category === 'git' && task.title.toLowerCase().includes('hook')) {
      snippets.push({
        language: 'bash',
        description: 'Install Husky',
        code: `npm install --save-dev husky
npx husky install
npx husky add .husky/pre-commit "npm test"
npx husky add .husky/pre-commit "npm run lint"`
      });
    }

    return snippets;
  }

  private generatePlanMarkdown(): string {
    const metadata = this.generateMetadata();
    const taskGroups = this.groupTasksByPriority();

    let plan = '# DevEnvTemplate Hardening Plan\n\n';
    plan += `**Generated:** ${metadata.generatedAt}\n`;
    plan += `**Version:** ${metadata.version}\n\n`;
    plan += '> This plan outlines specific, actionable tasks to align your project with DevEnvTemplate standards.\n';
    plan += '> Tasks are prioritized by impact and include code snippets for quick implementation.\n\n';

    // Plan Summary
    plan += '## 📊 Plan Summary\n\n';
    plan += `- **Total Tasks:** ${metadata.totalTasks}\n`;
    plan += `- **Estimated Time:** ${metadata.totalEstimatedHours.toFixed(1)} hours\n`;
    plan += `- **Critical Tasks:** ${metadata.criticalTasks} 🔴\n`;
    plan += `- **Quick Wins:** ${metadata.quickWins} 💡 (low effort, high impact)\n\n`;
    plan += `**Breakdown:**\n`;
    plan += `- 🚨 High Priority: ${taskGroups.find(g => g.priority === 'high')?.tasks.length || 0} tasks\n`;
    plan += `- ⚠️ Medium Priority: ${taskGroups.find(g => g.priority === 'medium')?.tasks.length || 0} tasks\n`;
    plan += `- 💡 Low Priority: ${taskGroups.find(g => g.priority === 'low')?.tasks.length || 0} tasks\n\n`;

    // Quick Wins
    const quickWins = this.identifyQuickWins();
    if (quickWins.length > 0) {
      plan += '## 🚀 Quick Wins\n\n';
      plan += '*Start here for fast, high-impact improvements (≤30 min, high severity)*\n\n';
      quickWins.forEach(task => {
        plan += `- **Task ${task.number}**: ${task.title} (~${task.estimatedMinutes} min)\n`;
      });
      plan += '\n';
    }

    // Task Groups
    taskGroups.forEach(group => {
      plan += this.generateTaskGroupMarkdown(group);
    });

    // Implementation Guidelines
    plan += this.generateImplementationGuidelines();

    // Success Metrics
    plan += this.generateSuccessMetrics();

    // Resources
    plan += this.generateResources();

    plan += '---\n\n';
    plan += '*Auto-generated by DevEnvTemplate Plan Generator*\n';
    plan += '*Follow the [Prompt Lifecycle Guide](../docs/guides/prompt-lifecycle.md) for best results*\n';

    return plan;
  }

  private generateMetadata(): PlanMetadata {
    const totalMinutes = this.tasks.reduce((sum, task) => sum + task.estimatedMinutes, 0);
    const quickWins = this.identifyQuickWins();

    return {
      generatedAt: new Date().toISOString(),
      totalTasks: this.tasks.length,
      totalEstimatedHours: totalMinutes / 60,
      quickWins: quickWins.length,
      criticalTasks: this.tasks.filter(t => t.severity === 'high').length,
      version: '1.0.0'
    };
  }

  private groupTasksByPriority(): TaskGroup[] {
    const groups: TaskGroup[] = [
      {
        priority: 'high',
        title: '🚨 High Priority Tasks',
        description: 'Address these first for maximum impact on quality and security.',
        tasks: this.tasks.filter(t => t.priority === 'high'),
        totalEffort: 0,
        totalImpact: 0
      },
      {
        priority: 'medium',
        title: '⚠️ Medium Priority Tasks',
        description: 'Important improvements that enhance maintainability and developer experience.',
        tasks: this.tasks.filter(t => t.priority === 'medium'),
        totalEffort: 0,
        totalImpact: 0
      },
      {
        priority: 'low',
        title: '💡 Low Priority Tasks',
        description: 'Quality of life improvements that can be addressed when time allows.',
        tasks: this.tasks.filter(t => t.priority === 'low'),
        totalEffort: 0,
        totalImpact: 0
      }
    ];

    groups.forEach(group => {
      group.totalEffort = group.tasks.reduce((sum, task) => sum + task.estimatedMinutes, 0);
    });

    return groups;
  }

  private identifyQuickWins(): Task[] {
    return this.tasks.filter(task =>
      task.effort === 'low' && (task.severity === 'high' || task.severity === 'medium')
    );
  }

  private generateTaskGroupMarkdown(group: TaskGroup): string {
    if (group.tasks.length === 0) {
      return '';
    }

    let md = `## ${group.title}\n\n`;
    md += `${group.description}\n\n`;
    md += `*Total estimated time: ${(group.totalEffort / 60).toFixed(1)} hours*\n\n`;

    group.tasks.forEach(task => {
      md += this.generateTaskMarkdown(task);
    });

    return md;
  }

  private generateTaskMarkdown(task: Task): string {
    let md = `### Task ${task.number}: ${task.title}\n\n`;
    md += `${task.description}\n\n`;
    md += `| Property | Value |\n`;
    md += `|----------|-------|\n`;
    md += `| **Priority** | ${this.formatPriority(task.priority)} |\n`;
    md += `| **Effort** | ${task.effort} (~${task.estimatedMinutes} min) |\n`;
    md += `| **Category** | ${task.category} |\n`;
    md += `| **Priority Score** | ${task.priorityScore} |\n\n`;

    // Impact
    md += `**💥 Impact:**\n${task.impact}\n\n`;

    // Recommendation
    md += `**✅ Recommendation:**\n${task.recommendation}\n\n`;

    // Dependencies
    if (task.dependencies && task.dependencies.length > 0) {
      md += `**⚠️ Dependencies:**\n`;
      task.dependencies.forEach(dep => {
        const depTask = this.tasks.find(t => t.id === dep.taskId);
        if (depTask) {
          md += `- **Task ${depTask.number}** (${depTask.title}): ${dep.reason}\n`;
        }
      });
      md += '\n';
    }

    // Code Snippets
    if (task.codeSnippets && task.codeSnippets.length > 0) {
      md += `**📝 Implementation:**\n\n`;
      task.codeSnippets.forEach(snippet => {
        if (snippet.description) {
          md += `*${snippet.description}*\n\n`;
        }
        if (snippet.filename) {
          md += `\`${snippet.filename}\`:\n`;
        }
        md += `\`\`\`${snippet.language}\n${snippet.code}\n\`\`\`\n\n`;
      });
    }

    // Files to Create/Modify
    if (task.files && task.files.length > 0 && task.files[0] !== '[restructure directories]') {
      md += `**📁 Files to Create/Modify:**\n`;
      task.files.forEach(file => {
        md += `- [ ] \`${file}\`\n`;
      });
      md += '\n';
    }

    // Resources
    if (task.resources && task.resources.length > 0) {
      md += `**📚 Resources:**\n`;
      task.resources.forEach(resource => {
        md += `- ${resource}\n`;
      });
      md += '\n';
    }

    // Acceptance Criteria
    md += `**✅ Acceptance Criteria:**\n`;
    md += `- [ ] ${task.recommendation}\n`;
    md += `- [ ] Implementation tested and working\n`;
    md += `- [ ] Documentation updated if needed\n`;
    md += `- [ ] No regressions introduced\n`;
    md += `- [ ] Quality gates passing\n\n`;

    md += '---\n\n';

    return md;
  }

  private formatPriority(priority: string): string {
    const icons = {
      high: '🔴 High',
      medium: '🟡 Medium',
      low: '🟢 Low'
    };
    return icons[priority as keyof typeof icons] || priority;
  }

  private generateImplementationGuidelines(): string {
    let md = '## 🛠️ Implementation Guidelines\n\n';
    md += '### Using Cursor Plan Mode\n\n';
    md += '1. Open Cursor Plan Mode (Cmd/Ctrl + Shift + P)\n';
    md += '2. Copy the relevant task from this plan\n';
    md += '3. Attach the [stack report](.devenv/stack-report.json) for context\n';
    md += '4. Execute the plan step by step, using Agent Mode for implementation\n\n';

    md += '### Task Completion Workflow\n\n';
    md += '1. **Read** the task description and acceptance criteria\n';
    md += '2. **Check** dependencies - complete prerequisite tasks first\n';
    md += '3. **Implement** using the provided code snippets as a starting point\n';
    md += '4. **Test** your changes locally\n';
    md += '5. **Update** relevant documentation\n';
    md += '6. **Run** quality gates (`npm test`, `npm run lint`, etc.)\n';
    md += '7. **Commit** with a descriptive message\n';
    md += '8. **Mark** the task as complete in this plan\n\n';

    md += '### Rollback Strategy\n\n';
    md += 'If any changes cause issues:\n\n';
    md += '1. Revert the specific commit: `git revert <commit-hash>`\n';
    md += '2. Document the issue in an issue tracker\n';
    md += '3. Adjust the approach based on lessons learned\n';
    md += '4. Re-implement with improvements\n\n';

    return md;
  }

  private generateSuccessMetrics(): string {
    let md = '## 📈 Success Metrics\n\n';
    md += 'Track your progress with these metrics:\n\n';
    md += '- [ ] All high-priority tasks completed\n';
    md += '- [ ] CI pipeline green (all quality gates passing)\n';
    md += '- [ ] Code coverage maintained or improved\n';
    md += '- [ ] No new security vulnerabilities\n';
    md += '- [ ] Team feedback collected and positive\n';
    md += '- [ ] Documentation updated and accurate\n';
    md += '- [ ] Gap analysis shows improvement on re-run\n\n';

    return md;
  }

  private generateResources(): string {
    let md = '## 📚 Additional Resources\n\n';
    md += '- [Stack Report](.devenv/stack-report.json) - Current project stack detection\n';
    md += '- [Gap Analysis](.devenv/gaps-report.md) - Detailed gap analysis\n';
    md += '- [Engineering Handbook](../docs/engineering-handbook.md) - Best practices guide\n';
    md += '- [Cursor Plan Integration](../docs/guides/cursor-plan-integration.md) - Plan mode guide\n';
    md += '- [DevEnvTemplate README](../README.md) - Template documentation\n\n';

    return md;
  }

  public async saveReport(planContent: string, filename: string = 'hardening-plan.md'): Promise<void> {
    const devenvDir = path.join(this.rootDir, '.devenv');
    await fs.mkdir(devenvDir, { recursive: true });
    const planPath = path.join(devenvDir, filename);
    await fs.writeFile(planPath, planContent, 'utf8');
    this.logger.info(`Hardening plan saved to ${planPath}`);
  }
}

// CLI execution
if (require.main === module) {
  const generator = new PlanGenerator();
  generator.generate()
    .then(async (plan) => {
      console.log(plan);
      await generator.saveReport(plan);
    })
    .catch((error) => {
      console.error('Plan generation failed:', error.message);
      process.exit(1);
    });
}

export default PlanGenerator;

