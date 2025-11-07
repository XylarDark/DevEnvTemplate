import * as fs from 'fs/promises';
import { BasePackageManager } from './base';
import { CleanupRule } from '../../types/cleanup';

/**
 * Poetry package manager handler (pyproject.toml)
 */
export class PoetryManager extends BasePackageManager {
  getPackageFile(): string {
    return 'pyproject.toml';
  }

  getLockFile(): string {
    return 'poetry.lock';
  }

  async readPackageFile(filePath: string): Promise<string> {
    const content = await fs.readFile(filePath, 'utf8');
    return content;
  }

  async writePackageFile(filePath: string, content: string): Promise<void> {
    await fs.writeFile(filePath, content);
  }

  async removeDependencies(
    content: string,
    rule: CleanupRule
  ): Promise<{ modified: boolean; removedDeps: Array<{ name: string; section?: string }> }> {
    let modified = false;
    const removedDeps: Array<{ name: string; section?: string }> = [];
    let updatedContent = content;

    if (rule.remove_deps) {
      rule.remove_deps.forEach((dep) => {
        // Match dependency line in TOML format
        const regex = new RegExp(`^${dep}\\s*=.*$`, 'gm');
        if (regex.test(updatedContent)) {
          updatedContent = updatedContent.replace(regex, '');
          modified = true;
          removedDeps.push({ name: dep, section: 'pyproject.toml' });
        }
      });
    }

    // Update by reference if modified
    if (modified) {
      (content as any) = updatedContent;
    }

    return { modified, removedDeps };
  }
}

