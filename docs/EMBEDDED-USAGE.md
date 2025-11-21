# Embedded Usage Guide

**Purpose:** Ongoing usage workflows for DevEnvTemplate when embedded as `.devenv/` inside a project.

> **Before You Start:** If you haven't embedded DevEnvTemplate yet, see [SETUP-GUIDE.md](SETUP-GUIDE.md) for initial setup instructions.

This guide covers **ongoing usage** after DevEnvTemplate is already embedded. For the initial one-time setup process, see [SETUP-GUIDE.md](SETUP-GUIDE.md).

## Overview

When DevEnvTemplate is embedded as `.devenv/` in your project, you can use it to:
- Analyze and improve your project's health
- Run doctor commands from project root or `.devenv/` directory
- Maintain project-specific configurations
- Integrate with CI/CD workflows

## Quick Start (After Setup)

If DevEnvTemplate is already embedded and built:

```bash
# From project root (recommended)
npm run doctor --prefix .devenv

# Or from .devenv directory
cd .devenv
npm run doctor
```

> **First Time Setup?** If you haven't embedded DevEnvTemplate yet, see [SETUP-GUIDE.md](SETUP-GUIDE.md) for complete setup instructions.

## Running Doctor Commands

The doctor command automatically detects when it's running from `.devenv/` and analyzes the parent project:

```bash
# From project root (recommended)
npm run doctor --prefix .devenv

# With auto-fix
npm run doctor --prefix .devenv -- --fix

# JSON output for automation
npm run doctor --prefix .devenv -- --json

# Or with explicit project root
npm run doctor --prefix .devenv -- --project-root ..
```

## Cross-Platform Commands

### Bash/zsh (Linux/macOS)

```bash
# Navigate and run
cd .devenv
npm run doctor

# Or from project root
npm run doctor --prefix .devenv
```

### PowerShell (Windows)

```powershell
# Navigate and run
Set-Location .devenv
npm run doctor

# Or from project root
npm run doctor --prefix .devenv

# Command chaining (use ; not &&)
Set-Location .devenv; npm run doctor
```

## Project Root Detection

DevEnvTemplate automatically detects the project root when:

1. **Running from `.devenv/` directory**: Automatically walks up one level
2. **Environment variable**: `DEVENV_PROJECT_ROOT` set to project root path
3. **CLI flag**: `--project-root <path>` explicitly specifies project root

### Auto-Detection Logic

The doctor command checks:
- If current directory is `.devenv`, walk up to parent
- If `package.json` name is `devenv-template`, walk up to parent
- Look for project root markers: `package.json`, `pyproject.toml`, `.git`, etc.

### Manual Override

```bash
# Environment variable
DEVENV_PROJECT_ROOT=/path/to/project npm run doctor --prefix .devenv

# CLI flag
npm run doctor --prefix .devenv -- --project-root /path/to/project
```

## Generated Files

When running from embedded `.devenv/`, generated files are placed in the **parent project's** `.devenv/` directory:

```
your-project/
├── .devenv/              # DevEnvTemplate checkout
│   ├── scripts/
│   └── ...
└── .devenv/              # Generated reports (parent project)
    ├── stack-report.json
    ├── gaps-report.md
    └── health-report.json
```

**Note**: The parent project's `.devenv/` directory is created automatically if it doesn't exist.

## Common Issues

### Issue: Doctor Analyzes DevEnvTemplate Instead of Parent Project

**Symptom**: Reports show DevEnvTemplate's stack instead of your project.

**Solution**:
```bash
# Run from project root with explicit path
npm run doctor --prefix .devenv -- --project-root ..

# Or set environment variable
DEVENV_PROJECT_ROOT=.. npm run doctor --prefix .devenv
```

### Issue: PowerShell Command Chaining Fails

**Symptom**: `The token '&&' is not a valid statement separator`

**Solution**: Use `;` instead of `&&`:
```powershell
# ❌ Wrong
cd .devenv && npm run doctor

# ✅ Correct
Set-Location .devenv; npm run doctor
```

### Issue: Build Artifacts Not Found

**Symptom**: `Cannot find module '...scripts/doctor/cli.js'`

**Solution**: Build TypeScript first:
```bash
cd .devenv
npm run build
npm run doctor
```

### Issue: JSON Parsing Errors

**Symptom**: `Expected ',' or ']' after array element in JSON`

**Solution**: Use `--json` flag for clean JSON output:
```bash
npm run doctor --prefix .devenv -- --json
```

## Best Practices

1. **Always run from project root**: Use `npm run doctor --prefix .devenv`
2. **Build before running**: Ensure `npm run build` has been executed
3. **Use explicit project root**: When in doubt, use `--project-root` flag
4. **Check generated files**: Verify reports are in parent project's `.devenv/`
5. **Cross-platform scripts**: Test commands in both bash and PowerShell

## Workflow Example

```bash
# 1. Clone DevEnvTemplate
git submodule add https://github.com/your-org/DevEnvTemplate.git .devenv

# 2. Install and build
cd .devenv
npm install
npm run build
cd ..

# 3. Run doctor from project root
npm run doctor --prefix .devenv

# 4. Review reports
cat .devenv/health-report.json

# 5. Apply fixes
npm run doctor --prefix .devenv -- --fix
```

## Syncing with Template Updates

To keep your `.devenv` up to date with the latest DevEnvTemplate improvements:

```bash
# Bash/Linux/macOS
cd .devenv
./scripts/sync-from-template.sh

# PowerShell/Windows
cd .devenv
.\scripts\sync-from-template.ps1
```

The sync scripts will:
- Preserve project-specific files (health reports, gap analysis, etc.)
- Pull updates from the template repository
- Rebuild the project after syncing

See [SYNC.md](SYNC.md) for detailed sync documentation and troubleshooting.

## Project-Specific Customizations

You can customize `.devenv` for your project by adding:

- **Best Practices**: Add technology-specific guides in `best-practices/`
- **Configuration**: Add project-specific configs in `config/project/`
- **Documentation**: Add project-specific docs in `docs/` (they won't conflict with template updates)

These customizations are preserved during sync operations.

## Related Documentation

- **[SETUP-GUIDE.md](SETUP-GUIDE.md)** - Initial one-time setup (embedding DevEnvTemplate)
- **[SYNC.md](SYNC.md)** - Syncing with template updates
- **[USAGE.md](USAGE.md)** - General DevEnvTemplate usage and day-to-day workflows
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions (includes embedded usage issues)
- **[BEST-PRACTICES.md](BEST-PRACTICES.md)** - Development best practices

