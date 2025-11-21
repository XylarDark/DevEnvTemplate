# DevEnvTemplate Bootstrap Guide

**Version:** Technology-Agnostic Template (Project Rules v3.0)  
**Purpose:** Single-file-loads-all reference for LLM-assisted development sessions  
**Last Updated:** 2025  
**Project Rules Version:** 3.0 (Last Synced: 2025-11-08)

> **For LLM Sessions:** Load this file at session start. This file contains all essential DevEnvTemplate information. Do NOT load README.md - this file includes essential README content to avoid redundancy.

---

## How to Use This File

**For LLM Sessions:**
1. **Load this file first** - It contains all essential DevEnvTemplate information
2. **Reference detailed docs** - Use links to dive deeper when needed
3. **Follow tool references** - All tools and commands are documented here

**For Human Developers:**
- See [README.md](README.md) for human-readable overview
- This file is optimized for LLM consumption

---

## Quick Start

### First-Time Setup

```bash
# 1. Clone DevEnvTemplate into your project
git clone https://github.com/XylarDark/DevEnvTemplate .devenv

# 2. Install and build
cd .devenv
npm install
npm run build

# 3. Initialize project (optional)
npm run agent:init

# 4. Run first health check
cd ..
npm run doctor --prefix .devenv
```

### Daily Workflow

```bash
# Check project health
npm run doctor --prefix .devenv

# Organize documentation files
devenv organize-docs --auto-fix

# Apply automatic fixes
npm run doctor --prefix .devenv -- --fix

# Run tests
npm run test --prefix .devenv

# Format code
npm run format --prefix .devenv
```

---

## Core Tools Reference

### DevEnvTemplate Tools (npm scripts)

| Command | Purpose | Usage |
|---------|---------|-------|
| `npm run doctor` | Health check and gap analysis | `npm run doctor --prefix .devenv` |
| `npm run doctor:fix` | Auto-fix detected issues | `npm run doctor:fix --prefix .devenv` |
| `npm run agent:init` | Interactive project setup | `npm run agent:init --prefix .devenv` |
| `npm run cleanup` | Remove template boilerplate (dry-run) | `npm run cleanup --prefix .devenv` |
| `npm run cleanup:apply` | Apply cleanup changes | `npm run cleanup:apply --prefix .devenv` |
| `devenv organize-docs` | Organize markdown files | `devenv organize-docs --auto-fix` |
| `npm run build` | Compile TypeScript | `npm run build --prefix .devenv` |
| `npm run test` | Run all tests | `npm run test --prefix .devenv` |
| `npm run test:fast` | Run unit tests only | `npm run test:fast --prefix .devenv` |
| `npm run format` | Format code with Prettier | `npm run format --prefix .devenv` |
| `npm run format:check` | Check code formatting | `npm run format:check --prefix .devenv` |

### Maintenance Tools (Embedded Usage)

| Command | Purpose | Usage |
|---------|---------|-------|
| `./scripts/sync-from-template.sh` | Sync with template updates (Bash) | `cd .devenv && ./scripts/sync-from-template.sh` |
| `.\scripts\sync-from-template.ps1` | Sync with template updates (PowerShell) | `cd .devenv && .\scripts\sync-from-template.ps1` |

**Note:** Sync scripts preserve project-specific files (health reports, gap analysis, etc.) while pulling template updates. See [SYNC.md](docs/SYNC.md) for detailed documentation.

### Doctor Command Flags

| Flag | Purpose | Example |
|------|---------|---------|
| `--fix` | Apply automatic fixes | `npm run doctor --prefix .devenv -- --fix` |
| `--no-install` | Skip dependency installation | `npm run doctor --prefix .devenv -- --fix --no-install` |
| `--preset <type>` | Override framework detection | `npm run doctor --prefix .devenv -- --preset nextjs` |
| `--dry-run` | Preview changes without applying | `npm run doctor --prefix .devenv -- --fix --dry-run` |
| `--strict` | Exit with code 1 on warnings (CI) | `npm run doctor --prefix .devenv -- --strict` |
| `--json` | Output results in JSON format | `npm run doctor --prefix .devenv -- --json` |
| `--debug` | Enable verbose logging | `npm run doctor --prefix .devenv -- --debug` |
| `--fast` | Fast mode (skips docs, accessibility, Docker) | `npm run doctor --prefix .devenv -- --fast` |
| `--full` | Full mode (default, all checks) | `npm run doctor --prefix .devenv -- --full` |

**Performance Notes:**
- `--fast` mode: ~200ms runtime, skips documentation/accessibility/Docker checks
- Default mode: Full analysis, use before releases/merges
- See [PERF-BASELINE.md](docs/PERF-BASELINE.md) for performance details

---

## Documentation Map

### Essential Documentation Files

#### LLM-Specific Documentation
| File | Purpose | When to Use |
|------|---------|-------------|
| `docs/LLM-CONTEXT-GUIDE.md` | Complete DevEnvTemplate command reference | Need detailed command documentation |
| `docs/LLM-REFERENCE.md` | Technology-agnostic template for project extensions | Creating project-specific LLM reference |
| `docs/LLM-FILE-INDEX.md` | Navigation checklist for LLMs | Starting new AI session, need file list |

#### Core Usage & Setup
| File | Purpose | When to Use |
|------|---------|-------------|
| `docs/USAGE.md` | Day-to-day workflows | Daily operations |
| `docs/SETUP-GUIDE.md` | Initial embedding instructions | First-time setup |
| `docs/EMBEDDED-USAGE.md` | Ongoing embedded usage | Using DevEnvTemplate after setup |
| `docs/SYNC.md` | Syncing with template updates | Maintaining sync with DevEnvTemplate |
| `docs/TROUBLESHOOTING.md` | Problem-solution guide | Encountering issues |

#### Development Standards & Practices
| File | Purpose | When to Use |
|------|---------|-------------|
| `docs/PROJECTRULES-UPDATE-v3.0.md` | Engineering rules and guidelines | Need coding standards, cross-platform compatibility |
| `docs/BEST-PRACTICES.md` | Technology-agnostic best practices | General development patterns, encryption, error handling |
| `docs/ARCHITECTURE.md` | Project structure and design | Understanding internals, tooling architecture |
| `docs/TOOLING-ARCHITECTURE.md` | Tooling design principles | Understanding why Node/TypeScript, contributor guidelines |
| `docs/PERF-BASELINE.md` | Performance benchmarks | Understanding fast mode, optimization targets |

#### Integration & Guides
| File | Purpose | When to Use |
|------|---------|-------------|
| `docs/guides/docs-organization.md` | Documentation organization guide | Organizing markdown files |
| `docs/guides/cursor-plan-integration.md` | Cursor IDE integration | Using with Cursor IDE |
| `docs/guides/python-best-practices.md` | Python-specific patterns | Working with Python projects |
| `docs/guides/troubleshooting.md` | Extended troubleshooting | Deep-dive problem solving |

#### Additional Development Resources
| File | Purpose | When to Use |
|------|---------|-------------|
| `docs/CONTRIBUTING.md` | Contribution guidelines | Contributing to DevEnvTemplate |
| `docs/REPOSITORY_STRUCTURE.md` | Repository organization | Understanding file layout |
| `docs/STRUCTURE.md` | Project structure details | Detailed structure reference |
| `docs/TOOL-RECOMMENDATIONS.md` | Recommended tooling | Choosing development tools |

### Documentation Organization

```
.devenv/
├── BOOTSTRAP.md              # This file (single-file-loads-all)
├── README.md                  # Human-readable overview
├── docs/                      # Main documentation
│   ├── LLM-CONTEXT-GUIDE.md  # Complete command reference
│   ├── LLM-REFERENCE.md      # Template for project extensions
│   ├── LLM-FILE-INDEX.md     # Navigation checklist
│   ├── USAGE.md              # Daily workflows
│   ├── SETUP-GUIDE.md        # Initial setup
│   ├── EMBEDDED-USAGE.md     # Ongoing usage
│   ├── TROUBLESHOOTING.md    # Problem solutions
│   ├── PROJECTRULES-UPDATE-v3.0.md  # Engineering rules
│   ├── BEST-PRACTICES.md     # Best practices
│   ├── ARCHITECTURE.md       # Project structure
│   └── archive/              # Historical documentation
├── scripts/                   # Source code and tools
│   ├── doctor/               # Health check CLI
│   ├── agent/                # Project initialization
│   ├── cleanup/              # Template cleanup
│   └── tools/                # Analysis tools
├── config/                    # Configuration files
│   ├── cleanup.config.yaml   # Cleanup rules
│   └── quality-budgets.json  # Quality thresholds
└── dist/                      # Compiled output (gitignored)
```

---

## Common Workflows

