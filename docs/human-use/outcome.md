# Outcome rubric (human-owned) — Test

You own the gradeable criteria. The agent that wrote the code does **not** declare
them satisfied. The [verifier](../../.cursor/agents/verifier.md) scores each
criterion with evidence, in a separate pass.

Vague bars (“looks good”, “works”) produce noisy grades. One testable sentence per
criterion.

See [OWNERSHIP.md](OWNERSHIP.md).

## Options the agent must offer

When no criterion is filled **for this task** (still `(fill in)`):

1. **Derive from test-contract scenarios** (recommended) — agent proposes one
   criterion per confirmed scenario in the ask; I confirm before it writes.
2. **I’ll fill `outcome.md` myself** — agent waits.
3. **Dictate criteria in chat** — agent restates, I confirm, then it scribes.
4. **Skip** — no independent rubric this cycle; named verify command is the only
   bar. Agent records the skip.

## Max iterations

How many implement → grade loops before stopping and asking you. Default **3**.

```
(fill in, or leave 3)
```

## Criteria

One testable sentence each. The grader scores pass / fail / could-not-measure.

```
1. (fill in)
2. (fill in)
```

## Last grade (verifier writes; implementer does not)

```
Result: satisfied | needs_revision | could_not_measure | skipped
Iteration:
Evidence:
```
