#!/usr/bin/env node
/**
 * Unified agent init — layer picker plus host AGENTS.md stub by default.
 *
 * Default: detect stack, choose layers, scaffold selected files, write AGENTS.md stub.
 * --advanced: run the legacy questionnaire that writes project.manifest.json.
 */
import { type AdoptionLayer } from './layers';
export interface InitOptions {
    projectRoot?: string;
    templateRoot?: string;
    layers?: AdoptionLayer[];
    defaults?: boolean;
    dryRun?: boolean;
    advanced?: boolean;
}
export declare function runInit(options?: InitOptions): Promise<void>;
declare const _default: {
    runInit: typeof runInit;
};
export default _default;
//# sourceMappingURL=init.d.ts.map