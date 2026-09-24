# Architecture trade-offs

There is no best design for a novel boundary. The product of an architecture choice is a named, least-worst trade-off written down.

**Standing prompt (paste later):** [tradeoff-analyst-brief.md](tradeoff-analyst-brief.md).  
**Skill (opt-in):** `.agents/skills-extras/architecture-tradeoffs`.  
**Inside a quantum:** [design-complexity.md](design-complexity.md).  
**Records:** [docs/adr/](../adr/).

## When to run the protocol

Service or module boundary, data ownership, reuse (copy vs library vs shared service), or a workflow that crosses a deploy boundary. Skip it for a typo or a one-file change inside an already decided quantum.

## What this harness already decided

| Decision | Least-worst | Giving up |
|----------|-------------|-----------|
| DevHarness is a **menu of layers**, not one product the host must take whole | Agent context, operational memory, and the doctor adopt independently ([overview](overview.md)) | Hosts can drift; sync does not overwrite their `AGENTS.md` |
| Domain logic stays in the host; the harness reuses **operational** capability (doctor, skills, logs) | Sidecar-style ops, not a domain service | No shared game or business model in this repo |
| ADRs live under `docs/adr/` | Written reversal triggers (see ADR 001, 002) | Undocumented choices are not decisions |

Do not add microservices, sagas, or a data mesh to the doctor. Those are host problems. If a host needs them, run the brief and record an ADR in **that** repo.

## Fitness already in force

- Skill portability test: a shipped skill must not name a host-only command in its `description`.
- Sync never copies host `AGENTS.md` or MCP configs ([sync-layers.json](../../config/sync-layers.json)).
