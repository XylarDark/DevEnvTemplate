# Troubleshooting DevEnvTemplate

Quick solutions to common issues.

## Setup Issues

> Need the full bootstrap flow? Start with [`docs/SETUP-GUIDE.md`](SETUP-GUIDE.md). This section only covers problems that appear after following that guide.

### Installation Fails

**Problem:** `npm install` fails with dependency errors.

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Doctor Command Not Found

**Problem:** `npm run doctor` returns "command not found".

**Solution:**
```bash
# Rebuild TypeScript
npm run build

# Verify doctor script exists
npm run doctor
```

### Enable Debug Logging

**Problem:** Stack detection or gap analysis behaves unexpectedly and you need more context.

**Solution:**
```bash
# Run doctor with verbose logs (avoid mixing with --json)
npm run doctor -- --debug

# Or target a single tool
node .github/tools/stack-detector.js --debug --json
node .github/tools/gap-analyzer.js --debug
```
This sets `LOG_LEVEL=DEBUG` so the tools print detailed progress. Re-run without `--debug` once you’re done to keep console noise down.

## Stack Detection Issues

### `Cannot find module '...stack-detector.js'`

**Problem:** Running `npm run doctor` (or `node dist/scripts/tools/stack-detector.js`) fails with `Cannot find module '...stack-detector.js'`.

**Cause:** The TypeScript build has not been run yet, so `dist/scripts/tools/stack-detector.js` does not exist.

**Solution:**
```bash
# Compile TypeScript (prebuild + build)
npm run build

# Re-run doctor
npm run doctor
```

### JSON Parsing Errors

**Problem:** Stack detector or gap analyzer fails with JSON parsing errors like `Expected ',' or ']' after array element in JSON at position 5`.

**Cause:** Invalid JSON syntax in configuration files (e.g., `package.json`, `tsconfig.json`, `pyproject.toml`).

**Solution:**
1. Check the file mentioned in the error message for syntax errors
2. Validate JSON using a JSON validator (e.g., jsonlint.com)
3. Common issues:
   - Trailing commas
   - Unclosed brackets or braces
   - Invalid characters
   - Unquoted strings

**Example Error Message:**
```
Failed to parse JSON in package.json

Possible solutions:
  1. Check package.json for syntax errors
  2. Validate JSON using a JSON validator (e.g., jsonlint.com)
  3. Check for trailing commas, unclosed brackets, or invalid characters
  4. Ensure all strings are properly quoted

See docs/TROUBLESHOOTING.md#json-parsing-errors for more information.
```

