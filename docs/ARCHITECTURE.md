# Project Architecture

## Overview

DevEnvTemplate is a toolkit for modern development environment management, focused on indie developer workflows. It provides automated project analysis, health checking, and configuration setup.

## Directory Structure

### Root Level

```
DevEnvTemplate/
├── .github/            # GitHub-specific files
├── config/             # Configuration files
├── docs/               # Documentation
├── scripts/            # Source code (TypeScript)
├── tests/              # Test suite
├── CHANGELOG.md        # Version history
├── LICENSE             # MIT License
├── package.json        # Node dependencies & scripts
├── README.md           # Main documentation
└── tsconfig*.json      # TypeScript configuration
```

### Source Code (`scripts/`)

All source code is organized under `scripts/` directory:

```
scripts/
├── agent/              # Project initialization & setup
│   ├── cli-simple.js   # Simple standalone CLI
│   ├── cli.js          # Wrapper for backward compatibility
│   ├── cli.ts          # Main TypeScript implementation
│   └── questionnaire.js # Interactive setup questions
│
├── cleanup/            # Template cleanup utilities
│   ├── engine.ts       # Cleanup engine implementation
│   └── package-managers/ # Package manager adapters
│
├── doctor/             # Health checking & auto-fixes
│   ├── cli.ts          # Doctor mode CLI
│   ├── installers.ts   # Dependency installer
│   ├── quick-wins.ts   # Quick-fix registry
│   └── templates/      # Config templates
│       ├── eslint-*.json
│       ├── tsconfig-*.json
│       └── prettierrc.json
│
├── tools/              # Analysis tools (moved from .github/tools)
│   ├── stack-detector.js  # Technology stack detection
│   ├── gap-analyzer.js    # Gap analysis
│   ├── gap-analyzer.ts
│   ├── plan-generator.js  # Improvement plan generation
│   └── plan-generator.ts
│
├── types/              # TypeScript type definitions
│   ├── cleanup.ts      # Cleanup types
│   ├── gaps.ts         # Gap analysis types
│   ├── manifest.ts     # Project manifest types
│   ├── performance.ts  # Performance tracking types
│   └── plan.ts         # Plan generation types
│
├── utils/              # Shared utilities (TypeScript only)
│   ├── cache.ts        # Caching utilities
│   ├── logger.ts       # Logging utilities
│   ├── parallel.ts     # Parallel execution
│   ├── path-resolver.ts # Path resolution
│   └── progress.ts     # Progress reporting
│
├── init.js             # Main initialization script
└── init-cleanup.js     # Cleanup initialization
```

### Documentation (`docs/`)

```
docs/
├── archive/                    # Historical documentation
│   ├── PHASE2-COMPLETE.md
│   ├── RELEASE_NOTES_v3.0.0.md
│   ├── IMPLEMENTATION-SUMMARY-v3.x.md
│   └── plans/                  # Historical planning docs
│
├── guides/                     # Integration guides
│   ├── cursor-plan-integration.md
│   └── troubleshooting.md
│
├── ARCHITECTURE.md             # This file
├── LLM-CONTEXT-GUIDE.md        # Context for AI assistants
├── TROUBLESHOOTING.md          # Troubleshooting guide
└── USAGE.md                    # Usage documentation
```

### Configuration (`config/`)

```
config/
├── cleanup.config.yaml         # Cleanup rules
├── quality-budgets.json        # Quality thresholds
└── schemas/                    # JSON schemas
    └── project.manifest.schema.json
```

### Tests (`tests/`)

```
tests/
├── fixtures/           # Test data & sample projects
│   ├── nextjs-app-dir/
│   ├── vite-react/
│   └── express-api/
│
├── integration/        # Integration tests
├── unit/              # Unit tests
└── utils/             # Test helpers
```

## Module Responsibilities

### Agent Module (`scripts/agent/`)

**Purpose**: Project initialization and setup

**Key Features**:
- Interactive project questionnaire
- Manifest generation (`project.manifest.json`)
- Multiple implementation variants:
  - `cli-simple.js`: Standalone, no dependencies
  - `cli.ts`: Full-featured TypeScript implementation
  - `cli.js`: Wrapper for backward compatibility

**Entry Points**:
- `npm run agent:init`
- `npm run agent:init-simple`

### Doctor Module (`scripts/doctor/`)

**Purpose**: Project health analysis and automated fixes

**Key Features**:
- Health scoring across 5 categories (Testing, CI/CD, Type Safety, Environment, Linting)
- Framework-aware configuration generation (Next.js, Vite, Express)
- Quick-win registry for common issues
- Automatic dependency installation
- Dry-run mode for previewing changes

**Entry Points**:
- `npm run doctor` - Health check
- `npm run doctor -- --fix` - Auto-fix issues
- `npm run doctor -- --json` - JSON output

### Cleanup Module (`scripts/cleanup/`)

**Purpose**: Remove template-specific files and setup new projects

**Key Features**:
- Multi-package-manager support (npm, pnpm, yarn)
- Template file removal
- Dependency cleanup
- Git history cleanup

**Entry Points**:
- `npm run cleanup`

### Tools Module (`scripts/tools/`)

**Purpose**: Analysis and planning utilities

**Key Features**:
- Stack detection (frameworks, languages, tooling)
- Gap analysis (identify missing best practices)
- Improvement plan generation

**Used By**: Doctor module, CI workflows

### Utils Module (`scripts/utils/`)

**Purpose**: Shared utilities across all modules

**Key Features**:
- Caching for performance
- Structured logging
- Parallel execution helpers
- Path resolution
- Progress reporting

**Design Principle**: Pure TypeScript, no JavaScript duplicates

## Data Flow

### Doctor Mode Workflow

