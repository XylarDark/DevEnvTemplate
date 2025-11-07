# Risk Matrix – Claude Overhaul (Current Master)

| Area | Change | Risk | Impact | Likelihood | Mitigation | Owner |
|------|--------|------|--------|------------|------------|-------|
| CLI Behavior | New flags: `--performance`, `--cache/--no-cache` | Low | Backward compatibility could be misinterpreted | Low | Document in USAGE.md (done); keep defaults safe | Core |
| CleanupEngine | PerformanceTracker instrumentation | Low | Noise if enabled in CI | Low | Opt-in only; default off | Core |
| Caching | Config cache default-on with hash invalidation | Low | Stale cache | Low | SHA-256 content hash + TTL; add CI smoke check | Core |
| Types | TS migrations and public interfaces | Med | Downstream type breakage | Low | JS wrappers preserved; semantic versioning | Core |
| Tests | Windows-safe switch from mock-fs | Low | Fixture handling differences | Low | Use os.tmpdir + fs.mkdtemp (done) | QA |
| CI | Add TS build/test stages | Low | Longer pipelines | Low | Cache dependencies; parallelize steps | DevOps |
| Inter-Tool | Structured markdown fields | Low | Parser brittleness | Low | Tests for field presence (done) | CI Tools |
| Security | No secrets, governance enforced | Low | None | Low | Maintain baselines | Security |

Notes
- No high-risk items identified. Medium risk limited to type surface area; wrappers mitigate.
- Recommend monitoring cache hit rate and performance trends over subsequent runs.

