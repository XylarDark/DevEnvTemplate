# BOOTSTRAP.md

This file used to be a 1,700-line guide that agents were told to load at the start of a session.
It no longer holds content, and loading a file this size into every conversation is the practice
this template now argues against: it restated the Cursor rules twice, once as prose and once as a
legacy `.projectrules` block, and duplicated its own PowerShell guidance in two places.

Its content lives in smaller documents, each read when it is relevant:

| You want to | Read |
| ----------- | ---- |
| Know how **this repository** works, as an agent | [`AGENTS.md`](AGENTS.md) |
| Adopt agent/docs layers only (Unity, Unreal, no Node) | [`docs/SETUP-GUIDE.md` — Files-only adoption](docs/SETUP-GUIDE.md#files-only-adoption-agent-and-docs-layers) |
| Embed the doctor in a Node host (`.devenv/`) | [`docs/SETUP-GUIDE.md` — Embed the doctor](docs/SETUP-GUIDE.md#embed-the-doctor-node-hosts) |
| Use the doctor after embedding | [`docs/guides/embedded-usage.md`](docs/guides/embedded-usage.md) |
| Pull template updates into a host | [`docs/SYNC.md`](docs/SYNC.md) |

`AGENTS.md` is the canonical always-loaded context for **this** repository. Host projects write their own.

This pointer stays because host projects and older documentation link to this path. Do not grow it back.
