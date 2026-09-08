# DevEnvTemplate — agent notes

This is the **doctor** template for development environments: diagnose, prescribe, and keep repos healthy while coding with LLMs. It is optimized for indie developers and solo founders.

## Cursor setup (current)

- **Always-true facts** live here (`AGENTS.md`) and in a short always-on rule set under `.cursor/rules/`.
- **Do not** load `BOOTSTRAP.md` at session start. That file is a long optional reference for setup/migration, not the primary agent context.
- **Do not** use `.cursorrules` or `.projectrules` alongside `.cursor/rules/`.
- Keep always-on rules small. Stack rules use `globs` or intelligent apply (`description` + `alwaysApply: false`).
- Host projects must write their **own** `08-project-context.mdc` and root `AGENTS.md`. The copy in this repo is template-specific and is **not** copied into hosts.

## Stack

- TypeScript (strict, ES2020, CommonJS), Node.js 24+ (Active LTS)
- Node.js test runner (`npm test` builds then runs `tests/**/*.test.js`)
- Commands: `npm run doctor`, `npm run doctor:fix`, `npm run build`, `npm test`

## Apply to a host

Clone or copy this repo into the host as `.devenv/` only when the host wants the Node doctor. For game/engine repos, copy the **Cursor/docs layer** (rules, `AGENTS.md`, `docs/DOCS_LAYOUT.md`, `docs/KNOWN_ERRORS.md`, `docs/operational/automation-gaps.md`) instead of embedding the doctor.

Unity hosts: ensure `.cursor/rules/23-unity-csharp.mdc` is present; pin the editor version from `ProjectSettings/ProjectVersion.txt`. See `docs/templates/unity/README.md`.

Unreal hosts: `.cursor/rules/21-unreal-engine.mdc` and `22-unreal-editor-ui.mdc`; see `docs/templates/unreal/README.md`.