### Workflow 1: New Project Setup

```bash
# 1. Clone DevEnvTemplate
git clone https://github.com/XylarDark/DevEnvTemplate .devenv

# 2. Install and build
cd .devenv
npm install
npm run build

# 3. Initialize project
npm run agent:init

# 4. Run health check
cd ..
npm run doctor --prefix .devenv

# 5. Apply fixes
npm run doctor:fix --prefix .devenv

# 6. Clean up template artifacts
npm run cleanup:apply --prefix .devenv
```

### Workflow 2: Health Check & Fix

```bash
# 1. Assess current health
npm run doctor --prefix .devenv -- --json > .devenv/health-before.json

# 2. Preview fixes
npm run doctor --prefix .devenv -- --fix --dry-run

# 3. Apply fixes
npm run doctor:fix --prefix .devenv

# 4. Verify improvements
npm run doctor --prefix .devenv -- --json > .devenv/health-after.json
```

### Workflow 3: Pre-Deployment Quality Gate

```bash
# 1. Run strict health check
npm run doctor --prefix .devenv -- --strict

# 2. Run tests
npm run test --prefix .devenv

# 3. Check formatting
npm run format:check --prefix .devenv

# 4. Build project
npm run build --prefix .devenv
```

### Workflow 4: Continuous Integration

```bash
# CI workflow typically runs:
npm run build --prefix .devenv
npm run test --prefix .devenv
npm run doctor --prefix .devenv -- --strict --json
```

### Workflow 5: Sync with Template Updates

```bash
# Bash/Linux/macOS
cd .devenv
./scripts/sync-from-template.sh

# PowerShell/Windows
cd .devenv
.\scripts\sync-from-template.ps1
```

The sync script will:
- Preserve project-specific files (health reports, gap analysis, etc.)
- Pull updates from the template repository
- Rebuild the project after syncing

See [SYNC.md](docs/SYNC.md) for detailed sync documentation and troubleshooting.

---

## Development Workflow Patterns

### Fast Feedback Loops
```bash
# Quick health check (fast mode)
npm run doctor --prefix .devenv -- --fast

# Quick fixes without installs
npm run doctor --prefix .devenv -- --fix --no-install --fast
```

### Production Readiness Checks
```bash
# Full quality gate
npm run doctor --prefix .devenv -- --strict --full
npm run format:check --prefix .devenv
npm run test --prefix .devenv
npm run build --prefix .devenv
```

### Stack-Specific Workflows

**Node.js Projects:**
- Doctor detects: `package.json`, `node_modules/`
- Quick wins: Vitest setup, ESLint flat config, Playwright, lockfile checks
- See [USAGE.md](docs/USAGE.md) for Node-specific patterns

**Python Projects:**
- Doctor detects: `pyproject.toml`, `requirements.txt`, virtual environments
- Quick wins: Pytest config, Ruff linting, Black formatting, Mypy type checking
- Prefers: `pre-commit` hooks over Husky, experiment budgets for ML/simulation repos
- See [guides/python-best-practices.md](docs/guides/python-best-practices.md) for Python patterns

### Cross-Platform Considerations

**Windows PowerShell:**
- Use `;` instead of `&&` for command chaining
- Never use emoji in commit messages (causes parse errors)
- Use `Write-Output` or plain `echo` without `-e` flag
- See [PROJECTRULES-UPDATE-v3.0.md](docs/PROJECTRULES-UPDATE-v3.0.md) section 3

**Unix/Linux/macOS:**
- Standard bash patterns work as expected
- Can use `&&` for command chaining
- Standard shell utilities available

### Performance Optimization

**Fast Mode Usage:**
- Use `--fast` during active development for quick feedback (~200ms)
- Use default/full mode before commits, merges, and releases
- Fast mode skips: documentation checks, accessibility, Docker, git-hook validation
- See [PERF-BASELINE.md](docs/PERF-BASELINE.md) for benchmarks

**Tooling Architecture:**
- All DevEnvTemplate tooling runs on Node.js/TypeScript for cross-platform consistency
- Projects can keep native scripts (e.g., `scripts/check_env.py`) but shared tooling is TypeScript
- See [TOOLING-ARCHITECTURE.md](docs/TOOLING-ARCHITECTURE.md) for design rationale

---

## File Organization

### Where Files Are Located

- **Documentation**: `docs/` directory
- **Source Code**: `scripts/` directory
- **Configuration**: `config/` directory
- **Tests**: `tests/` directory
- **Compiled Output**: `dist/` directory (gitignored)
- **Generated Reports**: `.devenv/` in parent project (stack-report.json, gaps-report.md, etc.)

### Generated Files

When running doctor, these files are created in the parent project's `.devenv/` directory:
- `.devenv/stack-report.json` - Detected technologies and stack profile
- `.devenv/gaps-report.md` - Detailed gap analysis
- `.devenv/health-report.json` - Overall health scores
- `.devenv/health-before.json` - Health before fixes (if saved)
- `.devenv/health-after.json` - Health after fixes (if saved)

---

## LLM Integration Guide

### How LLMs Should Use This File

1. **Load at Session Start**: This file should be loaded first in new LLM sessions
2. **Reference When Needed**: Use this file to understand available tools and workflows
3. **Follow Workflows**: Execute complete workflows, not just single commands
4. **Check Documentation**: Use links to dive deeper into specific topics

### Decision Tree for LLMs

```
Start Session
  ↓
Load BOOTSTRAP.md
  ↓
Need detailed command reference?
  → Yes: Load docs/LLM-CONTEXT-GUIDE.md
  → No: Continue with BOOTSTRAP.md
  ↓
Working on project-specific code?
  → Yes: Load project's extended docs/LLM-REFERENCE.md
  → No: Continue with BOOTSTRAP.md
  ↓
Need to sync with template updates?
  → Yes: Use sync-from-template.sh/ps1 (see Workflow 5)
  → No: Continue with current workflow
  ↓
Encountering issues?
  → Yes: Load docs/TROUBLESHOOTING.md
  → No: Continue with current workflow
```

### Best Practices for LLMs

1. **Execute Complete Workflows**: Don't run single commands - execute full pipelines
2. **Use Appropriate Tools**: Reference tool documentation before using
3. **Check Health First**: Run `doctor` before making changes
4. **Verify After Changes**: Run `doctor` again to verify improvements
5. **Follow Engineering Rules**: See `docs/PROJECTRULES-UPDATE-v3.0.md` for coding standards
6. **Understand Template Relationship**: When working with embedded `.devenv/`, understand that sync scripts preserve project-specific files while pulling template updates
7. **Cross-Platform Compatibility**: Always consider Windows PowerShell and Unix shells - use `;` not `&&` in PowerShell, avoid emoji in commit messages
8. **Stack-Aware Development**: Once stack profile is detected, use stack-specific tooling (Node: Vitest/ESLint, Python: Pytest/Ruff/Black)
9. **Performance Optimization**: Use `--fast` mode for quick feedback loops, full mode for production checks
10. **AI-Assisted Patterns**: Re-read files before patching, use narrow context, avoid multiple edits to same region

---

## Project Rules & Governance

> **Source:** This section embeds the complete content from `.projectrules` (v3.0) in readable format. The `.projectrules` file is the structured source of truth for tools/CI, while this section provides LLM-friendly context. See "LLM Instructions: Auto-Sync .projectrules" below for automatic synchronization.

### Project Goals

- **Ship fast**: Optimize for quick iteration and deployment
- **Quality by default**: Automated testing, linting, CI/CD without manual setup
- **Free-tier first**: Optimize for GitHub free tier (2000 min/month Actions)
- **Solo-friendly**: No team workflows, no approval gates, no complex processes
- **Security baseline**: No credentials in repo; dependency scanning included
- **Keep it simple**: If it slows you down, it's not worth it

### Languages

- **Agnostic**: Rules apply regardless of technology stack
- **JavaScript**: ES2020+ vanilla JS, modular assets/, no frameworks (if applicable)
- **TypeScript**: Strict mode; ES2020 target; commonjs modules; declaration maps for debugging
- **CSS**: Utility-first, responsive design (if applicable)
- **JSON**: Configuration, locales, and structured data (if applicable)

### Guardrails

- **Secrets management**: Never commit API keys, tokens, or credentials; use environment variables or secret stores
- **Free-tier focus**: Prefer free services (GitHub Actions, Vercel, Railway); document paid services if needed
- **Testing standard**: Unit tests for new features; keep tests fast; fix broken tests immediately
- **Platform compatibility**: Scripts should work on Windows/macOS/Linux; test on your target platform
- **Security first**: Automated dependency scanning; fail builds on critical vulnerabilities; keep dependencies updated
- **Performance awareness**: Don't ship obviously slow code; profile if users report issues

