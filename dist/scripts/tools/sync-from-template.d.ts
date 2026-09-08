#!/usr/bin/env node
/**
 * Layer-aware sync from DevEnvTemplate into a host project.
 *
 * Copies only allowlisted paths for the chosen adoption layer. Dry-run is the default;
 * pass apply=true to write files. Never overwrites the host root AGENTS.md, never copies
 * MCP configs, and never copies retired always-applied Cursor rules.
 */
import type { StackReport } from '../types/gaps';
export declare const SYNC_LAYER_NAMES: readonly ["agent-context", "operational-memory", "doctor"];
export type SyncLayerName = (typeof SYNC_LAYER_NAMES)[number];
export interface SyncLayerPathSpec {
    src: string;
    kind: 'file' | 'directory' | 'skills' | 'cursor-rules';
    overwrite?: boolean;
}
export interface SyncLayerSpec {
    description: string;
    requiresDevenv?: boolean;
    preserveInDevenv?: string[];
    paths: SyncLayerPathSpec[];
    optionalSkillGroups?: Record<string, string>;
}
export interface SyncLayersConfig {
    globalNeverCopy: string[];
    layers: Record<SyncLayerName, SyncLayerSpec>;
}
export interface SyncAction {
    layer: SyncLayerName;
    relativePath: string;
    action: 'copy' | 'skip' | 'update';
    reason: string;
}
export interface SyncOptions {
    projectRoot: string;
    templateRoot: string;
    layers: SyncLayerName[];
    dryRun?: boolean;
    stackReport?: StackReport;
    configPath?: string;
}
export interface SyncResult {
    layer: SyncLayerName[];
    dryRun: boolean;
    actions: SyncAction[];
    copied: string[];
    skipped: string[];
    warnings: string[];
    recommendations: string[];
}
export declare function planLayerSync(options: SyncOptions): Promise<SyncResult>;
export declare function syncFromTemplate(options: SyncOptions): Promise<SyncResult>;
export interface DevenvMergeOptions {
    templateRoot: string;
    devenvDir: string;
    dryRun?: boolean;
}
export interface DevenvMergeResult {
    dryRun: boolean;
    branch: string;
    preserved: string[];
    message: string;
}
export declare function mergeDevenvFromTemplate(options: DevenvMergeOptions): Promise<DevenvMergeResult>;
//# sourceMappingURL=sync-from-template.d.ts.map