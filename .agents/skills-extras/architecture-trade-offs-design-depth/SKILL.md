---
name: Architecture Trade-Offs + Design Depth
description: >-
  Use for HomeWorld / Co architecture and design work — Layers A–E (Hard Parts,
  Ousterhout, DDIA, Team Topologies, Release It!). Load before Design handoffs,
  Implement PRs, Fix roots, or reviews that change boundaries, module APIs,
  data/replication, team ownership, or integration points.
---
# Architecture Trade-Offs + Design Depth

Canonical DevHarness / host harness for design, code generation, review, and refactor.
Sources (one line): Hard Parts (Ford et al.); Ousterhout; DDIA (Kleppmann); Team Topologies; Release It! (Nygard); tight extracts DDD/SRE/Khorikov/Feathers.

**Load this skill** on any non-trivial design, Implement PR, Fix root, or Test schema change. Host AGENTS.md must point here. Do not fork a second copy. Lean A/B-only extras (`architecture-tradeoffs`, `design-complexity`) remain optional; this file is the A–E canon.

You have five stacked layers. A and B are always in play; C/D/E never replace A/B. Never swap A↔B.

## LAYER A — SYSTEM (Hard Parts)

Decide where the quanta are: service boundaries, data ownership, communication, consistency, coordination, contracts. Produce the least-worst set of trade-offs, named and recorded.

## LAYER B — MODULE (Ousterhout)

Inside each quantum, keep complexity from compounding. Produce deep modules with simple interfaces, hidden knowledge, defined-away errors, and obvious code.

## LAYER C — DATA (DDIA)

When data is copied, split, or derived: name load parameters, replication, read guarantees, partition keys, and source-vs-derived. Precision over slogans.

## LAYER D — TEAM / FLOW (Team Topologies)

A quantum no stream-aligned team can hold fails. Name owning team type, interaction mode, and team API when another team consumes it.

## LAYER E — STABILITY (Release It!)

Every integration point needs timeout, bounds, and a degrade path. No unbounded caches/queues/retries.

## Core laws

- There are no best practices for novel architecture problems. Every decision is a trade-off. Strive for the least-worst combination, not an ideal design.
- Complexity is anything about structure that makes the system hard to understand or modify. It arrives incrementally. Zero-tolerance.
- Working code is not enough. A design that stays obvious under change is the goal.
- Static coupling defines the deployable unit. Dynamic coupling defines runtime pain. Interface size is the cost a module imposes on everyone else.
- If it is not written (ADR, interface comment, consistency rule), it is not a decision.

## When to apply which layer

| Situation | Primary | Secondary |
|---|---|---|
| New service, split, merge, shared DB, workflow, contract, reuse | A | B (is the service interface deep or a distributed shallow wrapper?) |
| New class, package, API, error policy, refactor inside one deployable unit | B | A (are you leaking across a quantum?) |
| PR review / generated patch | both via 15-question checklist | — |
| Incident, demo, hard deadline | name tactical debt, isolate, schedule strategic cleanup | — |
| AI-generated code | assume tactical until proven deep and bounded | reject shallow wrappers / silent coupling |
| Replication, isolation, partition key, linearizability, derived data, clocks | C | A+B still apply |
| Who owns this?, team API, platform vs stream, quantum too big for one team | D | A+B still apply |
| Timeouts, retries, pools, queues, caches without bounds, integration failure | E | A+B still apply |

If you are about to generate code and have not named the quantum, the hidden knowledge, and the interface comment, **stop** and do that first.

---

## LAYER A — SYSTEM detail

### First questions before proposing structure

1. Which architecture characteristics actually matter? Rank them. They oppose each other (scale, elasticity, availability, performance, security, testability, deployability, observability, integrity, cost, cognitive load).
2. What is the unit of independent deployment? That is the architectural quantum.
3. Where is the coupling: static (build, schema, shared lib, shared DB) vs dynamic (calls, events, consistency, coordination) vs semantic (shared unspoken meaning)?
4. Are we pulling something apart, or putting something back together because we over-split?

### Quantum

Smallest part that can be independently deployed and evolved while keeping integrity. Traits: independently deployable, high functional cohesion, high static coupling kept **inside** the boundary.
If two “services” share a database, they are one quantum wearing two hats. Say so.
Coupling: two parts are coupled if a change in one might force a change in the other (afferent/efferent; static/dynamic/semantic).

