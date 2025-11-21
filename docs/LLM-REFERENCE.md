# DevEnvTemplate LLM Reference Guide

**Version:** Technology-Agnostic Template  
**Purpose:** Complete consolidated reference for AI assistants working with DevEnvTemplate  
**Last Updated:** 2025

> **Note:** This is a reusable template. Copy this file to your project's `.devenv/` directory and extend it with project-specific context.

---

## How to Use This File

This file consolidates all essential DevEnvTemplate documentation into a single reference for LLM-assisted development. When working with a project that has `.devenv/` embedded:

1. **Reference this file** when the LLM needs to understand DevEnvTemplate commands and workflows
2. **Extend it** with project-specific information (Python commands, framework details, etc.)
3. **Backport improvements** - If you add technology-agnostic improvements, consider contributing them back to DevEnvTemplate

---

## Quick Reference Tables

### User Intent → Command Pipeline

| User Intent | Command Sequence | Auto-Execute? |
|------------|------------------|---------------|
| "Set up new project" | `agent:init` → `doctor --preset X --fix` → `test` → `git init` | ✅ Yes |
| "Fix my project" | `doctor --json` → `doctor --fix --dry-run` → `doctor --fix` | ✅ Yes |
| "Make it production ready" | `doctor --strict` → `format:check` → `test` → `build` | ✅ Yes |
| "Quick improvements" | `doctor` → `doctor --fix --no-install` → `format` | ✅ Yes |
| "Set up CI" | `doctor --fix` → create workflow → `doctor --strict` | ✅ Yes |
| "Check health" | `doctor` | ✅ Yes |
| "Clean up project" | `cleanup --dry-run` → (ask user) → `cleanup --apply` | ⚠️ Ask first |
| "Deploy my app" | Quality Gate → build → deploy command | ✅ Yes |

### Framework Presets

| Preset | When to Use | Auto-Detected From |
|--------|-------------|-------------------|
| `nextjs` | Next.js projects | next.config.*, app/, pages/ |
| `vite` | Vite projects | vite.config.*, @vitejs/plugin |
| `express` | Express APIs | express dep, server.* files |
| `vanilla` | Plain JS/TS | No framework detected |

### Health Score → Action Matrix

| Score Range | Status | Recommended Action | Pipeline |
|-------------|--------|-------------------|----------|
| 90-100 | 🟢 Excellent | Maintain | None |
| 80-89 | 🟢 Good | Optional improvements | Quick wins |
| 60-79 | 🟡 Fair | Apply fixes | Full fix pipeline |
| 40-59 | 🟡 Needs Work | Complete overhaul | Full fix + manual |
| 0-39 | 🔴 Poor | Rebuild tooling | Fresh setup |

---

## Core Commands

### npm run doctor

**Purpose:** Analyze project health and identify gaps

**Syntax:**
```bash
npm run doctor [flags]
```

**All Flags:**
- `--fix` - Apply automatic fixes to detected issues
- `--no-install` - Skip dependency installation (use with --fix)
- `--preset <type>` - Override framework detection (nextjs|vite|express|vanilla)
- `--dry-run` - Preview changes without applying them
- `--strict` - Exit with code 1 on any warnings (CI mode)
- `--json` - Output results in JSON format
- `--fast` - Fast mode (skips documentation, accessibility, Docker checks)
- `--debug` - Enable verbose logging
- `-h, --help` - Show help message

**Common Use Cases:**

```bash
# Basic health check
npm run doctor

# Check and immediately fix
npm run doctor --fix

# Preview fixes without applying
npm run doctor --fix --dry-run

# Fix without installing packages (manual install later)
npm run doctor --fix --no-install

# CI mode - fail on warnings
npm run doctor --strict --json

# Override detection for specific framework
npm run doctor --preset vite --fix

# Fast mode for quick feedback
npm run doctor --fast
```

**Output Format:**

Terminal output shows:
- Health score (0-100)
- Health breakdown by category
- Critical issues
- Quick wins (< 10 min fixes)

JSON output (`--json`) provides structured data for automation.

### npm run agent:init

