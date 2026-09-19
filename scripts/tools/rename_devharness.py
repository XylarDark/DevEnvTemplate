"""One-shot DevHarness branding rename for DevEnvTemplate repo."""
from __future__ import annotations

import json
from pathlib import Path

root = Path(r"c:\dev\HomeWorld\DevEnvTemplate")

pj = json.loads((root / "package.json").read_text(encoding="utf-8"))
pj["name"] = "devharness"
pj["description"] = (
    "DevHarness — doctor and agent-context layers for AI-assisted development "
    "(formerly DevEnvTemplate)"
)
bins = pj.get("bin") or {}
bins["devharness-init"] = bins.get("devenv-init", "./scripts/init.js")
pj["bin"] = bins
(root / "package.json").write_text(json.dumps(pj, indent=2) + "\n", encoding="utf-8")

readme = (root / "README.md").read_text(encoding="utf-8")
if readme.startswith("# DevEnvTemplate"):
    readme = readme.replace(
        "# DevEnvTemplate",
        "# DevHarness\n\n"
        "> Formerly **DevEnvTemplate**. Same layers, doctor, and adopt-by-choice model.",
        1,
    )
readme = readme.replace(
    "**A menu of development-environment layers",
    "**DevHarness** is a menu of development-environment layers",
    1,
)
(root / "README.md").write_text(readme, encoding="utf-8")

(root / "docs" / "DEVHARNESS_RENAME.md").write_text(
    """# DevHarness rename

**Date:** 2026-09-19

The product formerly branded **DevEnvTemplate** is now **DevHarness**.

| Item | Status |
|------|--------|
| npm `package.json` `name` | `devharness` |
| CLI | `devharness-init` (alias); `devenv-init` kept for compatibility |
| GitHub repo | Still named `DevEnvTemplate` until Lead renames the remote |
| Default branch | `master` (this repo); consumers may say \"main\" loosely |
| Consuming repos (e.g. HomeWorld) | May keep vendored path `DevEnvTemplate/` until a dedicated path migrate |

Archive docs under `docs/archive/` are historical and were not mass-rewritten.
""",
    encoding="utf-8",
)

# Light touch AGENTS.md product name if present
agents = root / "AGENTS.md"
if agents.is_file():
    t = agents.read_text(encoding="utf-8")
    if "DevEnvTemplate" in t and "DevHarness" not in t[:200]:
        t = (
            "> **Product name:** **DevHarness** (repo historically DevEnvTemplate).\n\n" + t
        )
        agents.write_text(t, encoding="utf-8")

# CHANGELOG entry
cl = root / "CHANGELOG.md"
if cl.is_file():
    t = cl.read_text(encoding="utf-8")
    entry = (
        "## Unreleased\n\n"
        "### Changed\n\n"
        "- Product rename: **DevEnvTemplate** → **DevHarness** "
        "(`package.json` name `devharness`, `devharness-init` CLI alias). "
        "See [docs/DEVHARNESS_RENAME.md](docs/DEVHARNESS_RENAME.md).\n\n"
    )
    if "DevHarness" not in t[:800]:
        cl.write_text(entry + t, encoding="utf-8")

print("DevHarness branding applied")
