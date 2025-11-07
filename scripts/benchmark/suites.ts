// scripts/benchmark/suites.ts

import { BenchmarkConfig } from '../types/benchmark';
import path from 'path';

const DEFAULT_FIXTURE = path.join(process.cwd(), 'tests/fixtures/large-project');
const DEFAULT_ITERATIONS = 5;

export const BENCHMARK_SUITES: Record<string, BenchmarkConfig[]> = {
  'parallel-comparison': [
    {
      name: 'Sequential',
      fixture: DEFAULT_FIXTURE,
      iterations: DEFAULT_ITERATIONS,
      options: { parallel: false, dryRun: false },
    },
    {
      name: 'Parallel-2',
      fixture: DEFAULT_FIXTURE,
      iterations: DEFAULT_ITERATIONS,
      options: { parallel: true, concurrency: 2, dryRun: false },
    },
    {
      name: 'Parallel-4',
      fixture: DEFAULT_FIXTURE,
      iterations: DEFAULT_ITERATIONS,
      options: { parallel: true, concurrency: 4, dryRun: false },
    },
    {
      name: 'Parallel-8',
      fixture: DEFAULT_FIXTURE,
      iterations: DEFAULT_ITERATIONS,
      options: { parallel: true, concurrency: 8, dryRun: false },
    },
  ],

  'cache-comparison': [
    {
      name: 'No Cache',
      fixture: DEFAULT_FIXTURE,
      iterations: DEFAULT_ITERATIONS,
      options: { cache: false, dryRun: false },
    },
    {
      name: 'With Cache',
      fixture: DEFAULT_FIXTURE,
      iterations: DEFAULT_ITERATIONS,
      options: { cache: true, dryRun: false },
    },
  ],

  'full-optimization': [
    {
      name: 'Baseline',
      fixture: DEFAULT_FIXTURE,
      iterations: DEFAULT_ITERATIONS,
      options: { dryRun: false },
    },
    {
      name: 'All Optimizations',
      fixture: DEFAULT_FIXTURE,
      iterations: DEFAULT_ITERATIONS,
      options: {
        parallel: true,
        cache: true,
        performance: true,
        dryRun: false,
      },
    },
  ],

  'progress-overhead': [
    {
      name: 'No Progress',
      fixture: DEFAULT_FIXTURE,
      iterations: DEFAULT_ITERATIONS,
      options: { progress: false, dryRun: false },
    },
    {
      name: 'Simple Progress',
      fixture: DEFAULT_FIXTURE,
      iterations: DEFAULT_ITERATIONS,
      options: { progress: true, progressVerbosity: 'simple', dryRun: false },
    },
    {
      name: 'Detailed Progress',
      fixture: DEFAULT_FIXTURE,
      iterations: DEFAULT_ITERATIONS,
      options: { progress: true, progressVerbosity: 'detailed', dryRun: false },
    },
  ],
};

/**
 * Get a benchmark suite by name
 */
export function getSuite(name: string): BenchmarkConfig[] {
  const suite = BENCHMARK_SUITES[name];
  if (!suite) {
    throw new Error(`Unknown benchmark suite: ${name}`);
  }
  return suite;
}

/**
 * List all available benchmark suites
 */
export function listSuites(): string[] {
  return Object.keys(BENCHMARK_SUITES);
}

