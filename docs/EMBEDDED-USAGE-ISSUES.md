## Embedded Usage Issues (lunar_mining_sim, 2025-11-17)

This note captures every issue we observed while using DevEnvTemplate as a `.devenv/` folder inside another project (`lunar_mining_sim`). These will guide the fixes outlined in the hardening plan.

### 1. Shell Portability (Windows PowerShell)
- Commands copied from DevEnvTemplate docs use `&&`, which PowerShell rejects (`The token '&&' is not a valid statement separator`).
- Running multi-step commands (cd + npm run doctor) required manual rewriting with `Set-Location; npm run doctor`.

### 2. Script Entrypoints vs Build Artifacts
- After cloning `.devenv`, `npm run doctor` pointed to `node scripts/doctor/cli.js`, but only `.ts` sources exist (no compiled `.js`). Result: `Cannot find module '...scripts\doctor\cli.js'`.
- Temporary workaround was to run `npm run build` manually and then call `node dist/scripts/doctor/cli.js`.
- Root cause: package scripts reference source paths, not the bundled `dist/` outputs we expect consumers to run.

### 3. Doctor Executed From `.devenv` Analyzes Itself
- Running `npm run doctor` inside `.devenv` executes with `process.cwd() === .devenv`, so stack detection runs on the DevEnvTemplate checkout instead of the parent project.
- Generated artifacts end up in `.devenv/.devenv/` (double nesting) and never touch the actual project root.

### 4. Stack Detector Output Is Not JSON-Parseable
- `scripts/doctor/cli.ts` calls `execSync(...stack-detector...)` and `JSON.parse(stackOutput)`.
- Actual output contains human-readable log lines plus the JSON blob, so parsing fails with `Expected ',' or ']' after array element in JSON at position 5`.
- Error message surfaces as “Failed to detect stack: <JSON parse error>” with no guidance on how to recover.

### 5. Stack Detector Logs Mask Target Project Errors
- Even after manually running `node dist/scripts/tools/stack-detector.js`, the log shows `Stack report saved to ...\.devenv\.devenv\stack-report.json`, proving we are inspecting the wrong directory.
- Any JSON parsing errors (e.g., malformed `pyproject.toml` in the real project) would be indistinguishable from the CLI failing in `.devenv`.

### 6. Missing Documentation for Embedded Workflow
- No guidance in `docs/USAGE.md` or `docs/TROUBLESHOOTING.md` on how to run doctor when DevEnvTemplate is vendored into `.devenv`.
- No mention of Windows-safe command syntax or the need to run from the project root with `--project-root`.

---

## Proposed Fixes (Design Snapshot)

1. **Project Root Resolution**
   - Add a `resolveProjectRoot()` helper in `scripts/doctor/cli.ts`.
   - Default to `process.cwd()`, but if the directory name is `.devenv` _or_ `package.json` name is `devenv-template`, walk up one level.
   - Support `--project-root <path>` and `DEVTEMPLATE_PROJECT_ROOT` env var for explicit overrides.

2. **Direct Stack Detector Invocation**
   - Replace `execSync + JSON.parse` with `const StackDetector = require('../tools/stack-detector')`.
   - Instantiate detector with `new StackDetector(projectRoot)` and call `await detector.detect()`.
   - Convert stack report saving to use the resolved project root (no `.devenv/.devenv`).

3. **Structured Error Reporting**
   - Wrap file reads (`package.json`, `pyproject.toml`, etc.) in try/catch blocks that annotate errors with the file path and hint (e.g., “Invalid JSON in package.json. Run `npm run lint:json` or validate syntax.”).
   - Surface these errors to doctor CLI instead of a generic JSON parse failure.

4. **Gap Analyzer & Report Paths**
   - Run gap analyzer with `cwd = projectRoot` so that `.devenv/health-report.json` lands in the user project.
   - When running inside `.devenv`, still keep DevEnvTemplate’s own health files isolated.

5. **Documentation & Command Examples**
   - Update `docs/USAGE.md` and `docs/TROUBLESHOOTING.md` with:
     - Embedded workflow steps (clone into `.devenv`, run doctor from project root, pass `--project-root` when necessary).
     - Windows-safe command snippets (`Set-Location ...; npm run doctor`).
     - Explanation of the new environment variable / CLI flag.

These design choices will be implemented in the subsequent tasks.

