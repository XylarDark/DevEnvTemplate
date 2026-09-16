# Multi-agent swarm guide

**Purpose:** Optional patterns for orchestrator–worker swarms in a single repository. Adopt what
fits; skip the rest. This guide does not require the Node doctor, a specific test runner, or any
game-engine tooling.

Swarms here mean **one conductor decomposes work, fans out specialized workers, and synthesizes
results** — not a chat room of peer agents negotiating in one thread. The conductor owns
coordination; workers own bounded slices with exclusive write paths.

For two agents sharing one checkout without a formal swarm, start with the core
[multi-agent-collaboration](../../.agents/skills/multi-agent-collaboration/SKILL.md) skill. This
guide is for when you deliberately scale beyond that.

---

## When to use a swarm (and when not to)

Anthropic's multi-agent research system and Claude's managed-agent docs converge on the same
trade-off: **coordination cost is real.** Use multiple agents when at least one of these is true:

| Use multi-agent when | Why |
| -------------------- | --- |
| **Context would pollute one session** | Each subtask needs a deep, narrow read (large codebase areas, long logs, parallel research). |
| **Work parallelizes cleanly** | Subtasks have non-overlapping outputs and can run at the same time. |
| **Specialization beats one generalist** | Roles differ materially (explore vs implement vs verify vs domain expert). |

**Skip the swarm** when:

- The task is a single file or a short, sequential edit.
- Workers would share write paths (see [Exclusive file ownership](#exclusive-file-ownership)).
- You cannot name required inputs, outputs, and evidence for each slice (see [Evidence contracts](#durable-handoffs-and-evidence-contracts)).
- You are compensating for a thin plan — decomposition does not fix an unclear goal.

If coordination overhead exceeds the time saved, one agent with a good plan wins.

---

## Orchestrator–worker topology

```
Human (steer / taste / test)
        │
        ▼
  Conductor / orchestrator          ← decomposes, assigns, synthesizes; usually does not implement
        │
   ┌────┼────┬────────┐
   ▼    ▼    ▼        ▼
 Worker Worker Worker  Reviewer/QA   ← one role, one bounded slice; read-heavy roles stay readonly
```

**Conductor responsibilities:**

- Break the goal into slices with explicit owners and ordering.
- Maintain a **collision map** (which paths each worker may touch).
- Fan out to workers via isolated chats or Task subagents — not nested conductors.
- Collect artifacts and evidence; do not accept "done" from the implementer alone.
- Escalate to the human at trust anchors (below).

**Worker responsibilities:**

- Read the handoff artifact, not the conductor's chat history.
- Stay inside assigned paths; refuse or return work that needs another owner's files.
- Produce the evidence the contract names (counts, logs, screenshots, file paths).
- Commit own work promptly; stage **explicit paths only**.

**One level of delegation.** A planner subagent must not spawn another planner. An adversarial or
review pass is a separate role, not a nested coordinator.

Related: [Cursor subagents](https://cursor.com/docs/subagents.md), [Anthropic multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system), [Claude managed-agent orchestration](https://platform.claude.com/docs/en/managed-agents/multiagent-orchestration).

---

## Exclusive file ownership

**One writer per path for the duration of a slice.** Overlap is a coordination bug, not a merge
problem to solve later.

Before parallel work starts, publish a collision map:

| Path / area | Owner | Mode |
| ----------- | ----- | ---- |
| `src/auth/**` | Worker A | write |
| `tests/auth/**` | Worker B | write |
| `docs/guides/foo.md` | Conductor | write (synthesis only) |
| `scripts/shared-tool.ts` | — | **sequenced** — no parallel edits |

Rules:

- If two slices need the same file, **sequence** them or split the file first.
- Read-only access does not need an exclusive owner, but writers do.
- Stage with explicit paths (`git add path/to/file`), never `git add -A` or `git add .`.
- Do not commit changes you did not make.

When workers share one checkout, workers do not push and never rebase — the conductor (or a
dedicated integrator) owns publication. Full rules:
[multi-agent-collaboration](../../.agents/skills/multi-agent-collaboration/SKILL.md).

---

## Durable handoffs and evidence contracts

**The next agent cannot read your context window.** Anything the swarm needs must exist as a file.

### Handoff artifact (minimum)

Store under a path your project already uses for plans (`docs/`, `.cursor/plans/` if you asked
for plans, or a project-specific `HANDOFF.md`). Include:

1. **Goal** — one paragraph, current slice only.
2. **Owner** — agent id or role name.
3. **Allowed paths** — write list from the collision map.
4. **Inputs** — files, reports, or commands the worker must read first.
5. **Outputs** — files to create or modify.
6. **Evidence** — what proves done (see below).
7. **Baseline** — test/build counts before the worker started.
8. **Kill criteria** — when to stop and return (see [Kill criteria](#kill-criteria)).

Zach Wills' week-long swarm experiment treats the **plan as the durable artifact**; dsh-swarm
extends that with explicit delivery contracts. Prefer disk over chat for anything that crosses
session boundaries.

### Evidence contract

Each slice names checkable proof. Examples:

| Evidence type | Example |
| ------------- | ------- |
| **Counts** | `npm test` → N passed, 0 failed (state baseline vs final). |
| **Command output** | Lint clean; doctor stage X green. |
| **Artifact path** | Screenshot at `artifacts/review/foo.png`; report at `.devenv/gaps-report.json`. |
| **Independent review** | Verifier subagent or human Test job sign-off. |

**The implementer cannot self-approve a gate.** DS-EO-style governance and dsh-swarm both separate
**delivery** (worker) from **acceptance** (reviewer or human). The worker attaches evidence; a
different role or the human closes the gate.

Use [verification-evidence](../../.agents/skills/verification-evidence/SKILL.md) when defining
what a green check actually measured.

---

## Phase gates and human trust anchors

Long swarm runs benefit from **machine-checkable gates** between phases:

| Gate | Typical required inputs | Typical required outputs | Who closes |
| ---- | ----------------------- | ------------------------ | ---------- |
| Plan | Goal, constraints, KNOWN_ERRORS skim | Plan file, collision map | Human **Steer** or **Taste** |
| Implement | Approved plan, baseline counts | Code + evidence bundle | Reviewer / Verifier (not implementer) |
| Integrate | All slice PRs or commits | Merge-ready branch, updated docs | Conductor |
| Ship | Verify command you chose | Evidence + human **Test** | Human only |

**Human trust anchor:** a explicit human approval step before irreversible or wide-blast work —
for example `APPROVE P2` in your ops docs, or a checkbox only the human may tick. The agent
**alerts, recommends, and asks**; it does not invent approval. See
[Human Use ownership](../human-use/OWNERSHIP.md).

Wave or packet scheduling (limited inputs per wave) reduces cross-slice coupling; name what each
wave may read and write, not just what it should build.

---

## Thin always-on context and role cards

Swarm failure often comes from **context bloat**: every worker loads the full brief, the full
canon, and every rule. DevEnvTemplate's answer applies here too:

| Layer | Load | Holds |
| ----- | ---- | ----- |
| **`AGENTS.md`** | Always | ~20 lines of facts: stack, commands, layout, conventions. |
| **Skills** | On demand | Procedures when `description` matches the task. |
| **Glob rules** | On file touch | Stack-specific guidance. |
| **`.cursor/agents/*.md`** | On invoke | Role cards for subagents (planner, explorer, verifier). |

**Role cards** (`.cursor/agents/`) are thin prompts for specialized subagents. Keep them focused;
put swarm-wide procedure in this guide or an opted-in extras skill, not in every card.

Do not copy full research briefs, game canon, or phase boards into `AGENTS.md`. Link to on-disk
artifacts instead. [token-efficient-context](../../.agents/skills/token-efficient-context/SKILL.md)
covers budgeting always-on text.

Optional: copy [multi-agent-swarm](../../.agents/skills-extras/multi-agent-swarm/SKILL.md) from
extras into `.agents/skills/` when you run swarms regularly.

---

## WIP limit: ~3–5 parallel non-overlapping owners

AppxLab's multi-agent coding workflow notes a practical ceiling: beyond roughly **three to five
parallel writers**, review and merge friction eats the speed gain.

Operational definition for this template:

- **Parallel** means simultaneous writers, not simultaneous readers.
- **Non-overlapping** means disjoint path sets on the collision map.
- If you need more slices, **queue** them or add **worktree isolation** (below) — do not increase
  overlap.

The conductor tracks WIP explicitly (a short table in the handoff or phase board is enough).

---

## Worktree isolation for parallel writers

When slices truly parallelize, **prefer separate git worktrees or clones** over one shared
checkout. Cursor documents worktrees for parallel agents; Zach Wills' rules treat isolation as
non-optional at scale.

| Mode | Use when |
| ---- | -------- |
| **Shared checkout** | Sequential slices, or read-only parallel exploration. |
| **Worktree per worker** | Parallel writers, each with exclusive paths. |
| **Branch per worker + conductor merge** | Parallel work with integrator-owned merge. |

Workers in isolated worktrees may push their own branches; workers in a **shared** tree should
not push or rebase. See [Cursor worktrees](https://cursor.com/docs/configuration/worktrees).

For exclusive *resources* (browser, emulator, fixed port), also see
[exclusive-resource-access](../../.agents/skills-extras/exclusive-resource-access/SKILL.md).

---

## Kill criteria

Stop or rescope instead of looping. AppxLab and BridgeSwarm both emphasize explicit abort conditions.

**Abort or return to conductor when:**

- The same test or verify step fails **twice** with the same error after a substantive fix attempt.
- The worker needs a path outside the collision map.
- The slice exceeds its scope (new feature creep, unrelated refactors).
- Evidence cannot be produced (missing tooling, blocked resource, flaky hang with no bounded timeout).
- A shared tool was modified mid-flight by another agent (see multi-agent-collaboration).

**On abort:** write what was tried, the error, and recommended next steps to a durable file
(`docs/KNOWN_ERRORS.md` if it will recur; handoff artifact otherwise). Do not leave state only in
chat.

---

## Mapping to DevEnvTemplate layers

This guide is a **menu layer** — adopt without the doctor or Node toolchain.

| DevEnvTemplate layer | Swarm use |
| -------------------- | --------- |
| **[Human Use](../human-use/OWNERSHIP.md)** | Human steers topology and trust anchors; makes taste calls; owns Test / ship. Agents execute slices and ask when a human job is missing. |
| **`docs/KNOWN_ERRORS.md`** | Append expensive or recurring swarm failures (collision, hang, false-green verify). Workers skim before planning. |
| **`docs/operational/automation-gaps.md`** | Record what gates cannot be automated (manual editor steps, hardware, flaky CI). |
| **`AGENTS.md` shape** | Facts only. Point to this guide and your handoff path; do not duplicate the full swarm playbook always-on. |
| **Core skill [multi-agent-collaboration](../../.agents/skills/multi-agent-collaboration/SKILL.md)** | Shared-checkout rules: ownership, staging, push/rebase, baselines. |
| **Extras skill [multi-agent-swarm](../../.agents/skills-extras/multi-agent-swarm/SKILL.md)** | Opt-in trigger for conductor/worker work; body defers here. |
| **`.cursor/agents/`** | Role cards for subagents; keep thin. |
| **Verification pattern** | Evidence contracts per slice; independent reviewer; human Test anchor. |

Copy checklist for files-only adoption: add this guide and optionally the extras skill to the
list in [SETUP-GUIDE](../SETUP-GUIDE.md#files-only-adoption-agent-and-docs-layers).

---

## Consumer example: HomeWorld (shape only)

[HomeWorld](https://github.com/XylarDark/HomeWorld) is a consumer that runs a **conductor-led
lookdev swarm** across Unreal Engine and Blender-first workflows. It is an example of **shape**,
not something to copy wholesale into your repo.

Patterns it aligns with (no game IP or required phase names):

- Conductor plus **exclusive owners** per slice.
- On-disk **phase board** and **handoff template** instead of chat memory.
- QA / reviewer **cannot close** a phase the implementer opened.
- Human **`APPROVE Pn`** gates before wide-blast automation.
- **Wave packets** with limited inputs per wave.

Your project might use different filenames and zero game content. Take the topology and evidence
discipline; write your own ops paths and gates.

---

## Quick adoption checklist

- [ ] Decide if multi-agent beats single-agent for this goal (see [When to use](#when-to-use-a-swarm-and-when-not)).
- [ ] Name a conductor and publish a collision map before parallel edits.
- [ ] Use handoff artifacts with evidence contracts; implementer does not self-approve.
- [ ] Keep `AGENTS.md` thin; use skills, rules, and `.cursor/agents/` on demand.
- [ ] Cap parallel writers at ~3–5 non-overlapping owners; queue or worktree beyond that.
- [ ] Prefer worktrees when parallel writers cannot share a checkout safely.
- [ ] Define kill criteria and write aborts to `KNOWN_ERRORS` or the handoff file.
- [ ] Wire Human Use trust anchors for irreversible steps.
- [ ] Optionally opt in to [multi-agent-swarm](../../.agents/skills-extras/multi-agent-swarm/SKILL.md) skill.

---

## Related

- [multi-agent-collaboration skill](../../.agents/skills/multi-agent-collaboration/SKILL.md)
- [Human Use ownership](../human-use/OWNERSHIP.md)
- [Cursor plan integration](cursor-plan-integration.md)
- [verification-evidence skill](../../.agents/skills/verification-evidence/SKILL.md)
- [SETUP-GUIDE — files-only adoption](../SETUP-GUIDE.md#files-only-adoption-agent-and-docs-layers)
- [Adopt it in layers](../../README.md#adopt-it-in-layers)

---

## Sources

Research and industry references cited in this guide (September 2026):

- AppxLab — [Multi-agent AI coding workflow](https://blog.appxlab.io/2026/04/06/multi-agent-ai-coding-workflow/) (WIP limits, kill criteria)
- BridgeMind — [BridgeSwarm multi-agent coding team](https://www.bridgemind.ai/blog/bridgeswarm-multi-agent-coding-team)
- Zach Wills — [I managed a swarm of 20 AI agents for a week](https://zachwills.net/i-managed-a-swarm-of-20-ai-agents-for-a-week-here-are-the-8-rules-i-learned/) (durable plans, worktree isolation)
- dsh-swarm — [GitHub: joekytc/dsh-swarm](https://github.com/joekytc/dsh-swarm) (evidence contracts)
- DeepSim — [DS-EO governance framework for multi-agent AI software engineering](https://press.deepsim.ca/ds-eo-a-governance-framework-for-multi-agent-ai-software-engineering/) (five-gate governance)
- Cursor — [Subagents](https://cursor.com/docs/subagents.md)
- Cursor — [Worktrees](https://cursor.com/docs/configuration/worktrees)
- Anthropic — [Multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)
- Anthropic — [Building multi-agent systems: when and how](https://claude.com/blog/building-multi-agent-systems-when-and-how-to-use-them)
- Claude — [Managed agents: multi-agent orchestration](https://platform.claude.com/docs/en/managed-agents/multiagent-orchestration)
- CodersEra — [AGENTS.md vs CLAUDE.md vs Cursor rules (2026)](https://codersera.com/blog/agents-md-vs-claude-md-vs-cursor-rules-comparison-2026/) (thin always-on context)
- DevEnvTemplate — `AGENTS.md`, Human Use, KNOWN_ERRORS, automation-gaps (this repository)
