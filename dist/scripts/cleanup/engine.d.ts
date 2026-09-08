#!/usr/bin/env node
/**
 * Template Cleanup Engine
 *
 * Stack-agnostic engine for removing template-only code after scaffolding.
 * Processes declarative rules from YAML config to clean files, blocks, lines, and dependencies.
 */
import { CleanupRule, CleanupReport, CleanupConfig } from '../types/cleanup';
interface CleanupEngineOptions {
    profile?: string;
    features?: string[];
    configPath?: string;
    workingDir?: string;
    dryRun?: boolean;
    failOnActions?: boolean;
    onlyRules?: string[];
    excludeRules?: string[];
    excludeGlobs?: string[];
    keepFiles?: string[];
    report?: string;
    performance?: boolean;
    cache?: boolean;
    parallel?: boolean;
    concurrency?: number;
    progress?: boolean;
    progressVerbosity?: 'silent' | 'simple' | 'detailed';
    jsonProgress?: boolean;
}
/**
 * Main cleanup engine class
 */
export declare class CleanupEngine {
    private config;
    private profile;
    private features;
    private configPath;
    private workingDir;
    private dryRun;
    private failOnActions;
    private onlyRules;
    private excludeRules;
    private excludeGlobs;
    private keepFiles;
    private excludeGlobCache;
    private report;
    private performanceEnabled;
    private performanceTracker;
    private cacheEnabled;
    private fileCache;
    private configCache;
    private parallelEnabled;
    private concurrency;
    private progressEnabled;
    private progressTracker;
    constructor(options?: CleanupEngineOptions);
    /**
     * Load and validate configuration
     */
    loadConfig(): Promise<CleanupConfig>;
    /**
     * Get resolved rules for current profile, handling extends and conditionals
     */
    getRules(): CleanupRule[];
    /**
     * Execute all rules
     */
    execute(): Promise<CleanupReport>;
    /**
     * Check if a rule should be executed based on only/exclude filters
     */
    private shouldExecuteRule;
    /**
     * Check if a file should be processed (not excluded by globs or keep list)
     */
    private shouldProcessFile;
    /**
     * Normalize path for cross-platform compatibility
     */
    private normalizePath;
    /**
     * Execute a single rule
     */
    private executeRule;
    /**
     * Get handler function for rule type
     */
    private getRuleHandler;
    /**
     * Get comment syntax for file extension
     */
    private getCommentSyntax;
    /**
     * Detect if line contains a marker
     */
    private detectMarker;
    /**
     * Parse file content for template markers
     */
    private parseFileContent;
    /**
     * Handle file glob delete rule
     */
    private handleFileGlobDelete;
    /**
     * Handle block markers rule
     */
    private handleBlockMarkers;
    /**
     * Handle line tag rule
     */
    private handleLineTag;
    /**
     * Handle conditional block rule
     */
    private handleConditionalBlock;
    /**
     * Evaluate conditional expression
     */
    private evaluateCondition;
    /**
     * Handle prune empty rule
     */
    private handlePruneEmpty;
    /**
     * Handle package prune rule
     */
    private handlePackagePrune;
    /**
     * Handle custom rule
     */
    private handleCustomRule;
    /**
     * Calculate summary statistics
     */
    private calculateSummary;
    /**
     * Export report to JSON file
     */
    exportReport(outputPath: string): Promise<string>;
}
interface ExecuteCleanupResult {
    report: CleanupReport;
    exitCode: number;
}
/**
 * Execute cleanup with given options
 */
export declare function executeCleanup(options?: CleanupEngineOptions): Promise<ExecuteCleanupResult>;
export {};
//# sourceMappingURL=engine.d.ts.map