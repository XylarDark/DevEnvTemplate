# Architecture (human-owned) — Taste

You own purpose, private knowledge, and vision. The agent owns flesh-out only after
you decide (or skip). Blank fields are a missing **taste** decision, not a prompt to
invent. See [OWNERSHIP.md](OWNERSHIP.md).

Unreal-specific notes (engine version, render pipeline, Data Assets, plugins, Epic
C++) belong in [templates/unreal](../templates/unreal/README.md) and
[`.cursor/rules/21-unreal-engine.mdc`](../../.cursor/rules/21-unreal-engine.mdc).
Unity: [templates/unity](../templates/unity/README.md).

## Options the agent must offer

When purpose is not decided **for this task** (and this is not a one-line skip).
Put any draft in the alert; do not write this file until I confirm.

1. **Accept or edit the agent’s draft** (recommended when the task is architectural) —
   one-sentence purpose and map grounded in the files this task touches.
2. **I'll fill `architecture.md` myself** — agent waits.
3. **Reuse existing architecture** — treat [docs/architecture/overview.md](../architecture/overview.md)
   as the vision; I'll add only private knowledge in chat.
4. **Dictate in chat** — agent restates my wording, I confirm, then it scribes.
5. **Skip this gate** — typo, one-file change, or I accept the current layout. Agent
   records the skip and does not tick the checklist.

## What is not on the public internet

Domain knowledge, private APIs, product constraints, and decisions that exist only
in this team or this repo.

```
(fill in)
```

## Purpose (one sentence)

```
(fill in)
```

## Stack

Language, runtime, frameworks, engine version, platforms, render pipeline, frontend
and backend integration.

```
(fill in)
```

## Architectural vision

How the pieces fit: GUI vs logic, content layout, singletons vs data-driven, where
web-provided data enters.

```
(fill in)
```

## Directory map

Where new code, content, tests, and docs go.

```
(fill in)
```

## Services, models, plugins

```
(fill in)
```

## Design patterns in force

```
(fill in)
```

## Post-implementation checklist

What “done” means for this cycle. The agent must not tick these for you.

- [ ]
- [ ]
- [ ]
