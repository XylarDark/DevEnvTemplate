# Project Rules Changelog

This document tracks the evolution of `.projectrules` - the central governance file for this project. Changes are documented here to provide transparency and rationale for governance decisions.

## Format

- **Date**: YYYY-MM-DD
- **Version**: Major.Minor (incremented for policy/guardrail changes)
- **Highlights**: Summary of changes
- **Rationale**: Why the changes were made
- **Impacted Files**: Files modified as a result

---

## 2025-11-06 - v1.3 - Plan/Agent CI Hardening

### Highlights

- **Zero-Commands Workflow**: All development now happens through Cursor Plan Mode; removed local CLI script requirements
- **Multi-Ecosystem Support**: Stack detection expanded to Python, Go, Java, .NET with framework recognition
- **Plan/Agent Validation**: Ajv-based context contract validation, impact prediction/comparison, high-risk assumption blocking
- **CI Artifacts**: Stack reports, gap analysis, context packs, and metrics logging as authoritative sources
- **Assumptions Policy**: High-risk assumptions must have validation plans and be resolved before implementation merge
- **PR Automation**: Auto-labeling workflow for plan-only vs implementation PRs

### Rationale

- Eliminate local CLI complexity and enforce Plan-first workflow through CI-only tooling
- Support broader technology ecosystems beyond Node.js while maintaining governance standards
- Strengthen Plan/Agent methodology with automated validation and impact analysis
- Provide comprehensive artifacts for Cursor Plan Mode to enable informed planning decisions
- Prevent implementation risks from unresolved assumptions through CI blocking
- Improve PR management through automated labeling and validation

### Impacted Files

- `.projectrules` (added Plan/Agent workflow, assumptions policy, multi-ecosystem support, CI artifacts policies)
- `docs/rules-changelog.md` (this entry)
- `docs/engineering-handbook.md` (added Plan/Agent validation and CI artifacts sections)
- `.github/tools/context-validate.js` (new Ajv-based context validation)
- `.github/tools/impact-predictor.js` (new impact prediction and comparison)
- `.github/tools/metrics-log-ci.js` (new CI metrics logging)
- `.github/tools/context-assemble-ci.js` (new context pack assembly)
- `.github/tools/stack-detector.js` (enhanced with Python/Go/Java/.NET detection)
- `.github/workflows/ci.yml` (integrated new validation tools and artifacts)
- `.github/workflows/auto-label.yml` (new PR auto-labeling workflow)

---

## 2025-11-06 - v1.3 - Repository Structure Consolidation and Deployment Orchestration

### Highlights

- **Repository Layout Standardization**: Moved community health files to `.github/`, configuration to `config/`, templates to `packs/`
- **Deployment Pipeline**: Added unified `scripts/deploy/prepare-and-deploy.js` orchestrator with static and Vercel providers
- **Quality Gates Integration**: Deployment runs full lint, typecheck, tests, SBOM generation, security scans, and performance budgets
- **Dual-Path Migration**: Implemented backward-compatible path resolution during folder restructuring
- **Script Authoring Rules**: Cross-shell safe patterns, Node.js entrypoints preferred over shell scripts, CLI flags over env vars

### Rationale

- Reduce repository root clutter by moving ecosystem files to GitHub-native `.github/` directory
- Centralize configuration in `config/` and templates in `packs/` for clearer separation of concerns
- Provide automated deployment with consistent quality validation to prevent production issues
- Enable smooth migration with fallback paths while maintaining system stability
- Establish cross-platform development practices to prevent PowerShell/command shell incompatibilities

### Impacted Files

