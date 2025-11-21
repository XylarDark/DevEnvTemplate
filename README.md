# Lunar Mining Simulator - Development Environment

This directory contains project-specific development environment configuration, best practices, and utilities.

## Quick Start

1. **Install the package in development mode:**
   ```bash
   pip install -e .
   ```

2. **Check your environment:**
   ```bash
   # Bash/zsh
   ./.devenv/scripts/check-env.sh
   
   # PowerShell
   .\.devenv\scripts\check-env.ps1
   ```

3. **Review best practices:**
   - [Python Best Practices](best-practices/python.md)
   - [Next.js Best Practices](best-practices/nextjs.md)
   - [FastAPI Best Practices](best-practices/fastapi.md)
   - [Deployment Best Practices](best-practices/deployment.md)

## Directory Structure

This `.devenv/` directory is based on DevEnvTemplate with project-specific additions. See [STRUCTURE.md](STRUCTURE.md) for detailed alignment information.

```
.devenv/
├── README.md                    # This file (DevEnvTemplate base + project-specific)
├── STRUCTURE.md                 # Structure alignment documentation
├── MISTAKE_PATTERNS.md          # Project-specific: Common mistakes and prevention
├── IMPLEMENTATION_SUMMARY.md    # Project-specific: Implementation notes
├── REPOSITORY_STRUCTURE.md      # Project-specific: Repository structure
├── best-practices/              # Project-specific: Technology-specific guidelines
│   ├── python.md
│   ├── nextjs.md
│   ├── fastapi.md
│   └── deployment.md
├── config/                      # Configuration files
│   ├── cleanup.config.yaml      # DevEnvTemplate standard
│   ├── quality-budgets.json     # DevEnvTemplate standard
│   ├── python-best-practices.json  # Project-specific: Python config
│   ├── shell-aliases.sh         # Project-specific: Bash aliases
│   └── shell-aliases.ps1        # Project-specific: PowerShell aliases
├── docs/                        # Documentation
│   ├── LLM-REFERENCE.md         # ✅ Project-specific extension (aligned location)
│   └── [other DevEnvTemplate docs]
├── scripts/                     # Scripts and utilities
│   ├── [DevEnvTemplate scripts]
│   ├── check-env.sh            # Project-specific: Environment checker (bash)
│   ├── check-env.ps1           # Project-specific: Environment checker (PowerShell)
│   └── validate-paths.py        # Project-specific: Path validation
└── [other DevEnvTemplate directories: tests/, etc.]
```

**Note:** Core structure aligns with DevEnvTemplate. Project-specific files are clearly marked and documented in [STRUCTURE.md](STRUCTURE.md).

## Common Tasks

### Environment Setup

```bash
# Install dependencies
pip install -e .[all]

# Verify installation
python -c "import lunar_mining_sim; print('OK')"
```

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=lunar_mining_sim --cov-report=html

# Run specific test file
pytest tests/test_simulator.py -v
```

### Development Workflow

1. **Never use sys.path hacks** - Always install package with `pip install -e .`
2. **Use path resolution utilities** - See `lunar_mining_sim.utils.path_resolver`
3. **Follow import ordering** - PEP 8: stdlib, third-party, local
4. **Use custom exceptions** - See `lunar_mining_sim.utils.exceptions`
5. **Test cross-platform** - Test scripts in both bash and PowerShell

## Shell Aliases

Load aliases for convenient commands:

```bash
# Bash/zsh
source .devenv/config/shell-aliases.sh

# PowerShell
. .\.devenv\config\shell-aliases.ps1
```

## Troubleshooting

See [MISTAKE_PATTERNS.md](MISTAKE_PATTERNS.md) for common issues and solutions.

## Related Documentation

- [Main README](../README.md)
- [Development Guide](../docs/DEVELOPMENT.md)
- [Error Audit](../docs/ERROR_AUDIT.md)
- [DevEnvTemplate](../../DevEnvTemplate/README.md)