### Code Style

- **Documentation**: Keep README and CONTRIBUTING aligned with current practices
- **Version control**: Conventional commits with scope; semantic versioning for releases
- **Error handling**: Graceful degradation; user feedback for failures
- **State management**: URL params for shareable states; secure storage for persistence
- **Accessibility (if UI)**: Keyboard navigation, focus management, ARIA labels, semantic HTML
- **Performance**: Lazy loading, critical path optimization, resource hints (if applicable)
- **TypeScript adoption**: Prefer TypeScript for core modules; strict mode enabled; compile to dist/; verify test imports use dist/ paths after compilation; create tests BEFORE implementing features when possible
- **Post-compilation verification**: After building TypeScript, run tests to verify all import paths resolve correctly to dist/ compiled output
- **Type definitions**: Create comprehensive interfaces in scripts/types/
- **Backward compatibility**: JavaScript wrappers for TypeScript modules during migration
- **Code duplication**: Use base classes and inheritance to eliminate duplicate code
- **Union Type Exhaustiveness**: Ensure TypeScript union types include all runtime values; add new values when code uses them
- **Type-Driven Development**: Let compile errors guide missing type definitions rather than runtime failures

### Files

- **Core governance**: `.projectrules`, `docs/rules-changelog.md` - never modify without review
- **CI/CD**: `.github/workflows/` - lint/test/governance stages
- **Scripts**: `scripts/` - governance checks, budget tracking, cross-platform
- **Documentation**: README.md, CONTRIBUTING.md, docs/rules-changelog.md
- **Testing**: Unit tests required; integration/schema optional per project

### Patterns

- **Scope Gate**: Required for new features/settings/external domains
- **Optional Feature Retention**: Remove unused features after 2 release cycles
- **Performance Budgets**: Define and track budgets; report-only to start
- **Cycle Closeout**: Post-cycle review checklist for continuous improvement
- **Testing Strategy**: Unit required; integration/schema optional; fast local loop
- **Documentation Standards**: Keep README/CONTRIBUTING current; changelog for rules evolution
- **Structured Logging**: Use createLogger() with context, levels (DEBUG/INFO/WARN/ERROR), JSON output for CI
- **Base Class Pattern**: Abstract base classes for shared logic; concrete implementations for specifics
- **Factory Pattern**: Registry pattern for instantiating implementations (e.g., package managers)
- **Inter-Tool Communication**: Use structured markdown fields (**Field:** value) for machine parsing between tools
- **Emoji Parsing**: Use string.includes() and string.replace() for emoji detection; avoid regex character classes with multi-byte UTF-8
- **Output Documentation**: Document expected output formats in TypeScript interfaces when tools produce machine-readable reports
- **Performance Metrics**: Opt-in performance tracking with PerformanceTracker; use --performance flag for detailed reports
- **Caching Strategy**: Enable by default (--cache); content-based invalidation with SHA-256; 1-hour TTL for config cache
- **Cache Optimization**: FileCache for content hashing; ConfigCache for parsed configurations; transparent speedup
- **Parallel Processing**: Use Promise.all batching with concurrency control for I/O-bound operations; default to CPU count for concurrency
- **Concurrency Control**: Implement worker pools with max concurrency limits; track batch execution in performance metrics
- **Memory Efficiency**: Process items in chunks, not all at once; validate memory usage with 1000+ item tests
- **Test-Driven Deletions**: Before removing features: 1) Identify all references (grep), 2) Update/remove tests, 3) Verify tests pass/skip, 4) Delete feature code, 5) Remove dependencies, 6) Update docs
- **Fixture Management**: Before deleting fixtures: 1) Search all test files for fixture name, 2) Update or skip affected tests, 3) Verify tests pass, 4) Delete fixture directory, 5) Re-run full test suite
- **Fixture References**: Use constants for fixture paths; grep for fixture directory name before deletion; prefer smaller fixtures over large generated ones

### Development Environment

- **CI Node version**: Standardize on Node 20.x LTS for all workflows (if applicable)
- **Error tracking**: Document environment-specific errors and add to session reports
- **Session reporting**: At end of development sessions, include errors and workarounds in PR descriptions
- **Platform testing**: Test critical commands on target environment before implementation
- **Command separation**: Use individual terminal commands instead of chained commands
- **Windows/PowerShell conventions**: Use `;` not `&&` for command chaining; prefer `Get-ChildItem -Force` over `ls -la`; use `$env:VAR='value'` for environment variables; NEVER use emoji in commit messages (causes parse errors); escape special characters in strings
- **Commit message safety**: Avoid emoji, special characters, and complex formatting in commit messages; use plain ASCII for cross-platform compatibility; PowerShell parsing errors with UTF-8 emojis
- **Git transport**: Prefer HTTPS by default for push operations; SSH optional with explicit host key configuration
- **Repo-root preflight**: Before first commit, run `git rev-parse --show-toplevel` and ensure it equals the project directory; fix before committing if not
- **Rules evolution**: Update rules after each Plan→Agent cycle with new patterns and best practices
- **Session review**: After each cycle, complete checklist: summarize changes, log errors/workarounds, document rule deltas, bump version, update changelog, link in PR
- **Build toolchain**: npm run build compiles TypeScript; npm run build:watch for development
- **Type checking**: npm run prebuild validates types before building
- **Log configuration**: LOG_LEVEL and LOG_JSON environment variables for structured logging
- **Windows test compatibility**: Prefer os.tmpdir() over /tmp for temp directories; avoid mock-fs for cross-platform tests
- **UTF-8 emoji handling**: Use literal emoji strings in code; test emoji parsing with actual characters
- **Performance tracking**: Use --performance flag for rule timing, memory usage, and optimization recommendations
- **Caching enabled**: Config parsing cached by default; use --no-cache to disable; 2-3x speedup on repeated runs
- **Terminal command timeouts**: Always monitor terminal execution time; cancel stalled commands based on expected operation duration (see terminal_timeout_guidelines)

### Terminal Timeout Guidelines

- **Quick operations (< 5 seconds)**: git status, git add, ls, cd, echo, simple file reads
- **Fast operations (5-15 seconds)**: npm install (with cache), git commit, git push (small changes), tsc --noEmit, linting
- **Medium operations (15-60 seconds)**: npm test (unit tests), npm run build, git clone (small repos)
- **Slow operations (1-3 minutes)**: npm test (integration tests), npm install (no cache), git push (large changes)
- **Very slow operations (3-10 minutes)**: npm test (full suite with E2E), large builds, CI workflows
- **Timeout policy**: If command exceeds 2x expected duration, cancel and investigate; never wait indefinitely
- **Stall detection**: If no output for 30 seconds on expected-fast operations, assume stall and cancel
- **Test execution**: Unit tests should complete in < 10 seconds; integration tests < 60 seconds; cancel if exceeded
- **User notification**: When canceling stalled commands, explain expected vs actual duration and next steps
- **Remediation**: After timeout, identify root cause (slow tests, infinite loops, blocking I/O) and fix before retrying
- **Long operations warning**: npm install without cache can take 60+ seconds; npm prune after major dep cleanup can take 30+ seconds; always check package count difference
- **Test execution after refactor**: First test run after major deletions may be slower due to module resolution; subsequent runs should be fast

### Advanced Patterns

- **Client-side filtering**: URL synchronization for bookmarkable states (if applicable)
- **Progressive enhancement**: Core functionality works without enhancements; enhanced with features
- **Defensive programming**: Safe fallbacks for missing data; graceful error handling
- **Resource hints optimization**: Strategic preconnect hints for external domains (if applicable)
- **Navigation announcements**: Screen reader feedback for all navigation changes (if applicable)
- **JSON-LD testing**: Comprehensive validation tests for structured data (if applicable)
- **Accessibility announcements**: Comprehensive screen reader support for all user actions (if applicable)

### Accessibility

- **WCAG AA compliance**: 4.5:1 contrast ratio, 3:1 for large text (if user-facing UI)
- **Keyboard navigation**: Tab order logical; Enter/Space activate controls
- **Screen readers**: ARIA labels, live regions, semantic HTML structure
- **Focus management**: Visible focus indicators, focus traps for modals
- **Motion sensitivity**: prefers-reduced-motion support (if applicable)
- **Color independence**: No color-only information conveyance
- **Error identification**: Clear labels, descriptions, and suggestions

### Performance

- **Core Web Vitals (if web UI)**: LCP < 2.5s, CLS < 0.1, FID < 100ms targets
- **Resource loading**: Preconnect to external domains; preload critical assets
- **Bundle optimization**: Defer non-critical assets; tree-shake unused code
- **Image optimization**: Lazy loading, modern formats, proper dimensions (if applicable)
- **Build performance**: Track and optimize build time; cache dependencies
- **Critical path**: Optimize loading of critical resources

