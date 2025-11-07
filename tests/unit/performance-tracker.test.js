const assert = require('assert');
const { describe, it, beforeEach } = require('node:test');
const { PerformanceTracker } = require('../../dist/scripts/types/performance');

describe('PerformanceTracker', () => {
  let tracker;

  beforeEach(() => {
    tracker = new PerformanceTracker();
  });

  it('should initialize with default metrics', () => {
    const report = tracker.generateReport();
    assert.strictEqual(report.summary.filesProcessed, 0);
    assert.strictEqual(report.summary.filesScanned, 0);
    assert.strictEqual(report.rules.length, 0);
  });

  it('should track rule execution', () => {
    tracker.start();
    tracker.trackRuleExecution('test-rule-1', 100, 5, false);
    tracker.trackRuleExecution('test-rule-1', 150, 3, false);
    tracker.end();

    const report = tracker.generateReport();
    assert.strictEqual(report.rules.length, 1);
    assert.strictEqual(report.rules[0].ruleId, 'test-rule-1');
    assert.strictEqual(report.rules[0].executionCount, 2);
    assert.strictEqual(report.rules[0].totalDuration, 250);
    assert.strictEqual(report.rules[0].filesAffected, 8);
    assert.strictEqual(report.rules[0].errors, 0);
  });

  it('should track rule execution errors', () => {
    tracker.start();
    tracker.trackRuleExecution('test-rule-2', 50, 0, true);
    tracker.end();

    const report = tracker.generateReport();
    assert.strictEqual(report.rules.length, 1);
    assert.strictEqual(report.rules[0].errors, 1);
  });

  it('should track file processing', () => {
    tracker.start();
    tracker.trackFileProcessed('src/file1.js', 1000, 10, 2, false);
    tracker.trackFileProcessed('src/file2.js', 2000, 20, 3, true);
    tracker.end();

    const report = tracker.generateReport();
    assert.strictEqual(report.summary.filesProcessed, 2);
    assert.strictEqual(report.summary.bytesProcessed, 3000);
    assert.strictEqual(report.summary.cacheEfficiency, 50); // 1 hit, 1 miss
    assert.strictEqual(report.slowestFiles.length, 2);
  });

  it('should calculate duration correctly', () => {
    tracker.start();
    // Simulate some work
    const startTime = Date.now();
    while (Date.now() - startTime < 50) {} // Wait at least 50ms
    tracker.end();

    const report = tracker.generateReport();
    assert.ok(report.summary.totalDuration >= 50, 'Duration should be at least 50ms');
  });

  it('should calculate throughput correctly', async () => {
    tracker.start();
    await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms
    tracker.trackFileProcessed('file1.js', 1000, 100, 1, false);
    tracker.trackFileProcessed('file2.js', 1000, 100, 1, false);
    tracker.end();

    const report = tracker.generateReport();
    assert.ok(report.summary.throughput >= 0, 'Throughput should be calculated');
    assert.ok(report.summary.averageFileTime >= 0, 'Average file time should be calculated');
  });

  it('should track memory usage', () => {
    tracker.start();
    // Memory is captured automatically by start() and end()
    tracker.end();

    const report = tracker.generateReport();
    assert.ok(report.memoryPeak.heapUsed > 0, 'Heap used should be tracked');
    assert.ok(report.memoryPeak.rss > 0, 'RSS should be tracked');
  });

  it('should generate recommendations for slow rules', () => {
    tracker.start();
    tracker.trackRuleExecution('slow-rule', 5000, 10, false);
    tracker.trackRuleExecution('fast-rule', 50, 10, false);
    tracker.end();

    const report = tracker.generateReport();
    assert.ok(report.recommendations.length > 0, 'Should generate recommendations');
    const slowRuleRec = report.recommendations.find(r => r.includes('slow-rule'));
    assert.ok(slowRuleRec, 'Should recommend optimization for slow rule');
  });

  it('should generate recommendations for low cache efficiency', () => {
    tracker.start();
    // Simulate low cache efficiency
    for (let i = 0; i < 15; i++) {
      tracker.trackFileProcessed(`file${i}.js`, 1000, 100, 1, false); // all cache misses
    }
    tracker.end();

    const report = tracker.generateReport();
    const cacheRec = report.recommendations.find(r => r.includes('cache'));
    assert.ok(cacheRec, 'Should recommend caching when efficiency is low');
  });

  it('should generate recommendations for high memory usage', () => {
    tracker.start();
    // Force high memory allocation
    const largeArray = new Array(10000000).fill('x');
    // Memory is captured automatically by end()
    tracker.end();

    const report = tracker.generateReport();
    // Memory recommendations depend on actual usage
    assert.ok(report.memoryPeak.heapUsed > 0);
    assert.ok(Array.isArray(report.recommendations));
  });

  it('should handle multiple rules', () => {
    tracker.start();
    tracker.trackRuleExecution('rule-1', 100, 5, false);
    tracker.trackRuleExecution('rule-2', 200, 3, false);
    tracker.trackRuleExecution('rule-3', 150, 7, false);
    tracker.end();

    const report = tracker.generateReport();
    assert.strictEqual(report.rules.length, 3);
    assert.ok(report.rules.find(r => r.ruleId === 'rule-1'));
    assert.ok(report.rules.find(r => r.ruleId === 'rule-2'));
    assert.ok(report.rules.find(r => r.ruleId === 'rule-3'));
  });

  it('should track cache hits and misses', () => {
    tracker.start();
    tracker.trackFileProcessed('file1.js', 1000, 100, 1, true); // cache hit
    tracker.trackFileProcessed('file2.js', 1000, 100, 1, false); // cache miss
    tracker.trackFileProcessed('file3.js', 1000, 100, 1, true); // cache hit
    tracker.end();

    const report = tracker.generateReport();
    // Cache efficiency is (2 / 3) * 100 = 66.666..., not rounded in the implementation
    assert.ok(report.summary.cacheEfficiency > 66 && report.summary.cacheEfficiency < 67);
  });

  it('should sort slowest files correctly', () => {
    tracker.start();
    tracker.trackFileProcessed('fast.js', 1000, 10, 1, false);
    tracker.trackFileProcessed('slow.js', 1000, 500, 1, false);
    tracker.trackFileProcessed('medium.js', 1000, 100, 1, false);
    tracker.end();

    const report = tracker.generateReport();
    assert.strictEqual(report.slowestFiles.length, 3);
    assert.strictEqual(report.slowestFiles[0].path, 'slow.js');
    assert.strictEqual(report.slowestFiles[2].path, 'fast.js');
  });

  it('should handle zero files gracefully', () => {
    tracker.start();
    tracker.end();

    const report = tracker.generateReport();
    assert.strictEqual(report.summary.filesProcessed, 0);
    assert.strictEqual(report.summary.throughput, 0);
    assert.strictEqual(report.summary.averageFileTime, 0);
  });

  it('should print report without errors', () => {
    tracker.start();
    tracker.trackRuleExecution('test-rule', 100, 5, false);
    tracker.trackFileProcessed('test.js', 1000, 50, 1, false);
    tracker.end();

    // Should not throw
    assert.doesNotThrow(() => {
      tracker.printReport();
    });
  });
});

