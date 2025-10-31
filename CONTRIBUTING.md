# Contributing to This Project

Thank you for your interest in contributing! This document outlines the process and standards for contributing to this project.

## Code of Conduct

This project follows a professional and inclusive code of conduct. Be respectful, collaborative, and focused on quality.

## Getting Started

1. **Read the Documentation**: Start with [`README.md`](README.md) and [`.projectrules`](.projectrules)
2. **Understand Governance**: Review the [rules changelog](docs/rules-changelog.md) for evolution history
3. **Set Up Development Environment**: Follow setup instructions in README.md

## Development Workflow

### Pre-Development (Plan Mode)

Before writing code, create a plan following this template:

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

### Branch Naming

Use descriptive branch names with prefixes:

- `feat/feature-name` - New features
- `fix/issue-description` - Bug fixes
- `refactor/component-name` - Code refactoring
- `perf/optimization-name` - Performance improvements
- `docs/document-name` - Documentation updates
- `test/test-description` - Test additions/updates
- `chore/maintenance-task` - Maintenance tasks

### Commit Messages

Follow conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types**: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `chore`

**Examples**:
- `feat(auth): add user login validation`
- `fix(ui): resolve button focus trap`
- `docs(readme): update installation instructions`

**Breaking Changes**: Add `BREAKING CHANGE:` footer with migration notes.

### Pull Requests

1. **Complete Scope Gate** checklist in PR template
2. **Fill Session Review** block after development cycle
3. **Ensure CI passes** (lint, test, governance checks)
4. **Add testing notes** and screenshots (if UI)
5. **Conventional commits** in PR branch

### Testing Standards

- **Unit tests required** for new code
- **Integration tests** optional per project needs
- **Fast local test loop** - tests run quickly during development
- **Schema validation** for structured data (if applicable)
- **Accessibility testing** for UI components (if applicable)

### Code Style

- Follow language-specific conventions
- Use consistent formatting (see `.editorconfig`)
- Write self-documenting code with clear variable names
- Add comments for complex logic

### Documentation

- Keep `README.md` current with setup and usage instructions
- Update documentation for new features/settings
- Document breaking changes with migration guides

## Quality Gates

### Required Checks
- ✅ **Unit tests pass**
- ✅ **Linting passes**
- ✅ **Governance checks pass** (report-only)
- ✅ **Conventional commits**
- ✅ **PR template completed** (Scope Gate + Session Review)

### Optional Checks (Per Project)
- ⏳ **Integration tests** (recommended)
- ⏳ **Performance budgets** (if user-facing)
- ⏳ **Accessibility audits** (if UI)
- ⏳ **Schema validation** (if structured data)

## Review Process

### Automated Checks
- CI runs lint, test, and governance validation
- Governance checks provide actionable feedback (non-blocking)

### Manual Review
- Code review focuses on architecture, testing, and adherence to `.projectrules`
- Reviewers check for proper error handling and edge cases
- Documentation updates verified

### Approval Requirements
- All automated checks pass
- At least one approving review
- Scope Gate checklist completed
- Session Review filled (for multi-commit PRs)

## Rules Governance

The `.projectrules` file evolves with development cycles:

- **Version Control**: Semantic versioning for policy changes
- **Change Documentation**: All modifications logged in changelog
- **Continuous Improvement**: Post-cycle reviews identify optimizations
- **Technology Agnostic**: Rules adapt while maintaining core principles

See [Rules Changelog](docs/rules-changelog.md) for evolution history.

## Getting Help

- **Issues**: Use issue templates for bugs and feature requests
- **Discussions**: Use discussions for questions and ideas
- **Documentation**: Check README.md and `.projectrules` first

## Recognition

Contributors are recognized in project documentation and release notes. Thank you for helping make this project better!
