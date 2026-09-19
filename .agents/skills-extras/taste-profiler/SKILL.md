---
name: taste-profiler
description: Use when bootstrapping or updating a durable taste profile, staging session preference candidates, or promoting Lead-confirmed taste into versioned human-use docs - never auto-consolidate or invent product feel.
---

# Taste Profiler

Maintain a durable taste profile and session candidates. Bootstrap → stage → promote (human-gated). Never invent product feel.

**Canon:** [taste-profiler.md](../../../docs/human-use/taste-profiler.md) · [taste-profile.md](../../../docs/human-use/taste-profile.md) · [OWNERSHIP.md](../../../docs/human-use/OWNERSHIP.md)

## When to load

- First-time or empty profile sections that need human bootstrap
- After a Taste Gate answer that should become durable
- Explicit ask to update process prefs
- Prove / dry-run promote path

**Do not load** to invent feel, replace a product art bible, or auto-consolidate chat into the profile.

> **Localize on copy.** Hosts may keep a product track (e.g. HomeWorld `Docs/29_TASTE_PROFILER.md`). Prefer that when present.

## Procedures

### Bootstrap (max 2 Q/turn)

1. Read `docs/human-use/taste-profile.md`.
2. Ask at most **2** questions (A/B/Skip).
3. Put drafts in the OWNERSHIP alert; scribe only after confirm.
4. Seed canon pointers and do-not from existing host canon — do not invent new product targets.

### Stage candidate

Append or update a gitignored session file (host path, e.g. `Saved/taste_profile_session.json`):

```json
{
  "candidates": [
    {
      "id": "TP-CAND-001",
      "created": "YYYY-MM-DD",
      "source": "taste-gate|chat|APPROVE",
      "text": "one-line candidate",
      "status": "staged"
    }
  ]
}
```

Idempotent on `id`. Status: `staged` | `rejected` | `promoted`.

### Promote (human-gated)

Only after human confirm, explicit “promote”, or host approve phrase:

1. Write the confirmed line into the right section of `taste-profile.md`.
2. Set candidate `status` to `promoted` (or `rejected`).
3. Update **Last promoted** on the profile.

### Refuse

- Auto-promote from logs or Cursor Memories
- Duplicate product palette sheets into the profile
- Open a product track without human name or Taste Gate

## With Taste Gates

When [taste-gate](../taste-gate/SKILL.md) fires, stage a candidate stub. After the human answers, run **Promote** (or reject) before resuming agent work.
