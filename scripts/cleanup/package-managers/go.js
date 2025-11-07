const fs = require('fs').promises;
const { BasePackageManager } = require('./base');

/**
 * Go modules package manager handler (go.mod)
 */
class GoManager extends BasePackageManager {
  getPackageFile() {
    return 'go.mod';
  }

  getLockFile() {
    return 'go.sum';
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
        // Match require line in go.mod
        const regex = new RegExp(`^\\s*${dep}\\s+.*$`, 'gm');
        if (regex.test(content)) {
          content = content.replace(regex, '');
          modified = true;
          removedDeps.push({ name: dep, section: 'go.mod' });
        }
      });
    }

    return { modified, removedDeps };
  }
}

module.exports = { GoManager };

