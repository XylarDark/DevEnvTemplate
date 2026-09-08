---
name: documentation
description: Use when writing or updating code comments, README or API docs, or adding any file under docs/ - covers comment intent, the canonical docs/ layout from DOCS_LAYOUT.md, the entry shapes for the known-errors and automation-gaps logs, and verifying that relative links still resolve after a move.
---

# Documentation

## Code comments

- Explain **why**, not **what**; the code should already say what it does.
- Comment complex business logic and non-obvious decisions.
- Update comments when the code they describe changes.
- Delete commented-out code instead of leaving it as history.

## Function and API documentation

- Document public APIs: parameters, return values, and thrown errors.
- Include a usage example for anything with non-obvious inputs.
- Document side effects, and performance characteristics where they matter.
- For HTTP APIs, document every public endpoint with request and response examples, error
  responses, and authentication requirements.

Optional file headers on complex files: a one-line purpose and the key exports.

## README standards

A README covers: what the project is, how to install it, how to use it (with examples),
what can be configured, how to contribute, and the license.

## Where documentation goes

All documentation lives under `docs/`, laid out per `docs/DOCS_LAYOUT.md`, which is the
semantic source of truth for what belongs where.

**The docs root is an exhaustive list of entry points.** `DOCS_LAYOUT.md` owns that
inventory. Read it there rather than trusting the copy below — a second copy of a list
is a second thing to keep current, and it is always the copy that goes stale.

> **Localize on copy.** The two tables below and the link-checking command further down
> describe DevEnvTemplate's docs tree and its tooling. A host project has its own layout
> and may have no link checker at all; replace them rather than leaving them to mislead.

| File                           | Purpose                                  |
| ------------------------------ | ---------------------------------------- |
| `README.md`                    | Docs index                               |
| `DOCS_LAYOUT.md`               | The canonical structure itself           |
| `BEST-PRACTICES.md`            | Cross-cutting practices                  |
| `TROUBLESHOOTING.md`           | Common failures and fixes                |
| `KNOWN_ERRORS.md`              | Recurring errors and fixes (append-only) |
| `SETUP-GUIDE.md`               | Getting started with this template       |
| `SYNC.md`                      | Syncing from the template                |
| `DevEnvTemplate_RULES_SYNC.md` | Append-only log of template rule changes |

Everything else goes in a topic subdirectory:

| Directory         | Contents                                                      |
| ----------------- | ------------------------------------------------------------- |
| `guides/`         | How-to and long-form guides                                   |
| `architecture/`   | System design, diagrams, ADR supplements                      |
| `best-practices/` | Per-stack practice guides (`python.md`, `fastapi.md`)         |
| `operational/`    | Automation gaps, recurring maintenance                        |
| `templates/`      | Fork-specific stubs (`templates/unity/`, `templates/unreal/`) |
| `archive/`        | Superseded plans, RFCs, and release notes                     |

`DOCS_LAYOUT.md` lists further optional folders (`adr/`, `runbooks/`, `setup/`,
`security/`, `deployment/`, `api/`). Create a subdirectory only once you have a document to
put in it, and add its row to `DOCS_LAYOUT.md` in the same change.

Rules for new docs:

1. Put the file in the subdirectory that fits. Do not add it to the docs root unless it is
   one of the entry points above.
2. If no folder fits, add the folder and a one-line purpose to `DOCS_LAYOUT.md` **first**,
   then write the document.
3. `docs/archive/` is read-only by convention. Do not update archived documents to match
   current behavior — their value is recording what was decided at the time. Anything still
   true belongs in a live document.
4. `config/docs-organization.yaml` drives pattern-based moves (see
   `docs/guides/docs-organization.md`). Automation may relocate a misplaced file, but author
   it in the right folder anyway.

## The two operational logs, and why their shape matters

Two documents are append-only records rather than explanations, and both earn their
keep only if a future reader can find the entry they need.

**`docs/KNOWN_ERRORS.md`** — one entry per expensive or non-obvious failure, with a
fixed shape:

| Field      | Holds                                                           |
| ---------- | --------------------------------------------------------------- |
| Date       | When it was diagnosed                                           |
| Symptom    | What was observed, in the words a future reader will search for |
| Cause      | The actual mechanism, not the first suspect                     |
| Fix        | What was changed, with the commit or file                       |
| Prevention | The test, rule, or guard that stops a recurrence                |

Title the entry with the **symptom**, not the cause. Nobody arrives knowing the cause;
they arrive with an error string and a behavior. "Tests pass while asserting nothing"
is findable, "helper returned the wrong slice" is not. Where it helps, record what
looked like the cause and was not — that saves the next reader the same detour.

When a failure you already have an entry for shows up wearing a new face, **augment
the existing entry with the new symptom** rather than filing a second one. Duplicates
split the search results and each copy then decays separately.

**`docs/operational/automation-gaps.md`** — limits that cannot be automated away: the
setting with no API, the resource with no lock, the cleanup path that cannot run. Each
entry records what is needed, why automation fails, the interim workaround, and what
would close the gap. This file exists to stop the same doomed attempt being retried
every few months, so an entry is only finished when it says what was _ruled out_.

## Links

- Write paths from the repo root (`docs/guides/usage.md`) or use a correct relative path
  from the current file.
- Use descriptive link text, never "click here".
- Use relative paths for internal links and absolute URLs for external ones.
- Verify links before committing:

  ```bash
  npm run check:doc-links
  ```

  This resolves every relative markdown link in the repo and fails on any that is broken.
  Run it after moving or renaming a document.

## Maintenance

- Update docs in the same change as the code they describe, once that code is in an area the
  host's `AGENTS.md` marks as **settled**. While an area is **shaping**, documenting a shape
  that is about to change writes the document twice; the update is owed at promotion.
- Delete outdated documentation rather than leaving it to mislead. This one does not wait for
  promotion: a stale document actively misleads, which is worse than an absent one.
- Keep examples working; test them before committing.

## Checklist

- [ ] Public APIs documented
- [ ] README current
- [ ] Complex logic explained by a comment that gives the reason
- [ ] Examples run as written
- [ ] New docs placed per `DOCS_LAYOUT.md`
- [ ] `npm run check:doc-links` passes
- [ ] No outdated documentation left behind
