# .devenv Structure and Alignment

This document explains the structure of `.devenv/` and how it aligns with DevEnvTemplate while maintaining project-specific customizations.

## Core Structure Alignment

The `.devenv/` directory structure is aligned with DevEnvTemplate, with the following core directories matching:

- ✅ `config/` - Configuration files
- ✅ `docs/` - Documentation (including `LLM-REFERENCE.md`)
- ✅ `scripts/` - Source code and utilities
- ✅ `tests/` - Test suite
- ✅ `dist/` - Build output (gitignored)

## Project-Specific Additions

The following files and directories are project-specific additions to the base DevEnvTemplate structure:

### Root-Level Project-Specific Files

- **`IMPLEMENTATION_SUMMARY.md`** - Project-specific implementation notes
- **`MISTAKE_PATTERNS.md`** - Common mistakes specific to this project
- **`REPOSITORY_STRUCTURE.md`** - Project-specific repository structure documentation

These files document project-specific patterns and should remain at the root level.

### Project-Specific Directories

- **`best-practices/`** - Technology-specific best practices
  - `python.md` - Python-specific guidelines
  - `nextjs.md` - Next.js-specific guidelines (for web-demo)
  - `fastapi.md` - FastAPI-specific guidelines
  - `deployment.md` - Deployment-specific guidelines

### Project-Specific Configuration Files

- **`config/python-best-practices.json`** - Python-specific quality configuration
- **`config/shell-aliases.ps1`** - PowerShell aliases for Windows development
- **`config/shell-aliases.sh`** - Bash aliases for Linux/macOS development

### Project-Specific Scripts

- **`scripts/check-env.ps1`** - PowerShell script for environment validation
- **`scripts/check-env.sh`** - Bash script for environment validation
- **`scripts/validate-paths.py`** - Python script for path validation

## Alignment with DevEnvTemplate

### Files That Match DevEnvTemplate

All core DevEnvTemplate files are present and aligned:
- `README.md` - Base DevEnvTemplate README (extended with project-specific info)
- `CHANGELOG.md` - DevEnvTemplate changelog
- `LICENSE` - MIT License
- `package.json` - Node.js dependencies
- `tsconfig*.json` - TypeScript configuration
- `commitlint.config.js` - Commit linting configuration
- `docs/LLM-REFERENCE.md` - ✅ Now in correct location (moved from root)

### Documentation Structure

The `docs/` directory structure matches DevEnvTemplate:
- All standard DevEnvTemplate documentation files
- `LLM-REFERENCE.md` - Project-specific extension of DevEnvTemplate template
- `archive/` - Historical documentation

## Backporting Guidelines

When adding improvements to `.devenv/`, consider:

1. **Technology-agnostic improvements** → Should be backported to DevEnvTemplate
2. **Python-specific improvements** → Keep in `.devenv/` only
3. **Simulation-specific improvements** → Keep in `.devenv/` only
4. **Workflow patterns** → Consider backporting if applicable to other projects

## Maintenance

To keep `.devenv/` aligned with DevEnvTemplate:

1. **Pull updates from DevEnvTemplate** - Keep core files in sync
2. **Preserve project-specific files** - Don't overwrite project customizations
3. **Document additions** - Update this file when adding project-specific files
4. **Backport improvements** - Contribute reusable improvements back to DevEnvTemplate

## File Locations

### Standard DevEnvTemplate Files (Aligned)
- `docs/LLM-REFERENCE.md` - ✅ In docs/ directory (aligned)
- `config/cleanup.config.yaml` - Standard cleanup configuration
- `config/quality-budgets.json` - Standard quality budgets
- `scripts/` - Standard DevEnvTemplate scripts

### Project-Specific Files (Keep Separate)
- `best-practices/` - Project-specific best practices
- `config/python-best-practices.json` - Python-specific config
- `config/shell-aliases.*` - Shell-specific aliases
- `scripts/check-env.*` - Project-specific environment validation
- `scripts/validate-paths.py` - Project-specific path validation
- Root-level project docs: `IMPLEMENTATION_SUMMARY.md`, `MISTAKE_PATTERNS.md`, `REPOSITORY_STRUCTURE.md`

---

**Last Updated:** 2025  
**Alignment Status:** ✅ Core structure aligned, project-specific additions documented

