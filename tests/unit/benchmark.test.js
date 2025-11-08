const { describe, test } = require('node:test');
const assert = require('node:assert');
const { BenchmarkRunner } = require('../../dist/scripts/benchmark/runner');

describe('Benchmark Runner', () => {
  test('calculates mean correctly', { timeout: 5000 }, () => {
    const runner = new BenchmarkRunner();
    const times = [100, 200, 300, 400, 500];
    const stats = runner['calculateStats'](times);
    assert.strictEqual(stats.mean, 300);
  });

  test('calculates median correctly', { timeout: 5000 }, () => {
    const runner = new BenchmarkRunner();
    const times = [100, 200, 300, 400, 500];
    const stats = runner['calculateStats'](times);
    assert.strictEqual(stats.median, 300);
  });

  test('calculates standard deviation', { timeout: 5000 }, () => {
    const runner = new BenchmarkRunner();
    const times = [100, 200, 300, 400, 500];
    const stats = runner['calculateStats'](times);
    // stdDev should be approximately 141.42
    assert.ok(Math.abs(stats.stdDev - 141.42) < 1, 'StdDev should be ~141.42');
  });

  test('detects no regression with empty history', { timeout: 5000 }, async () => {
    const runner = new BenchmarkRunner();
    const current = {
      name: 'test',
      timestamp: new Date().toISOString(),
      iterations: 5,
      stats: { mean: 100, median: 100, min: 90, max: 110, stdDev: 5 },
      throughput: { filesPerSecond: 10, bytesPerSecond: 1000 },
      memory: { peakHeap: 1000, avgHeap: 900 },
      options: {}
    };
    
    const regression = await runner.detectRegression(current, [], 10);
    assert.strictEqual(regression.detected, false);
  });
});

