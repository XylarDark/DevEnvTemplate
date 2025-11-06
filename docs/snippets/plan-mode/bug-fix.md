# Bug Fix Plan Template

## Bug Report

**Bug ID:** [BUG-XXX or issue number]

**Title:** [Clear, descriptive title]

**Severity:** [Critical/High/Medium/Low]

**Context Contract ID:** [Link to context-contract.json]

## Problem Statement

[Describe the bug behavior. What should happen vs what actually happens? Include steps to reproduce.]

**Expected Behavior:**
[What the user expects to happen]

**Actual Behavior:**
[What actually happens]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Environment:**
- Browser/Device: [Details]
- OS: [Version]
- App Version: [Version]

## Root Cause Analysis

**Suspected Cause:**
[Based on investigation, what seems to be causing the issue?]

**Impact Assessment:**
- **Users Affected:** [Number or percentage]
- **Business Impact:** [Revenue, user experience, operations]
- **Data Impact:** [Any data corruption or loss?]

## Goals

- [ ] Bug is completely resolved
- [ ] No regressions introduced
- [ ] Root cause is identified and documented
- [ ] Similar issues are prevented (if applicable)

## Constraints

- **Timeline:** [Fix by date/time]
- **Scope:** [What can/cannot be changed]
- **Compatibility:** [Must work with existing systems]

## Impact Analysis

**Predicted Files to Change:**
- [File 1] - [Reason for change]
- [File 2] - [Reason for change]

**Risk Level:** [High/Medium/Low] - [Regression potential]

## Requirements

### Functional Requirements
- [ ] Bug behavior is eliminated
- [ ] Expected behavior works correctly
- [ ] Edge cases are handled

### Technical Requirements
- [ ] Follow DevEnvTemplate patterns
- [ ] Add regression test case
- [ ] Update error handling if needed
- [ ] Document root cause in code comments

### Quality Requirements
- [ ] Code passes all linting rules
- [ ] New test passes and doesn't break existing tests
- [ ] No security vulnerabilities introduced

## Implementation Plan

### Phase 1: Investigation & Fix
1. **Task 1:** Confirm root cause - [Estimated effort: 30m]
   - Acceptance Criteria: Root cause documented and verified
   - Dependencies: Access to reproduction environment

2. **Task 2:** Implement fix - [Estimated effort: 1h]
   - Acceptance Criteria: Bug behavior eliminated in test environment
   - Dependencies: Root cause confirmed

### Phase 2: Testing & Validation
3. **Task 3:** Add regression test - [Estimated effort: 30m]
4. **Task 4:** Test fix across environments - [Estimated effort: 1h]
5. **Task 5:** Verify no regressions - [Estimated effort: 30m]

## Success Metrics

- [ ] Bug reproduction steps no longer work
- [ ] Expected behavior works in all test scenarios
- [ ] Regression test added and passing
- [ ] Code review approves fix approach

## Rollback Strategy

**If fix causes issues:**
1. Revert commit [commit-hash]
2. Restore backup of affected files
3. Notify affected users of temporary workaround

## Testing Strategy

### Regression Test
```typescript
// Add to test suite
test('bug BUG-XXX is fixed', () => {
  // Test case that would have failed before fix
  expect(buggyFunction()).toBe(expectedResult);
});
```

### Edge Case Testing
- [Test case 1]: [Expected behavior]
- [Test case 2]: [Expected behavior]

## Risk Assessment

### High Risk Items
- **Regression Risk:** [Impact] - [Mitigation: Comprehensive testing]

### Medium Risk Items
- **Performance Impact:** [Impact] - [Mitigation: Performance testing]

## DevEnvTemplate Commands

```bash
# Create context contract for bug fix
npm run agent:questions -c bug-fix.json --interactive

# Analyze impact of fix
npm run agent:impact -c bug-fix.json

# Generate fix prompt
npm run agent:prompt -c bug-fix.json -p plans/bug-fix-plan.md

# Run quality checks
# Quality gates validated automatically in CI
```

## Timeline

- **Investigation Complete:** [Date/Time]
- **Fix Implemented:** [Date/Time]
- **Testing Complete:** [Date/Time]
- **Deployed:** [Date/Time]

## Stakeholders

- **Reporter:** [Name] - [Validation of fix]
- **QA:** [Name] - [Test coverage approval]
- **Engineering:** [Name] - [Code review]

## Related Issues

- [Issue/PR 1]: [Relationship]
- [Issue/PR 2]: [Relationship]
