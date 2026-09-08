# Agent skills

Procedural knowledge for AI agents. Each skill's `description` is read on every turn to decide
relevance; the body loads only when that description matches the task.

## Core (`.agents/skills/`)

Default adopters copy **only** these five skills. They cover workflow, planning, verification,
security, and multi-agent coordination — the minimum the doctor and `AGENTS.md` expect.

| Skill | Trigger |
| ----- | ------- |
| [agent-workflow](skills/agent-workflow/SKILL.md) | Any end-to-end coding task in the repo |
| [multi-agent-collaboration](skills/multi-agent-collaboration/SKILL.md) | More than one agent or person in the same tree |
| [plan-first](skills/plan-first/SKILL.md) | Multi-file or architectural work |
| [secure-coding](skills/secure-coding/SKILL.md) | Input, secrets, auth, or dependencies |
| [verification-evidence](skills/verification-evidence/SKILL.md) | Audits, health checks, guard tests, CI gates |

`integrateCursorRules` copies core skills into a host's `.agents/skills/` automatically.

## Extras (`.agents/skills-extras/`)

Optional skills for hosts that want deeper coverage. They are **not** copied by default and are
**not** loaded until you opt in — keeping the dormant-skill surface small.

| Skill | Trigger |
| ----- | ------- |
| [automation-standards](skills-extras/automation-standards/SKILL.md) | Automation driving external tools, APIs, or CI |
| [code-structure](skills-extras/code-structure/SKILL.md) | Modules, naming, file layout, performance budgets |
| [data-pipeline-safety](skills-extras/data-pipeline-safety/SKILL.md) | Author-owned databases, CMS, infra state, binaries |
| [debug-instrumentation](skills-extras/debug-instrumentation/SKILL.md) | New features, scripts, or APIs needing trace logs |
| [defensive-programming](skills-extras/defensive-programming/SKILL.md) | External input, I/O, network, async concurrency |
| [documentation](skills-extras/documentation/SKILL.md) | Comments, README, or anything under `docs/` |
| [exclusive-resource-access](skills-extras/exclusive-resource-access/SKILL.md) | Browsers, ports, devices, or other single-user resources |
| [testing-standards](skills-extras/testing-standards/SKILL.md) | Adding or updating tests or test frameworks |

### Opt in to extras

Copy the skills you need into the host's active skills directory:

```bash
# From the template root (or `.devenv/` when vendored)
cp -r .agents/skills-extras/testing-standards .agents/skills/
```

Or copy all extras:

```bash
cp -r .agents/skills-extras/* .agents/skills/
```

When running the doctor's agent-layer integration with extras:

```bash
npm run doctor:fix
# The integration API accepts includeSkillExtras: true when called programmatically.
```

Hosts that already copied the full skill set before this split can leave extra skills in place;
nothing breaks. New adopters start with the five core skills above.

## Portability

Skills copied into host projects travel verbatim. Sections marked **Localize on copy** describe
this template's commands and layout — rewrite those for your project. `tests/unit/skill-portability.test.js`
enforces this rule on core skills (the default copied set).
