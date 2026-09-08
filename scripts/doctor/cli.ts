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
import type { Gap, GapReport, GapSeverity } from '../types/gaps';
import type { QuickWinContext } from './quick-wins';

/** Scored dimensions. `overall` is the weighted roll-up of the rest. */
interface HealthScore {
  overall: number;
  security: number;
  quality: number;
  testing: number;
  ci: number;
  typeSafety: number;
  documentation: number;
}

type ScoredDimension = Exclude<keyof HealthScore, 'overall'>;

interface Issue {
  severity: 'critical' | 'warning' | 'info';
  category: string;
  message: string;
  estimatedFix: string;
  /** Dimension this issue was scored against, so a report can be audited. */
  dimension?: ScoredDimension;
}

interface DoctorReport {
  timestamp: string;
  healthScore: HealthScore;
  critical: Issue[];
  warnings: Issue[];
  info: Issue[];
  quickWins: Issue[];
  /**
   * Gap categories with no entry in the scoring config. Surfaced rather than dropped so a new
   * analyzer category cannot silently stop affecting the score.
   */
  unscoredCategories: string[];
}

/** Scoring configuration, loaded from config/quality-budgets.json. */
interface HealthScoreConfig {
  penalties: Record<GapSeverity, number>;
  weights: Partial<Record<ScoredDimension, number>>;
  categoryMap: Record<string, ScoredDimension>;
}

/**
 * Fallback scoring configuration.
 *
 * Kept in sync with the `healthScore` block of config/quality-budgets.json and used when the
 * doctor runs against a project that has no config of its own.
 */
const DEFAULT_HEALTH_SCORE_CONFIG: HealthScoreConfig = {
  penalties: { high: 20, medium: 10, low: 0 },
  weights: { testing: 0.25, ci: 0.2, typeSafety: 0.2, quality: 0.2, security: 0.15 },
  categoryMap: {
    testing: 'testing',
    ci: 'ci',
    'git-hooks': 'ci',
    git: 'ci',
    typescript: 'typeSafety',
    linting: 'quality',
    quality: 'quality',
    architecture: 'quality',
    performance: 'quality',
    accessibility: 'quality',
    security: 'security',
    environment: 'security',
    dependencies: 'security',
    docker: 'security',
    documentation: 'documentation',
    observability: 'documentation',
  },
};

