---
name: multi-agent-swarm
description: Use when coordinating a conductor-led multi-agent swarm — orchestrator–worker topology, exclusive file ownership, durable handoffs, phase gates, WIP limits, worktree isolation, or kill criteria for parallel agent work.
---

# Multi-agent swarm

Procedures for **conductor-led swarms** — one orchestrator decomposes work, assigns bounded slices
to workers, and synthesizes results. Not for casual two-agent edits in one checkout; for that, use
[multi-agent-collaboration](../../skills/multi-agent-collaboration/SKILL.md) first.

**Canonical guide:** [docs/guides/multi-agent-swarm.md](../../../docs/guides/multi-agent-swarm.md).
Read it before running or joining a swarm. This skill is a pointer and checklist, not a duplicate
of the full playbook.

## Before you start

1. Confirm multi-agent is worth the coordination cost (context pollution, parallelism, or
   specialization — otherwise one agent with a plan wins).
2. Publish a **collision map**: one writer per path; overlap → sequence, not parallel.
3. Write a **handoff artifact** on disk (goal, owner, allowed paths, inputs, outputs, evidence,
   baseline, kill criteria). The next session reads files, not chat.
4. Name **human trust anchors** for irreversible steps ([Human Use ownership](../../../docs/human-use/OWNERSHIP.md)).

## While running

- **Conductor** fans out via isolated subagents; **one level of delegation** (no nested planners).
- **Workers** stage explicit paths only; never `git add -A`; do not commit others' edits.
- **WIP ~3–5** parallel non-overlapping writers; queue or add worktrees beyond that.
- **Implementer does not self-approve** — reviewer, verifier subagent, or human Test closes gates.
- **Shared checkout:** workers do not push or rebase; prefer worktrees for parallel writers.
- **Abort** on repeated same failure, out-of-scope paths, or stuck loops; record in
  `docs/KNOWN_ERRORS.md` or the handoff file.

## DevEnvTemplate layers to wire

| Layer | Use |
| ----- | --- |
| [multi-agent-swarm guide](../../../docs/guides/multi-agent-swarm.md) | Full patterns and sources |
| [multi-agent-collaboration](../../skills/multi-agent-collaboration/SKILL.md) | Shared-tree safety |
| [verification-evidence](../../skills/verification-evidence/SKILL.md) | Evidence contracts |
| [Human Use](../../../docs/human-use/OWNERSHIP.md) | Steer / taste / test; APPROVE gates |
| `docs/KNOWN_ERRORS.md` | Recurring swarm failures |
| `docs/operational/automation-gaps.md` | Ungateable steps |

## Checklist

- [ ] Swarm justified; collision map published
- [ ] Handoff artifact on disk with evidence contract
- [ ] Parallel writers ≤ ~5, paths non-overlapping
- [ ] Worktrees if parallel writers share risky surface area
- [ ] Independent review before phase close
- [ ] Kill criteria defined; aborts written durably
