const assert = require('assert');
const { describe, it, beforeEach, afterEach } = require('node:test');
const path = require('path');
const { promises: fs } = require('fs');
const os = require('os');
const { PlanGenerator } = require('../../scripts/tools/plan-generator');

describe('Plan Generator', () => {
  let rootDir;
  let devenvDir;
  let gapsReportPath;

  beforeEach(async () => {
    // Create a real temporary directory instead of mock-fs (Windows compatibility)
    rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'plan-gen-test-'));
    devenvDir = path.join(rootDir, '.devenv');
    gapsReportPath = path.join(devenvDir, 'gaps-report.md');
    
    // Create directory and basic gaps report
    await fs.mkdir(devenvDir, { recursive: true });
    await fs.writeFile(gapsReportPath, `# Gap Analysis Report

**Generated**: 2025-11-07T00:00:00.000Z

## Summary

Total Gaps: 3
- High Priority: 2
- Medium Priority: 1
- Low Priority: 0

---

## Gaps by Severity

### 🔴 TypeScript Not Configured

**Category:** typescript

TypeScript provides compile-time type checking and better IDE support.

**Impact:** Increased risk of runtime errors and reduced developer productivity.

**Recommendation:** Add TypeScript as a dev dependency and configure tsconfig.json with strict settings.

**Effort:** medium

**Files:** package.json, tsconfig.json

**Resources:**
- https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html

---

### 🔴 ESLint Not Configured

**Category:** linting

ESLint catches common errors and enforces code style consistency.

**Impact:** Code quality issues and style inconsistencies.

**Recommendation:** Install ESLint and configure it with recommended rules.

**Effort:** low

**Files:** .eslintrc.json, package.json

---

### 🟡 Missing Testing Framework

**Category:** testing

A testing framework is essential for maintaining code quality.

**Impact:** No automated tests means higher risk of bugs.

**Recommendation:** Use Node.js native test runner or install Jest.

**Effort:** medium

**Files:** tests/unit/example.test.js, package.json

---
`, 'utf8');
  });

  afterEach(async () => {
    // Clean up temp directory
    try {
      await fs.rm(rootDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  it('should throw error if gaps report is not found', async () => {
    // Delete the gaps report
    await fs.unlink(gapsReportPath);
    const generator = new PlanGenerator({ rootDir });
    await assert.rejects(generator.generate(), { message: 'Gaps report not found. Run gap-analyzer first.' });
  });

  it('should parse gaps from report correctly', async () => {
    const generator = new PlanGenerator({ rootDir });
    const plan = await generator.generate();
    
    // Check that plan contains all gaps
    assert.ok(plan.includes('TypeScript Not Configured'));
    assert.ok(plan.includes('ESLint Not Configured'));
    assert.ok(plan.includes('Missing Testing Framework'));
  });

  it('should group tasks by priority', async () => {
    const generator = new PlanGenerator({ rootDir });
    const plan = await generator.generate();
    
    // Check priority sections
    assert.ok(plan.includes('## 🚨 High Priority Tasks'));
    assert.ok(plan.includes('## ⚠️ Medium Priority Tasks'));
  });

  it('should include plan summary', async () => {
    const generator = new PlanGenerator({ rootDir });
    const plan = await generator.generate();
    
    assert.ok(plan.includes('## 📊 Plan Summary'));
    assert.ok(plan.includes('**Total Tasks:** 3'));
    assert.ok(plan.includes('**Critical Tasks:** 2'));
  });

  it('should calculate estimated time', async () => {
    const generator = new PlanGenerator({ rootDir });
    const plan = await generator.generate();
    
    // Should have estimated time in the summary (2 medium = 180 min, 1 low = 30 min, total = 210 min = 3.5 hours)
    assert.ok(plan.includes('**Estimated Time:**'));
    assert.ok(plan.match(/\*\*Estimated Time:\*\* \d+\.\d+ hours/));
  });

  it('should identify quick wins', async () => {
    const generator = new PlanGenerator({ rootDir });
    const plan = await generator.generate();
    
    // ESLint task is low effort + high severity = quick win
    assert.ok(plan.includes('## 🚀 Quick Wins'));
  });

  it('should include code snippets when enabled', async () => {
    const generator = new PlanGenerator({ rootDir, includeCodeSnippets: true });
    const plan = await generator.generate();
    
    // Should include TypeScript config snippet
    assert.ok(plan.includes('tsconfig.json'));
    assert.ok(plan.includes('```json'));
    assert.ok(plan.includes('"strict": true'));
  });

  it('should not include code snippets when disabled', async () => {
    const generator = new PlanGenerator({ rootDir, includeCodeSnippets: false });
    const plan = await generator.generate();
    
    // Should not have code blocks
    const codeBlockCount = (plan.match(/```/g) || []).length;
    assert.strictEqual(codeBlockCount, 0);
  });

  it('should calculate priority scores', async () => {
    const generator = new PlanGenerator({ rootDir, sortByPriority: true });
    const plan = await generator.generate();
    
    // Should include priority score in task details
    assert.ok(plan.includes('Priority Score'));
  });

  it('should detect dependencies between tasks', async () => {
    // Create a gaps report with TypeScript linting that depends on TypeScript config
    await fs.writeFile(gapsReportPath, `# Gap Analysis Report

### 🔴 TypeScript Not Configured

**Category:** typescript

TypeScript provides compile-time type checking.

**Impact:** Increased risk of runtime errors.

**Recommendation:** Add TypeScript as a dev dependency.

**Effort:** medium

**Files:** package.json, tsconfig.json

---

### 🔴 TypeScript ESLint Rules Missing

**Category:** linting

TypeScript-specific ESLint rules are missing.

**Impact:** TypeScript code may have style issues.

**Recommendation:** Install @typescript-eslint plugins.

**Effort:** low

**Files:** .eslintrc.json

---
`, 'utf8');

    const generator = new PlanGenerator({ rootDir, includeDependencies: true });
    const plan = await generator.generate();
    
    // Should detect that ESLint TypeScript rules depend on TypeScript being configured
    assert.ok(plan.includes('Dependencies:') || plan.includes('⚠️ Dependencies:'));
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
    
    assert.ok(plan.includes('## 🛠️ Implementation Guidelines'));
    assert.ok(plan.includes('Using Cursor Plan Mode'));
    assert.ok(plan.includes('Task Completion Workflow'));
    assert.ok(plan.includes('Rollback Strategy'));
  });

  it('should include success metrics', async () => {
    const generator = new PlanGenerator({ rootDir });
    const plan = await generator.generate();
    
    assert.ok(plan.includes('## 📈 Success Metrics'));
    assert.ok(plan.includes('All high-priority tasks completed'));
  });

  it('should include resources section', async () => {
    const generator = new PlanGenerator({ rootDir });
    const plan = await generator.generate();
    
    assert.ok(plan.includes('## 📚 Additional Resources'));
    assert.ok(plan.includes('Stack Report'));
    assert.ok(plan.includes('Gap Analysis'));
  });

  it('should handle empty gaps report', async () => {
    await fs.writeFile(gapsReportPath, `# Gap Analysis Report

No gaps found.
`, 'utf8');

    const generator = new PlanGenerator({ rootDir });
    const plan = await generator.generate();
    
    assert.ok(plan.includes('**Total Tasks:** 0'));
  });

  it('should sort tasks by priority score when enabled', async () => {
    const generator = new PlanGenerator({ rootDir, sortByPriority: true });
    const plan = await generator.generate();
    
    // ESLint (low effort, high severity) should appear before TypeScript (medium effort, high severity)
    const eslintIndex = plan.indexOf('ESLint Not Configured');
    const typescriptIndex = plan.indexOf('TypeScript Not Configured');
    
    // Both should be present
    assert.ok(eslintIndex > -1);
    assert.ok(typescriptIndex > -1);
    
    // Due to priority scoring, ESLint (high severity + low effort = score 30) should rank higher than
    // TypeScript (high severity + medium effort = score 20)
    assert.ok(eslintIndex < typescriptIndex, 'ESLint task should appear before TypeScript task when sorted by priority');
  });

  it('should include acceptance criteria for each task', async () => {
    const generator = new PlanGenerator({ rootDir });
    const plan = await generator.generate();
    
    assert.ok(plan.includes('✅ Acceptance Criteria:'));
    assert.ok(plan.includes('Implementation tested and working'));
    assert.ok(plan.includes('Documentation updated if needed'));
    assert.ok(plan.includes('Quality gates passing'));
  });

  it('should format task with table for properties', async () => {
    const generator = new PlanGenerator({ rootDir });
    const plan = await generator.generate();
    
    // Should use markdown table format
    assert.ok(plan.includes('| Property | Value |'));
    assert.ok(plan.includes('|----------|-------|'));
  });

  it('should include files to create/modify for each task', async () => {
    const generator = new PlanGenerator({ rootDir });
    const plan = await generator.generate();
    
    assert.ok(plan.includes('📁 Files to Create/Modify:'));
    assert.ok(plan.includes('package.json'));
    assert.ok(plan.includes('tsconfig.json'));
  });

  it('should include resource links from gaps', async () => {
    const generator = new PlanGenerator({ rootDir });
    const plan = await generator.generate();
    
    assert.ok(plan.includes('📚 Resources:'));
    assert.ok(plan.includes('https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html'));
  });

  it('should generate ESLint code snippet', async () => {
    const generator = new PlanGenerator({ rootDir, includeCodeSnippets: true });
    const plan = await generator.generate();
    
    // Should have ESLint configuration snippet
    assert.ok(plan.includes('.eslintrc.json'));
    assert.ok(plan.includes('eslint:recommended'));
  });

  it('should generate testing framework code snippet', async () => {
    const generator = new PlanGenerator({ rootDir, includeCodeSnippets: true });
    const plan = await generator.generate();
    
    // Should have test script snippet
    assert.ok(plan.includes('node --test'));
  });
});

