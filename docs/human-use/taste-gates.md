# Taste Gates

Continuous development: the agent is always either doing **executable work** or holding a **structured taste ask**—never inventing feel, never idle with no next question.

**Skill (opt-in):** [.agents/skills-extras/taste-gate/SKILL.md](../../.agents/skills-extras/taste-gate/SKILL.md) — copy into `.agents/skills/` to load.  
**Alert shape:** [OWNERSHIP.md](OWNERSHIP.md) · detectors: [CYCLE.md](CYCLE.md)

## How this relates to steer / taste / test

| Job | Taste Gate role |
|-----|-----------------|
| **Taste** | Primary — purpose, vision, map, patterns, “is this the product,” art feel |
| **Steer** | Only if the fork is harness/skill/MCP allowlist (still use OWNERSHIP alert; may not need a durable gate file) |
| **Test** | Rubric / ship gates stay Test; do not launder Test as Taste |

## What you see

1. An OWNERSHIP alert with Job **taste** and numbered options (max **2** questions per turn).
2. A durable handoff (host path, often `Docs/handoffs/TASTE_GATE_*.md` or `docs/handoffs/…`).
3. Optional machine queue (often gitignored), e.g. `Saved/taste_gates_pending.json`.

Answer in chat (pick options) or with the host’s approve phrase. The agent scribes and continues.

## What the agent must not do

- Invent the decision to keep moving
- Start a new product track while the board says next TBD without a gate
- Auto-approve taste

## Host product tracks

Hosts may stamp a product doc that proves the harness (e.g. HomeWorld `Docs/28_TASTE_GATES.md`). After that track closes, keep using this page + the skill; do not reopen the prove track to invent new product feel.
