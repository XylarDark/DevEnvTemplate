/**
 * Quick Wins Registry
 *
 * Maps detected gaps to actionable fixes that can be completed in < 10 minutes.
 * Used by doctor mode to suggest and auto-apply improvements.
 */
export interface QuickWin {
    id: string;
    title: string;
    description: string;
    estimatedTime: string;
    autoFixable: boolean;
    category: 'testing' | 'ci' | 'type-safety' | 'env-hygiene' | 'lint-format';
    frameworks?: ('nextjs' | 'vite' | 'express' | 'vanilla')[];
    detectCondition: (context: QuickWinContext) => boolean | Promise<boolean>;
    fixAction?: (context: QuickWinContext) => Promise<QuickWinResult>;
}
export interface QuickWinContext {
    rootDir: string;
    stack: any;
    packageJson?: any;
    hasFile: (path: string) => Promise<boolean>;
    readFile: (path: string) => Promise<string>;
    writeFile: (path: string, content: string) => Promise<void>;
    updateJson: (path: string, updater: (obj: any) => any) => Promise<void>;
}
export interface QuickWinResult {
    success: boolean;
    message: string;
    filesCreated?: string[];
    filesModified?: string[];
    error?: string;
}
/**
 * Registry of all quick wins
 */
export declare const QUICK_WINS: QuickWin[];
/**
 * Filter quick wins by framework and current state
 */
export declare function getApplicableQuickWins(context: QuickWinContext): Promise<QuickWin[]>;
//# sourceMappingURL=quick-wins.d.ts.map