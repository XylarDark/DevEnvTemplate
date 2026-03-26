#!/usr/bin/env node

/**
 * Cursor Rules Integration
 * 
 * Handles copying and merging cursor rules from .devenv/.cursor/rules to project.
 */

import { promises as fs } from 'fs';
import path from 'path';
import type { StackReport, CursorRulesInfo } from '../types/gaps';
import { createLogger } from '../utils/logger';
import { detectExistingRules, adaptRulesForStack, shouldIncludeRule } from './cursor-rules-adapter';

const logger = createLogger({ context: 'cursor-rules-integration' });

export interface IntegrationOptions {
  projectRoot: string;
  templateRulesPath: string;
  stackReport: StackReport;
  overwriteCore?: boolean;
  dryRun?: boolean;
}

export interface IntegrationResult {
  copied: string[];
  updated: string[];
  preserved: string[];
  skipped: string[];
  conflicts: string[];
  recommendations: string[];
}

const STANDARD_CORE_FILES = [
  '00-core-principles.mdc',
  '01-code-quality.mdc',
  '02-security.mdc',
  '03-testing.mdc',
  '04-git-workflow.mdc',
  '05-error-handling.mdc',
  '06-documentation.mdc',
  '07-ai-agent-behavior.mdc',
  '08-project-context.mdc',
  '16-feature-debug-instrumentation.mdc',
  '17-plan-first.mdc',
  '18-content-and-data-pipelines.mdc',
  '19-docs-directory-structure.mdc',
  'automation-standards.mdc'
];

/**
 * Copy core rules from template to project
 */
async function copyCoreRules(
  templatePath: string,
  projectPath: string,
  overwrite: boolean
): Promise<string[]> {
  const copied: string[] = [];

  // Ensure project directory exists
  await fs.mkdir(projectPath, { recursive: true });

  for (const coreFile of STANDARD_CORE_FILES) {
    const templateFile = path.join(templatePath, coreFile);
    const projectFile = path.join(projectPath, coreFile);

    try {
      // Check if template file exists
      await fs.access(templateFile);

      // Check if project file exists
      const projectExists = await fs.access(projectFile).then(() => true).catch(() => false);

      if (!projectExists || overwrite) {
        // Copy file
        const content = await fs.readFile(templateFile, 'utf8');
        await fs.writeFile(projectFile, content, 'utf8');
        copied.push(coreFile);
      }
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        logger.warn(`Error copying core rule ${coreFile}`, { error: error.message });
      }
    }
  }

  return copied;
}

/**
 * Copy conditional rules based on stack
 */
async function copyConditionalRules(
  templatePath: string,
  projectPath: string,
  stackReport: StackReport
): Promise<string[]> {
  const copied: string[] = [];

  // Ensure project directory exists
  await fs.mkdir(projectPath, { recursive: true });

  // Get list of conditional files to include
  const conditionalFiles = [
    '10-typescript.mdc',
    '11-javascript.mdc',
    '12-python.mdc',
    '13-markdown.mdc',
    '14-json-yaml.mdc',
    '15-shell-scripts.mdc',
    '20-frontend-frameworks.mdc'
  ];

  for (const conditionalFile of conditionalFiles) {
    if (!shouldIncludeRule(conditionalFile, stackReport)) {
      continue;
    }

    const templateFile = path.join(templatePath, conditionalFile);
    const projectFile = path.join(projectPath, conditionalFile);

    try {
      // Check if template file exists
      await fs.access(templateFile);

      // Check if project file exists
      const projectExists = await fs.access(projectFile).then(() => true).catch(() => false);

      if (!projectExists) {
        // Copy file (don't overwrite existing project files)
        const content = await fs.readFile(templateFile, 'utf8');
        await fs.writeFile(projectFile, content, 'utf8');
        copied.push(conditionalFile);
      }
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        logger.warn(`Error copying conditional rule ${conditionalFile}`, { error: error.message });
      }
    }
  }

  return copied;
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
        // Check if it's a project-specific file (not in standard list)
        const isStandard = STANDARD_CORE_FILES.includes(entry.name) ||
          entry.name.startsWith('10-') || entry.name.startsWith('11-') ||
          entry.name.startsWith('12-') || entry.name.startsWith('13-') ||
          entry.name.startsWith('14-') || entry.name.startsWith('15-') ||
          entry.name.startsWith('20-') || entry.name.startsWith('21-') ||
          entry.name.startsWith('22-');

        if (!isStandard) {
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
 * Copy README if it exists
 */
async function copyReadme(
  templatePath: string,
  projectPath: string
): Promise<boolean> {
  const templateReadme = path.join(templatePath, 'README.md');
  const projectReadme = path.join(projectPath, 'README.md');

  try {
    await fs.access(templateReadme);
    const content = await fs.readFile(templateReadme, 'utf8');
    
    // Check if project README exists
    const projectExists = await fs.access(projectReadme).then(() => true).catch(() => false);
    
    if (!projectExists) {
      await fs.writeFile(projectReadme, content, 'utf8');
      return true;
    }
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      logger.warn('Error copying README', { error: error.message });
    }
  }

  return false;
}

