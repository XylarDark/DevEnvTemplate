# DevEnvTemplate: Implementation Guide

**For power users who want to customize and extend DevEnvTemplate.**

If you're just getting started, see [USAGE.md](USAGE.md) instead.

---

## Advanced Features

### Performance Optimization

DevEnvTemplate includes several performance features for large codebases:

**Parallel Processing:**
```bash
npm run cleanup -- --parallel --apply
```
- 2-5x speedup on 100+ file projects
- Auto-detects optimal concurrency (CPU count)
- Safe: Same results as sequential execution

**Caching:**
```bash
npm run cleanup -- --cache --apply
```
- Caches parsed configurations (2-3x speedup)
- Content-based file caching with SHA-256
- 1-hour TTL for config cache
- Disable with `--no-cache` if needed

**Performance Tracking:**
```bash
npm run cleanup -- --performance --apply
```
- Detailed execution metrics
- Rule-by-rule timing
- Memory usage tracking
- Optimization recommendations

**Progress Reporting:**
```bash
npm run cleanup -- --progress --progress-verbosity detailed --apply
```
- Live progress bars
- ETA calculations
- Three verbosity levels: silent, simple, detailed
- JSON output with `--json-progress`

### Cleanup Engine

The cleanup engine removes template artifacts after setup:

**Dry Run (Default):**
```bash
npm run cleanup
```
Shows what would be changed without modifying files.

**Apply Changes:**
```bash
npm run cleanup -- --apply
```
Actually modifies files based on cleanup rules.

**Advanced Options:**
```bash
# Specific profile
npm run cleanup -- --profile minimal --apply

# Feature flags
npm run cleanup -- --feature auth,api --apply

# Only specific rules
npm run cleanup -- --only remove-examples --apply

# Exclude rules
npm run cleanup -- --exclude remove-docs --apply

# Keep specific files
npm run cleanup -- --keep README.md,LICENSE --apply
```

### Stack Detection & Gap Analysis

DevEnvTemplate can analyze existing projects:

**Detect Stack:**
```bash
node .github/tools/stack-detector.js > .devenv/stack-report.json
```

**Analyze Gaps:**
```bash
node .github/tools/gap-analyzer.js > .devenv/gaps-report.md
```

**Generate Plan:**
```bash
node .github/tools/plan-generator.js > plans/hardening-plan.md
```

These tools help you understand your project and get recommendations for improvements.

---

## Customization

### Adding Custom Cleanup Rules

Create `config/cleanup.config.yaml`:

```yaml
profiles:
  custom:
    rules:
      - id: remove-my-template-code
        type: file-glob-delete
        glob: "templates/**"
        reason: "Remove template files after setup"
      
      - id: clean-comments
        type: line-tag
        tag: "@template-only"
        reason: "Remove template-only comments"
```

Run with:
```bash
npm run cleanup -- --profile custom --apply
```

### Adding Custom Presets

Edit `scripts/agent/cli-simple.js` to add your own project type presets:

```javascript
const projectType = await this.prompt(
  '1️⃣  What are you building?',
  [
    'Side Project / SaaS (web app)',
    'API / Backend Service',
    'Full-Stack App (frontend + backend)',
    'Static Website / Landing Page',
    'Your Custom Type Here',  // Add your preset
    'Other'
  ],
  0
);
```

### Extending Stack Detection

Add detection logic in `.github/tools/stack-detector.js`:

```javascript
// Detect your framework
if (packageJson.dependencies['your-framework']) {
  technologies.push({
    name: 'YourFramework',
    version: packageJson.dependencies['your-framework'],
    confidence: 'high'
  });
}
```

---

## Architecture

### Project Structure

```
DevEnvTemplate/
├── scripts/
│   ├── agent/              # Interactive CLI for setup
│   │   ├── cli-simple.js   # 5-question setup (default)
│   │   └── cli.ts          # Advanced setup (power users)
│   ├── cleanup/            # Cleanup engine
│   │   ├── engine.ts       # Core cleanup logic
│   │   └── package-managers/ # Package manager handlers
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Shared utilities
├── .github/
│   ├── workflows/          # CI/CD workflows
│   └── tools/              # CI analysis tools
├── config/                 # Configuration files
├── docs/                   # Documentation
└── tests/                  # Test suite
```

### Key Technologies

- **TypeScript**: Core modules for type safety
- **Node.js**: Runtime and tooling
- **GitHub Actions**: CI/CD automation
- **YAML**: Configuration format

### Design Principles

