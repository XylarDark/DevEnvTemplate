#!/usr/bin/env node

/**
 * CI Metrics Logger - CI-only utility
 *
 * Logs per-PR metrics for DevEnvTemplate Plan/Agent workflow.
 * Used by CI to track development efficiency and process improvement.
 */

const fs = require('fs').promises;
const path = require('path');

class CIMetricsLogger {
  constructor() {
    this.rootDir = process.cwd();
    this.metricsFile = 'metrics.jsonl';
    this.prNumber = process.env.GITHUB_EVENT_NUMBER || process.env.GITHUB_PR_NUMBER;
    this.runId = process.env.GITHUB_RUN_ID;
    this.sha = process.env.GITHUB_SHA;
    this.repo = process.env.GITHUB_REPOSITORY;
  }

  async logMetrics(contextFiles, impactResults, validationResults) {
    console.log('📊 Logging CI metrics...');

    const metrics = {
      timestamp: new Date().toISOString(),
      type: 'ci-run',
      pr: {
        number: this.prNumber,
        sha: this.sha,
        repo: this.repo,
        runId: this.runId
      },
      context: {
        contractsFound: contextFiles?.length || 0,
        contractsValidated: validationResults?.valid || 0,
        highRiskAssumptions: validationResults?.highRiskAssumptions?.length || 0
      },
      impact: {
        predictionsGenerated: impactResults?.length || 0,
        totalPredictedFiles: impactResults?.reduce((sum, r) => sum + (r.predictedFiles?.length || 0), 0) || 0,
        riskLevels: this.summarizeRiskLevels(impactResults)
      },
      validation: {
        planGatePassed: validationResults?.planGatePassed || false,
        impactValidationPassed: validationResults?.impactValidationPassed || false,
        contextValidationPassed: validationResults?.contextValidationPassed || false
      },
      guards: {
        strictPlanGuard: process.env.STRICT_PLAN_GUARD === 'true',
        impactGuard: process.env.IMPACT_GUARD || 'disabled'
      }
    };

    // Calculate derived metrics
    metrics.efficiency = this.calculateEfficiency(metrics);
    metrics.quality = this.calculateQuality(metrics);

    await this.appendMetrics(metrics);
    console.log(`✅ Metrics logged to ${this.metricsFile}`);

    return metrics;
  }

  summarizeRiskLevels(impactResults) {
    const levels = { low: 0, medium: 0, high: 0, critical: 0, unknown: 0 };

    if (impactResults) {
      impactResults.forEach(result => {
        const level = result.riskLevel || 'unknown';
        levels[level] = (levels[level] || 0) + 1;
      });
    }

    return levels;
  }

  calculateEfficiency(metrics) {
    // Efficiency score based on validation success and automation usage
    let score = 0;

    if (metrics.validation.planGatePassed) score += 25;
    if (metrics.validation.impactValidationPassed) score += 25;
    if (metrics.validation.contextValidationPassed) score += 25;
    if (metrics.context.contractsFound > 0) score += 25;

    return Math.min(100, score);
  }

  calculateQuality(metrics) {
    // Quality score based on risk levels and validation rigor
    let score = 100;

    // Deduct for high-risk assumptions
    score -= (metrics.context.highRiskAssumptions || 0) * 10;

    // Deduct for high/critical risk predictions
    const highRiskCount = (metrics.impact.riskLevels.high || 0) + (metrics.impact.riskLevels.critical || 0);
    score -= highRiskCount * 5;

    // Bonus for using strict guards
    if (metrics.guards.strictPlanGuard) score += 10;
    if (metrics.guards.impactGuard === 'strict' || metrics.guards.impactGuard === 'warn') score += 5;

    return Math.max(0, Math.min(100, score));
  }

  async appendMetrics(metrics) {
    const line = JSON.stringify(metrics) + '\n';

    try {
      await fs.appendFile(this.metricsFile, line, 'utf8');
    } catch (error) {
      // If file doesn't exist, create it
      await fs.writeFile(this.metricsFile, line, 'utf8');
    }
  }

  async getRecentMetrics(days = 30) {
    try {
      const content = await fs.readFile(this.metricsFile, 'utf8');
      const lines = content.trim().split('\n');

      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);

      return lines
        .map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter(entry => entry && new Date(entry.timestamp) >= cutoff);
    } catch {
      return [];
    }
  }
}

// CLI interface for CI
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node metrics-log-ci.js [context-files...]');
    console.error('Environment variables: GITHUB_* variables will be automatically captured');
    process.exit(1);
  }

  const logger = new CIMetricsLogger();

  // Mock validation results for now (in real CI these would be passed from previous steps)
  const mockResults = {
    valid: args.length,
    highRiskAssumptions: [],
    planGatePassed: process.env.STRICT_PLAN_GUARD !== 'true' || Math.random() > 0.5, // Mock
    impactValidationPassed: Math.random() > 0.3, // Mock
    contextValidationPassed: Math.random() > 0.2 // Mock
  };

  // Mock impact results
  const mockImpactResults = args.map((file, i) => ({
    contractId: path.basename(file, '.json'),
    predictedFiles: [`src/components/${i + 1}`, `src/lib/${i + 1}`],
    riskLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
    rationale: 'Mock prediction for testing'
  }));

  const metrics = await logger.logMetrics(args, mockImpactResults, mockResults);
  console.log('Metrics summary:', JSON.stringify(metrics, null, 2));
}

// Export for testing
if (require.main === module) {
  main().catch(error => {
    console.error('Metrics logging failed:', error);
    process.exit(1);
  });
}

module.exports = CIMetricsLogger;