/** Maps analyzer gap severity onto the doctor's issue severity. */
const SEVERITY_TO_ISSUE: Record<GapSeverity, Issue['severity']> = {
  high: 'critical',
  medium: 'warning',
  low: 'info',
};

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
    console.log(
      `ℹ️ Detected embedded .devenv folder. Analyzing parent project: ${projectRoot}\n`
    );
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
      env: { ...process.env },
    });
    stackData = JSON.parse(stackOutput);
    const profiles =
      Array.isArray(stackData.profiles) && stackData.profiles.length > 0
        ? stackData.profiles
        : ['agnostic'];
    if (!options.json) {
      console.log(`Stack profile${profiles.length > 1 ? 's' : ''}: ${profiles.join(', ')}`);
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
      console.error(
        '   Make sure you are running from the project root or use --project-root flag.'
      );
    }
    process.exit(1);
  }

  // Step 1.5: Integrate cursor rules if requested or if needed
  if (
    options.integrateCursorRules ||
    (stackData.cursorRules && stackData.cursorRules.needsIntegration)
  ) {
    if (!options.json) {
      console.log('📋 Integrating Cursor rules...');
    }

    try {
      // Find .cursor/rules path within .devenv (self-contained)
      // Check .devenv/.cursor/rules relative to project root and __dirname relative paths
      let templateRulesPath: string | null = null;
      const possiblePaths = [
        path.join(workingDir, '.devenv', '.cursor', 'rules'),
        path.join(__dirname, '../../../.cursor/rules'),
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
          dryRun: options.dryRun || false,
        });

        if (!options.json) {
          if (integrationResult.copied.length > 0) {
            console.log(`  ✓ Copied ${integrationResult.copied.length} file(s)`);
          }
          if (integrationResult.skipped.length > 0) {
            console.log(
              `  ✓ Kept ${integrationResult.skipped.length} existing file(s) unchanged`
            );
          }
          if (integrationResult.preserved.length > 0) {
            console.log(
              `  ✓ Preserved ${integrationResult.preserved.length} project-specific rule file(s)`
            );
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
        console.error(`   Warning: failed to integrate cursor rules: ${error.message}`);
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
  let gapReport: GapReport;

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
    // Capture rather than inherit: the analyzer prints its full markdown report to stdout, which
    // would bury the health summary. The report is still written to .devenv/gaps-report.md.
    execSync(gapCommand, {
      cwd: workingDir,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', options.debug ? 'inherit' : 'pipe'],
      env: { ...process.env },
    });

    // Read the structured report. The markdown sibling is for humans only.
    const gapsJsonPath = path.join(reportDir, 'gaps-report.json');

    if (!existsSync(gapsJsonPath)) {
      throw new Error(
        `${path.relative(workingDir, gapsJsonPath)} was not produced. ` +
          'Rebuild the tools (npm run build) so the gap analyzer emits structured output.'
      );
    }

    gapReport = JSON.parse(await fs.readFile(gapsJsonPath, 'utf8')) as GapReport;

    if (!Array.isArray(gapReport.gaps)) {
      throw new Error(`${path.relative(workingDir, gapsJsonPath)} has no 'gaps' array.`);
    }
  } catch (error: any) {
    console.error('❌ Failed to analyze gaps:', error.message);
    process.exit(1);
  }

  // Step 3: Score the gaps
  if (!options.json) {
    console.log('📊 Calculating health score...\n');
  }
  const healthScoreConfig = await loadHealthScoreConfig(workingDir);
  const report = buildDoctorReport(gapReport, healthScoreConfig);

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
    await applyQuickFixes(workingDir, stackData, options);
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
 * Load scoring configuration, falling back to the built-in defaults.
 *
 * A project may override weights and penalties in config/quality-budgets.json. A malformed or
 * absent config must not fail the run, but a malformed one is reported so it is not silently
 * ignored.
 */
async function loadHealthScoreConfig(workingDir: string): Promise<HealthScoreConfig> {
  const candidatePaths = [
    path.join(workingDir, 'config', 'quality-budgets.json'),
    path.join(__dirname, '../../../config/quality-budgets.json'),
  ];

  for (const candidate of candidatePaths) {
    if (!existsSync(candidate)) {
      continue;
    }

    try {
      const parsed = JSON.parse(await fs.readFile(candidate, 'utf8'));
      const configured = parsed?.healthScore;

      if (!configured) {
        continue;
      }

      return {
        penalties: { ...DEFAULT_HEALTH_SCORE_CONFIG.penalties, ...(configured.penalties || {}) },
        weights: { ...DEFAULT_HEALTH_SCORE_CONFIG.weights, ...(configured.weights || {}) },
        categoryMap: {
          ...DEFAULT_HEALTH_SCORE_CONFIG.categoryMap,
          ...(configured.categoryMap || {}),
        },
      };
    } catch (error: any) {
      console.error(
        `   Warning: ignoring malformed healthScore config in ${candidate}: ${error.message}`
      );
    }
  }

  return DEFAULT_HEALTH_SCORE_CONFIG;
}

/**
 * Convert the analyzer's structured report into a doctor report.
 *
 * Consumes `.devenv/gaps-report.json` rather than re-parsing the human markdown. The markdown
 * groups gaps by category and encodes severity only as an emoji inside a heading, so parsing it
 * cannot recover severity reliably.
 */
function buildDoctorReport(gapReport: GapReport, config: HealthScoreConfig): DoctorReport {
  const critical: Issue[] = [];
  const warnings: Issue[] = [];
  const info: Issue[] = [];
  const quickWins: Issue[] = [];
  const unscoredCategories = new Set<string>();

  for (const gap of gapReport.gaps || []) {
    const dimension = config.categoryMap[gap.category];

    if (!dimension) {
      unscoredCategories.add(gap.category);
    }

    const issue: Issue = {
      severity: SEVERITY_TO_ISSUE[gap.severity] || 'info',
      category: gap.category,
      message: gap.title,
      estimatedFix: estimateFixTime(gap),
      ...(dimension ? { dimension } : {}),
    };

    if (issue.severity === 'critical') {
      critical.push(issue);
    } else if (issue.severity === 'warning') {
      warnings.push(issue);
    } else {
      info.push(issue);
    }

    if (isQuickWin(gap)) {
      quickWins.push(issue);
    }
  }

  return {
    timestamp: new Date().toISOString(),
    healthScore: calculateHealthScore(gapReport.gaps || [], config),
    critical,
    warnings,
    info,
    quickWins,
    unscoredCategories: [...unscoredCategories].sort(),
  };
}

/**
 * Calculate per-dimension and overall health scores.
 *
 * Each dimension starts at 100 and loses the configured penalty for every gap routed to it by
 * `categoryMap`. `overall` is the weighted mean of the weighted dimensions; dimensions without a
 * weight (documentation, by default) are reported but do not move `overall`.
 *
 * Routing is driven by the analyzer's own `category` field. The previous implementation matched
 * keywords against the category *and* the message, so a single gap could be penalized in several
 * dimensions at once.
 */
function calculateHealthScore(gaps: Gap[], config: HealthScoreConfig): HealthScore {
  const dimensions: ScoredDimension[] = [
    'security',
    'quality',
    'testing',
    'ci',
    'typeSafety',
    'documentation',
  ];

  const penaltyByDimension = new Map<ScoredDimension, number>(
    dimensions.map(dimension => [dimension, 0])
  );

  for (const gap of gaps) {
    const dimension = config.categoryMap[gap.category];

    if (!dimension || !penaltyByDimension.has(dimension)) {
      continue;
    }

    const penalty = config.penalties[gap.severity] ?? 0;
    penaltyByDimension.set(dimension, penaltyByDimension.get(dimension)! + penalty);
  }

  const scoreFor = (dimension: ScoredDimension) =>
    Math.max(0, Math.min(100, 100 - penaltyByDimension.get(dimension)!));

  const scores = {
    security: scoreFor('security'),
    quality: scoreFor('quality'),
    testing: scoreFor('testing'),
    ci: scoreFor('ci'),
    typeSafety: scoreFor('typeSafety'),
    documentation: scoreFor('documentation'),
  };

  // Normalize by the weights actually present so a partial config cannot deflate the overall.
  let weightedTotal = 0;
  let weightSum = 0;

  for (const dimension of dimensions) {
    const weight = config.weights[dimension];

    if (typeof weight === 'number' && weight > 0) {
      weightedTotal += scores[dimension] * weight;
      weightSum += weight;
    }
  }

  const overall = weightSum > 0 ? Math.round(weightedTotal / weightSum) : 100;

  return { overall, ...scores };
}

/**
 * Display health report in terminal
 */
function displayReport(report: DoctorReport) {
  // Overall health
  const healthColor =
    report.healthScore.overall >= 80 ? '🟢' : report.healthScore.overall >= 60 ? '🟡' : '🔴';

  console.log(`${healthColor} Project Health: ${report.healthScore.overall}/100`);
  console.log('');

  // Breakdown
  console.log('📊 Health Breakdown:');
  console.log(`   Security:      ${formatScore(report.healthScore.security)}`);
  console.log(`   Code Quality:  ${formatScore(report.healthScore.quality)}`);
  console.log(`   Testing:       ${formatScore(report.healthScore.testing)}`);
  console.log(`   CI/CD:         ${formatScore(report.healthScore.ci)}`);
  console.log(`   Type Safety:   ${formatScore(report.healthScore.typeSafety)}`);
  console.log(`   Documentation: ${formatScore(report.healthScore.documentation)}`);
  console.log('');

  if (report.unscoredCategories.length > 0) {
    console.log(
      '⚠️  Gap categories missing from the scoring config (not reflected in the score):'
    );
    console.log(`   ${report.unscoredCategories.join(', ')}`);
    console.log('   Add them to healthScore.categoryMap in config/quality-budgets.json.');
    console.log('');
  }

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
    console.log('   2. Apply quick wins with: npm run doctor -- --fix');
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

/** Human-readable fix estimate, derived from the analyzer's own effort rating. */
const EFFORT_TO_ESTIMATE: Record<Gap['effort'], string> = {
  low: '< 10 min',
  medium: '~1 hour',
  high: '> 1 day',
};

function estimateFixTime(gap: Gap): string {
  return EFFORT_TO_ESTIMATE[gap.effort] || '~1 hour';
}

/**
 * A gap counts as a quick win when the analyzer rated it low effort.
 *
 * This replaces a keyword list that matched issue text, which both missed low-effort gaps whose
 * wording did not contain a keyword and promoted high-effort gaps that happened to mention one.
 */
function isQuickWin(gap: Gap): boolean {
  return gap.effort === 'low';
}

/**
 * Build the filesystem context the quick-win registry operates through.
 *
 * All paths are resolved against `rootDir` so a fix cannot write outside the analyzed project.
 */
function createQuickWinContext(rootDir: string, stack: any, packageJson: any): QuickWinContext {
  const resolve = (relativePath: string) => {
    const absolutePath = path.resolve(rootDir, relativePath);

    if (absolutePath !== rootDir && !absolutePath.startsWith(rootDir + path.sep)) {
      throw new Error(`Refusing to touch a path outside the project: ${relativePath}`);
    }

    return absolutePath;
  };

  return {
    rootDir,
    stack,
    packageJson,
    hasFile: async (relativePath: string) => existsSync(resolve(relativePath)),
    readFile: (relativePath: string) => fs.readFile(resolve(relativePath), 'utf8'),
    writeFile: async (relativePath: string, content: string) => {
      const absolutePath = resolve(relativePath);
      await fs.mkdir(path.dirname(absolutePath), { recursive: true });
      await fs.writeFile(absolutePath, content);
    },
    updateJson: async (relativePath: string, updater: (obj: any) => any) => {
      const absolutePath = resolve(relativePath);
      const existing = existsSync(absolutePath)
        ? JSON.parse(await fs.readFile(absolutePath, 'utf8'))
        : {};
      await fs.writeFile(absolutePath, `${JSON.stringify(updater(existing), null, 2)}\n`);
    },
  };
}

/**
 * Apply automatic fixes using the quick-win registry.
 *
 * Each registry entry pairs a detection check with a fix, so detection runs against the actual
 * filesystem rather than against the wording of a gap title.
 */
async function applyQuickFixes(
  workingDir: string,
  stackData: any,
  options: CliOptions
): Promise<void> {
  const { getApplicableQuickWins } = await import('./quick-wins');

  const packageJsonPath = path.join(workingDir, 'package.json');
  let packageJson: any;

  if (existsSync(packageJsonPath)) {
    try {
      packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
    } catch (error: any) {
      console.error(`   Warning: could not read package.json: ${error.message}`);
    }
  }

  // The --preset flag overrides detected framework so a fix can be forced for a known target.
  const stack = options.preset
    ? { ...stackData, frameworks: { ...(stackData?.frameworks || {}), type: options.preset } }
    : stackData;

  const context = createQuickWinContext(workingDir, stack, packageJson);
  const applicable = await getApplicableQuickWins(context);

  if (applicable.length === 0) {
    console.log('   Nothing to fix - no applicable quick wins detected.');
    return;
  }

  let fixedCount = 0;
  let skippedCount = 0;

  for (const quickWin of applicable) {
    if (!quickWin.autoFixable || !quickWin.fixAction) {
      console.log(`   → ${quickWin.title} (manual, ${quickWin.estimatedTime})`);
      skippedCount++;
      continue;
    }

    if (options.noInstall && /install|dependenc/i.test(quickWin.description)) {
      console.log(`   → ${quickWin.title} (skipped, --no-install)`);
      skippedCount++;
      continue;
    }

    if (options.dryRun) {
      console.log(`   [DRY RUN] Would fix: ${quickWin.title}`);
      continue;
    }

    try {
      const result = await quickWin.fixAction(context);

      if (result.success) {
        console.log(`   ✓ ${result.message}`);
        fixedCount++;
      } else {
        console.error(`   ✗ ${quickWin.title}: ${result.error || result.message}`);
      }
    } catch (error: any) {
      console.error(`   ✗ ${quickWin.title}: ${error.message}`);
    }
  }

  if (options.dryRun) {
    console.log(`\n📋 Would apply ${applicable.length} fixes (dry run mode)`);
    return;
  }

  console.log(`\n✅ Applied ${fixedCount} automatic fixes`);

  if (skippedCount > 0) {
    console.log(`ℹ️  ${skippedCount} quick win(s) need manual attention.`);
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
    json: false,
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
      case '--preset': {
        const nextArg = args[i + 1];
        if (nextArg && ['nextjs', 'vite', 'express', 'vanilla'].includes(nextArg)) {
          options.preset = nextArg as any;
          i++; // Skip next arg
        } else {
          console.error('❌ Invalid preset. Use: nextjs, vite, express, or vanilla');
          process.exit(1);
        }
        break;
      }
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
  Pass flags after '--' so npm forwards them to the doctor instead of consuming them.

  npm run doctor                             # Check project health
  npm run doctor -- --fix                    # Fix issues automatically
  npm run doctor -- --fix --no-install       # Fix but skip package installation
  npm run doctor -- --preset nextjs          # Override framework detection
  npm run doctor -- --dry-run                # Preview fixes
  npm run doctor -- --json                   # Machine-readable output
  npm run doctor -- --strict                 # Fail CI on any warnings
  npm run doctor -- --fast                   # Quick feedback loop (reduced coverage)
  npm run doctor -- --debug                  # Verbose logging for troubleshooting
  npm run doctor -- --offline                # Disable network operations (prevents VPN issues)
  npm run doctor -- --project-root ..        # Run from .devenv folder

WORKFLOW:
  1. Run 'npm run doctor' to see health score and issues
  2. Run 'npm run doctor -- --fix' to auto-fix simple issues
  3. Review changes and test
  4. Add --no-install if you want to install dependencies manually
`);
}

async function resolveProjectRoot(
  cwd: string,
  override?: string
): Promise<{ projectRoot: string; autoDetected: boolean }> {
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

// Only run when invoked directly, so the scoring functions below can be unit-tested.
if (require.main === module) {
  const options = parseArgs();

  runDoctor(options).catch(error => {
    console.error('❌ Doctor check failed:', error.message);
    process.exit(1);
  });
}

export {
  buildDoctorReport,
  calculateHealthScore,
  loadHealthScoreConfig,
  runDoctor,
  DEFAULT_HEALTH_SCORE_CONFIG,
};
export type { DoctorReport, HealthScore, HealthScoreConfig, Issue, ScoredDimension };
