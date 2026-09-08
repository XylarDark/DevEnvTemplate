---
name: exclusive-resource-access
description: Use when automation drives a resource only one caller can hold at a time - a browser, emulator, simulator, attached device, fixed port, database, or physical hardware - and especially when several agents, developers, or CI jobs may run at once; covers per-lane isolation, lock files, watchdogs, teardown on every exit path, reaping orphans, and why a hang must never be retried.
---

# Exclusive resource access

Some resources admit exactly one caller: a single automation surface in an editor,
one emulator instance, one attached device, a fixed port, a database with a
single-writer lock, a physical rig. Automation that assumes it is alone with such a
resource works perfectly until the day it is not.

**Contention is usually silent.** The worst recorded case of this pattern cost 46
minutes: three agents reached for one shared automation surface at the same time,
and all three blocked with no error, no output, and no timeout. None of them could
detect that it had happened. A caller that is merely _slow_ and a caller that is
_deadlocked_ look identical from inside.

And the same resource also failed with a **single** caller, which is the part that
determines the fix. "Don't run two at once" was never a workaround, because one was
already enough. If a resource can hang for one caller, isolation alone will not save
you — you also need bounded waits.

## Give each caller its own instance, keyed by a lane

The pattern that works is a **lane**: a small integer that selects a completely
independent instance of the resource.

- Derive the resource's address from the lane — `basePort + lane` for a debug or
  control port — so two lanes cannot collide by construction.
- Give each lane **its own state directory**, named unambiguously and including the
  lane number (`<tool>-<purpose>-lane<N>`). Shared state is shared contention with
  extra steps.
- Callers pick a lane and keep it for the whole session. Document that the default
  lane is the most likely to collide, because everyone who did not choose gets it.

Lanes convert "wait for the shared thing" into "use your own thing", which is the
only version of this that scales past one caller.

## Lock files: refuse fast, and name the holder

A lane still needs a claim, because two callers can choose the same number.

- Write a per-lane lock file recording the **process ID** and the **start time**.
- On collision, refuse immediately with a message that names the holding PID, how
  long it has held the lane, and **which lane is free**. A refusal that just says
  "busy" sends the caller back to guessing.
- A stale lock — the recorded PID is gone — is reclaimable. Check liveness rather
  than assuming a lock file means a live holder.

**The subtlety that is easy to get backwards:** a caller that refuses _before_
acquiring the lane has taken on **no teardown responsibility**. It must not kill the
holder's processes, delete the holder's state directory, or clear the lock. Cleanup
belongs to whoever holds the claim. Getting this wrong turns a polite refusal into a
caller that destroys the run it just declined to disturb.

## Bound every wait, and name the step that expired

An unbounded wait is how a hang becomes invisible.

- Put a per-operation timeout on **every** round trip and every request. A bare
  `await` on a remote call is the defect; a request to a socket that accepts and
  then says nothing waits forever by default.
- Reject all in-flight calls when the transport closes. A process that dies with
  calls outstanding leaves promises that will never settle.
- Add a **wall-clock watchdog** for the whole run, sized from the work requested. On
  expiry, kill the run, **name the step it died on**, and exit non-zero.
- Consider a structural guard test that fails the build when an unbounded call
  reappears. This is the kind of rule that decays without one.

A run that dies loudly is enormously better than one that hangs silently: the first
is a bug report, the second is 46 minutes of nothing.

**Anything that runs after the watchdog stops needs its own budget.** Teardown is
the usual victim. One recorded cleanup took 37.8 seconds — longer than the work it
was cleaning up after — because a recursive delete retried _per directory entry_
against files the resource had not yet released. Give teardown an explicit budget,
let the retry loop be yours rather than the filesystem's, and log when you give up.
Measure and print teardown duration; that number is what surfaces this at all.

## Teardown on every exit path the runtime can observe

Cleanup in a `finally` block runs on almost none of the paths that matter. Wire it
to every event the runtime exposes: normal exit, each interrupt or termination
signal it can deliver, uncaught exceptions, and unhandled rejections.

