const assert = require('assert');
const { describe, it, beforeEach } = require('node:test');
const { parallel, parallelBatch, calculateOptimalConcurrency } = require('../../dist/scripts/utils/parallel');

describe('Parallel Utility', () => {
  describe('parallel()', () => {
    it('should process items in parallel with concurrency limit', async () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8];
      let maxConcurrent = 0;
      let currentConcurrent = 0;

      const result = await parallel(
        items,
        async (item) => {
          currentConcurrent++;
          maxConcurrent = Math.max(maxConcurrent, currentConcurrent);
          await new Promise(resolve => setTimeout(resolve, 10));
          currentConcurrent--;
          return item * 2;
        },
        { concurrency: 3 }
      );

      assert.strictEqual(result.results.length, 8);
      assert.deepStrictEqual(result.results, [2, 4, 6, 8, 10, 12, 14, 16]);
      assert.strictEqual(result.errors.length, 0);
      assert.ok(maxConcurrent <= 3, `Max concurrent was ${maxConcurrent}, expected <= 3`);
    });

    it('should handle errors gracefully and continue processing', async () => {
      const items = [1, 2, 3, 4, 5];

      const result = await parallel(
        items,
        async (item) => {
          if (item === 3) {
            throw new Error(`Failed on item ${item}`);
          }
          return item * 2;
        },
        { concurrency: 2 }
      );

      assert.strictEqual(result.results.length, 5);
      assert.strictEqual(result.results[0], 2);
      assert.strictEqual(result.results[1], 4);
      assert.strictEqual(result.results[2], undefined); // Failed item
      assert.strictEqual(result.results[3], 8);
      assert.strictEqual(result.results[4], 10);
      assert.strictEqual(result.errors.length, 1);
      assert.strictEqual(result.errors[0].item, 3);
      assert.ok(result.errors[0].error.message.includes('Failed on item 3'));
    });

    it('should call progress callback', async () => {
      const items = [1, 2, 3, 4, 5];
      const progressUpdates = [];

      await parallel(
        items,
        async (item) => {
          await new Promise(resolve => setTimeout(resolve, 5));
          return item * 2;
        },
        {
          concurrency: 2,
          onProgress: (completed, total) => {
            progressUpdates.push({ completed, total });
          }
        }
      );

      assert.ok(progressUpdates.length > 0);
      assert.strictEqual(progressUpdates[progressUpdates.length - 1].completed, 5);
      assert.strictEqual(progressUpdates[progressUpdates.length - 1].total, 5);
    });

    it('should handle empty array', async () => {
      const result = await parallel(
        [],
        async (item) => item * 2,
        { concurrency: 2 }
      );

      assert.strictEqual(result.results.length, 0);
      assert.strictEqual(result.errors.length, 0);
    });

    it('should handle single item', async () => {
      const result = await parallel(
        [42],
        async (item) => item * 2,
        { concurrency: 2 }
      );

      assert.strictEqual(result.results.length, 1);
      assert.strictEqual(result.results[0], 84);
      assert.strictEqual(result.errors.length, 0);
    });

    it('should be memory efficient with large arrays', async () => {
      const items = Array.from({ length: 1000 }, (_, i) => i);
      const startMemory = process.memoryUsage().heapUsed;

      const result = await parallel(
        items,
        async (item) => item * 2,
        { concurrency: 10 }
      );

      const endMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = endMemory - startMemory;

      assert.strictEqual(result.results.length, 1000);
      assert.strictEqual(result.errors.length, 0);
      // Memory increase should be reasonable (< 50MB for 1000 items)
      assert.ok(memoryIncrease < 50 * 1024 * 1024, `Memory increase was ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
    });

    it('should respect concurrency limit of 1 (sequential)', async () => {
      const items = [1, 2, 3, 4, 5];
      const executionOrder = [];

      const result = await parallel(
        items,
        async (item) => {
          executionOrder.push(`start-${item}`);
          await new Promise(resolve => setTimeout(resolve, 10));
          executionOrder.push(`end-${item}`);
          return item * 2;
        },
        { concurrency: 1 }
      );

      assert.strictEqual(result.results.length, 5);
      // With concurrency 1, each item should complete before the next starts
      assert.ok(executionOrder.indexOf('end-1') < executionOrder.indexOf('start-2'));
      assert.ok(executionOrder.indexOf('end-2') < executionOrder.indexOf('start-3'));
    });
  });

  describe('parallelBatch()', () => {
    it('should process items in batches', async () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8];

      const result = await parallelBatch(
        items,
        async (item) => item * 2,
        { concurrency: 3 }
      );

      assert.strictEqual(result.results.length, 8);
      assert.deepStrictEqual(result.results, [2, 4, 6, 8, 10, 12, 14, 16]);
      assert.strictEqual(result.errors.length, 0);
    });

    it('should handle errors in batches', async () => {
      const items = [1, 2, 3, 4, 5];

      const result = await parallelBatch(
        items,
        async (item) => {
          if (item === 3) {
            throw new Error(`Failed on item ${item}`);
          }
          return item * 2;
        },
        { concurrency: 2 }
      );

      assert.strictEqual(result.results.length, 5);
      assert.strictEqual(result.errors.length, 1);
      assert.strictEqual(result.errors[0].item, 3);
    });

    it('should call progress callback for batches', async () => {
      const items = [1, 2, 3, 4, 5];
      const progressUpdates = [];

      await parallelBatch(
        items,
        async (item) => item * 2,
        {
          concurrency: 2,
          onProgress: (completed, total) => {
            progressUpdates.push({ completed, total });
          }
        }
      );

      assert.ok(progressUpdates.length > 0);
      assert.strictEqual(progressUpdates[progressUpdates.length - 1].completed, 5);
      assert.strictEqual(progressUpdates[progressUpdates.length - 1].total, 5);
    });
  });

  describe('calculateOptimalConcurrency()', () => {
    it('should return 1 for zero items', () => {
      const concurrency = calculateOptimalConcurrency(0, 8, true);
      assert.strictEqual(concurrency, 1);
    });

    it('should return CPU count for CPU-intensive tasks', () => {
      const concurrency = calculateOptimalConcurrency(100, 8, false);
      assert.strictEqual(concurrency, 8);
    });

    it('should return 2x CPU count for I/O-intensive tasks', () => {
      const concurrency = calculateOptimalConcurrency(100, 8, true);
      assert.strictEqual(concurrency, 16);
    });

    it('should not exceed item count', () => {
      const concurrency = calculateOptimalConcurrency(5, 8, true);
      assert.strictEqual(concurrency, 5);
    });

    it('should handle single CPU', () => {
      const concurrency = calculateOptimalConcurrency(100, 1, true);
      assert.strictEqual(concurrency, 2);
    });
  });
});

