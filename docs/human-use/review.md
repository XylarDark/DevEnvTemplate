# Review (human-owned)

You own ship / no-ship. The agent owns graphs, complexity numbers, and verify
evidence — not the sign-off. Do not read the diff as if a junior human wrote it.
See [OWNERSHIP.md](OWNERSHIP.md).

## Options the agent must offer

After verify evidence exists and sign-off is still empty:

1. **Generate logic-flow graphs now** — I’ll validate order and boundaries.
2. **I’ll review graphs you already printed** — agent waits for my notes.
3. **Skip graph review** — I accept the verify counts. Agent records the skip; it
   does not tick my sign-off boxes.
4. **Adversarial pass** — I’ll start a second-model chat instructed to find holes.
   Agent waits.

## Logic flows

Ask the agent for graphs of the main paths. Validate order and ownership; send it
back if a flow crosses a boundary the architecture forbade.

```
(paste or link the graphs; note what you changed)
```

## Complexity

Cyclomatic complexity is path count, not “how hard this is to read.” Bands: 1–10
simple (under 4 is ideal); 11–15 needs more tests; above 15 split. When a changed
function is above 5, the agent should have reported it.

```
Functions above 5:
Split or accept:
```

## Adversarial pass (optional)

A second model reviewing the same change, instructed to find holes rather than
agree. Not a CI job.

```
Ran: yes / no
Findings:
```

## CRAP as judgment, not a gate

Change-risk is complexity versus how well those paths are tested. Keep it in mind;
do not add a coverage-times-complexity action on the free CI tier.

```
Anything you would not ship:
```

## Sign-off

- [ ] Flows match the architecture
- [ ] Test contract scenarios still describe the product
- [ ] No new shared utility landed without approval
