#!/usr/bin/env node

/**
 * Plan Generator - CI-only utility
 *
 * Generates a hardening plan from gap analysis results.
 * Creates actionable tasks for implementing DevEnvTemplate standards.
 */

const fs = require('fs').promises;
const path = require('path');

class PlanGenerator {
  constructor() {
    this.rootDir = process.cwd();
    this.gaps = [];
  }

  async generate() {
    console.log('📋 Generating hardening plan from gaps...');

    // Load gaps report
    try {
      const gapsReport = await fs.readFile(path.join(this.rootDir, '.devenv', 'gaps-report.md'), 'utf8');
      this.parseGaps(gapsReport);
    } catch (error) {
      throw new Error('Gaps report not found. Run gap-analyzer first.');
    }

    return this.generatePlan();
  }

  parseGaps(report) {
    // Simple parsing of the gaps report
    const lines = report.split('\n');
    let currentGap = null;

    for (const line of lines) {
      if (line.startsWith('### ')) {
        if (currentGap) {
          this.gaps.push(currentGap);
        }

        const titleMatch = line.match(/### [🔴🟡🟢] (.+)/);
        if (titleMatch) {
          currentGap = {
            title: titleMatch[1],
            severity: line.includes('🔴') ? 'high' : line.includes('🟡') ? 'medium' : 'low',
            description: '',
            impact: '',
            recommendation: '',
            effort: '',
            files: []
          };
        }
      } else if (currentGap) {
        if (line.startsWith('**Impact:**')) {
          currentGap.impact = line.replace('**Impact:**', '').trim();
        } else if (line.startsWith('**Recommendation:**')) {
          currentGap.recommendation = line.replace('**Recommendation:**', '').trim();
        } else if (line.startsWith('**Effort:**')) {
          currentGap.effort = line.replace('**Effort:**', '').trim();
        } else if (line.startsWith('**Files:**')) {
          currentGap.files = line.replace('**Files:**', '').trim().split(', ');
        } else if (line.trim() && !line.startsWith('**') && !line.startsWith('---') && currentGap.description === '') {
          currentGap.description = line.trim();
        }
      }
    }

    if (currentGap) {
      this.gaps.push(currentGap);
    }
  }

  generatePlan() {
    let plan = '# DevEnvTemplate Hardening Plan\n\n';
    plan += `Generated: ${new Date().toISOString()}\n\n`;
    plan += 'This plan outlines specific, actionable tasks to align your project with DevEnvTemplate standards.\n\n';
    plan += '## Plan Overview\n\n';
    plan += `Total tasks: ${this.gaps.length}\n\n`;

    // Group by priority
    const highPriority = this.gaps.filter(g => g.severity === 'high');
    const mediumPriority = this.gaps.filter(g => g.severity === 'medium');
    const lowPriority = this.gaps.filter(g => g.severity === 'low');

    // High priority tasks
    if (highPriority.length > 0) {
      plan += '## 🚨 High Priority Tasks\n\n';
      plan += 'Address these first for maximum impact on quality and security.\n\n';

      highPriority.forEach((gap, index) => {
        plan += this.generateTask(gap, index + 1, 'high');
      });
    }

    // Medium priority tasks
    if (mediumPriority.length > 0) {
      plan += '## ⚠️ Medium Priority Tasks\n\n';
      plan += 'Important improvements that enhance maintainability.\n\n';

      mediumPriority.forEach((gap, index) => {
        plan += this.generateTask(gap, highPriority.length + index + 1, 'medium');
      });
    }

    // Low priority tasks
    if (lowPriority.length > 0) {
      plan += '## 💡 Low Priority Tasks\n\n';
      plan += 'Quality of life improvements that can be addressed when time allows.\n\n';

      lowPriority.forEach((gap, index) => {
        plan += this.generateTask(gap, highPriority.length + mediumPriority.length + index + 1, 'low');
      });
    }

    plan += '## Implementation Guidelines\n\n';
    plan += '### Using Cursor Plan Mode\n\n';
    plan += '1. Open Cursor Plan Mode (Cmd/Ctrl + Shift + P)\n';
    plan += '2. Copy a relevant snippet from [Plan Mode Snippets](../docs/snippets/plan-mode/)\n';
    plan += '3. Attach the [stack report](../.devenv/stack-report.json) for context\n';
    plan += '4. Execute the plan step by step\n\n';

    plan += '### Task Completion\n\n';
    plan += '- Mark tasks complete as you finish them\n';
    plan += '- Update tests and documentation\n';
    plan += '- Run quality gates after each task\n';
    plan += '- Re-run gap analysis to verify improvements\n\n';

    plan += '### Rollback Plan\n\n';
    plan += 'If any changes cause issues:\n';
    plan += '1. Revert the specific commit\n';
    plan += '2. Document the issue\n';
    plan += '3. Adjust the approach before re-implementing\n\n';

    plan += '## Success Metrics\n\n';
    plan += '- [ ] All high-priority tasks completed\n';
    plan += '- [ ] CI passes without quality gate failures\n';
    plan += '- [ ] Code coverage maintained or improved\n';
    plan += '- [ ] No security vulnerabilities introduced\n';
    plan += '- [ ] Team feedback positive on improvements\n\n';

    plan += '## Resources\n\n';
    plan += '- [Stack Report](../.devenv/stack-report.json)\n';
    plan += '- [Gap Analysis](../.devenv/gaps-report.md)\n';
    plan += '- [Engineering Handbook](../docs/engineering-handbook.md)\n';
    plan += '- [Cursor Plan Integration](../docs/guides/cursor-plan-integration.md)\n\n';

    plan += '---\n\n';
    plan += '*Auto-generated by DevEnvTemplate plan generator*\n';
    plan += '*Follow [Prompt Lifecycle Guide](../docs/guides/prompt-lifecycle.md)*';

    return plan;
  }

  generateTask(gap, number, priority) {
    let task = `### Task ${number}: ${gap.title}\n\n`;
    task += `${gap.description}\n\n`;
    task += `**Priority:** ${priority}\n`;
    task += `**Effort:** ${gap.effort}\n`;
    task += `**Impact:** ${gap.impact}\n\n`;

    task += '**Acceptance Criteria:**\n';
    task += `- [ ] ${gap.recommendation}\n`;
    task += '- [ ] Implementation tested and working\n';
    task += '- [ ] Documentation updated if needed\n';
    task += '- [ ] No regressions introduced\n\n';

    if (gap.files && gap.files.length > 0 && gap.files[0] !== '[restructure directories]') {
      task += '**Files to Create/Modify:**\n';
      gap.files.forEach(file => {
        task += `- [ ] \`${file}\`\n`;
      });
      task += '\n';
    }

    task += '**Implementation Notes:**\n';
    task += '- Follow DevEnvTemplate patterns and conventions\n';
    task += '- Update tests to cover new functionality\n';
    task += '- Ensure accessibility compliance\n';
    task += '- Run quality gates after completion\n\n';

    task += '---\n\n';

    return task;
  }
}

// Run the plan generator
if (require.main === module) {
  const generator = new PlanGenerator();
  generator.generate().then(plan => {
    console.log(plan);
  }).catch(error => {
    console.error('Plan generation failed:', error.message);
    process.exit(1);
  });
}

module.exports = PlanGenerator;
