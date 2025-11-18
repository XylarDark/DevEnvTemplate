# DevEnvTemplate Doctor Performance Baseline (2025-11-18)

Environment:

- Windows 11 (PowerShell)
- Node.js 22.17.1
- Command pattern: `Measure-Command { node dist/scripts/doctor/cli.js --project-root <target> --json }`

> Note: even in `--json` mode the current CLI prints gap-analyzer logs and the markdown report before the JSON payload. This makes the captured output invalid JSON and is a gap to fix in the optimization work.

## Doctor end-to-end timings

| Target project | Description | Duration (ms) |
|----------------|-------------|---------------|
| `tests/fixtures/node-secrets-project` | Small Node.js repo with secrets hygiene | 202 |
| `tests/fixtures/nextjs-app-dir` | Larger Node (Next.js app router) | 215 |
| `tests/fixtures/python-sim-project` | Python-only simulation fixture | 191 |
| `../lunar_mining_sim` | Real mixed repo under analysis | 198 |
| `../lunar_mining_sim` (`--fast`) | Fast mode skips doc/docker/githook checks | 198 |

## Tool-specific timings (lunar_mining_sim)

| Tool | Command | Duration (ms) |
|------|---------|---------------|
| Stack detector | `node ../DevEnvTemplate/dist/scripts/tools/stack-detector.js --json` (cwd=`lunar_mining_sim`) | 79.8 |
| Gap analyzer | `node ../DevEnvTemplate/dist/scripts/tools/gap-analyzer.js` (cwd=`lunar_mining_sim`) | 73.0 |

These numbers will serve as the baseline for the upcoming optimization pass (targets: ≥20% reduction on large projects, cleaner JSON, clearer logs).

