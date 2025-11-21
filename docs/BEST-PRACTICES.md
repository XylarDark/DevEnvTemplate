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
import { runCommand, chainCommands, detectShell } from './scripts/utils/shell-helper';

// Auto-detect shell and execute command
const shell = detectShell();
const command = chainCommands(['cd /path', 'npm run build'], shell);
runCommand(command);

// Detect shell and adapt
if (detectShell() === 'powershell') {
  // Use PowerShell-specific syntax
  runCommand('Set-Location C:\\path; npm run build', { shell: 'powershell' });
} else {
  // Use bash syntax
  runCommand('cd /path && npm run build', { shell: 'bash' });
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
Set-Location C:\path; npm run build
```
```

### Project Root Detection

When DevEnvTemplate is embedded in `.devenv/`, it automatically detects the parent project root:

```typescript
import { resolveProjectRoot } from './scripts/utils/path-resolver';

// Auto-detect project root
const projectRoot = resolveProjectRoot();
// Returns parent directory if running from .devenv/
// Otherwise returns current directory or walks up to find root markers
```

**Root markers** (checked in order):
- `package.json` (Node.js projects)
- `pyproject.toml` (Python projects)
- `.git` (Git repositories)
- `Cargo.toml` (Rust projects)
- `go.mod` (Go projects)

### Embedded Usage Pattern

```typescript
// scripts/doctor/cli.ts
import { resolveProjectRoot } from '../utils/path-resolver';

const { projectRoot, autoDetected } = await resolveProjectRoot(
  process.cwd(),
  options.projectRoot || process.env.DEVENV_PROJECT_ROOT
);

if (autoDetected) {
  console.log(`Detected embedded mode. Analyzing: ${projectRoot}`);
}
```

## Python-Specific Best Practices

### The Problem

Python projects often suffer from import errors, path resolution issues, and cross-platform compatibility problems. Common mistakes include using `sys.path` hacks, hardcoded paths, and improper package installation.

### Import Patterns

**Never use sys.path hacks**:

```python
# ❌ Wrong - sys.path hack
import sys
from pathlib import Path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))
from my_package import something

# ✅ Correct - proper package installation
# Install package: pip install -e .
from my_package import something
```

**Use absolute imports from installed package**:

```python
# ❌ Wrong - relative import in script
from ..core import config

# ✅ Correct - absolute import
from my_package.core import config
```

**Follow PEP 8 import ordering**:

```python
# Standard library
import os
import sys
from pathlib import Path
from typing import Optional, Dict

# Third-party
import numpy as np
import pandas as pd

# Local application
from my_package.core import config
from my_package.utils import helpers
```

### Path Resolution

**Always use pathlib.Path for cross-platform paths**:

```python
# ❌ Wrong - os.path (works but less modern)
import os
data_dir = os.path.join(base_dir, 'data', 'results.json')

# ✅ Correct - pathlib.Path
from pathlib import Path
data_dir = Path(base_dir) / 'data' / 'results.json'
```

**Use centralized path resolution utilities**:

```python
# Create utils/path_resolver.py
from pathlib import Path
import sys

def get_project_root() -> Path:
    """Get project root directory."""
    # Try to find project root by looking for pyproject.toml or setup.py
    current = Path(__file__).resolve()
    while current != current.parent:
        if (current / 'pyproject.toml').exists() or (current / 'setup.py').exists():
            return current
        current = current.parent
    # Fallback to current working directory
    return Path.cwd()

def get_data_dir() -> Path:
    """Get data directory."""
    root = get_project_root()
    data_dir = root / 'data'
    data_dir.mkdir(exist_ok=True)
    return data_dir
```

**Never hardcode paths relative to __file__**:

```python
# ❌ Wrong - hardcoded path
config_file = Path(__file__).parent.parent / 'config' / 'settings.yaml'

# ✅ Correct - use resolver
from my_package.utils.path_resolver import get_project_root
config_file = get_project_root() / 'config' / 'settings.yaml'
```

### Package Installation

**Always install package in development mode**:

```bash
# Install package in editable mode
pip install -e .

# Verify installation
python -c "import my_package; print(my_package.__file__)"
```

**Scripts should work when package is installed**:

```python
#!/usr/bin/env python3
"""
Script that works when package is installed.
"""

# ✅ Correct - import from installed package
from my_package import main_function
from my_package.utils.path_resolver import get_data_dir

def main():
    data_dir = get_data_dir()
    # Use data_dir...

if __name__ == "__main__":
    main()
```

### Virtual Environment Management

**Always use virtual environments**:

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Activate (Linux/macOS)
source venv/bin/activate

# Install dependencies
pip install -e .
```

**Document virtual environment setup**:

```markdown
## Development Setup

1. Create virtual environment:
   ```bash
   python -m venv venv
   ```

2. Activate virtual environment:
   - Windows PowerShell: `.\venv\Scripts\Activate.ps1`
   - Linux/macOS: `source venv/bin/activate`

3. Install package:
   ```bash
   pip install -e .
   ```
```

### Testing Patterns

**Tests should not modify sys.path**:

```python
# ❌ Wrong - sys.path hack in test
import sys
sys.path.insert(0, '../')

# ✅ Correct - package should be installed
from my_package.core import config
```

**Use pytest for better features**:

```python
# tests/test_example.py
import pytest
from my_package.core import config

def test_config_loading():
    assert config.DEFAULT_VALUE == 42
```

### Script Organization

**Entry point patterns**:

```python
#!/usr/bin/env python3
"""
Script entry point that works in both development and installed modes.
"""

# Check if package is installed
try:
    from my_package import main_function
    from my_package.utils.path_resolver import get_project_root
except ImportError:
    print("Error: Package not installed. Run: pip install -e .")
    sys.exit(1)

def main():
    project_root = get_project_root()
    # Use project_root...

if __name__ == "__main__":
    main()
```

### Common Mistakes to Avoid

**❌ Wrong - sys.path hacks**:
```python
sys.path.insert(0, str(Path(__file__).parent.parent))
```

**❌ Wrong - hardcoded paths**:
```python
data_file = '../data/results.json'
```

**❌ Wrong - os.path instead of pathlib**:
```python
import os
path = os.path.join(base, 'data', 'file.json')
```

**✅ Correct - proper patterns**:
```python
from pathlib import Path
from my_package.utils.path_resolver import get_data_dir

data_dir = get_data_dir()
data_file = data_dir / 'results.json'
```

### PowerShell Compatibility

**Command chaining in PowerShell**:

```powershell
# ❌ Fails in PowerShell
cd project && python script.py

# ✅ Correct for PowerShell
cd project; python script.py

# Or separate commands
cd project
python script.py
```

**Path handling in PowerShell**:

```powershell
# PowerShell uses backslashes but pathlib handles it
python -c "from pathlib import Path; print(Path('data') / 'file.json')"
```

## Script Organization

### Entry Point Patterns

Scripts should work in both development and installed modes:

```python
#!/usr/bin/env python3
"""
Example script that works when package is installed.
"""

import sys
from pathlib import Path

# Check package installation
try:
    from my_package import main_function
    from my_package.utils.path_resolver import get_project_root
except ImportError as e:
    print(f"Error: Package not installed: {e}")
    print("Install with: pip install -e .")
    sys.exit(1)

def main():
    project_root = get_project_root()
    # Script logic here...

if __name__ == "__main__":
    main()
```

### Path Resolution Utilities

Create a centralized path resolver:

```python
# my_package/utils/path_resolver.py
from pathlib import Path
import os

def get_project_root() -> Path:
    """Get project root directory."""
    # Check if we're in an installed package
    try:
        import my_package
        package_path = Path(my_package.__file__).parent.parent
        if (package_path / 'pyproject.toml').exists():
            return package_path
    except ImportError:
        pass
    
    # Fallback: search from current file
    current = Path(__file__).resolve()
    while current != current.parent:
        if (current / 'pyproject.toml').exists():
            return current
        current = current.parent
    
    # Last resort: current working directory
    return Path.cwd()

def get_data_dir() -> Path:
    """Get data directory, creating if needed."""
    root = get_project_root()
    data_dir = root / 'data'
    data_dir.mkdir(exist_ok=True)
    return data_dir

def get_config_dir() -> Path:
    """Get config directory."""
    root = get_project_root()
    return root / 'config'
```

## Summary

These best practices help prevent common mistakes and improve developer experience:

1. **Use utilities**: Leverage DevEnvTemplate utilities for encryption keys, environment variables, and error handling
2. **Validate early**: Check environment variables and key formats at startup
3. **Provide context**: Include helpful hints and documentation links in error messages
4. **Verify before commit/deploy**: Run verification checks before committing or deploying
5. **Cross-platform**: Consider shell compatibility when writing documentation or scripts
6. **Python-specific**: Avoid sys.path hacks, use pathlib.Path, install packages properly

For more information, see:
- [Troubleshooting Guide](TROUBLESHOOTING.md)
- [Usage Guide](USAGE.md)
- [LLM Context Guide](LLM-CONTEXT-GUIDE.md)
- [Python Best Practices Guide](guides/python-best-practices.md)

