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
export declare class YarnManager extends BasePackageManager {
    getPackageFile(): string;
    getLockFile(): string;
    readPackageFile(filePath: string): Promise<PackageJson>;
    writePackageFile(filePath: string, content: PackageJson): Promise<void>;
    removeDependencies(packageJson: PackageJson, rule: CleanupRule): Promise<{
        modified: boolean;
        removedDeps: Array<{
            name: string;
            section?: string;
        }>;
    }>;
}
export {};
//# sourceMappingURL=yarn.d.ts.map