# Known errors and fixes (team log)

**Purpose:** One place to record **recurring** or **expensive** mistakes so the team and agents do not repeat them. Append new entries; do not delete history (strike through or add an “addressed” note if obsolete).

**When to add an entry:** After you debug a non-obvious failure (build, CI, deploy, migration, flaky test) and have a verified fix.

**Suggested fields per entry:**

| Field | Description |
|-------|-------------|
| **Date** | YYYY-MM-DD |
| **Symptom** | What failed (command, error message snippet) |
| **Cause** | Root cause (version, ordering, environment) |
| **Fix** | Exact steps or patch |
| **Prevention** | Test, doc link, or rule update |

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

## Related

- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) — broader operational issues  
- [docs/operational/automation-gaps.md](operational/automation-gaps.md) — what automation cannot do yet  
- `.cursor/rules/05-error-handling.mdc` — defensive coding and where to record errors
