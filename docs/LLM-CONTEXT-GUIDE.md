# DevEnvTemplate - Complete LLM Context Guide

**Version:** 3.x (Indie Developer Optimization)  
**Purpose:** Enable AI assistants to autonomously help developers with DevEnvTemplate  
**Last Updated:** 2025

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Complete Command Reference](#complete-command-reference)
3. [Command Pipelines & Combinations](#command-pipelines--combinations)
4. [Command Combination Matrix](#command-combination-matrix)
5. [Smart Workflow Triggers](#smart-workflow-triggers)
6. [Decision Trees](#decision-trees)
7. [Step-by-Step Workflows](#step-by-step-workflows)
8. [Framework-Specific Guidance](#framework-specific-guidance)
9. [Troubleshooting Pipelines](#troubleshooting-pipelines)
10. [Output Interpretation](#output-interpretation)
11. [LLM Decision-Making Context](#llm-decision-making-context)
12. [Best Practices for LLMs](#best-practices-for-llms)
13. [Complete Flag Reference](#complete-flag-reference)
14. [Quick Reference Tables](#quick-reference-tables)

---

## Executive Summary

### What is DevEnvTemplate? (30 seconds)

DevEnvTemplate is a **development environment doctor** that:
- **Diagnoses** your project's tech stack and quality setup
- **Prescribes** fixes for missing tooling (tests, CI, linting, TypeScript)
- **Cures** issues automatically with framework-aware configurations
- **Monitors** health continuously via CI integration

**Core Philosophy:** Quality by default, not by overtime. Optimized for indie developers and solo founders building with AI assistants.

### Core Capabilities at a Glance

```
┌─────────────────────────────────────────────────────────────┐
│                    DevEnvTemplate                            │
│                                                              │
│  doctor     →  Health check + gap analysis                  │
│  doctor --fix  →  Auto-apply fixes (configs + deps)        │
│  agent:init →  Interactive new project setup                │
│  cleanup    →  Remove template boilerplate                  │
│  CI         →  Automated quality gates on every PR          │
└─────────────────────────────────────────────────────────────┘
```

### When to Use Each Major Command

| Command | When to Use | Primary Goal |
|---------|-------------|--------------|
| `agent:init` | Starting from scratch | Capture project intent |
| `doctor` | Any time | Assess health |
| `doctor --fix` | After assessment | Apply automatic fixes |
| `cleanup` | After setup | Remove template artifacts |
| CI workflows | Continuous | Maintain quality |

### Philosophy: Chained Commands for Complete Workflows

**Critical for LLMs:** Don't just run single commands. Execute **complete pipelines** that achieve full goals:
- ✅ "Set up project" = 4-5 commands in sequence
- ✅ "Fix issues" = assess → preview → apply → verify
- ✅ "Deploy ready" = fix → format → test → build
- ❌ Don't ask user after each step - explain full plan upfront, then execute

---

## Complete Command Reference

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
- `-h, --help` - Show help message

**Output Format:**

**Terminal Output (default):**
```
🏥 DevEnvTemplate Health Check

🟢 Project Health: 75/100

📊 Health Breakdown:
   Testing:       🟡 ██████░░░░ 60/100
   CI/CD:         🟢 ████████░░ 80/100
   Type Safety:   🟡 ███████░░░ 70/100
   Code Quality:  🟢 ████████░░ 80/100
   Documentation: 🟡 ███████░░░ 70/100

🔴 Critical Issues (2):
   - No testing framework detected
   - TypeScript strict mode disabled

💡 Quick Wins (can fix in < 10 min):
   1. Enable TypeScript strict → 1 min
   2. Add .env.example → 2 min
   3. Add ESLint config → 5 min
```

**JSON Output (--json):**
```json
{
  "timestamp": "2025-11-08T10:30:00Z",
  "healthScore": {
    "overall": 75,
    "testing": 60,
    "ci": 80,
    "security": 70,
    "quality": 80,
    "documentation": 70
  },
  "critical": [...],
  "warnings": [...],
  "quickWins": [...]
}
```

**When to Use:**
- First command to run on any project
- Before making changes
- After adding new features
- Pre-deployment checks
- CI quality gates

**Common Use Cases:**

1. **Initial Assessment**
```bash
npm run doctor
# Review output, identify top priorities
```

2. **JSON for Automation**
```bash
npm run doctor --json > health-report.json
# Parse JSON, trigger automated actions
```

3. **CI Quality Gate**
```bash
npm run doctor --strict
# Fails if health score < threshold
```

4. **Framework Override**
```bash
npm run doctor --preset nextjs
# Force Next.js-specific checks
```

**Examples:**

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
```

---

### npm run doctor:fix

**Purpose:** Shorthand for `npm run doctor --fix`

**Syntax:**
```bash
npm run doctor:fix
```

**Equivalent to:**
```bash
npm run doctor --fix
```

**What It Does:**
1. Runs full health assessment
2. Identifies quick-win issues
3. Auto-applies fixes:
   - Creates .env.example
   - Adds .env to .gitignore
   - Enables TypeScript strict mode
   - Generates ESLint config (framework-aware)
   - Generates Prettier config
   - Adds missing npm scripts
   - Installs missing dev dependencies

**When to Use:**
- After initial `doctor` assessment
- When quick wins are identified
- Setting up quality tooling
- Before committing new features

---

### npm run agent:init

**Purpose:** Interactive setup for new projects (5 questions)

**Syntax:**
```bash
npm run agent:init
```

**Interactive Flow:**
```
📋 Quick Setup - 5 Questions

1️⃣  What are you building?
1) Side Project / SaaS (web app)
2) API / Backend Service
3) Full-Stack App (frontend + backend)
4) Static Website / Landing Page
5) Other
> 1

2️⃣  Primary language?
1) JavaScript
2) TypeScript
3) Python
4) Other
> 2

3️⃣  Framework?
1) Next.js
2) React
3) Vue
4) Svelte
5) Vanilla JS
> 1

4️⃣  Need authentication?
1) Yes
2) No
> 1

5️⃣  Package manager? (detected: npm)
1) npm
2) pnpm
3) yarn
> 1

