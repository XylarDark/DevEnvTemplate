#!/usr/bin/env node

/**
 * Development Environment Doctor Mode
 * 
 * Acts as a "doctor" for your development environment:
 * - Diagnoses issues (stack-detector)
 * - Prescribes solutions (gap-analyzer)
 * - Generates treatment plan (plan-generator)
 * - Shows health score
 */

import { promises as fs, existsSync } from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { resolveProjectRoot as enhancedResolveProjectRoot } from '../utils/path-resolver';

interface HealthScore {
  overall: number;
  security: number;
  quality: number;
  testing: number;
  ci: number;
  documentation: number;
}

interface Issue {
  severity: 'critical' | 'warning' | 'info';
  category: string;
  message: string;
  estimatedFix: string;
}

interface DoctorReport {
  timestamp: string;
  healthScore: HealthScore;
  critical: Issue[];
  warnings: Issue[];
  info: Issue[];
  quickWins: Issue[];
}

interface CliOptions {
  fix?: boolean;
  noInstall?: boolean;
  preset?: 'nextjs' | 'vite' | 'express' | 'vanilla';
  dryRun?: boolean;
  strict?: boolean;
  json?: boolean;
  projectRoot?: string;
  mode?: 'fast' | 'full';
  debug?: boolean;
  integrateCursorRules?: boolean;
  offline?: boolean;
}

/**
 * Main doctor command
 */
