# Remediation Backlog (PR-Sized Tasks)

Status: No critical issues found. The following improvements are recommended to further harden the system.

1. CI: Cache Directory Sanity Check (non-blocking)
   - Add a pre-step to ensure `.cache/` is writable; log warning if not.
   - Acceptance: CI logs contain explicit cache status; pipeline proceeds regardless.

2. Metrics: Cache Hit Rate Logging (when --performance enabled)
   - Log aggregate cache hits/misses for config cache in performance report.
   - Acceptance: Performance report includes `Cache Hits`, `Cache Misses`, `Hit Rate`.

3. Docs: Add ‘Performance Tuning’ Section to USAGE.md (optional)
   - Tips for improving throughput (parallel processing once available, caching notes).
   - Acceptance: Section present with 3–5 concrete tips.

4. CleanupEngine: ‘--summary’ Output Mode (optional)
   - Provide concise, machine-readable summary for CI consumption.
   - Acceptance: New flag prints single-line JSON or key-value summary; tests included.

5. Phase 4b: Parallel Processing (scheduled)
   - Implement worker pool; `--parallel`/`--concurrency=N`; cross-platform tests.
   - Acceptance: 10–15 tests; no regressions; CI timing improvements on large fixtures.

6. Phase 4c: Progress & Benchmarks (scheduled)
   - CLI progress bars; benchmark suite; docs.
   - Acceptance: Benchmark CI job produces trend artifacts; documented thresholds.