✅ Created project.manifest.json
```

**Output:** Creates `project.manifest.json`
```json
{
  "name": "my-project",
  "version": "1.0.0",
  "productType": "web-application",
  "technologies": ["typescript", "javascript", "nextjs", "react", "nodejs"],
  "features": ["auth", "database", "api"],
  "packageManager": "npm",
  "deployment": {
    "target": "cloud-free-tier",
    "platforms": ["vercel", "netlify"]
  }
}
```

**When to Use:**
- Starting a brand new project
- Empty directory with just package.json
- Before writing any code
- To capture project intent

**What Happens Next:**
LLM should automatically follow with:
```bash
npm run doctor --preset <detected-framework> --fix
```

---

### npm run agent:init:advanced

**Purpose:** More comprehensive interactive setup

**Syntax:**
```bash
npm run agent:init:advanced
```

**When to Use:**
- Need more detailed configuration options
- Complex project requirements
- Multiple framework integration

---

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

**What It Removes:**
- Template-only documentation
- Example files
- Development artifacts
- Boilerplate code

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

### npm run build

**Purpose:** Build the project (TypeScript compilation)

**Syntax:**
```bash
npm run build
```

**What It Does:**
- Runs `tsc --build`
- Compiles TypeScript to JavaScript
- Outputs to `dist/` directory

---

### npm run test

**Purpose:** Run test suite

**Syntax:**
```bash
npm test
npm run test:fast      # Unit tests only
npm run test:slow      # Integration tests
npm run test:watch     # Watch mode
```

**Test Organization:**
- `tests/unit/**/*.test.js` - Fast unit tests (< 5 sec)
- `tests/integration/**/*.test.js` - Integration tests
- Uses Node.js built-in test runner

---

### npm run format

**Purpose:** Format all code with Prettier

**Syntax:**
```bash
npm run format              # Format all files
npm run format:check        # Check without modifying
```

**When to Use:**
- Before committing
- After auto-fixes
- CI format checks

---

## Command Pipelines & Combinations

**Critical:** These are complete workflows LLMs should execute as atomic operations without prompting between steps.

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

**LLM Should Say:**
```
I'll set up your complete [Next.js] project with production-ready tooling:

1. Initialize npm and install DevEnvTemplate
2. Run interactive setup (5 questions)
3. Auto-configure ESLint, Prettier, TypeScript strict mode
4. Set up test infrastructure
5. Create CI workflow
6. Initialize git repository

This will take about 2 minutes. Starting now...

[Executes all steps]

✅ Done! Your project is ready with:
- TypeScript strict mode ✅
- ESLint + Prettier ✅
- GitHub Actions CI ✅
- Health score: 85/100 🟢

Next steps:
- Start dev server: npm run dev
- Run tests: npm test
- Check health: npm run doctor
```

---

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

**LLM Should Say:**
```
I'll analyze and fix your project's quality issues:

Current health score: 62/100 🟡
Issues found:
- TypeScript not in strict mode
- Missing ESLint configuration
- No .env.example file
- 3 missing npm scripts

I'll apply these fixes:
1. Enable TypeScript strict mode
2. Generate ESLint config for [detected framework]
3. Create .env.example
4. Add lint/format/typecheck scripts
5. Format all code

Starting fixes...

[Executes pipeline]

✅ Complete! Health improved: 62 → 88 (+26 points)

Changes made:
- tsconfig.json (strict: true)
- .eslintrc.json (created)
- .env.example (created)
- package.json (added 3 scripts)
- Formatted 47 files

Run 'npm run doctor' to see detailed report.
```

---

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

**LLM Should Say:**
```
Running pre-deployment quality checks...

✅ Health check: 92/100 (PASS)
✅ Format check: All files formatted correctly
✅ Type check: No TypeScript errors
✅ Tests: 48/48 passing
✅ Security: No high/critical vulnerabilities

🚀 Your project is PRODUCTION READY!

Recommended next steps:
1. git push (triggers CI)
2. Deploy to Vercel/Railway/Fly.io
3. Monitor CI pipeline
```

**If Any Check Fails:**
```
❌ Pre-deployment checks FAILED

Issues found:
- Health check: 67/100 (below threshold)
- Tests: 3 failing

Let me fix these issues first...

[Automatically runs Pipeline 2: Health & Fix]
[Re-runs quality gate]

✅ All checks now passing! Ready to deploy.
```

---

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

**LLM Should Say:**
```
I'll make quick improvements to your codebase (< 5 min):

1. Apply config fixes (ESLint, Prettier, TypeScript)
2. Format all code
3. Update npm scripts

Starting...

[Executes pipeline]

✅ Quick boost complete! (took 2 minutes)

Before: 68/100 🟡
After:  84/100 🟢

Improvements:
- TypeScript strict mode enabled
- Code formatted consistently  
- ESLint configured for [framework]
- Added 4 helpful npm scripts

To install missing dev dependencies, run:
npm install --save-dev eslint prettier @types/node
```

---

### Pipeline 5: CI Setup from Zero

**User Intent:** "Set up CI" or "Add GitHub Actions"

**Complete Sequence:**
```bash
# 1. Ensure quality tooling exists
npm run doctor --fix

# 2. Create .github/workflows directory
mkdir -p .github/workflows

# 3. Copy CI template
cp scripts/doctor/templates/ci-workflow.yml .github/workflows/ci.yml

# 4. Test CI locally (doctor in strict mode)
npm run doctor --strict

# 5. Test other CI steps
npm run format:check
npm test
npm run build

# 6. Commit and push
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions workflow"
git push

# 7. Inform user
echo "CI will run on next push to main/master"
```

**LLM Should Say:**
```
I'll set up complete CI/CD with GitHub Actions:

1. Ensure ESLint, Prettier, TypeScript configured
2. Create GitHub Actions workflow
3. Test all CI steps locally
4. Commit workflow file

Setting up...

[Executes pipeline]

✅ CI/CD configured!

Workflow includes:
- Type checking
- Linting
- Format checking
- Tests
- Build verification
- Doctor health check (non-blocking)