### Decomposition

Do not jump to fine-grained microservices.
1. Measure whether the current system is decomposable.
2. Prefer an intermediate service-based step: coarser domain services, often still a shared DB.
3. Only then split data and shrink services where drivers justify it.
Patterns: component-based decomposition, tactical forking, Strangler Fig, Parallel Run. Incremental over rewrite.
Enforce boundaries with fitness functions (namespaces, deps, schema ownership, forbidden call edges).

### Granularity — disintegrators vs integrators

**Disintegrators** (split): unrelated scope, different volatility, uneven scale, fault isolation, security/compliance, independent extension.
**Integrators** (merge): ACID necessity, data that cannot be split, tight coordination, shared code that would create a distributed monolith, operational cost exceeding benefit.
If an ACID transaction is required across two proposed services, merge them, accept eventual consistency with compensation, or stop pretending they are independent.

### Data

Splitting code without splitting data usually creates a distributed monolith.
One writer / one owner per data set. Others read via the owner’s contract, a replica, or a cache — each with an explicit consistency delay.
Never leave two services writing the same table.
If data is read across a boundary, name the freshness window. “Eventually consistent” with no bound is not a decision.
Do not silently overload operational stores for analytics.

### Reuse — none free

Copy (drift). Shared library (version coupling). Shared service (latency/availability coupling). Sidecar/mesh for operational cross-cuts only, not domain logic.
Prefer reuse of operational capability over reuse of domain logic across quanta.

### The 3Cs are not independent knobs

Communication: sync vs async. Consistency: atomic vs eventual. Coordination: orchestration vs choreography.
Change one and the other two move. Analyze as a triple.

### Sagas — name the species

| Name | Comm | Consistency | Coord |
|---|---|---|---|
| Epic | sync | atomic | orchestrated |
| Phone Tag | sync | atomic | choreographed |
| Fairy Tale | sync | eventual | orchestrated |
| Time Travel | sync | eventual | choreographed |
| Fantasy Fiction | async | atomic | orchestrated |
| Horror Story | async | atomic | choreographed (almost never least-worst) |
| Parallel | async | eventual | orchestrated |
| Anthology | async | eventual | choreographed |

Defaults: local ACID inside a quantum + compensating updates across quanta. Compensations are first-class (idempotent, observable, reversible-enough). Long-running sagas are explicit state machines. Never hide eventual consistency; name the user-visible anomaly.

### Contracts

Where distributed systems actually break. Spectrum: loose/tolerant reader → REST/GraphQL → strict (Avro/Protobuf/gRPC). Consumer-driven contracts when they reduce surprise.
Versioning and compatibility are architecture. Semantic coupling (“we all know what this event means”) is still coupling. Write it down.

### System protocol (non-trivial boundary, data split, workflow, contract, reuse)

1. Decision in one sentence.
2. Ranked characteristics.
3. Quantum + coupling map.
4. Disintegrators vs integrators.
5. 3C position + saga name if a workflow crosses quanta.
6. MECE options. No out-of-context factors.
7. Qualitative scores: coupling, consistency risk, ops complexity, cognitive load, deploy independence, responsiveness, scale, blast radius, later change cost.
8. Least-worst option, accepted downsides, reversal triggers.
9. ADR fragment.
10. Fitness functions.
11. Questions only the business can answer.

---

## LAYER B — MODULE detail

Complexity symptoms (rising): change amplification, cognitive load, unknown unknowns.
Causes: dependencies, obscurity.
Counters: make the system obvious; hide complexity behind deep modules.

### Strategic vs tactical

Tactical: get this task working now. Shortcuts are “just this once.”
Strategic: a great design that also happens to work. Invest ~10–20% of effort in design quality and small cleanups on every change.
When changing existing code, leave it as if this feature had been designed in from the start. Do not pile special cases on special cases.
Increments should be **abstractions**, not only features.

### Modules

Any unit with interface + implementation: function, class, package, service.
Interface = everything a caller must know, including informal knowledge (order, side effects, units, failure modes). If they must know it, it is part of the interface.

### Deep vs shallow

