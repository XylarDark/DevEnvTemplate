# Project Template

A technology-agnostic development environment with QA-first governance, scope-gated delivery, and continuous improvement processes.

## Quick Start

1. Copy this template to your new project root (recommended: `C:\dev\` on Windows)
2. Review and customize `.projectrules` for your technology stack
3. Set up CI/CD workflows (GitHub/GitLab/Azure DevOps)
4. Configure testing and linting for your stack
5. Enable governance checks in CI

## Governance Overview

This template includes comprehensive development governance:

- **QA-First Development**: Automated testing, linting, and CI/CD
- **Scope Gate Process**: Explicit approval for new features/settings/external services
- **Performance Budgets**: Track bundle sizes, build times, runtime metrics (optional)
- **Accessibility Awareness**: Keyboard navigation, screen reader support (if UI)
- **Security Baseline**: No credentials in repo, dependency updates, basic scanning
- **Cycle Closeout**: Post-development review for continuous improvement

## Key Files

- [`.projectrules`](.projectrules) - Central governance policies and rules
- [`docs/rules-changelog.md`](docs/rules-changelog.md) - Evolution history of governance rules
- [`CONTRIBUTING.md`](CONTRIBUTING.md) - Development workflow and standards
- [`scripts/check-governance`](scripts/check-governance) - Automated governance checks
- `.github/workflows/` - CI/CD pipelines with lint/test/governance stages

## Development Workflow

### Pre-Development (Plan Mode)
```text
Goal
- Task: [brief description]
- Why now: [business/UX/QA/perf/sec rationale]
- Scope: [paths/modules]

Constraints
- Follow `.projectrules` v[version]; minimal cost; report-only governance
- No secrets in repo; cross-OS scripts; pin tool versions

Scope Gate
- New feature/setting? [yes/no]
- External domains/assets? [yes/no → list]
- Perf/a11y/SEO/security impact? [none/low/medium/high]
- Feature toggle? [yes/no] Setting: [id] Default: [false]
- Rollback plan: [how to disable/revert]

[Additional sections for Discovery, Testing, etc.]
```

### Pull Request Process

1. Complete **Scope Gate** checklist in PR template
2. Ensure CI passes (lint, test, governance checks)
3. Add testing notes and screenshots (if UI)
4. Fill **Session Review** block after each development cycle

### Post-Cycle Review

After each Plan→Agent cycle, complete the Session Review checklist:

- [ ] Summarize changes: features added, tests written, CI/docs updated
- [ ] Log errors/workarounds: Platform/environment errors encountered
- [ ] Rules deltas: What to add/modify/remove in `.projectrules`
- [ ] Version bump: Increment version if policies/guardrails changed
- [ ] Changelog entry: Add dated entry to `docs/rules-changelog.md`
- [ ] PR template: Fill Session Review section

## CI/CD Status

| Stage | Status | Purpose |
|-------|--------|---------|
| Lint | ![Lint](https://img.shields.io/badge/lint-passing-brightgreen) | Code style and syntax |
| Test | ![Test](https://img.shields.io/badge/test-passing-brightgreen) | Unit and integration tests |
| Governance | ![Governance](https://img.shields.io/badge/governance-passing-brightgreen) | Rules compliance checks |
| Performance | ![Performance](https://img.shields.io/badge/performance-passing-brightgreen) | Budget tracking (optional) |

## Quality Gates

### Required (All Projects)
- ✅ Unit tests pass
- ✅ Linting passes
- ✅ Governance checks pass (report-only)
- ✅ Conventional commits
- ✅ PR template completed (Scope Gate + Session Review)

### Optional (Per Project)
- ⏳ Integration tests (recommended)
- ⏳ Performance budgets (if user-facing)
- ⏳ Accessibility testing (if UI)
- ⏳ Schema validation (if structured data)

## Rules Governance

The `.projectrules` file evolves with each development cycle:

- **Version Control**: Semantic versioning for policy changes
- **Change Documentation**: All modifications logged in changelog
- **Continuous Improvement**: Post-cycle reviews identify optimization opportunities
- **Technology Agnostic**: Rules adapt to your stack while maintaining core principles

See [Rules Changelog](docs/rules-changelog.md) for governance evolution history.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed development guidelines.

## License

See [LICENSE](LICENSE) for project licensing information.
