# ADR 002: remove the agent secret-scan hook

- **Status:** Accepted
- **Date:** 2026-09-08
- **Supersedes:** [ADR 001](001-agent-hook-failure-posture.md)
- **Applies to:** `.cursor/hooks.json`, `.cursor/hooks/secret-scan.cjs`, and the two
  projects that copied them

## Context

[ADR 001](001-agent-hook-failure-posture.md) settled the hook's failure posture at
fail-open, because fail-closed was unusable: Cursor intermittently discarded hook
output above roughly 1.4KB, and under `failClosed` every such flake blocked an
ordinary file read. That decision was correct given the constraint, but it changed
what the control was worth.

A fail-open scanner does not prevent exfiltration. It denies a secret read when its
output happens to be delivered, and silently allows it otherwise. An attacker does
not need to defeat it; they need to be unlucky enough to trip it. What remained was
an audit log — a record, after the fact, of reads that were allowed anyway.

Against that, the running costs were concrete:

- It executed on **every file read and every shell command** in the editor.
- It cost several days of debugging spread across four distinct defects, all recorded
  in `docs/KNOWN_ERRORS.md`: a missing trailing newline that made Cursor discard the
  decision, an unbounded regex that blocked a legitimate `git commit`, a scanner that
  denied reads of its own test file, and a `.js` extension that crashed on load in an
  ESM host project.
- Every host project that copied the agent layer inherited all of it, including the
  ESM crash, which is how the KindlingGame copy was discovered.
- It needed two dedicated test files and an entry in the automation-gap register to
  explain why its headline feature was switched off.

## Decision

Remove the hook, its configuration, its tests, and its documentation from the
template and from both host projects.

Secret protection now rests on the controls that do not depend on an editor hook
firing correctly:

- `.gitignore` excludes `.env` and `.env.*`; only `.env.example` is ever tracked, and
  it carries placeholders.
- `gitleaks` runs in CI on every push and pull request, which catches a committed
  secret regardless of how it got there.
- `npm audit --audit-level=high` and `npm audit signatures` gate the dependency
  supply chain.
- The `secure-coding` skill and the security baseline in `AGENTS.md` state the rules
  an agent is expected to follow.

## Consequences

**What is lost.** There is no longer a pre-read block on `.env` files. An agent that
reads a secret and posts it in the same session is not stopped at the read. The
mitigation is that CI catches the _commit_, which is the step that makes a leak
durable and shareable; a leak confined to one session's context is bounded by that
session.

**What is gained.** Nothing runs on every file read. Three repositories drop a
vendored CommonJS script, a config file whose most important field had to be
explained in an ADR, two test files, and an automation-gap entry. The security story
is now four controls that are all verifiable from CI output, rather than five where
one was documented as unreliable.

**When to revisit.** If Cursor fixes the output-delivery defect described in ADR 001,
a fail-_closed_ hook becomes a real control rather than a logger, and the trade-off
changes. Reintroducing it then means restoring the bounded regexes and the
content-scan exemptions from git history — the defects in `docs/KNOWN_ERRORS.md` are
the specification for that work, not a list of things to rediscover.
