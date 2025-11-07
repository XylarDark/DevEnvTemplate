const fs = require('fs').promises;
const { BasePackageManager } = require('./base');

/**
 * Maven package manager handler (pom.xml)
 */
class MavenManager extends BasePackageManager {
  getPackageFile() {
    return 'pom.xml';
  }

  getLockFile() {
    return null; // Maven doesn't have a lock file
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
        // Match dependency elements (basic implementation)
        const regex = new RegExp(
          `<dependency>\\s*<groupId>[^<]*<\\/groupId>\\s*<artifactId>${dep}<\\/artifactId>.*?<\\/dependency>`,
          'gs'
        );
        if (regex.test(content)) {
          content = content.replace(regex, '');
          modified = true;
          removedDeps.push({ name: dep, section: 'pom.xml' });
        }
      });
    }

    return { modified, removedDeps };
  }
}

module.exports = { MavenManager };

