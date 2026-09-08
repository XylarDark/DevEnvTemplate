# Automation gaps

**Purpose:** Track settings or workflows that **cannot** be set reliably via API, CLI, or stable automation—so the team can prioritize fixes, tickets, or runbook steps.

Use the [`automation-standards` skill](../../.agents/skills/automation-standards/SKILL.md) for the full procedure (identify → verify access → document → re-check on upgrade).

---

## How to add an entry

| Field                    | Description                              |
| ------------------------ | ---------------------------------------- |
| **Date**                 | YYYY-MM-DD                               |
| **Feature / area**       | What we tried to automate                |
| **What is needed**       | One sentence: required outcome           |
| **Why automation fails** | API gap, protected UI, vendor limit      |
| **Interim**              | Human step, vendor ticket, or workaround |
| **Suggested follow-up**  | Tooling or API to close the gap          |

---

## Open gaps

### Skills are not linked into `.claude/skills/` for Claude Code

| Field                | Detail                                                                                                                                                                                                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Date                 | 2026-09-07                                                                                                                                                                                                                                                             |
| Feature / area       | Agent Skills portability across tools                                                                                                                                                                                                                                  |
| What is needed       | The skills in `.agents/skills/` should also load in Claude Code, which reads `.claude/skills/`                                                                                                                                                                         |
| Why automation fails | The natural fix is a checked-in symlink, but creating one on Windows needs Administrator rights or Developer Mode, and this repository's clone has `core.symlinks=false`, so git materializes a committed symlink as a text file containing the path instead of a link |
| Interim              | Cursor needs nothing: it reads `.agents/skills/`, `.cursor/skills/`, `.claude/skills/`, and `.codex/skills/` natively. Claude Code users can create the link themselves, or copy the directory and accept that copies drift                                            |
| Suggested follow-up  | Re-check whether Claude Code has adopted the tool-neutral `.agents/skills/` path. Copying the files is deliberately not done: ten duplicated files that drift silently is worse than one documented gap                                                                |

### Agent hooks cannot be run fail-closed

| Field                | Detail                                                                                                                                                                                                                                                                                                                                                                      |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Date                 | 2026-09-08                                                                                                                                                                                                                                                                                                                                                                  |
| Feature / area       | `.cursor/hooks.json`, `failClosed: true` on `beforeReadFile` and `beforeShellExecution`                                                                                                                                                                                                                                                                                     |
| What is needed       | A secret scanner that blocks the operation when the hook itself fails, so a crash cannot become a silent bypass                                                                                                                                                                                                                                                             |
| Why automation fails | Cursor intermittently reports `Hook "..." returned no output` for payloads above roughly 1.4KB, while `.devenv/hook-audit.log` records a complete, newline-terminated write for that same invocation in 36–62ms. Under `failClosed` every such flake blocks a file read or shell command, and `beforeReadFile` carries the whole file, so ordinary work trips it constantly |
| Ruled out            | Not the timeout: a probe hook that busy-waits 500ms passes under `timeout: 2`, so the unit is seconds as documented. Not partial writes, `EAGAIN`, a destroyed stdin, a missing trailing newline, or slow process exit — all four were found and fixed, and the flake survived. 45 direct invocations at 65B, 20KB and 164KB, in and out of a shell, never reproduced it    |
| Interim              | `failClosed: false`, which is Cursor's default. The scanner still denies real secrets whenever its output is delivered, which is the normal case; what is lost is the guarantee under hook failure. `tests/unit/hooks-config.test.js` requires the field to be stated explicitly so the posture stays a decision rather than an inherited default                           |
| Decision record      | [adr/001-agent-hook-failure-posture.md](../adr/001-agent-hook-failure-posture.md) states the posture, what fail-open gives up, and the conditions under which a consumer should choose fail-closed instead                                                                                                                                                                  |
| Suggested follow-up  | Re-test `failClosed: true` after a Cursor upgrade by running a command with a >2KB payload a few times. If it holds, flip both entries and update that test. If the editor locks up, set `hooks` to `{}` in `.cursor/hooks.json` — Cursor reloads on save                                                                                                                   |
