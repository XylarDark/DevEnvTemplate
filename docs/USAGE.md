# DevEnvTemplate Usage Guide

**For Indie Developers & Solo Founders**

Quick reference for the doctor workflow and common tasks.

## Doctor Mode (Primary Workflow)

### Check Your Project Health

```bash
npm run doctor
```

This runs a comprehensive health check:
- **Diagnoses** your stack (technologies, frameworks, tooling)
- **Identifies** gaps (missing tests, CI, security issues)
- **Calculates** health score (0-100) across 5 categories
- **Suggests** quick wins (< 10 min fixes)

**Example Output:**
```
🏥 DevEnvTemplate Health Check

🧠 Stack profile: node

🟢 Project Health: 75/100

📊 Health Breakdown:
   Security:      🟢 ██████████ 85/100
   Code Quality:  🟡 ███████░░░ 70/100
   Testing:       🔴 ████░░░░░░ 40/100

🔴 Critical Issues (2):
   - No testing framework detected
   - Missing .env.example

💡 Quick Wins (3):
   1. Add .env.example → 2 min
   2. Enable TypeScript strict → 1 min
   3. Add ESLint config → 5 min
```

Once `.devenv/stack-report.json` exists, the doctor prints the detected profile(s) up front. All subsequent recommendations switch to stack-specific quick wins:

| Stack profile | Default quick wins |
|---------------|--------------------|
| `node` | Vitest + ESLint flat config + Playwright + Dependabot/lockfile checks |
| `python` | Pytest + Ruff + Black + Mypy + pip/poetry lockfile hygiene + pre-commit hooks + experiment/run tracking |
| `node + python` | Separate sections for each profile (doctor prints both) |

**Python Project Example:**

For a Python project like `lunar_mining_sim`, the doctor detects:
- Package structure (`pyproject.toml` or `setup.py`)
- Testing framework (pytest, unittest)
- Linting tools (ruff, black, flake8)
- Type checking (mypy)
- Virtual environment setup
- Import patterns (checks for sys.path hacks)

Quick wins for Python projects:
- Add `pytest` configuration
- Set up `ruff` for linting
- Configure `black` for formatting
- Add type hints gradually
- Remove `sys.path` hacks (use `pip install -e .`)

For simulation/ML-style Python repos the doctor now:
- Accepts existing `env-example*` templates but nudges you to rename them to `.env.example`
- Prefers `pre-commit` hooks over Husky
- Recommends experiment budgets plus run-tracking observability instead of bundle-size budgets

### Tooling architecture (why Node? why TypeScript?)

All shared tooling inside `.devenv/`—stack detection, gap analysis, plan generation, cleanup—runs on **Node.js** and is authored in **TypeScript**. That single runtime keeps the embedded experience predictable on macOS, Linux, and Windows (`cd .devenv && npm install && npm run doctor`). Projects are still free to keep helper scripts in their native stacks (e.g., a Python repo can ship a `scripts/check_env.py`), but if a helper becomes broadly useful we port it into the TypeScript core so every template user benefits. See [`docs/TOOLING-ARCHITECTURE.md`](TOOLING-ARCHITECTURE.md) for the contributor guidelines.

### Fast vs. full doctor runs

`npm run doctor --fast` (or `--mode fast`) now uses a shallow scan that skips documentation, accessibility, Docker, and git-hook checks. It trims a typical run down to ~200 ms (see [`docs/PERF-BASELINE.md`](PERF-BASELINE.md)) by aggressively ignoring cache directories and reusing parsed configs. Use it during tight feedback loops, then switch back to the default/full run (`npm run doctor` or `npm run doctor --full`) before releasing or merging to `main` so nothing slips through.

### Diagnostics & debug logging

Use `npm run doctor -- --debug` to turn on verbose logging (it sets `LOG_LEVEL=DEBUG` for the underlying tools). The flag is handy when stack detection or gap analysis behaves unexpectedly, but it writes additional lines to stdout, so avoid combining it with `--json`. You can also enable diagnostics on individual tools:

```bash
node .github/tools/stack-detector.js --debug --json
node .github/tools/gap-analyzer.js --debug
```

### Secrets handling checklist

The doctor clears the "Secrets Handling Not Detected" gap when it sees four signals:

1. **Env template** – `.env.example`, `.env.sample`, or `env-example.txt` committed with placeholder values.
2. **Git ignore** – `.env` (and friends) listed inside `.gitignore`.
3. **Env loader** – `python-dotenv`, `pydantic-settings`, `dotenv`, `env-cmd`, etc. configured by the runtime.
4. **Dependency audit** – a CI step that runs `pip-audit`/`bandit` for Python or `npm audit`/`pnpm audit`/`yarn audit` for Node.

