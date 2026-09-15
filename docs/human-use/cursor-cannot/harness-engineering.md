# Cursor cannot: Harness Engineering (PDF 3.1)

**Label:** Cursor cannot. **Job:** Test (and Steer for interrupt).

The PDF’s harness is everything outside the model: instructions, tools, environment,
state, and verification. Most of that is this repo’s `AGENTS.md`, skills, and
Human Use. Two pieces are **not** Cursor products.

## What the PDF asked

- Make runtime **observable and debuggable** as part of the harness.
- Verify with full-pipeline tests, self-reflection, and **adversarial reviews**
  (a competing LLM), not “I’m done.”
- Stop agents from declaring victory too early.

## What Cursor actually has

- A local agent, tools, and (if you start it) debug mode. There is no harness
  dashboard, no always-on trace of every tool call for you to audit, and no
  built-in second-model reviewer that runs on every change.
- We already require **counts** from a named verify command and a **separate
  verifier** pass for the outcome rubric. That is policy, not a Cursor feature.
- An adversarial pass is an optional Human Use choice: **you** start a second
  chat. See [review.md](../review.md).

## What you do

- **Test:** treat “I’m done” as a claim. Run the verify command you named. Launch
  or role-switch to the verifier; the implementer does not grade itself.
- **Steer:** if you want a competing model, you open that chat. The agent waits.
- Do not add a mutation-testing CI job, a CRAP action, or a custom observability
  product to “close” this slice. Those are other Cursor-cannot files.
