# Project Rules Update: v3.0.0 Optimization Lessons

**Date:** November 8, 2025  
**Version:** .projectrules v3.0  
**Commit:** d7afbe5

---

## Summary

Updated `.projectrules` to incorporate lessons learned from the v2.0.0 to v3.0.0 optimization cycle, which removed 210 files (-78% code) across 5 phases.

---

## Key Mistakes Addressed

### 1. PowerShell Compatibility Issues
**Mistake:** Used emoji characters in commit messages, causing PowerShell parse errors  
**Occurred:** 5+ times across multiple phases  
**Fix:** Added explicit rule to NEVER use emoji in commit messages

### 2. Missing Test Coverage Before Deletion
**Mistake:** Deleted performance/benchmark features before verifying test coverage  
**Occurred:** Phase 1.4  
**Fix:** Added "Test-Driven Deletions" pattern with 6-step process

### 3. Fixture Path References
**Mistake:** Deleted fixtures without checking test references  
**Occurred:** Phase 4 (4 test failures)  
**Fix:** Added "Fixture Management" pattern with grep-first approach

### 4. Import Path Errors
**Mistake:** Tests imported from wrong dist/ paths after TypeScript compilation  
**Occurred:** Phase 1  
**Fix:** Enhanced TypeScript adoption rules with post-compilation verification

### 5. No Incremental Testing
**Mistake:** Deleted 83 files without testing between subsections  
**Occurred:** Phase 1  
**Fix:** Added "Incremental approach" rule for large-scale refactoring

### 6. Dependency Cleanup Timing
**Mistake:** Left dependency cleanup until Phase 5, carrying 499 unused packages  
**Occurred:** Phases 1-4  
**Fix:** Added "Dependency cleanup first" rule in optimization workflow

### 7. Documentation Sync Timing
**Mistake:** Deferred documentation updates until Phase 3  
**Occurred:** Phases 1-2  
**Fix:** Added "Documentation sync" rule for immediate updates

---

## New Sections Added

### large_scale_refactoring
Comprehensive checklist for major codebase changes:
- Pre-refactor checklist (tests passing, timeouts, rollback plan)
- Incremental testing after every 10-20 file deletions
- Dependency cleanup before code removal
- Feature deletion order: Tests → Code → Dependencies → Documentation
- Version bumping guidance for breaking changes
- Fixture and import path validation
- Commit granularity for easier rollback
- Documentation sync timing

### optimization_workflow
Phase-based approach for large changes:
- Break into 5-7 phases maximum
- Test, commit, push after each phase
- Each phase independently revertable
- Dependencies cleaned up first, not last
- Documentation updated during relevant phase
- Maintain passing tests throughout
- Incremental validation every 10-20 files

---

## Enhanced Rules

### Windows/PowerShell Conventions
**Added:**
- NEVER use emoji in commit messages (causes parse errors)
- Escape special characters in strings
- Explicit warning about UTF-8 emoji encoding issues

**New Rule:**
- Commit message safety: Plain ASCII for cross-platform compatibility

### TypeScript Adoption
**Added:**
- Verify test imports use dist/ paths after compilation
- Create tests BEFORE implementing features when possible

**New Rule:**
- Post-compilation verification: Test all import path resolution

### Terminal Timeout Guidelines
**Added:**
- npm install without cache: 60+ seconds
- npm prune after major dep cleanup: 30+ seconds
- Test execution after refactor may be slower initially

---

## New Patterns

### Test-Driven Deletions
6-step process for safe feature removal:
1. Identify all references (grep)
2. Update/remove tests
3. Verify tests pass/skip
4. Delete feature code
5. Remove dependencies
6. Update documentation

### Fixture Management
Before deleting test fixtures:
1. Search all test files for fixture name
2. Update or skip affected tests
3. Verify tests pass
4. Delete fixture directory
5. Re-run full test suite

**Best Practices:**
- Use constants for fixture paths
- Grep for fixture directory name before deletion
- Prefer smaller fixtures over large generated ones

---

## Rule Changes Summary

| Section | Type | Count |
|---------|------|-------|
| New Sections | Added | 2 |
| Enhanced Rules | Modified | 5 |
| New Patterns | Added | 2 |
| New Guidelines | Added | 3 |
| **Total Changes** | | **12** |

---

## Impact

### Prevention
These rules will prevent:
- PowerShell parse errors from emoji in commit messages
- Test failures from deleting fixtures without checking references
- Build errors from wrong TypeScript import paths
- Regression risks from deleting code before tests
- Carrying technical debt through long refactors
- Documentation drift during large changes

### Guidance
These rules provide:
- Clear checklist for pre-refactor preparation
- Step-by-step process for safe feature deletion
- Phase-based workflow for large optimizations
- Incremental validation strategy
- Cross-platform compatibility guidance

---

## Validation

All 7 identified mistakes from the v3.0.0 optimization have corresponding rule updates:

- ✅ PowerShell compatibility (emoji, command chaining)
- ✅ Test coverage before deletion
- ✅ Fixture reference validation
- ✅ Import path verification
- ✅ Incremental testing strategy
- ✅ Dependency cleanup timing
- ✅ Documentation sync timing

---

## Usage

### For Large-Scale Refactoring
Follow the `large_scale_refactoring` section:
1. Complete pre-refactor checklist
2. Test after every 10-20 file deletions
3. Clean up dependencies first
4. Follow deletion order: Tests → Code → Deps → Docs
5. Use Test-Driven Deletions pattern
6. Validate fixtures before deletion
7. Commit each logical change
8. Update docs immediately

### For Multi-Phase Work
Follow the `optimization_workflow` section:
1. Break into 5-7 phases
2. Test, commit, push after each phase
3. Ensure each phase is independently revertable
4. Clean dependencies in Phase 1
5. Update docs during relevant phase
6. Maintain passing tests throughout
7. Validate incrementally (10-20 files)

---

## Future Improvements

These rules are now part of the continuous improvement cycle and will be updated based on:
- New optimization work
- Community feedback
- Platform-specific discoveries
- Tool evolution
- Best practice emergence

---

**Next Update:** When the next major refactoring or optimization cycle is completed, review and integrate new lessons learned.

