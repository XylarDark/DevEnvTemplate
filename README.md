# DevEnvTemplate

A zero-commands, drop-in development environment that automatically understands your technology stack and enforces Plan-first development with Cursor.

## What It Does

**Drop DevEnvTemplate into any repository** and it immediately:

- **Auto-detects** your technology stack (Node.js, React, TypeScript, testing frameworks, etc.)
- **Analyzes gaps** against development best practices
- **Generates plan-only PRs** for improvements when gaps are found
- **Enforces Plan-first workflow** - Cursor Plan mode becomes your primary development interface
- **Posts CI comments** with stack analysis and validation status

**No local commands required** - everything happens through Cursor Plan mode and CI automation.

## Quick Start

### 1. Drop into Your Repository

Copy the `DevEnvTemplate/` folder into your project root:

```bash
# Your project structure becomes:
your-project/
├── DevEnvTemplate/     # ← Drop this entire folder here
│   ├── .github/
│   ├── docs/
│   └── .projectrules
├── your-code/
└── package.json
```

### 2. Push & Let CI Work

Push your changes. DevEnvTemplate automatically:

- **Stack Analysis**: Detects your technologies and configurations
- **Gap Analysis**: Identifies areas for improvement
- **Plan Generation**: Creates plan-only PRs for suggested improvements (optional)
- **CI Guards**: Enforces Plan-first workflow on future PRs

### 3. Use Cursor Plan Mode

All development now happens through Cursor's Plan mode:

1. **Open Plan Mode**: `Cmd/Ctrl + Shift + P` → "Plan Mode"
2. **Paste a snippet** from `DevEnvTemplate/docs/snippets/plan-mode/`
3. **Attach CI artifacts** (stack report, gap analysis) for context
4. **Generate and execute plans** for all code changes

## How It Works

### Plan Phase (Cursor Plan Mode)
- Define problems and requirements in context contracts
- Generate detailed implementation plans
- Get stakeholder approval via plan-only PRs
- CI validates plan completeness and impact analysis

### Agent Phase (Implementation)
- Execute approved plans using Cursor
- Changes validated against plan predictions
- Quality gates ensure code standards
- Metrics logged for continuous improvement

### CI Automation
- **Stack Intel**: Auto-detects tech stack and identifies gaps
- **Plan Guard**: Requires plan-only PR approval for code changes
- **Impact Guard**: Validates actual changes match plan predictions
- **PR Comments**: Provides status and guidance

## Kick-off Prompt (Cursor Plan Mode)

Use this prompt to start any task. Open Cursor Plan Mode (Cmd/Ctrl + Shift + P → "Plan Mode"), paste this block, and fill in the placeholders. Attach CI artifacts for context.

```
I need a detailed, step-by-step implementation plan that follows DevEnvTemplate's Plan/Agent workflow.

PROJECT CONTEXT (from CI artifacts):
- Tech Stack (paste from .devenv/stack-report.json)
- Current Gaps (paste from .devenv/gaps-report.md)
- Repository rules: `.projectrules` (assume default unless noted)

TASK
- What: [clear problem/feature]
- Why: [business/quality rationale]
- Scope: [paths/modules]

CONSTRAINTS
- Follow DevEnvTemplate patterns (see docs/engineering-handbook.md)
- Plan-first only; no code yet
- Keep diffs minimal and modular
- Security, performance, and accessibility considered where relevant

ACCEPTANCE CRITERIA
- [ ] Addresses the stated goals
- [ ] Lists exact files to add/modify (paths)
- [ ] Defines tests (unit/integration/E2E as applicable)
- [ ] Includes rollback plan and risks
- [ ] Aligns with CI guards (Plan gate, Impact validation)

REQUEST
Create a plan with:
1) Numbered tasks with rationale
2) Exact file paths and granular edits expected
3) Test plan per task
4) Impact prediction: files expected to change
5) Risks, mitigations, and rollback
6) Success metrics and verification steps

NOTES
- If gaps exist in context, ask for the smallest set of clarifying details
- Reference CI artifacts when proposing impact
```

## Repo Upgrade Prompt (Cursor Plan Mode)

