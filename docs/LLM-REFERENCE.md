# Lunar Mining Simulator - DevEnvTemplate LLM Reference Guide

**Version:** Project-Specific Extension  
**Purpose:** Complete consolidated reference for AI assistants working with lunar_mining_sim project  
**Base Template:** DevEnvTemplate/docs/LLM-REFERENCE.md  
**Last Updated:** 2025

> **Note:** This file extends the technology-agnostic DevEnvTemplate reference with project-specific context. For reusable improvements, consider backporting to DevEnvTemplate.

---

## How to Use This File

This file consolidates all essential DevEnvTemplate documentation plus project-specific information for the lunar_mining_sim project. When working with this project:

1. **Reference this file** when the LLM needs to understand DevEnvTemplate commands and workflows
2. **Use project-specific sections** for Python commands, simulation-specific patterns, and project structure
3. **Backport improvements** - If you add technology-agnostic improvements, contribute them back to DevEnvTemplate

**Note:** This file is located in `docs/LLM-REFERENCE.md` to align with DevEnvTemplate structure. See [STRUCTURE.md](../STRUCTURE.md) for information about `.devenv/` structure alignment.

---

## Project-Specific Context

### Project Overview

**Project Name:** lunar-mining-simulator  
**Type:** Python simulation package  
**Stack Profile:** Python (detected from `pyproject.toml`)  
**Framework:** None (pure Python package)  
**Key Technologies:**
- Python 3.8+
- PyTorch (AI optimization)
- NumPy, SciPy (scientific computing)
- FastAPI (API layer)
- Pytest (testing)
- Ruff, Black, Mypy (code quality)

### Project Structure

```
lunar_mining_sim/
├── .devenv/              # DevEnvTemplate (this directory)
├── lunar_mining_sim/     # Main package
│   ├── ai/              # AI optimization modules
│   ├── analysis/        # Analysis and reporting
│   ├── api/             # FastAPI endpoints
│   ├── core/             # Core simulation logic
│   ├── isru/             # ISRU process implementations
│   └── utils/            # Utility functions
├── scripts/              # Project-specific scripts
├── tests/                # Test suite
├── data/                 # Simulation outputs
├── models/               # Trained AI models
├── notebooks/            # Jupyter notebooks
├── pyproject.toml        # Python package configuration
├── requirements.txt      # Python dependencies
└── README.md            # Project documentation
```

### Key Project Files

- **`pyproject.toml`** - Python package configuration, dependencies, build settings
- **`requirements.txt`** - Pinned dependencies for reproducible builds
- **`requirements.lock`** - Fully pinned toolchain (use for CI)
- **`scripts/check_env.py`** - Environment variable validation helper
- **`.env.example`** - Environment variable template (if exists)

---

## Quick Reference Tables

### User Intent → Command Pipeline (Python-Specific)

| User Intent | Command Sequence | Auto-Execute? |
|------------|------------------|---------------|
| "Set up new Python project" | `agent:init` → `doctor --fix` → `pip install -e .` → `pytest` | ✅ Yes |
| "Fix my Python project" | `doctor --json` → `doctor --fix --dry-run` → `doctor --fix` → `pip install -e .` | ✅ Yes |
| "Run tests" | `pytest` or `python -m pytest` | ✅ Yes |
| "Check code quality" | `ruff check .` → `black --check .` → `mypy .` | ✅ Yes |
| "Format code" | `black .` → `ruff check --fix .` | ✅ Yes |
| "Validate environment" | `python scripts/check_env.py` | ✅ Yes |
| "Install package" | `pip install -e .` | ✅ Yes |

### Python Stack Profile

When DevEnvTemplate detects this Python project, it will:
- Recommend **Pytest** for testing (not Jest/Vitest)
- Recommend **Ruff** for linting (not ESLint)
- Recommend **Black** for formatting (not Prettier)
- Recommend **Mypy** for type checking (not TypeScript)
- Recommend **pre-commit** hooks (not Husky)
- Recommend experiment budgets + run-tracking (not bundle-size budgets)

### Health Score → Action Matrix (Python Context)

| Score Range | Status | Python-Specific Action | Pipeline |
|-------------|--------|------------------------|----------|
| 90-100 | 🟢 Excellent | Maintain, run tests regularly | None |
| 80-89 | 🟢 Good | Optional: add type hints, improve coverage | Quick wins |
| 60-79 | 🟡 Fair | Add pytest config, setup ruff/black/mypy | Full fix pipeline |
| 40-59 | 🟡 Needs Work | Install package properly, fix imports | Full fix + manual |
| 0-39 | 🔴 Poor | Rebuild tooling, fix sys.path hacks | Fresh setup |

