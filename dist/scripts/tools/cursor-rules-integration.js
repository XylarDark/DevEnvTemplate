#!/usr/bin/env node
"use strict";
/**
 * Cursor Rules Integration
 *
 * Copies the portable agent layer from this template into a host project: the glob-scoped Cursor
 * rules that match the host's detected stack, plus the skills that carry procedural knowledge.
 *
 * What this deliberately does not copy is `AGENTS.md`. That file states facts about one specific
 * repository - its stack, its commands, its layout - so a copied one would be wrong from the
 * first line. Hosts get a recommendation to write their own instead.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.integrateCursorRules = integrateCursorRules;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const logger_1 = require("../utils/logger");
const cursor_rules_adapter_1 = require("./cursor-rules-adapter");
const logger = (0, logger_1.createLogger)({ context: 'cursor-rules-integration' });
/**
 * Opens any part of a skill that is specific to the repository shipping it. A host that copies
 * the skill has to replace that section: a skill naming `npm run lint` in a project with no
 * linter sends agents to run a command that does not exist, and nothing fails loudly.
 */
const LOCALIZE_MARKER = 'Localize on copy';
/**
 * Copy the glob-scoped rules that match the detected stack. Existing host files are never
 * overwritten: a host may have edited a rule, and silently replacing that edit is the kind of
 * data loss this template exists to prevent.
 */
async function copyStackRules(templatePath, projectPath, stackReport) {
    const copied = [];
    const preserved = [];
    await fs_1.promises.mkdir(projectPath, { recursive: true });
    for (const ruleFile of cursor_rules_adapter_1.STACK_SCOPED_FILES) {
        if (!(0, cursor_rules_adapter_1.shouldIncludeRule)(ruleFile, stackReport)) {
            continue;
        }
        const templateFile = path_1.default.join(templatePath, ruleFile);
        const projectFile = path_1.default.join(projectPath, ruleFile);
        try {
            await fs_1.promises.access(templateFile);
            if (await exists(projectFile)) {
                preserved.push(ruleFile);
                logger.debug(`Kept existing rule ${ruleFile}`);
                continue;
            }
            await fs_1.promises.copyFile(templateFile, projectFile);
            copied.push(ruleFile);
        }
        catch (error) {
            if (error.code !== 'ENOENT') {
                logger.warn(`Error copying rule ${ruleFile}`, { error: error.message });
            }
        }
    }
    return { copied, preserved };
}
/**
 * Copy `.agents/skills/<name>/SKILL.md` into the host. Skills are stack-agnostic procedural
 * knowledge, so all of them travel; each stays dormant until its `description` matches a task.
 */
async function copySkills(templateSkillsPath, projectSkillsPath) {
    const copied = [];
    const preserved = [];
    const needsLocalization = [];
    let entries;
    try {
        entries = await fs_1.promises.readdir(templateSkillsPath, { withFileTypes: true });
    }
    catch (error) {
        if (error.code !== 'ENOENT') {
            logger.warn('Error reading template skills', { error: error.message });
        }
        return { copied, preserved, needsLocalization };
    }
    for (const entry of entries) {
        if (!entry.isDirectory()) {
            continue;
        }
        const source = path_1.default.join(templateSkillsPath, entry.name, 'SKILL.md');
        if (!(await exists(source))) {
            continue;
        }
        const destinationDir = path_1.default.join(projectSkillsPath, entry.name);
        const destination = path_1.default.join(destinationDir, 'SKILL.md');
        if (await exists(destination)) {
            preserved.push(`${entry.name}/SKILL.md`);
            continue;
        }
        try {
            await fs_1.promises.mkdir(destinationDir, { recursive: true });
            await fs_1.promises.copyFile(source, destination);
            copied.push(`${entry.name}/SKILL.md`);
            if ((await fs_1.promises.readFile(source, 'utf8')).includes(LOCALIZE_MARKER)) {
                needsLocalization.push(entry.name);
            }
        }
        catch (error) {
            logger.warn(`Error copying skill ${entry.name}`, { error: error.message });
        }
    }
    return { copied, preserved, needsLocalization };
}
async function exists(target) {
    return fs_1.promises
        .access(target)
        .then(() => true)
        .catch(() => false);
}
/**
 * Preserve project-specific rules
 */
