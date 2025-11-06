# ADR-002: Single Next.js Application for Onboarding UI

## Status

**Status**: Accepted

**Date**: 2025-11-05

**Authors**: AI Assistant <assistant@system>

## Context

The project needed an interactive web-based onboarding interface to replace the static HTML/JS prototype. The interface must:

- Allow users to select project types, technologies, and features through dropdowns and multi-selects
- Generate structured `project.manifest.json` files based on schema validation
- Provide live preview of project structure and file descriptions
- Support both guided (step-by-step) and advanced (manual matrix) workflows
- Export manifests and markdown summaries
- Maintain accessibility standards and cross-platform compatibility

The previous static HTML/JS prototype was insufficient for:
- Dynamic form validation and state management
- Schema-driven option generation
- Proper TypeScript typing
- Server-side data access and processing
- Scalable component architecture

Key constraints:
- Must integrate with existing `schemas/project.manifest.schema.json`
- Cannot use Node.js APIs in client bundles (Next.js bundling restrictions)
- Must support cross-platform development (Windows/Mac/Linux)
- Should follow existing project governance and accessibility standards

## Decision

Adopt Next.js 14 with TypeScript as the single framework for the onboarding UI, implementing:

1. **Server/Client Architecture**: Use App Router with clear server/client boundaries
2. **Schema-Driven Options**: Load manifest schema at build-time, not runtime
3. **Two UI Flows**: Guided stepper and Advanced manual matrix
4. **Manifest Generation**: Client-side assembly with Ajv validation
5. **Export Capabilities**: JSON download and Markdown copy-to-clipboard

**Key Architectural Boundaries**:
- Client components marked with `"use client"` directive
- Schema/options loaded via build-time imports, not runtime `fs`
- API routes used for any server-side data access (future extensibility)
- No external file system access from client components

## Considered Options

**Option 1: Static Site Enhancement**
- Keep existing static HTML/JS approach
- Add form libraries and validation
- Pros: Simple, fast, no framework overhead
- Cons: No TypeScript, poor state management, bundling issues with schema access

**Option 2: React SPA (Create React App)**
- Modern React with routing, TypeScript
- Pros: Familiar, flexible, good ecosystem
- Cons: No SSR, separate build concerns, potential overkill

**Option 3: Vue/Nuxt Alternative**
- Nuxt 3 with Vue ecosystem
- Pros: Similar SSR capabilities, different learning curve
- Cons: Different ecosystem, potential team familiarity issues

**Option 4: Multiple Frameworks**
- Keep static for simple flows, add framework for complex
- Pros: Gradual migration path
- Cons: Maintenance overhead, inconsistent patterns

**Chosen**: Next.js provides best balance of modern React features, SSR capabilities, and established patterns for the project's needs.

## Consequences

### Positive Consequences

- **Type Safety**: Full TypeScript integration prevents runtime errors
- **Developer Experience**: Hot reload, modern tooling, established patterns
- **Scalability**: App Router supports future API routes and server components
- **Performance**: Built-in optimization and SSR capabilities
- **Accessibility**: jsx-a11y integration and focus management
- **Maintainability**: Component-based architecture with clear boundaries

### Negative Consequences

- **Learning Curve**: Team needs Next.js/App Router familiarity
- **Bundle Size**: Additional framework overhead vs static site
- **Build Complexity**: More complex deployment than static files
- **Migration Effort**: Complete rewrite of existing static interface

### Risks

- **Schema Access Complexity**: Runtime schema loading blocked by bundling
  - *Mitigation*: Build-time schema imports with fallback handling
- **Cross-Platform Development**: PowerShell/Windows compatibility issues
  - *Mitigation*: Cross-shell command guidelines and testing
- **Over-Engineering**: Framework choice for relatively simple UI
  - *Mitigation*: Start minimal, expand only as needed

## Implementation Notes

1. **Project Structure**:
   ```
   website/
   ├── app/                 # Next.js App Router
   ├── components/          # Reusable UI components
   ├── lib/                 # Business logic and utilities
   ├── styles/              # Global styles (Tailwind)
   └── package.json         # Dependencies and scripts
   ```

2. **Schema Integration**:
   - Load schema at build-time via `fs` in server context
   - Export typed options for client components
   - Validate manifests with Ajv before export

3. **Component Architecture**:
   - `Dropdown` and `MultiSelect` for form inputs
   - `Stepper` for guided flow navigation
   - `StructurePreview` for live project visualization

4. **Development Setup**:
   - Standard Next.js development workflow
   - TypeScript checking in CI
   - Accessibility linting for UI components

## References

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Project Manifest Schema](schemas/project.manifest.schema.json)
- [Website Implementation](website/) - Next.js application
- [Rules Changelog](docs/rules-changelog.md) - governance updates
- Related Issues: Website migration and schema integration

---

_This ADR follows the [MADR](https://adr.github.io/madr/) format._