---

## Python-Specific Commands

### Running DevEnvTemplate Doctor

**From project root:**
```bash
# Basic health check
npm run doctor --prefix .devenv

# With auto-fix
npm run doctor --prefix .devenv -- --fix

# JSON output for automation
npm run doctor --prefix .devenv -- --json
```

**From .devenv directory:**
```bash
cd .devenv
npm run doctor              # auto-detects parent project
npm run doctor -- --project-root ..   # explicit override
```

**PowerShell (Windows):**
```powershell
Set-Location .devenv
npm run doctor
```

### Python Package Management

**Install package in development mode:**
```bash
# Create/activate virtual environment first
python -m venv venv

# Windows PowerShell
.\venv\Scripts\Activate.ps1

# Linux/macOS
source venv/bin/activate

# Install package
pip install -e .

# Install with all optional dependencies
pip install -e .[all]

# Install from lock file (reproducible)
pip install -r requirements.lock
```

**Verify installation:**
```bash
python -c "import lunar_mining_sim; print(lunar_mining_sim.__file__)"
```

### Testing

**Run all tests:**
```bash
pytest

# With coverage
pytest --cov=lunar_mining_sim --cov-report=html

# Fast tests only
pytest -m "not slow"

# Specific test file
pytest tests/test_simulator.py

# Verbose output
pytest -v
```

### Code Quality Tools

**Linting with Ruff:**
```bash
# Check for issues
ruff check .

# Auto-fix issues
ruff check --fix .

# Check specific directory
ruff check lunar_mining_sim/
```

**Formatting with Black:**
```bash
# Format all Python files
black .

# Check without modifying
black --check .

# Format specific directory
black lunar_mining_sim/
```

**Type checking with Mypy:**
```bash
# Check all Python files
mypy .

# Check specific module
mypy lunar_mining_sim/core/

# Ignore missing imports
mypy --ignore-missing-imports .
```

**Run all quality checks:**
```bash
ruff check . && black --check . && mypy .
```

### Environment Validation

**Check environment variables:**
```bash
python scripts/check_env.py
```

This script validates that all required environment variables are set before running simulations.

### Project-Specific Scripts

**Quick demo:**
```bash
python scripts/quick_demo.py
```

**Run benchmarks:**
```bash
python scripts/run_benchmarks.py
```

**Validate AI models:**
```bash
python scripts/validate_ai.py
```

**Validate physics:**
```bash
python scripts/validate_physics.py
```

**Check deployment readiness:**
```bash
python scripts/verify_deployment.py
```

---

## Python-Specific Workflows

### Pipeline 1: Python Project Setup

**User Intent:** "Set up my Python project"

**Complete Sequence:**
```bash
# 1. Create virtual environment
python -m venv venv

# 2. Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Linux/macOS:
source venv/bin/activate

# 3. Install package in development mode
pip install -e .

# 4. Run DevEnvTemplate doctor
npm run doctor --prefix .devenv

# 5. Apply fixes
npm run doctor --prefix .devenv -- --fix

# 6. Install recommended dev dependencies
pip install pytest ruff black mypy

# 7. Run tests
pytest

# 8. Verify environment
python scripts/check_env.py
```

**Expected Outcome:**
- ✅ Virtual environment created and activated
- ✅ Package installed in development mode
- ✅ Pytest configured
- ✅ Ruff + Black + Mypy configured
- ✅ .env.example created (if needed)
- ✅ Health score: 80-90/100

### Pipeline 2: Python Project Health & Fix

**User Intent:** "Fix my Python project"

**Complete Sequence:**
```bash
# 1. Initial assessment
npm run doctor --prefix .devenv -- --json > .devenv/health-before.json

# 2. Preview fixes
npm run doctor --prefix .devenv -- --fix --dry-run

# 3. Apply config-only fixes
npm run doctor --prefix .devenv -- --fix --no-install

# 4. Install missing dev dependencies
pip install pytest ruff black mypy pre-commit

# 5. Format code
black .
ruff check --fix .

# 6. Run type checking
mypy .

# 7. Verify improvements
npm run doctor --prefix .devenv -- --json > .devenv/health-after.json
```

**Expected Outcome:**
- Health score improved by 15-30 points
- All quick-win issues resolved
- Code formatted consistently
- Type checking enabled
- Ready for CI

### Pipeline 3: Python Pre-Deployment Quality Gate