### Testing

- **Unit tests**: Core utilities/modules/components; required for new code
- **Integration tests**: Critical flows or interfaces; optional per project
- **Schema/Contract**: Validate structured config/data against schemas (if applicable)
- **Accessibility**: Keyboard navigation, screen reader testing (if UI)
- **Performance**: Track budgets and surface regressions in CI
- **Cross-browser**: Modern browser support (last 2 versions)
- **Error states**: Network failures, missing data, invalid configurations
- **Local development**: Fast test loop; clear pass/fail feedback
- **Compilation**: Run tsc --noEmit before tests to catch type errors
- **Test strategy**: Import from compiled dist/ for backward compatibility
- **Cross-platform test isolation**: Use real temp directories (os.tmpdir + fs.mkdtemp) over mock-fs for Windows compatibility
- **Test cleanup**: Always use fs.rm with recursive:true and force:true in afterEach hooks
- **Emoji handling in tests**: Test with actual UTF-8 emoji characters, not ASCII approximations
- **Test data generation**: Generate fixtures from actual tool output, not assumed formats
- **Format validation**: Match test assertions to exact output format including markdown syntax
- **Performance tests**: Validate tracker accuracy, cache efficiency, and metric calculations
- **Async test patterns**: Use async/await in tests for time-based validations
- **Parallel testing**: Test concurrency limits, error handling, progress callbacks, and memory efficiency
- **Large fixtures**: Create 100+ file fixtures for performance testing; verify 2-3x speedup with parallel mode
- **Test timeouts**: All tests must have explicit timeouts; unit tests default 5s, integration 60s; use { timeout: ms } option
- **Timeout enforcement**: Remove or fix tests that consistently exceed timeouts; never increase timeouts to mask slow tests
- **Test isolation**: Each test should be independently runnable; avoid shared state that causes cascading failures
- **Slow test remediation**: Profile slow tests, cache expensive operations (schema compilation, fixture setup), or split into faster units

### Review

- **Pre-commit checks**: Lint, tests pass; clear pass/fail signal
- **Manual testing**: Critical flows tested; screenshots for UI changes (if applicable)
- **Performance check**: No significant regressions introduced
- **Documentation**: Update README for user-facing changes
- **Test coverage**: New features have tests; existing tests still pass
- **Quick validation**: Does it work? Is it tested? Is it documented?

### Contribution

- **Branch naming**: feat/, fix/, refactor/, perf/, docs/, test/, chore/ prefixes
- **Commit messages**: Conventional commits with scope (e.g., feat(auth): add login, fix(ui): resolve button focus)
- **PR requirements**: Description, testing notes, screenshots for UI changes (if applicable)
- **Breaking changes**: Document in commit message with migration notes
- **Open source friendly**: Clear descriptions, helpful for future contributors

### Commits

- **Format**: type(scope): description
- **Types**: feat, fix, refactor, perf, docs, test, chore
- **Scope**: feature area (e.g., ui/button, api/auth, docs/readme)
- **Breaking changes**: Add "BREAKING CHANGE:" footer with migration notes
- **Examples**: "feat(auth): add login validation", "fix(ui): resolve button focus trap"

### Policies

- **Testing Standard**: Unit tests for new features; integration tests optional; keep tests fast (< 5s unit, < 60s integration)
- **Security Baseline**: No credentials in repo; automated dependency scanning; fail builds on critical vulnerabilities
- **Free-Tier First**: Optimize CI for GitHub Actions free tier (< 2000 min/month); cache dependencies; parallel where beneficial
- **Performance Awareness**: Track build times; report slow tests; optimize bottlenecks as they appear
- **Git Best Practices**: Conventional commits (feat/fix/docs); HTTPS for push; clear commit messages
- **Quality Checks**: Automated linting, type checking, and testing on every push; fix before merge
- **Keep It Working**: Main branch should always be deployable; fix broken builds immediately
- **Documentation**: Update README for user-facing changes; keep docs simple and actionable
- **Dependency Management**: Review deps before adding; prefer standard library; keep dependencies minimal and updated

### Version Control

- **Rules versioning**: Update version number in header for major changes and phase completions
- **Change documentation**: Document rule modifications in commit messages
- **Backwards compatibility**: Avoid breaking changes; use deprecation warnings
- **Migration guide**: Update docs when rules change significantly
- **Error integration**: Incorporate documented errors into rules for continuous improvement
- **Environment updates**: Add platform-specific workarounds and compatibility notes
- **Pattern documentation**: Update patterns section when new architectural patterns emerge
- **Session-driven updates**: Review each development session and update rules with new optimizations
- **Advanced practices**: Add advanced_patterns section for complex implementation strategies
- **Cycle closeout**: Formal post-cycle review process to maintain standards evolution

### Large Scale Refactoring

- **Pre-refactor checklist**: Full test suite passing; all tests have timeouts; clear rollback plan
- **Incremental approach**: Test after each major subsection (e.g., every 10-20 file deletions)
- **Dependency cleanup first**: Remove unused deps before removing code to avoid carrying dead weight
- **Feature deletion order**: Tests → Code → Dependencies → Documentation (reverse of creation)
- **Version bumping**: Major version for breaking changes; document all removals in BREAKING CHANGE
- **Fixture validation**: Grep for fixture references before deletion; update tests first
- **Import path verification**: After TypeScript compilation, verify test imports from dist/
- **Commit granularity**: One logical change per commit; easier rollback and review
- **Documentation sync**: Update docs immediately after removing features, not at end

### Optimization Workflow

- **Phase planning**: Break large changes into 5-7 phases max; each phase should be independently testable
- **Phase boundaries**: Test, commit, and push after each phase completion; tag major milestones
- **Rollback readiness**: Each phase should be independently revertable without breaking functionality
- **Dependency timing**: Clean up unused dependencies in first phase, not last
- **Documentation timing**: Update user-facing docs during relevant phase, not deferred to end
- **Test suite health**: Maintain passing tests throughout; never proceed with failing tests
- **Incremental validation**: Build and test after every major change (10-20 files or key feature)

### Cycle Closeout

- **Quick Review**: Before merging, verify:
  - [ ] Changes work as expected
  - [ ] Tests pass
  - [ ] Docs updated (if user-facing change)
  - [ ] No secrets committed
  - [ ] Build/deploy still works
- **That's it! Keep it simple.**

---

## LLM Instructions: Auto-Sync .projectrules

> **When to Execute**: After loading BOOTSTRAP.md, automatically check and sync `.projectrules` file if needed.

### Step-by-Step Sync Process

#### Step 1: Check if .projectrules Exists

```bash
# Check if .projectrules file exists in project root
if [ ! -f .projectrules ]; then
  echo ".projectrules not found - will create from template"
  CREATE_NEW=true
else
  echo ".projectrules exists - will check for updates"
  CREATE_NEW=false
fi
```

**LLM Action**: Read the project root directory and check for `.projectrules` file.

#### Step 2: Compare Versions

If `.projectrules` exists, extract and compare version numbers:

```bash
# Extract version from .projectrules header
# Look for: "# Version: 3.0" or similar pattern
VERSION_IN_FILE=$(grep -E "^# Version:" .projectrules | head -1 | sed 's/.*Version: *//' | sed 's/ -.*//')

# Compare with BOOTSTRAP.md version (v3.0)
BOOTSTRAP_VERSION="3.0"

if [ "$VERSION_IN_FILE" != "$BOOTSTRAP_VERSION" ]; then
  echo "Version mismatch: .projectrules has $VERSION_IN_FILE, BOOTSTRAP.md has $BOOTSTRAP_VERSION"
  NEEDS_UPDATE=true
fi
```

**LLM Action**: Parse the version number from `.projectrules` header (line 2: `# Version: 3.0`) and compare with BOOTSTRAP.md version (v3.0).

#### Step 3: Detect Mismatches

Compare key sections between `.projectrules` and the embedded rules in BOOTSTRAP.md:

**Key Sections to Compare:**
- `project_goals` - Should match Project Goals section
- `guardrails` - Should match Guardrails section
- `code_style` - Should match Code Style section
- `patterns` - Should match Patterns section (especially critical ones like Test-Driven Deletions, Fixture Management)
- `development_environment` - Should match Development Environment section
- `testing` - Should match Testing section

**LLM Action**: 
1. Read `.projectrules` file
2. Compare each section with the corresponding section in BOOTSTRAP.md
3. Identify any differences in:
   - Missing rules
   - Different rule content
   - Additional project-specific customizations (preserve these)

#### Step 4: Update if Needed

If mismatches are detected or file doesn't exist:

