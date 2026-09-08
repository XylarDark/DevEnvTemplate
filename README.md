# DevEnvTemplate

[![CI](https://github.com/XylarDark/DevEnvTemplate/actions/workflows/indie-ci.yml/badge.svg)](https://github.com/XylarDark/DevEnvTemplate/actions/workflows/indie-ci.yml)
[![Version](https://img.shields.io/github/package-json/v/XylarDark/DevEnvTemplate)](https://github.com/XylarDark/DevEnvTemplate)
[![License](https://img.shields.io/github/license/XylarDark/DevEnvTemplate)](LICENSE)

**A menu of development-environment layers, plus a doctor that tells you which ones you are missing.** DevEnvTemplate diagnoses repository health and ships the agent context, operational-memory and tooling layers that fix what it finds — so an AI assistant working in your repo spends its turns on your features instead of on broken tooling and stale instructions.

## What this is for

Three problems, in the order they usually bite:

1. **Agents work from bad context.** They read instructions that are too long to help, or that describe a repository other than yours. The agent layer here is a shape for fixing that: a short always-loaded file, skills that stay dormant until they are relevant, and rules scoped to the files they apply to.
2. **Nobody knows what a repository is missing.** The doctor scans the stack, names the gaps, and scores them, so "we should probably add tests" becomes a specific list.
3. **The same expensive failure gets rediscovered.** Two append-only logs — [known errors](docs/KNOWN_ERRORS.md) and [automation gaps](docs/operational/automation-gaps.md) — give a failure and a dead end somewhere to live.

## What this is not

- **Not a project scaffold.** It does not generate an application. Point it at a repository you already have.
- **Not a mandate to adopt its toolchain.** This repository uses ESLint, Prettier, Husky, commitlint and `node --test`. Those are one working answer, not a requirement. A consuming project can have none of them and still take everything valuable here.
- **Not a CI system, a monorepo tool, or a governance framework.** It reports; it does not gate. Approval workflows and multi-team coordination were deliberately removed in 2.0.
- **Not your `AGENTS.md`.** That file states facts about one specific repository, so a copied one is wrong on arrival. The template deliberately does not copy it; write your own and the doctor will stop asking.

## Adopt it in layers

The layers are independent, and they are listed in the order most consumers actually want them. Take one and skip the rest if that is what fits.

| Layer                          | What it is                                                                                                   | Depends on                                                    |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| **Agent context**              | `AGENTS.md` as a shape, `.agents/skills/`, glob-scoped `.cursor/rules/`                                      | Nothing. Any language, any stack.                             |
| **Operational memory**         | `docs/KNOWN_ERRORS.md`, `docs/operational/automation-gaps.md`, `docs/DOCS_LAYOUT.md`                       | Nothing. These are entry shapes, not content.                 |
| **Verification with evidence** | The `verify` pipeline pattern: each stage names what passing it proves and extracts a number from its output | A test runner of some kind. Not this one.                     |
| **The doctor**                 | `npm run doctor`, gap analysis, quick-win auto-fixes, the CI workflow                                        | Node.js in the host, or the host vendors it under `.devenv/`. |

The evidence for splitting it this way comes from a real consumer: a browser game that took the agent and operational layers, vendored the doctor under `.devenv/`, and adopted **none** of the lint or format toolchain. Its own always-applied rule count is zero and it has no lint script at all — and its doctor report lists that absence as an **accepted state, not a task**. A template that assumes it was adopted wholesale would have been wrong about that project in a dozen places, and was: see [the entry on copied skills naming commands that only exist here](docs/KNOWN_ERRORS.md).

**A gap you declined is not a bug.** The doctor's job is to make an absence visible once, not to nag. When you decide against something it reports — no linter, no container, no coverage tool — record that decision where agents will read it, in your own `AGENTS.md`. Otherwise every fresh session re-litigates it, which costs more than the gap did.

## Get started

Pick the path that matches what you want. You do not need Node.js unless you are embedding the doctor.

### Files-only: agent and docs layers (default for non-Node hosts)

For Unity, Unreal, or any repository where you want better agent context but **not** the Node doctor, copy the Cursor/docs layer into your project. No install, no `.devenv/` clone, no Node version requirement on the host.

Copy these from this repository (write your own root `AGENTS.md`; do not copy ours):

- `.agents/skills/` and the stack rules you need from `.cursor/rules/` (for example `23-unity-csharp.mdc`, or Unreal `21`/`22`)
- `docs/DOCS_LAYOUT.md`, `docs/KNOWN_ERRORS.md`, `docs/operational/automation-gaps.md`
- `.cursorignore` and workspace `.vscode/settings.json` if useful

Full checklist and engine notes: **[docs/SETUP-GUIDE.md — Files-only adoption](docs/SETUP-GUIDE.md#files-only-adoption-agent-and-docs-layers)**. Optional stubs: [Unity](docs/templates/unity/README.md), [Unreal](docs/templates/unreal/README.md).

Node.js 24+ (or Volta) is the **doctor runtime**, not an adoption tax. You only need it when you vendor the doctor under `.devenv/`.

### Embed the doctor (Node / TypeScript / Python hosts)

When you want gap analysis and auto-fixes, clone this repo into your project as `.devenv/`, build once, and run the doctor from the project root:

```bash
# From your project root
git clone https://github.com/XylarDark/DevEnvTemplate .devenv
cd .devenv && npm install && npm run build
cd ..
npm run doctor
```

That is the canonical day-zero path. Step-by-step setup, stack-specific notes, and commit guidance: **[docs/SETUP-GUIDE.md](docs/SETUP-GUIDE.md)**. After embedding, day-to-day use: **[docs/guides/embedded-usage.md](docs/guides/embedded-usage.md)**.

**Advanced / alternative:** Optional `project.manifest.json` when stack detection is ambiguous — run `npm run agent:init` from `.devenv/` after the build (see SETUP-GUIDE step 3). Do not use `npx devenv-init` as a substitute for cloning `.devenv/`; it only writes a manifest and does not embed the doctor.

### Example doctor output

```
🏥 DevEnvTemplate Health Check

🟢 Project Health: 75/100

📊 Health Breakdown:
   Security:      🟢 ██████████ 85/100
   Code Quality:  🟡 ███████░░░ 70/100
   Testing:       🔴 ████░░░░░░ 40/100

🔴 Critical Issues (2):
   - No testing framework detected
   - Missing .env.example (secrets at risk)

💡 Quick Wins (can fix in < 10 min):
   1. Add .env.example → 2 min
   2. Enable TypeScript strict → 1 min

📋 Full Report: .devenv/health-report.json
```

Apply automatic fixes: `npm run doctor:fix` (from project root, with `.devenv/` embedded).

## How the doctor works

1. **Detect** — Scans the stack (frameworks, configs, quality setup). `npm run doctor` runs detection as its first stage.
2. **Analyze** — Names gaps (security, tests, CI, docs). `npm run doctor -- --json` for machine-readable output.
3. **Fix** — `npm run doctor:fix` applies quick wins; `npm run cleanup:apply` removes template-only boilerplate when relevant.
4. **Track** — CI can run the same checks on push; reports land under `.devenv/`.

See [docs/guides/usage.md](docs/guides/usage.md) for commands and workflows.

## Common tasks

```bash
npm run doctor           # Full health check (requires embedded .devenv/)
npm run doctor:fix       # Apply auto-fixes
npm run doctor -- --json # JSON output
npm test                 # Build and run tests (this repository)
npm run cleanup          # Dry-run cleanup preview
npm run cleanup:apply    # Apply cleanup rules
```

Reports: `.devenv/health-report.json`, `.devenv/stack-report.json`, `.devenv/gaps-report.md`, and generated plans under `plans/`.

## What this repository itself uses

DevEnvTemplate's **own** tree is one opinionated Node/TypeScript setup. Consuming projects are not required to match it.

| Area        | This repo                                                                 |
| ----------- | ------------------------------------------------------------------------- |
| Runtime     | Node.js 24+ (pinned in `package.json` / Volta / `.nvmrc`)                 |
| Tests       | Node built-in test runner (`node --test`)                                 |
| Lint/format | ESLint flat config, Prettier, Husky, commitlint                             |
| CI          | GitHub Actions ([`indie-ci.yml`](.github/workflows/indie-ci.yml)), sized for the free tier |
| Docs layout | [docs/DOCS_LAYOUT.md](docs/DOCS_LAYOUT.md); organizer rules in `config/docs-organization.yaml` |
| Cursor rules | [.cursor/rules/README.md](.cursor/rules/README.md) — glob-scoped; always-applied count is intentionally low |

Stack profiles (Unreal `.uproject`, Unity `ProjectSettings/`, Python `pyproject.toml`, etc.) add **conditional** rules and doctor hints; they do not change the files-only default for game/engine repos.

## Documentation

- **[AGENTS.md](AGENTS.md)** — Always-true project facts for agents working in **this** repository.
- **[docs/README.md](docs/README.md)** — Documentation index
- **[docs/SETUP-GUIDE.md](docs/SETUP-GUIDE.md)** — First-time adoption (files-only or doctor embed)
- **[docs/guides/usage.md](docs/guides/usage.md)** — Common commands and workflows
- **[docs/architecture/overview.md](docs/architecture/overview.md)** — Project structure and design principles
- **[docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** — Troubleshooting guide
- **[docs/BEST-PRACTICES.md](docs/BEST-PRACTICES.md)** — Technology-agnostic best practices
- **[docs/DOCS_LAYOUT.md](docs/DOCS_LAYOUT.md)** — Where new documentation belongs

## Contributing

Found a bug? Have a feature idea? PRs welcome!

See [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md) for the build/test loop and standards.

## License

MIT License - see [LICENSE](LICENSE) for details.
