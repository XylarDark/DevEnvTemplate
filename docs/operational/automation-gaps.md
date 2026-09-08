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

### GitHub notification volume cannot be set from the repository

| Field                | Detail                                                                                                                                                                                                                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Date                 | 2026-09-08                                                                                                                                                                                                                                                                                                   |
| Feature / area       | Email sent for failed Actions runs and for Dependabot pull requests                                                                                                                                                                                                                                          |
| What is needed       | A maintainer who is not emailed for every automated pull request and every red run                                                                                                                                                                                                                           |
| Why automation fails | Notification routing is an **account** setting, not a repository one. Nothing the project can commit changes it, and `gh` cannot write it either                                                                                                                                                             |
| Interim              | Reduce the events worth emailing about. `.github/dependabot.yml` is monthly with every group including `major`, so a month of bumps arrives as at most three pull requests rather than one per dependency. Keeping CI green removes the failure mail: 17 of 24 runs failed before the lock file was resynced |
| Manual step          | GitHub, Settings, Notifications: set **Actions** to notify only on failure, or off entirely. On each repository watch menu choose **Participating and @mentions** rather than **All Activity**                                                                                                               |
| Suggested follow-up  | None available. GitHub exposes no repository-scoped notification policy; re-check if one ships                                                                                                                                                                                                               |
