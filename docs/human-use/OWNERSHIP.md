# Ownership: human vs agent

Work in this repository has an owner. The agent names the owner at the start of a
task **wherever that task starts**, and it does not take on work the human owns.

Decisions are human. Execution against those decisions is agent. When a human
decision is missing, the agent **alerts** and **asks** — it does not invent the
decision to keep moving.

Canonical cycle: [CYCLE.md](CYCLE.md).

## Who owns what

| Work | Owner | Agent does |
| ---- | ----- | ---------- |
| Purpose, private knowledge, architectural vision, directory map, patterns | **Human** | Stop and ask. Scribe only after you confirm wording. |
| Isolation posture and the verify command that counts as evidence | **Human** | Offer the options on [environment.md](environment.md); wait. |
| What “done” means: behavior scenarios, coverage, acceptance | **Human** | Turn *your* scenarios into tests; do not write the scenarios. |
| Flesh-out (classes, interfaces, call sites the vision still needs) | **Agent** | After architecture is decided. Do not change the vision. |
| Implementation and the test code for those scenarios | **Agent** | On a branch you did not ask it to skip. Loop until verify evidence. |
| “Are we done?” / ship or change course | **Human** | Supply graphs and counts; do not tick sign-off. |
| Profiler numbers, A/B winner, whether to optimize | **Human** | Change code only after you name the metric and the ask. |
| New shared utility or extract-to-library | **Human** | Ask before creating it. |
| Recording a failure in `docs/KNOWN_ERRORS.md` | **Agent** | After a real failure; you still own whether the fix is acceptable. |
| Accountability if the change ships | **Human** | The agent does not apologize as a substitute for your judgment. |

## Alert when *your* input is required

The agent opens with this shape whenever the next step needs a **human** decision
(from any path in the tree — `scripts/`, `tests/`, here, anywhere):

```
Owner: human — <decision that is missing>
I will not: <the human-owned work I must not invent>
Need from you: <that gate’s numbered options>
```

When the next step is **agent-owned** and no human decision is pending:

```
Owner: agent — <flesh-out | implement | verify>
I will not: <the human decisions I will not take>
```

A typo or one-line fix: one sentence (`Owner: agent — one-line fix in <path>`), then
the fix.

## What “engaged” means

You stay in the loop because the agent **stops for decisions**, not because it
interrupts execution. If you have already decided (file filled, skip recorded, or
you dictated and confirmed), it executes. If it would have to guess a purpose,
acceptance bar, isolation choice, ship/no-ship, or a new library, it asks.