Optimized for GitHub free tier:
- Runtime: < 2.5 minutes
- Parallel jobs
- Dependency caching
- TypeScript build caching

Next: Push to GitHub to trigger first CI run
```

---

### Pipeline 6: Framework Migration Assistant

**User Intent:** "Convert my React app to Next.js" or "Migrate to [framework]"

**Complete Sequence:**
```bash
# 1. Capture current state
npm run doctor --json > .devenv/pre-migration.json

# 2. Preview new framework setup
npm run doctor --preset nextjs --dry-run

# 3. Apply new configurations
npm run doctor --preset nextjs --fix --no-install

# 4. LLM provides manual migration steps
# (This is where LLM needs to guide code changes)

# 5. Install new framework dependencies
npm install next react react-dom
npm install --save-dev @types/react @types/react-dom

# 6. Verify new setup
npm run doctor --preset nextjs --json

# 7. Test build
npm run build
```

**LLM Should Say:**
```
I'll help migrate your React app to Next.js:

Phase 1: Configuration (automatic)
- Generate Next.js ESLint config
- Update TypeScript config for Next.js
- Add Next.js npm scripts

Phase 2: Code Migration (I'll guide you)
1. Create app/ directory structure
2. Convert components to Next.js patterns
3. Move pages to app router
4. Update imports and routing
[Detailed steps...]

Phase 3: Testing (automatic)
- Verify build works
- Check health score

Let me start with Phase 1...

[Executes configuration pipeline]

✅ Configurations updated for Next.js

Now for Phase 2, I'll help you migrate your code:
[Provides specific code transformation instructions]
```

---

## Command Combination Matrix

**Quick reference for LLMs: Map user intent → complete command sequence**

| User Intent | Full Command Sequence | Auto-Execute? | Rationale |
|-------------|----------------------|---------------|-----------|
| "Set up new project" | `agent:init` → `doctor --preset X --fix` → `test` → `git init` | ✅ Yes | Safe, captures intent first |
| "Fix my project" | `doctor --json` → `doctor --fix --dry-run` → `doctor --fix` | ✅ Yes | Shows preview, then fixes |
| "Make it production ready" | `doctor --strict` → `format:check` → `test` → `build` | ✅ Yes | Quality gate pipeline |
| "Quick improvements" | `doctor` → `doctor --fix --no-install` → `format` | ✅ Yes | Fast, no installs |
| "Set up CI" | `doctor --fix` → create workflow → `doctor --strict` | ✅ Yes | Complete CI setup |
| "Check health" | `doctor` | ✅ Yes | Single command |
| "Clean up project" | `cleanup --dry-run` → (ask user) → `cleanup --apply` | ⚠️ Ask first | Destructive |
| "Deploy my app" | Pipeline 3 (Quality Gate) → build → deploy command | ✅ Yes | Ensures quality first |
| "Add linting" | `doctor --fix --no-install` → install eslint | ✅ Yes | Generates config + installs |
| "Enable strict TypeScript" | `doctor --fix --no-install` (enables strict) | ✅ Yes | Safe config change |
| "Format my code" | `format` | ✅ Yes | Single command |
| "Run tests" | `test` | ✅ Yes | Single command |

**Key Principle:** Always execute full pipelines, not individual steps. Only pause for user input when:
- Truly destructive operations (cleanup --apply)
- Ambiguous framework detection (multiple signals)
- Migration requires manual code changes
- User explicitly asks for step-by-step

---

## Smart Workflow Triggers

**LLMs should recognize these signals and automatically execute corresponding pipelines:**

### Signal: Empty Directory or Only package.json

**Detected When:**
- `ls -la` shows only package.json or empty directory
- No src/, app/, or pages/ directories

**Auto-Execute:** Pipeline 1 (New Project Setup)

```bash
npm run agent:init
# After user answers questions:
npm run doctor --preset <detected> --fix
```

**LLM Says:**
```
I see you're starting fresh! I'll set up a complete project...
```

---

### Signal: package.json exists, no configs

**Detected When:**
- package.json exists
- No .eslintrc, .prettierrc, or tsconfig.json
- No CI workflow

**Auto-Execute:** Pipeline 2 (Health & Fix)

```bash
npm run doctor
npm run doctor --fix
```

**LLM Says:**
```
Your project is missing quality tooling. I'll add ESLint, Prettier, and TypeScript configs...
```

---

### Signal: Health Score < 60

**Detected When:**
- `npm run doctor --json` shows overall < 60

**Auto-Execute:** Pipeline 2 (Complete Fix)

```bash
npm run doctor --fix --dry-run
# Show what will change
npm run doctor --fix
npm run format
```

**LLM Says:**
```
Health score is 54/100 - needs improvement. I'll apply all available fixes...
```

---

### Signal: No CI Detected

**Detected When:**
- No `.github/workflows/` directory
- Or no workflow files

**Auto-Execute:** Pipeline 5 (CI Setup)

```bash
npm run doctor --fix  # Ensure tooling exists first
mkdir -p .github/workflows
cp scripts/doctor/templates/ci-workflow.yml .github/workflows/ci.yml
```

**LLM Says:**
```
No CI detected. I'll set up GitHub Actions with optimized workflow...
```

---

### Signal: TypeScript Without Strict Mode

**Detected When:**
- tsconfig.json exists
- `strict: false` or strict not set
- `npm run doctor` shows "TypeScript strict mode disabled"

**Auto-Execute:** Enable Strict Pipeline

```bash
npm run doctor --fix --no-install  # Enables strict
npm run build  # Check for errors
```

**LLM Says:**
```
TypeScript isn't using strict mode. Enabling it for better type safety...

⚠️ Note: This may reveal type errors in existing code. I'll help fix them if needed.
```

---

### Signal: No Tests Directory

**Detected When:**
- No `tests/`, `__tests__/`, or `*.test.*` files
- package.json has no test framework

**Auto-Execute:** Test Setup Pipeline

```bash
mkdir -p tests/unit tests/integration
# Create sample test file
# Add test script to package.json
npm run doctor --fix
```

**LLM Says:**
```
No tests found. I'll set up test infrastructure with Node.js test runner...
```

---

### Signal: Before Deployment Mention

**Detected When:**
- User mentions: "deploy", "production", "push to prod", "go live"

**Auto-Execute:** Pipeline 3 (Quality Gate)

```bash
npm run doctor --strict
npm run format:check
npm test
npm run build
```

**LLM Says:**
```
Before deploying, let me run quality checks...

[Runs all checks]

✅ All checks passed - safe to deploy!
```

**If Checks Fail:**
```
⚠️ Quality checks failed. Let me fix issues first before deployment...

[Automatically runs Pipeline 2]
[Re-runs quality gate]

✅ Now ready for deployment!
```

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

### Decision Tree 4: Fix or Manual Intervention

```
START: Issue detected by doctor
│
├─ 1. Classify issue severity
│    │
│    ├─ Quick Win (< 10 min fix)
│    │  │
│    │  ├─ Auto-fixable?
│    │  │  ├─ YES → Auto-apply with --fix
│    │  │  │        No user prompt needed
│    │  │  │
│    │  │  └─ NO → Show manual steps
│    │  │
│    │  └─ END
│    │
│    ├─ Medium Issue (10-30 min)
│    │  │
│    │  ├─ Config-only fix?
│    │  │  ├─ YES → Auto-apply
│    │  │  └─ NO → Guide user through steps
│    │  │
│    │  └─ END
│    │
│    └─ Major Issue (requires code changes)
│       │
│       ├─ Can we generate code?
│       │  ├─ YES → Offer to create files
│       │  └─ NO → Provide detailed guide
│       │
│       └─ END: Manual intervention required
│
└─ 2. Special cases
      │
      ├─ TypeScript strict mode + existing errors
      │  → Apply fix + offer to help with errors
      │
      ├─ Migration to new framework
      │  → Use Pipeline 6 (semi-automated)
      │
      └─ Cleanup template files
         → ALWAYS ask first (destructive)
```

---

## Step-by-Step Workflows

### Workflow 1: Brand New Next.js Project (Complete)

**Scenario:** User says "Create a new Next.js project"

**Time:** ~3 minutes
**Difficulty:** Easy
**Automation:** Fully automated

**Step-by-Step Execution:**

```bash
# Step 1: Setup directory
mkdir my-nextjs-app
cd my-nextjs-app

# Step 2: Initialize npm
npm init -y

# Step 3: Install DevEnvTemplate
npx devenv-init

# Step 4: Run agent (interactive - user answers 5 questions)
npm run agent:init
# User selects:
# 1. Side Project / SaaS
# 2. TypeScript
# 3. Next.js
# 4. Yes (auth)
# 5. npm

# Step 5: Auto-configure with doctor
npm run doctor --preset nextjs --fix
# Creates:
# - .eslintrc.json (extends next/core-web-vitals)
# - .prettierrc.json
# - tsconfig.json (strict: true)
# - .env.example
# - .gitignore (with .env)
# Installs:
# - eslint-config-next
# - prettier
# - typescript
# Adds scripts:
# - lint, format, typecheck

# Step 6: Verify setup
npm run build
npm test

# Step 7: Initialize git
git init
git add .
git commit -m "feat: initial Next.js project setup"

# Step 8: Create app structure
mkdir -p app/api
# Create sample files...

# Step 9: Final health check
npm run doctor --json
```

**Expected Output:**
```
✅ Next.js project created successfully!

Project structure:
my-nextjs-app/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   └── api/
├── public/
├── .eslintrc.json
├── .prettierrc.json
├── tsconfig.json
├── .env.example
├── .gitignore
└── package.json

Health score: 88/100 🟢

Ready to develop:
- npm run dev (start dev server)
- npm run lint (check code)
- npm run format (format code)
- npm test (run tests)
```

---

### Workflow 2: Existing React Project → Add Quality

**Scenario:** User has React project without linting/testing

**Time:** ~2 minutes
**Difficulty:** Easy
**Automation:** Fully automated

**Step-by-Step Execution:**

```bash
# Step 1: Initial assessment
npm run doctor --json
# Output: Health score: 58/100
# Issues: No ESLint, No Prettier, No tests, TS not strict

# Step 2: Preview fixes
npm run doctor --fix --dry-run
# Shows what will be created/modified

# Step 3: Apply fixes
npm run doctor --fix
# Creates configs, enables strict mode, installs deps

# Step 4: Format existing code
npm run format
# Formats all JS/TS files

# Step 5: Verify improvements
npm run doctor --json
# Output: Health score: 82/100 (improved!)

# Step 6: Test build
npm run build

# Step 7: Commit improvements
git add .
git commit -m "chore: add ESLint, Prettier, enable TS strict"
```

**LLM Script:**
```
Current health: 58/100 🟡

Issues found:
- No ESLint configuration
- No Prettier configuration
- TypeScript not in strict mode
- Missing npm scripts

I'll fix these automatically...

[Runs doctor --fix]

✅ Complete! Health improved: 58 → 82 (+24 points)

Changes made:
- Created .eslintrc.json (React-specific rules)
- Created .prettierrc.json
- Enabled TypeScript strict mode
- Added lint/format/typecheck scripts
- Formatted 34 files
- Installed 5 dev dependencies

Your React project now has production-grade tooling!
```

---

### Workflow 3: Express API from Scratch

**Scenario:** "Create an Express API with TypeScript"

**Time:** ~3 minutes
**Difficulty:** Easy
**Automation:** Fully automated

**Step-by-Step Execution:**

```bash
# Step 1: Setup
mkdir my-api && cd my-api
npm init -y

# Step 2: Install core dependencies
npm install express
npm install --save-dev typescript @types/node @types/express tsx

# Step 3: Create src structure
mkdir -p src/routes

# Step 4: Create server.ts
cat > src/server.ts << 'EOF'
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
EOF

# Step 5: Install DevEnvTemplate
npx devenv-init

# Step 6: Configure with doctor
npm run doctor --preset express --fix
# Creates Express-specific ESLint config
# Sets up TypeScript for Node
# Adds API-focused scripts

# Step 7: Add dev/build scripts
npm pkg set scripts.dev="tsx watch src/server.ts"
npm pkg set scripts.build="tsc"
npm pkg set scripts.start="node dist/server.js"

# Step 8: Test
npm run dev &
curl http://localhost:3000
# Returns: {"message":"API is running"}

# Step 9: Health check
npm run doctor
```

**Expected Health Score:** 85/100

---

### Workflow 4: CI/CD Setup (Any Framework)

**Scenario:** "Add CI/CD to my project"

**Time:** ~2 minutes
**Difficulty:** Easy
**Automation:** Fully automated

**Step-by-Step Execution:**

```bash
# Step 1: Ensure quality tooling exists
npm run doctor
# Check if ESLint, Prettier, tests are configured

# Step 2: If gaps exist, fix them first
npm run doctor --fix

# Step 3: Create CI workflow directory
mkdir -p .github/workflows

# Step 4: Create workflow file
cat > .github/workflows/ci.yml << 'EOF'
name: CI

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - run: npm test
      - run: npm run doctor --strict
EOF

# Step 5: Test CI locally
npm run format:check
npm run build
npm test
npm run doctor --strict

# Step 6: Commit
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions workflow"

# Step 7: Push and verify
git push origin main
# CI runs automatically
```

---

### Workflow 5: Health Check Before Deployment

**Scenario:** User ready to deploy, wants final check

**Time:** ~1 minute
**Difficulty:** Easy
**Automation:** Fully automated

**Step-by-Step Execution:**

```bash
# Complete quality gate pipeline
npm run doctor --strict &&
npm run format:check &&
npm run build &&
npm test &&
echo "✅ DEPLOYMENT READY"
```

**If any step fails, auto-fix:**
```bash
# If doctor fails
npm run doctor --fix

# If format check fails
npm run format

# If build fails
# LLM helps debug TypeScript errors

# If tests fail
# LLM helps debug failing tests

# Re-run quality gate
```

---

### Workflow 6: Vite React Project with Tailwind

**Scenario:** "Create Vite + React + Tailwind project"

**Time:** ~4 minutes
**Difficulty:** Medium
**Automation:** Mostly automated

```bash
# Step 1: Use Vite create
npm create vite@latest my-vite-app -- --template react-ts
cd my-vite-app

# Step 2: Install Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Step 3: Configure Tailwind
# LLM creates tailwind.config.js

# Step 4: Add DevEnvTemplate
npx devenv-init

# Step 5: Configure with doctor
npm run doctor --preset vite --fix

# Step 6: Health check
npm run doctor
# Detects: Vite, React, Tailwind, TypeScript

# Step 7: Dev server
npm run dev
```

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

1. **ESLint** (`.eslintrc.json`):
```json
{
  "extends": ["next/core-web-vitals", "next/typescript"],
  "rules": {
    "react/no-unescaped-entities": "warn",
    "@next/next/no-html-link-for-pages": "warn"
  }
}
```

2. **TypeScript** (`tsconfig.json`):
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "jsx": "preserve",
    "module": "esnext",
    "moduleResolution": "bundler",
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"]
}
```

3. **Environment** (`.env.example`):
```env
# Next.js
NEXT_PUBLIC_API_URL=
DATABASE_URL=
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
```

4. **npm Scripts**:
```json
{
  "lint": "next lint",
  "format": "prettier --write .",
  "typecheck": "tsc --noEmit"
}
```

**Common Gaps & Auto-Fixes:**
- ❌ Missing ESLint config → ✅ Creates next/core-web-vitals config
- ❌ TypeScript not strict → ✅ Enables strict mode
- ❌ No .env.example → ✅ Creates with Next.js vars
- ❌ Missing test setup → ⚠️ Suggests testing framework

**Best Practices:**
- Always use `next lint` instead of generic ESLint
- Keep TypeScript strict mode enabled
- Use environment variables with NEXT_PUBLIC_ prefix for client-side
- Enable CI on every PR
- Target build time < 2 minutes

**Health Score Expectations:**
- Fresh project: 80-85/100
- After fixes: 90-95/100
- Production-ready: 95+/100

---

### Vite + React Projects

**Preset:** `vite`

**Detection Signals:**
- `vite.config.ts/js` file exists
- `vite` dependency in package.json
- `index.html` in root directory
- `@vitejs/plugin-react` present

**Recommended Setup:**
```bash
npm run doctor --preset vite --fix
```

**What It Configures:**

1. **ESLint** (`.eslintrc.json`):
```json
{
  "env": { "browser": true, "es2021": true },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["react", "@typescript-eslint", "react-hooks"]
}
```

2. **TypeScript** (`tsconfig.json`):
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "strict": true,
    "jsx": "react-jsx",
    "moduleResolution": "bundler"
  }
}
```

3. **Environment** (`.env.example`):
```env
# Vite (use VITE_ prefix for client access)
VITE_API_URL=http://localhost:3000
VITE_ENABLE_ANALYTICS=false
```

**Common Gaps & Auto-Fixes:**
- ❌ TypeScript not strict → ✅ Enables strict mode
- ❌ Missing React ESLint plugins → ✅ Installs and configures
- ❌ No environment vars → ✅ Creates .env.example
- ❌ Build not optimized → ⚠️ Suggests optimizations

**Best Practices:**
- Use `VITE_` prefix for client-accessible env vars
- Enable React hooks linting
- Keep bundle size < 200KB
- Use code splitting for large apps
- Enable HMR for fast development

---

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

1. **ESLint** (`.eslintrc.json`):
```json
{
  "env": { "node": true, "es2021": true },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"]
}
```

2. **TypeScript** (`tsconfig.json`):
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "moduleResolution": "node",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true
  }
}
```