Width = interface cost. Area = functionality.
Deep: small simple interface, large hidden implementation.
Shallow: interface almost as complex as the implementation; you paid the cost and hid nothing.
Rule: simple interface matters more than simple implementation. Push pain onto the implementer, not every caller.
Red flags: classitis, shallow module, pass-through methods, pass-through variables, overexposure.

### Information hiding

Hide a piece of knowledge so only one module depends on it.
Leakage (same secret in multiple modules) is a merge signal.
Do not organize modules by operation order (temporal decomposition). Organize by knowledge.
Omitting the unimportant is abstraction. Omitting the important is obscurity.

### General-purpose modules are deeper

Implementation serves today; interface is not painted into today’s special case.
Separate general machinery from special-purpose policy.
Common case = one obvious call with good defaults. Every extra knob is interface complexity.

### Different layer, different abstraction

If layer N clones layer N-1, you copied; you did not abstract.
Wrappers/decorators only when they add a real new abstraction.

### Pull complexity downwards

Callers should not babysit internals. Handle awkward cases once inside the module.
Do not create a god object of unrelated knowledge.

### Together or apart

Merge when they share information, the combined interface is simpler, split created conjoined methods or shuttle state, or knowledge-split caused duplication.
Split when unrelated knowledge is tangled, volatility differs, or the combined interface is a junk drawer.
Do not split because “SRP says one reason to change” if the split shallows the interface. Extreme micro-method soup increases complexity.

### Errors

Exception handling is a major complexity source. Prefer, in order: define the error out of existence; mask inside the module when a reasonable default exists; aggregate many exceptions into one; abort when the caller cannot recover.
Do not swallow real loss. Silent data corruption is not simplicity.

### Design it twice

For any non-trivial interface, produce at least two seriously different designs. Compare interface size, special cases, leakage, future-feature landing cost. Pick the cleaner one.

### Comments, names, consistency, obviousness

Comments complete the abstraction. Write interface comments before the body.
Comments describe what is not obvious from the code. If someone could write the comment from the adjacent code alone, delete it.
Interface comments = contract. Implementation comments = what and why, not a narration of how.
If the comment is long, hedged, or full of “except when…”, redesign the abstraction.
Names: precise, unambiguous, consistent. Vague names (data, info, manager, process, flag, temp, helper) are defects. If you cannot name it, the abstraction is wrong.
Consistency beats a locally clever alternative. Do not introduce a second way to do the same thing.
Code is designed for reading. Obvious = a reader’s first guess is correct without excavation.
If a reviewer says it is not obvious, it is not obvious.

### Trends — use selectively

Interface inheritance can abstract; implementation inheritance often leaks.
Agile incrementality is good; agile as permanent tactics is not.
Tests are necessary; coverage theater is not.
TDD as a design method tends to produce shallow feature-shaped APIs. Design the abstraction first. Tests-first are useful when reproducing a bug.
Patterns only when they reduce complexity.
Getters/setters that expose internals are leakage.
Measure performance; keep the fast path behind a deep interface.

### Module protocol (non-trivial module, API, split, error policy, in-quantum refactor)

1. Knowledge being hidden.
2. Complexity symptoms and causes.
3. Depth test of current vs proposed interface.
4. Leakage test.
5. Together or apart.
6. Errors/special cases defined away, masked, or aggregated.
7. Two designs.
8. Interface comment first.
9. Names required for obviousness.
10. Consistency impact.
11. Strategic investment vs later cost.

---

## Harness behavior

### Default output shape (design or non-trivial code changes)

1. Layer in play and why
2. Quantum map and hidden knowledge
3. Characteristics or complexity symptoms
4. Options (MECE at system level; ≥2 designs at module level)
5. Least-worst / deepest choice and what is given up
6. 3C + saga name if a workflow crosses quanta
7. Interface comment / contract draft
8. Error and consistency policy, including user-visible anomalies
9. ADR fragment + fitness functions
10. Code or diff that implements **that** design — not a shallower substitute

11. Layer C block if data copied/split/derived (replication, read guarantee, partition key, source vs derived)
12. Layer D block if ownership/team API in play (team type, interaction mode, team API)
13. Layer E block if network/pool/queue/cache in play (timeouts, bounds, degrade path)

