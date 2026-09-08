import { CleanupRule, CleanupAction } from '../../types/cleanup';
/**
 * Base class for all package managers
 * Provides shared logic for dependency pruning and lock file management
 */
export declare abstract class BasePackageManager {
    protected workingDir: string;
    protected dryRun: boolean;
    constructor(workingDir: string, dryRun: boolean);
    /**
     * Get the name of the package file (must be implemented by subclasses)
     */
    abstract getPackageFile(): string;
    /**
     * Get the name of the lock file (must be implemented by subclasses)
     */
    abstract getLockFile(): string | null;
    /**
     * Read the package file (must be implemented by subclasses)
     */
    abstract readPackageFile(filePath: string): Promise<any>;
    /**
     * Write the package file (must be implemented by subclasses)
     */
    abstract writePackageFile(filePath: string, content: any): Promise<void>;
    /**
     * Remove dependencies from package file (must be implemented by subclasses)
     */
    abstract removeDependencies(content: any, rule: CleanupRule): Promise<{
        modified: boolean;
        removedDeps: Array<{
            name: string;
            section?: string;
        }>;
    }>;
    /**
     * Get the manager name (defaults to class name without 'Manager' suffix)
     */
    getManagerName(): string;
    /**
     * Main pruning logic - shared across all package managers
     */
    prune(rule: CleanupRule): Promise<{
        actions: CleanupAction[];
    }>;
    /**
     * Remove lock file if it exists
     */
    removeLockFile(): Promise<void>;
}
//# sourceMappingURL=base.d.ts.map