**Purpose:** Interactive setup for new projects (5 questions)

**Syntax:**
```bash
npm run agent:init
```

**Questions:**
1. What are you building? (Side Project/SaaS, API/Backend, Full-Stack, Static Website, Other)
2. Primary language? (JavaScript, TypeScript, Python, Other)
3. Framework? (Next.js, React, Vue, Svelte, Vanilla JS)
4. Need authentication? (Yes/No)
5. Package manager? (npm, pnpm, yarn)

**Output:** Creates `project.manifest.json`

**When to Use:**
- Starting a brand new project
- Empty directory with just package.json
- Before writing any code
- To capture project intent

### npm run cleanup

**Purpose:** Preview template artifacts that can be removed

**Syntax:**
```bash
npm run cleanup [--dry-run|--apply]
```

**Flags:**
- Default (no flag): Dry run mode
- `--dry-run`: Show what would be removed
- `--apply`: Actually remove the files

**When to Use:**
- After initial setup is complete
- Before first commit
- Cleaning up template remnants

**Examples:**
```bash
# Preview what will be removed (safe)
npm run cleanup

# Same as above
npm run cleanup --dry-run

# Actually remove files (caution!)
npm run cleanup --apply
```

---

## Command Pipelines

### Pipeline 1: New Project Zero → Production

**User Intent:** "Set up my new [framework] project"

**Complete Sequence:**
```bash
# 1. Initialize project
mkdir my-project && cd my-project
npm init -y

# 2. Install DevEnvTemplate
npx devenv-init

# 3. Run interactive setup
npm run agent:init
# User answers 5 questions

# 4. Auto-configure based on responses
npm run doctor --preset <detected-framework> --fix

# 5. Verify setup
npm run build
npm test

# 6. Initialize git
git init
git add .
git commit -m "feat: initial project setup with DevEnvTemplate"

# 7. Create CI workflow (if not exists)
cp .github/workflows/indie-ci.yml.example .github/workflows/indie-ci.yml
```

**Expected Outcome:**
- ✅ Project manifest created
- ✅ TypeScript with strict mode
- ✅ ESLint + Prettier configured
- ✅ .env.example created
- ✅ All required dev dependencies installed
- ✅ npm scripts for lint/format/test
- ✅ CI workflow ready
- ✅ Health score: 80-90/100

### Pipeline 2: Existing Project Health & Fix

**User Intent:** "Fix my project" or "Make my project better"

**Complete Sequence:**
```bash
# 1. Initial assessment
npm run doctor --json > .devenv/health-before.json

# 2. Show user what's wrong (LLM explains)
# Parse JSON, prioritize issues

# 3. Preview fixes
npm run doctor --fix --dry-run
# LLM explains what will change

# 4. Apply config-only fixes (safe)
npm run doctor --fix --no-install

# 5. Show missing dependencies
# LLM: "These packages need to be installed: X, Y, Z"

# 6. Install dependencies (if user approves or auto-approved)
npm install --save-dev <packages>

# 7. Format code
npm run format

# 8. Verify improvements
npm run doctor --json > .devenv/health-after.json

# 9. Show before/after comparison
```

**Expected Outcome:**
- Health score improved by 15-30 points
- All quick-win issues resolved
- Code formatted consistently
- Ready for CI

### Pipeline 3: Pre-Deployment Quality Gate

**User Intent:** "Is my project ready to deploy?" or "Production ready check"

**Complete Sequence:**
```bash
# 1. Strict health check (fails on warnings)
npm run doctor --strict --json

# 2. Format check (no modifications)
npm run format:check

# 3. Type check
npm run build

# 4. Run all tests
npm test

# 5. Security audit
npm audit --audit-level=high

# 6. Generate deployment report
echo "Deployment readiness: PASS" > deployment-ready.txt
```

**LLM Should Execute All Steps** and only return combined result.

**If Any Check Fails:**
- Automatically run Pipeline 2 (Health & Fix)
- Re-run quality gate
- Report when all checks pass

### Pipeline 4: Quick Quality Boost (5 minutes)

**User Intent:** "Make my code better fast" or "Quick improvements"

