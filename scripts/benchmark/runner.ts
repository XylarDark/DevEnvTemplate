// scripts/benchmark/runner.ts

import { CleanupEngine } from '../cleanup/engine';
import {
  BenchmarkConfig,
  BenchmarkResult,
  BenchmarkStats,
  BenchmarkThroughput,
  BenchmarkMemory,
  RegressionResult,
  BenchmarkHistoryEntry,
} from '../types/benchmark';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Benchmark runner for CleanupEngine performance testing
 */
export class BenchmarkRunner {
  /**
   * Run a single benchmark configuration
   */
  async runBenchmark(config: BenchmarkConfig): Promise<BenchmarkResult> {
    const times: number[] = [];
    const heapUsages: number[] = [];
    let totalFiles = 0;
    let totalBytes = 0;

    for (let i = 0; i < config.iterations; i++) {
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const startMem = process.memoryUsage().heapUsed;
      const startTime = Date.now();

      const engine = new CleanupEngine({
        workingDir: config.fixture,
        ...config.options,
      });

      const report = await engine.execute();

      const endTime = Date.now();
      const endMem = process.memoryUsage().heapUsed;

      times.push(endTime - startTime);
      heapUsages.push(endMem - startMem);

      // Collect file/byte counts from first iteration
      if (i === 0) {
        totalFiles = report.summary.filesDeleted;
        totalBytes = await this.calculateTotalBytes(config.fixture);
      }
    }

    const stats = this.calculateStats(times);
    const avgTime = stats.mean / 1000; // convert to seconds

    return {
      name: config.name,
      timestamp: new Date().toISOString(),
      iterations: config.iterations,
      stats,
      throughput: {
        filesPerSecond: totalFiles / avgTime,
        bytesPerSecond: totalBytes / avgTime,
      },
      memory: {
        peakHeap: Math.max(...heapUsages),
        avgHeap: heapUsages.reduce((a, b) => a + b, 0) / heapUsages.length,
      },
      options: config.options,
    };
  }

  /**
   * Run multiple benchmark configurations and compare results
   */
  async runComparison(configs: BenchmarkConfig[]): Promise<BenchmarkResult[]> {
    const results: BenchmarkResult[] = [];

    for (const config of configs) {
      console.log(`\nRunning benchmark: ${config.name}...`);
      const result = await this.runBenchmark(config);
      results.push(result);
      
      console.log(`  Mean: ${result.stats.mean.toFixed(2)}ms`);
      console.log(`  Median: ${result.stats.median.toFixed(2)}ms`);
      console.log(`  StdDev: ${result.stats.stdDev.toFixed(2)}ms`);
    }

    return results;
  }

  /**
   * Save benchmark results to file
   */
  async saveResults(results: BenchmarkResult[], outputPath: string): Promise<void> {
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(results, null, 2));
  }

  /**
   * Load historical benchmark results
   */
  async loadHistory(historyPath: string): Promise<BenchmarkResult[]> {
    try {
      const content = await fs.readFile(historyPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return [];
    }
  }

  /**
   * Detect performance regression by comparing current results with history
   */
  async detectRegression(
    current: BenchmarkResult,
    history: BenchmarkResult[],
    threshold: number = 10
  ): Promise<RegressionResult> {
    if (history.length === 0) {
      return {
        detected: false,
        threshold,
        percentChange: 0,
        current: current.stats,
        baseline: current.stats,
      };
    }

    // Find most recent baseline with same configuration
    const baseline = history
      .filter(h => this.isSameConfig(h.options, current.options))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    if (!baseline) {
      return {
        detected: false,
        threshold,
        percentChange: 0,
        current: current.stats,
        baseline: current.stats,
      };
    }

    const percentChange = ((current.stats.mean - baseline.stats.mean) / baseline.stats.mean) * 100;

    return {
      detected: percentChange > threshold,
      threshold,
      percentChange,
      current: current.stats,
      baseline: baseline.stats,
    };
  }

  /**
   * Calculate statistical metrics from array of times
   */
  private calculateStats(times: number[]): BenchmarkStats {
    const sorted = [...times].sort((a, b) => a - b);
    const mean = times.reduce((a, b) => a + b, 0) / times.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const min = sorted[0];
    const max = sorted[sorted.length - 1];

    // Calculate standard deviation
    const variance = times.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / times.length;
    const stdDev = Math.sqrt(variance);

    return { mean, median, min, max, stdDev };
  }

  /**
   * Calculate total bytes in fixture directory
   */
  private async calculateTotalBytes(fixturePath: string): Promise<number> {
    let total = 0;

    async function walk(dir: string): Promise<void> {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          await walk(fullPath);
        } else {
          const stats = await fs.stat(fullPath);
          total += stats.size;
        }
      }
    }

    await walk(fixturePath);
    return total;
  }

  /**
   * Check if two configurations are the same
   */
  private isSameConfig(a: any, b: any): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  /**
   * Format benchmark results as a comparison table
   */
  formatComparisonTable(results: BenchmarkResult[]): string {
    if (results.length === 0) return 'No results to display';

    const baseline = results[0];
    let table = '| Benchmark | Mean (ms) | Median (ms) | Min (ms) | Max (ms) | StdDev (ms) | vs Baseline |\n';
    table += '|-----------|-----------|-------------|----------|----------|-------------|-------------|\n';

    for (const result of results) {
      const speedup = baseline.stats.mean / result.stats.mean;
      const vsBaseline = result === baseline ? '-' : `${speedup.toFixed(2)}x`;

      table += `| ${result.name} `;
      table += `| ${result.stats.mean.toFixed(2)} `;
      table += `| ${result.stats.median.toFixed(2)} `;
      table += `| ${result.stats.min.toFixed(2)} `;
      table += `| ${result.stats.max.toFixed(2)} `;
      table += `| ${result.stats.stdDev.toFixed(2)} `;
      table += `| ${vsBaseline} |\n`;
    }

    return table;
  }
}

