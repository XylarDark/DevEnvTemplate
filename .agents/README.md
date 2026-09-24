# Agent skills

Procedural knowledge for AI agents. Each skill's `description` is read on every turn to decide
relevance; the body loads only when that description matches the task.

## Core (`.agents/skills/`)

Default adopters copy **only** these six core skills. They cover workflow, planning, verification,
security, multi-agent coordination, and token-efficient context — the minimum the doctor and
`AGENTS.md` expect.

| Skill | Trigger |
| ----- | ------- |
| [agent-workflow](skills/agent-workflow/SKILL.md) | Any end-to-end coding task in the repo |
| [multi-agent-collaboration](skills/multi-agent-collaboration/SKILL.md) | More than one agent or person in the same tree |
| [plan-first](skills/plan-first/SKILL.md) | Multi-file or architectural work |
| [secure-coding](skills/secure-coding/SKILL.md) | Input, secrets, auth, or dependencies |
| [token-efficient-context](skills/token-efficient-context/SKILL.md) | Planning multi-file work, agent runs, tokens, MCP, or editing rules/skills/AGENTS.md |
| [verification-evidence](skills/verification-evidence/SKILL.md) | Audits, health checks, guard tests, CI gates |

`integrateCursorRules` copies core skills into a host's `.agents/skills/` automatically.

## Extras (`.agents/skills-extras/`)

Optional skills for hosts that want deeper coverage. They are **not** copied by default and are
**not** loaded until you opt in — keeping the dormant-skill surface small.

| Skill | Trigger |
| ----- | ------- |
| [architecture-tradeoffs](skills-extras/architecture-tradeoffs/SKILL.md) | Module boundary, data ownership, or cross-quantum workflow |
| [automation-standards](skills-extras/automation-standards/SKILL.md) | Automation driving external tools, APIs, or CI |
| [code-structure](skills-extras/code-structure/SKILL.md) | Modules, naming, file layout, performance budgets |
| [data-pipeline-safety](skills-extras/data-pipeline-safety/SKILL.md) | Author-owned databases, CMS, infra state, binaries |
| [debug-instrumentation](skills-extras/debug-instrumentation/SKILL.md) | New features, scripts, or APIs needing trace logs |
| [defensive-programming](skills-extras/defensive-programming/SKILL.md) | External input, I/O, network, async concurrency |
| [documentation](skills-extras/documentation/SKILL.md) | Comments, README, or anything under `docs/` |
| [exclusive-resource-access](skills-extras/exclusive-resource-access/SKILL.md) | Browsers, ports, devices, or other single-user resources |
| [multi-agent-swarm](skills-extras/multi-agent-swarm/SKILL.md) | Conductor-led swarms, collision maps, handoffs, phase gates |
| [taste-gate](skills-extras/taste-gate/SKILL.md) | Would invent product feel, purpose, vision, or next track |
| [taste-profiler](skills-extras/taste-profiler/SKILL.md) | Bootstrap / stage / promote durable taste profile |
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
nothing breaks. New adopters start with the six core skills above.

## Authoring

Keep `SKILL.md` short: only what the model does not already know. Extra files in the
skill folder load on demand.

- **`description`:** one sentence. Third-person *capability*, then this repo's
  `Use when …` trigger (Cursor matching). Do not lecture in the description; it is
  always-on.
- **Degrees of freedom:** high when the task is judgment (reviews); low when the
  agent must run exactly one script. Match shaping vs settled in `AGENTS.md`:
  shaping = higher freedom; settled work and migrations = lower.
- **Attach only what the task needs.** Core vs extras already splits the dormant
  surface; do not add a seventh core skill for a niche procedure.

Do not rewrite every existing description to match this. New skills follow it.

## Portability

Skills copied into host projects travel verbatim. Sections marked **Localize on copy** describe
this template's commands and layout — rewrite those for your project. `tests/unit/skill-portability.test.js`
enforces this rule on core skills (the default copied set).
