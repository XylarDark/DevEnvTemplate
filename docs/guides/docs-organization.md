# Documentation Organization Guide

Complete guide to automatically organizing markdown files in your project.

## Overview

DevEnvTemplate includes automatic documentation organization to keep your project root clean and make documentation easy to find. The tool detects markdown files in the project root that should be moved to appropriate directories based on configurable rules.

## Quick Start

### Check What Needs Organization

```bash
devenv organize-docs --dry-run
```

This shows which files would be moved without making any changes.

### Automatically Organize

```bash
devenv organize-docs --auto-fix
```

This moves files to their appropriate directories and stages the moves in git.

## Configuration

### Default Configuration

DevEnvTemplate includes a default configuration file at `config/docs-organization.yaml`:

```yaml
rootExceptions:
  - README.md
  - CHANGELOG.md
  - BOOTSTRAP.md
  - CONTRIBUTING.md
  - LICENSE.md

directoryRules:
  deployment:
    patterns:
      - "*_DEPLOYMENT.md"
      - "*DEPLOYMENT*.md"
    target: "docs/deployment"
  
  api:
    patterns:
      - "*_API*.md"
      - "API*.md"
    target: "docs/api"
  
  guides:
    patterns:
      - "*_GUIDE.md"
      - "GUIDE*.md"
    target: "docs/guides"

defaultTarget: "docs"
```

### Project-Specific Configuration

Projects can override the default configuration by creating:

- `.devenv/config/docs-organization.yaml` (for embedded DevEnvTemplate)
- `config/docs-organization.yaml` (in project root)

The tool checks project-specific config first, then falls back to the default.

## File Naming Patterns

### Deployment Documentation

Files matching these patterns go to `docs/deployment/`:
- `*_DEPLOYMENT.md`
- `*DEPLOYMENT*.md`
- `DEPLOYMENT*.md`
- `*_DEPLOY.md`
- `*RAILWAY*.md`
- `*VERCEL*.md`

**Examples:**
- `RAILWAY_DEPLOYMENT.md` → `docs/deployment/RAILWAY_DEPLOYMENT.md`
- `VERCEL_DEPLOY.md` → `docs/deployment/VERCEL_DEPLOY.md`

### API Documentation

Files matching these patterns go to `docs/api/`:
- `*_API*.md`
- `API*.md`
- `*API_*.md`

**Examples:**
- `API_GUIDE.md` → `docs/api/API_GUIDE.md`
- `REST_API.md` → `docs/api/REST_API.md`

### Guides

Files matching these patterns go to `docs/guides/`:
- `*_GUIDE.md`
- `*GUIDE*.md`
- `GUIDE*.md`

**Examples:**
- `GETTING_STARTED_GUIDE.md` → `docs/guides/GETTING_STARTED_GUIDE.md`
- `USER_GUIDE.md` → `docs/guides/USER_GUIDE.md`

### Quick Start Documentation

Files matching these patterns go to `docs/`:
- `*_QUICK_START.md`
- `*QUICK_START*.md`
- `QUICK_START*.md`
- `*_QUICKSTART.md`

**Examples:**
- `QUICK_START.md` → `docs/QUICK_START.md`
- `RAILWAY_QUICK_START.md` → `docs/RAILWAY_QUICK_START.md`

### Default Target

Files that don't match any pattern go to `docs/` (the default target).

## Root Exceptions

These files always stay in the project root:
- `README.md`
- `CHANGELOG.md`
- `BOOTSTRAP.md` (DevEnvTemplate specific)
- `CONTRIBUTING.md`
- `LICENSE.md`

## CLI Options

### `--dry-run`

Preview what would be moved without making changes:

```bash
devenv organize-docs --dry-run
```

### `--auto-fix`

Automatically move files and stage in git:

```bash
devenv organize-docs --auto-fix
```

### `--verbose`

Show detailed output including reasons for each move:

```bash
devenv organize-docs --dry-run --verbose
```

### `--config`

Use a custom configuration file:

```bash
devenv organize-docs --config path/to/custom-config.yaml
```

### `--project-root`

Specify the project root explicitly:

```bash
devenv organize-docs --project-root /path/to/project
```

## Integration with Doctor

The doctor automatically detects misplaced documentation files:

```bash
npm run doctor
```

**Output:**
```
🟡 Warning: Misplaced Documentation Files
   Description: 2 markdown file(s) in project root should be organized
   Recommendation: Move files to appropriate directories. Run 'devenv organize-docs --auto-fix'
```

### Auto-Fix with Doctor

Automatically organize docs when running doctor:

```bash
npm run doctor --fix
```