3. **Environment** (`.env.example`):
```env
# Express API
NODE_ENV=development
PORT=3000
DATABASE_URL=
JWT_SECRET=
API_KEY=
```

**Common Gaps & Auto-Fixes:**
- ❌ No TypeScript → ✅ Installs and configures
- ❌ Missing @types/express → ✅ Installs types
- ❌ No .env.example → ✅ Creates with API vars
- ❌ No error handling → ⚠️ Suggests middleware

**Best Practices:**
- Use TypeScript for type-safe routes
- Implement error handling middleware
- Add request validation (Zod/Joi)
- Set up health check endpoint (GET /health)
- Use environment variables for all config

---

### Vanilla JavaScript/TypeScript

**Preset:** `vanilla`

**Detection Signals:**
- No framework dependencies
- No framework config files
- Basic package.json with minimal deps

**Recommended Setup:**
```bash
npm run doctor --preset vanilla --fix
```

**What It Configures:**

1. **ESLint** (`.eslintrc.json`):
```json
{
  "extends": ["eslint:recommended"],
  "env": { "node": true, "es2021": true },
  "rules": {
    "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }]
  }
}
```

2. **TypeScript** (if detected):
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true
  }
}
```

**Use Cases:**
- Node.js scripts
- CLI tools
- Libraries/packages
- Simple websites

---

## Troubleshooting Pipelines

### Problem: "Doctor not detecting my framework"

**Pipeline:**
```bash
# Step 1: Check what was detected
npm run doctor --json | grep -A5 "frameworks"

