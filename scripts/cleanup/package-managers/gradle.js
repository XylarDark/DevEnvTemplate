const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');
const { BasePackageManager } = require('./base');

/**
 * Gradle package manager handler (build.gradle)
 */
class GradleManager extends BasePackageManager {
  getPackageFile() {
    return '**/build.gradle'; // Glob pattern
  }

  getLockFile() {
    return null; // Gradle lock files are optional and vary
  }

  /**
   * Override the prune method since Gradle handles multiple files
   */
  async prune(rule) {
    const actions = [];

    // Find all build.gradle files
    const gradleFiles = await glob('**/build.gradle', {
      cwd: this.workingDir,
      absolute: true,
    });

    for (const gradleFile of gradleFiles) {
      try {
        const content = await this.readPackageFile(gradleFile);
        const { modified, removedDeps } = await this.removeDependencies(content, rule);

        if (modified && !this.dryRun) {
          await this.writePackageFile(gradleFile, content);
        }

        // Record actions with file path
        removedDeps.forEach(dep => {
          actions.push({
            type: 'dependency_remove',
            rule: rule.id,
            manager: this.getManagerName(),
            dependency: dep.name || dep,
            file: path.relative(this.workingDir, gradleFile),
            dryRun: this.dryRun,
          });
        });
      } catch (error) {
        throw new Error(`Failed to process ${gradleFile}: ${error.message}`);
      }
    }

    return { actions };
  }

  async readPackageFile(filePath) {
    const content = await fs.readFile(filePath, 'utf8');
    return content;
  }

  async writePackageFile(filePath, content) {
    await fs.writeFile(filePath, content);
  }

  async removeDependencies(content, rule) {
    let modified = false;
    const removedDeps = [];

    if (rule.remove_deps) {
      rule.remove_deps.forEach(dep => {
        // Match implementation, compile, or other dependency declarations
        const regex = new RegExp(
          `^(?:implementation|compile|api|testImplementation)\\s+['"]${dep}:.*['"]\\s*$`,
          'gm'
        );
        if (regex.test(content)) {
          content = content.replace(regex, '');
          modified = true;
          removedDeps.push({ name: dep });
        }
      });
    }

    return { modified, removedDeps };
  }
}

module.exports = { GradleManager };

