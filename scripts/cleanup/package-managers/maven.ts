import * as fs from 'fs/promises';
import { BasePackageManager } from './base';
import { CleanupRule } from '../../types/cleanup';

/**
 * Maven package manager handler (pom.xml)
 */
export class MavenManager extends BasePackageManager {
  getPackageFile(): string {
    return 'pom.xml';
  }

  getLockFile(): string | null {
    return null; // Maven doesn't have a lock file
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
        // Match dependency elements (basic implementation)
        const regex = new RegExp(
          `<dependency>\\s*<groupId>[^<]*<\\/groupId>\\s*<artifactId>${dep}<\\/artifactId>.*?<\\/dependency>`,
          'gs'
        );
        if (regex.test(updatedContent)) {
          updatedContent = updatedContent.replace(regex, '');
          modified = true;
          removedDeps.push({ name: dep, section: 'pom.xml' });
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

