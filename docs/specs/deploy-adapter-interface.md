# Deployment Adapter Interface

## Overview

Deployment Adapters provide a technology-agnostic abstraction for deploying Demo Bundles to various hosting platforms. They handle platform-specific deployment logic while maintaining a consistent interface.

## Core Interface

```typescript
interface DeploymentAdapter {
  name: string
  description: string
  supportedPlatforms: string[]
  capabilities: DeploymentCapabilities

  // Detection
  detect(context: DetectionContext): Promise<boolean>

  // Preparation
  prepare(bundle: DemoBundle, options: PrepareOptions): Promise<PreparedDeployment>

  // Deployment
  deploy(prepared: PreparedDeployment, options: DeployOptions): Promise<DeploymentResult>

  // Verification
  verify(result: DeploymentResult, options: VerifyOptions): Promise<VerificationResult>

  // Cleanup
  cleanup(result: DeploymentResult): Promise<void>
}

interface DeploymentCapabilities {
  supportsBuild: boolean
  supportsStatic: boolean
  supportsContainer: boolean
  supportsServerless: boolean
  requiresCredentials: boolean
  supportsCustomDomain: boolean
}

interface DetectionContext {
  environment: Record<string, string>
  filesystem: string[]
  packageJson?: any
}

interface PreparedDeployment {
  adapter: string
  bundle: DemoBundle
  config: Record<string, any>
  artifacts: string[]
  estimatedCost?: number
  prerequisites: string[]
}

interface DeploymentResult {
  success: boolean
  url?: string
  deploymentId?: string
  logs: string[]
  metadata: Record<string, any>
  cleanupInstructions?: string[]
}

interface VerificationResult {
  accessible: boolean
  healthy: boolean
  tests: VerificationTest[]
  metrics: Record<string, any>
}

interface VerificationTest {
  name: string
  status: 'passed' | 'failed' | 'warning'
  message: string
  duration: number
}
```

## Adapter Registry

```typescript
interface AdapterRegistry {
  register(adapter: DeploymentAdapter): void
  getAdapter(name: string): DeploymentAdapter | undefined
  listAdapters(): DeploymentAdapter[]
  detectAdapter(context: DetectionContext): Promise<DeploymentAdapter[]>
}

const registry = new AdapterRegistry()

// Register built-in adapters
registry.register(new DockerAdapter())
registry.register(new VercelAdapter())
registry.register(new NetlifyAdapter())
registry.register(new RailwayAdapter())
```

## Built-in Adapters

### Docker Adapter

```typescript
class DockerAdapter implements DeploymentAdapter {
  name = 'docker'
  description = 'Local Docker container deployment'
  supportedPlatforms = ['linux', 'macos', 'windows']

  async detect(context: DetectionContext): Promise<boolean> {
    return context.filesystem.includes('Dockerfile') ||
           context.filesystem.includes('docker-compose.yml')
  }

  async prepare(bundle: DemoBundle): Promise<PreparedDeployment> {
    const config = {
      image: `${bundle.name}:latest`,
      ports: bundle.deployment.ports,
      environment: bundle.deployment.environment
    }

    return {
      adapter: this.name,
      bundle,
      config,
      artifacts: ['Dockerfile', 'docker-compose.yml'],
      prerequisites: ['docker']
    }
  }

  async deploy(prepared: PreparedDeployment): Promise<DeploymentResult> {
    // Build and run container
    const result = await runDockerCompose(prepared.config)
    return result
  }

  async verify(result: DeploymentResult): Promise<VerificationResult> {
    // Health check container
    return await healthCheckContainer(result)
  }
}
```

### Vercel Adapter

```typescript
class VercelAdapter implements DeploymentAdapter {
  name = 'vercel'
  description = 'Vercel serverless deployment'
  supportedPlatforms = ['vercel']

  async detect(context: DetectionContext): Promise<boolean> {
    return !!context.environment.VERCEL ||
           context.filesystem.includes('vercel.json')
  }

  async prepare(bundle: DemoBundle): Promise<PreparedDeployment> {
    return {
      adapter: this.name,
      bundle,
      config: {
        framework: detectFramework(bundle),
        buildCommand: 'npm run build',
        outputDirectory: 'dist'
      },
      artifacts: [],
      prerequisites: ['vercel-cli']
    }
  }
}
```

## Deployment Pipeline

```typescript
async function deployDemoBundle(
  bundle: DemoBundle,
  options: DeploymentOptions = {}
): Promise<DeploymentResult> {
  // 1. Detect suitable adapters
  const adapters = await registry.detectAdapter({
    environment: process.env,
    filesystem: await listFiles(bundle.path),
    packageJson: await readPackageJson(bundle.path)
  })

  if (adapters.length === 0) {
    throw new Error('No suitable deployment adapter found')
  }

  // 2. Select adapter (user preference or auto-select)
  const adapter = options.adapter
    ? registry.getAdapter(options.adapter)
    : adapters[0]

  if (!adapter) {
    throw new Error(`Adapter ${options.adapter} not found`)
  }

  // 3. Prepare deployment
  const prepared = await adapter.prepare(bundle, options)

  // 4. Check prerequisites
  await checkPrerequisites(prepared.prerequisites)

  // 5. Deploy
  const result = await adapter.deploy(prepared, options)

  // 6. Verify deployment
  const verification = await adapter.verify(result, options)

  if (!verification.accessible) {
    await adapter.cleanup(result)
    throw new Error('Deployment verification failed')
  }

  return result
}
```

## Error Handling

```typescript
enum DeploymentErrorType {
  DETECTION_FAILED = 'detection_failed',
  PREPARATION_FAILED = 'preparation_failed',
  PREREQUISITES_MISSING = 'prerequisites_missing',
  DEPLOYMENT_FAILED = 'deployment_failed',
  VERIFICATION_FAILED = 'verification_failed',
  CLEANUP_FAILED = 'cleanup_failed'
}

interface DeploymentError {
  type: DeploymentErrorType
  adapter: string
  message: string
  details?: any
  recoverable: boolean
  suggestions: string[]
}
```

## Configuration

```json
{
  "deployment": {
    "adapters": {
      "docker": {
        "enabled": true,
        "default": true,
        "config": {
          "detach": true,
          "remove": false
        }
      },
      "vercel": {
        "enabled": true,
        "config": {
          "team": "my-team",
          "project": "demo-app"
        }
      }
    },
    "verification": {
      "timeout": 300,
      "retries": 3,
      "healthChecks": true
    }
  }
}
```

## Extensibility

### Custom Adapter Development

```typescript
class CustomAdapter implements DeploymentAdapter {
  name = 'my-custom'
  description = 'Custom deployment platform'

  async detect(context: DetectionContext): Promise<boolean> {
    // Custom detection logic
    return context.environment.CUSTOM_PLATFORM === 'true'
  }

  async deploy(prepared: PreparedDeployment): Promise<DeploymentResult> {
    // Custom deployment logic
    const result = await customDeployAPI(prepared.config)
    return result
  }
}

// Register custom adapter
registry.register(new CustomAdapter())
```

### Adapter Plugins

```typescript
interface AdapterPlugin {
  name: string
  adapters: DeploymentAdapter[]
  configSchema: JSONSchema

  init(config: any): Promise<void>
}

// Load plugins dynamically
const plugins = await loadAdapterPlugins()
for (const plugin of plugins) {
  await plugin.init(config)
  for (const adapter of plugin.adapters) {
    registry.register(adapter)
  }
}
```

This interface ensures deployment is abstracted away from generation logic, allowing DevEnvTemplate to support any hosting platform through consistent adapter implementations.
