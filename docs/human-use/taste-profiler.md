# Taste Profiler

Durable human/process taste that **Taste Gates read first**, then stage and promote — never invent, never auto-consolidate.

**Skill (opt-in):** [.agents/skills-extras/taste-profiler/SKILL.md](../../.agents/skills-extras/taste-profiler/SKILL.md) — copy into `.agents/skills/` to load.  
**Durable store:** [taste-profile.md](taste-profile.md)  
**Gates:** [taste-gates.md](taste-gates.md) · [OWNERSHIP.md](OWNERSHIP.md)

## How it fits

| Piece | Job |
|-------|-----|
| **taste-profile.md** | Versioned summary (canon pointers, prefs, locked decisions, gaps, do-not) |
| **Session JSON** (often gitignored) | Staged candidates until human confirms |
| **taste-gate** | On limit: read profile → if covered, continue; else alert + queue + stage |
| **taste-profiler** | Bootstrap interview, stage, promote, refuse invent |

**Precedence:** latest human chat / approve phrase > durable profile > never invent.

## What you do

1. Answer Taste Gate or profiler questions (max 2/turn).
2. Confirm promote so the agent updates `taste-profile.md`.
3. Reject staged candidates that should not become durable.

## What the agent must not do

- Rewrite the durable profile without your confirm
- Treat Cursor Memories as team taste canon
- Duplicate a full art bible into the profile
- Invent the next product track because the profile is thin
