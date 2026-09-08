# Known errors and fixes (team log)

**Purpose:** One place to record **recurring** or **expensive** mistakes so the team and agents do not repeat them. Append new entries; do not delete history (strike through or add an “addressed” note if obsolete).

**When to add an entry:** After you debug a non-obvious failure (build, CI, deploy, migration, flaky test) and have a verified fix.

**Suggested fields per entry:**

| Field          | Description                                  |
| -------------- | -------------------------------------------- |
| **Date**       | YYYY-MM-DD                                   |
| **Symptom**    | What failed (command, error message snippet) |
| **Cause**      | Root cause (version, ordering, environment)  |
| **Fix**        | Exact steps or patch                         |
| **Prevention** | Test, doc link, or rule update               |

**Title the entry with the symptom, not the cause.** Nobody arrives here knowing the cause; they arrive with an error string and a behavior, so `Tests pass while asserting nothing` is findable and `helper returned the wrong slice` is not. Where it helps, record what looked like the cause and was not — that saves the next reader the same detour.

**Augment, do not duplicate.** When a failure you already have an entry for reappears wearing a new face, add the new symptom to the existing entry. Two entries for one cause split the search results, and each copy then goes stale on its own schedule.

---

## Template examples (replace with your project’s real entries)

### Example: Lockfile out of sync

- **Date:** YYYY-MM-DD
- **Symptom:** `npm ci` fails: “package-lock.json out of date”.
- **Cause:** `package.json` changed without regenerating the lockfile.
- **Fix:** Run `npm install` locally; commit updated `package-lock.json`.
- **Prevention:** CI fails on lockfile drift; document in CONTRIBUTING.

### Example: Wrong Node version locally

- **Date:** YYYY-MM-DD
- **Symptom:** `SyntaxError` or native module load failure after pull.
- **Cause:** Local Node.js major version differs from `engines` in `package.json`.
- **Fix:** Switch to the version in `engines` (nvm, fnm, volta).
- **Prevention:** Document in [SETUP-GUIDE.md](SETUP-GUIDE.md); optional `.nvmrc`.

### Example: Secret committed by mistake

- **Date:** YYYY-MM-DD
- **Symptom:** Scanner or review found a credential in git history.
- **Cause:** `.env` not in `.gitignore` or key pasted into a test file.
- **Fix:** Rotate the credential; remove from history per org policy (BFG, git-filter-repo); ensure `.env` ignored.
- **Prevention:** Pre-commit secret scan; never commit `.env`.

---

## Real entries

> **The next four entries describe a component that no longer ships.** The secret-scan hook was
> removed on 2026-09-08 ([adr/002-remove-the-secret-scan-hook.md](adr/002-remove-the-secret-scan-hook.md)).
> They are kept because they are the specification for anyone reintroducing it, and because three
> of the four defects are general to any Cursor hook, not to this one.

### The secret-scan hook blocked every read and command, silently

- **Date:** 2026-09-08
- **Symptom:** With `.cursor/hooks.json` enabled, Cursor intermittently refused tool calls with
  `Hook "node .cursor/hooks/secret-scan.cjs" returned no output`. It hit large file reads most
  often, and the audit log recorded a successful, complete write for the very same invocation that
  Cursor reported as empty. Invoking the hook by hand never reproduced it, at any payload size, in
  or out of a shell.
- **Cause:** The decision was written **without a trailing newline**. Cursor's reader is
  line-delimited, so a newline-less response can sit in its buffer as an incomplete line and be
  discarded when the process exits. The audit log recorded complete 59-byte writes for the very
  invocations Cursor called empty, and 59 bytes is exactly this payload with no newline. Cursor's
  own documented example emits one. Larger payloads failed more reliably, which is what made it
  look like a size or pipe problem. Three further latent bugs were found and fixed along the way:
  1. `process.stdin.destroy()` ran before the response was written. `beforeReadFile` carries the
     entire file being read, so for a large file Cursor could still be writing when the read end
     closed.
  2. `fs.writeSync` was called once and its return value ignored. A short write delivers partial
     JSON, and `EAGAIN` on a non-blocking pipe threw the decision away.
  3. `readStdin` resolved on a 1500ms timer, so a large payload could be parsed while incomplete.
