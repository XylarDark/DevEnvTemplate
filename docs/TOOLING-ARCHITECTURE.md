# DevEnvTemplate Tooling Architecture

DevEnvTemplate ships as a drop-in `.devenv/` directory that users vendor inside their repositories. To keep the embedded experience simple, **all core tooling is authored in TypeScript and runs on Node.js**. Installing the template is as easy as:

```bash
cd your-repo/.devenv
npm install
npm run doctor
```

That single runtime assumption unlocks a predictable experience on macOS, Linux, and Windows without asking the host project to install anything else.

## What belongs in the TypeScript core?

Use the TypeScript + Node toolchain for features that need to work across *all* projects:

- `stack-detector`, `gap-analyzer`, `plan-generator`, the cleanup engine, and future shared doctor rules.
- Repo-wide automation that inspects a filesystem, parses JSON/TOML/YAML, or generates reports in `.devenv`.
- Anything that should run the same way in Node-only, Python-only, or mixed stacks.

Implementation pattern:

1. Put the logic in `scripts/tools/*.ts`.
2. Run `npm run build` to produce the compiled output in `dist/`.
3. Keep the accompanying `.js` entrypoints as very thin wrappers that simply `require()` the compiled module and wire up CLI args.

## Project-local helper scripts

Projects can and should keep helper scripts in their native stacks when the checks are domain-specific. Examples:

- `scripts/check_env.py` inside `lunar_mining_sim` verifies Python env variables before running expensive simulations.
- A Node web app might keep a `scripts/validate-config.ts` that runs as part of its own CI pipeline.

Guidelines:

- If a helper only makes sense for *one* repository, keep it in that repo and document it locally.
- If you discover a helper that would benefit every DevEnvTemplate user, port the idea into the TypeScript core so it runs inside `.devenv`.
- Avoid introducing new shared runtimes (Python/Go/Rust) in `.devenv` unless there is a strong reason—every new runtime would complicate installation for users.

## Future experiments

There may be value in exploring standalone doctor binaries (Go/Rust) that people install globally. If we go down that path, they should complement—not replace—the TypeScript `.devenv` bundle so existing users can keep their current workflow.

Until then, TypeScript + Node remains the single source of truth for DevEnvTemplate tooling.

## Performance levers built into the doctor

- **File-system caching:** the stack detector memoizes reads of package manifests, workflow files, and configs so repeated checks don’t thrash disk I/O.
- **Directory ignore lists:** both stack detector and gap analyzer skip heavy folders (`node_modules`, `dist/`, `.venv/`, datasets, etc.) and cap workflow traversal to a handful of files per CI folder.
- **Fast mode (`npm run doctor --fast`):** runs the short path (stack detection + core quality/security checks) and skips documentation, accessibility, Docker, and git-hook analyses. Default/full scans still run everything before releases.

