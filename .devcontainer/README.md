# Dev container

A pinned, non-root Linux environment with the repository's Node baseline and dependencies already
installed.

## Why this exists

Permissive agent modes — auto-run, YOLO mode, unattended background agents — are only defensible
when the blast radius is bounded. On the host, "let the agent run commands without asking" grants
access to your SSH keys, your cloud credentials, your other repositories, and your shell history.
Inside this container it grants access to a checkout of this repository and a package cache.

That difference is what makes the trade worth taking. The container is not a security boundary
against a determined attacker, but it removes the accidents that actually happen: a `rm -rf` with a
wrong variable, a script that reads `~/.aws/credentials`, a dependency postinstall script with
network access to your machine.

## Use it

Open the repository in VS Code or Cursor and accept **Reopen in Container**, or run
`devcontainer up --workspace-folder .` with the [dev container CLI](https://github.com/devcontainers/cli).

Verify the environment before trusting it:

```bash
npm run verify
```

## What is deliberately not here

- **No secrets, and no host credential mounts.** If a task needs a token, pass it explicitly for
  that task. A container with your credentials mounted into it is just your host with extra steps.
- **No Docker-in-Docker.** It would hand the container control of the host daemon, which undoes the
  isolation this file exists to provide. Add it only if a task genuinely needs it, and know what you
  are giving up.
- **No `--privileged` and no root.** See `remoteUser` in `devcontainer.json`.

## Keeping it current

The image tag is pinned to the Node major version in `package.json` `engines` and `volta`. When you
raise the Node floor, update all three in the same commit, otherwise CI and the container verify
against different runtimes and the container stops being evidence of anything.
