# Automation harness (portable practices)

Stack-agnostic habits for prove scripts, capture pipelines, and agent verification. Upstream
from HomeWorld prove work (2026-09); applicable to any host that opts into the extras skills.

**Skills (opt in):** [automation-standards](../../.agents/skills-extras/automation-standards/SKILL.md),
[testing-standards](../../.agents/skills-extras/testing-standards/SKILL.md).

**Human Use:** [harness-engineering.md](../human-use/cursor-cannot/harness-engineering.md) (Test job),
[test-contract.md](../human-use/test-contract.md) (acceptance).

---

## 1. Lead-correction → harness

When Lead corrects a **proven** false PASS/FAIL, encode it immediately: gate, threshold, or
policy row — not chat-only memory. Always-on text stays **Cause → Avoid** one-liners; detail in
[KNOWN_ERRORS.md](../KNOWN_ERRORS.md).

## 2. Token-lean KNOWN_ERRORS

See the **Policy** section at the top of [KNOWN_ERRORS.md](../KNOWN_ERRORS.md). Never paste
episode dumps into always-on rules or agent profile memory.

## 3. Testing preconditions

Before Act/capture/run:

1. Required content/assets present.
2. Focus/camera/aim on that content (when visual).
3. Environment gates match intent — record in the report.
4. Then inspect output.

No **closed_fail** from empty/black output without setup evidence.

## 4. Arrange before Act

Preflight returns `ready: true/false` and blocks Act when false. Exempt modules document
**Harness exempt** + rationale in code or doc tables.

## 5. Three-state outcomes

| State | Meaning |
| ----- | ------- |
| `pass` | Preconditions + asserts satisfied. |
| `soft_fail` | Harness OK; human visual/taste stamp still required. |
| `closed_fail` | Precondition miss or hard assert failure. |

## 6. Metric ≠ visual

Checksums, luminance, pixel %, file size, and screenshots prove the **pipeline** ran. Framing,
composition, and taste need human stamp (or [taste-gates](../human-use/taste-gates.md)).

## 7. Universal tooling gap ladder

1. Docs-first (vendor, pinned version).
2. Proven-results (patterns that already work).
3. Rung-1 harden (built-ins, in-repo tools).
4. Dead-end research + [automation-gaps.md](../operational/automation-gaps.md).
5. Lead gates: `APPROVE TOOL SCOUT` / `APPROVE TOOL BUILD` — **no auto-install**.

Preference order for *how* to automate (API → config → scripts → GUI) remains in
automation-standards.

## 8. Industry harness patterns

- **Fixture lifecycle** — reseed/inventory/teardown; stamp in reports.
- **Latent waits** — budgets; miss → soft_fail or closed_fail.
- **Readiness probe** — blocked reason before Act, not mid-run crash.
- **Artifact stamps** — paths + mtimes/hashes; fresh-prove purge only at prove start.

---

## Related

- [verification-evidence](../../.agents/skills/verification-evidence/SKILL.md) — checks that pass while measuring nothing.
- [exclusive-resource-access](../../.agents/skills-extras/exclusive-resource-access/SKILL.md) — single-instance resources and bounded waits.
