# Troubleshooting Guide

This guide helps resolve common issues encountered during DevEnvTemplate development and deployment.

## Development Environment Issues

### PowerShell Command Chaining Errors

**Problem**: Scripts fail with "command not found" or syntax errors in PowerShell.

**Symptoms**:
```
&& : The term '&&' is not recognized as the name of a cmdlet
```

**Cause**: PowerShell treats `&&` as statement separators, not command chaining like bash.

**Solution**:
```bash
# ❌ Fails in PowerShell
npm run lint && npm run test

# ✅ Use separate commands
npm run lint
npm run test

# ✅ Or use npm scripts
"scripts": {
  "check": "npm run lint && npm run test"  // This works in npm
}
```

**Prevention**: Always test scripts in both bash and PowerShell environments.

### Next.js Server/Client Boundary Errors

**Problem**: "Module not found: Can't resolve 'fs'" or similar Node.js API errors in client components.

**Symptoms**:
```
Module not found: Can't resolve 'fs' in 'website/components/MyComponent.tsx'
```

**Cause**: Attempting to use Node.js APIs in client-side React components.

**Solution**:
```typescript
// ❌ Wrong - client component trying to use Node API
'use client'
import fs from 'fs'  // This will fail at runtime

// ✅ Correct - move to API route
// In website/app/api/files/route.ts
import fs from 'fs'

export async function GET() {
  const files = fs.readdirSync('data')
  return Response.json(files)
}

// In client component
const response = await fetch('/api/files')
const files = await response.json()
```

**Prevention**: Never import Node.js modules (`fs`, `path`, `os`, etc.) in client components. Use API routes instead.

### Path Resolution Errors

**Problem**: Scripts can't find files after folder restructuring.

**Symptoms**:
```
Error: ENOENT: no such file or directory, open 'cleanup.config.yaml'
```

**Cause**: Hardcoded paths to old locations (root level files moved to `config/`, `presets/` renamed to `packs/`).

**Solution**:
```typescript
// ❌ Hardcoded old paths
const configPath = path.join(__dirname, '../../cleanup.config.yaml')

// ✅ Use path resolver
import { resolveConfigPath } from '../utils/path-resolver'
const configPath = resolveConfigPath('cleanup.config.yaml', projectRoot)
```

**Prevention**: Always use `scripts/utils/path-resolver.js` for config and pack paths during migration.

## Build and Deployment Issues

### Next.js Export Failures

**Problem**: `next export` fails with dynamic route or API route errors.

**Symptoms**:
```
Error: The export feature is no longer supported
```

**Cause**: Next.js 14+ removed the export feature for new apps. Must use static generation.

**Solution**:
```javascript
// next.config.js - Enable static export
/** @type {import('next').NextConfig} */
module.exports = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true  // Required for static export
  }
}
```

**Prevention**: Use `output: 'export'` configuration for static deployments.

### Vercel Environment Variables

**Problem**: Vercel deployment fails due to missing environment variables.

**Symptoms**:
```
Error: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID are required
```

**Cause**: Required environment variables not set.

**Solution**:
```bash
# Set environment variables
export VERCEL_TOKEN="your-vercel-token"
export VERCEL_ORG_ID="your-org-id"
export VERCEL_PROJECT_ID="your-project-id"

# Or use .env file
echo "VERCEL_TOKEN=your-token" >> .env
echo "VERCEL_ORG_ID=your-org-id" >> .env
echo "VERCEL_PROJECT_ID=your-project-id" >> .env
```

**Prevention**: Document required environment variables in deployment instructions.

### Playwright Headless Mode Issues

**Problem**: Playwright tests fail in CI due to display/GPU issues.

**Symptoms**:
```
browserType.launch: Executable doesn't exist
```

**Cause**: Missing browser binaries or display server in CI environment.

**Solution**:
```javascript
// playwright.config.ts
export default defineConfig({
  use: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  }
})
```

**Prevention**: Configure Playwright for headless CI environments with appropriate browser args.

### SBOM Generation Permission Errors

**Problem**: CycloneDX SBOM generation fails with permission errors.

**Symptoms**:
```
Error: EACCES: permission denied, open 'sbom.json'
```