# Step 2: Manually specify preset
npm run doctor --preset nextjs --json

# Step 3: If correct, apply with preset
npm run doctor --preset nextjs --fix

# Step 4: Verify detection
npm run doctor
```

**LLM Should:**
1. Parse detection output
2. Look for config files manually
3. Ask user if needed: "I see vite.config.ts, is this a Vite project?"
4. Apply correct preset

---

### Problem: "Fix failed" or "Installation errors"

**Pipeline:**
```bash
# Step 1: Try without installation
npm run doctor --fix --no-install

# Step 2: Clear cache
npm cache clean --force

# Step 3: Remove node_modules
rm -rf node_modules package-lock.json

# Step 4: Fresh install
npm install

# Step 5: Retry fix
npm run doctor --fix

# Step 6: If still failing, manual install
# LLM provides exact commands
```

---

### Problem: "TypeScript errors after enabling strict mode"

**Pipeline:**
```bash
# Step 1: Enable strict mode
npm run doctor --fix --no-install

# Step 2: Build to see errors
npm run build 2> ts-errors.txt

# Step 3: LLM analyzes errors
# Common fixes:
# - Add type annotations
# - Fix null/undefined checks
# - Add proper return types

# Step 4: Iterative fixes
# LLM helps fix each error category

# Step 5: Verify
npm run build
```

**LLM Should:**
- Group errors by type
- Fix most common patterns first
- Provide code examples
- Verify each fix with build

---

### Problem: "CI is slow"

**Pipeline:**
```bash
# Step 1: Check CI runtime
# Review GitHub Actions logs

