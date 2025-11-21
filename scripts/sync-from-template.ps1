# Sync script to pull updates from DevEnvTemplate while preserving project-specific files
# Usage: .\scripts\sync-from-template.ps1 [template-path]

param(
    [string]$TemplatePath = "..\..\DevEnvTemplate"
)

$ErrorActionPreference = "Stop"

# Get the directory where this script is located
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$DevenvDir = Split-Path -Parent $ScriptDir
$ProjectRoot = Split-Path -Parent $DevenvDir

# Resolve absolute path
if (-not [System.IO.Path]::IsPathRooted($TemplatePath)) {
    # Resolve relative path from .devenv directory
    # ..\..\DevEnvTemplate from .devenv goes to C:\dev\DevEnvTemplate
    Push-Location $DevenvDir
    try {
        $resolved = Resolve-Path $TemplatePath -ErrorAction SilentlyContinue
        if ($resolved) {
            $TemplatePath = $resolved.Path
        } else {
            # Fallback: construct path manually
            # ..\..\DevEnvTemplate from C:\dev\lunar_mining_sim\.devenv = C:\dev\DevEnvTemplate
            $basePath = Split-Path -Parent (Split-Path -Parent $DevenvDir)
            $TemplatePath = Join-Path $basePath "DevEnvTemplate"
        }
    } finally {
        Pop-Location
    }
}

# Project-specific files to preserve (relative to .devenv)
$ProjectFiles = @(
    "health-report.json",
    "gaps-report.md",
    "stack-report.json",
    "health-before.json",
    "health-after.json",
    "input.txt"
)

Write-Host "[SYNC] Syncing .devenv from DevEnvTemplate" -ForegroundColor Green
Write-Host "Template path: $TemplatePath"
Write-Host "Devenv path: $DevenvDir"
Write-Host ""

# Check if template path exists
if (-not (Test-Path $TemplatePath)) {
    Write-Host "[ERROR] Template path does not exist: $TemplatePath" -ForegroundColor Red
    exit 1
}

# Check if we're in a git repository
if (-not (Test-Path (Join-Path $DevenvDir ".git"))) {
    Write-Host "[ERROR] .devenv is not a git repository" -ForegroundColor Red
    Write-Host "Initialize it with: cd .devenv; git init; git remote add origin <url>"
    exit 1
}

# Create temporary directory for backups
$BackupDir = New-TemporaryFile | ForEach-Object { Remove-Item $_; New-Item -ItemType Directory -Path $_ }
Write-Host "[BACKUP] Backing up project-specific files..." -ForegroundColor Yellow

# Backup project-specific files
foreach ($file in $ProjectFiles) {
    $sourcePath = Join-Path $DevenvDir $file
    if (Test-Path $sourcePath) {
        $backupPath = Join-Path $BackupDir $file
        $backupParent = Split-Path -Parent $backupPath
        if ($backupParent) {
            New-Item -ItemType Directory -Path $backupParent -Force | Out-Null
        }
        Copy-Item $sourcePath $backupPath
        Write-Host "  [OK] Backed up: $file"
    }
}

# Check current branch
Push-Location $DevenvDir
try {
    $CurrentBranch = git rev-parse --abbrev-ref HEAD
    Write-Host ""
    Write-Host "[INFO] Current branch: $CurrentBranch" -ForegroundColor Yellow

    # Check if there are uncommitted changes
    $status = git status --porcelain
    if ($status) {
        Write-Host "[WARN] Uncommitted changes detected. Stashing..." -ForegroundColor Yellow
        $timestamp = Get-Date -Format "yyyy-MM-dd-HHmmss"
        # Stash all changes including untracked files
        git stash push -u -m "Sync backup $timestamp"
    }

    # Fetch updates from template
    Write-Host ""
    Write-Host "[FETCH] Fetching updates from template..." -ForegroundColor Yellow

    # Add template as remote if it doesn't exist
    $remotes = git remote
    if ($remotes -notcontains "template") {
        git remote add template $TemplatePath
        Write-Host "  [OK] Added 'template' remote"
    }

    # Update template remote URL in case it changed
    git remote set-url template $TemplatePath

    # Get template branch
    Push-Location $TemplatePath
    try {
        $TemplateBranch = git rev-parse --abbrev-ref HEAD
    } finally {
        Pop-Location
    }

    # Fetch from template
    git fetch template $TemplateBranch

    # Merge or rebase (prefer merge for safety)
    Write-Host ""
    Write-Host "[MERGE] Merging updates..." -ForegroundColor Yellow
    $mergeOutput = git merge "template/$TemplateBranch" --no-edit 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Successfully merged updates" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Merge conflicts detected!" -ForegroundColor Red
        Write-Host "Resolve conflicts manually, then restore project files:"
        Write-Host "  Copy-Item -Recurse $BackupDir\* $DevenvDir\"
        exit 1
    }
} finally {
    Pop-Location
}

# Restore project-specific files
Write-Host ""
Write-Host "[RESTORE] Restoring project-specific files..." -ForegroundColor Yellow
foreach ($file in $ProjectFiles) {
    $backupPath = Join-Path $BackupDir $file
    if (Test-Path $backupPath) {
        $targetPath = Join-Path $DevenvDir $file
        $targetParent = Split-Path -Parent $targetPath
        if ($targetParent) {
            New-Item -ItemType Directory -Path $targetParent -Force | Out-Null
        }
        Copy-Item $backupPath $targetPath
        Write-Host "  [OK] Restored: $file"
    }
}

# Clean up backup
Remove-Item -Recurse -Force $BackupDir

# Rebuild if needed
Write-Host ""
Write-Host "[BUILD] Rebuilding..." -ForegroundColor Yellow
if (Test-Path (Join-Path $DevenvDir "package.json")) {
    Push-Location $DevenvDir
    try {
        npm install
        npm run build
        Write-Host "[OK] Build complete" -ForegroundColor Green
    } finally {
        Pop-Location
    }
}

Write-Host ""
Write-Host "[SUCCESS] Sync complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Project-specific files preserved:"
foreach ($file in $ProjectFiles) {
    $filePath = Join-Path $DevenvDir $file
    if (Test-Path $filePath) {
        Write-Host "  [OK] $file"
    }
}

