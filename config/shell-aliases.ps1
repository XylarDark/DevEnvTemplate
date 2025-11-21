# Shell Aliases for Lunar Mining Simulator Development (PowerShell)
# Source this file: . .\.devenv\config\shell-aliases.ps1

# Python aliases
function lms-check { python .\.devenv\scripts\validate-paths.py }
function lms-test { pytest tests/ -v }
function lms-test-cov { pytest tests/ --cov=lunar_mining_sim --cov-report=html }
function lms-install { pip install -e . }
function lms-install-all { pip install -e .[all] }

# Environment checking
function lms-env { .\.devenv\scripts\check-env.ps1 }

# Quick demo
function lms-demo { python scripts\quick_demo.py }

# Web demo (if exists)
if (Test-Path "web-demo") {
    function lms-web-dev { Set-Location web-demo; npm run dev }
    function lms-web-build { Set-Location web-demo; npm run build }
}

# Common development tasks
function lms-format { ruff format lunar_mining_sim/ }
function lms-lint { ruff check lunar_mining_sim/ }
function lms-typecheck { mypy lunar_mining_sim/ }

Write-Host "✓ Lunar Mining Simulator aliases loaded" -ForegroundColor Green

