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
| `python` | Pytest + Ruff + Black + Mypy + pip/poetry lockfile hygiene |
| `node + python` | Separate sections for each profile (doctor prints both) |

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

> 💡 **Windows PowerShell**: replace chained commands (`&&`) with two lines:
> `Set-Location .\your-project\.devenv` then `npm run doctor`.

### Running DevEnvTemplate from `.devenv/`

Once `.devenv/` exists, you can run the doctor directly from that folder and it will analyze the parent project automatically:

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
