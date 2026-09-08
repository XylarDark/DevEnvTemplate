/**
 * Layer-by-layer adoption for host projects.
 *
 * Layers are independent — each can be taken without the others, matching README.md#adopt-it-in-layers.
 */
import type { StackReport } from '../types/gaps';
export type AdoptionLayer = 'agent-context' | 'operational-memory' | 'doctor';
export declare const ALL_LAYERS: AdoptionLayer[];
export interface LayerAdoptionOptions {
    projectRoot: string;
    templateRoot: string;
    layers: AdoptionLayer[];
    stackReport: StackReport;
    declinedLayers?: AdoptionLayer[];
    dryRun?: boolean;
}
export interface LayerAdoptionResult {
    layer: AdoptionLayer;
    copied: string[];
    skipped: string[];
    recommendations: string[];
}
export interface AdoptionSummary {
    results: LayerAdoptionResult[];
    agentsMd?: {
        written: boolean;
        path: string;
        skippedReason?: string;
    };
}
export declare function adoptLayers(options: LayerAdoptionOptions): Promise<AdoptionSummary>;
export declare function parseLayerList(raw: string | undefined): AdoptionLayer[] | null;
//# sourceMappingURL=layers.d.ts.map