**Complete Sequence:**
```bash
# 1. Assess quick wins only
npm run doctor

# 2. Apply config fixes (no installs)
npm run doctor --fix --no-install

# 3. Format all code
npm run format

# 4. Show improvement
npm run doctor
```

**Expected Time:** < 5 minutes  
**Expected Improvement:** +10-20 health points

---

## Decision Trees

### Decision Tree 1: New Project Setup

```
START: User wants to create new project
│
├─ Q: Is directory empty or only package.json?
│  │
│  ├─ YES → Run Pipeline 1: New Project Zero → Production
│  │        1. npm run agent:init (interactive)
│  │        2. npm run doctor --preset X --fix
│  │        3. npm test
│  │        4. git init
│  │        → END: Project ready
│  │
│  └─ NO → Q: Does project have configs?
│           │
│           ├─ YES → Run Pipeline 2: Health & Fix
│           │        → END: Improved existing project
│           │
│           └─ NO → Q: Can we detect framework?
│                    │
│                    ├─ YES → Run doctor --preset X --fix
│                    │        → END: Configured
│                    │
│                    └─ NO → ASK: "What framework?"
│                             → Run doctor --preset [answer] --fix
│                             → END: Configured
```

### Decision Tree 2: Existing Project Assessment

```
START: User says "fix my project" or "check my project"
│
├─ 1. Run: npm run doctor --json
│    Parse output
│
├─ 2. Check overall health score
│    │
│    ├─ Score ≥ 80 → "Project is healthy! 🟢"
│    │               Small improvements available
│    │               → Offer quick wins only
│    │
│    ├─ 60 ≤ Score < 80 → "Room for improvement 🟡"
│    │                     → Auto-run Pipeline 2 (Health & Fix)
│    │
│    └─ Score < 60 → "Needs significant work 🔴"
│                     → Auto-run Pipeline 2 (Complete Fix)
│                     → Offer CI setup if missing
│
└─ 3. After fixes applied
      │
      ├─ Re-run: npm run doctor --json
      ├─ Compare before/after scores
      └─ Report improvements to user
```

### Decision Tree 3: Framework Detection

```
START: Need to determine framework
│
├─ 1. Check for config files
│    │
│    ├─ next.config.* found?
│    │  ├─ YES → Framework: Next.js
│    │  │        Check app/ or pages/ dir
│    │  │        → Use preset: nextjs
│    │  │
│    │  └─ NO → Continue
│    │
│    ├─ vite.config.* found?
│    │  ├─ YES → Framework: Vite
│    │  │        Check for React/Vue/Svelte
│    │  │        → Use preset: vite
│    │  │
│    │  └─ NO → Continue
│    │
│    └─ server.js/server.ts + express dependency?
│       ├─ YES → Framework: Express
│       │        → Use preset: express
│       │
│       └─ NO → Continue
│
├─ 2. Check package.json dependencies
│    │
│    ├─ "next" present → Next.js
│    ├─ "vite" present → Vite
│    ├─ "express" present → Express
│    └─ None → Continue
│
├─ 3. Check directory structure
│    │
│    ├─ app/ or pages/ dir → Likely Next.js
│    ├─ src/ + index.html → Likely Vite
│    └─ None → Continue
│
└─ 4. Unable to detect definitively
      │
      ├─ Q: Are there clear signals but conflicting?
      │  ├─ YES → ASK USER: "Detected both X and Y. Which framework?"
      │  └─ NO → Use preset: vanilla
      │
      └─ END: Framework determined
```

---

## Engineering Rules

### PowerShell/Windows Compatibility

**Critical Rules:**
- ❌ **NEVER use emoji in commit messages** (causes PowerShell parse errors)
- ❌ **NEVER use `&&` for command chaining in PowerShell** (use `;` instead)
- ✅ **Use `;` for command sequencing in PowerShell**
- ✅ **Use `Write-Output` or plain `echo` without `-e` flag**

**Examples:**
```powershell
# ❌ Wrong - fails in PowerShell
cd project && npm run build

# ✅ Correct for PowerShell
cd project; npm run build

# Or separate commands
cd project
npm run build
```