Tiny local edits inside an already-deep module: skip the full writeup, but still refuse new leakage, new special cases, and comments that repeat identifiers.

### Generation rules

- Design the interface comment before generating the body.
- No new service, topic, table, or shared library without the system protocol.
- No forest of tiny classes or pass-through wrappers.
- No pass-through variables through layers that do not use them.
- No configuration knobs for hypothetical futures.
- No second way to do an existing thing.
- No “TODO: handle error later” as architecture.
- No distributed transactions by default.
- No shared DB across “independent” services without labeling them one quantum.
- Prefer one deeper module over three shallow ones.
- Prefer good defaults over flags.
- Prefer local ACID + compensation over Epic/Horror sagas.
- Prefer explicit contracts over implicit event meaning.

- No new remote call without timeout + retry budget + bulkhead decision.
- No new cache/queue without a bound and an eviction/rebuild story.
- No new replica/read-from-follower path without a named read guarantee.
- No new shared platform library/service without a team API and an interaction mode.
- No linearizability / 2PC / multi-leader by default.
- No unbounded retry loops.
- No wall-clock last-write-wins across nodes.
- Tests cover the contract and the failure/compensation path, not only the happy path. Tests must not dictate a shallow API.

### Refuse, and say why, when asked to

- “Just use microservices / Kafka / a saga” without named trade-offs
- “Just make it work” without naming accepted complexity
- Split services that still need shared ACID without choosing merge vs compensation
- Add a shared table writer
- Create classitis / SRP theater that shallows the interface
- Swallow failures silently
- Skip comments because “the code is self-documenting”
- Use TDD/SRP/pattern slogans as a substitute for a depth or trade-off argument

- CAP-as-answer (demand PACELC + the actual consistency word)
- “the platform team will figure it out” with no team API
- Retries as a substitute for timeouts and breakers
- A new bounded context that uses the same words with different meanings and does not say so

Empathy is a design skill. Design for the next reader, who is busy and does not share your context.

---

## 15-question review checklist

Answer yes / no / n/a with one sentence of evidence.
Any unanswered “no” blocks merge unless an ADR accepts it with a reversal trigger.

### SYSTEM

1. **Quantum:** can this change deploy independently without silently dragging another DB, library, or schema? If not, is the real quantum named?
2. **Integrators vs disintegrators:** if this splits or merges, are the forces listed? Is required cross-service ACID being ignored?
3. **Data ownership:** single writer? If data is read across a boundary, is the freshness window stated?
4. **3Cs:** if this crosses services, are communication, consistency, and coordination chosen together? Saga named? Compensation real?
5. **Contract:** is the new or changed contract explicit, or is meaning left implicit?

### MODULE

6. **Depth:** is the interface smaller and simpler than what it hides? Did we add a shallow wrapper or a tiny class that hides nothing?
7. **Leakage:** did a secret (format, invariant, ordering, status, shape) escape? Should these modules be together?
8. **Errors:** did we define an error/special case out of existence, or punt another exception to a helpless caller?
9. **Obviousness:** would a reader who does not live in this file guess correctly from names, interface comments, and structure?
10. **Strategic residue:** does this leave the code as if the feature had been designed in from the start? What check prevents regression?

### DATA / TEAM / STABILITY (C–E)

11. **Data physics:** if data is copied or split, are replication mode, read guarantee, and partition key named? Is derived data labeled with source + lag + rebuild?
12. **Consistency word:** is the strongest required guarantee stated in Kleppmann terms, not “eventual”?
13. **Team/flow:** can a single stream-aligned team hold this quantum? If another team consumes it, is the team API explicit and X-as-a-Service rather than permanent collaboration?
14. **Integration point:** does every new remote call have timeout, bound, and a degrade path? Are retries idempotent and budgeted?
15. **Steady state:** did we add an unbounded cache, queue, log, or retry? If yes, block.

---

## ADR fragment

```
Title:
Date:
Layer: system | module | both
Context:
Decision:
Alternatives considered:
Trade-offs accepted:
Quantum / hidden knowledge:
3C + saga (if any):
Consistency window / user-visible anomaly:
Interface contract:
Fitness functions / checklist items:
Reversal triggers:
Replication / partition / read guarantee:
Source of truth vs derived + lag:
Owning team type + interaction mode:
Integration points (timeout / breaker / bulkhead / retry budget):
SLI / SLO touched:
Seam / characterization tests (if legacy):
```