**Teardown from an exit hook must be synchronous.** An exit handler cannot await, so
an async cleanup silently does nothing on exactly the paths you added it for. This
one is worth checking by hand, because it fails quietly and only under the
conditions you were trying to protect against.

Some paths cannot be covered at all — a forced kill delivers nothing to the target,
so a run ended that way executes zero cleanup code by definition. That is not a bug
to fix; it is a limit to document, and the reason the next section exists.

## Reap orphans by owned state, never by process name

Sooner or later something outlives its run. A reaper collects it.

- Identify orphans by the **state path the run owns** — the lane's own directory —
  not by process name, and not by the control port. Two reasons: a resource may
  spawn a tree of helper processes where only some carry the port flag, so port
  matching strands the rest; and matching by name is how automation kills the user's
  own copy of the same application.
- Beware a query that matches **its own command line**. A process listing filtered
  on the lane prefix will match the shell running the filter. Require a stronger
  signal — the ownership flag _and_ the prefix — before treating a process as a
  reapable orphan.
- Report anything that mentions the lane but cannot be attributed, **loudly**. That
  branch firing is how the self-match above was found at all. A reaper that skips
  what it cannot explain is a reaper that silently fails to find things.
- Offer a survey mode (`--dry-run`) and a lane-scoped mode. A repo-wide destructive
  sweep cannot distinguish an orphan from a run started before locking existed —
  "no lock" is exactly what both look like.

## Never retry a hang

Retry is for failures that **return**.

- Retry only a call that came back, and only with the call **changed**. Repeating an
  identical call re-enters the identical race.
- Never retry the hanging variant. An unbounded hang cannot be cancelled from inside
  the caller, so a retry is strictly worse than not retrying: it spends the same
  unbounded time again and removes the chance of reporting the first one.
- Cap retries at one, and say what you changed.

**Prefer an offline health check to a probe.** When you need to know whether a
flaky subsystem is currently working, read its logs or its state on disk rather than
calling into it. A probe that re-enters the failing subsystem can hang exactly like
the call you were trying to protect; a log reader cannot.

## Platform notes worth writing down once

These are host-platform facts, not library quirks. They cost real time to rediscover.

- **An exit hook cannot await.** Cleanup wired to process exit must be synchronous.
- **A tree-kill's exit code is not evidence.** A recursive kill returns non-zero when
  any child vanishes while it walks the tree, which is normal for a resource that
  spawns and recycles helpers. It has been observed reporting failure on a tree it
  had in fact destroyed. Verify liveness afterwards instead of trusting the code.
- **Windows has no process group**, so a hard kill does not cascade to children. The
  tree must be walked explicitly, or the whole thing launched inside a job object.
- **On Windows, `process.kill(pid, 'SIGINT')` is a terminate**, not a deliverable
  signal. A signal handler can be wired but not exercised from a test on that
  platform — write it anyway, and note that it is untestable there.

## Record what stays unfixable

The residue of this work is always a short list of things that cannot be automated:
a kill path that runs no cleanup, a sweep that cannot distinguish an orphan from a
legacy run, a readiness signal the resource does not expose. Put each one in
`docs/operational/automation-gaps.md` with the interim workaround and what would
close it, so the same doomed attempt is not retried next quarter. Failures that were
expensive to diagnose belong in `docs/KNOWN_ERRORS.md`.

## Checklist

- [ ] Each concurrent caller gets an isolated instance keyed by lane
- [ ] Lane state lives in its own uniquely named directory
- [ ] A lock file records PID and start time; collisions refuse fast and name a free lane
- [ ] A refusal before acquiring performs no teardown
- [ ] Every remote call has a timeout; in-flight calls reject when the transport closes
- [ ] A wall-clock watchdog kills the run and names the step it died on
- [ ] Teardown is synchronous, wired to every observable exit path, and time-bounded
- [ ] Orphans are identified by owned state path, never by process name
- [ ] Hangs are never retried; retries change the call and are capped
- [ ] Remaining limits are recorded in `docs/operational/automation-gaps.md`