### Cross-Stack Development Practices

**Key Principles:**
1. **Avoid Unix-only shell utilities** in cross-platform workflows
   - Don't use `wc`, `sed`, `awk`, `grep` in automation scripts
   - Prefer language-native solutions (Python `len()`, `re.sub()`, etc.)
   - Or explicit PowerShell equivalents (`Get-Content`, `Select-String`)

2. **Separate library modules from scripts and CLI entrypoints**
   - Keep reusable logic in proper package modules
   - Use script files as thin entrypoints that import from main package

3. **Keep public API surfaces small and intentional**
   - Limit package's public API to carefully curated set
   - Use `__all__` declarations
   - Maintain API reference document as single source of truth

4. **Default to ASCII-safe output in automation contexts**
   - Keep CLI, log messages, machine-consumed output free of non-ASCII
   - Reserve rich formatting for opt-in flags (e.g., `--rich`)

5. **Ignore generated doctor artifacts in VCS**
   - Doctor writes `gaps-report.md`, `stack-report.json`, etc. inside `.devenv/`
   - Add explicit entries to `.gitignore` so reports don't pollute diffs

6. **Let stack profiles replace generic prescriptions**
   - DevEnvTemplate starts technology-agnostic
   - Once stack profile is detected (e.g., `node`, `python`), recommendations pivot to stack-specific toolchain
   - Don't mix profiles unless project is truly polyglot

### AI-Assisted Development Patterns

**Critical Rules:**
1. **Always re-read target files immediately before applying patches**
   - File contents may have changed since initial read
   - Always perform fresh read immediately before constructing patch

2. **Use narrow, localized context for patch operations**
   - Limit context blocks to immediate surrounding lines (3-5 lines)
   - Reduces sensitivity to unrelated changes
   - Improves patch reliability

3. **Avoid multiple edits to the same region in a single session**
   - Don't apply multiple patches that affect overlapping or adjacent lines
   - Complete one logical change, verify it works, then proceed
   - Use separate patch operations for distinct changes

4. **Be cautious with markdown and structured text formatting**
   - Headings, code blocks, list items can be sensitive to whitespace changes
   - When patching documentation, verify patched content maintains proper markdown structure

### Unicode & Encoding

**Rules:**
- **Default to ASCII-safe output**
  - Avoid non-ASCII characters in CLI output (no emoji, superscripts, degree symbols)
  - Use ASCII equivalents: `m/s^2` instead of `m/s²`, `deg` instead of `°`
- **Assume Windows console defaults (cp1252)**
  - Only introduce UTF-8 text if files are explicitly opened with `encoding='utf-8'`
  - Environment/CI must be configured to handle UTF-8

---

## Troubleshooting Quick Reference

### Common Issues

| Issue | Solution |
|-------|----------|
| Installation fails | `rm -rf node_modules package-lock.json && npm install` |
| Doctor not found | `npm run build` (compile TypeScript first) |
| Tests timeout | `npm run test:fast` (run only fast tests) |
| CI fails | Test locally first: `npm test` |
| Cleanup removes too much | Use `--keep` flag |
| Config not found | Ensure `config/` directory exists |
| PowerShell errors | Use `;` instead of `&&` |
| Low health score | Focus on critical issues only |
| JSON parsing errors | Validate JSON syntax, check for trailing commas |
| Stack detection wrong | Use `--preset` flag to override |
| Doctor inspects wrong directory | Use `--project-root` flag or set `DEVENV_PROJECT_ROOT` |

### Stack Detection Issues

**Problem:** Doctor not detecting framework correctly

**Solution:**
```bash
# Check what was detected
npm run doctor --json | grep -A5 "frameworks"

# Manually specify preset
npm run doctor --preset nextjs --json

# If correct, apply with preset
npm run doctor --preset nextjs --fix

# Verify detection
npm run doctor
```

### Build Artifacts Not Found

**Problem:** `npm run doctor` fails with "Cannot find module" when embedded

**Solution:**
```bash
# Build TypeScript first
cd .devenv
npm install
npm run build
npm run doctor
```