**For New Files:**
- Create `.projectrules` using the template below
- Use the exact YAML-like format shown in the template section

**For Existing Files:**
- Update only the sections that match the BOOTSTRAP.md template
- Preserve any project-specific customizations that don't conflict
- Update the version number in the header
- Update the "Last Updated" date

**LLM Action**: Generate updated `.projectrules` content, preserving project-specific additions while syncing core rules.

#### Step 5: Skip if Aligned

If `.projectrules` exists, version matches, and all key sections align with BOOTSTRAP.md:

**Skip Update**: No action needed. Log: "`.projectrules` is up to date with BOOTSTRAP.md (v3.0)"

**LLM Action**: If version matches and content comparison shows no significant differences, skip the update step.

#### Step 6: Preserve Project-Specific Customizations

When updating, only modify sections that exist in the BOOTSTRAP.md template. If `.projectrules` contains:
- Additional sections not in template → Keep them
- Project-specific rules in existing sections → Keep them if they don't conflict
- Custom patterns or policies → Preserve them

**LLM Action**: Use a merge strategy that:
1. Updates core sections from BOOTSTRAP.md template
2. Preserves additional sections
3. Preserves non-conflicting customizations within core sections

---

## .projectrules Template

> **Format**: This is the canonical YAML-like format that tools/CI expect. Use this exact structure when creating or updating `.projectrules`.

