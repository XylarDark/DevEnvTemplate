import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';
import { BasePackageManager } from './base';
import { CleanupRule, CleanupAction } from '../../types/cleanup';

/**
 * Gradle package manager handler (build.gradle)
 */
export class GradleManager extends BasePackageManager {
  getPackageFile(): string {
    return '**/build.gradle'; // Glob pattern
  }

  getLockFile(): string | null {
    return null; // Gradle lock files are optional and vary
  }

  /**
   * Override the prune method since Gradle handles multiple files
   */
  async prune(rule: CleanupRule): Promise<{ actions: CleanupAction[] }> {
    const actions: CleanupAction[] = [];

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
        removedDeps.forEach((dep) => {
          actions.push({
            type: 'dependency_remove',
            rule: rule.id,
            manager: this.getManagerName(),
            dependency: dep.name,
            file: path.relative(this.workingDir, gradleFile),
            dryRun: this.dryRun,
          });
        });
      } catch (error: any) {
        throw new Error(`Failed to process ${gradleFile}: ${error.message}`);
      }
    }

    return { actions };
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
        // Match implementation, compile, or other dependency declarations
        const regex = new RegExp(
          `^(?:implementation|compile|api|testImplementation)\\s+['"]${dep}:.*['"]\\s*$`,
          'gm'
        );
        if (regex.test(updatedContent)) {
          updatedContent = updatedContent.replace(regex, '');
          modified = true;
          removedDeps.push({ name: dep });
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

