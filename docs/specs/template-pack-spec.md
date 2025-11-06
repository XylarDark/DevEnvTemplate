# Template Pack Specification

## Overview

Template Packs are self-contained, technology-specific packages that define how to generate project structures for specific stacks, frameworks, and tools. They are the technology-specific implementation layer that DevEnvTemplate uses to create actual project files.

## Pack Structure

```
template-pack/
├── pack.json          # Pack metadata and configuration
├── templates/         # Template files directory
│   ├── src/
│   ├── config/
│   └── docs/
├── mappings.json      # Feature-to-file mappings
├── rules.json         # Cleanup rules DSL
├── hooks/             # Lifecycle hooks (optional)
│   ├── pre-generate.js
│   ├── post-generate.js
│   └── validate.js
└── README.md          # Pack documentation
```

## Pack Metadata (`pack.json`)

```json
{
  "schema": "https://devenv-template.dev/schema/v1/template-pack.json",
  "version": "1.0.0",
  "name": "react-spa",
  "displayName": "React Single Page Application",
  "description": "Modern React SPA with TypeScript, Vite, and testing",
  "author": "DevEnvTemplate Team",
  "license": "MIT",
  "compatibility": {
    "minDevEnvVersion": "1.0.0",
    "maxDevEnvVersion": "2.0.0"
  },
  "technologies": {
    "primary": "React",
    "framework": "Vite",
    "language": "TypeScript",
    "testing": ["Vitest", "React Testing Library"],
    "styling": "Tailwind CSS"
  },
  "supportedFeatures": [
    "Web UI (Frontend)",
    "REST API",
    "Authentication/Authorization",
    "Testing"
  ],
  "supportedStacks": [
    "Frontend (React/Vue/Angular)"
  ],
  "dependencies": {
    "required": ["node>=18.0.0"],
    "optional": ["yarn", "pnpm"]
  },
  "metadata": {
    "tags": ["frontend", "react", "typescript", "spa"],
    "category": "frontend",
    "difficulty": "beginner",
    "estimatedSetupTime": "5 minutes"
  }
}
```

## Feature Mapping (`mappings.json`)

Defines how project requirements translate to actual files and configurations.

```json
{
  "schema": "https://devenv-template.dev/schema/v1/feature-mapping.json",
  "version": "1.0.0",
  "mappings": {
    "features": {
      "Web UI (Frontend)": {
        "files": [
          "src/App.tsx",
          "src/main.tsx",
          "src/components/Button.tsx",
          "src/pages/Home.tsx"
        ],
        "folders": [
          "src/components",
          "src/pages",
          "src/hooks",
          "src/utils"
        ],
        "dependencies": {
          "react": "^18.0.0",
          "react-dom": "^18.0.0"
        },
        "devDependencies": {
          "@types/react": "^18.0.0"
        }
      },
      "Authentication/Authorization": {
        "files": [
          "src/auth/AuthContext.tsx",
          "src/auth/LoginForm.tsx",
          "src/auth/useAuth.ts"
        ],
        "dependencies": {
          "jwt-decode": "^4.0.0"
        }
      }
    },
    "stacks": {
      "Frontend (React/Vue/Angular)": {
        "files": [
          "vite.config.ts",
          "tsconfig.json",
          "tailwind.config.js"
        ],
        "folders": ["src"],
        "scripts": {
          "dev": "vite",
          "build": "vite build",
          "preview": "vite preview"
        }
      }
    },
    "infrastructure": {
      "needsCI": {
        "files": [".github/workflows/ci.yml"],
        "scripts": {
          "ci": "npm run build && npm run test"
        }
      },
      "needsDocker": {
        "files": ["Dockerfile", "docker-compose.yml"],
        "folders": []
      }
    }
  }
}
```

## Cleanup Rules DSL (`rules.json`)

Defines how to safely remove template code during project cleanup.

```json
{
  "schema": "https://devenv-template.dev/schema/v1/cleanup-rules.json",
  "version": "1.0.0",
  "rules": [
    {
      "id": "remove-unused-component",
      "description": "Remove unused React component",
      "trigger": {
        "feature": "!Web UI (Frontend)"
      },
      "actions": [
        {
          "type": "delete",
          "target": "src/components/Example.tsx"
        },
        {
          "type": "remove_import",
          "file": "src/App.tsx",
          "import": "Example"
        }
      ]
    },
    {
      "id": "remove-auth-setup",
      "description": "Remove authentication setup if not needed",
      "trigger": {
        "feature": "!Authentication/Authorization"
      },
      "actions": [
        {
          "type": "delete",
          "target": "src/auth/"
        },
        {
          "type": "replace_content",
          "file": "src/App.tsx",
          "pattern": "<AuthProvider>[\\s\\S]*?<\\/AuthProvider>",
          "replacement": ""
        }
      ]
    }
  ]
}
```

