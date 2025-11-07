# DevEnvTemplate Usage Guide

Quick reference for DevEnvTemplate commands and features.

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
npm run build  # Compiles TypeScript
```

### 2. Generate Project Manifest
```bash
npm run agent:init  # Interactive CLI
```

Creates `project.manifest.json` with your project requirements.

## Core Commands

### Cleanup Engine

Remove template artifacts after scaffolding:

```bash
# Preview changes (dry run - default)
npm run cleanup

# Apply changes
npm run cleanup -- --apply

# With performance metrics
npm run cleanup -- --performance --apply

# Disable caching
npm run cleanup -- --no-cache --apply

# Specify profile
npm run cleanup -- --profile minimal --apply

# Feature flags
npm run cleanup -- --feature auth,api --apply
```

**Common Flags:**
- `--apply` - Apply changes (default is dry-run)
- `--performance` - Show performance metrics and recommendations
- `--cache` / `--no-cache` - Control configuration caching (default: enabled)
- `--profile <name>` - Use specific cleanup profile
- `--feature <list>` - Enable feature flags
- `--only <rules>` - Run only specific rules
- `--exclude <rules>` - Exclude specific rules
- `--keep <files>` - Preserve files that match removal rules

### CI Tools

#### Stack Detection
```bash
node .github/tools/stack-detector.js
```
Detects technologies and generates `.devenv/stack-report.json`

#### Gap Analysis
```bash
node .github/tools/gap-analyzer.js
```
Analyzes project against best practices, generates `.devenv/gaps-report.md`

#### Plan Generation
```bash
node .github/tools/plan-generator.js
```
Generates actionable plan from gaps, creates `.devenv/hardening-plan.md`

## Features

### Performance Tracking

Track cleanup performance with detailed metrics:

```bash
npm run cleanup -- --performance --apply
```

**Output includes:**
- Total duration and throughput
- Files processed and scanned
- Rule execution timing
- Memory usage (heap, RSS)
- Cache efficiency
- Slowest rules and files
- Optimization recommendations

### Caching

Config caching is enabled by default for 2-3x speedup:

```bash
# Uses cache (default)
npm run cleanup -- --apply

# Disable cache
npm run cleanup -- --no-cache --apply
```

**How it works:**
- Configuration files are cached after first parse
- SHA-256 content hashing ensures accuracy
- Automatic invalidation when files change
- 1-hour TTL prevents stale data

### Testing

```bash
# Run all tests
npm test

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Watch mode
npm run test:watch
```

## Project Structure

```
DevEnvTemplate/
├── .github/
│   ├── tools/              # CI tools (stack detector, gap analyzer, plan generator)
│   ├── types/              # TypeScript type definitions for CI tools
│   └── workflows/          # GitHub Actions CI/CD
├── scripts/
│   ├── cleanup/            # Cleanup engine
│   ├── agent/              # Agent CLI for manifest generation
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utilities (logger, cache, path resolver)
├── tests/
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── fixtures/           # Test fixtures
├── docs/                   # Documentation
├── dist/                   # Compiled TypeScript (generated)
├── .cache/                 # Cache directory (generated)
├── .devenv/                # CI artifacts (generated)
├── .projectrules           # Governance rules
└── project.manifest.json   # Project configuration
```

## Environment Variables

### Logging
- `LOG_LEVEL` - Set log level (DEBUG, INFO, WARN, ERROR, SILENT)
- `LOG_JSON` - Enable JSON output (true/false)

Example:
```bash
LOG_LEVEL=DEBUG npm run cleanup -- --apply
LOG_JSON=true npm run cleanup -- --apply
```

## Common Workflows

### New Project Setup
1. `npm install && npm run build`
2. `npm run agent:init` (generate manifest)
3. `npm run cleanup -- --apply` (remove template code)
4. Start developing!

### Performance Analysis
1. `npm run cleanup -- --performance --dry-run`
2. Review recommendations in output
3. Optimize slow rules or files

### CI Integration
CI automatically runs:
1. Stack detection → `.devenv/stack-report.json`
2. Gap analysis → `.devenv/gaps-report.md`
3. Plan generation → `.devenv/hardening-plan.md` (if gaps found)

## Troubleshooting

### Build Errors
```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### Test Failures
```bash
# Rebuild TypeScript first
npm run build
npm test
```

### Cache Issues
```bash
# Clear cache
rm -rf .cache
npm run cleanup -- --no-cache --apply
```

## Getting Help

- **Implementation Guide**: See `IMPLEMENTATION_GUIDE.md` for technical details
- **Contributing**: See `.github/CONTRIBUTING.md` for development patterns
- **Project Rules**: See `.projectrules` for governance guidelines
- **Changelog**: See `docs/rules-changelog.md` for evolution history

