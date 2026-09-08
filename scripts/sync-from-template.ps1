# Thin wrapper around the layer-aware sync CLI.
#
# Embedded .devenv usage (legacy git merge):
#   Set-Location .devenv
#   .\scripts\sync-from-template.ps1 C:\dev\DevEnvTemplate
#
# Host project layer sync (preferred):
#   npm run sync -- --layer agent-context --template C:\dev\DevEnvTemplate --apply

param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$RemainingArgs
)

$ErrorActionPreference = "Stop"

function Invoke-SyncCli {
    param(
        [string[]]$CliArgs
    )

    $ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    $RepoRoot = Split-Path -Parent $ScriptDir
    $CliPath = Join-Path $RepoRoot "dist/scripts/sync/cli.js"

    if (-not (Test-Path $CliPath)) {
        Write-Host "Building sync CLI..."
        Push-Location $RepoRoot
        try {
            npm run build | Out-Null
        } finally {
            Pop-Location
        }
    }

    & node $CliPath @CliArgs
    if ($LASTEXITCODE -ne 0) {
        exit $LASTEXITCODE
    }
}

if ($RemainingArgs -contains "--help" -or $RemainingArgs -contains "-h") {
    Invoke-SyncCli @("--help")
    exit 0
}

if ($RemainingArgs.Count -lt 1 -or [string]::IsNullOrWhiteSpace($RemainingArgs[0])) {
    Write-Host "[ERROR] Template path is required for --devenv-merge mode." -ForegroundColor Red
    Write-Host "Usage: .\scripts\sync-from-template.ps1 <template-path>"
    Write-Host "       npm run sync -- --layer agent-context --template <template-path>"
    exit 1
}

$TemplatePath = $RemainingArgs[0]
$ExtraArgs = @()
if ($RemainingArgs.Count -gt 1) {
    $ExtraArgs = $RemainingArgs[1..($RemainingArgs.Count - 1)]
}

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $ScriptDir

if ((Split-Path -Leaf $RepoRoot) -eq ".devenv") {
    $ProjectRoot = Split-Path -Parent $RepoRoot
} else {
    $ProjectRoot = $RepoRoot
}

$CliArgs = @(
    "--devenv-merge",
    "--template", $TemplatePath,
    "--project-root", $ProjectRoot
) + $ExtraArgs

Invoke-SyncCli -CliArgs $CliArgs
