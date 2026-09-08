# Cursor rules

Every rule here is **glob-scoped**: it enters the context window only when the agent touches a
matching file. Nothing in this directory is always applied, and that is deliberate.

Always-loaded context belongs in one of two other places:

- **`AGENTS.md`** (repository root) — facts that are true on every turn. Cursor loads it
  automatically, as do Claude Code, Codex, and Gemini CLI, so one file serves every tool.
- **`.agents/skills/<name>/SKILL.md`** — procedural knowledge. A skill costs only its
  `description` until that description matches the task, then the agent reads the body.

## Why nothing here is always-applied

This directory used to ship 14 always-applied rules totalling roughly 1,200 lines. That is
12,000–15,000 tokens billed on every single turn, including turns that had nothing to do with the
content. Long-context evaluations consistently find that irrelevant always-loaded context _lowers_
accuracy, so the cost was not merely wasted — it was harmful.

That content now lives in `AGENTS.md` and `.agents/skills/`. If you are looking for a rule that
used to be here, see the mapping in `RETIRED_RULE_REPLACEMENTS` in
[`scripts/tools/cursor-rules-adapter.ts`](../../scripts/tools/cursor-rules-adapter.ts). The doctor
reports any that reappear, so re-adding one is a visible decision rather than a quiet regression.

## Apply modes

Cursor supports four modes. Only the third is used here.

| Mode                    | Frontmatter                                | Used here                        |
| ----------------------- | ------------------------------------------ | -------------------------------- |
| Always Apply            | `alwaysApply: true`                        | No — use `AGENTS.md`             |
| Apply Intelligently     | `alwaysApply: false` plus a `description`  | No — use a skill                 |
| Apply to Specific Files | `globs:` plus `alwaysApply: false`         | **Yes, all rules below**         |
| Manual                  | `alwaysApply: false`, narrow `description` | No — the user would @-mention it |

## The rules

| Rule                         | Applies to                                                                    |
| ---------------------------- | ----------------------------------------------------------------------------- |
| `10-typescript.mdc`          | `**/*.ts`, `**/*.tsx`                                                         |
| `11-javascript.mdc`          | `**/*.js`, `**/*.jsx`                                                         |
| `12-python.mdc`              | `**/*.py`                                                                     |
| `13-markdown.mdc`            | `**/*.md`                                                                     |
| `14-json-yaml.mdc`           | `**/*.json`, `**/*.yaml`, `**/*.yml`                                          |
| `15-shell-scripts.mdc`       | `**/*.sh`, `**/*.ps1`, `**/*.bat`                                             |
| `20-frontend-frameworks.mdc` | `**/components/**`, `**/pages/**`, `**/app/**`                                |
| `21-unreal-engine.mdc`       | `*.uproject`, `*.uplugin`, `*Build.cs`, `Source/**`                           |
| `22-unreal-editor-ui.mdc`    | the same Unreal paths; Editor UI must match Epic's pinned-version docs        |
| `23-unity-csharp.mdc`        | `*.cs`, `*.unity`, `*.asmdef`, `ProjectSettings/**`, `Packages/manifest.json` |

The leading numbers group related rules for humans. Cursor ignores them, and it ignores any
frontmatter key outside `description`, `globs`, and `alwaysApply` — including `name` and
`priority`, which earlier versions of these files set to conflicting values.

## File format

```yaml
---
description: What this rule covers, shown in the rule picker
globs: '**/*.ts'
alwaysApply: false
---
```

Write `globs`, plural. A singular `glob:` key is silently ignored, which produces a rule that
looks scoped but never loads.

Do not add a `.cursorrules` or `.projectrules` file alongside this directory. Those formats are
superseded, and having two sources of truth is how they drift.

## Copying into a host project

`integrateCursorRules` copies the rules whose globs match the host's detected stack — Unreal rules
when `unrealProjectDetected`, Unity rules when `unityProjectDetected`, and so on — along with
every skill in `.agents/skills/`. Existing host files are never overwritten.

Skills are copied **verbatim**, which is right — the practice in them is stack-agnostic — but it
means any sentence describing *this* repository arrives in the host as a false statement. Those
sections carry a **Localize on copy** callout naming what to replace, the integration step reports
which copied skills contain one, and `tests/unit/skill-portability.test.js` fails if a repo-local
command appears before the callout or anywhere in a `description`. This was not theoretical: a
consuming project's copies told agents to run a link checker, a linter and a test runner that
project does not have.

`AGENTS.md` is deliberately **not** copied. It states facts about one specific repository, so a
copied one would be wrong immediately. Hosts write their own; the doctor reports its absence.
