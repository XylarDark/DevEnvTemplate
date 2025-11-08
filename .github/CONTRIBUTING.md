# Contributing to This Project

Thank you for your interest in contributing! This document outlines the process and standards for contributing to this project.

## Code of Conduct

This project follows a professional and inclusive code of conduct. Be respectful, collaborative, and focused on quality.

## Getting Started

1. **Read the Documentation**: Start with [`README.md`](../README.md) and [`.projectrules`](../.projectrules)
2. **Understand Governance**: Review the [rules changelog](../docs/rules-changelog.md) for evolution history
3. **Understand Architecture**: Review [ARCHITECTURE.md](../docs/ARCHITECTURE.md) for project structure
4. **Set Up Development Environment**: Follow setup instructions in README.md

## Project Structure

The project follows a clear directory organization:

- **`scripts/`** - All source code (TypeScript)
  - `agent/` - Project initialization
  - `cleanup/` - Template cleanup
  - `doctor/` - Health checking & auto-fixes
  - `tools/` - Analysis utilities (stack detection, gap analysis)
  - `types/` - TypeScript type definitions
  - `utils/` - Shared utilities
- **`docs/`** - Documentation
  - `archive/` - Historical documentation
  - `guides/` - Integration guides
- **`config/`** - Configuration files
  - `schemas/` - JSON schemas
- **`tests/`** - Test suite
  - `fixtures/` - Test data
  - `unit/` - Unit tests
  - `integration/` - Integration tests

See [ARCHITECTURE.md](../docs/ARCHITECTURE.md) for detailed information.

### Node Version Management

This project requires Node.js 20+. We recommend using a version manager:

**Using nvm (recommended):**

```bash
# Install and use the correct Node version
nvm install
nvm use
```

**Using Volta (alternative):**

```bash
# Volta automatically manages Node versions per project
volta install node
```

The project includes `.nvmrc` and `volta.node` configuration for consistent Node versions across the team.

### Website Development Setup

The onboarding website is built with Next.js and TypeScript:

```bash
# Navigate to website directory
cd website

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

**Windows/PowerShell Notes**:

- Avoid `&&` command chaining in scripts/docs - PowerShell doesn't recognize it
- Use separate commands or npm scripts instead
- Prefer `cross-env` for environment variables if needed
- Test scripts on both Windows and Unix-like systems

### TypeScript Development

The codebase uses TypeScript for core modules with strict type checking:

**Build and Type Check:**

```bash
# Compile TypeScript to JavaScript
npm run build

# Watch mode for development
npm run build:watch

