# Cursor Plan Integration

Plan mode turns a request into a scoped change. CI does not enforce plans.
[Ownership](../human-use/OWNERSHIP.md) is the split: **you steer, make taste, and
test; the agent executes.** The agent names the job at the start of work **and at
every fork**, anywhere in the tree, in any phase. If a human decision is missing,
it alerts with a recommendation and asks; it does not take that work on.

## Workflow

1. **Name the owner.** [CYCLE.md](../human-use/CYCLE.md) says whose turn it is.
   Human decisions still blank → options from that gate file, then wait.
2. **Plan** (once those decisions exist or you skipped them). Attach
   `.devenv/stack-report.json` and `.devenv/gaps-report.md` when you have them.
3. **Branch.** `feat/` / `fix/` / … or a worktree. Not `main` / `master`.
4. **Implement (agent).** Tests from *your* scenarios, then code, until the verify
   command you chose produces counts.
5. **Review (human).** Graphs and evidence from the agent; you own ship/no-ship.
6. **Optimize** only if you asked — you own the numbers.

No plan-only PR, stakeholder sign-off, or QA-lead gate. Indie / Actions free tier.

## Example Plan mode prompt

```
I need to implement [FEATURE NAME].

Ownership: docs/human-use/OWNERSHIP.md. I steer, make taste, and test; you execute.
If a human decision is missing, name the job, recommend, offer that file’s options, and stop.

If present, use:
- .devenv/stack-report.json
- .devenv/gaps-report.md

Create a short plan with:
1. Goal
2. Owner of each step (human vs agent)
3. Files, in order (only past decided human gates)
4. Constraints from AGENTS.md and docs/KNOWN_ERRORS.md
5. The verify command I chose (environment gate)
```

## What the agent must not do

- Take on a human decision (purpose, acceptance, isolation, ship, new libraries).
- Save a plan under `.cursor/plans/` unless you asked.
- Tick Human Use sign-off on your behalf.

## Related

- [Ownership](../human-use/OWNERSHIP.md)
- [Cycle](../human-use/CYCLE.md)
- [Architecture overview](../architecture/overview.md)
- [Best practices](../BEST-PRACTICES.md)
