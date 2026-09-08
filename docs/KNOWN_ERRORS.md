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

### The secret-scan hook blocked every read and command, silently

- **Date:** 2026-09-08
- **Symptom:** With `.cursor/hooks.json` enabled, Cursor intermittently refused tool calls with
  `Hook "node .cursor/hooks/secret-scan.cjs" returned no output`. It hit large file reads most
  often, and the audit log recorded a successful, complete write for the very same invocation that
  Cursor reported as empty. Invoking the hook by hand never reproduced it, at any payload size, in
  or out of a shell.
- **Cause:** Three independent output-delivery bugs, all invisible without the audit log:
  1. `process.stdin.destroy()` ran before the response was written. `beforeReadFile` carries the
     entire file being read, so for a large file Cursor was still writing when the read end
     closed, and the broken pipe cost the response. Small payloads had already arrived, which is
     why it looked harmless.
  2. `fs.writeSync` was called once and its return value ignored. A short write delivered partial
     JSON, and `EAGAIN` on a non-blocking pipe threw and delivered nothing.
  3. `readStdin` resolved on a 1500ms timer, so a large payload was parsed while incomplete.
- **Fix:** Never destroy stdin; `unref` it instead. Loop writes until every byte is accepted,
  retrying `EAGAIN`. Drop `process.exit()` in favour of `process.exitCode`, so a natural exit
  cannot precede the flush. Raise the stdin safety timeout to 5s and record in the audit log when
  it fires. See `.cursor/hooks/secret-scan.cjs`.
- **Prevention:** `Cursor fails open by default`, so an unwired or crashing hook is
  indistinguishable from a working one — but under `failClosed` it blocks the whole editor. The
  audit log at `.devenv/hook-audit.log` now records the event, target, and whether stdin timed
  out, which is the only way this was diagnosable. Stress-verified at 15 invocations each for 65B,
  20KB and 164KB payloads.

### A fail-closed hook can lock you out of fixing it

- **Date:** 2026-09-08
- **Symptom:** The hook's content scanner denied reads of its own test file, because a secret
  scanner's test corpus is necessarily full of credential-shaped strings. With `failClosed: true`,
  the tests could not be opened to correct the scanner.
- **Cause:** Content scanning applied to every file, with no notion of files whose subject matter
  *is* credential formats.
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

---

## Related

- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) — broader operational issues
- [docs/operational/automation-gaps.md](operational/automation-gaps.md) — what automation cannot do yet
- `.agents/skills/defensive-programming/SKILL.md` — defensive coding and where to record errors