```yaml
# Development Best Practices for Indie Developers
# Version: 3.0 - Doctor Mode Focus + Optimization Lessons
# Last Updated: 2025-11-08
# Purpose: Quality-first development for indie devs, solo founders, and small teams
# Changelog: v3.0.0 optimization lessons (Phases 1-5) integrated
#
# Quick Links:
# - README: ../README.md
# - Market Positioning: docs/market-positioning.md
# - Rules Changelog: docs/rules-changelog.md

project_goals:
  - Ship fast: Optimize for quick iteration and deployment.
  - Quality by default: Automated testing, linting, CI/CD without manual setup.
  - Free-tier first: Optimize for GitHub free tier (2000 min/month Actions).
  - Solo-friendly: No team workflows, no approval gates, no complex processes.
  - Security baseline: No credentials in repo; dependency scanning included.
  - Keep it simple: If it slows you down, it's not worth it.

languages:
  - agnostic: Rules apply regardless of technology stack.
  - javascript: ES2020+ vanilla JS, modular assets/, no frameworks (if applicable).
  - typescript: Strict mode; ES2020 target; commonjs modules; declaration maps for debugging.
  - css: Utility-first, responsive design (if applicable).
  - json: Configuration, locales, and structured data (if applicable).

guardrails:
  - Secrets management: Never commit API keys, tokens, or credentials; use environment variables or secret stores.
  - Free-tier focus: Prefer free services (GitHub Actions, Vercel, Railway); document paid services if needed.
  - Testing standard: Unit tests for new features; keep tests fast; fix broken tests immediately.
  - Platform compatibility: Scripts should work on Windows/macOS/Linux; test on your target platform.
  - Security first: Automated dependency scanning; fail builds on critical vulnerabilities; keep dependencies updated.
  - Performance awareness: Don't ship obviously slow code; profile if users report issues.

code_style:
  - Documentation: Keep README and CONTRIBUTING aligned with current practices.
  - Version control: Conventional commits with scope; semantic versioning for releases.
  - Error handling: Graceful degradation; user feedback for failures.
  - State management: URL params for shareable states; secure storage for persistence.
  - Accessibility (if UI): Keyboard navigation, focus management, ARIA labels, semantic HTML.
  - Performance: Lazy loading, critical path optimization, resource hints (if applicable).
  - TypeScript adoption: Prefer TypeScript for core modules; strict mode enabled; compile to dist/; verify test imports use dist/ paths after compilation; create tests BEFORE implementing features when possible.
  - Post-compilation verification: After building TypeScript, run tests to verify all import paths resolve correctly to dist/ compiled output.
  - Type definitions: Create comprehensive interfaces in scripts/types/.
  - Backward compatibility: JavaScript wrappers for TypeScript modules during migration.
  - Code duplication: Use base classes and inheritance to eliminate duplicate code.
  - Union Type Exhaustiveness: Ensure TypeScript union types include all runtime values; add new values when code uses them.
  - Type-Driven Development: Let compile errors guide missing type definitions rather than runtime failures.

files:
  - Core governance: .projectrules, docs/rules-changelog.md - never modify without review.
  - CI/CD: .github/workflows/ - lint/test/governance stages.
  - Scripts: scripts/ - governance checks, budget tracking, cross-platform.
  - Documentation: README.md, CONTRIBUTING.md, docs/rules-changelog.md.
  - Testing: Unit tests required; integration/schema optional per project.

patterns:
  - Scope Gate: Required for new features/settings/external domains.
  - Optional Feature Retention: Remove unused features after 2 release cycles.
  - Performance Budgets: Define and track budgets; report-only to start.
  - Cycle Closeout: Post-cycle review checklist for continuous improvement.
  - Testing Strategy: Unit required; integration/schema optional; fast local loop.
  - Documentation Standards: Keep README/CONTRIBUTING current; changelog for rules evolution.
  - Structured Logging: Use createLogger() with context, levels (DEBUG/INFO/WARN/ERROR), JSON output for CI.
  - Base Class Pattern: Abstract base classes for shared logic; concrete implementations for specifics.
  - Factory Pattern: Registry pattern for instantiating implementations (e.g., package managers).
  - Inter-Tool Communication: Use structured markdown fields (**Field:** value) for machine parsing between tools.
  - Emoji Parsing: Use string.includes() and string.replace() for emoji detection; avoid regex character classes with multi-byte UTF-8.
  - Output Documentation: Document expected output formats in TypeScript interfaces when tools produce machine-readable reports.
  - Performance Metrics: Opt-in performance tracking with PerformanceTracker; use --performance flag for detailed reports.
  - Caching Strategy: Enable by default (--cache); content-based invalidation with SHA-256; 1-hour TTL for config cache.
  - Cache Optimization: FileCache for content hashing; ConfigCache for parsed configurations; transparent speedup.
  - Parallel Processing: Use Promise.all batching with concurrency control for I/O-bound operations; default to CPU count for concurrency.
  - Concurrency Control: Implement worker pools with max concurrency limits; track batch execution in performance metrics.
  - Memory Efficiency: Process items in chunks, not all at once; validate memory usage with 1000+ item tests.
  - Test-Driven Deletions: Before removing features: 1) Identify all references (grep), 2) Update/remove tests, 3) Verify tests pass/skip, 4) Delete feature code, 5) Remove dependencies, 6) Update docs.
  - Fixture Management: Before deleting fixtures: 1) Search all test files for fixture name, 2) Update or skip affected tests, 3) Verify tests pass, 4) Delete fixture directory, 5) Re-run full test suite.
  - Fixture References: Use constants for fixture paths; grep for fixture directory name before deletion; prefer smaller fixtures over large generated ones.

development_environment:
  - CI Node version: Standardize on Node 20.x LTS for all workflows (if applicable).
  - Error tracking: Document environment-specific errors and add to session reports.
  - Session reporting: At end of development sessions, include errors and workarounds in PR descriptions.
  - Platform testing: Test critical commands on target environment before implementation.
  - Command separation: Use individual terminal commands instead of chained commands.
  - Windows/PowerShell conventions: Use `;` not `&&` for command chaining; prefer `Get-ChildItem -Force` over `ls -la`; use `$env:VAR='value'` for environment variables; NEVER use emoji in commit messages (causes parse errors); escape special characters in strings.
  - Commit message safety: Avoid emoji, special characters, and complex formatting in commit messages; use plain ASCII for cross-platform compatibility; PowerShell parsing errors with UTF-8 emojis.
  - Git transport: Prefer HTTPS by default for push operations; SSH optional with explicit host key configuration.
  - Repo-root preflight: Before first commit, run `git rev-parse --show-toplevel` and ensure it equals the project directory; fix before committing if not.
  - Rules evolution: Update rules after each Plan→Agent cycle with new patterns and best practices.
  - Session review: After each cycle, complete checklist: summarize changes, log errors/workarounds, document rule deltas, bump version, update changelog, link in PR.
  - Build toolchain: npm run build compiles TypeScript; npm run build:watch for development.
  - Type checking: npm run prebuild validates types before building.
  - Log configuration: LOG_LEVEL and LOG_JSON environment variables for structured logging.
  - Windows test compatibility: Prefer os.tmpdir() over /tmp for temp directories; avoid mock-fs for cross-platform tests.
  - UTF-8 emoji handling: Use literal emoji strings in code; test emoji parsing with actual characters.
  - Performance tracking: Use --performance flag for rule timing, memory usage, and optimization recommendations.
  - Caching enabled: Config parsing cached by default; use --no-cache to disable; 2-3x speedup on repeated runs.
  - Terminal command timeouts: Always monitor terminal execution time; cancel stalled commands based on expected operation duration (see terminal_timeout_guidelines).

terminal_timeout_guidelines:
  - Quick operations (< 5 seconds): git status, git add, ls, cd, echo, simple file reads
  - Fast operations (5-15 seconds): npm install (with cache), git commit, git push (small changes), tsc --noEmit, linting
  - Medium operations (15-60 seconds): npm test (unit tests), npm run build, git clone (small repos)
  - Slow operations (1-3 minutes): npm test (integration tests), npm install (no cache), git push (large changes)
  - Very slow operations (3-10 minutes): npm test (full suite with E2E), large builds, CI workflows
  - Timeout policy: If command exceeds 2x expected duration, cancel and investigate; never wait indefinitely
  - Stall detection: If no output for 30 seconds on expected-fast operations, assume stall and cancel
  - Test execution: Unit tests should complete in < 10 seconds; integration tests < 60 seconds; cancel if exceeded
  - User notification: When canceling stalled commands, explain expected vs actual duration and next steps
  - Remediation: After timeout, identify root cause (slow tests, infinite loops, blocking I/O) and fix before retrying
  - Long operations warning: npm install without cache can take 60+ seconds; npm prune after major dep cleanup can take 30+ seconds; always check package count difference
  - Test execution after refactor: First test run after major deletions may be slower due to module resolution; subsequent runs should be fast

advanced_patterns:
  - Client-side filtering: URL synchronization for bookmarkable states (if applicable).
  - Progressive enhancement: Core functionality works without enhancements; enhanced with features.
  - Defensive programming: Safe fallbacks for missing data; graceful error handling.
  - Resource hints optimization: Strategic preconnect hints for external domains (if applicable).
  - Navigation announcements: Screen reader feedback for all navigation changes (if applicable).
  - JSON-LD testing: Comprehensive validation tests for structured data (if applicable).
  - Accessibility announcements: Comprehensive screen reader support for all user actions (if applicable).

accessibility:
  - WCAG AA compliance: 4.5:1 contrast ratio, 3:1 for large text (if user-facing UI).
  - Keyboard navigation: Tab order logical; Enter/Space activate controls.
  - Screen readers: ARIA labels, live regions, semantic HTML structure.
  - Focus management: Visible focus indicators, focus traps for modals.
  - Motion sensitivity: prefers-reduced-motion support (if applicable).
  - Color independence: No color-only information conveyance.
  - Error identification: Clear labels, descriptions, and suggestions.

performance:
  - Core Web Vitals (if web UI): LCP < 2.5s, CLS < 0.1, FID < 100ms targets.
  - Resource loading: Preconnect to external domains; preload critical assets.
  - Bundle optimization: Defer non-critical assets; tree-shake unused code.
  - Image optimization: Lazy loading, modern formats, proper dimensions (if applicable).
  - Build performance: Track and optimize build time; cache dependencies.
  - Critical path: Optimize loading of critical resources.

testing:
  - Unit tests: Core utilities/modules/components; required for new code.
  - Integration tests: Critical flows or interfaces; optional per project.
  - Schema/Contract: Validate structured config/data against schemas (if applicable).
  - Accessibility: Keyboard navigation, screen reader testing (if UI).
  - Performance: Track budgets and surface regressions in CI.
  - Cross-browser: Modern browser support (last 2 versions).
  - Error states: Network failures, missing data, invalid configurations.
  - Local development: Fast test loop; clear pass/fail feedback.
  - Compilation: Run tsc --noEmit before tests to catch type errors.
  - Test strategy: Import from compiled dist/ for backward compatibility.
  - Cross-platform test isolation: Use real temp directories (os.tmpdir + fs.mkdtemp) over mock-fs for Windows compatibility.
  - Test cleanup: Always use fs.rm with recursive:true and force:true in afterEach hooks.
  - Emoji handling in tests: Test with actual UTF-8 emoji characters, not ASCII approximations.
  - Test data generation: Generate fixtures from actual tool output, not assumed formats.
  - Format validation: Match test assertions to exact output format including markdown syntax.
  - Performance tests: Validate tracker accuracy, cache efficiency, and metric calculations.
  - Async test patterns: Use async/await in tests for time-based validations.
  - Parallel testing: Test concurrency limits, error handling, progress callbacks, and memory efficiency.
  - Large fixtures: Create 100+ file fixtures for performance testing; verify 2-3x speedup with parallel mode.
  - Test timeouts: All tests must have explicit timeouts; unit tests default 5s, integration 60s; use { timeout: ms } option.
  - Timeout enforcement: Remove or fix tests that consistently exceed timeouts; never increase timeouts to mask slow tests.
  - Test isolation: Each test should be independently runnable; avoid shared state that causes cascading failures.
  - Slow test remediation: Profile slow tests, cache expensive operations (schema compilation, fixture setup), or split into faster units.

review:
  - Pre-commit checks: Lint, tests pass; clear pass/fail signal.
  - Manual testing: Critical flows tested; screenshots for UI changes (if applicable).
  - Performance check: No significant regressions introduced.
  - Documentation: Update README for user-facing changes.
  - Test coverage: New features have tests; existing tests still pass.
  - Quick validation: Does it work? Is it tested? Is it documented?

contribution:
  - Branch naming: feat/, fix/, refactor/, perf/, docs/, test/, chore/ prefixes.
  - Commit messages: Conventional commits with scope (e.g., feat(auth): add login, fix(ui): resolve button focus).
  - PR requirements: Description, testing notes, screenshots for UI changes (if applicable).
  - Breaking changes: Document in commit message with migration notes.
  - Open source friendly: Clear descriptions, helpful for future contributors.

commits:
  - Format: type(scope): description
  - Types: feat, fix, refactor, perf, docs, test, chore
  - Scope: feature area (e.g., ui/button, api/auth, docs/readme)
  - Breaking changes: Add "BREAKING CHANGE:" footer with migration notes
  - Examples: "feat(auth): add login validation", "fix(ui): resolve button focus trap"

policies:
  - Testing Standard: Unit tests for new features; integration tests optional; keep tests fast (< 5s unit, < 60s integration).
  - Security Baseline: No credentials in repo; automated dependency scanning; fail builds on critical vulnerabilities.
  - Free-Tier First: Optimize CI for GitHub Actions free tier (< 2000 min/month); cache dependencies; parallel where beneficial.
  - Performance Awareness: Track build times; report slow tests; optimize bottlenecks as they appear.
  - Git Best Practices: Conventional commits (feat/fix/docs); HTTPS for push; clear commit messages.
  - Quality Checks: Automated linting, type checking, and testing on every push; fix before merge.
  - Keep It Working: Main branch should always be deployable; fix broken builds immediately.
  - Documentation: Update README for user-facing changes; keep docs simple and actionable.
  - Dependency Management: Review deps before adding; prefer standard library; keep dependencies minimal and updated.

version_control:
  - Rules versioning: Update version number in header for major changes and phase completions.
  - Change documentation: Document rule modifications in commit messages.
  - Backwards compatibility: Avoid breaking changes; use deprecation warnings.
  - Migration guide: Update docs when rules change significantly.
  - Error integration: Incorporate documented errors into rules for continuous improvement.
  - Environment updates: Add platform-specific workarounds and compatibility notes.
  - Pattern documentation: Update patterns section when new architectural patterns emerge.
  - Session-driven updates: Review each development session and update rules with new optimizations.
  - Advanced practices: Add advanced_patterns section for complex implementation strategies.
  - Cycle closeout: Formal post-cycle review process to maintain standards evolution.

large_scale_refactoring:
  - Pre-refactor checklist: Full test suite passing; all tests have timeouts; clear rollback plan.
  - Incremental approach: Test after each major subsection (e.g., every 10-20 file deletions).
  - Dependency cleanup first: Remove unused deps before removing code to avoid carrying dead weight.
  - Feature deletion order: Tests → Code → Dependencies → Documentation (reverse of creation).
  - Version bumping: Major version for breaking changes; document all removals in BREAKING CHANGE.
  - Fixture validation: Grep for fixture references before deletion; update tests first.
  - Import path verification: After TypeScript compilation, verify test imports from dist/.
  - Commit granularity: One logical change per commit; easier rollback and review.
  - Documentation sync: Update docs immediately after removing features, not at end.

optimization_workflow:
  - Phase planning: Break large changes into 5-7 phases max; each phase should be independently testable.
  - Phase boundaries: Test, commit, and push after each phase completion; tag major milestones.
  - Rollback readiness: Each phase should be independently revertable without breaking functionality.
  - Dependency timing: Clean up unused dependencies in first phase, not last.
  - Documentation timing: Update user-facing docs during relevant phase, not deferred to end.
  - Test suite health: Maintain passing tests throughout; never proceed with failing tests.
  - Incremental validation: Build and test after every major change (10-20 files or key feature).

cycle_closeout:
  - Quick Review: Before merging, verify:
    - [ ] Changes work as expected
    - [ ] Tests pass
    - [ ] Docs updated (if user-facing change)
    - [ ] No secrets committed
    - [ ] Build/deploy still works
  - That's it! Keep it simple.
```

