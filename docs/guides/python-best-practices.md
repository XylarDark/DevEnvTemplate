# Python Best Practices Guide

This guide provides comprehensive Python-specific best practices for development, derived from real-world issues and common mistakes.

## Table of Contents

1. [Import Patterns](#import-patterns)
2. [Path Resolution](#path-resolution)
3. [Package Structure](#package-structure)
4. [Virtual Environment Management](#virtual-environment-management)
5. [Testing Patterns](#testing-patterns)
6. [Script Entry Points](#script-entry-points)
7. [Cross-Platform Considerations](#cross-platform-considerations)

## Import Patterns

### Avoid sys.path Hacks

**Problem**: Using `sys.path.insert()` or `sys.path.append()` is a code smell indicating improper package installation.

**Solution**: Install package properly and use standard imports.

```python
# ❌ Wrong - sys.path hack
import sys
from pathlib import Path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))
from my_package import something

# ✅ Correct - proper installation
# First: pip install -e .
from my_package import something
```

### Absolute vs Relative Imports

**In scripts and entry points**: Use absolute imports from installed package.

```python
# ❌ Wrong - relative import in script
from ..core import config

# ✅ Correct - absolute import
from my_package.core import config
```

**In package modules**: Relative imports are acceptable.

```python
# ✅ OK in package module
from ..utils import helpers
from .submodule import function
```

### Import Organization

Follow PEP 8 import ordering:

```python
# 1. Standard library
import os
import sys
from pathlib import Path
from typing import Optional, Dict, List

# 2. Third-party
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# 3. Local application
from my_package.core import config
from my_package.utils import helpers
```

Use `isort` to automatically organize imports:

```bash
# Install isort
pip install isort

# Format imports
isort .
```

## Path Resolution

### Use pathlib.Path

**Always use `pathlib.Path` for cross-platform path operations**:

```python
# ❌ Wrong - os.path (works but less modern)
import os
data_dir = os.path.join(base_dir, 'data', 'results.json')

# ✅ Correct - pathlib.Path
from pathlib import Path
data_dir = Path(base_dir) / 'data' / 'results.json'
```

### Centralized Path Resolution

Create a utility module for path resolution:

```python
# my_package/utils/path_resolver.py
from pathlib import Path
import sys

def get_project_root() -> Path:
    """
    Get project root directory.
    
    Tries multiple strategies:
    1. Check if package is installed and find root from package location
    2. Search upward from current file for pyproject.toml or setup.py
    3. Fallback to current working directory
    """
    # Strategy 1: Check installed package
    try:
        import my_package
        package_path = Path(my_package.__file__).parent.parent
        if (package_path / 'pyproject.toml').exists() or (package_path / 'setup.py').exists():
            return package_path
    except (ImportError, AttributeError):
        pass
    
    # Strategy 2: Search from current file
    current = Path(__file__).resolve()
    while current != current.parent:
        if (current / 'pyproject.toml').exists() or (current / 'setup.py').exists():
            return current
        current = current.parent
    
    # Strategy 3: Fallback to cwd
    return Path.cwd()

def get_data_dir() -> Path:
    """Get data directory, creating if needed."""
    root = get_project_root()
    data_dir = root / 'data'
    data_dir.mkdir(parents=True, exist_ok=True)
    return data_dir

def get_config_dir() -> Path:
    """Get config directory."""
    root = get_project_root()
    config_dir = root / 'config'
    config_dir.mkdir(parents=True, exist_ok=True)
    return config_dir
```

### Never Hardcode Paths

```python
# ❌ Wrong - hardcoded relative path
config_file = Path(__file__).parent.parent / 'config' / 'settings.yaml'

# ✅ Correct - use resolver
from my_package.utils.path_resolver import get_config_dir
config_file = get_config_dir() / 'settings.yaml'
```

## Package Structure

### Proper Installation

**Package must be installable**:

```bash
# Install in development mode
pip install -e .

# Verify installation
python -c "import my_package; print(my_package.__file__)"
```

**pyproject.toml should define package**:

```toml
[build-system]
requires = ["setuptools>=61.0", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "my-package"
version = "1.0.0"
description = "My package description"
requires-python = ">=3.8"
dependencies = [
    "numpy>=1.24.0",
    "pandas>=1.5.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0.0",
    "black>=23.0.0",
    "ruff>=0.1.0",
]
```

### Script Entry Points

Define entry points in `pyproject.toml`:

```toml
[project.scripts]
my-script = "my_package.cli:main"
```

Then scripts can be run as:

```bash
my-script --help
```

## Virtual Environment Management

### Creating Virtual Environments

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Activate (Linux/macOS)
source venv/bin/activate

# Install package
pip install -e .
```

### Documenting Setup

Always document virtual environment setup in README:

```markdown
## Development Setup

1. Create virtual environment:
   ```bash
   python -m venv venv
   ```

2. Activate virtual environment:
   - **Windows PowerShell**: `.\venv\Scripts\Activate.ps1`
   - **Linux/macOS**: `source venv/bin/activate`

3. Install package:
   ```bash
   pip install -e .
   ```

4. Install development dependencies:
   ```bash
   pip install -e ".[dev]"
   ```
```

## Testing Patterns

### No sys.path in Tests

```python
# ❌ Wrong - sys.path hack in test
import sys
sys.path.insert(0, '../')
from my_package.core import config

# ✅ Correct - package should be installed
from my_package.core import config
```

### Using pytest

```python
# tests/test_example.py
import pytest
from my_package.core import config

def test_config_loading():
    assert config.DEFAULT_VALUE == 42

def test_path_resolution():
    from my_package.utils.path_resolver import get_project_root
    root = get_project_root()
    assert root.exists()
    assert (root / 'pyproject.toml').exists()
```

### Test Configuration

Create `pytest.ini` or configure in `pyproject.toml`:

```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
```

## Script Entry Points

### Scripts That Work When Installed

```python
#!/usr/bin/env python3
"""
Script that works when package is installed.
"""

import sys
from pathlib import Path

# Check if package is installed
try:
    from my_package import main_function
    from my_package.utils.path_resolver import get_project_root
except ImportError as e:
    print(f"Error: Package not installed: {e}")
    print("Install with: pip install -e .")
    sys.exit(1)

def main():
    project_root = get_project_root()
    data_dir = project_root / 'data'
    # Script logic here...
    print(f"Using project root: {project_root}")

if __name__ == "__main__":
    main()
```

### Installation Check

Add installation check at script start:

```python
def check_installation():
    """Check if package is properly installed."""
    try:
        import my_package
        return True
    except ImportError:
        return False

if not check_installation():
    print("Error: Package not installed.")
    print("Run: pip install -e .")
    sys.exit(1)
```

## Cross-Platform Considerations

### Shell Compatibility

**PowerShell vs Bash**:

```bash
# Bash/Linux/macOS
cd project && python script.py

# PowerShell/Windows
cd project; python script.py
```

**Documentation should provide both**:

```markdown
**Bash/Linux:**
```bash
cd project && python script.py
```

**PowerShell:**
```powershell
cd project; python script.py
```
```

### Path Separators

**Always use pathlib.Path**:

```python
# ❌ Wrong - hardcoded separator
data_file = 'data/results.json'  # Fails on Windows

# ✅ Correct - pathlib handles it
from pathlib import Path
data_file = Path('data') / 'results.json'  # Works everywhere
```

### Encoding

**Always specify encoding for file operations**:

```python
# ✅ Correct - explicit encoding
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
```

## Common Mistakes

### Mistake 1: sys.path Hacks

```python
# ❌ Wrong
sys.path.insert(0, str(Path(__file__).parent.parent))
```

**Fix**: Install package with `pip install -e .`

### Mistake 2: Hardcoded Paths

```python
# ❌ Wrong
data_file = '../data/results.json'
```

**Fix**: Use path resolver utility

### Mistake 3: os.path Instead of pathlib

```python
# ❌ Wrong
import os
path = os.path.join(base, 'data', 'file.json')
```

**Fix**: Use `pathlib.Path`

### Mistake 4: PowerShell Command Failures

```bash
# ❌ Wrong in PowerShell
cd project && python script.py
```

**Fix**: Use `;` or separate commands

## Tools and Utilities

### Linting

**ruff** - Fast Python linter:

```bash
pip install ruff
ruff check .
ruff format .
```

**Configuration in pyproject.toml**:

```toml
[tool.ruff]
line-length = 100
target-version = "py38"

[tool.ruff.lint]
select = ["E", "F", "I", "N", "W"]
ignore = ["E501"]  # Line too long
```

### Formatting

**black** - Code formatter:

```bash
pip install black
black .
```

**isort** - Import sorter:

```bash
pip install isort
isort .
```

### Type Checking

**mypy** - Static type checker:

```bash
pip install mypy
mypy .
```

## Summary

Key principles for Python development:

1. **No sys.path hacks**: Install package properly
2. **Use pathlib.Path**: Cross-platform path operations
3. **Centralized path resolution**: Create utility module
4. **Proper package installation**: Use `pip install -e .`
5. **Cross-platform compatibility**: Test on Windows and Linux
6. **Virtual environments**: Always use venv
7. **Type hints**: Gradually add for better IDE support
8. **Testing**: Use pytest, no sys.path in tests

## References

- [PEP 8 - Style Guide](https://pep8.org/)
- [pathlib Documentation](https://docs.python.org/3/library/pathlib.html)
- [Python Packaging Guide](https://packaging.python.org/)
- [pytest Documentation](https://docs.pytest.org/)

