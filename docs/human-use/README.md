# Human Use

Who owns the work, and when the agent must stop for a human decision. This applies
**anywhere in the project**, not only when a file in this folder is open.

- **Decisions are human.** Purpose, architecture, acceptance, isolation, ship/no-ship,
  performance targets, new shared libraries.
- **Execution is agent.** Flesh-out, tests from *your* scenarios, implementation,
  named verify command, graphs, recording failures.
- **Alerts fire when a human decision is missing.** The agent names the owner, what
  it will not invent, and the options you can pick. It does not take on your work to
  unblock itself.

Start here: **[OWNERSHIP.md](OWNERSHIP.md)** (the split). Then [CYCLE.md](CYCLE.md)
(when each decision is due).

This is agentic engineering, not vibe coding. The model can leave the syntax to an
agent. It cannot leave modular design, quality, or accountability.

| Human decision (gate) | File | Agent-owned work after it |
| --------------------- | ---- | ------------------------- |
| Architecture | [architecture.md](architecture.md) | Flesh-out |
| Environment | [environment.md](environment.md) | Treat only this verify line as evidence |
| Test contract | [test-contract.md](test-contract.md) | Implement + tests for *your* scenarios |
| Review / ship | [review.md](review.md) | — (or optimize if you asked) |
| Optimize? | [optimization.md](optimization.md) | Code change only after you paste numbers |

A typo or one-line fix: one owner sentence, then the fix. Engine-specific conventions
stay in [templates/unreal](../templates/unreal/README.md) and
[templates/unity](../templates/unity/README.md).

Golden snippets: [references/](references/README.md) (not a gate; you own what goes in).
