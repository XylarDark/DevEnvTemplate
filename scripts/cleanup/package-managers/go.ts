import * as fs from 'fs/promises';
import { BasePackageManager } from './base';
import { CleanupRule } from '../../types/cleanup';

/**
 * Go modules package manager handler (go.mod)
 */
export class GoManager extends BasePackageManager {
  getPackageFile(): string {
    return 'go.mod';
  }

  getLockFile(): string {
    return 'go.sum';
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
        // Match require line in go.mod
        const regex = new RegExp(`^\\s*${dep}\\s+.*$`, 'gm');
        if (regex.test(updatedContent)) {
          updatedContent = updatedContent.replace(regex, '');
          modified = true;
          removedDeps.push({ name: dep, section: 'go.mod' });
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

