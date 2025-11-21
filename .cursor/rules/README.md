# Cursor Rules Directory

This directory contains comprehensive, technology-agnostic Cursor rules for the DevEnvTemplate project. These rules guide AI assistants to behave like a senior engineer who has been on the project for 2 years.

## Structure

Rules are organized by priority and scope:

### Always-Applied Rules (Core)

These rules apply to all code regardless of file type:

- **00-core-principles.mdc** - Reasoning transparency, professional communication, pre-flight checklist
- **01-code-quality.mdc** - Code organization, design principles, performance awareness
- **02-security.mdc** - OWASP Top 10, secrets management, security checklist
- **03-testing.mdc** - Testing philosophy, test pyramid, test structure
- **04-git-workflow.mdc** - Commit messages, branch naming, git best practices
- **05-error-handling.mdc** - Defensive programming, error patterns, edge cases
- **06-documentation.mdc** - Code comments, API docs, documentation standards
- **07-ai-agent-behavior.mdc** - Meta-rules for AI agent tool usage and communication
- **08-project-context.mdc** - DevEnvTemplate-specific context and conventions

### Stack-Specific Rules (Conditional)

These rules apply only to specific file types via glob patterns:

- **10-typescript.mdc** - TypeScript-specific rules (`**/*.ts`, `**/*.tsx`)
- **11-javascript.mdc** - JavaScript-specific rules (`**/*.js`, `**/*.jsx`)
- **12-python.mdc** - Python-specific rules (`**/*.py`)
- **13-markdown.mdc** - Markdown documentation standards (`**/*.md`)
- **14-json-yaml.mdc** - JSON/YAML config standards (`**/*.json`, `**/*.yaml`, `**/*.yml`)
- **15-shell-scripts.mdc** - Shell script standards (`**/*.sh`, `**/*.ps1`, `**/*.bat`)
- **20-frontend-frameworks.mdc** - Frontend best practices (`**/components/**`, `**/pages/**`, `**/app/**`)

## File Format

Each rule file uses the `.mdc` (Markdown Cursor) format with YAML frontmatter:

```yaml
---
name: "Rule Name"
description: "Brief description"
alwaysApply: true  # or false for conditional rules
glob: ["**/*.ts"]  # optional, for conditional rules
priority: 1        # lower numbers = higher priority
---
```

## How Rules Are Applied

1. **Always-Applied Rules**: Loaded for every Cursor session (~2000 tokens)
2. **Conditional Rules**: Loaded only when editing matching files (~500-1000 tokens each)
3. **Total Token Usage**: ~3000-4000 tokens per session (vs 8000+ for monolithic)

## Rule Priorities

Rules are numbered to indicate priority:
- `00-09`: Core always-applied rules
- `10-19`: Stack-specific conditional rules
- `20+`: Specialized conditional rules

## Composability

Rules can reference each other:
- Use `@rule` references: "Follow error handling patterns from `05-error-handling.mdc`"
- Use `@file` references: "See `scripts/utils/logger.ts` for logging patterns"
- Cross-reference related rules: "See security rules in `02-security.mdc`"

## Maintenance

- Keep each file < 450 lines (split if larger)
- Update rules based on real usage
- Document rule changes in commit messages
- Test rules with actual code changes

## Migration from .projectrules

This rules system replaces the legacy `.projectrules` file. The new system provides:
- Better token efficiency (conditional loading)
- Improved maintainability (separated concerns)
- Modern Cursor standard (`.cursor/rules/*.mdc`)
- Better composability (glob patterns, references)

## Verification

To verify rules are loading correctly:
1. Ask Cursor: "What are the core principles for error handling?"
2. Make a code change and verify AI follows rules
3. Check that stack-specific rules trigger for matching files

## Contributing

When adding new rules:
1. Determine if it should be always-applied or conditional
2. Choose appropriate priority number
3. Add glob patterns if conditional
4. Keep file size < 450 lines
5. Reference related rules to avoid duplication
6. Test with actual code changes

