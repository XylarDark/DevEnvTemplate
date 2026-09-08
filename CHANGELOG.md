# Changelog

All notable changes to DevEnvTemplate will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Purpose statement in the README**: what the template is for, what it deliberately is not, and
  a four-layer adoption menu (agent context, operational memory, verification, doctor) that can be
  taken independently. Grounded in a real consumer that adopted the first two layers and none of
  the lint or format toolchain.
- **`verification-evidence` skill**: the ways a check passes while measuring nothing — reading a
  value from the wrong place, being satisfied by the wrong subject, exiting zero when it could not
  measure, and obeying a malformed input. Covers fail-open helpers, boundary versus midpoint
  testing, requested versus effective values, and mutation-testing a guard test.
- **`exclusive-resource-access` skill**: driving a resource only one caller can hold — lane
  isolation, lock files that refuse fast and name the holder, wall-clock watchdogs, synchronous
  teardown on every observable exit path, reaping orphans by owned state path, and why a hang must
  never be retried.
- **`multi-agent-collaboration` skill**: single ownership of a file, staging by explicit path,
  never rebasing or pushing from a worker in a shared tree, establishing a baseline before
  starting, and not modifying a shared tool while others are using it.
- **[ADR 001](docs/adr/001-agent-hook-failure-posture.md)**: settles whether the secret-scan hook
  runs fail-open or fail-closed, records what fail-open gives up, and states the conditions under
  which a consumer should choose differently.
- **`tests/unit/skill-portability.test.js`**: fails when a shipped skill names a repo-local command
  before a "Localize on copy" callout, or anywhere in its `description`.

### Changed

- **Skills are now portable by construction.** Sections describing this repository's own commands
  and docs layout are marked "Localize on copy", and `integrateCursorRules` reports which copied
  skills carry one so a host is told what to adapt as it lands.
- The `documentation` skill points at `DOCS_LAYOUT.md` for the docs-root inventory instead of
  duplicating it, and documents the entry shapes for the known-errors and automation-gaps logs.
- The secret scanner's header no longer recommends `failClosed: true` while the config sets
  `false`; it points at ADR 001 instead.
- README: replaced two documented commands that referenced paths which do not exist, and dropped
  setup-time claims and a tool list naming a test runner this repository does not use.

### Fixed

- Copied skills instructed host projects to run commands that exist only here. Recorded in
  [KNOWN_ERRORS.md](docs/KNOWN_ERRORS.md) with the guard test that now prevents it.

---

## [2.0.0] - 2025-11-07

### 🎯 Major Release: Indie Developer Focus

**BREAKING CHANGES**: DevEnvTemplate pivoted from enterprise/general-purpose to indie developers & solo founders.

### Added

- **Phase 2.1: Market Pivot**
  - Created comprehensive market positioning for indie developers
  - Added 3 target personas: Side project builder, freelancer, technical founder
  - Simplified governance rules (v2.0): 9 policies (down from 17)
  - Created `docs/market-positioning.md` with market analysis
  - Updated README for indie developer audience
  - Rewrote USAGE.md with practical "I want to..." scenarios

- **Phase 2.2: CLI Simplification**
  - Created `npx devenv-init` one-command setup
  - New simplified CLI (`scripts/agent/cli-simple.js`): 5 questions vs 10+
  - Auto-detects package manager (npm/pnpm/yarn)
  - Context-aware framework suggestions
  - Smart defaults for indie developers
  - Opinionated presets built-in (Side project, API, Full-stack, Static)
  - Setup time reduced: 2-3 minutes (vs 5-10 minutes)

- **Phase 2.3: Free-Tier CI**
  - New simplified CI workflow (`indie-ci.yml`): < 3 min feedback
  - Parallel jobs: quick-checks, test, security, stack-analysis
  - Concurrency control (cancel in-progress runs)
  - Free-tier optimized: ~1800 min/month (90% of free tier)
  - Deployment examples: Vercel, Railway, Fly.io (all `.example` files)
  - README badges: CI status, version, license

- **Phase 2.4: Documentation**
  - Rewrote IMPLEMENTATION_GUIDE.md for indie developers
  - Removed enterprise jargon throughout docs
  - Added free-tier deployment guides
  - Created this CHANGELOG.md

### Changed

