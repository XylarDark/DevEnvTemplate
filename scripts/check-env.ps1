# Environment Checker for Lunar Mining Simulator (PowerShell)
# Checks that development environment is properly configured

$ErrorActionPreference = "Stop"

Write-Host "🔍 Checking development environment..." -ForegroundColor Cyan
Write-Host ""

$Errors = 0
$Warnings = 0

# Check Python installation
Write-Host -NoNewline "Checking Python... "
try {
    $pythonVersion = python --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ $pythonVersion" -ForegroundColor Green
    } else {
        throw "Python not found"
    }
} catch {
    Write-Host "✗ Python not found" -ForegroundColor Red
    $Errors++
}

# Check if package is installed
Write-Host -NoNewline "Checking package installation... "
try {
    python -c "import lunar_mining_sim" 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Package installed" -ForegroundColor Green
    } else {
        throw "Package not installed"
    }
} catch {
    Write-Host "✗ Package not installed. Run: pip install -e ." -ForegroundColor Red
    $Errors++
}

# Check for sys.path hacks
Write-Host -NoNewline "Checking for sys.path hacks... "
$sysPathHacks = Get-ChildItem -Path scripts\ -Filter *.py -Recurse -ErrorAction SilentlyContinue | 
    Select-String -Pattern "sys\.path\.(insert|append)" | 
    Where-Object { $_.Path -notmatch "__pycache__|\.pyc" }
if ($sysPathHacks) {
    Write-Host "⚠ Found sys.path hacks in scripts/" -ForegroundColor Yellow
    $Warnings++
} else {
    Write-Host "✓ No sys.path hacks found" -ForegroundColor Green
}

# Check virtual environment
Write-Host -NoNewline "Checking virtual environment... "
if ($env:VIRTUAL_ENV) {
    Write-Host "✓ Virtual environment active: $env:VIRTUAL_ENV" -ForegroundColor Green
} else {
    Write-Host "⚠ No virtual environment detected (recommended)" -ForegroundColor Yellow
    $Warnings++
}

# Check Node.js (for web-demo)
if (Test-Path "web-demo") {
    Write-Host -NoNewline "Checking Node.js... "
    try {
        $nodeVersion = node --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Node.js $nodeVersion" -ForegroundColor Green
        } else {
            throw "Node.js not found"
        }
    } catch {
        Write-Host "⚠ Node.js not found (needed for web-demo)" -ForegroundColor Yellow
        $Warnings++
    }
    
    # Check if web-demo dependencies are installed
    if (Test-Path "web-demo\node_modules") {
        Write-Host "✓ Web-demo dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "⚠ Web-demo dependencies not installed. Run: cd web-demo; npm install" -ForegroundColor Yellow
        $Warnings++
    }
}

# Check environment variables
Write-Host -NoNewline "Checking .env file... "
if (Test-Path ".env") {
    Write-Host "✓ .env file exists" -ForegroundColor Green
} else {
    Write-Host "⚠ .env file not found (optional)" -ForegroundColor Yellow
    $Warnings++
}

# Summary
Write-Host ""
if ($Errors -eq 0 -and $Warnings -eq 0) {
    Write-Host "✓ All checks passed!" -ForegroundColor Green
    exit 0
} elseif ($Errors -eq 0) {
    Write-Host "⚠ Checks passed with $Warnings warning(s)" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "✗ Found $Errors error(s) and $Warnings warning(s)" -ForegroundColor Red
    exit 1
}

