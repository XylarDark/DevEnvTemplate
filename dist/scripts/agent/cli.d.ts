#!/usr/bin/env node
/**
 * Interactive CLI for guiding users through project setup
 * Generates project.manifest.json based on user selections
 */
import { Requirements, ProjectManifest } from '../types/manifest';
export declare class AgentCLI {
    private rl;
    constructor();
    prompt(question: string, options?: string[] | null, defaultValue?: number | string | null): Promise<string>;
    promptYesNo(question: string, defaultValue?: boolean): Promise<boolean>;
    promptMultiSelect(question: string, options: string[], defaultValues?: string[]): Promise<string[]>;
    collectRequirements(): Promise<Requirements>;
    generateManifest(requirements: Requirements): ProjectManifest;
    saveManifest(manifest: ProjectManifest, outputPath?: string): Promise<void>;
    run(): Promise<void>;
}
export default AgentCLI;
//# sourceMappingURL=cli.d.ts.map