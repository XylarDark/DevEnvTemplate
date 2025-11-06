# DevEnv Template Engineering Handbook

This handbook encapsulates the engineering principles, best practices, and standards that guide development in the DevEnv Template project. It serves as both documentation and governance for maintaining code quality, reliability, and developer experience.

## Table of Contents

- [Core Principles](#core-principles)
- [Context-First Development](#context-first-development)
- [Repository Layout](#repository-layout)
- [Script Authoring Rules](#script-authoring-rules)
- [Technology Standards](#technology-standards)
- [Development Practices](#development-practices)
- [Deployment Orchestration](#deployment-orchestration)
- [Quality Gates Baseline](#quality-gates-baseline)
- [Web UI Guardrails](#web-ui-guardrails)
- [Code Quality & Architecture](#code-quality--architecture)
- [Security & Compliance](#security--compliance)
- [Testing Strategy](#testing-strategy)
- [CI/CD & Automation](#cicd--automation)
- [Migration Policy](#migration-policy)
- [Documentation & Communication](#documentation--communication)

## Core Principles

### First Principles Thinking

**Question assumptions, understand fundamentals, build from scratch.**

- **Manifest-Driven**: All project configuration flows from validated JSON schemas
- **Convention over Configuration**: Sensible defaults reduce decision fatigue
- **Fail Fast**: Validate early, provide clear error messages
- **Progressive Enhancement**: Core functionality works without advanced features

### SOLID Principles

**Single Responsibility**: Each module/component has one reason to change.

- **Manifest Assembly** (`lib/manifest.ts`): Only assembles and validates manifests
- **Schema Loading** (`lib/schema.ts`): Only derives options from schema
- **Component Separation**: UI components handle presentation, not business logic

**Open/Closed**: Open for extension, closed for modification.

- **Plugin Architecture**: New stacks/features added without core changes
- **Configuration Extensions**: New cleanup rules via YAML without code changes

**Liskov Substitution**: Subtypes are substitutable for base types.

- **Feature Interfaces**: All features implement consistent structure
- **Stack Abstractions**: Technology stacks follow uniform patterns

**Interface Segregation**: Clients depend only on methods they use.

- **Minimal Exports**: Modules export only what's needed
- **Focused Components**: UI components have single, clear purposes

**Dependency Inversion**: Depend on abstractions, not concretions.

- **Schema-First Design**: Code adapts to schema changes, not vice versa
- **Configuration-Driven**: Behavior controlled by data, not hardcoded logic

### Clean Code Principles

**Meaningful Names**: Variables, functions, classes named for intent.

```typescript
// Good
const validateProjectManifest = (manifest: ProjectManifest): ValidationResult => {
  // Implementation
}

// Bad
const check = (data: any): any => {
  // Implementation
}
```

**Functions Do One Thing**: Small, focused functions with clear purpose.

```typescript
// Good
const generateStructureTree = (folders: string[], files: string[]): string => {
  return folders.map(generateFolderLine).concat(files.map(generateFileLine)).join('\n')
}

// Bad
const processData = (data: any): any => {
  // Validation, transformation, rendering all mixed together
}
```

**DRY (Don't Repeat Yourself)**: No code duplication.

- **Shared Components**: Reusable UI components in `components/`
- **Utility Functions**: Common logic extracted to `lib/`
- **Configuration Templates**: Reusable patterns in `presets/`

**Comments Explain Why, Not What**.

```typescript
// Good: Explains business rule
const requiresAuth = user.role === 'admin' // Only admins can modify system settings

// Bad: States the obvious
const total = a + b // Add a and b
```

## Context-First Development

**Maximize accuracy per prompting session by enforcing Question → Plan → Implement workflow.**

Context-First Development ensures that all requirements, constraints, and assumptions are fully understood before any code is written. This approach eliminates guesswork, reduces iterations, and produces predictable, high-quality results.

### Core Workflow

1. **Question Phase**: Gather complete context using Context Contracts
2. **Planning Phase**: Create detailed implementation plans without code changes
3. **Implementation Phase**: Execute with full understanding and bounded scope

### Context Contracts

**Required for all code changes.** Context Contracts capture:

- **Problem Statement**: Clear, specific description of what needs solving
- **Goals**: Measurable objectives with success criteria
- **Constraints**: Technical, business, and operational boundaries
- **Assumptions**: Documented uncertainties with validation plans
- **Acceptance Tests**: Concrete verification criteria
- **Stakeholders**: People responsible for validation and approval

**Validation**: All Context Contracts must pass `npm run agent:lint:context`

### Plan-Only Requirement

**Code changes require approved Plan-Only PRs.**

- Create implementation plan without code changes first
- Get stakeholder approval on approach and scope
- CI validates plan completeness and context validity
- Only then implement the actual code changes

**Enforcement**: Set `STRICT_PLAN_GUARD=true` to require Plan-Only PRs

### Task Slicing

**Break work into small, bounded tasks.**

- **Single Responsibility**: Each task has one clear outcome
- **Explicit Boundaries**: Clear definition of in-scope vs out-of-scope
- **Predictable Effort**: Tasks completable in 1-3 days
- **Independent**: Tasks can be implemented without each other

### Assumption Management

**Track and validate all assumptions.**

- **Confidence Levels**: high/medium/low/unknown
- **Impact Assessment**: critical/high/medium/low
- **Validation Plans**: Specific methods to confirm or refute
- **Approval Workflow**: Required approvals for high-impact assumptions

**States**: draft → proposed → approved → validated → invalidated → expired

### Impact Analysis

**Predict and validate change impact before implementation.**

- **File Prediction**: Identify likely affected files/modules
- **Risk Assessment**: Evaluate breaking change potential
- **Testing Strategy**: Determine required test coverage
- **Validation**: CI compares predicted vs actual changes

**Guard**: Set `IMPACT_GUARD=warn|block` for enforcement level

### LLM Integration

**Structured prompts with complete context.**

- **Context Packs**: Curated file collections under size limits
- **Prompt Building**: `npm run agent:prompt` generates optimized prompts
- **Quality Gates**: All prompts include acceptance criteria and constraints
- **Validation**: Results must meet defined success metrics

### CI/CD Integration

**Automated quality gates for Context-First compliance.**

- **Context Validation**: PRs validate Context Contract completeness
- **Plan-Only Gate**: Code PRs require approved Plan-only PRs
- **Impact Guard**: Changed files must align with predictions
- **Assumption Tracking**: Unvalidated high-risk assumptions block merge

### Success Metrics

**Track effectiveness of Context-First approach.**

- **Contract Completeness**: % of contracts passing validation
- **Plan Accuracy**: % of implementations matching approved plans
- **Iteration Reduction**: Average code iterations per task (target: 1.0)
- **Time to Valid**: Hours from contract creation to working implementation

### Tools and Commands

```bash
# Context Contract management
npm run agent:questions     # Generate missing information questions
npm run agent:lint:context  # Validate contract completeness
npm run agent:questions --interactive  # Interactive contract completion

# Planning tools
npm run agent:impact        # Analyze potential impact
npm run agent:plan          # Generate implementation plan
npm run agent:context       # Assemble context pack

# LLM integration
npm run agent:prompt        # Build optimized prompt
```

### Documentation

- **[Context-First Guide](docs/guides/context-first.md)**: Complete workflow and best practices
- **[Prompting Playbook](docs/guides/prompting-playbook.md)**: Structured prompt templates
- **Context Contract Schema**: `schemas/context-contract.schema.json`
- **Task Slice Schema**: `schemas/task-slice.schema.json`
- **Assumption Schema**: `schemas/assumption.schema.json`

## Repository Layout

DevEnvTemplate uses a technology-agnostic folder structure designed for clarity, scalability, and reuse. This layout supports both template development and generated project consumption.

```
/                      # Repository root
├── README.md          # Implementation guide and quick start
├── IMPLEMENTATION_GUIDE.md  # Comprehensive usage documentation
├── package.json       # Root scripts and dependencies
├── tsconfig.base.json # Shared TypeScript configuration
├── .projectrules      # Governance and project rules
├── config/            # Project-wide configuration
│   ├── cleanup.config.yaml    # Cleanup rules and policies
│   └── quality-budgets.json   # Performance and size budgets
├── schemas/           # JSON Schema definitions
├── packs/             # Template packs (formerly presets/)
├── scripts/           # Automation and CLI tools
│   ├── deploy/        # Deployment orchestration
│   ├── agent/         # Manifest processing and generation
│   ├── cleanup/       # Code cleanup automation
│   └── utils/         # Shared utilities (path resolvers, etc.)
│   ├── app/           # Next.js 13+ App Router
│   ├── lib/           # Shared business logic
│   └── components/    # React components
├── docs/              # Documentation and specifications
│   ├── specs/         # Technical specifications
│   ├── checklists/    # PR and release checklists
│   ├── guides/        # Usage guides and tutorials
│   └── engineering-handbook.md  # This document
├── .github/           # GitHub ecosystem configuration
│   ├── workflows/     # CI/CD pipelines
│   ├── CODE_OF_CONDUCT.md
│   ├── CONTRIBUTING.md
│   ├── SECURITY.md
│   ├── SUPPORT.md
│   └── CODEOWNERS
└── examples/          # Demo and test cases (excluded from CI)
```

### Key Layout Principles

- **Separation of Concerns**: Scripts, configuration, templates, and UI are clearly separated
- **Public API Enforcement**: Only `lib/index.ts` and `components/index.ts` are public APIs
- **Technology Agnostic**: Structure works for any stack (React, Vue, Node.js, etc.)
- **CI/CD Friendly**: Clear boundaries make automation predictable
- **GitHub Native**: Ecosystem files in `.github/` for automatic discovery

## Script Authoring Rules

Scripts must be cross-shell compatible and follow Node.js best practices for maintainability.

### Cross-Shell Compatibility

**Avoid shell command chaining with `&&` in scripts** - PowerShell treats `&&` as statement separators, not command chaining.

```bash
# ❌ Fails in PowerShell
npm run lint && npm run test

# ✅ Use separate commands or npm scripts
npm run lint
npm run test
```

**Prefer Node.js entrypoints over shell scripts**.

```bash
# ✅ Use Node.js scripts
"scripts": {
  "deploy:prepare": "node scripts/deploy/prepare-and-deploy.js --prepare-only"
}

# ❌ Avoid shell scripts unless necessary
"scripts": {
  "bad-example": "sh scripts/something.sh"
}
```

### Environment Variables

**Use CLI flags over environment variables** for user-facing scripts.

```typescript
// ✅ Prefer flags
const program = new Command()
  .option('--provider <type>', 'deployment provider', 'static')

// ❌ Avoid requiring env vars
process.env.DEPLOY_PROVIDER // Only for secrets/tokens
```

**Load environment variables from `.env` files** using established loaders.

```typescript
// ✅ Use dotenv or similar
require('dotenv').config();
// Then access process.env
```

### Error Handling

**Fail fast with clear messages** - Scripts should validate inputs and provide actionable error messages.

```typescript
if (!fs.existsSync(websiteDir)) {
  throw new Error(`Website directory not found: ${websiteDir}`);
}
```

## Technology Standards

### Current Tech Stack Strengths

**Next.js 14 + TypeScript**: Modern React framework with:
- App Router for file-based routing
- Server/Client component boundaries
- Built-in optimization and SSR
- TypeScript for type safety and developer experience

**Node.js 20+**: Latest LTS with modern ES modules, performance, and security updates.

**Tailwind CSS**: Utility-first CSS framework for:
- Consistent design system
- Responsive design
- Small bundle size
- Developer productivity

**Ajv**: JSON Schema validation for:
- Runtime type checking
- Configuration validation
- API contract enforcement

### Tooling Standards

**ESLint + Prettier**: Code quality and formatting
- `eslint-config-next` for Next.js best practices
- `jsx-a11y` for accessibility compliance
- `import/order` for consistent imports

**TypeScript Strict Mode**: Maximum type safety
- `strict: true` for comprehensive checking
- Path aliases (`@/*`) for clean imports
- Modern ES targets for optimal bundling

**Git Hooks**: Pre-commit quality gates
- Lint and type checking
- Conventional commit validation
- Format enforcement

## Development Practices

### Git Workflow

**Branch Naming**: Descriptive prefixes with conventional commits.

```bash
# Features
feat/user-authentication
feat/manifest-validation

# Fixes
fix/schema-validation-error
fix/ui-responsive-layout

# Documentation
docs/api-endpoint-documentation
docs/deployment-guide
```

**Commit Messages**: Conventional format with scope.

```bash
feat(schema): add validation for core features enum
fix(ui): resolve dropdown focus trap on mobile
docs(readme): update installation instructions
```

**Pull Request Standards**:
- Scope gate checklist completed
- Session review for multi-commit changes
- Automated CI checks passing
- Manual testing completed

### Code Organization

**File Structure Convention**:

```
project/
├── app/                    # Next.js App Router
│   ├── (routes)/          # Route groups
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
├── lib/                   # Business logic utilities
├── types/                 # TypeScript type definitions
└── docs/                  # Documentation
```

**Import Organization**:
1. React imports
2. External libraries
3. Internal utilities (`lib/`)
4. Components
5. Types

```typescript
// Good
import React, { useState } from 'react'
import { z } from 'zod'

import { validateManifest } from '@/lib/manifest'
import { Button } from '@/components/Button'
import type { ProjectManifest } from '@/types/manifest'
```

### Error Handling

**User-Friendly Errors**: Clear, actionable error messages.

```typescript
// Good
if (!schema) {
  throw new Error('Project manifest schema not found. Ensure schemas/project.manifest.schema.json exists.')
}

// Bad
throw new Error('Schema error')
```

**Graceful Degradation**: Handle failures without breaking the experience.

```typescript
// Good
try {
  const result = await loadSchema()
  return result
} catch (error) {
  console.warn('Schema loading failed, using fallback:', error)
  return getFallbackSchema()
}
```

### Performance Considerations

**Bundle Splitting**: Code splitting for better loading.

```typescript
// Good: Dynamic imports for heavy components
const StructurePreview = dynamic(() => import('@/components/StructurePreview'), {
  loading: () => <SkeletonLoader />
})
```

**Memoization**: Prevent unnecessary re-renders.

```typescript
// Good
const memoizedOptions = useMemo(() =>
  enumValues.map(value => ({ value, label: value })),
  [enumValues]
)
```

## Quality Gates Baseline

All deployments and CI runs must pass these quality checks to ensure production readiness.

### Linting & Type Checking

**ESLint Configuration**:
- Next.js recommended rules + jsx-a11y for accessibility
- `eslint-plugin-boundaries` for architectural layer enforcement
- `import/no-internal-modules` for public API compliance

**TypeScript**:
- Strict mode enabled
- No `any` types in production code
- Proper error boundaries and null checks

### Testing Requirements

**Unit Tests**: All business logic in `lib/` must have test coverage
**Integration Tests**: API routes and data flow validation
**E2E Tests**: Playwright smoke tests for critical user flows
**Performance Tests**: Bundle size and load time budgets

### Security Scanning

**SBOM Generation**: CycloneDX format for dependency tracking
**License Compliance**: Approved open-source licenses only
**Secret Detection**: Gitleaks for hardcoded secrets
**SAST Scanning**: Semgrep for code vulnerabilities

### Performance Budgets

**Bundle Size**: `config/quality-budgets.json` enforced
**Load Times**: <3s first contentful paint target
**Core Web Vitals**: Lighthouse scores monitored

### Code Quality Metrics

**Dead Code Analysis**: `ts-prune` and `depcheck` clean results
**Cyclomatic Complexity**: Functions under 10 complexity
**Import Hygiene**: No circular dependencies
**Barrel Files**: Clean public APIs via `index.ts` exports

### Plan/Agent Validation

**Context Contract Validation**: Ajv-based schema validation via `.github/tools/context-validate.js`
- Required fields: problem, goals, constraints, acceptanceTests, assumptions, stakeholders
- High-risk assumptions must be resolved before merge

**Impact Analysis**: Automated prediction and validation via `.github/tools/impact-predictor.js`
- Files predicted to change based on contract content analysis
- Actual changes compared against predictions
- Configurable via `IMPACT_GUARD=warn|strict` repository variable

**Plan-Only Gate**: Code PRs require approved plan-only PRs first
- Enforced via `STRICT_PLAN_GUARD=true` repository variable
- Implementation PRs must reference plan PRs

### CI Artifacts

**Stack Intelligence**: Technology detection via `.github/tools/stack-detector.js`
- Supports Node.js, Python, Go, Java, .NET ecosystems
- Generates `.devenv/stack-report.json` artifact

**Gap Analysis**: Best practice recommendations via `.github/tools/gap-analyzer.js`
- Generates `.devenv/gaps-report.md` artifact

**Context Packs**: Minimal curated files for Plan Mode via `.github/tools/context-assemble-ci.js`
- Generates `.contextpack/` artifact (<100KB)
- Includes project rules, handbook, README, contracts, schemas

**Metrics Logging**: Development efficiency tracking via `.github/tools/metrics-log-ci.js`
- Generates `metrics.jsonl` artifact
- Tracks validation success rates, assumption resolution, impact alignment

## Security & Compliance

### Input Validation

**Schema Validation**: All inputs validated against schemas.

```typescript
// Good
const manifestSchema = loadSchema()
const validate = ajv.compile(manifestSchema)

if (!validate(manifest)) {
  throw new ValidationError(validate.errors)
}
```

**Sanitization**: User inputs sanitized before processing.

```typescript
// Good
const projectName = sanitizeHtml(req.body.name, {
  allowedTags: [],
  allowedAttributes: {}
})
```

### Authentication & Authorization

**Principle of Least Privilege**: Minimal required permissions.

```typescript
// Good: Role-based access
const canEditManifest = user.role === 'admin' || user.id === manifest.ownerId
```

### Data Protection

**No Secrets in Client**: Sensitive data never sent to client.

```typescript
// Good: Server-side only
const apiKey = process.env.API_KEY // Server only
const publicConfig = { features: ['basic', 'advanced'] } // Client safe
```

**Secure Headers**: CSP and security headers.

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline'"
          }
        ]
      }
    ]
  }
}
```

## Testing Strategy

### Unit Testing

**Test Business Logic**: Core functions thoroughly tested.

```typescript
// Good
describe('assembleManifest', () => {
  it('should create valid manifest from options', () => {
    const options = { productType: 'Web App', ... }
    const result = assembleManifest(options)

    expect(result.isValid).toBe(true)
    expect(result.manifest.requirements.productType).toBe('Web App')
  })
})
```

**Mock External Dependencies**: Isolate unit tests.

```typescript
// Good
jest.mock('fs')
jest.mock('ajv')

describe('loadSchema', () => {
  it('should load schema from file', () => {
    const mockSchema = { type: 'object' }
    fs.readFileSync.mockReturnValue(JSON.stringify(mockSchema))

    const result = loadSchema()
    expect(result).toEqual(mockSchema)
  })
})
```

### Integration Testing

**Component Integration**: Test component interactions.

```typescript
// Good: Test form submission
test('guided form submits valid manifest', async () => {
  render(<GuidedForm />)

  await userEvent.selectOptions(screen.getByLabelText('Project Type'), 'Web Application')
  await userEvent.click(screen.getByText('Next'))

  // Assert navigation and state updates
})
```

### End-to-End Testing

**Critical User Journeys**: Full workflow testing.

```typescript
// Good: Playwright E2E
test('guided onboarding creates manifest', async ({ page }) => {
  await page.goto('/guided')

  await page.selectOption('select[label="Project Type"]', 'Web Application')
  await page.click('button:has-text("Next")')

  await page.selectOption('select[label="Technology Stack"]', 'Node.js')
  await page.click('button:has-text("Next")')

  // Assert manifest download or preview
})
```

### Testing Pyramid

```
E2E Tests (Slow, Critical Paths)     ████░░░░ 20%
Integration Tests (Medium, Workflows) ████████░░ 40%
Unit Tests (Fast, Logic)              ██████████ 40%
```

## Migration Policy

DevEnvTemplate evolves its structure while maintaining backward compatibility and clear migration paths.

### Dual-Path Loaders

**Purpose**: Support both old and new paths during transition periods.

**Implementation**: `scripts/utils/path-resolver.js` provides fallback logic:
```typescript
function resolveConfigPath(configName, workingDir) {
  const newPath = path.join(workingDir, 'config', configName);
  const oldPath = path.join(workingDir, configName);

  // Try new path first
  if (fs.existsSync(newPath)) {
    return newPath;
  }

  // Fallback to old path
  if (fs.existsSync(oldPath)) {
    return oldPath;
  }

  // Default to new path for creation
  return newPath;
}
```

**Migration Window**: Dual-path support allowed during active migration only.

### Path Resolution Rules

**New Structure (Target State)**:
- Configuration: `config/` directory
- Templates: `packs/` directory
- Scripts: `scripts/` directory
- Docs: `.github/` for ecosystem files

**Migration Timeline**:
1. **Phase 1**: Add dual-path loaders (current)
2. **Phase 2**: Update all references to use new paths
3. **Phase 3**: Remove fallback logic after stabilization
4. **Phase 4**: Enforce new paths only

### Breaking Change Policy

**Major Version Bumps**: Required for structural changes affecting generated projects.

**Deprecation Warnings**: 2 release cycles before removing old APIs.

**Migration Guides**: Required for any breaking changes with step-by-step instructions.

### Health Check Enforcement

**Repository Validation**: `scripts/health-check.js` flags old structure remnants.

**CI Integration**: Fails builds with deprecated patterns after migration cutoff.

**Documentation Updates**: Keep implementation guides current with active structure.

## CI/CD & Automation

### Automated Quality Gates

**Pre-commit Hooks**: Local quality checks.

```bash
#!/bin/sh
npm run lint
npm run typecheck
npm run test:unit
```

**CI Pipeline**: Comprehensive validation.

```yaml
# Good: Multi-stage CI
jobs:
  quality:
    steps:
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test:unit

  integration:
    steps:
      - run: npm run test:integration

  e2e:
    steps:
      - run: npx playwright test

  build:
    steps:
      - run: npm run build
```

### Deployment Strategy

**12-Factor App Principles**:

1. **Codebase**: Single codebase tracked in Git
2. **Dependencies**: Explicitly declared and isolated
3. **Config**: Store config in environment
4. **Backing Services**: Treat as attached resources
5. **Build/Release/Run**: Strictly separate stages
6. **Processes**: Execute as one-off processes
7. **Port Binding**: Export service via port binding
8. **Concurrency**: Scale out via process model
9. **Disposability**: Maximize robustness with fast startup
10. **Dev/Prod Parity**: Keep development/staging/production as similar as possible
11. **Logs**: Treat logs as event streams
12. **Admin Processes**: Run admin tasks as one-off processes

**Container-First**: Docker for consistent environments.

```dockerfile
# Good: Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .

EXPOSE 3000
CMD ["npm", "start"]
```

## Documentation & Communication

### Living Documentation

**README-Driven Development**: Documentation first.

```markdown
# Component Name

Brief description of what this component does.

## Usage

\`\`\`tsx
import { Component } from './Component'

<Component prop="value" />
\`\`\`

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| prop | string | Yes | Description of prop |
```

**Self-Documenting Code**: Code explains itself.

```typescript
// Good: TypeScript provides documentation
interface ManifestRequirements {
  /** The type of product being built */
  productType: ProductType
  /** List of core features needed */
  coreFeatures: Feature[]
  /** Preferred technology stack */
  preferredStack: TechStack
}
```

### Architecture Decision Records

**Document Important Decisions**: Why, not just what.

```markdown
# ADR-001: Next.js for Onboarding UI

## Status: Accepted

## Context
Need interactive web UI for manifest creation...

## Decision
Use Next.js 14 with App Router...

## Consequences
- Positive: Type safety, SSR, modern tooling
- Negative: Learning curve, bundle size
- Risks: Server/client boundary complexity (mitigated by clear rules)
```

### Communication Standards

**Clear Commit Messages**: Explain what and why.

```bash
# Good
feat(manifest): add client-side validation for required fields

- Adds real-time validation for product type and tech stack
- Prevents invalid manifest generation
- Improves user experience with immediate feedback

BREAKING CHANGE: validation now required before download
```

**Issue/PR Templates**: Structured communication.

```markdown
## What
Brief description of the change

## Why
Business/technical rationale

## How
Implementation details

## Testing
How this was tested

## Scope Gate
- [ ] New feature requiring documentation
- [ ] External dependencies added
- [ ] Performance impact >5%
- [ ] Security implications
```

## Conclusion

This handbook represents our commitment to engineering excellence through:

- **First Principles**: Understanding fundamentals to build robust solutions
- **SOLID Design**: Maintainable, extensible, and testable code
- **Modern Tooling**: TypeScript, Next.js, comprehensive testing
- **Security First**: Input validation, secure defaults, principle of least privilege
- **Quality Automation**: CI/CD with multiple quality gates
- **Living Documentation**: Self-documenting code and comprehensive docs

These principles and practices ensure we build software that is reliable, maintainable, secure, and delightful to work with. Regular review and updates to this handbook keep our standards current with industry best practices.

---

*This handbook evolves with our practices. Last updated: 2025-11-05*