# Type check only (no output)
npm run prebuild
```

**Development Workflow:**

- Write TypeScript in `scripts/**/*.ts`
- TypeScript compiles to `dist/`
- JavaScript wrappers in `scripts/**/*.js` import from `dist/` for compatibility
- Run `npm run build` before testing

**Type Definitions:**

- Place interfaces in `scripts/types/*.ts`
- Use strict typing throughout
- Enable IDE autocomplete with proper exports

**Testing with TypeScript:**

- Tests import from compiled JavaScript (`dist/`)
- Run `npm run build` before test suite
- Type errors caught at compile time, not runtime

### Cross-Platform Testing

The project tests must work on Windows, macOS, and Linux. Follow these patterns:

**Temporary Directory Handling:**

```javascript
const os = require("os");
const path = require("path");
const { promises: fs } = require("fs");

// Create temp directory
const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "test-prefix-"));

// Cleanup in afterEach
await fs.rm(tempDir, { recursive: true, force: true });
```

**Emoji Handling in Parsers:**

```javascript
// DON'T: Emojis don't work in regex character classes
const match = line.match(/[🔴🟡🟢]/); // FAILS on multi-byte UTF-8

// DO: Use string methods
const isHighPriority = line.includes("🔴");
const title = line.replace(/^### [🔴🟡🟢] /, "");
```

**Inter-Tool Communication:**

- Use structured markdown fields for machine parsing
- Document expected output format in TypeScript interfaces
- Include all fields downstream tools need

**Test Data Generation:**

- Generate test fixtures from actual tool output
- Run tools manually to verify format before writing tests
- Match exact output including markdown formatting

**TypeScript Union Types:**

- Keep union types exhaustive (include all runtime values)
- Add missing values when compilation errors occur
- Catch type mismatches at compile time, not runtime

### Performance & Caching Patterns

The project includes performance tracking and caching for optimization:

**Performance Tracking:**

```bash
# Enable performance metrics
npm run cleanup -- --performance --apply

# Outputs:
# - Rule execution timing
# - File processing metrics
# - Memory usage (heap, RSS)
# - Cache efficiency
# - Optimization recommendations
```

**Performance Testing:**

```javascript
// Test performance tracker
const { PerformanceTracker } = require("../../dist/scripts/types/performance");

it("should track rule execution", () => {
  const tracker = new PerformanceTracker();
  tracker.start();
  tracker.trackRuleExecution("test-rule", 100, 5, false);
  tracker.end();

  const report = tracker.generateReport();
  assert.strictEqual(report.rules.length, 1);
  assert.strictEqual(report.rules[0].ruleId, "test-rule");
});
```

**Caching Strategy:**

```typescript
// Config caching with content-based invalidation
if (this.configCache && this.fileCache) {
  const contentHash = this.fileCache.generateHash(configContent);
  const cached = this.configCache.get(configPath, contentHash);

  if (cached) {
    return cached; // Cache hit
  }

  const parsed = yaml.parse(configContent);
  this.configCache.set(configPath, parsed, contentHash);
  return parsed;
}
```

**Cache Control:**

```bash
# Caching enabled by default
npm run cleanup -- --apply

# Disable caching explicitly
npm run cleanup -- --no-cache --apply

# Cache invalidation is automatic when files change
```

**Best Practices:**

- Performance tracking is opt-in (--performance flag) to avoid overhead
- Caching uses SHA-256 hashing for integrity
- Cache TTL prevents stale data (1-hour default)
- Memory tracking helps identify optimization opportunities
- Recommendations guide performance improvements

### Parallel Processing Patterns

When implementing parallel processing:

**Code Example:**

```typescript
import { parallel } from "../utils/parallel";

// Process items with concurrency control
const result = await parallel(
  items,
  async item => {
    // Worker function
    return await processItem(item);
  },
  {
    concurrency: os.cpus().length,
    onProgress: (completed, total) => {
      console.log(`Progress: ${completed}/${total}`);
    },
  }
);

// Handle results and errors
const successfulResults = result.results.filter(r => r !== undefined);
const failedItems = result.errors.map(e => e.item);
```

**Testing Parallel Code:**

```javascript
it("should respect concurrency limit", async () => {
  let maxConcurrent = 0;
  let currentConcurrent = 0;

  await parallel(
    items,
    async item => {
      currentConcurrent++;
      maxConcurrent = Math.max(maxConcurrent, currentConcurrent);
      await doWork(item);
      currentConcurrent--;
      return result;
    },
    { concurrency: 3 }
  );

  assert.ok(maxConcurrent <= 3);
});
```

**Cross-Platform Considerations:**

- Use real temp directories (os.tmpdir + fs.mkdtemp) instead of mock-fs
- Test on Windows to catch path separator issues
- Verify file permissions work across platforms
- Use PowerShell-compatible commands in scripts (`;` not `&&`)

**Memory Profiling:**

```javascript
it("should be memory efficient with large arrays", async () => {
  const startMemory = process.memoryUsage().heapUsed;

  await parallel(largeArray, worker, { concurrency: 10 });

  const endMemory = process.memoryUsage().heapUsed;
  const memoryIncrease = endMemory - startMemory;

  assert.ok(memoryIncrease < 50 * 1024 * 1024); // < 50MB
});
```

**Best Practices:**

- Default to CPU count for concurrency
- Use 2x CPU count for I/O-heavy workloads
- Test with 1000+ items to verify memory efficiency
- Always handle errors gracefully (continue processing)
- Track batches in performance metrics
- Add progress callbacks for long-running operations

### Benchmark Testing Patterns

When adding performance-critical features, include benchmarks to track regression:

**Statistical Testing:**

```javascript
const { BenchmarkRunner } = require("../../dist/benchmark/runner");

it("should calculate statistical metrics correctly", () => {
  const runner = new BenchmarkRunner();
  const times = [100, 200, 300, 400, 500];

  const stats = runner["calculateStats"](times);

  assert.strictEqual(stats.mean, 300);
  assert.strictEqual(stats.median, 300);
  assert.strictEqual(stats.min, 100);
  assert.strictEqual(stats.max, 500);
  // Standard deviation should be ~141.42
  assert.ok(Math.abs(stats.stdDev - 141.42) < 0.01);
});
```

**Regression Detection:**

```javascript
it("should detect performance regression", async () => {
  const baseline = {
    name: "Test",
    stats: { mean: 100, median: 100, min: 90, max: 110, stdDev: 5 },
    // ... other fields
  };

  const current = {
    name: "Test",
    stats: { mean: 150, median: 150, min: 140, max: 160, stdDev: 5 },
    // ... other fields
  };

  const regression = await runner.detectRegression(current, [baseline], 10);

  assert.strictEqual(regression.hasRegression, true);
  assert.strictEqual(regression.slowdown, 50); // 50% slower
});
```

**Benchmark Suites:**

```typescript
// scripts/benchmark/suites.ts
export const BENCHMARK_SUITES: Record<string, BenchmarkConfig[]> = {
  "my-feature-comparison": [
    {
      name: "Baseline",
      fixture: "tests/fixtures/my-project",
      iterations: 5,
      options: { myFeature: false },
    },
    {
      name: "With Feature",
      fixture: "tests/fixtures/my-project",
      iterations: 5,
      options: { myFeature: true },
    },
  ],
};
```

**Integration with CI:**

- Benchmarks run automatically on PRs via `.github/workflows/benchmark.yml`
- Results posted as PR comments with comparison tables
- Regression alerts if performance degrades > threshold
- Historical data stored in `.devenv/benchmarks/history.json`

**Best Practices:**

- Run 5+ iterations for statistical significance
- Use realistic fixtures (not toy examples)
- Set appropriate regression thresholds (10-15%)
- Test both sequential and parallel modes
- Measure memory usage alongside execution time
- Document expected speedup in test descriptions

## Development Workflow

### Pre-Development (Plan Mode)

Before writing code, create a plan following this template:

```text
Goal
- Task: [brief description]
- Why now: [business/UX/QA/perf/sec rationale]
- Scope: [paths/modules]

Constraints
- Follow `.projectrules` v[version]; minimal cost; report-only governance
- No secrets in repo; cross-OS scripts; pin tool versions

Scope Gate
- New feature/setting? [yes/no]
- External domains/assets? [yes/no → list]
- Perf/a11y/SEO/security impact? [none/low/medium/high]
- Feature toggle? [yes/no] Setting: [id] Default: [false]
- Rollback plan: [how to disable/revert]

[Additional sections for Discovery, Testing, etc.]
```

### Branch Naming

Use descriptive branch names with prefixes:

- `feat/feature-name` - New features
- `fix/issue-description` - Bug fixes
- `refactor/component-name` - Code refactoring
- `perf/optimization-name` - Performance improvements
- `docs/document-name` - Documentation updates
- `test/test-description` - Test additions/updates
- `chore/maintenance-task` - Maintenance tasks

### Commit Messages

Follow conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types**: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `chore`

**Examples**:

- `feat(auth): add user login validation`
- `fix(ui): resolve button focus trap`
- `docs(readme): update installation instructions`

**Breaking Changes**: Add `BREAKING CHANGE:` footer with migration notes.

### Pull Requests

1. **Complete Scope Gate** checklist in PR template
2. **Fill Session Review** block after development cycle
3. **Ensure CI passes** (lint, test, governance checks)
4. **Add testing notes** and screenshots (if UI)
5. **Conventional commits** in PR branch

### Testing Standards

- **Unit tests required** for new code
- **Integration tests** optional per project needs
- **Fast local test loop** - tests run quickly during development
- **Schema validation** for structured data (if applicable)
- **Accessibility testing** for UI components (if applicable)
- **Website smoke tests** - verify guided/advanced onboarding flows work
- **TypeScript compilation** before tests to catch type errors early
- **Structured logging** with LOG_LEVEL=debug for test debugging

### Next.js Development Guidelines

- **Server/Client Boundaries**: Mark client components with `"use client"` directive
- **No Node APIs in Client**: Don't use `fs`, `path`, etc. in client-side code
- **API Routes**: Use `/api/` routes for server-side data access
- **External Imports**: Avoid importing files outside `website/` directory
- **Accessibility**: All inputs need labels, focus states, and keyboard navigation
- **Schema Sourcing**: Options come from API routes or build-time imports, not runtime `fs`

### Commit Hooks (Recommended)

Consider setting up Husky for pre-commit quality gates:

```bash
# Install husky
npm install --save-dev husky

# Initialize git hooks
npx husky init

# Add pre-commit hook
echo '#!/usr/bin/env sh
npm run lint
npx tsc --noEmit' > .husky/pre-commit

# Make executable
chmod +x .husky/pre-commit
```

### Code Style

- Follow language-specific conventions
- Use consistent formatting (see `.editorconfig`)
- Write self-documenting code with clear variable names
- Add comments for complex logic

### Documentation

- Keep `README.md` current with setup and usage instructions
- Update documentation for new features/settings
- Document breaking changes with migration guides

## Quality Gates

### Required Checks

- ✅ **Unit tests pass**
- ✅ **Linting passes**
- ✅ **Governance checks pass** (report-only)
- ✅ **Conventional commits**
- ✅ **PR template completed** (Scope Gate + Session Review)

### Optional Checks (Per Project)

- ⏳ **Integration tests** (recommended)
- ⏳ **Performance budgets** (if user-facing)
- ⏳ **Accessibility audits** (if UI)
- ⏳ **Schema validation** (if structured data)

## Review Process

### Automated Checks

- CI runs lint, test, and governance validation
- Governance checks provide actionable feedback (non-blocking)

### Manual Review

- Code review focuses on architecture, testing, and adherence to `.projectrules`
- Reviewers check for proper error handling and edge cases
- Documentation updates verified

### Approval Requirements

- All automated checks pass
- At least one approving review
- Scope Gate checklist completed
- Session Review filled (for multi-commit PRs)

## Rules Governance

The `.projectrules` file evolves with development cycles:

- **Version Control**: Semantic versioning for policy changes
- **Change Documentation**: All modifications logged in changelog
- **Continuous Improvement**: Post-cycle reviews identify optimizations
- **Technology Agnostic**: Rules adapt while maintaining core principles

See [Rules Changelog](docs/rules-changelog.md) for evolution history.

## Getting Help

- **Issues**: Use issue templates for bugs and feature requests
- **Discussions**: Use discussions for questions and ideas
- **Documentation**: Check README.md and `.projectrules` first

## Recognition

Contributors are recognized in project documentation and release notes. Thank you for helping make this project better!
