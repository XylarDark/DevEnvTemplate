#!/usr/bin/env node

/**
 * Cursor Rules Adapter
 * 
 * Handles intelligent selection and adaptation of cursor rules based on detected technologies.
 */

import { promises as fs } from 'fs';
import path from 'path';
import type { StackReport, CursorRulesInfo } from '../types/gaps';
import { createLogger } from '../utils/logger';

const logger = createLogger({ context: 'cursor-rules-adapter' });

export interface CursorRulesInfoExtended extends CursorRulesInfo {
  templatePath?: string;
  projectPath?: string;
}

export interface RuleSelectionResult {
  coreRules: string[];
  conditionalRules: string[];
  skippedRules: string[];
  reason: string;
}

/**
 * Standard core rule files
 */
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

const STANDARD_CONDITIONAL_FILES = [
  '10-typescript.mdc',
  '11-javascript.mdc',
  '12-python.mdc',
  '13-markdown.mdc',
  '14-json-yaml.mdc',
  '15-shell-scripts.mdc',
  '20-frontend-frameworks.mdc',
  '21-unreal-engine.mdc',
  '22-unreal-editor-ui.mdc'
];

/**
 * Detect existing cursor rules in project
 */
export async function detectExistingRules(projectRoot: string): Promise<CursorRulesInfo> {
  const rulesDir = path.join(projectRoot, '.cursor', 'rules');
  
  const result: CursorRulesInfo = {
    present: false,
    existingFiles: [],
    coreFiles: [],
    conditionalFiles: [],
    projectSpecificFiles: [],
    needsIntegration: false
  };

  try {
    await fs.access(rulesDir);
    result.present = true;

    const entries = await fs.readdir(rulesDir, { withFileTypes: true });
    const mdcFiles: string[] = [];

    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.mdc')) {
        mdcFiles.push(entry.name);
      }
    }

    result.existingFiles = mdcFiles.sort();

    // Categorize files
    for (const file of mdcFiles) {
      if (STANDARD_CORE_FILES.includes(file)) {
        result.coreFiles.push(file);
      } else if (STANDARD_CONDITIONAL_FILES.includes(file)) {
        result.conditionalFiles.push(file);
      } else {
        result.projectSpecificFiles.push(file);
      }
    }

    // Determine if integration is needed
    const missingCoreFiles = STANDARD_CORE_FILES.filter(f => !result.coreFiles.includes(f));
    result.needsIntegration = missingCoreFiles.length > 0 || result.projectSpecificFiles.length > 0;

  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      logger.warn('Error detecting existing cursor rules', { error: error.message });
    }
  }

  return result;
}

/**
 * Determine which rules should be included based on stack report
 */
export function shouldIncludeRule(ruleFile: string, stackReport: StackReport): boolean {
  const techNames = stackReport.technologies.map(t => t.name.toLowerCase());
  const hasTypeScript = stackReport.quality.typescript || 
    techNames.some(n => n.includes('typescript'));
  const hasJavaScript = techNames.some(n => 
    n.includes('javascript') || n.includes('node.js') || n.includes('node')
  );
  const hasPython = techNames.some(n => 
    n.includes('python') || n.includes('pytest') || n.includes('fastapi') || 
    n.includes('django') || n.includes('flask')
  );
  const hasFrontend = techNames.some(n => 
    n.includes('react') || n.includes('next.js') || n.includes('nextjs') || 
    n.includes('vue') || n.includes('svelte')
  ) || stackReport.frameworks.type !== 'vanilla';

  // Rule mapping
  switch (ruleFile) {
    case '10-typescript.mdc':
      return hasTypeScript;
    case '11-javascript.mdc':
      return hasJavaScript && !hasTypeScript; // Only if no TypeScript
    case '12-python.mdc':
      return hasPython;
    case '13-markdown.mdc':
      // Always include if project has markdown files (we can't easily detect this, so include by default)
      return true;
    case '14-json-yaml.mdc':
      // Always include (most projects have config files)
      return true;
    case '15-shell-scripts.mdc':
      // Check if project has shell scripts
      return stackReport.files.key_patterns.some(p => 
        p.includes('.sh') || p.includes('.ps1') || p.includes('.bat')
      ) || true; // Include by default as many projects have scripts
    case '20-frontend-frameworks.mdc':
      return hasFrontend;
    case '21-unreal-engine.mdc':
    case '22-unreal-editor-ui.mdc':
      return stackReport.unrealProjectDetected === true;
    default:
      // Core files are always included when requested via shouldIncludeRule
      return STANDARD_CORE_FILES.includes(ruleFile);
  }
}

/**
 * Adapt rules for detected stack
 */
export async function adaptRulesForStack(
  stackReport: StackReport,
  templateRulesPath: string
): Promise<string[]> {
  const selectedRules: string[] = [];

  try {
    // Get all available rule files from template
    const entries = await fs.readdir(templateRulesPath, { withFileTypes: true });
    const availableRules: string[] = [];

    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.mdc')) {
        availableRules.push(entry.name);
      }
    }

    // Always include core rules
    for (const coreFile of STANDARD_CORE_FILES) {
      if (availableRules.includes(coreFile)) {
        selectedRules.push(coreFile);
      }
    }

    // Conditionally include based on stack
    for (const conditionalFile of STANDARD_CONDITIONAL_FILES) {
      if (availableRules.includes(conditionalFile) && shouldIncludeRule(conditionalFile, stackReport)) {
        selectedRules.push(conditionalFile);
      }
    }

    // Always include README if it exists
    try {
      await fs.access(path.join(templateRulesPath, 'README.md'));
      // README is not a rule file, but we'll note it separately
    } catch {
      // README doesn't exist, that's fine
    }

    logger.debug('Adapted rules for stack', {
      totalAvailable: availableRules.length,
      selected: selectedRules.length,
      stack: stackReport.languageProfile
    });

  } catch (error: any) {
    logger.error('Error adapting rules for stack', { error: error.message });
    throw error;
  }

  return selectedRules;
}

/**
 * Get rule selection result with reasoning
 */
export function getRuleSelection(
  stackReport: StackReport,
  availableRules: string[]
): RuleSelectionResult {
  const coreRules: string[] = [];
  const conditionalRules: string[] = [];
  const skippedRules: string[] = [];

  for (const rule of availableRules) {
    if (STANDARD_CORE_FILES.includes(rule)) {
      coreRules.push(rule);
    } else if (STANDARD_CONDITIONAL_FILES.includes(rule)) {
      if (shouldIncludeRule(rule, stackReport)) {
        conditionalRules.push(rule);
      } else {
        skippedRules.push(rule);
      }
    }
  }

  const reasons: string[] = [];
  if (skippedRules.length > 0) {
    reasons.push(`Skipped ${skippedRules.length} rule(s) not matching detected stack`);
  }
  if (conditionalRules.length > 0) {
    reasons.push(`Included ${conditionalRules.length} conditional rule(s) for detected technologies`);
  }

  return {
    coreRules,
    conditionalRules,
    skippedRules,
    reason: reasons.join('; ') || 'All available rules selected'
  };
}

