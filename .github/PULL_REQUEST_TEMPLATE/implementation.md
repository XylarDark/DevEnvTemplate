## Implementation PR: Plan Execution

**⚠️ This PR implements an APPROVED plan. Do not merge without plan approval.**

**Plan-Only PR:** [Link to approved plan-only PR or plan document]

---

## Context Contract Summary

**Context Contract ID:** [Link to context-contract.json file]

**Problem Statement:**
[Brief summary from context contract]

**Goals:**
- [Goal 1]
- [Goal 2]
- [Additional goals from contract]

## Plan Reference

**Approved Plan:** [Link to plan document or plan-only PR]

**Key Plan Elements:**
- [ ] All acceptance criteria from plan addressed
- [ ] Implementation follows approved approach
- [ ] No deviations from plan scope
- [ ] Risk mitigation strategies implemented

## Implementation Details

### Changes Made

[List the actual files changed and high-level what was implemented]

- **File:** `path/to/file.ts` - [What changed and why]
- **File:** `path/to/file.test.ts` - [Test coverage added]
- **File:** `path/to/docs.md` - [Documentation updated]

### Technical Approach

[Brief explanation of the technical solution chosen, referencing the approved plan]

### Acceptance Tests Implemented

[From the context contract acceptance tests - how were they verified?]

- [ ] [Test 1] - [How verified]
- [ ] [Test 2] - [How verified]
- [ ] [Additional tests]

## Quality Assurance

### Testing Completed

- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] End-to-end tests pass (if applicable)
- [ ] Performance tests meet requirements
- [ ] Accessibility tests pass (WCAG AA)

### Code Quality

- [ ] ESLint passes with no errors
- [ ] TypeScript compilation succeeds
- [ ] Code follows project conventions
- [ ] SOLID principles maintained
- [ ] No security vulnerabilities introduced

### Documentation

- [ ] Code is well-documented with comments
- [ ] README/API docs updated (if applicable)
- [ ] CHANGELOG updated with user-facing changes
- [ ] Migration guide added (if breaking changes)

## Risk Assessment

### Risks Addressed

[Reference risks identified in the plan and how they were mitigated]

- **Risk:** [From plan] - **Mitigation:** [How addressed]
- **Risk:** [From plan] - **Mitigation:** [How addressed]

### Rollback Plan

[From the approved plan - how to undo these changes if needed]

## DevEnvTemplate Validation

### Context Contract Validation

**Status:** ✅ **Passed** / ❌ **Failed** / ⚠️ **Warnings**

**Command Run:**
```bash
npm run agent:lint:context -c [contract-file].json
```

**Results:**
- [Context validation output]
- [Any warnings or issues addressed]

### Impact Analysis Validation

**Predicted vs Actual Changes:**

**Status:** ✅ **Aligned** / ⚠️ **Minor Deviations** / ❌ **Major Deviations**

**Command Run:**
```bash
npm run agent:impact -c [contract-file].json --compare-branch
```

**Analysis:**
- **Predicted Files:** [From plan]
- **Actual Files:** [From this PR]
- **Alignment:** [How well they match]

### Quality Gates

**Status:** ✅ **All Passed** / ⚠️ **Warnings** / ❌ **Failed**

**Command Run:**
```bash
npm run deploy:prepare
```

**Results:**
- Linting: ✅ Passed
- TypeScript: ✅ Passed
- Tests: ✅ Passed
- Security: ✅ Passed
- Performance: ✅ Passed

## CI/CD Status

**Context Guard:** ✅ **Passed** / ❌ **Failed**
- Contract validation: [Status]
- Plan gate check: [Status]
- Impact analysis: [Status]

**Quality Gates:** ✅ **Passed** / ❌ **Failed**
- Unit tests: [Coverage %]
- Integration tests: [Status]
- Security scan: [Status]
- Performance: [Status]

## Deployment Readiness

### Environment Testing

- [ ] Local development: ✅ Tested
- [ ] Staging environment: ✅ Tested
- [ ] Production simulation: ✅ Tested

### Rollback Verification

- [ ] Rollback procedure tested
- [ ] Data migration reversible
- [ ] Feature flags available (if needed)

## Stakeholder Sign-off

**Required Approvals:**
- [ ] Product Owner: [Name] - [Requirements validated]
- [ ] Engineering Lead: [Name] - [Technical approach approved]
- [ ] QA Lead: [Name] - [Testing coverage approved]
- [ ] Security: [Name] - [Security review completed]

## Post-Merge Actions

[What happens after this PR is merged]

- [ ] Monitor production metrics for [X] days
- [ ] User feedback collection plan
- [ ] Follow-up improvements identified
- [ ] Documentation published

## Metrics

**Implementation Metrics:**
- **Time to Complete:** [From plan approval to PR ready]
- **Test Coverage:** [Percentage added/maintained]
- **Lines Changed:** [Total diff size]
- **Files Modified:** [Count]

**Quality Metrics:**
- **Static Analysis:** [ESLint issues: 0]
- **Type Coverage:** [TypeScript strict mode: ✅]
- **Performance Impact:** [Budget compliance: ✅]

---

**Plan Approved:** [Date/Time of plan approval]
**Implementation Started:** [Date/Time]
**Implementation Complete:** [Date/Time]
**Testing Complete:** [Date/Time]

**Generated Context Pack:** `npm run agent:context -c [contract].json`
**Generated Prompt:** `npm run agent:prompt -c [contract].json -p plans/[plan].md`
**Acceptance Tests:** `npm run agent:acceptance-scaffold -c [contract].json`
