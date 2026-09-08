/**
 * Generate a host-specific AGENTS.md stub from detected stack facts.
 *
 * Deliberately does not copy the template's own AGENTS.md — that file describes DevEnvTemplate,
 * not the host project.
 */
import type { StackReport } from '../types/gaps';
export interface AgentsStubOptions {
    projectRoot: string;
    stackReport: StackReport;
    /** Layers the host chose not to adopt — recorded so agents do not re-litigate them. */
    declinedLayers?: string[];
    /** Optional one-line absences the host has already decided (e.g. "no linter"). */
    acceptedAbsences?: string[];
}
export interface AgentsStubResult {
    written: boolean;
    path: string;
    skippedReason?: string;
}
/**
 * Build the AGENTS.md body without writing it.
 */
export declare function buildAgentsStub(options: AgentsStubOptions): string;
/**
 * Write AGENTS.md when the host does not already have one.
 */
export declare function writeAgentsStub(options: AgentsStubOptions): Promise<AgentsStubResult>;
/**
 * Returns true when content looks like the template's own AGENTS.md rather than a host stub.
 */
export declare function looksLikeTemplateAgents(content: string): boolean;
//# sourceMappingURL=agents-stub.d.ts.map