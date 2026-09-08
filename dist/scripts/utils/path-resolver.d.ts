/**
 * Path resolver utility for dual-path loading during migration.
 * Supports new paths (config/, packs/) with fallback to old paths (root, presets/).
 * Enhanced with project root detection for embedded usage.
 */
/**
 * Resolve config file path with dual-path support
 * @param configName - Config filename (e.g., 'cleanup.config.yaml')
 * @param workingDir - Working directory (defaults to cwd)
 * @returns Resolved config path
 */
export declare function resolveConfigPath(configName: string, workingDir?: string): string;
/**
 * Resolve pack/preset file path with dual-path support
 * @param packName - Pack filename (e.g., 'node-basic.yaml')
 * @param workingDir - Working directory (defaults to __dirname/../../)
 * @returns Resolved pack path or null if not found
 */
export declare function resolvePackPath(packName: string, workingDir?: string): string | null;
/**
 * Get all available pack names from both locations
 * @param workingDir - Working directory (defaults to __dirname/../../)
 * @returns Array of available pack names
 */
export declare function getAvailablePacks(workingDir?: string): string[];
/**
 * Check if a config file exists in either location
 * @param configName - Config filename
 * @param workingDir - Working directory (defaults to cwd)
 * @returns True if config exists in either location
 */
export declare function configExists(configName: string, workingDir?: string): boolean;
/**
 * Resolve project root by walking up directory tree
 * Detects embedded .devenv usage and finds actual project root
 * @param startDir - Starting directory (defaults to cwd)
 * @returns Project root path or startDir if not found
 */
export declare function resolveProjectRoot(startDir?: string): string;
/**
 * Normalize path for cross-platform compatibility
 * @param filePath - Path to normalize
 * @returns Normalized path
 */
export declare function normalizePath(filePath: string): string;
//# sourceMappingURL=path-resolver.d.ts.map