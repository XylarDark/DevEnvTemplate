#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { Command } = require('commander');

class MetricsLogger {
  constructor() {
    this.rootDir = path.resolve(__dirname, '../..');
    this.provenanceDir = path.join(this.rootDir, 'provenance');
  }

  async run() {
    const program = new Command()
      .name('metrics-log')
      .description('Log metrics for prompt lifecycle tracking')
      .requiredOption('-c, --ctx <file>', 'Context contract JSON file')
      .option('-i, --iterations <number>', 'Number of iterations required', '1')
      .option('-t, --time-valid <duration>', 'Time to reach valid implementation (e.g., "45m", "2h")')
      .option('--outcome <result>', 'Final outcome (success/failure/abandoned)', 'success')
      .option('--close', 'Mark prompt lifecycle as complete')
      .option('--phase <phase>', 'Current lifecycle phase (initiation/planning/execution/monitoring/closing)')
      .option('--notes <text>', 'Additional notes about the prompt session')
      .option('--list', 'List all logged metrics')
      .parse();

    const options = program.opts();

    try {
      // Ensure provenance directory exists
      await fs.mkdir(this.provenanceDir, { recursive: true });

      if (options.list) {
        await this.listMetrics();
        return;
      }

      const contextContract = await this.loadContextContract(options.ctx);
      const metrics = await this.buildMetrics(contextContract, options);

      await this.logMetrics(metrics);
      console.log(`✅ Metrics logged for ${contextContract.id}`);

    } catch (error) {
      console.error('❌ Metrics logging failed:', error.message);
      process.exit(1);
    }
  }

  async loadContextContract(filePath) {
    try {
      const fullPath = path.resolve(filePath);
      const content = await fs.readFile(fullPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to load context contract: ${error.message}`);
    }
  }

  async buildMetrics(contract, options) {
    const metrics = {
      timestamp: new Date().toISOString(),
      contextContractId: contract.id,
      phase: options.phase || this.inferPhase(options),
      iterations: parseInt(options.iterations) || 1,
      timeToValid: this.parseDuration(options.timeValid),
      outcome: options.outcome,
      lifecycleComplete: options.close || false,
      notes: options.notes || '',
      contract: {
        problemStatement: contract.problemStatement,
        goalCount: contract.goals?.length || 0,
        acceptanceTestCount: contract.acceptanceTests?.length || 0,
        stakeholderCount: contract.stakeholders?.length || 0
      },
      impact: {
        riskLevel: contract.impactAnalysis?.riskAssessment || 'unknown',
        predictedFiles: contract.impactAnalysis?.predictedFiles?.length || 0
      }
    };

    return metrics;
  }

  inferPhase(options) {
    if (options.close) return 'closing';
    if (options.timeValid) return 'monitoring';
    return 'execution';
  }

  parseDuration(durationStr) {
    if (!durationStr) return null;

    const match = durationStr.match(/^(\d+)([mhd])$/);
    if (!match) return null;

    const [, value, unit] = match;
    const numValue = parseInt(value);

    switch (unit) {
      case 'm': return numValue * 60 * 1000;        // minutes to milliseconds
      case 'h': return numValue * 60 * 60 * 1000;    // hours to milliseconds
      case 'd': return numValue * 24 * 60 * 60 * 1000; // days to milliseconds
      default: return null;
    }
  }

  async logMetrics(metrics) {
    const logFile = path.join(this.provenanceDir, 'prompt-metrics.jsonl');

    // Append to JSONL file
    const line = JSON.stringify(metrics) + '\n';
    await fs.appendFile(logFile, line, 'utf8');
  }

  async listMetrics() {
    const logFile = path.join(this.provenanceDir, 'prompt-metrics.jsonl');

    try {
      const content = await fs.readFile(logFile, 'utf8');
      const lines = content.trim().split('\n').filter(line => line.trim());

      if (lines.length === 0) {
        console.log('📊 No metrics logged yet');
        return;
      }

      console.log('📊 Prompt Metrics Summary:\n');

      const metricsByContract = {};

      for (const line of lines) {
        const metric = JSON.parse(line);
        const key = metric.contextContractId;

        if (!metricsByContract[key]) {
          metricsByContract[key] = [];
        }
        metricsByContract[key].push(metric);
      }

      Object.entries(metricsByContract).forEach(([contractId, metrics]) => {
        const latest = metrics[metrics.length - 1];
        const totalIterations = metrics.reduce((sum, m) => sum + m.iterations, 0);
        const avgTimeToValid = this.calculateAverageTime(metrics);

        console.log(`🔹 ${contractId}:`);
        console.log(`   Status: ${latest.lifecycleComplete ? '✅ Complete' : '🔄 In Progress'}`);
        console.log(`   Phase: ${latest.phase}`);
        console.log(`   Total Iterations: ${totalIterations}`);
        console.log(`   Average Time to Valid: ${this.formatDuration(avgTimeToValid)}`);
        console.log(`   Outcome: ${latest.outcome}`);
        console.log(`   Problem: ${latest.contract.problemStatement.substring(0, 60)}...`);
        console.log('');
      });

      console.log(`📈 Total prompts tracked: ${Object.keys(metricsByContract).length}`);
      console.log(`📄 Raw metrics file: ${logFile}`);

    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('📊 No metrics logged yet');
      } else {
        throw error;
      }
    }
  }

  calculateAverageTime(metrics) {
    const validTimes = metrics
      .filter(m => m.timeToValid)
      .map(m => m.timeToValid);

    if (validTimes.length === 0) return null;

    const sum = validTimes.reduce((a, b) => a + b, 0);
    return Math.round(sum / validTimes.length);
  }

  formatDuration(ms) {
    if (!ms) return 'N/A';

    if (ms < 60000) return '< 1m';
    if (ms < 3600000) return `${Math.round(ms / 60000)}m`;
    if (ms < 86400000) return `${Math.round(ms / 3600000)}h`;
    return `${Math.round(ms / 86400000)}d`;
  }
}

// Run the metrics logger
if (require.main === module) {
  const logger = new MetricsLogger();
  logger.run().catch(error => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = MetricsLogger;
