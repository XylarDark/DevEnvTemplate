import * as fs from 'fs/promises';
import { BasePackageManager } from './base';
import { CleanupRule } from '../../types/cleanup';

/**
 * Pip package manager handler (requirements.txt)
 */
export class PipManager extends BasePackageManager {
  getPackageFile(): string {
    return 'requirements.txt';
  }

  getLockFile(): string | null {
    return null; // Pip doesn't have a standard lock file
  }

  async readPackageFile(filePath: string): Promise<string[]> {
    const content = await fs.readFile(filePath, 'utf8');
    return content.split('\n');
  }

  async writePackageFile(filePath: string, content: string[]): Promise<void> {
    await fs.writeFile(filePath, content.join('\n'));
  }

  async removeDependencies(
    lines: string[],
    rule: CleanupRule
  ): Promise<{ modified: boolean; removedDeps: Array<{ name: string; section?: string }> }> {
    let modified = false;
    const removedDeps: Array<{ name: string; section?: string }> = [];

    if (rule.remove_deps) {
      const filteredLines = lines.filter((line) => {
        const trimmed = line.trim();

        // Keep empty lines and comments
        if (!trimmed || trimmed.startsWith('#')) return true;

        // Check if this line contains any of the packages to remove
        const shouldRemove = rule.remove_deps!.some((dep) => {
          // Handle various pip formats (with version, extras, etc.)
          return (
            trimmed.startsWith(dep) ||
            trimmed.startsWith(dep.replace('-', '_')) ||
            trimmed.includes(dep + '==') ||
            trimmed.includes(dep + '>=') ||
            trimmed.includes(dep + '[')
          );
        });

        if (shouldRemove) {
          modified = true;
          removedDeps.push({ name: trimmed, section: 'requirements.txt' });
          return false;
        }

        return true;
      });

      if (modified) {
        // Update the lines array in place
        lines.length = 0;
        lines.push(...filteredLines);
      }
    }

    return { modified, removedDeps };
  }
}

