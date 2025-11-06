# Demo Bundle Specification

## Overview

Demo Bundles are provider-agnostic, self-contained packages that enable quick deployment of generated projects for prototyping and demonstration purposes. They abstract away deployment complexity while maintaining technology neutrality.

## Bundle Structure

```
demo-bundle/
├── bundle.json          # Bundle metadata and configuration
├── app/                 # Application code (generated project)
├── deploy/              # Deployment configuration
│   ├── manifest.json    # Deployment manifest
│   ├── docker/          # Container configuration
│   └── scripts/         # Deployment scripts
├── demo/                # Demo-specific assets
│   ├── data/            # Sample data
│   ├── config/          # Demo configuration
│   └── README.md        # Demo instructions
└── .dev-template/       # DevEnvTemplate metadata
    ├── manifest.json    # Original project manifest
    ├── checksums.json   # File integrity hashes
    └── provenance.json  # Generation provenance
```

## Bundle Metadata (`bundle.json`)

```json
{
  "schema": "https://devenv-template.dev/schema/v1/demo-bundle.json",
  "version": "1.0.0",
  "id": "unique-bundle-id",
  "name": "My React App Demo",
  "description": "Generated React application with demo data",
  "generatedAt": "2024-01-01T00:00:00Z",
  "generator": {
    "version": "1.0.0",
    "templatePack": "react-spa-v1.2.0"
  },
  "project": {
    "manifest": "manifest.json",
    "technologies": ["React", "TypeScript", "Vite"],
    "features": ["Web UI (Frontend)", "Authentication/Authorization"]
  },
  "deployment": {
    "supportedTargets": ["docker", "vercel", "netlify"],
    "defaultTarget": "docker",
    "ports": [3000],
    "healthCheck": "/health"
  },
  "demo": {
    "sampleData": true,
    "adminCredentials": {
      "username": "admin",
      "password": "demo123"
    },
    "endpoints": [
      { "path": "/", "description": "Home page" },
      { "path": "/api/users", "description": "User management API" }
    ]
  },
  "checksums": "checksums.json",
  "provenance": "provenance.json"
}
```

## Deployment Manifest (`deploy/manifest.json`)

```json
{
  "schema": "https://devenv-template.dev/schema/v1/deployment-manifest.json",
  "version": "1.0.0",
  "targets": {
    "docker": {
      "image": "my-app:latest",
      "ports": ["3000:3000"],
      "environment": {
        "NODE_ENV": "production",
        "DEMO_MODE": "true"
      },
      "volumes": ["./demo/data:/app/data"],
      "healthcheck": {
        "test": ["curl", "-f", "http://localhost:3000/health"],
        "interval": "30s",
        "timeout": "10s",
        "retries": 3
      }
    },
    "vercel": {
      "framework": "vite",
      "buildCommand": "npm run build",
      "outputDirectory": "dist",
      "environment": {
        "DEMO_MODE": "true"
      }
    }
  }
}
```

## Docker Configuration (`deploy/docker/`)

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY app/package*.json ./
RUN npm ci --only=production

# Copy application code
COPY app/ .

# Copy demo data
COPY demo/data ./data

