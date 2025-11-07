import * as fs from 'fs/promises';
import { BasePackageManager } from './base';
import { CleanupRule } from '../../types/cleanup';

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: any;
}

/**
 * Yarn package manager handler
 */
export class YarnManager extends BasePackageManager {
  getPackageFile(): string {
    return 'package.json';
  }

  getLockFile(): string {
    return 'yarn.lock';
  }

  async readPackageFile(filePath: string): Promise<PackageJson> {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  }

  async writePackageFile(filePath: string, content: PackageJson): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(content, null, 2));
  }

  async removeDependencies(
    packageJson: PackageJson,
    rule: CleanupRule
  ): Promise<{ modified: boolean; removedDeps: Array<{ name: string; section?: string }> }> {
    let modified = false;
    const removedDeps: Array<{ name: string; section?: string }> = [];

    // Remove regular dependencies
    if (rule.remove_deps && packageJson.dependencies) {
      rule.remove_deps.forEach((dep) => {
        if (packageJson.dependencies![dep]) {
          delete packageJson.dependencies![dep];
          modified = true;
          removedDeps.push({ name: dep, section: 'dependencies' });
        }
      });
    }

    // Remove dev dependencies
    if (rule.remove_dev_deps && packageJson.devDependencies) {
      rule.remove_dev_deps.forEach((dep) => {
        if (packageJson.devDependencies![dep]) {
          delete packageJson.devDependencies![dep];
          modified = true;
          removedDeps.push({ name: dep, section: 'devDependencies' });
        }
      });
    }

    return { modified, removedDeps };
  }
}

