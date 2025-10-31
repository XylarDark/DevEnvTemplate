# DevEnvTemplate Implementation Guide

## Purpose

Enable any agent to quickly set up a new project (for any technology) using the `DevEnvTemplate/` folder as a reusable governance, CI/CD, and documentation scaffold.

## Prerequisites

- Access to the repository where the new project will live
- The `DevEnvTemplate/` folder present (from this repo or copied)
- GitHub as CI provider (defaults included). For other CI providers, mirror the workflows.

## High-level Flow

1) Copy template → 2) Replace placeholders → 3) Pick tech + add minimal app → 4) Wire lint/test/build → 5) Enable CI → 6) Run first PR in report-only mode → 7) Optionally enforce policies.

## Step-by-Step

### 1) Copy the Template

- Option A (recommended): Make `DevEnvTemplate/` the new repo seed
  - Create a new empty repo
  - Copy the contents of `DevEnvTemplate/` into the repo root
  - Commit as `chore(init): scaffold governance template`
- Option B: Integrate into an existing repo
  - Copy `DevEnvTemplate/*` into repo root (preserve structure)
  - Commit as `chore(governance): add template files`

### 2) Replace Placeholders

- Files to touch:
  - `SECURITY.md`, `SUPPORT.md`: update emails/domains
  - `.github/ISSUE_TEMPLATE/config.yml`: `[owner]/[repo]` links
  - `CODEOWNERS`: replace `@maintainer`, `@devops`, `@reviewer`, etc.
  - `LICENSE`: set year and org/name
  - `README.md`, `CONTRIBUTING.md`: add project name and quick-start
- Update governance references (if needed) in `.projectrules` header (date/version).

### 3) Choose Technology & Minimal App

- Add a minimal "Hello World" for your stack (examples):
  - CLI/Library: create a single entry file + unit test
  - Service/API: add a single endpoint returning health JSON
  - Web UI: render a single page with a test and a lint step
- Add package/manifest files for your toolchain:
  - Examples: `package.json`, `requirements.txt`/`pyproject.toml`, `go.mod`, `Cargo.toml`, etc.

### 4) Wire Lint/Test/Build

- Ensure commands exist so CI detects them:
  - Lint: `npm run lint` or equivalent
  - Test: `npm test` or equivalent; produce coverage where possible
  - Build (if applicable): `npm run build` or equivalent
- Update `README.md` with local run instructions and common tasks

### 5) Enable CI (GitHub Actions by default)

- Verify workflows under `.github/workflows/`:
  - `ci.yml`: lint/test/build summaries
  - `governance.yml`: runs `scripts/check-governance` (report-only)
  - `dependency-review.yml`: supply chain review (report-only)
  - `codeql.yml`: code scanning (report-only)
  - `conventional-commits.yml`: PR title check (report-only)
  - `sbom.yml`: generates SBOM artifacts
- If using another CI:
  - Mirror the steps (lint/test/build + governance + security scans)

### 6) Governance & Budgets

- `.projectrules`:
  - Confirm goals, guardrails, and testing standards match your context
  - Keep version header; bump on policy changes
  - Policy enforcement: default `report-only`. To enforce, set env `POLICY_ENFORCEMENT=enforced` in CI jobs once the team is ready
- `quality-budgets.json` (optional but recommended):
  - Set initial budgets for build time, bundle size, test time, coverage

### 7) Documentation & Templates

- PR template (`.github/PULL_REQUEST_TEMPLATE.md`) is ready with Scope Gate + Session Review
- Issue templates present for bug/feature/security
- Architecture process:
  - Create `docs/architecture/ADR-001-initial-architecture.md` using the template
  - Use `docs/rfc-template.md` for larger proposals
- Onboarding: Update `docs/onboarding.md` with stack-specific notes
- Secrets: Document env vars in `.env.example` and `docs/secrets-management.md` (do not commit secrets)

### 8) First PR (Smoke Test)

- Branch: `feat/bootstrap-<stack>`
- Include: minimal app; lint/test/build scripts; doc updates; CI enabled
- Open PR:
  - CI runs; governance/security checks report-only
  - Fix any obvious issues surfaced by CI summaries
- Merge when green

### 9) Optional Enforcement (after stabilization)

- Set `POLICY_ENFORCEMENT=enforced` for governance and/or budget scripts in CI where appropriate
- Introduce branch protection rules (required reviews, checks)

## Agent Execution Script (Reusable Prompt)

Use this in a fresh chat with an agent:

```text
Using the DevEnvTemplate folder, set up a basic development environment for <TECHNOLOGY>.

Requirements:
- Copy DevEnvTemplate contents to repo root; replace placeholders (emails, owner/repo, CODEOWNERS, LICENSE year/name)
- Create a minimal <TECHNOLOGY> app (Hello World or health endpoint)
- Add lint/test/build commands and wire them into CI
- Keep governance and security workflows report-only initially
- Document run/build/test in README; add ADR-001 initial architecture
- Open a PR to validate the setup with CI

Deliverables:
- Minimal runnable app + tests
- CI pipelines passing (report-only checks included)
- Updated docs: README, CONTRIBUTING (if needed), ADR-001
- Governance intact; POLICY_ENFORCEMENT left as report-only
```

## Acceptance Criteria

- Repo builds locally and in CI (lint/test/build) for chosen stack
- Governance and security workflows run and summarize (report-only by default)
- `README.md` shows install/run/test steps; ADR-001 exists
- Issue/PR templates render and conventional commit PR title check posts guidance
- No secrets committed; `.env.example` created/updated

## Notes & Risks

- Keep initial CI non-blocking to avoid friction; enforce later
- Avoid chmod on Windows; PowerShell scripts are provided
- Replace all `[owner]/[repo]`, placeholder emails, and CODEOWNERS before opening PR
- For non-GitHub CI, port steps 1:1: lint → test → build → governance → security

## Optional Enhancements

- Add pre-commit hooks (format/lint/secret-scan)
- Add release automation (semantic-release) once conventional commits are adopted
- Add SAST/DAST tooling when relevant
- Add container build + scan if you ship images