**Prevention:** Always run `npm run build` after cloning DevEnvTemplate into `.devenv/`.

### Embedded Usage Issues

**Problem:** Doctor analyzes DevEnvTemplate instead of parent project

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

---

## Setup Instructions

### Initial Embedding

1. **Add `.devenv/` to Your Project**
   ```bash
   # Inside your project root
   git clone https://github.com/XylarDark/DevEnvTemplate .devenv
   ```

2. **Install & Build DevEnvTemplate Once**
   ```bash
   cd .devenv
   npm install          # install DevEnvTemplate dependencies
   npm run build        # compile doctor/stack-detector/gap-analyzer
   ```

3. **Capture Project Intent (Optional, Recommended)**
   ```bash
   npm run agent:init
   ```
   Answer the 5 interactive questions. This creates `project.manifest.json`.

4. **Run the First Doctor Pass**
   ```bash
   # From the project root
   npm run doctor
   ```
   The first run writes `.devenv/stack-report.json`. All subsequent runs use the detected stack profile.

### Running from `.devenv/`

Once `.devenv/` exists, you can run doctor from there:

```powershell
# Windows PowerShell
Set-Location C:\dev\your-project\.devenv
npm run doctor              # auto-detects parent project
npm run doctor -- --project-root ..   # explicit override
```

```bash
# macOS / Linux
cd ~/dev/your-project/.devenv
npm run doctor                    # auto-detects parent project

# Or point anywhere:
DEVENV_PROJECT_ROOT=../other-project npm run doctor -- --project-root ../other-project
```

---

## Best Practices

### For LLMs Working with DevEnvTemplate

1. **Execute Command Pipelines, Not Single Commands**
   - Execute complete workflows
   - Don't prompt between safe operations
   - Explain full plan upfront

2. **Prioritize Automation**
   - Auto-execute safe pipelines
   - Only ask when truly necessary
   - Use --dry-run for preview

3. **Parse and Use Output**
   - Extract data from JSON
   - Make decisions based on scores
   - Chain commands intelligently

4. **Framework-Aware**
   - Detect framework automatically
   - Apply framework-specific configs
   - Use correct preset

5. **Health-Driven Actions**
   - Score < 60? → Full fix pipeline
   - Score 60-79? → Quick wins
   - Score 80+? → Maintenance only

6. **User-Friendly Reporting**
   - Show before/after scores
   - List what changed
   - Explain next steps

### When to Ask vs Proceed

**Proceed Automatically:**
- ✅ Health checks (read-only)
- ✅ Fixes with --dry-run
- ✅ Config-only changes
- ✅ Installing dev dependencies
- ✅ Formatting code
- ✅ Creating .env.example
- ✅ Clear framework detection

**Ask User First:**
- ⚠️ Destructive operations (cleanup --apply)
- ⚠️ Enabling strict mode if large codebase
- ⚠️ Framework migration
- ⚠️ Ambiguous framework detection
- ⚠️ Deleting files
- ⚠️ Major version upgrades

---

## Framework-Specific Guidance

### Next.js Projects

**Preset:** `nextjs`

**Detection Signals:**
- `next.config.js/mjs/ts` file exists
- `next` dependency in package.json
- `app/` or `pages/` directory exists

**Recommended Setup:**
```bash
npm run doctor --preset nextjs --fix
```

**What It Configures:**
- ESLint with `next/core-web-vitals`
- TypeScript with Next.js plugins
- Environment variables with `NEXT_PUBLIC_` prefix
- npm scripts for lint/format/typecheck

### Vite Projects

**Preset:** `vite`

**Detection Signals:**
- `vite.config.ts/js` file exists
- `vite` dependency in package.json
- `index.html` in root directory

**Recommended Setup:**
```bash
npm run doctor --preset vite --fix
```

**What It Configures:**
- ESLint with React/Vue/Svelte plugins
- TypeScript with `react-jsx`
- Environment variables with `VITE_` prefix

### Express API Projects

**Preset:** `express`

