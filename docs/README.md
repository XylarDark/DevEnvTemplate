# Documentation index

Structure is defined by [DOCS_LAYOUT.md](DOCS_LAYOUT.md). Add new documents to the
subdirectory that fits, not to this root.

## Start here

| Document                                 | Read it when                                     |
| ---------------------------------------- | ------------------------------------------------ |
| [SETUP-GUIDE.md](SETUP-GUIDE.md)         | First-time adoption: files-only (no Node) or doctor embed under `.devenv/`. |
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

## Decisions

| Document                                                                         | Decides                                                                             |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [adr/001-agent-hook-failure-posture.md](adr/001-agent-hook-failure-posture.md)   | Superseded. Whether the secret-scan hook fails open or closed, and what that costs. |
| [adr/002-remove-the-secret-scan-hook.md](adr/002-remove-the-secret-scan-hook.md) | Why the hook was removed, and which controls carry secret protection now.           |

## Agent context

Start at [AGENTS.md](../AGENTS.md) in the repository root. It is the canonical, always-loaded
context; everything else in the agent layer loads on demand:

| Path                                           | Loads when                                        |
| ---------------------------------------------- | ------------------------------------------------- |
| [`.agents/skills/`](../.agents/skills/)        | A skill's `description` matches the current task. |
| [`.cursor/rules/`](../.cursor/rules/README.md) | You open a file matching the rule's globs.        |
| [`.cursor/agents/`](../.cursor/agents/)        | You invoke that subagent.                         |
| [guides/mcp-hygiene.md](guides/mcp-hygiene.md) | You add or change an MCP server.                  |

## Archive

[archive/](archive/) holds superseded plans, RFCs, and release notes. It is kept for
provenance and is deliberately not maintained against current behavior.
