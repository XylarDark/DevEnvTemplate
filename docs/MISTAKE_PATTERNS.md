# Common Mistake Patterns & Prevention Guide

**Generated:** 2025-01-17  
**Purpose:** Document recurring mistakes from development sessions with root causes, impacts, and prevention strategies

## Overview

This document catalogs mistake patterns discovered during development sessions, categorized by type and severity. Each pattern includes:
- Description of the mistake
- Root cause analysis
- Impact assessment
- Prevention strategy
- Fix examples

---

## 1. Shell Portability Issues

### Pattern: PowerShell Command Chaining

**Description:** Using `&&` for command chaining, which fails in PowerShell.

**Root Cause:** 
- Bash/zsh use `&&` for conditional command execution
- PowerShell treats `&&` as a statement separator, not a command chain operator
- Commands copied from Unix documentation fail on Windows

**Impact:**
- Scripts fail on Windows PowerShell
- CI/CD may work on Linux but fail on Windows runners
- Developer frustration and wasted time

**Prevention Strategy:**
- Always test scripts in both bash and PowerShell
- Use cross-platform shell helpers
- Provide both bash and PowerShell examples in documentation
- Use npm scripts for multi-command operations (they handle cross-platform)

**Fix Examples:**
```bash
# ❌ Fails in PowerShell
cd lunar_mining_sim && npm run doctor

# ✅ Correct for PowerShell
cd lunar_mining_sim; npm run doctor

# ✅ Better: Use separate commands
cd lunar_mining_sim
npm run doctor

# ✅ Best: Use npm scripts (cross-platform)
npm run doctor --project-root lunar_mining_sim
```

---

## 2. Python Path Resolution Issues

### Pattern: sys.path Hacks

**Description:** Using `sys.path.insert()` or `sys.path.append()` to modify Python import path.

**Root Cause:**
- Package not properly installed via `pip install -e .`
- Scripts run from different directories
- Attempting to import from project root without installation
- Copy-paste from tutorials that don't use proper packaging

**Impact:**
- Code smell and fragile imports
- Breaks when project structure changes
- Difficult to debug import errors
- Not portable across environments
- Violates Python packaging best practices

**Prevention Strategy:**
- Always install package in development mode: `pip install -e .`
- Use proper relative imports from installed package
- Create path resolution utilities for config/data files
- Add installation check at script start
- Document installation requirement in README

**Fix Examples:**
```python
# ❌ Before: sys.path hack
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))
from lunar_mining_sim import simulate

# ✅ After: Proper package installation
# Package should be installed: pip install -e .
from lunar_mining_sim import simulate
from lunar_mining_sim.utils.path_resolver import get_project_root
project_root = get_project_root()
```

---

## 3. TypeScript Build Artifact Issues

### Pattern: Referencing Source Files Instead of Build Artifacts

**Description:** Package.json scripts reference `.ts` source files instead of compiled `.js` files in `dist/`.

**Root Cause:**
- TypeScript source files exist but not compiled
- Package scripts point to source paths
- Build step not run before executing scripts
- Assumption that Node.js can run TypeScript directly

**Impact:**
- `Cannot find module` errors
- Scripts fail with confusing error messages
- Developer confusion about build process
- Inconsistent behavior between environments

**Prevention Strategy:**
- Always reference `dist/` in package.json scripts
- Add build verification before running scripts
- Document build process clearly
- Use TypeScript compiler watch mode for development
- Consider using `tsx` or `ts-node` for development scripts

**Fix Examples:**
```json
// ❌ Before: References source
{
  "scripts": {
    "doctor": "node scripts/doctor/cli.js"
  }
}

// ✅ After: References build artifacts
{
  "scripts": {
    "build": "tsc",
    "doctor": "node dist/scripts/doctor/cli.js",
    "predoctor": "npm run build"
  }
}
```

---

## 4. Path Resolution Errors

### Pattern: Hardcoded Relative Paths

**Description:** Using hardcoded relative paths that break when files are moved or run from different directories.

**Root Cause:**
- Assumptions about current working directory
- Not using path resolution utilities
- Copy-paste from examples without adaptation
- Lack of centralized path management

