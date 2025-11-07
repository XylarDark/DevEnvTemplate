/**
 * Package Manager Registry
 * Exports all package manager implementations
 */

import { BasePackageManager } from './base';
import { NpmManager } from './npm';
import { YarnManager } from './yarn';
import { PnpmManager } from './pnpm';
import { PipManager } from './pip';
import { PoetryManager } from './poetry';
import { GoManager } from './go';
import { NugetManager } from './nuget';
import { MavenManager } from './maven';
import { GradleManager } from './gradle';

/**
 * Get package manager instance by name
 */
export function getPackageManager(
  managerName: string,
  workingDir: string,
  dryRun: boolean
): BasePackageManager {
  const managers: Record<string, new (workingDir: string, dryRun: boolean) => BasePackageManager> = {
    npm: NpmManager,
    yarn: YarnManager,
    pnpm: PnpmManager,
    pip: PipManager,
    poetry: PoetryManager,
    go: GoManager,
    nuget: NugetManager,
    maven: MavenManager,
    gradle: GradleManager,
  };

  const ManagerClass = managers[managerName.toLowerCase()];
  if (!ManagerClass) {
    throw new Error(`Unknown package manager: ${managerName}`);
  }

  return new ManagerClass(workingDir, dryRun);
}

export {
  BasePackageManager,
  NpmManager,
  YarnManager,
  PnpmManager,
  PipManager,
  PoetryManager,
  GoManager,
  NugetManager,
  MavenManager,
  GradleManager,
};

