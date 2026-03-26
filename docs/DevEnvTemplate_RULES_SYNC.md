# Rules sync note (HomeWorld patterns → DevEnvTemplate)

Append-only log of agnostic rule/doc updates ported from practical use in game/engine repos without copying project-specific automation.

| Date | Change |
|------|--------|
| 2026-03-26 | `automation-standards.mdc` v2: API → script → UI (last resort) + `docs/operational/automation-gaps.md`; not “fully autonomous only.” |
| 2026-03-26 | `07-ai-agent-behavior.mdc`: conversation/context (new chat, long threads). |
| 2026-03-26 | `docs/DOCS_LAYOUT.md`, `19-docs-directory-structure.mdc`, `18-content-and-data-pipelines.mdc`, `docs/KNOWN_ERRORS.md`, `docs/operational/automation-gaps.md`. |
| 2026-03-26 | `21-unreal-engine.mdc`, `22-unreal-editor-ui.mdc` (conditional globs); `docs/templates/unreal/README.md`. |
| 2026-03-26 | `StackReport` + `detectUnrealProject()` hint; cursor-rules integration copies extended core + Unreal when `unrealProjectDetected`. |
| 2026-03-26 | `STANDARD_CORE_FILES` in integration/adapter includes `16`–`19`, `automation-standards.mdc`. |

**Not ported:** full-automation-no-manual-steps, PCG/GAS/Unreal API pitfall tables, product-specific MCP ports.
