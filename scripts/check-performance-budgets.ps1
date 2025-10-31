# PowerShell Quality Budgets Check Script
# Technology-agnostic budget validation
# Report-only: exits 0 always, provides actionable feedback

param(
    [string]$BudgetsFile = "quality-budgets.json",
    [string]$BuildTimeMs = $env:BUILD_TIME_MS,
    [string]$TestTimeMs = $env:TEST_TIME_MS,
    [string]$BundleSizeKb = $env:BUNDLE_SIZE_KB,
    [string]$TestCoveragePercent = $env:TEST_COVERAGE_PERCENT
)

# Configuration
$script:GITHUB_STEP_SUMMARY = $env:GITHUB_STEP_SUMMARY

# Results tracking
$results = [System.Collections.ArrayList]::new()
$warnings = [System.Collections.ArrayList]::new()
$recommendations = [System.Collections.ArrayList]::new()

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

function Add-Result {
    param([string]$Result)
    $null = $results.Add($Result)
}

function Add-Warning {
    param([string]$Warning)
    $null = $warnings.Add($Warning)
}

function Add-Recommendation {
    param([string]$Recommendation)
    $null = $recommendations.Add($Recommendation)
}

# Load budgets from JSON
function Get-Budgets {
    if (Test-Path $BudgetsFile) {
        try {
            $content = Get-Content $BudgetsFile -Raw | ConvertFrom-Json
            return $content.budgets
        }
        catch {
            Write-Warn "Could not parse budgets file: $BudgetsFile"
        }
    }
    else {
        Write-Warn "Budget file not found: $BudgetsFile - using defaults"
    }

    # Return default budgets
    return @{
        performance = @{
            buildTimeMs = 300000
            testTimeMs = 60000
            bundleSizeKb = 100
        }
        quality = @{
            testCoveragePercent = 80
        }
    }
}

# Check build time budget
function Test-BuildTimeBudget {
    param($budgets)

    if ([string]::IsNullOrEmpty($BuildTimeMs)) {
        Add-Warning "Build time not measured - consider adding timing to your build process"
        return
    }

    try {
        $buildTime = [double]$BuildTimeMs
        $budgetTime = $budgets.performance.buildTimeMs

        if ($budgetTime -eq $null) { $budgetTime = 300000 }

        if ($buildTime -gt $budgetTime) {
            Add-Result "❌ Build time: ${buildTime}ms (budget: ${budgetTime}ms)"
            Add-Recommendation "Optimize build performance or increase buildTimeMs budget"
        }
        else {
            Add-Result "✅ Build time: ${buildTime}ms (budget: ${budgetTime}ms)"
        }
    }
    catch {
        Add-Warning "Invalid build time value: $BuildTimeMs"
    }
}

# Check test time budget
function Test-TestTimeBudget {
    param($budgets)

    if ([string]::IsNullOrEmpty($TestTimeMs)) {
        Add-Warning "Test time not measured - consider adding timing to your test process"
        return
    }

    try {
        $testTime = [double]$TestTimeMs
        $budgetTime = $budgets.performance.testTimeMs

        if ($budgetTime -eq $null) { $budgetTime = 60000 }

        if ($testTime -gt $budgetTime) {
            Add-Result "❌ Test time: ${testTime}ms (budget: ${budgetTime}ms)"
            Add-Recommendation "Optimize test performance or increase testTimeMs budget"
        }
        else {
            Add-Result "✅ Test time: ${testTime}ms (budget: ${budgetTime}ms)"
        }
    }
    catch {
        Add-Warning "Invalid test time value: $TestTimeMs"
    }
}

# Check bundle size budget
function Test-BundleSizeBudget {
    param($budgets)

    if ([string]::IsNullOrEmpty($BundleSizeKb)) {
        # Try to detect bundle size from common build outputs
        $bundleSize = $null

        # Check for dist or build directories
        $buildDirs = @("dist", "build")
        foreach ($dir in $buildDirs) {
            if (Test-Path $dir) {
                try {
                    # Get directory size in KB (rough estimate)
                    $sizeBytes = (Get-ChildItem $dir -Recurse -File | Measure-Object -Property Length -Sum).Sum
                    if ($sizeBytes -gt 0) {
                        $bundleSize = [math]::Round($sizeBytes / 1KB, 0)
                        break
                    }
                }
                catch {
                    # Ignore errors in size calculation
                }
            }
        }

        if ($null -eq $bundleSize) {
            Add-Warning "Bundle size not measured - consider adding size tracking to your build process"
            return
        }

        $BundleSizeKb = $bundleSize.ToString()
    }

    try {
        $sizeKb = [double]$BundleSizeKb
        $budgetSize = $budgets.performance.bundleSizeKb

        if ($budgetSize -eq $null) { $budgetSize = 100 }

        if ($sizeKb -gt $budgetSize) {
            Add-Result "❌ Bundle size: ${sizeKb}KB (budget: ${budgetSize}KB)"
            Add-Recommendation "Optimize bundle size through code splitting, tree shaking, or compression"
        }
        else {
            Add-Result "✅ Bundle size: ${sizeKb}KB (budget: ${budgetSize}KB)"
        }
    }
    catch {
        Add-Warning "Invalid bundle size value: $BundleSizeKb"
    }
}