For more information, see [Best Practices Guide](BEST-PRACTICES.md#error-handling-patterns).

### No Technologies Detected

**Problem:** Stack detector finds no technologies in your project.

**Cause:** Missing `package.json` or project files.

**Solution:**
```bash
# Ensure package.json exists
npm init -y

# Re-run stack detection
node .github/tools/stack-detector.js
```

### Wrong Framework Detected

**Problem:** Stack detector identifies wrong framework.

**Cause:** Conflicting dependencies or configuration files.

**Solution:**
```bash
# Check package.json dependencies
cat package.json | grep dependencies

# Manually specify in project.manifest.json if needed
```

### Doctor Still Recommends TypeScript for a Python Repo

**Problem:** After moving to a Python-only project the doctor still suggests ESLint/TypeScript quick wins.

**Cause:** Stack detector is still seeing JavaScript signals (leftover `package.json`, `node_modules`, or TS config).

**Solution:**
```bash
# Remove stale JS artifacts if this repo really is Python-only
rm -rf node_modules package-lock.json tsconfig.json

# Re-run stack detector so it records the python profile
npm run doctor -- --json > nul  # or node dist/scripts/tools/stack-detector.js

# Doctor output should now start with "🧠 Stack profile: python"
```

### Doctor Inspects the Wrong Directory

**Problem:** `npm run doctor` (inside `.devenv/`) scans the DevEnvTemplate checkout instead of your actual project.

**Cause:** Running from a nested tools directory without telling the doctor where the real project root lives.

**Solution:**
```bash
# In Windows PowerShell
Set-Location .\my-project\.devenv
npm run doctor                # auto-detects parent project
npm run doctor -- --project-root ..   # or set manually

# Or with env var (any shell)
DEVENV_PROJECT_ROOT=../.. npm run doctor
```

## JSON Parse Errors

### `Invalid JSON in package.json`

**Problem:** Doctor exits with `Invalid JSON in <path>/package.json`.

**Cause:** The target project's configuration file is malformed (extra commas, missing quotes, etc.).

**Solution:**
```bash
# Validate JSON (Node 20+)
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))"

# Fix formatting (remove trailing commas, ensure valid quotes)
# Re-run doctor
npm run doctor
```

## Gap Analysis Issues

### No Gaps Report Generated

**Problem:** Gap analyzer doesn't create `.devenv/gaps-report.md`.

**Cause:** Stack detection failed first.

**Solution:**
```bash
# Run stack detection first
node .github/tools/stack-detector.js

# Then run gap analysis
node .github/tools/gap-analyzer.js

# Check output
cat .devenv/gaps-report.md
```

### Too Many False Positives

**Problem:** Gap analyzer reports issues for intentionally missing features.

**Cause:** Opinionated defaults for indie developers.

**Solution:** This is expected - gap analyzer errs on the side of suggesting best practices. Ignore gaps that don't apply to your project.

## CI Failures

### GitHub Actions Workflow Fails

**Problem:** CI workflow fails on push.

**Common Causes:**
1. Tests failing locally
2. Missing dependencies
3. TypeScript errors

**Solution:**
```bash
# Run locally first
npm run build
npm test

# Check for TypeScript errors
npx tsc --noEmit

# Push after fixing
```

## Embedded Usage Issues

> **Note:** This section documents issues specific to using DevEnvTemplate when embedded as `.devenv/` inside another project. For general embedded usage guidance, see [EMBEDDED-USAGE.md](EMBEDDED-USAGE.md).

### Doctor Analyzes DevEnvTemplate Instead of Parent Project

**Problem:** Running `npm run doctor` from `.devenv/` analyzes DevEnvTemplate itself instead of the parent project.

**Symptoms:**
- Stack detection shows DevEnvTemplate's stack
- Generated reports end up in `.devenv/.devenv/`
- No analysis of actual project

**Solution:**
```bash
# Run from project root with explicit project root
npm run doctor --prefix .devenv -- --project-root ..

# Or set environment variable
DEVENV_PROJECT_ROOT=.. npm run doctor --prefix .devenv

# Or run from project root (auto-detection works)
cd ..
npm run doctor --prefix .devenv
```

**Prevention:** Always run doctor from the project root, not from `.devenv/`.

### PowerShell Command Chaining Fails

**Problem:** Commands copied from documentation use `&&` which fails in PowerShell.

**Symptoms:**
```
&& : The term '&&' is not recognized as the name of a cmdlet
```

**Solution:**
```powershell
# ❌ Wrong
cd .devenv && npm run doctor

# ✅ Correct
Set-Location .devenv; npm run doctor

# Or use separate commands
Set-Location .devenv
npm run doctor
```

**Prevention:** Use DevEnvTemplate's shell helper utilities that auto-detect shell type.

### Build Artifacts Not Found When Embedded

**Problem:** `npm run doctor` fails with "Cannot find module" when DevEnvTemplate is embedded.

**Symptoms:**
```
Cannot find module '...scripts/doctor/cli.js'
```

**Solution:**
```bash
# Build TypeScript first
cd .devenv
npm install
npm run build
npm run doctor
```

**Prevention:** Always run `npm run build` after cloning DevEnvTemplate into `.devenv/`.

### JSON Parsing Errors from Stack Detector

**Problem:** Stack detector output includes logs mixed with JSON, causing parse errors.

**Symptoms:**
```
Expected ',' or ']' after array element in JSON at position 5
```

**Solution:**
```bash
# Use --json flag for clean output
npm run doctor --prefix .devenv -- --json

# Or use environment variable
LOG_LEVEL=ERROR npm run doctor --prefix .devenv -- --json
```

**Prevention:** Stack detector should be called with `--json` flag when output is parsed programmatically.

### Script Entrypoints vs Build Artifacts

**Problem:** After cloning `.devenv`, `npm run doctor` points to `node scripts/doctor/cli.js`, but only `.ts` sources exist (no compiled `.js`).

**Symptoms:**
```
Cannot find module '...scripts\doctor\cli.js'
```

**Solution:**
```bash
# Build TypeScript first
cd .devenv
npm install
npm run build
npm run doctor
```

**Prevention:** Always run `npm run build` after cloning DevEnvTemplate into `.devenv/`.

### Stack Detector Logs Mask Target Project Errors

**Problem:** Even after manually running stack detector, logs show it's inspecting the wrong directory (`.devenv/.devenv/` instead of the actual project).

**Symptoms:**
```
Stack report saved to ...\.devenv\.devenv\stack-report.json
```

**Cause:** Running from `.devenv/` directory without specifying project root.

**Solution:**
```bash
# Run from project root
cd ..
npm run doctor --prefix .devenv

# Or explicitly set project root
npm run doctor --prefix .devenv -- --project-root ..
```

**Prevention:** Always run doctor from the project root, not from `.devenv/`.

### Missing Documentation for Embedded Workflow

**Problem:** No guidance on how to run doctor when DevEnvTemplate is vendored into `.devenv/`.

**Solution:** See [EMBEDDED-USAGE.md](EMBEDDED-USAGE.md) for complete embedded workflow documentation.

See [Embedded Usage Guide](EMBEDDED-USAGE.md) for complete workflow.

---

### Free Tier Minutes Exceeded

**Problem:** GitHub Actions disabled due to usage limits.

**Solution:** DevEnvTemplate's `indie-ci.yml` is optimized for free tier (<2000 min/month). If exceeded:

```yaml
# .github/workflows/indie-ci.yml
# Reduce frequency
on:
  push:
    branches: [main]  # Only main, not all branches
```

## Test Failures

### Tests Timeout or Hang

**Problem:** Tests never complete or hang indefinitely.

**Solution:**
```bash
# Run only fast tests
npm run test:fast

# Skip slow integration tests temporarily
npm run test:unit
```

### Agent Tests Fail

**Problem:** Agent workflow tests fail.

**Solution:** These tests were removed in Phase 1 cleanup. If you see references to them:

```bash
# Rebuild and verify
npm run build
npm test
```

## Cleanup Engine Issues

### Cleanup Removes Wrong Files

**Problem:** Cleanup engine deletes files you want to keep.

**Solution:**
```bash
# Always use dry-run first (default)
npm run cleanup

# Keep specific files
npm run cleanup -- --keep README.md,LICENSE --apply

# Exclude specific rules
npm run cleanup -- --exclude remove-docs --apply
```

### No Changes Applied

**Problem:** Cleanup runs but nothing changes.

**Cause:** Running in dry-run mode (default for safety).

**Solution:**
```bash
# Apply changes explicitly
npm run cleanup -- --apply
```

## Path Resolution Errors

### Can't Find Config Files

**Problem:** Scripts report "config file not found".

**Cause:** Looking in wrong directory.

**Solution:**
```bash
# Ensure config exists
ls config/cleanup.config.yaml

# Or create it
npx devenv-init
```

## PowerShell Issues (Windows)

### Command Chaining Fails

**Problem:** Commands with `&&` fail in PowerShell.

**Solution:**
```powershell
# Run commands separately
npm run lint
npm run test

# Or use ; instead
npm run lint; npm run test
```

### Emoji/Unicode Errors

**Problem:** Terminal shows garbled characters or errors.

**Cause:** PowerShell encoding issues.

**Solution:**
```powershell
# Set UTF-8 encoding
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Or use --json flag
npm run doctor -- --json
```

### File Editing Blocked by Globalignore

**Problem**: Attempting to create or edit files (e.g., `.env.example`) fails with "blocked by globalignore" error.

**Cause**: File is in .gitignore or .cursorignore, preventing direct editing.

**Solution**:
```powershell
# Option 1: Temporarily unignore (if file exists)
git update-index --no-assume-unchanged .env.example
# Edit file
git update-index --assume-unchanged .env.example

# Option 2: Create via script (preferred)
# Python
python -c "from pathlib import Path; Path('.env.example').write_text('CONTENT')"

# Node.js
node -e "require('fs').writeFileSync('.env.example', 'CONTENT')"

# PowerShell
Set-Content -Path ".env.example" -Value "CONTENT"
```

**Prevention**: Check `git check-ignore -v <file>` before attempting to create/edit files.

### Environment File Template Issues

**Problem**: Missing or incorrect environment file templates.

**Next.js Projects:**
- Need `.env.local.example` (not just `.env.example`)
- Must document `NEXT_PUBLIC_*` variables
- Should include API URL, optional API key

**Python Projects:**
- Need `.env.example` at project root
- Should document all required variables
- Include safe defaults where appropriate

**Solution**: Create appropriate template file based on project type (detected by stack detector).

## Doctor Mode Issues

### Health Score Seems Wrong

**Problem:** Doctor reports low health score but project seems fine.

**Cause:** Doctor is opinionated toward best practices for LLM-assisted development.

**Solution:** Focus on **critical issues** first, warnings are optional:

```bash
npm run doctor

# Look for:
# - 🔴 Critical Issues (fix these)
# - 🟡 Warnings (optional)
# - 💡 Quick Wins (easy fixes)
```

### Auto-Fix Doesn't Work

**Problem:** `npm run doctor:fix` doesn't fix issues.

**Cause:** Only simple issues can be auto-fixed (.env.example, TypeScript strict mode, etc.).

**Solution:** Auto-fix only handles:
- Creating .env.example
- Adding .env to .gitignore
- Enabling TypeScript strict mode

Other issues require manual fixes.

## Python-Specific Issues

### Import Errors

**Problem:** `ModuleNotFoundError: No module named 'my_package'`

**Cause:** Package not installed or using sys.path hacks.

**Solution:**
```bash
# Install package in development mode
pip install -e .

# Verify installation
python -c "import my_package; print(my_package.__file__)"
```

**Prevention:** Never use `sys.path.insert()` or `sys.path.append()`. Always install package properly.

### sys.path Hacks in Scripts

**Problem:** Scripts use `sys.path.insert(0, str(project_root))` to add project to path.

**Symptoms:**
```python
# ❌ Bad pattern
import sys
from pathlib import Path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))
from my_package import something
```

**Cause:** Package not installed, trying to work around import errors.

**Solution:**
1. Remove all `sys.path` modifications
2. Install package: `pip install -e .`
3. Use proper imports: `from my_package import something`

**Prevention:** Always install package before running scripts. Document installation in README.

### Path Resolution Issues

**Problem:** Scripts can't find config files or data directories after reorganization.

**Symptoms:**
```
FileNotFoundError: [Errno 2] No such file or directory: '../data/results.json'
```

**Cause:** Hardcoded paths relative to `__file__` or current working directory.

**Solution:**
```python
# ❌ Wrong - hardcoded path
data_file = Path(__file__).parent.parent / 'data' / 'results.json'

# ✅ Correct - use path resolver
from my_package.utils.path_resolver import get_data_dir
data_file = get_data_dir() / 'results.json'
```

**Prevention:** Create centralized path resolution utility. See [Python Best Practices Guide](guides/python-best-practices.md#path-resolution).

### Virtual Environment Problems

**Problem:** Package imports work in one environment but not another.

**Cause:** Package installed in different virtual environment or system Python.

**Solution:**
```bash
# Create fresh virtual environment
python -m venv venv

# Activate (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Activate (Linux/macOS)
source venv/bin/activate

# Install package
pip install -e .
```

**Prevention:** Always use virtual environments. Document setup in README.

### PowerShell Script Failures

**Problem:** Python scripts fail when run from PowerShell with path or encoding errors.

**Symptoms:**
```
UnicodeDecodeError: 'charmap' codec can't decode byte
```

**Cause:** File operations without explicit encoding, or path issues.

**Solution:**
```python
# ✅ Always specify encoding
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# ✅ Use pathlib.Path for paths
from pathlib import Path
data_file = Path('data') / 'results.json'
```

**Prevention:** Always use `encoding='utf-8'` for file operations. Use `pathlib.Path` for cross-platform paths.

### Test Import Errors

**Problem:** Tests fail with `ModuleNotFoundError` even though package is installed.

**Cause:** Tests using `sys.path` hacks or running from wrong directory.

**Solution:**
```python
# ❌ Wrong - sys.path hack in test
import sys
sys.path.insert(0, '../')
from my_package.core import config

# ✅ Correct - package should be installed
from my_package.core import config
```

**Prevention:** Install package before running tests. Never modify `sys.path` in tests.

### Script Entry Point Issues

**Problem:** Scripts work in development but fail when package is installed.

**Cause:** Scripts assume specific directory structure or use relative imports.

**Solution:**
```python
#!/usr/bin/env python3
"""
Script that works when package is installed.
"""

import sys

# Check if package is installed
try:
    from my_package import main_function
    from my_package.utils.path_resolver import get_project_root
except ImportError as e:
    print(f"Error: Package not installed: {e}")
    print("Install with: pip install -e .")
    sys.exit(1)

def main():
    project_root = get_project_root()
    # Script logic...

if __name__ == "__main__":
    main()
```

**Prevention:** Test scripts after installing package. Use path resolver utilities.

### Cross-Platform Path Issues

**Problem:** Scripts work on Linux but fail on Windows (or vice versa).

**Cause:** Using hardcoded path separators (`/` or `\`) or `os.path.join` incorrectly.

**Solution:**
```python
# ❌ Wrong - hardcoded separator
data_file = 'data/results.json'  # Fails on Windows

# ❌ Wrong - os.path without proper handling
import os
path = os.path.join('data', 'results.json')  # Works but less modern

# ✅ Correct - pathlib.Path
from pathlib import Path
data_file = Path('data') / 'results.json'  # Works everywhere
```

**Prevention:** Always use `pathlib.Path` for path operations. Test on both Windows and Linux.

## Common Recovery Steps

### Complete Reset

```bash
# 1. Clean build artifacts
rm -rf node_modules dist .next out .devenv

# 2. Reinstall dependencies
npm install

# 3. Rebuild
npm run build

# 4. Test
npm test
```

### Verify Installation

```bash
# Check all commands work
npm run build        # Should succeed
npm run test:fast    # Should pass
npm run doctor       # Should run
npm run cleanup      # Should show dry-run
```

## Getting Help

If none of these solutions work:

1. **Check the logs:** Look for specific error messages
2. **Run with verbose output:** `DEBUG=* npm run <command>`
3. **Check GitHub issues:** [github.com/XylarDark/DevEnvTemplate/issues](https://github.com/XylarDark/DevEnvTemplate/issues)
4. **Include details:** When reporting issues, include:
   - Error message
   - Node version (`node --version`)
   - OS (Windows/Mac/Linux)
   - Steps to reproduce

## Quick Reference

| Issue | Solution |
|-------|----------|
| Installation fails | `rm -rf node_modules && npm install` |
| Doctor not found | `npm run build` |
| Tests timeout | `npm run test:fast` |
| CI fails | Test locally first: `npm test` |
| Cleanup removes too much | Use `--keep` flag |
| Config not found | Ensure `config/` directory exists |
| PowerShell errors | Use `;` instead of `&&` |
| Low health score | Focus on critical issues only |

---

**Still stuck?** Open an issue with full error details and steps to reproduce.