async function runDoctor(options: CliOptions = {}) {
  // Set offline mode to prevent network operations that might interfere with VPN
  if (options.offline) {
    // Disable npm registry lookups
    process.env.NPM_CONFIG_OFFLINE = 'true';
    process.env.npm_config_offline = 'true';
    // Prevent DNS lookups for module resolution
    process.env.NODE_OPTIONS = (process.env.NODE_OPTIONS || '') + ' --no-warnings';
    // Set offline flag for any child processes
    process.env.DEVENV_OFFLINE = 'true';
    if (!options.json) {
      console.log('📴 Offline mode enabled: network operations disabled\n');
    }
  }
  
  if (options.debug && !process.env.LOG_LEVEL) {
    process.env.LOG_LEVEL = 'DEBUG';
  }
  if (!options.json) {
    console.log('🏥 Development Environment Health Check\n');
    if (options.debug) {
      console.log('🪲 Debug logging enabled (LOG_LEVEL=DEBUG)\n');
    }
  }

  const currentDir = process.cwd();
  const { projectRoot, autoDetected } = await resolveProjectRoot(currentDir, options.projectRoot);
  if (autoDetected && !options.json) {
    console.log(`ℹ️ Detected embedded .devenv folder. Analyzing parent project: ${projectRoot}\n`);
  }
  if (projectRoot !== currentDir) {
    process.chdir(projectRoot);
  }
  const workingDir = projectRoot;
  const reportDir = path.join(workingDir, '.devenv');
  const scanMode: 'fast' | 'full' = options.mode === 'fast' ? 'fast' : 'full';

  // Ensure .devenv directory exists
  await fs.mkdir(reportDir, { recursive: true });

  // Apply preset override if specified
  if (options.preset && !options.json) {
    console.log(`🎯 Using preset: ${options.preset}\n`);
  }

  // Step 1: Run stack detector
  if (!options.json) {
    console.log('🔍 Analyzing project stack...');
    if (scanMode === 'fast') {
      console.log('⚡ Fast mode enabled: skipping deep scans for quicker feedback\n');
    }
  }
  const stackDetectorDistPath = path.join(__dirname, '../tools/stack-detector.js');
  const stackDetectorSourcePath = path.join(__dirname, '../../../scripts/tools/stack-detector.ts');
  const stackDetectorPath = existsSync(stackDetectorDistPath)
    ? stackDetectorDistPath
    : existsSync(stackDetectorSourcePath)
      ? stackDetectorSourcePath
      : stackDetectorDistPath;
  let stackData: any;
  
  try {
    const stackArgs = ['--json'];
    if (scanMode === 'fast') {
      stackArgs.push('--mode=fast');
    }
    if (options.debug) {
      stackArgs.push('--debug');
    }
    if (options.offline) {
      stackArgs.push('--offline');
    }
    const stackCommand = `node "${stackDetectorPath}" ${stackArgs.join(' ')}`;
    const stackOutput = execSync(stackCommand, {
      cwd: workingDir,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env }
    });
    stackData = JSON.parse(stackOutput);
    const profiles = Array.isArray(stackData.profiles) && stackData.profiles.length > 0
      ? stackData.profiles
      : ['agnostic'];
    if (!options.json) {
      console.log(`🧠 Stack profile${profiles.length > 1 ? 's' : ''}: ${profiles.join(', ')}`);
    }
  } catch (error: any) {
    const stderr = error?.stderr?.toString()?.trim();
    const stdout = error?.stdout?.toString()?.trim();
    const details = stderr || stdout || error.message;
    
    // Check if it's a JSON parsing error
    if (error instanceof SyntaxError || details.includes('JSON') || details.includes('parse')) {
      console.error('❌ Failed to parse stack detector output as JSON');
      console.error('   This usually means the stack detector output includes log messages.');
      console.error('   Try running with --json flag or check LOG_LEVEL environment variable.');
      if (stdout) {
        console.error(`   Output preview: ${stdout.substring(0, 200)}...`);
      }
    } else {
      console.error('❌ Failed to detect stack:', details);
      console.error('   Make sure you are running from the project root or use --project-root flag.');
    }
    process.exit(1);
  }

  // Step 1.5: Integrate cursor rules if requested or if needed
  if (options.integrateCursorRules || (stackData.cursorRules && stackData.cursorRules.needsIntegration)) {
    if (!options.json) {
      console.log('📋 Integrating Cursor rules...');
    }
    
    try {
      // Find .cursor/rules path within .devenv (self-contained)
      // Check .devenv/.cursor/rules relative to project root and __dirname relative paths
      let templateRulesPath: string | null = null;
      const possiblePaths = [
        path.join(workingDir, '.devenv', '.cursor', 'rules'),
        path.join(__dirname, '../../../.cursor/rules')
      ];

      for (const possiblePath of possiblePaths) {
        if (existsSync(possiblePath)) {
          templateRulesPath = possiblePath;
          break;
        }
      }

      if (templateRulesPath) {
        const { integrateCursorRules } = await import('../tools/cursor-rules-integration');
        const integrationResult = await integrateCursorRules({
          projectRoot: workingDir,
          templateRulesPath,
          stackReport: stackData,
          overwriteCore: false,
          dryRun: options.dryRun || false
        });

        if (!options.json) {
          if (integrationResult.copied.length > 0) {
            console.log(`  ✓ Copied ${integrationResult.copied.length} rule file(s)`);
          }
          if (integrationResult.updated.length > 0) {
            console.log(`  ✓ Updated ${integrationResult.updated.length} rule file(s)`);
          }
          if (integrationResult.preserved.length > 0) {
            console.log(`  ✓ Preserved ${integrationResult.preserved.length} project-specific rule file(s)`);
          }
          if (integrationResult.recommendations.length > 0) {
            integrationResult.recommendations.forEach(rec => {
              console.log(`  ℹ️  ${rec}`);
            });
          }
        }
      } else {
        if (!options.json) {
          console.log('  ⚠️  .devenv/.cursor/rules/ not found. Skipping integration.');
          console.log('     Ensure .devenv/.cursor/rules/ exists for cursor rules integration.');
        }
      }
    } catch (error: any) {
      if (!options.json) {
        console.error(`  ⚠️  Failed to integrate cursor rules: ${error.message}`);
      }
      // Don't fail the entire doctor run if integration fails
    }
    
    if (!options.json) {
      console.log('');
    }
  }

  // Step 2: Run gap analyzer
  if (!options.json) {
    console.log('🔬 Identifying gaps and issues...');
  }
  const gapAnalyzerPath = path.join(__dirname, '../tools/gap-analyzer.js');
  let gapsReport: string;
  
  try {
    const gapArgs: string[] = [];
    if (scanMode === 'fast') {
      gapArgs.push('--mode=fast');
    }
    if (options.debug) {
      gapArgs.push('--debug');
    }
    if (options.offline) {
      gapArgs.push('--offline');
    }
    const gapCommand =
      gapArgs.length > 0
        ? `node "${gapAnalyzerPath}" ${gapArgs.join(' ')}`
        : `node "${gapAnalyzerPath}"`;
    execSync(gapCommand, {
      cwd: workingDir,
      encoding: 'utf8',
      stdio: 'inherit',
      env: { ...process.env }
    });
    
    // Read the generated report
    const gapsReportPath = path.join(reportDir, 'gaps-report.md');
    gapsReport = await fs.readFile(gapsReportPath, 'utf8');
  } catch (error: any) {
    console.error('❌ Failed to analyze gaps:', error.message);
    process.exit(1);
  }

  // Step 3: Parse gaps and calculate health score
  if (!options.json) {
    console.log('📊 Calculating health score...\n');
  }
  const report = parseGapsReport(gapsReport);

  // Step 4: Display report
  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    displayReport(report);
  }

  // Step 5: Save full report
  const reportPath = path.join(reportDir, 'health-report.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  
  if (!options.json) {
    console.log(`\n💾 Full report saved: ${path.relative(workingDir, reportPath)}`);
  }

  // Step 6: Auto-fix if requested
  if (options.fix) {
    if (options.dryRun) {
      console.log('\n🔍 DRY RUN - No changes will be applied\n');
    }
    console.log('\n🔧 Applying automatic fixes...');
    await applyQuickFixes(report.quickWins, options);
  }

  // Exit with error code if issues found (in strict mode)
  if (options.strict && (report.critical.length > 0 || report.warnings.length > 0)) {
    console.log('\n❌ Exiting with error code due to --strict flag');
    process.exit(1);
  } else if (report.critical.length > 0) {
    process.exit(1);
  }
}

