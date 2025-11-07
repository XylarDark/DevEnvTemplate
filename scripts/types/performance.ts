// scripts/types/performance.ts

/**
 * Type definitions for performance tracking
 */

export interface PerformanceMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  filesProcessed: number;
  filesScanned: number;
  bytesProcessed: number;
  cacheHits: number;
  cacheMisses: number;
  rulesExecuted: number;
  errors: number;
  parallelEnabled?: boolean;
  concurrency?: number;
  batchCount?: number;
  memoryUsage?: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
}

export interface RuleMetrics {
  ruleId: string;
  executionCount: number;
  totalDuration: number;
  averageDuration: number;
  filesAffected: number;
  errors: number;
}

export interface FileMetrics {
  path: string;
  size: number;
  processingTime: number;
  rulesApplied: number;
  cacheHit: boolean;
}

export interface PerformanceReport {
  summary: {
    totalDuration: number;
    filesProcessed: number;
    filesScanned: number;
    bytesProcessed: number;
    throughput: number; // files per second
    averageFileTime: number;
    cacheEfficiency: number; // percentage
  };
  parallel?: {
    enabled: boolean;
    concurrency: number;
    batchCount: number;
    speedup?: number; // estimated speedup vs sequential
  };
  rules: RuleMetrics[];
  slowestFiles: FileMetrics[];
  memoryPeak: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
  };
  recommendations: string[];
}

export class PerformanceTracker {
  private metrics: PerformanceMetrics;
  private ruleMetrics: Map<string, RuleMetrics>;
  private fileMetrics: FileMetrics[];
  private memoryPeaks: number[];

  constructor() {
    this.metrics = {
      startTime: Date.now(),
      filesProcessed: 0,
      filesScanned: 0,
      bytesProcessed: 0,
      cacheHits: 0,
      cacheMisses: 0,
      rulesExecuted: 0,
      errors: 0,
      parallelEnabled: false,
      concurrency: 1,
      batchCount: 0
    };
    this.ruleMetrics = new Map();
    this.fileMetrics = [];
    this.memoryPeaks = [];
  }

  public setParallelMode(enabled: boolean, concurrency: number): void {
    this.metrics.parallelEnabled = enabled;
    this.metrics.concurrency = concurrency;
  }

  public trackBatch(): void {
    if (this.metrics.batchCount !== undefined) {
      this.metrics.batchCount++;
    }
  }

  public start(): void {
    this.metrics.startTime = Date.now();
    this.captureMemory();
  }

  public end(): void {
    this.metrics.endTime = Date.now();
    this.metrics.duration = this.metrics.endTime - this.metrics.startTime;
    this.captureMemory();
  }

  public trackFileProcessed(filePath: string, size: number, processingTime: number, rulesApplied: number, cacheHit: boolean): void {
    this.metrics.filesProcessed++;
    this.metrics.bytesProcessed += size;
    
    if (cacheHit) {
      this.metrics.cacheHits++;
    } else {
      this.metrics.cacheMisses++;
    }

    this.fileMetrics.push({
      path: filePath,
      size,
      processingTime,
      rulesApplied,
      cacheHit
    });
  }

  public trackFileScanned(): void {
    this.metrics.filesScanned++;
  }

  public trackRuleExecution(ruleId: string, duration: number, filesAffected: number = 0, error: boolean = false): void {
    this.metrics.rulesExecuted++;
    
    if (error) {
      this.metrics.errors++;
    }

    const existing = this.ruleMetrics.get(ruleId);
    if (existing) {
      existing.executionCount++;
      existing.totalDuration += duration;
      existing.averageDuration = existing.totalDuration / existing.executionCount;
      existing.filesAffected += filesAffected;
      if (error) existing.errors++;
    } else {
      this.ruleMetrics.set(ruleId, {
        ruleId,
        executionCount: 1,
        totalDuration: duration,
        averageDuration: duration,
        filesAffected,
        errors: error ? 1 : 0
      });
    }
  }

  public trackError(): void {
    this.metrics.errors++;
  }

