## Description

Brief description of the changes and what they accomplish.

## Scope Gate ✅

Complete this checklist before requesting review. See `.projectrules` for details.

- [ ] **New feature or setting?** [yes/no]
  - If yes, provide feature toggle details below
- [ ] **External domains/assets added?** [yes/no]
  - If yes, list domains/assets: [list]
- [ ] **Significant perf/a11y/SEO/security impact?** [none/low/medium/high]
  - If medium/high, provide mitigation details below
- [ ] **Feature toggle implemented?** [yes/no]
  - Setting ID: [id]
  - Default: [false]
  - Rollback plan: [how to disable/revert safely]

## Performance Budget 📊

Track asset changes and budget compliance (if applicable).

| Asset Type | Before | After | Budget | Status |
|------------|--------|-------|--------|--------|
| JS bundle | - | - | <100KB | ✅ |
| CSS bundle | - | - | <100KB | ✅ |
| Images | - | - | - | ✅ |
| Other | - | - | - | ✅ |

**Budget Notes:** [Any exceptions or mitigation plans]

## Testing 🧪

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated (if applicable)
- [ ] Manual testing completed
- [ ] Cross-browser testing (if UI)
- [ ] Accessibility testing (if UI)
- [ ] Performance testing (if applicable)

**Testing Notes:** [Specific test scenarios, edge cases covered]

## Screenshots/Artifacts 📸

<!-- Add screenshots for UI changes, before/after comparisons -->

## Session Review 🔄

Complete this section after each Plan→Agent development cycle.

### Changes Summary
- **Features Added:** [list]
- **Tests Written:** [list]
- **CI/Docs Updated:** [list]
- **Bugs Fixed:** [list]

### Errors/Workarounds Logged
- **Platform/Environment Errors:** [list any encountered]
- **Solutions Implemented:** [workarounds or fixes applied]

### Rules Deltas
- **Add/Modify/Remove in `.projectrules`:** [policies/guardrails/patterns]
- **Version Bump Required:** [yes/no] New version: [x.y]
- **Rationale:** [why changes are needed]

### Changelog Entry
- **Entry Added to `docs/rules-changelog.md`:** [yes/no]
- **Date/Version:** [YYYY-MM-DD - vx.y]
- **Highlights:** [summary of governance changes]

### Infrastructure Validation
- [ ] Git repo root validated (`git rev-parse --show-toplevel`)
- [ ] First push method verified (HTTPS by default; SSH only if configured)

## Breaking Changes 💥

- [ ] Breaking changes included
- [ ] Migration guide provided
- [ ] Documentation updated

**Breaking Change Details:** [describe impact and migration path]

## Additional Notes

[Any additional context, dependencies, or follow-up work]
