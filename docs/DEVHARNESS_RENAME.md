# DevHarness rename

**Date:** 2026-09-19

The product formerly branded **DevEnvTemplate** is now **DevHarness**.

| Item | Status |
|------|--------|
| npm `package.json` `name` | `devharness` |
| CLI | `devharness-init` (alias); `devenv-init` kept for compatibility |
| GitHub repo | Still named `DevEnvTemplate` until Lead renames the remote |
| Default branch | `master` (this repo); consumers may say "main" loosely |
| Consuming repos (e.g. HomeWorld) | May keep vendored path `DevEnvTemplate/` until a dedicated path migrate |

Archive docs under `docs/archive/` are historical and were not mass-rewritten.
