#!/usr/bin/env node
"use strict";
/**
 * Layer-aware sync from DevEnvTemplate into a host project.
 *
 * Copies only allowlisted paths for the chosen adoption layer. Dry-run is the default;
 * pass apply=true to write files. Never overwrites the host root AGENTS.md, never copies
 * MCP configs, and never copies retired always-applied Cursor rules.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SYNC_LAYER_NAMES = void 0;
exports.planLayerSync = planLayerSync;
exports.syncFromTemplate = syncFromTemplate;
exports.mergeDevenvFromTemplate = mergeDevenvFromTemplate;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const logger_1 = require("../utils/logger");
const cursor_rules_adapter_1 = require("./cursor-rules-adapter");
const cursor_rules_integration_1 = require("./cursor-rules-integration");
const logger = (0, logger_1.createLogger)({ context: 'sync-from-template' });
exports.SYNC_LAYER_NAMES = ['agent-context', 'operational-memory', 'doctor'];
const DEFAULT_STACK_REPORT = {
    technologies: [],
    configurations: [],
    frameworks: { type: 'vanilla', version: null, dirs: [] },
    tooling: {
        testing: { present: false, frameworks: [] },
        linting: { present: false, configs: [] },
        formatting: { present: false, configs: [] },
    },
    scripts: { detected: [], missing: [] },
    files: { configs: [], key_patterns: [] },
    quality: {
        linting: false,
        testing: false,
        typescript: false,
        security: false,
        formatting: false,
    },
    ci: { present: false },
};
const DEVENV_PRESERVE_FILES = [
    'health-report.json',
    'gaps-report.md',
    'stack-report.json',
    'health-before.json',
    'health-after.json',
    'input.txt',
    'gaps-report.json',
];
async function exists(target) {
    return fs_1.promises
        .access(target)
        .then(() => true)
        .catch(() => false);
}
async function loadSyncConfig(configPath) {
    const raw = await fs_1.promises.readFile(configPath, 'utf8');
    return JSON.parse(raw);
}
function resolveSyncConfigPath(templateRoot, configPath) {
    return configPath ?? path_1.default.join(templateRoot, 'config', 'sync-layers.json');
}
function isBlockedPath(relativePath, globalNeverCopy) {
    const normalized = relativePath.replace(/\\/g, '/');
    return globalNeverCopy.some(blocked => normalized === blocked || normalized.endsWith(`/${blocked}`));
}
async function readRuleAlwaysApply(rulePath) {
    try {
        const content = await fs_1.promises.readFile(rulePath, 'utf8');
        return /^alwaysApply:\s*true/m.test(content);
    }
    catch {
        return false;
    }
}
async function planSkillsSync(templateRoot, projectRoot, layer, overwrite, optionalGroups) {
    const actions = [];
    const skillRoots = [path_1.default.join(templateRoot, '.agents', 'skills')];
    if (optionalGroups) {
        for (const groupPath of Object.values(optionalGroups)) {
            const absolute = path_1.default.join(templateRoot, groupPath);
            if (await exists(absolute)) {
                skillRoots.push(absolute);
            }
        }
    }
    for (const skillsRoot of skillRoots) {
        let entries;
        try {
            entries = await fs_1.promises.readdir(skillsRoot, { withFileTypes: true });
        }
        catch {
            continue;
        }
        for (const entry of entries) {
            if (!entry.isDirectory()) {
                continue;
            }
            const relativeSkill = path_1.default.posix.join('.agents/skills', entry.name, 'SKILL.md');
            const source = path_1.default.join(skillsRoot, entry.name, 'SKILL.md');
            const destination = path_1.default.join(projectRoot, relativeSkill);
            if (!(await exists(source))) {
                continue;
            }
            if ((await exists(destination)) && !overwrite) {
                actions.push({
                    layer,
                    relativePath: relativeSkill,
                    action: 'skip',
                    reason: 'host already has this skill',
                });
                continue;
            }
            actions.push({
                layer,
                relativePath: relativeSkill,
                action: (await exists(destination)) ? 'update' : 'copy',
                reason: overwrite ? 'refresh skill from template' : 'add missing skill from template',
            });
        }
    }
    return actions;
}
async function planCursorRulesSync(templateRoot, projectRoot, layer, stackReport, overwrite) {
    const actions = [];
    const templateRulesDir = path_1.default.join(templateRoot, '.cursor', 'rules');
    const projectRulesDir = path_1.default.join(projectRoot, '.cursor', 'rules');
    for (const ruleFile of cursor_rules_adapter_1.STACK_SCOPED_FILES) {
        if (!(0, cursor_rules_adapter_1.shouldIncludeRule)(ruleFile, stackReport)) {
            continue;
        }
        const source = path_1.default.join(templateRulesDir, ruleFile);
        const destination = path_1.default.join(projectRulesDir, ruleFile);
        const relative = path_1.default.posix.join('.cursor/rules', ruleFile);
        if (!(await exists(source))) {
            continue;
        }
        if (await readRuleAlwaysApply(source)) {
            actions.push({
                layer,
                relativePath: relative,
                action: 'skip',
                reason: 'always-applied rules are never copied',
            });
            continue;
        }
        if ((await exists(destination)) && !overwrite) {
            actions.push({
                layer,
                relativePath: relative,
                action: 'skip',
                reason: 'host already has this rule',
            });
            continue;
        }
        actions.push({
            layer,
            relativePath: relative,
            action: (await exists(destination)) ? 'update' : 'copy',
            reason: 'stack-scoped rule from template',
        });
    }
    for (const retired of cursor_rules_adapter_1.RETIRED_ALWAYS_ON_FILES) {
        const source = path_1.default.join(templateRulesDir, retired);
        if (await exists(source)) {
            actions.push({
                layer,
                relativePath: path_1.default.posix.join('.cursor/rules', retired),
                action: 'skip',
                reason: 'retired always-on rule; migrate to AGENTS.md and skills instead',
            });
        }
    }
    return actions;
}
async function planFileSync(templateRoot, projectRoot, layer, relativePath, overwrite, globalNeverCopy) {
    if (isBlockedPath(relativePath, globalNeverCopy)) {
        return {
            layer,
            relativePath,
            action: 'skip',
            reason: 'path is on the global never-copy list',
        };
    }
    const source = path_1.default.join(templateRoot, relativePath);
    const destination = path_1.default.join(projectRoot, relativePath);
    if (!(await exists(source))) {
        return null;
    }
    if ((await exists(destination)) && !overwrite) {
        return {
            layer,
            relativePath,
            action: 'skip',
            reason: 'host already has this file',
        };
    }
    return {
        layer,
        relativePath,
        action: (await exists(destination)) ? 'update' : 'copy',
        reason: overwrite ? 'refresh from template' : 'add missing entry shape from template',
    };
}
async function planDirectorySync(templateRoot, destinationRoot, layer, relativePath, overwrite, globalNeverCopy) {
    const actions = [];
    const sourceDir = path_1.default.join(templateRoot, relativePath);
    if (!(await exists(sourceDir))) {
        return actions;
    }
    async function walk(currentSource, currentRelative) {
        const entries = await fs_1.promises.readdir(currentSource, { withFileTypes: true });
        for (const entry of entries) {
            const entryRelative = currentRelative
                ? path_1.default.posix.join(currentRelative, entry.name)
                : entry.name;
            if (isBlockedPath(entryRelative, globalNeverCopy)) {
                actions.push({
                    layer,
                    relativePath: entryRelative,
                    action: 'skip',
                    reason: 'path is on the global never-copy list',
                });
                continue;
            }
            const sourcePath = path_1.default.join(currentSource, entry.name);
            const destinationPath = path_1.default.join(destinationRoot, entryRelative);
            if (entry.isDirectory()) {
                await walk(sourcePath, entryRelative);
                continue;
            }
            if (entryRelative.endsWith('.mdc') && (await readRuleAlwaysApply(sourcePath))) {
                actions.push({
                    layer,
                    relativePath: entryRelative,
                    action: 'skip',
                    reason: 'always-applied rules are never copied',
                });
                continue;
            }
            if ((await exists(destinationPath)) && !overwrite) {
                actions.push({
                    layer,
                    relativePath: entryRelative,
                    action: 'skip',
                    reason: 'host already has this file',
                });
                continue;
            }
            actions.push({
                layer,
                relativePath: entryRelative,
                action: (await exists(destinationPath)) ? 'update' : 'copy',
                reason: overwrite ? 'refresh from template' : 'add missing file from template',
            });
        }
    }
    await walk(sourceDir, relativePath.replace(/\\/g, '/'));
    return actions;
}
async function copyFile(source, destination) {
    await fs_1.promises.mkdir(path_1.default.dirname(destination), { recursive: true });
    await fs_1.promises.copyFile(source, destination);
}
async function applyAction(templateRoot, projectRoot, action) {
    const source = path_1.default.join(templateRoot, action.relativePath);
    const destination = path_1.default.join(projectRoot, action.relativePath);
    await copyFile(source, destination);
}
async function planLayerSync(options) {
    const { projectRoot, templateRoot, layers, dryRun = true, stackReport = DEFAULT_STACK_REPORT, } = options;
    const config = await loadSyncConfig(resolveSyncConfigPath(templateRoot, options.configPath));
    const actions = [];
    const warnings = [];
    const recommendations = [];
    if (await exists(path_1.default.join(projectRoot, 'AGENTS.md'))) {
        recommendations.push('Host AGENTS.md is preserved. Review template changes manually if your working agreements need updating.');
    }
    for (const layerName of layers) {
        const layer = config.layers[layerName];
        if (!layer) {
            warnings.push(`Unknown layer "${layerName}"; skipping.`);
            continue;
        }
        let destinationRoot = projectRoot;
        if (layer.requiresDevenv) {
            const devenvDir = path_1.default.join(projectRoot, '.devenv');
            if (!(await exists(devenvDir))) {
                warnings.push(`Layer "${layerName}" applies only when .devenv/ exists. Skipping doctor sync.`);
                continue;
            }
            destinationRoot = devenvDir;
        }
        for (const spec of layer.paths) {
            const overwrite = spec.overwrite === true;
            switch (spec.kind) {
                case 'skills':
                    actions.push(...(await planSkillsSync(templateRoot, destinationRoot, layerName, overwrite, layer.optionalSkillGroups)));
                    break;
                case 'cursor-rules':
                    actions.push(...(await planCursorRulesSync(templateRoot, destinationRoot, layerName, stackReport, overwrite)));
                    break;
                case 'file': {
                    const planned = await planFileSync(templateRoot, destinationRoot, layerName, spec.src, overwrite, config.globalNeverCopy);
                    if (planned) {
                        actions.push(planned);
                    }
                    break;
                }
                case 'directory':
                    actions.push(...(await planDirectorySync(templateRoot, destinationRoot, layerName, spec.src, overwrite, config.globalNeverCopy)));
                    break;
                default:
                    warnings.push(`Unsupported path kind for ${spec.src}`);
            }
        }
    }
    const copied = actions.filter(item => item.action === 'copy' || item.action === 'update');
    const skipped = actions.filter(item => item.action === 'skip');
    return {
        layer: layers,
        dryRun,
        actions,
        copied: copied.map(item => item.relativePath),
        skipped: skipped.map(item => `${item.relativePath} (${item.reason})`),
        warnings,
        recommendations,
    };
}
async function applyAgentContextWithIntegration(projectRoot, templateRoot, stackReport) {
    const integration = await (0, cursor_rules_integration_1.integrateCursorRules)({
        projectRoot,
        templateRulesPath: path_1.default.join(templateRoot, '.cursor', 'rules'),
        templateSkillsPath: path_1.default.join(templateRoot, '.agents', 'skills'),
        stackReport,
        dryRun: false,
    });
    const extraCopied = [];
    for (const relativePath of ['.cursorignore', '.cursor/rules/README.md']) {
        const source = path_1.default.join(templateRoot, relativePath);
        const destination = path_1.default.join(projectRoot, relativePath);
        if ((await exists(source)) && !(await exists(destination))) {
            await copyFile(source, destination);
            extraCopied.push(relativePath);
        }
    }
    return {
        copied: [...integration.copied, ...extraCopied],
        recommendations: integration.recommendations,
    };
}
async function syncFromTemplate(options) {
    const plan = await planLayerSync(options);
    if (options.dryRun !== false) {
        return plan;
    }
    const stackReport = options.stackReport ?? DEFAULT_STACK_REPORT;
    const config = await loadSyncConfig(resolveSyncConfigPath(options.templateRoot, options.configPath));
    if (options.layers.includes('agent-context')) {
        const applied = await applyAgentContextWithIntegration(options.projectRoot, options.templateRoot, stackReport);
        plan.recommendations.push(...applied.recommendations);
    }
    const doctorLayer = config.layers.doctor;
    const devenvDir = path_1.default.join(options.projectRoot, '.devenv');
    const preserveFiles = doctorLayer?.preserveInDevenv ?? DEVENV_PRESERVE_FILES;
    const backupDir = options.layers.includes('doctor') && (await exists(devenvDir))
        ? await fs_1.promises.mkdtemp(path_1.default.join(path_1.default.dirname(devenvDir), '.devenv-sync-backup-'))
        : null;
    if (backupDir) {
        for (const file of preserveFiles) {
            const source = path_1.default.join(devenvDir, file);
            if (await exists(source)) {
                const backup = path_1.default.join(backupDir, file);
                await fs_1.promises.mkdir(path_1.default.dirname(backup), { recursive: true });
                await fs_1.promises.copyFile(source, backup);
            }
        }
    }
    for (const action of plan.actions) {
        if (action.action === 'skip') {
            continue;
        }
        if (action.layer === 'agent-context') {
            continue;
        }
        const destinationRoot = action.layer === 'doctor' ? devenvDir : options.projectRoot;
        await applyAction(options.templateRoot, destinationRoot, action);
    }
    if (backupDir) {
        for (const file of preserveFiles) {
            const backup = path_1.default.join(backupDir, file);
            if (await exists(backup)) {
                await copyFile(backup, path_1.default.join(devenvDir, file));
            }
        }
        await fs_1.promises.rm(backupDir, { recursive: true, force: true });
    }
    logger.info('Layer sync complete', {
        layers: options.layers,
        copied: plan.copied.length,
        skipped: plan.skipped.length,
    });
    return { ...plan, dryRun: false };
}
function runGit(cwd, args) {
    const result = (0, child_process_1.spawnSync)('git', args, { cwd, encoding: 'utf8' });
    return {
        ok: result.status === 0,
        stdout: result.stdout ?? '',
        stderr: result.stderr ?? '',
    };
}
async function mergeDevenvFromTemplate(options) {
    const { templateRoot, devenvDir, dryRun = true } = options;
    if (!(await exists(devenvDir))) {
        throw new Error(`.devenv directory not found: ${devenvDir}`);
    }
    if (!(await exists(path_1.default.join(devenvDir, '.git')))) {
        throw new Error('.devenv is not a git repository');
    }
    const branchResult = runGit(templateRoot, ['rev-parse', '--abbrev-ref', 'HEAD']);
    if (!branchResult.ok) {
        throw new Error(`Could not read template branch: ${branchResult.stderr}`);
    }
    const templateBranch = branchResult.stdout.trim();
    const preserved = [];
    for (const file of DEVENV_PRESERVE_FILES) {
        if (await exists(path_1.default.join(devenvDir, file))) {
            preserved.push(file);
        }
    }
    if (dryRun) {
        return {
            dryRun: true,
            branch: templateBranch,
            preserved,
            message: `Would merge template/${templateBranch} into .devenv and restore ${preserved.length} project-specific file(s). Re-run with --apply to execute.`,
        };
    }
    const backupDir = await fs_1.promises.mkdtemp(path_1.default.join(path_1.default.dirname(devenvDir), '.devenv-sync-backup-'));
    for (const file of preserved) {
        const source = path_1.default.join(devenvDir, file);
        const backup = path_1.default.join(backupDir, file);
        await fs_1.promises.mkdir(path_1.default.dirname(backup), { recursive: true });
        await fs_1.promises.copyFile(source, backup);
    }
    const status = runGit(devenvDir, ['status', '--porcelain']);
    if (status.stdout.trim()) {
        runGit(devenvDir, ['stash', 'push', '-u', '-m', `Sync backup ${new Date().toISOString()}`]);
    }
    const remotes = runGit(devenvDir, ['remote']);
    if (!remotes.stdout.split('\n').includes('template')) {
        runGit(devenvDir, ['remote', 'add', 'template', templateRoot]);
    }
    runGit(devenvDir, ['remote', 'set-url', 'template', templateRoot]);
    const fetch = runGit(devenvDir, ['fetch', 'template', templateBranch]);
    if (!fetch.ok) {
        throw new Error(`git fetch failed: ${fetch.stderr}`);
    }
    const merge = runGit(devenvDir, ['merge', `template/${templateBranch}`, '--no-edit']);
    if (!merge.ok) {
        throw new Error(`Merge conflicts detected. Restore from ${backupDir} after resolving.`);
    }
    for (const file of preserved) {
        const backup = path_1.default.join(backupDir, file);
        if (await exists(backup)) {
            await copyFile(backup, path_1.default.join(devenvDir, file));
        }
    }
    await fs_1.promises.rm(backupDir, { recursive: true, force: true });
    return {
        dryRun: false,
        branch: templateBranch,
        preserved,
        message: `Merged template/${templateBranch} into .devenv.`,
    };
}
//# sourceMappingURL=sync-from-template.js.map