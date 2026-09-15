# Cursor cannot: Environment security (PDF Testing Phase)

**Label:** Cursor cannot. **Job:** Steer.

The PDF’s testing phase starts with **you** defining isolation. Several of the
named products are not Cursor, and this template will not ship them.

## What the PDF asked

Isolation options, from heavy to light:

- **AI-Jail** — multiple layers of isolation. The PDF calls this too complex for
  average use. Out of scope for this template.
- **Antigravity / Codex project-folder sandbox** — editor and home-directory
  restriction. Different products.
- **Multi-root workspace** — add a folder so the agent cannot see a sibling repo.
- **Docker / Podman** — container the human starts.
- **System-level kernel guard (Codex)** — not Cursor.
- **Claude `/sandbox`** (Bubblewrap / sandbox-exec) — not Cursor. Cursor uses a
  permission model (ask vs allow), not that runtime.

Plus an **explicit verify command** the agent must run. That last part we *do*
implement: [environment.md](../environment.md).

## What Cursor actually has

- Editor / project-folder restriction (you turn it on).
- Ask vs allow in the UI. The session keeps the posture it started with. We
  document mutating shell / new MCP / new util as **ask**; we cannot flip Cursor’s
  toggle from the repo.
- No first-class **domain allowlist** for web search or fetch. Web reach in
  [environment.md](../environment.md) is a **policy the agent must obey**, not an
  ACL Cursor enforces.
- Docker, multi-root, and kernel sandboxes: you start them. The agent waits.

## What you do

Fill [environment.md](../environment.md): isolation choice, web reach, verify
command. If the field is skip-web or allowlist, the agent must not fetch off-list
even though Cursor would allow it.

Do not ask the agent to build an AI-Jail, a Bubblewrap wrapper, or a domain-ACL
plugin.