  private captureMemory(): void {
    const mem = process.memoryUsage();
    this.memoryPeaks.push(mem.heapUsed);
    this.metrics.memoryUsage = {
      heapUsed: mem.heapUsed,
      heapTotal: mem.heapTotal,
      external: mem.external,
      rss: mem.rss
    };
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public generateReport(): PerformanceReport {
    const duration = this.metrics.duration || 0;
    const filesProcessed = this.metrics.filesProcessed;
    const throughput = duration > 0 ? (filesProcessed / (duration / 1000)) : 0;
    const averageFileTime = filesProcessed > 0 ? (duration / filesProcessed) : 0;
    const totalCache = this.metrics.cacheHits + this.metrics.cacheMisses;
    const cacheEfficiency = totalCache > 0 ? (this.metrics.cacheHits / totalCache) * 100 : 0;

    // Sort rules by total duration (slowest first)
    const sortedRules = Array.from(this.ruleMetrics.values())
      .sort((a, b) => b.totalDuration - a.totalDuration);

    // Sort files by processing time (slowest first)
    const slowestFiles = [...this.fileMetrics]
      .sort((a, b) => b.processingTime - a.processingTime)
      .slice(0, 10);

    // Memory peak
    const maxHeap = Math.max(...this.memoryPeaks, 0);
    const memoryPeak = this.metrics.memoryUsage || { heapUsed: 0, heapTotal: 0, rss: 0 };

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (cacheEfficiency < 50 && totalCache > 10) {
      recommendations.push('Low cache efficiency detected. Consider reviewing cache key generation.');
    }
    
    if (sortedRules.length > 0 && sortedRules[0].totalDuration > duration * 0.3) {
      recommendations.push(`Rule "${sortedRules[0].ruleId}" accounts for ${((sortedRules[0].totalDuration / duration) * 100).toFixed(1)}% of total time. Consider optimization.`);
    }
    
    if (slowestFiles.length > 0 && slowestFiles[0].processingTime > averageFileTime * 5) {
      recommendations.push(`File "${slowestFiles[0].path}" took ${slowestFiles[0].processingTime.toFixed(0)}ms. Consider excluding or caching.`);
    }
    
    if (maxHeap > 500 * 1024 * 1024) { // 500MB
      recommendations.push('High memory usage detected. Consider processing files in smaller batches.');
    }

    // Parallel processing recommendations
    if (!this.metrics.parallelEnabled && filesProcessed > 50) {
      recommendations.push('Consider using --parallel flag for faster processing of large file sets.');
    }

    // Parallel metrics
    const parallelInfo = this.metrics.parallelEnabled ? {
      enabled: true,
      concurrency: this.metrics.concurrency || 1,
      batchCount: this.metrics.batchCount || 0,
      speedup: this.metrics.concurrency && this.metrics.concurrency > 1 
        ? Math.min(this.metrics.concurrency * 0.7, filesProcessed / Math.max(1, this.metrics.batchCount || 1))
        : undefined
    } : undefined;

    return {
      summary: {
        totalDuration: duration,
        filesProcessed,
        filesScanned: this.metrics.filesScanned,
        bytesProcessed: this.metrics.bytesProcessed,
        throughput,
        averageFileTime,
        cacheEfficiency
      },
      parallel: parallelInfo,
      rules: sortedRules,
      slowestFiles,
      memoryPeak: {
        heapUsed: maxHeap,
        heapTotal: memoryPeak.heapTotal,
        rss: memoryPeak.rss
      },
      recommendations
    };
  }

  public printReport(): void {
    const report = this.generateReport();
    
    console.log('\n═══════════════════════════════════════');
    console.log('       PERFORMANCE REPORT');
    console.log('═══════════════════════════════════════\n');
    
    console.log('📊 Summary:');
    console.log(`  Total Duration:    ${(report.summary.totalDuration / 1000).toFixed(2)}s`);
    console.log(`  Files Processed:   ${report.summary.filesProcessed}`);
    console.log(`  Files Scanned:     ${report.summary.filesScanned}`);
    console.log(`  Bytes Processed:   ${(report.summary.bytesProcessed / 1024).toFixed(2)} KB`);
    console.log(`  Throughput:        ${report.summary.throughput.toFixed(2)} files/sec`);
    console.log(`  Avg File Time:     ${report.summary.averageFileTime.toFixed(2)}ms`);
    console.log(`  Cache Efficiency:  ${report.summary.cacheEfficiency.toFixed(1)}%\n`);
    
    if (report.parallel) {
      console.log('⚡ Parallel Processing:');
      console.log(`  Enabled:           ${report.parallel.enabled ? 'Yes' : 'No'}`);
      console.log(`  Concurrency:       ${report.parallel.concurrency}`);
      console.log(`  Batches:           ${report.parallel.batchCount}`);
      if (report.parallel.speedup) {
        console.log(`  Estimated Speedup: ${report.parallel.speedup.toFixed(1)}x`);
      }
      console.log('');
    }
    
    if (report.rules.length > 0) {
      console.log('⚡ Slowest Rules:');
      report.rules.slice(0, 5).forEach((rule, i) => {
        console.log(`  ${i + 1}. ${rule.ruleId}`);
        console.log(`     Duration: ${rule.totalDuration.toFixed(0)}ms | Avg: ${rule.averageDuration.toFixed(2)}ms | Executions: ${rule.executionCount}`);
      });
      console.log('');
    }
    
    if (report.slowestFiles.length > 0) {
      console.log('🐌 Slowest Files:');
      report.slowestFiles.slice(0, 5).forEach((file, i) => {
        console.log(`  ${i + 1}. ${file.path} (${file.processingTime.toFixed(0)}ms)`);
      });
      console.log('');
    }
    
    console.log('💾 Memory Peak:');
    console.log(`  Heap Used:  ${(report.memoryPeak.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Heap Total: ${(report.memoryPeak.heapTotal / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  RSS:        ${(report.memoryPeak.rss / 1024 / 1024).toFixed(2)} MB\n`);
    
    if (report.recommendations.length > 0) {
      console.log('💡 Recommendations:');
      report.recommendations.forEach((rec, i) => {
        console.log(`  ${i + 1}. ${rec}`);
      });
      console.log('');
    }
    
    console.log('═══════════════════════════════════════\n');
  }
}