async function preserveProjectRules(projectPath) {
    const preserved = [];
    try {
        const entries = await fs_1.promises.readdir(projectPath, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isFile() && entry.name.endsWith('.mdc')) {
                const isTemplateRule = cursor_rules_adapter_1.STACK_SCOPED_FILES.includes(entry.name) || cursor_rules_adapter_1.RETIRED_ALWAYS_ON_FILES.includes(entry.name);
                if (!isTemplateRule) {
                    preserved.push(entry.name);
                }
            }
        }
    }
    catch (error) {
        if (error.code !== 'ENOENT') {
            logger.warn('Error preserving project rules', { error: error.message });
        }
    }
    return preserved;
}
/**
 * Copy the stack-scoped rules and the skills into a host project.
 */
async function integrateCursorRules(options) {
    const { projectRoot, templateRulesPath, stackReport, dryRun = false } = options;
    // The skills live next to `.cursor/` in the template, two levels up from the rules directory.
    const templateSkillsPath = options.templateSkillsPath ?? path_1.default.join(templateRulesPath, '..', '..', '.agents', 'skills');
    const templateSkillsExtrasPath = options.templateSkillsExtrasPath ??
        path_1.default.join(templateRulesPath, '..', '..', '.agents', 'skills-extras');
    const result = {
        copied: [],
        skipped: [],
        preserved: [],
        needsLocalization: [],
        recommendations: [],
    };
    const projectRulesPath = path_1.default.join(projectRoot, '.cursor', 'rules');
    const projectSkillsPath = path_1.default.join(projectRoot, '.agents', 'skills');
    const existingRules = await (0, cursor_rules_adapter_1.detectExistingRules)(projectRoot);
    if (dryRun) {
        logger.info('[DRY RUN] Would integrate the agent layer', {
            rulesPath: projectRulesPath,
            skillsPath: projectSkillsPath,
            existingRules: existingRules.existingFiles.length,
        });
        return result;
    }
    if (existingRules.present) {
        result.preserved.push(...(await preserveProjectRules(projectRulesPath)));
    }
    const rules = await copyStackRules(templateRulesPath, projectRulesPath, stackReport);
    result.copied.push(...rules.copied);
    result.skipped.push(...rules.preserved);
    const skills = await copySkills(templateSkillsPath, projectSkillsPath);
    result.copied.push(...skills.copied);
    result.skipped.push(...skills.preserved);
    result.needsLocalization.push(...skills.needsLocalization);
    if (options.includeSkillExtras) {
        const extras = await copySkills(templateSkillsExtrasPath, projectSkillsPath);
        result.copied.push(...extras.copied);
        result.skipped.push(...extras.preserved);
        result.needsLocalization.push(...extras.needsLocalization);
    }
    // Told at the moment of copying, because the alternative is an agent in the host project
    // running a command that only exists in this repository and getting no useful error.
    if (result.needsLocalization.length > 0) {
        result.recommendations.push(`${result.needsLocalization.length} copied skill(s) contain a "${LOCALIZE_MARKER}" section describing this template's own commands and layout: ${result.needsLocalization.join(', ')}. Rewrite those sections for your project, or delete them. The rest of each skill is stack-agnostic and needs no changes.`);
    }
    if (result.preserved.length > 0) {
        result.recommendations.push(`Preserved ${result.preserved.length} project-specific rule file(s). Review them for overlap with AGENTS.md.`);
    }
    if (result.skipped.length > 0) {
        result.recommendations.push(`Kept ${result.skipped.length} existing file(s) rather than overwriting. Compare them against the template if you want the newer version.`);
    }
    // A host carrying the retired rules pays for them on every turn, so name each one and where
    // its content went.
    if (existingRules.retiredAlwaysOnFiles.length > 0) {
        const migrations = existingRules.retiredAlwaysOnFiles
            .map(file => `${file} -> ${cursor_rules_adapter_1.RETIRED_RULE_REPLACEMENTS[file] ?? 'AGENTS.md'}`)
            .join(', ');
        result.recommendations.push(`${existingRules.retiredAlwaysOnFiles.length} always-applied rule(s) are loaded on every turn and are no longer part of this template. Migrate and delete them: ${migrations}`);
    }
    if (!(await exists(path_1.default.join(projectRoot, 'AGENTS.md')))) {
        result.recommendations.push('No AGENTS.md found. Write one describing this project: stack, commands, layout, and conventions. It is the canonical context every agent reads, and it is not copied from the template because it must describe your repository.');
    }
    logger.info('Agent layer integration complete', {
        copied: result.copied.length,
        skipped: result.skipped.length,
        preserved: result.preserved.length,
    });
    return result;
}
//# sourceMappingURL=cursor-rules-integration.js.map