1. **Simple by default**: Common use cases should be trivial
2. **Powerful when needed**: Advanced features available but hidden
3. **Fast feedback**: < 3 minutes for CI, < 5 minutes for setup
4. **Free-tier first**: Optimized for GitHub Actions free tier
5. **Solo-friendly**: No team complexity, no approval gates

---

## TypeScript Development

DevEnvTemplate is written in TypeScript for type safety.

**Build:**
```bash
npm run build         # One-time build
npm run build:watch   # Watch mode for development
```

**Type Check:**
```bash
npm run prebuild      # Type check without building
```

**Project Structure:**
- Source: `scripts/**/*.ts`
- Compiled: `dist/**/*.js` + `.d.ts` declarations
- Config: `tsconfig.json`, `tsconfig.base.json`

---

## Testing

**Run All Tests:**
```bash
npm test
```

**Run Specific Tests:**
```bash
npm run test:unit         # Unit tests only
npm run test:integration  # Integration tests only
npm run test:fast         # Quick unit tests
npm run test:slow         # Slower integration tests
```

**Watch Mode:**
```bash
npm run test:watch
```

**Test Structure:**
- Unit tests: `tests/unit/**/*.test.js`
- Integration tests: `tests/integration/**/*.test.js`
- Fixtures: `tests/fixtures/` (test projects)

---

## Performance Benchmarking

Compare different optimization strategies:

```bash
# Run all benchmarks
npm run benchmark

# Compare parallel vs sequential
npm run benchmark:parallel

# Compare cache on vs off
npm run benchmark:cache

# CI mode (with comparison)
npm run benchmark:ci
```

Benchmarks measure:
- Execution time (mean, median, stdDev)
- Memory usage
- Cache efficiency
- Regression detection

---

## Contributing

DevEnvTemplate is open source! Contributions welcome.

**Quick Start:**
1. Fork the repo
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit: `git commit -m "feat: add my feature"`
6. Push and create a PR

**Commit Convention:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `refactor:` Code refactoring
- `perf:` Performance improvement
- `test:` Test changes
- `chore:` Maintenance

See [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md) for more details.

---

## Troubleshooting

### Build Errors

**"Cannot find module":**
```bash
npm run build  # Ensure TypeScript is compiled
```

**Type errors:**
```bash
npm run prebuild  # Check types without building
```

### Test Failures

**Timeout errors:**
- Tests have 5s timeout (unit), 60s (integration)
- If tests consistently timeout, they need optimization

**File permission errors (Windows):**
- Use `os.tmpdir()` for temp files
- Avoid `mock-fs` (Windows incompatible)

### CI Issues

**Free tier exceeded:**
- Check GitHub Actions usage in Settings
- Optimize workflows (caching, concurrency)
- Remove unnecessary jobs

**Workflow not running:**
- Check `.github/workflows/*.yml` files
- Ensure triggers match your branch names
- Look for `.disabled` extension

---

## Advanced Workflows

### Multi-Stack Projects

If you have multiple stacks (e.g., React frontend + Python backend):

1. Run `npm run agent:init` for each stack
2. Merge the generated `project.manifest.json` files
3. Run cleanup with combined feature flags

### Custom CI Workflows

Copy and modify `.github/workflows/indie-ci.yml`:

```yaml
# Add custom jobs
my-custom-check:
  name: My Custom Check
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - run: npm run my-custom-script
```

### Integration with Cursor

DevEnvTemplate was designed for Cursor AI:

1. CI generates artifacts (stack report, gaps report)
2. Use these as context in Cursor Plan Mode
3. Let AI implement recommendations

See `docs/guides/cursor-plan-integration.md` for details.

---

## FAQ

**Q: Can I use this with Python/Go/Java?**  
A: Yes! DevEnvTemplate supports multiple languages. The TypeScript tooling is just for DevEnvTemplate itself.

**Q: Do I need to keep DevEnvTemplate in my repo?**  
A: No. After initial setup, you can remove the DevEnvTemplate folder if you want.

**Q: Can I customize the CI workflows?**  
A: Yes! Copy the `.example` workflows and modify them.

**Q: How do I update DevEnvTemplate?**  
A: Pull the latest version and re-run setup. Your customizations in `project.manifest.json` will be preserved.

**Q: Does this work with monorepos?**  
A: Basic support. Best for single-project repos currently.

---

## Resources

- **[USAGE.md](USAGE.md)** - Simple guide for beginners
- **[README.md](README.md)** - Project overview
- **[docs/market-positioning.md](docs/market-positioning.md)** - Target audience and use cases
- **[.projectrules](.projectrules)** - Development best practices
- **[docs/rules-changelog.md](docs/rules-changelog.md)** - Governance evolution

---

**Need help?** Open an issue on GitHub or check the docs.
