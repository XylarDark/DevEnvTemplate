# Development cycle

Ownership first: [OWNERSHIP.md](OWNERSHIP.md). This page is **when** each decision is
due. It applies when work starts **anywhere in the project**.

The agent’s first move is to name **who owns the next step**. If that owner is the
human and the decision is missing, it **alerts** and **asks**. If that owner is the
agent, it says so and executes — it still will not invent a human decision along the
way.

```
Architecture (human)  →  flesh-out (agent)
Environment (human)   →  verify command is now evidence
Test contract (human) →  implement + verify (agent)
Review (human)        →  done, or Optimize (human, then agent)
```

## Detect whose turn it is

First match wins. A field is empty if it still says `(fill in)`, the checklist has
no ticks, or a scenario is still the stub Given/When/Then.

| If | Phase | Owner |
| -- | ----- | ----- |
| Architecture purpose is empty | Architecture | **Human** — alert |
| Else environment choice or verify command is empty | Environment | **Human** — alert |
| Else no real behavior scenario (and not an “existing suite” pick) | Test contract | **Human** — alert |
| Else product code for this cycle is not done | Implement | **Agent** — execute; do not change vision or acceptance |
| Else review sign-off is empty | Review | **Human** — alert |
| Else the human asked for a performance pass | Optimize | **Human**, then agent |
| Else | Done / maintenance | Human says if a new cycle starts |

`docs/human-use/` missing: no Human Use ownership split in this host. Do not invent
gates. Still do not silently create a new shared library.

## Alert (only when *your* decision is required)

```
Owner: human — <decision that is missing>
I will not: <the work I must not invent>
Need from you: <that file’s numbered options>
```

Prefer a structured multiple-choice tool when the environment has one. Then **stop**.

When the next step is agent-owned and no human decision is pending:

```
Owner: agent — <flesh-out | implement | verify>
I will not: <human decisions I will not take>
```

Typo or one-line fix: `Owner: agent — one-line fix in <path>`, then the fix.

## After you pick

- **Fill the file yourself** — agent waits until it is no longer `(fill in)`.
- **Dictate in chat** — agent restates, you confirm, it scribes. Your text, not its.
- **Pick a listed default** — agent records it and writes only what you chose.
- **Skip** — agent proceeds and states the skip. It does not tick your sign-off.

## 1. Architecture (human)

File: [architecture.md](architecture.md). You own purpose, private knowledge, vision,
map, patterns, and the post-implementation checklist.

**Agent after it:** flesh-out — classes, interfaces, call sites. Does not change the
vision.

## 2. Environment (human)

File: [environment.md](environment.md). You own isolation and the verify command.
The agent must not treat any other run as evidence.

## 3. Test contract (human)

File: [test-contract.md](test-contract.md). You own scenarios, granularity, coverage,
and which human reference to copy.

**Agent after it:** branch (`feat/` / `fix/` / …), tests from *your* scenarios, then
code, until that verify command produces counts. Append
[KNOWN_ERRORS.md](../KNOWN_ERRORS.md) when a failure is worth remembering.

## 4. Review (human)

File: [review.md](review.md). You own ship/no-ship. The agent supplies graphs and
complexity; it does not review the diff as if a junior human wrote it, and it does
not tick your boxes.

## 5. Optimize (human, then agent)

File: [optimization.md](optimization.md). You own the numbers and the ask. The agent
does not start a cycle here.
