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
import type { StackReport } from '../types/gaps';
export interface IntegrationOptions {
    projectRoot: string;
    templateRulesPath: string;
    stackReport: StackReport;
    /** Defaults to `.agents/skills` alongside the template's `.cursor/`. */
    templateSkillsPath?: string;
    /** Defaults to `.agents/skills-extras` alongside the template's `.cursor/`. */
    templateSkillsExtrasPath?: string;
    /** When true, also copy optional skills from `templateSkillsExtrasPath` into the host. */
    includeSkillExtras?: boolean;
    dryRun?: boolean;
}
export interface IntegrationResult {
    /** Files written into the host. */
    copied: string[];
    /** Template files the host already had, left untouched. */
    skipped: string[];
    /** The host's own rules, which the template does not manage. */
    preserved: string[];
    /**
     * Skills copied into the host that contain a section describing *this* repository — its
     * scripts, its docs layout — rather than the portable practice. The host must rewrite those
     * sections, so they are named at the moment of copying rather than left to be discovered.
     */
    needsLocalization: string[];
    recommendations: string[];
}
/**
 * Copy the stack-scoped rules and the skills into a host project.
 */
export declare function integrateCursorRules(options: IntegrationOptions): Promise<IntegrationResult>;
//# sourceMappingURL=cursor-rules-integration.d.ts.map