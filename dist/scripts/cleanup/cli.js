#!/usr/bin/env node
"use strict";
/**
 * Template cleanup CLI.
 *
 * Thin argument-parsing layer over the cleanup engine, which strips template-only scaffolding
 * (marked blocks, placeholder files, example dependencies) from a project that was created from
 * this template.
 *
 * Dry run is the default. Removing files is destructive and irreversible, so it requires the
 * explicit `--apply` flag rather than being opt-out.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const engine_1 = require("./engine");
/**
 * Split a comma-separated CLI value into trimmed entries.
 *
 * @param value Raw flag value.
 * @returns Non-empty entries, or undefined when nothing was provided.
 */
function splitList(value) {
    if (!value) {
        return undefined;
    }
    const entries = value
        .split(',')
        .map(entry => entry.trim())
        .filter(entry => entry.length > 0);
    return entries.length > 0 ? entries : undefined;
}
async function main() {
    const program = new commander_1.Command();
    program
        .name('devenv-cleanup')
        .description('Remove template-only scaffolding from a project created from this template')
        .option('--apply', 'apply changes (without this, the run is a dry run)', false)
        .option('--dry-run', 'preview changes without writing (default)', false)
        .option('-p, --profile <name>', 'cleanup profile from the config file', 'common')
        .option('-f, --features <list>', 'comma-separated features to keep')
        .option('-c, --config <path>', 'path to the cleanup config file')
        .option('-C, --working-dir <path>', 'project directory to clean')
        .option('--fail-on-actions', 'exit 2 when any action is detected (for CI guards)', false)
        .option('--only <list>', 'comma-separated rule ids to run exclusively')
        .option('--exclude <list>', 'comma-separated rule ids to skip')
        .option('--exclude-glob <list>', 'comma-separated globs to skip')
        .option('--keep <list>', 'comma-separated files to preserve')
        .option('--report <path>', 'write a JSON report to this path')
        .option('--performance', 'record per-step timings', false)
        .option('--no-cache', 'disable file and config caching')
        .option('--parallel', 'process files concurrently', false)
        .option('--concurrency <n>', 'max concurrent file operations')
        .option('--no-progress', 'disable the progress display')
        .option('--json', 'emit the report as JSON on stdout', false)
        .parse(process.argv);
    const options = program.opts();
    // Dry run unless --apply is passed. --dry-run is accepted for symmetry and pins the default.
    const isDryRun = options.apply !== true || options.dryRun === true;
    if (options.apply && options.dryRun) {
        console.error('Refusing to run: --apply and --dry-run contradict each other.');
        process.exit(1);
    }
    const concurrency = options.concurrency ? Number.parseInt(options.concurrency, 10) : undefined;
    if (concurrency !== undefined && (!Number.isInteger(concurrency) || concurrency < 1)) {
        console.error(`Invalid --concurrency value: ${options.concurrency}. Expected a positive integer.`);
        process.exit(1);
    }
    if (!options.json) {
        console.log(isDryRun
            ? '🔍 Cleanup dry run - no files will be modified. Re-run with --apply to make changes.\n'
            : '🧹 Applying cleanup - files will be modified.\n');
    }
    try {
        const { report, exitCode } = await (0, engine_1.executeCleanup)({
            profile: options.profile,
            features: splitList(options.features),
            configPath: options.config,
            workingDir: options.workingDir,
            dryRun: isDryRun,
            failOnActions: options.failOnActions,
            onlyRules: splitList(options.only),
            excludeRules: splitList(options.exclude),
            excludeGlobs: splitList(options.excludeGlob),
            keepFiles: splitList(options.keep),
            report: options.report,
            performance: options.performance,
            cache: options.cache,
            parallel: options.parallel,
            concurrency,
            // Progress output would interleave with JSON on stdout.
            progress: options.json ? false : options.progress,
        });
        if (options.json) {
            console.log(JSON.stringify(report, null, 2));
        }
        else {
            const actionCount = report.actions?.length ?? 0;
            console.log(actionCount === 0
                ? '\n✅ No template artifacts found.'
                : `\n${isDryRun ? '📋' : '✅'} ${actionCount} action(s) ${isDryRun ? 'would be' : ''} applied.`);
            if (isDryRun && actionCount > 0) {
                console.log('   Re-run with --apply to make these changes.');
            }
        }
        process.exit(exitCode);
    }
    catch (error) {
        console.error(`❌ ${error.message}`);
        process.exit(1);
    }
}
if (require.main === module) {
    main().catch(error => {
        console.error(`❌ Cleanup failed: ${error.message}`);
        process.exit(1);
    });
}
//# sourceMappingURL=cli.js.map