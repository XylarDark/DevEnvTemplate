# Optimization (human-owned numbers, then agent code)

You own what to measure and which variant won. The agent owns the code change only
after you paste numbers. It does not start a cycle here because the code “looks
slow.” See [OWNERSHIP.md](OWNERSHIP.md).

## Options the agent must offer

1. **Skip** — this cycle is not a performance pass. Default when you did not ask.
2. **I’ll paste measurements** — hardware, metric, numbers. Agent waits, then may
   change code only as I specify.
3. **A/B** — agent produces both variants; I measure and name the winner before
   further changes.

## Measurements

What you ran, on what hardware, and the numbers that matter (frame time, p95, heap,
build seconds).

```
(fill in)
```

## A/B

What two compilations or implementations you compared, and which won.

```
A:
B:
Winner:
```

## Ask the agent

A specific change grounded in the numbers above. Leave blank until you have them.

```
(fill in)
```