Use this prompt to analyze and upgrade any repository to DevEnvTemplate standards. Open Cursor Plan Mode (Cmd/Ctrl + Shift + P → "Plan Mode"), paste this block, and attach CI artifacts.

```
Goal: Analyze this repository and produce a plan to upgrade it to DevEnvTemplate standards (Plan/Agent-first, zero local commands), then outline the exact code changes required.

PROJECT CONTEXT (attach or paste):
- Tech Stack: [paste contents of .devenv/stack-report.json]
- Gaps: [paste relevant sections from .devenv/gaps-report.md]
- Repository rules: `.projectrules` (assume default unless noted)

CONSTRAINTS
- Plan-first only; do not write code yet
- Keep diffs minimal, modular, and reversible
- Align with CI guards: Plan gate + Impact validation
- No local CLI usage; CI automation only

SCOPE
- Upgrade linting/typing/testing/security to baseline
- Enforce import hygiene and boundaries
- Add/adjust CI jobs to validate plan-first and impact alignment
- Remove or archive flows that are not Plan/Agent-first

ACCEPTANCE CRITERIA
- [ ] Exact files to create/modify/delete listed with paths
- [ ] Impact prediction: enumerate files expected to change
- [ ] Tests specified (unit/integration/E2E as applicable)
- [ ] Risk, mitigations, and rollback per task
- [ ] CI validation passes with Plan/Agent guard and impact checks
- [ ] Documentation updated (README, contributing, checklists) where needed

REQUEST
Produce a detailed, step-by-step implementation plan that includes:
1) Numbered tasks with rationale and effort
2) Specific file paths and the granular edits expected
3) Test strategy per task
4) Impact prediction (files/modules) for CI comparison
5) Risks, mitigations, and rollback steps
6) Success metrics and verification steps

If any critical context is missing, ask up to 3 concise clarifying questions before finalizing the plan.
```

## Configuration

Control enforcement through GitHub repository variables:

### Repository Settings → Secrets and Variables → Variables

| Variable | Values | Description |
|----------|--------|-------------|
| `STRICT_PLAN_GUARD` | `true`/`false` | Require plan-only PRs for code changes |
| `IMPACT_GUARD` | `warn`/`strict`/`false` | Impact validation level |

### Default Behavior
- **Stack analysis**: Always runs and posts PR comments
- **Plan guard**: Disabled (set `STRICT_PLAN_GUARD=true` to enable)
- **Impact guard**: Disabled (set `IMPACT_GUARD=warn` to enable)

## CI Artifacts

DevEnvTemplate generates these artifacts automatically:

- **`.devenv/stack-report.json`** - Detected technologies and configurations
- **`.devenv/gaps-report.md`** - Areas for improvement with specific recommendations
- **`plans/*.md`** - Auto-generated hardening plans (when gaps found)

## Development Workflow

### For New Features
1. **Create Context Contract** (JSON file defining problem, goals, constraints)
2. **Use Cursor Plan Mode** to generate detailed implementation plan
3. **Submit Plan-Only PR** for approval (if `STRICT_PLAN_GUARD=true`)
4. **Implement Code** following approved plan
5. **CI Validates** changes match plan predictions

### For Improvements
1. **CI detects gaps** and posts analysis comment
2. **Plan-only PR created** with improvement tasks (optional)
3. **Review and approve** the hardening plan
4. **Use Cursor Plan Mode** to execute improvements
5. **CI validates** implementation quality

## Benefits

- **Zero Commands**: Drop folder, push, and Cursor handles everything
- **Plan-First**: Better requirements gathering and stakeholder alignment
- **Quality Gates**: Automated validation prevents regressions
- **Continuous Improvement**: Metrics and gap analysis drive better practices
- **Technology Agnostic**: Works with any stack (Node.js, Python, Go, etc.)

## Documentation

- [Prompt Lifecycle Guide](docs/guides/prompt-lifecycle.md) - 5-phase development process
- [Cursor Plan Integration](docs/guides/cursor-plan-integration.md) - Using Plan mode effectively
- [Engineering Handbook](docs/engineering-handbook.md) - Architecture and best practices
- [Plan Mode Snippets](docs/snippets/plan-mode/) - Ready-to-use Plan mode templates
