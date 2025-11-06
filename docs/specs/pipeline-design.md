# Deterministic Generation Pipeline

## Overview

The DevEnvTemplate generation pipeline is designed to be deterministic, idempotent, and safe. It follows a plan-apply-diff pattern that ensures predictable outcomes and rollback capabilities.

## Pipeline Phases

```
Input Validation → Plan Generation → Conflict Resolution → Safe Application → Verification
```

## Core Principles

### Determinism
- Same inputs always produce identical outputs
- No random values or timestamps in generated content
- Template rendering uses deterministic algorithms

### Idempotency
- Running the same generation multiple times is safe
- No duplicate files or conflicting modifications
- State reconciliation handles existing projects

### Safety First
- Dry-run mode shows all changes before execution
- Backup and rollback capabilities
- Validation at every step
- No destructive operations without explicit confirmation

## Pipeline Architecture

### 1. Input Validation Phase

**Inputs:**
- Project Definition (JSON Schema validated)
- Template Pack (verified and compatible)
- Target Directory (existence and permissions checked)

**Validations:**
```typescript
interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  recommendations: string[]
}

// Validate all inputs before proceeding
const validation = await validateInputs({
  projectDefinition,
  templatePack,
  targetDirectory,
  options
})

if (!validation.valid) {
  throw new ValidationError(validation.errors)
}
```

### 2. Plan Generation Phase

**Plan Structure:**
```typescript
interface GenerationPlan {
  id: string                    // Unique plan identifier
  timestamp: string            // ISO 8601 creation time
  inputs: {
    projectDefinition: string  // Content hash
    templatePack: string       // Pack ID + version
    options: GenerationOptions
  }
  operations: Operation[]       // Atomic operations to perform
  conflicts: Conflict[]         // Potential conflicts detected
  metadata: {
    estimatedTime: number      // In milliseconds
    estimatedSize: number      // In bytes
    riskLevel: 'low' | 'medium' | 'high'
  }
}

interface Operation {
  type: 'create_file' | 'create_directory' | 'modify_file' | 'delete_file'
  target: string               // Relative path
  content?: string            // For file operations
  mode?: number               // File permissions
  backup?: boolean            // Whether to backup existing file
}

interface Conflict {
  type: 'file_exists' | 'permission_denied' | 'disk_space' | 'dependency_missing'
  target: string
  severity: 'warning' | 'error'
  resolution: 'skip' | 'overwrite' | 'backup' | 'merge'
}
```

**Plan Generation Algorithm:**

```typescript
async function generatePlan(requirements, templatePack, targetDir): GenerationPlan {
  const operations: Operation[] = []
  const conflicts: Conflict[] = []

  // 1. Analyze requirements against pack capabilities
  const packCapabilities = await loadPackCapabilities(templatePack)
  validateRequirementsFit(requirements, packCapabilities)

  // 2. Generate base structure from stack mapping
  const baseStructure = packCapabilities.stacks[requirements.preferredStack]
  operations.push(...generateStructureOps(baseStructure, targetDir))

  // 3. Apply feature mappings
  for (const feature of requirements.coreFeatures) {
    const featureMapping = packCapabilities.features[feature]
    operations.push(...generateFeatureOps(featureMapping, targetDir))
  }

  // 4. Apply infrastructure requirements
  operations.push(...generateInfrastructureOps(requirements, targetDir))

  // 5. Check for conflicts with existing files
  conflicts.push(...await detectConflicts(operations, targetDir))

  // 6. Optimize operations (remove redundant, order properly)
  operations = optimizeOperations(operations)

  return {
    id: generateId(),
    timestamp: new Date().toISOString(),
    inputs: hashInputs(requirements, templatePack),
    operations,
    conflicts,
    metadata: calculateMetadata(operations)
  }
}
```

### 3. Conflict Resolution Phase

**Conflict Types:**
- **File Exists**: Target file already exists
- **Directory Exists**: Target directory exists with content
- **Permission Denied**: Cannot write to target location
- **Disk Space**: Insufficient disk space for generation
- **Dependency Missing**: Required tools/dependencies not available

**Resolution Strategies:**
```typescript
interface ResolutionStrategy {
  type: 'interactive' | 'automatic' | 'fail'
  rules: {
    [conflictType: string]: 'skip' | 'overwrite' | 'backup' | 'merge' | 'prompt'
  }
  backupDirectory?: string
}

// Interactive resolution for complex conflicts
async function resolveConflicts(plan: GenerationPlan, strategy: ResolutionStrategy): GenerationPlan {
  const resolvedOperations: Operation[] = []

  for (const operation of plan.operations) {
    const conflicts = plan.conflicts.filter(c => c.target === operation.target)

    if (conflicts.length === 0) {
      resolvedOperations.push(operation)
      continue
    }

    const resolution = await resolveConflict(operation, conflicts, strategy)
    resolvedOperations.push(...resolution.operations)
  }

  return { ...plan, operations: resolvedOperations }
}
```

### 4. Safe Application Phase

**Application guarantees:**
- Atomic operations where possible
- Backup creation for destructive operations
- Rollback capability on failure
- Progress reporting and cancellation support

```typescript
interface ApplicationResult {
  success: boolean
  appliedOperations: Operation[]
  failedOperations: Operation[]
  backups: BackupRecord[]
  errors: Error[]
  rollbackPlan?: GenerationPlan
}

async function applyPlan(plan: GenerationPlan, options: ApplyOptions): ApplicationResult {
  const result: ApplicationResult = {
    success: true,
    appliedOperations: [],
    failedOperations: [],
    backups: [],
    errors: []
  }

  // Create backup directory
  const backupDir = options.backupDirectory || createTempBackupDir()

  for (const operation of plan.operations) {
    try {
      // Create backup if needed
      if (operation.backup && await fileExists(operation.target)) {
        const backup = await createBackup(operation.target, backupDir)
        result.backups.push(backup)
      }

      // Apply operation
      await applyOperation(operation)
      result.appliedOperations.push(operation)

      // Report progress
      options.onProgress?.(result.appliedOperations.length / plan.operations.length)

    } catch (error) {
      result.success = false
      result.failedOperations.push(operation)
      result.errors.push(error)

      // Stop on first error unless continueOnError is set
      if (!options.continueOnError) {
        result.rollbackPlan = createRollbackPlan(result.appliedOperations, result.backups)
        break
      }
    }
  }

  return result
}
```

### 5. Verification Phase

**Verification checks:**
- All planned operations completed successfully
- Generated files are syntactically correct
- Dependencies can be installed
- Basic functionality tests pass

```typescript
interface VerificationResult {
  passed: boolean
  checks: VerificationCheck[]
  recommendations: string[]
}

interface VerificationCheck {
  name: string
  status: 'passed' | 'failed' | 'warning'
  message: string
  details?: any
}

async function verifyGeneration(plan: GenerationPlan, result: ApplicationResult): VerificationResult {
  const checks: VerificationCheck[] = []

  // 1. File existence check
  checks.push(await verifyFileExistence(plan.operations))

  // 2. Syntax validation
  checks.push(await verifySyntax(plan.operations))

  // 3. Dependency resolution
  checks.push(await verifyDependencies(plan.operations))

  // 4. Template integrity
  checks.push(await verifyTemplateIntegrity(plan.operations))

  // 5. Pack-specific validations
  checks.push(await runPackValidations(plan))

  const passed = checks.every(check => check.status !== 'failed')
  const recommendations = generateRecommendations(checks)

  return { passed, checks, recommendations }
}
```

## Operational Modes

### Dry Run Mode
```bash
dev-template generate --dry-run manifest.json
```
- Executes planning and conflict detection
- Shows detailed change preview
- No filesystem modifications
- Estimates time and disk usage

### Interactive Mode
```bash
dev-template generate --interactive manifest.json
```
- Prompts for conflict resolution
- Shows progress with ability to cancel
- Provides detailed error explanations

### Non-Interactive Mode
```bash
dev-template generate --yes manifest.json
```
- Uses automatic conflict resolution rules
- Suitable for CI/CD pipelines
- Fails fast on errors

### Diff Mode
```bash
dev-template diff manifest.json
```
- Shows differences between current state and desired state
- Useful for understanding what would change
- Can be used to verify idempotency

## Rollback & Recovery

### Automatic Rollback
```typescript
async function rollback(result: ApplicationResult): Promise<void> {
  // Restore backups in reverse order
  for (const backup of result.backups.reverse()) {
    await restoreBackup(backup)
  }

  // Remove created files
  for (const operation of result.appliedOperations.reverse()) {
    if (operation.type === 'create_file' || operation.type === 'create_directory') {
      await removeTarget(operation.target)
    }
  }
}
```

### Manual Recovery
```bash
# View what was changed
dev-template status

# Selective rollback
dev-template rollback --files="src/**/*.js"

# Complete reset
dev-template reset --to-plan=abc123
```

## State Management

### Generation State
```json
{
  "planId": "abc123",
  "status": "completed|failed|rolled_back",
  "timestamp": "2024-01-01T00:00:00Z",
  "appliedOperations": 42,
  "backups": ["backup_001.tar.gz"],
  "verification": {
    "passed": true,
    "checks": 15
  }
}
```

### Cache Management
- Content-addressable caching for template files
- Dependency resolution caching
- Plan result caching for identical inputs

## Error Handling & Observability

### Structured Error Taxonomy
```typescript
enum ErrorType {
  VALIDATION_ERROR = 'validation_error',
  CONFLICT_ERROR = 'conflict_error',
  PERMISSION_ERROR = 'permission_error',
  DEPENDENCY_ERROR = 'dependency_error',
  TEMPLATE_ERROR = 'template_error',
  NETWORK_ERROR = 'network_error'
}

interface GenerationError {
  type: ErrorType
  code: string
  message: string
  target?: string
  operation?: Operation
  recoverable: boolean
  suggestions: string[]
}
```

### Event Logging
```json
{
  "timestamp": "2024-01-01T00:00:00Z",
  "level": "info|warn|error",
  "event": "plan_generated|operation_applied|conflict_detected",
  "correlationId": "abc123",
  "details": {
    "operation": "create_file",
    "target": "src/App.js",
    "size": 1024
  }
}
```

## Performance Optimizations

1. **Parallel Execution**: Independent operations run in parallel
2. **Streaming**: Large file operations use streaming to reduce memory usage
3. **Incremental**: Only re-run operations that changed since last run
4. **Caching**: Template compilation and dependency resolution cached

## Security Considerations

1. **Path Traversal Protection**: All paths validated and sandboxed
2. **Permission Validation**: Operations check permissions before execution
3. **Content Validation**: Generated content scanned for malicious patterns
4. **Network Safety**: Template downloads validated with checksums

This pipeline design ensures that DevEnvTemplate can generate projects reliably, safely, and predictably across any technology stack while maintaining high developer confidence through comprehensive validation and rollback capabilities.