**Cause**: File system permissions or directory access issues.

**Solution**:
```bash
# Ensure write permissions
chmod 644 sbom.json 2>/dev/null || true

# Run with appropriate user
# In CI, ensure the process has write access to the working directory
```

**Prevention**: Check file permissions before running SBOM generation in CI.

## Code Quality and Linting Issues

### ESLint Import Boundary Violations

**Problem**: ESLint reports `import/no-internal-modules` errors.

**Symptoms**:
```
Do not import from internal modules
```

**Cause**: Importing from internal module paths instead of public APIs.

**Solution**:
```typescript
// ❌ Wrong - internal import
import { parseSchema } from '../../../lib/schema'

// ✅ Correct - public API
import { parseSchema } from '@/lib/schema'
```

**Prevention**: Use barrel exports (`index.ts`) to define clean public APIs.

### TypeScript Strict Mode Errors

**Problem**: TypeScript compilation fails with strict mode errors.

**Symptoms**:
```
Object is possibly 'undefined'
```

**Cause**: Not handling null/undefined cases in strict mode.

**Solution**:
```typescript
// ❌ Fails in strict mode
const name = user.name.toUpperCase()

// ✅ Handle undefined
const name = user.name?.toUpperCase() ?? 'Unknown'
```

**Prevention**: Enable strict mode and handle all nullable types explicitly.

### Bundle Size Budget Violations

**Problem**: Build fails due to bundle size exceeding budgets.

**Symptoms**:
```
Bundle size exceeds budget
```

**Cause**: Large dependencies or excessive imports.

**Solution**:
```javascript
// Check bundle analyzer
npm install --save-dev webpack-bundle-analyzer

// Analyze bundle
npx webpack-bundle-analyzer out/static/chunks/*.js
```

**Prevention**: Regularly monitor bundle sizes and use lazy loading for large components.

## Repository Structure Issues

### Health Check Failures

**Problem**: `scripts/health-check.js` reports missing files or old structure.

**Symptoms**:
```
❌ Missing: SECURITY.md (expected at root but found in .github/)
```

**Cause**: Repository structure doesn't match expected layout after consolidation.

**Solution**:
- Ensure files are in correct locations (`config/`, `packs/`, `.github/`)
- Run health check to identify issues
- Update any hardcoded paths

**Prevention**: Always run health check after structural changes.

### Dual-Path Loader Issues

**Problem**: Scripts fail to find files during migration.

**Symptoms**:
```
Error: Cannot find module 'cleanup.config.yaml'
```

**Cause**: Dual-path loader not finding files in new or old locations.

**Solution**:
```typescript
// Ensure path resolver is used
import { resolveConfigPath } from '../utils/path-resolver'
const configPath = resolveConfigPath('cleanup.config.yaml', process.cwd())
```

**Prevention**: Use path resolvers consistently during migration periods.

## Common Recovery Steps

### Reset Repository State

```bash
# Clean all generated files
npm run cleanup:apply

# Reset node_modules
rm -rf node_modules package-lock.json
npm install

# Reset Next.js cache
rm -rf .next out
```

### Validate Configuration

```bash
# Run health check
node scripts/health-check.js

# Validate manifests
npm run agent:validate

# Check TypeScript
npm run typecheck
```

### Debug Build Issues

```bash
# Verbose build output
DEBUG=* npm run build

# Check environment
node --version
npm --version

# Validate Next.js config
npx next build --debug
```

## Getting Help

If these solutions don't resolve your issue:

1. **Check existing issues**: Search GitHub issues for similar problems
2. **Provide context**: Include error messages, environment details, and steps to reproduce
3. **Use templates**: Follow issue templates for consistent reporting
4. **Include logs**: Attach relevant log files and configuration

## Prevention Checklist

- [ ] Test scripts in both bash and PowerShell environments
- [ ] Use API routes for server-side operations in Next.js
- [ ] Always use path resolvers for config/pack files
- [ ] Run health checks after structural changes
- [ ] Monitor bundle sizes and performance budgets
- [ ] Keep environment variables documented and required
- [ ] Use strict TypeScript mode and handle nullables
- [ ] Follow import boundaries and public APIs