- `.projectrules` (updated repository_layout, deployment_orchestration, quality_gates sections)
- `docs/rules-changelog.md` (this entry)
- `docs/engineering-handbook.md` (added repository layout, script authoring, deployment, quality gates, web UI guardrails, migration policy sections)
- `docs/checklists/code-review.md` (added structural and security validation checks)
- `docs/checklists/release.md` (added deployment preparation and quality gate checks)
- `README.md` (added deployment section with handbook cross-links)
- `scripts/deploy/prepare-and-deploy.js` (new orchestrator script)
- `scripts/deploy/providers/static.js` (static deployment provider)
- `scripts/deploy/providers/vercel.js` (Vercel deployment provider)
- `scripts/utils/path-resolver.js` (dual-path resolution utility)
- `config/` (new directory for configuration files)
- `packs/` (new directory for template packs)
- `.github/` (reorganized community health files)

---

## 2025-11-05 - v1.2 - Next.js Onboarding Rules and Accessibility Standards

### Highlights

- **Server/Client Separation**: No Node.js APIs (fs, path) in client bundles; use API routes or server-only modules
- **External Path Boundaries**: Avoid importing files outside website/ unless experimental.externalDir enabled; prefer API routes or prebuild copy
- **Cross-Shell Compatibility**: Avoid && chaining in docs/scripts; use separate lines or npm scripts; prefer cross-env for environment variables
- **Accessibility Standards**: All inputs must have labels, visible focus states, and keyboard navigation; jsx-a11y linting required for UI
- **Export Boundaries**: Only serialize manifest and structure data; never include secrets or sensitive data in client artifacts

### Rationale

- Prevent Next.js bundling errors from server-only APIs in client components during website migration
- Avoid PowerShell syntax errors and cross-platform command incompatibilities discovered during development
- Ensure onboarding UI meets accessibility standards and keyboard navigation requirements
- Protect against accidental data exposure in client-side downloads and exports
- Establish clear boundaries between server and client code in Next.js applications

### Impacted Files

- `.projectrules` (updated development_environment, guardrails, policies sections)
- `docs/rules-changelog.md` (this entry)
- `website/` (Next.js app follows new rules)
- `docs/checklists/code-review.md` (accessibility and server/client checks)
- `CONTRIBUTING.md` (cross-shell and local dev guidance)

---

## 2025-10-31 - v1.1 - Git and Shell Reliability Updates

### Highlights

- Added HTTPS as default Git transport with SSH as optional path requiring explicit configuration
- Implemented repo-root preflight check before first commit to prevent incorrect repo structure
- Documented Windows/PowerShell conventions for cross-shell compatibility (command chaining, environment variables)
- Enhanced platform compatibility guardrails with cross-shell safe command examples
- Added infrastructure validation checkboxes to PR template and cycle closeout checklist

### Rationale

- Prevent SSH host key verification failures and PowerShell syntax errors encountered in initial development session
- Ensure consistent repo structure by validating Git root before commits
- Reduce environment-specific errors through explicit cross-platform guidelines
- Maintain development reliability by encoding lessons from session errors into governance

### Impacted Files

- `.projectrules` (updated development_environment, guardrails, policies, cycle_closeout sections)
- `.github/PULL_REQUEST_TEMPLATE.md` (added Infrastructure Validation section)
- `docs/rules-changelog.md` (this entry)

---

## 2025-10-31 - v1.0 - Initial Governance Bootstrap

### Highlights

- Initial creation of technology-agnostic governance framework
- Comprehensive policies covering QA-first development, scope gating, performance budgets, accessibility awareness, security baseline, and testing standards
- Cycle Closeout process for continuous improvement
- Versioned rules with formal change control
- Report-only governance by default (non-blocking)

### Rationale

- Establish reusable governance template for new projects
- Encode lessons learned from previous development cycles
- Provide structured approach to QA-first, scope-gated delivery
- Enable continuous rules evolution through post-cycle reviews
- Prevent governance overhead through report-only defaults

### Impacted Files

- `.projectrules` (created)
- `docs/rules-changelog.md` (created)
- `README.md` (will reference governance)
- `.github/PULL_REQUEST_TEMPLATE.md` (will include Scope Gate)
- CI workflows (will include governance checks)
- `scripts/check-governance` (will implement checks)

---

_This changelog is append-only. New entries are added at the top after each rules update._
