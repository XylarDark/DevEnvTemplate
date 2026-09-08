"use strict";
// scripts/utils/parallel.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.parallel = parallel;
exports.parallelBatch = parallelBatch;
exports.calculateOptimalConcurrency = calculateOptimalConcurrency;
const logger_1 = require("./logger");
const logger = (0, logger_1.createLogger)({ context: 'parallel' });
/**
 * Execute async operations in parallel with concurrency control
 *
 * @param items - Array of items to process
 * @param worker - Async function to process each item
 * @param options - Parallel execution options
 * @returns Promise resolving to results and errors
 */
async function parallel(items, worker, options) {
    const { concurrency, onProgress } = options;
    const results = [];
    const errors = [];
    if (items.length === 0) {
        return { results, errors };
    }
    logger.debug(`Starting parallel execution: ${items.length} items, concurrency ${concurrency}`);
    let completed = 0;
    let index = 0;
    // Create a pool of workers
    const workers = Array(Math.min(concurrency, items.length))
        .fill(null)
        .map(async () => {
        while (index < items.length) {
            const currentIndex = index++;
            const item = items[currentIndex];
            try {
                const result = await worker(item);
                results[currentIndex] = result;
            }
            catch (error) {
                logger.warn(`Worker failed for item at index ${currentIndex}`, {
                    error: error.message,
                });
                errors.push({ item, error: error });
                // Store undefined for failed items to maintain index alignment
                results[currentIndex] = undefined;
            }
            completed++;
            if (onProgress) {
                onProgress(completed, items.length);
            }
        }
    });
    // Wait for all workers to complete
    await Promise.all(workers);
    logger.debug(`Parallel execution completed: ${results.length} results, ${errors.length} errors`);
    return { results, errors };
}
/**
 * Execute async operations in batches with concurrency control
 * Alternative approach that processes in explicit batches
 *
 * @param items - Array of items to process
 * @param worker - Async function to process each item
 * @param options - Parallel execution options
 * @returns Promise resolving to results and errors
 */
async function parallelBatch(items, worker, options) {
    const { concurrency, onProgress } = options;
    const results = [];
    const errors = [];
    if (items.length === 0) {
        return { results, errors };
    }
    logger.debug(`Starting batch parallel execution: ${items.length} items, batch size ${concurrency}`);
    let completed = 0;
    // Process in batches
    for (let i = 0; i < items.length; i += concurrency) {
        const batch = items.slice(i, i + concurrency);
        const batchPromises = batch.map(async (item, batchIndex) => {
            const globalIndex = i + batchIndex;
            try {
                const result = await worker(item);
                return { index: globalIndex, result, error: null };
            }
            catch (error) {
                logger.warn(`Batch worker failed for item at index ${globalIndex}`, {
                    error: error.message,
                });
                return {
                    index: globalIndex,
                    result: undefined,
                    error: { item, error: error },
                };
            }
        });
        const batchResults = await Promise.all(batchPromises);
        // Collect results and errors
        for (const { index, result, error } of batchResults) {
            if (error) {
                errors.push(error);
            }
            results[index] = result;
            completed++;
            if (onProgress) {
                onProgress(completed, items.length);
            }
        }
    }
    logger.debug(`Batch parallel execution completed: ${results.length} results, ${errors.length} errors`);
    return { results, errors };
}
/**
 * Calculate optimal concurrency based on system resources and workload
 *
 * @param itemCount - Number of items to process
 * @param cpuCount - Number of CPU cores available
 * @param ioIntensive - Whether the workload is I/O intensive (true) or CPU intensive (false)
 * @returns Recommended concurrency level
 */
function calculateOptimalConcurrency(itemCount, cpuCount, ioIntensive = true) {
    if (itemCount === 0)
        return 1;
    // For I/O intensive tasks, use more concurrency (2x CPU count)
    // For CPU intensive tasks, use CPU count
    const baseConcurrency = ioIntensive ? cpuCount * 2 : cpuCount;
    // Don't exceed item count
    return Math.min(baseConcurrency, itemCount);
}
//# sourceMappingURL=parallel.js.map