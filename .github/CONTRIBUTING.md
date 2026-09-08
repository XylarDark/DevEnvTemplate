# Contributing

This repository is a template that gets vendored into other projects, so the editing workflow
is deliberately predictable: everything substantive lives in TypeScript, and the tests run
against the compiled output that users actually receive.

## Orientation

| Read                                                              | For                                    |
| ----------------------------------------------------------------- | -------------------------------------- |
| [AGENTS.md](../AGENTS.md)                                         | Always-true project facts. Start here. |
| [docs/architecture/overview.md](../docs/architecture/overview.md) | Module layout and the doctor pipeline. |
| [docs/SETUP-GUIDE.md](../docs/SETUP-GUIDE.md)                     | First-time setup.                      |
| [.cursor/rules/](../.cursor/rules/README.md)                      | Coding standards, scoped by file type. |

## Build and test loop

```bash
npm install
npm run verify   # typecheck, lint, test, build - in that order
```

`npm run verify` is what CI gates on. To work through the steps individually:

```bash
npm run prebuild   # tsc --noEmit
npm run lint       # eslint .
npm run format     # prettier --write .
npm test           # builds first, then runs tests against dist/
```

Requires Node 24 or newer (`.nvmrc` pins it; `volta` and `nvm` both read it).

### Why tests run against `dist/`

The `.devenv/` folder vendored into other repositories contains only the compiled output.
Testing the compiled files is what guarantees we never depend on a TypeScript-only construct
at runtime, and every test command rebuilds first so `dist/` cannot drift from the sources.

Run `npm run clean` if you suspect stale build output. `tsc --build --clean` only removes
what the current config emits, so it leaves behind artifacts from earlier directory layouts —
and tests have previously passed against those orphans while failing on a clean checkout.

### Smoke-testing the tools directly

```bash
node dist/scripts/tools/stack-detector.js --json
node dist/scripts/tools/gap-analyzer.js
npm run doctor
npm run doctor -- --fix --dry-run
```

Note the `--`: `npm run doctor --fix` passes the flag to npm rather than to the script.

## Editing rules

- Put substantive logic in TypeScript under `scripts/**/*.ts`. The `.js` files in this repo are
  thin wrappers that require from `dist/`, or bootstrap scripts that must run before a build.
- Never edit anything in `dist/`. It is generated.
- New fixtures and sample projects go under `tests/fixtures/`, which is excluded from
  formatting because those files are authored inputs — some are intentionally malformed to
  exercise error paths.
- Documentation placement is governed by [docs/DOCS_LAYOUT.md](../docs/DOCS_LAYOUT.md).

## Commits and branches

Branches: `feat/`, `fix/`, `refactor/`, `perf/`, `docs/`, `test/`, `chore/`, `ci/`.

Commits follow [Conventional Commits](https://www.conventionalcommits.org/) and are checked by
commitlint on `commit-msg`. Two constraints catch people out:

- The subject must be lower-case, so write `add agents.md support`, not `Add AGENTS.md support`.
- Body lines wrap at 100 characters.

## Quality gates

CI runs on every push and pull request and blocks on formatting, lint, type checking, tests,
`npm audit --audit-level=high`, registry signature verification, and secret scanning. The
doctor's health score is reported as a pull request comment and does not block.

Before opening a pull request:

- [ ] `npm run verify` passes
- [ ] New behavior has a test
- [ ] No secrets in the diff
- [ ] Docs updated if behavior changed

## Recording failures

When you hit an error worth remembering, append it to
[docs/KNOWN_ERRORS.md](../docs/KNOWN_ERRORS.md) with the symptom, cause, and fix. If the cause
is a tool that cannot be scripted, record it in
[docs/operational/automation-gaps.md](../docs/operational/automation-gaps.md) instead.
