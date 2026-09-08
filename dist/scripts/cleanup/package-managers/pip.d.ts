import { BasePackageManager } from './base';
import { CleanupRule } from '../../types/cleanup';
/**
 * Pip package manager handler (requirements.txt)
 */
export declare class PipManager extends BasePackageManager {
    getPackageFile(): string;
    getLockFile(): string | null;
    readPackageFile(filePath: string): Promise<string[]>;
    writePackageFile(filePath: string, content: string[]): Promise<void>;
    removeDependencies(lines: string[], rule: CleanupRule): Promise<{
        modified: boolean;
        removedDeps: Array<{
            name: string;
            section?: string;
        }>;
    }>;
}
//# sourceMappingURL=pip.d.ts.map