# Set demo environment
ENV NODE_ENV=production
ENV DEMO_MODE=true

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["npm", "start"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DEMO_MODE=true
    volumes:
      - ./demo/data:/app/data
    healthcheck:
      test: ["curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## Demo Configuration (`demo/config/`)

**demo-config.json:**
```json
{
  "mode": "demo",
  "sampleData": {
    "users": 10,
    "posts": 50,
    "comments": 200
  },
  "features": {
    "authentication": true,
    "adminPanel": true,
    "apiDocs": true
  },
  "ui": {
    "theme": "demo",
    "branding": {
      "name": "Demo App",
      "logo": "/demo-logo.png"
    }
  }
}
```

## Deployment Scripts (`deploy/scripts/`)

**deploy.sh:**
```bash
#!/bin/bash
set -e

echo "🚀 Deploying Demo Bundle..."

# Detect deployment target
if [ -n "$VERCEL" ]; then
    echo "📦 Deploying to Vercel..."
    npm run build
elif [ -n "$NETLIFY" ]; then
    echo "📦 Deploying to Netlify..."
    npm run build
else
    echo "🐳 Deploying with Docker..."
    docker build -t my-app .
    docker run -p 3000:3000 my-app
fi

echo "✅ Deployment complete!"
echo "🌐 Application available at: http://localhost:3000"
```

## Checksums & Integrity (`checksums.json`)

```json
{
  "schema": "https://devenv-template.dev/schema/v1/checksums.json",
  "version": "1.0.0",
  "algorithm": "sha256",
  "files": {
    "app/package.json": "a1b2c3d4...",
    "app/src/App.tsx": "e5f6g7h8...",
    "demo/data/users.json": "i9j0k1l2...",
    "deploy/docker/Dockerfile": "m3n4o5p6..."
  },
  "generatedAt": "2024-01-01T00:00:00Z"
}
```

## Provenance Tracking (`provenance.json`)

```json
{
  "schema": "https://devenv-template.dev/schema/v1/provenance.json",
  "version": "1.0.0",
  "generation": {
    "timestamp": "2024-01-01T00:00:00Z",
    "devEnvTemplateVersion": "1.0.0",
    "templatePack": {
      "name": "react-spa",
      "version": "1.2.0",
      "checksum": "abc123..."
    },
    "inputs": {
      "manifest": "manifest-hash",
      "options": "options-hash"
    }
  },
  "llm": {
    "contracts": [
      {
        "id": "code-generation",
        "version": "1.0.0",
        "seed": "deterministic-seed-123",
        "attempts": 1,
        "tokens": 1500
      }
    ]
  },
  "policies": {
    "applied": ["license_compliance", "security_scan"],
    "overrides": []
  }
}
```

## Bundle Generation Process

```typescript
async function createDemoBundle(
  projectPath: string,
  manifest: ProjectManifest,
  options: BundleOptions
): Promise<DemoBundle> {
  // 1. Analyze generated project
  const projectAnalysis = await analyzeProject(projectPath)

  // 2. Generate deployment configurations
  const deploymentConfig = await generateDeploymentConfig(projectAnalysis, options)

  // 3. Create demo data and configuration
  const demoConfig = await generateDemoConfig(manifest, options)

  // 4. Package everything into bundle
  const bundle = await packageBundle({
    project: projectAnalysis,
    deployment: deploymentConfig,
    demo: demoConfig,
    manifest,
    options
  })

  // 5. Generate integrity checks
  const checksums = await generateChecksums(bundle)

  // 6. Record provenance
  const provenance = await generateProvenance(manifest, options)

  return {
    ...bundle,
    checksums,
    provenance
  }
}
```

## Deployment Adapter Interface

```typescript
interface DeploymentAdapter {
  name: string
  supported: boolean

  async detect(): Promise<boolean>
  async prepare(bundle: DemoBundle): Promise<PreparedDeployment>
  async deploy(prepared: PreparedDeployment): Promise<DeploymentResult>
  async verify(result: DeploymentResult): Promise<VerificationResult>
  async cleanup(result: DeploymentResult): Promise<void>
}

interface DeploymentResult {
  success: boolean
  url?: string
  logs: string[]
  metadata: Record<string, any>
}
```

## Bundle Validation

```typescript
async function validateDemoBundle(bundlePath: string): Promise<ValidationResult> {
  const checks = [
    validateStructure,
    validateChecksums,
    validateDeploymentConfig,
    validateDemoConfig,
    validateProvenance
  ]

  const results = await Promise.all(
    checks.map(check => check(bundlePath))
  )

  return {
    valid: results.every(r => r.valid),
    checks: results
  }
}
```

## Usage Examples

### Quick Local Demo
```bash
# Generate and run demo
dev-template demo manifest.json --target docker

# Access at http://localhost:3000
```

### Deploy to Platform
```bash
# Deploy to Vercel
dev-template demo manifest.json --deploy vercel

# Deploy to Netlify
dev-template demo manifest.json --deploy netlify
```

### Custom Demo Configuration
```bash
# With custom demo data
dev-template demo manifest.json --demo-config custom-demo.json
```

This specification ensures demo bundles are portable, verifiable, and easy to deploy across different platforms while maintaining the integrity and provenance of the generated project.
