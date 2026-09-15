# Test contract (human-owned)

You own what “done” means (scenarios, coverage, acceptance). The agent owns writing
the tests *from those scenarios* and the product code. Feature work is user-flow
(BDD). Classic red-green TDD is for critical or low-level pieces and escaped bugs.
See [OWNERSHIP.md](OWNERSHIP.md).

## Options the agent must offer

When no scenario has a real Given/When/Then (still the template stubs):

1. **I'll fill `test-contract.md` myself** — agent waits.
2. **Dictate scenarios in chat** — agent restates them, I confirm, then it scribes.
3. **Bug fix** — I'll name the broken behavior in one sentence; agent writes that
   failing test first and does not implement until it fails.
4. **Existing suite is the contract** — no new scenarios; point at the tests to run.
5. **Skip this gate** — no new behavior. Agent records the skip.

## Task type

Examples: new panel, new module, API change, bug fix.

```
(fill in)
```

## Skill or human reference

Which skill applies, and which file under [references/](references/README.md) the
agent should copy from. If there is no reference yet, add one before implementation.

```
(fill in)
```

## Granularity and coverage

What must be tested, at which layer, and what is deliberately out of scope.

```
(fill in)
```

## Behavior scenarios

User-flow statements the agent will turn into tests. One scenario per block.

```
Given
When
Then
```

```
Given
When
Then
```

## Bug-fix guard (if this cycle is a fix)

Write the failing behavior test first. After the fix, the same test must fail when
the regression is reintroduced.

```
(fill in the behavior that broke)
```

## Acceptance

What the human will check besides the automated suite.

```
(fill in)
```
