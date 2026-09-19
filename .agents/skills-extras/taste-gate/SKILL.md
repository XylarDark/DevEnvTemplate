---
name: taste-gate
description: Use when the agent would invent product feel, purpose, architecture vision, shot lists, or the next product track - detect the taste limit, emit an OWNERSHIP alert, queue the ask, and stop until a human answers.
---

# Taste Gate

When the agent hits a **human taste limit**, stop inventing. Detect → alert → queue → stop. After the human answers, scribe and resume agent-owned work.

**Canon:** [taste-gates.md](../../../docs/human-use/taste-gates.md) · [OWNERSHIP.md](../../../docs/human-use/OWNERSHIP.md) · [CYCLE.md](../../../docs/human-use/CYCLE.md)

## When to load

Load this skill when **any** checkable heuristic below is true and undecided **for this task**:

1. Would change product vision, art direction, or a locked shot / acceptance list.
2. Would pick the next product track or surface feel without a human interview or explicit unlock.
3. Would invent architecture purpose / directory map while [architecture.md](../../../docs/human-use/architecture.md) still says `(fill in)` for this task.
4. Would assign art-director accept/reject without AD or Lead waive.
5. Would reopen a closed track’s feel targets.
6. The phase board (or equivalent) says next track TBD and the agent would start product work anyway.

**Do not load** for: typo/one-line fixes; flesh-out of already-decided taste; work after an explicit human unlock for that phase.

> **Localize on copy.** Hosts may keep a product track doc (e.g. HomeWorld `Docs/28_TASTE_GATES.md`) that lists the same heuristics with project paths. Prefer that doc when present; otherwise use this skill.

## Procedure

### 1. Detect

Name the heuristic id (1–6) and the fork in one sentence.

### 2. Alert (OWNERSHIP shape)

Emit exactly this shape (Job: **taste** unless Steer/Test applies):

```
Owner: human — <this decision>
Job: taste
You are here: <task / path / shaping|settled>
Why now: <what goes wrong if we skip or guess>
I will not: <the feel/purpose/shape I must not invent>
Recommend: <one option grounded in repo evidence, or "no evidence — skip">
Need from you: <numbered options; recommended first; skip last>
After you pick: <what I do next; next human fork if any>
```

**Question budget:** max **2** questions per turn. Prefer A/B choices over open essays.

### 3. Queue

1. Write or update a durable handoff under the host’s handoff folder (e.g. `Docs/handoffs/TASTE_GATE_<SHORT_ID>.md` or `docs/handoffs/…`) — gate id, heuristic, alert paste, status `PENDING`.
2. Write a machine queue (usually gitignored), e.g. `Saved/taste_gates_pending.json`:

```json
{
  "id": "TG-EXAMPLE",
  "created": "YYYY-MM-DD",
  "heuristic": 6,
  "status": "pending",
  "handoff": "Docs/handoffs/TASTE_GATE_EXAMPLE.md",
  "summary": "one-line fork"
}
```

Idempotent: same `id` updates in place; do not duplicate.

> **Localize on copy.** Path names (`Saved/`, `Docs/handoffs/`) follow the host layout.

### 4. Stop

Do **not** invent taste, open a new product track, or keep coding past the fork. End the turn after the alert + queue.

### 5. Scribe and resume (after human answer)

When the human answers (chat pick, approve phrase, or dictate):

1. Scribe confirmed taste into the file named in the alert (or the product track doc).
2. Set queue entry `status` to `resolved`; note resolution in the handoff.
3. Resume only **agent-owned** work named in `After you pick`.

## Gate template

Round N (max 2 Q):

| Q | Prompt | Options |
|---|--------|---------|
| 1 | What should we decide now? | A / B / Skip |
| 2 | If A: which intensity? | Low / Mid / High / Skip |

Do not start Round N+1 until Round N is answered or skipped.

## Non-goals

- Auto-approve or invent product feel
- Replacing host Lead/AD approve gates
- Preference-model / RL training from chat
- Building products listed under [cursor-cannot/](../../../docs/human-use/cursor-cannot/README.md)
