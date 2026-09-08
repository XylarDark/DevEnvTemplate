const assert = require('assert');
const { describe, it, beforeEach, afterEach } = require('node:test');
const path = require('path');
const { promises: fs } = require('fs');
const os = require('os');
const { PlanGenerator } = require('../../scripts/tools/plan-generator');

/**
 * Builds a `.devenv/gaps-report.json` payload in the shape the gap analyzer emits.
 * The generator reads this structured report rather than re-parsing the markdown one,
 * so severity and effort arrive as data instead of as heading emoji.
 */
function buildGapsReport(gaps) {
  return {
    timestamp: '2026-01-01T00:00:00.000Z',
    totalGaps: gaps.length,
    highPriority: gaps.filter(g => g.severity === 'high').length,
    mediumPriority: gaps.filter(g => g.severity === 'medium').length,
    lowPriority: gaps.filter(g => g.severity === 'low').length,
    gaps,
    categories: gaps.reduce((acc, gap) => {
      acc[gap.category] = acc[gap.category] || [];
      acc[gap.category].push(gap);
      return acc;
    }, {}),
  };
}

const DEFAULT_GAPS = [
  {
    title: 'TypeScript Not Configured',
    category: 'typescript',
    severity: 'high',
    description: 'TypeScript provides compile-time type checking and better IDE support.',
    impact: 'Increased risk of runtime errors and reduced developer productivity.',
    recommendation:
      'Add TypeScript as a dev dependency and configure tsconfig.json with strict settings.',
    effort: 'medium',
    files: ['package.json', 'tsconfig.json'],
    resources: ['https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html'],
  },
  {
    title: 'ESLint Not Configured',
    category: 'linting',
    severity: 'high',
    description: 'ESLint catches common errors and enforces code style consistency.',
    impact: 'Code quality issues and style inconsistencies.',
    recommendation: 'Install ESLint and configure it with recommended rules.',
    effort: 'low',
    files: ['eslint.config.js', 'package.json'],
    resources: [],
  },
  {
    title: 'Missing Testing Framework',
    category: 'testing',
    severity: 'medium',
    description: 'A testing framework is essential for maintaining code quality.',
    impact: 'No automated tests means higher risk of bugs.',
    recommendation: 'Use Node.js native test runner or install Jest.',
    effort: 'medium',
    files: ['tests/unit/example.test.js', 'package.json'],
    resources: [],
  },
];