/**
 * Parse gaps report markdown and extract issues
 */
function parseGapsReport(markdown: string): DoctorReport {
  const critical: Issue[] = [];
  const warnings: Issue[] = [];
  const info: Issue[] = [];
  const quickWins: Issue[] = [];

  // Parse markdown sections
  const lines = markdown.split('\n');
  let currentSeverity: 'critical' | 'warning' | 'info' | null = null;
  let currentCategory = '';

  for (const line of lines) {
    // Detect severity sections
    if (line.includes('🔴 Critical') || line.includes('Critical Gaps')) {
      currentSeverity = 'critical';
    } else if (line.includes('🟡 Warning') || line.includes('Recommended Improvements')) {
      currentSeverity = 'warning';
    } else if (line.includes('🟢 Info') || line.includes('Optional Enhancements')) {
      currentSeverity = 'info';
    }

    // Detect category
    if (line.startsWith('### ')) {
      currentCategory = line.replace('###', '').trim();
    }

    // Detect issues (lines starting with - or *)
    if ((line.trim().startsWith('-') || line.trim().startsWith('*')) && currentSeverity) {
      const message = line.trim().replace(/^[-*]\s*/, '');
      if (message && !message.startsWith('[')) { // Skip links
        const issue: Issue = {
          severity: currentSeverity,
          category: currentCategory,
          message,
          estimatedFix: estimateFixTime(message)
        };

        if (currentSeverity === 'critical') {
          critical.push(issue);
        } else if (currentSeverity === 'warning') {
          warnings.push(issue);
        } else {
          info.push(issue);
        }

        // Identify quick wins (< 10 min)
        if (isQuickWin(message)) {
          quickWins.push(issue);
        }
      }
    }
  }

  // Calculate health scores
  const healthScore = calculateHealthScore(critical, warnings, info);

  return {
    timestamp: new Date().toISOString(),
    healthScore,
    critical,
    warnings,
    info,
    quickWins
  };
}

