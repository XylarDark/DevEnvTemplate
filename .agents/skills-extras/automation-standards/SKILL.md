---
name: automation-standards
description: Use when building automation that drives or configures external tools, APIs, IDEs, or CI - ranks the available approaches from official API down to fragile UI scripting and requires any setting automation cannot reach to be recorded in docs/operational/automation-gaps.md.
---

# Automation standards

Automation should stay transparent: the team knows what is automated, what is
brittle, and what remains manual by policy or technical limit. Upgrades should
trigger deliberate re-verification, not surprise breakage.

## Preference order

When automating a workflow — scripts, bots, MCP servers, CI, or UI-driven
automation — prefer these approaches in order:

1. **Official API or documented CLI.** Stable contracts, versioning, least
   surprise.
2. **Configuration-as-code.** Checked-in config files the tool reads
   deterministically.
3. **Scripts that wrap the above.** Idempotent, logged, testable.
4. **UI or GUI automation** (click and type, accessibility APIs, screenshot-driven
   tools). Use only when options 1–3 cannot achieve the outcome, and treat it as
   fragile — layout changes, themes, and multi-monitor setups all break it.
   Document the maintenance cost. Avoid it for security-critical or
   compliance-only paths unless there is no alternative.
5. **Explicit backlog.** If nothing above works reliably, record the gap (below).
   Do not assume someone will remember.

Third-party editor extensions are optional; when the team adopts one, follow that
extension's documented workflow.

## Resources only one caller can hold

Before automating anything that drives a browser, an emulator, an attached device, a
fixed port, or any other single-instance resource, read the
`exclusive-resource-access` skill. Two rules from it are worth stating here because
they apply to automation generally:

- **Bound every wait.** An unbounded call turns a failure into a hang, and a hang
  produces no error, no output, and no exit code to react to.
- **Never retry a hang.** Retry only calls that returned, and only with the call
  changed. Repeating an identical call re-enters the identical race, and a hang
  cannot be cancelled from inside the caller. When you need to know whether a flaky
  subsystem is healthy, read its logs rather than probing it — a probe can hang
  exactly like the call it was meant to protect.

## Settings automation cannot reach

When automation drives external tools, APIs, or product UIs, follow this procedure
so required-but-inaccessible settings stay visible and upgrade-safe.

1. **Identify the required settings.** Work from version-specific official docs, or
   the pinned release that runs in CI, and list every setting the feature needs. Do
   not rely on model training data alone for versioned products.

2. **Check access from automation.** For each setting, verify whether it can be set
   or read _reliably_ from an API, CLI, config file, or stable automation hook.
   "Reliably" means documented, repeatable, and unlikely to break on a minor UI
   reskin.

3. **Document gaps and human steps.**
   - Record anything with no access or unreliable access in
     `docs/operational/automation-gaps.md`. Link it from `docs/KNOWN_ERRORS.md`
     when the gap has caused a recurring incident.
   - Include the date, the feature, what is needed, why automation cannot set it,
     and a suggested follow-up (API request, ticket, different tool).
   - In runbooks, call out steps only a human should perform — production secrets,
     legal approval. That is normal, and distinct from "we forgot to automate this."

4. **Re-check on upgrades.** When upgrading the tool, SDK, or browser baseline,
   re-run the access check and update the gaps doc so stale assumptions do not
   linger.

## Lead-correction → harness

When Lead or a human corrects a **proven** miss (false PASS/FAIL with evidence),
fold the lesson into the repo **immediately**: a blocking gate, an assert threshold,
or one policy row — not a long runbook or chat-only rediscovery. Prefer compact hard
rules; point to `docs/KNOWN_ERRORS.md` for episode detail.

## Testing preconditions (automation side)

Before Act/capture/run, automation must establish (and reports should record):

1. Required content or assets present in the loaded environment.
2. Focus, camera, or aim pointed at that content (when the workflow is visual).
3. Environment gates match intent (mode, config, fixtures, lighting).

Do not treat empty, black, or soft-reject output as **closed_fail** without that
setup evidence in the report. Skipping preflight to save tokens is the anti-pattern.

## Arrange before Act

Prove, capture, and evidence scripts run an **Arrange/preflight** gate that can block
Act when `ready: false`. If a module is exempt, document **Harness exempt** and why
in that module’s doc or table — not only in chat.

## Universal tooling gap checklist

When automation needs capability the repo does not have yet, walk this ladder in order
(any surface: API, CLI, GUI, CI, capture):

1. **Docs-first** — vendor or pinned-version docs before inventing syntax, waits, or stacks.
2. **Proven-results** — community or industry patterns that already work before custom ladders.
3. **Rung-1 harden** — built-ins and tools already in the repo or host toolchain.
4. **Dead-end research** — one bounded public research pass; log gaps in
   `docs/operational/automation-gaps.md` before asking for new tooling.
5. **Lead gates** — `APPROVE TOOL SCOUT` / `APPROVE TOOL BUILD` only; **no auto-install**
   of third-party tools.

Game-engine capture histories are **instances** of this ladder, not a separate policy.

## Harness lifecycle patterns (stack-agnostic)

- **Fixture lifecycle** — reseed, inventory, optional teardown; stamp what was applied in reports.
- **Latent wait contracts** — explicit budgets; a wait miss classifies as soft_fail or closed_fail,
  not an infinite hang.
- **Readiness probe before Act** — fail with a clear blocked reason, not an import crash mid-run.
- **Artifact stamps** — record paths and mtimes (or hashes) for outputs; optional fresh-prove purge
  only at prove **start**, not mid-debug.

Detail: [docs/guides/automation-harness.md](../../../docs/guides/automation-harness.md).
