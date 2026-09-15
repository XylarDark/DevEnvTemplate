# Development cycle

Ownership first: [OWNERSHIP.md](OWNERSHIP.md). This page is **when** a decision is
due for **this task**. It is not a tour of `docs/human-use/`. Work under
`scripts/`, `tests/`, `.agents/`, or docs uses the same detector.

The agent’s first move — and any mid-task fork — is to name **who owns the next
step** and **which job** (steer, taste, or test). If that owner is the human, it
**alerts**, **recommends**, and **asks**
([alert shape](OWNERSHIP.md#alert-when-your-input-is-required)). If that owner is
the agent, it says so and executes — it still will not invent a human decision.

```
Taste: Architecture (human)  →  flesh-out (agent)
Steer: Environment (human)   →  verify command is now evidence
Test:  Test contract (human) →  implement (agent)
Test:  Outcome rubric (human) → independent grade (verifier), then implement again if needs_revision
Test:  Review (human)        →  done, or Optimize (human, then agent)
```

## Detect whose turn it is

First match wins. Scope is **this task**, not whether a Human Use template still
says `(fill in)`.

| If this task | Job | Phase | Owner |
| ------------ | --- | ----- | ----- |
| Typo or one-line fix | — | Implement | **Agent** — one owner sentence, then the fix |
| Would change vision, map, patterns, or public shape, and that is not decided *for this task* | Taste | Architecture | **Human** — alert |
| Needs a verify bar and none was named this chat (or in [environment.md](environment.md)) | Steer | Environment | **Human** — alert |
| Adds or changes behavior and no scenario exists *for this task* (and not an “existing suite” pick) | Test | Test contract | **Human** — alert |
| Has a bar (scenarios or existing suite) but no gradeable rubric, and not skipped | Test | Outcome | **Human** — alert |
| Product code for this task is not done | — | Implement | **Agent** — still stop on a mid-task human fork |
| Rubric filled and last grade is not `satisfied` | Test | Grade | **Verifier** — not the implementer |
| Evidence exists and ship / no-ship is not decided | Test | Review | **Human** — alert |
| The human asked for a performance pass | Test | Optimize | **Human**, then agent |
| Else | — | Done / maintenance | Human says if a new cycle starts |

**Mid-task forks** (new shared util, new MCP, ingest into always-on files) use the
same alert even when the phase is Implement. Do not wait until review.

`docs/human-use/` missing: no catalog on disk. Still do not silently take a
human-owned decision.

## Alert (only when *your* decision is required)

Use the [OWNERSHIP.md](OWNERSHIP.md#alert-when-your-input-is-required) shape
(Job / You are here / Why now / Recommend / After you pick). Prefer a structured
multiple-choice tool when the environment has one. Then **stop**.

When the next step is agent-owned and no human decision is pending:

```
Owner: agent — <flesh-out | implement | verify>
I will not: <human decisions I will not take>
```

When the next step is an independent grade:

```
Owner: verifier — score outcome.md (separate pass; do not fix)
```

Typo or one-line fix: `Owner: agent — one-line fix in <path>`, then the fix.

## After you pick

- **Accept the recommended draft** — agent scribes only what you confirmed or edited.
- **Fill the file yourself** — agent waits until it is no longer `(fill in)`.
- **Dictate in chat** — agent restates, you confirm, it scribes. Your text, not its.
- **Pick a listed default** — agent records it and writes only what you chose.
- **Skip** — agent proceeds and states the skip. It does not tick your sign-off.

## 1. Architecture (human) — Taste

File: [architecture.md](architecture.md). You own purpose, private knowledge, vision,
map, patterns, and the post-implementation checklist.

**Agent after it:** flesh-out — classes, interfaces, call sites. Does not change the
vision.

## 2. Environment (human) — Steer

File: [environment.md](environment.md). You own isolation, web reach, and the verify
command. The agent must not treat any other run as evidence, fetch off an allowlist,
or silently widen ask-vs-allow.

## 3. Test contract (human) — Test

File: [test-contract.md](test-contract.md). You own scenarios, granularity, coverage,
and which human reference to copy.

**Agent after it:** branch (`feat/` / `fix/` / …), tests from *your* scenarios, then
code. Do not declare the rubric satisfied in the same turn.

## 4. Outcome rubric (human), then grade (verifier) — Test

File: [outcome.md](outcome.md). You own gradeable criteria and max iterations.
The implementer does not tick the last grade. The verifier subagent scores each
criterion with evidence. `needs_revision` returns to implement (agent) until
`satisfied` or max iterations, then the human reviews.

## 5. Review (human) — Test

File: [review.md](review.md). You own ship/no-ship. The agent supplies graphs and
complexity; it does not review the diff as if a junior human wrote it, and it does
not tick your boxes.

## 6. Optimize (human, then agent) — Test

File: [optimization.md](optimization.md). You own the numbers and the ask. The agent
does not start a cycle here.
