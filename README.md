# DevEnvTemplate

[![CI](https://github.com/XylarDark/DevEnvTemplate/actions/workflows/indie-ci.yml/badge.svg)](https://github.com/XylarDark/DevEnvTemplate/actions/workflows/indie-ci.yml)
[![Version](https://img.shields.io/github/package-json/v/XylarDark/DevEnvTemplate)](https://github.com/XylarDark/DevEnvTemplate)
[![License](https://img.shields.io/github/license/XylarDark/DevEnvTemplate)](LICENSE)

**Your AI coding companion's health checker.** DevEnvTemplate acts as a doctor for your development environment - diagnosing issues, prescribing solutions, and keeping your codebase healthy while you code with LLMs.

## For Indie Developers & Solo Founders

Building with AI assistants like Cursor, GitHub Copilot, or ChatGPT? Your dev environment needs to be **rock solid** so the AI can focus on features, not fighting broken tooling.

**DevEnvTemplate is your dev environment doctor:**

- **Diagnose** → Scans your project stack and quality setup
- **Prescribe** → Identifies gaps (missing tests, CI, security)
- **Cure** → Auto-fixes common issues in seconds
- **Monitor** → Continuous health checks on every push

**From diagnosis to deployment in < 10 minutes.** Quality by default, not by overtime.

## Quick Start (2 Minutes)

### Install & Diagnose

```bash
# Install
npm init -y  # if needed
npx devenv-init

# Run health check
npm run doctor
```

**Output:**
```
🏥 DevEnvTemplate Health Check

🟢 Project Health: 75/100

📊 Health Breakdown:
   Security:      🟢 ██████████ 85/100
   Code Quality:  🟡 ███████░░░ 70/100
   Testing:       🔴 ████░░░░░░ 40/100
   CI/CD:         🟢 ████████░░ 80/100
   Documentation: 🟡 ███████░░░ 70/100

🔴 Critical Issues (2):
   - No testing framework detected
   - Missing .env.example (secrets at risk)

💡 Quick Wins (can fix in < 10 min):
   1. Add .env.example → 2 min
   2. Enable TypeScript strict → 1 min
   3. Add ESLint config → 5 min

📋 Full Report: .devenv/health-report.json
```

### Auto-Fix Issues

```bash
# Apply automatic fixes
npm run doctor:fix
```

Auto-fixes:
- ✅ Creates `.env.example`
- ✅ Adds `.env` to `.gitignore`
- ✅ Enables TypeScript strict mode
- ✅ And more...

## What You Get

### Instant Quality Stack
- **Testing**: Node.js test runner (no heavy frameworks)
- **CI/CD**: GitHub Actions (optimized for 2000 free min/month)
- **Type Safety**: TypeScript support with smart defaults
- **Linting**: ESLint configured for modern JavaScript/TypeScript
- **Security**: Automated dependency scanning

### Works With Your Stack
- **Node.js**: Express, Fastify, NestJS
- **Frontend**: React, Vue, Svelte, vanilla JS
- **Full-Stack**: Next.js, Remix, Astro
- **Python**: Flask, Django, FastAPI (coming soon)

### Free-Tier Friendly
All recommendations use free tiers:
- GitHub Actions (2000 min/month)
- Vercel / Railway / Fly.io deployments
- GitHub security scanning
- No paid services required

## How It Works: The Doctor Workflow

DevEnvTemplate follows a medical diagnostic approach:

### 1. Diagnose (Stack Detection)
Scans your project to understand your tech stack:
```bash
node .github/tools/stack-detector.js
```
- Detects frameworks (React, Next.js, Express, etc.)
- Identifies tooling (TypeScript, ESLint, testing frameworks)
- Finds configurations and quality setup

### 2. Prescribe (Gap Analysis)
Identifies what's missing or misconfigured:
```bash
node .github/tools/gap-analyzer.js
```
- Security gaps (exposed secrets, vulnerable dependencies)
- Quality gaps (missing tests, no linting, weak TypeScript)
- CI/CD gaps (no pipeline, missing quality gates)
- Documentation gaps (incomplete README, no contribution guide)

### 3. Cure (Auto-Fix + Cleanup)
Applies fixes automatically:
```bash
npm run doctor:fix      # Auto-fix simple issues
npm run cleanup:apply   # Remove template boilerplate
```
- Creates missing config files
- Enables strict mode
- Removes template-only code
- Sets up CI/CD

### 4. Monitor (Continuous Health)
On every push, CI runs health checks:
- ✅ Tests run automatically
- ✅ Code is linted for consistency
- ✅ Security scan checks dependencies
- ✅ Health score tracked over time

**See [USAGE.md](USAGE.md) for detailed commands and workflows.**

## Common Tasks

### Check Project Health
```bash
npm run doctor           # Full health check
npm run doctor:fix       # Apply auto-fixes
npm run doctor -- --json # JSON output
```

### Run Tests Locally
```bash
npm test              # Run all tests
npm run test:fast     # Run unit tests only (< 5sec)
npm run test:slow     # Run integration tests
```

### Check Code Quality
```bash
npm run cleanup       # See what would be cleaned (dry run)
npm run cleanup:apply # Apply cleanup rules
```

### View Reports
After running doctor or pushing to GitHub:
- `.devenv/health-report.json` - Overall health scores
- `.devenv/stack-report.json` - Detected technologies  
- `.devenv/gaps-report.md` - Detailed gap analysis
- `plans/hardening-plan.md` - Generated action plan

## Why Indie Devs Love It

**Fast Setup** → 5 minutes vs 4 hours of configuration  
**Quality by Default** → Testing, CI, security included  
**Free Tier** → Everything runs on GitHub's free 2000 min/month  
**No Lock-In** → Standard tools (Jest, GitHub Actions, ESLint)  
**Solo-Friendly** → No team jargon, no complex workflows

## Use Cases

**Building a SaaS?**  
→ Get testing + CI + deployment in one command

**Side Project?**  
→ Ship with confidence, no technical debt

**Client Work?**  
→ Professional setup without the setup time

**Learning?**  
→ See how pros structure projects

## Advanced Features

For power users, DevEnvTemplate includes:
- **Parallel file processing** (2-5x speedup on large codebases)
- **Performance tracking** (identify slow build steps)
- **Cursor Plan Mode integration** (AI-guided development workflow)

See [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) for advanced usage.

## Benefits

- **⚡ Fast**: Setup in minutes, not hours
- **🆓 Free**: Optimized for GitHub free tier
- **🎯 Focused**: Solo dev-friendly, no enterprise bloat
- **🔒 Secure**: Automated security scanning
- **📈 Quality**: Testing and linting by default
- **🚀 Deploy**: CI/CD ready for Vercel, Railway, Fly.io

## Documentation

- **[USAGE.md](USAGE.md)** - Common commands and workflows
- **[IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)** - Advanced features and customization
- **[Engineering Handbook](docs/engineering-handbook.md)** - Architecture and patterns

## Contributing

Found a bug? Have a feature idea? PRs welcome!

See [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

**Built for indie developers who want to ship quality code without the setup tax.**

Star ⭐ this repo if DevEnvTemplate saves you time!
