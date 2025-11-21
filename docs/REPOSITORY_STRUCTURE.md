# Repository Structure Explanation

## Overview

The `lunar_mining_sim` project has a standard Python package structure with an embedded DevEnvTemplate checkout. Here's why the structure looks the way it does:

## Directory Structure

```
lunar_mining_sim/                    # Project root (main git repository)
├── lunar_mining_sim/               # Python package directory (NOT a separate repo)
│   ├── __init__.py                 # Package initialization
│   ├── core/                       # Core simulation modules
│   ├── ai/                         # AI/ML modules
│   ├── api/                        # FastAPI endpoints
│   └── ...                         # Other package modules
├── .devenv/                        # DevEnvTemplate checkout (separate git repo)
│   ├── .git/                       # DevEnvTemplate's git repository
│   ├── scripts/                    # DevEnvTemplate scripts
│   └── docs/                       # DevEnvTemplate documentation
├── tests/                          # Test files
├── scripts/                        # Project scripts
├── docs/                           # Project documentation
├── web-demo/                       # Next.js web demo
├── pyproject.toml                  # Python package configuration
└── README.md                       # Project README
```

## Why Two `lunar_mining_sim` Directories?

### Outer `lunar_mining_sim/` (Project Root)
- **Purpose**: The main project repository
- **Contains**: 
  - Project configuration files (`pyproject.toml`, `requirements.txt`)
  - Documentation (`docs/`)
  - Tests (`tests/`)
  - Scripts (`scripts/`)
  - Web demo (`web-demo/`)
  - Deployment configs (`railway.json`, `render.yaml`)
- **Git Repository**: Yes - this is the main repository

### Inner `lunar_mining_sim/` (Python Package)
- **Purpose**: The actual Python package that gets installed
- **Contains**: 
  - Package source code (all the `.py` modules)
  - Package `__init__.py` file
  - All subpackages (`core/`, `ai/`, `api/`, etc.)
- **Git Repository**: No - this is just a directory within the main repo
- **Why this structure?**: Standard Python packaging pattern

### Why This Structure?

This is the **standard Python package structure** recommended by Python packaging guidelines:

1. **Package Name = Directory Name**: The package name `lunar_mining_sim` matches the directory name
2. **Installation**: When you run `pip install -e .`, Python installs the inner `lunar_mining_sim/` directory as the package
3. **Imports**: After installation, you can do `from lunar_mining_sim import simulate`
4. **Separation**: Keeps package code separate from project files (tests, docs, scripts)

## The `.devenv/` Directory

### What is it?
- **Purpose**: DevEnvTemplate checkout embedded in the project
- **Git Repository**: Yes - it's a separate git repository (clone of DevEnvTemplate)
- **Why separate?**: 
  - DevEnvTemplate is a reusable tool
  - It can be updated independently
  - It's in `.gitignore` of the main project (so it's not committed to lunar_mining_sim)

### How it works:
```bash
# .devenv/ is a separate git repository
cd .devenv
git remote -v  # Shows DevEnvTemplate repository
git pull       # Updates DevEnvTemplate

# But it's ignored by the main project
cd ..
git status     # .devenv/ doesn't show up (it's in .gitignore)
```

## Summary

| Directory | Type | Git Repo | Purpose |
|-----------|------|----------|---------|
| `lunar_mining_sim/` (outer) | Project root | ✅ Yes | Main project repository |
| `lunar_mining_sim/lunar_mining_sim/` | Python package | ❌ No | Package source code |
| `lunar_mining_sim/.devenv/` | DevEnvTemplate | ✅ Yes | Development tools |

## Common Confusion Points

### "Why is there a nested directory with the same name?"
This is standard Python packaging. The structure allows:
- Clean separation of package code from project files
- Easy installation with `pip install -e .`
- Standard import paths: `from lunar_mining_sim import ...`

### "Is `.devenv/` part of the main repo?"
No. `.devenv/` is:
- A separate git repository (DevEnvTemplate)
- Ignored by the main project's `.gitignore`
- Cloned/updated independently
- Used for development tooling

### "Should I commit `.devenv/`?"
No. It's in `.gitignore` because:
- It's a separate tool, not project code
- Each developer can have their own version
- It can be updated independently
- It's large and changes frequently

## Related Documentation

- [Python Packaging Guide](https://packaging.python.org/en/latest/guides/distributing-packages-using-setuptools/)
- [Project Structure Best Practices](best-practices/python.md#package-installation)
- [DevEnvTemplate Embedded Usage](../../DevEnvTemplate/docs/EMBEDDED-USAGE.md)

