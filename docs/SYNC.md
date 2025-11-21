# Syncing .devenv with DevEnvTemplate

This document explains how to keep `.devenv` synchronized with the `DevEnvTemplate` repository while preserving project-specific files.

## Overview

The `.devenv` directory is a separate git repository that should be kept in sync with `DevEnvTemplate`. However, some files are project-specific and should be preserved during sync:

- `health-report.json` - Project health scores
- `gaps-report.md` - Gap analysis for this project
- `stack-report.json` - Detected technology stack for this project
- `health-before.json` - Previous health snapshot (if exists)
- `health-after.json` - Health after fixes (if exists)
- `input.txt` - Any project-specific input files

## Quick Sync

### Bash/Linux/macOS

```bash
cd .devenv
./scripts/sync-from-template.sh [path-to-DevEnvTemplate]
```

### PowerShell/Windows

```powershell
cd .devenv
.\scripts\sync-from-template.ps1 [path-to-DevEnvTemplate]
```

If `DevEnvTemplate` is in `../../DevEnvTemplate` relative to `.devenv`, you can omit the path argument.

## What the Sync Script Does

1. **Backs up project-specific files** to a temporary directory
2. **Stashes uncommitted changes** in `.devenv` (if any)
3. **Fetches updates** from the template repository
4. **Merges updates** from the template branch
5. **Restores project-specific files** from backup
6. **Rebuilds** the project (runs `npm install` and `npm run build`)

## Manual Sync Process

If you prefer to sync manually:

### 1. Backup Project-Specific Files

```bash
# Bash
mkdir -p .backup
cp health-report.json gaps-report.md stack-report.json .backup/ 2>/dev/null || true

# PowerShell
New-Item -ItemType Directory -Path .backup -Force
Copy-Item health-report.json, gaps-report.md, stack-report.json .backup/ -ErrorAction SilentlyContinue
```

### 2. Stash Uncommitted Changes

```bash
cd .devenv
git stash push -m "Backup before sync $(date +%Y-%m-%d)"
```

### 3. Add Template Remote (if not already added)

```bash
# If DevEnvTemplate is a local directory
git remote add template ../DevEnvTemplate
# Or if it's a remote repository
git remote add template https://github.com/XylarDark/DevEnvTemplate.git
```

### 4. Fetch and Merge

```bash
# Get the branch name from template
cd ../DevEnvTemplate
TEMPLATE_BRANCH=$(git rev-parse --abbrev-ref HEAD)
cd ../.devenv

# Fetch and merge
git fetch template $TEMPLATE_BRANCH
git merge template/$TEMPLATE_BRANCH --no-edit
```

### 5. Restore Project-Specific Files

```bash
# Bash
cp .backup/* . 2>/dev/null || true
rm -rf .backup

# PowerShell
Copy-Item .backup\* . -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .backup
```

### 6. Rebuild

```bash
npm install
npm run build
```

## Handling Merge Conflicts

If merge conflicts occur:

1. **Resolve conflicts manually** using your preferred git tool
2. **Restore project-specific files** from backup (they won't conflict, but may have been overwritten)
3. **Complete the merge** with `git merge --continue`
4. **Rebuild** the project

## Project-Specific Files

These files are **always preserved** during sync:

| File | Description |
|------|-------------|
| `health-report.json` | Overall project health scores |
| `gaps-report.md` | Detailed gap analysis report |
| `stack-report.json` | Detected technology stack |
| `health-before.json` | Previous health snapshot |
| `health-after.json` | Health after fixes |
| `input.txt` | Project-specific input files |

These files are **gitignored** in DevEnvTemplate, so they won't cause conflicts, but the sync script backs them up to be safe.

## Project-Specific Directories

These directories may contain project-specific content and should be preserved:

- `best-practices/` - Project-specific best practices
- `config/project/` - Project-specific configuration files
- `docs/archive/` - Historical project documentation

The sync scripts preserve these directories automatically.

## Git Remote Configuration

The sync script automatically adds a `template` remote pointing to your DevEnvTemplate repository. You can verify this:

```bash
cd .devenv
git remote -v
```

You should see:
```
origin    https://github.com/XylarDark/DevEnvTemplate.git (fetch)
origin    https://github.com/XylarDark/DevEnvTemplate.git (push)
template  /path/to/DevEnvTemplate (fetch)
template  /path/to/DevEnvTemplate (push)
```

## Best Practices

1. **Sync regularly** - Keep `.devenv` up to date with the latest DevEnvTemplate improvements
2. **Review changes** - After syncing, review what changed: `git log template/master..HEAD`
3. **Test after sync** - Run `npm run doctor` to ensure everything still works
4. **Commit after sync** - If you make any project-specific customizations, commit them separately

## Troubleshooting

### "Template path does not exist"

Make sure the path to DevEnvTemplate is correct. You can specify it explicitly:

```bash
./scripts/sync-from-template.sh /absolute/path/to/DevEnvTemplate
```

### "Merge conflicts detected"

Resolve conflicts manually, then restore project files:

```bash
# Resolve conflicts in your editor
git add .
git merge --continue

# Restore project files (if needed)
cp .backup/* . 2>/dev/null || true
```

### "Build fails after sync"

Try cleaning and rebuilding:

```bash
rm -rf node_modules dist
npm install
npm run build
```

## Related Documentation

- [EMBEDDED-USAGE.md](EMBEDDED-USAGE.md) - Using DevEnvTemplate in embedded mode
- [SETUP-GUIDE.md](SETUP-GUIDE.md) - Initial setup instructions
- [LEARNINGS-FROM-EMBEDDED-USAGE.md](LEARNINGS-FROM-EMBEDDED-USAGE.md) - Insights from real-world usage