/**
 * Calculate health scores with indie-focused priorities
 * Testing: 25%, CI/CD: 20%, Type Safety: 20%, Env Hygiene: 15%, Lint/Format: 20%
 */
function calculateHealthScore(
  critical: Issue[],
  warnings: Issue[],
  info: Issue[]
): HealthScore {
  // Categorize issues by type
  const categorize = (issues: Issue[], keywords: string[]) =>
    issues.filter(i => 
      keywords.some(kw => 
        i.category.toLowerCase().includes(kw) ||
        i.message.toLowerCase().includes(kw)
      )
    ).length;

  // Count issues by category
  const testingIssues = categorize([...critical, ...warnings], ['test', 'testing', 'jest', 'vitest', 'playwright']);
  const ciIssues = categorize([...critical, ...warnings], ['ci', 'pipeline', 'workflow', 'github actions']);
  const typeSafetyIssues = categorize([...critical, ...warnings], ['typescript', 'strict', 'type', '@types']);
  const envIssues = categorize([...critical, ...warnings], ['env', 'environment', 'secret', 'gitignore']);
  const lintFormatIssues = categorize([...critical, ...warnings], ['eslint', 'prettier', 'lint', 'format']);

  // Calculate category scores (start at 100, deduct for issues)
  // Critical issues: -20 points, Warning issues: -10 points
  const calcCategoryScore = (criticalCount: number, warningCount: number) => {
    return Math.max(0, 100 - (criticalCount * 20) - (warningCount * 10));
  };

  const testing = calcCategoryScore(
    categorize(critical, ['test', 'testing', 'jest', 'vitest', 'playwright']),
    categorize(warnings, ['test', 'testing', 'jest', 'vitest', 'playwright'])
  );

  const ci = calcCategoryScore(
    categorize(critical, ['ci', 'pipeline', 'workflow', 'github actions']),
    categorize(warnings, ['ci', 'pipeline', 'workflow', 'github actions'])
  );

  const typeSafety = calcCategoryScore(
    categorize(critical, ['typescript', 'strict', 'type', '@types']),
    categorize(warnings, ['typescript', 'strict', 'type', '@types'])
  );

  const envHygiene = calcCategoryScore(
    categorize(critical, ['env', 'environment', 'secret', 'gitignore']),
    categorize(warnings, ['env', 'environment', 'secret', 'gitignore'])
  );

  const lintFormat = calcCategoryScore(
    categorize(critical, ['eslint', 'prettier', 'lint', 'format']),
    categorize(warnings, ['eslint', 'prettier', 'lint', 'format'])
  );

  // Calculate weighted overall score
  // Testing: 25%, CI: 20%, Type Safety: 20%, Env: 15%, Lint/Format: 20%
  const overall = Math.round(
    testing * 0.25 +
    ci * 0.20 +
    typeSafety * 0.20 +
    envHygiene * 0.15 +
    lintFormat * 0.20
  );

  return {
    overall,
    security: envHygiene, // Map to legacy 'security' field
    quality: lintFormat,
    testing,
    ci,
    documentation: Math.max(0, 100 - categorize([...critical, ...warnings], ['readme', 'documentation', 'docs']) * 15)
  };
}

/**
 * Display health report in terminal
 */
