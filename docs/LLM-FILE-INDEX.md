# DevEnvTemplate LLM File Index

This index lists the minimal set of files an AI assistant should load before editing or troubleshooting a project that embeds DevEnvTemplate.

---

## 1. Governance & Behaviour

| File | Why it matters |
|------|----------------|
| **`BOOTSTRAP.md`** | **Single-file-loads-all for LLM sessions. Load this first - contains all essential information.** |
| `docs/PROJECTRULES-UPDATE-v3.0.md` | Canonical engineering rules (shell, Unicode, cross-stack guidelines, stack profile expectations). |
| `docs/LLM-CONTEXT-GUIDE.md` | Complete DevEnvTemplate command and workflow context for AI agents (technology-agnostic). |
| `docs/LLM-REFERENCE.md` | Technology-agnostic template for project-specific extensions. Projects should copy and extend this file. |
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

- **Embedded Projects** (`<project>/.devenv/`): Load the host project's README/CI configs *plus* the files above from `.devenv/`.
- **Doctor Output Interpretation**: Pair `.devenv/stack-report.json` and `.devenv/gaps-report.md` with `docs/LLM-CONTEXT-GUIDE.md` to understand the current stack profile and remediation severity.
- **Custom Automation**: If generating plans or auto-fixes, include `scripts/types/*.ts` for shared interfaces.

## 6. Choosing Between LLM Documentation Files

| File | Use When | Content Focus |
|------|----------|---------------|
| **BOOTSTRAP.md** | **Starting a new AI session** | **Single-file-loads-all - contains all essential information. Load this first.** |
| **LLM-FILE-INDEX.md** | Need navigation checklist | Navigation checklist - tells you which files to load if you need more detail |
| **LLM-CONTEXT-GUIDE.md** | Need DevEnvTemplate command details | Technology-agnostic DevEnvTemplate commands, workflows, decision trees |
| **LLM-REFERENCE.md** | Creating project-specific extension | Technology-agnostic template - copy and extend with project-specific content |

**Quick Decision Tree:**
- **"Starting a new session?"** → **Load `BOOTSTRAP.md` only** - it contains everything you need
- **"Need detailed DevEnvTemplate commands?"** → Load `docs/LLM-CONTEXT-GUIDE.md` (referenced in BOOTSTRAP.md)
- **"Creating project-specific extension?"** → Use `docs/LLM-REFERENCE.md` as a template
- **"Need file navigation?"** → Load `docs/LLM-FILE-INDEX.md` (referenced in BOOTSTRAP.md)

---

**Usage Tip:** **For new LLM sessions, load `BOOTSTRAP.md` at session start. It contains all essential information and references to detailed documentation. Do NOT load README.md - BOOTSTRAP.md includes essential README content to avoid redundancy.**

