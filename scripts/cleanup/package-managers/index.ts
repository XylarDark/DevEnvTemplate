/**
 * Package Manager Registry
 * Exports all package manager implementations
 * 
 * Focused on Node.js ecosystem (npm, yarn, pnpm) + Python (pip, poetry)
 * for indie developers and solo founders.
 */

import { BasePackageManager } from './base';
import { NpmManager } from './npm';
import { YarnManager } from './yarn';
import { PnpmManager } from './pnpm';
import { PipManager } from './pip';
import { PoetryManager } from './poetry';

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
  };

  const ManagerClass = managers[managerName.toLowerCase()];
  if (!ManagerClass) {
    throw new Error(`Unknown package manager: ${managerName}. Supported: npm, yarn, pnpm, pip, poetry`);
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
};

