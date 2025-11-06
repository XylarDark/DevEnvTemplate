# Cleanup Rules DSL

## Overview

The Cleanup Rules DSL provides a safe, declarative way to remove template-generated code that is no longer needed based on project requirements. It ensures that cleanup operations are composable, testable, and safe to run multiple times.

## Design Principles

### Safety First
- **No destructive operations without validation**: Every rule validates its preconditions
- **Atomic operations**: Each rule either succeeds completely or fails without side effects
- **Rollback capability**: Failed rules can be rolled back to previous state
- **Dry-run support**: All rules support dry-run mode for preview

### Composable & Declarative
- **Rule composition**: Rules can reference other rules' outputs
- **Conditional execution**: Rules run only when their conditions are met
- **Priority ordering**: Rules execute in dependency order
- **Idempotent**: Running the same rules multiple times is safe

### Testable & Verifiable
- **Rule invariants**: Each rule defines what must be true before/after execution
- **Test fixtures**: Standardized test scenarios for rule validation
- **Property-based testing**: Rules tested against generated edge cases

## DSL Structure

### Rule Definition

```json
{
  "schema": "https://devenv-template.dev/schema/v1/cleanup-rule.json",
  "id": "remove-unused-component",
  "description": "Remove unused React component and its imports",
  "version": "1.0.0",
  "priority": 100,
  "conditions": {
    "feature_not_selected": "Web UI (Frontend)",
    "file_exists": "src/components/Example.tsx"
  },
  "operations": [
    {
      "type": "delete_file",
      "target": "src/components/Example.tsx"
    },
    {
      "type": "remove_import",
      "file": "src/App.tsx",
      "import": "Example"
    }
  ],
  "invariants": {
    "pre": [
      "file_exists(src/components/Example.tsx)",
      "import_exists(src/App.tsx, Example)"
    ],
    "post": [
      "!file_exists(src/components/Example.tsx)",
      "!import_exists(src/App.tsx, Example)"
    ]
  },
  "rollback": [
    {
      "type": "restore_backup",
      "source": "backups/pre-cleanup.tar.gz"
    }
  ]
}
```

### Rule Set Collection

```json
{
  "schema": "https://devenv-template.dev/schema/v1/cleanup-ruleset.json",
  "name": "react-spa-cleanup",
  "description": "Cleanup rules for React SPA template",
  "version": "1.0.0",
  "rules": [
    "remove-unused-component",
    "remove-auth-code",
    "remove-api-code",
    "remove-docker-setup"
  ],
  "dependencies": {
    "remove-unused-component": ["remove-auth-code"],
    "remove-api-code": []
  },
  "test_fixtures": [
    "basic-cleanup",
    "partial-features",
    "full-features"
  ]
}
```

## Condition Types

### Feature-Based Conditions

```json
{
  "feature_selected": "Authentication/Authorization",
  "feature_not_selected": "Web UI (Frontend)",
  "stack_is": "Node.js",
  "deployment_target": "Docker Containers"
}
```

### File System Conditions

```json
{
  "file_exists": "src/components/Button.tsx",
  "file_not_exists": "src/auth/Login.tsx",
  "directory_exists": "src/components",
  "directory_empty": "src/utils",
  "file_contains": {
    "file": "package.json",
    "pattern": "react"
  },
  "file_not_contains": {
    "file": "src/App.tsx",
    "pattern": "AuthProvider"
  }
}
```

### Content-Based Conditions

```json
{
  "import_exists": {
    "file": "src/App.tsx",
    "import": "AuthContext"
  },
  "function_called": {
    "file": "src/App.tsx",
    "function": "useAuth"
  },
  "class_extends": {
    "file": "src/models/User.ts",
    "class": "BaseModel"
  }
}
```

### Dependency Conditions

```json
{
  "dependency_installed": "react-router-dom",
  "dev_dependency_installed": "@types/react",
  "script_defined": "build",
  "environment_variable_set": "NODE_ENV"
}
```

## Operation Types

### File System Operations

```json
{
  "type": "delete_file",
  "target": "src/components/Example.tsx",
  "backup": true
},
{
  "type": "delete_directory",
  "target": "src/auth",
  "recursive": true,
  "backup": true
},
{
  "type": "move_file",
  "source": "src/old-name.tsx",
  "target": "src/new-name.tsx"
}
```

### Content Modification Operations

```json
{
  "type": "remove_import",
  "file": "src/App.tsx",
  "import": "ExampleComponent"
},
{
  "type": "remove_function_call",
  "file": "src/App.tsx",
  "function": "initAuth"
},
{
  "type": "replace_content",
  "file": "src/config.ts",
  "pattern": "AUTH_ENABLED = true",
  "replacement": "AUTH_ENABLED = false"
}
```

### Dependency Operations

```json
{
  "type": "remove_dependency",
  "package": "react-router-dom",
  "update_package_json": true
},
{
  "type": "remove_script",
  "script": "auth:setup",
  "update_package_json": true
}
```

### Structural Operations

```json
{
  "type": "flatten_directory",
  "source": "src/components/auth",
  "target": "src/components"
},
{
  "type": "merge_files",
  "sources": ["src/auth/config.ts", "src/auth/types.ts"],
  "target": "src/auth/index.ts",
  "separator": "\n\n// Types\nexport * from './types'"
}
```

## Invariants & Validation

### Pre/Post Conditions

```typescript
interface Invariant {
  condition: string    // Expression to evaluate
  description: string  // Human-readable description
  severity: 'error' | 'warning'
}

const rule: CleanupRule = {
  invariants: {
    pre: [
      {
        condition: "file_exists('src/components/Example.tsx')",
        description: "Example component must exist before removal",
        severity: 'error'
      },
      {
        condition: "import_exists('src/App.tsx', 'Example')",
        description: "Example import must exist in App.tsx",
        severity: 'warning'
      }
    ],
    post: [
      {
        condition: "!file_exists('src/components/Example.tsx')",
        description: "Example component must be removed",
        severity: 'error'
      }
    ]
  }
}
```

### Invariant Evaluation

```typescript
async function evaluateInvariant(invariant: Invariant, context: CleanupContext): Promise<boolean> {
  // Parse condition expression
  const ast = parseCondition(invariant.condition)

  // Evaluate against filesystem state
  return await evaluateAST(ast, {
    fileSystem: context.fileSystem,
    projectState: context.projectState,
    ruleResults: context.ruleResults
  })
}
```

## Test Fixtures & Scenarios

### Test Fixture Structure

```
test-fixtures/
├── basic-cleanup/
│   ├── input-project/      # Initial project state
│   ├── requirements.json   # Project requirements (what to keep)
│   ├── expected-output/    # Expected state after cleanup
│   └── invariants.json     # Additional test assertions
├── partial-features/
│   └── ...
└── edge-cases/
    ├── empty-project/
    ├── already-clean/
    └── conflicting-rules/
```

### Test Scenario Definition

```json
{
  "name": "basic-cleanup",
  "description": "Remove unused components when Web UI is not selected",
  "requirements": {
    "coreFeatures": ["Database Integration"],
    "preferredStack": "Node.js"
  },
  "initial_state": {
    "files": {
      "src/components/Button.tsx": "// Button component",
      "src/components/AuthForm.tsx": "// Auth form component",
      "src/App.tsx": "import Button from './components/Button'"
    }
  },
  "expected_state": {
    "files_removed": ["src/components/AuthForm.tsx"],
    "files_modified": {
      "src/App.tsx": {
        "content_not_contains": "import.*AuthForm"
      }
    }
  },
  "invariants": [
    "no_syntax_errors",
    "project_builds_successfully",
    "no_orphaned_imports"
  ]
}
```

### Property-Based Testing

```typescript
// Generate test cases with edge conditions
function* generateEdgeCases(): Generator<TestCase> {
  // Empty project
  yield { requirements: {}, initialFiles: {} }

  // Already clean project
  yield { requirements: { coreFeatures: [] }, initialFiles: { 'src/app.js': 'console.log("hello")' } }

  // Conflicting rules
  yield {
    requirements: { coreFeatures: ['auth', 'no-auth'] },
    initialFiles: { /* files that trigger conflicting cleanup rules */ }
  }

  // Large project with many files
  yield {
    requirements: { coreFeatures: ['all'] },
    initialFiles: generateLargeFileSet(1000)
  }
}
```

## Rule Execution Engine

### Execution Pipeline

```typescript
async function executeCleanupRules(rules: CleanupRule[], context: CleanupContext): Promise<ExecutionResult> {
  // 1. Validate all rules
  const validation = await validateRules(rules, context)
  if (!validation.valid) {
    throw new ValidationError(validation.errors)
  }

  // 2. Build dependency graph
  const graph = buildDependencyGraph(rules)

  // 3. Execute rules in topological order
  const results: RuleResult[] = []
  const executedRules = new Set<string>()

  for (const ruleId of topologicalSort(graph)) {
    const rule = rules.find(r => r.id === ruleId)
    if (!rule) continue

    // Check if rule should execute
    if (await shouldExecuteRule(rule, context, executedRules)) {
      const result = await executeRule(rule, context)
      results.push(result)

      if (result.success) {
        executedRules.add(ruleId)
      } else if (!rule.continueOnFailure) {
        break // Stop execution on rule failure
      }
    }
  }

  // 4. Validate final state
  const finalValidation = await validateFinalState(rules, context)

  return {
    success: results.every(r => r.success),
    results,
    finalValidation
  }
}
```

### Rule Execution Context

```typescript
interface CleanupContext {
  projectRoot: string
  requirements: ProjectRequirements
  fileSystem: FileSystemAPI
  backups: BackupManager
  logger: Logger
  dryRun: boolean
  ruleResults: Map<string, RuleResult>
}

interface RuleResult {
  ruleId: string
  success: boolean
  executedOperations: Operation[]
  errors: Error[]
  duration: number
  backups: BackupRecord[]
}
```

## Safety Mechanisms

### Pre-Execution Validation

1. **Rule Conflicts**: Detect rules that operate on the same files
2. **Dependency Cycles**: Ensure no circular dependencies between rules
3. **Permission Checks**: Verify write permissions on target files/directories
4. **Backup Space**: Ensure sufficient space for backups

### Execution Safety

1. **Atomic Operations**: Each operation either succeeds or fails completely
2. **Backup Creation**: Automatic backups before destructive operations
3. **Rollback Support**: Failed executions can be rolled back
4. **Timeout Protection**: Rules have execution time limits

### Post-Execution Validation

1. **Invariant Checking**: Verify all post-conditions are met
2. **Syntax Validation**: Ensure modified files remain syntactically correct
3. **Dependency Resolution**: Check that dependencies are still satisfiable
4. **Build Verification**: Ensure project still builds after cleanup

## Error Handling & Recovery

### Error Classification

```typescript
enum CleanupErrorType {
  VALIDATION_ERROR = 'validation_error',
  EXECUTION_ERROR = 'execution_error',
  INVARIANT_VIOLATION = 'invariant_violation',
  DEPENDENCY_ERROR = 'dependency_error',
  PERMISSION_ERROR = 'permission_error'
}

interface CleanupError {
  type: CleanupErrorType
  ruleId?: string
  message: string
  recoverable: boolean
  suggestions: string[]
  context: {
    operation?: Operation
    file?: string
    line?: number
  }
}
```

### Recovery Strategies

1. **Automatic Retry**: Retry failed operations with backoff
2. **Partial Rollback**: Rollback only failed rules, keep successful ones
3. **Manual Intervention**: Provide clear instructions for manual fixes
4. **Alternative Rules**: Suggest alternative approaches when rules fail

## Integration with Generation Pipeline

### Cleanup During Generation

```typescript
// Integrated cleanup in generation pipeline
async function generateWithCleanup(requirements, templatePack): Promise<GenerationResult> {
  // 1. Generate initial project
  const generationResult = await generateProject(requirements, templatePack)

  // 2. Apply cleanup rules
  const cleanupResult = await applyCleanupRules(requirements, generationResult.destination)

  // 3. Verify final state
  const verification = await verifyFinalProject(generationResult, cleanupResult)

  return {
    ...generationResult,
    cleanup: cleanupResult,
    verification
  }
}
```

### Cleanup as Separate Phase

```bash
# Generate project
dev-template generate manifest.json

# Apply cleanup
dev-template cleanup manifest.json

# Verify result
dev-template verify
```

This DSL provides a robust, safe, and testable foundation for cleaning up template-generated code while maintaining project integrity and developer confidence.
