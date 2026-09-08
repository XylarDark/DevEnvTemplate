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
        throughput: number;
        averageFileTime: number;
        cacheEfficiency: number;
    };
    parallel?: {
        enabled: boolean;
        concurrency: number;
        batchCount: number;
        speedup?: number;
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
export declare class PerformanceTracker {
    private metrics;
    private ruleMetrics;
    private fileMetrics;
    private memoryPeaks;
    constructor();
    setParallelMode(enabled: boolean, concurrency: number): void;
    trackBatch(): void;
    start(): void;
    end(): void;
    trackFileProcessed(filePath: string, size: number, processingTime: number, rulesApplied: number, cacheHit: boolean): void;
    trackFileScanned(): void;
    trackRuleExecution(ruleId: string, duration: number, filesAffected?: number, error?: boolean): void;
    trackError(): void;
    private captureMemory;
    getMetrics(): PerformanceMetrics;
    generateReport(): PerformanceReport;
    printReport(): void;
}
//# sourceMappingURL=performance.d.ts.map