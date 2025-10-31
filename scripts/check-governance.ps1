# PowerShell Governance Compliance Check Script
# Technology-agnostic, cross-platform governance validation
# Report-only: exits 0 always, provides actionable feedback

param(
    [string]$ProjectRulesFile = ".projectrules",
    [string]$ChangelogFile = "docs/rules-changelog.md"
)

# Configuration
$script:GITHUB_STEP_SUMMARY = $env:GITHUB_STEP_SUMMARY

# Results tracking
$issues = [System.Collections.ArrayList]::new()
$suggestions = [System.Collections.ArrayList]::new()

# Helper functions
function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

function Write-Warn {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Add-Issue {
    param([string]$Issue)
    $null = $issues.Add($Issue)
}

function Add-Suggestion {
    param([string]$Suggestion)
    $null = $suggestions.Add($Suggestion)
}

# Check if file exists and is readable
function Test-File {
    param(
        [string]$File,
        [string]$Description
    )

    if (-not (Test-Path $File)) {
        Add-Issue "$Description file missing: $File"
        return $false
    }

    try {
        $null = Get-Content $File -TotalCount 1
        return $true
    }
    catch {
        Add-Issue "$Description file not readable: $File"
        return $false
    }
}

# Extract version from rules file
function Get-RulesVersion {
    param([string]$File)

    try {
        $content = Get-Content $File -Raw
        if ($content -match '# Version:\s*([0-9]+\.[0-9]+)') {
            return $matches[1]
        }
    }
    catch {
        Write-Warn "Could not read rules file: $File"
    }

    return $null
}

# Check if version follows semantic versioning
function Test-ValidVersion {
    param([string]$Version)

    return $Version -match '^[0-9]+\.[0-9]+$'
}

# Check if changelog contains recent entry for version
function Test-ChangelogVersion {
    param(
        [string]$Version,
        [string]$File
    )

    if (-not (Test-Path $File)) {
        return $false
    }

    try {
        $content = Get-Content $File -Raw
        return $content -match $Version
    }
    catch {
        return $false
    }
}

# Get list of changed files (from git or environment)
function Get-ChangedFiles {
    # Check if we're in a GitHub Actions environment
    if ($env:GITHUB_SHA) {
        # Try to get changed files from GitHub event
        if ($env:GITHUB_EVENT_PULL_REQUEST_BASE_SHA) {
            try {
                $baseSha = $env:GITHUB_EVENT_PULL_REQUEST_BASE_SHA
                $changedFiles = & git diff --name-only $baseSha 2>$null
                return $changedFiles
            }
            catch {
                Write-Warn "Could not get changed files from git diff"
            }
        }
    }

    # Fallback: check staged + unstaged changes
    if (Test-Path .git) {
        try {
            $staged = & git diff --name-only --staged 2>$null
            $unstaged = & git diff --name-only 2>$null
            return ($staged + $unstaged) | Where-Object { $_ } | Select-Object -Unique
        }
        catch {
            Write-Warn "Could not get changed files from git status"
        }
    }

    return $null
}

# Main checks
function Invoke-MainChecks {
    Write-Info "Running governance compliance checks..."

    # Check required files exist
    if (-not (Test-File $ProjectRulesFile "Project rules")) {
        Write-Error "Cannot proceed without $ProjectRulesFile"
        return $false
    }

    # Extract and validate version
    $rulesVersion = Get-RulesVersion $ProjectRulesFile

    if ($null -eq $rulesVersion) {
        Add-Issue "Could not extract version from $ProjectRulesFile"
    }
    elseif (-not (Test-ValidVersion $rulesVersion)) {
        Add-Issue "Invalid version format in $ProjectRulesFile`: $rulesVersion (expected: x.y)"
    }
    else {
        Write-Success "Rules version: $rulesVersion"
    }

    # Check changelog exists and is current
    if ((Test-File $ChangelogFile "Rules changelog")) {
        if (($null -ne $rulesVersion) -and (-not (Test-ChangelogVersion $rulesVersion $ChangelogFile))) {
            Add-Suggestion "Consider updating $ChangelogFile with version $rulesVersion entry"
        }
    }

    # Analyze changed files for governance triggers
    $changedFiles = Get-ChangedFiles

    if ($null -ne $changedFiles -and $changedFiles.Count -gt 0) {
        Write-Info "Analyzing changed files for governance triggers..."

        # Check if rules file changed but version wasn't bumped
        if ($changedFiles -contains $ProjectRulesFile) {
            Write-Warn "Rules file modified - ensure version bump if policies changed"
            Add-Suggestion "If policies/guardrails changed, bump version in $ProjectRulesFile header"
        }

        # Check if CI configs changed but governance checks are mentioned
        $ciFiles = $changedFiles | Where-Object { $_ -match '\.github|workflows|\.gitlab-ci|\.azure-pipelines' }
        if ($ciFiles.Count -gt 0 -and ($ciFiles | Where-Object { $_ -notmatch 'governance' }).Count -gt 0) {
            Write-Info "CI configuration changed - governance workflow may need updates"
        }

        # Check if changelog changed but rules didn't
        if ($changedFiles -contains $ChangelogFile -and $changedFiles -notcontains $ProjectRulesFile) {
            Write-Info "Changelog updated - verify corresponding rules changes"
        }
    }

    # Check for common patterns that should trigger governance review
    if (Test-Path ".gitignore") {
        $gitignoreContent = Get-Content ".gitignore" -Raw
        if ($gitignoreContent -notmatch "secrets|credentials|keys") {
            Add-Suggestion "Consider adding common secrets patterns to .gitignore (secrets, credentials, keys)"
        }
        else {
            Write-Success "Secrets exclusion detected in .gitignore"
        }
    }

    return $true
}

# Generate report
function Write-Report {
    $totalIssues = $issues.Count
    $totalSuggestions = $suggestions.Count

    Write-Host ""
    Write-Info "Governance Check Summary"
    Write-Host "═══════════════════════════════════════"

    if ($totalIssues -gt 0) {
        Write-Error "Issues found: $totalIssues"
        foreach ($issue in $issues) {
            Write-Host "  • $issue"
        }
    }
    else {
        Write-Success "No critical issues found"
    }

    if ($totalSuggestions -gt 0) {
        Write-Warn "Suggestions: $totalSuggestions"
        foreach ($suggestion in $suggestions) {
            Write-Host "  • $suggestion"
        }
    }

    # GitHub Actions summary
    if ($GITHUB_STEP_SUMMARY) {
        $summaryContent = @"
## Governance Check Results

"@

        if ($totalIssues -gt 0) {
            $summaryContent += @"

### Issues ($totalIssues)
"@
            foreach ($issue in $issues) {
                $summaryContent += "- ❌ $issue`n"
            }
        }

        if ($totalSuggestions -gt 0) {
            $summaryContent += @"

### Suggestions ($totalSuggestions)
"@
            foreach ($suggestion in $suggestions) {
                $summaryContent += "- 💡 $suggestion`n"
            }
        }

        if ($totalIssues -eq 0 -and $totalSuggestions -eq 0) {
            $summaryContent += "✅ All governance checks passed!"
        }

        try {
            $summaryContent | Out-File -FilePath $GITHUB_STEP_SUMMARY -Append -Encoding utf8
        }
        catch {
            Write-Warn "Could not write to GitHub step summary"
        }
    }

    # Policy enforcement mode
    $policyEnforcement = $env:POLICY_ENFORCEMENT ?? "report-only"

    if (($policyEnforcement -eq "enforced") -and ($totalIssues -gt 0)) {
        Write-Error "Policy enforcement enabled: $totalIssues issue(s) found - blocking"
        exit 1
    }
    elseif ($totalIssues -gt 0) {
        Write-Warn "Issues detected - review suggestions above (report-only mode)"
    }
    else {
        Write-Success "Governance checks completed successfully"
    }
}

# Main execution
try {
    if (Invoke-MainChecks) {
        Write-Report
        exit 0
    }
    else {
        Write-Error "Governance checks failed to complete"
        exit 1
    }
}
catch {
    Write-Error "Unexpected error during governance checks: $($_.Exception.Message)"
    exit 1
}

# Report-only: exits 0 always, provides actionable feedback

param(
    [string]$ProjectRulesFile = ".projectrules",
    [string]$ChangelogFile = "docs/rules-changelog.md"
)

# Configuration
$script:GITHUB_STEP_SUMMARY = $env:GITHUB_STEP_SUMMARY

# Results tracking
$issues = [System.Collections.ArrayList]::new()
$suggestions = [System.Collections.ArrayList]::new()

# Helper functions
function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

function Write-Warn {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Add-Issue {
    param([string]$Issue)
    $null = $issues.Add($Issue)
}

function Add-Suggestion {
    param([string]$Suggestion)
    $null = $suggestions.Add($Suggestion)
}

# Check if file exists and is readable
function Test-File {
    param(
        [string]$File,
        [string]$Description
    )

    if (-not (Test-Path $File)) {
        Add-Issue "$Description file missing: $File"
        return $false
    }

    try {
        $null = Get-Content $File -TotalCount 1
        return $true
    }
    catch {
        Add-Issue "$Description file not readable: $File"
        return $false
    }
}

# Extract version from rules file
function Get-RulesVersion {
    param([string]$File)

    try {
        $content = Get-Content $File -Raw
        if ($content -match '# Version:\s*([0-9]+\.[0-9]+)') {
            return $matches[1]
        }
    }
    catch {
        Write-Warn "Could not read rules file: $File"
    }

    return $null
}

# Check if version follows semantic versioning
function Test-ValidVersion {
    param([string]$Version)

    return $Version -match '^[0-9]+\.[0-9]+$'
}

# Check if changelog contains recent entry for version
function Test-ChangelogVersion {
    param(
        [string]$Version,
        [string]$File
    )

    if (-not (Test-Path $File)) {
        return $false
    }

    try {
        $content = Get-Content $File -Raw
        return $content -match $Version
    }
    catch {
        return $false
    }
}

# Get list of changed files (from git or environment)
function Get-ChangedFiles {
    # Check if we're in a GitHub Actions environment
    if ($env:GITHUB_SHA) {
        # Try to get changed files from GitHub event
        if ($env:GITHUB_EVENT_PULL_REQUEST_BASE_SHA) {
            try {
                $baseSha = $env:GITHUB_EVENT_PULL_REQUEST_BASE_SHA
                $changedFiles = & git diff --name-only $baseSha 2>$null
                return $changedFiles
            }
            catch {
                Write-Warn "Could not get changed files from git diff"
            }
        }
    }

    # Fallback: check staged + unstaged changes
    if (Test-Path .git) {
        try {
            $staged = & git diff --name-only --staged 2>$null
            $unstaged = & git diff --name-only 2>$null
            return ($staged + $unstaged) | Where-Object { $_ } | Select-Object -Unique
        }
        catch {
            Write-Warn "Could not get changed files from git status"
        }
    }

    return $null
}

# Main checks
function Invoke-MainChecks {
    Write-Info "Running governance compliance checks..."

    # Check required files exist
    if (-not (Test-File $ProjectRulesFile "Project rules")) {
        Write-Error "Cannot proceed without $ProjectRulesFile"
        return $false
    }

    # Extract and validate version
    $rulesVersion = Get-RulesVersion $ProjectRulesFile

    if ($null -eq $rulesVersion) {
        Add-Issue "Could not extract version from $ProjectRulesFile"
    }
    elseif (-not (Test-ValidVersion $rulesVersion)) {
        Add-Issue "Invalid version format in $ProjectRulesFile`: $rulesVersion (expected: x.y)"
    }
    else {
        Write-Success "Rules version: $rulesVersion"
    }

    # Check changelog exists and is current
    if ((Test-File $ChangelogFile "Rules changelog")) {
        if (($null -ne $rulesVersion) -and (-not (Test-ChangelogVersion $rulesVersion $ChangelogFile))) {
            Add-Suggestion "Consider updating $ChangelogFile with version $rulesVersion entry"
        }
    }

    # Analyze changed files for governance triggers
    $changedFiles = Get-ChangedFiles

    if ($null -ne $changedFiles -and $changedFiles.Count -gt 0) {
        Write-Info "Analyzing changed files for governance triggers..."

        # Check if rules file changed but version wasn't bumped
        if ($changedFiles -contains $ProjectRulesFile) {
            Write-Warn "Rules file modified - ensure version bump if policies changed"
            Add-Suggestion "If policies/guardrails changed, bump version in $ProjectRulesFile header"
        }

        # Check if CI configs changed but governance checks are mentioned
        $ciFiles = $changedFiles | Where-Object { $_ -match '\.github|workflows|\.gitlab-ci|\.azure-pipelines' }
        if ($ciFiles.Count -gt 0 -and ($ciFiles | Where-Object { $_ -notmatch 'governance' }).Count -gt 0) {
            Write-Info "CI configuration changed - governance workflow may need updates"
        }

        # Check if changelog changed but rules didn't
        if ($changedFiles -contains $ChangelogFile -and $changedFiles -notcontains $ProjectRulesFile) {
            Write-Info "Changelog updated - verify corresponding rules changes"
        }
    }

    # Check for common patterns that should trigger governance review
    if (Test-Path ".gitignore") {
        $gitignoreContent = Get-Content ".gitignore" -Raw
        if ($gitignoreContent -notmatch "secrets|credentials|keys") {
            Add-Suggestion "Consider adding common secrets patterns to .gitignore (secrets, credentials, keys)"
        }
        else {
            Write-Success "Secrets exclusion detected in .gitignore"
        }
    }

    return $true
}

# Generate report
function Write-Report {
    $totalIssues = $issues.Count
    $totalSuggestions = $suggestions.Count

    Write-Host ""
    Write-Info "Governance Check Summary"
    Write-Host "═══════════════════════════════════════"

    if ($totalIssues -gt 0) {
        Write-Error "Issues found: $totalIssues"
        foreach ($issue in $issues) {
            Write-Host "  • $issue"
        }
    }
    else {
        Write-Success "No critical issues found"
    }

    if ($totalSuggestions -gt 0) {
        Write-Warn "Suggestions: $totalSuggestions"
        foreach ($suggestion in $suggestions) {
            Write-Host "  • $suggestion"
        }
    }

    # GitHub Actions summary
    if ($GITHUB_STEP_SUMMARY) {
        $summaryContent = @"
## Governance Check Results

"@

        if ($totalIssues -gt 0) {
            $summaryContent += @"

### Issues ($totalIssues)
"@
            foreach ($issue in $issues) {
                $summaryContent += "- ❌ $issue`n"
            }
        }

        if ($totalSuggestions -gt 0) {
            $summaryContent += @"

### Suggestions ($totalSuggestions)
"@
            foreach ($suggestion in $suggestions) {
                $summaryContent += "- 💡 $suggestion`n"
            }
        }

        if ($totalIssues -eq 0 -and $totalSuggestions -eq 0) {
            $summaryContent += "✅ All governance checks passed!"
        }

        try {
            $summaryContent | Out-File -FilePath $GITHUB_STEP_SUMMARY -Append -Encoding utf8
        }
        catch {
            Write-Warn "Could not write to GitHub step summary"
        }
    }

    # Policy enforcement mode
    $policyEnforcement = $env:POLICY_ENFORCEMENT ?? "report-only"

    if (($policyEnforcement -eq "enforced") -and ($totalIssues -gt 0)) {
        Write-Error "Policy enforcement enabled: $totalIssues issue(s) found - blocking"
        exit 1
    }
    elseif ($totalIssues -gt 0) {
        Write-Warn "Issues detected - review suggestions above (report-only mode)"
    }
    else {
        Write-Success "Governance checks completed successfully"
    }
}

# Main execution
try {
    if (Invoke-MainChecks) {
        Write-Report
        exit 0
    }
    else {
        Write-Error "Governance checks failed to complete"
        exit 1
    }
}
catch {
    Write-Error "Unexpected error during governance checks: $($_.Exception.Message)"
    exit 1
}
