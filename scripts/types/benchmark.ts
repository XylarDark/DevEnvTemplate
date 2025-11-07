// scripts/types/benchmark.ts

import { CleanupOptions } from './cleanup';

export interface BenchmarkConfig {
  name: string;
  fixture: string; // path to test fixture
  iterations: number;
  options: CleanupOptions;
}

export interface BenchmarkStats {
  mean: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
}

export interface BenchmarkThroughput {
  filesPerSecond: number;
  bytesPerSecond: number;
}

export interface BenchmarkMemory {
  peakHeap: number;
  avgHeap: number;
}

export interface BenchmarkResult {
  name: string;
  timestamp: string;
  iterations: number;
  stats: BenchmarkStats;
  throughput: BenchmarkThroughput;
  memory: BenchmarkMemory;
  options: CleanupOptions;
}

export interface BenchmarkSuite {
  name: string;
  description: string;
  configs: BenchmarkConfig[];
}

export interface RegressionResult {
  detected: boolean;
  threshold: number;
  percentChange: number;
  current: BenchmarkStats;
  baseline: BenchmarkStats;
}

export interface BenchmarkHistoryEntry {
  timestamp: string;
  commit?: string;
  results: BenchmarkResult[];
}

