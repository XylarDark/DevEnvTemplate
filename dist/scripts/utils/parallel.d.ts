export interface ParallelOptions {
    concurrency: number;
    onProgress?: (completed: number, total: number) => void;
}
export interface ParallelResult<R> {
    results: R[];
    errors: Array<{
        item: any;
        error: Error;
    }>;
}
/**
 * Execute async operations in parallel with concurrency control
 *
 * @param items - Array of items to process
 * @param worker - Async function to process each item
 * @param options - Parallel execution options
 * @returns Promise resolving to results and errors
 */
export declare function parallel<T, R>(items: T[], worker: (item: T) => Promise<R>, options: ParallelOptions): Promise<ParallelResult<R>>;
/**
 * Execute async operations in batches with concurrency control
 * Alternative approach that processes in explicit batches
 *
 * @param items - Array of items to process
 * @param worker - Async function to process each item
 * @param options - Parallel execution options
 * @returns Promise resolving to results and errors
 */
export declare function parallelBatch<T, R>(items: T[], worker: (item: T) => Promise<R>, options: ParallelOptions): Promise<ParallelResult<R>>;
/**
 * Calculate optimal concurrency based on system resources and workload
 *
 * @param itemCount - Number of items to process
 * @param cpuCount - Number of CPU cores available
 * @param ioIntensive - Whether the workload is I/O intensive (true) or CPU intensive (false)
 * @returns Recommended concurrency level
 */
export declare function calculateOptimalConcurrency(itemCount: number, cpuCount: number, ioIntensive?: boolean): number;
//# sourceMappingURL=parallel.d.ts.map