**User Intent:** "Is my Python project ready to deploy?"

**Complete Sequence:**
```bash
# 1. Activate virtual environment
.\venv\Scripts\Activate.ps1  # Windows
# or
source venv/bin/activate     # Linux/macOS

# 2. Validate environment
python scripts/check_env.py

# 3. Run linting
ruff check .

# 4. Check formatting
black --check .

# 5. Type checking
mypy .

# 6. Run all tests
pytest

# 7. Build package
pip install build
python -m build

# 8. Doctor health check
npm run doctor --prefix .devenv -- --strict --json
```

**If Any Check Fails:**
- Automatically run Pipeline 2 (Health & Fix)
- Re-run quality gate
- Report when all checks pass

---

## Python-Specific Engineering Rules

### Import Patterns

**❌ Never use sys.path hacks:**
```python
# Wrong
import sys
from pathlib import Path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))
from lunar_mining_sim import something
```

**✅ Always install package properly:**
```python
# Correct - package should be installed: pip install -e .
from lunar_mining_sim import something
from lunar_mining_sim.core import simulator
```

### Path Resolution

**❌ Never hardcode paths:**
```python
# Wrong
data_file = '../data/results.json'
config_file = Path(__file__).parent.parent / 'config' / 'settings.yaml'
```

**✅ Use pathlib.Path and centralized utilities:**
```python
# Correct
from pathlib import Path
from lunar_mining_sim.utils.path_resolver import get_data_dir, get_project_root

data_dir = get_data_dir()
data_file = data_dir / 'results.json'

project_root = get_project_root()
config_file = project_root / 'config' / 'settings.yaml'
```

### Virtual Environment Management

**Always use virtual environments:**
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

**Document virtual environment setup in README:**
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

**Tests should not modify sys.path:**
```python
# ❌ Wrong
import sys
sys.path.insert(0, '../')

# ✅ Correct - package should be installed
from lunar_mining_sim.core import simulator
```

**Use pytest for better features:**
```python
# tests/test_simulator.py
import pytest
from lunar_mining_sim.core import simulator

def test_simulator_basic():
    sim = simulator.LunarMiningSimulator()
    assert sim is not None
```

### Script Organization

**Scripts should work when package is installed:**
```python
#!/usr/bin/env python3
"""
Script that works when package is installed.
"""

import sys

# Check if package is installed
try:
    from lunar_mining_sim import main_function
    from lunar_mining_sim.utils.path_resolver import get_project_root
except ImportError as e:
    print(f"Error: Package not installed: {e}")
    print("Install with: pip install -e .")
    sys.exit(1)

def main():
    project_root = get_project_root()
    # Script logic...

if __name__ == "__main__":
    main()
```

### PowerShell Compatibility

**Command chaining in PowerShell:**
```powershell
# ❌ Fails in PowerShell
cd project && python script.py

# ✅ Correct for PowerShell
cd project; python script.py

# Or separate commands
cd project
python script.py
```

**Path handling:**
```powershell
# PowerShell uses backslashes but pathlib handles it
python -c "from pathlib import Path; print(Path('data') / 'file.json')"
```

---

## Project-Specific Troubleshooting

### Import Errors

**Problem:** `ModuleNotFoundError: No module named 'lunar_mining_sim'`

**Solution:**
```bash
# Install package in development mode
pip install -e .

# Verify installation
python -c "import lunar_mining_sim; print(lunar_mining_sim.__file__)"
```

**Prevention:** Never use `sys.path.insert()` or `sys.path.append()`. Always install package properly.

### sys.path Hacks in Scripts

**Problem:** Scripts use `sys.path.insert(0, str(project_root))` to add project to path.

**Solution:**
1. Remove all `sys.path` modifications
2. Install package: `pip install -e .`
3. Use proper imports: `from lunar_mining_sim import something`

**Prevention:** Always install package before running scripts. Document installation in README.

### Virtual Environment Problems

**Problem:** Package imports work in one environment but not another.

**Solution:**
```bash
# Create fresh virtual environment
python -m venv venv

# Activate (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Activate (Linux/macOS)
source venv/bin/activate

# Install package
pip install -e .
```

**Prevention:** Always use virtual environments. Document setup in README.

### PowerShell Script Failures

**Problem:** Python scripts fail when run from PowerShell with path or encoding errors.

**Solution:**
```python
# ✅ Always specify encoding
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# ✅ Use pathlib.Path for paths
from pathlib import Path
data_file = Path('data') / 'results.json'
```

