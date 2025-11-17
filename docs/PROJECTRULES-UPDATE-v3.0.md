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

## Cross-Stack Practices from Recent Projects

### 1. Dependencies & Native Engines

**Verify library identity before pinning**  
Before adding any dependency (especially native/physics engines or domain-specific libraries), confirm it is the correct project by checking:
- Official docs/homepage
- In a shell: `import <pkg>; dir(<pkg>)` to confirm expected classes
- Do not assume name similarity is sufficient

**Avoid hard-pinning unverified versions**  
Do not pin to versions that may not exist for your Python/platform (e.g. avoid `xyz==8.0.0` unless confirmed). Start with `>=` or unpinned versions until a working combination is verified in CI and local testing.

**Treat heavy/native engines as optional extras**  
Keep core `requirements.txt` limited to broadly available packages. Document native engines (PyChrono, physics libraries, etc.) under "Optional Dependencies" with explicit install commands (conda channels, platform constraints). Code must either:
- Fail fast with clear error if engine is truly required, or
- Provide simplified, pure-language fallback model that is covered by tests

### 2. DevEnvTemplate Integration

**Do not modify .devenv internals in project repos**  
Treat `.devenv/` as a vendored tool; do not change its `package.json` scripts or compiled `dist/` paths to "fix" doctor. Only use documented commands: `npm run doctor`, `npm run cleanup`, `npm run agent:init`.

**Follow the official build path**  
After copying DevEnvTemplate into `.devenv`:
- Run `npm install` then `npm run build`
- If `doctor` fails due to missing built files (e.g. `stack-detector` in `dist`), debug against upstream DevEnvTemplate repo instead of patching locally

**Do not gate core workflows on doctor until it passes once**
Use `doctor` as advisory in early stages. Only promote checks (e.g. doctor `--strict`) into required CI gates after a successful, repeatable run for that specific project.

**Keep commit messages project-neutral**
When committing changes to DevEnvTemplate, do not reference specific projects that use or contributed to the changes. Commit messages should be technology-agnostic and focus on the general improvements, not their origin. For example:
- ❌ "add cross-stack practices from lunar mining project"
- ✅ "docs: add cross-stack practices section to project rules"

### 3. Shell & OS Compatibility (Windows PowerShell)

**Avoid bash idioms in PowerShell**  
Do not use:
- `cmd1 && cmd2`
- `echo -e "..."`  
Use:
- `cmd1; cmd2` for sequencing
- `Write-Output` or `echo "..."` without `-e`

**One logical command per automation step**  
In DevEnvTemplate scripts or AI-driven tooling, avoid chaining multiple shell features in one call. Prefer `cd <dir>; <single command>` per invocation to avoid OS-specific parsing issues.

### 4. Unicode & Encoding

**Default to ASCII-safe output**  
Avoid non-ASCII characters in:
- CLI output (no emoji, superscripts, degree symbols)
- Markdown templates used for automated reports  
- Log messages and error strings
Use ASCII equivalents:
- `m/s^2` instead of `m/s²`
- `deg` instead of `°`  
- `->` or plain text instead of arrows

**Assume Windows console defaults (cp1252)**  
Only introduce UTF-8 text if files are explicitly opened with `encoding='utf-8'` and the environment/CI is configured to handle UTF-8.

### 5. String & Syntax Hygiene (Python)

**Never split string literals across lines without explicit `\n`**  
Do not write:
- `print("` on one line and `text")` on the next
Always use:
- `print("\nText")` or multiple `print(...)` calls

**One statement per line**  
Avoid multiple statements on a single line, especially in Python:
- Bad: `print("Results:")    print(value)`
- Good:
```python
print("Results:")
print(value)
```

**Compile new Python files before integrating**  
For any new or heavily edited module:
- Run `python -m py_compile file.py` and fix all syntax errors before wiring into main flows, CI, or DevEnvTemplate scripts

**Remove placeholder debug prints before merging**  
Temporary lines like `print(".4f")` must be removed or replaced with meaningful output before commits.

### 6. Modeling & Fallback Design

