import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';
import { BasePackageManager } from './base';
import { CleanupRule, CleanupAction } from '../../types/cleanup';

/**
 * NuGet package manager handler (.csproj files)
 */
export class NugetManager extends BasePackageManager {
  getPackageFile(): string {
    return '**/*.csproj'; // Glob pattern
  }

  getLockFile(): string | null {
    return null; // NuGet doesn't have a standard lock file in .csproj projects
  }

  /**
   * Override the prune method since NuGet handles multiple files
   */
  async prune(rule: CleanupRule): Promise<{ actions: CleanupAction[] }> {
    const actions: CleanupAction[] = [];

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
        removedDeps.forEach((dep) => {
          actions.push({
            type: 'dependency_remove',
            rule: rule.id,
            manager: this.getManagerName(),
            dependency: dep.name,
            file: path.relative(this.workingDir, csprojFile),
            dryRun: this.dryRun,
          });
        });
      } catch (error: any) {
        throw new Error(`Failed to process ${csprojFile}: ${error.message}`);
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
        // Match PackageReference elements
        const regex = new RegExp(
          `<PackageReference\\s+Include="${dep}"[^>]*>.*?<\\/PackageReference>`,
          'gs'
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

