# Cursor cannot: Optimization Refactor (PDF section 5)

**Label:** Cursor cannot. **Job:** Test.

The PDF splits refactor: the agent may chase duplication; **you** own performance.

## What the PDF asked

- Human **profiling** and A/B compilations.
- Feed the numbers back; do not optimize because the code “looks slow.”
- Do not review AI code as if it were human code — ask for graphs instead
  (see [code-quality-review.md](code-quality-review.md)).

## What Cursor actually has

- No built-in profiler, frame-time HUD, or A/B compilation runner for this
  template. You run the measurement on your hardware (or Unreal/Unity tools).
- The agent can produce two variants **after** you ask. It must not pick a
  winner.

## What you do

Fill [optimization.md](../optimization.md) only when you asked for a performance
pass: paste hardware, metric, numbers, or name the A/B winner. Until then the
default is skip.

Do not ask the agent to invent a benchmarking product or to treat “looks slow” as
evidence.
