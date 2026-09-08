#!/usr/bin/env node
/**
 * Cursor Rules Adapter
 *
 * Handles intelligent selection and adaptation of cursor rules based on detected technologies.
 */
import type { StackReport, CursorRulesInfo } from '../types/gaps';
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
export declare const STACK_SCOPED_FILES: string[];
/**
 * Always-applied rules this template shipped before the `AGENTS.md`-plus-skills inversion. They
 * are no longer copied to hosts, but they are still recognized: a host that carries them is
 * paying for ~1,200 lines of context on every turn, and should migrate rather than keep them.
 */
export declare const RETIRED_ALWAYS_ON_FILES: string[];
/** Where the retired rules' content now lives, for migration advice. */
export declare const RETIRED_RULE_REPLACEMENTS: Record<string, string>;
/**
 * Detect existing cursor rules in project
 */
export declare function detectExistingRules(projectRoot: string): Promise<CursorRulesInfo>;
/**
 * Determine which rules should be included based on stack report
 */
export declare function shouldIncludeRule(ruleFile: string, stackReport: StackReport): boolean;
/**
 * Adapt rules for detected stack
 */
export declare function adaptRulesForStack(stackReport: StackReport, templateRulesPath: string): Promise<string[]>;
/**
 * Get rule selection result with reasoning
 */
export declare function getRuleSelection(stackReport: StackReport, availableRules: string[]): RuleSelectionResult;
//# sourceMappingURL=cursor-rules-adapter.d.ts.map