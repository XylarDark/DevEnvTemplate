"use strict";
/**
 * Layer-by-layer adoption for host projects.
 *
 * Layers are independent — each can be taken without the others, matching README.md#adopt-it-in-layers.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_LAYERS = void 0;
exports.adoptLayers = adoptLayers;
exports.parseLayerList = parseLayerList;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const cursor_rules_integration_1 = require("../tools/cursor-rules-integration");
const agents_stub_1 = require("./agents-stub");
exports.ALL_LAYERS = ['agent-context', 'operational-memory', 'doctor'];
const OPERATIONAL_FILES = [
    { stub: 'KNOWN_ERRORS.stub.md', dest: 'docs/KNOWN_ERRORS.md' },
    { stub: 'DOCS_LAYOUT.stub.md', dest: 'docs/DOCS_LAYOUT.md' },
    { stub: 'automation-gaps.stub.md', dest: 'docs/operational/automation-gaps.md' },
];
const DOCTOR_VENDOR_PATHS = [
    'package.json',
    'package-lock.json',
    'tsconfig.json',
    'config',
    'scripts/doctor',
    'scripts/tools',
    'scripts/utils',
    '.cursor/rules',
    '.agents/skills',
    'eslint.config.js',
    '.prettierrc',
    '.nvmrc',
];
const DOCTOR_SKIP_DIR_NAMES = new Set([
    'node_modules',
    '.git',
    'dist',
    '.devenv',
    'coverage',
    'tests',
]);
async function exists(target) {
    return fs_1.promises
        .access(target)
        .then(() => true)
        .catch(() => false);
}
async function copyStubIfMissing(templateRoot, projectRoot, stubName, destRelative, dryRun) {
    const source = path_1.default.join(templateRoot, 'scripts', 'agent', 'stubs', stubName);
    const destination = path_1.default.join(projectRoot, destRelative);
    if (await exists(destination)) {
        return { copied: false, skipped: true };
    }
    if (dryRun) {
        return { copied: false, skipped: false };
    }
    await fs_1.promises.mkdir(path_1.default.dirname(destination), { recursive: true });
    await fs_1.promises.copyFile(source, destination);
    return { copied: true, skipped: false };
}
async function adoptAgentContext(options) {
    const { projectRoot, templateRoot, stackReport, dryRun = false } = options;
    const result = {
        layer: 'agent-context',
        copied: [],
        skipped: [],
        recommendations: [],
    };
    if (dryRun) {
        result.recommendations.push('[DRY RUN] Would copy stack-scoped rules and skills.');
        return result;
    }
    const integration = await (0, cursor_rules_integration_1.integrateCursorRules)({
        projectRoot,
        templateRulesPath: path_1.default.join(templateRoot, '.cursor', 'rules'),
        templateSkillsPath: path_1.default.join(templateRoot, '.agents', 'skills'),
        stackReport,
        dryRun: false,
    });
    result.copied.push(...integration.copied);
    result.skipped.push(...integration.skipped);
    result.recommendations.push(...integration.recommendations);
    return result;
}
async function adoptOperationalMemory(options) {
    const { projectRoot, templateRoot, dryRun = false } = options;
    const result = {
        layer: 'operational-memory',
        copied: [],
        skipped: [],
        recommendations: [],
    };
    for (const { stub, dest } of OPERATIONAL_FILES) {
        const outcome = await copyStubIfMissing(templateRoot, projectRoot, stub, dest, dryRun);
        if (outcome.copied) {
            result.copied.push(dest);
        }
        else if (outcome.skipped) {
            result.skipped.push(dest);
        }
        else if (dryRun) {
            result.recommendations.push(`[DRY RUN] Would copy ${dest}`);
        }
    }
    return result;
}
async function shouldSkipDoctorPath(relativePath) {
    return relativePath.split(path_1.default.sep).some(part => DOCTOR_SKIP_DIR_NAMES.has(part));
}
async function copyDoctorTree(sourceRoot, destRoot, relativePath, dryRun, copied) {
    if (await shouldSkipDoctorPath(relativePath)) {
        return;
    }
    const source = path_1.default.join(sourceRoot, relativePath);
    const destination = path_1.default.join(destRoot, relativePath);
    let stat;
    try {
        stat = await fs_1.promises.stat(source);
    }
    catch {
        return;
    }
    if (stat.isDirectory()) {
        if (!dryRun) {
            await fs_1.promises.mkdir(destination, { recursive: true });
        }
        const entries = await fs_1.promises.readdir(source, { withFileTypes: true });
        for (const entry of entries) {
            const childRelative = path_1.default.join(relativePath, entry.name);
            if (entry.isDirectory()) {
                await copyDoctorTree(sourceRoot, destRoot, childRelative, dryRun, copied);
            }
            else if (entry.isFile()) {
                const childDest = path_1.default.join(destRoot, childRelative);
                if (!(await exists(childDest))) {
                    if (!dryRun) {
                        await fs_1.promises.mkdir(path_1.default.dirname(childDest), { recursive: true });
                        await fs_1.promises.copyFile(path_1.default.join(source, entry.name), childDest);
                    }
                    copied.push(path_1.default.join('.devenv', childRelative));
                }
            }
        }
        return;
    }
    if (!(await exists(destination))) {
        if (!dryRun) {
            await fs_1.promises.mkdir(path_1.default.dirname(destination), { recursive: true });
            await fs_1.promises.copyFile(source, destination);
        }
        copied.push(path_1.default.join('.devenv', relativePath));
    }
}
async function wireDoctorScripts(projectRoot, dryRun) {
    const packageJsonPath = path_1.default.join(projectRoot, 'package.json');
    if (!(await exists(packageJsonPath))) {
        return ['No host package.json — add doctor scripts manually after `cd .devenv && npm install`.'];
    }
    const raw = await fs_1.promises.readFile(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(raw);
    packageJson.scripts ??= {};
    const doctorScripts = {
        doctor: 'node .devenv/dist/scripts/doctor/cli.js',
        'doctor:fix': 'node .devenv/dist/scripts/doctor/cli.js --fix',
    };
    const added = [];
    for (const [name, command] of Object.entries(doctorScripts)) {
        if (!packageJson.scripts[name]) {
            packageJson.scripts[name] = command;
            added.push(name);
        }
    }
    if (added.length > 0 && !dryRun) {
        await fs_1.promises.writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8');
    }
    return added.length > 0
        ? [`Added npm scripts: ${added.join(', ')}.`]
        : ['Host package.json already defines doctor scripts.'];
}
async function ensureDevenvGitignore(projectRoot, dryRun) {
    const gitignorePath = path_1.default.join(projectRoot, '.gitignore');
    const entry = '.devenv/\n';
    let existing = '';
    if (await exists(gitignorePath)) {
        existing = await fs_1.promises.readFile(gitignorePath, 'utf8');
        if (existing.includes('.devenv')) {
            return;
        }
    }
    if (dryRun) {
        return;
    }
    const needsLeadingNewline = existing.length > 0 && !existing.endsWith('\n');
    const addition = `${needsLeadingNewline ? '\n' : ''}# .devenv workspace (auto-added)\n${entry}`;
    await fs_1.promises.writeFile(gitignorePath, existing + addition, 'utf8');
}
async function adoptDoctor(options) {
    const { projectRoot, templateRoot, dryRun = false } = options;
    const devenvRoot = path_1.default.join(projectRoot, '.devenv');
    const result = {
        layer: 'doctor',
        copied: [],
        skipped: [],
        recommendations: [],
    };
    if (dryRun) {
        result.recommendations.push('[DRY RUN] Would vendor doctor toolchain under .devenv/.');
        return result;
    }
    await fs_1.promises.mkdir(devenvRoot, { recursive: true });
    for (const relativePath of DOCTOR_VENDOR_PATHS) {
        await copyDoctorTree(templateRoot, devenvRoot, relativePath, dryRun, result.copied);
    }
    await ensureDevenvGitignore(projectRoot, dryRun);
    result.recommendations.push(...(await wireDoctorScripts(projectRoot, dryRun)));
    result.recommendations.push('Run `cd .devenv && npm install && npm run build` once to compile the doctor.');
    return result;
}
async function adoptLayers(options) {
    const selected = new Set(options.layers);
    const declined = options.declinedLayers ?? exports.ALL_LAYERS.filter(layer => !selected.has(layer));
    const results = [];
    let agentsMd;
    if (selected.has('agent-context') && !options.dryRun) {
        agentsMd = await (0, agents_stub_1.writeAgentsStub)({
            projectRoot: options.projectRoot,
            stackReport: options.stackReport,
            declinedLayers: declined,
        });
    }
    else if (selected.has('agent-context') && options.dryRun) {
        agentsMd = {
            written: false,
            path: path_1.default.join(options.projectRoot, 'AGENTS.md'),
            skippedReason: 'dry run',
        };
    }
    if (selected.has('agent-context')) {
        results.push(await adoptAgentContext(options));
    }
    if (selected.has('operational-memory')) {
        results.push(await adoptOperationalMemory(options));
    }
    if (selected.has('doctor')) {
        results.push(await adoptDoctor(options));
    }
    return { results, agentsMd };
}
function parseLayerList(raw) {
    if (!raw) {
        return null;
    }
    const tokens = raw.split(',').map(part => part.trim()).filter(Boolean);
    const valid = new Set(exports.ALL_LAYERS);
    const parsed = [];
    for (const token of tokens) {
        if (!valid.has(token)) {
            throw new Error(`Unknown layer "${token}". Choose from: ${exports.ALL_LAYERS.join(', ')}`);
        }
        parsed.push(token);
    }
    return parsed.length > 0 ? parsed : null;
}
//# sourceMappingURL=layers.js.map