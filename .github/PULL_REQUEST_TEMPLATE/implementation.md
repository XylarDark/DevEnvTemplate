## Implementation PR

Short checklist for a solo or indie change. No stakeholder sign-off.

**Plan / ownership:** [link or "scoped in chat"] — human decisions vs agent execution

## What changed

- **File:** `path/to/file.ts` — [why]
- **File:** `path/to/file.test.js` — [behavior covered]

## Verify

Command run (environment gate in `docs/human-use/environment.md`, otherwise `npm run verify`):

```
(paste the command and the counts it printed)
```

- [ ] Settled: tests cover the user-flow / bug-fix scenario
- [ ] Shaping: said in one line what was not verified
- [ ] `docs/KNOWN_ERRORS.md` updated if something failed
- [ ] No new shared utility without approval
- [ ] Human-owned decisions were not taken by the agent (alerted, or an explicit skip)

## Notes

Deviations from the plan, rollback, follow-ups.
