# Rules sync note (HomeWorld patterns → DevEnvTemplate)

Append-only log of agnostic rule/doc updates ported from practical use in game/engine repos without copying project-specific automation.

| Date       | Change                                                                                                                                                                                  |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-03-26 | `automation-standards.mdc` v2: API → script → UI (last resort) + `docs/operational/automation-gaps.md`; not “fully autonomous only.”                                                    |
| 2026-03-26 | `07-ai-agent-behavior.mdc`: conversation/context (new chat, long threads).                                                                                                              |
| 2026-03-26 | `docs/DOCS_LAYOUT.md`, `19-docs-directory-structure.mdc`, `18-content-and-data-pipelines.mdc`, `docs/KNOWN_ERRORS.md`, `docs/operational/automation-gaps.md`.                           |
| 2026-03-26 | `21-unreal-engine.mdc`, `22-unreal-editor-ui.mdc` (conditional globs); `docs/templates/unreal/README.md`.                                                                               |
| 2026-03-26 | `StackReport` + `detectUnrealProject()` hint; cursor-rules integration copies extended core + Unreal when `unrealProjectDetected`.                                                      |
| 2026-08-16 | Cursor 2026 setup: root `AGENTS.md`; official frontmatter (`description`, `globs`, `alwaysApply`); slim always-on set; `08-project-context.mdc` is template-only (not copied to hosts). |
| 2026-08-16 | `23-unity-csharp.mdc`, `docs/templates/unity/README.md`; `StackReport.unityProjectDetected`; adapter/integration copy Unreal **and** Unity conditional rules.                           |
| 2026-08-16 | Converted `06`, `16`, `18`, `19` from always-on to intelligent/glob apply.                                                                                                              |
| 2026-09-07 | Inverted the context layer: `AGENTS.md` is canonical, the 14 always-on rules became `.agents/skills/`, and `.cursor/rules/` is glob-scoped only. Added `.cursor/agents/`, a fail-closed `.cursor/hooks/secret-scan.js`, and `.cursor/mcp.json.example`. |

**Not ported:** full-automation-no-manual-steps, PCG/GAS/Unreal API pitfall tables, product-specific MCP ports.