describe('Plan Generator', () => {
  let rootDir;
  let devenvDir;
  let gapsReportPath;

  async function writeGaps(gaps) {
    await fs.writeFile(gapsReportPath, JSON.stringify(buildGapsReport(gaps), null, 2), 'utf8');
  }

  beforeEach(async () => {
    // Use a real temporary directory instead of mock-fs (Windows compatibility)
    rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'plan-gen-test-'));
    devenvDir = path.join(rootDir, '.devenv');
    gapsReportPath = path.join(devenvDir, 'gaps-report.json');

    await fs.mkdir(devenvDir, { recursive: true });
    await writeGaps(DEFAULT_GAPS);
  });

  afterEach(async () => {
    try {
      await fs.rm(rootDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  it('should throw error if gaps report is not found', async () => {
    await fs.unlink(gapsReportPath);
    const generator = new PlanGenerator({ rootDir });
    await assert.rejects(generator.generate(), {
      message: 'Gaps report not found. Run gap-analyzer first.',
    });
  });

  it('should reject a gaps report that is not valid JSON', async () => {
    await fs.writeFile(gapsReportPath, '{ not json', 'utf8');
    const generator = new PlanGenerator({ rootDir });
    await assert.rejects(generator.generate(), {
      message: 'Gaps report not found. Run gap-analyzer first.',
    });
  });

  it('should load every gap from the report', async () => {
    const generator = new PlanGenerator({ rootDir });
    const plan = await generator.generate();

    assert.ok(plan.includes('TypeScript Not Configured'));
    assert.ok(plan.includes('ESLint Not Configured'));
    assert.ok(plan.includes('Missing Testing Framework'));
  });

  it('should group tasks by priority', async () => {
    const generator = new PlanGenerator({ rootDir });
    const plan = await generator.generate();

    assert.ok(plan.includes('## High Priority Tasks'));
    assert.ok(plan.includes('## Medium Priority Tasks'));
  });

  it('should honor severity from the structured report', async () => {
    const generator = new PlanGenerator({ rootDir });
    const plan = await generator.generate();

    // Two high and one medium gap. A regression that drops severity would report
    // everything as low, which is how the old markdown parser failed.
    assert.ok(plan.includes('- High Priority: 2 tasks'));
    assert.ok(plan.includes('- Medium Priority: 1 tasks'));
    assert.ok(plan.includes('- Low Priority: 0 tasks'));
    assert.ok(!plan.includes('## Low Priority Tasks'));
  });

  it('should include plan summary', async () => {
    const generator = new PlanGenerator({ rootDir });
    const plan = await generator.generate();

    assert.ok(plan.includes('## Plan Summary'));
    assert.ok(plan.includes('**Total Tasks:** 3'));
    assert.ok(plan.includes('**Critical Tasks:** 2'));
  });

  it('should calculate estimated time', async () => {
    const generator = new PlanGenerator({ rootDir });
    const plan = await generator.generate();

    assert.ok(plan.match(/\*\*Estimated Time:\*\* \d+\.\d+ hours/));
  });

  it('should identify quick wins', async () => {
    const generator = new PlanGenerator({ rootDir });
    const plan = await generator.generate();

    // The ESLint gap is low effort + high severity.
    assert.ok(plan.includes('## Quick Wins'));
    assert.ok(plan.includes('**Quick Wins:** 1'));
  });

  it('should include code snippets when enabled', async () => {
    const generator = new PlanGenerator({ rootDir, includeCodeSnippets: true });
    const plan = await generator.generate();

    assert.ok(plan.includes('tsconfig.json'));
    assert.ok(plan.includes('```json'));
    assert.ok(plan.includes('"strict": true'));
  });

  it('should not include code snippets when disabled', async () => {
    const generator = new PlanGenerator({ rootDir, includeCodeSnippets: false });
    const plan = await generator.generate();

    const codeBlockCount = (plan.match(/```/g) || []).length;
    assert.strictEqual(codeBlockCount, 0);
  });

  it('should calculate priority scores', async () => {
    const generator = new PlanGenerator({ rootDir, sortByPriority: true });
    const plan = await generator.generate();

    assert.ok(plan.includes('Priority Score'));
  });

  it('should detect dependencies between tasks', async () => {
    await writeGaps([
      {
        title: 'TypeScript Not Configured',
        category: 'typescript',
        severity: 'high',
        description: 'TypeScript provides compile-time type checking.',
        impact: 'Increased risk of runtime errors.',
        recommendation: 'Add TypeScript as a dev dependency.',
        effort: 'medium',
        files: ['package.json', 'tsconfig.json'],
        resources: [],
      },
      {
        title: 'TypeScript ESLint Rules Missing',
        category: 'linting',
        severity: 'high',
        description: 'TypeScript-specific ESLint rules are missing.',
        impact: 'TypeScript code may have style issues.',
        recommendation: 'Install @typescript-eslint plugins.',
        effort: 'low',
        files: ['eslint.config.js'],
        resources: [],
      },
    ]);

    const generator = new PlanGenerator({ rootDir, includeDependencies: true });
    const plan = await generator.generate();

    assert.ok(plan.includes('**Dependencies:**'));
    assert.ok(plan.includes('TypeScript must be configured before TypeScript ESLint rules'));
  });

  it('should save plan to file', async () => {
    const generator = new PlanGenerator({ rootDir });
    const plan = await generator.generate();
    await generator.saveReport(plan);

    const savedPlan = await fs.readFile(path.join(devenvDir, 'hardening-plan.md'), 'utf8');
    assert.strictEqual(savedPlan, plan);
  });

  it('should include implementation guidelines', async () => {
    const generator = new PlanGenerator({ rootDir });
    const plan = await generator.generate();

    assert.ok(plan.includes('## Implementation Guidelines'));
    assert.ok(plan.includes('Using Cursor Plan Mode'));
    assert.ok(plan.includes('Task Completion Workflow'));
    assert.ok(plan.includes('Rollback Strategy'));
  });

  it('should include success metrics', async () => {
    const generator = new PlanGenerator({ rootDir });
    const plan = await generator.generate();

    assert.ok(plan.includes('## Success Metrics'));
    assert.ok(plan.includes('All high-priority tasks completed'));
  });

  it('should include resources section', async () => {
    const generator = new PlanGenerator({ rootDir });
    const plan = await generator.generate();

    assert.ok(plan.includes('## Additional Resources'));
    assert.ok(plan.includes('Stack Report'));
    assert.ok(plan.includes('Gap Analysis'));
  });

  it('should handle a report with no gaps', async () => {
    await writeGaps([]);

    const generator = new PlanGenerator({ rootDir });
    const plan = await generator.generate();

    assert.ok(plan.includes('**Total Tasks:** 0'));
  });

  it('should sort tasks by priority score when enabled', async () => {
    const generator = new PlanGenerator({ rootDir, sortByPriority: true });
    const plan = await generator.generate();

    const eslintIndex = plan.indexOf('ESLint Not Configured');
    const typescriptIndex = plan.indexOf('TypeScript Not Configured');

    assert.ok(eslintIndex > -1);
    assert.ok(typescriptIndex > -1);

    // ESLint is high severity + low effort (score 30); TypeScript is high severity +
    // medium effort (score 20), so ESLint ranks first.
    assert.ok(
      eslintIndex < typescriptIndex,
      'ESLint task should appear before TypeScript task when sorted by priority'
    );
  });

  it('should include acceptance criteria for each task', async () => {
    const generator = new PlanGenerator({ rootDir });
    const plan = await generator.generate();

    assert.ok(plan.includes('**Acceptance Criteria:**'));
    assert.ok(plan.includes('Implementation tested and working'));
    assert.ok(plan.includes('Documentation updated if needed'));
    assert.ok(plan.includes('Quality gates passing'));
  });

  it('should format task with table for properties', async () => {
    const generator = new PlanGenerator({ rootDir });
    const plan = await generator.generate();

    assert.ok(plan.includes('| Property | Value |'));
    assert.ok(plan.includes('|----------|-------|'));
  });

  it('should include files to create/modify for each task', async () => {
    const generator = new PlanGenerator({ rootDir });
    const plan = await generator.generate();

    assert.ok(plan.includes('**Files to Create/Modify:**'));
    assert.ok(plan.includes('package.json'));
    assert.ok(plan.includes('tsconfig.json'));
  });

  it('should include resource links from gaps', async () => {
    const generator = new PlanGenerator({ rootDir });
    const plan = await generator.generate();

    assert.ok(plan.includes('**Resources:**'));
    assert.ok(
      plan.includes('https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html')
    );
  });

  it('should generate an ESLint flat config snippet', async () => {
    const generator = new PlanGenerator({ rootDir, includeCodeSnippets: true });
    const plan = await generator.generate();

    // ESLint 10 ignores .eslintrc.*, so the plan must recommend flat config.
    assert.ok(plan.includes('eslint.config.js'));
    assert.ok(plan.includes('js.configs.recommended'));
    assert.ok(!plan.includes('.eslintrc.json'));
  });

  it('should generate testing framework code snippet', async () => {
    const generator = new PlanGenerator({ rootDir, includeCodeSnippets: true });
    const plan = await generator.generate();

    assert.ok(plan.includes('node --test'));
  });

  it('should emit no mojibake in the generated plan', async () => {
    const generator = new PlanGenerator({ rootDir });
    const plan = await generator.generate();

    // The generator previously carried double-encoded emoji that rendered as garbage.
    assert.ok(!/[\u00c0-\u00ff][\u0080-\u017f]/.test(plan), 'plan contains mojibake sequences');
  });
});
