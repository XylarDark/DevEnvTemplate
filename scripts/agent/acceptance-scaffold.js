#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs');
const path = require('path');

const program = new Command();

program
  .name('acceptance-scaffold')
  .description('Generate acceptance test scaffolds from context contract')
  .option('-c, --ctx <file>', 'Context contract JSON file', 'context-contract.json')
  .option('-o, --output <dir>', 'Output directory for test files', 'tests/acceptance')
  .action(async (options) => {
    const contextFilePath = path.resolve(options.ctx);

    if (!fs.existsSync(contextFilePath)) {
      console.error(`❌ Error: Context contract file not found at ${contextFilePath}`);
      process.exit(1);
    }

    try {
      const contextData = JSON.parse(fs.readFileSync(contextFilePath, 'utf8'));
      const outputDir = path.resolve(options.output);

      console.log(`📋 Generating acceptance tests from ${contextFilePath}`);
      console.log(`📁 Output directory: ${outputDir}`);

      // Ensure output directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Generate main acceptance test file
      const mainTestFile = path.join(outputDir, `${contextData.id || 'acceptance'}-tests.md`);
      const mainContent = generateMainAcceptanceFile(contextData);
      fs.writeFileSync(mainTestFile, mainContent, 'utf8');
      console.log(`✅ Generated: ${mainTestFile}`);

      // Generate individual test files for each acceptance test
      if (contextData.acceptanceTests && contextData.acceptanceTests.length > 0) {
        contextData.acceptanceTests.forEach((test, index) => {
          const testFile = path.join(outputDir, `${contextData.id || 'test'}-acceptance-${index + 1}.md`);
          const testContent = generateIndividualTestFile(contextData, test, index + 1);
          fs.writeFileSync(testFile, testContent, 'utf8');
          console.log(`✅ Generated: ${testFile}`);
        });
      }

      console.log(`\n🎉 Acceptance test scaffolds generated successfully!`);
      console.log(`\n📝 Next steps:`);
      console.log(`1. Review and customize the generated test files`);
      console.log(`2. Implement the tests in your preferred testing framework`);
      console.log(`3. Run tests to validate implementation meets acceptance criteria`);

    } catch (error) {
      console.error(`❌ Error generating acceptance tests: ${error.message}`);
      process.exit(1);
    }
  });

function generateMainAcceptanceFile(contextData) {
  const id = contextData.id || 'unknown';
  const title = contextData.problemStatement ?
    contextData.problemStatement.substring(0, 50) + (contextData.problemStatement.length > 50 ? '...' : '') :
    'Acceptance Tests';

  return `# Acceptance Tests: ${title}

**Context Contract:** ${id}
**Generated:** ${new Date().toISOString()}

## Overview

These acceptance tests validate that the implementation meets all requirements defined in the context contract.

## Context Summary

**Problem Statement:**
${contextData.problemStatement || 'Not specified'}

**Goals:**
${(contextData.goals || []).map(goal => `- ${goal}`).join('\n')}

**Constraints:**
${(contextData.constraints || []).map(constraint => `- ${constraint}`).join('\n')}

## Acceptance Test Summary

${(contextData.acceptanceTests || []).map((test, index) =>
  `${index + 1}. [${test.length > 80 ? test.substring(0, 80) + '...' : test}](./${id}-acceptance-${index + 1}.md)`
).join('\n')}

## Test Execution Checklist

${(contextData.acceptanceTests || []).map((test, index) =>
  `- [ ] **Test ${index + 1}:** ${test.substring(0, 60)}${test.length > 60 ? '...' : ''}`
).join('\n')}

## Success Criteria

- [ ] All acceptance tests pass
- [ ] No regressions introduced
- [ ] Performance requirements met (if specified)
- [ ] Accessibility requirements met (if specified)
- [ ] Documentation updated

## Implementation Notes

**Files Expected to Change (from impact analysis):**
${(contextData.impactAnalysis?.predictedFiles || []).map(file => `- \`${file}\``).join('\n') || 'Not specified'}

**Risk Level:** ${contextData.impactAnalysis?.riskAssessment || 'Not specified'}

## Stakeholders

${(contextData.stakeholders || []).map(stakeholder => `- [ ] **${stakeholder}** - Sign-off required`).join('\n')}

---

*Generated from context contract by DevEnvTemplate*
*See [Prompt Lifecycle Guide](../../docs/guides/prompt-lifecycle.md) for more information*
`;
}

function generateIndividualTestFile(contextData, testDescription, testNumber) {
  const id = contextData.id || 'unknown';

  return `# Acceptance Test ${testNumber}: ${id}

**Context Contract:** ${id}
**Test ID:** ${id}-acceptance-${testNumber}
**Generated:** ${new Date().toISOString()}

## Test Description

**Acceptance Criteria:**
${testDescription}

## Test Scenario

### Given
[Describe the initial state/conditions for this test]

### When
[Describe the action or event that triggers the behavior]

### Then
[Describe the expected outcome/behavior]

## Test Data

### Input Data
```json
{
  "example": "input data structure"
}
```

### Expected Output
```json
{
  "example": "expected output structure"
}
```

## Test Steps

1. [Step 1: Setup preconditions]
2. [Step 2: Execute the action]
3. [Step 3: Verify the outcome]
4. [Step 4: Cleanup if needed]

## Success Criteria

- [ ] Test passes in all environments (dev/staging/prod)
- [ ] Performance meets requirements (< 100ms response time)
- [ ] Error handling works correctly
- [ ] Edge cases are covered

## Edge Cases to Test

- [ ] [Edge case 1]
- [ ] [Edge case 2]
- [ ] [Edge case 3]

## Implementation Notes

**Related Code:**
- File: \`[path/to/relevant/file]\`
- Function: \`[function_name]\`
- Component: \`[component_name]\`

**Dependencies:**
- [Any external services/APIs required]
- [Database state requirements]
- [Authentication requirements]

## Automated Test Template

\`\`\`typescript
// tests/acceptance/${id}-acceptance-${testNumber}.test.ts

describe('Acceptance Test ${testNumber}: ${testDescription.substring(0, 50)}...', () => {
  test('should meet acceptance criteria', async () => {
    // Given
    const setupData = {
      // Test data setup
    };

    // When
    const result = await performAction(setupData);

    // Then
    expect(result).toMatchObject({
      success: true,
      // Expected outcome
    });
  });

  test('should handle edge case: [describe edge case]', async () => {
    // Edge case test
  });
});
\`\`\`

## Manual Test Checklist

- [ ] **Functional Test:** [How to manually verify]
- [ ] **UI Test:** [Visual checks if applicable]
- [ ] **Performance Test:** [Load/response time checks]
- [ ] **Accessibility Test:** [Screen reader, keyboard navigation]
- [ ] **Cross-browser Test:** [Browser compatibility]

## Test Results

**Status:** ⏳ Not executed

**Executed By:** [Name]
**Execution Date:** [Date]
**Environment:** [Dev/Staging/Prod]

### Results
- [ ] **PASS** - All criteria met
- [ ] **FAIL** - Issues found (see below)

### Issues Found
1. **Issue:** [Description]
   **Severity:** [Critical/High/Medium/Low]
   **Steps to Reproduce:** [Steps]
   **Expected vs Actual:** [Details]

### Screenshots/Artifacts
[Attach screenshots, logs, or other evidence]

---

*Generated from context contract by DevEnvTemplate*
*See [Prompt Lifecycle Guide](../../docs/guides/prompt-lifecycle.md) for more information*
`;
}

program.parse(process.argv);
