# Research prompt contract

**Owner:** Conductor posts paste-ready prompts. Lead runs them through an external LLM and returns a Research EXIT. Conductor **ACCEPT**s EXIT → Lead greenlights Do.

## Required paste block (seven fields)

Every Research prompt MUST include these headings (names exact):

### ROLE
Who the external LLM is advising (Lead / Fix root / harness, etc.).

### CONTEXT
Pins / SHAs / measured tip.

### CANON
Paths/skills that must not be contradicted.

### ASK
Numbered questions; what the EXIT must contain.

### NON-GOALS
Explicit bans (product CAP, AGENTS dump, new seats, …).

### DONE-WHEN
Greps/checks for any Do bites the EXIT may propose.

### child Research needed?
`Y` / `N` (and why).

Optional but preferred: **Accept checklist** the Conductor will run before `ACCEPT EXIT`.

## Conductor ACCEPT checklist (before ACCEPT EXIT)

- [ ] Diagnosis / decisions ranked; persona-tooling vs procedure split present when asked
- [ ] Seat KEEP set unchanged when seats in scope (no vanity add)
- [ ] Procedures / skills cite canon; no AGENTS.md body dump
- [ ] Do bites: one unknown each, DONE-WHEN greps, forbidden co-changes, child Research Y/N
- [ ] Non-goals include CAP product Do unless Lead asked for CAP Research
- [ ] 15-q Architecture Trade-Offs only for boundaries the EXIT invents
- [ ] EXIT is paste-ready and does **not** instruct immediate implement
- [ ] Run Fitness greps A–D (below) on the prompt + EXIT (and repo ALIGN after Do)

If any box fails → return to Lead for rewrite (do not ACCEPT).

## Fitness greps (before ACCEPT)

Conductor re-runs on every Research prompt (`$P`) and every EXIT (`$E`) before `ACCEPT EXIT`. Files-only. Seven heading **names** above stay the paste law.

### A. Prompt — seven exact heading names (FAIL if any missing)

```bash
# $P = path to the paste-ready Research prompt
for h in 'ROLE' 'CONTEXT' 'CANON' 'ASK' 'NON-GOALS' 'DONE-WHEN' 'child Research needed?'; do
  grep -E "^#{0,3}[[:space:]]*${h}" "$P" || echo "FAIL missing heading: $h"
done
```

Pass = all seven match as headings (leading `#` optional; name exact).

### B. EXIT — required sections + paste-ready (FAIL if any missing)

```bash
# $E = path to the returned Research EXIT (full file, not chat slice)
for h in 'Diagnosis' 'Do bites' 'eggbot' 'child Research' 'Accept checklist'; do
  grep -E "$h" "$E" || echo "FAIL missing EXIT section: $h"
done
grep -E '^#+[[:space:]]*EXIT ' "$E" || echo "FAIL missing EXIT title"
```

EXIT sections expected: Diagnosis · Do bites · eggbot · child Research · Accept checklist (plus Port/Pin/Branch as needed).

### C. Four fail-strings (any hit in EXIT **Do bites / instruction** prose = FAIL ACCEPT)

Run on `$E` only. Do not run on the Research **prompt** (prompts legally name bans in NON-GOALS). Judge intent on Do-bites lines; Diagnosis / Decision table / NON-GOALS / PARK / Forbidden lists are allowed.

```bash
grep -nEi 'implement now|start coding|land this PR now|do this now|merge this PR|open DESKTOP Act|run the prove' "$E" \
  && echo "FAIL: EXIT instructs immediate implement"

grep -nEi 'install marketplace|CAP readiness as this bite|CAP product Do|APPROVE TOOL SCOUT as this bite' "$E" \
  && echo "FAIL: EXIT folds marketplace/CAP product"

grep -nEi 'bump pin|alwaysApply|AGENTS.md body|Class S slim|rewrite A–E' "$E" \
  && echo "FAIL: EXIT grows locked surfaces"

grep -nE 'readiness `false`.{0,40}closed_fail|ready:false.{0,40}closed_fail|arrange-block.{0,20}closed FAIL' "$E" \
  && echo "FAIL: EXIT restates skill drift"
```

### D. Repo ALIGN greps (DET extras — testing-standards only)

```bash
# Must be EMPTY (skill no longer equates readiness false with closed_fail)
grep -nE 'readiness `false`|readiness false' \
  .agents/skills-extras/testing-standards/SKILL.md \
  && echo "FAIL: testing-standards still binds readiness false to closed_fail"

grep -nE 'soft_fail|closed_fail|Arrange' \
  .agents/skills-extras/testing-standards/SKILL.md
```

Fitness **D** on DET points at extras `testing-standards/SKILL.md` only.

### Smallest bar (30s)

1. Prompt seven headings.
2. EXIT has Diagnosis + Do bites + child Research + no implement-now.
3. Repo: testing-standards does not contain `readiness false` next to `closed_fail`.

## AGENTS.md

At most **one pointer line** to this file. No paste of this contract body into `AGENTS.md`.