/**
 * Main integration function
 */
export async function integrateCursorRules(
  options: IntegrationOptions
): Promise<IntegrationResult> {
  const {
    projectRoot,
    templateRulesPath,
    stackReport,
    overwriteCore = false,
    dryRun = false
  } = options;

  const result: IntegrationResult = {
    copied: [],
    updated: [],
    preserved: [],
    skipped: [],
    conflicts: [],
    recommendations: []
  };

  const projectRulesPath = path.join(projectRoot, '.cursor', 'rules');

  // Detect existing rules
  const existingRules = await detectExistingRules(projectRoot);

  if (dryRun) {
    logger.info('[DRY RUN] Would integrate cursor rules', {
      projectPath: projectRulesPath,
      templatePath: templateRulesPath,
      existingRules: existingRules.existingFiles.length
    });
    return result;
  }

  // Ensure project directory exists
  await fs.mkdir(projectRulesPath, { recursive: true });

  // Preserve project-specific rules
  if (existingRules.present) {
    result.preserved = await preserveProjectRules(projectRulesPath);
  }

  // Copy core rules
  const copiedCore = await copyCoreRules(templateRulesPath, projectRulesPath, overwriteCore);
  result.copied.push(...copiedCore);

  // For existing core files that weren't overwritten, mark as updated if they exist
  if (existingRules.present && !overwriteCore) {
    for (const coreFile of STANDARD_CORE_FILES) {
      if (existingRules.coreFiles.includes(coreFile) && !copiedCore.includes(coreFile)) {
        result.updated.push(coreFile);
      }
    }
  }

  // Copy conditional rules based on stack
  const copiedConditional = await copyConditionalRules(
    templateRulesPath,
    projectRulesPath,
    stackReport
  );
  result.copied.push(...copiedConditional);

  // Copy README
  const readmeCopied = await copyReadme(templateRulesPath, projectRulesPath);
  if (readmeCopied) {
    result.copied.push('README.md');
  }

  // Generate recommendations
  if (result.preserved.length > 0) {
    result.recommendations.push(
      `Preserved ${result.preserved.length} project-specific rule file(s). Review them to ensure compatibility.`
    );
  }

  if (existingRules.present && existingRules.coreFiles.length < STANDARD_CORE_FILES.length) {
    const missing = STANDARD_CORE_FILES.filter(f => !existingRules.coreFiles.includes(f));
    result.recommendations.push(
      `Added ${missing.length} missing core rule file(s).`
    );
  }

  logger.info('Cursor rules integration complete', {
    copied: result.copied.length,
    updated: result.updated.length,
    preserved: result.preserved.length
  });

  return result;
}

