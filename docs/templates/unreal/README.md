# Unreal Engine doc stub (optional)

Use this folder in **game engine** forks of the template.

## Suggested files

| File | Purpose |
|------|--------|
| **README.md** | Pinned engine version (from `.uproject` / build image), link to Epic release notes |
| **EDITOR_UI.md** | Verified menu paths and panel names for **your** engine line (from Epic docs) |
| **KNOWN_ERRORS_UE.md** | Engine API renames, plugin quirks, import settings (or fold into repo root `docs/KNOWN_ERRORS.md`) |

Copy [`.cursor/rules/21-unreal-engine.mdc`](../../../.cursor/rules/21-unreal-engine.mdc) and [`22-unreal-editor-ui.mdc`](../../../.cursor/rules/22-unreal-editor-ui.mdc) into the project if they were not added by `integrateCursorRules`; they activate when you work on `.uproject`, `*Build.cs`, or `Source/**/*.cpp`.
