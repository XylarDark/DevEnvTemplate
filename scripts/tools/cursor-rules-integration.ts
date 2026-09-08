#!/usr/bin/env node

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

import { promises as fs } from 'fs';
import path from 'path';
import type { StackReport } from '../types/gaps';
import { createLogger } from '../utils/logger';
import {
  detectExistingRules,
  shouldIncludeRule,
  STACK_SCOPED_FILES,
  RETIRED_ALWAYS_ON_FILES,
  RETIRED_RULE_REPLACEMENTS,
} from './cursor-rules-adapter';

const logger = createLogger({ context: 'cursor-rules-integration' });

export interface IntegrationOptions {
  projectRoot: string;
  templateRulesPath: string;
  stackReport: StackReport;
  /** Defaults to `.agents/skills` alongside the template's `.cursor/`. */
  templateSkillsPath?: string;
  dryRun?: boolean;
}

export interface IntegrationResult {
  /** Files written into the host. */
  copied: string[];
  /** Template files the host already had, left untouched. */
  skipped: string[];
  /** The host's own rules, which the template does not manage. */
  preserved: string[];
  recommendations: string[];
}

/**
 * Copy the glob-scoped rules that match the detected stack. Existing host files are never
 * overwritten: a host may have edited a rule, and silently replacing that edit is the kind of
 * data loss this template exists to prevent.
 */
async function copyStackRules(
  templatePath: string,
  projectPath: string,
  stackReport: StackReport
): Promise<{ copied: string[]; preserved: string[] }> {
  const copied: string[] = [];
  const preserved: string[] = [];

  await fs.mkdir(projectPath, { recursive: true });

  for (const ruleFile of STACK_SCOPED_FILES) {
    if (!shouldIncludeRule(ruleFile, stackReport)) {
      continue;
    }

    const templateFile = path.join(templatePath, ruleFile);
    const projectFile = path.join(projectPath, ruleFile);

    try {
      await fs.access(templateFile);

      if (await exists(projectFile)) {
        preserved.push(ruleFile);
        logger.debug(`Kept existing rule ${ruleFile}`);
        continue;
      }

      await fs.copyFile(templateFile, projectFile);
      copied.push(ruleFile);
    } catch (error: any) {
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
async function copySkills(
  templateSkillsPath: string,
  projectSkillsPath: string
): Promise<{ copied: string[]; preserved: string[] }> {
  const copied: string[] = [];
  const preserved: string[] = [];

  let entries;
  try {
    entries = await fs.readdir(templateSkillsPath, { withFileTypes: true });
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      logger.warn('Error reading template skills', { error: error.message });
    }
    return { copied, preserved };
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const source = path.join(templateSkillsPath, entry.name, 'SKILL.md');
    if (!(await exists(source))) {
      continue;
    }

    const destinationDir = path.join(projectSkillsPath, entry.name);
    const destination = path.join(destinationDir, 'SKILL.md');

    if (await exists(destination)) {
      preserved.push(`${entry.name}/SKILL.md`);
      continue;
    }

    try {
      await fs.mkdir(destinationDir, { recursive: true });
      await fs.copyFile(source, destination);
      copied.push(`${entry.name}/SKILL.md`);
    } catch (error: any) {
      logger.warn(`Error copying skill ${entry.name}`, { error: error.message });
    }
  }

  return { copied, preserved };
}

async function exists(target: string): Promise<boolean> {
  return fs
    .access(target)
    .then(() => true)
    .catch(() => false);
}

/**
 * Preserve project-specific rules
 */
async function preserveProjectRules(projectPath: string): Promise<string[]> {
  const preserved: string[] = [];

  try {
    const entries = await fs.readdir(projectPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.mdc')) {
        const isTemplateRule =
          STACK_SCOPED_FILES.includes(entry.name) || RETIRED_ALWAYS_ON_FILES.includes(entry.name);

        if (!isTemplateRule) {
          preserved.push(entry.name);
        }
      }
    }
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      logger.warn('Error preserving project rules', { error: error.message });
    }
  }

  return preserved;
}

/**
 * Copy the stack-scoped rules and the skills into a host project.
 */
export async function integrateCursorRules(
  options: IntegrationOptions
): Promise<IntegrationResult> {
  const { projectRoot, templateRulesPath, stackReport, dryRun = false } = options;

  // The skills live next to `.cursor/` in the template, two levels up from the rules directory.
  const templateSkillsPath =
    options.templateSkillsPath ?? path.join(templateRulesPath, '..', '..', '.agents', 'skills');

  const result: IntegrationResult = {
    copied: [],
    skipped: [],
    preserved: [],
    recommendations: [],
  };

  const projectRulesPath = path.join(projectRoot, '.cursor', 'rules');
  const projectSkillsPath = path.join(projectRoot, '.agents', 'skills');

  const existingRules = await detectExistingRules(projectRoot);

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

  if (result.preserved.length > 0) {
    result.recommendations.push(
      `Preserved ${result.preserved.length} project-specific rule file(s). Review them for overlap with AGENTS.md.`
    );
  }

  if (result.skipped.length > 0) {
    result.recommendations.push(
      `Kept ${result.skipped.length} existing file(s) rather than overwriting. Compare them against the template if you want the newer version.`
    );
  }

  // A host carrying the retired rules pays for them on every turn, so name each one and where
  // its content went.
  if (existingRules.retiredAlwaysOnFiles.length > 0) {
    const migrations = existingRules.retiredAlwaysOnFiles
      .map(file => `${file} -> ${RETIRED_RULE_REPLACEMENTS[file] ?? 'AGENTS.md'}`)
      .join(', ');
    result.recommendations.push(
      `${existingRules.retiredAlwaysOnFiles.length} always-applied rule(s) are loaded on every turn and are no longer part of this template. Migrate and delete them: ${migrations}`
    );
  }

  if (!(await exists(path.join(projectRoot, 'AGENTS.md')))) {
    result.recommendations.push(
      'No AGENTS.md found. Write one describing this project: stack, commands, layout, and conventions. It is the canonical context every agent reads, and it is not copied from the template because it must describe your repository.'
    );
  }

  logger.info('Agent layer integration complete', {
    copied: result.copied.length,
    skipped: result.skipped.length,
    preserved: result.preserved.length,
  });

  return result;
}