**Impact:**
- Scripts fail when run from different directories
- Breaks after project reorganization
- Difficult to maintain
- Not portable across environments

**Prevention Strategy:**
- Use `pathlib.Path` consistently in Python
- Create centralized path resolution utilities
- Support both installed package and development mode
- Use environment variables for configurable paths
- Always resolve paths relative to script location or project root

**Fix Examples:**
```python
# ❌ Before: Hardcoded paths
project_root = Path(__file__).parent.parent
data_dir = project_root / 'data'

# ✅ After: Centralized path resolution
from lunar_mining_sim.utils.path_resolver import get_project_root, get_data_dir
project_root = get_project_root()
data_dir = get_data_dir()
```

---

## 5. Next.js Server/Client Boundary Violations

### Pattern: Importing Node.js APIs in Client Components

**Description:** Attempting to use Node.js modules (`fs`, `path`, `os`) in React client components.

**Root Cause:**
- Confusion about server vs client components
- Not understanding Next.js App Router architecture
- Copy-paste from server-side code
- Missing `'use client'` directive awareness

**Impact:**
- Build errors: "Module not found: Can't resolve 'fs'"
- Runtime errors in browser
- Confusion about where code should run
- Broken functionality

**Prevention Strategy:**
- Never import Node.js modules in client components
- Use API routes for server-side logic
- Understand Next.js server/client component boundaries
- Use `'use client'` directive appropriately
- Fetch data from API routes, don't read files directly

**Fix Examples:**
```typescript
// ❌ Wrong: Client component trying to use Node API
'use client'
import fs from 'fs'  // This will fail at runtime

// ✅ Correct: Move to API route
// In app/api/files/route.ts
import fs from 'fs'
export async function GET() {
  const files = fs.readdirSync('data')
  return Response.json(files)
}

// In client component
const response = await fetch('/api/files')
const files = await response.json()
```

---

## 6. JSON Parsing Errors

### Pattern: Parsing JSON with Log Output Mixed In

**Description:** Attempting to parse JSON output that includes human-readable log lines.

**Root Cause:**
- Tools output both logs and JSON to stdout
- Attempting to parse entire output as JSON
- Not using `--json` flags when available
- Mixing structured and unstructured output

**Impact:**
- JSON parsing failures
- Confusing error messages
- Tools appear broken
- Difficult to debug

**Prevention Strategy:**
- Use `--json` flags for structured output
- Separate log output from JSON output
- Parse only JSON portions of output
- Validate JSON before parsing
- Provide helpful error messages with file paths

**Fix Examples:**
```javascript
// ❌ Before: Parsing mixed output
const output = execSync('node stack-detector.js')
const result = JSON.parse(output)  // Fails if logs included

// ✅ After: Use JSON flag
const output = execSync('node stack-detector.js --json')
const result = JSON.parse(output)

// ✅ Better: Handle errors gracefully
try {
  const output = execSync('node stack-detector.js --json', { encoding: 'utf8' })
  const result = JSON.parse(output)
} catch (error) {
  if (error instanceof SyntaxError) {
    throw new Error(`Invalid JSON from stack-detector: ${error.message}`)
  }
  throw error
}
```

---

## 7. Project Root Detection Issues

### Pattern: Analyzing Wrong Directory When Embedded

**Description:** When DevEnvTemplate is embedded in `.devenv/`, tools analyze the template itself instead of the parent project.

**Root Cause:**
- Using `process.cwd()` which is `.devenv/` when run from there
- Not detecting embedded mode
- No project root resolution logic
- Assumptions about directory structure

**Impact:**
- Tools analyze wrong project
- Generated artifacts in wrong location (`.devenv/.devenv/`)
- Confusing error messages
- Wasted time debugging

**Prevention Strategy:**
- Auto-detect project root by walking up directory tree
- Detect embedded mode (directory name is `.devenv`)
- Support `--project-root` CLI flag
- Support `DEVENV_PROJECT_ROOT` environment variable
- Document embedded workflow

