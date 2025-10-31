# Project Rules Changelog

This document tracks the evolution of `.projectrules` - the central governance file for this project. Changes are documented here to provide transparency and rationale for governance decisions.

## Format

- **Date**: YYYY-MM-DD
- **Version**: Major.Minor (incremented for policy/guardrail changes)
- **Highlights**: Summary of changes
- **Rationale**: Why the changes were made
- **Impacted Files**: Files modified as a result

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

*This changelog is append-only. New entries are added at the top after each rules update.*