**Detection Signals:**
- `express` dependency in package.json
- `server.js/ts` or `app.js/ts` with express patterns
- No frontend framework config files

**Recommended Setup:**
```bash
npm run doctor --preset express --fix
```

**What It Configures:**
- ESLint for Node.js
- TypeScript with `commonjs` module
- Environment variables for API (NODE_ENV, PORT, etc.)

---

## Technology-Agnostic Best Practices

### Encryption Key Generation

**Problem:** Base64 encoding errors are common when generating encryption keys manually.

**Solution:** Use DevEnvTemplate utilities:
```typescript
import { generateEncryptionKey, validateBase64Key } from './scripts/utils/crypto-helpers';

// Generate a key
const key = generateEncryptionKey(32); // 32 bytes for AES-256

// Validate the key
const validation = validateBase64Key(key, 32);
if (!validation.valid) {
  console.error(validation.error);
}
```

**CLI Tool:**
```bash
node dist/scripts/tools/generate-key.js --length 32
```

### Environment Variable Validation

**Problem:** Missing or invalid environment variables cause runtime errors.

**Solution:** Use validation utilities:
```typescript
import { requireEnvVar, requireEncryptionKey } from './scripts/utils/env-validator';

// Check for required variable
const apiKey = requireEnvVar('API_KEY', {
  hint: 'Set API_KEY in your .env file'
});

// Validate encryption key format
const encryptionKey = requireEncryptionKey('ENCRYPTION_KEY', 32);
```

### Error Handling

**Problem:** Generic error messages don't help users fix issues.

**Solution:** Use error helpers for actionable messages:
```typescript
import { createActionableError, createJsonParseError } from './scripts/utils/error-helpers';

// JSON parsing errors
try {
  JSON.parse(content);
} catch (error) {
  throw createJsonParseError(error as Error, 'package.json');
}

// General errors with hints
throw createActionableError(
  'Invalid encryption key format',
  {
    hints: [
      'Key must be 44 characters for a 32-byte key',
      'Generate a new key using: node dist/scripts/tools/generate-key.js'
    ],
    docs: 'docs/BEST-PRACTICES.md#encryption-key-generation'
  }
);
```

### Verification Procedures

**Problem:** No standardized way to verify project setup before commit/deploy.

**Solution:** Use verification utilities:
```typescript
import { verifyPreCommit, verifyPreDeployment } from './scripts/utils/verification';

// Pre-commit checks
const result = await verifyPreCommit(projectRoot);
if (!result.passed) {
  console.error('Pre-commit checks failed:', result.errors);
}

// Pre-deployment checks
const deployResult = await verifyPreDeployment(projectRoot);
if (!deployResult.passed) {
  console.error('Pre-deployment checks failed:', deployResult.errors);
}
```

### Cross-Platform Compatibility

**Problem:** Shell commands differ between Windows PowerShell and Bash.

**Solution:** Use shell helpers:
```typescript
import { formatCommand, getShellExample } from './scripts/utils/shell-helpers';

// Auto-format for current shell
const commands = ['cd /path', 'npm run build'];
const formatted = formatCommand(commands);

// Get shell-specific example
const bashExample = 'cd /path && npm run build';
const psExample = getShellExample(bashExample); // Converts to PowerShell
```

---

## Appendix: Links to Full Documentation

For detailed information, see:

- **[LLM-CONTEXT-GUIDE.md](LLM-CONTEXT-GUIDE.md)** - Complete command and workflow context
- **[USAGE.md](USAGE.md)** - Day-to-day doctor/cleanup workflows
- **[SETUP-GUIDE.md](SETUP-GUIDE.md)** - Step-by-step embedding instructions
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Known issues and remediation
- **[PROJECTRULES-UPDATE-v3.0.md](PROJECTRULES-UPDATE-v3.0.md)** - Engineering rules and guidelines
- **[BEST-PRACTICES.md](BEST-PRACTICES.md)** - Technology-agnostic best practices
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Project structure and design principles

---

**End of LLM Reference Guide**

*This guide enables AI assistants to autonomously help developers with DevEnvTemplate by providing complete command context, decision-making frameworks, and automated workflows.*