---

## Relationship Between BOOTSTRAP.md and .projectrules

### File Purposes

- **`.projectrules`**: Structured YAML-like source of truth for tools/CI scripts. This is the canonical format that automated tools read and parse.
- **`BOOTSTRAP.md`**: Human/LLM-readable reference guide that embeds the same rules in markdown format for easy consumption.

### How They Work Together

1. **For LLMs**: Load `BOOTSTRAP.md` to get complete context including all project rules. Then automatically sync `.projectrules` using the instructions above.
2. **For Tools/CI**: Scripts read `.projectrules` directly in its structured format. They don't read `BOOTSTRAP.md`.
3. **For Humans**: Can read either file, but `BOOTSTRAP.md` is more readable while `.projectrules` shows the exact format tools expect.

### Sync Process

- **When BOOTSTRAP.md is updated**: The embedded rules section should be updated to match any changes in `.projectrules`.
- **When .projectrules is updated**: `BOOTSTRAP.md` should be updated to reflect the new version and rules.
- **For new projects**: LLMs should create `.projectrules` from the template in `BOOTSTRAP.md` when setting up a new project.

### Key Principle

Both files should stay in sync. `BOOTSTRAP.md` is the LLM-friendly wrapper, `.projectrules` is the tool-friendly structured format. They contain the same information in different formats.

---

## Comparison Logic Examples

### Example 1: Reading and Parsing .projectrules

```python
# Python example for reading .projectrules
import re
from pathlib import Path

def read_project_rules(project_root: str) -> dict:
    """Read and parse .projectrules file."""
    rules_path = Path(project_root) / ".projectrules"
    
    if not rules_path.exists():
        return {"exists": False}
    
    content = rules_path.read_text(encoding="utf-8")
    
    # Extract version
    version_match = re.search(r"^# Version:\s*([\d.]+)", content, re.MULTILINE)
    version = version_match.group(1) if version_match else None
    
    # Extract last updated
    updated_match = re.search(r"^# Last Updated:\s*(.+)", content, re.MULTILINE)
    last_updated = updated_match.group(1).strip() if updated_match else None
    
    return {
        "exists": True,
        "version": version,
        "last_updated": last_updated,
        "content": content
    }
```

### Example 2: Comparing Versions

```python
def compare_versions(bootstrap_version: str, rules_version: str) -> bool:
    """Compare version numbers. Returns True if they match."""
    # Normalize versions (remove 'v' prefix, handle '3.0' vs '3.0.0')
    bootstrap_clean = bootstrap_version.replace("v", "").strip()
    rules_clean = rules_version.replace("v", "").strip()
    
    # Split and compare major.minor
    bootstrap_parts = bootstrap_clean.split(".")[:2]
    rules_parts = rules_clean.split(".")[:2]
    
    return bootstrap_parts == rules_parts
```

### Example 3: Detecting Section Mismatches

```python
def extract_section(content: str, section_name: str) -> list:
    """Extract a section from .projectrules format."""
    # Find section start
    pattern = rf"^{section_name}:"
    match = re.search(pattern, content, re.MULTILINE)
    
    if not match:
        return []
    
    start = match.end()
    lines = content[start:].split("\n")
    items = []
    current_item = ""
    
    for line in lines:
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("- "):
            if current_item:
                items.append(current_item)
            current_item = line[2:]  # Remove "- "
        elif line.startswith("  - "):
            # Nested item
            current_item += " " + line[4:]
        elif not line.startswith("-") and line:
            # Continuation of current item
            current_item += " " + line
        else:
            # End of section
            break
    
    if current_item:
        items.append(current_item)
    
    return items

def compare_sections(bootstrap_section: list, rules_section: list) -> dict:
    """Compare two sections and return differences."""
    bootstrap_set = set(bootstrap_section)
    rules_set = set(rules_section)
    
    missing_in_rules = bootstrap_set - rules_set
    extra_in_rules = rules_set - bootstrap_set
    
    return {
        "match": len(missing_in_rules) == 0 and len(extra_in_rules) == 0,
        "missing_in_rules": list(missing_in_rules),
        "extra_in_rules": list(extra_in_rules)
    }
```

### Example 4: Generating Updated .projectrules

```python
def generate_project_rules(template: str, customizations: dict = None) -> str:
    """Generate .projectrules content from template with optional customizations."""
    content = template
    
    # Update version and date
    from datetime import date
    today = date.today().strftime("%Y-%m-%d")
    content = re.sub(r"^# Last Updated:.*", f"# Last Updated: {today}", content, flags=re.MULTILINE)
    
    # Apply customizations if provided
    if customizations:
        for section, items in customizations.items():
            # Insert custom items into appropriate section
            # (Implementation depends on specific customization format)
            pass
    
    return content
```

### Example 5: Complete Sync Workflow

```python
def sync_project_rules(project_root: str, bootstrap_rules: dict) -> dict:
    """Complete workflow for syncing .projectrules."""
    result = {
        "action": "skip",
        "reason": "",
        "changes": []
    }
    
    # Step 1: Check if exists
    rules_info = read_project_rules(project_root)
    if not rules_info["exists"]:
        result["action"] = "create"
        result["reason"] = ".projectrules does not exist"
        return result
    
    # Step 2: Compare versions
    if not compare_versions("3.0", rules_info["version"]):
        result["action"] = "update"
        result["reason"] = f"Version mismatch: {rules_info['version']} vs 3.0"
        result["changes"].append("version")
    
    # Step 3: Compare key sections
    key_sections = ["project_goals", "guardrails", "code_style", "patterns"]
    for section in key_sections:
        rules_section = extract_section(rules_info["content"], section)
        bootstrap_section = bootstrap_rules.get(section, [])
        comparison = compare_sections(bootstrap_section, rules_section)
        
        if not comparison["match"]:
            if result["action"] == "skip":
                result["action"] = "update"
            result["changes"].append(section)
            result["reason"] = f"Mismatches in: {', '.join(result['changes'])}"
    
    return result
```

---

## Reference Links

### Essential Documentation

#### LLM-Specific Guides
- **[LLM-CONTEXT-GUIDE.md](docs/LLM-CONTEXT-GUIDE.md)** - Complete command and workflow reference (2619 lines of detailed context)
- **[LLM-REFERENCE.md](docs/LLM-REFERENCE.md)** - Technology-agnostic template for project extensions
- **[LLM-FILE-INDEX.md](docs/LLM-FILE-INDEX.md)** - Navigation checklist for LLMs

