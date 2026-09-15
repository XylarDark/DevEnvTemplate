# Environment and verification (human-owned) — Steer

You own isolation, web reach, permission posture, and which command counts as
evidence. That is the wheel: how far the agent may reach, and what counts as
proof. The agent owns running that command and reporting counts. It does not
invent a sandbox, an allowlist, or a “linters are clean” stand-in. See
[OWNERSHIP.md](OWNERSHIP.md).

## Options the agent must offer

When `Choice:` or the command is still blank **for this task**:

1. **Editor sandbox** + this repo’s default (recommended): `npm run verify` (settled) or
   `npm run doctor '--' --fast` (shaping).
2. **Multi-root workspace** — I’ll add the extra folder; agent waits until I say it is open.
3. **Container** (Docker / Podman) — I’ll start it; agent waits.
4. **None** — I accept host-level access; I’ll say why in chat.
5. **Custom command** — I’ll paste one line; that is the only evidence that counts.
6. **Skip** — only for a typo / one-liner; agent still says what it did not verify.

Hosts replace option 1 with their own default (`pytest …`, Unreal editor tests, and so on).

## Isolation

Choose one. More isolation is safer and slower; none is a conscious choice.

| Choice | Use when |
| ------ | -------- |
| Editor sandbox / project-folder restriction | Default for local agent work |
| Multi-root workspace (extra folder added) | The agent must not see a sibling repo |
| Container (Docker / Podman) | The work touches the host in ways you do not want |
| None | You accept host-level access; say why below |

```
Choice:
Why:
```

## Verify command

One line the agent can paste. In this repository that is usually `npm run verify`
for settled work and `npm run doctor '--' --fast` while shaping. Hosts write their
own (`pytest tests/api/v2/ && python -m mypy src/`, Unreal editor tests, and so on).

```
(fill in the command)
```

Evidence the command must print (counts, not “passed”):

```
(fill in)
```

## Web reach (human-owned)

Cursor has no first-party domain ACL. This is a policy the agent must obey: do not
fetch or search off-list. Server reach is also [MCP hygiene](../guides/mcp-hygiene.md).

The agent does **not** invent an allowlist.

| Choice | Meaning |
| ------ | ------- |
| Unrestricted | Agent may fetch and search as the task needs |
| Allowlist | Agent may fetch/search only the domains listed below |
| Skip-web | Agent does not fetch or search the public web |

```
Choice: (unrestricted | allowlist | skip-web)
Domains (if allowlist):
```

When this field is still blank, offer: (1) unrestricted, (2) I’ll paste an allowlist,
(3) skip-web, (4) skip this field.

## Permission posture (human-owned)

Cursor's UI owns enforcement. The agent still follows this:

- **Allow:** read, grep, glob, targeted file reads.
- **Ask:** mutating shell, new MCP server, new shared util.

A session keeps the posture it started with; do not silently widen it.

Isolation products Cursor does not ship (AI-Jail, Codex kernel guard, Claude
`/sandbox`): [cursor-cannot/environment-security.md](cursor-cannot/environment-security.md).