**Prototype with pure-language models before engine binding**  
Start with simple analytic/empirical models (e.g. physics equations in pure Python) that:
- Are fully testable without native libraries
- Have unit tests proving basic behavior
- Can serve as fallbacks when heavy engines are unavailable

**Make fallback behavior explicit and tested**  
If a fallback mode exists (e.g., simplified physics without native engine):
- Document it clearly in `README.md` and configuration comments
- Add tests that explicitly validate fallback behavior (not just "no exception")

### 7. CLI & UX Patterns

**Build CLI incrementally and test each subcommand**  
Add subcommands one at a time and test each:
- `python cli.py subcommand --help`
- `python cli.py subcommand --quiet` (smoke test)
Only then add the next subcommand.

**Keep default CLI output simple and ASCII**  
Defaults should avoid emoji and fancy formatting. If richer output is desired, add an opt-in flag (e.g. `--rich`), not the default behavior.

### 8. CI & DevEnvTemplate Usage

**Separate DevEnvTemplate checks from core CI until stable**  
Keep Python tests, type checks, and basic linting as primary CI gates. Keep `npm run doctor` steps as non-blocking (`continue-on-error: true`) until they consistently pass in that specific project.

**Use DevEnvTemplate primarily as a guide early on**
Interpret doctor output as recommendations, not absolute requirements, in early project phases. Only promote checks (e.g. doctor `--strict`) into required CI gates once they are reliable in that repo.

### 9. Cross-Stack Development Practices

**Avoid Unix-only shell utilities in cross-platform workflows**
Do not use Unix-specific commands (`wc`, `sed`, `awk`, `grep`) in automation scripts or tooling that may run on Windows/PowerShell. Prefer language-native solutions (Python `len()`, `re.sub()`, etc.) or explicit PowerShell equivalents (`Get-Content`, `Select-String`).

**Separate library modules from scripts and CLI entrypoints**
Keep reusable logic in proper package modules that can be imported and tested. Use script files (in `scripts/`, `bin/`, etc.) as thin entrypoints that import from the main package. This maintains clean boundaries between library code and command-line tooling.

**Keep public API surfaces small and intentional**
Limit the package's public API to a carefully curated set of stable functions. Use `__all__` declarations and maintain an API reference document as the single source of truth for what is considered public. Avoid exposing internal utilities or one-off helpers that may change.

**Build CLI commands as thin layers over tested core APIs**
Each CLI subcommand should primarily call into tested library functions, not implement new calling conventions. Add CLI options incrementally and test each with `--help` and basic smoke tests before proceeding to the next subcommand.

**Default to ASCII-safe output in automation contexts**
Keep CLI, log messages, and machine-consumed output free of non-ASCII characters (emoji, superscripts, degree symbols, arrows). Reserve rich formatting for opt-in flags (e.g., `--rich` or `--pretty`) to avoid encoding issues in CI and log aggregation systems.

**Ignore generated doctor artifacts in VCS**
Doctor writes `gaps-report.md`, `stack-report.json`, `health-report.json`, and similar files inside `.devenv/`. Add explicit entries to your project’s `.gitignore` so these reports don’t pollute diffs while keeping the `.devenv` repository itself versioned.

### 10. AI-Assisted Development Tooling

**Always re-read target files immediately before applying patches**
File contents may have changed since the initial read. Always perform a fresh read of the target file immediately before constructing a patch to ensure context accuracy.

**Use narrow, localized context for patch operations**
Limit context blocks to the immediate surrounding lines (3-5 lines) rather than large sections of the file. This reduces sensitivity to unrelated changes and improves patch reliability.

**Avoid multiple edits to the same region in a single session**
Do not apply multiple patches that affect overlapping or adjacent lines. Complete one logical change, verify it works, then proceed to the next. Use separate patch operations for distinct changes.

**Be cautious with markdown and structured text formatting**
Headings, code blocks, and list items can be sensitive to whitespace changes. When patching documentation, verify that the patched content maintains proper markdown structure and formatting.

📎 **Reference:** `docs/EMBEDDED-USAGE-ISSUES.md` captures current cross-stack issues and the guardrails we derived from them.

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

