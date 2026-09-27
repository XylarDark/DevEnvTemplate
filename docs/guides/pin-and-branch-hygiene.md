# Pin and branch hygiene (portable)

**Pin branch:** DevEnvTemplate **`master`** only. Consumer pins point at `master`, never at `main`.

## Change classes

| Class | Meaning | Policy |
|-------|---------|--------|
| **D** | Docs-only / fitness-doc (`SYNC.md` greps, CHANGELOG, lean-extra prose, guides) | **MAY_DRIFT** until Lead names a `master` SHA |
| **S** | Skills-extras / canon blob (writer `SKILL.md`, `hash-object` Canon line) | **MUST** bump consumer pin after the commit is on DET **`master`** |
| **C** | Doctor / CLI / dist / sync-layers that inject into hosts | **MUST** bump consumer pin (same PR) when Class C lands on `master` |

Additional locks:

| Rule | Policy |
|------|--------|
| ALWAYSAPPLY cardinality | **N=3 locked** (`07` / `08` / `20`). Growth or shrink = new Research. |
| DET PR base | **Must be `master`**. Base `main` while pin is `master` = NEVER_AUTO. |
| CAP / product on DET | **NEVER_AUTO** — no CAP coupling on the template. |
| Unsure | **NEVER_AUTO**. Conductor names the class; Lead picks SHA from **`master`**. |

## Branch rules

- Open DET PRs with **base `master`**.
- Never treat DET **`main`** as the pin tip; `main` may diverge (Class D / wrong-base leftovers).
- Land Class D/S/C on **`master`** first; consumers follow from that SHA.
- Do not point a consumer pin `branch` field off `"master"`.

## Ownership (summary)

| Act | Who |
|-----|-----|
| Detect class + measure master vs pin vs main | Conductor |
| Gate / pick SHA / reject `main`-only tips | Lead |
| Land DET commits on **`master`** | Lead (Conductor may open DET PR; base **must** be `master`) |

## Forbidden co-changes

CAP / product writers on DET · alwaysApply trio growth · pointing pin at DET `main` · AGENTS body dump of this guide.
