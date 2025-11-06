# Project Definition Schema v1

## Overview

The Project Definition Schema v1 defines the canonical format for describing development projects in DevEnvTemplate. This schema is technology-agnostic and supports any combination of programming languages, frameworks, tools, and deployment targets.

## Versioning & Compatibility

- **Semantic Versioning**: Schema follows [SemVer](https://semver.org/) for breaking changes
- **Backward Compatibility**: v1.x schemas are forward-compatible within major version
- **Migration Path**: Breaking changes require explicit migration with tooling support
- **Deprecation Period**: Deprecated fields have 2 major versions deprecation window

### Compatibility Rules

1. **Additive Changes**: New optional fields can be added without breaking compatibility
2. **Enumeration Extension**: New values in enums are backward-compatible
3. **Field Renaming**: Requires deprecation period and migration tooling
4. **Type Changes**: Require major version bump

## Schema Structure

```json
{
  "$schema": "https://devenv-template.dev/schema/v1/project-definition.json",
  "version": "1.0.0",
  "metadata": {
    "name": "string",
    "description": "string",
    "author": "string",
    "license": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  },
  "requirements": {
    "productType": "enum",
    "coreFeatures": ["string"],
    "preferredStack": "enum",
    "deploymentTarget": "enum",
    "testingLevel": "enum",
    "governanceSensitivity": "enum",
    "needsCI": "boolean",
    "needsDocker": "boolean",
    "needsMonitoring": "boolean",
    "teamSize": "enum"
  },
  "derived": {
    "features": ["string"],
    "rationale": {
      "features": "string",
      "stack": "string",
      "infrastructure": "string",
      "governance": "string",
      "testing": "string"
    }
  }
}
```

## Field Definitions

### Metadata Section

**Required Fields:**
- `version`: Schema version (must be "1.0.0" for v1)
- `name`: Human-readable project name
- `description`: Project description (max 500 chars)

**Optional Fields:**
- `author`: Project author/organization
- `license`: SPDX license identifier
- `createdAt`: ISO 8601 datetime
- `updatedAt`: ISO 8601 datetime

### Requirements Section

**Product Type Enumeration:**
- `Web Application`
- `API/Microservices`
- `Mobile App`
- `Desktop Application`
- `Library/SDK`
- `CLI Tool`
- `Other`

**Core Features Array:**
Any combination of:
- `Authentication/Authorization`
- `REST API`
- `GraphQL API`
- `Web UI (Frontend)`
- `Database Integration`
- `Caching`
- `File Storage`
- `Real-time Features (WebSocket)`
- `Background Jobs/Queues`
- `Admin Panel`
- `API Documentation`
- `Monitoring/Logging`
- `Search Functionality`
- `Email/SMS Notifications`

**Preferred Stack Enumeration:**
- `Node.js`
- `Python`
- `Go`
- `C#/.NET`
- `Java`
- `Frontend (React/Vue/Angular)`
- `Full-stack (MERN/MEAN/etc.)`
- `Other`

**Deployment Target Enumeration:**
- `Cloud (AWS/GCP/Azure)`
- `Self-hosted (VPS/Dedicated)`
- `Docker Containers`
- `Kubernetes`
- `Serverless`
- `Static Hosting (Netlify/Vercel)`
- `Hybrid`

**Testing Level Enumeration:**
- `Unit tests only`
- `Unit + Integration tests`
- `Unit + Integration + E2E tests`
- `Comprehensive testing (including performance/load tests)`
- `Minimal testing (just enough to deploy)`

**Governance Sensitivity Enumeration:**
- `Standard (basic security, some compliance)`
- `High (financial/healthcare data, strict compliance)`
- `Enterprise (audit trails, advanced security)`
- `Public sector (government standards)`
- `None (personal/hobby project)`

**Team Size Enumeration:**
- `Solo developer`
- `Small team (2-5 developers)`
- `Medium team (6-15 developers)`
- `Large team (16+ developers)`

**Infrastructure Flags:**
- `needsCI`: Boolean - requires CI/CD pipeline
- `needsDocker`: Boolean - requires containerization
- `needsMonitoring`: Boolean - requires monitoring setup

### Derived Section

**Features Array:**
Automatically derived technical features based on requirements (e.g., "auth", "api", "database")

**Rationale Object:**
Explanations for derivation decisions:
- `features`: How features were selected
- `stack`: Stack selection reasoning
- `infrastructure`: Infrastructure decisions
- `governance`: Security/compliance choices
- `testing`: Testing level rationale

## Validation Rules

1. **Schema Compliance**: Must validate against JSON Schema v1
2. **Feature Consistency**: Derived features must match requirements
3. **Stack Compatibility**: Preferred stack must be compatible with product type
4. **Infrastructure Logic**: Infrastructure flags must align with deployment target

## Migration Guide

### From v0.x (Legacy)

```javascript
// Migration helper
function migrateLegacyManifest(legacy) {
  return {
    $schema: "https://devenv-template.dev/schema/v1/project-definition.json",
    version: "1.0.0",
    metadata: {
      name: legacy.name || "Migrated Project",
      description: legacy.description || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    requirements: {
      productType: legacy.productType,
      coreFeatures: legacy.coreFeatures || [],
      preferredStack: legacy.preferredStack,
      deploymentTarget: legacy.deploymentTarget || "Docker Containers",
      testingLevel: legacy.testingLevel || "Unit + Integration tests",
      governanceSensitivity: legacy.governanceSensitivity || "Standard (basic security, some compliance)",
      needsCI: legacy.needsCI || false,
      needsDocker: legacy.needsDocker || false,
      needsMonitoring: legacy.needsMonitoring || false,
      teamSize: legacy.teamSize || "Small team (2-5 developers)"
    },
    derived: legacy.derived || {
      features: [],
      rationale: {
        features: "Migrated from legacy format",
        stack: "Migrated from legacy format",
        infrastructure: "Migrated from legacy format",
        governance: "Migrated from legacy format",
        testing: "Migrated from legacy format"
      }
    }
  }
}
```

## Implementation Notes

- Schema is self-documenting with JSON Schema annotations
- All enums are extensible for future additions
- Validation is performed at multiple stages: creation, application, verification
- Schema supports internationalization through separate translation layers
