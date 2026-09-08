import { BasePackageManager } from './base';
import { CleanupRule } from '../../types/cleanup';
/**
 * Poetry package manager handler (pyproject.toml)
 */
export declare class PoetryManager extends BasePackageManager {
    getPackageFile(): string;
    getLockFile(): string;
    readPackageFile(filePath: string): Promise<string>;
    writePackageFile(filePath: string, content: string): Promise<void>;
    removeDependencies(content: string, rule: CleanupRule): Promise<{
        modified: boolean;
        removedDeps: Array<{
            name: string;
            section?: string;
        }>;
    }>;
}
//# sourceMappingURL=poetry.d.ts.map