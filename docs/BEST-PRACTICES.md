# Best Practices Guide

This document outlines technology-agnostic best practices for development, derived from real-world development sessions and common mistakes. These practices apply to all projects regardless of framework or language.

## Table of Contents

1. [Encryption Key Generation](#encryption-key-generation)
2. [Environment Variable Management](#environment-variable-management)
3. [Error Handling Patterns](#error-handling-patterns)
4. [Verification Procedures](#verification-procedures)
5. [Cross-Platform Compatibility](#cross-platform-compatibility)

## Encryption Key Generation

### The Problem

Base64 encoding can fail if not done correctly, leading to padding errors and invalid key format issues. This is a common mistake across all frameworks.

### Correct Pattern

**Always use proper base64 encoding with proper padding**:

#### Node.js/TypeScript

```typescript
import * as crypto from 'crypto';

// Generate 32 random bytes (256 bits for AES-256)
const keyBytes = crypto.randomBytes(32);

// Encode to base64 URL-safe with proper padding
const keyB64 = keyBytes.toString('base64')
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=+$/, ''); // Remove padding temporarily

// Add padding back to ensure proper length
const paddingNeeded = (4 - (keyB64.length % 4)) % 4;
const paddedKey = keyB64 + '='.repeat(paddingNeeded);
```

#### Python

```python
import secrets
import base64

# Generate 32 random bytes (256 bits for AES-256)
key_bytes = secrets.token_bytes(32)

# Encode to base64 URL-safe with proper padding
key_b64 = base64.urlsafe_b64encode(key_bytes).decode('utf-8')

# Result: 44 characters with proper padding
print(f"Generated key: {key_b64}")
print(f"Key length: {len(key_b64)} characters")
```

### Using DevEnvTemplate Utilities

DevEnvTemplate provides utilities to prevent these mistakes:

```typescript
import { generateEncryptionKey, validateBase64Key } from './scripts/utils/crypto-helpers';

// Generate a key
const key = generateEncryptionKey(32); // 32 bytes for AES-256

// Validate the key
const validation = validateBase64Key(key, 32);
if (!validation.valid) {
  console.error(validation.error);
}
```

Or use the CLI tool:

```bash
node dist/scripts/tools/generate-key.js --length 32
```

### Verification Pattern

Always verify key format after generation:

```typescript
import { verifyKeyFormat } from './scripts/utils/crypto-helpers';

const key = generateEncryptionKey(32);
if (verifyKeyFormat(key, 32)) {
  console.log('✅ Key format is valid');
} else {
  console.error('❌ Key format is invalid');
}
```

### Common Mistakes to Avoid

**❌ Wrong - Using `secrets.token_urlsafe()` directly**:
```python
# This may not produce proper padding
key = secrets.token_urlsafe(32)  # May be 43 characters, missing padding
```

**❌ Wrong - Manual base64 encoding without padding**:
```python
# Missing proper encoding
key = base64.b64encode(secrets.token_bytes(32)).decode()  # May have wrong padding
```

## Environment Variable Management

### Best Practices

1. **Always use `.env.example`**: Document all required environment variables with placeholder values
2. **Never commit `.env`**: Ensure `.env` is in `.gitignore`
3. **Validate on startup**: Check that all required environment variables are set
4. **Use validation utilities**: Validate format for encryption keys and other structured values

### Using DevEnvTemplate Utilities

```typescript
import { requireEnvVar, requireEncryptionKey } from './scripts/utils/env-validator';

// Simple check
const apiKey = requireEnvVar('API_KEY', {
  hint: 'Set API_KEY in your .env file'
});

// With validation
const encryptionKey = requireEncryptionKey('ENCRYPTION_KEY', 32);
```

### Framework-Specific Patterns

#### Node.js

```typescript
// Use dotenv to load .env file
import dotenv from 'dotenv';
dotenv.config();

// Validate required variables
import { requireEnvVars } from './scripts/utils/env-validator';
const env = requireEnvVars(['API_KEY', 'DATABASE_URL']);
```

#### Python

```python
# Use python-dotenv
from dotenv import load_dotenv
import os

load_dotenv()

# Validate required variables
api_key = os.getenv('API_KEY')
if not api_key:
    raise ValueError('API_KEY is required')
```

### Error Messages

Always provide actionable error messages:

```typescript
import { requireEnvVar } from './scripts/utils/env-validator';

try {
  const key = requireEnvVar('ENCRYPTION_KEY', {
    hint: 'Generate a key using: node dist/scripts/tools/generate-key.js',
    docs: 'docs/BEST-PRACTICES.md#encryption-key-generation'
  });
} catch (error) {
  // Error message includes hint and documentation link
  console.error(error.message);
}
```

## Error Handling Patterns

### Best Practices

1. **Provide context**: Include file paths, line numbers, and relevant context in error messages
2. **Actionable hints**: Tell users what they can do to fix the error
3. **Link to documentation**: Point users to relevant documentation
4. **Categorize errors**: Help users understand the type of error (validation, configuration, runtime)

### Using DevEnvTemplate Utilities

```typescript
import { createActionableError, formatError, wrapError } from './scripts/utils/error-helpers';

// Create actionable error
throw createActionableError(
  'Invalid encryption key format',
  {
    hints: [
      'Key must be 44 characters for a 32-byte key',
      'Key must be base64 URL-safe encoded',
      'Generate a new key using: node dist/scripts/tools/generate-key.js'
    ],
    docs: 'docs/BEST-PRACTICES.md#encryption-key-generation'
  }
);

// Format existing error with context
try {
  JSON.parse(invalidJson);
} catch (error) {
  throw wrapError(error as Error, {
    file: 'package.json',
    hint: 'Check JSON syntax using a JSON validator',
    docs: 'docs/TROUBLESHOOTING.md#json-parsing-errors'
  });
}
```

### JSON Parsing Errors

Always provide helpful context for JSON parsing errors:

```typescript
import { createJsonParseError } from './scripts/utils/error-helpers';

try {
  JSON.parse(content);
} catch (error) {
  throw createJsonParseError(error as Error, 'package.json');
  // Error includes:
  // - File path
  // - Hints for common JSON errors
  // - Link to troubleshooting guide
}
```

## Verification Procedures

### Pre-Commit Verification

Before committing code, verify:

- Code formatting is consistent
- Linting passes
- Type checking passes
- No sensitive data is committed
- `.env.example` is up to date
- `.gitignore` includes `.env`

### Pre-Deployment Verification

Before deploying, verify:

- All required environment variables are set
- Encryption keys have valid format
- No hardcoded secrets in code
- Security checks pass
- Tests pass

### Using DevEnvTemplate Utilities

```typescript
import { verifyPreCommit, verifyPreDeployment } from './scripts/utils/verification';

// Pre-commit checks
const preCommitResult = await verifyPreCommit(projectRoot);
if (!preCommitResult.passed) {
  console.error('Pre-commit checks failed:', preCommitResult.errors);
  process.exit(1);
}

// Pre-deployment checks
const preDeployResult = await verifyPreDeployment(projectRoot);
if (!preDeployResult.passed) {
  console.error('Pre-deployment checks failed:', preDeployResult.errors);
  process.exit(1);
}
```

## Cross-Platform Compatibility

### Shell Compatibility

Different shells use different command separators:

- **Bash/Linux/macOS**: Use `&&` for command chaining
- **PowerShell/Windows**: Use `;` for command chaining

### Using DevEnvTemplate Utilities

```typescript
import { formatCommand, getShellExample, detectShell } from './scripts/utils/shell-helpers';

// Auto-detect shell and format command
const commands = ['cd /path', 'npm run build'];
const formatted = formatCommand(commands); // Uses detected shell

// Get shell-specific example
const bashExample = 'cd /path && npm run build';
const psExample = getShellExample(bashExample); // Converts to PowerShell syntax

// Detect shell
const shell = detectShell();
if (shell === 'powershell') {
  // Use PowerShell-specific syntax
}
```

### Documentation Examples

Always provide examples for both shells:

```markdown
**Bash/Linux:**
```bash
cd /path && npm run build
```

**PowerShell:**
```powershell
cd C:\path; npm run build
```
```

## Summary

These best practices help prevent common mistakes and improve developer experience:

1. **Use utilities**: Leverage DevEnvTemplate utilities for encryption keys, environment variables, and error handling
2. **Validate early**: Check environment variables and key formats at startup
3. **Provide context**: Include helpful hints and documentation links in error messages
4. **Verify before commit/deploy**: Run verification checks before committing or deploying
5. **Cross-platform**: Consider shell compatibility when writing documentation or scripts

For more information, see:
- [Troubleshooting Guide](TROUBLESHOOTING.md)
- [Usage Guide](USAGE.md)
- [LLM Context Guide](LLM-CONTEXT-GUIDE.md)

