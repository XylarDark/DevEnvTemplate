# DevEnvTemplate Optimization Plan: Doctor/Guide for LLM Development

## Vision Statement

**DevEnvTemplate should act as a doctor or guide when developing with an LLM** - diagnosing problems in the dev environment, prescribing solutions, and guiding developers to follow best practices.

---

## Core Mission Analysis

### What We Do Well (KEEP & ENHANCE)
1. **Stack Detection** → Diagnose what's in the codebase
2. **Gap Analysis** → Identify what's missing/broken
3. **Plan Generation** → Prescribe actionable fixes
4. **Cleanup Engine** → Remove template bloat
5. **CI Integration** → Automated health checks

### What Detracts From Mission (REMOVE/SIMPLIFY)
1. **Complex Enterprise Features** → Too much ceremony
2. **Multi-language package managers** → Beyond scope
3. **Advanced performance features** → Premature optimization
4. **Extensive documentation**→ Over-engineered for target audience
5. **Unused workflows** → Complexity without value

---

## Optimization Priorities

### Priority 1: ESSENTIAL (Doctor/Guide Core)
**These features directly serve the LLM development workflow:**

✅ **KEEP & ENHANCE:**
- `scripts/agent/cli-simple.js` - 5-question diagnostic
- `.github/tools/stack-detector.js` - Technology diagnosis
- `.github/tools/gap-analyzer.ts` - Problem identification
- `.github/tools/plan-generator.ts` - Treatment plan
- `scripts/cleanup/engine.ts` - Template cleanup
- `.github/workflows/indie-ci.yml` - CI health checks
- `.projectrules` - Development best practices
- `README.md`, `USAGE.md` - User-facing docs

### Priority 2: NICE-TO-HAVE (Secondary Features)
**These features support the core but aren't essential:**

⚠️ **SIMPLIFY OR KEEP MINIMAL:**
- `scripts/agent/cli.ts` - Advanced setup (keep for power users)
- TypeScript utilities (logger, cache, performance) - Only if used
- Testing infrastructure - Essential but can be simpler
- Deployment examples - Valuable but could be external

### Priority 3: REMOVE (Enterprise Bloat)
**These features don't serve indie developers or LLM workflow:**

❌ **REMOVE:**
- Context contracts, assumptions, task slices schemas
- Multi-ecosystem package managers (Go, Gradle, Maven, NuGet, Poetry)
- Benchmark suite (premature optimization)
- Progress bars and detailed performance tracking
- Complex agent workflows (context-assemble, impact-analyze, metrics-log)
- Enterprise docs (engineering handbook, RFC templates, ADRs)
- Unused CI workflows (CodeQL, SBOM, etc.)
- Packs/presets (redundant with cli-simple)

---

## Detailed Optimization Plan

### Phase 1: Remove Enterprise Bloat (2-3 hours)

#### 1.1 Remove Unused Package Managers
**Goal:** Focus on Node.js/npm ecosystem (80% of indie devs)

**Remove:**
- `scripts/cleanup/package-managers/go.ts`
- `scripts/cleanup/package-managers/gradle.ts`
- `scripts/cleanup/package-managers/maven.ts`
- `scripts/cleanup/package-managers/nuget.ts`
- `scripts/cleanup/package-managers/pip.ts`
- `scripts/cleanup/package-managers/poetry.ts`

**Keep:**
- `base.ts` (pattern)
- `npm.ts`, `pnpm.ts`, `yarn.ts` (Node.js ecosystem)

**Impact:** -60% package manager code, -6 files

#### 1.2 Remove Complex Agent Workflows
**Goal:** Simplify to just "init" and "cleanup"

**Remove:**
- `scripts/agent/context-assemble.js`
- `scripts/agent/context-lint.js`
- `scripts/agent/impact-analyze.js`
- `scripts/agent/metrics-log.js`
- `scripts/agent/plan-only.js`
- `scripts/agent/prompt-build.js`
- `scripts/agent/acceptance-scaffold.js`
- `scripts/agent/apply.js` (redundant with cleanup)
- `scripts/agent/validate.js`
- `.github/tools/context-assemble-ci.js`
- `.github/tools/context-validate.js`
- `.github/tools/impact-predictor.js`
- `.github/tools/metrics-log-ci.js`

**Keep:**
- `cli-simple.js` (main entry point)
- `cli.ts` (advanced, optional)
- `questionnaire.js` (if used by cli.ts)

**Impact:** -10 files, simpler mental model

#### 1.3 Remove Enterprise Documentation
**Goal:** Focus on practical indie dev docs

**Remove:**
- `docs/engineering-handbook.md`
- `docs/architecture/` (ADRs, templates)
- `docs/checklists/` (code review, release)
- `docs/rfc-template.md`
- `docs/specs/` (all enterprise specs)
- `docs/snippets/plan-mode/` (LLM can generate)
- `docs/security/threat-model-template.md`
- `docs/agent-onboarding.md`
- `docs/onboarding.md`
- `docs/PHASE-3C-4A-COMPLETE.md`
- `docs/PHASE3-COMPLETE.md`

