# Embedded Usage Learnings - Quick Summary

**Purpose:** Quick reference of key learnings from embedded `.devenv` implementations

## Key Insights

### 1. Sync Workflow is Essential
- Projects need tools to pull template updates while preserving project-specific files
- Both PowerShell and Bash scripts are required for cross-platform support
- **Solution:** Added `scripts/sync-from-template.ps1` and `scripts/sync-from-template.sh`

### 2. Project-Specific Files Need Management
- Generated reports (health, gaps, stack) are project-specific
- These files must be preserved during sync operations
- **Solution:** Documented in `.gitignore` and preserved by sync scripts

### 3. Documentation is Critical
- Users need clear guidance on maintaining sync
- Troubleshooting guides for common sync issues
- **Solution:** Added `docs/SYNC.md` with comprehensive documentation

### 4. Project Customizations Are Common
- Projects add technology-specific best practices
- Platform-specific configurations (Windows vs. Linux/macOS)
- Project-specific documentation
- **Solution:** Documented recommended locations for customizations

### 5. Git Remote Configuration
- Projects need a `template` remote separate from `origin`
- Sync scripts should handle remote configuration automatically
- **Solution:** Sync scripts configure remotes automatically

## Files Added/Updated

### New Files
- `scripts/sync-from-template.sh` - Bash sync script
- `scripts/sync-from-template.ps1` - PowerShell sync script
- `docs/SYNC.md` - Sync documentation
- `docs/LEARNINGS-FROM-EMBEDDED-USAGE.md` - Detailed analysis

### Updated Files
- `.gitignore` - Added comments about project-specific files
- `docs/EMBEDDED-USAGE.md` - Added sync and customization sections
- `docs/SETUP-GUIDE.md` - Added git remote configuration section
- `BOOTSTRAP.md` - Added reference to SYNC.md

## Project-Specific Files (Preserved During Sync)

These files are automatically preserved:
- `health-report.json`
- `gaps-report.md`
- `stack-report.json`
- `health-before.json`
- `health-after.json`
- `input.txt`

## Recommended Customization Locations

Projects can safely add:
- `best-practices/` - Technology-specific best practices
- `config/project/` - Project-specific configuration
- `docs/archive/` - Historical project documentation

## Quick Reference

### Sync Command
```bash
# Bash/Linux/macOS
cd .devenv && ./scripts/sync-from-template.sh

# PowerShell/Windows
cd .devenv && .\scripts\sync-from-template.ps1
```

### Git Remote Setup
```bash
cd .devenv
git remote add template https://github.com/XylarDark/DevEnvTemplate.git
# Or for local template:
git remote add template ../DevEnvTemplate
```

## Related Documentation

- [SYNC.md](SYNC.md) - Complete sync workflow documentation
- [LEARNINGS-FROM-EMBEDDED-USAGE.md](LEARNINGS-FROM-EMBEDDED-USAGE.md) - Detailed analysis
- [EMBEDDED-USAGE.md](EMBEDDED-USAGE.md) - Ongoing usage guide