- **Fix:** Terminate the payload with `\n`. Never destroy stdin; `unref` it instead. Loop writes
  until every byte is accepted, retrying `EAGAIN`. Drop `process.exit()` in favour of
  `process.exitCode`, so a natural exit cannot precede the flush. Raise the stdin safety timeout
  to 5s and record in the audit log when it fires. See `.cursor/hooks/secret-scan.cjs`.
- **Not the cause, though it looked like it:** `timeout` in `hooks.json` really is in seconds, as
  documented. A probe hook that busy-waits 500ms passes under `timeout: 2`. Raising the timeout
  appeared to fix the problem only because editing `hooks.json` makes Cursor reload, which is what
  actually picked up the corrected script.
- **Prevention:** `Cursor fails open by default`, so an unwired or crashing hook is
  indistinguishable from a working one — but under `failClosed` it blocks the whole editor. The
  audit log at `.devenv/hook-audit.log` now records the event, target, and whether stdin timed
  out, which is the only way this was diagnosable. Stress-verified at 15 invocations each for 65B,
  20KB and 164KB payloads. The posture this settled on, and what it gives up, is recorded in
  [adr/001-agent-hook-failure-posture.md](adr/001-agent-hook-failure-posture.md).

### A fail-closed hook can lock you out of fixing it

- **Date:** 2026-09-08
- **Symptom:** The hook's content scanner denied reads of its own test file, because a secret
  scanner's test corpus is necessarily full of credential-shaped strings. With `failClosed: true`,
  the tests could not be opened to correct the scanner.
- **Cause:** Content scanning applied to every file, with no notion of files whose subject matter
  _is_ credential formats.
- **Fix:** `CONTENT_SCAN_EXEMPT_PATTERNS` skips tests, fixtures, docs, lockfiles, vendored code and
  the scanner itself. Path rules still apply everywhere, so a dotenv file under `tests/fixtures/`
  is still blocked.
- **Prevention:** When editing a live fail-closed hook, set `hooks` to `{}` in
  `.cursor/hooks.json` first — Cursor watches the file and reloads on save. Restore it and run
  `node --test tests/unit/hooks-config.test.js` before committing; that test fails if the config
  is left empty.

### An empty hooks object disabled the scanner for a week

- **Date:** 2026-09-08
- **Symptom:** None, which was the problem. `.cursor/hooks.json` was committed as
  `{"version": 1, "hooks": {}}` after a debugging session. The scanner and its 80 tests were
  present and passing, so every check looked healthy while nothing was being scanned. The empty
  config was then copied into a downstream project.
- **Cause:** Cursor fails open when no hook is registered, so a disabled control is silent.
- **Fix:** Restored both `beforeReadFile` and `beforeShellExecution` with `failClosed: true`.
- **Prevention:** `tests/unit/hooks-config.test.js` asserts the wiring rather than the script:
  both events present, `failClosed` set, a plausible timeout in seconds, and an existing `.cjs`
  script. Tests on the scanner itself cannot catch a wiring defect.

### A `.js` agent hook dies in an ESM project

- **Date:** 2026-09-08
- **Symptom:** `ReferenceError: require is not defined in ES module scope` on the hook's first
  line, in a host project whose `package.json` sets `"type": "module"`. Under `failClosed` this
  blocks every file read and shell command in the editor.
- **Cause:** Cursor runs hooks as plain Node scripts. A `.js` file inherits the nearest
  `package.json` module type, so CommonJS hooks break in ESM projects.
- **Fix:** Renamed to `.cjs`, which pins the file to CommonJS regardless of the host.
- **Prevention:** `tests/unit/hooks-config.test.js` requires the configured command to reference a
  `.cjs` script. Anything copied into a host project must not assume the host's module system.

### Copied skills told a host project to run commands that only exist here

- **Date:** 2026-09-08
- **Symptom:** In a project that had integrated this template's agent layer, four copied skills
  instructed agents to run `npm run check:doc-links`, `npm run lint`, and `node --test`. None of
  those exist in that project — it has no link checker, no ESLint, and uses a different test
  runner. The skills also carried a copy of _this_ repository's docs-root inventory, which does
  not match the host's `DOCS_LAYOUT.md`. Nothing failed loudly: an agent following the skill runs
  a command that does not exist, or worse, files a document per an inventory that is not the
  host's.