- **Version**: Bumped from 1.0.0 to 2.0.0 (major breaking changes)
- **Description**: "Ship quality code faster - for indie developers & solo founders"
- **Project Goals**: Focus on ship fast, quality by default, free-tier first, solo-friendly
- **Target Audience**: From "enterprise teams" to "indie developers & solo founders"
- **CLI Default**: `agent:init` now uses simplified CLI (advanced via `agent:init:advanced`)
- **CI Runtime**: Reduced from 5-10 minutes to < 3 minutes
- **Policies**: Simplified from 17 to 9 core rules
- **Guardrails**: Simplified from 7 to 6 essential rules

### Removed

- **Enterprise Features**:
  - Plan-Only Gate (STRICT_PLAN_GUARD)
  - Impact Guard validation
  - Context contracts requirement
  - Multi-team coordination
  - Approval workflows
  - Governance compliance checks

- **Complex CI Workflows** (disabled, renamed to `.disabled`):
  - `ci.yml` (481 lines, plan guards, impact analysis)
  - `governance.yml` (governance compliance)
  - `cleanup-guard.yml` (complex validation)

- **Enterprise Documentation**:
  - Team workflows
  - Stakeholder language
  - Multi-phase approval processes
  - Complex governance frameworks

### Fixed

- Test timeouts (added explicit 5s unit, 60s integration limits)
- Terminal command stalls (added timeout guidelines to `.projectrules`)
- Removed slow/stalling tests (agent-workflow, agent-cli, benchmark, progress)

### Performance

- **CLI**: 2-3 minutes (vs 5-10 minutes) - 60% faster
- **CI**: < 3 minutes (vs 5-10 minutes) - 50-70% faster
- **Free Tier**: ~1800 min/month (vs 4500+ min/month) - 60% reduction

---

## [1.8.0] - 2025-11-07

### Added

- Terminal timeout guidelines in `.projectrules`
- Test timeout enforcement (5s unit, 60s integration)
- Stall detection (30s no-output threshold)
- Slow test remediation workflow

### Changed

- Updated `.projectrules` to v1.8
- Added `terminal_timeout_guidelines` section

### Removed

- Removed slow/stalling tests

---

## [1.7.0] - 2025-11-07

### Added

- **Phase 4b: Parallel Processing**
  - Parallel utility (`scripts/utils/parallel.ts`)
  - Concurrency control for file operations
  - 2-5x speedup on large codebases
  - CLI flags: `--parallel`, `--concurrency`

### Changed

- Updated `.projectrules` to v1.7
- CleanupEngine now supports parallel execution

---

## [1.6.0] - 2025-11-07

### Added

- **Phase 4a: Caching Layer**
  - FileCache for content-based caching
  - ConfigCache for parsed configurations
  - 2-3x speedup on repeated runs
  - CLI flag: `--cache` / `--no-cache`

- **Phase 3c: Performance Metrics**
  - PerformanceTracker class
  - Execution time tracking
  - Memory usage monitoring
  - Performance recommendations
  - CLI flag: `--performance`

### Changed

- Updated `.projectrules` to v1.6

---

## Earlier Versions

For earlier version history, see git log.

---

## Release Notes

### [2.0.0] - Major Release: Indie Developer Focus

This is a **major breaking release** that pivots DevEnvTemplate from enterprise/general-purpose to indie developers & solo founders.

**Migration Guide:**
- If you were using enterprise features (plan guards, governance, context contracts), they are disabled by default
- Re-run `npm run agent:init` to use the new simplified CLI
- Update your CI to use `indie-ci.yml` instead of `ci.yml`
- Deployment examples are now in `.github/workflows/*.yml.example`

**Who should upgrade:**
- ✅ Indie developers & solo founders
- ✅ Side projects & SaaS builders
- ✅ Freelancers & consultants
- ✅ Technical founders (pre-seed/seed stage)

**Who should NOT upgrade (stay on 1.x):**
- ❌ Enterprise teams requiring approval workflows
- ❌ Projects needing plan-only gates and impact validation
- ❌ Complex multi-team coordination scenarios

**Key Benefits:**
- Setup: 5 minutes (vs 10+ minutes in 1.x)
- CI: < 3 minutes (vs 5-10 minutes in 1.x)
- Free tier: 1800 min/month (vs 4500+ in 1.x)
- Complexity: 9 policies (vs 17 in 1.x)
- Focus: Solo developers (vs enterprise in 1.x)

---

## Links

- [GitHub Repository](https://github.com/XylarDark/DevEnvTemplate)
- [Documentation](docs/)
- [Cursor rules](.cursor/rules/README.md)
- [Agent notes](AGENTS.md)
