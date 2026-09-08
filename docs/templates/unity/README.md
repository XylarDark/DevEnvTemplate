# Unity doc stub (optional)

Use this folder in **Unity** forks of the template.

## Suggested files

| File                      | Purpose                                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **README.md**             | Pinned editor version (from `ProjectSettings/ProjectVersion.txt`), render pipeline (e.g. URP 2D), platform targets |
| **EDITOR.md**             | Verified menu paths for **your** Unity line (from Unity docs)                                                      |
| **KNOWN_ERRORS_UNITY.md** | Package quirks, license/batchmode notes, Input System vs old input (or fold into repo root `docs/KNOWN_ERRORS.md`) |

Copy [`.cursor/rules/23-unity-csharp.mdc`](../../../.cursor/rules/23-unity-csharp.mdc) into the project if it was not added by `integrateCursorRules`; it activates when you work on `.cs`, `.unity`, `ProjectSettings/`, or `Packages/manifest.json`.
