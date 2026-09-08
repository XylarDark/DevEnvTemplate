# Documentation index

Structure is defined by [DOCS_LAYOUT.md](DOCS_LAYOUT.md). Add new documents to the
subdirectory that fits, not to this root.

## Start here

| Document                                 | Read it when                                     |
| ---------------------------------------- | ------------------------------------------------ |
| [SETUP-GUIDE.md](SETUP-GUIDE.md)         | Setting the template up for the first time.      |
| [guides/usage.md](guides/usage.md)       | Running the doctor day to day.                   |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Something failed and you want the known fix.     |
| [KNOWN_ERRORS.md](KNOWN_ERRORS.md)       | Checking whether a failure has been seen before. |

## Reference

| Document                                                         | Contents                                             |
| ---------------------------------------------------------------- | ---------------------------------------------------- |
| [architecture/overview.md](architecture/overview.md)             | Module layout and the doctor pipeline.               |
| [architecture/tooling.md](architecture/tooling.md)               | Why the core is TypeScript, and performance levers.  |
| [BEST-PRACTICES.md](BEST-PRACTICES.md)                           | Cross-cutting practices.                             |
| [best-practices/](best-practices/)                               | Per-stack guides (Python, Next.js, FastAPI, deploy). |
| [guides/tool-recommendations.md](guides/tool-recommendations.md) | Which tool to reach for.                             |

## Operating it

| Document                                                         | Contents                                      |
| ---------------------------------------------------------------- | --------------------------------------------- |
| [SYNC.md](SYNC.md)                                               | Pulling template updates into a host project. |
| [guides/embedded-usage.md](guides/embedded-usage.md)             | Running as a vendored `.devenv/` directory.   |
| [guides/docs-organization.md](guides/docs-organization.md)       | How the docs organizer moves files.           |
| [operational/automation-gaps.md](operational/automation-gaps.md) | What cannot be automated, and why.            |
| [guides/mistake-patterns.md](guides/mistake-patterns.md)         | Recurring mistakes worth recognizing early.   |

## Agent context

Always-true project facts live in [AGENTS.md](../AGENTS.md) at the repository root, with
scoped rules under [.cursor/rules/](../.cursor/rules/README.md). Start there rather than here.

## Archive

[archive/](archive/) holds superseded plans, RFCs, and release notes. It is kept for
provenance and is deliberately not maintained against current behavior.
