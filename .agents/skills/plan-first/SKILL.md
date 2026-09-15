---
name: plan-first
description: Use when a task spans multiple files or modules, changes architecture or public APIs, or has several valid approaches - produces a short implementation plan before any code is written.
---

# Plan first

For complex or multi-file work, do not jump straight into code. Propose a short
implementation plan (or reference an existing plan from the conversation) and get
implicit or explicit approval before editing.

## When to plan first

- Multi-file refactors, or new features spanning several modules.
- Tasks that affect architecture, public APIs, or shared config and schemas.
- When the user asks for a plan, or uses Plan Mode (Shift+Tab in Cursor).
- When the task is ambiguous or has multiple valid approaches.

## When to skip

- Single-file, obvious fixes (a typo, one function change).
- Trivial edits such as a comment or a rename in one place.
- The user says "just do it" or "no plan needed."

## What the plan should include

- **Goal:** what is being built or changed, in one or two sentences.
- **Research:** for new features, ground the plan in prior research — official
  docs and version-specific tutorials first, customization after. See the
  `agent-workflow` skill for the research-then-tutorials-then-build policy.
- **Files and steps:** the key files to create or modify, and the order of steps.
- **Constraints:** boundaries drawn from project docs — `AGENTS.md`,
  `docs/KNOWN_ERRORS.md`, idempotency requirements.
- **Success:** how the result will be verified (tests, a manual check, or an
  explicit note on why verification is deferred).
- **Ownership:** who owns each step ([OWNERSHIP.md](../../../docs/human-use/OWNERSHIP.md)).
  A plan that assigns a human decision to the agent is not executable. If a human
  decision is still missing, **alert and stop** — do not plan implementation past it.
  See [CYCLE.md](../../../docs/human-use/CYCLE.md).

Keep the plan short: bullets, not essays. Reference existing docs instead of
duplicating them.

## When the user asks for a plan

- If Cursor Plan mode is active (or the environment exposes `CreatePlan`), use that
  tool. Clarifying questions are allowed when those Plan-mode instructions require
  them.
- If the user asks for a plan in Agent mode, write the plan in the reply. Do not
  switch modes just to produce a file.
- Save under `.cursor/plans/` only when the user asks to save the plan to a file or
  to the workspace.

## Saving plans

When the work is large enough to benefit from a persistent reference, you may suggest
saving it after the user has confirmed the plan — but never create
`.cursor/plans/*.md` by default.