**Keep:**
- `docs/market-positioning.md`
- `docs/rules-changelog.md`
- `docs/guides/cursor-plan-integration.md` (core to LLM workflow)
- `docs/guides/troubleshooting.md`

**Impact:** -25+ doc files, clearer focus

#### 1.4 Remove Performance/Benchmark Features
**Goal:** Remove premature optimization

**Remove:**
- `scripts/benchmark/` (cli.js, runner.ts, suites.ts)
- `scripts/types/benchmark.ts`
- `scripts/types/performance.ts`
- `scripts/utils/progress.ts`
- `scripts/utils/performance.js`
- Performance tracking in cleanup engine
- `tests/unit/performance-tracker.test.js`
- `.github/workflows/benchmark.yml`

**Keep:**
- Basic `--cache` and `--parallel` flags (already implemented)
- Simple performance in cleanup (no detailed tracking)

**Impact:** -8 files, simpler codebase

#### 1.5 Remove Unused Schemas
**Goal:** Keep only what's actually used

**Remove:**
- `schemas/assumption.schema.json`
- `schemas/context-contract.schema.json`
- `schemas/task-slice.schema.json`

**Keep:**
- `schemas/project.manifest.schema.json` (used by cli-simple)

**Impact:** -3 files, simpler validation

#### 1.6 Remove Unused CI Workflows
**Goal:** One simple CI workflow

**Remove:**
- `.github/workflows/auto-label.yml`
- `.github/workflows/codeql.yml` (enterprise security)
- `.github/workflows/conventional-commits.yml` (nice-to-have)
- `.github/workflows/dependency-review.yml` (already in indie-ci)
- `.github/workflows/engine-tests.yml` (redundant)
- `.github/workflows/examples-grocery.yml` (?)
- `.github/workflows/sbom.yml` (enterprise compliance)
- `.github/workflows/stack-intel.yml` (redundant with indie-ci)
- `.github/workflows/*.disabled` (already disabled)

**Keep:**
- `.github/workflows/indie-ci.yml` (main CI)
- `.github/workflows/deploy-*.yml.example` (deployment templates)

**Impact:** -9 CI workflows, simpler GitHub Actions

#### 1.7 Remove Packs/Presets Duplication
**Goal:** CLI-simple handles this now

**Remove:**
- `packs/` directory (all yaml files)
- `presets/` directory (all yaml files)

**Keep:**
- Configuration logic in cli-simple.js

**Impact:** -8 files, no duplication

#### 1.8 Clean Up Scripts
**Goal:** Remove unused utilities

**Remove:**
- `scripts/check-governance` (enterprise)
- `scripts/check-governance.ps1`
- `scripts/check-performance-budgets` (enterprise)
- `scripts/check-performance-budgets.ps1`
- `scripts/health-check.js` (what does this do?)
- `scripts/init-cleanup.js` (redundant?)
- `scripts/verify-tools.js` (what tools?)

**Keep:**
- `scripts/init.js` (npx entry point)

**Impact:** -7 script files

---

### Phase 2: Simplify & Enhance Core Features (3-4 hours)

#### 2.1 Enhance Stack Detector
**Goal:** Make it more helpful as a "diagnostic tool"

**Enhancements:**
- Add health scores (0-100) for each quality dimension
- Add severity levels (critical, warning, info)
- More actionable recommendations
- Detect common anti-patterns
- Format output for LLM consumption

#### 2.2 Enhance Gap Analyzer
**Goal:** Better "prescription" generation

**Enhancements:**
- Prioritize quick wins (< 10 min fixes)
- Group related gaps (e.g., all testing issues)
- Estimate time/effort for each fix
- Link to specific docs/guides
- Generate Cursor-ready context

#### 2.3 Simplify Cleanup Engine
**Goal:** Keep core functionality, remove complexity

**Simplifications:**
- Remove parallel processing (adds complexity)
- Remove caching (adds complexity)
- Remove performance tracking (adds complexity)
- Keep only: block removal, line removal, file deletion

**Result:** Simpler, more maintainable, easier to understand

#### 2.4 Create "Doctor Mode"
**Goal:** New CLI command: `npm run doctor`

**Features:**
- Runs stack-detector
- Runs gap-analyzer
- Generates prioritized action plan
- Shows health score
- Suggests next steps

**Example:**
```bash
npm run doctor

🏥 DevEnvTemplate Health Check

📊 Project Health: 65/100

🔴 Critical Issues (3):
  - No testing framework detected
  - Missing CI/CD pipeline
  - No .env.example (secrets exposed)

🟡 Warnings (5):
  - TypeScript not in strict mode
  - No ESLint configuration
  - README incomplete

🟢 Good (8):
  - Git initialized
  - package.json present
  - Dependencies up to date

💡 Quick Wins (can fix in < 10 min):
  1. Add .env.example → 2 min
  2. Enable TypeScript strict → 1 min
  3. Add ESLint config → 5 min

📋 Full Report: .devenv/health-report.md
```

---

### Phase 3: Documentation Simplification (1-2 hours)

#### 3.1 Consolidate Documentation
**Goal:** 3 docs max for users

