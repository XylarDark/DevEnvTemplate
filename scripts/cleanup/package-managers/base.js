const fs = require('fs').promises;
const path = require('path');

/**
 * Base class for all package managers
 * Provides shared logic for dependency pruning and lock file management
 */
class BasePackageManager {
  constructor(workingDir, dryRun) {
    this.workingDir = workingDir;
    this.dryRun = dryRun;
  }

  /**
   * Get the name of the package file (must be implemented by subclasses)
   * @returns {string} Package file name
   */
  getPackageFile() {
    throw new Error('getPackageFile must be implemented by subclass');
  }

  /**
   * Get the name of the lock file (must be implemented by subclasses)
   * @returns {string|null} Lock file name or null if no lock file
   */
  getLockFile() {
    throw new Error('getLockFile must be implemented by subclass');
  }

  /**
   * Read the package file (must be implemented by subclasses)
   * @param {string} filePath Path to package file
   * @returns {Promise<any>} Parsed package file content
   */
  async readPackageFile(filePath) {
    throw new Error('readPackageFile must be implemented by subclass');
  }

  /**
   * Write the package file (must be implemented by subclasses)
   * @param {string} filePath Path to package file
   * @param {any} content Content to write
   */
  async writePackageFile(filePath, content) {
    throw new Error('writePackageFile must be implemented by subclass');
  }

  /**
   * Remove dependencies from package file (must be implemented by subclasses)
   * @param {any} content Package file content
   * @param {object} rule Cleanup rule
   * @returns {Promise<{modified: boolean, removedDeps: string[]}>}
   */
  async removeDependencies(content, rule) {
    throw new Error('removeDependencies must be implemented by subclass');
  }

  /**
   * Get the manager name (defaults to class name without 'Manager' suffix)
   * @returns {string} Manager name
   */
  getManagerName() {
    return this.constructor.name.replace('Manager', '').toLowerCase();
  }

  /**
   * Main pruning logic - shared across all package managers
   * @param {object} rule Cleanup rule
   * @returns {Promise<{actions: Array}>} Actions taken
   */
  async prune(rule) {
    const actions = [];
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
      removedDeps.forEach(dep => {
        actions.push({
          type: 'dependency_remove',
          rule: rule.id,
          manager: this.getManagerName(),
          dependency: dep.name || dep,
          section: dep.section || undefined,
          dryRun: this.dryRun,
        });
      });
    } catch (error) {
      throw new Error(`Failed to prune ${this.getManagerName()}: ${error.message}`);
    }

    return { actions };
  }

  /**
   * Remove lock file if it exists
   */
  async removeLockFile() {
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

module.exports = { BasePackageManager };