- **Cause:** `copySkills` in `scripts/tools/cursor-rules-integration.ts` copies each `SKILL.md`
  verbatim, which is correct — skills are stack-agnostic procedural knowledge and all of them
  travel. But the skills themselves mixed portable practice with this repository's own commands
  and file inventory, in the same prose, with nothing marking which was which. A consumer had no
  way to tell what needed localizing short of reading every line against their own repo. The
  deeper error is the template's: it assumed its toolchain would be adopted wholesale. The
  consumer in question deliberately has no ESLint, Prettier, Husky or commitlint, and records
  their absence as an accepted state rather than a gap to close.
- **Fix:** Every repo-specific section in a shipped skill now opens with a **Localize on copy**
  callout naming what must be replaced, and copied inventories were replaced with pointers to
  the file that owns them (`DOCS_LAYOUT.md` owns the docs root list; the skill points at it).
  The README now states which layers a consumer is expected to adopt and which are optional.
- **Prevention:** `tests/unit/skill-portability.test.js` fails when a skill names a repo-local
  script outside a marked section, and `integrateCursorRules` reports which copied skills contain
  a localize marker so the host is told what to adapt at the moment it copies them. When writing
  a skill, keep the practice and the commands in separate sections: the practice is why the skill
  ships, the commands are an example of running it here.

### Copied always-on rules inflated every turn

- **Symptom:** Agent sessions feel slow or expensive; context window fills with guidance unrelated to the current file.
- **Cause:** Always-applied Cursor rules from an older template (~1,200 lines) still present in `.cursor/rules/`.
- **Fix:** Migrate content to `AGENTS.md` and `.agents/skills/`, set rules to glob-scoped with `alwaysApply: false`, or remove retired files.
- **Prevention:** See [DevEnvTemplate_RULES_SYNC.md](DevEnvTemplate_RULES_SYNC.md) and `RETIRED_RULE_REPLACEMENTS` in [`scripts/tools/cursor-rules-adapter.ts`](../scripts/tools/cursor-rules-adapter.ts).

### A script flag passed after `--` never arrived, on PowerShell only

- **Date:** 2026-09-08
- **Symptom:** `npm run doctor -- --fast` ran a **full** scan, and `npm run doctor -- --json`
  printed the human report instead of JSON, which made a JSON parse of the output fail. Nothing
  errored; the flag simply had no effect. The giveaway is npm's own echo of the script, which
  reads `> node dist/scripts/doctor/cli.js` with no flag after it.
- **Cause:** PowerShell removes the first bare `--` from a native command's arguments before npm
  ever sees it. npm then receives `--fast` as an argument to _itself_, does not recognize it, and
  ignores it. Reproduced on PowerShell 5.1.26100.9168. Quoting the flag instead of the separator
  (`npm run doctor -- '--fast'`) does not help, because the separator is what gets eaten.
- **Fix:** Quote the separator: `npm run doctor '--' --fast`. npm's echo then reads
  `> node dist/scripts/doctor/cli.js --fast`, and `.devenv/gaps-report.json` contains the
  fast-mode partial-coverage gap that proves the shallow path ran. The quoted form is also
  correct in bash, which strips the quotes and passes `--` through.
- **Prevention:** `AGENTS.md` now gives the quoted form for PowerShell in the same paragraph that
  explains the separator, and the `agent-workflow` skill records it among its PowerShell patterns.
  Note that this repository already warned that `npm run doctor --fix` silently ignores the flag;
  this is the same failure arriving from the other direction, so the warning was necessary but not
  sufficient on Windows. When a flag appears to do nothing, read npm's echoed command line first.

---

## Related

- [adr/001-agent-hook-failure-posture.md](adr/001-agent-hook-failure-posture.md) — why the secret-scan hook runs fail-open
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) — broader operational issues
- [docs/operational/automation-gaps.md](operational/automation-gaps.md) — what automation cannot do yet
- `.agents/skills/defensive-programming/SKILL.md` — defensive coding and where to record errors
