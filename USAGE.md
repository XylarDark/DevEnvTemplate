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

```bash
# Install in your project
npx devenv-init

# Check health
npm run doctor

# Fix issues
npm run doctor:fix

# Push and monitor
git push  # CI runs automatically
```

That's it! Your project is now monitored for quality issues.

---

## Common Scenarios

### "I want to start a new side project"

```bash
# 1. Create your project folder
mkdir my-saas-app && cd my-saas-app

# 2. Initialize your stack (e.g., Next.js)
npx create-next-app@latest . 

# 3. Add DevEnvTemplate
git clone https://github.com/yourusername/DevEnvTemplate .devenv
cd .devenv && npm install && npm run build
npm run agent:init

# 4. Push and go
git add . && git commit -m "Initial setup" && git push
```

**Result**: Testing, CI/CD, linting all configured in < 5 minutes.

---

### "I want to add DevEnvTemplate to an existing project"

```bash
# In your existing project
git clone https://github.com/yourusername/DevEnvTemplate .devenv
cd .devenv
npm install && npm run build
npm run agent:init  # Detects your existing stack

# Commit and push
git add . && git commit -m "Add DevEnvTemplate" && git push
```

**Result**: CI runs, detects your stack, shows quality gaps.

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
