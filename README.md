# DevEnvTemplate

[![CI](https://github.com/XylarDark/DevEnvTemplate/actions/workflows/indie-ci.yml/badge.svg)](https://github.com/XylarDark/DevEnvTemplate/actions/workflows/indie-ci.yml)
[![Version](https://img.shields.io/github/package-json/v/XylarDark/DevEnvTemplate)](https://github.com/XylarDark/DevEnvTemplate)
[![License](https://img.shields.io/github/license/XylarDark/DevEnvTemplate)](LICENSE)

**Ship quality code faster.** DevEnvTemplate sets up testing, CI/CD, and best practices in minutes so you can focus on building your product.

## For Indie Developers & Solo Founders

You have a great idea. You want to build it **fast** and build it **right**. But setting up testing, CI/CD, linting, TypeScript, deployment... that's hours of yak-shaving before you write your first feature.

**DevEnvTemplate fixes this.**

Drop it into your project and get:
- ✅ **Testing setup** (unit + integration, ready to run)
- ✅ **CI/CD pipeline** (GitHub Actions, optimized for free tier)
- ✅ **Quality checks** (linting, type checking, security scanning)
- ✅ **Documentation templates** (README, contributing guide)
- ✅ **Best practices baked in** (no decisions, just build)

**From idea to deployed in < 10 minutes.** Quality by default, not by overtime.

## Quick Start (5 Minutes)

### 1. Add to Your Project

```bash
# Clone into your project
cd your-project
git clone https://github.com/yourusername/DevEnvTemplate .devenv

# Install and build
cd .devenv
npm install && npm run build
```

### 2. Generate Your Setup

Answer 5 simple questions about your project:

```bash
npm run agent:init
```

This creates your configuration and sets up everything automatically.

### 3. Push and Go

```bash
git add .
git commit -m "Add DevEnvTemplate"
git push
```

**That's it.** DevEnvTemplate automatically:
- ✅ Detects your tech stack (Node.js, React, TypeScript, etc.)
- ✅ Sets up testing and CI/CD
- ✅ Runs quality checks on every commit
- ✅ Gives you a quality audit report

### 4. Build Your Product

Focus on your features. DevEnvTemplate handles:
- Running tests on every push
- Type checking and linting
- Security scans
- Deployment pipelines (when you're ready)

**See [USAGE.md](USAGE.md) for common commands and workflows.**

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

## How It Works

DevEnvTemplate analyzes your project and sets up quality tooling automatically:

1. **Stack Detection**: Scans your project to understand what you're building
2. **Gap Analysis**: Identifies missing best practices (tests, CI, security, docs)
3. **Auto-Setup**: Configures testing, linting, and CI/CD based on your stack
4. **Quality Reports**: Shows you what's working and what needs attention

### On Every Push
- ✅ **Tests run** automatically
- ✅ **Code is linted** for consistency
- ✅ **Security scan** checks dependencies
- ✅ **Quality report** comments on your PR

You get instant feedback without manual setup.

## Common Tasks

### Run Tests Locally
```bash
cd .devenv
npm test           # Run all tests
npm run test:unit  # Run unit tests only
```

### Check Code Quality
```bash
npm run cleanup:check  # See what would be cleaned up (dry run)
npm run cleanup:apply  # Apply cleanup rules
```

### View Your Stack Report
After pushing, check `.devenv/stack-report.json` to see what DevEnvTemplate detected about your project.

### View Quality Gaps
Check `.devenv/gaps-report.md` for a detailed analysis of what could be improved (tests, security, docs, etc.).

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
