# Human Use

The human is the **steering-wheel designer**, the **taste maker**, and the
**tester**. The agent executes. That is the split **anywhere in the project**, in
any phase — not only when a file in this folder is open.

This folder is the **catalog of decision types**. A change in `scripts/doctor/`
uses the same three jobs as a feature cycle.

- **Steer.** Isolation, permissions, web reach, when to stop, tiny steps, harness
  changes (skills, MCP, always-on files).
- **Taste.** Purpose, architecture, patterns, golden references. Shaping: your
  judgment is the bar.
- **Test.** Scenarios, verify command, graphs, independent grade, ship/no-ship.
  Outcomes, not junior-style reading of the agent’s diff.

Start here: **[OWNERSHIP.md](OWNERSHIP.md)** (jobs, split, alert shape). Then
[CYCLE.md](CYCLE.md) (when a decision is due *for this task*).

**Taste Gates** (detect → queue → ask → scribe → resume): [taste-gates.md](taste-gates.md) · opt-in skill `taste-gate` under `.agents/skills-extras/`.

This is agentic engineering, not vibe coding. The model can leave the syntax. It
cannot leave modular design, taste, or accountability.

| Human job | Gate | File | Agent after it |
| --------- | ---- | ---- | -------------- |
| Taste | Architecture | [architecture.md](architecture.md) | Flesh-out |
| Steer | Environment | [environment.md](environment.md) | Only this verify line is evidence; obey web reach |
| Test | Test contract | [test-contract.md](test-contract.md) | Tests from *your* confirmed scenarios |
| Test | Outcome rubric | [outcome.md](outcome.md) | Independent grade (verifier) |
| Test | Review / ship | [review.md](review.md) | — (or optimize if you asked) |
| Test | Optimize? | [optimization.md](optimization.md) | Code change only after you paste numbers |

A typo or one-line fix: one owner sentence, then the fix. Engine-specific conventions
stay in [templates/unreal](../templates/unreal/README.md) and
[templates/unity](../templates/unity/README.md).

Golden snippets (taste): [references/](references/README.md) (not a gate; you own what goes in).

**Cursor cannot** (PDF slices this product does not enforce): [cursor-cannot/](cursor-cannot/README.md).
The agent must not pretend those products exist.
