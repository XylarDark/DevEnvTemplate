# Syncing from DevEnvTemplate

Keep adopted layers current without re-reading a quarterly checklist. Sync copies **only the
allowlisted paths** for the layer you chose. Dry-run is the default.

## Quick start

From a host project that already adopted one or more layers:

```bash
# Preview agent-context updates (skills, glob-scoped rules, .cursorignore)
npm run sync -- --layer agent-context --template /path/to/DevEnvTemplate

# Apply operational-memory entry shapes when they are still missing
npm run sync -- --layer operational-memory --template /path/to/DevEnvTemplate --apply

# Refresh a vendored .devenv/ doctor checkout (file copy)
npm run sync -- --layer doctor --template /path/to/DevEnvTemplate --apply
```

PowerShell: quote the separator when passing flags — `npm run sync '--' --layer agent-context ...`.

Set `DEVENV_TEMPLATE_PATH` to skip repeating `--template`.

## Layers and allowlists

Configured in [`config/sync-layers.json`](../config/sync-layers.json). Edit that file when a
layer's shape changes.

| Layer | What sync refreshes | Overwrite policy |
| ----- | ------------------- | ---------------- |
| **agent-context** | `.agents/skills/` (optional `core/` / `extras/` groups when present), stack-matching glob-scoped `.cursor/rules/`, `.cursorignore`, `.cursor/rules/README.md` | Add missing files only; never overwrite host edits |
| **operational-memory** | `docs/KNOWN_ERRORS.md`, `docs/operational/automation-gaps.md`, `docs/DOCS_LAYOUT.md` | Add missing entry shapes only |
| **doctor** | Doctor toolchain under an existing `.devenv/` (`scripts/doctor`, `scripts/tools`, `scripts/utils`, `scripts/cleanup`, `config/`, core package/tsconfig/eslint files) | Refresh template files; restore project reports listed in the config |

## Safety rules (always on)

- **Never overwrites host root `AGENTS.md`.** Write your own; sync will not replace it.
- **Never copies MCP configs** (`.cursor/mcp.json`, `.mcp.json`). Start from
  [`.cursor/mcp.json.example`](../.cursor/mcp.json.example) manually.
- **Never copies retired always-applied Cursor rules.** Migrate those to `AGENTS.md` and
  `.agents/skills/` instead.

## Embedded `.devenv/` git merge (legacy)

When `.devenv/` is its own git checkout, the shell wrappers still run a git merge and restore
project-specific reports:

```bash
cd .devenv
./scripts/sync-from-template.sh /path/to/DevEnvTemplate --apply
```

```powershell
Set-Location .devenv
.\scripts\sync-from-template.ps1 C:\dev\DevEnvTemplate --apply
```

Or from the host root:

```bash
npm run sync -- --devenv-merge --template /path/to/DevEnvTemplate --apply
```

Project files preserved during merge: `health-report.json`, `gaps-report.md`, `stack-report.json`,
`health-before.json`, `health-after.json`, `input.txt`, `gaps-report.json`.

## Troubleshooting

**Template path does not exist** — pass an absolute path or set `DEVENV_TEMPLATE_PATH`.

**Doctor layer skipped** — the host has no `.devenv/` directory. Vendor the doctor first; see
[embedded usage](guides/embedded-usage.md).

**Merge conflicts (`--devenv-merge`)** — resolve in git, then restore preserved files from the
backup directory named in the error.

## Related

- [README — Adopt it in layers](../README.md#adopt-it-in-layers)
- [embedded-usage.md](guides/embedded-usage.md) — ongoing `.devenv/` workflows
