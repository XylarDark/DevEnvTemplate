# Documentation directory layout (canonical)

**Purpose:** Single place that defines **where documentation belongs** in this repo. Agents and humans should place new docs under the right subdirectory and keep the root tidy.

**Policy:** Do not add new informal buckets at `docs/` root without updating **this file** first.

---

## Root (`docs/`) — entry points and indexes

| File               | Purpose                              |
| ------------------ | ------------------------------------ |
| **README.md**      | Docs index.                          |
| **DOCS_LAYOUT.md** | This file — canonical structure.     |
| **KNOWN_ERRORS.md** | Recurring errors and fixes log.     |

Adjust names to match your project; keep **DOCS_LAYOUT** updated when you add or rename entry files.

---

## Topic subdirectories (recommended)

| Directory        | Purpose                          |
| ---------------- | -------------------------------- |
| **guides/**      | How-to and long-form guides      |
| **architecture/** | System design, diagrams, ADRs   |
| **operational/** | Automation gaps, maintenance     |
| **archive/**     | Superseded plans kept for history |

Create a subdirectory only when you have at least one document to place there, then add a row here.
