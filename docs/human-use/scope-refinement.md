# Scope refinement

Host-local interview so the agent asks instead of guessing. Use it when the next step would invent a product, scope, or architecture choice, and whenever a design change would move scope or a module boundary. The agent does not pick the winner.

**Skill (opt-in):** `.agents/skills-extras/scope-refinement`.

> **Localize on copy.** The round list lives in the host. This page is the method only.

## Method

Uses the host's Taste Gate queue, question budget, and taste-profiler (stage, then promote only after confirm). Do not create a second interview format.

1. Read locked decisions. Do not re-ask them.
2. Name each conflicting sentence and its file.
3. Each question is a real fork drawn from host texts or from the Hard Parts / Ousterhout briefs. Recommend one option the files already support, or recommend Skip. A thin yes/no question is a failed round.
4. Ask through the Cursor structured question picker, at most two questions. Every question has a Skip. Skip means do not build and do not start the next round. Do not paste a markdown menu.
5. Stop until the human answers.
6. Scribe only the confirmed pick.
7. When a round was useless, add a dated refinement row and mark the old round retired. Do not delete it.

Hard Parts decides whether the fork is a new quantum or a missing business driver. Ousterhout decides whether a special case is allowed into the slice interface. Neither brief fills in the product.
