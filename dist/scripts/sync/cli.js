#!/usr/bin/env node
"use strict";
/**
 * Layer-aware template sync CLI.
 *
 * Dry run is the default. Pass --apply to copy files. The legacy .devenv git merge remains
 * available with --devenv-merge.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const stack_detector_1 = __importDefault(require("../tools/stack-detector"));
const sync_from_template_1 = require("../tools/sync-from-template");
function splitLayers(value) {
    if (!value || value.trim() === 'all') {
        return [...sync_from_template_1.SYNC_LAYER_NAMES];
    }
    const layers = value
        .split(',')
        .map(entry => entry.trim())
        .filter(entry => entry.length > 0);
    for (const layer of layers) {
        if (!sync_from_template_1.SYNC_LAYER_NAMES.includes(layer)) {
            throw new Error(`Unknown layer "${layer}". Choose from: ${sync_from_template_1.SYNC_LAYER_NAMES.join(', ')}, or all.`);
        }
    }
    return layers;
}
async function resolveTemplateRoot(template) {
    const candidate = template ?? process.env.DEVENV_TEMPLATE_PATH;
    if (!candidate) {
        throw new Error('Template path is required. Pass --template <path> or set DEVENV_TEMPLATE_PATH.');
    }
    const resolved = path_1.default.resolve(candidate);
    if (!(await fs_1.promises.stat(resolved).catch(() => null))) {
        throw new Error(`Template path does not exist: ${resolved}`);
    }
    return resolved;
}
function printHumanReport(plan) {
    const mode = plan.dryRun ? 'DRY RUN' : 'APPLY';
    console.log(`\nSync (${mode}) — layers: ${plan.layer.join(', ')}`);
    console.log('');
    if (plan.copied.length === 0 && plan.skipped.length === 0) {
        console.log('No file changes planned.');
    }
    const wouldChange = plan.actions.filter(action => action.action === 'copy' || action.action === 'update');
    if (wouldChange.length > 0) {
        console.log('Would change:');
        for (const action of wouldChange) {
            const verb = action.action === 'copy' ? 'add' : 'update';
            console.log(`  ${verb}  ${action.relativePath}  (${action.reason})`);
        }
        console.log('');
    }
    const skipped = plan.actions.filter(action => action.action === 'skip');
    if (skipped.length > 0) {
        console.log('Skipped:');
        for (const action of skipped.slice(0, 20)) {
            console.log(`  skip  ${action.relativePath}  (${action.reason})`);
        }
        if (skipped.length > 20) {
            console.log(`  ... and ${skipped.length - 20} more`);
        }
        console.log('');
    }
    for (const warning of plan.warnings) {
        console.log(`Warning: ${warning}`);
    }
    for (const recommendation of plan.recommendations) {
        console.log(`Note: ${recommendation}`);
    }
    if (plan.dryRun) {
        console.log('No files were modified. Re-run with --apply to copy.');
    }
    else {
        console.log(`Applied ${plan.copied.length} change(s).`);
    }
}
async function main() {
    const program = new commander_1.Command();
    program
        .name('devenv-sync')
        .description('Refresh allowlisted DevEnvTemplate layers into a host project')
        .option('-l, --layer <name>', 'layer to sync (agent-context, operational-memory, doctor, all)', 'all')
        .option('-t, --template <path>', 'path to the DevEnvTemplate checkout')
        .option('-C, --project-root <path>', 'host project directory', process.cwd())
        .option('--apply', 'copy files (without this flag the run is a dry run)', false)
        .option('--dry-run', 'preview changes without writing (default)', false)
        .option('--devenv-merge', 'git-merge .devenv from the template (legacy embedded mode)', false)
        .option('--json', 'emit the plan as JSON on stdout', false)
        .parse(process.argv);
    const options = program.opts();
    if (options.apply && options.dryRun) {
        console.error('Refusing to run: --apply and --dry-run contradict each other.');
        process.exit(1);
    }
    const isDryRun = options.apply !== true || options.dryRun === true;
    const projectRoot = path_1.default.resolve(options.projectRoot ?? process.cwd());
    const templateRoot = await resolveTemplateRoot(options.template);
    if (options.devenvMerge) {
        const devenvDir = path_1.default.join(projectRoot, '.devenv');
        const mergeResult = await (0, sync_from_template_1.mergeDevenvFromTemplate)({
            templateRoot,
            devenvDir,
            dryRun: isDryRun,
        });
        if (options.json) {
            console.log(JSON.stringify(mergeResult, null, 2));
        }
        else {
            console.log(mergeResult.message);
            if (mergeResult.preserved.length > 0) {
                console.log(`Preserved project files: ${mergeResult.preserved.join(', ')}`);
            }
        }
        return;
    }
    const layers = splitLayers(options.layer);
    let stackReport;
    if (layers.includes('agent-context')) {
        const detector = new stack_detector_1.default({ rootDir: projectRoot, quiet: options.json === true });
        stackReport = await detector.detect();
    }
    const result = await (0, sync_from_template_1.syncFromTemplate)({
        projectRoot,
        templateRoot,
        layers,
        dryRun: isDryRun,
        stackReport,
    });
    if (options.json) {
        console.log(JSON.stringify(result, null, 2));
    }
    else {
        printHumanReport(result);
    }
}
main().catch(error => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
});
//# sourceMappingURL=cli.js.map