function displayReport(report: DoctorReport) {
  // Overall health
  const healthColor = report.healthScore.overall >= 80 ? '🟢' : 
                      report.healthScore.overall >= 60 ? '🟡' : '🔴';
  
  console.log(`${healthColor} Project Health: ${report.healthScore.overall}/100`);
  console.log('');

  // Breakdown
  console.log('📊 Health Breakdown:');
  console.log(`   Security:      ${formatScore(report.healthScore.security)}`);
  console.log(`   Code Quality:  ${formatScore(report.healthScore.quality)}`);
  console.log(`   Testing:       ${formatScore(report.healthScore.testing)}`);
  console.log(`   CI/CD:         ${formatScore(report.healthScore.ci)}`);
  console.log(`   Documentation: ${formatScore(report.healthScore.documentation)}`);
  console.log('');

  // Critical issues
  if (report.critical.length > 0) {
    console.log(`🔴 Critical Issues (${report.critical.length}):`);
    report.critical.slice(0, 5).forEach(issue => {
      console.log(`   - ${issue.message}`);
    });
    if (report.critical.length > 5) {
      console.log(`   ... and ${report.critical.length - 5} more`);
    }
    console.log('');
  }

  // Warnings
  if (report.warnings.length > 0) {
    console.log(`🟡 Warnings (${report.warnings.length}):`);
    report.warnings.slice(0, 3).forEach(issue => {
      console.log(`   - ${issue.message}`);
    });
    if (report.warnings.length > 3) {
      console.log(`   ... and ${report.warnings.length - 3} more`);
    }
    console.log('');
  }

  // Good practices
  const goodCount = Math.max(0, 15 - report.critical.length - report.warnings.length);
  if (goodCount > 0) {
    console.log(`🟢 Good Practices (${goodCount}):`);
    console.log('   - Basic project structure present');
    if (report.healthScore.security > 80) console.log('   - Security measures in place');
    if (report.healthScore.testing > 80) console.log('   - Testing infrastructure present');
    if (report.healthScore.ci > 80) console.log('   - CI/CD pipeline configured');
    console.log('');
  }

  // Quick wins
  if (report.quickWins.length > 0) {
    console.log(`💡 Quick Wins (can fix in < 10 min):`);
    report.quickWins.slice(0, 5).forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue.message} → ${issue.estimatedFix}`);
    });
    console.log('');
  }

  // Next steps
  console.log('📋 Next Steps:');
  if (report.critical.length > 0) {
    console.log('   1. Address critical issues first');
  }
  if (report.quickWins.length > 0) {
    console.log('   2. Apply quick wins with: npm run doctor --fix');
  }
  console.log('   3. View full report: .devenv/health-report.json');
  console.log('   4. Generate action plan: node scripts/tools/plan-generator.js');
}

/**
 * Format score with color
 */
function formatScore(score: number): string {
  const bar = '█'.repeat(Math.floor(score / 10)) + '░'.repeat(10 - Math.floor(score / 10));
  const color = score >= 80 ? '🟢' : score >= 60 ? '🟡' : '🔴';
  return `${color} ${bar} ${score}/100`;
}

/**
 * Estimate fix time based on issue message
 */
function estimateFixTime(message: string): string {
  const lower = message.toLowerCase();
  
  if (lower.includes('.env.example') || lower.includes('add file')) {
    return '2 min';
  }
  if (lower.includes('strict mode') || lower.includes('enable')) {
    return '1 min';
  }
  if (lower.includes('eslint') || lower.includes('prettier')) {
    return '5 min';
  }
  if (lower.includes('testing') || lower.includes('framework')) {
    return '15 min';
  }
  if (lower.includes('ci') || lower.includes('pipeline')) {
    return '20 min';
  }
  
  return '10 min';
}

/**
 * Check if issue is a quick win (< 10 min to fix)
 */
function isQuickWin(message: string): boolean {
  const quickWinKeywords = [
    '.env.example',
    'strict mode',
    'eslint',
    'prettier',
    '.gitignore',
    'readme',
    'license'
  ];
  
  const lower = message.toLowerCase();
  return quickWinKeywords.some(keyword => lower.includes(keyword));
}

/**
 * Apply automatic fixes for quick wins
 */
async function applyQuickFixes(quickWins: Issue[], options: CliOptions): Promise<void> {
  let fixedCount = 0;

  for (const issue of quickWins) {
    const lower = issue.message.toLowerCase();

    if (options.dryRun) {
      console.log(`   [DRY RUN] Would fix: ${issue.message}`);
      continue;
    }

    try {
      // Add .env.example
      if (lower.includes('.env.example')) {
        await fs.writeFile('.env.example', `# Environment Variables
# Copy this file to .env and fill in your values

# Application
NODE_ENV=development
PORT=3000

# Database
# DATABASE_URL=

# API Keys
# API_KEY=
`);
        console.log('   ✓ Created .env.example');
        fixedCount++;
      }

      // Add .gitignore entry for .env
      if (lower.includes('.env') && lower.includes('gitignore')) {
        const gitignorePath = '.gitignore';
        let gitignoreContent = '';
        
        try {
          gitignoreContent = await fs.readFile(gitignorePath, 'utf8');
        } catch {
          // File doesn't exist, will create
        }

        if (!gitignoreContent.includes('.env')) {
          gitignoreContent += '\n# Environment variables\n.env\n.env.local\n';
          await fs.writeFile(gitignorePath, gitignoreContent);
          console.log('   ✓ Added .env to .gitignore');
          fixedCount++;
        }
      }

      // Enable TypeScript strict mode
      if (lower.includes('strict mode') && lower.includes('typescript')) {
        const tsconfigPath = 'tsconfig.json';
        
        try {
          const tsconfigContent = await fs.readFile(tsconfigPath, 'utf8');
          const tsconfig = JSON.parse(tsconfigContent);
          
          if (!tsconfig.compilerOptions) {
            tsconfig.compilerOptions = {};
          }
          
          tsconfig.compilerOptions.strict = true;
          
          await fs.writeFile(tsconfigPath, JSON.stringify(tsconfig, null, 2));
          console.log('   ✓ Enabled TypeScript strict mode');
          fixedCount++;
        } catch {
          // tsconfig doesn't exist or is invalid
        }
      }
    } catch (error: any) {
      console.error(`   ✗ Failed to fix: ${issue.message} - ${error.message}`);
    }
  }

  if (options.dryRun) {
    console.log(`\n📋 Would apply ${quickWins.length} fixes (dry run mode)`);
  } else {
    console.log(`\n✅ Applied ${fixedCount} automatic fixes`);
  }
}

// Parse CLI arguments
function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {
    fix: false,
    noInstall: false,
    dryRun: false,
    strict: false,
    json: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--fix':
        options.fix = true;
        break;
      case '--no-install':
        options.noInstall = true;
        break;
      case '--preset':
        const nextArg = args[i + 1];
        if (nextArg && ['nextjs', 'vite', 'express', 'vanilla'].includes(nextArg)) {
          options.preset = nextArg as any;
          i++; // Skip next arg
        } else {
          console.error('❌ Invalid preset. Use: nextjs, vite, express, or vanilla');
          process.exit(1);
        }
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--strict':
        options.strict = true;
        break;
      case '--json':
        options.json = true;
        break;
      case '--debug':
        options.debug = true;
        break;
      case '--integrate-cursor-rules':
        options.integrateCursorRules = true;
        break;
      case '--offline':
        options.offline = true;
        break;
      case '--fast':
      case '--shallow':
        options.mode = 'fast';
        break;
      case '--full':
        options.mode = 'full';
        break;
      case '--mode':
        if (args[i + 1] && (args[i + 1] === 'fast' || args[i + 1] === 'full')) {
          options.mode = args[i + 1] as 'fast' | 'full';
          i++;
        } else {
          console.error('❌ Invalid value for --mode. Use "fast" or "full".');
          process.exit(1);
        }
        break;
      case '--project-root':
        if (args[i + 1]) {
          options.projectRoot = args[i + 1];
          i++;
        } else {
          console.error('❌ Missing value for --project-root');
          process.exit(1);
        }
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        break;
      default:
        if (arg.startsWith('--project-root=')) {
          options.projectRoot = arg.split('=')[1];
        } else if (arg.startsWith('--mode=')) {
          const value = arg.split('=')[1];
          if (value === 'fast' || value === 'full') {
            options.mode = value as 'fast' | 'full';
          } else {
            console.error('❌ Invalid value for --mode. Use "fast" or "full".');
            process.exit(1);
          }
        } else if (!arg.startsWith('-') && !options.projectRoot) {
          // Positional project root (e.g., `npm run doctor -- ..`)
          options.projectRoot = arg;
        } else {
          console.error(`❌ Unknown option: ${arg}`);
          printHelp();
          process.exit(1);
        }
    }
  }

  return options;
}

function printHelp() {
  console.log(`
Development Environment Doctor - Health check and auto-fix tool

USAGE:
  npm run doctor [options]

OPTIONS:
  --fix              Apply automatic fixes to detected issues
  --no-install       Skip installing missing dependencies (use with --fix)
  --preset <type>    Override framework detection (nextjs|vite|express|vanilla)
  --dry-run          Show what would be fixed without applying changes
  --strict           Exit with code 1 on any warnings (useful for CI)
  --json             Output results in JSON format
  --fast             Run a shallow scan (skips some expensive checks)
  --full             Force a full scan (default)
  --mode <fast|full> Equivalent to --fast/--full for scripting
  --debug            Enable verbose logging (writes to stdout; avoid with --json)
  --offline          Disable network operations (prevents VPN interference)
  --project-root     Explicitly set the project root to analyze
  -h, --help         Show this help message

EXAMPLES:
  npm run doctor                          # Check project health
  npm run doctor --fix                    # Fix issues automatically
  npm run doctor --fix --no-install       # Fix but skip package installation
  npm run doctor --preset nextjs          # Override framework detection
  npm run doctor --dry-run                # Preview fixes
  npm run doctor --json                   # Machine-readable output
  npm run doctor --strict                 # Fail CI on any warnings
  npm run doctor --fast                   # Quick feedback loop (reduced coverage)
  npm run doctor --debug                  # Verbose logging for troubleshooting
  npm run doctor --offline                # Disable network operations (prevents VPN issues)
  npm run doctor --project-root ..        # Run from .devenv folder

WORKFLOW:
  1. Run 'npm run doctor' to see health score and issues
  2. Run 'npm run doctor --fix' to auto-fix simple issues
  3. Review changes and test
  4. Add --no-install if you want to install dependencies manually
`);
}

async function resolveProjectRoot(cwd: string, override?: string): Promise<{ projectRoot: string; autoDetected: boolean }> {
  const envOverride = process.env.DEVENV_PROJECT_ROOT;
  const requested = override || envOverride;
  let candidate = requested ? path.resolve(cwd, requested) : cwd;

  // Use enhanced path resolver for better detection
  try {
    const resolved = enhancedResolveProjectRoot(candidate);
    if (resolved !== candidate) {
      await ensurePathExists(resolved);
      return { projectRoot: resolved, autoDetected: true };
    }
  } catch {
    // Fallback to original logic if enhanced resolver fails
  }

  // Original fallback logic
  if (!requested && path.basename(candidate) === '.devenv') {
    const parent = path.dirname(candidate);
    if (parent && parent !== candidate) {
      candidate = parent;
      await ensurePathExists(candidate);
      return { projectRoot: candidate, autoDetected: true };
    }
  }

  await ensurePathExists(candidate);
  return { projectRoot: candidate, autoDetected: false };
}

async function ensurePathExists(targetPath: string) {
  try {
    await fs.access(targetPath);
  } catch {
    throw new Error(`Project root not found: ${targetPath}`);
  }
}

const options = parseArgs();

// Run doctor
runDoctor(options).catch(error => {
  console.error('❌ Doctor check failed:', error.message);
  process.exit(1);
});

