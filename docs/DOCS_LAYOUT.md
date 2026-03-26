# Documentation directory layout (canonical)

**Purpose:** Single place that defines **where documentation belongs** in this repo. Agents and humans should place new docs under the right subdirectory and keep the root tidy.

**Policy:** Do not add new informal buckets at `docs/` root without updating **this file** first. The [docs-organization](guides/docs-organization.md) tooling implements **pattern-based moves**; `DOCS_LAYOUT.md` is the **semantic** source of truth for categories.

---

## Root (`docs/`) — entry points and indexes

| File | Purpose |
|------|--------|
| [README.md](README.md) | Docs index (if present). |
| **DOCS_LAYOUT.md** | This file — canonical structure. |
| [BEST-PRACTICES.md](BEST-PRACTICES.md) | Cross-cutting practices. |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Common failures and fixes. |
| [KNOWN_ERRORS.md](KNOWN_ERRORS.md) | Recurring errors and fixes (append-only log). |
| [SETUP-GUIDE.md](SETUP-GUIDE.md) | Getting started for this template. |
| [SYNC.md](SYNC.md) | Syncing from template (if used). |
| [DevEnvTemplate_RULES_SYNC.md](DevEnvTemplate_RULES_SYNC.md) | Append-only log of template rule changes (optional). |

Adjust names to match your fork; keep **DOCS_LAYOUT** updated when you add or rename entry files.

---

## Topic subdirectories (recommended)

| Directory | Purpose | Examples |
|-----------|---------|----------|
| **guides/** | How-to and long-form guides | `docs-organization.md`, tutorials |
| **architecture/** | System design, diagrams, ADR supplements | diagrams, service boundaries |
| **adr/** | Architecture Decision Records | `001-use-postgres.md` |
| **runbooks/** | Operational procedures, on-call steps | deploy, rollback, incident response |
| **setup/** | Environment, tools, editor config | MCP, CI runner, local secrets policy |
| **security/** | Threat modeling notes, security checklists | OWASP mapping, dependency policy |
| **operational/** | Automation gaps, maintenance | [`automation-gaps.md`](operational/automation-gaps.md), recurring chores |
| **templates/** | Fork-specific stubs (optional) | [`templates/unreal/`](templates/unreal/README.md) |
| **deployment/** | Release and infra docs | `*_DEPLOYMENT.md` (also matched by organizer) |
| **api/** | API design and references | `*_API.md` |

Create a subdirectory only when you have at least one document to place there, then add a row here.

---

## Relationship to `config/docs-organization.yaml`

- **YAML:** Pattern rules (e.g. `*_DEPLOYMENT.md` → `docs/deployment/`).
- **DOCS_LAYOUT:** Explains **why** those folders exist and what belongs in each for **new** docs.

If a pattern moves a file to a path not listed here, **update DOCS_LAYOUT** in the same change.

---

## Optional: game-engine projects

If you use the **Unreal optional rules** (`.cursor/rules/21-unreal-engine.mdc`), add a **`docs/UE/`** (or `docs/engine/`) folder for engine version notes, import conventions, and project-specific API pitfalls—**not** in this template’s default layout until you need it. Starter notes: [templates/unreal/README.md](templates/unreal/README.md).
