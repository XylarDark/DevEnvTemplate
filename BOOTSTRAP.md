# DevEnvTemplate Bootstrap Guide

**Version:** Technology-Agnostic Template  
**Purpose:** Single-file-loads-all reference for LLM-assisted development sessions  
**Last Updated:** 2025

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

---

## Documentation Map

### Essential Documentation Files

| File | Purpose | When to Use |
|------|---------|-------------|
| `docs/LLM-CONTEXT-GUIDE.md` | Complete DevEnvTemplate command reference | Need detailed command documentation |
| `docs/LLM-REFERENCE.md` | Technology-agnostic template for project extensions | Creating project-specific LLM reference |
| `docs/LLM-FILE-INDEX.md` | Navigation checklist for LLMs | Starting new AI session, need file list |
| `docs/USAGE.md` | Day-to-day workflows | Daily operations |
| `docs/SETUP-GUIDE.md` | Initial embedding instructions | First-time setup |
| `docs/EMBEDDED-USAGE.md` | Ongoing embedded usage | Using DevEnvTemplate after setup |
| `docs/SYNC.md` | Syncing with template updates | Maintaining sync with DevEnvTemplate |
| `docs/TROUBLESHOOTING.md` | Problem-solution guide | Encountering issues |
| `docs/PROJECTRULES-UPDATE-v3.0.md` | Engineering rules and guidelines | Need coding standards |
| `docs/BEST-PRACTICES.md` | Technology-agnostic best practices | General development patterns |
| `docs/ARCHITECTURE.md` | Project structure and design | Understanding internals |
| `docs/guides/docs-organization.md` | Documentation organization guide | Organizing markdown files |

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

---

## Reference Links

### Essential Documentation

- **[LLM-CONTEXT-GUIDE.md](docs/LLM-CONTEXT-GUIDE.md)** - Complete command and workflow reference
- **[LLM-REFERENCE.md](docs/LLM-REFERENCE.md)** - Template for project-specific extensions
- **[LLM-FILE-INDEX.md](docs/LLM-FILE-INDEX.md)** - Navigation checklist
- **[USAGE.md](docs/USAGE.md)** - Day-to-day workflows
- **[SETUP-GUIDE.md](docs/SETUP-GUIDE.md)** - Initial setup instructions
- **[EMBEDDED-USAGE.md](docs/EMBEDDED-USAGE.md)** - Ongoing usage guide
- **[SYNC.md](docs/SYNC.md)** - Syncing with template updates
- **[TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** - Problem solutions
- **[PROJECTRULES-UPDATE-v3.0.md](docs/PROJECTRULES-UPDATE-v3.0.md)** - Engineering rules
- **[BEST-PRACTICES.md](docs/BEST-PRACTICES.md)** - Best practices
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Project structure

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
| `node` | `package.json`, `node_modules/` | Vitest, ESLint, Playwright |
| `python` | `pyproject.toml`, `requirements.txt` | Pytest, Ruff, Black, Mypy |
| `node + python` | Both present | Separate sections for each |

---

**End of DevEnvTemplate Bootstrap Guide**

*This file is the technology-agnostic template. Projects should copy and extend it with project-specific content.*

