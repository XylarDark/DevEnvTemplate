# DevEnvTemplate — agent instructions

DevEnvTemplate is the **doctor** for development environments: it diagnoses repository health,
prescribes fixes, and keeps codebases sound while you code with LLMs. It targets indie developers
and solo founders, so it optimizes for the GitHub Actions free tier and has no team approval gates.

What it ships is a **menu**, not a monolith: an agent-context layer, two operational logs, a
verification pattern, and the doctor itself, each adoptable alone. Consumers routinely take the
first two and none of the toolchain, so nothing here may assume it was adopted wholesale. See
[Adopt it in layers](README.md#adopt-it-in-layers).

This file is the canonical, always-loaded context. Everything else loads on demand:

- **`.cursor/rules/*.mdc`** — glob-scoped only. They load when you touch a matching file
  (TypeScript, Python, shell, Unreal, Unity, and so on).
- **`.agents/skills/<name>/SKILL.md`** — procedural knowledge. Each skill stays dormant until its
  `description` matches your task. Read one when its trigger applies.
- **`docs/`** — reference material for humans and agents. Start at `docs/README.md`.

Do not add always-applied rules. Context that loads on every turn measurably degrades accuracy,
so the budget for this file is roughly 200 lines and the always-apply rule count is zero.

**A skill's `description` is always-loaded too.** Only the body is deferred; every description is
read each turn to decide relevance. Thirteen skills currently cost about 900 tokens per turn on
top of this file's ~2,400, so the always-on budget is roughly 3,500 tokens in total. Adding a
skill is a permanent charge against it. Before adding one, prefer extending an existing skill,
and keep the `description` to a single sentence naming the trigger.

## Stack

- TypeScript, strict mode, ES2022 target, CommonJS modules.
- Node.js 24+ (Active LTS). The floor is pinned in `package.json` `engines`, `volta`, and `.nvmrc`.
- Node's built-in test runner (`node --test`). No Jest, no Vitest.
- ESLint flat config in `eslint.config.js`. The `.eslintrc.*` format is dead; ESLint 10 ignores it.
- Prettier, single quotes, configured in `.prettierrc`.

## Commands

Run these from the repository root.

| Command                   | Purpose                                                 |
| ------------------------- | ------------------------------------------------------- |
| `npm run doctor`          | Health check: stack detection, gap analysis, scoring    |
| `npm run doctor:fix`      | Health check, then apply automatic fixes                |
| `npm run build`           | Type-check, then compile to `dist/`                     |
| `npm run build:clean`     | Purge `dist/` first, then build                         |
| `npm test`                | Build, then run `tests/**/*.test.js`                    |
| `npm run lint`            | ESLint over the repo                                    |
| `npm run format`          | Prettier write; `format:check` verifies without writing |
| `npm run clean`           | Remove `dist/` and `tsconfig.tsbuildinfo`               |
| `npm run check:doc-links` | Verify every relative markdown link resolves            |
| `npm run check:encoding`  | Detect double-encoded UTF-8 (mojibake)                  |

**Pass script flags after `--`.** `npm run doctor -- --fix` forwards the flag to the doctor;
`npm run doctor --fix` gives it to npm instead, which silently ignores it. This has been a
recurring source of no-op commands in this repo's own docs and CI.

**In PowerShell, quote the separator:** `npm run doctor '--' --fast`. PowerShell strips a bare
`--` before npm sees it, so the unquoted form silently runs without the flag. Check npm's echoed
command line: it must end in the flag you passed. The quoted form is also correct in bash.

Useful doctor flags: `--fix`, `--no-install`, `--preset <framework>`, `--dry-run`, `--json`,
`--strict` (fail on warnings), `--fast` (skip docs, performance, accessibility, Docker,
environment, git hooks, frameworks, Python tooling), `--project-root <path>`.

## Layout

- `scripts/doctor/` — the doctor CLI, checks, and the quick-wins registry.
- `scripts/tools/` — stack detector, gap analyzer, plan generator, and repo utilities.
- `scripts/cleanup/` — the cleanup engine and its CLI.
- `scripts/utils/` — shared helpers (logging, caching, paths, JSONC parsing).
- `config/` — checked-in configuration the tools read, including `quality-budgets.json`.
- `tests/unit/`, `tests/integration/`, `tests/fixtures/` — tests and fixture projects.
- `docs/` — documentation, organized per `docs/DOCS_LAYOUT.md`.
- `.devenv/` — generated reports. Gitignored; never commit anything from here.

The tools exchange structured data: the stack detector writes `.devenv/stack-report.json`, the
gap analyzer writes both `.devenv/gaps-report.json` (consumed by the doctor and plan generator)
and `.devenv/gaps-report.md` (for humans). Read the JSON; never parse the markdown back.

## Working agreements

**Verify, don't assume.** Read a file before editing it. Run the build, tests, and linter before
claiming work is done. When you assert something about the repo, base it on file contents. A green
check is not evidence unless you know what it measured — `npm run verify` reports what each stage
proved, and the `verification-evidence` skill covers the ways a check passes while measuring
nothing.

**Assume you are not alone.** Another agent may be working in this tree. Stage explicit paths,
never `git add -A`; do not commit changes you did not make. See `multi-agent-collaboration`.

**Finish what you start.** No `TODO` without an issue reference, no placeholder implementations,
no committing a known-broken state. If you must defer, say so explicitly and explain why.

**Be idempotent.** Any script that creates a file or resource must check first, reuse or skip if
it already exists, and log which it did. Re-running must not duplicate or destroy.

**Clean up.** Delete one-off diagnostic scripts, result dumps, and scratch files before you
report a task complete. Keep only reusable, referenced tooling.

**Record failures.** When a build, test, or lint step fails, note the cause and the fix in
`docs/KNOWN_ERRORS.md`. Check it before making similar changes. If the cause is a tool that
cannot be scripted, record it in `docs/operational/automation-gaps.md` instead.

**Plan multi-file work.** For changes spanning several modules, or that touch architecture or
public APIs, propose a short plan before editing. See the `plan-first` skill.

## Development phase

Every area is **shaping** or **settled**. Shaping means the design is still being decided and the
developer's judgment is the success criterion. Settled means the shape is agreed and the job is to
keep it that way.

- `scripts/doctor/**`, `scripts/tools/**`, `scripts/utils/**` — settled
- `.agents/**`, `docs/**`, and everything else — shaping

**In a shaping area**, spend the budget on something the developer can react to. Skip tests,
guard-test proofs, the pre-work baseline, and doc updates; say in one line what you did not verify.
Use `npm run doctor '--' --fast` and leave the full run for promotion. The security baseline below
is the only floor: no committed secrets, no destructive operation without an explicit flag.

**In a settled area**, every obligation in the skills applies as written.

**Promotion is a deliberate step.** When an area moves to settled, that same change adds tests for
the behavior that survived, a guard test per bug fixed while shaping, updated docs, deleted scratch
files, and `docs/KNOWN_ERRORS.md` entries for the failures that cost real time. Shaping defers
these obligations; it does not abolish them.

## Conventions

- **Commits:** Conventional Commits (`feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `chore`,
  `style`, `ci`). Imperative mood, first line under 72 characters, no emoji. Body lines wrap at
  100 characters. Commitlint enforces this in a hook.
- **Branches:** `feat/`, `fix/`, `refactor/`, `perf/`, `docs/`, `test/`, `chore/`.
- **Files:** kebab-case (`user-service.ts`). Name the file after its primary export.
- **Naming:** functions are verbs, types are nouns, booleans read as questions, constants are
  `UPPER_SNAKE_CASE`.
- **Docs:** place new documents per `docs/DOCS_LAYOUT.md`. The docs root is a closed set of entry
  points; topic documents belong in a subdirectory. Run `npm run check:doc-links` after moving
  or renaming anything.

## Testing

These apply to settled areas. While shaping, see **Development phase** above.

- Unit tests finish in under 5 seconds total; integration tests in under 60.
- Every test needs a timeout, must run independently, and must clean up in `afterEach`.
- Use real temporary directories (`fs.mkdtemp`), not `mock-fs` — this repo runs on Windows too.
- Test behavior, not implementation. Cover the error and edge cases, not just the happy path.
- Prefer a failing test as the definition of done. If you skip tests, say why.

## Security baseline

- Never commit secrets. `.env` and `.env.*` are gitignored; `.env.example` templates are tracked
  and carry placeholder values only.
- Validate and sanitize anything crossing a trust boundary. Use parameterized queries.
- Never log credentials, tokens, or personal data.
- Treat changes to MCP configuration as production changes: review the server command and args,
  not just the server name. Reference credentials as `${env:NAME}`; never inline them. Start from
  `.cursor/mcp.json.example` and read `docs/guides/mcp-hygiene.md`.
- Dependency updates arrive weekly via Dependabot. CI gates on `npm audit --audit-level=high`
  and `npm audit signatures`.

## Windows and PowerShell

This repo is developed on Windows and must work on macOS and Linux.

- Chain commands with `;`, never `&&`.
- Build paths with `path.join`; never hardcode separators.
- Check a path exists before navigating to it.
- Keep commit messages ASCII. Non-ASCII text elsewhere must be valid UTF-8: this repo has twice
  had emoji double-encoded into mojibake, once breaking the linter and once garbling every
  generated plan. `npm run check:encoding` detects it and `fix-mojibake.js --write` repairs it.

## Applying this template to another project

Copy this repo into the host as `.devenv/` only when the host wants the Node doctor. For game and
engine repositories, copy just the agent and docs layer: `AGENTS.md`, `.agents/skills/`, the
glob-scoped `.cursor/rules/`, `docs/DOCS_LAYOUT.md`, `docs/KNOWN_ERRORS.md`, and
`docs/operational/automation-gaps.md`.

Host projects write their **own** `AGENTS.md`. The copy in this repo describes this repo.

Skills travel verbatim, so any section of a skill that describes _this_ repository is marked with
a **Localize on copy** callout and must be rewritten by the host. `tests/unit/skill-portability.test.js`
fails if a skill names a repo-local script before that callout, and the integration step reports
which copied skills carry one. Do not add a repo-local command to a skill's `description`: it is
read without opening the file, so it cannot carry a warning.

- **Unity:** keep `.cursor/rules/23-unity-csharp.mdc` and pin the editor version from
  `ProjectSettings/ProjectVersion.txt`. See `docs/templates/unity/README.md`.
- **Unreal:** keep `.cursor/rules/21-unreal-engine.mdc` and `22-unreal-editor-ui.mdc`. See
  `docs/templates/unreal/README.md`.
