# Project Architecture

DevEnvTemplate is the doctor for development environments: it diagnoses repository
health, prescribes fixes, and keeps codebases sound while you code with LLMs. It is a
**menu**, not a monolith — agent context, operational logs, a verification pattern,
and the doctor are each adoptable alone. See [Adopt it in layers](../../README.md#adopt-it-in-layers).

Humans keep this document true (taste). Who owns the next step — steer, taste, or
test — and when the agent must stop: [human-use/OWNERSHIP.md](../human-use/OWNERSHIP.md)
([CYCLE.md](../human-use/CYCLE.md)).

## Directory structure

### Root

```
DevEnvTemplate/
├── .agents/            # Core skills and extras
├── .cursor/            # Glob-scoped rules, example MCP, worktree setup
├── .github/            # CI workflow, PR templates, Dependabot
├── config/             # Checked-in tool config
├── docs/               # Documentation (see DOCS_LAYOUT.md)
├── scripts/            # TypeScript source
├── tests/              # Unit, integration, fixtures
├── AGENTS.md           # Always-loaded agent context for this repo
├── CHANGELOG.md
├── LICENSE
├── package.json
├── README.md
└── tsconfig*.json
```

### Source (`scripts/`)

```
scripts/
├── agent/              # Host adoption: AGENTS.md stub, layer copy, init
│   ├── agents-stub.ts
│   ├── layers.ts
│   ├── init.ts
│   ├── cli.ts
│   ├── cli.js          # Compatibility wrapper
│   ├── cli-simple.js   # Standalone init helper
│   ├── questionnaire.js
│   └── stubs/          # KNOWN_ERRORS, DOCS_LAYOUT, automation-gaps
├── cleanup/            # Template cleanup engine and CLI
│   ├── cli.ts
│   ├── engine.ts
│   └── package-managers/
├── doctor/             # Health check, scoring, --fix registry
│   ├── cli.ts
│   ├── quick-wins.ts
│   └── templates/
├── sync/               # Pull template updates into a host (`npm run sync`)
│   └── cli.ts
├── tools/              # Stack detect, gaps, plans, verify, preflight, docs
│   ├── stack-detector.ts
│   ├── gap-analyzer.ts
│   ├── plan-generator.ts
│   ├── cursor-rules-integration.ts
│   ├── cursor-rules-adapter.ts
│   ├── verify.js
│   ├── preflight.js
│   ├── check-doc-links.js
│   ├── fix-mojibake.js
│   └── ...
├── types/              # Shared types (gaps, manifest, plan, cleanup, performance)
├── utils/              # Logging, cache, paths, JSONC, verification helpers
├── init.js
└── init-cleanup.js
```

Settled areas (full skill obligations): `scripts/doctor/**`, `scripts/tools/**`,
`scripts/utils/**`. Everything else, including `docs/` and `.agents/`, is shaping.

### Documentation (`docs/`)

Canonical map: [DOCS_LAYOUT.md](../DOCS_LAYOUT.md). Topic docs live in
subdirectories; the root is a closed set of entry points.

```
docs/
├── architecture/       # This file, tooling notes
├── adr/
├── best-practices/
├── guides/
├── human-use/          # Steer / taste / test; cursor-cannot/ for PDF gaps
├── operational/
├── templates/          # Unity / Unreal stubs
├── archive/
├── README.md
├── DOCS_LAYOUT.md
├── KNOWN_ERRORS.md
├── BEST-PRACTICES.md
├── SETUP-GUIDE.md
└── TROUBLESHOOTING.md
```

### Configuration (`config/`)

```
config/
├── cleanup.config.yaml
├── quality-budgets.json   # Health-score weights and quality budgets
├── docs-organization.yaml
├── sync-layers.json
└── schemas/
    └── project.manifest.schema.json
```

### Tests (`tests/`)

```
tests/
├── fixtures/           # Sample host projects
├── integration/
├── unit/
└── utils/              # fixture-helper.js
```

## Module responsibilities

### Agent (`scripts/agent/`)

Host adoption: write a short host `AGENTS.md` from stack facts (never copy this
repo's), copy agent-context and operational-memory layers, optional questionnaire
and `project.manifest.json`.

Entry: `npm run agent:init` (`--advanced` for the longer path).

### Doctor (`scripts/doctor/`)

Health scoring and `--fix`. Weights and penalties come from
`config/quality-budgets.json` (`healthScore`): testing, CI, type safety, quality,
security, agent context. Documentation is reported and not weighted into the
overall score.

Entry: `npm run doctor`. Pass flags after `--` (`npm run doctor '--' --fix` in
PowerShell).

### Cleanup (`scripts/cleanup/`)

Remove template-only files; package-manager adapters for npm, pnpm, yarn, pip,
Poetry.

Entry: `npm run cleanup` (dry-run by default; `--apply` to write).

### Tools (`scripts/tools/`)

Stack detection, gap analysis, plan generation, Cursor rules integration, the
`verify` and `preflight` pipelines, doc-link and encoding checks, docs organizer.

Used by the doctor, CI (`indie-ci.yml`), and `npm run verify` / `npm run preflight`.

### Sync (`scripts/sync/`)

Pull selected template layers into a host. Entry: `npm run sync`.

### Utils (`scripts/utils/`)

Shared TypeScript helpers: cache, logger, parallel, paths, JSONC, env validation,
verification evidence helpers.

## Data flow

### Doctor

```
npm run doctor '--' --fix

1. Stack detection  →  .devenv/stack-report.json
2. Gap analysis     →  .devenv/gaps-report.json (machine) and .devenv/gaps-report.md (human)
3. Health scoring   →  reads JSON; categoryMap in quality-budgets.json routes each gap
4. Quick-wins       →  detectCondition + fixAction on the filesystem, not on gap text
5. Auto-fix         →  honors --dry-run, --no-install, --preset
6. Report           →  text or --json
```

Read the JSON artifacts. Never parse the markdown report back.

### Agent init

```
npm run agent:init

1. Optional questionnaire
2. Host AGENTS.md stub from stack facts (skip if one exists)
3. Layer copy (agent-context, operational-memory) when requested
```

## Technology stack

- **Language:** TypeScript (strict, ES2022, CommonJS), compiled to `dist/`
- **Runtime:** Node.js 24+ (pinned in `package.json` `engines`, `volta`, `.nvmrc`)
- **Tests:** Node.js built-in test runner (`node --test`)
- **CI:** `.github/workflows/indie-ci.yml` (GitHub Actions free tier)
- **Lint / format:** ESLint flat config, Prettier (single quotes)

## Design principles

1. **Menu, not mandate.** Hosts may take agent context and skip the doctor and the
   lint toolchain. A declined gap is recorded in the host `AGENTS.md`, not re-litigated.
2. **TypeScript source of truth.** New code is `.ts`. Remaining `.js` is wrappers,
   standalone tools, or tests that exercise `dist/`.
3. **Prefer Node built-ins.** Small install footprint.
4. **Evidence over green checks.** `npm run verify` extracts a count from each stage.
5. **Indie focus.** No team approval gates; optimize for Actions free tier.
6. **Idempotent scripts.** Check before create; re-running must not duplicate or destroy.

## File organization

- New **module** under `scripts/[name]/` when it has its own CLI and a real surface.
- Add to **utils** when three or more modules need it and it has no product logic.
- Shared types live in `scripts/types/`.
- Files are kebab-case; types PascalCase; functions camelCase.

## Build and development

```
npm run build            # tsc --build (prebuild type-checks)
npm test                 # build, then tests/**/*.test.js
npm run doctor '--' --fast
npm run lint
npm run verify           # type-check, lint, tests, build, doc-links, encoding
```

CI (`.github/workflows/indie-ci.yml`) runs lint, tests, and a doctor pass on
`main`/`master`. Cache npm and TypeScript build info; keep the job on the free tier.

## References

- [README](../../README.md)
- [Usage](../guides/usage.md)
- [AGENTS.md](../../AGENTS.md)
- [Human Use](../human-use/README.md)
- [Troubleshooting](../TROUBLESHOOTING.md)
