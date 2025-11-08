#!/usr/bin/env node

/**
 * DevEnvTemplate Doctor Mode
 * 
 * Acts as a "doctor" for your development environment:
 * - Diagnoses issues (stack-detector)
 * - Prescribes solutions (gap-analyzer)
 * - Generates treatment plan (plan-generator)
 * - Shows health score
 */

import { promises as fs } from 'fs';
import path from 'path';
import { execSync } from 'child_process';

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

/**
 * Main doctor command
 */
async function runDoctor(options: { fix?: boolean; json?: boolean } = {}) {
  console.log('🏥 DevEnvTemplate Health Check\n');

  const workingDir = process.cwd();
  const reportDir = path.join(workingDir, '.devenv');
  
  // Ensure .devenv directory exists
  await fs.mkdir(reportDir, { recursive: true });

  // Step 1: Run stack detector
  console.log('🔍 Analyzing project stack...');
  const stackDetectorPath = path.join(__dirname, '../../.github/tools/stack-detector.js');
  let stackData: any;
  
  try {
    const stackOutput = execSync(`node "${stackDetectorPath}"`, {
      cwd: workingDir,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    stackData = JSON.parse(stackOutput);
  } catch (error: any) {
    console.error('❌ Failed to detect stack:', error.message);
    process.exit(1);
  }

  // Step 2: Run gap analyzer
  console.log('🔬 Identifying gaps and issues...');
  const gapAnalyzerPath = path.join(__dirname, '../../.github/tools/gap-analyzer.js');
  let gapsReport: string;
  
  try {
    execSync(`node "${gapAnalyzerPath}"`, {
      cwd: workingDir,
      encoding: 'utf8',
      stdio: 'inherit'
    });
    
    // Read the generated report
    const gapsReportPath = path.join(reportDir, 'gaps-report.md');
    gapsReport = await fs.readFile(gapsReportPath, 'utf8');
  } catch (error: any) {
    console.error('❌ Failed to analyze gaps:', error.message);
    process.exit(1);
  }

  // Step 3: Parse gaps and calculate health score
  console.log('📊 Calculating health score...\n');
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
  
  console.log(`\n💾 Full report saved: ${path.relative(workingDir, reportPath)}`);

  // Step 6: Auto-fix if requested
  if (options.fix) {
    console.log('\n🔧 Applying automatic fixes...');
    await applyQuickFixes(report.quickWins);
  }

  // Exit with error code if critical issues found
  if (report.critical.length > 0) {
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
 * Calculate health scores
 */
function calculateHealthScore(
  critical: Issue[],
  warnings: Issue[],
  info: Issue[]
): HealthScore {
  // Start with perfect score
  let overall = 100;

  // Deduct for issues
  overall -= critical.length * 15; // Critical: -15 each
  overall -= warnings.length * 5;  // Warning: -5 each
  overall -= info.length * 1;      // Info: -1 each

  // Floor at 0
  overall = Math.max(0, overall);

  // Calculate category scores (simplified)
  const categorize = (issues: Issue[], category: string) =>
    issues.filter(i => 
      i.category.toLowerCase().includes(category) ||
      i.message.toLowerCase().includes(category)
    ).length;

  const securityIssues = categorize([...critical, ...warnings], 'security');
  const qualityIssues = categorize([...critical, ...warnings], 'linting') + 
                        categorize([...critical, ...warnings], 'typescript');
  const testingIssues = categorize([...critical, ...warnings], 'test');
  const ciIssues = categorize([...critical, ...warnings], 'ci') +
                   categorize([...critical, ...warnings], 'pipeline');
  const docIssues = categorize([...critical, ...warnings], 'readme') +
                    categorize([...critical, ...warnings], 'documentation');

  return {
    overall,
    security: Math.max(0, 100 - securityIssues * 20),
    quality: Math.max(0, 100 - qualityIssues * 15),
    testing: Math.max(0, 100 - testingIssues * 20),
    ci: Math.max(0, 100 - ciIssues * 25),
    documentation: Math.max(0, 100 - docIssues * 15)
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
  console.log('   4. Generate action plan: node .github/tools/plan-generator.js');
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
async function applyQuickFixes(quickWins: Issue[]): Promise<void> {
  let fixedCount = 0;

  for (const issue of quickWins) {
    const lower = issue.message.toLowerCase();

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

  console.log(`\n✅ Applied ${fixedCount} automatic fixes`);
}

// Parse CLI arguments
const args = process.argv.slice(2);
const options = {
  fix: args.includes('--fix'),
  json: args.includes('--json')
};

// Run doctor
runDoctor(options).catch(error => {
  console.error('❌ Doctor check failed:', error.message);
  process.exit(1);
});