# Check test coverage
function Test-TestCoverageBudget {
    param($budgets)

    if ([string]::IsNullOrEmpty($TestCoveragePercent)) {
        Add-Warning "Test coverage not measured - consider adding coverage reporting to your tests"
        return
    }

    try {
        $coverage = [double]$TestCoveragePercent
        $budgetCoverage = $budgets.quality.testCoveragePercent

        if ($budgetCoverage -eq $null) { $budgetCoverage = 80 }

        if ($coverage -lt $budgetCoverage) {
            Add-Result "❌ Test coverage: ${coverage}% (budget: ${budgetCoverage}%)"
            Add-Recommendation "Increase test coverage by adding more unit tests"
        }
        else {
            Add-Result "✅ Test coverage: ${coverage}% (budget: ${budgetCoverage}%)"
        }
    }
    catch {
        Add-Warning "Invalid test coverage value: $TestCoveragePercent"
    }
}

# Main execution
function Invoke-MainChecks {
    Write-Info "Running quality budget checks..."

    $budgets = Get-Budgets

    # Run individual checks
    Test-BuildTimeBudget $budgets
    Test-TestTimeBudget $budgets
    Test-BundleSizeBudget $budgets
    Test-TestCoverageBudget $budgets
}

# Generate report
function Write-Report {
    $totalResults = $results.Count
    $totalWarnings = $warnings.Count
    $totalRecommendations = $recommendations.Count

    Write-Host ""
    Write-Info "Quality Budget Check Results"
    Write-Host "═══════════════════════════════════════"

    if ($totalResults -gt 0) {
        Write-Host "Budget Checks:"
        foreach ($result in $results) {
            Write-Host "  $result"
        }
        Write-Host ""
    }

    if ($totalWarnings -gt 0) {
        Write-Warn "Warnings:"
        foreach ($warning in $warnings) {
            Write-Host "  • $warning"
        }
        Write-Host ""
    }

    if ($totalRecommendations -gt 0) {
        Write-Info "Recommendations:"
        foreach ($recommendation in $recommendations) {
            Write-Host "  • $recommendation"
        }
        Write-Host ""
    }

    # GitHub Actions summary
    if ($GITHUB_STEP_SUMMARY) {
        $summaryContent = @"
## Quality Budget Check Results

"@

        if ($totalResults -gt 0) {
            $summaryContent += "Budget Status:`n"
            foreach ($result in $results) {
                $summaryContent += "- $result`n"
            }
            $summaryContent += "`n"
        }

        if ($totalWarnings -gt 0) {
            $summaryContent += "### Warnings`n"
            foreach ($warning in $warnings) {
                $summaryContent += "- ⚠️ $warning`n"
            }
            $summaryContent += "`n"
        }

        if ($totalRecommendations -gt 0) {
            $summaryContent += "### Recommendations`n"
            foreach ($recommendation in $recommendations) {
                $summaryContent += "- 💡 $recommendation`n"
            }
            $summaryContent += "`n"
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
    $failedChecks = ($results | Where-Object { $_ -match "❌" }).Count

    if (($policyEnforcement -eq "enforced") -and ($failedChecks -gt 0)) {
        Write-Error "Policy enforcement enabled: $failedChecks budget violation(s) - blocking"
        exit 1
    }
    elseif ($failedChecks -gt 0) {
        Write-Warn "$failedChecks budget check(s) exceeded limits (report-only mode)"
    }
    else {
        Write-Success "All budget checks passed!"
    }
}

# Main execution
try {
    Invoke-MainChecks
    Write-Report
    exit 0
}
catch {
    Write-Error "Unexpected error during budget checks: $($_.Exception.Message)"
    exit 1
}
