import * as fs from 'fs/promises';
import * as path from 'path';
import { CleanupRule, CleanupAction } from '../../types/cleanup';

/**
 * Base class for all package managers
 * Provides shared logic for dependency pruning and lock file management
 */
export abstract class BasePackageManager {
  protected workingDir: string;
  protected dryRun: boolean;

  constructor(workingDir: string, dryRun: boolean) {
    this.workingDir = workingDir;
    this.dryRun = dryRun;
  }

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
  abstract removeDependencies(
    content: any,
    rule: CleanupRule
  ): Promise<{ modified: boolean; removedDeps: Array<{ name: string; section?: string }> }>;

  /**
   * Get the manager name (defaults to class name without 'Manager' suffix)
   */
  getManagerName(): string {
    return this.constructor.name.replace('Manager', '').toLowerCase();
  }

  /**
   * Main pruning logic - shared across all package managers
   */
  async prune(rule: CleanupRule): Promise<{ actions: CleanupAction[] }> {
    const actions: CleanupAction[] = [];
    const packageFilePath = path.join(this.workingDir, this.getPackageFile());

    try {
      // Read package file
      const content = await this.readPackageFile(packageFilePath);

      // Remove dependencies
      const { modified, removedDeps } = await this.removeDependencies(content, rule);

      // Write back if modified
      if (modified && !this.dryRun) {
        await this.writePackageFile(packageFilePath, content);
        await this.removeLockFile();
      }

      // Record actions
      removedDeps.forEach((dep) => {
        actions.push({
          type: 'dependency_remove',
          rule: rule.id,
          manager: this.getManagerName(),
          dependency: dep.name,
          section: dep.section,
          dryRun: this.dryRun,
        });
      });
    } catch (error: any) {
      throw new Error(`Failed to prune ${this.getManagerName()}: ${error.message}`);
    }

    return { actions };
  }

  /**
   * Remove lock file if it exists
   */
  async removeLockFile(): Promise<void> {
    const lockFile = this.getLockFile();
    if (!lockFile) return;

    const lockPath = path.join(this.workingDir, lockFile);
    try {
      await fs.access(lockPath);
      await fs.unlink(lockPath);
    } catch {
      // Lock file doesn't exist, ignore
    }
  }
}