## Lifecycle Hooks

Optional JavaScript modules that run at specific points in the generation process.

### Pre-generate Hook (`hooks/pre-generate.js`)

```javascript
module.exports = async function preGenerate(context) {
  const { requirements, destination } = context

  // Validate requirements for this pack
  if (requirements.preferredStack !== 'Frontend (React/Vue/Angular)') {
    throw new Error('This pack only supports React/Vue/Angular stacks')
  }

  // Prepare destination directory
  await ensureDirectoryExists(destination)

  // Custom validation logic
  return {
    validated: true,
    warnings: [],
    modifications: []
  }
}
```

### Post-generate Hook (`hooks/post-generate.js`)

```javascript
module.exports = async function postGenerate(context) {
  const { requirements, destination, generatedFiles } = context

  // Run npm install
  if (generatedFiles.includes('package.json')) {
    await runCommand('npm install', { cwd: destination })
  }

  // Initialize git repo
  await runCommand('git init', { cwd: destination })

  // Custom setup steps
  return {
    success: true,
    artifacts: ['node_modules/', '.git/']
  }
}
```

### Validate Hook (`hooks/validate.js`)

```javascript
module.exports = async function validate(context) {
  const { destination, requirements } = context

  // Check if generated project is valid
  const packageJson = await readJsonFile(path.join(destination, 'package.json'))
  const hasRequiredDeps = packageJson.dependencies && packageJson.dependencies.react

  return {
    valid: hasRequiredDeps,
    errors: hasRequiredDeps ? [] : ['Missing React dependency'],
    warnings: []
  }
}
```

## Hook Context Interface

```typescript
interface HookContext {
  requirements: ProjectRequirements    // From project definition
  destination: string                  // Target directory path
  generatedFiles: string[]            // Files created during generation
  packConfig: PackConfig             // This pack's configuration
  options: GenerationOptions         // CLI/website options
}

interface HookResult {
  success?: boolean
  valid?: boolean
  errors?: string[]
  warnings?: string[]
  modifications?: FileModification[]
  artifacts?: string[]
}
```

## Distribution & Discovery

### Pack Registry Format

```json
{
  "packs": [
    {
      "id": "react-spa",
      "name": "React SPA",
      "version": "1.0.0",
      "description": "Modern React single page application",
      "tags": ["frontend", "react", "typescript"],
      "compatibility": ">=1.0.0",
      "downloadUrl": "https://registry.devenv-template.dev/packs/react-spa-1.0.0.tar.gz",
      "checksum": "sha256:...",
      "metadata": {
        "size": "2.3MB",
        "downloads": 1250,
        "rating": 4.5
      }
    }
  ]
}
```

### Pack Installation

```bash
# Install from registry
dev-template install react-spa

# Install from local file
dev-template install ./my-pack.tar.gz

# Install from URL
dev-template install https://example.com/my-pack.tar.gz
```

## Validation & Testing

### Pack Validation Rules

1. **Schema Compliance**: All JSON files must validate against their schemas
2. **File References**: All referenced files in mappings must exist in templates/
3. **Hook Safety**: Hooks must not perform destructive operations outside destination
4. **Dependency Resolution**: All declared dependencies must be available
5. **Idempotency**: Pack generation must be idempotent (safe to re-run)

### Test Structure

```
template-pack/
├── tests/
│   ├── fixtures/
│   │   ├── valid-requirements.json
│   │   └── invalid-requirements.json
│   ├── integration.test.js
│   └── validation.test.js
└── test-config.json
```

## Security Considerations

1. **Hook Sandboxing**: Hooks run in restricted environment with limited filesystem access
2. **Dependency Auditing**: All dependencies must pass security scans
3. **File Permissions**: Generated files have appropriate permissions set
4. **Path Traversal Protection**: All file paths are validated and sandboxed

## Migration & Versioning

### Semantic Versioning

- **MAJOR**: Breaking changes to pack interface or generated output format
- **MINOR**: New features, new supported stacks/features
- **PATCH**: Bug fixes, template improvements

### Backward Compatibility

- Pack configurations maintain backward compatibility within major versions
- Migration tools provided for breaking changes
- Deprecation warnings for 2 major versions before removal
