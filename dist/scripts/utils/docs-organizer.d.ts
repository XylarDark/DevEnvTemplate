/**
 * Documentation Organizer Utility
 *
 * Automatically detects and organizes markdown files into appropriate directories
 * based on configurable rules to prevent documentation clutter in project root.
 */
/**
 * Configuration for documentation organization
 */
export interface DocsOrganizationConfig {
    rootExceptions: string[];
    directoryRules: {
        [key: string]: {
            patterns: string[];
            target: string;
        };
    };
    defaultTarget: string;
}
/**
 * Result of organizing documentation
 */
export interface OrganizeResult {
    success: boolean;
    filesToMove: FileMove[];
    conflicts: Conflict[];
    errors: string[];
    dryRun: boolean;
}
/**
 * Represents a file that should be moved
 */
export interface FileMove {
    source: string;
    target: string;
    targetDir: string;
    reason: string;
}
/**
 * Represents a conflict (target file already exists)
 */
export interface Conflict {
    source: string;
    target: string;
    message: string;
}
/**
 * Validation result
 */
export interface ValidationResult {
    needsOrganization: boolean;
    misplacedFiles: string[];
    totalFiles: number;
}
/**
 * Load documentation organization configuration
 */
export declare function loadDocsConfig(projectRoot: string): Promise<DocsOrganizationConfig>;
/**
 * Check if a filename matches a pattern (supports wildcards)
 * @internal
 */
export declare function matchesPattern(filename: string, pattern: string): boolean;
/**
 * Determine target directory for a markdown file
 */
export declare function determineTargetDirectory(filename: string, config: DocsOrganizationConfig, projectRoot: string): {
    target: string;
    reason: string;
};
/**
 * Detect markdown files in project root that should be moved
 */
export declare function detectMisplacedDocs(projectRoot: string): Promise<string[]>;
/**
 * Organize documentation files
 */
export declare function organizeDocumentation(projectRoot: string, dryRun?: boolean): Promise<OrganizeResult>;
/**
 * Validate if organization is needed
 */
export declare function validateOrganization(projectRoot: string): Promise<ValidationResult>;
//# sourceMappingURL=docs-organizer.d.ts.map