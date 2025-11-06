# LLM Contracts Specification

## Overview

LLM Contracts define the structured interface for interacting with Large Language Models within DevEnvTemplate. They ensure deterministic, safe, and reliable LLM operations through JSON Schema validation, retry mechanisms, guardrails, and reproducible seeding.

## Design Principles

### Deterministic & Reproducible
- **Seeded generation**: All LLM calls use deterministic seeds for reproducibility
- **Structured I/O**: JSON Schema enforces consistent input/output formats
- **Versioned prompts**: Prompts are versioned and tested for consistency

### Safe & Controlled
- **Guardrails**: Content filters and safety checks prevent harmful outputs
- **Retry logic**: Intelligent retry with backoff for transient failures
- **Fallbacks**: Graceful degradation when LLM services are unavailable

### Observable & Auditable
- **Request tracing**: All LLM interactions are logged with correlation IDs
- **Cost tracking**: Token usage and cost monitoring
- **Performance metrics**: Response times and success rates

## Contract Structure

### Base Contract Interface

```typescript
interface LLMContract {
  id: string
  version: string
  description: string
  inputSchema: JSONSchema
  outputSchema: JSONSchema
  promptTemplate: PromptTemplate
  guardrails: GuardrailRules
  retryPolicy: RetryPolicy
  seedingStrategy: SeedingStrategy
}
```

### Input/Output Schemas

**Input Schema Example:**
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "requirements": {
      "type": "object",
      "properties": {
        "productType": { "enum": ["Web Application", "API/Microservices"] },
        "coreFeatures": { "type": "array", "items": { "type": "string" } },
        "preferredStack": { "enum": ["Node.js", "Python", "Go"] }
      },
      "required": ["productType", "preferredStack"]
    },
    "context": {
      "type": "object",
      "properties": {
        "existingFiles": { "type": "array", "items": { "type": "string" } },
        "technologyConstraints": { "type": "object" }
      }
    }
  },
  "required": ["requirements"]
}
```

**Output Schema Example:**
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "code": {
      "type": "object",
      "patternProperties": {
        ".*": { "type": "string" }
      }
    },
    "explanation": { "type": "string" },
    "confidence": { "type": "number", "minimum": 0, "maximum": 1 },
    "alternatives": {
      "type": "array",
      "items": { "type": "object" }
    }
  },
  "required": ["code", "explanation", "confidence"]
}
```

## Prompt Engineering

### Template System

**Prompt Template Structure:**
```json
{
  "template": "Generate {{language}} code for {{feature}} in {{framework}}.\n\nRequirements:\n{{requirements}}\n\nContext:\n{{context}}\n\nGuidelines:\n{{guidelines}}\n\nOutput format: {{output_format}}",
  "variables": {
    "language": "inferred from stack",
    "feature": "from requirements",
    "framework": "from stack mapping",
    "requirements": "serialized JSON",
    "context": "project context",
    "guidelines": "coding standards",
    "output_format": "JSON schema reference"
  },
  "examples": [
    {
      "input": { "language": "TypeScript", "feature": "authentication" },
      "output": { "code": { "auth.ts": "..." }, "explanation": "..." }
    }
  ]
}
```

### Context Injection

**Context Sources:**
- Project requirements and manifest
- Existing codebase analysis
- Technology stack constraints
- Organizational coding standards
- Previous successful generations

## Seeding Strategy

### Deterministic Seeds

**Seed Generation:**
```typescript
function generateDeterministicSeed(contractId: string, input: any, context: any): string {
  const components = [
    contractId,
    contractVersion,
    hashInput(input),
    hashContext(context),
    timestampBucket() // Daily rotation for freshness
  ]

  return hashComponents(components)
}

// Seed components ensure reproducibility
function hashInput(input: any): string {
  return crypto.createHash('sha256')
    .update(JSON.stringify(sortKeys(input)))
    .digest('hex')
    .substring(0, 16)
}
```

**Seed Usage:**
```typescript
const seed = generateDeterministicSeed(contract.id, input, context)

const llmRequest = {
  messages: buildMessages(promptTemplate, input),
  temperature: 0.1, // Low for determinism
  seed: parseInt(seed, 16), // Convert to number
  max_tokens: contract.maxTokens
}
```

### Seed Rotation

**Rotation Strategy:**
- **Daily rotation**: Seeds change daily for freshness while maintaining reproducibility within day
- **Input-sensitive**: Same inputs always produce same seeds
- **Version-aware**: Contract version changes invalidate previous seeds

## Retry & Error Handling

### Retry Policy

```typescript
interface RetryPolicy {
  maxAttempts: number          // Default: 3
  baseDelay: number           // Base delay in ms, Default: 1000
  maxDelay: number            // Max delay in ms, Default: 30000
  backoffMultiplier: number   // Default: 2
  retryableErrors: string[]   // Error types to retry
  nonRetryableErrors: string[] // Error types to fail immediately
}
```

### Error Classification

```typescript
enum LLMErrorType {
  NETWORK_ERROR = 'network_error',
  RATE_LIMIT = 'rate_limit',
  CONTENT_FILTER = 'content_filter',
  INVALID_RESPONSE = 'invalid_response',
  TIMEOUT = 'timeout',
  QUOTA_EXCEEDED = 'quota_exceeded',
  MODEL_ERROR = 'model_error'
}

interface LLMError {
  type: LLMErrorType
  message: string
  retryable: boolean
  context: {
    contractId: string
    attemptNumber: number
    inputHash: string
  }
}
```

### Retry Logic

```typescript
async function executeWithRetry<T>(
  contract: LLMContract,
  input: any,
  executeFn: (input: any, seed: string) => Promise<T>
): Promise<T> {
  let lastError: LLMError | null = null

  for (let attempt = 1; attempt <= contract.retryPolicy.maxAttempts; attempt++) {
    try {
      const seed = generateSeed(contract.id, input, attempt)
      const result = await executeFn(input, seed)

      // Validate output against schema
      validateOutput(contract.outputSchema, result)

      return result
    } catch (error) {
      lastError = classifyError(error)

      if (!isRetryable(lastError, contract.retryPolicy)) {
        break
      }

      if (attempt < contract.retryPolicy.maxAttempts) {
        const delay = calculateDelay(attempt, contract.retryPolicy)
        await sleep(delay)
      }
    }
  }

  throw new LLMError(`Failed after ${contract.retryPolicy.maxAttempts} attempts`, {
    cause: lastError
  })
}
```

## Guardrails

### Content Guardrails

```typescript
interface GuardrailRules {
  inputFilters: ContentFilter[]
  outputFilters: ContentFilter[]
  safetyChecks: SafetyCheck[]
  rateLimits: RateLimit[]
}

interface ContentFilter {
  type: 'keyword' | 'pattern' | 'semantic'
  rules: FilterRule[]
  action: 'block' | 'warn' | 'sanitize'
}

interface FilterRule {
  pattern?: string
  keywords?: string[]
  severity: 'low' | 'medium' | 'high'
  message: string
}
```

### Safety Checks

**Input Safety:**
```json
{
  "inputFilters": [
    {
      "type": "keyword",
      "rules": [
        {
          "keywords": ["password", "secret", "key", "token"],
          "severity": "high",
          "message": "Potential credential exposure in prompt"
        }
      ],
      "action": "block"
    }
  ]
}
```

**Output Safety:**
```json
{
  "outputFilters": [
    {
      "type": "pattern",
      "rules": [
        {
          "pattern": "password\\s*=\\s*['\"][^'\"]+['\"]",
          "severity": "high",
          "message": "Generated code contains hardcoded password"
        }
      ],
      "action": "sanitize"
    }
  ]
}
```

### Rate Limiting

```typescript
interface RateLimit {
  window: 'minute' | 'hour' | 'day'
  limit: number
  burstLimit?: number
  scope: 'user' | 'organization' | 'global'
}
```

## Contract Registry

### Contract Discovery

```json
{
  "contracts": {
    "code-generation": {
      "v1": {
        "id": "code-generation",
        "version": "1.0.0",
        "endpoint": "/contracts/code-generation/v1",
        "capabilities": ["typescript", "python", "go"],
        "costEstimate": { "usdPerRequest": 0.02 }
      }
    },
    "documentation": {
      "v1": {
        "id": "documentation",
        "version": "1.0.0",
        "endpoint": "/contracts/documentation/v1",
        "capabilities": ["readme", "api-docs"],
        "costEstimate": { "usdPerRequest": 0.01 }
      }
    }
  }
}
```

### Version Compatibility

- **Backward compatible**: New contract versions maintain input compatibility
- **Migration path**: Breaking changes provide migration utilities
- **Deprecation period**: Contracts deprecated with 6-month migration window

## Observability

### Request Tracing

```json
{
  "trace": {
    "correlationId": "abc-123-def",
    "contractId": "code-generation",
    "version": "1.0.0",
    "timestamp": "2024-01-01T00:00:00Z",
    "input": {
      "hash": "sha256:...",
      "size": 1024
    },
    "seed": "deterministic-seed-123",
    "attempts": [
      {
        "number": 1,
        "duration": 2500,
        "tokens": { "prompt": 500, "completion": 200 },
        "cost": 0.015,
        "success": true
      }
    ]
  }
}
```

### Metrics Collection

**Performance Metrics:**
- Response time percentiles (p50, p95, p99)
- Success/failure rates by contract
- Token usage distribution
- Cost per operation

**Quality Metrics:**
- Output schema validation pass rate
- Guardrail trigger frequency
- Retry attempt distribution
- User satisfaction scores

## Implementation Examples

### Contract Execution

```typescript
async function generateCode(requirements: ProjectRequirements): Promise<CodeGenerationResult> {
  const contract = await loadContract('code-generation', 'v1')

  // Validate input
  validateInput(contract.inputSchema, { requirements })

  // Execute with retry and guardrails
  const result = await executeContract(contract, { requirements })

  // Log for observability
  logContractExecution(contract, result)

  return result
}
```

### Fallback Strategy

```typescript
async function executeWithFallback(
  primaryContract: LLMContract,
  fallbackContract: LLMContract,
  input: any
): Promise<any> {
  try {
    return await executeContract(primaryContract, input)
  } catch (error) {
    logger.warn('Primary contract failed, trying fallback', { error })

    // Simplify input for fallback
    const simplifiedInput = simplifyForFallback(input)

    return await executeContract(fallbackContract, simplifiedInput)
  }
}
```

### Testing Contracts

```typescript
describe('Code Generation Contract', () => {
  it('should generate valid TypeScript code', async () => {
    const input = { requirements: validRequirements }
    const result = await executeContract(contract, input)

    expect(validateOutput(contract.outputSchema, result)).toBe(true)
    expect(result.code).toContain('export')
  })

  it('should be deterministic with same seed', async () => {
    const input = { requirements: testRequirements }
    const result1 = await executeContract(contract, input)
    const result2 = await executeContract(contract, input)

    expect(result1.code).toEqual(result2.code)
  })
})
```

This specification ensures that LLM interactions are reliable, safe, and reproducible while providing comprehensive observability and error handling.