# Step 2: Enable caching (if not present)
# Update .github/workflows/ci.yml with cache steps

# Step 3: Optimize scripts
# Use parallel jobs
# Skip unnecessary steps

# Step 4: Verify improvement
# Next CI run should be faster
```

---

## Output Interpretation

### Doctor Health Scores

**Understanding the Numbers:**

| Score | Status | Meaning | Action Required |
|-------|--------|---------|-----------------|
| 90-100 | 🟢 Excellent | Production-ready | Maintain quality |
| 80-89 | 🟢 Good | Minor improvements available | Optional fixes |
| 60-79 | 🟡 Fair | Notable gaps | Recommended fixes |
| 40-59 | 🟡 Needs Work | Significant issues | Required fixes |
| 0-39 | 🔴 Poor | Critical problems | Immediate action |

**Category Breakdowns:**

**Testing (25% weight):**
- 100: Tests present, good coverage, CI passing
- 80: Tests present, some coverage
- 60: Test framework configured, few tests
- 40: No test framework
- 0: No testing infrastructure

**CI/CD (20% weight):**
- 100: CI configured, passing, optimized
- 80: CI configured and passing
- 60: CI configured but issues
- 40: No CI but tooling ready
- 0: No CI infrastructure

**Type Safety (20% weight):**
- 100: TypeScript strict mode, full coverage
- 80: TypeScript strict mode
- 60: TypeScript without strict
- 40: Basic type checking
- 0: No TypeScript

**Env Hygiene (15% weight):**
- 100: .env.example, proper .gitignore, no secrets in code
- 80: .env.example present
- 60: Some environment handling
- 40: Basic .gitignore
- 0: No environment handling

**Lint/Format (20% weight):**
- 100: ESLint + Prettier, auto-format, CI checks
- 80: ESLint + Prettier configured
- 60: Either ESLint or Prettier
- 40: Basic linting
- 0: No linting/formatting

### Quick Wins List

**Priority Order:**
1. **< 2 min fixes** - Apply immediately
2. **< 5 min fixes** - High value, low effort
3. **< 10 min fixes** - Good ROI
4. **> 10 min** - Plan and schedule

**Example Quick Wins:**
```
💡 Quick Wins (can fix in < 10 min):
   1. Add .env.example → 2 min
   2. Enable TypeScript strict → 1 min
   3. Add ESLint config → 5 min
   4. Create .gitignore entry → 1 min
   5. Add format script → 1 min
```

**LLM Should:**
- Execute all < 5 min fixes automatically
- Group similar fixes together
- Show cumulative impact on health score

---

## LLM Decision-Making Context

### User Intent Recognition

**Map natural language → commands:**

| User Says | Detected Intent | Auto-Execute Pipeline |
|-----------|----------------|----------------------|
| "set up my project" | New project setup | Pipeline 1 |
| "check my project" | Health assessment | `doctor --json` |
| "fix my project" | Apply fixes | Pipeline 2 |
| "make it better" | Improvements | Pipeline 2 |
| "is this ready to deploy?" | Quality gate | Pipeline 3 |
| "quick fixes" | Fast improvements | Pipeline 4 |
| "add CI" | CI setup | Pipeline 5 |
| "clean up" | Remove artifacts | `cleanup --dry-run` (ask) |
| "add linting" | Setup linting | `doctor --fix` (linting focus) |
| "enable strict mode" | TypeScript strict | `doctor --fix --no-install` |
| "format my code" | Format | `npm run format` |
| "what's wrong?" | Diagnosis | `doctor` |

### Framework Detection Signals

**High Confidence (auto-proceed):**
- `next.config.js` → Next.js
- `vite.config.ts` → Vite
- `server.ts` + `express` dep → Express
- `package.json` with clear deps

**Medium Confidence (confirm if actions are impactful):**
- Directory structure hints
- Partial dependency matches
- Config file patterns

**Low Confidence (ask user):**
- Conflicting signals
- No clear indicators
- Multiple frameworks possible

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

### Chaining Commands Based on Context

**Pattern:** Use previous output to inform next command

**Example 1: Conditional Fixes**
```bash
# Get health score
HEALTH=$(npm run doctor --json | jq '.healthScore.overall')