When all four are present, the new stack detector metadata flips `quality.security` to ✅ and the gap analyzer stays quiet. The [Python simulator fixture](../tests/fixtures/python-sim-project/) shows a compliant setup: `.env.example`, `.env` inside `.gitignore`, `python-dotenv` in `pyproject.toml`, and a CI workflow that runs `pip-audit` + `bandit`. For Node stacks, add the `dotenv` package (or equivalent) and schedule `npm audit --production` (or `pnpm audit`, `yarn audit`) in `.github/workflows/ci.yml`.

> Tip: projects such as `lunar_mining_sim` keep a tiny helper (`scripts/check_env.py`) that asserts required variables before long-running jobs. You can adopt the same pattern or use `pre-commit` hooks to guard against missing templates.

### Environment Variable Validation

DevEnvTemplate provides utilities for validating environment variables and encryption keys:

```typescript
import { requireEnvVar, requireEncryptionKey } from './scripts/utils/env-validator';

// Check for required environment variable
const apiKey = requireEnvVar('API_KEY', {
  hint: 'Set API_KEY in your .env file'
});

// Validate encryption key format
const encryptionKey = requireEncryptionKey('ENCRYPTION_KEY', 32);
```

For more information, see [Best Practices Guide](BEST-PRACTICES.md#environment-variable-management).

### Generating Encryption Keys

Use the built-in key generation tool to create properly formatted encryption keys:

```bash
# Generate a 32-byte key (default)
node dist/scripts/tools/generate-key.js

# Generate a 64-byte key
node dist/scripts/tools/generate-key.js --length 64

# Generate in hex format
node dist/scripts/tools/generate-key.js --format hex

# Quiet output (just the key)
node dist/scripts/tools/generate-key.js --quiet
```

For more information, see [Best Practices Guide](BEST-PRACTICES.md#encryption-key-generation).

### Auto-Fix Issues

```bash
npm run doctor:fix
```

Automatically fixes simple issues:
- Creates `.env.example`
- Adds `.env` to `.gitignore`
- Enables TypeScript strict mode

### Get JSON Output

```bash
npm run doctor -- --json > health-report.json
```

Useful for CI integration or programmatic access.

---

## Quick Start

### First Time Setup

See [`docs/SETUP-GUIDE.md`](SETUP-GUIDE.md) for the full walkthrough (cloning `.devenv/`, building it, running `agent:init`, and the first doctor pass). Once setup is complete, use this Usage guide for the day-to-day commands (`doctor`, `doctor:fix`, `cleanup`, etc.).

---

## Common Scenarios

### "I want to start a new side project"

Use the ["New Project" flow in the Setup Guide](SETUP-GUIDE.md#quick-reference) to scaffold your framework, drop in `.devenv/`, and run the first `npm run doctor`. After that initial bootstrap, come back here for routine doctor/cleanup commands.

---

### "I want to add DevEnvTemplate to an existing project"

Follow the ["Existing Project" flow in the Setup Guide](SETUP-GUIDE.md#quick-reference) to clone `.devenv/`, build it once, and run the first doctor. The rest of this Usage guide assumes setup is complete and focuses on health checks, fixes, and automation.

### Cross-Platform Commands

**Windows PowerShell**: Use `;` instead of `&&` for command chaining, or use separate commands:

```powershell
# PowerShell - Use semicolon
Set-Location .devenv; npm run doctor

# Or separate commands
Set-Location .devenv
npm run doctor
```

**Bash/Linux/macOS**: Use `&&` for command chaining:

```bash
# Bash - Use && for chaining
cd .devenv && npm run doctor
```

> 💡 **Windows PowerShell**: replace chained commands (`&&`) with two lines:
> `Set-Location .\your-project\.devenv` then `npm run doctor`.

### Running DevEnvTemplate from `.devenv/` (Embedded Usage)

Once `.devenv/` exists, you can run the doctor directly from that folder and it will analyze the parent project automatically. See [Embedded Usage Guide](EMBEDDED-USAGE.md) for complete details.

```powershell
# Windows PowerShell
Set-Location C:\dev\your-project\.devenv
npm run doctor              # auto-detects parent project

# Explicit override (any shell)
npm run doctor -- --project-root ..
```

```bash
# macOS / Linux
cd ~/dev/your-project/.devenv
npm run doctor                    # auto-detects parent project

# Or point anywhere:
DEVENV_PROJECT_ROOT=../ ..
npm run doctor -- --project-root ../other-project
```

The `--project-root` flag (or `DEVENV_PROJECT_ROOT` environment variable) is handy when:
- `.devenv/` lives in a nested tools directory
- You keep multiple DevEnvTemplate clones for different repos
- You need to target a temporary scratch directory

---

### "I want to see what's wrong with my project"

After pushing, check your quality report:

**Stack Report**: `.devenv/stack-report.json`  
Shows detected technologies and configurations.

**Gap Analysis**: `.devenv/gaps-report.md`  
Lists what's missing (tests, security, docs, etc.) with recommendations.

**Example gaps:**
- ❌ No test framework detected
- ❌ Missing TypeScript configuration  
- ❌ No CI/CD pipeline
- ❌ Dependencies not scanned for vulnerabilities

---

### "I want to run tests locally"

```bash
cd .devenv
npm test            # Run all tests
npm run test:unit   # Unit tests only
npm run test:fast   # Quick test run
```

**Pro tip**: Tests run automatically on every push via GitHub Actions.

---

### "I want to deploy my app"

DevEnvTemplate includes deployment guides for free tiers:

**Vercel** (recommended for Next.js, React):
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Railway** (recommended for Node.js APIs):
```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
railway up
```

**Fly.io** (recommended for full-stack apps):
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Launch
fly launch
```

All deployments work with DevEnvTemplate's CI/CD out of the box.

---

### "I want to fix code quality issues"

Run the cleanup engine to remove common issues:

```bash
cd .devenv

# See what would be fixed (dry run)
npm run cleanup

# Apply fixes
npm run cleanup -- --apply
```

**What it fixes:**
- Removes unused files
- Cleans up template code
- Fixes linting issues
- Updates dependencies

---

### "I want faster builds"

Enable parallel processing and caching:

```bash
npm run cleanup -- --parallel --cache --apply
```

**Performance gains:**
- 2-3x faster on large codebases
- Caches configuration parsing
- Parallel file processing

---

## Use Case Examples

### Side Project / SaaS

**Scenario**: Building a SaaS product nights/weekends  
**Time budget**: 10-15 hours/week  
**Goal**: Launch MVP in 3 months

**DevEnvTemplate setup:**
```bash
npm run agent:init
# Select: "Full-stack web app"
# Stack: Next.js
# Features: Auth, API, Database
```

**Result**: Testing, CI, deployment ready in 5 minutes.

---

### Client Work / Freelance

**Scenario**: Building website for client  
**Budget**: 40 hours total  
**Goal**: Professional quality, fast delivery

**DevEnvTemplate setup:**
```bash
npm run agent:init
# Select: "Static website" or "Web application"  
# Stack: React / Vue / vanilla JS
# Features: Minimal (keep it simple)
```

**Result**: Client sees professional setup (tests, CI, docs).

---

### Technical Founder / Startup

**Scenario**: Pre-seed startup building MVP  
**Goal**: Prove product-market fit, raise funding  
**Concern**: VCs will review code quality

**DevEnvTemplate setup:**
```bash
npm run agent:init
# Select: "Full-stack web app"
# Stack: Your choice
# Features: All recommended (tests, CI, security, docs)
```

**Result**: Investor-grade codebase from day one.

---

## CLI Reference

### Project Setup

```bash
npm run agent:init       # Generate project manifest (interactive)
```

**Questions asked:**
1. What type of project? (Web app, API, library, etc.)
2. What's your primary language? (JavaScript, TypeScript, Python, etc.)
3. What framework? (React, Express, Next.js, etc.)
4. What features? (Auth, API, Database, etc.)
5. What's your package manager? (npm, pnpm, yarn)

---

### Cleanup Commands

```bash
npm run cleanup          # Preview changes (dry run)
npm run cleanup:apply    # Apply changes
npm run cleanup:check    # Alias for dry run
```

**Common flags:**
```bash
--apply              # Apply changes (default: dry run)
--profile <name>     # Use specific profile (minimal, standard, strict)
--feature <list>     # Enable features (auth,api,db)
--parallel           # Faster processing on large projects
--performance        # Show detailed metrics
```

---

### Testing

```bash
npm test             # Run all tests
npm run test:unit    # Unit tests only
npm run test:fast    # Quick unit tests
npm run test:slow    # Integration tests
npm run test:watch   # Watch mode
```

> All test commands run `npm run build` first, which triggers `tsc --noEmit` followed by the emit step. This keeps `dist/` in sync so doctor runs the same code you just edited.

---

### CI Tools (Advanced)

```bash
# Stack detection
node .github/tools/stack-detector.js

# Gap analysis
node .github/tools/gap-analyzer.js

# Plan generation
node .github/tools/plan-generator.js
```

**Note**: These run automatically in CI. You usually don't need to run them locally.

For a quick sanity check you can append `--mode fast` to the stack detector or gap analyzer commands above; omit it (or pass `--mode full`) for the complete scan.

### Running GitHub Actions Manually

The default `CI` workflow is now manual-only. Trigger it when you need a full validation run:

1. Open **GitHub → Actions → CI**  
2. Click **Run workflow**, pick the branch, and confirm

Or via GitHub CLI:

```bash
gh workflow run CI --ref main
```

You will only receive email notifications for the runs you start manually.

---

## Configuration

### Project Manifest

Located at `project.manifest.json` (auto-generated by `npm run agent:init`)

**Example:**
```json
{
  "name": "my-saas-app",
  "productType": "web-application",
  "technologies": ["react", "node", "typescript"],
  "features": ["auth", "api", "database"],
  "packageManager": "npm"
}
```

Edit this file to adjust detected stack or features.

---

### Cleanup Profiles

Three built-in profiles:

**Minimal** - Fast, conservative cleanup  
**Standard** - Balanced (recommended)  
**Strict** - Aggressive cleanup

```bash
npm run cleanup -- --profile strict --apply
```

---

## Troubleshooting

### "Tests are failing"

```bash
# Run tests locally to debug
cd .devenv
npm test

# Check test logs
# Fix issues, commit, push
```

### "CI is taking too long"

Check GitHub Actions usage:
- Free tier: 2000 minutes/month
- Enable caching: Speeds up installs
- Use `--parallel` for large projects

### "Gap analyzer shows too many issues"

Start with high-priority gaps first:
1. Critical security issues
2. Missing tests
3. Missing CI/CD
4. Documentation

Low-priority gaps can wait.

### Language-aware recommendations

DevEnvTemplate now records a `languageProfile` in `.devenv/stack-report.json` (for example `node`, `python`, or `python+node`). The doctor and gap analyzer read this profile before emitting tooling recommendations, so Python-only stacks no longer see TypeScript or ESLint gaps, while Node stacks still do. Mixed projects produce separate sections for each profile.

### "Deployment failed"

Check deployment platform docs:
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Railway**: [docs.railway.app](https://docs.railway.app)
- **Fly.io**: [fly.io/docs](https://fly.io/docs)

Most issues: Missing environment variables.

---

## Best Practices

### For Solo Developers

✅ **Do:**
- Push often (CI runs automatically)
- Fix broken tests immediately
- Keep dependencies updated
- Document user-facing changes

❌ **Don't:**
- Skip tests (they're fast)
- Commit secrets (use `.env`)
- Ignore security warnings
- Over-engineer (keep it simple)

### For Side Projects

✅ **Do:**
- Use free tiers (GitHub Actions, Vercel, etc.)
- Focus on shipping features
- Let CI handle quality checks
- Deploy early, deploy often

❌ **Don't:**
- Spend hours on tooling setup (DevEnvTemplate handles it)
- Skip CI (it's free and automatic)
- Deploy without tests
- Forget to git push

### For Client Work

✅ **Do:**
- Show clients the quality setup (builds trust)
- Use consistent setup across projects
- Document everything clearly
- Keep projects professional

❌ **Don't:**
- Skip documentation
- Cut corners on testing
- Ignore security scans
- Deliver without CI

---

## Next Steps

**Just Starting?**
- Run `npm run agent:init`
- Push to GitHub
- Check `.devenv/gaps-report.md`
- Fix high-priority gaps

**Ready to Deploy?**
- Tests passing? ✅
- No secrets committed? ✅
- Docs updated? ✅
- Deploy! 🚀

**Need Help?**
- See [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) for advanced features
- Check [docs/](docs/) for detailed guides
- Open an issue on GitHub

---

## Advanced Features

For power users, DevEnvTemplate includes:

- **Parallel Processing**: 2-5x speedup on large codebases
- **Performance Tracking**: Detailed metrics and recommendations
- **Custom Rules**: Define your own cleanup rules
- **Cursor Integration**: AI-guided development workflow

See [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) for details.

---

**That's it!** You're ready to ship quality code faster.

Questions? Open an issue on GitHub.