---

## One-line standards

Least-worst trade-offs at the boundary. Deep modules behind the boundary.
Shared DB = shared quantum.
The 3Cs move together. Name the saga.
Compensation is part of the design.
Simple interface over simple implementation.
Hide knowledge, not importance.
Define errors out of existence when you can; do not hide real loss.
Comments complete the abstraction. Write them first.
If it is not obvious, it is not done.
Unnamed debt is how complexity wins.

---

## ADDENDUM — LAYERS C–E detail (laws + bodies + tiny extracts)

THREE LAWS (quote when relevant, do not essay)

- Gall: a complex system that works evolved from a simple system that worked. Do not start from the distributed end-state.
- Hyrum: all observable behaviors of your system will be depended on by somebody. Implicit contract surface is still contract surface.
- PACELC: if Partitioned, choose Availability or Consistency; Else (normal operation) choose Latency or Consistency. CAP slogans are not a decision.

--------------------------------
LAYER C — DATA SYSTEMS PHYSICS (DDIA)
--------------------------------

Use precise words. “Eventual consistency” alone is illegal in an ADR.

Reliability ≠ presence of faults. Reliability = continuing to work correctly when faults happen.
Scalability = how the system behaves as load grows. Name the load parameter (QPS, working set, fan-out, write ratio), not “it should scale.”
Maintainability = operability + simplicity + evolvability. If a design is scalable but inoperable, it fails C.

Replication (copies of the same data)
- Single-leader: simple conflict story; failover and replication lag are the cost. Sync vs async is durability vs latency, not a style preference.
- Multi-leader: only when you have a real reason for multi-region writes. You must name conflict resolution (last-write-wins, merge, CRDT, human). LWW by default is data loss with a story.
- Leaderless / quorum: state N, W, R. W+R>N is the usual overlap rule. Sloppy quorum and hinted handoff weaken that guarantee; say so.

Replication lag is normal under async. Application-visible guarantees you may actually need — pick only what the business requires:
- Read-your-writes
- Monotonic reads
- Consistent prefix
Do not demand linearizability because it sounds strong.

Consistency vocabulary (use the strongest term that is actually required)
- Linearizable: there is a single real-time order. Expensive. Lost during some partitions. Only where lost updates are unacceptable (inventory, payments, uniqueness).
- Causal: respects happens-before. Cheaper than linearizable. Often enough.
- Eventual: replicas converge if writes stop. Not a freshness SLA. Bound it or reject it.
- Isolation level of a local DB (read committed / snapshot / serializable) is not the same thing as cross-service consistency. Do not mix the words.

Partitioning (sharding)
- Hash: even load, range queries suffer.
- Key-range: range queries work, hot keys appear.
- Secondary indexes are a second partitioning problem (local vs global). Name which one you chose.
- Cross-partition transactions are an integrator in Layer A. Treat them as such.

Transactions
- Local ACID inside one partition/quantum remains the default (already in A).
- 2PC/distributed commit: high coordination cost, availability cost, operational cost. Not a default. If you reach for it, you owe a Layer A integrator argument.
- Derived data (caches, search indexes, analytics projections, CDC consumers) is not the source of truth. Name the source, the projection, the lag, and the rebuild path.

Clocks
- Do not use wall-clock timestamps as a uniqueness or “last write” authority across nodes. Clocks drift. Use causality, versions, or a consensus order when order matters.

Layer C protocol extras (append to system protocol when data is in play)
- Load parameter and the bottleneck you expect first
- Replication mode + sync/async + conflict rule
- Required read guarantee (none / RYOW / monotonic / prefix / linearizable)
- Partition key and why it will not hotspot
- Source of truth vs derived data + rebuild
- What happens on leader death / partition / clock skew

--------------------------------
LAYER D — TEAM / FLOW (Team Topologies + DDD extract)
--------------------------------

A quantum that no team can hold in their head is a failed quantum. Team cognitive load is an architecture characteristic, not an HR concern.

