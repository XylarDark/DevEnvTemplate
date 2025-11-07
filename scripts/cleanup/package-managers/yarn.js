const fs = require('fs').promises;
const { BasePackageManager } = require('./base');

/**
 * Yarn package manager handler
 */
class YarnManager extends BasePackageManager {
  getPackageFile() {
    return 'package.json';
  }

  getLockFile() {
    return 'yarn.lock';
  }

  async readPackageFile(filePath) {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  }

  async writePackageFile(filePath, content) {
    await fs.writeFile(filePath, JSON.stringify(content, null, 2));
  }

  async removeDependencies(packageJson, rule) {
    let modified = false;
    const removedDeps = [];

    // Remove regular dependencies
    if (rule.remove_deps && packageJson.dependencies) {
      rule.remove_deps.forEach(dep => {
        if (packageJson.dependencies[dep]) {
          delete packageJson.dependencies[dep];
          modified = true;
          removedDeps.push({ name: dep, section: 'dependencies' });
        }
      });
    }

    // Remove dev dependencies
    if (rule.remove_dev_deps && packageJson.devDependencies) {
      rule.remove_dev_deps.forEach(dep => {
        if (packageJson.devDependencies[dep]) {
          delete packageJson.devDependencies[dep];
          modified = true;
          removedDeps.push({ name: dep, section: 'devDependencies' });
        }
      });
    }

    return { modified, removedDeps };
  }
}

module.exports = { YarnManager };

