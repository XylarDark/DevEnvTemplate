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
  stackRules: string[];
  skippedRules: string[];
  retiredRules: string[];
  reason: string;
}

/**
 * The rules this template ships. Every one is glob-scoped, so it costs nothing until the agent
 * opens a matching file. Anything that must be true on every turn belongs in `AGENTS.md`, and
 * anything procedural belongs in `.agents/skills/`.
 */
export const STACK_SCOPED_FILES = [
  '10-typescript.mdc',
  '11-javascript.mdc',
  '12-python.mdc',
  '13-markdown.mdc',
  '14-json-yaml.mdc',
  '15-shell-scripts.mdc',
  '20-frontend-frameworks.mdc',
  '21-unreal-engine.mdc',
  '22-unreal-editor-ui.mdc',
  '23-unity-csharp.mdc',
];

/**
 * Always-applied rules this template shipped before the `AGENTS.md`-plus-skills inversion. They
 * are no longer copied to hosts, but they are still recognized: a host that carries them is
 * paying for ~1,200 lines of context on every turn, and should migrate rather than keep them.
 */
export const RETIRED_ALWAYS_ON_FILES = [
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
  'automation-standards.mdc',
];

/** Where the retired rules' content now lives, for migration advice. */
export const RETIRED_RULE_REPLACEMENTS: Record<string, string> = {
  '00-core-principles.mdc': 'AGENTS.md (working agreements)',
  '01-code-quality.mdc': '.agents/skills/code-structure',
  '02-security.mdc': '.agents/skills/secure-coding',
  '03-testing.mdc': '.agents/skills/testing-standards',
  '04-git-workflow.mdc': 'AGENTS.md (conventions)',
  '05-error-handling.mdc': '.agents/skills/defensive-programming',
  '06-documentation.mdc': '.agents/skills/documentation',
  '07-ai-agent-behavior.mdc': '.agents/skills/agent-workflow',
  '08-project-context.mdc': 'AGENTS.md (written per host)',
  '16-feature-debug-instrumentation.mdc': '.agents/skills/debug-instrumentation',
  '17-plan-first.mdc': '.agents/skills/plan-first',
  '18-content-and-data-pipelines.mdc': '.agents/skills/data-pipeline-safety',
  '19-docs-directory-structure.mdc': '.agents/skills/documentation',
  'automation-standards.mdc': '.agents/skills/automation-standards',
};

/**
 * Detect existing cursor rules in project
 */
export async function detectExistingRules(projectRoot: string): Promise<CursorRulesInfo> {
  const rulesDir = path.join(projectRoot, '.cursor', 'rules');

  const result: CursorRulesInfo = {
    present: false,
    existingFiles: [],
    stackFiles: [],
    projectSpecificFiles: [],
    retiredAlwaysOnFiles: [],
    needsIntegration: false,
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

    for (const file of mdcFiles) {
      if (STACK_SCOPED_FILES.includes(file)) {
        result.stackFiles.push(file);
      } else if (RETIRED_ALWAYS_ON_FILES.includes(file)) {
        result.retiredAlwaysOnFiles.push(file);
      } else {
        result.projectSpecificFiles.push(file);
      }
    }

    // Integration has something to offer when no stack rule is present yet, or when retired
    // always-on rules are still costing the host context on every turn.
    result.needsIntegration =
      result.stackFiles.length === 0 || result.retiredAlwaysOnFiles.length > 0;
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
  const hasTypeScript =
    stackReport.quality.typescript || techNames.some(n => n.includes('typescript'));
  const hasJavaScript = techNames.some(
    n => n.includes('javascript') || n.includes('node.js') || n.includes('node')
  );
  const hasPython = techNames.some(
    n =>
      n.includes('python') ||
      n.includes('pytest') ||
      n.includes('fastapi') ||
      n.includes('django') ||
      n.includes('flask')
  );
  const hasFrontend =
    techNames.some(
      n =>
        n.includes('react') ||
        n.includes('next.js') ||
        n.includes('nextjs') ||
        n.includes('vue') ||
        n.includes('svelte')
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
      return (
        stackReport.files.key_patterns.some(
          p => p.includes('.sh') || p.includes('.ps1') || p.includes('.bat')
        ) || true
      ); // Include by default as many projects have scripts
    case '20-frontend-frameworks.mdc':
      return hasFrontend;
    case '21-unreal-engine.mdc':
    case '22-unreal-editor-ui.mdc':
      return stackReport.unrealProjectDetected === true;
    case '23-unity-csharp.mdc':
      return stackReport.unityProjectDetected === true;
    default:
      // Only the glob-scoped set is copied. Retired always-on rules and the host's own rules
      // both land here and are deliberately left alone.
      return false;
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

    for (const stackFile of STACK_SCOPED_FILES) {
      if (availableRules.includes(stackFile) && shouldIncludeRule(stackFile, stackReport)) {
        selectedRules.push(stackFile);
      }
    }

    logger.debug('Adapted rules for stack', {
      totalAvailable: availableRules.length,
      selected: selectedRules.length,
      stack: stackReport.languageProfile,
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
  const stackRules: string[] = [];
  const skippedRules: string[] = [];
  const retiredRules: string[] = [];

  for (const rule of availableRules) {
    if (STACK_SCOPED_FILES.includes(rule)) {
      if (shouldIncludeRule(rule, stackReport)) {
        stackRules.push(rule);
      } else {
        skippedRules.push(rule);
      }
    } else if (RETIRED_ALWAYS_ON_FILES.includes(rule)) {
      retiredRules.push(rule);
    }
  }

  const reasons: string[] = [];
  if (stackRules.length > 0) {
    reasons.push(`Included ${stackRules.length} rule(s) for detected technologies`);
  }
  if (skippedRules.length > 0) {
    reasons.push(`Skipped ${skippedRules.length} rule(s) not matching detected stack`);
  }
  if (retiredRules.length > 0) {
    reasons.push(
      `Found ${retiredRules.length} retired always-on rule(s); migrate to AGENTS.md and .agents/skills/`
    );
  }

  return {
    stackRules,
    skippedRules,
    retiredRules,
    reason: reasons.join('; ') || 'No template rules available',
  };
}
