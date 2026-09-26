---
name: architecture-tradeoffs
description: Use when choosing a module or service boundary, data ownership, reuse across deploy units, or a workflow that crosses a boundary - name the least-worst trade-off and record it; do not recommend a fashionable pattern.
---

# Architecture trade-offs

**Subset of A–E:** prefer [architecture-trade-offs-design-depth](../architecture-trade-offs-design-depth/SKILL.md) when Layers C–E matter. Do not load this lean skill together with full A–E.

There is no best design. Produce the least-worst option, name what it costs, and write it down.

**Brief:** [tradeoff-analyst-brief.md](../../../docs/architecture/tradeoff-analyst-brief.md)  
**Harness defaults:** [tradeoffs.md](../../../docs/architecture/tradeoffs.md)  
**ADRs:** `docs/adr/`

> **Localize on copy.** Hosts keep their own quantum map. Do not invent characteristics the product vision did not ask for. If a driver is missing, ask and stop.

## When to load

A non-trivial boundary: what deploys independently, who writes a data set, copy vs shared library vs shared service, or coordination across processes.

Do not load for a typo, a one-file edit inside a settled boundary, or to propose microservices, events, or sagas as a default.

## Procedure

1. Name the decision in one sentence.
2. Rank only the architecture characteristics the product already requires.
3. State the quantum: independently deployable, cohesive, static coupling inside the boundary. Shared database or shared schema means one quantum.
4. List disintegrators vs integrators. If integrators win, keep it coarser.
5. If a workflow crosses a quantum, name communication, consistency, and coordination together. Do not pick them as separate knobs.
6. Compare a MECE option set. Recommend the least-worst option and the downsides you accept.
7. Draft an ADR (context, decision, alternatives, trade-offs, reversal trigger). Add a fitness check only where the boundary can silently regress.
8. Leave open any consistency, money, legal, or SLA question the business has not answered.

Once the quantum is fixed, design the code inside it with the [design-complexity](../design-complexity/SKILL.md) skill. Do not use this skill to split classes.