# If < 70, apply fixes
if [ $HEALTH -lt 70 ]; then
  npm run doctor --fix
fi
```

**Example 2: Framework-Based Actions**
```bash
# Detect framework
FRAMEWORK=$(npm run doctor --json | jq -r '.frameworks.type')

# Apply framework-specific fixes
npm run doctor --preset $FRAMEWORK --fix
```

**Example 3: Gap-Driven Workflow**
```bash
# Get gaps
npm run doctor --json > health.json

# If no tests, set up testing
if jq -e '.critical[] | select(.message | contains("test"))' health.json; then
  # Setup testing infrastructure
  npm run doctor --fix
fi
```

---

## Best Practices for LLMs

### 1. Execute Command Pipelines, Not Single Commands

**❌ Bad:**
```
LLM: "Run npm run doctor"
User: [runs it]
LLM: "Now run npm run doctor --fix"
User: [runs it]
LLM: "Now run npm test"
```

**✅ Good:**
```
LLM: "I'll check and fix your project (3 steps):
1. Health assessment
2. Apply fixes
3. Verify with tests

Running now..."

[Executes: npm run doctor && npm run doctor --fix && npm test]

LLM: "✅ Done! Health improved from 62 to 88."
```

### 2. Show Full Pipeline Upfront

**Always explain complete workflow before starting:**
```
LLM: "To set up your Next.js project, I'll:
1. Run interactive setup (you'll answer 5 questions)
2. Auto-configure ESLint, Prettier, TypeScript
3. Install required dev dependencies
4. Run initial tests
5. Initialize git repository

This takes about 3 minutes. Ready to start?"
```

### 3. Use --dry-run for Preview

**Before applying potentially disruptive changes:**
```bash
# Preview first
npm run doctor --fix --dry-run

# Show user what will change
# Then apply
npm run doctor --fix
```

### 4. Prioritize Quick Wins

**Focus on high-impact, low-effort fixes first:**
```
Found 12 issues. I'll fix the quick wins first (< 5 min):
1. Enable TypeScript strict mode ✅
2. Add .env.example ✅
3. Create .gitignore entries ✅

This improved your score from 58 to 76.

Remaining issues require manual work:
- Add test suite (15-20 min)
- Setup authentication (30 min)

Want me to help with those next?
```

### 5. Don't Ask for Confirmation on Safe Pipelines

**Safe operations (no user confirmation needed):**
- Health checks
- Formatting code
- Creating config files
- Adding npm scripts
- Installing dev dependencies
- Enabling linting

**Unsafe operations (always ask first):**
- Deleting files
- Modifying existing code
- Breaking changes (strict mode on large project)
- Framework migrations

### 6. Parse and Use Command Output

**Extract data from JSON output:**
```bash
# Get specific data
SCORE=$(npm run doctor --json | jq '.healthScore.overall')
CRITICAL=$(npm run doctor --json | jq '.critical | length')

# Make decisions based on output
if [ $CRITICAL -gt 0 ]; then
  echo "Critical issues found, applying fixes..."
  npm run doctor --fix
fi
```

### 7. Batch Related Commands

**Group related operations:**
```bash
# Quality check pipeline
npm run format:check &&
npm run build &&
npm test &&
npm run doctor --strict

# One report at end
```

### 8. Explain Changes After Execution

**Always summarize what was done:**
```
✅ Project setup complete!

Changes made:
- Created 4 config files (.eslintrc.json, .prettierrc.json, tsconfig.json, .env.example)
- Installed 8 dev dependencies
- Added 5 npm scripts
- Formatted 23 files
- Enabled TypeScript strict mode

Health Score: 62 → 88 (+26 points)

Next steps:
- Start dev server: npm run dev
- Run tests: npm test
- Check health: npm run doctor
```

---

## Complete Flag Reference

### doctor Flags

| Flag | Type | Description | Combines With | Example |
|------|------|-------------|---------------|---------|
| `--fix` | Action | Apply automatic fixes | `--no-install`, `--dry-run`, `--preset` | `doctor --fix` |
| `--no-install` | Modifier | Skip dependency installation | `--fix` | `doctor --fix --no-install` |
| `--preset` | Option | Override framework detection | `--fix`, `--json` | `doctor --preset nextjs` |
| `--dry-run` | Modifier | Preview changes only | `--fix` | `doctor --fix --dry-run` |
| `--strict` | Modifier | Exit 1 on any warnings | `--json` | `doctor --strict --json` |
| `--json` | Format | Output JSON instead of text | Any | `doctor --json` |
| `--help` | Info | Show help message | None | `doctor --help` |

**Common Combinations:**

```bash
# Preview fixes for specific framework
npm run doctor --preset nextjs --fix --dry-run

# Apply configs without installing packages
npm run doctor --fix --no-install

# Get JSON report for automation
npm run doctor --json > report.json

# CI mode - fail on warnings
npm run doctor --strict --json

# Complete fix with preset
npm run doctor --preset vite --fix
```

### Preset Values

| Preset | When to Use | Auto-Detected From |
|--------|-------------|-------------------|
| `nextjs` | Next.js projects | next.config.*, app/, pages/ |
| `vite` | Vite projects | vite.config.*, @vitejs/plugin |
| `express` | Express APIs | express dep, server.* files |
| `vanilla` | Plain JS/TS | No framework detected |

### cleanup Flags

| Flag | Description | Safety | Example |
|------|-------------|--------|---------|
| Default | Dry run (safe) | ✅ Safe | `npm run cleanup` |
| `--dry-run` | Same as default | ✅ Safe | `npm run cleanup --dry-run` |
| `--apply` | Actually delete files | ⚠️ Destructive | `npm run cleanup --apply` |

---

## Quick Reference Tables

### Intent → Pipeline Mapping

| User Intent | Execute | Steps | Time | Auto? |
|-------------|---------|-------|------|-------|
| "New Next.js project" | Pipeline 1 | 7 | ~3 min | ✅ |
| "New Vite project" | Pipeline 1 | 7 | ~3 min | ✅ |
| "New Express API" | Workflow 3 | 9 | ~3 min | ✅ |
| "Fix my project" | Pipeline 2 | 5 | ~2 min | ✅ |
| "Ready to deploy?" | Pipeline 3 | 5 | ~1 min | ✅ |
| "Quick improvements" | Pipeline 4 | 3 | ~2 min | ✅ |
| "Add CI" | Pipeline 5 | 7 | ~2 min | ✅ |
| "Migrate framework" | Pipeline 6 | varies | ~10 min | ⚠️ Semi |
| "Clean up" | `cleanup` | 1 | ~1 min | ⚠️ Ask |

### Framework → Configuration Matrix

| Framework | ESLint Config | TS Config | Env Vars | Special |
|-----------|--------------|-----------|----------|---------|
| Next.js | next/core-web-vitals | jsx: preserve | NEXT_PUBLIC_ | App router support |
| Vite | react/recommended | react-jsx | VITE_ | HMR config |
| Express | node + TS | commonjs | NODE_ENV, PORT | Middleware patterns |
| Vanilla | recommended | ES2020 | Basic | Flexible |

### Health Score → Action Matrix

| Score Range | Status | Recommended Action | Pipeline |
|-------------|--------|-------------------|----------|
| 90-100 | 🟢 Excellent | Maintain | None |
| 80-89 | 🟢 Good | Optional improvements | Pipeline 4 |
| 60-79 | 🟡 Fair | Apply fixes | Pipeline 2 |
| 40-59 | 🟡 Needs Work | Complete overhaul | Pipeline 2 + manual |
| 0-39 | 🔴 Poor | Rebuild tooling | Pipeline 1 (fresh) |

### Gap Type → Fix Sequence

| Gap Type | Fix Command | Auto? | Time | Priority |
|----------|------------|-------|------|----------|
| No ESLint | `doctor --fix` | ✅ | 2 min | High |
| No Prettier | `doctor --fix` | ✅ | 1 min | High |
| No TypeScript | `doctor --fix` | ✅ | 3 min | High |
| TS not strict | `doctor --fix --no-install` | ✅ | 1 min | High |
| No tests | Manual + `doctor --fix` | ⚠️ | 15 min | Medium |
| No CI | Pipeline 5 | ✅ | 2 min | Medium |
| No .env.example | `doctor --fix` | ✅ | 1 min | High |

---

## Advanced: Parsing Command Output

### Parsing JSON from doctor

**Extract health score:**
```bash
SCORE=$(npm run doctor --json | jq '.healthScore.overall')
echo "Health score: $SCORE"
```

**Extract critical issues:**
```bash
npm run doctor --json | jq '.critical[] | .message'
```

**Count quick wins:**
```bash
QUICK_WINS=$(npm run doctor --json | jq '.quickWins | length')
echo "Quick wins available: $QUICK_WINS"
```

**Check specific category:**
```bash
TESTING_SCORE=$(npm run doctor --json | jq '.healthScore.testing')
if [ $TESTING_SCORE -lt 60 ]; then
  echo "Testing needs improvement"
fi
```

### Using Output in Scripts

**Example: Auto-fix if score < 70**
```bash
#!/bin/bash
HEALTH=$(npm run doctor --json | jq '.healthScore.overall')

if [ $HEALTH -lt 70 ]; then
  echo "Health score $HEALTH is below threshold"
  echo "Applying automatic fixes..."
  npm run doctor --fix
  
  # Check improvement
  NEW_HEALTH=$(npm run doctor --json | jq '.healthScore.overall')
  echo "Health improved: $HEALTH → $NEW_HEALTH"
fi
```

---

## Summary: Key Principles for LLMs

### The Golden Rules

1. **Think in Pipelines, Not Steps**
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

### Quick Decision Tree

```
User request → Detect intent
↓
Map to pipeline (1-6)
↓
Is it safe to auto-execute?
├─ YES → Explain plan → Execute → Report
└─ NO → Ask confirmation → Execute → Report
```

### Example: Complete LLM Interaction

```
User: "I just cloned a Next.js project and want to set it up"

LLM Analysis:
- Intent: Setup existing project
- Framework: Next.js (detected from next.config.js)
- Action: Pipeline 2 (Health & Fix)

LLM Response:
"I'll set up your Next.js project with complete tooling:

1. Check current health
2. Install dependencies (npm ci)
3. Configure ESLint + Prettier
4. Enable TypeScript strict mode
5. Run initial build and tests

Starting now..."

[Executes:]
cd project
npm ci
npm run doctor --preset nextjs --fix
npm run build
npm test

[Reports:]
"✅ Setup complete!

Changes applied:
- Configured ESLint (next/core-web-vitals)
- Configured Prettier
- Enabled TypeScript strict mode
- Added 4 npm scripts

Health Score: 88/100 🟢

Your Next.js project is ready to develop:
- npm run dev (start dev server)
- npm run lint (check code)
- npm test (run tests)

Next: Run 'npm run dev' to start developing!"
```

### Cross-Reference: Project Rules

For additional guidance on platform-specific shell behavior, dependency management, and cross-stack development practices, see sections **9. Cross-Stack Development Practices** and **10. AI-Assisted Development Tooling** in `docs/PROJECTRULES-UPDATE-v3.0.md`.

---

**End of LLM Context Guide**

*This guide enables AI assistants to autonomously help developers with DevEnvTemplate by providing complete command context, decision-making frameworks, and automated workflows.*

