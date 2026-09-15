# Cursor cannot: Code Quality Review (PDF section 4)

**Label:** Cursor cannot. **Job:** Test.

The PDF wants objective metrics instead of reading the agent’s diff like junior
human code. Cursor will not run those metrics as gates. This template will not
add them on the GitHub Actions free tier.

## What the PDF asked

- Map logic with **dynamic graphs**; reserve line-by-line reading for critical
  paths.
- **Cyclomatic complexity** bands (1–10 simple, 11–15 more tests, >15 split).
- **Test coverage** as a percentage — and then **mutation testing** so coverage
  has real assertions (kill ratio; surviving mutants must die).
- **Dependency structure** (high cohesion, low coupling; flag deep or cyclic
  graphs).
- **C.R.A.P.** (complexity vs coverage); result under 8. PDF points at a GitHub
  Action / skill pack. Not a free-tier gate here.

## What Cursor actually has

- The agent can **draw** mermaid or similar graphs when you ask. There is no
  always-on graph view of the last change.
- This repo reports complexity **on TypeScript files the agent touches** (glob
  rule: report >5, split >15). That is not a Cursor-wide metric UI.
- `npm test` is the suite. There is **no** coverage-percent gate and **no**
  Stryker/mutation job. Surviving mutants are not something CI will show you.
- No dependency-matrix tool ships in this template.
- CRAP is **judgment** on [review.md](../review.md), not an Action.

## What you do

Use [review.md](../review.md):

- Ask for graphs; validate order against architecture.
- Read complexity the agent reported; split or accept.
- Ship / no-ship is yours. Coverage % and CRAP are optional notes, not a green
  check.

Do not add a mutation-testing CI job, a CRAP Action, or `npx skills@latest add …`
to this repository to “complete” the PDF.
