# ADR 001: the failure posture of the agent secret-scan hook

- **Status:** Accepted
- **Date:** 2026-09-08
- **Applies to:** `.cursor/hooks.json`, `.cursor/hooks/secret-scan.cjs`, and every
  project that copied them

## Context

This template ships a secret scanner wired to the editor's `beforeReadFile` and
`beforeShellExecution` hooks. It is the cheapest real mitigation for agent-driven
credential exfiltration: an agent that reads a `.env` and then posts it somewhere is
the documented attack, and blocking the read is more reliable than hoping the model
declines.

A hook has a **failure posture**: what happens when the hook itself crashes, times
out, or returns something unparsable — as distinct from what happens when it returns
a deny.

- **Fail-closed** (`failClosed: true`) treats hook failure as a deny. A broken
  control cannot become a silent bypass.
- **Fail-open** (`failClosed: false`, the editor's default) treats hook failure as
  an allow. The operation proceeds as though the hook had permitted it.

The template shipped **both answers at once**, which is what forced this decision.
`.cursor/hooks.json` sets `failClosed: false` and `docs/operational/automation-gaps.md`
explains why, while the scanner's own header comment stated that `failClosed: true`
"is what actually closes that hole". Both files were then copied into a downstream
project, so a consumer reading the script and a consumer reading the config reached
opposite conclusions about the recommended default. A security posture that depends
on which file you happened to open is not a posture.

## What each side is right about

**Fail-closed is correct in principle.** A control that silently stops working is
worse than no control, because it produces the confidence without the protection.
This is not hypothetical here: `.cursor/hooks.json` was once committed as
`{"version": 1, "hooks": {}}` after a debugging session. The scanner and its eighty
tests were present and passing, so every check looked healthy while nothing was being
scanned — for a week, and the empty config was copied downstream before anyone
noticed. Fail-open is exactly what made that invisible.

**Fail-open is correct in practice, for this hook, today.** Fail-closed was tried and
did not survive contact:

- The editor intermittently reports `Hook "..." returned no output` for payloads
  above roughly 1.4KB, while the hook's own audit log records a complete,
  newline-terminated write for that same invocation in 36–62ms. Under fail-closed,
  every one of those flakes blocks a file read or a shell command. `beforeReadFile`
  carries the entire file being read, so ordinary work trips it constantly and the
  editor becomes unusable.
- Four plausible causes were found and fixed along the way — partial writes, `EAGAIN`
  on a non-blocking pipe, a destroyed stdin, a missing trailing newline — and the
  flake survived all four. Forty-five direct invocations at 65B, 20KB and 164KB, in
  and out of a shell, never reproduced it.
- A fail-closed scanner can also lock you out of repairing it. Content scanning
  denied reads of the scanner's own test corpus, because a secret scanner's fixtures
  are necessarily full of credential-shaped strings. Recovering required editing the
  config the hook was blocking.

## Decision

**The template's default is `failClosed: false`, stated explicitly, and never
omitted.**

Three conditions make that defensible rather than merely convenient:

1. **The field is always written out.** `tests/unit/hooks-config.test.js` fails if
   `failClosed` is absent from any hook entry. Inheriting the editor's default
   silently is how a posture stops being a decision; the value may be either, but it
   must be a choice on the page.
2. **The wiring is asserted, not assumed.** The same test requires both events to be
   present and to point at an existing `.cjs` script. Tests on the scanner cannot
   catch an empty `hooks` object — the defect is in the wiring, not the script.
3. **Every invocation is logged.** `.devenv/hook-audit.log` records the event, the
   target, the decision, and how long it took. Under fail-open this is the only thing
   that distinguishes _"the hook denied nothing because there was nothing to deny"_
   from _"the hook never ran"_. Without the log, fail-open is unobservable and the
   decision below would not be available.

## What the losing side gives up

Fail-open accepts a specific, named failure: **when the hook crashes, times out, or
its output does not arrive, the operation is allowed**. A crash becomes an allow, and
nothing in the editor says so. If an attacker can reliably crash the hook, they have
disabled it; if a bug can, the control degrades to nothing at exactly the moment it
is under stress. This is a real loss and it is not fully mitigated — only made
visible after the fact, by the audit log, and only if someone reads it.

What is _not_ lost: the scanner still denies real secrets whenever its output is
delivered, which is the normal case. Fail-open weakens the guarantee under hook
failure, not the scanning itself.

Had we chosen fail-closed, the loss would have been the editor: a flake rate high
enough to block routine file reads, plus the recovery problem of a control that can
prevent its own repair.

## When to choose the other way

The default is not universal. Choose fail-closed when all of these hold:

| Condition                                             | Why it matters                                                                                                                                                 |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The hook transport is reliable on your editor version | This decision exists because it was not. Re-test before assuming.                                                                                              |
| The guarded event carries small payloads              | `beforeShellExecution` is far safer to fail closed than `beforeReadFile`, which carries whole files. The posture can differ per event.                         |
| A documented recovery path exists                     | You must be able to disable the hook without the hook's permission. Setting `hooks` to `{}` works because the editor reloads on save.                          |
| The threat model justifies the friction               | A repository handling live production credentials, or one where untrusted contributors run agents, buys more with fail-closed than a solo static project does. |

To re-test: set both entries to `true`, run a command with a payload over 2KB several
times, and read `.devenv/hook-audit.log`. If the decisions are delivered, flip it and
update `tests/unit/hooks-config.test.js` and
`docs/operational/automation-gaps.md`. If the editor locks up, set `hooks` to `{}`,
save, and restore.

## Postscript: where this knowledge belongs

The scanner needed four corrective commits in this repository — enabling it and making
it portable, stopping it losing the decision on large payloads, terminating the
decision with a newline, and settling the failure posture — and at least one of those
same fixes was rediscovered independently in a downstream copy. That is the signature
of knowledge living in the wrong place: it was embedded in a copied script rather than
recorded as a decision, so each copy had to learn it again.

The correction is this document plus the entries in `docs/KNOWN_ERRORS.md`. A copied
artifact carries behavior; only a written decision carries the reasoning, and reasoning
is what stops a consumer from "fixing" the default back.

## Related

- [KNOWN_ERRORS.md](../KNOWN_ERRORS.md) — the four incidents behind this decision
- [operational/automation-gaps.md](../operational/automation-gaps.md) — the upstream
  limit that keeps fail-closed out of reach
- [guides/mcp-hygiene.md](../guides/mcp-hygiene.md) — the adjacent agent-configuration
  surface
