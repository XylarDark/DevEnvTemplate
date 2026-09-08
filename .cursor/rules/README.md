# Cursor Rules Directory

Project rules for Cursor. Cursor also loads root (and nested) `AGENTS.md` for always-true project facts — keep those files short.

Official frontmatter fields are `description`, `globs`, and `alwaysApply`. Do not use a sibling `.cursorrules` file.

## Four apply modes

| Mode | Frontmatter | When to use |
|------|-------------|-------------|
| **Always Apply** | `alwaysApply: true` | Tiny set of universal standards |
| **Apply Intelligently** | `alwaysApply: false` plus a clear `description` (no `globs`) | Agent decides from the task |
| **Apply to Specific Files** | `globs:` plus `alwaysApply: false` | Language or path-specific |
| **Manual** | `alwaysApply: false`, no globs, narrow description | User @-mentions the rule |

Keep always-on rules small. Prefer globs or intelligent apply over dumping a huge bootstrap file into every chat.

## Always-applied (keep this list short)

- **00-core-principles.mdc** — Reasoning transparency, professional communication
- **01-code-quality.mdc** — Organization, design, performance awareness
- **02-security.mdc** — Secrets, OWASP baseline
- **03-testing.mdc** — Test philosophy and structure
- **04-git-workflow.mdc** — Commits, branches
- **05-error-handling.mdc** — Defensive programming
- **07-ai-agent-behavior.mdc** — Tool use, context, communication
- **17-plan-first.mdc** — Plan before complex/multi-file work
- **automation-standards.mdc** — API → script → UI last resort; gaps in `docs/operational/automation-gaps.md`

**Template-only (not copied into hosts):**

- **08-project-context.mdc** — DevEnvTemplate-specific context. Hosts write their own `08` and `AGENTS.md`.

## Intelligent or glob-scoped (copied to hosts, not always-on)

- **06-documentation.mdc** — Comments and docs standards (intelligent)
- **16-feature-debug-instrumentation.mdc** — Log-driven validation on new features (intelligent)
- **18-content-and-data-pipelines.mdc** — Non-destructive authored-state pipelines (intelligent)
- **19-docs-directory-structure.mdc** — Place docs per `docs/DOCS_LAYOUT.md` (`docs/**/*.md`)

## Stack-specific (conditional)

- **10-typescript.mdc** — `**/*.ts`, `**/*.tsx`
- **11-javascript.mdc** — `**/*.js`, `**/*.jsx`
- **12-python.mdc** — `**/*.py`
- **13-markdown.mdc** — `**/*.md`
- **14-json-yaml.mdc** — `**/*.json`, `**/*.yaml`, `**/*.yml`
- **15-shell-scripts.mdc** — `**/*.sh`, `**/*.ps1`, `**/*.bat`
- **20-frontend-frameworks.mdc** — `**/components/**`, `**/pages/**`, `**/app/**`
- **21-unreal-engine.mdc** — `.uproject`, `*Build.cs`, `Source/**`
- **22-unreal-editor-ui.mdc** — Editor UI must match Epic docs for the pinned version
- **23-unity-csharp.mdc** — `.cs`, `.unity`, `ProjectSettings/`, `Packages/manifest.json`

## File format

```yaml
---
description: What this rule does (shown in the rule picker)
globs: "**/*.ts"
alwaysApply: false
---
```

`globs` is the official field (not `glob`). Extra keys such as `name` or `priority` are ignored by Cursor; numbering in filenames is for humans.

## Host integration

`integrateCursorRules` copies the always-on core (except template-only `08`), plus matching stack rules. Unreal rules copy when `unrealProjectDetected`; Unity rules copy when `unityProjectDetected`.
