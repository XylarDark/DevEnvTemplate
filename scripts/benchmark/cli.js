#!/usr/bin/env node

const { Command } = require('commander');
const { BenchmarkRunner } = require('../../dist/benchmark/runner');
const { getSuite, listSuites } = require('../../dist/benchmark/suites');
const path = require('path');
const fs = require('fs').promises;

const program = new Command();

program
  .name('benchmark')
  .description('Performance benchmarking for CleanupEngine')
  .option('-s, --suite <name>', 'benchmark suite to run', 'parallel-comparison')
  .option('-f, --fixture <path>', 'test fixture path', 'tests/fixtures/large-project')
  .option('-i, --iterations <n>', 'number of iterations', parseInt, 5)
  .option('-o, --output <path>', 'output path for results', '.devenv/benchmarks/latest.json')
  .option('--compare', 'compare with historical results')
  .option('--regression-threshold <n>', 'regression alert threshold (%)', parseFloat, 10)
  .option('--ci', 'CI mode (fail on regression)')
  .option('--list-suites', 'list available benchmark suites');

program.action(async (options) => {
  try {
    if (options.listSuites) {
      console.log('\nAvailable benchmark suites:');
      const suites = listSuites();
      suites.forEach(suite => console.log(`  - ${suite}`));
      process.exit(0);
    }

    const runner = new BenchmarkRunner();
    const suite = getSuite(options.suite);

    // Override fixture path if provided
    if (options.fixture !== 'tests/fixtures/large-project') {
      suite.forEach(config => {
        config.fixture = path.resolve(options.fixture);
      });
    }

    // Override iterations if provided
    if (options.iterations !== 5) {
      suite.forEach(config => {
        config.iterations = options.iterations;
      });
    }

    console.log(`\n🏁 Running benchmark suite: ${options.suite}`);
    console.log(`   Fixture: ${suite[0].fixture}`);
    console.log(`   Iterations: ${suite[0].iterations}\n`);

    const results = await runner.runComparison(suite);

    // Save results
    await runner.saveResults(results, options.output);
    console.log(`\n✅ Results saved to ${options.output}`);

    // Print comparison table
    console.log('\n' + runner.formatComparisonTable(results));

    // Compare with history if requested
    if (options.compare) {
      const historyPath = path.join(path.dirname(options.output), 'history.json');
      const history = await runner.loadHistory(historyPath);

      console.log('\n📊 Regression Analysis:');
      let hasRegression = false;

      for (const result of results) {
        const regression = await runner.detectRegression(
          result,
          history,
          options.regressionThreshold
        );

        if (regression.detected) {
          hasRegression = true;
          console.log(`\n⚠️  REGRESSION DETECTED: ${result.name}`);
          console.log(`   Current: ${regression.current.mean.toFixed(2)}ms`);
          console.log(`   Baseline: ${regression.baseline.mean.toFixed(2)}ms`);
          console.log(`   Change: +${regression.percentChange.toFixed(2)}%`);
        } else if (history.length > 0) {
          console.log(`\n✅ ${result.name}: No regression`);
        }
      }

      // Update history
      const newHistory = [...history, ...results].slice(-50); // Keep last 50 results
      await fs.mkdir(path.dirname(historyPath), { recursive: true });
      await fs.writeFile(historyPath, JSON.stringify(newHistory, null, 2));

      // Fail in CI mode if regression detected
      if (options.ci && hasRegression) {
        console.log('\n❌ Benchmark failed due to performance regression');
        process.exit(1);
      }
    }

    console.log('\n✨ Benchmark complete!\n');
  } catch (error) {
    console.error('❌ Benchmark failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
});

program.parse();