**Fix Examples:**
```typescript
// ✅ Project root resolution
function resolveProjectRoot(): string {
  let current = process.cwd()
  
  // Check if we're in .devenv subdirectory
  if (path.basename(current) === '.devenv') {
    return path.dirname(current)
  }
  
  // Walk up to find project root (has package.json or pyproject.toml)
  while (current !== path.dirname(current)) {
    if (fs.existsSync(path.join(current, 'package.json')) ||
        fs.existsSync(path.join(current, 'pyproject.toml'))) {
      return current
    }
    current = path.dirname(current)
  }
  
  return process.cwd()
}
```

---

## 8. Environment Variable Handling

### Pattern: Hardcoded Configuration Values

**Description:** Using hardcoded values instead of environment variables for configuration.

**Root Cause:**
- Quick prototyping without considering configuration
- Copy-paste from examples
- Not understanding environment-based configuration
- Missing `.env.example` files

**Impact:**
- Not portable across environments
- Security issues (committed secrets)
- Difficult to configure for different deployments
- Violates 12-factor app principles

**Prevention Strategy:**
- Always use environment variables for configuration
- Provide `.env.example` files
- Document required environment variables
- Use validation for environment variables
- Never commit `.env` files

**Fix Examples:**
```python
# ❌ Before: Hardcoded values
CORS_ORIGINS = ["*"]
API_KEY = "demo-api-key"

# ✅ After: Environment-based
import os
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
API_KEY = os.getenv("API_KEY")
DEMO_MODE = os.getenv("DEMO_MODE", "false").lower() == "true"
```

---

## 9. Import/Export Organization Issues

### Pattern: Incorrect Import Ordering

**Description:** Not following PEP 8 import ordering (standard library, third-party, local).

**Root Cause:**
- Not aware of style guidelines
- Copy-paste from various sources
- No automated formatting
- Inconsistent team practices

**Impact:**
- Code style violations
- Difficult to read
- Inconsistent codebase
- Fails linting checks

**Prevention Strategy:**
- Follow PEP 8 import ordering
- Use `isort` or `ruff` for automatic organization
- Configure linters to enforce ordering
- Document import style in contributing guide

**Fix Examples:**
```python
# ❌ Before: Mixed imports
from lunar_mining_sim import simulate
import os
import numpy as np
from pathlib import Path

# ✅ After: PEP 8 ordering
import os
from pathlib import Path

import numpy as np

from lunar_mining_sim import simulate
```

---

## 10. Error Handling Issues

### Pattern: Generic Exception Handling

**Description:** Catching generic `Exception` without context or recovery hints.

**Root Cause:**
- Quick error suppression
- Not understanding error types
- Missing custom exception hierarchy
- Lack of error context

**Impact:**
- Difficult to debug
- Poor user experience
- Lost error information
- No recovery guidance

**Prevention Strategy:**
- Use specific exception types
- Create custom exception hierarchy
- Provide context in error messages
- Include recovery hints
- Log errors with full context

**Fix Examples:**
```python
# ❌ Before: Generic exception
try:
    result = simulate(...)
except Exception as e:
    print(f"Error: {e}")

# ✅ After: Specific exceptions with context
from lunar_mining_sim.utils.exceptions import SimulationError, ValidationError

try:
    result = simulate(...)
except ValidationError as e:
    raise SimulationError(
        f"Invalid simulation parameters: {e.message}",
        context={'parameters': params, 'error': str(e)}
    )
except SimulationError:
    raise  # Re-raise custom exceptions
except Exception as e:
    raise SimulationError(
        f"Unexpected error during simulation: {str(e)}",
        context={'original_error': type(e).__name__}
    )
```

---

## 11. Commit Message Formatting Issues

### Pattern: Commit Message Body Line Length Violations

**Description:** Commit message body lines exceed the maximum length limit enforced by commitlint (default 100 characters).

**Root Cause:**
- Not aware of commitlint body-max-line-length rule
- Writing long descriptive lines without line breaks
- Using `@commitlint/config-conventional` which enforces 100-character limit
- Not wrapping commit message body lines