**Prevention:** Always use `encoding='utf-8'` for file operations. Use `pathlib.Path` for cross-platform paths.

### Test Import Errors

**Problem:** Tests fail with `ModuleNotFoundError` even though package is installed.

**Solution:**
```python
# ❌ Wrong - sys.path hack in test
import sys
sys.path.insert(0, '../')
from lunar_mining_sim.core import config

# ✅ Correct - package should be installed
from lunar_mining_sim.core import config
```

**Prevention:** Install package before running tests. Never modify `sys.path` in tests.

---

## Simulation-Specific Patterns

### Running Simulations

**Quick demo:**
```bash
python scripts/quick_demo.py
```

**Full simulation:**
```python
from lunar_mining_sim.core import simulator
from lunar_mining_sim.core.scenarios import get_scenario

# Create simulator
sim = simulator.LunarMiningSimulator()

# Load scenario
scenario = get_scenario('lunar_polar_crater')

# Run simulation
results = sim.run(scenario, duration_days=30)

# Analyze results
from lunar_mining_sim.analysis import analyze_results
analysis = analyze_results(results)
```

### Environment Variables

**Required variables (check with `python scripts/check_env.py`):**
- `SIMULATION_GRAVITY` - Override default gravity for testing
- `SIMULATION_STEPS` - Control benchmark iterations
- `OUTPUT_DIR` - Where generated data/plots are written

**Always use `.env.example` as template:**
```bash
cp .env.example .env
# Edit .env with your values
python scripts/check_env.py  # Validate
```

### Data Output

**Simulation outputs go to `data/` directory:**
- `data/simulation_output.txt` - Text output
- `data/simulation_report.md` - Markdown report
- `data/*.png` - Visualization plots
- `data/*.csv` - Time-series data

**Never commit generated data files** - They're in `.gitignore`.

---

## Backporting Improvements

### Identifying Technology-Agnostic Improvements

When you add improvements to this project-specific reference, consider:

1. **Is it Python-specific?** → Keep in this file only
2. **Is it simulation-specific?** → Keep in this file only
3. **Is it general DevEnvTemplate usage?** → Consider backporting to DevEnvTemplate
4. **Is it a workflow pattern?** → Consider backporting if it applies to other projects

### Backporting Process

1. **Identify the improvement** - What did you add that's technology-agnostic?
2. **Extract the content** - Remove project-specific references
3. **Test in DevEnvTemplate** - Ensure it works for other projects
4. **Submit to DevEnvTemplate** - Create PR or issue with the improvement
5. **Update this file** - Reference the backported content

### Example: Backporting a Workflow

If you create a new workflow pattern that works for any Python project:

1. Extract the workflow steps
2. Remove `lunar_mining_sim`-specific references
3. Generalize to "Python project" or "simulation project"
4. Add to `DevEnvTemplate/docs/LLM-REFERENCE.md`
5. Update this file to reference the new section

---

## Appendix: Links to Full Documentation

### DevEnvTemplate Documentation

- **[DevEnvTemplate LLM-REFERENCE.md](../../../DevEnvTemplate/docs/LLM-REFERENCE.md)** - Technology-agnostic template (base for this file)
- **[LLM-CONTEXT-GUIDE.md](LLM-CONTEXT-GUIDE.md)** - Complete command and workflow context
- **[USAGE.md](USAGE.md)** - Day-to-day doctor/cleanup workflows
- **[SETUP-GUIDE.md](SETUP-GUIDE.md)** - Step-by-step embedding instructions
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Known issues and remediation
- **[PROJECTRULES-UPDATE-v3.0.md](PROJECTRULES-UPDATE-v3.0.md)** - Engineering rules and guidelines
- **[BEST-PRACTICES.md](BEST-PRACTICES.md)** - Technology-agnostic best practices

### Project-Specific Documentation

- **[README.md](../../README.md)** - Project overview and quick start
- **[STRUCTURE.md](../STRUCTURE.md)** - Structure alignment and project-specific files (in .devenv/)
- **[docs/DEVELOPMENT.md](../../docs/DEVELOPMENT.md)** - Development guidelines
- **[docs/GETTING_STARTED.md](../../docs/GETTING_STARTED.md)** - Getting started guide
- **[CONTRIBUTING.md](../../CONTRIBUTING.md)** - Contribution guidelines
- **[pyproject.toml](../../pyproject.toml)** - Package configuration

---

**End of Lunar Mining Simulator LLM Reference Guide**

*This guide extends the DevEnvTemplate reference with project-specific context for the lunar_mining_sim Python simulation package.*