**Structure:**
1. **README.md** - Quick start, value prop (already good)
2. **USAGE.md** - Common commands, workflows (simplify)
3. **TROUBLESHOOTING.md** - Common issues (new, extracted from guides)

**Remove:**
- IMPLEMENTATION_GUIDE.md (too detailed)
- Most of docs/ directory

#### 3.2 Update README
**Goal:** Focus on "doctor/guide" value prop

**Changes:**
- Lead with "LLM development companion"
- Emphasize diagnosis → prescription → cure workflow
- Show "before/after" health scores
- Add "npm run doctor" as primary command

#### 3.3 Create TROUBLESHOOTING.md
**Goal:** Common problems and solutions

**Sections:**
- Setup issues
- CI failures
- Test failures
- Stack detection issues
- Gap analysis issues

---

### Phase 4: Testing Simplification (1-2 hours)

#### 4.1 Remove Complex Tests
**Remove:**
- `tests/unit/performance-tracker.test.js`
- `tests/unit/progress.test.js` (if exists)
- `tests/unit/benchmark.test.js` (if exists)
- Python fixtures (not our focus)
- Large project fixtures (use smaller)

#### 4.2 Keep Essential Tests
**Keep:**
- `tests/unit/cleanup-engine.test.js`
- `tests/unit/gap-analyzer.test.js`
- `tests/unit/plan-generator.test.js`
- `tests/unit/stack-detector.test.js`
- `tests/unit/schema-validation.test.js`
- `tests/integration/ci-tools-workflow.test.js`
- Basic cleanup workflow tests

---

### Phase 5: Package.json Cleanup (30 min)

#### 5.1 Remove Unused Scripts
**Remove from package.json:**
- `agent:apply`
- `agent:validate`
- `agent:questions`
- `agent:plan`
- `agent:context`
- `agent:lint:context`
- `agent:impact`
- `agent:prompt`
- `changeset`, `release` (for later)
- `sbom` (enterprise)
- `prepare` (husky - already disabled)

**Keep:**
- `agent:init` (main command)
- `agent:init:advanced` (power users)
- `cleanup`, `cleanup:dry-run`, `cleanup:apply`
- `build`, `test` commands
- `format` commands

**Add:**
- `doctor` → runs full health check

#### 5.2 Remove Unused Dependencies
**Review and remove:**
- `archiver` (used for what?)
- `@changesets/cli` (premature)
- `@commitlint/*` (nice-to-have)
- `@cyclonedx/cyclonedx-npm` (SBOM - enterprise)
- `husky`, `lint-staged` (already disabled)
- `mock-fs` (if tests removed)

**Keep:**
- `ajv`, `ajv-formats` (schema validation)
- `commander` (CLI)
- `glob` (file matching)
- `yaml` (config parsing)
- TypeScript, ESLint, Prettier (dev essentials)

---

## Expected Impact

### Code Reduction
- **Files removed:** ~80+ files
- **Lines of code:** -50-60%
- **Complexity:** -70%

### Focus Improvement
| Before | After |
|--------|-------|
| 30+ features | 8 core features |
| 12 CI workflows | 1 main workflow |
| 15 agent commands | 3 user commands |
| 8+ package managers | 3 (npm/pnpm/yarn) |
| 40+ doc files | 10 doc files |

### User Experience
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Commands to learn | 20+ | 5 | 75% simpler |
| Setup time | 5 min | 2 min | 60% faster |
| Mental model | Complex | Simple | Intuitive |
| Value delivery | Delayed | Immediate | Clear |

---

## Implementation Strategy

### Week 1: Remove (Phases 1, 4, 5)
1. Remove enterprise bloat
2. Remove complex tests
3. Clean up package.json
4. Test everything still works

### Week 2: Simplify & Enhance (Phase 2)
1. Simplify cleanup engine
2. Enhance stack detector
3. Enhance gap analyzer
4. Create "doctor mode"

### Week 3: Polish (Phase 3)
1. Consolidate documentation
2. Update README
3. Create troubleshooting guide
4. Final testing & validation

---

## Success Criteria

✅ **Simplicity:** Can explain entire system in < 5 minutes  
✅ **Focus:** Every feature directly serves "doctor/guide" mission  
✅ **Speed:** Setup in < 2 minutes, diagnosis in < 30 seconds  
✅ **Quality:** All tests pass, no regressions  
✅ **Clarity:** User knows exactly what to do next

---

## Questions to Answer

1. What does `scripts/health-check.js` do?
2. What is `scripts/init-cleanup.js` for?
3. What is `scripts/verify-tools.js` checking?
4. Is `archiver` dependency used anywhere?
5. What is `.github/workflows/examples-grocery.yml`?

---

## Next Steps

1. **Review & Approve Plan** → Ensure alignment with vision
2. **Create Implementation Todos** → Break down into small tasks
3. **Start with Removals** → Quick wins, reduce complexity first
4. **Enhance Core** → Make remaining features excellent
5. **Polish & Ship** → Update docs, tag v2.1.0

---

*This plan transforms DevEnvTemplate from a complex, enterprise-focused tool into a simple, focused "doctor/guide" for LLM-assisted development.*

