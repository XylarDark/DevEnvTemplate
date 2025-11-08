# Troubleshooting DevEnvTemplate

Quick solutions to common issues.

## Setup Issues

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

## Stack Detection Issues

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

