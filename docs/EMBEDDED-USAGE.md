# Embedded Usage Guide

This guide explains how to use DevEnvTemplate when it's embedded as a `.devenv/` folder inside another project.

## Overview

When DevEnvTemplate is cloned into a project's `.devenv/` directory, it can analyze and improve the parent project. This is useful for:
- Adding DevEnvTemplate capabilities to existing projects
- Keeping DevEnvTemplate as a submodule
- Maintaining project-specific configurations

## Setup

### 1. Clone DevEnvTemplate into `.devenv/`

```bash
# From your project root
git clone https://github.com/your-org/DevEnvTemplate.git .devenv
```

Or add as a submodule:

```bash
git submodule add https://github.com/your-org/DevEnvTemplate.git .devenv
```

### 2. Install Dependencies

```bash
# Bash/zsh
cd .devenv
npm install
npm run build

# PowerShell
Set-Location .devenv
npm install
npm run build
```

### 3. Run Doctor from Project Root

The doctor command automatically detects when it's running from `.devenv/` and analyzes the parent project:

```bash
# From project root (recommended)
npm run doctor --prefix .devenv

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

## Related Documentation

- [Usage Guide](USAGE.md) - General DevEnvTemplate usage
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues and solutions
- [Best Practices](BEST-PRACTICES.md) - Development best practices

