const fs = require('fs').promises;
const { BasePackageManager } = require('./base');

/**
 * Poetry package manager handler (pyproject.toml)
 */
class PoetryManager extends BasePackageManager {
  getPackageFile() {
    return 'pyproject.toml';
  }

  getLockFile() {
    return 'poetry.lock';
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
        // Match dependency line in TOML format
        const regex = new RegExp(`^${dep}\\s*=.*$`, 'gm');
        if (regex.test(content)) {
          content = content.replace(regex, '');
          modified = true;
          removedDeps.push({ name: dep, section: 'pyproject.toml' });
        }
      });
    }

    return { modified, removedDeps };
  }
}

module.exports = { PoetryManager };

