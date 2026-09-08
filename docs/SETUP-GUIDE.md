# DevEnvTemplate Setup Guide

**Purpose:** One-time adoption — either the agent/docs layers alone, or the full doctor embed under `.devenv/`.

> **After setup:** Once the doctor is embedded, see [EMBEDDED-USAGE.md](guides/embedded-usage.md) for ongoing workflows.

---

## Choose your adoption path

| Goal | Path | Node on the host? |
| ---- | ---- | ----------------- |
| Better agent context, known-errors log, Cursor rules — **no** gap scanner | [Files-only adoption](#files-only-adoption-agent-and-docs-layers) below | **No** |
| Gap analysis, quick-win fixes, CI doctor stage | [Embed the doctor](#embed-the-doctor-node-hosts) (steps 1–6) | **Yes** — Node 24+ only inside `.devenv/`, not necessarily on the host |

**Node.js 24+ (or Volta) is the doctor runtime, not an adoption tax.** Game engines, native apps, and other non-Node repositories should use files-only adoption unless you explicitly want the doctor vendored under `.devenv/`.

---

## Files-only adoption (agent and docs layers)

**Default for Unity, Unreal, and any non-Node product repository.** Copy the Cursor/docs layer; do **not** clone this repo into `.devenv/` and do **not** install Node on the host for adoption.

### What to copy

| Artifact | Notes |
| -------- | ----- |
| **Root `AGENTS.md`** | Write your own facts about the host repo. Do **not** copy DevEnvTemplate's `AGENTS.md`. |
| **Nested `AGENTS.md`** | Optional, next to an engine subproject if useful. |
| **`.agents/skills/`** | All skills; each loads only when its `description` matches the task. |
| **`.cursor/rules/`** | Copy the rules for your stack (see below). |
| **`docs/DOCS_LAYOUT.md`** | Where new docs belong. |
| **`docs/KNOWN_ERRORS.md`** | Append-only failure log (start empty or with host-specific entries). |
| **`docs/operational/automation-gaps.md`** | What automation cannot reach. |
| **`.cursorignore`** | Optional; reduces noise in large trees. |
| **`.vscode/settings.json`** | Optional workspace defaults. |

### Stack-specific rules

| Host | Rules to copy | Doc stubs |
| ---- | ------------- | --------- |
| **Unity** | `23-unity-csharp.mdc` | [templates/unity/README.md](templates/unity/README.md) |
| **Unreal** | `21-unreal-engine.mdc`, `22-unreal-editor-ui.mdc` | [templates/unreal/README.md](templates/unreal/README.md) |
| **Node / TS / Python** | Rules matching your file types from [`.cursor/rules/README.md`](../.cursor/rules/README.md) | Per-stack guides under [best-practices/](best-practices/) |

When you later add the doctor to the same repo, `integrateCursorRules` can copy Unreal rules when `unrealProjectDetected` and Unity rules when `unityProjectDetected`.

### After copying

1. Rewrite root `AGENTS.md` for your repository (stack, commands, paths agents must not guess).
2. Trim or localize any skill **Localize on copy** sections that still describe DevEnvTemplate.
3. Record host-specific failures in `docs/KNOWN_ERRORS.md` as they happen.

No build step. No `npm install`. See also [Applying this template to another project](../AGENTS.md#applying-this-template-to-another-project) in `AGENTS.md`.

---

## Embed the doctor (Node hosts)

Follow steps 1–6 when you want `npm run doctor`, gap reports, and quick-win fixes. This is the **canonical day-zero path** for doctor adopters; the README Quick Start matches these steps.

### 1. Add `.devenv/` to your project

```bash
# Inside your project root
git clone https://github.com/XylarDark/DevEnvTemplate .devenv
```

- **New project:** run this after `git init` / framework scaffolding.
- **Existing project:** clone into the repo root (sibling to `src/`, `api/`, etc.).

> ℹ️ Commit `.devenv/` like any other tool. Individual doctor reports (`.devenv/stack-report.json`, etc.) stay gitignored inside the host repo.

### 2. Install & build DevEnvTemplate once

```bash
cd .devenv
npm install          # install DevEnvTemplate dependencies
npm run build        # compile doctor/stack-detector/gap-analyzer
```

This populates `dist/` so that `npm run doctor` works from CI and terminals.

> **Auto Gitignore:** During `npm install`, DevEnvTemplate may append `.devenv/` to your parent `.gitignore` if it isn't already there. If you **want** `.devenv/` committed (recommended for reproducible doctor runs), remove that line from `.gitignore` after install.

### 3. Capture project intent (optional)

```bash
npm run agent:init
```

Answer the interactive questions (project type, language, framework, package manager, features). This creates `project.manifest.json`, which the doctor uses when detection is ambiguous.

**Advanced / alternative:** `npx devenv-init` runs the same simplified manifest wizard when this package is published to npm. It does **not** clone or build `.devenv/` — use step 1 for that.

### 4. Run the first doctor pass

```bash
# From the project root
npm run doctor
```

The first run is technology-agnostic and writes `.devenv/stack-report.json`. Later runs use the detected **stack profile** and narrow prescriptions.

#### Stack-specific notes

| Stack profile         | What to expect                                                                                        | Recommended commands                                                                                                                           |
| --------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Node / TypeScript** | Doctor may recommend Vitest + ESLint + Playwright once detected.                                     | `npm run doctor -- --preset nextjs` (or vite/express) if the repo is empty but you already know the stack.                                     |
| **Python-only**       | Doctor pivots to Pytest + Ruff + Black + Mypy once `pyproject.toml` / `requirements.txt` are present. | Add `pyproject.toml` or `requirements.txt`, then re-run `npm run doctor`. No ESLint/TypeScript guidance will appear after the first detection. |
| **Polyglot**          | Multiple profiles can be active. Doctor outputs one section per profile.                              | Run `npm run doctor -- --json` if you need to programmatically separate profile-specific issues.                                               |

#### Python project example

```bash
git clone https://github.com/XylarDark/DevEnvTemplate .devenv
cd .devenv && npm install && npm run build && cd ..
poetry install            # or pip install -r requirements.txt
npm run doctor
```

See [Python Best Practices Guide](guides/python-best-practices.md) for detailed guidelines.

### 5. Running from `.devenv/`

Once `.devenv/` exists you can drive doctor from there while pointing at the parent project:

```powershell
# Windows PowerShell
Set-Location C:\dev\your-project\.devenv
npm run doctor              # auto-detects parent project
npm run doctor -- --project-root ..   # explicit override
```

```bash
# macOS / Linux
cd ~/dev/your-project/.devenv
npm run doctor

# Or target another directory
DEVENV_PROJECT_ROOT=../other-project npm run doctor -- --project-root ../other-project
```

### 6. Commit + push

After the first successful doctor run:

```bash
cd ..
git add .devenv
git commit -m "chore: add DevEnvTemplate doctor"
git push
```

CI can run `npm run doctor -- --strict` (optional) plus your existing tests.

---

## Git remote configuration (optional)

For easier syncing with template updates, configure a `template` remote:

```bash
cd .devenv
git remote add template https://github.com/XylarDark/DevEnvTemplate.git
```

See [SYNC.md](SYNC.md) for pulling template updates.

## Next steps

1. **[EMBEDDED-USAGE.md](guides/embedded-usage.md)** — Daily workflow with an embedded doctor
2. **[SYNC.md](SYNC.md)** — Sync with template updates
3. **[USAGE.md](guides/usage.md)** — Doctor and cleanup commands
4. **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** — Common issues

---

### Quick reference (doctor embed)

```
mkdir my-app && cd my-app
git clone https://github.com/XylarDark/DevEnvTemplate .devenv
cd .devenv && npm install && npm run build && npm run agent:init
cd ..
npm run doctor
```

For an existing Python repo:

```
git clone https://github.com/XylarDark/DevEnvTemplate .devenv
cd .devenv && npm install && npm run build
cd ..
poetry install            # or pip install -r requirements.txt
npm run doctor
```

Once the stack profile flips to `python`, future doctor runs will only recommend Pytest/Ruff/Black/Mypy quick wins—no TypeScript noise.