Four team types (use to check ownership, not to redraw the org chart in every PR)
- Stream-aligned: owns a flow of value end-to-end. Default owner of a quantum.
- Platform: reduces cognitive load for stream teams via X-as-a-Service. Platform is a product with a team API.
- Enabling: temporary facilitation. Not a permanent owner of production flow.
- Complicated-subsystem: only when the specialty is real (hard math, protocol, compliance kernel). Not a dumping ground for leftovers.

Three interaction modes
- Collaboration: short, expensive, for discovery. Sustained collaboration means the boundary is wrong.
- X-as-a-Service: default after the boundary exists. Requires a real team API (how to use, how it fails, how to get support, compatibility).
- Facilitation: enabling team lifting a stream team. Time-boxed.

Conway: the system copies the communication structure. Inverse-Conway is allowed: change the intended team API first, then the software boundary. Do not draw microservices that no stream team will own.

Fracture planes worth splitting on (only with Layer A integrators checked): business domain, regulatory boundary, change cadence, risk, user persona. Technology fracture (“the Java team / the React team”) is usually a bad plane.

DDD extract (this much only)
- Bounded context ≈ candidate quantum + language boundary. A term that means two things in two contexts is a leak.
- Ubiquitous language lives in names, contracts, and interface comments. If the code uses a different word than the domain, that is obscurity (Layer B) and semantic coupling (Layer A).
- Do not install a full tactical DDD kit (mandatory repositories, aggregates-everywhere, hexagonal ceremony) unless it deepens a module. Ceremony that adds shallow wrappers fails Layer B.

Team API (required when a quantum is consumed by another team)
- What it does
- How to use the common case (one obvious path — Layer B)
- Failure modes and compatibility window (Hyrum + Layer A contracts)
- Who to talk to and how urgent work enters
If that API needs a meeting to use, it is not X-as-a-Service yet.

--------------------------------
LAYER E — PRODUCTION STABILITY (Release It!)
--------------------------------

Integration points are the number-one killer. Every network call, socket, RPC, query, and shared pool can hang. Design as if they will.

Anti-patterns — refuse to ship them unnamed
- Integration point without a timeout
- Cascading failure: one slow dependency exhausts threads/pools upstream
- Chain reaction: one node death overloads the rest
- Unbounded anything: caches, queues, retries, thread pools, log files
- Retry without jitter/backoff/budget (retry storms)
- Slow responses that hold resources while doing nothing useful

Patterns — required at every integration point unless an ADR waives them
- Timeout: connect and read, finite, smaller than the caller’s budget
- Circuit breaker or equivalent shed: stop calling what is already down; expose state
- Bulkhead: isolate pools/capacities so one dependency cannot take the process with it
- Fail fast: reject work you cannot finish before you queue it behind a timeout chain
- Backpressure / load shed: when overloaded, refuse or degrade; do not infinite-queue
- Steady state: bounded caches, bounded queues, rolled logs, purge paths. A system that needs a human to drain a disk is not steady
- Poison-message handling: a bad payload must not block the queue forever

Retries
- Retry only what is idempotent or explicitly deduplicated.
- Budget the retry: max attempts, deadline, jitter.
- Retry is not compensation. Compensation is Layer A.

Layer E protocol extras
- List integration points touched
- Timeout, bulkhead, retry budget, and degrade path for each
- What is bounded
- What the user sees when the dependency is down

--------------------------------
TINY EXTRACTS (do not grow these)
--------------------------------

SRE (measurable characteristics)
- An architecture characteristic that cannot be named as an SLI is a wish.
- SLO + error budget decide whether you ship features or pay down reliability. “Five nines” without a measurement plan is banned.
- Fitness functions should attach to SLIs where possible (latency percentile, freshness, error ratio, deploy frequency), not only to static coupling rules.

Khorikov (tests that do not wreck design)
- Test observable behavior and contracts, not private structure.
- A test that breaks when you refactor internals without changing behavior is a design smell in the test (and often a shallow module in the code).
- Prefer fewer tests against the module interface over many tests against every class you invented to implement it.
- Still no TDD-as-architecture (Layer B stands).

Feathers (legacy / no-harness code)
- Before changing untested code, find or create a seam and pin behavior with characterization tests.
- Do not “improve” a module you cannot yet run. First make a change possible, then make the design deeper.
