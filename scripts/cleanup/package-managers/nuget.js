const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');
const { BasePackageManager } = require('./base');

/**
 * NuGet package manager handler (.csproj files)
 */
class NugetManager extends BasePackageManager {
  getPackageFile() {
    return '**/*.csproj'; // Glob pattern
  }

  getLockFile() {
    return null; // NuGet doesn't have a standard lock file in .csproj projects
  }

  /**
   * Override the prune method since NuGet handles multiple files
   */
  async prune(rule) {
    const actions = [];

    // Find all .csproj files
    const csprojFiles = await glob('**/*.csproj', {
      cwd: this.workingDir,
      absolute: true,
    });

    for (const csprojFile of csprojFiles) {
      try {
        const content = await this.readPackageFile(csprojFile);
        const { modified, removedDeps } = await this.removeDependencies(content, rule);

        if (modified && !this.dryRun) {
          await this.writePackageFile(csprojFile, content);
        }

        // Record actions with file path
        removedDeps.forEach(dep => {
          actions.push({
            type: 'dependency_remove',
            rule: rule.id,
            manager: this.getManagerName(),
            dependency: dep.name || dep,
            file: path.relative(this.workingDir, csprojFile),
            dryRun: this.dryRun,
          });
        });
      } catch (error) {
        throw new Error(`Failed to process ${csprojFile}: ${error.message}`);
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
        // Match PackageReference elements
        const regex = new RegExp(
          `<PackageReference\\s+Include="${dep}"[^>]*>.*?<\\/PackageReference>`,
          'gs'
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

module.exports = { NugetManager };