This will:
1. Detect misplaced documentation files
2. Organize them automatically
3. Stage moves in git

## Pre-commit Hook

Install a pre-commit hook to prevent committing misplaced docs:

### Manual Installation

```bash
# Copy the hook template
cp .devenv/scripts/doctor/templates/pre-commit-docs-check.sh .git/hooks/pre-commit

# Make it executable
chmod +x .git/hooks/pre-commit
```

### Hook Behavior

The hook:
1. Checks for new markdown files staged in root
2. Warns if files should be organized
3. Optionally auto-organizes (if `DEVENV_AUTO_ORGANIZE_DOCS=true`)

### Auto-Organize on Commit

Set environment variable to auto-organize:

```bash
export DEVENV_AUTO_ORGANIZE_DOCS=true
git commit -m "Add new feature"
```

The hook will automatically organize files before commit.

## Git Integration

When files are moved with `--auto-fix`:
- Files are moved using `fs.rename()`
- Git tracks the move (if files were tracked)
- Changes are automatically staged

**Example:**
```bash
$ devenv organize-docs --auto-fix
✅ Moved 2 file(s):
  • RAILWAY_DEPLOYMENT.md
    → docs/deployment/RAILWAY_DEPLOYMENT.md
  • API_GUIDE.md
    → docs/api/API_GUIDE.md

$ git status
Changes to be committed:
  renamed:    RAILWAY_DEPLOYMENT.md -> docs/deployment/RAILWAY_DEPLOYMENT.md
  renamed:    API_GUIDE.md -> docs/api/API_GUIDE.md
```

## Conflict Handling

If a target file already exists, the move is skipped and reported as a conflict:

```bash
$ devenv organize-docs --auto-fix
⚠️  Conflicts (files not moved):
  • RAILWAY_DEPLOYMENT.md
    Target already exists: docs/deployment/RAILWAY_DEPLOYMENT.md
```

Resolve conflicts manually by:
1. Reviewing both files
2. Merging content if needed
3. Removing the source file
4. Running organize-docs again

## Best Practices

### 1. Use Consistent Naming

Follow the naming patterns defined in the configuration:
- Deployment docs: `*_DEPLOYMENT.md`
- API docs: `*_API*.md`
- Guides: `*_GUIDE.md`

### 2. Keep Root Clean

Only keep essential files in root:
- `README.md` - Project overview
- `CHANGELOG.md` - Version history
- `CONTRIBUTING.md` - Contribution guidelines
- `LICENSE.md` - License information

### 3. Organize Early

Run `devenv organize-docs` regularly to keep documentation organized:
- After creating new documentation
- Before committing changes
- As part of your pre-commit workflow

### 4. Use Pre-commit Hook

Install the pre-commit hook to prevent misplaced docs from being committed:

```bash
cp .devenv/scripts/doctor/templates/pre-commit-docs-check.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### 5. Customize Configuration

Create project-specific configuration for custom organization rules:

```yaml
# .devenv/config/docs-organization.yaml
directoryRules:
  custom:
    patterns:
      - "*_CUSTOM*.md"
    target: "docs/custom"
```

## Troubleshooting

### Files Not Detected

If files aren't being detected:
1. Check file extension is `.md`
2. Verify file is in project root (not subdirectories)
3. Check if file matches a root exception

### Files Not Moving

If files aren't moving:
1. Check for conflicts (target file exists)
2. Verify write permissions
3. Check git status (untracked files may not stage)

### Configuration Not Loading

If configuration isn't loading:
1. Verify YAML syntax is correct
2. Check file path (`.devenv/config/` or `config/`)
3. Verify file is readable

## Examples

### Example 1: Organize Deployment Docs

```bash
# Before
project-root/
├── README.md
├── RAILWAY_DEPLOYMENT.md
└── VERCEL_DEPLOYMENT.md

# Run organize
$ devenv organize-docs --auto-fix

# After
project-root/
├── README.md
└── docs/
    └── deployment/
        ├── RAILWAY_DEPLOYMENT.md
        └── VERCEL_DEPLOYMENT.md
```

### Example 2: Organize API Documentation

```bash
# Before
project-root/
├── README.md
├── API_GUIDE.md
└── REST_API.md

# Run organize
$ devenv organize-docs --auto-fix

# After
project-root/
├── README.md
└── docs/
    └── api/
        ├── API_GUIDE.md
        └── REST_API.md
```

## See Also

- [Usage Guide](../USAGE.md) - General DevEnvTemplate usage
- [Best Practices](../BEST-PRACTICES.md) - Development best practices
- [Troubleshooting](../TROUBLESHOOTING.md) - Common issues and solutions

