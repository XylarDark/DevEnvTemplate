# DevEnvTemplate Setup Guide

Step-by-step instructions for embedding DevEnvTemplate into any project before you start day-to-day workflows.

---

## 1. Add `.devenv/` to Your Project

```bash
# Inside your project root
git clone https://github.com/XylarDark/DevEnvTemplate .devenv
```

- **New project:** run this immediately after `git init` / framework scaffolding.
- **Existing project:** pull DevEnvTemplate into the repo root (sibling to `src/`, `api/`, etc.).

> ℹ️ Commit `.devenv/` like any other tool. Individual doctor reports (`.devenv/stack-report.json`, etc.) stay gitignored inside the host repo.

## 2. Install & Build DevEnvTemplate Once

```bash
cd .devenv
npm install          # install DevEnvTemplate dependencies
npm run build        # compile doctor/stack-detector/gap-analyzer
```

This populates `dist/` so that `npm run doctor` works from CI and terminals.
> **Auto Gitignore:** During `npm install`, DevEnvTemplate now appends `.devenv/` to your parent `.gitignore` if it isn’t already there, so you don’t accidentally commit the embedded tooling repo.

## 3. Capture Project Intent (Optional, Recommended)

```bash
npm run agent:init
```

Answer the 5 interactive questions (project type, language, framework, package manager, features). This creates `project.manifest.json`, which the doctor uses as a fallback if detection is ambiguous.

## 4. Run the First Doctor Pass

```bash
# From the project root
npm run doctor
```

The first run is intentionally technology-agnostic and writes `.devenv/stack-report.json`. All subsequent runs will use the detected **stack profile** and narrow prescriptions to the chosen technologies.

### Stack-Specific Notes

| Stack profile | What to expect | Recommended commands |
|---------------|----------------|-----------------------|
| **Node / TypeScript** | Doctor will recommend Vitest + ESLint + Playwright once detected. | `npm run doctor --preset nextjs` (or vite/express) if the repo is empty but you already know the stack. |
| **Python-only** | Doctor pivots to Pytest + Ruff + Black + Mypy once `pyproject.toml` / `requirements.txt` are present. | Add `pyproject.toml` or `requirements.txt`, then re-run `npm run doctor`. No ESLint/TypeScript guidance will appear after the first detection. |
| **Polyglot** | Multiple profiles can be active. Doctor outputs one section per profile. | Run `npm run doctor --json` if you need to programmatically separate profile-specific issues. |

## 5. Running from `.devenv/`

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

## 6. Commit + Push

After the first successful doctor run:

```bash
cd ..
git add .devenv
git commit -m "chore: add DevEnvTemplate doctor"
git push
```

CI will now be able to run `npm run doctor --strict` (optional) plus your existing tests.

---

### Quick Reference

```
mkdir my-app && cd my-app
npx create-next-app@latest .
git clone https://github.com/XylarDark/DevEnvTemplate .devenv
cd .devenv && npm install && npm run build && npm run agent:init
cd ..
npm run doctor            # from project root
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

