#!/usr/bin/env node
/**
 * Gap Analyzer - CI-only utility
 *
 * Analyzes detected stack against development best practices
 * and generates recommendations for improvement.
 *
 * Enhanced with comprehensive checks for documentation, dependencies,
 * performance, accessibility, Docker, environment variables, and git hooks.
 */
import type { GapReport, GapAnalysisOptions } from '../types/gaps';
declare class GapAnalyzer {
    private rootDir;
    private stack;
    private gaps;
    private profiles;
    private languageProfile;
    private mode;
    private debug;
    constructor(options?: GapAnalysisOptions);
    analyze(): Promise<string>;
    private isFastMode;
    private analyzeTypeScript;
    private analyzeLinting;
    private analyzePythonLinting;
    private analyzeTesting;
    private analyzeNodeTesting;
    private analyzePythonTesting;
    private analyzeSecurity;
    private analyzeCI;
    private analyzeBoundaries;
    private analyzeQualityGates;
    private analyzeDocumentation;
    private analyzeDependencies;
    private analyzePerformance;
    private logDebug;
    private runStage;
    private analyzeAccessibility;
    private analyzeDocker;
    private analyzeEnvironment;
    private analyzeGitHooks;
    private analyzeFrameworks;
    private analyzePythonTooling;
    /**
     * Checks the layer AI agents actually read. These gaps are invisible to conventional linters
     * and CI, because nothing here affects whether the code compiles - it affects whether an agent
     * working in the repository is given accurate instructions or misleading ones.
     */
    private analyzeAgentContext;
    /**
     * A present-but-vague instructions file is worse than an absent one: it passes every "is
     * AGENTS.md there?" check while telling the agent nothing it can execute.
     */
    private checkAgentInstructions;
    /**
     * Always-applied rules are billed on every turn whether or not they are relevant, so the
     * budget is measured in lines rather than in file count.
     */
    private checkAlwaysApplyBudget;
    /**
     * Shims exist so each tool finds instructions where it looks. A shim that grew its own content
     * is the documented failure mode: two sources of truth that drift, with no signal about which
     * one is current.
     */
    private checkShimDrift;
    /**
     * An MCP server entry is a command the agent executes with the caller's credentials, and both
     * of Cursor's MCP vulnerabilities landed in this file. A literal secret here is committed to
     * git and handed to a subprocess.
     */
    private checkMcpConfig;
    /**
     * Generated and vendor trees inflate indexing cost without helping agents. A thin ignore file
     * is cheap to maintain; missing entries are a low-severity gap hosts may decline.
     */
    private checkCursorIgnore;
    private readFileOrNull;
    private findEnvSampleFile;
    private fileExists;
    private detectProfilesFromStack;
    private applyManifestProfiles;
    private computeLanguageProfile;
    private syncProfilesWithLanguageProfile;
    private hasProfile;
    private hasTechnology;
    private hasTestingFramework;
    private generateReport;
    /**
     * Build the machine-readable gap report.
     *
     * This is the contract downstream consumers (the doctor, CI) should use. The markdown from
     * `generateReport()` is for humans only: re-parsing it costs the severity of every gap,
     * because markdown groups by category and encodes severity as an emoji in a heading.
     */
    buildGapReport(): GapReport;
    saveReport(report: string): Promise<void>;
    /** Write the structured report that the doctor consumes. */
    saveJsonReport(): Promise<string>;
}
export default GapAnalyzer;
//# sourceMappingURL=gap-analyzer.d.ts.map