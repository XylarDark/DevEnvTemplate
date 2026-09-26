---
name: design-complexity
description: Use when designing or changing a module, public API, class split, or error policy inside a boundary that is already chosen - keep the interface small and the next change obvious; do not add shallow wrappers.
---

# Design complexity

**Subset of A–E:** prefer [architecture-trade-offs-design-depth](../architecture-trade-offs-design-depth/SKILL.md) when Layers C–E matter. Do not load this lean skill together with full A–E.

Working code is not the goal. A design that stays obvious under change is the goal.

**Brief:** [design-complexity-brief.md](../../../docs/architecture/design-complexity-brief.md)  
**Defaults:** [design-complexity.md](../../../docs/architecture/design-complexity.md)  
**Quanta (run first):** [architecture-tradeoffs](../architecture-tradeoffs/SKILL.md)

> **Localize on copy.** Hosts keep their own module map. Do not ban an engine’s required inheritance. Do not invent an error taxonomy or a comment rewrite the product did not ask for.

## When to load

A non-trivial module, API, class split, or error policy inside a quantum that is already decided.

Do not load to choose a service boundary, and do not load for a typo.

## Procedure

1. Name the knowledge this module hides.
2. Name the symptom (change amplification, cognitive load, unknown unknowns) and the cause (dependency or obscurity).
3. Depth test: common case is one obvious call with defaults. List what the caller must still know.
4. Leakage test: which secrets (formats, invariants, order, error codes) appear in more than one module?
5. Together or apart: merge when they share knowledge; split only when the knowledge is unrelated.
6. Which errors and special cases can be a normal result, masked inside, or aggregated? Do not swallow real data loss.
7. State two designs. Pick the one with the smaller interface and the cheaper future change.
8. Draft the interface comment before the body. If it is long or full of exceptions, redesign.
9. Name the small investment now, and the check that stops a tactical pile-on later.

## Refuse

- “Just make it work” with the accepted complexity left unnamed.
- Pass-through methods, classitis, and configuration that exists only in case.
- Comments that repeat the code.
- A new exception that exists only because the API was drawn too tightly.
- TDD, SRP slogans, or pattern names as a substitute for a depth argument.
- A second local style in a file that already has one.