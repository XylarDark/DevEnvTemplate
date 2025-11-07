# Agent-Led Onboarding

The DevEnvTemplate includes an interactive agent CLI that guides users through defining their project requirements, automatically generating a `project.manifest.json` file, and configuring the cleanup system and CI pipelines accordingly.

## Quick Start

Use the CLI-based workflow to define your project:

```bash
# Initialize project requirements
npm run agent:init

# Apply configuration to cleanup and CI
npm run agent:apply
```

The interactive CLI will ask you questions about your project type, features, technology stack, deployment target, and more. It then generates a manifest file that drives the entire DevEnvTemplate system.

## How It Works

The agent collects information about your project through an interactive questionnaire and generates a structured manifest that drives the cleanup system and CI configuration.

### Collected Information

#### Product Type
- **Web Application**: Full-stack web apps with frontend/backend
- **API/Microservices**: REST/GraphQL APIs, microservice architectures
- **Mobile App**: Mobile applications (hybrid or native)
- **Desktop Application**: Desktop software
- **Library/SDK**: Reusable libraries or SDKs
- **CLI Tool**: Command-line applications
- **Other**: Custom project types

#### Core Features
The agent asks about specific features you need:
- **Authentication/Authorization**: User login, permissions, security
- **REST API**: HTTP API endpoints
- **GraphQL API**: GraphQL schema and resolvers
- **Web UI (Frontend)**: User interfaces, SPAs
- **Database Integration**: Data persistence and querying
- **Caching**: Performance optimization
- **File Storage**: File upload/download handling
- **Real-time Features (WebSocket)**: Live updates, messaging
- **Background Jobs/Queues**: Async processing, task queues
- **Admin Panel**: Administrative interfaces
- **API Documentation**: OpenAPI/Swagger docs
- **Monitoring/Logging**: Observability and tracking
- **Search Functionality**: Full-text search, filtering
- **Email/SMS Notifications**: Communication features

#### Technology Stack
- **Node.js**: JavaScript runtime
- **Python**: General-purpose programming
- **Go**: Systems programming, APIs
- **C#/.NET**: Enterprise applications
- **Java**: Enterprise and Android development
- **Frontend (React/Vue/Angular)**: UI frameworks
- **Full-stack (MERN/MEAN/etc.)**: Combined frontend/backend stacks
- **Other**: Custom technology choices

#### Deployment Target
- **Cloud (AWS/GCP/Azure)**: Major cloud providers
- **Self-hosted (VPS/Dedicated)**: Traditional hosting
- **Docker Containers**: Containerized deployments
- **Kubernetes**: Orchestrated container deployments
- **Serverless**: Function-as-a-Service
- **Static Hosting (Netlify/Vercel)**: CDN-hosted static sites
- **Hybrid**: Mixed deployment strategies

#### Testing Level
- **Unit tests only**: Basic function testing
- **Unit + Integration tests**: Component interaction testing
- **Unit + Integration + E2E tests**: Full user journey testing
- **Comprehensive testing**: Performance and load testing included
- **Minimal testing**: Basic validation only

#### Governance Sensitivity
- **Standard**: Basic security and compliance
- **High**: Financial/healthcare data handling
- **Enterprise**: Audit trails and advanced security
- **Public sector**: Government compliance standards
- **None**: Personal/hobby projects

## Generated Manifest

The agent creates `project.manifest.json` with the following structure:

```json
{
  "version": "1.0.0",
  "generatedAt": "2025-01-03T12:00:00.000Z",
  "requirements": {
    "productType": "Web Application",
    "coreFeatures": ["Authentication/Authorization", "REST API", "Web UI (Frontend)"],
    "preferredStack": "Node.js",
    "deploymentTarget": "Docker Containers",
    "testingLevel": "Unit + Integration tests",
    "governanceSensitivity": "Standard",
    "needsCI": true,
    "needsDocker": true,
    "needsMonitoring": false,
    "teamSize": "Small team (2-5 developers)"
  },
  "derived": {
    "features": ["auth", "api", "frontend", "node", "ci", "docker", "unit-tests", "integration-tests"],
    "rationale": {
      "features": "Features derived from your requirements to enable cleanup rules and scaffolding",
      "stack": "Based on Node.js preference",
      "infrastructure": "Based on deployment and operational needs",
      "governance": "Based on data sensitivity and compliance requirements",
      "testing": "Based on desired testing coverage level"
    }
  }
}
```

## Feature Mapping

The agent automatically maps your selections to cleanup features:

| User Selection | Derived Features |
|----------------|------------------|
| Authentication/Authorization | `auth` |
| REST API | `api` |
| GraphQL API | `graphql` |
| Web UI (Frontend) | `frontend` |
| Database Integration | `database` |
| Caching | `cache` |
| File Storage | `storage` |
| Real-time Features | `websocket` |
| Background Jobs | `jobs` |
| Admin Panel | `admin` |
| API Documentation | `docs` |
| Monitoring/Logging | `monitoring` |
| Search Functionality | `search` |
| Email/SMS Notifications | `notifications` |
| Node.js stack | `node` |
| Python stack | `python` |
| Go stack | `go` |
| .NET stack | `dotnet` |
| Java stack | `java` |
| CI/CD needed | `ci` |
| Docker needed | `docker` |
| High governance | `security`, `compliance` |
| Enterprise governance | `security`, `audit`, `compliance` |
| Public sector | `security`, `compliance`, `audit` |
| Unit tests | `unit-tests` |
| Integration tests | `integration-tests` |
| E2E tests | `e2e-tests` |
| Performance tests | `performance-tests` |

## Integration with Cleanup System

When you run `npm run agent:apply`, the agent:

1. **Updates `cleanup.config.yaml`**: Enables feature flags based on your manifest
2. **Loads Stack Presets**: Applies technology-specific cleanup rules from `presets/`
3. **Configures CI**: Creates environment files for feature-aware cleanup in CI

### Example Configuration Changes

**Before (default):**
```yaml
features: {}
rules:
  - id: "strip-template-blocks"
    type: "block_markers"
    # ... basic config
```

**After (with Node.js + Auth + API):**
```yaml
features:
  node: true
  auth: true
  api: true
  ci: true
  docker: true
  unit-tests: true
  integration-tests: true
rules:
  - id: "strip-template-blocks"
    type: "block_markers"
    # ... config with feature conditions
  - id: "node-dependencies"
    type: "package_prune"
    condition: "features.node"
    # ... Node.js specific rules
```

## CI Integration

The manifest automatically configures CI workflows:

- **cleanup-guard.yml**: Uses manifest features to determine what to clean
- **ci.yml**: Validates manifest schema when present
- **engine-tests.yml**: Runs cleanup engine tests

## Validation

The manifest is validated against a JSON schema (`schemas/project.manifest.schema.json`) to ensure:
- Required fields are present
- Values match allowed enums
- Arrays contain valid options
- Derived features are consistent

Run validation manually:
```bash
node scripts/agent/validate.js project.manifest.json
```

## Customization

### Adding Custom Features

To add custom features to the agent:

1. **Update CLI prompts** in `scripts/agent/cli.js`
2. **Add feature mapping** in the `generateManifest()` method
3. **Update schema** in `schemas/project.manifest.schema.json`
4. **Create cleanup rules** that use the new feature flags

### Creating Stack Presets

Add technology-specific presets in `presets/`:

```yaml
# presets/my-stack.yaml
name: "My Custom Stack"
description: "Custom technology setup"
extends: "common"

rules:
  - id: "my-cleanup-rule"
    type: "file_glob_delete"
    condition: "features.myFeature"
    patterns:
      - "**/*.myext"
```

### Manual Manifest Creation

You can create `project.manifest.json` manually if you prefer not to use the interactive CLI:

```json
{
  "version": "1.0.0",
  "generatedAt": "2025-01-03T12:00:00.000Z",
  "requirements": {
    "productType": "Web Application",
    "coreFeatures": ["REST API"],
    "preferredStack": "Node.js",
    "deploymentTarget": "Docker Containers",
    "testingLevel": "Unit tests only",
    "governanceSensitivity": "Standard",
    "needsCI": true,
    "needsDocker": true,
    "needsMonitoring": false,
    "teamSize": "Solo developer"
  },
  "derived": {
    "features": ["api", "node", "ci", "docker", "unit-tests"],
    "rationale": {
      "features": "Manually specified features",
      "stack": "Manual stack selection",
      "infrastructure": "Manual infrastructure choices",
      "governance": "Manual governance settings",
      "testing": "Manual testing preferences"
    }
  }
}
```

Then run `npm run agent:apply` to configure your environment.

## Troubleshooting

### Manifest Validation Errors

- Check that all required fields are present
- Ensure enum values match the schema
- Validate JSON syntax with a JSON linter

### Cleanup Not Working as Expected

- Verify manifest features are correct
- Check that `npm run agent:apply` was run after manifest changes
- Review cleanup config for feature flag conditions

### CI Issues

- Ensure manifest is committed if using agent features
- Check that CI workflows reference the correct manifest path
- Validate that feature flags are properly passed to cleanup commands

## Next Steps

To see the agent in action:
1. Create a new project directory
2. Copy the DevEnvTemplate files
3. Run `npm run agent:init` to generate a manifest
4. Run `npm run agent:apply` to configure cleanup and CI
5. Add your application code
6. Run `npm run cleanup:apply` to remove template artifacts

The agent produces manifest-driven cleanup, feature-aware configuration, CI integration, and template artifact removal.
