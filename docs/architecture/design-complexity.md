# Design complexity

Hard Parts decides where the quanta are ([tradeoffs.md](tradeoffs.md)). This page decides whether the code inside those quanta stays cheap to change.

**Standing prompt (paste later):** [design-complexity-brief.md](design-complexity-brief.md).  
**Skill (opt-in):** `.agents/skills-extras/design-complexity`.

Working code is not the goal. A design that stays obvious under change is the goal.

## When to run the protocol

A new module, a public API, a class split, or an error policy **inside a boundary already chosen**. Skip it for a typo. Do not use it to invent a new deployable service — that is the trade-off brief.

## What this harness already decided

| Decision | Why it stays deep | Giving up |
|----------|-------------------|-----------|
| Doctor, skills, and sync are three modules, not one god script | Each hides one kind of knowledge (health checks, agent procedure, layer copy) behind a small entry | A change that needs all three is three edits, on purpose |
| A skill’s interface is its `description` plus “when to load” | Callers do not read the body to know whether to open it | A vague description is interface failure, not a docs nit |
| Host domain stays out of the harness | The secret (game rules, product taste) lives in one repo | This repo cannot answer a host’s business question |
| Good defaults over new config knobs | `npm run doctor` is the common path | “Just in case” flags are rejected unless a host already needs them |
| Line-count and extreme SRP in [code-structure](../../.agents/skills-extras/code-structure/SKILL.md) lose to depth | A split that leaks the same knowledge is a shallower system | A long coherent module is allowed |

Do not add pass-through wrappers whose only job is to call the next function with the same arguments. Do not add a skill that only links to another skill.

## Fitness already in force

- A shipped skill `description` must not name a host-only command.
- Sync does not copy host `AGENTS.md` or MCP configs.
- If a reviewer cannot guess the behavior from the interface comment, the interface is wrong.
