# RFC: Standalone Doctor Binary (Discovery)

Status: draft (research-only)  
Author: DevEnvTemplate tooling team  
Last updated: 2025-11-18

## Motivation

- Today the doctor always runs from an embedded `.devenv/` folder that ships TypeScript compiled to Node.js.
- Some teams asked for a single binary they can install globally (e.g., `brew install devenv-doctor`) to scan any repo without vendoring `.devenv/`.
- We want to evaluate the feasibility of a Go/Rust CLI while keeping the current TypeScript runtime as the source of truth.

## Requirements

1. **Zero additional burden on template users.** Vendoring `.devenv/` must keep working exactly as it does today.
2. **Easy distribution.** Cross-platform binaries (macOS Intel/ARM, Linux x64/ARM, Windows) plus checksums/signatures.
3. **Config parity.** Stack detection + gap analysis must understand the same heuristics and configuration files as the TypeScript implementation.
4. **Upgrade story.** Users should discover doctor updates automatically (e.g., `doctor --self-update` or GitHub release notifications).

## Candidate approaches

### 1. Go CLI re-implementation

**Pros**
- Single static binary, tiny runtime footprint.
- Easy cross-compilation and Homebrew scoop/chocolatey packaging.
- Strong standard library for filesystem + YAML/JSON parsing.

**Cons**
- We would need to re-implement every rule (stack detector, gap analyzer, plan generator) in Go.
- Higher risk of drift versus the TypeScript source; would require a shared schema/tests harness.
- Harder to let template users tweak heuristics (today they can edit TypeScript and rebuild locally).

**Integration model**
- Treat Go CLI as a *wrapper* that shells out to the existing Node tools when `.devenv/` is present.
- For global scans, ship a read-only `.devenv` bundle inside the binary (zip) extracted to a cache dir before running.

### 2. Rust CLI with WASM core

**Pros**
- Rust can compile to native binaries *and* WebAssembly if we ever want a browser-based doctor.
- Strong crate ecosystem for parsing configs similar to Go.
- Could embed the existing TypeScript logic by compiling it to WASM via swc/deno (experimental).

**Cons**
- Build pipeline more complex (cargo + wasm-bindgen).
- Same re-implementation burden unless we embed the existing JS via V8/QuickJS.
- Tooling knowledge barrier for contributors compared to Node.

**Integration model**
- Rust binary orchestrates runs, but executes the proven TypeScript gap/stack logic through QuickJS (bundling the compiled dist). Rust handles UX, caching, telemetry.

### 3. Keep Node runtime, ship via pkg/ncc

**Pros**
- No rewrite: use `esbuild`/`ncc`/`pkg` to bundle Node + dist scripts into a single executable per platform.
- Contributors keep editing TypeScript; tests stay the same.
- Easiest path to parity and upgrades.

**Cons**
- Bundled executable is larger than Go/Rust output (~20-30 MB).
- Still depends on V8 and Node start-up (slower cold start vs Go/Rust).

**Integration model**
- Provide `doctor` binary downloads from GitHub Releases that simply wrap the current `dist/scripts/doctor/cli.js`.
- Continue shipping `.devenv/` for embedded usage; binary option is for global scans or CI containers.

## Recommendation (for now)

- Stay on the TypeScript + Node runtime as the single source of truth.
- Prototype Option 3 (Node bundler) if we need a “download one file” experience.
- Re-evaluate a true Go/Rust rewrite only if we hit hard limits (startup time, dependency policy, offline requirements) that the bundled Node version cannot satisfy.

## Next steps (if/when prioritized)

1. Spike a `doctor` binary using `ncc` or `pkg` to measure size/startup.
2. Document how the binary discovers project roots and where it caches `.devenv`.
3. If successful, publish release instructions in `docs/RELEASE.md` and add automated builds to CI.