#### Core Usage & Operations
- **[USAGE.md](docs/USAGE.md)** - Day-to-day workflows, fast mode, diagnostics
- **[SETUP-GUIDE.md](docs/SETUP-GUIDE.md)** - Initial embedding instructions
- **[EMBEDDED-USAGE.md](docs/EMBEDDED-USAGE.md)** - Ongoing embedded usage patterns
- **[SYNC.md](docs/SYNC.md)** - Syncing with template updates
- **[TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** - Problem solutions and common issues

#### Development Standards
- **[PROJECTRULES-UPDATE-v3.0.md](docs/PROJECTRULES-UPDATE-v3.0.md)** - Engineering rules, cross-platform practices, AI-assisted patterns
- **[BEST-PRACTICES.md](docs/BEST-PRACTICES.md)** - Technology-agnostic best practices (encryption, error handling, verification)
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Project structure and design principles
- **[TOOLING-ARCHITECTURE.md](docs/TOOLING-ARCHITECTURE.md)** - Tooling design, why Node/TypeScript, contributor guidelines
- **[PERF-BASELINE.md](docs/PERF-BASELINE.md)** - Performance benchmarks and optimization targets

#### Integration Guides
- **[guides/docs-organization.md](docs/guides/docs-organization.md)** - Documentation organization patterns
- **[guides/cursor-plan-integration.md](docs/guides/cursor-plan-integration.md)** - Cursor IDE integration
- **[guides/python-best-practices.md](docs/guides/python-best-practices.md)** - Python-specific development patterns
- **[guides/troubleshooting.md](docs/guides/troubleshooting.md)** - Extended troubleshooting guide

#### Additional Resources
- **[CONTRIBUTING.md](docs/CONTRIBUTING.md)** - Contribution guidelines
- **[REPOSITORY_STRUCTURE.md](docs/REPOSITORY_STRUCTURE.md)** - Repository organization
- **[STRUCTURE.md](docs/STRUCTURE.md)** - Detailed structure reference
- **[TOOL-RECOMMENDATIONS.md](docs/TOOL-RECOMMENDATIONS.md)** - Recommended development tools

### Tool Entry Points

- **Doctor CLI**: `scripts/doctor/cli.ts` (source) → `dist/scripts/doctor/cli.js` (compiled)
- **Stack Detector**: `scripts/tools/stack-detector.ts` (source) → `dist/scripts/tools/stack-detector.js` (compiled)
- **Gap Analyzer**: `scripts/tools/gap-analyzer.ts` (source) → `dist/scripts/tools/gap-analyzer.js` (compiled)
- **Plan Generator**: `scripts/tools/plan-generator.ts` (source) → `dist/scripts/tools/plan-generator.js` (compiled)
- **Agent Init**: `scripts/agent/cli-simple.js` (source) → `dist/scripts/agent/cli.js` (compiled)
- **Cleanup Engine**: `scripts/cleanup/engine.ts` (source) → `dist/scripts/cleanup/engine.js` (compiled)
- **Sync Scripts**: `scripts/sync-from-template.sh` (Bash) and `scripts/sync-from-template.ps1` (PowerShell) - Template maintenance tools

### External Resources

- **GitHub Repository**: https://github.com/XylarDark/DevEnvTemplate
- **Issues**: https://github.com/XylarDark/DevEnvTemplate/issues
- **License**: MIT (see [LICENSE](LICENSE))

---

## Quick Reference Tables

### User Intent → Command Pipeline

| User Intent | Command Sequence | Auto-Execute? |
|------------|------------------|---------------|
| "Set up new project" | `agent:init` → `doctor --fix` → `test` → `git init` | ✅ Yes |
| "Fix my project" | `doctor --json` → `doctor --fix --dry-run` → `doctor --fix` | ✅ Yes |
| "Make it production ready" | `doctor --strict` → `format:check` → `test` → `build` | ✅ Yes |
| "Quick improvements" | `doctor` → `doctor --fix --no-install` → `format` | ✅ Yes |
| "Set up CI" | `doctor --fix` → create workflow → `doctor --strict` | ✅ Yes |
| "Check health" | `doctor` | ✅ Yes |
| "Clean up project" | `cleanup --dry-run` → (ask user) → `cleanup --apply` | ⚠️ Ask first |
| "Sync with template" | `sync-from-template.sh/ps1` → rebuild | ✅ Yes |
| "Deploy my app" | Quality Gate → build → deploy command | ✅ Yes |

### Health Score → Action Matrix

| Score Range | Status | Recommended Action | Pipeline |
|-------------|--------|-------------------|----------|
| 90-100 | 🟢 Excellent | Maintain | None |
| 80-89 | 🟢 Good | Optional improvements | Quick wins |
| 60-79 | 🟡 Fair | Add missing tooling | Full fix pipeline |
| 40-59 | 🟡 Needs Work | Fix critical issues | Full fix + manual |
| 0-39 | 🔴 Poor | Rebuild tooling | Fresh setup |

### Stack Profile Detection

| Stack Profile | Detected From | Recommended Tools |
|---------------|---------------|-------------------|
| `node` | `package.json`, `node_modules/` | Vitest, ESLint flat config, Playwright, Dependabot |
| `python` | `pyproject.toml`, `requirements.txt` | Pytest, Ruff, Black, Mypy, pre-commit hooks |
| `node + python` | Both present | Separate sections for each profile |

**Stack Profile Behavior:**
- Once `.devenv/stack-report.json` exists, doctor prints detected profile(s) up front
- Recommendations switch to stack-specific tooling (no generic advice)
- Python projects: Accepts `env-example*` templates, prefers `pre-commit` over Husky
- Simulation/ML Python repos: Recommends experiment budgets and run-tracking observability
- See [USAGE.md](docs/USAGE.md) for stack-specific quick wins

### Development Patterns & Practices

#### Cross-Platform Development
- **PowerShell Compatibility**: Use `;` not `&&` for command chaining, avoid emoji in commit messages
- **Shell Commands**: Avoid Unix-only utilities (`wc`, `sed`, `awk`) in cross-platform workflows
- **Unicode/Encoding**: Default to ASCII-safe output, use UTF-8 only when explicitly configured
- See [PROJECTRULES-UPDATE-v3.0.md](docs/PROJECTRULES-UPDATE-v3.0.md) sections 9-10 for details

#### AI-Assisted Development Patterns
- **File Reading**: Always re-read target files immediately before applying patches
- **Context Scope**: Use narrow, localized context (3-5 lines) for patch operations
- **Edit Isolation**: Avoid multiple edits to the same region in a single session
- **Markdown Caution**: Be careful with whitespace in markdown/structured text
- See [PROJECTRULES-UPDATE-v3.0.md](docs/PROJECTRULES-UPDATE-v3.0.md) section 10 for details

#### Best Practices Utilities
- **Encryption Keys**: Use DevEnvTemplate utilities for key generation/validation
- **Environment Variables**: Use validation utilities to prevent runtime errors
- **Error Handling**: Use error helpers for actionable messages with hints
- **Verification**: Use pre-commit/pre-deployment verification utilities
- See [BEST-PRACTICES.md](docs/BEST-PRACTICES.md) for complete patterns

---

## Quick Development Reference

### By Task Type

**Setting Up Projects:**
- New project: [SETUP-GUIDE.md](docs/SETUP-GUIDE.md) → [USAGE.md](docs/USAGE.md)
- Embedded usage: [EMBEDDED-USAGE.md](docs/EMBEDDED-USAGE.md)
- Syncing updates: [SYNC.md](docs/SYNC.md)

**Daily Development:**
- Health checks: [USAGE.md](docs/USAGE.md) → [LLM-CONTEXT-GUIDE.md](docs/LLM-CONTEXT-GUIDE.md)
- Fixing issues: [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) → [BEST-PRACTICES.md](docs/BEST-PRACTICES.md)
- Code quality: [PROJECTRULES-UPDATE-v3.0.md](docs/PROJECTRULES-UPDATE-v3.0.md)

**Understanding Internals:**
- Architecture: [ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Tooling design: [TOOLING-ARCHITECTURE.md](docs/TOOLING-ARCHITECTURE.md)
- Performance: [PERF-BASELINE.md](docs/PERF-BASELINE.md)

**LLM-Specific Context:**
- Commands & workflows: [LLM-CONTEXT-GUIDE.md](docs/LLM-CONTEXT-GUIDE.md) (2619 lines)
- File navigation: [LLM-FILE-INDEX.md](docs/LLM-FILE-INDEX.md)
- Project extension: [LLM-REFERENCE.md](docs/LLM-REFERENCE.md)

**Integration & Guides:**
- Cursor IDE: [guides/cursor-plan-integration.md](docs/guides/cursor-plan-integration.md)
- Python projects: [guides/python-best-practices.md](docs/guides/python-best-practices.md)
- Docs organization: [guides/docs-organization.md](docs/guides/docs-organization.md)

### By Development Concern

**Cross-Platform Compatibility:**
- [PROJECTRULES-UPDATE-v3.0.md](docs/PROJECTRULES-UPDATE-v3.0.md) sections 3, 9
- PowerShell patterns, shell compatibility, Unicode/encoding

**Error Handling & Validation:**
- [BEST-PRACTICES.md](docs/BEST-PRACTICES.md) - Encryption, environment vars, error patterns
- [PROJECTRULES-UPDATE-v3.0.md](docs/PROJECTRULES-UPDATE-v3.0.md) - AI-assisted patterns

**Performance & Optimization:**
- [PERF-BASELINE.md](docs/PERF-BASELINE.md) - Benchmarks, fast mode
- [USAGE.md](docs/USAGE.md) - Fast vs full mode usage

**Stack-Specific Development:**
- Node.js: [USAGE.md](docs/USAGE.md) - Vitest, ESLint, Playwright patterns
- Python: [guides/python-best-practices.md](docs/guides/python-best-practices.md) - Pytest, Ruff, Black, Mypy
- Cross-stack: [PROJECTRULES-UPDATE-v3.0.md](docs/PROJECTRULES-UPDATE-v3.0.md) section 9

---

**End of DevEnvTemplate Bootstrap Guide**

*This file is the technology-agnostic template. Projects should copy and extend it with project-specific content.*

**For LLM Sessions:** This file now contains comprehensive references to all development-relevant documentation. Use the Quick Development Reference section above to quickly locate resources by task type or development concern.

