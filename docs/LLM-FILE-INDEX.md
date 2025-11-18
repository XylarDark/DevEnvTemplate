# DevEnvTemplate LLM File Index

This index lists the minimal set of files an AI assistant should load before editing or troubleshooting a project that embeds DevEnvTemplate.

---

## 1. Governance & Behaviour

| File | Why it matters |
|------|----------------|
| `docs/PROJECTRULES-UPDATE-v3.0.md` | Canonical engineering rules (shell, Unicode, cross-stack guidelines, stack profile expectations). |
| `docs/LLM-CONTEXT-GUIDE.md` | Complete command and workflow context for AI agents. |
| `docs/SETUP-GUIDE.md` | Step-by-step instructions for embedding `.devenv/` into a host project. |

## 2. Daily Operations & Troubleshooting

| File | Why it matters |
|------|----------------|
| `docs/USAGE.md` | Day-to-day doctor/cleanup workflows once setup is complete. |
| `docs/TROUBLESHOOTING.md` | Known issues, PowerShell notes, and remediation pipelines. |

## 3. Core Tooling Entry Points

| File | Description |
|------|-------------|
| `scripts/doctor/cli.ts` | The main doctor CLI – orchestrates stack detection, gap analysis, report printing, and quick-fix logic. |
| `scripts/tools/stack-detector.ts` | Detects technologies/configs and now records `profiles`/`primaryProfile` used to specialize recommendations. |
| `scripts/tools/gap-analyzer.ts` | Generates `.devenv/gaps-report.md`, applies stack-aware rules (Node vs Python, etc.), and computes health scores. |
| `scripts/tools/plan-generator.ts` | Produces `hardening-plan.md` and other action plans from the gaps report. |

## 4. CI / Automation References

| File | Description |
|------|-------------|
| `.github/workflows/ci.yml` | Example GitHub Actions workflow showing how to run doctor, tests, and strict gates. |
| `.github/tools/*` | Compiled versions of stack-detector, gap-analyzer, etc. that CI executes (read source in `scripts/tools/`). |

## 5. When to Load Additional Context

- **Embedded Projects** (`<project>/.devenv/`): Load the host project’s README/CI configs *plus* the files above from `.devenv/`.
- **Doctor Output Interpretation**: Pair `.devenv/stack-report.json` and `.devenv/gaps-report.md` with `docs/LLM-CONTEXT-GUIDE.md` to understand the current stack profile and remediation severity.
- **Custom Automation**: If generating plans or auto-fixes, include `scripts/types/*.ts` for shared interfaces.

---

**Usage Tip:** When spinning up a new AI session, feed the files in sections 1–3 first, then fetch project-specific artifacts (`stack-report.json`, README, CI files). This guarantees the assistant respects DevEnvTemplate’s stack-aware rules before touching anything in the host repository.

