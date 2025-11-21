# Python Best Practices for Lunar Mining Simulator

## Package Installation

### ✅ Always Install in Development Mode

```bash
# Install package in editable mode
pip install -e .

# Install with all optional dependencies
pip install -e .[all]

# Verify installation
python -c "import lunar_mining_sim; print('OK')"
```

### ❌ Never Use sys.path Hacks

```python
# ❌ WRONG - sys.path hack
import sys
from pathlib import Path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))
from lunar_mining_sim import simulate

# ✅ CORRECT - Proper package installation
from lunar_mining_sim import simulate
from lunar_mining_sim.utils.path_resolver import get_project_root
```

**Why:** sys.path hacks are fragile, break on reorganization, and violate Python packaging best practices.

## Path Resolution

### Use Centralized Path Utilities

```python
from lunar_mining_sim.utils.path_resolver import (
    get_project_root,
    get_data_dir,
    get_config_dir,
    get_models_dir
)

# Get project root (works in both dev and installed mode)
project_root = get_project_root()

# Get data directory
data_dir = get_data_dir()

# Get config directory
config_dir = get_config_dir()
```

### ❌ Avoid Hardcoded Paths

```python
# ❌ WRONG - Hardcoded relative paths
data_dir = Path(__file__).parent.parent / 'data'

# ✅ CORRECT - Use path resolver
from lunar_mining_sim.utils.path_resolver import get_data_dir
data_dir = get_data_dir()
```

## Import Organization

### Follow PEP 8 Import Ordering

1. Standard library imports
2. Third-party imports
3. Local application imports

```python
# ✅ CORRECT - PEP 8 ordering
import os
from pathlib import Path
from typing import Dict, Optional

import numpy as np
import pandas as pd

from lunar_mining_sim import simulate
from lunar_mining_sim.utils.exceptions import SimulationError
```

### Use isort for Automatic Organization

```bash
# Install isort
pip install isort

# Check import ordering
isort --check-only lunar_mining_sim/

# Fix import ordering
isort lunar_mining_sim/
```

## Type Hints

### Use Type Hints for All Public APIs

```python
from typing import Dict, Optional, List

def simulate(
    scenario: str,
    depth: float,
    angle: float,
    speed: float,
    verbose: bool = False
) -> float:
    """
    Run a simulation.
    
    Args:
        scenario: Scenario name
        depth: Excavation depth in meters
        angle: Excavation angle in degrees
        speed: Tool speed in m/s
        verbose: Print progress
        
    Returns:
        Energy consumption in Joules
    """
    ...
```

### Use mypy for Static Type Checking

```bash
# Install mypy
pip install mypy

# Type check the package
mypy lunar_mining_sim/
```

## Error Handling

### Use Custom Exception Hierarchy

```python
from lunar_mining_sim.utils.exceptions import (
    LunarMiningError,
    SimulationError,
    ValidationError,
    ConfigurationError
)

# ✅ CORRECT - Specific exceptions with context
try:
    result = simulate(...)
except ValidationError as e:
    raise SimulationError(
        f"Invalid parameters: {e.message}",
        context={'parameters': params}
    )
except SimulationError:
    raise  # Re-raise custom exceptions
except Exception as e:
    raise SimulationError(
        f"Unexpected error: {str(e)}",
        context={'original_error': type(e).__name__}
    )
```

### ❌ Avoid Generic Exception Handling

```python
# ❌ WRONG - Generic exception
try:
    result = simulate(...)
except Exception as e:
    print(f"Error: {e}")  # Too generic, loses context
```

## Virtual Environment

### Always Use a Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Unix)
source venv/bin/activate

# Install package
pip install -e .
```

### Document Virtual Environment in README

Always include virtual environment setup instructions in project README.

## Testing

### Use pytest with Coverage

```bash
# Install testing dependencies
pip install pytest pytest-cov

# Run tests
pytest

# Run with coverage
pytest --cov=lunar_mining_sim --cov-report=html

# Run specific test
pytest tests/test_simulator.py::test_basic_simulation -v
```

### Test Structure

```python
# tests/test_simulator.py
import pytest
from lunar_mining_sim import simulate

def test_basic_simulation():
    """Test basic simulation functionality."""
    energy = simulate(
        scenario="lunar_flat_standard",
        depth=0.5,
        angle=45.0,
        speed=1.0
    )
    assert energy > 0
    assert isinstance(energy, float)
```

## Code Quality

### Use ruff for Linting and Formatting

```bash
# Install ruff
pip install ruff

# Check code
ruff check lunar_mining_sim/

# Format code
ruff format lunar_mining_sim/
```

### Use vulture to Find Dead Code

```bash
# Install vulture
pip install vulture

# Find unused code
vulture lunar_mining_sim/
```

## Documentation

### Use Type Hints in Docstrings

```python
def simulate(
    scenario: str,
    depth: float,
    angle: float,
    speed: float
) -> float:
    """
    Run a simulation.
    
    Args:
        scenario: Scenario name
        depth: Excavation depth in meters (0.1 to 1.0)
        angle: Excavation angle in degrees (0 to 90)
        speed: Tool speed in m/s (0.5 to 2.0)
        
    Returns:
        Energy consumption in Joules
        
    Raises:
        ValidationError: If parameters are invalid
        SimulationError: If simulation fails
        
    Example:
        >>> energy = simulate("lunar_flat_standard", 0.5, 45.0, 1.0)
        >>> print(f"Energy: {energy:.2f} J")
    """
```

## Environment Variables

### Use Environment Variables for Configuration

```python
import os
from typing import Optional

# ✅ CORRECT - Environment-based configuration
API_URL = os.getenv("API_URL", "http://localhost:8000")
DEMO_MODE = os.getenv("DEMO_MODE", "false").lower() == "true"
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
```

### Provide .env.example

Always provide `.env.example` with documented variables:

```bash
# .env.example
API_URL=http://localhost:8000
DEMO_MODE=false
CORS_ORIGINS=*
```

## Checklist

Before committing Python code:

- [ ] Package installed with `pip install -e .`
- [ ] No `sys.path` hacks
- [ ] Paths resolved using utilities
- [ ] Imports follow PEP 8 ordering
- [ ] Type hints on public APIs
- [ ] Custom exceptions with context
- [ ] Tests pass with coverage
- [ ] Code formatted with ruff
- [ ] No dead code (vulture clean)
- [ ] Environment variables for config

