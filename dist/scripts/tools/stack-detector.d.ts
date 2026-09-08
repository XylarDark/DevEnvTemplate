#!/usr/bin/env node
/**
 * Stack Detector - CI-only utility
 *
 * Analyzes a repository to detect technology stack and configuration.
 * Used by .devenv to understand the current project setup.
 */
import type { StackReport } from '../types/gaps';
type DetectorMode = 'fast' | 'full';
interface StackDetectorOptions {
    rootDir?: string;
    quiet?: boolean;
    mode?: DetectorMode;
    debug?: boolean;
}
declare class StackDetector {
    private rootDir;
    private quiet;
    private projectManifest;
    private pyprojectContent;
    private requirementsContent;
    private packageJsonDeps;
    private stack;
    private mode;
    private fileCache;
    private ignoredDirectories;
    private workflowScanLimit;
    private debugMode;
    constructor(options?: StackDetectorOptions);
    private shouldSkipDirectory;
    private logDebug;
    private readFileCached;
    private readJsonFile;
    detect(): Promise<StackReport>;
    /**
     * Detect Unreal Engine project marker (*.uproject at repo root) and populate stack hints.
     */
    private detectUnrealProject;
    /**
     * Detect Unity project via ProjectSettings/ProjectVersion.txt at repo root or one directory down (e.g. game/).
     */
    private detectUnityProject;
    loadProjectManifest(): Promise<void>;
    detectPackageJson(): Promise<void>;
    detectTypeScript(): Promise<void>;
    detectPython(): Promise<void>;
    detectGo(): Promise<void>;
    detectJava(): Promise<void>;
    detectDotNet(): Promise<void>;
    findFiles(pattern: string): Promise<string[]>;
    parseTOML(content: string): Record<string, any>;
    detectFrameworks(): Promise<void>;
    detectScripts(): Promise<void>;
    detectExpress(): Promise<void>;
    detectPrisma(): Promise<void>;
    detectTailwind(): Promise<void>;
    /**
     * Locate a tool's config file, trying every extension it might carry.
     *
     * `vitest.config.mts` is common in ESM projects and `jest.config.mjs` in others, so a fixed
     * `.ts`/`.js` pair silently misses real configurations.
     *
     * @param base Config filename without extension, e.g. `vitest.config`.
     * @returns The filename that exists, or null.
     */
    private findConfigFile;
    /**
     * Report whether a directory tree contains a test file.
     *
     * Depth-limited and skips ignored directories, so this stays cheap on large trees. It stops at
     * the first match, since the caller only needs to know whether any exist.
     *
     * @param dir Directory to search.
     * @param depth Remaining levels to descend.
     * @returns True if a `*.test.*` or `*.spec.*` file is found.
     */
    private containsTestFile;
    detectTesting(): Promise<void>;
    detectLinting(): Promise<void>;
    detectFormatting(): Promise<void>;
    detectCI(): Promise<void>;
    detectSecurity(): Promise<void>;
    detectSecretsHygiene(): Promise<void>;
    collectWorkflowFiles(): Promise<string[]>;
    collectYamlFiles(directory: string, results: string[]): Promise<void>;
    fileExists(relativePath: string): Promise<boolean>;
    saveReport(report: StackReport): Promise<void>;
    detectCursorRules(): Promise<void>;
    assignProfiles(): void;
    hasTechnology(name: string): boolean;
    addTechnology(name: string, meta?: Record<string, any>): void;
    applyManifestTechnologies(): void;
    formatTechnologyName(value: string): string;
}
export = StackDetector;
//# sourceMappingURL=stack-detector.d.ts.map