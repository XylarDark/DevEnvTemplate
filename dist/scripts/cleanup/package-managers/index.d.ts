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
export declare function getPackageManager(managerName: string, workingDir: string, dryRun: boolean): BasePackageManager;
export { BasePackageManager, NpmManager, YarnManager, PnpmManager, PipManager, PoetryManager };
//# sourceMappingURL=index.d.ts.map