**Impact:**
- Commit fails with commitlint error
- Developer frustration and wasted time
- Need to rewrite commit message
- Breaks CI/CD if commit hooks are enforced

**Prevention Strategy:**
- Keep commit message body lines under 100 characters
- Use multiple `-m` flags for separate body lines
- Wrap long lines manually
- Check commitlint configuration for line length rules
- Use commit message templates or helpers

**Fix Examples:**
```bash
# ❌ Before: Body line too long (over 100 chars)
git commit -m "docs: organize markdown files" \
  -m "- Move IMPLEMENTATION_SUMMARY.md, MISTAKE_PATTERNS.md, REPOSITORY_STRUCTURE.md, and STRUCTURE.md to docs/"

# ✅ After: Break into shorter lines
git commit -m "docs: organize markdown files" \
  -m "- Move IMPLEMENTATION_SUMMARY.md, MISTAKE_PATTERNS.md," \
  -m "  REPOSITORY_STRUCTURE.md, and STRUCTURE.md to docs/"

# ✅ Better: Use separate -m flags for each line
git commit \
  -m "docs: organize markdown files" \
  -m "- Move IMPLEMENTATION_SUMMARY.md, MISTAKE_PATTERNS.md," \
  -m "  REPOSITORY_STRUCTURE.md, and STRUCTURE.md to docs/" \
  -m "- Update STRUCTURE.md to reflect documentation organization" \
  -m "- Keep root directory clean with only essential files"
```

---

## 12. npm Script Flag Passing Issues

### Pattern: Flags Not Passed Through npm Scripts

**Description:** Flags passed to npm scripts using `--` separator don't reach the underlying command correctly.

**Root Cause:**
- npm script syntax: `npm run <script> -- --flag` requires double dash
- Some scripts may not properly handle flag forwarding
- Running scripts directly vs through npm can have different behavior
- Missing or incorrect flag parsing in script entry points

**Impact:**
- Flags ignored, script runs with wrong options
- Dry-run mode doesn't work when expected
- Auto-fix flags don't apply changes
- Confusing behavior where flags appear to be ignored

**Prevention Strategy:**
- Test flag passing through npm scripts
- Use double dash `--` to separate npm flags from script flags
- Run scripts directly if npm flag passing fails: `node dist/scripts/tool.js --flag`
- Document flag passing behavior in script documentation
- Consider using explicit flag parsing in CLI tools

**Fix Examples:**
```bash
# ❌ Before: Flag may not pass through correctly
npm run organize-docs -- --auto-fix

# ✅ After: Run script directly if npm passing fails
node dist/scripts/tools/docs-organizer.js --auto-fix

# ✅ Better: Verify flag passing works, document if it doesn't
# If npm run script -- --flag doesn't work, use direct execution
npm run build  # Ensure dist/ is up to date
node dist/scripts/tools/docs-organizer.js --auto-fix

# ✅ Best: Fix npm script to properly forward flags
# In package.json, ensure scripts can accept flags:
# "organize-docs": "node dist/scripts/tools/docs-organizer.js"
# Then: npm run organize-docs -- --auto-fix
```

---

## Prevention Checklist

Before committing code, verify:

- [ ] Scripts tested in both bash and PowerShell (if applicable)
- [ ] No `sys.path` hacks - package properly installed
- [ ] Paths resolved using utilities, not hardcoded
- [ ] TypeScript scripts reference `dist/`, not source
- [ ] No Node.js APIs in Next.js client components
- [ ] JSON parsing uses `--json` flags when available
- [ ] Project root auto-detected correctly
- [ ] Environment variables used for configuration
- [ ] Imports follow style guide
- [ ] Specific exceptions with context
- [ ] Commit message body lines under 100 characters
- [ ] npm script flags tested and working, or use direct script execution

---

## Related Documentation

- [Python Best Practices](best-practices/python.md)
- [Next.js Best Practices](best-practices/nextjs.md)
- [FastAPI Best Practices](best-practices/fastapi.md)
- [DevEnvTemplate Best Practices](../../DevEnvTemplate/docs/BEST-PRACTICES.md)

---

**Last Updated:** 2025-01-21