```
User runs: npm run doctor --fix

1. Stack Detection (scripts/tools/stack-detector.js)
   ↓
   Analyzes project files to identify:
   - Frameworks (Next.js, Vite, Express, etc.)
   - Languages (TypeScript, JavaScript, Python)
   - Tooling (ESLint, Prettier, Jest, etc.)
   ↓
2. Gap Analysis (scripts/tools/gap-analyzer.ts)
   ↓
   Compares detected stack against best practices:
   - Missing configurations
   - Missing dependencies
   - Missing CI/CD
   - Environment variable issues
   ↓
3. Health Scoring (scripts/doctor/cli.ts)
   ↓
   Calculates weighted scores:
   - Testing: 25%
   - CI/CD: 20%
   - Type Safety: 20%
   - Environment: 15%
   - Linting: 20%
   ↓
4. Quick Wins Registry (scripts/doctor/quick-wins.ts)
   ↓
   Matches gaps to fixable actions
   ↓
5. Auto-Fix (scripts/doctor/cli.ts + installers.ts)
   ↓
   Applies fixes:
   - Generates configs from templates
   - Installs dependencies (respects --no-install)
   - Adds npm scripts
   - Creates missing files
   ↓
6. Report
   ↓
   Outputs health report (text or JSON)
```

### Agent Init Workflow

```
User runs: npm run agent:init

1. Questionnaire (scripts/agent/questionnaire.js)
   ↓
   Prompts for:
   - Project name & description
   - Tech stack
   - Author info
   ↓
2. Manifest Generation (scripts/agent/cli.ts)
   ↓
   Creates project.manifest.json
   ↓
3. Stack Setup
   ↓
   Optionally runs doctor --fix with detected preset
```

## Technology Stack

- **Language**: TypeScript (compiled to JavaScript)
- **Runtime**: Node.js 20+
- **Package Manager**: npm (also supports pnpm, yarn)
- **Testing**: Node.js built-in test runner
- **CI/CD**: GitHub Actions
- **Linting**: ESLint + Prettier

## Design Principles

### 1. TypeScript First

- All new code is written in TypeScript
- TypeScript is the source of truth
- JavaScript files are only for:
  - Backward compatibility wrappers
  - Standalone tools (cli-simple.js)

### 2. Minimal Dependencies

- Prefer Node.js built-in modules
- No heavy frameworks
- Small install footprint (<50MB node_modules)

### 3. Framework Awareness

- Detect project context (Next.js, Vite, Express, etc.)
- Generate appropriate configs for each framework
- Provide framework-specific guidance

### 4. Performance Optimization

- Target: Doctor mode < 2s on typical projects
- Caching for repeated operations
- Parallel execution where possible
- Minimal file I/O

### 5. Indie Developer Focus

- Free-tier CI optimization
- Quick wins over perfect solutions
- One-command operations
- Non-blocking workflows

## File Organization Rules

### When to Add New Files

**Create new module** (`scripts/[module]/`) if:
- Functionality is standalone (can run independently)
- Has its own CLI entry point
- Significant codebase (>500 lines)

**Add to existing module** if:
- Extends existing functionality
- Shares types/utilities
- Part of same workflow

**Add to utils** if:
- Used by 3+ modules
- Pure utility function
- No business logic

**Add to types** if:
- Shared TypeScript types
- Used across modules
- Part of public API

### Naming Conventions

- **Files**: kebab-case (`stack-detector.js`, `quick-wins.ts`)
- **Directories**: kebab-case (`scripts/doctor/`, `docs/archive/`)
- **TypeScript types**: PascalCase (`StackReport`, `HealthScore`)
- **Functions**: camelCase (`detectStack`, `calculateScore`)

## Build & Development

### Build Process

```bash
# Compile TypeScript to JavaScript
npm run build

# Output: dist/ directory (gitignored)
```

### Development Workflow

```bash
# Run tests
npm test

# Run doctor on self
npm run doctor

# Type checking
npm run typecheck

# Linting
npm run lint
```

### CI/CD

GitHub Actions workflow (`.github/workflows/indie-ci.yml`):
1. **Quick Checks**: Lint + Type check (parallel)
2. **Tests**: Unit + Integration tests
3. **Doctor**: Health report (non-blocking)

**Optimizations**:
- Caches: node_modules, npm cache, TypeScript builds
- Target: <2.5 minutes total runtime
- Free-tier compatible

## Migration History

### Recent Restructuring (v3.x)

**Phase 1: Documentation Consolidation**
- Moved USAGE.md, TROUBLESHOOTING.md to `docs/`
- Created `docs/archive/` for historical docs
- Consolidated duplicate issue templates

**Phase 2: Source Organization**
- Eliminated JS/TS duplicates in `scripts/utils/`
- Moved `.github/tools/` to `scripts/tools/`
- Merged `.github/types/` into `scripts/types/`

**Phase 3: Configuration Consolidation**
- Moved `schemas/` into `config/schemas/`
- Single configuration directory

**Phase 4: Build Artifacts**
- Updated .gitignore to exclude `dist/`, `*.tsbuildinfo`
- Removed build artifacts from version control

## Contributing

When contributing to this project:

1. **Follow the directory structure** - Add files to appropriate modules
2. **Use TypeScript** - All new code should be .ts (exceptions: wrappers, standalone tools)
3. **Update tests** - Add tests in `tests/unit/` or `tests/integration/`
4. **Update docs** - Document new features in `docs/USAGE.md`
5. **Run doctor** - Ensure project passes health checks

## References

- [Main README](../README.md) - Getting started
- [Usage Guide](USAGE.md) - Detailed command reference
- [LLM Context Guide](LLM-CONTEXT-GUIDE.md) - For AI assistants
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues

