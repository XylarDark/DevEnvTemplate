# Policy Gates Specification

## Overview

Policy Gates are technology-agnostic validation and enforcement mechanisms that ensure generated projects meet organizational standards for security, compliance, licensing, and resource constraints. They operate at multiple stages of the DevEnvTemplate pipeline to provide defense-in-depth protection.

## Design Principles

### Technology-Agnostic
- **No provider assumptions**: Policy gates work across any technology stack
- **Configurable thresholds**: Adjustable limits based on organizational policies
- **Extensible framework**: New policy types can be added without core changes

### Defense-in-Depth
- **Multiple enforcement points**: Validation at generation, application, and verification stages
- **Fail-safe defaults**: Conservative defaults that can be relaxed with explicit configuration
- **Audit trail**: All policy decisions are logged with reasoning

### Configurable & Auditable
- **Policy as code**: Policies are defined declaratively and versioned
- **Override mechanisms**: Explicit opt-in for policy violations with audit trail
- **Reporting**: Detailed reports on policy compliance status

## Policy Gate Types

### 1. License Compliance Gate

**Purpose**: Ensure generated projects only use acceptable open source licenses.

**Configuration:**
```json
{
  "type": "license_compliance",
  "enabled": true,
  "severity": "error",
  "config": {
    "allowed_licenses": [
      "MIT",
      "Apache-2.0",
      "BSD-3-Clause",
      "ISC"
    ],
    "blocked_licenses": [
      "GPL-3.0",
      "LGPL-2.1",
      "AGPL-3.0"
    ],
    "allow_unknown": false,
    "license_sources": ["package_json", "license_files", "readme"]
  },
  "overrides": {
    "exceptions": [
      {
        "package": "critical-security-lib",
        "license": "GPL-3.0",
        "approved_by": "security-team",
        "review_date": "2024-01-01",
        "rationale": "Critical security dependency with no alternative"
      }
    ]
  }
}
```

**Validation Checks:**
- Package license declarations
- License file contents
- README license references
- SPDX license expressions
- License compatibility analysis

### 2. Security Vulnerability Gate

**Purpose**: Prevent inclusion of packages with known security vulnerabilities.

**Configuration:**
```json
{
  "type": "security_vulnerability",
  "enabled": true,
  "severity": "error",
  "config": {
    "max_cvss_score": 7.0,
    "block_critical": true,
    "block_high": true,
    "allow_with_mitigation": true,
    "vulnerability_sources": ["npm_audit", "snyk", "owasp"],
    "grace_period_days": 30
  },
  "overrides": {
    "accepted_risks": [
      {
        "cve": "CVE-2023-12345",
        "package": "legacy-lib",
        "severity": "high",
        "mitigation": "Isolated usage, no external input",
        "approved_by": "security-team",
        "review_date": "2024-01-01"
      }
    ]
  }
}
```

**Validation Checks:**
- Known vulnerability databases
- CVSS score thresholds
- Vulnerability age and patching status
- Dependency chain analysis

### 3. Secrets Detection Gate

**Purpose**: Prevent accidental inclusion of secrets, credentials, or sensitive data.

**Configuration:**
```json
{
  "type": "secrets_detection",
  "enabled": true,
  "severity": "error",
  "config": {
    "scan_patterns": [
      "password",
      "secret",
      "key",
      "token",
      "credential"
    ],
    "entropy_threshold": 4.5,
    "max_secret_length": 100,
    "exclude_paths": [
      "node_modules/**",
      ".git/**",
      "test/fixtures/**"
    ],
    "allowed_patterns": [
      "example_password",
      "test_token_123"
    ]
  }
}
```

**Validation Checks:**
- Pattern-based secret detection
- Entropy analysis for random-looking strings
- File type specific scanning
- Path-based exclusions

### 4. Bundle Size Gate

**Purpose**: Enforce resource usage limits to prevent bloated applications.

**Configuration:**
```json
{
  "type": "bundle_size",
  "enabled": true,
  "severity": "warning",
  "config": {
    "max_bundle_size": "2MB",
    "max_initial_js": "500KB",
    "max_initial_css": "100KB",
    "compression": "gzip",
    "thresholds": {
      "warning": "1.5MB",
      "error": "2MB"
    },
    "exclusions": [
      "vendor.*",
      "polyfill.*"
    ]
  }
}
```

**Validation Checks:**
- Compressed bundle sizes
- Asset type breakdown
- Tree-shaking effectiveness
- Code splitting analysis

### 5. Dependency Count Gate

**Purpose**: Prevent dependency sprawl and maintenance overhead.

**Configuration:**
```json
{
  "type": "dependency_count",
  "enabled": true,
  "severity": "warning",
  "config": {
    "max_dependencies": 50,
    "max_dev_dependencies": 30,
    "max_transitive_depth": 5,
    "blocked_packages": [
      "left-pad",
      "is-odd"
    ],
    "preferred_packages": {
      "lodash": "lodash-es",
      "moment": "dayjs"
    }
  }
}
```

**Validation Checks:**
- Direct dependency counts
- Transitive dependency analysis
- Deprecated package detection
- Preferred alternative suggestions

### 6. Code Quality Gate

**Purpose**: Enforce minimum code quality standards.

**Configuration:**
```json
{
  "type": "code_quality",
  "enabled": true,
  "severity": "warning",
  "config": {
    "min_test_coverage": 80,
    "max_complexity": 10,
    "max_file_length": 300,
    "require_typescript": true,
    "lint_rules": {
      "no_console": "error",
      "no_debugger": "error",
      "prefer_const": "error"
    }
  }
}
```

**Validation Checks:**
- Static analysis results
- Test coverage metrics
- Cyclomatic complexity
- Code style compliance

## Policy Gate Framework

### Gate Interface

```typescript
interface PolicyGate {
  id: string
  type: PolicyGateType
  name: string
  description: string
  version: string
  enabled: boolean
  severity: 'info' | 'warning' | 'error'
  config: Record<string, any>
  overrides?: OverrideRules
}

interface PolicyCheck {
  gateId: string
  target: string
  status: 'passed' | 'failed' | 'warning' | 'overridden'
  message: string
  details?: any
  timestamp: string
  override?: OverrideRecord
}

interface OverrideRecord {
  approved_by: string
  review_date: string
  rationale: string
  expires_at?: string
}
```

### Execution Pipeline

```typescript
async function executePolicyGates(
  gates: PolicyGate[],
  context: PolicyContext,
  stage: PolicyStage
): Promise<PolicyResult> {
  const results: PolicyCheck[] = []

  for (const gate of gates) {
    if (!gate.enabled || !isApplicableToStage(gate, stage)) {
      continue
    }

    const check = await executeGate(gate, context)

    // Apply overrides if check failed
    if (check.status === 'failed' && hasOverride(gate, check)) {
      check.status = 'overridden'
      check.override = getOverride(gate, check)
    }

    results.push(check)

    // Fail fast on errors
    if (gate.severity === 'error' && check.status === 'failed') {
      break
    }
  }

  return {
    passed: results.every(r => r.status !== 'failed'),
    checks: results,
    summary: generateSummary(results)
  }
}
```

### Policy Context

```typescript
interface PolicyContext {
  project: {
    requirements: ProjectRequirements
    manifest: ProjectManifest
  }
  generation: {
    templatePack: TemplatePack
    destination: string
    generatedFiles: string[]
  }
  environment: {
    nodeVersion: string
    platform: string
    ci: boolean
  }
  artifacts: {
    packageJson?: any
    lockfile?: any
    bundleStats?: BundleStats
  }
}
```

## Policy Stages

### 1. Pre-Generation Stage

**Executed**: Before any files are generated
**Purpose**: Validate project requirements against policies
**Gates**: License compliance, dependency count limits

### 2. Generation Stage

**Executed**: After files are generated but before application
**Purpose**: Validate generated content
**Gates**: Secrets detection, bundle size estimates

### 3. Post-Generation Stage

**Executed**: After files are applied to filesystem
**Purpose**: Validate final project state
**Gates**: All gates - full validation suite

### 4. CI/CD Integration Stage

**Executed**: During automated builds and deployments
**Purpose**: Continuous policy enforcement
**Gates**: All gates with CI-specific severity levels

## Override Mechanisms

### Override Types

1. **Temporary Overrides**: Time-limited exceptions
2. **Permanent Overrides**: Approved exceptions for specific cases
3. **Conditional Overrides**: Context-dependent exceptions

### Override Approval Workflow

```json
{
  "override_request": {
    "gate_id": "license_compliance",
    "target": "problematic-package",
    "requested_by": "developer@example.com",
    "rationale": "Critical business requirement",
    "evidence": "security_review_2024.pdf",
    "duration": "90 days"
  },
  "approval": {
    "approved_by": "security-lead@example.com",
    "approved_at": "2024-01-01T10:00:00Z",
    "conditions": ["Annual security review required"],
    "expires_at": "2024-04-01T00:00:00Z"
  }
}
```

## Reporting & Monitoring

### Policy Reports

```json
{
  "report_id": "policy_check_2024_001",
  "timestamp": "2024-01-01T00:00:00Z",
  "stage": "post_generation",
  "project": "my-project",
  "summary": {
    "total_checks": 15,
    "passed": 12,
    "warnings": 2,
    "errors": 1,
    "overridden": 1
  },
  "checks": [...],
  "recommendations": [
    "Consider upgrading vulnerable dependencies",
    "Review license compatibility for transitive dependencies"
  ]
}
```

### Metrics & Dashboards

- Policy compliance rates over time
- Most common policy violations
- Override approval workflows
- Policy effectiveness measurements

## Integration Examples

### CLI Integration

```bash
# Check policies without generation
dev-template check-policies manifest.json

# Generate with policy enforcement
dev-template generate --enforce-policies manifest.json

# Override specific policy
dev-template generate --override license_compliance:problematic-package manifest.json
```

### CI/CD Integration

```yaml
- name: Policy Check
  run: npm run policy-check

- name: Generate Project
  run: npm run generate -- --enforce-policies
  env:
    POLICY_SEVERITY: error
```

### Website Integration

```typescript
// Policy check before generation
const policyResult = await checkPolicies(requirements, templatePack)
if (!policyResult.passed) {
  showPolicyViolations(policyResult.checks)
  return
}

// Generate with policy context
await generateProject(requirements, {
  policyOverrides: userOverrides,
  policyContext: policyResult.context
})
```

This specification provides a comprehensive, technology-agnostic framework for enforcing organizational policies while maintaining flexibility and auditability.
